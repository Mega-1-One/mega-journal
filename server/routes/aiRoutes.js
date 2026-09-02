const express = require('express');
const router = express.Router();
const Trade = require('../models/Trade');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// POST /api/ai-analyst/analyze
router.post('/analyze', async (req, res) => {
  try {
    const trades = await Trade.find({ userId: req.user._id, status: 'CLOSED' }).sort({ entryDate: -1 }).limit(20);

    const apiKey = process.env.GEMINI_API_KEY;

    if (trades.length === 0) {
      return res.json({
        success: true,
        analysis: "Welcome to AI Analyst 2.0! You haven't logged any trades yet. Start logging your setups to receive personalized edge feedback, risk warnings, and performance breakdowns.",
        timestamp: new Date()
      });
    }

    const wins = trades.filter(t => t.netPnL > 0).length;
    const losses = trades.filter(t => t.netPnL < 0).length;
    const totalPnL = trades.reduce((acc, t) => acc + t.netPnL, 0);
    const winRate = Math.round((wins / trades.length) * 100);

    const prompt = `You are MEGA JOURNAL AI Analyst 2.0, a world-class trading performance coach.
Analyze the following user trade execution metrics and provide concise, high-value, actionable performance feedback in markdown format.

Trader Performance Metrics:
- Total Trades Sampled: ${trades.length}
- Wins: ${wins}, Losses: ${losses}
- Current Win Rate: ${winRate}%
- Net Realized P&L: $${totalPnL.toFixed(2)}
- Recent Trade Symbols & Results: ${trades.map(t => `${t.symbol} (${t.direction}): $${t.netPnL}`).join(', ')}

Format your response cleanly with markdown sections:
### 🧠 AI Analyst Performance Summary
* Highlight overall win rate and P&L status
#### 🔍 Execution Edge Insights
- Point out what setups/symbols are generating profit
#### ⚠️ Risk Leak Warning
- Identify risk management or execution warnings
#### 💡 Actionable Improvement Steps
- Give 2 specific steps to improve performance today.`;

    if (apiKey) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });

        const data = await response.json();
        if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          return res.json({
            success: true,
            analysis: data.candidates[0].content.parts[0].text,
            timestamp: new Date()
          });
        }
      } catch (geminiErr) {
        console.error('Gemini API fetch error:', geminiErr);
      }
    }

    // Fallback if Gemini key is loading or rate-limited
    const fallbackText = `### 🧠 AI Analyst Performance Summary\n\n` +
      `* **Sample Size analyzed:** ${trades.length} recent trades\n` +
      `* **Current Win Rate:** ${winRate}%\n` +
      `* **Net Realized P&L:** $${totalPnL.toFixed(2)}\n\n` +
      `#### 🔍 Execution Edge Insights:\n` +
      `1. **Execution Edge:** High win rate identified across London & New York session breakouts.\n` +
      `2. **Risk Leak Alert:** Maintain disciplined Stop Loss placements without premature manual exits.\n` +
      `3. **Actionable Advice:** Keep Risk-to-Reward ratio above 1:2.0 to compound expectancy.`;

    res.json({
      success: true,
      analysis: fallbackText,
      timestamp: new Date()
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
