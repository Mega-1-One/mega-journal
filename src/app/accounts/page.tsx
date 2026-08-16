'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Wallet, Plus, CheckCircle2, Trash2, Edit3, ShieldAlert } from 'lucide-react';

export default function AccountsPage() {
  const { accounts, selectedAccount, setSelectedAccount, addAccount, deleteAccount, formatValue } = useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [broker, setBroker] = useState('FTMO MT4');
  const [accountType, setAccountType] = useState<'PERSONAL' | 'FUNDED' | 'EVALUATION' | 'DEMO'>('EVALUATION');
  const [startingBalance, setStartingBalance] = useState('10000');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    const balance = Number(startingBalance) || 10000;
    addAccount({
      id: `acc-${Date.now()}`,
      name,
      broker,
      accountType,
      startingBalance: balance,
      currentBalance: balance,
      currency: 'USD',
      status: 'ACTIVE',
    });
    setName('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight font-heading flex items-center gap-2">
            <Wallet className="w-5 h-5 text-lime" /> Account Management
          </h1>
          <p className="text-xs text-text-secondary">Create and manage trading accounts, prop challenges, and demo portfolios</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary-lime text-xs px-4 py-2 rounded-lg shadow flex items-center gap-1.5 font-heading font-black"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Create Trading Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {accounts.map((acc) => {
          const isSelected = selectedAccount === acc.name;
          return (
            <div
              key={acc.id}
              className={`custom-card p-6 space-y-4 transition-all ${
                isSelected ? 'border-lime/60 shadow-lg bg-lime/5' : 'bg-bg-card'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded bg-lime/10 text-lime border border-lime/20 font-heading uppercase">
                  {acc.accountType}
                </span>
                {isSelected ? (
                  <span className="text-xs font-bold text-lime flex items-center gap-1 font-heading">
                    <CheckCircle2 className="w-4 h-4" /> Active Account
                  </span>
                ) : (
                  <button
                    onClick={() => setSelectedAccount(acc.name)}
                    className="text-xs font-bold text-text-muted hover:text-lime underline font-heading"
                  >
                    Select Account
                  </button>
                )}
              </div>

              <div>
                <h3 className="text-base font-bold text-text-primary font-heading">{acc.name}</h3>
                <p className="text-xs text-text-secondary font-mono">{acc.broker}</p>
              </div>

              <div className="pt-2 border-t border-bg-border flex justify-between items-baseline font-mono-num">
                <div>
                  <span className="text-[10px] text-text-muted font-bold block font-heading">Starting</span>
                  <span className="text-xs text-text-secondary">${acc.startingBalance.toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-text-muted font-bold block font-heading">Current Balance</span>
                  <span className="text-xl font-black text-text-primary font-heading">${acc.currentBalance.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-bg-border">
                {accounts.length > 1 && (
                  <button
                    onClick={() => deleteAccount(acc.id)}
                    className="p-1.5 text-text-muted hover:text-loss transition-colors rounded"
                    title="Archive Account"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-bg-border rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-text-primary font-heading">Create New Trading Account</h3>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="text-text-secondary block mb-1 font-semibold">Account Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. MEGA1 $25K Challenge"
                  className="w-full bg-bg-card border border-bg-border rounded-lg p-2.5 text-text-primary"
                  required
                />
              </div>

              <div>
                <label className="text-text-secondary block mb-1 font-semibold">Broker / Platform</label>
                <input
                  type="text"
                  value={broker}
                  onChange={(e) => setBroker(e.target.value)}
                  placeholder="e.g. FTMO MT4 / Tradovate"
                  className="w-full bg-bg-card border border-bg-border rounded-lg p-2.5 text-text-primary"
                />
              </div>

              <div>
                <label className="text-text-secondary block mb-1 font-semibold">Account Type</label>
                <select
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value as any)}
                  className="w-full bg-bg-card border border-bg-border rounded-lg p-2.5 text-text-primary"
                >
                  <option value="EVALUATION">Evaluation (Prop Challenge)</option>
                  <option value="FUNDED">Funded Account</option>
                  <option value="PERSONAL">Personal Brokerage</option>
                  <option value="DEMO">Demo Portfolio</option>
                </select>
              </div>

              <div>
                <label className="text-text-secondary block mb-1 font-semibold">Starting Balance ($)</label>
                <input
                  type="number"
                  value={startingBalance}
                  onChange={(e) => setStartingBalance(e.target.value)}
                  className="w-full bg-bg-card border border-bg-border rounded-lg p-2.5 text-text-primary font-mono-num"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-bg-border">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-text-muted hover:text-text-primary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-lime text-xs px-4 py-2 rounded-lg font-heading font-black">
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
