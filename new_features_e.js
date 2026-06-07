/* ============================================================
   NEW FEATURES E — Leisure Hub (Screen & Broadcaster Tools)
   ============================================================ */

// 1. Monitör Işığı / Softbox
try {
  if (!document.getElementById('softbox-sec')) {
    const html = `
    <section id="softbox-sec" class="section ds-section" style="display:none;min-height:100vh;background:#fff;position:relative;font-family:'Segoe UI',sans-serif;overflow:hidden;transition:background 0.3s;">
      <div id="softbox-ring" style="display:none;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:70vh;height:70vh;border-radius:50%;border:10vh solid #fff;box-shadow:0 0 50px rgba(255,255,255,0.5), inset 0 0 50px rgba(255,255,255,0.5);"></div>
      <div id="softbox-overlay" style="position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0);pointer-events:none;"></div>
      
      <div id="softbox-ui" style="position:absolute;bottom:40px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.7);backdrop-filter:blur(10px);padding:20px 30px;border-radius:20px;display:flex;flex-direction:column;gap:15px;transition:opacity 0.5s;border:1px solid rgba(255,255,255,0.2);">
        <button class="chance-back-btn" style="position:absolute;top:-50px;left:0;z-index:100;cursor:pointer;background:rgba(0,0,0,0.7);border:1px solid rgba(255,255,255,0.2);color:#fff;padding:8px 16px;border-radius:8px;font-size:14px;" onclick="if(typeof dsGoToSection==='function') { if(document.fullscreenElement) document.exitFullscreen(); dsGoToSection('hubPage',''); }">◀ Ana Sayfa</button>
        
        <div style="display:flex;gap:10px;justify-content:center;">
          <button onclick="sbSetColor('#ffffff')" style="width:40px;height:40px;border-radius:50%;border:2px solid #ccc;background:#ffffff;cursor:pointer;" title="Saf Beyaz"></button>
          <button onclick="sbSetColor('#ffeedd')" style="width:40px;height:40px;border-radius:50%;border:2px solid #ccc;background:#ffeedd;cursor:pointer;" title="Günışığı"></button>
          <button onclick="sbSetColor('#ff0000')" style="width:40px;height:40px;border-radius:50%;border:2px solid #ccc;background:#ff0000;cursor:pointer;" title="Kırmızı"></button>
          <button onclick="sbSetColor('#00ff00')" style="width:40px;height:40px;border-radius:50%;border:2px solid #ccc;background:#00ff00;cursor:pointer;" title="Yeşil"></button>
          <button onclick="sbSetColor('#0000ff')" style="width:40px;height:40px;border-radius:50%;border:2px solid #ccc;background:#0000ff;cursor:pointer;" title="Mavi"></button>
          <input type="color" id="sb-color-picker" onchange="sbSetColor(this.value)" style="width:40px;height:40px;border:none;border-radius:50%;cursor:pointer;padding:0;background:none;">
        </div>
        
        <div style="display:flex;align-items:center;gap:10px;color:#fff;font-size:14px;">
          <span>Parlaklık:</span>
          <input type="range" id="sb-brightness" min="0" max="100" value="100" style="flex:1;" oninput="sbUpdateBrightness()">
        </div>
        
        <div style="display:flex;gap:10px;justify-content:center;">
          <button id="sb-ring-btn" onclick="sbToggleRing()" style="background:#222;color:#fff;border:1px solid #555;padding:8px 16px;border-radius:8px;cursor:pointer;font-weight:bold;">⭕ Ring Light</button>
          <button onclick="sbToggleFS()" style="background:#00bcd4;color:#000;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-weight:bold;">⛶ Tam Ekran</button>
        </div>
        <div style="text-align:center;color:#aaa;font-size:11px;margin-top:5px;">Arayüzü gizlemek için fareyi hareket ettirmeyin.</div>
      </div>
    </section>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    let sbTimeout;
    const sbSec = document.getElementById('softbox-sec');
    const sbUI = document.getElementById('softbox-ui');
    const sbOverlay = document.getElementById('softbox-overlay');
    const sbRing = document.getElementById('softbox-ring');
    let sbIsRing = false;
    let sbBgColor = '#ffffff';

    sbSec.addEventListener('mousemove', () => {
      sbUI.style.opacity = '1';
      clearTimeout(sbTimeout);
      sbTimeout = setTimeout(() => { sbUI.style.opacity = '0'; }, 3000);
    });

    window.sbSetColor = (col) => {
      sbBgColor = col;
      if (!sbIsRing) {
        sbSec.style.background = col;
      } else {
        sbRing.style.borderColor = col;
        sbRing.style.boxShadow = `0 0 50px ${col}88, inset 0 0 50px ${col}88`;
      }
    };

    window.sbUpdateBrightness = () => {
      const val = document.getElementById('sb-brightness').value;
      sbOverlay.style.background = `rgba(0,0,0,${1 - (val/100)})`;
    };

    window.sbToggleRing = () => {
      sbIsRing = !sbIsRing;
      const btn = document.getElementById('sb-ring-btn');
      if (sbIsRing) {
        btn.style.background = '#4caf50';
        sbSec.style.background = '#000000';
        sbRing.style.display = 'block';
        sbSetColor(sbBgColor);
      } else {
        btn.style.background = '#222';
        sbRing.style.display = 'none';
        sbSec.style.background = sbBgColor;
      }
    };

    window.sbToggleFS = () => {
      if (!document.fullscreenElement) {
        sbSec.requestFullscreen().catch(err => {});
      } else {
        document.exitFullscreen();
      }
    };
  }
} catch(e) { console.error('Softbox error:', e); }

// 2. Teleprompter
try {
  if (!document.getElementById('teleprompter-sec')) {
    const html = `
    <section id="teleprompter-sec" class="section ds-section" style="display:none;min-height:100vh;background:#111;position:relative;font-family:sans-serif;color:#fff;overflow:hidden;">
      <div id="tp-content" style="position:absolute;top:100%;left:10%;width:80%;font-size:60px;font-weight:bold;line-height:1.4;text-align:center;transform:scaleX(1);color:#fff;text-shadow:2px 2px 0 #000;">
        <span style="color:#666;font-size:30px;">[Metin buraya gelecek]</span>
      </div>
      <div id="tp-center-line" style="position:absolute;top:50%;left:5%;width:90%;height:2px;background:rgba(255,0,0,0.5);pointer-events:none;display:none;"></div>
      
      <div id="tp-ui" style="position:absolute;top:20px;left:50%;transform:translateX(-50%);background:var(--card);padding:20px;border-radius:16px;border:1px solid var(--a2);box-shadow:0 0 20px rgba(0,0,0,0.5);width:90%;max-width:800px;z-index:50;transition:transform 0.4s;">
        <button class="chance-back-btn" style="position:absolute;top:15px;left:15px;cursor:pointer;background:rgba(255,255,255,0.1);border:none;color:#fff;padding:8px 16px;border-radius:8px;font-size:14px;" onclick="if(typeof dsGoToSection==='function') { if(document.fullscreenElement) document.exitFullscreen(); tpPause(); dsGoToSection('hubPage',''); }">◀ Ana Sayfa</button>
        <h2 style="text-align:center;color:var(--a2);margin:0 0 15px;">📜 Teleprompter</h2>
        
        <textarea id="tp-text-input" placeholder="Okumak istediğiniz metni buraya yapıştırın..." style="width:100%;height:150px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);color:#fff;padding:10px;border-radius:8px;font-size:16px;resize:vertical;box-sizing:border-box;margin-bottom:15px;"></textarea>
        
        <div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap;justify-content:space-between;">
          <div style="display:flex;gap:15px;align-items:center;">
            <div>
              <label style="font-size:12px;color:var(--tx2);display:block;">Boyut:</label>
              <input type="range" id="tp-size" min="30" max="150" value="60" oninput="tpUpdateStyles()">
            </div>
            <div>
              <label style="font-size:12px;color:var(--tx2);display:block;">Hız:</label>
              <input type="range" id="tp-speed" min="1" max="10" value="3" oninput="tpUpdateStyles()">
            </div>
          </div>
          
          <div style="display:flex;gap:10px;">
            <button onclick="tpToggleMirror()" style="background:#333;color:#fff;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-weight:bold;">🪞 Aynala</button>
            <button onclick="tpToggleFS()" style="background:#555;color:#fff;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-weight:bold;">⛶ Tam Ekran</button>
            <button id="tp-play-btn" onclick="tpPlay()" style="background:var(--a2);color:#000;border:none;padding:10px 30px;border-radius:8px;cursor:pointer;font-weight:bold;font-size:16px;">▶ BAŞLAT</button>
          </div>
        </div>
      </div>
      <div id="tp-play-overlay" onclick="tpPause()" style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:40;display:none;cursor:pointer;"></div>
    </section>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    let tpPlaying = false;
    let tpY = 0;
    let tpRAF = null;
    let tpSpeed = 3;

    window.tpUpdateStyles = () => {
      const size = document.getElementById('tp-size').value;
      tpSpeed = parseFloat(document.getElementById('tp-speed').value);
      document.getElementById('tp-content').style.fontSize = size + 'px';
      
      const inp = document.getElementById('tp-text-input').value.trim();
      if(inp) {
        document.getElementById('tp-content').innerHTML = inp.replace(/\\n/g, '<br>');
      }
    };

    window.tpToggleMirror = () => {
      const c = document.getElementById('tp-content');
      if (c.style.transform === 'scaleX(1)') {
        c.style.transform = 'scaleX(-1)';
      } else {
        c.style.transform = 'scaleX(1)';
      }
    };

    window.tpToggleFS = () => {
      const sec = document.getElementById('teleprompter-sec');
      if (!document.fullscreenElement) {
        sec.requestFullscreen().catch(()=>{});
      } else {
        document.exitFullscreen();
      }
    };

    window.tpPlay = () => {
      tpUpdateStyles();
      document.getElementById('tp-ui').style.transform = 'translateX(-50%) translateY(-150%)';
      document.getElementById('tp-play-overlay').style.display = 'block';
      document.getElementById('tp-center-line').style.display = 'block';
      
      const content = document.getElementById('tp-content');
      tpY = window.innerHeight;
      tpPlaying = true;
      
      const loop = () => {
        if (!tpPlaying) return;
        tpY -= tpSpeed;
        content.style.top = tpY + 'px';
        
        // Stop if done
        if (tpY < -content.getBoundingClientRect().height) {
          tpPause();
        } else {
          tpRAF = requestAnimationFrame(loop);
        }
      };
      loop();
    };

    window.tpPause = () => {
      tpPlaying = false;
      cancelAnimationFrame(tpRAF);
      document.getElementById('tp-ui').style.transform = 'translateX(-50%) translateY(0)';
      document.getElementById('tp-play-overlay').style.display = 'none';
      document.getElementById('tp-center-line').style.display = 'none';
    };
  }
} catch(e) { console.error('Teleprompter error:', e); }

// 3. Ölü Piksel Testi
try {
  if (!document.getElementById('pixel-test-sec')) {
    const html = `
    <section id="pixel-test-sec" class="section ds-section" style="display:none;height:100vh;background:#000;position:relative;cursor:pointer;overflow:hidden;user-select:none;" onclick="ptNextColor()">
      <div id="pt-msg" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;background:rgba(0,0,0,0.7);padding:20px;border-radius:10px;text-align:center;pointer-events:none;transition:opacity 0.5s;">
        <h2 style="margin:0 0 10px;">🔍 Ölü Piksel Testi</h2>
        <p style="margin:0;">Rengi değiştirmek için ekrana tıklayın.</p>
        <div style="margin-top:15px;font-size:12px;color:#aaa;">(Tam ekran için aşağıdaki butonu kullanın)</div>
      </div>
      <div id="pt-ui" style="position:absolute;bottom:30px;left:50%;transform:translateX(-50%);display:flex;gap:10px;background:rgba(0,0,0,0.5);padding:10px 20px;border-radius:15px;backdrop-filter:blur(5px);transition:opacity 0.5s;" onclick="event.stopPropagation()">
        <button class="chance-back-btn" style="cursor:pointer;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff;padding:8px 16px;border-radius:8px;font-size:14px;" onclick="if(typeof dsGoToSection==='function') { if(document.fullscreenElement) document.exitFullscreen(); dsGoToSection('hubPage',''); }">◀ Ana Sayfa</button>
        <button onclick="if(!document.fullscreenElement) document.getElementById('pixel-test-sec').requestFullscreen().catch(()=>{});" style="background:#333;color:#fff;border:1px solid #555;padding:8px 16px;border-radius:8px;cursor:pointer;font-weight:bold;">⛶ Tam Ekran</button>
      </div>
    </section>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    const ptColors = ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff'];
    let ptIndex = 0;
    let ptTimeout;

    const ptSec = document.getElementById('pixel-test-sec');
    const ptUI = document.getElementById('pt-ui');
    const ptMsg = document.getElementById('pt-msg');

    ptSec.addEventListener('mousemove', () => {
      ptUI.style.opacity = '1';
      document.body.style.cursor = 'pointer';
      clearTimeout(ptTimeout);
      ptTimeout = setTimeout(() => { 
        ptUI.style.opacity = '0'; 
        document.body.style.cursor = 'none';
      }, 3000);
    });

    window.ptNextColor = () => {
      ptIndex = (ptIndex + 1) % ptColors.length;
      ptSec.style.background = ptColors[ptIndex];
      ptMsg.style.opacity = '0';
    };
    
    // Auto-reset when entering section
    const observer = new MutationObserver((muts) => {
      muts.forEach(m => {
        if (m.attributeName === 'style' && document.getElementById('pixel-test-sec').style.display !== 'none') {
          ptIndex = 0;
          document.getElementById('pixel-test-sec').style.background = ptColors[0];
          document.getElementById('pt-msg').style.opacity = '1';
        }
      });
    });
    observer.observe(document.getElementById('pixel-test-sec'), { attributes: true });
  }
} catch(e) { console.error('Pixel Test error:', e); }

// 4. Ekran Koruyucular (Matrix & VHS)
try {
  if (!document.getElementById('screensaver-sec')) {
    const html = `
    <section id="screensaver-sec" class="section ds-section" style="display:none;min-height:100vh;background:#000;position:relative;overflow:hidden;font-family:sans-serif;">
      <button id="ss-back-btn" class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:100;cursor:pointer;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff;padding:8px 16px;border-radius:8px;font-size:14px;transition:opacity 0.3s;" onclick="if(typeof dsGoToSection==='function') { ssStop(); if(document.fullscreenElement) document.exitFullscreen(); dsGoToSection('hubPage',''); }">◀ Ana Sayfa</button>
      
      <div id="ss-ui" style="position:absolute;bottom:30px;left:50%;transform:translateX(-50%);display:flex;gap:15px;z-index:100;background:rgba(0,0,0,0.5);padding:15px;border-radius:15px;backdrop-filter:blur(5px);transition:opacity 0.5s;">
        <button onclick="ssSetMode('matrix')" style="background:#0f0;color:#000;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-weight:bold;font-family:monospace;">101 MATRIX</button>
        <button onclick="ssSetMode('vhs')" style="background:#ff00ff;color:#fff;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-weight:bold;">📺 SİNYAL YOK</button>
        <button onclick="if(!document.fullscreenElement) document.getElementById('screensaver-sec').requestFullscreen().catch(()=>{});" style="background:#333;color:#fff;border:1px solid #555;padding:10px 20px;border-radius:8px;cursor:pointer;font-weight:bold;">⛶ Tam Ekran</button>
      </div>

      <canvas id="ss-canvas" style="display:block;position:absolute;top:0;left:0;width:100%;height:100%;"></canvas>
    </section>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    const canvas = document.getElementById('ss-canvas');
    const ctx = canvas.getContext('2d');
    let ssMode = 'matrix';
    let ssRAF = null;
    let ssTimeout;
    let ssRunning = false;

    const sec = document.getElementById('screensaver-sec');
    const ui = document.getElementById('ss-ui');
    const backBtn = document.getElementById('ss-back-btn');

    sec.addEventListener('mousemove', () => {
      ui.style.opacity = '1';
      backBtn.style.opacity = '1';
      document.body.style.cursor = 'default';
      clearTimeout(ssTimeout);
      ssTimeout = setTimeout(() => { 
        ui.style.opacity = '0'; 
        backBtn.style.opacity = '0'; 
        document.body.style.cursor = 'none';
      }, 3000);
    });

    // Matrix Vars
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*'.split('');
    const fontSize = 16;
    let columns = [];
    let drops = [];

    // VHS Vars
    let vhsX = 50, vhsY = 50, vhsVX = 2, vhsVY = 2;
    let vhsColor = '#ff0000';
    const vhsColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columns = canvas.width / fontSize;
      drops = [];
      for(let x=0; x<columns; x++) drops[x] = 1;
    };
    window.addEventListener('resize', resize);

    const drawMatrix = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0F0';
      ctx.font = fontSize + 'px monospace';
      
      for(let i=0; i<drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if(drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const drawVHS = () => {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const tw = 240, th = 80;
      vhsX += vhsVX;
      vhsY += vhsVY;
      
      if(vhsX <= 0 || vhsX + tw >= canvas.width) {
        vhsVX *= -1;
        vhsColor = vhsColors[Math.floor(Math.random() * vhsColors.length)];
      }
      if(vhsY <= 0 || vhsY + th >= canvas.height) {
        vhsVY *= -1;
        vhsColor = vhsColors[Math.floor(Math.random() * vhsColors.length)];
      }
      
      ctx.strokeStyle = vhsColor;
      ctx.lineWidth = 4;
      ctx.strokeRect(vhsX, vhsY, tw, th);
      
      ctx.fillStyle = vhsColor;
      ctx.font = 'bold 30px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('NO SIGNAL', vhsX + tw/2, vhsY + th/2);
    };

    const ssLoop = () => {
      if(!ssRunning) return;
      if(ssMode === 'matrix') drawMatrix();
      else drawVHS();
      ssRAF = requestAnimationFrame(ssLoop);
    };

    window.ssSetMode = (mode) => {
      ssMode = mode;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    window.ssStop = () => {
      ssRunning = false;
      cancelAnimationFrame(ssRAF);
    };

    const ssObserver = new MutationObserver((muts) => {
      muts.forEach(m => {
        if(m.attributeName === 'style') {
          if(sec.style.display !== 'none') {
            resize();
            ssRunning = true;
            ssLoop();
          } else {
            ssRunning = false;
          }
        }
      });
    });
    ssObserver.observe(sec, { attributes: true });
  }
} catch(e) { console.error('Screensaver error:', e); }

// 5. Minimal Masa Saati
try {
  if (!document.getElementById('deskclock-sec')) {
    const html = `
    <section id="deskclock-sec" class="section ds-section" style="display:none;height:100vh;background:#050505;position:relative;overflow:hidden;font-family:'Segoe UI',sans-serif;transition:background 0.5s;">
      <div style="display:flex;align-items:center;justify-content:center;height:100%;width:100%;">
        <button class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:100;cursor:pointer;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff;padding:8px 16px;border-radius:8px;font-size:14px;transition:opacity 0.3s;" id="dc-back-btn" onclick="if(typeof dsGoToSection==='function') { if(document.fullscreenElement) document.exitFullscreen(); dsGoToSection('hubPage',''); }">◀ Ana Sayfa</button>
        
        <div id="dc-clock-container" style="text-align:center;transition:transform 0.3s;">
          <div id="dc-time" style="font-size:18vw;font-weight:900;color:var(--a1);line-height:1;text-shadow:0 0 40px var(--a1);letter-spacing:5px;">00:00</div>
          <div id="dc-sec" style="font-size:5vw;color:var(--tx2);margin-top:-20px;letter-spacing:10px;">00</div>
          <div id="dc-date" style="font-size:2vw;color:var(--tx2);margin-top:20px;text-transform:uppercase;letter-spacing:3px;">1 OCAK PAZARTESİ</div>
        </div>

        <div id="dc-pomo-container" style="display:none;text-align:center;">
          <div id="dc-pomo-time" style="font-size:18vw;font-weight:900;color:#ff5252;line-height:1;text-shadow:0 0 40px #ff5252;letter-spacing:5px;">25:00</div>
          <div style="font-size:2vw;color:#ffaaaa;margin-top:20px;letter-spacing:3px;">POMODORO ODAK MODU</div>
          <div style="margin-top:30px;">
            <button onclick="dcPomoStart()" style="background:#ff5252;color:#fff;border:none;padding:10px 30px;font-size:1.5vw;border-radius:30px;cursor:pointer;font-weight:bold;margin:0 10px;">Başlat</button>
            <button onclick="dcPomoReset()" style="background:#333;color:#fff;border:none;padding:10px 30px;font-size:1.5vw;border-radius:30px;cursor:pointer;font-weight:bold;margin:0 10px;">Sıfırla</button>
          </div>
        </div>

        <div id="dc-ui" style="position:absolute;bottom:30px;display:flex;gap:15px;background:rgba(255,255,255,0.05);padding:10px 20px;border-radius:20px;backdrop-filter:blur(5px);transition:opacity 0.5s;">
          <button onclick="dcSetTheme('neon')" style="background:none;border:none;color:var(--a1);cursor:pointer;font-weight:bold;">✨ Neon</button>
          <button onclick="dcSetTheme('minimal')" style="background:none;border:none;color:#fff;cursor:pointer;font-weight:bold;">⚪ Minimal</button>
          <div style="width:1px;background:rgba(255,255,255,0.2);margin:0 10px;"></div>
          <button onclick="dcToggleMode()" id="dc-mode-btn" style="background:none;border:none;color:#ff5252;cursor:pointer;font-weight:bold;">🍅 Pomodoro</button>
          <button onclick="if(!document.fullscreenElement) document.getElementById('deskclock-sec').requestFullscreen().catch(()=>{});" style="background:none;border:none;color:#aaa;cursor:pointer;font-weight:bold;">⛶</button>
        </div>
      </div>
    </section>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    const sec = document.getElementById('deskclock-sec');
    const timeEl = document.getElementById('dc-time');
    const secEl = document.getElementById('dc-sec');
    const dateEl = document.getElementById('dc-date');
    const ui = document.getElementById('dc-ui');
    const backBtn = document.getElementById('dc-back-btn');
    
    let dcTimer = null;
    let dcIsPomo = false;
    let dcPomoTime = 25 * 60;
    let dcPomoActive = false;
    let dcPomoInt = null;

    sec.addEventListener('mousemove', () => {
      ui.style.opacity = '1';
      backBtn.style.opacity = '1';
      document.body.style.cursor = 'default';
      clearTimeout(dcTimer);
      dcTimer = setTimeout(() => { 
        ui.style.opacity = '0'; 
        backBtn.style.opacity = '0'; 
        document.body.style.cursor = 'none';
      }, 3000);
    });

    const updateClock = () => {
      if(dcIsPomo) return;
      const now = new Date();
      timeEl.textContent = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
      secEl.textContent = String(now.getSeconds()).padStart(2,'0');
      
      const days = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];
      const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
      dateEl.textContent = `${now.getDate()} ${months[now.getMonth()]} ${days[now.getDay()]}`;
    };

    setInterval(updateClock, 1000);

    window.dcSetTheme = (theme) => {
      if(theme === 'neon') {
        sec.style.background = '#050505';
        timeEl.style.color = 'var(--a1)';
        timeEl.style.textShadow = '0 0 40px var(--a1)';
      } else {
        sec.style.background = '#000000';
        timeEl.style.color = '#ffffff';
        timeEl.style.textShadow = 'none';
      }
    };

    window.dcToggleMode = () => {
      dcIsPomo = !dcIsPomo;
      const c1 = document.getElementById('dc-clock-container');
      const c2 = document.getElementById('dc-pomo-container');
      const btn = document.getElementById('dc-mode-btn');
      
      if(dcIsPomo) {
        c1.style.display = 'none';
        c2.style.display = 'block';
        btn.textContent = '🕒 Saat';
        btn.style.color = 'var(--a1)';
        dcUpdatePomoDisplay();
      } else {
        c1.style.display = 'block';
        c2.style.display = 'none';
        btn.textContent = '🍅 Pomodoro';
        btn.style.color = '#ff5252';
        updateClock();
      }
    };

    const dcUpdatePomoDisplay = () => {
      const el = document.getElementById('dc-pomo-time');
      const m = Math.floor(dcPomoTime / 60);
      const s = dcPomoTime % 60;
      el.textContent = String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
    };

    window.dcPomoStart = () => {
      if(dcPomoActive) {
        dcPomoActive = false;
        clearInterval(dcPomoInt);
      } else {
        dcPomoActive = true;
        dcPomoInt = setInterval(() => {
          if(dcPomoTime > 0) {
            dcPomoTime--;
            dcUpdatePomoDisplay();
          } else {
            clearInterval(dcPomoInt);
            dcPomoActive = false;
            // Play a ding sound
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            osc.connect(ctx.destination);
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.start();
            osc.stop(ctx.currentTime + 0.5);
          }
        }, 1000);
      }
    };

    window.dcPomoReset = () => {
      dcPomoActive = false;
      clearInterval(dcPomoInt);
      dcPomoTime = 25 * 60;
      dcUpdatePomoDisplay();
    };

  }
} catch(e) { console.error('Desk Clock error:', e); }

