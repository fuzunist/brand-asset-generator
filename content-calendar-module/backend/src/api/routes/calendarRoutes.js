const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');
const { validate, calendarSchemas } = require('../../utils/validation');
const { eventReadLimiter, aiPromptLimiter } = require('../middlewares/rateLimiter');

// Health check
router.get('/health', calendarController.healthCheck);

// Get industries
router.get('/industries', calendarController.getIndustries);

// Get calendar events
router.get(
  '/events',
  eventReadLimiter,
  validate(calendarSchemas.getEvents),
  calendarController.getEvents
);

// Generate AI prompts
router.post(
  '/generate-prompt',
  aiPromptLimiter,
  validate(calendarSchemas.generatePrompt),
  calendarController.generatePrompt
);

module.exports = router;