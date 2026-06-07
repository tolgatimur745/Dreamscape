/* =========================================================
   AUCTION EMPIRE SIMULATION (Açık Artırma İmparatorluğu)
   AAA Update: Audio, Bank, Black Market, Sets, AI Moods
========================================================= */
try {
  // 0. Audio Engine (Web Audio API)
  const aeAudio = {
    ctx: null,
    init() { if(!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){} } },
    playOsc(type, freq, dur, vol=0.1) {
      if(!this.ctx) return;
      let osc = this.ctx.createOscillator();
      let gain = this.ctx.createGain();
      osc.type = type; osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + dur);
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.start(); osc.stop(this.ctx.currentTime + dur);
    },
    tick() { this.playOsc('triangle', 400, 0.05, 0.05); },
    thud() { this.playOsc('sine', 100, 0.6, 0.8); }, // Gavel slam
    coin() { this.playOsc('sine', 1200, 0.1, 0.1); setTimeout(()=>this.playOsc('sine', 1800, 0.4, 0.15), 100); },
    error() { this.playOsc('sawtooth', 200, 0.3, 0.1); }
  };

  // 1. Inject Styles
  const aeStyles = `
    .ae-wrap { font-family: 'Outfit', sans-serif; color: var(--tx); position: relative; }
    .ae-header { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; background: rgba(0,0,0,0.3); border-radius: 15px; border: 1px solid var(--gb); margin-bottom: 20px; flex-wrap:wrap; gap:10px; }
    .ae-stat { display: flex; flex-direction: column; align-items: center; flex:1; min-width:80px;}
    .ae-stat span { font-size: 0.75rem; color: var(--tx3); text-transform: uppercase; }
    .ae-stat strong { font-size: 1.4rem; color: var(--a3); font-weight: 800; transition: color 0.3s; }
    
    .ae-tabs { display: flex; gap: 10px; margin-bottom: 20px; overflow-x: auto; padding-bottom: 5px; }
    .ae-tab { padding: 10px 20px; background: var(--glass); border: 1px solid var(--gb); border-radius: 100px; color: var(--tx2); cursor: pointer; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); white-space: nowrap; }
    .ae-tab:hover { background: rgba(255,255,255,0.05); transform: translateY(-2px); }
    .ae-tab.active { background: linear-gradient(135deg, var(--a1), var(--a3)); color: #fff; border-color: transparent; font-weight: bold; transform: scale(1.05); box-shadow: 0 5px 15px rgba(0,229,255,0.3); }
    
    .ae-panel { display: none; animation: aeFade 0.3s; }
    .ae-panel.active { display: block; }
    @keyframes aeFade { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

    /* Dashboard & Bank */
    .ae-news-box { background: rgba(255,234,0,0.1); border: 1px solid rgba(255,234,0,0.3); padding: 15px; border-radius: 10px; margin-bottom: 20px; display: flex; align-items: center; gap: 15px; }
    .ae-news-icon { font-size: 2rem; animation: pulse 2s infinite; }
    .ae-bank-box { background: rgba(244, 67, 54, 0.1); border: 1px solid rgba(244, 67, 54, 0.3); padding: 15px; border-radius: 10px; flex:1; min-width:250px; }
    
    /* Grid & Cards */
    .ae-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 15px; }
    .ae-card { background: var(--glass); border: 1px solid var(--gb); border-radius: 15px; padding: 15px; display: flex; flex-direction: column; gap: 10px; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); position: relative; overflow: hidden; }
    .ae-card:hover { border-color: var(--a3); transform: translateY(-5px) scale(1.02); box-shadow: 0 10px 20px rgba(0,0,0,0.4); }
    .ae-item-icon { font-size: 3.5rem; text-align: center; padding: 20px; background: rgba(0,0,0,0.2); border-radius: 10px; margin-bottom: 5px; transition: transform 0.3s; }
    .ae-card:hover .ae-item-icon { transform: scale(1.1); }
    .ae-rarity-1 { color: #aaa; } .ae-rarity-2 { color: #4CAF50; } .ae-rarity-3 { color: #2196F3; } .ae-rarity-4 { color: #9C27B0; text-shadow: 0 0 10px #9C27B0; }
    
    /* Bidding Room */
    .ae-room { display: flex; gap: 20px; flex-wrap: wrap; }
    .ae-room-item { flex: 1; min-width: 250px; background: var(--glass); border: 1px solid var(--gb); border-radius: 15px; padding: 20px; text-align: center; animation: aeFade 0.4s; position:relative; }
    .ae-bidders { flex: 1; min-width: 250px; display: flex; flex-direction: column; gap: 10px; animation: aeFade 0.5s; position:relative; }
    .ae-bid-log { flex: 1; background: rgba(0,0,0,0.4); border-radius: 10px; padding: 10px; overflow-y: auto; max-height: 250px; display: flex; flex-direction: column; gap: 5px; font-size: 0.85rem; scroll-behavior: smooth; }
    .ae-bid-msg { padding: 5px 10px; background: rgba(255,255,255,0.05); border-radius: 5px; animation: slideInLeft 0.2s ease-out; display:flex; align-items:center; gap:8px;}
    @keyframes slideInLeft { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
    .ae-bid-msg.me { background: rgba(0,229,255,0.15); border-left: 3px solid var(--a3); }
    
    .ae-bid-controls { display: flex; gap: 10px; margin-top: 15px; }
    .ae-bid-btn { position: relative; overflow: hidden; flex: 1; padding: 12px; background: linear-gradient(135deg, var(--a1), var(--a2)); border: none; border-radius: 10px; color: white; font-weight: bold; cursor: pointer; transition: all 0.2s; }
    .ae-bid-btn::after { content:''; position:absolute; top:-50%; left:-50%; width:200%; height:200%; background:rgba(255,255,255,0.1); transform:rotate(45deg) translateY(100%); transition: transform 0.3s; }
    .ae-bid-btn:hover:not(:disabled)::after { transform:rotate(45deg) translateY(-100%); }
    .ae-bid-btn:hover:not(:disabled) { transform: scale(1.05); box-shadow: 0 5px 15px rgba(0,229,255,0.4); }
    .ae-bid-btn:active:not(:disabled) { transform: scale(0.95); }
    .ae-bid-btn:disabled { opacity: 0.5; cursor: not-allowed; filter: grayscale(1); }
    
    /* Gavel & Confetti */
    .ae-gavel { position:absolute; top:50%; left:50%; transform:translate(-50%, -50%) rotate(-45deg); font-size:10rem; opacity:0; pointer-events:none; z-index:100; }
    @keyframes gavelSlam { 0% { opacity:0; transform:translate(-50%, -100%) rotate(0deg); } 20% { opacity:1; transform:translate(-50%, -50%) rotate(-45deg); } 80% { opacity:1; transform:translate(-50%, -50%) rotate(-45deg); } 100% { opacity:0; transform:translate(-50%, 0%) rotate(45deg); } }
    .ae-confetti { position:absolute; width:10px; height:10px; background:var(--a3); animation:fall 2s linear forwards; pointer-events:none; }
    @keyframes fall { to { transform:translateY(100vh) rotate(720deg); opacity:0; } }

    /* Upgrades */
    .ae-up-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; }
    .ae-up-card { background: var(--glass); border: 1px solid var(--gb); padding: 15px; border-radius: 15px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 8px; transition: 0.3s; }
    .ae-up-card:hover { border-color: var(--a5); transform: translateY(-3px); }
    .ae-up-card.maxed { border-color: var(--a5); background: rgba(255,234,0,0.05); }
    .ae-progress { width: 100%; height: 6px; background: rgba(0,0,0,0.5); border-radius: 5px; overflow: hidden; margin: 5px 0; }
    .ae-progress-fill { height: 100%; background: var(--a3); transition: width 0.1s linear; }

    /* Modal */
    .ae-modal-overlay { display: none; position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.85); z-index:99999; justify-content:center; align-items:center; backdrop-filter: blur(5px); }
    .ae-modal-content { background: var(--bg); border: 1px solid var(--a3); padding: 30px; border-radius: 20px; text-align: center; max-width: 400px; width: 90%; animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); box-shadow: 0 20px 50px rgba(0,0,0,0.5); position:relative;}
    @keyframes popIn { from { opacity: 0; transform: scale(0.8) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    
    .ae-set-badge { display:inline-block; padding:3px 8px; background:var(--a1); color:#fff; border-radius:5px; font-size:0.7rem; font-weight:bold; margin-top:5px;}
    .ae-bm-btn { display:none; background:linear-gradient(45deg, #000, #f44); border:1px solid #f44; color:#fff; animation: pulse 1s infinite; }
  `;
  document.head.insertAdjacentHTML('beforeend', `<style>${aeStyles}</style>`);

  // 2. Inject HTML
  const aeHtml = `
    <section class="section ds-section" id="auction-sec">
      <div class="section-header">
        <button class="chance-back-btn" style="position:absolute; top:20px; left:20px; z-index:100; cursor:pointer;" onclick="if(typeof dsGoToSection === 'function') dsGoToSection('hubPage', '')">◀ Ana Sayfa</button>
        <div class="section-badge">💰 AAA Simülasyon</div>
        <h2 class="section-title">Açık Artırma İmparatorluğu</h2>
        <p class="section-sub">Müzayedelere katıl, koleksiyonları tamamla, piyasayı ele geçir.</p>
      </div>
      
      <div class="ae-wrap" style="max-width: 1000px; margin: 0 auto;" id="aeWrapper">
        <div id="aeGavel" class="ae-gavel">🔨</div>
        
        <!-- Pazarlık Modal -->
        <div id="aePazarlikModal" class="ae-modal-overlay">
           <div class="ae-modal-content">
              <h3 style="color:var(--a3); margin-bottom:10px;">🤝 Müşteri Teklifi</h3>
              <p style="margin-bottom:20px; color:var(--tx2); font-size:0.95rem;">
                 Alıcı bu eşya için <strong style="color:var(--a4); font-size:1.4rem; display:block; margin:10px 0;" id="pzBasePrice">$0</strong> teklif ediyor.
              </p>
              <div style="display:flex; flex-direction:column; gap:12px;">
                 <button class="chance-action-btn" style="padding:12px;" onclick="aePazarlikResolve('accept')">El Sıkış (100% Garanti)</button>
                 <button class="chance-choice-btn" style="padding:12px; border-color:var(--a5); color:var(--a5);" onclick="aePazarlikResolve('push')">Zorla (+%15 Kâr, %70 İhtimal)</button>
                 <button class="chance-choice-btn" style="padding:12px; border-color:#f44; color:#f44;" onclick="aePazarlikResolve('hard')">Agresif Pazarlık (+%35 Kâr, %40 İhtimal)</button>
                 <button class="mini-btn" style="margin-top:10px; padding:10px;" onclick="document.getElementById('aePazarlikModal').style.display='none'">Satmaktan Vazgeç</button>
              </div>
           </div>
        </div>

        <!-- Loan Modal -->
        <div id="aeLoanModal" class="ae-modal-overlay">
           <div class="ae-modal-content">
              <h3 style="color:#f44; margin-bottom:10px;">🏦 Banka Kredisi</h3>
              <p style="margin-bottom:20px; color:var(--tx2); font-size:0.9rem;">
                 Acil nakite mi ihtiyacın var? Bankadan %20 faizle anında 10.000$ kredi çekebilirsin.
                 <br><strong style="color:#f44">Dikkat: 3 dakika içinde ödemezsen banka en değerli eşyana el koyar!</strong>
              </p>
              <button class="chance-action-btn" style="padding:15px; width:100%; background:#f44; border:none; color:#fff;" onclick="aeTakeLoan()">10.000$ Kredi Çek</button>
              <button class="mini-btn" style="margin-top:15px; width:100%;" onclick="document.getElementById('aeLoanModal').style.display='none'">İptal</button>
           </div>
        </div>

        <!-- Global Header -->
        <div class="ae-header">
          <div class="ae-stat" onclick="aeAudio.init()"><span>Nakit Kasa</span><strong id="aeNakit">$1,000</strong></div>
          <div class="ae-stat"><span>Net Servet</span><strong id="aeNetWorth">$1,000</strong></div>
          <div class="ae-stat"><span>Depo</span><strong id="aeDepo">0/5</strong></div>
          <div class="ae-stat"><span>Prestij</span><strong id="aePrestij">0</strong></div>
          <button id="btnBlackMarket" class="ae-tab ae-bm-btn" onclick="aeSwitchTab('blackmarket')">🕵️ Kara Borsa</button>
        </div>
        
        <!-- Tabs -->
        <div class="ae-tabs" onclick="aeAudio.init()">
          <div class="ae-tab active" onclick="aeSwitchTab('dash')">🏢 Karargah</div>
          <div class="ae-tab" onclick="aeSwitchTab('auctions')">⚖️ Müzayedeler</div>
          <div class="ae-tab" onclick="aeSwitchTab('inventory')">📦 Koleksiyon & Satış</div>
          <div class="ae-tab" onclick="aeSwitchTab('upgrades')">📈 Yetenekler</div>
        </div>

        <!-- DASHBOARD -->
        <div id="ae-dash" class="ae-panel active">
          <div class="ae-news-box" id="aeNewsBox" style="display:none;">
            <div class="ae-news-icon">📰</div>
            <div>
              <h4 style="margin-bottom:3px; color:var(--a5);">Son Dakika Haberi</h4>
              <p id="aeNewsText" style="font-size:0.9rem; color:var(--tx2);"></p>
            </div>
          </div>
          <div style="display:flex; gap:20px; flex-wrap:wrap;">
            <div style="flex:1; min-width:250px; background:var(--glass); border:1px solid var(--gb); padding:20px; border-radius:15px;">
              <h3 style="margin-bottom:15px; color:var(--a3);">Genel Durum</h3>
              <p style="font-size:0.9rem; margin-bottom:8px;">Katılınan Müzayede: <strong id="stTotalAuc" style="color:#fff;">0</strong></p>
              <p style="font-size:0.9rem; margin-bottom:8px;">Kazanılan Eşya: <strong id="stWon" style="color:#fff;">0</strong></p>
              <p style="font-size:0.9rem; margin-bottom:8px;">Toplam Kâr: <strong id="stProfit" style="color:var(--a4);">$0</strong></p>
              <button class="mini-btn" style="margin-top:15px; width:100%; border-color:#f44; color:#f44;" onclick="aeResetGame()">İflas Ettim (Sıfırla)</button>
            </div>
            
            <div class="ae-bank-box" id="aeBankPanel">
              <h3 style="color:#f44; margin-bottom:10px;">🏦 Banka</h3>
              <div id="bankNoLoan">
                 <p style="font-size:0.85rem; color:var(--tx2); margin-bottom:10px;">Aktif borcun bulunmuyor. Acil nakit ihtiyacı için kredi çekebilirsin.</p>
                 <button class="chance-choice-btn" style="width:100%; border-color:#f44; color:#f44;" onclick="document.getElementById('aeLoanModal').style.display='flex'">Kredi Çek</button>
              </div>
              <div id="bankHasLoan" style="display:none;">
                 <p style="font-size:0.9rem; color:#fff; margin-bottom:5px;">Borç Miktarı: <strong style="color:#f44" id="blAmount">$12,000</strong></p>
                 <p style="font-size:0.9rem; margin-bottom:15px;">Kalan Süre: <strong style="color:var(--a5)" id="blTime">180s</strong></p>
                 <button class="chance-action-btn" style="width:100%; padding:10px;" id="btnPayLoan" onclick="aePayLoan()">Borcu Öde</button>
              </div>
            </div>

            <div style="flex:1; min-width:250px; background:var(--glass); border:1px solid var(--gb); padding:20px; border-radius:15px; text-align:center;">
              <h3>Nihai Hedef</h3>
              <p style="font-size:0.85rem; color:var(--tx3); margin:10px 0;">50 Milyon $ net servete ulaş ve tüm Müzayede Salonunu satın alarak oyunu kazan!</p>
              <button id="aeEndGameBtn" class="chance-action-btn" style="padding:10px 20px; width:100%;" disabled>Salonu Satın Al ($50M)</button>
            </div>
          </div>
        </div>

        <!-- AUCTIONS LIST -->
        <div id="ae-auctions" class="ae-panel">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
            <h3>Aktif Müzayedeler</h3>
            <button class="mini-btn" onclick="aeRefreshAuctions()">🔄 Yenile ($50)</button>
          </div>
          <div class="ae-grid" id="aeAuctionGrid"></div>
        </div>

        <!-- BIDDING ROOM -->
        <div id="ae-room" class="ae-panel">
          <div class="ae-room">
            <!-- Item Info -->
            <div class="ae-room-item" id="rmItemBox">
              <div id="rmIcon" class="ae-item-icon" style="font-size:5rem;">❓</div>
              <h3 id="rmTitle" style="margin-bottom:5px;">Eşya Adı</h3>
              <div id="rmSet" style="display:none;" class="ae-set-badge"></div>
              <p id="rmDesc" style="font-size:0.85rem; color:var(--tx3); margin:10px 0;">Açıklama</p>
              
              <div style="background:rgba(0,0,0,0.3); padding:10px; border-radius:10px; margin-bottom:15px;">
                <p style="font-size:0.8rem; color:var(--tx2);">Tahmini Değerin:</p>
                <strong id="rmEst" style="font-size:1.2rem; color:var(--a5);">$0 - $0</strong>
              </div>
              <p style="font-size:0.85rem;">Risk (Sahte Olma): <strong id="rmRisk" style="color:var(--a2);">Gizli</strong></p>
            </div>
            
            <!-- Bidding War -->
            <div class="ae-bidders">
              <h3 style="text-align:center; color:var(--a2); transition: transform 0.2s;" id="rmCurrentBidWrapper">Teklif: <span id="rmCurrentBid">$0</span></h3>
              <div class="ae-bid-log" id="rmLog"></div>
              
              <!-- Timer bar -->
              <div class="ae-progress" style="height:12px; background:rgba(255,0,0,0.2);">
                <div id="rmTimerBar" class="ae-progress-fill" style="background:linear-gradient(90deg, var(--a1), var(--a2)); width:100%;"></div>
              </div>

              <div class="ae-bid-controls">
                <button class="ae-bid-btn" id="btnBid1">+ $10</button>
                <button class="ae-bid-btn" id="btnBid2">+ $100</button>
                <button class="ae-bid-btn" id="btnBid3">+ $1000</button>
              </div>
              <button class="mini-btn" id="btnLeaveAuc" style="margin-top:10px; width:100%; padding:10px; border-color:var(--a2); color:var(--a2);">🏃 Çekil (Pes Et)</button>
            </div>
          </div>
        </div>

        <!-- INVENTORY / SETS -->
        <div id="ae-inventory" class="ae-panel">
          <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:15px;">
             <div>
                <h3>Depom (<span id="invCount">0</span>/<span id="invMax">5</span>)</h3>
                <p style="font-size:0.85rem; color:var(--tx3); margin-top:5px;">Setleri tamamlayarak 5 katı kâr elde et!</p>
             </div>
             <div id="aeSetSummary" style="font-size:0.85rem; background:rgba(0,0,0,0.3); padding:8px 15px; border-radius:10px; border:1px solid var(--a3);">
                <!-- Populated by JS -->
             </div>
          </div>
          <div class="ae-grid" id="aeInvGrid"></div>
        </div>

        <!-- UPGRADES -->
        <div id="ae-upgrades" class="ae-panel">
          <h3 style="margin-bottom:15px;">Yetenek Ağacı</h3>
          <div class="ae-up-grid" id="aeUpGrid"></div>
        </div>

        <!-- BLACK MARKET -->
        <div id="ae-blackmarket" class="ae-panel">
           <h2 style="color:#f44; text-align:center; margin-bottom:5px;">🏴 Kara Borsa</h2>
           <p style="text-align:center; color:var(--tx2); font-size:0.85rem; margin-bottom:20px;">Polis baskınına uğrama ihtimali var. Aldığın risk senin sorumluluğundadır.</p>
           <div class="ae-grid" id="aeBmGrid"></div>
        </div>

      </div>
    </section>
  `;
  document.body.insertAdjacentHTML('beforeend', aeHtml);

  // ==========================================
  // AE GAME LOGIC & DATA
  // ==========================================

  const AE_SETS = {
    'retro': { n: 'Nostaljik Retro Seti', req: 3, mult: 5 },
    'art': { n: 'Rönesans Sanat Seti', req: 3, mult: 5 },
    'history': { n: 'Tarihin Tozlu Rafları', req: 4, mult: 5 }
  };

  const AE_CATS = {
    1: { name: 'Başlangıç', minVal: 100, maxVal: 1500, items: [
      { i: '🎮', n: 'Retro Atari Konsolu', set: 'retro' }, { i: '📠', n: 'Tozlu Daktilo', set: 'history' }, { i: '🧸', n: 'Nostaljik Ayıcık', set: null }, { i: '📻', n: 'Eski Radyo', set: 'retro' }, { i: '🚲', n: 'Paslı Bisiklet', set: null }
    ]},
    2: { name: 'Orta Seviye', minVal: 2000, maxVal: 15000, items: [
      { i: '⌚', n: 'Antika Cep Saati', set: 'history' }, { i: '🏺', n: 'Roma Çömleği', set: 'history' }, { i: '🎸', n: 'İmzalı Gitar', set: null }, { i: '📺', n: 'Tüplü Televizyon', set: 'retro' }, { i: '🛋️', n: 'Victorian Koltuk', set: null }
    ]},
    3: { name: 'İleri Seviye', minVal: 20000, maxVal: 250000, items: [
      { i: '🏎️', n: '1960 Klasik Spor Araba', set: null }, { i: '👑', n: 'Kraliyet Mücevheri', set: 'history' }, { i: '🖼️', n: 'Rönesans Yağlıboya', set: 'art' }, { i: '🎨', n: 'Eski Palet', set: 'art' }, { i: '🗡️', n: 'Samuray Kılıcı', set: null }
    ]},
    4: { name: 'Efsanevi', minVal: 500000, maxVal: 10000000, items: [
      { i: '💎', n: 'Kayıp Kaşıkçı Elması', set: null }, { i: '🖼️', n: 'Orijinal Da Vinci Eskizi', set: 'art' }, { i: '🚀', n: 'Apollo 11 Parçası', set: null }, { i: '👑', n: 'Firavun Maskesi', set: 'history' }
    ]}
  };

  const AE_AI = [
    { name: 'Acemi Ali', avatar: '👦', risk: 0.1, aggro: 0.2, budget: 0.4 },
    { name: 'Koleksiyoner Can', avatar: '🧐', risk: 0.3, aggro: 0.5, budget: 0.75 },
    { name: 'Agresif Ayşe', avatar: '👩‍🎤', risk: 0.6, aggro: 0.9, budget: 0.6 },
    { name: 'Milyarder Kont', avatar: '🎩', risk: 0.2, aggro: 0.6, budget: 1.1 },
    { name: 'Kumarbaz Veli', avatar: '🃏', risk: 0.9, aggro: 0.8, budget: 0.8 }
  ];

  const AE_UPGRADES = {
    expert: { n: 'Ekspertiz Seviyesi', d: 'Değer tahminindeki hata payını azaltır.', max: 5, baseCost: 500, mult: 2.5, effect: (lvl) => [50, 35, 20, 10, 5, 1][lvl] },
    risk: { n: 'Risk Analizi', d: 'Eşyanın sahte çıkma ihtimalini ifşa eder.', max: 3, baseCost: 1500, mult: 3, effect: (lvl) => lvl > 0 },
    storage: { n: 'Depo Kapasitesi', d: 'Depolayabileceğin maksimum eşya sayısı.', max: 5, baseCost: 300, mult: 2, effect: (lvl) => 5 + (lvl*5) },
    network: { n: 'VIP Ağ (Network)', d: 'Daha üst düzey müzayede ve Kara Borsa ihtimalini artırır.', max: 4, baseCost: 2000, mult: 3, effect: (lvl) => lvl },
    bargain: { n: 'Komisyon İndirimi', d: 'Satışlarda kesilen müzayede komisyonunu düşürür.', max: 5, baseCost: 1000, mult: 2, effect: (lvl) => Math.max(0, 15 - (lvl*3)) }
  };

  const AE_EVENTS = [
    { txt: 'Retro elektronik çılgınlığı! İnsanlar eski eşyalara saldırıyor.', mult: 1.5, cat: 1 },
    { txt: 'Müze soygunu! Sanat eserlerine güven düştü.', mult: 0.6, cat: 3 },
    { txt: 'Milyarderler kulübü trend arıyor, efsanevi eserler tavan yaptı!', mult: 2.0, cat: 4 },
    { txt: 'Antikalara ilgi azaldı, fiyatlar dipte.', mult: 0.7, cat: 2 },
    { txt: 'Ekonomik kriz! Harcamalar bıçak gibi kesildi.', mult: 0.5, cat: -1 } 
  ];

  let ae = {
    money: 1000,
    prestige: 0,
    inv: [],
    up: { expert:0, risk:0, storage:0, network:0, bargain:0 },
    stats: { won:0, totalAuc:0, profit:0 },
    news: null,
    newsDaysLeft: 0,
    loan: { amount:0, timeLeft:0, active:false },
    bmActive: false,
    owned: false
  };

  // --- GLOBALS ---
  let actAuc = null; 
  let actTimer = null;
  let bankInterval = null;

  // --- SAVE / LOAD ---
  function aeLoad() {
    let saved = localStorage.getItem('ds_auction_save_v2');
    if(saved) {
      try {
        let p = JSON.parse(saved);
        ae = {...ae, ...p};
        if(!ae.loan) ae.loan = {amount:0, timeLeft:0, active:false};
      } catch(e) {}
    }
    startBankTick();
    aeUpdateUI();
  }
  function aeSave() {
    localStorage.setItem('ds_auction_save_v2', JSON.stringify(ae));
  }

  // --- AUDIO / FX ---
  function spawnConfetti() {
     let wrap = document.getElementById('aeWrapper');
     for(let i=0; i<30; i++) {
        let c = document.createElement('div');
        c.className = 'ae-confetti';
        c.style.left = (Math.random() * 100) + '%';
        c.style.background = ['#4CAF50','#2196F3','#FFEB3B','#9C27B0'][Math.floor(Math.random()*4)];
        c.style.animationDuration = (1 + Math.random()) + 's';
        wrap.appendChild(c);
        setTimeout(()=>c.remove(), 2000);
     }
  }

  // --- UI MGMT ---
  function aeSwitchTab(tabId) {
    aeAudio.init();
    if(actTimer) { clearInterval(actTimer); actTimer = null; }
    actAuc = null;
    let b1 = document.getElementById('btnBid1'); if(b1) b1.disabled = false;
    let b2 = document.getElementById('btnBid2'); if(b2) b2.disabled = false;
    let b3 = document.getElementById('btnBid3'); if(b3) b3.disabled = false;
    let bl = document.getElementById('btnLeaveAuc'); if(bl) bl.disabled = false;

    document.querySelectorAll('.ae-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.ae-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('ae-' + tabId).classList.add('active');
    
    // Find active tab safely
    if(tabId!=='room') {
       document.querySelectorAll('.ae-tab').forEach(t => {
          if(t.getAttribute('onclick') && t.getAttribute('onclick').includes(tabId)) t.classList.add('active');
       });
    }

    if(tabId === 'auctions') renderAuctionsList();
    if(tabId === 'inventory') renderInventory();
    if(tabId === 'upgrades') renderUpgrades();
    if(tabId === 'blackmarket') renderBlackMarket();
    if(tabId === 'dash') {
       if(ae.owned) {
          document.getElementById('aeEndGameBtn').textContent = "👑 Müzayede Salonu Senin!";
          document.getElementById('aeEndGameBtn').disabled = true;
          document.getElementById('aeEndGameBtn').style.background = "var(--a5)";
       } else if(getNetWorth() >= 50000000) {
          document.getElementById('aeEndGameBtn').disabled = false;
       }
    }
  }
  window.aeSwitchTab = aeSwitchTab;

  function aeFormatM(num) { return '$' + Math.floor(num).toLocaleString('en-US'); }
  function getNetWorth() { let w = ae.money; ae.inv.forEach(i => w += i.realValue); return w; }

  function aeUpdateUI() {
    let oldMoney = parseInt(document.getElementById('aeNakit').textContent.replace(/[^0-9]/g, '')) || 0;
    document.getElementById('aeNakit').textContent = aeFormatM(ae.money);
    
    if(oldMoney !== ae.money && oldMoney !== 0) {
      document.getElementById('aeNakit').style.color = ae.money > oldMoney ? '#aeea00' : '#f44';
      setTimeout(() => document.getElementById('aeNakit').style.color = 'var(--a3)', 500);
    }

    document.getElementById('aeNetWorth').textContent = aeFormatM(getNetWorth());
    document.getElementById('aeDepo').textContent = ae.inv.length + '/' + AE_UPGRADES.storage.effect(ae.up.storage);
    document.getElementById('aePrestij').textContent = ae.prestige;
    document.getElementById('stTotalAuc').textContent = ae.stats.totalAuc;
    document.getElementById('stWon').textContent = ae.stats.won;
    document.getElementById('stProfit').textContent = aeFormatM(ae.stats.profit);

    if(ae.news && ae.newsDaysLeft > 0) {
      document.getElementById('aeNewsBox').style.display = 'flex';
      document.getElementById('aeNewsText').textContent = ae.news.txt;
    } else { document.getElementById('aeNewsBox').style.display = 'none'; }

    // Bank
    if(ae.loan.active) {
       document.getElementById('bankNoLoan').style.display = 'none';
       document.getElementById('bankHasLoan').style.display = 'block';
       document.getElementById('blAmount').textContent = aeFormatM(ae.loan.amount);
       document.getElementById('blTime').textContent = ae.loan.timeLeft + 's';
       document.getElementById('btnPayLoan').disabled = (ae.money < ae.loan.amount);
    } else {
       document.getElementById('bankNoLoan').style.display = 'block';
       document.getElementById('bankHasLoan').style.display = 'none';
    }

    // Black Market Button
    let bmBtn = document.getElementById('btnBlackMarket');
    if(ae.bmActive) bmBtn.style.display = 'inline-block';
    else bmBtn.style.display = 'none';

    aeSave();
  }

  // --- BANK SYSTEM ---
  window.aeTakeLoan = function() {
     aeAudio.init();
     if(ae.loan.active) return toast('Zaten aktif bir kredin var!', '#f44');
     ae.money += 10000;
     ae.loan = { amount: 12000, timeLeft: 180, active: true }; // 3 mins, 20% interest
     aeAudio.coin();
     document.getElementById('aeLoanModal').style.display = 'none';
     toast('Banka hesaba 10.000$ yatırdı. 3 dakika içinde 12.000$ olarak geri öde!', '#aeea00');
     aeUpdateUI();
  }
  
  window.aePayLoan = function() {
     if(!ae.loan.active) return;
     if(ae.money < ae.loan.amount) return toast('Yeterli nakitin yok!', '#f44');
     ae.money -= ae.loan.amount;
     ae.loan.active = false;
     ae.loan.amount = 0;
     aeAudio.coin();
     toast('Kredi başarıyla ödendi!', '#aeea00');
     aeUpdateUI();
  }

  function startBankTick() {
     if(bankInterval) clearInterval(bankInterval);
     bankInterval = setInterval(() => {
        // Loan logic
        if(ae.loan.active && ae.loan.timeLeft > 0) {
           ae.loan.timeLeft--;
           if(ae.loan.timeLeft <= 0) { // Defaulted!
              aeAudio.error();
              if(ae.money >= ae.loan.amount) {
                 ae.money -= ae.loan.amount;
                 toast('Kredi süresi doldu! Banka parayı hesabından zorla tahsil etti.', '#f44');
              } else {
                 ae.money = 0;
                 if(ae.inv.length > 0) {
                    // Confiscate highest value item
                    ae.inv.sort((a,b) => getMarketValue(b) - getMarketValue(a));
                    let seized = ae.inv.shift();
                    toast('İFLAS! Banka kredini ödeyemediğin için depondan ' + seized.name + ' adlı eşyaya el koydu!', '#f44');
                 } else {
                    toast('Bankaya borcun var ama alacak hiçbir şeyin yok. Yırttın!', '#aeea00');
                 }
              }
              ae.loan.active = false;
              ae.loan.amount = 0;
           }
           aeUpdateUI();
        }
        // Black market random logic
        if(!ae.bmActive && Math.random() < (0.01 + ae.up.network*0.01)) {
           ae.bmActive = true;
           aeUpdateUI();
        }
        // Passive income if owned
        if(ae.owned && Math.random() < 0.2) {
           let income = Math.floor(Math.random() * 5000) + 1000;
           ae.money += income;
           toast('Müzayede Salonundan komisyon geliri: ' + aeFormatM(income), '#00e5ff');
           aeUpdateUI();
        }
     }, 1000);
  }

  // --- AUCTION GENERATOR ---
  let currentAuctions = [];
  function aeRefreshAuctions(cost = 0) {
    aeAudio.init();
    if(ae.money < cost) return toast('Yetersiz bakiye!', '#f44');
    ae.money -= cost;
    
    if(ae.newsDaysLeft > 0) ae.newsDaysLeft--;
    if(ae.newsDaysLeft <= 0 && Math.random() < 0.3) {
      ae.news = AE_EVENTS[Math.floor(Math.random() * AE_EVENTS.length)];
      ae.newsDaysLeft = 3;
      toast('Yeni bir haber piyasayı sarsıyor!', '#ffea00');
    }
    
    // Close black market randomly on refresh
    if(ae.bmActive && Math.random() < 0.3) {
       ae.bmActive = false;
       if(document.getElementById('ae-blackmarket').classList.contains('active')) aeSwitchTab('dash');
    }

    currentAuctions = [];
    let netw = getNetWorth();
    for(let i=0; i<3; i++) {
      let maxCat = 1;
      if(netw > 10000 || ae.up.network >= 1) maxCat = 2;
      if(netw > 100000 || ae.up.network >= 2) maxCat = 3;
      if(netw > 1000000 || ae.up.network >= 3) maxCat = 4;
      
      let catLevel = Math.floor(Math.random() * maxCat) + 1;
      let catData = AE_CATS[catLevel];
      let baseItem = catData.items[Math.floor(Math.random() * catData.items.length)];
      
      let realVal = Math.floor(Math.random() * (catData.maxVal - catData.minVal) + catData.minVal);
      let isFake = Math.random() < 0.15;
      if(isFake) realVal = Math.floor(realVal * 0.1);
      
      let startBid = Math.floor(realVal * (0.2 + Math.random()*0.3)); 
      
      currentAuctions.push({ id: Date.now() + i, name: baseItem.n, icon: baseItem.i, cat: catLevel, realValue: realVal, startBid: startBid, isFake: isFake, set: baseItem.set });
    }
    aeUpdateUI();
    renderAuctionsList();
  }
  window.aeRefreshAuctions = aeRefreshAuctions;

  function getEstimatedRange(realVal) {
    let errPct = AE_UPGRADES.expert.effect(ae.up.expert) / 100;
    let min = Math.floor(realVal * (1 - errPct));
    let max = Math.floor(realVal * (1 + errPct));
    return aeFormatM(min) + ' - ' + aeFormatM(max);
  }

  function renderAuctionsList() {
    if(currentAuctions.length === 0) aeRefreshAuctions(0);
    let html = '';
    currentAuctions.forEach((a, i) => {
      let est = getEstimatedRange(a.realValue);
      let riskStr = ae.up.risk > 0 ? (a.isFake ? '<span style="color:#f44; font-weight:bold;">YÜKSEK (SAHTE)</span>' : '<span style="color:#4CAF50">DÜŞÜK (ORİJİNAL)</span>') : 'Bilinmiyor';
      let setHtml = a.set ? `<div class="ae-set-badge">${AE_SETS[a.set].n} Parçası</div>` : '';
      
      html += `
        <div class="ae-card">
          <div class="ae-item-icon ae-rarity-${a.cat}">${a.icon}</div>
          <h4 style="margin:5px 0;">${a.name}</h4>
          ${setHtml}
          <div style="background:rgba(0,0,0,0.3); padding:8px; border-radius:8px; font-size:0.85rem; margin:10px 0;">
            <div style="color:var(--tx2);">Ekspertiz:</div><strong style="color:var(--a3);">${est}</strong>
          </div>
          <p style="font-size:0.75rem; color:var(--tx2); margin-bottom:15px;">Risk: ${riskStr}</p>
          <button class="chance-action-btn" style="width:100%; padding:10px;" onclick="aeEnterRoom(${i})">Katıl (${aeFormatM(a.startBid)})</button>
        </div>
      `;
    });
    document.getElementById('aeAuctionGrid').innerHTML = html;
  }

  // --- LIVE BIDDING LOGIC ---
  window.aeEnterRoom = function(idx) {
    aeAudio.init();
    if(ae.inv.length >= AE_UPGRADES.storage.effect(ae.up.storage)) return toast('Depon dolu! Önce bir şeyler sat.', '#f44');
    
    ae.stats.totalAuc++;
    actAuc = {
      item: currentAuctions[idx],
      index: idx,
      currentBid: currentAuctions[idx].startBid,
      winner: 'Müzayedeci',
      time: 100,
      aiOpponents: [],
      lastPlayerBidTime: 100
    };
    
    let btn1 = document.getElementById('btnBid1'); if(btn1) btn1.disabled = false;
    let btn2 = document.getElementById('btnBid2'); if(btn2) btn2.disabled = false;
    let btn3 = document.getElementById('btnBid3'); if(btn3) btn3.disabled = false;
    let btnL = document.getElementById('btnLeaveAuc'); if(btnL) btnL.disabled = false;
    
    let numAi = 2 + Math.floor(Math.random()*2);
    let availableAi = [...AE_AI];
    if(actAuc.item.cat <= 2) availableAi = availableAi.filter(a => a.name !== 'Milyarder Kont');
    availableAi = availableAi.sort(() => 0.5 - Math.random());
    
    for(let i=0; i<numAi; i++) {
      let t = availableAi[i];
      let aiErr = (Math.random() - 0.5) * 0.6; 
      let aiVal = actAuc.item.realValue * (1 + aiErr);
      actAuc.aiOpponents.push({
        name: t.name, avatar: t.avatar, maxBid: aiVal * t.budget, aggro: t.aggro, out: false, anger: 0
      });
    }

    document.getElementById('rmIcon').textContent = actAuc.item.icon;
    document.getElementById('rmIcon').className = 'ae-item-icon ae-rarity-' + actAuc.item.cat;
    document.getElementById('rmTitle').textContent = actAuc.item.name;
    document.getElementById('rmDesc').textContent = AE_CATS[actAuc.item.cat].name + ' Kategorisi';
    
    let setBadge = document.getElementById('rmSet');
    if(actAuc.item.set) { setBadge.style.display='inline-block'; setBadge.textContent = AE_SETS[actAuc.item.set].n; }
    else { setBadge.style.display='none'; }

    document.getElementById('rmEst').textContent = getEstimatedRange(actAuc.item.realValue);
    document.getElementById('rmRisk').innerHTML = ae.up.risk > 0 ? (actAuc.item.isFake ? '<span style="color:#f44">Sahte</span>' : '<span style="color:#4CAF50">Orijinal</span>') : 'Gizli';
    
    document.getElementById('rmCurrentBid').textContent = aeFormatM(actAuc.currentBid);
    document.getElementById('rmLog').innerHTML = '<div class="ae-bid-msg" style="color:var(--a3)">Müzayede başladı! Başlangıç: ' + aeFormatM(actAuc.currentBid) + '</div>';
    
    let b1Val = Math.pow(10, actAuc.item.cat);
    let b2Val = b1Val * 5;
    let b3Val = b1Val * 25;
    document.getElementById('btnBid1').textContent = '+ ' + aeFormatM(b1Val);
    document.getElementById('btnBid2').textContent = '+ ' + aeFormatM(b2Val);
    document.getElementById('btnBid3').textContent = '+ ' + aeFormatM(b3Val);
    
    document.getElementById('btnBid1').onclick = () => aePlayerBid(b1Val);
    document.getElementById('btnBid2').onclick = () => aePlayerBid(b2Val);
    document.getElementById('btnBid3').onclick = () => aePlayerBid(b3Val);
    
    aeSwitchTab('room');
    if(actTimer) clearInterval(actTimer);
    actTimer = setInterval(aeTick, 100); 
  };

  function aeLog(msg, isMe = false) {
    let log = document.getElementById('rmLog');
    log.innerHTML += `<div class="ae-bid-msg ${isMe ? 'me' : ''}">${msg}</div>`;
    log.scrollTop = log.scrollHeight;
  }

  function aePlayerBid(amount) {
    let newBid = actAuc.currentBid + amount;
    if(newBid > ae.money) return toast('Yeterli nakitin yok!', '#f44');
    
    // Check if player is bidding super fast over an AI
    let timeDiff = actAuc.time - actAuc.lastPlayerBidTime;
    if(timeDiff > -15 && actAuc.winner !== 'Müzayedeci' && actAuc.winner !== 'Sen') {
       // Find the AI who was winning and anger them
       let opp = actAuc.aiOpponents.find(a => a.name === actAuc.winner);
       if(opp) {
          opp.anger += 1;
          if(opp.anger === 3) aeLog(`<span style="color:#f44">${opp.avatar} ${opp.name} sana çok sinirlendi! (Öfkeli)</span>`);
       }
    }

    actAuc.currentBid = newBid;
    actAuc.winner = 'Sen';
    actAuc.time = Math.min(100, actAuc.time + 30);
    actAuc.lastPlayerBidTime = actAuc.time;
    
    document.getElementById('rmCurrentBid').textContent = aeFormatM(actAuc.currentBid);
    document.getElementById('rmCurrentBidWrapper').style.transform = 'scale(1.1)';
    setTimeout(() => document.getElementById('rmCurrentBidWrapper').style.transform = 'scale(1)', 150);
    
    aeAudio.coin();
    aeLog(`Siz teklif verdiniz: ${aeFormatM(actAuc.currentBid)}`, true);
  }

  document.getElementById('btnLeaveAuc').onclick = () => { actAuc.winner = 'Müzayedeci'; actAuc.time = 0; };

  function aeTick() {
    if(!actAuc) return;
    actAuc.time -= 2.5; 
    document.getElementById('rmTimerBar').style.width = Math.max(0, actAuc.time) + '%';
    
    // Ticking audio tension
    if(actAuc.time > 0 && actAuc.time < 30 && Math.floor(actAuc.time) % 5 === 0) aeAudio.tick();

    if(actAuc.time <= 0) {
      clearInterval(actTimer);
      aeAudio.thud();
      let gv = document.getElementById('aeGavel');
      gv.style.animation = 'none'; void gv.offsetWidth; gv.style.animation = 'gavelSlam 1.5s ease-out';
      setTimeout(aeEndAuction, 1500); // wait for gavel
      return;
    }

    if(actAuc.winner !== 'Sen' && Math.random() > 0.3) return; 
    if(actAuc.winner === 'Sen' && actAuc.time > 70 && Math.random() > 0.1) return;
    
    for(let ai of actAuc.aiOpponents) {
      if(ai.out) continue;
      if(actAuc.winner === ai.name) continue;
      
      let isAngry = ai.anger >= 3;
      let actingChance = ai.aggro * 0.15;
      if(isAngry) actingChance *= 2;

      if(Math.random() < actingChance) { 
        let increment = (actAuc.currentBid * 0.05) + Math.pow(10, actAuc.item.cat); 
        let proposedBid = actAuc.currentBid + increment;
        
        // Probability drop out system
        let budgetLimit = isAngry ? ai.maxBid * 1.3 : ai.maxBid; // Angry AI overspends by 30%
        if(proposedBid > budgetLimit) {
           let overRatio = proposedBid / budgetLimit;
           let dropChance = (overRatio - 1) * 2; 
           if (Math.random() < dropChance || overRatio > 1.3) {
               ai.out = true;
               aeLog(`<span style="color:#aaa">${ai.avatar} ${ai.name} masadan çekildi.</span>`);
               continue;
           }
        }
        
        actAuc.currentBid = proposedBid;
        actAuc.winner = ai.name;
        actAuc.time = Math.min(100, actAuc.time + 30);
        document.getElementById('rmCurrentBid').textContent = aeFormatM(actAuc.currentBid);
        aeLog(`${ai.avatar} ${ai.name} teklif verdi: ${aeFormatM(actAuc.currentBid)}`);
        aeAudio.tick();
        break; 
      }
    }
  }

  function aeEndAuction() {
    let msg = '';
    if(actAuc.winner === 'Sen') {
      ae.money -= actAuc.currentBid;
      ae.stats.won++;
      
      let presMult = 1 + (ae.prestige * 0.2);
      let fItem = {...actAuc.item};
      fItem.buyPrice = actAuc.currentBid;
      fItem.realValue = Math.floor(fItem.realValue * presMult);
      fItem.stale = false; 
      
      ae.inv.push(fItem);
      msg = `Tebrikler! Ürünü ${aeFormatM(actAuc.currentBid)} karşılığında kazandın.`;
      if(fItem.isFake) msg += ' <br><strong style="color:#f44">UYARI: ÜRÜN SAHTE ÇIKTI!</strong>';
      
      aeAudio.coin();
      spawnConfetti();
      toast('Açık artırmayı kazandın!', '#69f0ae');
    } else {
      msg = `Açık artırma bitti. Kazanan: ${actAuc.winner} (${aeFormatM(actAuc.currentBid)})`;
    }
    
    document.getElementById('rmLog').innerHTML += `<div style="text-align:center; padding:10px; background:rgba(0,0,0,0.5); border-radius:10px; margin-top:10px;">${msg}<br><br><button class="chance-choice-btn" onclick="aeSwitchTab('auctions')">Lobiye Dön</button></div>`;
    
    let b1 = document.getElementById('btnBid1'); if(b1) b1.disabled = true;
    let b2 = document.getElementById('btnBid2'); if(b2) b2.disabled = true;
    let b3 = document.getElementById('btnBid3'); if(b3) b3.disabled = true;
    let bl = document.getElementById('btnLeaveAuc'); if(bl) bl.disabled = true;
    
    currentAuctions.splice(actAuc.index, 1);
    aeUpdateUI();
  }

  // --- INVENTORY, SETS & HAGGLING ---
  function getMarketValue(item) {
    let val = item.realValue;
    if(item.stale) val = Math.floor(val * 0.8); 
    if(ae.news && ae.newsDaysLeft > 0) {
      if(ae.news.cat === -1 || ae.news.cat === item.cat) val = Math.floor(val * ae.news.mult);
    }
    return val;
  }

  function renderInventory() {
    let html = '';
    
    // Calculate Set progression
    let setCounts = {};
    ae.inv.forEach(i => { if(i.set) { setCounts[i.set] = (setCounts[i.set]||0)+1; } });
    
    let sumHtml = '';
    for(let k in AE_SETS) {
       let cnt = setCounts[k] || 0;
       let req = AE_SETS[k].req;
       let isReady = cnt >= req;
       sumHtml += `<div style="margin-bottom:3px; color:${isReady?'#aeea00':'var(--tx2)'}">${AE_SETS[k].n}: ${cnt}/${req} ${isReady ? `<button class="mini-btn" style="padding:2px 5px; margin-left:5px;" onclick="aeSellSet('${k}')">Seti Sat!</button>` : ''}</div>`;
    }
    if(sumHtml === '') sumHtml = 'Set bulunamadı.';
    document.getElementById('aeSetSummary').innerHTML = sumHtml;

    if(ae.inv.length === 0) {
      html = '<div style="width:100%; text-align:center; padding:40px; color:var(--tx3);">Depon tamamen boş.</div>';
    } else {
      ae.inv.forEach((item, i) => {
        let mVal = getMarketValue(item);
        let commission = Math.floor(mVal * (AE_UPGRADES.bargain.effect(ae.up.bargain) / 100));
        let netProfit = (mVal - commission) - item.buyPrice;
        let profitCol = netProfit >= 0 ? 'var(--a4)' : 'var(--a2)';
        
        let staleMsg = item.stale ? '<span style="color:#f44; font-size:0.75rem;">(Öfkeli Müşteri -%20)</span>' : '';
        let setHtml = item.set ? `<div class="ae-set-badge" style="margin-bottom:5px;">${AE_SETS[item.set].n} Parçası</div>` : '';
        
        html += `
          <div class="ae-card">
            <div class="ae-item-icon ae-rarity-${item.cat}">${item.icon}</div>
            <h4 style="margin:5px 0;">${item.name}</h4>
            ${setHtml}
            <div style="font-size:0.85rem; color:var(--tx2); margin-bottom:5px;">Alış: ${aeFormatM(item.buyPrice)}</div>
            <div style="background:rgba(0,0,0,0.3); padding:8px; border-radius:8px; font-size:0.85rem; margin-bottom:10px;">
              <div style="color:var(--tx2);">Müşteri Teklifi ${staleMsg}:</div>
              <strong style="color:var(--a5); font-size:1.1rem;">${aeFormatM(mVal - commission)}</strong>
            </div>
            <div style="font-size:0.9rem; font-weight:bold; color:${profitCol}; margin-bottom:15px;">Kâr: ${aeFormatM(netProfit)}</div>
            <button class="chance-action-btn" style="width:100%; padding:10px;" onclick="aeOpenPazarlik(${i})">Pazarlık Yap</button>
          </div>
        `;
      });
    }
    document.getElementById('aeInvGrid').innerHTML = html;
  }

  window.aeSellSet = function(setId) {
     aeAudio.init();
     let req = AE_SETS[setId].req;
     let mult = AE_SETS[setId].mult;
     
     let itemsToSell = [];
     for(let i=0; i<ae.inv.length; i++) {
        if(ae.inv[i].set === setId && itemsToSell.length < req) {
           itemsToSell.push(i);
        }
     }
     if(itemsToSell.length < req) return toast('Yeterli eşyan yok!', '#f44');
     
     // Calculate total value
     let totalVal = 0;
     let totalCost = 0;
     itemsToSell.forEach(idx => {
        totalVal += getMarketValue(ae.inv[idx]);
        totalCost += ae.inv[idx].buyPrice;
     });
     
     let finalVal = totalVal * mult;
     
     // Remove items from inventory (highest index first to avoid shifting issues)
     itemsToSell.sort((a,b)=>b-a).forEach(idx => ae.inv.splice(idx, 1));
     
     ae.money += finalVal;
     ae.stats.profit += (finalVal - totalCost);
     
     aeAudio.coin();
     spawnConfetti();
     toast(`Koleksiyon Satıldı! Devasa Kazanç: ${aeFormatM(finalVal)}`, '#aeea00');
     aeUpdateUI();
     renderInventory();
  }

  let activePazarlik = null;
  window.aeOpenPazarlik = function(idx) {
     aeAudio.init();
     let item = ae.inv[idx];
     let mVal = getMarketValue(item);
     let commission = Math.floor(mVal * (AE_UPGRADES.bargain.effect(ae.up.bargain) / 100));
     let netEarn = mVal - commission;
     
     activePazarlik = { idx: idx, item: item, baseEarn: netEarn };
     document.getElementById('pzBasePrice').textContent = aeFormatM(netEarn);
     document.getElementById('aePazarlikModal').style.display = 'flex';
  }

  window.aePazarlikResolve = function(type) {
     if(!activePazarlik) return;
     let pz = activePazarlik;
     let finalEarn = 0;
     let success = true;

     if(type === 'accept') { finalEarn = pz.baseEarn; } 
     else if(type === 'push') {
        if(Math.random() < 0.70) { finalEarn = Math.floor(pz.baseEarn * 1.15); toast('Başarılı! +%15', '#aeea00'); } else { success = false; }
     } else if(type === 'hard') {
        if(Math.random() < 0.40) { finalEarn = Math.floor(pz.baseEarn * 1.35); toast('Harika Pazarlık! +%35', '#aeea00'); } else { success = false; }
     }

     if(success) {
        ae.money += finalEarn;
        ae.stats.profit += (finalEarn - pz.item.buyPrice);
        ae.inv.splice(pz.idx, 1);
        aeAudio.coin();
        toast(`Satış tamamlandı: ${aeFormatM(finalEarn)}`, '#aeea00');
     } else {
        aeAudio.error();
        toast('Alıcı sinirlenip masadan kalktı! Değer %20 düştü.', '#f44');
        pz.item.stale = true; 
     }
     
     document.getElementById('aePazarlikModal').style.display = 'none';
     activePazarlik = null;
     aeUpdateUI();
     renderInventory();
  }

  // --- BLACK MARKET ---
  function renderBlackMarket() {
     if(!ae.bmActive) return document.getElementById('aeBmGrid').innerHTML = '<div style="width:100%;text-align:center;">Kara borsa şu an kapalı. İlerde tekrar dene.</div>';
     
     // Generate 2 random high tier items for extremely cheap, but huge risk
     let html = '';
     for(let i=0; i<2; i++) {
        let catLevel = Math.random() > 0.5 ? 3 : 4;
        let catData = AE_CATS[catLevel];
        let baseItem = catData.items[Math.floor(Math.random() * catData.items.length)];
        let realVal = Math.floor(Math.random() * (catData.maxVal - catData.minVal) + catData.minVal);
        let price = Math.floor(realVal * 0.1); // 90% discount!
        
        let strItem = encodeURIComponent(JSON.stringify({n: baseItem.n, i: baseItem.i, c: catLevel, r: realVal, s: baseItem.set, p: price}));
        
        html += `
          <div class="ae-card" style="border-color:#f44;">
            <div class="ae-item-icon ae-rarity-${catLevel}">${baseItem.i}</div>
            <h4 style="margin:5px 0;">${baseItem.n}</h4>
            <div style="font-size:0.85rem; color:var(--tx2); margin-bottom:5px;">Tahmini Değer: ${aeFormatM(realVal)}</div>
            <div style="color:#f44; font-weight:bold; margin-bottom:15px; font-size:1.2rem;">Kaçak Fiyat: ${aeFormatM(price)}</div>
            <button class="chance-action-btn" style="background:#f44; border:none; width:100%; padding:10px;" onclick="aeBuyBm('${strItem}')">Satın Al (RİSKLİ)</button>
          </div>
        `;
     }
     document.getElementById('aeBmGrid').innerHTML = html;
  }
  
  window.aeBuyBm = function(strItem) {
     aeAudio.init();
     let item = JSON.parse(decodeURIComponent(strItem));
     if(ae.money < item.p) return toast('Yeterli nakitin yok!', '#f44');
     if(ae.inv.length >= AE_UPGRADES.storage.effect(ae.up.storage)) return toast('Depon dolu!', '#f44');
     
     ae.money -= item.p;
     
     // Police raid chance! 30% normally. Risk analysis helps lower it slightly.
     let raidChance = 0.30 - (ae.up.risk * 0.05);
     if(Math.random() < raidChance) {
        aeAudio.error();
        // Fine: 20% of current money
        let fine = Math.floor(ae.money * 0.2);
        ae.money -= fine;
        toast('POLİS BASKINI! Eşyaya el konuldu ve ' + aeFormatM(fine) + ' ceza yedin!', '#f44');
        ae.bmActive = false; // Black market closes immediately
        aeSwitchTab('dash');
     } else {
        aeAudio.coin();
        ae.inv.push({
           name: item.n, icon: item.i, cat: item.c, realValue: item.r, buyPrice: item.p, isFake: false, set: item.s, stale: false
        });
        toast('Eşyayı polise yakalanmadan başarıyla depona soktun!', '#aeea00');
     }
     aeUpdateUI();
  }

  // --- UPGRADES ---
  function getUpCost(key) {
    let upData = AE_UPGRADES[key];
    let curlvl = ae.up[key];
    if(curlvl >= upData.max) return null;
    return Math.floor(upData.baseCost * Math.pow(upData.mult, curlvl));
  }

  function renderUpgrades() {
    let html = '';
    for(let key in AE_UPGRADES) {
      let up = AE_UPGRADES[key];
      let lvl = ae.up[key];
      let cost = getUpCost(key);
      let isMax = lvl >= up.max;
      
      html += `
        <div class="ae-up-card ${isMax ? 'maxed' : ''}">
          <h4>${up.n} (Seviye ${lvl}/${up.max})</h4>
          <p style="font-size:0.75rem; color:var(--tx3); flex:1;">${up.d}</p>
          <div style="width:100%; margin-top:10px;">
            ${isMax ? '<div style="color:var(--a5); font-weight:bold; padding:8px;">MAKSİMUM</div>' : 
              `<button class="chance-action-btn" style="width:100%; font-size:0.8rem; padding:8px;" ${ae.money < cost ? 'disabled' : ''} onclick="aeBuyUpgrade('${key}')">Yükselt (${aeFormatM(cost)})</button>`
            }
          </div>
        </div>
      `;
    }
    document.getElementById('aeUpGrid').innerHTML = html;
  }

  window.aeBuyUpgrade = function(key) {
    let cost = getUpCost(key);
    if(cost === null || ae.money < cost) return;
    ae.money -= cost;
    ae.up[key]++;
    aeAudio.coin();
    toast(AE_UPGRADES[key].n + ' yükseltildi!', '#00e5ff');
    aeUpdateUI();
    renderUpgrades();
  }

  // --- ENDGAME & MISC ---
  document.getElementById('aeEndGameBtn').onclick = () => {
    if(getNetWorth() < 50000000 || ae.owned) return;
    ae.owned = true;
    ae.money -= 50000000;
    spawnConfetti();
    aeAudio.coin();
    toast('TEBRİKLER! Artık Müzayede Salonunun yeni sahibisin. Arkana yaslan ve komisyonların tadını çıkar!', '#ffea00');
    aeUpdateUI();
    aeSwitchTab('dash');
  };

  window.aeResetGame = function() {
    if(confirm("Tüm paran, eşyaların ve yükseltmelerin sıfırlanacak! Sadece prestij seviyen kalacak. Devam etmek istiyor musun?")) {
      ae.money = 1000;
      ae.inv = [];
      ae.up = { expert:0, risk:0, storage:0, network:0, bargain:0 };
      ae.stats = { won:0, totalAuc:0, profit:0 };
      ae.news = null;
      ae.newsDaysLeft = 0;
      ae.loan = { amount:0, timeLeft:0, active:false };
      ae.bmActive = false;
      ae.owned = false;
      currentAuctions = [];
      aeSave();
      aeUpdateUI();
      aeSwitchTab('dash');
      toast('İflas bayrağı çekildi. $1000 destek fonu ile yeniden başlıyorsun.', '#f44');
    }
  }

  // Init
  aeLoad();

} catch(e) { console.error('Auction Empire error', e); }
