/**
 * FoodLink AI - Backend Server (MySQL)
 * Setup:
 *   1. Run db/schema.sql in MySQL Workbench
 *   2. Fill in .env with your MySQL password
 *   3. npm install
 *   4. npm run dev
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const donationRoutes = require('./routes/donations');
const ngoRoutes = require('./routes/ngos');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ─── ROOT HEALTH CHECK ────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'FoodLink AI Backend is running!' });
});

// ─── ROUTES ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/ngos', ngoRoutes);
app.use('/api/admin', adminRoutes);

// ─── 404 HANDLER ──────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});