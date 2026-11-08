# Panduan Deployment NetPulse Edu ke Microsoft Azure

**Aplikasi**: NetPulse Edu (Full Java Backend SE 17 + Pure HTML5 & CSS3 Frontend)  
**Tugas**: Assignment 5 - Interaksi Manusia & Komputer (UCD)  
**Mahasiswa**: Nabyl Jawahir (NIM: 20250040073)  
**Program Studi**: Teknik Informatika, Universitas Nusa Putra  

---

## ☁️ Ikhtisar Arsitektur Azure
Aplikasi NetPulse Edu dirancang agar 100% cloud-native dan siap dideploy ke **Microsoft Azure** dengan berbagai opsi:
1. **Azure App Service (Linux Web App - Java SE 17)**: Paling mudah, langsung deploy file JAR hasil build Maven.
2. **Azure Container Apps / App Service Linux Container**: Deploy container image berbasis Dockerfile multi-stage Eclipse Temurin JRE 17 Alpine.
3. **CI/CD Otomatis**: Siap diintegrasikan dengan **GitHub Actions** (`.github/workflows/azure-deploy.yml`) dan **Azure DevOps Pipelines** (`azure-pipelines.yml`).

---

## 🚀 METODE 1: Deploy Cepat dengan Azure CLI (`az webapp up`)
Metode paling direkomendasikan untuk mahasiswa, hanya butuh 1 baris perintah:

### Langkah-langkah:
1. **Pastikan Azure CLI terpasang di komputer**:
   ```bash
   az --version
   ```
2. **Login ke Akun Microsoft Azure**:
   ```bash
   az login
   ```
3. **Compile dan Package JAR Java**:
   ```bash
   mvn clean package -DskipTests
   ```
4. **Deploy langsung ke Azure App Service**:
   ```bash
   az webapp up \
     --name netpulse-edu-nabyl \
     --resource-group rg-netpulse-edu \
     --plan plan-netpulse-linux \
     --sku F1 \
     --location southeastasia \
     --os-type Linux \
     --runtime "JAVA:17-java17"
   ```
5. **Set Pengaturan Port Azure**:
   ```bash
   az webapp config appsettings set \
     --resource-group rg-netpulse-edu \
     --name netpulse-edu-nabyl \
     --settings WEBSITES_PORT=8080 PORT=8080
   ```
6. Aplikasi Anda langsung aktif dan dapat diakses publik pada:  
   `https://netpulse-edu-nabyl.azurewebsites.net`

---

## 🐳 METODE 2: Deploy Menggunakan Docker & Azure Container Registry (ACR)

Proyek ini telah memiliki `Dockerfile` multi-stage berukuran sangat ringan (alpine-based).

### Langkah-langkah:
1. **Buat Azure Container Registry (ACR)**:
   ```bash
   az acr create --resource-group rg-netpulse-edu --name netpulseacr --sku Basic --admin-enabled true
   ```
2. **Build Docker Image langsung di Cloud Azure (ACR Build)**:
   ```bash
   az acr build --registry netpulseacr --image netpulse-edu:latest .
   ```
3. **Deploy Container ke Azure App Service**:
   ```bash
   az webapp create \
     --resource-group rg-netpulse-edu \
     --plan plan-netpulse-linux \
     --name netpulse-edu-nabyl \
     --deployment-container-image-name netpulseacr.azurecr.io/netpulse-edu:latest
   ```
4. **Konfigurasi Port Container**:
   ```bash
   az webapp config appsettings set \
     --resource-group rg-netpulse-edu \
     --name netpulse-edu-nabyl \
     --settings WEBSITES_PORT=8080 PORT=8080
   ```

---

## 🌐 METODE 3: Deploy via Azure Portal (GUI Web)

1. Masuk ke [Azure Portal](https://portal.azure.com).
2. Klik **Create a resource** > pilih **Web App**.
3. Isi formulir pembuatan:
   - **Resource Group**: Buat baru, contoh `rg-netpulse-edu`.
   - **Name**: `netpulse-edu-nabyl` (akan menjadi URL `.azurewebsites.net`).
   - **Publish**: Pilih **Code** (atau **Docker Container**).
   - **Runtime stack**: Pilih **Java 17** (Java SE).
   - **Operating System**: **Linux**.
   - **Region**: **Southeast Asia (Singapore)**.
   - **Pricing Plan**: Pilih **Free F1** (gratis untuk keperluan tugas/edukasi) atau **Basic B1**.
4. Klik **Review + create** > **Create**.
5. Setelah selesai deploy, buka menu **Configuration** di sidebar Web App:
   - Tambahkan Application Setting:
     - Name: `WEBSITES_PORT` | Value: `8080`
     - Name: `PORT` | Value: `8080`
   - Klik **Save**.
6. Upload file `target/netpulse-edu-1.0.0.jar` melalui menu **Deployment Center** atau via FTP/ZIP Deploy:
   ```bash
   az webapp deploy --resource-group rg-netpulse-edu --name netpulse-edu-nabyl --src-path target/netpulse-edu-1.0.0.jar --type jar
   ```

---

## 📋 Konfigurasi Environment Variable di Azure
| Nama Variabel | Nilai Default | Penjelasan |
|---|---|---|
| `PORT` | `8080` | Port listen HTTP server Java |
| `WEBSITES_PORT` | `8080` | Port yang di-routing Azure reverse-proxy Nginx |
| `JAVA_OPTS` | `-XX:+UseG1GC -Xmx512m` | Optimasi RAM memory allocation Java di Linux |
| `STUDENT_NAME` | `Nabyl Jawahir` | Identitas pemilik tugas Assignment 5 |
| `STUDENT_NIM` | `20250040073` | NIM mahasiswa Universitas Nusa Putra |

---

## 🔍 Health Check & Monitoring di Azure
Endpoint health probe telah tersedia secara native di Java backend:
- URL: `https://<nama-app>.azurewebsites.net/api/health`
- Response JSON:
  ```json
  {
    "status": "UP",
    "service": "NetPulse Edu Java Backend",
    "developer": "Nabyl Jawahir",
    "nim": "20250040073",
    "cloudPlatform": "Microsoft Azure App Service / Container Apps"
  }
  ```
Azure App Service akan otomatis memeriksa endpoint ini setiap 30 detik untuk memastikan container berjalan prima tanpa downtime.
