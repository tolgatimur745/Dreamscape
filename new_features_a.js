
/* ============================================================
   NEW FEATURES A — Leisure Hub Module
   1. Wordle Türkçe        (id='wordle-sec')
   2. Sonsuz Sudoku        (id='sudoku-sec')
   3. Ses Görselleştiricisi(id='visualizer-sec')
   4. Alışkanlık Matrisi   (id='habit-matrix-sec')
   ============================================================ */

try {
  /* ----------------------------------------------------------
     HELPER: inject section HTML
     ---------------------------------------------------------- */
  (function injectNewFeaturesA() {

    /* ========================================================
       1. WORDLE TÜRKÇE
       ======================================================== */
    const wordleHTML = `
<div id="wordle-sec" class="section ds-section" style="min-height:100vh;background:var(--bg);display:none;flex-direction:column;align-items:center;padding:20px;box-sizing:border-box;position:relative;">
  <button class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:100;cursor:pointer;" onclick="if(typeof dsGoToSection==='function') dsGoToSection('hubPage','')">◀ Ana Sayfa</button>
  <h1 style="margin-top:60px;font-size:2rem;letter-spacing:.3em;background:linear-gradient(135deg,#00ff88,#00cfff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:none;">WORDLE TR</h1>
  <p id="wordle-msg" style="color:var(--tx2);min-height:24px;font-size:1rem;margin:4px 0 10px;letter-spacing:.05em;"></p>
  <div id="wordle-grid" style="display:grid;grid-template-rows:repeat(6,1fr);gap:6px;margin-bottom:16px;"></div>
  <div id="wordle-keyboard" style="display:flex;flex-direction:column;gap:6px;align-items:center;margin-bottom:16px;"></div>
  <button onclick="wordle_init()" style="background:linear-gradient(135deg,#00ff88,#00cfff);border:none;color:#000;font-weight:700;padding:10px 28px;border-radius:8px;cursor:pointer;font-size:1rem;letter-spacing:.1em;">OYUNU YENİLE</button>
</div>`;

    /* ========================================================
       2. SONSUZ SUDOKU
       ======================================================== */
    const sudokuHTML = `
<div id="sudoku-sec" class="section ds-section" style="min-height:100vh;background:var(--bg);display:none;flex-direction:column;align-items:center;padding:20px;box-sizing:border-box;position:relative;">
  <button class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:100;cursor:pointer;" onclick="if(typeof dsGoToSection==='function') dsGoToSection('hubPage','')">◀ Ana Sayfa</button>
  <h1 style="margin-top:60px;font-size:2rem;letter-spacing:.3em;background:linear-gradient(135deg,#bf00ff,#00cfff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">SONSUZ SUDOKU</h1>
  <div style="display:flex;gap:12px;align-items:center;margin:10px 0;flex-wrap:wrap;justify-content:center;">
    <select id="sudoku-diff" style="background:var(--card);color:var(--tx);border:1px solid var(--a1);border-radius:6px;padding:6px 12px;font-size:.95rem;">
      <option value="easy">Kolay</option>
      <option value="medium" selected>Orta</option>
      <option value="hard">Zor</option>
    </select>
    <button onclick="sudoku_newGame()" style="background:linear-gradient(135deg,#bf00ff,#00cfff);border:none;color:#fff;font-weight:700;padding:8px 20px;border-radius:8px;cursor:pointer;">Yeni Oyun</button>
    <button onclick="sudoku_showSolution()" style="background:var(--card);border:1px solid var(--a2);color:var(--tx);font-weight:600;padding:8px 20px;border-radius:8px;cursor:pointer;">ÇÖZÜMÜ GÖSTER</button>
    <button id="sudoku-pencil-btn" onclick="sudoku_togglePencil()" style="background:var(--card);border:1px solid var(--a3);color:var(--tx);font-weight:600;padding:8px 16px;border-radius:8px;cursor:pointer;">✏️ Kalem: OFF</button>
    <span id="sudoku-timer" style="color:var(--a1);font-size:1.1rem;font-weight:700;font-family:monospace;">00:00</span>
  </div>
  <div id="sudoku-board" style="display:grid;grid-template-columns:repeat(9,1fr);gap:2px;background:var(--a1);border:3px solid var(--a1);border-radius:6px;box-shadow:0 0 30px var(--a1);width:min(90vw,480px);height:min(90vw,480px);margin-bottom:14px;"></div>
  <div id="sudoku-numpad" style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:8px;"></div>
  <p id="sudoku-msg" style="color:var(--a2);min-height:22px;font-size:.95rem;letter-spacing:.05em;"></p>
</div>`;

    /* ========================================================
       3. SES GÖRSELLEŞTİRİCİSİ
       ======================================================== */
    const visualizerHTML = `
<div id="visualizer-sec" class="section ds-section" style="min-height:100vh;background:var(--bg);display:none;flex-direction:column;align-items:center;padding:20px;box-sizing:border-box;position:relative;">
  <button class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:100;cursor:pointer;" onclick="if(typeof dsGoToSection==='function') dsGoToSection('hubPage','')">◀ Ana Sayfa</button>
  <h1 style="margin-top:60px;font-size:2rem;letter-spacing:.3em;background:linear-gradient(135deg,#ff6b35,#ff00aa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">SES GÖRSELLEŞTİRİCİ</h1>
  <div style="display:flex;gap:10px;margin:12px 0;flex-wrap:wrap;justify-content:center;">
    <button id="viz-toggle-btn" onclick="viz_toggle()" style="background:linear-gradient(135deg,#ff6b35,#ff00aa);border:none;color:#fff;font-weight:700;padding:10px 24px;border-radius:8px;cursor:pointer;font-size:1rem;">🎤 BAŞLAT</button>
    <button onclick="viz_setMode('bar')" id="viz-btn-bar" style="background:var(--card);border:2px solid #ff6b35;color:#ff6b35;font-weight:700;padding:8px 18px;border-radius:8px;cursor:pointer;">BAR</button>
    <button onclick="viz_setMode('wave')" id="viz-btn-wave" style="background:var(--card);border:2px solid var(--a1);color:var(--a1);font-weight:700;padding:8px 18px;border-radius:8px;cursor:pointer;">WAVE</button>
    <button onclick="viz_setMode('circles')" id="viz-btn-circles" style="background:var(--card);border:2px solid var(--a2);color:var(--a2);font-weight:700;padding:8px 18px;border-radius:8px;cursor:pointer;">CIRCLES</button>
  </div>
  <canvas id="viz-canvas" style="width:min(95vw,900px);height:min(50vh,400px);background:#0a0a1a;border-radius:12px;border:1px solid #222;box-shadow:0 0 40px rgba(255,107,53,0.2);display:block;"></canvas>
  <p id="viz-status" style="color:var(--tx2);margin-top:10px;font-size:.9rem;">Mikrofon erişimi için BAŞLAT butonuna basın.</p>
</div>`;

    /* ========================================================
       4. ALIŞKANLIK MATRİSİ
       ======================================================== */
    const habitHTML = `
<div id="habit-matrix-sec" class="section ds-section" style="min-height:100vh;background:var(--bg);display:none;flex-direction:column;align-items:center;padding:20px;box-sizing:border-box;position:relative;">
  <button class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:100;cursor:pointer;" onclick="if(typeof dsGoToSection==='function') dsGoToSection('hubPage','')">◀ Ana Sayfa</button>
  <h1 style="margin-top:60px;font-size:2rem;letter-spacing:.3em;background:linear-gradient(135deg,#39d353,#00cfff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">ALIŞKANLIK MATRİSİ</h1>
  <div id="habit-define-area" style="display:flex;flex-direction:column;gap:8px;width:min(95vw,700px);margin:12px 0;background:var(--card);border-radius:12px;padding:16px;border:1px solid #2a2a3a;"></div>
  <div id="habit-matrix-grid-wrap" style="overflow-x:auto;width:min(95vw,900px);margin:10px 0;"></div>
  <div id="habit-stats-area" style="display:flex;gap:16px;flex-wrap:wrap;justify-content:center;margin:10px 0;width:min(95vw,700px);"></div>
</div>`;

    if (!document.getElementById('wordle-sec')) document.body.insertAdjacentHTML('beforeend', wordleHTML);
    if (!document.getElementById('sudoku-sec')) document.body.insertAdjacentHTML('beforeend', sudokuHTML);
    if (!document.getElementById('visualizer-sec')) document.body.insertAdjacentHTML('beforeend', visualizerHTML);
    if (!document.getElementById('habit-matrix-sec')) document.body.insertAdjacentHTML('beforeend', habitHTML);

  })();
} catch(e) { console.error('[new_features_a] HTML inject error:', e); }

/* ============================================================
   FEATURE 1 — WORDLE TÜRKÇE
   ============================================================ */
try {
  var wordle_WORDS = [
    'ARABA','KALEM','EVREN','TOPRAK','DENIZ',
    'BULUT','SABAH','YATAK','PENCERE','KAPAK',
    'MASA','SANDALYE','KITAP','KALEM','ELMA',
    'ARMUT','KADIN','ERKEK','COCUK','HAYAT',
    'ZAMAN','RENGI','YEŞIL','MAVI','KIRMIZI',
    'BEYAZ','SIYAH','SARKI','MUZIK','DANS',
    'ŞEKER','TATLI','ACICI','TUZLU','EKŞI',
    'TOPLU','YALNIZ','MUTLU','UZGUN','KIZGIN',
    'ŞAHIN','KARTAL','GÜVERCIN','SERÇE','LEYLEK',
    'ASLAN','KAPLAN','AYIBAL','TILKI','TAVŞAN',
    'KÖPEK','KEDİ','AT','INEK','ÖKÜZ',
    'ELMAS','ALTIN','GÜMÜŞ','DEMIR','BAKIR',
    'GÜNEŞ','YILDIZ','HILAL','BULUT','FIRTINA',
    'NEHIR','IRMAK','GÖLET','BARAJ','ŞELALE',
    'DAĞLAR','TEPE','VADI','OVALIK','BOZKIR',
    'SABUN','DILEK','ŞANS','TALIH','KADER',
    'HAYIR','EVET','BELKI','ASLA','DAIMA',
    'SINIŞ','KALIP','BIÇIM','BOYUT','ÖLÇÜ'
  ];

  // Filter to exactly 5-letter words
  wordle_WORDS = wordle_WORDS.filter(function(w){ return w.length === 5; });

  // Add guaranteed 5-letter words
  var wordle_FIVE = [
    'ARABA','KALEM','EVREN','SABAH','YATAK',
    'BULUT','ELMAS','ALTIN','GÜNEŞ','NEHIR',
    'DAĞLAR','ŞEKER','TATLI','ŞAHIN','KARTAL',
    'KÖPEK','GÜNEŞ','YILDIZ','FIRTINA','BARAJ',
    'TEPE','HAYIR','EVET','BELKI','ASLA',
    'MUTLU','UZGUN','RENGI','YEŞIL','MAVI',
    'DANS','MUZIK','ZAMAN','KADIN','ERKEK',
    'COCUK','HAYAT','BEYAZ','SIYAH','SARKI',
    'TILKI','ASLAN','KAPLAN','TOPLU','YALNIZ',
    'ELMA','MASA','DEMIR','BAKIR','HILAL'
  ];
  wordle_FIVE = wordle_FIVE.filter(function(w){ return w.length === 5; });

  var wordle_state = {
    secret: '',
    guesses: [],
    currentRow: 0,
    currentTile: 0,
    gameOver: false,
    currentInput: []
  };

  var wordle_validWords = wordle_FIVE;

  function wordle_init() {
    var pool = wordle_FIVE.length > 0 ? wordle_FIVE : ['KALEM','ARABA','EVREN','GÜNEŞ','MUTLU'];
    wordle_state.secret = pool[Math.floor(Math.random() * pool.length)];
    wordle_state.guesses = [];
    wordle_state.currentRow = 0;
    wordle_state.currentTile = 0;
    wordle_state.gameOver = false;
    wordle_state.currentInput = [];
    wordle_renderGrid();
    wordle_renderKeyboard();
    var msg = document.getElementById('wordle-msg');
    if (msg) msg.textContent = '5 harfli Türkçe kelimeyi tahmin edin!';
  }

  function wordle_renderGrid() {
    var grid = document.getElementById('wordle-grid');
    if (!grid) return;
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = 'repeat(5,1fr)';
    grid.style.gap = '6px';
    for (var r = 0; r < 6; r++) {
      for (var c = 0; c < 5; c++) {
        var tile = document.createElement('div');
        tile.id = 'wtile-' + r + '-' + c;
        tile.style.cssText = 'width:min(13vw,58px);height:min(13vw,58px);border:2px solid #333;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:clamp(1rem,4vw,1.6rem);font-weight:800;color:var(--tx);background:var(--bg2);transition:all .2s;letter-spacing:0;';
        grid.appendChild(tile);
      }
    }
    // Fill submitted guesses
    for (var gr = 0; gr < wordle_state.guesses.length; gr++) {
      wordle_colorRow(gr, wordle_state.guesses[gr], false);
    }
    // Fill current input
    for (var ci = 0; ci < wordle_state.currentInput.length; ci++) {
      var t = document.getElementById('wtile-' + wordle_state.currentRow + '-' + ci);
      if (t) { t.textContent = wordle_state.currentInput[ci]; t.style.border = '2px solid var(--a1)'; }
    }
  }

  function wordle_colorRow(row, guess, animate) {
    var secret = wordle_state.secret;
    var colors = ['#3a3a3a','#3a3a3a','#3a3a3a','#3a3a3a','#3a3a3a'];
    var secretArr = secret.split('');
    var guessArr = guess.split('');
    var used = [false,false,false,false,false];
    // Green pass
    for (var i = 0; i < 5; i++) {
      if (guessArr[i] === secretArr[i]) { colors[i] = '#538d4e'; used[i] = true; }
    }
    // Yellow pass
    for (var i = 0; i < 5; i++) {
      if (colors[i] === '#538d4e') continue;
      for (var j = 0; j < 5; j++) {
        if (!used[j] && guessArr[i] === secretArr[j]) { colors[i] = '#b59f3b'; used[j] = true; break; }
      }
    }
    for (var i = 0; i < 5; i++) {
      (function(idx, color, delay) {
        setTimeout(function() {
          var t = document.getElementById('wtile-' + row + '-' + idx);
          if (!t) return;
          t.textContent = guess[idx];
          t.style.background = color;
          t.style.border = '2px solid ' + color;
          t.style.color = '#fff';
          if (animate) {
            t.style.transform = 'rotateX(360deg)';
            t.style.transition = 'transform .4s, background .2s';
            setTimeout(function(){ t.style.transform = 'rotateX(0deg)'; }, 400);
          }
        }, animate ? idx * 120 : 0);
      })(i, colors[i], animate);
    }
    return colors;
  }

  function wordle_updateKeyboard(guess, colors) {
    for (var i = 0; i < guess.length; i++) {
      var ch = guess[i];
      var btn = document.getElementById('wkey-' + ch);
      if (!btn) continue;
      var cur = btn.dataset.color || '';
      if (colors[i] === '#538d4e') { btn.style.background = '#538d4e'; btn.dataset.color = 'green'; }
      else if (colors[i] === '#b59f3b' && cur !== 'green') { btn.style.background = '#b59f3b'; btn.dataset.color = 'yellow'; }
      else if (cur !== 'green' && cur !== 'yellow') { btn.style.background = '#3a3a3a'; btn.dataset.color = 'gray'; }
    }
  }

  function wordle_renderKeyboard() {
    var kb = document.getElementById('wordle-keyboard');
    if (!kb) return;
    kb.innerHTML = '';
    var rows = [
      ['E','R','T','Y','U','I','O','P','Ğ','Ü'],
      ['A','S','D','F','G','H','J','K','L','Ş','İ'],
      ['ENTER','Z','X','C','V','B','N','M','Ö','Ç','⌫']
    ];
    rows.forEach(function(row) {
      var rowDiv = document.createElement('div');
      rowDiv.style.cssText = 'display:flex;gap:5px;justify-content:center;';
      row.forEach(function(key) {
        var btn = document.createElement('button');
        var isSpecial = key === 'ENTER' || key === '⌫';
        btn.textContent = key;
        btn.id = isSpecial ? '' : ('wkey-' + key);
        btn.style.cssText = 'background:' + (isSpecial ? '#555' : '#444') + ';color:#fff;border:none;border-radius:5px;padding:' + (isSpecial ? '10px 8px' : '10px 0') + ';width:' + (isSpecial ? '60px' : 'min(8vw,40px)') + ';font-size:.75rem;font-weight:700;cursor:pointer;transition:background .2s;';
        btn.onclick = function() { wordle_handleKey(key); };
        rowDiv.appendChild(btn);
      });
      kb.appendChild(rowDiv);
    });
  }

  function wordle_handleKey(key) {
    if (wordle_state.gameOver) return;
    var msg = document.getElementById('wordle-msg');
    if (key === '⌫' || key === 'BACKSPACE') {
      if (wordle_state.currentInput.length > 0) {
        wordle_state.currentInput.pop();
        var col = wordle_state.currentInput.length;
        var t = document.getElementById('wtile-' + wordle_state.currentRow + '-' + col);
        if (t) { t.textContent = ''; t.style.border = '2px solid #333'; }
      }
    } else if (key === 'ENTER') {
      if (wordle_state.currentInput.length < 5) {
        if (msg) msg.textContent = '⚠️ 5 harf giriniz!';
        wordle_shakeRow(wordle_state.currentRow);
        return;
      }
      var guess = wordle_state.currentInput.join('');
      wordle_state.guesses.push(guess);
      var colors = wordle_colorRow(wordle_state.currentRow, guess, true);
      setTimeout(function() { wordle_updateKeyboard(guess, colors); }, 600);
      if (guess === wordle_state.secret) {
        setTimeout(function() {
          if (msg) msg.textContent = '🎉 Harika! Kelimeyi buldunuz!';
        }, 700);
        wordle_state.gameOver = true;
      } else if (wordle_state.currentRow >= 5) {
        setTimeout(function() {
          if (msg) msg.textContent = '😢 Kelime: ' + wordle_state.secret;
        }, 700);
        wordle_state.gameOver = true;
      } else {
        if (msg) msg.textContent = (6 - wordle_state.currentRow - 1) + ' hakkınız kaldı.';
      }
      wordle_state.currentRow++;
      wordle_state.currentInput = [];
    } else if (/^[A-ZÇŞİĞÜÖ]$/.test(key)) {
      if (wordle_state.currentInput.length < 5) {
        wordle_state.currentInput.push(key);
        var col = wordle_state.currentInput.length - 1;
        var t = document.getElementById('wtile-' + wordle_state.currentRow + '-' + col);
        if (t) {
          t.textContent = key;
          t.style.border = '2px solid var(--a1)';
          t.style.transform = 'scale(1.1)';
          setTimeout(function(){ t.style.transform = 'scale(1)'; }, 100);
        }
      }
    }
  }

  function wordle_shakeRow(row) {
    for (var c = 0; c < 5; c++) {
      var t = document.getElementById('wtile-' + row + '-' + c);
      if (!t) continue;
      (function(tile) {
        tile.style.animation = 'wordle-shake .4s';
        setTimeout(function(){ tile.style.animation = ''; }, 400);
      })(t);
    }
  }

  // Keyboard listener
  (function() {
    var style = document.createElement('style');
    style.textContent = '@keyframes wordle-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}';
    document.head.appendChild(style);
  })();

  document.addEventListener('keydown', function(e) {
    var sec = document.getElementById('wordle-sec');
    if (!sec || sec.style.display === 'none') return;
    var key = e.key.toUpperCase();
    if (key === 'BACKSPACE') { wordle_handleKey('⌫'); return; }
    if (key === 'ENTER') { wordle_handleKey('ENTER'); return; }
    var trMap = {'Ç':'Ç','Ş':'Ş','İ':'İ','Ğ':'Ğ','Ü':'Ü','Ö':'Ö'};
    if (/^[A-ZÇŞİĞÜÖ]$/.test(key)) wordle_handleKey(trMap[key] || key);
  });

  // Auto-init when section becomes visible
  (function() {
    var orig = typeof dsGoToSection === 'function' ? dsGoToSection : null;
    // Override or hook via MutationObserver
    var obs = new MutationObserver(function() {
      var sec = document.getElementById('wordle-sec');
      if (sec && sec.style.display !== 'none' && wordle_state.secret === '') {
        wordle_init();
      }
    });
    obs.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['style'] });
  })();

  wordle_init();

} catch(e) { console.error('[Wordle] Error:', e); }

/* ============================================================
   FEATURE 2 — SONSUZ SUDOKU
   ============================================================ */
try {

  var sudoku_state = {
    board: [],          // 9x9 current values (0=empty)
    solution: [],       // 9x9 full solution
    given: [],          // 9x9 boolean (is it a given/fixed cell?)
    pencil: [],         // 9x9 Set of pencil marks
    selected: null,     // {r,c}
    pencilMode: false,
    timerSec: 0,
    timerInterval: null,
    gameOver: false
  };

  function sudoku_emptyBoard() {
    return Array.from({length:9}, function(){ return new Array(9).fill(0); });
  }

  function sudoku_isValid(board, r, c, num) {
    for (var i = 0; i < 9; i++) {
      if (board[r][i] === num) return false;
      if (board[i][c] === num) return false;
    }
    var br = Math.floor(r/3)*3, bc = Math.floor(c/3)*3;
    for (var dr = 0; dr < 3; dr++)
      for (var dc = 0; dc < 3; dc++)
        if (board[br+dr][bc+dc] === num) return false;
    return true;
  }

  function sudoku_solve(board) {
    for (var r = 0; r < 9; r++) {
      for (var c = 0; c < 9; c++) {
        if (board[r][c] === 0) {
          var nums = [1,2,3,4,5,6,7,8,9].sort(function(){ return Math.random()-.5; });
          for (var ni = 0; ni < nums.length; ni++) {
            if (sudoku_isValid(board, r, c, nums[ni])) {
              board[r][c] = nums[ni];
              if (sudoku_solve(board)) return true;
              board[r][c] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  function sudoku_deepCopy(board) {
    return board.map(function(row){ return row.slice(); });
  }

  function sudoku_generatePuzzle(difficulty) {
    var sol = sudoku_emptyBoard();
    sudoku_solve(sol);
    var puzzle = sudoku_deepCopy(sol);
    var remove = {easy: 35, medium: 45, hard: 55}[difficulty] || 45;
    var cells = [];
    for (var r = 0; r < 9; r++) for (var c = 0; c < 9; c++) cells.push([r,c]);
    cells.sort(function(){ return Math.random()-.5; });
    for (var i = 0; i < remove && i < cells.length; i++) {
      puzzle[cells[i][0]][cells[i][1]] = 0;
    }
    return { puzzle: puzzle, solution: sol };
  }

  function sudoku_newGame() {
    clearInterval(sudoku_state.timerInterval);
    var diff = (document.getElementById('sudoku-diff') || {}).value || 'medium';
    var gen = sudoku_generatePuzzle(diff);
    sudoku_state.board = gen.puzzle;
    sudoku_state.solution = gen.solution;
    sudoku_state.given = gen.puzzle.map(function(row){ return row.map(function(v){ return v !== 0; }); });
    sudoku_state.pencil = Array.from({length:9}, function(){ return Array.from({length:9}, function(){ return new Set(); }); });
    sudoku_state.selected = null;
    sudoku_state.gameOver = false;
    sudoku_state.timerSec = 0;
    sudoku_updateTimerDisplay();
    sudoku_state.timerInterval = setInterval(function() {
      if (!sudoku_state.gameOver) {
        sudoku_state.timerSec++;
        sudoku_updateTimerDisplay();
      }
    }, 1000);
    sudoku_renderBoard();
    sudoku_renderNumpad();
    var msg = document.getElementById('sudoku-msg');
    if (msg) msg.textContent = '';
  }

  function sudoku_updateTimerDisplay() {
    var el = document.getElementById('sudoku-timer');
    if (!el) return;
    var m = Math.floor(sudoku_state.timerSec / 60);
    var s = sudoku_state.timerSec % 60;
    el.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  function sudoku_getConflicts() {
    var conflicts = Array.from({length:9}, function(){ return new Array(9).fill(false); });
    for (var r = 0; r < 9; r++) {
      for (var c = 0; c < 9; c++) {
        var v = sudoku_state.board[r][c];
        if (v === 0) continue;
        // Check row
        for (var i = 0; i < 9; i++) {
          if (i !== c && sudoku_state.board[r][i] === v) { conflicts[r][c] = true; conflicts[r][i] = true; }
        }
        // Check col
        for (var i = 0; i < 9; i++) {
          if (i !== r && sudoku_state.board[i][c] === v) { conflicts[r][c] = true; conflicts[i][c] = true; }
        }
        // Check box
        var br = Math.floor(r/3)*3, bc = Math.floor(c/3)*3;
        for (var dr = 0; dr < 3; dr++) {
          for (var dc = 0; dc < 3; dc++) {
            var nr = br+dr, nc = bc+dc;
            if ((nr !== r || nc !== c) && sudoku_state.board[nr][nc] === v) {
              conflicts[r][c] = true; conflicts[nr][nc] = true;
            }
          }
        }
      }
    }
    return conflicts;
  }

  function sudoku_renderBoard() {
    var boardEl = document.getElementById('sudoku-board');
    if (!boardEl) return;
    boardEl.innerHTML = '';
    var conflicts = sudoku_getConflicts();
    var sel = sudoku_state.selected;
    for (var r = 0; r < 9; r++) {
      for (var c = 0; c < 9; c++) {
        (function(row, col) {
          var cell = document.createElement('div');
          cell.style.cssText = 'display:flex;align-items:center;justify-content:center;font-size:clamp(.8rem,3vw,1.2rem);font-weight:700;cursor:pointer;position:relative;transition:background .15s;user-select:none;';
          // Box borders
          var bt = (row % 3 === 0) ? '2px solid var(--a1)' : '1px solid #2a2a3a';
          var bb = (row === 8) ? '2px solid var(--a1)' : (row % 3 === 2 ? '2px solid var(--a1)' : '1px solid #2a2a3a');
          var bl = (col % 3 === 0) ? '2px solid var(--a1)' : '1px solid #2a2a3a';
          var br2 = (col === 8) ? '2px solid var(--a1)' : (col % 3 === 2 ? '2px solid var(--a1)' : '1px solid #2a2a3a');
          cell.style.borderTop = bt;
          cell.style.borderBottom = bb;
          cell.style.borderLeft = bl;
          cell.style.borderRight = br2;

          var isSelected = sel && sel.r === row && sel.c === col;
          var isSameNum = sel && sudoku_state.board[sel.r][sel.c] !== 0 && sudoku_state.board[row][col] === sudoku_state.board[sel.r][sel.c];
          var isSameRow = sel && sel.r === row;
          var isSameCol = sel && sel.c === col;
          var isSameBox = sel && Math.floor(sel.r/3) === Math.floor(row/3) && Math.floor(sel.c/3) === Math.floor(col/3);

          if (isSelected) cell.style.background = '#1a3a6a';
          else if (isSameNum) cell.style.background = '#1a4a2a';
          else if (isSameRow || isSameCol || isSameBox) cell.style.background = '#1a1a2a';
          else cell.style.background = 'var(--bg2)';

          var val = sudoku_state.board[row][col];
          var given = sudoku_state.given[row][col];
          var hasConflict = conflicts[row][col];

          if (val !== 0) {
            cell.textContent = val;
            cell.style.color = given ? 'var(--tx)' : (hasConflict ? '#ff4444' : '#00cfff');
            if (hasConflict) cell.style.background = '#3a0a0a';
          } else {
            // Pencil marks
            var marks = sudoku_state.pencil[row][col];
            if (marks.size > 0) {
              var pGrid = document.createElement('div');
              pGrid.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);width:90%;height:90%;font-size:clamp(.4rem,1.5vw,.6rem);color:#888;';
              for (var n = 1; n <= 9; n++) {
                var pCell = document.createElement('div');
                pCell.style.cssText = 'display:flex;align-items:center;justify-content:center;';
                pCell.textContent = marks.has(n) ? n : '';
                pGrid.appendChild(pCell);
              }
              cell.appendChild(pGrid);
            }
          }

          cell.addEventListener('click', function() {
            if (!given) {
              sudoku_state.selected = { r: row, c: col };
              sudoku_renderBoard();
            } else {
              sudoku_state.selected = { r: row, c: col };
              sudoku_renderBoard();
            }
          });
          boardEl.appendChild(cell);
        })(r, c);
      }
    }
  }

  function sudoku_renderNumpad() {
    var np = document.getElementById('sudoku-numpad');
    if (!np) return;
    np.innerHTML = '';
    var nums = [1,2,3,4,5,6,7,8,9];
    nums.forEach(function(n) {
      var btn = document.createElement('button');
      btn.textContent = n;
      btn.style.cssText = 'width:44px;height:44px;background:var(--card);border:2px solid var(--a1);color:var(--a1);font-size:1.2rem;font-weight:800;border-radius:8px;cursor:pointer;transition:all .15s;';
      btn.onmouseenter = function(){ btn.style.background='var(--a1)'; btn.style.color='#000'; };
      btn.onmouseleave = function(){ btn.style.background='var(--card)'; btn.style.color='var(--a1)'; };
      btn.onclick = function() { sudoku_inputNum(n); };
      np.appendChild(btn);
    });
    var delBtn = document.createElement('button');
    delBtn.textContent = '⌫';
    delBtn.style.cssText = 'width:44px;height:44px;background:var(--card);border:2px solid var(--danger);color:var(--danger);font-size:1.2rem;font-weight:800;border-radius:8px;cursor:pointer;';
    delBtn.onclick = function() { sudoku_inputNum(0); };
    np.appendChild(delBtn);
  }

  function sudoku_inputNum(num) {
    var sel = sudoku_state.selected;
    if (!sel || sudoku_state.given[sel.r][sel.c]) return;
    if (sudoku_state.pencilMode) {
      if (num === 0) { sudoku_state.pencil[sel.r][sel.c].clear(); }
      else {
        if (sudoku_state.pencil[sel.r][sel.c].has(num)) sudoku_state.pencil[sel.r][sel.c].delete(num);
        else sudoku_state.pencil[sel.r][sel.c].add(num);
      }
    } else {
      sudoku_state.board[sel.r][sel.c] = num;
      sudoku_state.pencil[sel.r][sel.c].clear();
      sudoku_checkWin();
    }
    sudoku_renderBoard();
  }

  function sudoku_checkWin() {
    for (var r = 0; r < 9; r++)
      for (var c = 0; c < 9; c++)
        if (sudoku_state.board[r][c] !== sudoku_state.solution[r][c]) return;
    sudoku_state.gameOver = true;
    clearInterval(sudoku_state.timerInterval);
    var msg = document.getElementById('sudoku-msg');
    if (msg) msg.textContent = '🎉 Tebrikler! Sudokuyu çözdünüz!';
  }

  function sudoku_showSolution() {
    sudoku_state.board = sudoku_deepCopy(sudoku_state.solution);
    sudoku_state.gameOver = true;
    clearInterval(sudoku_state.timerInterval);
    sudoku_renderBoard();
    var msg = document.getElementById('sudoku-msg');
    if (msg) msg.textContent = 'Çözüm gösterildi.';
  }

  function sudoku_togglePencil() {
    sudoku_state.pencilMode = !sudoku_state.pencilMode;
    var btn = document.getElementById('sudoku-pencil-btn');
    if (btn) btn.textContent = '✏️ Kalem: ' + (sudoku_state.pencilMode ? 'ON' : 'OFF');
  }

  document.addEventListener('keydown', function(e) {
    var sec = document.getElementById('sudoku-sec');
    if (!sec || sec.style.display === 'none') return;
    if (e.key >= '1' && e.key <= '9') sudoku_inputNum(parseInt(e.key));
    if (e.key === 'Backspace' || e.key === 'Delete') sudoku_inputNum(0);
    if (e.key === 'ArrowUp' && sudoku_state.selected && sudoku_state.selected.r > 0) {
      sudoku_state.selected.r--; sudoku_renderBoard(); e.preventDefault();
    }
    if (e.key === 'ArrowDown' && sudoku_state.selected && sudoku_state.selected.r < 8) {
      sudoku_state.selected.r++; sudoku_renderBoard(); e.preventDefault();
    }
    if (e.key === 'ArrowLeft' && sudoku_state.selected && sudoku_state.selected.c > 0) {
      sudoku_state.selected.c--; sudoku_renderBoard(); e.preventDefault();
    }
    if (e.key === 'ArrowRight' && sudoku_state.selected && sudoku_state.selected.c < 8) {
      sudoku_state.selected.c++; sudoku_renderBoard(); e.preventDefault();
    }
  });

  // Auto-init on show
  (function() {
    var obs = new MutationObserver(function() {
      var sec = document.getElementById('sudoku-sec');
      if (sec && sec.style.display !== 'none' && sudoku_state.board.length === 0) {
        sudoku_newGame();
      }
    });
    obs.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['style'] });
  })();

  sudoku_newGame();

} catch(e) { console.error('[Sudoku] Error:', e); }

/* ============================================================
   FEATURE 3 — SES GÖRSELLEŞTİRİCİSİ
   ============================================================ */
try {

  var viz_state = {
    running: false,
    mode: 'bar',
    audioCtx: null,
    analyser: null,
    source: null,
    stream: null,
    animId: null
  };

  function viz_setMode(mode) {
    viz_state.mode = mode;
    ['bar','wave','circles'].forEach(function(m) {
      var btn = document.getElementById('viz-btn-' + m);
      if (btn) btn.style.opacity = (m === mode) ? '1' : '0.5';
    });
    // Clear canvas
    var canvas = document.getElementById('viz-canvas');
    if (canvas) {
      var ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  function viz_toggle() {
    if (viz_state.running) {
      viz_stop();
    } else {
      viz_start();
    }
  }

  function viz_start() {
    var status = document.getElementById('viz-status');
    var toggleBtn = document.getElementById('viz-toggle-btn');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (status) status.textContent = '❌ Tarayıcınız mikrofon erişimini desteklemiyor.';
      return;
    }
    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      .then(function(stream) {
        viz_state.stream = stream;
        viz_state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        viz_state.analyser = viz_state.audioCtx.createAnalyser();
        viz_state.analyser.fftSize = 256;
        viz_state.source = viz_state.audioCtx.createMediaStreamSource(stream);
        viz_state.source.connect(viz_state.analyser);
        viz_state.running = true;
        if (toggleBtn) { toggleBtn.textContent = '⏹ DURDUR'; toggleBtn.style.background = 'linear-gradient(135deg,#ff4444,#aa0000)'; }
        if (status) status.textContent = '🎤 Mikrofon aktif — ses algılanıyor...';
        viz_setupCanvas();
        viz_draw();
      })
      .catch(function(err) {
        if (status) status.textContent = '❌ Mikrofon erişimi reddedildi: ' + err.message;
      });
  }

  function viz_stop() {
    if (viz_state.animId) cancelAnimationFrame(viz_state.animId);
    if (viz_state.stream) viz_state.stream.getTracks().forEach(function(t){ t.stop(); });
    if (viz_state.audioCtx) viz_state.audioCtx.close();
    viz_state.running = false;
    viz_state.audioCtx = null;
    viz_state.analyser = null;
    viz_state.source = null;
    viz_state.stream = null;
    var toggleBtn = document.getElementById('viz-toggle-btn');
    var status = document.getElementById('viz-status');
    if (toggleBtn) { toggleBtn.textContent = '🎤 BAŞLAT'; toggleBtn.style.background = 'linear-gradient(135deg,#ff6b35,#ff00aa)'; }
    if (status) status.textContent = 'Durduruldu.';
    // Clear canvas
    var canvas = document.getElementById('viz-canvas');
    if (canvas) {
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  function viz_setupCanvas() {
    var canvas = document.getElementById('viz-canvas');
    if (!canvas) return;
    var rect = canvas.getBoundingClientRect();
    canvas.width = rect.width || 900;
    canvas.height = rect.height || 400;
  }

  function viz_draw() {
    if (!viz_state.running) return;
    var canvas = document.getElementById('viz-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height;
    var analyser = viz_state.analyser;
    var bufLen = analyser.frequencyBinCount;
    var dataArr = new Uint8Array(bufLen);

    if (viz_state.mode === 'bar') {
      analyser.getByteFrequencyData(dataArr);
      ctx.fillStyle = 'rgba(10,10,26,0.3)';
      ctx.fillRect(0, 0, W, H);
      var bw = W / bufLen;
      for (var i = 0; i < bufLen; i++) {
        var bh = (dataArr[i] / 255) * H;
        var hue = (i / bufLen) * 300 + 120;
        ctx.fillStyle = 'hsl(' + hue + ',100%,55%)';
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'hsl(' + hue + ',100%,55%)';
        ctx.fillRect(i * bw, H - bh, bw - 1, bh);
      }
      ctx.shadowBlur = 0;
    } else if (viz_state.mode === 'wave') {
      analyser.getByteTimeDomainData(dataArr);
      ctx.fillStyle = 'rgba(10,10,26,0.4)';
      ctx.fillRect(0, 0, W, H);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#00ff88';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00ff88';
      ctx.beginPath();
      var sliceW = W / bufLen;
      var x = 0;
      for (var i = 0; i < bufLen; i++) {
        var v = dataArr[i] / 128;
        var y = (v * H) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceW;
      }
      ctx.lineTo(W, H / 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else if (viz_state.mode === 'circles') {
      analyser.getByteFrequencyData(dataArr);
      ctx.fillStyle = 'rgba(10,10,26,0.2)';
      ctx.fillRect(0, 0, W, H);
      var avg = 0;
      for (var i = 0; i < bufLen; i++) avg += dataArr[i];
      avg /= bufLen;
      var cx = W / 2, cy = H / 2;
      var numCircles = 6;
      for (var ci = 0; ci < numCircles; ci++) {
        var idx = Math.floor((ci / numCircles) * bufLen);
        var val = dataArr[idx] / 255;
        var radius = 20 + ci * (Math.min(W, H) / (numCircles * 2.2)) + val * 60;
        var hue = (ci * 60 + Date.now() * 0.05) % 360;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'hsla(' + hue + ',100%,60%,' + (0.8 - ci * 0.1) + ')';
        ctx.lineWidth = 2 + val * 4;
        ctx.shadowBlur = 20 + val * 30;
        ctx.shadowColor = 'hsl(' + hue + ',100%,60%)';
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
    }

    viz_state.animId = requestAnimationFrame(viz_draw);
  }

  viz_setMode('bar');

} catch(e) { console.error('[Visualizer] Error:', e); }

/* ============================================================
   FEATURE 4 — ALIŞKANLIK MATRİSİ
   ============================================================ */
try {

  var habit_STORAGE_KEY = 'ds_habit_matrix';

  var habit_state = {
    habits: [],     // [{id, name, color}]
    data: {}        // { 'YYYY-MM-DD': Set of habit ids completed }
  };

  function habit_load() {
    try {
      var raw = localStorage.getItem(habit_STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        habit_state.habits = parsed.habits || [];
        // Convert arrays back to objects keyed by date with counts
        habit_state.data = {};
        var savedData = parsed.data || {};
        Object.keys(savedData).forEach(function(date) {
          habit_state.data[date] = new Set(savedData[date]);
        });
      }
    } catch(ex) {}
    if (habit_state.habits.length === 0) {
      habit_state.habits = [
        { id: 'h1', name: 'Egzersiz', color: '#39d353' },
        { id: 'h2', name: 'Kitap Okuma', color: '#00cfff' },
        { id: 'h3', name: 'Meditasyon', color: '#bf00ff' }
      ];
    }
  }

  function habit_save() {
    try {
      var toSave = { habits: habit_state.habits, data: {} };
      Object.keys(habit_state.data).forEach(function(date) {
        toSave.data[date] = Array.from(habit_state.data[date]);
      });
      localStorage.setItem(habit_STORAGE_KEY, JSON.stringify(toSave));
    } catch(ex) {}
  }

  function habit_dateStr(d) {
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  }

  function habit_getIntensity(date) {
    var set = habit_state.data[date];
    if (!set || set.size === 0) return 0;
    return set.size;
  }

  function habit_intensityColor(count, maxCount) {
    if (count === 0) return '#161b22';
    var ratio = count / maxCount;
    if (ratio <= 0.33) return '#0e4429';
    if (ratio <= 0.66) return '#26a641';
    return '#39d353';
  }

  function habit_render() {
    habit_renderDefineArea();
    habit_renderGrid();
    habit_renderStats();
  }

  function habit_renderDefineArea() {
    var area = document.getElementById('habit-define-area');
    if (!area) return;
    area.innerHTML = '';

    var title = document.createElement('div');
    title.style.cssText = 'font-weight:700;font-size:1rem;color:var(--tx);margin-bottom:8px;';
    title.textContent = '📋 Alışkanlıklarım (' + habit_state.habits.length + '/5)';
    area.appendChild(title);

    var habitsList = document.createElement('div');
    habitsList.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px;';
    habit_state.habits.forEach(function(h) {
      var tag = document.createElement('div');
      tag.style.cssText = 'display:flex;align-items:center;gap:6px;background:#1a1a2a;border:1px solid ' + h.color + ';border-radius:20px;padding:4px 12px;';
      var dot = document.createElement('div');
      dot.style.cssText = 'width:10px;height:10px;border-radius:50%;background:' + h.color + ';';
      var name = document.createElement('span');
      name.style.cssText = 'color:var(--tx);font-size:.9rem;';
      name.textContent = h.name;
      var del = document.createElement('button');
      del.textContent = '×';
      del.style.cssText = 'background:none;border:none;color:#888;cursor:pointer;font-size:1rem;padding:0 2px;';
      del.onclick = (function(id) {
        return function() {
          habit_state.habits = habit_state.habits.filter(function(x){ return x.id !== id; });
          // Remove from data
          Object.keys(habit_state.data).forEach(function(date) {
            habit_state.data[date].delete(id);
          });
          habit_save();
          habit_render();
        };
      })(h.id);
      tag.appendChild(dot);
      tag.appendChild(name);
      tag.appendChild(del);
      habitsList.appendChild(tag);
    });
    area.appendChild(habitsList);

    if (habit_state.habits.length < 5) {
      var addRow = document.createElement('div');
      addRow.style.cssText = 'display:flex;gap:8px;align-items:center;flex-wrap:wrap;';
      var inp = document.createElement('input');
      inp.id = 'habit-new-name';
      inp.placeholder = 'Yeni alışkanlık adı...';
      inp.style.cssText = 'background:#1a1a2a;border:1px solid var(--a1);color:var(--tx);border-radius:6px;padding:6px 12px;flex:1;min-width:160px;font-size:.9rem;';
      var colors = ['#39d353','#00cfff','#bf00ff','#ff6b35','#ff00aa'];
      var colorSel = document.createElement('select');
      colorSel.id = 'habit-new-color';
      colorSel.style.cssText = 'background:#1a1a2a;border:1px solid var(--a1);color:var(--tx);border-radius:6px;padding:6px;';
      colors.forEach(function(c, i) {
        var opt = document.createElement('option');
        opt.value = c;
        opt.textContent = ['Yeşil','Mavi','Mor','Turuncu','Pembe'][i];
        colorSel.appendChild(opt);
      });
      var addBtn = document.createElement('button');
      addBtn.textContent = '+ Ekle';
      addBtn.style.cssText = 'background:linear-gradient(135deg,#39d353,#00cfff);border:none;color:#000;font-weight:700;padding:6px 16px;border-radius:6px;cursor:pointer;';
      addBtn.onclick = function() {
        var name = (document.getElementById('habit-new-name') || {}).value || '';
        name = name.trim();
        if (!name) return;
        var color = (document.getElementById('habit-new-color') || {}).value || '#39d353';
        habit_state.habits.push({ id: 'h' + Date.now(), name: name, color: color });
        habit_save();
        habit_render();
      };
      addRow.appendChild(inp);
      addRow.appendChild(colorSel);
      addRow.appendChild(addBtn);
      area.appendChild(addRow);
    }
  }

  function habit_renderGrid() {
    var wrap = document.getElementById('habit-matrix-grid-wrap');
    if (!wrap) return;
    wrap.innerHTML = '';

    var today = new Date();
    today.setHours(0,0,0,0);

    // Build 52 weeks x 7 days grid (364 days back from today)
    var days = [];
    for (var i = 363; i >= 0; i--) {
      var d = new Date(today);
      d.setDate(d.getDate() - i);
      days.push(d);
    }

    var maxHabits = Math.max(habit_state.habits.length, 1);

    // Month labels
    var months = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
    var monthLabelRow = document.createElement('div');
    monthLabelRow.style.cssText = 'display:flex;gap:3px;padding-left:20px;margin-bottom:2px;';
    var lastMonth = -1;
    for (var w = 0; w < 52; w++) {
      var dayIdx = w * 7;
      if (dayIdx >= days.length) break;
      var d = days[dayIdx];
      var lbl = document.createElement('div');
      lbl.style.cssText = 'width:12px;font-size:.55rem;color:#888;text-align:center;';
      if (d.getMonth() !== lastMonth) {
        lbl.textContent = months[d.getMonth()];
        lastMonth = d.getMonth();
        lbl.style.width = '24px';
      }
      monthLabelRow.appendChild(lbl);
    }
    wrap.appendChild(monthLabelRow);

    var gridWrap = document.createElement('div');
    gridWrap.style.cssText = 'display:flex;gap:3px;';

    // Day labels
    var dayLabels = document.createElement('div');
    dayLabels.style.cssText = 'display:flex;flex-direction:column;gap:2px;margin-right:4px;';
    ['Pzt','','Çar','','Cum','','Paz'].forEach(function(dl) {
      var l = document.createElement('div');
      l.style.cssText = 'width:20px;height:12px;font-size:.55rem;color:#888;display:flex;align-items:center;';
      l.textContent = dl;
      dayLabels.appendChild(l);
    });
    gridWrap.appendChild(dayLabels);

    // Weeks
    for (var w = 0; w < 52; w++) {
      var col = document.createElement('div');
      col.style.cssText = 'display:flex;flex-direction:column;gap:2px;';
      for (var d2 = 0; d2 < 7; d2++) {
        var dayIdx2 = w * 7 + d2;
        if (dayIdx2 >= days.length) { break; }
        (function(day) {
          var dateStr = habit_dateStr(day);
          var count = habit_getIntensity(dateStr);
          var cell = document.createElement('div');
          cell.title = dateStr + ': ' + count + ' alışkanlık';
          cell.style.cssText = 'width:12px;height:12px;border-radius:2px;cursor:pointer;transition:transform .1s,box-shadow .1s;background:' + habit_intensityColor(count, maxHabits) + ';';

          var isFuture = day > today;
          if (isFuture) { cell.style.opacity = '0.3'; cell.style.cursor = 'default'; }

          cell.onmouseenter = function() {
            if (!isFuture) { cell.style.transform = 'scale(1.4)'; cell.style.boxShadow = '0 0 6px #39d353'; cell.style.zIndex='10'; }
          };
          cell.onmouseleave = function() { cell.style.transform = ''; cell.style.boxShadow = ''; cell.style.zIndex=''; };

          if (!isFuture) {
            cell.onclick = function() {
              habit_showDayModal(dateStr, cell, maxHabits);
            };
          }
          col.appendChild(cell);
        })(days[w * 7 + d2]);
      }
      gridWrap.appendChild(col);
    }
    wrap.appendChild(gridWrap);

    // Legend
    var legend = document.createElement('div');
    legend.style.cssText = 'display:flex;align-items:center;gap:6px;margin-top:8px;font-size:.75rem;color:#888;';
    legend.innerHTML = 'Az ' +
      '<div style="width:12px;height:12px;border-radius:2px;background:#161b22;display:inline-block;"></div>' +
      '<div style="width:12px;height:12px;border-radius:2px;background:#0e4429;display:inline-block;"></div>' +
      '<div style="width:12px;height:12px;border-radius:2px;background:#26a641;display:inline-block;"></div>' +
      '<div style="width:12px;height:12px;border-radius:2px;background:#39d353;display:inline-block;"></div>' +
      ' Çok';
    wrap.appendChild(legend);
  }

  function habit_showDayModal(dateStr, anchorCell, maxHabits) {
    // Remove existing modal
    var existing = document.getElementById('habit-day-modal');
    if (existing) existing.remove();

    var modal = document.createElement('div');
    modal.id = 'habit-day-modal';
    modal.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#12121f;border:1px solid var(--a1);border-radius:12px;padding:20px;z-index:9999;min-width:240px;box-shadow:0 0 30px rgba(0,207,255,0.4);';

    var title = document.createElement('div');
    title.style.cssText = 'font-weight:700;color:var(--tx);margin-bottom:12px;font-size:.95rem;';
    title.textContent = '📅 ' + dateStr;
    modal.appendChild(title);

    if (habit_state.habits.length === 0) {
      var noH = document.createElement('div');
      noH.style.color = 'var(--tx2)';
      noH.textContent = 'Önce alışkanlık ekleyin.';
      modal.appendChild(noH);
    } else {
      if (!habit_state.data[dateStr]) habit_state.data[dateStr] = new Set();
      habit_state.habits.forEach(function(h) {
        var row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:8px;cursor:pointer;';
        var cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = habit_state.data[dateStr].has(h.id);
        cb.style.width = '18px'; cb.style.height = '18px'; cb.style.cursor = 'pointer';
        var lbl = document.createElement('label');
        lbl.style.cssText = 'color:' + h.color + ';font-size:.9rem;cursor:pointer;display:flex;align-items:center;gap:6px;';
        var dot = document.createElement('div');
        dot.style.cssText = 'width:10px;height:10px;border-radius:50%;background:' + h.color + ';';
        lbl.appendChild(dot);
        lbl.appendChild(document.createTextNode(h.name));
        cb.onchange = function() {
          if (cb.checked) habit_state.data[dateStr].add(h.id);
          else habit_state.data[dateStr].delete(h.id);
          if (habit_state.data[dateStr].size === 0) delete habit_state.data[dateStr];
          habit_save();
          habit_renderGrid();
          habit_renderStats();
          // Update cell color
          var count = habit_getIntensity(dateStr);
          anchorCell.style.background = habit_intensityColor(count, maxHabits);
        };
        row.appendChild(cb);
        row.appendChild(lbl);
        modal.appendChild(row);
      });
    }

    var closeBtn = document.createElement('button');
    closeBtn.textContent = 'Kapat';
    closeBtn.style.cssText = 'margin-top:12px;background:var(--card);border:1px solid var(--a1);color:var(--tx);padding:6px 18px;border-radius:6px;cursor:pointer;width:100%;';
    closeBtn.onclick = function() { modal.remove(); };
    modal.appendChild(closeBtn);

    document.body.appendChild(modal);

    // Click outside to close
    setTimeout(function() {
      document.addEventListener('click', function handler(e) {
        if (!modal.contains(e.target)) { modal.remove(); document.removeEventListener('click', handler); }
      });
    }, 50);
  }

  function habit_renderStats() {
    var area = document.getElementById('habit-stats-area');
    if (!area) return;
    area.innerHTML = '';

    var today = new Date();
    today.setHours(0,0,0,0);

    habit_state.habits.forEach(function(h) {
      // Streak
      var streak = 0;
      var d = new Date(today);
      while (true) {
        var ds = habit_dateStr(d);
        if (habit_state.data[ds] && habit_state.data[ds].has(h.id)) { streak++; d.setDate(d.getDate()-1); }
        else break;
      }
      // Total
      var total = 0;
      Object.keys(habit_state.data).forEach(function(date) {
        if (habit_state.data[date].has(h.id)) total++;
      });

      var card = document.createElement('div');
      card.style.cssText = 'background:#12121f;border:1px solid ' + h.color + ';border-radius:10px;padding:12px 16px;text-align:center;min-width:130px;';
      card.innerHTML =
        '<div style="width:12px;height:12px;border-radius:50%;background:' + h.color + ';margin:0 auto 6px;"></div>' +
        '<div style="color:' + h.color + ';font-weight:700;font-size:.85rem;margin-bottom:6px;">' + h.name + '</div>' +
        '<div style="color:var(--tx);font-size:1.4rem;font-weight:800;">' + streak + ' 🔥</div>' +
        '<div style="color:var(--tx2);font-size:.7rem;margin-bottom:4px;">Seri</div>' +
        '<div style="color:var(--tx);font-size:.9rem;font-weight:600;">' + total + ' gün</div>' +
        '<div style="color:var(--tx2);font-size:.7rem;">Toplam</div>';
      area.appendChild(card);
    });

    if (habit_state.habits.length === 0) {
      area.innerHTML = '<div style="color:var(--tx2);font-size:.9rem;">Alışkanlık ekleyin ve takip etmeye başlayın!</div>';
    }
  }

  // Auto-init when section becomes visible
  (function() {
    habit_load();
    var obs = new MutationObserver(function() {
      var sec = document.getElementById('habit-matrix-sec');
      if (sec && sec.style.display !== 'none') {
        habit_render();
      }
    });
    obs.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['style'] });
  })();

} catch(e) { console.error('[HabitMatrix] Error:', e); }
