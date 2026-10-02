import fs from 'fs';
import path from 'path';

const CAMOFOX_BASE = 'http://localhost:9377';
const SITE_BASE = 'http://localhost:8082';
const ARTIFACT_DIR = 'C:\\Users\\DELL\\.gemini\\antigravity-ide\\brain\\bcacf86f-a8cb-4122-a861-d333b213503a';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log('=== Starting Real Mobile Responsiveness Live Test (Camofox) ===');
  const userId = `mobile-audit-${Date.now()}`;
  const sessionKey = 'mobile-audit-session';

  // 1. Create Tab
  console.log('1. Creating Tab on http://localhost:8082/agama_buddha.html...');
  const createTabRes = await fetch(`${CAMOFOX_BASE}/tabs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      sessionKey,
      url: `${SITE_BASE}/agama_buddha.html`
    })
  });

  const tabData = await createTabRes.json();
  const tabId = tabData.tabId || tabData.id;
  console.log('Tab created:', tabId);

  // 2. Set physical viewport size to 375 x 667 (iPhone SE) via Camofox API
  console.log('Setting viewport size to 375 x 667 (iPhone SE)...');
  const vpRes = await fetch(`${CAMOFOX_BASE}/tabs/${tabId}/viewport`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, width: 375, height: 667 })
  });
  const vpData = await vpRes.json();
  console.log('Viewport set response:', JSON.stringify(vpData));
  await delay(1000);

  // Helper to evaluate JS in page
  async function evaluate(code) {
    const res = await fetch(`${CAMOFOX_BASE}/tabs/${tabId}/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, expression: code })
    });
    const data = await res.json();
    return data.result;
  }

  // Helper to save screenshot
  async function takeScreenshot(filename) {
    const res = await fetch(`${CAMOFOX_BASE}/tabs/${tabId}/screenshot?userId=${encodeURIComponent(userId)}`);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filePath = path.join(ARTIFACT_DIR, filename);
    fs.writeFileSync(filePath, buffer);
    console.log(`[Screenshot Saved] ${filePath} (${buffer.length} bytes)`);
  }

  // Helper to navigate
  async function navigate(pageUrl) {
    await fetch(`${CAMOFOX_BASE}/tabs/${tabId}/navigate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, url: pageUrl })
    });
    await delay(1200);
  }

  // Helper to click
  async function click(selector) {
    await fetch(`${CAMOFOX_BASE}/tabs/${tabId}/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, selector })
    });
    await delay(600);
  }

  // --- Test 1: agama_buddha.html ---
  console.log('\n--- Checking agama_buddha.html (iPhone SE 375x667) ---');
  const agamaCheck = await evaluate(`
    (() => {
      const grid = document.querySelector('.content-split-grid');
      const gridStyles = grid ? window.getComputedStyle(grid) : null;
      const h2 = grid ? grid.querySelector('h2') : null;
      const img = grid ? grid.querySelector('img') : null;
      
      // Scroll to the section
      if (grid) grid.scrollIntoView({ behavior: 'instant', block: 'start' });

      return {
        innerWidth: window.innerWidth,
        columns: gridStyles ? gridStyles.getPropertyValue('grid-template-columns') : null,
        h2Text: h2 ? h2.innerText : null,
        imgWidth: img ? Math.round(img.getBoundingClientRect().width) : 0,
        imgHeight: img ? Math.round(img.getBoundingClientRect().height) : 0,
        scrollWidth: document.body.scrollWidth,
        hasHorizontalOverflow: document.body.scrollWidth > window.innerWidth
      };
    })()
  `);
  console.log('Agama Buddha Mobile Audit:', JSON.stringify(agamaCheck, null, 2));
  await delay(400);
  await takeScreenshot('camofox_mobile_fix_agama_buddha.png');

  // Check schedule table
  await evaluate(`
    (() => {
      const tbl = document.querySelector('#jadwal');
      if (tbl) tbl.scrollIntoView({ behavior: 'instant', block: 'start' });
    })()
  `);
  await delay(400);
  await takeScreenshot('camofox_mobile_fix_agama_buddha_table.png');

  // --- Test 2: tanah_makam.html ---
  console.log('\n--- Checking tanah_makam.html ---');
  await navigate(`${SITE_BASE}/tanah_makam.html`);
  const makamCheck = await evaluate(`
    (() => {
      const grids = document.querySelectorAll('.content-split-grid');
      const firstGridStyle = grids.length > 0 ? window.getComputedStyle(grids[0]) : null;
      if (grids[0]) grids[0].scrollIntoView({ behavior: 'instant', block: 'start' });
      return {
        gridCount: grids.length,
        firstGridColumns: firstGridStyle ? firstGridStyle.getPropertyValue('grid-template-columns') : null,
        scrollWidth: document.body.scrollWidth,
        hasHorizontalOverflow: document.body.scrollWidth > window.innerWidth
      };
    })()
  `);
  console.log('Tanah Makam Mobile Audit:', JSON.stringify(makamCheck, null, 2));
  await delay(400);
  await takeScreenshot('camofox_mobile_fix_tanah_makam.png');

  // --- Test 3: rumah_duka.html ---
  console.log('\n--- Checking rumah_duka.html ---');
  await navigate(`${SITE_BASE}/rumah_duka.html`);
  const dukaCheck = await evaluate(`
    (() => {
      const grid = document.querySelector('.content-split-grid');
      const cardGrid = document.querySelector('.card-grid-4');
      if (grid) grid.scrollIntoView({ behavior: 'instant', block: 'start' });
      return {
        gridColumns: grid ? window.getComputedStyle(grid).getPropertyValue('grid-template-columns') : null,
        cardColumns: cardGrid ? window.getComputedStyle(cardGrid).getPropertyValue('grid-template-columns') : null,
        scrollWidth: document.body.scrollWidth,
        hasHorizontalOverflow: document.body.scrollWidth > window.innerWidth
      };
    })()
  `);
  console.log('Rumah Duka Mobile Audit:', JSON.stringify(dukaCheck, null, 2));
  await delay(400);
  await takeScreenshot('camofox_mobile_fix_rumah_duka.png');

  // --- Test 4: bidang_pendidikan.html ---
  console.log('\n--- Checking bidang_pendidikan.html ---');
  await navigate(`${SITE_BASE}/bidang_pendidikan.html`);
  const eduCheck = await evaluate(`
    (() => {
      const cards = document.querySelectorAll('.institution-card');
      if (cards[0]) cards[0].scrollIntoView({ behavior: 'instant', block: 'start' });
      return {
        cardCount: cards.length,
        cardColumns: cards[0] ? window.getComputedStyle(cards[0]).getPropertyValue('grid-template-columns') : null,
        scrollWidth: document.body.scrollWidth,
        hasHorizontalOverflow: document.body.scrollWidth > window.innerWidth
      };
    })()
  `);
  console.log('Bidang Pendidikan Mobile Audit:', JSON.stringify(eduCheck, null, 2));
  await delay(400);
  await takeScreenshot('camofox_mobile_fix_bidang_pendidikan.png');

  // --- Test 5: artikel_klenteng.html ---
  console.log('\n--- Checking artikel_klenteng.html ---');
  await navigate(`${SITE_BASE}/artikel_klenteng.html`);
  const artikelCheck = await evaluate(`
    (() => {
      const taxGrid = document.querySelector('.taxonomy-grid-2');
      if (taxGrid) taxGrid.scrollIntoView({ behavior: 'instant', block: 'start' });
      return {
        taxColumns: taxGrid ? window.getComputedStyle(taxGrid).getPropertyValue('grid-template-columns') : null,
        scrollWidth: document.body.scrollWidth,
        hasHorizontalOverflow: document.body.scrollWidth > window.innerWidth
      };
    })()
  `);
  console.log('Artikel Klenteng Mobile Audit:', JSON.stringify(artikelCheck, null, 2));
  await delay(400);
  await takeScreenshot('camofox_mobile_fix_artikel_klenteng.png');

  // --- Test 6: profil.html ---
  console.log('\n--- Checking profil.html ---');
  await navigate(`${SITE_BASE}/profil.html`);
  const profilCheck = await evaluate(`
    (() => {
      const split = document.querySelector('.content-split-grid');
      if (split) split.scrollIntoView({ behavior: 'instant', block: 'start' });
      return {
        splitColumns: split ? window.getComputedStyle(split).getPropertyValue('grid-template-columns') : null,
        scrollWidth: document.body.scrollWidth,
        hasHorizontalOverflow: document.body.scrollWidth > window.innerWidth
      };
    })()
  `);
  console.log('Profil Mobile Audit:', JSON.stringify(profilCheck, null, 2));
  await delay(400);
  await takeScreenshot('camofox_mobile_fix_profil.png');

  // --- Test 7: index.html Mobile Drawer & Header ---
  console.log('\n--- Checking index.html ---');
  await navigate(`${SITE_BASE}/index.html`);
  const homeCheck = await evaluate(`
    (() => {
      const header = document.querySelector('.site-header');
      const toggle = document.querySelector('.mobile-toggle');
      return {
        headerHeight: header.offsetHeight,
        toggleVisible: window.getComputedStyle(toggle).display !== 'none',
        scrollWidth: document.body.scrollWidth,
        innerWidth: window.innerWidth,
        hasHorizontalOverflow: document.body.scrollWidth > window.innerWidth
      };
    })()
  `);
  console.log('Index Mobile Audit:', JSON.stringify(homeCheck, null, 2));
  await delay(400);
  await takeScreenshot('camofox_mobile_fix_home.png');

  // Click hamburger toggle to verify drawer on mobile
  console.log('\nClicking hamburger toggle...');
  await click('.mobile-toggle');
  await delay(600);
  await takeScreenshot('camofox_mobile_fix_home_drawer.png');

  // Clean up tab
  console.log('\nClosing Tab...');
  await fetch(`${CAMOFOX_BASE}/tabs/${tabId}?userId=${encodeURIComponent(userId)}`, {
    method: 'DELETE'
  });
  console.log('Tab closed.');
  console.log('=== Real Mobile Responsiveness Live Test Completed Successfully ===');
}

main().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
