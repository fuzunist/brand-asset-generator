import React from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { useIndustries } from '../hooks/useCalendarEvents';
import clsx from 'clsx';

const IndustrySelector = ({ value, onChange }) => {
  const { data, isLoading } = useIndustries();
  const industries = data?.data || [];
  
  return (
    <div className="relative">
      <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
        Your Industry
      </label>
      <div className="relative">
        <select
          id="industry"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={isLoading}
          className={clsx(
            "block w-full px-4 py-2 pr-8 border border-gray-300 rounded-lg",
            "bg-white text-gray-900 focus:outline-none focus:ring-2",
            "focus:ring-primary-500 focus:border-primary-500",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "appearance-none cursor-pointer"
          )}
        >
          <option value="">All Industries</option>
          {industries.map((industry) => (
            <option key={industry.value} value={industry.value}>
              {industry.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <FiChevronDown className="text-gray-400" />
        </div>
      </div>
      <p className="mt-1 text-xs text-gray-500">
        Select your industry to see relevant events and get tailored content suggestions
      </p>
    </div>
  );
};

export default IndustrySelector;