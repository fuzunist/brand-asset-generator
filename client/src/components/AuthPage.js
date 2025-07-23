import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [autoLoginLoading, setAutoLoginLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleEmailChange = (e) => {
        const emailValue = e.target.value;
        setEmail(emailValue);
        
        // Auto-login for demo email
        if (emailValue === 'deneme@deneme.com') {
            setAutoLoginLoading(true);
            setMessage('Demo hesabı ile otomatik giriş yapılıyor...');
            setError('');
            
            const demoUser = {
                id: 1,
                fullName: 'Demo User',
                email: 'deneme@deneme.com',
                companyName: 'Demo Company'
            };
            const demoToken = 'demo-auth-token-12345';
            
            // Small delay for better UX
            setTimeout(() => {
                login(demoUser, demoToken);
                navigate('/');
            }, 800);
        } else {
            setAutoLoginLoading(false);
            setMessage('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        // Auto-login for demo email
        if (email === 'deneme@deneme.com') {
            const demoUser = {
                id: 1,
                fullName: 'Demo User',
                email: 'deneme@deneme.com',
                companyName: 'Demo Company'
            };
            const demoToken = 'demo-auth-token-12345';
            login(demoUser, demoToken);
            navigate('/');
            return;
        }

        if (isLogin) {
            try {
                const response = await axios.post('http://localhost:3001/api/auth/login', { email, password });
                login(response.data.user, response.data.token);
                navigate('/');
            } catch (err) {
                setError(err.response?.data?.message || 'Login failed.');
            }
        } else {
            try {
                await axios.post('http://localhost:3001/api/auth/register', { fullName, email, password, companyName });
                setMessage('Registration successful! Please log in.');
                setIsLogin(true); // Switch to login form
            } catch (err) {
                setError(err.response?.data?.message || 'Registration failed.');
            }
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px' }}>
            <h2>{isLogin ? 'Login' : 'Register'}</h2>
            <form onSubmit={handleSubmit}>
                {!isLogin && (
                    <>
                        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" required style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
                        <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Company Name" required style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
                    </>
                )}
                <input type="email" value={email} onChange={handleEmailChange} placeholder="Email (deneme@deneme.com için otomatik giriş)" required style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
                <button 
                    type="submit" 
                    disabled={autoLoginLoading}
                    style={{ 
                        width: '100%', 
                        padding: '10px', 
                        background: autoLoginLoading ? '#9CA3AF' : '#4F46E5', 
                        color: 'white', 
                        border: 'none', 
                        cursor: autoLoginLoading ? 'not-allowed' : 'pointer' 
                    }}
                >
                    {autoLoginLoading ? 'Giriş yapılıyor...' : (isLogin ? 'Login' : 'Register')}
                </button>
            </form>
            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
            {message && <p style={{ color: 'green', marginTop: '10px' }}>{message}</p>}
            <button onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: '#4F46E5', cursor: 'pointer', marginTop: '10px' }}>
                {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
            </button>
        </div>
    );
};

export default AuthPage; 