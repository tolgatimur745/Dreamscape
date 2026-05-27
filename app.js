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
