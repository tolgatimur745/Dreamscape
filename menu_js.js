

/* ══════════════════════════════════════════════════════════
   MAIN MENU SYSTEM
══════════════════════════════════════════════════════════ */
try {
  var MENU_CATS = [
    { label: '🎮 Oyunlar', items: [
      {em:'🐍',ttl:'Snake',dsc:'Klasik yılan oyunu',id:'games'},
      {em:'🏓',ttl:'Pong',dsc:'AI rakibine karşı',id:'pong'},
      {em:'🃏',ttl:'Blackjack',dsc:'21\'i geç',id:'blackjack'},
      {em:'🎰',ttl:'Slot Makinesi',dsc:'Şansını dene',id:'slots'},
      {em:'🔐',ttl:'Mastermind',dsc:'Şifre kırıcı',id:'mastermind'},
      {em:'🎯',ttl:'Hareketli Hedef',dsc:'Nişancılık testi',id:'target'},
      {em:'⚡',ttl:'Speed Clicker',dsc:'Hız tıklama',id:'clicker'},
      {em:'🎲',ttl:'Zar Toplayıcı',dsc:'D4\'ten D100\'e',id:'dice'},
      {em:'🃏',ttl:'Hafıza Kartları',dsc:'Eşleştirme oyunu',id:'memory-sec'},
      {em:'🫧',ttl:'Bubble Pop',dsc:'Balon patlatma',id:'bubble-sec'},
      {em:'🌍',ttl:'Coğrafya Quiz',dsc:'Başkent bil',id:'geography'}
    ]},
    { label: '🎨 Yaratıcılık', items: [
      {em:'🎨',ttl:'Pixel Art',dsc:'Dijital sanat',id:'pixelart'},
      {em:'🌊',ttl:'Dalgalar',dsc:'İnteraktif tuval',id:'ripple'},
      {em:'🖌️',ttl:'Serbest Çizim',dsc:'Dijital çizim',id:'canvas-sec'},
      {em:'🌈',ttl:'Palet Üretici',dsc:'Renk paletleri',id:'palette-sec'},
      {em:'🎹',ttl:'Virtual Piano',dsc:'Piyano çal',id:'piano'},
      {em:'📖',ttl:'Emoji Hikaye',dsc:'Emoji ile yaz',id:'emojistory'},
      {em:'🌌',ttl:'Yerçekimi Sandboxı',dsc:'Kozmik kütleçekim simülatörü',id:'gravity-sec'},
      {em:'🎛️',ttl:'Yapay Yaşam',dsc:'Lenia otomatı',id:'lenia-sec'}
    ]},
    { label: '🌍 Keşif & Bilgi', items: [
      {em:'🗺️',ttl:'Dünya Kaşifi',dsc:'23 güzel yer',id:'world'},
      {em:'🌌',ttl:'Yıldız Haritası',dsc:'Takımyıldızları',id:'stars'},
      {em:'🌙',ttl:'Ay Takvimi',dsc:'Güncel ay fazı',id:'moonphase'},
      {em:'💡',ttl:'Bilgi Kartları',dsc:'İlginç bilgiler',id:'facts'},
      {em:'🌌',ttl:'Nebula Ansiklopedisi',dsc:'Nebulaları keşfet',id:'nebula-info-sec'},
      {em:'📏',ttl:'Evrenin Ölçeği',dsc:'Ölçek cetveli',id:'universe-scale-sec'},
      {em:'🕳️',ttl:'Kara Delik',dsc:'Kütleçekim alanı',id:'blackhole-sec'},
      {em:'🔮',ttl:'Kimatik Desenler',dsc:'Ses rezonansı',id:'cymatics-sec'}
    ]},
    { label: '🔮 Gizemli & Eğlenceli', items: [
      {em:'🎱',ttl:'Sihirli 8 Top',dsc:'Geleceğini öğren',id:'magic8'},
      {em:'🃏',ttl:'Tarot Kartları',dsc:'Geçmiş & gelecek',id:'tarot'},
      {em:'🔮',ttl:'Sayı Büyüsü',dsc:'Aklını okurum!',id:'nummagic'},
      {em:'💭',ttl:'Ya Şunu Seçsen?',dsc:'Zor ikilemler',id:'wyr'},
      {em:'🌀',ttl:'Kaos Fraktalı',dsc:'Kaos oyunu çizici',id:'chaos-fractal-sec'},
      {em:'🧩',ttl:'Paradokslar Bahçesi',dsc:'Zihinsel paradokslar',id:'paradox-sec'},
      {em:'🌀',ttl:'Kaotik Sarkaç',dsc:'Çift sarkaç sandbox',id:'double-pendulum-sec'},
      {em:'👁️‍🗨️',ttl:'Kuantum Gözlemci',dsc:'Çift yarık deneyi',id:'quantum-sec'},
      {em:'🏛️',ttl:'Filozoflar Arenası',dsc:'Sokratik tartışma',id:'debate-sec'}
    ]},
    { label: '🛠️ Araçlar & Kişisel', items: [
      {em:'🔑',ttl:'Şifre Üretici',dsc:'Güvenli şifreler',id:'passgen'},
      {em:'📝',ttl:'Sezar Şifresi',dsc:'Gizli mesajlar',id:'cipher'},
      {em:'🎵',ttl:'Ambiyans Sesleri',dsc:'Doğa sesleri',id:'ambiance'},
      {em:'🌿',ttl:'Nefes Egzersizi',dsc:'Rahatlama',id:'breathe'},
      {em:'📓',ttl:'Şükran Günlüğü',dsc:'Günlük notlar',id:'gratitude'},
      {em:'🟢',ttl:'Ruh Hali Çemberi',dsc:'Duygusal mandala',id:'aura-sec'},
      {em:'⏱️',ttl:'Odaklanma Saati',dsc:'Zaman & doğa sesleri',id:'zenclock-sec'},
      {em:'📅',ttl:'Günlük Görev',dsc:'Hedefler & seri',id:'daily'},
      {em:'🎡',ttl:'Kozmik Karar Çarkı',dsc:'Çark çevir',id:'wheel-sec'},
      {em:'📊',ttl:'Metin Analizörü',dsc:'Kelime & duygu analiz',id:'text-sec'},
      {em:'📈',ttl:'Bioritim Grafik',dsc:'Zihinsel ritim grafiği',id:'biorhythm-sec'},
      {em:'⏱️',ttl:'Cam Kronometre',dsc:'Süreölçer & zamanlayıcı',id:'stopwatch-sec'},
      {em:'📌',ttl:'Zen Yapışkan Notlar',dsc:'Kalıcı yapışkan notlar',id:'notes-sec'},
      {em:'🪙',ttl:'Kripto Simülatörü',dsc:'Borsa simülasyonu',id:'crypto-sec'},
      {em:'⚖️',ttl:'Beden Kitle Endeksi',dsc:'BKE hesaplayıcı & sağlık',id:'bmi-sec'},
      {em:'🎧',ttl:'İkili İşitsel Ritim',dsc:'Zihinsel sentezleyici',id:'binaural-sec'},
      {em:'💧',ttl:'Zen Su Takipçisi',dsc:'Su tüketim günlüğü',id:'water-sec'},
      {em:'✔️',ttl:'Zen Yapılacaklar',dsc:'İş yapılacaklar listesi',id:'todo-sec'}
    ]}
  ];

  var menuOverlay = document.getElementById('menuOverlay');
  var menuBackBtn = document.getElementById('menuBackBtn');
  var menuContent = document.getElementById('menuContent');
  var menuSearch = document.getElementById('menuSearch');
  var menuHam = document.getElementById('menuHamburger');
  var allMenuCards = [];

  // Build menu cards
  if (menuContent) {
    MENU_CATS.forEach(function(cat) {
      var lbl = document.createElement('div');
      lbl.className = 'menu-cat-label';
      lbl.textContent = cat.label;
      menuContent.appendChild(lbl);

      var grid = document.createElement('div');
      grid.className = 'menu-cards-grid';

      cat.items.forEach(function(item) {
        var card = document.createElement('div');
        card.className = 'menu-card';
        card.dataset.search = (item.ttl + ' ' + item.dsc + ' ' + item.em).toLowerCase();
        card.innerHTML =
          '<div class="menu-card-em">' + item.em + '</div>' +
          '<div class="menu-card-ttl">' + item.ttl + '</div>' +
          '<div class="menu-card-dsc">' + item.dsc + '</div>';

        card.addEventListener('click', function() {
          menu_close();
          var target = document.getElementById(item.id);
          if (target) {
            setTimeout(function() {
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 250);
          }
        });

        allMenuCards.push(card);
        grid.appendChild(card);
      });

      menuContent.appendChild(grid);
    });
  }

  // Search filter
  if (menuSearch) {
    menuSearch.addEventListener('input', function() {
      var q = menuSearch.value.toLowerCase().trim();
      allMenuCards.forEach(function(card) {
        var match = !q || card.dataset.search.indexOf(q) !== -1;
        card.classList.toggle('hidden', !match);
      });
    });
  }

  function menu_open() {
    if (!menuOverlay) return;
    menuOverlay.classList.add('open');
    if (menuHam) menuHam.classList.add('open');
    document.body.style.overflow = 'hidden';
    menuOverlay.scrollTop = 0;
    if (menuSearch) { menuSearch.value = ''; allMenuCards.forEach(function(c){ c.classList.remove('hidden'); }); }
  }

  function menu_close() {
    if (!menuOverlay) return;
    menuOverlay.classList.remove('open');
    if (menuHam) menuHam.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (menuHam) menuHam.addEventListener('click', function() {
    menuOverlay && menuOverlay.classList.contains('open') ? menu_close() : menu_open();
  });
  if (menuBackBtn) menuBackBtn.addEventListener('click', menu_close);

  // Close on ESC
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && menuOverlay && menuOverlay.classList.contains('open')) menu_close();
  });

} catch(e) { console.error('MainMenu error', e); }

/* ══════════════════════════════════════════════════════════
   GEO QUIZ FIX - shuffle now accepts array param
══════════════════════════════════════════════════════════ */
try {
  // Override geo_shuffle to accept a parameter
  if (typeof geo_shuffle_orig === 'undefined') {
    var geo_shuffle_orig = true;
    // Re-define the quiz logic fully
    var GEO_DATA2 = [
      {country:'Fransa',capital:'Paris',flag:'🇫🇷'},{country:'Japonya',capital:'Tokyo',flag:'🇯🇵'},
      {country:'Brezilya',capital:'Brasília',flag:'🇧🇷'},{country:'Avustralya',capital:'Canberra',flag:'🇦🇺'},
      {country:'Kanada',capital:'Ottawa',flag:'🇨🇦'},{country:'Almanya',capital:'Berlin',flag:'🇩🇪'},
      {country:'İtalya',capital:'Roma',flag:'🇮🇹'},{country:'İspanya',capital:'Madrid',flag:'🇪🇸'},
      {country:'Meksika',capital:'Meksiko Şehri',flag:'🇲🇽'},{country:'Hindistan',capital:'Yeni Delhi',flag:'🇮🇳'},
      {country:'Çin',capital:'Pekin',flag:'🇨🇳'},{country:'Rusya',capital:'Moskova',flag:'🇷🇺'},
      {country:'Arjantin',capital:'Buenos Aires',flag:'🇦🇷'},{country:'Güney Afrika',capital:'Cape Town',flag:'🇿🇦'},
      {country:'Mısır',capital:'Kahire',flag:'🇪🇬'},{country:'Türkiye',capital:'Ankara',flag:'🇹🇷'},
      {country:'Hollanda',capital:'Amsterdam',flag:'🇳🇱'},{country:'Portekiz',capital:'Lizbon',flag:'🇵🇹'},
      {country:'Yunanistan',capital:'Atina',flag:'🇬🇷'},{country:'İsveç',capital:'Stockholm',flag:'🇸🇪'},
      {country:'Norveç',capital:'Oslo',flag:'🇳🇴'},{country:'Finlandiya',capital:'Helsinki',flag:'🇫🇮'},
      {country:'İsviçre',capital:'Bern',flag:'🇨🇭'},{country:'Avusturya',capital:'Viyana',flag:'🇦🇹'},
      {country:'Peru',capital:'Lima',flag:'🇵🇪'},{country:'Tayland',capital:'Bangkok',flag:'🇹🇭'},
      {country:'Vietnam',capital:'Hanoi',flag:'🇻🇳'},{country:'Polonya',capital:'Varşova',flag:'🇵🇱'},
      {country:'Arjantin',capital:'Buenos Aires',flag:'🇦🇷'},{country:'Küba',capital:'Havana',flag:'🇨🇺'},
      {country:'Portekiz',capital:'Lizbon',flag:'🇵🇹'},{country:'Fas',capital:'Rabat',flag:'🇲🇦'},
      {country:'Nijerya',capital:'Abuja',flag:'🇳🇬'},{country:'Kenya',capital:'Nairobi',flag:'🇰🇪'},
      {country:'Kolombiya',capital:'Bogota',flag:'🇨🇴'},{country:'Şili',capital:'Santiago',flag:'🇨🇱'},
      {country:'Endonezya',capital:'Cakarta',flag:'🇮🇩'},{country:'Pakistan',capital:'İslamabad',flag:'🇵🇰'},
      {country:'Filipinler',capital:'Manila',flag:'🇵🇭'},{country:'İrlanda',capital:'Dublin',flag:'🇮🇪'}
    ];

    function geo2_shuffle(arr) {
      var a = (arr || GEO_DATA2).slice();
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    }

    var GEO2 = { idx: 0, correct: 0, wrong: 0, streak: 0, started: false, questions: [] };

    function geo2_show() {
      if (!GEO2.started) return;
      var q = GEO2.questions[GEO2.idx % GEO2.questions.length];

      // Get 3 wrong options (different capitals)
      var others = GEO_DATA2.filter(function(d) { return d.capital !== q.capital; });
      others = geo2_shuffle(others).slice(0, 3);

      // Build string array of options
      var opts = [q.capital];
      others.forEach(function(o) { opts.push(o.capital); });
      opts = geo2_shuffle(opts); // shuffle strings

      var flagEl = document.getElementById('geoFlag');
      var qEl = document.getElementById('geoQ');
      var optsEl = document.getElementById('geoOpts');

      if (flagEl) flagEl.textContent = q.flag;
      if (qEl) qEl.textContent = q.country + ' ülkesinin başkenti neresidir?';
      if (!optsEl) return;

      optsEl.innerHTML = '';
      opts.forEach(function(opt) {
        var btn = document.createElement('button');
        btn.className = 'geo-btn';
        btn.textContent = opt; // opt is now always a string

        btn.addEventListener('click', function() {
          optsEl.querySelectorAll('.geo-btn').forEach(function(b) { b.disabled = true; });
          var isCorrect = opt === q.capital;
          btn.classList.add(isCorrect ? 'correct' : 'wrong');

          if (!isCorrect) {
            optsEl.querySelectorAll('.geo-btn').forEach(function(b) {
              if (b.textContent === q.capital) b.classList.add('correct');
            });
          }

          if (isCorrect) { GEO2.correct++; GEO2.streak++; toast('✅ Doğru! ' + q.capital, '#69f0ae'); }
          else { GEO2.wrong++; GEO2.streak = 0; toast('❌ Yanlış! ' + q.capital, '#ff6b9d'); }

          var gc = document.getElementById('geoCorrect');
          var gw = document.getElementById('geoWrong');
          var gs = document.getElementById('geoStreak');
          var pf = document.getElementById('geoProgFill');
          if (gc) gc.textContent = GEO2.correct;
          if (gw) gw.textContent = GEO2.wrong;
          if (gs) gs.textContent = GEO2.streak;
          if (pf) pf.style.width = (GEO2.correct / (GEO2.correct + GEO2.wrong) * 100) + '%';

          GEO2.idx++;
          setTimeout(geo2_show, 1400);
        });

        optsEl.appendChild(btn);
      });
    }

    var geoStartBtn = document.getElementById('geoStart');
    if (geoStartBtn) {
      // Remove old listeners by replacing element
      var newBtn = geoStartBtn.cloneNode(true);
      geoStartBtn.parentNode.replaceChild(newBtn, geoStartBtn);
      newBtn.addEventListener('click', function() {
        GEO2.started = true;
        GEO2.correct = 0; GEO2.wrong = 0; GEO2.streak = 0;
        GEO2.questions = geo2_shuffle(GEO_DATA2);
        GEO2.idx = 0;
        newBtn.textContent = '🔄 Yenile';
        var gc = document.getElementById('geoCorrect');
        var gw = document.getElementById('geoWrong');
        var gs = document.getElementById('geoStreak');
        if (gc) gc.textContent = 0;
        if (gw) gw.textContent = 0;
        if (gs) gs.textContent = 0;
        geo2_show();
      });
    }
  }
} catch(e) { console.error('GeoFix error', e); }

/* ══════════════════════════════════════════════════════════
   BALANCE RESET - Blackjack & Slot
══════════════════════════════════════════════════════════ */
try {
  // Watch blackjack balance and add reset if needed
  var bjResetAdded = false;
  setInterval(function() {
    if (typeof BJ === 'undefined') return;
    var balEl = document.getElementById('bjBalance');
    var resetBtn = document.getElementById('bjReset');
    if (BJ.balance <= 0 && !resetBtn) {
      var row = document.getElementById('bjBetRow');
      if (row && !bjResetAdded) {
        bjResetAdded = true;
        var btn = document.createElement('button');
        btn.className = 'bj-btn deal'; btn.id = 'bjReset';
        btn.style.cssText = 'margin-top:.5rem;background:linear-gradient(135deg,#ff6b9d,#7c4dff)';
        btn.textContent = '💰 Bakiyeyi Yenile (1000)';
        btn.addEventListener('click', function() {
          BJ.balance = 1000; BJ.bet = 50; BJ.wins = 0; BJ.losses = 0; BJ.pushes = 0;
          if (balEl) balEl.textContent = 1000;
          var betEl = document.getElementById('bjBet'); if (betEl) betEl.textContent = 50;
          var wEl = document.getElementById('bjWins'); if (wEl) wEl.textContent = 0;
          var lEl = document.getElementById('bjLosses'); if (lEl) lEl.textContent = 0;
          var pEl = document.getElementById('bjPushes'); if (pEl) pEl.textContent = 0;
          var res = document.getElementById('bjResult'); if (res) { res.textContent = ''; res.className = 'bj-result'; }
          btn.remove(); bjResetAdded = false;
          toast('Bakiye yenilendi! 💰', '#69f0ae');
        });
        row.parentNode.insertBefore(btn, row.nextSibling);
      }
    }
  }, 1000);

  // Watch slot balance
  var slotResetAdded = false;
  setInterval(function() {
    if (typeof SL === 'undefined') return;
    var slotResetBtn = document.getElementById('slotReset');
    if (SL.balance < 10 && !slotResetBtn && !slotResetAdded) {
      slotResetAdded = true;
      var spinBtn = document.getElementById('slotSpin');
      if (spinBtn) {
        var btn = document.createElement('button');
        btn.className = 'slot-pull-btn'; btn.id = 'slotReset';
        btn.style.cssText = 'background:linear-gradient(135deg,#ff6b9d,#7c4dff);margin-top:.5rem';
        btn.textContent = '💰 500 Koin Yükle';
        btn.addEventListener('click', function() {
          SL.balance = 500; SL.wins = 0; SL.jackpots = 0;
          var bEl = document.getElementById('slotBalance'); if (bEl) bEl.textContent = 500;
          var wEl = document.getElementById('slotWins'); if (wEl) wEl.textContent = 0;
          var jEl = document.getElementById('slotJP'); if (jEl) jEl.textContent = 0;
          var res = document.getElementById('slotResult'); if (res) { res.textContent = 'Şansını dene!'; res.className = 'slot-result'; }
          btn.remove(); slotResetAdded = false;
          toast('500 koin yüklendi! 🎰', '#ffea00');
        });
        spinBtn.parentNode.insertBefore(btn, spinBtn.nextSibling);
      }
    }
  }, 1000);
} catch(e) { console.error('BalanceReset error', e); }
