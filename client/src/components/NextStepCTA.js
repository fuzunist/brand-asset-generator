import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Package, Cpu } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

const NextStepCTA = ({ currentStep = 1, hasCompletedCurrentStep = false }) => {
    const getStepInfo = (step) => {
        switch (step) {
            case 1:
                return {
                    title: "Logo'nuzu Tamamladınız!",
                    description: "Harika! Şimdi markanızı hayata geçirmek için lansman kitlerini oluşturalım.",
                    icon: <Sparkles className="h-8 w-8 text-indigo-600" />,
                    color: "indigo",
                    nextStep: "Marka Lansman Kitleri",
                    link: "/dashboard",
                    features: [
                        "Profesyonel kartvizit tasarımları",
                        "E-posta imzası",
                        "Basın kiti",
                        "Marka kitabı"
                    ]
                };
            case 2:
                return {
                    title: "Marka Kitiniz Hazır!",
                    description: "Mükemmel! Artık markanızın sürekli büyümesi için Brand OS'a geçelim.",
                    icon: <Package className="h-8 w-8 text-pink-600" />,
                    color: "pink",
                    nextStep: "Brand OS",
                    link: "/dashboard",
                    features: [
                        "Otomatik reklam kiti oluşturma",
                        "Algı analizi ve izleme",
                        "İçerik takvimi",
                        "SEO fırsat radarı"
                    ]
                };
            case 3:
                return {
                    title: "Brand OS Aktif!",
                    description: "Markanızın işletim sistemi çalışıyor. Şimdi tüm özellikleri keşfedin.",
                    icon: <Cpu className="h-8 w-8 text-purple-600" />,
                    color: "purple",
                    nextStep: "Tüm Özellikler",
                    link: "/dashboard",
                    features: [
                        "12 farklı akıllı araç",
                        "7/24 marka izleme",
                        "Otomatik içerik üretimi",
                        "Rakip analizi"
                    ]
                };
            default:
                return null;
        }
    };

    const stepInfo = getStepInfo(currentStep);
    if (!stepInfo || !hasCompletedCurrentStep) return null;

    const getColorClasses = (color) => {
        switch (color) {
            case 'indigo':
                return {
                    bg: 'bg-indigo-50',
                    border: 'border-indigo-200',
                    text: 'text-indigo-800',
                    button: 'bg-indigo-600 hover:bg-indigo-700'
                };
            case 'pink':
                return {
                    bg: 'bg-pink-50',
                    border: 'border-pink-200',
                    text: 'text-pink-800',
                    button: 'bg-pink-600 hover:bg-pink-700'
                };
            case 'purple':
                return {
                    bg: 'bg-purple-50',
                    border: 'border-purple-200',
                    text: 'text-purple-800',
                    button: 'bg-purple-600 hover:bg-purple-700'
                };
            default:
                return {
                    bg: 'bg-gray-50',
                    border: 'border-gray-200',
                    text: 'text-gray-800',
                    button: 'bg-gray-600 hover:bg-gray-700'
                };
        }
    };

    const colors = getColorClasses(stepInfo.color);

    return (
        <Card className={`${colors.bg} ${colors.border} border-2`}>
            <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                        {stepInfo.icon}
                    </div>
                    <div className="flex-1">
                        <h3 className={`text-xl font-bold ${colors.text} mb-2`}>
                            {stepInfo.title}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {stepInfo.description}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
                            {stepInfo.features.map((feature, index) => (
                                <div key={index} className="flex items-center text-sm text-gray-700">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                    {feature}
                                </div>
                            ))}
                        </div>
                        
                        <Link to={stepInfo.link}>
                            <Button className={`${colors.button} text-white font-semibold`}>
                                {stepInfo.nextStep}'a Geç
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default NextStepCTA; 