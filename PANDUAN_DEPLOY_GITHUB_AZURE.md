# Panduan Deployment Microsoft Azure Melalui GitHub (CI/CD Otomatis)

**Aplikasi**: NetPulse Edu (Full Java Backend SE 17 + Pure HTML5 & CSS3 Frontend)  
**Tugas**: Assignment 5 - Interaksi Manusia & Komputer (UCD)  
**Mahasiswa**: Nabyl Jawahir (NIM: 20250040073)  
**Alur Kerja**: **Lokal (IntelliJ IDEA) &rarr; GitHub Repository &rarr; GitHub Actions CI/CD &rarr; Microsoft Azure App Service**  

---

## 🚀 Alur Kerja Deployment (GitHub-First)
Dengan konfigurasi ini, Anda **tidak perlu mengunggah file manual ke Azure**. Cukup lakukan `git push` ke GitHub, dan **GitHub Actions** akan secara otomatis:
1. Menjalankan runner Linux di cloud GitHub.
2. Memasang JDK 17 (Eclipse Temurin).
3. Melakukan kompilasi Maven (`mvn clean package`).
4. Menghubungkan ke Microsoft Azure menggunakan **Publish Profile Secret**.
5. Menerbitkan aplikasi ke Azure App Service tanpa downtime.

---

## 📌 LANGKAH 1: Buat Resource Web App di Microsoft Azure
1. Masuk ke [Azure Portal](https://portal.azure.com).
2. Di kolom pencarian atas, ketik **App Services** lalu klik **Create > Web App**.
3. Isi konfigurasi dasar:
   - **Subscription**: Pilih langganan Azure Anda (misal: Azure for Students / Pay-As-You-Go).
   - **Resource Group**: Klik *Create new*, beri nama `rg-netpulse-edu`.
   - **Name**: Beri nama unik, contoh: `netpulse-edu-nabyl` (akan menjadi `https://netpulse-edu-nabyl.azurewebsites.net`).
   - **Publish**: Pilih **Code**.
   - **Runtime stack**: Pilih **Java 17** (Java SE).
   - **Operating System**: **Linux**.
   - **Region**: **Southeast Asia** (Singapore) agar latensi dari Indonesia sangat rendah.
   - **Pricing Plan**: Pilih **Free F1** (Gratis 60 menit CPU/hari) atau **Basic B1**.
4. Klik **Review + create** > lalu klik **Create**.

---

## 🔑 LANGKAH 2: Unduh "Publish Profile" dari Azure
1. Setelah deployment di Azure selesai, klik **Go to resource** (masuk ke halaman Web App Anda).
2. Pada menu bar bagian atas halaman Overview, klik tombol **"Get publish profile"** (atau *Unduh profil publikasi*).
3. Browser Anda akan mengunduh sebuah file berekstensi `.PublishSettings` (misal: `netpulse-edu-nabyl.PublishSettings`).
4. Buka file tersebut menggunakan Text Editor (Notepad, VS Code, dll), lalu **Salin (Copy) seluruh isi teks XML** di dalamnya.

---

## 🛡️ LANGKAH 3: Simpan Secret di Repositori GitHub
1. Buka repositori proyek NetPulse Edu Anda di [GitHub](https://github.com).
2. Masuk ke tab **Settings** di bagian atas repositori.
3. Pada sidebar kiri, klik **Secrets and variables** > pilih **Actions**.
4. Klik tombol hijau **"New repository secret"**.
5. Isi formulir secret:
   - **Name**: `AZURE_WEBAPP_PUBLISH_PROFILE` *(Harus sama persis)*
   - **Secret**: Tempelkan (Paste) seluruh teks XML yang tadi Anda salin dari file `.PublishSettings`.
6. Klik **Add secret**.
7. *(Opsional)* Jika nama web app Anda di Azure berbeda dari `netpulse-edu`, buka file `.github/workflows/azure-deploy.yml` dan sesuaikan nilai `AZURE_WEBAPP_NAME` dengan nama aplikasi Azure Anda.

---

## 📤 LANGKAH 4: Push Kode Proyek ke GitHub
Buka Terminal di komputer Anda (atau Terminal di IntelliJ IDEA) di dalam folder proyek ini, lalu jalankan perintah berikut:

```bash
# 1. Inisialisasi Git (jika belum)
git init

# 2. Tambahkan semua file proyek
git add .

# 3. Buat commit pertama
git commit -m "feat: NetPulse Edu Full Java + Pure HTML/CSS with Azure Deployment"

# 4. Atur branch utama ke main
git branch -M main

# 5. Hubungkan ke repositori GitHub Anda
# (Ganti <username-github> dengan username GitHub Anda)
git remote add origin https://github.com/nabyljawahir-777/netpulse-edu.git

# 6. Push kode ke GitHub
git push -u origin main
```

---

## ⚡ LANGKAH 5: Pantau Deployment Otomatis di GitHub Actions
1. Setelah proses `git push` selesai, buka tab **Actions** di repositori GitHub Anda.
2. Anda akan melihat workflow bernama **"Deploy NetPulse Edu (Full Java) to Microsoft Azure App Service"** sedang berjalan secara otomatis (ikon oranye berputar).
3. Klik workflow tersebut untuk melihat log proses:
   - `Checkout Repository` &check;
   - `Set up JDK 17` &check;
   - `Build with Maven` &check;
   - `Deploy to Azure Web App` &check;
4. Setelah muncul centang hijau (&check;), aplikasi Anda telah live dan aktif di Azure!
5. Buka tautan Azure Anda di browser:  
   **`https://<nama-app-anda>.azurewebsites.net`**

---

## ⚙️ LANGKAH 6: Konfigurasi Port di Azure (Wajib 1x Saja)
Agar Azure App Service mengarahkan lalu lintas HTTP ke server Java (port 8080):
1. Di Azure Portal, buka Web App Anda > pilih menu **Configuration** di sidebar kiri.
2. Tambahkan **Application settings** baru:
   - Name: `WEBSITES_PORT` | Value: `8080`
   - Name: `PORT` | Value: `8080`
3. Klik **Save** lalu klik **Continue**.
4. Selesai! Setiap kali Anda melakukan perubahan kode dan `git push`, website di Azure akan terupdate otomatis dalam hitungan menit.
