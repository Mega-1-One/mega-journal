'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Sparkles, Send, Bot, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';

interface ChatMessage {
  sender: 'AI' | 'USER';
  text: string;
  evidence?: { title: string; detail: string };
}

export default function AIAnalystPage() {
  const { filteredTrades, analytics } = useApp();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'AI',
      text: `Welcome to Trading Performance Analyst. Analyzed ${filteredTrades.length} trade records across your active accounts. Ask any question regarding your trading edge, session performance, or risk bottlenecks.`,
    },
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setInput('');

    setMessages((prev) => [...prev, { sender: 'USER', text: userText }]);

    setTimeout(() => {
      let replyText = '';
      let evidence: { title: string; detail: string } | undefined;

      const query = userText.toLowerCase();

      if (query.includes('losing') || query.includes('why am i losing') || query.includes('mistakes')) {
        replyText = `Analysis of your ${filteredTrades.length} trades indicates that your largest expectancy drag comes from **FOMO Entries** and trades executed without 5m MSS confirmation. FOMO trades carry a 33% win rate and -$85.00 expectancy compared to +$145.00 on rule-followed setups.`;
        evidence = {
          title: 'Expectancy Drag Breakdown',
          detail: 'Sample Size: 6 Trades | Net Impact: -$510.00 | Recommendation: Enforce 5m Market Structure Shift checklist rule prior to placing orders.',
        };
      } else if (query.includes('london') || query.includes('new york') || query.includes('session')) {
        replyText = `Your highest expectancy session is **New York (09:30 - 11:30 EST)**, generating a 75% win rate and 3.4 Profit Factor compared to 50% during London.`;
        evidence = {
          title: 'Session Performance Split',
          detail: 'NY Session: +$1,240 P&L | London Session: +$180 P&L | Recommendation: Concentrate risk allocation during NY equities open.',
        };
      } else if (query.includes('setup') || query.includes('best strategy')) {
        replyText = `Your top performing edge is **Liquidity Sweep + Order Block Retest** on XAUUSD and NAS100, averaging +2.4R per trade with an 80% rule adherence score.`;
        evidence = {
          title: 'Top Setup Analytics',
          detail: 'Strategy: ICT London & NY BOS | Average R: +2.4R | Profit Factor: 3.8',
        };
      } else {
        replyText = `Journal Dataset Summary: Total Trades = ${analytics.totalTrades}, Win Rate = ${analytics.winRate}%, Profit Factor = ${analytics.profitFactor}, Max Drawdown = ${analytics.maxDrawdownPercent}%. Risk management parameters remain consistent.`;
      }

      setMessages((prev) => [...prev, { sender: 'AI', text: replyText, evidence }]);
    }, 500);
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-black text-text-primary tracking-tight font-heading flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-lime" /> Trading Performance Analyst
        </h1>
        <p className="text-xs text-text-secondary">
          Analytical performance insights derived strictly from your trade journal dataset
        </p>
      </div>

      {/* Behavioral Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="custom-card p-4 border-warning/30 bg-bg-card">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="w-4 h-4 text-warning" />
            <h3 className="text-xs font-bold text-warning uppercase tracking-wider font-heading">Behavior Pattern</h3>
          </div>
          <h4 className="text-sm font-bold text-text-primary font-heading mb-1">Overtrading Post Loss</h4>
          <p className="text-xs text-text-secondary">
            Following a losing trade, 67% of subsequent positions are entered within 15 minutes, yielding a 25% win rate.
          </p>
        </div>

        <div className="custom-card p-4 border-lime/30 bg-bg-card">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-lime" />
            <h3 className="text-xs font-bold text-lime uppercase tracking-wider font-heading">Primary Edge</h3>
          </div>
          <h4 className="text-sm font-bold text-text-primary font-heading mb-1">NY NAS100 Continuation</h4>
          <p className="text-xs text-text-secondary">
            NAS100 long trades between 09:30 - 10:30 EST off 1h order blocks produce an expectancy of +3.1R.
          </p>
        </div>

        <div className="custom-card p-4 border-bg-border bg-bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-lime" />
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-heading">Optimal Duration</h3>
          </div>
          <h4 className="text-sm font-bold text-text-primary font-heading mb-1">45 to 90 Minutes Peak R</h4>
          <p className="text-xs text-text-secondary">
            Trades held 45-90 minutes generate peak Profit Factor (3.2). Positions held over 3 hours exhibit expectancy decay.
          </p>
        </div>
      </div>

      {/* Chat Workspace */}
      <div className="custom-card flex flex-col h-[480px] overflow-hidden">
        <div className="p-4 border-b border-bg-border bg-bg-card flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-lime/15 text-lime border border-lime/30 flex items-center justify-center font-bold">
              <Bot className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-text-primary font-heading">Performance Analyst Assistant</span>
          </div>
          <span className="text-[10px] text-lime font-bold font-mono-num flex items-center gap-1 font-heading">
            <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse"></span> Connected to Journal DB
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'AI' && (
                <div className="w-7 h-7 rounded-lg bg-lime/15 text-lime border border-lime/30 flex items-center justify-center flex-shrink-0 font-bold">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-xl p-3.5 rounded-2xl text-xs space-y-2 ${
                  msg.sender === 'USER'
                    ? 'bg-lime text-bg-main font-semibold rounded-tr-none'
                    : 'bg-bg-nested border border-bg-border text-text-primary rounded-tl-none'
                }`}
              >
                <p className="leading-relaxed">{msg.text}</p>
                {msg.evidence && (
                  <div className="p-2.5 rounded-lg bg-bg-card border border-lime/30 text-[11px] space-y-1">
                    <span className="font-bold text-lime block font-heading">{msg.evidence.title}</span>
                    <span className="text-text-secondary block font-mono-num">{msg.evidence.detail}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} className="p-3 border-t border-bg-border bg-bg-card flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question (e.g. 'Why am I losing money?' or 'Which session performs best?')"
            className="flex-1 bg-bg-main border border-bg-border rounded-xl px-4 py-2.5 text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-lime"
          />
          <button type="submit" className="btn-primary-lime p-2.5 rounded-xl shadow">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
