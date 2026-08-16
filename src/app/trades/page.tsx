'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Link from 'next/link';
import {
  Search,
  Download,
  ArrowUpDown,
  Archive,
  Eye,
  Plus,
  Table as TableIcon,
  CheckSquare,
  Square,
  Copy,
} from 'lucide-react';

export default function TradesPage() {
  const { filteredTrades, archiveTrade, duplicateTrade, formatValue, setIsQuickAddOpen, strategies } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDirection, setSelectedDirection] = useState<'ALL' | 'LONG' | 'SHORT'>('ALL');
  const [selectedSetup, setSelectedSetup] = useState<string>('ALL');
  const [selectedSession, setSelectedSession] = useState<string>('ALL');
  const [selectedWinLoss, setSelectedWinLoss] = useState<'ALL' | 'WIN' | 'LOSS' | 'BREAKEVEN'>('ALL');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');

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
      const matchesSession = selectedSession === 'ALL' || t.session === selectedSession;

      const matchesWinLoss =
        selectedWinLoss === 'ALL' ||
        (selectedWinLoss === 'WIN' && t.isWin) ||
        (selectedWinLoss === 'LOSS' && t.isLoss) ||
        (selectedWinLoss === 'BREAKEVEN' && t.isBreakEven);

      const matchesTag = selectedTag === 'ALL' || (t.tags && t.tags.includes(selectedTag));

      return matchesSearch && matchesDirection && matchesSetup && matchesSession && matchesWinLoss && matchesTag;
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

  const handleBulkArchive = () => {
    selectedIds.forEach((id) => archiveTrade(id));
    setSelectedIds([]);
  };

  const exportCSV = () => {
    const headers = 'ID,Date,Symbol,Direction,Entry,Exit,Lot,NetPnL,RMultiple,Setup,Mistake,Session,Rating\n';
    const rows = tradesList
      .map(
        (t) =>
          `${t.id},${new Date(t.entryTime).toISOString()},${t.symbol},${t.direction},${t.entryPrice},${t.exitPrice},${t.quantity},${t.netPnL},${t.rMultiple},"${t.setup || ''}","${t.mistake || ''}","${t.session || ''}",${t.rating || 5}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Mega_Journal_Trades_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#FFFFFF] tracking-tight font-heading flex items-center gap-2">
            <TableIcon className="w-5 h-5 text-[#C8FF00]" /> Trade Log Core
          </h1>
          <p className="text-xs text-[#A7ADB4]">
            High-density journal table showing <span className="text-[#FFFFFF] font-bold font-mono-num">{tradesList.length}</span> active trades
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="btn-secondary text-xs px-4 py-2 rounded-xl flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-[#C8FF00]" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="btn-primary-lime text-xs px-4 py-2 rounded-xl shadow-glow flex items-center gap-1.5 font-heading font-black"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Trade (N)</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="custom-card p-4 flex flex-col space-y-3">
        <div className="flex flex-wrap items-center gap-3 w-full text-xs">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#A7ADB4] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search symbol, notes, account..."
              className="w-full bg-[#0B0D0F] border border-[#262B30] rounded-xl pl-9 pr-3 py-1.5 text-[#F5F5F5] placeholder-[#6F767D] focus:outline-none focus:border-[#C8FF00]"
            />
          </div>

          {/* Direction Filter */}
          <select
            value={selectedDirection}
            onChange={(e) => setSelectedDirection(e.target.value as any)}
            className="bg-[#0B0D0F] border border-[#262B30] rounded-xl px-3 py-1.5 text-[#A7ADB4] focus:outline-none focus:text-[#F5F5F5]"
          >
            <option value="ALL">All Directions</option>
            <option value="LONG">Long / Buy</option>
            <option value="SHORT">Short / Sell</option>
          </select>

          {/* Win/Loss Filter */}
          <select
            value={selectedWinLoss}
            onChange={(e) => setSelectedWinLoss(e.target.value as any)}
            className="bg-[#0B0D0F] border border-[#262B30] rounded-xl px-3 py-1.5 text-[#A7ADB4] focus:outline-none focus:text-[#F5F5F5]"
          >
            <option value="ALL">All Outcomes</option>
            <option value="WIN">Winners Only</option>
            <option value="LOSS">Losses Only</option>
            <option value="BREAKEVEN">Breakevens Only</option>
          </select>

          {/* Session Filter */}
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="bg-[#0B0D0F] border border-[#262B30] rounded-xl px-3 py-1.5 text-[#A7ADB4] focus:outline-none focus:text-[#F5F5F5]"
          >
            <option value="ALL">All Sessions</option>
            <option value="LONDON">London Session</option>
            <option value="NEW_YORK">New York Session</option>
            <option value="ASIA">Asia Session</option>
          </select>

          {/* Tag Filter */}
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="bg-[#0B0D0F] border border-[#262B30] rounded-xl px-3 py-1.5 text-[#A7ADB4] focus:outline-none focus:text-[#F5F5F5]"
          >
            <option value="ALL">All Tags</option>
            <option value="Liquidity Sweep">Liquidity Sweep</option>
            <option value="FVG">Fair Value Gap</option>
            <option value="Order Block">Order Block</option>
            <option value="MSS">Market Structure Shift</option>
            <option value="FOMO">FOMO Entry</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between bg-warning/10 border border-warning/20 px-4 py-2 rounded-xl text-xs">
            <span className="text-warning font-bold">{selectedIds.length} Trades Selected</span>
            <button onClick={handleBulkArchive} className="text-warning hover:underline font-semibold flex items-center gap-1.5">
              <Archive className="w-4 h-4" /> Soft Archive Selected
            </button>
          </div>
        )}
      </div>

      {/* Main Trade Table */}
      <div className="custom-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#262B30] bg-[#0B0D0F] text-[#A7ADB4] font-bold uppercase tracking-wider text-[10px] font-heading">
                <th className="py-3.5 px-4 w-10">
                  <button onClick={toggleSelectAll}>
                    {selectedIds.length > 0 && selectedIds.length === tradesList.length ? (
                      <CheckSquare className="w-4 h-4 text-[#C8FF00]" />
                    ) : (
                      <Square className="w-4 h-4 text-[#6F767D]" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-4">
                  <button
                    onClick={() => {
                      setSortField('entryTime');
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    }}
                    className="flex items-center gap-1 hover:text-[#F5F5F5]"
                  >
                    <span>Date / Time</span> <ArrowUpDown className="w-3 h-3 text-[#C8FF00]" />
                  </button>
                </th>
                <th className="py-3.5 px-4">Symbol</th>
                <th className="py-3.5 px-4">Direction</th>
                <th className="py-3.5 px-4">Entry / Exit</th>
                <th className="py-3.5 px-4">Size</th>
                <th className="py-3.5 px-4">
                  <button
                    onClick={() => {
                      setSortField('rMultiple');
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    }}
                    className="flex items-center gap-1 hover:text-[#F5F5F5]"
                  >
                    <span>R-Multiple</span> <ArrowUpDown className="w-3 h-3 text-[#C8FF00]" />
                  </button>
                </th>
                <th className="py-3.5 px-4">
                  <button
                    onClick={() => {
                      setSortField('netPnL');
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    }}
                    className="flex items-center gap-1 hover:text-[#F5F5F5]"
                  >
                    <span>Net P&L</span> <ArrowUpDown className="w-3 h-3 text-[#C8FF00]" />
                  </button>
                </th>
                <th className="py-3.5 px-4">Strategy & Setup</th>
                <th className="py-3.5 px-4">Session & Tags</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262B30]">
              {tradesList.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-[#6F767D] font-medium">
                    No trades match the active filters. Press "N" to add a new trade.
                  </td>
                </tr>
              ) : (
                tradesList.map((t) => {
                  const isSelected = selectedIds.includes(t.id);
                  return (
                    <tr
                      key={t.id}
                      className={`hover:bg-[#1A1F23] transition-colors ${
                        isSelected ? 'bg-[#C8FF00]/10' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <button onClick={() => toggleSelect(t.id)}>
                          {isSelected ? <CheckSquare className="w-4 h-4 text-[#C8FF00]" /> : <Square className="w-4 h-4 text-[#6F767D]" />}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-[#A7ADB4] font-mono-num">
                        {new Date(t.entryTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#F5F5F5] font-heading tracking-wide">{t.symbol}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                            t.direction === 'LONG' ? 'bg-[#C8FF00]/10 text-[#C8FF00] border border-[#C8FF00]/20' : 'bg-loss/10 text-loss border border-loss/20'
                          }`}
                        >
                          {t.direction}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#A7ADB4] font-mono-num">
                        {t.entryPrice} → {t.exitPrice}
                      </td>
                      <td className="py-3.5 px-4 text-[#A7ADB4] font-mono-num font-semibold">{t.quantity}</td>
                      <td className="py-3.5 px-4 font-bold text-[#C8FF00] font-mono-num">
                        {t.rMultiple >= 0 ? '+' : ''}{t.rMultiple}R
                      </td>
                      <td
                        className={`py-3.5 px-4 font-bold font-mono-num ${
                          t.isWin ? 'text-[#C8FF00]' : t.isLoss ? 'text-loss' : 'text-[#7393B3]'
                        }`}
                      >
                        {formatValue(t.netPnL, undefined, t.initialRisk)}
                      </td>
                      <td className="py-3.5 px-4 text-[#A7ADB4]">
                        <span className="font-semibold block font-heading text-[#F5F5F5]">{t.setup || 'General'}</span>
                        <span className="text-[10px] text-[#6F767D] block truncate max-w-[120px] font-mono-num">{t.account}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          <span className="bg-[#1A1F23] border border-[#262B30] text-[10px] px-1.5 py-0.5 rounded text-[#A7ADB4]">
                            {t.session || 'NY'}
                          </span>
                          {t.tags && t.tags[0] && (
                            <span className="bg-[#C8FF00]/10 text-[#C8FF00] text-[10px] px-1.5 py-0.5 rounded border border-[#C8FF00]/20">
                              {t.tags[0]}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/trades/${t.id}`}
                            className="p-1.5 rounded-lg bg-[#0B0D0F] hover:bg-[#C8FF00]/15 text-[#A7ADB4] hover:text-[#C8FF00] transition-colors"
                            title="Open Workspace"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => duplicateTrade(t.id)}
                            className="p-1.5 rounded-lg bg-[#0B0D0F] hover:bg-[#1A1F23] text-[#6F767D] hover:text-[#F5F5F5] transition-colors"
                            title="Duplicate Trade"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => archiveTrade(t.id)}
                            className="p-1.5 rounded-lg bg-[#0B0D0F] hover:bg-loss/15 text-[#6F767D] hover:text-loss transition-colors"
                            title="Soft Archive Trade"
                          >
                            <Archive className="w-4 h-4" />
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
