/**
 * Password Reset Routes
 * POST /api/auth/forgot-password  -> send reset link to email
 * POST /api/auth/reset-password   -> reset password using token
 */

const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const pool = require('../db/connection');

const router = express.Router();

// ─── EMAIL TRANSPORTER ────────────────────────────────────────────────────
function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,   // your gmail address in .env
      pass: process.env.MAIL_PASS,   // your gmail app password in .env
    },
  });
}

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────
// POST /api/auth/forgot-password
// Body: { email }
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    // Check if user exists
    const [rows] = await pool.query(
      'SELECT id, name, email FROM users WHERE email = ?',
      [email.trim().toLowerCase()]
    );

    // Always return success even if email not found (security best practice)
    // This prevents people from checking which emails are registered
    if (rows.length === 0) {
      return res.json({
        message: 'If this email is registered, a reset link has been sent.'
      });
    }

    const user = rows[0];

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Save token to database
    await pool.query(
      `UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?`,
      [resetToken, tokenExpiry, user.id]
    );

    // Build reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/reset-password.html?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

    // Send email
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"FoodLink AI" <${process.env.MAIL_USER}>`,
      to: user.email,
      subject: 'Reset Your FoodLink AI Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 2rem; background: #FBF7F0; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 2rem;">
            <h2 style="color: #2D5A4A; margin: 0;">FoodLink AI</h2>
            <p style="color: #6B7280; font-size: 0.9rem; margin: 0.25rem 0 0;">Connecting Food Donors with NGOs across Andhra Pradesh</p>
          </div>

          <div style="background: white; border-radius: 12px; padding: 2rem; border: 1px solid rgba(45,90,74,0.15);">
            <h3 style="color: #1A1A1A; margin-top: 0;">Hi ${user.name},</h3>
            <p style="color: #6B7280; line-height: 1.6;">
              We received a request to reset the password for your FoodLink AI account.
              Click the button below to set a new password.
            </p>

            <div style="text-align: center; margin: 2rem 0;">
              <a href="${resetUrl}"
                style="background: #2D5A4A; color: white; padding: 0.85rem 2rem;
                       border-radius: 999px; text-decoration: none; font-weight: 600;
                       font-size: 1rem; display: inline-block;">
                Reset My Password
              </a>
            </div>

            <p style="color: #6B7280; font-size: 0.85rem; line-height: 1.6;">
              This link will expire in <strong>1 hour</strong>. If you did not request a password reset,
              you can safely ignore this email — your password will not be changed.
            </p>

            <hr style="border: none; border-top: 1px solid rgba(45,90,74,0.15); margin: 1.5rem 0;">

            <p style="color: #9CA3AF; font-size: 0.78rem; word-break: break-all;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color: #2D5A4A;">${resetUrl}</a>
            </p>
          </div>

          <p style="text-align: center; color: #9CA3AF; font-size: 0.78rem; margin-top: 1.5rem;">
            &copy; 2026 FoodLink AI · Serving Andhra Pradesh
          </p>
        </div>
      `,
    });

    return res.json({
      message: 'If this email is registered, a reset link has been sent.'
    });

  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({
      message: 'Failed to send reset email. Please try again later.'
    });
  }
});

// ─── RESET PASSWORD ───────────────────────────────────────────────────────
// POST /api/auth/reset-password
// Body: { email, token, newPassword }
router.post('/reset-password', async (req, res) => {
  const { email, token, newPassword } = req.body;

  if (!email || !token || !newPassword) {
    return res.status(400).json({ message: 'Email, token, and new password are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  try {
    // Find user with matching email and token
    const [rows] = await pool.query(
      `SELECT id, name, reset_token, reset_token_expiry
       FROM users
       WHERE email = ? AND reset_token = ?`,
      [email.trim().toLowerCase(), token]
    );

    if (rows.length === 0) {
      return res.status(400).json({
        message: 'Invalid or expired reset link. Please request a new one.'
      });
    }

    const user = rows[0];

    // Check token expiry
    if (new Date() > new Date(user.reset_token_expiry)) {
      return res.status(400).json({
        message: 'This reset link has expired. Please request a new one.'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await pool.query(
      `UPDATE users
       SET password = ?, reset_token = NULL, reset_token_expiry = NULL
       WHERE id = ?`,
      [hashedPassword, user.id]
    );

    return res.json({ message: 'Password reset successfully. You can now log in.' });

  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

module.exports = router;