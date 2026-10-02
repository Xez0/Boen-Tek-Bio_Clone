import fs from 'fs';
import path from 'path';

const CAMOFOX_BASE = 'http://localhost:9377';
const SITE_BASE = 'http://localhost:8082';
const USER_ID = 'icon-test-' + Date.now();
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

async function run() {
  console.log('1. Creating tab for index.html...');
  const resTab = await request('/tabs', {
    method: 'POST',
    body: JSON.stringify({
      userId: USER_ID,
      sessionKey: 'session-1',
      url: `${SITE_BASE}/index.html`
    })
  });
  const tabData = await resTab.json();
  const tabId = tabData.tabId;
  console.log(`Tab ID: ${tabId}`);

  await new Promise(r => setTimeout(r, 2000));

  // Inspect Dropdown Chevron in Top Navbar
  console.log('\n2. Inspecting Desktop Nav Chevrons...');
  const navChevronMetrics = await evaluate(tabId, `(() => {
    const chevrons = Array.from(document.querySelectorAll('.dropdown-chevron')).map(el => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        tag: el.tagName,
        width: rect.width,
        height: rect.height,
        color: style.color,
        borderColor: style.borderRightColor,
        display: style.display
      };
    });
    return chevrons;
  })()`);
  console.log('Dropdown Chevrons:', JSON.stringify(navChevronMetrics, null, 2));

  // Open Desktop Dropdown "Pelayanan Umat" and Submenu
  console.log('\n3. Opening Desktop Dropdown & Submenu...');
  const menuMetrics = await evaluate(tabId, `(() => {
    const dropdown = document.querySelector('.nav-item.has-dropdown');
    const menu = dropdown ? dropdown.querySelector('.dropdown-menu') : null;
    const hasSub = document.querySelector('.has-submenu');
    const submenu = hasSub ? hasSub.querySelector('.submenu-menu') : null;
    if (dropdown && menu) {
      dropdown.classList.add('open', 'touch-open');
      menu.style.opacity = '1';
      menu.style.visibility = 'visible';
      menu.style.transform = 'translateY(0)';
    }
    if (hasSub && submenu) {
      hasSub.classList.add('open', 'touch-open');
      submenu.style.opacity = '1';
      submenu.style.visibility = 'visible';
      submenu.style.transform = 'translateX(0)';
    }
    
    // Inspect Submenu Chevrons
    const subChevrons = Array.from(document.querySelectorAll('.submenu-chevron')).map(el => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        tag: el.tagName,
        width: rect.width,
        height: rect.height,
        color: style.color,
        borderColor: style.borderRightColor,
        display: style.display
      };
    });
    return { subChevrons };
  })()`);
  console.log('Submenu Chevrons:', JSON.stringify(menuMetrics, null, 2));

  await new Promise(r => setTimeout(r, 600));
  await saveScreenshot(tabId, 'camofox_icon_desktop_nav.png');

  // Test Mobile Drawer and Accordion
  console.log('\n4. Testing Mobile Viewport & Drawer...');
  await evaluate(tabId, `(() => {
    const style = document.createElement('style');
    style.id = 'camofox-mobile-override';
    style.innerHTML = \`
      body { width: 375px !important; margin: 0 auto !important; max-width: 375px !important; }
      .site-header { width: 375px !important; }
      .main-nav { display: none !important; }
      .mobile-toggle { display: flex !important; }
      .container { max-width: 100% !important; padding: 0 1rem !important; }
    \`;
    document.head.appendChild(style);

    // Open mobile drawer
    const drawer = document.querySelector('.mobile-drawer');
    if (drawer) {
      drawer.classList.add('open');
      drawer.style.display = 'block';
    }
    // Expand accordion
    const toggle = document.querySelector('.mobile-accordion-toggle');
    const submenu = document.querySelector('.mobile-submenu');
    if (toggle && submenu) {
      toggle.classList.add('expanded');
      submenu.classList.add('open');
      submenu.style.display = 'flex';
    }
  })()`);

  await saveScreenshot(tabId, 'camofox_icon_mobile_drawer.png');

  console.log('\nTesting completed successfully!');
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
