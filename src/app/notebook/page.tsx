'use client';

import React, { useState } from 'react';
import { FileText } from 'lucide-react';

export default function NotebookPage() {
  const [notes] = useState([
    {
      id: 'n-1',
      title: 'Weekly Post-Mortem & Focus Areas',
      folder: 'Weekly Reviews',
      content: 'Focus for next week: Do not trade prior to 09:30 EST open. Wait for liquidity sweep.',
      date: 'Aug 15, 2026',
    },
    {
      id: 'n-2',
      title: 'ICT Silver Bullet Model Cheat Sheet',
      folder: 'Strategy Notes',
      content: 'Look for FVG formed between 10:00 - 11:00 AM EST. Minimum 1:2 R/R target.',
      date: 'Aug 12, 2026',
    },
  ]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight font-heading flex items-center gap-2">
            <FileText className="w-5 h-5 text-lime" /> Notebook
          </h1>
          <p className="text-xs text-text-secondary">Structured markdown notes, strategy cheat sheets, and weekly reviews</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {notes.map((note) => (
          <div key={note.id} className="custom-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-lime/10 text-lime border border-lime/20 font-heading">
                {note.folder}
              </span>
              <span className="text-[10px] text-text-muted font-mono-num">{note.date}</span>
            </div>
            <h3 className="text-sm font-bold text-text-primary font-heading">{note.title}</h3>
            <p className="text-xs text-text-secondary line-clamp-3">{note.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
