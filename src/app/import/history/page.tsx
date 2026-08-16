'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, History, RotateCcw, CheckCircle2 } from 'lucide-react';

export default function ImportHistoryPage() {
  const mockBatches = [
    {
      id: 'imp-101',
      date: '2026-08-16 10:15',
      source: 'MT5 Broker Statement',
      accountName: 'MEGA1 $10K Prop Account',
      totalRows: 12,
      imported: 12,
      skipped: 0,
      status: 'COMPLETED',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-bg-border pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/import"
            className="p-2 rounded-xl bg-bg-card hover:bg-bg-nested text-text-secondary hover:text-text-primary border border-bg-border transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-text-primary tracking-tight font-heading flex items-center gap-2">
              <History className="w-5 h-5 text-lime" /> Import Batch History
            </h1>
            <p className="text-xs text-text-secondary">Historical CSV import logs and batch rollback management.</p>
          </div>
        </div>
      </div>

      {/* History Grid */}
      <div className="custom-card p-6 space-y-4 font-mono-num">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-bg-border text-text-muted uppercase text-[10px] font-heading font-bold">
                <th className="py-2.5 px-3">Import Date</th>
                <th className="py-2.5 px-3">Source / File</th>
                <th className="py-2.5 px-3">Account</th>
                <th className="py-2.5 px-3">Imported</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bg-border">
              {mockBatches.map((b) => (
                <tr key={b.id} className="hover:bg-bg-nested transition-colors">
                  <td className="py-3 px-3 text-text-muted">{b.date}</td>
                  <td className="py-3 px-3 font-bold text-text-primary font-heading">{b.source}</td>
                  <td className="py-3 px-3 text-text-secondary">{b.accountName}</td>
                  <td className="py-3 px-3 text-lime font-bold">{b.imported} Trades</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-lime/10 text-lime font-heading">
                      {b.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button className="px-2.5 py-1 rounded-lg bg-bg-card hover:bg-bg-nested border border-bg-border text-text-muted hover:text-loss text-[11px] font-bold font-heading flex items-center gap-1 ml-auto">
                      <RotateCcw className="w-3 h-3" /> Rollback Batch
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
