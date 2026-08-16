'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ShieldCheck, Plus, Flame, CheckCircle2, AlertTriangle, Layers, Trophy } from 'lucide-react';

export default function DisciplinePage() {
  const { rules, addRule } = useApp();
  const [newRuleText, setNewRuleText] = useState('');
  const [category, setCategory] = useState<'PRE_TRADE' | 'SETUP' | 'ENTRY' | 'RISK' | 'MANAGEMENT' | 'EXIT' | 'POST_TRADE' | 'PSYCHOLOGY'>('RISK');

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleText.trim()) return;

    addRule({
      id: `rule-${Date.now()}`,
      ruleName: newRuleText,
      ruleText: newRuleText,
      category,
      isRequired: true,
      priority: rules.length + 1,
      streak: 0,
      status: 'ACTIVE',
    });

    setNewRuleText('');
  };

  const activeRules = rules.filter((r) => r.status !== 'ARCHIVED');
  const totalStreak = activeRules.reduce((acc, r) => acc + (r.streak || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight font-heading flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-lime" /> Trading Rules & Discipline Engine
          </h1>
          <p className="text-xs text-text-secondary">
            Enforce non-negotiable execution rules to eliminate emotional mistakes and protect capital.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono-num">
          <div className="px-3 py-1.5 rounded-xl bg-lime/10 border border-lime/20 text-lime text-xs font-bold font-heading flex items-center gap-1.5">
            <Flame className="w-4 h-4 fill-lime" /> Total Streak: {totalStreak} Days
          </div>
        </div>
      </div>

      {/* Add Rule Form */}
      <div className="custom-card p-5 space-y-4">
        <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-heading">Add Execution Rule</h3>
        <form onSubmit={handleAddRule} className="flex flex-col sm:flex-row gap-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            className="bg-bg-main border border-bg-border rounded-xl px-3 py-2 text-xs text-text-primary focus:border-lime focus:outline-none"
          >
            <option value="PRE_TRADE">Pre-Trade</option>
            <option value="SETUP">Setup</option>
            <option value="ENTRY">Entry</option>
            <option value="RISK">Risk Management</option>
            <option value="MANAGEMENT">Trade Management</option>
            <option value="EXIT">Exit</option>
            <option value="PSYCHOLOGY">Psychology</option>
          </select>

          <input
            type="text"
            value={newRuleText}
            onChange={(e) => setNewRuleText(e.target.value)}
            placeholder="e.g. Never risk more than 1% per position"
            className="flex-1 bg-bg-main border border-bg-border rounded-xl px-3 py-2 text-xs text-text-primary placeholder-text-muted focus:border-lime focus:outline-none"
            required
          />

          <button
            type="submit"
            className="btn-primary-lime text-xs px-4 py-2 rounded-xl shadow-glow flex items-center justify-center gap-1.5 font-heading font-black"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Add Rule
          </button>
        </form>
      </div>

      {/* Active Rules List */}
      <div className="custom-card p-6 space-y-4">
        <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-heading">Active Rulebook ({activeRules.length})</h3>
        <div className="space-y-3">
          {activeRules.map((rule) => (
            <div
              key={rule.id}
              className="p-4 rounded-xl bg-bg-nested border border-bg-border flex items-center justify-between gap-4 transition-all hover:border-lime/40"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-lime/10 text-lime border border-lime/20 flex items-center justify-center font-bold font-mono-num text-xs">
                  P{rule.priority}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary font-heading">{rule.ruleName || rule.ruleText}</h4>
                  <span className="text-[10px] text-text-muted uppercase font-heading">{rule.category}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 font-mono-num text-xs">
                <span className="text-lime font-bold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-lime" /> {rule.streak || 0} Day Streak
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
