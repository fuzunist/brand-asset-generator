const knex = require('knex');
const { Pool } = require('pg');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const logger = require('../utils/logger');
require('dotenv').config({ path: '../../.env' }); // Load .env from project root

logger.info('Initializing database module...');

// --- PostgreSQL Connection (for Micro-Survey Widget) ---
let pgPool;
try {
    pgPool = new Pool({
        user: process.env.DB_POSTGRES_USER,
        host: process.env.DB_POSTGRES_HOST,
        database: process.env.DB_POSTGRES_DATABASE,
        password: process.env.DB_POSTGRES_PASSWORD,
        port: parseInt(process.env.DB_POSTGRES_PORT || '5432', 10),
    });
    logger.info('✅ PostgreSQL connection pool created successfully.');
} catch (error) {
    logger.error('💥 Failed to create PostgreSQL connection pool:', error);
}


// --- Main SQLite Connection (using sqlite driver directly) ---
let mainDb;
async function setupMainSqlite() {
    try {
        const dbPath = process.env.DB_SQLITE_PATH || './database/brandos.db';
        mainDb = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });
        logger.info(`✅ Main SQLite database connected at ${dbPath}`);
        return mainDb;
    } catch (error) {
        logger.error('💥 Failed to connect to main SQLite database:', error);
        throw error; // Propagate error to stop server start if critical
    }
}


// --- Knex for SQLite (for Content Calendar) ---
let knexSqlite;
try {
    const dbPath = process.env.DB_CALENDAR_SQLITE_PATH || './database/content_calendar.db';
    knexSqlite = knex({
        client: 'sqlite3',
        connection: {
            filename: dbPath,
        },
        useNullAsDefault: true,
    });
    logger.info(`✅ Knex SQLite connection configured for ${dbPath}`);
} catch (error) {
    logger.error('💥 Failed to configure Knex for SQLite:', error);
}


module.exports = {
    pg: pgPool,
    getMainDb: async () => {
        if (!mainDb) {
            mainDb = await setupMainSqlite();
        }
        return mainDb;
    },
    knex: knexSqlite,
}; 