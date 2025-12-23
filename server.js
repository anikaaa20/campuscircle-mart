const express = require('express');
const session = require('express-session');
const path = require('path');
const authRoutes = require('./routes/auth');
const listingRoutes = require('./routes/listings');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: 'campuscircle2025',
  resave: false,
  saveUninitialized: false
}));

app.use('/', authRoutes);
app.use('/', listingRoutes);

app.get('/', async (req, res) => {
  try {
    const db = require('./config/db');
    const q = req.query.q || '';
    const category = req.query.category || '';

    let sql = `
      SELECT l.*, u.name AS seller_name 
      FROM listings l 
      JOIN users u ON l.user_id = u.id 
      WHERE l.status = 'active'
    `;
    const params = [];

    if (q) {
      sql += ' AND (l.title LIKE ? OR l.category LIKE ? OR l.description LIKE ?)';
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    if (category && category !== 'All') {
      sql += ' AND l.category = ?';
      params.push(category);
    }

    sql += ' ORDER BY l.created_at DESC';

    const [listings] = await db.execute(sql, params);
    res.render('index', { user: req.session.user, listings, q, category });
  } catch (err) {
    res.status(500).send('Database error: ' + err.message);
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Server running: http://localhost:${PORT}`);
});
