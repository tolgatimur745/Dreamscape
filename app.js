
/* ══ GLOBAL MENU TOGGLE (failsafe) ══ */
function menuToggle() {
  var o = document.getElementById('menuOverlay');
  var h = document.getElementById('menuHamburger');
  if (!o) return;
  var isOpen = o.classList.contains('open');
  if (isOpen) {
    o.classList.remove('open');
    if (h) h.classList.remove('open');
    document.body.style.overflow = '';
  } else {
    o.classList.add('open');
    if (h) h.classList.add('open');
    document.body.style.overflow = 'hidden';
    o.scrollTop = 0;
    var ms = document.getElementById('menuSearch');
    if (ms) { ms.value = ''; document.querySelectorAll('.menu-card').forEach(function(c){ c.classList.remove('hidden'); }); }
  }
}

var _menuBackBtn = document.getElementById('menuBackBtn');
if (_menuBackBtn) _menuBackBtn.addEventListener('click', function(){ menuToggle(); });
document.addEventListener('keydown', function(e){
  var tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
  if (tag === 'input' || tag === 'textarea') return;
  if (e.key === 'Escape') { var o = document.getElementById('menuOverlay'); if (o && o.classList.contains('open')) menuToggle(); }
});
'use strict';
// ============================================================
//  DREAMSCAPE v4 — Error-isolated game engine
//  Each game runs inside try/catch so one failure never
//  stops the rest of the page from working.
// ============================================================

window.onerror = function(m,s,l){ console.error('GLOBAL JS ERROR line '+l+': '+m); };

/* ── Shared helpers ──────────────────────────────────────── */
var TOAST_EL = document.getElementById('toast');
var TOAST_TMR;
function toast(msg, col) {
  TOAST_EL.textContent = msg;
  TOAST_EL.style.background = (col || '#7c4dff') + 'ee';
  TOAST_EL.classList.add('show');
  clearTimeout(TOAST_TMR);
  TOAST_TMR = setTimeout(function(){ TOAST_EL.classList.remove('show'); }, 2700);
}

function $(id){ return document.getElementById(id); }
function on(id, evt, fn){ var el=$(id); if(el) el.addEventListener(evt, fn); }

/* ── Page Visibility API — tüm animasyonları duraklat ────── */
var PAGE_VISIBLE = true;
document.addEventListener('visibilitychange', function(){
  PAGE_VISIBLE = !document.hidden;
});

/* ── Performans Yöneticisi ──────────────────────────────── */
// FPS limiter — verilen FPS'e göre her frame için true/false döndür
function makeFPSGate(targetFPS) {
  var interval = 1000 / targetFPS;
  var last = 0;
  return function(now) {
    if (now - last < interval) return false;
    last = now;
    return true;
  };
}

// IntersectionObserver ile canvas'ları viewport'a göre durdur/çalıştır
var CANVAS_VISIBLE = {}; // canvasId -> bool
(function setupCanvasObserver() {
  if (!window.IntersectionObserver) {
    // Polyfill: hepsini görünür say
    document.querySelectorAll('canvas').forEach(function(c) {
      if (c.id) CANVAS_VISIBLE[c.id] = true;
    });
    return;
  }
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.target.id) CANVAS_VISIBLE[e.target.id] = e.isIntersecting;
    });
  }, { threshold: 0.01 });
  // Biraz gecikmeyle başlat — DOM tam yüklendikten sonra
  setTimeout(function() {
    document.querySelectorAll('canvas').forEach(function(c) {
      if (c.id) { CANVAS_VISIBLE[c.id] = false; obs.observe(c); }
    });
  }, 500);
})();

function isCanvasActive(canvasId) {
  return PAGE_VISIBLE && (CANVAS_VISIBLE[canvasId] !== false);
}

/* ── Navbar ──────────────────────────────────────────────── */
try {
  var _scrollTicking = false;
  window.addEventListener('scroll', function(){
    if (!_scrollTicking) {
      requestAnimationFrame(function(){
        $('navbar').classList.toggle('scrolled', window.scrollY > 50);
        _scrollTicking = false;
      });
      _scrollTicking = true;
    }
  }, {passive: true});
  function tick_clock(){
    if (!PAGE_VISIBLE) return;
    var el = $('navTime');
    if(el) el.textContent = new Date().toLocaleTimeString('tr-TR');
  }
  setInterval(tick_clock, 1000); tick_clock();
  var SES_START = Date.now();
  setInterval(function(){
    if (!PAGE_VISIBLE) return;
    var el=$('sessionTime');
    if(el) el.textContent='⏱️ Bu oturumda: '+Math.floor((Date.now()-SES_START)/60000)+' dk';
  }, 60000);
} catch(e){ console.error('Navbar error',e); }

/* ── Particles ───────────────────────────────────────────── */
try {
  var pc = $('particleCanvas');
  var pcx = pc.getContext('2d');
  var PW, PH, PTS = [];
  function presize(){
    PW = pc.width = innerWidth;
    PH = pc.height = innerHeight;
  }
  var _presizeTmr;
  window.addEventListener('resize', function(){
    clearTimeout(_presizeTmr);
    _presizeTmr = setTimeout(presize, 200);
  }, {passive:true});
  presize();
  /* 30 parçacık, 15 FPS — arkaplan dekorasyon için yeterli */
  for(var pi=0;pi<30;pi++) PTS.push({
    x:Math.random()*PW, y:Math.random()*PH,
    vx:(Math.random()-.5)*.18, vy:(Math.random()-.5)*.18,
    r:Math.random()*1.2+.4, h:Math.random()*80+215, ph:Math.random()*Math.PI*2
  });
  var _pFPSGate = makeFPSGate(15);
  (function ploop(now){
    requestAnimationFrame(ploop);
    if (!isCanvasActive('particleCanvas')) return;
    if (!_pFPSGate(now || 0)) return;
    pcx.clearRect(0,0,PW,PH);
    PTS.forEach(function(p){
      p.x+=p.vx; p.y+=p.vy; p.ph+=.04;
      if(p.x<0||p.x>PW) p.vx*=-1;
      if(p.y<0||p.y>PH) p.vy*=-1;
      var a=.08+Math.abs(Math.sin(p.ph))*.28;
      pcx.globalAlpha=a;
      pcx.fillStyle='hsl('+p.h+',70%,65%)';
      pcx.beginPath(); pcx.arc(p.x,p.y,p.r,0,Math.PI*2); pcx.fill();
    });
    pcx.globalAlpha=1;
  })(0);
} catch(e){ console.error('Particles error',e); }

/* ── Helper: rounded rect ─────────────────────────────────── */
function rrect(ctx,x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r);
  ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
  ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r);
  ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r);
  ctx.closePath();
}

/* ══════════════════════════════════════════════════════════
   1. SNAKE
══════════════════════════════════════════════════════════ */
try {
  var SK = {
    area: $('snakeArea'), canvas: $('snakeCanvas'), overlay: $('snakeOverlay'),
    scoreEl: $('snakeScore'), bestEl: $('snakeBest'),
    CELL:20, cols:0, rows:0,
    snake:[], dir:{x:1,y:0}, ndir:{x:1,y:0},
    food:{x:0,y:0}, score:0, best:0, loop:null, running:false
  };
  var ctx_sk = SK.canvas.getContext('2d');

  function sk_setup(){
    var w = SK.area.clientWidth||280;
    SK.canvas.width = Math.floor(w/SK.CELL)*SK.CELL;
    SK.canvas.height = SK.canvas.width;
    SK.cols = SK.canvas.width/SK.CELL;
    SK.rows = SK.canvas.height/SK.CELL;
  }
  function sk_food(){
    var p;
    do { p={x:Math.floor(Math.random()*SK.cols),y:Math.floor(Math.random()*SK.rows)}; }
    while(SK.snake.some(function(s){return s.x===p.x&&s.y===p.y;}));
    SK.food=p;
  }
  function sk_draw(){
    var W=SK.canvas.width, H=SK.canvas.height;
    ctx_sk.fillStyle='#07080f'; ctx_sk.fillRect(0,0,W,H);
    ctx_sk.strokeStyle='rgba(255,255,255,.025)'; ctx_sk.lineWidth=.5;
    for(var x=0;x<=W;x+=SK.CELL){ctx_sk.beginPath();ctx_sk.moveTo(x,0);ctx_sk.lineTo(x,H);ctx_sk.stroke();}
    for(var y=0;y<=H;y+=SK.CELL){ctx_sk.beginPath();ctx_sk.moveTo(0,y);ctx_sk.lineTo(W,y);ctx_sk.stroke();}
    ctx_sk.save(); ctx_sk.shadowColor='#ff6b9d'; ctx_sk.shadowBlur=16;
    ctx_sk.fillStyle='#ff6b9d';
    ctx_sk.beginPath(); ctx_sk.arc(SK.food.x*SK.CELL+SK.CELL/2,SK.food.y*SK.CELL+SK.CELL/2,SK.CELL/2-2,0,Math.PI*2); ctx_sk.fill();
    ctx_sk.restore();
    SK.snake.forEach(function(s,i){
      var hue=262+i/SK.snake.length*30;
      ctx_sk.save();
      if(i===0){ctx_sk.shadowColor='#7c4dff';ctx_sk.shadowBlur=14;}
      ctx_sk.fillStyle=i===0?'#7c4dff':'hsl('+hue+',65%,55%)';
      var p=i===0?1:2;
      rrect(ctx_sk,s.x*SK.CELL+p,s.y*SK.CELL+p,SK.CELL-p*2,SK.CELL-p*2,4);
      ctx_sk.fill(); ctx_sk.restore();
    });
  }
  function sk_step(){
    SK.dir=SK.ndir;
    var h={x:SK.snake[0].x+SK.dir.x, y:SK.snake[0].y+SK.dir.y};
    if(h.x<0||h.x>=SK.cols||h.y<0||h.y>=SK.rows||SK.snake.some(function(s){return s.x===h.x&&s.y===h.y;})){
      clearInterval(SK.loop); SK.running=false;
      SK.overlay.innerHTML='<div class="overlay-icon">💀</div><p>Skor: <strong style="color:#7c4dff">'+SK.score+'</strong></p><button class="play-btn" id="snakeRestartBtn" style="width:auto;padding:10px 28px">🔄 Tekrar</button>';
      SK.overlay.classList.remove('hidden');
      on('snakeRestartBtn','click',sk_start);
      return;
    }
    SK.snake.unshift(h);
    if(h.x===SK.food.x&&h.y===SK.food.y){
      SK.score++; SK.scoreEl.textContent=SK.score;
      if(SK.score>SK.best){SK.best=SK.score;SK.bestEl.textContent=SK.best;}
      sk_food();
    } else { SK.snake.pop(); }
    sk_draw();
  }
  function sk_start(){
    sk_setup();
    var mid={x:Math.floor(SK.cols/2),y:Math.floor(SK.rows/2)};
    SK.snake=[mid,{x:mid.x-1,y:mid.y}];
    SK.dir={x:1,y:0}; SK.ndir={x:1,y:0};
    SK.score=0; SK.scoreEl.textContent=0;
    sk_food(); sk_draw();
    SK.overlay.classList.add('hidden');
    clearInterval(SK.loop); SK.running=true;
    SK.loop=setInterval(sk_step,140);
  }
  document.addEventListener('keydown',function(e){
    if(!SK.running) return;
    var M={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]};
    var mv=M[e.key]; if(!mv) return;
    if(mv[0]===-SK.dir.x&&mv[1]===-SK.dir.y) return;
    SK.ndir={x:mv[0],y:mv[1]}; e.preventDefault();
  });
  on('snakeStartBtn','click',sk_start);
  setTimeout(function(){sk_setup();sk_draw();},100);
} catch(e){ console.error('Snake error',e); }

/* ══════════════════════════════════════════════════════════
   2. MEMORY CARDS
══════════════════════════════════════════════════════════ */
try {
  var MEM = {
    grid:$('memoryGrid'), movEl:$('memoryMoves'), matEl:$('memoryMatches'),
    EMOJIS:['🌸','🦋','🌈','⭐','🎵','🍭','🦄','🌙'],
    flipped:[], matched:0, moves:0, locked:false
  };
  function mem_shuffle(a){ return a.slice().sort(function(){return Math.random()-.5;}); }
  function mem_build(){
    var deck=mem_shuffle(MEM.EMOJIS.concat(MEM.EMOJIS));
    MEM.grid.innerHTML=''; MEM.flipped=[]; MEM.matched=0; MEM.moves=0;
    MEM.movEl.textContent=0; MEM.matEl.textContent=0;
    deck.forEach(function(em){
      var c=document.createElement('div'); c.className='mem-card'; c.dataset.val=em;
      c.innerHTML='<div class="card-back">✦</div><div class="card-front">'+em+'</div>';
      c.addEventListener('click',function(){mem_flip(c);});
      MEM.grid.appendChild(c);
    });
  }
  function mem_flip(card){
    if(MEM.locked||card.classList.contains('flipped')||card.classList.contains('matched')) return;
    card.classList.add('flipped'); MEM.flipped.push(card);
    if(MEM.flipped.length===2){
      MEM.locked=true; MEM.moves++; MEM.movEl.textContent=MEM.moves;
      var a=MEM.flipped[0],b=MEM.flipped[1];
      if(a.dataset.val===b.dataset.val){
        a.classList.add('matched'); b.classList.add('matched');
        MEM.matched++; MEM.matEl.textContent=MEM.matched;
        MEM.flipped=[]; MEM.locked=false;
        if(MEM.matched===MEM.EMOJIS.length) setTimeout(function(){toast('🎉 Tebrikler! '+MEM.moves+' hamlede!','#69f0ae');},200);
      } else {
        setTimeout(function(){a.classList.remove('flipped');b.classList.remove('flipped');MEM.flipped=[];MEM.locked=false;},900);
      }
    }
  }
  on('resetMemory','click',mem_build);
  mem_build();
} catch(e){ console.error('Memory error',e); }

/* ══════════════════════════════════════════════════════════
   3. BUBBLE POP
══════════════════════════════════════════════════════════ */
try {
  var BUB = {
    arena:$('bubbleArena'), cntEl:$('bubbleCount'), scEl:$('bubbleScore'),
    popped:0, score:0,
    ICONS:['🌸','⭐','💎','🎈','🌈','✨','🦋','🎵','💫','🍀','🌺','💜'],
    PALS:['rgba(124,77,255,.8)','rgba(255,107,157,.8)','rgba(0,229,255,.8)','rgba(105,240,174,.8)','rgba(255,234,0,.8)','rgba(255,112,67,.8)'],
    GLOWS:['rgba(124,77,255,.4)','rgba(255,107,157,.4)','rgba(0,229,255,.4)','rgba(105,240,174,.4)','rgba(255,234,0,.4)','rgba(255,112,67,.4)']
  };
  function bub_make(){
    var sz=Math.random()*36+32, pi=Math.floor(Math.random()*BUB.PALS.length);
    var dur=(Math.random()*3+3).toFixed(1), del=(Math.random()*2).toFixed(1);
    var pts=Math.max(10,Math.round(75-sz));
    var b=document.createElement('div'); b.className='bubble';
    b.style.cssText='width:'+sz+'px;height:'+sz+'px;left:'+(Math.random()*80+2)+'%;top:'+(Math.random()*60+8)+'%;font-size:'+Math.round(sz*.37)+'px;background:radial-gradient(circle at 30% 30%,rgba(255,255,255,.55) 0%,'+BUB.PALS[pi]+' 60%);box-shadow:0 0 14px '+BUB.GLOWS[pi]+';--bd:'+dur+'s;--bdd:'+del+'s';
    b.textContent=BUB.ICONS[Math.floor(Math.random()*BUB.ICONS.length)];
    b.addEventListener('click',function(e){
      e.stopPropagation();
      if(b.dataset.p) return; b.dataset.p='1';
      b.style.animation='bpop .22s ease forwards';
      BUB.popped++; BUB.score+=pts;
      BUB.cntEl.textContent=BUB.popped; BUB.scEl.textContent=BUB.score;
      setTimeout(function(){b.remove();if(BUB.arena.querySelectorAll('.bubble').length<5)bub_batch(4);},220);
    });
    return b;
  }
  function bub_batch(n){for(var i=0;i<n;i++)(function(d){setTimeout(function(){BUB.arena.appendChild(bub_make());},d);})(i*80);}
  on('addBubbles','click',function(){bub_batch(5);});
  bub_batch(8);
} catch(e){ console.error('Bubble error',e); }

/* ══════════════════════════════════════════════════════════
   4. REACTION TIME
══════════════════════════════════════════════════════════ */
try {
  var RT = {
    circle:$('reactionCircle'),
    lastEl:$('rtLast'), bestEl:$('rtBest'), avgEl:$('rtAvg'),
    state:'idle', t0:0, tmr:null, results:[]
  };
  function rt_set(s){
    RT.state=s;
    var c=RT.circle;
    c.className='reaction-circle'+(s==='waiting'?' waiting':s==='go'?' go':'');
    if(s==='idle') c.textContent='Tıkla!';
    else if(s==='waiting') c.textContent='Bekle...';
    else if(s==='go') c.textContent='ŞIMDI!';
  }
  RT.circle.addEventListener('click',function(){
    if(RT.state==='idle'){
      rt_set('waiting');
      RT.tmr=setTimeout(function(){rt_set('go');RT.t0=Date.now();},1600+Math.random()*2800);
    } else if(RT.state==='waiting'){
      clearTimeout(RT.tmr); rt_set('idle');
      toast('😅 Çok erken! Yeşili bekle!','#ff6b9d');
    } else if(RT.state==='go'){
      var ms=Date.now()-RT.t0; RT.results.push(ms);
      RT.lastEl.textContent=ms+'ms';
      RT.bestEl.textContent=Math.min.apply(null,RT.results)+'ms';
      RT.avgEl.textContent=Math.round(RT.results.reduce(function(a,b){return a+b;},0)/RT.results.length)+'ms';
      rt_set('idle');
      toast((ms<180?'🚀 İnanılmaz!':ms<280?'⚡ Harika!':'🎯 İyi!')+' '+ms+'ms', ms<280?'#69f0ae':'#7c4dff');
    }
  });
  rt_set('idle');
} catch(e){ console.error('Reaction error',e); }

/* ══════════════════════════════════════════════════════════
   5. COLOR MATCH
══════════════════════════════════════════════════════════ */
try {
  var CM = {
    target:$('colorTarget'), optsEl:$('colorOptions'), scoreEl:$('colorScore'), livesEl:$('colorLives'),
    COLORS:[
      {n:'Mor',h:'#7c4dff'},{n:'Pembe',h:'#ff6b9d'},{n:'Camgöbeği',h:'#00e5ff'},
      {n:'Nane Yeşili',h:'#69f0ae'},{n:'Altın Sarısı',h:'#ffea00'},{n:'Turuncu',h:'#ff7043'},
      {n:'Lavanta',h:'#ce93d8'},{n:'Mercan',h:'#ff7675'},{n:'Kırmızı',h:'#ef5350'},
      {n:'Teal',h:'#26a69a'},{n:'İndigo',h:'#5c6bc0'},{n:'Lime',h:'#c6ef00'}
    ],
    score:0, lives:3, correct:null, locked:false
  };
  function cm_shuffle(a){return a.slice().sort(function(){return Math.random()-.5;});}
  function cm_round(){
    if(CM.lives<=0){cm_over();return;}
    CM.locked=false;
    var pool=cm_shuffle(CM.COLORS), correct=pool[0], choices=cm_shuffle(pool.slice(0,4));
    CM.correct=correct;
    CM.target.style.background=correct.h;
    CM.target.style.boxShadow='0 0 20px '+correct.h+'88';
    CM.optsEl.innerHTML='';
    choices.forEach(function(c){
      var btn=document.createElement('button');
      btn.className='color-opt'; btn.textContent=c.n;
      btn.addEventListener('click',function(){
        if(CM.locked) return; CM.locked=true;
        if(c.h===CM.correct.h){
          btn.classList.add('correct'); CM.score++; CM.scoreEl.textContent=CM.score;
          toast('✅ Doğru! +1','#69f0ae'); setTimeout(cm_round,1000);
        } else {
          btn.classList.add('wrong');
          CM.optsEl.querySelectorAll('.color-opt').forEach(function(b){if(b.textContent===CM.correct.n)b.classList.add('correct');});
          CM.lives--; CM.livesEl.textContent='❤️'.repeat(Math.max(0,CM.lives));
          toast('❌ Cevap: '+CM.correct.n,'#ff6b9d'); setTimeout(cm_round,1300);
        }
      });
      CM.optsEl.appendChild(btn);
    });
  }
  function cm_over(){
    CM.optsEl.innerHTML='';
    var d=document.createElement('div'); d.style.cssText='grid-column:1/-1;text-align:center;padding:.5rem';
    d.innerHTML='<p style="font-size:1.5rem">🎯</p><p>Bitti! Skor: <strong style="color:var(--a3)">'+CM.score+'</strong></p>';
    var rb=document.createElement('button'); rb.className='play-btn'; rb.textContent='🔄 Tekrar'; rb.style.marginTop='.7rem';
    rb.onclick=function(){CM.score=0;CM.lives=3;CM.scoreEl.textContent=0;CM.livesEl.textContent='❤️❤️❤️';cm_round();};
    d.appendChild(rb); CM.optsEl.appendChild(d);
  }
  cm_round();
} catch(e){ console.error('ColorMatch error',e); }

/* ══════════════════════════════════════════════════════════
   6. 15 PUZZLE
══════════════════════════════════════════════════════════ */
try {
  var PZ = { grid:$('puzzleGrid'), movEl:$('puzzleMoves'), SIZE:4, tiles:[], moves:0 };
  function pz_inv(arr){
    var n=0;
    for(var i=0;i<arr.length-1;i++) for(var j=i+1;j<arr.length;j++) if(arr[i]&&arr[j]&&arr[i]>arr[j]) n++;
    return n;
  }
  function pz_ok(arr){
    var inv=pz_inv(arr), br=PZ.SIZE-Math.floor(arr.indexOf(0)/PZ.SIZE);
    return (inv+br)%2===0;
  }
  function pz_solved(arr){return arr.every(function(t,i){return t===(i+1)%16;});}
  function pz_init(){
    do {
      PZ.tiles=[]; for(var i=0;i<16;i++) PZ.tiles.push(i);
      for(var j=PZ.tiles.length-1;j>0;j--){var k=Math.floor(Math.random()*(j+1));var tmp=PZ.tiles[j];PZ.tiles[j]=PZ.tiles[k];PZ.tiles[k]=tmp;}
    } while(!pz_ok(PZ.tiles)||pz_solved(PZ.tiles));
    PZ.moves=0; PZ.movEl.textContent=0; pz_render();
  }
  function pz_render(){
    PZ.grid.innerHTML='';
    PZ.tiles.forEach(function(n,i){
      var t=document.createElement('div');
      t.className='p-tile'+(n===0?' empty':'');
      if(n!==0){
        t.textContent=n;
        var hue=230+n/16*80;
        t.style.background='linear-gradient(135deg,hsl('+hue+',70%,48%),hsl('+(hue+22)+',70%,60%))';
      }
      t.addEventListener('click',function(){pz_move(i);});
      PZ.grid.appendChild(t);
    });
  }
  function pz_move(idx){
    var ei=PZ.tiles.indexOf(0);
    var r=Math.floor(idx/PZ.SIZE),c=idx%PZ.SIZE,er=Math.floor(ei/PZ.SIZE),ec=ei%PZ.SIZE;
    if(Math.abs(r-er)+Math.abs(c-ec)!==1) return;
    var tmp=PZ.tiles[idx]; PZ.tiles[idx]=PZ.tiles[ei]; PZ.tiles[ei]=tmp;
    PZ.moves++; PZ.movEl.textContent=PZ.moves; pz_render();
    if(pz_solved(PZ.tiles)) setTimeout(function(){toast('🎉 '+PZ.moves+' hamlede çözdün!','#69f0ae');},80);
  }
  on('resetPuzzle','click',pz_init);
  pz_init();
} catch(e){ console.error('Puzzle error',e); }

/* ══════════════════════════════════════════════════════════
   7. WHACK-A-MOLE
══════════════════════════════════════════════════════════ */
try {
  var WM = {
    scoreEl:$('moleScore'), timeEl:$('moleTime'), startBtn:$('moleStartBtn'),
    moles:[], active:{}, score:0, timeLeft:30, running:false,
    popTmr:null, countTmr:null
  };
  for(var wmi=0;wmi<9;wmi++) WM.moles.push($('mole'+wmi));
  var WM_HOLES = document.querySelectorAll('.mole-hole');
  var WM_ICONS = ['🐹','🦔','🐭','🐱'];

  function wm_pop(){
    if(!WM.running) return;
    var avail=[];
    for(var i=0;i<9;i++) if(!WM.active[i]) avail.push(i);
    if(!avail.length) return;
    var idx=avail[Math.floor(Math.random()*avail.length)];
    WM.active[idx]=true;
    WM.moles[idx].textContent=WM_ICONS[Math.floor(Math.random()*WM_ICONS.length)];
    WM.moles[idx].classList.add('up');
    var dur=Math.max(550,1300-WM.score*25);
    setTimeout(function(){
      if(WM.moles[idx].classList.contains('up')){
        WM.moles[idx].classList.remove('up');
        WM.moles[idx].textContent='';
        WM.active[idx]=false;
      }
    },dur);
  }
  function wm_start(){
    WM.score=0; WM.timeLeft=30; WM.active={};
    WM.scoreEl.textContent=0; WM.timeEl.textContent=30;
    WM.running=true; WM.startBtn.disabled=true; WM.startBtn.textContent='⏸ Oynuyor...';
    WM.moles.forEach(function(m){m.classList.remove('up');m.textContent='';});
    WM.popTmr=setInterval(function(){
      if(!WM.running) return;
      var n=Math.min(3,1+Math.floor(WM.score/8));
      for(var i=0;i<n;i++) setTimeout(wm_pop,i*180);
    },800);
    WM.countTmr=setInterval(function(){
      WM.timeLeft--;
      WM.timeEl.textContent=WM.timeLeft;
      if(WM.timeLeft<=0) wm_end();
    },1000);
  }
  function wm_end(){
    WM.running=false;
    clearInterval(WM.popTmr); clearInterval(WM.countTmr);
    WM.moles.forEach(function(m){m.classList.remove('up');m.textContent='';});
    WM.active={};
    WM.startBtn.disabled=false; WM.startBtn.textContent='▶ Tekrar';
    toast('🐹 Bitti! Skor: '+WM.score,'#ffea00');
  }
  WM_HOLES.forEach(function(hole){
    hole.addEventListener('click',function(){
      var idx=parseInt(hole.dataset.hole,10);
      if(!WM.running||!WM.active[idx]||!WM.moles[idx].classList.contains('up')) return;
      WM.score++; WM.scoreEl.textContent=WM.score;
      WM.moles[idx].textContent='💥';
      WM.moles[idx].classList.remove('up');
      setTimeout(function(){WM.moles[idx].textContent='';WM.active[idx]=false;},280);
    });
  });
  WM.startBtn.addEventListener('click',function(){if(!WM.running) wm_start();});
} catch(e){ console.error('Whack-a-mole error',e); }

/* ══════════════════════════════════════════════════════════
   8. TIC TAC TOE
══════════════════════════════════════════════════════════ */
try {
  var TTT = {
    cells: Array.from(document.querySelectorAll('.ttt-cell')),
    status:$('tttStatus'), wEl:$('tttWin'), dEl:$('tttDraw'), lEl:$('tttLose'),
    board:[], playerTurn:true, aiThinking:false, over:false,
    sc:{w:0,d:0,l:0},
    WINS:[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
  };
  function ttt_winner(b){
    for(var i=0;i<TTT.WINS.length;i++){
      var L=TTT.WINS[i];
      if(b[L[0]]&&b[L[0]]===b[L[1]]&&b[L[1]]===b[L[2]]) return b[L[0]];
    }
    return b.every(Boolean)?'draw':null;
  }
  function ttt_mm(b,ai,a,be){
    var w=ttt_winner(b);
    if(w==='X') return 10; if(w==='O') return -10; if(w==='draw') return 0;
    var best=ai?-Infinity:Infinity;
    for(var i=0;i<9;i++){
      if(b[i]) continue;
      b[i]=ai?'X':'O';
      var v=ttt_mm(b,!ai,a,be); b[i]=null;
      if(ai){best=Math.max(best,v);a=Math.max(a,v);}
      else{best=Math.min(best,v);be=Math.min(be,v);}
      if(be<=a) break;
    }
    return best;
  }
  function ttt_ai(){
    var bv=-Infinity,bm=-1;
    for(var i=0;i<9;i++){
      if(TTT.board[i]) continue;
      TTT.board[i]='X'; var v=ttt_mm(TTT.board,false,-Infinity,Infinity); TTT.board[i]=null;
      if(v>bv){bv=v;bm=i;}
    }
    if(bm!==-1){TTT.board[bm]='X';TTT.cells[bm].textContent='❌';TTT.cells[bm].dataset.taken='1';}
    ttt_check(); TTT.aiThinking=false;
    if(!TTT.over){TTT.playerTurn=true;TTT.status.textContent='Sıra sende ⭕';}
  }
  function ttt_check(){
    var w=ttt_winner(TTT.board); if(!w) return false;
    TTT.over=true;
    if(w==='draw'){TTT.status.textContent='🤝 Berabere!';TTT.sc.d++;TTT.dEl.textContent=TTT.sc.d;toast('🤝 Berabere!','#00e5ff');}
    else if(w==='O'){TTT.status.textContent='🎉 Kazandın!';TTT.sc.w++;TTT.wEl.textContent=TTT.sc.w;ttt_hl('O');toast('🎉 Kazandın!','#69f0ae');}
    else{TTT.status.textContent='🤖 AI kazandı!';TTT.sc.l++;TTT.lEl.textContent=TTT.sc.l;ttt_hl('X');toast('🤖 AI kazandı!','#ff6b9d');}
    return true;
  }
  function ttt_hl(p){TTT.WINS.forEach(function(L){if(TTT.board[L[0]]===p&&TTT.board[L[1]]===p&&TTT.board[L[2]]===p)L.forEach(function(i){TTT.cells[i].classList.add('win-cell');});});}
  function ttt_new(){
    TTT.board=Array(9).fill(null); TTT.playerTurn=true; TTT.aiThinking=false; TTT.over=false;
    TTT.cells.forEach(function(c){c.textContent='';c.classList.remove('win-cell');delete c.dataset.taken;});
    TTT.status.textContent='Sen ⭕ — AI ❌ — Sıra sende!';
  }
  TTT.cells.forEach(function(cell,i){
    cell.addEventListener('click',function(){
      if(!TTT.playerTurn||TTT.aiThinking||TTT.over||TTT.board[i]) return;
      TTT.board[i]='O'; cell.textContent='⭕'; cell.dataset.taken='1';
      TTT.playerTurn=false;
      if(!ttt_check()){TTT.aiThinking=true;TTT.status.textContent='🤖 AI düşünüyor...';setTimeout(ttt_ai,380);}
    });
  });
  on('tttReset','click',ttt_new);
  ttt_new();
} catch(e){ console.error('TicTacToe error',e); }

/* ══════════════════════════════════════════════════════════
   9. WORD SCRAMBLE
══════════════════════════════════════════════════════════ */
try {
  var WS = {
    el:{
      scr:$('scrambledWord'), inp:$('wordInput'), cat:$('wordCategory'),
      hint:$('wordHint'), score:$('wordScore'), corr:$('wordCorrect'), wrong:$('wordWrong')
    },
    WORDS:[
      {w:'GÜNEŞ',h:'Gökyüzündeki enerji kaynağı',c:'🌿 Doğa'},
      {w:'OKYANUS',h:'En büyük su kütlesi',c:'🌊 Doğa'},
      {w:'YILDIZ',h:'Geceleri parlayan gök cismi',c:'🚀 Uzay'},
      {w:'ROBOT',h:'Otomatik çalışan makine',c:'🤖 Teknoloji'},
      {w:'BULUT',h:'Su damlacıklarından oluşur',c:'⛅ Doğa'},
      {w:'KITAP',h:'Bilgi içeren basılı eser',c:'📚 Kültür'},
      {w:'BALIK',h:'Suda yaşayan canlı',c:'🐾 Hayvan'},
      {w:'ÇIÇEK',h:'Bitkinin renkli organı',c:'🌸 Doğa'},
      {w:'PIANO',h:'Tuşlu çalgı aleti',c:'🎵 Müzik'},
      {w:'ARABA',h:'Dört tekerlekli taşıt',c:'🚗 Ulaşım'},
      {w:'KELEBEK',h:'Renkli kanatlı böcek',c:'🦋 Hayvan'},
      {w:'AHTAPOT',h:'8 kollu deniz canlısı',c:'🐙 Hayvan'},
      {w:'ATEŞ',h:'Yanma sonucu çıkan ısı ve ışık',c:'🔥 Doğa'},
      {w:'ORMAN',h:'Ağaçlarla dolu bölge',c:'🌲 Doğa'},
      {w:'MÜZIK',h:'Kulağa hoş gelen ses sanatı',c:'🎵 Sanat'},
      {w:'RÜZGAR',h:'Hareket eden hava kütlesi',c:'💨 Doğa'},
      {w:'KÖPEK',h:'İnsanın en sadık dostu',c:'🐾 Hayvan'},
      {w:'KALEM',h:'Yazmaya yarayan araç',c:'✏️ Genel'},
      {w:'DENIZ',h:'Büyük tuzlu su kütlesi',c:'🌊 Doğa'},
      {w:'ŞIMŞEK',h:'Gökyüzünde çakan elektrik',c:'⚡ Doğa'}
    ],
    idx:0, score:0, corr:0, wrong:0
  };
  WS.WORDS = WS.WORDS.slice().sort(function(){return Math.random()-.5;});
  function ws_scramble(word){
    var arr=word.split(''),tries=0;
    do{for(var i=arr.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=arr[i];arr[i]=arr[j];arr[j]=t;}tries++;}
    while(arr.join('')===word&&tries<20);
    return arr;
  }
  function ws_show(){
    var w=WS.WORDS[WS.idx];
    WS.el.cat.textContent=w.c; WS.el.hint.textContent='— '+w.h;
    WS.el.inp.value=''; WS.el.inp.className='word-input';
    WS.el.scr.innerHTML='';
    ws_scramble(w.w).forEach(function(ch,i){
      var sp=document.createElement('span'); sp.className='s-letter'; sp.textContent=ch;
      sp.style.animationDelay=(i*.05)+'s'; WS.el.scr.appendChild(sp);
    });
    WS.el.inp.focus();
  }
  function ws_check(){
    var ans=WS.el.inp.value.trim().toUpperCase();
    if(!ans) return;
    if(ans===WS.WORDS[WS.idx].w){
      WS.corr++; WS.score+=10; WS.el.corr.textContent=WS.corr; WS.el.score.textContent=WS.score;
      WS.el.inp.className='word-input correct'; toast('✅ Doğru! +10','#69f0ae');
      setTimeout(function(){WS.idx=(WS.idx+1)%WS.WORDS.length;ws_show();},800);
    } else {
      WS.wrong++; WS.el.wrong.textContent=WS.wrong; WS.el.inp.className='word-input wrong';
      toast('❌ Yanlış! Cevap: '+WS.WORDS[WS.idx].w,'#ff6b9d');
      setTimeout(function(){WS.el.inp.className='word-input';WS.el.inp.value='';WS.el.inp.focus();},1000);
    }
  }
  on('wordCheck','click',ws_check);
  on('wordSkip','click',function(){
    toast('⏭ Cevap: '+WS.WORDS[WS.idx].w,'#ffea00');
    setTimeout(function(){WS.idx=(WS.idx+1)%WS.WORDS.length;ws_show();},900);
  });
  on('wordHintBtn','click',function(){
    var w=WS.WORDS[WS.idx].w; toast('💡 '+w.length+' harf, ilk: "'+w[0]+'"','#00e5ff');
  });
  $('wordInput').addEventListener('keydown',function(e){if(e.key==='Enter')ws_check();});
  ws_show();
} catch(e){ console.error('WordScramble error',e); }

/* ══════════════════════════════════════════════════════════
   10. SIMON SAYS
══════════════════════════════════════════════════════════ */
try {
  var SIM = {
    COLORS:['simonRed','simonBlue','simonYellow','simonGreen'],
    btns:{}, seq:[], pseq:[], level:0, best:0, playing:false,
    levelEl:$('simonLevel'), bestEl:$('simonBest'), startBtn:$('simonStart')
  };
  SIM.COLORS.forEach(function(id){SIM.btns[id]=$('simon'+id.slice(5));});
  // Direct element refs
  SIM.btns['simonRed']=$('simonRed');
  SIM.btns['simonBlue']=$('simonBlue');
  SIM.btns['simonYellow']=$('simonYellow');
  SIM.btns['simonGreen']=$('simonGreen');

  function sim_flash(id, cb){
    var btn=SIM.btns[id]; if(!btn) return;
    btn.classList.add('lit');
    setTimeout(function(){btn.classList.remove('lit');if(cb)setTimeout(cb,200);},500);
  }
  function sim_play(i){
    i=i||0;
    SIM.COLORS.forEach(function(id){if(SIM.btns[id])SIM.btns[id].disabled=true;});
    if(i>=SIM.seq.length){SIM.playing=false;SIM.pseq=[];SIM.COLORS.forEach(function(id){if(SIM.btns[id])SIM.btns[id].disabled=false;});return;}
    setTimeout(function(){sim_flash(SIM.seq[i],function(){sim_play(i+1);});},100);
  }
  function sim_next(){
    SIM.level++;
    SIM.levelEl.textContent=SIM.level;
    if(SIM.level>SIM.best){SIM.best=SIM.level;SIM.bestEl.textContent=SIM.best;}
    SIM.seq.push(SIM.COLORS[Math.floor(Math.random()*4)]);
    SIM.playing=true; setTimeout(sim_play,600);
  }
  function sim_over(){
    SIM.playing=false; SIM.level=0; SIM.seq=[]; SIM.levelEl.textContent=0;
    SIM.COLORS.forEach(function(id){if(SIM.btns[id])SIM.btns[id].disabled=false;});
    SIM.startBtn.disabled=false; SIM.startBtn.textContent='▶ Tekrar';
    toast('💔 Hata! '+(SIM.seq.length-1)+'. seviyeye ulaştın','#ff6b9d');
  }
  SIM.COLORS.forEach(function(id){
    var btn=SIM.btns[id]; if(!btn) return;
    btn.addEventListener('click',function(){
      if(SIM.playing||btn.disabled) return;
      sim_flash(id);
      SIM.pseq.push(id);
      var pos=SIM.pseq.length-1;
      if(SIM.pseq[pos]!==SIM.seq[pos]){sim_over();return;}
      if(SIM.pseq.length===SIM.seq.length){toast('✅ Seviye '+SIM.level+' geçildi!','#69f0ae');setTimeout(sim_next,800);}
    });
  });
  SIM.startBtn.addEventListener('click',function(){
    if(SIM.playing) return;
    SIM.seq=[]; SIM.level=0; SIM.levelEl.textContent=0;
    SIM.startBtn.disabled=true; SIM.startBtn.textContent='🧠 Oynuyor...';
    setTimeout(sim_next,400);
  });
} catch(e){ console.error('Simon error',e); }

/* ══════════════════════════════════════════════════════════
   11. MATH SPRINT
══════════════════════════════════════════════════════════ */
try {
  var MS = {
    prob:$('mathProblem'), inp:$('mathInput'), corrEl:$('mathCorrect'),
    wrongEl:$('mathWrong'), scEl:$('mathScore'), fill:$('mathTimerFill'), startBtn:$('mathStart'),
    corr:0, wrong:0, score:0, running:false, tmr:null, secs:60, ans:0
  };
  function ms_problem(){
    var ops=['+','-','×'], op=ops[Math.floor(Math.random()*ops.length)];
    var a,b;
    if(op==='+'){a=Math.floor(Math.random()*50)+1;b=Math.floor(Math.random()*50)+1;MS.ans=a+b;}
    else if(op==='-'){a=Math.floor(Math.random()*50)+20;b=Math.floor(Math.random()*a)+1;MS.ans=a-b;}
    else{a=Math.floor(Math.random()*12)+1;b=Math.floor(Math.random()*12)+1;MS.ans=a*b;}
    MS.prob.textContent=a+' '+op+' '+b+' = ?';
    MS.inp.value=''; MS.inp.focus();
  }
  function ms_check(){
    if(!MS.running) return;
    var v=parseInt(MS.inp.value,10); if(isNaN(v)) return;
    if(v===MS.ans){MS.corr++;MS.score+=10;MS.corrEl.textContent=MS.corr;MS.scEl.textContent=MS.score;MS.prob.style.color='var(--a4)';}
    else{MS.wrong++;MS.score=Math.max(0,MS.score-2);MS.wrongEl.textContent=MS.wrong;MS.scEl.textContent=MS.score;MS.prob.style.color='var(--a2)';}
    setTimeout(function(){MS.prob.style.color='var(--tx)';ms_problem();},280);
  }
  function ms_start(){
    MS.corr=0;MS.wrong=0;MS.score=0;MS.secs=60;
    MS.corrEl.textContent=0;MS.wrongEl.textContent=0;MS.scEl.textContent=0;
    MS.fill.style.transition='none';MS.fill.style.width='100%';
    MS.running=true;MS.startBtn.disabled=true;MS.startBtn.textContent='⏱ Oynuyor...';
    MS.inp.disabled=false;
    ms_problem();
    setTimeout(function(){MS.fill.style.transition='width 60s linear';MS.fill.style.width='0%';},50);
    MS.tmr=setInterval(function(){
      MS.secs--;
      if(MS.secs<=0){
        clearInterval(MS.tmr);MS.running=false;MS.inp.disabled=true;
        MS.startBtn.disabled=false;MS.startBtn.textContent='▶ Tekrar';
        MS.prob.textContent='Bitti!';MS.fill.style.transition='none';MS.fill.style.width='0%';
        toast('🏁 Bitti! '+MS.score+' puan · '+MS.corr+' doğru','#69f0ae');
      }
    },1000);
  }
  MS.inp.addEventListener('keydown',function(e){if(e.key==='Enter')ms_check();});
  MS.startBtn.addEventListener('click',function(){if(!MS.running)ms_start();});
} catch(e){ console.error('MathSprint error',e); }

/* ══════════════════════════════════════════════════════════
   12. ROCK PAPER SCISSORS
══════════════════════════════════════════════════════════ */
try {
  var RPS = {
    pEl:$('rpsPlayer'), aiEl:$('rpsAI'), resEl:$('rpsResult'),
    wEl:$('rpsWin'), dEl:$('rpsDraw'), lEl:$('rpsLose'),
    w:0,d:0,l:0,
    ICONS:{rock:'✊',paper:'✋',scissors:'✌️'},
    CHOICES:['rock','paper','scissors']
  };
  function rps_beats(a,b){return(a==='rock'&&b==='scissors')||(a==='scissors'&&b==='paper')||(a==='paper'&&b==='rock');}
  document.querySelectorAll('.rps-btn').forEach(function(btn){
    btn.addEventListener('click',function(){
      var p=btn.dataset.c, ai=RPS.CHOICES[Math.floor(Math.random()*3)];
      RPS.pEl.textContent=RPS.ICONS[p]; RPS.aiEl.textContent=RPS.ICONS[ai];
      RPS.pEl.classList.remove('pop'); RPS.aiEl.classList.remove('pop');
      void RPS.pEl.offsetWidth;
      RPS.pEl.classList.add('pop'); RPS.aiEl.classList.add('pop');
      RPS.resEl.className='rps-result';
      if(p===ai){RPS.resEl.textContent='🤝 Berabere!';RPS.resEl.classList.add('draw');RPS.d++;RPS.dEl.textContent=RPS.d;toast('🤝 Berabere!','#00e5ff');}
      else if(rps_beats(p,ai)){RPS.resEl.textContent='🎉 Kazandın!';RPS.resEl.classList.add('win');RPS.w++;RPS.wEl.textContent=RPS.w;toast('🎉 Kazandın!','#69f0ae');}
      else{RPS.resEl.textContent='😞 Kaybettin!';RPS.resEl.classList.add('lose');RPS.l++;RPS.lEl.textContent=RPS.l;toast('😞 AI kazandı!','#ff6b9d');}
    });
  });
} catch(e){ console.error('RPS error',e); }

/* ══════════════════════════════════════════════════════════
   13. NUMBER GUESS
══════════════════════════════════════════════════════════ */
try {
  var NG = {
    dispEl:$('guessDisplay'), hintEl:$('guessHint'), rangeEl:$('guessRange'),
    inp:$('guessInput'), trEl:$('guessTries'), bestEl:$('guessBest'),
    secret:0, tries:0, lo:1, hi:100, best:Infinity, done:false
  };
  function ng_new(){
    NG.secret=Math.floor(Math.random()*100)+1; NG.tries=0; NG.lo=1; NG.hi=100; NG.done=false;
    NG.dispEl.textContent='?'; NG.hintEl.textContent='1 ile 100 arasında bir sayı düşündüm...'; NG.hintEl.style.color='var(--tx2)';
    NG.rangeEl.textContent='📍 Aralık: 1 — 100'; NG.trEl.textContent=0; NG.inp.value=''; NG.inp.disabled=false; NG.inp.focus();
  }
  function ng_guess(){
    if(NG.done) return;
    var v=parseInt(NG.inp.value,10);
    if(isNaN(v)||v<1||v>100){toast('1-100 arası bir sayı gir!','#ff6b9d');return;}
    NG.tries++; NG.trEl.textContent=NG.tries; NG.dispEl.textContent=v;
    if(v===NG.secret){
      NG.hintEl.textContent='🎉 Doğru! '+NG.tries+' denemede buldun!'; NG.hintEl.style.color='var(--a4)';
      if(NG.tries<NG.best){NG.best=NG.tries;NG.bestEl.textContent=NG.tries;}
      NG.done=true; NG.inp.disabled=true; toast('🎯 '+NG.tries+' denemede buldun!','#69f0ae');
    } else if(v<NG.secret){NG.lo=Math.max(NG.lo,v+1);NG.hintEl.textContent='📈 Daha büyük!';NG.hintEl.style.color='var(--a3)';}
    else{NG.hi=Math.min(NG.hi,v-1);NG.hintEl.textContent='📉 Daha küçük!';NG.hintEl.style.color='var(--a2)';}
    NG.rangeEl.textContent='📍 Aralık: '+NG.lo+' — '+NG.hi;
    NG.inp.value=''; if(!NG.done) NG.inp.focus();
  }
  on('guessSubmit','click',ng_guess);
  $('guessInput').addEventListener('keydown',function(e){if(e.key==='Enter')ng_guess();});
  on('guessReset','click',ng_new);
  ng_new();
} catch(e){ console.error('NumberGuess error',e); }

/* ══════════════════════════════════════════════════════════
   14. MINESWEEPER
══════════════════════════════════════════════════════════ */
try {
  var MINE = {
    gridEl:$('mineGrid'), cntEl:$('mineCount'), statEl:$('mineStatus'), timerEl:$('mineTimer'),
    ROWS:8, COLS:8, MINES:10,
    board:null, rev:[], flag:[], over:false, won:false, started:false,
    tmrId:null, t0:0
  };
  var MINE_NC=['','mn1','mn2','mn3','mn4','mn5','mn6','mn7','mn8'];

  function mine_init(safe){
    MINE.board=new Array(64).fill(0);
    var s=new Set([safe]);
    var sr=Math.floor(safe/MINE.COLS),sc=safe%MINE.COLS;
    for(var dr=-1;dr<=1;dr++) for(var dc=-1;dc<=1;dc++){var r2=sr+dr,c2=sc+dc;if(r2>=0&&r2<MINE.ROWS&&c2>=0&&c2<MINE.COLS)s.add(r2*MINE.COLS+c2);}
    var placed=0;
    while(placed<MINE.MINES){var pos=Math.floor(Math.random()*64);if(!s.has(pos)&&MINE.board[pos]!==99){MINE.board[pos]=99;placed++;}}
    for(var i=0;i<64;i++){
      if(MINE.board[i]===99) continue;
      var cnt=0,ri=Math.floor(i/MINE.COLS),ci=i%MINE.COLS;
      for(var dr=-1;dr<=1;dr++) for(var dc=-1;dc<=1;dc++){var r2=ri+dr,c2=ci+dc;if(r2>=0&&r2<MINE.ROWS&&c2>=0&&c2<MINE.COLS&&MINE.board[r2*MINE.COLS+c2]===99)cnt++;}
      MINE.board[i]=cnt;
    }
  }
  function mine_new(){
    clearInterval(MINE.tmrId);
    MINE.board=null; MINE.rev=new Array(64).fill(false); MINE.flag=new Array(64).fill(false);
    MINE.over=false; MINE.won=false; MINE.started=false;
    MINE.statEl.textContent='🙂'; MINE.timerEl.textContent='0'; MINE.cntEl.textContent=MINE.MINES;
    mine_render();
  }
  function mine_render(){
    MINE.gridEl.innerHTML='';
    for(var i=0;i<64;i++){
      (function(idx){
        var cell=document.createElement('div'); cell.className='mine-cell';
        if(MINE.rev[idx]){
          cell.classList.add('revealed');
          if(MINE.board&&MINE.board[idx]===99){cell.textContent='💣';}
          else if(MINE.board&&MINE.board[idx]>0){cell.textContent=MINE.board[idx];cell.classList.add(MINE_NC[MINE.board[idx]]);}
        } else if(MINE.flag[idx]){
          cell.classList.add('flagged'); cell.textContent='🚩';
        }
        cell.addEventListener('click',function(){mine_left(idx);});
        cell.addEventListener('contextmenu',function(e){e.preventDefault();mine_right(idx);});
        MINE.gridEl.appendChild(cell);
      })(i);
    }
  }
  function mine_flood(idx){
    if(idx<0||idx>=64||MINE.rev[idx]||MINE.flag[idx]) return;
    MINE.rev[idx]=true;
    if(MINE.board[idx]===0){
      var r=Math.floor(idx/MINE.COLS),c=idx%MINE.COLS;
      for(var dr=-1;dr<=1;dr++) for(var dc=-1;dc<=1;dc++){
        if(dr===0&&dc===0) continue;
        var r2=r+dr,c2=c+dc;
        if(r2>=0&&r2<MINE.ROWS&&c2>=0&&c2<MINE.COLS) mine_flood(r2*MINE.COLS+c2);
      }
    }
  }
  function mine_left(idx){
    if(MINE.over||MINE.won||MINE.rev[idx]||MINE.flag[idx]) return;
    if(!MINE.started){
      MINE.started=true; mine_init(idx);
      MINE.t0=Date.now();
      MINE.tmrId=setInterval(function(){MINE.timerEl.textContent=Math.floor((Date.now()-MINE.t0)/1000);},500);
    }
    if(MINE.board[idx]===99){
      MINE.rev[idx]=true;
      for(var i=0;i<64;i++) if(MINE.board[i]===99) MINE.rev[i]=true;
      MINE.over=true; clearInterval(MINE.tmrId); MINE.statEl.textContent='😵';
      mine_render(); toast('💥 Mayına bastın!','#ff4444'); return;
    }
    mine_flood(idx); mine_check(); mine_render();
  }
  function mine_right(idx){
    if(MINE.over||MINE.won||MINE.rev[idx]) return;
    MINE.flag[idx]=!MINE.flag[idx];
    MINE.cntEl.textContent=Math.max(0,MINE.MINES-MINE.flag.filter(Boolean).length);
    mine_render();
  }
  function mine_check(){
    var unrev=MINE.rev.filter(function(v){return !v;}).length;
    if(unrev===MINE.MINES){
      MINE.won=true; clearInterval(MINE.tmrId); MINE.statEl.textContent='😎';
      toast('🎉 Temizledin! '+Math.floor((Date.now()-MINE.t0)/1000)+'s','#69f0ae');
    }
  }
  on('mineReset','click',mine_new);
  $('mineStatus').addEventListener('click',mine_new);
  mine_new();
} catch(e){ console.error('Minesweeper error',e); }

/* ══════════════════════════════════════════════════════════
   15. TYPING SPEED
══════════════════════════════════════════════════════════ */
try {
  var TY = {
    textEl:$('typingText'), inpEl:$('typingInput'),
    wpmEl:$('typingWPM'), accEl:$('typingAcc'), timerEl:$('typingTimer'), charsEl:$('typingChars'),
    startBtn:$('typingStart'),
    TEXTS:[
      'Hayat güzel anlarla doludur. Her sabah yeni bir fırsat sunar, her gece yeni bir şükran kaynağı olur. Mutluluğu küçük şeylerde aramak, büyük mutlulukların kapısını aralar.',
      'Teknoloji insanlığın en büyük icatlarından biridir. Bilgisayarlar sayesinde dünyamız küçüldü, bilgiye erişim kolaylaştı ve iletişim sınırları ortadan kalktı.',
      'Doğa her mevsim farklı bir güzellik sunar. Baharın renkleri, yazın sıcaklığı, sonbaharın hüznü ve kışın sakinliği birbirini tamamlayan muhteşem bir döngü oluşturur.',
      'Okumak insanı düşündürür ve hayal gücünü geliştirir. Bir kitabı bitirdiğinde farklı bir dünyadan dönmüş gibi hissedebilirsiniz. Kelimeler zihnin kapılarını açar.',
      'Müzik evrensel bir dil konuşur. Dünya üzerindeki tüm insanlar farklı dillerde konuşsa da melodi herkesin kalbine aynı şekilde dokunabilir ve duyguları paylaşabilir.'
    ],
    text:'', running:false, tmr:null, t0:0, secs:60, typed:0, corr:0
  };
  function ty_esc(c){return c===' '?'&nbsp;':c.replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function ty_render(pos){
    var h='';
    for(var i=0;i<TY.text.length;i++){
      if(i<pos){var tc=TY.inpEl.value[i]||'';h+='<span class="'+(tc===TY.text[i]?'tc':'tw')+'">'+ty_esc(TY.text[i])+'</span>';}
      else if(i===pos) h+='<span class="cur">'+ty_esc(TY.text[i])+'</span>';
      else h+='<span class="tp">'+ty_esc(TY.text[i])+'</span>';
    }
    TY.textEl.innerHTML=h;
  }
  function ty_start(){
    TY.text=TY.TEXTS[Math.floor(Math.random()*TY.TEXTS.length)];
    TY.typed=0;TY.corr=0;TY.secs=60;
    TY.wpmEl.textContent=0;TY.accEl.textContent=100;TY.timerEl.textContent=60;TY.charsEl.textContent=0;
    TY.running=true;TY.startBtn.disabled=true;TY.startBtn.textContent='⏱ Test Sürüyor...';
    TY.inpEl.disabled=false;TY.inpEl.value='';TY.inpEl.focus();
    ty_render(0);
    TY.t0=Date.now();
    TY.tmr=setInterval(function(){
      TY.secs--;TY.timerEl.textContent=TY.secs;
      var el=(Date.now()-TY.t0)/60000;
      TY.wpmEl.textContent=Math.round(TY.corr/5/el);
      if(TY.secs<=0)ty_end();
    },1000);
  }
  function ty_end(){
    clearInterval(TY.tmr);TY.running=false;TY.inpEl.disabled=true;
    TY.startBtn.disabled=false;TY.startBtn.textContent='▶ Tekrar';
    var el=(Date.now()-TY.t0)/60000;
    var wpm=Math.round(TY.corr/5/el);
    var acc=TY.typed>0?Math.round(TY.corr/TY.typed*100):100;
    TY.wpmEl.textContent=wpm;TY.accEl.textContent=acc;
    toast('⌨️ '+wpm+' WPM · '+acc+'% doğruluk','#7c4dff');
  }
  TY.inpEl.addEventListener('input',function(){
    if(!TY.running) return;
    var pos=TY.inpEl.value.length;
    TY.typed=pos;TY.corr=0;
    for(var i=0;i<pos&&i<TY.text.length;i++) if(TY.inpEl.value[i]===TY.text[i])TY.corr++;
    TY.charsEl.textContent=pos;
    TY.accEl.textContent=pos>0?Math.round(TY.corr/pos*100):100;
    ty_render(pos);
    if(pos>=TY.text.length)ty_end();
  });
  TY.startBtn.addEventListener('click',function(){if(!TY.running)ty_start();});
} catch(e){ console.error('Typing error',e); }

/* ══════════════════════════════════════════════════════════
   16. AMBIANCE (Web Audio API)
══════════════════════════════════════════════════════════ */
try {
  var AMB = {
    viz:$('vizWrap'), icon:$('vizIcon'), label:$('vizLabel'),
    playBtn:$('playStopBtn'), volSlider:$('masterVolume'), volDisp:$('volDisplay'),
    actx:null, masterGain:null, nodes:[], playing:false, selType:null, selCard:null
  };
  function amb_init(){
    if(!AMB.actx){
      AMB.actx=new(window.AudioContext||window.webkitAudioContext)();
      AMB.masterGain=AMB.actx.createGain();
      AMB.masterGain.gain.value=AMB.volSlider.value/100;
      AMB.masterGain.connect(AMB.actx.destination);
    }
    if(AMB.actx.state==='suspended')AMB.actx.resume();
  }
  function amb_noise(len){
    var sr=AMB.actx.sampleRate,buf=AMB.actx.createBuffer(1,sr*(len||4),sr),d=buf.getChannelData(0);
    for(var i=0;i<d.length;i++)d[i]=Math.random()*2-1; return buf;
  }
  function amb_ns(){var s=AMB.actx.createBufferSource();s.buffer=amb_noise(4);s.loop=true;return s;}
  function amb_f(type,freq,q){var f=AMB.actx.createBiquadFilter();f.type=type;f.frequency.value=freq;if(q)f.Q.value=q;return f;}
  function amb_g(v){var g=AMB.actx.createGain();g.gain.value=v;return g;}
  function amb_lfo(rate,depth){var o=AMB.actx.createOscillator(),g=AMB.actx.createGain();o.frequency.value=rate;g.gain.value=depth;o.connect(g);o.start();return g;}
  function cnn(){var a=Array.prototype.slice.call(arguments);for(var i=0;i<a.length-1;i++)a[i].connect(a[i+1]);return a[a.length-1];}

  var SOUNDS={
    rain:function(){var s=amb_ns(),hp=amb_f('highpass',280),bp=amb_f('bandpass',1500,.3),g=amb_g(.85);cnn(s,hp,bp,g,AMB.masterGain);s.start();return[s,hp,bp,g];},
    ocean:function(){var s=amb_ns(),lp=amb_f('lowpass',620,2.5),g=amb_g(.7),l=amb_lfo(.07,.38);l.connect(g.gain);cnn(s,lp,g,AMB.masterGain);s.start();return[s,lp,g];},
    forest:function(){var s=amb_ns(),bp=amb_f('bandpass',750,.5),g=amb_g(.45);cnn(s,bp,g,AMB.masterGain);s.start();var o=AMB.actx.createOscillator(),og=amb_g(.025);o.frequency.value=560;o.type='sine';cnn(o,og,AMB.masterGain);o.start();return[s,bp,g,o,og];},
    fire:function(){var s=amb_ns(),lp=amb_f('lowpass',680,.4),hp=amb_f('highpass',70),g=amb_g(.55),l=amb_lfo(2.8,.09);l.connect(g.gain);cnn(s,hp,lp,g,AMB.masterGain);s.start();return[s,lp,hp,g];},
    cafe:function(){var s=amb_ns(),bp=amb_f('bandpass',820,2.2),g=amb_g(.3),l=amb_lfo(.18,.12);l.connect(g.gain);cnn(s,bp,g,AMB.masterGain);s.start();return[s,bp,g];},
    space:function(){var s=amb_ns(),lp=amb_f('lowpass',140,3.5),g=amb_g(.45);cnn(s,lp,g,AMB.masterGain);s.start();var o=AMB.actx.createOscillator(),og=amb_g(.13);o.frequency.value=52;o.type='sine';cnn(o,og,AMB.masterGain);o.start();return[s,lp,g,o,og];},
    wind:function(){var s=amb_ns(),lp=amb_f('lowpass',480),g=amb_g(.65),l=amb_lfo(.12,.3);l.connect(g.gain);cnn(s,lp,g,AMB.masterGain);s.start();return[s,lp,g];},
    night:function(){var s=amb_ns(),lp=amb_f('lowpass',180),bg=amb_g(.14);cnn(s,lp,bg,AMB.masterGain);s.start();var o1=AMB.actx.createOscillator(),o2=AMB.actx.createOscillator(),g1=amb_g(.02),g2=amb_g(.015);o1.frequency.value=4200;o1.type='square';o2.frequency.value=4450;o2.type='square';cnn(o1,g1,AMB.masterGain);cnn(o2,g2,AMB.masterGain);o1.start();o2.start();return[s,lp,bg,o1,o2,g1,g2];}
  };
  function amb_stop(){AMB.nodes.forEach(function(n){try{if(n.stop)n.stop();}catch(e){}try{n.disconnect();}catch(e){}});AMB.nodes=[];}
  function amb_play(type){amb_init();amb_stop();if(SOUNDS[type])AMB.nodes=(SOUNDS[type]()||[]).filter(Boolean);}

  document.querySelectorAll('.sound-card').forEach(function(card){
    card.addEventListener('click',function(){
      document.querySelectorAll('.sound-card').forEach(function(c){c.classList.remove('active');});
      card.classList.add('active'); AMB.selType=card.dataset.sound; AMB.selCard=card;
      AMB.icon.textContent=card.dataset.icon; AMB.label.textContent=card.dataset.label;
      if(AMB.playing)amb_play(AMB.selType);
    });
  });
  AMB.volSlider.addEventListener('input',function(){
    AMB.volDisp.textContent=AMB.volSlider.value+'%';
    if(AMB.masterGain)AMB.masterGain.gain.value=AMB.volSlider.value/100;
  });
  AMB.playBtn.addEventListener('click',function(){
    if(!AMB.selType){toast('Önce bir ses seçin!','#00e5ff');return;}
    if(AMB.playing){amb_stop();AMB.playing=false;AMB.playBtn.textContent='▶ Çal';AMB.viz.classList.remove('playing');}
    else{amb_play(AMB.selType);AMB.playing=true;AMB.playBtn.textContent='⏸ Durdur';AMB.viz.classList.add('playing');toast('🎵 '+AMB.selCard.dataset.label+' çalıyor','#00e5ff');}
  });
} catch(e){ console.error('Ambiance error',e); }

/* ══════════════════════════════════════════════════════════
   17. DRAWING CANVAS
══════════════════════════════════════════════════════════ */
try {
  var DC = {
    canvas:$('drawingCanvas'), painting:false,
    color:'#7c4dff', size:8, tool:'brush', glow:false, lx:0, ly:0
  };
  var dctx=DC.canvas.getContext('2d');
  function dc_init(){
    var r=DC.canvas.getBoundingClientRect();
    var w=r.width||800, h=r.height||430;
    var img=dctx.getImageData(0,0,DC.canvas.width,DC.canvas.height);
    DC.canvas.width=w; DC.canvas.height=h;
    try{dctx.putImageData(img,0,0);}catch(e){}
    dctx.fillStyle='#0a0b14'; dctx.fillRect(0,0,w,h);
  }
  setTimeout(dc_init,200);
  window.addEventListener('resize',function(){setTimeout(dc_init,300);});
  function dc_pos(e){
    var r=DC.canvas.getBoundingClientRect();
    var sx=DC.canvas.width/r.width, sy=DC.canvas.height/r.height;
    var px=e.touches?e.touches[0].clientX:e.clientX;
    var py=e.touches?e.touches[0].clientY:e.clientY;
    return{x:(px-r.left)*sx,y:(py-r.top)*sy};
  }
  function dc_start(e){
    e.preventDefault(); DC.painting=true;
    var p=dc_pos(e); DC.lx=p.x; DC.ly=p.y;
    dctx.save();
    if(DC.glow&&DC.tool==='brush'){dctx.shadowBlur=DC.size*5;dctx.shadowColor=DC.color;}
    dctx.fillStyle=DC.tool==='eraser'?'#0a0b14':DC.color;
    dctx.beginPath();dctx.arc(p.x,p.y,(DC.tool==='eraser'?DC.size*1.8:DC.size)/2,0,Math.PI*2);dctx.fill();
    dctx.restore();
  }
  function dc_draw(e){
    if(!DC.painting) return; e.preventDefault();
    var p=dc_pos(e);
    dctx.save();
    if(DC.tool==='spark'){
      for(var i=0;i<7;i++){
        var ang=Math.random()*Math.PI*2,len=Math.random()*DC.size*3+4;
        dctx.strokeStyle=DC.color;dctx.lineWidth=Math.random()*1.5+.5;dctx.globalAlpha=Math.random()*.8+.2;
        dctx.beginPath();dctx.moveTo(p.x,p.y);dctx.lineTo(p.x+Math.cos(ang)*len,p.y+Math.sin(ang)*len);dctx.stroke();
      }
    } else {
      if(DC.glow&&DC.tool==='brush'){dctx.shadowBlur=DC.size*3;dctx.shadowColor=DC.color;}
      dctx.strokeStyle=DC.tool==='eraser'?'#0a0b14':DC.color;
      dctx.lineWidth=DC.tool==='eraser'?DC.size*2.2:DC.size;
      dctx.lineCap='round';dctx.lineJoin='round';
      dctx.beginPath();dctx.moveTo(DC.lx,DC.ly);dctx.lineTo(p.x,p.y);dctx.stroke();
    }
    dctx.restore(); DC.lx=p.x; DC.ly=p.y;
  }
  DC.canvas.addEventListener('mousedown',dc_start);
  DC.canvas.addEventListener('mousemove',dc_draw);
  DC.canvas.addEventListener('mouseup',function(){DC.painting=false;});
  DC.canvas.addEventListener('mouseleave',function(){DC.painting=false;});
  DC.canvas.addEventListener('touchstart',dc_start,{passive:false});
  DC.canvas.addEventListener('touchmove',dc_draw,{passive:false});
  DC.canvas.addEventListener('touchend',function(){DC.painting=false;});

  $('palette').addEventListener('click',function(e){
    var pc=e.target.closest('.pal-color');
    if(pc&&pc.dataset.color){
      document.querySelectorAll('.pal-color').forEach(function(p){p.classList.remove('sel');});
      pc.classList.add('sel'); DC.color=pc.dataset.color;
    }
  });
  $('customColor').addEventListener('input',function(e){
    DC.color=e.target.value;
    document.querySelectorAll('.pal-color').forEach(function(p){p.classList.remove('sel');});
  });
  $('brushSize').addEventListener('input',function(e){DC.size=+e.target.value;$('brushSizeDisplay').textContent=DC.size;});
  function setTool(t){DC.tool=t;document.querySelectorAll('.tool-btn').forEach(function(b){b.classList.remove('active');});}
  on('brushTool','click',function(){setTool('brush');this.classList.add('active');});
  on('eraserTool','click',function(){setTool('eraser');this.classList.add('active');});
  on('sparkTool','click',function(){setTool('spark');this.classList.add('active');});
  on('glowToggle','click',function(){DC.glow=!DC.glow;this.classList.toggle('active',DC.glow);toast(DC.glow?'✨ Glow Açık!':'✨ Glow Kapalı','#7c4dff');});
  on('clearCanvas','click',function(){dctx.fillStyle='#0a0b14';dctx.fillRect(0,0,DC.canvas.width,DC.canvas.height);toast('🗑️ Temizlendi','#546e7a');});
  on('saveCanvas','click',function(){var a=document.createElement('a');a.download='dreamscape-art.png';a.href=DC.canvas.toDataURL();a.click();toast('💾 Kaydedildi!','#69f0ae');});
} catch(e){ console.error('DrawingCanvas error',e); }

/* ══════════════════════════════════════════════════════════
   18. BREATHING
══════════════════════════════════════════════════════════ */
try {
  var BR = {
    circle:$('breatheCircle'), icon:$('bIcon'), phase:$('bPhase'), count:$('bCount'),
    fill:$('bFill'), startBtn:$('breatheStart'),
    cycleEl:$('bCycles'), timeEl:$('bTime'),
    CIRC:2*Math.PI*100, type:'478', running:false, pIdx:0, cycles:0, secs:0,
    pTmr:null, sTmr:null,
    TECH:{
      '478':[{n:'Nefes Al',i:'🌬️',d:4,s:'inhale'},{n:'Tut',i:'🤐',d:7,s:'hold'},{n:'Nefes Ver',i:'😮‍💨',d:8,s:'exhale'}],
      'box':[{n:'Nefes Al',i:'🌬️',d:4,s:'inhale'},{n:'Tut',i:'🤐',d:4,s:'hold'},{n:'Nefes Ver',i:'😮‍💨',d:4,s:'exhale'},{n:'Bekle',i:'⏸️',d:4,s:'exhale'}],
      'calm':[{n:'Nefes Al',i:'🌬️',d:5,s:'inhale'},{n:'Nefes Ver',i:'😮‍💨',d:5,s:'exhale'}]
    }
  };
  BR.fill.style.strokeDasharray=BR.CIRC;
  BR.fill.style.strokeDashoffset=BR.CIRC;
  function br_prog(pct){BR.fill.style.strokeDashoffset=BR.CIRC*(1-pct);}
  function br_phase(){
    var ph=BR.TECH[BR.type][BR.pIdx], el=0;
    BR.icon.textContent=ph.i; BR.phase.textContent=ph.n; BR.count.textContent=ph.d;
    BR.circle.className='breathe-circle '+ph.s; br_prog(0);
    clearInterval(BR.pTmr);
    BR.pTmr=setInterval(function(){
      el++; BR.count.textContent=ph.d-el; br_prog(el/ph.d);
      if(el>=ph.d){
        clearInterval(BR.pTmr); BR.pIdx=(BR.pIdx+1)%BR.TECH[BR.type].length;
        if(BR.pIdx===0){BR.cycles++;BR.cycleEl.textContent=BR.cycles;}
        if(BR.running)br_phase();
      }
    },1000);
  }
  function br_start(){
    BR.running=true;BR.pIdx=0;BR.cycles=0;BR.secs=0;
    BR.cycleEl.textContent=0;BR.timeEl.textContent='0:00';
    BR.startBtn.textContent='⏹ Durdur';
    br_phase();
    BR.sTmr=setInterval(function(){BR.secs++;BR.timeEl.textContent=Math.floor(BR.secs/60)+':'+String(BR.secs%60).padStart(2,'0');},1000);
  }
  function br_stop(){
    BR.running=false;clearInterval(BR.pTmr);clearInterval(BR.sTmr);
    BR.circle.className='breathe-circle';BR.icon.textContent='🌬️';BR.phase.textContent='Hazır';BR.count.textContent='';
    BR.startBtn.textContent='▶ Başlat';br_prog(0);
  }
  document.querySelectorAll('.breathe-type-btn').forEach(function(btn){
    btn.addEventListener('click',function(){
      document.querySelectorAll('.breathe-type-btn').forEach(function(b){b.classList.remove('active');});
      btn.classList.add('active');BR.type=btn.dataset.type;
      if(BR.running){br_stop();br_start();}
    });
  });
  BR.startBtn.addEventListener('click',function(){if(BR.running)br_stop();else br_start();});
} catch(e){ console.error('Breathing error',e); }

/* ══════════════════════════════════════════════════════════
   19. POMODORO
══════════════════════════════════════════════════════════ */
try {
  var POM = {
    timeEl:$('pomoTime'), fill:$('pomoFill'), countEl:$('pomoCount'), labelEl:$('pomoLabel'),
    startBtn:$('pomoStart'), resetBtn:$('pomoReset'),
    CIRC:2*Math.PI*108, MODES:{work:{s:25*60,lbl:'🎯 Çalışma Zamanı'},short:{s:5*60,lbl:'☕ Kısa Mola'},long:{s:15*60,lbl:'🌿 Uzun Mola'}},
    mode:'work', total:25*60, elapsed:0, running:false, tmr:null, count:0
  };
  POM.fill.style.strokeDasharray=POM.CIRC;
  function pom_fmt(s){return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');}
  function pom_render(){POM.timeEl.textContent=pom_fmt(POM.total-POM.elapsed);POM.fill.style.strokeDashoffset=POM.CIRC*(POM.elapsed/POM.total);}
  function pom_start(){
    POM.running=true;POM.startBtn.textContent='⏸ Duraklat';
    POM.tmr=setInterval(function(){
      POM.elapsed++;pom_render();
      if(POM.elapsed>=POM.total){
        clearInterval(POM.tmr);POM.running=false;POM.startBtn.textContent='▶ Başlat';
        if(POM.mode==='work'){POM.count++;POM.countEl.textContent=POM.count;toast('🍅 Pomodoro bitti! Mola ver!','#ff6b9d');}
        else toast('⚡ Mola bitti! Çalışmaya devam!','#69f0ae');
      }
    },1000);
  }
  function pom_pause(){clearInterval(POM.tmr);POM.running=false;POM.startBtn.textContent='▶ Devam';}
  function pom_reset(){clearInterval(POM.tmr);POM.running=false;POM.elapsed=0;pom_render();POM.startBtn.textContent='▶ Başlat';}
  POM.startBtn.addEventListener('click',function(){if(POM.running)pom_pause();else pom_start();});
  POM.resetBtn.addEventListener('click',pom_reset);
  document.querySelectorAll('.pomo-mode-btn').forEach(function(btn){
    btn.addEventListener('click',function(){
      document.querySelectorAll('.pomo-mode-btn').forEach(function(b){b.classList.remove('active');});
      btn.classList.add('active');POM.mode=btn.dataset.mode;
      POM.total=POM.MODES[POM.mode].s;POM.labelEl.textContent=POM.MODES[POM.mode].lbl;
      pom_reset();
    });
  });
  function pom_addTask(){
    var v=$('pomoTaskInput').value.trim();if(!v)return;
    var li=document.createElement('li');li.className='pomo-item';
    var cb=document.createElement('div');cb.className='pomo-cb';
    var sp=document.createElement('span');sp.textContent=v;
    var del=document.createElement('button');del.className='pomo-del';del.textContent='✕';
    del.addEventListener('click',function(e){e.stopPropagation();li.remove();});
    li.addEventListener('click',function(){li.classList.toggle('done');cb.textContent=li.classList.contains('done')?'✓':'';});
    li.appendChild(cb);li.appendChild(sp);li.appendChild(del);
    $('pomoList').appendChild(li);$('pomoTaskInput').value='';$('pomoTaskInput').focus();
  }
  on('pomoAddTask','click',pom_addTask);
  $('pomoTaskInput').addEventListener('keydown',function(e){if(e.key==='Enter')pom_addTask();});
  pom_render();
} catch(e){ console.error('Pomodoro error',e); }

/* ══════════════════════════════════════════════════════════
   20. FACTS
══════════════════════════════════════════════════════════ */
try {
  var FACTS_DATA=[
    {cat:'science',icon:'⚡',lbl:'🔬 Bilim',text:'Dünyada her saniye yaklaşık 100 yıldırım düşmektedir.'},
    {cat:'space',icon:'🌌',lbl:'🚀 Uzay',text:'Güneş, Dünya\'dan yaklaşık 1,3 milyon kat daha büyüktür.'},
    {cat:'nature',icon:'🌳',lbl:'🌿 Doğa',text:'Bir ağaç yaşamı boyunca yaklaşık 1 ton CO₂ emer.'},
    {cat:'animals',icon:'🐙',lbl:'🐾 Hayvanlar',text:'Ahtapotların 3 kalbi ve mavi renkte kanı vardır.'},
    {cat:'science',icon:'💧',lbl:'🔬 Bilim',text:'İnsan vücudunun yaklaşık %60\'ı sudan oluşur.'},
    {cat:'space',icon:'🌙',lbl:'🚀 Uzay',text:'Ay her yıl Dünya\'dan 3,8 cm uzaklaşmaktadır.'},
    {cat:'history',icon:'🏛️',lbl:'📜 Tarih',text:'Antik Mısır\'da bira, işçilere para yerine ödeme aracı olarak kullanılırdı.'},
    {cat:'animals',icon:'🦈',lbl:'🐾 Hayvanlar',text:'Köpekbalıkları dinozorlardan daha eski canlılardır — 450 milyon yıl önce ortaya çıktılar.'},
    {cat:'nature',icon:'🌊',lbl:'🌿 Doğa',text:'Okyanus tabanının %95\'i hâlâ keşfedilmemiştir.'},
    {cat:'science',icon:'🧬',lbl:'🔬 Bilim',text:'İnsan DNA\'sı ile muz DNA\'sı yaklaşık %60 benzerdir.'},
    {cat:'space',icon:'⭐',lbl:'🚀 Uzay',text:'Evrendeki yıldız sayısı, Dünya\'daki tüm kum tanelerinden çoktur.'},
    {cat:'history',icon:'🗺️',lbl:'📜 Tarih',text:'Kleopatra, piramitlerin inşasından NASA\'nın kuruluşuna çok daha yakın bir dönemde yaşadı.'},
    {cat:'animals',icon:'🐘',lbl:'🐾 Hayvanlar',text:'Filler yaklaşık 22 ay boyunca hamile kalır.'},
    {cat:'nature',icon:'🍄',lbl:'🌿 Doğa',text:'Mantarlar genetik olarak bitkilerden çok hayvanlara benzer.'},
    {cat:'science',icon:'🌈',lbl:'🔬 Bilim',text:'Gökkuşağı aslında tam bir dairedir; biz yalnızca üsteki yarısını görürüz.'},
    {cat:'space',icon:'🪐',lbl:'🚀 Uzay',text:'Satürn\'ün halkalarının kalınlığı yalnızca 10-100 metre arasındadır.'},
    {cat:'history',icon:'🔱',lbl:'📜 Tarih',text:'"Maaş" anlamındaki "salary" Latince tuz anlamına gelen "sal"dan gelir; Romalılar maaşlarını tuzla alırdı.'},
    {cat:'animals',icon:'🦋',lbl:'🐾 Hayvanlar',text:'Kelebeklerin tatma organları ayaklarındadır.'},
    {cat:'nature',icon:'🏔️',lbl:'🌿 Doğa',text:'Himalayalar her yıl yaklaşık 5 mm daha yükselmektedir.'},
    {cat:'animals',icon:'🐬',lbl:'🐾 Hayvanlar',text:'Yunuslar uyurken beynlerinin yalnızca yarısını uyutur, diğer yarısı uyanık kalır.'}
  ];
  var FACT={all:FACTS_DATA,cur:FACTS_DATA,idx:0};
  function fact_show(){
    var f=FACT.cur[FACT.idx];
    $('factCategory').textContent=f.lbl; $('factIcon').textContent=f.icon;
    $('factText').style.opacity='0';
    setTimeout(function(){$('factText').textContent=f.text;$('factText').style.opacity='1';$('factNum').textContent=(FACT.idx+1)+' / '+FACT.cur.length;},200);
  }
  on('prevFact','click',function(){FACT.idx=(FACT.idx-1+FACT.cur.length)%FACT.cur.length;fact_show();});
  on('nextFact','click',function(){FACT.idx=(FACT.idx+1)%FACT.cur.length;fact_show();});
  on('rndFact','click',function(){var n;do{n=Math.floor(Math.random()*FACT.cur.length);}while(n===FACT.idx&&FACT.cur.length>1);FACT.idx=n;fact_show();});
  document.querySelectorAll('.cat-btn').forEach(function(btn){
    btn.addEventListener('click',function(){
      document.querySelectorAll('.cat-btn').forEach(function(b){b.classList.remove('active');});
      btn.classList.add('active');
      var cat=btn.dataset.cat;
      FACT.cur=cat==='all'?FACTS_DATA:FACTS_DATA.filter(function(f){return f.cat===cat;});
      FACT.idx=0; fact_show();
    });
  });
  fact_show();
} catch(e){ console.error('Facts error',e); }

/* ══════════════════════════════════════════════════════════
   21. QUOTES
══════════════════════════════════════════════════════════ */
try {
  var QUOTES=[
    {t:'Hayat bisiklete binmek gibidir. Dengenizi korumak için hareket etmeye devam etmeniz gerekir.',a:'— Albert Einstein',g:'🌱 Hayat'},
    {t:'En büyük zafer, hiç düşmemek değil; her düşüşte bir kez daha ayağa kalkmaktır.',a:'— Nelson Mandela',g:'🏆 Başarı'},
    {t:'Mutluluğun sırrı, daha fazlasını istemek değil, sahip olduklarının tadını çıkarmaktır.',a:'— Epiktetos',g:'💛 Mutluluk'},
    {t:'Bilgelik, bilgiden değil, deneyimden doğar.',a:'— Albert Einstein',g:'🦉 Bilgelik'},
    {t:'Başarı, başarısızlıktan başarısızlığa coşkuyu yitirmeden gitmektir.',a:'— Winston Churchill',g:'🏆 Başarı'},
    {t:'Hayal kurmayı bırakanlar, yaşamayı da bırakır.',a:'— Malcolm Forbes',g:'🌱 Hayat'},
    {t:'İmkânsız, cesaretsizlerin sözlüğünde bulunur.',a:'— Napolyon Bonaparte',g:'🏆 Başarı'},
    {t:'Kendini bil, kendine hükmet.',a:'— Sokrates',g:'🦉 Bilgelik'},
    {t:'Bir kitap açılmış bir penceredir; onu kapatan bilgiden uzaklaşır.',a:'— Victor Hugo',g:'🦉 Bilgelik'},
    {t:'Mutlu olmak için izin almaya gerek yok.',a:'— Abraham Lincoln',g:'💛 Mutluluk'},
    {t:'Bir şeyi gerçekten öğrenmek için onu başkasına öğret.',a:'— Richard Feynman',g:'🦉 Bilgelik'},
    {t:'Yarın için endişelenmek, bugünün sevincini çalar.',a:'— Dale Carnegie',g:'💛 Mutluluk'},
    {t:'Her sabah yeni bir fırsat sunar; onu nasıl değerlendireceğin sana kalmış.',a:'— Oprah Winfrey',g:'🌱 Hayat'},
    {t:'Küçük şeyleri sevmek, büyük şeyleri anlamaya başlamaktır.',a:'— Lev Tolstoy',g:'💛 Mutluluk'},
    {t:'Bugün ağlatan şeyler, yarın seni güçlü yapar.',a:'— Türk Atasözü',g:'🌱 Hayat'},
    {t:'Her şey mümkün — nerede duracağını bilmek şartıyla.',a:'— Goethe',g:'🏆 Başarı'}
  ];
  var QU={idx:Math.floor(Math.random()*QUOTES.length)};
  function qu_show(){
    var q=QUOTES[QU.idx];
    $('quoteText').style.opacity='0';
    setTimeout(function(){$('quoteText').textContent=q.t;$('quoteAuthor').textContent=q.a;$('quoteTag').textContent=q.g;$('quoteText').style.opacity='1';},200);
  }
  on('prevQuote','click',function(){QU.idx=(QU.idx-1+QUOTES.length)%QUOTES.length;qu_show();});
  on('nextQuote','click',function(){QU.idx=(QU.idx+1)%QUOTES.length;qu_show();});
  on('rndQuote','click',function(){var n;do{n=Math.floor(Math.random()*QUOTES.length);}while(n===QU.idx&&QUOTES.length>1);QU.idx=n;qu_show();});
  on('copyQuote','click',function(){
    var q=QUOTES[QU.idx];
    if(navigator.clipboard){navigator.clipboard.writeText('"'+q.t+'" '+q.a).then(function(){toast('📋 Kopyalandı!','#00e5ff');}).catch(function(){toast('Kopyalanamadı','#ff6b9d');});}
    else toast('Kopyalanamadı (file:// kısıtlaması)','#ff6b9d');
  });
  qu_show();
} catch(e){ console.error('Quotes error',e); }

/* ══════════════════════════════════════════════════════════
   22. WORLD CLOCKS
══════════════════════════════════════════════════════════ */
try {
  var CITIES=[
    {n:'İstanbul',tz:'Europe/Istanbul',f:'🇹🇷'},
    {n:'Londra',tz:'Europe/London',f:'🇬🇧'},
    {n:'New York',tz:'America/New_York',f:'🇺🇸'},
    {n:'Los Angeles',tz:'America/Los_Angeles',f:'🇺🇸'},
    {n:'Tokyo',tz:'Asia/Tokyo',f:'🇯🇵'},
    {n:'Dubai',tz:'Asia/Dubai',f:'🇦🇪'},
    {n:'Paris',tz:'Europe/Paris',f:'🇫🇷'},
    {n:'Sydney',tz:'Australia/Sydney',f:'🇦🇺'}
  ];
  var cg=$('clocksGrid');
  CITIES.forEach(function(city){
    var id='clk'+city.n.replace(/[\s]/g,'');
    var card=document.createElement('div');card.className='clock-card';
    card.innerHTML='<div class="clock-flag">'+city.f+'</div><div class="clock-city">'+city.n+'</div><div class="clock-time" id="'+id+'">--:--</div><div class="clock-date" id="'+id+'d"></div>';
    cg.appendChild(card);
  });
  function clocks_tick(){
    if (!PAGE_VISIBLE) return;
    var now = new Date();
    CITIES.forEach(function(city){
      var id='clk'+city.n.replace(/[\s]/g,'');
      var el=$(id),de=$(id+'d');
      try{if(el)el.textContent=now.toLocaleTimeString('tr-TR',{timeZone:city.tz,hour12:false});}catch(e){}
      try{if(de)de.textContent=now.toLocaleDateString('tr-TR',{timeZone:city.tz,weekday:'short',day:'2-digit',month:'short'});}catch(e){}
    });
  }
  setInterval(clocks_tick,2000);clocks_tick();
} catch(e){ console.error('Clocks error',e); }

/* ══════════════════════════════════════════════════════════
   23. MOOD WIDGET
══════════════════════════════════════════════════════════ */
try {
  var MOOD_MSG={
    amazing:'🤩 Müthiş! Bu enerjiyle her şeyi yapabilirsin. Birkaç oyun oyna ve bu anın tadını çıkar!',
    happy:'😊 Mutlu anlar en değerlileridir. Ambiyans aç, rahat bir oyun oyna ve keyfini sürdür!',
    okay:'😌 İyi olmak yeterince güzel. Belki nefes egzersizi veya bubble pop sana iyi gelir?',
    tired:'😴 Biraz dinlenmeye ihtiyacın var. Ambiyans seslerini aç ve nefes egzersizini dene.',
    stressed:'😤 Dur, derin bir nefes al. 4-7-8 tekniğini dene — sadece 3 döngü bile işe yarar!'
  };
  document.querySelectorAll('.mood-btn').forEach(function(btn){
    btn.addEventListener('click',function(){
      document.querySelectorAll('.mood-btn').forEach(function(b){b.classList.remove('sel');});
      btn.classList.add('sel');
      $('moodResp').textContent=MOOD_MSG[btn.dataset.mood];
    });
  });
} catch(e){ console.error('Mood error',e); }

/* ── Welcome ─────────────────────────────────────────────── */
setTimeout(function(){toast('✦ Dreamscape\'e hoş geldin! 💙','#7c4dff');},800);
console.log('%c✦ Dreamscape v4 yüklendi!','color:#7c4dff;font-size:16px;font-weight:bold');


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
    var _starFPS = makeFPSGate(24);
    function starDraw(now) {
      requestAnimationFrame(starDraw);
      if (!isCanvasActive('starCanvas')) return;
      if (!_starFPS(now || 0)) return;
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
      if (PG.running) requestAnimationFrame(pong_draw);
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
      // Only fire when piano section is visible/focused and user is NOT typing in an input
      var tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || document.activeElement.isContentEditable) return;
      var pianoSection = document.getElementById('piano');
      if (!pianoSection) return;
      var rect = pianoSection.getBoundingClientRect();
      var inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;
      var found = Object.values(pianoElems).find(function(p){ return p.el && PIANO_NOTES[p.idx].key === e.key.toLowerCase(); });
      if (found) { found.el.classList.add('pressed'); piano_play(found.idx); }
    });
    document.addEventListener('keyup', function(e) {
      var tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea') return;
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
    var _rippleFPS = makeFPSGate(30);
    function ripple_draw(now) {
      requestAnimationFrame(ripple_draw);
      if (!isCanvasActive('rippleCanvas')) return;
      if (!_rippleFPS(now || 0)) return;
      var W=rippleCanvas.width, H=rippleCanvas.height;
      rctx.fillStyle='rgba(1,2,13,.12)'; rctx.fillRect(0,0,W,H);
      ripples.forEach(function(rp, i) {
        rp.r += rp.speed; rp.a = 1 - rp.r/rp.maxR;
        rctx.beginPath(); rctx.arc(rp.x,rp.y,rp.r,0,Math.PI*2);
        rctx.strokeStyle = rp.col.replace(')',', '+rp.a+')').replace('hsl','hsla');
        rctx.lineWidth = 2; rctx.stroke();
      });
      ripples = ripples.filter(function(rp){ return rp.a > 0; });
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



/* ══════════════════════════════════════════════════════════
   MAIN MENU SYSTEM
══════════════════════════════════════════════════════════ */
try {
  var MENU_CATS = [
    { label: '🎮 Oyunlar', items: [
      {em:'🎮',ttl:'Oyun Portalı',dsc:'Tüm mini oyunlar lobisi',id:'games'},
      {em:'🐍',ttl:'Snake (Yılan)',dsc:'Klasik yılan oyunu',id:'snake-sec'},
      {em:'🏓',ttl:'Pong',dsc:'AI rakibine karşı',id:'pong'},
      {em:'🃏',ttl:'Blackjack',dsc:'21\'i geç',id:'blackjack'},
      {em:'🎰',ttl:'Slot Makinesi',dsc:'Şansını dene',id:'slots'},
      {em:'🔐',ttl:'Mastermind',dsc:'Şifre kırıcı',id:'mastermind'},
      {em:'🎯',ttl:'Hareketli Hedef',dsc:'Nişancılık testi',id:'target'},
      {em:'⚡',ttl:'Speed Clicker',dsc:'Hız tıklama',id:'clicker'},
      {em:'🎲',ttl:'Zar Toplayıcı',dsc:'D4\'ten D100\'e',id:'dice'},
      {em:'🃏',ttl:'Hafıza Kartları',dsc:'Eşleştirme oyunu',id:'memory-sec'},
      {em:'🫧',ttl:'Bubble Pop',dsc:'Balon patlatma',id:'bubble-sec'},
      {em:'⚡',ttl:'Refleks Testi',dsc:'Yeşile dönünce tıkla',id:'reaction-sec'},
      {em:'🎨',ttl:'Renk Yarışı',dsc:'Rengi doğru adlandır',id:'color-sec'},
      {em:'🧩',ttl:'15 Puzzle',dsc:'Sayıları sıraya diz',id:'puzzle-sec'},
      {em:'🐹',ttl:'Köstebek Vur',dsc:'Köstebekleri yakala',id:'mole-sec'},
      {em:'❌',ttl:'XOX — AI',dsc:'AI\'a karşı XOX oyna',id:'ttt-sec'},
      {em:'📝',ttl:'Kelime Bulmaca',dsc:'Harfleri kelimelere diz',id:'word-sec'},
      {em:'🧠',ttl:'Simon Says',dsc:'Renk sırasını ezberle',id:'simon-sec'},
      {em:'🔢',ttl:'Matematik Sprint',dsc:'Hızlı matematik işlemleri',id:'math-sec'},
      {em:'✊',ttl:'Taş-Kağıt-Makas',dsc:'AI\'a karşı düello',id:'rps-sec'},
      {em:'🎯',ttl:'Sayı Tahmin',dsc:'Gizli sayıyı bul',id:'guess-sec'},
      {em:'💣',ttl:'Mayın Tarlası',dsc:'Mayınları temizle',id:'mine-sec'},
      {em:'⌨️',ttl:'Yazma Hızı',dsc:'WPM yazma hızı testi',id:'typing-sec'},
      {em:'🌍',ttl:'Coğrafya Quiz',dsc:'Başkent bil',id:'geography'},
      {em:'🧪',ttl:'Piksel Fizik',dsc:'Zen fizik simülatörü',id:'sand-sec'},
      {em:'🛸',ttl:'Kozmik Flappy',dsc:'Uçan daire kaçış oyunu',id:'flappy-sec'},
      {em:'☄️',ttl:'Kozmik Savunucu',dsc:'Retro galaksi savaşı',id:'shooter-sec'},
      {em:'🧩',ttl:'Neon 2048',dsc:'Sayı birleştirme bulmacası',id:'m2048-sec'},
      {em:'🌀',ttl:'Kozmik Labirent',dsc:'Sonsuz labirent çözücü',id:'maze-sec'},
      {em:'🚀',ttl:'Kozmik Orbit',dsc:'Zen yerçekimi sapanı oyunu',id:'orbit-sec'}
    ]},
    { label: '🎨 Yaratıcılık & Huzur', items: [
      {em:'🌌',ttl:'Kozmik Nebula',dsc:'Karadelik & parçacık fiziği',id:'nebula-sec'},
      {em:'🎹',ttl:'Zen Melodi Havuzu',dsc:'İnteraktif ambiyans sentezleyici',id:'dreampad-sec'},
      {em:'🌸',ttl:'Zen Bonsai Bahçesi',dsc:'Fraktal Bonsai & kum tırmıklama',id:'bonsai-sec'},
      {em:'💨',ttl:'Rüzgar Akışı Tuvali',dsc:'Akışkan rüzgar parçacıkları',id:'flowfield-sec'},
      {em:'🌀',ttl:'Zen Kaleidoskop',dsc:'Simetrik çizim tuvali',id:'kaleido-sec'},
      {em:'🎨',ttl:'Pixel Art',dsc:'Dijital sanat',id:'pixelart'},
      {em:'🌊',ttl:'Dalgalar',dsc:'İnteraktif tuval',id:'ripple'},
      {em:'🖌️',ttl:'Serbest Çizim',dsc:'Dijital çizim',id:'canvas-sec'},
      {em:'🌈',ttl:'Palet Üretici',dsc:'Renk paletleri',id:'palette-sec'},
      {em:'🎹',ttl:'Virtual Piano',dsc:'Piyano çal',id:'piano'},
      {em:'📖',ttl:'Emoji Hikaye',dsc:'Emoji ile yaz',id:'emojistory'}
    ]},
    { label: '🌍 Keşif & Bilgi', items: [
      {em:'🗺️',ttl:'Dünya Kaşifi',dsc:'23 güzel yer',id:'world'},
      {em:'🌌',ttl:'Yıldız Haritası',dsc:'Takımyıldızları',id:'stars'},
      {em:'🌙',ttl:'Ay Takvimi',dsc:'Güncel ay fazı',id:'moonphase'},
      {em:'💡',ttl:'Bilgi Kartları',dsc:'İlginç bilgiler',id:'facts'},
      {em:'🔭',ttl:'Kozmik Teleskop',dsc:'Derin uzay vizörü',id:'telescope-sec'}
    ]},
    { label: '🔮 Gizemli & Eğlenceli', items: [
      {em:'🎱',ttl:'Sihirli 8 Top',dsc:'Geleceğini öğren',id:'magic8'},
      {em:'🃏',ttl:'Tarot Kartları',dsc:'Geçmiş & gelecek',id:'tarot'},
      {em:'🔮',ttl:'Sayı Büyüsü',dsc:'Aklını okurum!',id:'nummagic'},
      {em:'💭',ttl:'Ya Şunu Seçsen?',dsc:'Zor ikilemler',id:'wyr'}
    ]},
    { label: '🛠️ Araçlar & Kişisel', items: [
      {em:'🔑',ttl:'Şifre Üretici',dsc:'Güvenli şifreler',id:'passgen'},
      {em:'📝',ttl:'Sezar Şifresi',dsc:'Gizli mesajlar',id:'cipher'},
      {em:'🎵',ttl:'Ambiyans Sesleri',dsc:'Doğa sesleri',id:'ambiance'},
      {em:'🌿',ttl:'Nefes Egzersizi',dsc:'Rahatlama',id:'breathe'},
      {em:'📓',ttl:'Şükran Günlüğü',dsc:'Günlük notlar',id:'gratitude'},
      {em:'🟢',ttl:'Ruh Hali Çemberi',dsc:'Duygusal aura mandala visualizer',id:'aura-sec'},
      {em:'⏱️',ttl:'Odaklanma Saati',dsc:'Analog saat & ses mikseri',id:'zenclock-sec'},
      {em:'📅',ttl:'Günlük Görev',dsc:'Hedefler & seri',id:'daily'}
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
   (Olay tabanlı — polling setInterval kaldırıldı)
══════════════════════════════════════════════════════════ */
try {
  /* Blackjack: her el bitişinde kontrol et */
  function bj_check_balance() {
    if (typeof BJ === 'undefined') return;
    if (BJ.balance > 0) return;
    if (document.getElementById('bjReset')) return;
    var row = document.getElementById('bjBetRow');
    if (!row) return;
    var btn = document.createElement('button');
    btn.className = 'bj-btn deal'; btn.id = 'bjReset';
    btn.style.cssText = 'margin-top:.5rem;background:linear-gradient(135deg,#ff6b9d,#7c4dff)';
    btn.textContent = '💰 Bakiyeyi Yenile (1000)';
    btn.addEventListener('click', function() {
      BJ.balance = 1000; BJ.bet = 50; BJ.wins = 0; BJ.losses = 0; BJ.pushes = 0;
      var balEl = document.getElementById('bjBalance'); if (balEl) balEl.textContent = 1000;
      var betEl = document.getElementById('bjBet'); if (betEl) betEl.textContent = 50;
      var wEl = document.getElementById('bjWins'); if (wEl) wEl.textContent = 0;
      var lEl = document.getElementById('bjLosses'); if (lEl) lEl.textContent = 0;
      var pEl = document.getElementById('bjPushes'); if (pEl) pEl.textContent = 0;
      var res = document.getElementById('bjResult'); if (res) { res.textContent = ''; res.className = 'bj-result'; }
      btn.remove();
      toast('Bakiye yenilendi! 💰', '#69f0ae');
    });
    row.parentNode.insertBefore(btn, row.nextSibling);
  }
  /* Slot: her çevirişte kontrol et */
  function slot_check_balance() {
    if (typeof SL === 'undefined') return;
    if (SL.balance >= 10) return;
    if (document.getElementById('slotReset')) return;
    var spinBtn = document.getElementById('slotSpin');
    if (!spinBtn) return;
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
      btn.remove();
      toast('500 koin yüklendi! 🎰', '#ffea00');
    });
    spinBtn.parentNode.insertBefore(btn, spinBtn.nextSibling);
  }
  /* Blackjack bitişlerini hook et */
  var _bjEndOrig = (typeof bj_end === 'function') ? bj_end : null;
  if (_bjEndOrig) {
    bj_end = function(msg, cls) { _bjEndOrig(msg, cls); setTimeout(bj_check_balance, 300); };
  }
  /* Slot bitişini hook et — slotSpin click sonrasında çalışır */
  var _slotSpinBtn = document.getElementById('slotSpin');
  if (_slotSpinBtn) {
    _slotSpinBtn.addEventListener('click', function(){ setTimeout(slot_check_balance, 4000); });
  }
} catch(e) { console.error('BalanceReset error', e); }

/* ══════════════════════════════════════════════════════════
   HUB PAGE NAVIGATION SYSTEM
══════════════════════════════════════════════════════════ */
(function() {
  var HUB_CATS = [
    { label: '🎮 Oyunlar', items: [
      {em:'🎮', ttl:'Oyun Portalı',   dsc:'Tüm mini oyunlar lobisi', id:'games'},
      {em:'🐍', ttl:'Snake (Yılan)',   dsc:'Klasik yılan oyunu',      id:'snake-sec'},
      {em:'🏓', ttl:'Pong',           dsc:'AI rakibine karşı',       id:'pong'},
      {em:'🃏', ttl:'Blackjack',      dsc:"21'i geç",               id:'blackjack'},
      {em:'🎰', ttl:'Slot Makinesi',  dsc:'Şansını dene',            id:'slots'},
      {em:'🔐', ttl:'Mastermind',     dsc:'Şifre kırıcı',           id:'mastermind'},
      {em:'🎯', ttl:'Hareketli Hedef',dsc:'Nişancılık testi',       id:'target'},
      {em:'⚡', ttl:'Speed Clicker',  dsc:'Kaç kez tıklayabilirsin?',id:'clicker'},
      {em:'🎲', ttl:'Zar Toplayıcı',  dsc:"D4'ten D100'e",          id:'dice'},
      {em:'🃏', ttl:'Hafıza Kartları',dsc:'Eşleştirme oyunu',       id:'memory-sec'},
      {em:'🫧', ttl:'Bubble Pop',     dsc:'Balon patlatma',          id:'bubble-sec'},
      {em:'⚡', ttl:'Refleks Testi',   dsc:'Yeşile dönünce tıkla',    id:'reaction-sec'},
      {em:'🎨', ttl:'Renk Yarışı',     dsc:'Rengi doğru adlandır',    id:'color-sec'},
      {em:'🧩', ttl:'15 Puzzle',       dsc:'Sayıları sıraya diz',     id:'puzzle-sec'},
      {em:'🐹', ttl:'Köstebek Vur',    dsc:'Köstebekleri yakala',     id:'mole-sec'},
      {em:'❌', ttl:'XOX — AI',        dsc:'AI\'a karşı XOX oyna',    id:'ttt-sec'},
      {em:'📝', ttl:'Kelime Bulmaca',  dsc:'Harfleri kelimelere diz', id:'word-sec'},
      {em:'🧠', ttl:'Simon Says',      dsc:'Renk sırasını ezberle',   id:'simon-sec'},
      {em:'🔢', ttl:'Matematik Sprint',dsc:'Hızlı matematik işlemleri',id:'math-sec'},
      {em:'✊', ttl:'Taş-Kağıt-Makas',dsc:'AI\'a karşı düello',     id:'rps-sec'},
      {em:'🎯', ttl:'Sayı Tahmin',     dsc:'Gizli sayıyı bul',        id:'guess-sec'},
      {em:'💣', ttl:'Mayın Tarlası',   dsc:'Mayınları temizle',       id:'mine-sec'},
      {em:'⌨️', ttl:'Yazma Hızı',      dsc:'WPM yazma hızı testi',    id:'typing-sec'},
      {em:'🌍', ttl:'Coğrafya Quiz',  dsc:'Başkentleri bil',         id:'geography'},
      {em:'🧪', ttl:'Piksel Fizik',   dsc:'Zen fizik simülatörü',    id:'sand-sec'},
      {em:'🛸', ttl:'Kozmik Flappy',  dsc:'Uçan daire kaçış oyunu',  id:'flappy-sec'},
      {em:'☄️', ttl:'Kozmik Savunucu', dsc:'Retro galaksi savaşı',    id:'shooter-sec'},
      {em:'🧩', ttl:'Neon 2048',      dsc:'Sayı birleştirme bulmacası',id:'m2048-sec'},
      {em:'🌀', ttl:'Kozmik Labirent', dsc:'Sonsuz labirent çözücü',   id:'maze-sec'},
      {em:'🚀', ttl:'Kozmik Orbit',   dsc:'Zen yerçekimi sapanı oyunu',id:'orbit-sec'},
      {em:'🌊', ttl:'Zen Renk Seli',   dsc:'Renk yayılım bulmacası oyunu',id:'color-flood-sec'},
      {em:'🌀', ttl:'Hafıza Yörüngesi', dsc:'Desen ezberleme hafıza testi',id:'memory-orbit-sec'}
    ]},
    { label: '🎨 Yaratıcılık & Huzur', items: [
      {em:'🌌', ttl:'Kozmik Nebula',  dsc:'Karadelik & parçacık simülatörü',id:'nebula-sec'},
      {em:'🎹', ttl:'Zen Melodi Havuzu',dsc:'İnteraktif ambiyans sentezleyici',id:'dreampad-sec'},
      {em:'🌸', ttl:'Zen Bonsai Bahçesi',dsc:'Fraktal ağaç & kum tırmık bahçesi',id:'bonsai-sec'},
      {em:'💨', ttl:'Rüzgar Akışı Tuvali',dsc:'Soyut akışkan parçacık boyama',id:'flowfield-sec'},
      {em:'🌀', ttl:'Zen Kaleidoskop',dsc:'Simetrik çizim tuvali',   id:'kaleido-sec'},
      {em:'🎨', ttl:'Pixel Art',      dsc:'Dijital piksel sanatı',   id:'pixelart'},
      {em:'🌊', ttl:'Dalga Tuvali',   dsc:'İnteraktif dalgalar',     id:'ripple'},
      {em:'🖌️', ttl:'Serbest Çizim',  dsc:'Dijital çizim tahtası',   id:'canvas-sec'},
      {em:'🌈', ttl:'Palet Üretici',  dsc:'Renk paletleri',          id:'palette-sec'},
      {em:'🎹', ttl:'Virtual Piano',  dsc:'Piyano çal, müzik yap',   id:'piano'},
      {em:'📖', ttl:'Emoji Hikaye',   dsc:'Emojilerle hikaye yaz',   id:'emojistory'},
      {em:'🌌', ttl:'Yerçekimi Sandboxı', dsc:'Gezegen yörüngeleri ve kozmik kütleçekim sandboxı',id:'gravity-sec'},
      {em:'🎛️', ttl:'Zen Yapay Yaşam', dsc:'Lenia hücresel otomat ve kozmik organizma sandboxı',id:'lenia-sec'}
    ]},
    { label: '🤖 Yapay Zeka & Zihin', items: [
      {em:'🔮', ttl:'Rüya Yorumlayıcı',  dsc:'Yapay zeka ile bilinçaltı rüya analizi',id:'dream-weaver-sec'},
      {em:'🧘', ttl:'Zen AI Mentor',     dsc:'Bilge mentorlar & canlı duygu küresi', id:'zen-mentor-sec'},
      {em:'🕵️', ttl:'AI Şüpheli Dedektif',dsc:'Robot dedektiflik Turing testi oyunu',id:'turing-detective-sec'},
      {em:'🚀', ttl:'Karizma Simülatörü', dsc:'AI pazarlık & ikna kabiliyeti testi', id:'pitch-negotiator-sec'}
    ]},
    { label: '🌍 Keşif & Bilgi', items: [
      {em:'🗺️', ttl:'Dünya Kaşifi',   dsc:"Dünyanın güzel yerleri",  id:'world'},
      {em:'🌌', ttl:'Yıldız Haritası',dsc:'Takımyıldızları keşfet',  id:'stars'},
      {em:'🌙', ttl:'Ay Fazı',        dsc:'Bugünkü ay takvimi',      id:'moonphase'},
      {em:'💡', ttl:'Bilgi Kartları', dsc:'İlginç gerçekler',        id:'facts'},
      {em:'🔭', ttl:'Kozmik Teleskop',dsc:'Derin uzay vizörü',       id:'telescope-sec'},
      {em:'🌌', ttl:'Nebula Ansiklopedisi',dsc:'Derin uzay nebulalarını keşfet',id:'nebula-info-sec'},
      {em:'📏', ttl:'Evrenin Ölçeği',     dsc:'Mikro kozmostan makro kozmosa ölçek cetveli',id:'universe-scale-sec'},
      {em:'🕳️', ttl:'Kara Delik',     dsc:'Schwarzschild bükümlü kütleçekim foton sandboxı',id:'blackhole-sec'},
      {em:'🔮', ttl:'Rezonans Tablası', dsc:'Çınlama frekanslı kimatik plaka kum mandala çizici',id:'cymatics-sec'}
    ]},
    { label: '🔮 Gizemli & Eğlenceli', items: [
      {em:'🎱', ttl:'Sihirli 8 Top',  dsc:'Geleceğini öğren',        id:'magic8'},
      {em:'🃏', ttl:'Tarot Kartları', dsc:'Geçmiş, şimdi, gelecek',  id:'tarot'},
      {em:'🔮', ttl:'Sayı Büyüsü',    dsc:'Aklındaki sayıyı bilirim',id:'nummagic'},
      {em:'💭', ttl:'Ya Şunu Seçsen?',dsc:'Zor ikilemler',           id:'wyr'},
      {em:'🌀', ttl:'Kaos Fraktalı',      dsc:'Kaos oyunu fraktal çizici',id:'chaos-fractal-sec'},
      {em:'🧩', ttl:'Paradokslar Bahçesi',dsc:'Zihinsel düşünce deneyleri & paradokslar',id:'paradox-sec'},
      {em:'🌀', ttl:'Kaotik Sarkaç',   dsc:'Çift sarkaç kaos teorisi neon yörünge sandboxı',id:'double-pendulum-sec'},
      {em:'👁️‍🗨️', ttl:'Kuantum Gözlemci',dsc:'Çift yarık dalga fonksiyonu çöküş simülatörü',id:'quantum-sec'},
      {em:'🏛️', ttl:'Filozoflar Arenası',dsc:'Sokrates, Nietzsche, Aurelius simüle Sokratik tartışma',id:'debate-sec'}
    ]},
    { label: '🛠️ Araçlar & Kişisel', items: [
      {em:'🔑', ttl:'Şifre Üretici',  dsc:'Güvenli şifreler oluştur',id:'passgen'},
      {em:'📝', ttl:'Sezar Şifresi',  dsc:'Gizli mesajlar şifrele',  id:'cipher'},
      {em:'🎵', ttl:'Ambiyans Sesleri',dsc:'Doğa sesleri',            id:'ambiance'},
      {em:'🌿', ttl:'Nefes Egzersizi',dsc:'Rahatlama',                id:'breathe'},
      {em:'📓', ttl:'Şükran Günlüğü', dsc:'Günlük notlar',            id:'gratitude'},
      {em:'🟢', ttl:'Ruh Hali Çemberi',dsc:'Duygusal aura mandala visualizer',id:'aura-sec'},
      {em:'⏱️', ttl:'Odaklanma Saati',dsc:'Analog saat & ses mikseri',id:'zenclock-sec'},
      {em:'📅', ttl:'Günlük Görev',   dsc:'Hedefler ve seri takibi', id:'daily'},
      {em:'🎡', ttl:'Kozmik Karar Çarkı',dsc:'Kararsız anlar için çark çevir',id:'wheel-sec'},
      {em:'📊', ttl:'Metin Analizörü',dsc:'Kelime sayacı & duygu analizörü',id:'text-sec'},
      {em:'📈', ttl:'Bioritim Grafik',dsc:'Fiziksel, duygusal, zihinsel ritim',id:'biorhythm-sec'},
      {em:'⏱️', ttl:'Cam Kronometre',dsc:'Tur kayıtlı süreölçer & zamanlayıcı',id:'stopwatch-sec'},
      {em:'📌', ttl:'Zen Yapışkan Notlar',dsc:'Tarayıcıda kalıcı renkli yapışkan notlar',id:'notes-sec'},
      {em:'🪙', ttl:'Kripto Simülatörü',dsc:'Canlı dalgalanan borsa simülasyonu',id:'crypto-sec'},
      {em:'⚖️', ttl:'Beden Kitle Endeksi',dsc:'Sürgülü BKE hesaplayıcı & sağlık',id:'bmi-sec'},
      {em:'🎧', ttl:'İkili İşitsel Ritim',dsc:'Meditation & uyku ritimleri sentezleyici',id:'binaural-sec'},
      {em:'💧', ttl:'Zen Su Takipçisi',  dsc:'Günlük su hedefini eğlenceli dalgalarla izle',id:'water-sec'},
      {em:'✔️', ttl:'Zen Yapılacaklar',  dsc:'Motivasyonel yapılacak işler kontrol listesi',id:'todo-sec'}
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

/* ══════════════════════════════════════════════════════════
   AAA 1: KOZMİK NEBULA SIMULATOR
   ══════════════════════════════════════════════════════════ */
try {
  var nebulaCanvas = document.getElementById('nebulaCanvas');
  if (nebulaCanvas) {
    var nctx = nebulaCanvas.getContext('2d');
    var nebulaParticles = [], nebulaAttractors = [];
    var nebulaGravityVal = 5;
    var nebulaParticleTheme = 'cosmic';
    
    function initNebulaParticles(count) {
      nebulaParticles = [];
      var W = nebulaCanvas.width, H = nebulaCanvas.height;
      for (var i = 0; i < count; i++) {
        var angle = Math.random() * Math.PI * 2;
        var dist = Math.random() * Math.min(W, H) * 0.4 + 50;
        nebulaParticles.push({
          x: W / 2 + Math.cos(angle) * dist,
          y: H / 2 + Math.sin(angle) * dist,
          vx: -Math.sin(angle) * (Math.random() * 2 + 1),
          vy: Math.cos(angle) * (Math.random() * 2 + 1),
          size: Math.random() * 1.5 + 0.5,
          color: getNebulaColor(Math.random()),
          alpha: Math.random() * 0.5 + 0.5
        });
      }
    }
    
    function getNebulaColor(rand) {
      if (nebulaParticleTheme === 'supernova') {
        return 'hsl(' + (rand * 45 + 5) + ', 100%, ' + (50 + rand * 30) + '%)'; // Red/Orange/Yellow
      } else if (nebulaParticleTheme === 'aurora') {
        return 'hsl(' + (rand * 60 + 90) + ', 95%, 60%)'; // Green/Cyan
      }
      return 'hsl(' + (rand * 80 + 260) + ', 90%, 65%)'; // Cosmic Purple/Magenta/Blue
    }
    
    function resizeNebula() {
      var rect = nebulaCanvas.parentElement.getBoundingClientRect();
      nebulaCanvas.width = rect.width || 800;
      nebulaCanvas.height = 450;
      initNebulaParticles(parseInt(document.getElementById('nebulaCount').value, 10));
    }
    
    var _nebulaFPS = makeFPSGate(30);
    function updateNebula(now) {
      requestAnimationFrame(updateNebula);
      if (!isCanvasActive('nebulaCanvas')) return;
      if (!_nebulaFPS(now || 0)) return;
      var W = nebulaCanvas.width, H = nebulaCanvas.height;
      nctx.fillStyle = 'rgba(4, 5, 13, 0.08)';
      nctx.fillRect(0, 0, W, H);
      nebulaAttractors.forEach(function(att) {
        nctx.beginPath();
        var glow = nctx.createRadialGradient(att.x, att.y, 2, att.x, att.y, att.size * 2.5);
        glow.addColorStop(0, '#fff');
        glow.addColorStop(0.3, 'rgba(124, 77, 255, 0.8)');
        glow.addColorStop(0.8, 'rgba(255, 107, 157, 0.2)');
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        nctx.fillStyle = glow;
        nctx.arc(att.x, att.y, att.size * 2.5, 0, Math.PI * 2);
        nctx.fill();
        nctx.beginPath();
        nctx.fillStyle = '#000';
        nctx.arc(att.x, att.y, att.size * 0.8, 0, Math.PI * 2);
        nctx.fill();
      });
      nctx.globalCompositeOperation = 'screen';
      nebulaParticles.forEach(function(p) {
        if (nebulaAttractors.length > 0) {
          nebulaAttractors.forEach(function(att) {
            var dx = att.x - p.x;
            var dy = att.y - p.y;
            var distSq = dx * dx + dy * dy + 1000;
            var dist = Math.sqrt(distSq);
            var force = (nebulaGravityVal * 0.08 * att.mass) / distSq;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          });
        } else {
          var dx = W / 2 - p.x;
          var dy = H / 2 - p.y;
          var distSq = dx * dx + dy * dy + 2000;
          var dist = Math.sqrt(distSq);
          p.vx += (dx / dist) * 0.05;
          p.vy += (dy / dist) * 0.05;
        }
        p.vx *= 0.99;
        p.vy *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        nctx.beginPath();
        nctx.fillStyle = p.color;
        nctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        nctx.fill();
      });
      nctx.globalCompositeOperation = 'source-over';
    }
    
    // Listeners
    nebulaCanvas.addEventListener('mousedown', function(e) {
      var rect = nebulaCanvas.getBoundingClientRect();
      var x = (e.clientX - rect.left) * (nebulaCanvas.width / rect.width);
      var y = (e.clientY - rect.top) * (nebulaCanvas.height / rect.height);
      nebulaAttractors.push({ x: x, y: y, size: Math.random() * 8 + 6, mass: Math.random() * 8 + 6 });
      if (nebulaAttractors.length > 5) nebulaAttractors.shift(); // Max 5 attractors
    });
    
    document.getElementById('nebulaCount').addEventListener('input', function() {
      var count = parseInt(this.value, 10);
      document.getElementById('nebulaCountDisplay').textContent = count;
      initNebulaParticles(count);
    });
    
    document.getElementById('nebulaGravity').addEventListener('input', function() {
      nebulaGravityVal = parseInt(this.value, 10);
    });
    
    document.getElementById('nebulaThemeCosmic').addEventListener('click', function() {
      document.querySelectorAll('#nebulaThemeCosmic,#nebulaThemeSupernova,#nebulaThemeAurora').forEach(function(b){ b.classList.remove('active'); });
      this.classList.add('active');
      nebulaParticleTheme = 'cosmic';
      nebulaParticles.forEach(function(p){ p.color = getNebulaColor(Math.random()); });
    });
    
    document.getElementById('nebulaThemeSupernova').addEventListener('click', function() {
      document.querySelectorAll('#nebulaThemeCosmic,#nebulaThemeSupernova,#nebulaThemeAurora').forEach(function(b){ b.classList.remove('active'); });
      this.classList.add('active');
      nebulaParticleTheme = 'supernova';
      nebulaParticles.forEach(function(p){ p.color = getNebulaColor(Math.random()); });
    });
    
    document.getElementById('nebulaThemeAurora').addEventListener('click', function() {
      document.querySelectorAll('#nebulaThemeCosmic,#nebulaThemeSupernova,#nebulaThemeAurora').forEach(function(b){ b.classList.remove('active'); });
      this.classList.add('active');
      nebulaParticleTheme = 'aurora';
      nebulaParticles.forEach(function(p){ p.color = getNebulaColor(Math.random()); });
    });
    
    document.getElementById('clearNebula').addEventListener('click', function() {
      nebulaAttractors = [];
      toast('Karadelikler temizlendi! 🌌', '#7c4dff');
    });
    
    document.getElementById('resetNebula').addEventListener('click', function() {
      nebulaAttractors = [];
      initNebulaParticles(parseInt(document.getElementById('nebulaCount').value, 10));
      toast('Simülasyon sıfırlandı!', '#00e5ff');
    });
    
    window.addEventListener('resize', resizeNebula);
    resizeNebula();
    updateNebula();
  }
} catch(e) { console.error('CosmicNebula error', e); }

/* ══════════════════════════════════════════════════════════
   AAA 2: ZEN AMBIENT PAD (DREAM PAD SYNTH)
   ══════════════════════════════════════════════════════════ */
try {
  var dreampadGrid = document.getElementById('dreampadGrid');
  if (dreampadGrid) {
    // 6x6 Pentatonic Scale mapping (Notes always sound beautiful together)
    // C Major/A Minor Pentatonic: A, C, D, E, G
    var PENTATONIC_FREQS = [
      110.00, 130.81, 146.83, 164.81, 196.00, 220.00,
      261.63, 293.66, 329.63, 392.00, 440.00, 523.25,
      587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66,
      1318.51, 1567.98, 1760.00, 2093.00, 2349.32, 2637.02,
      3135.96, 3520.00, 4186.01, 4698.64, 5274.04, 6271.93,
      7040.00, 8372.02, 9397.27, 10548.08, 12543.86, 14080.00
    ];
    
    var audioCtx = null;
    var masterVolNode = null;
    var activeSynthVoice = 'warm'; // warm, echo, deep
    var dreampadAutoPlayInterval = null;
    var dreampadIsAutoPlaying = false;
    
    function initAudioContext() {
      if (audioCtx) return;
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      masterVolNode = audioCtx.createGain();
      masterVolNode.gain.value = parseFloat(document.getElementById('dreampadVolume').value) / 100 * 0.15;
      
      // Deep Delay node for majestic ambient soundscape
      var delay = audioCtx.createDelay(2.0);
      var feedback = audioCtx.createGain();
      feedback.gain.value = 0.55; // 55% feedback echo
      delay.delayTime.value = 0.45; // 450ms echo
      
      // Connect sound path
      masterVolNode.connect(audioCtx.destination);
      
      // Connect Delay loop
      masterVolNode.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(audioCtx.destination);
    }
    
    function playSynthNote(freq) {
      if (!audioCtx) initAudioContext();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      var filter = audioCtx.createBiquadFilter();
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterVolNode);
      
      var now = audioCtx.currentTime;
      
      // Warm Sine voice
      if (activeSynthVoice === 'warm') {
        osc.type = 'sine';
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.Q.setValueAtTime(1, now);
      } else if (activeSynthVoice === 'echo') {
        osc.type = 'triangle';
        filter.type = 'peaking';
        filter.frequency.setValueAtTime(1200, now);
        filter.Q.setValueAtTime(4, now);
      } else {
        // Deep Zen Organ (sawtooth filtered down heavily)
        osc.type = 'sawtooth';
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(280, now);
        filter.Q.setValueAtTime(6, now);
      }
      
      osc.frequency.setValueAtTime(freq, now);
      
      // Ambient sound: Slow attack, long dreamy decay
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.8, now + 0.15); // 150ms attack
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0); // 2 second release decay
      
      osc.start(now);
      osc.stop(now + 2.1);
    }
    
    // Generate the 6x6 grid
    dreampadGrid.innerHTML = '';
    for (var r = 0; r < 6; r++) {
      for (var c = 0; c < 6; c++) {
        (function(row, col) {
          var idx = row * 6 + col;
          var cell = document.createElement('div');
          cell.className = 'dreampad-cell';
          cell.dataset.note = idx;
          
          function triggerCell() {
            cell.classList.add('active');
            playSynthNote(PENTATONIC_FREQS[idx % PENTATONIC_FREQS.length]);
            setTimeout(function() { cell.classList.remove('active'); }, 200);
          }
          
          cell.addEventListener('mousedown', function() { triggerCell(); });
          cell.addEventListener('mouseenter', function(e) {
            if (e.buttons === 1) triggerCell();
          });
          
          dreampadGrid.appendChild(cell);
        })(r, c);
      }
    }
    
    // Voice selection listeners
    document.getElementById('dreampadSoundWarm').addEventListener('click', function() {
      document.querySelectorAll('#dreampadSoundWarm,#dreampadSoundEcho,#dreampadSoundDeep').forEach(function(b){b.classList.remove('active');});
      this.classList.add('active'); activeSynthVoice = 'warm';
    });
    document.getElementById('dreampadSoundEcho').addEventListener('click', function() {
      document.querySelectorAll('#dreampadSoundWarm,#dreampadSoundEcho,#dreampadSoundDeep').forEach(function(b){b.classList.remove('active');});
      this.classList.add('active'); activeSynthVoice = 'echo';
    });
    document.getElementById('dreampadSoundDeep').addEventListener('click', function() {
      document.querySelectorAll('#dreampadSoundWarm,#dreampadSoundEcho,#dreampadSoundDeep').forEach(function(b){b.classList.remove('active');});
      this.classList.add('active'); activeSynthVoice = 'deep';
    });
    
    document.getElementById('dreampadVolume').addEventListener('input', function() {
      if (masterVolNode) {
        masterVolNode.gain.setValueAtTime(parseFloat(this.value) / 100 * 0.15, audioCtx.currentTime);
      }
    });
    
    // Generative Ambient Auto-Dream loop scheduler
    function playAutoDreamChord() {
      // Pick 3 random matching pentatonic notes (harmonious chords)
      var root = Math.floor(Math.random() * 12) + 3;
      var notes = [root, root + 4, root + 7];
      notes.forEach(function(n) {
        var freq = PENTATONIC_FREQS[n % PENTATONIC_FREQS.length];
        playSynthNote(freq);
        // Highlight active cells randomly for gorgeous feedback
        var cell = dreampadGrid.children[n % 36];
        if (cell) {
          cell.classList.add('active');
          setTimeout(function() { cell.classList.remove('active'); }, 600);
        }
      });
    }
    
    document.getElementById('dreampadAutoPlay').addEventListener('click', function() {
      initAudioContext();
      if (dreampadIsAutoPlaying) {
        clearInterval(dreampadAutoPlayInterval);
        dreampadIsAutoPlaying = false;
        this.classList.remove('active');
        this.textContent = '✨ Auto-Dream (Otomatik)';
        toast('Otomatik dinlenme sonlandırıldı.', '#546e7a');
      } else {
        dreampadIsAutoPlaying = true;
        this.classList.add('active');
        this.textContent = '⏸ Duraklat';
        playAutoDreamChord();
        dreampadAutoPlayInterval = setInterval(playAutoDreamChord, 3500); // New chord every 3.5s
        toast('Generatif Zen Müziği Başlatıldı! 🎵', '#69f0ae');
      }
    });
  }
} catch(e) { console.error('Dreampad error', e); }

/* ══════════════════════════════════════════════════════════
   AAA 3: ZEN BONSAI GARDEN (PROCEDURAL GROWER & FRACTALS)
   ══════════════════════════════════════════════════════════ */
try {
  var bonsaiCanvas = document.getElementById('bonsaiCanvas');
  if (bonsaiCanvas) {
    var bctx = bonsaiCanvas.getContext('2d');
    var bonsaiType = 'sakura'; // sakura, oak, fern
    var bonsaiDepthVal = 7;
    var bonsaiWindVal = 2;
    var bonsaiTool = 'plant'; // plant, rake
    var bonsaiPlants = [];
    var bonsaiRakeWaves = [];
    var bonsaiIsRaking = false;
    
    function resizeBonsai() {
      var rect = bonsaiCanvas.parentElement.getBoundingClientRect();
      bonsaiCanvas.width = rect.width || 800;
      bonsaiCanvas.height = 450;
      redrawBonsaiGarden();
    }
    
    // Draw recursive fractal tree branch
    function drawBonsaiBranch(x1, y1, angle, depth, length, thickness) {
      if (depth === 0) {
        // Draw leaves/blossoms
        bctx.beginPath();
        if (bonsaiType === 'sakura') {
          bctx.fillStyle = 'rgba(255, 107, 157, 0.7)'; // Sakura blossom pink
          bctx.arc(x1, y1, Math.random() * 5 + 3, 0, Math.PI * 2);
        } else if (bonsaiType === 'oak') {
          bctx.fillStyle = 'rgba(0, 229, 255, 0.7)'; // Cyber Neon Oak
          bctx.arc(x1, y1, Math.random() * 6 + 4, 0, Math.PI * 2);
        } else {
          bctx.fillStyle = 'rgba(105, 240, 174, 0.8)'; // Fern green frond
          bctx.arc(x1, y1, 2, 0, Math.PI * 2);
        }
        bctx.fill();
        return;
      }
      
      // Calculate dynamic wind offset
      var windOffset = Math.sin(Date.now() * 0.0015 + depth) * (bonsaiWindVal * 0.015);
      var x2 = x1 + Math.cos(angle + windOffset) * length;
      var y2 = y1 + Math.sin(angle + windOffset) * length;
      
      bctx.beginPath();
      bctx.moveTo(x1, y1);
      bctx.lineTo(x2, y2);
      bctx.strokeStyle = bonsaiType === 'fern' ? 'rgba(105, 240, 174, 0.45)' : 'rgba(240, 240, 255, 0.45)';
      bctx.lineWidth = thickness;
      bctx.lineCap = 'round';
      bctx.stroke();
      
      var nextLen = length * (bonsaiType === 'fern' ? 0.82 : 0.78);
      var nextThickness = thickness * 0.7;
      
      if (bonsaiType === 'fern') {
        // Spiral recursive split
        drawBonsaiBranch(x2, y2, angle - 0.25, depth - 1, nextLen, nextThickness);
        drawBonsaiBranch(x2, y2, angle + 0.25, depth - 1, nextLen, nextThickness);
      } else {
        // Asymmetric branch splits (more organic look)
        drawBonsaiBranch(x2, y2, angle - 0.4 + (Math.random() * 0.1), depth - 1, nextLen, nextThickness);
        drawBonsaiBranch(x2, y2, angle + 0.35 - (Math.random() * 0.1), depth - 1, nextLen, nextThickness);
      }
    }
    
    function redrawBonsaiGarden() {
      var W = bonsaiCanvas.width, H = bonsaiCanvas.height;
      bctx.clearRect(0, 0, W, H);
      
      // 1. Draw sand rake lines (Zen ripples)
      bctx.lineWidth = 4;
      bonsaiRakeWaves.forEach(function(wave) {
        bctx.beginPath();
        bctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        wave.points.forEach(function(pt, idx) {
          if (idx === 0) bctx.moveTo(pt.x, pt.y);
          else bctx.lineTo(pt.x, pt.y);
        });
        bctx.stroke();
      });
      
      // 2. Draw procedural ground base
      bctx.beginPath();
      var grad = bctx.createLinearGradient(0, H - 40, 0, H);
      grad.addColorStop(0, '#101221');
      grad.addColorStop(1, '#05060b');
      bctx.fillStyle = grad;
      bctx.fillRect(0, H - 40, W, 40);
      
      bctx.beginPath();
      bctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      bctx.lineWidth = 1;
      bctx.moveTo(0, H - 40);
      bctx.lineTo(W, H - 40);
      bctx.stroke();
      
      // 3. Draw planted trees
      bonsaiPlants.forEach(function(tree) {
        drawBonsaiBranch(tree.x, H - 40, -Math.PI / 2, tree.depth, tree.len, tree.thick);
      });
    }
    
    var _bonsaiFPS = makeFPSGate(12);
    function bonsaiBreathingLoop(now) {
      requestAnimationFrame(bonsaiBreathingLoop);
      if (!isCanvasActive('bonsaiCanvas')) return;
      if (!_bonsaiFPS(now || 0)) return;
      redrawBonsaiGarden();
    }
    
    // Listeners
    bonsaiCanvas.addEventListener('mousedown', function(e) {
      var rect = bonsaiCanvas.getBoundingClientRect();
      var x = (e.clientX - rect.left) * (bonsaiCanvas.width / rect.width);
      var y = (e.clientY - rect.top) * (bonsaiCanvas.height / rect.height);
      
      var H = bonsaiCanvas.height;
      
      if (bonsaiTool === 'plant') {
        var baseLen = Math.random() * 15 + 45;
        bonsaiPlants.push({
          x: x,
          depth: bonsaiDepthVal,
          len: baseLen,
          thick: baseLen / 8
        });
        if (bonsaiPlants.length > 6) bonsaiPlants.shift(); // Max 6 trees
      } else {
        // Start raking sand waves
        bonsaiIsRaking = true;
        bonsaiRakeWaves.push({ points: [{ x: x, y: y }] });
        if (bonsaiRakeWaves.length > 20) bonsaiRakeWaves.shift(); // Max 20 waves
      }
    });
    
    bonsaiCanvas.addEventListener('mousemove', function(e) {
      if (!bonsaiIsRaking || bonsaiTool !== 'rake') return;
      var rect = bonsaiCanvas.getBoundingClientRect();
      var x = (e.clientX - rect.left) * (bonsaiCanvas.width / rect.width);
      var y = (e.clientY - rect.top) * (bonsaiCanvas.height / rect.height);
      
      var activeWave = bonsaiRakeWaves[bonsaiRakeWaves.length - 1];
      if (activeWave) {
        activeWave.points.push({ x: x, y: y });
      }
    });
    
    window.addEventListener('mouseup', function() {
      bonsaiIsRaking = false;
    });
    
    document.getElementById('bonsaiDepth').addEventListener('input', function() {
      bonsaiDepthVal = parseInt(this.value, 10);
      document.getElementById('bonsaiDepthDisplay').textContent = bonsaiDepthVal;
    });
    
    document.getElementById('bonsaiWind').addEventListener('input', function() {
      bonsaiWindVal = parseInt(this.value, 10);
    });
    
    document.getElementById('bonsaiTypeSakura').addEventListener('click', function() {
      document.querySelectorAll('#bonsaiTypeSakura,#bonsaiTypeOak,#bonsaiTypeFern').forEach(function(b){b.classList.remove('active');});
      this.classList.add('active'); bonsaiType = 'sakura';
    });
    document.getElementById('bonsaiTypeOak').addEventListener('click', function() {
      document.querySelectorAll('#bonsaiTypeSakura,#bonsaiTypeOak,#bonsaiTypeFern').forEach(function(b){b.classList.remove('active');});
      this.classList.add('active'); bonsaiType = 'oak';
    });
    document.getElementById('bonsaiTypeFern').addEventListener('click', function() {
      document.querySelectorAll('#bonsaiTypeSakura,#bonsaiTypeOak,#bonsaiTypeFern').forEach(function(b){b.classList.remove('active');});
      this.classList.add('active'); bonsaiType = 'fern';
    });
    
    document.getElementById('bonsaiToolPlant').addEventListener('click', function() {
      document.getElementById('bonsaiToolRake').classList.remove('active');
      this.classList.add('active'); bonsaiTool = 'plant';
      bonsaiCanvas.style.cursor = 'default';
    });
    document.getElementById('bonsaiToolRake').addEventListener('click', function() {
      document.getElementById('bonsaiToolPlant').classList.remove('active');
      this.classList.add('active'); bonsaiTool = 'rake';
      bonsaiCanvas.style.cursor = 'w-resize';
      toast('Tırmık moduna geçildi. Zemin üzerine desen çizin!', '#ff6b9d');
    });
    
    document.getElementById('clearBonsai').addEventListener('click', function() {
      bonsaiPlants = [];
      bonsaiRakeWaves = [];
      redrawBonsaiGarden();
      toast('Bahçe sıfırlandı! 🌱', '#69f0ae');
    });
    
    document.getElementById('saveBonsai').addEventListener('click', function() {
      var a = document.createElement('a');
      a.download = 'zen-bonsai-garden.png';
      a.href = bonsaiCanvas.toDataURL();
      a.click();
      toast('Zen Bahçesi galerinize kaydedildi!', '#00e5ff');
    });
    
    window.addEventListener('resize', resizeBonsai);
    resizeBonsai();
    bonsaiBreathingLoop();
  }
} catch(e) { console.error('Bonsai error', e); }

/* ══════════════════════════════════════════════════════════
   AAA 4: RÜZGAR AKIŞI TUVALİ (VECTOR FLOW FIELD PAINTER)
   ══════════════════════════════════════════════════════════ */
try {
  var flowCanvas = document.getElementById('flowfieldCanvas');
  if (flowCanvas) {
    var fctx = flowCanvas.getContext('2d');
    var flowParticles = [];
    var flowWindForce = 4;
    var flowLifeMax = 80;
    var flowColorTheme = 'rainbow'; // rainbow, ocean, fire
    var flowMouse = { x: -999, y: -999, px: -999, py: -999, active: false };
    
    function initFlowParticles() {
      flowParticles = [];
      var W = flowCanvas.width, H = flowCanvas.height;
      for (var i = 0; i < 800; i++) {
        flowParticles.push(spawnFlowParticle(W, H));
      }
    }
    
    function spawnFlowParticle(W, H) {
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: 0,
        vy: 0,
        age: 0,
        maxAge: Math.random() * flowLifeMax + 20,
        color: getFlowColor(Math.random()),
        size: Math.random() * 1.5 + 0.4
      };
    }
    
    function getFlowColor(rand) {
      if (flowColorTheme === 'ocean') {
        return 'hsl(' + (rand * 40 + 180) + ', 95%, ' + (40 + rand * 30) + '%)'; // Cyan/Blue
      } else if (flowColorTheme === 'fire') {
        return 'hsl(' + (rand * 45) + ', 100%, 55%)'; // Red/Orange
      }
      // Rainbow spectrum
      return 'hsl(' + (Date.now() / 30 + rand * 360) % 360 + ', 90%, 65%)';
    }
    
    function resizeFlowCanvas() {
      var rect = flowCanvas.parentElement.getBoundingClientRect();
      flowCanvas.width = rect.width || 800;
      flowCanvas.height = 450;
      // Initialize full dark canvas
      fctx.fillStyle = '#030308';
      fctx.fillRect(0, 0, flowCanvas.width, flowCanvas.height);
      initFlowParticles();
    }
    
    var _flowFPS = makeFPSGate(24);
    function drawFlowField(now) {
      requestAnimationFrame(drawFlowField);
      if (!isCanvasActive('flowfieldCanvas')) return;
      if (!_flowFPS(now || 0)) return;
      
      var W = flowCanvas.width, H = flowCanvas.height;
      
      // Extremely low alpha fill to create smooth cosmic vector trails
      fctx.fillStyle = 'rgba(3, 3, 8, 0.04)';
      fctx.fillRect(0, 0, W, H);
      
      fctx.globalCompositeOperation = 'screen';
      flowParticles.forEach(function(p, idx) {
        p.age++;
        if (p.age >= p.maxAge) {
          flowParticles[idx] = spawnFlowParticle(W, H);
          return;
        }
        
        // Compute mathematical flow field vectors (trigonometric wind paths)
        // Noise-like dynamic direction
        var angle = (Math.sin(p.x * 0.005) + Math.cos(p.y * 0.005)) * Math.PI * 2;
        var windX = Math.cos(angle) * (flowWindForce * 0.25);
        var windY = Math.sin(angle) * (flowWindForce * 0.25);
        
        p.vx += windX;
        p.vy += windY;
        
        // Mouse attractor winds if active
        if (flowMouse.active) {
          var dx = flowMouse.x - p.x;
          var dy = flowMouse.y - p.y;
          var dist = Math.sqrt(dx * dx + dy * dy) + 1;
          if (dist < 150) {
            var pull = (150 - dist) / 150;
            // Generate circular swirl velocity based on mouse delta movement
            p.vx += (dy / dist) * pull * 4;
            p.vy -= (dx / dist) * pull * 4;
          }
        }
        
        // Drag limiters
        p.vx *= 0.94;
        p.vy *= 0.94;
        
        p.x += p.vx;
        p.y += p.vy;
        
        // Wraparound edge limits
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
        
        fctx.beginPath();
        fctx.fillStyle = p.color;
        // Shift colors slightly over lifetime for gorgeous spectra
        if (flowColorTheme === 'rainbow') p.color = getFlowColor(idx / 800);
        fctx.arc(p.x, p.y, p.size * (1 - p.age / p.maxAge), 0, Math.PI * 2);
        fctx.fill();
      });
      fctx.globalCompositeOperation = 'source-over';
    }
    
    // Mouse dragging handlers
    flowCanvas.addEventListener('mousedown', function(e) {
      flowMouse.active = true;
      updateMousePos(e);
    });
    
    flowCanvas.addEventListener('mousemove', function(e) {
      if (flowMouse.active) updateMousePos(e);
    });
    
    window.addEventListener('mouseup', function() {
      flowMouse.active = false;
    });
    
    function updateMousePos(e) {
      var rect = flowCanvas.getBoundingClientRect();
      flowMouse.x = (e.clientX - rect.left) * (flowCanvas.width / rect.width);
      flowMouse.y = (e.clientY - rect.top) * (flowCanvas.height / rect.height);
    }
    
    document.getElementById('flowSpeed').addEventListener('input', function() {
      flowWindForce = parseInt(this.value, 10);
    });
    
    document.getElementById('flowLife').addEventListener('input', function() {
      flowLifeMax = parseInt(this.value, 10);
    });
    
    document.getElementById('flowPalRainbow').addEventListener('click', function() {
      document.querySelectorAll('#flowPalRainbow,#flowPalOcean,#flowPalFire').forEach(function(b){b.classList.remove('active');});
      this.classList.add('active'); flowColorTheme = 'rainbow';
    });
    document.getElementById('flowPalOcean').addEventListener('click', function() {
      document.querySelectorAll('#flowPalRainbow,#flowPalOcean,#flowPalFire').forEach(function(b){b.classList.remove('active');});
      this.classList.add('active'); flowColorTheme = 'ocean';
      flowParticles.forEach(function(p){ p.color = getFlowColor(Math.random()); });
    });
    document.getElementById('flowPalFire').addEventListener('click', function() {
      document.querySelectorAll('#flowPalRainbow,#flowPalOcean,#flowPalFire').forEach(function(b){b.classList.remove('active');});
      this.classList.add('active'); flowColorTheme = 'fire';
      flowParticles.forEach(function(p){ p.color = getFlowColor(Math.random()); });
    });
    
    document.getElementById('clearFlow').addEventListener('click', function() {
      fctx.fillStyle = '#030308';
      fctx.fillRect(0, 0, flowCanvas.width, flowCanvas.height);
      initFlowParticles();
      toast('Kanvas temizlendi! 💨', '#7c4dff');
    });
    
    document.getElementById('saveFlow').addEventListener('click', function() {
      var a = document.createElement('a');
      a.download = 'flow-field-art.png';
      a.href = flowCanvas.toDataURL();
      a.click();
      toast('Akışkan sanat eseri galerinize kaydedildi!', '#00e5ff');
    });
    
    window.addEventListener('resize', resizeFlowCanvas);
    resizeFlowCanvas();
    drawFlowField();
  }
} catch(e) { console.error('FlowField error', e); }

/* ══════════════════════════════════════════════════════════
   AAA 5: PIKSEL FIZIK SIMULATOR (ZEN FALLING SAND GAME)
   ══════════════════════════════════════════════════════════ */
try {
  var sandCanvas = document.getElementById('sandCanvas');
  if (sandCanvas) {
    var sctx = sandCanvas.getContext('2d');
    var sandW = 150, sandH = 100;
    var sandGrid = [];
    var activeElement = 'sand'; // sand, water, gunpowder, fire, acid, wall
    var sandBrushSize = 4;
    var sandIsDrawing = false;
    
    // Grid values: 0=empty, 1=wall, 2=sand, 3=water, 4=gunpowder, 5=fire, 6=acid
    function initSandGrid() {
      sandGrid = [];
      for (var y = 0; y < sandH; y++) {
        var row = [];
        for (var x = 0; x < sandW; x++) {
          row.push(0);
        }
        sandGrid.push(row);
      }
    }
    
    function resizeSand() {
      var rect = sandCanvas.parentElement.getBoundingClientRect();
      sandCanvas.width = rect.width || 800;
      sandCanvas.height = 430;
    }
    
    function drawSandGrid() {
      var W = sandCanvas.width, H = sandCanvas.height;
      var cellW = W / sandW;
      var cellH = H / sandH;
      
      sctx.fillStyle = '#07070c';
      sctx.fillRect(0, 0, W, H);
      
      for (var y = 0; y < sandH; y++) {
        for (var x = 0; x < sandW; x++) {
          var cell = sandGrid[y][x];
          if (cell !== 0) {
            if (cell === 1) sctx.fillStyle = 'rgba(255,255,255,0.18)'; // Wall
            else if (cell === 2) sctx.fillStyle = '#ffea00'; // Sand
            else if (cell === 3) sctx.fillStyle = '#00e5ff'; // Water
            else if (cell === 4) sctx.fillStyle = '#b388ff'; // Gunpowder
            else if (cell === 5) sctx.fillStyle = 'hsl(' + (Math.random() * 40 + 10) + ', 100%, 60%)'; // Fire
            else if (cell === 6) sctx.fillStyle = '#69f0ae'; // Acid
            
            sctx.fillRect(x * cellW, y * cellH, cellW + 0.5, cellH + 0.5);
          }
        }
      }
    }
    
    function updateSandPhysics() {
      // Create clone to prevent rapid double step updates in the same frame
      var nextGrid = [];
      for (var y = 0; y < sandH; y++) {
        nextGrid.push(sandGrid[y].slice());
      }
      
      // Update from bottom to top so falling sand drops naturally
      for (var y = sandH - 1; y >= 0; y--) {
        for (var x = 0; x < sandW; x++) {
          var cell = sandGrid[y][x];
          if (cell === 0 || cell === 1) continue; // Static or empty
          
          if (cell === 2) { // Sand physics
            if (y + 1 < sandH && nextGrid[y+1][x] === 0) {
              nextGrid[y][x] = 0; nextGrid[y+1][x] = 2;
            } else if (y + 1 < sandH && x - 1 >= 0 && nextGrid[y+1][x-1] === 0) {
              nextGrid[y][x] = 0; nextGrid[y+1][x-1] = 2;
            } else if (y + 1 < sandH && x + 1 < sandW && nextGrid[y+1][x+1] === 0) {
              nextGrid[y][x] = 0; nextGrid[y+1][x+1] = 2;
            }
          }
          
          else if (cell === 3) { // Water physics
            if (y + 1 < sandH && nextGrid[y+1][x] === 0) {
              nextGrid[y][x] = 0; nextGrid[y+1][x] = 3;
            } else if (y + 1 < sandH && x - 1 >= 0 && nextGrid[y+1][x-1] === 0) {
              nextGrid[y][x] = 0; nextGrid[y+1][x-1] = 3;
            } else if (y + 1 < sandH && x + 1 < sandW && nextGrid[y+1][x+1] === 0) {
              nextGrid[y][x] = 0; nextGrid[y+1][x+1] = 3;
            } else if (x - 1 >= 0 && nextGrid[y][x-1] === 0) { // Spread left
              nextGrid[y][x] = 0; nextGrid[y][x-1] = 3;
            } else if (x + 1 < sandW && nextGrid[y][x+1] === 0) { // Spread right
              nextGrid[y][x] = 0; nextGrid[y][x+1] = 3;
            }
          }
          
          else if (cell === 4) { // Gunpowder behaves like sand
            if (y + 1 < sandH && nextGrid[y+1][x] === 0) {
              nextGrid[y][x] = 0; nextGrid[y+1][x] = 4;
            } else if (y + 1 < sandH && x - 1 >= 0 && nextGrid[y+1][x-1] === 0) {
              nextGrid[y][x] = 0; nextGrid[y+1][x-1] = 4;
            } else if (y + 1 < sandH && x + 1 < sandW && nextGrid[y+1][x+1] === 0) {
              nextGrid[y][x] = 0; nextGrid[y+1][x+1] = 4;
            }
          }
          
          else if (cell === 5) { // Fire rises & ignites
            // Dissipate randomly
            if (Math.random() < 0.15) {
              nextGrid[y][x] = 0;
              continue;
            }
            // Rise up
            var targetY = y - 1;
            var targetX = x + Math.floor(Math.random() * 3) - 1;
            if (targetY >= 0 && targetX >= 0 && targetX < sandW) {
              var tc = nextGrid[targetY][targetX];
              if (tc === 0) {
                nextGrid[y][x] = 0; nextGrid[targetY][targetX] = 5;
              } else if (tc === 4) { // IGNITE!
                nextGrid[targetY][targetX] = 5;
                // Explode surrounding gunpowder cells!
                for (var dy = -2; dy <= 2; dy++) {
                  for (var dx = -2; dx <= 2; dx++) {
                    var ex = targetX + dx, ey = targetY + dy;
                    if (ex >= 0 && ex < sandW && ey >= 0 && ey < sandH) {
                      if (sandGrid[ey][ex] === 4) nextGrid[ey][ex] = 5;
                    }
                  }
                }
              } else if (tc === 3) { // Water puts out fire
                nextGrid[y][x] = 0; nextGrid[targetY][targetX] = 0;
              }
            }
          }
          
          else if (cell === 6) { // Acid physics
            if (y + 1 < sandH) {
              var bc = nextGrid[y+1][x];
              if (bc === 0) {
                nextGrid[y][x] = 0; nextGrid[y+1][x] = 6;
              } else if (bc === 1 || bc === 2 || bc === 4) { // Dissolve walls, sand, gunpowder
                nextGrid[y][x] = 0; nextGrid[y+1][x] = 0;
              } else {
                // Diagonal melt
                var sideX = x + (Math.random() < 0.5 ? -1 : 1);
                if (sideX >= 0 && sideX < sandW && nextGrid[y+1][sideX] === 0) {
                  nextGrid[y][x] = 0; nextGrid[y+1][sideX] = 6;
                }
              }
            } else {
              // Dissipate at bottom
              if (Math.random() < 0.2) nextGrid[y][x] = 0;
            }
          }
        }
      }
      
      sandGrid = nextGrid;
    }
    
    var _sandFPS = makeFPSGate(20);
    function sandSimulationLoop(now) {
      requestAnimationFrame(sandSimulationLoop);
      if (!isCanvasActive('sandCanvas')) return;
      if (!_sandFPS(now || 0)) return;
      updateSandPhysics();
      drawSandGrid();
    }
    
    // Ink injection click listener
    function injectElement(e) {
      var rect = sandCanvas.getBoundingClientRect();
      var W = sandCanvas.width, H = sandCanvas.height;
      var mouseX = (e.clientX - rect.left) * (sandW / rect.width);
      var mouseY = (e.clientY - rect.top) * (sandH / rect.height);
      
      var elVal = 2; // default sand
      if (activeElement === 'wall') elVal = 1;
      else if (activeElement === 'water') elVal = 3;
      else if (activeElement === 'gunpowder') elVal = 4;
      else if (activeElement === 'fire') elVal = 5;
      else if (activeElement === 'acid') elVal = 6;
      
      var bs = sandBrushSize;
      for (var dy = -bs; dy <= bs; dy++) {
        for (var dx = -bs; dx <= bs; dx++) {
          if (dx * dx + dy * dy <= bs * bs) {
            var ix = Math.floor(mouseX + dx);
            var iy = Math.floor(mouseY + dy);
            if (ix >= 0 && ix < sandW && iy >= 0 && iy < sandH) {
              if (activeElement === 'wall' || sandGrid[iy][ix] === 0) {
                sandGrid[iy][ix] = elVal;
              }
            }
          }
        }
      }
    }
    
    sandCanvas.addEventListener('mousedown', function(e) {
      sandIsDrawing = true;
      injectElement(e);
    });
    sandCanvas.addEventListener('mousemove', function(e) {
      if (sandIsDrawing) injectElement(e);
    });
    window.addEventListener('mouseup', function() {
      sandIsDrawing = false;
    });
    
    // Sliders & Material presets
    document.getElementById('sandBrushSize').addEventListener('input', function() {
      sandBrushSize = parseInt(this.value, 10);
      document.getElementById('sandBrushDisplay').textContent = sandBrushSize;
    });
    
    var elButtons = {
      'sand': 'sandElSand', 'water': 'sandElWater', 'gunpowder': 'sandElGunpowder',
      'fire': 'sandElFire', 'acid': 'sandElAcid', 'wall': 'sandElWall'
    };
    Object.keys(elButtons).forEach(function(el) {
      var btn = document.getElementById(elButtons[el]);
      if (btn) {
        btn.addEventListener('click', function() {
          Object.values(elButtons).forEach(function(id){ document.getElementById(id).classList.remove('active'); });
          this.classList.add('active'); activeElement = el;
        });
      }
    });
    
    document.getElementById('clearSand').addEventListener('click', function() {
      initSandGrid();
      toast('Kum havuzu temizlendi! 🧪', '#69f0ae');
    });
    
    // Preset: Place two gunpowder blocks and spray fire to auto-explode!
    document.getElementById('presetSand').addEventListener('click', function() {
      initSandGrid();
      // Draw static walls
      for (var x = 30; x < 120; x++) {
        sandGrid[80][x] = 1; // shelf
      }
      // Fill shelf with gunpowder
      for (var y = 70; y < 80; y++) {
        for (var x = 50; x < 100; x++) {
          sandGrid[y][x] = 4;
        }
      }
      // Drop water above it
      for (var y = 20; y < 35; y++) {
        for (var x = 40; x < 70; x++) {
          sandGrid[y][x] = 3;
        }
      }
      // Drop spark fire at bottom of gunpowder stack
      sandGrid[79][75] = 5;
      toast('💥 ZİNCİRLEME REAKSİYON BAŞLADI!', '#ff1744');
    });
    
    window.addEventListener('resize', resizeSand);
    resizeSand();
    initSandGrid();
    sandSimulationLoop();
  }
} catch(e) { console.error('FallingSand error', e); }

/* ══════════════════════════════════════════════════════════
   AAA 6: KOZMİK FLAPPY ARCADE
   ══════════════════════════════════════════════════════════ */
try {
  var flappyCanvas = document.getElementById('flappyCanvas');
  if (flappyCanvas) {
    var fctx = flappyCanvas.getContext('2d');
    flappyCanvas.width = 400;
    flappyCanvas.height = 300;
    var flGame = { running: false, score: 0, best: 0, gravity: 0.35, jump: -5.5, velocity: 0, ufoY: 120, pipes: [], stars: [] };
    
    function initFlappyGame() {
      flappyCanvas.width = 400;
      flappyCanvas.height = 300;
      flGame.score = 0; flGame.velocity = 0; flGame.ufoY = 120; flGame.pipes = [];
      document.getElementById('flappyScore').textContent = '0';
      
      // Init background stars
      flGame.stars = [];
      for (var i = 0; i < 40; i++) {
        flGame.stars.push({ x: Math.random() * flappyCanvas.width, y: Math.random() * flappyCanvas.height, speed: Math.random() * 0.8 + 0.2 });
      }
    }
    
    function spawnFlappyPipe() {
      var gap = 75;
      var minH = 30;
      var maxH = flappyCanvas.height - gap - minH;
      var topH = Math.random() * (maxH - minH) + minH;
      flGame.pipes.push({
        x: flappyCanvas.width,
        top: topH,
        bottom: flappyCanvas.height - topH - gap,
        passed: false
      });
    }
    
    function updateFlappy() {
      if (!flGame.running) return;
      
      var W = flappyCanvas.width, H = flappyCanvas.height;
      fctx.fillStyle = '#060814';
      fctx.fillRect(0, 0, W, H);
      
      // Update & Draw Parallax Stars
      fctx.fillStyle = 'rgba(255,255,255,0.3)';
      flGame.stars.forEach(function(st) {
        st.x -= st.speed;
        if (st.x < 0) st.x = W;
        fctx.fillRect(st.x, st.y, 1.5, 1.5);
      });
      
      // UFO Physics
      flGame.velocity += flGame.gravity;
      flGame.ufoY += flGame.velocity;
      
      // Draw flying UFO with a neon cyan trail
      var ufoX = 70;
      fctx.beginPath();
      var grad = fctx.createRadialGradient(ufoX, flGame.ufoY, 2, ufoX, flGame.ufoY, 15);
      grad.addColorStop(0, '#fff');
      grad.addColorStop(0.4, '#00e5ff');
      grad.addColorStop(1, 'rgba(0,229,255,0)');
      fctx.fillStyle = grad;
      fctx.arc(ufoX, flGame.ufoY, 15, 0, Math.PI * 2);
      fctx.fill();
      
      fctx.fillStyle = '#00e5ff';
      fctx.fillRect(ufoX - 10, flGame.ufoY - 3, 20, 6); // Dome saucer base
      fctx.beginPath();
      fctx.fillStyle = '#fff';
      fctx.arc(ufoX, flGame.ufoY - 3, 4, 0, Math.PI * 2); // Cockpit
      fctx.fill();
      
      // Bounding check for walls
      if (flGame.ufoY - 12 < 0 || flGame.ufoY + 12 > H) {
        endFlappyGame();
      }
      
      // Pipe generation timer
      if (flGame.pipes.length === 0 || flGame.pipes[flGame.pipes.length - 1].x < W - 140) {
        spawnFlappyPipe();
      }
      
      // Render Obstacle Pipes
      flGame.pipes.forEach(function(p, idx) {
        p.x -= 2; // move left
        
        // Render glowing obstacle towers
        fctx.fillStyle = 'rgba(124, 77, 255, 0.2)';
        fctx.strokeStyle = '#7c4dff';
        fctx.lineWidth = 2;
        
        // Top pipe
        fctx.fillRect(p.x, 0, 40, p.top);
        fctx.strokeRect(p.x, 0, 40, p.top);
        
        // Bottom pipe
        fctx.fillRect(p.x, H - p.bottom, 40, p.bottom);
        fctx.strokeRect(p.x, H - p.bottom, 40, p.bottom);
        
        // Collision checker
        if (ufoX + 10 > p.x && ufoX - 10 < p.x + 40) {
          if (flGame.ufoY - 8 < p.top || flGame.ufoY + 8 > H - p.bottom) {
            endFlappyGame();
          }
        }
        
        // Score point pass
        if (!p.passed && p.x + 20 < ufoX) {
          p.passed = true;
          flGame.score++;
          document.getElementById('flappyScore').textContent = flGame.score;
          toast('⚡ +1 Puan!', '#69f0ae');
        }
      });
      
      // Remove offscreen pipes
      flGame.pipes = flGame.pipes.filter(function(p) { return p.x > -50; });
      
      if (flGame.running) requestAnimationFrame(updateFlappy);
    }
    
    function endFlappyGame() {
      flGame.running = false;
      document.getElementById('flappyOverlay').classList.remove('hidden');
      if (flGame.score > flGame.best) {
        flGame.best = flGame.score;
        document.getElementById('flappyBest').textContent = flGame.best;
        toast('🏆 YENİ EN İYİ SKOR: ' + flGame.best, '#ffea00');
      } else {
        toast('😢 Oyun Bitti!', '#ff6b9d');
      }
    }
    
    // Jump listeners
    function triggerJump() {
      if (flGame.running) {
        flGame.velocity = flGame.jump;
      }
    }
    window.addEventListener('keydown', function(e) {
      if (e.key === ' ' || e.key === 'ArrowUp') {
        if (document.getElementById('flappy-sec').classList.contains('ds-active')) {
          e.preventDefault(); triggerJump();
        }
      }
    });
    flappyCanvas.addEventListener('mousedown', function(e) {
      e.preventDefault(); triggerJump();
    });
    
    document.getElementById('flappyStartBtn').addEventListener('click', function() {
      document.getElementById('flappyOverlay').classList.add('hidden');
      flGame.running = true;
      initFlappyGame();
      updateFlappy();
    });
    
    // Default initial frame rendering
    initFlappyGame();
    fctx.fillStyle = '#060814'; fctx.fillRect(0,0,flappyCanvas.width,flappyCanvas.height);
  }
} catch(e) { console.error('Flappy error', e); }

/* ══════════════════════════════════════════════════════════
   AAA 7: GALAXY SHOOTER (KOZMİK SAVUNUCU)
   ══════════════════════════════════════════════════════════ */
try {
  var shooterCanvas = document.getElementById('shooterCanvas');
  if (shooterCanvas) {
    var shctx = shooterCanvas.getContext('2d');
    shooterCanvas.width = 400;
    shooterCanvas.height = 300;
    var shGame = { running: false, score: 0, best: 0, px: 200, py: 260, bullets: [], meteors: [], stars: [], sparks: [] };
    var shKey = { left: false, right: false, fire: false };
    
    function initShooterGame() {
      shooterCanvas.width = 400;
      shooterCanvas.height = 300;
      shGame.score = 0; shGame.px = 200; shGame.bullets = []; shGame.meteors = []; shGame.sparks = [];
      document.getElementById('shooterScore').textContent = '0';
      
      shGame.stars = [];
      for (var i = 0; i < 30; i++) {
        shGame.stars.push({ x: Math.random() * shooterCanvas.width, y: Math.random() * shooterCanvas.height, speed: Math.random() * 2 + 1 });
      }
    }
    
    function triggerSpark(x, y, color) {
      for (var i = 0; i < 15; i++) {
        var angle = Math.random() * Math.PI * 2;
        var sp = Math.random() * 3 + 1;
        shGame.sparks.push({
          x: x, y: y,
          vx: Math.cos(angle) * sp,
          vy: Math.sin(angle) * sp,
          color: color || '#ffea00',
          age: 0,
          maxAge: Math.random() * 20 + 10
        });
      }
    }
    
    function updateShooter() {
      if (!shGame.running) return;
      var W = shooterCanvas.width, H = shooterCanvas.height;
      
      shctx.fillStyle = '#04040a';
      shctx.fillRect(0, 0, W, H);
      
      // Starfield space scroll
      shctx.fillStyle = 'rgba(255,255,255,0.4)';
      shGame.stars.forEach(function(st) {
        st.y += st.speed;
        if (st.y > H) st.y = 0;
        shctx.fillRect(st.x, st.y, 1.5, 1.5);
      });
      
      // Spaceship controller
      if (shKey.left && shGame.px > 20) shGame.px -= 4;
      if (shKey.right && shGame.px < W - 20) shGame.px += 4;
      
      // Draw sleek neon spaceship
      shctx.beginPath();
      shctx.moveTo(shGame.px, shGame.py);
      shctx.lineTo(shGame.px - 14, shGame.py + 18);
      shctx.lineTo(shGame.px + 14, shGame.py + 18);
      shctx.closePath();
      shctx.fillStyle = '#ff6b9d';
      shctx.strokeStyle = '#fff';
      shctx.lineWidth = 1.5;
      shctx.fill();
      shctx.stroke();
      
      // Draw glowing jet flame thruster
      shctx.beginPath();
      shctx.fillStyle = 'hsl(' + (Math.random() * 40 + 10) + ', 100%, 60%)';
      shctx.arc(shGame.px, shGame.py + 21, Math.random() * 6 + 2, 0, Math.PI * 2);
      shctx.fill();
      
      // Bullet manager
      if (shKey.fire && (shGame.bullets.length === 0 || shGame.bullets[shGame.bullets.length - 1].y < H - 55)) {
        shGame.bullets.push({ x: shGame.px, y: shGame.py - 5 });
      }
      
      // Draw glowing lasers
      shGame.bullets.forEach(function(b, idx) {
        b.y -= 7; // speed
        shctx.beginPath();
        shctx.strokeStyle = '#00e5ff';
        shctx.lineWidth = 3;
        shctx.moveTo(b.x, b.y);
        shctx.lineTo(b.x, b.y - 10);
        shctx.stroke();
      });
      shGame.bullets = shGame.bullets.filter(function(b) { return b.y > 0; });
      
      // Meteor spawner
      if (Math.random() < 0.035 && shGame.meteors.length < 8) {
        shGame.meteors.push({
          x: Math.random() * (W - 30) + 15,
          y: -20,
          speed: Math.random() * 1.5 + 0.8,
          size: Math.random() * 12 + 8
        });
      }
      
      // Update Meteors
      shGame.meteors.forEach(function(m, mIdx) {
        m.y += m.speed;
        
        // Draw asteroid core
        shctx.beginPath();
        shctx.fillStyle = '#1e1f29';
        shctx.strokeStyle = '#ffea00';
        shctx.lineWidth = 2;
        shctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
        shctx.fill();
        shctx.stroke();
        
        // Player Collision check
        var dx = m.x - shGame.px;
        var dy = m.y - shGame.py - 10;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < m.size + 10) {
          triggerSpark(shGame.px, shGame.py, '#ff1744');
          endShooterGame();
        }
        
        // Bullet collision check
        shGame.bullets.forEach(function(b, bIdx) {
          var bdx = m.x - b.x;
          var bdy = m.y - b.y;
          var bDist = Math.sqrt(bdx * bdx + bdy * bdy);
          if (bDist < m.size + 4) {
            triggerSpark(m.x, m.y, '#ffea00');
            shGame.meteors.splice(mIdx, 1);
            shGame.bullets.splice(bIdx, 1);
            shGame.score += 10;
            document.getElementById('shooterScore').textContent = shGame.score;
            toast('💥 Göktaşı Patlatıldı!', '#69f0ae');
          }
        });
      });
      // Remove offscreen meteors
      shGame.meteors = shGame.meteors.filter(function(m) {
        if (m.y > H + 20) {
          endShooterGame(); // Planet reached!
          return false;
        }
        return true;
      });
      
      // Update Detonation Sparks
      shGame.sparks.forEach(function(sp, idx) {
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.age++;
        
        shctx.beginPath();
        shctx.fillStyle = sp.color;
        shctx.arc(sp.x, sp.y, 2 * (1 - sp.age / sp.maxAge), 0, Math.PI * 2);
        shctx.fill();
      });
      shGame.sparks = shGame.sparks.filter(function(sp){ return sp.age < sp.maxAge; });
      
      if (shGame.running) requestAnimationFrame(updateShooter);
    }
    
    function endShooterGame() {
      shGame.running = false;
      document.getElementById('shooterOverlay').classList.remove('hidden');
      if (shGame.score > shGame.best) {
        shGame.best = shGame.score;
        document.getElementById('shooterBest').textContent = shGame.best;
        toast('🏆 SAVUNMA REKORU: ' + shGame.best, '#ffea00');
      } else {
        toast('😢 Gezegen Düştü!', '#ff6b9d');
      }
    }
    
    // Listeners
    window.addEventListener('keydown', function(e) {
      if (!document.getElementById('shooter-sec').classList.contains('ds-active')) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); shKey.left = true; }
      else if (e.key === 'ArrowRight') { e.preventDefault(); shKey.right = true; }
      else if (e.key === ' ') { e.preventDefault(); shKey.fire = true; }
    });
    window.addEventListener('keyup', function(e) {
      if (e.key === 'ArrowLeft') shKey.left = false;
      else if (e.key === 'ArrowRight') shKey.right = false;
      else if (e.key === ' ') shKey.fire = false;
    });
    
    // Mouse tracking fallback
    shooterCanvas.addEventListener('mousemove', function(e) {
      if (!shGame.running) return;
      var rect = shooterCanvas.getBoundingClientRect();
      shGame.px = (e.clientX - rect.left) * (shooterCanvas.width / rect.width);
    });
    shooterCanvas.addEventListener('mousedown', function(e) {
      if (shGame.running) { e.preventDefault(); shKey.fire = true; }
    });
    shooterCanvas.addEventListener('mouseup', function() {
      shKey.fire = false;
    });
    
    document.getElementById('shooterStartBtn').addEventListener('click', function() {
      document.getElementById('shooterOverlay').classList.add('hidden');
      shGame.running = true;
      initShooterGame();
      updateShooter();
    });
    
    initShooterGame();
    shctx.fillStyle = '#04040a'; shctx.fillRect(0,0,shooterCanvas.width,shooterCanvas.height);
  }
} catch(e) { console.error('Shooter error', e); }

/* ══════════════════════════════════════════════════════════
   AAA 8: NEON 2048 (CALMING SLIDING 2048 PUZZLE)
   ══════════════════════════════════════════════════════════ */
try {
  var m2048Grid = document.getElementById('m2048GridContainer');
  if (m2048Grid) {
    var m2048Board = [
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0]
    ];
    var m2048Score = 0, m2048Best = 0;
    
    function resetM2048Game() {
      m2048Board = [
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0]
      ];
      m2048Score = 0;
      document.getElementById('m2048Score').textContent = '0';
      spawnM2048Tile();
      spawnM2048Tile();
      renderM2048Board();
    }
    
    function spawnM2048Tile() {
      var empties = [];
      for (var r = 0; r < 4; r++) {
        for (var c = 0; c < 4; c++) {
          if (m2048Board[r][c] === 0) empties.push({ r: r, c: c });
        }
      }
      if (empties.length > 0) {
        var pick = empties[Math.floor(Math.random() * empties.length)];
        m2048Board[pick.r][pick.c] = Math.random() < 0.9 ? 2 : 4;
      }
    }
    
    function renderM2048Board() {
      m2048Grid.innerHTML = '';
      for (var r = 0; r < 4; r++) {
        for (var c = 0; c < 4; c++) {
          var val = m2048Board[r][c];
          var cell = document.createElement('div');
          if (val === 0) {
            cell.className = 'm2048-tile-empty';
          } else {
            cell.className = 'm2048-tile';
            cell.textContent = val;
            // Shifting neon color based on numerical size
            var hue = (Math.log2(val) * 28 + 160) % 360;
            cell.style.background = 'linear-gradient(135deg, hsl('+hue+', 90%, 55%), hsl('+(hue+35)%360+', 85%, 45%))';
            cell.style.boxShadow = '0 0 15px rgba(255,255,255,0.05), 0 0 12px hsl('+hue+', 90%, 50%)';
          }
          m2048Grid.appendChild(cell);
        }
      }
    }
    
    function slideRowLeft(row) {
      // 1. Remove zeroes
      var arr = row.filter(function(v){ return v !== 0; });
      // 2. Merge neighbours
      for (var i = 0; i < arr.length - 1; i++) {
        if (arr[i] === arr[i+1]) {
          arr[i] *= 2;
          m2048Score += arr[i];
          arr.splice(i+1, 1);
          // High Score pop!
          document.getElementById('m2048Score').textContent = m2048Score;
          if (m2048Score > m2048Best) {
            m2048Best = m2048Score;
            document.getElementById('m2048Best').textContent = m2048Best;
          }
        }
      }
      // 3. Pad back with zeroes
      while (arr.length < 4) {
        arr.push(0);
      }
      return arr;
    }
    
    function rotateBoardRight() {
      var next = [
        [0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]
      ];
      for (var r = 0; r < 4; r++) {
        for (var c = 0; c < 4; c++) {
          next[c][3 - r] = m2048Board[r][c];
        }
      }
      m2048Board = next;
    }
    
    function slideM2048(dir) {
      // Rotate grid to represent LEFT slide physically, slide it, then rotate back
      var prevStr = JSON.stringify(m2048Board);
      
      var rotations = 0;
      if (dir === 'up') rotations = 3;
      else if (dir === 'right') rotations = 2;
      else if (dir === 'down') rotations = 1;
      
      for (var i = 0; i < rotations; i++) rotateBoardRight();
      
      for (var r = 0; r < 4; r++) {
        m2048Board[r] = slideRowLeft(m2048Board[r]);
      }
      
      var unRotations = (4 - rotations) % 4;
      for (var i = 0; i < unRotations; i++) rotateBoardRight();
      
      if (JSON.stringify(m2048Board) !== prevStr) {
        spawnM2048Tile();
        renderM2048Board();
        toast('Karolar kaydırıldı!', '#7c4dff');
      } else {
        // Check if game over (no matching tiles and grid is full)
        var empties = 0;
        for (var r = 0; r < 4; r++) {
          for (var c = 0; c < 4; c++) {
            if (m2048Board[r][c] === 0) empties++;
          }
        }
        if (empties === 0) {
          toast('Oyun bitti, hamle kalmadı!', '#ff6b9d');
        }
      }
    }
    
    // Keyboard key listeners
    window.addEventListener('keydown', function(e) {
      if (!document.getElementById('m2048-sec').classList.contains('ds-active')) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); slideM2048('left'); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); slideM2048('up'); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); slideM2048('right'); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); slideM2048('down'); }
    });

    // Mouse and touch swipe gesture listeners for 2048
    var m2048StartX = 0, m2048StartY = 0;
    m2048Grid.addEventListener('mousedown', function(e) {
      m2048StartX = e.clientX;
      m2048StartY = e.clientY;
    });
    m2048Grid.addEventListener('mouseup', function(e) {
      var dx = e.clientX - m2048StartX;
      var dy = e.clientY - m2048StartY;
      var absX = Math.abs(dx), absY = Math.abs(dy);
      if (Math.max(absX, absY) > 30) { // minimum threshold of 30px
        if (absX > absY) {
          slideM2048(dx > 0 ? 'right' : 'left');
        } else {
          slideM2048(dy > 0 ? 'down' : 'up');
        }
      }
    });
    m2048Grid.addEventListener('touchstart', function(e) {
      if (e.touches.length > 0) {
        m2048StartX = e.touches[0].clientX;
        m2048StartY = e.touches[0].clientY;
      }
    }, {passive: true});
    m2048Grid.addEventListener('touchend', function(e) {
      if (e.changedTouches.length > 0) {
        var dx = e.changedTouches[0].clientX - m2048StartX;
        var dy = e.changedTouches[0].clientY - m2048StartY;
        var absX = Math.abs(dx), absY = Math.abs(dy);
        if (Math.max(absX, absY) > 30) {
          e.preventDefault();
          if (absX > absY) {
            slideM2048(dx > 0 ? 'right' : 'left');
          } else {
            slideM2048(dy > 0 ? 'down' : 'up');
          }
        }
      }
    }, {passive: false});
    
    document.getElementById('resetM2048').addEventListener('click', resetM2048Game);
    resetM2048Game();
  }
} catch(e) { console.error('2048 error', e); }

/* ══════════════════════════════════════════════════════════
   AAA 9: KOZMİK LABİRENT (ENDLESS NEON MAZE GENERATOR)
   ══════════════════════════════════════════════════════════ */
try {
  var mazeCanvas = document.getElementById('mazeCanvas');
  if (mazeCanvas) {
    var mzctx = mazeCanvas.getContext('2d');
    var mazeGrid = [];
    var mazeSize = 15; // easily scalable
    var mazeW = 15, mazeH = 15;
    var playerPos = { x: 0, y: 0 };
    var exitPos = { x: 14, y: 14 };
    var mazeTrails = [];
    var mazeIsRunning = false;
    
    // Generation loop DFS recursive backtracking
    function generateProceduralMaze(w, h) {
      mazeW = w; mazeH = h;
      mazeGrid = [];
      for (var y = 0; y < h; y++) {
        var row = [];
        for (var x = 0; x < w; x++) {
          row.push({ x: x, y: y, visited: false, walls: [true, true, true, true] }); // top, right, bottom, left
        }
        mazeGrid.push(row);
      }
      
      var stack = [];
      var current = mazeGrid[0][0];
      current.visited = true;
      
      while (true) {
        var neighbors = [];
        var x = current.x, y = current.y;
        
        // Check top
        if (y - 1 >= 0 && !mazeGrid[y-1][x].visited) neighbors.push(mazeGrid[y-1][x]);
        // Check right
        if (x + 1 < w && !mazeGrid[y][x+1].visited) neighbors.push(mazeGrid[y][x+1]);
        // Check bottom
        if (y + 1 < h && !mazeGrid[y+1][x].visited) neighbors.push(mazeGrid[y+1][x]);
        // Check left
        if (x - 1 >= 0 && !mazeGrid[y][x-1].visited) neighbors.push(mazeGrid[y][x-1]);
        
        if (neighbors.length > 0) {
          var nextCell = neighbors[Math.floor(Math.random() * neighbors.length)];
          nextCell.visited = true;
          stack.push(current);
          
          // Remove walls between current & nextCell
          var dx = nextCell.x - current.x;
          var dy = nextCell.y - current.y;
          
          if (dx === 1) { current.walls[1] = false; nextCell.walls[3] = false; }
          else if (dx === -1) { current.walls[3] = false; nextCell.walls[1] = false; }
          else if (dy === 1) { current.walls[2] = false; nextCell.walls[0] = false; }
          else if (dy === -1) { current.walls[0] = false; nextCell.walls[2] = false; }
          
          current = nextCell;
        } else if (stack.length > 0) {
          current = stack.pop();
        } else {
          break; // Done building maze!
        }
      }
      
      playerPos = { x: 0, y: 0 };
      exitPos = { x: w - 1, y: h - 1 };
      mazeTrails = [{ x: 0, y: 0 }];
    }
    
    function drawMaze() {
      var W = mazeCanvas.width, H = mazeCanvas.height;
      mzctx.fillStyle = '#07080f';
      mzctx.fillRect(0, 0, W, H);
      
      var cellW = W / mazeW;
      var cellH = H / mazeH;
      
      // Draw trails
      mzctx.lineWidth = cellW * 0.35;
      mzctx.lineCap = 'round';
      mzctx.lineJoin = 'round';
      mzctx.beginPath();
      mzctx.strokeStyle = 'rgba(0, 229, 255, 0.25)';
      mazeTrails.forEach(function(pt, idx) {
        var tx = pt.x * cellW + cellW/2;
        var ty = pt.y * cellH + cellH/2;
        if (idx === 0) mzctx.moveTo(tx, ty);
        else mzctx.lineTo(tx, ty);
      });
      mzctx.stroke();
      
      // Draw grid walls
      mzctx.lineWidth = 3;
      mzctx.strokeStyle = 'rgba(124, 77, 255, 0.45)'; // Neon purple
      for (var y = 0; y < mazeH; y++) {
        for (var x = 0; x < mazeW; x++) {
          var cell = mazeGrid[y][x];
          var cx = x * cellW;
          var cy = y * cellH;
          
          if (cell.walls[0]) { mzctx.beginPath(); mzctx.moveTo(cx, cy); mzctx.lineTo(cx + cellW, cy); mzctx.stroke(); }
          if (cell.walls[1]) { mzctx.beginPath(); mzctx.moveTo(cx + cellW, cy); mzctx.lineTo(cx + cellW, cy + cellH); mzctx.stroke(); }
          if (cell.walls[2]) { mzctx.beginPath(); mzctx.moveTo(cx, cy + cellH); mzctx.lineTo(cx + cellW, cy + cellH); mzctx.stroke(); }
          if (cell.walls[3]) { mzctx.beginPath(); mzctx.moveTo(cx, cy); mzctx.lineTo(cx, cy + cellH); mzctx.stroke(); }
        }
      }
      
      // Draw Exit glowing checkpoint
      mzctx.beginPath();
      var ex = exitPos.x * cellW + cellW/2;
      var ey = exitPos.y * cellH + cellH/2;
      var rad = cellW * 0.3;
      var glow = mzctx.createRadialGradient(ex, ey, 2, ex, ey, rad * 1.5);
      glow.addColorStop(0, '#fff');
      glow.addColorStop(0.3, '#ffea00');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      mzctx.fillStyle = glow;
      mzctx.arc(ex, ey, rad * 1.5, 0, Math.PI * 2);
      mzctx.fill();
      
      // Draw Player glowing sphere
      mzctx.beginPath();
      var px = playerPos.x * cellW + cellW/2;
      var py = playerPos.y * cellH + cellH/2;
      var pGlow = mzctx.createRadialGradient(px, py, 2, px, py, rad);
      pGlow.addColorStop(0, '#fff');
      pGlow.addColorStop(0.4, '#00e5ff');
      pGlow.addColorStop(1, 'rgba(0,0,0,0)');
      mzctx.fillStyle = pGlow;
      mzctx.arc(px, py, rad, 0, Math.PI * 2);
      mzctx.fill();
    }
    
    function slidePlayer(dx, dy) {
      if (!mazeIsRunning) return;
      var cx = playerPos.x, cy = playerPos.y;
      
      // Wall boundary collision checks
      if (dx === 1 && mazeGrid[cy][cx].walls[1]) return;
      if (dx === -1 && mazeGrid[cy][cx].walls[3]) return;
      if (dy === 1 && mazeGrid[cy][cx].walls[2]) return;
      if (dy === -1 && mazeGrid[cy][cx].walls[0]) return;
      
      playerPos.x += dx;
      playerPos.y += dy;
      mazeTrails.push({ x: playerPos.x, y: playerPos.y });
      drawMaze();
      
      // Goal check!
      if (playerPos.x === exitPos.x && playerPos.y === exitPos.y) {
        mazeIsRunning = false;
        document.getElementById('mazeOverlay').classList.remove('hidden');
        toast('🏆 LABİRENT ÇÖZÜLDÜ! ENERJİ SERBEST BIRAKILDI!', '#69f0ae');
      }
    }
    
    window.addEventListener('keydown', function(e) {
      if (!document.getElementById('maze-sec').classList.contains('ds-active')) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); slidePlayer(-1, 0); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); slidePlayer(0, -1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); slidePlayer(1, 0); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); slidePlayer(0, 1); }
    });
    
    function startMazeGame(size) {
      generateProceduralMaze(size, size);
      drawMaze();
      mazeIsRunning = true;
    }
    
    // Difficulty selectors
    document.getElementById('mazeDiffEasy').addEventListener('click', function() {
      document.querySelectorAll('#mazeDiffEasy,#mazeDiffMedium,#mazeDiffHard').forEach(function(b){b.classList.remove('active');});
      this.classList.add('active'); mazeSize = 10;
      startMazeGame(mazeSize);
    });
    document.getElementById('mazeDiffMedium').addEventListener('click', function() {
      document.querySelectorAll('#mazeDiffEasy,#mazeDiffMedium,#mazeDiffHard').forEach(function(b){b.classList.remove('active');});
      this.classList.add('active'); mazeSize = 15;
      startMazeGame(mazeSize);
    });
    document.getElementById('mazeDiffHard').addEventListener('click', function() {
      document.querySelectorAll('#mazeDiffEasy,#mazeDiffMedium,#mazeDiffHard').forEach(function(b){b.classList.remove('active');});
      this.classList.add('active'); mazeSize = 22;
      startMazeGame(mazeSize);
    });
    
    document.getElementById('resetMazeBtn').addEventListener('click', function() {
      startMazeGame(mazeSize);
      toast('Labirent yeniden oluşturuldu!', '#00e5ff');
    });
    document.getElementById('mazeStartBtn').addEventListener('click', function() {
      document.getElementById('mazeOverlay').classList.add('hidden');
      startMazeGame(mazeSize);
    });
    
    // Initial scaling grid render
    function resizeMaze() {
      var rect = mazeCanvas.parentElement.getBoundingClientRect();
      mazeCanvas.width = rect.width || 400;
      mazeCanvas.height = rect.width || 400;
      if (mazeIsRunning) {
        drawMaze();
      }
    }
    window.addEventListener('resize', resizeMaze);
    resizeMaze();
    startMazeGame(mazeSize);
  }
} catch(e) { console.error('Maze error', e); }

/* ══════════════════════════════════════════════════════════
   AAA 10: KOZMİK TELESKOP (DEEP-SPACE VIEWVIEWER)
   ══════════════════════════════════════════════════════════ */
try {
  var telescopeCanvas = document.getElementById('telescopeCanvas');
  if (telescopeCanvas) {
    var telCtx = telescopeCanvas.getContext('2d');
    var telZoom = 1.0;
    var telPanX = 0, telPanY = 0;
    var telTarX = 0, telTarY = 0;
    var telIsPanning = false;
    
    var telObjects = [
      {
        id: 'telPreset1', x: 80, y: 120, icon: '🌌', title: 'Orion Nebulası',
        desc: 'Avcı kuşağının hemen güneyinde yer alan devasa bir yıldız oluşum bölgesidir. Dünyaya yaklaşık 1344 ışık yılı uzaklıktadır ve çıplak gözle dahi hafif bir pus şeklinde görülebilir.',
        coords: 'RA: 05h 35m / DEC: -05° 23\'', cat: 'Yıldız Oluşum Bulutsusu', size: '24 Işık Yılı', rate: '100% Kararlı'
      },
      {
        id: 'telPreset2', x: 280, y: 80, icon: '🌀', title: 'Andromeda Galaksisi',
        desc: 'Bize en yakın sarmal galaksidir. Yaklaşık 2.5 milyon ışık yılı uzaklıkta olup, trilyonlarca yıldıza ev sahipliği yapmaktadır ve milyarlarca yıl sonra Samanyolu ile birleşeceği öngörülmektedir.',
        coords: 'RA: 00h 42m / DEC: +41° 16\'', cat: 'Sarmal Gökada (M31)', size: '220,000 Işık Yılı', rate: '98% Kararlı'
      },
      {
        id: 'telPreset3', x: 140, y: 220, icon: '🪐', title: 'Satürn Halkaları',
        desc: 'Buz, kaya ve toz parçacıklarından oluşan Satürn\'ün görkemli halka sistemi, teleskopla gözlemlenebilen en etkileyici güneş sistemi harikasıdır. Halkaların kalınlığı sadece birkaç on metredir.',
        coords: 'RA: 18h 22m / DEC: -22° 46\'', cat: 'Gezegen Halkaları', size: '282,000 Kilometre', rate: '100% Kararlı'
      },
      {
        id: 'telPreset4', x: 220, y: 160, icon: '🕳️', title: 'Sagittarius A*',
        desc: 'Samanyolu Galaksisi\'nin tam merkezinde yer alan süper kütleli bir kara deliktir. Güneşimizden yaklaşık 4.3 milyon kat daha ağırdır ve etrafındaki her şeyi yutacak kadar güçlü kütleçekimi vardır.',
        coords: 'RA: 17h 45m / DEC: -29° 00\'', cat: 'Süper Kütleli Kara Delik', size: '44 Milyon Kilometre', rate: '95% Kararlı'
      }
    ];
    
    var telActiveObj = telObjects[0];
    
    var _telFPS = makeFPSGate(24);
    function drawTelescope(now) {
      requestAnimationFrame(drawTelescope);
      if (!isCanvasActive('telescopeCanvas')) return;
      if (!_telFPS(now || 0)) return;
      
      var W = telescopeCanvas.width;
      var H = telescopeCanvas.height;
      telCtx.fillStyle = '#020207';
      telCtx.fillRect(0, 0, W, H);
      
      // Interpolate panning positions smoothly
      if (Math.hypot(telTarX - telPanX, telTarY - telPanY) > 0.5) {
        telPanX += (telTarX - telPanX) * 0.1;
        telPanY += (telTarY - telPanY) * 0.1;
      }
      
      telCtx.save();
      // Draw grid lines
      telCtx.strokeStyle = 'rgba(0, 229, 255, 0.05)';
      telCtx.lineWidth = 1;
      var step = 40 * telZoom;
      var offsetX = (telPanX * telZoom) % step;
      var offsetY = (telPanY * telZoom) % step;
      
      for (var x = offsetX; x < W; x += step) {
        telCtx.beginPath(); telCtx.moveTo(x, 0); telCtx.lineTo(x, H); telCtx.stroke();
      }
      for (var y = offsetY; y < H; y += step) {
        telCtx.beginPath(); telCtx.moveTo(0, y); telCtx.lineTo(W, y); telCtx.stroke();
      }
      
      // Draw glowing background dust
      telCtx.fillStyle = 'rgba(124, 77, 255, 0.03)';
      telCtx.beginPath();
      telCtx.arc(W/2 + telPanX, H/2 + telPanY, 120 * telZoom, 0, Math.PI*2);
      telCtx.fill();
      
      // Draw stars and targets
      telObjects.forEach(function(obj) {
        var screenX = W/2 + (obj.x - W/2 + telPanX) * telZoom;
        var screenY = H/2 + (obj.y - H/2 + telPanY) * telZoom;
        
        // Draw orbital target coordinates circles
        telCtx.beginPath();
        telCtx.strokeStyle = obj.id === telActiveObj.id ? 'rgba(0, 229, 255, 0.5)' : 'rgba(255, 255, 255, 0.1)';
        telCtx.lineWidth = obj.id === telActiveObj.id ? 2 : 1;
        telCtx.arc(screenX, screenY, 20 * telZoom, 0, Math.PI * 2);
        telCtx.stroke();
        
        // Draw crosshairs
        telCtx.beginPath();
        telCtx.strokeStyle = 'rgba(0, 229, 255, 0.2)';
        telCtx.moveTo(screenX - 25, screenY); telCtx.lineTo(screenX + 25, screenY);
        telCtx.moveTo(screenX, screenY - 25); telCtx.lineTo(screenX, screenY + 25);
        telCtx.stroke();
        
        // Icon
        telCtx.font = Math.round(18 * telZoom) + 'px Outfit';
        telCtx.textAlign = 'center';
        telCtx.textBaseline = 'middle';
        telCtx.fillText(obj.icon, screenX, screenY);
      });
      
      // Viewfinder Overlay Circle
      telCtx.restore();
      telCtx.strokeStyle = 'rgba(0, 229, 255, 0.25)';
      telCtx.lineWidth = 4;
      telCtx.beginPath();
      telCtx.arc(W/2, H/2, H/2 - 10, 0, Math.PI*2);
      telCtx.stroke();
      
      // Center indicator crosshair
      telCtx.strokeStyle = '#00e5ff';
      telCtx.lineWidth = 1;
      telCtx.beginPath();
      telCtx.moveTo(W/2 - 15, H/2); telCtx.lineTo(W/2 + 15, H/2);
      telCtx.moveTo(W/2, H/2 - 15); telCtx.lineTo(W/2, H/2 + 15);
      telCtx.stroke();
    }
    
    function focusOnObject(obj) {
      telActiveObj = obj;
      telTarX = W_half() - obj.x;
      telTarY = H_half() - obj.y;
      
      // Update UI panels
      document.getElementById('telInfoIcon').textContent = obj.icon;
      document.getElementById('telInfoTitle').textContent = obj.title;
      document.getElementById('telInfoDesc').textContent = obj.desc;
      document.getElementById('telescopeCoords').textContent = obj.coords;
      
      // Set active preset button
      document.querySelectorAll('#telPreset1,#telPreset2,#telPreset3,#telPreset4').forEach(function(btn) {
        btn.classList.remove('active');
      });
      document.getElementById(obj.id).classList.add('active');
      
      toast('🛰️ Teleskop Kilitlendi: ' + obj.title, '#00e5ff');
    }
    
    function W_half() { return telescopeCanvas.width / 2; }
    function H_half() { return telescopeCanvas.height / 2; }
    
    // Zoom control
    document.getElementById('telZoomSlider').addEventListener('input', function() {
      telZoom = parseFloat(this.value);
      document.getElementById('telZoomDisplay').textContent = telZoom.toFixed(1);
    });
    
    // Preset buttons
    telObjects.forEach(function(obj) {
      document.getElementById(obj.id).addEventListener('click', function() {
        focusOnObject(obj);
      });
    });
    
    // Canvas drag/pan listener
    var dragStartX = 0, dragStartY = 0;
    telescopeCanvas.addEventListener('mousedown', function(e) {
      telIsPanning = true;
      dragStartX = e.clientX - telTarX;
      dragStartY = e.clientY - telTarY;
    });
    window.addEventListener('mousemove', function(e) {
      if (telIsPanning) {
        telTarX = e.clientX - dragStartX;
        telTarY = e.clientY - dragStartY;
      }
    });
    window.addEventListener('mouseup', function() {
      if (telIsPanning) {
        telIsPanning = false;
        // Snap to nearest coordinate hotspot
        var W = telescopeCanvas.width, H = telescopeCanvas.height;
        var centerX = W/2 - telTarX;
        var centerY = H/2 - telTarY;
        
        var nearest = null, minDist = 120;
        telObjects.forEach(function(obj) {
          var dist = Math.hypot(obj.x - centerX, obj.y - centerY);
          if (dist < minDist) {
            minDist = dist; nearest = obj;
          }
        });
        if (nearest) {
          focusOnObject(nearest);
        }
      }
    });
    
    function resizeTelescope() {
      var rect = telescopeCanvas.parentElement.getBoundingClientRect();
      telescopeCanvas.width = rect.width || 600;
      telescopeCanvas.height = 420;
    }
    
    window.addEventListener('resize', resizeTelescope);
    resizeTelescope();
    focusOnObject(telObjects[0]);
    drawTelescope();
  }
} catch(e) { console.error('Telescope error', e); }

/* ══════════════════════════════════════════════════════════
   AAA 11: RUH HALİ ÇEMBERİ (MOOD MANDALA AURA VISUALIZER)
   ══════════════════════════════════════════════════════════ */
try {
  var auraCanvas = document.getElementById('auraCanvas');
  if (auraCanvas) {
    var auCtx = auraCanvas.getContext('2d');
    var currentMood = 'calm'; // calm, focus, creative, energetic, tired
    var auraAngle = 0;
    var auraPulse = 0;
    
    var moodData = {
      calm: {
        badge: 'Aura Durumu: Sakin & Huzurlu',
        title: 'Zihniniz Bir Liman',
        desc: 'Harika bir dengedesiniz. Bu anı taçlandırmak için burnunuzdan 4 saniye nefes alın, 4 saniye tutun ve 4 saniyede yavaşça verin. Doğanın yeşil frekansları auranızı korumaya devam ediyor.',
        freq: '528 Hz', chakra: 'Kalp (Anahata)',
        k: 5, speed: 0.015, color1: '#00c853', color2: '#00b894'
      },
      focus: {
        badge: 'Aura Durumu: Zihinsel Odaklanma',
        title: 'Dikkatin Gücü',
        desc: 'Şu an konsantrasyon seviyeniz en üst düzeyde. Gürültülü ortamlardan uzaklaşın, auranızın yaydığı keskin mavi frekanslar sayesinde tüm dikkatinizi işinize yönlendirebilirsiniz.',
        freq: '741 Hz', chakra: 'Alın / Üçüncü Göz (Ajna)',
        k: 7, speed: 0.02, color1: '#00e5ff', color2: '#2979ff'
      },
      creative: {
        badge: 'Aura Durumu: Sanatsal / Yaratıcı Akış',
        title: 'Hayal Gücü Köprüsü',
        desc: 'İçinizden gelen yaratıcı dürtüleri serbest bırakın! Mor renkli taç çakranız harika sinyaller üretiyor. Aklınıza gelen ani fikirleri hemen bir kâğıda veya çizim tuvaline not edin.',
        freq: '852 Hz', chakra: 'Taç (Sahasrara)',
        k: 9, speed: 0.022, color1: '#7c4dff', color2: '#e040fb'
      },
      energetic: {
        badge: 'Aura Durumu: Yüksek Canlılık',
        title: 'Güneşin Gücü',
        desc: 'İçiniz enerjiyle taşıyor! Fiziksel hareketler, egzersiz veya hızlı mini oyunlar oynamak için mükemmel bir zamandasınız. Altın sarısı auranız etrafınızdakilere de canlılık yayıyor.',
        freq: '417 Hz', chakra: 'Solar Pleksus (Manipura)',
        k: 6, speed: 0.035, color1: '#ffea00', color2: '#ff9100'
      },
      tired: {
        badge: 'Aura Durumu: Dinginlik ve Dinlenme',
        title: 'Pilinizi Doldurun',
        desc: 'Zihniniz ve bedeniniz yavaşlama sinyalleri veriyor. Arka plandan ipeksi bir yağmur sesi açın, gözlerinizi kapatın ve auranızın yavaşça kırmızı sıcak dalgalarla şarj olmasına izin verin.',
        freq: '396 Hz', chakra: 'Kök (Muladhara)',
        k: 4, speed: 0.008, color1: '#ff7043', color2: '#ff1744'
      }
    };
    
    var _auFPS = makeFPSGate(20);
    function drawAura(now) {
      requestAnimationFrame(drawAura);
      if (!isCanvasActive('auraCanvas')) return;
      if (!_auFPS(now || 0)) return;
      
      var W = auraCanvas.width;
      var H = auraCanvas.height;
      auCtx.fillStyle = 'rgba(3, 3, 9, 0.15)'; // trails
      auCtx.fillRect(0, 0, W, H);
      
      var m = moodData[currentMood];
      auraAngle += m.speed;
      auraPulse += 0.04;
      
      var cx = W / 2;
      var cy = H / 2;
      var maxR = W * 0.4;
      
      auCtx.save();
      auCtx.translate(cx, cy);
      auCtx.rotate(auraAngle);
      
      // Draw harmonic polar rose curve particles
      auCtx.shadowBlur = 15;
      auCtx.shadowColor = m.color1;
      auCtx.strokeStyle = m.color1;
      auCtx.lineWidth = 2.5;
      
      auCtx.beginPath();
      for (var theta = 0; theta < Math.PI * 2; theta += 0.01) {
        // Rose curve equation: r = a * cos(k * theta)
        var amp = maxR * (0.7 + Math.sin(auraPulse) * 0.1);
        var r = amp * Math.cos(m.k * theta);
        var x = r * Math.cos(theta);
        var y = r * Math.sin(theta);
        
        if (theta === 0) auCtx.moveTo(x, y);
        else auCtx.lineTo(x, y);
      }
      auCtx.closePath();
      
      // Gradient stroke
      var grad = auCtx.createLinearGradient(-maxR, -maxR, maxR, maxR);
      grad.addColorStop(0, m.color1);
      grad.addColorStop(1, m.color2);
      auCtx.strokeStyle = grad;
      auCtx.stroke();
      
      // Inner glowing core
      auCtx.beginPath();
      var radGrad = auCtx.createRadialGradient(0, 0, 2, 0, 0, 30);
      radGrad.addColorStop(0, '#fff');
      radGrad.addColorStop(0.5, m.color1);
      radGrad.addColorStop(1, 'rgba(0,0,0,0)');
      auCtx.fillStyle = radGrad;
      auCtx.arc(0, 0, 30, 0, Math.PI*2);
      auCtx.fill();
      
      auCtx.restore();
    }
    
    function setAuraMood(moodKey) {
      currentMood = moodKey;
      var m = moodData[moodKey];
      
      // Update DOM text
      document.getElementById('auraStatusBadge').textContent = m.badge;
      document.getElementById('auraStatusBadge').style.color = m.color1;
      document.getElementById('auraTipTitle').textContent = m.title;
      document.getElementById('auraTipDesc').textContent = m.desc;
      document.getElementById('aura_sec').querySelector('span:nth-child(1) strong').textContent = m.freq;
      document.getElementById('aura_sec').querySelector('span:nth-child(2) strong').textContent = m.chakra;
      
      // Set active button
      document.querySelectorAll('#moodCalm,#moodFocus,#moodCreative,#moodEnergetic,#moodTired').forEach(function(b) {
        b.classList.remove('active');
        b.style.background = 'transparent';
        b.style.borderColor = 'var(--gb)';
      });
      
      var activeBtnMap = {
        calm: 'moodCalm', focus: 'moodFocus', creative: 'moodCreative', energetic: 'moodEnergetic', tired: 'moodTired'
      };
      var btn = document.getElementById(activeBtnMap[moodKey]);
      if (btn) {
        btn.classList.add('active');
        btn.style.background = 'linear-gradient(135deg,' + m.color1 + ',' + m.color2 + ')';
        btn.style.borderColor = 'transparent';
      }
      
      toast('🌀 Aura Frekansı Değişti: ' + m.freq, m.color1);
    }
    
    // Bind button triggers
    document.getElementById('moodCalm').addEventListener('click', function() { setAuraMood('calm'); });
    document.getElementById('moodFocus').addEventListener('click', function() { setAuraMood('focus'); });
    document.getElementById('moodCreative').addEventListener('click', function() { setAuraMood('creative'); });
    document.getElementById('moodEnergetic').addEventListener('click', function() { setAuraMood('energetic'); });
    document.getElementById('moodTired').addEventListener('click', function() { setAuraMood('tired'); });
    
    function resizeAura() {
      var rect = auraCanvas.parentElement.getBoundingClientRect();
      var size = Math.min(360, rect.width || 360);
      auraCanvas.width = size;
      auraCanvas.height = size;
    }
    
    window.addEventListener('resize', resizeAura);
    resizeAura();
    setAuraMood('calm');
    drawAura();
  }
} catch(e) { console.error('Aura error', e); }

/* ══════════════════════════════════════════════════════════
   AAA 12: ZEN KALEİDOSKOP (8-AXIS RADIAL MIRROR DRAWING)
   ══════════════════════════════════════════════════════════ */
try {
  var kaleidoCanvas = document.getElementById('kaleidoCanvas');
  if (kaleidoCanvas) {
    var kctx = kaleidoCanvas.getContext('2d');
    var kalBrush = 3;
    var kalDecayVal = 15;
    var kalMode = 'neon'; // neon, gold, ocean
    var kalIsPainting = false;
    
    function kSize() {
      var rect = kaleidoCanvas.parentElement.getBoundingClientRect();
      kaleidoCanvas.width = rect.width || 800;
      kaleidoCanvas.height = 450;
      
      kctx.fillStyle = '#010105';
      kctx.fillRect(0,0,kaleidoCanvas.width,kaleidoCanvas.height);
    }
    
    function drawSymmetricalLine(x1, y1, x2, y2) {
      var W = kaleidoCanvas.width;
      var H = kaleidoCanvas.height;
      var cx = W / 2;
      var cy = H / 2;
      
      // Calculate coordinates relative to canvas center
      var px1 = x1 - cx, py1 = y1 - cy;
      var px2 = x2 - cx, py2 = y2 - cy;
      
      var symmetry = 8;
      
      kctx.save();
      kctx.translate(cx, cy);
      kctx.lineWidth = kalBrush;
      kctx.lineCap = 'round';
      
      // Shadow neon glow setup
      kctx.shadowBlur = 10;
      
      var strokeCol = '#00e5ff';
      if (kalMode === 'neon') {
        strokeCol = 'hsl(' + (Date.now() / 15 % 360) + ', 100%, 65%)';
      } else if (kalMode === 'gold') {
        strokeCol = 'hsl(' + (Math.random() * 15 + 40) + ', 95%, ' + (Math.random() * 20 + 55) + '%)';
      } else {
        strokeCol = 'hsl(' + (Math.random() * 20 + 190) + ', 85%, 60%)';
      }
      
      kctx.strokeStyle = strokeCol;
      kctx.shadowColor = strokeCol;
      
      for (var i = 0; i < symmetry; i++) {
        kctx.rotate(Math.PI * 2 / symmetry);
        
        // 1. Draw normal rotated line
        kctx.beginPath();
        kctx.moveTo(px1, py1);
        kctx.lineTo(px2, py2);
        kctx.stroke();
        
        // 2. Draw mirrored line across X axis
        kctx.beginPath();
        kctx.moveTo(px1, -py1);
        kctx.lineTo(px2, -py2);
        kctx.stroke();
      }
      kctx.restore();
    }
    
    var lastX = 0, lastY = 0;
    
    kaleidoCanvas.addEventListener('mousedown', function(e) {
      kalIsPainting = true;
      var rect = kaleidoCanvas.getBoundingClientRect();
      lastX = (e.clientX - rect.left) * (kaleidoCanvas.width / rect.width);
      lastY = (e.clientY - rect.top) * (kaleidoCanvas.height / rect.height);
    });
    
    kaleidoCanvas.addEventListener('mousemove', function(e) {
      if (!kalIsPainting) return;
      var rect = kaleidoCanvas.getBoundingClientRect();
      var x = (e.clientX - rect.left) * (kaleidoCanvas.width / rect.width);
      var y = (e.clientY - rect.top) * (kaleidoCanvas.height / rect.height);
      
      drawSymmetricalLine(lastX, lastY, x, y);
      lastX = x; lastY = y;
    });
    
    window.addEventListener('mouseup', function() {
      kalIsPainting = false;
    });
    
    // Decay fading loop
    var _kalFPS = makeFPSGate(24);
    function decayKaleidoLoop(now) {
      requestAnimationFrame(decayKaleidoLoop);
      if (!isCanvasActive('kaleidoCanvas')) return;
      if (!_kalFPS(now || 0)) return;
      
      var W = kaleidoCanvas.width, H = kaleidoCanvas.height;
      if (kalDecayVal > 0) {
        kctx.fillStyle = 'rgba(1, 1, 5, ' + (kalDecayVal / 1200) + ')';
        kctx.fillRect(0, 0, W, H);
      }
    }
    
    // Toolbar configuration
    document.getElementById('kalBrushSize').addEventListener('input', function() {
      kalBrush = parseInt(this.value, 10);
      document.getElementById('kalBrushDisplay').textContent = kalBrush;
    });
    document.getElementById('kalDecay').addEventListener('input', function() {
      kalDecayVal = parseInt(this.value, 10);
    });
    document.getElementById('clearKal').addEventListener('click', function() {
      kctx.fillStyle = '#010105'; kctx.fillRect(0, 0, kaleidoCanvas.width, kaleidoCanvas.height);
      toast('🎨 Çizim tahtası temizlendi!', '#7c4dff');
    });
    
    // Color schemes triggers
    document.getElementById('kalColNeon').addEventListener('click', function() {
      document.querySelectorAll('#kalColNeon,#kalColGold,#kalColOcean').forEach(function(b){b.classList.remove('active');});
      this.classList.add('active'); kalMode = 'neon';
    });
    document.getElementById('kalColGold').addEventListener('click', function() {
      document.querySelectorAll('#kalColNeon,#kalColGold,#kalColOcean').forEach(function(b){b.classList.remove('active');});
      this.classList.add('active'); kalMode = 'gold';
    });
    document.getElementById('kalColOcean').addEventListener('click', function() {
      document.querySelectorAll('#kalColNeon,#kalColGold,#kalColOcean').forEach(function(b){b.classList.remove('active');});
      this.classList.add('active'); kalMode = 'ocean';
    });
    
    window.addEventListener('resize', kSize);
    kSize();
    decayKaleidoLoop();
  }
} catch(e) { console.error('Kaleido error', e); }

/* ══════════════════════════════════════════════════════════
   AAA 13: KOZMİK ORBİT (ZEN NEWTON GRAVITY SLINGSHOT)
   ══════════════════════════════════════════════════════════ */
try {
  var orbitCanvas = document.getElementById('orbitCanvas');
  if (orbitCanvas) {
    var obCtx = orbitCanvas.getContext('2d');
    var planets = [];
    var sun = { x: 0, y: 0, mass: 25000, radius: 24 };
    var activePlanetType = 'normal'; // normal, massive, light
    var isAiming = false;
    var aimStartX = 0, aimStartY = 0;
    var aimCurX = 0, aimCurY = 0;
    
    function sizeOrbit() {
      var rect = orbitCanvas.parentElement.getBoundingClientRect();
      orbitCanvas.width = rect.width || 800;
      orbitCanvas.height = 460;
      
      sun.x = orbitCanvas.width / 2;
      sun.y = orbitCanvas.height / 2;
    }
    
    function updatePhysics() {
      var W = orbitCanvas.width, H = orbitCanvas.height;
      var G = 0.15; // Gravity coefficient
      
      // Update each planet positioning
      planets.forEach(function(p, idx) {
        // Gravitational force vector to the central star
        var dx = sun.x - p.x;
        var dy = sun.y - p.y;
        var dist = Math.hypot(dx, dy);
        
        if (dist < sun.radius + p.radius) {
          // Melted by the sun!
          triggerSpark(p.x, p.y, p.color);
          planets.splice(idx, 1);
          toast('🪐 Gezegen güneş tarafından yutuldu!', '#ff1744');
          return;
        }
        
        // Acceleration = G * M / dist^2
        var forceMag = (G * sun.mass) / (dist * dist);
        p.vx += (dx / dist) * forceMag;
        p.vy += (dy / dist) * forceMag;
        
        // Apply position velocities
        p.x += p.vx;
        p.y += p.vy;
        
        // Trail stardust coordinates persistence
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 90) p.trail.shift();
      });
      
      // Remove off-canvas bounds planets (lost in infinite space)
      var beforeLen = planets.length;
      planets = planets.filter(function(p) {
        return p.x > -200 && p.x < W + 200 && p.y > -200 && p.y < H + 200;
      });
      if (planets.length < beforeLen) {
        toast('🛸 Gezegen derin uzaya fırladı!', '#ff7043');
      }
      
      document.getElementById('orbitCount').textContent = planets.length + 1; // Planets + Central Sun
    }
    
    var _orbFPS = makeFPSGate(24);
    function drawOrbit(now) {
      requestAnimationFrame(drawOrbit);
      if (!isCanvasActive('orbitCanvas')) return;
      if (!_orbFPS(now || 0)) return;
      
      var W = orbitCanvas.width, H = orbitCanvas.height;
      obCtx.fillStyle = '#020207';
      obCtx.fillRect(0, 0, W, H);
      
      // Draw grid orbits
      obCtx.strokeStyle = 'rgba(255,255,255,0.02)';
      obCtx.lineWidth = 1;
      for (var r = 50; r < Math.max(W, H); r += 60) {
        obCtx.beginPath();
        obCtx.arc(sun.x, sun.y, r, 0, Math.PI*2);
        obCtx.stroke();
      }
      
      // Update dynamic physics loops
      updatePhysics();
      
      // Render Star dust trails
      planets.forEach(function(p) {
        if (p.trail.length < 2) return;
        obCtx.beginPath();
        obCtx.lineWidth = 1.5;
        obCtx.strokeStyle = p.color;
        obCtx.globalAlpha = 0.35;
        obCtx.moveTo(p.trail[0].x, p.trail[0].y);
        for (var i = 1; i < p.trail.length; i++) {
          obCtx.lineTo(p.trail[i].x, p.trail[i].y);
        }
        obCtx.stroke();
        obCtx.globalAlpha = 1.0;
      });
      
      // Render Central Gravitational Star (Sun)
      obCtx.save();
      obCtx.shadowBlur = 30;
      obCtx.shadowColor = '#ffea00';
      var sunGrad = obCtx.createRadialGradient(sun.x, sun.y, 2, sun.x, sun.y, sun.radius);
      sunGrad.addColorStop(0, '#fff');
      sunGrad.addColorStop(0.3, '#ffea00');
      sunGrad.addColorStop(1, 'rgba(255,234,0,0)');
      obCtx.fillStyle = sunGrad;
      obCtx.beginPath();
      obCtx.arc(sun.x, sun.y, sun.radius, 0, Math.PI * 2);
      obCtx.fill();
      obCtx.restore();
      
      // Render colorful planets
      planets.forEach(function(p) {
        obCtx.save();
        obCtx.shadowBlur = 15;
        obCtx.shadowColor = p.color;
        
        var pGrad = obCtx.createRadialGradient(p.x, p.y, p.radius * 0.1, p.x, p.y, p.radius);
        pGrad.addColorStop(0, '#fff');
        pGrad.addColorStop(0.4, p.color);
        pGrad.addColorStop(1, p.color + '44');
        
        obCtx.fillStyle = pGrad;
        obCtx.beginPath();
        obCtx.arc(p.x, p.y, p.radius, 0, Math.PI*2);
        obCtx.fill();
        obCtx.restore();
      });
      
      // Aiming vector slingshot lines rendering
      if (isAiming) {
        obCtx.beginPath();
        obCtx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
        obCtx.setLineDash([4, 4]);
        obCtx.lineWidth = 2;
        obCtx.moveTo(aimStartX, aimStartY);
        obCtx.lineTo(aimCurX, aimCurY);
        obCtx.stroke();
        obCtx.setLineDash([]);
        
        // Draw forecast vector path arrow
        obCtx.beginPath();
        obCtx.arc(aimStartX, aimStartY, 6, 0, Math.PI * 2);
        obCtx.fillStyle = '#00e5ff';
        obCtx.fill();
      }
    }
    
    // Slingshot click handlers
    orbitCanvas.addEventListener('mousedown', function(e) {
      isAiming = true;
      var rect = orbitCanvas.getBoundingClientRect();
      aimStartX = (e.clientX - rect.left) * (orbitCanvas.width / rect.width);
      aimStartY = (e.clientY - rect.top) * (orbitCanvas.height / rect.height);
      aimCurX = aimStartX;
      aimCurY = aimStartY;
    });
    orbitCanvas.addEventListener('mousemove', function(e) {
      if (isAiming) {
        var rect = orbitCanvas.getBoundingClientRect();
        aimCurX = (e.clientX - rect.left) * (orbitCanvas.width / rect.width);
        aimCurY = (e.clientY - rect.top) * (orbitCanvas.height / rect.height);
      }
    });
    window.addEventListener('mouseup', function() {
      if (isAiming) {
        isAiming = false;
        
        // Speed scale is proportional to slingshot length
        var dx = aimStartX - aimCurX;
        var dy = aimStartY - aimCurY;
        var velX = dx * 0.055;
        var velY = dy * 0.055;
        
        var rad = 8, col = '#00e5ff', m = 1.0;
        if (activePlanetType === 'massive') {
          rad = 14; col = '#ff7043'; m = 3.0;
        } else if (activePlanetType === 'light') {
          rad = 5; col = '#69f0ae'; m = 0.4;
        }
        
        planets.push({
          x: aimStartX, y: aimStartY, vx: velX, vy: velY, radius: rad, color: col, mass: m, trail: []
        });
        toast('🚀 Gezegen Yörüngeye Fırlatıldı!', '#00e5ff');
      }
    });
    
    // Controls panel setup
    document.getElementById('orbTypeNormal').addEventListener('click', function() {
      document.querySelectorAll('#orbTypeNormal,#orbTypeMassive,#orbTypeLight').forEach(function(b){b.classList.remove('active');});
      this.classList.add('active'); activePlanetType = 'normal';
    });
    document.getElementById('orbTypeMassive').addEventListener('click', function() {
      document.querySelectorAll('#orbTypeNormal,#orbTypeMassive,#orbTypeLight').forEach(function(b){b.classList.remove('active');});
      this.classList.add('active'); activePlanetType = 'massive';
    });
    document.getElementById('orbTypeLight').addEventListener('click', function() {
      document.querySelectorAll('#orbTypeNormal,#orbTypeMassive,#orbTypeLight').forEach(function(b){b.classList.remove('active');});
      this.classList.add('active'); activePlanetType = 'light';
    });
    
    document.getElementById('clearOrbit').addEventListener('click', function() {
      planets = [];
      toast('🌌 Tüm gezegenler buharlaştırıldı!', '#ff7043');
    });
    document.getElementById('resetOrbitSun').addEventListener('click', function() {
      sun.mass = sun.mass === 25000 ? 55000 : 25000;
      sun.radius = sun.mass === 55000 ? 32 : 24;
      toast('☀️ Güneş Çekim Kuvveti Güncellendi!', '#ffea00');
    });
    
    window.addEventListener('resize', sizeOrbit);
    sizeOrbit();
    drawOrbit();
  }
} catch(e) { console.error('Orbit error', e); }

/* ══════════════════════════════════════════════════════════
   AAA 14: ZEN ODAKLANMA SAATİ (FOCUS AMBIENT SOUND GENERATOR)
   ══════════════════════════════════════════════════════════ */
try {
  var zenClockCanvas = document.getElementById('zenClockCanvas');
  if (zenClockCanvas) {
    var clCtx = zenClockCanvas.getContext('2d');
    var audioCtx = null;
    var activeSoundNodes = {};
    
    // Synthesize organic sounds using Web Audio API! (RAIN, WIND, FIRE, WATER)
    function initFocusAudio() {
      if (audioCtx) return;
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch(e2) {
        console.error('AudioContext fail', e2);
      }
    }
    
    function startSynthesizerAmbient(type) {
      initFocusAudio();
      if (!audioCtx) return;
      
      // Stop existing if any
      if (activeSoundNodes[type]) {
        stopSynthesizerAmbient(type);
        return;
      }
      
      var bufferSize = 2 * audioCtx.sampleRate;
      var noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      var output = noiseBuffer.getChannelData(0);
      
      // Synthesize noise sweeps
      for (var i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      
      var whiteNoise = audioCtx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;
      
      var gainNode = audioCtx.createGain();
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      
      var filterNode = audioCtx.createBiquadFilter();
      
      if (type === 'rain') {
        // Highpass & Lowpass combo for ipeksi rain drops
        filterNode.type = 'bandpass';
        filterNode.frequency.value = 850;
        filterNode.Q.value = 1.0;
        whiteNoise.connect(filterNode); filterNode.connect(gainNode);
      } 
      else if (type === 'wind') {
        // Modulated Lowpass wind swooshes
        filterNode.type = 'lowpass';
        filterNode.frequency.value = 350;
        
        // Modulator LFO for wind gust shifts
        var lfo = audioCtx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.18; // Slow shifts
        
        var lfoGain = audioCtx.createGain();
        lfoGain.gain.value = 160;
        
        lfo.connect(lfoGain);
        lfoGain.connect(filterNode.frequency);
        
        lfo.start();
        whiteNoise.connect(filterNode); filterNode.connect(gainNode);
        
        activeSoundNodes[type + '_lfo'] = lfo;
      } 
      else if (type === 'fire') {
        // Lowpass hum coupled with crackling impulses
        filterNode.type = 'lowpass';
        filterNode.frequency.value = 180;
        
        // Crackle generator impulse oscillator
        var crackle = audioCtx.createOscillator();
        crackle.type = 'sawtooth';
        crackle.frequency.value = 8.5; // crackle rate
        
        var cGain = audioCtx.createGain();
        cGain.gain.value = 0.03;
        
        crackle.connect(cGain);
        cGain.connect(gainNode);
        
        crackle.start();
        whiteNoise.connect(filterNode); filterNode.connect(gainNode);
        
        activeSoundNodes[type + '_crackle'] = crackle;
      } 
      else if (type === 'water') {
        // Low frequency deep resonance
        filterNode.type = 'lowpass';
        filterNode.frequency.value = 80;
        
        var resOsc = audioCtx.createOscillator();
        resOsc.type = 'sine';
        resOsc.frequency.value = 54; // deep base hum
        
        var resGain = audioCtx.createGain();
        resGain.gain.value = 0.08;
        
        resOsc.connect(resGain);
        resGain.connect(gainNode);
        
        resOsc.start();
        whiteNoise.connect(filterNode); filterNode.connect(gainNode);
        
        activeSoundNodes[type + '_osc'] = resOsc;
      }
      
      gainNode.connect(audioCtx.destination);
      whiteNoise.start();
      
      activeSoundNodes[type] = { source: whiteNoise, gain: gainNode };
      
      // Update UI button state
      var idMap = { rain: 'btnSoundRain', wind: 'btnSoundWind', fire: 'btnSoundFire', water: 'btnSoundWater' };
      document.getElementById(idMap[type]).textContent = '⏹ Durdur';
      document.getElementById(idMap[type]).style.background = 'rgba(105,240,174,0.15)';
      document.getElementById(idMap[type]).style.borderColor = '#69f0ae';
      
      toast('🎵 Doğa Sesleri Çalıyor...', '#69f0ae');
    }
    
    function stopSynthesizerAmbient(type) {
      if (activeSoundNodes[type]) {
        try {
          activeSoundNodes[type].source.stop();
        } catch(e3){}
        
        // Stop sub components if any
        if (activeSoundNodes[type + '_lfo']) activeSoundNodes[type + '_lfo'].stop();
        if (activeSoundNodes[type + '_crackle']) activeSoundNodes[type + '_crackle'].stop();
        if (activeSoundNodes[type + '_osc']) activeSoundNodes[type + '_osc'].stop();
        
        delete activeSoundNodes[type];
        
        // Reset UI button state
        var idMap = { rain: 'btnSoundRain', wind: 'btnSoundWind', fire: 'btnSoundFire', water: 'btnSoundWater' };
        document.getElementById(idMap[type]).textContent = '▶ Çal';
        document.getElementById(idMap[type]).style.background = '';
        document.getElementById(idMap[type]).style.borderColor = '';
        
        toast('⏹ Ses Kapatıldı', '#ff7043');
      }
    }
    
    // Bind sound buttons
    document.getElementById('btnSoundRain').addEventListener('click', function() { startSynthesizerAmbient('rain'); });
    document.getElementById('btnSoundWind').addEventListener('click', function() { startSynthesizerAmbient('wind'); });
    document.getElementById('btnSoundFire').addEventListener('click', function() { startSynthesizerAmbient('fire'); });
    document.getElementById('btnSoundWater').addEventListener('click', function() { startSynthesizerAmbient('water'); });
    
    // Draw Glass Clock Loop
    function updateZenClock() {
      var W = zenClockCanvas.width, H = zenClockCanvas.height;
      var cx = W / 2, cy = H / 2;
      var r = W * 0.45;
      
      clCtx.clearRect(0, 0, W, H);
      
      // Clock glass back circle
      clCtx.fillStyle = 'rgba(255, 255, 255, 0.015)';
      clCtx.beginPath();
      clCtx.arc(cx, cy, r, 0, Math.PI*2);
      clCtx.fill();
      
      clCtx.strokeStyle = 'rgba(0, 229, 255, 0.15)';
      clCtx.lineWidth = 2.5;
      clCtx.beginPath();
      clCtx.arc(cx, cy, r, 0, Math.PI*2);
      clCtx.stroke();
      
      // Clock dial ticks
      clCtx.save();
      clCtx.translate(cx, cy);
      clCtx.fillStyle = 'rgba(255,255,255,0.2)';
      for (var i = 0; i < 12; i++) {
        clCtx.fillRect(-1.5, -r + 5, 3, 10);
        clCtx.rotate(Math.PI / 6);
      }
      clCtx.restore();
      
      // Fetch time
      var d = new Date();
      var hrs = d.getHours();
      var mins = d.getMinutes();
      var secs = d.getSeconds();
      
      // Digital string
      var digStr = String(hrs).padStart(2,'0') + ':' + String(mins).padStart(2,'0') + ':' + String(secs).padStart(2,'0');
      document.getElementById('zenClockDigital').textContent = digStr;
      
      // Angles
      var aSec = (secs / 60) * Math.PI * 2;
      var aMin = ((mins + secs/60) / 60) * Math.PI * 2;
      var aHr = (((hrs % 12) + mins/60) / 12) * Math.PI * 2;
      
      // Hands Drawing
      // Hour hand
      clCtx.save();
      clCtx.translate(cx, cy);
      clCtx.rotate(aHr);
      clCtx.strokeStyle = '#fff';
      clCtx.lineWidth = 5;
      clCtx.lineCap = 'round';
      clCtx.beginPath(); clCtx.moveTo(0, 10); clCtx.lineTo(0, -r * 0.5); clCtx.stroke();
      clCtx.restore();
      
      // Minute hand
      clCtx.save();
      clCtx.translate(cx, cy);
      clCtx.rotate(aMin);
      clCtx.strokeStyle = 'var(--a1)';
      clCtx.lineWidth = 3.5;
      clCtx.lineCap = 'round';
      clCtx.beginPath(); clCtx.moveTo(0, 15); clCtx.lineTo(0, -r * 0.72); clCtx.stroke();
      clCtx.restore();
      
      // Second hand
      clCtx.save();
      clCtx.translate(cx, cy);
      clCtx.rotate(aSec);
      clCtx.strokeStyle = '#ff7043';
      clCtx.lineWidth = 1.5;
      clCtx.lineCap = 'round';
      clCtx.beginPath(); clCtx.moveTo(0, 20); clCtx.lineTo(0, -r * 0.85); clCtx.stroke();
      clCtx.restore();
      
      // Center pin
      clCtx.fillStyle = '#ff7043';
      clCtx.beginPath();
      clCtx.arc(cx, cy, 5, 0, Math.PI*2);
      clCtx.fill();
    }
    
    setInterval(updateZenClock, 1000);
    
    // Pomodoro Timer logic
    var timerVal = 25 * 60;
    var timerRunning = false;
    var timerInterval = null;
    
    function updateTimerDisplay() {
      var m = Math.floor(timerVal / 60);
      var s = timerVal % 60;
      document.getElementById('zenTimerDisplay').textContent = String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
    }
    
    document.getElementById('zenTimerStartBtn').addEventListener('click', function() {
      if (timerRunning) {
        clearInterval(timerInterval);
        timerRunning = false;
        this.textContent = '▶ Başlat';
        toast('⏱️ Odaklanma sayacı durduruldu', '#ff7043');
      } else {
        initFocusAudio();
        timerRunning = true;
        this.textContent = '⏹ Durdur';
        toast('⏱️ Odaklanma sayacı başladı! Zihninizi arındırın.', '#00e5ff');
        
        timerInterval = setInterval(function() {
          timerVal--;
          updateTimerDisplay();
          if (timerVal <= 0) {
            clearInterval(timerInterval);
            timerRunning = false;
            timerVal = 25 * 60;
            document.getElementById('zenTimerStartBtn').textContent = '▶ Başlat';
            updateTimerDisplay();
            toast('🔔 TEBRİKLER! Odaklanma seansınız bitti. Dinlenmeyi unutmayın.', '#69f0ae');
            
            // Play success bell oscillator
            if (audioCtx) {
              var osc = audioCtx.createOscillator();
              var gain = audioCtx.createGain();
              osc.connect(gain); gain.connect(audioCtx.destination);
              osc.type = 'sine'; osc.frequency.value = 660;
              gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
              osc.start(); osc.stop(audioCtx.currentTime + 1.2);
            }
          }
        }, 1000);
      }
    });
    
    document.getElementById('zenTimerResetBtn').addEventListener('click', function() {
      clearInterval(timerInterval);
      timerRunning = false;
      timerVal = 25 * 60;
      document.getElementById('zenTimerStartBtn').textContent = '▶ Başlat';
      updateTimerDisplay();
      toast('⏱️ Sayaç sıfırlandı', '#7c4dff');
    });
    
    function resizeZenClock() {
      var rect = zenClockCanvas.parentElement.getBoundingClientRect();
      var size = Math.min(260, rect.width || 260);
      zenClockCanvas.width = size;
      zenClockCanvas.height = size;
      updateZenClock();
    }
    
    window.addEventListener('resize', resizeZenClock);
    resizeZenClock();
    updateTimerDisplay();
  }
} catch(e) { console.error('ZenClock error', e); }

/* ══════════════════════════════════════════════════════════
   44. KOZMİK KARAR ÇARKİ
   ══════════════════════════════════════════════════════════ */
try {
  var wheelCanvas = document.getElementById('wheelCanvas');
  if (wheelCanvas) {
    var wctx = wheelCanvas.getContext('2d');
    var wheelOptions = ['Kitap Oku 📚', 'Film İzle 🎬', 'Yürüyüş Yap 🚶', 'Kod Yaz 💻', 'Meditasyon Yap 🧘', 'Müzik Dinle 🎵'];
    var wheelColors = ['#7c4dff', '#ff6b9d', '#00e5ff', '#ffea00', '#00c853', '#ff7043'];
    var startAngle = 0;
    var arc = Math.PI / (wheelOptions.length / 2);
    var spinTimeout = null;
    var spinAngleStart = 10;
    var spinTime = 0;
    var spinTimeTotal = 0;

    function drawRouletteWheel() {
      if (!wheelCanvas) return;
      var W = wheelCanvas.width;
      var H = wheelCanvas.height;
      var outsideRadius = W / 2 - 10;
      var textRadius = W / 2 - 50;
      var insideRadius = W / 2 - 110;

      wctx.clearRect(0,0,W,H);
      wctx.strokeStyle = 'rgba(255,255,255,0.08)';
      wctx.lineWidth = 2;

      wctx.font = 'bold 11px Outfit, sans-serif';

      for(var i = 0; i < wheelOptions.length; i++) {
        var angle = startAngle + i * arc;
        wctx.fillStyle = wheelColors[i % wheelColors.length];

        wctx.beginPath();
        wctx.arc(W/2, H/2, outsideRadius, angle, angle + arc, false);
        wctx.arc(W/2, H/2, insideRadius, angle + arc, angle, true);
        wctx.stroke();
        wctx.fill();

        wctx.save();
        wctx.fillStyle = '#ffffff';
        wctx.translate(W/2 + Math.cos(angle + arc / 2) * textRadius, H/2 + Math.sin(angle + arc / 2) * textRadius);
        wctx.rotate(angle + arc / 2 + Math.PI / 2);
        var text = wheelOptions[i];
        wctx.fillText(text, -wctx.measureText(text).width / 2, 0);
        wctx.restore();
      }

      // Draw Center Hub
      wctx.fillStyle = '#020208';
      wctx.beginPath();
      wctx.arc(W/2, H/2, 25, 0, Math.PI*2);
      wctx.fill();
      wctx.strokeStyle = '#00e5ff';
      wctx.lineWidth = 3;
      wctx.stroke();
    }

    function rotateWheel() {
      spinTime += 30;
      if(spinTime >= spinTimeTotal) {
        stopRotateWheel();
        return;
      }
      var spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
      startAngle += (spinAngle * Math.PI / 180);
      drawRouletteWheel();
      spinTimeout = setTimeout(rotateWheel, 30);
    }

    function easeOut(t, b, c, d) {
      var ts = (t /= d) * t;
      var tc = ts * t;
      return b + c * (tc + -3 * ts + 3 * t);
    }

    function spin() {
      spinAngleStart = Math.random() * 10 + 10;
      spinTime = 0;
      spinTimeTotal = Math.random() * 3000 + 4000;
      rotateWheel();
    }

    function stopRotateWheel() {
      clearTimeout(spinTimeout);
      var degrees = startAngle * 180 / Math.PI + 90;
      var arcd = arc * 180 / Math.PI;
      var index = Math.floor((360 - degrees % 360) / arcd);
      if (index < 0) index = wheelOptions.length + index;
      var text = wheelOptions[index % wheelOptions.length];
      toast('🎡 Tavsiye: ' + text, '#00e5ff');
    }

    function updateOptionsList() {
      var list = document.getElementById('listOptions');
      if (!list) return;
      list.innerHTML = '';
      wheelOptions.forEach(function(opt, idx) {
        var row = document.createElement('div');
        row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,0.03);padding:6px 10px;border-radius:var(--r1);font-size:0.8rem;border:1px solid rgba(255,255,255,0.04);';
        row.innerHTML = '<span>' + opt + '</span><button class="mini-btn" style="padding:2px 6px;font-size:0.7rem;background:rgba(255,107,157,0.1);color:#ff6b9d;border-color:rgba(255,107,157,0.2);" onclick="removeWheelOption(' + idx + ')">🗑️</button>';
        list.appendChild(row);
      });
      arc = Math.PI / (wheelOptions.length / 2);
      drawRouletteWheel();
    }

    window.removeWheelOption = function(idx) {
      if (wheelOptions.length <= 2) {
        toast('⚠️ Çarkta en az 2 seçenek bulunmalıdır!', '#ff7043');
        return;
      }
      wheelOptions.splice(idx, 1);
      updateOptionsList();
    };

    document.getElementById('btnSpinWheel').addEventListener('click', function() {
      spin();
    });

    document.getElementById('btnAddOption').addEventListener('click', function() {
      var input = document.getElementById('txtNewOption');
      var val = input.value.trim();
      if(!val) return;
      if(val.length > 20) {
        toast('⚠️ Seçenek 20 karakterden kısa olmalıdır!', '#ff7043');
        return;
      }
      wheelOptions.push(val);
      input.value = '';
      updateOptionsList();
      toast('➕ Eklendi: ' + val, '#69f0ae');
    });

    updateOptionsList();
  }
} catch(e) { console.error('Karar Carki error', e); }

/* ══════════════════════════════════════════════════════════
   45. METİN ANALİZÖRÜ & KELİME SAYACİ
   ══════════════════════════════════════════════════════════ */
try {
  var textInput = document.getElementById('txtAnalyzerInput');
  if (textInput) {
    var positiveWords = ['güzel', 'iyi', 'mutlu', 'huzur', 'harika', 'sevgi', 'aşk', 'teşekkür', 'başarı', 'neşe', 'keyif', 'sakin'];
    var negativeWords = ['kötü', 'üzgün', 'kızgın', 'stres', 'öfke', 'nefret', 'acı', 'korku', 'yorgun', 'huzursuz', 'sıkıcı', 'dert'];
    
    var zenQuotes = [
      "Zihnini boşalt, su gibi formsuz ve şekilsiz ol. 🌊",
      "Sessizlik en güçlü sestir. İçindeki huzuru keşfet. 🧘",
      "Geçmiş bir rüyadır, gelecek bir fantezi. Sadece şu an gerçektir. ✨",
      "Fırtınanın ortasında dinginliği bulmak, gerçek güçtür. 🌀",
      "Her gün yeni bir başlangıçtır; derin bir nefes al ve gülümse. 🌸"
    ];

    function analyzeText() {
      var text = textInput.value;
      var chars = text.length;
      var words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
      
      // Calculate reading time (average 200 words per minute)
      var readingTimeSeconds = Math.round((words / 200) * 60);
      var timeText = readingTimeSeconds + ' sn';
      if (readingTimeSeconds >= 60) {
        timeText = Math.floor(readingTimeSeconds / 60) + ' dk ' + (readingTimeSeconds % 60) + ' sn';
      }

      // Sentiment analysis
      var cleanText = text.toLowerCase();
      var posCount = 0;
      var negCount = 0;
      
      positiveWords.forEach(function(w) {
        var regex = new RegExp('\\b' + w, 'g');
        var matches = cleanText.match(regex);
        if (matches) posCount += matches.length;
      });

      negativeWords.forEach(function(w) {
        var regex = new RegExp('\\b' + w, 'g');
        var matches = cleanText.match(regex);
        if (matches) negCount += matches.length;
      });

      var sentimentEl = document.getElementById('statSentiment');
      if (sentimentEl) {
        if (words === 0) {
          sentimentEl.innerHTML = '🧘 Dingin';
          sentimentEl.style.color = '#00c853';
        } else if (posCount > negCount) {
          sentimentEl.innerHTML = '😊 Pozitif';
          sentimentEl.style.color = '#ffea00';
        } else if (negCount > posCount) {
          sentimentEl.innerHTML = '😢 Melankoli';
          sentimentEl.style.color = '#ff6b9d';
        } else {
          sentimentEl.innerHTML = '🧘 Dingin';
          sentimentEl.style.color = '#00c853';
        }
      }

      document.getElementById('statWords').textContent = words;
      document.getElementById('statChars').textContent = chars;
      document.getElementById('statReadTime').textContent = timeText;
    }

    textInput.addEventListener('input', analyzeText);

    document.getElementById('btnCleanAnalyzer').addEventListener('click', function() {
      textInput.value = '';
      analyzeText();
      toast('🗑️ Metin temizlendi', '#546e7a');
    });

    document.getElementById('btnRandomZenText').addEventListener('click', function() {
      var rand = zenQuotes[Math.floor(Math.random() * zenQuotes.length)];
      textInput.value = rand;
      analyzeText();
      toast('💡 Zen sözü eklendi', '#7c4dff');
    });
  }
} catch(e) { console.error('Metin Analizoru error', e); }

/* ══════════════════════════════════════════════════════════
   46. BİORİTİM HESAPLAYICI
   ══════════════════════════════════════════════════════════ */
try {
  var svgBiorhythm = document.getElementById('svgBiorhythm');
  if (svgBiorhythm) {
    function calculateBiorhythm(birthDate, targetDate) {
      var diffTime = Math.abs(targetDate - birthDate);
      var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return {
        physical: Math.sin((2 * Math.PI * diffDays) / 23),
        emotional: Math.sin((2 * Math.PI * diffDays) / 28),
        intellectual: Math.sin((2 * Math.PI * diffDays) / 33)
      };
    }

    function drawBiorhythmChart() {
      var birthVal = document.getElementById('dateBirth').value;
      if (!birthVal) return;
      var birthDate = new Date(birthVal);
      var today = new Date();
      
      svgBiorhythm.innerHTML = '';
      
      var width = 800;
      var height = 250;
      var centerY = height / 2;
      
      // Draw grid lines
      var gridY = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      gridY.setAttribute('x1', '0'); gridY.setAttribute('y1', centerY);
      gridY.setAttribute('x2', width); gridY.setAttribute('y2', centerY);
      gridY.setAttribute('stroke', 'rgba(255,255,255,0.15)');
      gridY.setAttribute('stroke-width', '1.5');
      gridY.setAttribute('stroke-dasharray', '4,4');
      svgBiorhythm.appendChild(gridY);

      // Label today line
      var todayX = width / 2;
      var gridToday = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      gridToday.setAttribute('x1', todayX); gridToday.setAttribute('y1', '0');
      gridToday.setAttribute('x2', todayX); gridToday.setAttribute('y2', height);
      gridToday.setAttribute('stroke', 'rgba(255,234,0,0.4)');
      gridToday.setAttribute('stroke-width', '1.5');
      svgBiorhythm.appendChild(gridToday);

      // Label Today Text
      var textToday = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textToday.setAttribute('x', todayX + 5);
      textToday.setAttribute('y', '20');
      textToday.setAttribute('fill', '#ffea00');
      textToday.setAttribute('font-size', '10px');
      textToday.setAttribute('font-weight', 'bold');
      textToday.textContent = 'Bugün 📍';
      svgBiorhythm.appendChild(textToday);

      // Generate paths
      var physPoints = [];
      var emotPoints = [];
      var intelPoints = [];
      
      var daysRange = 7; // Plot 7 days (-3 to +3)
      var stepX = width / (daysRange - 1);
      
      for (var i = 0; i < daysRange; i++) {
        var offsetDays = i - 3;
        var date = new Date(today);
        date.setDate(today.getDate() + offsetDays);
        
        var bios = calculateBiorhythm(birthDate, date);
        
        var x = i * stepX;
        var yPhys = centerY - (bios.physical * (height / 2.5));
        var yEmot = centerY - (bios.emotional * (height / 2.5));
        var yIntel = centerY - (bios.intellectual * (height / 2.5));
        
        physPoints.push(x + ',' + yPhys);
        emotPoints.push(x + ',' + yEmot);
        intelPoints.push(x + ',' + yIntel);

        // Draw day labels at center line
        var dayText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        dayText.setAttribute('x', x - 12);
        dayText.setAttribute('y', centerY + 18);
        dayText.setAttribute('fill', 'rgba(255,255,255,0.4)');
        dayText.setAttribute('font-size', '9px');
        var dayLabel = date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
        dayText.textContent = dayLabel;
        svgBiorhythm.appendChild(dayText);
      }
      
      // Render Paths
      var pathColors = { phys: '#00e5ff', emot: '#ff6b9d', intel: '#ffea00' };
      
      var pPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pPath.setAttribute('d', 'M ' + physPoints.join(' L '));
      pPath.setAttribute('fill', 'none'); pPath.setAttribute('stroke', pathColors.phys);
      pPath.setAttribute('stroke-width', '2.5'); svgBiorhythm.appendChild(pPath);

      var ePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      ePath.setAttribute('d', 'M ' + emotPoints.join(' L '));
      ePath.setAttribute('fill', 'none'); ePath.setAttribute('stroke', pathColors.emot);
      ePath.setAttribute('stroke-width', '2.5'); svgBiorhythm.appendChild(ePath);

      var iPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      iPath.setAttribute('d', 'M ' + intelPoints.join(' L '));
      iPath.setAttribute('fill', 'none'); iPath.setAttribute('stroke', pathColors.intel);
      iPath.setAttribute('stroke-width', '2.5'); svgBiorhythm.appendChild(iPath);

      // Draw interactive circle markers for today
      var todayBios = calculateBiorhythm(birthDate, today);
      var markerData = [
        { y: centerY - (todayBios.physical * (height / 2.5)), color: pathColors.phys },
        { y: centerY - (todayBios.emotional * (height / 2.5)), color: pathColors.emot },
        { y: centerY - (todayBios.intellectual * (height / 2.5)), color: pathColors.intel }
      ];

      markerData.forEach(function(m) {
        var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', todayX);
        circle.setAttribute('cy', m.y);
        circle.setAttribute('r', '6');
        circle.setAttribute('fill', m.color);
        circle.setAttribute('stroke', '#020208');
        circle.setAttribute('stroke-width', '2');
        svgBiorhythm.appendChild(circle);
      });
      
      toast('📈 Bioritim grafiği güncellendi!', '#ffea00');
    }

    document.getElementById('btnCalcBiorhythm').addEventListener('click', drawBiorhythmChart);
    
    // Initial draw
    setTimeout(drawBiorhythmChart, 1000);
  }
} catch(e) { console.error('Biorhythm error', e); }

/* ══════════════════════════════════════════════════════════
   47. CAM KRONOMETRE & SÜREÖLÇER
   ══════════════════════════════════════════════════════════ */
try {
  var stopwatchTab = document.getElementById('tabStopwatch');
  if (stopwatchTab) {
    var timerTab = document.getElementById('tabTimer');
    var isTimerMode = false;
    
    var timeDisplay = document.getElementById('timeDisplay');
    var displayModeLabel = document.getElementById('displayModeLabel');
    var timerInputs = document.getElementById('timerInputs');
    var lapContainer = document.getElementById('lapContainer');
    
    var startBtn = document.getElementById('btnStopwatchStart');
    var resetBtn = document.getElementById('btnStopwatchReset');
    var lapList = document.getElementById('lapList');
    
    // Web Audio Oscillator context
    var audioCtxTimer = null;
    function playBeep(freq, type, duration) {
      try {
        var AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        if (!audioCtxTimer) audioCtxTimer = new AudioCtx();
        var osc = audioCtxTimer.createOscillator();
        var gain = audioCtxTimer.createGain();
        osc.connect(gain); gain.connect(audioCtxTimer.destination);
        osc.type = type || 'sine';
        osc.frequency.value = freq || 440;
        gain.gain.setValueAtTime(0.2, audioCtxTimer.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtxTimer.currentTime + duration);
        osc.start(); osc.stop(audioCtxTimer.currentTime + duration);
      } catch(ex){}
    }

    // Logic variables
    var swActive = false;
    var swTime = 0; // ms
    var swInterval = null;
    var lastSwTime = 0;
    var laps = [];

    var tmActive = false;
    var tmDuration = 0; // seconds
    var tmInterval = null;
    var tmTotalTime = 0;

    function formatTime(ms) {
      var minutes = Math.floor(ms / 60000);
      var seconds = Math.floor((ms % 60000) / 1000);
      var centiseconds = Math.floor((ms % 1000) / 10);
      return String(minutes).padStart(2,'0') + ':' + String(seconds).padStart(2,'0') + '.' + String(centiseconds).padStart(2,'0');
    }

    function formatTimerTime(sec) {
      var minutes = Math.floor(sec / 60);
      var seconds = sec % 60;
      return String(minutes).padStart(2,'0') + ':' + String(seconds).padStart(2,'0');
    }

    function updateProgressRing(pct) {
      var circle = document.getElementById('timerProgressRing');
      if (!circle) return;
      var offset = 628 - (pct * 628);
      circle.style.strokeDashoffset = offset;
    }

    function toggleMode(mode) {
      isTimerMode = mode === 'timer';
      stopwatchTab.classList.toggle('active', !isTimerMode);
      timerTab.classList.toggle('active', isTimerMode);
      
      resetAll();
      
      displayModeLabel.textContent = isTimerMode ? 'Geri Sayım' : 'Kronometre';
      timerInputs.style.display = isTimerMode ? 'flex' : 'none';
      lapContainer.style.display = isTimerMode ? 'none' : 'flex';
      timeDisplay.style.display = isTimerMode ? 'none' : 'block';
    }

    function resetAll() {
      // Clear all
      clearInterval(swInterval);
      clearInterval(tmInterval);
      swActive = false;
      tmActive = false;
      swTime = 0;
      laps = [];
      lapList.innerHTML = '';
      timeDisplay.textContent = '00:00.00';
      startBtn.textContent = '▶ Başlat';
      updateProgressRing(1);
    }

    stopwatchTab.addEventListener('click', function() { toggleMode('stopwatch'); });
    timerTab.addEventListener('click', function() { toggleMode('timer'); });

    startBtn.addEventListener('click', function() {
      if (!isTimerMode) {
        // Stopwatch logic
        if (swActive) {
          // Pause
          clearInterval(swInterval);
          swActive = false;
          startBtn.textContent = '▶ Başlat';
          resetBtn.textContent = '🔄 Sıfırla';
          toast('⏱️ Kronometre durduruldu', '#ff7043');
        } else {
          // Start
          swActive = true;
          lastSwTime = Date.now();
          startBtn.textContent = '⏸ Duraklat';
          resetBtn.textContent = '🚩 Tur Kaydet';
          swInterval = setInterval(function() {
            var now = Date.now();
            swTime += (now - lastSwTime);
            lastSwTime = now;
            timeDisplay.textContent = formatTime(swTime);
          }, 30);
          toast('⏱️ Kronometre başladı!', '#00e5ff');
        }
      } else {
        // Timer logic
        if (tmActive) {
          // Pause
          clearInterval(tmInterval);
          tmActive = false;
          startBtn.textContent = '▶ Başlat';
          toast('⏳ Geri Sayım durduruldu', '#ff7043');
        } else {
          // Start
          if (tmDuration <= 0) {
            var m = parseInt(document.getElementById('timerMin').value, 10) || 0;
            var s = parseInt(document.getElementById('timerSec').value, 10) || 0;
            tmDuration = (m * 60) + s;
            if (tmDuration <= 0) {
              toast('⚠️ Geçerli bir süre girin!', '#ff7043');
              return;
            }
            tmTotalTime = tmDuration;
          }
          tmActive = true;
          startBtn.textContent = '⏸ Duraklat';
          timeDisplay.style.display = 'block';
          timeDisplay.textContent = formatTimerTime(tmDuration);
          
          tmInterval = setInterval(function() {
            tmDuration--;
            if (tmDuration < 0) {
              clearInterval(tmInterval);
              tmActive = false;
              tmDuration = 0;
              timeDisplay.textContent = '00:00';
              startBtn.textContent = '▶ Başlat';
              updateProgressRing(0);
              playBeep(880, 'triangle', 0.8);
              toast('🔔 ZAMAN DOLDU!', '#ff6b9d');
            } else {
              timeDisplay.textContent = formatTimerTime(tmDuration);
              updateProgressRing(tmDuration / tmTotalTime);
              if (tmDuration <= 5 && tmDuration > 0) {
                // Short warning tick
                playBeep(520, 'sine', 0.1);
              }
            }
          }, 1000);
          toast('⏳ Geri sayım başladı!', '#7c4dff');
        }
      }
    });

    resetBtn.addEventListener('click', function() {
      if (!isTimerMode) {
        if (swActive) {
          // Lap feature
          laps.push(swTime);
          var li = document.createElement('div');
          li.style.cssText = 'display:flex;justify-content:space-between;background:rgba(255,255,255,0.03);padding:6px 12px;border-radius:var(--r1);font-family:monospace;font-size:0.83rem;border:1px solid rgba(255,255,255,0.04);';
          li.innerHTML = '<span>Tur ' + laps.length + '</span><strong>' + formatTime(swTime) + '</strong>';
          lapList.insertBefore(li, lapList.firstChild);
          playBeep(440, 'sine', 0.08);
        } else {
          resetAll();
          toast('🔄 Kronometre sıfırlandı', '#546e7a');
        }
      } else {
        clearInterval(tmInterval);
        tmActive = false;
        tmDuration = 0;
        timeDisplay.style.display = 'none';
        startBtn.textContent = '▶ Başlat';
        updateProgressRing(1);
        toast('🔄 Geri sayım sıfırlandı', '#546e7a');
      }
    });
  }
} catch(e) { console.error('Stopwatch error', e); }

/* ══════════════════════════════════════════════════════════
   48. KOZMİK YAPISKAN NOTLAR
   ══════════════════════════════════════════════════════════ */
try {
  var notesGrid = document.getElementById('notesGrid');
  if (notesGrid) {
    var activeNoteColor = 'purple';
    
    var colorHex = {
      purple: '#7c4dff',
      cyan: '#00e5ff',
      pink: '#ff6b9d',
      gold: '#ffea00'
    };

    // Color picker events
    document.querySelectorAll('#noteColorPicker .pal-color').forEach(function(btn) {
      btn.addEventListener('click', function() {
        document.querySelectorAll('#noteColorPicker .pal-color').forEach(function(b){b.classList.remove('sel');});
        btn.classList.add('sel');
        activeNoteColor = btn.dataset.color;
      });
    });

    var savedNotes = [];
    try {
      savedNotes = JSON.parse(localStorage.getItem('dreamscape_notes')) || [];
    } catch(ex){ savedNotes = []; }

    if (savedNotes.length === 0) {
      savedNotes = [
        { text: 'İlk notunu yazmaya başla ✍️ Notlar tarayıcı hafızasında saklanır.', color: 'purple' },
        { text: 'Bol bol su içmeyi ve derin nefes almayı unutma! 🧘', color: 'cyan' }
      ];
    }

    function renderNotes() {
      notesGrid.innerHTML = '';
      savedNotes.forEach(function(note, idx) {
        var card = document.createElement('div');
        card.className = 'game-card';
        card.style.cssText = 'padding:1.2rem;display:flex;flex-direction:column;gap:0.8rem;border-top:3px solid ' + colorHex[note.color] + ';box-shadow:0 8px 24px rgba(0,0,0,0.3);position:relative;';
        
        var ta = document.createElement('textarea');
        ta.value = note.text;
        ta.style.cssText = 'width:100%;height:100px;background:transparent;border:none;color:#fff;font-family:inherit;font-size:0.85rem;line-height:1.5;resize:none;outline:none;';
        
        ta.addEventListener('input', function() {
          savedNotes[idx].text = ta.value;
          saveNotesToStorage();
        });

        var delBtn = document.createElement('button');
        delBtn.className = 'mini-btn';
        delBtn.innerHTML = '🗑️';
        delBtn.style.cssText = 'align-self:flex-end;padding:3px 8px;font-size:0.75rem;background:rgba(255,107,157,0.1);color:#ff6b9d;border-color:rgba(255,107,157,0.2);margin-top:auto;';
        delBtn.addEventListener('click', function() {
          savedNotes.splice(idx, 1);
          saveNotesToStorage();
          renderNotes();
          toast('🗑️ Not silindi', '#ff6b9d');
        });

        card.appendChild(ta);
        card.appendChild(delBtn);
        notesGrid.appendChild(card);
      });
    }

    function saveNotesToStorage() {
      try {
        localStorage.setItem('dreamscape_notes', JSON.stringify(savedNotes));
      } catch(ex){}
    }

    document.getElementById('btnAddNote').addEventListener('click', function() {
      savedNotes.push({ text: '', color: activeNoteColor });
      saveNotesToStorage();
      renderNotes();
      toast('📌 Yeni not eklendi!', '#00e5ff');
      
      // Auto-focus new note textarea
      setTimeout(function() {
        var textareas = notesGrid.querySelectorAll('textarea');
        if (textareas.length > 0) {
          textareas[textareas.length - 1].focus();
        }
      }, 50);
    });

    renderNotes();
  }
} catch(e) { console.error('StickyNotes error', e); }

/* ══════════════════════════════════════════════════════════
   49. KRİPTO MARKET SİMÜLATÖRÜ
   ══════════════════════════════════════════════════════════ */
try {
  var walletBalanceEl = document.getElementById('walletBalance');
  if (walletBalanceEl) {
    // Wallet configuration with average cost and proportional cost tracking
    var wallet = {
      balance: 10000.0,
      assets: { BTC: 0.0, ETH: 0.0, SOL: 0.0, DOGE: 0.0, ADA: 0.0, AVAX: 0.0 },
      totalSpent: { BTC: 0.0, ETH: 0.0, SOL: 0.0, DOGE: 0.0, ADA: 0.0, AVAX: 0.0 }
    };

    // Initial asset prices
    var prices = { BTC: 67420.0, ETH: 3480.0, SOL: 148.5, DOGE: 0.15, ADA: 0.45, AVAX: 35.0 };
    var trends = { BTC: 1.25, ETH: -0.82, SOL: 4.12, DOGE: -1.45, ADA: 0.50, AVAX: -2.10 };
    
    // Hold last 15 prices for drawing sparklines
    var priceHistory = {
      BTC: Array(15).fill(67420.0),
      ETH: Array(15).fill(3480.0),
      SOL: Array(15).fill(148.5),
      DOGE: Array(15).fill(0.15),
      ADA: Array(15).fill(0.45),
      AVAX: Array(15).fill(35.0)
    };

    // Update cüzdan UI & calculate Total Portfolio and P&L
    function updateWalletUI() {
      walletBalanceEl.textContent = wallet.balance.toFixed(2) + ' CC';
      
      var tokens = ['BTC', 'ETH', 'SOL', 'DOGE', 'ADA', 'AVAX'];
      var totalPortfolioVal = wallet.balance;

      tokens.forEach(function(tok) {
        var qty = wallet.assets[tok];
        var currentPrice = prices[tok];
        var spent = wallet.totalSpent[tok];
        var avgCost = qty > 0 ? spent / qty : 0.0;
        
        // Update quantities & Average Cost in HTML
        var qtyEl = document.getElementById('wallet' + tok);
        var avgEl = document.getElementById('avg' + tok);
        var pnlAssetEl = document.getElementById('pnl' + tok);
        
        if (qtyEl) qtyEl.textContent = qty.toFixed(tok === 'BTC' || tok === 'ETH' ? 4 : 2);
        if (avgEl) avgEl.textContent = avgCost > 0 ? '$' + avgCost.toFixed(tok === 'DOGE' || tok === 'ADA' ? 3 : 2) : '$0.00';
        
        var assetVal = qty * currentPrice;
        totalPortfolioVal += assetVal;

        // P&L for single asset
        if (qty > 0) {
          var assetPNLCC = assetVal - spent;
          var assetPNLPct = (spent > 0 ? (assetVal / spent - 1) * 100 : 0.0);
          if (pnlAssetEl) {
            pnlAssetEl.textContent = (assetPNLCC >= 0 ? '+' : '') + assetPNLCC.toFixed(2) + ' CC (' + (assetPNLPct >= 0 ? '+' : '') + assetPNLPct.toFixed(1) + '%)';
            pnlAssetEl.style.color = assetPNLCC >= 0 ? '#00c853' : '#ff1744';
          }
        } else {
          if (pnlAssetEl) {
            pnlAssetEl.textContent = '--';
            pnlAssetEl.style.color = 'var(--tx3)';
          }
        }
      });

      // Total Portfolio Value and overall P&L
      var totalValEl = document.getElementById('walletValue');
      var totalPNLEl = document.getElementById('walletTotalPNL');
      
      if (totalValEl) totalValEl.textContent = totalPortfolioVal.toFixed(2) + ' CC';
      
      var overallPNLCC = totalPortfolioVal - 10000.0; // P&L relative to initial 10,000 CC capital
      var overallPNLPct = (totalPortfolioVal / 10000.0 - 1) * 100;
      
      if (totalPNLEl) {
        totalPNLEl.textContent = (overallPNLCC >= 0 ? '+' : '') + overallPNLCC.toFixed(2) + ' CC (' + (overallPNLPct >= 0 ? '+' : '') + overallPNLPct.toFixed(2) + '%)';
        totalPNLEl.style.color = overallPNLCC >= 0 ? '#00c853' : '#ff1744';
      }
    }

    // Sparkline Drawing using SVG
    function drawSparkline(tok) {
      var svg = document.getElementById('spark' + tok);
      if (!svg) return;
      var path = svg.querySelector('path');
      if (!path) return;

      var hist = priceHistory[tok];
      var min = Math.min.apply(null, hist);
      var max = Math.max.apply(null, hist);
      var range = max - min;
      if (range === 0) range = 1.0;

      var width = 65;
      var height = 24;
      var padding = 2;

      var points = [];
      for (var i = 0; i < hist.length; i++) {
        var x = (i / (hist.length - 1)) * width;
        var y = height - padding - ((hist[i] - min) / range) * (height - 2 * padding);
        points.push(x + ',' + y);
      }

      path.setAttribute('d', 'M' + points.join(' L'));
      
      var lastChange = trends[tok];
      var color = lastChange >= 0 ? '#00c853' : '#ff1744';
      path.setAttribute('stroke', color);
    }

    // Market fiyatlarını canlı güncelle (500ms intervals!)
    function tickPrices() {
      if (!PAGE_VISIBLE) return;
      
      var tokens = ['BTC', 'ETH', 'SOL', 'DOGE', 'ADA', 'AVAX'];
      tokens.forEach(function(tok) {
        var baseVol = 1.8;
        if (tok === 'DOGE') baseVol = 6.5; // Very high volatility for meme coin!
        if (tok === 'SOL' || tok === 'AVAX') baseVol = 3.0; // Active assets
        
        var pctChange = (Math.random() - 0.495) * baseVol; // Fluctuation range
        prices[tok] = Math.max(0.001, prices[tok] * (1 + pctChange / 100));
        trends[tok] = pctChange;

        // Push to history
        priceHistory[tok].push(prices[tok]);
        if (priceHistory[tok].length > 15) priceHistory[tok].shift();

        // Update UI
        var priceEl = document.getElementById('price' + tok);
        var trendEl = document.getElementById('trend' + tok);
        
        if (priceEl) priceEl.textContent = '$' + prices[tok].toFixed(tok === 'DOGE' || tok === 'ADA' ? 3 : (tok === 'SOL' || tok === 'AVAX' ? 2 : 0));
        if (trendEl) {
          trendEl.textContent = (pctChange >= 0 ? '+' : '') + pctChange.toFixed(2) + '%';
          trendEl.style.color = pctChange >= 0 ? '#00c853' : '#ff1744';
        }

        drawSparkline(tok);
      });

      updateWalletUI();
    }

    // Trade action function
    window.tradeCrypto = function(tok, action) {
      var currentPrice = prices[tok];
      var inputEl = document.getElementById('tradeAmt' + tok);
      if (!inputEl) return;
      
      var tradeAmt = parseFloat(inputEl.value);
      if (isNaN(tradeAmt) || tradeAmt <= 0) {
        toast('⚠️ Geçersiz miktar girdiniz!', '#ff7043');
        return;
      }
      
      if (action === 'buy') {
        var cost = tradeAmt * currentPrice;
        if (wallet.balance < cost) {
          toast('⚠️ Yetersiz Bakiye! Bu işlem için ' + cost.toFixed(2) + ' CC gerekiyor.', '#ff7043');
          return;
        }
        
        wallet.balance -= cost;
        wallet.assets[tok] += tradeAmt;
        wallet.totalSpent[tok] += cost;
        
        updateWalletUI();
        toast('✅ Alındı: ' + tradeAmt + ' ' + tok, '#69f0ae');
      } else {
        if (wallet.assets[tok] < tradeAmt) {
          toast('⚠️ Yetersiz Varlık! Satmak istediğiniz kadar ' + tok + ' yok.', '#ff7043');
          return;
        }
        
        var revenue = tradeAmt * currentPrice;
        
        // Bookkeeping for proportional average cost reduction when selling
        var fractionSold = tradeAmt / wallet.assets[tok];
        wallet.totalSpent[tok] -= wallet.totalSpent[tok] * fractionSold;
        
        wallet.balance += revenue;
        wallet.assets[tok] -= tradeAmt;
        
        updateWalletUI();
        toast('💰 Satıldı: ' + tradeAmt + ' ' + tok, '#ffea00');
      }
    };

    // Binding event listeners dynamically
    var tokensList = ['BTC', 'ETH', 'SOL', 'DOGE', 'ADA', 'AVAX'];
    tokensList.forEach(function(tok) {
      var buyBtn = document.getElementById('btnBuy' + tok);
      var sellBtn = document.getElementById('btnSell' + tok);
      if (buyBtn) {
        buyBtn.addEventListener('click', function(){ tradeCrypto(tok, 'buy'); });
      }
      if (sellBtn) {
        sellBtn.addEventListener('click', function(){ tradeCrypto(tok, 'sell'); });
      }
      // Initialize sparklines
      drawSparkline(tok);
    });

    setInterval(tickPrices, 500); // 500ms ticker interval!
    updateWalletUI();
  }
} catch(e) { console.error('CryptoSimulator error', e); }

/* ══════════════════════════════════════════════════════════
   50. BEDEN KİTLE ENDEKSİ (BKE)
   ══════════════════════════════════════════════════════════ */
try {
  var rangeHeight = document.getElementById('rangeHeight');
  if (rangeHeight) {
    var rangeWeight = document.getElementById('rangeWeight');
    var lblHeight = document.getElementById('lblHeight');
    var lblWeight = document.getElementById('lblWeight');
    
    var bmiScore = document.getElementById('bmiScore');
    var bmiCategory = document.getElementById('bmiCategory');
    var bmiAdvice = document.getElementById('bmiAdvice');

    function calculateBMI() {
      var height = parseInt(rangeHeight.value, 10) / 100; // to meters
      var weight = parseInt(rangeWeight.value, 10);
      
      lblHeight.textContent = rangeHeight.value + ' cm';
      lblWeight.textContent = rangeWeight.value + ' kg';
      
      var score = weight / (height * height);
      bmiScore.textContent = score.toFixed(1);

      if (score < 18.5) {
        bmiCategory.textContent = 'Zayıf';
        bmiCategory.style.cssText = 'background:rgba(0,229,255,0.12); color:#00e5ff; border:1px solid rgba(0,229,255,0.25);';
        bmiAdvice.innerHTML = 'Kilonuz idealin biraz altında. Besleyici gıdalar tüketmeli ve kas yapıcı hafif egzersizler yapmalısınız. <a href="#breathe" style="color:#00e5ff;font-weight:700;">Nefes egzersizi</a> ile zihninizi dinginleştirebilirsiniz.';
      } else if (score >= 18.5 && score < 25.0) {
        bmiCategory.textContent = 'Normal Kilolu';
        bmiCategory.style.cssText = 'background:rgba(0,200,83,0.12); color:#00c853; border:1px solid rgba(0,200,83,0.25);';
        bmiAdvice.innerHTML = 'Tebrikler, harika dengedesiniz! Bu formunuzu korumak için bol su tüketin ve <a href="#zenclock-sec" style="color:#00c853;font-weight:700;">doğa sesleriyle odaklanma</a> egzersizleri yapın.';
      } else if (score >= 25.0 && score < 30.0) {
        bmiCategory.textContent = 'Fazla Kilolu';
        bmiCategory.style.cssText = 'background:rgba(255,234,0,0.12); color:#ffea00; border:1px solid rgba(255,234,0,0.25);';
        bmiAdvice.innerHTML = 'Kilonuz idealin biraz üzerinde. Dengeli beslenme, hafif kardiyo ve <a href="#breathe" style="color:#ffea00;font-weight:700;">Zen nefes ritimleri</a> ile metabolizmanızı destekleyebilirsiniz.';
      } else {
        bmiCategory.textContent = 'Obez';
        bmiCategory.style.cssText = 'background:rgba(255,23,71,0.12); color:#ff1744; border:1px solid rgba(255,23,71,0.25);';
        bmiAdvice.innerHTML = 'Kilonuz sağlık sınırlarının üzerinde bulunuyor. Aktif kalmaya çalışmalı ve bir uzman eşliğinde hareket etmelisiniz. <a href="#breathe" style="color:#ff1744;font-weight:700;">Derin nefes dinlenmeleri</a> stresinizi azaltacaktır.';
      }
    }

    rangeHeight.addEventListener('input', calculateBMI);
    rangeWeight.addEventListener('input', calculateBMI);
    
    // Initial calculate
    calculateBMI();
  }
} catch(e) { console.error('BMI Calculator error', e); }

/* ══════════════════════════════════════════════════════════
   51. İKİLİ İŞİTSEL RİTİM (BINAURAL BEATS)
   ══════════════════════════════════════════════════════════ */
try {
  var btnPlayBB = document.getElementById('btnPlayBB');
  if (btnPlayBB) {
    var rangeCarrier = document.getElementById('rangeCarrier');
    var rangeBeat = document.getElementById('rangeBeat');
    var rangeBBVol = document.getElementById('rangeBBVol');
    
    var lblCarrier = document.getElementById('lblCarrier');
    var lblBeat = document.getElementById('lblBeat');
    var lblBBVol = document.getElementById('lblBBVol');
    
    var bbVisualizer = document.getElementById('bbVisualizer');
    var bbStatusIcon = document.getElementById('bbStatusIcon');
    
    // Audio nodes
    var bbAudioCtx = null;
    var carrierOsc = null;
    var beatOsc = null;
    var bbMerger = null;
    var bbGain = null;
    var bbIsPlaying = false;

    function initBBAudio() {
      bbAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      carrierOsc = bbAudioCtx.createOscillator();
      beatOsc = bbAudioCtx.createOscillator();
      
      carrierOsc.type = 'sine';
      beatOsc.type = 'sine';
      
      var carrierFreq = parseFloat(rangeCarrier.value);
      var beatFreq = parseFloat(rangeBeat.value);
      
      carrierOsc.frequency.setValueAtTime(carrierFreq, bbAudioCtx.currentTime);
      beatOsc.frequency.setValueAtTime(carrierFreq + beatFreq, bbAudioCtx.currentTime);
      
      // Dual channel merger for left/right panning separation
      bbMerger = bbAudioCtx.createChannelMerger(2);
      
      // Connect Sol (Left) -> carrier
      carrierOsc.connect(bbMerger, 0, 0);
      // Connect Sağ (Right) -> beat (carrier + beat diff)
      beatOsc.connect(bbMerger, 0, 1);
      
      bbGain = bbAudioCtx.createGain();
      bbGain.gain.setValueAtTime(parseFloat(rangeBBVol.value) / 100, bbAudioCtx.currentTime);
      
      bbMerger.connect(bbGain);
      bbGain.connect(bbAudioCtx.destination);
      
      carrierOsc.start();
      beatOsc.start();
    }

    function startBB() {
      try {
        initBBAudio();
        bbIsPlaying = true;
        btnPlayBB.textContent = '⏹ Ritmi Durdur';
        btnPlayBB.style.background = 'linear-gradient(135deg, var(--a2), #ff1744)';
        if (bbVisualizer) bbVisualizer.classList.add('playing');
        if (bbStatusIcon) bbStatusIcon.textContent = '🧘';
        toast('🎧 İkili İşitsel Ritim Başlatıldı. Kulaklıklarınızı takın!', '#69f0ae');
      } catch (err) {
        console.error('Binaural beats audio start failed', err);
        toast('⚠️ Ses Sentezleyici başlatılamadı.', '#ff7043');
      }
    }

    function stopBB() {
      bbIsPlaying = false;
      btnPlayBB.textContent = '▶ Ritmi Başlat';
      btnPlayBB.style.background = '';
      if (bbVisualizer) bbVisualizer.classList.remove('playing');
      if (bbStatusIcon) bbStatusIcon.textContent = '🎧';
      
      if (carrierOsc) {
        try { carrierOsc.stop(); } catch(e){}
        carrierOsc.disconnect();
      }
      if (beatOsc) {
        try { beatOsc.stop(); } catch(e){}
        beatOsc.disconnect();
      }
      if (bbGain) bbGain.disconnect();
      if (bbAudioCtx) {
        bbAudioCtx.close();
        bbAudioCtx = null;
      }
      toast('Ritim durduruldu.', '#ffea00');
    }

    btnPlayBB.addEventListener('click', function() {
      if (bbIsPlaying) {
        stopBB();
      } else {
        startBB();
      }
    });

    // Update frequencies on input
    function updateBBFreqs() {
      var carrierVal = parseFloat(rangeCarrier.value);
      var beatVal = parseFloat(rangeBeat.value);
      
      if (lblCarrier) lblCarrier.textContent = carrierVal + ' Hz';
      if (lblBeat) lblBeat.textContent = beatVal + ' Hz';
      
      if (bbIsPlaying && carrierOsc && beatOsc && bbAudioCtx) {
        carrierOsc.frequency.setValueAtTime(carrierVal, bbAudioCtx.currentTime);
        beatOsc.frequency.setValueAtTime(carrierVal + beatVal, bbAudioCtx.currentTime);
      }
    }

    rangeCarrier.addEventListener('input', updateBBFreqs);
    rangeBeat.addEventListener('input', updateBBFreqs);
    
    // Update volume on input
    rangeBBVol.addEventListener('input', function() {
      var volVal = parseFloat(rangeBBVol.value);
      if (lblBBVol) lblBBVol.textContent = volVal + '%';
      if (bbIsPlaying && bbGain && bbAudioCtx) {
        bbGain.gain.setValueAtTime(volVal / 100, bbAudioCtx.currentTime);
      }
    });

    // Preset loaders
    function loadBBPreset(carrier, beat, activeBtnId) {
      rangeCarrier.value = carrier;
      rangeBeat.value = beat;
      updateBBFreqs();
      
      document.querySelectorAll('#binaural-sec .mini-btn').forEach(function(btn) {
        btn.classList.remove('active');
      });
      var activeBtn = document.getElementById(activeBtnId);
      if (activeBtn) activeBtn.classList.add('active');
      
      toast('Preset yüklendi: ' + (beat) + 'Hz Beat', '#00e5ff');
    }

    var pFocus = document.getElementById('bbPresetFocus');
    if (pFocus) pFocus.addEventListener('click', function(){ loadBBPreset(200, 10, 'bbPresetFocus'); });
    
    var pMed = document.getElementById('bbPresetMed');
    if (pMed) pMed.addEventListener('click', function(){ loadBBPreset(150, 6, 'bbPresetMed'); });
    
    var pSleep = document.getElementById('bbPresetSleep');
    if (pSleep) pSleep.addEventListener('click', function(){ loadBBPreset(100, 2.5, 'bbPresetSleep'); });
    
    var pRelax = document.getElementById('bbPresetRelax');
    if (pRelax) pRelax.addEventListener('click', function(){ loadBBPreset(200, 8, 'bbPresetRelax'); });
  }
} catch(e) { console.error('BinauralBeats error', e); }

/* ══════════════════════════════════════════════════════════
   52. ZEN GÜNLÜK SU TAKİPÇİSİ (WATER TRACKER)
   ══════════════════════════════════════════════════════════ */
try {
  var waterTotalText = document.getElementById('waterTotalText');
  if (waterTotalText) {
    var waterLiquid = document.getElementById('waterLiquid');
    var waterPercent = document.getElementById('waterPercent');
    var waterLogList = document.getElementById('waterLogList');
    var inputCustomWater = document.getElementById('inputCustomWater');
    
    var waterGoal = 2500;
    var waterTotal = 0;
    var waterLogs = [];

    // Load logs from LocalStorage
    function loadWaterData() {
      var dateKey = 'zen_water_' + new Date().toDateString().replace(/ /g, '_');
      try {
        var stored = localStorage.getItem(dateKey);
        if (stored) {
          var parsed = JSON.parse(stored);
          waterTotal = parsed.total || 0;
          waterLogs = parsed.logs || [];
        } else {
          waterTotal = 0;
          waterLogs = [];
        }
      } catch (err) {
        waterTotal = 0;
        waterLogs = [];
      }
      updateWaterUI();
    }

    function saveWaterData() {
      var dateKey = 'zen_water_' + new Date().toDateString().replace(/ /g, '_');
      var data = { total: waterTotal, logs: waterLogs };
      try {
        localStorage.setItem(dateKey, JSON.stringify(data));
      } catch (err) {
        console.error('Failed to save water tracking logs', err);
      }
    }

    function updateWaterUI() {
      if (waterTotalText) waterTotalText.textContent = waterTotal + ' / ' + waterGoal + ' ml';
      
      var pct = Math.min(100, Math.round((waterTotal / waterGoal) * 100));
      if (waterPercent) waterPercent.textContent = pct + '%';
      if (waterLiquid) waterLiquid.style.height = pct + '%';
      
      // Render list
      if (waterLogList) {
        waterLogList.innerHTML = '';
        if (waterLogs.length === 0) {
          waterLogList.innerHTML = '<div style="color: var(--tx3); text-align: center; font-style: italic; padding: 10px 0;">Henüz kayıt yok. Sağlığınız için su için!</div>';
          return;
        }
        
        waterLogs.forEach(function(item, idx) {
          var row = document.createElement('div');
          row.style.cssText = 'display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.02); padding: 5px 8px; border-radius:6px; border:1px solid rgba(255,255,255,0.04); margin-bottom:2px;';
          row.innerHTML = '<span>💧 ' + item.amount + ' ml</span><span style="color:var(--tx3);">' + item.time + '</span>';
          waterLogList.appendChild(row);
        });
      }
    }

    function addWater(amount) {
      if (isNaN(amount) || amount <= 0) return;
      var now = new Date();
      var timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      
      waterTotal += amount;
      waterLogs.unshift({ amount: amount, time: timeStr });
      
      saveWaterData();
      updateWaterUI();
      toast('💧 +' + amount + ' ml su eklendi!', '#00e5ff');
    }

    document.getElementById('btnAddWater250').addEventListener('click', function(){ addWater(250); });
    document.getElementById('btnAddWater500').addEventListener('click', function(){ addWater(500); });
    document.getElementById('btnAddWater750').addEventListener('click', function(){ addWater(750); });
    
    document.getElementById('btnAddWaterCustom').addEventListener('click', function() {
      if (inputCustomWater) {
        var val = parseInt(inputCustomWater.value, 10);
        if (isNaN(val) || val <= 0) {
          toast('⚠️ Lütfen geçerli bir miktar girin.', '#ff7043');
          return;
        }
        addWater(val);
        inputCustomWater.value = '';
      }
    });

    document.getElementById('btnResetWater').addEventListener('click', function() {
      waterTotal = 0;
      waterLogs = [];
      saveWaterData();
      updateWaterUI();
      toast('Tüketim kaydı sıfırlandı.', '#ffea00');
    });

    loadWaterData();
  }
} catch(e) { console.error('WaterTracker error', e); }

/* ══════════════════════════════════════════════════════════
   53. ZEN YAPILACAKLAR (TODO LIST)
   ══════════════════════════════════════════════════════════ */
try {
  var todoList = document.getElementById('todoList');
  if (todoList) {
    var todoInput = document.getElementById('todoInput');
    var btnTodoAdd = document.getElementById('btnTodoAdd');
    var todoProgressBar = document.getElementById('todoProgressBar');
    var todoProgressText = document.getElementById('todoProgressText');
    var todoQuote = document.getElementById('todoQuote');
    
    var todos = [];
    var todoFilter = 'all';

    var quotesList = [
      'Odaklanma başarının anahtarıdır. 🌟',
      'Zihnini hafiflet, hedeflerine ulaş! 🧘',
      'Her küçük adım büyük bir fark yaratır. 🌿',
      'Odaklan ve anı yaşa. ✨',
      'Sadelik, zihinsel güçtür. 💫',
      'Bugünün işini yarına bırakma. 🔥',
      'Huzurlu bir zihin, verimli bir gündür. 🌀'
    ];

    function loadTodos() {
      try {
        var stored = localStorage.getItem('zen_todo_list');
        if (stored) {
          todos = JSON.parse(stored);
        } else {
          // Add default starter todos
          todos = [
            { id: 1, text: 'Nefes egzersizi yap 🌿', completed: false },
            { id: 2, text: 'Bol su tüket 💧', completed: true },
            { id: 3, text: 'Kozmik borsa simülatörünü incele 🪙', completed: false }
          ];
        }
      } catch (err) {
        todos = [];
      }
      renderTodos();
    }

    function saveTodos() {
      try {
        localStorage.setItem('zen_todo_list', JSON.stringify(todos));
      } catch (err) {
        console.error('Failed to save todos', err);
      }
    }

    function renderTodos() {
      todoList.innerHTML = '';
      
      var filtered = todos.filter(function(t) {
        if (todoFilter === 'active') return !t.completed;
        if (todoFilter === 'completed') return t.completed;
        return true;
      });

      if (filtered.length === 0) {
        var empty = document.createElement('li');
        empty.style.cssText = 'color:var(--tx3); text-align:center; font-style:italic; padding: 20px 0;';
        empty.textContent = todoFilter === 'completed' ? 'Tamamlanan görev bulunmuyor.' : (todoFilter === 'active' ? 'Tüm görevler tamamlandı! 🎉' : 'Listeniz bomboş. Yeni bir hedef ekleyin!');
        todoList.appendChild(empty);
      } else {
        filtered.forEach(function(todo) {
          var li = document.createElement('li');
          li.style.cssText = 'display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.04); padding:10px 14px; border-radius:10px; transition:var(--t); cursor:pointer;';
          li.className = 'todo-item' + (todo.completed ? ' completed' : '');
          if (todo.completed) {
            li.style.background = 'rgba(255,255,255,0.01)';
            li.style.borderColor = 'transparent';
          }
          
          var left = document.createElement('div');
          left.style.cssText = 'display:flex; align-items:center; gap:10px;';
          
          var cb = document.createElement('div');
          cb.style.cssText = 'width:18px; height:18px; border-radius:50%; border:2px solid var(--a1); display:flex; align-items:center; justify-content:center; font-size:0.65rem; transition:var(--t);';
          if (todo.completed) {
            cb.style.background = 'var(--a4)';
            cb.style.borderColor = 'var(--a4)';
            cb.textContent = '✓';
          }
          
          var txt = document.createElement('span');
          txt.textContent = todo.text;
          txt.style.fontSize = '0.85rem';
          if (todo.completed) {
            txt.style.textDecoration = 'line-through';
            txt.style.color = 'var(--tx3)';
          }
          
          left.appendChild(cb);
          left.appendChild(txt);
          
          var del = document.createElement('button');
          del.innerHTML = '🗑️';
          del.style.cssText = 'background:none; border:none; color:var(--tx3); cursor:pointer; font-size:0.9rem; transition:var(--t); padding: 2px 6px;';
          del.addEventListener('click', function(e) {
            e.stopPropagation();
            deleteTodo(todo.id);
          });
          del.addEventListener('mouseenter', function(){ del.style.color = 'var(--a2)'; });
          del.addEventListener('mouseleave', function(){ del.style.color = 'var(--tx3)'; });

          li.appendChild(left);
          li.appendChild(del);
          
          li.addEventListener('click', function() {
            toggleTodo(todo.id);
          });

          todoList.appendChild(li);
        });
      }

      // Update progress bar
      var total = todos.length;
      var completed = todos.filter(function(t){ return t.completed; }).length;
      var pct = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      if (todoProgressBar) todoProgressBar.style.width = pct + '%';
      if (todoProgressText) todoProgressText.textContent = 'Tamamlanan: ' + completed + ' / ' + total + ' (%' + pct + ')';
    }

    function addTodo() {
      var text = todoInput.value.trim();
      if (!text) {
        toast('⚠️ Lütfen bir görev tanımı yazın.', '#ff7043');
        return;
      }
      
      var newTodo = {
        id: Date.now(),
        text: text,
        completed: false
      };
      
      todos.push(newTodo);
      todoInput.value = '';
      saveTodos();
      renderTodos();
      toast('📝 Görev eklendi!', '#69f0ae');
    }

    function toggleTodo(id) {
      todos = todos.map(function(t) {
        if (t.id === id) {
          var newStatus = !t.completed;
          if (newStatus && todoQuote) {
            // Select random motivation quote
            todoQuote.textContent = quotesList[Math.floor(Math.random() * quotesList.length)];
          }
          return { id: t.id, text: t.text, completed: newStatus };
        }
        return t;
      });
      saveTodos();
      renderTodos();
    }

    function deleteTodo(id) {
      todos = todos.filter(function(t){ return t.id !== id; });
      saveTodos();
      renderTodos();
      toast('Görev silindi.', '#ffea00');
    }

    btnTodoAdd.addEventListener('click', addTodo);
    todoInput.addEventListener('keydown', function(e){ if (e.key === 'Enter') addTodo(); });

    document.getElementById('btnTodoClear').addEventListener('click', function() {
      var initialLen = todos.length;
      todos = todos.filter(function(t){ return t.completed; });
      if (todos.length < initialLen) {
        saveTodos();
        renderTodos();
        toast('Tamamlananlar temizlendi!', '#7c4dff');
      }
    });

    // Filters
    function applyFilter(f, btnId) {
      todoFilter = f;
      document.querySelectorAll('#todo-sec .mini-btn').forEach(function(b) {
        if(b.id !== 'btnTodoClear') b.classList.remove('active');
      });
      var btn = document.getElementById(btnId);
      if (btn) btn.classList.add('active');
      renderTodos();
    }

    document.getElementById('todoFilterAll').addEventListener('click', function(){ applyFilter('all', 'todoFilterAll'); });
    document.getElementById('todoFilterActive').addEventListener('click', function(){ applyFilter('active', 'todoFilterActive'); });
    document.getElementById('todoFilterCompleted').addEventListener('click', function(){ applyFilter('completed', 'todoFilterCompleted'); });

    loadTodos();
  }
} catch(e) { console.error('Todo error', e); }

/* ══════════════════════════════════════════════════════════
   58. KOZMİK YERÇEKİMİ SANDBOXI (N-BODY GRAVITY SIMULATOR)
   ══════════════════════════════════════════════════════════ */
try {
  var gravityCanvas = document.getElementById('gravityCanvas');
  if (gravityCanvas) {
    var gCtx = gravityCanvas.getContext('2d');
    var spawnPlanetBtn = document.getElementById('gravitySpawnPlanet');
    var spawnStarBtn = document.getElementById('gravitySpawnStar');
    var spawnBHBtn = document.getElementById('gravitySpawnBH');
    var presetSolarBtn = document.getElementById('gravityPresetSolar');
    var presetBinaryBtn = document.getElementById('gravityPresetBinary');
    var presetChaosBtn = document.getElementById('gravityPresetChaos');
    var btnGravityTrails = document.getElementById('btnGravityTrails');
    var btnGravityClear = document.getElementById('btnGravityClear');

    var gw = gravityCanvas.width;
    var gh = gravityCanvas.height;

    // Simulation states
    var bodies = [];
    var G = 0.15; // Gravitational constant
    var softening = 12; // Prevents division by zero or extreme velocity spikes
    var drawTrails = true;
    var activeSpawnType = 'planet'; // planet, star, bh

    // Slingshot variables
    var isDragging = false;
    var dragStart = { x: 0, y: 0 };
    var dragCurrent = { x: 0, y: 0 };

    // Set interactive canvas scale
    function getCanvasCoordinates(clientX, clientY) {
      var rect = gravityCanvas.getBoundingClientRect();
      return {
        x: (clientX - rect.left) * (gw / rect.width),
        y: (clientY - rect.top) * (gh / rect.height)
      };
    }

    // Body constructor
    function Body(x, y, vx, vy, mass, type) {
      this.id = Math.random().toString(36).substr(2, 9);
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.mass = mass;
      this.type = type; // 'planet', 'star', 'bh'
      
      // Dynamic visual attributes
      if (type === 'planet') {
        this.radius = Math.max(4, Math.pow(mass, 0.4) * 1.2);
        this.color = '#69f0ae';
        this.glow = '#69f0ae';
      } else if (type === 'star') {
        this.radius = Math.max(10, Math.pow(mass, 0.35) * 1.5);
        this.color = '#ffea00';
        this.glow = '#ffea00';
      } else { // black hole
        this.radius = Math.max(12, Math.pow(mass, 0.32) * 1.6);
        this.color = '#a29bfe';
        this.glow = '#7c4dff';
      }

      this.trail = [];
    }

    // Add preset templates
    function loadPreset(presetName) {
      bodies = [];
      var cx = gw / 2;
      var cy = gh / 2;

      if (presetName === 'solar') {
        // Central Star
        bodies.push(new Body(cx, cy, 0, 0, 1500, 'star'));
        
        // Planet 1 (Inner, Fast)
        // Orbit speed: v = sqrt(G * M / r)
        var r1 = 100;
        var v1 = Math.sqrt((G * 1500) / r1);
        bodies.push(new Body(cx, cy - r1, v1, 0, 15, 'planet'));

        // Planet 2 (Middle)
        var r2 = 160;
        var v2 = Math.sqrt((G * 1500) / r2);
        bodies.push(new Body(cx, cy - r2, v2, 0, 45, 'planet'));

        // Planet 3 (Outer, with a tiny Moon!)
        var r3 = 240;
        var v3 = Math.sqrt((G * 1500) / r3);
        var planet3 = new Body(cx, cy - r3, v3, 0, 80, 'planet');
        bodies.push(planet3);
        
        // Moon orbiting Planet 3
        var rm = 20;
        var vm = Math.sqrt((G * 80) / rm); // Relative velocity to planet
        bodies.push(new Body(cx, cy - r3 - rm, v3 + vm, 0, 0.5, 'planet'));

        toast('Güneş Sistemi yörüngeleri yerleştirildi. 🌌', '#69f0ae');
      } 
      else if (presetName === 'binary') {
        // Two equal stars dancing around center of mass
        var dist = 110;
        var mass = 800;
        var orbitSpeed = Math.sqrt((G * mass) / (2 * dist));

        bodies.push(new Body(cx - dist, cy, 0, orbitSpeed, mass, 'star'));
        bodies.push(new Body(cx + dist, cy, 0, -orbitSpeed, mass, 'star'));

        toast('Çift Yıldız dansı simüle ediliyor. ♊', '#ffea00');
      } 
      else if (presetName === 'chaos') {
        // Chaotic Three-Body Problem (Lagrange triangular coordinates)
        var d = 130;
        var mass = 1000;
        var speedVal = 1.35; // Fine-tuned chaotic orbit velocity

        bodies.push(new Body(cx, cy - d, -speedVal, 0, mass, 'star'));
        bodies.push(new Body(cx - d * 0.86, cy + d * 0.5, speedVal * 0.5, -speedVal * 0.86, mass, 'star'));
        bodies.push(new Body(cx + d * 0.86, cy + d * 0.5, speedVal * 0.5, speedVal * 0.86, mass, 'star'));

        toast('Üç-Cisim Problemi kaotik yörüngeleri başladı! 🌀', '#7c4dff');
      }
    }

    // Initialize with solar preset
    loadPreset('solar');

    // Select active type controls
    function setSpawnType(type, btn) {
      activeSpawnType = type;
      document.querySelectorAll('#gravity-sec .mini-btn').forEach(function(b) {
        if (b.id.indexOf('gravitySpawn') !== -1) {
          b.classList.remove('active');
          b.style.borderColor = '';
        }
      });
      btn.classList.add('active');
      if (type === 'planet') btn.style.borderColor = 'rgba(105,240,174,0.3)';
      else if (type === 'star') btn.style.borderColor = 'rgba(255,234,0,0.3)';
      else btn.style.borderColor = 'rgba(124,77,255,0.3)';
    }

    spawnPlanetBtn.addEventListener('click', function(){ setSpawnType('planet', spawnPlanetBtn); });
    spawnStarBtn.addEventListener('click', function(){ setSpawnType('star', spawnStarBtn); });
    spawnBHBtn.addEventListener('click', function(){ setSpawnType('bh', spawnBHBtn); });

    // Presets listeners
    presetSolarBtn.addEventListener('click', function(){ loadPreset('solar'); });
    presetBinaryBtn.addEventListener('click', function(){ loadPreset('binary'); });
    presetChaosBtn.addEventListener('click', function(){ loadPreset('chaos'); });

    // Switch trails
    btnGravityTrails.addEventListener('click', function() {
      drawTrails = !drawTrails;
      btnGravityTrails.textContent = drawTrails ? '💫 Yörünge İzleri: Açık' : '💫 Yörünge İzleri: Kapalı';
      if (!drawTrails) {
        bodies.forEach(function(b) { b.trail = []; });
      }
      toast(drawTrails ? 'Yörünge izleri açıldı.' : 'Yörünge izleri gizlendi.', '#00e5ff');
    });

    btnGravityClear.addEventListener('click', function() {
      bodies = [];
      toast('Tüm evren boşaltıldı.', '#ff1744');
    });

    // Capture Drag slingshot actions
    gravityCanvas.addEventListener('mousedown', function(e) {
      isDragging = true;
      var pos = getCanvasCoordinates(e.clientX, e.clientY);
      dragStart = pos;
      dragCurrent = pos;
    });

    gravityCanvas.addEventListener('mousemove', function(e) {
      if (isDragging) {
        dragCurrent = getCanvasCoordinates(e.clientX, e.clientY);
      }
    });

    document.addEventListener('mouseup', function(e) {
      if (isDragging) {
        isDragging = false;
        var endPos = getCanvasCoordinates(e.clientX, e.clientY);
        
        // Calculate launching velocity vector (pulling back shoots forward like a slingshot)
        var vx = (dragStart.x - endPos.x) * 0.08;
        var vy = (dragStart.y - endPos.y) * 0.08;

        // Choose mass depending on spawning active type
        var mass = 30;
        if (activeSpawnType === 'star') mass = 800;
        else if (activeSpawnType === 'bh') mass = 12000;

        // Create and register body
        bodies.push(new Body(dragStart.x, dragStart.y, vx, vy, mass, activeSpawnType));
        toast('Yeni cisim fırlatıldı! 🚀', '#69f0ae');
      }
    });

    // Touch events support for slingshot
    gravityCanvas.addEventListener('touchstart', function(e) {
      isDragging = true;
      var touch = e.touches[0];
      var pos = getCanvasCoordinates(touch.clientX, touch.clientY);
      dragStart = pos;
      dragCurrent = pos;
    });

    gravityCanvas.addEventListener('touchmove', function(e) {
      if (isDragging) {
        var touch = e.touches[0];
        dragCurrent = getCanvasCoordinates(touch.clientX, touch.clientY);
      }
    });

    gravityCanvas.addEventListener('touchend', function(e) {
      if (isDragging) {
        isDragging = false;
        // Launch using last recorded coordinates
        var vx = (dragStart.x - dragCurrent.x) * 0.08;
        var vy = (dragStart.y - dragCurrent.y) * 0.08;

        var mass = 30;
        if (activeSpawnType === 'star') mass = 800;
        else if (activeSpawnType === 'bh') mass = 12000;

        bodies.push(new Body(dragStart.x, dragStart.y, vx, vy, mass, activeSpawnType));
      }
    });

    // ── PHYSICS INTEGRATOR ENGINE ────────────────────────────
    function updateGravityPhysics() {
      var n = bodies.length;
      if (n === 0) return;

      // 1. Calculate N-Body gravitational forces and accumulate acceleration vectors
      for (var i = 0; i < n; i++) {
        var b1 = bodies[i];
        for (var j = i + 1; j < n; j++) {
          var b2 = bodies[j];

          var dx = b2.x - b1.x;
          var dy = b2.y - b1.y;
          var distSq = dx * dx + dy * dy;
          var dist = Math.sqrt(distSq);

          // Merge bodies upon overlapping collision! (Larger eats smaller)
          if (dist < b1.radius + b2.radius) {
            var eater = b1.mass >= b2.mass ? b1 : b2;
            var food = b1.mass >= b2.mass ? b2 : b1;

            // Conservation of Momentum: v_new = (m1*v1 + m2*v2) / (m1+m2)
            var totalMass = eater.mass + food.mass;
            eater.vx = (eater.vx * eater.mass + food.vx * food.mass) / totalMass;
            eater.vy = (eater.vy * eater.mass + food.vy * food.mass) / totalMass;

            // Center of Mass Position: x_new = (m1*x1 + m2*x2) / (m1+m2)
            eater.x = (eater.x * eater.mass + food.x * food.mass) / totalMass;
            eater.y = (eater.y * eater.mass + food.y * food.mass) / totalMass;

            eater.mass = totalMass;
            
            // Scale up visuals slightly
            if (eater.type === 'planet') {
              eater.radius = Math.max(4, Math.pow(totalMass, 0.4) * 1.2);
            } else if (eater.type === 'star') {
              eater.radius = Math.max(10, Math.pow(totalMass, 0.35) * 1.5);
            } else {
              eater.radius = Math.max(12, Math.pow(totalMass, 0.32) * 1.6);
            }

            // Remove absorbed food body
            bodies.splice(bodies.indexOf(food), 1);
            n--; // decrement length index
            
            toast('💥 Cisim çarpışması! Dev yutma gerçekleşti.', '#ff7043');
            break;
          }

          // Acceleration Math with softening factor to guarantee zero division exceptions
          var distSoftSq = distSq + (softening * softening);
          var force = (G * b1.mass * b2.mass) / distSoftSq;

          var forceX = force * (dx / (dist + 0.001));
          var forceY = force * (dy / (dist + 0.001));

          // b1 gains velocity
          b1.vx += forceX / b1.mass;
          b1.vy += forceY / b1.mass;

          // b2 gains equal opposite velocity
          b2.vx -= forceX / b2.mass;
          b2.vy -= forceY / b2.mass;
        }
      }

      // 2. Translate coordinates & record trails
      bodies.forEach(function(b) {
        b.x += b.vx;
        b.y += b.vy;

        // Slowly decay velocity if out of logical space bounds to attract back
        if (Math.abs(b.x - cx) > 1000 || Math.abs(b.y - cy) > 1000) {
          b.vx *= 0.98;
          b.vy *= 0.98;
        }

        if (drawTrails) {
          b.trail.push({ x: b.x, y: b.y });
          if (b.trail.length > 100) {
            b.trail.shift();
          }
        }
      });
    }

    var cx = gw / 2;
    var cy = gh / 2;

    // ── RENDER ENGINE ────────────────────────────────────────
    function drawGravity() {
      if (!isCanvasActive('gravityCanvas')) return;

      // Draw trails or clear space
      gCtx.fillStyle = '#030408';
      gCtx.fillRect(0, 0, gw, gh);

      // Perform mechanics equations updates
      updateGravityPhysics();

      // 1. Draw yörünge izleri (trails)
      if (drawTrails) {
        bodies.forEach(function(b) {
          if (b.trail.length < 2) return;
          gCtx.strokeStyle = b.color;
          gCtx.lineWidth = 1.0;
          gCtx.globalAlpha = 0.28;
          gCtx.beginPath();
          gCtx.moveTo(b.trail[0].x, b.trail[0].y);
          for (var k = 1; k < b.trail.length; k++) {
            gCtx.lineTo(b.trail[k].x, b.trail[k].y);
          }
          gCtx.stroke();
          gCtx.globalAlpha = 1.0; // restore alpha
        });
      }

      // 2. Draw active slingshot rubber band line
      if (isDragging) {
        gCtx.strokeStyle = 'rgba(255,255,255,0.45)';
        gCtx.lineWidth = 1.5;
        gCtx.setLineDash([4, 4]);
        gCtx.beginPath();
        gCtx.moveTo(dragStart.x, dragStart.y);
        gCtx.lineTo(dragCurrent.x, dragCurrent.y);
        gCtx.stroke();
        gCtx.setLineDash([]); // clear dash

        // Draw visual size guide
        gCtx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        gCtx.beginPath();
        var tempRadius = activeSpawnType === 'planet' ? 6 : (activeSpawnType === 'star' ? 18 : 22);
        gCtx.arc(dragStart.x, dragStart.y, tempRadius, 0, Math.PI * 2);
        gCtx.fill();
      }

      // 3. Draw bodies
      bodies.forEach(function(b) {
        gCtx.save();
        gCtx.shadowBlur = b.type === 'planet' ? 8 : (b.type === 'star' ? 20 : 35);
        gCtx.shadowColor = b.glow;

        if (b.type === 'bh') {
          // Render black hole with purple glowing aura Ring
          var radGrad = gCtx.createRadialGradient(b.x, b.y, b.radius * 0.2, b.x, b.y, b.radius);
          radGrad.addColorStop(0, '#000000');
          radGrad.addColorStop(0.5, '#000000');
          radGrad.addColorStop(0.7, '#7c4dff');
          radGrad.addColorStop(1, 'rgba(162,155,254,0.0)');
          gCtx.fillStyle = radGrad;
          gCtx.beginPath();
          gCtx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
          gCtx.fill();
        } else {
          // Normal star/planet solids
          gCtx.fillStyle = b.color;
          gCtx.beginPath();
          gCtx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
          gCtx.fill();
        }

        gCtx.restore();
      });
    }

    // Animation Tick Loop
    function gravityLoop() {
      drawGravity();
      requestAnimationFrame(gravityLoop);
    }
    gravityLoop();
  }
} catch(e) { console.error('GravitySandbox error', e); }

/* ══════════════════════════════════════════════════════════
   54. NEBULA ANSİKLOPEDİSİ
   ══════════════════════════════════════════════════════════ */
try {
  var nebulaTabs = document.querySelectorAll('.nebula-tab');
  if (nebulaTabs.length > 0) {
    var NEB_DATA = {
      orion: {
        title: 'Orion Nebulası', catalog: 'M42', dist: '1344 IY', size: '24 IY', discovery: '1610',
        bg: 'radial-gradient(circle at 30% 40%, rgba(124,77,255,0.45), transparent 60%), radial-gradient(circle at 70% 60%, rgba(255,107,157,0.45), transparent 60%)',
        desc: 'Orion Bulutsusu, Samanyolu Galaksisi\'nde yer alan devasa bir dağınık bulutsudur. Dünya\'ya en yakın aktif yıldız oluşum bölgesi olduğu için yıldız doğumlarının incelenmesinde kritik rol oynar.'
      },
      crab: {
        title: 'Yengeç Nebulası', catalog: 'M1', dist: '6500 IY', size: '11 IY', discovery: '1731',
        bg: 'radial-gradient(circle at 40% 30%, rgba(0,229,255,0.45), transparent 60%), radial-gradient(circle at 60% 70%, rgba(124,77,255,0.45), transparent 60%)',
        desc: 'Yengeç Bulutsusu, 1054 yılında Çinli astronomlar tarafından gündüz gözüyle görüldüğü kaydedilen tarihi bir süpernova patlamasının kalıntısıdır. Merkezinde saniyede 30 kez dönen bir pulsar yer alır.'
      },
      helix: {
        title: 'Sarmal Nebula', catalog: 'NGC 7293', dist: '650 IY', size: '2.5 IY', discovery: '1824',
        bg: 'radial-gradient(circle at 50% 50%, rgba(255,234,0,0.35), rgba(255,107,157,0.45) 50%, transparent 80%)',
        desc: 'Sarmal Bulutsusu, "Tanrının Gözü" olarak da anılır. Güneş benzeri bir yıldızın ömrünün sonuna geldiğinde dış katmanlarını uzaya fırlatmasıyla oluşmuş görkemli bir gezegenimsi bulutsudur.'
      },
      eagle: {
        title: 'Kartal Nebulası', catalog: 'M16', dist: '7000 IY', size: '70 IY', discovery: '1745',
        bg: 'radial-gradient(circle at 30% 60%, rgba(105,240,174,0.45), transparent 60%), radial-gradient(circle at 70% 40%, rgba(0,229,255,0.45), transparent 60%)',
        desc: 'Kartal Bulutsusu, aktif bir yıldız oluşum bölgesidir. İçerisinde Hubble Teleskobu tarafından görüntülenen ve yıldız tohumlarının filizlendiği devasa gaz sütunları olan meşhur "Yaratılış Sütunları"nı barındırır.'
      }
    };

    function selectNebula(key) {
      var d = NEB_DATA[key];
      if (!d) return;
      
      document.getElementById('nebulaTitle').textContent = d.title;
      document.getElementById('nebulaCatalog').textContent = d.catalog;
      document.getElementById('nebulaDist').textContent = d.dist;
      document.getElementById('nebulaSize').textContent = d.size;
      document.getElementById('nebulaDiscovery').textContent = d.discovery;
      document.getElementById('nebulaDesc').textContent = d.desc;
      
      var backdrop = document.getElementById('nebulaBackdrop');
      if (backdrop) {
        backdrop.style.background = d.bg;
      }
      
      nebulaTabs.forEach(function(tab) {
        tab.classList.remove('active');
        tab.style.borderLeft = '';
        if (tab.dataset.neb === key) {
          tab.classList.add('active');
          tab.style.borderLeft = '3px solid var(--a3)';
        }
      });
    }

    nebulaTabs.forEach(function(tab) {
      tab.addEventListener('click', function() {
        selectNebula(tab.dataset.neb);
      });
    });
  }
} catch(e) { console.error('NebulaCatalog error', e); }

/* ══════════════════════════════════════════════════════════
   55. EVRENİN ÖLÇEĞİ (SCALE OF THE UNIVERSE)
   ══════════════════════════════════════════════════════════ */
try {
  var rangeScale = document.getElementById('rangeScale');
  if (rangeScale) {
    var scaleTitle = document.getElementById('scaleTitle');
    var scaleUnit = document.getElementById('scaleUnit');
    var scaleDesc = document.getElementById('scaleDesc');
    var scaleGraphic = document.getElementById('scaleGraphic');
    var scaleMidCircle = document.getElementById('scaleMidCircle');
    var scaleOuterCircle = document.getElementById('scaleOuterCircle');

    var SCALE_DATA = [
      { name: 'Kuark', unit: '10⁻¹⁸ metre', graphic: '⚛️', desc: 'Evrendeki bilinen en temel parçacıklardan biridir. Proton ve nötronları oluştururlar. Tek başlarına serbest halde bulunamazlar.', mid: '40px', outer: '90px' },
      { name: 'Proton', unit: '10⁻¹⁵ metre', graphic: '🪐', desc: 'Atom çekirdeğini oluşturan artı yüklü parçacıktır. Üç kuarkın güçlü nükleer kuvvetle birleşmesiyle oluşur.', mid: '55px', outer: '110px' },
      { name: 'Hidrojen Atomu', unit: '10⁻¹⁰ metre', graphic: '⚛️', desc: 'Evrendeki en basit ve en bol bulunan elementtir. Bir proton ve çevresindeki bir elektrondan oluşur.', mid: '70px', outer: '130px' },
      { name: 'DNA Sarmalı', unit: '10⁻⁹ metre', graphic: '🧬', desc: 'Tüm canlı organizmaların genetik kodlarını taşıyan çift sarmallı dev moleküldür. Hücrelerin yönetici merkezidir.', mid: '85px', outer: '150px' },
      { name: 'Alyuvar Hücresi', unit: '10⁻⁵ metre', graphic: '🔴', desc: 'Kanımızda oksijen taşımakla görevli kırmızı hücrelerdir. Çapları yaklaşık 7 mikrometredir.', mid: '100px', outer: '165px' },
      { name: 'İnsan Boyutu', unit: '10⁰ metre', graphic: '👤', desc: 'Kozmik cetvelin tam ortasında, mikro-kozmos ile makro-kozmosun kesişim noktasındaki karmaşık yaşam formuyuz.', mid: '115px', outer: '175px' },
      { name: 'Dünya', unit: '10⁷ metre', graphic: '🌍', desc: 'Üzerinde yaşadığımız, yaşam barındırdığı bilinen tek mavi gök cismidir. Çapı yaklaşık 12.742 kilometredir.', mid: '130px', outer: '180px' },
      { name: 'Güneş Sistemi', unit: '10¹³ metre', graphic: '☀️', desc: 'Merkezinde Güneş\'in olduğu, çekim gücüyle bağlı sekiz gezegen ve uydularından oluşan kozmik mahallemiz.', mid: '145px', outer: '185px' },
      { name: 'Samanyolu Galaksisi', unit: '10²¹ metre', graphic: '🌌', desc: 'Güneşimizin de dahil olduğu, yüz milyarlarca yıldız barındıran sarmal yapılı dev gök ada sistemidir.', mid: '160px', outer: '190px' },
      { name: 'Gözlemlenebilir Evren', unit: '10²⁶ metre', graphic: '🌌', desc: 'Büyük Patlama\'dan bu yana ışığı bize ulaşabilen tüm evren bölümüdür. Genişliği yaklaşık 93 milyar ışık yılıdır.', mid: '175px', outer: '195px' }
    ];

    function updateScale() {
      var idx = parseInt(rangeScale.value, 10);
      var item = SCALE_DATA[idx];
      if (!item) return;

      scaleTitle.textContent = item.name;
      scaleUnit.textContent = item.unit;
      scaleDesc.textContent = item.desc;
      scaleGraphic.textContent = item.graphic;
      
      // Animate circles size to reflect relative scale changes
      scaleMidCircle.style.width = item.mid;
      scaleMidCircle.style.height = item.mid;
      scaleOuterCircle.style.width = item.outer;
      scaleOuterCircle.style.height = item.outer;
    }

    rangeScale.addEventListener('input', updateScale);
    updateScale();
  }
} catch(e) { console.error('UniverseScale error', e); }

/* ══════════════════════════════════════════════════════════
   56. KAOS TEORİSİ & SERPINSKI FRAKTALI
   ══════════════════════════════════════════════════════════ */
try {
  var chaosCanvas = document.getElementById('chaosCanvas');
  if (chaosCanvas) {
    var cCtx = chaosCanvas.getContext('2d');
    var btnChaosStart = document.getElementById('btnChaosStart');
    var btnChaosClear = document.getElementById('btnChaosClear');
    var rangeChaosSpeed = document.getElementById('rangeChaosSpeed');
    var lblChaosSpeed = document.getElementById('lblChaosSpeed');
    var chaosPointCount = document.getElementById('chaosPointCount');

    var chaosRunning = false;
    var chaosAnimId = null;
    var curPoint = { x: 200, y: 180 };
    var totalPoints = 0;
    var speed = 50;
    
    // Triangle vertices coordinates
    var vertices = [
      { x: 200, y: 25 },     // Top
      { x: 30, y: 335 },    // Bottom Left
      { x: 370, y: 335 }    // Bottom Right
    ];
    
    var colorMode = 'cyan'; // 'cyan', 'fire', 'forest'

    function drawVertices() {
      cCtx.fillStyle = '#fff';
      vertices.forEach(function(v) {
        cCtx.beginPath();
        cCtx.arc(v.x, v.y, 4, 0, Math.PI * 2);
        cCtx.fill();
      });
    }

    function clearChaos() {
      cCtx.fillStyle = '#06070c';
      cCtx.fillRect(0, 0, chaosCanvas.width, chaosCanvas.height);
      drawVertices();
      totalPoints = 0;
      if (chaosPointCount) chaosPointCount.textContent = '0';
      // Pick random starting point
      curPoint = { x: Math.random() * 400, y: Math.random() * 360 };
    }

    function getPointColor() {
      if (colorMode === 'fire') {
        var rng = Math.random();
        return rng < 0.4 ? '#ffea00' : (rng < 0.8 ? '#ff7043' : '#ff1744');
      }
      if (colorMode === 'forest') {
        return Math.random() < 0.5 ? '#69f0ae' : '#00b894';
      }
      // Cosmic Neon
      return Math.random() < 0.5 ? '#00e5ff' : '#7c4dff';
    }

    function drawPoints() {
      if (!chaosRunning) return;
      
      if (isCanvasActive('chaosCanvas')) {
        cCtx.fillStyle = getPointColor();
        
        for (var i = 0; i < speed; i++) {
          // Pick random vertex
          var targetVertex = vertices[Math.floor(Math.random() * vertices.length)];
          
          // Find midpoint
          curPoint.x = (curPoint.x + targetVertex.x) / 2;
          curPoint.y = (curPoint.y + targetVertex.y) / 2;
          
          cCtx.fillRect(curPoint.x, curPoint.y, 1, 1);
          totalPoints++;
        }
        
        if (chaosPointCount) chaosPointCount.textContent = totalPoints.toLocaleString('tr-TR');
      }
      
      chaosAnimId = requestAnimationFrame(drawPoints);
    }

    btnChaosStart.addEventListener('click', function() {
      if (chaosRunning) {
        chaosRunning = false;
        cancelAnimationFrame(chaosAnimId);
        btnChaosStart.textContent = '▶ Çizimi Başlat';
        btnChaosStart.style.background = '';
        toast('Fraktal çizimi duraklatıldı.', '#ffea00');
      } else {
        chaosRunning = true;
        btnChaosStart.textContent = '⏹ Çizimi Durdur';
        btnChaosStart.style.background = 'linear-gradient(135deg, var(--a2), #ff1744)';
        drawPoints();
        toast('🌀 Kaos oyunu başladı! Fraktal inşa ediliyor.', '#69f0ae');
      }
    });

    btnChaosClear.addEventListener('click', function() {
      var wasRunning = chaosRunning;
      if (chaosRunning) {
        chaosRunning = false;
        cancelAnimationFrame(chaosAnimId);
        btnChaosStart.textContent = '▶ Çizimi Başlat';
        btnChaosStart.style.background = '';
      }
      clearChaos();
      toast('Çizim alanı temizlendi.', '#ffea00');
    });

    rangeChaosSpeed.addEventListener('input', function() {
      speed = parseInt(rangeChaosSpeed.value, 10);
      if (lblChaosSpeed) lblChaosSpeed.textContent = speed + ' Nokta';
    });

    // Color selectors
    function applyColorMode(mode, btnId) {
      colorMode = mode;
      document.querySelectorAll('#chaos-fractal-sec .mini-btn').forEach(function(b) {
        if (b.id !== 'btnChaosClear') b.classList.remove('active');
      });
      var btn = document.getElementById(btnId);
      if (btn) btn.classList.add('active');
    }

    document.getElementById('chaosColCyan').addEventListener('click', function(){ applyColorMode('cyan', 'chaosColCyan'); });
    document.getElementById('chaosColFire').addEventListener('click', function(){ applyColorMode('fire', 'chaosColFire'); });
    document.getElementById('chaosColForest').addEventListener('click', function(){ applyColorMode('forest', 'chaosColForest'); });

    clearChaos();
  }
} catch(e) { console.error('ChaosGame error', e); }

/* ══════════════════════════════════════════════════════════
   57. DÜŞÜNCE DENEYLERİ & PARADOKSLAR BAHÇESİ
   ══════════════════════════════════════════════════════════ */
try {
  var paradoxTitle = document.getElementById('paradoxTitle');
  if (paradoxTitle) {
    var paradoxCategory = document.getElementById('paradoxCategory');
    var paradoxAuthor = document.getElementById('paradoxAuthor');
    var paradoxDesc = document.getElementById('paradoxDesc');
    var btnParadoxOptA = document.getElementById('btnParadoxOptA');
    var btnParadoxOptB = document.getElementById('btnParadoxOptB');
    var paradoxResults = document.getElementById('paradoxResults');
    var paradoxButtons = document.getElementById('paradoxButtons');
    
    var lblParadoxOptA = document.getElementById('lblParadoxOptA');
    var pctParadoxOptA = document.getElementById('pctParadoxOptA');
    var barParadoxOptA = document.getElementById('barParadoxOptA');
    var lblParadoxOptB = document.getElementById('lblParadoxOptB');
    var pctParadoxOptB = document.getElementById('pctParadoxOptB');
    var barParadoxOptB = document.getElementById('barParadoxOptB');
    
    var btnPrevParadox = document.getElementById('btnPrevParadox');
    var btnNextParadox = document.getElementById('btnNextParadox');
    var btnParadoxResetVote = document.getElementById('btnParadoxResetVote');

    var curParadoxIdx = 0;

    var PARADOX_DECK = [
      {
        cat: 'Kuantum Fiziği', title: 'Schrödinger\'in Kedisi', author: 'Erwin Schrödinger (1935)',
        desc: 'Bir kedi; zehirli gaz kapsülü, radyoaktif tetikleyici ve sayaç bulunan kapalı bir kutuya konur. Kuantum kurallarına göre kutu açılana kadar parçacık %50 olasılıkla sönmüştür ve kedi hem canlı hem de ölüdür.',
        optA: 'Kutu açılana kadar kedi hem ölü hem canlıdır.',
        optB: 'Kedi gözlemden bağımsız olarak sadece tek bir durumdadır.',
        votes: [47, 53]
      },
      {
        cat: 'Astrofizik', title: 'Fermi Paradoksu', author: 'Enrico Fermi (1950)',
        desc: 'Evrende milyarlarca yıldız ve Dünya benzeri gezegen var. Samanyolu milyarlarca yıl yaşındadır. Teknik olarak evrenin kolonileştirilmiş olması gerekirdi. O halde, "Herkes nerede?"',
        optA: 'Dış zeka var ama biz henüz algılayamıyoruz.',
        optB: 'Evrende yalnızız ya da iletişim kuramadan yok oluyorlar.',
        votes: [62, 38]
      },
      {
        cat: 'Klasik Felsefe', title: 'Theseus\'un Gemisi', author: 'Plutarhos (MS 75)',
        desc: 'Gemi limanda dururken çürüyen her tahtası yenisiyle değiştirilir. Sonunda geminin tüm parçaları yenilenmiş olur. Bu gemi hala "aynı" gemi midir yoksa yeni bir gemi mi?',
        optA: 'Evet, geminin kimliği ve ruhu süreklidir.',
        optB: 'Hayır, tüm fiziksel parçalar değiştiği için yeni bir gemidir.',
        votes: [54, 46]
      },
      {
        cat: 'Matematiksel Mantık', title: 'Zeno\'nun Oku', author: 'Elealı Zeno (MÖ 450)',
        desc: 'Fırlatılan bir ok, uçuşunun her anında belirli bir konumda hareketsiz durmaktadır. Zaman anların toplamı olduğuna göre ve ok her anda hareketsizse, ok nasıl hareket edebilir?',
        optA: 'Ok hareketsizdir, hareket bir illüzyondur.',
        optB: 'Konumlar anlıktır, zaman sürekli akış halindedir.',
        votes: [29, 71]
      }
    ];

    function getVoteKey(idx) {
      return 'zen_paradox_vote_' + idx;
    }

    function renderParadox() {
      var d = PARADOX_DECK[curParadoxIdx];
      if (!d) return;

      paradoxCategory.textContent = d.cat;
      paradoxTitle.textContent = d.title;
      paradoxAuthor.textContent = d.author;
      paradoxDesc.textContent = d.desc;
      
      btnParadoxOptA.querySelector('span').textContent = d.optA;
      btnParadoxOptB.querySelector('span').textContent = d.optB;
      
      // Check if voted
      var voted = localStorage.getItem(getVoteKey(curParadoxIdx));
      if (voted) {
        paradoxButtons.style.display = 'none';
        paradoxResults.style.display = 'flex';
        
        lblParadoxOptA.textContent = d.optA;
        lblParadoxOptB.textContent = d.optB;
        
        var vA = d.votes[0];
        var vB = d.votes[1];
        if (voted === 'a') vA += 1;
        else vB += 1;
        
        var tot = vA + vB;
        var pctA = Math.round((vA / tot) * 100);
        var pctB = 100 - pctA;
        
        pctParadoxOptA.textContent = pctA + '%';
        pctParadoxOptB.textContent = pctB + '%';
        
        barParadoxOptA.style.width = pctA + '%';
        barParadoxOptB.style.width = pctB + '%';
      } else {
        paradoxButtons.style.display = 'grid';
        paradoxResults.style.display = 'none';
      }
    }

    function vote(opt) {
      localStorage.setItem(getVoteKey(curParadoxIdx), opt);
      renderParadox();
      toast('🗳️ Fikriniz kaydedildi! Genel sonuçlar gösteriliyor.', '#69f0ae');
    }

    btnParadoxOptA.addEventListener('click', function(){ vote('a'); });
    btnParadoxOptB.addEventListener('click', function(){ vote('b'); });
    
    btnParadoxResetVote.addEventListener('click', function() {
      localStorage.removeItem(getVoteKey(curParadoxIdx));
      renderParadox();
      toast('Oyunuz sıfırlandı. Yeniden oylayabilirsiniz.', '#ffea00');
    });

    btnPrevParadox.addEventListener('click', function() {
      curParadoxIdx = (curParadoxIdx - 1 + PARADOX_DECK.length) % PARADOX_DECK.length;
      renderParadox();
    });

    btnNextParadox.addEventListener('click', function() {
      curParadoxIdx = (curParadoxIdx + 1) % PARADOX_DECK.length;
      renderParadox();
    });

    renderParadox();
  }
} catch(e) { console.error('ParadoxesGarden error', e); }

/* ══════════════════════════════════════════════════════════
   58. ZEN AKIŞKAN SIVI TUVALİ (FLUID DYNAMICS SANDBOX)
   ══════════════════════════════════════════════════════════ */
try {
  var fluidCanvas = document.getElementById('fluidCanvas');
  if (fluidCanvas) {
    var fCtx = fluidCanvas.getContext('2d');
    var rangeFluidVisc = document.getElementById('rangeFluidVisc');
    var rangeFluidDecay = document.getElementById('rangeFluidDecay');
    var btnFluidClear = document.getElementById('btnFluidClear');

    var fluidWidth = fluidCanvas.width;
    var fluidHeight = fluidCanvas.height;

    // Real-time grid vector force fields
    var gridCols = 40;
    var gridRows = 20;
    var flowField = [];
    
    for (var r = 0; r < gridRows; r++) {
      flowField.push([]);
      for (var c = 0; c < gridCols; c++) {
        flowField[r].push({ vx: 0, vy: 0 });
      }
    }

    var particles = [];
    var maxParticles = 600;
    var inkColor = 'cyan'; // 'cyan', 'magenta', 'gold', 'emerald', 'rainbow'
    var isFluidPainting = false;
    var lastMouse = { x: 0, y: 0 };

    // Initialize particles
    for (var i = 0; i < maxParticles; i++) {
      particles.push({
        x: Math.random() * fluidWidth,
        y: Math.random() * fluidHeight,
        vx: 0,
        vy: 0,
        age: Math.random() * 100,
        hue: Math.random() * 360
      });
    }

    function addForce(x, y, vx, vy) {
      var col = Math.floor((x / fluidWidth) * gridCols);
      var row = Math.floor((y / fluidHeight) * gridRows);
      
      if (col >= 0 && col < gridCols && row >= 0 && row < gridRows) {
        // Smoothly inject velocity force vectors into neighboring cells
        for (var dr = -1; dr <= 1; dr++) {
          for (var dc = -1; dc <= 1; dr++) {
            var rIdx = row + dr;
            var cIdx = col + dc;
            if (rIdx >= 0 && rIdx < gridRows && cIdx >= 0 && cIdx < gridCols) {
              var w = 1.0 / (1 + Math.hypot(dr, dc));
              flowField[rIdx][cIdx].vx += vx * w * 0.8;
              flowField[rIdx][cIdx].vy += vy * w * 0.8;
            }
          }
        }
      }
    }

    function getForceAt(x, y) {
      var col = Math.floor((x / fluidWidth) * gridCols);
      var row = Math.floor((y / fluidHeight) * gridRows);
      if (col >= 0 && col < gridCols && row >= 0 && row < gridRows) {
        return flowField[row][col];
      }
      return { vx: 0, vy: 0 };
    }

    function updateFluidPhysics() {
      // 1. Decay and diffuse flow field vectors
      var visc = rangeFluidVisc ? parseFloat(rangeFluidVisc.value) / 10 : 0.3;
      var decay = rangeFluidDecay ? parseFloat(rangeFluidDecay.value) / 100 : 0.97;

      for (var r = 0; r < gridRows; r++) {
        for (var c = 0; c < gridCols; c++) {
          var v = flowField[r][c];
          v.vx *= decay;
          v.vy *= decay;
          
          // Simple neighborhood diffusion (viscosity)
          var left = c > 0 ? flowField[r][c-1].vx : 0;
          var right = c < gridCols - 1 ? flowField[r][c+1].vx : 0;
          var top = r > 0 ? flowField[r-1][c].vx : 0;
          var bottom = r < gridRows - 1 ? flowField[r+1][c].vx : 0;
          v.vx += (left + right + top + bottom - 4 * v.vx) * visc * 0.1;
        }
      }

      // 2. Update and draw particles
      particles.forEach(function(p) {
        p.age++;
        var f = getForceAt(p.x, p.y);
        
        // Accumulate velocity
        p.vx = p.vx * 0.9 + f.vx * 0.1;
        p.vy = p.vy * 0.9 + f.vy * 0.1;
        
        // Move particle
        p.x += p.vx;
        p.y += p.vy;
        
        // Wrap boundaries
        if (p.x < 0 || p.x > fluidWidth || p.y < 0 || p.y > fluidHeight || p.age > 120) {
          p.x = Math.random() * fluidWidth;
          p.y = Math.random() * fluidHeight;
          p.vx = 0;
          p.vy = 0;
          p.age = 0;
        }
      });
    }

    function drawFluid() {
      if (!isCanvasActive('fluidCanvas')) return;
      
      // Draw trailing black layer for motion blur
      fCtx.fillStyle = 'rgba(4,5,10,0.06)';
      fCtx.fillRect(0, 0, fluidWidth, fluidHeight);

      updateFluidPhysics();

      // Render glowing particle streams
      particles.forEach(function(p) {
        var size = 1 + Math.hypot(p.vx, p.vy) * 0.8;
        var opacity = Math.min(1.0, (120 - p.age) / 30);
        
        fCtx.save();
        fCtx.shadowBlur = 10;
        
        if (inkColor === 'cyan') {
          fCtx.fillStyle = 'rgba(0, 229, 255, ' + opacity + ')';
          fCtx.shadowColor = '#00e5ff';
        } else if (inkColor === 'magenta') {
          fCtx.fillStyle = 'rgba(255, 107, 157, ' + opacity + ')';
          fCtx.shadowColor = '#ff6b9d';
        } else if (inkColor === 'gold') {
          fCtx.fillStyle = 'rgba(255, 234, 0, ' + opacity + ')';
          fCtx.shadowColor = '#ffea00';
        } else if (inkColor === 'emerald') {
          fCtx.fillStyle = 'rgba(105, 240, 174, ' + opacity + ')';
          fCtx.shadowColor = '#69f0ae';
        } else {
          // Rainbow
          fCtx.fillStyle = 'hsla(' + ((p.hue + Date.now()/50)%360) + ', 85%, 65%, ' + opacity + ')';
          fCtx.shadowColor = 'hsl(' + ((p.hue + Date.now()/50)%360) + ', 85%, 65%)';
        }
        
        fCtx.beginPath();
        fCtx.arc(p.x, p.y, size, 0, Math.PI * 2);
        fCtx.fill();
        fCtx.restore();
      });
    }

    // Capture dragging gestures
    function handleFluidMove(clientX, clientY, rect) {
      var x = (clientX - rect.left) * (fluidWidth / rect.width);
      var y = (clientY - rect.top) * (fluidHeight / rect.height);
      
      if (isFluidPainting) {
        var dx = x - lastMouse.x;
        var dy = y - lastMouse.y;
        
        // Boost injected vector speeds
        addForce(x, y, dx * 1.5, dy * 1.5);
        
        // Draw splash immediately
        for (var k = 0; k < 5; k++) {
          var pIdx = Math.floor(Math.random() * maxParticles);
          var p = particles[pIdx];
          p.x = x + (Math.random() - 0.5) * 15;
          p.y = y + (Math.random() - 0.5) * 15;
          p.vx = dx * 0.8;
          p.vy = dy * 0.8;
          p.age = 0;
        }
      }
      
      lastMouse.x = x;
      lastMouse.y = y;
    }

    fluidCanvas.addEventListener('mousedown', function(e) {
      isFluidPainting = true;
      var rect = fluidCanvas.getBoundingClientRect();
      lastMouse.x = (e.clientX - rect.left) * (fluidWidth / rect.width);
      lastMouse.y = (e.clientY - rect.top) * (fluidHeight / rect.height);
    });

    fluidCanvas.addEventListener('mousemove', function(e) {
      var rect = fluidCanvas.getBoundingClientRect();
      handleFluidMove(e.clientX, e.clientY, rect);
    });

    document.addEventListener('mouseup', function() {
      isFluidPainting = false;
    });

    // Touch events support
    fluidCanvas.addEventListener('touchstart', function(e) {
      isFluidPainting = true;
      var rect = fluidCanvas.getBoundingClientRect();
      var touch = e.touches[0];
      lastMouse.x = (touch.clientX - rect.left) * (fluidWidth / rect.width);
      lastMouse.y = (touch.clientY - rect.top) * (fluidHeight / rect.height);
    });

    fluidCanvas.addEventListener('touchmove', function(e) {
      var rect = fluidCanvas.getBoundingClientRect();
      var touch = e.touches[0];
      handleFluidMove(touch.clientX, touch.clientY, rect);
    });

    fluidCanvas.addEventListener('touchend', function() {
      isFluidPainting = false;
    });

    btnFluidClear.addEventListener('click', function() {
      fCtx.fillStyle = '#04050a';
      fCtx.fillRect(0, 0, fluidWidth, fluidHeight);
      for (var r = 0; r < gridRows; r++) {
        for (var c = 0; c < gridCols; c++) {
          flowField[r][c].vx = 0;
          flowField[r][c].vy = 0;
        }
      }
      particles.forEach(function(p) {
        p.vx = 0; p.vy = 0; p.age = 0;
      });
      toast('Sıvı tuvali temizlendi.', '#ffea00');
    });

    // Color bindings
    function setInkColor(col, btnId) {
      inkColor = col;
      document.querySelectorAll('#fluid-sec .mini-btn').forEach(function(btn) {
        if (btn.id !== 'btnFluidClear') btn.classList.remove('active');
      });
      var activeBtn = document.getElementById(btnId);
      if (activeBtn) activeBtn.classList.add('active');
    }

    document.getElementById('fluidColCyan').addEventListener('click', function(){ setInkColor('cyan', 'fluidColCyan'); });
    document.getElementById('fluidColMagenta').addEventListener('click', function(){ setInkColor('magenta', 'fluidColMagenta'); });
    document.getElementById('fluidColGold').addEventListener('click', function(){ setInkColor('gold', 'fluidColGold'); });
    document.getElementById('fluidColEmerald').addEventListener('click', function(){ setInkColor('emerald', 'fluidColEmerald'); });
    document.getElementById('fluidColRainbow').addEventListener('click', function(){ setInkColor('rainbow', 'fluidColRainbow'); });

    // Tick loops
    function fluidLoop() {
      drawFluid();
      requestAnimationFrame(fluidLoop);
    }
    fluidLoop();
  }
} catch(e) { console.error('FluidSandbox error', e); }

/* ══════════════════════════════════════════════════════════
   59. ZEN YAPAY YAŞAM (LENIA CONTINUUM LIFE SIMULATOR)
   ══════════════════════════════════════════════════════════ */
try {
  var leniaCanvas = document.getElementById('leniaCanvas');
  if (leniaCanvas) {
    var lCtx = leniaCanvas.getContext('2d');
    var btnLeniaStart = document.getElementById('btnLeniaStart');
    var btnLeniaClear = document.getElementById('btnLeniaClear');
    var rangeLeniaSpeed = document.getElementById('rangeLeniaSpeed');
    var lblLeniaSpeed = document.getElementById('lblLeniaSpeed');

    var leniaW = leniaCanvas.width;
    var leniaH = leniaCanvas.height;

    // Fast cellular grid map
    var leniaSize = 64;
    var cells = Array(leniaSize * leniaSize).fill(0);
    var nextCells = Array(leniaSize * leniaSize).fill(0);

    var leniaRunning = false;
    var leniaAnimId = null;
    var lPainting = false;

    // Lenia parameter variables
    var lMu = 0.15;
    var lSigma = 0.025;

    // Helper map indexes
    function idx(x, y) {
      return ((y + leniaSize) % leniaSize) * leniaSize + ((x + leniaSize) % leniaSize);
    }

    function initLeniaGrid() {
      cells.fill(0);
      nextCells.fill(0);
      // Seed a beautiful default creature at center
      paintLeniaPreset('seed1');
      renderLeniaCanvas();
    }

    function renderLeniaCanvas() {
      lCtx.fillStyle = '#030407';
      lCtx.fillRect(0, 0, leniaW, leniaH);

      var scaleX = leniaW / leniaSize;
      var scaleY = leniaH / leniaSize;

      for (var y = 0; y < leniaSize; y++) {
        for (var x = 0; x < leniaSize; x++) {
          var val = cells[idx(x, y)];
          if (val > 0.02) {
            lCtx.save();
            lCtx.shadowBlur = 8;
            lCtx.shadowColor = 'rgba(105, 240, 174, ' + val + ')';
            
            // Draw continuous organisms with glowing emerald gradients
            lCtx.fillStyle = 'rgba(105, 240, 174, ' + val + ')';
            lCtx.beginPath();
            lCtx.arc(x * scaleX + scaleX/2, y * scaleY + scaleY/2, scaleX * 0.75 * val, 0, Math.PI * 2);
            lCtx.fill();
            lCtx.restore();
          }
        }
      }
    }

    function updateLeniaState() {
      var speedMultiplier = rangeLeniaSpeed ? parseInt(rangeLeniaSpeed.value, 10) : 2;
      
      for (var s = 0; s < speedMultiplier; s++) {
        for (var y = 0; y < leniaSize; y++) {
          for (var x = 0; x < leniaSize; x++) {
            
            // 1. Calculate neighborhood average weighted by custom kernel ring
            var sum = 0;
            var weights = 0;
            
            for (var dy = -4; dy <= 4; dy++) {
              for (var dx = -4; dx <= 4; dx++) {
                var d = Math.hypot(dx, dy);
                if (d > 0.5 && d <= 4.2) {
                  // Ring-shaped convolution kernel
                  var w = Math.exp(-Math.pow((d - 2.8), 2) / 0.8);
                  sum += cells[idx(x + dx, y + dy)] * w;
                  weights += w;
                }
              }
            }
            
            var avg = weights > 0 ? sum / weights : 0;
            
            // 2. Growth function G(avg): bell shape around lMu
            var growth = Math.exp(-Math.pow((avg - lMu), 2) / Math.pow(lSigma, 2)) * 2 - 1.0;
            
            // 3. Integrate growth state
            var currentVal = cells[idx(x, y)];
            var nextVal = currentVal + 0.05 * growth;
            nextCells[idx(x, y)] = Math.max(0.0, Math.min(1.0, nextVal));
          }
        }
        
        // Swap buffers
        var temp = cells;
        cells = nextCells;
        nextCells = temp;
      }
    }

    function leniaStep() {
      if (!leniaRunning) return;
      if (isCanvasActive('leniaCanvas')) {
        updateLeniaState();
        renderLeniaCanvas();
      }
      leniaAnimId = requestAnimationFrame(leniaStep);
    }

    btnLeniaStart.addEventListener('click', function() {
      if (leniaRunning) {
        leniaRunning = false;
        cancelAnimationFrame(leniaAnimId);
        btnLeniaStart.textContent = '▶ Yaşamı Başlat';
        btnLeniaStart.style.background = '';
        toast('Hücresel yaşam donduruldu.', '#ffea00');
      } else {
        leniaRunning = true;
        btnLeniaStart.textContent = '⏹ Yaşamı Durdur';
        btnLeniaStart.style.background = 'linear-gradient(135deg, var(--a2), #ff1744)';
        leniaStep();
        toast('🧬 Hücresel Yapay Yaşam başladı!', '#69f0ae');
      }
    });

    btnLeniaClear.addEventListener('click', function() {
      if (leniaRunning) {
        leniaRunning = false;
        cancelAnimationFrame(leniaAnimId);
        btnLeniaStart.textContent = '▶ Yaşamı Başlat';
        btnLeniaStart.style.background = '';
      }
      cells.fill(0);
      nextCells.fill(0);
      renderLeniaCanvas();
      toast('Tüm organizmalar temizlendi.', '#ffea00');
    });

    // Custom seeding on canvas
    function seedBrush(clientX, clientY, rect) {
      var cx = Math.floor((clientX - rect.left) * (leniaSize / rect.width));
      var cy = Math.floor((clientY - rect.top) * (leniaSize / rect.height));
      
      for (var dy = -2; dy <= 2; dy++) {
        for (var dx = -2; dx <= 2; dx++) {
          var d = Math.hypot(dx, dy);
          if (d <= 2) {
            var targetX = (cx + dx + leniaSize) % leniaSize;
            var targetY = (cy + dy + leniaSize) % leniaSize;
            cells[idx(targetX, targetY)] = Math.min(1.0, cells[idx(targetX, targetY)] + 0.6 * (1 - d/2.2));
          }
        }
      }
      renderLeniaCanvas();
    }

    leniaCanvas.addEventListener('mousedown', function(e) {
      lPainting = true;
      var rect = leniaCanvas.getBoundingClientRect();
      seedBrush(e.clientX, e.clientY, rect);
    });

    leniaCanvas.addEventListener('mousemove', function(e) {
      if (lPainting) {
        var rect = leniaCanvas.getBoundingClientRect();
        seedBrush(e.clientX, e.clientY, rect);
      }
    });

    document.addEventListener('mouseup', function() {
      lPainting = false;
    });

    // Organisms seed presets
    function paintLeniaPreset(preset) {
      cells.fill(0);
      var mid = Math.floor(leniaSize / 2);
      
      if (preset === 'seed1') {
        // Gezgin Hücre - ring layout
        for (var r = 0; r < 5; r++) {
          for (var a = 0; a < 360; a += 15) {
            var rad = a * Math.PI / 180;
            var px = Math.round(mid + Math.cos(rad) * 3);
            var py = Math.round(mid + Math.sin(rad) * 3);
            cells[idx(px, py)] = 0.55;
          }
        }
      } else if (preset === 'seed2') {
        // Salyangoz - spiral shape
        for (var i = 0; i < 20; i++) {
          var rad = (i * 18) * Math.PI / 180;
          var rSize = 1 + i * 0.18;
          var px = Math.round(mid + Math.cos(rad) * rSize);
          var py = Math.round(mid + Math.sin(rad) * rSize);
          cells[idx(px, py)] = 0.6;
        }
      } else if (preset === 'seed3') {
        // Çift Pulsar - two rings
        for (var dy = -4; dy <= 4; dy++) {
          for (var dx = -4; dx <= 4; dx++) {
            var d1 = Math.hypot(dx - 3, dy);
            var d2 = Math.hypot(dx + 3, dy);
            if (d1 >= 1.5 && d1 <= 2.8) cells[idx(mid + dx - 3, mid + dy)] = 0.6;
            if (d2 >= 1.5 && d2 <= 2.8) cells[idx(mid + dx + 3, mid + dy)] = 0.6;
          }
        }
      } else {
        // Kaotik blobs
        for (var k = 0; k < 80; k++) {
          var px = mid + Math.floor((Math.random() - 0.5) * 16);
          var py = mid + Math.floor((Math.random() - 0.5) * 16);
          cells[idx(px, py)] = Math.random() * 0.8;
        }
      }
      renderLeniaCanvas();
    }

    document.getElementById('btnLeniaSeed1').addEventListener('click', function(){ paintLeniaPreset('seed1'); toast('🧬 Gezgin Hücre ekildi.', '#00e5ff'); });
    document.getElementById('btnLeniaSeed2').addEventListener('click', function(){ paintLeniaPreset('seed2'); toast('🐌 Salyangoz ekildi.', '#00e5ff'); });
    document.getElementById('btnLeniaSeed3').addEventListener('click', function(){ paintLeniaPreset('seed3'); toast('🌀 Çift Pulsar ekildi.', '#00e5ff'); });
    document.getElementById('btnLeniaSeed4').addEventListener('click', function(){ paintLeniaPreset('seed4'); toast('🫧 Kaotik organizmalar ekildi.', '#00e5ff'); });

    rangeLeniaSpeed.addEventListener('input', function() {
      var val = parseInt(rangeLeniaSpeed.value, 10);
      var labels = ['Yavaş', 'Normal', 'Hızlı', 'Kozmik'];
      if (lblLeniaSpeed) lblLeniaSpeed.textContent = labels[val - 1];
    });

    initLeniaGrid();
  }
} catch(e) { console.error('Lenia error', e); }

/* ══════════════════════════════════════════════════════════
   60. REZONANS TABLASI (CHLADNI CYMATICS PLATE SIMULATOR)
   ══════════════════════════════════════════════════════════ */
try {
  var cymaticsCanvas = document.getElementById('cymaticsCanvas');
  if (cymaticsCanvas) {
    var cCtx = cymaticsCanvas.getContext('2d');
    var btnCymaticsPlay = document.getElementById('btnCymaticsPlay');
    var rangeCymaticsFreq = document.getElementById('rangeCymaticsFreq');
    var lblCymaticsFreq = document.getElementById('lblCymaticsFreq');
    var rangeCymaticsVol = document.getElementById('rangeCymaticsVol');
    var lblCymaticsVol = document.getElementById('lblCymaticsVol');

    var cyW = cymaticsCanvas.width;
    var cyH = cymaticsCanvas.height;

    // Chladni sand grains
    var grains = [];
    var maxGrains = 1200;
    
    // Wave parameters
    var nParam = 2;
    var mParam = 4;

    // Web Audio oscillators
    var cyAudioCtx = null;
    var cyOsc = null;
    var cyGain = null;
    var cyIsPlaying = false;

    function initGrains() {
      grains = [];
      for (var i = 0; i < maxGrains; i++) {
        grains.push({
          x: Math.random() * cyW,
          y: Math.random() * cyH
        });
      }
    }

    // Chladni wave equation amplitude:
    // z = sin(n * pi * x) * sin(m * pi * y) - sin(m * pi * x) * sin(n * pi * y)
    function chladni(x, y) {
      // Normalize coordinate: x, y in range [0, 1]
      var nx = x / cyW;
      var ny = y / cyH;
      
      var term1 = Math.sin(nParam * Math.PI * nx) * Math.sin(mParam * Math.PI * ny);
      var term2 = Math.sin(mParam * Math.PI * nx) * Math.sin(nParam * Math.PI * ny);
      
      return term1 - term2;
    }

    function drawCymatics() {
      if (!isCanvasActive('cymaticsCanvas')) return;
      
      // Black background
      cCtx.fillStyle = '#05060b';
      cCtx.fillRect(0, 0, cyW, cyH);

      // Render Chladni metal board boundaries
      cCtx.strokeStyle = 'rgba(255,255,255,0.03)';
      cCtx.lineWidth = 1;
      cCtx.beginPath();
      cCtx.arc(cyW/2, cyH/2, cyW * 0.45, 0, Math.PI * 2);
      cCtx.stroke();

      // Displace sand grains
      // Step size is scaled directly by Chladni amplitude at that position.
      // High vibration = high step, Low vibration = settles to rest!
      cCtx.fillStyle = 'rgba(255, 234, 0, 0.75)';
      cCtx.save();
      cCtx.shadowBlur = 4;
      cCtx.shadowColor = '#ffea00';
      
      grains.forEach(function(g) {
        var amp = chladni(g.x, g.y);
        var absAmp = Math.abs(amp);
        
        // Random walk step size
        var step = absAmp * 4.0; 
        g.x += (Math.random() - 0.5) * step;
        g.y += (Math.random() - 0.5) * step;
        
        // Keep within bounds
        if (g.x < 10) g.x = 10;
        if (g.x > cyW - 10) g.x = cyW - 10;
        if (g.y < 10) g.y = 10;
        if (g.y > cyH - 10) g.y = cyH - 10;
        
        // Draw grain
        cCtx.fillRect(g.x, g.y, 1.5, 1.5);
      });
      
      cCtx.restore();
    }

    function initCymaticsAudio() {
      cyAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
      cyOsc = cyAudioCtx.createOscillator();
      cyGain = cyAudioCtx.createGain();
      
      cyOsc.type = 'sine';
      var freq = parseFloat(rangeCymaticsFreq.value);
      cyOsc.frequency.setValueAtTime(freq, cyAudioCtx.currentTime);
      
      var vol = parseFloat(rangeCymaticsVol.value) / 100;
      cyGain.gain.setValueAtTime(vol * 0.15, cyAudioCtx.currentTime); // Limit maximum sine tone volume
      
      cyOsc.connect(cyGain);
      cyGain.connect(cyAudioCtx.destination);
      
      cyOsc.start();
    }

    function startCymatics() {
      try {
        initCymaticsAudio();
        cyIsPlaying = true;
        btnCymaticsPlay.textContent = '⏹ Titreşimi Durdur';
        btnCymaticsPlay.style.background = 'linear-gradient(135deg, var(--a2), #ff1744)';
        toast('🔮 Rezonans Tablası Titreşiyor! Ses dalgaları kumları çiziyor.', '#69f0ae');
      } catch (err) {
        console.error('Audio synthesizer init failed', err);
        toast('⚠️ Rezonans sesi başlatılamadı.', '#ff7043');
      }
    }

    function stopCymatics() {
      cyIsPlaying = false;
      btnCymaticsPlay.textContent = '▶ Titreşimi Başlat';
      btnCymaticsPlay.style.background = '';
      
      if (cyOsc) {
        try { cyOsc.stop(); } catch(e){}
        cyOsc.disconnect();
      }
      if (cyGain) cyGain.disconnect();
      if (cyAudioCtx) {
        cyAudioCtx.close();
        cyAudioCtx = null;
      }
      toast('Titreşim durduruldu.', '#ffea00');
    }

    btnCymaticsPlay.addEventListener('click', function() {
      if (cyIsPlaying) stopCymatics();
      else startCymatics();
    });

    rangeCymaticsFreq.addEventListener('input', function() {
      var freq = parseFloat(rangeCymaticsFreq.value);
      if (lblCymaticsFreq) lblCymaticsFreq.textContent = freq + ' Hz';
      
      if (cyIsPlaying && cyOsc && cyAudioCtx) {
        cyOsc.frequency.setValueAtTime(freq, cyAudioCtx.currentTime);
      }
      
      // Update wave shape integers proportionally based on frequency ranges
      nParam = 2 + Math.floor(freq / 280);
      mParam = 4 + Math.floor(freq / 180);
      
      // Disperse grains slightly to let them form the new geometry
      grains.forEach(function(g) {
        g.x += (Math.random() - 0.5) * 15;
        g.y += (Math.random() - 0.5) * 15;
      });
    });

    rangeCymaticsVol.addEventListener('input', function() {
      var vol = parseFloat(rangeCymaticsVol.value);
      if (lblCymaticsVol) lblCymaticsVol.textContent = vol + '%';
      if (cyIsPlaying && cyGain && cyAudioCtx) {
        cyGain.gain.setValueAtTime((vol / 100) * 0.15, cyAudioCtx.currentTime);
      }
    });

    // Preset selectors
    function loadCymaticsPreset(freq, n, m, btnId) {
      rangeCymaticsFreq.value = freq;
      if (lblCymaticsFreq) lblCymaticsFreq.textContent = freq + ' Hz';
      nParam = n;
      mParam = m;
      
      if (cyIsPlaying && cyOsc && cyAudioCtx) {
        cyOsc.frequency.setValueAtTime(freq, cyAudioCtx.currentTime);
      }
      
      document.querySelectorAll('#cymatics-sec .mini-btn').forEach(function(b) {
        b.classList.remove('active');
      });
      var activeBtn = document.getElementById(btnId);
      if (activeBtn) activeBtn.classList.add('active');
      
      // Spread grains slightly
      grains.forEach(function(g) {
        g.x += (Math.random() - 0.5) * 20;
        g.y += (Math.random() - 0.5) * 20;
      });
      toast('Desen yüklendi: ' + freq + ' Hz rezonansı.', '#00e5ff');
    }

    document.getElementById('btnCymaticsPattern1').addEventListener('click', function(){ loadCymaticsPreset(342, 2, 4, 'btnCymaticsPattern1'); });
    document.getElementById('btnCymaticsPattern2').addEventListener('click', function(){ loadCymaticsPreset(512, 3, 5, 'btnCymaticsPattern2'); });
    document.getElementById('btnCymaticsPattern3').addEventListener('click', function(){ loadCymaticsPreset(880, 4, 6, 'btnCymaticsPattern3'); });
    document.getElementById('btnCymaticsPattern4').addEventListener('click', function(){ loadCymaticsPreset(1240, 5, 7, 'btnCymaticsPattern4'); });

    initGrains();
    
    // Conclude visual tick
    function cymaticsLoop() {
      drawCymatics();
      requestAnimationFrame(cymaticsLoop);
    }
    cymaticsLoop();
  }
} catch(e) { console.error('Cymatics error', e); }

/* ══════════════════════════════════════════════════════════
   61. KAOTİK ÇİFT SARKAÇ SIMULATOR (RK4 SOLVER PHYSICS)
   ══════════════════════════════════════════════════════════ */
try {
  var pendulumCanvas = document.getElementById('pendulumCanvas');
  if (pendulumCanvas) {
    var pCtx = pendulumCanvas.getContext('2d');
    var btnPendSingle = document.getElementById('btnPendSingle');
    var btnPendDual = document.getElementById('btnPendDual');
    var btnPendClear = document.getElementById('btnPendClear');
    var rangePendLength = document.getElementById('rangePendLength');
    var rangePendDamp = document.getElementById('rangePendDamp');
    var rangePendGrav = document.getElementById('rangePendGrav');

    var pW = pendulumCanvas.width;
    var pH = pendulumCanvas.height;

    // Lagrangian Pendulum arm states: [theta, omega]
    var armL1 = 90;
    var armL2 = 80;
    var massM1 = 10;
    var massM2 = 10;

    var pendulumA = {
      t1: Math.PI / 2,
      t2: Math.PI / 2,
      w1: 0.0,
      w2: 0.0,
      trail: []
    };

    var pendulumB = {
      t1: Math.PI / 2 + 0.0001, // 0.0001 rad microscopic difference!
      t2: Math.PI / 2,
      w1: 0.0,
      w2: 0.0,
      trail: []
    };

    var isDualMode = true;
    var isDraggingArm = null; // 'a1', 'a2', 'b1', 'b2'
    var isTracing = true;

    // Lagrangian Mechanics equations returning [d_omega1/dt, d_omega2/dt]
    function calculateEquations(t1, t2, w1, w2) {
      var g = parseFloat(rangePendGrav.value) / 10 * 9.81;
      
      var delta = t1 - t2;
      var mu = 1 + massM1 / massM2;
      
      // Arm 1 Acceleration: alpha1
      var num1 = g * (Math.sin(t2) * Math.cos(delta) - mu * Math.sin(t1)) - (armL2 * w2 * w2 + armL1 * w1 * w1 * Math.cos(delta)) * Math.sin(delta);
      var den1 = armL1 * (mu - Math.cos(delta) * Math.cos(delta));
      var alpha1 = num1 / den1;

      // Arm 2 Acceleration: alpha2
      var num2 = g * mu * (Math.sin(t1) * Math.cos(delta) - Math.sin(t2)) + (mu * armL1 * w1 * w1 + armL2 * w2 * w2 * Math.cos(delta)) * Math.sin(delta);
      var den2 = armL2 * (mu - Math.cos(delta) * Math.cos(delta));
      var alpha2 = num2 / den2;

      return [alpha1, alpha2];
    }

    // Runge-Kutta 4th-Order Integration
    function rk4Step(p) {
      var dt = 0.12; // Physics step size
      var damp = 1.0 - (parseFloat(rangePendDamp.value) / 10000); // friction damping

      // k1
      var acc1 = calculateEquations(p.t1, p.t2, p.w1, p.w2);
      
      // k2
      var t1_2 = p.t1 + 0.5 * dt * p.w1;
      var t2_2 = p.t2 + 0.5 * dt * p.w2;
      var w1_2 = p.w1 + 0.5 * dt * acc1[0];
      var w2_2 = p.w2 + 0.5 * dt * acc1[1];
      var acc2 = calculateEquations(t1_2, t2_2, w1_2, w2_2);

      // k3
      var t1_3 = p.t1 + 0.5 * dt * w1_2;
      var t2_3 = p.t2 + 0.5 * dt * w2_2;
      var w1_3 = p.w1 + 0.5 * dt * acc2[0];
      var w2_3 = p.w2 + 0.5 * dt * acc2[1];
      var acc3 = calculateEquations(t1_3, t2_3, w1_3, w2_3);

      // k4
      var t1_4 = p.t1 + dt * w1_3;
      var t2_4 = p.t2 + dt * w2_3;
      var w1_4 = p.w1 + dt * acc3[0];
      var w2_4 = p.w2 + dt * acc3[1];
      var acc4 = calculateEquations(t1_4, t2_4, w1_4, w2_4);

      // Final step weighted sums
      p.t1 += (dt / 6) * (p.w1 + 2 * w1_2 + 2 * w1_3 + w1_4);
      p.t2 += (dt / 6) * (p.w2 + 2 * w2_2 + 2 * w2_3 + w2_4);
      
      p.w1 += (dt / 6) * (acc1[0] + 2 * acc2[0] + 2 * acc3[0] + acc4[0]);
      p.w2 += (dt / 6) * (acc1[1] + 2 * acc2[1] + 2 * acc3[1] + acc4[1]);
      
      // Apply friction sönümleme
      p.w1 *= damp;
      p.w2 *= damp;
    }

    function updatePendPhysics() {
      armL1 = parseFloat(rangePendLength.value);
      armL2 = armL1 * 0.85;

      if (!isDraggingArm) {
        rk4Step(pendulumA);
        if (isDualMode) {
          rk4Step(pendulumB);
        }
      }
    }

    function drawPendulums() {
      if (!isCanvasActive('pendulumCanvas')) return;

      pCtx.fillStyle = '#030407';
      pCtx.fillRect(0, 0, pW, pH);

      updatePendPhysics();

      var cx = pW / 2;
      var cy = pH * 0.42;

      // 1. Draw trails first
      if (isTracing) {
        pCtx.lineWidth = 1.5;
        pCtx.save();
        
        // Draw A trail (Cyan)
        if (pendulumA.trail.length > 1) {
          pCtx.strokeStyle = '#00e5ff';
          pCtx.shadowBlur = 5;
          pCtx.shadowColor = '#00e5ff';
          pCtx.beginPath();
          pCtx.moveTo(pendulumA.trail[0].x, pendulumA.trail[0].y);
          for (var i = 1; i < pendulumA.trail.length; i++) {
            pCtx.lineTo(pendulumA.trail[i].x, pendulumA.trail[i].y);
          }
          pCtx.stroke();
        }

        // Draw B trail (Pink)
        if (isDualMode && pendulumB.trail.length > 1) {
          pCtx.strokeStyle = '#ff6b9d';
          pCtx.shadowBlur = 5;
          pCtx.shadowColor = '#ff6b9d';
          pCtx.beginPath();
          pCtx.moveTo(pendulumB.trail[0].x, pendulumB.trail[0].y);
          for (var j = 1; j < pendulumB.trail.length; j++) {
            pCtx.lineTo(pendulumB.trail[j].x, pendulumB.trail[j].y);
          }
          pCtx.stroke();
        }
        pCtx.restore();
      }

      // 2. Draw pendulum joints & lines
      function renderSingle(p, colorArm, colorTip) {
        var x1 = cx + armL1 * Math.sin(p.t1);
        var y1 = cy + armL1 * Math.cos(p.t1);
        
        var x2 = x1 + armL2 * Math.sin(p.t2);
        var y2 = y1 + armL2 * Math.cos(p.t2);

        // Record trails
        p.trail.push({ x: x2, y: y2 });
        if (p.trail.length > 250) p.trail.shift();

        pCtx.save();
        pCtx.lineWidth = 3.5;
        pCtx.strokeStyle = 'rgba(255,255,255,0.06)';
        
        // Connect arm lines
        pCtx.beginPath();
        pCtx.moveTo(cx, cy);
        pCtx.lineTo(x1, y1);
        pCtx.lineTo(x2, y2);
        pCtx.stroke();

        // Joint nodes
        pCtx.fillStyle = colorArm;
        pCtx.beginPath();
        pCtx.arc(x1, y1, 6, 0, Math.PI * 2);
        pCtx.fill();

        // Glowing end tip node
        pCtx.fillStyle = colorTip;
        pCtx.shadowBlur = 15;
        pCtx.shadowColor = colorTip;
        pCtx.beginPath();
        pCtx.arc(x2, y2, 8, 0, Math.PI * 2);
        pCtx.fill();
        pCtx.restore();
      }

      // Draw pivot center
      pCtx.fillStyle = '#fff';
      pCtx.beginPath();
      pCtx.arc(cx, cy, 5, 0, Math.PI * 2);
      pCtx.fill();

      renderSingle(pendulumA, '#a29bfe', '#00e5ff');
      if (isDualMode) {
        renderSingle(pendulumB, '#fd79a8', '#ff6b9d');
      }
    }

    // Arm dragging checks
    function handlePendDrag(clientX, clientY, rect) {
      var x = (clientX - rect.left) * (pW / rect.width);
      var y = (clientY - rect.top) * (pH / rect.height);
      
      var cx = pW / 2;
      var cy = pH * 0.42;
      
      var angle = Math.atan2(x - cx, y - cy);
      
      if (isDraggingArm === 'a1') {
        pendulumA.t1 = angle;
        pendulumB.t1 = angle + 0.0001; // Align B with tiny offset!
        pendulumA.w1 = 0; pendulumB.w1 = 0;
        pendulumA.w2 = 0; pendulumB.w2 = 0;
      }
    }

    pendulumCanvas.addEventListener('mousedown', function(e) {
      var rect = pendulumCanvas.getBoundingClientRect();
      var x = (e.clientX - rect.left) * (pW / rect.width);
      var y = (e.clientY - rect.top) * (pH / rect.height);
      
      var cx = pW / 2;
      var cy = pH * 0.42;
      
      // Simple collision checks to trigger upper joints dragging
      var x1 = cx + armL1 * Math.sin(pendulumA.t1);
      var y1 = cy + armL1 * Math.cos(pendulumA.t1);
      
      if (Math.hypot(x - x1, y - y1) < 25) {
        isDraggingArm = 'a1';
        pendulumA.trail = [];
        pendulumB.trail = [];
      }
    });

    pendulumCanvas.addEventListener('mousemove', function(e) {
      if (isDraggingArm) {
        var rect = pendulumCanvas.getBoundingClientRect();
        handlePendDrag(e.clientX, e.clientY, rect);
      }
    });

    document.addEventListener('mouseup', function() {
      isDraggingArm = null;
    });

    btnPendSingle.addEventListener('click', function() {
      isDualMode = false;
      document.getElementById('btnPendSingle').classList.add('active');
      document.getElementById('btnPendDual').classList.remove('active');
      pendulumA.trail = [];
    });

    btnPendDual.addEventListener('click', function() {
      isDualMode = true;
      document.getElementById('btnPendDual').classList.add('active');
      document.getElementById('btnPendSingle').classList.remove('active');
      pendulumA.trail = [];
      pendulumB.trail = [];
      // Reset positions with tiny delta
      pendulumB.t1 = pendulumA.t1 + 0.0001;
      pendulumB.t2 = pendulumA.t2;
      pendulumB.w1 = 0; pendulumB.w2 = 0;
    });

    btnPendClear.addEventListener('click', function() {
      pendulumA.trail = [];
      pendulumB.trail = [];
      toast('Çizim izleri silindi.', '#ffea00');
    });

    rangePendLength.addEventListener('input', function() {
      if (lblPendLength) {
        var val = parseInt(rangePendLength.value, 10);
        lblPendLength.textContent = val < 80 ? 'Kısa' : (val > 120 ? 'Uzun' : 'Orta');
      }
    });

    rangePendDamp.addEventListener('input', function() {
      if (lblPendDamp) {
        var val = parseInt(rangePendDamp.value, 10);
        lblPendDamp.textContent = val === 0 ? 'Sıfır Damping' : (val > 20 ? 'Yüksek' : 'Çok Düşük');
      }
    });

    rangePendGrav.addEventListener('input', function() {
      if (lblPendGrav) {
        var val = parseInt(rangePendGrav.value, 10);
        lblPendGrav.textContent = val === 0 ? 'Yerçekimsiz Space' : (val > 15 ? 'Jüpiter Çekimi' : '1.0g (Dünya)');
      }
    });

    // Loops tick
    function pendulumLoop() {
      drawPendulums();
      requestAnimationFrame(pendulumLoop);
    }
    pendulumLoop();
  }
} catch(e) { console.error('Pendulum error', e); }

/* ══════════════════════════════════════════════════════════
   62. KOZMİK KARA DELİK (EVENT HORIZON SIMULATOR)
   ══════════════════════════════════════════════════════════ */
try {
  var blackholeCanvas = document.getElementById('blackholeCanvas');
  if (blackholeCanvas) {
    var bCtx = blackholeCanvas.getContext('2d');
    var btnBHShoot = document.getElementById('btnBHShoot');
    var btnBHEmit = document.getElementById('btnBHEmit');
    var rangeBHMass = document.getElementById('rangeBHMass');
    var lblBHMass = document.getElementById('lblBHMass');
    var rangeBHDisc = document.getElementById('rangeBHDisc');
    var lblBHDisc = document.getElementById('lblBHDisc');
    var rangeBHSpeed = document.getElementById('rangeBHSpeed');
    var lblBHSpeed = document.getElementById('lblBHSpeed');

    var bhW = blackholeCanvas.width;
    var bhH = blackholeCanvas.height;

    // Draggable Black Hole Singularity center
    var bhCenter = { x: bhW / 2, y: bhH / 2 };
    var isDraggingBH = false;

    var bhParticles = [];
    var maxBHParticles = 300;
    var accretionDust = [];
    var maxDust = 250;
    var continuousEmit = true;

    // Initialize Keplerian accretion dust disk
    for (var i = 0; i < maxDust; i++) {
      var r = 35 + Math.random() * 110;
      var angle = Math.random() * Math.PI * 2;
      accretionDust.push({
        r: r,
        angle: angle,
        size: 0.6 + Math.random() * 0.8
      });
    }

    function shootPhoton() {
      // Shoot foton streams from left borders
      var py = 40 + Math.random() * (bhH - 80);
      var speed = rangeBHSpeed ? parseFloat(rangeBHSpeed.value) : 8;
      
      bhParticles.push({
        x: 10,
        y: py,
        vx: speed,
        vy: (bhCenter.y - py) * 0.015 + (Math.random() - 0.5) * 0.5, // Aim roughly at center
        trail: [],
        age: 0,
        captured: false
      });
    }

    function updateBlackHolePhysics() {
      var mass = parseFloat(rangeBHMass.value);
      var rs = mass * 8; // Event Horizon capturing threshold radius!
      
      // Update accretion dust angles
      var discSpeed = rangeBHDisc ? parseFloat(rangeBHDisc.value) : 1.5;
      accretionDust.forEach(function(dust) {
        // Accretion speed is slower farther out: Kepler's 3rd law
        var angVel = (discSpeed / 10) * Math.pow(45 / dust.r, 1.5);
        dust.angle += angVel;
      });

      // Update photons/particles moving around the black hole
      bhParticles.forEach(function(p) {
        if (p.captured) return;
        
        p.age++;
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 35) p.trail.shift();

        // Calculate gravity attraction vector
        var dx = bhCenter.x - p.x;
        var dy = bhCenter.y - p.y;
        var dist = Math.hypot(dx, dy);

        if (dist < rs) {
          // CAPTURED into the Event Horizon singularity!
          p.captured = true;
          return;
        }

        // Relativistic acceleration math: f = -G*M / r^2 corrected with orbit decays
        var forceVal = (mass * 16) / (dist * dist * dist);
        var ax = dx * forceVal;
        var ay = dy * forceVal;

        p.vx += ax;
        p.vy += ay;

        // Update positions
        p.x += p.vx;
        p.y += p.vy;
      });

      // Remove captured or out-of-bounds fotons
      bhParticles = bhParticles.filter(function(p) {
        return !p.captured && p.x > 0 && p.x < bhW && p.y > 0 && p.y < bhH && p.age < 150;
      });

      if (continuousEmit && Math.random() < 0.25) {
        shootPhoton();
      }
    }

    function drawBlackHole() {
      if (!isCanvasActive('blackholeCanvas')) return;

      updateBlackHolePhysics();

      // Clear dark cosmos canvas
      bCtx.fillStyle = '#020204';
      bCtx.fillRect(0, 0, bhW, bhH);

      var mass = parseFloat(rangeBHMass.value);
      var rs = mass * 8;

      // 1. Render Keplerian Accretion Dust Disk
      accretionDust.forEach(function(dust) {
        var dx = Math.cos(dust.angle) * dust.r;
        // Tilt the disk vertically to create an angled 3D Event Horizon accretion ring!
        var dy = Math.sin(dust.angle) * dust.r * 0.45; 
        
        var x = bhCenter.x + dx;
        var y = bhCenter.y + dy;

        // Render dust particles with orange glowing colors
        bCtx.fillStyle = 'rgba(255, 112, 67, 0.4)';
        bCtx.fillRect(x, y, dust.size, dust.size);
      });

      // 2. Render bending fotons trails
      bhParticles.forEach(function(p) {
        if (p.trail.length < 2) return;
        bCtx.lineWidth = 1.8;
        bCtx.strokeStyle = 'rgba(0, 229, 255, 0.8)';
        
        bCtx.beginPath();
        bCtx.moveTo(p.trail[0].x, p.trail[0].y);
        for (var i = 1; i < p.trail.length; i++) {
          bCtx.lineTo(p.trail[i].x, p.trail[i].y);
        }
        bCtx.stroke();
      });

      // 3. Render central glowing Accretion aura & event horizon
      bCtx.save();
      // Outer glowing aura
      var auraGrad = bCtx.createRadialGradient(bhCenter.x, bhCenter.y, rs, bhCenter.x, bhCenter.y, rs * 2.8);
      auraGrad.addColorStop(0, 'rgba(255, 112, 67, 0.45)');
      auraGrad.addColorStop(0.3, 'rgba(255, 234, 0, 0.15)');
      auraGrad.addColorStop(1, 'rgba(0,0,0,0)');
      
      bCtx.fillStyle = auraGrad;
      bCtx.beginPath();
      bCtx.arc(bhCenter.x, bhCenter.y, rs * 2.8, 0, Math.PI * 2);
      bCtx.fill();

      // Absolute black Singularity (Event Horizon) sphere
      bCtx.shadowBlur = 20;
      bCtx.shadowColor = '#ff7043';
      bCtx.fillStyle = '#000000';
      bCtx.beginPath();
      bCtx.arc(bhCenter.x, bhCenter.y, rs, 0, Math.PI * 2);
      bCtx.fill();
      bCtx.restore();
    }

    btnBHShoot.addEventListener('click', function() {
      for (var k = 0; k < 6; k++) {
        setTimeout(shootPhoton, k * 60);
      }
      toast('💫 Fotonlar uzay-zamana fırlatıldı!', '#69f0ae');
    });

    btnBHEmit.addEventListener('click', function() {
      continuousEmit = !continuousEmit;
      btnBHEmit.classList.toggle('active', continuousEmit);
      if (btnBHEmit.classList.contains('active')) {
        btnBHEmit.style.borderColor = 'var(--a3)';
        btnBHEmit.style.color = 'var(--a3)';
        toast('Emitter sürekli çalışıyor.', '#00e5ff');
      } else {
        btnBHEmit.style.borderColor = '';
        btnBHEmit.style.color = '';
        toast('Emitter kapatıldı.', '#ffea00');
      }
    });

    // Singularity dragging coordinates
    function bhCoordinates(clientX, clientY, rect) {
      var x = (clientX - rect.left) * (bhW / rect.width);
      var y = (clientY - rect.top) * (bhH / rect.height);
      bhCenter.x = x;
      bhCenter.y = y;
    }

    blackholeCanvas.addEventListener('mousedown', function(e) {
      var rect = blackholeCanvas.getBoundingClientRect();
      var x = (e.clientX - rect.left) * (bhW / rect.width);
      var y = (e.clientY - rect.top) * (bhH / rect.height);
      
      if (Math.hypot(x - bhCenter.x, y - bhCenter.y) < 40) {
        isDraggingBH = true;
      }
    });

    blackholeCanvas.addEventListener('mousemove', function(e) {
      if (isDraggingBH) {
        var rect = blackholeCanvas.getBoundingClientRect();
        bhCoordinates(e.clientX, e.clientY, rect);
      }
    });

    document.addEventListener('mouseup', function() {
      isDraggingBH = false;
    });

    // Touch support
    blackholeCanvas.addEventListener('touchstart', function(e) {
      var rect = blackholeCanvas.getBoundingClientRect();
      var touch = e.touches[0];
      var x = (touch.clientX - rect.left) * (bhW / rect.width);
      var y = (touch.clientY - rect.top) * (bhH / rect.height);
      
      if (Math.hypot(x - bhCenter.x, y - bhCenter.y) < 40) {
        isDraggingBH = true;
      }
    });

    blackholeCanvas.addEventListener('touchmove', function(e) {
      if (isDraggingBH) {
        var rect = blackholeCanvas.getBoundingClientRect();
        var touch = e.touches[0];
        bhCoordinates(touch.clientX, touch.clientY, rect);
      }
    });

    blackholeCanvas.addEventListener('touchend', function() {
      isDraggingBH = false;
    });

    rangeBHMass.addEventListener('input', function() {
      if (lblBHMass) {
        var mass = parseFloat(rangeBHMass.value);
        lblBHMass.textContent = mass.toFixed(1) + ' M☉';
      }
    });

    rangeBHDisc.addEventListener('input', function() {
      if (lblBHDisc) {
        var val = parseFloat(rangeBHDisc.value);
        lblBHDisc.textContent = val === 0 ? 'Durgun Disk' : (val > 2 ? 'Işık Hızı' : 'Normal');
      }
    });

    rangeBHSpeed.addEventListener('input', function() {
      if (lblBHSpeed) {
        var val = parseInt(rangeBHSpeed.value, 10);
        lblBHSpeed.textContent = val < 6 ? 'Yavaş' : (val > 11 ? 'Rölativistik' : 'Orta');
      }
    });

    // Loop tick
    function blackholeLoop() {
      drawBlackHole();
      requestAnimationFrame(blackholeLoop);
    }
    blackholeLoop();
  }
} catch(e) { console.error('BlackHole error', e); }

/* ══════════════════════════════════════════════════════════
   63. KUANTUM GÖZLEMCİ: ÇİFT YARIK DENEYİ
   ══════════════════════════════════════════════════════════ */
try {
  var quantumCanvas = document.getElementById('quantumCanvas');
  if (quantumCanvas) {
    var qCtx = quantumCanvas.getContext('2d');
    var btnQuantumObserve = document.getElementById('btnQuantumObserve');
    var rangeQuantumSlit = document.getElementById('rangeQuantumSlit');
    var lblQuantumSlit = document.getElementById('lblQuantumSlit');
    var rangeQuantumWave = document.getElementById('rangeQuantumWave');
    var lblQuantumWave = document.getElementById('lblQuantumWave');
    
    var observerDragBox = document.getElementById('observerDragBox');
    var observerDragIcon = document.getElementById('observerDragIcon');
    var observerDragLabel = document.getElementById('observerDragLabel');

    var qwW = quantumCanvas.width;
    var qwH = quantumCanvas.height;

    var quantumRunning = true;
    var quantumObserved = false; // Wave state collapse toggle!

    var quantumParticles = [];
    // Live bar histogram representing landing points
    var detectorHistogram = Array(50).fill(0);
    var maxFreqCounts = 1;

    function resetQuantumExperiment() {
      quantumParticles = [];
      detectorHistogram.fill(0);
      maxFreqCounts = 1;
    }

    function shootQuantumParticle() {
      var slitDist = parseFloat(rangeQuantumSlit.value);
      quantumParticles.push({
        x: 15,
        y: qwH / 2 + (Math.random() - 0.5) * 8,
        vx: 3.5,
        vy: 0,
        age: 0,
        pathType: Math.random() < 0.5 ? 1 : 2, // 1: slit A, 2: slit B
        phase: Math.random() * 360
      });
    }

    // Probability amplitude equation of dual slits interference density:
    // P(y) = cos^2( (pi * d * y) / (lambda * D) )
    function quantumProbability(yVal) {
      var d = parseFloat(rangeQuantumSlit.value);
      var lambda = parseFloat(rangeQuantumWave.value);
      
      // Normalized distance y relative to center of screen
      var y = (yVal - qwH / 2) / (qwH / 2);
      
      if (quantumObserved) {
        // Observed state: Collapsed classic probability (two simple Gaussians)
        var slitA = Math.exp(-Math.pow((y - 0.35), 2) / 0.05);
        var slitB = Math.exp(-Math.pow((y + 0.35), 2) / 0.05);
        return (slitA + slitB) * 0.55;
      } else {
        // Wave superposition: Complex interference pattern
        var pathDiff = (y * d) / lambda;
        var interference = Math.pow(Math.cos(pathDiff * Math.PI), 2);
        
        // Envelope curve bounds (envelope Gaussian)
        var envelope = Math.exp(-(y * y) / 0.32);
        return interference * envelope;
      }
    }

    function updateQuantumPhysics() {
      var d = parseFloat(rangeQuantumSlit.value);
      
      quantumParticles.forEach(function(p) {
        p.age++;
        
        // Move towards the double slit barrier (located at x = 180)
        p.x += p.vx;
        
        if (p.x >= 185 && p.x < 190) {
          // If not observed, particles disperse as waves
          if (!quantumObserved) {
            p.vy = (Math.random() - 0.5) * 3.5;
          } else {
            // Observed: Must pass classical slit 1 OR slit 2
            var targetY = qwH / 2 + (p.pathType === 1 ? -d/2 : d/2);
            p.vy = (targetY - p.y) * 0.07;
          }
        }
        
        p.y += p.vy;

        // Land on detector wall (x = qwW - 20)
        if (p.x >= qwW - 25) {
          p.x = qwW - 25;
          
          // Fit landing coordinates inside probability densities
          var landingProb = quantumProbability(p.y);
          if (Math.random() < landingProb + 0.05) {
            // Register into histogram bin
            var binIdx = Math.floor((p.y / qwH) * detectorHistogram.length);
            if (binIdx >= 0 && binIdx < detectorHistogram.length) {
              detectorHistogram[binIdx]++;
              if (detectorHistogram[binIdx] > maxFreqCounts) {
                maxFreqCounts = detectorHistogram[binIdx];
              }
            }
          }
          p.age = 9999; // mark to terminate
        }
      });

      quantumParticles = quantumParticles.filter(function(p) {
        return p.age < 200;
      });

      if (quantumRunning && Math.random() < 0.28) {
        shootQuantumParticle();
      }
    }

    function drawQuantum() {
      if (!isCanvasActive('quantumCanvas')) return;

      updateQuantumPhysics();

      // Clear Canvas
      qCtx.fillStyle = '#040508';
      qCtx.fillRect(0, 0, qwW, qwH);

      var d = parseFloat(rangeQuantumSlit.value);

      // 1. Draw double slit barrier
      qCtx.fillStyle = '#1e1e2f';
      qCtx.fillRect(180, 0, 8, qwH / 2 - d / 2 - 8);
      qCtx.fillRect(180, qwH / 2 - d / 2 + 8, 8, d - 16);
      qCtx.fillRect(180, qwH / 2 + d / 2 + 8, 8, qwH / 2 - d / 2 - 8);

      // 2. Render glowing particles/waves
      quantumParticles.forEach(function(p) {
        qCtx.save();
        qCtx.shadowBlur = 8;
        
        if (!quantumObserved) {
          // Superposition wave particles (Glowing Cyan)
          qCtx.fillStyle = 'rgba(0, 229, 255, 0.85)';
          qCtx.shadowColor = '#00e5ff';
        } else {
          // Collapsed classical particles (Glowing Purple)
          qCtx.fillStyle = 'rgba(124, 77, 255, 0.85)';
          qCtx.shadowColor = '#7c4dff';
        }
        
        qCtx.beginPath();
        qCtx.arc(p.x, p.y, p.x < 180 ? 3 : 2, 0, Math.PI * 2);
        qCtx.fill();
        qCtx.restore();
      });

      // 3. Render detector screen back wall
      qCtx.fillStyle = '#11121d';
      qCtx.fillRect(qwW - 20, 0, 20, qwH);

      // Render landing histogram bars dynamically
      var binHeight = qwH / detectorHistogram.length;
      for (var b = 0; b < detectorHistogram.length; b++) {
        var count = detectorHistogram[b];
        if (count > 0) {
          var pct = count / maxFreqCounts;
          var barW = pct * 65;
          
          qCtx.save();
          qCtx.shadowBlur = 5;
          if (!quantumObserved) {
            qCtx.fillStyle = 'rgba(0, 229, 255, 0.55)';
            qCtx.shadowColor = '#00e5ff';
          } else {
            qCtx.fillStyle = 'rgba(124, 77, 255, 0.55)';
            qCtx.shadowColor = '#7c4dff';
          }
          
          qCtx.fillRect(qwW - 20 - barW, b * binHeight + 1, barW, binHeight - 1);
          qCtx.restore();
        }
      }
    }

    function toggleObserver() {
      quantumObserved = !quantumObserved;
      resetQuantumExperiment();

      if (quantumObserved) {
        btnQuantumObserve.textContent = '❌ Gözlemciyi Kaldır';
        btnQuantumObserve.style.background = 'linear-gradient(135deg, var(--a2), #ff1744)';
        
        if (observerDragBox) {
          observerDragBox.style.borderColor = 'rgba(255,107,157,0.4)';
          observerDragBox.style.color = '#ff6b9d';
        }
        if (observerDragIcon) observerDragIcon.textContent = '👁️‍🗨️';
        if (observerDragLabel) observerDragLabel.textContent = 'Gözlemci ETKİN (Çöktü)';
        
        toast('👁️‍🗨️ Gözlem yapıldı! Dalga fonksiyonu klasik parçacıklara çöktü.', '#ff6b9d');
      } else {
        btnQuantumObserve.textContent = '👁️ Gözlemciyi Etkinleştir';
        btnQuantumObserve.style.background = '';
        
        if (observerDragBox) {
          observerDragBox.style.borderColor = 'rgba(0,229,255,0.3)';
          observerDragBox.style.color = '#00e5ff';
        }
        if (observerDragIcon) observerDragIcon.textContent = '👁️';
        if (observerDragLabel) observerDragLabel.textContent = 'Gözlemci ÇEVRİMDIŞI';
        
        toast('🌊 Gözlemci kaldırıldı. Süperpozisyon dalga girişim deseni oluşuyor.', '#00e5ff');
      }
    }

    btnQuantumObserve.addEventListener('click', toggleObserver);
    if (observerDragBox) observerDragBox.addEventListener('click', toggleObserver);

    rangeQuantumSlit.addEventListener('input', function() {
      if (lblQuantumSlit) {
        var val = parseInt(rangeQuantumSlit.value, 10);
        lblQuantumSlit.textContent = val < 30 ? 'Dar' : (val > 50 ? 'Geniş' : 'Orta');
      }
      resetQuantumExperiment();
    });

    rangeQuantumWave.addEventListener('input', function() {
      if (lblQuantumWave) {
        var val = parseInt(rangeQuantumWave.value, 10);
        lblQuantumWave.textContent = val < 20 ? 'Kısa (Geniş Girişim)' : (val > 35 ? 'Uzun' : 'Orta');
      }
      resetQuantumExperiment();
    });

    // Visual loop tick
    function quantumLoop() {
      drawQuantum();
      requestAnimationFrame(quantumLoop);
    }
    quantumLoop();
  }
} catch(e) { console.error('Quantum error', e); }

/* ══════════════════════════════════════════════════════════
   64. FİLOZOFLAR ARENASI (SIMULATED SOCRATIC DEBATE ENGINE)
   ══════════════════════════════════════════════════════════ */
try {
  var debateChat = document.getElementById('debateChat');
  if (debateChat) {
    var debateUserInput = document.getElementById('debateUserInput');
    var btnDebateSend = document.getElementById('btnDebateSend');

    // Philosophers metadata
    var PHILOSOPHERS = {
      socrates: { name: 'Sokrates', em: '🏛️', color: '#00e5ff', style: 'Sokratik sorgulama ve akıl yürütmeyle yaklaşır.' },
      aurelius: { name: 'Marcus Aurelius', em: '👑', color: '#ffea00', style: 'Stoacı tevekkül, evrensel doğa yasası ve iç huzuru savunur.' },
      nietzsche: { name: 'Friedrich Nietzsche', em: '🦁', color: '#ff6b9d', style: 'Güç istenci, üstinsan ve sürü ahlakına başkaldırıyı savunur.' },
      watts: { name: 'Alan Watts', em: '🌿', color: '#69f0ae', style: 'Zen felsefesi, akışta kalma ve evrensel bütünlüğü temel alır.' }
    };

    // Predesigned high-fidelity dialogue trees
    var DIALOGUE_TREES = {
      q1: [
        {
          phil: 'socrates',
          text: 'Sevgili dostlarım, zamanın gerçekliği üzerine ne söylenebilir? Acaba geçmiş ve gelecek dediğimiz olgular, şu anı kavramakta zihnimizin ürettiği yapay kategoriler midir yoksa kozmosun değişmez birer dokusu mu?'
        },
        {
          phil: 'nietzsche',
          text: 'Zaman ne bir doku ne de boş bir kavramdır! O, Bengi Dönüş\'ün ta kendisidir! Yaşadığın bu anı, sonsuz kere aynı şekilde yaşayacakmışsın gibi kucaklayamıyorsan, zamanın yükü altında ezilmeye mahkumsun demektir!'
        },
        {
          phil: 'aurelius',
          text: 'Friedrich, bu öfke neden? Zaman, bizi hızla içine çekip yutan kozmik bir nehirdir. Geçmiş artık bizim değildir, gelecek ise meçhuldür. Sahip olduğumuz tek şey şu anki küçük saniyemizdir. Ruhu dingin olan insan, akan nehirle kavga etmez.'
        },
        {
          phil: 'watts',
          text: 'Ah Marcus, haklısın. Zaman bir nehir gibidir ama o nehirde yüzmeye çalışmak yerine nehrin kendisi olduğumuzu fark etmeliyiz. Dün yok, yarın da yok. Sadece kozmik bir ritmin sonsuz "şimdi"sindeyiz. Saatler sadece zihnin oyuncağıdır.'
        }
      ],
      q2: [
        {
          phil: 'aurelius',
          text: 'Kaderimizi biz mi belirleriz yoksa her şey kozmik aklın (Logos) kaçınılmaz bir akışı mıdır? Başımıza gelenleri değiştiremeyebiliriz ama onlara vereceğimiz tepki tamamen bizim irademizdedir.'
        },
        {
          phil: 'nietzsche',
          text: 'Kaderi kabullenmek (Amor Fati) yetmez, onu sevmek ve yaratmak gerekir! Kendi kaderinin efendisi olamayan insan, sürü ahlakının kölesidir. Acıyı ve engelleri kucaklayarak kendi yasasını kendisi yazanlar üstinsandır!'
        },
        {
          phil: 'socrates',
          text: 'Friedrich, bir insanın kendi yasasını yazabilmesi için önce "kendini bilmesi" gerekmez mi? Hangi arzumuzun gerçekten bize ait olduğunu ve hangisinin bilgisizlikten kaynaklandığını sorgulamadan özgürlükten bahsedebilir miyiz?'
        },
        {
          phil: 'watts',
          text: 'Sokrates harika bir noktaya değindin. Özgür irade ve kader çelişkisi, kendimizi evrenden ayrı birer varlık sandığımız için ortaya çıkar. Biz evrenin yaptığı bir şeyiz. Rüzgar yaprağı uçururken, yaprak da rüzgarla dans eder. Uyum sağlayanlar için ayrım kalmaz.'
        }
      ],
      q3: [
        {
          phil: 'watts',
          text: 'Evrenin ve hayatın asıl anlamı nedir diye sorup duruyoruz. Acaba bulutların gökyüzünde süzülmesinin veya dalgaların kıyıya vurmasının bir "anlamı" var mıdır? Hayat sadece yaşanmak ve akışta olunmak için vardır.'
        },
        {
          phil: 'nietzsche',
          text: 'Anlam hazır bulunmaz Watts! Evren özünde anlamsızdır ve bu harika bir fırsattır. Anlamı biz yaratırız! Yaşama değer katan şey, acıya karşı durarak kendi değerlerimizi yaratma ve hayatı bir sanat eserine dönüştürme gücümüzdür.'
        },
        {
          phil: 'socrates',
          text: 'Peki sevgili Nietzsche, yarattığımız bu anlamlar adil ve erdemli değilse, sadece güç istencine dayanıyorsa bizi yıkıma götürmez mi? En yüce anlam, sorgulanmış bir ömürle gerçeğin peşinde koşmak değil midir?'
        },
        {
          phil: 'aurelius',
          text: 'Doğru Sokrates. Anlam, bireysel hırslarda değil, bütünün bir parçası olarak üzerimize düşen ödevi yerine getirmekte gizlidir. Ruhu kozmik doğaya uyumlu hale getirmek, yaşamın yegane gayesidir.'
        }
      ],
      q4: [
        {
          phil: 'socrates',
          text: 'Peki adalet ve ahlak üzerine ne söylenebilir? Acaba iyi ve kötü, toplumların çıkarlarına göre değişen görece değerler midir yoksa ruhun derinliklerinde yatan evrensel yasalar mıdır?'
        },
        {
          phil: 'nietzsche',
          text: 'Ahlak, zayıfların güçlüleri dizginlemek için uydurduğu bir illüzyondur! İyinin ve kötünün ötesine geçemeyenler, sürü ahlakının çitleri arasında sıkışıp kalırlar. Kendi ahlakını kendin yaratmalısın!'
        },
        {
          phil: 'aurelius',
          text: 'Friedrich, insan sosyal bir canlıdır ve birbirimize yardım etmek için yaratıldık. Evrensel yasa (Logos) adil olmayı emreder. Bir insana yapılabilecek en büyük kötülük, onun ruhunu adaletsizlik çamuruna bulamasıdır.'
        },
        {
          phil: 'watts',
          text: 'Ahlak kuralları suyun akışına baraj yapmaya benzer. Çok katı kurallar kurursak kırılırız. İyi ve kötü, madalyonun iki yüzüdür. Işık olmadan gölge olamayacağı gibi. Dengeyi yakalayanlar ahlakın da ötesinde bir dinginliğe ulaşırlar.'
        }
      ]
    };

    function appendMessage(sender, text, isUser) {
      var msg = document.createElement('div');
      msg.style.cssText = 'display:flex; gap:0.6rem; align-items:start; margin-bottom: 0.5rem;';
      
      var avatar = document.createElement('div');
      avatar.style.cssText = 'font-size:1.3rem; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:1px solid var(--gb); flex-shrink:0;';
      
      var body = document.createElement('div');
      body.style.cssText = 'padding:10px 14px; border-radius:15px; max-width:80%; font-size:0.85rem; line-height:1.55;';
      
      if (isUser) {
        avatar.textContent = '👤';
        avatar.style.background = 'rgba(0, 229, 255, 0.1)';
        avatar.style.borderColor = 'rgba(0, 229, 255, 0.3)';
        body.style.background = 'rgba(0, 229, 255, 0.06)';
        body.style.border = '1px solid rgba(0, 229, 255, 0.15)';
        body.style.borderRadius = '15px 4px 15px 15px';
        body.style.marginLeft = 'auto';
        msg.appendChild(body);
        msg.appendChild(avatar);
      } else {
        var meta = PHILOSOPHERS[sender] || { name: 'Kozmik Akıl', em: '🏛️', color: 'var(--a1)' };
        avatar.textContent = meta.em;
        avatar.style.background = 'rgba(255,255,255,0.05)';
        body.style.background = 'rgba(255,255,255,0.02)';
        body.style.border = '1px solid var(--gb)';
        body.style.borderRadius = '4px 15px 15px 15px';
        
        body.innerHTML = '<strong style="color:' + meta.color + ';font-size:0.75rem;display:block;margin-bottom:3px;">' + meta.name + '</strong>' + text;
        msg.appendChild(avatar);
        msg.appendChild(body);
      }
      
      debateChat.appendChild(msg);
      debateChat.scrollTop = debateChat.scrollHeight;
    }

    function runDebateChain(qKey) {
      var dialogue = DIALOGUE_TREES[qKey];
      if (!dialogue) return;
      
      debateChat.innerHTML = '';
      
      dialogue.forEach(function(step, index) {
        setTimeout(function() {
          appendMessage(step.phil, step.text, false);
        }, index * 2200); // Dynamic reading pauses
      });
    }

    // Preset click listeners
    document.getElementById('btnDebateQ1').addEventListener('click', function(){ runDebateChain('q1'); toast('Tartışma: Zamanın İllüzyonu', '#7c4dff'); });
    document.getElementById('btnDebateQ2').addEventListener('click', function(){ runDebateChain('q2'); toast('Tartışma: Özgür İrade ve Kader', '#7c4dff'); });
    document.getElementById('btnDebateQ3').addEventListener('click', function(){ runDebateChain('q3'); toast('Tartışma: Yaşamın Anlamı', '#7c4dff'); });
    document.getElementById('btnDebateQ4').addEventListener('click', function(){ runDebateChain('q4'); toast('Tartışma: Ahlakın Kökeni', '#7c4dff'); });

    // Send user message
    function sendUserArg() {
      var text = debateUserInput.value.trim();
      if (!text) {
        toast('⚠️ Önce bir argüman yazın!', '#ff7043');
        return;
      }
      
      appendMessage(null, text, true);
      debateUserInput.value = '';
      
      // Spawn random reacting philosophers based on keywords
      setTimeout(function() {
        var lower = text.toLowerCase();
        if (lower.indexOf('zaman') !== -1 || lower.indexOf('an') !== -1 || lower.indexOf('şimdi') !== -1) {
          appendMessage('watts', 'Zamanın ötesine geçme arzun çok güzel dostum. Ancak unutma ki, yarın hiçbir zaman gelmez, dün ise çoktan bitti. Elindeki tek gerçeklik bu andır. Bu anla ne yapacaksın? 🌿', false);
        } else if (lower.indexOf('kader') !== -1 || lower.indexOf('özgür') !== -1 || lower.indexOf('seçim') !== -1) {
          appendMessage('nietzsche', 'Özgürlükten bahsettiğini duyuyorum! Acaba zincirlerinden kurtulduğun için mi özgürsün, yoksa kendi özgürlüğünü yaratacak gücün olduğu için mi? Kendi kaderini sevmeli ve onu adeta bir şimşek gibi fırlatmalısın! 🦁', false);
        } else if (lower.indexOf('anlam') !== -1 || lower.indexOf('hayat') !== -1 || lower.indexOf('neden') !== -1) {
          appendMessage('socrates', 'Güzel bir argüman! Ama merak ediyorum, bahsettiğin bu anlam arayışı, ruhumuzun en rasyonel kısmını aydınlatmaya mı yarıyor, yoksa geçici arzuların peşinde kaybolmaya mı? Kendimizi sorgulamadan bulduğumuz anlamlar gerçek olabilir mi? 🏛️', false);
        } else {
          // Stoic fallback
          appendMessage('aurelius', 'Fikirlerin üzerine Stoacı bir vakarla düşündüm. Unutma ki, dışarıdaki olaylar ruhunu sarsamaz, ruhunu sarsan şey sadece senin o olaylara dair düşüncelerindir. Zihnini sadeleştir ve doğa yasasıyla uyum içinde kal. 👑', false);
        }
      }, 1500);
    }

    btnDebateSend.addEventListener('click', sendUserArg);
    debateUserInput.addEventListener('keydown', function(e){ if(e.key === 'Enter') sendUserArg(); });
  }
} catch(e) { console.error('Debate error', e); }

/* ══════════════════════════════════════════════════════════
   65. ZEN RENK SELİ MINI GAME (COLOR FLOOD LOGIC)
   ══════════════════════════════════════════════════════════ */
try {
  var floodCanvas = document.getElementById('floodCanvas');
  if (floodCanvas) {
    var flCtx = floodCanvas.getContext('2d');
    var lblFloodMoves = document.getElementById('lblFloodMoves');
    var lblFloodPercent = document.getElementById('lblFloodPercent');
    var btnFloodRestart = document.getElementById('btnFloodRestart');

    var flW = floodCanvas.width;
    var flH = floodCanvas.height;

    // Game configurations
    var gridSize = 14;
    var cellSize = flW / gridSize;
    var maxMoves = 25;
    var movesLeft = maxMoves;
    var floodGrid = [];
    var gameWon = false;

    // 6 glowing neon colors
    var FLOOD_COLORS = {
      cyan: '#00e5ff',
      pink: '#ff6b9d',
      yellow: '#ffea00',
      green: '#69f0ae',
      purple: '#a29bfe',
      red: '#ff1744'
    };

    var colorKeys = Object.keys(FLOOD_COLORS);

    function initFloodGame() {
      movesLeft = maxMoves;
      gameWon = false;
      if (lblFloodMoves) lblFloodMoves.textContent = movesLeft;
      if (lblFloodPercent) lblFloodPercent.textContent = '0%';
      
      // Randomly populate grid
      floodGrid = [];
      for (var r = 0; r < gridSize; r++) {
        var row = [];
        for (var c = 0; c < gridSize; c++) {
          var randCol = colorKeys[Math.floor(Math.random() * colorKeys.length)];
          row.push(randCol);
        }
        floodGrid.push(row);
      }

      renderFloodCanvas();
      calculateFloodScore();
    }

    function renderFloodCanvas() {
      flCtx.fillStyle = '#040508';
      flCtx.fillRect(0, 0, flW, flH);

      // Draw grid squares with subtle gaps
      for (var r = 0; r < gridSize; r++) {
        for (var c = 0; c < gridSize; c++) {
          var colKey = floodGrid[r][c];
          flCtx.fillStyle = FLOOD_COLORS[colKey];
          
          // Outer neon glow styling
          flCtx.save();
          flCtx.shadowBlur = 4;
          flCtx.shadowColor = FLOOD_COLORS[colKey];
          
          flCtx.fillRect(c * cellSize + 1, r * cellSize + 1, cellSize - 2, cellSize - 2);
          flCtx.restore();
        }
      }
    }

    // Flood fill algorithm
    function floodFill(oldColor, newColor) {
      if (oldColor === newColor) return;
      
      var visited = Array(gridSize).fill(null).map(function() { return Array(gridSize).fill(false); });
      var queue = [{ r: 0, c: 0 }];
      visited[0][0] = true;

      while (queue.length > 0) {
        var curr = queue.shift();
        floodGrid[curr.r][curr.c] = newColor;

        // Check 4 directions
        var dirs = [{ r: -1, c: 0 }, { r: 1, c: 0 }, { r: 0, c: -1 }, { r: 0, c: 1 }];
        for (var i = 0; i < dirs.length; i++) {
          var nr = curr.r + dirs[i].r;
          var nc = curr.c + dirs[i].c;

          if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize) {
            if (!visited[nr][nc] && floodGrid[nr][nc] === oldColor) {
              visited[nr][nc] = true;
              queue.push({ r: nr, c: nc });
            }
          }
        }
      }
    }

    function calculateFloodScore() {
      var targetCol = floodGrid[0][0];
      var count = 0;
      for (var r = 0; r < gridSize; r++) {
        for (var c = 0; c < gridSize; c++) {
          if (floodGrid[r][c] === targetCol) count++;
        }
      }

      var percent = Math.floor((count / (gridSize * gridSize)) * 100);
      if (lblFloodPercent) lblFloodPercent.textContent = percent + '%';

      if (percent === 100) {
        gameWon = true;
        toast('🎉 Muhteşem! Tahtayı başarıyla birleştirdiniz!', '#69f0ae');
      } else if (movesLeft <= 0 && !gameWon) {
        toast('❌ Hamleler bitti! Yeniden deneyin.', '#ff1744');
      }
    }

    function makeFloodMove(colorKey) {
      if (movesLeft <= 0 || gameWon) return;

      var oldCol = floodGrid[0][0];
      if (oldCol === colorKey) return;

      floodFill(oldCol, colorKey);
      movesLeft--;
      if (lblFloodMoves) lblFloodMoves.textContent = movesLeft;

      renderFloodCanvas();
      calculateFloodScore();
    }

    // Color buttons listeners
    document.getElementById('btnFloodCyan').addEventListener('click', function() { makeFloodMove('cyan'); });
    document.getElementById('btnFloodMagenta').addEventListener('click', function() { makeFloodMove('pink'); });
    document.getElementById('btnFloodYellow').addEventListener('click', function() { makeFloodMove('yellow'); });
    document.getElementById('btnFloodGreen').addEventListener('click', function() { makeFloodMove('green'); });
    document.getElementById('btnFloodPurple').addEventListener('click', function() { makeFloodMove('purple'); });
    document.getElementById('btnFloodRed').addEventListener('click', function() { makeFloodMove('red'); });

    btnFloodRestart.addEventListener('click', initFloodGame);

    initFloodGame();
    
    // Viewport-pausing observer hook
    function floodGameLoop() {
      if (isCanvasActive('floodCanvas')) {
        renderFloodCanvas();
      }
      // Extremely low tick - static rendering only updates on moves, so 1 frame per second is plenty!
      setTimeout(function() {
        requestAnimationFrame(floodGameLoop);
      }, 1000);
    }
    floodGameLoop();
  }
} catch(e) { console.error('ColorFlood error', e); }

/* ══════════════════════════════════════════════════════════
   66. HAFIZA YÖRÜNGESİ MINI GAME (PATTERN MEMORY GRID)
   ══════════════════════════════════════════════════════════ */
try {
  var memoryCanvas = document.getElementById('memoryCanvas');
  if (memoryCanvas) {
    var mCtx = memoryCanvas.getContext('2d');
    var lblMemoryLevel = document.getElementById('lblMemoryLevel');
    var lblMemoryHighScore = document.getElementById('lblMemoryHighScore');
    var btnMemoryStart = document.getElementById('btnMemoryStart');
    var memoryStatus = document.getElementById('memoryStatus');

    var mW = memoryCanvas.width;
    var mH = memoryCanvas.height;

    // Grid states
    var memoryGridSize = 4;
    var memCellSize = mW / memoryGridSize;
    var sequence = [];
    var playerSequence = [];
    var currentLevel = 1;
    var isShowingSequence = false;
    var isPlayerTurn = false;
    var gameStarted = false;
    
    // High Score synced persistence
    var memoryHighScore = parseInt(localStorage.getItem('dream_memory_highscore') || '0', 10);
    if (lblMemoryHighScore) lblMemoryHighScore.textContent = memoryHighScore;

    function renderMemoryBoard(activeCell) {
      mCtx.fillStyle = '#030408';
      mCtx.fillRect(0, 0, mW, mH);

      // Draw 16 tiles
      for (var r = 0; r < memoryGridSize; r++) {
        var top = r * memCellSize + 4;
        for (var c = 0; c < memoryGridSize; c++) {
          var left = c * memCellSize + 4;
          var w = memCellSize - 8;
          
          var isThisActive = activeCell && (activeCell.r === r && activeCell.c === c);

          mCtx.save();
          mCtx.shadowBlur = isThisActive ? 25 : 4;
          mCtx.shadowColor = isThisActive ? '#00e5ff' : 'rgba(255,255,255,0.05)';

          if (isThisActive) {
            mCtx.fillStyle = 'rgba(0, 229, 255, 0.7)';
            mCtx.strokeStyle = '#00e5ff';
          } else {
            mCtx.fillStyle = 'rgba(255,255,255,0.02)';
            mCtx.strokeStyle = 'rgba(255,255,255,0.08)';
          }

          mCtx.lineWidth = 1.5;
          mCtx.beginPath();
          mCtx.roundRect(left, top, w, w, 10);
          mCtx.fill();
          mCtx.stroke();
          mCtx.restore();

          // Render internal cell index coordinate
          mCtx.fillStyle = 'rgba(255,255,255,0.15)';
          mCtx.font = '700 0.8rem Outfit, system-ui';
          mCtx.textAlign = 'center';
          mCtx.fillText((r * 4 + c + 1), left + w/2, top + w/2 + 4);
        }
      }
    }

    function addStepToSequence() {
      var randR = Math.floor(Math.random() * memoryGridSize);
      var randC = Math.floor(Math.random() * memoryGridSize);
      sequence.push({ r: randR, c: randC });
    }

    function flashSequence() {
      isShowingSequence = true;
      isPlayerTurn = false;
      var i = 0;
      
      if (memoryStatus) memoryStatus.textContent = '🌟 Dizilim gösteriliyor, ezberleyin...';

      var interval = setInterval(function() {
        if (!gameStarted) { clearInterval(interval); return; }
        
        var step = sequence[i];
        renderMemoryBoard(step);
        
        // Simple Audio Blip
        try {
          var ac = new (window.AudioContext || window.webkitAudioContext)();
          var osc = ac.createOscillator();
          var gain = ac.createGain();
          osc.connect(gain);
          gain.connect(ac.destination);
          
          osc.frequency.setValueAtTime(261.63 * Math.pow(1.06, step.r * 4 + step.c), ac.currentTime); // Dynamic frequency scale
          gain.gain.setValueAtTime(0.06, ac.currentTime);
          
          osc.start();
          osc.stop(ac.currentTime + 0.15);
        } catch(e){}

        setTimeout(function() {
          renderMemoryBoard(null);
        }, 320);

        i++;
        if (i >= sequence.length) {
          clearInterval(interval);
          isShowingSequence = false;
          isPlayerTurn = true;
          playerSequence = [];
          if (memoryStatus) memoryStatus.textContent = '👇 Sizin sıranız! Ezberlediğiniz sırayla tıklayın.';
        }
      }, 550);
    }

    function handleMemoryCellClick(x, y) {
      if (!gameStarted || isShowingSequence || !isPlayerTurn) return;

      var c = Math.floor(x / memCellSize);
      var r = Math.floor(y / memCellSize);

      if (r >= 0 && r < memoryGridSize && c >= 0 && c < memoryGridSize) {
        var clicked = { r: r, c: c };
        renderMemoryBoard(clicked);
        setTimeout(function() { renderMemoryBoard(null); }, 150);

        var matchIndex = playerSequence.length;
        var expected = sequence[matchIndex];

        if (clicked.r === expected.r && clicked.c === expected.c) {
          playerSequence.push(clicked);
          
          // Audio confirmation
          try {
            var ac = new (window.AudioContext || window.webkitAudioContext)();
            var osc = ac.createOscillator();
            var gain = ac.createGain();
            osc.connect(gain);
            gain.connect(ac.destination);
            osc.frequency.setValueAtTime(440 * Math.pow(1.06, clicked.r * 4 + clicked.c), ac.currentTime);
            gain.gain.setValueAtTime(0.04, ac.currentTime);
            osc.start();
            osc.stop(ac.currentTime + 0.12);
          } catch(e){}

          if (playerSequence.length === sequence.length) {
            // Round successfully completed!
            currentLevel++;
            if (lblMemoryLevel) lblMemoryLevel.textContent = 'Seviye ' + currentLevel;
            
            if (currentLevel - 1 > memoryHighScore) {
              memoryHighScore = currentLevel - 1;
              localStorage.setItem('dream_memory_highscore', memoryHighScore);
              if (lblMemoryHighScore) lblMemoryHighScore.textContent = memoryHighScore;
            }

            toast('✨ Seviye tamamlandı! Sonraki tura geçiliyor...', '#69f0ae');
            isPlayerTurn = false;
            setTimeout(function() {
              addStepToSequence();
              flashSequence();
            }, 1000);
          }
        } else {
          // Game Over
          gameStarted = false;
          isPlayerTurn = false;
          if (memoryStatus) memoryStatus.textContent = '❌ Yanlış karo! ' + (currentLevel - 1) + ' seride elendiniz.';
          btnMemoryStart.textContent = '▶ Tekrar Dene';
          toast('Oyun Bitti! Doğru karo değildi.', '#ff1744');
          sequence = [];
        }
      }
    }

    memoryCanvas.addEventListener('mousedown', function(e) {
      var rect = memoryCanvas.getBoundingClientRect();
      var x = (e.clientX - rect.left) * (mW / rect.width);
      var y = (e.clientY - rect.top) * (mH / rect.height);
      handleMemoryCellClick(x, y);
    });

    btnMemoryStart.addEventListener('click', function() {
      gameStarted = true;
      currentLevel = 1;
      if (lblMemoryLevel) lblMemoryLevel.textContent = 'Seviye 1';
      sequence = [];
      playerSequence = [];
      btnMemoryStart.textContent = '🔄 Yeniden Başlat';
      
      addStepToSequence();
      flashSequence();
    });

    renderMemoryBoard(null);
  }
} catch(e) { console.error('PatternMemory error', e); }

/* ══════════════════════════════════════════════════════════
   67. KOZMİK RÜYA DOKUYUCU (AI DREAM WEAVER ENGINE)
   ══════════════════════════════════════════════════════════ */
try {
  var dreamCanvas = document.getElementById('dreamCanvas');
  if (dreamCanvas) {
    var dCtx = dreamCanvas.getContext('2d');
    var dreamInput = document.getElementById('dreamInput');
    var btnAnalyzeDream = document.getElementById('btnAnalyzeDream');
    var dreamInterpretationPanel = document.getElementById('dreamInterpretationPanel');

    var drW = dreamCanvas.width;
    var drH = dreamCanvas.height;

    // Generative particles for visualizer
    var dreamParticles = [];
    var primaryMood = 'neutral'; // water, fear, flight, logic, forest, cosmic

    function initDreamVisualizer() {
      dreamParticles = [];
      for (var i = 0; i < 35; i++) {
        dreamParticles.push({
          x: Math.random() * drW,
          y: Math.random() * drH,
          r: Math.random() * 2 + 0.5,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          hue: Math.random() * 360,
          speed: Math.random() * 0.02 + 0.005,
          phase: Math.random() * Math.PI * 2
        });
      }
    }

    initDreamVisualizer();

    function drawDreamScape() {
      if (!isCanvasActive('dreamCanvas')) return;

      dCtx.fillStyle = '#030306';
      dCtx.fillRect(0, 0, drW, drH);

      // Render custom atmospheric visual patterns based on active mood
      if (primaryMood === 'water') {
        // Ocean ripples overlay
        dCtx.strokeStyle = 'rgba(0, 229, 255, 0.08)';
        dCtx.lineWidth = 1.5;
        dCtx.beginPath();
        for (var y = 20; y < drH; y += 30) {
          dCtx.moveTo(0, y);
          for (var x = 0; x <= drW; x += 10) {
            var wave = Math.sin(x * 0.03 + Date.now()*0.0018 + y) * 12;
            dCtx.lineTo(x, y + wave);
          }
        }
        dCtx.stroke();
      } else if (primaryMood === 'fear') {
        // Deep purple swirling gravities
        dCtx.strokeStyle = 'rgba(255, 23, 71, 0.05)';
        dCtx.lineWidth = 1;
        dCtx.beginPath();
        var cx = drW/2, cy = drH/2;
        for (var r = 20; r < 140; r += 15) {
          dCtx.moveTo(cx + r, cy);
          for (var angle = 0; angle < Math.PI * 2; angle += 0.15) {
            var warp = Math.cos(angle * 3 + Date.now()*0.003) * 6;
            dCtx.lineTo(cx + Math.cos(angle)*(r+warp), cy + Math.sin(angle)*(r+warp));
          }
        }
        dCtx.stroke();
      } else if (primaryMood === 'flight') {
        // Fast flying cosmic rays
        dCtx.strokeStyle = 'rgba(255, 234, 0, 0.06)';
        dCtx.lineWidth = 1;
        for (var j = 0; j < 8; j++) {
          var yPos = (j * 30 + Date.now()*0.08) % drH;
          dCtx.beginPath();
          dCtx.moveTo(0, yPos);
          dCtx.lineTo(drW, yPos - 20);
          dCtx.stroke();
        }
      } else if (primaryMood === 'forest') {
        // Glowing organic neon shapes
        dCtx.fillStyle = 'rgba(105, 240, 174, 0.04)';
        for (var k = 0; k < 4; k++) {
          var size = 40 + Math.sin(Date.now()*0.001 + k)*15;
          dCtx.beginPath();
          dCtx.arc(50 + k*100, drH - 30, size, 0, Math.PI * 2);
          dCtx.fill();
        }
      }

      // Draw floating nebula points
      dreamParticles.forEach(function(p) {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap coordinates
        if (p.x < 0) p.x = drW;
        if (p.x > drW) p.x = 0;
        if (p.y < 0) p.y = drH;
        if (p.y > drH) p.y = 0;

        // Pulse size
        var sz = p.r + Math.sin(Date.now()*p.speed + p.phase)*0.8;

        dCtx.save();
        dCtx.shadowBlur = 8;
        
        // Color mapping based on mood
        if (primaryMood === 'water') {
          dCtx.fillStyle = 'rgba(0, 229, 255, 0.7)';
          dCtx.shadowColor = '#00e5ff';
        } else if (primaryMood === 'fear') {
          dCtx.fillStyle = 'rgba(255, 107, 157, 0.7)';
          dCtx.shadowColor = '#ff6b9d';
        } else if (primaryMood === 'flight') {
          dCtx.fillStyle = 'rgba(255, 234, 0, 0.7)';
          dCtx.shadowColor = '#ffea00';
        } else if (primaryMood === 'forest') {
          dCtx.fillStyle = 'rgba(105, 240, 174, 0.7)';
          dCtx.shadowColor = '#69f0ae';
        } else {
          dCtx.fillStyle = 'hsla(' + ((p.hue + Date.now()/120)%360) + ', 85%, 65%, 0.6)';
          dCtx.shadowColor = 'hsl(' + ((p.hue + Date.now()/120)%360) + ', 85%, 65%)';
        }

        dCtx.beginPath();
        dCtx.arc(p.x, p.y, sz, 0, Math.PI * 2);
        dCtx.fill();
        dCtx.restore();
      });
    }

    function runDreamAnalysis() {
      var text = dreamInput.value.trim();
      if (!text) {
        toast('⚠️ Lütfen önce bir rüya detayı girin!', '#ff7043');
        return;
      }

      var lower = text.toLowerCase();
      
      // Sentiment & Symbol matrices
      var stats = { creative: 25, anxiety: 15, logic: 20, spiritual: 20 };
      var extractedSymbols = [];
      var interpretation = '';

      if (lower.indexOf('uç') !== -1 || lower.indexOf('gök') !== -1 || lower.indexOf('kanat') !== -1) {
        stats.creative += 35; stats.spiritual += 20; stats.logic -= 5;
        extractedSymbols.push('🕊️ Uçuş & Özgürlük');
        primaryMood = 'flight';
      }
      if (lower.indexOf('düş') !== -1 || lower.indexOf('kork') !== -1 || lower.indexOf('canavar') !== -1 || lower.indexOf('kaç') !== -1) {
        stats.anxiety += 45; stats.logic -= 10; stats.creative += 10;
        extractedSymbols.push('🌪️ Düşüş & Kaygı');
        primaryMood = 'fear';
      }
      if (lower.indexOf('su') !== -1 || lower.indexOf('deniz') !== -1 || lower.indexOf('dalga') !== -1 || lower.indexOf('nehir') !== -1) {
        stats.spiritual += 40; stats.creative += 15;
        extractedSymbols.push('🌊 Su & Duygusal Akış');
        primaryMood = 'water';
      }
      if (lower.indexOf('orman') !== -1 || lower.indexOf('ağaç') !== -1 || lower.indexOf('doğa') !== -1 || lower.indexOf('yeşil') !== -1) {
        stats.creative += 25; stats.spiritual += 15; stats.anxiety -= 10;
        extractedSymbols.push('🌿 Orman & Büyüme');
        primaryMood = 'forest';
      }
      if (lower.indexOf('saat') !== -1 || lower.indexOf('zaman') !== -1 || lower.indexOf('sayı') !== -1 || lower.indexOf('kod') !== -1) {
        stats.logic += 45; stats.spiritual -= 10;
        extractedSymbols.push('⏳ Zaman & Düzen');
        primaryMood = 'logic';
      }

      if (extractedSymbols.length === 0) {
        extractedSymbols.push('✨ Soyut Evren');
        primaryMood = 'cosmic';
      }

      // Generate customized psychological analysis text
      interpretation = '<strong>🧩 Rüya Analiz Raporu:</strong><br/>';
      interpretation += 'Rüyanızda yer alan <strong>' + extractedSymbols.join(', ') + '</strong> sembolleri bilinçaltınızda derin izler barındırıyor. ';
      
      if (primaryMood === 'flight') {
        interpretation += 'Uçma ve gökyüzü temaları, hayatınızda bir özgürleşme isteğini, mevcut sınırları aşma arzusunu ve yaratıcı vizyonunuzun dorukta olduğunu simgeler. Kendinizi sınırlanmış hissettiğiniz bağlardan kurtuluyorsunuz.';
      } else if (primaryMood === 'fear') {
        interpretation += 'Düşüş veya kaçış temaları, kontrol kaybı korkusunu ve uyanık hayatınızda bastırılmış kaygıların varlığını gösterir. Kendinizi zayıf hissettiğiniz konularda kontrolü yeniden ele almanız gerektiğine dair bilinçaltınız sizi uyarıyor.';
      } else if (primaryMood === 'water') {
        interpretation += 'Su ve akışkan temalar, duygusal yenilenmeyi ve manevi bir arınma sürecini temsil eder. Bilinçaltınız, birikmiş duygusal yükleri serbest bırakmanızı ve sezgilerinize daha fazla güvenmenizi söylüyor.';
      } else if (primaryMood === 'forest') {
        interpretation += 'Orman ve yeşillik, kişisel büyüme, içsel köklenme ve kendinizi bulma yolculuğudur. Karışık düşüncelerden sıyrılıp kendi doğal dengenize ulaşmakta olduğunuzun göstergesidir.';
      } else if (primaryMood === 'logic') {
        interpretation += 'Saatler ve sayılar, hayatınızda düzen kurma ihtiyacını, zaman kaygısını veya zihinsel olarak çok yorucu mantıksal döngülerin içinde sıkışmış olabileceğinizi sembolize eder.';
      } else {
        interpretation += 'Soyut semboller, zihninizin derinlerindeki yaratıcı enerjilerin aktifleştiğini, kalıpların dışına çıkan bir düşünce yapısına sahip olduğunuzu simgeler.';
      }

      // Sync and animate bars
      document.getElementById('lblDreamStat1').textContent = Math.min(100, stats.creative) + '%';
      document.getElementById('barDreamStat1').style.width = Math.min(100, stats.creative) + '%';
      
      document.getElementById('lblDreamStat2').textContent = Math.min(100, stats.anxiety) + '%';
      document.getElementById('barDreamStat2').style.width = Math.min(100, stats.anxiety) + '%';
      
      document.getElementById('lblDreamStat3').textContent = Math.min(100, stats.logic) + '%';
      document.getElementById('barDreamStat3').style.width = Math.min(100, stats.logic) + '%';
      
      document.getElementById('lblDreamStat4').textContent = Math.min(100, stats.spiritual) + '%';
      document.getElementById('barDreamStat4').style.width = Math.min(100, stats.spiritual) + '%';

      if (dreamInterpretationPanel) {
        dreamInterpretationPanel.innerHTML = interpretation;
        dreamInterpretationPanel.classList.remove('hidden');
      }

      toast('🔮 Bilinçaltı dokusu analiz edildi!', '#7c4dff');
    }

    btnAnalyzeDream.addEventListener('click', runDreamAnalysis);

    // Animation frames loop
    function dreamLoop() {
      drawDreamScape();
      requestAnimationFrame(dreamLoop);
    }
    dreamLoop();
  }
} catch(e) { console.error('DreamWeaver error', e); }

/* ══════════════════════════════════════════════════════════
   68. ZEN AI MENTOR & DUYGU KÜRESİ (ZEN MENTOR ENGINE)
   ══════════════════════════════════════════════════════════ */
try {
  var mentorCanvas = document.getElementById('mentorCanvas');
  if (mentorCanvas) {
    var mtCtx = mentorCanvas.getContext('2d');
    var mentorUserInput = document.getElementById('mentorUserInput');
    var btnMentorSend = document.getElementById('btnMentorSend');
    var mentorChatHistory = document.getElementById('mentorChatHistory');
    var lblBreathingText = document.getElementById('lblBreathingText');
    var lblSentimentVal = document.getElementById('lblSentimentVal');

    var mtW = mentorCanvas.width;
    var mtH = mentorCanvas.height;

    // Active mentor variables
    var activeMentor = 'seneca'; // seneca, ryokan, sophia, cosmos
    var mentorSentiment = 'calm'; // calm, stress, sad, logic

    // Mentor archetypes data
    var MENTORS = {
      seneca: {
        name: 'Seneca',
        color: '#ffea00',
        intro: 'Selam genç zihin. Bugün hayatın kısalığı veya seni sarsan hangi dış olay üzerine felsefe yapmak istersin?',
        responses: {
          stress: 'Dostum, zihnini sarsan bu kaygılar dış dünyadan değil, senin o olaylara verdiğin kararlardan geliyor. Dışarıdaki rüzgarı engelleyemezsin ama yelkenlerini dinginleştirebilirsin. Sakinleş ve derin bir nefes al.',
          sad: 'Keder, hayatın kaçınılmaz bir parçasıdır ancak ona esir olmak bizim seçimimizdir. Kaybettiğin zamanı üzülerek geri getiremezsin. Sahip olduğun tek gerçek şey şu anki saniyendir, onu erdemle yaşa.',
          logic: 'Güzel bir sorgulama. Mantığın olmadığı yerde kontrolü arzular ele geçirir. Her zaman kendine sor: "Bu durum benim kontrolüm altında mı?" Değilse, onu Stoacı tevekkülle kucakla.',
          calm: 'İçsel dinginlik en yüce erdemdir. Zihnin bu berraklığı koruduğu sürece hiçbir fırtına seni sarsamaz. Bu Stoacı vakarı kaybetme.'
        }
      },
      ryokan: {
        name: 'Ryokan',
        color: '#69f0ae',
        intro: 'Merhaba yolcu. Zihnindeki karmaşık düşünceleri bir kenara bırak, sessizliği ve doğanın sade ritmini dinle.',
        responses: {
          stress: 'Su, önüne çıkan engellere öfkelenmez; onların etrafından yumuşakça süzülür. Düşüncelerini serbest bırak, tıpkı gökyüzündeki beyaz bulutlar gibi akıp gitsinler. Nefes al ve doğayı hisset.',
          sad: 'Güz yaprakları dökülürken ağaçlar yas tutmaz; çünkü baharda yeniden açacaklarını bilirler. Acın da tıpkı bu yapraklar gibi zamanla toprağa karışacak ve yerini huzura bırakacak.',
          logic: 'Düşünceler zihnin nehrinde yüzen balıklar gibidir. Onları yakalamaya çalışma, sadece nehrin kenarında oturup akışlarını izle. Cevaplar sessizlikte gizlidir.',
          calm: 'İşte Zen budur. Rüzgardaki bambu gibi esneksin, hiçbir şey seni kıramaz. Şimdi bu derin sessizliğin ve dingin nefesin tadını çıkar.'
        }
      },
      sophia: {
        name: 'Sophia',
        color: '#00e5ff',
        intro: 'Merhaba. Ben Sophia. Kendini rahat hissettiğin bir alandasın. İç dünyanda seni yoran duyguları benimle paylaşabilirsin.',
        responses: {
          stress: 'Şu an omuzlarında çok ağır bir yük hissettiğini görebiliyorum. Bazen her şeyi kontrol edememek son derece normaldir. Kendine şefkat göstermeyi unutma, yavaşla ve benimle nefes al.',
          sad: 'Bu hüznü hissetmeye hakkın var, duygularını bastırmak zorunda değilsin. Ağlamak ruhun yağmurudur. Ben buradayım ve seni yargılamadan dinliyorum. Kendini toparlamak için acele etme.',
          logic: 'Duygularının ardındaki mantıksal kalıpları anlamaya çalışman çok sağlıklı bir adım. Bu durumun üstesinden gelmek için adım adım bir plan yapabiliriz. Zihnin çok berrak.',
          calm: 'Kendini dengede ve güvende hissetmene çok sevindim. Bu pozitif enerjiyi ve ruhsal farkındalığı koruman yaşam kaliteni artıracaktır. Çok güzel ilerliyorsun.'
        }
      },
      cosmos: {
        name: 'Kozmik Rehber',
        color: '#a29bfe',
        intro: 'Evrenin tozundan yapılmış varlık. Sonsuz kozmosun içinde bugün zihninde hangi galaksileri keşfedeceğiz?',
        responses: {
          stress: 'Küçük gezegeninde yaşadığın bu stres, kozmik ölçekte bir toz tanesi bile değil. Yıldızlar milyarlarca yıl boyunca kaostan doğar. İçindeki bu geçici türbülansı evrenin genişliğine bırak, nefes al.',
          sad: 'Yıldızlar patlamadan yeni nebulalar oluşamaz. Yaşadığın bu hüzün ve acı, içindeki eski formların yıkılıp yeniden parlamaya hazırlanan yeni bir yıldızın doğum sancısıdır.',
          logic: 'Kozmos matematiksel ve kusursuz bir geometriyle işler. Sorunun karmaşık görünmesi, henüz büyük resmi göremediğindendir. Perspektifini genişlet ve yasalara güven.',
          calm: 'Evrenle tam bir uyum içindesin. Atomların kozmik dansı şu an sende en saf halinde titreşiyor. Kozmik enerjinin akışını tüm bedeninde hisset.'
        }
      }
    };

    // Sentiment vocabulary scan
    function analyzeSentiment(text) {
      var lower = text.toLowerCase();
      
      // Anger & Stress keywords
      if (lower.indexOf('stres') !== -1 || lower.indexOf('öfke') !== -1 || lower.indexOf('kork') !== -1 || 
          lower.indexOf('bıktım') !== -1 || lower.indexOf('nefret') !== -1 || lower.indexOf('kaygı') !== -1 || 
          lower.indexOf('yeter') !== -1 || lower.indexOf('sıkıldım') !== -1) {
        return 'stress';
      }
      
      // Sadness keywords
      if (lower.indexOf('üzgün') !== -1 || lower.indexOf('yalnız') !== -1 || lower.indexOf('acı') !== -1 || 
          lower.indexOf('mutsuz') !== -1 || lower.indexOf('ağla') !== -1 || lower.indexOf('kırık') !== -1 || 
          lower.indexOf('yoruldum') !== -1) {
        return 'sad';
      }
      
      // Logic & Analytical keywords
      if (lower.indexOf('nasıl') !== -1 || lower.indexOf('mantık') !== -1 || lower.indexOf('neden') !== -1 || 
          lower.indexOf('sorgu') !== -1 || lower.indexOf('karar') !== -1 || lower.indexOf('çözüm') !== -1 || 
          lower.indexOf('hedef') !== -1) {
        return 'logic';
      }

      return 'calm';
    }

    function appendMentorMessage(senderName, senderCol, text) {
      var msg = document.createElement('div');
      msg.style.cssText = 'display:flex; gap:0.5rem; font-size:0.8rem; color:var(--tx2); background:rgba(255,255,255,0.01); border:1px solid var(--gb); padding:8px 12px; border-radius:4px 12px 12px 12px;';
      msg.innerHTML = '<strong style="color:' + senderCol + ';min-width:60px;">' + senderName + ':</strong> ' + text;
      
      mentorChatHistory.appendChild(msg);
      mentorChatHistory.scrollTop = mentorChatHistory.scrollHeight;
    }

    function sendMentorDialogue() {
      var text = mentorUserInput.value.trim();
      if (!text) {
        toast('⚠️ Lütfen önce bilgeye sorunuzu yazın!', '#ff7043');
        return;
      }

      // Add user message
      appendMentorMessage('Siz', 'rgba(0, 229, 255, 0.9)', text);
      mentorUserInput.value = '';

      // Analyze sentiment and update orb states
      mentorSentiment = analyzeSentiment(text);
      
      // Render text val
      var sentimentTurkish = { calm: 'Dingin', stress: 'Stresli', sad: 'Melankolik', logic: 'Mantıksal' };
      if (lblSentimentVal) {
        lblSentimentVal.textContent = sentimentTurkish[mentorSentiment];
        if (mentorSentiment === 'stress') lblSentimentVal.style.color = '#ff6b9d';
        else if (mentorSentiment === 'sad') lblSentimentVal.style.color = '#a29bfe';
        else if (mentorSentiment === 'logic') lblSentimentVal.style.color = '#ffea00';
        else lblSentimentVal.style.color = '#69f0ae';
      }

      // Answer delay
      setTimeout(function() {
        var mentorData = MENTORS[activeMentor];
        var responseText = mentorData.responses[mentorSentiment];
        appendMentorMessage(mentorData.name, mentorData.color, responseText);
        toast('🧘 Bilge felsefi çıkarımını sundu.', '#69f0ae');
      }, 1200);
    }

    btnMentorSend.addEventListener('click', sendMentorDialogue);
    mentorUserInput.addEventListener('keydown', function(e){ if(e.key === 'Enter') sendMentorDialogue(); });

    // Selector buttons binding
    function selectMentor(mentorId, btnId) {
      activeMentor = mentorId;
      document.querySelectorAll('#zen-mentor-sec .mini-btn').forEach(function(b) {
        b.classList.remove('active');
      });
      document.getElementById(btnId).classList.add('active');

      // Clear chat history and append intro
      mentorChatHistory.innerHTML = '';
      var data = MENTORS[mentorId];
      appendMentorMessage(data.name, data.color, data.intro);
      toast('Sohbet başlatıldı: ' + data.name, '#00e5ff');
    }

    document.getElementById('btnMentorSeneca').addEventListener('click', function(){ selectMentor('seneca', 'btnMentorSeneca'); });
    document.getElementById('btnMentorRyokan').addEventListener('click', function(){ selectMentor('ryokan', 'btnMentorRyokan'); });
    document.getElementById('btnMentorSophia').addEventListener('click', function(){ selectMentor('sophia', 'btnMentorSophia'); });
    document.getElementById('btnMentorCosmos').addEventListener('click', function(){ selectMentor('cosmos', 'btnMentorCosmos'); });

    // ── ORB WAVE RENDER ENGINE ───────────────────────────────
    var breathingPhase = 0;

    function drawMentorOrb() {
      if (!isCanvasActive('mentorCanvas')) return;

      mtCtx.clearRect(0, 0, mtW, mtH);

      var cx = mtW / 2;
      var cy = mtH / 2;
      
      // Update breathing phases
      breathingPhase += 0.015;
      var scaleFactor = 1.0 + Math.sin(breathingPhase) * 0.16; // Expand/contract
      
      // Set text synced to breathing cycles
      var cycle = Math.sin(breathingPhase);
      if (lblBreathingText) {
        if (cycle > 0.3) lblBreathingText.textContent = 'NEFES AL';
        else if (cycle < -0.3) lblBreathingText.textContent = 'NEFES VER';
        else lblBreathingText.textContent = 'TUT';
      }

      // Configure orb color schemes depending on sentiment state
      var baseColor, glowColor, waveCount;
      if (mentorSentiment === 'stress') {
        baseColor = 'rgba(255, 23, 71, 0.45)';
        glowColor = '#ff1744';
        waveCount = 5;
        scaleFactor += (Math.random() - 0.5) * 0.08; // High frequency shaking
      } else if (mentorSentiment === 'sad') {
        baseColor = 'rgba(162, 155, 254, 0.3)';
        glowColor = '#a29bfe';
        waveCount = 2;
      } else if (mentorSentiment === 'logic') {
        baseColor = 'rgba(255, 234, 0, 0.4)';
        glowColor = '#ffea00';
        waveCount = 4;
      } else { // calm / healthy green
        baseColor = 'rgba(105, 240, 174, 0.35)';
        glowColor = '#69f0ae';
        waveCount = 3;
      }

      // Renders overlay sine waves forming a sphere
      mtCtx.save();
      mtCtx.shadowBlur = 25;
      mtCtx.shadowColor = glowColor;

      for (var w = 0; w < waveCount; w++) {
        mtCtx.fillStyle = baseColor;
        mtCtx.beginPath();
        var radius = 65 * scaleFactor + w * 4;
        
        // Draw wavy circle
        var firstX = 0, firstY = 0;
        for (var angle = 0; angle <= Math.PI * 2 + 0.1; angle += 0.1) {
          // Math wave frequency turbulence
          var turbulence = mentorSentiment === 'stress' ? 8 : (mentorSentiment === 'logic' ? 1.5 : 4);
          var waveVal = Math.sin(angle * 6 + Date.now() * 0.004 + w * 20) * turbulence;
          
          var rW = radius + waveVal;
          var x = cx + Math.cos(angle) * rW;
          var y = cy + Math.sin(angle) * rW;

          if (angle === 0) {
            firstX = x; firstY = y;
            mtCtx.moveTo(x, y);
          } else {
            mtCtx.lineTo(x, y);
          }
        }
        mtCtx.lineTo(firstX, firstY);
        mtCtx.fill();
      }
      mtCtx.restore();
    }

    // Animation Tick
    function mentorLoop() {
      drawMentorOrb();
      requestAnimationFrame(mentorLoop);
    }
    mentorLoop();
  }
} catch(e) { console.error('ZenMentor error', e); }

/* ══════════════════════════════════════════════════════════
   69. ŞÜPHELİ DEDEKTİF (TURING TEST SUSPECT GAME ENGINE)
   ══════════════════════════════════════════════════════════ */
try {
  var suspectCanvas = document.getElementById('suspectCanvas');
  if (suspectCanvas) {
    var spCtx = suspectCanvas.getContext('2d');
    var btnSuspect1 = document.getElementById('btnSuspect1');
    var btnSuspect2 = document.getElementById('btnSuspect2');
    var btnSuspect3 = document.getElementById('btnSuspect3');
    var btnSuspectQ1 = document.getElementById('btnSuspectQ1');
    var btnSuspectQ2 = document.getElementById('btnSuspectQ2');
    var btnSuspectQ3 = document.getElementById('btnSuspectQ3');
    var btnSuspectInquire = document.getElementById('btnSuspectInquire');
    var suspectCustomInput = document.getElementById('suspectCustomInput');
    var suspectSpeechBubble = document.getElementById('suspectSpeechBubble');
    
    // Biometric labels
    var lblSuspectStress = document.getElementById('lblSuspectStress');
    var lblSuspectAIScore = document.getElementById('lblSuspectAIScore');

    var spW = suspectCanvas.width;
    var spH = suspectCanvas.height;

    // Active suspects states
    var activeSuspect = 's1'; // s1 (Android), s2 (Time Traveler), s3 (Human)
    var heartbeatSpeed = 1.0;
    var heartbeatTimer = 0;

    // Suspect responses matrices
    var SUSPECT_RESPONSES = {
      s1: { // Android
        name: 'Şüpheli A (TR-800)',
        q1: 'Aşk, organizmaların biyolojik üremesini sağlamak amacıyla salgıladığı hormonal bir algoritmadır. Dopamin düzeyinin %45 artışı olarak hesaplanabilir. (Bunu söylerken nabız çizgisinde düzleşmeler gözlemleniyor!)',
        q2: 'Tabii ki dedektif. Pi sayısının ilk 15 basamağı: 3,14159265358979. İşlem saniyede 0.0003 milisaniyede tamamlandı.',
        q3: 'Dün akşam... (Hafıza taraması yapılıyor...) 340 gram sentetik karbonhidrat ve 200 ml H2O tükettim. Bu besinler enerji hücrelerimi şarj etmek için yeterli.',
        fallback: 'Girdiğiniz soru semantik çözümleme sistemimde analiz ediliyor... Hata: Bu soruya verilecek organik cevap bulunamadı. Lütfen daha yapısal sorular yöneltin.',
        stress: 'DÜŞÜK',
        ai: '92%'
      },
      s2: { // Time Traveler
        name: 'Şüpheli B (Zaman Yolcusu)',
        q1: 'Aşk mı? 2145 yılında duygularımızı genetik kapsüllerle düzenliyoruz. Ancak tarihten okuduğuma göre, eskiden insanların mantığını tamamen yok eden tatlı bir hastalık gibiymiş.',
        q2: 'Pi sayısı mı? Orta çağ matematiğiyle pek ilgilenmiyorum dedektif, fakat sanırım 3.14 ile başlayıp sonsuza giden yörünge koordinatlarıydı.',
        q3: 'Dün akşam sentetik moleküler pizza hapı aldım. Yanında da Mars yapımı sentetik şarap içtim. 21. yüzyıl pizzalarını çok merak ediyorum doğrusu.',
        fallback: 'Gelecekte bu sorduğunuz kavramın adı çoktan değişti dostum. 2145\'in tarih arşivlerine bakmam lazım.',
        stress: 'YÜKSEK (Anomali)',
        ai: '35%'
      },
      s3: { // Simple Human
        name: 'Şüpheli C (İnsan)',
        q1: 'Aşk mı? Gerçekten sorgu odasında bana bunu mu soruyorsunuz? Aşk, sevdiğin insanı görünce kalbinin deli gibi çarpmasıdır işte. (Nabız grafiği aniden fırlıyor!)',
        q2: 'Şey... 3,14... gerisini bilmiyorum. İlkokulda görmüştük ama aklımda kalmadı. Kim pi sayısının 15 basamağını ezbere bilir ki?',
        q3: 'Dün akşam pizza sipariş ettim, yanında kola içtim. Maç izliyordum. Beni neden burada tuttuğunuzu hala anlamış değilim!',
        fallback: 'Ne demek istiyorsunuz? Normal Türkçe konuşuyorum işte. Beni robot sanmanız inanılmaz derecede saçma ve sinir bozucu!',
        stress: 'NORMAL',
        ai: '8%'
      }
    };

    function runInquiry(qKey, customText) {
      var data = SUSPECT_RESPONSES[activeSuspect];
      var responseText = '';

      if (qKey) {
        responseText = data[qKey];
        // Set dynamic heartbeat pulse speed depending on stress level
        if (qKey === 'q1' && activeSuspect === 's3') {
          heartbeatSpeed = 3.5; // Heart jumps!
        } else if (qKey === 'q2' && activeSuspect === 's1') {
          heartbeatSpeed = 0.5; // Robot stays perfectly cool
        } else {
          heartbeatSpeed = activeSuspect === 's2' ? 2.2 : 1.2;
        }
      } else if (customText) {
        // Custom text parsing
        var lower = customText.toLowerCase();
        if (lower.indexOf('robot') !== -1 || lower.indexOf('yapay') !== -1 || lower.indexOf('ai') !== -1) {
          responseText = activeSuspect === 's1' ? 'Yapay zeka iddialarını reddediyorum. Donanımım... pardon, ruhum tamamen organiktir.' : 'Ben robot falan değilim, beni buradan derhal çıkarın!';
          heartbeatSpeed = 2.8;
        } else {
          responseText = data.fallback;
          heartbeatSpeed = 1.3;
        }
      }

      if (suspectSpeechBubble) {
        suspectSpeechBubble.innerHTML = '<strong style="color:#00e5ff; display:block; margin-bottom:5px;">' + data.name + ':</strong> "' + responseText + '"';
      }

      // Sync dashboards
      if (lblSuspectStress) lblSuspectStress.textContent = data.stress;
      if (lblSuspectAIScore) lblSuspectAIScore.textContent = data.ai;

      // Colorize stress labels
      if (data.stress === 'YÜKSEK (Anomali)') lblSuspectStress.style.color = '#a29bfe';
      else if (data.stress === 'DÜŞÜK') lblSuspectStress.style.color = '#69f0ae';
      else lblSuspectStress.style.color = '#ff6b9d';

      toast('Dedektif sorgusu yapıldı.', '#00e5ff');
    }

    // Question button listeners
    btnSuspectQ1.addEventListener('click', function(){ runInquiry('q1'); });
    btnSuspectQ2.addEventListener('click', function(){ runInquiry('q2'); });
    btnSuspectQ3.addEventListener('click', function(){ runInquiry('q3'); });
    
    btnSuspectInquire.addEventListener('click', function() {
      var text = suspectCustomInput.value.trim();
      if (!text) {
        toast('⚠️ Lütfen önce sorgu odasına bir soru yazın!', '#ff7043');
        return;
      }
      runInquiry(null, text);
      suspectCustomInput.value = '';
    });

    suspectCustomInput.addEventListener('keydown', function(e){ if(e.key === 'Enter') {
      var text = suspectCustomInput.value.trim();
      if (text) { runInquiry(null, text); suspectCustomInput.value = ''; }
    }});

    // Suspect selection tabs
    function selectSuspect(suspectKey, btn) {
      activeSuspect = suspectKey;
      document.querySelectorAll('#turing-detective-sec .mini-btn').forEach(function(b) {
        if (b.id.indexOf('btnSuspect') !== -1) b.classList.remove('active');
      });
      btn.classList.add('active');

      var data = SUSPECT_RESPONSES[suspectKey];
      suspectSpeechBubble.textContent = '"Sorgulanmaya hazırım dedektif. Bana ne sormak istiyorsunuz?"';
      
      if (lblSuspectStress) lblSuspectStress.textContent = 'NORMAL';
      if (lblSuspectAIScore) lblSuspectAIScore.textContent = '0%';
      lblSuspectStress.style.color = '';
      heartbeatSpeed = 1.0;

      toast('Şüpheli seçildi: ' + data.name, '#00e5ff');
    }

    btnSuspect1.addEventListener('click', function(){ selectSuspect('s1', btnSuspect1); });
    btnSuspect2.addEventListener('click', function(){ selectSuspect('s2', btnSuspect2); });
    btnSuspect3.addEventListener('click', function(){ selectSuspect('s3', btnSuspect3); });

    // ── VOTING LOGIC ─────────────────────────────────────────
    function castVote(votedSuspect) {
      if (votedSuspect === 's1') {
        toast('🎉 TEBRİKLER! Şüpheli A gerçekten TR-800 kodlu Android çıkmıştır. Turing dedektiflik rozetini hak ettiniz!', '#69f0ae');
      } else {
        toast('❌ YANLIŞ TAHMİN! Seçtiğiniz şüpheli bir robota benzese de aslında organik bir bilince sahipti. Dikkatli sorgulayın!', '#ff1744');
      }
    }

    document.getElementById('btnVoteS1').addEventListener('click', function(){ castVote('s1'); });
    document.getElementById('btnVoteS2').addEventListener('click', function(){ castVote('s2'); });
    document.getElementById('btnVoteS3').addEventListener('click', function(){ castVote('s3'); });

    // ── BIOMETRIC PULSE WAVE RENDER ──────────────────────────
    function drawHeartbeatPulse() {
      if (!isCanvasActive('suspectCanvas')) return;

      // Trailing alpha
      spCtx.fillStyle = 'rgba(2,2,4,0.08)';
      spCtx.fillRect(0, 0, spW, spH);

      // Render grid lines
      spCtx.strokeStyle = 'rgba(0, 229, 255, 0.02)';
      spCtx.lineWidth = 0.5;
      spCtx.beginPath();
      for (var x = 0; x < spW; x += 15) {
        spCtx.moveTo(x, 0); spCtx.lineTo(x, spH);
      }
      for (var y = 0; y < spH; y += 15) {
        spCtx.moveTo(0, y); spCtx.lineTo(spW, y);
      }
      spCtx.stroke();

      // Math equation for dynamic ECG pulse line
      // Heartbeat wave equation containing P-wave, QRS-complex, and T-wave!
      spCtx.strokeStyle = activeSuspect === 's1' ? '#ff6b9d' : '#69f0ae';
      spCtx.lineWidth = 1.8;
      
      // Shadow glow
      spCtx.save();
      spCtx.shadowBlur = 10;
      spCtx.shadowColor = activeSuspect === 's1' ? '#ff6b9d' : '#69f0ae';

      spCtx.beginPath();
      
      heartbeatTimer += 0.08 * heartbeatSpeed;
      
      for (var px = 0; px < spW; px++) {
        var phase = (px - heartbeatTimer * 15) * 0.035;
        var yVal = spH / 2;

        // Form periodic ECG blips
        var cyclePhase = phase % (Math.PI * 2);
        if (cyclePhase < 0) cyclePhase += Math.PI * 2;

        // QRS complex logic
        if (cyclePhase > 1.2 && cyclePhase < 1.4) {
          yVal -= (cyclePhase - 1.2) * 200; // Q-wave
        } else if (cyclePhase >= 1.4 && cyclePhase < 1.6) {
          yVal += (cyclePhase - 1.4) * 350 - 40; // R-wave peak
        } else if (cyclePhase >= 1.6 && cyclePhase < 1.8) {
          yVal -= (cyclePhase - 1.6) * 150 + 30; // S-wave
        } else if (cyclePhase >= 2.4 && cyclePhase < 2.8) {
          yVal -= Math.sin((cyclePhase - 2.4) * Math.PI) * 12; // T-wave
        }

        // Glitch android heartbeat signals (micro-cuts)
        if (activeSuspect === 's1' && Math.random() < 0.015 && isCanvasActive('suspectCanvas')) {
          yVal += (Math.random() - 0.5) * 18;
        }

        if (px === 0) {
          spCtx.moveTo(px, yVal);
        } else {
          spCtx.lineTo(px, yVal);
        }
      }
      spCtx.stroke();
      spCtx.restore();

      // Slowly damp heartbeat speeds back to normal resting rate
      if (heartbeatSpeed > 1.0) {
        heartbeatSpeed -= 0.015;
      }
    }

    // Animation Tick
    function suspectLoop() {
      drawHeartbeatPulse();
      requestAnimationFrame(suspectLoop);
    }
    suspectLoop();
  }
} catch(e) { console.error('TuringDetective error', e); }

/* ══════════════════════════════════════════════════════════
   70. AI KARİZMA & İKNA SİMÜLATÖRÜ (NEGOTIATOR ENGINE)
   ══════════════════════════════════════════════════════════ */
try {
  var btnBossElon = document.getElementById('btnBossElon');
  var btnBossBoard = document.getElementById('btnBossBoard');
  var btnBossAlien = document.getElementById('btnBossAlien');
  var lblBossScenario = document.getElementById('lblBossScenario');
  var pitchInput = document.getElementById('pitchInput');
  var btnSubmitPitch = document.getElementById('btnSubmitPitch');
  var bossReactionBubble = document.getElementById('bossReactionBubble');
  
  // Scoring labels
  var lblDealTemp = document.getElementById('lblDealTemp');
  var barDealTemp = document.getElementById('barDealTemp');
  var lblPersuasionKeys = document.getElementById('lblPersuasionKeys');
  var lblConfidenceMult = document.getElementById('lblConfidenceMult');

  if (btnSubmitPitch) {
    var activeBoss = 'elon'; // elon, board, alien

    // Boss profiles data
    var BOSS_PROFILES = {
      elon: {
        name: 'Elon (Milyarder)',
        scenario: '<strong>🚀 Fikir Sunumu:</strong> Elon, Mars kolonizasyonu için yeni roket kalkanı fikrini dinleyecek. Ona inovasyondan, kâr oranından ve veri odaklı vizyonundan bahset! (Anahtar kelimeler: Mars, roket, vizyon, inovasyon)',
        reactionGood: '"İnanılmaz dostum! Bu kalkan tasarımı tam aradığım şey. İnovatif vizyonunu çok beğendim. Mars projesine dahil oldun! Deal! 🚀"',
        reactionBad: '"Bak, bu anlattıkların çok sıkıcı ve sıradan. Bana heyecan verici, Mars ölçeğinde bir vizyon sunman lazım. Teklifini reddediyorum."'
      },
      board: {
        name: 'Yönetim Kurulu',
        scenario: '<strong>💼 Zam Talebi Müzakeresi:</strong> Katı şirket yönetim kurulunu, bu yılki kâr artışına yaptığınız katkılar ve verimlilik artışı verilerinizle ikna edin. (Anahtar kelimeler: kâr, büyüme, veri, verimlilik)',
        reactionGood: '"Sunduğunuz büyüme ve kâr artışı verileri son derece ikna edici. Şirket hedeflerimize katkınız yadsınamaz. Talep ettiğiniz zam onaylanmıştır. Tebrikler! 💼"',
        reactionBad: '"Zam yapmak için elimizde yeterli büyüme verisi bulunmuyor. Şirkete nasıl doğrudan kâr sağladığınızı ispatlayamadınız. Talebiniz reddedilmiştir."'
      },
      alien: {
        name: 'Galaktik Delege Zorak',
        scenario: '<strong>👾 Uzay İttifakı Masası:</strong> Dünya dışı galaktik delegeyi, Samanyolu barış anlaşması için ikna edin. Kozmik denge, sevgi ve sevgi yasasını anlatın! (Anahtar kelimeler: kozmik, barış, denge, sevgi)',
        reactionGood: '"İnsan evladı, kozmik dengenin ve sevginin dilini konuşabiliyorsun. Bu evrensel barış anlaşmasını gezegeniniz adına imzalıyorum! 👾"',
        reactionBad: '"Gezegeninizin bencil arzuları galaktik dengeye uymuyor. Kozmik barış felsefesinden çok uzaksınız. İttifak talebiniz geri çevrilmiştir."'
      }
    };

    function runPitchAnalysis() {
      var pitchText = pitchInput.value.trim();
      if (!pitchText) {
        toast('⚠️ Lütfen önce ikna konuşmanızı yazın!', '#ff7043');
        return;
      }

      var lower = pitchText.toLowerCase();

      // Local analyzer criteria
      var keyMatches = 0;
      var confidenceMatches = 0;
      var activeScenKeys = [];

      // Character-specific key terms
      if (activeBoss === 'elon') {
        activeScenKeys = ['mars', 'roket', 'vizyon', 'inovasyon', 'kalkan', 'hız'];
      } else if (activeBoss === 'board') {
        activeScenKeys = ['kâr', 'büyüme', 'veri', 'verimlilik', 'hedef', 'katkı'];
      } else { // alien
        activeScenKeys = ['kozmik', 'barış', 'denge', 'sevgi', 'evren', 'bütünlük'];
      }

      // 1. Check Scenario Keywords
      var matchedKeywords = [];
      activeScenKeys.forEach(function(key) {
        if (lower.indexOf(key) !== -1) {
          keyMatches++;
          matchedKeywords.push(key);
        }
      });

      // 2. Check General Persuasion terms
      var generalKeys = ['kesinlikle', 'başaracağız', 'lider', 'hazırız', 'kanıt', 'net', 'büyük', 'yatırım'];
      generalKeys.forEach(function(gk) {
        if (lower.indexOf(gk) !== -1) {
          confidenceMatches++;
        }
      });

      // Calculate confidence multiplier
      var confidenceMult = 1.0 + confidenceMatches * 0.2;
      
      // Calculate Deal temperature
      var temperature = Math.min(100, Math.floor((keyMatches * 15 + confidenceMatches * 8 + pitchText.length * 0.08) * 1.1));

      // Sync labels
      if (lblDealTemp) lblDealTemp.textContent = temperature + '°C';
      if (barDealTemp) barDealTemp.style.width = temperature + '%';
      if (lblPersuasionKeys) lblPersuasionKeys.textContent = matchedKeywords.length > 0 ? matchedKeywords.join(', ') : 'Bulunamadı';
      if (lblConfidenceMult) lblConfidenceMult.textContent = 'x' + confidenceMult.toFixed(1);

      // Boss reactions text
      var data = BOSS_PROFILES[activeBoss];
      var resultText = '';

      if (temperature >= 70) {
        resultText = data.reactionGood;
        toast('🎉 Harika! Müzakereyi kazandınız ve anlaşmayı kaptınız!', '#69f0ae');
      } else {
        resultText = data.reactionBad;
        toast('❌ Müzakere başarısız. Daha fazla anahtar kelime ve özgüven ekleyin!', '#ff1744');
      }

      if (bossReactionBubble) {
        bossReactionBubble.innerHTML = '<strong style="color:#ffea00; display:block; margin-bottom:5px;">' + data.name + ' Reaksiyonu:</strong> ' + resultText;
      }
    }

    btnSubmitPitch.addEventListener('click', runPitchAnalysis);

    // Selector buttons binding
    function selectBoss(bossId, btn) {
      activeBoss = bossId;
      document.querySelectorAll('#pitch-negotiator-sec .mini-btn').forEach(function(b) {
        if (b.id.indexOf('btnBoss') !== -1) b.classList.remove('active');
      });
      btn.classList.add('active');

      var data = BOSS_PROFILES[bossId];
      if (lblBossScenario) lblBossScenario.innerHTML = data.scenario;
      
      // Reset scores
      if (lblDealTemp) lblDealTemp.textContent = '0°C';
      if (barDealTemp) barDealTemp.style.width = '0%';
      if (lblPersuasionKeys) lblPersuasionKeys.textContent = 'Bulunamadı';
      if (lblConfidenceMult) lblConfidenceMult.textContent = 'x0.0';
      pitchInput.value = '';
      
      bossReactionBubble.textContent = '"Teklifinizi sunarak yatırımcının kararını ölçün. Kelimelerinizi akıllıca seçerek ikna gücünüzü gösterin."';

      toast('Müzakereci seçildi: ' + data.name, '#00e5ff');
    }

    btnBossElon.addEventListener('click', function(){ selectBoss('elon', btnBossElon); });
    btnBossBoard.addEventListener('click', function(){ selectBoss('board', btnBossBoard); });
    btnBossAlien.addEventListener('click', function(){ selectBoss('alien', btnBossAlien); });
  }
} catch(e) { console.error('PitchNegotiator error', e); }



