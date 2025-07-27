const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
    // Log the error with stack trace
    logger.error(`💥 Unhandled Error: ${err.message}`, {
        error: err,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method
    });

    // Don't leak stack traces to the client in production
    const errorResponse = {
        message: err.message || 'An unexpected error occurred.',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    };

    res.status(err.status || 500).json(errorResponse);
}

module.exports = errorHandler; 