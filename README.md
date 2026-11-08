# NetPulse Edu - Cisco Packet Tracer & LMS Real-time Simulator

**Tugas 5 Interaksi Manusia & Komputer (User-Centered Design)**  
- **Nama Mahasiswa**: Nabyl Jawahir, Regith Rayabi, M.Nizar Wirapradana, Zidane Putra Sriyono, Faizi Fathir Widodo
- **NIM**: 20250040073, 20250040075, 20250040070, 20250040109, 20250040066
- **Program Studi**: Teknik Informatika (Semester 3)  
- **Fokus Minat**: Infrastruktur Jaringan & Administrasi Server  
- **Institusi**: Universitas Nusa Putra, Sukabumi  

---

## 🌟 Arsitektur Sistem: Full Java Backend + Pure HTML & CSS Frontend
proyek ini dirancang khusus dengan:
1. **Full Java Backend (Java SE 17+ / Maven)**:
   - Terletak di direktori standar Maven: `src/main/java/com/netpulse/`.
   - Entry point: `com.netpulse.NetPulseApplication` (menjalankan HTTP Server mandiri pada port 8080).
   - Menyediakan REST API:
     - `GET /api/health`: Azure Health Probe & spesifikasi sistem.
     - `GET /api/azure/status`: Metadata kesiapan deployment Microsoft Azure.
     - `GET /api/devices`: Katalog perangkat keras Cisco (Router, Switch, ASA Firewall, AP, Server, PC, Laptop).
     - `POST /api/ping`: Simulator transmisi paket ICMP Echo dengan latensi dan status konektivitas.
     - `POST /api/verify-topology`: Mesin evaluator otomatis kriteria tugas LMS real-time.
   - Menyajikan file statis frontend langsung dari `src/main/resources/static/`.

2. **Frontend Pure HTML5 & CSS3**:
   - Terletak di: `src/main/resources/static/`.
   - **`index.html`**: HTML5 semantik murni dengan kanvas simulasi Cisco drag-and-drop, 5 kabel (Straight, Cross, Console, Serial, Coaxial), modal konfigurasi GUI port/VLAN, dan terminal CLI interaktif.
   - **`css/style.css`**: CSS3 murni (zero-dependency / tanpa framework eksternal), lengkap dengan variabel tema (Dark Mode & Light Mode) serta 5 filter aksesibilitas buta warna (Normal, Protanopia, Deuteranopia, Tritanopia, High Contrast).
   - **`js/app.js`**: Vanilla JavaScript ES6+ untuk interaktivitas kanvas SVG, penilaian LMS real-time, dan koneksi ke backend Java.

---

---

## 📁 Struktur Direktori Proyek

```text
├── .idea/                           # Konfigurasi IntelliJ IDEA Community Edition
│   ├── misc.xml                     # Pengaturan Project JDK 17
│   ├── modules.xml                  # Pemetaan modul
│   └── runConfigurations/           # Preset tombol Run IntelliJ (Full Java Backend)
├── src/main/java/com/netpulse/      # FULL JAVA BACKEND (Java SE 17+)
│   ├── NetPulseApplication.java     # Main Server & Static File HTTP Server (Port 8080)
│   ├── engine/
│   │   └── NetworkSimulationEngine.java # Kalkulasi IP Subnet, CIDR & ICMP Ping
│   ├── service/
│   │   └── AssignmentEvaluatorService.java # Penilaian Tugas LMS Otomatis
│   └── model/
│       ├── TopologyDevice.java      # Model Perangkat Jaringan Cisco
│       ├── DevicePort.java          # Model Port & Interface (IP, MAC, VLAN)
│       └── CableConnection.java     # Model Koneksi Kabel
├── src/main/resources/              # FRONTEND PURE HTML & CSS (Resources)
│   └── static/
│       ├── index.html               # Pure HTML5 Frontend
│       ├── css/style.css            # Pure CSS3 Styling & Aksesibilitas
│       └── js/app.js                # Vanilla JS Interactive Canvas Engine
├── Dockerfile                       # Multi-stage Dockerfile untuk Microsoft Azure
├── azuredeploy.json                 # ARM Template Deployment Microsoft Azure
├── azure-pipelines.yml              # Azure DevOps CI/CD Pipeline
├── .github/workflows/azure-deploy.yml # GitHub Actions Azure Deployment
├── PANDUAN_AZURE_DEPLOYMENT.md      # Panduan Lengkap Deployment Microsoft Azure
├── pom.xml                          # Maven Project Descriptor (Java 17)
├── netpulse-edu.iml                 # IntelliJ IDEA Module Descriptor
└── server.ts                        # Dev Server & Proxy Route (/pure)
```

---

## 🎯 Fitur Simulator NetPulse Edu
- **Kanvas Interaktif Cisco**: Drag-and-drop 10 jenis perangkat dan 5 jenis kabel Cisco.
- **GUI Konfigurasi Lengkap**: Port status, IPv4/Subnet, MAC, VLAN 802.1Q, DHCP Server, Desktop Tools, dan CLI Terminal interaktif.
- **3 Tingkat Kesulitan Terpisah**: Beginner, Intermediate, dan Advanced masing-masing memiliki 3 putaran assignment acak.
- **LMS Real-time Checklist**: Deteksi otomatis konfigurasi dengan popup perayaan confetti.
- **Aksesibilitas Tinggi**: Light/Dark Mode dan 5 Filter Buta Warna Global.
- **Akses Tampilan Pure HTML/CSS**: Tersedia langsung via route `/pure`.
