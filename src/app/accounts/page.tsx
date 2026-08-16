'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Wallet, CheckCircle2 } from 'lucide-react';

export default function AccountsPage() {
  const { accounts } = useApp();

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight font-heading flex items-center gap-2">
            <Wallet className="w-5 h-5 text-lime" /> Accounts
          </h1>
          <p className="text-xs text-text-secondary">Manage prop challenge, funded, personal, and backtest portfolios</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {accounts.map((acc) => (
          <div key={acc.id} className="custom-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded bg-lime/10 text-lime border border-lime/20 font-heading">
                {acc.accountType}
              </span>
              <span className="text-xs text-lime font-bold flex items-center gap-1 font-heading">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-text-primary font-heading">{acc.name}</h3>
              <p className="text-xs text-text-secondary font-mono">{acc.broker}</p>
            </div>

            <div className="pt-2 border-t border-bg-border flex justify-between items-baseline font-mono-num">
              <span className="text-xs text-text-muted">Balance</span>
              <span className="text-xl font-black text-text-primary font-heading">${acc.currentBalance.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
