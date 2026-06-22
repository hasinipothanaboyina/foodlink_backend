/**
 * Donations Routes
 * POST  /api/donations            -> create donation + AI-match nearest suitable NGO
 * GET   /api/donations/my         -> list logged-in user's donations
 * GET   /api/donations/all        -> all donations (admin only)
 * GET   /api/donations/:id        -> get single donation
 * PATCH /api/donations/:id/status -> update status
 */

const express = require('express');
const pool = require('../db/connection');
const authMiddleware = require('../middleware/auth');
const { adminOnly } = require('../middleware/auth');

const router = express.Router();

// ─── HAVERSINE DISTANCE (km) ──────────────────────────────────────────────
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ─── AI MATCHING ENGINE ───────────────────────────────────────────────────
async function findBestNGO(donation) {
  const [ngos] = await pool.query('SELECT * FROM ngos WHERE approved = 1');

  let best = null;
  let bestDistance = Infinity;

  for (const ngo of ngos) {
    const acceptedTypes = ngo.accepted_types.split(',');
    if (!acceptedTypes.includes(donation.food_type)) continue;
    if (donation.quantity > ngo.capacity) continue;

    if (donation.latitude == null || donation.longitude == null) {
      if (!best) best = { ngo, distance: null };
      continue;
    }

    const distance = getDistanceKm(donation.latitude, donation.longitude, ngo.latitude, ngo.longitude);

    if (distance < bestDistance) {
      bestDistance = distance;
      best = { ngo, distance };
    }
  }

  return best;
}

// ─── CREATE DONATION (with AI match) ──────────────────────────────────────
router.post('/', authMiddleware, async (req, res) => {
  const { food_type, quantity, pickup_by, address, description, latitude, longitude } = req.body;

  if (!food_type || !quantity || !pickup_by || !address) {
    return res.status(400).json({ message: 'Food type, quantity, pickup time, and address are required.' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO donations (user_id, food_type, quantity, pickup_by, address, description, latitude, longitude, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [req.user.id, food_type, quantity, pickup_by, address, description || '', latitude ?? null, longitude ?? null]
    );

    const donationId = result.insertId;

    const donation = {
      food_type,
      quantity,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
    };

    const match = await findBestNGO(donation);
    let matchedNGO = null;

    if (match) {
      await pool.query(
        `UPDATE donations SET status = 'matched', ngo_id = ?, ngo_name = ?, distance_km = ? WHERE id = ?`,
        [match.ngo.id, match.ngo.name, match.distance, donationId]
      );

      matchedNGO = {
        id: match.ngo.id,
        name: match.ngo.name,
        distance: match.distance != null ? `${match.distance.toFixed(1)} km` : 'Nearby',
      };
    }

    return res.status(201).json({
      message: 'Donation submitted successfully.',
      donationId,
      matchedNGO,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error while submitting donation.' });
  }
});

// ─── GET MY DONATIONS (supports ?status=&page=&limit=) ────────────────────
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const { status, page, limit } = req.query;

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit) || 1000, 1), 100);
    const offset = (pageNum - 1) * pageSize;

    let whereClause = 'WHERE user_id = ?';
    const params = [req.user.id];

    if (status && status !== 'all') {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM donations ${whereClause}`,
      params
    );

    const [donations] = await pool.query(
      `SELECT * FROM donations ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    return res.json({
      donations,
      pagination: {
        total,
        page: pageNum,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error while fetching donations.' });
  }
});

// ─── GET ALL DONATIONS (admin only) ────────────────────────────────────────
router.get('/all', authMiddleware, adminOnly, async (req, res) => {
  try {
    const [donations] = await pool.query(
      `SELECT d.*, u.name AS donor_name, u.email AS donor_email
       FROM donations d
       JOIN users u ON d.user_id = u.id
       ORDER BY d.created_at DESC`
    );
    return res.json({ donations });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error while fetching donations.' });
  }
});

// ─── GET SINGLE DONATION ────────────────────────────────────────────────────
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM donations WHERE id = ? AND user_id = ?', [
      req.params.id,
      req.user.id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Donation not found.' });
    }

    return res.json({ donation: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// ─── UPDATE DONATION STATUS ─────────────────────────────────────────────────
router.patch('/:id/status', authMiddleware, async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'matched', 'in_transit', 'completed', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value.' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM donations WHERE id = ? AND user_id = ?', [
      req.params.id,
      req.user.id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Donation not found.' });
    }

    await pool.query('UPDATE donations SET status = ? WHERE id = ?', [status, req.params.id]);

    return res.json({ message: 'Status updated successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;