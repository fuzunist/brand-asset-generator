import React, { useState } from 'react';
import { useAuth } from '../AuthContext';

const WebsiteReportGenerator = () => {
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');
    const { token } = useAuth();

    const handleGenerateReport = async () => {
        if (!url) {
            setError('Please enter a website URL.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setMessage('');

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
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a); // Append the element to the body
            a.click();
            a.remove(); // Clean up the element
            window.URL.revokeObjectURL(url); // Clean up the object URL

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Website Audit Report Generator</h1>
                <p className="text-gray-600 mb-6">
                    Enter your website's URL to get a "health check" on its performance, brand consistency, and mobile usability.
                </p>

                <div className="flex items-center space-x-4">
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleGenerateReport}
                        className="bg-indigo-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Analyzing...' : 'Start Audit'}
                    </button>
                </div>

                {isLoading && (
                    <div className="mt-6 text-center text-gray-600">
                        <p>Analysis in progress, this may take 1-2 minutes...</p>
                    </div>
                )}
                
                {error && (
                    <div className="mt-6 p-4 bg-red-100 text-red-700 border border-red-300 rounded-md">
                        <strong>Error:</strong> {error}
                    </div>
                )}

                {message && !error && (
                     <div className="mt-6 p-4 bg-green-100 text-green-700 border border-green-300 rounded-md">
                        <strong>Success:</strong> {message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WebsiteReportGenerator; 