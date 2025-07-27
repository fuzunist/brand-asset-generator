import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import * as opentype from 'opentype.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
    CheckCircle, 
    Sparkles,
    ArrowLeft,
    ChevronDown,
    HelpCircle,
    BadgePercent
} from 'lucide-react';
import { Button } from './ui/button';

// Helper to render an off-screen SVG string to a canvas
const svgToCanvas = (svgString, scale = 1) => {
    console.log(`%c[svgToCanvas] Başlatıldı. Ölçek: ${scale}`, 'color: green; font-weight: bold;');
    return new Promise((resolve, reject) => {
        const img = new Image();
        console.log('[svgToCanvas] Image nesnesi oluşturuldu.');

        img.onload = () => {
            console.log('[svgToCanvas] img.onload tetiklendi. SVG başarıyla Image nesnesine yüklendi.');
            const canvas = document.createElement('canvas');
            // The SVG from LogoResults is 512x512, we use that as the base
            const baseWidth = 512;
            const baseHeight = 512;
            canvas.width = baseWidth * scale;
            canvas.height = baseHeight * scale;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            console.log(`[svgToCanvas] SVG, ${canvas.width}x${canvas.height} boyutlarındaki canvas üzerine çizildi.`);
            URL.revokeObjectURL(img.src); // Clean up the blob URL
            console.log('[svgToCanvas] Blob URL bellekten temizlendi.');
            resolve(canvas);
        };

        img.onerror = (err) => {
            URL.revokeObjectURL(img.src); // Clean up the blob URL on error too
            console.error("[svgToCanvas] img.onerror tetiklendi. SVG yüklenirken hata oluştu.", err);
            reject(new Error("Failed to render SVG to canvas."));
        };
        
        // Using a blob is more robust for SVG data
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        console.log('[svgToCanvas] SVG verisinden Blob oluşturuldu.');
        img.src = URL.createObjectURL(svgBlob);
        console.log('[svgToCanvas] Image src, oluşturulan Blob URL olarak ayarlandı.');
    });
};


// Helper for social media sizes
const socialMediaSpecs = {
    'facebook_profile': { width: 360, height: 360, label: 'Facebook Profil Resmi' },
    'facebook_cover': { width: 851, height: 315, label: 'Facebook Kapak Fotoğrafı' },
    'instagram_profile': { width: 320, height: 320, label: 'Instagram Profil Resmi' },
    'twitter_profile': { width: 400, height: 400, label: 'Twitter Profil Resmi' },
    'linkedin_profile': { width: 400, height: 400, label: 'LinkedIn Profil Resmi' },
    'linkedin_cover': { width: 1584, height: 396, label: 'LinkedIn Kapak Fotoğrafı' },
    'youtube_profile': { width: 800, height: 800, label: 'YouTube Profil Resmi' },
    'pinterest_profile': { width: 165, height: 165, label: 'Pinterest Profil Resmi' },
};

// Helper to render an off-screen element and capture it
const renderAndCapture = async (element, description) => {
    console.log(`  - Rendering and capturing element: ${description}`);
    document.body.appendChild(element);
    console.log('    - Element appended to body for rendering.');
    const canvas = await html2canvas(element, { 
        backgroundColor: 'white', // Ensure background for letterhead/card
        useCORS: true, 
        scale: 2 // Higher resolution
    });
    console.log(`    - html2canvas generated canvas (${canvas.width}x${canvas.height}).`);
    document.body.removeChild(element);
    console.log('    - Temporary element removed from body.');
    return canvas;
};

const PricingPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [openSections, setOpenSections] = React.useState({
        logo: true,
        kit: true,
    });

    const toggleSection = (section) => {
        console.log(`PricingPage - "${section}" bölümü aç/kapa butonuna tıklandı.`);
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };
    
    const { selectedLogo, formData } = location.state || {};

    useEffect(() => {
        if (!selectedLogo || !formData) {
            navigate('/');
        }
    }, [selectedLogo, formData, navigate]);

    if (!selectedLogo || !formData) {
        return null; // Data is not available, so we render nothing while navigating away.
    }

    const { companyName, fontSize, iconSize } = formData;
    const { previewUrl, brandColor, logoFont, finalSvg } = selectedLogo;
    
    // Fallback değerler - eğer selectedLogo'da yoksa formData'dan al
    const finalBrandColor = brandColor || formData.brandColor || '#000000';
    const finalLogoFont = logoFont || formData.logoFont || 'Arial';
    
    // iconSize için varsayılan değer - 0 ise 1 kullan
    const finalIconSize = iconSize && iconSize > 0 ? iconSize : 1;

    // Logo preview için stil
    const logoStyle = {
        background: finalBrandColor,
        maskImage: `url(${previewUrl})`,
        WebkitMaskImage: `url(${previewUrl})`,
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center'
    };
    
    const basicFeatures = [
        "Standart yüksek kaliteli dosyalar (PNG, JPG)",
        "Ölçeklenebilir vektör dosyaları (SVG, PDF)",
        "Şeffaf arka plan",
        "Tam ticari haklar dahildir"
    ];

    const proFeatures = [
        "Sosyal medya profilleri ve kapak fotoğrafları",
        "Kartvizit",
        "Antetli kağıtlar (Microsoft Word)",
        "E-posta İmza şablonları",
        "Marka Kitabı",
        "Web sitesi ve uygulama için favicon"
    ];

    const handleDownloadBasicKit = async () => {
        console.log('PricingPage - "Temel Paketi Al" butonuna tıklandı.');
        console.log('%c--- START: Basic Kit Download Process ---', 'color: #fd7e14; font-weight: bold; font-size: 1.2em;');
        console.log('Timestamp:', new Date().toISOString());
        console.log('Using final SVG content passed from previous page.');

        try {
            const zip = new JSZip();
            const folder = zip.folder('logo_files');
            console.log('1. JSZip instance and "logo_files" folder created.');
    
            // --- Step 2: Add Final SVG to ZIP ---
            console.group('Step 2: Adding Final SVG to ZIP');
            const svgFilename = `logo_${companyName.toLowerCase().replace(/\s+/g, '_')}.svg`;
            folder.file(svgFilename, finalSvg);
            console.log(`Final SVG content added to ZIP as: ${svgFilename}`);
            console.groupEnd();
    
            // --- Step 3: Create PNG and JPG from a canvas ---
            console.group('Step 3: Generating Raster Images (PNG & JPG)');

            // --- FIX: Render SVG using a more robust canvas method ---
            console.log('Rendering final SVG to a canvas using Image object...');
            const canvas = await svgToCanvas(finalSvg, 2);
            const ctx = canvas.getContext('2d');
            console.log(`SVG has been rendered to an in-memory canvas of size ${canvas.width}x${canvas.height}.`);
            // --- END FIX ---

            // a. Create PNG with transparent background
            console.log('Generating transparent PNG...');
            const pngBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            if(pngBlob) {
                const pngFilename = `logo_${companyName.toLowerCase().replace(/\s+/g, '_')}_transparent.png`;
                folder.file(pngFilename, pngBlob);
                console.log(`  - Transparent PNG created and added to ZIP as: ${pngFilename}`);
            } else {
                 console.error('  - FAILED to create transparent PNG blob.');
            }
    
            // b. Create JPG with white background
            console.log('Generating JPG with white background...');
            // Draw a white background behind the existing transparent logo
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            const jpgBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
            if(jpgBlob) {
                const jpgFilename = `logo_${companyName.toLowerCase().replace(/\s+/g, '_')}.jpg`;
                folder.file(jpgFilename, jpgBlob);
                console.log(`  - JPG created and added to ZIP as: ${jpgFilename}`);
            } else {
                console.error('  - FAILED to create JPG blob.');
            }
            console.groupEnd();
    
            // --- Step 4: Generate and download the ZIP file ---
            console.group('Step 4: Finalizing ZIP File');
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const zipFilename = `logo_kit_basic_${companyName.toLowerCase().replace(/\s+/g, '_')}.zip`;
            console.log(`Generating final ZIP file: ${zipFilename}`);
            saveAs(zipBlob, zipFilename);
            console.log('Download prompt triggered.');
            console.groupEnd();

            console.log('%c--- SUCCESS: Basic Kit Download Process Complete ---', 'color: #28a745; font-weight: bold; font-size: 1.2em;');
    
        } catch(error) {
            console.error('%c--- FATAL ERROR: Basic Kit Download Failed ---', 'color: #dc3545; font-weight: bold; font-size: 1.2em;');
            console.error('An error occurred during the process:', error);
            alert("Dosya indirme işlemi sırasında bir hata oluştu. Lütfen geliştirici konsolunu kontrol edin.");
        }
    };

    const handleGoToBrandKit = () => {
        console.log('PricingPage - "Tam Marka Kiti Yönet" butonuna tıklandı.');
        navigate('/dashboard/brand-kit', { state: { selectedLogo, formData } });
    };


    const handleBack = () => {
        console.log('PricingPage - "Geri Dön" butonuna tıklandı.');
        navigate('/logo-results', { state: { formData } });
    };

    return (
        <div className="min-h-screen bg-gray-100 py-6">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 mb-8">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">Ficonica</span>
                        </div>
                        <button
                            onClick={handleBack}
                            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Geri Dön</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Logo Preview Section */}
            <div className="container mx-auto px-4 mb-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
                            İndireceğiniz Logonun Son Hali
                        </h2>
                        
                        {/* Main Logo Display */}
                        <div className="bg-gray-50 rounded-lg p-8 mb-6">
                            <div className="flex flex-col items-center">
                                <div
                                    className="w-32 h-32 mb-4"
                                    style={logoStyle}
                                ></div>
                                <h3 
                                    className="font-bold text-4xl text-center"
                                    style={{ 
                                        fontFamily: finalLogoFont,
                                        color: finalBrandColor
                                    }}
                                >
                                    {companyName}
                                </h3>
                            </div>
                        </div>

                        {/* Logo Variations Preview */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            {/* White Background */}
                            <div className="bg-white rounded-lg p-6 border border-gray-200 flex flex-col items-center justify-center">
                                <p className="text-xs text-gray-500 mb-3">Beyaz Zemin</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8" style={logoStyle}></div>
                                    <span 
                                        style={{ 
                                            color: finalBrandColor, 
                                            fontFamily: finalLogoFont,
                                            fontSize: '1.2rem',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {companyName}
                                    </span>
                                </div>
                            </div>

                            {/* Colored Background */}
                            <div 
                                className="rounded-lg p-6 flex flex-col items-center justify-center"
                                style={{ backgroundColor: finalBrandColor }}
                            >
                                <p className="text-xs text-white/80 mb-3">Renkli Zemin</p>
                                <div className="flex items-center gap-3">
                                    <div 
                                        className="w-8 h-8" 
                                        style={{
                                            background: 'white',
                                            maskImage: `url(${previewUrl})`,
                                            WebkitMaskImage: `url(${previewUrl})`,
                                            maskSize: 'contain',
                                            WebkitMaskSize: 'contain',
                                            maskRepeat: 'no-repeat',
                                            WebkitMaskRepeat: 'no-repeat',
                                            maskPosition: 'center',
                                            WebkitMaskPosition: 'center'
                                        }}
                                    ></div>
                                    <span 
                                        style={{ 
                                            color: 'white', 
                                            fontFamily: finalLogoFont,
                                            fontSize: '1.2rem',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {companyName}
                                    </span>
                                </div>
                            </div>

                            {/* Dark Background */}
                            <div className="bg-gray-800 rounded-lg p-6 flex flex-col items-center justify-center">
                                <p className="text-xs text-gray-400 mb-3">Koyu Zemin</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8" style={logoStyle}></div>
                                    <span 
                                        style={{ 
                                            color: finalBrandColor, 
                                            fontFamily: finalLogoFont,
                                            fontSize: '1.2rem',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {companyName}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Logo Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-sm font-medium text-gray-900">Şirket Adı</p>
                                <p className="text-xs text-gray-600 mt-1">{companyName}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-sm font-medium text-gray-900">Marka Rengi</p>
                                <div className="flex items-center justify-center gap-2 mt-1">
                                    <div 
                                        className="w-4 h-4 rounded border border-gray-300"
                                        style={{ backgroundColor: finalBrandColor }}
                                    ></div>
                                    <p className="text-xs text-gray-600">{finalBrandColor}</p>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-sm font-medium text-gray-900">Font</p>
                                <p className="text-xs text-gray-600 mt-1" style={{ fontFamily: finalLogoFont }}>
                                    {finalLogoFont}
                                </p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-sm font-medium text-gray-900">Dosya Formatları</p>
                                <p className="text-xs text-gray-600 mt-1">PNG, SVG, PDF</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pricing Section */}
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center mb-12">
                     <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Logonuz hazır!
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Markanız için en uygun paketi seçin ve tüm dosyalara anında sahip olun.
                    </p>
                </div>
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Temel Logo Paketi */}
                    <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200 h-full flex flex-col">
                        <h3 className="text-2xl font-bold mb-2">Temel logo paketi</h3>
                        <p className="text-gray-600 mb-4">Kişisel ve bireysel kullanım için en iyisi</p>
                        
                        <div className="text-4xl font-bold my-4">
                            ₺597
                            <span className="text-2xl font-bold">.95</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-6">Tek Seferlik Ödeme - Ömür Boyu Erişim</p>
                        
                        <Button
                            onClick={handleDownloadBasicKit}
                            variant="outline"
                            className="w-full py-6 text-lg font-semibold mb-8"
                        >
                            Temel Paketi Al
                        </Button>

                        <div className="flex-grow">
                            <h4 className="font-bold mb-4">Logo dosyaları</h4>
                            <ul className="space-y-3 text-left">
                                {basicFeatures.map((feature, index) => (
                                    <li key={index} className="flex items-center">
                                        <CheckCircle className="text-green-500 mr-3 w-5 h-5 flex-shrink-0" />
                                        <span className="text-sm flex-grow">{feature}</span>
                                        <HelpCircle className="text-gray-400 w-4 h-4" />
                                    </li>
                                ))}
                                <li className="flex items-center">
                                    <Sparkles className="text-purple-500 mr-3 w-5 h-5 flex-shrink-0" />
                                    <span className="text-sm flex-grow">20 Yapay Zeka kredisi yaratıcı araçlar</span>
                                    <HelpCircle className="text-gray-400 w-4 h-4" />
                                </li>
                            </ul>
                        </div>
                    </div>


                    {/* Tam Marka Paketi */}
                    <div className="bg-white rounded-lg shadow-2xl p-8 border-2 border-blue-500 relative h-full flex flex-col">
                        <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                            <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white text-sm font-bold px-4 py-1 rounded-full flex items-center gap-1">
                                <Sparkles className="w-4 h-4"/>
                                <span>En Popüler</span>
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold mb-2">Tam marka paketi</h3>
                        <p className="text-gray-600 mb-4">Yeni kurulan ve büyüyen işletmeler için en iyisi</p>
                        
                        <div className="text-4xl font-bold my-4">
                            ₺1197
                            <span className="text-2xl font-bold">.95</span>
                            <span className="text-xl text-gray-400 line-through ml-2">₺1940.00</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-6">Tek Seferlik Ödeme - Ömür Boyu Erişim</p>

                        <Button
                            onClick={handleGoToBrandKit}
                            className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg font-semibold text-white mb-8"
                        >
                            Marka Kitini Yönet
                        </Button>
                        
                        <div className="flex-grow">
                            {/* Logo Dosyaları Accordion */}
                            <div className="border-t border-gray-200 py-4">
                                <button onClick={() => toggleSection('logo')} className="w-full flex justify-between items-center font-bold">
                                    <span>Logo dosyaları</span>
                                    <ChevronDown className={`w-5 h-5 transition-transform ${openSections.logo ? 'rotate-180' : ''}`} />
                                </button>
                                {openSections.logo && (
                                    <ul className="space-y-3 text-left mt-4">
                                        {basicFeatures.map((feature, index) => (
                                            <li key={index} className="flex items-center">
                                                <CheckCircle className="text-green-500 mr-3 w-5 h-5 flex-shrink-0" />
                                                <span className="text-sm flex-grow">{feature}</span>
                                                <HelpCircle className="text-gray-400 w-4 h-4" />
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Marka Kiti Accordion */}
                            <div className="border-t border-b border-gray-200 py-4">
                                <button onClick={() => toggleSection('kit')} className="w-full flex justify-between items-center font-bold">
                                    <span>Marka kiti</span>
                                    <ChevronDown className={`w-5 h-5 transition-transform ${openSections.kit ? 'rotate-180' : ''}`} />
                                </button>
                                {openSections.kit && (
                                     <ul className="space-y-3 text-left mt-4">
                                        {proFeatures.map((feature, index) => (
                                            <li key={index} className="flex items-center">
                                                <CheckCircle className="text-green-500 mr-3 w-5 h-5 flex-shrink-0" />
                                                <span className="text-sm flex-grow">{feature}</span>
                                                <HelpCircle className="text-gray-400 w-4 h-4" />
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-gray-600">
                        Sorularınız mı var?{' '}
                        <a href="#" onClick={() => console.log('PricingPage - "Bizimle iletişime geçin" linkine tıklandı.')} className="text-blue-600 hover:underline">
                            Bizimle iletişime geçin
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PricingPage;