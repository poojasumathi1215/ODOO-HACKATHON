const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'dayflow.db');
const absoluteDbPath = path.isAbsolute(dbPath) ? dbPath : path.resolve(process.cwd(), dbPath);

// Ensure directory exists
const dbDir = path.dirname(absoluteDbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Open SQLite connection
const db = new Database(absoluteDbPath);

// Enable Foreign Keys and WAL mode for high performance and durability
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

/**
 * Initializes the database schema and triggers seeding if empty
 */
function initDatabase() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  
  db.exec(schemaSql);

  // Check if users table is empty to trigger automatic seeding
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    const { seedData } = require('./seed');
    seedData(db);
  }
}

module.exports = {
  db,
  initDatabase
};
