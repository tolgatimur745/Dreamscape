"/* ============================================
   DREAMSCAPE v2 — Complete JavaScript Engine
   All games fixed + new features added
   ============================================ */

'use strict';

// ─── PARTICLE SYSTEM ──────────────────────────────────────────────────────
(function() {
  const c = document.getElementById('particleCanvas');
  const cx = c.getContext('2d');
  let particles = [];

  function resize() { c.width = window.innerWidth; c.height = window.innerHeight; }
  window.addEventListener('resize', resize); resize();

  class Star {
    constructor() { this.init(); }
    init() {
      this.x = Math.random() * c.width;
      this.y = Math.random() * c.height;
      this.size = Math.random() * 1.8 + 0.3;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.hue = Math.random() * 80 + 220;
      this.phase = Math.random() * Math.PI * 2;
    }
    update() {
      this.x += this.vx; this.y += this.vy; this.phase += 0.025;
      if (this.x < 0 || this.x > c.width || this.y < 0 || this.y > c.height) this.init();
    }
    draw() {
      const a = 0.15 + Math.abs(Math.sin(this.phase)) * 0.45;
      cx.save();
      cx.globalAlpha = a;
      cx.fillStyle = `hsl(${this.hue},80%,70%)`;
      cx.shadowBlur = 8; cx.shadowColor = `hsl(${this.hue},80%,70%)`;
      cx.beginPath(); cx.arc(this.x, this.y, this.size, 0, Math.PI * 2); cx.fill();
      cx.restore();
    }
  }

  for (let i = 0; i < 140; i++) particles.push(new Star());
  (function loop() {
    cx.clearRect(0, 0, c.width, c.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  })();
})();

// ─── GLOBAL UTILS ─────────────────────────────────────────────────────────
const t
<truncated 62515 bytes>