const express = require('express');
const router = express.Router();
const axios = require('axios');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Parser } = require('json2csv');
const db = require('../models/db');
const auth = require('../middleware/auth');

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype))
      return cb(null, true);
    cb(new Error('Only image files allowed.'));
  }
});

// GET /api/books/search
router.get('/search', auth, async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Query is required.' });
  try {
    const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
      params: { q, maxResults: 20, printType: 'books', key: process.env.GOOGLE_BOOKS_API_KEY },
      timeout: 8000
    });
    const books = (response.data.items || []).map(item => {
      const info = item.volumeInfo;
      return {
        google_books_id: item.id,
        title: info.title || 'Unknown Title',
        author: (info.authors || []).join(', ') || 'Unknown Author',
        description: info.description || '',
        cover_url: info.imageLinks?.thumbnail?.replace('http://', 'https://') || null,
        page_count: info.pageCount || null,
        published_year: info.publishedDate?.substring(0, 4) || null,
        genre: (info.categories || []).join(', ') || null,
      };
    });
    res.json({ books });
  } catch (err) {
    console.error('Google Books API error:', err.message);
    res.status(500).json({ error: 'Failed to fetch from Google Books API.' });
  }
});

// GET /api/books/stats
router.get('/stats', auth, async (req, res) => {
  try {
    const uid = req.user.id;
    const [total, reading, finished, want, pages, avgRating] = await Promise.all([
      db.get2('SELECT COUNT(*) as count FROM books WHERE user_id = ?', [uid]),
      db.get2("SELECT COUNT(*) as count FROM books WHERE user_id = ? AND status = 'reading'", [uid]),
      db.get2("SELECT COUNT(*) as count FROM books WHERE user_id = ? AND status = 'finished'", [uid]),
      db.get2("SELECT COUNT(*) as count FROM books WHERE user_id = ? AND status = 'want_to_read'", [uid]),
      db.get2("SELECT SUM(page_count) as total FROM books WHERE user_id = ? AND status = 'finished'", [uid]),
      db.get2('SELECT AVG(rating) as avg FROM books WHERE user_id = ? AND rating IS NOT NULL', [uid]),
    ]);
    res.json({
      total: total.count,
      reading: reading.count,
      finished: finished.count,
      want_to_read: want.count,
      total_pages: pages.total || 0,
      avg_rating: avgRating.avg ? parseFloat(avgRating.avg.toFixed(1)) : null
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/books/export
router.get('/export', auth, async (req, res) => {
  try {
    const books = await db.all2(
      'SELECT title, author, status, rating, notes, page_count, published_year, genre, date_added, date_finished FROM books WHERE user_id = ? ORDER BY date_added DESC',
      [req.user.id]
    );
    if (books.length === 0) return res.status(404).json({ error: 'No books to export.' });
    const fields = ['title','author','status','rating','notes','page_count','published_year','genre','date_added','date_finished'];
    const csv = new Parser({ fields }).parse(books);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="my-bookshelf.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: 'Export failed.' });
  }
});

// GET /api/books
router.get('/', auth, async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM books WHERE user_id = ?';
    const params = [req.user.id];
    if (status) { query += ' AND status = ?'; params.push(status); }
    query += ' ORDER BY date_added DESC';
    const books = await db.all2(query, params);
    res.json({ books });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/books
router.post('/', auth, async (req, res) => {
  const { google_books_id, title, author, description, cover_url, page_count, published_year, genre, status } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required.' });
  try {
    if (google_books_id) {
      const existing = await db.get2('SELECT id FROM books WHERE user_id = ? AND google_books_id = ?', [req.user.id, google_books_id]);
      if (existing) return res.status(409).json({ error: 'This book is already on your shelf.' });
    }
    const result = await db.run2(
      `INSERT INTO books (user_id, google_books_id, title, author, description, cover_url, page_count, published_year, genre, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, google_books_id || null, title, author || null, description || null, cover_url || null, page_count || null, published_year || null, genre || null, status || 'want_to_read']
    );
    const book = await db.get2('SELECT * FROM books WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json({ book });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/books/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const book = await db.get2('SELECT * FROM books WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!book) return res.status(404).json({ error: 'Book not found.' });
    const { status, rating, notes, page_count } = req.body;
    const finished = (status === 'finished') ? new Date().toISOString() : null;
    await db.run2(
  `UPDATE books SET status = COALESCE(?, status), rating = ?, notes = ?, date_finished = ?, page_count = COALESCE(?, page_count) WHERE id = ? AND user_id = ?`,
  [status || book.status, rating ?? book.rating, notes ?? book.notes, finished, page_count ?? null, req.params.id, req.user.id]
);
    const updated = await db.get2('SELECT * FROM books WHERE id = ?', [req.params.id]);
    res.json({ book: updated });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/books/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const book = await db.get2('SELECT * FROM books WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!book) return res.status(404).json({ error: 'Book not found.' });
    if (book.custom_cover) {
      const filePath = path.join(__dirname, '../uploads', path.basename(book.custom_cover));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await db.run2('DELETE FROM books WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Book removed.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/books/:id/cover
router.post('/:id/cover', auth, upload.single('cover'), async (req, res) => {
  try {
    const book = await db.get2('SELECT * FROM books WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!book) return res.status(404).json({ error: 'Book not found.' });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
    if (book.custom_cover) {
      const oldPath = path.join(__dirname, '../uploads', path.basename(book.custom_cover));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    const coverUrl = `/uploads/${req.file.filename}`;
    await db.run2('UPDATE books SET custom_cover = ? WHERE id = ?', [coverUrl, req.params.id]);
    const updated = await db.get2('SELECT * FROM books WHERE id = ?', [req.params.id]);
    res.json({ book: updated });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
