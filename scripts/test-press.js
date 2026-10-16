const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const ARTIFACTS_DIR = 'C:\\Users\\Darshan H D\\.gemini\\antigravity-ide\\brain\\97690398-52d5-493a-a129-d2371987962d';

function sendCdpCommand(ws, method, params = {}) {
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
      } catch (e) {
        // ignore
      }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

function evaluateJs(ws, expression) {
  return sendCdpCommand(ws, 'Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
}

async function captureScreenshot(ws, filename) {
  const res = await sendCdpCommand(ws, 'Page.captureScreenshot', { format: 'png' });
  const filePath = path.join(ARTIFACTS_DIR, filename);
  fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
  console.log(`[Captured] ${filename}`);
  return filePath;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// In React Native Web, TouchableOpacity uses role="button" or tabindex="0" and responds to pointerdown/pointerup
const HELPER_SCRIPT = `
  window.rnPress = function(target) {
    if (!target) return false;
    let el = target;
    // Walk up to find clickable element
    while (el && el !== document.body) {
      if (el.getAttribute('role') === 'button' || el.getAttribute('tabindex') !== null || el.tagName === 'BUTTON') {
        break;
      }
      el = el.parentElement;
    }
    if (!el) el = target;
    
    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const evOpts = { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: 1 };
    
    el.dispatchEvent(new PointerEvent('pointerdown', evOpts));
    el.dispatchEvent(new MouseEvent('mousedown', evOpts));
    el.dispatchEvent(new PointerEvent('pointerup', evOpts));
    el.dispatchEvent(new MouseEvent('mouseup', evOpts));
    el.dispatchEvent(new MouseEvent('click', evOpts));
    return true;
  };

  window.findByText = function(text, exact = false) {
    const all = [...document.querySelectorAll('*')];
    return all.reverse().find(el => {
      const t = el.innerText?.trim();
      if (!t) return false;
      return exact ? t === text : t.includes(text);
    });
  };
`;

async function run() {
  const targets = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  let pageTarget = targets.find(t => t.url && t.url.includes('127.0.0.1:3000'));
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(r => ws.on('open', r));

  await sendCdpCommand(ws, 'Page.enable');
  await sendCdpCommand(ws, 'Runtime.enable');
  await sendCdpCommand(ws, 'Emulation.setDeviceMetricsOverride', {
    width: 412,
    height: 880,
    deviceScaleFactor: 2,
    mobile: true,
  });

  // Inject helper
  await evaluateJs(ws, HELPER_SCRIPT);

  // 1. Fresh load Home
  console.log('1. Loading Home...');
  await sendCdpCommand(ws, 'Page.navigate', { url: 'http://127.0.0.1:3000/' });
  await sleep(2500);
  await evaluateJs(ws, HELPER_SCRIPT);
  await captureScreenshot(ws, 'screen_01_home.png');

  // 2. Click Explore Tab
  console.log('2. Clicking Explore Tab...');
  await evaluateJs(ws, `window.rnPress(window.findByText('Explore', true))`);
  await sleep(1500);
  await captureScreenshot(ws, 'screen_02_explore.png');

  // 3. Click Create Tab
  console.log('3. Clicking Create Tab (5-Step Wizard)...');
  await evaluateJs(ws, `window.rnPress(window.findByText('Create', true))`);
  await sleep(1500);
  await captureScreenshot(ws, 'screen_03_wizard_step1.png');

  // Click "Fill Demo Topic"
  console.log('Filling Demo Topic...');
  await evaluateJs(ws, `window.rnPress(window.findByText('Fill Demo Topic'))`);
  await sleep(600);
  await captureScreenshot(ws, 'screen_04_wizard_step1_filled.png');

  // Click Continue to Step 2
  console.log('Advancing to Step 2: Story & Sources...');
  await evaluateJs(ws, `window.rnPress(window.findByText('Continue', true))`);
  await sleep(1200);
  await captureScreenshot(ws, 'screen_05_wizard_step2_story.png');

  // Scroll to show sources in Step 2
  await evaluateJs(ws, `window.scrollBy(0, 450);`);
  await sleep(600);
  await captureScreenshot(ws, 'screen_06_wizard_step2_sources.png');

  // Click Continue to Step 3: Visuals
  console.log('Advancing to Step 3: Visuals...');
  await evaluateJs(ws, `window.rnPress(window.findByText('Continue', true))`);
  await sleep(1200);
  await captureScreenshot(ws, 'screen_07_wizard_step3_visuals.png');

  // Click Continue to Step 4: Reach Plan
  console.log('Advancing to Step 4: Reach...');
  await evaluateJs(ws, `window.rnPress(window.findByText('Continue', true))`);
  await sleep(1200);
  await captureScreenshot(ws, 'screen_08_wizard_step4_reach.png');

  // Click Continue to Step 5: Review & Goal
  console.log('Advancing to Step 5: Review & Goal...');
  await evaluateJs(ws, `window.rnPress(window.findByText('Continue', true))`);
  await sleep(1200);
  await captureScreenshot(ws, 'screen_09_wizard_step5_goal.png');

  // 4. Click Activity Tab
  console.log('4. Clicking Activity Tab...');
  await evaluateJs(ws, `window.rnPress(window.findByText('Activity', true))`);
  await sleep(1500);
  await captureScreenshot(ws, 'screen_10_activity.png');

  // 5. Click Profile Tab
  console.log('5. Clicking Profile Tab...');
  await evaluateJs(ws, `window.rnPress(window.findByText('Profile', true))`);
  await sleep(1500);
  await captureScreenshot(ws, 'screen_11_profile.png');

  // Click Creator Desk inside Profile
  console.log('6. Opening Creator Desk...');
  await evaluateJs(ws, `window.rnPress(window.findByText('Creator Desk'))`);
  await sleep(1500);
  await captureScreenshot(ws, 'screen_12_creator_dashboard.png');

  // Click Audit Report button on one of the cards
  console.log('7. Opening Audit Report...');
  await evaluateJs(ws, `window.rnPress(window.findByText('Audit Report'))`);
  await sleep(1500);
  await captureScreenshot(ws, 'screen_13_audit_report.png');

  ws.close();
  console.log('All screens successfully navigated and captured!');
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
