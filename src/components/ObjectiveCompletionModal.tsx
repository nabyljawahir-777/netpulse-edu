import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Award, ArrowRight, Zap, X } from 'lucide-react';
import { LabObjective } from '../types';

interface ObjectiveCompletionModalProps {
  objective: LabObjective | null;
  currentPoints: number;
  totalPoints: number;
  onClose: () => void;
  onNextObjective?: () => void;
}

export const ObjectiveCompletionModal: React.FC<ObjectiveCompletionModalProps> = ({
  objective,
  currentPoints,
  totalPoints,
  onClose,
  onNextObjective,
}) => {
  useEffect(() => {
    if (objective) {
      // Trigger festive confetti blast
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0284c7', '#38bdf8', '#10b981', '#f59e0b', '#6366f1'],
        });
      } catch (e) {
        // Safe fallback if canvas not available
      }
    }
  }, [objective]);

  if (!objective) return null;

  const isAllComplete = currentPoints >= totalPoints;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-emerald-500/80 w-full max-w-md rounded-2xl shadow-2xl p-6 text-slate-100 relative overflow-hidden">
        
        {/* Glow corner decorative */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Success Icon */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-400 block">
              Objective Real-time Selesai!
            </span>
            <h3 className="text-lg font-bold text-white leading-tight">
              {objective.title}
            </h3>
          </div>
        </div>

        {/* Description & Points earned */}
        <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 space-y-2 mb-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            {objective.description}
          </p>

          <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Poin Diperoleh:</span>
            <span className="text-emerald-400 font-bold text-sm">+{objective.points} Poin</span>
          </div>
        </div>

        {/* Total Score Progress Bar */}
        <div className="space-y-1.5 mb-5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Total Nilai Assignment Lab:</span>
            <span className="font-bold text-white font-mono">
              {currentPoints} / {totalPoints} Poin
            </span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (currentPoints / totalPoints) * 100)}%` }}
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          {isAllComplete ? (
            <div className="w-full bg-emerald-950/60 border border-emerald-700 p-2.5 rounded-xl text-center">
              <span className="text-xs font-bold text-emerald-300 flex items-center justify-center gap-1.5">
                <Award className="w-4 h-4" />
                <span>Selamat! Semua Objective Praktikum Berhasil Diselesaikan (100 Poin Penuh)</span>
              </span>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-600/20"
            >
              <span>Lanjut ke Objective Berikutnya</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
