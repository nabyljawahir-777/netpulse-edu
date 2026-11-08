import React, { useState } from 'react';
import { 
  Terminal, 
  Code2, 
  Server, 
  FolderGit2, 
  CheckCircle2, 
  Play, 
  Copy, 
  Check, 
  X, 
  Cpu, 
  Layers, 
  Cloud,
  Globe,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface IdeIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  devicesCount: number;
  linksCount: number;
  currentScore: number;
}

export const IdeIntegrationModal: React.FC<IdeIntegrationModalProps> = ({
  isOpen,
  onClose,
  isDark,
  devicesCount,
  linksCount,
  currentScore,
}) => {
  const [activeTab, setActiveTab] = useState<'intellij' | 'azure' | 'pure_frontend' | 'api_test'>('intellij');
  const [apiResponse, setApiResponse] = useState<any | null>(null);
  const [isCallingApi, setIsCallingApi] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const testApiEndpoint = async (endpoint: string, method = 'GET', body?: any) => {
    setIsCallingApi(true);
    setApiResponse(null);
    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      setApiResponse({ endpoint, status: res.status, data });
    } catch (err: any) {
      setApiResponse({ endpoint, status: 'Error', error: err.message || 'Gagal menghubungi endpoint' });
    } finally {
      setIsCallingApi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-4xl max-h-[90vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden transition-colors ${
          isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-md">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">Full Java Backend &amp; Pure HTML/CSS (Azure Ready)</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Java SE 17+
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30">
                  MS Azure
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Arsitektur 100% cocok untuk IntelliJ IDEA Community Edition &amp; Deployment Microsoft Azure
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-600'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className={`px-6 border-b flex items-center gap-2 text-xs font-semibold ${
          isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-100/50 border-slate-200'
        }`}>
          <button
            onClick={() => setActiveTab('intellij')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'intellij'
                ? 'border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>IntelliJ IDEA Community</span>
          </button>

          <button
            onClick={() => setActiveTab('azure')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'azure'
                ? 'border-sky-500 text-sky-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Microsoft Azure Deployment</span>
          </button>

          <button
            onClick={() => setActiveTab('pure_frontend')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'pure_frontend'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Frontend Pure HTML &amp; CSS</span>
          </button>

          <button
            onClick={() => setActiveTab('api_test')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'api_test'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Live REST API Tester</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          
          {/* TAB 1: INTELLIJ IDEA COMMUNITY */}
          {activeTab === 'intellij' && (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <h4 className="font-bold text-sm text-amber-400 mb-1 flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  Konfigurasi Penuh IntelliJ IDEA Community Edition
                </h4>
                <p className="text-slate-400 mb-3 text-xs leading-relaxed">
                  Proyek telah disusun dengan standar resmi <strong>Apache Maven</strong> (`src/main/java` dan `src/main/resources`). 
                  Saat dibuka di IntelliJ IDEA Community, project langsung dikenali sebagai native Maven Java Application tanpa perlu konfigurasi tambahan.
                </p>

                <ol className="list-decimal list-inside space-y-2 text-slate-300">
                  <li>
                    Buka <strong>IntelliJ IDEA Community</strong>, lalu klik <strong>File &gt; Open...</strong> dan pilih folder repositori ini.
                  </li>
                  <li>
                    IntelliJ otomatis mendeteksi <code className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">pom.xml</code> dan mengaitkan JDK 17.
                  </li>
                  <li>
                    <strong>Menjalankan Aplikasi (1-Klik):</strong>
                    <div className="mt-1 flex items-center justify-between p-2.5 rounded bg-slate-950 font-mono text-[11px] text-amber-300 border border-slate-800">
                      <span>Shift + F10 (Pilih: "Run NetPulse (Full Java Backend)")</span>
                    </div>
                  </li>
                  <li>
                    Java Server mandiri akan menyala di <code className="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono">http://localhost:8080</code> dan langsung menyajikan antarmuka <strong>Pure HTML5 &amp; CSS3</strong> dari folder <code className="text-sky-300">src/main/resources/static/</code>.
                  </li>
                  <li>
                    Atau jalankan via Terminal IntelliJ:
                    <div className="mt-1 flex items-center justify-between p-2 rounded bg-slate-950 font-mono text-[11px] text-sky-300 border border-slate-800">
                      <span>mvn clean compile exec:java</span>
                      <button
                        onClick={() => handleCopy('mvn clean compile exec:java', 'mvn-run')}
                        className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        {copiedCmd === 'mvn-run' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Salin</span>
                      </button>
                    </div>
                  </li>
                </ol>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="font-bold text-slate-200 block mb-1">Struktur Java Backend:</span>
                  <ul className="space-y-1 text-slate-400 text-[11px] font-mono">
                    <li>✔ src/main/java/com/netpulse/NetPulseApplication.java</li>
                    <li>✔ src/main/java/com/netpulse/engine/NetworkSimulationEngine.java</li>
                    <li>✔ src/main/java/com/netpulse/service/AssignmentEvaluatorService.java</li>
                    <li>✔ src/main/java/com/netpulse/model/TopologyDevice.java</li>
                  </ul>
                </div>

                <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="font-bold text-slate-200 block mb-1">Preset File IntelliJ IDEA:</span>
                  <ul className="space-y-1 text-slate-400 text-[11px] font-mono">
                    <li>✔ /.idea/misc.xml (Java 17 SDK)</li>
                    <li>✔ /.idea/modules.xml</li>
                    <li>✔ /.idea/runConfigurations/Run_NetPulse_Java_Full_Backend.xml</li>
                    <li>✔ /netpulse-edu.iml</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MICROSOFT AZURE DEPLOYMENT (VIA GITHUB CI/CD) */}
          {activeTab === 'azure' && (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-sm text-sky-400 flex items-center gap-2">
                    <Cloud className="w-4 h-4" />
                    Alur Deployment: GitHub &rarr; Microsoft Azure (CI/CD Otomatis)
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    GitHub Actions Ready
                  </span>
                </div>
                <p className="text-slate-400 mb-3 text-xs leading-relaxed">
                  Deployment dilakukan melalui GitHub terlebih dahulu: Cukup lakukan <code className="text-sky-300 font-mono">git push</code> ke repositori GitHub, lalu 
                  <strong> GitHub Actions (`.github/workflows/azure-deploy.yml`)</strong> akan secara otomatis mengkompilasi Java SE 17, memaketkan JAR, dan mendeploy ke <strong>Azure App Service</strong>!
                </p>

                <div className="space-y-2">
                  <span className="font-bold text-slate-200 block text-[11px]">1. Perintah Push ke GitHub (Terminal / IntelliJ):</span>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-950 font-mono text-[11px] text-sky-300 border border-slate-800">
                    <span>git add . && git commit -m "feat: NetPulse Edu" && git push -u origin main</span>
                    <button
                      onClick={() => handleCopy('git add . && git commit -m "feat: NetPulse Edu" && git push -u origin main', 'git-push')}
                      className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer ml-2 flex-shrink-0"
                    >
                      {copiedCmd === 'git-push' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Salin</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mt-3">
                  <span className="font-bold text-slate-200 block text-[11px]">2. Secret GitHub Repository (Wajib diisi 1x):</span>
                  <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                    <div>• Download <strong>Publish Profile</strong> dari Azure Portal (Klik tombol <em>Get publish profile</em> pada Web App).</div>
                    <div>• Buka GitHub Repo &gt; <strong>Settings &gt; Secrets and variables &gt; Actions &gt; New repository secret</strong>.</div>
                    <div>• Beri nama: <code className="text-amber-300 font-mono font-bold">AZURE_WEBAPP_PUBLISH_PROFILE</code> lalu paste isi file XML tadi.</div>
                  </div>
                </div>

                <div className="space-y-2 mt-3">
                  <span className="font-bold text-slate-200 block text-[11px]">3. Konfigurasi Port Azure (Portal / CLI):</span>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-950 font-mono text-[11px] text-sky-300 border border-slate-800">
                    <span>az webapp config appsettings set --name netpulse-edu --settings WEBSITES_PORT=8080 PORT=8080</span>
                    <button
                      onClick={() => handleCopy('az webapp config appsettings set --name netpulse-edu --settings WEBSITES_PORT=8080 PORT=8080', 'az-port')}
                      className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer ml-2 flex-shrink-0"
                    >
                      {copiedCmd === 'az-port' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Salin</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="font-bold text-sky-400 block mb-1">Dockerfile Multi-stage:</span>
                  <p className="text-slate-400 text-[11px]">
                    Kompilasi Maven di stage 1 dan runtime ringan Eclipse Temurin JRE 17 Alpine di stage 2.
                  </p>
                </div>

                <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="font-bold text-indigo-400 block mb-1">ARM Template:</span>
                  <p className="text-slate-400 text-[11px]">
                    File <code className="text-sky-300 font-mono">azuredeploy.json</code> untuk otomatisasi 1-klik provisioning resource group dan App Service.
                  </p>
                </div>

                <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="font-bold text-emerald-400 block mb-1">CI/CD Otomatis:</span>
                  <p className="text-slate-400 text-[11px]">
                    File <code className="text-emerald-300 font-mono">azure-pipelines.yml</code> dan GitHub Actions <code className="text-emerald-300 font-mono">.github/workflows/azure-deploy.yml</code>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PURE FRONTEND HTML & CSS */}
          {activeTab === 'pure_frontend' && (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <h4 className="font-bold text-sm text-emerald-400 mb-1 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Frontend Murni HTML5 &amp; CSS3 (Static Resources)
                </h4>
                <p className="text-slate-400 mb-3 text-xs leading-relaxed">
                  Frontend murni dibangun tanpa framework JS eksternal, tersimpan langsung di folder resource Java standard 
                  <code className="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono">src/main/resources/static/</code>. 
                  Dapat disajikan langsung oleh Java HTTP Server pada port 8080!
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href="/pure"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2 shadow-sm transition-colors"
                  >
                    <span>Buka Tampilan Pure HTML &amp; CSS (/pure)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <span className="text-slate-400 text-[11px]">
                    (Membuka antarmuka HTML murni di tab baru)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="font-bold text-slate-200 block mb-1">File HTML5 Murni:</span>
                  <ul className="space-y-1 text-slate-400 text-[11px] font-mono">
                    <li>✔ src/main/resources/static/index.html</li>
                    <li>✔ Canvas Cisco Packet Tracer drag-and-drop</li>
                    <li>✔ 5 Kabel Cisco (Straight, Cross, Serial, dll)</li>
                    <li>✔ Modal GUI Port, IP, MAC &amp; CLI Terminal</li>
                    <li>✔ LMS checklist objektif realtime</li>
                  </ul>
                </div>

                <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="font-bold text-slate-200 block mb-1">File CSS3 Murni:</span>
                  <ul className="space-y-1 text-slate-400 text-[11px] font-mono">
                    <li>✔ src/main/resources/static/css/style.css</li>
                    <li>✔ Dark Theme &amp; Light Theme Switch</li>
                    <li>✔ 5 Filter Aksesibilitas Colorblind</li>
                    <li>✔ Desain hardware modular Cisco</li>
                    <li>✔ Zero dependency CSS external</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LIVE REST API TESTER */}
          {activeTab === 'api_test' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-sm text-indigo-400 mb-1">Uji Endpoint REST API (Java &amp; Azure Ready)</h4>
                <p className="text-slate-400 text-xs">
                  Uji langsung komunikasi backend server yang melayani evaluasi topologi, probe kesehatan Azure, dan simulasi ping ICMP.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => testApiEndpoint('/api/health')}
                  disabled={isCallingApi}
                  className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Server className="w-3.5 h-3.5" />
                  <span>GET /api/health (Health Probe)</span>
                </button>

                <button
                  onClick={() => testApiEndpoint('/api/azure/status')}
                  disabled={isCallingApi}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Cloud className="w-3.5 h-3.5" />
                  <span>GET /api/azure/status (Azure Info)</span>
                </button>

                <button
                  onClick={() => testApiEndpoint('/api/ping', 'POST', {
                    sourceIp: '192.168.10.15',
                    targetIp: '192.168.10.1',
                    connections: [{ id: 'link-1' }]
                  })}
                  disabled={isCallingApi}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>POST /api/ping (ICMP)</span>
                </button>
              </div>

              {isCallingApi && (
                <div className="p-4 rounded-xl border border-sky-500/30 bg-sky-500/10 text-sky-300 flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
                  <span>Memanggil endpoint backend server...</span>
                </div>
              )}

              {apiResponse && (
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 font-mono text-[11px] overflow-x-auto">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400">
                    <span className="font-bold text-sky-400">{apiResponse.endpoint}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400">
                      Status: {apiResponse.status}
                    </span>
                  </div>
                  <pre className="text-slate-300">
                    {JSON.stringify(apiResponse.data || apiResponse.error, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className={`px-6 py-3 border-t flex items-center justify-between text-xs ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 text-slate-400">
            <span>Mahasiswa: <strong>Nabyl Jawahir</strong> (20250040073)</span>
            <span>•</span>
            <span>Teknik Informatika Smt 3</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
