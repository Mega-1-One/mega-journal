'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  BookMarked,
  ShieldCheck,
  TrendingUp,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Plus,
} from 'lucide-react';
import { calculateAnalyticsSummary, calculateAdherencePerformance } from '@/lib/calculations';

export default function StrategyDetailPage() {
  const params = useParams();
  const { strategies, playbooks, filteredTrades, formatValue } = useApp();

  const strategyId = params.id as string;
  const strategy = strategies.find((s) => s.id === strategyId) || strategies[0];

  if (!strategy) return null;

  const strategyTrades = filteredTrades.filter((t) => t.strategyId === strategy.id || t.setup?.includes(strategy.name));
  const analytics = calculateAnalyticsSummary(strategyTrades);
  const adherence = calculateAdherencePerformance(strategyTrades);
  const strategyPlaybooks = playbooks.filter((p) => p.strategyId === strategy.id);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-bg-border pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/strategies"
            className="p-2 rounded-xl bg-bg-card hover:bg-bg-nested text-text-secondary hover:text-text-primary border border-bg-border transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-text-primary tracking-tight font-heading">{strategy.name}</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-lime/10 text-lime border border-lime/20 font-mono-num">
                {strategy.status}
              </span>
            </div>
            <p className="text-xs text-text-secondary line-clamp-1">{strategy.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono-num">
          <span className={`text-xl font-black ${analytics.netPnL >= 0 ? 'text-lime' : 'text-loss'}`}>
            {formatValue(analytics.netPnL)}
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-lime/10 text-lime border border-lime/20 font-bold text-xs font-heading">
            {analytics.winRate}% Win Rate
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 font-mono-num">
        <div className="custom-card p-4">
          <span className="text-[10px] font-bold text-text-muted uppercase block font-heading mb-1">Total Trades</span>
          <span className="text-xl font-black text-text-primary font-heading">{analytics.totalTrades}</span>
        </div>
        <div className="custom-card p-4">
          <span className="text-[10px] font-bold text-text-muted uppercase block font-heading mb-1">Win Rate</span>
          <span className="text-xl font-black text-lime font-heading">{analytics.winRate}%</span>
        </div>
        <div className="custom-card p-4">
          <span className="text-[10px] font-bold text-text-muted uppercase block font-heading mb-1">Profit Factor</span>
          <span className="text-xl font-black text-text-primary font-heading">{analytics.profitFactor}</span>
        </div>
        <div className="custom-card p-4">
          <span className="text-[10px] font-bold text-text-muted uppercase block font-heading mb-1">Average R</span>
          <span className="text-xl font-black text-lime font-heading">+{analytics.averageR}R</span>
        </div>
        <div className="custom-card p-4">
          <span className="text-[10px] font-bold text-text-muted uppercase block font-heading mb-1">Expectancy</span>
          <span className="text-xl font-black text-lime font-heading">${analytics.expectancy}</span>
        </div>
        <div className="custom-card p-4">
          <span className="text-[10px] font-bold text-text-muted uppercase block font-heading mb-1">Max Drawdown</span>
          <span className="text-xl font-black text-loss font-heading">{analytics.maxDrawdownPercent}%</span>
        </div>
      </div>

      {/* ADHERENCE VS PERFORMANCE COMPARISON */}
      <div className="custom-card p-6 space-y-4 border-l-4 border-lime">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-lime" />
            <h3 className="text-base font-bold text-text-primary font-heading tracking-tight">
              Rule Adherence vs Performance Split
            </h3>
          </div>
          <span className="text-xs text-text-muted font-mono-num font-heading">Real Database Proof</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rules Followed */}
          <div className="p-5 rounded-2xl bg-lime/5 border border-lime/20 space-y-3 font-mono-num">
            <div className="flex items-center justify-between border-b border-lime/20 pb-2">
              <span className="text-xs font-bold text-lime font-heading flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> RULES FOLLOWED ({adherence.followed.count} Trades)
              </span>
              <span className="text-xs font-bold text-lime">Fully Compliant</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-1">
              <div>
                <span className="text-[10px] text-text-muted block font-heading">Win Rate</span>
                <span className="text-base font-black text-lime">{adherence.followed.winRate}%</span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted block font-heading">Avg R</span>
                <span className="text-base font-black text-text-primary">+{adherence.followed.averageR}R</span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted block font-heading">Profit Factor</span>
                <span className="text-base font-black text-text-primary">{adherence.followed.profitFactor}</span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted block font-heading">Net P&L</span>
                <span className="text-base font-black text-lime">{formatValue(adherence.followed.netPnL)}</span>
              </div>
            </div>
          </div>

          {/* Rules Violated */}
          <div className="p-5 rounded-2xl bg-loss/5 border border-loss/20 space-y-3 font-mono-num">
            <div className="flex items-center justify-between border-b border-loss/20 pb-2">
              <span className="text-xs font-bold text-loss font-heading flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> RULES VIOLATED ({adherence.violated.count} Trades)
              </span>
              <span className="text-xs font-bold text-loss">Non-Compliant</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-1">
              <div>
                <span className="text-[10px] text-text-muted block font-heading">Win Rate</span>
                <span className="text-base font-black text-loss">{adherence.violated.winRate}%</span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted block font-heading">Avg R</span>
                <span className="text-base font-black text-text-primary">+{adherence.violated.averageR}R</span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted block font-heading">Profit Factor</span>
                <span className="text-base font-black text-text-primary">{adherence.violated.profitFactor}</span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted block font-heading">Net P&L</span>
                <span className="text-base font-black text-loss">{formatValue(adherence.violated.netPnL)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Linked Playbooks List */}
      <div className="custom-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-heading flex items-center gap-2">
            <Layers className="w-4 h-4 text-lime" /> Strategy Playbooks ({strategyPlaybooks.length})
          </h3>
          <Link href="/playbooks" className="text-xs font-bold text-lime hover:underline font-heading">
            Manage Playbooks →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {strategyPlaybooks.map((pb) => (
            <div key={pb.id} className="p-4 rounded-xl bg-bg-nested border border-bg-border space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-text-primary font-heading">{pb.name}</h4>
                <span className="text-[10px] font-bold text-lime bg-lime/10 px-2 py-0.5 rounded border border-lime/20 font-mono-num">
                  Min {pb.minRiskReward} R/R
                </span>
              </div>
              <p className="text-xs text-text-secondary">{pb.description}</p>
              <div className="flex items-center justify-between text-[11px] text-text-muted font-mono-num pt-2 border-t border-bg-border">
                <span>Symbols: {pb.symbols}</span>
                <span>Session: {pb.sessions}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Strategy Trades */}
      <div className="custom-card p-5 space-y-4">
        <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-heading">Recent Strategy Trade History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono-num">
            <thead>
              <tr className="border-b border-bg-border text-text-muted uppercase text-[10px] font-heading font-bold">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Symbol</th>
                <th className="py-2.5 px-3">Direction</th>
                <th className="py-2.5 px-3">Entry / Exit</th>
                <th className="py-2.5 px-3">R-Multiple</th>
                <th className="py-2.5 px-3 text-right">Net P&L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bg-border">
              {strategyTrades.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-muted font-medium">
                    No trades logged for this strategy yet.
                  </td>
                </tr>
              ) : (
                strategyTrades.map((t) => (
                  <tr key={t.id} className="hover:bg-bg-nested transition-colors">
                    <td className="py-3 px-3 text-text-secondary">
                      {new Date(t.entryTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3 px-3 font-bold text-text-primary font-heading">{t.symbol}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          t.direction === 'LONG' ? 'bg-lime/10 text-lime border border-lime/20' : 'bg-loss/10 text-loss border border-loss/20'
                        }`}
                      >
                        {t.direction}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-text-secondary">
                      {t.entryPrice} → {t.exitPrice}
                    </td>
                    <td className="py-3 px-3 font-bold text-lime">+{t.rMultiple}R</td>
                    <td className={`py-3 px-3 text-right font-bold ${t.netPnL >= 0 ? 'text-lime' : 'text-loss'}`}>
                      {formatValue(t.netPnL)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
