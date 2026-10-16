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
  await sleep(60);
  await sendCdp(ws, 'Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
}

async function capture(ws, name) {
  const res = await sendCdp(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACTS_DIR, name), Buffer.from(res.data, 'base64'));
  console.log(`[SAVED] ${name}`);
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  const targets = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
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

  console.log('Navigating to root...');
  await sendCdp(ws, 'Page.navigate', { url: 'http://127.0.0.1:3000/' });
  await sleep(2000);
  await capture(ws, 'mobile_01_home.png');

  // Tap Explore Tab (x = 123, y = 845)
  console.log('Tapping Explore Tab...');
  await tap(ws, 123, 845);
  await sleep(1500);
  await capture(ws, 'mobile_02_explore.png');

  // Tap Create Tab (x = 206, y = 845)
  console.log('Tapping Create Tab...');
  await tap(ws, 206, 845);
  await sleep(1500);
  await capture(ws, 'mobile_03_create_wizard.png');

  // Tap Fill Demo Topic (x = 330, y = 72)
  console.log('Tapping Fill Demo Topic...');
  await tap(ws, 330, 72);
  await sleep(800);
  await capture(ws, 'mobile_04_create_filled.png');

  // Tap Continue to Step 2 (x = 290, y = 845)
  console.log('Tapping Continue to Step 2...');
  await tap(ws, 290, 845);
  await sleep(1200);
  await capture(ws, 'mobile_05_create_step2_story.png');

  // Tap Continue to Step 3 (x = 290, y = 845)
  console.log('Tapping Continue to Step 3...');
  await tap(ws, 290, 845);
  await sleep(1200);
  await capture(ws, 'mobile_06_create_step3_visuals.png');

  // Tap Continue to Step 4
  console.log('Tapping Continue to Step 4...');
  await tap(ws, 290, 845);
  await sleep(1200);
  await capture(ws, 'mobile_07_create_step4_reach.png');

  // Tap Continue to Step 5
  console.log('Tapping Continue to Step 5...');
  await tap(ws, 290, 845);
  await sleep(1200);
  await capture(ws, 'mobile_08_create_step5_submit.png');

  // Tap Activity Tab (x = 288, y = 845) -> from Home
  await sendCdp(ws, 'Page.navigate', { url: 'http://127.0.0.1:3000/' });
  await sleep(1500);
  console.log('Tapping Activity Tab...');
  await tap(ws, 288, 845);
  await sleep(1500);
  await capture(ws, 'mobile_09_activity.png');

  // Tap Profile Tab (x = 370, y = 845)
  console.log('Tapping Profile Tab...');
  await tap(ws, 370, 845);
  await sleep(1500);
  await capture(ws, 'mobile_10_profile.png');

  // Tap Creator Desk button on Profile (x = 105, y = 290)
  console.log('Tapping Creator Desk...');
  await tap(ws, 105, 290);
  await sleep(1500);
  await capture(ws, 'mobile_11_creator_dashboard.png');

  // Tap Audit Report on the 3rd or 4th card (x = 200, y = 600)
  console.log('Tapping Audit Report...');
  await tap(ws, 200, 600);
  await sleep(1500);
  await capture(ws, 'mobile_12_distribution_report.png');

  ws.close();
  console.log('Mobile tab navigation tour finished!');
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
