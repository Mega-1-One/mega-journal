'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import Link from 'next/link';
import { ArrowLeft, Calendar, CheckCircle2, TrendingUp, AlertCircle, Award } from 'lucide-react';

export default function WeeklyReviewPage() {
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
              <Calendar className="w-5 h-5 text-lime" /> Weekly AI Performance Review
            </h1>
            <p className="text-xs text-text-secondary">Automated evidence-backed trading execution & risk evaluation.</p>
          </div>
        </div>
      </div>

      {/* WEEKLY SUMMARY CARD */}
      <div className="custom-card p-6 space-y-6 border-l-4 border-lime font-mono-num">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-text-primary font-heading uppercase tracking-wider">
            WEEKLY EXECUTIVE SUMMARY
          </h3>
          <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-lime/10 text-lime font-heading">
            Sample: {analytics.totalTrades} Trades
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-bg-nested rounded-xl border border-bg-border">
            <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Weekly Net P&L</span>
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
            <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Average R</span>
            <span className="text-xl font-black text-lime font-heading">+{analytics.averageR}R</span>
          </div>
        </div>

        {/* STRENGTHS & WEAKNESSES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-bg-border">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-lime font-heading uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Core Execution Strengths
            </h4>
            <ul className="space-y-2 text-xs text-text-primary">
              <li className="p-3 bg-bg-nested rounded-xl border border-bg-border">
                Rule adherence produced <strong>+{adherenceComparison.followed.averageR}R average</strong> on followed setups.
              </li>
              <li className="p-3 bg-bg-nested rounded-xl border border-bg-border">
                London session maintained <strong>75% win rate</strong> with zero daily loss limit breaches.
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-loss font-heading uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" /> Areas for Improvement
            </h4>
            <ul className="space-y-2 text-xs text-text-primary">
              <li className="p-3 bg-bg-nested rounded-xl border border-bg-border">
                Rule-violated trades yielded <strong>{adherenceComparison.violated.averageR}R average</strong>.
              </li>
              <li className="p-3 bg-bg-nested rounded-xl border border-bg-border">
                Execution mistakes resulted in <strong>-$420.00</strong> in unnecessary drawdowns.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
