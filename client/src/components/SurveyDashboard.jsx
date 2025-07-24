import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PlusIcon, ChartBarIcon, CodeBracketIcon } from '@heroicons/react/24/outline';
import CreateSurveyModal from './CreateSurveyModal';
import SurveyList from './SurveyList';
import SurveyResults from './SurveyResults';
import EmbedCodeModal from './EmbedCodeModal';

const API_BASE_URL = process.env.REACT_APP_SURVEY_API_URL || 'http://localhost:3002';

const SurveyDashboard = () => {
    const [surveys, setSurveys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedSurvey, setSelectedSurvey] = useState(null);
    const [showResultsModal, setShowResultsModal] = useState(false);
    const [showEmbedModal, setShowEmbedModal] = useState(false);
    const [brandIdentityId] = useState('test-brand-id'); // In production, get from auth context

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
            setSurveys(response.data.surveys);
        } catch (error) {
            toast.error('Failed to fetch surveys');
            console.error('Fetch surveys error:', error);
        } finally {
            setLoading(false);
        }
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
            
            // Show embed code modal
            setSelectedSurvey({
                ...response.data.survey,
                embedCode: response.data.embedCode
            });
            setShowEmbedModal(true);
        } catch (error) {
            toast.error('Failed to create survey');
            console.error('Create survey error:', error);
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
        setShowResultsModal(true);
    };

    const handleViewEmbed = (survey) => {
        const embedCode = `<div id="brandos-survey-widget" data-survey-id="${survey.id}"></div>
<script src="${process.env.REACT_APP_CDN_URL || 'https://cdn.brandos.com'}/widget.js" async defer></script>`;
        
        setSelectedSurvey({
            ...survey,
            embedCode
        });
        setShowEmbedModal(true);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Micro Surveys</h1>
                    <p className="mt-2 text-gray-600">
                        Create quick polls and ratings to gather instant feedback from your users
                    </p>
                </div>

                {/* Actions */}
                <div className="mb-6 flex justify-between items-center">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Create Survey
                        </button>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                        {surveys.length} {surveys.length === 1 ? 'survey' : 'surveys'} created
                    </div>
                </div>

                {/* Survey List */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : surveys.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <ChartBarIcon className="h-12 w-12 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No surveys yet</h3>
                        <p className="text-gray-600 mb-4">
                            Create your first survey to start collecting feedback
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Create Your First Survey
                        </button>
                    </div>
                ) : (
                    <SurveyList
                        surveys={surveys}
                        onToggleStatus={handleToggleStatus}
                        onViewResults={handleViewResults}
                        onViewEmbed={handleViewEmbed}
                    />
                )}

                {/* Modals */}
                <CreateSurveyModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleCreateSurvey}
                />

                {selectedSurvey && showResultsModal && (
                    <SurveyResults
                        isOpen={showResultsModal}
                        onClose={() => setShowResultsModal(false)}
                        surveyId={selectedSurvey.id}
                        brandIdentityId={brandIdentityId}
                    />
                )}

                {selectedSurvey && showEmbedModal && (
                    <EmbedCodeModal
                        isOpen={showEmbedModal}
                        onClose={() => setShowEmbedModal(false)}
                        embedCode={selectedSurvey.embedCode}
                        surveyQuestion={selectedSurvey.question}
                    />
                )}
            </div>
        </div>
    );
};

export default SurveyDashboard;