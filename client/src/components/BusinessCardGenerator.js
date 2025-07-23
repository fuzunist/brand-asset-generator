import React, { useState, useEffect } from 'react';
import TemplateSelector from './TemplateSelector';
import BusinessCardPreview from './BusinessCardPreview';
import { useAuth } from '../AuthContext';
import { 
    CreditCard, 
    Upload, 
    Download, 
    CheckCircle,
    AlertCircle,
    Loader2,
    Image as ImageIcon,
    Eye,
    FlipHorizontal,
    Sparkles,
    User,
    Building
} from 'lucide-react';

// shadcn/ui imports
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const BusinessCardGenerator = () => {
    const { token, brandDetails } = useAuth();
    const [brandData, setBrandData] = useState(null);
    const [userData, setUserData] = useState(null);
    const [selectedTemplate, setSelectedTemplate] = useState('template_minimal_01');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [generating, setGenerating] = useState(false);
    const [showingSide, setShowingSide] = useState('front');
    const [backSideData, setBackSideData] = useState({
        services: 'Web Development\nMobile Apps\nUI/UX Design',
        additionalInfo: 'Available 24/7\nFree Consultation'
    });

    useEffect(() => {
        const fetchBrandData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await fetch('http://localhost:3001/api/user/brand-identity', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                setBrandData(data);
                setUserData(data.userProfile);
            } catch (error) {
                console.error('Error fetching brand data:', error);
                setError('Failed to load brand data. Please refresh the page.');
                // Fallback to mock data in case of error
                const mockData = {
                    brandName: "Ficonica Inc.",
                    logoUrl: "http://localhost:3001/example_logo.png",
                    brandColors: {
                        primary: "#4F46E5",
                        secondary: "#EC4899",
                        text: "#111827"
                    },
                    brandFonts: {
                        headline: "Inter",
                        body: "Roboto"
                    },
                    userProfile: {
                        fullName: "Furkan Yılmaz",
                        title: "Founder & CEO",
                        email: "furkan@ficonica.com",
                        phone: "+90 555 123 4567",
                        website: "ficonica.com"
                    }
                };
                setBrandData(mockData);
                setUserData(mockData.userProfile);
            } finally {
                setLoading(false);
            }
        };

        fetchBrandData();
    }, [token]);

    const handleTemplateChange = (templateId) => {
        setSelectedTemplate(templateId);
    };

    const handleUserDataChange = (newUserData) => {
        setUserData(newUserData);
    };

    const handleBackSideDataChange = (newBackSideData) => {
        setBackSideData(newBackSideData);
    };



    const handleDownloadPdf = async () => {
        if (generating) return;
        
        try {
            setGenerating(true);
            setError(null);
            
            const response = await fetch('http://localhost:3001/api/business-card/generate-pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    templateId: selectedTemplate,
                    data: {
                        ...userData,
                        logoUrl: brandDetails?.logoWithText || brandDetails?.logoWithoutText || null
                    },
                    backSideData: backSideData,
                    brandIdentity: {
                        colors: brandData.brandColors,
                        fonts: brandData.brandFonts,
                    },
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to generate PDF: ${errorText}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${userData.fullName}_Business_Card.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading PDF:', error);
            setError(`Error generating PDF: ${error.message}`);
        } finally {
            setGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                            <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
                            <h2 className="text-xl font-semibold">Business Card Generator</h2>
                            <p className="text-slate-600">Loading brand data...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!brandData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                            <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
                            <h2 className="text-xl font-semibold">Business Card Generator</h2>
                            <p className="text-red-600">Failed to load brand data. Please refresh the page.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="text-center space-y-4">
                <div className="flex justify-center">
                    <div className="p-4 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full">
                        <CreditCard className="h-12 w-12 text-white" />
                    </div>
                </div>
                <div>
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3">
                        Business Card Generator
                    </h2>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        Create professional business cards with your brand identity. Customize templates and generate print-ready files.
                    </p>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Controls */}
                <div className="space-y-6">
                    {/* Brand Details Status */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-lg text-slate-800 flex items-center">
                                <ImageIcon className="mr-3 h-5 w-5" />
                                Marka Durumu
                            </CardTitle>
                            <CardDescription>
                                Merkezi Brand Details'ten logo ve renk bilgileri alınıyor
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {(brandDetails?.logoWithText || brandDetails?.logoWithoutText) ? (
                                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                    <div className="flex items-center space-x-3">
                                        <img 
                                            src={brandDetails.logoWithText || brandDetails.logoWithoutText} 
                                            alt="Brand logo" 
                                            className="w-12 h-12 object-contain rounded border"
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-green-800">
                                                Logo {brandDetails.logoWithText ? '(Yazılı)' : '(Yazısız)'}
                                            </p>
                                            <p className="text-sm text-green-600">Kullanıma hazır</p>
                                        </div>
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                    </div>
                                </div>
                            ) : (
                                <Alert className="border-amber-200 bg-amber-50">
                                    <AlertCircle className="h-4 w-4 text-amber-600" />
                                    <AlertDescription className="text-amber-700">
                                        Lütfen yukarıdaki Brand Details bölümünden logo yükleyin.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {/* Template Selection */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-lg text-slate-800 flex items-center">
                                <Sparkles className="mr-3 h-5 w-5" />
                                Template Selection
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TemplateSelector selectedTemplate={selectedTemplate} onSelectTemplate={handleTemplateChange} />
                        </CardContent>
                    </Card>

                    {/* Preview Controls */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-lg text-slate-800 flex items-center">
                                <Eye className="mr-3 h-5 w-5" />
                                Preview Controls
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs value={showingSide} onValueChange={setShowingSide}>
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="front" className="flex items-center">
                                        <User className="mr-2 h-4 w-4" />
                                        Front Side
                                    </TabsTrigger>
                                    <TabsTrigger value="back" className="flex items-center">
                                        <Building className="mr-2 h-4 w-4" />
                                        Back Side
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>

                {/* Center Column - Preview */}
                <div className="lg:col-span-2">
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-lg text-slate-800 flex items-center">
                                <FlipHorizontal className="mr-3 h-5 w-5" />
                                Business Card Preview
                                <Badge variant="secondary" className="ml-auto">
                                    {showingSide === 'front' ? 'Front Side' : 'Back Side'}
                                </Badge>
                            </CardTitle>
                            <CardDescription>
                                Customize your business card design and content
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <BusinessCardPreview 
                                brandData={brandData} 
                                userData={userData} 
                                backSideData={backSideData}
                                templateId={selectedTemplate} 
                                showingSide={showingSide}
                                onUserDataChange={handleUserDataChange} 
                                onBackSideDataChange={handleBackSideDataChange}
                            />
                        </CardContent>
                        <CardFooter>
                            <Button 
                                onClick={handleDownloadPdf} 
                                disabled={generating}
                                className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
                                size="lg"
                            >
                                {generating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Generating PDF...
                                    </>
                                ) : (
                                    <>
                                        <Download className="mr-2 h-4 w-4" />
                                        Download PDF (Both Sides)
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default BusinessCardGenerator; 