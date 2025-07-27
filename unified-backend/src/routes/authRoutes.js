// unified-backend/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getMainDb } = require('../database');
const logger = require('../utils/logger');
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-and-long-key-that-is-at-least-32-bytes';

// User registration
router.post('/register', async (req, res, next) => {
    const { fullName, email, password, companyName } = req.body;
    if (!fullName || !email || !password || !companyName) {
        return res.status(400).json({ message: 'Please provide full name, email, password, and company name.' });
    }

    let db;
    try {
        db = await getMainDb();
        const existingUser = await db.get('SELECT * FROM users WHERE email = ?', email);
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists.' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        
        await db.run('BEGIN');
        
        const accountResult = await db.run('INSERT INTO accounts (name) VALUES (?)', companyName);
        const accountId = accountResult.lastID;

        const userResult = await db.run(
            'INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)',
            fullName, email, passwordHash
        );
        const userId = userResult.lastID;

        await db.run(
            'INSERT INTO account_members (account_id, user_id, role) VALUES (?, ?, ?)',
            accountId, userId, 'owner'
        );
        
        await db.run('COMMIT');

        logger.info(`New user registered: ${email} for company: ${companyName}`);
        res.status(201).json({ message: 'User registered successfully as owner of new account.' });

    } catch (error) {
        if (db) await db.run('ROLLBACK');
        logger.error('Registration error:', error);
        next(error);
    }
});

// User login
router.post('/login', async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password.' });
    }

    try {
        const db = await getMainDb();
        const user = await db.get('SELECT * FROM users WHERE email = ?', email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const membership = await db.get('SELECT account_id, role FROM account_members WHERE user_id = ?', user.id);
        if (!membership) {
            return res.status(403).json({ message: 'User is not associated with any account.' });
        }

        const tokenPayload = {
            id: user.id,
            email: user.email,
            accountId: membership.account_id,
            role: membership.role
        };

        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

        logger.info(`User logged in successfully: ${email}`);
        res.json({ token, user: tokenPayload });

    } catch (error) {
        logger.error('Login error:', error);
        next(error);
    }
});

module.exports = router; 