const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../bookshelf.db'));

// Enable foreign keys and WAL mode for better performance
db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON');
  db.run('PRAGMA journal_mode = WAL');

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    avatar TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    google_books_id TEXT,
    title TEXT NOT NULL,
    author TEXT,
    description TEXT,
    cover_url TEXT,
    custom_cover TEXT,
    page_count INTEGER,
    published_year TEXT,
    genre TEXT,
    status TEXT NOT NULL DEFAULT 'want_to_read',
    rating INTEGER,
    notes TEXT,
    date_added DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_finished DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);
});

// Helper: run a query that modifies data (INSERT, UPDATE, DELETE)
db.run2 = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function(err) {
    if (err) return reject(err);
    resolve({ lastInsertRowid: this.lastID, changes: this.changes });
  });
});

// Helper: get a single row
db.get2 = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => {
    if (err) return reject(err);
    resolve(row);
  });
});

// Helper: get all rows
db.all2 = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) return reject(err);
    resolve(rows);
  });
});

module.exports = db;
