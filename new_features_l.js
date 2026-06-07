/* ============================================================
   NEW FEATURES L — Mega Update V3 (Kısım 1)
   ============================================================ */

const loadScript = (url) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${url}"]`)) return resolve();
    const script = document.createElement('script');
    script.src = url;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// 1. Kişisel Seslendirmen (TTS Reader)
try {
  let speechSynth = window.speechSynthesis;
  let currentUtterance = null;
  
  window.dsTTSPlay = function() {
    let text = document.getElementById('tts-input').value;
    if(!text.trim()) { alert('Lütfen okunacak metni girin!'); return; }
    
    if(speechSynth.speaking) {
      if(speechSynth.paused) {
        speechSynth.resume();
      } else {
        speechSynth.pause();
      }
      return;
    }
    
    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.lang = 'tr-TR';
    
    // Find a Turkish voice if available
    let voices = speechSynth.getVoices();
    let trVoice = voices.find(v => v.lang.includes('tr'));
    if(trVoice) currentUtterance.voice = trVoice;
    
    currentUtterance.rate = document.getElementById('tts-speed').value || 1;
    
    currentUtterance.onend = function() {
      document.getElementById('tts-play-btn').innerHTML = '▶️ Oynat';
    };
    
    speechSynth.speak(currentUtterance);
    document.getElementById('tts-play-btn').innerHTML = '⏸️ Duraklat';
  };
  
  window.dsTTSStop = function() {
    speechSynth.cancel();
    document.getElementById('tts-play-btn').innerHTML = '▶️ Oynat';
  };
  
  window.dsTTSClear = function() {
    window.dsTTSStop();
    document.getElementById('tts-input').value = '';
  };
  
  window.dsTTSLoadPDF = async function(e) {
    let file = e.target.files[0];
    if(!file) return;
    
    document.getElementById('tts-input').value = 'PDF yükleniyor ve okunuyor, lütfen bekleyin...';
    
    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js');
      let pdfjsLib = window['pdfjs-dist/build/pdf'];
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
      
      let reader = new FileReader();
      reader.onload = async function(ev) {
        let typedarray = new Uint8Array(ev.target.result);
        let pdf = await pdfjsLib.getDocument(typedarray).promise;
        let fullText = '';
        
        let maxPages = Math.min(pdf.numPages, 10); // Limit to 10 pages for performance
        for(let i=1; i<=maxPages; i++) {
          let page = await pdf.getPage(i);
          let textContent = await page.getTextContent();
          let pageText = textContent.items.map(item => item.str).join(' ');
          fullText += pageText + '\n\n';
        }
        
        if(pdf.numPages > 10) fullText += '\n[Sistem Uyarısı: Sadece ilk 10 sayfa yüklendi.]';
        document.getElementById('tts-input').value = fullText;
      };
      reader.readAsArrayBuffer(file);
    } catch(err) {
      console.error(err);
      alert('PDF okuma hatası oluştu!');
      document.getElementById('tts-input').value = '';
    }
  };

  const ttsHtml = `
    <div class="card premium-card" style="padding:30px; border-radius:15px; text-align:center;">
      <h2 style="color:var(--a1); margin-bottom:10px;">🗣️ Kişisel Seslendirmen</h2>
      <p style="color:var(--tx2); margin-bottom:20px;">Gözlerin yorulduğunda PDF veya metinleri yapay zeka senin için okusun.</p>
      
      <div style="display:flex; justify-content:center; gap:10px; margin-bottom:15px;">
        <label for="tts-pdf-upload" style="background:rgba(255,255,255,0.1); padding:10px 20px; border-radius:10px; cursor:pointer; font-weight:bold; color:var(--tx1); transition:0.3s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">
          📄 PDF Yükle (Max 10 Sayfa)
        </label>
        <input type="file" id="tts-pdf-upload" accept="application/pdf" style="display:none;" onchange="dsTTSLoadPDF(event)">
      </div>
      
      <textarea id="tts-input" placeholder="Okunacak metni buraya yapıştırın veya PDF yükleyin..." style="width:100%; height:200px; padding:15px; border-radius:10px; background:rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.1); color:var(--tx1); font-family:inherit; resize:vertical; margin-bottom:15px;"></textarea>
      
      <div style="display:flex; align-items:center; justify-content:center; gap:15px; flex-wrap:wrap;">
        <button id="tts-play-btn" onclick="dsTTSPlay()" style="background:var(--a1); color:#000; padding:10px 20px; border:none; border-radius:10px; font-weight:bold; cursor:pointer;">▶️ Oynat</button>
        <button onclick="dsTTSStop()" style="background:rgba(255,0,0,0.6); color:#fff; padding:10px 20px; border:none; border-radius:10px; font-weight:bold; cursor:pointer;">⏹️ Durdur</button>
        <button onclick="dsTTSClear()" style="background:rgba(255,255,255,0.1); color:var(--tx1); padding:10px 20px; border:none; border-radius:10px; cursor:pointer;">🗑️ Temizle</button>
        
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="color:var(--tx2);">Hız:</span>
          <input type="range" id="tts-speed" min="0.5" max="2" step="0.1" value="1" style="width:100px;">
        </div>
      </div>
    </div>
  `;

  document.getElementById('hubMain').insertAdjacentHTML('afterend', `<section id="tts-reader-sec" class="page-sec" style="display:none; max-width:800px; margin:0 auto; padding:40px 20px;">${ttsHtml}</section>`);
} catch(e) { console.error("TTS Reader Error", e); }


// 2. İkinci Monitör (Canlı Ekran Yayını via PeerJS)
try {
  let screenPeer = null;
  let screenStream = null;
  let screenCall = null;
  
  window.dsScreenShareStart = async function() {
    try {
      await loadScript('https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js');
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js');
      
      const btn = document.getElementById('screen-start-btn');
      btn.innerHTML = '⏳ Hazırlanıyor...';
      btn.disabled = true;
      
      screenStream = await navigator.mediaDevices.getDisplayMedia({ video: { cursor: "always" }, audio: false });
      
      screenPeer = new Peer();
      screenPeer.on('open', function(id) {
        document.getElementById('screen-qr-container').style.display = 'block';
        document.getElementById('screen-qr').innerHTML = '';
        
        // Generate Receiver URL
        let url = window.location.href.split('?')[0] + '?receiveScreen=' + id;
        
        new QRCode(document.getElementById("screen-qr"), {
          text: url,
          width: 200,
          height: 200,
          colorDark : "#ffffff",
          colorLight : "#000000"
        });
        
        document.getElementById('screen-link').value = url;
        btn.innerHTML = '📡 Yayın Yapılıyor';
        
        // Listen for incoming calls
        screenPeer.on('call', function(call) {
          screenCall = call;
          call.answer(screenStream); // Answer with the screen stream
          document.getElementById('screen-status').innerHTML = '✅ Cihaz bağlandı! Ekranınız yansıtılıyor.';
          document.getElementById('screen-status').style.color = '#4CAF50';
        });
      });
      
      screenStream.getVideoTracks()[0].onended = function () {
        dsScreenShareStop();
      };
      
    } catch(err) {
      console.error(err);
      alert('Ekran paylaşımı başlatılamadı. İzin reddedilmiş olabilir.');
      document.getElementById('screen-start-btn').innerHTML = '📺 Ekran Yayınını Başlat';
      document.getElementById('screen-start-btn').disabled = false;
    }
  };
  
  window.dsScreenShareStop = function() {
    if(screenStream) {
      screenStream.getTracks().forEach(t => t.stop());
      screenStream = null;
    }
    if(screenPeer) {
      screenPeer.destroy();
      screenPeer = null;
    }
    document.getElementById('screen-qr-container').style.display = 'none';
    document.getElementById('screen-start-btn').innerHTML = '📺 Ekran Yayınını Başlat';
    document.getElementById('screen-start-btn').disabled = false;
    document.getElementById('screen-status').innerHTML = '';
  };

  const screenHtml = `
    <div class="card premium-card" style="padding:40px; border-radius:15px; text-align:center;">
      <h2 style="color:var(--a1); margin-bottom:10px;">📱 İkinci Monitör (Canlı Yayın)</h2>
      <p style="color:var(--tx2); margin-bottom:30px;">Bilgisayarınızın ekranını saniyeler içinde telefonunuza veya tabletinize yansıtın.</p>
      
      <button id="screen-start-btn" onclick="dsScreenShareStart()" style="background:var(--a1); color:#000; padding:15px 30px; font-size:18px; border:none; border-radius:10px; font-weight:bold; cursor:pointer; margin-bottom:20px; transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
        📺 Ekran Yayınını Başlat
      </button>
      <button onclick="dsScreenShareStop()" style="background:rgba(255,0,0,0.6); color:#fff; padding:15px 20px; font-size:18px; border:none; border-radius:10px; font-weight:bold; cursor:pointer; margin-bottom:20px; margin-left:10px;">
        ⏹️ Yayını Durdur
      </button>
      
      <div id="screen-qr-container" style="display:none; margin-top:20px;">
        <h3 style="color:#fff; margin-bottom:15px;">Bağlanmak İçin Kodu Okutun:</h3>
        <div id="screen-qr" style="display:flex; justify-content:center; margin-bottom:20px; padding:10px; background:#000; border-radius:10px; width:fit-content; margin:0 auto;"></div>
        <p style="color:var(--tx2); margin-top:15px; margin-bottom:5px;">Veya bu linki diğer cihaza gönderin:</p>
        <input type="text" id="screen-link" readonly style="width:80%; max-width:400px; padding:10px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:#fff; border-radius:5px; text-align:center;">
        <p id="screen-status" style="margin-top:20px; font-weight:bold; color:var(--a1);"></p>
      </div>
    </div>
  `;
  document.getElementById('hubMain').insertAdjacentHTML('afterend', `<section id="screen-caster-sec" class="page-sec" style="display:none; max-width:800px; margin:0 auto; padding:40px 20px;">${screenHtml}</section>`);
} catch(e) { console.error("Screen Share Error", e); }


// 3. Otomatik Lo-Fi Yapıcı
try {
  let lofiCtx = null;
  let isLofiPlaying = false;
  let lofiInterval = null;
  let rainSource = null, vinylSource = null;
  let lofiGain = null;
  
  // Creates noise buffer for rain/vinyl
  function createNoiseBuffer(ctx, seconds, type) {
    const bufferSize = ctx.sampleRate * seconds;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      let white = Math.random() * 2 - 1;
      if (type === 'rain') {
        data[i] = (white + (data[i-1] || 0)) / 2; // Brown noise ish
      } else {
        // Vinyl crackle: occasional pops
        data[i] = Math.random() > 0.999 ? white * 0.8 : white * 0.05;
      }
    }
    return buffer;
  }
  
  function playNoise(ctx, type, volume) {
    let source = ctx.createBufferSource();
    source.buffer = createNoiseBuffer(ctx, 5, type);
    source.loop = true;
    let filter = ctx.createBiquadFilter();
    filter.type = type === 'rain' ? 'lowpass' : 'highpass';
    filter.frequency.value = type === 'rain' ? 1000 : 3000;
    let gain = ctx.createGain();
    gain.gain.value = volume;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(lofiGain);
    source.start();
    return source;
  }

  function playLofiChord(ctx, frequencies) {
    frequencies.forEach((freq, idx) => {
      let osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      let gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.5); // Slow attack
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.0); // Slow decay
      
      osc.connect(gain);
      gain.connect(lofiGain);
      osc.start(ctx.currentTime + (idx * 0.05)); // slight strum
      osc.stop(ctx.currentTime + 3.5);
    });
  }

  const lofiChords = [
    [261.63, 329.63, 392.00, 493.88], // Cmaj7
    [220.00, 261.63, 329.63, 392.00], // Am7
    [349.23, 440.00, 523.25, 659.25], // Fmaj7
    [196.00, 246.94, 293.66, 349.23], // G7
    [293.66, 349.23, 440.00, 523.25]  // Dm7
  ];

  window.dsToggleLofi = function() {
    if(!lofiCtx) {
      lofiCtx = new (window.AudioContext || window.webkitAudioContext)();
      lofiGain = lofiCtx.createGain();
      lofiGain.gain.value = 0.8;
      
      // Lo-Fi effect filter
      let filter = lofiCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1500;
      lofiGain.connect(filter);
      filter.connect(lofiCtx.destination);
    }
    
    if(lofiCtx.state === 'suspended') lofiCtx.resume();
    
    const btn = document.getElementById('lofi-toggle-btn');
    const visualizer = document.getElementById('lofi-visualizer');
    
    if(isLofiPlaying) {
      if(rainSource) { rainSource.stop(); rainSource = null; }
      if(vinylSource) { vinylSource.stop(); vinylSource = null; }
      clearInterval(lofiInterval);
      btn.innerHTML = '☕ Lo-Fi Başlat';
      visualizer.classList.remove('lofi-active');
      isLofiPlaying = false;
    } else {
      rainSource = playNoise(lofiCtx, 'rain', 0.2);
      vinylSource = playNoise(lofiCtx, 'vinyl', 0.1);
      
      let step = 0;
      lofiInterval = setInterval(() => {
        let chord = lofiChords[Math.floor(Math.random() * lofiChords.length)];
        playLofiChord(lofiCtx, chord);
        
        // Visual effect
        let c = Math.floor(Math.random()*360);
        visualizer.style.boxShadow = `0 0 40px hsl(${c}, 70%, 50%)`;
      }, 4000); // Play chord every 4 seconds
      
      playLofiChord(lofiCtx, lofiChords[0]); // Play first chord immediately
      
      btn.innerHTML = '⏹️ Durdur';
      visualizer.classList.add('lofi-active');
      isLofiPlaying = true;
    }
  };

  const lofiHtml = `
    <style>
      #lofi-visualizer { width: 150px; height: 150px; border-radius: 50%; background: rgba(0,0,0,0.8); margin: 0 auto 30px auto; border: 4px solid var(--tx2); transition: all 1s ease; display:flex; align-items:center; justify-content:center; font-size:40px; }
      #lofi-visualizer.lofi-active { animation: lofiPulse 4s infinite alternate ease-in-out; border-color: var(--a1); }
      @keyframes lofiPulse { 0% { transform: scale(1); } 100% { transform: scale(1.1); } }
    </style>
    <div class="card premium-card" style="padding:40px; border-radius:15px; text-align:center;">
      <h2 style="color:var(--a1); margin-bottom:10px;">☕ Otomatik Lo-Fi Yapıcı</h2>
      <p style="color:var(--tx2); margin-bottom:30px;">Algoritmik olarak sonsuza kadar üretilen rahatlatıcı Lo-Fi müzik.</p>
      
      <div id="lofi-visualizer">🎧</div>
      
      <button id="lofi-toggle-btn" onclick="dsToggleLofi()" style="background:var(--a1); color:#000; padding:15px 40px; font-size:18px; border:none; border-radius:30px; font-weight:bold; cursor:pointer; box-shadow:0 0 20px rgba(124,77,255,0.4);">
        ☕ Lo-Fi Başlat
      </button>
    </div>
  `;
  document.getElementById('hubMain').insertAdjacentHTML('afterend', `<section id="lofi-maker-sec" class="page-sec" style="display:none; max-width:600px; margin:0 auto; padding:40px 20px;">${lofiHtml}</section>`);
} catch(e) { console.error("LoFi Error", e); }
