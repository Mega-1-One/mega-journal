'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Layers, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { calculateAnalyticsSummary } from '@/lib/calculations';

export default function PlaybookDetailPage() {
  const params = useParams();
  const { playbooks, strategies, filteredTrades, formatValue } = useApp();

  const playbookId = params.id as string;
  const playbook = playbooks.find((p) => p.id === playbookId) || playbooks[0];

  if (!playbook) return null;

  const parentStrategy = strategies.find((s) => s.id === playbook.strategyId);
  const pbTrades = filteredTrades.filter((t) => t.playbookId === playbook.id || t.setup === playbook.name);
  const analytics = calculateAnalyticsSummary(pbTrades);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-bg-border pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/playbooks"
            className="p-2 rounded-xl bg-bg-card hover:bg-bg-nested text-text-secondary hover:text-text-primary border border-bg-border transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-text-primary tracking-tight font-heading">{playbook.name}</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-lime/10 text-lime border border-lime/20 font-mono-num">
                {playbook.status}
              </span>
            </div>
            <p className="text-xs text-text-secondary">Parent Strategy: <strong className="text-lime">{parentStrategy?.name || 'ICT Concepts'}</strong></p>
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

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 font-mono-num">
        <div className="custom-card p-4">
          <span className="text-[10px] font-bold text-text-muted uppercase block font-heading mb-1">Trades</span>
          <span className="text-xl font-black text-text-primary font-heading">{analytics.totalTrades}</span>
        </div>
        <div className="custom-card p-4">
          <span className="text-[10px] font-bold text-text-muted uppercase block font-heading mb-1">Win Rate</span>
          <span className="text-xl font-black text-lime font-heading">{analytics.winRate}%</span>
        </div>
        <div className="custom-card p-4">
          <span className="text-[10px] font-bold text-text-muted uppercase block font-heading mb-1">Average R</span>
          <span className="text-xl font-black text-lime font-heading">+{analytics.averageR}R</span>
        </div>
        <div className="custom-card p-4">
          <span className="text-[10px] font-bold text-text-muted uppercase block font-heading mb-1">Profit Factor</span>
          <span className="text-xl font-black text-text-primary font-heading">{analytics.profitFactor}</span>
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

      {/* Execution Models Card */}
      <div className="custom-card p-6 space-y-4">
        <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-heading flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-lime" /> Execution Model Rules
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-bg-nested border border-bg-border space-y-1">
            <span className="text-[10px] text-text-muted font-bold uppercase font-heading block">Entry Model</span>
            <span className="font-semibold text-text-primary block">{playbook.entryModel || '50% FVG Retrace'}</span>
          </div>
          <div className="p-4 rounded-xl bg-bg-nested border border-bg-border space-y-1">
            <span className="text-[10px] text-text-muted font-bold uppercase font-heading block">Stop Loss Model</span>
            <span className="font-semibold text-text-primary block">{playbook.stopModel || 'Swing High/Low'}</span>
          </div>
          <div className="p-4 rounded-xl bg-bg-nested border border-bg-border space-y-1">
            <span className="text-[10px] text-text-muted font-bold uppercase font-heading block">Take Profit Model</span>
            <span className="font-semibold text-lime block">{playbook.targetModel || '1:3 R/R'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
