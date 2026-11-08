import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // === REST API ENDPOINTS (Node.js & Express) ===

  // 1. Health & Environment Status (Azure & IDE Health Probe)
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'UP',
      service: 'NetPulse Edu API (Java Backend & Node.js/Express)',
      version: '2.5.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      supportedLanguages: ['Java SE 17+ (Maven)', 'TypeScript', 'JavaScript (Express)', 'HTML5', 'CSS3 (Tailwind)'],
      compatibleIDEs: ['IntelliJ IDEA Community Edition', 'Visual Studio Code', 'WebStorm'],
      cloudPlatform: 'Microsoft Azure App Service / Container Apps'
    });
  });

  // 2. Microsoft Azure Status & Deployment Info
  app.get('/api/azure/status', (_req: Request, res: Response) => {
    res.json({
      cloud: 'Microsoft Azure',
      services: ['Azure App Service (Linux Web App)', 'Azure Container Apps', 'Azure Kubernetes Service (AKS)'],
      containerImage: 'netpulse-edu-java:latest',
      dockerfile: 'Dockerfile (Multi-stage Eclipse Temurin OpenJDK 17)',
      pipelines: ['azure-pipelines.yml', 'github-actions-azure-deploy.yml'],
      armTemplate: 'azuredeploy.json',
      port: 8080,
      env: {
        PORT: '8080',
        WEBSITES_PORT: '8080',
        JAVA_OPTS: '-XX:+UseG1GC -Xmx512m'
      }
    });
  });

  // 3. Network ICMP Ping API
  app.post('/api/ping', (req: Request, res: Response) => {
    const { sourceIp, targetIp, devices, connections } = req.body;

    if (!sourceIp || !targetIp) {
      return res.status(400).json({
        success: false,
        error: 'Missing sourceIp or targetIp parameter'
      });
    }

    const getSubnet = (ip: string) => ip.split('.').slice(0, 3).join('.');
    const sameSubnet = getSubnet(sourceIp) === getSubnet(targetIp);

    const packetsTransmitted = 4;
    const packetsReceived = sameSubnet ? 4 : (connections && connections.length > 0 ? 3 : 0);
    const packetLoss = ((packetsTransmitted - packetsReceived) / packetsTransmitted) * 100;
    const latency = sameSubnet ? Math.floor(Math.random() * 8) + 1 : Math.floor(Math.random() * 25) + 12;

    return res.json({
      success: packetsReceived > 0,
      sourceIp,
      targetIp,
      packetsTransmitted,
      packetsReceived,
      packetLoss: `${packetLoss}%`,
      avgLatencyMs: latency,
      summary: packetsReceived > 0
        ? `Reply from ${targetIp}: bytes=32 time=${latency}ms TTL=64`
        : `Request timed out. Destination host unreachable.`
    });
  });

  // 4. Topology Validation & LMS Evaluation API
  app.post('/api/verify-topology', (req: Request, res: Response) => {
    const { labId, devices, connections } = req.body;

    const deviceCount = devices ? devices.length : 0;
    const connectionCount = connections ? connections.length : 0;

    let score = 0;
    const checks: Array<{ name: string; passed: boolean; feedback: string }> = [];

    if (deviceCount >= 2) {
      score += 30;
      checks.push({ name: 'Device Placement', passed: true, feedback: `${deviceCount} devices placed successfully.` });
    } else {
      checks.push({ name: 'Device Placement', passed: false, feedback: 'At least 2 network devices are required.' });
    }

    if (connectionCount >= 1) {
      score += 40;
      checks.push({ name: 'Physical Cabling', passed: true, feedback: `${connectionCount} active link(s) configured.` });
    } else {
      checks.push({ name: 'Physical Cabling', passed: false, feedback: 'Connect devices with suitable cables.' });
    }

    const configuredPorts = (devices || []).flatMap((d: any) => (d.ports || []).filter((p: any) => p.ip && p.ip.trim() !== ''));
    if (configuredPorts.length >= 2) {
      score += 30;
      checks.push({ name: 'IP Addressing', passed: true, feedback: `${configuredPorts.length} port(s) with valid IP configurations.` });
    } else {
      checks.push({ name: 'IP Addressing', passed: false, feedback: 'Assign IP addresses to active interfaces.' });
    }

    res.json({
      labId: labId || 'custom-lab',
      score,
      completed: score >= 90,
      checks,
      evaluationTimestamp: new Date().toISOString()
    });
  });

  // 5. Export Assignment Submission
  app.post('/api/export-assignment', (req: Request, res: Response) => {
    const { studentName, studentNim, labTitle, score, objectives, devices, connections } = req.body;

    const report = {
      institution: 'Universitas Nusa Putra',
      course: 'Infrastruktur Jaringan & Administrasi Server (Assignment 5)',
      student: {
        name: studentName || 'Nabyl Jawahir',
        nim: studentNim || '20250040073',
        semester: '3 Teknik Informatika'
      },
      submission: {
        labTitle: labTitle || 'NetPulse Edu Topology',
        score: score || 100,
        status: (score || 0) >= 100 ? 'COMPLETED' : 'IN_PROGRESS',
        totalDevices: devices ? devices.length : 0,
        totalCables: connections ? connections.length : 0,
        objectives: objectives || [],
        submittedAt: new Date().toISOString()
      }
    };

    res.json({
      success: true,
      report,
      message: 'Assignment report generated successfully for evaluation.'
    });
  });

  // 6. Pure HTML5 & CSS3 Standalone Frontend Route
  app.use('/pure', express.static(path.resolve(__dirname, 'public/pure')));
  app.get('/pure', (_req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, 'public/pure/index.html'));
  });
  app.get('/css/style.css', (_req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, 'public/pure/css/style.css'));
  });
  app.get('/js/app.js', (_req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, 'public/pure/js/app.js'));
  });

  // === VITE / STATIC SERVING INTEGRATION ===
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Vite Dev Server middleware mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[NetPulse Edu] Full-stack Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[NetPulse Edu] Failed to start server:', err);
  process.exit(1);
});
