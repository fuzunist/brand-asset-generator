import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';

import './index.css';
import LandingPage from './components/LandingPage';
import LogoCreator from './components/LogoCreator';
import LogoResults from './components/LogoResults';
import LogoEditor from './components/LogoEditor';
import PricingPage from './components/PricingPage';
import BusinessCardGenerator from './components/BusinessCardGenerator';
import BrandBookGenerator from './components/BrandBookGenerator';
import EmailSignatureGenerator from './components/EmailSignatureGenerator';
import EmailTemplateGenerator from './components/EmailTemplateGenerator';
import LetterheadGenerator from './components/LetterheadGenerator';
import DocumentGenerator from './components/DocumentGenerator';
import BrandDetails from './components/BrandDetails';
import ProgressTracker from './components/ProgressTracker';
import NextStepCTA from './components/NextStepCTA';
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
import MicroSurveyDashboard from './components/MicroSurveyDashboard';
import SmartDocumentGenerator from './components/SmartDocumentGenerator';

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
const Dashboard = () => {
    const { brandDetails } = useAuth();
    
    // Determine current step and completed steps based on user progress
    const hasLogo = brandDetails?.logoWithText || brandDetails?.logoWithoutText;
    const hasBrandKit = hasLogo; // Simplified logic - can be enhanced
    
    let currentStep = 1;
    let completedSteps = [];
    
    if (hasLogo) {
        completedSteps.push(1);
        currentStep = 2;
    }
    if (hasBrandKit) {
        completedSteps.push(2);
        currentStep = 3;
    }
    
    return (
        <div className="space-y-8">
            <ProgressTracker currentStep={currentStep} completedSteps={completedSteps} />
            
            {/* Step 1: Logo & Brand Details */}
            <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-6 rounded-lg border-l-4 border-indigo-500">
                <h2 className="text-2xl font-bold text-indigo-800 mb-2">AŞAMA 1: Logo & Marka Kimliği</h2>
                <p className="text-indigo-600 mb-4">Markanızın temelini oluşturun</p>
            </div>
                        <BrandDetails />
            
            <NextStepCTA currentStep={1} hasCompletedCurrentStep={hasLogo} />
            
            {/* Step 2: Brand Kit */}
            <div className="bg-gradient-to-r from-pink-50 to-pink-100 p-6 rounded-lg border-l-4 border-pink-500">
                <h2 className="text-2xl font-bold text-pink-800 mb-2">AŞAMA 2: Marka Lansman Kitleri</h2>
                <p className="text-pink-600 mb-4">Markanızı hayata geçirin</p>
            </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BrandBookGenerator />
            <BusinessCardGenerator />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EmailSignatureGenerator />
            <LetterheadGenerator />
        </div>
        
        <NextStepCTA currentStep={2} hasCompletedCurrentStep={hasBrandKit} />
        
        {/* Step 3: Brand OS Features */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg border-l-4 border-purple-500">
            <h2 className="text-2xl font-bold text-purple-800 mb-2">AŞAMA 3: Brand OS Özellikleri</h2>
            <p className="text-purple-600 mb-4">Markanızın sürekli büyümesi için akıllı araçlar</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md border">
                <h3 className="text-lg font-semibold mb-3">Hızlı Erişim</h3>
                <div className="space-y-2">
                    <Link to="/dashboard/ad-kit" className="block text-blue-600 hover:text-blue-800">→ Reklam Kiti Oluştur</Link>
                    <Link to="/dashboard/email-generator" className="block text-blue-600 hover:text-blue-800">→ E-posta Şablonları</Link>
                    <Link to="/dashboard/document-generator" className="block text-blue-600 hover:text-blue-800">→ Akıllı Dokümanlar</Link>
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border">
                <h3 className="text-lg font-semibold mb-3">Analiz & İzleme</h3>
                <div className="space-y-2">
                    <Link to="/dashboard/sentiment-analysis" className="block text-blue-600 hover:text-blue-800">→ Algı Analizi</Link>
                    <Link to="/dashboard/website-audit" className="block text-blue-600 hover:text-blue-800">→ Web Sitesi Raporu</Link>
                    <Link to="/dashboard/brand-consistency" className="block text-blue-600 hover:text-blue-800">→ Marka Tutarlılığı</Link>
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border">
                <h3 className="text-lg font-semibold mb-3">İçerik & Büyüme</h3>
                <div className="space-y-2">
                    <Link to="/dashboard/thought-leadership" className="block text-blue-600 hover:text-blue-800">→ Düşünce Liderliği</Link>
                    <Link to="/dashboard/micro-survey" className="block text-blue-600 hover:text-blue-800">→ Mikro Anketler</Link>
                    <Link to="/dashboard/press-kit" className="block text-blue-600 hover:text-blue-800">→ Basın Kiti</Link>
                </div>
            </div>
        </div>
    </div>
    );
};

// Main layout with sidebar navigation
const Layout = () => {
    const { user, logout } = useAuth();

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Left Sidebar */}
            <div className="w-64 bg-white shadow-lg border-r border-gray-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-gray-800">Brand OS</h1>
                    <p className="text-sm text-gray-600 mt-1">Markanızın İşletim Sistemi</p>
                </div>

                {/* Navigation */}
                <nav className="mt-6">
                    {user ? (
                        <div className="px-4 space-y-2">
                            <Link 
                                to="/dashboard" 
                                className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                                </svg>
                                Dashboard
                            </Link>
                            
                            <Link 
                                to="/dashboard/brand-consistency" 
                                className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                                Brand Consistency
                            </Link>
                            
                            <Link 
                                to="/dashboard/website-audit" 
                                className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Website Audit
                            </Link>
                            
                            <Link 
                                to="/dashboard/press-kit" 
                                className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                </svg>
                                Press Kit
                            </Link>
                            
                            <Link 
                                to="/dashboard/email-generator" 
                                className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Advanced Email Generator
                            </Link>
                            
                            <Link 
                                to="/dashboard/document-generator" 
                                className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Document Generator
                            </Link>
                            
                            <Link 
                                to="/dashboard/ad-kit" 
                                className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Ad Kit Generator
                            </Link>
                            
                            <Link 
                                to="/dashboard/sentiment-analysis" 
                                className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Sentiment Analysis
                            </Link>
                            
                            <Link 
                                to="/dashboard/thought-leadership" 
                                className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                Thought Leadership
                            </Link>
                            
                            <Link 
                                to="/dashboard/micro-survey" 
                                className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Micro Survey
                            </Link>
                            
                            <Link 
                                to="/dashboard/smart-documents" 
                                className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Smart Documents
                            </Link>
                            
                            {user.role === 'owner' && (
                                <Link 
                                    to="/dashboard/team" 
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
                    {/* Public landing page */}
                    <Route path="/" element={<LandingPage />} />
                    
                    {/* Ficonica MVP Routes */}
                    <Route path="/logo-creator" element={<LogoCreator />} />
                    <Route path="/logo-results" element={<LogoResults />} />
                    <Route path="/logo-editor" element={<LogoEditor />} />
                    <Route path="/pricing" element={<PricingPage />} />
                    
                    {/* Dashboard and tools - with sidebar layout */}
                    <Route path="/dashboard" element={<Layout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="brand-consistency" element={<BrandConsistencyAuditor />} />
                        <Route path="website-audit" element={<WebsiteReportGenerator />} />
                        <Route path="press-kit" element={<PressKitSettings />} />
                        <Route path="email-generator" element={<EmailTemplateGenerator />} />
                        <Route path="document-generator" element={<DocumentGenerator />} />
                        <Route path="ad-kit" element={<AdKitGenerator />} />
                        <Route path="sentiment-analysis" element={<SentimentAnalysisDashboard />} />
                        <Route path="thought-leadership" element={<ThoughtLeadership />} />
                        <Route path="micro-survey" element={<MicroSurveyDashboard />} />
                        <Route path="smart-documents" element={<SmartDocumentGenerator />} />
                        <Route path="team" element={<TeamManagementPage />} />
                    </Route>
                    
                    {/* Public routes */}
                    <Route path="accept-invitation" element={<AcceptInvitationPage />} />
                    <Route path="/press/:slug" element={<PressKitPage />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
