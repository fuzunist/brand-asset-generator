import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { FiCalendar, FiInfo } from 'react-icons/fi';
import Calendar from './components/Calendar';
import IndustrySelector from './components/IndustrySelector';
import './styles/index.css';

function App() {
  const [selectedIndustry, setSelectedIndustry] = useState(() => {
    // Load from localStorage
    return localStorage.getItem('userIndustry') || '';
  });
  
  // Save industry preference
  useEffect(() => {
    if (selectedIndustry) {
      localStorage.setItem('userIndustry', selectedIndustry);
    } else {
      localStorage.removeItem('userIndustry');
    }
  }, [selectedIndustry]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <FiCalendar className="text-primary-600 mr-3" size={28} />
              <h1 className="text-xl font-bold text-gray-900">
                Content Calendar
              </h1>
            </div>
            <div className="text-sm text-gray-500">
              Never miss a marketing opportunity
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start">
          <FiInfo className="text-blue-600 mr-3 mt-0.5 flex-shrink-0" size={20} />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Welcome to your Content Calendar!</p>
            <p>
              This calendar automatically shows relevant holidays and special days for your industry. 
              Click on any event to get AI-powered content ideas tailored to your business.
            </p>
          </div>
        </div>
        
        {/* Controls */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="max-w-md">
            <IndustrySelector
              value={selectedIndustry}
              onChange={setSelectedIndustry}
            />
          </div>
        </div>
        
        {/* Calendar */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 relative">
          <Calendar selectedIndustry={selectedIndustry} />
        </div>
        
        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-gray-600">Official Holidays</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-pink-500 rounded"></div>
            <span className="text-gray-600">Social Media Days</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-600">Custom Events</span>
          </div>
        </div>
      </main>
      
      {/* Toast Notifications */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

export default App;