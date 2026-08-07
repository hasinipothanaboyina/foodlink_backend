require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes      = require('./routes/auth');
const donationRoutes  = require('./routes/donations');
const ngoRoutes       = require('./routes/ngos');
const adminRoutes     = require('./routes/admin');
const passwordRoutes  = require('./routes/forgot-password');
const donorAuthRoutes = require('./routes/donor-auth');

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Start Escalation Cron Job
require('./cron/escalation');

// Serve uploaded NGO verification documents (certificates, ID proofs)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth',      authRoutes);
app.use('/api/auth',      passwordRoutes);   // forgot + reset password
app.use('/api/donations', donationRoutes);
app.use('/api/ngos',      ngoRoutes);
app.use('/api/admin',     adminRoutes);
app.use('/api/donor-auth', donorAuthRoutes);
app.use('/api/volunteers', require('./routes/volunteers'));

// ── DISASTER RELIEF MODE ──
let DISASTER_MODE_ACTIVE = false;

app.get('/api/system-status', (req, res) => {
  res.json({ disaster_mode: DISASTER_MODE_ACTIVE });
});

app.post('/api/admin/disaster-mode', (req, res) => {
  const { active } = req.body;
  DISASTER_MODE_ACTIVE = !!active;
  res.json({ message: `Disaster mode set to ${DISASTER_MODE_ACTIVE}`, disaster_mode: DISASTER_MODE_ACTIVE });
});

app.get('/api', (req, res) => res.json({ message: 'FoodLink AI Backend is running!' }));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Catch multer/file-upload errors (wrong type, too large) as clean JSON
// instead of the default HTML error page.
app.use((err, req, res, next) => {
  if (err) {
    console.error(err);
    return res.status(400).json({ message: err.message || 'Upload failed.' });
  }
  next();
});

// Auto-run schema migrations on startup for live DBs
const pool = require('./db/connection');
async function runMigrations() {
  console.log('Running auto-migrations on startup...');
  const queries = [
    "ALTER TABLE volunteers ADD COLUMN vehicle_type VARCHAR(100)",
    "ALTER TABLE volunteers ADD COLUMN vehicle_number VARCHAR(100)",
    "ALTER TABLE volunteers ADD COLUMN earnings DECIMAL(10,2) DEFAULT 0.00",
    "ALTER TABLE volunteers ADD COLUMN age INT NULL",
    "ALTER TABLE volunteers ADD COLUMN gender VARCHAR(20) NULL",
    "ALTER TABLE volunteers ADD COLUMN photo_url VARCHAR(255) NULL",
    "ALTER TABLE volunteers MODIFY phone VARCHAR(20) NULL",
    "ALTER TABLE volunteers MODIFY city VARCHAR(100) NULL",
    `CREATE TABLE IF NOT EXISTS volunteer_feedback (
      id INT AUTO_INCREMENT PRIMARY KEY,
      volunteer_id INT NOT NULL,
      ngo_id INT NOT NULL,
      donation_id INT,
      rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE,
      FOREIGN KEY (ngo_id) REFERENCES ngos(id) ON DELETE CASCADE
    )`
  ];
  for (const q of queries) {
    try {
      await pool.query(q);
    } catch (err) {
      // Ignore errors (like duplicate column)
    }
  }
  console.log('Auto-migrations completed successfully.');
}
runMigrations();

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});