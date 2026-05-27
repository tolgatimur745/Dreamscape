
/* ══════════════════════════════════════════════════════════
   34. PONG
══════════════════════════════════════════════════════════ */
try {
  var pongCanvas = $('pongCanvas');
  if (pongCanvas) {
    var pctx = pongCanvas.getContext('2d');
    var PG = {
      running: false,
      w: 0, h: 0,
      ball: {x:0,y:0,vx:4,vy:3,r:8},
      left: {y:0,h:70,score:0},
      right: {y:0,h:70,score:0},
      mouseY: 0
    };
    function pong_size() {
      var rect = pongCanvas.parentElement.getBoundingClientRect();
      pongCanvas.width = Math.max(400, rect.width || 700);
      pongCanvas.height = 320;
      PG.w = pongCanvas.width; PG.h = pongCanvas.height;
      PG.left.y = PG.h/2 - PG.left.h/2;
      PG.right.y = PG.h/2 - PG.right.h/2;
    }
    function pong_reset_ball() {
      PG.ball.x = PG.w/2; PG.ball.y = PG.h/2;
      var dir = Math.random() > .5 ? 1 : -1;
      PG.ball.vx = (4 + Math.random()*2) * dir;
      PG.ball.vy = (2 + Math.random()*3) * (Math.random()>.5?1:-1);
    }
    function pong_draw() {
      if (!PG.running) return;
      var W = PG.w, H = PG.h, b = PG.ball, l = PG.left, r = PG.right;
      // Move
      b.x += b.vx; b.y += b.vy;
      // Wall bounce
      if (b.y - b.r < 0) { b.y = b.r; b.vy = Math.abs(b.vy); }
      if (b.y + b.r > H) { b.y = H - b.r; b.vy = -Math.abs(b.vy); }
      // AI paddle
      var aiCenter = r.y + r.h/2;
      var aiSpeed = 3.2;
      if (aiCenter < b.y - 5) r.y = Math.min(H - r.h, r.y + aiSpeed);
      else if (aiCenter > b.y + 5) r.y = Math.max(0, r.y - aiSpeed);
      // Player paddle follows mouse
      l.y = Math.max(0, Math.min(H - l.h, PG.mouseY - l.h/2));
      // Left paddle collision
      if (b.x - b.r < 16 && b.y > l.y && b.y < l.y + l.h) {
        b.x = 16 + b.r; b.vx = Math.abs(b.vx) * 1.05;
        b.vy += (b.y - (l.y + l.h/2)) * 0.1;
      }
      // Right paddle collision
      if (b.x + b.r > W - 16 && b.y > r.y && b.y < r.y + r.h) {
        b.x = W - 16 - b.r; b.vx = -Math.abs(b.vx) * 1.05;
        b.vy += (b.y - (r.y + r.h/2)) * 0.1;
      }
      // Limit speed
      var spd = Math.sqrt(b.vx*b.vx + b.vy*b.vy);
      if (spd > 12) { b.vx = b.vx/spd*12; b.vy = b.vy/spd*12; }
      // Score
      if (b.x < 0) { r.score++; $('pongScoreR').textContent = r.score; pong_reset_ball(); }
      if (b.x > W) { l.score++; $('pongScoreL').textContent = l.score; pong_reset_ball(); }
      // Draw
      pctx.fillStyle = '#010108'; pctx.fillRect(0,0,W,H);
      // Center line
      pctx.setLineDash([8,8]); pctx.strokeStyle = 'rgba(255,255,255,.1)'; pctx.lineWidth = 2;
      pctx.beginPath(); pctx.moveTo(W/2,0); pctx.lineTo(W/2,H); pctx.stroke(); pctx.setLineDash([]);
      // Paddles
      pctx.shadowBlur = 15; pctx.shadowColor = '#7c4dff';
      pctx.fillStyle = '#a29bfe'; pctx.beginPath(); pctx.roundRect(6, l.y, 10, l.h, 5); pctx.fill();
      pctx.shadowColor = '#ff6b9d';
      pctx.fillStyle = '#fd79a8'; pctx.beginPath(); pctx.roundRect(W-16, r.y, 10, r.h, 5); pctx.fill();
      // Ball
      pctx.shadowColor = '#00e5ff'; pctx.shadowBlur = 20;
      pctx.fillStyle = '#fff'; pctx.beginPath(); pctx.arc(b.x, b.y, b.r, 0, Math.PI*2); pctx.fill();
      pctx.shadowBlur = 0;
      requestAnimationFrame(pong_draw);
    }
    pong_size();
    pongCanvas.addEventListener('mousemove', function(e) {
      var rect = pongCanvas.getBoundingClientRect();
      PG.mouseY = (e.clientY - rect.top) * (pongCanvas.height / rect.height);
    });
    var pongStartBtn = $('pongStartBtn');
    if (pongStartBtn) pongStartBtn.addEventListener('click', function() {
      if (PG.running) { PG.running = false; pongStartBtn.textContent = '▶ Başlat'; return; }
      PG.running = true; PG.left.score = 0; PG.right.score = 0;
      $('pongScoreL').textContent = 0; $('pongScoreR').textContent = 0;
      pong_size(); pong_reset_ball(); pong_draw();
      pongStartBtn.textContent = '⏹ Durdur';
    });
    window.addEventListener('resize', pong_size);
  }
} catch(e){ console.error('Pong error', e); }

/* ══════════════════════════════════════════════════════════
   35. VIRTUAL PIANO
══════════════════════════════════════════════════════════ */
try {
  var pianoKeys = $('pianoKeys'), pianoInfo = $('pianoInfo');
  if (pianoKeys) {
    var pianoCtx = null;
    try { pianoCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e2){}
    var PIANO_NOTES = [
      {note:'C',white:true,key:'a'},{note:'C#',white:false,key:'w'},{note:'D',white:true,key:'s'},{note:'D#',white:false,key:'e'},
      {note:'E',white:true,key:'d'},{note:'F',white:true,key:'f'},{note:'F#',white:false,key:'t'},{note:'G',white:true,key:'g'},
      {note:'G#',white:false,key:'y'},{note:'A',white:true,key:'h'},{note:'A#',white:false,key:'u'},{note:'B',white:true,key:'j'},
      {note:'C',white:true,key:'k'},{note:'C#',white:false,key:'o'},{note:'D',white:true,key:'l'}
    ];
    var PIANO_BASE_FREQ = [261.63, 277.18, 293.66, 311.13, 329.63, 349.23, 369.99, 392.00, 415.30, 440.00, 466.16, 493.88, 523.25, 554.37, 587.33];
    var pianoOctave = 1;
    var pianoElems = {};
    function piano_play(idx) {
      if (!pianoCtx) return;
      var freq = PIANO_BASE_FREQ[idx] * Math.pow(2, pianoOctave - 1);
      var osc = pianoCtx.createOscillator();
      var gain = pianoCtx.createGain();
      var filter = pianoCtx.createBiquadFilter();
      filter.type = 'lowpass'; filter.frequency.value = 4000;
      osc.connect(filter); filter.connect(gain); gain.connect(pianoCtx.destination);
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.5, pianoCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, pianoCtx.currentTime + 1.5);
      osc.start(); osc.stop(pianoCtx.currentTime + 1.5);
      var n = PIANO_NOTES[idx];
      if (pianoInfo) pianoInfo.textContent = n.note + (n.white?'':' ♭') + ' — ' + Math.round(freq) + ' Hz';
    }
    function piano_build() {
      pianoKeys.innerHTML = ''; pianoElems = {};
      var whites = [], blackIdxMap = {};
      PIANO_NOTES.forEach(function(n, i) { if (n.white) whites.push(i); else blackIdxMap[i] = true; });
      var wCount = whites.length;
      var totalW = wCount * 44;
      pianoKeys.style.width = totalW + 'px';
      var wPos = 0;
      PIANO_NOTES.forEach(function(n, i) {
        var el = document.createElement('div');
        if (n.white) {
          el.className = 'pk-white'; el.innerHTML = '<span class="pk-lbl">' + n.key.toUpperCase() + '</span>';
          el.style.left = wPos + 'px'; wPos += 44;
          el.addEventListener('mousedown', function(){ el.classList.add('pressed'); piano_play(i); });
          el.addEventListener('mouseup', function(){ el.classList.remove('pressed'); });
          el.addEventListener('mouseleave', function(){ el.classList.remove('pressed'); });
          pianoKeys.appendChild(el);
        } else {
          el.className = 'pk-black'; el.innerHTML = '<span class="pk-lbl" style="color:#555">' + n.key.toUpperCase() + '</span>';
          el.style.left = (wPos - 16) + 'px';
          el.addEventListener('mousedown', function(e){ e.stopPropagation(); el.classList.add('pressed'); piano_play(i); });
          el.addEventListener('mouseup', function(){ el.classList.remove('pressed'); });
          el.addEventListener('mouseleave', function(){ el.classList.remove('pressed'); });
          pianoKeys.appendChild(el);
        }
        pianoElems[n.key] = {el:el, idx:i};
      });
    }
    document.addEventListener('keydown', function(e) {
      if (e.repeat) return;
      var found = Object.values(pianoElems).find(function(p){ return p.el && PIANO_NOTES[p.idx].key === e.key.toLowerCase(); });
      if (found) { found.el.classList.add('pressed'); piano_play(found.idx); }
    });
    document.addEventListener('keyup', function(e) {
      var found = Object.values(pianoElems).find(function(p){ return PIANO_NOTES[p.idx].key === e.key.toLowerCase(); });
      if (found) found.el.classList.remove('pressed');
    });
    ['pianoOct1','pianoOct2','pianoOct3'].forEach(function(id, i) {
      var btn = $(id); if(!btn) return;
      btn.addEventListener('click', function(){
        pianoOctave = i + 1;
        document.querySelectorAll('[id^="pianoOct"]').forEach(function(b){ b.style.background=''; b.style.borderColor=''; b.style.color=''; });
        btn.style.background = 'rgba(124,77,255,.2)'; btn.style.borderColor = 'var(--a1)'; btn.style.color = 'var(--a1)';
        if(pianoInfo) pianoInfo.textContent = 'Oktav ' + (i+1) + ' seçildi';
      });
    });
    var pianoChord = $('pianoChord');
    if (pianoChord) {
      var melodyInt = null;
      pianoChord.addEventListener('click', function() {
        if (melodyInt) { clearInterval(melodyInt); melodyInt = null; pianoChord.textContent = '🎵 Otomatik Melodi'; return; }
        pianoChord.textContent = '⏹ Durdur';
        var mel = [0,2,4,7,9,7,4,2,0,4,7,9,12,9,7,4];
        var mi = 0;
        melodyInt = setInterval(function() {
          piano_play(mel[mi] % PIANO_BASE_FREQ.length);
          mi = (mi + 1) % mel.length;
        }, 350);
      });
    }
    piano_build();
  }
} catch(e){ console.error('VirtualPiano error', e); }

/* ══════════════════════════════════════════════════════════
   36. DICE ROLLER
══════════════════════════════════════════════════════════ */
try {
  var diceState = { sides: 6, count: 1, history: [] };
  var diceDisplay = $('diceDisplay'), diceTotal = $('diceTotal'), diceHist = $('diceHist'), diceCountLabel = $('diceCountLabel');
  document.querySelectorAll('.dt-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.dt-btn').forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      diceState.sides = parseInt(btn.dataset.sides, 10);
    });
  });
  var dm = $('diceMinus'), dp = $('dicePlus');
  if (dm) dm.addEventListener('click', function(){ if(diceState.count>1){ diceState.count--; if(diceCountLabel) diceCountLabel.textContent=diceState.count+' Zar'; } });
  if (dp) dp.addEventListener('click', function(){ if(diceState.count<5){ diceState.count++; if(diceCountLabel) diceCountLabel.textContent=diceState.count+' Zar'; } });
  var diceRollBtn = $('diceRoll');
  if (diceRollBtn) diceRollBtn.addEventListener('click', function() {
    if (!diceDisplay) return;
    diceDisplay.innerHTML = ''; var total = 0, rolls = [];
    for (var i = 0; i < diceState.count; i++) {
      var r = Math.floor(Math.random() * diceState.sides) + 1;
      rolls.push(r); total += r;
      var f = document.createElement('div'); f.className = 'dice-face';
      f.textContent = r; f.title = 'D' + diceState.sides;
      diceDisplay.appendChild(f);
    }
    if (diceTotal) diceTotal.textContent = 'Toplam: ' + total + (diceState.count>1 ? ' (' + rolls.join('+') + ')' : '');
    diceState.history.unshift({rolls:rolls,sides:diceState.sides,total:total});
    if (diceState.history.length > 8) diceState.history.pop();
    if (diceHist) {
      diceHist.innerHTML = '';
      diceState.history.forEach(function(h) {
        var c = document.createElement('div'); c.className = 'dhc';
        c.textContent = 'D'+h.sides+': '+h.total; diceHist.appendChild(c);
      });
    }
    toast('🎲 D'+diceState.sides+': '+total, '#7c4dff');
  });
} catch(e){ console.error('DiceRoller error', e); }

/* ══════════════════════════════════════════════════════════
   37. BLACKJACK
══════════════════════════════════════════════════════════ */
try {
  var BJ = {
    deck: [], playerHand: [], dealerHand: [], balance: 1000, bet: 50,
    wins: 0, losses: 0, pushes: 0, playing: false,
    SUITS: ['♠','♥','♦','♣'], VALS: ['A','2','3','4','5','6','7','8','9','10','J','Q','K']
  };
  function bj_card_val(card) {
    if (card.val === 'A') return 11;
    if (['J','Q','K'].indexOf(card.val) !== -1) return 10;
    return parseInt(card.val, 10);
  }
  function bj_hand_score(hand, hideSecond) {
    var total = 0, aces = 0;
    hand.forEach(function(c, i) {
      if (hideSecond && i === 1) return;
      if (c.val === 'A') aces++;
      total += bj_card_val(c);
    });
    while (total > 21 && aces > 0) { total -= 10; aces--; }
    return total;
  }
  function bj_new_deck() {
    BJ.deck = [];
    BJ.SUITS.forEach(function(s) { BJ.VALS.forEach(function(v) { BJ.deck.push({suit:s, val:v, red: s==='♥'||s==='♦'}); }); });
    for (var i = BJ.deck.length - 1; i > 0; i--) { var j = Math.floor(Math.random()*(i+1)); var t = BJ.deck[i]; BJ.deck[i] = BJ.deck[j]; BJ.deck[j] = t; }
  }
  function bj_draw() { if (!BJ.deck.length) bj_new_deck(); return BJ.deck.pop(); }
  function bj_render_hand(handEl, hand, hideSecond) {
    if (!handEl) return;
    handEl.innerHTML = '';
    hand.forEach(function(c, i) {
      var card = document.createElement('div');
      if (hideSecond && i === 1) { card.className = 'bj-card back'; handEl.appendChild(card); return; }
      card.className = 'bj-card ' + (c.red ? 'red' : 'blk');
      card.innerHTML = '<div>' + c.val + '</div><div>' + c.suit + '</div>';
      handEl.appendChild(card);
    });
  }
  function bj_update_score(dealerHide) {
    var ps = bj_hand_score(BJ.playerHand), ds = dealerHide ? '?' : bj_hand_score(BJ.dealerHand);
    var pEl = $('bjPlayerScore'), dEl = $('bjDealerScore');
    if(pEl) pEl.textContent = ps; if(dEl) dEl.textContent = ds;
  }
  function bj_set_playing(v) {
    BJ.playing = v;
    var hit = $('bjHit'), stand = $('bjStand'), dbl = $('bjDouble'), deal = $('bjDeal');
    if(hit) hit.disabled = !v; if(stand) stand.disabled = !v; if(dbl) dbl.disabled = !v || BJ.playerHand.length !== 2;
    if(deal) deal.disabled = v;
    var betRow = $('bjBetRow'); if(betRow) betRow.style.opacity = v ? '.4' : '1'; betRow && (betRow.style.pointerEvents = v ? 'none' : '');
  }
  function bj_end(msg, cls) {
    bj_set_playing(false);
    bj_render_hand($('bjDealerHand'), BJ.dealerHand, false);
    bj_update_score(false);
    var res = $('bjResult'); if(res){ res.textContent = msg; res.className = 'bj-result ' + cls; }
    var bal = $('bjBalance'); if(bal) bal.textContent = BJ.balance;
    var w=$('bjWins'),l=$('bjLosses'),p=$('bjPushes');
    if(w)w.textContent=BJ.wins; if(l)l.textContent=BJ.losses; if(p)p.textContent=BJ.pushes;
    toast(msg, cls==='win'?'#69f0ae':cls==='lose'?'#ff6b9d':'#ffea00');
  }
  function bj_deal_init() {
    if (BJ.bet > BJ.balance) { toast('Yetersiz bakiye!', '#ff6b9d'); return; }
    if (BJ.bet <= 0) { toast('Önce bahis seç!', '#ff6b9d'); return; }
    bj_new_deck();
    BJ.playerHand = [bj_draw(), bj_draw()];
    BJ.dealerHand = [bj_draw(), bj_draw()];
    var res = $('bjResult'); if(res){ res.textContent=''; res.className='bj-result'; }
    bj_render_hand($('bjPlayerHand'), BJ.playerHand, false);
    bj_render_hand($('bjDealerHand'), BJ.dealerHand, true);
    bj_set_playing(true);
    bj_update_score(true);
    var ps = bj_hand_score(BJ.playerHand);
    if (ps === 21) {
      BJ.wins++; BJ.balance += Math.floor(BJ.bet * 1.5);
      setTimeout(function(){ bj_end('🎉 Blackjack! +' + Math.floor(BJ.bet*1.5), 'win'); }, 300);
    }
  }
  function bj_hit() {
    BJ.playerHand.push(bj_draw());
    bj_render_hand($('bjPlayerHand'), BJ.playerHand, false);
    bj_update_score(true);
    var ps = bj_hand_score(BJ.playerHand);
    var dbl = $('bjDouble'); if(dbl) dbl.disabled = true;
    if (ps > 21) { BJ.losses++; BJ.balance -= BJ.bet; bj_end('💔 Battın! Toplam: '+ps, 'lose'); }
    else if (ps === 21) { bj_stand(); }
  }
  function bj_stand() {
    bj_set_playing(false);
    bj_render_hand($('bjDealerHand'), BJ.dealerHand, false);
    var ds = bj_hand_score(BJ.dealerHand);
    var interval = setInterval(function() {
      ds = bj_hand_score(BJ.dealerHand);
      if (ds < 17) { BJ.dealerHand.push(bj_draw()); bj_render_hand($('bjDealerHand'), BJ.dealerHand, false); bj_update_score(false); }
      else {
        clearInterval(interval);
        var ps = bj_hand_score(BJ.playerHand); ds = bj_hand_score(BJ.dealerHand);
        if (ds > 21 || ps > ds) { BJ.wins++; BJ.balance += BJ.bet; bj_end('🏆 Kazandın! +'+BJ.bet, 'win'); }
        else if (ps === ds) { BJ.pushes++; bj_end('🤝 Berabere!', 'push'); }
        else { BJ.losses++; BJ.balance -= BJ.bet; bj_end('😢 Kaybettin! -'+BJ.bet, 'lose'); }
      }
    }, 400);
  }
  var bjDeal=$('bjDeal'),bjHit=$('bjHit'),bjStand=$('bjStand'),bjDouble=$('bjDouble');
  if(bjDeal) bjDeal.addEventListener('click', bj_deal_init);
  if(bjHit) bjHit.addEventListener('click', bj_hit);
  if(bjStand) bjStand.addEventListener('click', bj_stand);
  if(bjDouble) bjDouble.addEventListener('click', function(){
    BJ.bet *= 2; BJ.playerHand.push(bj_draw());
    bj_render_hand($('bjPlayerHand'), BJ.playerHand, false);
    bj_update_score(true);
    if(bj_hand_score(BJ.playerHand) > 21){ BJ.losses++; BJ.balance -= BJ.bet; bj_end('💔 Battın! -'+BJ.bet, 'lose'); }
    else bj_stand();
  });
  document.querySelectorAll('.bj-chip').forEach(function(chip) {
    if (!chip.dataset.bet) return;
    chip.addEventListener('click', function() {
      BJ.bet = Math.min(BJ.balance, BJ.bet + parseInt(chip.dataset.bet, 10));
      var bEl = $('bjBet'); if(bEl) bEl.textContent = BJ.bet;
    });
  });
  var bjBetClear = $('bjBetClear');
  if(bjBetClear) bjBetClear.addEventListener('click', function(){ BJ.bet = 0; var bEl=$('bjBet');if(bEl)bEl.textContent=0; });
  bj_set_playing(false);
} catch(e){ console.error('Blackjack error', e); }

/* ══════════════════════════════════════════════════════════
   38. GEOGRAPHY QUIZ
══════════════════════════════════════════════════════════ */
try {
  var GEO_DATA = [
    {country:'Fransa',capital:'Paris',flag:'🇫🇷'},{country:'Japonya',capital:'Tokyo',flag:'🇯🇵'},
    {country:'Brezilya',capital:'Brasília',flag:'🇧🇷'},{country:'Avustralya',capital:'Canberra',flag:'🇦🇺'},
    {country:'Kanada',capital:'Ottawa',flag:'🇨🇦'},{country:'Almanya',capital:'Berlin',flag:'🇩🇪'},
    {country:'İtalya',capital:'Roma',flag:'🇮🇹'},{country:'İspanya',capital:'Madrid',flag:'🇪🇸'},
    {country:'Meksika',capital:'Meksiko',flag:'🇲🇽'},{country:'Hindistan',capital:'Yeni Delhi',flag:'🇮🇳'},
    {country:'Çin',capital:'Pekin',flag:'🇨🇳'},{country:'Rusya',capital:'Moskova',flag:'🇷🇺'},
    {country:'Arjantin',capital:'Buenos Aires',flag:'🇦🇷'},{country:'Güney Afrika',capital:'Cape Town',flag:'🇿🇦'},
    {country:'Mısır',capital:'Kahire',flag:'🇪🇬'},{country:'Türkiye',capital:'Ankara',flag:'🇹🇷'},
    {country:'Hollanda',capital:'Amsterdam',flag:'🇳🇱'},{country:'Portekiz',capital:'Lizbon',flag:'🇵🇹'},
    {country:'Yunanistan',capital:'Atina',flag:'🇬🇷'},{country:'İsveç',capital:'Stockholm',flag:'🇸🇪'},
    {country:'Norveç',capital:'Oslo',flag:'🇳🇴'},{country:'Finlandiya',capital:'Helsinki',flag:'🇫🇮'},
    {country:'İsviçre',capital:'Bern',flag:'🇨🇭'},{country:'Avusturya',capital:'Viyana',flag:'🇦🇹'},
    {country:'Belçika',capital:'Brüksel',flag:'🇧🇪'},{country:'Peru',capital:'Lima',flag:'🇵🇪'},
    {country:'Tayland',capital:'Bangkok',flag:'🇹🇭'},{country:'Vietnam',capital:'Hanoi',flag:'🇻🇳'},
    {country:'Polonya',capital:'Varşova',flag:'🇵🇱'},{country:'İsrail',capital:'Kudüs',flag:'🇮🇱'}
  ];
  var GEO = { idx:0, correct:0, wrong:0, streak:0, started:false, questions:[] };
  function geo_shuffle() {
    var a = GEO_DATA.slice(); for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;} return a;
  }
  function geo_next() {
    if (!GEO.started) return;
    GEO.questions = geo_shuffle();
    GEO.idx = 0;
    geo_show();
  }
  function geo_show() {
    var q = GEO.questions[GEO.idx % GEO.questions.length];
    var opts = [q.capital];
    var others = GEO_DATA.filter(function(d){ return d.capital !== q.capital; });
    others = geo_shuffle(others).slice(0,3); others.forEach(function(o){ opts.push(o.capital); });
    opts = geo_shuffle(opts);
    var flagEl=$('geoFlag'),qEl=$('geoQ'),optsEl=$('geoOpts');
    if(flagEl) flagEl.textContent = q.flag;
    if(qEl) qEl.textContent = q.country + ' ülkesinin başkenti neresidir?';
    if(!optsEl) return;
    optsEl.innerHTML = '';
    opts.forEach(function(opt) {
      var btn = document.createElement('button'); btn.className = 'geo-btn'; btn.textContent = opt;
      btn.addEventListener('click', function() {
        optsEl.querySelectorAll('.geo-btn').forEach(function(b){ b.disabled = true; });
        var correct = opt === q.capital;
        btn.classList.add(correct ? 'correct' : 'wrong');
        if (!correct) optsEl.querySelectorAll('.geo-btn').forEach(function(b){ if(b.textContent===q.capital) b.classList.add('correct'); });
        if (correct) { GEO.correct++; GEO.streak++; toast('✅ Doğru! ' + q.capital, '#69f0ae'); }
        else { GEO.wrong++; GEO.streak = 0; toast('❌ ' + q.capital + '!', '#ff6b9d'); }
        var gc=$('geoCorrect'),gw=$('geoWrong'),gs=$('geoStreak');
        if(gc) gc.textContent=GEO.correct; if(gw) gw.textContent=GEO.wrong; if(gs) gs.textContent=GEO.streak;
        var pf=$('geoProgFill');
        if(pf) pf.style.width = (GEO.correct/(GEO.correct+GEO.wrong)*100)+'%';
        GEO.idx++;
        setTimeout(geo_show, 1200);
      });
      optsEl.appendChild(btn);
    });
  }
  var geoStart = $('geoStart');
  if(geoStart) geoStart.addEventListener('click', function(){
    GEO.started=true; GEO.correct=0; GEO.wrong=0; GEO.streak=0; geoStart.textContent='🔄 Yenile';
    var gc=$('geoCorrect'),gw=$('geoWrong'),gs=$('geoStreak');
    if(gc)gc.textContent=0;if(gw)gw.textContent=0;if(gs)gs.textContent=0;
    geo_next();
  });
} catch(e){ console.error('GeoQuiz error', e); }

/* ══════════════════════════════════════════════════════════
   39. PASSWORD GENERATOR
══════════════════════════════════════════════════════════ */
try {
  var passOutput=$('passOutput'), passStr=$('passStr');
  function pass_gen_func() {
    var len = parseInt(($('passLen')||{value:'16'}).value, 10);
    var upper = ($('passUpper')||{checked:true}).checked;
    var lower = ($('passLower')||{checked:true}).checked;
    var nums = ($('passNums')||{checked:true}).checked;
    var syms = ($('passSyms')||{checked:false}).checked;
    var charset = '';
    if (upper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (lower) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (nums) charset += '0123456789';
    if (syms) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    if (!charset) charset = 'abcdefghijklmnopqrstuvwxyz';
    var pass = '';
    for (var i = 0; i < len; i++) pass += charset[Math.floor(Math.random() * charset.length)];
    if (passOutput) passOutput.textContent = pass;
    // Strength
    var score = 0;
    if (upper && /[A-Z]/.test(pass)) score++;
    if (lower && /[a-z]/.test(pass)) score++;
    if (nums && /[0-9]/.test(pass)) score++;
    if (syms && /[^A-Za-z0-9]/.test(pass)) score++;
    if (len >= 16) score++;
    if (len >= 24) score++;
    if (passStr) {
      var pcts = ['20%','40%','65%','80%','90%','100%'];
      var cols = ['#e74c3c','#e67e22','#f39c12','#27ae60','#16a085','#00e5ff'];
      passStr.style.width = pcts[Math.min(score,5)]; passStr.style.background = cols[Math.min(score,5)];
    }
  }
  var passLen = $('passLen'), passLenVal = $('passLenVal');
  if(passLen) passLen.addEventListener('input', function(){ if(passLenVal) passLenVal.textContent = passLen.value; pass_gen_func(); });
  ['passUpper','passLower','passNums','passSyms'].forEach(function(id){ var el=$(id); if(el) el.addEventListener('change', pass_gen_func); });
  var passGenBtn = $('passGen'); if(passGenBtn) passGenBtn.addEventListener('click', pass_gen_func);
  var passCopyBtn = $('passCopy'); if(passCopyBtn) passCopyBtn.addEventListener('click', function(){
    var txt = passOutput ? passOutput.textContent : '';
    if (navigator.clipboard) navigator.clipboard.writeText(txt).then(function(){ toast('Sifre kopyalandi!', '#00e5ff'); });
    else toast(txt, '#00e5ff');
  });
  pass_gen_func();
} catch(e){ console.error('PassGen error', e); }

/* ══════════════════════════════════════════════════════════
   40. CAESAR CIPHER
══════════════════════════════════════════════════════════ */
try {
  var cipherShift = 13, cipherMode = 'enc';
  var cipherInput=$('cipherInput'), cipherOutput=$('cipherOutput'), shiftDisp=$('shiftVal');
  function cipher_do() {
    if(!cipherInput||!cipherOutput) return;
    var txt = cipherInput.value;
    var shift = cipherMode === 'enc' ? cipherShift : (26 - cipherShift) % 26;
    var out = '';
    for (var i = 0; i < txt.length; i++) {
      var c = txt.charCodeAt(i);
      if (c >= 65 && c <= 90) out += String.fromCharCode((c - 65 + shift) % 26 + 65);
      else if (c >= 97 && c <= 122) out += String.fromCharCode((c - 97 + shift) % 26 + 97);
      else out += txt[i];
    }
    cipherOutput.value = out;
  }
  function cipher_upd_shift() { if(shiftDisp) shiftDisp.textContent = cipherShift; cipher_do(); }
  var sm=$('shiftMinus'),sp=$('shiftPlus');
  if(sm) sm.addEventListener('click',function(){ cipherShift=(cipherShift-1+26)%26; cipher_upd_shift(); });
  if(sp) sp.addEventListener('click',function(){ cipherShift=(cipherShift+1)%26; cipher_upd_shift(); });
  if(cipherInput) cipherInput.addEventListener('input',cipher_do);
  var cipherEnc=$('cipherEnc'),cipherDec=$('cipherDec');
  if(cipherEnc) cipherEnc.addEventListener('click',function(){ cipherMode='enc'; cipherEnc.classList.add('active'); if(cipherDec)cipherDec.classList.remove('active'); cipher_do(); });
  if(cipherDec) cipherDec.addEventListener('click',function(){ cipherMode='dec'; cipherDec.classList.add('active'); if(cipherEnc)cipherEnc.classList.remove('active'); cipher_do(); });
  var rot13Btn=$('rot13Btn'); if(rot13Btn) rot13Btn.addEventListener('click',function(){ cipherShift=13; cipherMode='enc'; if(cipherEnc)cipherEnc.classList.add('active'); if(cipherDec)cipherDec.classList.remove('active'); cipher_upd_shift(); toast('ROT13 aktif!','#7c4dff'); });
  var cipherCopy=$('cipherCopy'); if(cipherCopy) cipherCopy.addEventListener('click',function(){
    var txt = cipherOutput?cipherOutput.value:'';
    if(navigator.clipboard) navigator.clipboard.writeText(txt).then(function(){ toast('Kopyalandi!','#00e5ff'); });
  });
  var cipherSwap=$('cipherSwap'); if(cipherSwap) cipherSwap.addEventListener('click',function(){
    if(!cipherInput||!cipherOutput) return;
    var t=cipherInput.value; cipherInput.value=cipherOutput.value; cipher_do();
    toast('Yer degistirildi!','#7c4dff');
  });
  var cipherClear=$('cipherClear'); if(cipherClear) cipherClear.addEventListener('click',function(){ if(cipherInput)cipherInput.value=''; if(cipherOutput)cipherOutput.value=''; });
} catch(e){ console.error('CaesarCipher error', e); }

/* ══════════════════════════════════════════════════════════
   41. MOON PHASE
══════════════════════════════════════════════════════════ */
try {
  var moonCanvas = $('moonCanvas');
  if (moonCanvas) {
    var mctx = moonCanvas.getContext('2d');
    var MOON_PHASES = ['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘'];
    var PHASE_NAMES = ['Yeni Ay','Hilal','İlk Dördün','Dolunaya Yakın','Dolunay','Azalan Gibbous','Son Dördün','Eski Hilal'];
    function moon_phase(date) {
      var known = new Date(2000,0,6); var diff = date - known; var days = diff / 86400000;
      return ((days % 29.53) + 29.53) % 29.53;
    }
    function moon_draw_canvas(phase) {
      var W = moonCanvas.width, H = moonCanvas.height;
      var r = Math.min(W,H)/2 - 4;
      mctx.clearRect(0,0,W,H);
      mctx.save();
      mctx.shadowBlur = 30; mctx.shadowColor = 'rgba(200,200,255,.4)';
      // Dark circle
      mctx.fillStyle = '#02020d'; mctx.beginPath(); mctx.arc(W/2,H/2,r,0,Math.PI*2); mctx.fill();
      mctx.shadowBlur = 0;
      // Lit portion
      var pct = phase / 29.53;
      mctx.save();
      mctx.beginPath(); mctx.arc(W/2,H/2,r,0,Math.PI*2); mctx.clip();
      if (pct < 0.5) {
        // Waxing: right side lit
        var xOffset = r * Math.cos(Math.PI * pct * 2);
        mctx.fillStyle = 'rgba(230,230,210,0.9)';
        mctx.beginPath(); mctx.arc(W/2,H/2,r,-Math.PI/2,Math.PI/2); mctx.fill();
        mctx.fillStyle = '#02020d';
        mctx.save(); mctx.scale(xOffset/r,1);
        mctx.beginPath(); mctx.arc((W/2)/(xOffset/r),H/2,r,-Math.PI/2,Math.PI/2); mctx.fill();
        mctx.restore();
      } else {
        // Waning: left side lit
        var xOffset2 = r * Math.cos(Math.PI * (pct-0.5) * 2);
        mctx.fillStyle = 'rgba(230,230,210,0.9)';
        mctx.beginPath(); mctx.arc(W/2,H/2,r,Math.PI/2,Math.PI*1.5); mctx.fill();
        mctx.fillStyle = '#02020d';
        mctx.save(); mctx.scale(xOffset2/r,1);
        mctx.beginPath(); mctx.arc((W/2)/(xOffset2/r),H/2,r,Math.PI/2,Math.PI*1.5); mctx.fill();
        mctx.restore();
      }
      mctx.restore();
      // Rim
      mctx.strokeStyle = 'rgba(200,200,255,.3)'; mctx.lineWidth = 2;
      mctx.beginPath(); mctx.arc(W/2,H/2,r,0,Math.PI*2); mctx.stroke();
      mctx.restore();
    }
    var today = new Date(), phase = moon_phase(today), pIdx = Math.floor(phase/29.53*8);
    moon_draw_canvas(phase);
    var ig = $('moonInfoGrid');
    if (ig) {
      var infos = [
        {icon:'🌙',val:PHASE_NAMES[pIdx],lbl:'Mevcut Faz'},
        {icon:'📅',val:Math.round(phase)+' gün',lbl:'Son Yeni Aydan'},
        {icon:'⭕',val:Math.round((29.53-phase))+' gün',lbl:'Dolunaya Kalan'},
        {icon:MOON_PHASES[pIdx],val:Math.round(phase/29.53*100)+'%',lbl:'Aydınlanma'}
      ];
      ig.innerHTML = '';
      infos.forEach(function(info) {
        var c=document.createElement('div'); c.className='moon-card';
        c.innerHTML='<div class="mc-icon">'+info.icon+'</div><div class="mc-val">'+info.val+'</div><div class="mc-lbl">'+info.lbl+'</div>';
        ig.appendChild(c);
      });
    }
    var calRow = $('moonCalRow');
    if (calRow) {
      calRow.innerHTML = '';
      for (var d = -7; d <= 7; d++) {
        var dd = new Date(today); dd.setDate(today.getDate() + d);
        var dp = moon_phase(dd), dpi = Math.floor(dp/29.53*8);
        var dc = document.createElement('div'); dc.className = 'moon-day' + (d===0?' now':'');
        dc.innerHTML = '<div class="md-moon">'+MOON_PHASES[dpi]+'</div><div class="md-num">'+(dd.getDate())+'</div>';
        calRow.appendChild(dc);
      }
    }
  }
} catch(e){ console.error('MoonPhase error', e); }

/* ══════════════════════════════════════════════════════════
   42. PIXEL ART
══════════════════════════════════════════════════════════ */
try {
  var PIXEL_COLS = ['#000000','#ffffff','#ff0000','#ff6b00','#ffea00','#00c853','#00e5ff','#0044ff','#7c4dff','#ff6b9d','#795548','#607d8b','#e91e63','#ff9800','#8bc34a','#00bcd4','#3f51b5','#9c27b0','#ff5722','#4caf50'];
  var pxGrid=$('pixelGrid'), pxPal=$('pixelPal');
  if (pxGrid && pxPal) {
    var PX = { color:'#000000', tool:'draw', painting:false, grid:null, SIZE:20, CELLS:28, showGrid:true };
    // Init grid data
    PX.grid = [];
    for(var r=0;r<PX.CELLS;r++){PX.grid.push([]);for(var c=0;c<PX.CELLS;c++)PX.grid[r].push('#ffffff05');}
    // Build palette
    PIXEL_COLS.forEach(function(col) {
      var el=document.createElement('div'); el.className='px-col'+(col===PX.color?' sel':'');
      el.style.background=col; el.dataset.col=col;
      el.addEventListener('click',function(){
        document.querySelectorAll('.px-col').forEach(function(e){e.classList.remove('sel');});
        el.classList.add('sel'); PX.color=col; PX.tool='draw';
        document.querySelectorAll('#pxDraw,#pxErase,#pxFill').forEach(function(b){b.classList.remove('active');});
        $('pxDraw') && $('pxDraw').classList.add('active');
      });
      pxPal.appendChild(el);
    });
    // Build grid
    pxGrid.style.gridTemplateColumns='repeat('+PX.CELLS+','+PX.SIZE+'px)';
    var cells=[];
    for(var ri=0;ri<PX.CELLS;ri++){
      for(var ci=0;ci<PX.CELLS;ci++){
        (function(row,col){
          var cell=document.createElement('div'); cell.className='px-cell';
          cell.style.cssText='width:'+PX.SIZE+'px;height:'+PX.SIZE+'px;background:'+PX.grid[row][col];
          function px_paint(){
            if(PX.tool==='erase'){PX.grid[row][col]='#ffffff05';cell.style.background='#ffffff05';}
            else if(PX.tool==='fill'){
              var fc=PX.grid[row][col];
              function fill(r2,c2){
                if(r2<0||r2>=PX.CELLS||c2<0||c2>=PX.CELLS)return;
                if(PX.grid[r2][c2]!==fc)return;
                PX.grid[r2][c2]=PX.color;
                var el2=cells[r2*PX.CELLS+c2];if(el2)el2.style.background=PX.color;
                fill(r2-1,c2);fill(r2+1,c2);fill(r2,c2-1);fill(r2,c2+1);
              }
              fill(row,col);
            } else {PX.grid[row][col]=PX.color;cell.style.background=PX.color;}
          }
          cell.addEventListener('mousedown',function(){PX.painting=true;px_paint();});
          cell.addEventListener('mouseenter',function(){if(PX.painting&&PX.tool!=='fill')px_paint();});
          cells.push(cell); pxGrid.appendChild(cell);
        })(ri,ci);
      }
    }
    document.addEventListener('mouseup',function(){PX.painting=false;});
    var pxDraw=$('pxDraw'),pxErase=$('pxErase'),pxFill=$('pxFill'),pxGridBtn=$('pxGrid'),pxClearBtn=$('pxClear'),pxSaveBtn=$('pxSave');
    if(pxDraw)pxDraw.addEventListener('click',function(){PX.tool='draw';pxDraw.classList.add('active');if(pxErase)pxErase.classList.remove('active');if(pxFill)pxFill.classList.remove('active');});
    if(pxErase)pxErase.addEventListener('click',function(){PX.tool='erase';pxErase.classList.add('active');if(pxDraw)pxDraw.classList.remove('active');if(pxFill)pxFill.classList.remove('active');});
    if(pxFill)pxFill.addEventListener('click',function(){PX.tool='fill';pxFill.classList.add('active');if(pxDraw)pxDraw.classList.remove('active');if(pxErase)pxErase.classList.remove('active');});
    if(pxGridBtn)pxGridBtn.addEventListener('click',function(){
      PX.showGrid=!PX.showGrid;
      cells.forEach(function(c){c.style.borderColor=PX.showGrid?'rgba(255,255,255,.04)':'transparent';});
    });
    if(pxClearBtn)pxClearBtn.addEventListener('click',function(){
      PX.grid.forEach(function(r,ri){r.forEach(function(c,ci){PX.grid[ri][ci]='#ffffff05';cells[ri*PX.CELLS+ci].style.background='#ffffff05';});});
      toast('Temizlendi!','#546e7a');
    });
    if(pxSaveBtn)pxSaveBtn.addEventListener('click',function(){
      var sc=document.createElement('canvas'); sc.width=PX.CELLS; sc.height=PX.CELLS;
      var sctx=sc.getContext('2d');
      PX.grid.forEach(function(row,ri){row.forEach(function(col,ci){sctx.fillStyle=col;sctx.fillRect(ci,ri,1,1);});});
      var a=document.createElement('a'); a.download='pixel-art.png'; a.href=sc.toDataURL(); a.click();
      toast('Kaydedildi!','#69f0ae');
    });
  }
} catch(e){ console.error('PixelArt error', e); }

/* ══════════════════════════════════════════════════════════
   43. RIPPLE CANVAS
══════════════════════════════════════════════════════════ */
try {
  var rippleCanvas = $('rippleCanvas');
  if (rippleCanvas) {
    var rctx = rippleCanvas.getContext('2d');
    var ripples = [], rippleMode = 'rainbow';
    function ripple_size() {
      var rect = rippleCanvas.parentElement.getBoundingClientRect();
      rippleCanvas.width = Math.max(300, rect.width || 800);
      rippleCanvas.height = 320;
    }
    function ripple_color(mode, i) {
      if (mode==='rainbow') return 'hsl('+(Date.now()/10+i*20)%360+',90%,65%)';
      if (mode==='blue') return 'hsl('+(190+Math.random()*30)+',85%,60%)';
      if (mode==='fire') return 'hsl('+(Math.random()*50)+',90%,55%)';
      return 'hsl('+(100+Math.random()*40)+',80%,55%)';
    }
    function ripple_add(x, y) {
      var col = ripple_color(rippleMode, ripples.length);
      ripples.push({x:x, y:y, r:0, maxR:Math.random()*120+80, col:col, a:1, speed:Math.random()*2+2});
    }
    function ripple_draw() {
      var W=rippleCanvas.width, H=rippleCanvas.height;
      rctx.fillStyle='rgba(1,2,13,.12)'; rctx.fillRect(0,0,W,H);
      ripples.forEach(function(rp, i) {
        rp.r += rp.speed; rp.a = 1 - rp.r/rp.maxR;
        rctx.beginPath(); rctx.arc(rp.x,rp.y,rp.r,0,Math.PI*2);
        rctx.strokeStyle = rp.col.replace(')',', '+rp.a+')').replace('hsl','hsla');
        rctx.lineWidth = 2; rctx.stroke();
      });
      ripples = ripples.filter(function(rp){ return rp.a > 0; });
      requestAnimationFrame(ripple_draw);
    }
    rippleCanvas.addEventListener('click', function(e) {
      var rect=rippleCanvas.getBoundingClientRect();
      var x=(e.clientX-rect.left)*(rippleCanvas.width/rect.width);
      var y=(e.clientY-rect.top)*(rippleCanvas.height/rect.height);
      for(var n=0;n<3;n++) setTimeout(function(){ripple_add(x,y);},n*80);
    });
    rippleCanvas.addEventListener('mousemove', function(e) {
      if(e.buttons===1){
        var rect=rippleCanvas.getBoundingClientRect();
        var x=(e.clientX-rect.left)*(rippleCanvas.width/rect.width);
        var y=(e.clientY-rect.top)*(rippleCanvas.height/rect.height);
        if(Math.random()<.3) ripple_add(x,y);
      }
    });
    document.querySelectorAll('.ripple-col-btn').forEach(function(btn) {
      btn.addEventListener('click', function(){
        document.querySelectorAll('.ripple-col-btn').forEach(function(b){b.classList.remove('active');});
        btn.classList.add('active'); rippleMode=btn.dataset.col;
      });
    });
    var rippleClear=$('rippleClear'); if(rippleClear) rippleClear.addEventListener('click',function(){ripples=[];var W=rippleCanvas.width,H=rippleCanvas.height;rctx.fillStyle='#01020d';rctx.fillRect(0,0,W,H);});
    ripple_size(); ripple_draw();
    window.addEventListener('resize', ripple_size);
  }
} catch(e){ console.error('RippleCanvas error', e); }

/* ══════════════════════════════════════════════════════════
   44. SPEED CLICKER
══════════════════════════════════════════════════════════ */
try {
  var CL = { count:0, running:false, best:0, timeLeft:10, interval:null, startTime:null };
  var clickerBtn=$('clickerBtn'), clickerCount=$('clickerCount'), clickerBest=$('clickerBest'), clickerLast=$('clickerLast'), clickerCPS=$('clickerCPS'), clickerFill=$('clickerTimerFill');
  if (clickerBtn) {
    clickerBtn.addEventListener('click', function() {
      if (!CL.running) {
        CL.count=0; CL.running=true; CL.timeLeft=10; CL.startTime=Date.now();
        if(clickerCount) clickerCount.textContent='0';
        if(clickerFill) clickerFill.style.width='100%';
        CL.interval = setInterval(function() {
          CL.timeLeft -= 0.1;
          if(clickerFill) clickerFill.style.width=(CL.timeLeft/10*100)+'%';
          if(CL.timeLeft <= 0) {
            clearInterval(CL.interval); CL.running=false;
            if(CL.count > CL.best){ CL.best=CL.count; if(clickerBest)clickerBest.textContent=CL.best; }
            if(clickerLast) clickerLast.textContent=CL.count;
            var cps=Math.round(CL.count/10*10)/10;
            if(clickerCPS) clickerCPS.textContent=cps;
            if(clickerFill) clickerFill.style.width='0';
            toast(''+CL.count+' tiklama! '+cps+' CPS','#7c4dff');
          }
        }, 100);
      } else {
        CL.count++;
        if(clickerCount) clickerCount.textContent=CL.count;
        var elapsed=(Date.now()-CL.startTime)/1000;
        var cps=elapsed>0?Math.round(CL.count/elapsed*10)/10:0;
        if(clickerCPS) clickerCPS.textContent=cps;
      }
    });
  }
} catch(e){ console.error('SpeedClicker error', e); }

/* ══════════════════════════════════════════════════════════
   45. EMOJI STORY BUILDER
══════════════════════════════════════════════════════════ */
try {
  var EMOJI_CATS = {
    'İnsanlar & Duygular': ['😀','😂','😍','🥺','😎','🤔','😴','🥳','😱','🤩','😭','🤗','😤','🥰','😈'],
    'Doğa & Hava': ['🌍','🌊','🌙','☀️','⭐','🌈','⛅','🌩','❄️','🌸','🌺','🌿','🍀','🔥','💨'],
    'Hayvanlar': ['🦁','🐉','🦋','🦅','🐠','🐳','🦊','🐺','🦄','🐸','🦒','🐘','🦀','🦑','🦚'],
    'Yiyecek & İçecek': ['🍕','🍦','🎂','🍓','🍕','☕','🍺','🍎','🍣','🌮','🍜','🍩','🍇','🥑','🍰'],
    'Aktiviteler': ['🎮','🎵','🎨','⚽','🏆','🚀','✈️','🎭','🎪','🏄','🎯','🎲','🎸','🎬','🔬'],
    'Nesneler & Semboller': ['💎','👑','⚔️','🔮','💣','🗝️','📚','💡','🔑','🎁','💌','🌟','⚡','🔥','💰']
  };
  var emojiStory=[], emojiStoryEl=$('emojiStory'), emojiPaletteEl=$('emojiPalette');
  function emoji_render() {
    if(!emojiStoryEl) return;
    if(!emojiStory.length){
      emojiStoryEl.innerHTML='<span style="color:var(--tx3);font-size:.9rem;font-style:italic">Aşağıdaki emojilere tıklayarak hikayeni başlat...</span>';
    } else {
      emojiStoryEl.textContent=emojiStory.join(' ');
    }
  }
  if(emojiPaletteEl) {
    Object.keys(EMOJI_CATS).forEach(function(cat){
      var lbl=document.createElement('div'); lbl.className='emoji-cat'; lbl.textContent=cat;
      emojiPaletteEl.appendChild(lbl);
      EMOJI_CATS[cat].forEach(function(em){
        var btn=document.createElement('button'); btn.className='emoji-btn'; btn.textContent=em;
        btn.addEventListener('click',function(){ emojiStory.push(em); emoji_render(); });
        emojiPaletteEl.appendChild(btn);
      });
    });
  }
  var emojiUndo=$('emojiUndo'); if(emojiUndo) emojiUndo.addEventListener('click',function(){ emojiStory.pop(); emoji_render(); });
  var emojiClear=$('emojiClear'); if(emojiClear) emojiClear.addEventListener('click',function(){ emojiStory=[]; emoji_render(); });
  var emojiCopy=$('emojiCopy'); if(emojiCopy) emojiCopy.addEventListener('click',function(){
    if(navigator.clipboard) navigator.clipboard.writeText(emojiStory.join(' ')).then(function(){ toast('Hikaye kopyalandi!','#7c4dff'); });
  });
  var emojiRandom=$('emojiRandom'); if(emojiRandom) emojiRandom.addEventListener('click',function(){
    emojiStory=[];
    var allEmojis=[]; Object.values(EMOJI_CATS).forEach(function(arr){allEmojis=allEmojis.concat(arr);});
    for(var i=0;i<12;i++) emojiStory.push(allEmojis[Math.floor(Math.random()*allEmojis.length)]);
    emoji_render(); toast('Rastgele hikaye uretildi!','#ff6b9d');
  });
  emoji_render();
} catch(e){ console.error('EmojiStory error', e); }

/* ══════════════════════════════════════════════════════════
   46. SLOT MACHINE
══════════════════════════════════════════════════════════ */
try {
  var SLOT_SYMS = ['🍋','🍒','🔔','⭐','💎','🎰','7️⃣','🍀'];
  var SLOT_WEIGHTS = [4,4,3,2,1,1,1,2]; // Lower = rarer
  var SL = { balance:500, bet:10, wins:0, jackpots:0, spinning:false };
  var slotBalance=$('slotBalance'), slotResult=$('slotResult'), slotSpin=$('slotSpin'), slotWins=$('slotWins'), slotJP=$('slotJackpot')||$('slotJP');
  function slot_pick() {
    var total=SLOT_WEIGHTS.reduce(function(a,b){return a+b;},0);
    var r=Math.random()*total, cum=0;
    for(var i=0;i<SLOT_WEIGHTS.length;i++){cum+=SLOT_WEIGHTS[i];if(r<cum)return i;}
    return 0;
  }
  function slot_spin_anim(reelEl, finalIdx, delay, cb) {
    var spins=0, maxSpins=8+Math.floor(Math.random()*6);
    reelEl.classList.add('spinning');
    var iv=setInterval(function(){
      var s=$('#slotE'+reelEl.id.slice(-1))||reelEl.querySelector('span');
      if(s) s.textContent=SLOT_SYMS[Math.floor(Math.random()*SLOT_SYMS.length)];
      spins++;
      if(spins>=maxSpins){
        clearInterval(iv); reelEl.classList.remove('spinning');
        if(s) s.textContent=SLOT_SYMS[finalIdx];
        if(cb) cb();
      }
    },80+delay*20);
  }
  document.querySelectorAll('.slot-bet-btn').forEach(function(btn){
    btn.addEventListener('click',function(){
      document.querySelectorAll('.slot-bet-btn').forEach(function(b){b.classList.remove('active');});
      btn.classList.add('active'); SL.bet=parseInt(btn.dataset.bet,10);
    });
  });
  if(slotSpin) slotSpin.addEventListener('click',function(){
    if(SL.spinning||SL.balance<SL.bet){toast('Yetersiz bakiye!','#ff6b9d');return;}
    SL.spinning=true; SL.balance-=SL.bet; if(slotBalance)slotBalance.textContent=SL.balance;
    if(slotResult){slotResult.textContent='...';slotResult.className='slot-result';}
    slotSpin.disabled=true;
    var r1=slot_pick(),r2=slot_pick(),r3=slot_pick();
    var reels=[$('slotR1'),$('slotR2'),$('slotR3')];
    var done=0;
    [r1,r2,r3].forEach(function(ri,i){
      if(!reels[i])return;
      slot_spin_anim(reels[i],ri,i,function(){
        done++;
        if(done===3){
          SL.spinning=false; slotSpin.disabled=false;
          var win=0, msg='', cls='lose';
          if(r1===r2&&r2===r3){
            if(r1===6){win=SL.bet*50;msg='🎰 JACKPOT!! +'+win;cls='jackpot';SL.jackpots++;}
            else if(r1===4){win=SL.bet*20;msg='💎 BÜYÜK İKRAMİYE! +'+win;cls='jackpot';}
            else{win=SL.bet*5;msg='🎉 Üçlü! +'+win;cls='win';}
          } else if(r1===r2||r2===r3||r1===r3){
            win=SL.bet*2;msg='✨ Çift! +'+win;cls='win';
          } else if(r1===7||r2===7||r3===7){
            win=Math.floor(SL.bet*1.5);msg='⭐ Yıldız! +'+win;cls='win';
          } else {
            msg='😢 Kaybettin!';cls='lose';
          }
          SL.balance+=win; if(win>0)SL.wins++;
          if(slotBalance)slotBalance.textContent=SL.balance;
          if(slotResult){slotResult.textContent=msg;slotResult.className='slot-result '+cls;}
          if(slotWins)slotWins.textContent=SL.wins;
          if(slotJP)slotJP.textContent=SL.jackpots;
          if(win>0)toast(msg,'#ffea00');
        }
      });
    });
  });
} catch(e){ console.error('SlotMachine error', e); }

/* ══════════════════════════════════════════════════════════
   47. GRATITUDE JOURNAL
══════════════════════════════════════════════════════════ */
try {
  var GRAT_KEY='dreamscape_gratitude', GRAT_STREAK_KEY='dreamscape_grat_streak', GRAT_DATE_KEY='dreamscape_grat_date';
  var gratInput=$('gratInput'), gratEntries=$('gratEntries'), gratStreakEl=$('gratStreak');
  var gratList=[];
  try{gratList=JSON.parse(localStorage.getItem(GRAT_KEY))||[];}catch(e2){}
  var gratStreak=0;
  try{gratStreak=parseInt(localStorage.getItem(GRAT_STREAK_KEY)||'0',10)||0;}catch(e2){}
  function grat_render(){
    if(!gratEntries) return;
    gratEntries.innerHTML='';
    if(!gratList.length){gratEntries.innerHTML='<div class="grat-empty">Henüz bir şey yazmadın... ✨<br>Bugün güzel olan bir şeyi paylaş.</div>';return;}
    gratList.slice().reverse().forEach(function(entry,i){
      var div=document.createElement('div'); div.className='grat-entry';
      div.innerHTML='<div class="grat-edate">'+entry.date+'</div><div class="grat-etext">'+entry.text+'</div><button class="grat-edel">✕</button>';
      div.querySelector('.grat-edel').addEventListener('click',function(){
        var realIdx=gratList.length-1-i;
        gratList.splice(realIdx,1);
        try{localStorage.setItem(GRAT_KEY,JSON.stringify(gratList));}catch(e2){}
        grat_render();
      });
      gratEntries.appendChild(div);
    });
    if(gratStreakEl) gratStreakEl.textContent=gratStreak;
  }
  document.querySelectorAll('.grat-qb').forEach(function(btn){
    btn.addEventListener('click',function(){
      if(gratInput) gratInput.value=(gratInput.value?gratInput.value+' ':'')+btn.textContent;
      gratInput && gratInput.focus();
    });
  });
  var gratSaveBtn=$('gratSave');
  if(gratSaveBtn) gratSaveBtn.addEventListener('click',function(){
    var txt=gratInput?gratInput.value.trim():'';
    if(!txt){toast('Bir şeyler yaz!','#ff6b9d');return;}
    var now=new Date();
    var dateStr=now.toLocaleDateString('tr-TR',{weekday:'long',day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'});
    gratList.push({text:txt,date:dateStr,ts:now.getTime()});
    try{localStorage.setItem(GRAT_KEY,JSON.stringify(gratList));}catch(e2){}
    var lastDate=localStorage.getItem(GRAT_DATE_KEY);
    var todayStr=now.toDateString();
    if(lastDate!==todayStr){
      gratStreak++;
      try{localStorage.setItem(GRAT_STREAK_KEY,String(gratStreak));localStorage.setItem(GRAT_DATE_KEY,todayStr);}catch(e2){}
    }
    if(gratInput) gratInput.value='';
    grat_render();
    toast('Şükran kaydedildi! 💚','#69f0ae');
  });
  grat_render();
} catch(e){ console.error('GratitudeJournal error', e); }
