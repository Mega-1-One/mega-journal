'use client';

import React from 'react';
import { Shield } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-black text-text-primary tracking-tight font-heading flex items-center gap-2">
          <Shield className="w-5 h-5 text-lime" /> Admin Portal & Subscriptions
        </h1>
        <p className="text-xs text-text-secondary">System health, subscriber analytics, and storage usage</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono-num">
        <div className="custom-card p-5">
          <span className="text-[10px] font-bold text-text-muted uppercase block font-heading">Active Subscribers</span>
          <span className="text-2xl font-black text-text-primary font-heading">1,420</span>
        </div>
        <div className="custom-card p-5">
          <span className="text-[10px] font-bold text-text-muted uppercase block font-heading">Monthly Recurring (MRR)</span>
          <span className="text-2xl font-black text-lime font-heading">$41,180</span>
        </div>
        <div className="custom-card p-5">
          <span className="text-[10px] font-bold text-text-muted uppercase block font-heading">Trades Journaled</span>
          <span className="text-2xl font-black text-text-primary font-heading">184,920</span>
        </div>
        <div className="custom-card p-5">
          <span className="text-[10px] font-bold text-text-muted uppercase block font-heading">System Uptime</span>
          <span className="text-2xl font-black text-lime font-heading">99.98%</span>
        </div>
      </div>
    </div>
  );
}
