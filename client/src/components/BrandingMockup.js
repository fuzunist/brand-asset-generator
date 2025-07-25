import React from 'react';

const BrandingMockup = ({ logo, companyName, brandColor, logoFont }) => {
    return (
        <div className="branding-wrapper w-full h-56 bg-gray-800 rounded-lg p-4 relative overflow-hidden">
            {/* Letterhead - Sol üst */}
            <div className="absolute top-4 left-4 w-24 h-32 bg-white rounded shadow-lg p-2 transform -rotate-2">
                <div className="flex items-center gap-1 mb-2">
                    <img
                        src={logo.previewUrl || logo.preview}
                        alt="Logo"
                        className="w-3 h-3 object-contain"
                    />
                    <span 
                        className="font-bold text-xs"
                        style={{ 
                            color: brandColor,
                            fontFamily: logoFont
                        }}
                    >
                        {companyName}
                    </span>
                </div>
                <div className="space-y-1">
                    <div className="h-1.5 bg-gray-200 rounded"></div>
                    <div className="h-1.5 bg-gray-200 rounded"></div>
                    <div className="h-1.5 bg-gray-200 rounded w-2/3"></div>
                </div>
            </div>

            {/* Notebook - Orta üst */}
            <div 
                className="absolute top-8 left-32 w-20 h-28 rounded shadow-lg flex items-center justify-center transform rotate-2"
                style={{ backgroundColor: brandColor }}
            >
                <div className="flex flex-col items-center gap-1 text-white">
                    <img
                        src={logo.previewUrl || logo.preview}
                        alt="Logo"
                        className="w-3 h-3 object-contain"
                    />
                    <span 
                        className="font-bold text-xs text-center"
                        style={{ fontFamily: logoFont }}
                    >
                        {companyName}
                    </span>
                </div>
            </div>

            {/* Business Card 1 - Sol alt */}
            <div className="absolute bottom-8 left-4 w-20 h-12 bg-white rounded shadow-lg p-1.5">
                <div className="flex items-center gap-1">
                    <img
                        src={logo.previewUrl || logo.preview}
                        alt="Logo"
                        className="w-2.5 h-2.5 object-contain"
                    />
                    <span 
                        className="font-bold text-xs"
                        style={{ 
                            color: brandColor,
                            fontFamily: logoFont
                        }}
                    >
                        {companyName}
                    </span>
                </div>
            </div>

            {/* Business Card 2 - Orta alt */}
            <div 
                className="absolute bottom-8 left-28 w-20 h-12 rounded shadow-lg p-1.5 flex items-center"
                style={{ backgroundColor: brandColor }}
            >
                <div className="flex items-center gap-1 text-white">
                    <img
                        src={logo.previewUrl || logo.preview}
                        alt="Logo"
                        className="w-2.5 h-2.5 object-contain"
                    />
                    <span 
                        className="font-bold text-xs"
                        style={{ fontFamily: logoFont }}
                    >
                        {companyName}
                    </span>
                </div>
            </div>

            {/* Envelope - Sağ alt */}
            <div className="absolute bottom-4 right-4 w-24 h-16 bg-gray-100 rounded shadow-lg p-2 transform rotate-1">
                <div className="flex items-center gap-1">
                    <img
                        src={logo.previewUrl || logo.preview}
                        alt="Logo"
                        className="w-2.5 h-2.5 object-contain"
                    />
                    <span 
                        className="font-bold text-xs"
                        style={{ 
                            color: brandColor,
                            fontFamily: logoFont
                        }}
                    >
                        {companyName}
                    </span>
                </div>
            </div>

            {/* Large Logo Display - Sağ üst */}
            <div className="absolute top-4 right-4">
                <div className="flex flex-col items-center gap-1">
                    <img
                        src={logo.previewUrl || logo.preview}
                        alt="Logo"
                        className="w-8 h-8 object-contain"
                    />
                    <span 
                        className="font-bold text-xs text-white text-center"
                        style={{ 
                            color: brandColor,
                            fontFamily: logoFont
                        }}
                    >
                        {companyName}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default BrandingMockup; 