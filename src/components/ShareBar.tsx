import React, { useState, useEffect } from 'react';
import { ExternalLink, Copy, Check, Printer, Camera, User, Layout, Layers, FileCheck } from 'lucide-react';

interface ShareBarProps {
  activeTab: 'all' | 'persona' | 'mockup' | 'matrix';
  setActiveTab: (tab: 'all' | 'persona' | 'mockup' | 'matrix') => void;
}

export const ShareBar: React.FC<ShareBarProps> = ({ activeTab, setActiveTab }) => {
  const [copied, setCopied] = useState(false);
  const [liveUrl, setLiveUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLiveUrl(window.location.href);
    }
  }, []);

  const handleCopyLink = async () => {
    const url = window.location.href || liveUrl || 'https://ais-dev-f545yuo24uebex644cvlv2-415332333260.asia-southeast1.run.app';
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleOpenCurrentTab = () => {
    // Open current live URL directly in new tab
    const url = window.location.href || 'https://ais-dev-f545yuo24uebex644cvlv2-415332333260.asia-southeast1.run.app';
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="no-print sticky top-0 z-50 bg-slate-900 border-b border-slate-800 shadow-md text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          
          {/* Zone 1: Identity & Assignment */}
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 font-bold text-xs flex items-center justify-center border border-sky-400/30">
              UCD
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-white">Assignment 5 (Group - Project)</span>
                <span className="text-slate-500 text-xs">·</span>
                <span className="text-xs text-sky-400 font-medium">Nabyl Jawahir (20250040073)</span>
              </div>
            </div>
          </div>

          {/* Zone 2: Screenshot Panel Switcher (Single-Line Buttons) */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs overflow-x-auto">
            <button
              onClick={() => setActiveTab('persona')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap font-medium transition-colors ${
                activeTab === 'persona'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-rose-400" />
              <span>Panel 1: Persona (Screenshot)</span>
            </button>

            <button
              onClick={() => setActiveTab('mockup')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap font-medium transition-colors ${
                activeTab === 'mockup'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-indigo-400" />
              <span>Panel 2: Mockup Beranda (Screenshot)</span>
            </button>

            <button
              onClick={() => setActiveTab('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap font-medium transition-colors ${
                activeTab === 'matrix'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Rubrik & Nilai (100 Poin)</span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Semua</span>
            </button>
          </div>

          {/* Zone 3: Direct Live Action Buttons */}
          <div className="flex items-center gap-2 self-end lg:self-auto">
            <button
              onClick={handleCopyLink}
              title="Salin tautan URL aktif sekarang"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin URL'}</span>
            </button>

            <button
              onClick={handlePrint}
              title="Simpan atau cetak sebagai PDF"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>

            <button
              onClick={handleOpenCurrentTab}
              title="Buka URL live di tab peramban baru"
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-sky-400 hover:bg-sky-300 rounded-lg shadow-sm transition-all whitespace-nowrap"
            >
              <span>Buka di Tab Baru</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
