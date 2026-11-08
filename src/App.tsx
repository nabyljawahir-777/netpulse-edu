
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  initialCiscoLabAssignment,
  beginnerAssignments,
  intermediateAssignments,
  advancedAssignments,
  createDefaultPorts
} from './data/labData';
import {
  TopologyDevice,
  TopologyLink,
  DeviceType,
  CableType,
  LabObjective,
  ThemeMode,
  ColorBlindMode,
  AssignmentLab
} from './types';
import { InteractiveCiscoCanvas } from './components/InteractiveCiscoCanvas';
import { DeviceGuiModal } from './components/DeviceGuiModal';
import { ObjectivesPanel } from './components/ObjectivesPanel';
import { ObjectiveCompletionModal } from './components/ObjectiveCompletionModal';
import { IdeIntegrationModal } from './components/IdeIntegrationModal';
import {
  Network,
  ExternalLink,
  Copy,
  Check,
  Sun,
  Moon,
  Eye,
  Sparkles,
  BookOpen,
  Zap,
  Flame,
  Code2,
  Users,
  GraduationCap
} from 'lucide-react';

export default function App() {
  // Theme & Accessibility States
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [colorBlind, setColorBlind] = useState<ColorBlindMode>('normal');

  // Difficulty & 3-Round Tracking State
  const [difficultyState, setDifficultyState] = useState<{
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    round: number;
  }>({
    difficulty: 'intermediate',
    round: 1,
  });

  // Active Assignment Preset
  const [activePreset, setActivePreset] = useState<AssignmentLab>(intermediateAssignments[0]);

  // Topology & LMS state
  const [objectives, setObjectives] = useState<LabObjective[]>(intermediateAssignments[0].objectives);
  const [devices, setDevices] = useState<TopologyDevice[]>(intermediateAssignments[0].topologyPreset.devices);
  const [links, setLinks] = useState<TopologyLink[]>(intermediateAssignments[0].topologyPreset.links);

  const [selectedDevice, setSelectedDevice] = useState<TopologyDevice | null>(null);
  const [completedObjectivePopup, setCompletedObjectivePopup] = useState<LabObjective | null>(null);
  const [isIdeModalOpen, setIsIdeModalOpen] = useState(false);
  const [activeHint, setActiveHint] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [systemAlert, setSystemAlert] = useState<string | null>(
    'NetPulse Edu: Pilih tingkat kesulitan (Beginner, Intermediate, Advanced) untuk memuat 3 putaran assignment acak.'
  );

  const isDark = theme === 'dark';

  // Project Team Members
  const teamMembers = [
    { name: 'Nabyl Jawahir', nim: '20250040073' },
    { name: 'Regith Rayabi', nim: '20250040075' },
    { name: 'M. Nizar Wirapradana', nim: '20250040070' },
    { name: 'Zidane Putra S', nim: '20250040109' },
    { name: 'Faizi Fathir', nim: '20250040066' },
  ];

  // Helper for applying colorblind CSS filter
  const getColorBlindFilterClass = () => {
    switch (colorBlind) {
      case 'protanopia':
        return 'contrast-[1.08] saturate-[1.25] hue-rotate-[15deg]';
      case 'deuteranopia':
        return 'contrast-[1.10] saturate-[1.2] hue-rotate-[340deg]';
      case 'tritanopia':
        return 'contrast-[1.12] saturate-[1.3] hue-rotate-[190deg]';
      case 'high_contrast':
        return 'contrast-[1.35] brightness-[1.05]';
      case 'normal':
      default:
        return '';
    }
  };

  // Compute total points
  const currentScore = objectives
    .filter((o) => o.completed)
    .reduce((acc, curr) => acc + curr.points, 0);

  // Trigger objective completion helper
  const completeObjective = (objectiveType: LabObjective['type']) => {
    setObjectives((prev) => {
      let newlyCompleted: LabObjective | null = null;
      const updated = prev.map((obj) => {
        if (obj.type === objectiveType && !obj.completed) {
          newlyCompleted = { ...obj, completed: true };
          return newlyCompleted;
        }
        return obj;
      });

      if (newlyCompleted) {
        setCompletedObjectivePopup(newlyCompleted);
      }
      return updated;
    });
  };

  // Connect devices with selected cable type
  const handleConnectDevices = (
    sourceDeviceId: string,
    targetDeviceId: string,
    cableType: CableType
  ) => {
    const exists = links.some(
      (l) =>
        (l.sourceDeviceId === sourceDeviceId && l.targetDeviceId === targetDeviceId) ||
        (l.sourceDeviceId === targetDeviceId && l.targetDeviceId === sourceDeviceId)
    );

    if (exists) {
      setSystemAlert('Kabel antara kedua perangkat ini sudah terpasang!');
      return;
    }

    const srcDev = devices.find((d) => d.id === sourceDeviceId);
    const tgtDev = devices.find((d) => d.id === targetDeviceId);

    const newLink: TopologyLink = {
      id: `link-${Date.now()}`,
      sourceDeviceId,
      sourcePortId: srcDev?.ports[0]?.id || `${sourceDeviceId}-port1`,
      targetDeviceId,
      targetPortId: tgtDev?.ports[0]?.id || `${targetDeviceId}-port1`,
      cableType,
      status: 'up',
    };

    setLinks((prev) => [...prev, newLink]);

    setSystemAlert(
      `Kabel ${cableType.toUpperCase()} berhasil disambungkan antara ${srcDev?.name} dan ${tgtDev?.name} (Status: UP).`
    );

    const isStraightBetweenHostAndSwitch =
      cableType === 'straight' &&
      ((['pc', 'laptop'].includes(srcDev?.type || '') && tgtDev?.type === 'switch') ||
        (srcDev?.type === 'switch' && ['pc', 'laptop'].includes(tgtDev?.type || '')) ||
        (['pc', 'laptop'].includes(srcDev?.type || '') && tgtDev?.type === 'multilayer_switch') ||
        (srcDev?.type === 'multilayer_switch' && ['pc', 'laptop'].includes(tgtDev?.type || '')));

    if (isStraightBetweenHostAndSwitch) {
      completeObjective('CONNECT_CABLE');
    }
  };

  const handleAddDevice = (type: DeviceType) => {
    const count = devices.filter((d) => d.type === type).length + 1;
    const newId = `dev-${type}-${Date.now()}`;
    const newDev: TopologyDevice = {
      id: newId,
      name: `${type.toUpperCase()}-${count}`,
      model: `Cisco ${type.toUpperCase()}`,
      type,
      category: ['router', 'switch', 'multilayer_switch', 'firewall', 'access_point'].includes(type)
        ? 'intermediary'
        : 'end_device',
      x: 320 + Math.random() * 200,
      y: 120 + Math.random() * 180,
      macAddress: '00:' + Array.from({ length: 5 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(':').toUpperCase(),
      powerStatus: 'on',
      ports: createDefaultPorts(type, newId),
      cliHistory: [`${type.toUpperCase()}-${count} initialized.`],
    };

    setDevices((prev) => [...prev, newDev]);
    setSystemAlert(`Perangkat ${newDev.name} berhasil ditambahkan ke kanvas topologi.`);
  };

  const handleDeleteDevice = (deviceId: string) => {
    setDevices((prev) => prev.filter((d) => d.id !== deviceId));
    setLinks((prev) => prev.filter((l) => l.sourceDeviceId !== deviceId && l.targetDeviceId !== deviceId));
    if (selectedDevice?.id === deviceId) {
      setSelectedDevice(null);
    }
    setSystemAlert('Perangkat dan kabel yang terhubung berhasil dihapus.');
  };

  const handleDeleteLink = (linkId: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== linkId));
    setSystemAlert('Koneksi kabel berhasil dihapus dari topologi.');
  };

  const handleUpdateDevice = (updated: TopologyDevice) => {
    setDevices((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    if (selectedDevice?.id === updated.id) {
      setSelectedDevice(updated);
    }

    if (
      (updated.type === 'router' || updated.type === 'server' || updated.type === 'multilayer_switch') &&
      updated.dhcpServer?.enabled
    ) {
      completeObjective('ENABLE_DHCP_SERVER');
    }
  };

  const handleTriggerDhcpRequest = (clientDev: TopologyDevice) => {
    const isConnected = links.some(
      (l) => l.sourceDeviceId === clientDev.id || l.targetDeviceId === clientDev.id
    );

    const dhcpRouter = devices.find((d) => d.dhcpServer?.enabled);

    if (!isConnected) {
      setSystemAlert('Gagal DHCP: Perangkat belum tersambung kabel jaringan ke Switch!');
      return;
    }

    if (!dhcpRouter) {
      setSystemAlert('Gagal DHCP: Belum ada Router/Server dengan layanan DHCP Server aktif!');
      return;
    }

    const leasedIp = '192.168.10.35';
    const leasedSubnet = '255.255.255.0';
    const leasedGateway = dhcpRouter.defaultGateway || '192.168.10.1';

    const updatedPorts = clientDev.ports.map((p, idx) => {
      if (idx === 0) {
        return {
          ...p,
          ipAddress: leasedIp,
          subnetMask: leasedSubnet,
        };
      }
      return p;
    });

    const updatedClient: TopologyDevice = {
      ...clientDev,
      isDhcpClient: true,
      defaultGateway: leasedGateway,
      ports: updatedPorts,
      cliHistory: [
        ...clientDev.cliHistory,
        `DHCPDISCOVER sent from ${clientDev.macAddress}...`,
        `DHCPOFFER received from ${leasedGateway} -> Leased IP: ${leasedIp}`,
        `DHCPACK confirmed! Configuration applied.`,
      ],
    };

    handleUpdateDevice(updatedClient);
    setSystemAlert(`Alokasi IP DHCP Sukses: ${clientDev.name} menerima IP ${leasedIp} dari Router.`);

    completeObjective('CONFIGURE_DHCP_CLIENT');
  };

  const handleSendPing = (fromDevId: string, targetIp: string) => {
    const src = devices.find((d) => d.id === fromDevId);
    const hasIp = src?.ports.some((p) => p.ipAddress && p.ipAddress !== '0.0.0.0');

    if (!hasIp) {
      setSystemAlert('Ping Gagal: Perangkat pengirim belum memiliki IP Address yang valid!');
      return;
    }

    const targetDev = devices.find((d) => d.ports.some((p) => p.ipAddress === targetIp));
    const isGateway = targetIp === '192.168.10.1';

    if (targetDev || isGateway) {
      setSystemAlert(`Ping ke ${targetIp} SUKSES: 5 packet ICMP Echo Reply diterima (0% loss).`);
      completeObjective('SUCCESSFUL_PING');
    } else {
      setSystemAlert(`Ping ke ${targetIp} GAGAL: Destination host unreachable.`);
    }
  };

  const handleResetTopology = () => {
    setDevices(activePreset.topologyPreset.devices);
    setLinks(activePreset.topologyPreset.links);
    setObjectives(activePreset.objectives);
    setSelectedDevice(null);
    setSystemAlert('Topologi jaringan telah direset ke setelan awal praktikum.');
  };

  // Randomize difficulty with 3 cycling rounds
  const handleRandomizeDifficulty = (targetDiff: 'beginner' | 'intermediate' | 'advanced') => {
    let nextRound = 1;
    if (difficultyState.difficulty === targetDiff) {
      nextRound = (difficultyState.round % 3) + 1;
    } else {
      nextRound = 1;
    }

    let nextPreset: AssignmentLab;
    if (targetDiff === 'beginner') {
      nextPreset = beginnerAssignments[nextRound - 1];
    } else if (targetDiff === 'intermediate') {
      nextPreset = intermediateAssignments[nextRound - 1];
    } else {
      nextPreset = advancedAssignments[nextRound - 1];
    }

    setDifficultyState({
      difficulty: targetDiff,
      round: nextRound,
    });

    setActivePreset(nextPreset);
    setDevices(nextPreset.topologyPreset.devices);
    setLinks(nextPreset.topologyPreset.links);
    setObjectives(nextPreset.objectives);
    setSelectedDevice(null);

    setSystemAlert(
      `Tingkat ${targetDiff.toUpperCase()} Aktif (Putaran ${nextRound}/3): "${nextPreset.title}"`
    );
  };

  const handleCopyUrl = () => {
    const url = typeof window !== 'undefined'
      ? window.location.href
      : 'https://ais-dev-f545yuo24uebex644cvlv2-415332333260.asia-southeast1.run.app';

    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-all duration-200 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
    } ${getColorBlindFilterClass()}`}>

      {/* Top NetPulse Edu Navigation Bar */}
      <header className={`sticky top-0 z-40 border-b shadow-md transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">

            {/* Brand Title */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
                <Network className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight text-sky-500">NetPulse Edu</span>
                  <span className="text-slate-400 text-xs">|</span>
                  <span className="text-xs font-semibold">LMS Assignment Engine</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Real-time Network Topology Simulator & Interactive Lab Assessment
                </p>
              </div>
            </div>

            {/* Accessibility & Theme Controls */}
            <div className="flex flex-wrap items-center gap-2.5">

              {/* Light / Dark Mode Switch */}
              <div className={`flex items-center p-1 rounded-lg border text-xs ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'
              }`}>
                <button
                  onClick={() => setTheme('light')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
                    theme === 'light'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Switch to Light Mode"
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Light</span>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-800 text-white shadow-xs font-bold'
                      : 'text-slate-500 hover:text-white'
                  }`}
                  title="Switch to Dark Mode"
                >
                  <Moon className="w-3.5 h-3.5 text-sky-400" />
                  <span>Dark</span>
                </button>
              </div>

              {/* Colorblind Selector */}
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'
              }`}>
                <Eye className="w-3.5 h-3.5 text-sky-500" />
                <span className="text-slate-500 text-[11px]">Colorblind:</span>
                <select
                  value={colorBlind}
                  onChange={(e) => setColorBlind(e.target.value as ColorBlindMode)}
                  className={`bg-transparent text-xs font-medium focus:outline-hidden cursor-pointer ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  <option value="normal" className="bg-slate-900 text-white">Normal</option>
                  <option value="protanopia" className="bg-slate-900 text-white">Protanopia (Red-Blind)</option>
                  <option value="deuteranopia" className="bg-slate-900 text-white">Deuteranopia (Green-Blind)</option>
                  <option value="tritanopia" className="bg-slate-900 text-white">Tritanopia (Blue-Blind)</option>
                  <option value="high_contrast" className="bg-slate-900 text-white">High Contrast</option>
                </select>
              </div>

              {/* Copy URL */}
              <button
                onClick={handleCopyUrl}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                {copiedLink
                  ? <Check className="w-3.5 h-3.5 text-emerald-500" />
                  : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Tersalin' : 'Salin URL'}</span>
              </button>

              {/* Pure HTML & CSS */}
              <a
                href="/pure"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 rounded-lg shadow-xs transition-all cursor-pointer"
                title="Buka tampilan murni HTML5 & CSS3 di tab baru"
              >
                <span>⚡ Pure HTML &amp; CSS</span>
                <ExternalLink className="w-3 h-3 text-emerald-400" />
              </a>

              {/* Java Backend & Azure Modal */}
              <button
                onClick={() => setIsIdeModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-amber-600 via-sky-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 rounded-lg shadow-xs transition-all cursor-pointer"
                title="Buka panduan import IntelliJ IDEA Community, deployment Microsoft Azure, dan REST API"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Java &amp; Azure (IntelliJ)</span>
              </button>

              {/* Open in New Tab */}
              <button
                onClick={() => window.open(window.location.href, '_blank')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <span>Buka di Tab Baru</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* Dynamic System Alert Banner */}
        {systemAlert && (
          <div className={`px-4 py-2.5 rounded-xl border flex items-center justify-between text-xs shadow-xs transition-colors ${
            isDark
              ? 'bg-slate-900/90 border-sky-500/30 text-sky-200'
              : 'bg-sky-50 border-sky-200 text-sky-900'
          }`}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-slate-400">[NETPULSE LOG]</span>
              <span>{systemAlert}</span>
            </div>
            <button
              onClick={() => setSystemAlert(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-[11px] ml-4 font-bold"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Cisco Canvas & LMS Objectives Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

          {/* Left Canvas */}
          <div className="lg:col-span-8 space-y-4">
            <InteractiveCiscoCanvas
              devices={devices}
              links={links}
              theme={theme}
              colorBlind={colorBlind}
              onSelectDevice={(dev) => setSelectedDevice(dev)}
              onAddDevice={handleAddDevice}
              onConnectDevices={handleConnectDevices}
              onDeleteDevice={handleDeleteDevice}
              onDeleteLink={handleDeleteLink}
              onResetTopology={handleResetTopology}
              onRandomizeDifficulty={handleRandomizeDifficulty}
              currentRound={difficultyState}
              selectedDeviceId={selectedDevice?.id || null}
            />

            {/* Quick Action Helper */}
            <div className={`rounded-xl p-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-sky-500" />
                    <span>Skenario: {activePreset.title}</span>
                  </span>
                  <span className="px-2 py-0.2 rounded-full bg-sky-500/20 text-sky-400 font-bold text-[10px] uppercase">
                    {difficultyState.difficulty} (Putaran {difficultyState.round}/3)
                  </span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Klik tombol <strong>Beginner</strong>, <strong>Intermediate</strong>, atau <strong>Advanced</strong> di panel atas untuk menguji 3 skenario lab yang berbeda pada setiap level.
                </p>
              </div>

              <button
                onClick={() => {
                  const pc = devices.find((d) => d.type === 'pc' || d.type === 'laptop');
                  if (pc) setSelectedDevice(pc);
                }}
                className={`px-3.5 py-1.5 border rounded-lg font-semibold shrink-0 transition-colors ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                }`}
              >
                Buka GUI Host Client
              </button>
            </div>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-4">
            <ObjectivesPanel
              objectives={objectives}
              currentScore={currentScore}
              totalScore={activePreset.totalPoints}
              theme={theme}
              onSelectObjectiveHint={(hint) => setActiveHint(hint)}
              onSubmitAssignment={() => {
                alert(
                  `Hasil Praktikum NetPulse Edu Berhasil Dikumpulkan!\nTingkat: ${difficultyState.difficulty.toUpperCase()} (Putaran ${difficultyState.round}/3)\nSkenario: ${activePreset.title}\nNilai: ${currentScore}/${activePreset.totalPoints} Poin\nStatus: Terverifikasi di LMS.`
                );
              }}
              assignmentTitle={activePreset.title}
              deadline={activePreset.deadline}
            />
          </div>
        </div>
      </main>

      {/* Cisco Device GUI Modal */}
      {selectedDevice && (
        <DeviceGuiModal
          device={selectedDevice}
          theme={theme}
          colorBlind={colorBlind}
          onClose={() => setSelectedDevice(null)}
          onUpdateDevice={handleUpdateDevice}
          onTriggerDhcpRequest={handleTriggerDhcpRequest}
          onSendPing={handleSendPing}
          onVlanCreated={(vlanId) => {
            completeObjective('CONFIGURE_VLAN');
            setSystemAlert(`VLAN ${vlanId} berhasil dikonfigurasi pada Switch! Objective selesai.`);
          }}
        />
      )}

      {/* Objective Completed Popup */}
      {completedObjectivePopup && (
        <ObjectiveCompletionModal
          objective={completedObjectivePopup}
          currentPoints={currentScore}
          totalPoints={activePreset.totalPoints}
          onClose={() => setCompletedObjectivePopup(null)}
        />
      )}

      {/* Hint Modal */}
      {activeHint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className={`border w-full max-w-sm rounded-xl p-5 shadow-2xl space-y-3 ${
            isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
          }`}>
            <div className="flex items-center gap-2 text-sky-500 font-bold text-xs uppercase">
              <BookOpen className="w-4 h-4" />
              <span>Petunjuk Langkah Pengerjaan</span>
            </div>
            <p className={`text-xs leading-relaxed p-3 rounded-lg border ${
              isDark ? 'bg-slate-950 text-slate-300 border-slate-800' : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}>
              {activeHint}
            </p>
            <button
              onClick={() => setActiveHint(null)}
              className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Mengerti &amp; Lanjutkan Praktikum
            </button>
          </div>
        </div>
      )}

      {/* IDE & Multi-Language Backend Integration Modal */}
      <IdeIntegrationModal
        isOpen={isIdeModalOpen}
        onClose={() => setIsIdeModalOpen(false)}
        isDark={isDark}
        devicesCount={devices.length}
        linksCount={links.length}
        currentScore={currentScore}
      />

      {/* Footer */}
      <footer className={`border-t mt-auto transition-colors ${
        isDark
          ? 'bg-slate-900 border-slate-800 text-slate-400'
          : 'bg-white border-slate-200 text-slate-600'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">

          {/* Project Identity */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white">
                <Network className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-sky-500 text-sm">NetPulse Edu</div>
                <div className="text-[11px] text-slate-500">
                  Interactive Network Topology &amp; Real-time LMS Assignment System
                </div>
              </div>
            </div>

            <span className="text-[11px] text-slate-500">
              Aksesibilitas Aktif: Light/Dark Mode · 3 Tingkat Kesulitan · 3 Putaran
            </span>
          </div>

          {/* Project Team Section */}
          <div className={`border-t pt-5 ${
            isDark ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-sky-500" />
              <h3 className={`font-bold text-sm ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}>
                Project Team
              </h3>
              <span className="text-[10px] text-slate-500">
                · Anggota Kelompok
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {teamMembers.map((member, index) => (
                <div
                  key={member.nim}
                  className={`rounded-xl border p-3 flex items-start gap-3 transition-colors ${
                    isDark
                      ? 'bg-slate-950/70 border-slate-800 hover:border-sky-500/50'
                      : 'bg-slate-50 border-slate-200 hover:border-sky-300'
                  }`}
                >
                  <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${
                    isDark
                      ? 'bg-sky-500/10 text-sky-400'
                      : 'bg-sky-100 text-sky-700'
                  }`}>
                    {index === 0
                      ? <GraduationCap className="w-4 h-4" />
                      : <Users className="w-4 h-4" />}
                  </div>

                  <div className="min-w-0">
                    <p className={`text-xs font-semibold leading-relaxed ${
                      isDark ? 'text-slate-200' : 'text-slate-800'
                    }`}>
                      {member.name}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">
                      {member.nim}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Copyright */}
          <div className={`border-t pt-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-500 ${
            isDark ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <span>© {new Date().getFullYear()} NetPulse Edu. All rights reserved.</span>
            <span>Educational Network Simulation Project</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
