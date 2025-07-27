import React from 'react';

const MockupPreview = ({ logo, companyName, brandColor, logoFont, fontSize = 3, iconSize = 6 }) => {

    return (
        <div className="bg-slate-900 p-4 rounded-xl flex flex-col gap-3 h-[32rem]">
            
            {/* Row 1: Document and Vertical Card */}
            <div className="flex gap-4 flex-grow">
                {/* Document Mockup */}
                <div className="w-2/3 bg-white rounded-lg p-3 flex flex-col h-full">
                    <div className="flex items-center gap-1 mb-2">
                        <div
                            className="flex-shrink-0"
                            style={{
                                width: `${iconSize * 0.6}rem`,
                                height: `${iconSize * 0.6}rem`,
                                backgroundColor: brandColor,
                                maskImage: `url(${logo.previewUrl || logo.preview})`,
                                WebkitMaskImage: `url(${logo.previewUrl || logo.preview})`,
                                maskSize: 'contain',
                                maskRepeat: 'no-repeat',
                                maskPosition: 'center',
                            }}
                        ></div>
                        <span 
                            className="font-bold truncate"
                            style={{
                                color: brandColor,
                                fontFamily: logoFont,
                                fontSize: `${fontSize * 0.5}rem`
                            }}
                        >
                            {companyName}
                        </span>
                    </div>
                    <div className="space-y-1 flex-grow">
                        <div className="h-2 bg-gray-200 rounded w-full"></div>
                        <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                    </div>
                </div>
                {/* Vertical Business Card */}
                <div 
                    className="w-1/3 rounded-lg p-3 flex flex-col items-center justify-center text-white h-full"
                    style={{ backgroundColor: brandColor }}
                >
                    <div
                        className="mb-2"
                        style={{
                            width: `${iconSize * 0.8}rem`,
                            height: `${iconSize * 0.8}rem`,
                            backgroundColor: 'white',
                            maskImage: `url(${logo.previewUrl || logo.preview})`,
                            WebkitMaskImage: `url(${logo.previewUrl || logo.preview})`,
                            maskSize: 'contain',
                            maskRepeat: 'no-repeat',
                            maskPosition: 'center',
                        }}
                    ></div>
                    <span 
                        className="font-bold text-center"
                        style={{
                            fontFamily: logoFont,
                            fontSize: `${fontSize * 0.4}rem`
                        }}
                    >
                        {companyName}
                    </span>
                </div>
            </div>

            {/* Row 2: Horizontal Cards */}
            <div className="flex gap-4 flex-grow">
                {/* Small White Horizontal Card */}
                <div className="w-1/2 bg-white rounded-lg p-3 flex items-center justify-center h-full">
                     <div className="flex items-center gap-1">
                        <div
                            style={{
                                width: `${iconSize * 0.7}rem`,
                                height: `${iconSize * 0.7}rem`,
                                backgroundColor: brandColor,
                                maskImage: `url(${logo.previewUrl || logo.preview})`,
                                WebkitMaskImage: `url(${logo.previewUrl || logo.preview})`,
                                maskSize: 'contain',
                                maskRepeat: 'no-repeat',
                                maskPosition: 'center',
                            }}
                        ></div>
                        <span 
                            className="font-bold"
                            style={{
                                color: brandColor,
                                fontFamily: logoFont,
                                fontSize: `${fontSize * 0.6}rem`
                            }}
                        >
                            {companyName}
                        </span>
                    </div>
                </div>
                 {/* Small Colored Horizontal Card */}
                <div 
                    className="w-1/2 rounded-lg p-3 flex items-center justify-center text-white h-full"
                    style={{ backgroundColor: brandColor }}
                >
                    <div className="flex items-center gap-1">
                        <div
                            style={{
                                width: `${iconSize * 0.7}rem`,
                                height: `${iconSize * 0.7}rem`,
                                backgroundColor: 'white',
                                maskImage: `url(${logo.previewUrl || logo.preview})`,
                                WebkitMaskImage: `url(${logo.previewUrl || logo.preview})`,
                                maskSize: 'contain',
                                maskRepeat: 'no-repeat',
                                maskPosition: 'center',
                            }}
                        ></div>
                        <span 
                            className="font-bold"
                            style={{
                                fontFamily: logoFont,
                                fontSize: `${fontSize * 0.6}rem`
                            }}
                        >
                            {companyName}
                        </span>
                    </div>
                </div>
            </div>

             {/* Row 3: Full-width Dark Mockup */}
             <div className="flex gap-4 flex-grow">
                <div className="w-full bg-gray-800 rounded-lg p-3 flex items-center justify-between h-full">
                    <div className="flex items-center gap-2">
                         <div
                            style={{
                                width: `${iconSize * 0.9}rem`,
                                height: `${iconSize * 0.9}rem`,
                                backgroundColor: brandColor,
                                maskImage: `url(${logo.previewUrl || logo.preview})`,
                                WebkitMaskImage: `url(${logo.previewUrl || logo.preview})`,
                                maskSize: 'contain',
                                maskRepeat: 'no-repeat',
                                maskPosition: 'center',
                            }}
                        ></div>
                        <span 
                            className="font-bold"
                            style={{
                                color: brandColor,
                                fontFamily: logoFont,
                                fontSize: `${fontSize * 0.7}rem`
                            }}
                        >
                            {companyName}
                        </span>
                    </div>
                     <div className="flex items-center gap-2">
                        <a href="#" className="text-gray-400 hover:text-white" style={{fontFamily: logoFont, fontSize: `${fontSize * 0.3}rem`}}>Home</a>
                        <a href="#" className="text-gray-400 hover:text-white" style={{fontFamily: logoFont, fontSize: `${fontSize * 0.3}rem`}}>About</a>
                        <a href="#" className="text-gray-400 hover:text-white" style={{fontFamily: logoFont, fontSize: `${fontSize * 0.3}rem`}}>Contact</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MockupPreview; 