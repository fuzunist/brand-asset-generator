import React, { useState } from 'react';
import { useAuth } from '../AuthContext';

const WebsiteReportGenerator = () => {
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState('');
    const { token } = useAuth();

    // Validate URL format
    const isValidUrl = (string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    };

    // Simulate progress updates
    const simulateProgress = () => {
        const steps = [
            { step: 'Validating website...', progress: 10 },
            { step: 'Analyzing performance...', progress: 30 },
            { step: 'Capturing mobile screenshot...', progress: 60 },
            { step: 'Checking brand consistency...', progress: 80 },
            { step: 'Generating report...', progress: 95 },
        ];

        let stepIndex = 0;
        const interval = setInterval(() => {
            if (stepIndex < steps.length) {
                setCurrentStep(steps[stepIndex].step);
                setProgress(steps[stepIndex].progress);
                stepIndex++;
            } else {
                clearInterval(interval);
            }
        }, 8000); // Update every 8 seconds

        return interval;
    };

    const handleGenerateReport = async () => {
        // Validate URL
        if (!url) {
            setError('Please enter a website URL.');
            return;
        }

        if (!isValidUrl(url)) {
            setError('Please enter a valid URL (e.g., https://example.com).');
            return;
        }

        setIsLoading(true);
        setError(null);
        setMessage('');
        setProgress(0);
        setCurrentStep('Starting audit...');

        // Start progress simulation
        const progressInterval = simulateProgress();

        try {
            const response = await fetch('http://localhost:3001/api/website-audit/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ url }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'An unknown error occurred.');
            }
            
            // Complete progress
            setProgress(100);
            setCurrentStep('Report generated successfully!');
            
            // The response is a PDF file.
            const blob = await response.blob();
            
            // Get filename from 'Content-Disposition' header
            const contentDisposition = response.headers.get('content-disposition');
            let filename = 'Website_Audit_Report.pdf'; // default filename
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (filenameMatch.length > 1) {
                    filename = filenameMatch[1];
                }
            }

            // Create a link to download the PDF
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);

            setMessage('Report downloaded successfully!');

        } catch (err) {
            setError(err.message);
            setCurrentStep('Error occurred during analysis');
        } finally {
            clearInterval(progressInterval);
            setIsLoading(false);
            // Reset progress after a delay
            setTimeout(() => {
                setProgress(0);
                setCurrentStep('');
            }, 3000);
        }
    };

    return (
        <div className="container mx-auto p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">
                        🔍 Website Audit Report Generator
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Get a comprehensive analysis of your website's performance, mobile usability, and brand consistency
                    </p>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">What's included in your report:</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">⚡</div>
                            <div>
                                <p className="font-medium">Performance Scores</p>
                                <p className="text-sm text-gray-600">Speed & optimization metrics</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">📱</div>
                            <div>
                                <p className="font-medium">Mobile Experience</p>
                                <p className="text-sm text-gray-600">Screenshot & usability</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">🎨</div>
                            <div>
                                <p className="font-medium">Brand Consistency</p>
                                <p className="text-sm text-gray-600">Color usage analysis</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="flex-grow p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleGenerateReport}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-4 px-8 rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                        disabled={isLoading || !url}
                    >
                        {isLoading ? (
                            <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>Analyzing...</span>
                            </div>
                        ) : (
                            '🚀 Start Audit'
                        )}
                    </button>
                </div>

                {isLoading && (
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                <span className="text-blue-800 font-medium">
                                    {currentStep || 'Preparing analysis...'}
                                </span>
                            </div>
                            <span className="text-blue-600 font-semibold">{progress}%</span>
                        </div>
                        
                        <div className="w-full bg-blue-200 rounded-full h-3">
                            <div 
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        
                        <p className="text-blue-700 text-sm mt-3">
                            ⏱️ This analysis typically takes 1-2 minutes. We're running multiple checks on your website.
                        </p>
                    </div>
                )}
                
                {error && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <span className="text-red-500 text-xl">❌</span>
                            <div>
                                <strong className="text-red-800">Error:</strong>
                                <p className="text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {message && !error && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <span className="text-green-500 text-xl">✅</span>
                            <div>
                                <strong className="text-green-800">Success:</strong>
                                <p className="text-green-700">{message}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-8 bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">💡 Pro Tips:</h3>
                    <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start space-x-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>Make sure your website is live and accessible</span>
                        </li>
                        <li className="flex items-start space-x-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>The report analyzes your brand colors based on your current brand settings</span>
                        </li>
                        <li className="flex items-start space-x-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>Report includes actionable suggestions for improvement</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default WebsiteReportGenerator; 