#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Surgical fix: replace broken new game sections in index.html with correct UTF-8.
"""
import os, sys

BASE = os.path.dirname(os.path.abspath(__file__))
HTML_FILE = os.path.join(BASE, 'index.html')

with open(HTML_FILE, 'rb') as f:
    raw = f.read()

# Strip BOM
if raw[:3] == b'\xef\xbb\xbf':
    raw = raw[3:]
    print("Stripped BOM")

# Find cut points
mandala_marker = b'id="mandala-sec"'
footer_marker = b'<footer class="footer">'

m_pos = raw.find(mandala_marker)
f_pos = raw.find(footer_marker)
print(f"mandala-sec byte: {m_pos}, footer byte: {f_pos}")

if m_pos < 0 or f_pos < 0:
    print("ERROR: Markers not found!")
    sys.exit(1)

# Walk back to find <section or <!-- before mandala
search_zone = raw[m_pos-600:m_pos]
sec_pos = search_zone.rfind(b'<section')
cmt_pos = search_zone.rfind(b'<!--')
cut_relative = max(sec_pos, cmt_pos)
if cut_relative < 0:
    cut_relative = search_zone.rfind(b'\n\n')
cut_pos = m_pos - 600 + cut_relative
print(f"Cut at byte: {cut_pos}, before ends: {repr(raw[cut_pos-30:cut_pos])}")

before = raw[:cut_pos]
after = raw[f_pos:]

# Correct sections as Python unicode string (file saved as UTF-8 so this works)
SECTIONS = """
<!-- ======================================================
     MANDALA BOYAMA
======================================================= -->
<section class="section ds-section" id="mandala-sec">
  <div class="section-header" style="position:relative">
    <button class="fav-btn" data-id="mandala-sec" title="Favorilere ekle">&#x1F90D;</button>
    <div class="section-badge">&#x1F338; Yaratıcılık</div>
    <h2 class="section-title">Mandala Boyama</h2>
    <p class="section-sub">Simetrik mandala çiz — 4/6/8/12 eksen, neon glow, PNG indir</p>
  </div>
  <div class="canvas-section" style="display:flex;flex-direction:column;align-items:center;gap:1rem">
    <div class="mandala-toolbar">
      <div class="mandala-group">
        <label>Eksen Sayısı</label>
        <div class="mandala-axes-wrap">
          <button class="mandala-axis-btn active" data-axes="4">4</button>
          <button class="mandala-axis-btn" data-axes="6">6</button>
          <button class="mandala-axis-btn" data-axes="8">8</button>
          <button class="mandala-axis-btn" data-axes="12">12</button>
        </div>
      </div>
      <div class="mandala-group">
        <label>Renk</label>
        <div style="display:flex;align-items:center;gap:6px">
          <div class="mandala-color-swatches">
            <div class="m-swatch active" style="background:#7c4dff" data-col="#7c4dff"></div>
            <div class="m-swatch" style="background:#ff6b9d" data-col="#ff6b9d"></div>
            <div class="m-swatch" style="background:#00e5ff" data-col="#00e5ff"></div>
            <div class="m-swatch" style="background:#69f0ae" data-col="#69f0ae"></div>
            <div class="m-swatch" style="background:#ffea00" data-col="#ffea00"></div>
            <div class="m-swatch" style="background:#ff7043" data-col="#ff7043"></div>
            <div class="m-swatch" style="background:#fff" data-col="#ffffff"></div>
          </div>
          <input type="color" id="mandalaColor" value="#7c4dff" style="width:26px;height:26px;border:none;border-radius:50%;cursor:pointer;padding:0;background:none">
        </div>
      </div>
      <div class="mandala-group">
        <label>Fırça: <span id="mandalaBrushVal">4px</span></label>
        <input type="range" id="mandalaBrush" min="1" max="40" value="4" class="brush-slider" style="width:110px">
      </div>
      <div class="mandala-group">
        <label>Neon Glow</label>
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer">
          <input type="checkbox" id="mandalaGlow" checked style="width:18px;height:18px;accent-color:#7c4dff">
          <span style="font-size:.8rem;color:var(--tx2)">Aktif</span>
        </label>
      </div>
      <div class="mandala-group">
        <label>&nbsp;</label>
        <div style="display:flex;gap:6px">
          <button class="mini-btn" id="mandalaClear">&#x1F5D1; Temizle</button>
          <button class="mini-btn" id="mandalaDownload" style="border-color:var(--a4);color:var(--a4)">&#x2B07; PNG İndir</button>
        </div>
      </div>
    </div>
    <div class="mandala-wrap" style="width:100%;max-width:700px">
      <canvas id="mandalaCanvas" width="700" height="700" style="display:block;width:100%;cursor:crosshair;touch-action:none;background:#07080f"></canvas>
    </div>
  </div>
</section>

<!-- ======================================================
     BEAT MAKINESI
======================================================= -->
<section class="section ds-section" id="beat-sec">
  <div class="section-header" style="position:relative">
    <button class="fav-btn" data-id="beat-sec" title="Favorilere ekle">&#x1F90D;</button>
    <div class="section-badge">&#x1F941; Müzik</div>
    <h2 class="section-title">Beat Makinesi</h2>
    <p class="section-sub">8 kanal &bull; 16 adım &bull; BPM 60&ndash;180 &bull; Web Audio API sentezi</p>
  </div>
  <div class="beat-container" style="max-width:960px;margin:0 auto">
    <div class="beat-header-row">
      <div class="beat-bpm-wrap">
        <span style="font-size:.75rem;color:var(--tx3);text-transform:uppercase;letter-spacing:1px">BPM</span>
        <span class="beat-bpm-display" id="beatBpm">120</span>
        <input type="range" id="beatBpmSlider" class="beat-bpm-slider" min="60" max="180" value="120">
      </div>
      <button class="play-btn" id="beatPlayBtn" style="width:auto;padding:10px 28px;margin:0">&#x25B6; Oynat</button>
      <button class="mini-btn" id="beatClearBtn">&#x1F5D1; Temizle</button>
      <button class="mini-btn" id="beatRandomBtn" style="border-color:var(--a5);color:var(--a5)">&#x1F3B2; Rastgele</button>
    </div>
    <div id="beatGrid" class="beat-container"></div>
  </div>
</section>

<!-- ======================================================
     FRAKTAL GEZGINI
======================================================= -->
<section class="section ds-section" id="fractal-sec">
  <div class="section-header" style="position:relative">
    <button class="fav-btn" data-id="fractal-sec" title="Favorilere ekle">&#x1F90D;</button>
    <div class="section-badge">&#x1F52D; Keşif</div>
    <h2 class="section-title">Fraktal Gezgini</h2>
    <p class="section-sub">Mandelbrot seti &bull; Scroll zoom &amp; sürükle &bull; 3 renk teması &bull; Rastgele ilginç noktalara uçuş</p>
  </div>
  <div style="max-width:960px;margin:0 auto;display:flex;flex-direction:column;gap:1rem">
    <div class="fractal-controls">
      <button class="fractal-theme-btn active" id="fractalThemeNeon">&#x1F308; Neon</button>
      <button class="fractal-theme-btn" id="fractalThemeInferno">&#x1F525; Inferno</button>
      <button class="fractal-theme-btn" id="fractalThemeOcean">&#x1F30A; Okyanus</button>
      <div style="flex:1"></div>
      <button class="mini-btn" id="fractalRandom" style="border-color:var(--a5);color:var(--a5)">&#x1F3B2; Rastgele Keşfet</button>
      <button class="mini-btn" id="fractalReset">&#x21A9; Sıfırla</button>
    </div>
    <div class="fractal-wrap" style="position:relative">
      <canvas id="fractalCanvas" width="900" height="500" style="display:block;width:100%;cursor:grab;touch-action:none"></canvas>
      <div class="fractal-info" id="fractalInfo">Re: -0.5 | Im: 0 | Zoom: 1&times;</div>
    </div>
    <p style="font-size:.75rem;color:var(--tx3);text-align:center">Scroll: Zoom &bull; Sürükle: Pan &bull; Dokunmatik destekli</p>
  </div>
</section>

<!-- ======================================================
     NEON SUDOKU
======================================================= -->
<section class="section ds-section" id="sudoku-sec">
  <div class="section-header" style="position:relative">
    <button class="fav-btn" data-id="sudoku-sec" title="Favorilere ekle">&#x1F90D;</button>
    <div class="section-badge">&#x1F522; Zeka</div>
    <h2 class="section-title">Neon Sudoku</h2>
    <p class="section-sub">Kolay &bull; Orta &bull; Zor &bull; Backtracking çözücü &bull; Kırmızı flaş hata animasyonu</p>
  </div>
  <div class="sudoku-layout">
    <div class="sudoku-board-wrap">
      <div id="sudokuGrid" class="sudoku-grid"></div>
      <div class="sudoku-numpad">
        <button class="sudoku-num-btn" id="sudokuNum1">1</button>
        <button class="sudoku-num-btn" id="sudokuNum2">2</button>
        <button class="sudoku-num-btn" id="sudokuNum3">3</button>
        <button class="sudoku-num-btn" id="sudokuNum4">4</button>
        <button class="sudoku-num-btn" id="sudokuNum5">5</button>
        <button class="sudoku-num-btn" id="sudokuNum6">6</button>
        <button class="sudoku-num-btn" id="sudokuNum7">7</button>
        <button class="sudoku-num-btn" id="sudokuNum8">8</button>
        <button class="sudoku-num-btn" id="sudokuNum9">9</button>
        <button class="sudoku-num-btn sudoku-erase-btn" id="sudokuErase">&times;</button>
      </div>
    </div>
    <div class="sudoku-side">
      <div class="sudoku-stats-box">
        <div class="sudoku-stat"><span>Süre</span><strong id="sudokuTimer">00:00</strong></div>
        <div class="sudoku-stat"><span>Hata</span><strong id="sudokuMistakes">0</strong></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:5px">
        <p style="font-size:.72rem;color:var(--tx3);text-transform:uppercase;letter-spacing:1px;margin-bottom:3px">Zorluk</p>
        <div class="sudoku-diff-btns">
          <button class="sudoku-diff-btn active" id="sudokuEasy">&#x1F60A; Kolay</button>
          <button class="sudoku-diff-btn" id="sudokuMedium">&#x1F610; Orta</button>
          <button class="sudoku-diff-btn" id="sudokuHard">&#x1F608; Zor</button>
        </div>
      </div>
      <button class="play-btn" id="sudokuNewGame" style="margin:0">&#x25B6; Yeni Oyun</button>
      <button class="mini-btn" id="sudokuSolve" style="text-align:center">&#x1F916; Çöz</button>
    </div>
  </div>
</section>

<!-- ======================================================
     KELIME ZINCIRI
======================================================= -->
<section class="section ds-section" id="kelimezinciri-sec">
  <div class="section-header" style="position:relative">
    <button class="fav-btn" data-id="kelimezinciri-sec" title="Favorilere ekle">&#x1F90D;</button>
    <div class="section-badge">&#x26D3;&#xFE0F; Kelime</div>
    <h2 class="section-title">Kelime Zinciri</h2>
    <p class="section-sub">Türkçe kelime bankası ile AI rakibi &bull; Son harfle zincir &bull; Neon bubble animasyonları</p>
  </div>
  <div class="wz-game-layout">
    <div class="wz-stats-row">
      <div class="wz-stat-card">
        <div class="wz-stat-num" id="wzScore">0</div>
        <div class="wz-stat-lbl">Puan</div>
      </div>
      <div class="wz-stat-card">
        <div class="wz-stat-num" id="wzBest">0</div>
        <div class="wz-stat-lbl">En İyi</div>
      </div>
      <div class="wz-stat-card">
        <div class="wz-stat-num" id="wzWords">0</div>
        <div class="wz-stat-lbl">Kelime</div>
      </div>
    </div>
    <div class="wz-timer-wrap">
      <div style="display:flex;justify-content:space-between;font-size:.78rem;color:var(--tx2)">
        <span id="wzStatus">&#x1F7E2; Yeni oyun başlat!</span>
        <span>&#x23F1; <strong id="wzTimer" style="color:var(--a3)">10</strong>s</span>
      </div>
      <div class="wz-timer-bar-bg"><div class="wz-timer-bar" id="wzTimerBar"></div></div>
    </div>
    <div class="wz-chain-wrap" id="wzChain">
      <span style="color:var(--tx3);font-size:.83rem;align-self:center;margin:auto">Zincir buraya gelecek...</span>
    </div>
    <div class="wz-input-row">
      <input type="text" id="wzInput" class="wz-input" placeholder="Kelime gir (Türkçe)..." disabled>
      <button class="play-btn" id="wzSubmit" style="width:auto;padding:12px 24px;margin:0" disabled>Gönder</button>
    </div>
    <button class="play-btn" id="wzNewGame" style="margin:0;background:linear-gradient(135deg,var(--a3),var(--a4));color:#000">&#x25B6; Oyunu Başlat</button>
  </div>
</section>

<!-- ======================================================
     ISIKLARI KAPAT
======================================================= -->
<section class="section ds-section" id="lightsout-sec">
  <div class="section-header" style="position:relative">
    <button class="fav-btn" data-id="lightsout-sec" title="Favorilere ekle">&#x1F90D;</button>
    <div class="section-badge">&#x1F4A1; Mantık</div>
    <h2 class="section-title">Işıkları Kapat</h2>
    <p class="section-sub">5&times;5 ızgara &bull; Tıkla: hücre + komşuları değiştir &bull; Tüm ışıkları söndür</p>
  </div>
  <div class="lo-game">
    <div class="lo-diff-btns">
      <button class="lo-diff-btn active" id="loEasy">&#x1F60A; Kolay (5 adım)</button>
      <button class="lo-diff-btn" id="loMedium">&#x1F610; Orta (10 adım)</button>
      <button class="lo-diff-btn" id="loHard">&#x1F608; Zor (15 adım)</button>
    </div>
    <div class="lo-stats-row">
      <span>Hamle: <strong id="loMoves">0</strong></span>
      <span>Hedef: <strong id="loTarget">5</strong></span>
      <span>Süre: <strong id="loTimer">00:00</strong></span>
    </div>
    <div class="lo-grid" id="lightsOutGrid"></div>
    <button class="play-btn" id="loNewGame" style="width:auto;padding:12px 32px">&#x25B6; Yeni Oyun</button>
  </div>
</section>

<!-- ======================================================
     KOZMIK KELIME (WORDLE)
======================================================= -->
<section class="section ds-section" id="wordle-sec">
  <div class="section-header" style="position:relative">
    <button class="fav-btn" data-id="wordle-sec" title="Favorilere ekle">&#x1F90D;</button>
    <div class="section-badge">&#x1F7E9; Tahmin</div>
    <h2 class="section-title">Kozmik Kelime</h2>
    <p class="section-sub">5 harfli Türkçe kelimeyi 6 tahminde bul &bull; 3D flip animasyonu &bull; Seri takibi</p>
  </div>
  <div class="wordle-layout">
    <div style="display:flex;align-items:center;gap:1.5rem;flex-wrap:wrap;justify-content:center">
      <div style="text-align:center">
        <span class="wordle-streak" id="wordleStreak">&#x1F525; Seri: 0</span>
      </div>
      <button class="mini-btn" id="wordleNewGame">&#x25B6; Yeni Oyun</button>
    </div>
    <div class="wordle-status" id="wordleStatus">5 harfli bir Türkçe kelime tahmin et!</div>
    <div class="wordle-board" id="wordleGrid"></div>
    <div class="wordle-keyboard" id="wordleKeyboard"></div>
  </div>
</section>

<!-- ======================================================
     NEON RITIM
======================================================= -->
<section class="section ds-section" id="neonritim-sec">
  <div class="section-header" style="position:relative">
    <button class="fav-btn" data-id="neonritim-sec" title="Favorilere ekle">&#x1F90D;</button>
    <div class="section-badge">&#x1F3B5; Ritim</div>
    <h2 class="section-title">Neon Ritim</h2>
    <p class="section-sub">4 sütun D&middot;F&middot;J&middot;K &bull; PERFECT/GOOD/OK hassasiyet &bull; Combo çarpanı &bull; Müzik ile</p>
  </div>
  <div class="ritim-layout">
    <div class="ritim-header">
      <div class="ritim-stat">
        <span class="ritim-stat-num" id="ritimScore">0</span>
        <span class="ritim-stat-lbl">Skor</span>
      </div>
      <div class="ritim-stat">
        <span class="ritim-stat-num" id="ritimCombo">0</span>
        <span class="ritim-stat-lbl">Kombo</span>
      </div>
      <div class="ritim-stat">
        <span class="ritim-stat-num" id="ritimMaxCombo">0</span>
        <span class="ritim-stat-lbl">Max Kombo</span>
      </div>
    </div>
    <div class="ritim-diff-btns">
      <button class="ritim-diff-btn active" id="ritimEasy">&#x1F60A; Kolay</button>
      <button class="ritim-diff-btn" id="ritimMedium">&#x1F610; Orta</button>
      <button class="ritim-diff-btn" id="ritimHard">&#x1F608; Zor</button>
    </div>
    <div class="ritim-canvas-wrap" style="width:100%;max-width:480px;position:relative">
      <canvas id="ritimCanvas" width="480" height="520" style="display:block;width:100%"></canvas>
      <div class="ritim-judge" id="ritimJudge">PERFECT!</div>
    </div>
    <div class="ritim-keys" style="width:100%;max-width:480px">
      <button class="ritim-key" id="ritimKey0" style="border-color:rgba(124,77,255,.4);color:#c49bff">D</button>
      <button class="ritim-key" id="ritimKey1" style="border-color:rgba(255,107,157,.4);color:#ffb3ce">F</button>
      <button class="ritim-key" id="ritimKey2" style="border-color:rgba(0,229,255,.4);color:#00e5ff">J</button>
      <button class="ritim-key" id="ritimKey3" style="border-color:rgba(105,240,174,.4);color:#69f0ae">K</button>
    </div>
    <button class="play-btn" id="ritimPlayBtn" style="width:auto;padding:12px 36px;margin:0">&#x25B6; Başlat</button>
  </div>
</section>

"""

# Encode sections as UTF-8
sections_bytes = SECTIONS.encode('utf-8')

# Reconstruct
result = before + sections_bytes + b'\n\n' + after

# Write
with open(HTML_FILE, 'wb') as f:
    f.write(result)

# Verify
with open(HTML_FILE, 'rb') as f:
    verify = f.read()

try:
    text = verify.decode('utf-8')
    print(f"SUCCESS: Valid UTF-8, {len(verify)} bytes, {len(text.splitlines())} lines")
    for badge in ['Yaratıcılık', 'Müzik', 'Keşif', 'Zeka', 'Kelime', 'Mantık', 'Tahmin', 'Ritim']:
        found = badge in text
        print(f"  {'OK' if found else 'MISSING'}: '{badge}'")
    print(f"  Sections: {text.count('class=\"section ds-section\"')}")
except UnicodeDecodeError as e:
    print(f"ERROR: not valid UTF-8 at byte {e.start}: {verify[e.start-2:e.start+5].hex()}")
