import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AcceptInvitationPage = () => {
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!token) {
            setError('Invitation token is missing.');
            return;
        }

        try {
            await axios.post('http://localhost:3001/api/invitations/accept', { token, fullName, password });
            setMessage('Account created successfully! You can now log in.');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to accept invitation.');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px' }}>
            <h2>Accept Invitation</h2>
            {token ? (
                <form onSubmit={handleSubmit}>
                    <p>Create your account to join the team.</p>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" required style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
                    <button type="submit" style={{ width: '100%', padding: '10px', background: '#4F46E5', color: 'white', border: 'none', cursor: 'pointer' }}>Complete Registration</button>
                </form>
            ) : (
                <p style={{ color: 'red' }}>Invalid or missing invitation link.</p>
            )}
            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
            {message && <p style={{ color: 'green', marginTop: '10px' }}>{message}</p>}
        </div>
    );
};

export default AcceptInvitationPage; 