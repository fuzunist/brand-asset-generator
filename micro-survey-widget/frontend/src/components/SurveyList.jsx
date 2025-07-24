import React from 'react';
import { 
    ChartBarIcon, 
    CodeBracketIcon, 
    CheckCircleIcon, 
    XCircleIcon,
    StarIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const SurveyList = ({ surveys, onToggleStatus, onViewResults, onViewEmbed }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getSurveyIcon = (type) => {
        return type === 'rating' ? (
            <StarIcon className="h-5 w-5 text-yellow-500" />
        ) : (
            <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-500" />
        );
    };

    return (
        <div className="grid gap-4">
            {surveys.map((survey) => (
                <div
                    key={survey.id}
                    className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                            <div className="mt-1">
                                {getSurveyIcon(survey.type)}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-medium text-gray-900 mb-1">
                                    {survey.question}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span className="capitalize">{survey.type}</span>
                                    <span>•</span>
                                    <span>{survey.response_count || 0} responses</span>
                                    <span>•</span>
                                    <span>Created {formatDate(survey.created_at)}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            {survey.status === 'active' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <CheckCircleIcon className="h-3 w-3" />
                                    Active
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    <XCircleIcon className="h-3 w-3" />
                                    Inactive
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Survey Options Preview */}
                    {survey.type === 'poll' && survey.options && (
                        <div className="mb-4 flex gap-2">
                            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                                {survey.options.option1}
                            </span>
                            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                                {survey.options.option2}
                            </span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onViewResults(survey)}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <ChartBarIcon className="h-4 w-4 mr-1.5" />
                            View Results
                        </button>
                        
                        <button
                            onClick={() => onViewEmbed(survey)}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <CodeBracketIcon className="h-4 w-4 mr-1.5" />
                            Embed Code
                        </button>
                        
                        <button
                            onClick={() => onToggleStatus(survey.id, survey.status)}
                            className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                survey.status === 'active'
                                    ? 'text-red-700 bg-red-50 hover:bg-red-100 focus:ring-red-500'
                                    : 'text-green-700 bg-green-50 hover:bg-green-100 focus:ring-green-500'
                            }`}
                        >
                            {survey.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SurveyList;