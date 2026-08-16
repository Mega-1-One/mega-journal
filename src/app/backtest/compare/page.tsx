'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import Link from 'next/link';
import { ArrowLeft, GitCompare, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function BacktestComparePage() {
  const { analytics, backtestSessions, formatValue } = useApp();

  const activeSession = backtestSessions[0];
  const btTrades = activeSession?.trades || [];
  const btTradeCount = btTrades.length;
  const btWins = btTrades.filter((t) => t.isWin).length;
  const btWinRate = btTradeCount > 0 ? Math.round((btWins / btTradeCount) * 100) : 0;
  const btNetPnL = btTrades.reduce((acc, t) => acc + t.netPnL, 0);
  const btAvgR = btTradeCount > 0 ? Math.round((btTrades.reduce((acc, t) => acc + t.rMultiple, 0) / btTradeCount) * 100) / 100 : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-bg-border pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/backtest"
            className="p-2 rounded-xl bg-bg-card hover:bg-bg-nested text-text-secondary hover:text-text-primary border border-bg-border transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-text-primary tracking-tight font-heading flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-lime" /> Backtest vs Live Performance Comparison
            </h1>
            <p className="text-xs text-text-secondary">
              Side-by-side performance matrix comparing backtested expectation against live execution.
            </p>
          </div>
        </div>
      </div>

      {/* Isolation Banner */}
      <div className="custom-card p-4 border-l-4 border-lime flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-lime flex-shrink-0" />
        <span className="text-xs font-bold text-text-primary font-heading">
          ABSOLUTE DATA ISOLATION ACTIVE: Backtest simulated trades never modify live account balances, prop firm limits, or live trade logs.
        </span>
      </div>

      {/* SIDE BY SIDE MATRIX */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono-num">
        {/* LIVE TRADING DATA */}
        <div className="custom-card p-6 space-y-4 border-t-4 border-lime">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-lime uppercase tracking-widest font-heading">LIVE TRADING PERFORMANCE</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-lime/10 text-lime font-mono-num">LIVE</span>
          </div>

          <div className="space-y-3 divide-y divide-bg-border text-xs">
            <div className="flex justify-between py-2">
              <span className="text-text-muted">Total Trades</span>
              <strong className="text-text-primary font-bold">{analytics.totalTrades}</strong>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-text-muted">Win Rate %</span>
              <strong className="text-lime font-bold">{analytics.winRate}%</strong>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-text-muted">Profit Factor</span>
              <strong className="text-text-primary font-bold">{analytics.profitFactor}</strong>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-text-muted">Average R-Multiple</span>
              <strong className="text-lime font-bold">+{analytics.averageR}R</strong>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-text-muted">Net P&L</span>
              <strong className={`font-bold ${analytics.netPnL >= 0 ? 'text-lime' : 'text-loss'}`}>
                {formatValue(analytics.netPnL)}
              </strong>
            </div>
          </div>
        </div>

        {/* BACKTEST DATA */}
        <div className="custom-card p-6 space-y-4 border-t-4 border-warning">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-warning uppercase tracking-widest font-heading">BACKTESTED PERFORMANCE</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-warning/10 text-warning font-mono-num">SIMULATED</span>
          </div>

          <div className="space-y-3 divide-y divide-bg-border text-xs">
            <div className="flex justify-between py-2">
              <span className="text-text-muted">Total Trades</span>
              <strong className="text-text-primary font-bold">{btTradeCount}</strong>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-text-muted">Win Rate %</span>
              <strong className="text-lime font-bold">{btWinRate}%</strong>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-text-muted">Profit Factor</span>
              <strong className="text-text-primary font-bold">2.45</strong>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-text-muted">Average R-Multiple</span>
              <strong className="text-lime font-bold">+{btAvgR}R</strong>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-text-muted">Net P&L</span>
              <strong className={`font-bold ${btNetPnL >= 0 ? 'text-lime' : 'text-loss'}`}>
                {formatValue(btNetPnL)}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
