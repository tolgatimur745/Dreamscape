/* =========================================================
   HABIT QUEST (Hayat RPG)
   Gamified task and habit tracker.
========================================================= */
try {
  // --- 1. Styles ---
  const hqStyles = `
    .hq-wrap { font-family: 'Outfit', sans-serif; color: var(--tx); position: relative; max-width: 1000px; margin: 0 auto; }
    .hq-header { display: flex; justify-content: space-between; align-items: center; padding: 20px; background: rgba(0,0,0,0.3); border-radius: 15px; border: 1px solid var(--gb); margin-bottom: 20px; flex-wrap:wrap; gap:20px; }
    
    /* Avatar Display */
    .hq-avatar-box { display: flex; align-items: center; gap: 20px; }
    .hq-avatar-visual { font-size: 4rem; width: 100px; height: 100px; background: radial-gradient(circle, rgba(0,229,255,0.2) 0%, rgba(0,0,0,0.5) 100%); border-radius: 50%; display: flex; justify-content: center; align-items: center; border: 2px solid var(--a3); position: relative; box-shadow: 0 0 20px rgba(0,229,255,0.3); }
    .hq-avatar-pet { position: absolute; bottom: -10px; right: -15px; font-size: 2rem; animation: float 3s ease-in-out infinite; }
    .hq-avatar-wep { position: absolute; top: -10px; left: -15px; font-size: 2rem; transform: rotate(-45deg); }
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
    
    /* Stats */
    .hq-stats { flex: 1; min-width: 250px; }
    .hq-stat-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
    .hq-stat-label { width: 40px; font-weight: bold; font-size: 0.9rem; }
    .hq-bar-bg { flex: 1; height: 14px; background: rgba(0,0,0,0.5); border-radius: 10px; overflow: hidden; position: relative; }
    .hq-bar-fill { height: 100%; transition: width 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    .hq-bar-hp { background: linear-gradient(90deg, #f44, #ff5252); }
    .hq-bar-xp { background: linear-gradient(90deg, #2196F3, #00BCD4); }
    .hq-bar-text { position: absolute; top: 0; left: 0; width: 100%; text-align: center; font-size: 0.65rem; line-height: 14px; color: #fff; font-weight: bold; text-shadow: 1px 1px 2px #000; }
    
    .hq-gold-box { background: rgba(255, 234, 0, 0.1); border: 1px solid rgba(255, 234, 0, 0.3); padding: 10px 20px; border-radius: 10px; text-align: center; }
    .hq-gold-val { font-size: 1.5rem; color: #ffea00; font-weight: bold; text-shadow: 0 0 10px rgba(255, 234, 0, 0.5); }
    
    /* Layout */
    .hq-layout { display: flex; gap: 20px; flex-wrap: wrap; }
    .hq-col { flex: 1; min-width: 300px; display: flex; flex-direction: column; gap: 15px; }
    
    /* Task Cards */
    .hq-task-list { display: flex; flex-direction: column; gap: 10px; }
    .hq-task { background: var(--glass); border: 1px solid var(--gb); border-radius: 10px; padding: 15px; display: flex; justify-content: space-between; align-items: center; transition: 0.2s; cursor: pointer; position: relative; overflow: hidden; }
    .hq-task:hover { border-color: var(--a3); transform: translateX(5px); }
    .hq-task.completed { opacity: 0.5; filter: grayscale(1); }
    .hq-task.completed::after { content: '✓'; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 4rem; color: rgba(76, 175, 80, 0.3); pointer-events: none; }
    
    .hq-task-info { flex: 1; }
    .hq-task-title { font-size: 1.1rem; margin-bottom: 5px; }
    .hq-task-meta { font-size: 0.75rem; color: var(--tx3); display: flex; gap: 10px; }
    .hq-diff-1 { color: #4CAF50; } .hq-diff-2 { color: #FF9800; } .hq-diff-3 { color: #f44; }
    
    .hq-task-actions { display: flex; gap: 5px; }
    .hq-btn-done { background: #4CAF50; border: none; width: 40px; height: 40px; border-radius: 10px; color: #fff; font-size: 1.2rem; cursor: pointer; transition: 0.2s; }
    .hq-btn-done:hover { background: #43A047; transform: scale(1.1); }
    .hq-btn-del { background: transparent; border: 1px solid #f44; width: 40px; height: 40px; border-radius: 10px; color: #f44; font-size: 1.2rem; cursor: pointer; transition: 0.2s; }
    .hq-btn-del:hover { background: rgba(244,67,84,0.1); }
    
    /* Inputs */
    .hq-add-form { display: flex; gap: 10px; background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px; margin-bottom: 15px; }
    .hq-input { flex: 1; background: var(--bg); border: 1px solid var(--gb); color: var(--tx); padding: 10px; border-radius: 8px; outline: none; }
    .hq-select { background: var(--bg); border: 1px solid var(--gb); color: var(--tx); padding: 10px; border-radius: 8px; outline: none; cursor: pointer; }
    
    /* Shop */
    .hq-shop-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px; }
    .hq-shop-item { background: var(--glass); border: 1px solid var(--gb); padding: 15px; border-radius: 15px; text-align: center; transition: 0.3s; display: flex; flex-direction: column; justify-content: space-between; gap:10px; }
    .hq-shop-item:hover { border-color: #ffea00; transform: translateY(-5px); }
    .hq-shop-icon { font-size: 3rem; margin-bottom: 10px; }
    
    /* Modal / Popup FX */
    .hq-lvlup-modal { display: none; position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.9); z-index:99999; justify-content:center; align-items:center; flex-direction: column; }
    .hq-lvlup-text { font-size: 4rem; color: #ffea00; text-shadow: 0 0 20px #ffea00; animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); margin-bottom: 20px;}
    @keyframes scaleIn { from { transform: scale(0); } to { transform: scale(1); } }
    
    /* Animations */
    .hq-damage { animation: shakeRed 0.5s ease-in-out; }
    @keyframes shakeRed { 0%, 100% { transform: translateX(0); filter: drop-shadow(0 0 0 #f44); } 25% { transform: translateX(-5px); filter: drop-shadow(0 0 10px #f44); } 75% { transform: translateX(5px); filter: drop-shadow(0 0 10px #f44); } }
  `;
  document.head.insertAdjacentHTML('beforeend', `<style>${hqStyles}</style>`);

  // --- 2. HTML Inject ---
  const hqHtml = `
    <section class="section ds-section" id="habit-sec">
      <div class="section-header">
        <button class="chance-back-btn" style="position:absolute; top:20px; left:20px; z-index:100; cursor:pointer;" onclick="if(typeof dsGoToSection === 'function') dsGoToSection('hubPage', '')">◀ Ana Sayfa</button>
        <div class="section-badge" style="background:var(--a3); color:#fff;">⚔️ RYO Simülasyonu</div>
        <h2 class="section-title">Hayat RPG (HabitQuest)</h2>
        <p class="section-sub">Gerçek hayattaki alışkanlıklarını tamamla, canavarları (tembelliği) yen ve seviye atla!</p>
      </div>
      
      <div class="hq-wrap">
        
        <!-- Level Up Modal -->
        <div id="hqLvlModal" class="hq-lvlup-modal" onclick="this.style.display='none'">
           <div class="hq-lvlup-text">SEVİYE ATLADIN!</div>
           <div style="font-size:2rem; color:#fff;">Yeni Seviye: <span id="hqModalLvl">2</span></div>
           <p style="color:var(--tx2); margin-top:10px;">Max Can (HP) Arttı! Devam etmek için tıkla.</p>
        </div>

        <!-- Header / Character Sheet -->
        <div class="hq-header" id="hqCharSheet">
           <div class="hq-avatar-box">
              <div class="hq-avatar-visual">
                 <span id="hqAvBase">🧙‍♂️</span>
                 <div id="hqAvWep" class="hq-avatar-wep"></div>
                 <div id="hqAvPet" class="hq-avatar-pet"></div>
              </div>
              <div>
                 <h3 style="margin-bottom:5px; font-size:1.5rem;" id="hqName">Oyuncu</h3>
                 <p style="color:var(--a3); font-weight:bold; margin-bottom:10px;" id="hqTitle">Seviye 1 Çırak</p>
              </div>
           </div>
           
           <div class="hq-stats">
              <div class="hq-stat-row">
                 <div class="hq-stat-label" style="color:#f44">CAN</div>
                 <div class="hq-bar-bg">
                    <div class="hq-bar-fill hq-bar-hp" id="hqHpFill" style="width:100%;"></div>
                    <div class="hq-bar-text" id="hqHpText">100 / 100</div>
                 </div>
              </div>
              <div class="hq-stat-row">
                 <div class="hq-stat-label" style="color:#2196F3">XP</div>
                 <div class="hq-bar-bg">
                    <div class="hq-bar-fill hq-bar-xp" id="hqXpFill" style="width:0%;"></div>
                    <div class="hq-bar-text" id="hqXpText">0 / 100</div>
                 </div>
              </div>
           </div>

           <div class="hq-gold-box">
              <div style="font-size:0.8rem; color:var(--tx2); text-transform:uppercase;">Altın (G)</div>
              <div class="hq-gold-val" id="hqGoldVal">0</div>
           </div>
        </div>

        <!-- Layout -->
        <div class="hq-layout">
           
           <!-- Column 1: Dailies -->
           <div class="hq-col">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                 <h3 style="color:var(--a1)">📅 Günlük Alışkanlıklar</h3>
                 <span style="font-size:0.8rem; color:var(--tx3)">Her gece yarısı sıfırlanır.</span>
              </div>
              <div class="hq-add-form">
                 <input type="text" id="hqDailyInput" class="hq-input" placeholder="Yeni günlük alışkanlık ekle..." onkeypress="if(event.key==='Enter') hqAddTask('daily')">
                 <select id="hqDailyDiff" class="hq-select">
                    <option value="1">Kolay</option>
                    <option value="2">Orta</option>
                    <option value="3">Zor</option>
                 </select>
                 <button class="chance-action-btn" style="padding:0 15px;" onclick="hqAddTask('daily')">+</button>
              </div>
              <div class="hq-task-list" id="hqDailyList"></div>
           </div>

           <!-- Column 2: Todos -->
           <div class="hq-col">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                 <h3 style="color:var(--a2)">✔️ Tek Seferlik Görevler</h3>
                 <span style="font-size:0.8rem; color:var(--tx3)">Bitince listeden silinir.</span>
              </div>
              <div class="hq-add-form">
                 <input type="text" id="hqTodoInput" class="hq-input" placeholder="Yapılacak bir iş ekle..." onkeypress="if(event.key==='Enter') hqAddTask('todo')">
                 <select id="hqTodoDiff" class="hq-select">
                    <option value="1">Kolay</option>
                    <option value="2">Orta</option>
                    <option value="3">Zor</option>
                 </select>
                 <button class="chance-action-btn" style="padding:0 15px;" onclick="hqAddTask('todo')">+</button>
              </div>
              <div class="hq-task-list" id="hqTodoList"></div>
           </div>

        </div>

        <!-- Shop Section -->
        <h3 style="margin: 40px 0 15px 0; color:#ffea00; text-align:center; font-size:1.8rem;">🛒 Tüccar Kasabası (Market)</h3>
        <p style="text-align:center; color:var(--tx2); margin-bottom:20px;">Kazandığın altınlarla karakterine kozmetik eşyalar satın al!</p>
        
        <div class="ae-tabs" style="justify-content:center; margin-bottom:20px;">
           <div class="ae-tab active" onclick="hqSwitchShop('weapon')">Silahlar</div>
           <div class="ae-tab" onclick="hqSwitchShop('pet')">Evcil Hayvanlar</div>
        </div>

        <div class="hq-shop-grid" id="hqShopGrid">
           <!-- Populated by JS -->
        </div>

      </div>
    </section>
  `;
  document.body.insertAdjacentHTML('beforeend', hqHtml);

  // --- 3. Game Logic ---
  const hqConfig = {
     diffStats: {
        1: { xp: 10, gold: 5, name: 'Kolay', color: 'hq-diff-1', dmg: 10 },
        2: { xp: 25, gold: 15, name: 'Orta', color: 'hq-diff-2', dmg: 20 },
        3: { xp: 50, gold: 30, name: 'Zor', color: 'hq-diff-3', dmg: 35 }
     },
     shop: {
        weapon: [
           { id: 'w1', icon: '🗡️', name: 'Acemi Kılıcı', price: 50 },
           { id: 'w2', icon: '🏹', name: 'Avcı Yayı', price: 150 },
           { id: 'w3', icon: '🪄', name: 'Büyülü Asa', price: 300 },
           { id: 'w4', icon: '🎸', name: 'Rock Gitarı', price: 500 },
           { id: 'w5', icon: '🗡️', name: 'Efsanevi Kılıç (Parlama Efekti)', price: 1000 }
        ],
        pet: [
           { id: 'p1', icon: '🐈', name: 'Sokak Kedisi', price: 100 },
           { id: 'p2', icon: '🐕', name: 'Sadık Köpek', price: 200 },
           { id: 'p3', icon: '🐧', name: 'Kutup Pengueni', price: 400 },
           { id: 'p4', icon: '🦖', name: 'Yavru T-Rex', price: 800 },
           { id: 'p5', icon: '🐉', name: 'Kozmik Ejderha', price: 2000 }
        ]
     },
     titles: [
        'Çırak', 'Maceracı', 'Savaşçı', 'Şövalye', 'Kahraman', 'Efsane', 'Yarı Tanrı', 'Olimposlu'
     ]
  };

  let hq = {
     hp: 100, maxHp: 100,
     xp: 0, level: 1,
     gold: 0,
     tasks: [], // {id, text, diff:1|2|3, type:'daily'|'todo', completed:false, lastDate: null}
     inventory: [], // string IDs
     equipped: { weapon: null, pet: null }
  };

  let currentShopTab = 'weapon';

  // Audio synths for HQ
  const hqAudio = {
     ctx: null,
     init() { if(!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){} } },
     play(type, f, d, v=0.1) {
        if(!this.ctx) return;
        let o = this.ctx.createOscillator(); let g = this.ctx.createGain();
        o.type = type; o.frequency.setValueAtTime(f, this.ctx.currentTime);
        g.gain.setValueAtTime(v, this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime+d);
        o.connect(g); g.connect(this.ctx.destination);
        o.start(); o.stop(this.ctx.currentTime+d);
     },
     done() { this.play('sine', 800, 0.1, 0.1); setTimeout(()=>this.play('sine', 1200, 0.2, 0.1), 100); },
     lvlUp() { this.play('square', 400, 0.2, 0.1); setTimeout(()=>this.play('square', 600, 0.2, 0.1), 200); setTimeout(()=>this.play('square', 800, 0.4, 0.2), 400); },
     damage() { this.play('sawtooth', 150, 0.3, 0.2); }
  };

  // --- Core Functions ---
  function hqLoad() {
     let s = localStorage.getItem('ds_hq_save');
     if(s) {
        try { hq = {...hq, ...JSON.parse(s)}; } catch(e){}
     }
     hqCheckDailyReset();
     hqUpdateUI();
  }
  function hqSave() {
     localStorage.setItem('ds_hq_save', JSON.stringify(hq));
  }

  function hqCheckDailyReset() {
     let today = new Date().toDateString();
     hq.tasks.forEach(t => {
        if(t.type === 'daily') {
           if(t.lastDate !== today) {
              // Missed a daily task! Apply damage if it was incomplete from yesterday.
              // Note: We only punish if lastDate is set (meaning it was added before today) and completed is false.
              // For simplicity, if it's a new day, we just reset the 'completed' flag.
              // A strict punishment logic:
              if(!t.completed && t.lastDate && t.lastDate !== today) {
                 hqTakeDamage(hqConfig.diffStats[t.diff].dmg);
              }
              t.completed = false;
              t.lastDate = today;
           }
        }
     });
     hqSave();
  }

  function hqTakeDamage(amt) {
     hq.hp -= amt;
     if(hq.hp <= 0) {
        hq.hp = 0;
        // Level down
        if(hq.level > 1) {
           hq.level--;
           hq.maxHp -= 10;
           hq.hp = hq.maxHp;
           hq.xp = 0;
           toast('Öldün! Seviye kaybettin...', '#f44');
        } else {
           hq.hp = hq.maxHp;
           hq.xp = 0;
           hq.gold = Math.floor(hq.gold / 2);
           toast('Öldün! Altınlarının yarısını kaybettin...', '#f44');
        }
     } else {
        toast(`Görev kaçırdın! ${amt} Can (HP) kaybettin.`, '#ff9800');
     }
     
     // Visual FX
     let sheet = document.getElementById('hqCharSheet');
     sheet.classList.remove('hq-damage');
     void sheet.offsetWidth;
     sheet.classList.add('hq-damage');
     hqAudio.init(); hqAudio.damage();
  }

  function getRequiredXp() {
     return hq.level * 100;
  }

  function getTitle() {
     let idx = Math.floor((hq.level - 1) / 5);
     if(idx >= hqConfig.titles.length) idx = hqConfig.titles.length - 1;
     return 'Seviye ' + hq.level + ' ' + hqConfig.titles[idx];
  }

  function hqUpdateUI() {
     // Stats
     document.getElementById('hqTitle').textContent = getTitle();
     document.getElementById('hqHpText').textContent = `${hq.hp} / ${hq.maxHp}`;
     document.getElementById('hqHpFill').style.width = (hq.hp / hq.maxHp * 100) + '%';
     
     let reqXp = getRequiredXp();
     document.getElementById('hqXpText').textContent = `${hq.xp} / ${reqXp}`;
     document.getElementById('hqXpFill').style.width = (hq.xp / reqXp * 100) + '%';
     
     document.getElementById('hqGoldVal').textContent = hq.gold;

     // Avatar visuals
     if(hq.equipped.weapon) {
        let wData = hqConfig.shop.weapon.find(x => x.id === hq.equipped.weapon);
        if(wData) {
           document.getElementById('hqAvWep').textContent = wData.icon;
           if(wData.id === 'w5') document.getElementById('hqAvWep').style.filter = 'drop-shadow(0 0 10px #ffea00)';
           else document.getElementById('hqAvWep').style.filter = '';
        }
     } else { document.getElementById('hqAvWep').textContent = ''; }
     
     if(hq.equipped.pet) {
        let pData = hqConfig.shop.pet.find(x => x.id === hq.equipped.pet);
        if(pData) document.getElementById('hqAvPet').textContent = pData.icon;
     } else { document.getElementById('hqAvPet').textContent = ''; }

     // Lists
     let htmlDaily = ''; let htmlTodo = '';
     hq.tasks.forEach(t => {
        let dData = hqConfig.diffStats[t.diff];
        let card = `
           <div class="hq-task ${t.completed ? 'completed' : ''}" onclick="hqToggleTask('${t.id}')">
              <div class="hq-task-info">
                 <div class="hq-task-title">${t.text}</div>
                 <div class="hq-task-meta">
                    <span class="${dData.color}">● ${dData.name}</span>
                    <span>+${dData.xp} XP</span>
                    <span>+${dData.gold} G</span>
                 </div>
              </div>
              <div class="hq-task-actions">
                 <button class="hq-btn-done" onclick="event.stopPropagation(); hqToggleTask('${t.id}')">✓</button>
                 <button class="hq-btn-del" onclick="event.stopPropagation(); hqDelTask('${t.id}')">🗑️</button>
              </div>
           </div>
        `;
        if(t.type === 'daily') htmlDaily += card; else htmlTodo += card;
     });

     if(htmlDaily === '') htmlDaily = '<div style="color:var(--tx3); text-align:center; padding:20px;">Henüz alışkanlık eklenmedi.</div>';
     if(htmlTodo === '') htmlTodo = '<div style="color:var(--tx3); text-align:center; padding:20px;">Bekleyen görev yok.</div>';

     document.getElementById('hqDailyList').innerHTML = htmlDaily;
     document.getElementById('hqTodoList').innerHTML = htmlTodo;

     hqRenderShop();
  }

  window.hqAddTask = function(type) {
     hqAudio.init();
     let inp = document.getElementById(type === 'daily' ? 'hqDailyInput' : 'hqTodoInput');
     let sel = document.getElementById(type === 'daily' ? 'hqDailyDiff' : 'hqTodoDiff');
     
     if(inp.value.trim() === '') return;
     
     hq.tasks.push({
        id: 't_' + Date.now(),
        text: inp.value.trim(),
        diff: parseInt(sel.value),
        type: type,
        completed: false,
        lastDate: type === 'daily' ? new Date().toDateString() : null
     });
     
     inp.value = '';
     hqSave();
     hqUpdateUI();
  }

  window.hqDelTask = function(id) {
     hq.tasks = hq.tasks.filter(t => t.id !== id);
     hqSave();
     hqUpdateUI();
  }

  window.hqToggleTask = function(id) {
     hqAudio.init();
     let t = hq.tasks.find(x => x.id === id);
     if(!t || t.completed) return; // Prevent double trigger
     
     t.completed = true;
     let dData = hqConfig.diffStats[t.diff];
     
     // Gain Rewards
     hq.xp += dData.xp;
     hq.gold += dData.gold;
     hqAudio.done();

     // Check Level Up
     let reqXp = getRequiredXp();
     if(hq.xp >= reqXp) {
        hq.xp -= reqXp;
        hq.level++;
        hq.maxHp += 10;
        hq.hp = hq.maxHp;
        setTimeout(()=> {
           hqAudio.lvlUp();
           document.getElementById('hqModalLvl').textContent = hq.level;
           document.getElementById('hqLvlModal').style.display = 'flex';
           if(typeof spawnConfetti === 'function') spawnConfetti(); // from auction empire if loaded
        }, 300);
     }

     if(t.type === 'todo') {
        // Remove todo after completion automatically after 1s
        setTimeout(() => {
           hqDelTask(id);
        }, 1000);
     }

     hqSave();
     hqUpdateUI();
  }

  // --- Shop ---
  window.hqSwitchShop = function(cat) {
     let tabs = document.getElementById('hqShopGrid').previousElementSibling.querySelectorAll('.ae-tab');
     if(tabs && tabs.length === 2) {
        tabs[0].classList.remove('active'); tabs[1].classList.remove('active');
        if(cat === 'weapon') tabs[0].classList.add('active'); else tabs[1].classList.add('active');
     }
     currentShopTab = cat;
     hqRenderShop();
  }

  function hqRenderShop() {
     let items = hqConfig.shop[currentShopTab];
     let html = '';
     items.forEach(it => {
        let isOwned = hq.inventory.includes(it.id);
        let isEquipped = hq.equipped[currentShopTab] === it.id;
        
        let btnHtml = '';
        if(isEquipped) {
           btnHtml = `<button class="mini-btn" style="border-color:#4CAF50; color:#4CAF50;">Kuşanıldı</button>`;
        } else if(isOwned) {
           btnHtml = `<button class="chance-action-btn" onclick="hqEquipItem('${currentShopTab}', '${it.id}')">Kuşan</button>`;
        } else {
           let canBuy = hq.gold >= it.price;
           btnHtml = `<button class="chance-action-btn" style="${!canBuy ? 'opacity:0.5; cursor:not-allowed;' : ''}" onclick="${canBuy ? `hqBuyItem('${it.id}', ${it.price})` : ''}">Satın Al (${it.price} G)</button>`;
        }

        html += `
          <div class="hq-shop-item">
             <div class="hq-shop-icon">${it.icon}</div>
             <h4 style="font-size:1rem; margin-bottom:5px;">${it.name}</h4>
             ${btnHtml}
          </div>
        `;
     });
     document.getElementById('hqShopGrid').innerHTML = html;
  }

  window.hqBuyItem = function(id, price) {
     hqAudio.init();
     if(hq.gold < price) return toast('Altının yetmiyor!', '#f44');
     hq.gold -= price;
     hq.inventory.push(id);
     if(typeof aeAudio !== 'undefined') aeAudio.coin(); // reuse if exists
     toast('Eşya satın alındı!', '#aeea00');
     hqSave();
     hqUpdateUI();
  }

  window.hqEquipItem = function(cat, id) {
     hq.equipped[cat] = id;
     hqSave();
     hqUpdateUI();
  }

  // Load on start
  setTimeout(hqLoad, 500);

} catch(e) { console.error('HabitQuest error', e); }
