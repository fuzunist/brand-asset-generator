import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import SurveyDashboard from './SurveyDashboard';
import SurveyList from './SurveyList';
import SurveyResults from './SurveyResults';
import CreateSurveyModal from './CreateSurveyModal';
import EmbedCodeModal from './EmbedCodeModal';

const API_BASE_URL = process.env.REACT_APP_SURVEY_API_URL || 'http://localhost:3002';

const MicroSurveyDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEmbedModal, setShowEmbedModal] = useState(false);
    const [selectedSurvey, setSelectedSurvey] = useState(null);
    const [surveys, setSurveys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [brandIdentityId] = useState('test-brand-id');

    const tabs = [
        { id: 'dashboard', name: 'Dashboard', icon: '📊' },
        { id: 'surveys', name: 'Surveys', icon: '📝' },
        { id: 'results', name: 'Results', icon: '📈' }
    ];

    useEffect(() => {
        fetchSurveys();
    }, []);

    const fetchSurveys = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/surveys`, {
                headers: {
                    'x-brand-identity-id': brandIdentityId
                }
            });
            setSurveys(response.data.surveys || []);
        } catch (error) {
            toast.error('Failed to fetch surveys');
            console.error('Fetch surveys error:', error);
            setSurveys([]);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (surveyId, currentStatus) => {
        try {
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
            await axios.patch(
                `${API_BASE_URL}/api/surveys/${surveyId}`,
                { status: newStatus },
                {
                    headers: {
                        'x-brand-identity-id': brandIdentityId
                    }
                }
            );
            
            toast.success(`Survey ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
            fetchSurveys();
        } catch (error) {
            toast.error('Failed to update survey status');
            console.error('Update status error:', error);
        }
    };

    const handleViewResults = (survey) => {
        setSelectedSurvey(survey);
        setActiveTab('results');
    };

    const handleViewEmbed = (survey) => {
        setSelectedSurvey(survey);
        setShowEmbedModal(true);
    };

    const handleCreateSurvey = async (surveyData) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/surveys`,
                surveyData,
                {
                    headers: {
                        'x-brand-identity-id': brandIdentityId
                    }
                }
            );
            
            toast.success('Survey created successfully!');
            setShowCreateModal(false);
            fetchSurveys();
            
            // Show embed code modal for the new survey
            setSelectedSurvey(response.data.survey);
            setShowEmbedModal(true);
        } catch (error) {
            toast.error('Failed to create survey');
            console.error('Create survey error:', error);
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            <Toaster position="top-right" />
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Micro Survey Widget</h1>
                <p className="text-gray-600">Create and manage lightweight surveys for your website</p>
            </div>

            {/* Action Buttons */}
            <div className="mb-6 flex gap-4">
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create New Survey
                </button>
                <button
                    onClick={() => {
                        if (surveys.length === 0) {
                            toast.error('Please create a survey first');
                        } else {
                            toast.error('Please select a survey from the Surveys tab');
                            setActiveTab('surveys');
                        }
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    Get Embed Code
                </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                                activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <span>{tab.icon}</span>
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg shadow">
                {activeTab === 'dashboard' && <SurveyDashboard />}
                {activeTab === 'surveys' && (
                    <SurveyList 
                        surveys={surveys}
                        onToggleStatus={handleToggleStatus}
                        onViewResults={handleViewResults}
                        onViewEmbed={handleViewEmbed}
                    />
                )}
                {activeTab === 'results' && (
                    selectedSurvey ? (
                        <SurveyResults 
                            isOpen={true}
                            onClose={() => setSelectedSurvey(null)}
                            surveyId={selectedSurvey.id}
                            brandIdentityId={brandIdentityId}
                        />
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <p className="text-lg font-medium mb-2">No survey selected</p>
                            <p className="text-sm mb-4">Please select a survey from the Surveys tab to view its results</p>
                            <button
                                onClick={() => setActiveTab('surveys')}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Go to Surveys →
                            </button>
                        </div>
                    )
                )}
            </div>

            {/* Modals */}
            {showCreateModal && (
                <CreateSurveyModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleCreateSurvey}
                />
            )}

            {showEmbedModal && selectedSurvey && (
                <EmbedCodeModal
                    isOpen={showEmbedModal}
                    onClose={() => setShowEmbedModal(false)}
                    surveyId={selectedSurvey.id}
                    embedCode={`<div id="brandos-survey-widget" data-survey-id="${selectedSurvey.id}"></div>\n<script src="${process.env.REACT_APP_CDN_URL || 'https://cdn.brandos.com'}/widget.js" async defer></script>`}
                />
            )}
        </div>
    );
};

export default MicroSurveyDashboard; 