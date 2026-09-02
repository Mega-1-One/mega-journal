const express = require('express');
const router = express.Router();
const Strategy = require('../models/Strategy');
const Playbook = require('../models/Playbook');
const Rule = require('../models/Rule');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// --- STRATEGIES ---
router.get('/strategies', async (req, res) => {
  const strategies = await Strategy.find({ userId: req.user._id });
  res.json({ success: true, strategies });
});

router.post('/strategies', async (req, res) => {
  const strategy = await Strategy.create({ userId: req.user._id, ...req.body });
  res.json({ success: true, strategy });
});

router.put('/strategies/:id', async (req, res) => {
  const strategy = await Strategy.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { $set: req.body }, { new: true });
  res.json({ success: true, strategy });
});

router.delete('/strategies/:id', async (req, res) => {
  await Strategy.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  res.json({ success: true });
});

// --- PLAYBOOKS ---
router.get('/playbooks', async (req, res) => {
  const playbooks = await Playbook.find({ userId: req.user._id }).populate('strategyId');
  res.json({ success: true, playbooks });
});

router.post('/playbooks', async (req, res) => {
  const playbook = await Playbook.create({ userId: req.user._id, ...req.body });
  res.json({ success: true, playbook });
});

router.put('/playbooks/:id', async (req, res) => {
  const playbook = await Playbook.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { $set: req.body }, { new: true });
  res.json({ success: true, playbook });
});

router.delete('/playbooks/:id', async (req, res) => {
  await Playbook.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  res.json({ success: true });
});

// --- RULES ---
router.get('/rules', async (req, res) => {
  const rules = await Rule.find({ userId: req.user._id });
  res.json({ success: true, rules });
});

router.post('/rules', async (req, res) => {
  const rule = await Rule.create({ userId: req.user._id, ...req.body });
  res.json({ success: true, rule });
});

router.put('/rules/:id', async (req, res) => {
  const rule = await Rule.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { $set: req.body }, { new: true });
  res.json({ success: true, rule });
});

router.delete('/rules/:id', async (req, res) => {
  await Rule.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  res.json({ success: true });
});

module.exports = router;
