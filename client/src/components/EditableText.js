import React, { useState } from 'react';

const EditableText = ({ value, onChange, style, multiline = false }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(value);

    const handleFocus = () => {
        setIsEditing(true);
    };

    const handleChange = (e) => {
        setText(e.target.value);
    };

    const handleBlur = () => {
        setIsEditing(false);
        onChange(text);
    };

    const handleKeyDown = (e) => {
        if (!multiline && e.key === 'Enter') {
            e.preventDefault();
            handleBlur();
        }
    };

    const inputStyle = {
        ...style,
        background: 'transparent',
        border: '1px dashed #ccc',
        borderRadius: '2px',
        padding: '2px 4px',
        fontFamily: 'inherit',
        fontSize: 'inherit',
        color: 'inherit'
    };

    const displayStyle = {
        ...style,
        cursor: 'pointer',
        padding: '2px 4px',
        borderRadius: '2px',
        transition: 'background-color 0.2s',
        ':hover': {
            backgroundColor: 'rgba(79, 70, 229, 0.1)'
        }
    };

    if (isEditing) {
        if (multiline) {
            return (
                <textarea
                    value={text}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    style={{
                        ...inputStyle,
                        resize: 'none',
                        minHeight: '60px',
                        width: '100%'
                    }}
                />
            );
        } else {
            return (
                <input
                    type="text"
                    value={text}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    style={inputStyle}
                />
            );
        }
    }

    return (
        <span 
            onClick={handleFocus} 
            style={displayStyle}
            title="Click to edit"
        >
            {multiline ? (
                <span style={{ whiteSpace: 'pre-line' }}>{text}</span>
            ) : (
                text
            )}
        </span>
    );
};

export default EditableText; 