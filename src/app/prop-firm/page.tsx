'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Building2, AlertTriangle, Target, ShieldAlert } from 'lucide-react';

export default function PropFirmPage() {
  const { propFirms } = useApp();
  const [activeFirm, setActiveFirm] = useState(propFirms[0] || propFirms[1]);

  if (!activeFirm) return null;

  const dailyPctUsed = Math.min(100, Math.round((activeFirm.dailyRiskUsed / activeFirm.dailyLossLimit) * 100));
  const maxDDPctUsed = Math.min(100, Math.round((activeFirm.currentDrawdown / activeFirm.maximumLossLimit) * 100));
  const targetPctDone = Math.min(100, Math.round(((activeFirm.currentBalance - activeFirm.startingBalance) / (activeFirm.profitTarget || 1)) * 100));

  const distanceToDailyBreach = activeFirm.dailyLossLimit - activeFirm.dailyRiskUsed;
  const distanceToMaxBreach = activeFirm.maximumLossLimit - activeFirm.currentDrawdown;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight font-heading flex items-center gap-2">
            <Building2 className="w-5 h-5 text-lime" /> Prop Firm Risk Monitor
          </h1>
          <p className="text-xs text-text-secondary">
            Real-time loss limit meters, maximum drawdown proximity, and payout tracking
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-bg-card border border-bg-border rounded-xl p-1 text-xs font-heading font-bold">
            {propFirms.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFirm(f)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeFirm.id === f.id ? 'bg-lime text-bg-main shadow' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {f.firmName}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Account Phase Banner */}
      <div className="custom-card p-6 bg-bg-card flex flex-col sm:flex-row items-center justify-between gap-6 border-lime/30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-lime/15 text-lime border border-lime/30 flex items-center justify-center font-black text-lg font-heading">
            PF
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-text-primary font-heading">{activeFirm.firmName}</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-lime/10 text-lime border border-lime/20 font-heading">
                {activeFirm.challengePhase}
              </span>
            </div>
            <span className="text-xs text-text-secondary font-mono-num">Starting Balance: ${activeFirm.startingBalance.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-6 font-mono-num">
          <div className="text-right">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block font-heading">Current Balance</span>
            <span className="text-2xl font-black text-text-primary font-heading">${activeFirm.currentBalance.toLocaleString()}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block font-heading">Distance to Payout</span>
            <span className="text-2xl font-black text-lime font-heading">
              ${(activeFirm.payoutTarget - activeFirm.currentBalance).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Risk Meters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Daily Loss Limit */}
        <div className="custom-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-warning" />
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-heading">Daily Loss Limit</h3>
            </div>
            <span className={`text-xs font-extrabold px-2 py-0.5 rounded font-mono-num ${dailyPctUsed > 75 ? 'bg-loss/10 text-loss' : 'bg-lime/10 text-lime'}`}>
              {dailyPctUsed}% Used
            </span>
          </div>

          <div className="font-mono-num">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-xl font-black text-text-primary font-heading">${activeFirm.dailyRiskUsed}</span>
              <span className="text-xs text-text-muted">Limit: ${activeFirm.dailyLossLimit}</span>
            </div>
            <div className="w-full bg-bg-nested h-2.5 rounded-full overflow-hidden border border-bg-border">
              <div
                className={`h-full transition-all ${dailyPctUsed > 75 ? 'bg-loss' : 'bg-warning'}`}
                style={{ width: `${dailyPctUsed}%` }}
              />
            </div>
          </div>

          <p className="text-[11px] text-text-secondary font-mono-num">
            Buffer remaining today: <span className="font-bold text-lime">${distanceToDailyBreach}</span>
          </p>
        </div>

        {/* Maximum Drawdown */}
        <div className="custom-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-loss" />
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-heading">Maximum Drawdown</h3>
            </div>
            <span className={`text-xs font-extrabold px-2 py-0.5 rounded font-mono-num ${maxDDPctUsed > 75 ? 'bg-loss/10 text-loss' : 'bg-lime/10 text-lime'}`}>
              {maxDDPctUsed}% Used
            </span>
          </div>

          <div className="font-mono-num">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-xl font-black text-text-primary font-heading">${activeFirm.currentDrawdown}</span>
              <span className="text-xs text-text-muted">Max: ${activeFirm.maximumLossLimit}</span>
            </div>
            <div className="w-full bg-bg-nested h-2.5 rounded-full overflow-hidden border border-bg-border">
              <div
                className={`h-full transition-all ${maxDDPctUsed > 75 ? 'bg-loss' : 'bg-lime'}`}
                style={{ width: `${maxDDPctUsed}%` }}
              />
            </div>
          </div>

          <p className="text-[11px] text-text-secondary font-mono-num">
            Distance to account breach: <span className="font-bold text-loss">${distanceToMaxBreach}</span>
          </p>
        </div>

        {/* Profit Target */}
        <div className="custom-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-lime" />
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-heading">Profit Target</h3>
            </div>
            <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-lime/10 text-lime font-mono-num">
              {targetPctDone}% Done
            </span>
          </div>

          <div className="font-mono-num">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-xl font-black text-lime font-heading">
                ${activeFirm.currentBalance - activeFirm.startingBalance}
              </span>
              <span className="text-xs text-text-muted">Target: ${activeFirm.profitTarget}</span>
            </div>
            <div className="w-full bg-bg-nested h-2.5 rounded-full overflow-hidden border border-bg-border">
              <div className="h-full bg-lime transition-all" style={{ width: `${Math.max(0, targetPctDone)}%` }} />
            </div>
          </div>

          <p className="text-[11px] text-text-secondary font-mono-num">
            Remaining gain needed: <span className="font-bold text-text-primary">${activeFirm.profitTarget - (activeFirm.currentBalance - activeFirm.startingBalance)}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
