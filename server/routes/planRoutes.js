const express = require('express');
const router = express.Router();
const TradingPlan = require('../models/TradingPlan');
const PreMarketPlan = require('../models/PreMarketPlan');
const DailyReview = require('../models/DailyReview');
const WeeklyReview = require('../models/WeeklyReview');
const MonthlyReportCard = require('../models/MonthlyReportCard');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// --- TRADING PLAN ---
router.get('/trading-plan', async (req, res) => {
  let plan = await TradingPlan.findOne({ userId: req.user._id, status: 'ACTIVE' });
  if (!plan) {
    plan = await TradingPlan.create({ userId: req.user._id, title: 'My Standard Plan' });
  }
  res.json({ success: true, plan });
});

router.put('/trading-plan', async (req, res) => {
  const plan = await TradingPlan.findOneAndUpdate({ userId: req.user._id, status: 'ACTIVE' }, { $set: req.body }, { new: true, upsert: true });
  res.json({ success: true, plan });
});

// --- PRE-MARKET PLAN ---
router.get('/premarket', async (req, res) => {
  const dateStr = req.query.date || new Date().toISOString().substring(0, 10);
  let plan = await PreMarketPlan.findOne({ userId: req.user._id, date: dateStr });
  if (!plan) {
    plan = await PreMarketPlan.create({ userId: req.user._id, date: dateStr });
  }
  res.json({ success: true, plan });
});

router.put('/premarket', async (req, res) => {
  const { date, ...data } = req.body;
  const dateStr = date || new Date().toISOString().substring(0, 10);
  const plan = await PreMarketPlan.findOneAndUpdate({ userId: req.user._id, date: dateStr }, { $set: data }, { new: true, upsert: true });
  res.json({ success: true, plan });
});

// --- REVIEWS ---
router.get('/daily-review', async (req, res) => {
  const dateStr = req.query.date || new Date().toISOString().substring(0, 10);
  let review = await DailyReview.findOne({ userId: req.user._id, date: dateStr });
  res.json({ success: true, review });
});

router.post('/daily-review', async (req, res) => {
  const review = await DailyReview.create({ userId: req.user._id, ...req.body });
  res.json({ success: true, review });
});

router.get('/weekly-review', async (req, res) => {
  const reviews = await WeeklyReview.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, reviews });
});

router.post('/weekly-review', async (req, res) => {
  const review = await WeeklyReview.create({ userId: req.user._id, ...req.body });
  res.json({ success: true, review });
});

router.get('/monthly-report', async (req, res) => {
  const reports = await MonthlyReportCard.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, reports });
});

module.exports = router;
