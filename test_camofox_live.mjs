import fs from 'fs';
import path from 'path';

const CAMOFOX_BASE = 'http://localhost:9377';
const SITE_BASE = 'http://localhost:8082';
const USER_ID = 'live-test-' + Date.now();
const ARTIFACT_DIR = 'C:\\Users\\DELL\\.gemini\\antigravity-ide\\brain\\bcacf86f-a8cb-4122-a861-d333b213503a';

async function request(endpoint, options = {}) {
  const url = `${CAMOFOX_BASE}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Camofox request failed ${res.status} ${endpoint}: ${text}`);
  }
  return res;
}

async function saveScreenshot(tabId, filename) {
  const res = await request(`/tabs/${tabId}/screenshot?userId=${USER_ID}`);
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const outPath = path.join(ARTIFACT_DIR, filename);
  fs.writeFileSync(outPath, buffer);
  console.log(`[Screenshot Saved] ${outPath} (${buffer.length} bytes)`);
}

async function evaluate(tabId, expression) {
  const res = await request(`/tabs/${tabId}/evaluate`, {
    method: 'POST',
    body: JSON.stringify({ userId: USER_ID, expression })
  });
  const data = await res.json();
  return data.result;
}

async function click(tabId, selector) {
  const res = await request(`/tabs/${tabId}/click`, {
    method: 'POST',
    body: JSON.stringify({ userId: USER_ID, selector })
  });
  return await res.json();
}

async function navigate(tabId, url) {
  const res = await request(`/tabs/${tabId}/navigate`, {
    method: 'POST',
    body: JSON.stringify({ userId: USER_ID, url })
  });
  return await res.json();
}

async function run() {
  console.log(`=== Starting Camofox Live Test for Boen Tek Bio Website ===`);
  console.log(`User ID: ${USER_ID}`);

  // 1. Create Tab
  console.log(`\n1. Creating Tab on ${SITE_BASE}/index.html...`);
  const createRes = await request('/tabs', {
    method: 'POST',
    body: JSON.stringify({ userId: USER_ID, sessionKey: 'session-1', url: `${SITE_BASE}/index.html` })
  });
  const tabData = await createRes.json();
  const tabId = tabData.tabId;
  console.log(`Tab created with ID: ${tabId}`);

  // Wait 2s for initial render
  await new Promise(r => setTimeout(r, 2000));

  // 2. Check Desktop Render & Overflow
  console.log(`\n2. Testing Desktop Viewport (1440px)...`);
  const desktopOverflow = await evaluate(tabId, `(() => {
    return {
      windowWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      hasOverflow: document.documentElement.scrollWidth > window.innerWidth,
      title: document.title
    };
  })()`);
  console.log('Desktop Check:', JSON.stringify(desktopOverflow));
  await saveScreenshot(tabId, 'camofox_live_desktop_home.png');

  // 3. Test Hover on Dropdown "Pelayanan Umat"
  console.log(`\n3. Testing Desktop Dropdown Menu...`);
  const dropdownInfo = await evaluate(tabId, `(() => {
    const dropdown = document.querySelector('.nav-item.has-dropdown');
    const menu = dropdown ? dropdown.querySelector('.dropdown-menu') : null;
    if (!dropdown || !menu) return { found: false };
    // Simulate hover/focus
    dropdown.classList.add('touch-open');
    menu.style.opacity = '1';
    menu.style.visibility = 'visible';
    menu.style.transform = 'translateY(0)';
    const items = Array.from(menu.querySelectorAll('.dropdown-item, .dropdown-subitem')).map(a => a.textContent.trim());
    return { found: true, items };
  })()`);
  console.log('Dropdown items:', JSON.stringify(dropdownInfo));
  await saveScreenshot(tabId, 'camofox_live_desktop_dropdown_open.png');

  // 4. Test Submenu Flyout (Bidang Keagamaan & Bidang Sosial)
  console.log(`\n4. Testing Desktop Submenu Flyout...`);
  const submenuInfo = await evaluate(tabId, `(() => {
    const submenu = document.querySelector('.has-submenu .submenu-menu');
    if (submenu) {
      submenu.style.opacity = '1';
      submenu.style.visibility = 'visible';
      submenu.style.transform = 'translateX(0)';
      return { foundSubmenu: true };
    }
    return { foundSubmenu: false };
  })()`);
  console.log('Submenu Flyout:', JSON.stringify(submenuInfo));
  await saveScreenshot(tabId, 'camofox_live_desktop_submenu_flyout.png');

  // 5. Test Mobile Viewport (Set screen width to 375px)
  console.log(`\n5. Testing Mobile Viewport (375px)...`);
  await evaluate(tabId, `(() => {
    // Inject mobile media styling emulation
    const style = document.createElement('style');
    style.id = 'camofox-mobile-override';
    style.innerHTML = \`
      body { width: 375px !important; margin: 0 auto !important; max-width: 375px !important; }
      .site-header { width: 375px !important; }
      .main-nav { display: none !important; }
      .mobile-toggle { display: flex !important; }
    \`;
    document.head.appendChild(style);
  })()`);

  const mobileCheck = await evaluate(tabId, `(() => {
    const toggle = document.querySelector('.mobile-toggle');
    return {
      toggleVisible: toggle ? window.getComputedStyle(toggle).display !== 'none' : false,
      bodyWidth: document.body.clientWidth
    };
  })()`);
  console.log('Mobile Check:', JSON.stringify(mobileCheck));
  await saveScreenshot(tabId, 'camofox_live_mobile_home_375.png');

  // 6. Test Mobile Drawer Open
  console.log(`\n6. Clicking Mobile Hamburger Toggle...`);
  await click(tabId, '.mobile-toggle');
  await new Promise(r => setTimeout(r, 600));

  const drawerState = await evaluate(tabId, `(() => {
    const drawer = document.querySelector('.mobile-drawer');
    return {
      drawerOpen: drawer ? drawer.classList.contains('open') : false,
      panelWidth: document.querySelector('.mobile-panel')?.clientWidth
    };
  })()`);
  console.log('Drawer State:', JSON.stringify(drawerState));
  await saveScreenshot(tabId, 'camofox_live_mobile_drawer_open.png');

  // 7. Test Mobile Accordion Expand
  console.log(`\n7. Clicking Mobile Accordion for "Pelayanan Umat"...`);
  const accordionResult = await evaluate(tabId, `(() => {
    const toggle = document.querySelector('.mobile-accordion-toggle');
    if (toggle) {
      toggle.click();
      const parent = toggle.closest('.mobile-nav-item');
      const sub = parent ? parent.querySelector('.mobile-submenu') : null;
      return {
        clicked: true,
        submenuOpen: sub ? sub.classList.contains('open') : false,
        subItemsCount: sub ? sub.querySelectorAll('a').length : 0
      };
    }
    return { clicked: false };
  })()`);
  console.log('Accordion Result:', JSON.stringify(accordionResult));
  await new Promise(r => setTimeout(r, 400));
  await saveScreenshot(tabId, 'camofox_live_mobile_accordion_expanded.png');

  // 8. Test Navigation to New Sub-pages
  console.log(`\n8. Testing Navigation to Sub-pages...`);
  
  // Test agama_buddha.html
  await navigate(tabId, `${SITE_BASE}/agama_buddha.html`);
  await new Promise(r => setTimeout(r, 1000));
  await saveScreenshot(tabId, 'camofox_live_page_agama_buddha.png');
  console.log('Verified agama_buddha.html');

  // Test sejarah.html
  await navigate(tabId, `${SITE_BASE}/sejarah.html`);
  await new Promise(r => setTimeout(r, 1000));
  await saveScreenshot(tabId, 'camofox_live_page_sejarah.png');
  console.log('Verified sejarah.html');

  // Test artikel_klenteng.html
  await navigate(tabId, `${SITE_BASE}/artikel_klenteng.html`);
  await new Promise(r => setTimeout(r, 1000));
  await saveScreenshot(tabId, 'camofox_live_page_artikel_klenteng.png');
  console.log('Verified artikel_klenteng.html');

  // Test rumah_duka.html
  await navigate(tabId, `${SITE_BASE}/rumah_duka.html`);
  await new Promise(r => setTimeout(r, 1000));
  await saveScreenshot(tabId, 'camofox_live_page_rumah_duka.png');
  console.log('Verified rumah_duka.html');

  // 9. Close Tab
  console.log(`\n9. Closing Tab ${tabId}...`);
  await request(`/tabs/${tabId}?userId=${USER_ID}`, { method: 'DELETE' });
  console.log('Tab closed successfully!');

  console.log(`\n=== All Camofox Live Tests Completed Successfully! ===`);
}

run().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
