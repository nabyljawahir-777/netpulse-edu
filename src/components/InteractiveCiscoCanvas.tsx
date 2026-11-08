import React, { useState, useRef } from 'react';
import { 
  TopologyDevice, 
  TopologyLink, 
  DeviceType,
  CableType,
  ThemeMode,
  ColorBlindMode 
} from '../types';
import { 
  Router as RouterIcon, 
  Network, 
  Server, 
  Laptop, 
  Tv, 
  Printer, 
  Smartphone, 
  ShieldCheck, 
  Wifi, 
  Cable, 
  RotateCcw, 
  Layers,
  Sparkles,
  Zap,
  Flame,
  Trash2,
  X
} from 'lucide-react';

interface InteractiveCiscoCanvasProps {
  devices: TopologyDevice[];
  links: TopologyLink[];
  theme: ThemeMode;
  colorBlind: ColorBlindMode;
  onSelectDevice: (device: TopologyDevice) => void;
  onAddDevice: (type: DeviceType) => void;
  onConnectDevices: (sourceDeviceId: string, targetDeviceId: string, cableType: CableType) => void;
  onDeleteDevice: (deviceId: string) => void;
  onDeleteLink?: (linkId: string) => void;
  onResetTopology: () => void;
  onRandomizeDifficulty: (difficulty: 'beginner' | 'intermediate' | 'advanced') => void;
  currentRound: {
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    round: number;
  };
  selectedDeviceId: string | null;
}

export const InteractiveCiscoCanvas: React.FC<InteractiveCiscoCanvasProps> = ({
  devices,
  links,
  theme,
  colorBlind,
  onSelectDevice,
  onAddDevice,
  onConnectDevices,
  onDeleteDevice,
  onDeleteLink,
  onResetTopology,
  onRandomizeDifficulty,
  currentRound,
  selectedDeviceId,
}) => {
  const [activeCableType, setActiveCableType] = useState<CableType | null>(null);
  const [cablingSourceDeviceId, setCablingSourceDeviceId] = useState<string | null>(null);
  const [isDeleteMode, setIsDeleteMode] = useState(false);

  const [draggingDeviceId, setDraggingDeviceId] = useState<string | null>(null);
  const [devicePositions, setDevicePositions] = useState<Record<string, { x: number; y: number }>>({});
  const canvasRef = useRef<HTMLDivElement>(null);

  const isDark = theme === 'dark';

  const getDevicePos = (dev: TopologyDevice) => {
    if (devicePositions[dev.id]) {
      return devicePositions[dev.id];
    }
    return { x: dev.x, y: dev.y };
  };

  const getDeviceIcon = (type: DeviceType) => {
    switch (type) {
      case 'router':
        return <RouterIcon className="w-5 h-5 text-sky-500" />;
      case 'multilayer_switch':
        return <Layers className="w-5 h-5 text-indigo-500" />;
      case 'switch':
        return <Network className="w-5 h-5 text-indigo-500" />;
      case 'firewall':
        return <ShieldCheck className="w-5 h-5 text-rose-500" />;
      case 'access_point':
        return <Wifi className="w-5 h-5 text-cyan-500" />;
      case 'server':
        return <Server className="w-5 h-5 text-purple-500" />;
      case 'printer':
        return <Printer className="w-5 h-5 text-amber-500" />;
      case 'laptop':
        return <Laptop className="w-5 h-5 text-emerald-500" />;
      case 'smartphone':
        return <Smartphone className="w-5 h-5 text-pink-500" />;
      case 'pc':
      default:
        return <Tv className="w-5 h-5 text-emerald-500" />;
    }
  };

  const getCableStroke = (cable: CableType) => {
    if (colorBlind === 'high_contrast') {
      switch (cable) {
        case 'straight':
          return { color: '#ffffff', dash: 'none' };
        case 'cross':
          return { color: '#facc15', dash: '6 4' };
        case 'console':
          return { color: '#38bdf8', dash: '2 2' };
        case 'serial':
          return { color: '#f43f5e', dash: 'none' };
        case 'coaxial':
          return { color: '#a855f7', dash: '8 4' };
      }
    }

    if (colorBlind === 'protanopia' || colorBlind === 'deuteranopia') {
      switch (cable) {
        case 'straight':
          return { color: '#3b82f6', dash: 'none' };
        case 'cross':
          return { color: '#eab308', dash: '4 3' };
        case 'console':
          return { color: '#06b6d4', dash: '2 2' };
        case 'serial':
          return { color: '#9333ea', dash: 'none' };
        case 'coaxial':
          return { color: '#6366f1', dash: '6 2' };
      }
    }

    switch (cable) {
      case 'straight':
        return { color: '#0284c7', dash: 'none' };
      case 'cross':
        return { color: '#f59e0b', dash: '4 3' };
      case 'console':
        return { color: '#06b6d4', dash: '2 2' };
      case 'serial':
        return { color: '#ef4444', dash: 'none' };
      case 'coaxial':
        return { color: '#8b5cf6', dash: '6 2' };
    }
  };

  const getPortDotColor = () => {
    if (colorBlind === 'high_contrast') return '#ffffff';
    if (colorBlind === 'protanopia' || colorBlind === 'deuteranopia') return '#3b82f6';
    if (colorBlind === 'tritanopia') return '#14b8a6';
    return '#10b981';
  };

  const handleDeviceClick = (dev: TopologyDevice) => {
    if (isDeleteMode) {
      onDeleteDevice(dev.id);
      return;
    }

    if (activeCableType) {
      if (!cablingSourceDeviceId) {
        setCablingSourceDeviceId(dev.id);
      } else if (cablingSourceDeviceId === dev.id) {
        setCablingSourceDeviceId(null);
      } else {
        onConnectDevices(cablingSourceDeviceId, dev.id, activeCableType);
        setCablingSourceDeviceId(null);
        setActiveCableType(null);
      }
    } else {
      onSelectDevice(dev);
    }
  };

  const handleMouseDown = (e: React.MouseEvent, devId: string) => {
    if (activeCableType) return;
    setDraggingDeviceId(devId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingDeviceId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    
    const scrollLeft = canvasRef.current.scrollLeft || 0;
    const scrollTop = canvasRef.current.scrollTop || 0;

    const x = Math.max(20, Math.min(1120, e.clientX - rect.left + scrollLeft - 50));
    const y = Math.max(20, Math.min(640, e.clientY - rect.top + scrollTop - 35));

    setDevicePositions((prev) => ({
      ...prev,
      [draggingDeviceId]: { x, y },
    }));
  };

  const handleMouseUp = () => {
    setDraggingDeviceId(null);
  };

  return (
    <div className={`rounded-2xl border shadow-xl overflow-hidden flex flex-col transition-colors ${
      isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
    }`}>
      
      {/* NetPulse Hardware & Actions Bar */}
      <div className={`px-4 py-3 border-b flex flex-col gap-2.5 text-xs ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
      }`}>
        
        {/* Row 1: Intermediary + 3 Dedicated Difficulty Buttons & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-[10px] uppercase font-bold mr-1 px-2 py-0.5 rounded border ${
              isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-white border-slate-300 text-slate-600'
            }`}>
              Intermediary:
            </span>

            <button
              onClick={() => onAddDevice('router')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded border transition-colors ${
                isDark ? 'bg-slate-800 hover:bg-slate-700 text-sky-300 border-slate-700' : 'bg-white hover:bg-slate-200 text-sky-700 border-slate-300'
              }`}
            >
              <RouterIcon className="w-3.5 h-3.5" />
              <span>Router 2911</span>
            </button>

            <button
              onClick={() => onAddDevice('switch')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded border transition-colors ${
                isDark ? 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border-slate-700' : 'bg-white hover:bg-slate-200 text-indigo-700 border-slate-300'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Switch 2960</span>
            </button>

            <button
              onClick={() => onAddDevice('multilayer_switch')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded border transition-colors ${
                isDark ? 'bg-slate-800 hover:bg-slate-700 text-indigo-200 border-slate-700' : 'bg-white hover:bg-slate-200 text-indigo-700 border-slate-300'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>L3 Switch 3560</span>
            </button>

            <button
              onClick={() => onAddDevice('firewall')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded border transition-colors ${
                isDark ? 'bg-slate-800 hover:bg-slate-700 text-rose-300 border-slate-700' : 'bg-white hover:bg-slate-200 text-rose-700 border-slate-300'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ASA 5505</span>
            </button>

            <button
              onClick={() => onAddDevice('access_point')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded border transition-colors ${
                isDark ? 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border-slate-700' : 'bg-white hover:bg-slate-200 text-cyan-700 border-slate-300'
              }`}
            >
              <Wifi className="w-3.5 h-3.5" />
              <span>AP Wireless</span>
            </button>
          </div>

          {/* 3 Dedicated Difficulty Buttons (Beginner, Intermediate, Advanced) + Reset */}
          <div className="flex items-center gap-1.5 flex-wrap">
            
            {/* 1. Beginner */}
            <button
              onClick={() => onRandomizeDifficulty('beginner')}
              title="Acak tugas tingkat Pemula (3 Putaran)"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${
                currentRound.difficulty === 'beginner'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm ring-2 ring-emerald-500/30'
                  : isDark
                  ? 'bg-slate-800 hover:bg-slate-750 text-emerald-400 border-slate-700'
                  : 'bg-white hover:bg-slate-100 text-emerald-700 border-slate-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>Beginner</span>
              {currentRound.difficulty === 'beginner' && (
                <span className="text-[10px] bg-emerald-800 px-1 rounded text-white ml-0.5">
                  R{currentRound.round}/3
                </span>
              )}
            </button>

            {/* 2. Intermediate */}
            <button
              onClick={() => onRandomizeDifficulty('intermediate')}
              title="Acak tugas tingkat Menengah (3 Putaran)"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${
                currentRound.difficulty === 'intermediate'
                  ? 'bg-sky-600 text-white border-sky-500 shadow-sm ring-2 ring-sky-500/30'
                  : isDark
                  ? 'bg-slate-800 hover:bg-slate-750 text-sky-400 border-slate-700'
                  : 'bg-white hover:bg-slate-100 text-sky-700 border-slate-300'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-sky-300" />
              <span>Intermediate</span>
              {currentRound.difficulty === 'intermediate' && (
                <span className="text-[10px] bg-sky-800 px-1 rounded text-white ml-0.5">
                  R{currentRound.round}/3
                </span>
              )}
            </button>

            {/* 3. Advanced */}
            <button
              onClick={() => onRandomizeDifficulty('advanced')}
              title="Acak tugas tingkat Mahir (3 Putaran)"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${
                currentRound.difficulty === 'advanced'
                  ? 'bg-purple-600 text-white border-purple-500 shadow-sm ring-2 ring-purple-500/30'
                  : isDark
                  ? 'bg-slate-800 hover:bg-slate-750 text-purple-400 border-slate-700'
                  : 'bg-white hover:bg-slate-100 text-purple-700 border-slate-300'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-purple-300" />
              <span>Advanced</span>
              {currentRound.difficulty === 'advanced' && (
                <span className="text-[10px] bg-purple-800 px-1 rounded text-white ml-0.5">
                  R{currentRound.round}/3
                </span>
              )}
            </button>

            {/* Reset */}
            <button
              onClick={onResetTopology}
              title="Reset Topologi Praktikum"
              className={`flex items-center gap-1 px-2.5 py-1 rounded border transition-colors text-xs ml-1 ${
                isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700' : 'bg-white hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            {/* Hapus Objek (Delete Tool) */}
            <button
              onClick={() => {
                setIsDeleteMode(!isDeleteMode);
                setActiveCableType(null);
                setCablingSourceDeviceId(null);
              }}
              title="Mode Hapus: Klik perangkat atau kabel di kanvas untuk menghapusnya"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
                isDeleteMode
                  ? 'bg-rose-600 text-white border-rose-500 shadow-md ring-2 ring-rose-400/40 animate-pulse'
                  : isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-rose-400 hover:text-rose-300 border-slate-700'
                  : 'bg-white hover:bg-slate-100 text-rose-700 border-slate-300'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isDeleteMode ? 'Mode Hapus (Aktif)' : 'Hapus Objek'}</span>
            </button>
          </div>
        </div>

        {/* Row 2: End Devices */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`text-[10px] uppercase font-bold mr-1 px-2 py-0.5 rounded border ${
            isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-white border-slate-300 text-slate-600'
          }`}>
            End Devices:
          </span>

          <button
            onClick={() => onAddDevice('pc')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded border transition-colors text-xs ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border-slate-700' : 'bg-white hover:bg-slate-200 text-emerald-700 border-slate-300'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>PC Workstation</span>
          </button>

          <button
            onClick={() => onAddDevice('laptop')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded border transition-colors text-xs ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border-slate-700' : 'bg-white hover:bg-slate-200 text-emerald-700 border-slate-300'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Laptop</span>
          </button>

          <button
            onClick={() => onAddDevice('server')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded border transition-colors text-xs ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-purple-300 border-slate-700' : 'bg-white hover:bg-slate-200 text-purple-700 border-slate-300'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Web Server</span>
          </button>

          <button
            onClick={() => onAddDevice('printer')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded border transition-colors text-xs ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700' : 'bg-white hover:bg-slate-200 text-amber-700 border-slate-300'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Network Printer</span>
          </button>

          <button
            onClick={() => onAddDevice('smartphone')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded border transition-colors text-xs ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-pink-300 border-slate-700' : 'bg-white hover:bg-slate-200 text-pink-700 border-slate-300'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Smart Phone</span>
          </button>
        </div>

        {/* Row 3: Cisco Connection Cables */}
        <div className={`pt-2 border-t flex flex-wrap items-center gap-2 ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <span className="text-[10px] uppercase font-bold text-sky-500 mr-1 flex items-center gap-1">
            <Cable className="w-3.5 h-3.5" />
            <span>Pilih Kabel:</span>
          </span>

          <button
            onClick={() => {
              setActiveCableType(activeCableType === 'straight' ? null : 'straight');
              setCablingSourceDeviceId(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold border transition-all ${
              activeCableType === 'straight'
                ? 'bg-sky-500 text-white border-sky-400 shadow-md ring-2 ring-sky-400/40'
                : isDark ? 'bg-slate-800 hover:bg-slate-700 text-sky-300 border-slate-700' : 'bg-white hover:bg-slate-200 text-sky-700 border-slate-300'
            }`}
          >
            <span className="w-3 h-0.5 bg-sky-500" />
            <span>Straight-Through</span>
          </button>

          <button
            onClick={() => {
              setActiveCableType(activeCableType === 'cross' ? null : 'cross');
              setCablingSourceDeviceId(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold border transition-all ${
              activeCableType === 'cross'
                ? 'bg-amber-500 text-white border-amber-400 shadow-md ring-2 ring-amber-400/40'
                : isDark ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700' : 'bg-white hover:bg-slate-200 text-amber-700 border-slate-300'
            }`}
          >
            <span className="w-3 h-0.5 border-b border-dashed border-amber-500" />
            <span>Crossover</span>
          </button>

          <button
            onClick={() => {
              setActiveCableType(activeCableType === 'console' ? null : 'console');
              setCablingSourceDeviceId(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold border transition-all ${
              activeCableType === 'console'
                ? 'bg-cyan-500 text-white border-cyan-400 shadow-md ring-2 ring-cyan-400/40'
                : isDark ? 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border-slate-700' : 'bg-white hover:bg-slate-200 text-cyan-700 border-slate-300'
            }`}
          >
            <span className="w-3 h-0.5 bg-cyan-500" />
            <span>Console</span>
          </button>

          <button
            onClick={() => {
              setActiveCableType(activeCableType === 'serial' ? null : 'serial');
              setCablingSourceDeviceId(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold border transition-all ${
              activeCableType === 'serial'
                ? 'bg-rose-500 text-white border-rose-400 shadow-md ring-2 ring-rose-400/40'
                : isDark ? 'bg-slate-800 hover:bg-slate-700 text-rose-300 border-slate-700' : 'bg-white hover:bg-slate-200 text-rose-700 border-slate-300'
            }`}
          >
            <span className="w-3 h-0.5 bg-rose-500" />
            <span>Serial DCE</span>
          </button>

          <button
            onClick={() => {
              setActiveCableType(activeCableType === 'coaxial' ? null : 'coaxial');
              setCablingSourceDeviceId(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold border transition-all ${
              activeCableType === 'coaxial'
                ? 'bg-purple-500 text-white border-purple-400 shadow-md ring-2 ring-purple-400/40'
                : isDark ? 'bg-slate-800 hover:bg-slate-700 text-purple-300 border-slate-700' : 'bg-white hover:bg-slate-200 text-purple-700 border-slate-300'
            }`}
          >
            <span className="w-3 h-0.5 bg-purple-500" />
            <span>Coaxial</span>
          </button>

          {activeCableType && (
            <span className="text-[11px] font-bold text-amber-500 animate-pulse ml-auto">
              Mode Pasang Kabel Aktif &rarr; Klik Device 1, lalu Device 2
            </span>
          )}
        </div>

      </div>

      {/* Delete Mode Active Banner */}
      {isDeleteMode && (
        <div className="bg-rose-600 text-white text-xs font-bold px-4 py-1.5 flex items-center justify-between shadow-sm animate-pulse z-30">
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            <span>Mode Hapus Aktif: Klik perangkat atau kabel di kanvas untuk menghapusnya langsung.</span>
          </div>
          <button
            onClick={() => setIsDeleteMode(false)}
            className="text-white hover:underline text-[11px] font-semibold bg-rose-800 hover:bg-rose-700 px-2.5 py-0.5 rounded cursor-pointer"
          >
            Selesai Menghapus ✕
          </button>
        </div>
      )}

      {/* Main Interactive Workspace with Controlled Scrollable Viewport */}
      <div
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className={`relative w-full h-[460px] overflow-x-auto overflow-y-auto select-none ${
          isDeleteMode ? 'cursor-not-allowed' : 'cursor-crosshair'
        } transition-colors scrollbar-thin ${
          isDark 
            ? 'bg-slate-950 scrollbar-thumb-slate-700 scrollbar-track-slate-900' 
            : 'bg-slate-50 scrollbar-thumb-slate-300 scrollbar-track-slate-100'
        }`}
      >
        <div 
          className={`relative min-w-[1160px] min-h-[640px] transition-colors ${
            isDark
              ? '[background-image:radial-gradient(#0284c7_1px,transparent_1px)] [background-size:24px_24px]'
              : '[background-image:radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px]'
          }`}
        >
          {/* Cable Connection SVG Layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            {links.map((link) => {
              const src = devices.find((d) => d.id === link.sourceDeviceId);
              const tgt = devices.find((d) => d.id === link.targetDeviceId);
              if (!src || !tgt) return null;

              const p1 = getDevicePos(src);
              const p2 = getDevicePos(tgt);

              const x1 = p1.x + 48;
              const y1 = p1.y + 36;
              const x2 = p2.x + 48;
              const y2 = p2.y + 36;

              const strokeInfo = getCableStroke(link.cableType);
              const portDotColor = getPortDotColor();

              return (
                <g key={link.id}>
                  {/* Invisible wide stroke for easy clicking/hover deletion */}
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="transparent"
                    strokeWidth="14"
                    className="pointer-events-auto cursor-pointer hover:stroke-rose-500/40 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteLink?.(link.id);
                    }}
                  >
                    <title>Kabel {link.cableType} (Klik untuk hapus)</title>
                  </line>

                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={strokeInfo.color}
                    strokeWidth="3.5"
                    className="opacity-30 pointer-events-none"
                  />
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={strokeInfo.color}
                    strokeWidth="2"
                    strokeDasharray={strokeInfo.dash}
                    className="pointer-events-none"
                  />
                  <circle cx={x1} cy={y1} r="4.5" fill={portDotColor} stroke="#ffffff" strokeWidth="1" className="pointer-events-none" />
                  <circle cx={x2} cy={y2} r="4.5" fill={portDotColor} stroke="#ffffff" strokeWidth="1" className="pointer-events-none" />
                </g>
              );
            })}
          </svg>

          {/* Render Device Nodes */}
          {devices.map((dev) => {
            const pos = getDevicePos(dev);
            const isSelected = selectedDeviceId === dev.id;
            const isCablingSource = cablingSourceDeviceId === dev.id;
            const primaryIp = dev.ports.find((p) => p.ipAddress && p.ipAddress !== '0.0.0.0')?.ipAddress;

            return (
              <div
                key={dev.id}
                style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
                onMouseDown={(e) => handleMouseDown(e, dev.id)}
                onClick={() => handleDeviceClick(dev)}
                className={`group absolute z-20 cursor-pointer p-2.5 rounded-xl border flex flex-col items-center transition-all ${
                  isDeleteMode
                    ? 'hover:border-rose-500 hover:ring-2 hover:ring-rose-500/50 hover:scale-105'
                    : isCablingSource
                    ? 'bg-amber-500/20 border-amber-500 ring-4 ring-amber-500/40 shadow-xl scale-105'
                    : isSelected
                    ? 'bg-sky-500/20 border-sky-500 ring-2 ring-sky-500/40 shadow-2xl scale-102'
                    : isDark
                    ? 'bg-slate-900/95 hover:bg-slate-850 border-slate-700/80 shadow-md text-white'
                    : 'bg-white hover:bg-slate-100 border-slate-300 shadow-md text-slate-900'
                }`}
              >
                {/* Quick Delete Button on Device */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteDevice(dev.id);
                  }}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center text-xs shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-30 cursor-pointer"
                  title={`Hapus ${dev.name}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <div className={`w-11 h-11 rounded-lg border flex items-center justify-center mb-1 ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}>
                  {getDeviceIcon(dev.type)}
                </div>

                <span className="text-[11px] font-bold text-center whitespace-nowrap leading-tight max-w-[120px] truncate">
                  {dev.name}
                </span>

                <span className={`text-[10px] font-mono mt-0.5 px-1.5 py-0.2 rounded border ${
                  primaryIp
                    ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40'
                    : isDark ? 'bg-slate-950 text-slate-500 border-slate-800' : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}>
                  {primaryIp || 'No IP'}
                </span>

                {dev.dhcpServer?.enabled && (
                  <span className="mt-1 text-[8px] font-black px-1 rounded bg-emerald-500 text-white">
                    DHCP SRV
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Floating Workspace Legend Bar */}
        <div className={`sticky bottom-3 left-4 right-4 z-20 mx-4 flex flex-wrap items-center justify-between gap-2 text-[11px] px-3.5 py-1.5 rounded-lg border backdrop-blur-xs shadow-md ${
          isDark ? 'bg-slate-900/90 border-slate-800 text-slate-400' : 'bg-white/95 border-slate-300 text-slate-600'
        }`}>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-sky-500 inline-block" />
              <span>Straight</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 border-b border-dashed border-amber-500 inline-block" />
              <span>Cross</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-cyan-500 inline-block" />
              <span>Console</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-rose-500 inline-block" />
              <span>Serial</span>
            </span>
          </div>

          <span className="font-medium">
            ↕ ↔ Kanvas dapat di-scroll vertikal & horizontal · Klik tombol Beginner, Intermediate, atau Advanced untuk mengacak putaran (R1-R3)
          </span>
        </div>

      </div>

    </div>
  );
};
