import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    ArrowRight, 
    Download, 
    Edit3, 
    Heart, 
    Share2, 
    Sparkles, 
    CheckCircle,
    Palette,
    Image,
    Type,
    Filter,
    X
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import BrandingMockup from './BrandingMockup';
import MockupPreview from './MockupPreview';

const LOGO_BATCH_SIZE = 4;

// Sektör listesi - Firebase'deki gerçek industry değerleri (1828 logo, 20 sektör analizi)
// En çok logosu olan sektörler üstte sıralanmış
const INDUSTRIES = [
    { value: 'all', label: 'Tüm Sektörler' },
    { value: 'real-estate', label: 'Emlak' },
    { value: 'fitness', label: 'Fitness & Spor' },
    { value: 'agriculture', label: 'Tarım' },
    { value: 'education', label: 'Eğitim' },
    { value: 'technology', label: 'Teknoloji' },
    { value: 'energy', label: 'Enerji' },
    { value: 'finance', label: 'Finans' },
    { value: 'food-beverage', label: 'Gıda & İçecek' },
    { value: 'entertainment', label: 'Eğlence' },
    { value: 'automotive', label: 'Otomotiv' },
    { value: 'healthcare', label: 'Sağlık' },
    { value: 'manufacturing', label: 'İmalat' },
    { value: 'travel', label: 'Seyahat & Turizm' },
    { value: 'beauty', label: 'Güzellik & Kozmetik' },
    { value: 'marketing', label: 'Pazarlama' },
    { value: 'construction', label: 'İnşaat' },
    { value: 'retail', label: 'Perakende' },
    { value: 'non-profit', label: 'Kar Amacı Gütmeyen' },
    { value: 'consulting', label: 'Danışmanlık' },
    { value: 'legal', label: 'Hukuk' }
];

const LogoResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [selectedLogo, setSelectedLogo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [logos, setLogos] = useState([]);
    const [finalLogo, setFinalLogo] = useState(null);
    const [showFinalPreview, setShowFinalPreview] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [lastVisibleTimestamp, setLastVisibleTimestamp] = useState(null);
    
    // Yeni state'ler
    const [showIndustryPopup, setShowIndustryPopup] = useState(false);
    const [selectedIndustry, setSelectedIndustry] = useState('all');
    const [hasTriggeredPopup, setHasTriggeredPopup] = useState(false);
    
    const observer = useRef();

    const loadMoreLogos = useCallback(async () => {
        if (isLoadingMore || !hasMore) return;

        // İlk scroll'da popup'ı tetikle
        if (!hasTriggeredPopup) {
            setShowIndustryPopup(true);
            setHasTriggeredPopup(true);
            return; // Popup açıldığında yüklemeyi durdur
        }

        setIsLoadingMore(true);

        const { LogoService } = await import('../services/logoService');
        const { logos: newLogos, lastTimestamp, hasMore: moreAvailable } = await LogoService.getAllPublishedLogos({
            limitCount: LOGO_BATCH_SIZE,
            lastVisibleTimestamp: lastVisibleTimestamp,
            industry: selectedIndustry === 'all' ? null : selectedIndustry
        });

        const logosWithStyles = newLogos.map(logo => ({
            ...logo,
            brandColor: getRandomColor(),
            logoFont: getRandomFont()
        }));

        setLogos(prevLogos => [...prevLogos, ...logosWithStyles]);
        setLastVisibleTimestamp(lastTimestamp);
        setHasMore(moreAvailable !== undefined ? moreAvailable : newLogos.length >= LOGO_BATCH_SIZE);
        
        setIsLoadingMore(false);

    }, [isLoadingMore, hasMore, lastVisibleTimestamp, selectedIndustry, hasTriggeredPopup]);

    const lastLogoElementRef = useCallback(node => {
        if (isLoadingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMoreLogos();
            }
        });
        if (node) observer.current.observe(node);
    }, [isLoadingMore, hasMore, loadMoreLogos]);

    // Farklı fontlar için array
    const fonts = [
        // Sans-serif
        'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Raleway', 'Nunito', 
        'Source Sans Pro', 'Ubuntu', 'Inter', 'Work Sans', 'Rubik', 'Karla', 'Barlow',
        
        // Serif
        'Merriweather', 'Playfair Display', 'Lora', 'PT Serif', 'Crimson Text', 
        'Domine', 'Bitter', 'Vollkorn', 'Arvo', 'Josefin Sans', 'Comfortaa',
        
        // Display
        'Oswald', 'Anton', 'Bebas Neue', 'Teko', 'Abril Fatface', 'Alfa Slab One', 
        'Lobster', 'Passion One', 'Fredoka One', 'Righteous', 'Ultra',
        
        // Handwriting
        'Dancing Script', 'Pacifico', 'Caveat', 'Satisfy', 'Great Vibes', 'Sacramento',
        'Indie Flower', 'Patrick Hand', 'Permanent Marker', 'Kaushan Script',

        // Monospace
        'Source Code Pro', 'Inconsolata', 'Roboto Mono', 'Space Mono', 'Cutive Mono', 'IBM Plex Mono'
    ];

    const getRandomFont = () => {
        return fonts[Math.floor(Math.random() * fonts.length)];
    };

    useEffect(() => {
        const loadInitialLogos = async () => {
            setIsLoading(true);
            const { LogoService } = await import('../services/logoService');
            
            // Firebase'deki industry dağılımını analiz et (sadece ilk yüklemede)
            if (selectedIndustry === 'all') {
                try {
                    await LogoService.getIndustryDistribution();
                } catch (error) {
                    console.error('Industry analizi yapılamadı:', error);
                }
            }
            
            const { logos: initialLogos, lastTimestamp, hasMore: moreAvailable } = await LogoService.getAllPublishedLogos({
                limitCount: LOGO_BATCH_SIZE,
                lastVisibleTimestamp: null,
                industry: selectedIndustry === 'all' ? null : selectedIndustry
            });

            const logosWithStyles = initialLogos.map(logo => ({
                ...logo,
                brandColor: getRandomColor(),
                logoFont: getRandomFont()
            }));

            setLogos(logosWithStyles);
            setLastVisibleTimestamp(lastTimestamp);
            setHasMore(moreAvailable !== undefined ? moreAvailable : initialLogos.length >= LOGO_BATCH_SIZE);
            setIsLoading(false);
        };

        loadInitialLogos();
    }, [selectedIndustry]);


    const handleLogoSelect = (logo) => {
        setSelectedLogo(logo);
    };

    const handleEdit = (logo) => {
        console.log('LogoResults - "Customize Logo" butonuna tıklandı.');
        const serializableLogo = {
            id: logo.id,
            previewUrl: logo.previewUrl || logo.preview,
            brandColor: logo.brandColor,
            logoFont: logo.logoFont
        };
        navigate('/logo-editor', {
            state: {
                selectedLogo: serializableLogo,
                formData: location.state?.formData
            }
        });
    };

    const handleDownload = () => {
        // Logo indirme işlemi
        alert('Logo indirme özelliği yakında eklenecek!');
    };

    const handlePurchase = async (logo) => {
        console.log('LogoResults - Logo satın alma işlemi başlatıldı.');
        console.log("Starting purchase process for logo:", logo);

        // --- Step 1: Generate the definitive, colored SVG content ---
        const companyName = location.state?.formData?.companyName || 'Company Name';
        const brandColor = logo.brandColor;
        const logoFont = logo.logoFont;
        const previewUrl = logo.previewUrl || logo.preview;

        console.log("Fetching original icon SVG from:", previewUrl);
        const iconResponse = await fetch(previewUrl);
        if (!iconResponse.ok) {
            console.error("Failed to fetch SVG icon for purchase.");
            alert("Logo verileri alınamadı. Lütfen tekrar deneyin.");
            return;
        }
        const originalSvgText = await iconResponse.text();
        console.log("Successfully fetched icon SVG.");

        console.log('%c[SVG Modify] Starting SVG modification process.', 'color: #28a745; font-weight: bold;');
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(originalSvgText, 'image/svg+xml');
        const finalSvgElement = svgDoc.documentElement; // Modify the original SVG element directly
        console.log('[SVG Modify] Original SVG parsed into a document.');


        console.log("[SVG Modify] Applying brand color to icon:", brandColor);
        finalSvgElement.querySelectorAll('*').forEach(el => {
            if (el.tagName.toLowerCase() === 'svg') return;
            const fill = el.getAttribute('fill');
            if (!fill || ['black', '#000', '#000000'].includes(fill.toLowerCase())) {
                el.setAttribute('fill', brandColor);
            }
        });
        console.log('[SVG Modify] Brand color applied.');

        console.log('[SVG Modify] Restructuring SVG content...');
        
        // Preserve <defs> and <style> tags
        const defs = finalSvgElement.querySelector('defs');
        const style = finalSvgElement.querySelector('style');
        
        // Group all visual elements to measure them
        const visualChildren = Array.from(finalSvgElement.children).filter(
            (el) => el.tagName.toLowerCase() !== 'defs' && el.tagName.toLowerCase() !== 'style'
        );

        if (visualChildren.length === 0) {
            console.error("[SVG Modify] No visual elements found in the SVG.");
            alert("The selected icon seems to be empty. Please try another one.");
            return;
        }

        // To accurately measure the bounding box, we must temporarily add the SVG to the live DOM.
        const tempSvg = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'svg');
        const tempGroup = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        visualChildren.forEach(child => tempGroup.appendChild(child.cloneNode(true)));
        tempSvg.appendChild(tempGroup);

        // Style it to be invisible and out of the document flow
        tempSvg.style.position = 'absolute';
        tempSvg.style.top = '-9999px';
        tempSvg.style.left = '-9999px';
        
        document.body.appendChild(tempSvg);
        
        let iconBBox;
        try {
            iconBBox = tempGroup.getBBox();
            console.log('[SVG Modify] Measured icon BBox from live DOM:', iconBBox);
        } catch (e) {
            console.error('[SVG Modify] Could not measure icon dimensions, falling back to defaults.', e);
            iconBBox = { x: 0, y: 0, width: 128, height: 128 }; // Default fallback
        } finally {
            // Clean up by removing the temporary SVG from the DOM
            document.body.removeChild(tempSvg);
        }

        // Now, clear the original SVG content to rebuild it
        while (finalSvgElement.firstChild) {
            finalSvgElement.removeChild(finalSvgElement.firstChild);
        }
        console.log('[SVG Modify] Original SVG content cleared to begin restructuring.');

        // Add back the preserved definitions first
        if (defs) finalSvgElement.appendChild(defs);
        if (style) finalSvgElement.appendChild(style);

        // Set new attributes for the final composition
        const canvasWidth = 512;
        const canvasHeight = 512;
        finalSvgElement.setAttribute('width', String(canvasWidth));
        finalSvgElement.setAttribute('height', String(canvasHeight));
        finalSvgElement.setAttribute('viewBox', `0 0 ${canvasWidth} ${canvasHeight}`);
        console.log('[SVG Modify] SVG container attributes resized.');

        // --- DYNAMIC CENTERING LOGIC ---
        const textHeight = 150; 
        const padding = canvasWidth * 0.1; 

        const availableWidth = canvasWidth - padding * 2;
        const availableHeight = canvasHeight - textHeight - padding;

        const scale = Math.min(
            availableWidth / iconBBox.width,
            availableHeight / iconBBox.height
        );
        
        const scaledIconWidth = iconBBox.width * scale;
        const scaledIconHeight = iconBBox.height * scale;

        const translateX = (canvasWidth - scaledIconWidth) / 2 - (iconBBox.x * scale);
        const translateY = (availableHeight - scaledIconHeight) / 2 - (iconBBox.y * scale) + padding / 2;
        
        console.log(`[SVG Modify] Calculated transform: translate(${translateX}, ${translateY}) scale(${scale})`);
        
        // Create the new group structure
        const mainGroup = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'g');
        const iconGroup = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'g');
        iconGroup.setAttribute('transform', `translate(${translateX}, ${translateY}) scale(${scale})`);
        
        visualChildren.forEach(child => {
            iconGroup.appendChild(child);
        });
        console.log(`[SVG Modify] Reparented ${visualChildren.length} original nodes into new group.`);

        mainGroup.appendChild(iconGroup);
        
        console.log('[SVG Modify] Creating text element for company name...');
        const textElement = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'text');
        textElement.setAttribute('x', '50%');
        textElement.setAttribute('y', `${canvasHeight - textHeight / 1.5}`);
        textElement.setAttribute('font-family', `'${logoFont}', Arial, sans-serif`);
        textElement.setAttribute('font-size', '48px');
        textElement.setAttribute('font-weight', 'bold');
        textElement.setAttribute('text-anchor', 'middle');
        textElement.setAttribute('fill', brandColor);
        textElement.textContent = companyName;
        console.log('[SVG Modify] Text element created.');

        mainGroup.appendChild(textElement);

        finalSvgElement.appendChild(mainGroup);
        console.log('[SVG Modify] All parts assembled into the final SVG document.');

        const serializer = new XMLSerializer();
        const finalSvgContent = serializer.serializeToString(finalSvgElement);
        console.log('%c[SVG Modify] Final SVG content generated and serialized to string.', 'color: #28a745; font-weight: bold;');

        // --- Step 2: Create a serializable object with the final SVG ---
        const serializableLogo = {
            id: logo.id,
            finalSvg: finalSvgContent, // Pass the full SVG content
            previewUrl: previewUrl, // Keep for display purposes on the next page
            brandColor: brandColor,
            logoFont: logoFont,
        };
        console.log("Navigating to /pricing with final logo data.");

        navigate('/pricing', {
            state: {
                selectedLogo: serializableLogo,
                formData: location.state?.formData
            }
        });
    };

    // Final logo oluşturma fonksiyonları
    const handleLikeColor = (logo, brandColor) => {
        setFinalLogo(prev => ({
            logo: prev?.logo || logo,
            color: brandColor,
            font: prev?.font || logo.logoFont,
            companyName: location.state?.formData?.companyName || 'Company Name'
        }));
        setShowFinalPreview(true);
    };

    const handleLikeIcon = (logo, brandColor) => {
        setFinalLogo(prev => ({
            logo: logo,
            color: prev?.color || brandColor,
            font: prev?.font || logo.logoFont,
            companyName: location.state?.formData?.companyName || 'Company Name'
        }));
        setShowFinalPreview(true);
    };

    const handleLikeFont = (logo, brandColor, logoFont) => {
        setFinalLogo(prev => ({
            logo: prev?.logo || logo,
            color: prev?.color || brandColor,
            font: logoFont,
            companyName: location.state?.formData?.companyName || 'Company Name'
        }));
        setShowFinalPreview(true);
    };

    const closeFinalPreview = () => {
        console.log('LogoResults - Final Preview "Kapat" butonuna tıklandı.');
        setShowFinalPreview(false);
        setFinalLogo(null);
    };

    // Rastgele renk oluşturma fonksiyonu
    const getRandomColor = () => {
        return `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
    };

    // Sektör seçimi fonksiyonu
    const handleIndustrySelect = async (industry) => {
        setSelectedIndustry(industry);
        setShowIndustryPopup(false);
        setIsLoading(true);
        setLogos([]);
        setLastVisibleTimestamp(null);
        setHasMore(true);

        // Seçilen sektöre göre logoları yükle
        const { LogoService } = await import('../services/logoService');
        const { logos: newLogos, lastTimestamp, hasMore: moreAvailable } = await LogoService.getAllPublishedLogos({
            limitCount: LOGO_BATCH_SIZE,
            lastVisibleTimestamp: null,
            industry: industry === 'all' ? null : industry
        });

        const logosWithStyles = newLogos.map(logo => ({
            ...logo,
            brandColor: getRandomColor(),
            logoFont: getRandomFont()
        }));

        setLogos(logosWithStyles);
        setLastVisibleTimestamp(lastTimestamp);
        setHasMore(moreAvailable !== undefined ? moreAvailable : newLogos.length >= LOGO_BATCH_SIZE);
        setIsLoading(false);
    };

    // Üst filtreden sektör değişimi
    const handleTopFilterChange = (industry) => {
        handleIndustrySelect(industry);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Logolar yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Industry Selection Popup */}
            {showIndustryPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-2xl p-6 w-96 max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Lütfen Sektör Seçiniz</h3>
                            <button
                                onClick={() => setShowIndustryPopup(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="space-y-2">
                            {INDUSTRIES.map((industry) => (
                                <button
                                    key={industry.value}
                                    onClick={() => handleIndustrySelect(industry.value)}
                                    className="w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 hover:border-blue-300"
                                >
                                    <span className="font-medium text-gray-900">{industry.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Final Logo Preview */}
            {showFinalPreview && finalLogo && (
                <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 w-96">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">Final Logo Preview</h3>
                        <button
                            onClick={closeFinalPreview}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 mb-3">
                        <div className="flex flex-col items-center">
                            <div
                                className="w-16 h-16 object-contain mb-3"
                                style={{
                                    background: finalLogo.color,
                                    maskImage: `url(${finalLogo.logo.previewUrl || finalLogo.logo.preview})`,
                                    WebkitMaskImage: `url(${finalLogo.logo.previewUrl || finalLogo.logo.preview})`,
                                    maskSize: 'contain',
                                    WebkitMaskSize: 'contain',
                                    maskRepeat: 'no-repeat',
                                    WebkitMaskRepeat: 'no-repeat',
                                    maskPosition: 'center',
                                    WebkitMaskPosition: 'center',
                                }}
                            ></div>
                            <h4 
                                className="font-bold text-xl text-center"
                                style={{ 
                                    fontFamily: finalLogo.font,
                                    color: finalLogo.color
                                }}
                            >
                                {finalLogo.companyName}
                            </h4>
                        </div>
                    </div>
                    
                    <div className="final-preview-grid grid grid-cols-3 gap-4">
                            {/* Card 1: White BG, Color Logo */}
                            <div className="bg-white rounded-lg p-4 flex items-center justify-center border">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6" style={{ background: finalLogo.color, maskImage: `url(${finalLogo.logo.previewUrl})`, WebkitMaskImage: `url(${finalLogo.logo.previewUrl})`, maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskPosition: 'center' }}></div>
                                    <span style={{ color: finalLogo.color, fontFamily: finalLogo.font, fontSize: '1rem' }}>{finalLogo.companyName}</span>
                                </div>
                            </div>
                             {/* Card 2: Color BG, White Logo */}
                            <div className="rounded-lg p-4 flex items-center justify-center" style={{ backgroundColor: finalLogo.color }}>
                                 <div className="flex items-center gap-2">
                                    <div className="w-6 h-6" style={{ background: 'white', maskImage: `url(${finalLogo.logo.previewUrl})`, WebkitMaskImage: `url(${finalLogo.logo.previewUrl})`, maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskPosition: 'center' }}></div>
                                    <span style={{ color: 'white', fontFamily: finalLogo.font, fontSize: '1rem' }}>{finalLogo.companyName}</span>
                                </div>
                            </div>
                             {/* Card 3: Dark BG, Color Logo */}
                            <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-center">
                                 <div className="flex items-center gap-2">
                                    <div className="w-6 h-6" style={{ background: finalLogo.color, maskImage: `url(${finalLogo.logo.previewUrl})`, WebkitMaskImage: `url(${finalLogo.logo.previewUrl})`, maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskPosition: 'center' }}></div>
                                    <span style={{ color: finalLogo.color, fontFamily: finalLogo.font, fontSize: '1rem' }}>{finalLogo.companyName}</span>
                                </div>
                            </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-2">
                        <Button variant="outline" onClick={closeFinalPreview}>Kapat</Button>
                        <Button onClick={() => { console.log('LogoResults - Final Preview "Beğendim, Devam Et" butonuna tıklandı.'); handlePurchase(finalLogo.logo); }}>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Beğendim, Devam Et
                        </Button>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">Ficonica</span>
                        </div>
                        <button
                            onClick={() => { console.log('LogoResults - "Geri" butonuna tıklandı.'); navigate('/logo-creator'); }}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            Logo Designs for {location.state?.formData?.companyName}
                        </h1>
                        <p className="text-gray-600 max-w-2xl mx-auto mb-6">
                            AI has created amazing logo designs for you. 
                            Choose your favorite design and create your brand kit.
                        </p>
                        
                        {/* Industry Filter */}
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <Filter className="w-5 h-5 text-gray-600" />
                            <select
                                value={selectedIndustry}
                                onChange={(e) => handleTopFilterChange(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {INDUSTRIES.map((industry) => (
                                    <option key={industry.value} value={industry.value}>
                                        {industry.label}
                                    </option>
                                ))}
                            </select>
                            {selectedIndustry !== 'all' && (
                                <span className="text-sm text-blue-600 font-medium">
                                    {INDUSTRIES.find(i => i.value === selectedIndustry)?.label} sektörü
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Logo Cards - One per row, horizontal layout */}
                    <div className="space-y-6">
                        {logos.map((logo, index) => {
                            const logoStyle = {
                                background: logo.brandColor,
                                maskImage: `url(${logo.previewUrl || logo.preview})`,
                                WebkitMaskImage: `url(${logo.previewUrl || logo.preview})`,
                                maskSize: 'contain',
                                WebkitMaskSize: 'contain',
                                maskRepeat: 'no-repeat',
                                WebkitMaskRepeat: 'no-repeat',
                                maskPosition: 'center',
                                WebkitMaskPosition: 'center'
                            };
                            return (
                                <Card
                                    key={logo.id}
                                    ref={logos.length === index + 1 ? lastLogoElementRef : null}
                                    className={`transition-all hover:shadow-lg bg-white`}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex flex-col lg:flex-row gap-6 lg:items-stretch">
                                                                                    {/* Left Side - Logo */}
                                        <div className="lg:w-1/2">
                                            <div className="flex flex-col items-center justify-start h-[32rem]">
                                                {/* Logo and Company Name Combined */}
                                                <div className="w-full h-full bg-white rounded-lg flex flex-col items-center justify-center p-4 border border-gray-200">
                                                    {/* Logo Icon */}
                                                    <div className="mb-2">
                                                        <div
                                                            className="w-56 h-56"
                                                            style={logoStyle}
                                                        ></div>
                                                    </div>
                                                    
                                                    {/* Company Name */}
                                                    <h3 
                                                        className="font-bold text-6xl text-center leading-tight" 
                                                        style={{ 
                                                            fontFamily: logo.logoFont,
                                                            color: logo.brandColor
                                                        }}
                                                    >
                                                        {location.state?.formData?.companyName || 'Company Name'}
                                                    </h3>
                                                </div>

                                                {/* Selection Indicator removed from here */}
                                            </div>
                                        </div>

                                            {/* Right Side - Mockup Preview */}
                                            <div className="lg:w-1/2">
                                                {/* Mockup preview area */}
                                                <div>
                                                    {/* Alternating Mockup Previews */}
                                                    {logos.indexOf(logo) % 2 === 0 ? (
                                                        <MockupPreview 
                                                            logo={logo}
                                                            companyName={location.state?.formData?.companyName || 'Company Name'}
                                                            brandColor={logo.brandColor}
                                                            logoFont={logo.logoFont}
                                                        />
                                                    ) : (
                                                        <BrandingMockup 
                                                            logo={logo}
                                                            companyName={location.state?.formData?.companyName || 'Company Name'}
                                                            brandColor={logo.brandColor}
                                                            logoFont={logo.logoFont}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Buttons area for the whole card */}
                                        <div className="pt-6 space-y-4">
                                            {/* Like Buttons */}
                                            <div className="flex gap-3">
                                                <Button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        console.log('LogoResults - "Rengi Beğendim" butonuna tıklandı.');
                                                        handleLikeColor(logo, logo.brandColor);
                                                    }}
                                                    variant="outline"
                                                    className="flex-1"
                                                >
                                                    <Palette className="w-4 h-4 mr-2" />
                                                    <span>Rengi Beğendim</span>
                                                </Button>
                                                <Button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        console.log('LogoResults - "İkonu Beğendim" butonuna tıklandı.');
                                                        handleLikeIcon(logo, logo.brandColor);
                                                    }}
                                                    variant="outline"
                                                    className="flex-1"
                                                >
                                                    <Image className="w-4 h-4 mr-2" />
                                                    <span>İkonu Beğendim</span>
                                                </Button>
                                                <Button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        console.log('LogoResults - "Fontu Beğendim" butonuna tıklandı.');
                                                        handleLikeFont(logo, logo.brandColor, logo.logoFont);
                                                    }}
                                                    variant="outline"
                                                    className="flex-1"
                                                >
                                                    <Type className="w-4 h-4 mr-2" />
                                                    <span>Fontu Beğendim</span>
                                                </Button>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-3">
                                                <Button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEdit(logo);
                                                    }}
                                                    variant="outline"
                                                    className="flex-1 text-base font-semibold py-5"
                                                >
                                                    <Edit3 className="w-5 h-5 mr-2" />
                                                    Customize Logo
                                                </Button>
                                                <Button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        console.log('LogoResults - "Get Logo & Brand Kit" butonuna tıklandı.');
                                                        handlePurchase(logo);
                                                    }}
                                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-base font-semibold py-5"
                                                >
                                                    <Sparkles className="w-5 h-5 mr-2" />
                                                    Get Logo & Brand Kit
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Loading indicator for infinite scroll */}
                    {isLoadingMore && (
                        <div className="text-center py-6">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        </div>
                    )}

                    {/* Package Info */}
                    <div className="bg-white rounded-lg p-6 mt-8">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                                    <div className="w-6 h-6 bg-blue-600 rounded-sm"></div>
                                </div>
                                <p className="font-medium text-gray-900 text-sm">High Quality Logo Files</p>
                                <p className="text-xs text-gray-600">PNG, SVG, JPG</p>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                                    <div className="w-6 h-6 bg-green-600 rounded-full"></div>
                                </div>
                                <p className="font-medium text-gray-900 text-sm">Social Media Kit</p>
                                <p className="text-xs text-gray-600">Profiles & Covers</p>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                                    <div className="w-6 h-6 bg-purple-600 rounded-sm"></div>
                                </div>
                                <p className="font-medium text-gray-900 text-sm">Brand Stationery</p>
                                <p className="text-xs text-gray-600">Letterhead & More</p>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                                    <span className="text-orange-600 font-bold text-lg">C</span>
                                </div>
                                <p className="font-medium text-gray-900 text-sm">Customize Every Time</p>
                                <p className="text-xs text-gray-600">Colors, Fonts & More</p>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-3">
                                    <span className="text-red-600 font-bold text-lg">C</span>
                                </div>
                                <p className="font-medium text-gray-900 text-sm">Commercial Use</p>
                                <p className="text-xs text-gray-600">Lifetime License</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogoResults; 