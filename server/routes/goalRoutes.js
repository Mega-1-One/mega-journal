const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');
const Account = require('../models/Account');
const Trade = require('../models/Trade');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// --- GOALS ---
router.get('/goals', async (req, res) => {
  const goals = await Goal.find({ userId: req.user._id });
  res.json({ success: true, goals });
});

router.post('/goals', async (req, res) => {
  const goal = await Goal.create({ userId: req.user._id, ...req.body });
  res.json({ success: true, goal });
});

router.put('/goals/:id', async (req, res) => {
  const goal = await Goal.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { $set: req.body }, { new: true });
  res.json({ success: true, goal });
});

router.delete('/goals/:id', async (req, res) => {
  await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  res.json({ success: true });
});

// --- RISK CENTER & PROP FIRM ---
router.get('/risk', async (req, res) => {
  const account = await Account.findOne({ userId: req.user._id, status: 'ACTIVE' });
  const openTrades = await Trade.find({ userId: req.user._id, status: 'OPEN' });

  const totalOpenRisk = openTrades.reduce((acc, t) => {
    if (!t.stopLoss || Number(t.stopLoss) === 0 || Number(t.stopLoss) === Number(t.entryPrice)) return acc;
    return acc + Math.abs(Number(t.entryPrice) - Number(t.stopLoss)) * Number(t.positionSize);
  }, 0);

  res.json({
    success: true,
    risk: {
      accountBalance: account ? account.currentBalance : 10000,
      openTradesCount: openTrades.length,
      totalOpenRiskPnL: parseFloat(totalOpenRisk.toFixed(2)),
      maxDailyLossLimit: account ? account.maxDailyLossLimit : 500,
      maxTotalLossLimit: account ? account.maxTotalLossLimit : 1000,
      complianceStatus: totalOpenRisk > (account ? account.maxDailyLossLimit : 500) ? 'WARNING' : 'PASSING'
    }
  });
});

module.exports = router;
