/* =========================================================
   SIMULATION UPGRADES V2
   Açık Artırma, Hayat RPG, Zen Kafe, Kozmik Terraformer
   All four simulations completely overhauled.
========================================================= */

/* =========================================================
   1. AÇIK ARTIRMA İMPARATORLUĞU V2  (id='auction-sec')
========================================================= */
try {
  const aeV2Styles = `
    /* === AE V2 Base === */
    #auction-sec .aev2-wrap { font-family:'Outfit',sans-serif; color:var(--tx); position:relative; max-width:1060px; margin:0 auto; }

    /* Hall background flicker */
    #auction-sec .aev2-hall { position:relative; background:linear-gradient(135deg,rgba(10,0,30,0.95) 0%,rgba(30,0,10,0.95) 100%); border-radius:20px; padding:24px; border:1px solid rgba(255,180,0,0.25); overflow:hidden; }
    #auction-sec .aev2-hall::before { content:''; position:absolute; inset:0; background:repeating-linear-gradient(0deg,transparent,transparent 48px,rgba(255,200,0,0.03) 49px); pointer-events:none; animation:hallFlicker 8s ease-in-out infinite; }
    @keyframes hallFlicker { 0%,100%{opacity:1} 50%{opacity:0.85} 75%{opacity:0.95} }

    /* Ticker tape */
    #auction-sec .aev2-ticker-wrap { background:rgba(255,180,0,0.12); border-top:1px solid rgba(255,180,0,0.3); border-bottom:1px solid rgba(255,180,0,0.3); overflow:hidden; height:36px; display:flex; align-items:center; margin-bottom:20px; border-radius:8px; }
    #auction-sec .aev2-ticker { white-space:nowrap; animation:tickerScroll 25s linear infinite; font-size:0.85rem; color:#ffd54f; padding:0 40px; }
    @keyframes tickerScroll { from{transform:translateX(100vw)} to{transform:translateX(-100%)} }

    /* Header stats */
    #auction-sec .aev2-header { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:20px; }
    #auction-sec .aev2-stat { flex:1; min-width:90px; background:rgba(0,0,0,0.4); border:1px solid rgba(255,180,0,0.2); border-radius:12px; padding:12px; text-align:center; }
    #auction-sec .aev2-stat .lbl { font-size:0.7rem; color:#ffd54f; text-transform:uppercase; letter-spacing:1px; }
    #auction-sec .aev2-stat .val { font-size:1.35rem; font-weight:800; color:#fff; margin-top:4px; }

    /* Tabs */
    #auction-sec .aev2-tabs { display:flex; gap:8px; margin-bottom:20px; flex-wrap:wrap; }
    #auction-sec .aev2-tab { padding:9px 18px; background:rgba(0,0,0,0.4); border:1px solid rgba(255,180,0,0.2); border-radius:100px; color:#aaa; cursor:pointer; transition:all 0.25s; font-size:0.9rem; white-space:nowrap; }
    #auction-sec .aev2-tab:hover { border-color:#ffd54f; color:#ffd54f; }
    #auction-sec .aev2-tab.active { background:linear-gradient(135deg,#b8860b,#ffd54f); color:#000; border-color:transparent; font-weight:700; }

    /* Panels */
    #auction-sec .aev2-panel { display:none; animation:aev2Fade 0.35s; }
    #auction-sec .aev2-panel.active { display:block; }
    @keyframes aev2Fade { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }

    /* Item cards on auction list */
    #auction-sec .aev2-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:16px; }
    #auction-sec .aev2-card { background:rgba(0,0,0,0.5); border-radius:16px; padding:18px; border:1px solid rgba(255,180,0,0.15); transition:all 0.3s; position:relative; overflow:hidden; perspective:800px; }
    #auction-sec .aev2-card:hover { border-color:#ffd54f; transform:translateY(-6px); box-shadow:0 12px 30px rgba(255,180,0,0.2); }

    /* Rarity */
    #auction-sec .aev2-rarity-1 { border-color:rgba(150,150,150,0.4)!important; }
    #auction-sec .aev2-rarity-2 { border-color:rgba(33,150,243,0.5)!important; box-shadow:0 0 10px rgba(33,150,243,0.15)!important; }
    #auction-sec .aev2-rarity-3 { border-color:rgba(255,215,0,0.8)!important; box-shadow:0 0 20px rgba(255,215,0,0.3)!important; animation:legendaryShimmer 3s ease-in-out infinite!important; }
    @keyframes legendaryShimmer { 0%,100%{box-shadow:0 0 20px rgba(255,215,0,0.3)} 50%{box-shadow:0 0 40px rgba(255,215,0,0.6),0 0 60px rgba(255,180,0,0.3)} }

    /* Item icon flip reveal */
    #auction-sec .aev2-flip { width:80px; height:80px; perspective:600px; margin:0 auto 12px; cursor:pointer; }
    #auction-sec .aev2-flip-inner { width:100%; height:100%; transition:transform 0.6s; transform-style:preserve-3d; position:relative; }
    #auction-sec .aev2-flip:hover .aev2-flip-inner { transform:rotateY(180deg); }
    #auction-sec .aev2-flip-front, #auction-sec .aev2-flip-back { position:absolute; width:100%; height:100%; backface-visibility:hidden; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:2.8rem; }
    #auction-sec .aev2-flip-front { background:rgba(255,180,0,0.1); border:2px solid rgba(255,180,0,0.3); }
    #auction-sec .aev2-flip-back { background:rgba(0,0,0,0.8); border:2px solid rgba(255,215,0,0.6); transform:rotateY(180deg); }

    /* Bidding room */
    #auction-sec .aev2-room { display:flex; gap:20px; flex-wrap:wrap; }
    #auction-sec .aev2-room-item { flex:1; min-width:240px; background:rgba(0,0,0,0.5); border:1px solid rgba(255,180,0,0.2); border-radius:16px; padding:20px; text-align:center; }
    #auction-sec .aev2-room-bidders { flex:1; min-width:240px; display:flex; flex-direction:column; gap:12px; }

    /* AI bidder avatars */
    #auction-sec .aev2-bidder { display:flex; align-items:center; gap:10px; background:rgba(0,0,0,0.4); border-radius:12px; padding:10px 14px; border:1px solid rgba(255,180,0,0.1); transition:all 0.2s; }
    #auction-sec .aev2-bidder.bidding { border-color:#ffd54f; background:rgba(255,215,0,0.1); animation:bidderPulse 0.4s; }
    #auction-sec .aev2-bidder.out { opacity:0.35; filter:grayscale(1); }
    @keyframes bidderPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04) translateX(4px)} }
    #auction-sec .aev2-avatar { font-size:2rem; width:44px; height:44px; border-radius:50%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; border:2px solid rgba(255,180,0,0.3); }
    #auction-sec .aev2-avatar.shake { animation:avatarShake 0.3s; }
    @keyframes avatarShake { 0%,100%{transform:rotate(0)} 25%{transform:rotate(-8deg)} 75%{transform:rotate(8deg)} }

    /* Countdown timer */
    #auction-sec .aev2-countdown { font-size:4rem; font-weight:900; text-align:center; line-height:1; transition:color 0.3s; text-shadow:0 0 20px currentColor; }
    #auction-sec .aev2-countdown.danger { color:#f44!important; animation:countdownPulse 0.5s ease-in-out infinite; }
    @keyframes countdownPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }

    /* Bid log */
    #auction-sec .aev2-log { background:rgba(0,0,0,0.6); border-radius:10px; padding:12px; max-height:200px; overflow-y:auto; display:flex; flex-direction:column; gap:4px; font-size:0.82rem; }
    #auction-sec .aev2-log-entry { padding:5px 10px; border-radius:6px; background:rgba(255,255,255,0.04); animation:slideIn 0.2s; }
    #auction-sec .aev2-log-entry.me { background:rgba(255,215,0,0.12); border-left:3px solid #ffd54f; }
    @keyframes slideIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }

    /* Bid buttons */
    #auction-sec .aev2-bid-btns { display:flex; gap:10px; margin-top:14px; }
    #auction-sec .aev2-bid-btn { flex:1; padding:12px 8px; background:linear-gradient(135deg,#7b4f00,#ffd54f); border:none; border-radius:10px; color:#000; font-weight:800; cursor:pointer; transition:all 0.2s; font-size:0.9rem; }
    #auction-sec .aev2-bid-btn:hover:not(:disabled) { transform:scale(1.05); box-shadow:0 6px 20px rgba(255,213,79,0.4); }
    #auction-sec .aev2-bid-btn:disabled { opacity:0.35; cursor:not-allowed; filter:grayscale(1); }

    /* Portfolio */
    #auction-sec .aev2-portfolio-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:14px; }
    #auction-sec .aev2-portfolio-card { background:rgba(0,0,0,0.5); border:1px solid rgba(255,180,0,0.2); border-radius:14px; padding:16px; text-align:center; transition:0.25s; }
    #auction-sec .aev2-portfolio-card:hover { border-color:#ffd54f; transform:translateY(-4px); }

    /* Black market */
    #auction-sec .aev2-bm-wrap { background:linear-gradient(135deg,rgba(50,0,0,0.8),rgba(0,0,0,0.9)); border:1px solid rgba(244,67,54,0.4); border-radius:16px; padding:20px; }

    /* Tournament */
    #auction-sec .aev2-tourney-bar { height:20px; background:rgba(0,0,0,0.5); border-radius:100px; overflow:hidden; margin:10px 0; border:1px solid rgba(255,180,0,0.3); }
    #auction-sec .aev2-tourney-fill { height:100%; background:linear-gradient(90deg,#b8860b,#ffd54f); transition:width 0.5s; border-radius:100px; }

    /* Gavel slam */
    #auction-sec .aev2-gavel { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%) scale(0); font-size:8rem; z-index:99999; pointer-events:none; opacity:0; }
    @keyframes gavelV2 { 0%{opacity:0;transform:translate(-50%,-150%) rotate(-30deg) scale(0.5)} 30%{opacity:1;transform:translate(-50%,-50%) rotate(0deg) scale(1.2)} 70%{opacity:1;transform:translate(-50%,-50%) rotate(0deg) scale(1)} 100%{opacity:0;transform:translate(-50%,50%) rotate(30deg) scale(0.5)} }

    /* Confetti */
    #auction-sec .aev2-confetti { position:fixed; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:99998; }
    .aev2-confetti-piece { position:absolute; width:8px; height:8px; animation:cfFall 2.5s linear forwards; }
    @keyframes cfFall { to{transform:translateY(110vh) rotate(720deg);opacity:0} }

    .aev2-mini-btn { background:transparent; border:1px solid rgba(255,180,0,0.4); color:#ffd54f; padding:8px 16px; border-radius:100px; cursor:pointer; font-weight:600; transition:0.2s; }
    .aev2-mini-btn:hover { background:rgba(255,215,0,0.1); }
    .aev2-action-btn { background:linear-gradient(135deg,#b8860b,#ffd54f); border:none; color:#000; padding:10px 22px; border-radius:10px; cursor:pointer; font-weight:800; transition:0.2s; }
    .aev2-action-btn:hover:not(:disabled) { transform:scale(1.04); }
    .aev2-action-btn:disabled { opacity:0.4; cursor:not-allowed; }
  `;
  document.head.insertAdjacentHTML('beforeend', `<style>${aeV2Styles}</style>`);

  const aeV2Html = `
    <section class="section ds-section" id="auction-sec">
      <div class="section-header">
        <button class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:100;cursor:pointer;" onclick="if(typeof dsGoToSection==='function') dsGoToSection('hubPage','')">◀ Ana Sayfa</button>
        <div class="section-badge" style="background:linear-gradient(135deg,#b8860b,#ffd54f);color:#000;">💰 V2 Simülasyon</div>
        <h2 class="section-title">Açık Artırma İmparatorluğu</h2>
        <p class="section-sub">Efsanevi eşyaların peşine düş, rakiplerine meydan oku, imparatorluğunu kur.</p>
      </div>

      <div class="aev2-wrap" id="aev2Wrapper">
        <!-- Gavel -->
        <div id="aev2Gavel" class="aev2-gavel">🔨</div>
        <!-- Confetti container -->
        <div id="aev2Confetti" class="aev2-confetti" style="display:none;"></div>

        <!-- Auction Hall -->
        <div class="aev2-hall">
          <!-- Ticker tape -->
          <div class="aev2-ticker-wrap">
            <div class="aev2-ticker" id="aev2Ticker">📈 Müzayede başlıyor... • 💎 Efsanevi eşyalar bekleniyor... • 🏆 Turnuva devam ediyor... • 🕵️ Kara borsa aktif... • 👑 Servetini artır...</div>
          </div>

          <!-- Stats header -->
          <div class="aev2-header">
            <div class="aev2-stat" onclick="aev2Audio.init()"><div class="lbl">Nakit</div><div class="val" id="aev2Cash">₺1,000</div></div>
            <div class="aev2-stat"><div class="lbl">Net Servet</div><div class="val" id="aev2NetWorth">₺1,000</div></div>
            <div class="aev2-stat"><div class="lbl">Portföy</div><div class="val" id="aev2InvCount">0/8</div></div>
            <div class="aev2-stat"><div class="lbl">Prestij</div><div class="val" id="aev2Prestige">0</div></div>
            <div class="aev2-stat" style="border-color:rgba(244,67,54,0.4);display:none;" id="aev2TourneyStatBox">
              <div class="lbl">🏆 Turnuva</div>
              <div class="val" id="aev2TourneyStat">0/7</div>
            </div>
          </div>

          <!-- Tabs -->
          <div class="aev2-tabs">
            <div class="aev2-tab active" onclick="aev2Tab('auctions')">⚖️ Müzayedeler</div>
            <div class="aev2-tab" onclick="aev2Tab('portfolio')">💼 Portföy</div>
            <div class="aev2-tab" onclick="aev2Tab('tourney')">🏆 Haftalık Turnuva</div>
            <div class="aev2-tab" id="aev2BmTab" onclick="aev2Tab('blackmarket')" style="display:none;border-color:rgba(244,67,54,0.5);color:#f88;">🕵️ Kara Borsa</div>
          </div>

          <!-- AUCTIONS LIST -->
          <div class="aev2-panel active" id="aev2-auctions">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px;">
              <h3 style="color:#ffd54f;">Aktif Müzayedeler</h3>
              <div style="display:flex;gap:10px;flex-wrap:wrap;">
                <select id="aev2RarityFilter" onchange="aev2RenderAuctionsList()" style="background:rgba(0,0,0,0.6);border:1px solid rgba(255,180,0,0.3);color:#ffd54f;padding:8px 12px;border-radius:8px;outline:none;cursor:pointer;">
                  <option value="all">Tüm Nadirlükler</option>
                  <option value="1">Sıradan</option>
                  <option value="2">Nadir (Mavi)</option>
                  <option value="3">Efsanevi (Altın)</option>
                </select>
                <button class="aev2-mini-btn" onclick="aev2RefreshAuctions()">🔄 Yenile</button>
              </div>
            </div>
            <div class="aev2-grid" id="aev2AuctionGrid"></div>
          </div>

          <!-- BIDDING ROOM -->
          <div class="aev2-panel" id="aev2-room">
            <div class="aev2-room">
              <div class="aev2-room-item" id="aev2RoomItem">
                <div class="aev2-flip" id="aev2FlipCard">
                  <div class="aev2-flip-inner">
                    <div class="aev2-flip-front">❓</div>
                    <div class="aev2-flip-back" id="aev2FlipBack">🎁</div>
                  </div>
                </div>
                <h3 id="aev2RoomTitle" style="margin:10px 0 5px;">Eşya Adı</h3>
                <p id="aev2RoomRarity" style="font-size:0.8rem;margin-bottom:10px;"></p>
                <div style="background:rgba(0,0,0,0.4);padding:10px;border-radius:10px;margin-bottom:12px;">
                  <div style="font-size:0.75rem;color:#aaa;">Tahmini Değer</div>
                  <div id="aev2RoomEst" style="color:#ffd54f;font-size:1.2rem;font-weight:800;">₺? - ₺?</div>
                </div>
                <div class="aev2-countdown" id="aev2Countdown" style="color:#ffd54f;">100</div>
                <div style="font-size:0.7rem;color:#aaa;margin-bottom:10px;">saniye</div>
                <div style="height:8px;background:rgba(0,0,0,0.5);border-radius:100px;overflow:hidden;margin-bottom:14px;">
                  <div id="aev2TimerBar" style="height:100%;background:linear-gradient(90deg,#b8860b,#ffd54f);width:100%;transition:width 0.1s linear;border-radius:100px;"></div>
                </div>
                <div style="background:rgba(255,215,0,0.08);border:1px solid rgba(255,215,0,0.2);padding:10px;border-radius:10px;margin-bottom:14px;">
                  <div style="font-size:0.75rem;color:#aaa;">Güncel Teklif</div>
                  <div id="aev2CurBid" style="font-size:2rem;font-weight:900;color:#ffd54f;">₺0</div>
                  <div id="aev2CurLeader" style="font-size:0.8rem;color:#aaa;"></div>
                </div>
                <div class="aev2-bid-btns">
                  <button class="aev2-bid-btn" id="aev2Btn1">+₺10</button>
                  <button class="aev2-bid-btn" id="aev2Btn2">+₺100</button>
                  <button class="aev2-bid-btn" id="aev2Btn3">+₺1K</button>
                </div>
                <button class="aev2-mini-btn" id="aev2LeaveBtn" style="margin-top:12px;width:100%;border-color:#f44;color:#f88;">🏃 Çekil</button>
              </div>
              <div class="aev2-room-bidders" id="aev2BidderList"></div>
            </div>
          </div>

          <!-- PORTFOLIO -->
          <div class="aev2-panel" id="aev2-portfolio">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:10px;">
              <div>
                <h3 style="color:#ffd54f;">💼 Portföy & Net Servet</h3>
                <p style="font-size:0.85rem;color:#aaa;margin-top:4px;">Toplam Net Servet: <strong id="aev2PortfolioNW" style="color:#ffd54f;">₺1,000</strong></p>
              </div>
              <button class="aev2-mini-btn" style="border-color:#f44;color:#f88;" onclick="aev2Reset()">🗑️ Sıfırla</button>
            </div>
            <div class="aev2-portfolio-grid" id="aev2PortfolioGrid"></div>
          </div>

          <!-- TOURNAMENT -->
          <div class="aev2-panel" id="aev2-tourney">
            <h3 style="color:#ffd54f;margin-bottom:6px;">🏆 Haftalık Turnuva</h3>
            <p style="color:#aaa;font-size:0.85rem;margin-bottom:20px;">Bu haftaki özel müzayedelerde 7 eşya kazan ve büyük ödülü topla!</p>
            <div style="background:rgba(255,215,0,0.08);border:1px solid rgba(255,215,0,0.25);border-radius:14px;padding:20px;margin-bottom:20px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                <span style="font-weight:700;color:#ffd54f;">İlerleme</span>
                <span id="aev2TourneyProgress" style="color:#ffd54f;font-weight:800;">0 / 7</span>
              </div>
              <div class="aev2-tourney-bar"><div class="aev2-tourney-fill" id="aev2TourneyBar" style="width:0%;"></div></div>
            </div>
            <div class="aev2-grid" id="aev2TourneyGrid"></div>
            <div id="aev2TourneyReward" style="display:none;margin-top:20px;text-align:center;background:rgba(255,215,0,0.15);border:2px solid #ffd54f;border-radius:16px;padding:24px;">
              <div style="font-size:3rem;">🏆</div>
              <h3 style="color:#ffd54f;margin:10px 0;">Turnuva Şampiyonu!</h3>
              <p style="color:#aaa;margin-bottom:16px;">7 müzayedeyi kazandın! Büyük ödül hesabına yatırıldı.</p>
              <button class="aev2-action-btn" onclick="aev2ClaimTourneyReward()">Ödülü Al (₺50,000 + Prestij)</button>
            </div>
          </div>

          <!-- BLACK MARKET -->
          <div class="aev2-panel" id="aev2-blackmarket">
            <div class="aev2-bm-wrap">
              <h2 style="color:#f44;text-align:center;margin-bottom:6px;text-shadow:0 0 20px #f44;">🕵️ KARA BORSA</h2>
              <p style="color:#aaa;text-align:center;font-size:0.85rem;margin-bottom:20px;">Yasa dışı eşyalar. Polis baskını riski var. Dikkatli ol.</p>
              <div class="aev2-grid" id="aev2BmGrid"></div>
            </div>
          </div>

        </div><!-- /aev2-hall -->
      </div><!-- /wrap -->
    </section>
  `;
  document.body.insertAdjacentHTML('beforeend', aeV2Html);

  /* ---- AE V2 LOGIC ---- */
  const aev2Audio = {
    ctx: null,
    init() { if(!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){} } },
    osc(t, f, d, v=0.1) {
      if(!this.ctx) return;
      let o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type=t; o.frequency.setValueAtTime(f, this.ctx.currentTime);
      g.gain.setValueAtTime(v, this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime+d);
      o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime+d);
    },
    bid() { this.osc('sine',1200,0.06,0.1); setTimeout(()=>this.osc('sine',1600,0.1,0.12),60); },
    gavel() { this.osc('sine',80,0.8,0.9); setTimeout(()=>this.osc('triangle',200,0.4,0.3),100); },
    win() { [400,600,800,1000].forEach((f,i)=>setTimeout(()=>this.osc('sine',f,0.25,0.2),i*120)); },
    tick() { this.osc('triangle',800,0.04,0.04); },
    error() { this.osc('sawtooth',150,0.3,0.15); }
  };
  window.aev2Audio = aev2Audio;

  const AEV2_RARITY = {
    1: { name:'Sıradan', color:'#aaa', glow:'rgba(150,150,150,0.2)' },
    2: { name:'Nadir', color:'#2196F3', glow:'rgba(33,150,243,0.3)' },
    3: { name:'Efsanevi', color:'#ffd54f', glow:'rgba(255,215,0,0.5)' }
  };

  const AEV2_ITEMS = [
    { i:'🎮', n:'Retro Konsol', r:1, minV:200, maxV:2000 },
    { i:'📻', n:'Antika Radyo', r:1, minV:150, maxV:1500 },
    { i:'🧸', n:'Nostaljik Oyuncak', r:1, minV:100, maxV:800 },
    { i:'📠', n:'Eski Daktilo', r:1, minV:300, maxV:2500 },
    { i:'🚲', n:'Klasik Bisiklet', r:1, minV:400, maxV:3000 },
    { i:'⌚', n:'Antika Cep Saati', r:2, minV:3000, maxV:20000 },
    { i:'🏺', n:'Roma Çömleği', r:2, minV:5000, maxV:35000 },
    { i:'🎸', n:'İmzalı Gitar', r:2, minV:8000, maxV:60000 },
    { i:'📺', n:'Tüplü Televizyon', r:2, minV:2000, maxV:15000 },
    { i:'🖼️', n:'Rönesans Tablosu', r:2, minV:15000, maxV:120000 },
    { i:'💎', n:'Nadir Elmas', r:3, minV:80000, maxV:500000 },
    { i:'👑', n:'Kraliyet Tacı', r:3, minV:150000, maxV:2000000 },
    { i:'🚀', n:'Apollo Parçası', r:3, minV:200000, maxV:3000000 },
    { i:'🗡️', n:'Samuray Kılıcı (Efsanevi)', r:3, minV:100000, maxV:800000 }
  ];

  const AEV2_AI = [
    { name:'Agresif Ahmet', emoji:'😤', personality:'aggressive', budgetMult:0.7, bidChance:0.9, bluff:false },
    { name:'Tutucu Tansu', emoji:'🤔', personality:'conservative', budgetMult:0.5, bidChance:0.2, bluff:false },
    { name:'Blöfçü Berk', emoji:'😏', personality:'bluffer', budgetMult:0.6, bidChance:0.5, bluff:true },
    { name:'Zengin Zeki', emoji:'🎩', personality:'aggressive', budgetMult:1.2, bidChance:0.7, bluff:false },
    { name:'Kumarbaz Kerem', emoji:'🃏', personality:'bluffer', budgetMult:0.9, bidChance:0.6, bluff:true },
    { name:'Koleksiyoner Kaya', emoji:'🧐', personality:'conservative', budgetMult:0.8, bidChance:0.35, bluff:false }
  ];

  const AEV2_BM_ITEMS = [
    { i:'💰', n:'Kara Para Çantası', v:500000, risk:'Yüksek' },
    { i:'🗿', n:'Çalıntı Heykel', v:1200000, risk:'Çok Yüksek' },
    { i:'💊', n:'Gizli Formül', v:300000, risk:'Orta' },
    { i:'🔫', n:'Antika Silah (Kayıt Dışı)', v:250000, risk:'Yüksek' },
    { i:'📜', n:'Sahte Senet', v:180000, risk:'Orta' }
  ];

  let aev2 = {
    cash: 1000, prestige: 0, inv: [],
    stats: { won:0, spent:0, earned:0 },
    tourney: { wins:0, claimed:false, items:[] },
    bmUnlocked: false,
    lastTicker: ''
  };

  let aev2ActiveAuction = null;
  let aev2Timer = null;
  let aev2CurrentList = [];
  let aev2CurrentTab = 'auctions';

  function aev2Load() {
    let s = localStorage.getItem('ds_aev2_save');
    if(s) { try { aev2 = {...aev2, ...JSON.parse(s)}; } catch(e){} }
    aev2UpdateUI();
    aev2RefreshAuctions();
    aev2StartBmTimer();
  }
  function aev2Save() { localStorage.setItem('ds_aev2_save', JSON.stringify(aev2)); }

  function aev2Fmt(n) {
    if(n>=1000000) return '₺'+(n/1000000).toFixed(2)+'M';
    if(n>=1000) return '₺'+(n/1000).toFixed(1)+'K';
    return '₺'+Math.floor(n).toLocaleString('tr-TR');
  }
  function aev2NetWorth() { return aev2.cash + aev2.inv.reduce((s,i)=>s+i.realValue,0); }

  function aev2UpdateUI() {
    let nw = aev2NetWorth();
    document.getElementById('aev2Cash').textContent = aev2Fmt(aev2.cash);
    document.getElementById('aev2NetWorth').textContent = aev2Fmt(nw);
    document.getElementById('aev2InvCount').textContent = aev2.inv.length+'/8';
    document.getElementById('aev2Prestige').textContent = aev2.prestige;
    // Tourney
    let tp = Math.min(aev2.tourney.wins, 7);
    let tBox = document.getElementById('aev2TourneyStatBox');
    if(tBox) { tBox.style.display = aev2.tourney.wins>0?'block':'none'; }
    let ts = document.getElementById('aev2TourneyStat');
    if(ts) ts.textContent = tp+'/7';
    // BM tab
    let bmTab = document.getElementById('aev2BmTab');
    if(bmTab) bmTab.style.display = aev2.bmUnlocked?'block':'none';
    // Update ticker
    aev2UpdateTicker();
    aev2Save();
  }

  function aev2UpdateTicker() {
    let msgs = [
      '💰 Nakit kasası: '+aev2Fmt(aev2.cash),
      '📦 Portföyde '+aev2.inv.length+' eşya',
      '🏆 Turnuva ilerlemesi: '+aev2.tourney.wins+'/7',
      '⭐ Prestij: '+aev2.prestige,
      aev2.bmUnlocked?'🕵️ Kara Borsa aktif!':'🔒 Kara Borsa kilitli',
      '💎 Efsanevi eşyaları yakala!',
      '📈 Net Servet: '+aev2Fmt(aev2NetWorth())
    ];
    let t = document.getElementById('aev2Ticker');
    if(t) t.textContent = msgs.join(' • ');
  }

  window.aev2Tab = function(tab) {
    aev2Audio.init();
    if(aev2Timer) { clearInterval(aev2Timer); aev2Timer=null; aev2ActiveAuction=null; }
    aev2CurrentTab = tab;
    document.querySelectorAll('#auction-sec .aev2-panel').forEach(p=>p.classList.remove('active'));
    document.querySelectorAll('#auction-sec .aev2-tab').forEach(t=>t.classList.remove('active'));
    let panel = document.getElementById('aev2-'+tab);
    if(panel) panel.classList.add('active');
    document.querySelectorAll('#auction-sec .aev2-tab').forEach(t=>{
      if(t.getAttribute('onclick')&&t.getAttribute('onclick').includes("'"+tab+"'")) t.classList.add('active');
    });
    if(tab==='auctions') aev2RenderAuctionsList();
    if(tab==='portfolio') aev2RenderPortfolio();
    if(tab==='tourney') aev2RenderTourney();
    if(tab==='blackmarket') aev2RenderBm();
  };

  function aev2StartBmTimer() {
    setInterval(()=>{
      if(!aev2.bmUnlocked && Math.random()<0.015) {
        aev2.bmUnlocked = true;
        aev2UpdateUI();
        if(typeof toast==='function') toast('🕵️ Kara Borsa kapısı açıldı!', '#f44');
      }
    }, 3000);
  }

  window.aev2RefreshAuctions = function() {
    aev2Audio.init();
    aev2CurrentList = [];
    for(let i=0; i<4; i++) {
      let pool = AEV2_ITEMS;
      // Weight by net worth
      let nw = aev2NetWorth();
      if(nw < 20000) pool = AEV2_ITEMS.filter(x=>x.r<=1);
      else if(nw < 200000) pool = AEV2_ITEMS.filter(x=>x.r<=2);
      let item = pool[Math.floor(Math.random()*pool.length)];
      let rv = Math.floor(Math.random()*(item.maxV-item.minV)+item.minV);
      let fake = Math.random()<0.12;
      if(fake) rv=Math.floor(rv*0.08);
      aev2CurrentList.push({
        ...item, realValue:rv, fake,
        startBid:Math.floor(rv*(0.15+Math.random()*0.25)),
        id:Date.now()+i
      });
    }
    aev2RenderAuctionsList();
  };

  function aev2RenderAuctionsList() {
    let filter = document.getElementById('aev2RarityFilter')?.value||'all';
    let list = filter==='all'?aev2CurrentList:aev2CurrentList.filter(x=>x.r==filter);
    if(list.length===0) aev2RefreshAuctions();
    let html = '';
    list.forEach((a,i)=>{
      let rar = AEV2_RARITY[a.r];
      let estMin = Math.floor(a.realValue*0.7), estMax = Math.floor(a.realValue*1.4);
      html += `
        <div class="aev2-card aev2-rarity-${a.r}" style="border-color:${rar.color}40;">
          <div class="aev2-flip" title="Görmek için üzerine gel">
            <div class="aev2-flip-inner">
              <div class="aev2-flip-front">❓</div>
              <div class="aev2-flip-back">${a.i}</div>
            </div>
          </div>
          <h4 style="margin:0 0 6px;color:${rar.color};">${a.n}</h4>
          <div style="font-size:0.75rem;padding:3px 10px;background:${rar.glow};border-radius:100px;display:inline-block;margin-bottom:12px;color:${rar.color};font-weight:700;">${rar.name}</div>
          <div style="background:rgba(0,0,0,0.4);padding:10px;border-radius:10px;margin-bottom:14px;font-size:0.85rem;">
            <div style="color:#aaa;font-size:0.75rem;">Tahmini Değer</div>
            <div style="color:#ffd54f;font-weight:700;">${aev2Fmt(estMin)} – ${aev2Fmt(estMax)}</div>
            <div style="color:#aaa;font-size:0.75rem;margin-top:4px;">Başlangıç Teklifi</div>
            <div style="color:#fff;font-weight:700;">${aev2Fmt(a.startBid)}</div>
          </div>
          <button class="aev2-action-btn" style="width:100%;" onclick="aev2EnterRoom(${aev2CurrentList.indexOf(a)})">⚖️ Müzayedeye Katıl</button>
        </div>
      `;
    });
    let g = document.getElementById('aev2AuctionGrid');
    if(g) g.innerHTML = html||'<div style="color:#aaa;text-align:center;padding:40px;">Müzayede bulunamadı.</div>';
  }

  window.aev2EnterRoom = function(idx) {
    aev2Audio.init();
    if(aev2.inv.length>=8) { if(typeof toast==='function') toast('Portföy dolu! Önce eşya sat.','#f44'); return; }
    let item = aev2CurrentList[idx];
    if(!item) return;

    // Build AI opponents
    let shuffled = [...AEV2_AI].sort(()=>0.5-Math.random()).slice(0,3+Math.floor(Math.random()*2));
    let opponents = shuffled.map(ai=>({
      ...ai, maxBid:item.realValue*ai.budgetMult*(0.8+Math.random()*0.4),
      out:false, bidCount:0
    }));

    aev2ActiveAuction = { item, idx, currentBid:item.startBid, leader:'Müzayedeci', time:100, opponents, playerBid:false };

    // Setup room UI
    let flipBack = document.getElementById('aev2FlipBack');
    if(flipBack) flipBack.textContent = item.i;
    document.getElementById('aev2RoomTitle').textContent = item.n;
    let rar = AEV2_RARITY[item.r];
    document.getElementById('aev2RoomRarity').innerHTML = `<span style="color:${rar.color};font-weight:700;">${rar.name}</span> • Kategori ${item.r}`;
    document.getElementById('aev2RoomEst').textContent = aev2Fmt(Math.floor(item.realValue*0.7))+' – '+aev2Fmt(Math.floor(item.realValue*1.4));
    document.getElementById('aev2CurBid').textContent = aev2Fmt(item.startBid);
    document.getElementById('aev2CurLeader').textContent = 'Lider: Müzayedeci';
    document.getElementById('aev2Countdown').textContent = '100';
    document.getElementById('aev2Countdown').className = 'aev2-countdown';
    document.getElementById('aev2TimerBar').style.width = '100%';

    // Bid buttons
    let inc1 = Math.max(10, Math.floor(item.startBid*0.05));
    let inc2 = Math.max(100, Math.floor(item.startBid*0.15));
    let inc3 = Math.max(500, Math.floor(item.startBid*0.4));
    document.getElementById('aev2Btn1').textContent = '+'+aev2Fmt(inc1);
    document.getElementById('aev2Btn2').textContent = '+'+aev2Fmt(inc2);
    document.getElementById('aev2Btn3').textContent = '+'+aev2Fmt(inc3);
    document.getElementById('aev2Btn1').onclick = ()=>aev2PlaceBid(inc1);
    document.getElementById('aev2Btn2').onclick = ()=>aev2PlaceBid(inc2);
    document.getElementById('aev2Btn3').onclick = ()=>aev2PlaceBid(inc3);
    ['aev2Btn1','aev2Btn2','aev2Btn3','aev2LeaveBtn'].forEach(id=>{ let b=document.getElementById(id); if(b) b.disabled=false; });
    document.getElementById('aev2LeaveBtn').onclick = ()=>{ if(aev2ActiveAuction) { aev2ActiveAuction.time=0; aev2ActiveAuction.leader='Çekildi'; }};

    // Render bidders
    let bidHtml = `<h4 style="color:#ffd54f;margin-bottom:10px;">🎭 Rakipler</h4>`;
    bidHtml += `<div style="background:rgba(0,0,0,0.5);border-radius:10px;padding:10px;margin-bottom:10px;font-size:0.85rem;max-height:220px;overflow-y:auto;" id="aev2BidLog"><div style="color:#ffd54f;">Müzayede başladı! Başlangıç: ${aev2Fmt(item.startBid)}</div></div>`;
    opponents.forEach((ai,j)=>{
      let personalityLabel = ai.personality==='aggressive'?'Agresif':ai.personality==='conservative'?'Tutucu':'Blöfçü';
      bidHtml += `<div class="aev2-bidder" id="aev2Bidder_${j}">
        <div class="aev2-avatar" id="aev2Av_${j}">${ai.emoji}</div>
        <div>
          <div style="font-weight:700;font-size:0.9rem;">${ai.name}</div>
          <div style="font-size:0.75rem;color:#aaa;">${personalityLabel}</div>
        </div>
        <div style="margin-left:auto;font-size:0.75rem;color:#ffd54f;" id="aev2AiBid_${j}">Bekliyor</div>
      </div>`;
    });
    document.getElementById('aev2BidderList').innerHTML = bidHtml;

    aev2Tab('room');
    // Manually keep room panel active after tab switch cleared it
    let roomPanel = document.getElementById('aev2-room');
    if(roomPanel) roomPanel.classList.add('active');
    document.querySelectorAll('#auction-sec .aev2-panel').forEach(p=>{ if(p.id!=='aev2-room') p.classList.remove('active'); });

    if(aev2Timer) clearInterval(aev2Timer);
    aev2Timer = setInterval(aev2Tick, 100);
  };

  function aev2PlaceBid(amount) {
    if(!aev2ActiveAuction) return;
    let newBid = aev2ActiveAuction.currentBid + amount;
    if(newBid > aev2.cash) { if(typeof toast==='function') toast('Yeterli nakit yok!','#f44'); aev2Audio.error(); return; }
    aev2ActiveAuction.currentBid = newBid;
    aev2ActiveAuction.leader = 'Sen';
    aev2ActiveAuction.playerBid = true;
    aev2ActiveAuction.time = Math.min(100, aev2ActiveAuction.time+25);
    document.getElementById('aev2CurBid').textContent = aev2Fmt(newBid);
    document.getElementById('aev2CurLeader').textContent = 'Lider: Sen 🟡';
    aev2Log('💛 Sen teklif verdin: '+aev2Fmt(newBid), true);
    aev2Audio.bid();
  }

  function aev2Log(msg, isMe=false) {
    let log = document.getElementById('aev2BidLog');
    if(!log) return;
    let d = document.createElement('div');
    d.className = 'aev2-log-entry'+(isMe?' me':'');
    d.innerHTML = msg;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
  }

  function aev2Tick() {
    if(!aev2ActiveAuction) return;
    let a = aev2ActiveAuction;
    a.time -= 2;
    let pct = Math.max(0,a.time);
    let cd = document.getElementById('aev2Countdown');
    let tb = document.getElementById('aev2TimerBar');
    if(cd) { cd.textContent = Math.ceil(a.time/2); if(a.time<20) cd.className='aev2-countdown danger'; }
    if(tb) tb.style.width = pct+'%';
    if(a.time<10 && Math.floor(a.time)%4===0) aev2Audio.tick();

    if(a.time<=0) {
      clearInterval(aev2Timer); aev2Timer=null;
      aev2Audio.gavel();
      let gv = document.getElementById('aev2Gavel');
      if(gv) { gv.style.animation='none'; void gv.offsetWidth; gv.style.animation='gavelV2 1.2s ease-out forwards'; }
      setTimeout(aev2EndAuction, 1200);
      return;
    }

    // AI bidding logic
    if(Math.random()>0.4) return;
    for(let j=0; j<a.opponents.length; j++) {
      let ai = a.opponents[j];
      if(ai.out) continue;
      if(a.leader===ai.name) continue;

      let chance = ai.personality==='aggressive'?0.4:ai.personality==='conservative'?0.12:0.25;
      if(Math.random()>chance) continue;

      // Bluffer might pretend to bid
      if(ai.bluff && Math.random()<0.3) {
        aev2Log(`${ai.emoji} ${ai.name} teklif vermeyi düşünüyor...`);
        let avEl = document.getElementById('aev2Av_'+j);
        if(avEl) { avEl.classList.add('shake'); setTimeout(()=>avEl.classList.remove('shake'),350); }
        break;
      }

      let inc = Math.max(a.currentBid*0.05, Math.floor(Math.random()*500+50));
      let proposed = a.currentBid + inc;
      if(proposed > ai.maxBid) {
        ai.out = true;
        let bd = document.getElementById('aev2Bidder_'+j);
        if(bd) bd.classList.add('out');
        aev2Log(`${ai.emoji} ${ai.name} çekildi.`);
        continue;
      }

      a.currentBid = proposed;
      a.leader = ai.name;
      a.time = Math.min(100, a.time+20);
      ai.bidCount++;

      let avEl = document.getElementById('aev2Av_'+j);
      if(avEl) { avEl.classList.add('shake'); setTimeout(()=>avEl.classList.remove('shake'),350); }
      let bd = document.getElementById('aev2Bidder_'+j);
      if(bd) { bd.classList.add('bidding'); setTimeout(()=>bd.classList.remove('bidding'),500); }
      let aiB = document.getElementById('aev2AiBid_'+j);
      if(aiB) aiB.textContent = aev2Fmt(proposed);

      document.getElementById('aev2CurBid').textContent = aev2Fmt(proposed);
      document.getElementById('aev2CurLeader').textContent = 'Lider: '+ai.emoji+' '+ai.name;
      aev2Log(`${ai.emoji} ${ai.name} teklif: ${aev2Fmt(proposed)}`);
      break;
    }
  }

  function aev2EndAuction() {
    let a = aev2ActiveAuction;
    if(!a) return;
    ['aev2Btn1','aev2Btn2','aev2Btn3','aev2LeaveBtn'].forEach(id=>{ let b=document.getElementById(id); if(b) b.disabled=true; });

    if(a.leader==='Sen') {
      aev2.cash -= a.currentBid;
      let item = {...a.item, buyPrice:a.currentBid};
      aev2.inv.push(item);
      aev2.stats.won++;
      aev2.tourney.wins++;
      if(aev2.tourney.wins>=7 && !aev2.tourney.claimed) {
        let reward = document.getElementById('aev2TourneyReward');
        if(reward) reward.style.display='block';
      }
      aev2Audio.win();
      aev2SpawnConfetti();
      aev2Log('🏆 Tebrikler! Ürünü kazandın: '+aev2Fmt(a.currentBid), true);
      if(typeof toast==='function') toast('Müzayedeyi kazandın! '+a.item.n,'#ffd54f');
    } else {
      aev2Log('❌ Müzayede bitti. Kazanan: '+a.leader+' ('+aev2Fmt(a.currentBid)+')');
    }

    aev2CurrentList.splice(a.idx,1);
    aev2UpdateUI();
    let logEl = document.getElementById('aev2BidLog');
    if(logEl) logEl.insertAdjacentHTML('beforeend','<div style="text-align:center;margin-top:10px;"><button class="aev2-mini-btn" onclick="aev2Tab(\'auctions\')">← Müzayedelere Dön</button></div>');
    aev2ActiveAuction = null;
  }

  function aev2SpawnConfetti() {
    let c = document.getElementById('aev2Confetti');
    if(!c) return;
    c.style.display='block';
    for(let i=0;i<50;i++) {
      let p = document.createElement('div');
      p.className = 'aev2-confetti-piece';
      p.style.left = Math.random()*100+'vw';
      p.style.top = '-10px';
      p.style.background = ['#ffd54f','#f44','#4CAF50','#2196F3','#9C27B0'][Math.floor(Math.random()*5)];
      p.style.width = (6+Math.random()*10)+'px';
      p.style.height = (6+Math.random()*10)+'px';
      p.style.borderRadius = Math.random()>0.5?'50%':'2px';
      p.style.animationDuration = (1.5+Math.random()*2)+'s';
      p.style.animationDelay = Math.random()*0.5+'s';
      c.appendChild(p);
      setTimeout(()=>p.remove(), 3500);
    }
    setTimeout(()=>c.style.display='none', 3600);
  }

  function aev2RenderPortfolio() {
    let html = '';
    if(!aev2.inv.length) { html='<div style="color:#aaa;text-align:center;padding:40px;">Portföyünüz boş. Müzayedelere katılın!</div>'; }
    else {
      aev2.inv.forEach((item,i)=>{
        let rar = AEV2_RARITY[item.r||1];
        let profit = item.realValue - item.buyPrice;
        html += `<div class="aev2-portfolio-card">
          <div style="font-size:3rem;margin-bottom:8px;">${item.i}</div>
          <h4 style="color:${rar.color};margin-bottom:6px;">${item.n}</h4>
          <div style="font-size:0.8rem;color:#aaa;">Alış: ${aev2Fmt(item.buyPrice)}</div>
          <div style="font-size:0.9rem;color:${profit>=0?'#4CAF50':'#f44'};font-weight:700;margin:4px 0;">Değer: ${aev2Fmt(item.realValue)}</div>
          <button class="aev2-mini-btn" style="margin-top:10px;width:100%;font-size:0.8rem;" onclick="aev2SellItem(${i})">Sat (${aev2Fmt(Math.floor(item.realValue*0.85))})</button>
        </div>`;
      });
    }
    document.getElementById('aev2PortfolioGrid').innerHTML = html;
    document.getElementById('aev2PortfolioNW').textContent = aev2Fmt(aev2NetWorth());
  }

  window.aev2SellItem = function(idx) {
    let item = aev2.inv[idx];
    if(!item) return;
    let price = Math.floor(item.realValue*0.85);
    aev2.cash += price;
    aev2.stats.earned += price;
    aev2.inv.splice(idx,1);
    aev2Audio.bid();
    if(typeof toast==='function') toast('Satıldı: '+item.n+' → '+aev2Fmt(price),'#ffd54f');
    aev2UpdateUI();
    aev2RenderPortfolio();
  };

  function aev2RenderTourney() {
    let tp = aev2.tourney.wins;
    document.getElementById('aev2TourneyProgress').textContent = Math.min(tp,7)+' / 7';
    document.getElementById('aev2TourneyBar').style.width = Math.min(tp/7*100,100)+'%';
    let reward = document.getElementById('aev2TourneyReward');
    if(reward) reward.style.display = (tp>=7 && !aev2.tourney.claimed)?'block':'none';
    // Generate 7 special tourney slots
    let html = '';
    let specials = [
      {i:'🏆',n:'Altın Kupa',r:3,realValue:250000,startBid:80000,fake:false,minV:200000,maxV:350000},
      {i:'💎',n:'Paha Biçilmez Elmas',r:3,realValue:400000,startBid:120000,fake:false,minV:350000,maxV:500000},
      {i:'🌟',n:'Meteorit Parçası',r:3,realValue:180000,startBid:50000,fake:false,minV:140000,maxV:220000},
      {i:'🎨',n:'Rönesans Eseri',r:2,realValue:90000,startBid:25000,fake:false,minV:80000,maxV:120000},
    ];
    specials.slice(0,4).forEach((s,i)=>{
      let rar = AEV2_RARITY[s.r];
      html += `<div class="aev2-card aev2-rarity-${s.r}">
        <div style="font-size:3.5rem;text-align:center;margin-bottom:12px;">${s.i}</div>
        <h4 style="color:${rar.color};text-align:center;margin-bottom:8px;">${s.n}</h4>
        <div style="font-size:0.8rem;color:#aaa;text-align:center;margin-bottom:14px;">Başlangıç: ${aev2Fmt(s.startBid)}</div>
        <button class="aev2-action-btn" style="width:100%;" onclick="aev2EnterTourneyRoom(${i})">🏆 Katıl</button>
      </div>`;
    });
    document.getElementById('aev2TourneyGrid').innerHTML = html;
  }

  window.aev2EnterTourneyRoom = function(idx) {
    let specials = [
      {i:'🏆',n:'Altın Kupa',r:3,realValue:250000,startBid:80000,fake:false,minV:200000,maxV:350000},
      {i:'💎',n:'Paha Biçilmez Elmas',r:3,realValue:400000,startBid:120000,fake:false,minV:350000,maxV:500000},
      {i:'🌟',n:'Meteorit Parçası',r:3,realValue:180000,startBid:50000,fake:false,minV:140000,maxV:220000},
      {i:'🎨',n:'Rönesans Eseri',r:2,realValue:90000,startBid:25000,fake:false,minV:80000,maxV:120000},
    ];
    let item = specials[idx];
    if(!item) return;
    // Add to current list temporarily
    aev2CurrentList.unshift({...item, id:Date.now()});
    aev2EnterRoom(0);
  };

  window.aev2ClaimTourneyReward = function() {
    aev2.cash += 50000;
    aev2.prestige += 5;
    aev2.tourney.claimed = true;
    aev2.tourney.wins = 0;
    aev2Audio.win();
    aev2SpawnConfetti();
    aev2UpdateUI();
    aev2RenderTourney();
    if(typeof toast==='function') toast('🏆 Turnuva ödülü alındı! +₺50,000 +5 Prestij','#ffd54f');
  };

  function aev2RenderBm() {
    let html = '';
    AEV2_BM_ITEMS.forEach((b,i)=>{
      html += `<div class="aev2-card" style="border-color:rgba(244,67,54,0.4);">
        <div style="font-size:3rem;text-align:center;margin-bottom:10px;">${b.i}</div>
        <h4 style="color:#f88;text-align:center;margin-bottom:6px;">${b.n}</h4>
        <div style="font-size:0.8rem;color:#aaa;text-align:center;margin-bottom:6px;">Risk: <strong style="color:#f44;">${b.risk}</strong></div>
        <div style="font-size:1rem;color:#ffd54f;text-align:center;font-weight:800;margin-bottom:14px;">${aev2Fmt(b.v)}</div>
        <button class="aev2-action-btn" style="width:100%;background:linear-gradient(135deg,#7b0000,#f44);color:#fff;" onclick="aev2BmBuy(${i})">🕵️ Satın Al</button>
      </div>`;
    });
    document.getElementById('aev2BmGrid').innerHTML = html;
  }

  window.aev2BmBuy = function(idx) {
    let item = AEV2_BM_ITEMS[idx];
    if(!item) return;
    if(aev2.cash < item.v) { if(typeof toast==='function') toast('Yeterli nakit yok!','#f44'); return; }
    if(aev2.inv.length>=8) { if(typeof toast==='function') toast('Portföy dolu!','#f44'); return; }
    aev2.cash -= item.v;
    // Risk check
    if(Math.random()<0.25) {
      aev2.cash = Math.floor(aev2.cash*0.5);
      aev2Audio.error();
      if(typeof toast==='function') toast('🚔 POLİS BASKINI! Nakitin yarısı müsadere edildi!','#f44');
    } else {
      aev2.inv.push({...item, realValue:Math.floor(item.v*1.5), buyPrice:item.v, r:3});
      aev2Audio.win();
      if(typeof toast==='function') toast('Mal teslim edildi... 🕵️','#ffd54f');
    }
    aev2UpdateUI();
  };

  window.aev2Reset = function() {
    if(!confirm('Tüm ilerleme silinecek. Emin misiniz?')) return;
    aev2 = { cash:1000, prestige:0, inv:[], stats:{won:0,spent:0,earned:0}, tourney:{wins:0,claimed:false,items:[]}, bmUnlocked:false, lastTicker:'' };
    aev2Save(); aev2UpdateUI(); aev2RefreshAuctions();
    if(typeof toast==='function') toast('Oyun sıfırlandı.','#aaa');
  };

  setTimeout(aev2Load, 200);
} catch(e) { console.error('AEV2 error:', e); }


/* =========================================================
   2. HAYAT RPG V2  (id='habit-sec')
========================================================= */
try {
  const hv2Styles = `
    #habit-sec .hv2-wrap { font-family:'Outfit',sans-serif; color:var(--tx); max-width:1040px; margin:0 auto; position:relative; }

    /* Character panel */
    #habit-sec .hv2-char { background:linear-gradient(135deg,rgba(0,0,0,0.7),rgba(20,0,40,0.8)); border:1px solid rgba(138,43,226,0.4); border-radius:20px; padding:24px; margin-bottom:20px; display:flex; gap:20px; flex-wrap:wrap; align-items:center; position:relative; overflow:hidden; }
    #habit-sec .hv2-char::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse at 20% 50%,rgba(138,43,226,0.1),transparent 60%); pointer-events:none; }

    /* Avatar */
    #habit-sec .hv2-avatar-big { font-size:5rem; width:110px; height:110px; border-radius:50%; background:radial-gradient(circle,rgba(138,43,226,0.3),rgba(0,0,0,0.7)); border:3px solid rgba(138,43,226,0.6); display:flex; align-items:center; justify-content:center; flex-shrink:0; box-shadow:0 0 30px rgba(138,43,226,0.4); transition:all 0.5s; position:relative; }
    #habit-sec .hv2-level-badge { position:absolute; bottom:-6px; right:-6px; background:linear-gradient(135deg,#9c27b0,#e040fb); color:#fff; font-size:0.7rem; font-weight:800; padding:3px 8px; border-radius:100px; }

    /* Stat bars */
    #habit-sec .hv2-bars { flex:1; min-width:260px; display:flex; flex-direction:column; gap:10px; }
    #habit-sec .hv2-bar-row { display:flex; align-items:center; gap:10px; }
    #habit-sec .hv2-bar-label { width:36px; font-size:0.8rem; font-weight:800; color:#e040fb; }
    #habit-sec .hv2-bar-track { flex:1; height:16px; background:rgba(0,0,0,0.6); border-radius:100px; overflow:hidden; position:relative; border:1px solid rgba(138,43,226,0.2); }
    #habit-sec .hv2-bar-fill { height:100%; border-radius:100px; transition:width 0.6s cubic-bezier(0.175,0.885,0.32,1.275); position:relative; overflow:hidden; }
    #habit-sec .hv2-bar-fill::after { content:''; position:absolute; top:0; left:-100%; width:100%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent); animation:barShimmer 2s ease-in-out infinite; }
    @keyframes barShimmer { to{left:200%} }
    #habit-sec .hv2-bar-text { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:0.65rem; font-weight:800; color:#fff; text-shadow:0 1px 2px #000; }

    /* XP bar */
    #habit-sec .hv2-xp-bar { background:rgba(0,0,0,0.6); border-radius:100px; overflow:hidden; height:20px; position:relative; border:1px solid rgba(33,150,243,0.3); margin-bottom:4px; }
    #habit-sec .hv2-xp-fill { height:100%; background:linear-gradient(90deg,#1565C0,#42A5F5,#00BCD4); border-radius:100px; transition:width 0.5s; position:relative; overflow:hidden; }
    #habit-sec .hv2-xp-fill::after { content:''; position:absolute; top:0; left:-100%; width:100%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent); animation:barShimmer 1.5s linear infinite; }

    /* Streak */
    #habit-sec .hv2-streak { background:rgba(255,100,0,0.15); border:1px solid rgba(255,100,0,0.4); border-radius:12px; padding:12px 18px; text-align:center; flex-shrink:0; }
    #habit-sec .hv2-streak-num { font-size:2.5rem; font-weight:900; color:#ff6d00; line-height:1; }
    #habit-sec .hv2-streak-fire { animation:fireFlicker 0.8s ease-in-out infinite; display:inline-block; }
    @keyframes fireFlicker { 0%,100%{transform:scale(1) rotate(-3deg)} 50%{transform:scale(1.1) rotate(3deg)} }

    /* Guild */
    #habit-sec .hv2-guild-box { background:rgba(0,0,0,0.4); border:1px solid rgba(138,43,226,0.3); border-radius:12px; padding:12px; text-align:center; min-width:100px; flex-shrink:0; }

    /* Tabs */
    #habit-sec .hv2-tabs { display:flex; gap:8px; margin-bottom:20px; flex-wrap:wrap; }
    #habit-sec .hv2-tab { padding:9px 18px; background:rgba(0,0,0,0.4); border:1px solid rgba(138,43,226,0.25); border-radius:100px; color:#aaa; cursor:pointer; transition:0.25s; font-size:0.9rem; white-space:nowrap; }
    #habit-sec .hv2-tab:hover { border-color:#e040fb; color:#e040fb; }
    #habit-sec .hv2-tab.active { background:linear-gradient(135deg,#6a1b9a,#e040fb); color:#fff; border-color:transparent; font-weight:700; }

    /* Panels */
    #habit-sec .hv2-panel { display:none; animation:hv2Fade 0.3s; }
    #habit-sec .hv2-panel.active { display:block; }
    @keyframes hv2Fade { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }

    /* Task cards */
    #habit-sec .hv2-task-list { display:flex; flex-direction:column; gap:10px; }
    #habit-sec .hv2-task { background:rgba(0,0,0,0.45); border:1px solid rgba(138,43,226,0.2); border-radius:12px; padding:14px 18px; display:flex; align-items:center; gap:14px; transition:0.2s; position:relative; overflow:hidden; }
    #habit-sec .hv2-task:hover { border-color:#e040fb; transform:translateX(4px); }
    #habit-sec .hv2-task.done { opacity:0.45; filter:grayscale(1); }
    #habit-sec .hv2-task-cat { font-size:1.6rem; flex-shrink:0; }
    #habit-sec .hv2-task-info { flex:1; }
    #habit-sec .hv2-task-title { font-size:1rem; margin-bottom:4px; }
    #habit-sec .hv2-task-meta { font-size:0.75rem; color:#aaa; display:flex; gap:10px; }
    #habit-sec .hv2-task-btn { background:linear-gradient(135deg,#6a1b9a,#e040fb); border:none; color:#fff; width:38px; height:38px; border-radius:10px; cursor:pointer; font-size:1.1rem; transition:0.2s; flex-shrink:0; }
    #habit-sec .hv2-task-btn:hover:not(:disabled) { transform:scale(1.1); }
    #habit-sec .hv2-task-btn:disabled { opacity:0.4; cursor:not-allowed; }
    #habit-sec .hv2-del-btn { background:transparent; border:1px solid rgba(244,67,54,0.4); color:#f88; width:32px; height:32px; border-radius:8px; cursor:pointer; font-size:0.9rem; transition:0.2s; flex-shrink:0; }
    #habit-sec .hv2-del-btn:hover { background:rgba(244,67,54,0.15); }

    /* Add task form */
    #habit-sec .hv2-add-form { display:flex; gap:10px; flex-wrap:wrap; background:rgba(0,0,0,0.4); padding:14px; border-radius:12px; margin-bottom:16px; }
    #habit-sec .hv2-input { flex:1; min-width:140px; background:rgba(255,255,255,0.07); border:1px solid rgba(138,43,226,0.3); color:#fff; padding:10px 14px; border-radius:8px; outline:none; font-size:0.9rem; }
    #habit-sec .hv2-select { background:rgba(0,0,0,0.7); border:1px solid rgba(138,43,226,0.3); color:#e040fb; padding:10px 12px; border-radius:8px; outline:none; cursor:pointer; font-size:0.85rem; }
    #habit-sec .hv2-add-btn { background:linear-gradient(135deg,#6a1b9a,#e040fb); border:none; color:#fff; padding:10px 18px; border-radius:8px; cursor:pointer; font-weight:700; transition:0.2s; }
    #habit-sec .hv2-add-btn:hover { transform:scale(1.04); }

    /* Skill categories */
    #habit-sec .hv2-cat-btns { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:14px; }
    #habit-sec .hv2-cat-btn { padding:6px 14px; border-radius:100px; border:1px solid rgba(138,43,226,0.3); background:rgba(0,0,0,0.4); color:#aaa; cursor:pointer; font-size:0.82rem; transition:0.2s; }
    #habit-sec .hv2-cat-btn.active { background:rgba(138,43,226,0.3); border-color:#e040fb; color:#fff; }

    /* Boss battle */
    #habit-sec .hv2-boss { background:linear-gradient(135deg,rgba(120,0,0,0.5),rgba(0,0,0,0.8)); border:2px solid rgba(244,67,54,0.5); border-radius:16px; padding:20px; margin-bottom:20px; }
    #habit-sec .hv2-boss-hp { height:24px; background:rgba(0,0,0,0.6); border-radius:100px; overflow:hidden; border:1px solid rgba(244,67,54,0.3); }
    #habit-sec .hv2-boss-fill { height:100%; background:linear-gradient(90deg,#7b0000,#f44); border-radius:100px; transition:width 0.5s; position:relative; overflow:hidden; }
    #habit-sec .hv2-boss-fill::after { content:''; position:absolute; top:0; left:-100%; width:100%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent); animation:barShimmer 1.5s linear infinite; }

    /* Achievements */
    #habit-sec .hv2-achieve-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:12px; }
    #habit-sec .hv2-achieve { background:rgba(0,0,0,0.5); border:1px solid rgba(138,43,226,0.25); border-radius:14px; padding:14px; text-align:center; transition:0.25s; }
    #habit-sec .hv2-achieve.unlocked { border-color:#e040fb; background:rgba(138,43,226,0.12); }
    #habit-sec .hv2-achieve.unlocked .ach-icon { animation:achievePop 0.5s cubic-bezier(0.175,0.885,0.32,1.275); }
    @keyframes achievePop { 0%{transform:scale(0)} 80%{transform:scale(1.2)} 100%{transform:scale(1)} }
    #habit-sec .ach-icon { font-size:2.5rem; margin-bottom:8px; display:block; }

    /* Guild selection */
    #habit-sec .hv2-guild-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:14px; }
    #habit-sec .hv2-guild-card { background:rgba(0,0,0,0.5); border:1px solid rgba(138,43,226,0.25); border-radius:14px; padding:18px; text-align:center; cursor:pointer; transition:0.25s; }
    #habit-sec .hv2-guild-card:hover { border-color:#e040fb; transform:translateY(-4px); }
    #habit-sec .hv2-guild-card.selected { border-color:#e040fb; background:rgba(138,43,226,0.15); }

    /* Level up overlay */
    #habit-sec .hv2-lvlup { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.92); z-index:99999; justify-content:center; align-items:center; flex-direction:column; }
    #habit-sec .hv2-lvlup-text { font-size:5rem; animation:hv2Pop 0.6s; }
    @keyframes hv2Pop { 0%{transform:scale(0);opacity:0} 80%{transform:scale(1.2)} 100%{transform:scale(1);opacity:1} }

    /* Crafting */
    #habit-sec .hv2-craft-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:14px; }
    #habit-sec .hv2-craft-card { background:rgba(0,0,0,0.5); border:1px solid rgba(138,43,226,0.25); border-radius:14px; padding:18px; text-align:center; transition:0.25s; }
    #habit-sec .hv2-craft-card:hover { border-color:#e040fb; }

    .hv2-mini-btn { background:transparent; border:1px solid rgba(138,43,226,0.4); color:#e040fb; padding:8px 16px; border-radius:100px; cursor:pointer; font-weight:600; transition:0.2s; }
    .hv2-mini-btn:hover { background:rgba(138,43,226,0.15); }
    .hv2-action-btn { background:linear-gradient(135deg,#6a1b9a,#e040fb); border:none; color:#fff; padding:10px 22px; border-radius:10px; cursor:pointer; font-weight:800; transition:0.2s; }
    .hv2-action-btn:hover:not(:disabled) { transform:scale(1.04); box-shadow:0 6px 20px rgba(224,64,251,0.4); }
    .hv2-action-btn:disabled { opacity:0.4; cursor:not-allowed; }
  `;
  document.head.insertAdjacentHTML('beforeend', `<style>${hv2Styles}</style>`);

  const hv2Html = `
    <section class="section ds-section" id="habit-sec">
      <div class="section-header">
        <button class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:100;cursor:pointer;" onclick="if(typeof dsGoToSection==='function') dsGoToSection('hubPage','')">◀ Ana Sayfa</button>
        <div class="section-badge" style="background:linear-gradient(135deg,#6a1b9a,#e040fb);color:#fff;">⚔️ RPG V2</div>
        <h2 class="section-title">Hayat RPG V2</h2>
        <p class="section-sub">Gerçek alışkanlıklarını tamamla, boss'ları yen, loncanı büyüt ve efsane ol!</p>
      </div>

      <div class="hv2-wrap">
        <!-- Level up overlay -->
        <div class="hv2-lvlup" id="hv2LvlUp" onclick="this.style.display='none'">
          <div class="hv2-lvlup-text">🎉 SEVİYE ATLADIN!</div>
          <div style="font-size:2.5rem;color:#e040fb;margin:10px 0;">Seviye <span id="hv2LvlUpNum">2</span></div>
          <div style="font-size:5rem;" id="hv2NewAvatarPreview">🧑</div>
          <p style="color:#aaa;margin-top:10px;">Devam etmek için tıkla.</p>
        </div>

        <!-- Character sheet -->
        <div class="hv2-char">
          <div class="hv2-avatar-big" id="hv2Avatar">
            😴
            <div class="hv2-level-badge" id="hv2LevelBadge">Lv1</div>
          </div>
          <div>
            <div style="font-size:1.4rem;font-weight:800;margin-bottom:4px;" id="hv2CharName">Kahraman</div>
            <div style="color:#e040fb;font-size:0.9rem;margin-bottom:8px;" id="hv2CharTitle">Uyuyan Tomurcuk</div>
            <div class="hv2-guild-box" id="hv2GuildDisplay" style="display:inline-block;font-size:0.8rem;">🛡️ Lonsuz</div>
          </div>
          <div class="hv2-bars" id="hv2StatBars">
            <div style="font-size:0.75rem;color:#aaa;margin-bottom:4px;">XP İlerlemesi</div>
            <div class="hv2-xp-bar"><div class="hv2-xp-fill" id="hv2XpFill" style="width:0%;"></div></div>
            <div style="font-size:0.72rem;color:#aaa;text-align:right;margin-bottom:8px;" id="hv2XpText">0/100 XP</div>
            <!-- Stat bars -->
            <div class="hv2-bar-row"><div class="hv2-bar-label">STR</div><div class="hv2-bar-track"><div class="hv2-bar-fill" id="hv2StrBar" style="width:10%;background:linear-gradient(90deg,#c62828,#ef9a9a);"></div><div class="hv2-bar-text" id="hv2StrTxt">10</div></div></div>
            <div class="hv2-bar-row"><div class="hv2-bar-label">INT</div><div class="hv2-bar-track"><div class="hv2-bar-fill" id="hv2IntBar" style="width:10%;background:linear-gradient(90deg,#1565C0,#90CAF9);"></div><div class="hv2-bar-text" id="hv2IntTxt">10</div></div></div>
            <div class="hv2-bar-row"><div class="hv2-bar-label">AGI</div><div class="hv2-bar-track"><div class="hv2-bar-fill" id="hv2AgiBar" style="width:10%;background:linear-gradient(90deg,#2e7d32,#a5d6a7);"></div><div class="hv2-bar-text" id="hv2AgiTxt">10</div></div></div>
            <div class="hv2-bar-row"><div class="hv2-bar-label">VIT</div><div class="hv2-bar-track"><div class="hv2-bar-fill" id="hv2VitBar" style="width:10%;background:linear-gradient(90deg,#ff6f00,#ffcc02);"></div><div class="hv2-bar-text" id="hv2VitTxt">10</div></div></div>
          </div>
          <div class="hv2-streak" id="hv2StreakBox">
            <div style="font-size:0.7rem;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Seri</div>
            <div class="hv2-streak-num"><span class="hv2-streak-fire">🔥</span><span id="hv2StreakNum">0</span></div>
            <div style="font-size:0.7rem;color:#ff6d00;">gün</div>
          </div>
          <div style="text-align:center;">
            <div style="font-size:0.7rem;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Altın</div>
            <div style="font-size:2rem;font-weight:900;color:#ffd54f;" id="hv2Gold">0</div>
            <div style="font-size:0.7rem;color:#aaa;">G</div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="hv2-tabs">
          <div class="hv2-tab active" onclick="hv2Tab('tasks')">📋 Görevler</div>
          <div class="hv2-tab" onclick="hv2Tab('boss')">👹 Boss Savaşı</div>
          <div class="hv2-tab" onclick="hv2Tab('guild')">🛡️ Lonca</div>
          <div class="hv2-tab" onclick="hv2Tab('craft')">⚗️ Üretim</div>
          <div class="hv2-tab" onclick="hv2Tab('achieve')">🏅 Başarımlar</div>
        </div>

        <!-- TASKS -->
        <div class="hv2-panel active" id="hv2-tasks">
          <div class="hv2-cat-btns" id="hv2CatFilter">
            <div class="hv2-cat-btn active" onclick="hv2FilterCat('all')">🌐 Tümü</div>
            <div class="hv2-cat-btn" onclick="hv2FilterCat('fitness')">💪 Fitness</div>
            <div class="hv2-cat-btn" onclick="hv2FilterCat('zihin')">🧠 Zihin</div>
            <div class="hv2-cat-btn" onclick="hv2FilterCat('sosyal')">👥 Sosyal</div>
            <div class="hv2-cat-btn" onclick="hv2FilterCat('uretkenlik')">⚡ Üretkenlik</div>
            <div class="hv2-cat-btn" onclick="hv2FilterCat('saglik')">❤️ Sağlık</div>
          </div>
          <div class="hv2-add-form">
            <input type="text" id="hv2TaskInput" class="hv2-input" placeholder="Yeni görev ekle...">
            <select id="hv2TaskCat" class="hv2-select">
              <option value="fitness">💪 Fitness</option>
              <option value="zihin">🧠 Zihin</option>
              <option value="sosyal">👥 Sosyal</option>
              <option value="uretkenlik">⚡ Üretkenlik</option>
              <option value="saglik">❤️ Sağlık</option>
            </select>
            <select id="hv2TaskDiff" class="hv2-select">
              <option value="1">Kolay (+10XP)</option>
              <option value="2">Orta (+25XP)</option>
              <option value="3">Zor (+50XP)</option>
            </select>
            <button class="hv2-add-btn" onclick="hv2AddTask()">+ Ekle</button>
          </div>
          <div class="hv2-task-list" id="hv2TaskList"></div>
        </div>

        <!-- BOSS BATTLE -->
        <div class="hv2-panel" id="hv2-boss">
          <div class="hv2-boss">
            <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;flex-wrap:wrap;">
              <div style="font-size:4rem;" id="hv2BossIcon">👿</div>
              <div style="flex:1;">
                <h3 style="color:#f44;margin-bottom:4px;" id="hv2BossName">Haftalık Dev: Tembellik</h3>
                <p style="font-size:0.85rem;color:#aaa;">Bu hafta 10 görev tamamlayarak boss'u yen!</p>
              </div>
              <div style="text-align:center;">
                <div style="font-size:0.75rem;color:#aaa;">Bu hafta tamamlanan</div>
                <div style="font-size:2.5rem;font-weight:900;color:#f44;" id="hv2BossProgress">0</div>
                <div style="font-size:0.75rem;color:#aaa;">/ 10 görev</div>
              </div>
            </div>
            <div style="font-size:0.8rem;color:#aaa;margin-bottom:6px;">Boss HP</div>
            <div class="hv2-boss-hp"><div class="hv2-boss-fill" id="hv2BossHp" style="width:100%;"></div></div>
            <div id="hv2BossReward" style="display:none;margin-top:16px;text-align:center;">
              <div style="font-size:3rem;">💀</div>
              <h4 style="color:#f44;margin:8px 0;">Boss yenildi!</h4>
              <button class="hv2-action-btn" style="background:linear-gradient(135deg,#7b0000,#f44);" onclick="hv2ClaimBoss()">Ödülü Al (500 XP + 200 G)</button>
            </div>
          </div>
          <div style="background:rgba(0,0,0,0.4);border:1px solid rgba(138,43,226,0.2);border-radius:14px;padding:16px;">
            <h4 style="color:#e040fb;margin-bottom:12px;">📜 Boss Tarihi</h4>
            <p style="color:#aaa;font-size:0.85rem;" id="hv2BossHistory">Henüz boss yenilmedi. Bu hafta 10 görev tamamla!</p>
          </div>
        </div>

        <!-- GUILD -->
        <div class="hv2-panel" id="hv2-guild">
          <h3 style="color:#e040fb;margin-bottom:6px;">🛡️ Lonca Seç</h3>
          <p style="color:#aaa;font-size:0.85rem;margin-bottom:20px;">Bir lonca seç ve özel bonuslar kazan!</p>
          <div class="hv2-guild-grid" id="hv2GuildGrid"></div>
          <div id="hv2GuildBonus" style="display:none;margin-top:20px;background:rgba(138,43,226,0.12);border:1px solid rgba(138,43,226,0.4);border-radius:14px;padding:16px;">
            <h4 style="color:#e040fb;margin-bottom:8px;">Aktif Lonca Bonusu</h4>
            <p id="hv2GuildBonusText" style="color:#aaa;font-size:0.9rem;"></p>
          </div>
        </div>

        <!-- CRAFTING -->
        <div class="hv2-panel" id="hv2-craft">
          <h3 style="color:#e040fb;margin-bottom:6px;">⚗️ Eşya Üretimi</h3>
          <p style="color:#aaa;font-size:0.85rem;margin-bottom:20px;">Yeterli XP biriktirerek özel eşyalar üret!</p>
          <div class="hv2-craft-grid" id="hv2CraftGrid"></div>
        </div>

        <!-- ACHIEVEMENTS -->
        <div class="hv2-panel" id="hv2-achieve">
          <h3 style="color:#e040fb;margin-bottom:16px;">🏅 Başarımlar</h3>
          <div class="hv2-achieve-grid" id="hv2AchieveGrid"></div>
        </div>

      </div>
    </section>
  `;
  document.body.insertAdjacentHTML('beforeend', hv2Html);

  /* ---- HV2 LOGIC ---- */
  const hv2Audio = {
    ctx: null,
    init() { if(!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){} } },
    osc(t,f,d,v=0.1) {
      if(!this.ctx) return;
      let o=this.ctx.createOscillator(), g=this.ctx.createGain();
      o.type=t; o.frequency.setValueAtTime(f,this.ctx.currentTime);
      g.gain.setValueAtTime(v,this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001,this.ctx.currentTime+d);
      o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime+d);
    },
    done() { this.osc('sine',800,0.08,0.1); setTimeout(()=>this.osc('sine',1200,0.12,0.1),80); },
    lvlUp() { [400,600,900,1200].forEach((f,i)=>setTimeout(()=>this.osc('square',f,0.2,0.15),i*100)); },
    dmg() { this.osc('sawtooth',120,0.35,0.2); },
    craft() { [800,1000,1200,1500].forEach((f,i)=>setTimeout(()=>this.osc('triangle',f,0.15,0.12),i*80)); }
  };

  const HV2_AVATARS = ['😴','🧒','🧑','⚔️','🦸','🧙','👑','🌟'];
  const HV2_TITLES = ['Uyuyan Tomurcuk','Hevesli Çırak','Cesaretli Maceracı','Savaşçı Ruh','Onurlu Şövalye','Büyülü Üstat','Kraliyet Efsanesi','Ölümsüz Efsane'];
  const HV2_CATS = { fitness:{i:'💪',color:'#f44',stat:'str'}, zihin:{i:'🧠',color:'#2196F3',stat:'int'}, sosyal:{i:'👥',color:'#9C27B0',stat:'agi'}, uretkenlik:{i:'⚡',color:'#FF9800',stat:'str'}, saglik:{i:'❤️',color:'#4CAF50',stat:'vit'} };
  const HV2_GUILDS = [
    { id:'akademisyen', n:'Akademisyenler', i:'📚', bonus:'INT görevlerinden +50% XP', stat:'int', mult:1.5 },
    { id:'atlet', n:'Atletler', i:'🏋️', bonus:'Fitness görevlerinden +50% XP', stat:'str', mult:1.5 },
    { id:'sanatci', n:'Sanatçılar', i:'🎨', bonus:'Sosyal görevlerinden +50% XP', stat:'agi', mult:1.5 },
    { id:'girisimci', n:'Girişimciler', i:'💼', bonus:'Üretkenlik görevlerinden +50% XP', stat:'str', mult:1.5 }
  ];
  const HV2_CRAFTS = [
    { id:'sword', n:'Efsanevi Kılıç', i:'⚔️', cost:500, desc:'STR +10 kalıcı bonus', stat:'str', bonus:10 },
    { id:'tome', n:'Bilgelik Kitabı', i:'📖', cost:600, desc:'INT +10 kalıcı bonus', stat:'int', bonus:10 },
    { id:'boots', n:'Hız Çizmeleri', i:'👟', cost:450, desc:'AGI +10 kalıcı bonus', stat:'agi', bonus:10 },
    { id:'shield', n:'Canlılık Kalkanı', i:'🛡️', cost:700, desc:'VIT +10 kalıcı bonus', stat:'vit', bonus:10 },
    { id:'crown', n:'Kahraman Tacı', i:'👑', cost:2000, desc:'Tüm statlar +15', stat:'all', bonus:15 }
  ];
  const HV2_ACHIEVEMENTS = [
    { id:'first', n:'İlk Adım', i:'🌱', desc:'İlk görevini tamamla', check:s=>s.totalDone>=1 },
    { id:'ten', n:'On Görev', i:'🎯', desc:'10 görev tamamla', check:s=>s.totalDone>=10 },
    { id:'fifty', n:'Elli Görev', i:'🔥', desc:'50 görev tamamla', check:s=>s.totalDone>=50 },
    { id:'boss1', n:'Boss Avcısı', i:'💀', desc:'İlk boss\'u yen', check:s=>s.bossKills>=1 },
    { id:'streak7', n:'Haftanın Seri', i:'📅', desc:'7 günlük seri tut', check:s=>s.streak>=7 },
    { id:'streak30', n:'Bir Aylık Seri', i:'🗓️', desc:'30 günlük seri tut', check:s=>s.streak>=30 },
    { id:'guild', n:'Loncacı', i:'🛡️', desc:'Bir lonca katıl', check:s=>!!s.guild },
    { id:'craft1', n:'Demirci', i:'⚗️', desc:'İlk eşyayı üret', check:s=>s.crafted>=1 },
    { id:'lvl10', n:'Usta Seviye', i:'⭐', desc:'Seviye 10\'a ulaş', check:s=>s.level>=10 }
  ];

  let hv2 = {
    xp:0, level:1, gold:0,
    stats: { str:10, int:10, agi:10, vit:10 },
    tasks: [],
    streak:0, lastTaskDate:'',
    weekTasks:0, bossKills:0, totalDone:0,
    bossClaimed:false,
    guild:null,
    crafted:0, craftedItems:[],
    achievements:[],
    catFilter:'all'
  };

  function hv2Load() {
    let s = localStorage.getItem('ds_hv2_save');
    if(s) { try { hv2 = {...hv2, ...JSON.parse(s)}; } catch(e){} }
    hv2UpdateStreak();
    hv2UpdateUI();
    hv2RenderGuild();
    hv2RenderCraft();
    hv2RenderAchievements();
  }
  function hv2Save() { localStorage.setItem('ds_hv2_save', JSON.stringify(hv2)); }

  function hv2UpdateStreak() {
    let today = new Date().toDateString();
    if(hv2.lastTaskDate && hv2.lastTaskDate !== today) {
      let last = new Date(hv2.lastTaskDate), now = new Date(today);
      let diff = Math.floor((now-last)/(1000*60*60*24));
      if(diff>1) hv2.streak=0;
    }
  }

  function hv2GetXpNeeded() { return hv2.level * 100 + (hv2.level-1)*50; }
  function hv2GetAvatar() { let idx=Math.min(Math.floor((hv2.level-1)/3),HV2_AVATARS.length-1); return HV2_AVATARS[idx]; }
  function hv2GetTitle() { let idx=Math.min(Math.floor((hv2.level-1)/3),HV2_TITLES.length-1); return HV2_TITLES[idx]; }

  function hv2UpdateUI() {
    let xpNeeded = hv2GetXpNeeded();
    document.getElementById('hv2XpFill').style.width = Math.min(hv2.xp/xpNeeded*100,100)+'%';
    document.getElementById('hv2XpText').textContent = hv2.xp+'/'+xpNeeded+' XP';
    document.getElementById('hv2Avatar').innerHTML = hv2GetAvatar()+'<div class="hv2-level-badge">Lv'+hv2.level+'</div>';
    document.getElementById('hv2CharTitle').textContent = hv2GetTitle();
    document.getElementById('hv2Gold').textContent = hv2.gold;
    document.getElementById('hv2StreakNum').textContent = hv2.streak;

    // Stat bars (max 200)
    ['str','int','agi','vit'].forEach(s=>{
      let pct=Math.min(hv2.stats[s]/200*100,100);
      let bar=document.getElementById('hv2'+s.charAt(0).toUpperCase()+s.slice(1)+'Bar');
      let txt=document.getElementById('hv2'+s.charAt(0).toUpperCase()+s.slice(1)+'Txt');
      if(bar) bar.style.width=pct+'%';
      if(txt) txt.textContent=hv2.stats[s];
    });

    // Guild display
    let gd = document.getElementById('hv2GuildDisplay');
    if(gd) {
      let g = HV2_GUILDS.find(x=>x.id===hv2.guild);
      gd.textContent = g ? g.i+' '+g.n : '🛡️ Loncasız';
    }

    hv2RenderTasks();
    hv2RenderBoss();
    hv2CheckAchievements();
    hv2Save();
  }

  window.hv2Tab = function(tab) {
    hv2Audio.init();
    document.querySelectorAll('#habit-sec .hv2-panel').forEach(p=>p.classList.remove('active'));
    document.querySelectorAll('#habit-sec .hv2-tab').forEach(t=>t.classList.remove('active'));
    let panel = document.getElementById('hv2-'+tab);
    if(panel) panel.classList.add('active');
    document.querySelectorAll('#habit-sec .hv2-tab').forEach(t=>{
      if(t.getAttribute('onclick')&&t.getAttribute('onclick').includes("'"+tab+"'")) t.classList.add('active');
    });
    if(tab==='guild') hv2RenderGuild();
    if(tab==='craft') hv2RenderCraft();
    if(tab==='achieve') hv2RenderAchievements();
    if(tab==='boss') hv2RenderBoss();
  };

  window.hv2FilterCat = function(cat) {
    hv2.catFilter = cat;
    document.querySelectorAll('#habit-sec .hv2-cat-btn').forEach(b=>{
      b.classList.toggle('active', b.getAttribute('onclick').includes("'"+cat+"'"));
    });
    hv2RenderTasks();
  };

  function hv2RenderTasks() {
    let tasks = hv2.tasks;
    if(hv2.catFilter!=='all') tasks = tasks.filter(t=>t.cat===hv2.catFilter);
    let html = tasks.length===0?'<div style="color:#aaa;text-align:center;padding:30px;">Görev yok. Yeni bir görev ekle!</div>':'';
    tasks.forEach(t=>{
      let catDef = HV2_CATS[t.cat]||{i:'📋',color:'#aaa'};
      let xpGain = [0,10,25,50][t.diff];
      let goldGain = [0,5,15,30][t.diff];
      html += `<div class="hv2-task ${t.done?'done':''}" id="hv2T_${t.id}">
        <div class="hv2-task-cat" style="color:${catDef.color};">${catDef.i}</div>
        <div class="hv2-task-info">
          <div class="hv2-task-title">${t.text}</div>
          <div class="hv2-task-meta">
            <span style="color:${catDef.color};">${t.cat}</span>
            <span>+${xpGain} XP</span><span>+${goldGain} G</span>
            <span style="color:${{1:'#4CAF50',2:'#FF9800',3:'#f44'}[t.diff]};">${{1:'Kolay',2:'Orta',3:'Zor'}[t.diff]}</span>
          </div>
        </div>
        <button class="hv2-task-btn" onclick="hv2CompleteTask('${t.id}')" ${t.done?'disabled':''}>✓</button>
        <button class="hv2-del-btn" onclick="hv2DeleteTask('${t.id}')">🗑</button>
      </div>`;
    });
    document.getElementById('hv2TaskList').innerHTML = html;
  }

  window.hv2AddTask = function() {
    hv2Audio.init();
    let inp = document.getElementById('hv2TaskInput');
    let cat = document.getElementById('hv2TaskCat').value;
    let diff = parseInt(document.getElementById('hv2TaskDiff').value);
    if(!inp.value.trim()) return;
    hv2.tasks.push({ id:'t'+Date.now(), text:inp.value.trim(), cat, diff, done:false });
    inp.value='';
    hv2UpdateUI();
  };

  window.hv2CompleteTask = function(id) {
    hv2Audio.init();
    let t = hv2.tasks.find(x=>x.id===id);
    if(!t||t.done) return;
    t.done = true;
    let xpGain = [0,10,25,50][t.diff];
    let goldGain = [0,5,15,30][t.diff];
    // Guild bonus
    let guild = HV2_GUILDS.find(g=>g.id===hv2.guild);
    if(guild && HV2_CATS[t.cat] && HV2_CATS[t.cat].stat===guild.stat) xpGain = Math.floor(xpGain*guild.mult);
    hv2.xp += xpGain;
    hv2.gold += goldGain;
    // Stat gain
    let catDef = HV2_CATS[t.cat];
    if(catDef) hv2.stats[catDef.stat] = (hv2.stats[catDef.stat]||10) + t.diff;
    hv2.totalDone++;
    hv2.weekTasks++;
    hv2.lastTaskDate = new Date().toDateString();
    hv2.streak = (hv2.streak||0) + 1;
    hv2Audio.done();
    if(typeof toast==='function') toast('+'+xpGain+' XP, +'+goldGain+' G','#e040fb');
    // Level up check
    while(hv2.xp >= hv2GetXpNeeded()) {
      hv2.xp -= hv2GetXpNeeded();
      hv2.level++;
      hv2Audio.lvlUp();
      let lvlUpEl = document.getElementById('hv2LvlUp');
      let lvlNumEl = document.getElementById('hv2LvlUpNum');
      let avPrev = document.getElementById('hv2NewAvatarPreview');
      if(lvlUpEl) { if(lvlNumEl) lvlNumEl.textContent=hv2.level; if(avPrev) avPrev.textContent=hv2GetAvatar(); lvlUpEl.style.display='flex'; }
    }
    hv2UpdateUI();
  };

  window.hv2DeleteTask = function(id) {
    hv2.tasks = hv2.tasks.filter(t=>t.id!==id);
    hv2UpdateUI();
  };

  function hv2RenderBoss() {
    let prog = Math.min(hv2.weekTasks, 10);
    document.getElementById('hv2BossProgress').textContent = prog;
    document.getElementById('hv2BossHp').style.width = Math.max(0,100-prog*10)+'%';
    let bossNames = ['Tembellik','Erteleme','Vazgeçiş','Şüphe','Korku'];
    let bossEmojis = ['👿','🤡','😈','💀','🕷️'];
    let idx = (hv2.bossKills) % bossNames.length;
    document.getElementById('hv2BossName').textContent = 'Haftalık Dev: '+bossNames[idx];
    document.getElementById('hv2BossIcon').textContent = bossEmojis[idx];
    let reward = document.getElementById('hv2BossReward');
    if(reward) reward.style.display = (prog>=10&&!hv2.bossClaimed)?'block':'none';
    let hist = document.getElementById('hv2BossHistory');
    if(hist) hist.textContent = hv2.bossKills>0?hv2.bossKills+' boss yenildi! Efsane kahraman!':'Henüz boss yenilmedi. Bu hafta 10 görev tamamla!';
  }

  window.hv2ClaimBoss = function() {
    hv2Audio.lvlUp();
    hv2.xp += 500;
    hv2.gold += 200;
    hv2.bossKills++;
    hv2.bossClaimed = true;
    hv2.weekTasks = 0;
    if(typeof toast==='function') toast('💀 Boss yenildi! +500 XP +200 G','#f44');
    // Reset weekly
    setTimeout(()=>hv2.bossClaimed=false, 1000*60*60*24*7);
    hv2UpdateUI();
    hv2RenderBoss();
  };

  function hv2RenderGuild() {
    let html = '';
    HV2_GUILDS.forEach(g=>{
      let selected = hv2.guild===g.id;
      html += `<div class="hv2-guild-card ${selected?'selected':''}" onclick="hv2JoinGuild('${g.id}')">
        <div style="font-size:3rem;margin-bottom:10px;">${g.i}</div>
        <h4 style="color:#e040fb;margin-bottom:6px;">${g.n}</h4>
        <p style="font-size:0.8rem;color:#aaa;">${g.bonus}</p>
        ${selected?'<div style="margin-top:12px;font-size:0.8rem;color:#4CAF50;font-weight:700;">✓ Aktif Lonca</div>':''}
      </div>`;
    });
    document.getElementById('hv2GuildGrid').innerHTML = html;
    let bonusBox = document.getElementById('hv2GuildBonus');
    let bonusTxt = document.getElementById('hv2GuildBonusText');
    if(hv2.guild && bonusBox) {
      let g = HV2_GUILDS.find(x=>x.id===hv2.guild);
      bonusBox.style.display='block';
      if(bonusTxt) bonusTxt.textContent = g?g.bonus:'';
    } else if(bonusBox) bonusBox.style.display='none';
  }

  window.hv2JoinGuild = function(id) {
    hv2Audio.init();
    hv2.guild = id;
    hv2Save();
    hv2UpdateUI();
    hv2RenderGuild();
    let g = HV2_GUILDS.find(x=>x.id===id);
    if(typeof toast==='function') toast('🛡️ '+g.n+' loncanıza katıldınız!','#e040fb');
  };

  function hv2RenderCraft() {
    let html = '';
    HV2_CRAFTS.forEach(c=>{
      let crafted = hv2.craftedItems.includes(c.id);
      html += `<div class="hv2-craft-card">
        <div style="font-size:3rem;margin-bottom:10px;">${c.i}</div>
        <h4 style="color:#e040fb;margin-bottom:6px;">${c.n}</h4>
        <p style="font-size:0.8rem;color:#aaa;margin-bottom:12px;">${c.desc}</p>
        <div style="font-size:0.85rem;color:#ffd54f;margin-bottom:12px;">Maliyet: ${c.cost} XP</div>
        ${crafted
          ? '<div style="color:#4CAF50;font-weight:700;">✓ Üretildi</div>'
          : `<button class="hv2-action-btn" ${hv2.xp<c.cost?'disabled':''} onclick="hv2Craft('${c.id}')">Üret</button>`
        }
      </div>`;
    });
    document.getElementById('hv2CraftGrid').innerHTML = html;
  }

  window.hv2Craft = function(id) {
    let c = HV2_CRAFTS.find(x=>x.id===id);
    if(!c||hv2.craftedItems.includes(id)) return;
    if(hv2.xp < c.cost) { if(typeof toast==='function') toast('Yeterli XP yok!','#f44'); return; }
    hv2.xp -= c.cost;
    hv2.craftedItems.push(id);
    hv2.crafted++;
    hv2Audio.craft();
    if(c.stat==='all') { hv2.stats.str+=c.bonus; hv2.stats.int+=c.bonus; hv2.stats.agi+=c.bonus; hv2.stats.vit+=c.bonus; }
    else hv2.stats[c.stat] = (hv2.stats[c.stat]||0)+c.bonus;
    if(typeof toast==='function') toast('⚗️ '+c.n+' üretildi! '+c.desc,'#e040fb');
    hv2UpdateUI();
    hv2RenderCraft();
  };

  function hv2CheckAchievements() {
    HV2_ACHIEVEMENTS.forEach(a=>{
      if(!hv2.achievements.includes(a.id) && a.check(hv2)) {
        hv2.achievements.push(a.id);
        if(typeof toast==='function') toast('🏅 Başarım Açıldı: '+a.n,'#ffd54f');
        hv2Audio.craft();
      }
    });
  }

  function hv2RenderAchievements() {
    let html = '';
    HV2_ACHIEVEMENTS.forEach(a=>{
      let unlocked = hv2.achievements.includes(a.id);
      html += `<div class="hv2-achieve ${unlocked?'unlocked':''}">
        <span class="ach-icon" style="${!unlocked?'filter:grayscale(1);opacity:0.4;':''}">${a.i}</span>
        <div style="font-weight:700;font-size:0.9rem;margin-bottom:4px;color:${unlocked?'#e040fb':'#aaa'};">${a.n}</div>
        <div style="font-size:0.75rem;color:#aaa;">${a.desc}</div>
        ${unlocked?'<div style="font-size:0.7rem;color:#4CAF50;margin-top:6px;font-weight:700;">✓ Tamamlandı</div>':''}
      </div>`;
    });
    document.getElementById('hv2AchieveGrid').innerHTML = html;
  }

  setTimeout(hv2Load, 300);
} catch(e) { console.error('HV2 error:', e); }


/* =========================================================
   3. ZEN KAFE V2  (id='zencafe-sec')
========================================================= */
try {
  const zcV2Styles = `
    #zencafe-sec .zv2-wrap { font-family:'Outfit',sans-serif; color:var(--tx); max-width:900px; margin:0 auto; position:relative; }

    /* Animated cafe background */
    #zencafe-sec .zv2-bg { position:relative; background:linear-gradient(135deg,rgba(30,15,5,0.95),rgba(15,5,0,0.98)); border-radius:20px; padding:20px; border:1px solid rgba(141,110,99,0.3); overflow:hidden; }
    #zencafe-sec .zv2-bg::before { content:''; position:absolute; inset:0; background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"); pointer-events:none; }

    /* Steam animation */
    #zencafe-sec .zv2-steam { position:absolute; bottom:100%; left:50%; transform:translateX(-50%); pointer-events:none; }
    #zencafe-sec .zv2-steam-particle { position:absolute; width:6px; background:rgba(255,255,255,0.2); border-radius:100px; animation:steamRise 2s ease-out infinite; }
    @keyframes steamRise { 0%{opacity:0.6;transform:translateY(0) scaleX(1)} 100%{opacity:0;transform:translateY(-60px) scaleX(2)} }

    /* Stats bar */
    #zencafe-sec .zv2-stats { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:20px; }
    #zencafe-sec .zv2-stat { flex:1; min-width:80px; background:rgba(0,0,0,0.4); border:1px solid rgba(141,110,99,0.3); border-radius:12px; padding:12px; text-align:center; }
    #zencafe-sec .zv2-stat .lbl { font-size:0.7rem; color:#8D6E63; text-transform:uppercase; letter-spacing:1px; }
    #zencafe-sec .zv2-stat .val { font-size:1.4rem; font-weight:800; color:#FFCCBC; margin-top:4px; }

    /* Star rating */
    #zencafe-sec .zv2-stars { display:flex; gap:4px; justify-content:center; margin:8px 0; }
    #zencafe-sec .zv2-star { font-size:1.4rem; transition:0.3s; }
    #zencafe-sec .zv2-star.lit { filter:drop-shadow(0 0 8px #ffd54f); animation:starPulse 1s ease-in-out; }
    @keyframes starPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.3)} }

    /* Customer area */
    #zencafe-sec .zv2-customer-zone { display:flex; gap:16px; align-items:flex-start; flex-wrap:wrap; margin-bottom:20px; }
    #zencafe-sec .zv2-customer-card { flex:1; min-width:220px; background:rgba(0,0,0,0.45); border:1px solid rgba(141,110,99,0.3); border-radius:16px; padding:18px; position:relative; }
    #zencafe-sec .zv2-customer-avatar-big { font-size:4rem; text-align:center; margin-bottom:10px; position:relative; }
    #zencafe-sec .zv2-mood { position:absolute; top:-6px; right:calc(50% - 36px); font-size:1.4rem; animation:moodBounce 1.5s ease-in-out infinite; }
    @keyframes moodBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
    #zencafe-sec .zv2-speech { background:rgba(255,255,255,0.07); border:1px solid rgba(141,110,99,0.4); border-radius:14px; padding:12px 16px; font-size:0.9rem; color:#FFCCBC; position:relative; }
    #zencafe-sec .zv2-hint { margin-top:10px; background:rgba(141,110,99,0.15); border-radius:8px; padding:8px 12px; font-size:0.8rem; color:#8D6E63; }

    /* Cup graphic */
    #zencafe-sec .zv2-counter { display:flex; gap:20px; align-items:flex-start; flex-wrap:wrap; }
    #zencafe-sec .zv2-cup-area { display:flex; flex-direction:column; align-items:center; gap:10px; }
    #zencafe-sec .zv2-cup { width:100px; height:160px; border:4px solid rgba(255,255,255,0.2); border-top:none; border-radius:0 0 24px 24px; position:relative; background:rgba(255,255,255,0.04); overflow:hidden; }
    #zencafe-sec .zv2-cup-layers { position:absolute; bottom:0; left:0; width:100%; display:flex; flex-direction:column; justify-content:flex-end; height:100%; }
    #zencafe-sec .zv2-layer { width:100%; transition:height 0.4s; display:flex; align-items:center; justify-content:center; font-size:0.7rem; color:rgba(0,0,0,0.5); font-weight:700; }
    #zencafe-sec .zv2-cup::after { content:''; position:absolute; top:8px; left:10%; width:80%; height:4px; background:rgba(255,255,255,0.1); border-radius:100px; }
    #zencafe-sec .zv2-steam-cup { position:relative; height:30px; width:100%; }
    #zencafe-sec .zv2-cup-steam { position:absolute; bottom:0; width:4px; background:rgba(255,255,255,0.15); border-radius:100px; animation:cupSteam 2s ease-out infinite; }
    #zencafe-sec .zv2-cup-steam:nth-child(1) { left:30%; animation-delay:0s; }
    #zencafe-sec .zv2-cup-steam:nth-child(2) { left:50%; animation-delay:0.4s; }
    #zencafe-sec .zv2-cup-steam:nth-child(3) { left:70%; animation-delay:0.8s; }
    @keyframes cupSteam { 0%{height:0;opacity:0.5} 100%{height:25px;opacity:0} }

    /* Ingredients grid */
    #zencafe-sec .zv2-ing-grid { display:flex; flex-wrap:wrap; gap:10px; flex:1; align-content:flex-start; }
    #zencafe-sec .zv2-ing-btn { background:rgba(0,0,0,0.5); border:1px solid rgba(141,110,99,0.3); border-radius:12px; padding:12px 16px; cursor:pointer; transition:0.2s; display:flex; flex-direction:column; align-items:center; gap:4px; min-width:80px; }
    #zencafe-sec .zv2-ing-btn:hover { border-color:#8D6E63; transform:translateY(-4px); box-shadow:0 8px 20px rgba(0,0,0,0.4); }
    #zencafe-sec .zv2-ing-icon { font-size:2rem; }
    #zencafe-sec .zv2-ing-name { font-size:0.72rem; font-weight:700; color:#8D6E63; text-align:center; }

    /* Coin animation */
    #zencafe-sec .zv2-coin { position:fixed; font-size:1.5rem; pointer-events:none; z-index:9999; animation:coinFly 1s ease-out forwards; }
    @keyframes coinFly { 0%{opacity:1;transform:translateY(0) scale(1)} 100%{opacity:0;transform:translateY(-60px) scale(0.5)} }

    /* Upgrade shop */
    #zencafe-sec .zv2-up-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:14px; }
    #zencafe-sec .zv2-up-card { background:rgba(0,0,0,0.5); border:1px solid rgba(141,110,99,0.3); border-radius:14px; padding:18px; text-align:center; transition:0.25s; }
    #zencafe-sec .zv2-up-card:hover { border-color:#8D6E63; transform:translateY(-4px); }
    #zencafe-sec .zv2-up-card.maxed { border-color:#4CAF50;background:rgba(76,175,80,0.08); }

    /* Recipe book */
    #zencafe-sec .zv2-recipe-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:12px; }
    #zencafe-sec .zv2-recipe-card { background:rgba(0,0,0,0.4); border:1px solid rgba(141,110,99,0.2); border-radius:12px; padding:14px; }
    #zencafe-sec .zv2-recipe-card.seasonal { border-color:rgba(255,215,0,0.4);background:rgba(255,215,0,0.05); }

    .zv2-mini-btn { background:transparent; border:1px solid rgba(141,110,99,0.4); color:#8D6E63; padding:8px 16px; border-radius:100px; cursor:pointer; font-weight:600; transition:0.2s; }
    .zv2-mini-btn:hover { background:rgba(141,110,99,0.15); }
    .zv2-action-btn { background:linear-gradient(135deg,#5D4037,#8D6E63); border:none; color:#fff; padding:10px 22px; border-radius:10px; cursor:pointer; font-weight:800; transition:0.2s; }
    .zv2-action-btn:hover:not(:disabled) { transform:scale(1.04); box-shadow:0 6px 20px rgba(141,110,99,0.4); }
    .zv2-action-btn:disabled { opacity:0.4; cursor:not-allowed; }
    #zencafe-sec .zv2-tabs { display:flex; gap:8px; margin-bottom:20px; flex-wrap:wrap; }
    #zencafe-sec .zv2-tab { padding:9px 18px; background:rgba(0,0,0,0.4); border:1px solid rgba(141,110,99,0.25); border-radius:100px; color:#aaa; cursor:pointer; transition:0.25s; font-size:0.9rem; white-space:nowrap; }
    #zencafe-sec .zv2-tab:hover { border-color:#8D6E63; color:#FFCCBC; }
    #zencafe-sec .zv2-tab.active { background:linear-gradient(135deg,#5D4037,#8D6E63); color:#fff; border-color:transparent; font-weight:700; }
    #zencafe-sec .zv2-panel { display:none; animation:zv2Fade 0.3s; }
    #zencafe-sec .zv2-panel.active { display:block; }
    @keyframes zv2Fade { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
  `;
  document.head.insertAdjacentHTML('beforeend', `<style>${zcV2Styles}</style>`);

  const zcV2Html = `
    <section class="section ds-section" id="zencafe-sec">
      <div class="section-header">
        <button class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:100;cursor:pointer;" onclick="if(typeof dsGoToSection==='function') dsGoToSection('hubPage','')">◀ Ana Sayfa</button>
        <div class="section-badge" style="background:linear-gradient(135deg,#5D4037,#8D6E63);color:#fff;">☕ Kafe V2</div>
        <h2 class="section-title">Zen Kafe V2</h2>
        <p class="section-sub">Müşteri tercihlerini oku, mükemmel içeçekler hazırla, kafeni zirveye taşı!</p>
      </div>

      <div class="zv2-wrap">
        <!-- Stats -->
        <div class="zv2-stats">
          <div class="zv2-stat"><div class="lbl">Günlük Ciro</div><div class="val" id="zv2Money">₺0</div></div>
          <div class="zv2-stat"><div class="lbl">Mutlu Müşteri</div><div class="val" style="color:#4CAF50;" id="zv2Happy">0</div></div>
          <div class="zv2-stat"><div class="lbl">Toplam Bahşiş</div><div class="val" style="color:#ffd54f;" id="zv2Tips">₺0</div></div>
          <div class="zv2-stat">
            <div class="lbl">Kafe Puanı</div>
            <div class="zv2-stars" id="zv2Stars">⭐⭐⭐⭐⭐</div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="zv2-tabs">
          <div class="zv2-tab active" onclick="zv2Tab('serve')">☕ Kafe</div>
          <div class="zv2-tab" onclick="zv2Tab('recipes')">📖 Menü</div>
          <div class="zv2-tab" onclick="zv2Tab('upgrades')">🔧 Ekipman</div>
        </div>

        <!-- SERVE TAB -->
        <div class="zv2-panel active" id="zv2-serve">
          <div class="zv2-bg">
            <!-- Customer zone -->
            <div class="zv2-customer-zone">
              <div class="zv2-customer-card">
                <div class="zv2-customer-avatar-big">
                  <span id="zv2CusEmoji">👤</span>
                  <span class="zv2-mood" id="zv2CusMood">😐</span>
                </div>
                <div class="zv2-speech" id="zv2CusSpeech">Müşteri bekleniyor...</div>
                <div class="zv2-hint" id="zv2CusHint" style="display:none;">💡 İpucu: Bekleniyor...</div>
              </div>
              <div style="flex:1; min-width:200px;">
                <!-- Cup with layers -->
                <div class="zv2-cup-area">
                  <div class="zv2-steam-cup">
                    <div class="zv2-cup-steam"></div>
                    <div class="zv2-cup-steam"></div>
                    <div class="zv2-cup-steam"></div>
                  </div>
                  <div class="zv2-cup">
                    <div class="zv2-cup-layers" id="zv2CupLayers"></div>
                  </div>
                  <div style="font-size:0.8rem;color:#8D6E63;margin-top:6px;" id="zv2CupContents">Boş bardak</div>
                </div>
                <div style="display:flex;gap:10px;margin-top:16px;justify-content:center;">
                  <button class="zv2-mini-btn" onclick="zv2Trash()">🗑️ Dök</button>
                  <button class="zv2-action-btn" onclick="zv2Serve()">🛎️ Servis Et</button>
                </div>
              </div>
            </div>

            <!-- Ingredients -->
            <div class="zv2-counter">
              <div class="zv2-ing-grid" id="zv2IngGrid"></div>
            </div>
          </div>
        </div>

        <!-- RECIPES TAB -->
        <div class="zv2-panel" id="zv2-recipes">
          <h3 style="color:#FFCCBC;margin-bottom:16px;">📖 Menü & Tarifler</h3>
          <div class="zv2-recipe-grid" id="zv2RecipeGrid"></div>
        </div>

        <!-- UPGRADES TAB -->
        <div class="zv2-panel" id="zv2-upgrades">
          <h3 style="color:#FFCCBC;margin-bottom:6px;">🔧 Ekipman Mağazası</h3>
          <p style="color:#aaa;font-size:0.85rem;margin-bottom:20px;">Daha iyi ekipmanlarla müşteri memnuniyetini ve kazancını artır!</p>
          <div class="zv2-up-grid" id="zv2UpGrid"></div>
        </div>
      </div>
    </section>
  `;
  document.body.insertAdjacentHTML('beforeend', zcV2Html);

  /* ---- ZCV2 LOGIC ---- */
  const zcV2Audio = {
    ctx: null,
    init() { if(!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){} } },
    osc(t,f,d,v=0.1) {
      if(!this.ctx) return;
      let o=this.ctx.createOscillator(), g=this.ctx.createGain();
      o.type=t; o.frequency.setValueAtTime(f,this.ctx.currentTime);
      g.gain.setValueAtTime(v,this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001,this.ctx.currentTime+d);
      o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime+d);
    },
    pour() {
      if(!this.ctx) return;
      let bs=this.ctx.createBufferSource(), g=this.ctx.createGain();
      let buf=this.ctx.createBuffer(1,this.ctx.sampleRate*0.4,this.ctx.sampleRate);
      let data=buf.getChannelData(0);
      for(let i=0;i<data.length;i++) data[i]=(Math.random()*2-1)*0.08;
      let f=this.ctx.createBiquadFilter(); f.type='lowpass'; f.frequency.value=600;
      g.gain.setValueAtTime(0.3,this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001,this.ctx.currentTime+0.4);
      bs.buffer=buf; bs.connect(f); f.connect(g); g.connect(this.ctx.destination); bs.start();
    },
    ding() { this.osc('sine',1600,0.15,0.12); setTimeout(()=>this.osc('sine',2200,0.35,0.18),100); },
    error() { this.osc('sawtooth',180,0.3,0.12); }
  };

  const ZV2_INGS = {
    espresso: { n:'Espresso', i:'☕', c:'#3E2723', warm:true },
    milk: { n:'Süt', i:'🥛', c:'#FFFDE7', warm:false },
    matcha: { n:'Matcha', i:'🍵', c:'#689F38', warm:true },
    neon: { n:'Neon Şurup', i:'🧪', c:'#00BCD4', warm:false },
    cherry: { n:'Vişne', i:'🍒', c:'#C62828', warm:false },
    vanilla: { n:'Vanilya', i:'🌿', c:'#F5F5F5', warm:false },
    caramel: { n:'Karamel', i:'🍯', c:'#FF8F00', warm:true },
    chocolate: { n:'Çikolata', i:'🍫', c:'#4E342E', warm:true },
    ice: { n:'Buz', i:'🧊', c:'rgba(200,230,255,0.5)', solid:true },
    cream: { n:'Krema', i:'🥐', c:'#FFF8E1', warm:false },
    berry: { n:'Böğürtlen', i:'🫐', c:'#7B1FA2', warm:false },
    mint: { n:'Nane', i:'🌱', c:'#00E676', warm:false }
  };

  const ZV2_RECIPES = [
    { n:'Klasik Latte', ings:['espresso','milk'], reward:30, hint:'Kahve + Süt isteyen biri var gibi...' },
    { n:'Buzlu Matcha', ings:['matcha','ice'], reward:35, hint:'Yeşil ve soğuk bir şey arıyorlar' },
    { n:'Karamel Macchiato', ings:['espresso','caramel','milk'], reward:50, hint:'Tatlı ve sıcak bir şey istiyorlar' },
    { n:'Neon Slushie', ings:['neon','ice'], reward:40, hint:'Parlak ve soğuk bir şey lazım' },
    { n:'Vişne Sorbet', ings:['cherry','ice'], reward:38, hint:'Kırmızı ve soğuk bir şey' },
    { n:'Çikolatalı Kapuçino', ings:['espresso','chocolate','cream'], reward:60, hint:'Zengin ve kremalı bir içecek' },
    { n:'Böğürtlen Lemonade', ings:['berry','vanilla','ice'], reward:45, hint:'Meyveli ve serinletici' },
    { n:'Nane Matcha', ings:['matcha','mint','ice'], reward:55, hint:'Serinletici, yeşil bir şey' },
    { n:'Sıcak Çikolata', ings:['chocolate','milk','cream'], reward:52, hint:'Tatlı ve sıcaklık veren' },
    { n:'Karamel Buzlu Kahve', ings:['espresso','caramel','ice'], reward:58, hint:'Soğuk kahve ama tatlı olsun' },
    { n:'Neon Espresso', ings:['espresso','neon'], reward:65, hint:'Parlayan bir kahve istiyor...' },
    { n:'Ultimate Dream', ings:['espresso','caramel','chocolate','cream'], reward:100, hint:'Dört malzeme! Özel bir şey istiyor!' }
  ];

  const ZV2_CUSTOMERS = [
    { e:'👨‍💻', t:'Tüm gece kod yazdım. En sert kahveyi ver!', mood:'😤', hint:'Klasik kahveli bir şey iyi olur', req:['espresso','espresso'] },
    { e:'👩‍🎨', t:'Rengarenk ve yaratıcı bir şey istiyorum!', mood:'😄', hint:'Parlak renklere bayılıyorum', req:['neon','ice'] },
    { e:'🧘‍♀️', t:'Detoks zamanı! Hafif ve doğal.', mood:'😌', hint:'Yeşil içecekler sağlıklı', req:['matcha','milk'] },
    { e:'🧛‍♂️', t:'Kan kırmızısı, buz gibi bir şey!', mood:'😈', hint:'Kırmızı ve soğuk olmalı', req:['cherry','ice'] },
    { e:'👦', t:'Sütlü kahve lütfen.', mood:'😊', hint:'Basit kahve + süt yeterli', req:['espresso','milk'] },
    { e:'🕵️', t:'Gizli görevdeyim. Dikkat çekmeyeyim...', mood:'🤫', hint:'Parlayan soğuk kahve gibi...', req:['espresso','neon','ice'] },
    { e:'👩‍💼', t:'Toplantıya geç kaldım! Hızlı bir şeyler!', mood:'😰', hint:'Enerjik ve hızlı', req:['espresso','caramel'] },
    { e:'🧓', t:'Eski tarz bir şey, çocukluğumdan...', mood:'🥺', hint:'Çikolata nostaljik hissettirir', req:['chocolate','milk'] },
    { e:'🏋️', t:'Antrenman öncesi enerji lazım!', mood:'💪', hint:'Enerji veren şeyler', req:['espresso','mint'] },
    { e:'👰', t:'Romantik bir şey olsun, sevgilim için!', mood:'❤️', hint:'Tatlı ve özel bir şey', req:['caramel','vanilla','cream'] }
  ];

  const ZV2_UPGRADES = [
    { id:'grinder', n:'Kaliteli Öğütücü', i:'⚙️', cost:200, desc:'Espresso tadı %20 artar, bahşiş bonus', lvl:0, max:3, bonus:'+20% bahşiş' },
    { id:'frother', n:'Süt Köpürtücü', i:'🌪️', cost:300, desc:'Krema içeren içecekler 2x değer', lvl:0, max:3, bonus:'+50 ₺ süt bonus' },
    { id:'cooler', n:'Premium Soğutucu', i:'🧊', cost:150, desc:'Buz içerikli içecekler +30% değer', lvl:0, max:3, bonus:'+30% soğuk bonus' },
    { id:'display', n:'Özel Sunum', i:'🎨', cost:400, desc:'Mükemmel eşleşmede +100% bahşiş', lvl:0, max:2, bonus:'Mükemmel bonus' },
    { id:'speed', n:'Hızlı Servis', i:'⚡', cost:250, desc:'Müşteri sabır süresi uzuyor', lvl:0, max:3, bonus:'Daha toleranslı müşteriler' }
  ];

  let zv2 = {
    money:0, happy:0, tips:0, stars:3,
    glass:[], cupIsHot:false,
    upgrades:{grinder:0,frother:0,cooler:0,display:0,speed:0},
    totalServed:0, perfectServes:0
  };
  let zv2Customer = null;

  function zv2Load() {
    let s = localStorage.getItem('ds_zv2_save');
    if(s) { try { zv2 = {...zv2, ...JSON.parse(s)}; } catch(e){} }
    zv2UpdateUI();
    zv2RenderIngredients();
    zv2NextCustomer();
    zv2RenderRecipes();
    zv2RenderUpgrades();
  }
  function zv2Save() { localStorage.setItem('ds_zv2_save', JSON.stringify(zv2)); }

  function zv2UpdateUI() {
    document.getElementById('zv2Money').textContent = '₺'+zv2.money;
    document.getElementById('zv2Happy').textContent = zv2.happy;
    document.getElementById('zv2Tips').textContent = '₺'+zv2.tips;
    // Stars
    let stars = document.getElementById('zv2Stars');
    let rating = Math.max(1, Math.min(5, Math.round(zv2.stars)));
    if(stars) stars.innerHTML = '⭐'.repeat(rating) + '☆'.repeat(5-rating);
    zv2Save();
  }

  window.zv2Tab = function(tab) {
    zcV2Audio.init();
    document.querySelectorAll('#zencafe-sec .zv2-panel').forEach(p=>p.classList.remove('active'));
    document.querySelectorAll('#zencafe-sec .zv2-tab').forEach(t=>t.classList.remove('active'));
    let panel = document.getElementById('zv2-'+tab);
    if(panel) panel.classList.add('active');
    document.querySelectorAll('#zencafe-sec .zv2-tab').forEach(t=>{
      if(t.getAttribute('onclick')&&t.getAttribute('onclick').includes("'"+tab+"'")) t.classList.add('active');
    });
  };

  function zv2RenderIngredients() {
    let html = '';
    for(let k in ZV2_INGS) {
      let ing = ZV2_INGS[k];
      html += `<button class="zv2-ing-btn" onclick="zv2AddIng('${k}')">
        <div class="zv2-ing-icon">${ing.i}</div>
        <div class="zv2-ing-name">${ing.n}</div>
      </button>`;
    }
    document.getElementById('zv2IngGrid').innerHTML = html;
  }

  function zv2NextCustomer() {
    zv2Customer = ZV2_CUSTOMERS[Math.floor(Math.random()*ZV2_CUSTOMERS.length)];
    document.getElementById('zv2CusEmoji').textContent = zv2Customer.e;
    document.getElementById('zv2CusMood').textContent = zv2Customer.mood;
    document.getElementById('zv2CusSpeech').textContent = zv2Customer.t;
    // Show hint with 60% chance (or 90% if speed upgrade)
    let hintChance = 0.6 + zv2.upgrades.speed*0.1;
    let hintEl = document.getElementById('zv2CusHint');
    if(hintEl) {
      if(Math.random()<hintChance) { hintEl.style.display='block'; hintEl.textContent='💡 '+zv2Customer.hint; }
      else hintEl.style.display='none';
    }
  }

  window.zv2AddIng = function(k) {
    zcV2Audio.init();
    if(zv2.glass.length>=5) { if(typeof toast==='function') toast('Bardak doldu!','#ff9800'); return; }
    let ing = ZV2_INGS[k];
    zv2.glass.push(k);
    zcV2Audio.pour();
    zv2UpdateCup();
  };

  function zv2UpdateCup() {
    let layers = document.getElementById('zv2CupLayers');
    let contents = document.getElementById('zv2CupContents');
    if(!layers) return;
    let h = Math.min(100/Math.max(1,zv2.glass.length), 40);
    let html = '';
    zv2.glass.forEach(k=>{
      let ing = ZV2_INGS[k];
      html += `<div class="zv2-layer" style="height:${h}%;background:${ing.c};min-height:20px;">${ing.i}</div>`;
    });
    layers.innerHTML = html;
    if(contents) contents.textContent = zv2.glass.length===0?'Boş bardak':zv2.glass.map(k=>ZV2_INGS[k].n).join(', ');
  }

  window.zv2Trash = function() {
    zcV2Audio.init();
    zv2.glass=[];
    zv2UpdateCup();
  };

  window.zv2Serve = function() {
    zcV2Audio.init();
    if(!zv2Customer) return;
    if(zv2.glass.length===0) { if(typeof toast==='function') toast('Boş bardak veremezsin!','#f44'); return; }

    let req = [...zv2Customer.req];
    let contents = [...zv2.glass];
    let matched = true;
    req.forEach(r=>{ let idx=contents.indexOf(r); if(idx!==-1) contents.splice(idx,1); else matched=false; });
    let perfect = matched && contents.length===0;

    let recipe = ZV2_RECIPES.find(r=>{ let a=[...r.ings].sort().join(','); let b=[...zv2Customer.req].sort().join(','); return a===b; });

    if(matched) {
      zcV2Audio.ding();
      let baseTip = 10 + Math.floor(Math.random()*20);
      if(perfect) baseTip += 20 + zv2.upgrades.display*100;
      // Equipment bonuses
      let hasHot = zv2.glass.some(k=>ZV2_INGS[k].warm);
      let hasCold = zv2.glass.includes('ice');
      if(hasHot) baseTip += zv2.upgrades.grinder*20;
      if(hasCold) baseTip += zv2.upgrades.cooler*15;
      if(zv2.glass.includes('cream')||zv2.glass.includes('milk')) baseTip += zv2.upgrades.frother*50;

      zv2.money += baseTip;
      zv2.tips += baseTip;
      zv2.happy++;
      zv2.totalServed++;
      if(perfect) zv2.perfectServes++;
      // Update stars based on performance
      zv2.stars = Math.min(5, 1 + (zv2.happy/10));
      document.getElementById('zv2CusMood').textContent = '😄';
      if(typeof toast==='function') toast((perfect?'⭐ Mükemmel! ':'✓ Tamamdır! ')+'Bahşiş: ₺'+baseTip, '#4CAF50');
      // Coin animation
      let coin = document.createElement('div');
      coin.className='zv2-coin';
      coin.style.left=Math.random()*60+20+'vw';
      coin.style.top='50vh';
      coin.textContent='🪙';
      document.body.appendChild(coin);
      setTimeout(()=>coin.remove(), 1100);
    } else {
      zcV2Audio.error();
      document.getElementById('zv2CusMood').textContent='😠';
      zv2.stars = Math.max(1, zv2.stars-0.2);
      if(typeof toast==='function') toast('Müşteri beğenmedi...','#f44');
    }
    zv2.glass=[];
    zv2UpdateCup();
    zv2UpdateUI();
    setTimeout(zv2NextCustomer, 800);
  };

  function zv2RenderRecipes() {
    let now = new Date().getMonth();
    let seasonalIdx = now % 4; // 0=kış, 1=ilkbahar, 2=yaz, 3=sonbahar
    let seasonNames = ['❄️ Kış Özel','🌸 İlkbahar Özel','☀️ Yaz Özel','🍂 Sonbahar Özel'];
    let html = '';
    ZV2_RECIPES.forEach((r,i)=>{
      let isSeasonal = i < 2 && seasonalIdx===Math.floor(i/3);
      html += `<div class="zv2-recipe-card ${isSeasonal?'seasonal':''}">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
          <div style="font-size:1.5rem;">${r.ings.map(k=>ZV2_INGS[k]?.i||'').join('')}</div>
          <h4 style="color:#FFCCBC;">${r.n}${isSeasonal?' <span style="font-size:0.7rem;color:#ffd54f;">'+seasonNames[seasonalIdx]+'</span>':''}</h4>
        </div>
        <div style="font-size:0.8rem;color:#8D6E63;margin-bottom:6px;">Malzemeler: ${r.ings.map(k=>ZV2_INGS[k]?.n||k).join(' + ')}</div>
        <div style="font-size:0.85rem;color:#ffd54f;font-weight:700;">Taban Ödül: ₺${r.reward}</div>
        ${isSeasonal?'<div style="font-size:0.75rem;color:#ffd54f;margin-top:4px;">🌟 Sezonluk bonus aktif!</div>':''}
      </div>`;
    });
    let g = document.getElementById('zv2RecipeGrid');
    if(g) g.innerHTML = html;
  }

  function zv2RenderUpgrades() {
    let html = '';
    ZV2_UPGRADES.forEach(u=>{
      let lvl = zv2.upgrades[u.id]||0;
      let isMax = lvl>=u.max;
      let cost = u.cost * Math.pow(2,lvl);
      html += `<div class="zv2-up-card ${isMax?'maxed':''}">
        <div style="font-size:3rem;margin-bottom:8px;">${u.i}</div>
        <h4 style="color:#FFCCBC;margin-bottom:6px;">${u.n}</h4>
        <p style="font-size:0.8rem;color:#8D6E63;margin-bottom:6px;">${u.desc}</p>
        <div style="font-size:0.75rem;color:#ffd54f;margin-bottom:12px;">${u.bonus}</div>
        <div style="font-size:0.8rem;color:#aaa;margin-bottom:10px;">Seviye: ${lvl}/${u.max}</div>
        ${isMax
          ? '<div style="color:#4CAF50;font-weight:700;font-size:0.85rem;">✓ Maksimum Seviye</div>'
          : `<button class="zv2-action-btn" ${zv2.money<cost?'disabled':''} onclick="zv2Upgrade('${u.id}')">Yükselt (₺${cost})</button>`
        }
      </div>`;
    });
    let g = document.getElementById('zv2UpGrid');
    if(g) g.innerHTML = html;
  }

  window.zv2Upgrade = function(id) {
    let u = ZV2_UPGRADES.find(x=>x.id===id);
    if(!u) return;
    let lvl = zv2.upgrades[id]||0;
    if(lvl>=u.max) return;
    let cost = u.cost * Math.pow(2,lvl);
    if(zv2.money<cost) { if(typeof toast==='function') toast('Yeterli para yok!','#f44'); return; }
    zv2.money -= cost;
    zv2.upgrades[id] = lvl+1;
    zcV2Audio.ding();
    if(typeof toast==='function') toast('⬆️ '+u.n+' yükseltildi!','#FFCCBC');
    zv2UpdateUI();
    zv2RenderUpgrades();
  };

  setTimeout(zv2Load, 400);
} catch(e) { console.error('ZCV2 error:', e); }


/* =========================================================
   4. KOZMİK TERRAFORMER V2  (id='terra-sec')
========================================================= */
try {
  const tfV2Styles = `
    #terra-sec .tv2-wrap { font-family:'Outfit',sans-serif; color:var(--tx); max-width:960px; margin:0 auto; position:relative; }

    /* Planet canvas wrapper */
    #terra-sec .tv2-planet-zone { position:relative; width:300px; height:300px; margin:0 auto 30px; }
    #terra-sec #tv2PlanetCanvas { width:300px; height:300px; border-radius:50%; display:block; cursor:pointer; }
    #terra-sec .tv2-planet-ring { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:380px; height:380px; border-radius:50%; border:2px solid rgba(255,255,255,0.06); pointer-events:none; animation:ringRotate 20s linear infinite; }
    @keyframes ringRotate { from{transform:translate(-50%,-50%) rotateX(70deg) rotate(0deg)} to{transform:translate(-50%,-50%) rotateX(70deg) rotate(360deg)} }
    #terra-sec .tv2-atmos-glow { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:320px; height:320px; border-radius:50%; pointer-events:none; transition:box-shadow 2s; }

    /* Biome badges */
    #terra-sec .tv2-biomes { display:flex; flex-wrap:wrap; gap:8px; justify-content:center; margin-bottom:20px; }
    #terra-sec .tv2-biome { padding:5px 14px; border-radius:100px; border:1px solid rgba(76,175,80,0.3); background:rgba(0,0,0,0.4); color:#aaa; font-size:0.8rem; transition:0.4s; }
    #terra-sec .tv2-biome.active { border-color:#4CAF50; background:rgba(76,175,80,0.15); color:#4CAF50; font-weight:700; animation:biomePop 0.5s cubic-bezier(0.175,0.885,0.32,1.275); }
    @keyframes biomePop { 0%{transform:scale(0.8)} 80%{transform:scale(1.1)} 100%{transform:scale(1)} }

    /* Planet type selection */
    #terra-sec .tv2-type-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:14px; margin-bottom:24px; }
    #terra-sec .tv2-type-card { background:rgba(0,0,0,0.5); border:2px solid rgba(76,175,80,0.2); border-radius:14px; padding:18px; text-align:center; cursor:pointer; transition:0.3s; }
    #terra-sec .tv2-type-card:hover { border-color:#4CAF50; transform:translateY(-4px); }
    #terra-sec .tv2-type-card.selected { border-color:#4CAF50; background:rgba(76,175,80,0.12); }

    /* Resource bars */
    #terra-sec .tv2-res-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:24px; }
    #terra-sec .tv2-res-card { background:rgba(0,0,0,0.45); border:1px solid rgba(76,175,80,0.2); border-radius:14px; padding:16px; text-align:center; }
    #terra-sec .tv2-res-val { font-size:1.8rem; font-weight:800; margin:6px 0 2px; }
    #terra-sec .tv2-res-bps { font-size:0.75rem; color:#aaa; }

    /* Progress bars with emoji indicators */
    #terra-sec .tv2-progress-row { display:flex; align-items:center; gap:10px; margin-bottom:14px; }
    #terra-sec .tv2-prog-icon { width:28px; text-align:center; font-size:1.2rem; }
    #terra-sec .tv2-prog-track { flex:1; height:14px; background:rgba(0,0,0,0.6); border-radius:100px; overflow:hidden; border:1px solid rgba(76,175,80,0.2); }
    #terra-sec .tv2-prog-fill { height:100%; border-radius:100px; transition:width 0.5s; }
    #terra-sec .tv2-prog-val { min-width:60px; text-align:right; font-size:0.8rem; color:#aaa; }

    /* Shop */
    #terra-sec .tv2-shop-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:14px; }
    #terra-sec .tv2-shop-item { background:rgba(0,0,0,0.45); border:1px solid rgba(76,175,80,0.2); border-radius:14px; padding:16px; display:flex; align-items:center; gap:12px; transition:0.2s; }
    #terra-sec .tv2-shop-item:hover { border-color:#4CAF50; transform:translateY(-3px); }
    #terra-sec .tv2-buy-btn { background:transparent; border:1px solid #4CAF50; color:#4CAF50; padding:8px 14px; border-radius:8px; cursor:pointer; font-weight:700; transition:0.2s; white-space:nowrap; font-size:0.82rem; }
    #terra-sec .tv2-buy-btn:hover:not(:disabled) { background:#4CAF50; color:#000; }
    #terra-sec .tv2-buy-btn:disabled { opacity:0.3; cursor:not-allowed; border-color:#555; color:#555; }

    /* Tech tree */
    #terra-sec .tv2-tech-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:14px; }
    #terra-sec .tv2-tech-card { background:rgba(0,0,0,0.5); border:1px solid rgba(76,175,80,0.2); border-radius:14px; padding:16px; text-align:center; transition:0.25s; }
    #terra-sec .tv2-tech-card.unlocked { border-color:#4CAF50; background:rgba(76,175,80,0.1); }
    #terra-sec .tv2-tech-card.locked { opacity:0.5; }

    /* Disaster event */
    #terra-sec .tv2-disaster { position:fixed; top:80px; right:20px; background:rgba(120,0,0,0.9); border:2px solid #f44; border-radius:14px; padding:16px 20px; z-index:9999; max-width:280px; animation:disasterSlide 0.4s; }
    @keyframes disasterSlide { from{opacity:0;transform:translateX(100px)} to{opacity:1;transform:translateX(0)} }

    /* Particle canvas */
    #terra-sec #tv2Particles { position:absolute; top:0; left:0; width:300px; height:300px; pointer-events:none; border-radius:50%; overflow:hidden; }

    /* Population milestone */
    #terra-sec .tv2-milestone { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.88); z-index:99999; justify-content:center; align-items:center; flex-direction:column; }
    #terra-sec .tv2-milestone.show { display:flex; animation:hv2Fade 0.4s; }

    /* Offline box */
    #terra-sec .tv2-offline { display:none; background:rgba(0,229,255,0.08); border:1px solid rgba(0,229,255,0.3); border-radius:12px; padding:14px; margin-bottom:20px; }

    .tv2-mini-btn { background:transparent; border:1px solid rgba(76,175,80,0.4); color:#4CAF50; padding:8px 16px; border-radius:100px; cursor:pointer; font-weight:600; transition:0.2s; }
    .tv2-mini-btn:hover { background:rgba(76,175,80,0.15); }
    .tv2-action-btn { background:linear-gradient(135deg,#1B5E20,#4CAF50); border:none; color:#fff; padding:10px 22px; border-radius:10px; cursor:pointer; font-weight:800; transition:0.2s; }
    .tv2-action-btn:hover:not(:disabled) { transform:scale(1.04); box-shadow:0 6px 20px rgba(76,175,80,0.4); }
    .tv2-action-btn:disabled { opacity:0.4; cursor:not-allowed; }
    #terra-sec .tv2-tabs { display:flex; gap:8px; margin-bottom:20px; flex-wrap:wrap; }
    #terra-sec .tv2-tab { padding:9px 18px; background:rgba(0,0,0,0.4); border:1px solid rgba(76,175,80,0.25); border-radius:100px; color:#aaa; cursor:pointer; transition:0.25s; font-size:0.9rem; white-space:nowrap; }
    #terra-sec .tv2-tab:hover { border-color:#4CAF50; color:#a5d6a7; }
    #terra-sec .tv2-tab.active { background:linear-gradient(135deg,#1B5E20,#4CAF50); color:#fff; border-color:transparent; font-weight:700; }
    #terra-sec .tv2-panel { display:none; animation:tv2Fade 0.3s; }
    #terra-sec .tv2-panel.active { display:block; }
    @keyframes tv2Fade { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
  `;
  document.head.insertAdjacentHTML('beforeend', `<style>${tfV2Styles}</style>`);

  const tfV2Html = `
    <section class="section ds-section" id="terra-sec">
      <div class="section-header">
        <button class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:100;cursor:pointer;" onclick="if(typeof dsGoToSection==='function') dsGoToSection('hubPage','')">◀ Ana Sayfa</button>
        <div class="section-badge" style="background:linear-gradient(135deg,#1B5E20,#4CAF50);color:#fff;">🌍 Terraformer V2</div>
        <h2 class="section-title">Kozmik Terraformer V2</h2>
        <p class="section-sub">Ölü gezegeni hayata kavuştur, felakete karşı koy, bir medeniyet kur!</p>
      </div>

      <div class="tv2-wrap">
        <!-- Population milestone overlay -->
        <div class="tv2-milestone" id="tv2Milestone">
          <div style="font-size:5rem;" id="tv2MilestoneIcon">🎉</div>
          <h2 style="color:#4CAF50;margin:10px 0;" id="tv2MilestoneTitle">Nüfus Patlaması!</h2>
          <p style="color:#aaa;text-align:center;" id="tv2MilestoneDesc">Gezegeninde 1.000 kişi yaşıyor!</p>
          <button class="tv2-action-btn" style="margin-top:20px;" onclick="document.getElementById('tv2Milestone').classList.remove('show')">Harika!</button>
        </div>

        <!-- Offline box -->
        <div class="tv2-offline" id="tv2Offline">
          <h4 style="color:#00e5ff;margin-bottom:6px;">🚀 Geri Döndünüz!</h4>
          <p id="tv2OfflineText" style="font-size:0.9rem;color:#aaa;"></p>
          <button class="tv2-mini-btn" style="margin-top:10px;" onclick="document.getElementById('tv2Offline').style.display='none'">Harika!</button>
        </div>

        <!-- Planet type selection (shown only if no planet chosen yet) -->
        <div id="tv2PlanetSelect" style="">
          <h3 style="color:#4CAF50;text-align:center;margin-bottom:6px;">🪐 Gezegen Türü Seç</h3>
          <p style="color:#aaa;text-align:center;font-size:0.85rem;margin-bottom:20px;">Başlangıç istatistikleri seçimine göre değişir.</p>
          <div class="tv2-type-grid">
            <div class="tv2-type-card" onclick="tv2SelectPlanet('mars')">
              <div style="font-size:3rem;margin-bottom:10px;">🏜️</div>
              <h4 style="color:#FF7043;margin-bottom:6px;">Kum Gezegeni (Mars)</h4>
              <p style="font-size:0.8rem;color:#aaa;">O2 üretimi yavaş, ama H2O hızlı başlar. Kuru ve çıplak.</p>
              <div style="font-size:0.75rem;margin-top:10px;color:#FF7043;">Başlangıç: O2×0.5, H2O×2, Bio×1</div>
            </div>
            <div class="tv2-type-card" onclick="tv2SelectPlanet('ice')">
              <div style="font-size:3rem;margin-bottom:10px;">🧊</div>
              <h4 style="color:#29B6F6;margin-bottom:6px;">Buz Gezegeni</h4>
              <p style="font-size:0.8rem;color:#aaa;">H2O çok hızlı üretilir ama Bio başlamak zor.</p>
              <div style="font-size:0.75rem;margin-top:10px;color:#29B6F6;">Başlangıç: O2×1, H2O×3, Bio×0.5</div>
            </div>
            <div class="tv2-type-card" onclick="tv2SelectPlanet('carbon')">
              <div style="font-size:3rem;margin-bottom:10px;">🌑</div>
              <h4 style="color:#78909C;margin-bottom:6px;">Karbon Gezegeni</h4>
              <p style="font-size:0.8rem;color:#aaa;">Bio üretimi hızlı, ama O2 ve H2O dengesi hassas.</p>
              <div style="font-size:0.75rem;margin-top:10px;color:#78909C;">Başlangıç: O2×1.5, H2O×1, Bio×2</div>
            </div>
          </div>
        </div>

        <!-- Main terraforming UI (hidden until planet selected) -->
        <div id="tv2Main" style="display:none;">
          <!-- Planet visual -->
          <div style="text-align:center;margin-bottom:10px;">
            <div style="font-size:1.2rem;font-weight:800;color:#4CAF50;letter-spacing:2px;text-transform:uppercase;" id="tv2StageTxt">Evre 1: Çorak Gezegen</div>
            <div style="font-size:0.85rem;color:#aaa;margin:4px 0;" id="tv2PlanetTypeTxt"></div>
          </div>

          <div class="tv2-planet-zone">
            <canvas id="tv2PlanetCanvas" width="300" height="300" onclick="tv2Audio.init()"></canvas>
            <canvas id="tv2Particles" width="300" height="300"></canvas>
            <div class="tv2-atmos-glow" id="tv2AtmosGlow"></div>
          </div>

          <!-- Biome discoveries -->
          <div class="tv2-biomes" id="tv2Biomes">
            <div class="tv2-biome" id="biome-tundra">🏔️ Tundra</div>
            <div class="tv2-biome" id="biome-ocean">🌊 Okyanus</div>
            <div class="tv2-biome" id="biome-forest">🌲 Orman</div>
            <div class="tv2-biome" id="biome-desert">🏜️ Çöl</div>
            <div class="tv2-biome" id="biome-savanna">🌾 Savana</div>
          </div>

          <!-- Resources -->
          <div class="tv2-res-grid">
            <div class="tv2-res-card">
              <div style="font-size:0.75rem;color:#aaa;text-transform:uppercase;letter-spacing:1px;">Oksijen (O₂)</div>
              <div class="tv2-res-val" style="color:#00E5FF;" id="tv2ValO2">0</div>
              <div class="tv2-res-bps" id="tv2BpsO2">+0/sn</div>
            </div>
            <div class="tv2-res-card">
              <div style="font-size:0.75rem;color:#aaa;text-transform:uppercase;letter-spacing:1px;">Su (H₂O)</div>
              <div class="tv2-res-val" style="color:#2196F3;" id="tv2ValH2O">0</div>
              <div class="tv2-res-bps" id="tv2BpsH2O">+0/sn</div>
            </div>
            <div class="tv2-res-card">
              <div style="font-size:0.75rem;color:#aaa;text-transform:uppercase;letter-spacing:1px;">Biyokütle</div>
              <div class="tv2-res-val" style="color:#4CAF50;" id="tv2ValBio">0</div>
              <div class="tv2-res-bps" id="tv2BpsBio">+0/sn</div>
            </div>
          </div>

          <!-- Progress bars with emojis -->
          <div style="background:rgba(0,0,0,0.4);border:1px solid rgba(76,175,80,0.2);border-radius:14px;padding:16px;margin-bottom:20px;">
            <h4 style="color:#4CAF50;margin-bottom:14px;">🌱 Terraforming İlerlemesi</h4>
            <div class="tv2-progress-row">
              <div class="tv2-prog-icon">💨</div>
              <div class="tv2-prog-track"><div class="tv2-prog-fill" id="tv2ProgO2" style="background:linear-gradient(90deg,#006064,#00E5FF);width:0%;"></div></div>
              <div class="tv2-prog-val" id="tv2ProgO2Txt">0%</div>
            </div>
            <div class="tv2-progress-row">
              <div class="tv2-prog-icon">💧</div>
              <div class="tv2-prog-track"><div class="tv2-prog-fill" id="tv2ProgH2O" style="background:linear-gradient(90deg,#0D47A1,#2196F3);width:0%;"></div></div>
              <div class="tv2-prog-val" id="tv2ProgH2OTxt">0%</div>
            </div>
            <div class="tv2-progress-row">
              <div class="tv2-prog-icon">🌿</div>
              <div class="tv2-prog-track"><div class="tv2-prog-fill" id="tv2ProgBio" style="background:linear-gradient(90deg,#1B5E20,#4CAF50);width:0%;"></div></div>
              <div class="tv2-prog-val" id="tv2ProgBioTxt">0%</div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px;padding-top:14px;border-top:1px solid rgba(76,175,80,0.2);">
              <div>
                <div style="font-size:0.75rem;color:#aaa;">Nüfus</div>
                <div style="font-size:1.8rem;font-weight:800;color:#4CAF50;" id="tv2Population">0</div>
              </div>
              <button class="tv2-mini-btn" onclick="tv2Reset()" style="border-color:#f44;color:#f88;">🗑️ Sıfırla</button>
            </div>
          </div>

          <!-- Tabs -->
          <div class="tv2-tabs">
            <div class="tv2-tab active" onclick="tv2Tab('infra')">🏗️ Altyapı</div>
            <div class="tv2-tab" onclick="tv2Tab('tech')">🔬 Teknoloji</div>
            <div class="tv2-tab" onclick="tv2Tab('events')">⚠️ Olaylar</div>
          </div>

          <!-- INFRASTRUCTURE -->
          <div class="tv2-panel active" id="tv2-infra">
            <div class="tv2-shop-grid" id="tv2ShopGrid"></div>
          </div>

          <!-- TECH TREE -->
          <div class="tv2-panel" id="tv2-tech">
            <h3 style="color:#4CAF50;margin-bottom:16px;">🔬 Terraforming Teknolojileri</h3>
            <div class="tv2-tech-grid" id="tv2TechGrid"></div>
          </div>

          <!-- EVENTS LOG -->
          <div class="tv2-panel" id="tv2-events">
            <h3 style="color:#4CAF50;margin-bottom:16px;">⚠️ Olay Günlüğü</h3>
            <div id="tv2EventLog" style="background:rgba(0,0,0,0.5);border-radius:12px;padding:16px;max-height:400px;overflow-y:auto;display:flex;flex-direction:column;gap:8px;font-size:0.85rem;">
              <div style="color:#aaa;">Henüz olay yok. Terraforming başladığında olaylar burada görünecek.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
  document.body.insertAdjacentHTML('beforeend', tfV2Html);

  /* ---- TFV2 LOGIC ---- */
  const tv2Audio = {
    ctx: null,
    init() { if(!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){} } },
    osc(t,f,d,v=0.08) {
      if(!this.ctx) return;
      let o=this.ctx.createOscillator(), g=this.ctx.createGain();
      o.type=t; o.frequency.setValueAtTime(f,this.ctx.currentTime);
      g.gain.setValueAtTime(v,this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001,this.ctx.currentTime+d);
      o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime+d);
    },
    buy() { this.osc('sine',600,0.1); setTimeout(()=>this.osc('sine',900,0.15),80); },
    disaster() { this.osc('sawtooth',100,0.6,0.3); },
    milestone() { [400,600,800,1200,1600].forEach((f,i)=>setTimeout(()=>this.osc('sine',f,0.2,0.15),i*100)); }
  };
  window.tv2Audio = tv2Audio;

  const TV2_GENS = [
    { id:'atm_pump', n:'Atmosfer Pompası', i:'💨', desc:'+1 O₂/sn', costType:'o2', baseCost:10, type:'o2', out:1 },
    { id:'water_ext', n:'Su Çıkarıcı', i:'💧', desc:'+1 H₂O/sn', costType:'o2', baseCost:60, type:'h2o', out:1 },
    { id:'bio_dome', n:'Biyo-Kubbe', i:'🌱', desc:'+1 Bio/sn', costType:'h2o', baseCost:120, type:'bio', out:1 },
    { id:'ion_cnv', n:'İyon Çevirici', i:'⚡', desc:'+15 O₂/sn', costType:'bio', baseCost:60, type:'o2', out:15 },
    { id:'glacier', n:'Buzul Eritici', i:'🧊', desc:'+20 H₂O/sn', costType:'o2', baseCost:1200, type:'h2o', out:20 },
    { id:'dna_synth', n:'DNA Sentezleyici', i:'🧬', desc:'+50 Bio/sn', costType:'h2o', baseCost:2500, type:'bio', out:50 },
    { id:'sol_panel', n:'Güneş Paneli', i:'☀️', desc:'+40 O₂/sn', costType:'h2o', baseCost:5000, type:'o2', out:40 },
    { id:'ocean_seed', n:'Okyanus Tohumlama', i:'🌊', desc:'+80 H₂O/sn', costType:'bio', baseCost:10000, type:'h2o', out:80 },
    { id:'bio_factory', n:'Biyosfer Fabrikası', i:'🏭', desc:'+200 Bio/sn', costType:'o2', baseCost:50000, type:'bio', out:200 }
  ];

  const TV2_TECHS = [
    { id:'t_terraform', n:'Hızlı Terraforming', i:'🚀', cost:{o2:500,h2o:0,bio:0}, desc:'Tüm üretim +20%', effect:'prod_boost', unlocked:false },
    { id:'t_geoeng', n:'Jeomühendislik', i:'🌍', cost:{o2:2000,h2o:1000,bio:0}, desc:'Felaket hasarı -%30', effect:'disaster_reduce', unlocked:false },
    { id:'t_shield', n:'Manyetik Kalkan', i:'🛡️', cost:{o2:5000,h2o:2000,bio:500}, desc:'Güneş fırtınası immumluk', effect:'solar_immune', unlocked:false },
    { id:'t_biotech', n:'Biyoteknoloji', i:'🧬', cost:{o2:0,h2o:3000,bio:2000}, desc:'Bio üretim ×2', effect:'bio_double', unlocked:false },
    { id:'t_cloud', n:'Bulut Tohumlama', i:'🌧️', cost:{o2:1000,h2o:5000,bio:1000}, desc:'H₂O üretim ×1.5', effect:'h2o_boost', unlocked:false }
  ];

  const TV2_PLANET_TYPES = {
    mars: { n:'Kum Gezegeni', i:'🏜️', mults:{o2:0.5,h2o:2,bio:1}, startRes:{o2:5,h2o:0,bio:0} },
    ice: { n:'Buz Gezegeni', i:'🧊', mults:{o2:1,h2o:3,bio:0.5}, startRes:{o2:0,h2o:20,bio:0} },
    carbon: { n:'Karbon Gezegeni', i:'🌑', mults:{o2:1.5,h2o:1,bio:2}, startRes:{o2:0,h2o:5,bio:5} }
  };

  const TV2_DISASTERS = [
    { n:'Meteor Yağmuru ☄️', desc:'Altyapı hasar gördü! O₂ üretimi 1 dakika durdu.', effect:'meteor', icon:'☄️', severity:'high' },
    { n:'Güneş Fırtınası 🌟', desc:'Güneş ışınımı! Bio üretim yarıya düştü.', effect:'solar', icon:'🌟', severity:'medium' },
    { n:'Volkanik Patlama 🌋', desc:'Volkan patladı! H₂O azaldı.', effect:'volcano', icon:'🌋', severity:'high' }
  ];

  const TV2_POP_MILESTONES = [
    { pop:100, t:'İlk Kolonistler!', d:'Gezegeninde 100 insan yaşıyor!', i:'👨‍🚀' },
    { pop:1000, t:'Küçük Kasaba!', d:'1.000 nüfusa ulaştın!', i:'🏘️' },
    { pop:10000, t:'Büyüyen Şehir!', d:'10.000 vatandaşın var!', i:'🌆' },
    { pop:100000, t:'Büyük Medeniyet!', d:'100.000 nüfus! Gezegen yaşıyor!', i:'🌍' },
    { pop:1000000, t:'Gezegen Metropolü!', d:'1 Milyon kişi! Efsanevi terraformer!', i:'🌟' }
  ];

  let tv2 = {
    res:{o2:0,h2o:0,bio:0},
    gens:{},
    techs:[],
    planetType:null,
    lastTime:Date.now(),
    population:0,
    passedMilestones:[],
    disasterActive:false,
    disasterEffect:null,
    disasterDuration:0,
    biomes:[],
    eventLog:[]
  };

  let tv2TickInt=null, tv2DisasterInt=null, tv2CanvasInt=null;
  let tv2PlanetAngle=0;

  function tv2Load() {
    let s = localStorage.getItem('ds_tv2_save');
    if(s) { try { tv2 = {...tv2, ...JSON.parse(s)}; } catch(e){} }
    if(tv2.planetType) {
      document.getElementById('tv2PlanetSelect').style.display='none';
      document.getElementById('tv2Main').style.display='block';
      tv2CalcOffline();
      tv2StartTick();
      tv2StartCanvas();
      tv2StartDisasterTimer();
      tv2UpdateUI();
    }
  }
  function tv2Save() { tv2.lastTime=Date.now(); localStorage.setItem('ds_tv2_save', JSON.stringify(tv2)); }

  function tv2Fmt(n) {
    if(n>=1e6) return (n/1e6).toFixed(2)+'M';
    if(n>=1000) return (n/1000).toFixed(1)+'K';
    return Math.floor(n).toString();
  }

  window.tv2SelectPlanet = function(type) {
    tv2.planetType = type;
    let pt = TV2_PLANET_TYPES[type];
    tv2.res = {...pt.startRes};
    tv2Save();
    document.getElementById('tv2PlanetSelect').style.display='none';
    document.getElementById('tv2Main').style.display='block';
    tv2StartTick();
    tv2StartCanvas();
    tv2StartDisasterTimer();
    tv2UpdateUI();
    if(typeof toast==='function') toast('🪐 '+pt.n+' seçildi! Terraforming başlıyor...','#4CAF50');
  };

  function tv2GetBps() {
    let bps={o2:0,h2o:0,bio:0};
    let pt = TV2_PLANET_TYPES[tv2.planetType]||{mults:{o2:1,h2o:1,bio:1}};
    let prodBoost = tv2.techs.includes('t_terraform')?1.2:1;
    let bioDouble = tv2.techs.includes('t_biotech')?2:1;
    let h2oBoost = tv2.techs.includes('t_cloud')?1.5:1;

    TV2_GENS.forEach(g=>{
      let amt = tv2.gens[g.id]||0;
      if(amt===0) return;
      let base = amt*g.out*pt.mults[g.type]*prodBoost;
      if(g.type==='bio') base*=bioDouble;
      if(g.type==='h2o') base*=h2oBoost;
      // Disaster effect
      if(tv2.disasterEffect==='meteor'&&g.type==='o2') base=0;
      if(tv2.disasterEffect==='solar'&&g.type==='bio') base*=0.5;
      bps[g.type]+=base;
    });
    // Kickstart
    if(bps.o2===0&&tv2.res.o2<10) bps.o2=1;
    return bps;
  }

  function tv2CalcOffline() {
    let now=Date.now(), diffSec=Math.floor((now-tv2.lastTime)/1000);
    if(diffSec>60) {
      diffSec=Math.min(diffSec, 86400*7);
      let bps=tv2GetBps();
      tv2.res.o2+=bps.o2*diffSec; tv2.res.h2o+=bps.h2o*diffSec; tv2.res.bio+=bps.bio*diffSec;
      let el=document.getElementById('tv2Offline');
      let txt=document.getElementById('tv2OfflineText');
      if(el&&txt&&(bps.o2>0||bps.h2o>0||bps.bio>0)) {
        el.style.display='block';
        txt.innerHTML='<b>'+tv2Fmt(diffSec)+'s</b> yoktunuz. Kazanılan: <b>'+tv2Fmt(bps.o2*diffSec)+' O₂</b>, <b>'+tv2Fmt(bps.h2o*diffSec)+' H₂O</b>, <b>'+tv2Fmt(bps.bio*diffSec)+' Bio</b>';
      }
    }
    tv2.lastTime=now;
  }

  function tv2StartTick() {
    if(tv2TickInt) clearInterval(tv2TickInt);
    tv2TickInt=setInterval(()=>{
      let bps=tv2GetBps();
      tv2.res.o2+=bps.o2; tv2.res.h2o+=bps.h2o; tv2.res.bio+=bps.bio;
      // Disaster countdown
      if(tv2.disasterDuration>0) { tv2.disasterDuration--; if(tv2.disasterDuration<=0) tv2.disasterEffect=null; }
      tv2UpdatePlanetScore();
      tv2Save();
      tv2UpdateVisuals();
    }, 1000);
  }

  function tv2UpdatePlanetScore() {
    let score=tv2.res.o2+(tv2.res.h2o*5)+(tv2.res.bio*20);
    // Population
    tv2.population = Math.floor(Math.sqrt(score)*2);
    // Biomes
    let newBiomes=[];
    if(score>500) newBiomes.push('tundra');
    if(score>5000) newBiomes.push('ocean');
    if(score>50000) newBiomes.push('forest');
    if(score>200000) newBiomes.push('desert');
    if(score>1000000) newBiomes.push('savanna');
    newBiomes.forEach(b=>{
      if(!tv2.biomes.includes(b)) {
        tv2.biomes.push(b);
        tv2Log('🌿 Yeni biyom keşfedildi: '+{tundra:'Tundra',ocean:'Okyanus',forest:'Orman',desert:'Çöl',savanna:'Savana'}[b], '#4CAF50');
        if(typeof toast==='function') toast('🌿 Biyom keşfedildi!','#4CAF50');
      }
    });
    // Milestones
    TV2_POP_MILESTONES.forEach(m=>{
      if(tv2.population>=m.pop && !tv2.passedMilestones.includes(m.pop)) {
        tv2.passedMilestones.push(m.pop);
        tv2Audio.milestone();
        let ms=document.getElementById('tv2Milestone');
        document.getElementById('tv2MilestoneIcon').textContent=m.i;
        document.getElementById('tv2MilestoneTitle').textContent=m.t;
        document.getElementById('tv2MilestoneDesc').textContent=m.d;
        if(ms) ms.classList.add('show');
        tv2Log('🎉 '+m.t+' ('+tv2Fmt(m.pop)+' nüfus)', '#ffd54f');
        // Spawn confetti
        if(typeof aev2SpawnConfetti==='function') aev2SpawnConfetti();
      }
    });
  }

  function tv2UpdateVisuals() {
    document.getElementById('tv2ValO2').textContent = tv2Fmt(tv2.res.o2);
    document.getElementById('tv2ValH2O').textContent = tv2Fmt(tv2.res.h2o);
    document.getElementById('tv2ValBio').textContent = tv2Fmt(tv2.res.bio);
    let bps=tv2GetBps();
    document.getElementById('tv2BpsO2').textContent = '+'+tv2Fmt(bps.o2)+'/sn';
    document.getElementById('tv2BpsH2O').textContent = '+'+tv2Fmt(bps.h2o)+'/sn';
    document.getElementById('tv2BpsBio').textContent = '+'+tv2Fmt(bps.bio)+'/sn';
    document.getElementById('tv2Population').textContent = tv2Fmt(tv2.population);

    let score=tv2.res.o2+(tv2.res.h2o*5)+(tv2.res.bio*20);
    let o2pct=Math.min(100,tv2.res.o2/500000*100);
    let h2opct=Math.min(100,tv2.res.h2o/100000*100);
    let biopct=Math.min(100,tv2.res.bio/50000*100);
    document.getElementById('tv2ProgO2').style.width=o2pct+'%';
    document.getElementById('tv2ProgO2Txt').textContent=o2pct.toFixed(0)+'%';
    document.getElementById('tv2ProgH2O').style.width=h2opct+'%';
    document.getElementById('tv2ProgH2OTxt').textContent=h2opct.toFixed(0)+'%';
    document.getElementById('tv2ProgBio').style.width=biopct+'%';
    document.getElementById('tv2ProgBioTxt').textContent=biopct.toFixed(0)+'%';

    // Stage
    let stage='Evre 1: Çorak Gezegen';
    let atmosColor='rgba(255,100,50,0)';
    if(score>500000) { stage='Evre 4: Canlı Biyosfer'; atmosColor='rgba(76,175,80,0.6)'; }
    else if(score>50000) { stage='Evre 3: Okyanus Oluşumu'; atmosColor='rgba(33,150,243,0.5)'; }
    else if(score>1000) { stage='Evre 2: Oksijen Tabakası'; atmosColor='rgba(0,229,255,0.3)'; }
    document.getElementById('tv2StageTxt').textContent = stage;
    let glow=document.getElementById('tv2AtmosGlow');
    if(glow) glow.style.boxShadow='0 0 40px 20px '+atmosColor;

    // Biome UI
    ['tundra','ocean','forest','desert','savanna'].forEach(b=>{
      let el=document.getElementById('biome-'+b);
      if(el) el.classList.toggle('active', tv2.biomes.includes(b));
    });

    // Shop button states
    TV2_GENS.forEach(g=>{
      let btn=document.getElementById('tv2Btn_'+g.id);
      if(btn) btn.disabled=(tv2.res[g.costType]<tv2GetCost(g.id));
    });
  }

  function tv2GetCost(id) {
    let g=TV2_GENS.find(x=>x.id===id);
    if(!g) return Infinity;
    return Math.floor(g.baseCost*Math.pow(1.15,tv2.gens[g.id]||0));
  }

  function tv2UpdateUI() {
    let pt=TV2_PLANET_TYPES[tv2.planetType];
    if(pt) document.getElementById('tv2PlanetTypeTxt').textContent=pt.i+' '+pt.n;
    let html='';
    TV2_GENS.forEach(g=>{
      let amt=tv2.gens[g.id]||0, cost=tv2GetCost(g.id);
      html+=`<div class="tv2-shop-item">
        <div style="font-size:2.5rem;flex-shrink:0;">${g.i}</div>
        <div style="flex:1;">
          <div style="font-weight:700;margin-bottom:2px;">${g.n} <span style="color:#aaa;font-weight:400;">(×${amt})</span></div>
          <div style="font-size:0.75rem;color:#aaa;">${g.desc}</div>
        </div>
        <button class="tv2-buy-btn" id="tv2Btn_${g.id}" onclick="tv2Buy('${g.id}')">Al (${tv2Fmt(cost)} ${g.costType.toUpperCase()})</button>
      </div>`;
    });
    document.getElementById('tv2ShopGrid').innerHTML=html;
    tv2RenderTech();
    tv2UpdateVisuals();
  }

  window.tv2Buy = function(id) {
    tv2Audio.init();
    let g=TV2_GENS.find(x=>x.id===id); if(!g) return;
    let cost=tv2GetCost(id);
    if(tv2.res[g.costType]<cost) return;
    tv2.res[g.costType]-=cost;
    tv2.gens[id]=(tv2.gens[id]||0)+1;
    tv2Audio.buy();
    tv2UpdateUI();
  };

  function tv2RenderTech() {
    let html='';
    TV2_TECHS.forEach(t=>{
      let unlocked=tv2.techs.includes(t.id);
      let canUnlock=tv2.res.o2>=(t.cost.o2||0)&&tv2.res.h2o>=(t.cost.h2o||0)&&tv2.res.bio>=(t.cost.bio||0);
      html+=`<div class="tv2-tech-card ${unlocked?'unlocked':canUnlock?'':'locked'}">
        <div style="font-size:3rem;margin-bottom:8px;">${t.i}</div>
        <h4 style="color:#4CAF50;margin-bottom:6px;">${t.n}</h4>
        <p style="font-size:0.8rem;color:#aaa;margin-bottom:10px;">${t.desc}</p>
        <div style="font-size:0.75rem;color:#aaa;margin-bottom:12px;">
          ${t.cost.o2?'O₂: '+tv2Fmt(t.cost.o2)+' ':''} 
          ${t.cost.h2o?'H₂O: '+tv2Fmt(t.cost.h2o)+' ':''}
          ${t.cost.bio?'Bio: '+tv2Fmt(t.cost.bio):''}
        </div>
        ${unlocked
          ? '<div style="color:#4CAF50;font-weight:700;">✓ Aktif</div>'
          : `<button class="tv2-action-btn" ${canUnlock?'':'disabled'} onclick="tv2UnlockTech('${t.id}')">Aç</button>`
        }
      </div>`;
    });
    let g=document.getElementById('tv2TechGrid');
    if(g) g.innerHTML=html;
  }

  window.tv2UnlockTech = function(id) {
    let t=TV2_TECHS.find(x=>x.id===id); if(!t||tv2.techs.includes(id)) return;
    if(tv2.res.o2<(t.cost.o2||0)||tv2.res.h2o<(t.cost.h2o||0)||tv2.res.bio<(t.cost.bio||0)) { if(typeof toast==='function') toast('Yeterli kaynak yok!','#f44'); return; }
    tv2.res.o2-=(t.cost.o2||0); tv2.res.h2o-=(t.cost.h2o||0); tv2.res.bio-=(t.cost.bio||0);
    tv2.techs.push(id);
    tv2Audio.milestone();
    if(typeof toast==='function') toast('🔬 '+t.n+' açıldı!','#4CAF50');
    tv2Log('🔬 Teknoloji açıldı: '+t.n, '#00e5ff');
    tv2UpdateUI();
  };

  function tv2StartCanvas() {
    let canvas=document.getElementById('tv2PlanetCanvas');
    if(!canvas) return;
    let ctx=canvas.getContext('2d');
    if(tv2CanvasInt) clearInterval(tv2CanvasInt);
    tv2CanvasInt=setInterval(()=>{
      tv2PlanetAngle+=0.5;
      let score=tv2.res.o2+(tv2.res.h2o*5)+(tv2.res.bio*20);
      tv2DrawPlanet(ctx, score, tv2PlanetAngle);
    }, 50);
  }

  function tv2DrawPlanet(ctx, score, angle) {
    let w=300, h=300, r=140, cx=w/2, cy=h/2;
    ctx.clearRect(0,0,w,h);

    // Planet body gradient (rotation simulated via angle offset)
    let grad = ctx.createRadialGradient(cx-40,cy-40,20,cx,cy,r);
    if(score<1000) { grad.addColorStop(0,'#B71C1C'); grad.addColorStop(1,'#4A148C'); }
    else if(score<50000) { grad.addColorStop(0,'#6D4C41'); grad.addColorStop(1,'#3E2723'); }
    else if(score<500000) { grad.addColorStop(0,'#1565C0'); grad.addColorStop(1,'#0D47A1'); }
    else { grad.addColorStop(0,'#2E7D32'); grad.addColorStop(1,'#0D47A1'); }

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx,cy,r,0,Math.PI*2);
    ctx.fillStyle=grad;
    ctx.fill();

    // Surface texture strips
    ctx.globalAlpha=0.12;
    for(let i=0;i<5;i++) {
      let stripY = cy-r + (i/5)*(r*2);
      let stripW = Math.sqrt(Math.max(0,r*r-(stripY-cy)*(stripY-cy)));
      let offset = Math.sin((angle+i*40)*Math.PI/180)*stripW*0.4;
      ctx.fillStyle=i%2===0?'#fff':'#000';
      ctx.fillRect(cx-stripW+offset,stripY,stripW*2,r/8);
    }
    ctx.globalAlpha=1;

    // Ice caps if ice planet or high H2O
    if(tv2.planetType==='ice'||tv2.res.h2o>50000) {
      let capGrad=ctx.createRadialGradient(cx,cy-r+20,5,cx,cy-r+20,50);
      capGrad.addColorStop(0,'rgba(200,240,255,0.9)'); capGrad.addColorStop(1,'rgba(200,240,255,0)');
      ctx.fillStyle=capGrad; ctx.fill();
      ctx.beginPath(); ctx.arc(cx,cy-r+15,40,0,Math.PI*2); ctx.fillStyle=capGrad; ctx.fill();
    }

    // Oceans layer
    if(score>50000) {
      ctx.globalAlpha=0.3;
      ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.clip();
      let waveGrad=ctx.createLinearGradient(0,cy,w,cy+20);
      waveGrad.addColorStop(0,'#1565C0'); waveGrad.addColorStop(1,'#42A5F5');
      ctx.fillStyle=waveGrad;
      ctx.beginPath();
      let wy=cy+Math.sin(angle*Math.PI/180)*10;
      ctx.fillRect(0,wy,w,r);
      ctx.globalAlpha=1;
    }
    ctx.restore();

    // Atmosphere glow ring
    let atmosAlpha=Math.min(0.6, score/1000000);
    let atmosColor = score>500000?'rgba(76,175,80,'+atmosAlpha+')':score>50000?'rgba(33,150,243,'+atmosAlpha+')':'rgba(0,229,255,'+atmosAlpha+')';
    let aGrad=ctx.createRadialGradient(cx,cy,r-5,cx,cy,r+20);
    aGrad.addColorStop(0, atmosColor); aGrad.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(cx,cy,r+20,0,Math.PI*2);
    ctx.fillStyle=aGrad; ctx.fill();

    // Stars background (sparse)
    for(let i=0;i<20;i++) {
      let sx=(Math.sin(i*137.5+angle*0.01)*w+w)%(w);
      let sy=(Math.cos(i*73.1+angle*0.01)*h+h)%(h);
      let dist=Math.sqrt((sx-cx)*(sx-cx)+(sy-cy)*(sy-cy));
      if(dist>r+25) { ctx.beginPath(); ctx.arc(sx,sy,1,0,Math.PI*2); ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.fill(); }
    }

    // Cloud layer
    if(score>5000) {
      ctx.globalAlpha=0.15;
      ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.clip();
      for(let i=0;i<3;i++) {
        let cx2=cx+(Math.cos((angle+i*120)*Math.PI/180)*r*0.5);
        let cy2=cy+(Math.sin((angle*0.7+i*80)*Math.PI/180)*r*0.4);
        let cg=ctx.createRadialGradient(cx2,cy2,5,cx2,cy2,40);
        cg.addColorStop(0,'rgba(255,255,255,0.8)'); cg.addColorStop(1,'rgba(255,255,255,0)');
        ctx.fillStyle=cg; ctx.fillRect(0,0,w,h);
      }
      ctx.globalAlpha=1;
    }
  }

  function tv2StartDisasterTimer() {
    if(tv2DisasterInt) clearInterval(tv2DisasterInt);
    tv2DisasterInt=setInterval(()=>{
      let hasTechBuilt=Object.values(tv2.gens||{}).some(v=>v>0);
      if(!hasTechBuilt) return;
      if(Math.random()<0.012) {
        let d=TV2_DISASTERS[Math.floor(Math.random()*TV2_DISASTERS.length)];
        // Solar immune tech
        if(d.effect==='solar'&&tv2.techs.includes('t_shield')) return;
        // Disaster reduce
        let reducedEffect=tv2.techs.includes('t_geoeng');
        tv2.disasterEffect=d.effect;
        tv2.disasterDuration=reducedEffect?30:60;
        tv2Audio.disaster();
        tv2Log('⚠️ FELAKET: '+d.n+' — '+d.desc+(reducedEffect?' (-%30 jeomühendislik ile hafifletildi)':''), '#f44');
        if(typeof toast==='function') toast('⚠️ '+d.n+': '+d.desc,'#f44');
        // Resource penalty
        if(d.effect==='volcano') tv2.res.h2o=Math.max(0, tv2.res.h2o*(reducedEffect?0.8:0.6));
        if(d.effect==='meteor') { /* bps blocked via disasterEffect */ }
      }
    }, 5000);
  }

  function tv2Log(msg, color='#aaa') {
    let log=document.getElementById('tv2EventLog');
    if(!log) return;
    let d=document.createElement('div');
    d.style.color=color;
    d.style.padding='6px 10px';
    d.style.borderRadius='6px';
    d.style.background='rgba(0,0,0,0.3)';
    let now=new Date(); d.textContent='['+now.getHours()+':'+String(now.getMinutes()).padStart(2,'0')+'] '+msg;
    log.appendChild(d);
    log.scrollTop=log.scrollHeight;
    tv2.eventLog.push({msg,color,t:Date.now()});
    if(tv2.eventLog.length>100) tv2.eventLog.shift();
  }

  window.tv2Tab = function(tab) {
    tv2Audio.init();
    document.querySelectorAll('#terra-sec .tv2-panel').forEach(p=>p.classList.remove('active'));
    document.querySelectorAll('#terra-sec .tv2-tab').forEach(t=>t.classList.remove('active'));
    let panel=document.getElementById('tv2-'+tab);
    if(panel) panel.classList.add('active');
    document.querySelectorAll('#terra-sec .tv2-tab').forEach(t=>{
      if(t.getAttribute('onclick')&&t.getAttribute('onclick').includes("'"+tab+"'")) t.classList.add('active');
    });
    if(tab==='tech') tv2RenderTech();
    if(tab==='events') { let log=document.getElementById('tv2EventLog'); if(log) log.scrollTop=log.scrollHeight; }
  };

  window.tv2Reset = function() {
    if(!confirm('Tüm terraforming ilerlemesi silinecek. Emin misiniz?')) return;
    if(tv2TickInt) clearInterval(tv2TickInt);
    if(tv2DisasterInt) clearInterval(tv2DisasterInt);
    if(tv2CanvasInt) clearInterval(tv2CanvasInt);
    tv2={res:{o2:0,h2o:0,bio:0},gens:{},techs:[],planetType:null,lastTime:Date.now(),population:0,passedMilestones:[],disasterActive:false,disasterEffect:null,disasterDuration:0,biomes:[],eventLog:[]};
    tv2Save();
    document.getElementById('tv2PlanetSelect').style.display='block';
    document.getElementById('tv2Main').style.display='none';
    if(typeof toast==='function') toast('Gezegen sıfırlandı.','#aaa');
  };

  setTimeout(tv2Load, 500);
} catch(e) { console.error('TFV2 error:', e); }
