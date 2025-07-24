import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const API_BASE_URL = process.env.REACT_APP_SURVEY_API_URL || 'http://localhost:3002';

const SurveyResults = ({ isOpen, onClose, surveyId, brandIdentityId }) => {
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && surveyId) {
            fetchResults();
        }
    }, [isOpen, surveyId]);

    const fetchResults = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${API_BASE_URL}/api/surveys/${surveyId}/results`,
                {
                    headers: {
                        'x-brand-identity-id': brandIdentityId
                    }
                }
            );
            setResults(response.data);
        } catch (error) {
            console.error('Error fetching results:', error);
        } finally {
            setLoading(false);
        }
    };

    const getChartData = () => {
        if (!results || !results.results) return null;

        const labels = [];
        const data = [];
        const backgroundColors = [];
        const borderColors = [];

        if (results.type === 'poll') {
            if (results.options) {
                labels.push(results.options.option1 || 'Option 1');
                labels.push(results.options.option2 || 'Option 2');
                data.push(results.results.option1 || 0);
                data.push(results.results.option2 || 0);
                backgroundColors.push('rgba(59, 130, 246, 0.8)'); // Blue
                backgroundColors.push('rgba(34, 197, 94, 0.8)'); // Green
                borderColors.push('rgb(59, 130, 246)');
                borderColors.push('rgb(34, 197, 94)');
            }
        } else if (results.type === 'rating') {
            for (let i = 1; i <= 5; i++) {
                labels.push(`${i} Star${i > 1 ? 's' : ''}`);
                data.push(results.results[i] || 0);
                // Gradient from red to green
                const hue = (i - 1) * 30; // 0 to 120 (red to green)
                backgroundColors.push(`hsla(${hue}, 70%, 50%, 0.8)`);
                borderColors.push(`hsl(${hue}, 70%, 50%)`);
            }
        }

        return {
            labels,
            datasets: [{
                label: 'Responses',
                data,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1
            }]
        };
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const value = context.parsed.y || context.parsed;
                        const total = results.totalResponses || 0;
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        return `${value} responses (${percentage}%)`;
                    }
                }
            }
        },
        scales: results?.type === 'rating' ? {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            }
        } : undefined
    };

    const chartData = getChartData();

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title as="div" className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                                        Survey Results
                                    </h3>
                                    <button
                                        onClick={onClose}
                                        className="text-gray-400 hover:text-gray-500"
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </Dialog.Title>

                                {loading ? (
                                    <div className="flex justify-center items-center h-64">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                    </div>
                                ) : results ? (
                                    <div>
                                        {/* Question and Stats */}
                                        <div className="mb-6">
                                            <h4 className="text-lg font-medium text-gray-900 mb-2">
                                                {results.question}
                                            </h4>
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <span>
                                                    Type: <span className="font-medium capitalize">{results.type}</span>
                                                </span>
                                                <span>
                                                    Total Responses: <span className="font-medium">{results.totalResponses}</span>
                                                </span>
                                            </div>
                                        </div>

                                        {/* Chart */}
                                        {chartData && results.totalResponses > 0 ? (
                                            <div className="mb-6" style={{ height: '300px' }}>
                                                {results.type === 'poll' ? (
                                                    <Doughnut data={chartData} options={chartOptions} />
                                                ) : (
                                                    <Bar data={chartData} options={chartOptions} />
                                                )}
                                            </div>
                                        ) : (
                                            <div className="bg-gray-50 rounded-lg p-12 text-center">
                                                <p className="text-gray-600">No responses yet</p>
                                            </div>
                                        )}

                                        {/* Response Breakdown */}
                                        {results.totalResponses > 0 && (
                                            <div className="mt-6">
                                                <h5 className="text-sm font-medium text-gray-700 mb-3">Response Breakdown</h5>
                                                <div className="space-y-2">
                                                    {chartData.labels.map((label, index) => {
                                                        const value = chartData.datasets[0].data[index];
                                                        const percentage = results.totalResponses > 0 
                                                            ? ((value / results.totalResponses) * 100).toFixed(1) 
                                                            : 0;
                                                        
                                                        return (
                                                            <div key={label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                                <span className="text-sm font-medium text-gray-700">{label}</span>
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-sm text-gray-600">{value} responses</span>
                                                                    <span className="text-sm font-medium text-gray-900">{percentage}%</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-gray-600">Failed to load results</p>
                                    </div>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default SurveyResults;