'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Table,
  Wallet,
  Calendar,
  BookMarked,
  BookOpen,
  BarChart3,
  FlaskConical,
  FileText,
  ShieldCheck,
  Target,
  AlertTriangle,
  FileSpreadsheet,
  Settings,
  LogOut,
  Layers,
} from 'lucide-react';

interface NavGroup {
  title: string;
  items: { name: string; href: string; icon: any; isComingSoon?: boolean }[];
}

export function Sidebar() {
  const pathname = usePathname();

  const navGroups: NavGroup[] = [
    {
      title: 'TRADING',
      items: [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Trades Log', href: '/trades', icon: Table },
        { name: 'Accounts', href: '/accounts', icon: Wallet },
        { name: 'Calendar', href: '/calendar', icon: Calendar },
      ],
    },
    {
      title: 'ANALYTICS',
      items: [
        { name: 'Analytics Hub', href: '/analytics', icon: BarChart3 },
        { name: 'Reports', href: '/reports', icon: FileText },
        { name: 'Backtesting', href: '/backtest', icon: FlaskConical, isComingSoon: true },
      ],
    },
    {
      title: 'STRATEGY',
      items: [
        { name: 'Strategies', href: '/strategies', icon: BookMarked },
        { name: 'Playbooks', href: '/playbooks', icon: Layers },
      ],
    },
    {
      title: 'JOURNAL',
      items: [
        { name: 'Day Journal', href: '/journal', icon: BookOpen },
        { name: 'Notebook', href: '/notebook', icon: FileText },
      ],
    },
    {
      title: 'DISCIPLINE',
      items: [
        { name: 'Goals', href: '/goals', icon: Target },
        { name: 'Trading Rules', href: '/discipline', icon: ShieldCheck },
      ],
    },
    {
      title: 'PROP FIRM',
      items: [{ name: 'Risk Monitor', href: '/prop-firm', icon: AlertTriangle }],
    },
    {
      title: 'UTILITY',
      items: [
        { name: 'Import', href: '/import', icon: FileSpreadsheet },
        { name: 'Settings', href: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-bg-surface border-r border-bg-border flex flex-col h-screen sticky top-0 z-30 select-none transition-colors">
      {/* Brand Header */}
      <div className="p-5 border-b border-bg-border flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-lime text-bg-main font-black flex items-center justify-center text-sm font-heading shadow-glow">
            MJ
          </div>
          <div>
            <span className="font-black text-lg tracking-tight font-heading flex items-center gap-1">
              <span className="text-text-primary">MEGA</span>
              <span className="text-lime">JOURNAL</span>
            </span>
            <span className="text-[10px] text-text-muted block font-medium">The Trading Performance Journal</span>
          </div>
        </Link>
      </div>

      {/* Nav Items List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-3 text-[10px] font-bold text-text-muted tracking-wider uppercase mb-1 font-heading">
              {group.title}
            </div>
            {group.items.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all relative ${
                    isActive
                      ? 'bg-bg-card text-text-primary font-bold border-l-2 border-lime'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-nested'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-lime' : 'text-text-muted'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.isComingSoon && (
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-bg-nested text-text-muted border border-bg-border">
                      P5
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Profile */}
      <div className="p-3 border-t border-bg-border bg-bg-main">
        <div className="flex items-center justify-between p-2 rounded-xl bg-bg-card border border-bg-border">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-lime/15 text-lime border border-lime/30 flex items-center justify-center font-bold text-xs font-heading">
              MJ
            </div>
            <div className="overflow-hidden">
              <span className="text-xs font-bold text-text-primary block truncate font-heading">Alex Mercer</span>
              <span className="text-[10px] text-text-muted block truncate font-medium">Mega Journal Pro</span>
            </div>
          </div>
          <button className="text-text-muted hover:text-loss p-1 transition-colors" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
