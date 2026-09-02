const express = require('express');
const router = express.Router();
const BrokerConnection = require('../models/BrokerConnection');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  const connections = await BrokerConnection.find({ userId: req.user._id });
  res.json({ success: true, connections });
});

router.post('/', async (req, res) => {
  const connection = await BrokerConnection.create({ userId: req.user._id, ...req.body });
  res.json({ success: true, connection });
});

router.delete('/:id', async (req, res) => {
  await BrokerConnection.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  res.json({ success: true });
});

module.exports = router;
