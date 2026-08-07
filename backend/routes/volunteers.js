const express = require('express');
const pool = require('../db/connection');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Register a volunteer
router.post('/register', authMiddleware, async (req, res) => {
  const { name, phone, city, latitude, longitude } = req.body;
  if (!name || !phone || !city) {
    return res.status(400).json({ message: 'Name, phone, and city are required.' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO volunteers (user_id, name, phone, city, latitude, longitude, status) VALUES (?, ?, ?, ?, ?, ?, 'available')`,
      [req.user.id, name, phone, city, latitude ?? null, longitude ?? null]
    );
    return res.status(201).json({ message: 'Volunteer registered successfully.', id: result.insertId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// Get volunteer status for logged-in user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM volunteers WHERE user_id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Not registered as a volunteer.' });
    return res.json({ volunteer: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// Update volunteer status (available, busy, offline)
router.patch('/status', authMiddleware, async (req, res) => {
  const { status } = req.body;
  try {
    await pool.query('UPDATE volunteers SET status = ? WHERE user_id = ?', [status, req.user.id]);
    return res.json({ message: 'Status updated successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// NGO requests a pickup
router.post('/request-pickup', authMiddleware, async (req, res) => {
  const { donation_id } = req.body;
  try {
    const [ngoRows] = await pool.query('SELECT id FROM ngos WHERE user_id = ?', [req.user.id]);
    if (ngoRows.length === 0) return res.status(403).json({ message: 'Not an NGO.' });
    const ngoId = ngoRows[0].id;

    // Create the request
    await pool.query(
      'INSERT INTO pickup_requests (donation_id, ngo_id, status) VALUES (?, ?, "pending")',
      [donation_id, ngoId]
    );
    
    // In a full implementation, this would notify nearby available volunteers
    
    return res.status(201).json({ message: 'Pickup request broadcasted to nearby volunteers.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// Get all pending pickups for the volunteer's city
router.get('/pending', authMiddleware, async (req, res) => {
  try {
    const [volRows] = await pool.query('SELECT id, city FROM volunteers WHERE user_id = ?', [req.user.id]);
    if (volRows.length === 0) return res.status(403).json({ message: 'Not registered as a volunteer.' });
    
    // Get pending pickups where the donation is in the same city (or just all pending for MVP)
    const [pickups] = await pool.query(`
      SELECT p.id as request_id, p.created_at, 
             d.id as donation_id, d.food_type, d.quantity, d.address as donor_address, d.donor_name, d.donor_phone, d.is_urgent,
             n.name as ngo_name, n.address as ngo_address, n.city
      FROM pickup_requests p
      JOIN donations d ON p.donation_id = d.id
      JOIN ngos n ON p.ngo_id = n.id
      WHERE p.status = 'pending'
    `);
    
    return res.json({ pickups });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error fetching pickups.' });
  }
});

// Volunteer claims a pickup
router.patch('/claim/:id', authMiddleware, async (req, res) => {
  const requestId = req.params.id;
  try {
    const [volRows] = await pool.query('SELECT id FROM volunteers WHERE user_id = ?', [req.user.id]);
    if (volRows.length === 0) return res.status(403).json({ message: 'Not registered as a volunteer.' });
    const volunteerId = volRows[0].id;

    // Update the pickup request
    const [result] = await pool.query(
      'UPDATE pickup_requests SET status = "accepted", volunteer_id = ? WHERE id = ? AND status = "pending"',
      [volunteerId, requestId]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: 'Pickup already claimed or not found.' });
    }

    return res.json({ message: 'Pickup claimed successfully! Drive safe.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error claiming pickup.' });
  }
});

// Get NGO Partners
router.get('/ngo-partners', authMiddleware, async (req, res) => {
  try {
    const [ngos] = await pool.query('SELECT id, name, city, address, capacity FROM ngos WHERE approved = 1 ORDER BY name ASC');
    return res.json({ ngos });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error fetching NGOs.' });
  }
});

// Get Volunteer Partners
router.get('/volunteer-partners', authMiddleware, async (req, res) => {
  try {
    const [volunteers] = await pool.query('SELECT id, name, vehicle_type FROM volunteers WHERE user_id != ? ORDER BY name ASC', [req.user.id]);
    return res.json({ volunteers });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error fetching volunteers.' });
  }
});

module.exports = router;
