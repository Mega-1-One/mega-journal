const express = require('express');
const router = express.Router();
const Account = require('../models/Account');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/accounts
router.get('/', async (req, res) => {
  try {
    const accounts = await Account.find({ userId: req.user._id });
    res.json({ success: true, accounts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/accounts - Create account with tier entitlement check
router.post('/', async (req, res) => {
  try {
    const existingAccounts = await Account.countDocuments({ userId: req.user._id });
    const userTier = req.user.planTier || 'FREE';

    if (userTier === 'FREE' && existingAccounts >= 1 && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Free Tier Limit Reached: Free plan includes 1 trading account. Upgrade to Pro or Elite for multi-account portfolio management.'
      });
    }

    const account = await Account.create({
      userId: req.user._id,
      ...req.body
    });
    res.json({ success: true, account });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PUT /api/accounts/:id
router.put('/:id', async (req, res) => {
  try {
    const account = await Account.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body },
      { new: true }
    );
    if (!account) return res.status(404).json({ success: false, error: 'Account not found' });
    res.json({ success: true, account });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE /api/accounts/:id
router.delete('/:id', async (req, res) => {
  try {
    await Account.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true, message: 'Account removed' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
