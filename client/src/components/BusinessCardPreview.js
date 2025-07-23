import React from 'react';
import EditableText from './EditableText';

const BusinessCardPreview = ({ 
    brandData, 
    userData, 
    backSideData,
    templateId, 
    showingSide = 'front',
    onUserDataChange, 
    onBackSideDataChange 
}) => {
    const { brandColors, brandFonts, logoUrl } = brandData;

    const cardStyle = {
        width: '350px',
        height: '200px',
        boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
        padding: '20px',
        fontFamily: brandFonts.body,
        backgroundColor: '#fff',
        color: brandColors.text,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        border: '1px solid #eee',
        borderRadius: '10px',
        position: 'relative'
    };

    const handleFrontFieldChange = (field, value) => {
        onUserDataChange({ ...userData, [field]: value });
    };

    const handleBackFieldChange = (field, value) => {
        onBackSideDataChange({ ...backSideData, [field]: value });
    };

    if (showingSide === 'front') {
        const { fullName, title, email, phone, website } = userData;
        
        return (
            <div>
                <h2>Live Preview - Front Side</h2>
                <div style={cardStyle}>
                    <img src={logoUrl} alt="logo" style={{ maxWidth: '100px', maxHeight: '50px', marginBottom: '10px' }} />
                    <h3 style={{ fontFamily: brandFonts.headline, color: brandColors.primary, margin: '0' }}>
                        <EditableText value={fullName} onChange={(value) => handleFrontFieldChange('fullName', value)} />
                    </h3>
                    <p style={{ margin: '2px 0' }}>
                        <EditableText value={title} onChange={(value) => handleFrontFieldChange('title', value)} />
                    </p>
                    <div style={{ marginTop: '10px' }}>
                        <p style={{ margin: '2px 0', fontSize: '0.8em' }}>
                            <EditableText value={phone} onChange={(value) => handleFrontFieldChange('phone', value)} />
                        </p>
                        <p style={{ margin: '2px 0', fontSize: '0.8em' }}>
                            <EditableText value={email} onChange={(value) => handleFrontFieldChange('email', value)} />
                        </p>
                        <p style={{ margin: '2px 0', fontSize: '0.8em' }}>
                            <EditableText value={website} onChange={(value) => handleFrontFieldChange('website', value)} />
                        </p>
                    </div>
                </div>
            </div>
        );
    } else {
        // Back side preview
        const { services, additionalInfo } = backSideData;
        
        return (
            <div>
                <h2>Live Preview - Back Side</h2>
                <div style={cardStyle}>
                    <div style={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ marginBottom: '15px' }}>
                            <h4 style={{ 
                                color: brandColors.primary, 
                                margin: '0 0 8px 0', 
                                fontSize: '0.9em',
                                fontFamily: brandFonts.headline 
                            }}>
                                Services
                            </h4>
                            <div style={{ fontSize: '0.75em', lineHeight: '1.4' }}>
                                <EditableText 
                                    value={services} 
                                    onChange={(value) => handleBackFieldChange('services', value)}
                                    style={{ whiteSpace: 'pre-line' }}
                                    multiline={true}
                                />
                            </div>
                        </div>
                        
                        <div>
                            <h4 style={{ 
                                color: brandColors.primary, 
                                margin: '0 0 8px 0', 
                                fontSize: '0.9em',
                                fontFamily: brandFonts.headline 
                            }}>
                                Additional Info
                            </h4>
                            <div style={{ fontSize: '0.75em', lineHeight: '1.4' }}>
                                <EditableText 
                                    value={additionalInfo} 
                                    onChange={(value) => handleBackFieldChange('additionalInfo', value)}
                                    style={{ whiteSpace: 'pre-line' }}
                                    multiline={true}
                                />
                            </div>
                        </div>
                        
                        <div style={{ 
                            position: 'absolute', 
                            bottom: '15px', 
                            right: '15px', 
                            opacity: 0.6 
                        }}>
                            <img 
                                src={logoUrl} 
                                alt="logo" 
                                style={{ maxWidth: '40px', maxHeight: '20px' }} 
                            />
                        </div>
                    </div>
                </div>
                
                <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
                    <p><strong>Tip:</strong> Use line breaks to separate items in Services and Additional Info sections.</p>
                    <p><strong>Example:</strong> "Web Development{'\n'}Mobile Apps{'\n'}UI/UX Design"</p>
                </div>
            </div>
        );
    }
};

export default BusinessCardPreview; 