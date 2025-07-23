import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';

const ThoughtLeadership = () => {
    const { token } = useAuth();
    const [hasSettings, setHasSettings] = useState(false);
    const [settings, setSettings] = useState({
        industry: '',
        targetAudience: '',
        preferredPlatform: 'LinkedIn Post'
    });
    const [ideas, setIdeas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [selectedIdea, setSelectedIdea] = useState(null);

    // Fetch settings and ideas on component mount
    useEffect(() => {
        fetchSettingsAndIdeas();
    }, []);

    const fetchSettingsAndIdeas = async () => {
        try {
            // Fetch settings
            const settingsResponse = await fetch('http://localhost:3001/api/thought-leadership/settings', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const settingsData = await settingsResponse.json();

            if (settingsData.hasSettings) {
                setHasSettings(true);
                setSettings({
                    industry: settingsData.settings.industry,
                    targetAudience: settingsData.settings.targetAudience,
                    preferredPlatform: settingsData.settings.preferredPlatform
                });
            }

            // Fetch ideas
            const ideasResponse = await fetch('http://localhost:3001/api/thought-leadership/ideas', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const ideasData = await ideasResponse.json();
            setIdeas(ideasData.ideas || []);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const response = await fetch('http://localhost:3001/api/thought-leadership/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(settings)
            });

            if (response.ok) {
                setHasSettings(true);
                setShowSettings(false);
                // Trigger content generation after saving settings
                await handleGenerateContent();
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to save settings');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleGenerateContent = async () => {
        setGenerating(true);

        try {
            const response = await fetch('http://localhost:3001/api/thought-leadership/generate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                // Wait a bit for generation to complete
                setTimeout(() => {
                    fetchSettingsAndIdeas();
                    setGenerating(false);
                }, 3000);
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to generate content');
                setGenerating(false);
            }
        } catch (error) {
            console.error('Error generating content:', error);
            alert('Failed to generate content');
            setGenerating(false);
        }
    };

    const handleMarkAsRead = async (ideaId) => {
        try {
            await fetch(`http://localhost:3001/api/thought-leadership/ideas/${ideaId}/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setIdeas(ideas.map(idea => 
                idea.id === ideaId ? { ...idea, isRead: true } : idea
            ));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAsUsed = async (ideaId) => {
        try {
            await fetch(`http://localhost:3001/api/thought-leadership/ideas/${ideaId}/used`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setIdeas(ideas.map(idea => 
                idea.id === ideaId ? { ...idea, isUsed: true } : idea
            ));
        } catch (error) {
            console.error('Error marking as used:', error);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Thought Leadership Planner</h2>
                        <p className="text-gray-600 mt-1">
                            Get AI-powered content ideas based on industry trends and news
                        </p>
                    </div>
                    {hasSettings && (
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            {showSettings ? 'Hide Settings' : 'Edit Settings'}
                        </button>
                    )}
                </div>

                {/* Settings Form */}
                {(!hasSettings || showSettings) && (
                    <form onSubmit={handleSaveSettings} className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Industry / Sector
                            </label>
                            <input
                                type="text"
                                value={settings.industry}
                                onChange={(e) => setSettings({ ...settings, industry: e.target.value })}
                                placeholder="e.g., Fintech, SaaS, E-commerce"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Target Audience
                            </label>
                            <input
                                type="text"
                                value={settings.targetAudience}
                                onChange={(e) => setSettings({ ...settings, targetAudience: e.target.value })}
                                placeholder="e.g., Venture Capitalists, Small Business Owners"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Preferred Platform
                            </label>
                            <select
                                value={settings.preferredPlatform}
                                onChange={(e) => setSettings({ ...settings, preferredPlatform: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="LinkedIn Post">LinkedIn Post</option>
                                <option value="Blog Article">Blog Article</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Settings & Generate Ideas'}
                        </button>
                    </form>
                )}

                {/* Generate Button */}
                {hasSettings && !showSettings && (
                    <div className="mb-6">
                        <button
                            onClick={handleGenerateContent}
                            disabled={generating}
                            className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                            {generating ? 'Generating Ideas...' : 'Generate New Ideas'}
                        </button>
                    </div>
                )}

                {/* Content Ideas */}
                {hasSettings && ideas.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Your Content Ideas</h3>
                        {ideas.map((idea) => (
                            <div
                                key={idea.id}
                                className={`p-4 border rounded-lg transition-all cursor-pointer ${
                                    idea.isRead ? 'border-gray-300 bg-gray-50' : 'border-blue-300 bg-blue-50'
                                } ${idea.isUsed ? 'opacity-60' : ''}`}
                                onClick={() => {
                                    setSelectedIdea(selectedIdea === idea.id ? null : idea.id);
                                    if (!idea.isRead) {
                                        handleMarkAsRead(idea.id);
                                    }
                                }}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900">{idea.title}</h4>
                                        <p className="text-sm text-gray-600 mt-1">{idea.summary}</p>
                                        
                                        {selectedIdea === idea.id && (
                                            <div className="mt-4">
                                                <h5 className="font-medium text-gray-700 mb-2">Key Talking Points:</h5>
                                                <ul className="list-disc list-inside space-y-1">
                                                    {idea.talkingPoints.map((point, index) => (
                                                        <li key={index} className="text-sm text-gray-600">{point}</li>
                                                    ))}
                                                </ul>
                                                
                                                <div className="mt-4 flex gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleMarkAsUsed(idea.id);
                                                        }}
                                                        disabled={idea.isUsed}
                                                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                                    >
                                                        {idea.isUsed ? 'Used' : 'Mark as Used'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="ml-4 flex flex-col items-end">
                                        <span className="text-xs text-gray-500">
                                            {new Date(idea.generationDate).toLocaleDateString()}
                                        </span>
                                        {!idea.isRead && (
                                            <span className="mt-1 px-2 py-1 text-xs bg-blue-600 text-white rounded">New</span>
                                        )}
                                        {idea.isUsed && (
                                            <span className="mt-1 px-2 py-1 text-xs bg-gray-600 text-white rounded">Used</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {hasSettings && ideas.length === 0 && !generating && (
                    <div className="text-center py-8">
                        <p className="text-gray-600 mb-4">No content ideas yet. Click the button above to generate some!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ThoughtLeadership;