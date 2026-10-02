/**
 * Klenteng Boen Tek Bio - Native Interactive Controls
 * Built with Ponytail standards: pure vanilla JS, accessible, zero-bloat, no fake data.
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initTimelineTabs();
  initAltarFilter();
});

/* 1. Mobile Drawer Navigation & Accordion Controls */
function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  const closeBtn = document.querySelector('.mobile-drawer-close');

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

  // Mobile Accordion toggles
  const accordionToggles = drawer.querySelectorAll('.mobile-accordion-toggle');
  accordionToggles.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = btn.classList.contains('expanded');
      btn.classList.toggle('expanded', !isExpanded);
      btn.setAttribute('aria-expanded', !isExpanded ? 'true' : 'false');

      const parentItem = btn.closest('.mobile-nav-item');
      if (parentItem) {
        const subMenu = parentItem.querySelector('.mobile-submenu');
        if (subMenu) {
          subMenu.classList.toggle('open', !isExpanded);
        }
      }
    });
  });

  // Clicking any nav link in drawer navigates and closes drawer
  const allDrawerLinks = drawer.querySelectorAll('a');
  allDrawerLinks.forEach((link) => {
    link.addEventListener('click', closeDrawer);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });

  // Desktop touch support for dropdowns
  const desktopDropdownLinks = document.querySelectorAll('.nav-item.has-dropdown > .nav-link');
  desktopDropdownLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      if (window.innerWidth > 1080 && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
        const parent = link.closest('.nav-item');
        if (parent && !parent.classList.contains('touch-open')) {
          e.preventDefault();
          document.querySelectorAll('.nav-item.touch-open').forEach((p) => p.classList.remove('touch-open'));
          parent.classList.add('touch-open');
        }
      }
    });
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
