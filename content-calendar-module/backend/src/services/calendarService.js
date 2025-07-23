const db = require('../config/database');
const axios = require('axios');
const logger = require('../utils/logger');

class CalendarService {
  /**
   * Fetch events for a specific month
   * @param {number} month - Month (1-12)
   * @param {number} year - Year
   * @param {string} userIndustry - User's industry for filtering
   * @param {string} countryCode - Country code for holidays
   * @returns {Array} Array of calendar events
   */
  async getEventsForMonth(month, year, userIndustry = null, countryCode = 'US') {
    try {
      // Calculate date range for the month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      // Format dates for query
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      // Base query
      let query = db('calendar_events')
        .where('is_active', true)
        .whereBetween('date', [startDateStr, endDateStr])
        .orderBy('date', 'asc');
      
      // Get all events
      const events = await query;
      
      // Filter by user industry if provided
      let filteredEvents = events;
      if (userIndustry) {
        filteredEvents = events.filter(event => {
          if (!event.tags) return true; // Include events without tags
          
          const tags = JSON.parse(event.tags);
          const industryTags = this.getIndustryTags(userIndustry);
          
          // Check if any event tag matches industry tags
          return tags.some(tag => industryTags.includes(tag));
        });
      }
      
      // Parse and format events
      return filteredEvents.map(event => ({
        id: event.id,
        date: event.date,
        name: event.name,
        type: event.type,
        description: event.description,
        tags: event.tags ? JSON.parse(event.tags) : []
      }));
      
    } catch (error) {
      logger.error('Error fetching calendar events:', error);
      throw error;
    }
  }
  
  /**
   * Get relevant tags for an industry
   * @param {string} industry 
   * @returns {Array} Array of relevant tags
   */
  getIndustryTags(industry) {
    const industryTagMap = {
      'technology': ['technology', 'social-media', 'awareness', 'education', 'business'],
      'fashion': ['fashion', 'retail', 'awareness', 'social', 'entertainment'],
      'food-beverage': ['food', 'beverage', 'restaurant', 'health', 'sustainability'],
      'retail': ['retail', 'shopping', 'ecommerce', 'fashion', 'gift'],
      'health-wellness': ['health', 'wellness', 'fitness', 'mental-health', 'awareness'],
      'education': ['education', 'youth', 'awareness', 'culture', 'social'],
      'entertainment': ['entertainment', 'pop-culture', 'fun', 'media', 'arts'],
      'nonprofit': ['nonprofit', 'awareness', 'social', 'charity', 'global'],
      'travel-hospitality': ['travel', 'hospitality', 'culture', 'food', 'awareness']
    };
    
    const normalizedIndustry = industry.toLowerCase().replace(/[^a-z-]/g, '-');
    return industryTagMap[normalizedIndustry] || ['awareness', 'social', 'business'];
  }
  
  /**
   * Fetch holidays from external API (Calendarific)
   * @param {string} countryCode 
   * @param {number} year 
   */
  async fetchExternalHolidays(countryCode = 'US', year = new Date().getFullYear()) {
    try {
      const apiKey = process.env.CALENDARIFIC_API_KEY;
      if (!apiKey) {
        logger.warn('Calendarific API key not configured');
        return [];
      }
      
      const response = await axios.get('https://calendarific.com/api/v2/holidays', {
        params: {
          api_key: apiKey,
          country: countryCode,
          year: year
        }
      });
      
      if (response.data.meta.code !== 200) {
        throw new Error('Failed to fetch holidays from Calendarific');
      }
      
      // Transform and return holidays
      return response.data.response.holidays.map(holiday => ({
        name: holiday.name,
        date: holiday.date.iso,
        type: 'holiday',
        description: holiday.description,
        tags: this.generateHolidayTags(holiday),
        country_code: countryCode
      }));
      
    } catch (error) {
      logger.error('Error fetching external holidays:', error);
      return [];
    }
  }
  
  /**
   * Generate tags for a holiday based on its type
   * @param {Object} holiday 
   * @returns {Array} Array of tags
   */
  generateHolidayTags(holiday) {
    const tags = ['holiday'];
    
    // Add tags based on holiday type
    if (holiday.type.includes('National')) tags.push('national');
    if (holiday.type.includes('Religious')) tags.push('religious');
    if (holiday.type.includes('Observance')) tags.push('awareness');
    
    // Add tags based on name
    const name = holiday.name.toLowerCase();
    if (name.includes('day')) tags.push('awareness');
    if (name.includes('thanksgiving') || name.includes('christmas')) tags.push('retail', 'family');
    if (name.includes('valentine')) tags.push('romance', 'retail');
    if (name.includes('mother') || name.includes('father')) tags.push('family', 'gift');
    
    return tags;
  }
  
  /**
   * Save external holidays to database
   * @param {Array} holidays 
   */
  async saveHolidaysToDatabase(holidays) {
    try {
      // Prepare holidays for insertion
      const holidaysToInsert = holidays.map(holiday => ({
        ...holiday,
        tags: JSON.stringify(holiday.tags),
        is_active: true
      }));
      
      // Insert or update holidays
      for (const holiday of holidaysToInsert) {
        await db('calendar_events')
          .insert(holiday)
          .onConflict(['date', 'name'])
          .merge();
      }
      
      logger.info(`Saved ${holidays.length} holidays to database`);
      
    } catch (error) {
      logger.error('Error saving holidays to database:', error);
      throw error;
    }
  }
}

module.exports = new CalendarService();