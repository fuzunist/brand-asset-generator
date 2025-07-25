const cron = require('node-cron');
const { processAllBrands } = require('./sentimentAnalysisService');

// Schedule the sentiment analysis job
// Run every hour at minute 0
const scheduleSentimentAnalysis = () => {
    console.log('Starting sentiment analysis scheduler...');
    
    // Run every hour
    cron.schedule('0 * * * *', async () => {
        console.log('Running scheduled sentiment analysis job at', new Date());
        try {
            await processAllBrands();
            console.log('Sentiment analysis job completed successfully');
        } catch (error) {
            console.error('Error in scheduled sentiment analysis job:', error);
        }
    });

    // Also run immediately on startup for testing, but with a delay
    if (process.env.NODE_ENV === 'development') {
        console.log('Scheduling initial sentiment analysis job with a 10-second delay...');
        setTimeout(() => {
            console.log('Running initial sentiment analysis job...');
            processAllBrands().catch(console.error);
        }, 10000); // 10-second delay
    }
};

module.exports = { scheduleSentimentAnalysis };