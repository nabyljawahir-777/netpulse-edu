# NetPulse Edu - Cisco Packet Tracer & LMS Real-time Simulator

**Tugas 5 Interaksi Manusia & Komputer (User-Centered Design)**  
- **Nama Mahasiswa**: Nabyl Jawahir  
- **NIM**: 20250040073  
- **Program Studi**: Teknik Informatika (Semester 3)  
- **Fokus Minat**: Infrastruktur Jaringan & Administrasi Server  
- **Institusi**: Universitas Nusa Putra, Sukabumi  

---

## 🌟 Arsitektur Sistem: Full Java Backend + Pure HTML & CSS Frontend
Sesuai arahan, proyek ini dirancang khusus dengan:
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

## 💻 Panduan Penuh untuk IntelliJ IDEA Community Edition

Proyek ini telah dikonfigurasi 100% cocok untuk **IntelliJ IDEA Community Edition**:

1. **Buka IntelliJ IDEA Community Edition**.
2. Klik menu **File** > **Open...** lalu pilih folder repositori `netpulse-edu` ini (pilih opsi *Open as Project*).
3. IntelliJ akan otomatis mendeteksi proyek **Maven (`pom.xml`)** dan menandai `src/main/java` sebagai *Sources Root* serta `src/main/resources` sebagai *Resources Root*.
4. **Pilih JDK**: Pastikan menggunakan **JDK 17** atau **JDK 21** pada menu *File > Project Structure*.
5. **Menjalankan Server Java (1-Klik)**:
   - Pada toolbar atas, pilih preset run configuration:
     **`Run NetPulse (Full Java Backend)`** lalu klik tombol **Run (Shift+F10)**.
   - Server Java akan langsung menyala di:  
     `http://localhost:8080` (Akses langsung antarmuka web Pure HTML & CSS).
6. **Alternatif via Terminal IntelliJ**:
   ```bash
   mvn clean compile exec:java
   ```

---

## ☁️ Persiapan & Panduan Deployment ke Microsoft Azure

Proyek ini telah dilengkapi infrastruktur cloud-native untuk **Microsoft Azure**:

### File Konfigurasi Azure yang Disediakan:
1. **`Dockerfile`**: Multi-stage build (Stage 1: Maven Build, Stage 2: Eclipse Temurin JRE 17 Alpine) siap deploy ke **Azure App Service (Linux Container)** atau **Azure Container Apps**.
2. **`azuredeploy.json`**: Template ARM (Azure Resource Manager) untuk otomatisasi provisioning Azure App Service Plan (Free Tier F1 / Basic B1).
3. **`azure-pipelines.yml`**: Pipeline CI/CD Azure DevOps.
4. **`.github/workflows/azure-deploy.yml`**: GitHub Actions workflow deployment otomatis ke Azure App Service.
5. **`PANDUAN_AZURE_DEPLOYMENT.md`**: Dokumentasi lengkap panduan deployment langkah demi langkah.

### Deploy Cepat dengan Azure CLI (1 Baris):
```bash
# 1. Package JAR
mvn clean package -DskipTests

# 2. Deploy ke Azure Web App (Linux)
az webapp up --name netpulse-edu-nabyl --os-type Linux --runtime "JAVA:17-java17" --sku F1

# 3. Konfigurasi Port Azure
az webapp config appsettings set --name netpulse-edu-nabyl --settings WEBSITES_PORT=8080 PORT=8080
```
Website langsung aktif pada: `https://netpulse-edu-nabyl.azurewebsites.net`

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
