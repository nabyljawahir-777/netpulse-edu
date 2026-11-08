/**
 * Cisco Packet Tracer Full Web Edition Types
 */

export type IntermediaryDeviceType = 
  | 'router' 
  | 'switch' 
  | 'multilayer_switch' 
  | 'firewall' 
  | 'access_point';

export type EndDeviceType = 
  | 'pc' 
  | 'laptop' 
  | 'server' 
  | 'printer' 
  | 'smartphone';

export type DeviceType = IntermediaryDeviceType | EndDeviceType;

export type CableType = 
  | 'straight' 
  | 'cross' 
  | 'console' 
  | 'serial' 
  | 'coaxial';

export interface DevicePort {
  id: string;
  name: string; // e.g., 'GigabitEthernet0/0', 'FastEthernet0/1', 'Serial0/1/0', 'Console'
  type: 'ethernet' | 'gigabit' | 'serial' | 'console' | 'coaxial';
  status: 'up' | 'down';
  ipAddress?: string;
  subnetMask?: string;
  macAddress: string;
  duplex?: 'auto' | 'full' | 'half';
  speed?: 'auto' | '100' | '1000';
  vlan?: number;
  mode?: 'access' | 'trunk';
  connectedToDeviceId?: string;
  connectedToPortId?: string;
  cableType?: CableType;
}

export interface VlanConfig {
  id: number;
  name: string;
  status: 'active' | 'suspended';
  ports: string[];
}

export interface TopologyDevice {
  id: string;
  name: string;
  model: string;
  type: DeviceType;
  category: 'intermediary' | 'end_device';
  x: number;
  y: number;
  macAddress: string;
  ports: DevicePort[];
  defaultGateway?: string;
  dnsServer?: string;
  isDhcpClient?: boolean;
  powerStatus: 'on' | 'off';
  dhcpServer?: {
    enabled: boolean;
    poolName: string;
    network: string;
    subnetMask: string;
    defaultRouter: string;
    dnsServer: string;
    startIp: string;
    maxUsers: number;
  };
  vlans?: VlanConfig[];
  routingTable?: {
    protocol: 'C' | 'S' | 'O' | 'R';
    network: string;
    nextHop: string;
    interface: string;
  }[];
  cliHistory: string[];
}

export interface TopologyLink {
  id: string;
  sourceDeviceId: string;
  sourcePortId: string;
  targetDeviceId: string;
  targetPortId: string;
  cableType: CableType;
  status: 'up' | 'down';
}

export interface LabObjective {
  id: string;
  title: string;
  description: string;
  hint: string;
  points: number;
  completed: boolean;
  type: 
    | 'ADD_DEVICE' 
    | 'CONNECT_CABLE' 
    | 'CONFIGURE_PORT' 
    | 'ENABLE_DHCP_SERVER' 
    | 'CONFIGURE_DHCP_CLIENT' 
    | 'CONFIGURE_VLAN' 
    | 'SUCCESSFUL_PING';
}

export interface AssignmentLab {
  id: string;
  code: string;
  title: string;
  course: string;
  deadline: string;
  totalPoints: number;
  objectives: LabObjective[];
  instructions: string[];
  topologyPreset: {
    devices: TopologyDevice[];
    links: TopologyLink[];
  };
}

export interface PacketAnimation {
  id: string;
  fromId: string;
  toId: string;
  progress: number;
  status: 'success' | 'failed';
  message: string;
}

export type ThemeMode = 'dark' | 'light';
export type ColorBlindMode = 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'high_contrast';
export type CliPanelHeight = 'compact' | 'normal' | 'expanded';
export type CliFontSize = 'xs' | 'sm' | 'base' | 'lg';
