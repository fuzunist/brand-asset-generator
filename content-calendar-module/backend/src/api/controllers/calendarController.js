const calendarService = require('../../services/calendarService');
const aiService = require('../../services/aiService');
const logger = require('../../utils/logger');

class CalendarController {
  /**
   * Get calendar events for a specific month
   * GET /api/calendar/events?month=7&year=2024&industry=technology
   */
  async getEvents(req, res) {
    try {
      const { month, year, industry, countryCode } = req.query;
      
      logger.info(`Fetching events for ${month}/${year}, industry: ${industry || 'all'}`);
      
      const events = await calendarService.getEventsForMonth(
        parseInt(month),
        parseInt(year),
        industry,
        countryCode
      );
      
      res.json({
        success: true,
        data: {
          month: parseInt(month),
          year: parseInt(year),
          totalEvents: events.length,
          events: events
        }
      });
      
    } catch (error) {
      logger.error('Error in getEvents controller:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch calendar events'
      });
    }
  }
  
  /**
   * Generate AI content prompts for an event
   * POST /api/calendar/generate-prompt
   */
  async generatePrompt(req, res) {
    try {
      const { eventName, userIndustry, eventDescription } = req.body;
      
      logger.info(`Generating prompts for ${eventName} - ${userIndustry}`);
      
      const prompts = await aiService.generateContentPrompts(
        eventName,
        userIndustry,
        eventDescription
      );
      
      res.json({
        success: true,
        data: prompts
      });
      
    } catch (error) {
      logger.error('Error in generatePrompt controller:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate content prompts'
      });
    }
  }
  
  /**
   * Get list of supported industries
   * GET /api/calendar/industries
   */
  async getIndustries(req, res) {
    const industries = [
      { value: 'technology', label: 'Technology' },
      { value: 'fashion', label: 'Fashion & Apparel' },
      { value: 'food-beverage', label: 'Food & Beverage' },
      { value: 'retail', label: 'Retail' },
      { value: 'health-wellness', label: 'Health & Wellness' },
      { value: 'education', label: 'Education' },
      { value: 'entertainment', label: 'Entertainment & Media' },
      { value: 'nonprofit', label: 'Nonprofit' },
      { value: 'travel-hospitality', label: 'Travel & Hospitality' }
    ];
    
    res.json({
      success: true,
      data: industries
    });
  }
  
  /**
   * Health check endpoint
   * GET /api/calendar/health
   */
  async healthCheck(req, res) {
    res.json({
      success: true,
      message: 'Calendar service is running',
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = new CalendarController();