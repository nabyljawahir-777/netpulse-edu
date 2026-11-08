import React, { useState } from 'react';
import { 
  TopologyDevice, 
  DevicePort, 
  CableType, 
  VlanConfig,
  ThemeMode,
  ColorBlindMode,
  CliPanelHeight,
  CliFontSize
} from '../types';
import { 
  X, 
  Terminal as TerminalIcon, 
  Settings, 
  Power, 
  Globe, 
  Cpu, 
  Hash, 
  Play, 
  Layers, 
  Wifi, 
  Type, 
  Maximize2, 
  Minimize2,
  Trash2,
  HelpCircle
} from 'lucide-react';

interface DeviceGuiModalProps {
  device: TopologyDevice;
  theme: ThemeMode;
  colorBlind: ColorBlindMode;
  onClose: () => void;
  onUpdateDevice: (updated: TopologyDevice) => void;
  onTriggerDhcpRequest: (device: TopologyDevice) => void;
  onSendPing: (fromDevId: string, targetIp: string) => void;
  onVlanCreated?: (vlanId: number) => void;
}

export const DeviceGuiModal: React.FC<DeviceGuiModalProps> = ({
  device,
  theme,
  colorBlind,
  onClose,
  onUpdateDevice,
  onTriggerDhcpRequest,
  onSendPing,
  onVlanCreated,
}) => {
  const [activeTab, setActiveTab] = useState<'physical' | 'config' | 'desktop' | 'cli'>('config');
  const [selectedSubMenu, setSelectedSubMenu] = useState<'global' | 'ports' | 'vlan' | 'dhcp'>('ports');
  const [selectedPortId, setSelectedPortId] = useState<string>(device.ports[0]?.id || '');

  // CLI adjustments
  const [cliPanelHeight, setCliPanelHeight] = useState<CliPanelHeight>('normal');
  const [cliFontSize, setCliFontSize] = useState<CliFontSize>('sm');

  // Global settings
  const [deviceName, setDeviceName] = useState(device.name);
  const [defaultGateway, setDefaultGateway] = useState(device.defaultGateway || '192.168.10.1');
  const [dnsServer, setDnsServer] = useState(device.dnsServer || '8.8.8.8');
  const [powerOn, setPowerOn] = useState(device.powerStatus === 'on');

  // Selected port settings
  const selectedPort = device.ports.find((p) => p.id === selectedPortId) || device.ports[0];
  const [portIp, setPortIp] = useState(selectedPort?.ipAddress || '');
  const [portSubnet, setPortSubnet] = useState(selectedPort?.subnetMask || '255.255.255.0');
  const [portStatus, setPortStatus] = useState<'up' | 'down'>(selectedPort?.status || 'up');
  const [portMac, setPortMac] = useState(selectedPort?.macAddress || device.macAddress);
  const [portMode, setPortMode] = useState<'access' | 'trunk'>(selectedPort?.mode || 'access');
  const [portVlan, setPortVlan] = useState<number>(selectedPort?.vlan || 1);

  // DHCP Server Service
  const [dhcpPoolEnabled, setDhcpPoolEnabled] = useState(device.dhcpServer?.enabled || false);
  const [poolName, setPoolName] = useState(device.dhcpServer?.poolName || 'CISCO_LAB_POOL');
  const [dhcpNetwork, setDhcpNetwork] = useState(device.dhcpServer?.network || '192.168.10.0');
  const [dhcpDefRouter, setDhcpDefRouter] = useState(device.dhcpServer?.defaultRouter || '192.168.10.1');
  const [dhcpStartIp, setDhcpStartIp] = useState(device.dhcpServer?.startIp || '192.168.10.20');

  // VLAN Database
  const [vlans, setVlans] = useState<VlanConfig[]>(
    device.vlans || [{ id: 1, name: 'default', status: 'active', ports: ['Fa0/1', 'Fa0/2'] }]
  );
  const [newVlanId, setNewVlanId] = useState('10');
  const [newVlanName, setNewVlanName] = useState('LAB_TI');

  // CLI terminal state
  const [cliInput, setCliInput] = useState('');
  const [cliHistory, setCliHistory] = useState<string[]>(device.cliHistory || []);
  const [pingTargetIp, setPingTargetIp] = useState('192.168.10.1');

  // Color mappings based on ColorBlind mode
  const getPortIndicatorColor = (status: 'up' | 'down') => {
    if (colorBlind === 'high_contrast') {
      return status === 'up' ? 'bg-cyan-400 border-white' : 'bg-rose-500 border-white';
    }
    if (colorBlind === 'protanopia' || colorBlind === 'deuteranopia') {
      return status === 'up' ? 'bg-blue-500' : 'bg-amber-500';
    }
    if (colorBlind === 'tritanopia') {
      return status === 'up' ? 'bg-teal-400' : 'bg-pink-500';
    }
    return status === 'up' ? 'bg-emerald-400' : 'bg-rose-500';
  };

  // Height resolver for CLI panel
  const getCliHeightClass = () => {
    switch (cliPanelHeight) {
      case 'compact':
        return 'h-48';
      case 'expanded':
        return 'h-96';
      case 'normal':
      default:
        return 'h-64';
    }
  };

  // Font size resolver for CLI
  const getCliFontSizeClass = () => {
    switch (cliFontSize) {
      case 'xs':
        return 'text-[11px] leading-relaxed';
      case 'base':
        return 'text-sm leading-relaxed';
      case 'lg':
        return 'text-base leading-loose';
      case 'sm':
      default:
        return 'text-xs leading-relaxed';
    }
  };

  const handleSavePortConfig = () => {
    if (!selectedPort) return;
    const updatedPorts = device.ports.map((p) => {
      if (p.id === selectedPort.id) {
        return {
          ...p,
          ipAddress: portIp,
          subnetMask: portSubnet,
          status: portStatus,
          macAddress: portMac,
          mode: portMode,
          vlan: portVlan,
        };
      }
      return p;
    });

    const updatedDev: TopologyDevice = {
      ...device,
      name: deviceName,
      defaultGateway,
      dnsServer,
      powerStatus: powerOn ? 'on' : 'off',
      ports: updatedPorts,
      cliHistory: [
        ...cliHistory,
        `[CONFIG] Port ${selectedPort.name} updated: IP ${portIp || 'None'}, Status ${portStatus.toUpperCase()}`,
      ],
    };

    onUpdateDevice(updatedDev);
  };

  const handleToggleDhcpServer = () => {
    const nextState = !dhcpPoolEnabled;
    setDhcpPoolEnabled(nextState);

    const updatedDev: TopologyDevice = {
      ...device,
      dhcpServer: {
        enabled: nextState,
        poolName,
        network: dhcpNetwork,
        subnetMask: '255.255.255.0',
        defaultRouter: dhcpDefRouter,
        dnsServer,
        startIp: dhcpStartIp,
        maxUsers: 80,
      },
      cliHistory: [
        ...cliHistory,
        nextState 
          ? `Router(config)# service dhcp\nRouter(config)# ip dhcp pool ${poolName}\nRouter(dhcp-config)# network ${dhcpNetwork} 255.255.255.0\nRouter(dhcp-config)# default-router ${dhcpDefRouter}`
          : `Router(config)# no service dhcp`,
      ],
    };

    onUpdateDevice(updatedDev);
  };

  const handleAddVlan = () => {
    const idNum = parseInt(newVlanId, 10);
    if (isNaN(idNum) || vlans.some((v) => v.id === idNum)) return;

    const newVlan: VlanConfig = {
      id: idNum,
      name: newVlanName || `VLAN_${idNum}`,
      status: 'active',
      ports: ['FastEthernet0/2', 'FastEthernet0/3'],
    };

    const nextVlans = [...vlans, newVlan];
    setVlans(nextVlans);

    const updatedDev: TopologyDevice = {
      ...device,
      vlans: nextVlans,
      cliHistory: [
        ...cliHistory,
        `Switch(config)# vlan ${idNum}\nSwitch(config-vlan)# name ${newVlan.name}\nSwitch(config-vlan)# state active`,
      ],
    };

    onUpdateDevice(updatedDev);
    if (onVlanCreated) {
      onVlanCreated(idNum);
    }
  };

  const handleCliSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliInput.trim()) return;

    const cmd = cliInput.trim();
    let reply = '';

    if (cmd.toLowerCase() === 'show ip interface brief') {
      reply = device.ports
        .map((p) => `${p.name.padEnd(24)} ${p.ipAddress || 'unassigned'}     YES unset ${p.status.toUpperCase()}`)
        .join('\n');
    } else if (cmd.toLowerCase() === 'show vlan brief') {
      reply = vlans
        .map((v) => `${v.id.toString().padEnd(4)} ${v.name.padEnd(16)} ${v.status}    ${v.ports.join(', ')}`)
        .join('\n');
    } else if (cmd.toLowerCase() === 'ipconfig' || cmd.toLowerCase() === 'ipconfig /all') {
      reply = `Physical Address. . . . . . . : ${device.macAddress}\nIPv4 Address. . . . . . . . . : ${device.ports[0]?.ipAddress || '0.0.0.0'}\nSubnet Mask . . . . . . . . . : ${device.ports[0]?.subnetMask || '0.0.0.0'}\nDefault Gateway . . . . . . . : ${device.defaultGateway || '0.0.0.0'}`;
    } else if (cmd.toLowerCase().startsWith('ping ')) {
      const target = cmd.split(' ')[1];
      reply = `Sending 5, 100-byte ICMP Echos to ${target}, timeout is 2 seconds:\n!!!!!\nSuccess rate is 100 percent (5/5), round-trip min/avg/max = 1/2/4 ms`;
      onSendPing(device.id, target);
    } else if (cmd.toLowerCase() === 'clear') {
      setCliHistory([]);
      setCliInput('');
      return;
    } else if (cmd.toLowerCase() === 'enable') {
      reply = `${device.name}#`;
    } else if (cmd.toLowerCase() === 'help') {
      reply = 'Available commands: show ip interface brief, show vlan brief, ipconfig, ping <ip>, clear, help';
    } else {
      reply = `Command acknowledged: "${cmd}"`;
    }

    const nextHist = [...cliHistory, `${device.name}> ${cmd}`, reply];
    setCliHistory(nextHist);
    onUpdateDevice({ ...device, cliHistory: nextHist });
    setCliInput('');
  };

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs">
      <div className={`w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col border transition-colors max-h-[92vh] ${
        isDark 
          ? 'bg-slate-900 border-slate-700 text-slate-100' 
          : 'bg-white border-slate-300 text-slate-900'
      }`}>
        
        {/* Modal Window Header */}
        <div className={`px-5 py-3 border-b flex items-center justify-between ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-500 font-mono font-bold flex items-center justify-center text-xs border border-sky-500/30">
              {device.type.toUpperCase().slice(0, 3)}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base leading-none">{device.name}</h3>
                <span className="text-[11px] text-slate-500">({device.model})</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Cisco Systems, Inc. Device Configuration & Port Manager
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const nextPower = !powerOn;
                setPowerOn(nextPower);
                onUpdateDevice({ ...device, powerStatus: nextPower ? 'on' : 'off' });
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                powerOn
                  ? 'bg-emerald-950/40 border-emerald-500 text-emerald-500'
                  : 'bg-rose-950/40 border-rose-500 text-rose-500'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{powerOn ? 'Power: ON' : 'Power: OFF'}</span>
            </button>

            <button
              onClick={onClose}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-600'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cisco Navigation Tabs */}
        <div className={`px-5 py-2 border-b flex items-center gap-2 text-xs overflow-x-auto ${
          isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <button
            onClick={() => setActiveTab('physical')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'physical'
                ? 'bg-sky-600 text-white shadow-xs'
                : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Physical Chassis</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'config'
                ? 'bg-sky-600 text-white shadow-xs'
                : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Config (GUI Ports & VLAN)</span>
          </button>

          <button
            onClick={() => setActiveTab('desktop')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'desktop'
                ? 'bg-sky-600 text-white shadow-xs'
                : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{device.category === 'end_device' ? 'Desktop / IP Tools' : 'Services & Routing'}</span>
          </button>

          <button
            onClick={() => setActiveTab('cli')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'cli'
                ? 'bg-sky-600 text-white shadow-xs'
                : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <TerminalIcon className="w-3.5 h-3.5" />
            <span>CLI (Command Prompt)</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto flex-1">
          
          {/* TAB: CONFIG (GUI PORTS, IP, MAC, VLAN, GLOBAL) */}
          {activeTab === 'config' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              
              {/* Left Tree SubMenu */}
              <div className={`md:col-span-4 rounded-xl border p-3 space-y-3 ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block px-1">
                  Navigasi Modul GUI
                </span>

                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedSubMenu('global')}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between ${
                      selectedSubMenu === 'global'
                        ? 'bg-sky-600 text-white'
                        : isDark ? 'text-slate-300 hover:bg-slate-850' : 'text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>GLOBAL Settings</span>
                    <Settings className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setSelectedSubMenu('ports')}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between ${
                      selectedSubMenu === 'ports'
                        ? 'bg-sky-600 text-white'
                        : isDark ? 'text-slate-300 hover:bg-slate-850' : 'text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>INTERFACE Ports ({device.ports.length})</span>
                    <Hash className="w-3.5 h-3.5" />
                  </button>

                  {(device.type === 'switch' || device.type === 'multilayer_switch') && (
                    <button
                      onClick={() => setSelectedSubMenu('vlan')}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between ${
                        selectedSubMenu === 'vlan'
                          ? 'bg-sky-600 text-white'
                          : isDark ? 'text-slate-300 hover:bg-slate-850' : 'text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>VLAN Database</span>
                      <Layers className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {(device.type === 'router' || device.type === 'server' || device.type === 'multilayer_switch') && (
                    <button
                      onClick={() => setSelectedSubMenu('dhcp')}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between ${
                        selectedSubMenu === 'dhcp'
                          ? 'bg-sky-600 text-white'
                          : isDark ? 'text-slate-300 hover:bg-slate-850' : 'text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>DHCP Pool Server</span>
                      <Wifi className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {selectedSubMenu === 'ports' && (
                  <div className={`pt-2 border-t space-y-1 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block px-1">Pilih Port:</span>
                    {device.ports.map((port) => (
                      <button
                        key={port.id}
                        onClick={() => {
                          setSelectedPortId(port.id);
                          setPortIp(port.ipAddress || '');
                          setPortSubnet(port.subnetMask || '255.255.255.0');
                          setPortStatus(port.status);
                          setPortMac(port.macAddress);
                          setPortMode(port.mode || 'access');
                          setPortVlan(port.vlan || 1);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] font-mono flex items-center justify-between transition-colors ${
                          selectedPort.id === port.id
                            ? 'bg-sky-600 text-white font-bold'
                            : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-850' : 'text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <span className="truncate">{port.name}</span>
                        <span className={`w-2 h-2 rounded-full ${getPortIndicatorColor(port.status)}`} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Detail Pane */}
              <div className={`md:col-span-8 rounded-xl border p-5 space-y-4 ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                
                {/* SUBMENU: PORTS */}
                {selectedSubMenu === 'ports' && selectedPort && (
                  <div className="space-y-4">
                    <div className={`flex items-center justify-between border-b pb-3 ${
                      isDark ? 'border-slate-800' : 'border-slate-200'
                    }`}>
                      <div>
                        <span className="text-xs uppercase tracking-wider font-bold text-sky-500">
                          Port Interface Settings
                        </span>
                        <h4 className="text-base font-bold font-mono">{selectedPort.name}</h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold">Status Port:</label>
                        <button
                          onClick={() => setPortStatus(portStatus === 'up' ? 'down' : 'up')}
                          className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                            portStatus === 'up'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-rose-600 text-white'
                          }`}
                        >
                          {portStatus.toUpperCase()}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <label className="text-slate-500 font-semibold">MAC Address (Hardware)</label>
                        <input
                          type="text"
                          value={portMac}
                          onChange={(e) => setPortMac(e.target.value)}
                          className={`w-full border rounded-lg px-3 py-2 font-mono text-xs ${
                            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-500 font-semibold">Tipe Media</label>
                        <div className={`border rounded-lg px-3 py-2 font-mono text-xs uppercase ${
                          isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-300 text-slate-600'
                        }`}>
                          {selectedPort.type} (Full-Duplex 100/1000 Mbps)
                        </div>
                      </div>
                    </div>

                    {(device.type === 'router' || device.category === 'end_device' || device.type === 'firewall') && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
                        <div className="space-y-1">
                          <label className="text-slate-500 font-semibold">IPv4 Address</label>
                          <input
                            type="text"
                            value={portIp}
                            onChange={(e) => setPortIp(e.target.value)}
                            placeholder="192.168.10.1"
                            className={`w-full border rounded-lg px-3 py-2 font-mono text-xs ${
                              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-500 font-semibold">Subnet Mask</label>
                          <input
                            type="text"
                            value={portSubnet}
                            onChange={(e) => setPortSubnet(e.target.value)}
                            placeholder="255.255.255.0"
                            className={`w-full border rounded-lg px-3 py-2 font-mono text-xs ${
                              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>
                      </div>
                    )}

                    {(device.type === 'switch' || device.type === 'multilayer_switch') && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
                        <div className="space-y-1">
                          <label className="text-slate-500 font-semibold">Switchport Mode</label>
                          <select
                            value={portMode}
                            onChange={(e) => setPortMode(e.target.value as 'access' | 'trunk')}
                            className={`w-full border rounded-lg px-3 py-2 text-xs ${
                              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          >
                            <option value="access">Access Mode</option>
                            <option value="trunk">Trunk Mode (802.1Q)</option>
                          </select>
                        </div>

                        {portMode === 'access' && (
                          <div className="space-y-1">
                            <label className="text-slate-500 font-semibold">VLAN Membership</label>
                            <select
                              value={portVlan}
                              onChange={(e) => setPortVlan(parseInt(e.target.value, 10))}
                              className={`w-full border rounded-lg px-3 py-2 text-xs font-mono ${
                                isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                              }`}
                            >
                              {vlans.map((v) => (
                                <option key={v.id} value={v.id}>
                                  VLAN {v.id} - {v.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    )}

                    <div className={`flex justify-end pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                      <button
                        onClick={handleSavePortConfig}
                        className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg text-xs transition-colors"
                      >
                        Terapkan Perubahan Port
                      </button>
                    </div>
                  </div>
                )}

                {/* SUBMENU: GLOBAL */}
                {selectedSubMenu === 'global' && (
                  <div className="space-y-4">
                    <h4 className={`text-xs uppercase tracking-wider font-bold text-sky-500 border-b pb-2 ${
                      isDark ? 'border-slate-800' : 'border-slate-200'
                    }`}>
                      Global Parameter Settings
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <label className="text-slate-500 font-semibold">Display / Hostname</label>
                        <input
                          type="text"
                          value={deviceName}
                          onChange={(e) => setDeviceName(e.target.value)}
                          className={`w-full border rounded-lg px-3 py-2 text-xs ${
                            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-500 font-semibold">Default Gateway IPv4</label>
                        <input
                          type="text"
                          value={defaultGateway}
                          onChange={(e) => setDefaultGateway(e.target.value)}
                          className={`w-full border rounded-lg px-3 py-2 font-mono text-xs ${
                            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={handleSavePortConfig}
                        className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg text-xs"
                      >
                        Simpan Global Config
                      </button>
                    </div>
                  </div>
                )}

                {/* SUBMENU: VLAN */}
                {selectedSubMenu === 'vlan' && (
                  <div className="space-y-4">
                    <h4 className={`text-xs uppercase tracking-wider font-bold text-sky-500 border-b pb-2 ${
                      isDark ? 'border-slate-800' : 'border-slate-200'
                    }`}>
                      VLAN Database (802.1Q Segmentasi)
                    </h4>

                    <div className={`grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 rounded-lg border text-xs ${
                      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'
                    }`}>
                      <input
                        type="number"
                        value={newVlanId}
                        onChange={(e) => setNewVlanId(e.target.value)}
                        placeholder="VLAN ID (contoh: 10)"
                        className={`border rounded px-2.5 py-1.5 font-mono ${
                          isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                      <input
                        type="text"
                        value={newVlanName}
                        onChange={(e) => setNewVlanName(e.target.value)}
                        placeholder="Nama VLAN (contoh: LAB_TI)"
                        className={`border rounded px-2.5 py-1.5 ${
                          isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                      <button
                        onClick={handleAddVlan}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded px-3 py-1.5 transition-colors"
                      >
                        + Tambah VLAN
                      </button>
                    </div>

                    <div className={`overflow-x-auto border rounded-lg ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                      <table className="w-full text-left text-xs font-mono">
                        <thead className={`border-b ${isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                          <tr>
                            <th className="py-2 px-3">VLAN ID</th>
                            <th className="py-2 px-3">Nama VLAN</th>
                            <th className="py-2 px-3">Status</th>
                            <th className="py-2 px-3">Port</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? 'divide-slate-850 text-slate-300' : 'divide-slate-200 text-slate-700'}`}>
                          {vlans.map((v) => (
                            <tr key={v.id}>
                              <td className="py-2 px-3 text-sky-500 font-bold">{v.id}</td>
                              <td className="py-2 px-3 font-sans font-semibold">{v.name}</td>
                              <td className="py-2 px-3 text-emerald-500">{v.status}</td>
                              <td className="py-2 px-3 text-slate-400 text-[11px]">{v.ports.join(', ')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* SUBMENU: DHCP */}
                {selectedSubMenu === 'dhcp' && (
                  <div className="space-y-4">
                    <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                      <div>
                        <h4 className="text-xs uppercase tracking-wider font-bold text-sky-500">
                          Cisco DHCP Server Pool Configuration
                        </h4>
                        <p className="text-xs text-slate-500">
                          Menyediakan IP dinamis otomatis kepada client di jaringan LAN.
                        </p>
                      </div>

                      <button
                        onClick={handleToggleDhcpServer}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          dhcpPoolEnabled
                            ? 'bg-emerald-600 text-white'
                            : 'bg-rose-600 text-white'
                        }`}
                      >
                        {dhcpPoolEnabled ? 'DHCP SERVICE: ON' : 'DHCP SERVICE: OFF'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <label className="text-slate-500 font-semibold">Pool Name</label>
                        <input
                          type="text"
                          value={poolName}
                          onChange={(e) => setPoolName(e.target.value)}
                          className={`w-full border rounded-lg px-3 py-2 font-mono text-xs ${
                            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-500 font-semibold">Network Subnet</label>
                        <input
                          type="text"
                          value={dhcpNetwork}
                          onChange={(e) => setDhcpNetwork(e.target.value)}
                          className={`w-full border rounded-lg px-3 py-2 font-mono text-xs ${
                            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}

          {/* TAB: CLI INTERACTIVE TERMINAL (WITH ADJUSTABLE PANEL HEIGHT & FONT SIZE) */}
          {activeTab === 'cli' && (
            <div className="space-y-3">
              
              {/* CLI Toolbar: Panel Height & Font Size Adjustments */}
              <div className={`p-2.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}>
                {/* Font Size controls */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-semibold flex items-center gap-1">
                    <Type className="w-3.5 h-3.5" />
                    <span>Ukuran Font CLI:</span>
                  </span>
                  {(['xs', 'sm', 'base', 'lg'] as CliFontSize[]).map((size) => (
                    <button
                      key={size}
                      onClick={() => setCliFontSize(size)}
                      className={`px-2 py-0.5 rounded text-xs font-mono font-bold transition-colors ${
                        cliFontSize === size
                          ? 'bg-sky-600 text-white'
                          : isDark ? 'bg-slate-900 text-slate-400 hover:text-white' : 'bg-white text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {size.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Panel Height controls */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-semibold flex items-center gap-1">
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Tinggi Panel:</span>
                  </span>
                  {(['compact', 'normal', 'expanded'] as CliPanelHeight[]).map((heightMode) => (
                    <button
                      key={heightMode}
                      onClick={() => setCliPanelHeight(heightMode)}
                      className={`px-2.5 py-0.5 rounded text-xs font-semibold capitalize transition-colors ${
                        cliPanelHeight === heightMode
                          ? 'bg-sky-600 text-white'
                          : isDark ? 'bg-slate-900 text-slate-400 hover:text-white' : 'bg-white text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {heightMode}
                    </button>
                  ))}

                  <button
                    onClick={() => setCliHistory([])}
                    title="Bersihkan Terminal"
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white ml-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Adjustable Terminal Canvas */}
              <div className={`rounded-xl border p-4 font-mono overflow-y-auto space-y-1 transition-all ${
                getCliHeightClass()
              } ${getCliFontSizeClass()} ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-950 border-slate-800 text-emerald-400'
              }`}>
                <div className="text-slate-500 text-[11px] pb-1 border-b border-slate-800 flex items-center justify-between">
                  <span>Cisco IOS Software, C2900 Software (C2900-UNIVERSALK9-M), Version 15.1(4)M4</span>
                  <span className="text-sky-400">Terminal Ready ({cliFontSize})</span>
                </div>
                {cliHistory.map((line, idx) => (
                  <div key={idx} className="whitespace-pre-wrap leading-relaxed">
                    {line}
                  </div>
                ))}
              </div>

              {/* Command Input Form */}
              <form onSubmit={handleCliSubmit} className="flex items-center gap-2">
                <div className={`flex-1 flex items-center border rounded-lg px-3 py-2 font-mono text-xs ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-950 border-slate-800 text-emerald-400'
                }`}>
                  <span className="text-sky-400 mr-2">{device.name}&gt;</span>
                  <input
                    type="text"
                    value={cliInput}
                    onChange={(e) => setCliInput(e.target.value)}
                    placeholder="Ketik command Cisco (contoh: show ip interface brief, show vlan brief, ping 192.168.10.1)"
                    className="w-full bg-transparent border-none outline-hidden text-xs text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold"
                >
                  Enter
                </button>
              </form>
            </div>
          )}

          {/* TAB: DESKTOP / IP TOOLS */}
          {activeTab === 'desktop' && (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <h4 className="text-xs font-bold">Mode Pengalamatan IP Client</h4>
                  <p className="text-xs text-slate-500">Minta IP otomatis dari Router DHCP Server</p>
                </div>

                <button
                  onClick={() => onTriggerDhcpRequest(device)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md transition-colors flex items-center gap-1.5"
                >
                  <Wifi className="w-3.5 h-3.5" />
                  <span>Minta IP DHCP Lease Sekarang</span>
                </button>
              </div>

              <div className={`p-4 rounded-xl border space-y-3 ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className="text-xs font-bold text-sky-500 uppercase tracking-wider block">
                  Uji Konektivitas Ping ICMP
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={pingTargetIp}
                    onChange={(e) => setPingTargetIp(e.target.value)}
                    placeholder="192.168.10.1"
                    className={`border rounded-lg px-3 py-2 font-mono text-xs w-48 ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                  <button
                    onClick={() => onSendPing(device.id, pingTargetIp)}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Kirim Ping Test</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PHYSICAL CHASSIS */}
          {activeTab === 'physical' && (
            <div className={`p-6 rounded-xl border text-center space-y-4 ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className={`max-w-md mx-auto p-4 rounded-xl border ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'
              }`}>
                <div className="w-full h-16 bg-slate-800 rounded-lg border border-slate-700 flex items-center justify-around px-4">
                  {device.ports.map((p) => (
                    <div key={p.id} className="flex flex-col items-center gap-1">
                      <span className={`w-3 h-3 rounded-xs border ${getPortIndicatorColor(p.status)}`} />
                      <span className="text-[9px] font-mono text-slate-300">{p.name.slice(0, 4)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                Chassis Slots: Modular Ethernet + Serial WIC-2T Interface Card
              </p>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className={`px-5 py-3 border-t flex items-center justify-between text-xs ${
          isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
        }`}>
          <span>Gunakan tab di atas untuk mengkonfigurasi GUI Port atau perintah CLI Cisco</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
