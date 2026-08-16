'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { BookMarked, Plus, CheckSquare } from 'lucide-react';

export default function StrategiesPage() {
  const { strategies, filteredTrades, formatValue, addStrategy } = useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [market, setMarket] = useState('Forex & Indices');
  const [timeframe, setTimeframe] = useState('15m / 5m');
  const [session, setSession] = useState('London (02:00 - 05:00 EST)');
  const [description, setDescription] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    addStrategy({
      id: `strat-${Date.now()}`,
      name,
      market,
      timeframe,
      session,
      description,
      rules: ['Market structure confirmed', 'Risk under 1%', 'Take profit at key liquidity level'],
    });
    setName('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight font-heading flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-lime" /> Strategy Playbooks
          </h1>
          <p className="text-xs text-text-secondary">Quantify your edge and execution rules by setup</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary-lime text-xs px-4 py-2 rounded-lg shadow flex items-center gap-1.5 font-heading font-black"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Create Playbook
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {strategies.map((strat) => {
          const stratTrades = filteredTrades.filter((t) => t.strategyId === strat.id);
          const total = stratTrades.length;
          const wins = stratTrades.filter((t) => t.isWin).length;
          const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
          const netPnL = stratTrades.reduce((acc, t) => acc + t.netPnL, 0);

          return (
            <div key={strat.id} className="custom-card p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-text-primary font-heading">{strat.name}</h3>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-lime/10 text-lime border border-lime/20 font-heading">
                    {strat.timeframe}
                  </span>
                </div>
                <p className="text-xs text-text-secondary line-clamp-2">{strat.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-bg-nested p-3 rounded-lg border border-bg-border text-xs font-mono-num">
                <div>
                  <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Trades</span>
                  <span className="text-text-primary font-bold">{total}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Win Rate</span>
                  <span className="text-lime font-bold">{winRate}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Net P&L</span>
                  <span className={`font-bold ${netPnL >= 0 ? 'text-lime' : 'text-loss'}`}>
                    {formatValue(netPnL)}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-2 font-heading">
                  Execution Rules
                </span>
                <div className="space-y-1.5 text-xs text-text-secondary">
                  {strat.rules.map((rule, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckSquare className="w-3.5 h-3.5 text-lime flex-shrink-0" />
                      <span className="truncate">{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-bg-border rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-text-primary font-heading">Create Strategy Playbook</h3>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="text-text-secondary block mb-1">Strategy Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. ICT Silver Bullet"
                  className="w-full bg-bg-card border border-bg-border rounded-lg p-2.5 text-text-primary"
                  required
                />
              </div>
              <div>
                <label className="text-text-secondary block mb-1">Market & Instruments</label>
                <input
                  type="text"
                  value={market}
                  onChange={(e) => setMarket(e.target.value)}
                  className="w-full bg-bg-card border border-bg-border rounded-lg p-2.5 text-text-primary"
                />
              </div>
              <div>
                <label className="text-text-secondary block mb-1">Description & Thesis</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-bg-card border border-bg-border rounded-lg p-2.5 text-text-primary resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-text-muted hover:text-text-primary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-lime text-xs px-4 py-2 rounded-lg font-heading font-black">
                  Save Strategy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
