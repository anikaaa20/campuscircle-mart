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

    // Text typed in search box: /?q=iphone
    const q = req.query.q || '';

    // Base query: get active listings + seller name
    let sql = `
      SELECT l.*, u.name AS seller_name 
      FROM listings l 
      JOIN users u ON l.user_id = u.id 
      WHERE l.status = 'active'
    `;
    const params = [];

    // If user typed something, add WHERE conditions
    if (q) {
      sql += ` AND (l.title LIKE ? OR l.category LIKE ? OR l.description LIKE ?)`;
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    sql += ` ORDER BY l.created_at DESC`;

    const [listings] = await db.execute(sql, params);

    // Pass q to the view so input can show current search text
    res.render('index', { user: req.session.user, listings, q });
  } catch (err) {
    res.status(500).send('Database error: ' + err.message);
  }
});



app.listen(PORT, () => {
  console.log(`🚀 Server running: http://localhost:${PORT}`);
});
