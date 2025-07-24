const validateDocumentRequest = (req, res, next) => {
  const { templateType, formData } = req.body;

  // Check if template type is provided
  if (!templateType) {
    return res.status(400).json({
      error: {
        message: 'Template type is required',
        field: 'templateType'
      }
    });
  }

  // Check if template type is valid
  const validTemplates = ['proposal', 'contract'];
  if (!validTemplates.includes(templateType)) {
    return res.status(400).json({
      error: {
        message: 'Invalid template type. Must be one of: ' + validTemplates.join(', '),
        field: 'templateType'
      }
    });
  }

  // Check if form data is provided
  if (!formData || typeof formData !== 'object') {
    return res.status(400).json({
      error: {
        message: 'Form data is required and must be an object',
        field: 'formData'
      }
    });
  }

  // Validate required fields based on template type
  const requiredFields = {
    proposal: ['clientName', 'projectName', 'projectScope', 'totalPrice', 'date'],
    contract: ['clientName', 'projectName', 'projectScope', 'totalPrice', 'date', 'startDate', 'endDate']
  };

  const missingFields = [];
  const templateRequiredFields = requiredFields[templateType];

  templateRequiredFields.forEach(field => {
    if (!formData[field] || (typeof formData[field] === 'string' && formData[field].trim() === '')) {
      missingFields.push(field);
    }
  });

  if (missingFields.length > 0) {
    return res.status(400).json({
      error: {
        message: 'Missing required fields',
        missingFields: missingFields
      }
    });
  }

  // Validate totalPrice is a number
  if (formData.totalPrice && isNaN(parseFloat(formData.totalPrice))) {
    return res.status(400).json({
      error: {
        message: 'Total price must be a valid number',
        field: 'totalPrice'
      }
    });
  }

  // All validations passed
  next();
};

module.exports = {
  validateDocumentRequest
};