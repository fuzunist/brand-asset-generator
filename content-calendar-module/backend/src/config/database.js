const knex = require('knex');
const path = require('path');

const dbPath = process.env.DATABASE_URL || path.join(__dirname, '../../database.sqlite');

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: dbPath
  },
  useNullAsDefault: true,
  pool: {
    min: 1,
    max: 10,
    afterCreate: (conn, cb) => {
      conn.run('PRAGMA foreign_keys = ON', cb);
    }
  }
});

module.exports = db;