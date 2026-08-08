const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../db/connection');
const authMiddleware = require('../middleware/auth');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

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

router.post('/report', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    const { category, description } = req.body;
    let photo_url = null;
    if (req.file) {
      photo_url = '/uploads/' + req.file.filename;
    }

    // Fetch user details
    const [users] = await pool.query('SELECT name, email FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    const reported_by = users[0].name || users[0].email; // name or email

    await pool.query(
      'INSERT INTO reported_issues (reported_by, category, description, photo_url) VALUES (?, ?, ?, ?)',
      [reported_by, category, description, photo_url]
    );

    return res.json({ message: 'Issue reported successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to report issue' });
  }
});

module.exports = router;
