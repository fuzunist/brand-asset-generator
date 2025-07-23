const rateLimit = require('express-rate-limit');
const logger = require('../../utils/logger');

// Create different rate limiters for different endpoints
const createRateLimiter = (options) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes default
    max: options.max || 100, // limit each IP to 100 requests per windowMs
    message: options.message || 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        success: false,
        error: options.message || 'Too many requests, please try again later.'
      });
    }
  });
};

// General API rate limiter
const apiLimiter = createRateLimiter({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many API requests, please try again later.'
});

// Stricter rate limiter for AI prompt generation
const aiPromptLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 AI requests per windowMs
  message: 'Too many AI prompt requests, please try again later.'
});

// Very lenient rate limiter for reading events
const eventReadLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // allow more reads
  message: 'Too many event read requests, please try again later.'
});

module.exports = {
  apiLimiter,
  aiPromptLimiter,
  eventReadLimiter
};