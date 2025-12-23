const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const router = express.Router();

router.get('/register', (req, res) => res.render('register', { error: null }));
router.get('/login', (req, res) => res.render('login'));

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, course, year } = req.body;
    const hash = await bcrypt.hash(password, 10);
    await db.execute(
      'INSERT INTO users (name, email, password_hash, course, year) VALUES (?, ?, ?, ?, ?)',
      [name, email, hash, course, year]
    );
    res.redirect('/login');
  } catch (err) {
    res.render('register', { error: 'Email already exists!' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length && await bcrypt.compare(password, rows[0].password_hash)) {
      req.session.user = { id: rows[0].id, name: rows[0].name };
      res.redirect('/');
    } else {
      res.render('login', { error: 'Wrong email/password!' });
    }
  } catch (err) {
    res.status(500).send('Server error');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

module.exports = router;
