'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import Link from 'next/link';
import { ArrowLeft, Calendar, CheckCircle2, TrendingUp, AlertCircle, Award } from 'lucide-react';

export default function MonthlyReviewPage() {
  const { analytics, adherenceComparison, formatValue } = useApp();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-bg-border pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/ai-analyst"
            className="p-2 rounded-xl bg-bg-card hover:bg-bg-nested text-text-secondary hover:text-text-primary border border-bg-border transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-text-primary tracking-tight font-heading flex items-center gap-2">
              <Calendar className="w-5 h-5 text-lime" /> Monthly AI Performance Review
            </h1>
            <p className="text-xs text-text-secondary">Comprehensive monthly trading performance comparison & consistency analysis.</p>
          </div>
        </div>
      </div>

      {/* MONTHLY SUMMARY CARD */}
      <div className="custom-card p-6 space-y-6 border-l-4 border-lime font-mono-num">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-text-primary font-heading uppercase tracking-wider">
            MONTHLY EXECUTIVE PERFORMANCE
          </h3>
          <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-lime/10 text-lime font-heading">
            Sample: {analytics.totalTrades} Trades
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-bg-nested rounded-xl border border-bg-border">
            <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Monthly Net P&L</span>
            <span className={`text-xl font-black font-heading ${analytics.netPnL >= 0 ? 'text-lime' : 'text-loss'}`}>
              {formatValue(analytics.netPnL)}
            </span>
          </div>

          <div className="p-4 bg-bg-nested rounded-xl border border-bg-border">
            <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Win Rate %</span>
            <span className="text-xl font-black text-lime font-heading">{analytics.winRate}%</span>
          </div>

          <div className="p-4 bg-bg-nested rounded-xl border border-bg-border">
            <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Profit Factor</span>
            <span className="text-xl font-black text-text-primary font-heading">{analytics.profitFactor}</span>
          </div>

          <div className="p-4 bg-bg-nested rounded-xl border border-bg-border">
            <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Max Drawdown</span>
            <span className="text-xl font-black text-loss font-heading">{analytics.maxDrawdownPercent}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
