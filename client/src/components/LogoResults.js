import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    ArrowRight, 
    Download, 
    Edit3, 
    Heart, 
    Share2, 
    Sparkles, 
    CheckCircle 
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

const LogoResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [selectedLogo, setSelectedLogo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [logos, setLogos] = useState([]);

    // Farklı fontlar için array
    const fonts = [
        'Inter', 'Poppins', 'Roboto', 'Open Sans', 'Montserrat', 
        'Raleway', 'Lato', 'Source Sans Pro', 'Nunito', 'Ubuntu',
        'Playfair Display', 'Merriweather', 'Lora', 'Crimson Text', 'Georgia'
    ];

    const getRandomFont = () => {
        return fonts[Math.floor(Math.random() * fonts.length)];
    };

    useEffect(() => {
        const loadLogos = async () => {
            try {
                // Önce location state'den logo verilerini kontrol et
                if (location.state?.logos && location.state.logos.length > 0) {
                    setLogos(location.state.logos);
                    setIsLoading(false);
                    return;
                }

                // Eğer location state'de logo yoksa, form verilerine göre getir
                if (location.state?.formData) {
                    const { LogoService } = await import('../services/logoService');
                    const fetchedLogos = await LogoService.getAllPublishedLogos(20);

                    // Eğer Firebase'den logo gelmezse mock verileri kullan
                    if (!fetchedLogos || fetchedLogos.length === 0) {
                        const mockLogos = LogoService.getMockLogos('technology');
                        setLogos(mockLogos);
                    } else {
                        setLogos(fetchedLogos);
                    }
                } else {
                    // Hiçbir veri yoksa mock logoları göster
                    const { LogoService } = await import('../services/logoService');
                    const mockLogos = LogoService.getMockLogos('technology');
                    setLogos(mockLogos);
                }
            } catch (error) {
                console.error('Logo yükleme hatası:', error);
                // Hata durumunda mock verileri kullan
                const { LogoService } = await import('../services/logoService');
                const mockLogos = LogoService.getMockLogos('technology');
                setLogos(mockLogos);
            } finally {
                setIsLoading(false);
            }
        };

        loadLogos();
    }, [location.state]);

    const handleLogoSelect = (logo) => {
        setSelectedLogo(logo);
    };

    const handleEdit = () => {
        if (selectedLogo) {
            navigate('/logo-editor', {
                state: {
                    selectedLogo,
                    formData: location.state?.formData
                }
            });
        }
    };

    const handleDownload = () => {
        // Logo indirme işlemi
        alert('Logo indirme özelliği yakında eklenecek!');
    };

    const handlePurchase = () => {
        if (selectedLogo) {
            navigate('/pricing', {
                state: {
                    selectedLogo,
                    formData: location.state?.formData
                }
            });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Logolar yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
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
                            onClick={() => navigate('/logo-creator')}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            Logo Designs for {location.state?.formData?.companyName}
                        </h1>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            AI has created amazing logo designs for you. 
                            Choose your favorite design and create your brand kit.
                        </p>
                    </div>

                    {/* Logo Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {logos.map((logo) => (
                            <Card
                                key={logo.id}
                                className={`cursor-pointer transition-all hover:shadow-lg ${
                                    selectedLogo?.id === logo.id
                                        ? 'ring-2 ring-blue-500 shadow-lg'
                                        : 'hover:scale-105'
                                }`}
                                onClick={() => handleLogoSelect(logo)}
                            >
                                <CardContent className="p-6">
                                    <div className="aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden relative">
                                        <img
                                            src={logo.previewUrl || logo.preview}
                                            alt={logo.name}
                                            className="w-full h-full object-cover"
                                        />
                                        {/* Firma ismi logo üzerine bindirilmiş */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <h3 
                                                className="text-white font-bold text-2xl drop-shadow-lg" 
                                                style={{ 
                                                    fontFamily: getRandomFont(),
                                                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                                                }}
                                            >
                                                {location.state?.formData?.companyName || 'Company Name'}
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <h3 className="font-semibold text-gray-900" style={{ fontFamily: getRandomFont() }}>
                                                {location.state?.formData?.companyName || 'Company Name'}
                                            </h3>
                                            {logo.industry && (
                                                <p className="text-xs text-gray-500 capitalize">{logo.industry}</p>
                                            )}
                                        </div>
                                        {selectedLogo?.id === logo.id && (
                                            <CheckCircle className="w-5 h-5 text-blue-600" />
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">{logo.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    {selectedLogo && (
                        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Selected Logo: {selectedLogo.name}
                                    </h3>
                                    <p className="text-gray-600">{selectedLogo.description}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button variant="outline" size="sm">
                                        <Heart className="w-4 h-4 mr-2" />
                                        Like
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        <Share2 className="w-4 h-4 mr-2" />
                                        Share
                                    </Button>
                                </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    onClick={handleEdit}
                                    className="flex items-center"
                                >
                                    <Edit3 className="w-4 h-4 mr-2" />
                                    Edit
                                </Button>
                                <Button
                                    onClick={handleDownload}
                                    variant="outline"
                                    className="flex items-center"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download Preview
                                </Button>
                                <Button
                                    onClick={handlePurchase}
                                    className="flex items-center bg-blue-600 hover:bg-blue-700"
                                >
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Purchase Brand Kit
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Package Info */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            What's Included in Your Brand Kit?
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">5 Logo Variations</p>
                                    <p className="text-sm text-gray-600">PNG, SVG, PDF</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                    <div className="w-4 h-4 bg-green-600 rounded"></div>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Color Palette</p>
                                    <p className="text-sm text-gray-600">HEX, RGB, CMYK</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <span className="text-purple-600 font-bold text-sm">Aa</span>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Font Selection</p>
                                    <p className="text-sm text-gray-600">Web & Print</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <div className="w-4 h-4 bg-orange-600 rounded-sm"></div>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Brand Guidelines</p>
                                    <p className="text-sm text-gray-600">Usage Rules</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogoResults; 