import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    Download, 
    Edit3, 
    Sparkles, 
    CheckCircle,
    Palette,
    Type,
    Image
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import BrandingMockup from './BrandingMockup';
import MockupPreview from './MockupPreview';

const LogoEditor = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [selectedLogo, setSelectedLogo] = useState(null);
    const [formData, setFormData] = useState({
        companyName: location.state?.formData?.companyName || 'Company Name',
        brandColor: '#7c9c3f',
        fontSize: 3, // Base font size, e.g., in rem or a multiplier
        iconSize: 6   // Base icon size, e.g., in rem
    });

    // Farklı fontlar için array
    const fonts = [
        'Inter', 'Poppins', 'Roboto', 'Open Sans', 'Montserrat',
        'Raleway', 'Lato', 'Source Sans Pro', 'Nunito', 'Ubuntu',
        'Playfair Display', 'Merriweather', 'Lora', 'Crimson Text', 'Georgia'
    ];

    const [selectedFont, setSelectedFont] = useState('Inter');

    useEffect(() => {
        if (location.state?.selectedLogo) {
            const { selectedLogo } = location.state;
            setSelectedLogo(selectedLogo);
            setFormData(prev => ({
                ...prev,
                brandColor: selectedLogo.brandColor || '#7c9c3f',
            }));
            setSelectedFont(selectedLogo.logoFont || 'Inter');
        }
    }, [location.state]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePurchase = () => {
        navigate('/pricing', {
            state: {
                selectedLogo,
                formData: {
                    ...location.state?.formData,
                    ...formData,
                    logoFont: selectedFont
                }
            }
        });
    };

    const handleDownload = () => {
        alert('Logo indirme özelliği yakında eklenecek!');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">Ficonica</span>
                        </div>
                        <button
                            onClick={() => navigate('/logo-results')}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            Logo Editor & Mockup Preview
                        </h1>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Customize your logo and see it applied to professional mockups in real-time
                        </p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Left Panel - Controls */}
                        <div className="lg:w-80 bg-white rounded-lg shadow-lg p-6">
                            <div className="space-y-6">
                                {/* Company Name */}
                                <div className="control-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Type className="w-4 h-4 inline mr-2" />
                                        Company Name
                                    </label>
                                    <Input
                                        type="text"
                                        value={formData.companyName}
                                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                                        placeholder="Enter company name"
                                        className="w-full"
                                    />
                                </div>

                                {/* Brand Color */}
                                <div className="control-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Palette className="w-4 h-4 inline mr-2" />
                                        Brand Color
                                    </label>
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="color"
                                            value={formData.brandColor}
                                            onChange={(e) => handleInputChange('brandColor', e.target.value)}
                                            className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                                        />
                                        <span className="text-sm text-gray-600">{formData.brandColor}</span>
                                    </div>
                                </div>

                                {/* Logo Preview */}
                                <div className="control-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Image className="w-4 h-4 inline mr-2" />
                                        Selected Logo
                                    </label>
                                    <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center h-24">
                                        {selectedLogo && (
                                            <div
                                                className="w-20 h-20"
                                                style={{
                                                    backgroundColor: formData.brandColor,
                                                    maskImage: `url(${selectedLogo.previewUrl || selectedLogo.preview})`,
                                                    WebkitMaskImage: `url(${selectedLogo.previewUrl || selectedLogo.preview})`,
                                                    maskSize: 'contain',
                                                    maskRepeat: 'no-repeat',
                                                    maskPosition: 'center',
                                                }}
                                            ></div>
                                        )}
                                    </div>
                                </div>

                                {/* Font Selection */}
                                <div className="control-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Type className="w-4 h-4 inline mr-2" />
                                        Font Family
                                    </label>
                                    <select
                                        value={selectedFont}
                                        onChange={(e) => setSelectedFont(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {fonts.map(font => (
                                            <option key={font} value={font}>{font}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Font Size */}
                                <div className="control-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Font Size: {formData.fontSize}
                                    </label>
                                    <input
                                        type="range"
                                        min="1.5"
                                        max="5"
                                        step="0.1"
                                        value={formData.fontSize}
                                        onChange={(e) => handleInputChange('fontSize', parseFloat(e.target.value))}
                                        className="w-full"
                                    />
                                </div>
                                
                                {/* Icon Size */}
                                <div className="control-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Icon Size: {formData.iconSize}
                                    </label>
                                    <input
                                        type="range"
                                        min="3"
                                        max="12"
                                        step="0.5"
                                        value={formData.iconSize}
                                        onChange={(e) => handleInputChange('iconSize', parseFloat(e.target.value))}
                                        className="w-full"
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-3 pt-4">
                                    <Button
                                        onClick={handleDownload}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Download Logo
                                    </Button>
                                    <Button
                                        onClick={handlePurchase}
                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                    >
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Get Logo & Brand Kit
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Right Panel - Mockup Preview */}
                        <div className="flex-1 space-y-4">
                            {selectedLogo && (
                                <>
                                    <MockupPreview 
                                        logo={selectedLogo}
                                        companyName={formData.companyName}
                                        brandColor={formData.brandColor}
                                        logoFont={selectedFont}
                                        fontSize={formData.fontSize}
                                        iconSize={formData.iconSize}
                                    />
                                    <BrandingMockup 
                                        logo={selectedLogo}
                                        companyName={formData.companyName}
                                        brandColor={formData.brandColor}
                                        logoFont={selectedFont}
                                        fontSize={formData.fontSize}
                                        iconSize={formData.iconSize}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogoEditor; 