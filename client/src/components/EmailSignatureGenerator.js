import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../AuthContext';
import { 
    Mail, 
    Upload, 
    Download, 
    Copy,
    CheckCircle,
    AlertCircle,
    Loader2,
    Eye,
    Palette,
    User,
    Phone,
    Globe,
    AtSign,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const EmailSignatureGenerator = () => {
    const { token, brandDetails } = useAuth();
    const [brandData, setBrandData] = useState(null);
    const [selectedTemplate, setSelectedTemplate] = useState('template1');
    const [generatedHtml, setGeneratedHtml] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copySuccess, setCopySuccess] = useState(false);

    const templates = [
        { id: 'template1', name: 'Logo on Left', description: 'Professional layout with logo positioned on the left' },
        { id: 'template2', name: 'Logo on Top', description: 'Modern layout with logo positioned above contact info' },
        { id: 'template3', name: 'Compact', description: 'Space-efficient design for minimal signatures' }
    ];

    useEffect(() => {
        const fetchBrandData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                console.log('Fetching brand data with token:', token);
                
                const response = await fetch('http://localhost:3001/api/user/brand-identity', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log('Response status:', response.status);
                console.log('Response headers:', response.headers);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Response error text:', errorText);
                    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
                }
                
                const data = await response.json();
                console.log('Brand data received:', data);
                setBrandData(data);
            } catch (error) {
                console.error('Error fetching brand data:', error);
                console.error('Error details:', {
                    message: error.message,
                    name: error.name,
                    stack: error.stack
                });
                setError(`Failed to load brand data: ${error.message}. Please check if the server is running on http://localhost:3001`);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchBrandData();
        } else {
            setError('No authentication token found. Please refresh the page.');
            setLoading(false);
        }
    }, [token]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const [field, subField] = name.split('.');

        if (subField && brandData) {
            setBrandData(prev => ({
                ...prev,
                userProfile: { ...prev?.userProfile, [subField]: value }
            }));
        } else if (brandData) {
             setBrandData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };
    


    const copyToClipboard = async () => {
        if (!generatedHtml) {
            setError('No signature to copy. Please fill in your details first.');
            return;
        }

        try {
            if (navigator.clipboard && window.ClipboardItem) {
                const blob = new Blob([generatedHtml], { type: 'text/html' });
                const clipboardItem = new window.ClipboardItem({ 'text/html': blob });
                await navigator.clipboard.write([clipboardItem]);
            } else {
                await navigator.clipboard.writeText(generatedHtml);
            }
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
            
            try {
                const textArea = document.createElement('textarea');
                textArea.value = generatedHtml;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
            } catch (fallbackErr) {
                setError('Failed to copy to clipboard. Please manually select and copy the HTML code from the preview.');
            }
        }
    };

    const downloadSignatureHTML = () => {
        if (!generatedHtml) {
            setError('No signature to download. Please fill in your details first.');
            return;
        }

        const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Signature</title>
</head>
<body>
${generatedHtml}
</body>
</html>`;

        const blob = new Blob([fullHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `email-signature-${selectedTemplate}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const generateSignatureHTML = useCallback((templateId, data, logo) => {
        if (!data || !data.userProfile || !data.brandColors) return '';

        const { userProfile, brandColors } = data;
        const styles = {
            table: `font-family: Arial, sans-serif; font-size: 12px; color: #555555;`,
            name: `margin: 0; font-weight: bold; color: ${brandColors.text};`,
            title: `margin: 0; color: #555555;`,
            contactInfo: `margin-top: 10px; margin-bottom: 0;`,
            contactLabel: `color: ${brandColors.primary}; font-weight: bold;`,
        };

        switch (templateId) {
            case 'template2':
                return `
                    <table cellpadding="0" cellspacing="0" border="0" style="${styles.table}">
                        <tr>
                            <td style="padding-bottom: 10px;">
                                ${logo ? `<img src="${logo}" alt="Company Logo" width="150">` : ''}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <p style="${styles.name}">${userProfile.fullName}</p>
                                <p style="${styles.title}">${userProfile.title}</p>
                                <p style="${styles.contactInfo}">
                                    <span style="${styles.contactLabel}">P:</span> <span>${userProfile.phone}</span> | 
                                    <span style="${styles.contactLabel}">E:</span> <span>${userProfile.email}</span> | 
                                    <span style="${styles.contactLabel}">W:</span> <a href="https://${userProfile.website}" style="color: #555555; text-decoration: none;">${userProfile.website}</a>
                                </p>
                            </td>
                        </tr>
                    </table>
                `;
            case 'template3':
                return `
                    <table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, sans-serif; font-size: 11px; color: #555555;">
                      <tr>
                        <td style="padding-right: 10px; vertical-align: middle;">
                          ${logo ? `<img src="${logo}" alt="Company Logo" width="100">` : ''}
                        </td>
                        <td style="border-left: 1px solid ${brandColors.primary}; padding-left: 10px; vertical-align: middle;">
                          <p style="margin: 0; font-weight: bold; color: ${brandColors.text}; font-size: 12px;">${userProfile.fullName}</p>
                          <p style="margin: 0; color: #555555;">${userProfile.title}</p>
                          <p style="margin-top: 5px; margin-bottom: 0;">
                            <a href="mailto:${userProfile.email}" style="color: #555555; text-decoration: none;">${userProfile.email}</a> | 
                            <a href="https://${userProfile.website}" style="color: #555555; text-decoration: none;">${userProfile.website}</a>
                          </p>
                        </td>
                      </tr>
                    </table>
                `;
            case 'template1':
            default:
                return `
                    <table cellpadding="0" cellspacing="0" border="0" style="${styles.table}">
                      <tr>
                        <td style="padding-right: 15px; vertical-align: top;">
                          ${logo ? `<img src="${logo}" alt="Company Logo" width="120">` : ''}
                        </td>
                        <td style="border-left: 1px solid ${brandColors.primary}; padding-left: 15px; vertical-align: top;">
                          <p style="${styles.name}">${userProfile.fullName}</p>
                          <p style="${styles.title}">${userProfile.title}</p>
                          <p style="${styles.contactInfo}">
                            <span style="${styles.contactLabel}">P:</span> <span>${userProfile.phone}</span><br>
                            <span style="${styles.contactLabel}">E:</span> <span>${userProfile.email}</span><br>
                            <span style="${styles.contactLabel}">W:</span> <a href="https://${userProfile.website}" style="color: #555555; text-decoration: none;">${userProfile.website}</a>
                          </p>
                        </td>
                      </tr>
                    </table>
                `;
        }
    }, []);

    useEffect(() => {
        const logoUrl = brandDetails?.logoWithText || brandDetails?.logoWithoutText || '';
        const html = generateSignatureHTML(selectedTemplate, brandData, logoUrl);
        setGeneratedHtml(html);
    }, [brandData, brandDetails, selectedTemplate, generateSignatureHTML]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                            <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
                            <h2 className="text-xl font-semibold">Email Signature Generator</h2>
                            <p className="text-slate-600">Loading brand data...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error && !brandData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                            <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
                            <h2 className="text-xl font-semibold">Email Signature Generator</h2>
                            <p className="text-red-600">{error}</p>
                            <Button onClick={() => window.location.reload()} className="mt-4">
                                Retry
                            </Button>
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
                            <AlertCircle className="h-12 w-12 mx-auto text-slate-500" />
                            <h2 className="text-xl font-semibold">Email Signature Generator</h2>
                            <p className="text-slate-600">No brand data available.</p>
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
                    <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full">
                        <Mail className="h-12 w-12 text-white" />
                    </div>
                </div>
                <div>
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3">
                        Email Signature Generator
                    </h2>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        Create professional email signatures with your brand identity. Choose from templates and customize your details.
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

            {/* Success Alert */}
            {copySuccess && (
                <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                        Email signature copied to clipboard successfully!
                    </AlertDescription>
                </Alert>
            )}

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Controls */}
                <div className="space-y-6">
                    {/* Template Selection */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-lg text-slate-800 flex items-center">
                                <Sparkles className="mr-3 h-5 w-5" />
                                Template Selection
                            </CardTitle>
                            <CardDescription>
                                Choose a signature template that fits your style
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs value={selectedTemplate} onValueChange={setSelectedTemplate}>
                                <TabsList className="grid w-full grid-cols-3">
                                    {templates.map(template => (
                                        <TabsTrigger key={template.id} value={template.id} className="text-sm">
                                            {template.name}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                                {templates.map(template => (
                                    <TabsContent key={template.id} value={template.id} className="mt-4">
                                        <p className="text-sm text-slate-600">{template.description}</p>
                                    </TabsContent>
                                ))}
                            </Tabs>
                        </CardContent>
                    </Card>

                    {/* Brand Details Status */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-lg text-slate-800 flex items-center">
                                <Sparkles className="mr-3 h-5 w-5" />
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
                                            className="w-16 h-16 object-contain rounded border"
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-green-800">
                                                Logo {brandDetails.logoWithText ? '(Yazılı)' : '(Yazısız)'}
                                            </p>
                                            <p className="text-sm text-green-600">E-posta imzasında kullanılıyor</p>
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
                        </CardContent>
                    </Card>

                    {/* Contact Details */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-lg text-slate-800 flex items-center">
                                <User className="mr-3 h-5 w-5" />
                                Contact Details
                            </CardTitle>
                            <CardDescription>
                                Fill in your contact information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input
                                    id="fullName"
                                    name="userProfile.fullName"
                                    value={brandData?.userProfile?.fullName || ''}
                                    onChange={handleInputChange}
                                    placeholder="Enter your full name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="title">Job Title</Label>
                                <Input
                                    id="title"
                                    name="userProfile.title"
                                    value={brandData?.userProfile?.title || ''}
                                    onChange={handleInputChange}
                                    placeholder="Enter your job title"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="phone"
                                        name="userProfile.phone"
                                        value={brandData?.userProfile?.phone || ''}
                                        onChange={handleInputChange}
                                        placeholder="Enter phone number"
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <AtSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="email"
                                        name="userProfile.email"
                                        value={brandData?.userProfile?.email || ''}
                                        onChange={handleInputChange}
                                        placeholder="Enter email address"
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="website">Website</Label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="website"
                                        name="userProfile.website"
                                        value={brandData?.userProfile?.website || ''}
                                        onChange={handleInputChange}
                                        placeholder="Enter website URL"
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                        <Button onClick={copyToClipboard} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Signature
                        </Button>
                        <Button onClick={downloadSignatureHTML} variant="outline" className="border-2">
                            <Download className="mr-2 h-4 w-4" />
                            Download HTML
                        </Button>
                    </div>
                </div>

                {/* Right Column - Preview */}
                <div>
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-lg text-slate-800 flex items-center">
                                <Eye className="mr-3 h-5 w-5" />
                                Live Preview
                                <Badge variant="secondary" className="ml-auto">
                                    {templates.find(t => t.id === selectedTemplate)?.name}
                                </Badge>
                            </CardTitle>
                            <CardDescription>
                                See how your email signature will look
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 bg-slate-50 min-h-64">
                                {generatedHtml ? (
                                    <iframe
                                        srcDoc={generatedHtml}
                                        title="Signature Preview"
                                        sandbox="allow-same-origin"
                                        className="w-full h-full border-none min-h-48"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-48 text-slate-500">
                                        <div className="text-center">
                                            <Mail className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                                            <p>Fill in your details to see the preview</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default EmailSignatureGenerator; 