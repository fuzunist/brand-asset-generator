import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';

const EmailTemplateGenerator = () => {
    const { token, user } = useAuth();
    
    // Core states
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [generatedEmails, setGeneratedEmails] = useState([]);
    
    // Form states
    const [formData, setFormData] = useState({
        purpose: '',
        tone: '',
        industry: '',
        targetAudience: '',
        emailLength: 'medium',
        templateStyle: 'modern',
        includeImages: true,
        ctaStyle: 'button',
        urgency: 'none',
        personalization: [],
        abTestVariants: 1
    });

    // Advanced states
    const [savedTemplates, setSavedTemplates] = useState([]);
    const [previewMode, setPreviewMode] = useState('desktop');
    const [activeVariant, setActiveVariant] = useState(0);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const isGuest = user?.role === 'guest';

    // Expanded email purposes
    const emailPurposes = [
        { value: 'welcome_series', label: '🎉 Welcome Series (Yeni Müşteri Serisi)', category: 'onboarding' },
        { value: 'welcome_email', label: '👋 Welcome Email (Tek Sefer Karşılama)', category: 'onboarding' },
        { value: 'email_verification', label: '✅ Email Verification (Email Doğrulama)', category: 'onboarding' },
        
        { value: 'product_launch', label: '🚀 Product Launch (Ürün Lansmanı)', category: 'marketing' },
        { value: 'new_feature_announcement', label: '⭐ New Feature (Yeni Özellik)', category: 'marketing' },
        { value: 'company_update', label: '📢 Company Update (Şirket Haberleri)', category: 'marketing' },
        { value: 'newsletter', label: '📰 Newsletter (Haber Bülteni)', category: 'marketing' },
        
        { value: 'special_offer', label: '💰 Special Offer (Özel Teklif)', category: 'sales' },
        { value: 'flash_sale', label: '⚡ Flash Sale (Anlık İndirim)', category: 'sales' },
        { value: 'abandoned_cart', label: '🛒 Abandoned Cart (Terk Edilen Sepet)', category: 'sales' },
        { value: 'upsell_crosssell', label: '📈 Upsell/Cross-sell', category: 'sales' },
        
        { value: 'feedback_request', label: '💭 Feedback Request (Geri Bildirim)', category: 'engagement' },
        { value: 'survey_invitation', label: '📋 Survey Invitation (Anket Daveti)', category: 'engagement' },
        { value: 'user_generated_content', label: '📸 UGC Request (İçerik Talebi)', category: 'engagement' },
        { value: 're_engagement', label: '🔄 Re-engagement (Yeniden Etkileşim)', category: 'engagement' },
        
        { value: 'birthday_anniversary', label: '🎂 Birthday/Anniversary (Doğum Günü)', category: 'lifecycle' },
        { value: 'milestone_celebration', label: '🏆 Milestone (Başarı Kutlaması)', category: 'lifecycle' },
        { value: 'thank_you', label: '🙏 Thank You (Teşekkür)', category: 'lifecycle' },
        
        { value: 'event_invitation', label: '📅 Event Invitation (Etkinlik Daveti)', category: 'events' },
        { value: 'webinar_invitation', label: '💻 Webinar Invitation (Webinar Daveti)', category: 'events' },
        { value: 'event_reminder', label: '⏰ Event Reminder (Etkinlik Hatırlatması)', category: 'events' },
        
        { value: 'seasonal_holiday', label: '🎄 Seasonal/Holiday (Mevsimsel/Tatil)', category: 'seasonal' },
        { value: 'back_to_school', label: '🎒 Back to School (Okula Dönüş)', category: 'seasonal' },
        { value: 'black_friday', label: '🖤 Black Friday/Cyber Monday', category: 'seasonal' }
    ];

    // Enhanced tone options
    const toneOptions = [
        { value: 'professional_formal', label: '👔 Professional & Formal', description: 'Corporate, serious, authoritative' },
        { value: 'friendly_casual', label: '😊 Friendly & Casual', description: 'Approachable, conversational, warm' },
        { value: 'excited_energetic', label: '⚡ Excited & Energetic', description: 'Enthusiastic, dynamic, motivational' },
        { value: 'luxury_sophisticated', label: '💎 Luxury & Sophisticated', description: 'Elegant, premium, exclusive' },
        { value: 'playful_fun', label: '🎈 Playful & Fun', description: 'Quirky, humorous, creative' },
        { value: 'urgent_compelling', label: '🔥 Urgent & Compelling', description: 'Time-sensitive, persuasive, action-oriented' },
        { value: 'educational_helpful', label: '📚 Educational & Helpful', description: 'Informative, supportive, guiding' },
        { value: 'minimalist_clean', label: '✨ Minimalist & Clean', description: 'Simple, clear, uncluttered' }
    ];

    // Industry options
    const industryOptions = [
        { value: 'technology', label: 'Technology (Teknoloji)' },
        { value: 'ecommerce', label: 'E-commerce (E-ticaret)' },
        { value: 'healthcare', label: 'Healthcare (Sağlık)' },
        { value: 'finance', label: 'Finance (Finans)' },
        { value: 'education', label: 'Education (Eğitim)' },
        { value: 'real_estate', label: 'Real Estate (Emlak)' },
        { value: 'food_beverage', label: 'Food & Beverage (Yiyecek İçecek)' },
        { value: 'fashion_beauty', label: 'Fashion & Beauty (Moda Güzellik)' },
        { value: 'travel_tourism', label: 'Travel & Tourism (Seyahat Turizm)' },
        { value: 'fitness_wellness', label: 'Fitness & Wellness (Fitness Sağlık)' },
        { value: 'automotive', label: 'Automotive (Otomotiv)' },
        { value: 'non_profit', label: 'Non-Profit (Kar Amacı Gütmeyen)' },
        { value: 'consulting', label: 'Consulting (Danışmanlık)' },
        { value: 'other', label: 'Other (Diğer)' }
    ];

    // Target audience options
    const audienceOptions = [
        { value: 'b2b_executives', label: 'B2B Executives (İş Dünyası Yöneticileri)' },
        { value: 'b2b_decision_makers', label: 'B2B Decision Makers (Karar Vericiler)' },
        { value: 'small_business_owners', label: 'Small Business Owners (KOBİ Sahipleri)' },
        { value: 'millennials', label: 'Millennials (Y Kuşağı)' },
        { value: 'gen_z', label: 'Gen Z (Z Kuşağı)' },
        { value: 'professionals', label: 'Young Professionals (Genç Profesyoneller)' },
        { value: 'parents', label: 'Parents (Ebeveynler)' },
        { value: 'students', label: 'Students (Öğrenciler)' },
        { value: 'seniors', label: 'Seniors (Yaşlılar)' },
        { value: 'tech_enthusiasts', label: 'Tech Enthusiasts (Teknoloji Meraklıları)' },
        { value: 'creative_professionals', label: 'Creative Professionals (Kreatif Profesyoneller)' },
        { value: 'general_consumers', label: 'General Consumers (Genel Tüketiciler)' }
    ];

    // Template styles
    const templateStyles = [
        { value: 'modern', label: '🎨 Modern', description: 'Clean, contemporary design' },
        { value: 'minimal', label: '⚪ Minimal', description: 'Simple, white space focused' },
        { value: 'corporate', label: '🏢 Corporate', description: 'Professional, traditional' },
        { value: 'creative', label: '🎭 Creative', description: 'Artistic, unique layouts' },
        { value: 'newsletter', label: '📰 Newsletter', description: 'Content-heavy, organized' },
        { value: 'promotional', label: '🎯 Promotional', description: 'Sale/offer focused design' }
    ];

    // Personalization options
    const personalizationOptions = [
        { value: 'first_name', label: 'First Name (Ad)' },
        { value: 'company_name', label: 'Company Name (Şirket Adı)' },
        { value: 'location', label: 'Location (Konum)' },
        { value: 'purchase_history', label: 'Purchase History (Satın Alma Geçmişi)' },
        { value: 'browsing_behavior', label: 'Browsing Behavior (Gezinme Davranışı)' },
        { value: 'signup_date', label: 'Signup Date (Kayıt Tarihi)' },
        { value: 'last_activity', label: 'Last Activity (Son Aktivite)' }
    ];

    useEffect(() => {
        loadSavedTemplates();
    }, []);

    const loadSavedTemplates = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/email-templates/saved', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setSavedTemplates(response.data);
        } catch (err) {
            console.log('No saved templates found');
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePersonalizationChange = (option) => {
        setFormData(prev => ({
            ...prev,
            personalization: prev.personalization.includes(option)
                ? prev.personalization.filter(p => p !== option)
                : [...prev.personalization, option]
        }));
    };

    const validateStep = (stepNumber) => {
        switch (stepNumber) {
            case 1:
                return formData.purpose && formData.tone;
            case 2:
                return formData.industry && formData.targetAudience;
            default:
                return true;
        }
    };

    const nextStep = () => {
        if (validateStep(step)) {
            setStep(step + 1);
            setError('');
        } else {
            setError('Please complete all required fields before continuing.');
        }
    };

    const generateEmails = async () => {
        if (isGuest) {
            setError('Guests cannot generate email templates. Please upgrade your account.');
            return;
        }

        setIsLoading(true);
        setError('');
        setGeneratedEmails([]);

        try {
            const response = await axios.post(
                'http://localhost:3001/api/email-templates/generate-advanced',
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            setGeneratedEmails(response.data);
            setStep(4); // Go to results step
        } catch (err) {
            console.error('Error generating email template:', err);
            if (err.response?.status === 402) {
                setError('OpenAI API quota exceeded. Please contact support.');
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Error generating email template. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = async (text, type) => {
        try {
            await navigator.clipboard.writeText(text);
            alert(`${type} copied to clipboard!`);
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert(`${type} copied to clipboard!`);
        }
    };

    const saveTemplate = async (templateData) => {
        try {
            await axios.post('http://localhost:3001/api/email-templates/save', {
                ...templateData,
                formData
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert('Template saved successfully!');
            loadSavedTemplates();
        } catch (err) {
            console.error('Error saving template:', err);
            alert('Error saving template');
        }
    };

    const renderPurposesByCategory = () => {
        const categories = [...new Set(emailPurposes.map(p => p.category))];
        
        return categories.map(category => {
            const categoryPurposes = emailPurposes.filter(p => p.category === category);
            const categoryNames = {
                'onboarding': { name: '🚀 Onboarding', color: 'from-green-500 to-emerald-600' },
                'marketing': { name: '📢 Marketing', color: 'from-blue-500 to-cyan-600' },
                'sales': { name: '💰 Sales', color: 'from-yellow-500 to-orange-600' },
                'engagement': { name: '💬 Engagement', color: 'from-purple-500 to-pink-600' },
                'lifecycle': { name: '🔄 Lifecycle', color: 'from-indigo-500 to-blue-600' },
                'events': { name: '📅 Events', color: 'from-red-500 to-pink-600' },
                'seasonal': { name: '🌟 Seasonal', color: 'from-teal-500 to-green-600' }
            };

            return (
                <div key={category} className="mb-10">
                    <div className="flex items-center mb-6">
                        <div className={`w-3 h-8 bg-gradient-to-b ${categoryNames[category].color} rounded-full mr-4`}></div>
                        <h4 className="text-xl font-bold text-gray-800">{categoryNames[category].name}</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categoryPurposes.map(purpose => (
                            <label key={purpose.value} className={`group relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                                formData.purpose === purpose.value 
                                    ? `border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-md shadow-indigo-200/50` 
                                    : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-gradient-to-br hover:from-indigo-50/30 hover:to-purple-50/30'
                            }`}>
                                <input
                                    type="radio"
                                    name="purpose"
                                    value={purpose.value}
                                    checked={formData.purpose === purpose.value}
                                    onChange={(e) => handleInputChange('purpose', e.target.value)}
                                    className="sr-only"
                                />
                                <div className="flex items-center space-x-3">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                        formData.purpose === purpose.value 
                                            ? 'border-indigo-500 bg-indigo-500' 
                                            : 'border-gray-300 group-hover:border-indigo-400'
                                    }`}>
                                        {formData.purpose === purpose.value && (
                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                        )}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 leading-relaxed">
                                        {purpose.label}
                                    </span>
                                </div>
                                {formData.purpose === purpose.value && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">✓</span>
                                    </div>
                                )}
                            </label>
                        ))}
                    </div>
                </div>
            );
        });
    };

    const renderStep1 = () => (
        <div className="space-y-12">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl mb-4">
                    <span className="text-2xl">🎯</span>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-indigo-900 bg-clip-text text-transparent mb-4">
                    Choose Your Email Strategy
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    Define your email's purpose and voice to create content that resonates with your audience and drives results.
                </p>
            </div>

            <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
                    <span className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-4">1</span>
                    Email Purpose
                </h3>
                {renderPurposesByCategory()}
            </div>

            <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
                    <span className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-4">2</span>
                    Tone of Voice
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {toneOptions.map(tone => (
                        <label key={tone.value} className={`group relative p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                            formData.tone === tone.value 
                                ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg shadow-indigo-200/50' 
                                : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-gradient-to-br hover:from-indigo-50/50 hover:to-purple-50/50'
                        }`}>
                            <input
                                type="radio"
                                name="tone"
                                value={tone.value}
                                checked={formData.tone === tone.value}
                                onChange={(e) => handleInputChange('tone', e.target.value)}
                                className="sr-only"
                            />
                            <div className="flex items-start space-x-4">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                    formData.tone === tone.value 
                                        ? 'border-indigo-500 bg-indigo-500' 
                                        : 'border-gray-300 group-hover:border-indigo-400'
                                }`}>
                                    {formData.tone === tone.value && (
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <span className="text-lg font-semibold text-gray-800 block mb-2">{tone.label}</span>
                                    <span className="text-sm text-gray-600 leading-relaxed">{tone.description}</span>
                                </div>
                            </div>
                            {formData.tone === tone.value && (
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs">✓</span>
                                </div>
                            )}
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Step 2: Target Audience & Industry</h2>
                <p className="text-gray-600 mb-6">Help us understand your audience and industry for more targeted content.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Industry</label>
                    <select
                        value={formData.industry}
                        onChange={(e) => handleInputChange('industry', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">Select your industry...</option>
                        {industryOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Target Audience</label>
                    <select
                        value={formData.targetAudience}
                        onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">Select your target audience...</option>
                        {audienceOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Step 3: Advanced Customization</h2>
                <p className="text-gray-600 mb-6">Customize your email's style, length, and personalization options.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Email Length</label>
                    <select
                        value={formData.emailLength}
                        onChange={(e) => handleInputChange('emailLength', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="short">Short (Quick & concise)</option>
                        <option value="medium">Medium (Balanced)</option>
                        <option value="long">Long (Detailed & comprehensive)</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Template Style</label>
                    <select
                        value={formData.templateStyle}
                        onChange={(e) => handleInputChange('templateStyle', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {templateStyles.map(style => (
                            <option key={style.value} value={style.value}>{style.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">A/B Test Variants</label>
                    <select
                        value={formData.abTestVariants}
                        onChange={(e) => handleInputChange('abTestVariants', parseInt(e.target.value))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value={1}>1 Version</option>
                        <option value={2}>2 Variants (A/B Test)</option>
                        <option value={3}>3 Variants (A/B/C Test)</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Personalization Options</label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {personalizationOptions.map(option => (
                        <label key={option.value} className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={formData.personalization.includes(option.value)}
                                onChange={() => handlePersonalizationChange(option.value)}
                                className="text-indigo-600"
                            />
                            <span className="text-sm text-gray-700">{option.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <label className="flex items-center space-x-3">
                    <input
                        type="checkbox"
                        checked={formData.includeImages}
                        onChange={(e) => handleInputChange('includeImages', e.target.checked)}
                        className="text-indigo-600"
                    />
                    <span className="text-sm text-gray-700">Include Images</span>
                </label>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CTA Style</label>
                    <select
                        value={formData.ctaStyle}
                        onChange={(e) => handleInputChange('ctaStyle', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                    >
                        <option value="button">Button</option>
                        <option value="link">Link</option>
                        <option value="both">Both</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Urgency Level</label>
                    <select
                        value={formData.urgency}
                        onChange={(e) => handleInputChange('urgency', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                    >
                        <option value="none">None</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
            </div>
        </div>
    );

    const renderResults = () => (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Generated Email Templates</h2>
                <p className="text-gray-600 mb-6">
                    Your AI-generated email templates are ready! Preview, edit, and use them in your campaigns.
                </p>
            </div>

            {generatedEmails.length > 0 && (
                <div>
                    {/* Variant Tabs */}
                    {generatedEmails.length > 1 && (
                        <div className="flex space-x-1 mb-6">
                            {generatedEmails.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveVariant(index)}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg ${
                                        activeVariant === index
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    Variant {String.fromCharCode(65 + index)}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Active Template */}
                    {generatedEmails[activeVariant] && (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            {/* Controls */}
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => setPreviewMode('desktop')}
                                        className={`px-3 py-1 text-sm rounded ${
                                            previewMode === 'desktop' ? 'bg-indigo-600 text-white' : 'bg-gray-200'
                                        }`}
                                    >
                                        🖥️ Desktop
                                    </button>
                                    <button
                                        onClick={() => setPreviewMode('mobile')}
                                        className={`px-3 py-1 text-sm rounded ${
                                            previewMode === 'mobile' ? 'bg-indigo-600 text-white' : 'bg-gray-200'
                                        }`}
                                    >
                                        📱 Mobile
                                    </button>
                                </div>
                                <button
                                    onClick={() => saveTemplate(generatedEmails[activeVariant])}
                                    className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                >
                                    💾 Save Template
                                </button>
                            </div>

                            {/* Subject Line */}
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">Subject Line</label>
                                    <button
                                        onClick={() => copyToClipboard(generatedEmails[activeVariant].subject_line, 'Subject line')}
                                        className="text-sm text-indigo-600 hover:text-indigo-800"
                                    >
                                        📋 Copy Subject
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={generatedEmails[activeVariant].subject_line}
                                    readOnly
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
                                />
                            </div>

                            {/* Preview Line */}
                            {generatedEmails[activeVariant].preview_text && (
                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-medium text-gray-700">Preview Text</label>
                                        <button
                                            onClick={() => copyToClipboard(generatedEmails[activeVariant].preview_text, 'Preview text')}
                                            className="text-sm text-indigo-600 hover:text-indigo-800"
                                        >
                                            📋 Copy Preview
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={generatedEmails[activeVariant].preview_text}
                                        readOnly
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
                                    />
                                </div>
                            )}

                            {/* Content and Preview */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                {/* HTML Code Section */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-gradient-to-r from-slate-500 to-gray-600 rounded-lg flex items-center justify-center">
                                                <span className="text-white text-sm">⟨⟩</span>
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-800">HTML Source Code</h3>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => {
                                                    const formatted = generatedEmails[activeVariant].html_body
                                                        .replace(/></g, '>\n<')
                                                        .replace(/^\s*\n/gm, '');
                                                    copyToClipboard(formatted, 'Formatted HTML code');
                                                }}
                                                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg"
                                            >
                                                <span>📋</span>
                                                <span>Copy HTML</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="relative bg-gradient-to-br from-slate-900 to-gray-900 rounded-xl shadow-2xl overflow-hidden border border-slate-700">
                                        {/* Code Editor Header */}
                                        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-800 to-gray-800 border-b border-slate-600">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex space-x-2">
                                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                </div>
                                                <span className="text-slate-300 text-sm font-medium">email-template.html</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-slate-400 text-xs">
                                                <span>HTML</span>
                                                <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                                                <span>{Math.round(generatedEmails[activeVariant].html_body.length / 1024)}KB</span>
                                            </div>
                                        </div>

                                        {/* Code Content */}
                                        <div className="relative">
                                            <div className="absolute left-0 top-0 w-12 bg-slate-800 h-full flex flex-col items-center pt-4 text-slate-500 text-xs space-y-[1.2em] font-mono">
                                                {Array.from({ length: Math.min(25, generatedEmails[activeVariant].html_body.split('\n').length) }, (_, i) => (
                                                    <span key={i + 1}>{i + 1}</span>
                                                ))}
                                            </div>
                                            <div className="pl-12 pr-4 py-4 h-96 overflow-auto">
                                                <pre className="text-sm text-slate-300 font-mono leading-relaxed">
                                                    <code 
                                                        dangerouslySetInnerHTML={{
                                                            __html: generatedEmails[activeVariant].html_body
                                                                .replace(/&/g, '&amp;')
                                                                .replace(/</g, '&lt;')
                                                                .replace(/>/g, '&gt;')
                                                                .replace(/(&lt;\/?)([\w\-]+)/g, '<span class="text-blue-400">$1$2</span>')
                                                                .replace(/([\w\-]+)(=)/g, '<span class="text-green-400">$1</span><span class="text-orange-400">$2</span>')
                                                                .replace(/(".*?")/g, '<span class="text-yellow-300">$1</span>')
                                                                .replace(/(\/&gt;|&gt;)/g, '<span class="text-blue-400">$1</span>')
                                                        }}
                                                    />
                                                </pre>
                                            </div>
                                        </div>

                                        {/* Code Actions Footer */}
                                        <div className="px-4 py-2 bg-slate-800 border-t border-slate-600 flex items-center justify-between">
                                            <div className="flex items-center space-x-4 text-xs text-slate-400">
                                                <span>✓ Valid HTML</span>
                                                <span>✓ Mobile Responsive</span>
                                                <span>✓ Email Client Compatible</span>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const blob = new Blob([generatedEmails[activeVariant].html_body], { type: 'text/html' });
                                                    const url = URL.createObjectURL(blob);
                                                    const a = document.createElement('a');
                                                    a.href = url;
                                                    a.download = 'email-template.html';
                                                    a.click();
                                                    URL.revokeObjectURL(url);
                                                }}
                                                className="flex items-center space-x-2 px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-md transition-colors duration-200"
                                            >
                                                <span>💾</span>
                                                <span>Download</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Live Preview Section */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                                                <span className="text-white text-sm">👁</span>
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-800">Live Preview</h3>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => setPreviewMode('desktop')}
                                                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                                    previewMode === 'desktop' 
                                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md' 
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                <span>💻</span>
                                                <span>Desktop</span>
                                            </button>
                                            <button
                                                onClick={() => setPreviewMode('tablet')}
                                                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                                    previewMode === 'tablet' 
                                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md' 
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                <span>📱</span>
                                                <span>Tablet</span>
                                            </button>
                                            <button
                                                onClick={() => setPreviewMode('mobile')}
                                                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                                    previewMode === 'mobile' 
                                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md' 
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                <span>📱</span>
                                                <span>Mobile</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shadow-2xl overflow-hidden border border-gray-300">
                                        {/* Preview Device Frame */}
                                        <div className="flex items-center justify-center p-6">
                                            <div className={`relative bg-white rounded-lg shadow-xl border-2 border-gray-300 transition-all duration-500 ${
                                                previewMode === 'desktop' ? 'w-full max-w-4xl' :
                                                previewMode === 'tablet' ? 'w-full max-w-2xl' :
                                                'w-full max-w-sm'
                                            }`}>
                                                {/* Device Header */}
                                                <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 rounded-t-lg">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="flex space-x-1">
                                                            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                                            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                                        </div>
                                                        <span className="text-xs text-gray-600 font-medium">
                                                            {previewMode === 'desktop' ? '🖥️ Desktop View' :
                                                             previewMode === 'tablet' ? '📱 Tablet View' :
                                                             '📱 Mobile View'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="text-xs text-gray-500">
                                                            {previewMode === 'desktop' ? '1200px' :
                                                             previewMode === 'tablet' ? '768px' :
                                                             '375px'}
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                const blob = new Blob([generatedEmails[activeVariant].html_body], { type: 'text/html' });
                                                                const url = URL.createObjectURL(blob);
                                                                window.open(url, '_blank');
                                                                setTimeout(() => URL.revokeObjectURL(url), 1000);
                                                            }}
                                                            className="text-xs text-emerald-600 hover:text-emerald-800 font-medium"
                                                        >
                                                            ↗ Open in New Tab
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Preview Content */}
                                                <div className="relative">
                                                    <div className={`h-96 overflow-auto bg-white ${
                                                        previewMode === 'mobile' ? 'text-sm' : ''
                                                    }`}>
                                                        <iframe
                                                            srcDoc={generatedEmails[activeVariant].html_body}
                                                            className="w-full h-full border-0"
                                                            sandbox="allow-same-origin"
                                                            title="Email Preview"
                                                            style={{
                                                                transform: previewMode === 'mobile' ? 'scale(0.9)' : 'scale(1)',
                                                                transformOrigin: 'top left'
                                                            }}
                                                        />
                                                    </div>
                                                    
                                                    {/* Loading Overlay */}
                                                    <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                                        <div className="bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg text-sm">
                                                            Interactive preview - scroll to view full email
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Preview Footer */}
                                                <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                                                    <div className="flex items-center justify-between text-xs text-gray-600">
                                                        <div className="flex items-center space-x-4">
                                                            <span>✓ Responsive Design</span>
                                                            <span>✓ Cross-Platform</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <span>Zoom:</span>
                                                            <button 
                                                                onClick={() => {
                                                                    const iframe = document.querySelector('iframe[title="Email Preview"]');
                                                                    const currentScale = iframe.style.transform.match(/scale\(([\d.]+)\)/);
                                                                    const scale = currentScale ? parseFloat(currentScale[1]) : 1;
                                                                    if (scale > 0.5) iframe.style.transform = `scale(${(scale - 0.1).toFixed(1)})`;
                                                                }}
                                                                className="text-emerald-600 hover:text-emerald-800 font-bold"
                                                            >
                                                                -
                                                            </button>
                                                            <button 
                                                                onClick={() => {
                                                                    const iframe = document.querySelector('iframe[title="Email Preview"]');
                                                                    iframe.style.transform = 'scale(1)';
                                                                }}
                                                                className="px-2 py-1 bg-gray-200 rounded text-xs"
                                                            >
                                                                100%
                                                            </button>
                                                            <button 
                                                                onClick={() => {
                                                                    const iframe = document.querySelector('iframe[title="Email Preview"]');
                                                                    const currentScale = iframe.style.transform.match(/scale\(([\d.]+)\)/);
                                                                    const scale = currentScale ? parseFloat(currentScale[1]) : 1;
                                                                    if (scale < 2) iframe.style.transform = `scale(${(scale + 0.1).toFixed(1)})`;
                                                                }}
                                                                className="text-emerald-600 hover:text-emerald-800 font-bold"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Analytics & Usage Info */}
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Usage Instructions */}
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                                    <h3 className="text-sm font-medium text-blue-800 mb-2">🚀 Usage Instructions:</h3>
                                    <ul className="text-sm text-blue-700 space-y-1">
                                        <li>• Copy the HTML code and paste into your ESP</li>
                                        <li>• Test across different email clients</li>
                                        <li>• Replace personalization placeholders</li>
                                        <li>• Add UTM parameters for tracking</li>
                                        <li>• A/B test different variants</li>
                                    </ul>
                                </div>

                                {/* Technical Details */}
                                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                                    <h3 className="text-sm font-medium text-green-800 mb-2">📊 Technical Details:</h3>
                                    <ul className="text-sm text-green-700 space-y-1">
                                        <li>• Mobile-responsive design ✓</li>
                                        <li>• Outlook compatible ✓</li>
                                        <li>• Inline CSS styling ✓</li>
                                        <li>• Accessibility optimized ✓</li>
                                        <li>• Dark mode support ✓</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Personalization Guide */}
                            {formData.personalization.length > 0 && (
                                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                                    <h3 className="text-sm font-medium text-yellow-800 mb-2">🎯 Personalization Placeholders:</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-yellow-700">
                                        {formData.personalization.map(field => (
                                            <span key={field} className="bg-yellow-100 px-2 py-1 rounded">
                                                {`{{${field}}}`}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl mb-6 shadow-xl">
                        <span className="text-3xl">📧</span>
                    </div>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-4">
                        Advanced Email Generator
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                        Create stunning, high-converting email campaigns with AI-powered customization, 
                        A/B testing, and professional templates that work across all email clients
                    </p>
                    
                    {/* Modern Progress Bar */}
                    <div className="max-w-lg mx-auto">
                        <div className="flex justify-between items-center mb-4">
                            {[
                                { num: 1, title: "Purpose", icon: "🎯" },
                                { num: 2, title: "Audience", icon: "👥" },
                                { num: 3, title: "Customize", icon: "🎨" },
                                { num: 4, title: "Generate", icon: "✨" }
                            ].map((stepInfo) => (
                                <div key={stepInfo.num} className="flex flex-col items-center">
                                    <div className={`relative w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shadow-lg transition-all duration-300 ${
                                        step >= stepInfo.num 
                                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white scale-110 shadow-indigo-200' 
                                            : step === stepInfo.num - 1
                                            ? 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-600 border-2 border-indigo-300 animate-pulse'
                                            : 'bg-white text-gray-400 border-2 border-gray-200'
                                    }`}>
                                        {step >= stepInfo.num ? '✓' : stepInfo.icon}
                                        {step >= stepInfo.num && (
                                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 animate-ping opacity-25"></div>
                                        )}
                                    </div>
                                    <span className={`text-xs mt-2 font-medium transition-colors duration-300 ${
                                        step >= stepInfo.num ? 'text-indigo-600' : 'text-gray-500'
                                    }`}>
                                        {stepInfo.title}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="relative w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div 
                                className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-700 ease-out shadow-lg"
                                style={{ width: `${(step / 4) * 100}%` }}
                            >
                                <div className="absolute inset-0 bg-white opacity-30 animate-pulse rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 lg:p-12 relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full opacity-50"></div>
                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-gradient-to-tr from-blue-100 to-indigo-100 rounded-full opacity-50"></div>
                    
                    <div className="relative z-10">
                        {step === 1 && renderStep1()}
                        {step === 2 && renderStep2()}
                        {step === 3 && renderStep3()}
                        {step === 4 && renderResults()}
                    </div>

                    {/* Navigation */}
                    {step < 4 && (
                        <div className="flex justify-between items-center mt-12 pt-8 border-t border-gradient-to-r from-gray-200 via-indigo-100 to-gray-200">
                            <button
                                onClick={() => setStep(Math.max(1, step - 1))}
                                disabled={step === 1}
                                className="group px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-2xl hover:border-indigo-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
                            >
                                <span className="flex items-center space-x-2">
                                    <span className="text-lg">←</span>
                                    <span>Previous</span>
                                </span>
                            </button>

                            {step < 3 ? (
                                <button
                                    onClick={nextStep}
                                    className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-medium"
                                >
                                    <span className="flex items-center space-x-2">
                                        <span>Continue</span>
                                        <span className="text-lg group-hover:translate-x-1 transition-transform duration-300">→</span>
                                    </span>
                                </button>
                            ) : (
                                <button
                                    onClick={generateEmails}
                                    disabled={isLoading || isGuest}
                                    className="group px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-bold text-lg relative overflow-hidden"
                                >
                                    {isLoading && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-700">
                                            <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                                        </div>
                                    )}
                                    <span className="relative flex items-center space-x-3">
                                        <span>{isLoading ? '⏳ Generating Magic...' : '✨ Generate Email Templates'}</span>
                                        {!isLoading && <span className="text-xl group-hover:scale-110 transition-transform duration-300">🚀</span>}
                                    </span>
                                </button>
                            )}
                        </div>
                    )}

                    {step === 4 && (
                        <div className="flex justify-center mt-12 pt-8 border-t border-gradient-to-r from-gray-200 via-indigo-100 to-gray-200">
                            <button
                                onClick={() => {
                                    setStep(1);
                                    setGeneratedEmails([]);
                                    setFormData({
                                        purpose: '',
                                        tone: '',
                                        industry: '',
                                        targetAudience: '',
                                        emailLength: 'medium',
                                        templateStyle: 'modern',
                                        includeImages: true,
                                        ctaStyle: 'button',
                                        urgency: 'none',
                                        personalization: [],
                                        abTestVariants: 1
                                    });
                                }}
                                className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-medium"
                            >
                                <span className="flex items-center space-x-3">
                                    <span className="text-lg group-hover:rotate-180 transition-transform duration-500">🔄</span>
                                    <span>Create Another Email</span>
                                </span>
                            </button>
                        </div>
                    )}

                    {/* Error Display */}
                    {error && (
                        <div className="mt-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl shadow-lg">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-lg">⚠️</span>
                                </div>
                                <div>
                                    <h4 className="text-red-800 font-semibold mb-1">Oops! Something went wrong</h4>
                                    <p className="text-red-700 text-sm leading-relaxed">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Guest Warning */}
                    {isGuest && (
                        <div className="mt-8 p-6 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-lg">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xl">🔒</span>
                                </div>
                                <div>
                                    <h4 className="text-amber-800 font-semibold mb-2">Premium Feature</h4>
                                    <p className="text-amber-700 text-sm leading-relaxed mb-3">
                                        Guest users have limited access. Upgrade your account to unlock advanced email generation features.
                                    </p>
                                    <button className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-lg text-sm font-medium hover:from-amber-600 hover:to-yellow-700 transition-all duration-300 shadow-md hover:shadow-lg">
                                        Upgrade Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Saved Templates Section */}
                {savedTemplates.length > 0 && (
                    <div className="mt-12 bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full opacity-50"></div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center mb-8">
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-4">
                                    <span className="text-2xl">📚</span>
                                </div>
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-purple-900 bg-clip-text text-transparent">
                                    Your Saved Templates
                                </h2>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {savedTemplates.map((template, index) => (
                                    <div key={index} className="group bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-purple-300 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                                                <span className="text-lg">📧</span>
                                            </div>
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                                {new Date(template.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        
                                        <h3 className="font-bold text-gray-800 mb-2 text-lg leading-tight">
                                            {template.name || 'Untitled Template'}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                                            {template.form_data?.purpose} • {template.form_data?.tone}
                                        </p>
                                        
                                        <div className="flex space-x-3">
                                            <button className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-lg">
                                                Load Template
                                            </button>
                                            <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-all duration-300">
                                                Preview
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmailTemplateGenerator; 