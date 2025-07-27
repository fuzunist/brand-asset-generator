// This file will hold all centralized configurations,
// for example, database credentials, API keys, etc.
// We will populate this in the next steps.

require('dotenv').config();

const config = {
    server: {
        port: process.env.PORT || 3001,
    },
    // We will add database configs here
    // e.g., sqlite: { ... }, postgres: { ... }
};

module.exports = config; 