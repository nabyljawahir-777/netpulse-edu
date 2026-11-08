/**
 * NetPulse Edu - Pure Vanilla JavaScript Engine
 * Cisco Packet Tracer & Real-time LMS Simulation
 * Connects to Java Backend (Java SE 17+ / Microsoft Azure)
 * 
 * Developer: Nabyl Jawahir (NIM: 20250040073)
 */

document.addEventListener('DOMContentLoaded', () => {
  // === STATE MANAGEMENT ===
  const state = {
    theme: 'dark',
    colorBlind: 'normal',
    difficulty: 'intermediate',
    round: 1,
    activeCable: null,
    cablingSourceId: null,
    selectedDeviceId: null,
    devices: [],
    links: [],
    objectives: [],
    score: 0,
    totalPoints: 100,
    isDeleteMode: false,
    cliHistory: ['Cisco IOS Software, 2900 Software (C2900-UNIVERSALK9-M), Version 15.1(4)M4', 'Press RETURN to get started!']
  };

  // Lab assignment presets (9 rounds total: 3 per difficulty)
  const LAB_PRESETS = {
    beginner: [
      {
        title: "SOHO Basic LAN Setup & Static IP (Round 1/3)",
        desc: "Hubungkan PC dan Laptop ke Switch 2960 menggunakan kabel Straight-Through dan atur IP address.",
        total: 100,
        devices: [
          { id: 'sw1', name: 'Switch-01 (2960)', type: 'switch', x: 420, y: 140, ip: '192.168.1.2' },
          { id: 'pc1', name: 'PC-Nabyl', type: 'pc', x: 250, y: 320, ip: '192.168.1.10' },
          { id: 'lap1', name: 'Laptop-Admin', type: 'laptop', x: 580, y: 320, ip: '192.168.1.20' }
        ],
        links: [],
        objectives: [
          { id: 'obj1', text: 'Koneksikan kabel Straight dari Switch ke PC & Laptop', points: 40, check: s => s.links.length >= 2 },
          { id: 'obj2', text: 'Konfigurasi IP Static 192.168.1.x pada kedua perangkat', points: 30, check: s => s.devices.filter(d => d.ip).length >= 2 },
          { id: 'obj3', text: 'Jalankan uji Ping ICMP antar PC dan Laptop', points: 30, check: s => s.links.length >= 2 }
        ]
      },
      {
        title: "Wireless SOHO Hotspot & Association (Round 2/3)",
        desc: "Konfigurasi Access Point wireless dan hubungkan Laptop serta Smartphone.",
        total: 100,
        devices: [
          { id: 'ap1', name: 'AP-Wireless', type: 'access_point', x: 440, y: 150, ip: '192.168.50.1' },
          { id: 'lap1', name: 'Laptop-Staff', type: 'laptop', x: 260, y: 320, ip: '192.168.50.11' },
          { id: 'ph1', name: 'SmartPhone-Nabyl', type: 'smartphone', x: 620, y: 320, ip: '192.168.50.12' }
        ],
        links: [],
        objectives: [
          { id: 'obj1', text: 'Hubungkan AP ke Client via Straight/Wireless', points: 40, check: s => s.links.length >= 2 },
          { id: 'obj2', text: 'Verifikasi IP Subnet 192.168.50.0/24', points: 30, check: s => s.devices.length >= 3 },
          { id: 'obj3', text: 'Uji konektivitas gateway AP', points: 30, check: s => s.links.length >= 2 }
        ]
      },
      {
        title: "Office Network Printer Sharing (Round 3/3)",
        desc: "Setup printer jaringan dan PC client terhubung ke Switch 2960.",
        total: 100,
        devices: [
          { id: 'sw1', name: 'Switch-Office', type: 'switch', x: 420, y: 140, ip: '10.10.1.2' },
          { id: 'pr1', name: 'Network-Printer', type: 'printer', x: 260, y: 320, ip: '10.10.1.50' },
          { id: 'pc1', name: 'PC-Finance', type: 'pc', x: 580, y: 320, ip: '10.10.1.15' }
        ],
        links: [],
        objectives: [
          { id: 'obj1', text: 'Hubungkan kabel Straight-Through ke printer dan PC', points: 40, check: s => s.links.length >= 2 },
          { id: 'obj2', text: 'Alokasikan IP 10.10.1.50 untuk Printer', points: 30, check: s => true },
          { id: 'obj3', text: 'Pastikan status link UP dan hijau', points: 30, check: s => s.links.length >= 2 }
        ]
      }
    ],
    intermediate: [
      {
        title: "Cisco Router-on-a-Stick & 802.1Q Trunking (Round 1/3)",
        desc: "Konfigurasi Router 2911 sub-interface dot1Q dan Switch 2960 Trunk port antar VLAN 10 dan 20.",
        total: 100,
        devices: [
          { id: 'r1', name: 'Router-2911', type: 'router', x: 440, y: 90, ip: '192.168.1.1' },
          { id: 'sw1', name: 'Switch-2960', type: 'switch', x: 440, y: 220, ip: '192.168.1.2' },
          { id: 'pc1', name: 'PC-VLAN10', type: 'pc', x: 260, y: 380, ip: '192.168.10.10' },
          { id: 'pc2', name: 'PC-VLAN20', type: 'pc', x: 620, y: 380, ip: '192.168.20.10' }
        ],
        links: [],
        objectives: [
          { id: 'obj1', text: 'Sambungkan kabel Straight dari Router ke Switch', points: 35, check: s => s.links.some(l => (l.from === 'r1' && l.to === 'sw1') || (l.from === 'sw1' && l.to === 'r1')) },
          { id: 'obj2', text: 'Hubungkan PC-VLAN10 dan PC-VLAN20 ke Switch', points: 35, check: s => s.links.length >= 3 },
          { id: 'obj3', text: 'Verifikasi Inter-VLAN Routing via Gateway', points: 30, check: s => s.links.length >= 3 }
        ]
      },
      {
        title: "Cisco Router DHCP Server Service (Round 2/3)",
        desc: "Konfigurasi ip dhcp pool pada Router 2911 agar PC menerima IP otomatis.",
        total: 100,
        devices: [
          { id: 'r1', name: 'Router-DHCP', type: 'router', x: 440, y: 120, ip: '192.168.100.1' },
          { id: 'sw1', name: 'Switch-LAN', type: 'switch', x: 440, y: 240, ip: '192.168.100.2' },
          { id: 'pc1', name: 'Client-DHCP', type: 'pc', x: 300, y: 380, ip: 'DHCP Request...' },
          { id: 'lap1', name: 'Laptop-DHCP', type: 'laptop', x: 580, y: 380, ip: 'DHCP Request...' }
        ],
        links: [],
        objectives: [
          { id: 'obj1', text: 'Cabling Router ke Switch dan PC', points: 40, check: s => s.links.length >= 3 },
          { id: 'obj2', text: 'Aktifkan DHCP service pada router', points: 30, check: s => s.links.length >= 3 },
          { id: 'obj3', text: 'Klien memperoleh IP lease otomatis', points: 30, check: s => s.links.length >= 3 }
        ]
      },
      {
        title: "Cisco ASA 5505 Perimeter & Web DMZ (Round 3/3)",
        desc: "Lindungi jaringan internal dan buat zona DMZ untuk Web Server.",
        total: 100,
        devices: [
          { id: 'fw1', name: 'ASA-5505', type: 'firewall', x: 440, y: 180, ip: '172.16.1.1' },
          { id: 'srv1', name: 'Web-DMZ', type: 'server', x: 260, y: 180, ip: '172.16.50.2' },
          { id: 'pc1', name: 'Inside-Host', type: 'pc', x: 620, y: 180, ip: '172.16.1.50' }
        ],
        links: [],
        objectives: [
          { id: 'obj1', text: 'Koneksikan kabel Cross/Straight ke ASA Firewall', points: 40, check: s => s.links.length >= 2 },
          { id: 'obj2', text: 'Tetapkan IP DMZ security-level 50', points: 30, check: s => true },
          { id: 'obj3', text: 'Izinkan inspeksi HTTP trafik inbound', points: 30, check: s => s.links.length >= 2 }
        ]
      }
    ],
    advanced: [
      {
        title: "L3 Switch SVI Inter-VLAN Routing (Round 1/3)",
        desc: "Gunakan L3 Switch 3560 dengan interface vlan dan routing layer 3.",
        total: 100,
        devices: [
          { id: 'l3sw', name: 'Core-L3-3560', type: 'multilayer_switch', x: 440, y: 130, ip: '10.0.0.1' },
          { id: 'sw1', name: 'Access-SW1', type: 'switch', x: 280, y: 260, ip: '10.0.10.2' },
          { id: 'sw2', name: 'Access-SW2', type: 'switch', x: 600, y: 260, ip: '10.0.20.2' },
          { id: 'pc1', name: 'Host-V10', type: 'pc', x: 280, y: 400, ip: '10.0.10.15' },
          { id: 'pc2', name: 'Host-V20', type: 'pc', x: 600, y: 400, ip: '10.0.20.15' }
        ],
        links: [],
        objectives: [
          { id: 'obj1', text: 'Koneksikan L3 Switch ke Access Switches', points: 35, check: s => s.links.length >= 2 },
          { id: 'obj2', text: 'Hubungkan end devices ke access switch', points: 35, check: s => s.links.length >= 4 },
          { id: 'obj3', text: 'Verifikasi status port Gig0/1 dan SVI routing', points: 30, check: s => s.links.length >= 4 }
        ]
      },
      {
        title: "Enterprise Tri-Tier Campus Network (Round 2/3)",
        desc: "Arsitektur Core Router, Distribution Switch, dan Access layer.",
        total: 100,
        devices: [
          { id: 'r1', name: 'Campus-Router', type: 'router', x: 440, y: 80, ip: '172.20.0.1' },
          { id: 'l3sw', name: 'Dist-Switch', type: 'multilayer_switch', x: 440, y: 200, ip: '172.20.1.1' },
          { id: 'sw1', name: 'Edge-Switch', type: 'switch', x: 300, y: 320, ip: '172.20.1.2' },
          { id: 'srv1', name: 'DataCenter-SRV', type: 'server', x: 600, y: 320, ip: '172.20.100.5' }
        ],
        links: [],
        objectives: [
          { id: 'obj1', text: 'Hubungkan kabel Serial / Straight antar tier', points: 40, check: s => s.links.length >= 3 },
          { id: 'obj2', text: 'Konfigurasi IP Subnetting VLSM', points: 30, check: s => true },
          { id: 'obj3', text: 'Pastikan jalur redundansi aktif', points: 30, check: s => s.links.length >= 3 }
        ]
      },
      {
        title: "Zero Trust High-Availability Edge (Round 3/3)",
        desc: "Integrasikan ASA 5505, Core Switch L3, dan Web Cluster.",
        total: 100,
        devices: [
          { id: 'fw1', name: 'Edge-ASA', type: 'firewall', x: 440, y: 90, ip: '198.51.100.1' },
          { id: 'l3sw', name: 'Core-L3', type: 'multilayer_switch', x: 440, y: 220, ip: '10.254.0.1' },
          { id: 'srv1', name: 'WebCluster-1', type: 'server', x: 280, y: 360, ip: '10.254.10.10' },
          { id: 'srv2', name: 'WebCluster-2', type: 'server', x: 600, y: 360, ip: '10.254.10.11' }
        ],
        links: [],
        objectives: [
          { id: 'obj1', text: 'Hubungkan kabel Coaxial/Cross ke Edge Firewall', points: 40, check: s => s.links.length >= 3 },
          { id: 'obj2', text: 'Cabling cluster server ke Core L3', points: 30, check: s => s.links.length >= 3 },
          { id: 'obj3', text: 'Verifikasi security rule & health probe', points: 30, check: s => s.links.length >= 3 }
        ]
      }
    ]
  };

  // Device Icons map
  const DEVICE_ICONS = {
    router: '🌐',
    switch: '🔀',
    multilayer_switch: '⚡',
    firewall: '🛡️',
    access_point: '📶',
    pc: '🖥️',
    laptop: '💻',
    server: '🗄️',
    printer: '🖨️',
    smartphone: '📱'
  };

  // === INITIALIZATION ===
  function loadPreset(diff, roundNum) {
    const presets = LAB_PRESETS[diff];
    const index = (roundNum - 1) % presets.length;
    const preset = presets[index];

    state.difficulty = diff;
    state.round = roundNum;
    state.devices = JSON.parse(JSON.stringify(preset.devices));
    state.links = JSON.parse(JSON.stringify(preset.links));
    state.objectives = JSON.parse(JSON.stringify(preset.objectives));
    state.totalPoints = preset.total;
    state.cablingSourceId = null;
    state.activeCable = null;

    document.getElementById('lab-title').textContent = preset.title;
    document.getElementById('lab-desc').textContent = preset.desc;

    updateDifficultyButtonIndicators();
    renderDevices();
    renderCables();
    evaluateObjectives();
  }

  function updateDifficultyButtonIndicators() {
    ['beginner', 'intermediate', 'advanced'].forEach(d => {
      const btn = document.getElementById(`btn-${d}`);
      const tag = document.getElementById(`tag-${d}`);
      if (!btn) return;
      if (state.difficulty === d) {
        btn.classList.add('active');
        if (tag) tag.textContent = `R${state.round}/3`;
      } else {
        btn.classList.remove('active');
        if (tag) tag.textContent = '';
      }
    });
  }

  // === RENDERING ENGINE ===
  const canvasInner = document.getElementById('canvas-inner');
  const svgLayer = document.getElementById('svg-cable-layer');

  function renderDevices() {
    // Remove existing device nodes
    const existing = canvasInner.querySelectorAll('.device-node');
    existing.forEach(el => el.remove());

    state.devices.forEach(dev => {
      const node = document.createElement('div');
      node.className = `device-node ${state.cablingSourceId === dev.id ? 'cabling-source' : ''} ${state.selectedDeviceId === dev.id ? 'selected' : ''}`;
      node.id = `node-${dev.id}`;
      node.style.left = `${dev.x}px`;
      node.style.top = `${dev.y}px`;

      node.innerHTML = `
        <div class="device-icon-box">${DEVICE_ICONS[dev.type] || '💻'}</div>
        <div class="device-name">${dev.name}</div>
        <div class="device-ip">${dev.ip || 'No IP'}</div>
      `;

      // Quick delete button on node
      const delBtn = document.createElement('button');
      delBtn.className = 'quick-del-btn';
      delBtn.innerHTML = '✕';
      delBtn.title = `Hapus ${dev.name}`;
      delBtn.style.cssText = 'position:absolute;top:-6px;right:-6px;width:18px;height:18px;border-radius:50%;background:#e11d48;color:#fff;border:none;font-size:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:30;box-shadow:0 1px 3px rgba(0,0,0,0.4);';
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteDevice(dev.id);
      });
      node.appendChild(delBtn);

      // Drag and drop events
      initDrag(node, dev);

      // Click event for cabling or opening GUI
      node.addEventListener('click', (e) => {
        e.stopPropagation();
        handleDeviceClick(dev);
      });

      canvasInner.appendChild(node);
    });
  }

  function deleteDevice(deviceId) {
    state.devices = state.devices.filter(d => d.id !== deviceId);
    state.links = state.links.filter(l => l.from !== deviceId && l.to !== deviceId);
    renderDevices();
    renderCables();
    evaluateObjectives();
  }

  function deleteLink(linkId) {
    state.links = state.links.filter(l => l.id !== linkId);
    renderCables();
    evaluateObjectives();
  }

  function renderCables() {
    svgLayer.innerHTML = '';
    state.links.forEach(link => {
      const dev1 = state.devices.find(d => d.id === link.from);
      const dev2 = state.devices.find(d => d.id === link.to);
      if (!dev1 || !dev2) return;

      const x1 = dev1.x + 57;
      const y1 = dev1.y + 47;
      const x2 = dev2.x + 57;
      const y2 = dev2.y + 47;

      // Clickable line for deletion
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y2);
      line.setAttribute('stroke', getCableColor(link.type));
      line.setAttribute('stroke-width', '4');
      line.setAttribute('stroke-dasharray', getCableDash(link.type));
      line.style.cursor = 'pointer';
      line.style.pointerEvents = 'stroke';
      
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = `Kabel ${link.type} (Klik untuk menghapus)`;
      line.appendChild(title);

      line.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteLink(link.id);
      });
      svgLayer.appendChild(line);

      // Activity LED dots
      const dot1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot1.setAttribute('cx', x1);
      dot1.setAttribute('cy', y1);
      dot1.setAttribute('r', '4');
      dot1.setAttribute('fill', '#10b981');
      svgLayer.appendChild(dot1);

      const dot2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot2.setAttribute('cx', x2);
      dot2.setAttribute('cy', y2);
      dot2.setAttribute('r', '4');
      dot2.setAttribute('fill', '#10b981');
      svgLayer.appendChild(dot2);
    });
  }

  function getCableColor(type) {
    switch (type) {
      case 'straight': return '#0284c7';
      case 'cross': return '#f59e0b';
      case 'console': return '#06b6d4';
      case 'serial': return '#ef4444';
      case 'coaxial': return '#8b5cf6';
      default: return '#38bdf8';
    }
  }

  function getCableDash(type) {
    switch (type) {
      case 'cross': return '4 3';
      case 'console': return '2 2';
      case 'coaxial': return '6 3';
      default: return 'none';
    }
  }

  function handleDeviceClick(dev) {
    if (state.isDeleteMode) {
      deleteDevice(dev.id);
      return;
    }

    if (state.activeCable) {
      if (!state.cablingSourceId) {
        state.cablingSourceId = dev.id;
        renderDevices();
      } else if (state.cablingSourceId === dev.id) {
        state.cablingSourceId = null;
        renderDevices();
      } else {
        // Create link
        state.links.push({
          id: `link-${Date.now()}`,
          from: state.cablingSourceId,
          to: dev.id,
          type: state.activeCable
        });
        state.cablingSourceId = null;
        renderDevices();
        renderCables();
        evaluateObjectives();

        // Check with Java Backend Ping
        triggerJavaPing();
      }
    } else {
      // Open Device GUI Modal
      openDeviceModal(dev);
    }
  }

  // === DRAG & DROP ===
  function initDrag(element, dev) {
    let startX = 0, startY = 0, initialX = 0, initialY = 0;
    element.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      startX = e.clientX;
      startY = e.clientY;
      initialX = dev.x;
      initialY = dev.y;

      const onMouseMove = (ev) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        dev.x = Math.max(10, Math.min(960, initialX + dx));
        dev.y = Math.max(10, Math.min(480, initialY + dy));
        element.style.left = `${dev.x}px`;
        element.style.top = `${dev.y}px`;
        renderCables();
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  }

  // === LMS EVALUATION & CONFETTI ===
  function evaluateObjectives() {
    let earned = 0;
    const listEl = document.getElementById('objectives-list');
    listEl.innerHTML = '';

    state.objectives.forEach(obj => {
      const isDone = obj.check ? obj.check(state) : false;
      if (isDone) earned += obj.points;

      const item = document.createElement('div');
      item.className = `objective-item ${isDone ? 'completed' : ''}`;
      item.innerHTML = `
        <div class="check-box">${isDone ? '✓' : ''}</div>
        <div style="flex:1;">
          <div>${obj.text}</div>
          <div style="font-size:0.65rem; color:var(--text-dim); margin-top:2px;">Bobot: ${obj.points} Poin</div>
        </div>
      `;
      listEl.appendChild(item);
    });

    state.score = earned;
    document.getElementById('current-score').textContent = earned;
    document.getElementById('total-score').textContent = state.totalPoints;
    
    const pct = Math.min(100, Math.round((earned / state.totalPoints) * 100));
    document.getElementById('score-progress-fill').style.width = `${pct}%`;

    if (pct >= 100 && typeof confetti === 'function') {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    }
  }

  // === DEVICE GUI MODAL ===
  const modalBackdrop = document.getElementById('device-modal');
  function openDeviceModal(dev) {
    state.selectedDeviceId = dev.id;
    document.getElementById('modal-device-name').textContent = dev.name;
    document.getElementById('modal-device-model').textContent = dev.type.toUpperCase();
    document.getElementById('input-ip').value = dev.ip || '';
    document.getElementById('cli-hostname').textContent = dev.name.split('-')[0].toLowerCase();
    
    modalBackdrop.classList.add('open');
    switchTab('config');
  }

  window.closeDeviceModal = function() {
    modalBackdrop.classList.remove('open');
    state.selectedDeviceId = null;
    renderDevices();
  };

  window.switchTab = function(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(pane => pane.style.display = 'none');

    const activeBtn = document.getElementById(`tab-btn-${tabName}`);
    const activePane = document.getElementById(`tab-pane-${tabName}`);
    if (activeBtn) activeBtn.classList.add('active');
    if (activePane) activePane.style.display = 'block';
  };

  window.saveDeviceConfig = function() {
    const dev = state.devices.find(d => d.id === state.selectedDeviceId);
    if (dev) {
      dev.ip = document.getElementById('input-ip').value.trim();
      renderDevices();
      evaluateObjectives();
      closeDeviceModal();
    }
  };

  // CLI Command prompt simulation
  const cliInput = document.getElementById('cli-input');
  if (cliInput) {
    cliInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = cliInput.value.trim();
        cliInput.value = '';
        executeCliCommand(cmd);
      }
    });
  }

  function executeCliCommand(cmd) {
    const outputEl = document.getElementById('cli-output');
    if (!cmd) return;

    outputEl.textContent += `\nRouter# ${cmd}`;

    if (cmd === 'enable' || cmd === 'en') {
      outputEl.textContent += '\nPassword: ';
    } else if (cmd === 'show ip interface brief' || cmd === 'sh ip int br') {
      outputEl.textContent += '\nInterface              IP-Address      OK? Method Status                Protocol\nGigabitEthernet0/0     192.168.1.1     YES manual up                    up\nGigabitEthernet0/1     unassigned      YES unset  administratively down down';
    } else if (cmd.startsWith('ping')) {
      outputEl.textContent += '\nSending 5, 100-byte ICMP Echos, timeout is 2 seconds:\n!!!!!\nSuccess rate is 100 percent (5/5), round-trip min/avg/max = 1/2/4 ms';
    } else if (cmd === 'help' || cmd === '?') {
      outputEl.textContent += '\nExec commands:\n  enable             Turn on privileged commands\n  ping               Send ICMP echo packets\n  show ip int brief  Brief summary of IP status\n  clear              Clear terminal screen';
    } else if (cmd === 'clear') {
      outputEl.textContent = 'Screen cleared.';
    } else {
      outputEl.textContent += `\n% Invalid command at '^' marker. Type '?' for help.`;
    }

    outputEl.scrollTop = outputEl.scrollHeight;
  }

  // === JAVA BACKEND API INTEGRATION ===
  async function triggerJavaPing() {
    try {
      const res = await fetch('/api/ping?src=192.168.1.10&dest=192.168.1.1');
      if (res.ok) {
        const data = await res.json();
        console.log('[Java Ping Response]', data);
      }
    } catch (err) {
      console.log('[Java Backend Info] Running standalone in browser:', err);
    }
  }

  // === TOOLBAR EVENTS ===
  // 3 Difficulty Randomizer buttons
  ['beginner', 'intermediate', 'advanced'].forEach(d => {
    const btn = document.getElementById(`btn-${d}`);
    if (btn) {
      btn.addEventListener('click', () => {
        let nextRound = 1;
        if (state.difficulty === d) {
          nextRound = (state.round % 3) + 1;
        }
        loadPreset(d, nextRound);
      });
    }
  });

  // Reset Topology
  const resetBtn = document.getElementById('btn-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      loadPreset(state.difficulty, state.round);
    });
  }

  // Delete Tool Button
  const deleteBtn = document.getElementById('btn-delete');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      state.isDeleteMode = !state.isDeleteMode;
      state.activeCable = null;
      state.cablingSourceId = null;
      document.querySelectorAll('.cable-btn').forEach(b => b.classList.remove('active'));
      if (state.isDeleteMode) {
        deleteBtn.style.background = '#e11d48';
        deleteBtn.style.color = '#fff';
        deleteBtn.textContent = '🗑️ Mode Hapus (Aktif)';
      } else {
        deleteBtn.style.background = '';
        deleteBtn.style.color = '#f43f5e';
        deleteBtn.textContent = '🗑️ Hapus Objek';
      }
      renderDevices();
    });
  }

  // Cable selection
  document.querySelectorAll('.cable-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cType = btn.getAttribute('data-cable');
      if (state.activeCable === cType) {
        state.activeCable = null;
        btn.classList.remove('active');
      } else {
        document.querySelectorAll('.cable-btn').forEach(b => b.classList.remove('active'));
        state.activeCable = cType;
        btn.classList.add('active');
      }
      state.cablingSourceId = null;
      renderDevices();
    });
  });

  // Add Device buttons
  document.querySelectorAll('[data-add-device]').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-add-device');
      const count = state.devices.filter(d => d.type === type).length + 1;
      const newDev = {
        id: `${type}-${Date.now()}`,
        name: `${type.toUpperCase()}-${count}`,
        type,
        x: 350 + Math.floor(Math.random() * 200),
        y: 180 + Math.floor(Math.random() * 150),
        ip: type === 'pc' ? '192.168.1.5' : ''
      };
      state.devices.push(newDev);
      renderDevices();
      evaluateObjectives();
    });
  });

  // Light / Dark Theme toggle
  window.setTheme = function(t) {
    state.theme = t;
    if (t === 'light') {
      document.body.classList.add('light-theme');
      document.getElementById('btn-theme-light').classList.add('active');
      document.getElementById('btn-theme-dark').classList.remove('active');
    } else {
      document.body.classList.remove('light-theme');
      document.getElementById('btn-theme-dark').classList.add('active');
      document.getElementById('btn-theme-light').classList.remove('active');
    }
  };

  // Colorblind select
  const colorBlindSelect = document.getElementById('colorblind-select');
  if (colorBlindSelect) {
    colorBlindSelect.addEventListener('change', (e) => {
      const mode = e.target.value;
      document.body.classList.remove('colorblind-protanopia', 'colorblind-deuteranopia', 'colorblind-tritanopia', 'colorblind-high_contrast');
      if (mode !== 'normal') {
        document.body.classList.add(`colorblind-${mode}`);
      }
    });
  }

  // Load initial preset
  loadPreset('intermediate', 1);
});
