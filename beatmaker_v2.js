
/* =========================================================
   BEAT MAKİNESİ V2 — Full Upgrade
   id: beatmaker-v2-sec
   16 adım, 10 kanal, Swing, Tap Tempo, Preset, VU Metre
========================================================= */
try {

// ── Hub card ──────────────────────────────────────────────
(function() {
  const grids = document.querySelectorAll('#hubMain .hub-grid, .hub-grid');
  if (grids && grids.length > 0) {
    const targetGrid = grids[0];
    const card = document.createElement('div');
    card.className = 'hub-card';
    card.dataset.search = 'beat makinesi v2 drum machine ritim müzik';
    card.innerHTML =
      '<div class="hc-em">🥁</div>' +
      '<div class="hc-ttl">Beat Makinesi V2</div>' +
      '<div class="hc-dsc">Pro Davul Makinesi</div>';
    card.addEventListener('click', function() {
      if (typeof window.dsGoToSection === 'function') {
        window.dsGoToSection('beatmaker-v2-sec', '🥁 Beat Makinesi V2');
      }
    });
    targetGrid.appendChild(card);
  }
})();

// ── Section HTML ──────────────────────────────────────────
document.body.insertAdjacentHTML('beforeend', `
<section class="section ds-section" id="beatmaker-v2-sec" style="padding:0; overflow:hidden;">
  <button class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:100;cursor:pointer;" onclick="if(typeof dsGoToSection==='function') dsGoToSection('hubPage','')">◀ Ana Sayfa</button>

  <style>
    #bm2-root {
      min-height: 100vh;
      background: #0d0d0f;
      padding: 70px 20px 40px;
      font-family: 'Segoe UI', monospace;
      color: #e0e0e0;
      box-sizing: border-box;
    }
    #bm2-root h1.bm2-title {
      text-align: center;
      font-size: clamp(1.4rem, 4vw, 2.2rem);
      font-weight: 900;
      letter-spacing: 3px;
      margin: 0 0 24px;
      background: linear-gradient(90deg, #ff3366, #a020f0, #00e5ff, #39ff14);
      background-size: 300%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: bm2-titleShift 6s linear infinite;
    }
    @keyframes bm2-titleShift { 0%{background-position:0%} 100%{background-position:300%} }

    /* Controls bar */
    #bm2-controls {
      display: flex;
      flex-wrap: wrap;
      gap: 14px;
      align-items: center;
      justify-content: center;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.09);
      border-radius: 14px;
      padding: 14px 20px;
      margin-bottom: 18px;
      backdrop-filter: blur(10px);
    }
    .bm2-ctrl-group {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.82rem;
      color: #aaa;
    }
    .bm2-ctrl-group label { white-space: nowrap; }
    .bm2-ctrl-group span.bm2-val {
      color: #fff;
      font-weight: 700;
      min-width: 32px;
      text-align: center;
    }
    .bm2-range {
      -webkit-appearance: none;
      width: 110px;
      height: 4px;
      border-radius: 3px;
      background: #333;
      outline: none;
    }
    .bm2-range::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 14px; height: 14px;
      border-radius: 50%;
      background: #a020f0;
      cursor: pointer;
      box-shadow: 0 0 8px #a020f0;
    }
    .bm2-btn {
      border: none;
      border-radius: 8px;
      padding: 8px 16px;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      letter-spacing: 1px;
      transition: 0.15s;
    }
    .bm2-btn:active { transform: scale(0.94); }
    .bm2-btn-play  { background: #39ff14; color: #000; box-shadow: 0 0 14px #39ff1455; }
    .bm2-btn-stop  { background: #ff3366; color: #fff; box-shadow: 0 0 14px #ff336655; }
    .bm2-btn-tap   { background: #00e5ff; color: #000; box-shadow: 0 0 10px #00e5ff44; }
    .bm2-btn-clear { background: #333; color: #ddd; }
    .bm2-btn-save  { background: #a020f0; color: #fff; box-shadow: 0 0 10px #a020f044; }
    .bm2-btn-load  { background: #ff9800; color: #000; box-shadow: 0 0 10px #ff980044; }
    .bm2-select {
      background: #1e1e2a;
      border: 1px solid #444;
      border-radius: 8px;
      color: #e0e0e0;
      padding: 7px 10px;
      font-size: 0.82rem;
      outline: none;
      cursor: pointer;
    }

    /* Grid area */
    #bm2-grid-wrap {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 16px;
      padding: 16px;
      backdrop-filter: blur(8px);
      overflow-x: auto;
    }
    .bm2-step-header {
      display: flex;
      margin-left: 280px;
      margin-bottom: 6px;
      gap: 4px;
    }
    .bm2-step-num {
      flex: 1;
      text-align: center;
      font-size: 0.65rem;
      color: #555;
      min-width: 26px;
    }
    .bm2-step-num.bm2-beat-start { color: #888; font-weight: bold; }

    /* Track row */
    .bm2-track {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 6px;
      min-width: 700px;
    }
    /* LED indicator */
    .bm2-led {
      width: 10px; height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
      transition: box-shadow 0.05s;
      margin-right: 2px;
    }
    /* Mute button */
    .bm2-mute {
      width: 24px; height: 24px;
      border-radius: 4px;
      border: 1px solid #444;
      background: #1e1e2a;
      color: #888;
      font-size: 0.6rem;
      font-weight: bold;
      cursor: pointer;
      flex-shrink: 0;
      letter-spacing: 0;
      transition: 0.12s;
    }
    .bm2-mute.active { background: #ff3366; border-color: #ff3366; color: #fff; }

    /* Reverb checkbox */
    .bm2-rev-label {
      font-size: 0.6rem;
      color: #666;
      flex-shrink: 0;
      cursor: pointer;
      white-space: nowrap;
    }
    .bm2-rev-label input { accent-color: #a020f0; margin-right: 2px; }

    /* Track name */
    .bm2-track-name {
      width: 74px;
      font-size: 0.78rem;
      font-weight: 700;
      flex-shrink: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    /* Volume knob (vertical range displayed horizontally) */
    .bm2-vol {
      -webkit-appearance: none;
      width: 48px;
      height: 3px;
      border-radius: 2px;
      background: #333;
      outline: none;
      flex-shrink: 0;
    }
    .bm2-vol::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 10px; height: 10px;
      border-radius: 50%;
      cursor: pointer;
    }
    /* Step buttons */
    .bm2-step {
      flex: 1;
      min-width: 26px;
      height: 36px;
      border-radius: 5px;
      border: 1px solid #2a2a3a;
      background: #14141e;
      cursor: pointer;
      transition: background 0.08s, box-shadow 0.08s, transform 0.06s;
      position: relative;
    }
    .bm2-step:hover { background: #22223a; }
    .bm2-step.bm2-step-on { }
    .bm2-step.bm2-step-beat { border-left: 2px solid #333; }
    .bm2-step.bm2-step-current {
      border: 2px solid rgba(255,255,255,0.9) !important;
      box-shadow: 0 0 12px rgba(255,255,255,0.4), inset 0 0 6px rgba(255,255,255,0.1) !important;
    }
    .bm2-step.bm2-step-current.bm2-step-on {
      border: 2px solid #fff !important;
    }

    /* VU meter */
    .bm2-vu-wrap {
      width: 14px;
      height: 36px;
      background: #0a0a0f;
      border-radius: 3px;
      overflow: hidden;
      flex-shrink: 0;
      display: flex;
      flex-direction: column-reverse;
    }
    .bm2-vu-bar {
      width: 100%;
      background: #39ff14;
      transition: height 0.04s;
      border-radius: 2px 2px 0 0;
    }

    /* Playhead sweep column */
    .bm2-playhead-col {
      position: absolute;
      top: 0; bottom: 0;
      width: 100%;
      background: rgba(255,255,255,0.07);
      pointer-events: none;
      border-radius: 4px;
    }

    /* Master vol */
    #bm2-master-vol::-webkit-slider-thumb {
      background: #39ff14;
      box-shadow: 0 0 8px #39ff14;
    }
    #bm2-swing-slider::-webkit-slider-thumb {
      background: #ff9800;
      box-shadow: 0 0 8px #ff9800;
    }
    #bm2-bpm-slider::-webkit-slider-thumb {
      background: #00e5ff;
      box-shadow: 0 0 8px #00e5ff;
    }

    @media (max-width: 640px) {
      .bm2-step-header { margin-left: 230px; }
      .bm2-track-name  { width: 54px; font-size: 0.7rem; }
      .bm2-vol         { width: 36px; }
      .bm2-step        { min-width: 20px; height: 30px; }
    }
  </style>

  <div id="bm2-root">
    <h1 class="bm2-title">🥁 BEAT MAKİNESİ V2</h1>

    <!-- Controls Bar -->
    <div id="bm2-controls">
      <!-- Play / Stop -->
      <button class="bm2-btn bm2-btn-play" id="bm2-play-btn">▶ BAŞLAT</button>

      <!-- BPM -->
      <div class="bm2-ctrl-group">
        <label>BPM</label>
        <input type="range" class="bm2-range" id="bm2-bpm-slider" min="60" max="200" value="120">
        <span class="bm2-val" id="bm2-bpm-val">120</span>
      </div>

      <!-- Swing -->
      <div class="bm2-ctrl-group">
        <label>Swing</label>
        <input type="range" class="bm2-range" id="bm2-swing-slider" min="0" max="100" value="0">
        <span class="bm2-val" id="bm2-swing-val">0%</span>
      </div>

      <!-- Master Volume -->
      <div class="bm2-ctrl-group">
        <label>Vol</label>
        <input type="range" class="bm2-range" id="bm2-master-vol" min="0" max="100" value="80">
        <span class="bm2-val" id="bm2-master-val">80</span>
      </div>

      <!-- Tap Tempo -->
      <button class="bm2-btn bm2-btn-tap" id="bm2-tap-btn">🎵 TAP</button>

      <!-- Preset -->
      <div class="bm2-ctrl-group">
        <label>Preset</label>
        <select class="bm2-select" id="bm2-preset">
          <option value="bos">Boş</option>
          <option value="trap">Trap Beat</option>
          <option value="house">House Beat</option>
          <option value="bossa">Bossa Nova</option>
          <option value="dnb">DnB</option>
        </select>
      </div>

      <!-- Save / Load -->
      <button class="bm2-btn bm2-btn-save" id="bm2-save-btn">💾 KAYDET</button>
      <button class="bm2-btn bm2-btn-load" id="bm2-load-btn">📂 YÜKLE</button>
      <button class="bm2-btn bm2-btn-clear" id="bm2-clear-btn">🗑 TEMİZLE</button>
    </div>

    <!-- Grid -->
    <div id="bm2-grid-wrap">
      <div class="bm2-step-header" id="bm2-step-header"></div>
      <div id="bm2-grid"></div>
    </div>
  </div>
</section>
`);

// ── Engine ────────────────────────────────────────────────
(function() {
  const STEPS = 16;
  const TRACKS = [
    { name: 'Kick',      color: '#ff3366', emoji: '👟' },
    { name: 'Snare',     color: '#00e5ff', emoji: '🥁' },
    { name: 'HiHat C',  color: '#ffe000', emoji: '🎩' },
    { name: 'HiHat O',  color: '#ffaa00', emoji: '🎩' },
    { name: 'Clap',     color: '#cc44ff', emoji: '👏' },
    { name: 'Tom Lo',   color: '#ff7700', emoji: '🔴' },
    { name: 'Tom Hi',   color: '#ff4444', emoji: '🔴' },
    { name: 'Synth',    color: '#00ff99', emoji: '🎹' },
    { name: 'Bass',     color: '#44ff44', emoji: '🎸' },
    { name: 'Cymbal',   color: '#aaaaff', emoji: '✨' }
  ];

  // State
  let pattern   = TRACKS.map(() => new Array(STEPS).fill(false));
  let muted     = TRACKS.map(() => false);
  let revSend   = TRACKS.map(() => false);
  let volumes   = TRACKS.map(() => 0.8);
  let isPlaying = false;
  let currentStep = 0;
  let nextNoteTime = 0;
  let schedulerTimer = null;
  let bpm = 120;
  let swing = 0;        // 0-100
  let masterVol = 0.8;

  // Tap tempo
  let tapTimes = [];

  // Audio
  const AC = window.AudioContext || window.webkitAudioContext;
  let actx = null;
  let masterGain = null;
  let reverbNode = null;
  let reverbGain = null;
  let trackGains = [];  // per-track gain nodes
  let vuLevels   = TRACKS.map(() => 0); // 0-1

  function initAudio() {
    if (actx) { if (actx.state === 'suspended') actx.resume(); return; }
    actx = new AC();
    masterGain = actx.createGain();
    masterGain.gain.value = masterVol;
    masterGain.connect(actx.destination);

    // Create reverb impulse
    reverbNode = actx.createConvolver();
    reverbGain = actx.createGain();
    reverbGain.gain.value = 0.35;
    reverbGain.connect(masterGain);
    const dur = 2.5;
    const sr = actx.sampleRate;
    const impulse = actx.createBuffer(2, sr * dur, sr);
    for (let c = 0; c < 2; c++) {
      const d = impulse.getChannelData(c);
      for (let i = 0; i < d.length; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2.5);
      }
    }
    reverbNode.buffer = impulse;
    reverbNode.connect(reverbGain);

    // Per-track gains
    trackGains = TRACKS.map(() => {
      const g = actx.createGain();
      g.gain.value = 0.8;
      g.connect(masterGain);
      return g;
    });
  }

  // ── Sound synthesis ──────────────────────────────────────
  function routeTrack(trackIdx, node) {
    node.connect(trackGains[trackIdx]);
    if (revSend[trackIdx]) node.connect(reverbNode);
  }

  function playKick(time, ti) {
    const osc = actx.createOscillator();
    const gain = actx.createGain();
    const dist = actx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) { const x = i * 2 / 255 - 1; curve[i] = (3 + 20) * x / (Math.PI + 20 * Math.abs(x)); }
    dist.curve = curve;
    osc.connect(dist); dist.connect(gain);
    routeTrack(ti, gain);
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.55);
    gain.gain.setValueAtTime(1.2, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.55);
    osc.start(time); osc.stop(time + 0.6);
    flashVU(ti, 1.0);
  }

  function playSnare(time, ti) {
    // Tone body
    const osc = actx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(230, time);
    osc.frequency.exponentialRampToValueAtTime(100, time + 0.18);
    const oscGain = actx.createGain();
    oscGain.gain.setValueAtTime(0.8, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
    osc.connect(oscGain);
    routeTrack(ti, oscGain);
    osc.start(time); osc.stop(time + 0.2);
    // Noise
    const buf = actx.createBuffer(1, actx.sampleRate * 0.22, actx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const ns = actx.createBufferSource();
    ns.buffer = buf;
    const nf = actx.createBiquadFilter();
    nf.type = 'bandpass'; nf.frequency.value = 3200; nf.Q.value = 0.5;
    const ng = actx.createGain();
    ng.gain.setValueAtTime(1.0, time);
    ng.gain.exponentialRampToValueAtTime(0.001, time + 0.22);
    ns.connect(nf); nf.connect(ng);
    routeTrack(ti, ng);
    ns.start(time);
    flashVU(ti, 0.9);
  }

  function playHihatC(time, ti) {
    const buf = actx.createBuffer(1, actx.sampleRate * 0.06, actx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const ns = actx.createBufferSource();
    ns.buffer = buf;
    const hpf = actx.createBiquadFilter();
    hpf.type = 'highpass'; hpf.frequency.value = 9000;
    const g = actx.createGain();
    g.gain.setValueAtTime(0.7, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
    ns.connect(hpf); hpf.connect(g);
    routeTrack(ti, g);
    ns.start(time);
    flashVU(ti, 0.5);
  }

  function playHihatO(time, ti) {
    const buf = actx.createBuffer(1, actx.sampleRate * 0.32, actx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const ns = actx.createBufferSource();
    ns.buffer = buf;
    const hpf = actx.createBiquadFilter();
    hpf.type = 'highpass'; hpf.frequency.value = 8000;
    const g = actx.createGain();
    g.gain.setValueAtTime(0.6, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.32);
    ns.connect(hpf); hpf.connect(g);
    routeTrack(ti, g);
    ns.start(time);
    flashVU(ti, 0.55);
  }

  function playClap(time, ti) {
    for (let burst = 0; burst < 3; burst++) {
      const delay = burst * 0.012;
      const buf = actx.createBuffer(1, actx.sampleRate * 0.15, actx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const ns = actx.createBufferSource();
      ns.buffer = buf;
      const bpf = actx.createBiquadFilter();
      bpf.type = 'bandpass'; bpf.frequency.value = 1400; bpf.Q.value = 0.8;
      const g = actx.createGain();
      const t0 = time + delay;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(0.9, t0 + 0.004);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.15);
      ns.connect(bpf); bpf.connect(g);
      routeTrack(ti, g);
      ns.start(t0);
    }
    flashVU(ti, 0.8);
  }

  function playTomLo(time, ti) {
    const osc = actx.createOscillator();
    const gain = actx.createGain();
    osc.connect(gain);
    routeTrack(ti, gain);
    osc.frequency.setValueAtTime(110, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.38);
    gain.gain.setValueAtTime(1.0, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.38);
    osc.start(time); osc.stop(time + 0.4);
    flashVU(ti, 0.85);
  }

  function playTomHi(time, ti) {
    const osc = actx.createOscillator();
    const gain = actx.createGain();
    osc.connect(gain);
    routeTrack(ti, gain);
    osc.frequency.setValueAtTime(200, time);
    osc.frequency.exponentialRampToValueAtTime(80, time + 0.28);
    gain.gain.setValueAtTime(0.9, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.28);
    osc.start(time); osc.stop(time + 0.3);
    flashVU(ti, 0.75);
  }

  function playSynth(time, ti) {
    const osc = actx.createOscillator();
    osc.type = 'sawtooth';
    const lpf = actx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.setValueAtTime(2000, time);
    lpf.frequency.exponentialRampToValueAtTime(300, time + 0.25);
    const gain = actx.createGain();
    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.28);
    const notes = [261.63, 293.66, 329.63, 392.00, 440.00];
    osc.frequency.value = notes[Math.floor(Math.random() * notes.length)];
    osc.connect(lpf); lpf.connect(gain);
    routeTrack(ti, gain);
    osc.start(time); osc.stop(time + 0.3);
    flashVU(ti, 0.6);
  }

  function playBass(time, ti) {
    const osc = actx.createOscillator();
    osc.type = 'sine';
    const osc2 = actx.createOscillator();
    osc2.type = 'triangle';
    const gain = actx.createGain();
    const lpf = actx.createBiquadFilter();
    lpf.type = 'lowpass'; lpf.frequency.value = 300;
    const bassFreqs = [55, 65.41, 82.41, 110];
    const f = bassFreqs[Math.floor(Math.random() * bassFreqs.length)];
    osc.frequency.value = f;
    osc2.frequency.value = f * 2;
    gain.gain.setValueAtTime(1.0, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.45);
    osc.connect(lpf); osc2.connect(lpf); lpf.connect(gain);
    routeTrack(ti, gain);
    osc.start(time); osc.stop(time + 0.5);
    osc2.start(time); osc2.stop(time + 0.5);
    flashVU(ti, 0.95);
  }

  function playCymbal(time, ti) {
    const buf = actx.createBuffer(1, actx.sampleRate * 0.55, actx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const ns = actx.createBufferSource();
    ns.buffer = buf;
    const hpf = actx.createBiquadFilter();
    hpf.type = 'highpass'; hpf.frequency.value = 6000;
    const lpf = actx.createBiquadFilter();
    lpf.type = 'lowpass'; lpf.frequency.value = 14000;
    const g = actx.createGain();
    g.gain.setValueAtTime(0.5, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.55);
    ns.connect(hpf); hpf.connect(lpf); lpf.connect(g);
    routeTrack(ti, g);
    ns.start(time);
    flashVU(ti, 0.7);
  }

  const soundFns = [
    playKick, playSnare, playHihatC, playHihatO, playClap,
    playTomLo, playTomHi, playSynth, playBass, playCymbal
  ];

  // ── VU Meter animation ────────────────────────────────────
  function flashVU(ti, level) {
    vuLevels[ti] = level;
  }

  function tickVU() {
    TRACKS.forEach((_, ti) => {
      const bar = document.getElementById('bm2-vu-' + ti);
      if (bar) {
        const h = Math.round(vuLevels[ti] * 36);
        bar.style.height = h + 'px';
        // Color based on level
        if (vuLevels[ti] > 0.85) bar.style.background = '#ff3366';
        else if (vuLevels[ti] > 0.6) bar.style.background = '#ffaa00';
        else bar.style.background = '#39ff14';
      }
      vuLevels[ti] = Math.max(0, vuLevels[ti] - 0.055);
    });
  }
  setInterval(tickVU, 40);

  // ── Presets ───────────────────────────────────────────────
  // Track index: 0=Kick,1=Snare,2=HHC,3=HHO,4=Clap,5=TomLo,6=TomHi,7=Synth,8=Bass,9=Cymbal
  const PRESETS = {
    bos: null,
    trap: [
      [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0], // Kick
      [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0], // Snare
      [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0], // HHC
      [0,0,0,0, 0,0,0,1, 0,0,0,0, 0,0,0,0], // HHO
      [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,1,0], // Clap
      [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0], // TomLo
      [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0], // TomHi
      [1,0,0,0, 0,0,0,0, 0,1,0,0, 0,0,0,0], // Synth
      [1,0,0,1, 0,0,1,0, 1,0,0,0, 0,1,0,0], // Bass
      [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,1], // Cymbal
    ],
    house: [
      [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0], // Kick
      [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0], // Snare
      [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1], // HHC
      [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,1,0], // HHO
      [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,1,0], // Clap
      [0,0,0,0, 0,0,0,0, 0,0,0,1, 0,0,0,0], // TomLo
      [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0], // TomHi
      [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0], // Synth
      [1,0,0,0, 0,1,0,0, 1,0,0,0, 0,1,0,0], // Bass
      [0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0], // Cymbal
    ],
    bossa: [
      [1,0,0,0, 0,0,1,0, 0,0,1,0, 0,0,0,0], // Kick
      [0,0,1,0, 0,0,0,0, 0,1,0,0, 0,0,1,0], // Snare
      [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,1], // HHC
      [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0], // HHO
      [0,0,0,0, 0,1,0,0, 0,0,0,0, 0,1,0,0], // Clap
      [0,1,0,0, 1,0,0,1, 0,1,0,0, 1,0,0,0], // TomLo
      [0,0,0,1, 0,0,0,0, 0,0,0,1, 0,0,0,0], // TomHi
      [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0], // Synth
      [1,0,0,1, 0,0,0,1, 0,0,1,0, 0,0,0,1], // Bass
      [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,1], // Cymbal
    ],
    dnb: [
      [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0], // Kick
      [0,0,0,0, 0,0,1,0, 0,0,0,0, 1,0,0,0], // Snare
      [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1], // HHC
      [0,0,0,0, 0,0,0,0, 0,0,0,1, 0,0,0,0], // HHO
      [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0], // Clap
      [1,0,1,0, 0,0,0,0, 1,0,0,0, 0,0,1,0], // TomLo
      [0,0,0,0, 0,1,0,0, 0,0,0,0, 0,1,0,0], // TomHi
      [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0], // Synth
      [1,0,1,0, 0,0,1,0, 1,0,0,1, 0,0,0,0], // Bass
      [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,1], // Cymbal
    ]
  };

  // ── UI Build ──────────────────────────────────────────────
  function buildUI() {
    // Step number header
    const hdr = document.getElementById('bm2-step-header');
    if (hdr) {
      hdr.innerHTML = '';
      for (let s = 0; s < STEPS; s++) {
        const el = document.createElement('div');
        el.className = 'bm2-step-num' + (s % 4 === 0 ? ' bm2-beat-start' : '');
        el.textContent = s % 4 === 0 ? (s / 4 + 1) : '·';
        hdr.appendChild(el);
      }
    }

    const grid = document.getElementById('bm2-grid');
    if (!grid) return;
    grid.innerHTML = '';

    TRACKS.forEach((track, ti) => {
      const row = document.createElement('div');
      row.className = 'bm2-track';

      // LED
      const led = document.createElement('div');
      led.className = 'bm2-led';
      led.id = 'bm2-led-' + ti;
      led.style.background = '#333';
      row.appendChild(led);

      // Mute
      const mBtn = document.createElement('button');
      mBtn.className = 'bm2-mute';
      mBtn.textContent = 'M';
      mBtn.title = 'Sesi kes';
      mBtn.onclick = () => {
        muted[ti] = !muted[ti];
        mBtn.classList.toggle('active', muted[ti]);
      };
      row.appendChild(mBtn);

      // Track name
      const name = document.createElement('div');
      name.className = 'bm2-track-name';
      name.style.color = track.color;
      name.textContent = track.name;
      row.appendChild(name);

      // Volume slider
      const vol = document.createElement('input');
      vol.type = 'range';
      vol.className = 'bm2-vol';
      vol.min = 0; vol.max = 100; vol.value = 80;
      vol.style.setProperty('--thumb-color', track.color);
      vol.style.cssText += `;--thumb-color:${track.color}`;
      vol.title = 'Ses seviyesi';
      // Custom thumb color via dynamic style tag per track
      const styleId = 'bm2-vol-style-' + ti;
      if (!document.getElementById(styleId)) {
        const st = document.createElement('style');
        st.id = styleId;
        st.textContent = `#bm2-vol-${ti}::-webkit-slider-thumb { background: ${track.color}; box-shadow: 0 0 6px ${track.color}; }`;
        document.head.appendChild(st);
      }
      vol.id = 'bm2-vol-' + ti;
      vol.oninput = () => {
        volumes[ti] = vol.value / 100;
        if (trackGains[ti]) trackGains[ti].gain.value = volumes[ti];
      };
      row.appendChild(vol);

      // Reverb checkbox
      const revLabel = document.createElement('label');
      revLabel.className = 'bm2-rev-label';
      const revCb = document.createElement('input');
      revCb.type = 'checkbox';
      revCb.title = 'Reverb';
      revCb.onchange = () => { revSend[ti] = revCb.checked; };
      revLabel.appendChild(revCb);
      revLabel.appendChild(document.createTextNode('Rev'));
      row.appendChild(revLabel);

      // Step buttons
      for (let s = 0; s < STEPS; s++) {
        const btn = document.createElement('button');
        btn.className = 'bm2-step' + (s % 4 === 0 ? ' bm2-step-beat' : '');
        btn.id = `bm2-step-${ti}-${s}`;
        btn.style.position = 'relative';
        btn.title = `${track.name} – Adım ${s + 1}`;
        btn.onclick = () => {
          pattern[ti][s] = !pattern[ti][s];
          updateStepBtn(ti, s);
          if (pattern[ti][s]) {
            initAudio();
            soundFns[ti](actx.currentTime + 0.01, ti);
          }
        };
        row.appendChild(btn);
      }

      // VU meter
      const vuWrap = document.createElement('div');
      vuWrap.className = 'bm2-vu-wrap';
      const vuBar = document.createElement('div');
      vuBar.className = 'bm2-vu-bar';
      vuBar.id = 'bm2-vu-' + ti;
      vuBar.style.height = '0px';
      vuWrap.appendChild(vuBar);
      row.appendChild(vuWrap);

      grid.appendChild(row);
    });

    refreshAllBtns();
  }

  function updateStepBtn(ti, s, isCurrent) {
    const btn = document.getElementById(`bm2-step-${ti}-${s}`);
    if (!btn) return;
    const track = TRACKS[ti];
    const on = pattern[ti][s];
    if (on) {
      btn.style.background = track.color;
      btn.style.boxShadow = `0 0 10px ${track.color}88, inset 0 0 6px ${track.color}55`;
    } else {
      btn.style.background = '#14141e';
      btn.style.boxShadow = 'none';
    }
  }

  function refreshAllBtns() {
    TRACKS.forEach((_, ti) => {
      for (let s = 0; s < STEPS; s++) updateStepBtn(ti, s);
    });
  }

  // ── Playback ──────────────────────────────────────────────
  let lastHighlighted = -1;

  function highlightStep(step) {
    // Remove previous highlight
    if (lastHighlighted >= 0) {
      TRACKS.forEach((_, ti) => {
        const btn = document.getElementById(`bm2-step-${ti}-${lastHighlighted}`);
        if (btn) {
          btn.classList.remove('bm2-step-current');
        }
      });
    }
    // Add new highlight
    TRACKS.forEach((_, ti) => {
      const btn = document.getElementById(`bm2-step-${ti}-${step}`);
      if (btn) btn.classList.add('bm2-step-current');

      // LED pulse on active tracks
      const led = document.getElementById('bm2-led-' + ti);
      if (led) {
        if (pattern[ti][step] && !muted[ti]) {
          led.style.background = TRACKS[ti].color;
          led.style.boxShadow = `0 0 10px ${TRACKS[ti].color}`;
          setTimeout(() => {
            led.style.background = '#333';
            led.style.boxShadow = 'none';
          }, 120);
        }
      }
    });
    lastHighlighted = step;
  }

  function getStepTime(step) {
    const secondsPerBeat = 60.0 / bpm;
    const secondsPerStep = secondsPerBeat / 4;
    // Swing: delay even steps (1,3,5…) by swingAmount
    const swingAmount = (swing / 100) * secondsPerStep * 0.67;
    return step % 2 === 1 ? swingAmount : 0;
  }

  function scheduleNote(step, time) {
    TRACKS.forEach((_, ti) => {
      if (pattern[ti][step] && !muted[ti]) {
        soundFns[ti](time, ti);
      }
    });
    // Schedule UI update
    const delay = Math.max(0, (time - actx.currentTime) * 1000 - 20);
    setTimeout(() => highlightStep(step), delay);
  }

  function scheduler() {
    const secondsPerBeat = 60.0 / bpm;
    const secondsPerStep = secondsPerBeat / 4;

    while (nextNoteTime < actx.currentTime + 0.12) {
      const swingOffset = getStepTime(currentStep);
      scheduleNote(currentStep, nextNoteTime + swingOffset);
      nextNoteTime += secondsPerStep;
      currentStep = (currentStep + 1) % STEPS;
    }
    schedulerTimer = setTimeout(scheduler, 25);
  }

  function startPlayback() {
    initAudio();
    currentStep = 0;
    nextNoteTime = actx.currentTime + 0.05;
    // Sync track gains
    TRACKS.forEach((_, ti) => {
      if (trackGains[ti]) trackGains[ti].gain.value = volumes[ti];
    });
    scheduler();
    isPlaying = true;
    const btn = document.getElementById('bm2-play-btn');
    if (btn) { btn.textContent = '⏸ DURDUR'; btn.className = 'bm2-btn bm2-btn-stop'; }
  }

  function stopPlayback() {
    clearTimeout(schedulerTimer);
    schedulerTimer = null;
    isPlaying = false;
    // Clear highlights
    if (lastHighlighted >= 0) {
      TRACKS.forEach((_, ti) => {
        const btn = document.getElementById(`bm2-step-${ti}-${lastHighlighted}`);
        if (btn) btn.classList.remove('bm2-step-current');
      });
      lastHighlighted = -1;
    }
    const btn = document.getElementById('bm2-play-btn');
    if (btn) { btn.textContent = '▶ BAŞLAT'; btn.className = 'bm2-btn bm2-btn-play'; }
  }

  // ── Apply Preset ──────────────────────────────────────────
  function applyPreset(key) {
    const data = PRESETS[key];
    if (!data) {
      // Clear
      pattern = TRACKS.map(() => new Array(STEPS).fill(false));
    } else {
      pattern = data.map(row => row.map(v => !!v));
    }
    refreshAllBtns();
  }

  // ── Save / Load ───────────────────────────────────────────
  function savePattern() {
    try {
      const state = {
        pattern: pattern,
        bpm: bpm,
        swing: swing,
        volumes: volumes
      };
      localStorage.setItem('bm2_pattern', JSON.stringify(state));
      showToast('Pattern kaydedildi ✓', '#39ff14');
    } catch (e) { showToast('Kayıt hatası!', '#ff3366'); }
  }

  function loadPattern() {
    try {
      const raw = localStorage.getItem('bm2_pattern');
      if (!raw) { showToast('Kayıtlı pattern yok.', '#ffaa00'); return; }
      const state = JSON.parse(raw);
      if (state.pattern) pattern = state.pattern;
      if (state.bpm) {
        bpm = state.bpm;
        const sl = document.getElementById('bm2-bpm-slider');
        const vl = document.getElementById('bm2-bpm-val');
        if (sl) sl.value = bpm;
        if (vl) vl.textContent = bpm;
      }
      if (state.swing !== undefined) {
        swing = state.swing;
        const sl = document.getElementById('bm2-swing-slider');
        const vl = document.getElementById('bm2-swing-val');
        if (sl) sl.value = swing;
        if (vl) vl.textContent = swing + '%';
      }
      if (state.volumes) {
        volumes = state.volumes;
        TRACKS.forEach((_, ti) => {
          const sl = document.getElementById('bm2-vol-' + ti);
          if (sl) sl.value = Math.round(volumes[ti] * 100);
        });
      }
      refreshAllBtns();
      showToast('Pattern yüklendi ✓', '#39ff14');
    } catch (e) { showToast('Yükleme hatası!', '#ff3366'); }
  }

  function showToast(msg, color) {
    const t = document.createElement('div');
    t.style.cssText = `position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:${color};color:#000;padding:10px 24px;border-radius:30px;font-weight:700;z-index:9999;font-size:0.9rem;pointer-events:none;box-shadow:0 4px 20px ${color}66;transition:opacity 0.5s;`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 500); }, 2000);
  }

  // ── Tap Tempo ────────────────────────────────────────────
  function handleTap() {
    const now = performance.now();
    tapTimes.push(now);
    if (tapTimes.length > 8) tapTimes.shift();
    if (tapTimes.length > 1) {
      const gaps = [];
      for (let i = 1; i < tapTimes.length; i++) gaps.push(tapTimes[i] - tapTimes[i - 1]);
      const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length;
      bpm = Math.round(60000 / avg);
      bpm = Math.max(60, Math.min(200, bpm));
      const sl = document.getElementById('bm2-bpm-slider');
      const vl = document.getElementById('bm2-bpm-val');
      if (sl) sl.value = bpm;
      if (vl) vl.textContent = bpm;
    }
    // Flash the tap button
    const tapBtn = document.getElementById('bm2-tap-btn');
    if (tapBtn) {
      tapBtn.style.transform = 'scale(0.9)';
      setTimeout(() => { tapBtn.style.transform = ''; }, 100);
    }
    // Reset tap times after 2 seconds of inactivity
    clearTimeout(handleTap._resetTimer);
    handleTap._resetTimer = setTimeout(() => { tapTimes = []; }, 2000);
  }

  // ── Wire up controls ──────────────────────────────────────
  function wireControls() {
    const playBtn = document.getElementById('bm2-play-btn');
    if (playBtn) {
      playBtn.onclick = () => {
        if (isPlaying) stopPlayback(); else startPlayback();
      };
    }

    const clearBtn = document.getElementById('bm2-clear-btn');
    if (clearBtn) {
      clearBtn.onclick = () => {
        if (isPlaying) stopPlayback();
        pattern = TRACKS.map(() => new Array(STEPS).fill(false));
        refreshAllBtns();
      };
    }

    const bpmSlider = document.getElementById('bm2-bpm-slider');
    const bpmVal = document.getElementById('bm2-bpm-val');
    if (bpmSlider) {
      bpmSlider.oninput = () => {
        bpm = parseInt(bpmSlider.value);
        if (bpmVal) bpmVal.textContent = bpm;
      };
    }

    const swingSlider = document.getElementById('bm2-swing-slider');
    const swingVal = document.getElementById('bm2-swing-val');
    if (swingSlider) {
      swingSlider.oninput = () => {
        swing = parseInt(swingSlider.value);
        if (swingVal) swingVal.textContent = swing + '%';
      };
    }

    const masterVolSlider = document.getElementById('bm2-master-vol');
    const masterValEl = document.getElementById('bm2-master-val');
    if (masterVolSlider) {
      masterVolSlider.oninput = () => {
        masterVol = parseInt(masterVolSlider.value) / 100;
        if (masterValEl) masterValEl.textContent = masterVolSlider.value;
        if (masterGain) masterGain.gain.value = masterVol;
      };
    }

    const tapBtn = document.getElementById('bm2-tap-btn');
    if (tapBtn) tapBtn.onclick = handleTap;

    const presetSel = document.getElementById('bm2-preset');
    if (presetSel) {
      presetSel.onchange = () => applyPreset(presetSel.value);
    }

    const saveBtn = document.getElementById('bm2-save-btn');
    if (saveBtn) saveBtn.onclick = savePattern;

    const loadBtn = document.getElementById('bm2-load-btn');
    if (loadBtn) loadBtn.onclick = loadPattern;
  }

  // ── Init ──────────────────────────────────────────────────
  buildUI();
  wireControls();

  // Stop playback when navigating away
  document.addEventListener('click', function(e) {
    const backBtn = e.target.closest('.chance-back-btn');
    if (backBtn && isPlaying) stopPlayback();
  });

})(); // end IIFE

} catch (e) {
  console.error('Beat Makinesi V2 error:', e);
}
