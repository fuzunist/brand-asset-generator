const logger = require('../utils/logger');

function requestLogger(req, res, next) {
    // Log the incoming request
    logger.http(`➡️  ${req.method} ${req.originalUrl}`, {
        ip: req.ip,
        headers: req.headers,
        body: req.body // Be careful logging bodies in production, might contain sensitive info
    });

    // Log the response when it's finished
    res.on('finish', () => {
        const level = res.statusCode >= 400 ? 'warn' : 'http';
        logger[level](`⬅️  ${req.method} ${req.originalUrl} - ${res.statusCode} ${res.statusMessage}`);
    });

    next();
}

module.exports = requestLogger; 