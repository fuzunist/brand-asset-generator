import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Download, Copy, CheckCircle } from 'lucide-react';

const PressKitPage = () => {
    const { slug } = useParams();
    const [pressKitData, setPressKitData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [copiedColor, setCopiedColor] = useState(null);

    useEffect(() => {
        const fetchPressKit = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/api/public/press-kit/${slug}`);
                setPressKitData(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Press kit not found');
            } finally {
                setLoading(false);
            }
        };

        fetchPressKit();
    }, [slug]);

    const handleDownload = (url, filename) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || 'asset';
        link.click();
    };

    const copyToClipboard = async (text, colorType) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedColor(colorType);
            setTimeout(() => setCopiedColor(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-lg">Loading press kit...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Press Kit Not Found</h1>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    const { brandName, boilerplate, colors, assets, pressContact, logoUrl } = pressKitData;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-4xl mx-auto px-6 py-8">
                    {logoUrl && (
                        <img 
                            src={logoUrl} 
                            alt={`${brandName} Logo`} 
                            className="h-16 mb-4"
                        />
                    )}
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{brandName} Press Kit</h1>
                    <p className="text-lg text-gray-600">
                        Official brand assets and information for media use
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* Company Overview */}
                <section className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">About {brandName}</h2>
                    <p className="text-gray-700 leading-relaxed">{boilerplate}</p>
                </section>

                {/* Brand Colors */}
                {colors && (colors.primary || colors.secondary || colors.accent) && (
                    <section className="bg-white rounded-lg shadow-sm p-6 mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Brand Colors</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {colors.primary && (
                                <div className="flex items-center space-x-3">
                                    <div 
                                        className="w-16 h-16 rounded-lg shadow-sm" 
                                        style={{ backgroundColor: colors.primary }}
                                    ></div>
                                    <div>
                                        <p className="font-medium text-gray-900">Primary</p>
                                        <div className="flex items-center space-x-2">
                                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                                {colors.primary}
                                            </code>
                                            <button
                                                onClick={() => copyToClipboard(colors.primary, 'primary')}
                                                className="p-1 hover:bg-gray-100 rounded"
                                            >
                                                {copiedColor === 'primary' ? (
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <Copy className="w-4 h-4 text-gray-500" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {colors.secondary && (
                                <div className="flex items-center space-x-3">
                                    <div 
                                        className="w-16 h-16 rounded-lg shadow-sm" 
                                        style={{ backgroundColor: colors.secondary }}
                                    ></div>
                                    <div>
                                        <p className="font-medium text-gray-900">Secondary</p>
                                        <div className="flex items-center space-x-2">
                                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                                {colors.secondary}
                                            </code>
                                            <button
                                                onClick={() => copyToClipboard(colors.secondary, 'secondary')}
                                                className="p-1 hover:bg-gray-100 rounded"
                                            >
                                                {copiedColor === 'secondary' ? (
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <Copy className="w-4 h-4 text-gray-500" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {colors.accent && (
                                <div className="flex items-center space-x-3">
                                    <div 
                                        className="w-16 h-16 rounded-lg shadow-sm" 
                                        style={{ backgroundColor: colors.accent }}
                                    ></div>
                                    <div>
                                        <p className="font-medium text-gray-900">Accent</p>
                                        <div className="flex items-center space-x-2">
                                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                                {colors.accent}
                                            </code>
                                            <button
                                                onClick={() => copyToClipboard(colors.accent, 'accent')}
                                                className="p-1 hover:bg-gray-100 rounded"
                                            >
                                                {copiedColor === 'accent' ? (
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <Copy className="w-4 h-4 text-gray-500" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Brand Assets */}
                {assets && assets.length > 0 && (
                    <section className="bg-white rounded-lg shadow-sm p-6 mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Brand Assets</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {assets.map((asset, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                    {asset.type.startsWith('logo') ? (
                                        <div className="aspect-video bg-gray-50 rounded-lg mb-3 flex items-center justify-center">
                                            <img 
                                                src={asset.url} 
                                                alt={asset.label}
                                                className="max-h-full max-w-full object-contain"
                                            />
                                        </div>
                                    ) : (
                                        <div className="aspect-video bg-gray-50 rounded-lg mb-3 flex items-center justify-center">
                                            <img 
                                                src={asset.url} 
                                                alt={asset.label}
                                                className="max-h-full max-w-full object-cover rounded"
                                            />
                                        </div>
                                    )}
                                    <h3 className="font-medium text-gray-900 mb-2">{asset.label}</h3>
                                    <button
                                        onClick={() => handleDownload(asset.url, asset.label)}
                                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        <span>Download</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Contact Information */}
                {pressContact && (
                    <section className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Press Contact</h2>
                        <p className="text-gray-700">
                            For media inquiries, please contact:{' '}
                            <a 
                                href={`mailto:${pressContact}`}
                                className="text-blue-600 hover:text-blue-800 underline"
                            >
                                {pressContact}
                            </a>
                        </p>
                    </section>
                )}
            </div>

            {/* Footer */}
            <footer className="bg-white border-t mt-12">
                <div className="max-w-4xl mx-auto px-6 py-6">
                    <p className="text-center text-gray-500 text-sm">
                        This press kit is maintained by {brandName}. Last updated: {new Date().toLocaleDateString()}
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default PressKitPage; 