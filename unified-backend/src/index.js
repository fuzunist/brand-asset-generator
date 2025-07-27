const logger = require('./utils/logger');

// This is the main entry point.
// It will initialize and start the server.

async function startServer() {
    logger.info('Starting Unified Backend Server...');
    
    // In the next steps, we will import and initialize
    // the Express app, database connections, and routes here.

    const app = require('./app');

    const PORT = process.env.PORT || 3001;

    app.listen(PORT, () => {
        logger.info(`🚀 Server is listening on http://localhost:${PORT}`);
        logger.info('All backend modules will be available on this single port.');
    });
}

startServer().catch(error => {
    logger.error('💥 Failed to start the server:', error);
    process.exit(1);
}); 