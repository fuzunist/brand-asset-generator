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

                    {/* Logo Grid - Zoviz stilinde */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {logos.map((logo) => (
                            <Card
                                key={logo.id}
                                className={`cursor-pointer transition-all hover:shadow-lg bg-white ${
                                    selectedLogo?.id === logo.id
                                        ? 'ring-2 ring-blue-500 shadow-lg'
                                        : 'hover:scale-105'
                                }`}
                                onClick={() => handleLogoSelect(logo)}
                            >
                                <CardContent className="p-4">
                                    {/* Logo - Zoviz stilinde */}
                                    <div className="aspect-video bg-white rounded-lg mb-4 overflow-hidden flex items-center justify-center p-8 relative">
                                        <img
                                            src={logo.previewUrl || logo.preview}
                                            alt={logo.name}
                                            className="max-w-full max-h-full object-contain"
                                        />
                                        {selectedLogo?.id === logo.id && (
                                            <div className="absolute top-2 right-2">
                                                <CheckCircle className="w-6 h-6 text-blue-600 bg-white rounded-full" />
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Firma ismi - Logo altında ayrı */}
                                    <div className="text-center">
                                        <h3 
                                            className="text-gray-900 font-bold text-xl" 
                                            style={{ 
                                                fontFamily: getRandomFont()
                                            }}
                                        >
                                            {location.state?.formData?.companyName || 'Company Name'}
                                        </h3>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Selected Logo Preview - Zoviz stilinde */}
                    {selectedLogo && (
                        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Sol taraf - Büyük logo preview */}
                                <div className="flex flex-col items-center justify-center">
                                    <div className="w-64 h-64 bg-white rounded-lg flex items-center justify-center p-8 mb-6 border border-gray-200">
                                        <img
                                            src={selectedLogo.previewUrl || selectedLogo.preview}
                                            alt={selectedLogo.name}
                                            className="max-w-full max-h-full object-contain"
                                        />
                                    </div>
                                    <h3 
                                        className="text-gray-900 font-bold text-2xl text-center" 
                                        style={{ 
                                            fontFamily: getRandomFont()
                                        }}
                                    >
                                        {location.state?.formData?.companyName || 'Company Name'}
                                    </h3>
                                </div>
                                
                                {/* Sağ taraf - Action buttons */}
                                <div className="flex flex-col justify-center space-y-4">
                                    <div className="text-center lg:text-left">
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                            Selected Logo
                                        </h3>
                                        <p className="text-gray-600 mb-6">
                                            {selectedLogo.description || 'Professional logo design for your brand'}
                                        </p>
                                    </div>
                                    
                                    <div className="flex flex-col space-y-3">
                                        <Button
                                            onClick={handleEdit}
                                            className="flex items-center justify-center lg:justify-start"
                                        >
                                            <Edit3 className="w-4 h-4 mr-2" />
                                            Customize Logo
                                        </Button>
                                        <Button
                                            onClick={handlePurchase}
                                            className="flex items-center justify-center lg:justify-start bg-blue-600 hover:bg-blue-700"
                                        >
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            Get Logo & Brand Kit
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                    
                                    <div className="flex items-center justify-center lg:justify-start space-x-4 pt-4">
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
                            </div>
                        </div>
                    )}

                    {/* Package Info - Zoviz stilinde */}
                    <div className="bg-white rounded-lg p-6">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                                    <div className="w-6 h-6 bg-blue-600 rounded-sm"></div>
                                </div>
                                <p className="font-medium text-gray-900 text-sm">High Quality Logo Files</p>
                                <p className="text-xs text-gray-600">PNG, SVG, JPG</p>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                                    <div className="w-6 h-6 bg-green-600 rounded-full"></div>
                                </div>
                                <p className="font-medium text-gray-900 text-sm">Social Media Kit</p>
                                <p className="text-xs text-gray-600">Profiles & Covers</p>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                                    <div className="w-6 h-6 bg-purple-600 rounded-sm"></div>
                                </div>
                                <p className="font-medium text-gray-900 text-sm">Brand Stationery</p>
                                <p className="text-xs text-gray-600">Letterhead & More</p>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                                    <span className="text-orange-600 font-bold text-lg">C</span>
                                </div>
                                <p className="font-medium text-gray-900 text-sm">Customize Every Time</p>
                                <p className="text-xs text-gray-600">Colors, Fonts & More</p>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-3">
                                    <span className="text-red-600 font-bold text-lg">C</span>
                                </div>
                                <p className="font-medium text-gray-900 text-sm">Commercial Use</p>
                                <p className="text-xs text-gray-600">Lifetime License</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogoResults; 