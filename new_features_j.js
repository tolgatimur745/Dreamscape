/* ============================================================
   NEW FEATURES J — Süper Güçler Atölyesi (Kısım 1)
   ============================================================ */

const loadScript = (url) => {
  return new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = url;
    s.onload = resolve;
    document.head.appendChild(s);
  });
};

// 1. Yerel Dosya Işınlayıcı (AirDrop Klonu)
try {
  if (!document.getElementById('airdrop-sec')) {
    const html = `
    <section id="airdrop-sec" class="section ds-section" style="display:none;min-height:100vh;background:var(--bg);color:var(--tx);font-family:'Segoe UI',sans-serif;padding-top:60px;">
      <button class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:100;cursor:pointer;background:var(--bg2);border:1px solid #3498db;color:var(--tx);padding:10px 15px;border-radius:8px;font-weight:bold;box-shadow:0 0 10px #3498db;" onclick="if(typeof dsGoToSection==='function') dsGoToSection('hubPage','')">◀ Ana Sayfa</button>
      
      <div style="max-width:800px;margin:0 auto;padding:20px;text-align:center;">
        <h2 style="color:#3498db;margin-bottom:10px;text-shadow:0 0 10px #3498db;">📲 Yerel Dosya Işınlayıcı</h2>
        <p style="color:var(--tx2);margin-bottom:30px;">Kablo yok, internet kotası yok! Telefonundan yandaki QR kodu okut, cihazlar arası anında dosya gönder.</p>
        
        <div style="display:flex;flex-wrap:wrap;gap:20px;justify-content:center;">
          <!-- QR Code Area -->
          <div style="background:var(--card);padding:30px;border-radius:15px;border:1px solid var(--a2);box-shadow:0 10px 30px rgba(0,0,0,0.5);flex:1;min-width:300px;">
            <h3 style="margin-bottom:15px;color:var(--tx);">Bağlantı Bekleniyor...</h3>
            <canvas id="airdrop-qr" style="margin-bottom:15px;border-radius:8px;background:#fff;padding:10px;"></canvas>
            <div id="airdrop-status" style="font-weight:bold;color:#f1c40f;">📱 Lütfen telefonunuzdan kamerayı açıp bu kodu okutun.</div>
          </div>
          
          <!-- File Drop Area -->
          <div style="background:var(--card);padding:30px;border-radius:15px;border:1px solid var(--a2);box-shadow:0 10px 30px rgba(0,0,0,0.5);flex:1;min-width:300px;display:flex;flex-direction:column;justify-content:center;position:relative;" id="airdrop-dropzone">
            <div id="airdrop-overlay" style="position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:10;border-radius:15px;display:flex;align-items:center;justify-content:center;font-weight:bold;color:#ff5252;font-size:18px;">
              Önce Cihaz Bağlayın
            </div>
            
            <input type="file" id="airdrop-file" style="display:none;" onchange="airdropSend(event)">
            <label for="airdrop-file" style="display:inline-block;background:var(--bg2);color:var(--tx);border:2px dashed #3498db;padding:40px 20px;border-radius:15px;cursor:pointer;font-weight:bold;font-size:16px;">
              📁 Gönderilecek Dosyayı Seç<br><br>
              <span style="font-size:12px;color:var(--tx2);font-weight:normal;">veya telefondan gönderilenleri bekle</span>
            </label>
            <div id="airdrop-transfer-log" style="margin-top:15px;max-height:100px;overflow-y:auto;font-size:12px;color:#2ecc71;text-align:left;"></div>
          </div>
        </div>
      </div>
    </section>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    // Receiver UI (Mobile Phone View)
    const receiverHtml = `
    <div id="airdrop-mobile-ui" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:var(--bg);z-index:9999;flex-direction:column;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;">
      <h1 style="color:#3498db;margin-bottom:20px;">📲 Bağlanıldı!</h1>
      <p style="color:var(--tx2);text-align:center;margin-bottom:30px;">Bilgisayarınızla eşleştiniz. Aşağıdan seçtiğiniz her dosya anında bilgisayarınıza ışınlanacaktır.</p>
      
      <input type="file" id="airdrop-mobile-file" style="display:none;" onchange="airdropMobileSend(event)">
      <label for="airdrop-mobile-file" style="background:#3498db;color:#fff;padding:20px 40px;border-radius:30px;font-size:20px;font-weight:bold;box-shadow:0 10px 30px rgba(52,152,219,0.5);cursor:pointer;margin-bottom:20px;">
        ⬆️ Dosya Seç & Gönder
      </label>
      
      <div id="airdrop-mobile-log" style="color:#2ecc71;font-weight:bold;font-size:14px;text-align:center;"></div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', receiverHtml);

    let adPeer = null;
    let adConn = null;

    window.airdropInit = async () => {
      await loadScript('https://unpkg.com/qrcode@1.5.3/build/qrcode.min.js');
      await loadScript('https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js');
      
      // Check if we are the mobile receiver
      const urlParams = new URLSearchParams(window.location.search);
      const targetPeer = urlParams.get('ad_target');
      
      if (targetPeer) {
        document.getElementById('hubPage').style.display = 'none';
        document.getElementById('airdrop-mobile-ui').style.display = 'flex';
        
        const mPeer = new Peer();
        mPeer.on('open', () => {
          document.getElementById('airdrop-mobile-log').textContent = 'Bilgisayara bağlanılıyor...';
          adConn = mPeer.connect(targetPeer, { reliable: true });
          adConn.on('open', () => {
            document.getElementById('airdrop-mobile-log').textContent = '✅ Bilgisayara Bağlanıldı! Dosya seçebilirsiniz.';
          });
          adConn.on('data', airdropHandleData);
        });
        return;
      }

      // Normal PC Mode
      adPeer = new Peer();
      adPeer.on('open', (id) => {
        const link = window.location.origin + window.location.pathname + '?ad_target=' + id;
        QRCode.toCanvas(document.getElementById('airdrop-qr'), link, { width: 200, color: { dark: '#000000', light: '#ffffff' } });
      });

      adPeer.on('connection', (conn) => {
        adConn = conn;
        document.getElementById('airdrop-status').innerHTML = '✅ <span style="color:#2ecc71;">Cihaz Bağlandı!</span>';
        document.getElementById('airdrop-overlay').style.display = 'none';
        
        conn.on('data', airdropHandleData);
        conn.on('close', () => {
          document.getElementById('airdrop-status').innerHTML = '❌ Bağlantı Koptu.';
          document.getElementById('airdrop-overlay').style.display = 'flex';
        });
      });
    };

    window.airdropHandleData = (data) => {
      if(data.type === 'file') {
        const blob = new Blob([data.file]);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.name;
        a.click();
        const log = document.getElementById('airdrop-transfer-log') || document.getElementById('airdrop-mobile-log');
        log.innerHTML += `<div>⬇️ Alındı: ${data.name}</div>`;
      }
    };

    window.airdropSend = (e) => {
      const file = e.target.files[0];
      if(!file || !adConn) return;
      adConn.send({ type: 'file', file: file, name: file.name });
      document.getElementById('airdrop-transfer-log').innerHTML += `<div>⬆️ Gönderildi: ${file.name}</div>`;
    };

    window.airdropMobileSend = (e) => {
      const file = e.target.files[0];
      if(!file || !adConn) return;
      adConn.send({ type: 'file', file: file, name: file.name });
      document.getElementById('airdrop-mobile-log').innerHTML += `<div>⬆️ Gönderildi: ${file.name}</div>`;
    };

    // Auto init if we came from URL params
    if(window.location.search.includes('ad_target=')) {
      setTimeout(airdropInit, 500);
    }
  }
} catch(e) { console.error('AirDrop Error:', e); }

// 2. Müzik Launchpad (Beat Maker)
try {
  if (!document.getElementById('launchpad-sec')) {
    const html = `
    <section id="launchpad-sec" class="section ds-section" style="display:none;min-height:100vh;background:var(--bg);color:var(--tx);font-family:'Segoe UI',sans-serif;padding-top:60px;">
      <button class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:100;cursor:pointer;background:var(--bg2);border:1px solid #1abc9c;color:var(--tx);padding:10px 15px;border-radius:8px;font-weight:bold;box-shadow:0 0 10px #1abc9c;" onclick="if(typeof dsGoToSection==='function') dsGoToSection('hubPage','')">◀ Ana Sayfa</button>
      
      <div style="max-width:600px;margin:0 auto;padding:20px;text-align:center;">
        <h2 style="color:#1abc9c;margin-bottom:10px;text-shadow:0 0 10px #1abc9c;">🎛️ Müzik Launchpad</h2>
        <p style="color:var(--tx2);margin-bottom:30px;">Klavyeni kullanarak (1-4, Q-R, A-F, Z-V) veya tıklayarak kendi elektronik ritimlerini çal.</p>
        
        <div style="background:var(--card);padding:30px;border-radius:20px;box-shadow:0 10px 40px rgba(0,0,0,0.6);display:inline-block;">
          <div id="lp-grid" style="display:grid;grid-template-columns:repeat(4, 1fr);gap:15px;">
            <!-- Buttons generated via JS -->
          </div>
        </div>
      </div>
    </section>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    const lpKeys = [
      { key:'1', color:'#ff7675', inst:'kick' }, { key:'2', color:'#ff7675', inst:'kick2' }, { key:'3', color:'#74b9ff', inst:'snare' }, { key:'4', color:'#74b9ff', inst:'clap' },
      { key:'q', color:'#a29bfe', inst:'hihat' }, { key:'w', color:'#a29bfe', inst:'hihat_open' }, { key:'e', color:'#fd79a8', inst:'tom_hi' }, { key:'r', color:'#fd79a8', inst:'tom_mid' },
      { key:'a', color:'#fd79a8', inst:'tom_lo' }, { key:'s', color:'#55efc4', inst:'synth1' }, { key:'d', color:'#55efc4', inst:'synth2' }, { key:'f', color:'#55efc4', inst:'synth3' },
      { key:'z', color:'#ffeaa7', inst:'bass1' }, { key:'x', color:'#ffeaa7', inst:'bass2' }, { key:'c', color:'#ffeaa7', inst:'bass3' }, { key:'v', color:'#ffeaa7', inst:'bass4' }
    ];

    const grid = document.getElementById('lp-grid');
    const btnMap = {};

    lpKeys.forEach((k, idx) => {
      const btn = document.createElement('div');
      btn.style.cssText = `width:80px;height:80px;background:var(--bg);border:2px solid ${k.color};border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:24px;color:${k.color};cursor:pointer;transition:all 0.1s;box-shadow:inset 0 0 10px rgba(0,0,0,0.5);`;
      btn.textContent = k.key.toUpperCase();
      btn.onmousedown = () => lpPlay(k.inst, btn, k.color);
      btn.onmouseup = () => { btn.style.background = 'var(--bg)'; btn.style.boxShadow = 'inset 0 0 10px rgba(0,0,0,0.5)'; };
      btn.onmouseleave = btn.onmouseup;
      grid.appendChild(btn);
      btnMap[k.key] = { btn, inst: k.inst, color: k.color };
    });

    let lpCtx = null;

    window.addEventListener('keydown', (e) => {
      const sec = document.getElementById('launchpad-sec');
      if(sec && sec.style.display !== 'none' && btnMap[e.key]) {
        if(!e.repeat) lpPlay(btnMap[e.key].inst, btnMap[e.key].btn, btnMap[e.key].color);
      }
    });
    
    window.addEventListener('keyup', (e) => {
      if(btnMap[e.key]) {
        btnMap[e.key].btn.style.background = 'var(--bg)';
        btnMap[e.key].btn.style.boxShadow = 'inset 0 0 10px rgba(0,0,0,0.5)';
      }
    });

    // Synthesize sounds with Web Audio API to avoid external assets
    window.lpPlay = (inst, btn, color) => {
      if(!lpCtx) lpCtx = new (window.AudioContext || window.webkitAudioContext)();
      if(lpCtx.state === 'suspended') lpCtx.resume();
      
      btn.style.background = color;
      btn.style.boxShadow = `0 0 20px ${color}, inset 0 0 20px #fff`;
      btn.style.transform = 'scale(0.95)';
      setTimeout(()=>btn.style.transform = 'scale(1)', 100);

      const t = lpCtx.currentTime;
      const osc = lpCtx.createOscillator();
      const gain = lpCtx.createGain();
      osc.connect(gain);
      gain.connect(lpCtx.destination);

      if(inst.startsWith('kick')) {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.5);
        gain.gain.setValueAtTime(1, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
        osc.start(t); osc.stop(t + 0.5);
      } 
      else if(inst === 'snare' || inst === 'clap') {
        // Simple noise burst
        const bufferSize = lpCtx.sampleRate * 0.2;
        const buffer = lpCtx.createBuffer(1, bufferSize, lpCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = lpCtx.createBufferSource();
        noise.buffer = buffer;
        const noiseFilter = lpCtx.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 1000;
        noise.connect(noiseFilter);
        noiseFilter.connect(gain);
        gain.gain.setValueAtTime(1, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
        noise.start(t);
      }
      else if(inst.startsWith('hihat')) {
        const bufferSize = lpCtx.sampleRate * (inst==='hihat'?0.1:0.3);
        const buffer = lpCtx.createBuffer(1, bufferSize, lpCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = lpCtx.createBufferSource();
        noise.buffer = buffer;
        const noiseFilter = lpCtx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.value = 10000;
        noise.connect(noiseFilter);
        noiseFilter.connect(gain);
        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + (inst==='hihat'?0.1:0.3));
        noise.start(t);
      }
      else if(inst.startsWith('tom')) {
        osc.type = 'sine';
        const f = inst==='tom_hi'?200:inst==='tom_mid'?150:100;
        osc.frequency.setValueAtTime(f, t);
        osc.frequency.exponentialRampToValueAtTime(f*0.2, t + 0.4);
        gain.gain.setValueAtTime(1, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
        osc.start(t); osc.stop(t + 0.4);
      }
      else if(inst.startsWith('synth')) {
        osc.type = 'sawtooth';
        const notes = [440, 554.37, 659.25]; // A, C#, E
        osc.frequency.setValueAtTime(notes[parseInt(inst.replace('synth',''))-1], t);
        const filter = lpCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, t);
        filter.frequency.exponentialRampToValueAtTime(100, t + 0.3);
        osc.disconnect();
        osc.connect(filter);
        filter.connect(gain);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
        osc.start(t); osc.stop(t + 0.3);
      }
      else if(inst.startsWith('bass')) {
        osc.type = 'square';
        const notes = [55, 65.41, 73.42, 82.41];
        osc.frequency.setValueAtTime(notes[parseInt(inst.replace('bass',''))-1], t);
        const filter = lpCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(500, t);
        osc.disconnect();
        osc.connect(filter);
        filter.connect(gain);
        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
        osc.start(t); osc.stop(t + 0.5);
      }
    };
  }
} catch(e) { console.error('Launchpad Error:', e); }

// 3. Retro Emülatör & Telefon Gamepad
try {
  if (!document.getElementById('emulator-sec')) {
    const html = `
    <section id="emulator-sec" class="section ds-section" style="display:none;min-height:100vh;background:#111;color:#fff;font-family:'Courier New',Courier,monospace;padding-top:60px;">
      <button class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:100;cursor:pointer;background:#333;border:2px solid #fff;color:#fff;padding:10px 15px;font-weight:bold;" onclick="if(typeof dsGoToSection==='function') dsGoToSection('hubPage','')">◀ CIKIS</button>
      
      <div style="max-width:800px;margin:0 auto;padding:20px;text-align:center;">
        <h2 style="color:#ff0000;margin-bottom:10px;text-shadow:0 0 10px #ff0000;">NINTENDO (NES) EMULATORU</h2>
        <p style="color:#aaa;margin-bottom:20px;">.nes oyun dosyanizi (Super Mario vb.) asagidaki ekrana surukleyin.</p>
        
        <div id="nes-container" style="background:#000;padding:10px;border:4px solid #555;border-radius:10px;display:inline-block;position:relative;">
          <div id="nes-dropzone" style="position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:10;display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;border:2px dashed #fff;">
            OYUN (.nes) DOSYASINI BURAYA SURUKLE
          </div>
          <canvas id="nes-canvas" width="256" height="240" style="width:512px;height:480px;background:#222;image-rendering:pixelated;"></canvas>
        </div>
        
        <div style="margin-top:30px;padding:20px;background:#222;border:2px solid #444;border-radius:10px;display:flex;align-items:center;justify-content:space-between;text-align:left;">
          <div>
            <h3 style="color:#3498db;margin:0 0 10px 0;">📱 TELEFONU OYUN KOLU YAP</h3>
            <p style="color:#aaa;margin:0;font-size:12px;">Yandaki QR kodu telefonunuzdan okutarak klavyeye ihtiyac duymadan oynayabilirsiniz.</p>
            <div id="gp-status" style="color:#e74c3c;font-weight:bold;margin-top:10px;">Baglanti Bekleniyor...</div>
          </div>
          <canvas id="gp-qr" style="background:#fff;padding:5px;border-radius:5px;"></canvas>
        </div>
      </div>
    </section>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    // Mobile Gamepad UI
    const gpMobileHtml = `
    <div id="gp-mobile-ui" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:#111;z-index:9999;flex-direction:column;align-items:center;justify-content:center;user-select:none;touch-action:none;">
      <div id="gp-m-status" style="position:absolute;top:10px;color:#f1c40f;font-family:monospace;">Baglaniliyor...</div>
      
      <div style="display:flex;width:100%;height:100%;max-width:800px;align-items:center;justify-content:space-between;padding:20px;box-sizing:border-box;">
        <!-- D-PAD -->
        <div style="position:relative;width:150px;height:150px;background:#333;border-radius:50%;">
          <div class="gp-btn" data-key="ArrowUp" style="position:absolute;top:10px;left:50px;width:50px;height:50px;background:#555;border-radius:10px;"></div>
          <div class="gp-btn" data-key="ArrowDown" style="position:absolute;bottom:10px;left:50px;width:50px;height:50px;background:#555;border-radius:10px;"></div>
          <div class="gp-btn" data-key="ArrowLeft" style="position:absolute;top:50px;left:10px;width:50px;height:50px;background:#555;border-radius:10px;"></div>
          <div class="gp-btn" data-key="ArrowRight" style="position:absolute;top:50px;right:10px;width:50px;height:50px;background:#555;border-radius:10px;"></div>
        </div>
        
        <!-- Action Buttons -->
        <div style="display:flex;gap:20px;">
          <div class="gp-btn" data-key="z" style="width:60px;height:60px;background:#e74c3c;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;font-size:24px;box-shadow:0 5px 0 #c0392b;">B</div>
          <div class="gp-btn" data-key="x" style="width:60px;height:60px;background:#e74c3c;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;font-size:24px;box-shadow:0 5px 0 #c0392b;margin-top:-30px;">A</div>
        </div>
      </div>
      
      <div style="position:absolute;bottom:20px;display:flex;gap:20px;">
        <div class="gp-btn" data-key="Shift" style="width:80px;height:30px;background:#555;border-radius:15px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;">SELECT</div>
        <div class="gp-btn" data-key="Enter" style="width:80px;height:30px;background:#555;border-radius:15px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;">START</div>
      </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', gpMobileHtml);

    let gpPeer = null;
    let gpConn = null;

    window.emulatorInit = async () => {
      await loadScript('https://unpkg.com/qrcode@1.5.3/build/qrcode.min.js');
      await loadScript('https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js');
      
      const urlParams = new URLSearchParams(window.location.search);
      const targetGp = urlParams.get('gp_target');
      
      if (targetGp) {
        document.getElementById('hubPage').style.display = 'none';
        document.getElementById('gp-mobile-ui').style.display = 'flex';
        document.documentElement.requestFullscreen().catch(()=>{});
        
        const mPeer = new Peer();
        mPeer.on('open', () => {
          gpConn = mPeer.connect(targetGp, { reliable: true });
          gpConn.on('open', () => {
            document.getElementById('gp-m-status').textContent = 'BAGLANDI!';
            document.getElementById('gp-m-status').style.color = '#2ecc71';
            
            // Setup mobile touch events
            document.querySelectorAll('.gp-btn').forEach(btn => {
              btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                btn.style.opacity = '0.5';
                gpConn.send({ key: btn.dataset.key, state: 'down' });
              });
              btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                btn.style.opacity = '1';
                gpConn.send({ key: btn.dataset.key, state: 'up' });
              });
            });
          });
        });
        return;
      }

      // PC Mode Gamepad Init
      gpPeer = new Peer();
      gpPeer.on('open', (id) => {
        const link = window.location.origin + window.location.pathname + '?gp_target=' + id;
        QRCode.toCanvas(document.getElementById('gp-qr'), link, { width: 100, margin: 1 });
      });

      gpPeer.on('connection', (conn) => {
        document.getElementById('gp-status').textContent = '✅ TELEFON BAGLANDI!';
        document.getElementById('gp-status').style.color = '#2ecc71';
        conn.on('data', (data) => {
          // Dispatch keyboard events so emulator catches them
          const ev = new KeyboardEvent(data.state === 'down' ? 'keydown' : 'keyup', { key: data.key });
          document.dispatchEvent(ev);
        });
      });
      
      // Setup Drag and Drop for ROM
      const dz = document.getElementById('nes-dropzone');
      dz.ondragover = (e) => { e.preventDefault(); dz.style.background = 'rgba(52,152,219,0.8)'; };
      dz.ondragleave = (e) => { e.preventDefault(); dz.style.background = 'rgba(0,0,0,0.8)'; };
      dz.ondrop = async (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if(!file) return;
        dz.textContent = 'YUKLENIYOR... (Gereksinimler Indiriliyor)';
        
        await loadScript('https://unpkg.com/jsnes/dist/jsnes.min.js');
        
        dz.style.display = 'none';
        const canvas = document.getElementById('nes-canvas');
        const ctx = canvas.getContext('2d', { alpha: false });
        const imgData = ctx.createImageData(256, 240);
        
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        const nes = new jsnes.NES({
          onFrame: (frameBuffer) => {
            for (let i = 0; i < 256 * 240; i++) {
              imgData.data[i*4]   = frameBuffer[i] & 0xFF;
              imgData.data[i*4+1] = (frameBuffer[i] >> 8) & 0xFF;
              imgData.data[i*4+2] = (frameBuffer[i] >> 16) & 0xFF;
              imgData.data[i*4+3] = 255;
            }
            ctx.putImageData(imgData, 0, 0);
          },
          onAudioSample: (left, right) => {
            // Simplified audio hook (real implementation needs buffering)
          }
        });
        
        const reader = new FileReader();
        reader.onload = (e) => {
          const binary = e.target.result;
          nes.loadROM(binary);
          
          const loop = () => {
            nes.frame();
            requestAnimationFrame(loop);
          };
          loop();
        };
        reader.readAsBinaryString(file);
        
        const keyMap = { 'ArrowUp': jsnes.Controller.BUTTON_UP, 'ArrowDown': jsnes.Controller.BUTTON_DOWN, 'ArrowLeft': jsnes.Controller.BUTTON_LEFT, 'ArrowRight': jsnes.Controller.BUTTON_RIGHT, 'x': jsnes.Controller.BUTTON_A, 'z': jsnes.Controller.BUTTON_B, 'Shift': jsnes.Controller.BUTTON_SELECT, 'Enter': jsnes.Controller.BUTTON_START };
        document.addEventListener('keydown', (e) => { if(keyMap[e.key] !== undefined) nes.buttonDown(1, keyMap[e.key]); });
        document.addEventListener('keyup', (e) => { if(keyMap[e.key] !== undefined) nes.buttonUp(1, keyMap[e.key]); });
      };
    };
    
    // Auto init
    if(window.location.search.includes('gp_target=')) {
      setTimeout(emulatorInit, 500);
    }
  }
} catch(e) { console.error('Emulator Error:', e); }
