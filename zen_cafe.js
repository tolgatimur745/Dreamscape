/* =========================================================
   ZEN CAFE (ASMR Barmen & Barista)
   Relaxing mixing simulator with audio.
========================================================= */
try {
  const zcStyles = `
    .zc-wrap { font-family: 'Outfit', sans-serif; color: var(--tx); position: relative; max-width: 800px; margin: 0 auto; text-align: center; }
    .zc-customer-box { background: rgba(0,0,0,0.3); border-radius: 15px; border: 1px solid var(--gb); padding: 20px; margin-bottom: 30px; position: relative; min-height: 120px; display: flex; align-items: center; justify-content: center; flex-direction: column; }
    .zc-customer-avatar { font-size: 4rem; position: absolute; left: 20px; top: 50%; transform: translateY(-50%); }
    .zc-bubble { background: var(--bg); border: 2px solid var(--a3); padding: 15px 25px; border-radius: 20px; border-bottom-left-radius: 0; margin-left: 80px; position: relative; animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    .zc-bubble-text { font-size: 1.1rem; color: var(--tx2); }
    
    .zc-counter { display: flex; flex-direction: column; align-items: center; gap: 20px; background: linear-gradient(0deg, rgba(0,0,0,0.5) 0%, transparent 100%); padding-bottom: 20px; border-radius: 20px; }
    .zc-glass-wrap { position: relative; width: 120px; height: 180px; }
    .zc-glass { width: 100%; height: 100%; border: 4px solid rgba(255,255,255,0.2); border-top: none; border-radius: 0 0 20px 20px; position: absolute; bottom: 0; overflow: hidden; background: rgba(255,255,255,0.05); z-index: 10; }
    .zc-liquid-container { position: absolute; bottom: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: flex-end; }
    .zc-liquid { width: 100%; transition: height 0.3s ease; display:flex; justify-content:center; align-items:center; color:rgba(0,0,0,0.5); font-size:1.5rem; font-weight:bold; }
    .zc-ice-container { position: absolute; bottom: 10px; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 5; display:flex; flex-wrap:wrap; align-content:flex-end; padding:5px; gap:2px; }
    .zc-ice-cube { width: 30px; height: 30px; background: rgba(255,255,255,0.6); border-radius: 5px; border: 1px solid rgba(255,255,255,0.8); animation: floatIce 2s infinite alternate; }
    @keyframes floatIce { from { transform: translateY(0) rotate(0deg); } to { transform: translateY(-5px) rotate(10deg); } }
    
    .zc-ing-grid { display: flex; flex-wrap: wrap; gap: 15px; justify-content: center; margin-top: 20px; }
    .zc-ing-btn { background: var(--glass); border: 1px solid var(--gb); padding: 15px 25px; border-radius: 15px; cursor: pointer; transition: 0.2s; display: flex; flex-direction: column; align-items: center; gap: 5px; width: 100px; }
    .zc-ing-btn:hover { border-color: var(--a3); transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.3); }
    .zc-ing-btn:active { transform: scale(0.95); }
    .zc-ing-icon { font-size: 2rem; }
    .zc-ing-name { font-size: 0.8rem; font-weight: bold; color: var(--tx2); }
    
    .zc-actions { display: flex; gap: 15px; margin-top: 30px; justify-content: center; }
    .zc-trash-btn { background: transparent; border: 2px solid #f44; color: #f44; padding: 10px 20px; border-radius: 100px; cursor: pointer; font-weight: bold; transition: 0.2s; }
    .zc-trash-btn:hover { background: rgba(244,67,84,0.1); }
    .zc-serve-btn { background: linear-gradient(45deg, var(--a1), var(--a3)); color: #fff; border: none; padding: 10px 30px; border-radius: 100px; cursor: pointer; font-weight: bold; font-size: 1.1rem; box-shadow: 0 5px 15px rgba(0,229,255,0.3); transition: 0.2s; }
    .zc-serve-btn:hover { transform: scale(1.05); }
    
    .zc-stats { display: flex; justify-content: space-around; margin-bottom: 20px; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 15px; border: 1px solid var(--gb); }
    .zc-stat-val { font-size: 1.5rem; color: var(--a5); font-weight: bold; }
  `;
  document.head.insertAdjacentHTML('beforeend', `<style>${zcStyles}</style>`);

  const zcHtml = `
    <section class="section ds-section" id="zencafe-sec">
      <div class="section-header">
        <button class="chance-back-btn" style="position:absolute; top:20px; left:20px; z-index:100; cursor:pointer;" onclick="if(typeof dsGoToSection === 'function') dsGoToSection('hubPage', '')">◀ Ana Sayfa</button>
        <div class="section-badge" style="background:#8D6E63; color:#fff;">☕ ASMR Barista</div>
        <h2 class="section-title">Zen Kafe</h2>
        <p class="section-sub">Kulaklığını tak, rahatla ve müşterilerin dertlerine deva olacak karışımlar hazırla.</p>
      </div>
      
      <div class="zc-wrap">
        <div class="zc-stats">
           <div><div style="font-size:0.8rem; color:var(--tx3)">Günlük Ciro</div><div class="zc-stat-val" id="zcMoney">$0</div></div>
           <div><div style="font-size:0.8rem; color:var(--tx3)">Mutlu Müşteri</div><div class="zc-stat-val" style="color:#4CAF50" id="zcRep">0</div></div>
        </div>

        <div class="zc-customer-box">
           <div class="zc-customer-avatar" id="zcCusAvatar">👤</div>
           <div class="zc-bubble">
              <div class="zc-bubble-text" id="zcCusText">Müşteri bekleniyor...</div>
           </div>
        </div>

        <div class="zc-counter">
           <div class="zc-glass-wrap">
              <div class="zc-glass">
                 <div class="zc-liquid-container" id="zcGlass"></div>
                 <div class="zc-ice-container" id="zcIceBox"></div>
              </div>
           </div>
           
           <div class="zc-ing-grid" id="zcIngGrid">
              <!-- Rendered via JS -->
           </div>
           
           <div class="zc-actions">
              <button class="zc-trash-btn" onclick="zcTrash()">🗑️ Çöpe Dök</button>
              <button class="zc-serve-btn" onclick="zcServe()">🛎️ Servis Et</button>
           </div>
        </div>
      </div>
    </section>
  `;
  document.body.insertAdjacentHTML('beforeend', zcHtml);

  // --- Logic ---
  const zcAudio = {
     ctx: null,
     init() { if(!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){} } },
     play(t, f, d, v=0.1) {
        if(!this.ctx) return;
        let o = this.ctx.createOscillator(); let g = this.ctx.createGain();
        o.type = t; o.frequency.setValueAtTime(f, this.ctx.currentTime);
        g.gain.setValueAtTime(v, this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime+d);
        o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime+d);
     },
     pour() {
        if(!this.ctx) return;
        let bs = this.ctx.createBufferSource(); let g = this.ctx.createGain();
        let buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.5, this.ctx.sampleRate);
        let data = buf.getChannelData(0);
        for(let i=0; i<data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.1; // White noise for liquid pouring
        bs.buffer = buf;
        
        let f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 800; // Muffler
        
        g.gain.setValueAtTime(0.2, this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime+0.5);
        bs.connect(f); f.connect(g); g.connect(this.ctx.destination); bs.start();
     },
     ice() { this.play('triangle', 3000, 0.1, 0.05); setTimeout(()=>this.play('triangle', 3200, 0.1, 0.02), 50); },
     ding() { this.play('sine', 1500, 0.2, 0.1); setTimeout(()=>this.play('sine', 2000, 0.4, 0.2), 100); },
     error() { this.play('sawtooth', 200, 0.3, 0.1); }
  };

  const INGREDIENTS = {
     coffee: { id:'coffee', n:'Espresso', i:'☕', c:'#3E2723' },
     milk: { id:'milk', n:'Süt', i:'🥛', c:'#FFFFFF' },
     matcha: { id:'matcha', n:'Matcha', i:'🍵', c:'#8BC34A' },
     neon: { id:'neon', n:'Neon Şurup', i:'🧪', c:'#00E5FF' },
     cherry: { id:'cherry', n:'Vişne', i:'🍒', c:'#D32F2F' },
     ice: { id:'ice', n:'Buz', i:'🧊', type:'solid' }
  };

  const CUSTOMERS = [
     { a:'👨‍💻', t:"Bütün gece kod yazdım, çok uykusuzum. Gözümü açacak sert bir şey lazım.", req:['coffee', 'coffee'] },
     { a:'👩‍🎨', t:"İlham perilerim kayıp. Rengarenk ve yaratıcı bir şeyler istiyorum! (Soğuk olsun)", req:['neon', 'ice'] },
     { a:'🧘‍♀️', t:"Yoga sonrası biraz detoks fena olmaz. Hafif ve yeşil bir şey lütfen.", req:['matcha', 'milk'] },
     { a:'🧛‍♂️', t:"Güneşi sevmem. Bana kıpkırmızı, buz gibi bir şey ver.", req:['cherry', 'ice'] },
     { a:'👦', t:"Sadece normal bir kahve istiyorum, sütlü olsun.", req:['coffee', 'milk'] },
     { a:'🕵️‍♂️', t:"Gizli bir görevdeyim... Fark edilmeyecek, neon parlayan soğuk bir kahve karışımı?", req:['coffee', 'neon', 'ice'] }
  ];

  let zcState = { money:0, rep:0 };
  let currentGlass = [];
  let currentIce = 0;
  let activeCustomer = null;

  function zcRenderIngredients() {
     let html = '';
     for(let k in INGREDIENTS) {
        let ing = INGREDIENTS[k];
        html += `<button class="zc-ing-btn" onclick="zcAddIng('${k}')">
           <div class="zc-ing-icon">${ing.i}</div>
           <div class="zc-ing-name">${ing.n}</div>
        </button>`;
     }
     document.getElementById('zcIngGrid').innerHTML = html;
  }

  function zcNextCustomer() {
     activeCustomer = CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];
     document.getElementById('zcCusAvatar').textContent = activeCustomer.a;
     document.getElementById('zcCusText').textContent = activeCustomer.t;
     document.getElementById('zcCustomer-box')?.classList.remove('zc-damage'); // reset
  }

  window.zcAddIng = function(k) {
     zcAudio.init();
     if(currentGlass.length >= 4 && k !== 'ice') return toast('Bardak tamamen doldu!', '#ff9800');
     
     let ing = INGREDIENTS[k];
     if(ing.type === 'solid') {
        if(currentIce >= 3) return toast('Bardak buzla doldu!', '#ff9800');
        currentIce++;
        let iDiv = document.createElement('div'); iDiv.className = 'zc-ice-cube';
        document.getElementById('zcIceBox').appendChild(iDiv);
        zcAudio.ice();
     } else {
        currentGlass.push(k);
        zcAudio.pour();
        zcRenderGlass();
     }
  }

  function zcRenderGlass() {
     let html = '';
     let h = 100 / Math.max(1, currentGlass.length); // flex height
     currentGlass.forEach(k => {
        let ing = INGREDIENTS[k];
        html += `<div class="zc-liquid" style="height:${h}%; background:${ing.c}; box-shadow: inset 0 0 10px rgba(0,0,0,0.2);"></div>`;
     });
     document.getElementById('zcGlass').innerHTML = html;
  }

  window.zcTrash = function() {
     zcAudio.init();
     currentGlass = [];
     currentIce = 0;
     document.getElementById('zcIceBox').innerHTML = '';
     zcRenderGlass();
     zcAudio.play('sawtooth', 100, 0.3, 0.1);
  }

  window.zcServe = function() {
     zcAudio.init();
     if(!activeCustomer) return;
     if(currentGlass.length === 0 && currentIce === 0) return toast('Boş bardak veremezsin!', '#f44');
     
     // Evaluate
     let reqs = [...activeCustomer.req];
     let contents = [...currentGlass];
     for(let i=0; i<currentIce; i++) contents.push('ice');
     
     // Simple match logic: Do they have at least what was required?
     let success = true;
     reqs.forEach(r => {
        let idx = contents.indexOf(r);
        if(idx !== -1) contents.splice(idx, 1);
        else success = false; // Missing required ingredient
     });

     if(success) {
        zcAudio.ding();
        let tip = 5 + Math.floor(Math.random() * 10);
        if(contents.length === 0) tip += 5; // Perfect match (no extra junk)
        zcState.money += tip;
        zcState.rep++;
        document.getElementById('zcMoney').textContent = '$' + zcState.money;
        document.getElementById('zcRep').textContent = zcState.rep;
        toast('Müşteri çok mutlu! +' + tip + '$', '#4CAF50');
     } else {
        zcAudio.error();
        toast('Müşteri bunu beğenmedi...', '#f44');
     }
     
     zcTrash();
     zcNextCustomer();
  }

  // Init
  zcRenderIngredients();
  zcNextCustomer();

} catch(e) { console.error('Zen Cafe error', e); }
