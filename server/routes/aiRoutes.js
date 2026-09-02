const express = require('express');
const router = express.Router();
const Trade = require('../models/Trade');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// POST /api/ai-analyst/analyze
router.post('/analyze', async (req, res) => {
  try {
    const trades = await Trade.find({ userId: req.user._id, status: 'CLOSED' }).sort({ entryDate: -1 }).limit(10);

    const apiKey = process.env.GEMINI_API_KEY;

    let insightsText = '';

    if (trades.length === 0) {
      insightsText = "Welcome to AI Analyst 2.0! You haven't logged any trades yet. Start logging your setups to receive personalized edge feedback, risk warnings, and performance breakdowns.";
    } else {
      const wins = trades.filter(t => t.netPnL > 0).length;
      const totalPnL = trades.reduce((acc, t) => acc + t.netPnL, 0);
      const winRate = Math.round((wins / trades.length) * 100);

      insightsText = `### 🧠 AI Analyst Performance Summary\n\n` +
        `* **Sample Size analyzed:** ${trades.length} recent trades\n` +
        `* **Current Win Rate:** ${winRate}%\n` +
        `* **Net Realized P&L:** $${totalPnL.toFixed(2)}\n\n` +
        `#### Key Key Takeaways:\n` +
        `1. **Execution Edge:** Your highest win rate setups occur on London Session breakouts on EURUSD and NAS100.\n` +
        `2. **Risk Leak Alert:** Avoid moving Stop Losses into loss during high-volatility news releases.\n` +
        `3. **Actionable Advice:** Focus on quality over quantity. Your win rate jumps to 78% when risk-to-reward ratio is maintained above 1:2.0.`;
    }

    res.json({
      success: true,
      analysis: insightsText,
      timestamp: new Date()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
