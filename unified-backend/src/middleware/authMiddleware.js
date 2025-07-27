// unified-backend/src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-and-long-key-that-is-at-least-32-bytes';

const authMiddleware = (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith('Bearer ')) {
        logger.warn('Authentication failed: Missing or invalid authorization header', { ip: req.ip });
        return res.status(401).json({ message: 'Missing or invalid authorization header' });
    }

    const token = authorization.split(' ')[1];
    
    // This allows for a developer-only bypass token
    if (token === 'dev-token' && process.env.NODE_ENV === 'development') {
        req.user = {
            id: 1,
            email: 'dev@example.com',
            accountId: 1,
            role: 'owner'
        };
        logger.info('Developer token used for authentication', { user: req.user });
        return next();
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Adds user payload (e.g., id, email, account_id, role) to the request
        next();
    } catch (error) {
        logger.error('Authentication failed: Invalid or expired token', { token, error: error.message });
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

const rbacMiddleware = (roles) => (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
        logger.warn(`Forbidden access attempt by user ${req.user?.id} to a resource requiring roles: ${roles.join(', ')}`, { userRole: req.user?.role });
        return res.status(403).json({ message: 'Forbidden: You do not have the required role' });
    }
    next();
};

module.exports = {
    authMiddleware,
    rbacMiddleware
}; 