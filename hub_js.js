/* ══════════════════════════════════════════════════════════
   HUB PAGE NAVIGATION SYSTEM
══════════════════════════════════════════════════════════ */
(function() {
  var HUB_CATS = [
    { label: '🎮 Oyunlar', items: [
      {em:'🐍', ttl:'Snake',          dsc:'Klasik yılan oyunu',      id:'games'},
      {em:'🏓', ttl:'Pong',           dsc:'AI rakibine karşı',       id:'pong'},
      {em:'🃏', ttl:'Blackjack',      dsc:"21'i geç",               id:'blackjack'},
      {em:'🎰', ttl:'Slot Makinesi',  dsc:'Şansını dene',            id:'slots'},
      {em:'🔐', ttl:'Mastermind',     dsc:'Şifre kırıcı',           id:'mastermind'},
      {em:'🎯', ttl:'Hareketli Hedef',dsc:'Nişancılık testi',       id:'target'},
      {em:'⚡', ttl:'Speed Clicker',  dsc:'Kaç kez tıklayabilirsin?',id:'clicker'},
      {em:'🎲', ttl:'Zar Toplayıcı',  dsc:"D4'ten D100'e",          id:'dice'},
      {em:'🃏', ttl:'Hafıza Kartları',dsc:'Eşleştirme oyunu',       id:'memory-sec'},
      {em:'🫧', ttl:'Bubble Pop',     dsc:'Balon patlatma',          id:'bubble-sec'},
      {em:'🌍', ttl:'Coğrafya Quiz',  dsc:'Başkentleri bil',         id:'geography'}
    ]},
    { label: '🎨 Yaratıcılık', items: [
      {em:'🎨', ttl:'Pixel Art',      dsc:'Dijital piksel sanatı',   id:'pixelart'},
      {em:'🌊', ttl:'Dalga Tuvali',   dsc:'İnteraktif dalgalar',     id:'ripple'},
      {em:'🖌️', ttl:'Serbest Çizim',  dsc:'Dijital çizim tahtası',   id:'canvas-sec'},
      {em:'🌈', ttl:'Palet Üretici',  dsc:'Renk paletleri',          id:'palette-sec'},
      {em:'🎹', ttl:'Virtual Piano',  dsc:'Piyano çal, müzik yap',   id:'piano'},
      {em:'📖', ttl:'Emoji Hikaye',   dsc:'Emojilerle hikaye yaz',   id:'emojistory'}
    ]},
    { label: '🌍 Keşif & Bilgi', items: [
      {em:'🗺️', ttl:'Dünya Kaşifi',   dsc:"Dünyanın güzel yerleri",  id:'world'},
      {em:'🌌', ttl:'Yıldız Haritası',dsc:'Takımyıldızları keşfet',  id:'stars'},
      {em:'🌙', ttl:'Ay Fazı',        dsc:'Bugünkü ay takvimi',      id:'moonphase'},
      {em:'💡', ttl:'Bilgi Kartları', dsc:'İlginç gerçekler',        id:'facts'}
    ]},
    { label: '🔮 Gizemli & Eğlenceli', items: [
      {em:'🎱', ttl:'Sihirli 8 Top',  dsc:'Geleceğini öğren',        id:'magic8'},
      {em:'🃏', ttl:'Tarot Kartları', dsc:'Geçmiş, şimdi, gelecek',  id:'tarot'},
      {em:'🔮', ttl:'Sayı Büyüsü',    dsc:'Aklındaki sayıyı bilirim',id:'nummagic'},
      {em:'💭', ttl:'Ya Şunu Seçsen?',dsc:'Zor ikilemler',           id:'wyr'}
    ]},
    { label: '🛠️ Araçlar & Kişisel', items: [
      {em:'🔑', ttl:'Şifre Üretici',  dsc:'Güvenli şifreler oluştur',id:'passgen'},
      {em:'📝', ttl:'Sezar Şifresi',  dsc:'Gizli mesajlar şifrele',  id:'cipher'},
      {em:'🎵', ttl:'Ambiyans',       dsc:'Doğa & ortam sesleri',    id:'ambiance'},
      {em:'🌿', ttl:'Nefes Egzersizi',dsc:'Rahatlama ve meditasyon', id:'breathe'},
      {em:'📓', ttl:'Şükran Günlüğü', dsc:'Günlük iyilik notları',   id:'gratitude'},
      {em:'📅', ttl:'Günlük Görev',   dsc:'Hedefler ve seri takibi', id:'daily'}
    ]}
  ];

  // ── Build hub cards ──────────────────────────────────────
  function buildHub() {
    var hubMain = document.getElementById('hubMain');
    if (!hubMain) return;
    HUB_CATS.forEach(function(cat) {
      var lbl = document.createElement('div');
      lbl.className = 'hub-cat';
      lbl.textContent = cat.label;
      hubMain.appendChild(lbl);

      var grid = document.createElement('div');
      grid.className = 'hub-grid';

      cat.items.forEach(function(item) {
        var card = document.createElement('div');
        card.className = 'hub-card';
        card.dataset.search = (item.ttl + ' ' + item.dsc + ' ' + item.em).toLowerCase();
        card.innerHTML =
          '<div class="hc-em">' + item.em + '</div>' +
          '<div class="hc-ttl">' + item.ttl + '</div>' +
          '<div class="hc-dsc">' + item.dsc + '</div>';
        card.addEventListener('click', function() { dsGoToSection(item.id, item.em + ' ' + item.ttl); });
        grid.appendChild(card);
      });

      hubMain.appendChild(grid);
    });
  }

  // ── Navigation functions ──────────────────────────────────
  window.dsGoToSection = function(id, title) {
    var hub = document.getElementById('hubPage');
    if (hub) hub.classList.add('ds-hidden');

    document.querySelectorAll('.ds-section').forEach(function(s) {
      s.classList.remove('ds-active');
    });

    var target = document.getElementById(id);
    if (target) {
      target.classList.add('ds-active');
    }

    document.body.classList.add('ds-in-section');
    document.body.classList.remove('ds-in-hub');

    var titleEl = document.getElementById('navSectionTitle');
    if (titleEl) titleEl.textContent = title || '';

    window.scrollTo(0, 0);
    // Trigger resize so canvases re-size themselves
    setTimeout(function() { window.dispatchEvent(new Event('resize')); }, 100);
  };

  window.dsGoToHub = function() {
    var hub = document.getElementById('hubPage');
    if (hub) hub.classList.remove('ds-hidden');

    document.querySelectorAll('.ds-section').forEach(function(s) {
      s.classList.remove('ds-active');
    });

    document.body.classList.remove('ds-in-section');
    document.body.classList.add('ds-in-hub');

    var titleEl = document.getElementById('navSectionTitle');
    if (titleEl) titleEl.textContent = '';

    window.scrollTo(0, 0);
  };

  // ── Search ───────────────────────────────────────────────
  var hubSearch = document.getElementById('hubSearch');
  if (hubSearch) {
    hubSearch.addEventListener('input', function() {
      var q = hubSearch.value.toLowerCase().trim();
      document.querySelectorAll('.hub-card').forEach(function(card) {
        var match = !q || card.dataset.search.indexOf(q) !== -1;
        card.classList.toggle('ds-hidden', !match);
      });
    });
  }

  // ── ESC to go hub ────────────────────────────────────────
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && document.body.classList.contains('ds-in-section')) {
      dsGoToHub();
    }
  });

  // ── Init ─────────────────────────────────────────────────
  buildHub();
  document.body.classList.add('ds-in-hub');
})();
