
/* ══════════════════════════════════════════════════════════
   24. WORLD EXPLORER
══════════════════════════════════════════════════════════ */
try {
  var WORLD_PLACES = [
    {n:'Santorini',c:'Yunanistan',e:'🏛️',g:['#74b9ff','#a29bfe'],f:'Caldera kraterleri üzerine inşa edilmiş beyaz badanalı evleriyle dünyaca ünlü. Her gün binlerce turist gün batımı izlemek için Oia kasabasına akın eder.'},
    {n:'Aurora Borealis',c:'İzlanda',e:'🌌',g:['#2d3561','#6c5ce7'],f:'Kuzey Işıkları, Güneşten gelen yüklü partiküllerin atmosferle etkileşimi sonucu oluşur. İzlanda, dünyada en iyi görüldüğü yerlerden biridir.'},
    {n:'Machu Picchu',c:'Peru',e:'🏔️',g:['#55efc4','#00b894'],f:'Andlar\'da 2430 metre yükseklikte kurulu İnka şehri. 15. yüzyılda inşa edilmiş ve yüzyıllarca dünyadan gizli kalmıştır.'},
    {n:'Maldivler',c:'Maldivler',e:'🏝️',g:['#00cec9','#0984e3'],f:'1200 den fazla adalı Hint Okyanusu ülkesi. Kristal berraklığındaki suları ve su üstü bungalovları ile dünyanın en lüks tatil destinasyonu.'},
    {n:'Kyoto',c:'Japonya',e:'⛩️',g:['#fd79a8','#e84393'],f:'2000 den fazla tapınak ve türbeye ev sahipliği yapan eski Japon başkenti. İlkbaharda kiraz çiçekleri açtığında her yer pembeye bürünür.'},
    {n:'Büyük Mercan Resifi',c:'Avustralya',e:'🐠',g:['#00b894','#00cec9'],f:'Uzaydan görülebilen dünyanın en büyük canlı yapısı. 900 adaya yayılan bu mercan resifi 1500 den fazla balık türüne ev sahipliği yapar.'},
    {n:'Pamukkale',c:'Türkiye',e:'🌊',g:['#dfe6e9','#74b9ff'],f:'Beyaz travertin havuzları ile ünlü doğa harikası. Kalsiyum bikarbanat açısından zengin termal sular soğuyunca bu beyaz terasları oluşturur.'},
    {n:'Amazon Ormanı',c:'Brezilya',e:'🌿',g:['#00b894','#fdcb6e'],f:'Dünya\'nın akciğeri. 5,5 milyon km² ile dünyanın en büyük yağmur ormanı. 400 milyar ağaç ve 3 milyon farklı türe ev sahipliği yapar.'},
    {n:'Büyük Kanyon',c:'ABD',e:'🏜️',g:['#e17055','#d63031'],f:'446 km uzunluğunda ve 1,8 km derinliğinde. Colorado Nehri\'nin milyonlarca yılda oyduğu bu kanyon, Dünya\'nın jeoloji kitabı gibidir.'},
    {n:'Norveç Fiyortları',c:'Norveç',e:'⛰️',g:['#636e72','#2d3436'],f:'Buzulların geçmişte oyduğu derin deniz girinti ve koylar. Geirangerfjord ve Nærøyfjord, UNESCO Dünya Mirası listesindedir.'},
    {n:'Bora Bora',c:'Fransız Polinezyası',e:'🌺',g:['#0984e3','#00cec9'],f:'Pasifik\'te cennet köşesi. Sönmüş bir yanardağın üzerine kurulu bu ada, turkuaz lagünü ve mercan resifi ile doğanın şaheseridir.'},
    {n:'Karnak Tapınağı',c:'Mısır',e:'🏺',g:['#fdcb6e','#e17055'],f:'Dünyanın en büyük dini kompleslerinden biri. 2000 yılı aşkın süre boyunca Mısır\'ın dini merkezi olmuş, 30 faradan fazlasının katkısıyla inşa edilmiştir.'},
    {n:'Kuzey Işıkları',c:'Norveç',e:'🌠',g:['#a29bfe','#6c5ce7'],f:'Yeşil, mor ve kırmızı renklerde dans eden ışık gösterisi. Tromsø, yılın 76 gününde bu büyülü gökyüzü dansına ev sahipliği yapar.'},
    {n:'Angkor Wat',c:'Kamboçya',e:'🕌',g:['#55efc4','#fdcb6e'],f:'12. yüzyılda inşa edilen dünyanın en büyük dini yapısı. Hint kozmolojisini mimari olarak yansıtan bu dev tapınak 160 hektar alanı kapsar.'},
    {n:'Reine Köyü',c:'Norveç',e:'🏡',g:['#74b9ff','#636e72'],f:'Lofoten adalarında kırmızı balıkçı kulübeleriyle çevrili peri masalı köyü. Keskin dağlar ve berrak sular arasına gizlenmiş fotoğraf cenneti.'},
    {n:'Colosseum',c:'İtalya',e:'🏟️',g:['#fdcb6e','#d63031'],f:'70 yılında inşa edilen ve 80.000 seyirci kapasiteli devasa amfi tiyatro. İki bin yıl önce gladyatör dövüşlerine sahne olmuştur.'},
    {n:'Zhangjiajie',c:'Çin',e:'🌁',g:['#55efc4','#636e72'],f:'Avatar filminin ilham kaynağı olan sütun kayalıklar. Binlerce metre yükseklikteki bu kaya sütunları arasında süzülen bulutlar başka bir gezegen gibi hissettirir.'},
    {n:'Venedik Kanalları',c:'İtalya',e:'🚤',g:['#74b9ff','#a29bfe'],f:'118 ada üzerine kurulu ve 177 kanal boyunca gondolların süzdüğü büyülü şehir. Araçsız tek şehir olan Venedik yavaş yavaş suya batmaktadır.'},
    {n:'Kapadokya',c:'Türkiye',e:'🎈',g:['#fd79a8','#fdcb6e'],f:'Peri bacaları ve sıcak hava balonlarıyla ünlü. Şafak vakti gökyüzünde yüzlerce renkli balonun süzdüğünü görmek ömrün en güzel anlarından biri.'},
    {n:'Victoria Şelalesi',c:'Afrika',e:'💧',g:['#00b894','#0984e3'],f:'Dünyanın en büyük şelalesi. Gürleyen Duman anlamına gelen bu dev şelale, yüz metrelerce yukarıya su sisi fırlatır ve 50 km uzaktan görülür.'},
    {n:'Antartika',c:'Antarktika',e:'🐧',g:['#dfe6e9','#00cec9'],f:'Yeryüzünün yüzde 90 buzulu burada. Dünyadan daha fazla tatlı su barındıran bu kıtada 1000 den az kalıcı insan yaşar ama 18 milyon penguen vardır.'},
    {n:'Trolltunga Kayalığı',c:'Norveç',e:'🧗',g:['#636e72','#2d3436'],f:'700 metre yükseklikte Ringedalsvatnet gölünün üzerine uzanan kaya çıkıntısı. 8-10 saatlik zorlu yürüyüşün sonunda sizi mutlak bir güzellik bekliyor.'},
    {n:'Phi Phi Adaları',c:'Tayland',e:'🌊',g:['#00cec9','#55efc4'],f:'Turkuaz sulara çevrilmiş kireçtaşı uçurumları. The Beach filminin çekildiği bu adalar hala el değmemiş doğalarıyla büyülüyor.'}
  ];
  var worldGrid = $('worldGrid'), wfPanel = $('worldFactPanel');
  if (worldGrid) {
    WORLD_PLACES.forEach(function(place) {
      var card = document.createElement('div');
      card.className = 'world-card';
      card.style.background = 'linear-gradient(135deg,' + place.g[0] + ',' + place.g[1] + ')';
      card.innerHTML = '<div class="world-overlay"></div><div class="world-info"><div class="world-flag">' + place.e + '</div><div class="world-name">' + place.n + '</div><div class="world-country">' + place.c + '</div></div>';
      card.addEventListener('click', function() {
        document.querySelectorAll('.world-card').forEach(function(c){ c.style.outline = ''; });
        card.style.outline = '2px solid var(--a3)';
        $('wfIcon').textContent = place.e;
        $('wfTitle').textContent = place.n;
        $('wfSub').textContent = place.c;
        $('wfText').textContent = place.f;
        wfPanel.classList.add('show');
        wfPanel.scrollIntoView({behavior:'smooth', block:'nearest'});
      });
      worldGrid.appendChild(card);
    });
  }
} catch(e){ console.error('WorldExplorer error', e); }

/* ══════════════════════════════════════════════════════════
   25. MASTERMIND
══════════════════════════════════════════════════════════ */
try {
  var MM = {
    COLORS: ['#e74c3c','#e67e22','#f1c40f','#2ecc71','#3498db','#9b59b6'],
    CNAMES: ['Kirmizi','Turuncu','Sari','Yesil','Mavi','Mor'],
    secret: [], curRow: 0, curPegs: [], selColor: null, MAX_ROWS: 8, PEGS: 4, over: false
  };
  var mmBoard = $('mmBoard'), mmStatus = $('mmStatus'), mmColors = $('mmColors');
  function mm_new() {
    MM.secret = []; MM.curRow = 0; MM.curPegs = []; MM.selColor = MM.COLORS[0]; MM.over = false;
    for (var i = 0; i < MM.PEGS; i++) MM.secret.push(MM.COLORS[Math.floor(Math.random() * MM.COLORS.length)]);
    if (!mmBoard) return;
    mmBoard.innerHTML = '';
    for (var r = 0; r < MM.MAX_ROWS; r++) {
      var row = document.createElement('div'); row.className = 'mm-row' + (r === 0 ? ' active' : ''); row.id = 'mmRow' + r;
      var num = document.createElement('div'); num.className = 'mm-row-num'; num.textContent = r + 1;
      var pr = document.createElement('div'); pr.className = 'mm-peg-row'; pr.id = 'mmPegs' + r;
      for (var p = 0; p < MM.PEGS; p++) {
        (function(rr, pp) {
          var peg = document.createElement('div'); peg.className = 'mm-peg'; peg.dataset.r = rr; peg.dataset.p = pp;
          peg.addEventListener('click', function() {
            if (MM.over || rr !== MM.curRow) return;
            peg.style.background = MM.selColor; peg.dataset.col = MM.selColor;
            MM.curPegs[pp] = MM.selColor;
            var filled = MM.curPegs.filter(Boolean).length;
            var cb = $('mmCheck' + rr);
            if (cb && filled === MM.PEGS) { cb.style.opacity = '1'; cb.style.pointerEvents = 'auto'; }
          });
          pr.appendChild(peg);
        })(r, p);
      }
      var hints = document.createElement('div'); hints.className = 'mm-hints'; hints.id = 'mmHints' + r;
      for (var h = 0; h < 4; h++) { var hd = document.createElement('div'); hd.className = 'mm-hint'; hints.appendChild(hd); }
      var checkBtn = document.createElement('button'); checkBtn.className = 'mini-btn'; checkBtn.textContent = 'OK'; checkBtn.id = 'mmCheck' + r;
      checkBtn.style.cssText = 'padding:5px 10px;opacity:.4;pointer-events:none;font-size:.75rem';
      (function(rr) {
        checkBtn.addEventListener('click', function() {
          if (MM.over || rr !== MM.curRow) return;
          if (MM.curPegs.filter(Boolean).length < MM.PEGS) { toast('4 yeri de doldur!', '#ff6b9d'); return; }
          var guess = MM.curPegs.slice(), sec = MM.secret.slice();
          var blacks = 0, whites = 0, gu = [], se = [];
          for (var i = 0; i < MM.PEGS; i++) {
            if (guess[i] === sec[i]) { blacks++; }
            else { gu.push(guess[i]); se.push(sec[i]); }
          }
          se.forEach(function(s) { var idx = gu.indexOf(s); if (idx !== -1) { whites++; gu.splice(idx, 1); } });
          var hintEls = $('mmHints' + rr).querySelectorAll('.mm-hint');
          var hArr = [];
          for (var b = 0; b < blacks; b++) hArr.push('black');
          for (var w = 0; w < whites; w++) hArr.push('white');
          hintEls.forEach(function(h, i) { if (hArr[i]) h.classList.add(hArr[i]); });
          $('mmRow' + rr).classList.remove('active');
          $('mmCheck' + rr).style.opacity = '0';
          if (blacks === MM.PEGS) {
            MM.over = true;
            mmStatus.innerHTML = '🎉 <strong style="color:var(--a4)">Kirdın!</strong> ' + (rr + 1) + '. denemede!';
            toast('Sifre kirdi! ' + (rr + 1) + '. denemede!', '#69f0ae'); return;
          }
          MM.curRow++; MM.curPegs = [];
          if (MM.curRow >= MM.MAX_ROWS) {
            MM.over = true;
            mmStatus.textContent = 'Bitti! Sifreyi kiramamadin.';
            toast('Kiramamadin!', '#ff6b9d'); return;
          }
          $('mmRow' + MM.curRow).classList.add('active');
          if (mmStatus) mmStatus.textContent = 'Deneme ' + (MM.curRow + 1) + '/' + MM.MAX_ROWS + ' — ' + blacks + ' siyah, ' + whites + ' beyaz';
        });
      })(r);
      row.appendChild(num); row.appendChild(pr); row.appendChild(hints); row.appendChild(checkBtn);
      mmBoard.appendChild(row);
    }
    if (mmColors) {
      mmColors.innerHTML = '';
      MM.COLORS.forEach(function(col, i) {
        var btn = document.createElement('button'); btn.className = 'mm-color-btn' + (i === 0 ? ' selected' : '');
        btn.style.background = col; btn.title = MM.CNAMES[i]; btn.dataset.col = col;
        btn.addEventListener('click', function() {
          document.querySelectorAll('.mm-color-btn').forEach(function(b){ b.classList.remove('selected'); });
          btn.classList.add('selected'); MM.selColor = col;
        });
        mmColors.appendChild(btn);
      });
    }
    if (mmStatus) mmStatus.textContent = 'Renk sec, yuvalara yerles, OK\'a bas';
  }
  var mmNew = $('mmNewGame');
  if (mmNew) mmNew.addEventListener('click', mm_new);
  mm_new();
} catch(e){ console.error('Mastermind error', e); }

/* ══════════════════════════════════════════════════════════
   26. MAGIC 8 BALL
══════════════════════════════════════════════════════════ */
try {
  var BALL_ANSWERS = ['Kesinlikle Evet!','Cok muhtemel','Bence evet','Evet','Tahminlerim oyle','Cevap acik','Evet diyebilirim','Belirtiler evet','Sormay tekrar dene','Simdi cevap veremem','Konsantre ol ve sor','Sonucu tahmin etmek zor','Cevap belirsiz','Pek iyi degil','Supheli','Hayir sanmiyorum','Cok suphe var','Hayir','Kesinlikle hayir','Cevap hayir!'];
  var ballWrap = $('ballWrap'), ballAnswer = $('ballAnswer'), ballInput = $('ballInput'), ballHist = $('ballHistory');
  var ballShaking = false;
  function ball_shake() {
    if (ballShaking) return; ballShaking = true;
    var b = ballWrap ? ballWrap.querySelector('.ball') : null;
    if (ballAnswer) ballAnswer.style.opacity = '0';
    if (b) { b.classList.add('ball-shake'); setTimeout(function(){ b.classList.remove('ball-shake'); }, 500); }
    setTimeout(function() {
      var ans = BALL_ANSWERS[Math.floor(Math.random() * BALL_ANSWERS.length)];
      if (ballAnswer) { ballAnswer.textContent = ans; ballAnswer.style.opacity = '1'; }
      var q = ballInput ? ballInput.value.trim() : '';
      if (q && ballHist) {
        var item = document.createElement('div'); item.className = 'ball-history-item';
        var qt = q.length > 30 ? q.slice(0, 30) + '...' : q;
        item.innerHTML = '<span>' + qt + '</span><span class="bha">' + ans + '</span>';
        ballHist.insertBefore(item, ballHist.firstChild);
        if (ballHist.children.length > 5) ballHist.removeChild(ballHist.lastChild);
      }
      ballShaking = false;
    }, 600);
  }
  if (ballWrap) ballWrap.addEventListener('click', ball_shake);
  if (ballInput) ballInput.addEventListener('keydown', function(e){ if (e.key === 'Enter') ball_shake(); });
} catch(e){ console.error('Magic8Ball error', e); }

/* ══════════════════════════════════════════════════════════
   27. STAR MAP
══════════════════════════════════════════════════════════ */
try {
  var starCanvas = $('starCanvas');
  if (starCanvas) {
    var STAR_CONS = [
      {n:'Buyuk Ayi',f:'Buyuk Ayi burcunun yedi parlak yildizi kuzey yarimkurede her mevsim gorulur.',s:[[0.15,0.3],[0.25,0.25],[0.35,0.28],[0.45,0.22],[0.55,0.3],[0.6,0.42],[0.5,0.48]]},
      {n:'Orion',f:'Orion avci takimyildizi kis aylarinin en gosterisli takimyildizidir.',s:[[0.52,0.15],[0.48,0.18],[0.55,0.22],[0.44,0.35],[0.51,0.35],[0.58,0.35],[0.46,0.5],[0.54,0.5]]},
      {n:'Skorpion',f:'Skorpion takimyildizi yaz gokyuzunde antares kirmizi devi ile gozuklur.',s:[[0.78,0.2],[0.72,0.28],[0.68,0.35],[0.72,0.45],[0.78,0.52],[0.72,0.7]]},
      {n:'Kuzey Taci',f:'7 yildizdan olusan kucuk tac sekli bahar aylarinda gorulur.',s:[[0.7,0.15],[0.75,0.1],[0.82,0.12],[0.86,0.18],[0.82,0.24],[0.75,0.25]]}
    ];
    var sc = starCanvas.getContext('2d');
    var starList = [], starLines = [], starMode = 'explore', starLast = null;
    function starResize() {
      var r = starCanvas.parentElement.getBoundingClientRect();
      starCanvas.width = Math.max(300, r.width || 900);
      starCanvas.height = 380;
    }
    function starGen() {
      starList = [];
      var W = starCanvas.width, H = starCanvas.height;
      for (var i = 0; i < 250; i++) {
        starList.push({ x: Math.random()*W, y: Math.random()*H, r: Math.random()*1.3+0.2, a: Math.random()*0.6+0.3, h: Math.random()*60+200, ph: Math.random()*6.28, tw: Math.random()*0.04+0.01, name: null });
      }
      STAR_CONS.forEach(function(con) {
        con.s.forEach(function(pos) {
          starList.push({ x: pos[0]*W + (Math.random()-0.5)*12, y: pos[1]*H + (Math.random()-0.5)*12, r: 2+Math.random()*0.8, a: 0.9, h: 240, ph: 0, tw: 0.02, name: con.n });
        });
      });
    }
    function starDraw() {
      if (typeof PAGE_VISIBLE !== 'undefined' && !PAGE_VISIBLE) { requestAnimationFrame(starDraw); return; }
      var W = starCanvas.width, H = starCanvas.height;
      sc.fillStyle = '#02030d'; sc.fillRect(0, 0, W, H);
      sc.save(); sc.strokeStyle = 'rgba(255,234,0,.3)'; sc.lineWidth = 1; sc.setLineDash([4,6]);
      starLines.forEach(function(line) {
        if (line.length < 2) return;
        sc.beginPath(); sc.moveTo(line[0].x, line[0].y);
        for (var i = 1; i < line.length; i++) sc.lineTo(line[i].x, line[i].y);
        sc.stroke();
      });
      sc.setLineDash([]); sc.restore();
      starList.forEach(function(s) {
        s.ph += s.tw; var a = s.a * (0.6 + Math.abs(Math.sin(s.ph)) * 0.4);
        sc.globalAlpha = a;
        sc.fillStyle = 'hsl(' + s.h + ',75%,85%)'; sc.beginPath(); sc.arc(s.x, s.y, s.r, 0, 6.28); sc.fill();
      });
      sc.globalAlpha = 1;
      requestAnimationFrame(starDraw);
    }
    starCanvas.addEventListener('click', function(e) {
      var rect = starCanvas.getBoundingClientRect();
      var x = (e.clientX - rect.left) * (starCanvas.width / rect.width);
      var y = (e.clientY - rect.top) * (starCanvas.height / rect.height);
      var closest = null, minD = 30;
      starList.forEach(function(s) { var d = Math.hypot(s.x - x, s.y - y); if (d < minD) { minD = d; closest = s; } });
      var info = $('starInfo');
      if (closest) {
        if (starMode === 'draw') {
          if (!starLast) { starLines.push([closest]); starLast = closest; }
          else { starLines[starLines.length-1].push(closest); starLast = closest; }
          toast('Cizgi eklendi!', '#ffea00');
        } else {
          if (info) info.textContent = closest.name ? (closest.name + ' takimyildizina ait - ' + (STAR_CONS.find(function(c){return c.n===closest.name;}) || {f:'parlak bir yildiz!'}).f) : 'Anonim yildiz — isigi sana ulasmasi milyonlarca yil surdu';
        }
      } else {
        if (starMode === 'draw') starLast = null;
      }
    });
    document.querySelectorAll('.star-mode-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.star-mode-btn').forEach(function(b){ b.classList.remove('active'); });
        btn.classList.add('active'); starMode = btn.dataset.mode; starLast = null;
      });
    });
    var starClear = $('starClear'); if (starClear) starClear.addEventListener('click', function(){ starLines = []; starLast = null; var si = $('starInfo'); if(si) si.textContent = 'Temizlendi — yeni cizimler yapabilirsin'; });
    var starRand = $('starRandom'); if (starRand) starRand.addEventListener('click', function(){
      var con = STAR_CONS[Math.floor(Math.random() * STAR_CONS.length)];
      starLines = []; var W = starCanvas.width, H = starCanvas.height;
      starLines.push(con.s.map(function(p){ return {x:p[0]*W, y:p[1]*H}; }));
      starLast = null;
      var si = $('starInfo'); if(si) si.textContent = con.n + ' takimyildizi — ' + con.f;
      toast(con.n + ' gosterildi!', '#ffea00');
    });
    starResize(); starGen(); setTimeout(starDraw, 100);
    window.addEventListener('resize', function(){ starResize(); starGen(); });
  }
} catch(e){ console.error('StarMap error', e); }

/* ══════════════════════════════════════════════════════════
   28. COLOR PALETTE GENERATOR
══════════════════════════════════════════════════════════ */
try {
  var palDisp = $('paletteDisplay'), palSaved = $('savedPalettes');
  if (palDisp) {
    var palColors = ['#7c4dff','#9c6bff','#c49bff','#e2c8ff','#f0e3ff'];
    var palLocked = [false,false,false,false,false];
    var palSavedList = [];
    function hsl2hex(h, s, l) {
      s /= 100; l /= 100;
      var a = s * Math.min(l, 1 - l);
      function f(n) { var k = (n + h/30) % 12; var c = l - a * Math.max(Math.min(k-3, 9-k, 1), -1); return Math.round(255*c).toString(16).padStart(2,'0'); }
      return '#' + f(0) + f(8) + f(4);
    }
    function palGen() {
      var baseH = Math.random() * 360, S = Math.round(60 + Math.random()*30);
      for (var i = 0; i < 5; i++) {
        if (palLocked[i]) continue;
        palColors[i] = hsl2hex((baseH + i*30 + Math.random()*20) % 360, S, 30 + i*8 + Math.random()*10);
      }
      palRender();
    }
    function palRender() {
      palDisp.innerHTML = '';
      palColors.forEach(function(col, i) {
        var sw = document.createElement('div'); sw.className = 'pal-swatch'; sw.style.background = col;
        var inner = document.createElement('div'); inner.className = 'pal-swatch-inner';
        var hex = document.createElement('div'); hex.className = 'pal-hex'; hex.textContent = col;
        var lock = document.createElement('div'); lock.className = 'pal-lock'; lock.textContent = palLocked[i] ? '🔒' : '🔓';
        (function(ci, cc) {
          hex.addEventListener('click', function(e) { e.stopPropagation(); if(navigator.clipboard) navigator.clipboard.writeText(cc).then(function(){ toast('Kopyalandi: ' + cc, '#00e5ff'); }); });
          lock.addEventListener('click', function(e) { e.stopPropagation(); palLocked[ci] = !palLocked[ci]; palRender(); toast(palLocked[ci] ? 'Kilitlendi' : 'Kilidi acildi', '#7c4dff'); });
        })(i, col);
        inner.appendChild(hex); inner.appendChild(lock); sw.appendChild(inner); palDisp.appendChild(sw);
      });
    }
    function palSaveF() {
      palSavedList.unshift({colors: palColors.slice()});
      if (palSavedList.length > 5) palSavedList.pop();
      palRenderSaved(); toast('Palet kaydedildi!', '#69f0ae');
    }
    function palRenderSaved() {
      if (!palSaved) return;
      palSaved.innerHTML = '';
      if (!palSavedList.length) { palSaved.innerHTML = '<p style="font-size:.78rem;color:var(--tx3);text-align:center">Henuz kayit yok</p>'; return; }
      palSavedList.forEach(function(p) {
        var row = document.createElement('div'); row.className = 'saved-pal';
        var prev = document.createElement('div'); prev.className = 'saved-pal-preview';
        p.colors.forEach(function(c) { var d = document.createElement('div'); d.style.background = c; prev.appendChild(d); });
        row.appendChild(prev); palSaved.appendChild(row);
      });
    }
    var pgb = $('palGenBtn'); if(pgb) pgb.addEventListener('click', palGen);
    var psb = $('palSaveBtn'); if(psb) psb.addEventListener('click', palSaveF);
    var pcb = $('palCopyBtn'); if(pcb) pcb.addEventListener('click', function(){
      if(navigator.clipboard) navigator.clipboard.writeText(palColors.join(', ')).then(function(){ toast('Tum renkler kopyalandi!', '#00e5ff'); });
    });
    palRender(); palRenderSaved();
  }
} catch(e){ console.error('PaletteGen error', e); }

/* ══════════════════════════════════════════════════════════
   29. TAROT CARDS
══════════════════════════════════════════════════════════ */
try {
  var TAROT = [
    {n:'Sihirbaz',lbl:'I',e:'🎩',c1:'#1a0533',c2:'#4a1a7a',m:'Irade, beceri ve ozgüven. Araclarin elinde — kullanmak sana kalmiş.'},
    {n:'Yüksek Rahibe',lbl:'II',e:'🌙',c1:'#0a1a3a',c2:'#1a3a6a',m:'Gizem ve sezgi. Bilinçaltini dinle, cevaplar içinde gizli.'},
    {n:'İmparatoriçe',lbl:'III',e:'👑',c1:'#1a3a1a',c2:'#2a6a2a',m:'Bolluk ve güzellik. Dogayla uyum içinde bir dönem.'},
    {n:'İmparator',lbl:'IV',e:'⚔️',c1:'#3a1a0a',c2:'#6a3a1a',m:'Güç ve otorite. Saglam temeller üzerine insa et.'},
    {n:'Adalet',lbl:'VIII',e:'⚖️',c1:'#2a2a0a',c2:'#5a5a1a',m:'Denge ve dogru luk. Her sey dengede olacak.'},
    {n:'Güneş',lbl:'XIX',e:'☀️',c1:'#3a2a00',c2:'#6a4a00',m:'Sevinç ve basari. Aydinlik bir dönem seni bekliyor!'},
    {n:'Ay',lbl:'XVIII',e:'🌕',c1:'#1a1a3a',c2:'#2a2a6a',m:'Yanilsamalar ve korkular. Gercekle hayali ayirt etmeye çalış.'},
    {n:'Yildiz',lbl:'XVII',e:'⭐',c1:'#0a1a3a',c2:'#1a3a5a',m:'Umut ve ilham. Güzel günler kapida, pes etme!'},
    {n:'Dünya',lbl:'XXI',e:'🌍',c1:'#0a2a1a',c2:'#1a4a2a',m:'Tamamlanma ve bütünlük. Bir döngü kapaniyor.'},
    {n:'Aptal',lbl:'0',e:'🌈',c1:'#1a0a2a',c2:'#3a1a5a',m:'Yeni baslangiçlar. Maceraya atlamaya hazir misin?'},
    {n:'Kule',lbl:'XVI',e:'⚡',c1:'#2a0a0a',c2:'#5a1a1a',m:'Ani degisim. Eskiyi yikmadan yeni insa edemezsin.'},
    {n:'Güç',lbl:'XI',e:'🦁',c1:'#2a1a0a',c2:'#5a3a1a',m:'Iç güç ve cesaret. Sevgi, sabir ve irade ile.'},
    {n:'Talih Çarki',lbl:'X',e:'🎡',c1:'#1a0a3a',c2:'#3a1a6a',m:'Döngüler ve kader. Çark dönüyor — degisime hazir ol!'}
  ];
  var tarotSpread = $('tarotSpread'), tarotMeaning = $('tarotMeaning');
  var TAROT_LBLS = ['Geçmiş','Şimdi','Gelecek'];
  function tarotDraw() {
    if (!tarotSpread) return;
    tarotSpread.innerHTML = '';
    var picked = [], tries = 0;
    while (picked.length < 3 && tries < 100) {
      tries++;
      var c = TAROT[Math.floor(Math.random() * TAROT.length)];
      if (picked.indexOf(c) === -1) picked.push(c);
    }
    if (tarotMeaning) tarotMeaning.innerHTML = '<p style="color:var(--tx3)">Bir karta tikla ve sirini kesfet...</p>';
    picked.forEach(function(card, i) {
      var wrap = document.createElement('div'); wrap.className = 'tarot-card';
      var inner = document.createElement('div'); inner.className = 'tarot-card-inner';
      var back = document.createElement('div'); back.className = 'tarot-back'; back.textContent = '✦';
      var face = document.createElement('div'); face.className = 'tarot-face';
      face.style.background = 'linear-gradient(160deg,' + card.c1 + ',' + card.c2 + ')';
      face.innerHTML = '<div class="tarot-card-emoji">' + card.e + '</div><div class="tarot-card-name">' + card.n + '</div><div class="tarot-label">' + TAROT_LBLS[i] + '</div>';
      inner.appendChild(back); inner.appendChild(face); wrap.appendChild(inner);
      (function(c2, li) {
        wrap.addEventListener('click', function() {
          wrap.classList.add('revealed');
          if (tarotMeaning) tarotMeaning.innerHTML = '<div class="tarot-label">' + TAROT_LBLS[li] + '</div><h4>' + c2.lbl + ' — ' + c2.n + ' ' + c2.e + '</h4><p>' + c2.m + '</p>';
          toast(c2.e + ' ' + c2.n, '#ce93d8');
        });
      })(card, i);
      tarotSpread.appendChild(wrap);
    });
  }
  var tarotNew = $('tarotNew'); if(tarotNew) tarotNew.addEventListener('click', tarotDraw);
  tarotDraw();
} catch(e){ console.error('Tarot error', e); }

/* ══════════════════════════════════════════════════════════
   30. WOULD YOU RATHER
══════════════════════════════════════════════════════════ */
try {
  var WYR_QS = [
    {a:{i:'🐉',t:'Ejderha sahibi ol'},b:{i:'🦄',t:'Tek boynuzlu ata bin'},va:0,vb:0},
    {a:{i:'🌊',t:'Sonsuz yuzme yetenegine sahip ol'},b:{i:'🦅',t:'Kus gibi ucabilesin'},va:0,vb:0},
    {a:{i:'🌡️',t:'Hic usmeyesin'},b:{i:'☀️',t:'Hic isinmayasin'},va:0,vb:0},
    {a:{i:'🗣️',t:'Sadece fisiltıyla konusabilesin'},b:{i:'📢',t:'Her zaman bagirarak konusasin'},va:0,vb:0},
    {a:{i:'🎵',t:'Her gittigin yerde muzik calsin'},b:{i:'📸',t:'Tum anilar fotografraf gibi aklinda kalsin'},va:0,vb:0},
    {a:{i:'🌍',t:'Dunyayi gez ama ev yok'},b:{i:'🏠',t:'Cok rahat evin olsun ama hic seyahat yok'},va:0,vb:0},
    {a:{i:'🧠',t:'Cok zeki ama unutkan ol'},b:{i:'💪',t:'Cok guclu ama yavas dusun'},va:0,vb:0},
    {a:{i:'⏰',t:'Zamani durdurabilasin'},b:{i:'🔮',t:'Gelecegi gorebilesin'},va:0,vb:0},
    {a:{i:'🍕',t:'Omur boyu pizza ye'},b:{i:'🍦',t:'Omur boyu dondurma ye'},va:0,vb:0},
    {a:{i:'💰',t:'Cok zengin ol, tek basina yasa'},b:{i:'👨‍👩‍👧‍👦',t:'Orta gelirli, buyuk aile ile yasa'},va:0,vb:0},
    {a:{i:'😴',t:'3 saat uyku yeterli olsun'},b:{i:'🧘',t:'Uymana gerek kalmasin'},va:0,vb:0},
    {a:{i:'🎭',t:'Tanindigin halde sevilmesen'},b:{i:'💚',t:'Sevildigen halde hic taninmasan'},va:0,vb:0}
  ];
  var wyrIdx = 0, wyrVoted = false;
  function wyrShow() {
    wyrVoted = false;
    var q = WYR_QS[wyrIdx];
    var ia = $('wyrIconA'), ta = $('wyrTextA'), pa = $('wyrPctA'), ba = $('wyrBarA');
    var ib = $('wyrIconB'), tb = $('wyrTextB'), pb = $('wyrPctB'), bb = $('wyrBarB');
    var vo = $('wyrVotes');
    if(ia) ia.textContent = q.a.i; if(ta) ta.textContent = q.a.t; if(pa) pa.textContent = ''; if(ba) ba.style.width = '0';
    if(ib) ib.textContent = q.b.i; if(tb) tb.textContent = q.b.t; if(pb) pb.textContent = ''; if(bb) bb.style.width = '0';
    var wa = $('wyrA'), wb = $('wyrB');
    if(wa) wa.classList.remove('voted'); if(wb) wb.classList.remove('voted');
    if(vo) vo.textContent = (q.va + q.vb) + ' oy';
  }
  function wyrVote(side) {
    if (wyrVoted) return; wyrVoted = true;
    var q = WYR_QS[wyrIdx];
    if (side === 'a') q.va++; else q.vb++;
    var total = q.va + q.vb;
    var pA = Math.round(q.va/total*100), pB = 100 - pA;
    var pa = $('wyrPctA'), pb = $('wyrPctB'), ba = $('wyrBarA'), bb = $('wyrBarB'), vo = $('wyrVotes');
    if(pa) pa.textContent = pA + '%'; if(pb) pb.textContent = pB + '%';
    if(ba) ba.style.width = pA + '%'; if(bb) bb.style.width = pB + '%';
    if(vo) vo.textContent = total + ' oy';
    var wa = $('wyrA'), wb = $('wyrB');
    if(wa) wa.classList.add('voted'); if(wb) wb.classList.add('voted');
    toast((side==='a'?q.a.i:q.b.i) + ' secimini yaptin!', '#7c4dff');
  }
  var wya = $('wyrA'); if(wya) wya.addEventListener('click', function(){ wyrVote('a'); });
  var wyb = $('wyrB'); if(wyb) wyb.addEventListener('click', function(){ wyrVote('b'); });
  var wys = $('wyrSkip'); if(wys) wys.addEventListener('click', function(){ wyrIdx = (wyrIdx+1) % WYR_QS.length; wyrShow(); });
  wyrShow();
} catch(e){ console.error('WouldYouRather error', e); }

/* ══════════════════════════════════════════════════════════
   31. NUMBER MAGIC
══════════════════════════════════════════════════════════ */
try {
  var nmStep = 0, nmVals = [], nmTrick = 0;
  var NM_TRICKS = [
    { title:'Klasik Buyü', steps:[
      {t:'Aklina 1-50 arasi bir sayi dusun',p:'Hazir olduğunda İleri\'ye bas',btn:'İleri →'},
      {t:'Sayini 2 ile çarp',p:'Sonucu asagiya yaz',btn:'İleri →',inp:'2x sayın'},
      {t:'Sonuca 8 ekle',p:'Onceki sayi + 8',btn:'İleri →',inp:'Yeni sayin'},
      {t:'Simdi 2ye bol',p:'Onceki sayi / 2',btn:'İleri →',inp:'Yeni sayin'},
      {t:'Baslangic sayini cikar',p:'Onceki sayi - ilk sayın',btn:'Büyüyü goster!',inp:'Son sayin'}
    ], result: function(v){ return 4; }, reveal: function(v){ return '4'; } },
    { title:'9 Buyüsü', steps:[
      {t:'1 ile 9 arasi bir sayi dusun',p:'Sırrını sakliyorum...',btn:'İleri →'},
      {t:'Sayini 9 ile çarp',p:'',btn:'İleri →',inp:'9x sayın'},
      {t:'Basamaklari topla',p:'Ornek: 36 = 3+6 = 9',btn:'İleri →',inp:'Basamak toplami'},
      {t:'5 cikar',p:'',btn:'Büyüyü goster!',inp:'Son sayin'}
    ], result: function(v){ return 4; }, reveal: function(v){ return '4'; } }
  ];
  function nmGo() {
    var prog = $('magicProgress'), stepsEl = $('magicSteps');
    if (!prog || !stepsEl) return;
    var trick = NM_TRICKS[nmTrick];
    prog.innerHTML = '';
    for (var i = 0; i < trick.steps.length; i++) {
      var dot = document.createElement('div');
      dot.className = 'magic-dot' + (i === nmStep ? ' cur' : (i < nmStep ? ' done' : ''));
      prog.appendChild(dot);
    }
    stepsEl.innerHTML = '';
    var step = trick.steps[nmStep];
    var div = document.createElement('div'); div.className = 'magic-step active';
    div.innerHTML = '<h3>' + step.t + '</h3><p>' + step.p + '</p>';
    var inputEl = null;
    if (step.inp) {
      inputEl = document.createElement('input');
      inputEl.type = 'number'; inputEl.className = 'magic-num-input'; inputEl.placeholder = step.inp;
      div.appendChild(inputEl);
    }
    var btn = document.createElement('button'); btn.className = 'play-btn'; btn.textContent = step.btn;
    btn.style.cssText = 'margin-top:1rem;max-width:200px';
    btn.addEventListener('click', function() {
      if (inputEl) {
        var v = parseInt(inputEl.value, 10);
        if (isNaN(v)) { toast('Bir sayi gir!', '#ff6b9d'); return; }
        nmVals.push(v);
      }
      nmStep++;
      if (nmStep >= trick.steps.length) {
        var lastVal = nmVals[nmVals.length-1] || 0;
        var res = trick.reveal(lastVal);
        stepsEl.innerHTML = '';
        var rdiv = document.createElement('div'); rdiv.className = 'magic-step active';
        rdiv.innerHTML = '<div class="magic-big">🔮</div><h3>Sayın...</h3><div class="magic-reveal">🎩 Düşündüğün sayı: <strong>' + res + '</strong>!</div>';
        var rb = document.createElement('button'); rb.className = 'mini-btn'; rb.textContent = 'Farklı Büyü Dene';
        rb.style.marginTop = '1rem';
        rb.addEventListener('click', function(){
          nmStep = 0; nmVals = []; nmTrick = (nmTrick+1) % NM_TRICKS.length; nmGo();
        });
        rdiv.appendChild(rb); stepsEl.appendChild(rdiv);
        prog.innerHTML = '';
        for (var i = 0; i < trick.steps.length; i++) { var d = document.createElement('div'); d.className = 'magic-dot done'; prog.appendChild(d); }
        toast('Aklini okudum!', '#ce93d8');
      } else {
        nmGo();
      }
    });
    div.appendChild(btn); stepsEl.appendChild(div);
  }
  nmGo();
} catch(e){ console.error('NumberMagic error', e); }

/* ══════════════════════════════════════════════════════════
   32. MOVING TARGET GAME
══════════════════════════════════════════════════════════ */
try {
  var tgArena = $('targetArena');
  if (tgArena) {
    var tgScore = 0, tgBest = 0, tgMiss = 0, tgCombo = 0, tgRunning = false, tgSecs = 30;
    var tgTimer = null, tgSpawn = null, tgTargets = [];
    var TG_COLORS = ['#7c4dff','#ff6b9d','#00e5ff','#69f0ae','#ffea00','#ff7043'];
    var TG_ICONS = ['🎯','⭐','💎','🔥','💥','✨'];
    function tgSpawnTarget() {
      if (!tgRunning || tgTargets.length >= 6) return;
      var r = tgArena.getBoundingClientRect();
      var W = r.width || 400, H = r.height || 280;
      var sz = Math.max(30, 52 - Math.floor(tgScore / 5) * 2);
      var x = Math.random() * (W - sz) + sz/2;
      var y = Math.random() * (H - sz) + sz/2;
      var col = TG_COLORS[Math.floor(Math.random() * TG_COLORS.length)];
      var icon = TG_ICONS[Math.floor(Math.random() * TG_ICONS.length)];
      var el = document.createElement('div'); el.className = 'target';
      el.style.cssText = 'width:' + sz + 'px;height:' + sz + 'px;left:' + x + 'px;top:' + y + 'px;background:radial-gradient(circle,'+col+'88,'+col+'22);border:2px solid '+col;
      el.textContent = icon;
      var life = Math.max(700, 2200 - tgScore * 35);
      var obj = {el: el};
      var to = setTimeout(function(){
        if (el.parentNode) el.remove();
        var idx = tgTargets.indexOf(obj); if(idx !== -1) tgTargets.splice(idx, 1);
        if (tgRunning) {
          tgMiss++; tgCombo = 0;
          var me = $('targetMiss'); if(me) me.textContent = tgMiss;
          var ce = $('targetCombo'); if(ce) ce.textContent = '';
        }
      }, life);
      el.addEventListener('click', function() {
        clearTimeout(to); el.remove();
        var idx = tgTargets.indexOf(obj); if(idx !== -1) tgTargets.splice(idx, 1);
        tgCombo++;
        var pts = 10 + (tgCombo > 2 ? tgCombo * 3 : 0);
        tgScore += pts;
        var se = $('targetScore'); if(se) se.textContent = tgScore;
        var ce = $('targetCombo'); if(ce) ce.textContent = tgCombo >= 3 ? 'COMBO x' + tgCombo + '! +' + pts : '';
        var flash = document.createElement('div');
        flash.style.cssText = 'position:absolute;left:'+x+'px;top:'+(y-20)+'px;color:'+col+';font-weight:900;font-size:.9rem;pointer-events:none;transform:translateX(-50%);animation:fadeUp .6s ease forwards;z-index:20';
        flash.textContent = '+' + pts; tgArena.appendChild(flash); setTimeout(function(){flash.remove();}, 600);
      });
      tgTargets.push(obj); tgArena.appendChild(el);
    }
    function tgStart() {
      tgScore = 0; tgMiss = 0; tgCombo = 0; tgSecs = 30; tgRunning = true;
      tgArena.innerHTML = ''; tgTargets = [];
      var se = $('targetScore'); if(se) se.textContent = 0;
      var me = $('targetMiss'); if(me) me.textContent = 0;
      var te = $('targetTimer'); if(te) te.textContent = 30;
      var ce = $('targetCombo'); if(ce) ce.textContent = '';
      var sb = $('targetStart'); if(sb) { sb.disabled = true; sb.textContent = 'Oynuyor...'; }
      tgSpawnTarget();
      tgSpawn = setInterval(function(){ if(tgRunning) tgSpawnTarget(); }, 700);
      tgTimer = setInterval(function(){
        tgSecs--;
        var te2 = $('targetTimer'); if(te2) te2.textContent = tgSecs;
        if (tgSecs <= 0) {
          clearInterval(tgTimer); clearInterval(tgSpawn); tgRunning = false;
          tgArena.innerHTML = ''; tgTargets = [];
          if (tgScore > tgBest) { tgBest = tgScore; var be = $('targetBest'); if(be) be.textContent = tgBest; }
          var sb2 = $('targetStart'); if(sb2) { sb2.disabled = false; sb2.textContent = 'Tekrar Oyna'; }
          toast('Bitti! Skor: ' + tgScore + ' — Iskalama: ' + tgMiss, '#7c4dff');
        }
      }, 1000);
    }
    var tsb = $('targetStart'); if(tsb) tsb.addEventListener('click', function(){ if(!tgRunning) tgStart(); });
  }
} catch(e){ console.error('MovingTarget error', e); }

/* ══════════════════════════════════════════════════════════
   33. DAILY CHALLENGE
══════════════════════════════════════════════════════════ */
try {
  var DC_ALL = [
    {i:'🐍',t:'Snake Oyna',d:'Snake oyununu baslatip 10 puana ulas',pts:20,id:'snake_play'},
    {i:'🃏',t:'Hafıza Tamamla',d:'Tum hafiza kartlarini eslestirir',pts:15,id:'mem_done'},
    {i:'🔐',t:'Mastermind',d:'Mastermind oyununu baslatip deneme yap',pts:25,id:'mm_play'},
    {i:'⚡',t:'Refleks Testi',d:'Refleks testini 5 kez dene',pts:15,id:'reflex5'},
    {i:'🎯',t:'Nisanci',d:'Hareketli Hedef oyununu oyna',pts:20,id:'target_play'},
    {i:'🌍',t:'Gezgin',d:'Dunya Kasfifinde 3 yere tikla',pts:10,id:'world3'},
    {i:'🎱',t:'Kahin',d:'Sihirli Topa 3 soru sor',pts:10,id:'ball3'},
    {i:'🌌',t:'Gozlemci',d:'Yildiz haritasinda kesfet modunu kullan',pts:10,id:'star_use'},
    {i:'🃏',t:'Tarot Oku',d:'Tarot spreadi ac ve bir karti cevir',pts:15,id:'tarot_flip'},
    {i:'🌈',t:'Palet Uret',d:'3 renk paleti uret',pts:10,id:'pal3'}
  ];
  var dcKey = 'ds_daily_' + new Date().toDateString().replace(/ /g, '_');
  var dcStreakKey = 'ds_streak';
  var dcState = null;
  try { dcState = JSON.parse(localStorage.getItem(dcKey)); } catch(e2){}
  if (!dcState) dcState = {done:[]};
  var dcStreak = 0;
  try { dcStreak = parseInt(localStorage.getItem(dcStreakKey) || '0', 10) || 0; } catch(e2){}
  function dcPick() {
    var d = new Date(); var seed = d.getDay() * 13 + d.getDate();
    var picks = [];
    for (var i = 0; i < 5; i++) picks.push(DC_ALL[(seed + i * 7) % DC_ALL.length]);
    return picks;
  }
  var dcToday = dcPick();
  function dcRender() {
    var container = $('dailyChallenges'), totalEl = $('dailyTotal'), streakEl = $('dailyStreak'), dateEl = $('dailyDateLabel');
    if (!container) return;
    container.innerHTML = '';
    var pts = 0, maxPts = 0;
    dcToday.forEach(function(ch) {
      maxPts += ch.pts;
      var isDone = dcState.done.indexOf(ch.id) !== -1;
      if (isDone) pts += ch.pts;
      var div = document.createElement('div'); div.className = 'daily-ch' + (isDone ? ' completed' : '');
      div.innerHTML = '<div class="daily-ch-icon">' + ch.i + '</div><div class="daily-ch-text"><div class="daily-ch-title">' + ch.t + '</div><div class="daily-ch-desc">' + ch.d + '</div></div><div class="daily-ch-pts">+' + ch.pts + '</div><div class="daily-ch-check">' + (isDone ? '✅' : '⬜') + '</div>';
      (function(ch2, was) {
        div.addEventListener('click', function(){
          if (was) return;
          dcState.done.push(ch2.id);
          try { localStorage.setItem(dcKey, JSON.stringify(dcState)); } catch(e2){}
          if (dcState.done.length >= dcToday.length) {
            dcStreak++;
            try { localStorage.setItem(dcStreakKey, String(dcStreak)); } catch(e2){}
            toast('Tum gorevler tamamlandi! ' + dcStreak + ' gun seri!', '#ffea00');
          } else {
            toast(ch2.t + ' tamamlandi! +' + ch2.pts + ' puan', '#69f0ae');
          }
          dcRender();
        });
      })(ch, isDone);
      container.appendChild(div);
    });
    if (totalEl) totalEl.innerHTML = 'Bugunki Puan: <strong>' + pts + ' / ' + maxPts + '</strong> — ' + dcState.done.length + '/' + dcToday.length + ' gorev';
    if (streakEl) streakEl.textContent = dcStreak;
    if (dateEl) dateEl.textContent = new Date().toLocaleDateString('tr-TR', {weekday:'long', day:'numeric', month:'long'});
  }
  dcRender();
} catch(e){ console.error('DailyChallenge error', e); }
