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

async function runFullTour() {
  console.log('Connecting to running browser on port 9222...');
  
  const targets = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  let pageTarget = targets.find(t => t.url && t.url.includes('127.0.0.1:3000'));
  if (!pageTarget) pageTarget = targets.find(t => t.type === 'page');

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(r => ws.on('open', r));

  await sendCdpCommand(ws, 'Page.enable');
  await sendCdpCommand(ws, 'Runtime.enable');

  // Set mobile device metrics
  await sendCdpCommand(ws, 'Emulation.setDeviceMetricsOverride', {
    width: 412,
    height: 880,
    deviceScaleFactor: 2,
    mobile: true,
  });

  // 1. Home Screen
  console.log('1. Loading Home Screen...');
  await sendCdpCommand(ws, 'Page.navigate', { url: 'http://127.0.0.1:3000/' });
  await sleep(2500);
  await captureScreenshot(ws, '01_home_screen.png');

  // 2. Open Campaign Detail
  console.log('2. Opening Campaign Detail Screen...');
  await evaluateJs(ws, `
    const card = [...document.querySelectorAll('div')].find(el => el.innerText && el.innerText.includes('Protect Local Drinking Wells'));
    if (card) card.click();
  `);
  await sleep(1500);
  await captureScreenshot(ws, '02_campaign_detail.png');

  // Scroll to show sources & accordion
  await evaluateJs(ws, `window.scrollBy(0, 550);`);
  await sleep(800);
  await captureScreenshot(ws, '03_detail_sources_evidence.png');

  // 3. Open Contribution flow
  console.log('3. Opening Contribution Checkout...');
  await evaluateJs(ws, `
    const backBtn = [...document.querySelectorAll('div')].find(el => el.innerText === 'Back This Campaign' && el.offsetParent !== null);
    if (backBtn) backBtn.click();
  `);
  await sleep(1500);
  await captureScreenshot(ws, '04_contribution_checkout.png');

  // 4. Pay ₹250
  console.log('4. Submitting Simulated Payment...');
  await evaluateJs(ws, `
    const payBtn = [...document.querySelectorAll('div')].find(el => el.innerText && el.innerText.includes('Pay ₹') && el.offsetParent !== null);
    if (payBtn) payBtn.click();
  `);
  await sleep(2500); // Wait for simulated network delay + transition
  await captureScreenshot(ws, '05_confirmation_receipt.png');

  // 5. Return to Home
  console.log('5. Returning to Home...');
  await evaluateJs(ws, `
    const returnHomeBtn = [...document.querySelectorAll('div')].find(el => el.innerText === 'Return to Home' && el.offsetParent !== null);
    if (returnHomeBtn) returnHomeBtn.click();
  `);
  await sleep(1500);

  // 6. Navigate to Explore
  console.log('6. Navigating to Explore Screen...');
  await evaluateJs(ws, `
    const exploreTab = [...document.querySelectorAll('div')].find(el => el.innerText === 'Explore' && el.offsetParent !== null);
    if (exploreTab) exploreTab.click();
  `);
  await sleep(1500);
  await captureScreenshot(ws, '06_explore_screen.png');

  // 7. Navigate to Create Wizard
  console.log('7. Opening 5-Step Creation Wizard...');
  await evaluateJs(ws, `
    const createTab = [...document.querySelectorAll('div')].find(el => el.innerText === 'Create' && el.offsetParent !== null);
    if (createTab) createTab.click();
  `);
  await sleep(1500);
  await captureScreenshot(ws, '07_wizard_step1_basics.png');

  // Fill demo topic and continue to Step 2
  console.log('Advancing Wizard to Step 2: Story & Sources...');
  await evaluateJs(ws, `
    const fillBtn = [...document.querySelectorAll('div')].find(el => el.innerText === 'Fill Demo Topic' && el.offsetParent !== null);
    if (fillBtn) fillBtn.click();
  `);
  await sleep(600);
  await evaluateJs(ws, `
    const continueBtn = [...document.querySelectorAll('div')].find(el => el.innerText === 'Continue' && el.offsetParent !== null);
    if (continueBtn) continueBtn.click();
  `);
  await sleep(1200);
  await captureScreenshot(ws, '08_wizard_step2_story.png');

  // Continue to Step 3: Visuals
  console.log('Advancing Wizard to Step 3: Visuals...');
  await evaluateJs(ws, `
    const continueBtn = [...document.querySelectorAll('div')].find(el => el.innerText === 'Continue' && el.offsetParent !== null);
    if (continueBtn) continueBtn.click();
  `);
  await sleep(1200);
  await captureScreenshot(ws, '09_wizard_step3_visuals.png');

  // Continue to Step 4: Reach
  console.log('Advancing Wizard to Step 4: Reach Plan...');
  await evaluateJs(ws, `
    const continueBtn = [...document.querySelectorAll('div')].find(el => el.innerText === 'Continue' && el.offsetParent !== null);
    if (continueBtn) continueBtn.click();
  `);
  await sleep(1200);
  await captureScreenshot(ws, '10_wizard_step4_reach.png');

  // Continue to Step 5: Review & Submit
  console.log('Advancing Wizard to Step 5: Review & Funding Goal...');
  await evaluateJs(ws, `
    const continueBtn = [...document.querySelectorAll('div')].find(el => el.innerText === 'Continue' && el.offsetParent !== null);
    if (continueBtn) continueBtn.click();
  `);
  await sleep(1200);
  await captureScreenshot(ws, '11_wizard_step5_review_and_goal.png');

  // 8. Navigate to Profile
  console.log('8. Opening Profile Screen...');
  await evaluateJs(ws, `
    const profileTab = [...document.querySelectorAll('div')].find(el => el.innerText === 'Profile' && el.offsetParent !== null);
    if (profileTab) profileTab.click();
  `);
  await sleep(1500);
  await captureScreenshot(ws, '12_profile_impact.png');

  // 9. Open Creator Dashboard
  console.log('9. Opening Creator Dashboard...');
  await evaluateJs(ws, `
    const deskBtn = [...document.querySelectorAll('div')].find(el => el.innerText && el.innerText.includes('Creator Desk') && el.offsetParent !== null);
    if (deskBtn) deskBtn.click();
  `);
  await sleep(1500);
  await captureScreenshot(ws, '13_creator_dashboard.png');

  // 10. Open Distribution Report
  console.log('10. Opening Audited Distribution Report...');
  await evaluateJs(ws, `
    const auditBtn = [...document.querySelectorAll('div')].find(el => el.innerText === 'Audit Report' && el.offsetParent !== null);
    if (auditBtn) auditBtn.click();
  `);
  await sleep(1500);
  await captureScreenshot(ws, '14_distribution_audit_report.png');

  // 11. Activity Screen
  console.log('11. Navigating to Activity Screen...');
  await sendCdpCommand(ws, 'Page.navigate', { url: 'http://127.0.0.1:3000/' });
  await sleep(1500);
  await evaluateJs(ws, `
    const actTab = [...document.querySelectorAll('div')].find(el => el.innerText === 'Activity' && el.offsetParent !== null);
    if (actTab) actTab.click();
  `);
  await sleep(1500);
  await captureScreenshot(ws, '15_activity_notifications.png');

  ws.close();
  console.log('\n=================================================');
  console.log('ALL 15 HIGH-FIDELITY SCREENSHOTS CAPTURED CLEANLY');
  console.log('=================================================\n');
}

runFullTour().catch(err => {
  console.error('Tour Error:', err);
  process.exit(1);
});
