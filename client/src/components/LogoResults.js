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
    CheckCircle,
    Palette,
    Image,
    Type
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import BrandingMockup from './BrandingMockup';

const LogoResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [selectedLogo, setSelectedLogo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [logos, setLogos] = useState([]);
    const [finalLogo, setFinalLogo] = useState(null);
    const [showFinalPreview, setShowFinalPreview] = useState(false);

    // Farklı fontlar için array
    const fonts = [
        // Sans-serif
        'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Raleway', 'Nunito', 
        'Source Sans Pro', 'Ubuntu', 'Inter', 'Work Sans', 'Rubik', 'Karla', 'Barlow',
        
        // Serif
        'Merriweather', 'Playfair Display', 'Lora', 'PT Serif', 'Crimson Text', 
        'Domine', 'Bitter', 'Vollkorn', 'Arvo', 'Josefin Sans', 'Comfortaa',
        
        // Display
        'Oswald', 'Anton', 'Bebas Neue', 'Teko', 'Abril Fatface', 'Alfa Slab One', 
        'Lobster', 'Passion One', 'Fredoka One', 'Righteous', 'Ultra',
        
        // Handwriting
        'Dancing Script', 'Pacifico', 'Caveat', 'Satisfy', 'Great Vibes', 'Sacramento',
        'Indie Flower', 'Patrick Hand', 'Permanent Marker', 'Kaushan Script',

        // Monospace
        'Source Code Pro', 'Inconsolata', 'Roboto Mono', 'Space Mono', 'Cutive Mono', 'IBM Plex Mono'
    ];

    const getRandomFont = () => {
        return fonts[Math.floor(Math.random() * fonts.length)];
    };

    useEffect(() => {
        const loadLogos = async () => {
            try {
                let initialLogos = [];
                // Önce location state'den logo verilerini kontrol et
                if (location.state?.logos && location.state.logos.length > 0) {
                    initialLogos = location.state.logos;
                }
                // Eğer location state'de logo yoksa, form verilerine göre getir
                else if (location.state?.formData) {
                    const { LogoService } = await import('../services/logoService');
                    const fetchedLogos = await LogoService.getAllPublishedLogos(20);

                    // Eğer Firebase'den logo gelmezse mock verileri kullan
                    if (!fetchedLogos || fetchedLogos.length === 0) {
                        initialLogos = LogoService.getMockLogos('technology');
                    } else {
                        initialLogos = fetchedLogos;
                    }
                } else {
                    // Hiçbir veri yoksa mock logoları göster
                    const { LogoService } = await import('../services/logoService');
                    initialLogos = LogoService.getMockLogos('technology');
                }

                const logosWithStyles = initialLogos.map(logo => ({
                    ...logo,
                    brandColor: getRandomColor(),
                    logoFont: getRandomFont()
                }));
                setLogos(logosWithStyles);

            } catch (error) {
                console.error('Logo yükleme hatası:', error);
                // Hata durumunda mock verileri kullan
                const { LogoService } = await import('../services/logoService');
                const mockLogos = LogoService.getMockLogos('technology');
                const logosWithStyles = mockLogos.map(logo => ({
                    ...logo,
                    brandColor: getRandomColor(),
                    logoFont: getRandomFont()
                }));
                setLogos(logosWithStyles);
            } finally {
                setIsLoading(false);
            }
        };

        loadLogos();
    }, [location.state]);

    const handleLogoSelect = (logo) => {
        setSelectedLogo(logo);
    };

    const handleEdit = (logo) => {
        navigate('/logo-editor', {
            state: {
                selectedLogo: logo,
                formData: location.state?.formData
            }
        });
    };

    const handleDownload = () => {
        // Logo indirme işlemi
        alert('Logo indirme özelliği yakında eklenecek!');
    };

    const handlePurchase = (logo) => {
        navigate('/pricing', {
            state: {
                selectedLogo: logo,
                formData: location.state?.formData
            }
        });
    };

    // Final logo oluşturma fonksiyonları
    const handleLikeColor = (logo, brandColor) => {
        setFinalLogo(prev => ({
            logo: prev?.logo || logo,
            color: brandColor,
            font: prev?.font || logo.logoFont,
            companyName: location.state?.formData?.companyName || 'Company Name'
        }));
        setShowFinalPreview(true);
    };

    const handleLikeIcon = (logo, brandColor) => {
        setFinalLogo(prev => ({
            logo: logo,
            color: prev?.color || brandColor,
            font: prev?.font || logo.logoFont,
            companyName: location.state?.formData?.companyName || 'Company Name'
        }));
        setShowFinalPreview(true);
    };

    const handleLikeFont = (logo, brandColor, logoFont) => {
        setFinalLogo(prev => ({
            logo: prev?.logo || logo,
            color: prev?.color || brandColor,
            font: logoFont,
            companyName: location.state?.formData?.companyName || 'Company Name'
        }));
        setShowFinalPreview(true);
    };

    const closeFinalPreview = () => {
        setShowFinalPreview(false);
        setFinalLogo(null);
    };

    // Rastgele renk oluşturma fonksiyonu
    const getRandomColor = () => {
        return `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
    };

    // Mockup Preview Component for each logo
    const MockupPreview = ({ logo, companyName, brandColor, logoFont }) => {
        const fontSize = 1; // Base font size, adjust as needed

        return (
            <div className="bg-gray-800 p-6 rounded-lg grid grid-cols-2 gap-4">
                {/* Large white card */}
                <div className="bg-white rounded-lg p-3 w-full h-24 flex items-center justify-center shadow-lg">
                    <div className="logo flex items-center gap-2">
                        <div
                            className="w-8 h-8"
                            style={{
                                background: brandColor,
                                maskImage: `url(${logo.previewUrl || logo.preview})`,
                                WebkitMaskImage: `url(${logo.previewUrl || logo.preview})`,
                                maskSize: 'contain',
                                WebkitMaskSize: 'contain',
                                maskRepeat: 'no-repeat',
                                WebkitMaskRepeat: 'no-repeat',
                                maskPosition: 'center',
                                WebkitMaskPosition: 'center',
                            }}
                        ></div>
                        <span 
                            className="font-bold text-2xl"
                            style={{
                                color: brandColor,
                                fontFamily: logoFont
                            }}
                        >
                            {companyName}
                        </span>
                    </div>
                </div>

                {/* Vertical colored card */}
                <div 
                    className="rounded-lg p-3 w-full h-24 flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: brandColor }}
                >
                    <div className="logo flex flex-col items-center gap-2 text-white">
                        <div
                            className="w-8 h-8"
                            style={{
                                background: 'white',
                                maskImage: `url(${logo.previewUrl || logo.preview})`,
                                WebkitMaskImage: `url(${logo.previewUrl || logo.preview})`,
                                maskSize: 'contain',
                                WebkitMaskSize: 'contain',
                                maskRepeat: 'no-repeat',
                                WebkitMaskRepeat: 'no-repeat',
                                maskPosition: 'center',
                                WebkitMaskPosition: 'center',
                            }}
                        ></div>
                        <span 
                            className="font-bold text-lg"
                            style={{
                                fontFamily: logoFont
                            }}
                        >
                            {companyName}
                        </span>
                    </div>
                </div>

                {/* Large colored card */}
                <div 
                    className="rounded-lg p-3 w-full h-24 flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: brandColor }}
                >
                    <div className="logo flex items-center gap-2 text-white">
                        <div
                            className="w-8 h-8"
                            style={{
                                background: 'white',
                                maskImage: `url(${logo.previewUrl || logo.preview})`,
                                WebkitMaskImage: `url(${logo.previewUrl || logo.preview})`,
                                maskSize: 'contain',
                                WebkitMaskSize: 'contain',
                                maskRepeat: 'no-repeat',
                                WebkitMaskRepeat: 'no-repeat',
                                maskPosition: 'center',
                                WebkitMaskPosition: 'center',
                            }}
                        ></div>
                        <span 
                            className="font-bold text-2xl"
                            style={{
                                fontFamily: logoFont
                            }}
                        >
                            {companyName}
                        </span>
                    </div>
                </div>

                {/* Small white card with colored text */}
                <div className="bg-white rounded-lg p-3 w-full h-24 flex items-center justify-center shadow-lg">
                    <div className="logo flex items-center gap-1">
                        <div
                            className="w-6 h-6"
                            style={{
                                background: brandColor,
                                maskImage: `url(${logo.previewUrl || logo.preview})`,
                                WebkitMaskImage: `url(${logo.previewUrl || logo.preview})`,
                                maskSize: 'contain',
                                WebkitMaskSize: 'contain',
                                maskRepeat: 'no-repeat',
                                WebkitMaskRepeat: 'no-repeat',
                                maskPosition: 'center',
                                WebkitMaskPosition: 'center',
                            }}
                        ></div>
                        <span 
                            className="font-bold text-xl"
                            style={{
                                color: brandColor,
                                fontFamily: logoFont
                            }}
                        >
                            {companyName}
                        </span>
                    </div>
                </div>
            </div>
        );
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
            {/* Floating Final Logo Preview */}
            {showFinalPreview && finalLogo && (
                <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 w-96">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">Final Logo Preview</h3>
                        <button
                            onClick={closeFinalPreview}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 mb-3">
                        <div className="flex flex-col items-center">
                            <div
                                className="w-16 h-16 object-contain mb-3"
                                style={{
                                    background: finalLogo.color,
                                    maskImage: `url(${finalLogo.logo.previewUrl || finalLogo.logo.preview})`,
                                    WebkitMaskImage: `url(${finalLogo.logo.previewUrl || finalLogo.logo.preview})`,
                                    maskSize: 'contain',
                                    WebkitMaskSize: 'contain',
                                    maskRepeat: 'no-repeat',
                                    WebkitMaskRepeat: 'no-repeat',
                                    maskPosition: 'center',
                                    WebkitMaskPosition: 'center',
                                }}
                            ></div>
                            <h4 
                                className="font-bold text-xl text-center"
                                style={{ 
                                    fontFamily: finalLogo.font,
                                    color: finalLogo.color
                                }}
                            >
                                {finalLogo.companyName}
                            </h4>
                        </div>
                    </div>
                    
                    <div className="final-preview-grid grid grid-cols-3 gap-4">
                            {/* Card 1: White BG, Color Logo */}
                            <div className="bg-white rounded-lg p-4 flex items-center justify-center border">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6" style={{ background: finalLogo.color, maskImage: `url(${finalLogo.logo.previewUrl})`, WebkitMaskImage: `url(${finalLogo.logo.previewUrl})`, maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskPosition: 'center' }}></div>
                                    <span style={{ color: finalLogo.color, fontFamily: finalLogo.font, fontSize: '1rem' }}>{finalLogo.companyName}</span>
                                </div>
                            </div>
                             {/* Card 2: Color BG, White Logo */}
                            <div className="rounded-lg p-4 flex items-center justify-center" style={{ backgroundColor: finalLogo.color }}>
                                 <div className="flex items-center gap-2">
                                    <div className="w-6 h-6" style={{ background: 'white', maskImage: `url(${finalLogo.logo.previewUrl})`, WebkitMaskImage: `url(${finalLogo.logo.previewUrl})`, maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskPosition: 'center' }}></div>
                                    <span style={{ color: 'white', fontFamily: finalLogo.font, fontSize: '1rem' }}>{finalLogo.companyName}</span>
                                </div>
                            </div>
                             {/* Card 3: Dark BG, Color Logo */}
                            <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-center">
                                 <div className="flex items-center gap-2">
                                    <div className="w-6 h-6" style={{ background: finalLogo.color, maskImage: `url(${finalLogo.logo.previewUrl})`, WebkitMaskImage: `url(${finalLogo.logo.previewUrl})`, maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskPosition: 'center' }}></div>
                                    <span style={{ color: finalLogo.color, fontFamily: finalLogo.font, fontSize: '1rem' }}>{finalLogo.companyName}</span>
                                </div>
                            </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-2">
                        <Button variant="outline" onClick={closeFinalPreview}>Kapat</Button>
                        <Button onClick={() => handlePurchase(finalLogo.logo)}>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Beğendim, Devam Et
                        </Button>
                    </div>
                </div>
            )}

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

                    {/* Logo Cards - One per row, horizontal layout */}
                    <div className="space-y-6">
                        {logos.map((logo) => {
                            const logoStyle = {
                                background: logo.brandColor,
                                maskImage: `url(${logo.previewUrl || logo.preview})`,
                                WebkitMaskImage: `url(${logo.previewUrl || logo.preview})`,
                                maskSize: 'contain',
                                WebkitMaskSize: 'contain',
                                maskRepeat: 'no-repeat',
                                WebkitMaskRepeat: 'no-repeat',
                                maskPosition: 'center',
                                WebkitMaskPosition: 'center'
                            };
                            return (
                                <Card
                                    key={logo.id}
                                    className={`cursor-pointer transition-all hover:shadow-lg bg-white ${
                                        selectedLogo?.id === logo.id
                                            ? 'ring-2 ring-blue-500 shadow-lg'
                                            : 'hover:shadow-md'
                                    }`}
                                    onClick={() => handleLogoSelect(logo)}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex flex-col lg:flex-row gap-6">
                                                                                    {/* Left Side - Logo */}
                                        <div className="lg:w-1/2">
                                            <div className="flex flex-col items-center justify-center h-full">
                                                {/* Logo and Company Name Combined */}
                                                <div className="w-full h-[32rem] bg-white rounded-lg flex flex-col items-center justify-center p-4 border border-gray-200 mb-4">
                                                    {/* Logo Icon */}
                                                    <div className="mb-2">
                                                        <div
                                                            className="w-56 h-56"
                                                            style={logoStyle}
                                                        ></div>
                                                    </div>
                                                    
                                                    {/* Company Name */}
                                                    <h3 
                                                        className="font-bold text-6xl text-center leading-tight" 
                                                        style={{ 
                                                            fontFamily: logo.logoFont,
                                                            color: logo.brandColor
                                                        }}
                                                    >
                                                        {location.state?.formData?.companyName || 'Company Name'}
                                                    </h3>
                                                </div>

                                                {/* Selection Indicator */}
                                                {selectedLogo?.id === logo.id && (
                                                    <div className="flex items-center justify-center mb-4">
                                                        <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                                                        <span className="text-blue-600 font-medium">Selected</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                            {/* Right Side - Mockup Preview */}
                                            <div className="lg:w-1/2">
                                                <div className="space-y-4">
                                                    <h4 className="text-lg font-semibold text-gray-900">
                                                        Mockup Preview
                                                    </h4>
                                                    
                                                    {/* Alternating Mockup Previews */}
                                                    {logos.indexOf(logo) % 2 === 0 ? (
                                                        <MockupPreview 
                                                            logo={logo}
                                                            companyName={location.state?.formData?.companyName || 'Company Name'}
                                                            brandColor={logo.brandColor}
                                                            logoFont={logo.logoFont}
                                                        />
                                                    ) : (
                                                        <BrandingMockup 
                                                            logo={logo}
                                                            companyName={location.state?.formData?.companyName || 'Company Name'}
                                                            brandColor={logo.brandColor}
                                                            logoFont={logo.logoFont}
                                                        />
                                                    )}
                                                    
                                                    {/* Like Buttons */}
                                                    <div className="flex flex-wrap gap-2 pt-4">
                                                        <Button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleLikeColor(logo, logo.brandColor);
                                                            }}
                                                            variant="outline"
                                                            size="sm"
                                                            className="flex-1 min-w-0"
                                                        >
                                                            <Palette className="w-3 h-3 mr-1" />
                                                            Rengi Beğendim
                                                        </Button>
                                                        <Button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleLikeIcon(logo, logo.brandColor);
                                                            }}
                                                            variant="outline"
                                                            size="sm"
                                                            className="flex-1 min-w-0"
                                                        >
                                                            <Image className="w-3 h-3 mr-1" />
                                                            İkonu Beğendim
                                                        </Button>
                                                        <Button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleLikeFont(logo, logo.brandColor, logo.logoFont);
                                                            }}
                                                            variant="outline"
                                                            size="sm"
                                                            className="flex-1 min-w-0"
                                                        >
                                                            <Type className="w-3 h-3 mr-1" />
                                                            Fontu Beğendim
                                                        </Button>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                                        <Button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEdit(logo);
                                                            }}
                                                            className="flex-1"
                                                        >
                                                            <Edit3 className="w-4 h-4 mr-2" />
                                                            Customize Logo
                                                        </Button>
                                                        <Button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handlePurchase(logo);
                                                            }}
                                                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                                                        >
                                                            <Sparkles className="w-4 h-4 mr-2" />
                                                            Get Logo & Brand Kit
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Package Info */}
                    <div className="bg-white rounded-lg p-6 mt-8">
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