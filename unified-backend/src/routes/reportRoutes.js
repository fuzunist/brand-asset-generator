// unified-backend/src/routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');
const { getMainDb } = require('../database');
const { generateWebsiteReport } = require('../services/websiteReportGenerator');

// --- Website Audit Report Generator Endpoint ---
router.post('/website-audit', authMiddleware, async (req, res, next) => {
    const { url } = req.body;
    const { accountId } = req.user;

    if (!url) {
        return res.status(400).json({ message: 'Website URL is required.' });
    }

    try {
        new URL(url); // Validate URL format
    } catch (urlError) {
        return res.status(400).json({ message: 'Please provide a valid URL format.' });
    }

    try {
        logger.info(`Starting website audit for ${url} (Account: ${accountId})`);
        const db = await getMainDb();
        const pdfBuffer = await generateWebsiteReport(url, accountId, db);
        
        const domainName = new URL(url).hostname.replace(/[^a-z0-9]/gi, '_');
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `Website_Audit_${domainName}_${timestamp}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        
        logger.info(`Successfully generated and sent website audit report for ${url}`);
        res.send(pdfBuffer);

    } catch (error) {
        logger.error(`Error generating website report for ${url}:`, error);
        next(error);
    }
});

module.exports = router; 