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

const LogoEditor = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [selectedLogo, setSelectedLogo] = useState(null);
    const [formData, setFormData] = useState({
        companyName: location.state?.formData?.companyName || 'Company Name',
        brandColor: '#7c9c3f',
        logoIcon: 'shield',
        fontSize: 1.2
    });

    // Farklı fontlar için array
    const fonts = [
        'Inter', 'Poppins', 'Roboto', 'Open Sans', 'Montserrat',
        'Raleway', 'Lato', 'Source Sans Pro', 'Nunito', 'Ubuntu',
        'Playfair Display', 'Merriweather', 'Lora', 'Crimson Text', 'Georgia'
    ];

    const [selectedFont, setSelectedFont] = useState('Inter');

    const iconSVGs = {
        shield: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M12 2L2 7V10C2 16 6 20.9 12 22C18 20.9 22 16 22 10V7L12 2Z'/%3E%3C/svg%3E",
        star: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z'/%3E%3C/svg%3E",
        heart: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M20.84 4.61A5.5 5.5 0 0016 2A5.5 5.5 0 0012 4A5.5 5.5 0 008 2A5.5 5.5 0 003.16 4.61A5.5 5.5 0 002 8.5C2 12.28 12 22 12 22S22 12.28 22 8.5A5.5 5.5 0 0020.84 4.61Z'/%3E%3C/svg%3E",
        circle: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3C/svg%3E",
        diamond: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M6 3H18L22 9L12 21L2 9L6 3Z'/%3E%3C/svg%3E",
        leaf: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22L6.66 19.7C7.14 19.87 7.64 20 8 20C19 20 22 3 22 3C21 5 14 5.25 9 6.25C4 7.25 2 11.5 2 13.5C2 15.5 3.75 17.25 3.75 17.25C7.5 15 12.5 16 17 8Z'/%3E%3C/svg%3E"
    };

    useEffect(() => {
        if (location.state?.selectedLogo) {
            setSelectedLogo(location.state.selectedLogo);
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
                formData: location.state?.formData,
                editedData: formData
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

                                {/* Logo Icon */}
                                <div className="control-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Image className="w-4 h-4 inline mr-2" />
                                        Logo Icon
                                    </label>
                                    <select
                                        value={formData.logoIcon}
                                        onChange={(e) => handleInputChange('logoIcon', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="shield">Shield</option>
                                        <option value="star">Star</option>
                                        <option value="heart">Heart</option>
                                        <option value="circle">Circle</option>
                                        <option value="diamond">Diamond</option>
                                        <option value="leaf">Leaf</option>
                                    </select>
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
                                        min="0.8"
                                        max="2"
                                        step="0.1"
                                        value={formData.fontSize}
                                        onChange={(e) => handleInputChange('fontSize', parseFloat(e.target.value))}
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
                        <div className="flex-1 bg-white rounded-lg shadow-lg p-8">
                            <div className="mockup-scene relative w-full h-96">
                                {/* Left Section - Mockup Cards */}
                                <div className="absolute left-0 top-0 w-3/5 h-full bg-gray-800 rounded-lg p-6 flex flex-wrap gap-4 items-center justify-center">
                                    {/* Large white card */}
                                    <div className="bg-white rounded-lg p-4 w-32 h-20 flex items-center justify-center shadow-lg">
                                        <div className="logo flex items-center gap-2">
                                            <div 
                                                className="w-4 h-4"
                                                style={{
                                                    backgroundColor: formData.brandColor,
                                                    mask: `url("${iconSVGs[formData.logoIcon]}") no-repeat center`,
                                                    maskSize: 'contain'
                                                }}
                                            ></div>
                                            <span 
                                                className="font-bold"
                                                style={{
                                                    color: formData.brandColor,
                                                    fontSize: `${formData.fontSize}em`,
                                                    fontFamily: selectedFont
                                                }}
                                            >
                                                {formData.companyName}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Vertical green card */}
                                    <div 
                                        className="rounded-lg p-4 w-16 h-24 flex items-center justify-center shadow-lg"
                                        style={{ backgroundColor: formData.brandColor }}
                                    >
                                        <div className="logo flex flex-col items-center gap-1 text-white">
                                            <div 
                                                className="w-4 h-4"
                                                style={{
                                                    backgroundColor: 'white',
                                                    mask: `url("${iconSVGs[formData.logoIcon]}") no-repeat center`,
                                                    maskSize: 'contain'
                                                }}
                                            ></div>
                                            <span 
                                                className="font-bold text-xs"
                                                style={{
                                                    fontSize: `${formData.fontSize * 0.8}em`,
                                                    fontFamily: selectedFont
                                                }}
                                            >
                                                {formData.companyName}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Large green card */}
                                    <div 
                                        className="rounded-lg p-4 w-32 h-20 flex items-center justify-center shadow-lg"
                                        style={{ backgroundColor: formData.brandColor }}
                                    >
                                        <div className="logo flex items-center gap-2 text-white">
                                            <div 
                                                className="w-4 h-4"
                                                style={{
                                                    backgroundColor: 'white',
                                                    mask: `url("${iconSVGs[formData.logoIcon]}") no-repeat center`,
                                                    maskSize: 'contain'
                                                }}
                                            ></div>
                                            <span 
                                                className="font-bold"
                                                style={{
                                                    fontSize: `${formData.fontSize}em`,
                                                    fontFamily: selectedFont
                                                }}
                                            >
                                                {formData.companyName}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Medium green card */}
                                    <div 
                                        className="rounded-lg p-4 w-24 h-16 flex items-center justify-center shadow-lg"
                                        style={{ backgroundColor: formData.brandColor }}
                                    >
                                        <div className="logo flex items-center gap-1 text-white">
                                            <div 
                                                className="w-3 h-3"
                                                style={{
                                                    backgroundColor: 'white',
                                                    mask: `url("${iconSVGs[formData.logoIcon]}") no-repeat center`,
                                                    maskSize: 'contain'
                                                }}
                                            ></div>
                                            <span 
                                                className="font-bold text-sm"
                                                style={{
                                                    fontSize: `${formData.fontSize * 0.9}em`,
                                                    fontFamily: selectedFont
                                                }}
                                            >
                                                {formData.companyName}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Small white card */}
                                    <div className="bg-white rounded-lg p-3 w-20 h-12 flex items-center justify-center shadow-lg">
                                        <div className="logo flex items-center gap-1">
                                            <div 
                                                className="w-3 h-3"
                                                style={{
                                                    backgroundColor: formData.brandColor,
                                                    mask: `url("${iconSVGs[formData.logoIcon]}") no-repeat center`,
                                                    maskSize: 'contain'
                                                }}
                                            ></div>
                                            <span 
                                                className="font-bold text-xs"
                                                style={{
                                                    color: formData.brandColor,
                                                    fontSize: `${formData.fontSize * 0.7}em`,
                                                    fontFamily: selectedFont
                                                }}
                                            >
                                                {formData.companyName}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Section - Main Logo */}
                                <div className="absolute right-0 top-0 w-2/5 h-full bg-white rounded-lg flex flex-col items-center justify-center gap-6">
                                    <div className="main-logo flex flex-col items-center gap-4">
                                        <div 
                                            className="w-24 h-24"
                                            style={{
                                                backgroundColor: formData.brandColor,
                                                mask: `url("${iconSVGs[formData.logoIcon]}") no-repeat center`,
                                                maskSize: 'contain'
                                            }}
                                        ></div>
                                        <div 
                                            className="text-3xl font-light tracking-wider"
                                            style={{
                                                color: formData.brandColor,
                                                fontSize: `${formData.fontSize * 2.5}em`,
                                                fontFamily: selectedFont
                                            }}
                                        >
                                            {formData.companyName}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogoEditor; 