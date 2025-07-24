const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../db');

// Helper function to hash IP addresses
const hashIP = (ip) => {
    return crypto.createHash('sha256').update(ip + process.env.IP_SALT || 'default-salt').digest('hex');
};

// GET /api/public/surveys/:id - Get survey data for widget
router.get('/surveys/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = `
            SELECT id, question, type, options, status
            FROM surveys
            WHERE id = $1 AND status = 'active'
        `;
        
        const result = await db.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Survey not found or inactive' });
        }
        
        const survey = result.rows[0];
        
        // Check if user has already voted (using IP hash)
        const userIp = req.ip || req.connection.remoteAddress;
        const ipHash = hashIP(userIp);
        
        const voteCheckQuery = `
            SELECT id FROM survey_responses
            WHERE survey_id = $1 AND ip_address_hash = $2
            AND created_at > NOW() - INTERVAL '24 hours'
        `;
        
        const voteCheckResult = await db.query(voteCheckQuery, [id, ipHash]);
        const hasVoted = voteCheckResult.rows.length > 0;
        
        res.json({
            id: survey.id,
            question: survey.question,
            type: survey.type,
            options: survey.options,
            hasVoted
        });
    } catch (error) {
        console.error('Error fetching public survey:', error);
        res.status(500).json({ error: 'Failed to fetch survey' });
    }
});

// POST /api/public/surveys/:id/vote - Submit a vote
router.post('/surveys/:id/vote', async (req, res) => {
    try {
        const { id } = req.params;
        const { response } = req.body;
        
        if (!response) {
            return res.status(400).json({ error: 'Response is required' });
        }
        
        // Verify survey exists and is active
        const surveyQuery = `
            SELECT id, type, options, status
            FROM surveys
            WHERE id = $1 AND status = 'active'
        `;
        
        const surveyResult = await db.query(surveyQuery, [id]);
        
        if (surveyResult.rows.length === 0) {
            return res.status(404).json({ error: 'Survey not found or inactive' });
        }
        
        const survey = surveyResult.rows[0];
        
        // Validate response based on survey type
        if (survey.type === 'poll') {
            if (!['option1', 'option2'].includes(response)) {
                return res.status(400).json({ error: 'Invalid response option' });
            }
        } else if (survey.type === 'rating') {
            const rating = parseInt(response);
            if (isNaN(rating) || rating < 1 || rating > 5) {
                return res.status(400).json({ error: 'Invalid rating value' });
            }
        }
        
        // Check for duplicate votes from same IP within 24 hours
        const userIp = req.ip || req.connection.remoteAddress;
        const ipHash = hashIP(userIp);
        
        const duplicateCheckQuery = `
            SELECT id FROM survey_responses
            WHERE survey_id = $1 AND ip_address_hash = $2
            AND created_at > NOW() - INTERVAL '24 hours'
        `;
        
        const duplicateResult = await db.query(duplicateCheckQuery, [id, ipHash]);
        
        if (duplicateResult.rows.length > 0) {
            return res.status(429).json({ error: 'You have already voted on this survey' });
        }
        
        // Record the vote
        const userAgent = req.headers['user-agent'] || 'Unknown';
        
        const insertQuery = `
            INSERT INTO survey_responses (survey_id, response_value, ip_address_hash, user_agent)
            VALUES ($1, $2, $3, $4)
            RETURNING id
        `;
        
        await db.query(insertQuery, [id, response, ipHash, userAgent]);
        
        res.json({ 
            success: true, 
            message: 'Thank you for your feedback!' 
        });
    } catch (error) {
        console.error('Error recording vote:', error);
        res.status(500).json({ error: 'Failed to record vote' });
    }
});

// GET /api/public/surveys/:id/results - Get public results (optional, for showing results after voting)
router.get('/surveys/:id/results', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if survey allows public results
        const surveyQuery = `
            SELECT type, options
            FROM surveys
            WHERE id = $1 AND status = 'active'
        `;
        
        const surveyResult = await db.query(surveyQuery, [id]);
        
        if (surveyResult.rows.length === 0) {
            return res.status(404).json({ error: 'Survey not found' });
        }
        
        const survey = surveyResult.rows[0];
        
        // Get aggregated results
        const resultsQuery = `
            SELECT 
                response_value,
                COUNT(*) as count
            FROM survey_responses
            WHERE survey_id = $1
            GROUP BY response_value
            ORDER BY response_value
        `;
        
        const resultsResult = await db.query(resultsQuery, [id]);
        
        const results = {};
        let totalVotes = 0;
        
        resultsResult.rows.forEach(row => {
            results[row.response_value] = parseInt(row.count);
            totalVotes += parseInt(row.count);
        });
        
        // Calculate percentages
        const percentages = {};
        Object.keys(results).forEach(key => {
            percentages[key] = totalVotes > 0 ? Math.round((results[key] / totalVotes) * 100) : 0;
        });
        
        res.json({
            surveyId: id,
            type: survey.type,
            totalVotes,
            results,
            percentages
        });
    } catch (error) {
        console.error('Error fetching public results:', error);
        res.status(500).json({ error: 'Failed to fetch results' });
    }
});

module.exports = router;