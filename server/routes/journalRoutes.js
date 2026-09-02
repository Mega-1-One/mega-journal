const express = require('express');
const router = express.Router();
const JournalEntry = require('../models/JournalEntry');
const Note = require('../models/Note');
const TradingBook = require('../models/TradingBook');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// --- JOURNAL ENTRIES ---
router.get('/journal', async (req, res) => {
  const entries = await JournalEntry.find({ userId: req.user._id }).sort({ date: -1 });
  res.json({ success: true, entries });
});

router.post('/journal', async (req, res) => {
  const entry = await JournalEntry.create({ userId: req.user._id, ...req.body });
  res.json({ success: true, entry });
});

router.delete('/journal/:id', async (req, res) => {
  await JournalEntry.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  res.json({ success: true });
});

// --- NOTES ---
router.get('/notes', async (req, res) => {
  const notes = await Note.find({ userId: req.user._id });
  res.json({ success: true, notes });
});

router.post('/notes', async (req, res) => {
  const note = await Note.create({ userId: req.user._id, ...req.body });
  res.json({ success: true, note });
});

router.put('/notes/:id', async (req, res) => {
  const note = await Note.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { $set: req.body }, { new: true });
  res.json({ success: true, note });
});

router.delete('/notes/:id', async (req, res) => {
  await Note.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  res.json({ success: true });
});

// --- TRADING BOOKS ---
router.get('/books', async (req, res) => {
  const books = await TradingBook.find({ userId: req.user._id });
  res.json({ success: true, books });
});

router.post('/books', async (req, res) => {
  const book = await TradingBook.create({ userId: req.user._id, ...req.body });
  res.json({ success: true, book });
});

module.exports = router;
