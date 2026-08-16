'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
  const { theme, setTheme } = useApp();

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-text-primary tracking-tight font-heading flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-lime" /> Settings
        </h1>
        <p className="text-xs text-text-secondary">Configure theme options, risk parameters, timezone, and user profile</p>
      </div>

      <div className="custom-card p-6 space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-text-primary border-b border-bg-border pb-2 font-heading">Theme Preference</h3>
          <div className="grid grid-cols-3 gap-3 max-w-md text-xs font-heading">
            <button
              onClick={() => setTheme('dark')}
              className={`p-3 rounded-xl border text-center font-bold transition-all ${
                theme === 'dark' ? 'bg-bg-nested border-lime text-lime' : 'bg-bg-card border-bg-border text-text-muted hover:text-text-primary'
              }`}
            >
              Dark Theme (Default)
            </button>
            <button
              onClick={() => setTheme('light')}
              className={`p-3 rounded-xl border text-center font-bold transition-all ${
                theme === 'light' ? 'bg-bg-nested border-lime text-lime' : 'bg-bg-card border-bg-border text-text-muted hover:text-text-primary'
              }`}
            >
              Light Theme
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`p-3 rounded-xl border text-center font-bold transition-all ${
                theme === 'system' ? 'bg-bg-nested border-lime text-lime' : 'bg-bg-card border-bg-border text-text-muted hover:text-text-primary'
              }`}
            >
              System Auto
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-text-primary border-b border-bg-border pb-2 font-heading">Trader Profile</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-text-secondary block mb-1">Trader Display Name</label>
              <input type="text" defaultValue="Alex Mercer" className="w-full bg-bg-main border border-bg-border rounded-lg p-2.5 text-text-primary" />
            </div>
            <div>
              <label className="text-text-secondary block mb-1">Timezone</label>
              <select className="w-full bg-bg-main border border-bg-border rounded-lg p-2.5 text-text-primary">
                <option>UTC-5 (New York / EST)</option>
                <option>UTC+0 (London / GMT)</option>
                <option>UTC+3 (Istanbul / Moscow)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
