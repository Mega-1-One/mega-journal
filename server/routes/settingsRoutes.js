const express = require('express');
const router = express.Router();
const OnboardingProfile = require('../models/OnboardingProfile');
const User = require('../models/User');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// --- ONBOARDING ---
router.get('/onboarding', async (req, res) => {
  let profile = await OnboardingProfile.findOne({ userId: req.user._id });
  if (!profile) {
    profile = await OnboardingProfile.create({ userId: req.user._id });
  }
  res.json({ success: true, profile });
});

router.post('/onboarding', async (req, res) => {
  const profile = await OnboardingProfile.findOneAndUpdate(
    { userId: req.user._id },
    { $set: { ...req.body, isCompleted: true } },
    { new: true, upsert: true }
  );
  res.json({ success: true, profile });
});

// --- SETTINGS ---
router.get('/settings', async (req, res) => {
  res.json({ success: true, user: req.user });
});

router.put('/settings', async (req, res) => {
  const { name, username } = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, { $set: { name, username } }, { new: true });
  res.json({ success: true, user });
});

router.put('/settings/mood', async (req, res) => {
  const { moodHistory } = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, { $set: { moodHistory } }, { new: true });
  res.json({ success: true, moodHistory: user.moodHistory });
});

// --- ADMIN ---
router.get('/admin/users', adminMiddleware, async (req, res) => {
  const users = await User.find().select('-passwordHash');
  res.json({ success: true, count: users.length, users });
});

module.exports = router;
