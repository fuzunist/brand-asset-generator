const cron = require('node-cron');
const calendarService = require('../services/calendarService');
const logger = require('../utils/logger');

/**
 * Aggregate events from external sources
 * This job runs on the 1st of each month at 2 AM
 */
async function aggregateEvents() {
  logger.info('Starting event aggregation job...');
  
  try {
    const currentYear = new Date().getFullYear();
    const countries = ['US', 'GB', 'CA']; // Add more countries as needed
    
    for (const country of countries) {
      logger.info(`Fetching holidays for ${country}...`);
      
      // Fetch holidays for current and next year
      for (let yearOffset = 0; yearOffset <= 1; yearOffset++) {
        const year = currentYear + yearOffset;
        const holidays = await calendarService.fetchExternalHolidays(country, year);
        
        if (holidays.length > 0) {
          await calendarService.saveHolidaysToDatabase(holidays);
          logger.info(`Saved ${holidays.length} holidays for ${country} - ${year}`);
        }
      }
    }
    
    logger.info('Event aggregation completed successfully');
    
  } catch (error) {
    logger.error('Event aggregation failed:', error);
  }
}

// Schedule the job - runs on the 1st of each month at 2 AM
function scheduleAggregationJob() {
  cron.schedule('0 2 1 * *', aggregateEvents, {
    scheduled: true,
    timezone: 'UTC'
  });
  
  logger.info('Event aggregation job scheduled for the 1st of each month at 2 AM UTC');
}

// Export for manual execution and scheduling
module.exports = {
  aggregateEvents,
  scheduleAggregationJob
};

// If run directly, execute the aggregation
if (require.main === module) {
  require('dotenv').config();
  aggregateEvents()
    .then(() => {
      logger.info('Manual aggregation completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Manual aggregation failed:', error);
      process.exit(1);
    });
}