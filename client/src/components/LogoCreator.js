import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    Sparkles,
    Loader2
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

const LogoCreator = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isGenerating, setIsGenerating] = useState(false);
    const [formData, setFormData] = useState({
        companyName: location.state?.companyName || ''
    });

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            console.log('🔥 Firebase bağlantısı test ediliyor...');
            console.log('📝 Form verileri:', formData);
            
            // Firebase'den tüm logoları getir
            const { LogoService } = await import('../services/logoService');
            console.log('📋 Tüm yayınlanmış logolar getiriliyor...');
            const logos = await LogoService.getAllPublishedLogos(20);

            console.log('📊 Firebase\'den gelen logo sayısı:', logos?.length || 0);
            console.log('🎨 Logolar:', logos);

            // Eğer Firebase'den logo gelmezse mock verileri kullan
            if (!logos || logos.length === 0) {
                console.log('⚠️ Firebase\'den logo gelmedi, mock veriler kullanılıyor...');
                const mockLogos = LogoService.getMockLogos('technology');
                logos = mockLogos;
            }

            navigate('/logo-results', { 
                state: { 
                    formData,
                    logos 
                } 
            });
        } catch (error) {
            console.error('❌ Logo getirme hatası:', error);
            console.error('🔍 Hata detayları:', error.message);
            // Hata durumunda mock verileri kullan
            const { LogoService } = await import('../services/logoService');
            const logos = LogoService.getMockLogos('technology');
            
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
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            Create Your Logo
                        </h1>
                        <p className="text-gray-600">
                            Enter your company name and we'll show you amazing logo options
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Company Name *
                                </label>
                                <Input
                                    type="text"
                                    value={formData.companyName}
                                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                                    placeholder="Enter your company name"
                                    className="text-lg py-3"
                                />
                            </div>
                        </div>
                        
                        <div className="mt-8">
                            <Button
                                onClick={handleGenerate}
                                disabled={isGenerating || !formData.companyName.trim()}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Loading Logos...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Start
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogoCreator; 