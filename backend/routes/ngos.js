/**
 * NGO Routes
 * POST  /api/ngos/register      -> register NGO (pending approval)
 * GET   /api/ngos               -> list all approved NGOs (with optional distance sort)
 * PATCH /api/ngos/:id/approve   -> approve an NGO (admin only)
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../db/connection');
const authMiddleware = require('../middleware/auth');
const { adminOnly } = require('../middleware/auth');

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── REGISTER NGO ────────────────────────────────────────────────────────────
router.post('/register', authMiddleware, upload.single('document'), async (req, res) => {
  const { name, city, address, latitude, longitude, capacity, accepted_types, phone } = req.body;
  const document_url = req.file ? `/uploads/${req.file.filename}` : null;

  if (!name || latitude == null || longitude == null) {
    return res.status(400).json({ message: 'NGO name and location are required.' });
  }

  try {
    // Check if this user already registered an NGO
    const [existing] = await pool.query(
      'SELECT id FROM ngos WHERE user_id = ?', [req.user.id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'You have already submitted an NGO application.' });
    }

    const [result] = await pool.query(
      `INSERT INTO ngos
        (user_id, name, city, address, latitude, longitude, capacity, accepted_types, phone, document_url, approved)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        req.user.id,
        name,
        city || 'Unknown',
        address || '',
        latitude,
        longitude,
        capacity || 100,
        accepted_types || 'cooked,produce,packaged,bakery',
        phone || null,
        document_url,
      ]
    );

    return res.status(201).json({
      message: 'NGO registration submitted. Awaiting admin approval.',
      ngoId: result.insertId,
    });
  } catch (err) {
    console.error(err);
    // TEMP: exposing err.message to the response so we can see the exact
    // DB error without needing terminal access. Remove the `error: err.message`
    // line once the 500 is resolved — don't ship raw DB errors to users.
    return res.status(500).json({ message: 'Server error while registering NGO.', error: err.message });
  }
});

// ─── LIST APPROVED NGOS ───────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [ngos] = await pool.query(
      'SELECT * FROM ngos WHERE approved = 1 ORDER BY name ASC'
    );

    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const hasUserLocation = !isNaN(lat) && !isNaN(lng);

    const enriched = ngos.map((ngo) => ({
      ...ngo,
      distance_km: hasUserLocation
        ? getDistanceKm(lat, lng, ngo.latitude, ngo.longitude)
        : null,
    }));

    if (hasUserLocation) {
      enriched.sort((a, b) => a.distance_km - b.distance_km);
    }

    return res.json({ ngos: enriched });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error while fetching NGOs.' });
  }
});

// ─── APPROVE NGO (admin only) ─────────────────────────────────────────────────
router.patch('/:id/approve', authMiddleware, adminOnly, async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE ngos SET approved = 1 WHERE id = ?', [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'NGO not found.' });
    }

    return res.json({ message: 'NGO approved successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// ─── UPDATE NGO STATUS ────────────────────────────────────────────────────────
router.patch('/status', authMiddleware, async (req, res) => {
  const { status } = req.body;
  if (!['active', 'limited', 'offline'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status.' });
  }
  try {
    const [result] = await pool.query(
      'UPDATE ngos SET availability_status = ? WHERE user_id = ?',
      [status, req.user.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'NGO not found for this user.' });
    }
    return res.json({ message: 'Status updated successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error updating status.' });
  }
});

// ─── TOGGLE SOS MODE ────────────────────────────────────────────────────────────
router.patch('/sos', authMiddleware, async (req, res) => {
  const { is_sos } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE ngos SET is_sos = ? WHERE user_id = ?',
      [is_sos ? 1 : 0, req.user.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'NGO not found for this user.' });
    }
    return res.json({ message: `SOS mode ${is_sos ? 'activated' : 'deactivated'}.` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error updating SOS status.' });
  }
});

module.exports = router;