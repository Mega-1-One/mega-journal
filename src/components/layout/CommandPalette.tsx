'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Search, Calculator, Wallet, Table, FileSpreadsheet, Eye, Moon, Sun, BookMarked } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CommandPalette() {
  const router = useRouter();
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    setIsQuickAddOpen,
    theme,
    setTheme,
    isPrivacyMode,
    setIsPrivacyMode,
  } = useApp();

  const [query, setQuery] = useState('');

  if (!isCommandPaletteOpen) return null;

  const actions = [
    {
      name: 'Add New Trade',
      category: 'Actions',
      icon: Calculator,
      perform: () => setIsQuickAddOpen(true),
    },
    {
      name: 'View Trade Log',
      category: 'Navigation',
      icon: Table,
      perform: () => router.push('/trades'),
    },
    {
      name: 'Manage Trading Accounts',
      category: 'Navigation',
      icon: Wallet,
      perform: () => router.push('/accounts'),
    },
    {
      name: 'Import Broker CSV',
      category: 'Navigation',
      icon: FileSpreadsheet,
      perform: () => router.push('/import'),
    },
    {
      name: 'View Strategy Playbooks',
      category: 'Navigation',
      icon: BookMarked,
      perform: () => router.push('/strategies'),
    },
    {
      name: 'Toggle Privacy Mode',
      category: 'Preferences',
      icon: Eye,
      perform: () => setIsPrivacyMode(!isPrivacyMode),
    },
    {
      name: 'Toggle Dark/Light Theme',
      category: 'Preferences',
      icon: theme === 'dark' ? Sun : Moon,
      perform: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    },
  ];

  const filteredActions = actions.filter((a) => a.name.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (action: any) => {
    action.perform();
    setIsCommandPaletteOpen(false);
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-24 p-4">
      <div className="bg-bg-surface border border-bg-border rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-bg-border flex items-center gap-3">
          <Search className="w-5 h-5 text-text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="w-full bg-transparent text-sm text-text-primary placeholder-text-muted focus:outline-none"
            autoFocus
          />
          <button
            onClick={() => setIsCommandPaletteOpen(false)}
            className="text-xs bg-bg-card border border-bg-border px-2 py-1 rounded text-text-muted font-mono"
          >
            ESC
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredActions.length === 0 ? (
            <div className="p-6 text-center text-xs text-text-muted">No commands found matching "{query}".</div>
          ) : (
            filteredActions.map((act, idx) => {
              const Icon = act.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(act)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-bg-nested text-xs text-text-primary transition-colors text-left font-medium"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-bg-card border border-bg-border flex items-center justify-center text-lime">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{act.name}</span>
                  </div>
                  <span className="text-[10px] text-text-muted uppercase font-heading">{act.category}</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
