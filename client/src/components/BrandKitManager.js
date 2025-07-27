import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import jsPDF from 'jspdf';
import { Download, Paperclip, Image as ImageIcon, Book, Star, UserSquare, Mail, ChevronDown } from 'lucide-react';

// --- HELPER COMPONENTS (Moved outside BrandKitManager to prevent re-renders) ---

const AssetCard = ({ icon, title, description, button, preview = null, children, isExpanded }) => (
    <div className={`rounded-lg shadow-md border transition-colors duration-300 ${isExpanded ? 'bg-blue-50' : 'bg-white'}`}>
        <div className="flex flex-col sm:flex-row items-center gap-5 p-5">
            {preview && (
                <div className="w-full sm:w-64 h-40 flex-shrink-0 bg-white p-2 rounded-md border flex items-center justify-center overflow-hidden">
                    {preview}
                </div>
            )}
            <div className="flex-grow flex flex-col justify-between self-stretch w-full">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
                            {icon}
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{description}</p>
                </div>
                <div className="w-full flex justify-end mt-4">
                    {button}
                </div>
            </div>
        </div>
        <div className={`grid transition-all duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
            <div className="overflow-hidden">
                {children}
            </div>
        </div>
    </div>
);

const PersonalizationForm = ({ details, onChange, companyName }) => (
    <div className="grid grid-cols-1 gap-6 p-4">
        <div>
            <label htmlFor={`fullName-${companyName}`} className="block text-sm font-medium text-gray-700">Ad Soyad</label>
            <input type="text" id={`fullName-${companyName}`} name="fullName" value={details.fullName} onChange={onChange} className="mt-1 block w-full rounded-lg border-gray-300 p-3 text-base shadow-sm focus:border-blue-500 focus:ring-blue-500" placeholder="Örn: Ali Veli" />
        </div>
        <div>
            <label htmlFor={`title-${companyName}`} className="block text-sm font-medium text-gray-700">Unvan</label>
            <input type="text" id={`title-${companyName}`} name="title" value={details.title} onChange={onChange} className="mt-1 block w-full rounded-lg border-gray-300 p-3 text-base shadow-sm focus:border-blue-500 focus:ring-blue-500" placeholder="Örn: Kurucu Ortak" />
        </div>
        <div>
            <label htmlFor={`email-${companyName}`} className="block text-sm font-medium text-gray-700">E-posta</label>
            <input type="email" id={`email-${companyName}`} name="email" value={details.email} onChange={onChange} className="mt-1 block w-full rounded-lg border-gray-300 p-3 text-base shadow-sm focus:border-blue-500 focus:ring-blue-500" placeholder={`iletisim@${companyName.toLowerCase().replace(/\s+/g, '')}.com`} />
        </div>
        <div>
            <label htmlFor={`phone-${companyName}`} className="block text-sm font-medium text-gray-700">Telefon (İsteğe bağlı)</label>
            <input type="tel" id={`phone-${companyName}`} name="phone" value={details.phone} onChange={onChange} className="mt-1 block w-full rounded-lg border-gray-300 p-3 text-base shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
    </div>
);

const BusinessCardEditor = ({ logoSvgBase64, brandColor, personalizedDetails, onDownload, children }) => {
    const [showBack, setShowBack] = useState(false);
    return (
        <div className="p-4 border-t">
            <h4 className="font-bold text-lg text-center mb-4 text-gray-700">Kartvizit Düzenleyici</h4>
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Previews on the left */}
                <div className="w-full md:w-1/2 flex flex-col gap-4">
                    <div>
                        <p className="text-sm font-semibold text-gray-500 mb-1 text-center">Ön Yüz</p>
                        <div className="w-full aspect-[7/4] bg-white border rounded-lg shadow-xl flex items-center p-4">
                            <img src={logoSvgBase64} alt="logo" className="w-1/4 h-auto mr-4 flex-shrink-0" />
                            <div className="text-left overflow-hidden w-full">
                                <p className="text-lg font-bold truncate">{personalizedDetails.fullName || 'Ad Soyad'}</p>
                                <p className="text-base text-gray-600 truncate">{personalizedDetails.title || 'Unvan'}</p>
                                <div className="border-t my-2"></div>
                                <p className="text-xs text-gray-500 truncate">{personalizedDetails.email || 'iletisim@sirket.com'}</p>
                                <p className="text-xs text-gray-500 truncate">{personalizedDetails.phone || ''}</p>
                            </div>
                        </div>
                    </div>
                     <div>
                        <p className="text-sm font-semibold text-gray-500 mb-1 text-center">Arka Yüz</p>
                        <div className="w-full aspect-[7/4] bg-white border rounded-lg shadow-xl flex items-center justify-center p-4" style={{ backgroundColor: brandColor }}>
                           <img src={logoSvgBase64} alt="logo" className="w-1/2 h-auto" style={{ filter: 'brightness(0) invert(1)' }}/>
                        </div>
                    </div>
                </div>

                {/* Form on the right */}
                <div className="w-full md:w-1/2">
                    <p className="text-sm text-gray-600 mb-2">Kartvizit üzerinde görünecek bilgileri girin.</p>
                    {children}
                    <div className="mt-4">
                        <button onClick={onDownload} disabled={!personalizedDetails.fullName} className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400">
                            <Download className="w-4 h-4"/>Kartviziti İndir
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LetterheadEditor = ({ logoSvgBase64, brandColor, companyName, personalizedDetails, onDownload, children }) => (
    <div className="p-4 border-t">
        <h4 className="font-bold text-lg text-center mb-4 text-gray-700">Antetli Kağıt Düzenleyici</h4>
        <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Preview on the left */}
            <div className="w-full md:w-1/2">
                <div className="w-full aspect-[210/297] bg-white border rounded-lg shadow-xl flex flex-col justify-between p-8">
                    <header className="w-full">
                        <img src={logoSvgBase64} alt="logo" className="w-1/3 h-auto" />
                        <div className="w-full h-1.5 mt-4 rounded-full" style={{backgroundColor: brandColor}}></div>
                    </header>
                    <footer className="text-xs text-gray-600 text-center w-full">
                        <p className="font-semibold truncate">{personalizedDetails.fullName ? `${personalizedDetails.fullName}, ${personalizedDetails.title}` : "Ad Soyad, Unvan"}</p>
                        <p className="truncate">{personalizedDetails.email ? `${companyName} | ${personalizedDetails.email}`: "sirket.com | iletisim@sirket.com"}</p>
                    </footer>
                </div>
            </div>
            {/* Form on the right */}
            <div className="w-full md:w-1/2">
                <p className="text-sm text-gray-600 mb-2">Antetli kağıdın altbilgisini (footer) kişiselleştirmek için formu doldurun.</p>
                {children}
                <div className="mt-4">
                    <button onClick={onDownload} disabled={!personalizedDetails.fullName} className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400">
                        <Download className="w-4 h-4"/>Antetli Kağıdı İndir
                    </button>
                </div>
            </div>
        </div>
    </div>
);


const EmailSignatureEditor = ({ logoSvgBase64, brandColor, companyName, personalizedDetails, onDownload, children }) => (
     <div className="p-4 border-t">
        <h4 className="font-bold text-lg text-center mb-4 text-gray-700">E-posta İmzası Düzenleyici</h4>
        <div className="flex flex-col md:flex-row gap-8 items-center">
            {/* Preview on the left */}
            <div className="w-full md:w-1/2">
                <div className="w-full bg-white border rounded-lg shadow-xl p-4">
                    <table className="w-full">
                        <tbody>
                            <tr>
                                <td style={{ paddingRight: '15px', verticalAlign: 'middle' }}>
                                    <img src={logoSvgBase64} alt="logo" style={{ height: '50px', width: 'auto' }}/>
                                </td>
                                <td style={{ borderLeft: '1px solid #eee', paddingLeft: '15px', verticalAlign: 'middle' }}>
                                    <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold' }}>{personalizedDetails.fullName || 'Ad Soyad'}</p>
                                    <p style={{ margin: '2px 0', fontSize: '11px', color: '#555'}}>{personalizedDetails.title || 'Unvan'}</p>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '11px', fontWeight: 'bold', color: brandColor || '#000'}}>{companyName}</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Form on the right */}
            <div className="w-full md:w-1/2">
                <p className="text-sm text-gray-600 mb-2">E-posta imzanızda görünecek bilgileri girin.</p>
                {children}
                <div className="mt-4">
                    <button onClick={onDownload} disabled={!personalizedDetails.fullName} className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400">
                        <Download className="w-4 h-4"/>E-posta İmzası İndir
                    </button>
                </div>
            </div>
        </div>
    </div>
);


const SocialKitPreview = ({ logoSvgBase64, brandColor }) => (
    <div className="flex flex-col w-full h-full gap-1.5 p-1">
        {/* Top Row */}
        <div className="flex-1 flex gap-1.5 min-h-0">
            {/* 1. Color on White */}
            <div className="w-1/2 h-full bg-white border rounded-md flex items-center justify-center p-2">
                <img src={logoSvgBase64} alt="logo preview" className="max-w-full max-h-full" />
            </div>
            
            {/* 2. White on Color */}
            <div className="w-1/2 h-full rounded-md flex items-center justify-center p-2" style={{ backgroundColor: brandColor }}>
                <div 
                    className="w-full h-full"
                    style={{ 
                        backgroundColor: 'white', 
                        maskImage: `url(${logoSvgBase64})`, 
                        WebkitMaskImage: `url(${logoSvgBase64})`,
                        maskSize: 'contain',
                        maskRepeat: 'no-repeat',
                        maskPosition: 'center'
                    }}
                ></div>
            </div>
        </div>

        {/* Bottom Row */}
        <div className="h-[35%] min-h-0">
            <div className="w-full h-full rounded-md flex items-center justify-center p-1" style={{ backgroundColor: brandColor }}>
                <div 
                    className="w-[90%] h-[80%]"
                    style={{ 
                        backgroundColor: 'white', 
                        maskImage: `url(${logoSvgBase64})`, 
                        WebkitMaskImage: `url(${logoSvgBase64})`,
                        maskSize: 'contain',
                        maskRepeat: 'no-repeat',
                        maskPosition: 'center'
                    }}
                ></div>
            </div>
        </div>
    </div>
);

const BrandBookPreview = ({ logoSvgBase64, brandColor, companyName }) => (
    <div className="w-full h-full flex items-center justify-center">
        <div className="aspect-[3/4] h-[95%] bg-white border-2 rounded-sm shadow-lg flex flex-col items-center justify-center p-2">
            <img src={logoSvgBase64} alt="logo" className="w-1/2 h-auto" />
            <div className="mt-2 text-center">
                <p className="text-xs font-bold truncate" style={{ color: brandColor }}>{companyName}</p>
                <p className="text-[8px] text-gray-500">Marka Kılavuzu</p>
            </div>
        </div>
    </div>
);

const LetterheadPreview = ({ logoSvgBase64, brandColor, companyName, personalizedDetails }) => (
    <div className="w-full h-full flex items-center justify-center">
        <div className="aspect-[210/297] h-[95%] bg-white border rounded-sm shadow-sm flex flex-col justify-between p-3">
            <header className="w-full">
                <img src={logoSvgBase64} alt="logo" className="w-1/3 h-auto" />
                <div className="w-full h-1 mt-3 rounded-full" style={{backgroundColor: brandColor}}></div>
            </header>
            <footer className="text-[6px] text-gray-500 text-center w-full">
                <p className="truncate">{personalizedDetails.fullName ? `${personalizedDetails.fullName}, ${personalizedDetails.title}` : "Ad Soyad, Unvan"}</p>
                <p className="truncate">{personalizedDetails.email ? `${companyName} | ${personalizedDetails.email}`: "sirket.com | iletisim@sirket.com"}</p>
            </footer>
        </div>
    </div>
);

const FaviconPreview = ({ logoSvgBase64 }) => (
    <div className="w-full h-full flex items-center justify-center gap-4 p-2 bg-gray-100/50">
        {/* Large */}
        <div className="w-16 h-16 bg-white border rounded-xl flex items-center justify-center p-1 shadow-sm">
            <img src={logoSvgBase64} alt="favicon-64" className="w-12 h-12" />
        </div>
        {/* Medium */}
        <div className="w-12 h-12 bg-white border rounded-lg flex items-center justify-center p-1 shadow-sm">
            <img src={logoSvgBase64} alt="favicon-32" className="w-8 h-8" />
        </div>
        {/* Small */}
        <div className="w-8 h-8 bg-white border rounded-md flex items-center justify-center p-1 shadow-sm">
            <img src={logoSvgBase64} alt="favicon-16" className="w-5 h-5" />
        </div>
    </div>
);

const BusinessCardPreview = ({ logoSvgBase64, personalizedDetails }) => (
    <div className="w-full h-full flex items-center justify-center">
        <div className="w-[95%] aspect-[7/4] bg-white border rounded-lg shadow-md flex items-center p-3">
            <img src={logoSvgBase64} alt="logo" className="w-1/3 h-auto mr-3 flex-shrink-0" />
            <div className="text-left overflow-hidden">
                <p className="text-[9px] font-bold truncate">{personalizedDetails.fullName || 'Ad Soyad'}</p>
                <p className="text-[8px] text-gray-500 truncate">{personalizedDetails.title || 'Unvan'}</p>
            </div>
        </div>
    </div>
);

const EmailSignaturePreview = ({ logoSvgBase64, brandColor, companyName, personalizedDetails }) => (
    <div className="w-full h-full flex items-center justify-center text-left p-1">
        <table className="w-full">
            <tbody>
                <tr>
                    <td style={{ paddingRight: '10px', verticalAlign: 'middle' }}>
                        <img src={logoSvgBase64} alt="logo" style={{ height: '40px', width: 'auto' }}/>
                    </td>
                    <td style={{ borderLeft: '1px solid #eee', paddingLeft: '10px', verticalAlign: 'middle' }}>
                        <p style={{ margin: 0, fontSize: '10px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{personalizedDetails.fullName || 'Ad Soyad'}</p>
                        <p style={{ margin: 0, fontSize: '9px', color: '#555', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{personalizedDetails.title || 'Unvan'}</p>
                        <p style={{ margin: '3px 0 0 0', fontSize: '9px', fontWeight: 'bold', color: brandColor || '#000', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{companyName}</p>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
);


// Helper to render an off-screen SVG string to a canvas for download
const svgToCanvas = (svgString, scale = 1) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const baseWidth = 512;
            const baseHeight = 512;
            canvas.width = baseWidth * scale;
            canvas.height = baseHeight * scale;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(img.src);
            resolve(canvas);
        };
        img.onerror = (err) => {
            URL.revokeObjectURL(img.src);
            reject(new Error("Failed to render SVG to canvas."));
        };
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        img.src = URL.createObjectURL(svgBlob);
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

// Helper to render an off-screen element and capture it as a canvas
const renderAndCapture = async (element, description) => {
    console.log(`[renderAndCapture] Element yakalanıyor: ${description}`);
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    
    document.body.appendChild(element);
    try {
        const canvas = await html2canvas(element, { useCORS: true, scale: 2 });
        return canvas;
    } finally {
        document.body.removeChild(element);
    }
};

const BrandKitManager = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [detailedEdit, setDetailedEdit] = useState(null);
    const [cardDetails, setCardDetails] = useState({
        fullName: '',
        title: '',
        email: '',
        phone: ''
    });

    const { selectedLogo, formData } = location.state || {};

    useEffect(() => {
        if (!selectedLogo || !formData) {
            console.error("Gerekli logo verileri bulunamadı. Ana sayfaya yönlendiriliyor.");
            navigate('/');
        }
    }, [selectedLogo, formData, navigate]);
    
    if (!selectedLogo || !formData) {
        return null; // Render nothing while navigating
    }
    
    const { companyName } = formData;
    const { finalSvg, brandColor } = selectedLogo;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCardDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleDownloadBaseLogos = async () => {
        console.log("Temel logo indirme işlemi başlatıldı.");
        try {
            const zip = new JSZip();
            const folder = zip.folder('Logo_Dosyalari');
            
            // Add SVG
            const svgFilename = `logo_${companyName.toLowerCase().replace(/\s+/g, '_')}.svg`;
            folder.file(svgFilename, finalSvg);

            // Create canvas for raster images
            const canvas = await svgToCanvas(finalSvg, 4); // 4x scale for high quality

            // Add Transparent PNG
            const pngBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            folder.file(`logo_${companyName.toLowerCase().replace(/\s+/g, '_')}_transparent.png`, pngBlob);

            // Add JPG with white background
            const ctx = canvas.getContext('2d');
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            const jpgBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
            folder.file(`logo_${companyName.toLowerCase().replace(/\s+/g, '_')}.jpg`, jpgBlob);

            // Create PDF
            const pdf = new jsPDF('p', 'px', [canvas.width, canvas.height]);
            pdf.addImage(canvas, 'PNG', 0, 0, canvas.width, canvas.height);
            const pdfBlob = pdf.output('blob');
            folder.file(`logo_${companyName.toLowerCase().replace(/\s+/g, '_')}.pdf`, pdfBlob);

            // Generate and download ZIP
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            saveAs(zipBlob, `logo_dosyalari_${companyName.toLowerCase().replace(/\s+/g, '_')}.zip`);
            console.log("Temel logo dosyaları başarıyla zip'lendi ve indirildi.");

        } catch (error) {
            console.error("Temel logo dosyaları indirilirken hata oluştu:", error);
            alert("Dosyalar oluşturulurken bir hata oluştu.");
        }
    };
    
    const handleDownloadSocialKit = async () => {
        console.log("Sosyal medya kiti indirme işlemi başlatıldı.");
        try {
            const zip = new JSZip();
            const socialFolder = zip.folder('Sosyal_Medya_Kiti');
            const logoCanvas = await svgToCanvas(finalSvg, 4); // Yüksek kaliteli ana canvas

            for (const [key, spec] of Object.entries(socialMediaSpecs)) {
                const socialCanvas = document.createElement('canvas');
                socialCanvas.width = spec.width;
                socialCanvas.height = spec.height;
                const ctx = socialCanvas.getContext('2d');
                
                // Kapak fotoğrafları için marka rengi, profil resimleri için beyaz arka plan
                ctx.fillStyle = key.includes('cover') ? brandColor : 'white';
                ctx.fillRect(0, 0, spec.width, spec.height);

                // Logoyu ortalayarak ve orantılı şekilde çiz
                const hRatio = spec.width / logoCanvas.width;
                const vRatio = spec.height / logoCanvas.height;
                const ratio = Math.min(hRatio, vRatio) * 0.8; // Logonun kaplayacağı alan (%80)
                const centerShift_x = (spec.width - logoCanvas.width * ratio) / 2;
                const centerShift_y = (spec.height - logoCanvas.height * ratio) / 2;
                
                ctx.drawImage(logoCanvas, centerShift_x, centerShift_y, logoCanvas.width * ratio, logoCanvas.height * ratio);
                
                const socialBlob = await new Promise(res => socialCanvas.toBlob(res, 'image/png'));
                socialFolder.file(`${key}.png`, socialBlob);
            }

            const zipBlob = await zip.generateAsync({ type: 'blob' });
            saveAs(zipBlob, `sosyal_medya_kiti_${companyName.toLowerCase().replace(/\s+/g, '_')}.zip`);
            console.log("Sosyal medya kiti başarıyla zip'lendi ve indirildi.");

        } catch (error) {
            console.error("Sosyal medya kiti indirilirken hata oluştu:", error);
            alert("Sosyal medya kiti oluşturulurken bir hata oluştu.");
        }
    };
    
    const handleDownloadBrandBook = async () => {
        console.log("Marka Kitabı indirme işlemi başlatıldı.");
        const logoSvgBase64 = `data:image/svg+xml;base64,${btoa(finalSvg)}`;
        const brandBookHtml = `
            <div style="font-family: Arial, sans-serif; color: #333; width: 595px; padding: 30px; box-sizing: border-box;">
                <h1 style="font-size: 24pt; color: ${brandColor}; text-align: center; margin-bottom: 40px;">Marka Kılavuzu: ${companyName}</h1>
                <h2 style="font-size: 16pt; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 30px; margin-bottom: 20px;">1. Logo</h2>
                <img src="${logoSvgBase64}" style="width: 250px; display: block; margin: 0 auto;" />
                <h2 style="font-size: 16pt; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 40px; margin-bottom: 20px;">2. Renk Paleti</h2>
                <div style="display: flex; align-items: center; margin-top: 10px;">
                    <div style="width: 80px; height: 80px; background-color: ${brandColor}; border: 1px solid #ddd;"></div>
                    <div style="margin-left: 20px;">
                        <p style="margin: 0; font-weight: bold;">Ana Marka Rengi</p>
                        <p style="margin: 0;">HEX: ${brandColor}</p>
                    </div>
                </div>
            </div>`;
        
        try {
            const element = document.createElement('div');
            element.innerHTML = brandBookHtml;
            const canvas = await renderAndCapture(element, 'Brand Book');
            const pdf = new jsPDF('p', 'pt', 'a4');
            pdf.addImage(canvas, 'PNG', 0, 0, 595, canvas.height * 595 / canvas.width);
            pdf.save(`marka_kilavuzu_${companyName.toLowerCase().replace(/\s+/g, '_')}.pdf`);
        } catch (error) {
            console.error("Marka Kitabı oluşturulurken hata oluştu:", error);
            alert("Marka Kitabı PDF'i oluşturulurken bir hata oluştu.");
        }
    };

    const handleDownloadPersonalizedLetterhead = async () => {
        if (!cardDetails.fullName || !cardDetails.title) {
            alert("Lütfen devam etmek için kişisel bilgi alanlarını doldurun.");
            return;
        }
        console.log("Kişiselleştirilmiş antetli kağıt indirme işlemi başlatıldı.");
        const logoSvgBase64 = `data:image/svg+xml;base64,${btoa(finalSvg)}`;
        const letterheadHtml = `
            <div style="width: 595px; height: 842px; padding: 40px; background-color: white; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between;">
                <header>
                    <img src="${logoSvgBase64}" style="height: 50px; width: auto;" />
                </header>
                <footer style="font-family: Arial, sans-serif; font-size: 8pt; color: #666; text-align: center; border-top: 1px solid #eee; padding-top: 10px;">
                    <p style="margin: 0;">${cardDetails.fullName}, ${cardDetails.title}</p>
                    <p style="margin: 2px 0;">${companyName} | ${cardDetails.email || ''} | ${cardDetails.phone || ''}</p>
                </footer>
            </div>`;
        
        try {
            const element = document.createElement('div');
            element.innerHTML = letterheadHtml;
            const canvas = await renderAndCapture(element, 'Personalized Letterhead');
            const pdf = new jsPDF('p', 'pt', 'a4');
            pdf.addImage(canvas, 'PNG', 0, 0, 595, 842);
            pdf.save(`antetli_kagit_kisisel_${companyName.toLowerCase().replace(/\s+/g, '_')}.pdf`);
        } catch (error) {
            console.error("Kişiselleştirilmiş antetli kağıt oluşturulurken hata oluştu:", error);
            alert("Kişiselleştirilmiş antetli kağıt oluşturulurken bir hata oluştu.");
        }
    };

    const handleDownloadFavicons = async () => {
        console.log("Favicon indirme işlemi başlatıldı.");
        try {
            const zip = new JSZip();
            const faviconFolder = zip.folder('Favicon_Paketi');
            const logoCanvas = await svgToCanvas(finalSvg, 2); // 2x scale is enough for favicons
            const sizes = [16, 32, 48, 64, 128, 192, 512];
            
            for (const size of sizes) {
                const favCanvas = document.createElement('canvas');
                favCanvas.width = size;
                favCanvas.height = size;
                favCanvas.getContext('2d').drawImage(logoCanvas, 0, 0, size, size);
                const favBlob = await new Promise(res => favCanvas.toBlob(res, 'image/png'));
                faviconFolder.file(`favicon-${size}x${size}.png`, favBlob);
            }
            
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            saveAs(zipBlob, `favicon_paketi_${companyName.toLowerCase().replace(/\s+/g, '_')}.zip`);
        } catch (error) {
            console.error("Favicon'lar oluşturulurken hata oluştu:", error);
            alert("Favicon paketi oluşturulurken bir hata oluştu.");
        }
    };
    
    const handleDownloadBusinessCard = async () => {
        if (!cardDetails.fullName || !cardDetails.title) {
            alert("Lütfen devam etmek için kişisel bilgi alanlarını doldurun.");
            return;
        }
        console.log("Kartvizit indirme işlemi başlatıldı.");
        const logoSvgBase64 = `data:image/svg+xml;base64,${btoa(finalSvg)}`;
        const cardElement = document.createElement('div');
        cardElement.style.width = '700px';
        cardElement.style.height = '400px';
        cardElement.style.padding = '40px';
        cardElement.style.backgroundColor = 'white';
        cardElement.style.fontFamily = 'Arial, sans-serif';
        cardElement.style.boxSizing = 'border-box';
        cardElement.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: flex-start; height: 100%;">
                <img src="${logoSvgBase64}" style="height: 80px; width: auto; margin-right: 30px;" />
                <div style="border-left: 2px solid #f0f0f0; padding-left: 30px; text-align: left;">
                    <h3 style="font-size: 28px; font-weight: bold; color: #222; margin: 0 0 8px 0;">${cardDetails.fullName}</h3>
                    <p style="font-size: 20px; color: #555; margin: 0 0 12px 0;">${cardDetails.title}</p>
                    <p style="font-size: 16px; color: #555; margin: 0;">${cardDetails.email || `iletisim@${companyName.toLowerCase().replace(/\s+/g, '')}.com`}</p>
                    <p style="font-size: 16px; color: #555; margin: 0;">${cardDetails.phone || ''}</p>
                </div>
            </div>`;
        try {
            const canvas = await renderAndCapture(cardElement, 'Business Card');
            const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
            saveAs(blob, `kartvizit_${companyName.toLowerCase().replace(/\s+/g, '_')}.png`);
        } catch (error) {
            console.error("Kartvizit oluşturulurken hata oluştu:", error);
            alert("Kartvizit oluşturulurken bir hata oluştu.");
        }
    };

    const handleDownloadEmailSignature = async () => {
        if (!cardDetails.fullName || !cardDetails.title) {
            alert("Lütfen devam etmek için kişisel bilgi alanlarını doldurun.");
            return;
        }
        console.log("E-posta imzası indirme işlemi başlatıldı.");
        const logoSvgBase64 = `data:image/svg+xml;base64,${btoa(finalSvg)}`;
        const signatureHtml = `
            <!DOCTYPE html>
            <html><head><title>${companyName} E-posta İmzası</title></head>
            <body>
                <table cellpadding="0" cellspacing="0" style="font-family: Arial, sans-serif; font-size: 10pt; color: #333333;">
                    <tr>
                        <td style="padding-right: 15px; vertical-align: top;"><img src="${logoSvgBase64}" alt="logo" style="height: 50px;"/></td>
                        <td style="border-left: 1px solid #cccccc; padding-left: 15px; vertical-align: top;">
                            <p style="margin: 0; font-weight: bold; color: #222222;">${cardDetails.fullName}</p>
                            <p style="margin: 0; color: #555555;">${cardDetails.title}</p>
                            <p style={{ margin: '4px 0', fontWeight: 'bold', color: brandColor || '#000000' }}>${companyName}</p>
                            ${cardDetails.email ? `<p style="margin: 0;"><a href="mailto:${cardDetails.email}" style="color: #0000EE; text-decoration: none;">${cardDetails.email}</a></p>` : ''}
                            ${cardDetails.phone ? `<p style="margin: 0; color: #555555;">${cardDetails.phone}</p>` : ''}
                        </td>
                    </tr>
                </table>
            </body></html>`;
        const blob = new Blob([signatureHtml], { type: 'text/html;charset=utf-8' });
        saveAs(blob, `eposta_imzasi_${companyName.toLowerCase().replace(/\s+/g, '_')}.html`);
    };

    const handleToggleDetailedEdit = (asset) => {
        setDetailedEdit(prev => (prev === asset ? null : asset));
    };

    const logoSvgBase64 = `data:image/svg+xml;base64,${btoa(finalSvg)}`;

    return (
        <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">
            <header>
                <h1 className="text-3xl font-bold text-gray-900">Marka Kiti İndirme Merkezi</h1>
                <p className="text-lg text-gray-600 mt-2">
                    Marka varlıklarınızı buradan yönetebilir ve indirebilirsiniz.
                </p>
            </header>

            {/* Logo Files Section */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold border-b pb-2">Logo Dosyaları</h2>
                <AssetCard
                    icon={<ImageIcon className="w-6 h-6" />}
                    title="Ana Logo Dosyaları (PNG, JPG)"
                    description="Yüksek çözünürlüklü ve şeffaf arka planlı temel logolar."
                    button={<button onClick={handleDownloadBaseLogos} className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"><Download className="w-4 h-4"/>İndir</button>}
                />
                 <AssetCard
                    icon={<Paperclip className="w-6 h-6" />}
                    title="Vektör Dosyaları (SVG, PDF)"
                    description="Kalite kaybı olmadan ölçeklenebilen profesyonel formatlar."
                    button={<button onClick={handleDownloadBaseLogos} className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"><Download className="w-4 h-4"/>İndir</button>}
                />
            </section>

            {/* Brand Kit Section */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold border-b pb-2">Marka Kiti Varlıkları</h2>
                <AssetCard
                    icon={<ImageIcon className="w-6 h-6" />}
                    title="Sosyal Medya Kiti"
                    description="Facebook, Instagram, Twitter vb. için profil ve kapak fotoğrafları."
                    preview={<SocialKitPreview logoSvgBase64={logoSvgBase64} brandColor={brandColor} />}
                    button={<button onClick={handleDownloadSocialKit} className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"><Download className="w-4 h-4"/>İndir</button>}
                />
                <AssetCard
                    icon={<Book className="w-6 h-6" />}
                    title="Marka Kitabı"
                    description="Logo, renk ve font kullanım kurallarını içeren PDF kılavuz."
                    preview={<BrandBookPreview logoSvgBase64={logoSvgBase64} brandColor={brandColor} companyName={companyName} />}
                    button={<button onClick={handleDownloadBrandBook} className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"><Download className="w-4 h-4"/>İndir</button>}
                />
                <AssetCard
                    icon={<ImageIcon className="w-6 h-6" />}
                    title="Favicon Paketi"
                    description="Web siteniz ve uygulamalarınız için çeşitli boyutlarda ikonlar."
                    preview={<FaviconPreview logoSvgBase64={logoSvgBase64} />}
                    button={<button onClick={handleDownloadFavicons} className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"><Download className="w-4 h-4"/>İndir</button>}
                />
                 <AssetCard
                    icon={<ImageIcon className="w-6 h-6" />}
                    title="Antetli Kağıt"
                    description="Kişisel bilgilerinizle alt bilgi eklenmiş olarak indirin."
                    preview={<LetterheadPreview logoSvgBase64={logoSvgBase64} brandColor={brandColor} companyName={companyName} personalizedDetails={cardDetails} />}
                    isExpanded={detailedEdit === 'letterhead'}
                     button={
                        <button onClick={() => handleToggleDetailedEdit('letterhead')} className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                            <ChevronDown className={`w-5 h-5 transition-transform ${detailedEdit === 'letterhead' ? 'rotate-180' : ''}`} />
                            {detailedEdit === 'letterhead' ? 'Kapat' : 'Detaylı Özelleştir'}
                        </button>
                    }
                >
                    <LetterheadEditor 
                        logoSvgBase64={logoSvgBase64} 
                        brandColor={brandColor} 
                        companyName={companyName} 
                        personalizedDetails={cardDetails}
                        onDownload={handleDownloadPersonalizedLetterhead}
                    >
                        <PersonalizationForm details={cardDetails} onChange={handleInputChange} companyName={companyName} />
                    </LetterheadEditor>
                </AssetCard>
                <AssetCard
                    icon={<UserSquare className="w-6 h-6" />}
                    title="Kartvizit"
                    description="Ön ve arka yüzünü görüntülemek ve indirmek için genişletin."
                    preview={<BusinessCardPreview logoSvgBase64={logoSvgBase64} personalizedDetails={cardDetails} />}
                    isExpanded={detailedEdit === 'businessCard'}
                    button={
                        <button onClick={() => handleToggleDetailedEdit('businessCard')} className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                            <ChevronDown className={`w-5 h-5 transition-transform ${detailedEdit === 'businessCard' ? 'rotate-180' : ''}`} />
                            {detailedEdit === 'businessCard' ? 'Kapat' : 'Detaylı Özelleştir'}
                        </button>
                    }
                >
                    <BusinessCardEditor 
                        logoSvgBase64={logoSvgBase64} 
                        brandColor={brandColor} 
                        personalizedDetails={cardDetails}
                        onDownload={handleDownloadBusinessCard}
                    >
                         <PersonalizationForm details={cardDetails} onChange={handleInputChange} companyName={companyName} />
                    </BusinessCardEditor>
                </AssetCard>
                 <AssetCard
                    icon={<Mail className="w-6 h-6" />}
                    title="E-posta İmzası"
                    description="HTML formatında kişisel imzanızı oluşturun ve indirin."
                    preview={<EmailSignaturePreview logoSvgBase64={logoSvgBase64} brandColor={brandColor} companyName={companyName} personalizedDetails={cardDetails} />}
                    isExpanded={detailedEdit === 'emailSignature'}
                     button={
                        <button onClick={() => handleToggleDetailedEdit('emailSignature')} className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                            <ChevronDown className={`w-5 h-5 transition-transform ${detailedEdit === 'emailSignature' ? 'rotate-180' : ''}`} />
                            {detailedEdit === 'emailSignature' ? 'Kapat' : 'Detaylı Özelleştir'}
                        </button>
                    }
                >
                    <EmailSignatureEditor 
                        logoSvgBase64={logoSvgBase64} 
                        brandColor={brandColor} 
                        companyName={companyName} 
                        personalizedDetails={cardDetails}
                        onDownload={handleDownloadEmailSignature}
                    >
                         <PersonalizationForm details={cardDetails} onChange={handleInputChange} companyName={companyName} />
                    </EmailSignatureEditor>
                </AssetCard>
                {/* ... other non-customizable assets */}
            </section>
        </div>
    );
};

export default BrandKitManager; 