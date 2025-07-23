import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState({ name: "Dev User", role: "owner" });
    const [token, setToken] = useState("dev-token");
    const [loading, setLoading] = useState(false);
    const [brandDetails, setBrandDetails] = useState({
        logoWithoutText: null,
        logoWithText: null,
        primaryColor: '#4F46E5',
        secondaryColor: '#EC4899'
    });

    useEffect(() => {
        /* const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
        setLoading(false); */
    }, []);

    const login = (userData, userToken) => {
        /* localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', userToken);
        setUser(userData);
        setToken(userToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`; */
    };

    const logout = () => {
        /* localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
        delete axios.defaults.headers.common['Authorization']; */
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading, brandDetails, setBrandDetails }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
}; 