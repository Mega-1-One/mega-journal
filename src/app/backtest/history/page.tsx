'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import Link from 'next/link';
import { ArrowLeft, History, Copy, Eye, Plus, FlaskConical } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BacktestHistoryPage() {
  const router = useRouter();
  const { backtestSessions, duplicateBacktestSession, formatValue } = useApp();

  const handleDuplicate = (id: string) => {
    const newId = duplicateBacktestSession(id);
    if (newId) router.push('/backtest');
  };

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
              <History className="w-5 h-5 text-lime" /> Backtest Session Library
            </h1>
            <p className="text-xs text-text-secondary">Historical backtest records and duplicated testing environments.</p>
          </div>
        </div>

        <Link
          href="/backtest"
          className="btn-primary-lime text-xs px-4 py-2 rounded-xl shadow-glow flex items-center gap-1.5 font-heading font-black"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Backtest Session</span>
        </Link>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono-num">
        {backtestSessions.map((sess) => {
          const tradeCount = sess.trades.length;
          const netPnL = sess.trades.reduce((acc, t) => acc + t.netPnL, 0);
          const wins = sess.trades.filter((t) => t.isWin).length;
          const winRate = tradeCount > 0 ? Math.round((wins / tradeCount) * 100) : 0;

          return (
            <div key={sess.id} className="custom-card p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-text-primary font-heading tracking-tight">{sess.name}</h3>
                    <span className="text-xs text-text-muted font-medium block">
                      {sess.symbol} ({sess.timeframe}) • Started {sess.startDate}
                    </span>
                  </div>

                  <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-lime/10 text-lime border border-lime/30 font-heading">
                    {sess.status}
                  </span>
                </div>

                {/* Metrics Bar */}
                <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-bg-nested border border-bg-border text-xs">
                  <div>
                    <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Trades</span>
                    <span className="text-sm font-bold text-text-primary">{tradeCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Win Rate</span>
                    <span className="text-sm font-bold text-lime">{winRate}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Net P&L</span>
                    <span className={`text-sm font-bold ${netPnL >= 0 ? 'text-lime' : 'text-loss'}`}>
                      {formatValue(netPnL)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-bg-border flex items-center justify-end gap-3 text-xs font-heading font-bold">
                <button
                  onClick={() => handleDuplicate(sess.id)}
                  className="px-3 py-1.5 rounded-xl bg-bg-nested hover:bg-bg-card border border-bg-border text-text-secondary hover:text-text-primary flex items-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Duplicate</span>
                </button>
                <Link
                  href="/backtest"
                  className="btn-primary-lime px-3.5 py-1.5 rounded-xl shadow-glow flex items-center gap-1.5 text-xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Open Lab</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
