'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Save, CheckCircle2, Sliders, Layers } from 'lucide-react';

export default function AccountRiskConfigPage() {
  const params = useParams();
  const router = useRouter();
  const { accounts, updateAccount } = useApp();

  const accountId = params.id as string;
  const account = accounts.find((a) => a.id === accountId) || accounts[0];

  const [firmName, setFirmName] = useState(account?.firmName || 'FTMO');
  const [profitTarget, setProfitTarget] = useState(String(account?.profitTarget || 1000));
  const [maxDailyLossLimit, setMaxDailyLossLimit] = useState(String(account?.maxDailyLossLimit || 500));
  const [maxTotalLossLimit, setMaxTotalLossLimit] = useState(String(account?.maxTotalLossLimit || 1000));
  const [drawdownType, setDrawdownType] = useState<'STATIC' | 'TRAILING' | 'EQUITY_BASED' | 'BALANCE_BASED'>(
    account?.drawdownType || 'TRAILING'
  );
  const [minTradingDays, setMinTradingDays] = useState(String(account?.minTradingDays || 5));
  const [payoutThreshold, setPayoutThreshold] = useState(String(account?.payoutThreshold || 11000));
  const [currentPhase, setCurrentPhase] = useState<'Phase 1' | 'Phase 2' | 'Funded'>(account?.currentPhase || 'Phase 1');

  if (!account) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateAccount(account.id, {
      firmName,
      profitTarget: Number(profitTarget) || 1000,
      maxDailyLossLimit: Number(maxDailyLossLimit) || 500,
      maxTotalLossLimit: Number(maxTotalLossLimit) || 1000,
      drawdownType,
      minTradingDays: Number(minTradingDays) || 5,
      payoutThreshold: Number(payoutThreshold) || 11000,
      currentPhase,
    });
    router.push('/prop-firm');
  };

  const applyProfile = (profileType: 'FTMO_10K' | 'APEX_50K') => {
    if (profileType === 'FTMO_10K') {
      setFirmName('FTMO');
      setProfitTarget('1000');
      setMaxDailyLossLimit('500');
      setMaxTotalLossLimit('1000');
      setDrawdownType('TRAILING');
      setMinTradingDays('5');
      setPayoutThreshold('11000');
      setCurrentPhase('Phase 1');
    } else if (profileType === 'APEX_50K') {
      setFirmName('Apex Trader Funding');
      setProfitTarget('3000');
      setMaxDailyLossLimit('1250');
      setMaxTotalLossLimit('2500');
      setDrawdownType('TRAILING');
      setMinTradingDays('7');
      setPayoutThreshold('52600');
      setCurrentPhase('Phase 1');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-bg-border pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/prop-firm"
            className="p-2 rounded-xl bg-bg-card hover:bg-bg-nested text-text-secondary hover:text-text-primary border border-bg-border transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-text-primary tracking-tight font-heading flex items-center gap-2">
              <Sliders className="w-5 h-5 text-lime" /> Account Risk Rule Configuration
            </h1>
            <p className="text-xs text-text-secondary">Configure phase rules for <strong className="text-text-primary">{account.name}</strong></p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="btn-primary-lime text-xs px-5 py-2.5 rounded-xl shadow-glow flex items-center gap-1.5 font-heading font-black"
        >
          <Save className="w-4 h-4" />
          <span>Save Risk Configuration</span>
        </button>
      </div>

      {/* Preset Profiles Bar */}
      <div className="custom-card p-4 flex items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-text-primary font-heading">Apply Pre-configured Prop Profile</h4>
          <span className="text-[10px] text-text-muted">Instantly populate standard evaluation risk rules</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => applyProfile('FTMO_10K')}
            className="btn-secondary text-xs px-3 py-1.5 rounded-xl font-heading font-bold"
          >
            FTMO $10K
          </button>
          <button
            type="button"
            onClick={() => applyProfile('APEX_50K')}
            className="btn-secondary text-xs px-3 py-1.5 rounded-xl font-heading font-bold"
          >
            Apex $50K
          </button>
        </div>
      </div>

      {/* Configuration Form */}
      <form onSubmit={handleSave} className="custom-card p-6 space-y-6 text-xs font-mono-num">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-text-secondary font-bold block mb-1">Prop Firm Name</label>
            <input
              type="text"
              value={firmName}
              onChange={(e) => setFirmName(e.target.value)}
              className="w-full bg-bg-main border border-bg-border rounded-xl px-3 py-2 text-text-primary focus:border-lime focus:outline-none"
            />
          </div>

          <div>
            <label className="text-text-secondary font-bold block mb-1">Current Challenge Phase</label>
            <select
              value={currentPhase}
              onChange={(e) => setCurrentPhase(e.target.value as any)}
              className="w-full bg-bg-main border border-bg-border rounded-xl px-3 py-2 text-text-primary focus:border-lime focus:outline-none font-bold"
            >
              <option value="Phase 1">Phase 1 Evaluation</option>
              <option value="Phase 2">Phase 2 Verification</option>
              <option value="Funded">Funded Account</option>
            </select>
          </div>

          <div>
            <label className="text-text-secondary font-bold block mb-1">Profit Target ($)</label>
            <input
              type="number"
              value={profitTarget}
              onChange={(e) => setProfitTarget(e.target.value)}
              className="w-full bg-bg-main border border-bg-border rounded-xl px-3 py-2 text-lime font-bold focus:border-lime focus:outline-none"
            />
          </div>

          <div>
            <label className="text-text-secondary font-bold block mb-1">Max Daily Loss Limit ($)</label>
            <input
              type="number"
              value={maxDailyLossLimit}
              onChange={(e) => setMaxDailyLossLimit(e.target.value)}
              className="w-full bg-bg-main border border-bg-border rounded-xl px-3 py-2 text-loss font-bold focus:border-lime focus:outline-none"
            />
          </div>

          <div>
            <label className="text-text-secondary font-bold block mb-1">Max Overall Drawdown ($)</label>
            <input
              type="number"
              value={maxTotalLossLimit}
              onChange={(e) => setMaxTotalLossLimit(e.target.value)}
              className="w-full bg-bg-main border border-bg-border rounded-xl px-3 py-2 text-loss font-bold focus:border-lime focus:outline-none"
            />
          </div>

          <div>
            <label className="text-text-secondary font-bold block mb-1">Drawdown Type</label>
            <select
              value={drawdownType}
              onChange={(e) => setDrawdownType(e.target.value as any)}
              className="w-full bg-bg-main border border-bg-border rounded-xl px-3 py-2 text-text-primary focus:border-lime focus:outline-none"
            >
              <option value="TRAILING">Trailing Drawdown</option>
              <option value="STATIC">Static Drawdown</option>
              <option value="EQUITY_BASED">Equity Based</option>
              <option value="BALANCE_BASED">Balance Based</option>
            </select>
          </div>

          <div>
            <label className="text-text-secondary font-bold block mb-1">Minimum Trading Days</label>
            <input
              type="number"
              value={minTradingDays}
              onChange={(e) => setMinTradingDays(e.target.value)}
              className="w-full bg-bg-main border border-bg-border rounded-xl px-3 py-2 text-text-primary focus:border-lime focus:outline-none"
            />
          </div>

          <div>
            <label className="text-text-secondary font-bold block mb-1">Payout Eligibility Threshold ($)</label>
            <input
              type="number"
              value={payoutThreshold}
              onChange={(e) => setPayoutThreshold(e.target.value)}
              className="w-full bg-bg-main border border-bg-border rounded-xl px-3 py-2 text-text-primary focus:border-lime focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-bg-border flex items-center justify-end gap-3">
          <Link href="/prop-firm" className="px-4 py-2 text-text-muted hover:text-text-primary">
            Cancel
          </Link>
          <button
            type="submit"
            className="btn-primary-lime text-xs px-5 py-2.5 rounded-xl shadow-glow flex items-center gap-1.5 font-heading font-black"
          >
            <CheckCircle2 className="w-4 h-4" /> Save Account Risk Rules
          </button>
        </div>
      </form>
    </div>
  );
}
