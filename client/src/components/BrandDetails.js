import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { 
    Upload, 
    Palette,
    CheckCircle,
    AlertCircle,
    Loader2,
    Image as ImageIcon,
    Type,
    Sparkles
} from 'lucide-react';

// shadcn/ui imports
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';

const BrandDetails = () => {
    const { brandDetails, setBrandDetails } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleLogoUpload = async (e, logoType) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            setError('Lütfen PNG veya JPEG formatında bir dosya seçin.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('Dosya boyutu 5MB\'den küçük olmalıdır.');
            return;
        }

        const formData = new FormData();
        formData.append('logo', file);

        try {
            setUploading(true);
            setError(null);
            
            const response = await fetch('http://localhost:3001/api/upload/signature-asset', {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            
            if (result.success) {
                setBrandDetails(prev => ({
                    ...prev,
                    [logoType]: result.logoUrl
                }));
                setSuccess(`${logoType === 'logoWithText' ? 'Yazılı logo' : 'Yazısız logo'} başarıyla yüklendi!`);
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError(result.error || 'Logo yüklenirken hata oluştu');
            }
        } catch (error) {
            console.error('Logo yükleme hatası:', error);
            setError('Logo yüklenirken hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setUploading(false);
        }
    };

    const handleColorChange = (colorType, value) => {
        setBrandDetails(prev => ({
            ...prev,
            [colorType]: value
        }));
    };

    return (
        <Card className="border-0 shadow-lg mb-8">
            <CardHeader>
                <CardTitle className="text-2xl text-slate-800 flex items-center">
                    <Sparkles className="mr-3 h-6 w-6" />
                    Brand Details
                </CardTitle>
                <CardDescription>
                    Marka bilgilerinizi bir kez yükleyin, tüm özelliklerde kullanın
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {error && (
                    <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-700">
                            {error}
                        </AlertDescription>
                    </Alert>
                )}

                {success && (
                    <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-700">
                            {success}
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Logo Uploads */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                            <ImageIcon className="mr-2 h-5 w-5" />
                            Logo Dosyaları
                        </h3>
                        
                        {/* Logo Without Text */}
                        <div className="space-y-2">
                            <Label htmlFor="logo-without-text">Logo (Yazısız)</Label>
                            <Input
                                id="logo-without-text"
                                type="file"
                                accept="image/png,image/jpeg,image/jpg"
                                onChange={(e) => handleLogoUpload(e, 'logoWithoutText')}
                                disabled={uploading}
                                className="cursor-pointer"
                            />
                            <p className="text-sm text-slate-500">
                                PNG veya JPEG (maks 5MB)
                            </p>
                            
                            {brandDetails?.logoWithoutText && (
                                <div className="p-3 bg-slate-50 rounded-lg border">
                                    <div className="flex items-center space-x-3">
                                        <img 
                                            src={brandDetails.logoWithoutText} 
                                            alt="Logo yazısız" 
                                            className="w-12 h-12 object-contain rounded border"
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">Logo (Yazısız)</p>
                                            <p className="text-sm text-slate-500">Kullanıma hazır</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Logo With Text */}
                        <div className="space-y-2">
                            <Label htmlFor="logo-with-text">Logo (Yazılı)</Label>
                            <Input
                                id="logo-with-text"
                                type="file"
                                accept="image/png,image/jpeg,image/jpg"
                                onChange={(e) => handleLogoUpload(e, 'logoWithText')}
                                disabled={uploading}
                                className="cursor-pointer"
                            />
                            <p className="text-sm text-slate-500">
                                PNG veya JPEG (maks 5MB)
                            </p>
                            
                            {brandDetails?.logoWithText && (
                                <div className="p-3 bg-slate-50 rounded-lg border">
                                    <div className="flex items-center space-x-3">
                                        <img 
                                            src={brandDetails.logoWithText} 
                                            alt="Logo yazılı" 
                                            className="w-12 h-12 object-contain rounded border"
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">Logo (Yazılı)</p>
                                            <p className="text-sm text-slate-500">Kullanıma hazır</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Brand Colors */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                            <Palette className="mr-2 h-5 w-5" />
                            Marka Renkleri
                        </h3>
                        
                        {/* Primary Color */}
                        <div className="space-y-2">
                            <Label htmlFor="primary-color">Birinci Renk</Label>
                            <div className="flex items-center space-x-3">
                                <Input
                                    id="primary-color"
                                    type="color"
                                    value={brandDetails?.primaryColor || '#4F46E5'}
                                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                                    className="w-16 h-10 border-2 cursor-pointer"
                                />
                                <Input
                                    type="text"
                                    value={brandDetails?.primaryColor || '#4F46E5'}
                                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                                    className="flex-1"
                                    placeholder="#4F46E5"
                                />
                            </div>
                        </div>

                        {/* Secondary Color */}
                        <div className="space-y-2">
                            <Label htmlFor="secondary-color">İkinci Renk</Label>
                            <div className="flex items-center space-x-3">
                                <Input
                                    id="secondary-color"
                                    type="color"
                                    value={brandDetails?.secondaryColor || '#EC4899'}
                                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                                    className="w-16 h-10 border-2 cursor-pointer"
                                />
                                <Input
                                    type="text"
                                    value={brandDetails?.secondaryColor || '#EC4899'}
                                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                                    className="flex-1"
                                    placeholder="#EC4899"
                                />
                            </div>
                        </div>

                        {/* Color Preview */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Renk Önizlemesi</h4>
                            <div className="flex space-x-2">
                                <div 
                                    className="w-12 h-12 rounded border-2 border-white shadow-sm"
                                    style={{ backgroundColor: brandDetails?.primaryColor || '#4F46E5' }}
                                    title="Birinci Renk"
                                />
                                <div 
                                    className="w-12 h-12 rounded border-2 border-white shadow-sm"
                                    style={{ backgroundColor: brandDetails?.secondaryColor || '#EC4899' }}
                                    title="İkinci Renk"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {uploading && (
                    <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <span className="text-slate-600">Logo yükleniyor...</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default BrandDetails; 