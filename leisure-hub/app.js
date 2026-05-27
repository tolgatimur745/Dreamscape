/* ============================================
   DREAMSCAPE v3 — Full JS Engine (All Fixed)
   ============================================ */

// ─── PARTICLES ────────────────────────────────────────────────────────────
(function () {
  var c = document.getElementById('particleCanvas');
  var cx = c.getContext('2d');
  var W, H, pts = [];
  function resize() { W = c.width = innerWidth; H = c.height = innerHeight; }
  addEventListener('resize', resize); resize();
  for (var i = 0; i < 130; i++) pts.push({
    x: Math.random() * W, y: Math.random() * H,
    r: Math.random() * 1.6 + 0.3,
    vx: (Math.random() - 0.5) * 0.28, vy: (Math.random() - 0.5) * 0.28,
    h: Math.random() * 80 + 215, ph: Math.random() * Math.PI * 2
  });
  (function loop() {
    cx.clearRect(0, 0, W, H);
    pts.forEach(function (p) {
      p.x += p.vx; p.y += p.vy; p.ph += 0.022;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      var a = 0.12 + Math.abs(Math.sin(p.ph)) * 0.42;
      cx.save(); cx.globalAlpha = a;
      cx.fillStyle = 'hsl(' + p.h + ',80%,70%)';
      cx.shadowBlur = 7; cx.shadowColor = 'hsl(' + p.h + ',80%,70%)';
      cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, Math.PI * 2); cx.fill();
      cx.restore();
    });
    requestAnimationFrame(loop);
  })();
})();

// ─── UTILITIES ────────────────────────────────────────────────────────────
var _toast = document.getElementById('toast'), _toastT;
function showToast(msg, col) {
  _toast.textContent = msg;
  _toast.style.background = (col || '#7c4dff') + 'ee';
  _toast.classList.add('show');
  clearTimeout(_toastT);
  _toastT = setTimeout(function () { _toast.classList.remove('show'); }, 2700);
}

// Navbar scroll + clock
var _nav = document.getElementById('navbar'), _nt = document.getElementById('navTime');
addEventListener('scroll', function () { _nav.classList.toggle('scrolled', scrollY > 50); });
function updateNavClock() { _nt.textContent = new Date().toLocaleTimeString('tr-TR'); }
setInterval(updateNavClock, 1000); updateNavClock();

// Session timer
var _sStart = Date.now(), _stEl = document.getElementById('sessionTime');
setInterval(function () {
  _stEl.textContent = '⏱️ Bu oturumda: ' + Math.floor((Date.now() - _sStart) / 60000) + ' dk';
}, 60000);

// Intersection observer (scroll reveal)
var _io = new IntersectionObserver(function (entries) {
  entries.forEach(function (e) { if (e.isIntersecting) e.target.style.animation = 'fadeUp 0.6s ease-out both'; });
}, { threshold: 0.06 });
document.querySelectorAll('.game-card,.sound-card,.clock-card,.tip-card,.quote-card').forEach(function (el) { _io.observe(el); });

// ─── HELPER: draw rounded rect (no roundRect API needed) ──────────────────
function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

// ============================================================
// 🐍 SNAKE — Fully Fixed
// ============================================================
(function () {
  var area = document.getElementById('snakeArea');
  var canvas = document.getElementById('snakeCanvas');
  var ctx = canvas.getContext('2d');
  var overlay = document.getElementById('snakeOverlay');
  var scoreEl = document.getElementById('snakeScore');
  var bestEl = document.getElementById('snakeBest');
  var CELL = 20, cols, rows;
  var snake, dir, nextDir, food, score, best = 0, gameLoop, running = false;

  function setup() {
    var w = area.clientWidth || 280;
    canvas.width = Math.floor(w / CELL) * CELL;
    canvas.height = canvas.width;
    cols = canvas.width / CELL; rows = canvas.height / CELL;
  }

  function init() {
    setup();
    snake = [{ x: Math.floor(cols / 2), y: Math.floor(rows / 2) },
             { x: Math.floor(cols / 2) - 1, y: Math.floor(rows / 2) }];
    dir = { x: 1, y: 0 }; nextDir = { x: 1, y: 0 };
    score = 0; scoreEl.textContent = 0;
    placeFood(); draw();
  }

  function placeFood() {
    var p;
    do { p = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) }; }
    while (snake.some(function (s) { return s.x === p.x && s.y === p.y; }));
    food = p;
  }

  function draw() {
    var W = canvas.width, H = canvas.height;
    ctx.fillStyle = '#07080f'; ctx.fillRect(0, 0, W, H);
    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.02)'; ctx.lineWidth = 0.5;
    for (var x = 0; x <= W; x += CELL) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (var y = 0; y <= H; y += CELL) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    // Food
    ctx.save(); ctx.shadowColor = '#ff6b9d'; ctx.shadowBlur = 18;
    ctx.fillStyle = '#ff6b9d';
    ctx.beginPath(); ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // Snake
    snake.forEach(function (seg, i) {
      var t = i / snake.length;
      var color = i === 0 ? '#7c4dff' : 'hsl(' + (262 + t * 30) + ',68%,' + (62 - t * 14) + '%)';
      ctx.save();
      if (i === 0) { ctx.shadowColor = '#7c4dff'; ctx.shadowBlur = 14; }
      ctx.fillStyle = color;
      var p = i === 0 ? 1 : 2;
      rrect(ctx, seg.x * CELL + p, seg.y * CELL + p, CELL - p * 2, CELL - p * 2, 4);
      ctx.fill();
      ctx.restore();
    });
  }

  function step() {
    dir = nextDir;
    var head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows ||
        snake.some(function (s) { return s.x === head.x && s.y === head.y; })) {
      clearInterval(gameLoop); running = false;
      overlay.innerHTML = '<div class="overlay-icon">💀</div>' +
        '<p style="color:rgba(255,255,255,.7)">Skor: <strong style="color:#7c4dff">' + score + '</strong></p>' +
        '<button class="play-btn" id="snakeRestartBtn">🔄 Tekrar</button>';
      overlay.classList.remove('hidden');
      document.getElementById('snakeRestartBtn').onclick = startGame;
      return;
    }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score++; scoreEl.textContent = score;
      if (score > best) { best = score; bestEl.textContent = best; }
      placeFood();
    } else { snake.pop(); }
    draw();
  }

  function startGame() {
    init(); overlay.classList.add('hidden');
    clearInterval(gameLoop); running = true;
    gameLoop = setInterval(step, Math.max(75, 155 - score * 2));
  }

  document.addEventListener('keydown', function (e) {
    if (!running) return;
    var map = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
    var mv = map[e.key];
    if (mv && !(mv[0] === -dir.x && mv[1] === -dir.y)) {
      nextDir = { x: mv[0], y: mv[1] };
      e.preventDefault();
    }
  });

  document.getElementById('snakeStartBtn').onclick = startGame;
  setTimeout(init, 50);
})();

// ============================================================
// 🃏 MEMORY CARDS — Fully Fixed
// ============================================================
(function () {
  var grid = document.getElementById('memoryGrid');
  var movesEl = document.getElementById('memoryMoves');
  var matchesEl = document.getElementById('memoryMatches');
  var EMOJIS = ['🌸', '🦋', '🌈', '⭐', '🎵', '🍭', '🦄', '🌙'];
  var flipped = [], matched = 0, moves = 0, locked = false;

  function shuffle(a) { return a.slice().sort(function () { return Math.random() - 0.5; }); }

  function build() {
    var deck = shuffle(EMOJIS.concat(EMOJIS));
    grid.innerHTML = ''; flipped = []; matched = 0; moves = 0;
    movesEl.textContent = 0; matchesEl.textContent = 0;
    deck.forEach(function (emoji) {
      var card = document.createElement('div');
      card.className = 'memory-card';
      card.dataset.val = emoji;
      card.innerHTML = '<div class="card-back">✦</div><div class="card-front">' + emoji + '</div>';
      card.addEventListener('click', function () { flip(card); });
      grid.appendChild(card);
    });
  }

  function flip(card) {
    if (locked || card.classList.contains('flipped') || card.classList.contains('matched')) return;
    card.classList.add('flipped');
    flipped.push(card);
    if (flipped.length === 2) {
      locked = true; moves++; movesEl.textContent = moves;
      var a = flipped[0], b = flipped[1];
      if (a.dataset.val === b.dataset.val) {
        a.classList.add('matched'); b.classList.add('matched');
        matched++; matchesEl.textContent = matched;
        flipped = []; locked = false;
        if (matched === EMOJIS.length) setTimeout(function () { showToast('🎉 Tebrikler! ' + moves + ' hamlede!', '#69f0ae'); }, 200);
      } else {
        setTimeout(function () {
          a.classList.remove('flipped'); b.classList.remove('flipped');
          flipped = []; locked = false;
        }, 900);
      }
    }
  }

  document.getElementById('resetMemory').addEventListener('click', build);
  build();
})();

// ============================================================
// 🫧 BUBBLE POP — Fixed
// ============================================================
(function () {
  var arena = document.getElementById('bubbleArena');
  var cntEl = document.getElementById('bubbleCount');
  var scEl = document.getElementById('bubbleScore');
  var popped = 0, totalScore = 0;
  var icons = ['🌸', '⭐', '💎', '🎈', '🌈', '✨', '🦋', '🎵', '💫', '🍀', '🌺', '💜'];
  var pals = [
    'rgba(124,77,255,.8)', 'rgba(255,107,157,.8)', 'rgba(0,229,255,.8)',
    'rgba(105,240,174,.8)', 'rgba(255,234,0,.8)', 'rgba(255,112,67,.8)'
  ];
  var glows = [
    'rgba(124,77,255,.4)', 'rgba(255,107,157,.4)', 'rgba(0,229,255,.4)',
    'rgba(105,240,174,.4)', 'rgba(255,234,0,.4)', 'rgba(255,112,67,.4)'
  ];

  function makeBubble() {
    var sz = Math.random() * 36 + 32;
    var pi = Math.floor(Math.random() * pals.length);
    var dur = (Math.random() * 3 + 3).toFixed(1);
    var del = (Math.random() * 2).toFixed(1);
    var left = Math.random() * 80 + 2;
    var top = Math.random() * 60 + 8;
    var pts = Math.max(10, Math.round(75 - sz));
    var b = document.createElement('div');
    b.className = 'bubble';
    b.style.cssText = [
      'width:' + sz + 'px', 'height:' + sz + 'px',
      'left:' + left + '%', 'top:' + top + '%',
      'font-size:' + Math.round(sz * 0.37) + 'px',
      'background:radial-gradient(circle at 30% 30%,rgba(255,255,255,.55) 0%,' + pals[pi] + ' 60%)',
      'box-shadow:inset -3px -3px 6px rgba(0,0,0,.15),0 0 14px ' + glows[pi],
      '--bd:' + dur + 's', '--bdd:' + del + 's', 'z-index:2'
    ].join(';');
    b.textContent = icons[Math.floor(Math.random() * icons.length)];
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      if (b.dataset.popping) return;
      b.dataset.popping = '1';
      b.style.animation = 'bpop 0.22s ease forwards';
      popped++; totalScore += pts;
      cntEl.textContent = popped; scEl.textContent = totalScore;
      setTimeout(function () {
        b.remove();
        if (arena.querySelectorAll('.bubble').length < 5) addBatch(4);
      }, 220);
    });
    return b;
  }

  function addBatch(n) {
    n = n || 5;
    for (var i = 0; i < n; i++) {
      (function (delay) { setTimeout(function () { arena.appendChild(makeBubble()); }, delay); })(i * 80);
    }
  }

  document.getElementById('addBubbles').addEventListener('click', function () { addBatch(5); });
  addBatch(8);
})();

// ============================================================
// ⚡ REACTION TIME — Fixed State Machine
// ============================================================
(function () {
  var circle = document.getElementById('reactionCircle');
  var text = document.getElementById('reactionText');
  var rtLast = document.getElementById('rtLast');
  var rtBest = document.getElementById('rtBest');
  var rtAvg = document.getElementById('rtAvg');
  var state = 'idle', t0, timer, results = [];

  function setState(s) {
    state = s;
    circle.className = 'reaction-circle' + (s === 'waiting' || s === 'go' ? ' ' + s : '');
    if (s === 'idle') text.textContent = 'Tıkla!';
    else if (s === 'waiting') text.textContent = 'Bekle...';
    else if (s === 'go') text.textContent = 'TIKLA!';
  }

  circle.addEventListener('click', function () {
    if (state === 'idle') {
      setState('waiting');
      timer = setTimeout(function () { setState('go'); t0 = Date.now(); }, 1600 + Math.random() * 2800);
    } else if (state === 'waiting') {
      clearTimeout(timer);
      setState('idle');
      showToast('😅 Çok erken! Bekle!', '#ff6b9d');
    } else if (state === 'go') {
      var rt = Date.now() - t0;
      results.push(rt);
      rtLast.textContent = rt + 'ms';
      rtBest.textContent = Math.min.apply(null, results) + 'ms';
      rtAvg.textContent = Math.round(results.reduce(function (a, b) { return a + b; }, 0) / results.length) + 'ms';
      setState('idle');
      var msg = rt < 180 ? '🚀 İnanılmaz! ' + rt + 'ms' : rt < 280 ? '⚡ Harika! ' + rt + 'ms' : '🎯 ' + rt + 'ms';
      showToast(msg, rt < 280 ? '#69f0ae' : '#7c4dff');
    }
  });

  setState('idle');
})();

// ============================================================
// 🎨 COLOR MATCH — Fixed (no custom events)
// ============================================================
(function () {
  var targetEl = document.getElementById('colorTarget');
  var optsEl = document.getElementById('colorOptions');
  var scoreEl = document.getElementById('colorScore');
  var livesEl = document.getElementById('colorLives');

  var COLORS = [
    { name: 'Mor', hex: '#7c4dff' }, { name: 'Pembe', hex: '#ff6b9d' },
    { name: 'Camgöbeği', hex: '#00e5ff' }, { name: 'Nane Yeşili', hex: '#69f0ae' },
    { name: 'Altın Sarısı', hex: '#ffea00' }, { name: 'Turuncu', hex: '#ff7043' },
    { name: 'Lavanta', hex: '#ce93d8' }, { name: 'Amber', hex: '#ffca28' },
    { name: 'Kırmızı', hex: '#ef5350' }, { name: 'Teal', hex: '#26a69a' },
    { name: 'İndigo', hex: '#5c6bc0' }, { name: 'Mercan', hex: '#ff7675' },
    { name: 'Lime', hex: '#c6ef00' }, { name: 'Gül', hex: '#f48fb1' }
  ];

  var score = 0, lives = 3, correct, locked = false;
  function sh(a) { return a.slice().sort(function () { return Math.random() - 0.5; }); }

  function resetGame() {
    score = 0; lives = 3; locked = false;
    scoreEl.textContent = 0; livesEl.textContent = '❤️❤️❤️';
    newRound();
  }

  function newRound() {
    if (lives <= 0) { showGameOver(); return; }
    locked = false;
    var pool = sh(COLORS);
    correct = pool[0];
    var choices = sh(pool.slice(0, 4));
    targetEl.style.background = correct.hex;
    targetEl.style.boxShadow = '0 0 20px ' + correct.hex + '88';
    optsEl.innerHTML = '';
    choices.forEach(function (c) {
      var btn = document.createElement('button');
      btn.className = 'color-opt-btn';
      btn.textContent = c.name;
      btn.addEventListener('click', function () {
        if (locked) return;
        locked = true;
        if (c.hex === correct.hex) {
          btn.classList.add('correct');
          score++; scoreEl.textContent = score;
          showToast('✅ Doğru! +1', '#69f0ae');
          setTimeout(newRound, 1000);
        } else {
          btn.classList.add('wrong');
          optsEl.querySelectorAll('.color-opt-btn').forEach(function (b) {
            if (b.textContent === correct.name) b.classList.add('correct');
          });
          lives--; livesEl.textContent = '❤️'.repeat(Math.max(0, lives));
          showToast('❌ Cevap: ' + correct.name, '#ff6b9d');
          setTimeout(newRound, 1300);
        }
      });
      optsEl.appendChild(btn);
    });
  }

  function showGameOver() {
    optsEl.innerHTML = '';
    var d = document.createElement('div');
    d.style.cssText = 'grid-column:1/-1;text-align:center;padding:.5rem';
    d.innerHTML = '<p style="font-size:1.5rem;margin-bottom:.5rem">🎯</p>' +
      '<p>Oyun bitti! Skor: <strong style="color:var(--a3)">' + score + '</strong></p>';
    var btn = document.createElement('button');
    btn.className = 'play-btn';
    btn.textContent = '🔄 Tekrar';
    btn.style.marginTop = '.7rem';
    btn.onclick = resetGame;
    d.appendChild(btn);
    optsEl.appendChild(d);
  }

  resetGame();
})();

// ============================================================
// 🧩 15 PUZZLE — Fixed Solvability
// ============================================================
(function () {
  var grid = document.getElementById('puzzleGrid');
  var movesEl = document.getElementById('puzzleMoves');
  var SIZE = 4, tiles = [], moves = 0;

  function isSolved() { return tiles.every(function (t, i) { return t === (i + 1) % 16; }); }

  function countInversions(arr) {
    var inv = 0;
    for (var i = 0; i < arr.length - 1; i++)
      for (var j = i + 1; j < arr.length; j++)
        if (arr[i] && arr[j] && arr[i] > arr[j]) inv++;
    return inv;
  }

  function isSolvable(arr) {
    var inv = countInversions(arr);
    var blankRow = SIZE - Math.floor(arr.indexOf(0) / SIZE);
    return (inv + blankRow) % 2 === 0;
  }

  function shuffle() {
    var arr;
    do {
      arr = [];
      for (var n = 0; n < 16; n++) arr.push(n);
      for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
      }
    } while (!isSolvable(arr) || isSolved.call({ tiles: arr }));
    return arr;
  }

  // Custom isSolved for arbitrary tiles array
  function checkSolved(arr) { return arr.every(function (t, i) { return t === (i + 1) % 16; }); }

  function init() {
    do {
      tiles = [];
      for (var n = 0; n < 16; n++) tiles.push(n);
      for (var i = tiles.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = tiles[i]; tiles[i] = tiles[j]; tiles[j] = tmp;
      }
    } while (!isSolvable(tiles) || checkSolved(tiles));
    moves = 0; movesEl.textContent = 0;
    render();
  }

  function render() {
    grid.innerHTML = '';
    tiles.forEach(function (n, i) {
      var t = document.createElement('div');
      t.className = 'puzzle-tile' + (n === 0 ? ' empty' : '');
      if (n !== 0) {
        t.textContent = n;
        var h = 230 + (n / 16) * 80;
        t.style.background = 'linear-gradient(135deg,hsl(' + h + ',70%,48%),hsl(' + (h + 22) + ',70%,60%))';
        t.style.color = '#fff';
      }
      t.addEventListener('click', function () { move(i); });
      grid.appendChild(t);
    });
  }

  function move(idx) {
    var ei = tiles.indexOf(0);
    var r = Math.floor(idx / SIZE), c = idx % SIZE;
    var er = Math.floor(ei / SIZE), ec = ei % SIZE;
    if (Math.abs(r - er) + Math.abs(c - ec) !== 1) return;
    var tmp = tiles[idx]; tiles[idx] = tiles[ei]; tiles[ei] = tmp;
    moves++; movesEl.textContent = moves;
    render();
    if (checkSolved(tiles)) setTimeout(function () { showToast('🎉 ' + moves + ' hamlede çözdün!', '#69f0ae'); }, 80);
  }

  document.getElementById('resetPuzzle').addEventListener('click', init);
  init();
})();

// ============================================================
// 🐹 WHACK-A-MOLE — Fixed CSS & Logic
// ============================================================
(function () {
  var scoreEl = document.getElementById('moleScore');
  var timeEl = document.getElementById('moleTime');
  var startBtn = document.getElementById('moleStartBtn');
  var moles = [];
  for (var mi = 0; mi < 9; mi++) moles.push(document.getElementById('mole' + mi));
  var holes = document.querySelectorAll('.mole-hole');
  var ICONS = ['🐹', '🦔', '🐭', '🐱'];
  var score, timeLeft, running, moleTimer, countTimer, active;

  function getDelay() { return Math.max(550, 1300 - score * 25); }

  function popOne() {
    if (!running) return;
    var avail = [];
    for (var i = 0; i < 9; i++) { if (!active[i]) avail.push(i); }
    if (avail.length === 0) return;
    var idx = avail[Math.floor(Math.random() * avail.length)];
    active[idx] = true;
    moles[idx].textContent = ICONS[Math.floor(Math.random() * ICONS.length)];
    moles[idx].classList.add('up');
    var dur = getDelay();
    setTimeout(function () {
      if (moles[idx].classList.contains('up') && !moles[idx].classList.contains('hit')) {
        moles[idx].classList.remove('up');
        moles[idx].textContent = '';
        active[idx] = false;
      }
    }, dur);
  }

  function startGame() {
    score = 0; timeLeft = 30; active = {};
    scoreEl.textContent = 0; timeEl.textContent = 30;
    running = true; startBtn.disabled = true; startBtn.textContent = '⏸ Oynuyor...';
    moles.forEach(function (m) { m.classList.remove('up', 'hit'); m.textContent = ''; });

    var popInterval = Math.max(600, 1000 - score * 5);
    moleTimer = setInterval(function () {
      if (!running) return;
      var n = Math.min(3, 1 + Math.floor(score / 8));
      for (var i = 0; i < n; i++) setTimeout(popOne, i * 150);
    }, 800);

    countTimer = setInterval(function () {
      timeLeft--;
      timeEl.textContent = timeLeft;
      if (timeLeft <= 0) endGame();
    }, 1000);
  }

  function endGame() {
    running = false;
    clearInterval(moleTimer); clearInterval(countTimer);
    moles.forEach(function (m) { m.classList.remove('up', 'hit'); m.textContent = ''; });
    active = {};
    startBtn.disabled = false; startBtn.textContent = '▶ Tekrar';
    showToast('🐹 Bitti! Skor: ' + score, '#ffea00');
  }

  holes.forEach(function (hole, idx) {
    hole.addEventListener('click', function () {
      if (!running || !active[idx] || moles[idx].classList.contains('hit')) return;
      score++;
      scoreEl.textContent = score;
      moles[idx].classList.add('hit');
      moles[idx].textContent = '💥';
      setTimeout(function () {
        moles[idx].classList.remove('up', 'hit');
        moles[idx].textContent = '';
        active[idx] = false;
      }, 280);
    });
  });

  startBtn.addEventListener('click', function () { if (!running) startGame(); });
})();

// ============================================================
// ❌ TIC TAC TOE vs AI — Fixed with aiThinking flag
// ============================================================
(function () {
  var cells = Array.from(document.querySelectorAll('.ttt-cell'));
  var statusEl = document.getElementById('tttStatus');
  var wEl = document.getElementById('tttWin');
  var dEl = document.getElementById('tttDraw');
  var lEl = document.getElementById('tttLose');
  var resetBtn = document.getElementById('tttReset');

  var WINS = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  var board, playerTurn, aiThinking, gameOver, sc = { w: 0, d: 0, l: 0 };

  function winner(b) {
    for (var i = 0; i < WINS.length; i++) {
      var line = WINS[i];
      if (b[line[0]] && b[line[0]] === b[line[1]] && b[line[1]] === b[line[2]]) return b[line[0]];
    }
    return b.every(Boolean) ? 'draw' : null;
  }

  function minimax(b, isAI, alpha, beta) {
    var w = winner(b);
    if (w === 'X') return 10;
    if (w === 'O') return -10;
    if (w === 'draw') return 0;
    var best = isAI ? -Infinity : Infinity;
    for (var i = 0; i < 9; i++) {
      if (!b[i]) {
        b[i] = isAI ? 'X' : 'O';
        var val = minimax(b, !isAI, alpha, beta);
        b[i] = null;
        if (isAI) { best = Math.max(best, val); alpha = Math.max(alpha, val); }
        else { best = Math.min(best, val); beta = Math.min(beta, val); }
        if (beta <= alpha) break;
      }
    }
    return best;
  }

  function aiMove() {
    var bestVal = -Infinity, bestMove = -1;
    for (var i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'X';
        var val = minimax(board, false, -Infinity, Infinity);
        board[i] = null;
        if (val > bestVal) { bestVal = val; bestMove = i; }
      }
    }
    if (bestMove !== -1) {
      board[bestMove] = 'X';
      cells[bestMove].textContent = '❌';
      cells[bestMove].dataset.taken = '1';
      checkResult();
    }
    aiThinking = false;
    if (!gameOver) { playerTurn = true; statusEl.textContent = 'Senin sıran ⭕'; }
  }

  function checkResult() {
    var w = winner(board);
    if (!w) return false;
    gameOver = true;
    if (w === 'draw') {
      statusEl.textContent = '🤝 Berabere!'; sc.d++; dEl.textContent = sc.d;
      showToast('🤝 Berabere!', '#00e5ff');
    } else if (w === 'O') {
      statusEl.textContent = '🎉 Kazandın!'; sc.w++; wEl.textContent = sc.w;
      highlightWin('O'); showToast('🎉 Kazandın!', '#69f0ae');
    } else {
      statusEl.textContent = '🤖 AI kazandı!'; sc.l++; lEl.textContent = sc.l;
      highlightWin('X'); showToast('🤖 AI kazandı!', '#ff6b9d');
    }
    return true;
  }

  function highlightWin(p) {
    WINS.forEach(function (line) {
      if (board[line[0]] === p && board[line[1]] === p && board[line[2]] === p)
        line.forEach(function (i) { cells[i].classList.add('win-cell'); });
    });
  }

  function newGame() {
    board = Array(9).fill(null); playerTurn = true; aiThinking = false; gameOver = false;
    cells.forEach(function (c) { c.textContent = ''; c.classList.remove('win-cell'); delete c.dataset.taken; });
    statusEl.textContent = 'Sen ⭕ · AI ❌';
  }

  cells.forEach(function (cell, i) {
    cell.addEventListener('click', function () {
      if (!playerTurn || aiThinking || gameOver || board[i]) return;
      board[i] = 'O'; cell.textContent = '⭕'; cell.dataset.taken = '1';
      playerTurn = false;
      if (!checkResult()) {
        aiThinking = true; statusEl.textContent = '🤖 AI düşünüyor...';
        setTimeout(aiMove, 380);
      }
    });
  });

  resetBtn.addEventListener('click', newGame);
  newGame();
})();

// ============================================================
// 📝 WORD SCRAMBLE — Fixed
// ============================================================
(function () {
  var WORDS = [
    { word: 'GÜNEŞ', hint: 'Gökyüzündeki enerji kaynağı', cat: '🌿 Doğa' },
    { word: 'OKYANUS', hint: 'En büyük su kütlesi', cat: '🌊 Doğa' },
    { word: 'YILDIZ', hint: 'Geceleri parlayan gök cismi', cat: '🚀 Uzay' },
    { word: 'ROBOT', hint: 'Otomatik çalışan makine', cat: '🤖 Teknoloji' },
    { word: 'BULUT', hint: 'Su damlacıklarından oluşur', cat: '⛅ Doğa' },
    { word: 'KITAP', hint: 'Bilgi içeren basılı eser', cat: '📚 Kültür' },
    { word: 'BALIK', hint: 'Suda yaşayan canlı', cat: '🐾 Hayvan' },
    { word: 'ÇIÇEK', hint: 'Bitkinin renkli organı', cat: '🌸 Doğa' },
    { word: 'PIANO', hint: 'Tuşlu çalgı aleti', cat: '🎵 Müzik' },
    { word: 'ARABA', hint: 'Dört tekerlekli taşıt', cat: '🚗 Ulaşım' },
    { word: 'KELEBEK', hint: 'Renkli kanatlı böcek', cat: '🦋 Hayvan' },
    { word: 'AHTAPOT', hint: '8 kollu deniz canlısı', cat: '🐙 Hayvan' },
    { word: 'FENER', hint: 'Işık veren taşınabilir alet', cat: '💡 Genel' },
    { word: 'KALEM', hint: 'Yazmaya yarayan araç', cat: '✏️ Genel' },
    { word: 'ATEŞ', hint: 'Yanma sonucu çıkan ışık ve ısı', cat: '🔥 Doğa' },
    { word: 'DENIZ', hint: 'Büyük tuzlu su kütlesi', cat: '🌊 Doğa' },
    { word: 'ORMAN', hint: 'Ağaçlarla dolu bölge', cat: '🌲 Doğa' },
    { word: 'MÜZIK', hint: 'Kulağa hoş gelen ses sanatı', cat: '🎵 Sanat' },
    { word: 'RÜZGAR', hint: 'Hareket eden hava kütlesi', cat: '💨 Doğa' },
    { word: 'KÖPEK', hint: 'İnsanın en sadık dostu', cat: '🐾 Hayvan' }
  ];

  var scrambledEl = document.getElementById('scrambledWord');
  var inputEl = document.getElementById('wordInput');
  var catEl = document.getElementById('wordCategory');
  var hintEl = document.getElementById('wordHint');
  var scoreEl = document.getElementById('wordScore');
  var correctEl = document.getElementById('wordCorrect');
  var wrongEl = document.getElementById('wordWrong');

  var words = WORDS.slice().sort(function () { return Math.random() - 0.5; });
  var idx = 0, score = 0, correct = 0, wrong = 0;

  function scramble(word) {
    var arr = word.split('');
    var tries = 0;
    do {
      for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
      }
      tries++;
    } while (arr.join('') === word && tries < 20);
    return arr;
  }

  function showWord() {
    var w = words[idx];
    catEl.textContent = w.cat;
    hintEl.textContent = '— ' + w.hint;
    inputEl.value = '';
    inputEl.className = 'word-input';
    scrambledEl.innerHTML = '';
    scramble(w.word).forEach(function (ch, i) {
      var span = document.createElement('span');
      span.className = 's-letter';
      span.textContent = ch;
      span.style.animationDelay = (i * 0.05) + 's';
      scrambledEl.appendChild(span);
    });
    inputEl.focus();
  }

  function check() {
    var answer = inputEl.value.trim().toUpperCase().replace(/İ/g, 'İ').replace(/ı/g, 'I');
    if (!answer) return;
    var target = words[idx].word;
    if (answer === target) {
      correct++; score += 10;
      correctEl.textContent = correct; scoreEl.textContent = score;
      inputEl.className = 'word-input correct';
      showToast('✅ Doğru! +10', '#69f0ae');
      setTimeout(function () { idx = (idx + 1) % words.length; showWord(); }, 800);
    } else {
      wrong++; wrongEl.textContent = wrong;
      inputEl.className = 'word-input wrong';
      showToast('❌ Yanlış! Cevap: ' + target, '#ff6b9d');
      setTimeout(function () {
        inputEl.className = 'word-input';
        inputEl.value = '';
        inputEl.focus();
      }, 1000);
    }
  }

  document.getElementById('wordCheck').addEventListener('click', check);
  document.getElementById('wordSkip').addEventListener('click', function () {
    showToast('⏭ Cevap: ' + words[idx].word, '#ffea00');
    setTimeout(function () { idx = (idx + 1) % words.length; showWord(); }, 900);
  });
  document.getElementById('wordHintBtn').addEventListener('click', function () {
    var w = words[idx].word;
    showToast('💡 İlk 2 harf: "' + w.slice(0, 2) + '", ' + w.length + ' harf', '#00e5ff');
  });
  inputEl.addEventListener('keydown', function (e) { if (e.key === 'Enter') check(); });

  showWord();
})();

// ============================================================
// 🧠 SIMON SAYS — New Game
// ============================================================
(function () {
  var COLORS = ['simonRed', 'simonBlue', 'simonYellow', 'simonGreen'];
  var btns = {};
  COLORS.forEach(function (id) { btns[id] = document.getElementById(id); });
  var levelEl = document.getElementById('simonLevel');
  var bestEl = document.getElementById('simonBest');
  var startBtn = document.getElementById('simonStart');

  var sequence = [], playerSeq, level = 0, best = 0, playing = false;

  function flash(id, cb) {
    var btn = btns[id];
    btn.classList.add('lit');
    setTimeout(function () { btn.classList.remove('lit'); if (cb) setTimeout(cb, 200); }, 500);
  }

  function playSequence(i) {
    i = i || 0;
    if (i >= sequence.length) {
      playing = false; playerSeq = [];
      COLORS.forEach(function (id) { btns[id].disabled = false; });
      return;
    }
    COLORS.forEach(function (id) { btns[id].disabled = true; });
    setTimeout(function () { flash(sequence[i], function () { playSequence(i + 1); }); }, 100);
  }

  function nextLevel() {
    level++;
    levelEl.textContent = level;
    if (level > best) { best = level; bestEl.textContent = best; }
    sequence.push(COLORS[Math.floor(Math.random() * 4)]);
    playing = true;
    setTimeout(playSequence, 600);
  }

  function gameOver() {
    playing = false; level = 0; sequence = [];
    COLORS.forEach(function (id) { btns[id].disabled = false; });
    startBtn.disabled = false; startBtn.textContent = '▶ Tekrar';
    levelEl.textContent = 0;
    showToast('💔 Hata! ' + (level - 1) + '. seviyeye ulaştın', '#ff6b9d');
  }

  COLORS.forEach(function (id, ci) {
    btns[id].addEventListener('click', function () {
      if (playing || btns[id].disabled) return;
      flash(id);
      playerSeq.push(id);
      var pos = playerSeq.length - 1;
      if (playerSeq[pos] !== sequence[pos]) {
        gameOver(); return;
      }
      if (playerSeq.length === sequence.length) {
        showToast('✅ Seviye ' + level + ' geçildi!', '#69f0ae');
        setTimeout(nextLevel, 800);
      }
    });
  });

  startBtn.addEventListener('click', function () {
    if (playing) return;
    sequence = []; level = 0; levelEl.textContent = 0;
    startBtn.disabled = true; startBtn.textContent = '🧠 Oynuyor...';
    COLORS.forEach(function (id) { btns[id].disabled = true; });
    setTimeout(nextLevel, 400);
  });
})();

// ============================================================
// 🔢 MATH SPRINT — New Game
// ============================================================
(function () {
  var problemEl = document.getElementById('mathProblem');
  var inputEl = document.getElementById('mathInput');
  var correctEl = document.getElementById('mathCorrect');
  var wrongEl = document.getElementById('mathWrong');
  var scoreEl = document.getElementById('mathScore');
  var fillEl = document.getElementById('mathTimerFill');
  var startBtn = document.getElementById('mathStart');

  var correct = 0, wrong = 0, score = 0, running = false, timer, timeLeft = 60;
  var a, b, op, answer;

  function newProblem() {
    var ops = ['+', '-', '×'];
    op = ops[Math.floor(Math.random() * ops.length)];
    if (op === '+') { a = Math.floor(Math.random() * 50) + 1; b = Math.floor(Math.random() * 50) + 1; answer = a + b; }
    else if (op === '-') { a = Math.floor(Math.random() * 50) + 20; b = Math.floor(Math.random() * a); answer = a - b; }
    else { a = Math.floor(Math.random() * 12) + 1; b = Math.floor(Math.random() * 12) + 1; answer = a * b; }
    problemEl.textContent = a + ' ' + op + ' ' + b + ' = ?';
    inputEl.value = ''; inputEl.focus();
  }

  function checkAnswer() {
    if (!running) return;
    var val = parseInt(inputEl.value, 10);
    if (isNaN(val)) return;
    if (val === answer) {
      correct++; score += 10;
      correctEl.textContent = correct; scoreEl.textContent = score;
      problemEl.style.color = 'var(--a4)';
    } else {
      wrong++; score = Math.max(0, score - 2);
      wrongEl.textContent = wrong; scoreEl.textContent = score;
      problemEl.style.color = 'var(--a2)';
    }
    setTimeout(function () { problemEl.style.color = 'var(--tx)'; newProblem(); }, 300);
  }

  function startGame() {
    correct = 0; wrong = 0; score = 0; timeLeft = 60;
    correctEl.textContent = 0; wrongEl.textContent = 0; scoreEl.textContent = 0;
    fillEl.style.width = '100%'; fillEl.style.transition = 'none';
    running = true; startBtn.disabled = true; startBtn.textContent = '⏱ Oynuyor...';
    inputEl.disabled = false;
    newProblem();
    setTimeout(function () { fillEl.style.transition = 'width 60s linear'; fillEl.style.width = '0%'; }, 50);
    timer = setInterval(function () {
      timeLeft--;
      if (timeLeft <= 0) {
        clearInterval(timer); running = false;
        inputEl.disabled = true;
        startBtn.disabled = false; startBtn.textContent = '▶ Tekrar';
        problemEl.textContent = 'Bitti!';
        fillEl.style.width = '0%';
        showToast('🏁 Bitti! Skor: ' + score + ' | ' + correct + ' doğru', '#69f0ae');
      }
    }, 1000);
  }

  inputEl.addEventListener('keydown', function (e) { if (e.key === 'Enter') checkAnswer(); });
  startBtn.addEventListener('click', function () { if (!running) startGame(); });
})();

// ============================================================
// ✊ ROCK PAPER SCISSORS — New Game
// ============================================================
(function () {
  var playerEl = document.getElementById('rpsPlayer');
  var aiEl = document.getElementById('rpsAI');
  var resultEl = document.getElementById('rpsResult');
  var winEl = document.getElementById('rpsWin');
  var drawEl = document.getElementById('rpsDraw');
  var loseEl = document.getElementById('rpsLose');

  var ICONS = { rock: '✊', paper: '✋', scissors: '✌️' };
  var CHOICES = ['rock', 'paper', 'scissors'];
  var wins = 0, draws = 0, losses = 0;

  function beats(a, b) {
    return (a === 'rock' && b === 'scissors') ||
           (a === 'scissors' && b === 'paper') ||
           (a === 'paper' && b === 'rock');
  }

  document.querySelectorAll('.rps-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var player = btn.dataset.choice;
      var ai = CHOICES[Math.floor(Math.random() * 3)];
      playerEl.textContent = ICONS[player];
      aiEl.textContent = ICONS[ai];
      playerEl.classList.add('anim'); aiEl.classList.add('anim');
      setTimeout(function () { playerEl.classList.remove('anim'); aiEl.classList.remove('anim'); }, 400);
      resultEl.className = 'rps-result';
      if (player === ai) {
        resultEl.textContent = '🤝 Berabere!'; resultEl.classList.add('draw');
        draws++; drawEl.textContent = draws;
        showToast('🤝 Berabere!', '#00e5ff');
      } else if (beats(player, ai)) {
        resultEl.textContent = '🎉 Kazandın!'; resultEl.classList.add('win');
        wins++; winEl.textContent = wins;
        showToast('🎉 Kazandın!', '#69f0ae');
      } else {
        resultEl.textContent = '😞 Kaybettin!'; resultEl.classList.add('lose');
        losses++; loseEl.textContent = losses;
        showToast('😞 AI kazandı!', '#ff6b9d');
      }
    });
  });
})();

// ============================================================
// 🎯 HIGHER / LOWER — New Game
// ============================================================
(function () {
  var displayEl = document.getElementById('guessDisplay');
  var hintEl = document.getElementById('guessHint');
  var rangeEl = document.getElementById('guessRange');
  var inputEl = document.getElementById('guessInput');
  var submitBtn = document.getElementById('guessSubmit');
  var triesEl = document.getElementById('guessTries');
  var bestEl = document.getElementById('guessBest');
  var resetBtn = document.getElementById('guessReset');

  var secret, tries, low, high, best = Infinity;

  function newGame() {
    secret = Math.floor(Math.random() * 100) + 1;
    tries = 0; low = 1; high = 100;
    displayEl.textContent = '?';
    hintEl.textContent = '1 ile 100 arasında bir sayı düşündüm...';
    hintEl.style.color = 'var(--tx2)';
    rangeEl.textContent = '📍 1 — 100';
    triesEl.textContent = 0;
    inputEl.value = ''; inputEl.disabled = false;
    submitBtn.disabled = false;
    inputEl.focus();
  }

  function guess() {
    var val = parseInt(inputEl.value, 10);
    if (isNaN(val) || val < 1 || val > 100) { showToast('1-100 arası gir!', '#ff6b9d'); return; }
    tries++; triesEl.textContent = tries;
    displayEl.textContent = val;
    if (val === secret) {
      hintEl.textContent = '🎉 Doğru! ' + tries + ' denemede buldun!';
      hintEl.style.color = 'var(--a4)';
      if (tries < best) { best = tries; bestEl.textContent = tries; }
      inputEl.disabled = true; submitBtn.disabled = true;
      showToast('🎯 ' + tries + ' denemede buldun!', '#69f0ae');
    } else if (val < secret) {
      hintEl.textContent = '📈 Daha büyük bir sayı!';
      hintEl.style.color = 'var(--a3)';
      low = Math.max(low, val + 1);
    } else {
      hintEl.textContent = '📉 Daha küçük bir sayı!';
      hintEl.style.color = 'var(--a2)';
      high = Math.min(high, val - 1);
    }
    rangeEl.textContent = '📍 ' + low + ' — ' + high;
    inputEl.value = ''; inputEl.focus();
  }

  submitBtn.addEventListener('click', guess);
  inputEl.addEventListener('keydown', function (e) { if (e.key === 'Enter') guess(); });
  resetBtn.addEventListener('click', newGame);
  newGame();
})();

// ============================================================
// 💣 MINESWEEPER — New Game (8x8, 10 mines)
// ============================================================
(function () {
  var gridEl = document.getElementById('mineGrid');
  var countEl = document.getElementById('mineCount');
  var statusEl = document.getElementById('mineStatus');
  var timerEl = document.getElementById('mineTimer');
  var resetBtn = document.getElementById('mineReset');

  var ROWS = 8, COLS = 8, MINES = 10;
  var board, revealed, flagged, gameOver, gameWon, timerInterval, startTime, started;
  var NCOLORS = ['', 'mine-n1', 'mine-n2', 'mine-n3', 'mine-n4', 'mine-n5', 'mine-n6', 'mine-n7', 'mine-n8'];

  function initBoard(safeIdx) {
    board = []; revealed = []; flagged = [];
    for (var i = 0; i < ROWS * COLS; i++) { board.push(0); revealed.push(false); flagged.push(false); }
    // Place mines (avoid safeIdx and its neighbors)
    var safe = new Set([safeIdx]);
    var nr = Math.floor(safeIdx / COLS), nc = safeIdx % COLS;
    for (var dr = -1; dr <= 1; dr++) for (var dc = -1; dc <= 1; dc++) {
      var r2 = nr + dr, c2 = nc + dc;
      if (r2 >= 0 && r2 < ROWS && c2 >= 0 && c2 < COLS) safe.add(r2 * COLS + c2);
    }
    var placed = 0;
    while (placed < MINES) {
      var pos = Math.floor(Math.random() * ROWS * COLS);
      if (!safe.has(pos) && board[pos] !== -1) { board[pos] = -1; placed++; }
    }
    // Count neighbors
    for (var i = 0; i < ROWS * COLS; i++) {
      if (board[i] === -1) continue;
      var cnt = 0, ri = Math.floor(i / COLS), ci = i % COLS;
      for (var dr = -1; dr <= 1; dr++) for (var dc = -1; dc <= 1; dc++) {
        var r2 = ri + dr, c2 = ci + dc;
        if (r2 >= 0 && r2 < ROWS && c2 >= 0 && c2 < COLS && board[r2 * COLS + c2] === -1) cnt++;
      }
      board[i] = cnt;
    }
  }

  function newGame() {
    clearInterval(timerInterval);
    board = null; revealed = []; flagged = [];
    for (var i = 0; i < ROWS * COLS; i++) { revealed.push(false); flagged.push(false); }
    gameOver = false; gameWon = false; started = false;
    statusEl.textContent = '🙂'; timerEl.textContent = '0'; countEl.textContent = MINES;
    render();
  }

  function render() {
    gridEl.innerHTML = '';
    for (var i = 0; i < ROWS * COLS; i++) {
      var cell = document.createElement('div');
      cell.className = 'mine-cell';
      cell.dataset.idx = i;
      if (revealed[i]) {
        cell.classList.add('revealed');
        if (board && board[i] === -1) {
          cell.textContent = '💣'; cell.classList.add('mine-exploded');
        } else if (board && board[i] > 0) {
          cell.textContent = board[i]; cell.classList.add(NCOLORS[board[i]]);
        }
      } else if (flagged[i]) {
        cell.classList.add('flagged'); cell.textContent = '🚩';
      }
      (function(idx) {
        cell.addEventListener('click', function () { leftClick(idx); });
        cell.addEventListener('contextmenu', function (e) { e.preventDefault(); rightClick(idx); });
      })(i);
      gridEl.appendChild(cell);
    }
  }

  function flood(idx) {
    if (idx < 0 || idx >= ROWS * COLS || revealed[idx] || flagged[idx]) return;
    revealed[idx] = true;
    if (board[idx] === 0) {
      var r = Math.floor(idx / COLS), c = idx % COLS;
      for (var dr = -1; dr <= 1; dr++) for (var dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        var r2 = r + dr, c2 = c + dc;
        if (r2 >= 0 && r2 < ROWS && c2 >= 0 && c2 < COLS) flood(r2 * COLS + c2);
      }
    }
  }

  function leftClick(idx) {
    if (gameOver || gameWon || revealed[idx] || flagged[idx]) return;
    if (!started) {
      started = true;
      initBoard(idx);
      startTime = Date.now();
      timerInterval = setInterval(function () { timerEl.textContent = Math.floor((Date.now() - startTime) / 1000); }, 500);
    }
    if (board[idx] === -1) {
      // Boom!
      revealed[idx] = true;
      board.forEach(function (v, i) { if (v === -1) revealed[i] = true; });
      gameOver = true; clearInterval(timerInterval);
      statusEl.textContent = '😵'; render();
      showToast('💥 Mayına bastın!', '#ff4444');
      return;
    }
    flood(idx);
    checkWin();
    render();
  }

  function rightClick(idx) {
    if (gameOver || gameWon || revealed[idx]) return;
    flagged[idx] = !flagged[idx];
    var f = flagged.filter(Boolean).length;
    countEl.textContent = Math.max(0, MINES - f);
    render();
  }

  function checkWin() {
    var unrev = revealed.filter(function (v) { return !v; }).length;
    if (unrev === MINES) {
      gameWon = true; clearInterval(timerInterval);
      statusEl.textContent = '😎';
      var t = Math.floor((Date.now() - startTime) / 1000);
      showToast('🎉 Temizledin! ' + t + ' saniyede!', '#69f0ae');
    }
  }

  resetBtn.addEventListener('click', newGame);
  statusEl.addEventListener('click', newGame);
  newGame();
})();

// ============================================================
// ⌨️ TYPING SPEED TEST — New Game
// ============================================================
(function () {
  var textEl = document.getElementById('typingText');
  var inputEl = document.getElementById('typingInput');
  var wpmEl = document.getElementById('typingWPM');
  var accEl = document.getElementById('typingAcc');
  var timerEl = document.getElementById('typingTimer');
  var charsEl = document.getElementById('typingChars');
  var startBtn = document.getElementById('typingStart');

  var TEXTS = [
    'Hayat güzel anlarla doludur. Her sabah yeni bir fırsat sunar, her gece yeni bir şükran kaynağı olur. Mutluluğu küçük şeylerde aramak, büyük mutlulukların kapısını aralar.',
    'Teknoloji insanlığın en büyük icatlarından biridir. Bilgisayarlar sayesinde dünyamız küçüldü, bilgiye erişim kolaylaştı ve iletişim sınırları ortadan kalktı.',
    'Doğa her mevsim farklı bir güzellik sunar. Baharın renkleri, yazın sıcaklığı, sonbaharın hüznü ve kışın sakinliği birbirini tamamlayan muhteşem bir döngü oluşturur.',
    'Okumak insanı düşündürür ve hayal gücünü geliştirir. Bir kitap bitirdiğinde farklı bir dünyadan dönmüş gibi hissedebilirsiniz. Kelimeler zihnin kapılarını açar.',
    'Müzik evrensel bir dil konuşur. Dünya üzerindeki tüm insanlar farklı dillerde konuşsa da melodi herkesin kalbine aynı şekilde dokunabilir ve duyguları paylaşabilir.',
    'Spor yapmak hem beden hem de ruh sağlığı için çok önemlidir. Düzenli egzersiz stresi azaltır, enerjiyi artırır ve özgüveni yükseltir. Her gün yirmi dakika yeterlidir.'
  ];

  var text = '', running = false, timer, startTime, timeLeft = 60, typed = 0, correct = 0;

  function renderText(pos) {
    var html = '';
    for (var i = 0; i < text.length; i++) {
      if (i < pos) {
        var typedChar = inputEl.value[i] || '';
        if (typedChar === text[i]) html += '<span class="t-correct">' + escH(text[i]) + '</span>';
        else html += '<span class="t-wrong">' + escH(text[i]) + '</span>';
      } else if (i === pos) {
        html += '<span class="t-current">' + escH(text[i]) + '</span>';
      } else {
        html += '<span class="t-pending">' + escH(text[i]) + '</span>';
      }
    }
    textEl.innerHTML = html;
  }

  function escH(c) { return c === ' ' ? '&nbsp;' : c.replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function startTest() {
    text = TEXTS[Math.floor(Math.random() * TEXTS.length)];
    typed = 0; correct = 0; timeLeft = 60;
    wpmEl.textContent = 0; accEl.textContent = 100; timerEl.textContent = 60; charsEl.textContent = 0;
    running = true; startBtn.disabled = true; startBtn.textContent = '⏱ Test Sürüyor...';
    inputEl.disabled = false; inputEl.value = ''; inputEl.focus();
    renderText(0);
    startTime = Date.now();
    timer = setInterval(function () {
      timeLeft--;
      timerEl.textContent = timeLeft;
      var elapsed = (Date.now() - startTime) / 60000;
      var words = correct / 5;
      wpmEl.textContent = Math.round(words / elapsed);
      if (timeLeft <= 0) endTest();
    }, 1000);
  }

  function endTest() {
    clearInterval(timer); running = false;
    inputEl.disabled = true;
    startBtn.disabled = false; startBtn.textContent = '▶ Tekrar';
    var elapsed = (Date.now() - startTime) / 60000;
    var wpm = Math.round((correct / 5) / elapsed);
    var acc = typed > 0 ? Math.round((correct / typed) * 100) : 100;
    wpmEl.textContent = wpm; accEl.textContent = acc;
    showToast('⌨️ ' + wpm + ' WPM · ' + acc + '% doğruluk', '#7c4dff');
  }

  inputEl.addEventListener('input', function () {
    if (!running) return;
    var pos = inputEl.value.length;
    typed = pos; correct = 0;
    for (var i = 0; i < pos && i < text.length; i++) {
      if (inputEl.value[i] === text[i]) correct++;
    }
    charsEl.textContent = pos;
    var acc = pos > 0 ? Math.round((correct / pos) * 100) : 100;
    accEl.textContent = acc;
    renderText(pos);
    if (pos >= text.length) endTest();
  });

  startBtn.addEventListener('click', function () { if (!running) startTest(); });
  renderText(0);
  textEl.innerHTML = '<span class="t-pending">Teste başlamak için Başlat\'a bas...</span>';
})();

// ============================================================
// 🎵 AMBIANCE — Web Audio API
// ============================================================
(function () {
  var vizEl = document.getElementById('ambianceVisualizer');
  var vizIcon = document.getElementById('vizIcon');
  var vizLabel = document.getElementById('vizLabel');
  var playBtn = document.getElementById('playStopBtn');
  var playIcon = document.getElementById('playStopIcon');
  var playLabel = document.getElementById('playStopLabel');
  var volSlider = document.getElementById('masterVolume');
  var volDisplay = document.getElementById('volumeDisplay');

  var actx = null, masterGain = null, nodes = [], isPlaying = false;
  var selectedType = null, selectedCard = null;

  function initCtx() {
    if (!actx) {
      actx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = actx.createGain();
      masterGain.gain.value = volSlider.value / 100;
      masterGain.connect(actx.destination);
    }
    if (actx.state === 'suspended') actx.resume();
  }

  function makeNoise(len) {
    var sr = actx.sampleRate, buf = actx.createBuffer(1, sr * (len || 4), sr), d = buf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  function noiseSrc() { var s = actx.createBufferSource(); s.buffer = makeNoise(4); s.loop = true; return s; }
  function filt(type, freq, q) { var f = actx.createBiquadFilter(); f.type = type; f.frequency.value = freq; if (q) f.Q.value = q; return f; }
  function gain(v) { var g = actx.createGain(); g.gain.value = v; return g; }
  function lfo(rate, depth) { var o = actx.createOscillator(), g = actx.createGain(); o.frequency.value = rate; g.gain.value = depth; o.connect(g); o.start(); return g; }

  function connect() { var args = Array.from(arguments); for (var i = 0; i < args.length - 1; i++) args[i].connect(args[i + 1]); return args[args.length - 1]; }

  var SOUNDS = {
    rain: function() { var s = noiseSrc(), hp = filt('highpass', 280), bp = filt('bandpass', 1500, 0.3), g = gain(0.85); connect(s, hp, bp, g, masterGain); s.start(); return [s, hp, bp, g]; },
    ocean: function() { var s = noiseSrc(), lp = filt('lowpass', 620, 2.5), g = gain(0.7), l = lfo(0.07, 0.38); l.connect(g.gain); connect(s, lp, g, masterGain); s.start(); return [s, lp, g]; },
    forest: function() {
      var s = noiseSrc(), bp = filt('bandpass', 750, 0.5), g = gain(0.45); connect(s, bp, g, masterGain); s.start();
      var tone = actx.createOscillator(), tg = gain(0.025); tone.frequency.value = 560; tone.type = 'sine'; connect(tone, tg, masterGain); tone.start();
      return [s, bp, g, tone, tg];
    },
    fire: function() { var s = noiseSrc(), lp = filt('lowpass', 680, 0.4), hp = filt('highpass', 70), g = gain(0.55), l = lfo(2.8, 0.09); l.connect(g.gain); connect(s, hp, lp, g, masterGain); s.start(); return [s, lp, hp, g]; },
    cafe: function() { var s = noiseSrc(), bp = filt('bandpass', 820, 2.2), g = gain(0.3), l = lfo(0.18, 0.12); l.connect(g.gain); connect(s, bp, g, masterGain); s.start(); return [s, bp, g]; },
    space: function() {
      var s = noiseSrc(), lp = filt('lowpass', 140, 3.5), g = gain(0.45); connect(s, lp, g, masterGain); s.start();
      var osc = actx.createOscillator(), og = gain(0.13); osc.frequency.value = 52; osc.type = 'sine'; var l = lfo(0.025, 0.07); l.connect(og.gain); connect(osc, og, masterGain); osc.start();
      return [s, lp, g, osc, og];
    },
    wind: function() { var s = noiseSrc(), lp = filt('lowpass', 480), g = gain(0.65), l = lfo(0.12, 0.3); l.connect(g.gain); connect(s, lp, g, masterGain); s.start(); return [s, lp, g]; },
    night: function() {
      var s = noiseSrc(), lp = filt('lowpass', 180), bg = gain(0.14); connect(s, lp, bg, masterGain); s.start();
      var o1 = actx.createOscillator(), o2 = actx.createOscillator();
      var g1 = gain(0.02), g2 = gain(0.015);
      o1.frequency.value = 4200; o1.type = 'square';
      o2.frequency.value = 4450; o2.type = 'square';
      var l1 = lfo(13, 0.018), l2 = lfo(16, 0.014);
      l1.connect(g1.gain); l2.connect(g2.gain);
      connect(o1, g1, masterGain); connect(o2, g2, masterGain);
      o1.start(); o2.start();
      return [s, lp, bg, o1, o2, g1, g2];
    }
  };

  function stopAll() {
    nodes.forEach(function (n) {
      if (!n) return;
      try { if (n.stop) n.stop(); } catch (e) {}
      try { n.disconnect(); } catch (e) {}
    });
    nodes = [];
  }

  function playSound(type) {
    initCtx();
    stopAll();
    if (SOUNDS[type]) nodes = SOUNDS[type]().filter(Boolean);
  }

  document.querySelectorAll('.sound-card').forEach(function (card) {
    card.addEventListener('click', function () {
      document.querySelectorAll('.sound-card').forEach(function (c) { c.classList.remove('active'); });
      card.classList.add('active');
      selectedType = card.dataset.sound;
      selectedCard = card;
      vizIcon.textContent = card.dataset.icon;
      vizLabel.textContent = card.dataset.label;
      if (isPlaying) playSound(selectedType);
    });
  });

  volSlider.addEventListener('input', function () {
    volDisplay.textContent = volSlider.value + '%';
    if (masterGain) masterGain.gain.value = volSlider.value / 100;
  });

  playBtn.addEventListener('click', function () {
    if (!selectedType) { showToast('Önce bir ses seç!', '#00e5ff'); return; }
    if (isPlaying) {
      stopAll(); isPlaying = false;
      playIcon.textContent = '▶'; playLabel.textContent = 'Çal';
      vizEl.classList.remove('playing');
    } else {
      playSound(selectedType); isPlaying = true;
      playIcon.textContent = '⏸'; playLabel.textContent = 'Durdur';
      vizEl.classList.add('playing');
      showToast('🎵 ' + selectedCard.dataset.label + ' çalıyor', '#00e5ff');
    }
  });
})();

// ============================================================
// 🎨 DRAWING CANVAS
// ============================================================
(function () {
  var canvas = document.getElementById('drawingCanvas');
  var ctx = canvas.getContext('2d');
  var painting = false, color = '#7c4dff', size = 8, tool = 'brush', glowOn = false, lx, ly;

  function initCanvas() {
    var r = canvas.getBoundingClientRect();
    var w = r.width || 800, h = r.height || 430;
    var img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    canvas.width = w; canvas.height = h;
    ctx.putImageData(img, 0, 0);
    ctx.fillStyle = '#0a0b14'; ctx.fillRect(0, 0, w, h);
  }
  setTimeout(initCanvas, 150);
  window.addEventListener('resize', function () { setTimeout(initCanvas, 200); });

  function getPos(e) {
    var r = canvas.getBoundingClientRect();
    var sx = canvas.width / r.width, sy = canvas.height / r.height;
    var px = e.touches ? e.touches[0].clientX : e.clientX;
    var py = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (px - r.left) * sx, y: (py - r.top) * sy };
  }

  function startDraw(e) {
    e.preventDefault();
    painting = true;
    var p = getPos(e); lx = p.x; ly = p.y;
    ctx.save();
    if (glowOn && tool === 'brush') { ctx.shadowBlur = size * 5; ctx.shadowColor = color; }
    ctx.fillStyle = tool === 'eraser' ? '#0a0b14' : color;
    ctx.beginPath(); ctx.arc(p.x, p.y, (tool === 'eraser' ? size * 1.8 : size) / 2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function draw(e) {
    if (!painting) return;
    e.preventDefault();
    var p = getPos(e);
    ctx.save();
    if (tool === 'spark') {
      for (var i = 0; i < 7; i++) {
        var angle = Math.random() * Math.PI * 2, len = Math.random() * size * 3 + 4;
        ctx.strokeStyle = color; ctx.lineWidth = Math.random() * 1.5 + 0.5;
        ctx.globalAlpha = Math.random() * 0.8 + 0.2;
        ctx.beginPath(); ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + Math.cos(angle) * len, p.y + Math.sin(angle) * len); ctx.stroke();
      }
    } else {
      if (glowOn && tool === 'brush') { ctx.shadowBlur = size * 3; ctx.shadowColor = color; }
      ctx.strokeStyle = tool === 'eraser' ? '#0a0b14' : color;
      ctx.lineWidth = tool === 'eraser' ? size * 2.2 : size;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(p.x, p.y); ctx.stroke();
    }
    ctx.restore();
    lx = p.x; ly = p.y;
  }

  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', function () { painting = false; });
  canvas.addEventListener('mouseleave', function () { painting = false; });
  canvas.addEventListener('touchstart', startDraw, { passive: false });
  canvas.addEventListener('touchmove', draw, { passive: false });
  canvas.addEventListener('touchend', function () { painting = false; });

  document.getElementById('colorPalette').addEventListener('click', function (e) {
    var pc = e.target.closest('.palette-color');
    if (pc && pc.dataset.color) {
      document.querySelectorAll('.palette-color').forEach(function (p) { p.classList.remove('selected'); });
      pc.classList.add('selected'); color = pc.dataset.color;
    }
  });
  document.getElementById('customColor').addEventListener('input', function (e) {
    color = e.target.value;
    document.querySelectorAll('.palette-color').forEach(function (p) { p.classList.remove('selected'); });
  });
  document.getElementById('brushSize').addEventListener('input', function (e) {
    size = +e.target.value; document.getElementById('brushSizeDisplay').textContent = size;
  });

  function setTool(t) {
    tool = t;
    document.querySelectorAll('.tool-btn').forEach(function (b) { b.classList.remove('active'); });
  }
  document.getElementById('brushTool').addEventListener('click', function () { setTool('brush'); this.classList.add('active'); });
  document.getElementById('eraserTool').addEventListener('click', function () { setTool('eraser'); this.classList.add('active'); });
  document.getElementById('sparkTool').addEventListener('click', function () { setTool('spark'); this.classList.add('active'); });
  document.getElementById('glowToggle').addEventListener('click', function () {
    glowOn = !glowOn; this.classList.toggle('active', glowOn);
    showToast(glowOn ? '✨ Glow Açık!' : '✨ Glow Kapalı', '#7c4dff');
  });
  document.getElementById('clearCanvas').addEventListener('click', function () {
    ctx.fillStyle = '#0a0b14'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    showToast('🗑️ Temizlendi', '#546e7a');
  });
  document.getElementById('saveCanvas').addEventListener('click', function () {
    var a = document.createElement('a'); a.download = 'dreamscape-art.png'; a.href = canvas.toDataURL(); a.click();
    showToast('💾 Kaydedildi!', '#69f0ae');
  });
})();

// ============================================================
// 🧘 BREATHING EXERCISE
// ============================================================
(function () {
  var circle = document.getElementById('breatheCircle');
  var icon = document.getElementById('breatheIcon');
  var phaseText = document.getElementById('breathePhaseText');
  var countdown = document.getElementById('breatheCountdown');
  var startBtn = document.getElementById('breatheStart');
  var startIcon = document.getElementById('breatheStartIcon');
  var startLabel = document.getElementById('breatheStartLabel');
  var cycleEl = document.getElementById('breatheCycle');
  var timeEl = document.getElementById('breatheTime');
  var fill = document.getElementById('breatheProgressFill');

  var CIRC = 2 * Math.PI * 100;
  fill.style.strokeDasharray = CIRC;
  fill.style.strokeDashoffset = CIRC;

  var TECHS = {
    '478': [{ n: 'Nefes Al', i: '🌬️', d: 4, s: 'inhale' }, { n: 'Tut', i: '🤐', d: 7, s: 'hold' }, { n: 'Nefes Ver', i: '😮‍💨', d: 8, s: 'exhale' }],
    'box': [{ n: 'Nefes Al', i: '🌬️', d: 4, s: 'inhale' }, { n: 'Tut', i: '🤐', d: 4, s: 'hold' }, { n: 'Nefes Ver', i: '😮‍💨', d: 4, s: 'exhale' }, { n: 'Bekle', i: '⏸️', d: 4, s: 'exhale' }],
    'calm': [{ n: 'Nefes Al', i: '🌬️', d: 5, s: 'inhale' }, { n: 'Nefes Ver', i: '😮‍💨', d: 5, s: 'exhale' }]
  };

  var running = false, type = '478', pIdx = 0, cycles = 0, secs = 0;
  var pTimer, sTimer;

  function setProgress(pct) { fill.style.strokeDashoffset = CIRC * (1 - pct); }

  function runPhase() {
    var ph = TECHS[type][pIdx];
    var elapsed = 0;
    icon.textContent = ph.i; phaseText.textContent = ph.n; countdown.textContent = ph.d;
    circle.className = 'breathe-circle ' + ph.s;
    setProgress(0);
    clearInterval(pTimer);
    pTimer = setInterval(function () {
      elapsed++;
      countdown.textContent = ph.d - elapsed;
      setProgress(elapsed / ph.d);
      if (elapsed >= ph.d) {
        clearInterval(pTimer);
        pIdx = (pIdx + 1) % TECHS[type].length;
        if (pIdx === 0) { cycles++; cycleEl.textContent = cycles; }
        if (running) runPhase();
      }
    }, 1000);
  }

  function startB() {
    running = true; pIdx = 0; cycles = 0; secs = 0;
    cycleEl.textContent = 0; timeEl.textContent = '0:00';
    startIcon.textContent = '⏹'; startLabel.textContent = ' Durdur';
    runPhase();
    sTimer = setInterval(function () {
      secs++;
      timeEl.textContent = Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0');
    }, 1000);
  }

  function stopB() {
    running = false; clearInterval(pTimer); clearInterval(sTimer);
    circle.className = 'breathe-circle';
    icon.textContent = '🌬️'; phaseText.textContent = 'Hazır'; countdown.textContent = '';
    startIcon.textContent = '▶'; startLabel.textContent = ' Başlat';
    setProgress(0);
  }

  document.querySelectorAll('.breathe-type-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.breathe-type-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active'); type = btn.dataset.type;
      if (running) { stopB(); startB(); }
    });
  });

  startBtn.addEventListener('click', function () { if (running) stopB(); else startB(); });
})();

// ============================================================
// ⏱️ POMODORO
// ============================================================
(function () {
  var pomoTime = document.getElementById('pomoTime');
  var pomoFill = document.getElementById('pomoFill');
  var pomoCount = document.getElementById('pomoCount');
  var pomoLabel = document.getElementById('pomoModeLabel');
  var startBtn = document.getElementById('pomoStart');
  var resetBtn = document.getElementById('pomoReset');
  var taskInput = document.getElementById('pomoTaskInput');
  var taskList = document.getElementById('pomoTaskList');
  var addBtn = document.getElementById('pomoAddTask');

  var CIRC = 2 * Math.PI * 108;
  var MODES = {
    work: { sec: 25 * 60, label: '🎯 Çalışma Zamanı', color: 'var(--a2)' },
    short: { sec: 5 * 60, label: '☕ Kısa Mola', color: 'var(--a4)' },
    long: { sec: 15 * 60, label: '🌿 Uzun Mola', color: 'var(--a3)' }
  };
  var mode = 'work', totalSec = MODES.work.sec, elapsed = 0, running = false, timer, pomosCompleted = 0;
  pomoFill.style.strokeDasharray = CIRC;

  function fmt(s) { return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }
  function render() { pomoTime.textContent = fmt(totalSec - elapsed); pomoFill.style.strokeDashoffset = CIRC * (elapsed / totalSec); }

  function startP() {
    running = true; startBtn.textContent = '⏸ Duraklat';
    timer = setInterval(function () {
      elapsed++;
      render();
      if (elapsed >= totalSec) {
        clearInterval(timer); running = false; startBtn.textContent = '▶ Başlat';
        if (mode === 'work') { pomosCompleted++; pomoCount.textContent = pomosCompleted; showToast('🍅 Pomodoro bitti! Mola ver!', '#ff6b9d'); }
        else showToast('⚡ Mola bitti! Çalışmaya devam!', '#69f0ae');
      }
    }, 1000);
  }
  function pauseP() { clearInterval(timer); running = false; startBtn.textContent = '▶ Devam'; }
  function resetP() { clearInterval(timer); running = false; elapsed = 0; render(); startBtn.textContent = '▶ Başlat'; }

  startBtn.addEventListener('click', function () { if (running) pauseP(); else startP(); });
  resetBtn.addEventListener('click', resetP);

  document.querySelectorAll('.pomo-mode-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.pomo-mode-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      mode = btn.dataset.mode; totalSec = MODES[mode].sec;
      pomoLabel.textContent = MODES[mode].label;
      pomoFill.style.stroke = MODES[mode].color;
      resetP();
    });
  });

  function addTask() {
    var val = taskInput.value.trim(); if (!val) return;
    var li = document.createElement('li'); li.className = 'pomo-task-item';
    var cb = document.createElement('div'); cb.className = 'pomo-task-cb';
    var sp = document.createElement('span'); sp.textContent = val;
    var del = document.createElement('button'); del.className = 'pomo-task-del'; del.textContent = '✕';
    del.addEventListener('click', function (e) { e.stopPropagation(); li.remove(); });
    li.addEventListener('click', function () { li.classList.toggle('done'); cb.textContent = li.classList.contains('done') ? '✓' : ''; });
    li.appendChild(cb); li.appendChild(sp); li.appendChild(del);
    taskList.appendChild(li); taskInput.value = ''; taskInput.focus();
  }
  addBtn.addEventListener('click', addTask);
  taskInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') addTask(); });
  render();
})();

// ============================================================
// 💡 FACTS
// ============================================================
(function () {
  var FACTS = [
    { cat: 'science', icon: '⚡', label: '🔬 Bilim', text: 'Dünyada her saniye yaklaşık 100 yıldırım düşmektedir.' },
    { cat: 'space', icon: '🌌', label: '🚀 Uzay', text: 'Güneş, Dünya\'dan yaklaşık 1,3 milyon kat daha büyüktür.' },
    { cat: 'nature', icon: '🌳', label: '🌿 Doğa', text: 'Bir ağaç yaşamı boyunca yaklaşık 1 ton CO₂ emer.' },
    { cat: 'animals', icon: '🐙', label: '🐾 Hayvanlar', text: 'Ahtapotların 3 kalbi ve mavi renkte kanı vardır.' },
    { cat: 'science', icon: '💧', label: '🔬 Bilim', text: 'İnsan vücudunun yaklaşık %60\'ı sudan oluşur.' },
    { cat: 'space', icon: '🌙', label: '🚀 Uzay', text: 'Ay her yıl Dünya\'dan 3,8 cm uzaklaşmaktadır.' },
    { cat: 'history', icon: '🏛️', label: '📜 Tarih', text: 'Antik Mısır\'da bira, işçilere para yerine ödeme aracı olarak kullanılırdı.' },
    { cat: 'animals', icon: '🦈', label: '🐾 Hayvanlar', text: 'Köpekbalıkları dinozorlardan daha eski canlılardır — 450 milyon yıl önce ortaya çıktılar.' },
    { cat: 'nature', icon: '🌊', label: '🌿 Doğa', text: 'Okyanus tabanının %95\'i hâlâ keşfedilmemiştir.' },
    { cat: 'science', icon: '🧬', label: '🔬 Bilim', text: 'İnsan DNA\'sı ile muz DNA\'sı yaklaşık %60 benzerdir.' },
    { cat: 'space', icon: '⭐', label: '🚀 Uzay', text: 'Evrendeki yıldız sayısı, Dünya\'daki tüm kum tanelerinden çoktur.' },
    { cat: 'history', icon: '🗺️', label: '📜 Tarih', text: 'Kleopatra, piramitlerin inşasından NASA\'nın kuruluşuna daha yakın bir dönemde yaşadı.' },
    { cat: 'animals', icon: '🐘', label: '🐾 Hayvanlar', text: 'Filler yaklaşık 22 ay boyunca hamile kalır.' },
    { cat: 'nature', icon: '🍄', label: '🌿 Doğa', text: 'Mantarlar genetik olarak bitkilerden çok hayvanlara benzer.' },
    { cat: 'science', icon: '🔬', label: '🔬 Bilim', text: 'Işık hızında giden bir cisim Dünya\'yı 1 saniyede 7,5 kez döner.' },
    { cat: 'space', icon: '🪐', label: '🚀 Uzay', text: 'Satürn\'ün halkalarının kalınlığı yalnızca 10-100 metre arasındadır.' },
    { cat: 'history', icon: '🔱', label: '📜 Tarih', text: '"Salary" (maaş) kelimesi Latince tuz anlamına gelen "sal"dan gelir; Romalılar maaşlarını tuzla alırdı.' },
    { cat: 'animals', icon: '🦋', label: '🐾 Hayvanlar', text: 'Kelebeklerin tatma organları ayaklarındadır.' },
    { cat: 'nature', icon: '🏔️', label: '🌿 Doğa', text: 'Himalayalar her yıl yaklaşık 5 mm daha yükselmektedir.' },
    { cat: 'science', icon: '🌈', label: '🔬 Bilim', text: 'Gökkuşağı aslında tam bir dairedir; biz yalnızca ufkun üstündeki yarısını görürüz.' },
    { cat: 'animals', icon: '🐬', label: '🐾 Hayvanlar', text: 'Yunuslar uyurken beynlerinin yalnızca yarısını uyutur, diğer yarısı uyanık kalır.' },
    { cat: 'history', icon: '💻', label: '📜 Tarih', text: 'İlk bilgisayar hatası gerçek bir böcekten kaynaklanıyordu — 1947\'de bir güve röleye girdi.' },
    { cat: 'space', icon: '🌠', label: '🚀 Uzay', text: 'Samanyolu\'nda yaklaşık 200-400 milyar yıldız bulunmaktadır.' }
  ];

  var factText = document.getElementById('factText');
  var factCat = document.getElementById('factCategory');
  var factIcon = document.getElementById('factIconBig');
  var factNum = document.getElementById('factNumber');
  var cur, idx = 0, cat = 'all';

  function filter() { cur = cat === 'all' ? FACTS.slice() : FACTS.filter(function (f) { return f.cat === cat; }); idx = 0; show(); }
  function show() {
    var f = cur[idx];
    factText.style.opacity = '0'; factIcon.style.opacity = '0';
    setTimeout(function () {
      factCat.textContent = f.label; factIcon.textContent = f.icon;
      factText.textContent = f.text; factNum.textContent = (idx + 1) + ' / ' + cur.length;
      factText.style.opacity = '1'; factIcon.style.opacity = '1';
    }, 200);
  }

  document.getElementById('prevFact').addEventListener('click', function () { idx = (idx - 1 + cur.length) % cur.length; show(); });
  document.getElementById('nextFact').addEventListener('click', function () { idx = (idx + 1) % cur.length; show(); });
  document.getElementById('randomFact').addEventListener('click', function () {
    var n; do { n = Math.floor(Math.random() * cur.length); } while (n === idx && cur.length > 1); idx = n; show();
  });
  document.querySelectorAll('.cat-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.cat-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active'); cat = btn.dataset.cat; filter();
    });
  });
  filter();
})();

// ============================================================
// 💬 QUOTES
// ============================================================
(function () {
  var QUOTES = [
    { text: 'Hayat bisiklete binmek gibidir. Dengenizi korumak için hareket etmeye devam etmeniz gerekir.', author: '— Albert Einstein', tag: '🌱 Hayat' },
    { text: 'En büyük zafer, hiç düşmemek değil; her düşüşte bir kez daha ayağa kalkmaktır.', author: '— Nelson Mandela', tag: '🏆 Başarı' },
    { text: 'Mutluluğun sırrı, daha fazlasını istemek değil, sahip olduklarının tadını çıkarmaktır.', author: '— Epiktetos', tag: '💛 Mutluluk' },
    { text: 'Bilgelik, bilgiden değil, deneyimden doğar.', author: '— Albert Einstein', tag: '🦉 Bilgelik' },
    { text: 'Başarı, başarısızlıktan başarısızlığa coşkuyu yitirmeden gitmektir.', author: '— Winston Churchill', tag: '🏆 Başarı' },
    { text: 'Hayal kurmayı bırakanlar, yaşamayı da bırakır.', author: '— Malcolm Forbes', tag: '🌱 Hayat' },
    { text: 'İmkânsız, cesaretsizlerin sözlüğünde bulunur.', author: '— Napolyon Bonaparte', tag: '🏆 Başarı' },
    { text: 'Kendini bil, kendine hükmet.', author: '— Sokrates', tag: '🦉 Bilgelik' },
    { text: 'Bir kitap açılmış bir penceredir; onu kapatan bilgiden uzaklaşır.', author: '— Victor Hugo', tag: '🦉 Bilgelik' },
    { text: 'Mutlu olmak için izin almaya gerek yok.', author: '— Abraham Lincoln', tag: '💛 Mutluluk' },
    { text: 'Bir şeyi gerçekten öğrenmek için onu başkasına öğret.', author: '— Richard Feynman', tag: '🦉 Bilgelik' },
    { text: 'Yarın için endişelenmek, bugünün sevincini çalar.', author: '— Dale Carnegie', tag: '💛 Mutluluk' },
    { text: 'Her sabah yeni bir fırsat sunar; onu nasıl değerlendireceğin sana kalmış.', author: '— Oprah Winfrey', tag: '🌱 Hayat' },
    { text: 'Dünya\'daki en büyük servet, iyi dostlar edinmektir.', author: '— Euripides', tag: '💛 Mutluluk' },
    { text: 'Küçük şeyleri sevmek, büyük şeyleri anlamaya başlamaktır.', author: '— Lev Tolstoy', tag: '💛 Mutluluk' },
    { text: 'Bugün ağlatan şeyler, yarın seni güçlü yapar.', author: '— Türk Atasözü', tag: '🌱 Hayat' },
    { text: 'Bir insanı gerçekten tanımak istiyorsan, ona güç ver; ne yaptığını izle.', author: '— Abraham Lincoln', tag: '🦉 Bilgelik' },
    { text: 'Her şey mümkün — nerede duracağını bilmek şartıyla.', author: '— Goethe', tag: '🏆 Başarı' }
  ];

  var qText = document.getElementById('quoteText');
  var qAuthor = document.getElementById('quoteAuthor');
  var qTag = document.getElementById('quoteTag');
  var cur = QUOTES.slice(), idx = Math.floor(Math.random() * QUOTES.length);

  function show() {
    var q = cur[idx];
    qText.style.opacity = '0';
    setTimeout(function () { qText.textContent = q.text; qAuthor.textContent = q.author; qTag.textContent = q.tag; qText.style.opacity = '1'; }, 200);
  }

  document.getElementById('prevQuote').addEventListener('click', function () { idx = (idx - 1 + cur.length) % cur.length; show(); });
  document.getElementById('nextQuote').addEventListener('click', function () { idx = (idx + 1) % cur.length; show(); });
  document.getElementById('randomQuote').addEventListener('click', function () {
    var n; do { n = Math.floor(Math.random() * cur.length); } while (n === idx && cur.length > 1); idx = n; show();
  });
  document.getElementById('copyQuote').addEventListener('click', function () {
    var q = cur[idx];
    navigator.clipboard.writeText('"' + q.text + '" ' + q.author)
      .then(function () { showToast('📋 Kopyalandı!', '#00e5ff'); })
      .catch(function () { showToast('Kopyalama başarısız', '#ff6b9d'); });
  });
  show();
})();

// ============================================================
// 🌍 WORLD CLOCKS
// ============================================================
(function () {
  var grid = document.getElementById('clocksGrid');
  var CITIES = [
    { name: 'İstanbul', tz: 'Europe/Istanbul', flag: '🇹🇷' },
    { name: 'Londra', tz: 'Europe/London', flag: '🇬🇧' },
    { name: 'New York', tz: 'America/New_York', flag: '🇺🇸' },
    { name: 'Los Angeles', tz: 'America/Los_Angeles', flag: '🇺🇸' },
    { name: 'Tokyo', tz: 'Asia/Tokyo', flag: '🇯🇵' },
    { name: 'Dubai', tz: 'Asia/Dubai', flag: '🇦🇪' },
    { name: 'Paris', tz: 'Europe/Paris', flag: '🇫🇷' },
    { name: 'Sydney', tz: 'Australia/Sydney', flag: '🇦🇺' }
  ];
  CITIES.forEach(function (city) {
    var id = 'ck' + city.name.replace(/\s/g, '');
    var card = document.createElement('div'); card.className = 'clock-card';
    card.innerHTML = '<div class="clock-flag">' + city.flag + '</div>' +
      '<div class="clock-city">' + city.name + '</div>' +
      '<div class="clock-time" id="' + id + '">--:--</div>' +
      '<div class="clock-date" id="' + id + 'd"></div>';
    grid.appendChild(card);
  });
  function tick() {
    CITIES.forEach(function (city) {
      var id = 'ck' + city.name.replace(/\s/g, '');
      var el = document.getElementById(id), de = document.getElementById(id + 'd');
      if (el) el.textContent = new Date().toLocaleTimeString('tr-TR', { timeZone: city.tz, hour12: false });
      if (de) de.textContent = new Date().toLocaleDateString('tr-TR', { timeZone: city.tz, weekday: 'short', day: '2-digit', month: 'short' });
    });
  }
  setInterval(tick, 1000); tick();
})();

// ============================================================
// 🌤️ MOOD WIDGET
// ============================================================
(function () {
  var resp = document.getElementById('moodResponse');
  var MSGS = {
    amazing: '🤩 Müthiş! Bu enerjiyle her şeyi yapabilirsin. Birkaç oyun oyna ve bu anın tadını çıkar!',
    happy: '😊 Mutlu anlar en değerlileridir. Ambiyans aç, rahat bir oyun oyna ve keyfini sürdür!',
    okay: '😌 İyi olmak yeterince güzel. Belki nefes egzersizi veya bubble pop sana iyi gelir?',
    tired: '😴 Biraz dinlenmeye ihtiyacın var. Ambiyans seslerini aç ve nefes egzersizini dene.',
    stressed: '😤 Dur, derin bir nefes al. 4-7-8 tekniğini dene — sadece 3 döngü bile işe yarar!'
  };
  document.querySelectorAll('.mood-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.mood-btn').forEach(function (b) { b.classList.remove('selected'); });
      btn.classList.add('selected');
      resp.textContent = MSGS[btn.dataset.mood];
    });
  });
})();

// ─── Welcome toast ────────────────────────────────────────────────────────
setTimeout(function () { showToast('✦ Dreamscape\'e hoş geldin! 💙', '#7c4dff'); }, 1000);
