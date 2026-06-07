/* ============================================================
   NEW FEATURES M — Mega Update V3 (Kısım 2)
   ============================================================ */

// 4. Retro Tamagotchi (Sanal Bebek)
try {
  let petState = JSON.parse(localStorage.getItem('ds_pet_state')) || {
    hunger: 100,
    happiness: 100,
    energy: 100,
    lastUpdate: Date.now()
  };
  
  let petInterval = null;
  
  function savePet() {
    petState.lastUpdate = Date.now();
    localStorage.setItem('ds_pet_state', JSON.stringify(petState));
  }
  
  function updatePetBars() {
    let hp = document.getElementById('pet-hunger');
    let ha = document.getElementById('pet-happy');
    let he = document.getElementById('pet-energy');
    if(!hp || !ha || !he) return;
    
    hp.style.width = petState.hunger + '%';
    ha.style.width = petState.happiness + '%';
    he.style.width = petState.energy + '%';
    
    let face = document.getElementById('pet-face');
    if(petState.energy < 20) {
      face.innerHTML = '😴';
    } else if(petState.hunger < 30 || petState.happiness < 30) {
      face.innerHTML = '🥺';
    } else if(petState.hunger < 50 || petState.happiness < 50) {
      face.innerHTML = '😐';
    } else {
      face.innerHTML = '😄';
    }
  }

  function initPet() {
    let now = Date.now();
    let diffHours = (now - petState.lastUpdate) / (1000 * 60 * 60);
    
    // Decrease stats based on time passed
    petState.hunger = Math.max(0, petState.hunger - (diffHours * 5));
    petState.happiness = Math.max(0, petState.happiness - (diffHours * 4));
    petState.energy = Math.max(0, petState.energy - (diffHours * 3));
    
    updatePetBars();
    
    petInterval = setInterval(() => {
      petState.hunger = Math.max(0, petState.hunger - 0.1);
      petState.happiness = Math.max(0, petState.happiness - 0.08);
      petState.energy = Math.max(0, petState.energy - 0.05);
      updatePetBars();
      savePet();
    }, 5000);
  }

  window.dsPetFeed = function() {
    petState.hunger = Math.min(100, petState.hunger + 20);
    document.getElementById('pet-face').innerHTML = '🍕';
    updatePetBars(); savePet();
    setTimeout(updatePetBars, 1000);
  };
  
  window.dsPetPlay = function() {
    petState.happiness = Math.min(100, petState.happiness + 20);
    petState.energy = Math.max(0, petState.energy - 10);
    document.getElementById('pet-face').innerHTML = '🎮';
    updatePetBars(); savePet();
    setTimeout(updatePetBars, 1000);
  };
  
  window.dsPetSleep = function() {
    petState.energy = Math.min(100, petState.energy + 40);
    petState.hunger = Math.max(0, petState.hunger - 10);
    document.getElementById('pet-face').innerHTML = '💤';
    updatePetBars(); savePet();
    setTimeout(updatePetBars, 1500);
  };

  const petHtml = `
    <div class="card premium-card" style="padding:30px; border-radius:15px; text-align:center; max-width:400px; margin:0 auto;">
      <h2 style="color:var(--a1); margin-bottom:20px;">🦖 Sanal Bebek</h2>
      
      <div style="background:#000; border:4px solid var(--tx2); border-radius:15px; padding:30px; margin-bottom:20px;">
        <div id="pet-face" style="font-size:80px; animation:petBounce 2s infinite alternate;">😄</div>
      </div>
      
      <div style="text-align:left; margin-bottom:20px; color:var(--tx1); font-weight:bold;">
        <div style="margin-bottom:10px;">Tokluk: <div style="background:#333; height:15px; border-radius:10px; overflow:hidden;"><div id="pet-hunger" style="background:#4CAF50; width:100%; height:100%; transition:0.3s;"></div></div></div>
        <div style="margin-bottom:10px;">Mutluluk: <div style="background:#333; height:15px; border-radius:10px; overflow:hidden;"><div id="pet-happy" style="background:#FFC107; width:100%; height:100%; transition:0.3s;"></div></div></div>
        <div style="margin-bottom:10px;">Enerji: <div style="background:#333; height:15px; border-radius:10px; overflow:hidden;"><div id="pet-energy" style="background:#2196F3; width:100%; height:100%; transition:0.3s;"></div></div></div>
      </div>
      
      <div style="display:flex; justify-content:space-between; gap:10px;">
        <button onclick="dsPetFeed()" style="flex:1; background:var(--bg3); color:var(--tx1); border:1px solid var(--tx2); padding:10px; border-radius:10px; cursor:pointer;">🍕 Besle</button>
        <button onclick="dsPetPlay()" style="flex:1; background:var(--bg3); color:var(--tx1); border:1px solid var(--tx2); padding:10px; border-radius:10px; cursor:pointer;">🎮 Oyna</button>
        <button onclick="dsPetSleep()" style="flex:1; background:var(--bg3); color:var(--tx1); border:1px solid var(--tx2); padding:10px; border-radius:10px; cursor:pointer;">💤 Uyut</button>
      </div>
    </div>
    <style>@keyframes petBounce { 0% {transform:translateY(0);} 100% {transform:translateY(-10px);} }</style>
  `;
  document.getElementById('hubMain').insertAdjacentHTML('afterend', `<section id="tamagotchi-sec" class="page-sec" style="display:none; padding:40px 20px;">${petHtml}</section>`);
  
  // Initialize pet logic shortly after load
  setTimeout(initPet, 1000);
} catch(e) { console.error("Pet Error", e); }


// 5. 3D Uzamsal Ses Testi (8D Audio)
try {
  let audio3DCtx = null;
  let panner = null;
  let osc = null;
  let audio3DInterval = null;
  let angle = 0;

  window.dsToggle3DAudio = function() {
    const btn = document.getElementById('audio3d-btn');
    const ball = document.getElementById('audio3d-ball');
    
    if(!audio3DCtx) {
      audio3DCtx = new (window.AudioContext || window.webkitAudioContext)();
      panner = audio3DCtx.createPanner();
      panner.panningModel = 'HRTF';
      panner.distanceModel = 'inverse';
      panner.refDistance = 1;
      panner.maxDistance = 10000;
      panner.rolloffFactor = 1;
      panner.coneInnerAngle = 360;
      panner.coneOuterAngle = 0;
      panner.coneOuterGain = 0;
      panner.connect(audio3DCtx.destination);
    }
    
    if(audio3DCtx.state === 'suspended') audio3DCtx.resume();

    if(osc) {
      osc.stop();
      osc = null;
      clearInterval(audio3DInterval);
      btn.innerHTML = '🎧 Başlat';
      ball.style.transform = 'translate(-50%, -50%)';
    } else {
      osc = audio3DCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 440; // A4
      
      // Make it sound like a droning bee
      let lfo = audio3DCtx.createOscillator();
      lfo.frequency.value = 5;
      let lfoGain = audio3DCtx.createGain();
      lfoGain.gain.value = 10;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();
      
      osc.connect(panner);
      osc.start();
      btn.innerHTML = '⏹️ Durdur';
      
      // Orbit animation
      audio3DInterval = setInterval(() => {
        angle += 0.05;
        let x = Math.sin(angle) * 5;
        let z = Math.cos(angle) * 5;
        
        // Update Panner position
        panner.positionX.value = x;
        panner.positionZ.value = z;
        panner.positionY.value = 0;
        
        // Visuals (Radius 100px)
        let vx = Math.sin(angle) * 100;
        let vy = Math.cos(angle) * 100; // Map Z to visual Y
        ball.style.transform = `translate(calc(-50% + ${vx}px), calc(-50% + ${vy}px)) scale(${1 + z*0.1})`;
      }, 50);
    }
  };

  const audio3DHtml = `
    <div class="card premium-card" style="padding:40px; border-radius:15px; text-align:center; max-width:500px; margin:0 auto;">
      <h2 style="color:var(--a1); margin-bottom:10px;">🎧 3D Uzamsal Ses Testi</h2>
      <p style="color:var(--tx2); margin-bottom:30px;">Kulaklık takın. Sesin etrafınızda fiziksel olarak döndüğünü hissedeceksiniz.</p>
      
      <div style="position:relative; width:300px; height:300px; border:2px dashed rgba(255,255,255,0.2); border-radius:50%; margin:0 auto 30px auto;">
        <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); font-size:40px;">👤</div>
        <div id="audio3d-ball" style="position:absolute; top:50%; left:50%; width:30px; height:30px; background:var(--a1); border-radius:50%; transform:translate(-50%, -50%); transition:transform 0.05s linear; box-shadow:0 0 15px var(--a1);"></div>
      </div>
      
      <button id="audio3d-btn" onclick="dsToggle3DAudio()" style="background:var(--a1); color:#000; padding:15px 40px; font-size:18px; border:none; border-radius:30px; font-weight:bold; cursor:pointer;">
        🎧 Başlat
      </button>
    </div>
  `;
  document.getElementById('hubMain').insertAdjacentHTML('afterend', `<section id="audio-3d-sec" class="page-sec" style="display:none; padding:40px 20px;">${audio3DHtml}</section>`);
} catch(e) { console.error("3D Audio Error", e); }


// 6. Gerçekçi Stüdyo Piyanosu (1-9 Tuşları)
try {
  let pianoCtx = null;
  const PIANO_MAP = {
    '1': 261.63, // C4
    '2': 293.66, // D4
    '3': 329.63, // E4
    '4': 349.23, // F4
    '5': 392.00, // G4
    '6': 440.00, // A4
    '7': 493.88, // B4
    '8': 523.25, // C5
    '9': 587.33  // D5
  };
  
  function playStudioPiano(freq) {
    if(!pianoCtx) pianoCtx = new (window.AudioContext || window.webkitAudioContext)();
    if(pianoCtx.state === 'suspended') pianoCtx.resume();
    
    // Create a rich piano-like synthetic sound
    let osc1 = pianoCtx.createOscillator();
    let osc2 = pianoCtx.createOscillator();
    osc1.type = 'triangle';
    osc2.type = 'sine';
    
    osc1.frequency.value = freq;
    osc2.frequency.value = freq * 2; // harmonic
    
    let gainNode = pianoCtx.createGain();
    
    // ADSR Envelope
    let t = pianoCtx.currentTime;
    gainNode.gain.setValueAtTime(0, t);
    gainNode.gain.linearRampToValueAtTime(1, t + 0.02); // Fast attack
    gainNode.gain.exponentialRampToValueAtTime(0.2, t + 0.3); // Decay
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + 2.5); // Release
    
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(pianoCtx.destination);
    
    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 2.6);
    osc2.stop(t + 2.6);
  }

  window.dsPressStudioPiano = function(key) {
    if(!PIANO_MAP[key]) return;
    playStudioPiano(PIANO_MAP[key]);
    let el = document.getElementById('sp-key-' + key);
    if(el) {
      el.style.background = '#e0e0e0';
      el.style.transform = 'scale(0.95)';
      setTimeout(() => {
        el.style.background = '#fff';
        el.style.transform = 'scale(1)';
      }, 100);
    }
  };

  document.addEventListener('keydown', (e) => {
    // Only if section is active
    let sec = document.getElementById('studio-piano-sec');
    if(!sec || !sec.classList.contains('ds-active')) return;
    if(e.repeat) return;
    if(document.activeElement.tagName === 'INPUT') return;
    dsPressStudioPiano(e.key);
  });

  let keysHtml = '';
  for(let i=1; i<=9; i++) {
    keysHtml += `
      <div id="sp-key-${i}" onclick="dsPressStudioPiano('${i}')" style="width:60px; height:250px; background:#fff; border:1px solid #ccc; border-radius:0 0 10px 10px; display:flex; align-items:flex-end; justify-content:center; padding-bottom:20px; font-size:24px; font-weight:bold; color:#333; cursor:pointer; user-select:none; transition:0.1s; box-shadow:0 4px 10px rgba(0,0,0,0.5);">
        ${i}
      </div>
    `;
  }

  const studioPianoHtml = `
    <div class="card premium-card" style="padding:40px; border-radius:15px; text-align:center;">
      <h2 style="color:var(--a1); margin-bottom:10px;">🎹 Stüdyo Piyanosu</h2>
      <p style="color:var(--tx2); margin-bottom:30px;">Gerçekçi bir synthesizer ile ayarlanmış kuyruklu piyano sesi. Klavyenizdeki <b>1'den 9'a kadar</b> olan sayılara basarak çalın.</p>
      
      <div style="display:flex; justify-content:center; gap:5px; background:#111; padding:20px; border-radius:15px; max-width:fit-content; margin:0 auto; box-shadow:inset 0 10px 20px rgba(0,0,0,0.8);">
        ${keysHtml}
      </div>
    </div>
  `;
  document.getElementById('hubMain').insertAdjacentHTML('afterend', `<section id="studio-piano-sec" class="page-sec" style="display:none; padding:40px 20px; max-width:800px; margin:0 auto;">${studioPianoHtml}</section>`);
} catch(e) { console.error("Studio Piano Error", e); }
