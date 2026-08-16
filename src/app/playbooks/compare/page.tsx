'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import Link from 'next/link';
import { ArrowLeft, BarChart2, Layers } from 'lucide-react';
import { calculateAnalyticsSummary } from '@/lib/calculations';

export default function PlaybooksComparePage() {
  const { playbooks, strategies, filteredTrades, formatValue } = useApp();

  const activePlaybooks = playbooks.filter((p) => p.status !== 'ARCHIVED');

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
            <h1 className="text-xl font-black text-text-primary tracking-tight font-heading flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-lime" /> Playbook Side-by-Side Comparison
            </h1>
            <p className="text-xs text-text-secondary">
              Compare your setup models by win rate, expectancy, and real net profit return.
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="custom-card p-6 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse font-mono-num">
          <thead>
            <tr className="border-b border-bg-border text-text-muted uppercase text-[10px] font-heading font-bold">
              <th className="py-3 px-4">Playbook</th>
              <th className="py-3 px-4">Parent Strategy</th>
              <th className="py-3 px-4">Session</th>
              <th className="py-3 px-4 text-center">Trades</th>
              <th className="py-3 px-4 text-center">Win Rate</th>
              <th className="py-3 px-4 text-center">Avg R</th>
              <th className="py-3 px-4 text-center">Profit Factor</th>
              <th className="py-3 px-4 text-center">Expectancy</th>
              <th className="py-3 px-4 text-right">Net P&L</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-bg-border">
            {activePlaybooks.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-text-muted font-medium">
                  No active playbooks found for comparison.
                </td>
              </tr>
            ) : (
              activePlaybooks.map((pb) => {
                const parentStrategy = strategies.find((s) => s.id === pb.strategyId);
                const pbTrades = filteredTrades.filter((t) => t.playbookId === pb.id || t.setup === pb.name);
                const analytics = calculateAnalyticsSummary(pbTrades);

                return (
                  <tr key={pb.id} className="hover:bg-bg-nested transition-colors">
                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <Link href={`/playbooks/${pb.id}`} className="font-bold text-text-primary font-heading hover:text-lime">
                          {pb.name}
                        </Link>
                        <span className="text-[10px] text-text-muted block font-sans">{pb.symbols}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-text-secondary font-sans font-semibold">
                      {parentStrategy?.name || 'ICT Concepts'}
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 rounded bg-bg-nested border border-bg-border text-text-secondary text-[10px]">
                        {pb.sessions}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-text-primary">{analytics.totalTrades}</td>
                    <td className="py-4 px-4 text-center font-bold text-lime">{analytics.winRate}%</td>
                    <td className="py-4 px-4 text-center font-bold text-text-primary">+{analytics.averageR}R</td>
                    <td className="py-4 px-4 text-center font-bold text-text-secondary">{analytics.profitFactor}</td>
                    <td className="py-4 px-4 text-center font-bold text-lime">${analytics.expectancy}</td>
                    <td className={`py-4 px-4 text-right font-bold ${analytics.netPnL >= 0 ? 'text-lime' : 'text-loss'}`}>
                      {formatValue(analytics.netPnL)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
