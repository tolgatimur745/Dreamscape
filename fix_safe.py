import sys, re

JS  = r'C:\Users\tolga\.gemini\antigravity\scratch\leisure-hub\app.js'
HTML= r'C:\Users\tolga\.gemini\antigravity\scratch\leisure-hub\index.html'
JS_BAK = r'C:\Users\tolga\.gemini\antigravity\scratch\leisure-hub\app.js.bak'

# Read backup (created by previous run before crash)
try:
    with open(JS_BAK,'rb') as f: raw=f.read()
    js=raw.decode('utf-8','surrogatepass')
    print(f'Read backup: {len(js)} chars')
except FileNotFoundError:
    print('No backup found')
    sys.exit(1)

with open(HTML,'rb') as f: raw2=f.read()
html=raw2.decode('utf-8','replace')
print(f'Read HTML: {len(html)} chars')

# ── WordChain replacement ──────────────────────────────────────
old_wc_start = '/* \u2550\u2550 KEL\u0130ME Z\u0130NC\u0130R\u0130'
old_wc_end   = "})(); } catch(e){ console.error('WordChain error',e); }"

new_wc = '''/* \u2550\u2550 KEL\u0130ME Z\u0130NC\u0130R\u0130 \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
try { (function() {
  var DICT = {
    A:['ARABA','ASLAN','ADALET','ARMUT','AYNA','ATLAS','AKIL','ATIK','AYAK','ALTIN','ADIM','AKBABA','ARZU','AVUKAT','ATOM','ARIF','ASISTAN','AHTAPOT','ARMONI'],
    B:['BAL','BALIK','BULUT','BEDEN','BAHAR','BIBER','BILGE','BOYUT','BONCUK','BORDO','BUKET','BEYIN','BARAJ','BARDAK','BASKIN','BELLEK'],
    C:['CAM','CEVAP','CESUR','CEYLAN','CEKET','CEVIZ','CADDE','CUMBA','CEPHE'],
    D:['\u00dcNYA','DA\u011eLAR','DUMAN','DOST','DO\u011eA','DALGA','DEN\u0130Z','D\u00dcZEN','D\u0130BEK','DURAK','D\u0130REK','DEKOR','DENGE','DEHA'],
    E:['EKMEK','ELMAS','EVREN','ELMA','ERDEM','EFKAR','EGZOZ','EMPATI','ENLEM','ERBAP','ESMER','EFSANE','EGEMEN'],
    F:['FENER','FIRTINA','FLORA','FELSEFE','F\u0130L','FIZIK','FANTEZI','F\u0130K\u0130R','FIDAN','FARK','FABL'],
    G:['G\u00d6KY\u00dcZ\u00dc','GECE','G\u00dcNE\u015e','G\u00dcZEL','G\u00d6N\u00dcL','GITAR','GURUR','GLOBAL','GELGIT','GIZEM','GUNES'],
    H:['HAYAT','HUZUR','HAYAL','HO\u015eLUK','HABER','HEYKEL','HIKAYE','HOROZ','HAMUR','HAREKET','HAFIZA'],
    I:['I\u015eIK','ILHAN','IRFAN','ISIL','ISINMA'],
    '\u0130':['\u0130LHAM','\u0130NC\u0130','\u0130PEK','\u0130LKBAHAR','\u0130NSAN','\u0130SLAM','\u0130T\u0130NA','\u0130MLEK','\u0130REM','\u0130RADE','\u0130K\u0130Z'],
    J:['JALE','JANDARMA','JEST','JURNAL'],
    K:['KAR','KALEM','KORKU','KO\u015eU','KUZEY','KAVRAM','KALP','K\u0130TAP','KEMAN','KARMA','KUYTU','KAVAK','KADER','KANAT','KIYMET'],
    L:['LALE','LIMAN','LEYLA','LOGO','LIMON','LANSE','LEKE','LEHCE'],
    M:['MAVI','MASAL','MUTLU','M\u00dcZ\u0130K','MERAK','MEYVE','MANZARA','MEVSIM','MORAL','MOTIF','MINARE','MATEM'],
    N:['NEFES','NISAN','NEBULA','NUR','NAMUS','N\u0130HAI','NAKIS','NESIL','NEHIR'],
    O:['ORMAN','OKYANUS','OLGUN','ONGUN','OMURGA','OKUL','OYUN','OLUSUM'],
    '\u00d6':['\u00d6ZLEM','\u00d6RNEK','\u00d6FKE','\u00d6VG\u00dc','\u00d6NLEM','\u00d6GE','\u00d6GREN'],
    P:['PETEK','PEMBE','PRENS','PIXEL','PELIN','PELUR','PROVA','PANDA'],
    R:['RENK','R\u00dcYA','ROBOT','R\u0130T\u0130M','RES\u0130M','RADAR','RANDEVU','RUH','RAKAM','RUZGAR'],
    S:['SEVGI','SABAH','SANAT','SOLAR','SES','SENFONI','SARMAL','SAYGI','SOKAK','SUNAK','SEYIR','SEMBOL','SARKI'],
    '\u015e':['\u015e\u0130\u0130R','\u015eANS','\u015eEKER','\u015e\u0130M\u015eEK','\u015e\u0130FA','\u015eEH\u0130R','\u015e\u0130KAR','\u015eAH\u0130N','\u015eEMS\u0130YE'],
    T:['TOPRAK','TUTKU','TUNA','TOPLU','T\u00dcRK\u00dc','TELEF','TEMEL','T\u0130TREM','TASARIM','TABLO'],
    U:['UMUT','UZAY','UFUK','U\u00c7U\u015e','USTAT','ULEMA','URUN','UYUM','UZLET'],
    '\u00dc':['\u00dcLKE','\u00dc Z\u00dcM','\u00dcSTAT','\u00dcN\u00dc','\u00dcR\u00dcN','\u00dcZ\u00dcM'],
    V:['VAD\u0130','VOLKAN','VICDAN','VASIF','VOLUM','VATAN'],
    Y:['YILDIZ','YA\u015eAM','YURT','Y\u00dcREK','YA\u011eMUR','YAZGI','YETKI','Y\u0130T\u0130K','YANKI','YARAT'],
    Z:['ZAMAN','ZIHIN','ZEBRA','ZEMIN','ZIRVE','ZAR\u0130F','ZEYTIN','ZAFER']
  };
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

  function getTimeLimit(){ return score>=1000?4:score>=600?5:score>=300?7:10; }

  function startCountdown(){
    clearInterval(countdownTimer);
    timeLeft=getTimeLimit(); updateTimerUI();
    countdownTimer=setInterval(function(){
      if(!gameActive) return;
      timeLeft--; updateTimerUI();
      if(timeLeft<=0){ clearInterval(countdownTimer); gameOver('Sure doldu! \u23f0'); }
    },1000);
  }

  function updateTimerUI(){
    if(!lblTimer) return;
    lblTimer.textContent=timeLeft+'s';
    lblTimer.style.color=timeLeft<=3?'#ff1744':timeLeft<=5?'#ff7043':'#69f0ae';
    if(lblTimer.parentElement) lblTimer.parentElement.style.borderColor=timeLeft<=3?'rgba(255,23,68,.4)':'rgba(255,255,255,.08)';
  }

  function gameOver(reason){
    gameActive=false; clearInterval(countdownTimer);
    addBubble('Oyun bitti: '+reason+' (Skor: '+score+')','error-bubble');
    if(score>bestScore){ bestScore=score; localStorage.setItem('ds_wc_best',bestScore); if(lblBest) lblBest.textContent=bestScore; }
    if(hintEl) hintEl.textContent='Yenile butonuna bas';
    if(inputEl) inputEl.disabled=true;
    toast('Oyun bitti! Skor: '+score,'#ff6b9d');
  }

  function addBubble(word, who) {
    if(!chainEl) return;
    var b=document.createElement('span'); b.className='wc-bubble '+(who==='player'?'player':who==='ai'?'ai':'error-bubble');
    b.textContent=word; chainEl.appendChild(b); chainEl.scrollTop=chainEl.scrollHeight;
  }
  function getLastLetter(word) { return word[word.length-1].toUpperCase(); }

  function aiRespond(lastLetter) {
    var pool=(DICT[lastLetter]||[]).filter(function(w){return chain.indexOf(w)<0;});
    if(!pool.length){
      setTimeout(function(){
        addBubble('Bende '+lastLetter+' harfiyle kelime kalmadi. Kazandin!','ai');
        gameActive=false; clearInterval(countdownTimer);
        toast('Tebrikler! AI kelime bulamadi. Kazandiniz!','#69f0ae');
      },600); return;
    }
    var word=pool[Math.floor(Math.random()*pool.length)]; chain.push(word);
    setTimeout(function(){
      addBubble('AI: '+word,'ai');
      if(hintEl) hintEl.textContent='Sira sende! "'+getLastLetter(word)+'" harfiyle basla';
      startCountdown();
    },700);
  }

  function submitWord() {
    if(!inputEl) return;
    var word=inputEl.value.trim().toUpperCase();
    if(!word) return;
    if(!gameActive){ gameActive=true; if(inputEl) inputEl.disabled=false; }

    if(chain.length>0){
      var needed=getLastLetter(chain[chain.length-1]);
      if(word[0]!==needed){
        toast('Kelime "'+needed+'" harfiyle baslamali!','#ff7043');
        inputEl.style.borderColor='#ff1744'; setTimeout(function(){inputEl.style.borderColor='';},600); return;
      }
    }
    if(chain.indexOf(word)>=0){ toast('Bu kelime zaten kullanildi!','#ff7043'); return; }
    if(!isValidWord(word)){
      toast('"'+word+'" sozlukte yok! Oyun bitti.','#ff1744');
      addBubble(word+' - gecersiz kelime!','error-bubble');
      gameOver('"'+word+'" gecersiz'); inputEl.value=''; return;
    }
    clearInterval(countdownTimer);
    chain.push(word); chainLen++; score+=chainLen*word.length;
    addBubble('Sen: '+word,'player');
    if(lblScore) lblScore.textContent=score;
    if(lblChain) lblChain.textContent=chainLen;
    if(score>bestScore){ bestScore=score; localStorage.setItem('ds_wc_best',bestScore); if(lblBest) lblBest.textContent=bestScore; }
    inputEl.value='';
    if(hintEl) hintEl.textContent='AI dusunuyor...';
    aiRespond(getLastLetter(word));
  }

  function resetGame(){
    chain=[]; chainLen=0; score=0; gameActive=false; clearInterval(countdownTimer);
    if(chainEl) chainEl.innerHTML='';
    if(lblScore) lblScore.textContent='0'; if(lblChain) lblChain.textContent='0';
    if(hintEl) hintEl.textContent='Herhangi bir kelime yazarak basla!';
    if(inputEl){ inputEl.value=''; inputEl.disabled=false; }
    if(lblTimer){ lblTimer.textContent='10s'; lblTimer.style.color='#69f0ae'; }
  }

  var btnSend=document.getElementById('btnWcSend'), btnReset=document.getElementById('btnWcReset');
  if(btnSend) btnSend.addEventListener('click', submitWord);
  if(inputEl) inputEl.addEventListener('keydown', function(e){ if(e.key==='Enter'){e.preventDefault();submitWord();} });
  if(btnReset) btnReset.addEventListener('click', resetGame);
  if(hintEl) hintEl.textContent='Herhangi bir kelime yazarak basla!';
})(); } catch(e){ console.error('WordChain error',e); }'''

idx_start = js.find(old_wc_start)
idx_end   = js.find(old_wc_end)
if idx_start>=0 and idx_end>=0:
    js = js[:idx_start] + new_wc + js[idx_end+len(old_wc_end):]
    print('WordChain replaced')
else:
    print('WordChain NOT FOUND', idx_start, idx_end)

# ── Beat replacement ───────────────────────────────────────────
old_beat_start = '/* \u2550\u2550 BEAT MAK\u0130NES\u0130'
old_beat_end   = "})(); } catch(e){ console.error('Beat error',e); }"

new_beat = '''/* \u2550\u2550 BEAT MAK\u0130NES\u0130 \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
try { (function() {
  var gridEl=document.getElementById('beatGrid');
  if(!gridEl) return;
  var TRACKS=[
    {name:'Kick',  type:'kick',  color:'rgba(255,107,157,.7)',colorB:'#ff6b9d',vol:0.8,muted:false},
    {name:'Snare', type:'snare', color:'rgba(0,229,255,.7)',  colorB:'#00e5ff',vol:0.6,muted:false},
    {name:'HiHat', type:'hihat', color:'rgba(255,234,0,.7)', colorB:'#ffea00',vol:0.4,muted:false},
    {name:'Bass',  type:'bass',  color:'rgba(105,240,174,.7)',colorB:'#69f0ae',vol:0.7,muted:false},
    {name:'Rim',   type:'rim',   color:'rgba(124,77,255,.7)', colorB:'#7c4dff',vol:0.5,muted:false},
    {name:'Tom',   type:'tom',   color:'rgba(255,152,0,.7)',  colorB:'#ff9800',vol:0.6,muted:false}
  ];
  var STEPS=16, pattern=[], currentStep=-1, bpm=120, playing=false;
  var audioCtx=null, nextTime=0, timerID=null;
  TRACKS.forEach(function(){ var row=[]; for(var i=0;i<STEPS;i++) row.push(false); pattern.push(row); });

  function playDrum(type,time,vol){
    if(!audioCtx||vol<=0) return;
    var g=audioCtx.createGain(); g.connect(audioCtx.destination);
    switch(type){
      case 'kick':{
        var o=audioCtx.createOscillator(); o.frequency.setValueAtTime(150,time); o.frequency.exponentialRampToValueAtTime(0.001,time+0.25);
        g.gain.setValueAtTime(vol,time); g.gain.exponentialRampToValueAtTime(0.001,time+0.25);
        o.connect(g); o.start(time); o.stop(time+0.25); break;
      }
      case 'snare':{
        var buf=audioCtx.createBuffer(1,audioCtx.sampleRate*0.15,audioCtx.sampleRate);
        var d=buf.getChannelData(0); for(var i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*0.8;
        var src=audioCtx.createBufferSource(); var flt=audioCtx.createBiquadFilter(); flt.type='highpass'; flt.frequency.value=1200;
        src.buffer=buf; src.connect(flt); flt.connect(g);
        g.gain.setValueAtTime(vol,time); g.gain.exponentialRampToValueAtTime(0.001,time+0.15);
        src.start(time); src.stop(time+0.15); break;
      }
      case 'hihat':{
        var buf2=audioCtx.createBuffer(1,audioCtx.sampleRate*0.07,audioCtx.sampleRate);
        var d2=buf2.getChannelData(0); for(var i=0;i<d2.length;i++) d2[i]=(Math.random()*2-1);
        var src2=audioCtx.createBufferSource(); var flt2=audioCtx.createBiquadFilter(); flt2.type='highpass'; flt2.frequency.value=7000;
        src2.buffer=buf2; src2.connect(flt2); flt2.connect(g);
        g.gain.setValueAtTime(vol*0.5,time); g.gain.exponentialRampToValueAtTime(0.001,time+0.06);
        src2.start(time); src2.stop(time+0.07); break;
      }
      case 'bass':{
        var o2=audioCtx.createOscillator(); o2.type='sawtooth'; o2.frequency.setValueAtTime(80,time);
        var flt3=audioCtx.createBiquadFilter(); flt3.type='lowpass'; flt3.frequency.value=400;
        o2.connect(flt3); flt3.connect(g);
        g.gain.setValueAtTime(vol,time); g.gain.exponentialRampToValueAtTime(0.001,time+0.2);
        o2.start(time); o2.stop(time+0.22); break;
      }
      case 'rim':{
        var o3=audioCtx.createOscillator(); o3.type='triangle'; o3.frequency.setValueAtTime(600,time);
        g.gain.setValueAtTime(vol*0.4,time); g.gain.exponentialRampToValueAtTime(0.001,time+0.05);
        o3.connect(g); o3.start(time); o3.stop(time+0.06); break;
      }
      case 'tom':{
        var o4=audioCtx.createOscillator(); o4.frequency.setValueAtTime(200,time); o4.frequency.exponentialRampToValueAtTime(60,time+0.15);
        g.gain.setValueAtTime(vol,time); g.gain.exponentialRampToValueAtTime(0.001,time+0.18);
        o4.connect(g); o4.start(time); o4.stop(time+0.2); break;
      }
    }
  }

  function buildGrid(){
    gridEl.innerHTML='';
    TRACKS.forEach(function(tr,ri){
      var hdr=document.createElement('div');
      hdr.style.cssText='display:flex;align-items:center;gap:3px;padding-right:4px;justify-content:flex-end;';
      var muteBtn=document.createElement('button');
      muteBtn.textContent=tr.muted?'M':'\u25BA';
      muteBtn.title='Mute';
      muteBtn.style.cssText='background:none;border:1px solid rgba(255,255,255,.15);border-radius:4px;cursor:pointer;font-size:.6rem;padding:2px 4px;color:var(--tx3);width:22px;';
      muteBtn.dataset.ri=ri;
      muteBtn.addEventListener('click',function(e){
        var r=parseInt(e.currentTarget.dataset.ri);
        TRACKS[r].muted=!TRACKS[r].muted;
        e.currentTarget.textContent=TRACKS[r].muted?'M':'\u25BA';
        e.currentTarget.style.background=TRACKS[r].muted?'rgba(255,23,68,.3)':'none';
      });
      var nameSpan=document.createElement('span');
      nameSpan.textContent=tr.name;
      nameSpan.style.cssText='font-size:.6rem;color:var(--tx3);min-width:32px;text-align:right;';
      hdr.appendChild(muteBtn); hdr.appendChild(nameSpan);
      gridEl.appendChild(hdr);
      for(var si=0;si<STEPS;si++){
        var btn=document.createElement('button'); btn.className='beat-btn';
        if(si%4===0) btn.style.borderLeft='2px solid rgba(255,255,255,.2)';
        btn.style.setProperty('--beat-color',tr.color); btn.style.setProperty('--beat-color-b',tr.colorB);
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
      TRACKS.forEach(function(tr,ri){ if(pattern[ri][currentStep]&&!tr.muted) playDrum(tr.type,nextTime,tr.vol); });
      nextTime+=60/bpm/4;
    }
    gridEl.querySelectorAll('.beat-btn').forEach(function(btn){
      btn.classList.toggle('playing',parseInt(btn.dataset.step)===currentStep);
    });
    timerID=setTimeout(schedule,25);
  }

  function applyPreset(name){
    var presets={
      'trap':[[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],[0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0],[0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0]],
      'rock':[[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],[0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0]],
      'bossa':[[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0],[0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0],[1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]]
    };
    var p=presets[name]; if(!p) return;
    for(var ri=0;ri<TRACKS.length;ri++) for(var si=0;si<STEPS;si++) pattern[ri][si]=!!(p[ri]&&p[ri][si]);
    gridEl.querySelectorAll('.beat-btn').forEach(function(btn){
      var r=parseInt(btn.dataset.row),s=parseInt(btn.dataset.step);
      btn.classList.toggle('active',pattern[r][s]);
    });
    toast(name.toUpperCase()+' preset yuklendi','#7c4dff');
  }

  var btnPlay=document.getElementById('btnBeatPlay'), btnClear=document.getElementById('btnBeatClear');
  var bpmRange=document.getElementById('beatBpm'), lblBpm=document.getElementById('lblBpm');
  if(bpmRange) bpmRange.addEventListener('input',function(){ bpm=parseInt(bpmRange.value); if(lblBpm) lblBpm.textContent=bpm; });
  if(btnPlay) btnPlay.addEventListener('click',function(){
    if(!playing){
      audioCtx=new(window.AudioContext||window.webkitAudioContext)();
      if(audioCtx.state==='suspended') audioCtx.resume();
      nextTime=audioCtx.currentTime; playing=true; schedule();
      btnPlay.textContent='Stop'; btnPlay.style.color='#ff6b9d';
    } else {
      playing=false; clearTimeout(timerID); currentStep=-1;
      gridEl.querySelectorAll('.beat-btn').forEach(function(b){ b.classList.remove('playing'); });
      btnPlay.textContent='Play'; btnPlay.style.color='#69f0ae';
    }
  });
  if(btnClear) btnClear.addEventListener('click',function(){
    pattern.forEach(function(row){ row.fill(false); });
    gridEl.querySelectorAll('.beat-btn').forEach(function(b){ b.classList.remove('active'); });
  });
  var btnTrap=document.getElementById('btnBeatTrap'), btnRock=document.getElementById('btnBeatRock'), btnBossa=document.getElementById('btnBeatBossa');
  if(btnTrap) btnTrap.addEventListener('click',function(){ applyPreset('trap'); });
  if(btnRock) btnRock.addEventListener('click',function(){ applyPreset('rock'); });
  if(btnBossa) btnBossa.addEventListener('click',function(){ applyPreset('bossa'); });

  buildGrid();
})(); } catch(e){ console.error('Beat error',e); }'''

idx_bs = js.find(old_beat_start)
idx_be = js.find(old_beat_end)
if idx_bs>=0 and idx_be>=0:
    js = js[:idx_bs] + new_beat + js[idx_be+len(old_beat_end):]
    print('Beat replaced')
else:
    print('Beat NOT FOUND', idx_bs, idx_be)

# ── HUB_CATS: Add Gizemli items ───────────────────────────────
import re as re_mod

# Find the Gizemli category closing and insert before it
# Pattern: last item in gizemli category ends with 'debate-sec'}
# followed by newline, spaces, ]}, then Araclar label

matches_giz = list(re_mod.finditer(r"id:'debate-sec'\}", js))
if matches_giz:
    m = matches_giz[-1]  # last occurrence (the rendered one)
    insert_pos = m.end()
    addition = """,
      {em:'🧠', ttl:'Zihin Okuyucu', dsc:'Dusundugunu tahmin eden sihirli AI oyunu',id:'mindread-sec'},
      {em:'🎺', ttl:'Kaos Simfonisi', dsc:'Ses dalgalariyla kaotik muzik olutur',id:'chaos-music-sec'},
      {em:'🏆', ttl:'Kisilik Analizi', dsc:'Hareketlerinle kisilik tipini kesfet',id:'personality-sec'}"""
    js = js[:insert_pos] + addition + js[insert_pos:]
    print('Gizemli 3 items added')
else:
    print('debate-sec NOT FOUND in js')

# ── HUB_CATS: Add Araclar items ───────────────────────────────
matches_todo = list(re_mod.finditer(r"id:'todo-sec'\}", js))
if matches_todo:
    m = matches_todo[-1]
    insert_pos = m.end()
    addition2 = """,
      {em:'🎲', ttl:'Karar Zarlari', dsc:'Akilli karar destek zar sistemi',id:'decisiondie-sec'},
      {em:'📊', ttl:'Biyoenerji Haritasi', dsc:'Gunluk enerji ve odak takip grafigi',id:'energy-map-sec'},
      {em:'🎯', ttl:'Aliskanlik Okcu', dsc:'Hedef belirleme ve aliskanlik ok tablosu',id:'habit-sec'}"""
    js = js[:insert_pos] + addition2 + js[insert_pos:]
    print('Araclar 3 items added')
else:
    print('todo-sec NOT FOUND in js')

# ── HTML: Add timer label to WordChain stats ─────────────────
old_wc_stats = '''<div class="game-card" style="padding:.5rem .9rem;font-size:.85rem;border-color:rgba(255,255,255,.08);">🔥 Puan: <strong id="lblWcScore" style="color:#ffea00;">0</strong></div>
      <div class="game-card" style="padding:.5rem .9rem;font-size:.85rem;border-color:rgba(255,255,255,.08);">⛓ Zincir: <strong id="lblWcChain" style="color:#00e5ff;">0</strong></div>
      <div class="game-card" style="padding:.5rem .9rem;font-size:.85rem;border-color:rgba(255,255,255,.08);">🏆 En İyi: <strong id="lblWcBest" style="color:#69f0ae;">0</strong></div>'''
new_wc_stats = '''<div class="game-card" style="padding:.5rem .9rem;font-size:.85rem;border-color:rgba(255,255,255,.08);">🔥 Puan: <strong id="lblWcScore" style="color:#ffea00;">0</strong></div>
      <div class="game-card" style="padding:.5rem .9rem;font-size:.85rem;border-color:rgba(255,255,255,.08);">⛓ Zincir: <strong id="lblWcChain" style="color:#00e5ff;">0</strong></div>
      <div class="game-card" style="padding:.5rem .9rem;font-size:.85rem;border-color:rgba(255,255,255,.08);">⏱ Süre: <strong id="lblWcTimer" style="color:#69f0ae;">10s</strong></div>
      <div class="game-card" style="padding:.5rem .9rem;font-size:.85rem;border-color:rgba(255,255,255,.08);">🏆 En İyi: <strong id="lblWcBest" style="color:#69f0ae;">0</strong></div>'''
if old_wc_stats in html:
    html = html.replace(old_wc_stats, new_wc_stats, 1)
    print('WC Timer label added to HTML')
else:
    print('WC stats HTML NOT FOUND - will add anyway')

# ── HTML: Update Beat grid to 16 steps + presets ─────────────
old_beat_html = 'grid-template-columns:60px repeat(8,1fr)'
new_beat_html = 'grid-template-columns:90px repeat(16,1fr)'
if old_beat_html in html:
    html = html.replace(old_beat_html, new_beat_html, 1)
    print('Beat HTML updated')

old_beat_footer = '''<div style="text-align:center;font-size:.75rem;color:var(--tx3);">Aktif adım neon yanar · BPM sürgüsüyle hız ayarla</div>'''
new_beat_footer = '''<div style="display:flex;gap:.5rem;flex-wrap:wrap;justify-content:center;margin-top:.4rem;">
      <button class="mini-btn" id="btnBeatTrap" style="font-size:.68rem;padding:5px 10px;">🎤 Trap</button>
      <button class="mini-btn" id="btnBeatRock" style="font-size:.68rem;padding:5px 10px;">🎸 Rock</button>
      <button class="mini-btn" id="btnBeatBossa" style="font-size:.68rem;padding:5px 10px;">🎷 Bossa</button>
    </div>
    <div style="text-align:center;font-size:.72rem;color:var(--tx3);">16 adim · 6 kanal · Mute per kanal · 3 hazir preset</div>'''
if old_beat_footer in html:
    html = html.replace(old_beat_footer, new_beat_footer, 1)
    print('Beat presets footer added to HTML')

# ── Write everything safely ───────────────────────────────────
js_bytes  = js.encode('utf-8', 'replace')
html_bytes= html.encode('utf-8', 'replace')
with open(JS,'wb') as f: f.write(js_bytes)
with open(HTML,'wb') as f: f.write(html_bytes)
print(f'Done. JS={len(js_bytes)} bytes, HTML={len(html_bytes)} bytes')
