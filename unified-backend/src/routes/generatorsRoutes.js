// unified-backend/src/routes/generatorsRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authMiddleware } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');
const { getMainDb } = require('../database');
const documentGeneratorService = require('../services/documentGeneratorLegacy');
// We will add other generators here as we migrate them

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const fs = require('fs');
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  }
});
const upload = multer({ storage: storage });


// --- Brand Book, Social Media Kit, etc. ---
// This is a placeholder for the brand book generation which is a complex endpoint.
// We will migrate it completely in a later step.
router.post('/brand-book', authMiddleware, upload.single('logo'), (req, res) => {
    logger.info('Received request for brand book generation (pending migration)');
    res.status(501).json({ message: 'This endpoint is pending migration.'});
});


// --- Smart Document Generation (from original server) ---
// Note: This conflicts with smart-docs-generator, so it's prefixed legacy.
router.post('/documents/proposal', authMiddleware, async (req, res, next) => {
    try {
        logger.info('Generating legacy proposal with data:', req.body);
        const buffer = await documentGeneratorService.generateProposal(req.body);
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': 'attachment; filename=proposal.docx'
        });
        res.send(buffer);
    } catch (error) {
        logger.error('Error generating legacy proposal:', error);
        next(error);
    }
});

router.post('/documents/contract', authMiddleware, async (req, res, next) => {
    try {
        logger.info('Generating legacy contract with data:', req.body);
        const buffer = await documentGeneratorService.generateContract(req.body);
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': 'attachment; filename=contract.docx'
        });
        res.send(buffer);
    } catch (error) {
        logger.error('Error generating legacy contract:', error);
        next(error);
    }
});


module.exports = router; 