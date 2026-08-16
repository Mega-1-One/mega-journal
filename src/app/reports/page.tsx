'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { BarChart3 } from 'lucide-react';

export default function ReportsPage() {
  const { analytics } = useApp();

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-black text-text-primary tracking-tight font-heading flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-lime" /> Performance Reports
        </h1>
        <p className="text-xs text-text-secondary">Institutional quantitative risk metrics and expectancy ratios</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono-num">
        <div className="custom-card p-5">
          <span className="text-[10px] font-bold text-text-muted uppercase block font-heading">Sharpe Ratio</span>
          <span className="text-2xl font-black text-lime font-heading">{analytics.sharpeRatio}</span>
        </div>
        <div className="custom-card p-5">
          <span className="text-[10px] font-bold text-text-muted uppercase block font-heading">Sortino Ratio</span>
          <span className="text-2xl font-black text-lime font-heading">{analytics.sortinoRatio}</span>
        </div>
        <div className="custom-card p-5">
          <span className="text-[10px] font-bold text-text-muted uppercase block font-heading">Calmar Ratio</span>
          <span className="text-2xl font-black text-text-primary font-heading">{analytics.calmarRatio}</span>
        </div>
        <div className="custom-card p-5">
          <span className="text-[10px] font-bold text-text-muted uppercase block font-heading">Payoff Ratio</span>
          <span className="text-2xl font-black text-text-primary font-heading">{analytics.payoffRatio}</span>
        </div>
      </div>
    </div>
  );
}
