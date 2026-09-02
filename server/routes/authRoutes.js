const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const User = require('../models/User');
const Account = require('../models/Account');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');
const validate = require('../middleware/validate');

const signupSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(6),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /api/auth/signup
router.post('/signup', validate(signupSchema), async (req, res) => {
  try {
    const { email, username, password, name } = req.body;
    
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email or username already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, username, passwordHash, name: name || username });

    // Auto-create default Account
    await Account.create({
      userId: user._id,
      name: 'Main Trading Account',
      startingBalance: 10000,
      currentBalance: 10000,
      currency: 'USD',
      accountType: 'PERSONAL',
    });

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      token,
      user: { id: user._id, email: user.email, username: user.username, name: user.name, role: user.role }
    });
  } catch (err) {
    console.error('Signup Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      token,
      user: { id: user._id, email: user.email, username: user.username, name: user.name, role: user.role }
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// PUT /api/auth/profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    if (name) user.name = name;
    if (email) user.email = email;
    await user.save();

    res.json({
      success: true,
      user: { id: user._id, email: user.email, username: user.username, name: user.name, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  const resetToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000;
  await user.save();

  res.json({ success: true, message: 'Reset token generated (simulated email dispatch)', resetToken });
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ _id: decoded.userId, resetPasswordToken: token });
    if (!user || user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ success: false, error: 'Invalid or expired token' });
    }
    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ success: true, message: 'Password successfully reset' });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Invalid reset token' });
  }
});

// Google OAuth Mock / Handler
router.post('/google', async (req, res) => {
  try {
    const { email, name, googleId } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      const username = email.split('@')[0] + '_' + Math.floor(Math.random() * 1000);
      user = await User.create({
        email,
        username,
        name: name || username,
        googleId: googleId || 'google_' + Date.now(),
      });
      await Account.create({
        userId: user._id,
        name: 'Google Main Account',
        startingBalance: 10000,
        currentBalance: 10000,
      });
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
