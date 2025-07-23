import React, { useState, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { format } from 'date-fns';
import { useCalendarEvents } from '../hooks/useCalendarEvents';
import EventModal from './EventModal';
import clsx from 'clsx';

const Calendar = ({ selectedIndustry }) => {
  const calendarRef = useRef(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Fetch events for current month
  const { data, isLoading, error } = useCalendarEvents(
    currentMonth,
    currentYear,
    selectedIndustry
  );
  
  // Transform events for FullCalendar
  const calendarEvents = data?.data?.events?.map(event => ({
    id: event.id,
    title: event.name,
    date: event.date,
    classNames: [`fc-event-${event.type}`],
    extendedProps: {
      ...event
    }
  })) || [];
  
  // Handle date changes
  const handleDatesSet = (dateInfo) => {
    const newMonth = dateInfo.view.currentStart.getMonth() + 1;
    const newYear = dateInfo.view.currentStart.getFullYear();
    
    if (newMonth !== currentMonth || newYear !== currentYear) {
      setCurrentMonth(newMonth);
      setCurrentYear(newYear);
    }
  };
  
  // Handle event click
  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event.extendedProps);
    setIsModalOpen(true);
  };
  
  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedEvent(null), 300);
  };
  
  return (
    <div className="calendar-container">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <div className="flex flex-col items-center">
            <div className="spinner border-4 border-gray-300 border-t-primary-600 rounded-full w-12 h-12"></div>
            <p className="mt-4 text-gray-600">Loading events...</p>
          </div>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">Failed to load calendar events. Please try again.</p>
        </div>
      )}
      
      {/* Calendar */}
      <div className={clsx('calendar-wrapper', isLoading && 'opacity-50')}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth'
          }}
          events={calendarEvents}
          eventClick={handleEventClick}
          datesSet={handleDatesSet}
          height="auto"
          dayMaxEvents={3}
          moreLinkClick="popover"
          eventDisplay="block"
          displayEventTime={false}
          eventMouseEnter={(info) => {
            info.el.style.cursor = 'pointer';
          }}
          eventMouseLeave={(info) => {
            info.el.style.cursor = 'default';
          }}
        />
      </div>
      
      {/* Event Stats */}
      {data?.data && (
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">Holidays</p>
            <p className="text-2xl font-bold text-blue-900">
              {data.data.events.filter(e => e.type === 'holiday').length}
            </p>
          </div>
          <div className="bg-pink-50 p-4 rounded-lg">
            <p className="text-sm text-pink-600 font-medium">Social Media Days</p>
            <p className="text-2xl font-bold text-pink-900">
              {data.data.events.filter(e => e.type === 'social').length}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600 font-medium">Total Events</p>
            <p className="text-2xl font-bold text-green-900">
              {data.data.totalEvents}
            </p>
          </div>
        </div>
      )}
      
      {/* Event Modal */}
      <EventModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={closeModal}
        userIndustry={selectedIndustry}
      />
    </div>
  );
};

export default Calendar;