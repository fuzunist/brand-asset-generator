const Joi = require('joi');

// Calendar events validation schemas
const calendarSchemas = {
  getEvents: Joi.object({
    month: Joi.number().integer().min(1).max(12).required(),
    year: Joi.number().integer().min(2024).max(2050).required(),
    industry: Joi.string().optional(),
    countryCode: Joi.string().length(2).uppercase().optional()
  }),
  
  generatePrompt: Joi.object({
    eventName: Joi.string().min(3).max(100).required(),
    userIndustry: Joi.string().min(3).max(50).required(),
    eventDescription: Joi.string().max(500).optional()
  })
};

// Industry options
const validIndustries = [
  'technology',
  'fashion',
  'food-beverage',
  'retail',
  'health-wellness',
  'education',
  'entertainment',
  'nonprofit',
  'travel-hospitality'
];

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const dataToValidate = req.method === 'GET' ? req.query : req.body;
    const { error, value } = schema.validate(dataToValidate);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    
    // Replace request data with validated data
    if (req.method === 'GET') {
      req.query = value;
    } else {
      req.body = value;
    }
    
    next();
  };
};

module.exports = {
  calendarSchemas,
  validIndustries,
  validate
};