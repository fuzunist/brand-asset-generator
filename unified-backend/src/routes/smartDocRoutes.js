// unified-backend/src/routes/smartDocRoutes.js
const express = require('express');
const router = express.Router();
const { generateDocument } = require('./controllers/documentController');
const { validateDocumentRequest } = require('../middleware/smartDocsValidation');
const logger = require('../utils/logger');

// POST /generate - The main endpoint to generate a document
router.post('/generate', validateDocumentRequest, generateDocument);

// GET /templates - List available document templates
router.get('/templates', (req, res) => {
  logger.info('Fetching list of available document templates');
  res.json({
    templates: [
      {
        id: 'proposal',
        name: 'Satış Teklifi',
        description: 'Profesyonel satış teklifi şablonu',
        requiredFields: ['clientName', 'projectName', 'projectScope', 'totalPrice', 'date']
      },
      {
        id: 'contract',
        name: 'Basit Hizmet Sözleşmesi',
        description: 'Temel hizmet sözleşmesi şablonu',
        requiredFields: ['clientName', 'projectName', 'projectScope', 'totalPrice', 'date', 'startDate', 'endDate']
      }
    ]
  });
});

module.exports = router; 