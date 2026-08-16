'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Link from 'next/link';
import { Settings as SettingsIcon, Sun, Moon, Database, ShieldCheck, User, Bell, Sliders, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const { theme, setTheme, isPrivacyMode, setIsPrivacyMode, accounts, activeAccountData } = useApp();
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'APPEARANCE' | 'TRADING' | 'DATA' | 'PRIVACY'>('APPEARANCE');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-bg-border pb-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight font-heading flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-lime" /> User Settings & Preferences
          </h1>
          <p className="text-xs text-text-secondary">Manage platform appearance, risk rules, notifications, and data controls.</p>
        </div>

        {isSaved && (
          <span className="text-xs font-bold text-lime font-mono-num flex items-center gap-1 animate-in fade-in font-heading">
            <CheckCircle2 className="w-4 h-4" /> Preferences Saved!
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-bg-border pb-3 font-heading">
        <button
          onClick={() => setActiveTab('APPEARANCE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'APPEARANCE' ? 'bg-lime text-bg-main shadow-glow' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Appearance & Theme
        </button>
        <button
          onClick={() => setActiveTab('PROFILE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'PROFILE' ? 'bg-lime text-bg-main shadow-glow' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          User Profile
        </button>
        <button
          onClick={() => setActiveTab('TRADING')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'TRADING' ? 'bg-lime text-bg-main shadow-glow' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Trading Defaults
        </button>
        <Link
          href="/settings/data"
          className="px-4 py-2 rounded-xl text-xs font-bold text-text-secondary hover:text-text-primary transition-all"
        >
          Data Portability
        </Link>
      </div>

      {/* APPEARANCE SECTION */}
      {activeTab === 'APPEARANCE' && (
        <form onSubmit={handleSave} className="custom-card p-6 space-y-6 font-mono-num text-xs">
          <h3 className="text-sm font-bold text-text-primary font-heading">Theme & Color Options</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setTheme('midnight')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                theme === 'midnight' ? 'border-lime bg-lime/10' : 'bg-bg-nested border-bg-border'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-text-primary font-heading text-sm flex items-center gap-2">
                  <Moon className="w-4 h-4 text-lime" /> Midnight Cyan Dark
                </span>
                {theme === 'midnight' && <CheckCircle2 className="w-4 h-4 text-lime" />}
              </div>
              <p className="text-[11px] text-text-muted">High contrast midnight #00030A background with electric neon cyan accents.</p>
            </div>

            <div
              onClick={() => setTheme('light')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                theme === 'light' ? 'border-lime bg-lime/10' : 'bg-bg-nested border-bg-border'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-text-primary font-heading text-sm flex items-center gap-2">
                  <Sun className="w-4 h-4 text-lime" /> Crisp Light Mode
                </span>
                {theme === 'light' && <CheckCircle2 className="w-4 h-4 text-lime" />}
              </div>
              <p className="text-[11px] text-text-muted">Clean white background with dark slate typography and cyan highlights.</p>
            </div>
          </div>

          <div className="pt-4 border-t border-bg-border flex justify-end">
            <button
              type="submit"
              className="btn-primary-lime text-xs px-6 py-2.5 rounded-xl shadow-glow font-heading font-black"
            >
              Save Preferences
            </button>
          </div>
        </form>
      )}

      {/* PROFILE SECTION */}
      {activeTab === 'PROFILE' && (
        <form onSubmit={handleSave} className="custom-card p-6 space-y-4 font-mono-num text-xs">
          <h3 className="text-sm font-bold text-text-primary font-heading">Trader Profile Information</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-text-secondary font-bold block mb-1">Full Name</label>
              <input
                type="text"
                defaultValue="Alex Mercer"
                className="w-full bg-bg-main border border-bg-border rounded-xl px-3 py-2 text-text-primary focus:border-lime focus:outline-none font-heading font-bold"
              />
            </div>
            <div>
              <label className="text-text-secondary font-bold block mb-1">Email Address</label>
              <input
                type="email"
                defaultValue="alex.mercer@megajournal.io"
                className="w-full bg-bg-main border border-bg-border rounded-xl px-3 py-2 text-text-primary focus:border-lime focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-bg-border flex justify-end">
            <button
              type="submit"
              className="btn-primary-lime text-xs px-6 py-2.5 rounded-xl shadow-glow font-heading font-black"
            >
              Update Profile
            </button>
          </div>
        </form>
      )}

      {/* TRADING DEFAULTS SECTION */}
      {activeTab === 'TRADING' && (
        <form onSubmit={handleSave} className="custom-card p-6 space-y-4 font-mono-num text-xs">
          <h3 className="text-sm font-bold text-text-primary font-heading">Trading & Asset Defaults</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-text-secondary font-bold block mb-1">Base Currency</label>
              <select className="w-full bg-bg-main border border-bg-border rounded-xl px-3 py-2 text-text-primary focus:border-lime focus:outline-none font-bold">
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            <div>
              <label className="text-text-secondary font-bold block mb-1">Default Active Account</label>
              <select className="w-full bg-bg-main border border-bg-border rounded-xl px-3 py-2 text-text-primary focus:border-lime focus:outline-none font-bold">
                {accounts.map((a) => (
                  <option key={a.id} value={a.name}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-text-secondary font-bold block mb-1">Default Risk % Per Trade</label>
              <input
                type="number"
                step="0.1"
                defaultValue="1.0"
                className="w-full bg-bg-main border border-bg-border rounded-xl px-3 py-2 text-text-primary focus:border-lime focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-bg-border flex justify-end">
            <button
              type="submit"
              className="btn-primary-lime text-xs px-6 py-2.5 rounded-xl shadow-glow font-heading font-black"
            >
              Save Defaults
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
