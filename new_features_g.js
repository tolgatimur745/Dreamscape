/* ============================================================
   NEW FEATURES G — Advanced Utilities
   ============================================================ */

// 1. JSON & Kod Güzelleştirici
try {
  if (!document.getElementById('json-formatter-sec')) {
    const html = `
    <section id="json-formatter-sec" class="section ds-section" style="display:none;min-height:100vh;background:var(--bg);color:var(--tx);font-family:'Segoe UI',sans-serif;padding-top:60px;">
      <button class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:100;cursor:pointer;background:var(--bg2);border:1px solid #f39c12;color:var(--tx);padding:10px 15px;border-radius:8px;font-weight:bold;box-shadow:0 0 10px #f39c12;" onclick="if(typeof dsGoToSection==='function') dsGoToSection('hubPage','')">◀ Ana Sayfa</button>
      
      <div style="max-width:900px;margin:0 auto;padding:20px;">
        <h2 style="color:#f39c12;text-align:center;margin-bottom:20px;text-shadow:0 0 10px #f39c12;">{ } JSON Güzelleştirici</h2>
        
        <div style="display:flex;flex-wrap:wrap;gap:20px;margin-bottom:20px;">
          <div style="flex:1;min-width:300px;">
            <div style="font-weight:bold;margin-bottom:10px;color:var(--tx2);">Ham JSON / Veri:</div>
            <textarea id="json-input" style="width:100%;height:400px;background:var(--card);color:var(--tx);border:1px solid #f39c12;border-radius:12px;padding:15px;font-family:monospace;font-size:14px;resize:vertical;" placeholder='{"ad":"Ali", "yas":30}'></textarea>
          </div>
          
          <div style="flex:1;min-width:300px;">
            <div style="font-weight:bold;margin-bottom:10px;color:var(--tx2);">Formatlanmış Sonuç:</div>
            <textarea id="json-output" readonly style="width:100%;height:400px;background:#050505;color:#f1c40f;border:1px solid var(--a2);border-radius:12px;padding:15px;font-family:monospace;font-size:14px;resize:vertical;"></textarea>
          </div>
        </div>
        
        <div style="text-align:center;gap:15px;display:flex;justify-content:center;flex-wrap:wrap;">
          <button onclick="jfFormat()" style="background:#f39c12;color:#000;border:none;padding:10px 30px;border-radius:8px;font-weight:bold;cursor:pointer;font-size:16px;">Güzelleştir (Formatla)</button>
          <button onclick="jfMinify()" style="background:var(--bg2);color:var(--tx);border:1px solid #f39c12;padding:10px 30px;border-radius:8px;font-weight:bold;cursor:pointer;font-size:16px;">Sıkıştır (Minify)</button>
          <button onclick="jfCopy()" style="background:var(--a3);color:#fff;border:none;padding:10px 30px;border-radius:8px;font-weight:bold;cursor:pointer;font-size:16px;">Kopyala</button>
        </div>
        
        <div id="jf-error" style="color:#ff5252;text-align:center;margin-top:20px;font-weight:bold;"></div>
      </div>
    </section>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    window.jfFormat = () => {
      const err = document.getElementById('jf-error');
      const inp = document.getElementById('json-input').value.trim();
      if(!inp) return;
      try {
        const obj = JSON.parse(inp);
        document.getElementById('json-output').value = JSON.stringify(obj, null, 4);
        err.textContent = '';
      } catch(e) {
        err.textContent = 'HATA: Geçersiz JSON formatı. ' + e.message;
      }
    };
    
    window.jfMinify = () => {
      const err = document.getElementById('jf-error');
      const inp = document.getElementById('json-input').value.trim();
      if(!inp) return;
      try {
        const obj = JSON.parse(inp);
        document.getElementById('json-output').value = JSON.stringify(obj);
        err.textContent = '';
      } catch(e) {
        err.textContent = 'HATA: Geçersiz JSON formatı. ' + e.message;
      }
    };
    
    window.jfCopy = () => {
      const out = document.getElementById('json-output');
      out.select();
      document.execCommand('copy');
      const btn = event.target;
      const old = btn.innerHTML;
      btn.innerHTML = '✅ Kopyalandı!';
      setTimeout(() => btn.innerHTML = old, 1500);
    };
  }
} catch(e) { console.error('JSON Formatter error:', e); }

// 2. Dünya Saati & Dilim Çevirici
try {
  if (!document.getElementById('worldclock-sec')) {
    const html = `
    <section id="worldclock-sec" class="section ds-section" style="display:none;min-height:100vh;background:var(--bg);color:var(--tx);font-family:'Segoe UI',sans-serif;padding-top:60px;">
      <button class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:100;cursor:pointer;background:var(--bg2);border:1px solid var(--a1);color:var(--tx);padding:10px 15px;border-radius:8px;font-weight:bold;box-shadow:0 0 10px var(--a1);" onclick="if(typeof dsGoToSection==='function') dsGoToSection('hubPage','')">◀ Ana Sayfa</button>
      
      <div style="max-width:800px;margin:0 auto;padding:20px;">
        <h2 style="color:var(--a1);text-align:center;margin-bottom:30px;text-shadow:0 0 10px var(--a1);">🌍 Dünya Saatleri</h2>
        
        <div id="wc-grid" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:20px;">
          <!-- Clocks will be injected here -->
        </div>
      </div>
    </section>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    const wcCities = [
      { name: 'İstanbul', tz: 'Europe/Istanbul', flag: '🇹🇷' },
      { name: 'Londra', tz: 'Europe/London', flag: '🇬🇧' },
      { name: 'New York', tz: 'America/New_York', flag: '🇺🇸' },
      { name: 'Tokyo', tz: 'Asia/Tokyo', flag: '🇯🇵' },
      { name: 'Sidney', tz: 'Australia/Sydney', flag: '🇦🇺' },
      { name: 'Dubai', tz: 'Asia/Dubai', flag: '🇦🇪' }
    ];

    const wcRender = () => {
      const grid = document.getElementById('wc-grid');
      if(!grid) return;
      grid.innerHTML = '';
      
      const now = new Date();
      
      wcCities.forEach(c => {
        const timeStr = new Intl.DateTimeFormat('tr-TR', { timeZone: c.tz, hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(now);
        const dateStr = new Intl.DateTimeFormat('tr-TR', { timeZone: c.tz, dateStyle: 'long' }).format(now);
        
        const card = document.createElement('div');
        card.style.cssText = 'background:var(--card);border:1px solid var(--bg2);border-radius:15px;padding:20px;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,0.5);transition:transform 0.3s;';
        card.innerHTML = `
          <div style="font-size:30px;margin-bottom:10px;">${c.flag}</div>
          <div style="font-size:20px;font-weight:bold;color:var(--a1);">${c.name}</div>
          <div style="font-size:36px;font-weight:900;margin:10px 0;text-shadow:0 0 10px rgba(255,255,255,0.2);">${timeStr}</div>
          <div style="font-size:12px;color:var(--tx2);">${dateStr}</div>
        `;
        grid.appendChild(card);
      });
    };

    let wcInt = null;
    const wcObserver = new MutationObserver((muts) => {
      muts.forEach(m => {
        if(m.attributeName === 'style') {
          const s = document.getElementById('worldclock-sec');
          if(s.style.display !== 'none') {
            wcRender();
            if(wcInt) clearInterval(wcInt);
            wcInt = setInterval(wcRender, 1000);
          } else {
            clearInterval(wcInt);
          }
        }
      });
    });
    wcObserver.observe(document.getElementById('worldclock-sec'), { attributes: true });
  }
} catch(e) { console.error('World Clock error:', e); }

// 3. Her Şeyi Çeviren Dönüştürücü
try {
  if (!document.getElementById('unit-converter-sec')) {
    const html = `
    <section id="unit-converter-sec" class="section ds-section" style="display:none;min-height:100vh;background:var(--bg);color:var(--tx);font-family:'Segoe UI',sans-serif;padding-top:60px;">
      <button class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:100;cursor:pointer;background:var(--bg2);border:1px solid #9b59b6;color:var(--tx);padding:10px 15px;border-radius:8px;font-weight:bold;box-shadow:0 0 10px #9b59b6;" onclick="if(typeof dsGoToSection==='function') dsGoToSection('hubPage','')">◀ Ana Sayfa</button>
      
      <div style="max-width:700px;margin:0 auto;padding:20px;">
        <h2 style="color:#9b59b6;text-align:center;margin-bottom:30px;text-shadow:0 0 10px #9b59b6;">📏 Birim Dönüştürücü</h2>
        
        <div style="background:var(--card);padding:30px;border-radius:15px;border:1px solid #9b59b6;box-shadow:0 10px 30px rgba(0,0,0,0.5);">
          <div style="margin-bottom:20px;">
            <label style="color:var(--tx2);display:block;margin-bottom:5px;">Kategori Seçin:</label>
            <select id="uc-cat" onchange="ucChangeCat()" style="width:100%;padding:10px;border-radius:8px;background:var(--bg);color:var(--tx);border:1px solid var(--bg2);font-size:16px;">
              <option value="length">Uzunluk (Metre, İnç, Mil vb.)</option>
              <option value="weight">Ağırlık (Kg, Lbs, Ons vb.)</option>
              <option value="temp">Sıcaklık (Celsius, Fahrenheit vb.)</option>
              <option value="data">Veri Boyutu (MB, GB, TB vb.)</option>
            </select>
          </div>
          
          <div style="display:flex;gap:15px;align-items:center;margin-bottom:20px;flex-wrap:wrap;">
            <div style="flex:1;min-width:200px;">
              <input type="number" id="uc-val1" oninput="ucConvert('1')" style="width:100%;padding:15px;border-radius:8px;background:var(--bg);color:var(--tx);border:1px solid var(--bg2);font-size:24px;font-weight:bold;">
              <select id="uc-unit1" onchange="ucConvert('1')" style="width:100%;padding:10px;margin-top:10px;border-radius:8px;background:var(--bg2);color:var(--tx);border:none;"></select>
            </div>
            
            <div style="font-size:30px;color:var(--tx2);">🟰</div>
            
            <div style="flex:1;min-width:200px;">
              <input type="number" id="uc-val2" oninput="ucConvert('2')" style="width:100%;padding:15px;border-radius:8px;background:var(--bg);color:var(--tx);border:1px solid var(--bg2);font-size:24px;font-weight:bold;">
              <select id="uc-unit2" onchange="ucConvert('2')" style="width:100%;padding:10px;margin-top:10px;border-radius:8px;background:var(--bg2);color:var(--tx);border:none;"></select>
            </div>
          </div>
        </div>
      </div>
    </section>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    const ucUnits = {
      length: { 'm':1, 'km':1000, 'cm':0.01, 'mm':0.001, 'inch':0.0254, 'foot':0.3048, 'yard':0.9144, 'mile':1609.34 },
      weight: { 'kg':1, 'g':0.001, 'mg':0.000001, 'ton':1000, 'lbs':0.453592, 'oz':0.0283495 },
      data: { 'B':1, 'KB':1024, 'MB':1048576, 'GB':1073741824, 'TB':1099511627776 },
      temp: { 'C':'c', 'F':'f', 'K':'k' } // Special logic
    };

    const ucNames = {
      'm':'Metre', 'km':'Kilometre', 'cm':'Santimetre', 'mm':'Milimetre', 'inch':'İnç', 'foot':'Feet', 'yard':'Yard', 'mile':'Mil',
      'kg':'Kilogram', 'g':'Gram', 'mg':'Miligram', 'ton':'Ton', 'lbs':'Pound (lbs)', 'oz':'Ons',
      'B':'Byte', 'KB':'Kilobyte', 'MB':'Megabyte', 'GB':'Gigabyte', 'TB':'Terabyte',
      'C':'Celsius', 'F':'Fahrenheit', 'K':'Kelvin'
    };

    window.ucChangeCat = () => {
      const cat = document.getElementById('uc-cat').value;
      const u1 = document.getElementById('uc-unit1');
      const u2 = document.getElementById('uc-unit2');
      u1.innerHTML = ''; u2.innerHTML = '';
      
      for(let key in ucUnits[cat]) {
        u1.innerHTML += `<option value="${key}">${ucNames[key]}</option>`;
        u2.innerHTML += `<option value="${key}">${ucNames[key]}</option>`;
      }
      u2.selectedIndex = 1 % Object.keys(ucUnits[cat]).length;
      document.getElementById('uc-val1').value = 1;
      ucConvert('1');
    };

    window.ucConvert = (source) => {
      const cat = document.getElementById('uc-cat').value;
      const v1El = document.getElementById('uc-val1');
      const v2El = document.getElementById('uc-val2');
      const u1 = document.getElementById('uc-unit1').value;
      const u2 = document.getElementById('uc-unit2').value;
      
      let v1 = parseFloat(v1El.value);
      let v2 = parseFloat(v2El.value);
      
      if(cat === 'temp') {
        if(source === '1') {
          if(isNaN(v1)) { v2El.value = ''; return; }
          let c = 0;
          if(u1 === 'C') c = v1;
          else if(u1 === 'F') c = (v1 - 32) * 5/9;
          else if(u1 === 'K') c = v1 - 273.15;
          
          if(u2 === 'C') v2El.value = c.toFixed(2);
          else if(u2 === 'F') v2El.value = ((c * 9/5) + 32).toFixed(2);
          else if(u2 === 'K') v2El.value = (c + 273.15).toFixed(2);
        } else {
          if(isNaN(v2)) { v1El.value = ''; return; }
          let c = 0;
          if(u2 === 'C') c = v2;
          else if(u2 === 'F') c = (v2 - 32) * 5/9;
          else if(u2 === 'K') c = v2 - 273.15;
          
          if(u1 === 'C') v1El.value = c.toFixed(2);
          else if(u1 === 'F') v1El.value = ((c * 9/5) + 32).toFixed(2);
          else if(u1 === 'K') v1El.value = (c + 273.15).toFixed(2);
        }
      } else {
        const rates = ucUnits[cat];
        if(source === '1') {
          if(isNaN(v1)) { v2El.value = ''; return; }
          const base = v1 * rates[u1];
          v2El.value = +(base / rates[u2]).toFixed(6);
        } else {
          if(isNaN(v2)) { v1El.value = ''; return; }
          const base = v2 * rates[u2];
          v1El.value = +(base / rates[u1]).toFixed(6);
        }
      }
    };
    
    // Init
    ucChangeCat();
  }
} catch(e) { console.error('Unit Converter error:', e); }

// 4. Frekans Jeneratörü
try {
  if (!document.getElementById('tone-gen-sec')) {
    const html = `
    <section id="tone-gen-sec" class="section ds-section" style="display:none;min-height:100vh;background:var(--bg);color:var(--tx);font-family:'Segoe UI',sans-serif;padding-top:60px;">
      <button class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:100;cursor:pointer;background:var(--bg2);border:1px solid #00bcd4;color:var(--tx);padding:10px 15px;border-radius:8px;font-weight:bold;box-shadow:0 0 10px #00bcd4;" onclick="if(typeof dsGoToSection==='function') { tgStop(); dsGoToSection('hubPage',''); }">◀ Ana Sayfa</button>
      
      <div style="max-width:600px;margin:0 auto;padding:20px;text-align:center;">
        <h2 style="color:#00bcd4;margin-bottom:30px;text-shadow:0 0 10px #00bcd4;">🔊 Frekans Jeneratörü</h2>
        
        <div style="background:var(--card);padding:40px;border-radius:20px;box-shadow:0 10px 30px rgba(0,0,0,0.5);position:relative;overflow:hidden;">
          <div id="tg-wave-visual" style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;opacity:0.2;background:repeating-linear-gradient(0deg, transparent, transparent 10px, #00bcd4 10px, #00bcd4 11px);transition:transform 0.1s;"></div>
          
          <div style="position:relative;z-index:1;">
            <div id="tg-hz-display" style="font-size:72px;font-weight:900;color:#00bcd4;text-shadow:0 0 20px #00bcd4;">440 Hz</div>
            
            <input type="range" id="tg-slider" min="20" max="20000" value="440" oninput="tgUpdateHz()" style="width:100%;margin:30px 0;accent-color:#00bcd4;">
            
            <div style="display:flex;justify-content:center;gap:10px;margin-bottom:30px;">
              <button onclick="tgSetType('sine')" id="tg-btn-sine" class="tg-type-btn active">SINE</button>
              <button onclick="tgSetType('square')" id="tg-btn-square" class="tg-type-btn">SQUARE</button>
              <button onclick="tgSetType('triangle')" id="tg-btn-triangle" class="tg-type-btn">TRIANGLE</button>
            </div>
            
            <button id="tg-play-btn" onclick="tgToggle()" style="background:#00bcd4;color:#000;border:none;padding:15px 40px;border-radius:30px;font-size:20px;font-weight:900;cursor:pointer;box-shadow:0 0 20px #00bcd4;transition:all 0.3s;">BAŞLAT</button>
            
            <div style="margin-top:30px;display:flex;justify-content:center;gap:10px;">
              <button onclick="tgQuickHz(165)" style="background:var(--bg2);color:var(--tx);border:none;padding:8px 15px;border-radius:20px;font-size:12px;cursor:pointer;">💧 Su At (165Hz)</button>
              <button onclick="tgQuickHz(432)" style="background:var(--bg2);color:var(--tx);border:none;padding:8px 15px;border-radius:20px;font-size:12px;cursor:pointer;">🧘 Şifa (432Hz)</button>
              <button onclick="tgQuickHz(440)" style="background:var(--bg2);color:var(--tx);border:none;padding:8px 15px;border-radius:20px;font-size:12px;cursor:pointer;">🎵 Standart (440Hz)</button>
            </div>
          </div>
        </div>
      </div>
      <style>
        .tg-type-btn { background:var(--bg2); color:var(--tx); border:1px solid var(--a2); padding:10px 20px; border-radius:8px; cursor:pointer; font-weight:bold; transition:all 0.2s; }
        .tg-type-btn.active { background:#00bcd4; color:#000; border-color:#00bcd4; }
      </style>
    </section>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    let tgCtx = null;
    let tgOsc = null;
    let tgPlaying = false;
    let tgType = 'sine';
    let tgHz = 440;
    
    let tgVisualInt = null;

    window.tgUpdateHz = () => {
      tgHz = document.getElementById('tg-slider').value;
      document.getElementById('tg-hz-display').textContent = tgHz + ' Hz';
      if(tgOsc) tgOsc.frequency.setValueAtTime(tgHz, tgCtx.currentTime);
    };

    window.tgQuickHz = (hz) => {
      document.getElementById('tg-slider').value = hz;
      tgUpdateHz();
    };

    window.tgSetType = (type) => {
      tgType = type;
      document.querySelectorAll('.tg-type-btn').forEach(b => b.classList.remove('active'));
      document.getElementById('tg-btn-' + type).classList.add('active');
      if(tgOsc) tgOsc.type = tgType;
    };

    window.tgToggle = () => {
      const btn = document.getElementById('tg-play-btn');
      if(tgPlaying) {
        tgStop();
      } else {
        if(!tgCtx) tgCtx = new (window.AudioContext || window.webkitAudioContext)();
        tgOsc = tgCtx.createOscillator();
        tgOsc.type = tgType;
        tgOsc.frequency.setValueAtTime(tgHz, tgCtx.currentTime);
        tgOsc.connect(tgCtx.destination);
        tgOsc.start();
        tgPlaying = true;
        btn.textContent = 'DURDUR';
        btn.style.background = '#ff5252';
        btn.style.boxShadow = '0 0 20px #ff5252';
        
        let offset = 0;
        tgVisualInt = setInterval(() => {
          offset += (tgHz / 100);
          document.getElementById('tg-wave-visual').style.transform = `translateY(${offset % 20}px)`;
        }, 16);
      }
    };

    window.tgStop = () => {
      if(tgOsc) {
        tgOsc.stop();
        tgOsc.disconnect();
        tgOsc = null;
      }
      tgPlaying = false;
      clearInterval(tgVisualInt);
      const btn = document.getElementById('tg-play-btn');
      if(btn) {
        btn.textContent = 'BAŞLAT';
        btn.style.background = '#00bcd4';
        btn.style.boxShadow = '0 0 20px #00bcd4';
      }
    };
  }
} catch(e) { console.error('Tone Gen error:', e); }

// 5. 20-20-20 Göz Asistanı
try {
  if (!document.getElementById('eye-rest-sec')) {
    const html = `
    <section id="eye-rest-sec" class="section ds-section" style="display:none;min-height:100vh;background:var(--bg);color:var(--tx);font-family:'Segoe UI',sans-serif;padding-top:60px;">
      <button class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:100;cursor:pointer;background:var(--bg2);border:1px solid #4caf50;color:var(--tx);padding:10px 15px;border-radius:8px;font-weight:bold;box-shadow:0 0 10px #4caf50;" onclick="if(typeof dsGoToSection==='function') dsGoToSection('hubPage','')">◀ Ana Sayfa</button>
      
      <div style="max-width:600px;margin:0 auto;padding:20px;text-align:center;">
        <div style="font-size:60px;margin-bottom:10px;">👁️</div>
        <h2 style="color:#4caf50;margin-bottom:10px;text-shadow:0 0 10px #4caf50;">20-20-20 Göz Asistanı</h2>
        <p style="color:var(--tx2);margin-bottom:40px;line-height:1.5;">Uzun süre bilgisayar başında kalmak göz yorgunluğuna sebep olur. Bu asistan arka planda çalışarak her 20 dakikada bir 20 saniye uzağa bakmanızı hatırlatır.</p>
        
        <div style="background:var(--card);padding:40px;border-radius:20px;box-shadow:0 10px 30px rgba(0,0,0,0.5);">
          <div id="er-status" style="font-size:24px;font-weight:bold;color:var(--a1);margin-bottom:30px;">KAPALI</div>
          
          <button id="er-toggle-btn" onclick="erToggle()" style="background:#4caf50;color:#fff;border:none;padding:15px 40px;border-radius:30px;font-size:20px;font-weight:900;cursor:pointer;box-shadow:0 0 20px #4caf50;transition:all 0.3s;width:100%;">ASİSTANI BAŞLAT</button>
        </div>
      </div>
    </section>
    
    <!-- Global Overlay for Eye Rest -->
    <div id="er-overlay" style="display:none;position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.85);backdrop-filter:blur(10px);z-index:99999;color:#fff;font-family:'Segoe UI',sans-serif;align-items:center;justify-content:center;flex-direction:column;text-align:center;transition:opacity 2s;">
      <div style="font-size:80px;margin-bottom:20px;animation:erPulse 2s infinite;">👁️</div>
      <h1 style="color:#4caf50;margin-bottom:10px;font-size:40px;">Gözlerinizi Dinlendirin</h1>
      <p style="font-size:20px;max-width:500px;margin:0 auto 30px;">Lütfen 6 metre uzağa bakarak 20 saniye bekleyin.</p>
      <div id="er-countdown" style="font-size:60px;font-weight:bold;color:#fff;">20</div>
      <button onclick="erSkip()" style="margin-top:30px;background:none;border:1px solid #555;color:#aaa;padding:10px 20px;border-radius:8px;cursor:pointer;">Şimdilik Geç</button>
    </div>
    <style>
      @keyframes erPulse { 0% { transform:scale(1); } 50% { transform:scale(1.1); } 100% { transform:scale(1); } }
    </style>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    let erActive = false;
    let erTimer = null;
    let erRestTimer = null;
    const WORK_TIME = 20 * 60 * 1000; // 20 min

    window.erToggle = () => {
      const btn = document.getElementById('er-toggle-btn');
      const status = document.getElementById('er-status');
      
      if(erActive) {
        erActive = false;
        clearTimeout(erTimer);
        btn.textContent = 'ASİSTANI BAŞLAT';
        btn.style.background = '#4caf50';
        btn.style.boxShadow = '0 0 20px #4caf50';
        status.textContent = 'KAPALI';
        status.style.color = 'var(--tx2)';
      } else {
        erActive = true;
        btn.textContent = 'ASİSTANI DURDUR';
        btn.style.background = '#ff5252';
        btn.style.boxShadow = '0 0 20px #ff5252';
        status.textContent = 'AÇIK (Arka planda çalışıyor)';
        status.style.color = '#4caf50';
        erScheduleWork();
      }
    };

    window.erScheduleWork = () => {
      clearTimeout(erTimer);
      if(!erActive) return;
      erTimer = setTimeout(() => {
        erStartRest();
      }, WORK_TIME);
    };

    window.erStartRest = () => {
      const overlay = document.getElementById('er-overlay');
      const cd = document.getElementById('er-countdown');
      overlay.style.display = 'flex';
      overlay.style.opacity = '0';
      setTimeout(() => overlay.style.opacity = '1', 50);
      
      let timeLeft = 20;
      cd.textContent = timeLeft;
      
      erRestTimer = setInterval(() => {
        timeLeft--;
        cd.textContent = timeLeft;
        if(timeLeft <= 0) {
          erSkip();
        }
      }, 1000);
    };

    window.erSkip = () => {
      const overlay = document.getElementById('er-overlay');
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.style.display = 'none';
      }, 1000); // Wait for fade out
      
      clearInterval(erRestTimer);
      erScheduleWork();
    };
  }
} catch(e) { console.error('Eye Rest error:', e); }
