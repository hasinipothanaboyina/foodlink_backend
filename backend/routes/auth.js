/**
 * Auth Routes
 * POST /api/auth/register
 * POST /api/auth/login
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/connection');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer storage for volunteer photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// ─── REGISTER ─────────────────────────────────────────────────────────────
router.post('/register', upload.single('photo'), async (req, res) => {
  const { name, email, password, role, vehicle_type, vehicle_number, city, age, gender } = req.body;
  const photo_url = req.file ? `/uploads/${req.file.filename}` : null;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role || 'donor']
    );

    // NOTE: NGO rows are created separately via POST /api/ngos/register
    // (see ngo-register.html step C), which captures the real name/city/
    // address/location/capacity/accepted_types and leaves the NGO pending
    // admin approval. Do NOT auto-insert an NGO row here — doing so used to
    // create a duplicate, auto-approved, (0,0)-located NGO alongside the
    // real one submitted moments later in the same signup flow.

    // If volunteer, add them to volunteers table
    if (role === 'volunteer') {
      await pool.query(
        'INSERT INTO volunteers (user_id, name, vehicle_type, vehicle_number, city, age, gender, photo_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          result.insertId, 
          name, 
          vehicle_type || 'None', 
          vehicle_number || 'N/A',
          city || 'Unknown',
          age ? parseInt(age, 10) : null,
          gender || 'Unknown',
          photo_url
        ]
      );
    }

    return res.status(201).json({
      message: 'Account created successfully. Please log in.',
      userId: result.insertId,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error during registration.' });
  }
});

// ─── LOGIN ────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error during login: ' + err.message });
  }
});

module.exports = router;