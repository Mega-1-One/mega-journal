'use client';

import React, { useState } from 'react';
import { BookOpen, Save, CheckCircle2 } from 'lucide-react';

export default function JournalPage() {
  const [preMarket, setPreMarket] = useState(
    'Market Bias: Bullish on NAS100 above 19800. Looking for NY open liquidity sweep of Asian highs.'
  );
  const [duringSession, setDuringSession] = useState(
    '10:15 AM: NAS100 swept equal lows at 19820 and printed 5m displacement candle leaving FVG.'
  );
  const [eodReview, setEodReview] = useState(
    'Flawless execution today. Stuck to pre-market plan and did not overtrade after first win.'
  );
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight font-heading flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-lime" /> Daily Journal
          </h1>
          <p className="text-xs text-text-secondary">Structure your routine: Pre-market plan → Session logs → EOD post-mortem</p>
        </div>

        <button
          onClick={handleSave}
          className="btn-primary-lime text-xs px-4 py-2 rounded-lg shadow flex items-center gap-1.5 font-heading font-black"
        >
          {isSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4 stroke-[3]" />}
          <span>{isSaved ? 'Saved to Journal' : 'Save Review'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="custom-card p-5 space-y-3">
          <div className="flex items-center gap-2 border-b border-bg-border pb-2 font-heading">
            <span className="w-2 h-2 rounded-full bg-lime"></span>
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">1. Pre-Market Plan</h3>
          </div>
          <textarea
            rows={8}
            value={preMarket}
            onChange={(e) => setPreMarket(e.target.value)}
            className="w-full bg-bg-nested border border-bg-border rounded-lg p-3 text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-lime resize-none"
          />
        </div>

        <div className="custom-card p-5 space-y-3">
          <div className="flex items-center gap-2 border-b border-bg-border pb-2 font-heading">
            <span className="w-2 h-2 rounded-full bg-warning"></span>
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">2. Session Observations</h3>
          </div>
          <textarea
            rows={8}
            value={duringSession}
            onChange={(e) => setDuringSession(e.target.value)}
            className="w-full bg-bg-nested border border-bg-border rounded-lg p-3 text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-lime resize-none"
          />
        </div>

        <div className="custom-card p-5 space-y-3">
          <div className="flex items-center gap-2 border-b border-bg-border pb-2 font-heading">
            <span className="w-2 h-2 rounded-full bg-lime"></span>
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">3. End of Day Review</h3>
          </div>
          <textarea
            rows={8}
            value={eodReview}
            onChange={(e) => setEodReview(e.target.value)}
            className="w-full bg-bg-nested border border-bg-border rounded-lg p-3 text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-lime resize-none"
          />
        </div>
      </div>
    </div>
  );
}
