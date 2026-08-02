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

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});