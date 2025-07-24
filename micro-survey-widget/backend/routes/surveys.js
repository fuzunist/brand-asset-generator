const express = require('express');
const router = express.Router();
const { nanoid } = require('nanoid');
const db = require('../db');

// Middleware to check authentication (simplified for MVP)
const authenticate = (req, res, next) => {
    // In production, implement proper JWT/session authentication
    const brandIdentityId = req.headers['x-brand-identity-id'];
    if (!brandIdentityId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    req.brandIdentityId = brandIdentityId;
    next();
};

router.use(authenticate);

// POST /api/surveys - Create new survey
router.post('/', async (req, res) => {
    try {
        const { question, type, options } = req.body;
        const brandIdentityId = req.brandIdentityId;

        // Validate input
        if (!question || !type) {
            return res.status(400).json({ error: 'Question and type are required' });
        }

        if (!['poll', 'rating'].includes(type)) {
            return res.status(400).json({ error: 'Invalid survey type' });
        }

        // Set default options based on type
        let surveyOptions = options;
        if (type === 'poll' && !options) {
            surveyOptions = { option1: 'Yes', option2: 'No' };
        } else if (type === 'rating' && !options) {
            surveyOptions = { 
                type: 'star', 
                max: 5,
                labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars']
            };
        }

        const surveyId = nanoid();
        
        const query = `
            INSERT INTO surveys (id, brand_identity_id, question, type, options)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        
        const result = await db.query(query, [
            surveyId,
            brandIdentityId,
            question,
            type,
            JSON.stringify(surveyOptions)
        ]);

        const survey = result.rows[0];
        
        // Generate embed code
        const embedCode = `<div id="brandos-survey-widget" data-survey-id="${surveyId}"></div>
<script src="${process.env.CDN_URL || 'https://cdn.brandos.com'}/widget.js" async defer></script>`;

        res.status(201).json({
            survey: {
                ...survey,
                options: surveyOptions
            },
            embedCode
        });
    } catch (error) {
        console.error('Error creating survey:', error);
        res.status(500).json({ error: 'Failed to create survey' });
    }
});

// GET /api/surveys - List all surveys for user
router.get('/', async (req, res) => {
    try {
        const brandIdentityId = req.brandIdentityId;
        
        const query = `
            SELECT s.*, 
                   COUNT(sr.id) as response_count
            FROM surveys s
            LEFT JOIN survey_responses sr ON s.id = sr.survey_id
            WHERE s.brand_identity_id = $1
            GROUP BY s.id
            ORDER BY s.created_at DESC
        `;
        
        const result = await db.query(query, [brandIdentityId]);
        
        res.json({
            surveys: result.rows.map(row => ({
                ...row,
                options: row.options
            }))
        });
    } catch (error) {
        console.error('Error fetching surveys:', error);
        res.status(500).json({ error: 'Failed to fetch surveys' });
    }
});

// GET /api/surveys/:id/results - Get survey results
router.get('/:id/results', async (req, res) => {
    try {
        const { id } = req.params;
        const brandIdentityId = req.brandIdentityId;
        
        // Verify ownership
        const ownershipQuery = `
            SELECT id FROM surveys 
            WHERE id = $1 AND brand_identity_id = $2
        `;
        const ownershipResult = await db.query(ownershipQuery, [id, brandIdentityId]);
        
        if (ownershipResult.rows.length === 0) {
            return res.status(404).json({ error: 'Survey not found' });
        }
        
        // Get aggregated results
        const resultsQuery = `
            SELECT 
                s.id,
                s.question,
                s.type,
                s.options,
                s.created_at,
                COUNT(DISTINCT sr.id) as total_responses,
                json_agg(
                    json_build_object(
                        'value', sr.response_value,
                        'count', sr.response_count
                    ) ORDER BY sr.response_value
                ) as response_distribution
            FROM surveys s
            LEFT JOIN (
                SELECT 
                    survey_id,
                    response_value,
                    COUNT(*) as response_count
                FROM survey_responses
                WHERE survey_id = $1
                GROUP BY survey_id, response_value
            ) sr ON s.id = sr.survey_id
            WHERE s.id = $1
            GROUP BY s.id, s.question, s.type, s.options, s.created_at
        `;
        
        const result = await db.query(resultsQuery, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Survey not found' });
        }
        
        const surveyResults = result.rows[0];
        
        // Format response for frontend
        const formattedResults = {
            surveyId: surveyResults.id,
            question: surveyResults.question,
            type: surveyResults.type,
            options: surveyResults.options,
            createdAt: surveyResults.created_at,
            totalResponses: parseInt(surveyResults.total_responses),
            results: {}
        };
        
        // Process distribution based on survey type
        if (surveyResults.response_distribution && surveyResults.response_distribution[0]) {
            surveyResults.response_distribution.forEach(item => {
                if (item.value) {
                    formattedResults.results[item.value] = item.count;
                }
            });
        }
        
        res.json(formattedResults);
    } catch (error) {
        console.error('Error fetching survey results:', error);
        res.status(500).json({ error: 'Failed to fetch survey results' });
    }
});

// PATCH /api/surveys/:id - Update survey status
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const brandIdentityId = req.brandIdentityId;
        
        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        
        const query = `
            UPDATE surveys 
            SET status = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2 AND brand_identity_id = $3
            RETURNING *
        `;
        
        const result = await db.query(query, [status, id, brandIdentityId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Survey not found' });
        }
        
        res.json({ survey: result.rows[0] });
    } catch (error) {
        console.error('Error updating survey:', error);
        res.status(500).json({ error: 'Failed to update survey' });
    }
});

module.exports = router;