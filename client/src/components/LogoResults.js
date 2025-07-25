import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    ArrowRight, 
    Download, 
    Edit3,
    Heart,
    Share2,
    CheckCircle,
    Sparkles
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

const LogoResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [selectedLogo, setSelectedLogo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Mock logo data - gerçek uygulamada API'den gelecek
    const [logos, setLogos] = useState([]);

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            const mockLogos = [
                {
                    id: 1,
                    name: 'Modern Minimalist',
                    preview: 'https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=Logo+1',
                    description: 'Temiz ve modern tasarım',
                    colors: ['#3B82F6', '#1E40AF'],
                    style: 'Modern'
                },
                {
                    id: 2,
                    name: 'Classic Professional',
                    preview: 'https://via.placeholder.com/300x200/10B981/FFFFFF?text=Logo+2',
                    description: 'Geleneksel ve güvenilir',
                    colors: ['#10B981', '#059669'],
                    style: 'Klasik'
                },
                {
                    id: 3,
                    name: 'Creative Bold',
                    preview: 'https://via.placeholder.com/300x200/8B5CF6/FFFFFF?text=Logo+3',
                    description: 'Yaratıcı ve dikkat çekici',
                    colors: ['#8B5CF6', '#7C3AED'],
                    style: 'Yaratıcı'
                },
                {
                    id: 4,
                    name: 'Tech Future',
                    preview: 'https://via.placeholder.com/300x200/F97316/FFFFFF?text=Logo+4',
                    description: 'Teknolojik ve gelecekçi',
                    colors: ['#F97316', '#EA580C'],
                    style: 'Teknolojik'
                },
                {
                    id: 5,
                    name: 'Elegant Simple',
                    preview: 'https://via.placeholder.com/300x200/EC4899/FFFFFF?text=Logo+5',
                    description: 'Zarif ve basit',
                    colors: ['#EC4899', '#DB2777'],
                    style: 'Zarif'
                }
            ];
            setLogos(mockLogos);
            setIsLoading(false);
        }, 2000);
    }, []);

    const handleLogoSelect = (logo) => {
        setSelectedLogo(logo);
    };

    const handleEdit = () => {
        if (selectedLogo) {
            navigate('/logo-editor', { 
                state: { 
                    logo: selectedLogo,
                    formData: location.state?.formData 
                } 
            });
        }
    };

    const handleDownload = () => {
        // Simulate download
        alert('Logo indiriliyor...');
    };

    const handlePurchase = () => {
        navigate('/pricing', { 
            state: { 
                selectedLogo,
                formData: location.state?.formData 
            } 
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Logo Tasarımları Oluşturuluyor</h2>
                    <p className="text-gray-600">Yapay zeka sizin için en iyi tasarımları hazırlıyor...</p>
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
                            onClick={() => navigate('/')}
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
                            {location.state?.formData?.companyName} için Logo Tasarımları
                        </h1>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Yapay zeka sizin için 5 farklı logo tasarımı oluşturdu. 
                            Beğendiğiniz tasarımı seçin ve marka kitinizi oluşturun.
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
                                    <div className="aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden">
                                        <img
                                            src={logo.preview}
                                            alt={logo.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-semibold text-gray-900">{logo.name}</h3>
                                        {selectedLogo?.id === logo.id && (
                                            <CheckCircle className="w-5 h-5 text-blue-600" />
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">{logo.description}</p>
                                    <div className="flex items-center space-x-2">
                                        {logo.colors.map((color, index) => (
                                            <div
                                                key={index}
                                                className="w-4 h-4 rounded-full border border-gray-200"
                                                style={{ backgroundColor: color }}
                                            ></div>
                                        ))}
                                    </div>
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
                                        Seçilen Logo: {selectedLogo.name}
                                    </h3>
                                    <p className="text-gray-600">{selectedLogo.description}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button variant="outline" size="sm">
                                        <Heart className="w-4 h-4 mr-2" />
                                        Beğen
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        <Share2 className="w-4 h-4 mr-2" />
                                        Paylaş
                                    </Button>
                                </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    onClick={handleEdit}
                                    className="flex items-center"
                                >
                                    <Edit3 className="w-4 h-4 mr-2" />
                                    Düzenle
                                </Button>
                                <Button
                                    onClick={handleDownload}
                                    variant="outline"
                                    className="flex items-center"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Önizleme İndir
                                </Button>
                                <Button
                                    onClick={handlePurchase}
                                    className="flex items-center bg-blue-600 hover:bg-blue-700"
                                >
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Marka Kitini Satın Al
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Package Info */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Marka Kitinizde Neler Var?
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">5 Logo Varyasyonu</p>
                                    <p className="text-sm text-gray-600">PNG, SVG, PDF</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                    <div className="w-4 h-4 bg-green-600 rounded"></div>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Renk Paleti</p>
                                    <p className="text-sm text-gray-600">HEX, RGB, CMYK</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <span className="text-purple-600 font-bold text-sm">Aa</span>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Font Seçimi</p>
                                    <p className="text-sm text-gray-600">Web & Print</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <div className="w-4 h-4 bg-orange-600 rounded-sm"></div>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Kullanım Kılavuzu</p>
                                    <p className="text-sm text-gray-600">PDF Rehber</p>
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