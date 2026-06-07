/* =============================================================
   MASTER MODULE LOADER - Appended to app.js
   Guard pattern: each section injected only once via ID check
   Fixes: scroll-to-top, duplicate sections, display:none override
============================================================= */

// ── GLOBAL CSS FIX ─────────────────────────────────────────
(function() {
  if (document.getElementById('ds-global-fix')) return;
  var style = document.createElement('style');
  style.id = 'ds-global-fix';
  style.textContent = `
    .ds-section { display: none !important; }
    .ds-section.ds-active { display: block !important; min-height: 100vh; }
    html { scroll-behavior: auto !important; }
  `;
  document.head.appendChild(style);
})();

// ── NAVIGATION PATCH (scroll + display fix) ─────────────────
(function() {
  var _orig = window.dsGoToSection;
  window.dsGoToSection = function(id, title) {
    // First scroll to top immediately
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo({top: 0, left: 0, behavior: 'instant'});

    var hub = document.getElementById('hubPage');
    if (hub) hub.classList.add('ds-hidden');

    // Hide all sections (remove inline style override too)
    document.querySelectorAll('.ds-section').forEach(function(s) {
      s.classList.remove('ds-active');
      s.style.removeProperty('display');
    });

    if (id === 'hubPage') {
      if (hub) hub.classList.remove('ds-hidden');
      document.body.classList.remove('ds-in-section');
      document.body.classList.add('ds-in-hub');
      var titleEl = document.getElementById('navSectionTitle');
      if (titleEl) titleEl.textContent = '';
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

    // Scroll after paint
    requestAnimationFrame(function() {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      setTimeout(function() {
        window.dispatchEvent(new Event('resize'));
      }, 150);
    });
  };

  window.dsGoToHub = function() {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    var hub = document.getElementById('hubPage');
    if (hub) hub.classList.remove('ds-hidden');

    document.querySelectorAll('.ds-section').forEach(function(s) {
      s.classList.remove('ds-active');
      s.style.removeProperty('display');
    });

    document.body.classList.remove('ds-in-section');
    document.body.classList.add('ds-in-hub');

    var titleEl = document.getElementById('navSectionTitle');
    if (titleEl) titleEl.textContent = '';
    window.scrollTo({top: 0, behavior: 'instant'});
  };
})();
