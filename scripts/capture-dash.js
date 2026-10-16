const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const ARTIFACTS_DIR = 'C:\\Users\\Darshan H D\\.gemini\\antigravity-ide\\brain\\97690398-52d5-493a-a129-d2371987962d';

function sendCdp(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 1000000);
    const handler = (data) => {
      try {
        const msg = JSON.parse(data);
        if (msg.id === id) {
          ws.off('message', handler);
          if (msg.error) reject(new Error(msg.error.message));
          else resolve(msg.result);
        }
      } catch (e) {}
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function tap(ws, x, y) {
  await sendCdp(ws, 'Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
  await new Promise(r => setTimeout(r, 60));
  await sendCdp(ws, 'Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
}

async function capture(ws, name) {
  const res = await sendCdp(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACTS_DIR, name), Buffer.from(res.data, 'base64'));
  console.log(`[SAVED] ${name}`);
}

async function run() {
  const targets = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json', (res) => {
      let data = ''; res.on('data', c => data += c);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const page = targets.find(t => t.url && t.url.includes('127.0.0.1:3000'));
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.on('open', r));

  await sendCdp(ws, 'Page.enable');
  await sendCdp(ws, 'Emulation.setDeviceMetricsOverride', {
    width: 412,
    height: 880,
    deviceScaleFactor: 2,
    mobile: true,
  });

  // Tap Creator Desk button on Profile at (110, 390)
  console.log('Tapping Creator Desk at (110, 390)...');
  await tap(ws, 110, 390);
  await new Promise(r => setTimeout(r, 1500));
  await capture(ws, 'final_creator_dashboard.png');

  // Tap Audit Report button on the 3rd card at (220, 520)
  console.log('Tapping Audit Report at (220, 520)...');
  await tap(ws, 220, 520);
  await new Promise(r => setTimeout(r, 1500));
  await capture(ws, 'final_distribution_audit_report.png');

  ws.close();
}

run().catch(console.error);
