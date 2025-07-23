import React from 'react';

const templates = [
    { id: 'template_minimal_01', name: 'Minimalist' },
    // Note: Only template_minimal_01.html exists on the server
    // { id: 'template_modern_02', name: 'Modern' },
    // { id: 'template_classic_03', name: 'Classic' },
];

const TemplateSelector = ({ selectedTemplate, onSelectTemplate }) => {
    return (
        <div>
            <h2>Select a Template</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
                {templates.map(template => (
                    <div
                        key={template.id}
                        onClick={() => onSelectTemplate(template.id)}
                        style={{
                            padding: '15px 20px',
                            border: `2px solid ${selectedTemplate === template.id ? '#4F46E5' : '#ccc'}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            backgroundColor: selectedTemplate === template.id ? '#f0f7ff' : '#fff',
                            transition: 'all 0.3s ease',
                            minWidth: '120px',
                            textAlign: 'center'
                        }}
                    >
                        <strong>{template.name}</strong>
                        {selectedTemplate === template.id && (
                            <div style={{ 
                                color: '#4F46E5', 
                                fontSize: '12px', 
                                marginTop: '4px' 
                            }}>
                                ✓ Selected
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {templates.length === 1 && (
                <p style={{ 
                    color: '#666', 
                    fontSize: '14px', 
                    marginTop: '10px',
                    fontStyle: 'italic' 
                }}>
                    More templates coming soon!
                </p>
            )}
        </div>
    );
};

export default TemplateSelector; 