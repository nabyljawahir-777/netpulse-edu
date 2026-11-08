import React from 'react';
import { LabObjective, ThemeMode } from '../types';
import { 
  CheckCircle2, 
  Circle, 
  Award, 
  HelpCircle, 
  FileCheck 
} from 'lucide-react';

interface ObjectivesPanelProps {
  objectives: LabObjective[];
  currentScore: number;
  totalScore: number;
  theme: ThemeMode;
  onSelectObjectiveHint: (hint: string) => void;
  onSubmitAssignment: () => void;
  assignmentTitle: string;
  deadline: string;
}

export const ObjectivesPanel: React.FC<ObjectivesPanelProps> = ({
  objectives,
  currentScore,
  totalScore,
  theme,
  onSelectObjectiveHint,
  onSubmitAssignment,
  assignmentTitle,
  deadline,
}) => {
  const completedCount = objectives.filter((o) => o.completed).length;
  const isAllComplete = completedCount === objectives.length;
  const isDark = theme === 'dark';

  return (
    <div className={`rounded-2xl border shadow-xl overflow-hidden flex flex-col justify-between transition-colors ${
      isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      
      {/* Panel LMS Header */}
      <div className={`p-4 border-b ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-500 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/30">
            Sistem LMS Real-time
          </span>
          <span className="text-xs text-slate-500 font-mono">Batas: {deadline}</span>
        </div>

        <h3 className="text-sm font-bold leading-snug">
          {assignmentTitle}
        </h3>

        {/* Live Score Counter Card */}
        <div className={`mt-3 p-3 rounded-xl border flex items-center justify-between ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Nilai Praktikum</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-extrabold text-emerald-500 font-mono">{currentScore}</span>
              <span className="text-xs text-slate-500 font-mono">/ {totalScore} Poin</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Progres Objective</span>
            <span className="text-sm font-bold font-mono">
              {completedCount} dari {objectives.length} Selesai
            </span>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
          <div 
            className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${Math.min(100, (currentScore / totalScore) * 100)}%` }}
          />
        </div>
      </div>

      {/* Objectives Checklist with Real-time Status */}
      <div className="p-4 space-y-3 overflow-y-auto max-h-[380px]">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
          <span>Daftar Objective Praktikum</span>
          <span>Status</span>
        </div>

        {objectives.map((obj, idx) => (
          <div 
            key={obj.id}
            className={`p-3 rounded-xl border transition-all ${
              obj.completed
                ? isDark
                  ? 'bg-emerald-950/30 border-emerald-800/80'
                  : 'bg-emerald-50 border-emerald-300'
                : isDark
                ? 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                {obj.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className={`text-xs font-bold leading-tight ${
                    obj.completed ? 'text-emerald-500' : ''
                  }`}>
                    {idx + 1}. {obj.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    {obj.description}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  obj.completed 
                    ? 'bg-emerald-500/20 text-emerald-500' 
                    : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'
                }`}>
                  +{obj.points} Poin
                </span>
              </div>
            </div>

            {/* Hint link */}
            <div className={`mt-2 pt-2 border-t flex items-center justify-between text-[10px] ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <button
                onClick={() => onSelectObjectiveHint(obj.hint)}
                className="text-sky-500 hover:text-sky-600 flex items-center gap-1 font-medium"
              >
                <HelpCircle className="w-3 h-3" />
                <span>Petunjuk Pengerjaan</span>
              </button>

              <span className={`font-semibold ${
                obj.completed ? 'text-emerald-500' : 'text-amber-500'
              }`}>
                {obj.completed ? 'COMPLETED' : 'PENDING'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Submit Assignment Footer */}
      <div className={`p-4 border-t ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <button
          onClick={onSubmitAssignment}
          className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
            isAllComplete
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 animate-pulse'
              : isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>{isAllComplete ? 'Kumpulkan Tugas Assignment (100 Poin Penuh)' : 'Kumpulkan Status Progres Tugas'}</span>
        </button>
      </div>

    </div>
  );
};
