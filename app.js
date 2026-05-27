
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

/* ── Navbar ──────────────────────────────────────────────── */
try {
  window.addEventListener('scroll', function(){
    $('navbar').classList.toggle('scrolled', window.scrollY > 50);
  });
  function tick_clock(){
    var el = $('navTime');
    if(el) el.textContent = new Date().toLocaleTimeString('tr-TR');
  }
  setInterval(tick_clock, 1000); tick_clock();
  var SES_START = Date.now();
  setInterval(function(){
    var el=$('sessionTime');
    if(el) el.textContent='⏱️ Bu oturumda: '+Math.floor((Date.now()-SES_START)/60000)+' dk';
  }, 60000);
} catch(e){ console.error('Navbar error',e); }

/* ── Particles ───────────────────────────────────────────── */
try {
  var pc = $('particleCanvas');
  var pcx = pc.getContext('2d');
  var PW, PH, PTS = [];
  function presize(){ PW = pc.width = innerWidth; PH = pc.height = innerHeight; }
  window.addEventListener('resize', presize); presize();
  for(var pi=0;pi<120;pi++) PTS.push({
    x:Math.random()*PW, y:Math.random()*PH,
    vx:(Math.random()-.5)*.28, vy:(Math.random()-.5)*.28,
    r:Math.random()*1.5+.3, h:Math.random()*80+215, ph:Math.random()*Math.PI*2
  });
  (function ploop(){
    pcx.clearRect(0,0,PW,PH);
    PTS.forEach(function(p){
      p.x+=p.vx; p.y+=p.vy; p.ph+=.022;
      if(p.x<0||p.x>PW) p.vx*=-1;
      if(p.y<0||p.y>PH) p.vy*=-1;
      var a=.12+Math.abs(Math.sin(p.ph))*.42;
      pcx.save(); pcx.globalAlpha=a;
      pcx.fillStyle='hsl('+p.h+',80%,70%)';
      pcx.shadowBlur=7; pcx.shadowColor='hsl('+p.h+',80%,70%)';
      pcx.beginPath(); pcx.arc(p.x,p.y,p.r,0,Math.PI*2); pcx.fill();
      pcx.restore();
    });
    requestAnimationFrame(ploop);
  })();
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
    CITIES.forEach(function(city){
      var id='clk'+city.n.replace(/[\s]/g,'');
      var el=$(id),de=$(id+'d');
      try{if(el)el.textContent=new Date().toLocaleTimeString('tr-TR',{timeZone:city.tz,hour12:false});}catch(e){}
      try{if(de)de.textContent=new Date().toLocaleDateString('tr-TR',{timeZone:city.tz,weekday:'short',day:'2-digit',month:'short'});}catch(e){}
    });
  }
  setInterval(clocks_tick,1000);clocks_tick();
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
    function starDraw() {
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
        sc.save(); sc.globalAlpha = a; sc.shadowBlur = s.name ? 14 : 4; sc.shadowColor = 'hsl(' + s.h + ',80%,75%)';
        sc.fillStyle = 'hsl(' + s.h + ',75%,85%)'; sc.beginPath(); sc.arc(s.x, s.y, s.r, 0, 6.28); sc.fill(); sc.restore();
      });
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
      requestAnimationFrame(pong_draw);
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
    function ripple_draw() {
      var W=rippleCanvas.width, H=rippleCanvas.height;
      rctx.fillStyle='rgba(1,2,13,.12)'; rctx.fillRect(0,0,W,H);
      ripples.forEach(function(rp, i) {
        rp.r += rp.speed; rp.a = 1 - rp.r/rp.maxR;
        rctx.beginPath(); rctx.arc(rp.x,rp.y,rp.r,0,Math.PI*2);
        rctx.strokeStyle = rp.col.replace(')',', '+rp.a+')').replace('hsl','hsla');
        rctx.lineWidth = 2; rctx.stroke();
      });
      ripples = ripples.filter(function(rp){ return rp.a > 0; });
      requestAnimationFrame(ripple_draw);
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
      {em:'📖',ttl:'Emoji Hikaye',dsc:'Emoji ile yaz',id:'emojistory'}
    ]},
    { label: '🌍 Keşif & Bilgi', items: [
      {em:'🗺️',ttl:'Dünya Kaşifi',dsc:'23 güzel yer',id:'world'},
      {em:'🌌',ttl:'Yıldız Haritası',dsc:'Takımyıldızları',id:'stars'},
      {em:'🌙',ttl:'Ay Takvimi',dsc:'Güncel ay fazı',id:'moonphase'},
      {em:'💡',ttl:'Bilgi Kartları',dsc:'İlginç bilgiler',id:'facts'}
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

