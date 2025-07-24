const express = require('express');
const router = express.Router();
const { generateDocument } = require('../controllers/documentController');
const { validateDocumentRequest } = require('../middleware/validation');

// POST /api/documents/generate
router.post('/generate', validateDocumentRequest, generateDocument);

// GET /api/documents/templates - List available templates
router.get('/templates', (req, res) => {
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