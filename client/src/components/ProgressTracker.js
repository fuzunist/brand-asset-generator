import React from 'react';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';
import { Card, CardContent } from './ui/card';

const ProgressTracker = ({ currentStep = 1, completedSteps = [] }) => {
    const steps = [
        {
            id: 1,
            title: "Logo & Marka Kimliği",
            description: "Markanızın temelini oluşturun",
            color: "indigo"
        },
        {
            id: 2,
            title: "Marka Lansman Kitleri",
            description: "Markanızı hayata geçirin",
            color: "pink"
        },
        {
            id: 3,
            title: "Brand OS",
            description: "Sürekli büyüme için akıllı araçlar",
            color: "purple"
        }
    ];

    const getStepStatus = (stepId) => {
        if (completedSteps.includes(stepId)) return 'completed';
        if (stepId === currentStep) return 'current';
        return 'pending';
    };

    const getStepIcon = (stepId) => {
        const status = getStepStatus(stepId);
        if (status === 'completed') {
            return <CheckCircle className="h-6 w-6 text-green-500" />;
        }
        return <Circle className="h-6 w-6 text-gray-300" />;
    };

    const getStepColor = (stepId) => {
        const status = getStepStatus(stepId);
        const step = steps.find(s => s.id === stepId);
        
        if (status === 'completed') return 'text-green-600';
        if (status === 'current') {
            if (step.color === 'indigo') return 'text-indigo-600';
            if (step.color === 'pink') return 'text-pink-600';
            if (step.color === 'purple') return 'text-purple-600';
        }
        return 'text-gray-400';
    };

    const getStepBgColor = (stepId) => {
        const status = getStepStatus(stepId);
        const step = steps.find(s => s.id === stepId);
        
        if (status === 'completed') return 'bg-green-50 border-green-200';
        if (status === 'current') {
            if (step.color === 'indigo') return 'bg-indigo-50 border-indigo-200';
            if (step.color === 'pink') return 'bg-pink-50 border-pink-200';
            if (step.color === 'purple') return 'bg-purple-50 border-purple-200';
        }
        return 'bg-gray-50 border-gray-200';
    };

    return (
        <Card className="mb-6">
            <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Marka Evrim Süreci</h3>
                <div className="space-y-4">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex items-center">
                            <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${getStepBgColor(step.id)}`}>
                                {getStepIcon(step.id)}
                            </div>
                            <div className="ml-4 flex-1">
                                <h4 className={`font-medium ${getStepColor(step.id)}`}>
                                    {step.title}
                                </h4>
                                <p className="text-sm text-gray-500">{step.description}</p>
                            </div>
                            {index < steps.length - 1 && (
                                <ArrowRight className="h-5 w-5 text-gray-300 mx-4" />
                            )}
                        </div>
                    ))}
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>İlerleme: {completedSteps.length}/{steps.length}</span>
                        <span>{Math.round((completedSteps.length / steps.length) * 100)}%</span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div 
                            className="bg-gradient-to-r from-indigo-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ProgressTracker; 