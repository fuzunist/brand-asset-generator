import React from 'react';

const BrandingMockup = ({ logo, companyName, brandColor, logoFont, fontSize = 3, iconSize = 6 }) => {
    
    const logoStyle = (color) => ({
        backgroundColor: color,
        maskImage: `url(${logo.previewUrl || logo.preview})`,
        WebkitMaskImage: `url(${logo.previewUrl || logo.preview})`,
        maskSize: 'contain',
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
    });

    return (
        <div className="bg-slate-800 p-4 rounded-xl shadow-2xl space-y-3">
            
            {/* Row 1: T-shirt and Social Post */}
            <div className="flex gap-4 h-48">
                {/* T-shirt Mockup */}
                <div className="w-1/2 bg-gray-200 rounded-lg p-4 shadow-lg flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute -top-12 -left-12 w-24 h-24 bg-gray-300 rounded-full"></div>
                    <div className="absolute -bottom-12 -right-4 w-32 h-32 bg-gray-300 rounded-full opacity-50"></div>
                    <div
                        className="mb-2 z-10"
                        style={{
                            ...logoStyle(brandColor),
                            width: `${iconSize * 1.2}rem`,
                            height: `${iconSize * 1.2}rem`,
                        }}
                    ></div>
                    <span 
                        className="font-bold z-10 text-center"
                        style={{
                            color: brandColor,
                            fontFamily: logoFont,
                            fontSize: `${fontSize * 0.7}rem`
                        }}
                    >
                        {companyName}
                    </span>
                </div>
                {/* Social Media Post Mockup */}
                <div 
                    className="w-1/2 rounded-lg p-3 shadow-lg flex flex-col justify-between text-white"
                    style={{ backgroundColor: brandColor }}
                >
                    <div className="flex items-center gap-1 mb-2">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                            <div style={{...logoStyle(brandColor), width: '60%', height: '60%'}}></div>
                        </div>
                        <div>
                            <p className="font-bold" style={{fontFamily: logoFont, fontSize: `${fontSize * 0.35}rem`}}>{companyName}</p>
                            <p className="opacity-80" style={{fontSize: `${fontSize * 0.3}rem`}}>Sponsored</p>
                        </div>
                    </div>
                    <div className="flex-grow bg-white/20 rounded-lg mt-1"></div>
                </div>
            </div>

            {/* Row 2: App Icon and Website Header */}
            <div className="flex gap-4 h-24">
                {/* App Icon */}
                <div className="w-1/3 bg-white rounded-lg p-3 shadow-lg flex flex-col items-center justify-center">
                     <div
                        style={{
                            ...logoStyle(brandColor),
                            width: `${iconSize}rem`,
                            height: `${iconSize}rem`,
                        }}
                    ></div>
                    <span 
                        className="font-bold text-center mt-2"
                        style={{
                            color: brandColor,
                            fontFamily: logoFont,
                            fontSize: `${fontSize * 0.35}rem`
                        }}
                    >
                        {companyName}
                    </span>
                </div>
                {/* Website Header */}
                <div 
                    className="w-2/3 rounded-lg p-3 shadow-lg flex items-center justify-between"
                    style={{ backgroundColor: brandColor }}
                >
                    <div className="flex items-center gap-1">
                        <div
                            style={{
                                ...logoStyle('white'),
                                width: `${iconSize * 0.7}rem`,
                                height: `${iconSize * 0.7}rem`,
                            }}
                        ></div>
                        <span 
                            className="font-bold text-white"
                            style={{
                                fontFamily: logoFont,
                                fontSize: `${fontSize * 0.5}rem`
                            }}
                        >
                            {companyName}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-8 bg-white/50 rounded-full"></div>
                        <div className="h-2 w-8 bg-white/50 rounded-full"></div>
                        <div className="h-2 w-8 bg-white/50 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrandingMockup; 