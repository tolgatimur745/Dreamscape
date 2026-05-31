import re

JS  = r'C:\Users\tolga\.gemini\antigravity\scratch\leisure-hub\app.js'
HTML= r'C:\Users\tolga\.gemini\antigravity\scratch\leisure-hub\index.html'

with open(JS,'r',encoding='utf-8') as f: js = f.read()
with open(HTML,'r',encoding='utf-8') as f: html = f.read()

# ─────────────────────────────────────────────────────────────────
# 1. FIX WORDCHAIN – replace the whole engine block
# ─────────────────────────────────────────────────────────────────
old_wc_start = "/* \u2550\u2550 KEL\u0130ME Z\u0130NC\u0130R\u0130 \u2550"
old_wc_end   = "})(); } catch(e){ console.error('WordChain error',e); }"

new_wc = r"""/* \u2550\u2550 KEL\u0130ME Z\u0130NC\u0130R\u0130 \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
try { (function() {
  /* Geni\u015f T\u00fcrk\u00e7e kelime bankas\u0131 - her harf i\u00e7in 12-20 kelime */
  var DICT = {
    A:['ARABA','ASLAN','ADALET','ARMUT','AYNA','ATLAS','AKIL','ATIK','AYAK','ALTIN','ADIM','AKBABA','ARZU','ANKA','AVUKAT','AZOT','ATOM','ARIF'],
    B:['BAL','BALIK','BULUT','BEDEN','BAHAR','BIBER','BILGE','BOYUT','BULGU','BURGU','BONCUK','BORDO','BUKET','BEYIN','BASKIL'],
    C:['CAM','CEVAP','CESUR','CEYLAN','CEKET','CEVIZ','CADDE','CIGARA','CUMBA'],
    D:['\u00dcNYA','DA\u011eLAR','DUMAN','DOST','DO\u011eA','DALGA','DEN\u0130Z','DUMAN','DELER','D\u00dcZEN','D\u0130BEK','DENEYSEL','DURAK','D\u0130REK'],
    E:['EKMEK','ELMAS','EVREN','ELMA','ERDEM','EFKAR','EGZOZ','EL\u0130F','EMPATI','ENLEM','ERBAP','ERGEN','ESMER'],
    F:['FENER','FIRTINA','FLORA','FELSEFE','F\u0130L','FIZIK','FORSA','FABL','FANTEZI','F\u0130KIR'],
    G:['G\u00d6KY\u00dcZ\u00dc','GECE','G\u00dcNE\u015e','G\u00dcZEL','G\u00d6N\u00dcL','GITAR','GURUR','G\u0130ZLEM','GLOBAL','GELGIT'],
    H:['HAYAT','HUZUR','HAYAL','HO\u015eLUK','HABER','HEYKEL','HIKAYE','HOROZ','HEDIYE','HAMUR'],
    I:['I\u015eIK','ILHAN','IRFAN','INSAN','ISIL'],
    '\u0130':['\u0130LHAM','\u0130NC\u0130','\u0130PEK','\u0130LKBAHAR','\u0130NSAN','\u0130K\u0130NC\u0130','\u0130SLAM','\u0130T\u0130NA','\u0130MLEK'],
    J:['JALE','JANDARMA','JEST','JURNAL'],
    K:['KAR','KALEM','KORKU','KO\u015eU','KUZEY','KAVRAM','KALP','K\u0130TAP','KEMAN','KARMA','KUYTU','KAVAK'],
    L:['LALE','LIMAN','LEYLA','LOGO','LIMON','LANSE','LEKE'],
    M:['MAVI','MASAL','MUTLU','M\u00dcZ\u0130K','MERAK','MEYVE','MANZARA','MEVSIM','MORAL','MARTIL','MOTIF'],
    N:['NEFES','NISAN','NEBULA','NUR','NAMUS','N\u0130LEN','N\u0130HAI','NAKIS'],
    O:['ORMAN','OKYANUS','\u00d6RDEK','OLGUN','ONGUN','OMURGA'],
    '\u00d6':['\u00d6P\u00dc C\u00dcK','\u00d6ZLEM','\u00d6RNEK','\u00d6F\u00dcN','\u00d6VG\u00dc','\u00d6DEN','\u00d6NLEM'],
    P:['PETEK','PEMBE','PRENS','PIXEL','PELIN','PELUR','PROVA'],
    R:['RENK','R\u00dcYA','ROBOT','RITIM','RESIM','RADAR','RANDEVU','RUH'],
    S:['SEVGI','SABAH','SANAT','SOLAR','SU','SES','SENFONI','SARMAL','SAYGI','SOKAK','SUNAK','SEYIR'],
    '\u015e':['\u015e\u0130\u0130R','\u015eANS','\u015eEKER','\u015e\u0130M\u015eEK','\u015e\u0130FA','\u015eEHIR','\u015e\u0130KAR','\u015eAHIN'],
    T:['TOPRAK','TUTKU','TUNA','TOPLU','T\u00dcRK\u00dc','TELEF','TEMEL','T\u0130TREM'],
    U:['UMUT','UZAY','UFUK','U\u00c7U\u015e','USTAT','ULEMA','URUN'],
    '\u00dc':['\u00dcLKE','\u00dc Z\u00dcM','\u00dcSTAT','\u00dcN\u00dc'],
    V:['VAD\u0130','VOLKAN','VICDAN','VASIF','VOLUM'],
    Y:['YILDIZ','YA\u015eAM','YURT','Y\u00dcREK','YA\u011eMUR','YAZGI','YETKI','Y\u0130T\u0130K'],
    Z:['ZAMAN','ZIHIN','ZEBRA','ZEMIN','ZIRVE','ZARIF','ZEYTIN']
  };

  /* T\u00fcm ge\u00e7erli kelimeler tek sete */
  var ALL_VALID = {};
  Object.keys(DICT).forEach(function(k){ DICT[k].forEach(function(w){ ALL_VALID[w]=true; }); });

  function isValidWord(w){ return !!ALL_VALID[w]; }

  var chain=[], score=0, chainLen=0;
  var bestScore=parseInt(localStorage.getItem('ds_wc_best')||'0'), gameActive=false;
  var countdownTimer=null, timeLeft=10;

  var chainEl=document.getElementById('wcChain'), inputEl=document.getElementById('wcInput');
  var lblScore=document.getElementById('lblWcScore'), lblChain=document.getElementById('lblWcChain');
  var lblBest=document.getElementById('lblWcBest'), hintEl=document.getElementById('wcHint');
  var lblTimer=document.getElementById('lblWcTimer');
  if(lblBest) lblBest.textContent=bestScore;

  function getTimeLimit(){
    if(score>=1000) return 4;
    if(score>=600)  return 5;
    if(score>=300)  return 7;
    return 10;
  }

  function startCountdown(){
    clearInterval(countdownTimer);
    timeLeft=getTimeLimit();
    updateTimerUI();
    countdownTimer=setInterval(function(){
      if(!gameActive) return;
      timeLeft--;
      updateTimerUI();
      if(timeLeft<=0){ clearInterval(countdownTimer); gameOver('s\u00fcre doldu! \u23f0'); }
    },1000);
  }

  function updateTimerUI(){
    if(!lblTimer) return;
    lblTimer.textContent=timeLeft+'s';
    lblTimer.style.color = timeLeft<=3 ? '#ff1744' : timeLeft<=5 ? '#ff7043' : '#69f0ae';
  }

  function gameOver(reason){
    gameActive=false; clearInterval(countdownTimer);
    addBubble('\uD83D\uDEA8 Oyun bitti: '+reason+' (Skor: '+score+')','error-bubble');
    if(score>bestScore){ bestScore=score; localStorage.setItem('ds_wc_best',bestScore); if(lblBest) lblBest.textContent=bestScore; }
    if(hintEl) hintEl.textContent='\u21ba Y\u00f6ncevrimle yeni oyuna ba\u015fla';
    if(inputEl) inputEl.disabled=true;
    toast('\uD83D\uDEA8 Oyun bitti! Skor: '+score,'#ff6b9d');
  }

  function addBubble(word, who) {
    if(!chainEl) return;
    var b=document.createElement('span'); b.className='wc-bubble '+(who==='player'?'player':who==='ai'?'ai':'error-bubble');
    b.textContent=word; chainEl.appendChild(b);
    chainEl.scrollTop=chainEl.scrollHeight;
  }
  function getLastLetter(word) { return word[word.length-1].toUpperCase(); }

  function aiRespond(lastLetter) {
    var pool=(DICT[lastLetter]||[]).filter(function(w){return chain.indexOf(w)<0;});
    if(!pool.length){
      setTimeout(function(){
        addBubble('\uD83E\uDD16 '+lastLetter+' harfiyle bildi\u011fim kelime kalmad\u0131. Kazand\u0131n! \uD83C\uDF89','ai');
        gameActive=false; clearInterval(countdownTimer);
        toast('\uD83C\uDF89 Tebrikler! AI kelime bulamad\u0131. Kazand\u0131n\u0131z!','#69f0ae');
      },600); return;
    }
    var word=pool[Math.floor(Math.random()*pool.length)];
    chain.push(word);
    setTimeout(function(){
      addBubble('\uD83E\uDD16 '+word,'ai');
      if(hintEl) hintEl.textContent='S\u0131ra sende! "'+getLastLetter(word)+'" harfiyle ba\u015flayan bir kelime yaz';
      startCountdown(); // restart timer after AI responds
    },700);
  }

  function submitWord() {
    if(!inputEl) return;
    var word=inputEl.value.trim().toUpperCase();
    // normalize Turkish i
    word=word.replace(/I\u0307/g,'\u0130').replace(/i/g,'\u0130').replace(/\u0131/g,'I');
    if(!word){ return; }

    if(!gameActive){
      // start game on first word
      gameActive=true;
      if(inputEl) inputEl.disabled=false;
    }

    // check last-letter rule
    if(chain.length>0){
      var needed=getLastLetter(chain[chain.length-1]);
      if(word[0]!==needed){
        toast('\u26a0\ufe0f Kelime "'+needed+'" harfiyle ba\u015flamal\u0131!','#ff7043');
        inputEl.style.borderColor='#ff1744'; setTimeout(function(){inputEl.style.borderColor='';},600); return;
      }
    }
    // check already used
    if(chain.indexOf(word)>=0){
      toast('Bu kelime zaten kullan\u0131ld\u0131!','#ff7043'); return;
    }
    // validate word exists in dictionary
    if(!isValidWord(word)){
      toast('\u274c "'+word+'" kelimesi s\u00f6zl\u00fckte yok! Oyun bitti.','#ff1744');
      addBubble('\u274c '+word+' — ge\u00e7ersiz kelime!','error-bubble');
      gameOver('"'+word+'" ge\u00e7ersiz kelime');
      inputEl.value=''; return;
    }
    // clear timer, register word
    clearInterval(countdownTimer);
    chain.push(word); chainLen++; score+=chainLen*word.length;
    addBubble('\uD83D\uDC64 '+word,'player');
    if(lblScore) lblScore.textContent=score;
    if(lblChain) lblChain.textContent=chainLen;
    if(score>bestScore){bestScore=score; localStorage.setItem('ds_wc_best',bestScore); if(lblBest) lblBest.textContent=bestScore;}
    inputEl.value=''; if(hintEl) hintEl.textContent='AI d\u00fc\u015f\u00fcn\u00fcyor...';
    aiRespond(getLastLetter(word));
  }

  function resetGame(){
    chain=[]; chainLen=0; score=0; gameActive=false;
    clearInterval(countdownTimer);
    if(chainEl) chainEl.innerHTML='';
    if(lblScore) lblScore.textContent='0'; if(lblChain) lblChain.textContent='0';
    if(hintEl) hintEl.textContent='Herhangi bir kelime yazarak ba\u015fla!';
    if(inputEl){ inputEl.value=''; inputEl.disabled=false; }
    if(lblTimer) lblTimer.textContent='10s';
    if(lblTimer) lblTimer.style.color='#69f0ae';
  }

  var btnSend=document.getElementById('btnWcSend'), btnReset=document.getElementById('btnWcReset');
  if(btnSend) btnSend.addEventListener('click', submitWord);
  if(inputEl) inputEl.addEventListener('keydown', function(e){ if(e.key==='Enter'){e.preventDefault();submitWord();} });
  if(btnReset) btnReset.addEventListener('click', resetGame);
  if(hintEl) hintEl.textContent='Herhangi bir kelime yazarak ba\u015fla!';
})(); } catch(e){ console.error('WordChain error',e); }"""

# Locate old block and replace
idx_start = js.find(old_wc_start)
idx_end   = js.find(old_wc_end)
if idx_start>=0 and idx_end>=0:
    js = js[:idx_start] + new_wc + js[idx_end+len(old_wc_end):]
    print('WordChain replaced')
else:
    print('WordChain block NOT FOUND', idx_start, idx_end)

# ─────────────────────────────────────────────────────────────────
# 2. ADD TIMER LABEL to wordchain HTML section
# ─────────────────────────────────────────────────────────────────
old_wc_stats = '''<div class="game-card" style="padding:.5rem .9rem;font-size:.85rem;border-color:rgba(255,255,255,.08);">🔥 Puan: <strong id="lblWcScore" style="color:#ffea00;">0</strong></div>
      <div class="game-card" style="padding:.5rem .9rem;font-size:.85rem;border-color:rgba(255,255,255,.08);">⛓ Zincir: <strong id="lblWcChain" style="color:#00e5ff;">0</strong></div>
      <div class="game-card" style="padding:.5rem .9rem;font-size:.85rem;border-color:rgba(255,255,255,.08);">🏆 En İyi: <strong id="lblWcBest" style="color:#69f0ae;">0</strong></div>'''
new_wc_stats = '''<div class="game-card" style="padding:.5rem .9rem;font-size:.85rem;border-color:rgba(255,255,255,.08);">🔥 Puan: <strong id="lblWcScore" style="color:#ffea00;">0</strong></div>
      <div class="game-card" style="padding:.5rem .9rem;font-size:.85rem;border-color:rgba(255,255,255,.08);">⛓ Zincir: <strong id="lblWcChain" style="color:#00e5ff;">0</strong></div>
      <div class="game-card" style="padding:.5rem .9rem;font-size:.85rem;border-color:rgba(255,255,255,.08);">⏱ Süre: <strong id="lblWcTimer" style="color:#69f0ae;">10s</strong></div>
      <div class="game-card" style="padding:.5rem .9rem;font-size:.85rem;border-color:rgba(255,255,255,.08);">🏆 En İyi: <strong id="lblWcBest" style="color:#69f0ae;">0</strong></div>'''
if old_wc_stats in html:
    html = html.replace(old_wc_stats, new_wc_stats, 1)
    print('WordChain timer label added to HTML')
else:
    print('WordChain stats HTML NOT FOUND')

# ─────────────────────────────────────────────────────────────────
# 3. REPLACE BEAT MAKINESI ENGINE with improved version
# ─────────────────────────────────────────────────────────────────
old_beat_start = "/* \u2550\u2550 BEAT MAK\u0130NES\u0130 \u2550"
old_beat_end   = "})(); } catch(e){ console.error('Beat error',e); }"

new_beat = r"""/* \u2550\u2550 BEAT MAK\u0130NES\u0130 \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
try { (function() {
  var gridEl=document.getElementById('beatGrid');
  if(!gridEl) return;

  /* 6 track, 16 steps, with volume+mute per track */
  var TRACKS=[
    {name:'\uD83E\uDD41 Kick',   type:'kick',   color:'rgba(255,107,157,.7)',colorB:'#ff6b9d', vol:0.8, muted:false},
    {name:'\uD83E\uDE98 Snare',  type:'snare',  color:'rgba(0,229,255,.7)',  colorB:'#00e5ff', vol:0.6, muted:false},
    {name:'\uD83C\uDFA9 HiHat',  type:'hihat',  color:'rgba(255,234,0,.7)', colorB:'#ffea00', vol:0.4, muted:false},
    {name:'\uD83C\uDFB8 Bass',   type:'bass',   color:'rgba(105,240,174,.7)',colorB:'#69f0ae', vol:0.7, muted:false},
    {name:'\uD83D\uDD14 Rim',    type:'rim',    color:'rgba(124,77,255,.7)', colorB:'#7c4dff', vol:0.5, muted:false},
    {name:'\uD83C\uDFB6 Tom',    type:'tom',    color:'rgba(255,152,0,.7)',  colorB:'#ff9800', vol:0.6, muted:false}
  ];
  var STEPS=16, pattern=[], currentStep=-1;
  var bpm=120, playing=false, audioCtx=null, nextTime=0, timerID=null;
  TRACKS.forEach(function(){ var row=[]; for(var i=0;i<STEPS;i++) row.push(false); pattern.push(row); });

  /* ── Synthesise each drum sound ─────────────────── */
  function playDrum(type,time,vol){
    if(!audioCtx||vol<=0) return;
    var g=audioCtx.createGain();
    g.connect(audioCtx.destination);
    switch(type){
      case 'kick': {
        var o=audioCtx.createOscillator();
        o.frequency.setValueAtTime(150,time);
        o.frequency.exponentialRampToValueAtTime(0.001,time+0.25);
        g.gain.setValueAtTime(vol,time); g.gain.exponentialRampToValueAtTime(0.001,time+0.25);
        o.connect(g); o.start(time); o.stop(time+0.25); break;
      }
      case 'snare': {
        var buf=audioCtx.createBuffer(1,audioCtx.sampleRate*0.15,audioCtx.sampleRate);
        var d=buf.getChannelData(0); for(var i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*0.8;
        var src=audioCtx.createBufferSource();
        var flt=audioCtx.createBiquadFilter(); flt.type='highpass'; flt.frequency.value=1200;
        src.buffer=buf; src.connect(flt); flt.connect(g);
        g.gain.setValueAtTime(vol,time); g.gain.exponentialRampToValueAtTime(0.001,time+0.15);
        src.start(time); src.stop(time+0.15); break;
      }
      case 'hihat': {
        var buf2=audioCtx.createBuffer(1,audioCtx.sampleRate*0.07,audioCtx.sampleRate);
        var d2=buf2.getChannelData(0); for(var i=0;i<d2.length;i++) d2[i]=(Math.random()*2-1);
        var src2=audioCtx.createBufferSource();
        var flt2=audioCtx.createBiquadFilter(); flt2.type='highpass'; flt2.frequency.value=7000;
        src2.buffer=buf2; src2.connect(flt2); flt2.connect(g);
        g.gain.setValueAtTime(vol*0.5,time); g.gain.exponentialRampToValueAtTime(0.001,time+0.06);
        src2.start(time); src2.stop(time+0.07); break;
      }
      case 'bass': {
        var o2=audioCtx.createOscillator(); o2.type='sawtooth';
        o2.frequency.setValueAtTime(80,time);
        var flt3=audioCtx.createBiquadFilter(); flt3.type='lowpass'; flt3.frequency.value=400;
        o2.connect(flt3); flt3.connect(g);
        g.gain.setValueAtTime(vol,time); g.gain.exponentialRampToValueAtTime(0.001,time+0.2);
        o2.start(time); o2.stop(time+0.22); break;
      }
      case 'rim': {
        var o3=audioCtx.createOscillator(); o3.type='triangle';
        o3.frequency.setValueAtTime(600,time);
        g.gain.setValueAtTime(vol*0.4,time); g.gain.exponentialRampToValueAtTime(0.001,time+0.05);
        o3.connect(g); o3.start(time); o3.stop(time+0.06); break;
      }
      case 'tom': {
        var o4=audioCtx.createOscillator();
        o4.frequency.setValueAtTime(200,time); o4.frequency.exponentialRampToValueAtTime(60,time+0.15);
        g.gain.setValueAtTime(vol,time); g.gain.exponentialRampToValueAtTime(0.001,time+0.18);
        o4.connect(g); o4.start(time); o4.stop(time+0.2); break;
      }
    }
  }

  /* ── Build grid ──────────────────────────────────── */
  function buildGrid(){
    gridEl.innerHTML='';
    gridEl.style.gridTemplateColumns='90px repeat('+STEPS+',1fr)';
    TRACKS.forEach(function(tr,ri){
      // Row header
      var hdr=document.createElement('div');
      hdr.style.cssText='display:flex;align-items:center;gap:4px;font-size:.65rem;color:var(--tx3);justify-content:flex-end;padding-right:4px;';
      var muteBtn=document.createElement('button');
      muteBtn.textContent=tr.muted?'\uD83D\uDD07':'\uD83D\uDD0A';
      muteBtn.title='Mute';
      muteBtn.style.cssText='background:none;border:none;cursor:pointer;font-size:.9rem;padding:0;line-height:1;';
      muteBtn.dataset.ri=ri;
      muteBtn.addEventListener('click',function(e){
        var r=parseInt(e.currentTarget.dataset.ri);
        TRACKS[r].muted=!TRACKS[r].muted;
        e.currentTarget.textContent=TRACKS[r].muted?'\uD83D\uDD07':'\uD83D\uDD0A';
        e.currentTarget.style.opacity=TRACKS[r].muted?'0.4':'1';
      });
      var nameSpan=document.createElement('span'); nameSpan.textContent=tr.name;
      hdr.appendChild(muteBtn); hdr.appendChild(nameSpan);
      gridEl.appendChild(hdr);
      // 16 step buttons
      for(var si=0;si<STEPS;si++){
        var btn=document.createElement('button');
        btn.className='beat-btn';
        if(si===4||si===8||si===12) btn.style.borderLeft='2px solid rgba(255,255,255,.15)';
        btn.style.setProperty('--beat-color',tr.color);
        btn.style.setProperty('--beat-color-b',tr.colorB);
        btn.dataset.row=ri; btn.dataset.step=si;
        btn.addEventListener('click',function(e){
          var r=parseInt(e.currentTarget.dataset.row),s=parseInt(e.currentTarget.dataset.step);
          pattern[r][s]=!pattern[r][s]; e.currentTarget.classList.toggle('active',pattern[r][s]);
        });
        gridEl.appendChild(btn);
      }
    });
  }

  function schedule(){
    while(nextTime<audioCtx.currentTime+0.1){
      currentStep=(currentStep+1)%STEPS;
      TRACKS.forEach(function(tr,ri){
        if(pattern[ri][currentStep]&&!tr.muted) playDrum(tr.type,nextTime,tr.vol);
      });
      nextTime+=60/bpm/4; // 16th notes
    }
    gridEl.querySelectorAll('.beat-btn').forEach(function(btn){
      btn.classList.toggle('playing',parseInt(btn.dataset.step)===currentStep);
    });
    timerID=setTimeout(schedule,25);
  }

  /* ── Swing control ────────────────────────────────── */
  function applyPreset(name){
    pattern.forEach(function(row){ row.fill(false); });
    var presets={
      'trap': [
        [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0], // kick
        [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0], // snare
        [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0], // hihat
        [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,1,0], // bass
        [0,0,0,0, 0,0,0,0, 0,0,0,1, 0,0,0,0], // rim
        [0,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,0,0]  // tom
      ],
      'rock': [
        [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
        [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
        [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
        [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
        [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,1,0],
        [0,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,0,0]
      ],
      'bossa': [
        [1,0,0,0, 0,0,1,0, 0,0,0,0, 1,0,0,0],
        [0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
        [1,0,0,1, 0,0,1,0, 0,1,0,0, 1,0,0,0],
        [1,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,0],
        [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
        [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0]
      ]
    };
    var p=presets[name];
    if(!p) return;
    for(var ri=0;ri<Math.min(p.length,TRACKS.length);ri++){
      for(var si=0;si<STEPS;si++){ pattern[ri][si]=!!p[ri][si]; }
    }
    gridEl.querySelectorAll('.beat-btn').forEach(function(btn){
      var r=parseInt(btn.dataset.row),s=parseInt(btn.dataset.step);
      btn.classList.toggle('active',pattern[r][s]);
    });
    toast('\uD83C\uDFB5 '+name.toUpperCase()+' preset y\u00fcklendi','#7c4dff');
  }

  /* ── Controls ─────────────────────────────────────── */
  var btnPlay=document.getElementById('btnBeatPlay');
  var btnClear=document.getElementById('btnBeatClear');
  var bpmRange=document.getElementById('beatBpm');
  var lblBpm=document.getElementById('lblBpm');
  var btnTrap=document.getElementById('btnBeatTrap');
  var btnRock=document.getElementById('btnBeatRock');
  var btnBossa=document.getElementById('btnBeatBossa');

  if(bpmRange) bpmRange.addEventListener('input',function(){ bpm=parseInt(bpmRange.value); if(lblBpm) lblBpm.textContent=bpm; });

  if(btnPlay) btnPlay.addEventListener('click',function(){
    if(!playing){
      audioCtx=new(window.AudioContext||window.webkitAudioContext)();
      if(audioCtx.state==='suspended') audioCtx.resume();
      nextTime=audioCtx.currentTime; playing=true; schedule();
      btnPlay.textContent='\u23F9 Durdur'; btnPlay.style.color='#ff6b9d';
    } else {
      playing=false; clearTimeout(timerID); currentStep=-1;
      gridEl.querySelectorAll('.beat-btn').forEach(function(b){ b.classList.remove('playing'); });
      btnPlay.textContent='\u25B6 Ba\u015flat'; btnPlay.style.color='#69f0ae';
    }
  });

  if(btnClear) btnClear.addEventListener('click',function(){
    pattern.forEach(function(row){ row.fill(false); });
    gridEl.querySelectorAll('.beat-btn').forEach(function(b){ b.classList.remove('active'); });
  });

  if(btnTrap) btnTrap.addEventListener('click',function(){ applyPreset('trap'); });
  if(btnRock) btnRock.addEventListener('click',function(){ applyPreset('rock'); });
  if(btnBossa) btnBossa.addEventListener('click',function(){ applyPreset('bossa'); });

  buildGrid();
})(); } catch(e){ console.error('Beat error',e); }"""

idx_bs = js.find(old_beat_start)
idx_be = js.find(old_beat_end)
if idx_bs>=0 and idx_be>=0:
    js = js[:idx_bs] + new_beat + js[idx_be+len(old_beat_end):]
    print('Beat replaced')
else:
    print('Beat block NOT FOUND', idx_bs, idx_be)

# ─────────────────────────────────────────────────────────────────
# 4. HUB_CATS – add 3 to Gizemli & 3 to Araclar (in the SECOND occurrence = rendered list)
# ─────────────────────────────────────────────────────────────────
old_giz_end = """      {em:'\uD83C\uDFDB\uFE0F', ttl:'Filozoflar Arenas\u0131',dsc:'Sokrates, Nietzsche, Aurelius sim\u00fcle Sokratik tart\u0131\u015fma',id:'debate-sec'}
    ]},
    { label: '\uD83D\uDEE0\uFE0F Ara\u00e7lar & Ki\u015fisel', items: ["""

new_giz_end = """      {em:'\uD83C\uDFDB\uFE0F', ttl:'Filozoflar Arenas\u0131',dsc:'Sokrates, Nietzsche, Aurelius sim\u00fcle Sokratik tart\u0131\u015fma',id:'debate-sec'},
      {em:'\uD83E\uDDE0', ttl:'Zihin Okuyucu', dsc:'D\u00fc\u015f\u00fcnd\u00fc\u011f\u00fcn\u00fc tahmin eden sihirli AI oyunu',id:'mindread-sec'},
      {em:'\uD83C\uDF0A', ttl:'Kaos Simfonisi', dsc:'Ses dalgalar\u0131 ile kaotik m\u00fczik \u00fcret',id:'chaos-music-sec'},
      {em:'\uD83C\uDFC6', ttl:'Ki\u015filik Analizi', dsc:'Hareketlerinle ki\u015filik tipini ke\u015ffet',id:'personality-sec'}
    ]},
    { label: '\uD83D\uDEE0\uFE0F Ara\u00e7lar & Ki\u015fisel', items: ["""

if old_giz_end in js:
    js = js.replace(old_giz_end, new_giz_end, 1)
    print('Gizemli items added')
else:
    print('Gizemli end NOT FOUND - trying alternate search')
    # Try finding by last item
    alt = "'debate-sec'}\n    ]},\n    { label: '\uD83D\uDEE0"
    if alt in js:
        js = js.replace(alt, "'debate-sec'},\n      {em:'\uD83E\uDDE0', ttl:'Zihin Okuyucu', dsc:'D\u00fc\u015f\u00fcnd\u00fc\u011f\u00fcn\u00fc tahmin eden sihirli AI oyunu',id:'mindread-sec'},\n      {em:'\uD83C\uDF0A', ttl:'Kaos Simfonisi', dsc:'Ses dalgalar\u0131 ile kaotik m\u00fczik \u00fcret',id:'chaos-music-sec'},\n      {em:'\uD83C\uDFC6', ttl:'Ki\u015filik Analizi', dsc:'Hareketlerinle ki\u015filik tipini ke\u015ffet',id:'personality-sec'}\n    ]},\n    { label: '\uD83D\uDEE0", 1)
        print('Gizemli alt added')

old_arac_end = """      {em:'\u2714\uFE0F', ttl:'Zen Yap\u0131lacaklar',  dsc:'Motivasyonel yap\u0131lacak i\u015fler kontrol listesi',id:'todo-sec'}
    ]}
  ];"""

new_arac_end = """      {em:'\u2714\uFE0F', ttl:'Zen Yap\u0131lacaklar',  dsc:'Motivasyonel yap\u0131lacak i\u015fler kontrol listesi',id:'todo-sec'},
      {em:'\uD83C\uDFB2', ttl:'Karar Zarlar\u0131', dsc:'Ak\u0131ll\u0131 karar destek zar sistemi',id:'decisiondie-sec'},
      {em:'\uD83D\uDCCA', ttl:'Biyoenerji Haritas\u0131', dsc:'G\u00fcnl\u00fck enerji & odak takip grafi\u011fi',id:'energy-map-sec'},
      {em:'\uD83C\uDFF9', ttl:'Al\u0131\u015fkanl\u0131k Okcu', dsc:'Hedef belirleme & al\u0131\u015fkanl\u0131k ok tablosu',id:'habit-sec'}
    ]}
  ];"""

if old_arac_end in js:
    js = js.replace(old_arac_end, new_arac_end, 1)
    print('Araclar items added')
else:
    print('Araclar end NOT FOUND')

# ─────────────────────────────────────────────────────────────────
# 5. BEAT HTML – update to 16 steps + presets + volume
# ─────────────────────────────────────────────────────────────────
old_beat_html = '''<div id="beatGrid" style="display:grid;grid-template-columns:60px repeat(8,1fr);gap:6px;"></div>
    <div style="text-align:center;font-size:.75rem;color:var(--tx3);">Aktif adım neon yanar · BPM sürgüsüyle hız ayarla</div>'''
new_beat_html = '''<div id="beatGrid" style="display:grid;grid-template-columns:90px repeat(16,1fr);gap:4px;overflow-x:auto;"></div>
    <div style="display:flex;gap:.5rem;flex-wrap:wrap;justify-content:center;margin-top:.4rem;">
      <button class="mini-btn" id="btnBeatTrap" style="font-size:.68rem;padding:5px 10px;">🎤 Trap</button>
      <button class="mini-btn" id="btnBeatRock" style="font-size:.68rem;padding:5px 10px;">🎸 Rock</button>
      <button class="mini-btn" id="btnBeatBossa" style="font-size:.68rem;padding:5px 10px;">🎷 Bossa</button>
    </div>
    <div style="text-align:center;font-size:.72rem;color:var(--tx3);">16 adım · 6 kanal · Mute per kanal · 3 preset</div>'''

if old_beat_html in html:
    html = html.replace(old_beat_html, new_beat_html, 1)
    print('Beat HTML updated to 16 steps')
else:
    print('Beat HTML NOT FOUND')

# ─────────────────────────────────────────────────────────────────
# 6. Write files
# ─────────────────────────────────────────────────────────────────
with open(JS,'w',encoding='utf-8') as f: f.write(js)
with open(HTML,'w',encoding='utf-8') as f: f.write(html)
print('All done — files written.')
