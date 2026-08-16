'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Link from 'next/link';
import {
  Search,
  Download,
  ArrowUpDown,
  Trash2,
  Eye,
  Plus,
  Table as TableIcon,
  CheckSquare,
  Square,
} from 'lucide-react';

export default function TradesPage() {
  const { filteredTrades, deleteTrade, formatValue, setIsQuickAddOpen } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDirection, setSelectedDirection] = useState<'ALL' | 'LONG' | 'SHORT'>('ALL');
  const [selectedSetup, setSelectedSetup] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortField, setSortField] = useState<'entryTime' | 'netPnL' | 'rMultiple'>('entryTime');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const tradesList = filteredTrades
    .filter((t) => {
      const matchesSearch =
        t.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.account.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.notes && t.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesDirection = selectedDirection === 'ALL' || t.direction === selectedDirection;
      const matchesSetup = selectedSetup === 'ALL' || t.setup === selectedSetup;

      return matchesSearch && matchesDirection && matchesSetup;
    })
    .sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];
      if (sortField === 'entryTime') {
        valA = new Date(a.entryTime).getTime();
        valB = new Date(b.entryTime).getTime();
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

  const toggleSelectAll = () => {
    if (selectedIds.length === tradesList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(tradesList.map((t) => t.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = () => {
    selectedIds.forEach((id) => deleteTrade(id));
    setSelectedIds([]);
  };

  const exportCSV = () => {
    const headers = 'ID,Date,Symbol,Direction,Entry,Exit,Lot,NetPnL,RMultiple,Setup,Mistake\n';
    const rows = tradesList
      .map(
        (t) =>
          `${t.id},${new Date(t.entryTime).toISOString()},${t.symbol},${t.direction},${t.entryPrice},${t.exitPrice},${t.quantity},${t.netPnL},${t.rMultiple},"${t.setup || ''}","${t.mistake || ''}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Mega_Journal_Trades_Export_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight font-heading flex items-center gap-2">
            <TableIcon className="w-5 h-5 text-lime" /> Trade Log
          </h1>
          <p className="text-xs text-text-secondary">
            Showing <span className="text-text-primary font-bold font-mono-num">{tradesList.length}</span> recorded trades
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 bg-bg-card hover:bg-bg-nested border border-bg-border text-text-primary text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4 text-lime" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="btn-primary-lime text-xs px-4 py-2 rounded-lg shadow flex items-center gap-1.5 font-heading font-black"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Trade</span>
          </button>
        </div>
      </div>

      {/* Filter & Toolbar */}
      <div className="custom-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto text-xs">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search symbol, notes, account..."
              className="w-full bg-bg-main border border-bg-border rounded-lg pl-9 pr-3 py-1.5 text-text-primary placeholder-text-muted focus:outline-none focus:border-lime"
            />
          </div>

          {/* Direction Filter */}
          <select
            value={selectedDirection}
            onChange={(e) => setSelectedDirection(e.target.value as any)}
            className="bg-bg-main border border-bg-border rounded-lg px-3 py-1.5 text-text-secondary focus:outline-none"
          >
            <option value="ALL">All Directions</option>
            <option value="LONG">Long / Buy</option>
            <option value="SHORT">Short / Sell</option>
          </select>

          {/* Setup Filter */}
          <select
            value={selectedSetup}
            onChange={(e) => setSelectedSetup(e.target.value)}
            className="bg-bg-main border border-bg-border rounded-lg px-3 py-1.5 text-text-secondary focus:outline-none"
          >
            <option value="ALL">All Setups</option>
            <option value="Liquidity Sweep">Liquidity Sweep</option>
            <option value="FVG Retest">Fair Value Gap</option>
            <option value="Order Block Retest">Order Block</option>
            <option value="MSS">Market Structure Shift</option>
          </select>
        </div>

        {/* Bulk Control */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 bg-loss/10 border border-loss/20 px-3 py-1.5 rounded-lg text-xs">
            <span className="text-loss font-bold">{selectedIds.length} Selected</span>
            <button onClick={handleBulkDelete} className="text-loss hover:underline font-semibold flex items-center gap-1">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Main Trade Table */}
      <div className="custom-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-bg-border bg-bg-surface text-text-muted font-bold uppercase tracking-wider text-[10px] font-heading">
                <th className="py-3 px-4 w-10">
                  <button onClick={toggleSelectAll}>
                    {selectedIds.length > 0 && selectedIds.length === tradesList.length ? (
                      <CheckSquare className="w-4 h-4 text-lime" />
                    ) : (
                      <Square className="w-4 h-4 text-text-muted" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4">
                  <button
                    onClick={() => {
                      setSortField('entryTime');
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    }}
                    className="flex items-center gap-1 hover:text-text-primary"
                  >
                    <span>Date / Time</span> <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">Symbol</th>
                <th className="py-3 px-4">Direction</th>
                <th className="py-3 px-4">Entry / Exit</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">
                  <button
                    onClick={() => {
                      setSortField('rMultiple');
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    }}
                    className="flex items-center gap-1 hover:text-text-primary"
                  >
                    <span>R-Multiple</span> <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">
                  <button
                    onClick={() => {
                      setSortField('netPnL');
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    }}
                    className="flex items-center gap-1 hover:text-text-primary"
                  >
                    <span>Net P&L</span> <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">Strategy & Setup</th>
                <th className="py-3 px-4">Mistake Tag</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bg-border">
              {tradesList.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-text-muted font-medium">
                    No trades match the active filters. Click "Add Trade" to log your first position.
                  </td>
                </tr>
              ) : (
                tradesList.map((t) => {
                  const isSelected = selectedIds.includes(t.id);
                  return (
                    <tr key={t.id} className={`hover:bg-bg-nested/60 transition-colors ${isSelected ? 'bg-lime/5' : ''}`}>
                      <td className="py-3.5 px-4">
                        <button onClick={() => toggleSelect(t.id)}>
                          {isSelected ? <CheckSquare className="w-4 h-4 text-lime" /> : <Square className="w-4 h-4 text-text-muted" />}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-text-secondary font-mono-num">
                        {new Date(t.entryTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-text-primary font-heading tracking-wide">{t.symbol}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                            t.direction === 'LONG' ? 'bg-lime/10 text-lime border border-lime/20' : 'bg-loss/10 text-loss border border-loss/20'
                          }`}
                        >
                          {t.direction}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-text-secondary font-mono-num">
                        {t.entryPrice} → {t.exitPrice}
                      </td>
                      <td className="py-3.5 px-4 text-text-secondary font-mono-num font-semibold">{t.quantity}</td>
                      <td className="py-3.5 px-4 font-bold text-lime font-mono-num">
                        {t.rMultiple >= 0 ? '+' : ''}{t.rMultiple}R
                      </td>
                      <td className={`py-3.5 px-4 font-bold font-mono-num ${t.netPnL >= 0 ? 'text-lime' : 'text-loss'}`}>
                        {formatValue(t.netPnL, undefined, t.initialRisk)}
                      </td>
                      <td className="py-3.5 px-4 text-text-secondary">
                        <span className="font-semibold block font-heading">{t.setup || 'General'}</span>
                        <span className="text-[10px] text-text-muted block truncate max-w-[120px] font-mono-num">{t.account}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        {t.mistake && t.mistake !== 'None' ? (
                          <span className="bg-warning/10 text-warning border border-warning/20 text-[10px] font-semibold px-2 py-0.5 rounded font-heading">
                            {t.mistake}
                          </span>
                        ) : (
                          <span className="text-text-muted text-[10px]">Clean</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/trades/${t.id}`}
                            className="p-1.5 rounded-lg bg-bg-main hover:bg-lime/15 text-text-secondary hover:text-lime transition-colors"
                            title="Open Workspace"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => deleteTrade(t.id)}
                            className="p-1.5 rounded-lg bg-bg-main hover:bg-loss/15 text-text-muted hover:text-loss transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
