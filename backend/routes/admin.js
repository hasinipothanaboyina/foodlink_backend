/**
 * Admin Routes (admin role only)
 * GET   /api/admin/stats           -> platform-wide metrics for admin.html
 * GET   /api/admin/ngos/pending    -> NGOs awaiting approval
 * GET   /api/admin/logs            -> recent activity (latest donations + NGO signups)
 * GET   /api/admin/users           -> all registered users
 * GET   /api/admin/issues          -> reported issues from DB
 * PATCH /api/admin/issues/:id/resolve -> mark an issue as resolved
 */

const express = require('express');
const pool = require('../db/connection');
const authMiddleware = require('../middleware/auth');
const { adminOnly } = require('../middleware/auth');

const router = express.Router();

// All admin routes require a valid token AND role = 'admin'
router.use(authMiddleware, adminOnly);

// ─── PLATFORM STATS ─────────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [[userCount]] = await pool.query('SELECT COUNT(*) AS total FROM users');
    const [[ngoCount]] = await pool.query('SELECT COUNT(*) AS total FROM ngos WHERE approved = 1');
    const [[pendingNgoCount]] = await pool.query('SELECT COUNT(*) AS total FROM ngos WHERE approved = 0');
    const [[donationCount]] = await pool.query('SELECT COUNT(*) AS total FROM donations');
    const [[failedCount]] = await pool.query(
      "SELECT COUNT(*) AS total FROM donations WHERE status = 'cancelled' OR (status = 'pending' AND ngo_id IS NULL)"
    );
    const [[mealsTotal]] = await pool.query(
      "SELECT COALESCE(SUM(quantity), 0) AS total FROM donations WHERE status != 'cancelled'"
    );

    return res.json({
      totalUsers: userCount.total,
      approvedNgos: ngoCount.total,
      pendingNgos: pendingNgoCount.total,
      totalDonations: donationCount.total,
      failedMatches: failedCount.total,
      totalMealsDonated: mealsTotal.total,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error while fetching stats.' });
  }
});

// ─── PENDING NGO APPROVALS ──────────────────────────────────────────────────
router.get('/ngos/pending', async (req, res) => {
  try {
    const [ngos] = await pool.query(
      `SELECT n.*, u.name AS registered_by, u.email AS contact_email
       FROM ngos n
       LEFT JOIN users u ON n.user_id = u.id
       WHERE n.approved = 0
       ORDER BY n.created_at DESC`
    );
    return res.json({ ngos });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error while fetching pending NGOs.' });
  }
});

// ─── APPROVED NGO PARTNERS ──────────────────────────────────────────────────
router.get('/ngos/approved', async (req, res) => {
  try {
    const [ngos] = await pool.query(
      `SELECT n.*, u.name AS registered_by, u.email AS contact_email
       FROM ngos n
       LEFT JOIN users u ON n.user_id = u.id
       WHERE n.approved = 1
       ORDER BY n.name ASC`
    );
    return res.json({ ngos });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error while fetching approved NGOs.' });
  }
});

// ─── REMOVE NGO ─────────────────────────────────────────────────────────────
router.delete('/ngos/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM ngos WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'NGO not found.' });
    }
    return res.json({ message: 'NGO removed successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error while removing NGO.' });
  }
});

// ─── GET ISSUES FOR NGO ─────────────────────────────────────────────────────
router.get('/ngos/:id/issues', async (req, res) => {
  try {
    const [ngos] = await pool.query('SELECT name FROM ngos WHERE id = ?', [req.params.id]);
    if (ngos.length === 0) {
      return res.status(404).json({ message: 'NGO not found.' });
    }
    const ngoName = ngos[0].name;

    const [tables] = await pool.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'reported_issues'`
    );
    if (tables.length === 0) {
      return res.json({ issues: [] });
    }

    const [issues] = await pool.query(
      `SELECT * FROM reported_issues 
       WHERE description LIKE ? OR category LIKE ? 
       ORDER BY created_at DESC`,
      [`%${ngoName}%`, `%${ngoName}%`]
    );
    
    return res.json({ issues });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error while fetching NGO issues.' });
  }
});


// ─── RECENT ACTIVITY LOG ────────────────────────────────────────────────────
router.get('/logs', async (req, res) => {
  try {
    const [donationLogs] = await pool.query(
      `SELECT id, food_type, quantity, status, ngo_name, address, delivery_method, created_at
       FROM donations ORDER BY created_at DESC LIMIT 10`
    );

    const [ngoLogs] = await pool.query(
      `SELECT id, name, approved, created_at
       FROM ngos ORDER BY created_at DESC LIMIT 10`
    );

    return res.json({ donationLogs, ngoLogs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error while fetching logs.' });
  }
});

// ─── USER MANAGEMENT ────────────────────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC`
    );
    return res.json({ users });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error while fetching users.' });
  }
});

// ─── REPORTED ISSUES (Real Database) ────────────────────────────────────────
// GET /api/admin/issues
router.get('/issues', async (req, res) => {
  try {
    // Check if the reported_issues table exists; if not, return a helpful message
    const [tables] = await pool.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'reported_issues'`
    );

    if (tables.length === 0) {
      // Table not yet created — return empty array with a migration hint
      return res.json({
        issues: [],
        hint: 'Run backend/db/migration_add_reported_issues.sql in MySQL Workbench to create the issues table.'
      });
    }

    const [issues] = await pool.query(
      `SELECT id, reported_by, category, description, status, created_at, resolved_at
       FROM reported_issues
       ORDER BY FIELD(status, 'open', 'resolved'), created_at DESC`
    );
    return res.json({ issues });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error while fetching issues.' });
  }
});

// ─── RESOLVE AN ISSUE ───────────────────────────────────────────────────────
// PATCH /api/admin/issues/:id/resolve
router.patch('/issues/:id/resolve', async (req, res) => {
  try {
    const [tables] = await pool.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'reported_issues'`
    );
    if (tables.length === 0) {
      return res.status(400).json({ message: 'Issues table does not exist. Run the migration SQL first.' });
    }

    const [result] = await pool.query(
      `UPDATE reported_issues SET status = 'resolved', resolved_at = NOW() WHERE id = ? AND status = 'open'`,
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Issue not found or already resolved.' });
    }

    return res.json({ message: 'Issue marked as resolved successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error while resolving issue.' });
  }
});

// ─── VOLUNTEERS ─────────────────────────────────────────────────────────────
router.get('/volunteers', async (req, res) => {
  try {
    const [volunteers] = await pool.query('SELECT v.*, u.email FROM volunteers v JOIN users u ON v.user_id = u.id ORDER BY v.created_at DESC');
    return res.json({ volunteers });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error fetching volunteers.' });
  }
});

router.delete('/volunteers/:id', async (req, res) => {
  try {
    const [volRows] = await pool.query('SELECT user_id FROM volunteers WHERE id = ?', [req.params.id]);
    if (volRows.length === 0) return res.status(404).json({ message: 'Volunteer not found.' });
    
    const userId = volRows[0].user_id;
    // Deleting the user will cascade and delete the volunteer record
    await pool.query('DELETE FROM users WHERE id = ?', [userId]);
    
    return res.json({ message: 'Volunteer removed successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error removing volunteer.' });
  }
});

module.exports = router;