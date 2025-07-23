const db = require('../../config/database');
const path = require('path');

async function runMigrations() {
  try {
    console.log('Running database migrations...');
    
    await db.migrate.latest({
      directory: __dirname
    });
    
    console.log('Migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();