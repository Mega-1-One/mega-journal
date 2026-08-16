'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Link from 'next/link';
import {
  Layers,
  Plus,
  ArrowRight,
  ShieldCheck,
  BarChart2,
  X,
  CheckCircle2,
  Archive,
} from 'lucide-react';
import { calculateAnalyticsSummary } from '@/lib/calculations';

export default function PlaybooksPage() {
  const { playbooks, strategies, addPlaybook, archivePlaybook, filteredTrades, formatValue } = useApp();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [strategyId, setStrategyId] = useState(strategies[0]?.id || '');
  const [description, setDescription] = useState('');
  const [market, setMarket] = useState('Forex & Gold');
  const [symbols, setSymbols] = useState('XAUUSD, EURUSD');
  const [sessions, setSessions] = useState('LONDON');
  const [timeframes, setTimeframes] = useState('15m / 5m');
  const [entryModel, setEntryModel] = useState('50% FVG Retrace');
  const [stopModel, setStopModel] = useState('Swing High / Low');
  const [targetModel, setTargetModel] = useState('1:3 R/R');
  const [minRiskReward, setMinRiskReward] = useState('2.0');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !strategyId) return;

    addPlaybook({
      id: `pb-${Date.now()}`,
      strategyId,
      name,
      description,
      market,
      symbols,
      sessions,
      timeframes,
      entryModel,
      stopModel,
      targetModel,
      minRiskReward: Number(minRiskReward) || 2.0,
      status: 'ACTIVE',
      rules: [],
    });

    setName('');
    setDescription('');
    setIsCreateOpen(false);
  };

  const activePlaybooks = playbooks.filter((p) => p.status !== 'ARCHIVED');

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight font-heading flex items-center gap-2">
            <Layers className="w-5 h-5 text-lime" /> Playbook Management Workspace
          </h1>
          <p className="text-xs text-text-secondary">
            Repeatable trading setups and execution models attached to your core strategies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/playbooks/compare"
            className="btn-secondary text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 font-heading font-bold"
          >
            <BarChart2 className="w-4 h-4 text-lime" />
            <span>Compare Playbooks</span>
          </Link>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="btn-primary-lime text-xs px-4 py-2 rounded-xl shadow-glow flex items-center gap-1.5 font-heading font-black"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Playbook</span>
          </button>
        </div>
      </div>

      {/* Playbooks Grid */}
      {activePlaybooks.length === 0 ? (
        <div className="custom-card p-12 text-center space-y-4 max-w-lg mx-auto my-12">
          <div className="w-12 h-12 rounded-2xl bg-lime/15 text-lime border border-lime/30 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-text-primary font-heading">No playbooks yet</h3>
            <p className="text-xs text-text-secondary">
              Create a playbook inside one of your strategies to define your exact setup models.
            </p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="btn-primary-lime text-xs px-5 py-2.5 rounded-xl shadow-glow inline-flex items-center gap-2 font-heading font-black"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Playbook</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activePlaybooks.map((pb) => {
            const parentStrategy = strategies.find((s) => s.id === pb.strategyId);
            const pbTrades = filteredTrades.filter((t) => t.playbookId === pb.id || t.setup === pb.name);
            const analytics = calculateAnalyticsSummary(pbTrades);

            return (
              <div key={pb.id} className="custom-card p-6 flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-lime uppercase tracking-widest block font-heading">
                        STRATEGY: {parentStrategy?.name || 'ICT Concepts'}
                      </span>
                      <h3 className="text-lg font-bold text-text-primary font-heading tracking-tight">{pb.name}</h3>
                      <p className="text-xs text-text-secondary line-clamp-2">{pb.description}</p>
                    </div>

                    <button
                      onClick={() => archivePlaybook(pb.id)}
                      className="text-text-muted hover:text-loss p-1.5 rounded-lg hover:bg-bg-nested transition-colors"
                      title="Soft Archive Playbook"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 text-[11px] text-text-muted font-mono-num">
                    <span className="px-2 py-0.5 rounded bg-bg-nested border border-bg-border text-text-secondary">
                      Symbols: {pb.symbols}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-bg-nested border border-bg-border text-text-secondary">
                      Session: {pb.sessions}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-bg-nested border border-bg-border text-text-secondary">
                      Min R/R: {pb.minRiskReward}
                    </span>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-4 gap-2 p-4 rounded-xl bg-bg-nested border border-bg-border font-mono-num text-center">
                  <div>
                    <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Trades</span>
                    <span className="text-sm font-bold text-text-primary">{analytics.totalTrades}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Win Rate</span>
                    <span className="text-sm font-bold text-lime">{analytics.winRate}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Avg R</span>
                    <span className="text-sm font-bold text-text-primary">+{analytics.averageR}R</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Net P&L</span>
                    <span className={`text-sm font-bold ${analytics.netPnL >= 0 ? 'text-lime' : 'text-loss'}`}>
                      {formatValue(analytics.netPnL)}
                    </span>
                  </div>
                </div>

                {/* Link */}
                <div className="pt-2 border-t border-bg-border flex items-center justify-between">
                  <span className="text-[10px] text-text-muted font-mono-num">
                    Target Model: <strong className="text-text-primary">{pb.targetModel || '1:2 R/R'}</strong>
                  </span>
                  <Link
                    href={`/playbooks/${pb.id}`}
                    className="text-xs font-bold text-lime hover:underline flex items-center gap-1 font-heading"
                  >
                    <span>View Playbook Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Playbook Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-bg-border rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-bg-border flex items-center justify-between bg-bg-card">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-lime/15 text-lime border border-lime/30 flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-text-primary tracking-tight font-heading">Create Playbook</h3>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="text-text-muted hover:text-text-primary p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-text-secondary block mb-1">Parent Strategy</label>
                <select
                  value={strategyId}
                  onChange={(e) => setStrategyId(e.target.value)}
                  className="w-full bg-bg-main border border-bg-border rounded-xl px-3 py-2 text-text-primary focus:border-lime focus:outline-none"
                >
                  {strategies.map((s) => (
                    <option key={s.id} value={s.id} className="bg-bg-card text-text-primary">
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-text-secondary block mb-1">Playbook Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. London Liquidity Sweep"
                  className="w-full bg-bg-main border border-bg-border rounded-xl px-3 py-2 text-text-primary focus:border-lime focus:outline-none font-heading font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-text-secondary block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Exact setup execution conditions..."
                  className="w-full bg-bg-main border border-bg-border rounded-xl px-3 py-2 text-text-primary focus:border-lime focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-text-secondary block mb-1">Symbols</label>
                  <input
                    type="text"
                    value={symbols}
                    onChange={(e) => setSymbols(e.target.value)}
                    className="w-full bg-bg-main border border-bg-border rounded-xl px-3 py-2 text-text-primary focus:border-lime focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-text-secondary block mb-1">Session</label>
                  <input
                    type="text"
                    value={sessions}
                    onChange={(e) => setSessions(e.target.value)}
                    className="w-full bg-bg-main border border-bg-border rounded-xl px-3 py-2 text-text-primary focus:border-lime focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-text-secondary block mb-1">Min R/R</label>
                  <input
                    type="number"
                    step="0.1"
                    value={minRiskReward}
                    onChange={(e) => setMinRiskReward(e.target.value)}
                    className="w-full bg-bg-main border border-bg-border rounded-xl px-3 py-2 text-text-primary focus:border-lime focus:outline-none font-mono-num"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-bg-border">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-nested"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-lime text-xs px-5 py-2.5 rounded-xl shadow-glow flex items-center gap-1.5 font-heading font-black"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Playbook</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
