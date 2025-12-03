import express from 'express';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, '../dist');

// Helper to get local network IP
function getLocalIP() {
  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        // Skip internal and non-IPv4 addresses
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
  } catch (err) {
    console.warn('Could not detect network interfaces:', err.message);
  }
  return 'localhost';
}

const app = express();

// Enable CORS for development (Vite on port 3001 needs to reach this server)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.static(DIST_DIR));

// API endpoint to get connection info for QR code generation
app.get('/api/connection-info', (req, res) => {
  const ip = getLocalIP();
  const port = httpServer.address().port;
  res.json({
    ip,
    port,
    studentUrl: `http://${ip}:${port}/student.html`,
    wsUrl: `ws://${ip}:${port}`
  });
});

const httpServer = app.listen(process.env.PORT || 3000, () => {
  const ip = getLocalIP();
  const port = httpServer.address().port;
  console.log(`HTTP listening on ${port}`);
  console.log(`Local: http://localhost:${port}/`);
  console.log(`Network: http://${ip}:${port}/`);
  console.log(`Student URL: http://${ip}:${port}/student.html`);
});

const wss = new WebSocketServer({ server: httpServer });
console.log('WebSocket server created');

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  ws.on('message', (data) => {
    console.log("Relaying message", data.toString());
    // relay to everyone *except* sender
    for (const client of wss.clients) {
      if (client !== ws && client.readyState === 1) client.send(data);
    }
  });
  
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

/* ---------- TODO: Service-worker / PWA offline support ----------
   Steps:
   1. Generate sw.js with Vite PWA plugin or manual Workbox.
   2. Cache built assets + student.html.
   3. Serve cached captions when socket temporarily offline.
------------------------------------------------------------------ */ 