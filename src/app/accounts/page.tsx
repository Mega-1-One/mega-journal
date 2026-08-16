'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Link from 'next/link';
import { Wallet, Plus, ArrowRight, ShieldCheck, CheckCircle2, X } from 'lucide-react';

export default function AccountsPage() {
  const { accounts, selectedAccount, setSelectedAccount, addAccount, formatValue } = useApp();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [name, setName] = useState('');
  const [broker, setBroker] = useState('FTMO / MetaTrader 5');
  const [accountType, setAccountType] = useState<'PERSONAL' | 'PROP_FIRM' | 'EVALUATION' | 'FUNDED' | 'INSTANT_FUNDING' | 'DEMO'>('FUNDED');
  const [startingBalance, setStartingBalance] = useState('10000');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const startBal = Number(startingBalance) || 10000;
    addAccount({
      id: `acc-${Date.now()}`,
      name,
      broker,
      firmName: 'FTMO',
      accountType,
      startingBalance: startBal,
      currentBalance: startBal,
      currency: 'USD',
      profitTarget: Math.round(startBal * 0.1),
      profitTargetPercent: 10.0,
      maxDailyLossLimit: Math.round(startBal * 0.05),
      maxTotalLossLimit: Math.round(startBal * 0.1),
      drawdownType: 'TRAILING',
      dailyLossCalcMethod: 'STARTING_DAY_BALANCE',
      minTradingDays: 5,
      maxTradingDays: 30,
      tradingDaysCompleted: 0,
      consistencyRequirementPercent: 0.0,
      payoutThreshold: Math.round(startBal * 1.1),
      challengeStartDate: new Date().toISOString(),
      currentPhase: 'Phase 1',
      status: 'ACTIVE',
    });

    setName('');
    setIsCreateOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight font-heading flex items-center gap-2">
            <Wallet className="w-5 h-5 text-lime" /> Trading Account Management
          </h1>
          <p className="text-xs text-text-secondary">
            Manage your personal capital, prop firm challenges, and funded accounts.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="btn-primary-lime text-xs px-4 py-2 rounded-xl shadow-glow flex items-center gap-1.5 font-heading font-black"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Trading Account</span>
        </button>
      </div>

      {/* Accounts List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {accounts.map((acc) => {
          const isSelected = selectedAccount === acc.name;
          const returnPct = acc.startingBalance > 0 ? ((acc.currentBalance - acc.startingBalance) / acc.startingBalance) * 100 : 0;

          return (
            <div key={acc.id} className={`custom-card p-6 flex flex-col justify-between space-y-5 ${isSelected ? 'border-lime' : ''}`}>
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-text-primary font-heading tracking-tight">{acc.name}</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-lime/10 text-lime border border-lime/20 font-mono-num uppercase">
                        {acc.accountType}
                      </span>
                    </div>
                    <span className="text-xs text-text-secondary block font-medium">{acc.broker}</span>
                  </div>

                  <button
                    onClick={() => setSelectedAccount(acc.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold font-heading transition-all ${
                      isSelected
                        ? 'bg-lime text-bg-main shadow-glow'
                        : 'bg-bg-nested border border-bg-border text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {isSelected ? 'Active Account' : 'Select Account'}
                  </button>
                </div>

                {/* Balance Grid */}
                <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-bg-nested border border-bg-border font-mono-num">
                  <div>
                    <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Current Balance</span>
                    <span className="text-xl font-black text-text-primary font-heading">${acc.currentBalance.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Return</span>
                    <span className={`text-xl font-black font-heading ${returnPct >= 0 ? 'text-lime' : 'text-loss'}`}>
                      {returnPct >= 0 ? '+' : ''}{returnPct.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-bg-border flex items-center justify-between font-mono-num text-xs">
                <span className="text-text-muted text-[11px]">
                  Daily Limit: <strong className="text-loss">${acc.maxDailyLossLimit}</strong>
                </span>

                <Link
                  href={`/accounts/${acc.id}/risk`}
                  className="text-xs font-bold text-lime hover:underline flex items-center gap-1 font-heading"
                >
                  <span>Risk Rules & Challenge</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Account Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-bg-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-bg-border flex items-center justify-between bg-bg-card">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-lime/15 text-lime border border-lime/30 flex items-center justify-center font-bold">
                  <Wallet className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-text-primary tracking-tight font-heading">Add Trading Account</h3>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="text-text-muted hover:text-text-primary p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 text-xs font-mono-num">
              <div>
                <label className="font-semibold text-text-secondary block mb-1">Account Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. FTMO $100K Challenge"
                  className="w-full bg-bg-main border border-bg-border rounded-xl px-3 py-2 text-text-primary focus:border-lime focus:outline-none font-heading font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-text-secondary block mb-1">Broker / Platform</label>
                <input
                  type="text"
                  value={broker}
                  onChange={(e) => setBroker(e.target.value)}
                  className="w-full bg-bg-main border border-bg-border rounded-xl px-3 py-2 text-text-primary focus:border-lime focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-text-secondary block mb-1">Account Type</label>
                <select
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value as any)}
                  className="w-full bg-bg-main border border-bg-border rounded-xl px-3 py-2 text-text-primary focus:border-lime focus:outline-none"
                >
                  <option value="FUNDED">Funded Prop Account</option>
                  <option value="EVALUATION">Evaluation Challenge</option>
                  <option value="PERSONAL">Personal Live Capital</option>
                  <option value="DEMO">Demo Account</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-text-secondary block mb-1">Starting Balance ($)</label>
                <input
                  type="number"
                  value={startingBalance}
                  onChange={(e) => setStartingBalance(e.target.value)}
                  className="w-full bg-bg-main border border-bg-border rounded-xl px-3 py-2 text-text-primary focus:border-lime focus:outline-none"
                  required
                />
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
                  <span>Save Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
