/* =========================================================
   EXTRA CHILL EXPANSION (Tetris, Voxel, Lo-Fi)
========================================================= */
try {
  // 1. Inject Sections to body
  const extraSectionsHtml = `
    <!-- TETRIS SECTION -->
    <section class="section ds-section" id="tetris-sec">
      <div class="section-header">
        <button class="chance-back-btn" style="position:absolute; top:20px; left:20px; z-index:100; cursor:pointer;" onclick="if(typeof dsGoToSection === 'function') dsGoToSection('hubPage', '')">◀ Ana Sayfa</button>
        <div class="section-badge">👾 Nostalji</div>
        <h2 class="section-title">Neon Tetris</h2>
        <p class="section-sub">Ok tuşlarıyla oyna. Synthwave estetiği.</p>
      </div>
      <div style="max-width: 600px; margin: 0 auto; display:flex; flex-direction:column; align-items:center; gap:15px;">
        <div style="display:flex; gap:30px; align-items:flex-start;">
          <!-- Game Canvas container (for shake) -->
          <div id="tetrisContainer" style="transition: transform 0.05s;">
            <canvas id="tetrisCanvas" width="300" height="600" style="background:#0a0a0a; border:2px solid var(--a3); border-radius:5px; box-shadow:0 0 15px var(--a3);"></canvas>
          </div>
          <!-- Score Panel -->
          <div style="display:flex; flex-direction:column; gap:20px; background:var(--card); padding:20px; border-radius:10px; border:1px solid var(--gb); min-width:150px;">
            <div>
              <div style="color:var(--tx2); font-size:0.9rem;">SKOR</div>
              <div id="tetrisScore" style="font-size:1.8rem; font-weight:bold; color:var(--a3); text-shadow:0 0 10px var(--a3);">0</div>
            </div>
            <div>
              <div style="color:var(--tx2); font-size:0.9rem;">SEVİYE</div>
              <div id="tetrisLevel" style="font-size:1.5rem; font-weight:bold; color:var(--tx);">1</div>
            </div>
            <div>
              <div style="color:var(--tx2); font-size:0.9rem;">SATIR</div>
              <div id="tetrisLines" style="font-size:1.5rem; font-weight:bold; color:var(--tx);">0</div>
            </div>
            <button id="tetrisBtn" class="chance-action-btn" style="width:100%; margin-top:20px;">▶ BAŞLAT</button>
          </div>
        </div>
      </div>
    </section>

    <!-- VOXEL SECTION -->
    <section class="section ds-section" id="voxel-sec">
      <div class="section-header">
        <button class="chance-back-btn" style="position:absolute; top:20px; left:20px; z-index:100; cursor:pointer;" onclick="if(typeof dsGoToSection === 'function') dsGoToSection('hubPage', '')">◀ Ana Sayfa</button>
        <div class="section-badge">🧊 Yaratıcılık</div>
        <h2 class="section-title">Voxel Dünyası</h2>
        <p class="section-sub">3D Piksel heykeller inşa et. Sol tık yap, sağ tık sil.</p>
      </div>
      <div style="max-width: 800px; margin: 0 auto; display:flex; flex-direction:column; align-items:center; gap:15px;">
        
        <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:10px;" id="voxelPalette">
          <!-- Colors injected via JS -->
        </div>

        <canvas id="voxelCanvas" width="800" height="600" style="background:#1a1a24; border:1px solid var(--gb); border-radius:10px; cursor:crosshair;"></canvas>
        
        <div style="display:flex; gap:10px;">
          <button id="voxRotL" class="chance-choice-btn">↺ Döndür</button>
          <button id="voxRotR" class="chance-choice-btn">↻ Döndür</button>
          <button id="voxClear" class="chance-choice-btn" style="color:var(--danger); border-color:var(--danger);">Temizle</button>
        </div>
      </div>
    </section>

    <!-- LOFI SECTION -->
    <section class="section ds-section" id="lofi-sec">
      <div class="section-header">
        <button class="chance-back-btn" style="position:absolute; top:20px; left:20px; z-index:100; cursor:pointer;" onclick="if(typeof dsGoToSection === 'function') dsGoToSection('hubPage', '')">◀ Ana Sayfa</button>
        <div class="section-badge">📻 Huzur</div>
        <h2 class="section-title">Lo-Fi Odası</h2>
        <p class="section-sub">Kendi odaklanma atmosferini yarat</p>
      </div>
      <div style="max-width: 800px; margin: 0 auto; position:relative; border-radius:15px; overflow:hidden; border:1px solid var(--gb);">
        
        <!-- Background Anim -->
        <canvas id="lofiCanvas" width="800" height="500" style="display:block; background:linear-gradient(to bottom, #0f1021, #1a153a);"></canvas>
        
        <!-- Controls -->
        <div style="position:absolute; bottom:0; left:0; right:0; background:rgba(10,10,20,0.85); backdrop-filter:blur(10px); padding:20px; display:flex; flex-wrap:wrap; gap:20px; justify-content:space-around; border-top:1px solid var(--gb);">
          
          <!-- Rain -->
          <div style="display:flex; flex-direction:column; align-items:center; gap:10px; color:var(--tx2);">
            <div style="font-size:2rem; cursor:pointer; transition:0.2s;" id="lfRainIcon" class="lf-icon">🌧️</div>
            <input type="range" id="lfRainVol" min="0" max="1" step="0.01" value="0" style="width:100px; accent-color:#00e5ff;">
          </div>
          
          <!-- Fire -->
          <div style="display:flex; flex-direction:column; align-items:center; gap:10px; color:var(--tx2);">
            <div style="font-size:2rem; cursor:pointer; transition:0.2s;" id="lfFireIcon" class="lf-icon">🔥</div>
            <input type="range" id="lfFireVol" min="0" max="1" step="0.01" value="0" style="width:100px; accent-color:#ff9100;">
          </div>
          
          <!-- Lo-fi Beat -->
          <div style="display:flex; flex-direction:column; align-items:center; gap:10px; color:var(--tx2);">
            <div style="font-size:2rem; cursor:pointer; transition:0.2s;" id="lfBeatIcon" class="lf-icon">🎧</div>
            <input type="range" id="lfBeatVol" min="0" max="1" step="0.01" value="0" style="width:100px; accent-color:#b388ff;">
          </div>
          
          <button id="lfPlayBtn" class="chance-action-btn" style="padding:10px 30px;">Odaya Gir (Başlat)</button>

        </div>
      </div>
    </section>
  `;
  document.body.insertAdjacentHTML('beforeend', extraSectionsHtml);

  // ==========================================
  // 1. NEON TETRIS ENGINE
  // ==========================================
  const tCanvas = document.getElementById('tetrisCanvas');
  const tCtx = tCanvas ? tCanvas.getContext('2d') : null;
  const COLS = 10;
  const ROWS = 20;
  const BLOCK_SIZE = 30; // 30x30 pixels
  const tColors = [
    null,
    '#00ffff', // I - Cyan
    '#0000ff', // J - Blue
    '#ff7f00', // L - Orange
    '#ffff00', // O - Yellow
    '#00ff00', // S - Green
    '#800080', // T - Purple
    '#ff0000'  // Z - Red
  ];
  
  // Tetromino shapes
  const PIECES = [
    [],
    [[1,1,1,1]], // I
    [[2,0,0],[2,2,2]], // J
    [[0,0,3],[3,3,3]], // L
    [[4,4],[4,4]], // O
    [[0,5,5],[5,5,0]], // S
    [[0,6,0],[6,6,6]], // T
    [[7,7,0],[0,7,7]]  // Z
  ];

  let tGrid = [];
  let tScore = 0;
  let tLevel = 1;
  let tLines = 0;
  let tPiece = null;
  let tDropStart = 0;
  let tGameOver = false;
  let tReq = null;
  let tParticles = [];

  function tInitGrid() {
    tGrid = Array.from({length: ROWS}, () => Array(COLS).fill(0));
  }
  
  function tRandomPiece() {
    const id = Math.floor(Math.random() * 7) + 1;
    const shape = PIECES[id];
    return {
      shape: shape,
      x: Math.floor(COLS/2) - Math.floor(shape[0].length/2),
      y: 0
    };
  }

  function tDrawBlock(x, y, color) {
    tCtx.fillStyle = color;
    tCtx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    tCtx.strokeStyle = '#000';
    tCtx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    
    // Neon glow effect (inner light)
    tCtx.fillStyle = 'rgba(255,255,255,0.3)';
    tCtx.fillRect(x * BLOCK_SIZE + 4, y * BLOCK_SIZE + 4, BLOCK_SIZE - 8, BLOCK_SIZE - 8);
  }

  function tCollide(p, offsetX=0, offsetY=0) {
    for (let r = 0; r < p.shape.length; r++) {
      for (let c = 0; c < p.shape[r].length; c++) {
        if (!p.shape[r][c]) continue;
        let newX = p.x + c + offsetX;
        let newY = p.y + r + offsetY;
        if (newX < 0 || newX >= COLS || newY >= ROWS) return true;
        if (newY >= 0 && tGrid[newY][newX]) return true;
      }
    }
    return false;
  }

  function tRotate(p) {
    const newShape = p.shape[0].map((val, index) => p.shape.map(row => row[index]).reverse());
    let prev = p.shape;
    p.shape = newShape;
    if (tCollide(p)) {
      p.shape = prev; // Revert if invalid
    }
  }

  function tMerge(p) {
    p.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          if(p.y + y < 0) tGameOver = true;
          else tGrid[p.y + y][p.x + x] = value;
        }
      });
    });
  }

  function tClearLines() {
    let linesCleared = 0;
    outer: for (let y = ROWS - 1; y >= 0; y--) {
      for (let x = 0; x < COLS; x++) {
        if (!tGrid[y][x]) continue outer;
      }
      
      // Line is full
      const row = tGrid.splice(y, 1)[0];
      tGrid.unshift(Array(COLS).fill(0));
      y++; // Check same row again
      linesCleared++;
      
      // Spawn particles for effect
      for(let i=0; i<COLS; i++) {
        for(let j=0; j<5; j++) {
          tParticles.push({
            x: i*BLOCK_SIZE + 15, y: y*BLOCK_SIZE + 15,
            vx: (Math.random()-0.5)*10, vy: (Math.random()-0.5)*10,
            life: 1.0, color: tColors[row[i]]
          });
        }
      }
    }
    if (linesCleared > 0) {
      // Screen shake
      const cont = document.getElementById('tetrisContainer');
      cont.style.transform = 'translate(' + (Math.random()*10-5) + 'px, ' + (Math.random()*10-5) + 'px)';
      setTimeout(() => cont.style.transform = 'none', 50);
      
      tLines += linesCleared;
      document.getElementById('tetrisLines').textContent = tLines;
      let points = [0, 40, 100, 300, 1200];
      tScore += points[linesCleared] * tLevel;
      document.getElementById('tetrisScore').textContent = tScore;
      
      if(tLines >= tLevel * 10) {
        tLevel++;
        document.getElementById('tetrisLevel').textContent = tLevel;
      }
    }
  }

  function tDrop() {
    if (tCollide(tPiece, 0, 1)) {
      tMerge(tPiece);
      tClearLines();
      if (!tGameOver) tPiece = tRandomPiece();
    } else {
      tPiece.y++;
    }
    tDropStart = performance.now();
  }

  function tUpdate(time = 0) {
    if(tGameOver) {
      tCtx.fillStyle = 'rgba(0,0,0,0.7)';
      tCtx.fillRect(0,0, tCanvas.width, tCanvas.height);
      tCtx.fillStyle = '#f00'; tCtx.font = '30px Arial'; tCtx.textAlign = 'center';
      tCtx.fillText('GAME OVER', tCanvas.width/2, tCanvas.height/2);
      return;
    }
    
    const dropInterval = 1000 - (tLevel * 50); // Speeds up
    if (time - tDropStart > Math.max(100, dropInterval)) {
      tDrop();
    }

    tCtx.fillStyle = '#0a0a0a';
    tCtx.fillRect(0, 0, tCanvas.width, tCanvas.height);

    // Draw Grid
    tGrid.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) tDrawBlock(x, y, tColors[value]);
      });
    });

    // Draw Piece
    if(tPiece) {
      tPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value) tDrawBlock(tPiece.x + x, tPiece.y + y, tColors[value]);
        });
      });
    }

    // Draw Particles
    for(let i=tParticles.length-1; i>=0; i--) {
      let p = tParticles[i];
      tCtx.fillStyle = p.color;
      tCtx.globalAlpha = p.life;
      tCtx.beginPath(); tCtx.arc(p.x, p.y, 4, 0, Math.PI*2); tCtx.fill();
      tCtx.globalAlpha = 1.0;
      p.x += p.vx; p.y += p.vy;
      p.life -= 0.05;
      if(p.life <= 0) tParticles.splice(i, 1);
    }

    tReq = requestAnimationFrame(tUpdate);
  }

  document.addEventListener('keydown', e => {
    if(!tPiece || tGameOver || document.getElementById('tetris-sec').style.display === 'none') return;
    if (e.key === 'ArrowLeft') { if(!tCollide(tPiece, -1, 0)) tPiece.x--; e.preventDefault(); }
    if (e.key === 'ArrowRight') { if(!tCollide(tPiece, 1, 0)) tPiece.x++; e.preventDefault(); }
    if (e.key === 'ArrowDown') { tDrop(); e.preventDefault(); }
    if (e.key === 'ArrowUp') { tRotate(tPiece); e.preventDefault(); }
    if (e.key === ' ') { while(!tCollide(tPiece, 0, 1)) { tPiece.y++; } tDrop(); e.preventDefault(); }
  });

  const tBtn = document.getElementById('tetrisBtn');
  if(tBtn) {
    tBtn.onclick = () => {
      tInitGrid();
      tScore = 0; tLevel = 1; tLines = 0; tGameOver = false;
      document.getElementById('tetrisScore').textContent = 0;
      document.getElementById('tetrisLevel').textContent = 1;
      document.getElementById('tetrisLines').textContent = 0;
      tPiece = tRandomPiece();
      tDropStart = performance.now();
      if(tReq) cancelAnimationFrame(tReq);
      tUpdate();
      tBtn.textContent = 'YENİDEN BAŞLAT';
    };
  }

  // ==========================================
  // 2. VOXEL SCULPTOR (Isometric)
  // ==========================================
  const vCanvas = document.getElementById('voxelCanvas');
  const vCtx = vCanvas ? vCanvas.getContext('2d') : null;
  
  // Data structure: map of "x,y,z" -> color
  let vVoxels = new Map(); 
  let vColors = ['#ff3366', '#33ccff', '#ffff33', '#cc33ff', '#33ff33', '#ffffff', '#888888', '#222222'];
  let vCurrentColor = '#33ccff';
  let vCameraAngle = 0; // 0, 1, 2, 3 (rotations around Y axis)
  
  // Grid size
  const V_GRID = 16;
  const V_SIZE = 20; // Size of isometric tile

  // Init palette
  const pal = document.getElementById('voxelPalette');
  if(pal) {
    vColors.forEach(c => {
      let b = document.createElement('div');
      b.style.width = '30px'; b.style.height = '30px'; b.style.background = c; b.style.cursor = 'pointer';
      b.style.border = c === vCurrentColor ? '3px solid white' : '1px solid #000';
      b.style.borderRadius = '5px';
      b.onclick = () => {
        vCurrentColor = c;
        Array.from(pal.children).forEach(cb => cb.style.border = '1px solid #000');
        b.style.border = '3px solid white';
      };
      pal.appendChild(b);
    });
  }

  // Draw an isometric cube
  function vDrawCube(isoX, isoY, color) {
    vCtx.fillStyle = color;
    vCtx.strokeStyle = '#000';
    vCtx.lineWidth = 1;
    
    // Top face
    vCtx.beginPath();
    vCtx.moveTo(isoX, isoY);
    vCtx.lineTo(isoX + V_SIZE, isoY - V_SIZE/2);
    vCtx.lineTo(isoX, isoY - V_SIZE);
    vCtx.lineTo(isoX - V_SIZE, isoY - V_SIZE/2);
    vCtx.closePath();
    vCtx.fill(); vCtx.stroke();
    
    // Left face (darker)
    vCtx.fillStyle = 'rgba(0,0,0,0.3)';
    vCtx.beginPath();
    vCtx.moveTo(isoX - V_SIZE, isoY - V_SIZE/2);
    vCtx.lineTo(isoX, isoY);
    vCtx.lineTo(isoX, isoY + V_SIZE);
    vCtx.lineTo(isoX - V_SIZE, isoY + V_SIZE/2);
    vCtx.closePath();
    vCtx.fill(); vCtx.stroke();
    
    // Right face (darkest)
    vCtx.fillStyle = 'rgba(0,0,0,0.6)';
    vCtx.beginPath();
    vCtx.moveTo(isoX, isoY);
    vCtx.lineTo(isoX + V_SIZE, isoY - V_SIZE/2);
    vCtx.lineTo(isoX + V_SIZE, isoY + V_SIZE/2);
    vCtx.lineTo(isoX, isoY + V_SIZE);
    vCtx.closePath();
    vCtx.fill(); vCtx.stroke();
  }

  // Draw flat isometric tile (for floor)
  function vDrawTile(isoX, isoY) {
    vCtx.strokeStyle = 'rgba(255,255,255,0.1)';
    vCtx.fillStyle = 'rgba(255,255,255,0.02)';
    vCtx.beginPath();
    vCtx.moveTo(isoX, isoY);
    vCtx.lineTo(isoX + V_SIZE, isoY - V_SIZE/2);
    vCtx.lineTo(isoX, isoY - V_SIZE);
    vCtx.lineTo(isoX - V_SIZE, isoY - V_SIZE/2);
    vCtx.closePath();
    vCtx.fill(); vCtx.stroke();
  }

  // Convert 3D world coord to 2D screen coord
  function vProject(x, y, z) {
    // Apply camera rotation
    let rx = x, rz = z;
    if(vCameraAngle === 1) { rx = z; rz = V_GRID-1-x; }
    else if(vCameraAngle === 2) { rx = V_GRID-1-x; rz = V_GRID-1-z; }
    else if(vCameraAngle === 3) { rx = V_GRID-1-z; rz = x; }

    // Isometric math
    let isoX = (rx - rz) * V_SIZE + (vCanvas.width/2);
    let isoY = (rx + rz) * (V_SIZE/2) - (y * V_SIZE) + (vCanvas.height/2) + 50;
    return {x: isoX, y: isoY, rx, rz};
  }

  // A simple painter's algorithm renderer
  function vRender() {
    if(!vCtx) return;
    vCtx.clearRect(0,0,vCanvas.width,vCanvas.height);
    
    // Create depth sorted array of everything (floor + voxels)
    let items = [];
    
    // Add floor
    for(let x=0; x<V_GRID; x++) {
      for(let z=0; z<V_GRID; z++) {
        items.push({type:'floor', x, y:-1, z});
      }
    }
    
    // Add voxels
    vVoxels.forEach((col, key) => {
      let [x,y,z] = key.split(',').map(Number);
      items.push({type:'voxel', x, y, z, col});
    });
    
    // Sort by depth (x + y + z in rotated space)
    items.forEach(i => {
      let p = vProject(i.x, i.y, i.z);
      i.depth = p.rx + p.rz + i.y; 
      i.sx = p.x;
      i.sy = p.y;
    });
    
    items.sort((a,b) => Math.floor(a.depth) - Math.floor(b.depth));
    
    // Draw
    items.forEach(i => {
      if(i.type === 'floor') vDrawTile(i.sx, i.sy);
      else vDrawCube(i.sx, i.sy, i.col);
    });
  }

  // Basic raycasting hack for 2D isometric Canvas
  function vGetTarget(mouseX, mouseY) {
    let closestDist = 999;
    let target = null;
    
    // Check floor
    for(let x=0; x<V_GRID; x++) {
      for(let z=0; z<V_GRID; z++) {
        let p = vProject(x, -1, z);
        let dist = Math.sqrt((mouseX-p.x)**2 + (mouseY - (p.y-V_SIZE/2))**2);
        if(dist < V_SIZE && dist < closestDist) {
          closestDist = dist;
          target = {x, y:0, z}; // place ON floor
        }
      }
    }
    
    // Check existing voxels (to place on top, side, etc)
    vVoxels.forEach((col, key) => {
      let [vx,vy,vz] = key.split(',').map(Number);
      
      // Top face
      let topP = vProject(vx, vy, vz);
      let dTop = Math.sqrt((mouseX-topP.x)**2 + (mouseY - (topP.y-V_SIZE/2))**2);
      if(dTop < V_SIZE*0.8 && dTop < closestDist) {
        closestDist = dTop; target = {x:vx, y:vy+1, z:vz, delKey:key};
      }
      
      // Left face
      let dLeft = Math.sqrt((mouseX-(topP.x-V_SIZE/2))**2 + (mouseY - (topP.y+V_SIZE/4))**2);
      if(dLeft < V_SIZE*0.7 && dLeft < closestDist) {
        let nx = vx; let nz = vz;
        if(vCameraAngle===0) nz++; else if(vCameraAngle===1) nx++; else if(vCameraAngle===2) nz--; else nx--;
        closestDist = dLeft; target = {x:nx, y:vy, z:nz, delKey:key};
      }
      
      // Right face
      let dRight = Math.sqrt((mouseX-(topP.x+V_SIZE/2))**2 + (mouseY - (topP.y+V_SIZE/4))**2);
      if(dRight < V_SIZE*0.7 && dRight < closestDist) {
        let nx = vx; let nz = vz;
        if(vCameraAngle===0) nx++; else if(vCameraAngle===1) nz--; else if(vCameraAngle===2) nx--; else nz++;
        closestDist = dRight; target = {x:nx, y:vy, z:nz, delKey:key};
      }
    });
    
    return target;
  }

  if(vCanvas) {
    vCanvas.addEventListener('mousedown', e => {
      const rect = vCanvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      
      let t = vGetTarget(mx, my);
      if(t) {
        if(e.button === 2 && t.delKey) { // Right click to delete
          vVoxels.delete(t.delKey);
        } else if (e.button === 0) { // Left click to add
          // Bounds check
          if(t.x>=0 && t.x<V_GRID && t.z>=0 && t.z<V_GRID && t.y>=0 && t.y<V_GRID) {
            vVoxels.set(t.x+','+t.y+','+t.z, vCurrentColor);
          }
        }
        vRender();
      }
    });
    vCanvas.addEventListener('contextmenu', e => e.preventDefault());
    
    document.getElementById('voxRotL').onclick = () => { vCameraAngle = (vCameraAngle + 1) % 4; vRender(); };
    document.getElementById('voxRotR').onclick = () => { vCameraAngle = (vCameraAngle + 3) % 4; vRender(); };
    document.getElementById('voxClear').onclick = () => { vVoxels.clear(); vRender(); };
    
    // Init floor
    vRender();
  }

  // ==========================================
  // 3. LO-FI MIXER (Zen Room)
  // ==========================================
  const lfCanvas = document.getElementById('lofiCanvas');
  const lfCtx = lfCanvas ? lfCanvas.getContext('2d') : null;
  let lfAudioCtx = null;
  let lfRainNode = null;
  let lfFireNode = null;
  let lfBeatNodes = [];
  let lfPlaying = false;
  let lfAnimReq = null;
  let lfDrops = [];

  function lfInitAudio() {
    if(!lfAudioCtx) {
      lfAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if(lfAudioCtx.state === 'suspended') lfAudioCtx.resume();
  }

  // Generate continuous pink noise for Rain
  function lfCreateRain() {
    let bufferSize = lfAudioCtx.sampleRate * 2;
    let buffer = lfAudioCtx.createBuffer(1, bufferSize, lfAudioCtx.sampleRate);
    let output = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
        let white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.1; // lower volume
        b6 = white * 0.115926;
    }
    let node = lfAudioCtx.createBufferSource();
    node.buffer = buffer;
    node.loop = true;
    let gain = lfAudioCtx.createGain();
    gain.gain.value = 0;
    node.connect(gain); gain.connect(lfAudioCtx.destination);
    node.start();
    return gain;
  }

  // Generate crackling noise for Fire
  function lfCreateFire() {
    let bufferSize = lfAudioCtx.sampleRate * 2;
    let buffer = lfAudioCtx.createBuffer(1, bufferSize, lfAudioCtx.sampleRate);
    let output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        // Mostly silence, occasionally spikes (crackles)
        if(Math.random() < 0.01) output[i] = Math.random() * 2 - 1;
        else output[i] = 0;
    }
    // Filter to make it warmer
    let filter = lfAudioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;

    let node = lfAudioCtx.createBufferSource();
    node.buffer = buffer;
    node.loop = true;
    let gain = lfAudioCtx.createGain();
    gain.gain.value = 0;
    
    node.connect(filter); filter.connect(gain); gain.connect(lfAudioCtx.destination);
    node.start();
    return gain;
  }

  // Generate a very chill looping chord progression
  function lfCreateBeat() {
    let gain = lfAudioCtx.createGain();
    gain.gain.value = 0;
    gain.connect(lfAudioCtx.destination);
    
    // Notes of a chill chord progression
    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [196.00, 246.94, 293.66, 349.23]  // G7
    ];
    
    let step = 0;
    setInterval(() => {
      if(!lfPlaying) return;
      if(gain.gain.value <= 0.01) return; // Muted
      
      let chord = chords[step % chords.length];
      step++;
      
      chord.forEach(freq => {
        let osc = lfAudioCtx.createOscillator();
        let oscGain = lfAudioCtx.createGain();
        osc.type = 'sine'; // very soft
        osc.frequency.value = freq;
        
        oscGain.gain.setValueAtTime(0, lfAudioCtx.currentTime);
        oscGain.gain.linearRampToValueAtTime(0.1, lfAudioCtx.currentTime + 1.0);
        oscGain.gain.linearRampToValueAtTime(0, lfAudioCtx.currentTime + 4.0); // Slow fade
        
        osc.connect(oscGain); oscGain.connect(gain);
        osc.start(lfAudioCtx.currentTime);
        osc.stop(lfAudioCtx.currentTime + 4.0);
      });
      
    }, 4000); // New chord every 4 seconds
    
    return gain;
  }

  // Visuals (Rain on window)
  function lfLoop() {
    if(!lfCtx || !lfPlaying) return;
    
    // Dim background
    lfCtx.fillStyle = 'rgba(15, 16, 33, 0.1)'; 
    lfCtx.fillRect(0,0,lfCanvas.width, lfCanvas.height);
    
    // Add rain drops based on volume
    let rainVol = parseFloat(document.getElementById('lfRainVol').value);
    if(rainVol > 0 && Math.random() < rainVol) {
      lfDrops.push({
        x: Math.random() * lfCanvas.width,
        y: -10,
        vy: 5 + Math.random()*10,
        l: 10 + Math.random()*20
      });
    }
    
    lfCtx.strokeStyle = 'rgba(100,200,255,0.4)';
    lfCtx.lineWidth = 2;
    for(let i=lfDrops.length-1; i>=0; i--) {
      let d = lfDrops[i];
      lfCtx.beginPath();
      lfCtx.moveTo(d.x, d.y);
      lfCtx.lineTo(d.x - d.vy*0.2, d.y + d.l);
      lfCtx.stroke();
      d.y += d.vy;
      d.x -= d.vy*0.2; // slight wind
      if(d.y > lfCanvas.height) lfDrops.splice(i, 1);
    }
    
    // Fire glow if fire is up
    let fireVol = parseFloat(document.getElementById('lfFireVol').value);
    if(fireVol > 0) {
      let grad = lfCtx.createRadialGradient(lfCanvas.width/2, lfCanvas.height, 10, lfCanvas.width/2, lfCanvas.height, 300);
      grad.addColorStop(0, `rgba(255, 100, 0, ${fireVol * (0.3 + Math.random()*0.1)})`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      lfCtx.fillStyle = grad;
      lfCtx.fillRect(0,0,lfCanvas.width, lfCanvas.height);
    }

    lfAnimReq = requestAnimationFrame(lfLoop);
  }

  document.getElementById('lfPlayBtn').onclick = () => {
    lfInitAudio();
    if(!lfPlaying) {
      lfPlaying = true;
      document.getElementById('lfPlayBtn').textContent = 'Odadan Çık (Durdur)';
      document.getElementById('lfPlayBtn').style.background = 'var(--danger)';
      
      if(!lfRainNode) lfRainNode = lfCreateRain();
      if(!lfFireNode) lfFireNode = lfCreateFire();
      if(lfBeatNodes.length===0) lfBeatNodes.push(lfCreateBeat()); // array so I could add drums later if needed
      
      // Init volumes based on sliders
      lfRainNode.gain.value = document.getElementById('lfRainVol').value;
      lfFireNode.gain.value = document.getElementById('lfFireVol').value;
      lfBeatNodes[0].gain.value = document.getElementById('lfBeatVol').value;
      
      lfLoop();
    } else {
      lfPlaying = false;
      document.getElementById('lfPlayBtn').textContent = 'Odaya Gir (Başlat)';
      document.getElementById('lfPlayBtn').style.background = 'var(--a3)';
      
      if(lfRainNode) { lfRainNode.gain.value = 0; }
      if(lfFireNode) { lfFireNode.gain.value = 0; }
      if(lfBeatNodes[0]) { lfBeatNodes[0].gain.value = 0; }
    }
  };

  // Slider events to update volume in real-time
  document.getElementById('lfRainVol').oninput = (e) => {
    if(lfRainNode && lfPlaying) lfRainNode.gain.setValueAtTime(e.target.value, lfAudioCtx.currentTime);
  };
  document.getElementById('lfFireVol').oninput = (e) => {
    if(lfFireNode && lfPlaying) lfFireNode.gain.setValueAtTime(e.target.value, lfAudioCtx.currentTime);
  };
  document.getElementById('lfBeatVol').oninput = (e) => {
    if(lfBeatNodes[0] && lfPlaying) lfBeatNodes[0].gain.setValueAtTime(e.target.value, lfAudioCtx.currentTime);
  };

} catch(e) { console.error('Extra chill games error', e); }
