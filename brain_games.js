/* =========================================================
   BRAIN GAMES COLLECTION
   4 Logic puzzles: Water Sort, Sokoban, Knight's Tour, Tower of Hanoi
========================================================= */

try {
  const bgStyles = `
    /* Common */
    .bg-wrap { background: #0b0b14; position: relative; width: 100%; height: 75vh; min-height: 500px; border-radius: 10px; border: 2px solid #334; box-shadow: inset 0 0 50px rgba(0,0,0,0.8); overflow: hidden; display:flex; flex-direction:column; align-items:center; justify-content:center; user-select: none; }
    .bg-restart-btn { position: absolute; bottom: 20px; right: 20px; padding: 10px 20px; background: rgba(255,255,255,0.1); border: 1px solid #fff; color: #fff; border-radius: 5px; cursor: pointer; transition: 0.3s; z-index: 100; font-family: monospace; }
    .bg-restart-btn:hover { background: #fff; color: #000; }
    .bg-win-msg { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 2rem; color: #0f0; text-shadow: 0 0 10px #0f0; z-index: 200; display: none; text-align: center; background: rgba(0,0,0,0.8); padding: 20px; border-radius: 10px; border: 1px solid #0f0; }

    /* WATER SORT */
    .ws-container { display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; max-width: 800px; padding: 20px; }
    .ws-tube { width: 40px; height: 160px; border: 2px solid rgba(255,255,255,0.3); border-top: none; border-radius: 0 0 20px 20px; background: rgba(255,255,255,0.05); position: relative; overflow: hidden; cursor: pointer; transition: 0.3s; box-shadow: 0 10px 20px rgba(0,0,0,0.5); display: flex; flex-direction: column-reverse; }
    .ws-tube:hover { border-color: rgba(255,255,255,0.8); box-shadow: 0 0 15px rgba(255,255,255,0.5); }
    .ws-tube.active { transform: translateY(-30px); border-color: #00E5FF; box-shadow: 0 0 20px #00E5FF; }
    .ws-layer { width: 100%; height: 25%; transition: height 0.3s, background-color 0.3s; }
    
    /* SOKOBAN */
    .sk-grid { display: grid; background: #222; border: 2px solid #555; padding: 10px; gap: 2px; }
    .sk-cell { width: 40px; height: 40px; background: #111; display:flex; align-items:center; justify-content:center; font-size: 24px; transition: 0.1s; }
    .sk-wall { background: #445; box-shadow: inset 0 0 10px #000; }
    .sk-target { background: rgba(0,255,0,0.2); border: 2px dashed #0f0; }
    .sk-box { background: #f90; border-radius: 5px; border: 2px solid #a60; box-shadow: inset 0 0 10px rgba(255,255,255,0.5); }
    .sk-box-on-target { background: #0f0; border-color: #0a0; }
    .sk-player { background: #00E5FF; border-radius: 50%; box-shadow: 0 0 15px #00E5FF; }
    .sk-controls { position: absolute; bottom: 20px; left: 20px; display: grid; grid-template-columns: 40px 40px 40px; gap: 5px; }
    .sk-btn { width: 40px; height: 40px; background: rgba(255,255,255,0.1); color: #fff; border: 1px solid #777; cursor: pointer; border-radius: 5px; }
    .sk-btn:hover { background: #00E5FF; color: #000; }

    /* KNIGHT'S TOUR */
    .kt-board { display: grid; grid-template-columns: repeat(8, 40px); grid-template-rows: repeat(8, 40px); border: 2px solid #00E5FF; box-shadow: 0 0 20px rgba(0,229,255,0.3); }
    .kt-cell { width: 40px; height: 40px; border: 1px solid rgba(0,229,255,0.2); display:flex; align-items:center; justify-content:center; cursor: pointer; transition: 0.2s; font-size: 24px; }
    .kt-cell.light { background: #1a1a24; }
    .kt-cell.dark { background: #0f0f15; }
    .kt-cell.valid { background: rgba(0,255,0,0.3); box-shadow: inset 0 0 10px #0f0; }
    .kt-cell.visited { background: #333; cursor: not-allowed; opacity: 0.5; }
    .kt-cell.current { background: #00E5FF; box-shadow: 0 0 15px #00E5FF; }

    /* TOWER OF HANOI */
    .th-container { display: flex; justify-content: space-around; width: 80%; height: 300px; align-items: flex-end; padding-bottom: 20px; border-bottom: 5px solid #445; }
    .th-peg-wrap { width: 150px; height: 100%; position: relative; display: flex; flex-direction: column-reverse; align-items: center; cursor: pointer; }
    .th-peg-wrap:hover .th-peg { background: #00E5FF; box-shadow: 0 0 15px #00E5FF; }
    .th-peg { position: absolute; bottom: 0; width: 10px; height: 250px; background: #556; border-radius: 5px 5px 0 0; transition: 0.3s; }
    .th-disk { height: 30px; border-radius: 15px; margin-bottom: 2px; z-index: 10; transition: transform 0.3s, background 0.3s; display:flex; align-items:center; justify-content:center; font-size: 10px; color:rgba(0,0,0,0.5); font-weight:bold; }
    .th-peg-wrap.active .th-disk:last-child { transform: translateY(-50px); box-shadow: 0 0 20px #fff; }
  `;
  document.head.insertAdjacentHTML('beforeend', `<style>${bgStyles}</style>`);

  // ==========================================
  // WATER SORT PUZZLE
  // ==========================================
  const wsHtml = `
    <section class="section ds-section" id="watersort-sec">
      <div class="section-header">
        <button class="chance-back-btn" style="position:absolute; top:20px; left:20px; z-index:100; cursor:pointer;" onclick="if(typeof dsGoToSection === 'function') dsGoToSection('hubPage', '')">◀ Ana Sayfa</button>
        <div class="section-badge" style="background:#0b0b14; color:#00E5FF; border:1px solid #00E5FF;">🧪 Mantık Bulmacası</div>
        <h2 class="section-title">Renk Tüpleri</h2>
        <p class="section-sub">Aynı renk sıvıları tek tüpte toplayın. Sıvılar sadece kendi renginin üzerine dökülebilir.</p>
      </div>
      <div class="bg-wrap">
         <div class="ws-container" id="wsContainer"></div>
         <button class="bg-restart-btn" onclick="wsInit()">Sıfırla (Bölüm Başı)</button>
         <div class="bg-win-msg" id="wsWin">TEBRİKLER!<br><button onclick="wsNextLevel()" style="margin-top:10px; padding:10px; cursor:pointer;">Sonraki Seviye</button></div>
      </div>
    </section>
  `;
  document.body.insertAdjacentHTML('beforeend', wsHtml);

  let wsColors = ['#f44', '#0f0', '#00E5FF', '#ffeb3b', '#e91e63'];
  let wsState = [];
  let wsActiveTube = null;
  let wsLevel = 1;

  function wsGenerateLevel(level) {
      let numColors = Math.min(3 + level, wsColors.length);
      let numTubes = numColors + 2; // Always 2 empty tubes
      
      // Generate flat list of colors (4 chunks per color)
      let chunks = [];
      for(let i=0; i<numColors; i++) {
          for(let j=0; j<4; j++) chunks.push(wsColors[i]);
      }
      // Shuffle
      for(let i=chunks.length-1; i>0; i--) {
          let j = Math.floor(Math.random()*(i+1));
          [chunks[i], chunks[j]] = [chunks[j], chunks[i]];
      }
      
      let state = [];
      let cIdx = 0;
      for(let i=0; i<numTubes; i++) {
          let tube = [];
          if(i < numColors) {
              for(let j=0; j<4; j++) {
                  tube.push(chunks[cIdx++]);
              }
          }
          state.push(tube);
      }
      return state;
  }

  window.wsInit = function() {
      wsState = wsGenerateLevel(wsLevel);
      wsActiveTube = null;
      document.getElementById('wsWin').style.display = 'none';
      wsRender();
  }

  window.wsNextLevel = function() {
      wsLevel++;
      wsInit();
  }

  function wsRender() {
      let c = document.getElementById('wsContainer');
      c.innerHTML = '';
      wsState.forEach((tube, idx) => {
          let tEl = document.createElement('div');
          tEl.className = 'ws-tube';
          if(wsActiveTube === idx) tEl.classList.add('active');
          
          tube.forEach(color => {
              let lEl = document.createElement('div');
              lEl.className = 'ws-layer';
              lEl.style.backgroundColor = color;
              tEl.appendChild(lEl);
          });
          
          tEl.onclick = () => wsHandleClick(idx);
          c.appendChild(tEl);
      });
  }

  function wsHandleClick(idx) {
      if(wsActiveTube === null) {
          // Select if not empty
          if(wsState[idx].length > 0) {
              wsActiveTube = idx;
              if(typeof aeAudio !== 'undefined') aeAudio.playOsc('sine', 800, 0.05, 0.05);
          }
      } else if (wsActiveTube === idx) {
          // Deselect
          wsActiveTube = null;
      } else {
          // Try to pour
          let src = wsState[wsActiveTube];
          let dst = wsState[idx];
          
          if(src.length === 0) { wsActiveTube = null; wsRender(); return; }
          
          let topColor = src[src.length-1];
          // Can pour if dst is empty OR dst is not full and top colors match
          if(dst.length === 0 || (dst.length < 4 && dst[dst.length-1] === topColor)) {
              // Calculate how many layers can be poured
              let pourCount = 0;
              for(let i=src.length-1; i>=0; i--) {
                  if(src[i] === topColor) pourCount++;
                  else break;
              }
              let space = 4 - dst.length;
              let transfer = Math.min(pourCount, space);
              
              for(let i=0; i<transfer; i++) {
                  dst.push(src.pop());
              }
              if(typeof aeAudio !== 'undefined') aeAudio.playOsc('sine', 400, 0.1, 0.2);
          } else {
              // Invalid move
              if(typeof aeAudio !== 'undefined') aeAudio.playOsc('sawtooth', 150, 0.1, 0.1);
          }
          wsActiveTube = null;
          wsCheckWin();
      }
      wsRender();
  }

  function wsCheckWin() {
      let won = true;
      for(let i=0; i<wsState.length; i++) {
          let tube = wsState[i];
          if(tube.length === 0) continue;
          if(tube.length !== 4) { won = false; break; }
          let c = tube[0];
          for(let j=1; j<4; j++) {
              if(tube[j] !== c) { won = false; break; }
          }
      }
      if(won) {
          document.getElementById('wsWin').style.display = 'block';
          if(typeof aeAudio !== 'undefined') aeAudio.playOsc('triangle', 600, 0.1, 0.5);
      }
  }

  // ==========================================
  // SOKOBAN (UZAY KARGO)
  // ==========================================
  const skHtml = `
    <section class="section ds-section" id="sokoban-sec">
      <div class="section-header">
        <button class="chance-back-btn" style="position:absolute; top:20px; left:20px; z-index:100; cursor:pointer;" onclick="if(typeof dsGoToSection === 'function') dsGoToSection('hubPage', '')">◀ Ana Sayfa</button>
        <div class="section-badge" style="background:#0b0b14; color:#f90; border:1px solid #f90;">📦 Mekansal Mantık</div>
        <h2 class="section-title">Uzay Kargo</h2>
        <p class="section-sub">Klavyedeki Yön/WASD tuşlarıyla kutuları yeşil hedeflere itin. Kutuları çekemezsiniz!</p>
      </div>
      <div class="bg-wrap" tabindex="0" id="skWrap">
         <div class="sk-grid" id="skGrid"></div>
         <div class="sk-controls">
            <div></div><button class="sk-btn" onclick="skMove(0,-1)">▲</button><div></div>
            <button class="sk-btn" onclick="skMove(-1,0)">◀</button>
            <button class="sk-btn" onclick="skMove(0,1)">▼</button>
            <button class="sk-btn" onclick="skMove(1,0)">▶</button>
         </div>
         <button class="bg-restart-btn" onclick="skInit()">Yeniden Başlat</button>
         <div class="bg-win-msg" id="skWin">KARGOLAR YERLEŞTİRİLDİ!<br><button onclick="skNextLevel()" style="margin-top:10px; padding:10px; cursor:pointer;">Sonraki Harita</button></div>
      </div>
    </section>
  `;
  document.body.insertAdjacentHTML('beforeend', skHtml);

  // 0: empty, 1: wall, 2: target, 3: box, 4: player (added dynamically over empty/target)
  const skLevels = [
      [
          [1,1,1,1,1,1],
          [1,0,0,2,0,1],
          [1,0,3,0,0,1],
          [1,0,1,0,0,1],
          [1,0,0,0,0,1],
          [1,1,1,1,1,1]
      ],
      [
          [1,1,1,1,1,1,1],
          [1,0,0,1,2,0,1],
          [1,0,3,0,3,2,1],
          [1,0,0,1,0,0,1],
          [1,1,1,1,1,1,1]
      ],
      [
          [1,1,1,1,1,1,1,1],
          [1,0,0,0,0,0,1,1],
          [1,0,3,2,2,0,0,1],
          [1,0,0,3,0,3,0,1],
          [1,1,1,1,0,2,0,1],
          [1,1,1,1,1,1,1,1]
      ]
  ];
  let skCurrentLevel = 0;
  let skMap = [];
  let skPlayer = {x:0, y:0};

  window.skInit = function() {
      // Deep copy level
      let mapTpl = skLevels[Math.min(skCurrentLevel, skLevels.length-1)];
      skMap = [];
      for(let y=0; y<mapTpl.length; y++) {
          skMap.push([...mapTpl[y]]);
      }
      // Set initial player pos
      skPlayer = {x:1, y:1};
      // Prevent spawning player on box or wall (simple fallback)
      while(skMap[skPlayer.y][skPlayer.x] === 1 || skMap[skPlayer.y][skPlayer.x] === 3) {
          skPlayer.x++;
      }
      document.getElementById('skWin').style.display = 'none';
      skRender();
  }
  
  window.skNextLevel = function() {
      skCurrentLevel++;
      skInit();
  }

  function skRender() {
      let grid = document.getElementById('skGrid');
      grid.style.gridTemplateColumns = `repeat(${skMap[0].length}, 40px)`;
      grid.style.gridTemplateRows = `repeat(${skMap.length}, 40px)`;
      grid.innerHTML = '';
      
      for(let y=0; y<skMap.length; y++) {
          for(let x=0; x<skMap[y].length; x++) {
              let val = skMap[y][x];
              let cell = document.createElement('div');
              cell.className = 'sk-cell';
              
              let isTarget = (val === 2 || val === 5); // 5 is box on target, but we keep map as 2 or 0, boxes are separate array? No, simpler to keep in map.
              // Wait, standard sokoban maps need to track targets independently from boxes.
              // Let's refactor map logic slightly inside render.
          }
      }
  }

  // Refined Sokoban logic
  let skStaticMap = []; // 0: empty, 1: wall, 2: target
  let skBoxes = []; // {x, y}
  
  window.skInit = function() {
      let mapTpl = skLevels[Math.min(skCurrentLevel, skLevels.length-1)];
      skStaticMap = [];
      skBoxes = [];
      for(let y=0; y<mapTpl.length; y++) {
          let row = [];
          for(let x=0; x<mapTpl[y].length; x++) {
              let v = mapTpl[y][x];
              if(v === 1) row.push(1);
              else if(v === 2) row.push(2);
              else row.push(0);
              
              if(v === 3) skBoxes.push({x:x, y:y});
          }
          skStaticMap.push(row);
      }
      skPlayer = {x:1, y:1}; // manual start
      if(skCurrentLevel === 0) skPlayer = {x:1, y:4};
      if(skCurrentLevel === 1) skPlayer = {x:1, y:3};
      if(skCurrentLevel === 2) skPlayer = {x:1, y:1};
      
      document.getElementById('skWin').style.display = 'none';
      skRenderRefined();
  }

  function skRenderRefined() {
      let grid = document.getElementById('skGrid');
      grid.style.gridTemplateColumns = `repeat(${skStaticMap[0].length}, 40px)`;
      grid.style.gridTemplateRows = `repeat(${skStaticMap.length}, 40px)`;
      grid.innerHTML = '';
      
      for(let y=0; y<skStaticMap.length; y++) {
          for(let x=0; x<skStaticMap[y].length; x++) {
              let val = skStaticMap[y][x];
              let cell = document.createElement('div');
              cell.className = 'sk-cell';
              
              if(val === 1) cell.classList.add('sk-wall');
              else if(val === 2) cell.classList.add('sk-target');
              
              // Box check
              let isBox = skBoxes.find(b => b.x === x && b.y === y);
              if(isBox) {
                  let bEl = document.createElement('div');
                  bEl.className = 'sk-box';
                  if(val === 2) bEl.classList.add('sk-box-on-target');
                  bEl.style.width = '30px'; bEl.style.height = '30px';
                  cell.appendChild(bEl);
              }
              
              // Player check
              if(skPlayer.x === x && skPlayer.y === y) {
                  let pEl = document.createElement('div');
                  pEl.className = 'sk-player';
                  pEl.style.width = '24px'; pEl.style.height = '24px';
                  cell.appendChild(pEl);
              }
              
              grid.appendChild(cell);
          }
      }
  }

  window.skMove = function(dx, dy) {
      if(document.getElementById('skWin').style.display === 'block') return;
      
      let nx = skPlayer.x + dx;
      let ny = skPlayer.y + dy;
      
      // Wall collision
      if(skStaticMap[ny][nx] === 1) return;
      
      // Box collision
      let boxIdx = skBoxes.findIndex(b => b.x === nx && b.y === ny);
      if(boxIdx !== -1) {
          // Can we push the box?
          let bnx = nx + dx;
          let bny = ny + dy;
          if(skStaticMap[bny][bnx] === 1) return; // Wall behind box
          if(skBoxes.find(b => b.x === bnx && b.y === bny)) return; // Box behind box
          
          // Push box
          skBoxes[boxIdx].x = bnx;
          skBoxes[boxIdx].y = bny;
          if(typeof aeAudio !== 'undefined') aeAudio.playOsc('sawtooth', 100, 0.05, 0.05);
      }
      
      // Move player
      skPlayer.x = nx;
      skPlayer.y = ny;
      skRenderRefined();
      
      // Check win
      let won = true;
      for(let b of skBoxes) {
          if(skStaticMap[b.y][b.x] !== 2) { won = false; break; }
      }
      if(won) {
          document.getElementById('skWin').style.display = 'block';
          if(typeof aeAudio !== 'undefined') aeAudio.playOsc('square', 600, 0.1, 0.5);
      }
  }

  document.getElementById('skWrap').addEventListener('keydown', (e) => {
      if(e.key === 'ArrowUp' || e.key === 'w') { skMove(0,-1); e.preventDefault(); }
      if(e.key === 'ArrowDown' || e.key === 's') { skMove(0,1); e.preventDefault(); }
      if(e.key === 'ArrowLeft' || e.key === 'a') { skMove(-1,0); e.preventDefault(); }
      if(e.key === 'ArrowRight' || e.key === 'd') { skMove(1,0); e.preventDefault(); }
  });


  // ==========================================
  // KNIGHT'S TOUR (AT TURU)
  // ==========================================
  const ktHtml = `
    <section class="section ds-section" id="knight-sec">
      <div class="section-header">
        <button class="chance-back-btn" style="position:absolute; top:20px; left:20px; z-index:100; cursor:pointer;" onclick="if(typeof dsGoToSection === 'function') dsGoToSection('hubPage', '')">◀ Ana Sayfa</button>
        <div class="section-badge" style="background:#0b0b14; color:#00E5FF; border:1px solid #00E5FF;">♞ Matematiksel Algoritma</div>
        <h2 class="section-title">At Turu</h2>
        <p class="section-sub">Sadece L şeklinde hareket ederek 64 karenin tümüne tam 1 kez basın.</p>
      </div>
      <div class="bg-wrap">
         <div class="kt-board" id="ktBoard"></div>
         <div style="margin-top:20px; color:#aaa;" id="ktCount">Ziyaret Edilen: 1 / 64</div>
         <button class="bg-restart-btn" onclick="ktInit()">Yeniden Başlat</button>
         <div class="bg-win-msg" id="ktWin">İMKAANSIZI BAŞARDIN!</div>
      </div>
    </section>
  `;
  document.body.insertAdjacentHTML('beforeend', ktHtml);

  let ktMap = []; // 8x8 boolean
  let ktPos = {x:0, y:0};
  let ktCount = 1;

  window.ktInit = function() {
      ktMap = [];
      for(let y=0; y<8; y++) {
          let r = [];
          for(let x=0; x<8; x++) r.push(false);
          ktMap.push(r);
      }
      ktPos = {x:0, y:0};
      ktMap[0][0] = true;
      ktCount = 1;
      document.getElementById('ktWin').style.display = 'none';
      ktRender();
  }

  function ktGetValidMoves() {
      let moves = [
          {dx: -2, dy: -1}, {dx: -2, dy: 1}, {dx: 2, dy: -1}, {dx: 2, dy: 1},
          {dx: -1, dy: -2}, {dx: 1, dy: -2}, {dx: -1, dy: 2}, {dx: 1, dy: 2}
      ];
      let valid = [];
      moves.forEach(m => {
          let nx = ktPos.x + m.dx;
          let ny = ktPos.y + m.dy;
          if(nx>=0 && nx<8 && ny>=0 && ny<8 && !ktMap[ny][nx]) valid.push({x:nx, y:ny});
      });
      return valid;
  }

  function ktRender() {
      let b = document.getElementById('ktBoard');
      b.innerHTML = '';
      let valids = ktGetValidMoves();
      
      for(let y=0; y<8; y++) {
          for(let x=0; x<8; x++) {
              let cell = document.createElement('div');
              cell.className = 'kt-cell ' + ((x+y)%2===0 ? 'light' : 'dark');
              
              if(ktPos.x === x && ktPos.y === y) {
                  cell.classList.add('current');
                  cell.innerText = '♞';
              } else if(ktMap[y][x]) {
                  cell.classList.add('visited');
              } else if(valids.find(v => v.x === x && v.y === y)) {
                  cell.classList.add('valid');
                  cell.onclick = () => ktMove(x, y);
              }
              
              b.appendChild(cell);
          }
      }
      document.getElementById('ktCount').innerText = `Ziyaret Edilen: ${ktCount} / 64`;
      
      if(valids.length === 0 && ktCount < 64) {
          document.getElementById('ktCount').innerText += " - HAMLE KALMADI! YENİDEN BAŞLAT.";
          document.getElementById('ktCount').style.color = "#f44";
          if(typeof aeAudio !== 'undefined') aeAudio.playOsc('sawtooth', 150, 0.3, 0.5);
      } else if (ktCount === 64) {
          document.getElementById('ktWin').style.display = 'block';
      }
  }

  function ktMove(x, y) {
      ktPos = {x:x, y:y};
      ktMap[y][x] = true;
      ktCount++;
      if(typeof aeAudio !== 'undefined') aeAudio.playOsc('sine', 1200, 0.05, 0.1);
      ktRender();
  }


  // ==========================================
  // TOWER OF HANOI (NEON HALKALAR)
  // ==========================================
  const thHtml = `
    <section class="section ds-section" id="hanoi-sec">
      <div class="section-header">
        <button class="chance-back-btn" style="position:absolute; top:20px; left:20px; z-index:100; cursor:pointer;" onclick="if(typeof dsGoToSection === 'function') dsGoToSection('hubPage', '')">◀ Ana Sayfa</button>
        <div class="section-badge" style="background:#0b0b14; color:#e91e63; border:1px solid #e91e63;">🗼 Klasik Zeka</div>
        <h2 class="section-title">Neon Halkalar</h2>
        <p class="section-sub">Tüm kuleyi 3. çubuğa taşıyın. Kurallar: Bir seferde 1 halka. Büyük halka küçüğün üstüne gelemez. (Tıkla-Taşı)</p>
      </div>
      <div class="bg-wrap">
         <div class="th-container" id="thContainer"></div>
         <div style="margin-top:10px; color:#aaa;" id="thMoves">Hamle: 0</div>
         <button class="bg-restart-btn" onclick="thInit()">Yeniden Başlat</button>
         <div class="bg-win-msg" id="thWin">KULE TAMAMLANDI!</div>
      </div>
    </section>
  `;
  document.body.insertAdjacentHTML('beforeend', thHtml);

  let thPegs = [[], [], []];
  let thActivePeg = null;
  let thColors = ['#f44', '#f90', '#ffeb3b', '#0f0', '#00E5FF'];
  let thMovesCount = 0;

  window.thInit = function() {
      thPegs = [[5, 4, 3, 2, 1], [], []]; // 5 represents biggest, 1 represents smallest
      thActivePeg = null;
      thMovesCount = 0;
      document.getElementById('thWin').style.display = 'none';
      thRender();
  }

  function thRender() {
      let c = document.getElementById('thContainer');
      c.innerHTML = '';
      
      for(let i=0; i<3; i++) {
          let pWrap = document.createElement('div');
          pWrap.className = 'th-peg-wrap';
          if(thActivePeg === i) pWrap.classList.add('active');
          
          let pEl = document.createElement('div');
          pEl.className = 'th-peg';
          pWrap.appendChild(pEl);
          
          thPegs[i].forEach(diskSize => {
              let dEl = document.createElement('div');
              dEl.className = 'th-disk';
              dEl.style.width = (diskSize * 25) + 'px';
              dEl.style.backgroundColor = thColors[diskSize-1];
              pWrap.appendChild(dEl);
          });
          
          pWrap.onclick = () => thHandleClick(i);
          c.appendChild(pWrap);
      }
      document.getElementById('thMoves').innerText = `Hamle: ${thMovesCount}`;
      
      if(thPegs[2].length === 5) {
          document.getElementById('thWin').style.display = 'block';
          if(typeof aeAudio !== 'undefined') aeAudio.playOsc('triangle', 800, 0.1, 0.5);
      }
  }

  function thHandleClick(idx) {
      if(thActivePeg === null) {
          // Select if not empty
          if(thPegs[idx].length > 0) {
              thActivePeg = idx;
              if(typeof aeAudio !== 'undefined') aeAudio.playOsc('sine', 1000, 0.05, 0.05);
          }
      } else if (thActivePeg === idx) {
          // Deselect
          thActivePeg = null;
      } else {
          // Try to move
          let src = thPegs[thActivePeg];
          let dst = thPegs[idx];
          let disk = src[src.length-1];
          
          if(dst.length === 0 || dst[dst.length-1] > disk) {
              dst.push(src.pop());
              thMovesCount++;
              if(typeof aeAudio !== 'undefined') aeAudio.playOsc('sine', 1200, 0.05, 0.1);
          } else {
              // Invalid move (big on small)
              if(typeof aeAudio !== 'undefined') aeAudio.playOsc('sawtooth', 150, 0.1, 0.1);
          }
          thActivePeg = null;
      }
      thRender();
  }

  // Init all on load
  setTimeout(() => {
      if(typeof wsInit === 'function') wsInit();
      if(typeof skInit === 'function') skInit();
      if(typeof ktInit === 'function') ktInit();
      if(typeof thInit === 'function') thInit();
  }, 1000);

} catch(e) { console.error('Brain Games Init Error:', e); }
