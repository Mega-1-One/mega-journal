const express = require('express');
const router = express.Router();
const BacktestSession = require('../models/BacktestSession');
const BacktestTrade = require('../models/BacktestTrade');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/sessions', async (req, res) => {
  const sessions = await BacktestSession.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, sessions });
});

router.post('/sessions', async (req, res) => {
  const session = await BacktestSession.create({ userId: req.user._id, ...req.body });
  res.json({ success: true, session });
});

router.get('/sessions/:id/trades', async (req, res) => {
  const trades = await BacktestTrade.find({ sessionId: req.params.id, userId: req.user._id });
  res.json({ success: true, trades });
});

router.post('/sessions/:id/trades', async (req, res) => {
  const trade = await BacktestTrade.create({ userId: req.user._id, sessionId: req.params.id, ...req.body });
  res.json({ success: true, trade });
});

module.exports = router;
