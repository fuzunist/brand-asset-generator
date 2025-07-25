import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Sparkles, 
    Palette,
    Type,
    Download,
    CheckCircle,
    Star,
    Users,
    Zap,
    ArrowRight,
    Play
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';

const LandingPage = () => {
    const [companyName, setCompanyName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleStart = () => {
        if (companyName.trim()) {
            setIsLoading(true);
            // Logo oluşturma sürecine yönlendir
            setTimeout(() => {
                navigate('/logo-creator', { 
                    state: { companyName: companyName.trim() } 
                });
            }, 500);
        }
    };

    const features = [
        {
            icon: <Sparkles className="h-6 w-6 text-blue-500" />,
            title: "AI Logo Tasarımı",
            description: "Yapay zeka ile saniyeler içinde profesyonel logo tasarımları"
        },
        {
            icon: <Palette className="h-6 w-6 text-blue-500" />,
            title: "Marka Kiti",
            description: "Logo, renk paleti, font ve tüm marka varlıkları"
        },
        {
            icon: <Download className="h-6 w-6 text-blue-500" />,
            title: "Hazır Dosyalar",
            description: "Tüm formatlarda (PNG, SVG, PDF) indirime hazır"
        }
    ];

    const testimonials = [
        {
            name: "Ahmet Yılmaz",
            company: "TechStart",
            text: "5 dakikada profesyonel logo oluşturdum. Harika sonuç!",
            rating: 5
        },
        {
            name: "Ayşe Kaya",
            company: "DesignCo",
            text: "Ajans fiyatının 1/10'u, aynı kalite. Çok memnunum.",
            rating: 5
        },
        {
            name: "Mehmet Demir",
            company: "Freelancer",
            text: "Müşterilerim için hızlı logo çözümü buldum.",
            rating: 5
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b border-gray-100">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">Ficonica</span>
                        </div>
                        <nav className="hidden md:flex items-center space-x-8">
                            <a href="#features" className="text-gray-600 hover:text-blue-600">Özellikler</a>
                            <a href="#pricing" className="text-gray-600 hover:text-blue-600">Fiyatlandırma</a>
                            <a href="#faq" className="text-gray-600 hover:text-blue-600">SSS</a>
                            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">Giriş Yap</Link>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="py-20 md:py-32">
                <div className="container mx-auto px-4 text-center">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                            AI ile <span className="text-blue-600">Logo</span> ve <span className="text-blue-600">Marka Kiti</span> Oluşturun
                        </h1>
                        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
                            Şirket adınızı girin, yapay zeka sizin için profesyonel logo tasarımları ve tam marka kiti oluştursun.
                        </p>

                        {/* Main CTA - Zoviz style */}
                        <div className="max-w-md mx-auto mb-12">
                            <div className="bg-white border-2 border-gray-200 rounded-xl p-2 shadow-lg">
                                <div className="flex items-center">
                                    <Input
                                        type="text"
                                        placeholder="Şirket adınızı girin..."
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        className="border-0 text-lg py-4 px-4 focus:ring-0 focus:outline-none"
                                        onKeyPress={(e) => e.key === 'Enter' && handleStart()}
                                    />
                                    <Button
                                        onClick={handleStart}
                                        disabled={!companyName.trim() || isLoading}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold ml-2"
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Oluşturuluyor...
                                            </div>
                                        ) : (
                                            <div className="flex items-center">
                                                Başla
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </div>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Demo Video */}
                        <div className="mb-16">
                            <div className="bg-gray-100 rounded-xl p-8 max-w-2xl mx-auto">
                                <div className="flex items-center justify-center mb-4">
                                    <Play className="w-8 h-8 text-blue-600" />
                                </div>
                                <p className="text-gray-600">Nasıl çalıştığını görün</p>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                            {features.map((feature, index) => (
                                <Card key={index} className="border-0 shadow-lg">
                                    <CardContent className="p-6 text-center">
                                        <div className="flex justify-center mb-4">
                                            {feature.icon}
                                        </div>
                                        <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                                        <p className="text-gray-600">{feature.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Social Proof */}
                        <div className="mb-16">
                            <p className="text-gray-600 mb-8">Binlerce girişimci tarafından güvenle kullanılıyor</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {testimonials.map((testimonial, index) => (
                                    <Card key={index} className="border-0 shadow-lg">
                                        <CardContent className="p-6">
                                            <div className="flex items-center mb-3">
                                                {[...Array(testimonial.rating)].map((_, i) => (
                                                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                                                ))}
                                            </div>
                                            <p className="text-gray-700 mb-3">"{testimonial.text}"</p>
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                                    <Users className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm">{testimonial.name}</p>
                                                    <p className="text-gray-500 text-sm">{testimonial.company}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* Pricing Preview */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 max-w-2xl mx-auto">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Tek Paket, Tam Çözüm</h2>
                            <div className="text-4xl font-bold text-blue-600 mb-2">₺299</div>
                            <p className="text-gray-600 mb-6">Tek seferlik ödeme, sınırsız kullanım</p>
                            <div className="space-y-2 text-left">
                                <div className="flex items-center">
                                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                                    <span>5 farklı logo tasarımı</span>
                                </div>
                                <div className="flex items-center">
                                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                                    <span>Tam marka kiti (renk, font, kullanım kılavuzu)</span>
                                </div>
                                <div className="flex items-center">
                                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                                    <span>Tüm formatlarda dosyalar (PNG, SVG, PDF)</span>
                                </div>
                                <div className="flex items-center">
                                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                                    <span>Kartvizit, antetli kağıt şablonları</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-100 py-12">
                <div className="container mx-auto px-4">
                    <div className="text-center">
                        <div className="flex items-center justify-center space-x-2 mb-4">
                            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-lg font-bold text-gray-900">Ficonica</span>
                        </div>
                        <p className="text-gray-600 mb-4">AI destekli logo ve marka kiti oluşturma platformu</p>
                        <div className="flex justify-center space-x-6 text-sm text-gray-500">
                            <a href="#" className="hover:text-blue-600">Gizlilik</a>
                            <a href="#" className="hover:text-blue-600">Kullanım Şartları</a>
                            <a href="#" className="hover:text-blue-600">İletişim</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage; 