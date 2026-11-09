/* Progressive enhancement: the resume and native disclosures work without JavaScript. */
(() => {
  'use strict';
  const root = document.documentElement;
  root.dataset.theme = 'light';
  const filters = [...document.querySelectorAll('[data-filter]')];
  const projects = [...document.querySelectorAll('.project')];
  document.querySelector('.filter-bar').hidden = false;
  filters.forEach((button) => button.addEventListener('click', () => {
    const category = button.dataset.filter;
    let visibleCount = 0;
    projects.forEach((project) => {
      project.hidden = category !== 'all' && !project.dataset.categories.split(' ').includes(category);
      if (!project.hidden) visibleCount++;
    });
    filters.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    document.querySelector('#filter-status').textContent = `${visibleCount} project${visibleCount === 1 ? '' : 's'} shown.`;
    updateProgress();
  }));

  const menuToggle = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('#mobile-nav');
  menuToggle.hidden = false;
  const closeMenu = () => {
    mobileNav.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
  };
  menuToggle.addEventListener('click', () => {
    const willOpen = menuToggle.getAttribute('aria-expanded') !== 'true';
    mobileNav.hidden = !willOpen;
    menuToggle.setAttribute('aria-expanded', String(willOpen));
    menuToggle.setAttribute('aria-label', willOpen ? 'Close navigation' : 'Open navigation');
  });
  mobileNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !mobileNav.hidden) { closeMenu(); menuToggle.focus(); }
  });
  document.addEventListener('click', (event) => {
    if (!mobileNav.hidden && !event.target.closest('.site-header')) closeMenu();
  });
  window.matchMedia('(min-width: 601px)').addEventListener('change', ({ matches }) => { if (matches) closeMenu(); });

  const copyButton = document.querySelector('.copy-email');
  let copyTimeout;
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    copyButton.hidden = false;
    copyButton.addEventListener('click', async () => {
      const status = document.querySelector('.copy-status');
      try {
        await navigator.clipboard.writeText('xwanglk@connect.ust.hk');
        copyButton.querySelector('span').textContent = 'Copied';
        copyButton.querySelector('use').setAttribute('href', '#check');
        status.textContent = 'Email copied to clipboard.';
      } catch { status.textContent = 'Select the email address above to copy it.'; }
      clearTimeout(copyTimeout);
      copyTimeout = setTimeout(() => {
        copyButton.querySelector('span').textContent = 'Copy email';
        copyButton.querySelector('use').setAttribute('href', '#copy');
        status.textContent = '';
      }, 4000);
    });
  }

  const progress = document.querySelector('.reading-progress');
  const sections = [...document.querySelectorAll('#work, #publications, #background, #contact')];
  const navLinks = [...document.querySelectorAll('.desktop-nav a, .mobile-nav a')];
  function updateProgress() {
    const scrollable = root.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0})`;
    let active = '';
    sections.forEach((section) => { if (section.getBoundingClientRect().top <= 180) active = section.id; });
    if (window.scrollY + window.innerHeight >= root.scrollHeight - 8) active = 'contact';
    navLinks.forEach((link) => {
      if (link.hash === `#${active}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(() => { updateProgress(); ticking = false; }); ticking = true; }
  }, { passive: true });
  window.addEventListener('resize', updateProgress);
  document.querySelectorAll('details').forEach((details) => details.addEventListener('toggle', updateProgress));
  updateProgress();

  // Print all projects and disclosures, then restore the visitor's current view.
  let printState = [];
  window.addEventListener('beforeprint', () => {
    printState = [...document.querySelectorAll('details')].map((details) => ({ details, open: details.open }));
    printState.forEach(({ details }) => { details.open = true; });
  });
  window.addEventListener('afterprint', () => { printState.forEach(({ details, open }) => { details.open = open; }); });
})();
