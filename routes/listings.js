const express = require('express');
const multer = require('multer');
const db = require('../config/db');
const router = express.Router();

const upload = multer({ dest: 'public/uploads/' });

const requireAuth = (req, res, next) => {
  if (!req.session.user) return res.redirect('/login');
  next();
};

router.get('/listings/new', requireAuth, (req, res) => res.render('listing_form'));

router.post('/listings', requireAuth, upload.single('image'), async (req, res) => {
  const { title, description, price, category, condition } = req.body;
  const images = req.file ? [req.file.filename] : [];
  await db.execute(
    'INSERT INTO listings (user_id, title, description, price, category, item_condition, images) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [req.session.user.id, title, description, price, category, condition, JSON.stringify(images)]
  );
  res.redirect('/');
});

router.get('/listings/:id', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT l.*, u.name AS seller_name FROM listings l JOIN users u ON l.user_id = u.id WHERE l.id = ?',
      [req.params.id]
    );
    res.render('listing_detail', { listing: rows[0], user: req.session.user });
  } catch (err) {
    res.status(404).send('Listing not found');
  }
});

module.exports = router;
