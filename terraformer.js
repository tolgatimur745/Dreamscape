/* =========================================================
   COSMIC TERRAFORMER (Idle Planet Game)
   Real-time offline progress planet colonizer.
========================================================= */
try {
  const tfStyles = `
    .tf-wrap { font-family: 'Outfit', sans-serif; color: var(--tx); position: relative; max-width: 900px; margin: 0 auto; text-align: center; }
    
    /* Planet Visual */
    .tf-planet-container { position: relative; width: 300px; height: 300px; margin: 0 auto 30px auto; }
    .tf-planet { width: 100%; height: 100%; border-radius: 50%; background: radial-gradient(circle at 30% 30%, #B71C1C, #4A148C); box-shadow: inset -20px -20px 50px rgba(0,0,0,0.8), 0 0 50px rgba(244,67,54,0.3); transition: background 2s ease, box-shadow 2s ease; display: flex; justify-content: center; align-items: center; font-size: 5rem; position: relative; overflow: hidden; }
    .tf-atmosphere { position: absolute; top:-5%; left:-5%; width: 110%; height: 110%; border-radius: 50%; box-shadow: inset 0 0 20px rgba(0,229,255,0); transition: box-shadow 2s ease; pointer-events: none; }
    
    /* Offline Popup */
    .tf-offline-box { display:none; background: rgba(0,229,255,0.1); border: 1px solid var(--a3); padding: 15px; border-radius: 10px; margin-bottom: 20px; animation: popIn 0.5s; }
    
    /* Resource Bars */
    .tf-res-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px; }
    .tf-res-card { background: rgba(0,0,0,0.4); border: 1px solid var(--gb); padding: 15px; border-radius: 15px; display: flex; flex-direction: column; align-items: center; gap: 5px; }
    .tf-res-title { font-size: 0.85rem; font-weight: bold; color: var(--tx2); text-transform: uppercase; }
    .tf-res-val { font-size: 1.5rem; font-weight: bold; }
    .tf-res-bps { font-size: 0.75rem; color: var(--tx3); }
    
    .tf-r-o2 { color: #00E5FF; } .tf-r-h2o { color: #2196F3; } .tf-r-bio { color: #4CAF50; }
    
    /* Shop */
    .tf-shop-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px; }
    .tf-shop-item { background: var(--glass); border: 1px solid var(--gb); padding: 15px; border-radius: 15px; display: flex; justify-content: space-between; align-items: center; transition: 0.2s; }
    .tf-shop-item:hover { border-color: var(--a3); transform: translateY(-3px); }
    .tf-shop-icon { font-size: 2.5rem; margin-right: 15px; }
    .tf-shop-info { flex: 1; text-align: left; }
    .tf-shop-name { font-weight: bold; margin-bottom: 2px; }
    .tf-shop-desc { font-size: 0.75rem; color: var(--tx3); }
    
    .tf-buy-btn { background: var(--bg); border: 1px solid var(--a3); color: var(--a3); padding: 8px 15px; border-radius: 8px; cursor: pointer; transition: 0.2s; font-weight: bold; }
    .tf-buy-btn:hover:not(:disabled) { background: var(--a3); color: #fff; }
    .tf-buy-btn:disabled { opacity: 0.3; cursor: not-allowed; border-color: var(--gb); color: var(--tx3); }
    
    .tf-stage-text { font-size: 1.2rem; margin-bottom: 10px; color: var(--a5); font-weight: bold; letter-spacing: 2px; text-transform: uppercase; }
  `;
  document.head.insertAdjacentHTML('beforeend', `<style>${tfStyles}</style>`);

  const tfHtml = `
    <section class="section ds-section" id="terra-sec">
      <div class="section-header">
        <button class="chance-back-btn" style="position:absolute; top:20px; left:20px; z-index:100; cursor:pointer;" onclick="if(typeof dsGoToSection === 'function') dsGoToSection('hubPage', '')">◀ Ana Sayfa</button>
        <div class="section-badge" style="background:#4CAF50; color:#fff;">🌍 Gelişim Simülasyonu</div>
        <h2 class="section-title">Kozmik Terraformer</h2>
        <p class="section-sub">Ölü bir gezegeni inşa et. Sen sitede değilken bile kaynaklar artmaya devam eder.</p>
      </div>
      
      <div class="tf-wrap">
        <div class="tf-offline-box" id="tfOfflineMsg">
           <h4 style="color:var(--a3); margin-bottom:5px;">Siz Yokken Neler Oldu?</h4>
           <p id="tfOfflineText" style="font-size:0.9rem; color:var(--tx2);">Arka planda X kaynak üretildi.</p>
           <button class="mini-btn" style="margin-top:10px;" onclick="document.getElementById('tfOfflineMsg').style.display='none'">Harika!</button>
        </div>

        <div class="tf-stage-text" id="tfStageText">Evre 1: Çorak Gezegen</div>
        
        <div class="tf-planet-container">
           <div class="tf-planet" id="tfPlanetVisual">🌋</div>
           <div class="tf-atmosphere" id="tfAtmos"></div>
        </div>

        <div class="tf-res-grid">
           <div class="tf-res-card">
              <div class="tf-res-title">Oksijen (O2)</div>
              <div class="tf-res-val tf-r-o2" id="tfValO2">0</div>
              <div class="tf-res-bps" id="tfBpsO2">+0 / sn</div>
           </div>
           <div class="tf-res-card">
              <div class="tf-res-title">Su (H2O)</div>
              <div class="tf-res-val tf-r-h2o" id="tfValH2O">0</div>
              <div class="tf-res-bps" id="tfBpsH2O">+0 / sn</div>
           </div>
           <div class="tf-res-card">
              <div class="tf-res-title">Biyokütle</div>
              <div class="tf-res-val tf-r-bio" id="tfValBio">0</div>
              <div class="tf-res-bps" id="tfBpsBio">+0 / sn</div>
           </div>
        </div>

        <h3 style="margin-bottom:15px; text-align:left;">Altyapı (Jeneratörler)</h3>
        <div class="tf-shop-grid" id="tfShopGrid"></div>
      </div>
    </section>
  `;
  document.body.insertAdjacentHTML('beforeend', tfHtml);

  // --- Logic ---
  const TF_GENS = {
     o2_gen: { id:'o2_gen', n:'Atmosfer Pompası', i:'💨', desc:'+1 O2/sn', costType:'o2', baseCost: 10, type:'o2', out: 1 },
     h2o_pump: { id:'h2o_pump', n:'Su Çıkarıcı', i:'💧', desc:'+1 H2O/sn', costType:'o2', baseCost: 50, type:'h2o', out: 1 },
     bio_dome: { id:'bio_dome', n:'Biyo-Kubbe', i:'🌱', desc:'+1 Biyo/sn', costType:'h2o', baseCost: 100, type:'bio', out: 1 },
     o2_adv: { id:'o2_adv', n:'İyon Çevirici', i:'⚡', desc:'+15 O2/sn', costType:'bio', baseCost: 50, type:'o2', out: 15 },
     h2o_adv: { id:'h2o_adv', n:'Buzul Eritici', i:'🧊', desc:'+20 H2O/sn', costType:'o2', baseCost: 1000, type:'h2o', out: 20 },
     bio_adv: { id:'bio_adv', n:'DNA Sentezleyici', i:'🧬', desc:'+50 Biyo/sn', costType:'h2o', baseCost: 2000, type:'bio', out: 50 }
  };

  let tf = {
     res: { o2: 0, h2o: 0, bio: 0 },
     gens: { o2_gen:0, h2o_pump:0, bio_dome:0, o2_adv:0, h2o_adv:0, bio_adv:0 },
     lastTime: Date.now()
  };

  let tfTickInterval = null;

  function tfFormat(num) {
     if(num < 1000) return Math.floor(num).toString();
     if(num < 1000000) return (num/1000).toFixed(1) + 'k';
     return (num/1000000).toFixed(2) + 'M';
  }

  function tfLoad() {
     let s = localStorage.getItem('ds_tf_save');
     if(s) {
        try { tf = {...tf, ...JSON.parse(s)}; } catch(e){}
     }
     tfCalcOffline();
     tfStartTick();
     tfUpdateUI();
  }
  
  function tfSave() {
     tf.lastTime = Date.now();
     localStorage.setItem('ds_tf_save', JSON.stringify(tf));
  }

  function tfGetBps() {
     let bps = { o2:0, h2o:0, bio:0 };
     for(let k in TF_GENS) {
        let g = TF_GENS[k];
        let amt = tf.gens[k] || 0;
        bps[g.type] += (amt * g.out);
     }
     // Base generation if everything is 0 to kickstart
     if(bps.o2 === 0 && tf.res.o2 < 10) bps.o2 = 1; 
     return bps;
  }

  function tfCalcOffline() {
     let now = Date.now();
     let diffSec = Math.floor((now - tf.lastTime) / 1000);
     if(diffSec > 60) { // Only report if offline for > 1 minute
        let maxOffline = 86400 * 7; // Max 7 days offline
        if(diffSec > maxOffline) diffSec = maxOffline;
        
        let bps = tfGetBps();
        let addO2 = bps.o2 * diffSec;
        let addH2O = bps.h2o * diffSec;
        let addBio = bps.bio * diffSec;
        
        tf.res.o2 += addO2; tf.res.h2o += addH2O; tf.res.bio += addBio;
        
        if(addO2 > 0 || addH2O > 0 || addBio > 0) {
           document.getElementById('tfOfflineMsg').style.display = 'block';
           document.getElementById('tfOfflineText').innerHTML = `Yokluğunda ${tfFormat(diffSec)} saniye geçti.<br><b>Kazanılan:</b> ${tfFormat(addO2)} O2, ${tfFormat(addH2O)} H2O, ${tfFormat(addBio)} Biyo`;
        }
     }
     tf.lastTime = now;
  }

  function tfStartTick() {
     if(tfTickInterval) clearInterval(tfTickInterval);
     tfTickInterval = setInterval(() => {
        let bps = tfGetBps();
        tf.res.o2 += bps.o2;
        tf.res.h2o += bps.h2o;
        tf.res.bio += bps.bio;
        tfSave();
        tfUpdateVisuals();
     }, 1000);
  }

  function tfUpdateVisuals() {
     // Quick update numbers
     document.getElementById('tfValO2').textContent = tfFormat(tf.res.o2);
     document.getElementById('tfValH2O').textContent = tfFormat(tf.res.h2o);
     document.getElementById('tfValBio').textContent = tfFormat(tf.res.bio);
     
     let bps = tfGetBps();
     document.getElementById('tfBpsO2').textContent = '+' + tfFormat(bps.o2) + ' / sn';
     document.getElementById('tfBpsH2O').textContent = '+' + tfFormat(bps.h2o) + ' / sn';
     document.getElementById('tfBpsBio').textContent = '+' + tfFormat(bps.bio) + ' / sn';

     // Shop buttons check
     for(let k in TF_GENS) {
        let g = TF_GENS[k];
        let cost = tfGetCost(k);
        let btn = document.getElementById('tfBtn_' + k);
        if(btn) btn.disabled = (tf.res[g.costType] < cost);
     }

     // Visual Planet Evolution logic
     let score = tf.res.o2 + (tf.res.h2o * 5) + (tf.res.bio * 20);
     let p = document.getElementById('tfPlanetVisual');
     let a = document.getElementById('tfAtmos');
     let st = document.getElementById('tfStageText');

     if(score < 1000) {
        st.textContent = "Evre 1: Çorak Gezegen";
        p.style.background = "radial-gradient(circle at 30% 30%, #B71C1C, #4A148C)";
        p.textContent = "🌋";
        a.style.boxShadow = "inset 0 0 0px rgba(0,229,255,0)";
     } else if(score < 50000) {
        st.textContent = "Evre 2: Oksijen Tabakası";
        p.style.background = "radial-gradient(circle at 30% 30%, #795548, #3E2723)";
        p.textContent = "🏜️";
        a.style.boxShadow = "inset 0 0 20px rgba(0,229,255,0.4)";
     } else if(score < 500000) {
        st.textContent = "Evre 3: Okyanus Oluşumu";
        p.style.background = "radial-gradient(circle at 30% 30%, #2196F3, #1A237E)";
        p.textContent = "🌊";
        a.style.boxShadow = "inset 0 0 40px rgba(0,229,255,0.6)";
     } else {
        st.textContent = "Evre 4: Canlı Biyosfer";
        p.style.background = "radial-gradient(circle at 30% 30%, #4CAF50, #0D47A1)";
        p.textContent = "🌍";
        a.style.boxShadow = "inset 0 0 50px rgba(139,195,74,0.8)";
     }
  }

  function tfGetCost(id) {
     let g = TF_GENS[id];
     let amt = tf.gens[id] || 0;
     return Math.floor(g.baseCost * Math.pow(1.15, amt));
  }

  function tfUpdateUI() {
     let html = '';
     for(let k in TF_GENS) {
        let g = TF_GENS[k];
        let amt = tf.gens[k] || 0;
        let cost = tfGetCost(k);
        let cTypeStr = g.costType.toUpperCase();
        
        html += `
          <div class="tf-shop-item">
             <div class="tf-shop-icon">${g.i}</div>
             <div class="tf-shop-info">
                <div class="tf-shop-name">${g.n} <span style="color:var(--tx3);font-weight:normal;">(x${amt})</span></div>
                <div class="tf-shop-desc">${g.desc}</div>
             </div>
             <button class="tf-buy-btn" id="tfBtn_${k}" onclick="tfBuy('${k}')">Al (${tfFormat(cost)} ${cTypeStr})</button>
          </div>
        `;
     }
     document.getElementById('tfShopGrid').innerHTML = html;
     tfUpdateVisuals();
  }

  window.tfBuy = function(id) {
     let g = TF_GENS[id];
     let cost = tfGetCost(id);
     if(tf.res[g.costType] >= cost) {
        tf.res[g.costType] -= cost;
        tf.gens[id] = (tf.gens[id] || 0) + 1;
        tfUpdateUI();
        if(typeof aeAudio !== 'undefined') aeAudio.coin(); // reuse
     }
  }

  // Kickstart
  setTimeout(tfLoad, 500);

} catch(e) { console.error('Terraformer error', e); }
