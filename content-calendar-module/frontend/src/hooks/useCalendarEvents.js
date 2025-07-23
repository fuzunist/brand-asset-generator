import { useQuery } from 'react-query';
import { calendarAPI } from '../services/api';

export const useCalendarEvents = (month, year, industry) => {
  return useQuery(
    ['calendar-events', month, year, industry],
    () => calendarAPI.getEvents(month, year, industry),
    {
      enabled: !!month && !!year,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 2,
      onError: (error) => {
        console.error('Failed to fetch calendar events:', error);
      }
    }
  );
};

export const useIndustries = () => {
  return useQuery(
    'industries',
    () => calendarAPI.getIndustries(),
    {
      staleTime: 60 * 60 * 1000, // 1 hour
      cacheTime: 24 * 60 * 60 * 1000, // 24 hours
      refetchOnWindowFocus: false
    }
  );
};