/**
 * Klenteng Boen Tek Bio - Native Interactive Controls
 * Built with Ponytail standards: pure vanilla JS, accessible, zero-bloat, no fake data.
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initTimelineTabs();
  initAltarFilter();
});

/* 1. Mobile Drawer Navigation */
function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  const closeBtn = document.querySelector('.mobile-drawer-close');
  const navLinks = document.querySelectorAll('.mobile-nav-link');

  if (!toggleBtn || !drawer) return;

  const openDrawer = () => {
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    toggleBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    toggleBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  toggleBtn.addEventListener('click', openDrawer);

  if (closeBtn) {
    closeBtn.addEventListener('click', closeDrawer);
  }

  drawer.addEventListener('click', (e) => {
    if (e.target === drawer) {
      closeDrawer();
    }
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', closeDrawer);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });
}

/* 2. Historical Timeline Filter / Tabs (if present) */
function initTimelineTabs() {
  const tabs = document.querySelectorAll('.timeline-pill');
  const cards = document.querySelectorAll('.timeline-card');

  if (tabs.length === 0 || cards.length === 0) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const year = tab.getAttribute('data-year');

      tabs.forEach((t) => {
        const isCurrent = t === tab;
        t.classList.toggle('active', isCurrent);
        t.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
      });

      cards.forEach((card) => {
        const match = card.getAttribute('data-year') === year;
        card.classList.toggle('active', match);
        card.style.display = match ? 'grid' : 'none';
      });
    });
  });
}

/* 3. Altar Category Filter (for altar.html) */
function initAltarFilter() {
  const filterBtns = document.querySelectorAll('.altar-filter-btn');
  const altarItems = document.querySelectorAll('.altar-item-card');

  if (filterBtns.length === 0 || altarItems.length === 0) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-filter');

      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      altarItems.forEach((item) => {
        const itemCat = item.getAttribute('data-category');
        if (cat === 'all' || itemCat === cat) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}
