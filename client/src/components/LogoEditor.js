import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    ArrowRight, 
    Download, 
    Palette, 
    Type,
    Eye,
    Smartphone,
    Monitor,
    CreditCard,
    Heart,
    Share2,
    CheckCircle,
    Sparkles
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';

const LogoEditor = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [selectedLogo, setSelectedLogo] = useState(location.state?.selectedLogo || null);
    const [isLoading, setIsLoading] = useState(false);
    const [customizations, setCustomizations] = useState({
        primaryColor: '#3B82F6',
        secondaryColor: '#1E40AF',
        fontFamily: 'Inter',
        fontSize: '24px',
        layout: 'horizontal'
    });

    // Mockup states
    const [mockups, setMockups] = useState({
        businessCard: true,
        tshirt: true,
        socialMedia: true,
        website: true
    });

    useEffect(() => {
        if (!selectedLogo) {
            // Eğer logo seçilmemişse, geri dön
            navigate('/logo-results');
        }
    }, [selectedLogo, navigate]);

    const colorOptions = [
        { name: 'Mavi', value: '#3B82F6', secondary: '#1E40AF' },
        { name: 'Yeşil', value: '#10B981', secondary: '#059669' },
        { name: 'Kırmızı', value: '#EF4444', secondary: '#DC2626' },
        { name: 'Mor', value: '#8B5CF6', secondary: '#7C3AED' },
        { name: 'Turuncu', value: '#F97316', secondary: '#EA580C' },
        { name: 'Pembe', value: '#EC4899', secondary: '#DB2777' },
        { name: 'Siyah', value: '#111827', secondary: '#374151' },
        { name: 'Gri', value: '#6B7280', secondary: '#4B5563' }
    ];

    const fontOptions = [
        { name: 'Inter', value: 'Inter' },
        { name: 'Poppins', value: 'Poppins' },
        { name: 'Roboto', value: 'Roboto' },
        { name: 'Open Sans', value: 'Open Sans' },
        { name: 'Montserrat', value: 'Montserrat' }
    ];

    const handleCustomizationChange = (field, value) => {
        setCustomizations(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleMockupToggle = (mockupType) => {
        setMockups(prev => ({
            ...prev,
            [mockupType]: !prev[mockupType]
        }));
    };

    const handleDownload = () => {
        // Logo indirme işlemi
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            // Gerçek uygulamada PNG/SVG indirme
            alert('Logo indirme özelliği yakında eklenecek!');
        }, 2000);
    };

    const handlePurchase = () => {
        navigate('/pricing', { 
            state: { 
                selectedLogo,
                customizations 
            } 
        });
    };

    if (!selectedLogo) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                                    <p className="text-gray-600">Loading logo...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="ghost"
                                onClick={() => navigate('/logo-results')}
                                className="flex items-center space-x-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Geri</span>
                            </Button>
                            <div className="h-6 w-px bg-gray-300"></div>
                            <h1 className="text-lg font-semibold text-gray-900">Edit Logo</h1>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Button variant="outline" onClick={handleDownload} disabled={isLoading}>
                                {isLoading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                ) : (
                                    <Download className="w-4 h-4" />
                                )}
                                <span className="ml-2">Download</span>
                            </Button>
                            <Button onClick={handlePurchase} className="bg-blue-600 hover:bg-blue-700">
                                <Sparkles className="w-4 h-4 mr-2" />
                                Purchase
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Sol Panel - Düzenleme Araçları */}
                    <div className="space-y-6">
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <Palette className="w-5 h-5 mr-2" />
                                    Color Settings
                                </h2>
                                <div className="grid grid-cols-4 gap-3">
                                    {colorOptions.map((color) => (
                                        <button
                                            key={color.value}
                                            onClick={() => handleCustomizationChange('primaryColor', color.value)}
                                            className={`w-12 h-12 rounded-lg border-2 transition-all ${
                                                customizations.primaryColor === color.value
                                                    ? 'border-blue-600 scale-110'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                            style={{ backgroundColor: color.value }}
                                            title={color.name}
                                        ></button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <Type className="w-5 h-5 mr-2" />
                                    Typography
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="fontFamily">Font Family</Label>
                                        <select
                                            id="fontFamily"
                                            value={customizations.fontFamily}
                                            onChange={(e) => handleCustomizationChange('fontFamily', e.target.value)}
                                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            {fontOptions.map((font) => (
                                                <option key={font.value} value={font.value}>
                                                    {font.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <Label htmlFor="fontSize">Font Size</Label>
                                        <Input
                                            id="fontSize"
                                            type="range"
                                            min="12"
                                            max="48"
                                            value={parseInt(customizations.fontSize)}
                                            onChange={(e) => handleCustomizationChange('fontSize', `${e.target.value}px`)}
                                            className="w-full mt-1"
                                        />
                                        <div className="text-sm text-gray-500 mt-1">
                                            {customizations.fontSize}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <Eye className="w-5 h-5 mr-2" />
                                    Mockup View
                                </h2>
                                <div className="space-y-3">
                                    {Object.entries(mockups).map(([key, value]) => (
                                        <div key={key} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                {key === 'businessCard' && <CreditCard className="w-5 h-5 text-gray-600" />}
                                                {key === 'tshirt' && <Heart className="w-5 h-5 text-gray-600" />}
                                                {key === 'socialMedia' && <Smartphone className="w-5 h-5 text-gray-600" />}
                                                {key === 'website' && <Monitor className="w-5 h-5 text-gray-600" />}
                                                <span className="text-sm font-medium text-gray-700 capitalize">
                                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleMockupToggle(key)}
                                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                                    value
                                                        ? 'bg-blue-600 border-blue-600'
                                                        : 'bg-white border-gray-300'
                                                }`}
                                            >
                                                {value && <CheckCircle className="w-4 h-4 text-white" />}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sağ Panel - Canlı Önizleme */}
                    <div className="space-y-6">
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Live Preview</h2>
                                <div className="bg-white border border-gray-200 rounded-lg p-6 min-h-[400px] flex items-center justify-center">
                                    <div 
                                        className="text-center"
                                        style={{
                                            color: customizations.primaryColor,
                                            fontFamily: customizations.fontFamily,
                                            fontSize: customizations.fontSize
                                        }}
                                    >
                                        <img 
                                            src={selectedLogo.previewUrl} 
                                            alt="Logo Preview"
                                            className="mx-auto mb-4 max-w-full h-auto"
                                            style={{ maxHeight: '200px' }}
                                        />
                                        <div className="text-lg font-semibold">
                                            {location.state?.formData?.companyName || 'Company Name'}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Mockup Önizlemeleri */}
                        {mockups.businessCard && (
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                                        <CreditCard className="w-4 h-4 mr-2" />
                                        Business Card
                                    </h3>
                                    <div className="bg-white border border-gray-200 rounded-lg p-4 w-80 h-48 mx-auto">
                                        <div className="flex items-center space-x-3">
                                            <img 
                                                src={selectedLogo.previewUrl} 
                                                alt="Logo"
                                                className="w-12 h-12"
                                            />
                                            <div>
                                                <div className="font-semibold text-gray-900">
                                                    {location.state?.formData?.companyName || 'Company Name'}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    {location.state?.formData?.slogan || 'Slogan'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {mockups.socialMedia && (
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                                        <Smartphone className="w-4 h-4 mr-2" />
                                        Social Media Profile
                                    </h3>
                                    <div className="bg-white border border-gray-200 rounded-lg p-4 w-64 h-64 mx-auto">
                                        <div className="text-center">
                                            <img 
                                                src={selectedLogo.previewUrl} 
                                                alt="Logo"
                                                className="w-16 h-16 mx-auto mb-3"
                                            />
                                            <div className="font-semibold text-gray-900 text-sm">
                                                {location.state?.formData?.companyName || 'Company Name'}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogoEditor; 