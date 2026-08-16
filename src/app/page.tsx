'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Plus, Flame, ShieldCheck, CheckCircle2, AlertTriangle, BookMarked, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function DashboardPage() {
  const { filteredTrades, analytics, adherenceComparison, activeAccountData, formatValue, setIsQuickAddOpen, strategies, playbooks } = useApp();

  const startingBalance = activeAccountData?.startingBalance || 10000;
  const currentBalance = activeAccountData ? activeAccountData.currentBalance : startingBalance + analytics.netPnL;

  // Build Equity Curve
  let runningBalance = startingBalance;
  const equityCurveData = [
    { date: 'Start', balance: startingBalance, pnl: 0 },
    ...filteredTrades
      .slice()
      .sort((a, b) => new Date(a.entryTime).getTime() - new Date(b.entryTime).getTime())
      .map((t) => {
        runningBalance += t.netPnL;
        return {
          date: new Date(t.entryTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          balance: Math.round(runningBalance * 100) / 100,
          pnl: t.netPnL,
        };
      }),
  ];

  // Win/Loss Pie Data
  const pieData = [
    { name: 'Wins', value: analytics.winningTrades, color: '#C8FF00' },
    { name: 'Losses', value: analytics.losingTrades, color: '#EF4444' },
    { name: 'Breakeven', value: analytics.breakEvenTrades, color: '#6F767D' },
  ];

  const topStrategy = strategies[0] || { name: 'ICT Concepts', winRate: 75.0 };
  const topPlaybook = playbooks[0] || { name: 'London Liquidity Sweep', winRate: 80.0 };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight font-heading">Dashboard</h1>
          <p className="text-xs text-text-secondary">Your trading performance at a glance.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="btn-primary-lime text-xs px-4 py-2 rounded-xl shadow-glow flex items-center gap-1.5 font-heading font-black"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Trade (N)</span>
          </button>
        </div>
      </div>

      {/* Hero Accent Performance Card */}
      <div className="custom-card p-6 border-l-4 border-lime bg-bg-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-xs font-bold text-lime uppercase tracking-widest font-heading">NET PERFORMANCE</span>
          <div className="flex items-baseline gap-3">
            <span className={`text-4xl font-black font-mono-num font-heading ${analytics.netPnL >= 0 ? 'text-lime' : 'text-loss'}`}>
              {formatValue(analytics.netPnL)}
            </span>
            <span className="text-xs text-text-secondary font-mono-num">
              {analytics.netPnL >= 0 ? '+' : ''}
              {Math.round((analytics.netPnL / startingBalance) * 10000) / 100}% Return
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono-num border-t md:border-t-0 md:border-l border-bg-border pt-4 md:pt-0 md:pl-6">
          <div>
            <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Profit Factor</span>
            <span className="text-lg font-bold text-text-primary">{analytics.profitFactor}</span>
          </div>
          <div>
            <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Win Rate</span>
            <span className="text-lg font-bold text-lime">{analytics.winRate}%</span>
          </div>
          <div>
            <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Average R</span>
            <span className="text-lg font-bold text-text-primary">+{analytics.averageR}R</span>
          </div>
          <div>
            <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Max Drawdown</span>
            <span className="text-lg font-bold text-loss">{analytics.maxDrawdownPercent}%</span>
          </div>
        </div>
      </div>

      {/* PHASE 3 STRATEGY & ADHERENCE INSIGHTS BAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="custom-card p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Top Performing Strategy</span>
            <span className="text-sm font-bold text-text-primary font-heading">{topStrategy.name}</span>
          </div>
          <Link href="/strategies" className="p-2 rounded-xl bg-lime/10 text-lime hover:bg-lime/20 transition-colors">
            <BookMarked className="w-4 h-4" />
          </Link>
        </div>

        <div className="custom-card p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Best Playbook Setup</span>
            <span className="text-sm font-bold text-lime font-heading">{topPlaybook.name}</span>
          </div>
          <Link href="/playbooks" className="p-2 rounded-xl bg-lime/10 text-lime hover:bg-lime/20 transition-colors">
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="custom-card p-4 flex items-center justify-between font-mono-num">
          <div className="space-y-0.5">
            <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Rules Followed Win Rate</span>
            <span className="text-sm font-bold text-lime font-heading">{adherenceComparison.followed.winRate}%</span>
          </div>
          <div className="p-2 rounded-xl bg-lime/10 text-lime">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 font-mono-num">
        <div className="custom-card p-4">
          <span className="text-[10px] font-bold text-text-muted uppercase block font-heading mb-1">Account Balance</span>
          <span className="text-xl font-black text-text-primary font-heading">{formatValue(currentBalance)}</span>
        </div>
        <div className="custom-card p-4">
          <span className="text-[10px] font-bold text-text-muted uppercase block font-heading mb-1">Total Trades</span>
          <span className="text-xl font-black text-text-primary font-heading">{analytics.totalTrades}</span>
        </div>
        <div className="custom-card p-4">
          <span className="text-[10px] font-bold text-text-muted uppercase block font-heading mb-1">Average Win</span>
          <span className="text-xl font-black text-lime font-heading">${analytics.averageWin}</span>
        </div>
        <div className="custom-card p-4">
          <span className="text-[10px] font-bold text-text-muted uppercase block font-heading mb-1">Average Loss</span>
          <span className="text-xl font-black text-loss font-heading">-${analytics.averageLoss}</span>
        </div>
        <div className="custom-card p-4">
          <span className="text-[10px] font-bold text-text-muted uppercase block font-heading mb-1">Expectancy</span>
          <span className="text-xl font-black text-lime font-heading">${analytics.expectancy}</span>
        </div>
        <div className="custom-card p-4">
          <span className="text-[10px] font-bold text-text-muted uppercase block font-heading mb-1">Win Streak</span>
          <span className="text-xl font-black text-lime font-heading flex items-center gap-1">
            <Flame className="w-4 h-4 fill-lime" /> {analytics.currentWinStreak}
          </span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 custom-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-heading">Account Equity Growth Curve</h3>
            <span className="text-xs text-text-muted font-mono-num font-heading">Starting: ${startingBalance.toLocaleString()}</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityCurveData}>
                <defs>
                  <linearGradient id="equityLimeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C8FF00" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C8FF00" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#6F767D" fontSize={10} tickLine={false} />
                <YAxis stroke="#6F767D" fontSize={10} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#15191D', borderColor: '#262B30', borderRadius: '8px', color: '#F5F5F5', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="balance" stroke="#C8FF00" strokeWidth={2.5} fillOpacity={1} fill="url(#equityLimeGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 custom-card p-5 flex flex-col justify-between space-y-4">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-heading">Win / Loss Distribution</h3>
          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#15191D', borderColor: '#262B30', color: '#F5F5F5', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono-num">
            <div className="p-2 rounded-xl bg-bg-nested border border-bg-border">
              <span className="text-[10px] text-text-muted block font-heading">Wins</span>
              <span className="font-bold text-lime">{analytics.winningTrades}</span>
            </div>
            <div className="p-2 rounded-xl bg-bg-nested border border-bg-border">
              <span className="text-[10px] text-text-muted block font-heading">Losses</span>
              <span className="font-bold text-loss">{analytics.losingTrades}</span>
            </div>
            <div className="p-2 rounded-xl bg-bg-nested border border-bg-border">
              <span className="text-[10px] text-text-muted block font-heading">Breakeven</span>
              <span className="font-bold text-text-muted">{analytics.breakEvenTrades}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
