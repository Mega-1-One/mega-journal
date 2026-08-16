'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Link from 'next/link';
import {
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Award,
  Calendar,
  Wallet,
  Calculator,
  ArrowRight,
} from 'lucide-react';
import { calculateAccountRiskStatus, calculatePreTradeRisk } from '@/lib/calculations';

export default function PropFirmPage() {
  const { activeAccountData, filteredTrades, formatValue, accounts } = useApp();
  const [selectedAccName, setSelectedAccName] = useState(activeAccountData?.name || accounts[0]?.name);

  // Pre-Trade Risk Checker State
  const [simEntry, setSimEntry] = useState('2420.00');
  const [simSL, setSimSL] = useState('2410.00');
  const [simQty, setSimQty] = useState('1.0');
  const [simDirection, setSimDirection] = useState<'LONG' | 'SHORT'>('LONG');

  const targetAcc = accounts.find((a) => a.name === selectedAccName) || activeAccountData || accounts[0];
  const riskStatus = calculateAccountRiskStatus(targetAcc, filteredTrades);

  const simCheck = calculatePreTradeRisk(
    targetAcc,
    Number(simEntry) || 0,
    Number(simSL) || 0,
    Number(simQty) || 1,
    simDirection
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight font-heading flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-lime" /> Prop Firm Risk & Challenge Management
          </h1>
          <p className="text-xs text-text-secondary">
            Real-time daily loss monitoring, peak drawdown tracking, and pre-trade risk warnings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Account Selector */}
          <div className="flex items-center gap-1.5 bg-bg-card border border-bg-border rounded-xl px-3 py-1.5 text-xs font-heading font-bold">
            <Wallet className="w-3.5 h-3.5 text-lime" />
            <select
              value={selectedAccName}
              onChange={(e) => setSelectedAccName(e.target.value)}
              className="bg-transparent text-text-primary focus:outline-none cursor-pointer"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.name} className="bg-bg-card text-text-primary">
                  {a.name} ({a.firmName || 'Prop Firm'})
                </option>
              ))}
            </select>
          </div>

          <Link
            href={`/accounts/${targetAcc.id}/risk`}
            className="btn-primary-lime text-xs px-4 py-2 rounded-xl shadow-glow flex items-center gap-1.5 font-heading font-black"
          >
            <span>Configure Risk Rules</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* HERO RISK RADAR & BREACH MONITOR BANNER */}
      <div
        className={`custom-card p-6 border-l-4 ${
          riskStatus.overallStatus === 'SAFE'
            ? 'border-lime bg-lime/5'
            : riskStatus.overallStatus === 'CAUTION'
            ? 'border-warning bg-warning/5'
            : 'border-loss bg-loss/5'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm font-heading ${
                riskStatus.overallStatus === 'SAFE'
                  ? 'bg-lime/20 text-lime border border-lime/30'
                  : riskStatus.overallStatus === 'CAUTION'
                  ? 'bg-warning/20 text-warning border border-warning/30'
                  : 'bg-loss/20 text-loss border border-loss/30'
              }`}
            >
              {riskStatus.overallStatus === 'SAFE' ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-text-muted font-heading">
                  ACCOUNT RISK STATUS
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-black font-heading ${
                    riskStatus.overallStatus === 'SAFE'
                      ? 'bg-lime text-bg-main'
                      : riskStatus.overallStatus === 'CAUTION'
                      ? 'bg-warning text-bg-main'
                      : 'bg-loss text-white'
                  }`}
                >
                  {riskStatus.overallStatus}
                </span>
              </div>
              <p className="text-xs font-medium text-text-primary mt-0.5">{riskStatus.statusMessage}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono-num border-t md:border-t-0 border-bg-border pt-3 md:pt-0">
            <div>
              <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Current Phase</span>
              <span className="font-bold text-lime font-heading">{targetAcc.currentPhase}</span>
            </div>
            <div>
              <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Deadline</span>
              <span className="font-bold text-text-primary font-heading">{riskStatus.daysRemainingInChallenge} Days Left</span>
            </div>
          </div>
        </div>
      </div>

      {/* METRICS METERS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Account Balance & Profit Target */}
        <div className="custom-card p-5 space-y-3 font-mono-num">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted uppercase font-heading">PROFIT TARGET</span>
            <span className="text-xs font-bold text-lime">{riskStatus.profitTargetProgressPercent}%</span>
          </div>

          <div className="space-y-1">
            <span className="text-2xl font-black text-text-primary font-heading">
              ${targetAcc.currentBalance.toLocaleString()}
            </span>
            <span className="text-[11px] text-text-muted block">
              Target: <strong className="text-lime">${riskStatus.profitTarget.toLocaleString()}</strong> (${riskStatus.profitTargetRemaining} left)
            </span>
          </div>

          <div className="w-full bg-bg-nested h-2 rounded-full overflow-hidden border border-bg-border">
            <div
              className="bg-lime h-full transition-all"
              style={{ width: `${Math.min(100, riskStatus.profitTargetProgressPercent)}%` }}
            />
          </div>
        </div>

        {/* Daily Loss Monitor */}
        <div className="custom-card p-5 space-y-3 font-mono-num">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted uppercase font-heading">DAILY LOSS CAPACITY</span>
            <span className={`text-xs font-bold ${riskStatus.dailyLossUsedPercent >= 80 ? 'text-loss' : 'text-lime'}`}>
              {riskStatus.dailyLossUsedPercent}% USED
            </span>
          </div>

          <div className="space-y-1">
            <span className={`text-2xl font-black font-heading ${riskStatus.todayPnL >= 0 ? 'text-lime' : 'text-loss'}`}>
              {formatValue(riskStatus.todayPnL)}
            </span>
            <span className="text-[11px] text-text-muted block">
              Daily Limit: <strong className="text-loss">${riskStatus.dailyLossLimit}</strong> (${riskStatus.dailyLossRemaining} left)
            </span>
          </div>

          <div className="w-full bg-bg-nested h-2 rounded-full overflow-hidden border border-bg-border">
            <div
              className={`h-full transition-all ${riskStatus.dailyLossUsedPercent >= 80 ? 'bg-loss' : 'bg-lime'}`}
              style={{ width: `${Math.min(100, riskStatus.dailyLossUsedPercent)}%` }}
            />
          </div>
        </div>

        {/* Max Trailing Drawdown */}
        <div className="custom-card p-5 space-y-3 font-mono-num">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted uppercase font-heading">MAX DRAWDOWN ({targetAcc.drawdownType})</span>
            <span className={`text-xs font-bold ${riskStatus.drawdownUsedPercent >= 80 ? 'text-loss' : 'text-lime'}`}>
              {riskStatus.drawdownUsedPercent}% USED
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-2xl font-black text-loss font-heading">
              -${riskStatus.currentDrawdown}
            </span>
            <span className="text-[11px] text-text-muted block">
              Max Limit: <strong className="text-loss">${riskStatus.maxTotalLossLimit}</strong> (${riskStatus.drawdownRemaining} left)
            </span>
          </div>

          <div className="w-full bg-bg-nested h-2 rounded-full overflow-hidden border border-bg-border">
            <div
              className={`h-full transition-all ${riskStatus.drawdownUsedPercent >= 80 ? 'bg-loss' : 'bg-lime'}`}
              style={{ width: `${Math.min(100, riskStatus.drawdownUsedPercent)}%` }}
            />
          </div>
        </div>

        {/* Trading Days */}
        <div className="custom-card p-5 space-y-3 font-mono-num">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted uppercase font-heading">TRADING DAYS</span>
            <span className="text-xs font-bold text-lime">
              {riskStatus.tradingDaysCompleted} / {riskStatus.minTradingDays} DAYS
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-2xl font-black text-text-primary font-heading">
              {riskStatus.tradingDaysCompleted} Days
            </span>
            <span className="text-[11px] text-text-muted block">
              Min Required: <strong className="text-text-primary">{riskStatus.minTradingDays} Days</strong>
            </span>
          </div>

          <div className="w-full bg-bg-nested h-2 rounded-full overflow-hidden border border-bg-border">
            <div
              className="bg-lime h-full transition-all"
              style={{
                width: `${Math.min(100, (riskStatus.tradingDaysCompleted / (riskStatus.minTradingDays || 1)) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* PRE-TRADE RISK CHECKER WIDGET */}
      <div className="custom-card p-6 space-y-4 border-l-4 border-lime">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-heading flex items-center gap-2">
            <Calculator className="w-4 h-4 text-lime" /> Real-Time Pre-Trade Risk Checker
          </h3>
          <span className="text-xs text-text-muted font-mono-num font-heading">Evaluate risk impact before executing</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono-num">
          <div>
            <label className="text-text-secondary font-bold block mb-1">Entry Price</label>
            <input
              type="number"
              step="any"
              value={simEntry}
              onChange={(e) => setSimEntry(e.target.value)}
              className="w-full bg-bg-main border border-bg-border rounded-xl px-3 py-2 text-text-primary focus:border-lime focus:outline-none"
            />
          </div>
          <div>
            <label className="text-text-secondary font-bold block mb-1">Stop Loss (SL)</label>
            <input
              type="number"
              step="any"
              value={simSL}
              onChange={(e) => setSimSL(e.target.value)}
              className="w-full bg-bg-main border border-bg-border rounded-xl px-3 py-2 text-text-primary focus:border-lime focus:outline-none text-loss"
            />
          </div>
          <div>
            <label className="text-text-secondary font-bold block mb-1">Lot / Quantity</label>
            <input
              type="number"
              step="any"
              value={simQty}
              onChange={(e) => setSimQty(e.target.value)}
              className="w-full bg-bg-main border border-bg-border rounded-xl px-3 py-2 text-text-primary focus:border-lime focus:outline-none"
            />
          </div>
          <div>
            <label className="text-text-secondary font-bold block mb-1">Direction</label>
            <select
              value={simDirection}
              onChange={(e) => setSimDirection(e.target.value as any)}
              className="w-full bg-bg-main border border-bg-border rounded-xl px-3 py-2 text-text-primary focus:border-lime focus:outline-none font-bold"
            >
              <option value="LONG">BUY / LONG</option>
              <option value="SHORT">SELL / SHORT</option>
            </select>
          </div>
        </div>

        {/* Risk Output Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-bg-nested border border-bg-border font-mono-num text-xs">
          <div>
            <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Estimated Risk</span>
            <span className="text-sm font-bold text-loss">${simCheck.estimatedRiskAmount} ({simCheck.estimatedRiskPercent}%)</span>
          </div>
          <div>
            <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Daily Loss Impact</span>
            <span className="text-sm font-bold text-text-primary">{simCheck.impactOnDailyLossPercent}%</span>
          </div>
          <div>
            <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Remaining Daily Cap</span>
            <span className="text-sm font-bold text-lime">${simCheck.remainingDailyCapacityAfterTrade}</span>
          </div>
          <div>
            <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Remaining Drawdown Cap</span>
            <span className="text-sm font-bold text-lime">${simCheck.remainingDrawdownCapacityAfterTrade}</span>
          </div>
        </div>

        {/* Warning / Breach Messages */}
        {simCheck.hasBreach && (
          <div className="p-3 bg-loss/10 border border-loss/30 rounded-xl text-xs text-loss font-bold flex items-center gap-2 font-heading">
            <AlertCircle className="w-4 h-4" /> {simCheck.breachMessage}
          </div>
        )}
        {simCheck.hasWarning && !simCheck.hasBreach && (
          <div className="p-3 bg-warning/10 border border-warning/30 rounded-xl text-xs text-warning font-bold flex items-center gap-2 font-heading">
            <AlertTriangle className="w-4 h-4" /> {simCheck.warningMessage}
          </div>
        )}
      </div>
    </div>
  );
}
