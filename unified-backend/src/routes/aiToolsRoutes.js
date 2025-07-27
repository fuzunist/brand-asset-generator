// unified-backend/src/routes/aiToolsRoutes.js
const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const { authMiddleware } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');
const { getMainDb } = require('../database');
const AdKitGenerator = require('../services/adKitGenerator');
const ThoughtLeadershipService = require('../services/thoughtLeadershipService');

// OpenAI Configuration
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// --- Ad Kit Generation Endpoint ---
router.post('/ad-kit', authMiddleware, async (req, res, next) => {
    try {
        const { dynamicText, brand_identity_id } = req.body;
        
        if (!dynamicText || !dynamicText.headline) {
            return res.status(400).json({ message: 'Headline is required for ad kit generation.' });
        }

        const brandIdentity = {
            name: 'Brand OS',
            logoUrl: `${req.protocol}://${req.get('host')}/example_logo.png`,
            primaryColor: '#4F46E5',
            secondaryColor: '#EC4899',
            fontFamily: 'Inter'
        };

        const adKitGenerator = new AdKitGenerator();
        const hasApiCredentials = process.env.BANNERBEAR_API_KEY && process.env.BANNERBEAR_TEMPLATE_SQUARE;
        
        const zipBuffer = hasApiCredentials
            ? await adKitGenerator.generateAdKit(dynamicText, brandIdentity)
            : await adKitGenerator.generateMockAdKit(dynamicText, brandIdentity);

        res.set({
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="Ad_Kit.zip"`,
        });
        res.send(zipBuffer);

    } catch (error) {
        logger.error('Error generating ad kit:', error);
        next(error);
    }
});

// --- Email Template Generator (Placeholder) ---
// This is a complex endpoint and will be fully migrated in a subsequent step.
router.post('/email-templates', authMiddleware, (req, res) => {
    logger.info('Received request for email template generation (pending migration)');
    res.status(501).json({ message: 'This endpoint is pending migration.'});
});

// --- Thought Leadership Routes ---
router.get('/thought-leadership/settings', authMiddleware, async (req, res, next) => {
    // ... (logic from server/index.js to be pasted and adapted here)
    res.status(501).json({ message: 'This endpoint is pending migration.'});
});

// ... other thought leadership routes will be added here

module.exports = router; 