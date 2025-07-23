import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';

import './index.css';
import BusinessCardGenerator from './components/BusinessCardGenerator';
import BrandBookGenerator from './components/BrandBookGenerator';
import EmailSignatureGenerator from './components/EmailSignatureGenerator';
import EmailTemplateGenerator from './components/EmailTemplateGenerator';
import LetterheadGenerator from './components/LetterheadGenerator';
import DocumentGenerator from './components/DocumentGenerator';
import BrandDetails from './components/BrandDetails';
// import AuthPage from './components/AuthPage';
import AcceptInvitationPage from './components/AcceptInvitationPage';
import TeamManagementPage from './components/TeamManagementPage';
import PressKitPage from './components/PressKitPage';
import PressKitSettings from './components/PressKitSettings';
import WebsiteReportGenerator from './components/WebsiteReportGenerator';
import BrandConsistencyAuditor from './components/BrandConsistencyAuditor';
import AdKitGenerator from './components/AdKitGenerator';
import SentimentAnalysisDashboard from './components/SentimentAnalysisDashboard';
import ThoughtLeadership from './components/ThoughtLeadership';

// A wrapper for routes that require authentication
/* const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>; // Or a spinner component
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }
    
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />; // Or a 403 Not Authorized page
    }

    return <Outlet />;
}; */

// The main dashboard content
const Dashboard = () => (
    <>
        <BrandDetails />
        <BrandBookGenerator />
        <hr style={{ margin: "40px 0" }} />
        <BusinessCardGenerator />
        <hr style={{ margin: "40px 0" }} />
        <EmailSignatureGenerator />
        <hr style={{ margin: "40px 0" }} />
        <LetterheadGenerator />
    </>
);

// Main layout with sidebar navigation
const Layout = () => {
    const { user, logout } = useAuth();

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Left Sidebar */}
            <div className="w-64 bg-white shadow-lg border-r border-gray-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-gray-800">Brand Asset Generator</h1>
                </div>

                {/* Navigation */}
                <nav className="mt-6">
                    {user ? (
                        <div className="px-4 space-y-2">
                            <Link 
                                to="/" 
                                className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                                </svg>
                                Dashboard
                            </Link>
                            
                            <Link 
                                to="/brand-consistency" 
                                className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                                Brand Consistency
                            </Link>
                            
                            <Link 
                                to="/website-audit" 
                                className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Website Audit
                            </Link>
                            
                            <Link 
                                to="/press-kit" 
                                className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                </svg>
                                Press Kit
                            </Link>
                            
                            <Link 
                                to="/email-generator" 
                                className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Advanced Email Generator
                            </Link>
                            
                            <Link 
                                to="/document-generator" 
                                className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Document Generator
                            </Link>
                            
                            <Link 
                                to="/ad-kit" 
                                className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Ad Kit Generator
                            </Link>
                            
                            <Link 
                                to="/sentiment-analysis" 
                                className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Sentiment Analysis
                            </Link>
                            
                            <Link 
                                to="/thought-leadership" 
                                className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                Thought Leadership
                            </Link>
                            
                            {user.role === 'owner' && (
                                <Link 
                                    to="/team" 
                                    className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                >
                                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                    </svg>
                                    Team
                                </Link>
                            )}
                            
                            {/* Divider */}
                            <div className="border-t border-gray-200 my-4"></div>
                            
                            <button 
                                onClick={logout}
                                className="flex items-center w-full px-4 py-3 text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                            >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="px-4">
                            <Link 
                                to="/login"
                                className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                </svg>
                                Login
                            </Link>
                        </div>
                    )}
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};


function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        {/* Public routes */}
                        {/* <Route path="login" element={<AuthPage />} /> */}
                        <Route path="accept-invitation" element={<AcceptInvitationPage />} />
                        
                        {/* Protected routes */}
                        {/* <Route element={<ProtectedRoute />}> */}
                            {/* Dashboard is the default protected route */}
                            <Route index element={<Dashboard />} />
                            <Route path="brand-consistency" element={<BrandConsistencyAuditor />} />
                            <Route path="website-audit" element={<WebsiteReportGenerator />} />
                            <Route path="press-kit" element={<PressKitSettings />} />
                            <Route path="email-generator" element={<EmailTemplateGenerator />} />
                            <Route path="document-generator" element={<DocumentGenerator />} />
                            <Route path="ad-kit" element={<AdKitGenerator />} />
                            <Route path="sentiment-analysis" element={<SentimentAnalysisDashboard />} />
                            <Route path="thought-leadership" element={<ThoughtLeadership />} />
                        {/* </Route> */}

                        {/* Owner-only routes */}
                        {/* <Route element={<ProtectedRoute allowedRoles={['owner']} />}> */}
                           <Route path="team" element={<TeamManagementPage />} />
                        {/* </Route> */}
                    </Route>
                    
                    {/* Public press kit route - outside of Layout */}
                    <Route path="/press/:slug" element={<PressKitPage />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
