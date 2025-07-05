import express from 'express';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, '../dist');

const app = express();
app.use(express.static(DIST_DIR));

const httpServer = app.listen(process.env.PORT || 3000, () =>
  console.log(`HTTP listening on ${httpServer.address().port}`)
);

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