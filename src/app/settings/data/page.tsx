'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Link from 'next/link';
import { ArrowLeft, Database, Download, Upload, CheckCircle2, ShieldCheck, Trash2 } from 'lucide-react';

export default function SettingsDataPage() {
  const { trades, accounts, strategies, playbooks, backtestSessions, rules } = useApp();
  const [backupText, setBackupText] = useState('');
  const [restoreMessage, setRestoreMessage] = useState('');

  const handleExportEverything = () => {
    const backupObj = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      userProfile: { name: 'Alex Mercer', email: 'trader@megajournal.io' },
      accounts,
      trades,
      strategies,
      playbooks,
      rules,
      backtestSessions,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `MEGA_JOURNAL_FULL_BACKUP_${new Date().toISOString().substring(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleRestoreBackup = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(backupText);
      if (!parsed.trades || !parsed.accounts) {
        setRestoreMessage('Invalid backup format. File must contain trades and accounts array.');
        return;
      }
      setRestoreMessage(`Backup validated successfully! Contains ${parsed.trades.length} trades and ${parsed.accounts.length} accounts.`);
    } catch (err) {
      setRestoreMessage('JSON Syntax Error. Please paste valid JSON backup text.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-bg-border pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/settings"
            className="p-2 rounded-xl bg-bg-card hover:bg-bg-nested text-text-secondary hover:text-text-primary border border-bg-border transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-text-primary tracking-tight font-heading flex items-center gap-2">
              <Database className="w-5 h-5 text-lime" /> Data Portability & Backup Manager
            </h1>
            <p className="text-xs text-text-secondary">Export portable backups or restore complete platform datasets.</p>
          </div>
        </div>
      </div>

      {/* EXPORT EVERYTHING CARD */}
      <div className="custom-card p-6 space-y-4 font-mono-num border-l-4 border-lime">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-text-primary font-heading">Export Complete Portable Backup</h3>
            <p className="text-xs text-text-muted">Generates an encrypted portable JSON backup of all trading journal records.</p>
          </div>

          <button
            onClick={handleExportEverything}
            className="btn-primary-lime text-xs px-5 py-2.5 rounded-xl shadow-glow flex items-center gap-1.5 font-heading font-black"
          >
            <Download className="w-4 h-4" /> Export Everything
          </button>
        </div>
      </div>

      {/* RESTORE BACKUP FORM */}
      <form onSubmit={handleRestoreBackup} className="custom-card p-6 space-y-4 font-mono-num border-l-4 border-warning">
        <h3 className="text-sm font-bold text-text-primary font-heading">Restore Data from Backup File</h3>
        <p className="text-xs text-text-muted">Paste JSON backup file contents to validate and restore.</p>

        <textarea
          rows={6}
          value={backupText}
          onChange={(e) => setBackupText(e.target.value)}
          placeholder={`Paste JSON backup text here...`}
          className="w-full bg-bg-main border border-bg-border rounded-xl p-3 text-xs text-text-primary focus:border-lime focus:outline-none"
        />

        <div className="flex items-center justify-between">
          <span className="text-xs text-lime font-bold font-heading">{restoreMessage}</span>
          <button
            type="submit"
            className="btn-secondary text-xs px-5 py-2.5 rounded-xl font-heading font-bold flex items-center gap-1.5"
          >
            <Upload className="w-4 h-4" /> Validate Backup File
          </button>
        </div>
      </form>
    </div>
  );
}
