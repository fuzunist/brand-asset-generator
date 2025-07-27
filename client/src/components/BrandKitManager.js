import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import jsPDF from 'jspdf';
import { Download, Paperclip, Image as ImageIcon, Book, Star, UserSquare, Mail, ChevronDown, Check } from 'lucide-react';

// --- CARD TEMPLATES (NEW) ---

const CardTemplateMinimal = ({ logoSvgBase64, brandColor, personalizedDetails, companyName }) => (
    <div className="w-full h-full flex flex-col justify-between p-8 text-gray-800 bg-white relative overflow-hidden">
        {/* Decorative Shape */}
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full" style={{ backgroundColor: brandColor, opacity: 0.1 }}></div>
        
        {/* Header */}
        <div className="flex items-center space-x-4">
            <img src={logoSvgBase64} alt="logo" className="w-16 h-16" />
            <div>
                 <p className="text-lg font-bold">{companyName}</p>
            </div>
        </div>

        {/* Details */}
        <div className="text-left">
            <h3 className="text-2xl font-bold tracking-tight">{personalizedDetails.fullName || 'Ad Soyad'}</h3>
            <p className="text-lg text-gray-600" style={{ color: brandColor }}>{personalizedDetails.title || 'Unvan'}</p>
            <div className="w-1/5 border-t my-4" style={{ borderColor: brandColor }}></div>
            <p className="text-sm text-gray-500">{personalizedDetails.email || `iletisim@${companyName.toLowerCase().replace(/\s+/g, '')}.com`}</p>
            <p className="text-sm text-gray-500">{personalizedDetails.phone || '+90 555 123 4567'}</p>
        </div>
    </div>
);


const CardTemplateMinimalBack = ({ logoSvgBase64, brandColor }) => (
    <div className="w-full h-full flex justify-center items-center bg-white relative">
         <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundColor: brandColor, opacity: 0.9 }}></div>
        <img src={logoSvgBase64} alt="logo" className="w-1/2 h-auto relative" style={{ filter: 'brightness(0) invert(1)' }}/>
    </div>
);

const CardTemplateClassic = ({ logoSvgBase64, brandColor, personalizedDetails, companyName }) => (
    <div className="w-full h-full flex flex-col justify-between p-8 bg-[#F8F5F2] text-gray-800">
        <div className="text-center">
            <h3 className="text-3xl font-serif font-bold" style={{ color: brandColor }}>{personalizedDetails.fullName || 'Ad Soyad'}</h3>
            <p className="text-xl font-serif text-gray-600 tracking-wider">{personalizedDetails.title || 'Unvan'}</p>
        </div>
        <div className="flex items-center justify-between">
            <div className="text-left text-sm">
                <p className="font-semibold">{companyName}</p>
                <p>{personalizedDetails.email || `iletisim@${companyName.toLowerCase().replace(/\s+/g, '')}.com`}</p>
                <p>{personalizedDetails.phone || '+90 555 123 4567'}</p>
            </div>
            <img src={logoSvgBase64} alt="logo" className="w-20 h-20" />
        </div>
    </div>
);


const CardTemplateClassicBack = ({ logoSvgBase64, brandColor }) => (
    <div className="w-full h-full flex justify-center items-center p-6" style={{ backgroundColor: brandColor }}>
        <div className="w-full h-full border-4 border-white flex justify-center items-center">
            <img src={logoSvgBase64} alt="logo" className="w-1/3 h-auto" style={{ filter: 'brightness(0) invert(1)' }} />
        </div>
    </div>
);

const CardTemplateModern = ({ logoSvgBase64, brandColor, personalizedDetails, companyName }) => (
    <div className="w-full h-full bg-gray-900 text-white flex flex-col p-8 relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full" style={{ backgroundColor: brandColor, opacity: 0.5 }}></div>
        <div className="absolute -bottom-16 -right-5 w-48 h-48 rounded-md transform rotate-45" style={{ backgroundColor: brandColor, opacity: 0.5 }}></div>
        
        <div className="z-10 flex-grow flex flex-col justify-center">
            <img src={logoSvgBase64} alt="logo" className="w-24 h-24 mb-6 self-start" style={{ filter: 'brightness(0) invert(1)' }}/>
            <div className="text-left mt-auto">
                 <h3 className="text-3xl font-extrabold tracking-tighter">{personalizedDetails.fullName || 'Ad Soyad'}</h3>
                 <p className="text-xl font-light tracking-wider text-gray-300" style={{ color: brandColor }}>{personalizedDetails.title || 'Unvan'}</p>
            </div>
        </div>
        <div className="z-10 mt-6 text-left text-sm text-gray-400">
             <div className="border-t border-gray-700 my-4 w-full"></div>
            <p>{companyName}</p>
            <p>{personalizedDetails.email || `iletisim@${companyName.toLowerCase().replace(/\s+/g, '')}.com`}</p>
            <p>{personalizedDetails.phone || '+90 555 123 4567'}</p>
        </div>
    </div>
);


const CardTemplateModernBack = ({ logoSvgBase64, brandColor }) => (
    <div className="w-full h-full bg-gray-900 flex justify-center items-center">
         <img src={logoSvgBase64} alt="logo" className="w-1/2 h-auto" style={{ filter: 'brightness(0) invert(1)' }}/>
    </div>
);

const CardBackSide = ({ logoSvgBase64, brandColor }) => (
     <div className="w-full h-full flex items-center justify-center p-4">
        <img src={logoSvgBase64} alt="logo" className="w-1/2 h-auto" style={{ filter: 'brightness(0) invert(1)' }}/>
     </div>
);

// --- LETTERHEAD TEMPLATES (NEW) ---
const LetterheadTemplateMinimal = ({ logoSvgBase64, brandColor, companyName, personalizedDetails }) => (
    <div className="w-full h-full bg-white flex flex-col justify-between p-12 font-sans">
        <header>
            <img src={logoSvgBase64} alt="logo" className="h-12 w-auto" />
        </header>
        <footer className="text-xs text-gray-500 w-full">
            <div className="w-full h-px mb-4" style={{ backgroundColor: brandColor }}></div>
            <div className="flex justify-between items-center">
                <div>
                    <p><span className="font-bold text-gray-700">{personalizedDetails.fullName || 'Ad Soyad'}</span>, {personalizedDetails.title || 'Unvan'}</p>
                    <p>{personalizedDetails.email || `iletisim@${companyName.toLowerCase().replace(/\s+/g, '')}.com`}</p>
                </div>
                <p className="font-bold text-gray-700">{companyName}</p>
            </div>
        </footer>
    </div>
);

const LetterheadTemplateClassic = ({ logoSvgBase64, brandColor, companyName, personalizedDetails }) => (
    <div className="w-full h-full bg-[#F8F5F2] flex flex-col justify-between p-12 font-serif text-gray-800">
        <header className="text-center">
            <img src={logoSvgBase64} alt="logo" className="h-16 w-auto mx-auto mb-4" />
            <h1 className="text-2xl font-bold" style={{ color: brandColor }}>{companyName}</h1>
        </header>
        <footer className="text-sm text-gray-600 text-center w-full">
            <div className="w-1/3 h-px bg-gray-300 mx-auto mb-4"></div>
            <p><span className="font-bold">{personalizedDetails.fullName || 'Ad Soyad'}</span>, {personalizedDetails.title || 'Unvan'}</p>
            <p>{personalizedDetails.email || `iletisim@${companyName.toLowerCase().replace(/\s+/g, '')}.com`} | {personalizedDetails.phone || ''}</p>
        </footer>
    </div>
);

const LetterheadTemplateModern = ({ logoSvgBase64, brandColor, companyName, personalizedDetails }) => (
    <div className="w-full h-full bg-white flex relative overflow-hidden">
        <div className="w-20 h-full" style={{ backgroundColor: brandColor }}></div>
        <div className="absolute top-12 left-6">
            <img src={logoSvgBase64} alt="logo" className="h-12 w-auto" style={{ filter: 'brightness(0) invert(1)' }}/>
        </div>
        <div className="flex-grow flex flex-col justify-end p-12">
            <footer className="text-sm text-gray-700 w-full">
                <p className="text-lg font-extrabold">{personalizedDetails.fullName || 'Ad Soyad'}</p>
                <p className="font-light text-gray-500">{personalizedDetails.title || 'Unvan'}</p>
                 <div className="w-full h-px bg-gray-200 my-3"></div>
                <p className="font-semibold">{companyName}</p>
                <p>{personalizedDetails.email || `iletisim@${companyName.toLowerCase().replace(/\s+/g, '')}.com`}</p>
                <p>{personalizedDetails.phone || ''}</p>
            </footer>
        </div>
    </div>
);


// --- EMAIL SIGNATURE TEMPLATES (NEW) ---

const EmailSignatureTemplateMinimal = ({ logoSvgBase64, brandColor, companyName, personalizedDetails }) => {
    const email = personalizedDetails.email || `iletisim@${companyName.toLowerCase().replace(/\s+/g, '')}.com`;
    return (
        <table cellPadding="0" cellSpacing="0" style={{ 
            fontFamily: 'Arial, Helvetica, sans-serif', 
            fontSize: '13px', 
            lineHeight: '1.3',
            color: '#333333', 
            borderCollapse: 'collapse',
            width: '100%',
            maxWidth: '600px',
            height: '78px'
        }}>
            <tbody>
                <tr>
                    <td style={{ 
                        paddingRight: '14px', 
                        verticalAlign: 'middle',
                        width: '70px'
                    }}>
                        <img 
                            src={logoSvgBase64} 
                            alt={`${companyName} logo`} 
                            style={{ 
                                height: '50px', 
                                width: 'auto', 
                                display: 'block',
                                maxWidth: '70px'
                            }}
                        />
                    </td>
                    <td style={{ 
                        borderLeft: `3px solid ${brandColor}`, 
                        paddingLeft: '14px', 
                        verticalAlign: 'middle'
                    }}>
                        <div style={{ marginBottom: '6px' }}>
                            <p style={{ 
                                margin: '0', 
                                fontWeight: 'bold', 
                                color: '#111111', 
                                fontSize: '15px',
                                lineHeight: '1.2'
                            }}>
                                {personalizedDetails.fullName || 'Ad Soyad'}
                            </p>
                            <p style={{ 
                                margin: '1px 0 0 0', 
                                color: '#666666',
                                fontSize: '13px',
                                fontWeight: '500'
                            }}>
                                {personalizedDetails.title || 'Unvan'}
                            </p>
                        </div>
                        <div style={{ fontSize: '12px', lineHeight: '1.3' }}>
                            <p style={{ 
                                margin: '0 0 1px 0', 
                                fontWeight: 'bold', 
                                color: brandColor,
                                fontSize: '13px'
                            }}>
                                {companyName}
                            </p>
                            <p style={{ margin: '0 0 1px 0' }}>
                                <a 
                                    href={`mailto:${email}`} 
                                    style={{ 
                                        color: '#0066cc', 
                                        textDecoration: 'none',
                                        fontWeight: '500'
                                    }}
                                >
                                    {email}
                                </a>
                            </p>
                            {personalizedDetails.phone && (
                                <p style={{ 
                                    margin: '0', 
                                    color: '#666666'
                                }}>
                                    {personalizedDetails.phone}
                                </p>
                            )}
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    );
};

const EmailSignatureTemplateClassic = ({ logoSvgBase64, brandColor, companyName, personalizedDetails }) => {
    const email = personalizedDetails.email || `iletisim@${companyName.toLowerCase().replace(/\s+/g, '')}.com`;
    return (
        <table cellPadding="0" cellSpacing="0" style={{ 
            fontFamily: 'Georgia, Times, serif', 
            fontSize: '13px', 
            color: '#333333', 
            width: '100%',
            maxWidth: '600px',
            borderCollapse: 'collapse',
            border: `2px solid ${brandColor}`,
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: '#fefefe',
            height: '78px'
        }}>
            <tbody>
                <tr>
                    <td style={{ 
                        verticalAlign: 'middle',
                        padding: '14px',
                        width: '70px',
                        textAlign: 'center',
                        backgroundColor: '#fafafa',
                        borderRight: `1px solid #e5e5e5`
                    }}>
                        <img 
                            src={logoSvgBase64} 
                            alt={`${companyName} logo`} 
                            style={{ 
                                height: '50px', 
                                width: 'auto', 
                                display: 'block', 
                                margin: '0 auto'
                            }} 
                        />
                    </td>
                    <td style={{ 
                        verticalAlign: 'middle',
                        padding: '14px 16px',
                        textAlign: 'left'
                    }}>
                        <div style={{ marginBottom: '6px' }}>
                            <p style={{ 
                                margin: '0', 
                                fontSize: '15px', 
                                fontWeight: 'bold', 
                                color: brandColor,
                                lineHeight: '1.2'
                            }}>
                                {personalizedDetails.fullName || 'Ad Soyad'}
                            </p>
                            <p style={{ 
                                margin: '1px 0 0 0', 
                                fontSize: '13px', 
                                color: '#666666',
                                fontStyle: 'italic',
                                lineHeight: '1.2'
                            }}>
                                {personalizedDetails.title || 'Unvan'}
                            </p>
                        </div>
                        <div style={{ 
                            borderTop: '1px solid #e5e5e5', 
                            paddingTop: '6px',
                            fontSize: '12px',
                            lineHeight: '1.3'
                        }}>
                            <p style={{ 
                                margin: '0 0 1px 0', 
                                fontWeight: 'bold', 
                                color: '#333333',
                                fontSize: '13px'
                            }}>
                                {companyName}
                            </p>
                            <p style={{ margin: '0 0 1px 0' }}>
                                <a 
                                    href={`mailto:${email}`} 
                                    style={{ 
                                        color: brandColor, 
                                        textDecoration: 'none',
                                        fontWeight: '500'
                                    }}
                                >
                                    {email}
                                </a>
                            </p>
                            {personalizedDetails.phone && (
                                <p style={{ 
                                    margin: '0', 
                                    color: '#666666'
                                }}>
                                    {personalizedDetails.phone}
                                </p>
                            )}
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    );
};

const EmailSignatureTemplateModern = ({ logoSvgBase64, brandColor, companyName, personalizedDetails }) => {
    const email = personalizedDetails.email || `iletisim@${companyName.toLowerCase().replace(/\s+/g, '')}.com`;
    return (
        <table cellPadding="0" cellSpacing="0" style={{ 
            fontFamily: 'Helvetica, Arial, sans-serif', 
            color: '#ffffff', 
            backgroundColor: '#2d3748', 
            width: '100%',
            maxWidth: '600px', 
            borderRadius: '6px',
            overflow: 'hidden',
            borderCollapse: 'collapse',
            height: '78px'
        }}>
            <tbody>
                <tr>
                                                        <td style={{ 
                                        verticalAlign: 'middle', 
                                        width: '70px', 
                                        padding: '8px 0 8px 8px'
                                    }}>
                                        <div style={{ 
                                            backgroundColor: brandColor, 
                                            padding: '6px', 
                                            borderRadius: '6px',
                                            textAlign: 'center'
                                        }}>
                                            <img 
                                                src={logoSvgBase64} 
                                                alt={`${companyName} logo`} 
                                                style={{ 
                                                    height: '34px', 
                                                    width: 'auto', 
                                                    display: 'block', 
                                                    margin: '0 auto',
                                                    filter: 'brightness(0) invert(1)'
                                                }}
                                            />
                                        </div>
                                    </td>
                                    <td style={{ 
                                        verticalAlign: 'middle',
                                        padding: '8px 8px 8px 6px'
                                    }}>
                        <div style={{ marginBottom: '6px' }}>
                            <p style={{ 
                                margin: '0', 
                                fontSize: '15px', 
                                fontWeight: 'bold', 
                                lineHeight: '1.2',
                                letterSpacing: '0.2px'
                            }}>
                                {personalizedDetails.fullName || 'Ad Soyad'}
                            </p>
                            <p style={{ 
                                margin: '1px 0 0 0', 
                                fontSize: '13px', 
                                color: '#cbd5e0',
                                fontWeight: '400',
                                lineHeight: '1.2'
                            }}>
                                {personalizedDetails.title || 'Unvan'}
                            </p>
                        </div>
                        <div style={{ 
                            borderTop: '1px solid #4a5568', 
                            paddingTop: '6px',
                            fontSize: '12px',
                            lineHeight: '1.3'
                        }}>
                            <p style={{ 
                                margin: '0 0 1px 0', 
                                fontSize: '13px', 
                                color: '#ffffff', 
                                fontWeight: 'bold'
                            }}>
                                {companyName}
                            </p>
                            <p style={{ margin: '0 0 1px 0' }}>
                                <a 
                                    href={`mailto:${email}`} 
                                    style={{ 
                                        color: brandColor, 
                                        textDecoration: 'none',
                                        fontWeight: '500'
                                    }}
                                >
                                    {email}
                                </a>
                            </p>
                            {personalizedDetails.phone && (
                                <p style={{ 
                                    margin: '0', 
                                    color: '#cbd5e0',
                                    fontSize: '12px'
                                }}>
                                    {personalizedDetails.phone}
                                </p>
                            )}
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    );
};


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

const BusinessCardEditor = ({ logoSvgBase64, brandColor, companyName, personalizedDetails, onDownload, children, selectedCardTemplate, onTemplateChange }) => {
    const templates = {
        minimal: { 
            name: 'Minimal', 
            component: <CardTemplateMinimal logoSvgBase64={logoSvgBase64} brandColor={brandColor} personalizedDetails={personalizedDetails} companyName={companyName} />,
            backComponent: <CardTemplateMinimalBack logoSvgBase64={logoSvgBase64} brandColor={brandColor} />
        },
        classic: { 
            name: 'Klasik', 
            component: <CardTemplateClassic logoSvgBase64={logoSvgBase64} brandColor={brandColor} personalizedDetails={personalizedDetails} companyName={companyName} />,
            backComponent: <CardTemplateClassicBack logoSvgBase64={logoSvgBase64} brandColor={brandColor} />
        },
        modern: { 
            name: 'Modern', 
            component: <CardTemplateModern logoSvgBase64={logoSvgBase64} brandColor={brandColor} personalizedDetails={personalizedDetails} companyName={companyName} />,
            backComponent: <CardTemplateModernBack logoSvgBase64={logoSvgBase64} brandColor={brandColor} />
        }
    };

    const SelectedTemplate = templates[selectedCardTemplate].component;
    const SelectedBackTemplate = templates[selectedCardTemplate].backComponent;

    return (
        <div className="p-4 border-t">
            <h4 className="font-bold text-lg text-center mb-4 text-gray-700">Kartvizit Düzenleyici</h4>
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Previews on the left */}
                <div className="w-full md:w-1/2 flex flex-col gap-4">
                    <div>
                        <p className="text-sm font-semibold text-gray-500 mb-2 text-center">Ön Yüz</p>
                        <div className="w-full aspect-[7/4] rounded-lg shadow-xl border overflow-hidden bg-white">
                            {SelectedTemplate}
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-500 mb-2 text-center">Arka Yüz</p>
                        <div className="w-full aspect-[7/4] rounded-lg shadow-xl border overflow-hidden bg-white">
                           {SelectedBackTemplate}
                        </div>
                    </div>
                </div>

                {/* Form and template selector on the right */}
                <div className="w-full md:w-1/2">
                    {/* Template Selector */}
                    <div className="mb-8">
                        <p className="text-base font-semibold text-gray-800 mb-3">Tasarım Seç</p>
                        <div className="grid grid-cols-3 gap-4">
                            {Object.keys(templates).map(key => (
                                <div 
                                    key={key} 
                                    onClick={() => onTemplateChange(key)} 
                                    className="relative cursor-pointer group transition-transform duration-200 ease-in-out hover:scale-105"
                                >
                                    <div
                                        className={`relative rounded-lg border-2 w-full overflow-hidden transition-all duration-200 group-hover:shadow-xl ${selectedCardTemplate === key ? 'border-blue-600 shadow-xl' : 'border-gray-200 group-hover:border-blue-400'}`}
                                    >
                                        <div className="aspect-[7/4] w-full bg-white relative overflow-hidden z-10">
                                            <div className="absolute inset-0 transform scale-[0.35] origin-top-left pointer-events-none w-[700px] h-[400px]">
                                                {templates[key].component}
                                            </div>
                                        </div>
                                        <p className={`py-2 text-sm text-center font-semibold transition-colors duration-200 ${selectedCardTemplate === key ? 'text-white bg-blue-600' : 'text-gray-700 bg-gray-50'}`}>{templates[key].name}</p>
                                    </div>
                                    {selectedCardTemplate === key && (
                                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white border-2 border-white shadow-sm">
                                            <Check className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <p className="text-base font-semibold text-gray-800 mb-3">Bilgileri Girin</p>
                    {children}
                    <div className="mt-6">
                        <button 
                            onClick={() => onDownload(selectedCardTemplate)} 
                            disabled={!personalizedDetails.fullName} 
                            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg text-base font-bold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:shadow-none shadow-sm"
                        >
                            <Download className="w-5 h-5"/>Kartviziti İndir
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LetterheadEditor = ({ logoSvgBase64, brandColor, companyName, personalizedDetails, onDownload, children, selectedLetterheadTemplate, onTemplateChange }) => {
    const templates = {
        minimal: {
            name: 'Minimal',
            component: <LetterheadTemplateMinimal logoSvgBase64={logoSvgBase64} brandColor={brandColor} personalizedDetails={personalizedDetails} companyName={companyName} />
        },
        classic: {
            name: 'Klasik',
            component: <LetterheadTemplateClassic logoSvgBase64={logoSvgBase64} brandColor={brandColor} personalizedDetails={personalizedDetails} companyName={companyName} />
        },
        modern: {
            name: 'Modern',
            component: <LetterheadTemplateModern logoSvgBase64={logoSvgBase64} brandColor={brandColor} personalizedDetails={personalizedDetails} companyName={companyName} />
        }
    };
    const SelectedTemplate = templates[selectedLetterheadTemplate].component;

    return (
    <div className="p-4 border-t">
        <h4 className="font-bold text-lg text-center mb-4 text-gray-700">Antetli Kağıt Düzenleyici</h4>
        <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Preview on the left */}
            <div className="w-full md:w-1/2">
                 <p className="text-sm font-semibold text-gray-500 mb-2 text-center">Önizleme</p>
                <div className="w-full aspect-[210/297] bg-white border rounded-lg shadow-xl overflow-hidden">
                   {SelectedTemplate}
                </div>
            </div>
            {/* Form and template selector on the right */}
            <div className="w-full md:w-1/2">
                <div className="mb-8">
                    <p className="text-base font-semibold text-gray-800 mb-3">Tasarım Seç</p>
                    <div className="grid grid-cols-3 gap-4">
                        {Object.keys(templates).map(key => (
                            <div 
                                key={key} 
                                onClick={() => onTemplateChange(key)} 
                                className="relative cursor-pointer group transition-transform duration-200 ease-in-out hover:scale-105"
                            >
                                <div
                                    className={`relative rounded-lg border-2 w-full overflow-hidden transition-all duration-200 group-hover:shadow-xl ${selectedLetterheadTemplate === key ? 'border-blue-600 shadow-xl' : 'border-gray-200 group-hover:border-blue-400'}`}
                                >
                                    <div className="aspect-[210/297] w-full bg-white relative overflow-hidden z-10">
                                        <div className="absolute inset-0 transform scale-[0.25] origin-top-left pointer-events-none w-[840px] h-[1188px]">
                                            {templates[key].component}
                                        </div>
                                    </div>
                                    <p className={`py-2 text-sm text-center font-semibold transition-colors duration-200 ${selectedLetterheadTemplate === key ? 'text-white bg-blue-600' : 'text-gray-700 bg-gray-50'}`}>{templates[key].name}</p>
                                </div>
                                {selectedLetterheadTemplate === key && (
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white border-2 border-white shadow-sm">
                                        <Check className="w-4 h-4" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-base font-semibold text-gray-800 mb-3">Bilgileri Girin</p>
                <p className="text-sm text-gray-600 mb-4">Antetli kağıdın altbilgisini (footer) kişiselleştirmek için formu doldurun.</p>
                {children}
                <div className="mt-6">
                    <button 
                        onClick={() => onDownload(selectedLetterheadTemplate)} 
                        disabled={!personalizedDetails.fullName} 
                        className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg text-base font-bold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:shadow-none shadow-sm"
                    >
                        <Download className="w-5 h-5"/>Antetli Kağıdı İndir
                    </button>
                </div>
            </div>
        </div>
    </div>
    );
};


const EmailSignaturePreviewContainer = ({ children, companyName }) => (
    <div className="bg-white border rounded-xl shadow-lg text-sm font-sans overflow-hidden w-full">
        {/* Gmail-style Header */}
        <div className="px-4 py-3 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
                <div className="w-24 h-4 bg-gray-200 rounded-full"></div>
                <div className="flex items-center gap-2">
                    <button className="w-6 h-6 text-gray-400 hover:text-gray-600">−</button>
                    <button className="w-6 h-6 text-gray-400 hover:text-gray-600">⤢</button>
                    <button className="w-6 h-6 text-gray-400 hover:text-gray-600">×</button>
                </div>
            </div>
            
            {/* To Field */}
            <div className="flex items-center py-2 border-b border-gray-100">
                <div className="w-12 h-3 bg-gray-200 rounded-full"></div>
                <div className="flex-1 flex items-center ml-4">
                    <div className="w-48 h-3 bg-gray-200 rounded-full"></div>
                </div>
                <div className="flex gap-2">
                    <div className="w-6 h-2 bg-gray-200 rounded-full"></div>
                    <div className="w-8 h-2 bg-gray-200 rounded-full"></div>
                </div>
            </div>
            
            {/* Subject Field */}
            <div className="flex items-center py-2">
                <div className="w-12 h-3 bg-gray-200 rounded-full"></div>
                <div className="flex-1 flex items-center ml-4">
                    <div className="w-40 h-3 bg-gray-200 rounded-full"></div>
                </div>
            </div>
        </div>

        {/* Email Body */}
        <div className="p-6 min-h-[300px] bg-white">
            {/* Email Content Placeholders */}
            <div className="mb-8 space-y-4">
                {/* Greeting */}
                <div className="w-20 h-3 bg-gray-200 rounded-full"></div>
                
                {/* Paragraph 1 */}
                <div className="space-y-2">
                    <div className="w-full h-3 bg-gray-200 rounded-full"></div>
                    <div className="w-4/5 h-3 bg-gray-200 rounded-full"></div>
                    <div className="w-3/4 h-3 bg-gray-200 rounded-full"></div>
                </div>
                
                {/* Paragraph 2 */}
                <div className="space-y-2">
                    <div className="w-5/6 h-3 bg-gray-200 rounded-full"></div>
                    <div className="w-full h-3 bg-gray-200 rounded-full"></div>
                    <div className="w-2/3 h-3 bg-gray-200 rounded-full"></div>
                </div>
                
                {/* Paragraph 3 */}
                <div className="space-y-2">
                    <div className="w-3/4 h-3 bg-gray-200 rounded-full"></div>
                    <div className="w-1/2 h-3 bg-gray-200 rounded-full"></div>
                </div>
                
                {/* Closing */}
                <div className="w-24 h-3 bg-gray-200 rounded-full"></div>
            </div>

            {/* Email Signature */}
            <div className="border-t border-gray-100 pt-4">
                {children}
            </div>
        </div>
        
        {/* Gmail-style Footer */}
        <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <button className="bg-blue-600 hover:bg-blue-700 transition-colors px-6 py-2 rounded-full flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                </button>
                <button className="text-gray-500 hover:text-gray-700 p-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z"/>
                    </svg>
                </button>
            </div>
            <div className="flex items-center gap-2">
                <button className="text-gray-500 hover:text-gray-700 p-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
                    </svg>
                </button>
                <button className="text-gray-500 hover:text-gray-700 p-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H6.99C4.58 7 2.49 9.09 2.49 11.5c0 2.41 2.09 4.5 4.51 4.5H11v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm5-6h4.01c2.42 0 4.49 2.09 4.49 4.5c0 2.41-2.07 4.5-4.49 4.5H13v1.9h4.01c2.42 0 4.49-2.09 4.49-4.5c0-2.41-2.07-4.5-4.49-4.5H13V7z"/>
                    </svg>
                </button>
                <button className="text-gray-500 hover:text-gray-700 p-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
                    </svg>
                </button>
                <button className="text-gray-500 hover:text-gray-700 p-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
                    </svg>
                </button>
                <button className="text-gray-500 hover:text-gray-700 p-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                    </svg>
                </button>
                <button className="text-gray-500 hover:text-gray-700 p-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                </button>
            </div>
        </div>
    </div>
);

const EmailSignatureEditor = ({ logoSvgBase64, brandColor, companyName, personalizedDetails, onDownload, children, selectedEmailSignatureTemplate, onTemplateChange }) => {
    const templates = {
        minimal: {
            name: 'Minimal',
            component: <EmailSignatureTemplateMinimal logoSvgBase64={logoSvgBase64} brandColor={brandColor} personalizedDetails={personalizedDetails} companyName={companyName} />
        },
        classic: {
            name: 'Klasik',
            component: <EmailSignatureTemplateClassic logoSvgBase64={logoSvgBase64} brandColor={brandColor} personalizedDetails={personalizedDetails} companyName={companyName} />
        },
        modern: {
            name: 'Modern',
            component: <EmailSignatureTemplateModern logoSvgBase64={logoSvgBase64} brandColor={brandColor} personalizedDetails={personalizedDetails} companyName={companyName} />
        }
    };
    const SelectedTemplate = templates[selectedEmailSignatureTemplate].component;

    return (
     <div className="p-4 border-t">
        <h4 className="font-bold text-lg text-center mb-4 text-gray-700">E-posta İmzası Düzenleyici</h4>
        <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Preview on the left */}
            <div className="w-full md:w-1/2">
                <p className="text-sm font-semibold text-gray-500 mb-2 text-center">Önizleme</p>
                <EmailSignaturePreviewContainer companyName={companyName}>
                    {SelectedTemplate}
                </EmailSignaturePreviewContainer>
            </div>
            {/* Form and template selector on the right */}
            <div className="w-full md:w-1/2">
                <div className="mb-8">
                     <p className="text-base font-semibold text-gray-800 mb-3">Tasarım Seç</p>
                     <div className="grid grid-cols-3 gap-2">
                         {Object.keys(templates).map(key => (
                             <div 
                                 key={key} 
                                 onClick={() => onTemplateChange(key)} 
                                 className="relative cursor-pointer group transition-transform duration-200 ease-in-out hover:scale-105"
                             >
                                 <div
                                     className={`relative rounded-lg border-2 w-full overflow-hidden transition-all duration-200 group-hover:shadow-xl ${selectedEmailSignatureTemplate === key ? 'border-blue-600 shadow-xl' : 'border-gray-200 group-hover:border-blue-400'}`}
                                 >
                                     <div className="h-24 w-full bg-white relative overflow-hidden z-10 p-1 flex items-center justify-center">
                                         <div className="transform scale-[0.6] origin-center pointer-events-none">
                                             {templates[key].component}
                                         </div>
                                     </div>
                                      <p className={`py-1 text-xs text-center font-semibold transition-colors duration-200 ${selectedEmailSignatureTemplate === key ? 'text-white bg-blue-600' : 'text-gray-700 bg-gray-50'}`}>{templates[key].name}</p>
                                 </div>
                                 {selectedEmailSignatureTemplate === key && (
                                     <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white border-2 border-white shadow-sm">
                                         <Check className="w-3 h-3" />
                                     </div>
                                 )}
                             </div>
                         ))}
                     </div>
                 </div>

                <p className="text-base font-semibold text-gray-800 mb-3">Bilgileri Girin</p>
                <p className="text-sm text-gray-600 mb-4">E-posta imzanızda görünecek bilgileri girin.</p>
                {children}
                <div className="mt-6">
                    <button 
                        onClick={() => onDownload(selectedEmailSignatureTemplate)} 
                        disabled={!personalizedDetails.fullName} 
                        className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg text-base font-bold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:shadow-none shadow-sm"
                    >
                        <Download className="w-5 h-5"/>İmza HTML'ini İndir
                    </button>
                </div>
            </div>
        </div>
    </div>
    );
};


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

const LetterheadPreview = ({ logoSvgBase64, brandColor, companyName, personalizedDetails, selectedTemplate }) => {
    const templates = {
        minimal: (
            <div className="aspect-[210/297] h-[95%] bg-white border rounded-sm shadow-sm flex flex-col justify-between p-3">
                <header className="w-full">
                    <img src={logoSvgBase64} alt="logo" className="w-1/3 h-auto" />
                </header>
                <footer className="text-[6px] text-gray-500 w-full">
                    <div className="w-full h-0.5 mb-1 rounded-full" style={{backgroundColor: brandColor}}></div>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="truncate">{personalizedDetails.fullName ? `${personalizedDetails.fullName}, ${personalizedDetails.title}` : "Ad Soyad, Unvan"}</p>
                            <p className="truncate">{personalizedDetails.email || "iletisim@sirket.com"}</p>
                        </div>
                        <p className="text-[5px] font-bold text-gray-700">{companyName}</p>
                    </div>
                </footer>
            </div>
        ),
        classic: (
            <div className="aspect-[210/297] h-[95%] bg-[#F8F5F2] border rounded-sm shadow-sm flex flex-col justify-between p-3">
                <header className="w-full text-center">
                    <img src={logoSvgBase64} alt="logo" className="w-1/4 h-auto mx-auto mb-1" />
                    <h1 className="text-[8px] font-bold" style={{ color: brandColor }}>{companyName}</h1>
                </header>
                <footer className="text-[5px] text-gray-600 text-center w-full">
                    <div className="w-1/3 h-0.5 bg-gray-300 mx-auto mb-1"></div>
                    <p className="truncate">{personalizedDetails.fullName ? `${personalizedDetails.fullName}, ${personalizedDetails.title}` : "Ad Soyad, Unvan"}</p>
                    <p className="truncate">{personalizedDetails.email || "iletisim@sirket.com"}</p>
                </footer>
            </div>
        ),
        modern: (
            <div className="aspect-[210/297] h-[95%] bg-white border rounded-sm shadow-sm flex relative overflow-hidden">
                <div className="w-4 h-full" style={{ backgroundColor: brandColor }}></div>
                <div className="absolute top-2 left-1">
                    <img src={logoSvgBase64} alt="logo" className="w-3 h-auto" style={{ filter: 'brightness(0) invert(1)' }}/>
                </div>
                <div className="flex-grow flex flex-col justify-end p-2 pl-5">
                    <footer className="text-[5px] text-gray-700 w-full">
                        <p className="text-[7px] font-extrabold">{personalizedDetails.fullName || 'Ad Soyad'}</p>
                        <p className="text-[5px] text-gray-500">{personalizedDetails.title || 'Unvan'}</p>
                        <div className="w-full h-0.5 bg-gray-200 my-1"></div>
                        <p className="font-semibold">{companyName}</p>
                        <p className="truncate">{personalizedDetails.email || "iletisim@sirket.com"}</p>
                    </footer>
                </div>
            </div>
        )
    };

    return (
        <div className="w-full h-full flex items-center justify-center">
            {templates[selectedTemplate] || templates.minimal}
        </div>
    );
};

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

const BusinessCardPreview = ({ logoSvgBase64, personalizedDetails, brandColor, companyName, selectedTemplate }) => {
    const templates = {
        minimal: (
            <div className="w-[95%] aspect-[7/4] bg-white border rounded-lg shadow-md flex items-center p-3 relative overflow-hidden">
                <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full" style={{ backgroundColor: brandColor, opacity: 0.1 }}></div>
                <img src={logoSvgBase64} alt="logo" className="w-1/4 h-auto mr-3 flex-shrink-0" />
                <div className="text-left overflow-hidden z-10">
                    <p className="text-[9px] font-bold truncate">{personalizedDetails.fullName || 'Ad Soyad'}</p>
                    <p className="text-[8px] truncate" style={{ color: brandColor }}>{personalizedDetails.title || 'Unvan'}</p>
                    <div className="w-1/5 border-t my-1" style={{ borderColor: brandColor }}></div>
                    <p className="text-[7px] text-gray-500 truncate">{personalizedDetails.email || "iletisim@sirket.com"}</p>
                </div>
            </div>
        ),
        classic: (
            <div className="w-[95%] aspect-[7/4] bg-[#F8F5F2] border rounded-lg shadow-md flex flex-col justify-between p-3">
                <div className="text-center">
                    <p className="text-[10px] font-bold" style={{ color: brandColor }}>{personalizedDetails.fullName || 'Ad Soyad'}</p>
                    <p className="text-[8px] text-gray-600 italic">{personalizedDetails.title || 'Unvan'}</p>
                </div>
                <div className="flex items-center justify-between">
                    <div className="text-left text-[6px]">
                        <p className="font-semibold">{companyName}</p>
                        <p className="truncate">{personalizedDetails.email || "iletisim@sirket.com"}</p>
                    </div>
                    <img src={logoSvgBase64} alt="logo" className="w-1/5 h-auto" />
                </div>
            </div>
        ),
        modern: (
            <div className="w-[95%] aspect-[7/4] bg-gray-900 text-white border rounded-lg shadow-md flex flex-col p-3 relative overflow-hidden">
                <div className="absolute -top-2 -left-2 w-12 h-12 rounded-full" style={{ backgroundColor: brandColor, opacity: 0.5 }}></div>
                <div className="absolute -bottom-4 -right-1 w-12 h-12 rounded-md transform rotate-45" style={{ backgroundColor: brandColor, opacity: 0.5 }}></div>
                <img src={logoSvgBase64} alt="logo" className="w-1/6 h-auto mb-2 self-start z-10" style={{ filter: 'brightness(0) invert(1)' }}/>
                <div className="text-left mt-auto z-10">
                    <p className="text-[10px] font-extrabold tracking-tight">{personalizedDetails.fullName || 'Ad Soyad'}</p>
                    <p className="text-[8px] font-light text-gray-300" style={{ color: brandColor }}>{personalizedDetails.title || 'Unvan'}</p>
                    <div className="border-t border-gray-700 my-1 w-full"></div>
                    <p className="text-[6px] text-gray-400">{companyName}</p>
                </div>
            </div>
        )
    };

    return (
        <div className="w-full h-full flex items-center justify-center">
            {templates[selectedTemplate] || templates.minimal}
        </div>
    );
};

const EmailSignaturePreview = ({ logoSvgBase64, brandColor, companyName, personalizedDetails, selectedTemplate }) => {
    const getScaledTemplate = (template) => {
        const scale = 0.7; // 70% scale for optimal fit
        
        switch(template) {
            case 'minimal':
                return (
                    <div style={{ transform: `scale(${scale})`, transformOrigin: 'center', height: '65px' }}>
                        <table cellPadding="0" cellSpacing="0" style={{ 
                            fontFamily: 'Arial, Helvetica, sans-serif', 
                            fontSize: '13px', 
                            lineHeight: '1.3',
                            color: '#333333', 
                            borderCollapse: 'collapse',
                            width: '100%',
                            minWidth: '320px',
                            height: '65px'
                        }}>
                            <tbody>
                                <tr>
                                    <td style={{ 
                                        padding: '8px 10px 8px 8px', 
                                        verticalAlign: 'middle',
                                        width: '70px'
                                    }}>
                                        <img 
                                            src={logoSvgBase64} 
                                            alt={`${companyName} logo`} 
                                            style={{ 
                                                height: '50px', 
                                                width: 'auto', 
                                                display: 'block',
                                                maxWidth: '70px'
                                            }}
                                        />
                                    </td>
                                    <td style={{ 
                                        borderLeft: `3px solid ${brandColor}`, 
                                        padding: '8px 8px 8px 10px', 
                                        verticalAlign: 'middle'
                                    }}>
                                        <div style={{ marginBottom: '6px' }}>
                                            <p style={{ 
                                                margin: '0', 
                                                fontWeight: 'bold', 
                                                color: '#111111', 
                                                fontSize: '15px',
                                                lineHeight: '1.2'
                                            }}>
                                                {personalizedDetails.fullName || 'Ad Soyad'}
                                            </p>
                                            <p style={{ 
                                                margin: '1px 0 0 0', 
                                                color: '#666666',
                                                fontSize: '13px',
                                                fontWeight: '500'
                                            }}>
                                                {personalizedDetails.title || 'Unvan'}
                                            </p>
                                        </div>
                                        <div style={{ fontSize: '12px', lineHeight: '1.3' }}>
                                            <p style={{ 
                                                margin: '0 0 1px 0', 
                                                fontWeight: 'bold', 
                                                color: brandColor,
                                                fontSize: '13px'
                                            }}>
                                                {companyName}
                                            </p>
                                            <p style={{ margin: '0 0 1px 0' }}>
                                                <a 
                                                    href={`mailto:${personalizedDetails.email || `iletisim@${companyName.toLowerCase().replace(/\s+/g, '')}.com`}`} 
                                                    style={{ 
                                                        color: '#0066cc', 
                                                        textDecoration: 'none',
                                                        fontWeight: '500'
                                                    }}
                                                >
                                                    {personalizedDetails.email || `iletisim@${companyName.toLowerCase().replace(/\s+/g, '')}.com`}
                                                </a>
                                            </p>
                                            {personalizedDetails.phone && (
                                                <p style={{ 
                                                    margin: '0', 
                                                    color: '#666666'
                                                }}>
                                                    {personalizedDetails.phone}
                                                </p>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                );
            
            case 'classic':
                return (
                    <div style={{ transform: `scale(${scale})`, transformOrigin: 'center', height: '65px' }}>
                        <table cellPadding="0" cellSpacing="0" style={{ 
                            fontFamily: 'Georgia, Times, serif', 
                            fontSize: '13px', 
                            color: '#333333', 
                            width: '100%',
                            minWidth: '320px',
                            borderCollapse: 'collapse',
                            border: `2px solid ${brandColor}`,
                            borderRadius: '8px',
                            overflow: 'hidden',
                            backgroundColor: '#fefefe',
                            height: '65px'
                        }}>
                            <tbody>
                                <tr>
                                    <td style={{ 
                                        verticalAlign: 'middle',
                                        padding: '8px',
                                        width: '70px',
                                        textAlign: 'center',
                                        backgroundColor: '#fafafa',
                                        borderRight: `1px solid #e5e5e5`
                                    }}>
                                        <img 
                                            src={logoSvgBase64} 
                                            alt={`${companyName} logo`} 
                                            style={{ 
                                                height: '50px', 
                                                width: 'auto', 
                                                display: 'block', 
                                                margin: '0 auto'
                                            }} 
                                        />
                                    </td>
                                    <td style={{ 
                                        verticalAlign: 'middle',
                                        padding: '8px 12px',
                                        textAlign: 'left'
                                    }}>
                                        <div style={{ marginBottom: '6px' }}>
                                            <p style={{ 
                                                margin: '0', 
                                                fontSize: '15px', 
                                                fontWeight: 'bold', 
                                                color: brandColor,
                                                lineHeight: '1.2'
                                            }}>
                                                {personalizedDetails.fullName || 'Ad Soyad'}
                                            </p>
                                            <p style={{ 
                                                margin: '1px 0 0 0', 
                                                fontSize: '13px', 
                                                color: '#666666',
                                                fontStyle: 'italic',
                                                lineHeight: '1.2'
                                            }}>
                                                {personalizedDetails.title || 'Unvan'}
                                            </p>
                                        </div>
                                        <div style={{ 
                                            borderTop: '1px solid #e5e5e5', 
                                            paddingTop: '6px',
                                            fontSize: '12px',
                                            lineHeight: '1.3'
                                        }}>
                                            <p style={{ 
                                                margin: '0 0 1px 0', 
                                                fontWeight: 'bold', 
                                                color: '#333333',
                                                fontSize: '13px'
                                            }}>
                                                {companyName}
                                            </p>
                                            <p style={{ margin: '0 0 1px 0' }}>
                                                <a 
                                                    href={`mailto:${personalizedDetails.email || `iletisim@${companyName.toLowerCase().replace(/\s+/g, '')}.com`}`} 
                                                    style={{ 
                                                        color: brandColor, 
                                                        textDecoration: 'none',
                                                        fontWeight: '500'
                                                    }}
                                                >
                                                    {personalizedDetails.email || `iletisim@${companyName.toLowerCase().replace(/\s+/g, '')}.com`}
                                                </a>
                                            </p>
                                            {personalizedDetails.phone && (
                                                <p style={{ 
                                                    margin: '0', 
                                                    color: '#666666'
                                                }}>
                                                    {personalizedDetails.phone}
                                                </p>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                );
            
            case 'modern':
                return (
                    <div style={{ transform: `scale(${scale})`, transformOrigin: 'center', height: '65px' }}>
                        <table cellPadding="0" cellSpacing="0" style={{ 
                            fontFamily: 'Helvetica, Arial, sans-serif', 
                            color: '#ffffff', 
                            backgroundColor: '#2d3748', 
                            width: '100%',
                            minWidth: '320px', 
                            borderRadius: '6px',
                            overflow: 'hidden',
                            borderCollapse: 'collapse',
                            height: '65px'
                        }}>
                            <tbody>
                                <tr>
                                    <td style={{ 
                                        verticalAlign: 'middle', 
                                        width: '70px', 
                                        padding: '14px 0 14px 14px'
                                    }}>
                                        <div style={{ 
                                            backgroundColor: brandColor, 
                                            padding: '8px', 
                                            borderRadius: '6px',
                                            textAlign: 'center'
                                        }}>
                                            <img 
                                                src={logoSvgBase64} 
                                                alt={`${companyName} logo`} 
                                                style={{ 
                                                    height: '34px', 
                                                    width: 'auto', 
                                                    display: 'block', 
                                                    margin: '0 auto',
                                                    filter: 'brightness(0) invert(1)'
                                                }}
                                            />
                                        </div>
                                    </td>
                                    <td style={{ 
                                        verticalAlign: 'middle',
                                        padding: '14px 14px 14px 10px'
                                    }}>
                                        <div style={{ marginBottom: '6px' }}>
                                            <p style={{ 
                                                margin: '0', 
                                                fontSize: '15px', 
                                                fontWeight: 'bold', 
                                                lineHeight: '1.2',
                                                letterSpacing: '0.2px'
                                            }}>
                                                {personalizedDetails.fullName || 'Ad Soyad'}
                                            </p>
                                            <p style={{ 
                                                margin: '1px 0 0 0', 
                                                fontSize: '13px', 
                                                color: '#cbd5e0',
                                                fontWeight: '400',
                                                lineHeight: '1.2'
                                            }}>
                                                {personalizedDetails.title || 'Unvan'}
                                            </p>
                                        </div>
                                        <div style={{ 
                                            borderTop: '1px solid #4a5568', 
                                            paddingTop: '6px',
                                            fontSize: '12px',
                                            lineHeight: '1.3'
                                        }}>
                                            <p style={{ 
                                                margin: '0 0 1px 0', 
                                                fontSize: '13px', 
                                                color: '#ffffff', 
                                                fontWeight: 'bold'
                                            }}>
                                                {companyName}
                                            </p>
                                            <p style={{ margin: '0 0 1px 0' }}>
                                                <a 
                                                    href={`mailto:${personalizedDetails.email || `iletisim@${companyName.toLowerCase().replace(/\s+/g, '')}.com`}`} 
                                                    style={{ 
                                                        color: brandColor, 
                                                        textDecoration: 'none',
                                                        fontWeight: '500'
                                                    }}
                                                >
                                                    {personalizedDetails.email || `iletisim@${companyName.toLowerCase().replace(/\s+/g, '')}.com`}
                                                </a>
                                            </p>
                                            {personalizedDetails.phone && (
                                                <p style={{ 
                                                    margin: '0', 
                                                    color: '#cbd5e0',
                                                    fontSize: '12px'
                                                }}>
                                                    {personalizedDetails.phone}
                                                </p>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                );
            
            default:
                return getScaledTemplate('minimal');
        }
    };

    return (
        <div className="w-full h-full flex items-center justify-center text-left p-1 overflow-hidden">
            {getScaledTemplate(selectedTemplate)}
        </div>
    );
};


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
    const [selectedCardTemplate, setSelectedCardTemplate] = useState('minimal');
    const [selectedLetterheadTemplate, setSelectedLetterheadTemplate] = useState('minimal');
    const [selectedEmailSignatureTemplate, setSelectedEmailSignatureTemplate] = useState('minimal');
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

    const handleDownloadPersonalizedLetterhead = async (templateId) => {
        if (!cardDetails.fullName || !cardDetails.title) {
            alert("Lütfen devam etmek için kişisel bilgi alanlarını doldurun.");
            return;
        }
        console.log(`Kişiselleştirilmiş antetli kağıt (${templateId}) indirme işlemi başlatıldı.`);
        const logoSvgBase64 = `data:image/svg+xml;base64,${btoa(finalSvg)}`;
        let letterheadHtml = '';

        const commonStyles = `width: 8.27in; height: 11.69in; box-sizing: border-box; font-family: sans-serif;`;

        switch(templateId) {
            case 'minimal':
                letterheadHtml = `
                    <div style="${commonStyles} background-color: white; display: flex; flex-direction: column; justify-content: space-between; padding: 1in;">
                        <header>
                            <img src="${logoSvgBase64}" style="height: 0.5in; width: auto;" />
                        </header>
                        <footer style="font-size: 9pt; color: #555; width: 100%;">
                            <div style="width: 100%; height: 1px; background-color: ${brandColor}; margin-bottom: 0.2in;"></div>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <p style="margin: 0;"><span style="font-weight: bold; color: #111;">${cardDetails.fullName}</span>, ${cardDetails.title}</p>
                                    <p style="margin: 2px 0;">${cardDetails.email || ''}</p>
                                </div>
                                <p style="margin: 0; font-weight: bold; color: #111;">${companyName}</p>
                            </div>
                        </footer>
                    </div>`;
                break;
            case 'classic':
                letterheadHtml = `
                     <div style="${commonStyles} background-color: #F8F5F2; display: flex; flex-direction: column; justify-content: space-between; padding: 1in; font-family: 'serif'; color: #333;">
                        <header style="text-align: center;">
                            <img src="${logoSvgBase64}" style="height: 0.7in; width: auto; margin: 0 auto 0.2in;" />
                            <h1 style="font-size: 18pt; font-weight: bold; color: ${brandColor}; margin: 0;">${companyName}</h1>
                        </header>
                        <footer style="font-size: 10pt; color: #666; text-align: center; width: 100%;">
                            <div style="width: 33%; height: 1px; background-color: #ddd; margin: 0 auto 0.2in;"></div>
                            <p style="margin: 0;"><span style="font-weight: bold;">${cardDetails.fullName}</span>, ${cardDetails.title}</p>
                            <p style="margin: 2px 0;">${cardDetails.email || ''} | ${cardDetails.phone || ''}</p>
                        </footer>
                    </div>`;
                break;
            case 'modern':
                letterheadHtml = `
                    <div style="${commonStyles} background-color: white; display: flex; position: relative;">
                        <div style="width: 1.2in; height: 100%; background-color: ${brandColor}; position: absolute; top: 0; left: 0;"></div>
                        <div style="position: absolute; top: 1in; left: 0.4in;">
                            <img src="${logoSvgBase64}" style="height: 0.5in; width: auto; filter: brightness(0) invert(1);" />
                        </div>
                        <div style="flex-grow: 1; display: flex; flex-direction: column; justify-content: flex-end; padding: 1in; padding-left: 1.5in;">
                             <footer style="font-size: 9pt; color: #333; width: 100%;">
                                <p style="margin: 0; font-size: 14pt; font-weight: 800;">${cardDetails.fullName}</p>
                                <p style="margin: 2px 0 10px 0; font-size: 11pt; color: #555;">${cardDetails.title}</p>
                                <div style="width: 100%; height: 1px; background-color: #eee; margin-bottom: 0.2in;"></div>
                                <p style="margin: 0; font-weight: bold;">${companyName}</p>
                                <p style="margin: 2px 0;">${cardDetails.email || ''}</p>
                                <p style="margin: 2px 0;">${cardDetails.phone || ''}</p>
                            </footer>
                        </div>
                    </div>`;
                break;
            default:
                console.error("Unknown letterhead template:", templateId);
                return;
        }

        try {
            const element = document.createElement('div');
            element.innerHTML = letterheadHtml;
            // A4 size in pixels at 96 DPI is 794x1123, we match this aspect ratio
            element.style.width = '794px'; 
            element.style.height = '1123px';
            
            const canvas = await renderAndCapture(element, `Personalized Letterhead (${templateId})`);
            const pdf = new jsPDF('p', 'pt', 'a4');
            pdf.addImage(canvas, 'PNG', 0, 0, 595, 842); // 595x842 pt is A4
            pdf.save(`antetli_kagit_${templateId}_${companyName.toLowerCase().replace(/\s+/g, '_')}.pdf`);
        } catch (error) {
            console.error("Kişiselleştirilmiş antetli kağıt oluşturulurken hata oluştu:", error);
            alert("Kişiselleştirilmiş antetli kağıt PDF'i oluşturulurken bir hata oluştu.");
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
    
    const handleDownloadBusinessCard = async (templateId) => {
        if (!cardDetails.fullName || !cardDetails.title) {
            alert("Lütfen devam etmek için kişisel bilgi alanlarını doldurun.");
            return;
        }
        console.log(`Kartvizit ZIP (${templateId}) indirme işlemi başlatıldı.`);
        const logoSvgBase64 = `data:image/svg+xml;base64,${btoa(finalSvg)}`;
        
        // --- Create HTML elements for front and back ---
        const frontElement = document.createElement('div');
        frontElement.style.width = '700px';
        frontElement.style.height = '400px';
        frontElement.style.fontFamily = 'Arial, sans-serif';
        frontElement.style.boxSizing = 'border-box';
        
        const backElement = document.createElement('div');
        backElement.style.width = '700px';
        backElement.style.height = '400px';
        backElement.style.fontFamily = 'Arial, sans-serif';
        backElement.style.boxSizing = 'border-box';

        switch(templateId) {
            case 'minimal':
                frontElement.style.backgroundColor = 'white';
                frontElement.innerHTML = `<div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 40px; box-sizing: border-box;"><img src="${logoSvgBase64}" alt="logo" style="width: 25%; height: auto; margin-bottom: 20px;" /><h3 style="font-size: 28px; font-weight: bold; margin: 0;">${cardDetails.fullName || 'Ad Soyad'}</h3><p style="font-size: 20px; color: #555; margin: 4px 0;">${cardDetails.title || 'Unvan'}</p><div style="width: 25%; border-top: 2px solid ${brandColor}; margin: 15px 0;"></div><p style="font-size: 16px; color: #666;">${cardDetails.email || `iletisim@${companyName.toLowerCase().replace(/\s+/g, '')}.com`}</p><p style="font-size: 16px; color: #666;">${cardDetails.phone || ''}</p></div>`;
                backElement.style.backgroundColor = brandColor;
                backElement.innerHTML = `<div style="width:100%; height:100%; display:flex; justify-content:center; align-items:center;"><img src="${logoSvgBase64}" alt="logo" style="width: 50%; height: auto; filter: brightness(0) invert(1);" /></div>`;
                break;
            case 'classic':
                frontElement.style.backgroundColor = 'white';
                frontElement.innerHTML = `<div style="width: 100%; height: 100%; display: flex; align-items: center; padding: 40px; box-sizing: border-box;"><div style="width: 33%; padding-right: 30px; border-right: 1px solid #eee; display: flex; align-items: center; justify-content: center;"><img src="${logoSvgBase64}" alt="logo" style="width: 100%; height: auto;" /></div><div style="width: 67%; padding-left: 30px; text-align: left;"><h3 style="font-family: 'serif'; font-size: 32px; font-weight: bold; color: ${brandColor}; margin: 0;">${cardDetails.fullName || 'Ad Soyad'}</h3><p style="font-family: 'serif'; font-size: 22px; color: #333; margin: 4px 0;">${cardDetails.title || 'Unvan'}</p><div style="border-top: 1px solid #ddd; margin: 20px 0;"></div><p style="font-size: 16px; color: #555; margin: 4px 0;">${companyName}</p><p style="font-size: 16px; color: #555; margin: 4px 0;">${cardDetails.email || `iletisim@${companyName.toLowerCase().replace(/\s+/g, '')}.com`}</p><p style="font-size: 16px; color: #555; margin: 4px 0;">${cardDetails.phone || ''}</p></div></div>`;
                backElement.style.backgroundColor = '#f3f4f6'; // gray-100
                backElement.innerHTML = `<div style="width:100%; height:100%; display:flex; justify-content:center; align-items:center; padding: 40px; box-sizing: border-box;"><img src="${logoSvgBase64}" alt="logo" style="width: 33%; height: auto;" /></div>`;
                break;
            case 'modern':
                frontElement.style.backgroundColor = '#2d3748'; // gray-800
                frontElement.style.color = 'white';
                frontElement.innerHTML = `<div style="width: 100%; height: 100%; display: flex; align-items: center;"><div style="width: 33%; height: 100%; background-color: ${brandColor}; display: flex; align-items: center; justify-content: center;"><img src="${logoSvgBase64}" alt="logo" style="width: 50%; height: auto; filter: brightness(0) invert(1);" /></div><div style="padding-left: 30px; text-align: left;"><h3 style="font-family: sans-serif; font-size: 24px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; margin: 0;">${cardDetails.fullName || 'Ad Soyad'}</h3><p style="font-family: sans-serif; font-size: 18px; letter-spacing: 0.1em; color: #cbd5e0; margin: 4px 0;">${cardDetails.title || 'Unvan'}</p><div style="border-top: 1px solid #4a5568; margin: 15px 0; width: 50%;"></div><p style="font-size: 16px; color: #a0aec0;">${cardDetails.email || `iletisim@${companyName.toLowerCase().replace(/\s+/g, '')}.com`}</p><p style="font-size: 16px; color: #a0aec0;">${cardDetails.phone || ''}</p></div></div>`;
                backElement.style.backgroundColor = brandColor;
                backElement.innerHTML = `<div style="width:100%; height:100%; display:flex; justify-content:center; align-items:center;"><img src="${logoSvgBase64}" alt="logo" style="width: 50%; height: auto; filter: brightness(0) invert(1);" /></div>`;
                break;
            default:
                console.error("Unknown card template:", templateId);
                return;
        }

        try {
            const zip = new JSZip();
            
            const frontCanvas = await renderAndCapture(frontElement, `Business Card Front (${templateId})`);
            const frontBlob = await new Promise(res => frontCanvas.toBlob(res, 'image/png'));
            zip.file(`kartvizit_${templateId}_on.png`, frontBlob);

            const backCanvas = await renderAndCapture(backElement, `Business Card Back (${templateId})`);
            const backBlob = await new Promise(res => backCanvas.toBlob(res, 'image/png'));
            zip.file(`kartvizit_${templateId}_arka.png`, backBlob);

            const zipBlob = await zip.generateAsync({ type: 'blob' });
            saveAs(zipBlob, `kartvizit_${templateId}_${companyName.toLowerCase().replace(/\s+/g, '_')}.zip`);

        } catch (error) {
            console.error("Kartvizit ZIP oluşturulurken hata oluştu:", error);
            alert("Kartvizit ZIP dosyası oluşturulurken bir hata oluştu.");
        }
    };

    const handleDownloadEmailSignature = async (templateId) => {
        if (!cardDetails.fullName || !cardDetails.title) {
            alert("Lütfen devam etmek için kişisel bilgi alanlarını doldurun.");
            return;
        }
        console.log(`E-posta imzası (${templateId}) indirme işlemi başlatıldı.`);
        const logoSvgBase64 = `data:image/svg+xml;base64,${btoa(finalSvg)}`;
        let signatureHtml = '';

        const fullName = cardDetails.fullName || 'Ad Soyad';
        const title = cardDetails.title || 'Unvan';
        const email = cardDetails.email || `iletisim@${companyName.toLowerCase().replace(/\s+/g, '')}.com`;
        const phone = cardDetails.phone || '';

        switch(templateId) {
            case 'minimal':
                signatureHtml = `
                    <table cellpadding="0" cellspacing="0" style="font-family: Arial, sans-serif; font-size: 10pt; color: #333333;">
                        <tr>
                            <td style="padding-right: 15px; vertical-align: top;"><img src="${logoSvgBase64}" alt="logo" style="height: 50px;"/></td>
                            <td style="border-left: 2px solid ${brandColor}; padding-left: 15px; vertical-align: top;">
                                <p style="margin: 0; font-weight: bold; color: #222222;">${fullName}</p>
                                <p style="margin: 2px 0; color: #555555;">${title}</p>
                                <p style="margin: 4px 0 0 0; font-weight: bold; color: #444444;">${companyName}</p>
                                <p style="margin: 2px 0;"><a href="mailto:${email}" style="color: #0000EE; text-decoration: none;">${email}</a></p>
                                ${phone ? `<p style="margin: 2px 0; color: #555555;">${phone}</p>` : ''}
                            </td>
                        </tr>
                    </table>`;
                break;
            case 'classic':
                 signatureHtml = `
                    <table cellpadding="0" cellspacing="0" style="font-family: Georgia, serif; font-size: 10pt; color: #333333; width: 320px;">
                        <tbody>
                            <tr>
                                <td colspan="2" style="text-align: center; padding-bottom: 10px;">
                                    <img src="${logoSvgBase64}" alt="logo" style="height: 45px; width: auto; margin-bottom: 5px;" />
                                </td>
                            </tr>
                            <tr>
                                <td colspan="2" style="text-align: center; border-top: 1px solid #dddddd; padding-top: 10px;">
                                    <p style="margin: 0; font-size: 12pt; font-weight: bold; color: ${brandColor};">${fullName}</p>
                                    <p style="margin: 2px 0 8px 0; font-size: 10pt; color: #555555;">${title}</p>
                                    <p style="margin: 0; font-size: 9pt;"><span style="font-weight: bold;">${companyName}</span>${email ? ` | <a href="mailto:${email}" style="color: #0000EE; text-decoration: none;">${email}</a>` : ''}${phone ? ` | ${phone}` : ''}</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>`;
                break;
            case 'modern':
                signatureHtml = `
                    <table cellpadding="0" cellspacing="0" style="font-family: Helvetica, sans-serif; color: #ffffff; background-color: #222222; padding: 15px; width: 350px; border-radius: 4px;">
                        <tr>
                            <td style="vertical-align: middle; width: 70px; padding-right: 15px;">
                                <div style="background-color: ${brandColor}; padding: 10px; text-align: center; border-radius: 4px;">
                                    <img src="${logoSvgBase64}" alt="logo" style="height: 40px; width: auto; filter: brightness(0) invert(1);" />
                                </div>
                            </td>
                            <td style="vertical-align: middle;">
                                <p style="margin: 0; font-size: 12pt; font-weight: bold;">${fullName}</p>
                                <p style="margin: 3px 0; font-size: 9pt; color: #cccccc;">${title}</p>
                                <div style="border-top: 1px solid #444444; margin: 8px 0;"></div>
                                <p style="margin: 0; font-size: 9pt; color: #ffffff; font-weight: bold;">${companyName}</p>
                                <p style="margin: 2px 0;"><a href="mailto:${email}" style="color: #ffffff; text-decoration: none;">${email}</a></p>
                            </td>
                        </tr>
                    </table>`;
                break;
            default:
                console.error("Unknown email signature template:", templateId);
                return;
        }

        const fullHtml = `
            <!DOCTYPE html>
            <html><head><title>${companyName} E-posta İmzası</title></head>
            <body>${signatureHtml}</body></html>`;

        const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
        saveAs(blob, `eposta_imzasi_${templateId}_${companyName.toLowerCase().replace(/\s+/g, '_')}.html`);
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
                    preview={<LetterheadPreview logoSvgBase64={logoSvgBase64} brandColor={brandColor} companyName={companyName} personalizedDetails={cardDetails} selectedTemplate={selectedLetterheadTemplate} />}
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
                        selectedLetterheadTemplate={selectedLetterheadTemplate}
                        onTemplateChange={setSelectedLetterheadTemplate}
                    >
                        <PersonalizationForm details={cardDetails} onChange={handleInputChange} companyName={companyName} />
                    </LetterheadEditor>
                </AssetCard>
                <AssetCard
                    icon={<UserSquare className="w-6 h-6" />}
                    title="Kartvizit"
                    description="Ön ve arka yüzünü görüntülemek ve indirmek için genişletin."
                    preview={<BusinessCardPreview logoSvgBase64={logoSvgBase64} personalizedDetails={cardDetails} brandColor={brandColor} companyName={companyName} selectedTemplate={selectedCardTemplate} />}
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
                        companyName={companyName}
                        personalizedDetails={cardDetails}
                        onDownload={handleDownloadBusinessCard}
                        selectedCardTemplate={selectedCardTemplate}
                        onTemplateChange={setSelectedCardTemplate}
                    >
                         <PersonalizationForm details={cardDetails} onChange={handleInputChange} companyName={companyName} />
                    </BusinessCardEditor>
                </AssetCard>
                 <AssetCard
                    icon={<Mail className="w-6 h-6" />}
                    title="E-posta İmzası"
                    description="HTML formatında kişisel imzanızı oluşturun ve indirin."
                    preview={<EmailSignaturePreview logoSvgBase64={logoSvgBase64} brandColor={brandColor} companyName={companyName} personalizedDetails={cardDetails} selectedTemplate={selectedEmailSignatureTemplate} />}
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
                        selectedEmailSignatureTemplate={selectedEmailSignatureTemplate}
                        onTemplateChange={setSelectedEmailSignatureTemplate}
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