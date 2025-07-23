import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { Copy, CheckCircle, Upload, Trash2, ExternalLink, Save } from 'lucide-react';

const PressKitSettings = () => {
    const { token } = useAuth();
    const [settings, setSettings] = useState(null);
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [copiedUrl, setCopiedUrl] = useState(false);

    const fetchSettings = useCallback(async () => {
        if (!token) return;
        try {
            const response = await axios.get('http://localhost:3001/api/press-kit/settings', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSettings(response.data);
        } catch (err) {
            setError('Failed to load press kit settings');
        } finally {
            setLoading(false);
        }
    }, [token]);

    const fetchAssets = useCallback(async () => {
        if (!token) return;
        try {
            const response = await axios.get('http://localhost:3001/api/press-kit/assets', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAssets(response.data);
        } catch (err) {
            console.error('Failed to load assets:', err);
        }
    }, [token]);

    useEffect(() => {
        fetchSettings();
        fetchAssets();
    }, [fetchSettings, fetchAssets]);

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        setError('');

        try {
            await axios.put('http://localhost:3001/api/press-kit/settings', settings, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('Press kit settings updated successfully!');
        } catch (err) {
            setError('Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (field, value) => {
        setSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const assetType = e.target.dataset.assetType;
        const label = e.target.dataset.label;

        setUploading(true);
        setMessage('');
        setError('');

        const formData = new FormData();
        formData.append('asset', file);
        formData.append('asset_type', assetType);
        formData.append('label', label);

        try {
            await axios.post('http://localhost:3001/api/press-kit/upload-asset', formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setMessage('Asset uploaded successfully!');
            fetchAssets();
        } catch (err) {
            setError('Failed to upload asset');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteAsset = async (assetId) => {
        if (!window.confirm('Are you sure you want to delete this asset?')) return;

        try {
            await axios.delete(`http://localhost:3001/api/press-kit/assets/${assetId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('Asset deleted successfully!');
            fetchAssets();
        } catch (err) {
            setError('Failed to delete asset');
        }
    };

    const copyPressKitUrl = async () => {
        try {
            await navigator.clipboard.writeText(settings.pressKitUrl);
            setCopiedUrl(true);
            setTimeout(() => setCopiedUrl(false), 2000);
        } catch (err) {
            console.error('Failed to copy URL:', err);
        }
    };

    if (loading) {
        return <div className="p-6">Loading press kit settings...</div>;
    }

    if (!settings) {
        return <div className="p-6">Failed to load press kit settings.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Press Kit Settings</h1>
                
                {/* Press Kit URL */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Your Press Kit URL</h3>
                    <div className="flex items-center space-x-2">
                        <code className="flex-1 bg-white p-2 rounded border text-sm">
                            {settings.pressKitUrl}
                        </code>
                        <button
                            onClick={copyPressKitUrl}
                            className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            {copiedUrl ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            <span>{copiedUrl ? 'Copied!' : 'Copy'}</span>
                        </button>
                        <a
                            href={settings.pressKitUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                            <ExternalLink className="w-4 h-4" />
                            <span>Preview</span>
                        </a>
                    </div>
                </div>

                {/* Brand Information Form */}
                <form onSubmit={handleSaveSettings} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Brand Name
                        </label>
                        <input
                            type="text"
                            value={settings.brand_name || ''}
                            onChange={(e) => handleInputChange('brand_name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Company Description (Boilerplate)
                        </label>
                        <textarea
                            value={settings.boilerplate || ''}
                            onChange={(e) => handleInputChange('boilerplate', e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Write a brief description of your company for media use..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Primary Color
                            </label>
                            <input
                                type="color"
                                value={settings.primary_color || '#4F46E5'}
                                onChange={(e) => handleInputChange('primary_color', e.target.value)}
                                className="w-full h-10 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Secondary Color
                            </label>
                            <input
                                type="color"
                                value={settings.secondary_color || '#06B6D4'}
                                onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                                className="w-full h-10 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Accent Color
                            </label>
                            <input
                                type="color"
                                value={settings.accent_color || '#10B981'}
                                onChange={(e) => handleInputChange('accent_color', e.target.value)}
                                className="w-full h-10 border border-gray-300 rounded-lg"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Press Contact Email
                        </label>
                        <input
                            type="email"
                            value={settings.press_contact_email || ''}
                            onChange={(e) => handleInputChange('press_contact_email', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="press@yourcompany.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Logo URL
                        </label>
                        <input
                            type="url"
                            value={settings.logo_url || ''}
                            onChange={(e) => handleInputChange('logo_url', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="https://yourcompany.com/logo.png"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center space-x-2"
                    >
                        <Save className="w-4 h-4" />
                        <span>{saving ? 'Saving...' : 'Save Settings'}</span>
                    </button>
                </form>

                {/* Messages */}
                {message && (
                    <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                        {message}
                    </div>
                )}
                {error && (
                    <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}
            </div>

            {/* Asset Management */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Brand Assets</h2>
                
                {/* Upload Forms */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {[
                        { type: 'logo_primary', label: 'Primary Logo' },
                        { type: 'logo_white', label: 'White Logo' },
                        { type: 'logo_black', label: 'Black Logo' },
                        { type: 'founder_photo', label: 'Founder Photo' },
                        { type: 'product_shot', label: 'Product Shot' },
                        { type: 'company_photo', label: 'Company Photo' }
                    ].map((assetType) => (
                        <div key={assetType.type} className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                            <h3 className="font-medium text-gray-900 mb-2">{assetType.label}</h3>
                            <label className="flex flex-col items-center justify-center cursor-pointer">
                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                <span className="text-sm text-gray-600">Upload {assetType.label}</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    data-asset-type={assetType.type}
                                    data-label={assetType.label}
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                />
                            </label>
                        </div>
                    ))}
                </div>

                {/* Existing Assets */}
                {assets.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="font-medium text-gray-900">Uploaded Assets</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {assets.map((asset) => (
                                <div key={asset.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="aspect-video bg-gray-50 rounded-lg mb-3 flex items-center justify-center">
                                        <img 
                                            src={asset.s3_url} 
                                            alt={asset.label}
                                            className="max-h-full max-w-full object-contain"
                                        />
                                    </div>
                                    <h4 className="font-medium text-gray-900 mb-2">{asset.label}</h4>
                                    <p className="text-sm text-gray-600 mb-3">{asset.asset_type}</p>
                                    <button
                                        onClick={() => handleDeleteAsset(asset.id)}
                                        className="w-full bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center space-x-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span>Delete</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {uploading && (
                    <div className="text-center py-4">
                        <div className="text-gray-600">Uploading asset...</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PressKitSettings; 