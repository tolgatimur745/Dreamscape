/* ============================================================
   NEW FEATURES F — Leisure Hub (Hayat Kolaylaştıran Araçlar)
   ============================================================ */

// 1. Hızlı Pano & Karalama Defteri
try {
  if (!document.getElementById('scratchpad-sec')) {
    const html = `
    <section id="scratchpad-sec" class="section ds-section" style="display:none;min-height:100vh;background:var(--bg);color:var(--tx);font-family:'Segoe UI',sans-serif;padding-top:60px;">
      <button class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:100;cursor:pointer;background:var(--bg2);border:1px solid var(--a1);color:var(--tx);padding:10px 15px;border-radius:8px;font-weight:bold;box-shadow:0 0 10px var(--a1);" onclick="if(typeof dsGoToSection==='function') dsGoToSection('hubPage','')">◀ Ana Sayfa</button>
      
      <div style="max-width:800px;margin:0 auto;padding:20px;">
        <h2 style="color:var(--a1);text-align:center;margin-bottom:20px;text-shadow:0 0 10px var(--a1);">📝 Hızlı Pano</h2>
        
        <div style="display:flex;gap:10px;margin-bottom:15px;border-bottom:1px solid var(--a2);padding-bottom:10px;">
          <button onclick="spSwitchTab(1)" id="sp-tab-1" style="background:var(--a1);color:#000;border:none;padding:10px 20px;border-radius:8px;font-weight:bold;cursor:pointer;">Sekme 1</button>
          <button onclick="spSwitchTab(2)" id="sp-tab-2" style="background:var(--bg2);color:var(--tx);border:none;padding:10px 20px;border-radius:8px;font-weight:bold;cursor:pointer;">Sekme 2</button>
          <button onclick="spSwitchTab(3)" id="sp-tab-3" style="background:var(--bg2);color:var(--tx);border:none;padding:10px 20px;border-radius:8px;font-weight:bold;cursor:pointer;">Sekme 3</button>
          <button onclick="spSwitchTab(4)" id="sp-tab-4" style="background:var(--bg2);color:var(--tx);border:none;padding:10px 20px;border-radius:8px;font-weight:bold;cursor:pointer;">Sekme 4</button>
        </div>
        
        <textarea id="sp-textarea" oninput="spSave()" style="width:100%;height:60vh;background:var(--card);color:var(--tx);border:1px solid var(--a2);border-radius:12px;padding:20px;font-size:16px;resize:vertical;font-family:monospace;box-shadow:inset 0 0 10px rgba(0,0,0,0.5);" placeholder="Buraya yazın... Otomatik olarak kaydedilecektir."></textarea>
        
        <div style="display:flex;gap:10px;margin-top:15px;justify-content:flex-end;">
          <button onclick="spClear()" style="background:var(--danger);color:#fff;border:none;padding:10px 20px;border-radius:8px;font-weight:bold;cursor:pointer;">🗑️ Temizle</button>
          <button onclick="spCopy()" style="background:var(--a3);color:#fff;border:none;padding:10px 20px;border-radius:8px;font-weight:bold;cursor:pointer;">📋 Kopyala</button>
        </div>
      </div>
    </section>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    let spCurrentTab = 1;

    window.spSwitchTab = (tab) => {
      spCurrentTab = tab;
      for(let i=1; i<=4; i++) {
        const btn = document.getElementById('sp-tab-' + i);
        if(i === tab) {
          btn.style.background = 'var(--a1)';
          btn.style.color = '#000';
        } else {
          btn.style.background = 'var(--bg2)';
          btn.style.color = 'var(--tx)';
        }
      }
      const data = localStorage.getItem('ds_scratchpad_' + tab) || '';
      document.getElementById('sp-textarea').value = data;
    };

    window.spSave = () => {
      const val = document.getElementById('sp-textarea').value;
      localStorage.setItem('ds_scratchpad_' + spCurrentTab, val);
    };

    window.spClear = () => {
      if(confirm('Bu sekmeyi temizlemek istediğinize emin misiniz?')) {
        document.getElementById('sp-textarea').value = '';
        spSave();
      }
    };

    window.spCopy = () => {
      const ta = document.getElementById('sp-textarea');
      ta.select();
      document.execCommand('copy');
      const btn = event.target;
      const old = btn.innerHTML;
      btn.innerHTML = '✅ Kopyalandı!';
      setTimeout(() => btn.innerHTML = old, 1500);
    };

    // Init
    spSwitchTab(1);
  }
} catch(e) { console.error('Scratchpad error:', e); }

// 2. Metin & Kasa Dönüştürücü
try {
  if (!document.getElementById('text-converter-sec')) {
    const html = `
    <section id="text-converter-sec" class="section ds-section" style="display:none;min-height:100vh;background:var(--bg);color:var(--tx);font-family:'Segoe UI',sans-serif;padding-top:60px;">
      <button class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:100;cursor:pointer;background:var(--bg2);border:1px solid var(--a2);color:var(--tx);padding:10px 15px;border-radius:8px;font-weight:bold;box-shadow:0 0 10px var(--a2);" onclick="if(typeof dsGoToSection==='function') dsGoToSection('hubPage','')">◀ Ana Sayfa</button>
      
      <div style="max-width:900px;margin:0 auto;padding:20px;">
        <h2 style="color:var(--a2);text-align:center;margin-bottom:20px;text-shadow:0 0 10px var(--a2);">🔄 Metin Dönüştürücü</h2>
        
        <div style="display:flex;flex-wrap:wrap;gap:20px;">
          <div style="flex:1;min-width:300px;">
            <textarea id="tc-input" style="width:100%;height:300px;background:var(--card);color:var(--tx);border:1px solid var(--a2);border-radius:12px;padding:15px;font-size:14px;resize:vertical;" placeholder="Dönüştürülecek metni buraya yapıştırın..."></textarea>
          </div>
          
          <div style="flex:1;min-width:300px;display:flex;flex-direction:column;gap:10px;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
              <button onclick="tcTransform('upper')" class="tc-btn">BÜYÜK HARF</button>
              <button onclick="tcTransform('lower')" class="tc-btn">küçük harf</button>
              <button onclick="tcTransform('title')" class="tc-btn">İlk Harfler Büyük</button>
              <button onclick="tcTransform('camel')" class="tc-btn">camelCase</button>
              <button onclick="tcTransform('snake')" class="tc-btn">snake_case</button>
              <button onclick="tcTransform('kebab')" class="tc-btn">kebab-case</button>
            </div>
            <hr style="border-color:var(--bg2);margin:10px 0;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
              <button onclick="tcTransform('trim')" class="tc-btn">Fazla Boşlukları Sil</button>
              <button onclick="tcTransform('dedup')" class="tc-btn">Mükerrer Satırları Sil</button>
              <button onclick="tcTransform('sortAsc')" class="tc-btn">Satırları Sırala (A-Z)</button>
              <button onclick="tcTransform('sortDesc')" class="tc-btn">Satırları Sırala (Z-A)</button>
              <button onclick="tcTransform('revText')" class="tc-btn">Metni Ters Çevir</button>
              <button onclick="tcTransform('revLines')" class="tc-btn">Satırları Ters Çevir</button>
            </div>
          </div>
        </div>
        
        <style>
          .tc-btn { background:var(--bg2); color:var(--tx); border:1px solid var(--a3); padding:10px; border-radius:8px; cursor:pointer; font-weight:bold; transition:all 0.2s; }
          .tc-btn:hover { background:var(--a3); color:#000; }
        </style>
      </div>
    </section>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    window.tcTransform = (type) => {
      const inp = document.getElementById('tc-input');
      let val = inp.value;
      
      switch(type) {
        case 'upper': val = val.toUpperCase(); break;
        case 'lower': val = val.toLowerCase(); break;
        case 'title': 
          val = val.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          break;
        case 'camel':
          val = val.replace(/(?:^\w|[A-Z]|\b\w)/g, (w, i) => i === 0 ? w.toLowerCase() : w.toUpperCase()).replace(/\s+/g, '');
          break;
        case 'snake':
          val = val.replace(/\W+/g, ' ').split(/ |\B(?=[A-Z])/).map(w => w.toLowerCase()).join('_');
          break;
        case 'kebab':
          val = val.replace(/\W+/g, ' ').split(/ |\B(?=[A-Z])/).map(w => w.toLowerCase()).join('-');
          break;
        case 'trim':
          val = val.replace(/\s+/g, ' ').trim();
          break;
        case 'dedup':
          val = [...new Set(val.split('\\n'))].join('\\n');
          break;
        case 'sortAsc':
          val = val.split('\\n').sort().join('\\n');
          break;
        case 'sortDesc':
          val = val.split('\\n').sort().reverse().join('\\n');
          break;
        case 'revText':
          val = val.split('').reverse().join('');
          break;
        case 'revLines':
          val = val.split('\\n').reverse().join('\\n');
          break;
      }
      
      inp.value = val;
    };
  }
} catch(e) { console.error('Text Converter error:', e); }

// 3. Bütçe & Harcama Takipçisi
try {
  if (!document.getElementById('budget-tracker-sec')) {
    const html = `
    <section id="budget-tracker-sec" class="section ds-section" style="display:none;min-height:100vh;background:var(--bg);color:var(--tx);font-family:'Segoe UI',sans-serif;padding-top:60px;">
      <button class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:100;cursor:pointer;background:var(--bg2);border:1px solid #4caf50;color:var(--tx);padding:10px 15px;border-radius:8px;font-weight:bold;box-shadow:0 0 10px #4caf50;" onclick="if(typeof dsGoToSection==='function') dsGoToSection('hubPage','')">◀ Ana Sayfa</button>
      
      <div style="max-width:800px;margin:0 auto;padding:20px;">
        <h2 style="color:#4caf50;text-align:center;margin-bottom:20px;text-shadow:0 0 10px #4caf50;">💸 Bütçe Takipçisi</h2>
        
        <div style="display:flex;gap:20px;margin-bottom:30px;flex-wrap:wrap;">
          <div style="flex:1;background:var(--card);padding:20px;border-radius:15px;border:1px solid #4caf50;text-align:center;">
            <div style="font-size:14px;color:var(--tx2);">Toplam Gelir</div>
            <div id="bt-inc" style="font-size:28px;font-weight:bold;color:#4caf50;">0 ₺</div>
          </div>
          <div style="flex:1;background:var(--card);padding:20px;border-radius:15px;border:1px solid var(--danger);text-align:center;">
            <div style="font-size:14px;color:var(--tx2);">Toplam Gider</div>
            <div id="bt-exp" style="font-size:28px;font-weight:bold;color:var(--danger);">0 ₺</div>
          </div>
          <div style="flex:1;background:var(--card);padding:20px;border-radius:15px;border:1px solid var(--a1);text-align:center;">
            <div style="font-size:14px;color:var(--tx2);">Kalan Bakiye</div>
            <div id="bt-bal" style="font-size:28px;font-weight:bold;color:var(--a1);">0 ₺</div>
          </div>
        </div>
        
        <div style="background:var(--bg2);height:15px;border-radius:10px;overflow:hidden;margin-bottom:30px;display:flex;">
          <div id="bt-bar-inc" style="height:100%;background:#4caf50;width:50%;transition:width 0.5s;"></div>
          <div id="bt-bar-exp" style="height:100%;background:var(--danger);width:50%;transition:width 0.5s;"></div>
        </div>
        
        <div style="display:flex;gap:15px;margin-bottom:30px;background:var(--card);padding:20px;border-radius:15px;flex-wrap:wrap;">
          <input type="text" id="bt-desc" placeholder="Açıklama (örn: Market)" style="flex:2;background:var(--bg);color:var(--tx);border:1px solid var(--bg2);padding:10px;border-radius:8px;">
          <input type="number" id="bt-amt" placeholder="Miktar" style="flex:1;background:var(--bg);color:var(--tx);border:1px solid var(--bg2);padding:10px;border-radius:8px;">
          <select id="bt-type" style="flex:1;background:var(--bg);color:var(--tx);border:1px solid var(--bg2);padding:10px;border-radius:8px;">
            <option value="inc">Gelir (+)</option>
            <option value="exp">Gider (-)</option>
          </select>
          <button onclick="btAddItem()" style="background:#4caf50;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-weight:bold;cursor:pointer;">Ekle</button>
        </div>
        
        <div id="bt-list" style="display:flex;flex-direction:column;gap:10px;"></div>
      </div>
    </section>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    let btItems = JSON.parse(localStorage.getItem('ds_budget_items') || '[]');

    window.btUpdateUI = () => {
      const list = document.getElementById('bt-list');
      list.innerHTML = '';
      
      let inc = 0, exp = 0;
      
      btItems.forEach((item, idx) => {
        if(item.type === 'inc') inc += item.amt;
        else exp += item.amt;
        
        const el = document.createElement('div');
        el.style.cssText = `display:flex;justify-content:space-between;background:var(--card);padding:15px;border-radius:10px;border-left:5px solid ${item.type === 'inc' ? '#4caf50' : 'var(--danger)'};`;
        el.innerHTML = `
          <span style="font-weight:bold;">${item.desc}</span>
          <span>${item.type === 'inc' ? '+' : '-'}${item.amt} ₺ 
            <button onclick="btDelItem(${idx})" style="background:none;border:none;color:var(--danger);cursor:pointer;margin-left:10px;">✖</button>
          </span>
        `;
        list.appendChild(el);
      });
      
      document.getElementById('bt-inc').textContent = inc + ' ₺';
      document.getElementById('bt-exp').textContent = exp + ' ₺';
      document.getElementById('bt-bal').textContent = (inc - exp) + ' ₺';
      
      const total = inc + exp;
      if(total === 0) {
        document.getElementById('bt-bar-inc').style.width = '50%';
        document.getElementById('bt-bar-exp').style.width = '50%';
      } else {
        document.getElementById('bt-bar-inc').style.width = (inc / total * 100) + '%';
        document.getElementById('bt-bar-exp').style.width = (exp / total * 100) + '%';
      }
      
      localStorage.setItem('ds_budget_items', JSON.stringify(btItems));
    };

    window.btAddItem = () => {
      const desc = document.getElementById('bt-desc').value.trim();
      const amt = parseFloat(document.getElementById('bt-amt').value);
      const type = document.getElementById('bt-type').value;
      
      if(!desc || isNaN(amt) || amt <= 0) return alert('Geçerli bir açıklama ve miktar girin.');
      
      btItems.push({ desc, amt, type });
      document.getElementById('bt-desc').value = '';
      document.getElementById('bt-amt').value = '';
      btUpdateUI();
    };

    window.btDelItem = (idx) => {
      btItems.splice(idx, 1);
      btUpdateUI();
    };

    btUpdateUI();
  }
} catch(e) { console.error('Budget Tracker error:', e); }

// 4. Hızlı QR Kod Üretici
try {
  if (!document.getElementById('qrcode-sec')) {
    const html = `
    <section id="qrcode-sec" class="section ds-section" style="display:none;min-height:100vh;background:var(--bg);color:var(--tx);font-family:'Segoe UI',sans-serif;padding-top:60px;">
      <button class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:100;cursor:pointer;background:var(--bg2);border:1px solid #fff;color:var(--tx);padding:10px 15px;border-radius:8px;font-weight:bold;box-shadow:0 0 10px #fff;" onclick="if(typeof dsGoToSection==='function') dsGoToSection('hubPage','')">◀ Ana Sayfa</button>
      
      <div style="max-width:600px;margin:0 auto;padding:20px;text-align:center;">
        <h2 style="color:#fff;margin-bottom:20px;text-shadow:0 0 10px #fff;">📱 Hızlı QR Kod</h2>
        <p style="color:var(--tx2);margin-bottom:20px;">Paylaşmak istediğiniz linki veya metni yazın, anında QR koda dönüşsün.</p>
        
        <input type="text" id="qr-input" oninput="qrGenerate()" placeholder="Örn: https://google.com" style="width:100%;background:var(--card);color:var(--tx);border:1px solid var(--bg2);padding:15px;border-radius:12px;font-size:16px;margin-bottom:30px;box-shadow:0 0 15px rgba(255,255,255,0.1);">
        
        <div style="background:#fff;padding:20px;border-radius:20px;display:inline-block;box-shadow:0 0 30px rgba(255,255,255,0.2);">
          <img id="qr-img" src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=LeisureHub" alt="QR Code" style="width:250px;height:250px;">
        </div>
      </div>
    </section>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    let qrTimeout;
    window.qrGenerate = () => {
      clearTimeout(qrTimeout);
      qrTimeout = setTimeout(() => {
        const val = document.getElementById('qr-input').value.trim();
        const img = document.getElementById('qr-img');
        if(val) {
          img.src = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=' + encodeURIComponent(val);
        } else {
          img.src = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=LeisureHub';
        }
      }, 500); // 500ms debounce
    };
  }
} catch(e) { console.error('QR Code error:', e); }

// 5. Veri & Şifre Üretici
try {
  if (!document.getElementById('data-gen-sec')) {
    const html = `
    <section id="data-gen-sec" class="section ds-section" style="display:none;min-height:100vh;background:var(--bg);color:var(--tx);font-family:'Segoe UI',sans-serif;padding-top:60px;">
      <button class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:100;cursor:pointer;background:var(--bg2);border:1px solid var(--a3);color:var(--tx);padding:10px 15px;border-radius:8px;font-weight:bold;box-shadow:0 0 10px var(--a3);" onclick="if(typeof dsGoToSection==='function') dsGoToSection('hubPage','')">◀ Ana Sayfa</button>
      
      <div style="max-width:700px;margin:0 auto;padding:20px;">
        <h2 style="color:var(--a3);text-align:center;margin-bottom:30px;text-shadow:0 0 10px var(--a3);">🔑 Veri & Şifre Üretici</h2>
        
        <div style="background:var(--card);padding:30px;border-radius:15px;border:1px solid var(--a3);text-align:center;margin-bottom:30px;">
          <div id="dg-result" style="font-size:24px;font-family:monospace;margin-bottom:20px;background:var(--bg);padding:15px;border-radius:8px;word-break:break-all;">...</div>
          <button onclick="dgCopy()" style="background:var(--a3);color:#fff;border:none;padding:10px 30px;border-radius:8px;font-weight:bold;cursor:pointer;font-size:16px;">📋 Kopyala</button>
        </div>
        
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;">
          <button onclick="dgGen('pass_strong')" class="dg-btn">Güçlü Şifre (16 Karakter)</button>
          <button onclick="dgGen('pass_pin')" class="dg-btn">Rastgele PIN (6 Hane)</button>
          <button onclick="dgGen('uuid')" class="dg-btn">UUID (v4)</button>
          <button onclick="dgGen('hex')" class="dg-btn">Rastgele HEX Renk</button>
          <button onclick="dgGen('name')" class="dg-btn">Sahte İsim Üret</button>
          <button onclick="dgGen('coin')" class="dg-btn">Yazı / Tura At</button>
        </div>
        
        <style>
          .dg-btn { background:var(--bg2); color:var(--tx); border:1px solid var(--bg2); padding:15px; border-radius:10px; cursor:pointer; font-weight:bold; transition:all 0.2s; font-size:14px; }
          .dg-btn:hover { border-color:var(--a3); color:var(--a3); transform:translateY(-2px); box-shadow:0 5px 15px rgba(0,0,0,0.3); }
        </style>
      </div>
    </section>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    window.dgGen = (type) => {
      const res = document.getElementById('dg-result');
      let out = '';
      
      if(type === 'pass_strong') {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
        for(let i=0; i<16; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
      } else if (type === 'pass_pin') {
        for(let i=0; i<6; i++) out += Math.floor(Math.random() * 10);
      } else if (type === 'uuid') {
        out = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      } else if (type === 'hex') {
        out = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0').toUpperCase();
        res.style.color = out;
      } else if (type === 'name') {
        const first = ['Ahmet', 'Mehmet', 'Ayşe', 'Fatma', 'Can', 'Deniz', 'Ege', 'Berk', 'Selin', 'Zeynep', 'Tolga', 'Ali'];
        const last = ['Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Yıldız', 'Öztürk', 'Aydın', 'Özdemir', 'Arslan'];
        out = first[Math.floor(Math.random() * first.length)] + ' ' + last[Math.floor(Math.random() * last.length)];
      } else if (type === 'coin') {
        out = Math.random() > 0.5 ? '🪙 YAZI' : '🦅 TURA';
      }
      
      if(type !== 'hex') res.style.color = 'var(--tx)';
      res.textContent = out;
    };

    window.dgCopy = () => {
      const txt = document.getElementById('dg-result').textContent;
      if(txt === '...') return;
      navigator.clipboard.writeText(txt);
      const btn = event.target;
      const old = btn.innerHTML;
      btn.innerHTML = '✅ Kopyalandı!';
      setTimeout(() => btn.innerHTML = old, 1500);
    };
  }
} catch(e) { console.error('Data Gen error:', e); }
