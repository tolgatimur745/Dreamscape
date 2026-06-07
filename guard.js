/* =============================================================
   MODULE GUARD & NAV FIX
   - Prevents duplicate section injection
   - Fixes scroll-to-top on navigation
   - Forces display:none/block via CSS !important
============================================================= */

// ── 1. CSS FIX ─────────────────────────────────────────────
(function() {
  if (document.getElementById('ds-nav-css-fix')) return;
  var s = document.createElement('style');
  s.id = 'ds-nav-css-fix';
  // IMPORTANT: Only hide ds-sections when body.ds-in-section is active.
  // Without this scope, hub page content (hero, games etc.) would be hidden too.
  s.textContent = [
    'body.ds-in-section .ds-section { display: none !important; }',
    'body.ds-in-section .ds-section.ds-active { display: block !important; }',
    'html, body { scroll-behavior: auto !important; }'
  ].join('\n');
  document.head.appendChild(s);
})();

// ── 2. SAFE INJECT HELPER ──────────────────────────────────
// Replaces raw insertAdjacentHTML with a guard-checked version
window.__dsInject = function(sectionId, html) {
  if (document.getElementById(sectionId)) return; // already exists
  document.body.insertAdjacentHTML('beforeend', html);
};

// ── 3. NAVIGATION OVERRIDE ─────────────────────────────────
window.dsGoToSection = function(id, title) {
  // Instant scroll first
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  var hub = document.getElementById('hubPage');
  if (hub) hub.classList.add('ds-hidden');

  // Hide all — remove ds-active class (CSS handles display:none)
  document.querySelectorAll('.ds-section').forEach(function(s) {
    s.classList.remove('ds-active');
  });

  if (id === 'hubPage') {
    if (hub) {
      hub.classList.remove('ds-hidden');
    }
    document.body.classList.remove('ds-in-section');
    document.body.classList.add('ds-in-hub');
    var t2 = document.getElementById('navSectionTitle');
    if (t2) t2.textContent = '';
    return;
  }

  var target = document.getElementById(id);
  if (target) {
    target.classList.add('ds-active');
  }

  document.body.classList.add('ds-in-section');
  document.body.classList.remove('ds-in-hub');

  var titleEl = document.getElementById('navSectionTitle');
  if (titleEl) titleEl.textContent = title || '';

  // Double scroll to catch deferred layout
  requestAnimationFrame(function() {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);
    setTimeout(function() {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.dispatchEvent(new Event('resize'));
    }, 80);
  });
};

window.dsGoToHub = function() {
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  window.scrollTo(0, 0);

  var hub = document.getElementById('hubPage');
  if (hub) hub.classList.remove('ds-hidden');

  document.querySelectorAll('.ds-section').forEach(function(s) {
    s.classList.remove('ds-active');
  });

  document.body.classList.remove('ds-in-section');
  document.body.classList.add('ds-in-hub');

  var titleEl = document.getElementById('navSectionTitle');
  if (titleEl) titleEl.textContent = '';
};
