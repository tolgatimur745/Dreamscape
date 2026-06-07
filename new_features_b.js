
/* ============================================================
   NEW FEATURES B — Leisure Hub
   1. Pipe Dream          (id=pipedream-sec)
   2. Mozaik Fotoğraf     (id=mosaic-sec)
   3. Moodboard           (id=moodboard-sec)
   4. Evrim Yarışı        (id=evolution-sec)
   5. Ateş & Su           (id=firewater-sec)
   ============================================================ */

/* ─────────────────────────────────────────────
   1. PIPE DREAM
   ───────────────────────────────────────────── */
try {
  document.body.insertAdjacentHTML('beforeend', `
<section id="pipedream-sec" class="section ds-section" style="display:none;min-height:100vh;background:var(--bg);position:relative;padding:20px;box-sizing:border-box;font-family:'Segoe UI',sans-serif;">
  <button class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:100;cursor:pointer;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);color:var(--tx);padding:8px 16px;border-radius:8px;font-size:14px;" onclick="if(typeof dsGoToSection==='function') dsGoToSection('hubPage','')">◀ Ana Sayfa</button>
  <div style="text-align:center;padding-top:10px;">
    <h1 style="color:var(--a1);font-size:2rem;text-shadow:0 0 20px var(--a1);margin-bottom:4px;">🔧 Pipe Dream</h1>
    <p style="color:var(--tx2);margin-bottom:16px;">Borularla su akışını tamamla! Hücrelere tıklayarak döndür.</p>
    <div style="display:flex;gap:24px;justify-content:center;align-items:flex-start;flex-wrap:wrap;">
      <div style="background:var(--card);border-radius:16px;padding:16px;box-shadow:0 0 30px rgba(0,200,255,0.15);">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
          <div style="background:#1a3a4a;border:3px solid #00bcd4;border-radius:8px;padding:6px 14px;color:#00bcd4;font-weight:700;font-size:13px;">💧 KAYNAK</div>
          <span style="color:var(--tx2);font-size:12px;">→ Borularla bağla →</span>
          <div style="background:#1a4a2a;border:3px solid #4caf50;border-radius:8px;padding:6px 14px;color:#4caf50;font-weight:700;font-size:13px;">🏁 HEDEF</div>
        </div>
        <div id="pd-grid" style="display:inline-grid;grid-template-columns:repeat(7,56px);grid-template-rows:repeat(7,56px);gap:3px;background:rgba(0,0,0,0.3);padding:10px;border-radius:10px;"></div>
        <div style="margin-top:12px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
          <button id="pd-flow-btn" onclick="pdStartFlow()" style="background:linear-gradient(135deg,#0097a7,#00bcd4);border:none;color:#fff;padding:10px 24px;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 0 15px rgba(0,188,212,0.5);">💧 AKIŞI BAŞLAT</button>
          <button onclick="pdReset()" style="background:linear-gradient(135deg,#37474f,#546e7a);border:none;color:#fff;padding:10px 24px;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;">🔄 YENİ BULMACA</button>
        </div>
        <div id="pd-status" style="margin-top:10px;font-size:14px;color:var(--tx2);min-height:20px;"></div>
      </div>
      <div style="background:var(--card);border-radius:16px;padding:16px;min-width:160px;box-shadow:0 0 20px rgba(0,0,0,0.3);">
        <h3 style="color:var(--a1);margin:0 0 12px;font-size:14px;">📋 Boru Türleri</h3>
        <div id="pd-legend" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;"></div>
        <div style="margin-top:16px;padding:10px;background:rgba(0,0,0,0.2);border-radius:8px;">
          <div style="color:var(--tx2);font-size:12px;margin-bottom:4px;">SKOR</div>
          <div id="pd-score" style="color:var(--a1);font-size:24px;font-weight:700;">0</div>
          <div style="color:var(--tx2);font-size:11px;">kazanılan bulmaca</div>
        </div>
      </div>
    </div>
  </div>
</section>
`);

  /* ── Pipe Dream Logic ── */
  const PD_COLS = 7, PD_ROWS = 7;
  // Pipe types: index maps to [connections: N,E,S,W booleans]
  // 0=empty, 1=straight-H, 2=straight-V, 3=elbow-NE, 4=elbow-NW, 5=elbow-SE, 6=elbow-SW, 7=T-NES, 8=T-NSW, 9=T-NEW, 10=T-SEW, 11=cross
  const PD_TYPES = [
    [0,0,0,0], // 0 empty
    [0,1,0,1], // 1 straight H  ─
    [1,0,1,0], // 2 straight V  │
    [1,1,0,0], // 3 elbow NE   └
    [1,0,0,1], // 4 elbow NW   ┘
    [0,1,1,0], // 5 elbow SE   ┌
    [0,0,1,1], // 6 elbow SW   ┐
    [1,1,1,0], // 7 T NES      ├
    [1,0,1,1], // 8 T NSW      ┤
    [1,1,0,1], // 9 T NEW      ┴
    [0,1,1,1], //10 T SEW      ┬
    [1,1,1,1], //11 cross      ┼
  ];
  const PD_LABELS = ['·','─','│','└','┘','┌','┐','├','┤','┴','┬','┼'];
  const PD_COLORS = ['#333','#00bcd4','#00bcd4','#00bcd4','#00bcd4','#00bcd4','#00bcd4','#00e5ff','#00e5ff','#00e5ff','#00e5ff','#fff'];
  let pdGrid = [], pdScore = 0, pdFlowing = false;

  function pdDrawSVG(type, lit) {
    const c = lit ? '#00bcd4' : '#546e7a';
    const bg = lit ? 'rgba(0,188,212,0.15)' : 'rgba(84,110,122,0.08)';
    const s = 56, mid = 28, th = 6;
    const [N,E,S,W] = PD_TYPES[type];
    let paths = '';
    if(N) paths += `<line x1="${mid}" y1="0" x2="${mid}" y2="${mid}" stroke="${c}" stroke-width="${th}" stroke-linecap="round"/>`;
    if(E) paths += `<line x1="${mid}" y1="${mid}" x2="${s}" y2="${mid}" stroke="${c}" stroke-width="${th}" stroke-linecap="round"/>`;
    if(S) paths += `<line x1="${mid}" y1="${mid}" x2="${mid}" y2="${s}" stroke="${c}" stroke-width="${th}" stroke-linecap="round"/>`;
    if(W) paths += `<line x1="0" y1="${mid}" x2="${mid}" y2="${mid}" stroke="${c}" stroke-width="${th}" stroke-linecap="round"/>`;
    if(type===0) paths = `<circle cx="${mid}" cy="${mid}" r="3" fill="#444"/>`;
    return `<svg width="${s}" height="${s}" style="display:block;border-radius:6px;background:${bg};">${paths}</svg>`;
  }

  function pdRender() {
    const grid = document.getElementById('pd-grid');
    if(!grid) return;
    grid.innerHTML = '';
    for(let r=0;r<PD_ROWS;r++) {
      for(let c=0;c<PD_COLS;c++) {
        const cell = document.createElement('div');
        const isSource = (r===3 && c===0);
        const isDrain  = (r===3 && c===6);
        cell.style.cssText = `width:56px;height:56px;border-radius:8px;cursor:pointer;position:relative;transition:transform 0.1s;${isSource?'box-shadow:0 0 10px #00bcd4;':isDrain?'box-shadow:0 0 10px #4caf50;':''}`;
        cell.title = `[${r},${c}]`;
        if(isSource) {
          cell.innerHTML = `<div style="width:56px;height:56px;display:flex;align-items:center;justify-content:center;background:rgba(0,188,212,0.2);border-radius:8px;border:2px solid #00bcd4;font-size:20px;">💧</div>`;
        } else if(isDrain) {
          cell.innerHTML = `<div style="width:56px;height:56px;display:flex;align-items:center;justify-content:center;background:rgba(76,175,80,0.2);border-radius:8px;border:2px solid #4caf50;font-size:20px;">🏁</div>`;
        } else {
          cell.innerHTML = pdDrawSVG(pdGrid[r][c], false);
          cell.addEventListener('click', () => {
            if(pdFlowing) return;
            pdGrid[r][c] = (pdGrid[r][c]+1)%(PD_TYPES.length);
            pdRender();
          });
          cell.addEventListener('mouseenter', () => { if(!pdFlowing) cell.style.transform='scale(1.08)'; });
          cell.addEventListener('mouseleave', () => { cell.style.transform='scale(1)'; });
        }
        grid.appendChild(cell);
      }
    }
  }

  function pdReset() {
    pdFlowing = false;
    pdGrid = Array.from({length:PD_ROWS}, () => Array(PD_COLS).fill(0));
    // seed random pipes
    for(let r=0;r<PD_ROWS;r++) {
      for(let c=0;c<PD_COLS;c++) {
        if((r===3&&c===0)||(r===3&&c===6)) continue;
        pdGrid[r][c] = Math.floor(Math.random()*(PD_TYPES.length-1))+0;
      }
    }
    const status = document.getElementById('pd-status');
    if(status) status.textContent = '';
    const btn = document.getElementById('pd-flow-btn');
    if(btn) { btn.disabled=false; btn.style.opacity='1'; }
    pdRender();
  }

  function pdGetConnected() {
    // BFS from source [3,0] going East
    const visited = new Set();
    const queue = [{ r:3, c:0, fromDir:'W' }]; // entering from West means we need East connection
    const order = [];
    // dirs: N=0,E=1,S=2,W=3, opposites: N↔S, E↔W
    const dirs = [{dr:-1,dc:0,from:'S',need:0},{dr:0,dc:1,from:'W',need:1},{dr:1,dc:0,from:'N',need:2},{dr:0,dc:-1,from:'E',need:3}];
    while(queue.length) {
      const {r,c,fromDir} = queue.shift();
      const key=`${r},${c}`;
      if(visited.has(key)) continue;
      visited.add(key);
      order.push({r,c});
      const type = (r===3&&c===0)?[0,1,0,0] : (r===3&&c===6)?[0,0,0,1] : PD_TYPES[pdGrid[r][c]];
      // check each direction
      dirs.forEach(({dr,dc,from,need}) => {
        const nr=r+dr, nc=c+dc;
        if(nr<0||nr>=PD_ROWS||nc<0||nc>=PD_COLS) return;
        if(visited.has(`${nr},${nc}`)) return;
        const myConn = type[need]; // my side toward neighbor
        const nType = (nr===3&&nc===0)?[0,1,0,0] : (nr===3&&nc===6)?[0,0,0,1] : PD_TYPES[pdGrid[nr][nc]];
        // neighbor's side facing back
        const oppIdx = [2,3,0,1][need];
        const theirConn = nType[oppIdx];
        if(myConn && theirConn) {
          queue.push({r:nr,c:nc,fromDir:from});
        }
      });
    }
    return {visited, order};
  }

  function pdStartFlow() {
    if(pdFlowing) return;
    const {visited, order} = pdGetConnected();
    const reachedDrain = visited.has('3,6');
    const status = document.getElementById('pd-status');
    const grid = document.getElementById('pd-grid');
    if(!grid) return;
    pdFlowing = true;
    const btn = document.getElementById('pd-flow-btn');
    if(btn) { btn.disabled=true; btn.style.opacity='0.5'; }
    // animate cells lighting up
    let i = 0;
    const cells = grid.children;
    function animStep() {
      if(i>=order.length) {
        if(reachedDrain) {
          pdScore++;
          const sc = document.getElementById('pd-score');
          if(sc) sc.textContent = pdScore;
          if(status) status.innerHTML = `<span style="color:#4caf50;font-weight:700;font-size:16px;">🎉 Tebrikler! Su hedefe ulaştı!</span>`;
        } else {
          if(status) status.innerHTML = `<span style="color:#f44336;font-weight:700;">💦 Su hedefe ulaşamadı! Tekrar dene.</span>`;
        }
        return;
      }
      const {r,c} = order[i];
      if(!(r===3&&c===0) && !(r===3&&c===6)) {
        const cellIdx = r*PD_COLS+c;
        const el = cells[cellIdx];
        if(el) el.innerHTML = pdDrawSVG(pdGrid[r][c], true);
      }
      i++;
      setTimeout(animStep, 80);
    }
    animStep();
  }

  // Build legend
  function pdBuildLegend() {
    const leg = document.getElementById('pd-legend');
    if(!leg) return;
    const names = ['Boş','Yatay','Dikey','SA-Köşe','SD-Köşe','NA-Köşe','ND-Köşe','T-Sağ','T-Sol','T-Üst','T-Alt','Çapraz'];
    [1,2,3,4,5,6,7,8,9,10,11].forEach(i => {
      leg.insertAdjacentHTML('beforeend',`<div style="display:flex;align-items:center;gap:4px;"><div style="width:28px;height:28px;">${pdDrawSVG(i,false)}</div><span style="color:var(--tx2);font-size:10px;">${names[i]}</span></div>`);
    });
  }

  pdReset();
  pdBuildLegend();
  window.pdStartFlow = pdStartFlow;
  window.pdReset = pdReset;
} catch(e) { console.error('PipeDream error:', e); }


/* ─────────────────────────────────────────────
   2. MOZAİK FOTOĞRAF EFEKTİ
   ───────────────────────────────────────────── */
try {
  document.body.insertAdjacentHTML('beforeend', `
<section id="mosaic-sec" class="section ds-section" style="display:none;min-height:100vh;background:var(--bg);position:relative;padding:20px;box-sizing:border-box;font-family:'Segoe UI',sans-serif;">
  <button class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:100;cursor:pointer;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);color:var(--tx);padding:8px 16px;border-radius:8px;font-size:14px;" onclick="if(typeof dsGoToSection==='function') dsGoToSection('hubPage','')">◀ Ana Sayfa</button>
  <div style="text-align:center;padding-top:10px;">
    <h1 style="color:var(--a2);font-size:2rem;text-shadow:0 0 20px var(--a2);margin-bottom:4px;">🎨 Mozaik Fotoğraf Efekti</h1>
    <p style="color:var(--tx2);margin-bottom:16px;">Fotoğrafını yükle ve sanatsal efektler uygula!</p>
    <div style="background:var(--card);border-radius:16px;padding:20px;display:inline-block;max-width:900px;width:100%;text-align:left;box-shadow:0 0 30px rgba(var(--a2-rgb,200,100,255),0.15);">
      <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:16px;">
        <label style="background:linear-gradient(135deg,#7b1fa2,#ab47bc);color:#fff;padding:10px 20px;border-radius:10px;cursor:pointer;font-weight:700;font-size:14px;">
          📁 FOTOĞRAF SEÇ
          <input type="file" id="mosaic-file" accept="image/*" style="display:none;" onchange="mosaicLoad(this)">
        </label>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button onclick="mosaicApply('pixel')" style="background:linear-gradient(135deg,#1565c0,#1976d2);border:none;color:#fff;padding:8px 16px;border-radius:8px;cursor:pointer;font-weight:600;">🔲 Piksel</button>
          <button onclick="mosaicApply('triangle')" style="background:linear-gradient(135deg,#c62828,#e53935);border:none;color:#fff;padding:8px 16px;border-radius:8px;cursor:pointer;font-weight:600;">🔺 Üçgen</button>
          <button onclick="mosaicApply('hex')" style="background:linear-gradient(135deg,#2e7d32,#43a047);border:none;color:#fff;padding:8px 16px;border-radius:8px;cursor:pointer;font-weight:600;">⬡ Altıgen</button>
          <button onclick="mosaicApply('original')" style="background:linear-gradient(135deg,#37474f,#546e7a);border:none;color:#fff;padding:8px 16px;border-radius:8px;cursor:pointer;font-weight:600;">🖼️ Orijinal</button>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <label style="color:var(--tx2);font-size:13px;">Boyut:</label>
          <input type="range" id="mosaic-size" min="5" max="50" value="15" style="width:100px;" oninput="document.getElementById('mosaic-size-val').textContent=this.value+'px'">
          <span id="mosaic-size-val" style="color:var(--a2);font-weight:700;font-size:13px;">15px</span>
        </div>
        <button onclick="mosaicDownload()" style="background:linear-gradient(135deg,#e65100,#ef6c00);border:none;color:#fff;padding:8px 16px;border-radius:8px;cursor:pointer;font-weight:600;">⬇️ PNG İNDİR</button>
      </div>
      <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;">
        <div style="text-align:center;">
          <div style="color:var(--tx2);font-size:12px;margin-bottom:6px;">ORİJİNAL</div>
          <canvas id="mosaic-orig" style="border-radius:10px;max-width:380px;max-height:380px;background:#111;border:2px solid rgba(255,255,255,0.1);"></canvas>
        </div>
        <div style="text-align:center;">
          <div id="mosaic-mode-label" style="color:var(--a2);font-size:12px;font-weight:700;margin-bottom:6px;">MOZAİK</div>
          <canvas id="mosaic-out" style="border-radius:10px;max-width:380px;max-height:380px;background:#111;border:2px solid rgba(255,255,255,0.1);"></canvas>
        </div>
      </div>
      <div id="mosaic-hint" style="text-align:center;color:var(--tx2);margin-top:12px;font-size:13px;">Yukarıdan bir fotoğraf seç, ardından efekt butonlarına tıkla.</div>
    </div>
  </div>
</section>
`);

  let mosaicImg = null, mosaicOrigCtx = null, mosaicOutCtx = null;
  const MW = 380, MH = 380;

  function mosaicLoad(input) {
    const file = input.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        mosaicImg = img;
        const oc = document.getElementById('mosaic-orig');
        const hint = document.getElementById('mosaic-hint');
        if(hint) hint.style.display='none';
        const scale = Math.min(MW/img.width, MH/img.height, 1);
        const w = Math.round(img.width*scale), h = Math.round(img.height*scale);
        oc.width=w; oc.height=h;
        mosaicOrigCtx = oc.getContext('2d');
        mosaicOrigCtx.drawImage(img, 0, 0, w, h);
        const outC = document.getElementById('mosaic-out');
        outC.width=w; outC.height=h;
        mosaicOutCtx = outC.getContext('2d');
        mosaicOutCtx.drawImage(img, 0, 0, w, h);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function mosaicApply(mode) {
    if(!mosaicImg || !mosaicOrigCtx || !mosaicOutCtx) return;
    const oc = document.getElementById('mosaic-orig');
    const outC = document.getElementById('mosaic-out');
    const sz = parseInt(document.getElementById('mosaic-size').value)||15;
    const W=oc.width, H=oc.height;
    const src = mosaicOrigCtx.getImageData(0,0,W,H);
    outC.width=W; outC.height=H;
    const ctx = mosaicOutCtx;
    ctx.clearRect(0,0,W,H);
    const label = document.getElementById('mosaic-mode-label');

    if(mode==='original') {
      ctx.drawImage(mosaicImg, 0, 0, W, H);
      if(label) label.textContent='ORİJİNAL';
      return;
    }

    function avgColor(x,y,bw,bh) {
      let r=0,g=0,b=0,cnt=0;
      for(let py=y;py<Math.min(y+bh,H);py++) {
        for(let px=x;px<Math.min(x+bw,W);px++) {
          const i=(py*W+px)*4;
          r+=src.data[i]; g+=src.data[i+1]; b+=src.data[i+2]; cnt++;
        }
      }
      if(!cnt) return [0,0,0];
      return [r/cnt|0, g/cnt|0, b/cnt|0];
    }

    if(mode==='pixel') {
      if(label) label.textContent='PİKSEL MOZAİK';
      for(let y=0;y<H;y+=sz) {
        for(let x=0;x<W;x+=sz) {
          const [r,g,b]=avgColor(x,y,sz,sz);
          ctx.fillStyle=`rgb(${r},${g},${b})`;
          ctx.fillRect(x,y,Math.min(sz,W-x),Math.min(sz,H-y));
        }
      }
    } else if(mode==='triangle') {
      if(label) label.textContent='ÜÇGEN MOZAİK';
      const ts=sz*2;
      for(let row=0;row*ts<H+ts;row++) {
        for(let col=0;col*ts<W+ts;col++) {
          const x=col*ts, y=row*ts;
          // upper triangle
          const [r1,g1,b1]=avgColor(x,y,ts,ts>>1);
          ctx.fillStyle=`rgb(${r1},${g1},${b1})`;
          ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+ts,y); ctx.lineTo(x+ts/2,y+ts/2); ctx.closePath(); ctx.fill();
          // right triangle
          const [r2,g2,b2]=avgColor(x+ts/2,y,ts/2,ts);
          ctx.fillStyle=`rgb(${r2},${g2},${b2})`;
          ctx.beginPath(); ctx.moveTo(x+ts,y); ctx.lineTo(x+ts,y+ts); ctx.lineTo(x+ts/2,y+ts/2); ctx.closePath(); ctx.fill();
          // lower triangle
          const [r3,g3,b3]=avgColor(x,y+ts/2,ts,ts/2);
          ctx.fillStyle=`rgb(${r3},${g3},${b3})`;
          ctx.beginPath(); ctx.moveTo(x+ts,y+ts); ctx.lineTo(x,y+ts); ctx.lineTo(x+ts/2,y+ts/2); ctx.closePath(); ctx.fill();
          // left triangle
          const [r4,g4,b4]=avgColor(x,y,ts/2,ts);
          ctx.fillStyle=`rgb(${r4},${g4},${b4})`;
          ctx.beginPath(); ctx.moveTo(x,y+ts); ctx.lineTo(x,y); ctx.lineTo(x+ts/2,y+ts/2); ctx.closePath(); ctx.fill();
        }
      }
    } else if(mode==='hex') {
      if(label) label.textContent='ALTIĞEN MOZAİK';
      const R=sz, h_=R*Math.sqrt(3)/2;
      const colW=R*1.5, rowH=h_*2;
      for(let row=0;row*h_<H+h_;row++) {
        for(let col=0;col*colW<W+colW;col++) {
          const cx=col*colW+(row%2===0?0:R*0.75);
          const cy=row*h_;
          const [r,g,b]=avgColor(cx-R,cy-h_,R*2,h_*2);
          ctx.fillStyle=`rgb(${r},${g},${b})`;
          ctx.beginPath();
          for(let i=0;i<6;i++) {
            const angle=Math.PI/180*(60*i-30);
            const px=cx+R*Math.cos(angle), py=cy+R*Math.sin(angle);
            if(i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
          }
          ctx.closePath(); ctx.fill();
        }
      }
    }
  }

  function mosaicDownload() {
    const outC = document.getElementById('mosaic-out');
    if(!outC) return;
    const a = document.createElement('a');
    a.href = outC.toDataURL('image/png');
    a.download = 'mozaik_efekt.png';
    a.click();
  }

  window.mosaicLoad = mosaicLoad;
  window.mosaicApply = mosaicApply;
  window.mosaicDownload = mosaicDownload;
} catch(e) { console.error('Mosaic error:', e); }


/* ─────────────────────────────────────────────
   3. MOODBOARD OLUŞTURUCU
   ───────────────────────────────────────────── */
try {
  const MB_COLORS = [
    '#ff4757','#ff6b81','#ff7f50','#ffa502','#eccc68',
    '#7bed9f','#2ed573','#1e90ff','#70a1ff','#5352ed',
    '#a29bfe','#fd79a8','#00cec9','#00b894','#6c5ce7',
    '#fdcb6e','#e17055','#74b9ff','#55efc4','#dfe6e9'
  ];
  const MB_EMOJIS = ['😀','😍','🎉','🌟','💫','🔥','❤️','🌈','🦋','🌸','🍀','🎨','🎵','🎸','🏆','🚀','💎','🌙','⚡','🎭','🦄','🐉','🌺','🍭','🎪','🎠','🌊','🍄','🦊','🎯'];

  document.body.insertAdjacentHTML('beforeend', `
<section id="moodboard-sec" class="section ds-section" style="display:none;min-height:100vh;background:var(--bg);position:relative;font-family:'Segoe UI',sans-serif;overflow:hidden;">
  <button class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:200;cursor:pointer;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);color:var(--tx);padding:8px 16px;border-radius:8px;font-size:14px;" onclick="if(typeof dsGoToSection==='function') dsGoToSection('hubPage','')">◀ Ana Sayfa</button>
  <div style="display:flex;height:100vh;">
    <!-- Sidebar -->
    <div style="width:200px;min-width:200px;background:rgba(0,0,0,0.5);backdrop-filter:blur(20px);border-right:1px solid rgba(255,255,255,0.1);padding:60px 12px 12px;display:flex;flex-direction:column;gap:16px;overflow-y:auto;z-index:100;">
      <div style="color:var(--a3);font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">🎨 Renkler</div>
      <div id="mb-colors" style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;"></div>
      <div style="color:var(--a3);font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">✨ Çıkartmalar</div>
      <div id="mb-emojis" style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;"></div>
      <div style="color:var(--a3);font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">📝 Metin</div>
      <input id="mb-text-input" placeholder="Yazı gir..." style="width:100%;box-sizing:border-box;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);color:var(--tx);padding:6px 8px;border-radius:6px;font-size:12px;">
      <button onclick="mbAddText()" style="background:linear-gradient(135deg,var(--a1),var(--a2));border:none;color:#fff;padding:6px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:700;">+ EKLE</button>
      <hr style="border-color:rgba(255,255,255,0.1);margin:4px 0;">
      <button onclick="mbDownload()" style="background:linear-gradient(135deg,#e65100,#ef6c00);border:none;color:#fff;padding:8px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:700;">⬇️ PNG İNDİR</button>
      <button onclick="mbClear()" style="background:rgba(244,67,54,0.2);border:1px solid #f44336;color:#f44336;padding:8px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:700;">🗑️ TEMİZLE</button>
    </div>
    <!-- Workspace -->
    <div id="mb-workspace" style="flex:1;position:relative;overflow:hidden;background:radial-gradient(ellipse at 30% 30%, rgba(100,60,200,0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 70%, rgba(200,60,100,0.1) 0%, transparent 60%), var(--bg2);">
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:rgba(255,255,255,0.05);font-size:80px;pointer-events:none;user-select:none;">MOODBOARD</div>
    </div>
  </div>
</section>
`);

  // Build color swatches
  const mbColEl = document.getElementById('mb-colors');
  MB_COLORS.forEach(col => {
    const sw = document.createElement('div');
    sw.style.cssText = `width:36px;height:36px;background:${col};border-radius:8px;cursor:pointer;border:2px solid transparent;transition:all 0.2s;box-shadow:0 2px 8px rgba(0,0,0,0.3);`;
    sw.title = col;
    sw.addEventListener('mouseenter',()=>sw.style.transform='scale(1.2)');
    sw.addEventListener('mouseleave',()=>sw.style.transform='scale(1)');
    sw.addEventListener('click',()=>mbAddSwatch(col));
    mbColEl.appendChild(sw);
  });

  // Build emoji palette
  const mbEmoEl = document.getElementById('mb-emojis');
  MB_EMOJIS.forEach(em => {
    const btn = document.createElement('div');
    btn.style.cssText = 'width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:20px;cursor:pointer;border-radius:6px;transition:all 0.2s;background:rgba(255,255,255,0.05);';
    btn.textContent = em;
    btn.addEventListener('mouseenter',()=>btn.style.transform='scale(1.3)');
    btn.addEventListener('mouseleave',()=>btn.style.transform='scale(1)');
    btn.addEventListener('click',()=>mbAddEmoji(em));
    mbEmoEl.appendChild(btn);
  });

  let mbDragEl=null, mbDragOX=0, mbDragOY=0;

  function mbMakeItem(el) {
    const ws = document.getElementById('mb-workspace');
    if(!ws) return;
    const wRect = ws.getBoundingClientRect();
    el.style.position='absolute';
    el.style.left = (80+Math.random()*(wRect.width-200))+'px';
    el.style.top  = (60+Math.random()*(wRect.height-150))+'px';
    el.style.cursor='grab';
    el.style.userSelect='none';
    el.style.zIndex='10';
    el.style.transition='box-shadow 0.2s, transform 0.1s';
    // delete button
    const del = document.createElement('div');
    del.textContent='🗑️';
    del.style.cssText='position:absolute;top:-10px;right:-10px;font-size:16px;cursor:pointer;display:none;background:rgba(244,67,54,0.9);border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:11px;z-index:20;';
    del.addEventListener('click', e => { e.stopPropagation(); el.remove(); });
    el.appendChild(del);
    el.addEventListener('mouseenter',()=>{ del.style.display='flex'; el.style.transform='scale(1.05)'; el.style.zIndex='50'; });
    el.addEventListener('mouseleave',()=>{ del.style.display='none'; el.style.transform='scale(1)'; el.style.zIndex='10'; });
    el.addEventListener('mousedown', e => {
      if(e.target===del) return;
      mbDragEl=el; el.style.cursor='grabbing'; el.style.zIndex='100';
      const r=el.getBoundingClientRect();
      mbDragOX=e.clientX-r.left; mbDragOY=e.clientY-r.top;
      e.preventDefault();
    });
    ws.appendChild(el);
  }

  document.addEventListener('mousemove', e => {
    if(!mbDragEl) return;
    const ws = document.getElementById('mb-workspace');
    if(!ws) return;
    const wr=ws.getBoundingClientRect();
    let nx=e.clientX-wr.left-mbDragOX, ny=e.clientY-wr.top-mbDragOY;
    mbDragEl.style.left=nx+'px'; mbDragEl.style.top=ny+'px';
  });
  document.addEventListener('mouseup', () => {
    if(mbDragEl) { mbDragEl.style.cursor='grab'; mbDragEl.style.zIndex='10'; mbDragEl=null; }
  });

  function mbAddSwatch(col) {
    const el = document.createElement('div');
    el.style.cssText=`width:${40+Math.random()*60|0}px;height:${40+Math.random()*60|0}px;background:${col};border-radius:${Math.random()>0.5?'50%':'10px'};box-shadow:0 4px 20px ${col}88;`;
    mbMakeItem(el);
  }

  function mbAddEmoji(em) {
    const el = document.createElement('div');
    const sz = 32+Math.random()*40|0;
    el.style.cssText=`font-size:${sz}px;line-height:1;background:rgba(255,255,255,0.05);border-radius:10px;padding:6px;`;
    el.textContent=em;
    mbMakeItem(el);
  }

  function mbAddText() {
    const inp = document.getElementById('mb-text-input');
    if(!inp||!inp.value.trim()) return;
    const el = document.createElement('div');
    const colors = ['#fff','#ff4757','#ffa502','#7bed9f','#70a1ff','#fd79a8','#eccc68'];
    const col = colors[Math.floor(Math.random()*colors.length)];
    el.style.cssText=`color:${col};font-size:${16+Math.random()*24|0}px;font-weight:700;text-shadow:0 0 10px ${col}88;padding:6px 10px;background:rgba(0,0,0,0.3);border-radius:8px;white-space:nowrap;`;
    el.textContent=inp.value.trim();
    mbMakeItem(el);
    inp.value='';
  }

  function mbClear() {
    const ws = document.getElementById('mb-workspace');
    if(!ws) return;
    const items = ws.querySelectorAll('[style*="position: absolute"],[style*="position:absolute"]');
    items.forEach(i=>i.remove());
  }

  function mbDownload() {
    // Manual canvas-based rendering of workspace items
    const ws = document.getElementById('mb-workspace');
    if(!ws) return;
    const wr = ws.getBoundingClientRect();
    const canvas = document.createElement('canvas');
    canvas.width=wr.width; canvas.height=wr.height;
    const ctx = canvas.getContext('2d');
    // Background gradient
    const grad = ctx.createRadialGradient(wr.width*0.3,wr.height*0.3,0,wr.width*0.3,wr.height*0.3,wr.width*0.7);
    grad.addColorStop(0,'#1a0a30'); grad.addColorStop(1,'#0d0d1a');
    ctx.fillStyle=grad; ctx.fillRect(0,0,wr.width,wr.height);
    // Render each child
    ws.childNodes.forEach(child => {
      if(!(child instanceof HTMLElement)) return;
      const cs = window.getComputedStyle(child);
      const cr = child.getBoundingClientRect();
      const x=cr.left-wr.left, y=cr.top-wr.top, w=cr.width, h=cr.height;
      if(w<=0||h<=0) return;
      // Background
      const bg=cs.backgroundColor;
      if(bg && bg!=='rgba(0, 0, 0, 0)') { ctx.fillStyle=bg; ctx.beginPath(); const br=parseFloat(cs.borderRadius)||0; ctx.roundRect?ctx.roundRect(x,y,w,h,br):ctx.rect(x,y,w,h); ctx.fill(); }
      // Text
      const txt=child.textContent.replace('🗑️','').trim();
      if(txt) {
        ctx.font=`${cs.fontWeight} ${cs.fontSize} sans-serif`;
        ctx.fillStyle=cs.color||'#fff';
        ctx.fillText(txt,x+6,y+h*0.65);
      }
    });
    const a=document.createElement('a'); a.href=canvas.toDataURL('image/png'); a.download='moodboard.png'; a.click();
  }

  window.mbAddText = mbAddText;
  window.mbDownload = mbDownload;
  window.mbClear = mbClear;
} catch(e) { console.error('Moodboard error:', e); }


/* ─────────────────────────────────────────────
   4. EVRİM YARIŞI
   ───────────────────────────────────────────── */
try {
  document.body.insertAdjacentHTML('beforeend', `
<section id="evolution-sec" class="section ds-section" style="display:none;min-height:100vh;background:var(--bg);position:relative;padding:20px;box-sizing:border-box;font-family:'Segoe UI',sans-serif;">
  <button class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:100;cursor:pointer;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);color:var(--tx);padding:8px 16px;border-radius:8px;font-size:14px;" onclick="if(typeof dsGoToSection==='function') dsGoToSection('hubPage','')">◀ Ana Sayfa</button>
  <div style="text-align:center;padding-top:10px;">
    <h1 style="color:#69f0ae;font-size:2rem;text-shadow:0 0 20px #69f0ae;margin-bottom:4px;">🧬 Evrim Yarışı</h1>
    <p style="color:var(--tx2);margin-bottom:12px;">Genetik algoritmalarla yaratıklar engelleri aşmayı öğreniyor!</p>
    <div style="display:flex;gap:16px;justify-content:center;align-items:flex-start;flex-wrap:wrap;">
      <div>
        <canvas id="evo-canvas" width="700" height="280" style="border-radius:12px;background:#0a1628;border:2px solid rgba(105,240,174,0.3);box-shadow:0 0 30px rgba(105,240,174,0.15);display:block;max-width:100%;"></canvas>
        <div style="display:flex;gap:10px;justify-content:center;margin-top:12px;flex-wrap:wrap;">
          <button id="evo-start-btn" onclick="evoToggle()" style="background:linear-gradient(135deg,#00c853,#69f0ae);border:none;color:#000;padding:10px 24px;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;">▶ BAŞLAT</button>
          <button onclick="evoAccelerate()" style="background:linear-gradient(135deg,#ff6f00,#ffa000);border:none;color:#fff;padding:10px 20px;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;">⚡ HIZLANDIR</button>
          <button onclick="evoReset()" style="background:linear-gradient(135deg,#37474f,#546e7a);border:none;color:#fff;padding:10px 20px;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;">🔄 SIFIRLA</button>
        </div>
      </div>
      <div style="background:var(--card);border-radius:16px;padding:20px;min-width:200px;text-align:left;box-shadow:0 0 20px rgba(0,0,0,0.3);">
        <div style="color:var(--tx2);font-size:12px;margin-bottom:4px;">NESİL</div>
        <div id="evo-gen" style="color:#69f0ae;font-size:32px;font-weight:700;line-height:1;">1</div>
        <div style="color:var(--tx2);font-size:12px;margin:12px 0 4px;">EN İYİ UYUM</div>
        <div id="evo-best" style="color:#ffd740;font-size:24px;font-weight:700;">0</div>
        <div style="color:var(--tx2);font-size:12px;margin:12px 0 4px;">POPÜLASYON</div>
        <div id="evo-alive" style="color:#40c4ff;font-size:20px;font-weight:700;">20 / 20</div>
        <div style="color:var(--tx2);font-size:12px;margin:12px 0 4px;">ENGEL SAYISI</div>
        <div id="evo-obs" style="color:#ff5252;font-size:20px;font-weight:700;">0</div>
        <hr style="border-color:rgba(255,255,255,0.1);margin:12px 0;">
        <div style="color:var(--tx2);font-size:11px;">Generasyonlar geçtikçe<br>yaratıklar evrimleşiyor!</div>
        <div id="evo-gen-chart" style="margin-top:12px;display:flex;gap:2px;align-items:flex-end;height:60px;"></div>
      </div>
    </div>
  </div>
</section>
`);

  const EVO_POP = 20;
  const EVO_W = 700, EVO_H = 280;
  const GROUND = EVO_H - 40;
  let evoRunning=false, evoSpeed=1, evoGenNum=1, evoBestAll=0;
  let evoRAF=null, evoGen=[], evoObstacles=[], evoObsTimer=0, evoGenTimer=0;
  let evoGenHistory=[];

  function evoMakeCreature(dna) {
    return {
      x:40, y:GROUND-20, vy:0, alive:true, fitness:0,
      dna: dna||{ jumpThresh:60+Math.random()*80, jumpForce:-(5+Math.random()*4), speed:2+Math.random()*2 },
      color:`hsl(${Math.random()*360},80%,60%)`
    };
  }

  function evoInit() {
    evoGen = Array.from({length:EVO_POP}, ()=>evoMakeCreature(null));
    evoObstacles = [];
    evoObsTimer = 80+Math.random()*60;
    evoGenTimer = 0;
    evoGenNum=1;
    evoBestAll=0;
    evoGenHistory=[];
    evoSpeed=1;
    updateEvoUI();
  }

  function evoNextGen() {
    // Rank by fitness
    evoGen.sort((a,b)=>b.fitness-a.fitness);
    const best = evoGen[0].fitness;
    if(best>evoBestAll) evoBestAll=best;
    evoGenHistory.push(best);
    evoGenNum++;
    // Select top 5 as parents
    const parents = evoGen.slice(0,5);
    const newGen = [];
    while(newGen.length<EVO_POP) {
      const p = parents[Math.floor(Math.random()*parents.length)];
      const mut = r => r + (Math.random()-0.5)*r*0.3;
      const dna = {
        jumpThresh: Math.max(10,mut(p.dna.jumpThresh)),
        jumpForce: Math.min(-2,mut(p.dna.jumpForce)),
        speed: Math.max(1,Math.min(6,mut(p.dna.speed)))
      };
      newGen.push(evoMakeCreature(dna));
    }
    evoGen = newGen;
    evoObstacles = [];
    evoObsTimer = 80+Math.random()*60;
    evoGenTimer = 0;
    updateEvoUI();
  }

  function updateEvoUI() {
    const g=document.getElementById('evo-gen'), b=document.getElementById('evo-best');
    const al=document.getElementById('evo-alive'), ob=document.getElementById('evo-obs');
    if(g) g.textContent=evoGenNum;
    if(b) b.textContent=evoBestAll|0;
    if(al) { const alive=evoGen.filter(c=>c.alive).length; al.textContent=`${alive} / ${EVO_POP}`; }
    if(ob) ob.textContent=evoObstacles.length;
    // mini chart
    const chart=document.getElementById('evo-gen-chart');
    if(chart&&evoGenHistory.length>0) {
      const maxV=Math.max(...evoGenHistory,1);
      chart.innerHTML=evoGenHistory.slice(-20).map(v=>`<div style="flex:1;background:linear-gradient(to top,#69f0ae,#00c853);height:${Math.max(4,(v/maxV)*56)}px;border-radius:2px;min-width:4px;"></div>`).join('');
    }
  }

  function evoTick() {
    const canvas=document.getElementById('evo-canvas');
    if(!canvas) return;
    const ctx=canvas.getContext('2d');
    const steps=evoSpeed;
    for(let s=0;s<steps;s++) {
      // Spawn obstacles
      evoObsTimer--;
      if(evoObsTimer<=0) {
        const h=30+Math.random()*60, w=20+Math.random()*20;
        evoObstacles.push({x:EVO_W+10,y:GROUND-h,w,h,speed:2+Math.random()*2});
        evoObsTimer=80+Math.random()*80;
      }
      // Move obstacles
      evoObstacles.forEach(o=>o.x-=o.speed);
      evoObstacles=evoObstacles.filter(o=>o.x+o.w>0);
      // Update creatures
      evoGen.forEach(c=>{
        if(!c.alive) return;
        // Find nearest obstacle
        let nearDist=999;
        evoObstacles.forEach(o=>{
          if(o.x+o.w>c.x) {
            const d=o.x-(c.x+16);
            if(d>=0&&d<nearDist) nearDist=d;
          }
        });
        // Jump decision
        if(nearDist<c.dna.jumpThresh && c.y>=GROUND-21) {
          c.vy=c.dna.jumpForce;
        }
        c.vy+=0.4; // gravity
        c.y+=c.vy;
        if(c.y>=GROUND-20) { c.y=GROUND-20; c.vy=0; }
        c.fitness++;
        // Collision
        evoObstacles.forEach(o=>{
          if(c.x+14>o.x && c.x+2<o.x+o.w && c.y+18>o.y && c.y<o.y+o.h) {
            c.alive=false;
          }
        });
      });
      evoGenTimer++;
      const allDead=evoGen.every(c=>!c.alive);
      if(allDead||evoGenTimer>600) { evoNextGen(); }
    }
    // Draw
    drawEvo(ctx);
    if(evoRunning) evoRAF=requestAnimationFrame(evoTick);
  }

  function drawEvo(ctx) {
    ctx.clearRect(0,0,EVO_W,EVO_H);
    // Sky
    const sky=ctx.createLinearGradient(0,0,0,EVO_H);
    sky.addColorStop(0,'#0a1628'); sky.addColorStop(1,'#1a2840');
    ctx.fillStyle=sky; ctx.fillRect(0,0,EVO_W,EVO_H);
    // Stars
    ctx.fillStyle='rgba(255,255,255,0.4)';
    [20,80,150,250,400,550,620,680].forEach((x,i)=>{
      ctx.fillRect(x,(i%3)*40+10,1,1);
    });
    // Ground
    ctx.fillStyle='#1a3a1a';
    ctx.fillRect(0,GROUND,EVO_W,EVO_H-GROUND);
    ctx.fillStyle='#2d5a2d';
    ctx.fillRect(0,GROUND,EVO_W,4);
    // Grid lines
    ctx.strokeStyle='rgba(105,240,174,0.05)';
    ctx.lineWidth=1;
    for(let x=0;x<EVO_W;x+=50) { ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,GROUND);ctx.stroke(); }
    // Obstacles
    evoObstacles.forEach(o=>{
      const g=ctx.createLinearGradient(o.x,o.y,o.x,o.y+o.h);
      g.addColorStop(0,'#b71c1c'); g.addColorStop(1,'#d32f2f');
      ctx.fillStyle=g; ctx.fillRect(o.x,o.y,o.w,o.h);
      ctx.fillStyle='#f44336'; ctx.fillRect(o.x,o.y,o.w,4);
    });
    // Creatures
    evoGen.forEach(c=>{
      if(!c.alive) return;
      const onGround=(c.y>=GROUND-21);
      ctx.save();
      // Glow
      ctx.shadowColor=c.color; ctx.shadowBlur=12;
      // Body
      ctx.fillStyle=c.color;
      ctx.beginPath(); ctx.roundRect?ctx.roundRect(c.x,c.y,16,20,4):ctx.rect(c.x,c.y,16,20);
      ctx.fill();
      // Eyes
      ctx.shadowBlur=0;
      ctx.fillStyle='#fff';
      ctx.fillRect(c.x+3,c.y+4,4,4); ctx.fillRect(c.x+9,c.y+4,4,4);
      ctx.fillStyle='#000';
      ctx.fillRect(c.x+4,c.y+5,2,2); ctx.fillRect(c.x+10,c.y+5,2,2);
      // Legs animation
      if(onGround) {
        const legPhase=(Date.now()/100)%2>1?1:0;
        ctx.fillStyle=c.color;
        ctx.fillRect(c.x+2,c.y+20,4,4+legPhase*2);
        ctx.fillRect(c.x+10,c.y+20,4,4+(1-legPhase)*2);
      }
      ctx.restore();
    });
    // HUD
    ctx.fillStyle='rgba(0,0,0,0.5)';
    ctx.fillRect(8,8,200,30);
    ctx.fillStyle='#69f0ae';
    ctx.font='bold 13px monospace';
    const alive=evoGen.filter(c=>c.alive).length;
    ctx.fillText(`Nesil:${evoGenNum}  Yaşayan:${alive}/${EVO_POP}  En İyi:${evoBestAll|0}`,14,26);
  }

  function evoToggle() {
    const btn=document.getElementById('evo-start-btn');
    if(evoRunning) {
      evoRunning=false;
      cancelAnimationFrame(evoRAF);
      if(btn) btn.textContent='▶ DEVAM';
    } else {
      evoRunning=true;
      if(btn) btn.textContent='⏸ DURAKLAT';
      evoTick();
    }
  }

  function evoAccelerate() {
    evoSpeed=evoSpeed===1?5:evoSpeed===5?10:1;
    const btn=document.querySelector('#evolution-sec button[onclick="evoAccelerate()"]');
    if(btn) btn.textContent=evoSpeed===1?'⚡ HIZLANDIR':evoSpeed===5?'⚡⚡ SÜPER HIZ':'⚡ NORMAL';
  }

  function evoReset() {
    evoRunning=false;
    cancelAnimationFrame(evoRAF);
    const btn=document.getElementById('evo-start-btn');
    if(btn) btn.textContent='▶ BAŞLAT';
    evoInit();
    const canvas=document.getElementById('evo-canvas');
    if(canvas) { const ctx=canvas.getContext('2d'); drawEvo(ctx); }
  }

  window.evoToggle=evoToggle;
  window.evoAccelerate=evoAccelerate;
  window.evoReset=evoReset;
  evoInit();
  // Draw initial frame
  setTimeout(()=>{
    const canvas=document.getElementById('evo-canvas');
    if(canvas) { const ctx=canvas.getContext('2d'); drawEvo(ctx); }
  }, 100);
} catch(e) { console.error('Evolution error:', e); }


/* ─────────────────────────────────────────────
   5. ATEŞ & SU SİMÜLATÖRÜ
   ───────────────────────────────────────────── */
try {
  document.body.insertAdjacentHTML('beforeend', `
<section id="firewater-sec" class="section ds-section" style="display:none;min-height:100vh;background:var(--bg);position:relative;padding:20px;box-sizing:border-box;font-family:'Segoe UI',sans-serif;">
  <button class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:100;cursor:pointer;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);color:var(--tx);padding:8px 16px;border-radius:8px;font-size:14px;" onclick="if(typeof dsGoToSection==='function') dsGoToSection('hubPage','')">◀ Ana Sayfa</button>
  <div style="text-align:center;padding-top:10px;">
    <h1 style="background:linear-gradient(90deg,#ff4500,#1e90ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-size:2rem;margin-bottom:4px;">🔥 Ateş & Su Simülatörü 💧</h1>
    <p style="color:var(--tx2);margin-bottom:12px;">Elementleri seç ve kanvasa çiz!</p>
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:12px;">
      <div id="fw-tools" style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;"></div>
      <button onclick="fwClear()" style="background:linear-gradient(135deg,#37474f,#546e7a);border:none;color:#fff;padding:8px 16px;border-radius:8px;cursor:pointer;font-weight:600;">🗑️ TEMİZLE</button>
    </div>
    <div style="display:flex;gap:12px;justify-content:center;align-items:flex-start;flex-wrap:wrap;">
      <canvas id="fw-canvas" width="700" height="460" style="border-radius:12px;background:#0a0a0a;border:2px solid rgba(255,100,0,0.3);box-shadow:0 0 30px rgba(255,100,0,0.15);cursor:crosshair;touch-action:none;"></canvas>
      <div style="background:var(--card);border-radius:16px;padding:16px;min-width:160px;text-align:left;">
        <div style="color:var(--tx2);font-size:12px;margin-bottom:8px;">📊 SİMÜLASYON</div>
        <div style="color:var(--tx2);font-size:11px;margin-bottom:3px;">Parçacık Sayısı</div>
        <div id="fw-count" style="color:#ff6e00;font-size:20px;font-weight:700;margin-bottom:12px;">0</div>
        <div style="color:var(--tx2);font-size:11px;margin-bottom:3px;">Seçili Araç</div>
        <div id="fw-cur-tool" style="font-size:24px;margin-bottom:12px;">🔥</div>
        <div style="color:var(--tx2);font-size:11px;margin-bottom:3px;">Fırça Boyutu</div>
        <input type="range" id="fw-brush" min="1" max="6" value="2" style="width:100%;">
        <div id="fw-brush-val" style="color:var(--a1);font-size:12px;text-align:center;margin-top:2px;">2</div>
        <div style="margin-top:12px;color:var(--tx2);font-size:10px;line-height:1.6;">
          🔥 Ateş: Yükselir<br>
          💧 Su: Düşer, Söndürür<br>
          🏜️ Kum: Yığılır<br>
          🧊 Buz: Erir→Su<br>
          💨 Duman: Yükselir<br>
          🪨 Taş: Sabit
        </div>
      </div>
    </div>
  </div>
</section>
`);

  // Simulation config
  const FW_W=700, FW_H=460, FW_PS=3; // particle size 3px
  const FW_COLS=Math.ceil(FW_W/FW_PS), FW_ROWS=Math.ceil(FW_H/FW_PS);
  // Cell types
  const FW_EMPTY=0,FW_FIRE=1,FW_WATER=2,FW_SAND=3,FW_ICE=4,FW_SMOKE=5,FW_STONE=6;

  const FW_TOOLS=[
    {id:FW_FIRE,  label:'🔥', name:'Ateş',  color:'#ff4500'},
    {id:FW_WATER, label:'💧', name:'Su',    color:'#1e90ff'},
    {id:FW_SAND,  label:'🏜️', name:'Kum',   color:'#c2943a'},
    {id:FW_ICE,   label:'🧊', name:'Buz',   color:'#b0e0e6'},
    {id:FW_SMOKE, label:'💨', name:'Duman', color:'#888'},
    {id:FW_STONE, label:'🪨', name:'Taş',   color:'#666'},
  ];

  let fwTool=FW_FIRE, fwGrid=null, fwAge=null, fwRunning=false, fwRAF2=null, fwDrawing=false;

  function fwInitGrid() {
    fwGrid = new Uint8Array(FW_COLS*FW_ROWS);
    fwAge  = new Uint8Array(FW_COLS*FW_ROWS);
  }

  function fwIdx(c,r) { return r*FW_COLS+c; }

  function fwGet(c,r) {
    if(c<0||c>=FW_COLS||r<0||r>=FW_ROWS) return -1;
    return fwGrid[fwIdx(c,r)];
  }
  function fwSet(c,r,v,age) {
    if(c<0||c>=FW_COLS||r<0||r>=FW_ROWS) return;
    const i=fwIdx(c,r);
    fwGrid[i]=v; fwAge[i]=age||0;
  }
  function fwSwap(c1,r1,c2,r2) {
    const i=fwIdx(c1,r1), j=fwIdx(c2,r2);
    let t=fwGrid[i]; fwGrid[i]=fwGrid[j]; fwGrid[j]=t;
    t=fwAge[i]; fwAge[i]=fwAge[j]; fwAge[j]=t;
  }

  function fwStep() {
    const visited = new Uint8Array(FW_COLS*FW_ROWS);
    // Process bottom to top, left to right with randomness for water/sand
    for(let r=FW_ROWS-1;r>=0;r--) {
      const leftToRight=Math.random()>0.5;
      for(let ci=0;ci<FW_COLS;ci++) {
        const c=leftToRight?ci:(FW_COLS-1-ci);
        const idx=fwIdx(c,r);
        if(visited[idx]) continue;
        const type=fwGrid[idx];
        if(type===FW_EMPTY) continue;
        visited[idx]=1;

        if(type===FW_SAND) {
          // Fall down
          if(fwGet(c,r+1)===FW_EMPTY) { fwSwap(c,r,c,r+1); visited[fwIdx(c,r+1)]=1; }
          else if(fwGet(c,r+1)===FW_WATER) { fwSwap(c,r,c,r+1); visited[fwIdx(c,r+1)]=1; }
          else {
            const d=Math.random()>0.5?1:-1;
            if(fwGet(c+d,r+1)===FW_EMPTY||fwGet(c+d,r+1)===FW_WATER) { fwSwap(c,r,c+d,r+1); visited[fwIdx(c+d,r+1)]=1; }
            else if(fwGet(c-d,r+1)===FW_EMPTY||fwGet(c-d,r+1)===FW_WATER) { fwSwap(c,r,c-d,r+1); visited[fwIdx(c-d,r+1)]=1; }
          }
        } else if(type===FW_WATER) {
          // Check for fire nearby to extinguish
          let extinguished=false;
          [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dc,dr])=>{
            if(fwGet(c+dc,r+dr)===FW_FIRE) { fwSet(c+dc,r+dr,FW_SMOKE,5); fwSet(c,r,FW_EMPTY,0); extinguished=true; }
          });
          if(extinguished) continue;
          // Fall down
          if(fwGet(c,r+1)===FW_EMPTY) { fwSwap(c,r,c,r+1); visited[fwIdx(c,r+1)]=1; }
          else {
            const d=Math.random()>0.5?1:-1;
            if(fwGet(c+d,r)===FW_EMPTY) { fwSwap(c,r,c+d,r); visited[fwIdx(c+d,r)]=1; }
            else if(fwGet(c-d,r)===FW_EMPTY) { fwSwap(c,r,c-d,r); visited[fwIdx(c-d,r)]=1; }
          }
        } else if(type===FW_FIRE) {
          fwAge[idx]++;
          // Rise and spread
          if(fwAge[idx]>80+Math.random()*40) { fwSet(c,r,FW_SMOKE,0); continue; }
          // Spawn smoke above
          if(Math.random()<0.05&&fwGet(c,r-1)===FW_EMPTY) fwSet(c,r-1,FW_SMOKE,0);
          // Spread fire
          if(Math.random()<0.02) {
            const d=Math.random()>0.5?1:-1;
            if(fwGet(c+d,r)===FW_EMPTY) { fwSet(c+d,r,FW_FIRE,0); visited[fwIdx(c+d,r)]=1; }
          }
          // Rise
          if(fwGet(c,r-1)===FW_EMPTY&&Math.random()<0.3) { fwSwap(c,r,c,r-1); visited[fwIdx(c,r-1)]=1; }
        } else if(type===FW_SMOKE) {
          fwAge[idx]++;
          if(fwAge[idx]>60+Math.random()*60) { fwSet(c,r,FW_EMPTY,0); continue; }
          // Rise
          if(fwGet(c,r-1)===FW_EMPTY&&Math.random()<0.5) { fwSwap(c,r,c,r-1); visited[fwIdx(c,r-1)]=1; }
          else {
            const d=Math.random()>0.5?1:-1;
            if(fwGet(c+d,r-1)===FW_EMPTY) { fwSwap(c,r,c+d,r-1); visited[fwIdx(c+d,r-1)]=1; }
            else if(fwGet(c+d,r)===FW_EMPTY) { fwSwap(c,r,c+d,r); visited[fwIdx(c+d,r)]=1; }
          }
        } else if(type===FW_ICE) {
          // Check for fire neighbor → melt
          let melt=false;
          [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dc,dr])=>{
            if(fwGet(c+dc,r+dr)===FW_FIRE) melt=true;
          });
          if(melt&&Math.random()<0.05) { fwSet(c,r,FW_WATER,0); }
        }
        // FW_STONE: static, do nothing
      }
    }
  }

  function fwDraw() {
    const canvas=document.getElementById('fw-canvas');
    if(!canvas) return;
    const ctx=canvas.getContext('2d');
    const img=ctx.createImageData(FW_W,FW_H);
    const d=img.data;
    // Colors per type
    for(let r=0;r<FW_ROWS;r++) {
      for(let c=0;c<FW_COLS;c++) {
        const type=fwGrid[fwIdx(c,r)];
        if(type===FW_EMPTY) continue;
        const age=fwAge[fwIdx(c,r)];
        let R=0,G=0,B=0,A=255;
        if(type===FW_FIRE) {
          const t=Math.min(age/60,1);
          R=255; G=Math.max(0,180-age*2)|0; B=0;
          if(Math.random()<0.1){R=255;G=Math.random()*100|0;B=0;}
        } else if(type===FW_WATER) {
          R=30+Math.random()*20|0; G=100+Math.random()*20|0; B=220+Math.random()*35|0;
        } else if(type===FW_SAND) {
          R=194+Math.random()*20-10|0; G=148+Math.random()*10|0; B=58+Math.random()*10|0;
        } else if(type===FW_ICE) {
          R=176+Math.random()*10|0; G=224+Math.random()*10|0; B=230+Math.random()*10|0;
        } else if(type===FW_SMOKE) {
          const a=Math.max(0,1-(age/120));
          R=G=B=100+Math.random()*40|0; A=a*200|0;
        } else if(type===FW_STONE) {
          R=G=B=80+Math.random()*20|0;
        }
        // Fill PS×PS pixels
        for(let py=0;py<FW_PS&&r*FW_PS+py<FW_H;py++) {
          for(let px=0;px<FW_PS&&c*FW_PS+px<FW_W;px++) {
            const pi=((r*FW_PS+py)*FW_W+(c*FW_PS+px))*4;
            d[pi]=R; d[pi+1]=G; d[pi+2]=B; d[pi+3]=A;
          }
        }
      }
    }
    ctx.putImageData(img,0,0);
    // Count
    let cnt=0;
    for(let i=0;i<fwGrid.length;i++) if(fwGrid[i]!==FW_EMPTY) cnt++;
    const countEl=document.getElementById('fw-count');
    if(countEl) countEl.textContent=cnt;
  }

  function fwLoop() {
    fwStep();
    fwDraw();
    if(fwRunning) fwRAF2=requestAnimationFrame(fwLoop);
  }

  function fwClear() {
    fwInitGrid();
    fwDraw();
  }

  function fwSpawnAt(px,py) {
    const c=Math.floor(px/FW_PS), r=Math.floor(py/FW_PS);
    const br=parseInt(document.getElementById('fw-brush').value)||2;
    for(let dc=-br;dc<=br;dc++) {
      for(let dr=-br;dr<=br;dr++) {
        if(dc*dc+dr*dr<=br*br && Math.random()<0.7) {
          fwSet(c+dc,r+dr,fwTool,0);
        }
      }
    }
  }

  // Build tool buttons
  const fwToolsEl=document.getElementById('fw-tools');
  FW_TOOLS.forEach(t=>{
    const btn=document.createElement('button');
    btn.id=`fw-btn-${t.id}`;
    btn.style.cssText=`background:rgba(255,255,255,0.08);border:2px solid ${t.id===FW_FIRE?t.color:'rgba(255,255,255,0.2)'};color:#fff;padding:8px 14px;border-radius:10px;cursor:pointer;font-size:20px;transition:all 0.2s;`;
    btn.title=t.name;
    btn.textContent=t.label;
    btn.addEventListener('click',()=>{
      fwTool=t.id;
      document.querySelectorAll('#fw-tools button').forEach(b=>b.style.borderColor='rgba(255,255,255,0.2)');
      btn.style.borderColor=t.color;
      btn.style.boxShadow=`0 0 12px ${t.color}88`;
      const curEl=document.getElementById('fw-cur-tool');
      if(curEl) curEl.textContent=t.label;
    });
    fwToolsEl.appendChild(btn);
  });

  const fwCanvas=document.getElementById('fw-canvas');
  if(fwCanvas) {
    fwCanvas.addEventListener('mousedown', e=>{ fwDrawing=true; const r=fwCanvas.getBoundingClientRect(); fwSpawnAt(e.clientX-r.left,e.clientY-r.top); });
    fwCanvas.addEventListener('mousemove', e=>{ if(!fwDrawing) return; const r=fwCanvas.getBoundingClientRect(); fwSpawnAt(e.clientX-r.left,e.clientY-r.top); });
    fwCanvas.addEventListener('mouseup', ()=>fwDrawing=false);
    fwCanvas.addEventListener('mouseleave', ()=>fwDrawing=false);
    // Touch
    fwCanvas.addEventListener('touchstart', e=>{ e.preventDefault(); fwDrawing=true; const r=fwCanvas.getBoundingClientRect(); fwSpawnAt(e.touches[0].clientX-r.left,e.touches[0].clientY-r.top); },{passive:false});
    fwCanvas.addEventListener('touchmove', e=>{ e.preventDefault(); if(!fwDrawing) return; const r=fwCanvas.getBoundingClientRect(); fwSpawnAt(e.touches[0].clientX-r.left,e.touches[0].clientY-r.top); },{passive:false});
    fwCanvas.addEventListener('touchend', ()=>fwDrawing=false);
  }

  const fwBrushInput=document.getElementById('fw-brush');
  if(fwBrushInput) fwBrushInput.addEventListener('input',()=>{ const v=document.getElementById('fw-brush-val'); if(v) v.textContent=fwBrushInput.value; });

  window.fwClear=fwClear;

  fwInitGrid();
  fwRunning=true;
  // Start loop when section is visible
  function fwStartIfVisible() {
    const sec=document.getElementById('firewater-sec');
    if(!sec) return;
    const obs=new IntersectionObserver(entries=>{
      entries.forEach(en=>{
        if(en.isIntersecting&&!fwRAF2) { fwRunning=true; fwRAF2=requestAnimationFrame(fwLoop); }
        else if(!en.isIntersecting) { fwRunning=false; cancelAnimationFrame(fwRAF2); fwRAF2=null; }
      });
    },{threshold:0.1});
    obs.observe(sec);
  }
  fwStartIfVisible();
  // Also draw initial frame
  setTimeout(()=>fwDraw(),200);
} catch(e) { console.error('FireWater error:', e); }
