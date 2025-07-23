import React, { useState } from 'react';
import { Download, Loader2, Sparkles, Image } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';

const AdKitGenerator = () => {
  const [formData, setFormData] = useState({
    headline: '',
    description: '',
    cta: 'Learn More'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess(false);
  };

  const handleGenerate = async () => {
    if (!formData.headline.trim()) {
      setError('Başlık alanı zorunludur.');
      return;
    }

    setIsGenerating(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/ad-kit/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || 'dev-token'}`
        },
        body: JSON.stringify({
          dynamicText: {
            headline: formData.headline,
            description: formData.description,
            cta: formData.cta
          },
          brand_identity_id: 'default' // This would come from user's selected brand
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Reklam kiti oluşturulamadı');
      }

      // Handle file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Brand_OS_Ad_Kit.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess(true);
      
      // Clear form after successful generation
      setTimeout(() => {
        setFormData({
          headline: '',
          description: '',
          cta: 'Learn More'
        });
        setSuccess(false);
      }, 3000);

    } catch (error) {
      console.error('Error generating ad kit:', error);
      setError(error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsGenerating(false);
    }
  };

  const adSizes = [
    { name: 'Square', size: '1080x1080', platform: 'Instagram/Facebook' },
    { name: 'Landscape', size: '1200x628', platform: 'Facebook/LinkedIn' },
    { name: 'Vertical', size: '1080x1920', platform: 'Stories' },
    { name: 'Medium Rectangle', size: '300x250', platform: 'Display Ads' },
    { name: 'Leaderboard', size: '728x90', platform: 'Display Ads' }
  ];

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <CardTitle>Tek Tıkla Reklam Kiti Oluşturucu</CardTitle>
          </div>
          <CardDescription>
            Markanızın kimliğiyle uyumlu, tüm dijital platformlar için profesyonel reklam görselleri oluşturun.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Form Section */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="headline">Başlık *</Label>
              <Input
                id="headline"
                name="headline"
                value={formData.headline}
                onChange={handleInputChange}
                placeholder="Yeni Brand OS 2.0 Yayında!"
                className="mt-1"
                maxLength={50}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {formData.headline.length}/50 karakter
              </p>
            </div>

            <div>
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Markanızı otomatize edin ve büyümeyi hızlandırın."
                className="mt-1"
                rows={3}
                maxLength={150}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {formData.description.length}/150 karakter
              </p>
            </div>

            <div>
              <Label htmlFor="cta">Aksiyon Butonu Metni</Label>
              <Input
                id="cta"
                name="cta"
                value={formData.cta}
                onChange={handleInputChange}
                placeholder="Hemen Keşfet"
                className="mt-1"
                maxLength={30}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {formData.cta.length}/30 karakter
              </p>
            </div>
          </div>

          {/* Ad Sizes Preview */}
          <div className="border rounded-lg p-4 bg-muted/30">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Image className="h-4 w-4" />
              Oluşturulacak Reklam Boyutları
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {adSizes.map((ad, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-background rounded">
                  <div>
                    <p className="font-medium text-sm">{ad.name}</p>
                    <p className="text-xs text-muted-foreground">{ad.size}px</p>
                  </div>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    {ad.platform}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                Reklam kitiniz başarıyla oluşturuldu ve indirildi!
              </AlertDescription>
            </Alert>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !formData.headline.trim()}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Reklam Kiti Oluşturuluyor...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Reklam Kitini Oluştur ve İndir
              </>
            )}
          </Button>

          {/* Info Section */}
          <div className="text-sm text-muted-foreground space-y-2 border-t pt-4">
            <p className="font-medium">Nasıl Çalışır?</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Reklam metninizi girin</li>
              <li>Sistem markanızın renkleri, logosu ve fontlarını otomatik uygular</li>
              <li>Tüm popüler platform boyutlarında reklamlar oluşturulur</li>
              <li>ZIP dosyası olarak tek seferde indirin</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdKitGenerator;