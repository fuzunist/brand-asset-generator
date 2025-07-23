import React, { useState, useEffect } from 'react';
import { FiX, FiCalendar, FiTag, FiCopy, FiRefreshCw } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { calendarAPI } from '../services/api';
import clsx from 'clsx';

const EventModal = ({ event, isOpen, onClose, userIndustry }) => {
  const [prompts, setPrompts] = useState(null);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);
  
  useEffect(() => {
    if (isOpen && event && userIndustry) {
      generatePrompts();
    }
  }, [isOpen, event, userIndustry]);
  
  const generatePrompts = async () => {
    if (!event || !userIndustry) return;
    
    setIsLoadingPrompts(true);
    try {
      const response = await calendarAPI.generatePrompt(
        event.name,
        userIndustry,
        event.description
      );
      setPrompts(response.data);
    } catch (error) {
      console.error('Failed to generate prompts:', error);
    } finally {
      setIsLoadingPrompts(false);
    }
  };
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };
  
  if (!isOpen || !event) return null;
  
  const eventTypeColors = {
    holiday: 'bg-blue-100 text-blue-800',
    social: 'bg-pink-100 text-pink-800',
    custom: 'bg-green-100 text-green-800'
  };
  
  return (
    <>
      {/* Backdrop */}
      <div 
        className="modal-backdrop"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="modal-content bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden pointer-events-auto">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{event.name}</h2>
                <div className="flex items-center gap-4 mt-2">
                  <span className="flex items-center text-gray-600">
                    <FiCalendar className="mr-1" />
                    {format(new Date(event.date), 'MMMM d, yyyy')}
                  </span>
                  <span className={clsx(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    eventTypeColors[event.type] || eventTypeColors.custom
                  )}>
                    {event.type}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {/* Description */}
            {event.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">About this event</h3>
                <p className="text-gray-600">{event.description}</p>
              </div>
            )}
            
            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                    >
                      <FiTag className="mr-1" size={14} />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* AI Content Suggestions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Content Ideas for {userIndustry}
                </h3>
                <button
                  onClick={generatePrompts}
                  disabled={isLoadingPrompts}
                  className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors disabled:opacity-50"
                >
                  <FiRefreshCw className={clsx(isLoadingPrompts && 'animate-spin')} />
                  Regenerate
                </button>
              </div>
              
              {isLoadingPrompts ? (
                <div className="flex items-center justify-center py-8">
                  <div className="spinner border-2 border-gray-300 border-t-primary-600 rounded-full w-8 h-8"></div>
                </div>
              ) : prompts ? (
                <div className="space-y-4">
                  {Object.entries(prompts).map(([key, prompt], index) => (
                    <div
                      key={key}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-500 mb-1">
                            Idea {index + 1}
                          </p>
                          <p className="text-gray-800">{prompt}</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(prompt)}
                          className="flex-shrink-0 p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded transition-all"
                          title="Copy to clipboard"
                        >
                          <FiCopy size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Failed to load content suggestions. Please try again.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventModal;