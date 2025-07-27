const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

logger.info('Initializing Express application...');

const app = express();

// --- Core Middleware ---
app.use(helmet()); // Basic security headers
app.use(cors({
    origin: '*', // We'll configure this properly later
    credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// --- Logging Middleware ---
app.use(requestLogger);

// --- API Routes (to be added) ---
logger.info('Registering API routes...');

// --- Health Check ---
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Unified Backend is running smoothly!' 
    });
});
logger.info('✅ Route registered: GET /api/health');

// --- Calendar Module Routes ---
const calendarRoutes = require('./routes/calendarRoutes');
app.use('/api/calendar', calendarRoutes);
logger.info('✅ Module loaded: Calendar Routes at /api/calendar');

// --- Survey Module Routes ---
const surveyPublicRoutes = require('./routes/surveyPublicRoutes');
const surveyAdminRoutes = require('./routes/surveyAdminRoutes');
app.use('/api/surveys/public', surveyPublicRoutes);
logger.info('✅ Module loaded: Survey Public Routes at /api/surveys/public');
app.use('/api/surveys/admin', surveyAdminRoutes);
logger.info('✅ Module loaded: Survey Admin Routes at /api/surveys/admin');

// --- Smart Docs Module Routes ---
const smartDocRoutes = require('./routes/smartDocRoutes');
app.use('/api/smart-docs', smartDocRoutes);
logger.info('✅ Module loaded: Smart Docs Routes at /api/smart-docs');

// --- Main Server Module Routes ---
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
logger.info('✅ Module loaded: Auth Routes at /api/auth');

const teamRoutes = require('./routes/teamRoutes');
app.use('/api/team', teamRoutes);
logger.info('✅ Module loaded: Team Management Routes at /api/team');

// --- Generators and Tools Routes ---
const generatorsRoutes = require('./routes/generatorsRoutes');
app.use('/api/generators', generatorsRoutes);
logger.info('✅ Module loaded: Generators Routes at /api/generators');

const reportRoutes = require('./routes/reportRoutes');
app.use('/api/reports', reportRoutes);
logger.info('✅ Module loaded: Report Routes at /api/reports');

const aiToolsRoutes = require('./routes/aiToolsRoutes');
app.use('/api/ai-tools', aiToolsRoutes);
logger.info('✅ Module loaded: AI Tools Routes at /api/ai-tools');


// --- Error Handling ---
app.use(errorHandler);


module.exports = app; 