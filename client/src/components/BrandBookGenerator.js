import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { 
    BookOpen, 
    Upload, 
    Download, 
    CheckCircle,
    AlertCircle,
    Loader2,
    FileImage,
    Palette,
    Share2,
    Sparkles
} from 'lucide-react';

// shadcn/ui imports
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';

const BrandBookGenerator = () => {
    const { user, brandDetails } = useAuth();
    const [brandIdentity, setBrandIdentity] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isKitLoading, setIsKitLoading] = useState(false);
    const [error, setError] = useState('');
    const [pdfUrl, setPdfUrl] = useState(null);
    const [progress, setProgress] = useState(0);

    const isGuest = user?.role === 'guest';

    // Debug information
    console.log('🔧 Button state debug:', {
        isLoading,
        isKitLoading,
        hasLogo: !!(brandDetails?.logoWithText || brandDetails?.logoWithoutText),
        isGuest,
        hasBrandIdentity: !!brandIdentity,
        brandDetails,
        brandIdentity,
        user
    });

    useEffect(() => {
        const fetchBrandIdentity = async () => {
            try {
                console.log('🔍 Attempting to fetch brand identity...');
                const response = await axios.get('http://localhost:3001/api/user/brand-identity');
                console.log('✅ Brand identity fetched successfully:', response.data);
                setBrandIdentity(response.data);
            } catch (err) {
                console.error("❌ Failed to fetch brand identity", err);
                console.error("Error details:", {
                    message: err.message,
                    response: err.response?.data,
                    status: err.response?.status
                });
                setError('Could not load brand identity.');
            }
        };
        fetchBrandIdentity();
    }, []);

    // Progress simulation for better UX
    useEffect(() => {
        if (isLoading || isKitLoading) {
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) return 90;
                    return prev + Math.random() * 15;
                });
            }, 500);
            return () => clearInterval(interval);
        } else {
            setProgress(0);
        }
    }, [isLoading, isKitLoading]);



    const handleGenerateClick = async () => {
        console.log('🚀 Generate Brand Book button clicked!');
        console.log('Current state:', {
            brandDetails,
            brandIdentity,
            isLoading,
            isKitLoading,
            user
        });
        
        const logoUrl = brandDetails?.logoWithText || brandDetails?.logoWithoutText;
        if (!logoUrl || !brandIdentity) {
            let errorMsg = 'Şu gereksinimler eksik: ';
            const missing = [];
            
            if (!logoUrl) {
                missing.push('Logo (Brand Details bölümünden logo yükleyin)');
            }
            
            if (!brandIdentity) {
                missing.push('Marka kimliği bilgileri (Sayfa yenilenerek tekrar deneyin)');
            }
            
            errorMsg += missing.join(', ');
            console.log('❌ Missing requirements:', { logoUrl, brandIdentity });
            setError(errorMsg);
            return;
        }
        setIsLoading(true);
        setError('');
        setPdfUrl(null);
        setProgress(10);

        const formData = new FormData();
        
        // Brand details'teki logoyu fetch edip blob olarak ekliyoruz
        try {
            const logoResponse = await fetch(logoUrl);
            const logoBlob = await logoResponse.blob();
            formData.append('logo', logoBlob, 'logo.png');
        } catch (logoError) {
            setError('Logo yüklenirken hata oluştu. Lütfen logo dosyasını kontrol edin.');
            setIsLoading(false);
            return;
        }
        
        const mappedBrandIdentity = {
            name: brandIdentity.brandName || 'Your Brand',
            colors: {
                primary: brandIdentity.brandColors?.primary || '#4F46E5',
                secondary: brandIdentity.brandColors?.secondary || '#EC4899'
            },
            fonts: {
                headline: brandIdentity.brandFonts?.headline || 'Inter',
                body: brandIdentity.brandFonts?.body || 'Inter'
            }
        };
        
        formData.append('brandIdentity', JSON.stringify(mappedBrandIdentity));

        try {
            setProgress(30);
            const isDevelopment = window.location.hostname === 'localhost';
            const headers = {};
            
            if (!isDevelopment) {
                const token = localStorage.getItem('token');
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }
            }
            
            setProgress(60);
            const response = await axios.post('http://localhost:3001/api/brand-book/generate', formData, {
                headers,
                responseType: 'blob',
            });
            
            setProgress(90);
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            setPdfUrl(url);
            setProgress(100);
        } catch (err) {
            console.error('Brand book generation error:', err);
            
            if (err.response?.status === 401) {
                setError('Authentication required. Please log in to generate brand books.');
            } else if (err.response?.status === 400) {
                const errorMsg = err.response?.data?.error || 'Invalid file format. Please upload a PNG, JPEG, or SVG file.';
                setError(errorMsg);
            } else if (err.response?.status === 500) {
                const errorMsg = err.response?.data?.error || 'Server error while generating brand book. Please try again.';
                setError(errorMsg);
            } else {
                setError('Network error. Please check your connection and try again.');
            }
        } finally {
            setIsLoading(false);
            setTimeout(() => setProgress(0), 1000);
        }
    };
    
    const handleSocialKitClick = async () => {
        setIsKitLoading(true);
        setError('');
        setProgress(10);
        
        try {
            const isDevelopment = window.location.hostname === 'localhost';
            const headers = {};
            
            if (!isDevelopment) {
                const token = localStorage.getItem('token');
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }
            }
            
            setProgress(60);
            const response = await axios.get('http://localhost:3001/api/social-kit/generate', {
                headers,
                responseType: 'blob',
            });
            
            setProgress(90);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'social-media-kit.zip');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            setProgress(100);
        } catch (err) {
            if (err.response?.status === 401) {
                setError('Authentication required. Please log in to generate social media kit.');
            } else {
                setError('Could not generate social media kit.');
            }
            console.error('Social kit generation error:', err);
        } finally {
            setIsKitLoading(false);
            setTimeout(() => setProgress(0), 1000);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="text-center space-y-4">
                <div className="flex justify-center">
                    <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full">
                        <BookOpen className="h-12 w-12 text-white" />
                    </div>
                </div>
                <div>
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3">
                        Brand Book Generator
                    </h2>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        Upload your logo and we'll generate a complete professional brand guide with color palettes, typography, and usage guidelines.
                    </p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upload Section */}
                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-xl text-slate-800 flex items-center">
                            <Upload className="mr-3 h-6 w-6" />
                            Upload Logo
                        </CardTitle>
                        <CardDescription>
                            Choose your brand logo to generate a comprehensive brand guide
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
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
                                        <p className="text-sm text-green-600">
                                            Brand book oluşturmaya hazır
                                        </p>
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
                        
                        {/* Color Preview */}
                        <div className="p-3 bg-slate-50 rounded-lg">
                            <h4 className="text-sm font-medium text-slate-700 mb-2">Kullanılan Renkler</h4>
                            <div className="flex space-x-2">
                                <div 
                                    className="w-8 h-8 rounded border-2 border-white shadow-sm"
                                    style={{ backgroundColor: brandDetails?.primaryColor || '#4F46E5' }}
                                    title="Birinci Renk"
                                />
                                <div 
                                    className="w-8 h-8 rounded border-2 border-white shadow-sm"
                                    style={{ backgroundColor: brandDetails?.secondaryColor || '#EC4899' }}
                                    title="İkinci Renk"
                                />
                            </div>
                        </div>

                        {(isLoading || isKitLoading) && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600">
                                        {isLoading ? 'Generating Brand Book...' : 'Generating Social Media Kit...'}
                                    </span>
                                    <span className="text-slate-500">{Math.round(progress)}%</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="space-y-4">
                        <div className="grid grid-cols-1 gap-3 w-full">
                            <Button
                                onClick={handleGenerateClick}
                                disabled={isLoading || isKitLoading || !(brandDetails?.logoWithText || brandDetails?.logoWithoutText) || isGuest || !brandIdentity}
                                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                                size="lg"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Generating Brand Book...
                                    </>
                                ) : (
                                    <>
                                        <BookOpen className="mr-2 h-4 w-4" />
                                        Generate Brand Book
                                    </>
                                )}
                            </Button>
                            
                            <Button
                                onClick={handleSocialKitClick}
                                disabled={isKitLoading || isLoading || isGuest}
                                variant="outline"
                                size="lg"
                                className="border-2 hover:bg-slate-50"
                            >
                                {isKitLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Generating Kit...
                                    </>
                                ) : (
                                    <>
                                        <Share2 className="mr-2 h-4 w-4" />
                                        Generate Social Media Kit
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardFooter>
                </Card>

                {/* Features & Status Section */}
                <div className="space-y-6">
                    {/* Features Card */}
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100">
                        <CardHeader>
                            <CardTitle className="text-xl text-slate-800 flex items-center">
                                <Sparkles className="mr-3 h-6 w-6" />
                                What You'll Get
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <div className="p-2 bg-purple-100 rounded-lg mt-1">
                                        <Palette className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-800">Color Palette</h4>
                                        <p className="text-sm text-slate-600">Complete brand colors with HEX, RGB, and CMYK values</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="p-2 bg-blue-100 rounded-lg mt-1">
                                        <FileImage className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-800">Logo Guidelines</h4>
                                        <p className="text-sm text-slate-600">Usage rules, minimum sizes, and clearspace requirements</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="p-2 bg-green-100 rounded-lg mt-1">
                                        <BookOpen className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-800">Typography</h4>
                                        <p className="text-sm text-slate-600">Font specifications and text hierarchy guidelines</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Status Messages */}
                    <div className="space-y-4">
                        {isGuest && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    Guests cannot upload files or generate assets. Please log in to access these features.
                                </AlertDescription>
                            </Alert>
                        )}
                        
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        
                        {!brandIdentity && !error && (
                            <Alert>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <AlertDescription>Loading brand identity...</AlertDescription>
                            </Alert>
                        )}
                        
                        {/* Debug: Manual Test Button */}
                        <Alert className="border-blue-200 bg-blue-50">
                            <AlertDescription>
                                <div className="space-y-2">
                                    <p className="text-blue-800 text-sm">
                                        🔧 Debug: Brand Identity Status: {brandIdentity ? '✅ Loaded' : '❌ Not Loaded'}
                                    </p>
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={async () => {
                                            try {
                                                console.log('🧪 Manual test: Fetching brand identity...');
                                                const response = await axios.get('http://localhost:3001/api/user/brand-identity');
                                                console.log('🧪 Manual test result:', response.data);
                                                alert('Manual test successful! Check console for details.');
                                            } catch (err) {
                                                console.error('🧪 Manual test failed:', err);
                                                alert('Manual test failed! Check console for details.');
                                            }
                                        }}
                                    >
                                        🧪 Test API Connection
                                    </Button>
                                </div>
                            </AlertDescription>
                        </Alert>
                        
                        {pdfUrl && (
                            <Alert className="border-green-200 bg-green-50">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <AlertDescription>
                                    <div className="space-y-2">
                                        <p className="font-semibold text-green-800">
                                            🎉 Brand Book Generated Successfully!
                                        </p>
                                        <Button asChild variant="outline" size="sm" className="mt-2">
                                            <a 
                                                href={pdfUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-green-700 hover:text-green-800"
                                            >
                                                <Download className="mr-2 h-4 w-4" />
                                                Open Brand Book PDF
                                            </a>
                                        </Button>
                                    </div>
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrandBookGenerator; 