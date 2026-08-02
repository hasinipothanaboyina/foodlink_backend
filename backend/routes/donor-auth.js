const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const router = express.Router();

// ─── REQUEST OTP ────────────────────────────────────────────────────────────
// In a real app, this would use Twilio or SNS to send an SMS.
// Here we simulate it by just returning success.
router.post('/request-otp', async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ message: 'Phone number is required.' });
  }

  // Simulate sending OTP
  console.log(`[SIMULATED SMS] Sending OTP to ${phone}: 1234`);
  
  return res.json({ message: 'OTP sent successfully. (Use 1234 for demo)' });
});

// ─── VERIFY OTP ─────────────────────────────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ message: 'Phone and OTP are required.' });
  }

  // Accept '1234' as the universal simulated OTP
  if (otp !== '1234') {
    return res.status(401).json({ message: 'Invalid OTP.' });
  }

  // Create a JWT token for the donor
  // We use role='donor' and embed the phone number
  const token = jwt.sign(
    { phone, role: 'donor' },
    process.env.JWT_SECRET || 'foodlink_super_secret_key_change_this',
    { expiresIn: '7d' }
  );

  return res.json({
    message: 'Login successful.',
    token,
    user: { phone, role: 'donor' }
  });
});

module.exports = router;
