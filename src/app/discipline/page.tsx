'use client';

import React, { useState } from 'react';
import { DEMO_TRADING_RULES } from '@/lib/store';
import { ShieldCheck, CheckCircle2, Flame } from 'lucide-react';

export default function DisciplinePage() {
  const [rules, setRules] = useState(DEMO_TRADING_RULES);

  const toggleRuleCompletion = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, streak: r.streak + 1 } : r))
    );
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight font-heading flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-lime" /> Trading Rules & Discipline
          </h1>
          <p className="text-xs text-text-secondary">Track rule adherence streaks and eliminate execution mistakes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map((rule) => (
          <div key={rule.id} className="custom-card p-5 flex items-center justify-between">
            <div className="space-y-1 pr-4">
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-lime/10 text-lime border border-lime/20 font-heading">
                {rule.category}
              </span>
              <p className="text-xs font-bold text-text-primary leading-snug font-heading">{rule.ruleText}</p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-right font-mono-num">
                <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Streak</span>
                <span className="text-xs font-extrabold text-lime flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-lime text-lime" /> {rule.streak} Days
                </span>
              </div>

              <button
                onClick={() => toggleRuleCompletion(rule.id)}
                className="p-2.5 rounded-xl bg-lime/15 hover:bg-lime/25 text-lime border border-lime/30 transition-all"
                title="Mark Followed Today"
              >
                <CheckCircle2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
