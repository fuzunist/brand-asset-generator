import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    ArrowRight, 
    Palette, 
    Type, 
    Sparkles,
    CheckCircle,
    Loader2
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

const LogoCreator = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [formData, setFormData] = useState({
        companyName: location.state?.companyName || '',
        slogan: '',
        industry: '',
        colorPreference: '',
        stylePreference: '',
        keywords: ''
    });

    const industries = [
        'Teknoloji', 'Sağlık', 'Eğitim', 'Finans', 'E-ticaret', 
        'Gıda & İçecek', 'Moda', 'Spor', 'Sanat', 'Hukuk',
        'Mimarlık', 'Danışmanlık', 'Üretim', 'Turizm', 'Diğer'
    ];

    const colorOptions = [
        { name: 'Mavi', value: 'blue', color: '#3B82F6' },
        { name: 'Yeşil', value: 'green', color: '#10B981' },
        { name: 'Kırmızı', value: 'red', color: '#EF4444' },
        { name: 'Mor', value: 'purple', color: '#8B5CF6' },
        { name: 'Turuncu', value: 'orange', color: '#F97316' },
        { name: 'Pembe', value: 'pink', color: '#EC4899' },
        { name: 'Siyah', value: 'black', color: '#111827' },
        { name: 'Gri', value: 'gray', color: '#6B7280' }
    ];

    const styleOptions = [
        { name: 'Modern & Minimalist', description: 'Temiz ve basit tasarım' },
        { name: 'Klasik & Profesyonel', description: 'Geleneksel ve güvenilir' },
        { name: 'Yaratıcı & Renkli', description: 'Enerjik ve dikkat çekici' },
        { name: 'Teknolojik & Gelecekçi', description: 'İnovasyon odaklı' },
        { name: 'Doğal & Organik', description: 'Sıcak ve samimi' }
    ];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleNext = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            // Firebase'den logoları getir
            const { LogoService } = await import('../services/logoService');
            
            let logos;
            if (formData.industry) {
                // Sektöre göre logoları getir
                logos = await LogoService.getLogosByIndustry(formData.industry, 10);
            } else if (formData.keywords) {
                // Anahtar kelimelere göre logoları getir
                const keywords = formData.keywords.split(',').map(k => k.trim());
                logos = await LogoService.getLogosByKeywords(keywords, 10);
            } else {
                // Tüm logoları getir
                logos = await LogoService.getAllPublishedLogos(10);
            }

            // Eğer Firebase'den logo gelmezse mock verileri kullan
            if (!logos || logos.length === 0) {
                logos = LogoService.getMockLogos(formData.industry || 'teknoloji');
            }

            navigate('/logo-results', { 
                state: { 
                    formData,
                    logos 
                } 
            });
        } catch (error) {
            console.error('Logo getirme hatası:', error);
            // Hata durumunda mock verileri kullan
            const { LogoService } = await import('../services/logoService');
            const logos = LogoService.getMockLogos(formData.industry || 'teknoloji');
            
            navigate('/logo-results', { 
                state: { 
                    formData,
                    logos 
                } 
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="max-w-2xl mx-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Şirket Bilgileri</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Şirket Adı *
                                </label>
                                <Input
                                    type="text"
                                    value={formData.companyName}
                                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                                    placeholder="Şirket adınızı girin"
                                    className="text-lg py-3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Slogan (Opsiyonel)
                                </label>
                                <Input
                                    type="text"
                                    value={formData.slogan}
                                    onChange={(e) => handleInputChange('slogan', e.target.value)}
                                    placeholder="Örn: Geleceği Şekillendiriyoruz"
                                    className="py-3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sektör *
                                </label>
                                <select
                                    value={formData.industry}
                                    onChange={(e) => handleInputChange('industry', e.target.value)}
                                    className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Sektörünüzü seçin</option>
                                    {industries.map(industry => (
                                        <option key={industry} value={industry}>{industry}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="max-w-2xl mx-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Renk Tercihleri</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-4">
                                    Ana Renk Tercihiniz *
                                </label>
                                <div className="grid grid-cols-4 gap-4">
                                    {colorOptions.map(color => (
                                        <div
                                            key={color.value}
                                            className={`cursor-pointer rounded-lg p-4 border-2 transition-all ${
                                                formData.colorPreference === color.value
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                            onClick={() => handleInputChange('colorPreference', color.value)}
                                        >
                                            <div
                                                className="w-full h-8 rounded mb-2"
                                                style={{ backgroundColor: color.color }}
                                            ></div>
                                            <p className="text-sm font-medium text-center">{color.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="max-w-2xl mx-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Stil Tercihleri</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-4">
                                    Logo Stili *
                                </label>
                                <div className="space-y-3">
                                    {styleOptions.map(style => (
                                        <div
                                            key={style.name}
                                            className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                                                formData.stylePreference === style.name
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                            onClick={() => handleInputChange('stylePreference', style.name)}
                                        >
                                            <h3 className="font-semibold text-gray-900">{style.name}</h3>
                                            <p className="text-sm text-gray-600">{style.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="max-w-2xl mx-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Logo İkonları</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Logo İkonları İçin Anahtar Kelimeler
                                </label>
                                <Textarea
                                    value={formData.keywords}
                                    onChange={(e) => handleInputChange('keywords', e.target.value)}
                                    placeholder="Örn: teknoloji, inovasyon, güven, hız, kalite, profesyonel"
                                    className="py-3"
                                    rows={4}
                                />
                                <p className="text-sm text-gray-500 mt-2">
                                    Logo tasarımında kullanılacak sembol ve ikonlar için anahtar kelimeler girin
                                </p>
                            </div>
                            
                            <div className="bg-blue-50 rounded-lg p-4">
                                <h3 className="font-semibold text-blue-900 mb-2">Özet</h3>
                                <div className="space-y-1 text-sm text-blue-800">
                                    <p><strong>Şirket:</strong> {formData.companyName}</p>
                                    <p><strong>Sektör:</strong> {formData.industry}</p>
                                    <p><strong>Renk:</strong> {colorOptions.find(c => c.value === formData.colorPreference)?.name}</p>
                                    <p><strong>Stil:</strong> {formData.stylePreference}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    const steps = [
        { number: 1, title: 'Şirket Bilgileri', icon: Type },
        { number: 2, title: 'Renk Tercihleri', icon: Palette },
        { number: 3, title: 'Stil Tercihleri', icon: Sparkles },
        { number: 4, title: 'Logo İkonları', icon: CheckCircle }
    ];

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

            {/* Progress Steps */}
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between max-w-4xl mx-auto">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = currentStep === step.number;
                            const isCompleted = currentStep > step.number;
                            
                            return (
                                <div key={step.number} className="flex items-center">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                                        isActive 
                                            ? 'border-blue-500 bg-blue-500 text-white'
                                            : isCompleted
                                            ? 'border-green-500 bg-green-500 text-white'
                                            : 'border-gray-300 bg-white text-gray-400'
                                    }`}>
                                        {isCompleted ? (
                                            <CheckCircle className="w-5 h-5" />
                                        ) : (
                                            <Icon className="w-5 h-5" />
                                        )}
                                    </div>
                                    <div className="ml-3">
                                        <p className={`text-sm font-medium ${
                                            isActive ? 'text-blue-600' : 'text-gray-500'
                                        }`}>
                                            {step.title}
                                        </p>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className={`w-16 h-0.5 mx-4 ${
                                            isCompleted ? 'bg-green-500' : 'bg-gray-300'
                                        }`}></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {renderStep()}
                    
                    {/* Navigation */}
                    <div className="flex justify-between items-center mt-12">
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            disabled={currentStep === 1}
                            className="flex items-center"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Geri
                        </Button>
                        
                        {currentStep < 4 ? (
                            <Button
                                onClick={handleNext}
                                disabled={
                                    (currentStep === 1 && (!formData.companyName || !formData.industry)) ||
                                    (currentStep === 2 && !formData.colorPreference) ||
                                    (currentStep === 3 && !formData.stylePreference)
                                }
                                className="flex items-center"
                            >
                                İleri
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className="flex items-center bg-blue-600 hover:bg-blue-700"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Logo Oluşturuluyor...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Logo Oluştur
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogoCreator; 