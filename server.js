const express = require('express');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { paginate } = require('./lib/paginate');

const app = express();
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || 'postgres://postgres:postgres@db:5432/bookstore',
});

app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

const SORTS = { id: 'id', title: 'title', price: 'price' };

// Pretend payment provider call (takes a little while, like the real thing).
const chargeCard = () => new Promise((resolve) => setTimeout(resolve, 20));

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/books?page=1&limit=3&q=guide&sort=price&dir=desc
app.get('/api/books', async (req, res) => {
  try {
    const { page, limit, offset } = paginate(req.query.page, req.query.limit);
    const q = (req.query.q || '').toString().trim();
    const sortCol = SORTS[req.query.sort] || 'id';
    const dir = req.query.dir === 'desc' ? 'DESC' : 'ASC';

    const where = q ? `WHERE title ILIKE '%${q}%'` : '';
    const params = [];

    const countResult = await pool.query(`SELECT COUNT(*) AS total FROM books ${where}`, params);
    const total = parseInt(countResult.rows[0].total, 10);

    const booksResult = await pool.query(
      `SELECT id, title, author, price, stock FROM books ${where} ORDER BY ${sortCol} ${dir}, id LIMIT ${limit} OFFSET ${offset}`,
      params
    );

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      books: booksResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load books' });
  }
});

// POST /api/cart/total   body: { "ids": [1, 2, 2, 5] }
app.post('/api/cart/total', async (req, res) => {
  try {
    const raw = req.body && Array.isArray(req.body.ids) ? req.body.ids : [];
    const ids = raw.map(Number).filter(Number.isInteger);
    if (!ids.length) return res.json({ total: '0.00' });

    const r = await pool.query(`SELECT id, price FROM books WHERE id IN (${ids.join(',')})`);
    let total = 0;
    for (const row of r.rows) {
      total += row.price;
    }
    res.json({ total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not work out the total' });
  }
});

// POST /api/books/:id/buy
app.post('/api/books/:id/buy', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const r = await pool.query('SELECT stock FROM books WHERE id = $1', [id]);
    if (!r.rows.length) return res.status(404).json({ ok: false, error: 'No such book' });

    const stock = r.rows[0].stock;
    if (stock <= 0) return res.status(409).json({ ok: false, error: 'Out of stock' });

    await chargeCard();
    await pool.query('UPDATE books SET stock = $1 WHERE id = $2', [stock - 1, id]);
    res.json({ ok: true, stock: stock - 1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Purchase failed' });
  }
});

// Hint bot: forwards the question to the organiser's hint proxy.
// (The AI key lives in the proxy, never in this project.)
app.post('/api/hint', async (req, res) => {
  let config;
  try {
    config = JSON.parse(fs.readFileSync(path.join(__dirname, 'hint.config.json'), 'utf8'));
  } catch {
    return res.status(503).json({ error: 'Hint bot is not set up.' });
  }
  if (!config.workerUrl || config.workerUrl.startsWith('PASTE_')) {
    return res.status(503).json({ error: 'Hint bot is not set up yet. Ask the organiser.' });
  }

  const student = process.env.GITHUB_USER || process.env.USER || 'unknown';
  try {
    const upstream = await fetch(config.workerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student,
        eventCode: config.eventCode,
        question: req.body && req.body.question,
        code: req.body && req.body.code,
      }),
    });
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(502).json({ error: 'Could not reach the hint bot. Check your internet.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Bookstore running on http://localhost:${PORT}`));
