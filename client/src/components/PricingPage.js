import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    CheckCircle, 
    Download, 
    FileText, 
    Palette, 
    Smartphone,
    Monitor,
    CreditCard,
    Heart,
    Sparkles,
    Shield,
    Zap
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

const PricingPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { selectedLogo, formData, customizations } = location.state || {};

    const packageFeatures = [
        {
            icon: <Download className="w-5 h-5" />,
            title: "Yüksek Kaliteli Logo Dosyaları",
            description: "PNG, SVG, JPG formatlarında tüm boyutlarda"
        },
        {
            icon: <Palette className="w-5 h-5" />,
            title: "Renk Varyasyonları",
            description: "Farklı renk kombinasyonları ile logo seti"
        },
        {
            icon: <FileText className="w-5 h-5" />,
            title: "Marka Kılavuzu",
            description: "Logo kullanım kuralları ve marka rehberi"
        },
        {
            icon: <Smartphone className="w-5 h-5" />,
            title: "Sosyal Medya Paketi",
            description: "Facebook, Instagram, LinkedIn için optimize edilmiş"
        },
        {
            icon: <CreditCard className="w-5 h-5" />,
            title: "Kartvizit Tasarımı",
            description: "Profesyonel kartvizit şablonu"
        },
        {
            icon: <Monitor className="w-5 h-5" />,
            title: "Web Sitesi Dosyaları",
            description: "Header, favicon ve web kullanımı için"
        },
        {
            icon: <Shield className="w-5 h-5" />,
            title: "Telif Hakkı Garantisi",
            description: "%100 özgün tasarım garantisi"
        },
        {
            icon: <Zap className="w-5 h-5" />,
            title: "Hızlı Teslimat",
            description: "Anında indirme, hiç bekleme yok"
        }
    ];

    const handlePurchase = () => {
        // Ödeme işlemi simülasyonu
        navigate('/payment-success', { 
            state: { 
                selectedLogo,
                formData,
                customizations 
            } 
        });
    };

    const handleBack = () => {
        navigate('/logo-editor', { 
            state: { 
                selectedLogo,
                formData,
                customizations 
            } 
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="ghost"
                                onClick={handleBack}
                                className="flex items-center space-x-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Geri</span>
                            </Button>
                            <div className="h-6 w-px bg-gray-300"></div>
                            <h1 className="text-lg font-semibold text-gray-900">Marka Kitini Satın Al</h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Seçilen Logo Önizleme */}
                {selectedLogo && (
                    <Card className="mb-8">
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <img 
                                        src={selectedLogo.previewUrl} 
                                        alt="Selected Logo"
                                        className="w-16 h-16 object-contain"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {formData?.companyName || 'Şirket Adı'} Logo Tasarımı
                                    </h3>
                                    <p className="text-gray-600">
                                        {selectedLogo.industry && `${selectedLogo.industry} sektörü için özel tasarım`}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Ana Paket */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Profesyonel Marka Kiti
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Tüm ihtiyaçlarınızı karşılayan kapsamlı marka paketi. 
                        Tek seferlik ödeme, sınırsız kullanım.
                    </p>
                    
                    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
                        <div className="mb-6">
                            <div className="text-6xl font-bold text-blue-600 mb-2">₺299</div>
                            <div className="text-gray-500">Tek seferlik ödeme</div>
                        </div>
                        
                        <div className="space-y-4 mb-8">
                            <div className="flex items-center justify-center space-x-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span className="text-gray-700">Sınırsız kullanım hakkı</span>
                            </div>
                            <div className="flex items-center justify-center space-x-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span className="text-gray-700">Anında indirme</span>
                            </div>
                            <div className="flex items-center justify-center space-x-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span className="text-gray-700">Telif hakkı garantisi</span>
                            </div>
                        </div>

                        <Button 
                            onClick={handlePurchase}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3"
                        >
                            <Sparkles className="w-5 h-5 mr-2" />
                            Şimdi Satın Al
                        </Button>
                    </div>
                </div>

                {/* Özellikler */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {packageFeatures.map((feature, index) => (
                        <Card key={index}>
                            <CardContent className="p-6">
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <div className="text-blue-600">
                                            {feature.icon}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">
                                            {feature.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Güvenlik ve Garanti */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-6">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Shield className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                %100 Güvenli Ödeme
                            </h3>
                            <p className="text-gray-600 mb-4">
                                SSL şifreli güvenli ödeme sistemi. 
                                Kredi kartı bilgileriniz hiçbir zaman saklanmaz.
                            </p>
                            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                                <span>🔒 SSL Güvenli</span>
                                <span>💳 Güvenli Ödeme</span>
                                <span>🛡️ Veri Koruması</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default PricingPage; 