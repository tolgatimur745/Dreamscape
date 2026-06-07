/* ============================================================
   NEW FEATURES K — Süper Güçler Atölyesi (Kısım 2)
   ============================================================ */

// 4. 3D Müzik Evreni (Particle Visualizer)
try {
  if (!document.getElementById('music-universe-sec')) {
    const html = `
    <section id="music-universe-sec" class="section ds-section" style="display:none;min-height:100vh;background:#000;color:var(--tx);font-family:'Segoe UI',sans-serif;padding-top:60px;position:relative;overflow:hidden;">
      <button class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:100;cursor:pointer;background:rgba(255,255,255,0.1);border:1px solid #fff;color:#fff;padding:10px 15px;border-radius:8px;font-weight:bold;backdrop-filter:blur(5px);" onclick="if(typeof dsGoToSection==='function') { document.getElementById('mu-audio').pause(); dsGoToSection('hubPage',''); }">◀ Ana Sayfa</button>
      
      <div id="mu-ui" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;z-index:10;background:rgba(0,0,0,0.6);padding:40px;border-radius:20px;backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.2);">
        <h2 style="color:#fff;margin-bottom:10px;text-shadow:0 0 10px #9b59b6;font-size:32px;">🌌 3D Müzik Evreni</h2>
        <p style="color:#aaa;margin-bottom:30px;">Bir MP3 dosyası sürükleyin ve ses frekanslarının uzayda nasıl dans ettiğini izleyin.</p>
        
        <input type="file" id="mu-file" accept="audio/mp3, audio/wav" style="display:none;" onchange="muHandleFile(event)">
        <label for="mu-file" style="display:inline-block;background:linear-gradient(45deg, #9b59b6, #3498db);color:#fff;padding:15px 40px;border-radius:30px;cursor:pointer;font-weight:bold;font-size:18px;box-shadow:0 10px 30px rgba(155,89,182,0.5);">
          Şarkı Yükle
        </label>
      </div>
      
      <canvas id="mu-canvas" style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;"></canvas>
      <audio id="mu-audio" style="display:none;"></audio>
    </section>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    let muAudioCtx, muAnalyser, muDataArray;
    let muScene, muCamera, muRenderer, muParticles;
    let muInitDone = false;

    window.muInit3D = async () => {
      if(muInitDone) return;
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');
      
      const canvas = document.getElementById('mu-canvas');
      muRenderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      muRenderer.setSize(window.innerWidth, window.innerHeight);
      
      muScene = new THREE.Scene();
      muCamera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
      muCamera.position.z = 100;

      const particleCount = 2000;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const initialPositions = new Float32Array(particleCount * 3);

      for(let i=0; i<particleCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const radius = 30 + Math.random() * 20;
        
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);
        
        positions[i*3] = x; positions[i*3+1] = y; positions[i*3+2] = z;
        initialPositions[i*3] = x; initialPositions[i*3+1] = y; initialPositions[i*3+2] = z;
        
        colors[i*3] = Math.random(); colors[i*3+1] = Math.random(); colors[i*3+2] = 1;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('initialPosition', new THREE.BufferAttribute(initialPositions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({ size: 1.5, vertexColors: true, transparent: true, opacity: 0.8 });
      muParticles = new THREE.Points(geometry, material);
      muScene.add(muParticles);
      
      muInitDone = true;
      muAnimate();
    };

    window.muAnimate = () => {
      requestAnimationFrame(muAnimate);
      
      if(muAnalyser) {
        muAnalyser.getByteFrequencyData(muDataArray);
        const positions = muParticles.geometry.attributes.position.array;
        const initial = muParticles.geometry.attributes.initialPosition.array;
        
        let avgFreq = 0;
        for(let i=0; i<muDataArray.length; i++) avgFreq += muDataArray[i];
        avgFreq /= muDataArray.length;
        
        for(let i=0; i<positions.length/3; i++) {
          const freq = muDataArray[i % muDataArray.length];
          const scale = 1 + (freq / 255) * 1.5;
          positions[i*3] = initial[i*3] * scale;
          positions[i*3+1] = initial[i*3+1] * scale;
          positions[i*3+2] = initial[i*3+2] * scale;
        }
        muParticles.geometry.attributes.position.needsUpdate = true;
        
        muParticles.rotation.y += 0.002 + (avgFreq/255)*0.01;
        muParticles.rotation.x += 0.001;
      } else {
        muParticles.rotation.y += 0.002;
      }
      
      muRenderer.render(muScene, muCamera);
    };

    window.addEventListener('resize', () => {
      if(!muCamera || !muRenderer) return;
      muCamera.aspect = window.innerWidth / window.innerHeight;
      muCamera.updateProjectionMatrix();
      muRenderer.setSize(window.innerWidth, window.innerHeight);
    });

    window.muHandleFile = async (e) => {
      const file = e.target.files[0];
      if(!file) return;
      
      document.getElementById('mu-ui').style.display = 'none';
      await muInit3D();
      
      const audio = document.getElementById('mu-audio');
      audio.src = URL.createObjectURL(file);
      
      if(!muAudioCtx) {
        muAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
        muAnalyser = muAudioCtx.createAnalyser();
        muAnalyser.fftSize = 512;
        muDataArray = new Uint8Array(muAnalyser.frequencyBinCount);
        const source = muAudioCtx.createMediaElementSource(audio);
        source.connect(muAnalyser);
        muAnalyser.connect(muAudioCtx.destination);
      }
      
      audio.play();
    };
  }
} catch(e) { console.error('Music Universe Error:', e); }

// 5. Masaüstü Hologram (3D Model Viewer)
try {
  if (!document.getElementById('hologram-sec')) {
    const html = `
    <section id="hologram-sec" class="section ds-section" style="display:none;min-height:100vh;background:radial-gradient(circle, #2c3e50, #000);color:var(--tx);font-family:'Segoe UI',sans-serif;padding-top:60px;position:relative;overflow:hidden;">
      <button class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:100;cursor:pointer;background:rgba(255,255,255,0.1);border:1px solid #fff;color:#fff;padding:10px 15px;border-radius:8px;font-weight:bold;backdrop-filter:blur(5px);" onclick="if(typeof dsGoToSection==='function') dsGoToSection('hubPage','')">◀ Ana Sayfa</button>
      
      <div id="hg-ui" style="position:absolute;top:20px;right:20px;z-index:10;background:rgba(0,0,0,0.6);padding:20px;border-radius:15px;backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.2);text-align:center;">
        <h3 style="color:#3498db;margin-bottom:10px;text-shadow:0 0 10px #3498db;">🧊 3D Hologram</h3>
        <p style="color:#aaa;font-size:12px;margin-bottom:15px;">.glb veya .gltf sürükle-bırak</p>
        <input type="file" id="hg-file" accept=".glb,.gltf" style="display:none;" onchange="hgHandleFile(event)">
        <label for="hg-file" style="display:inline-block;background:#3498db;color:#fff;padding:8px 20px;border-radius:20px;cursor:pointer;font-weight:bold;font-size:14px;box-shadow:0 5px 15px rgba(52,152,219,0.5);">
          Model Yükle
        </label>
        <div id="hg-status" style="margin-top:10px;color:#f1c40f;font-size:12px;font-weight:bold;"></div>
      </div>
      
      <div id="hg-dropzone" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:5;text-align:center;pointer-events:none;">
        <div style="font-size:48px;color:rgba(255,255,255,0.2);font-weight:bold;">3D MODELİ BURAYA SÜRÜKLE</div>
      </div>
      
      <canvas id="hg-canvas" style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;"></canvas>
    </section>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    let hgScene, hgCamera, hgRenderer, hgControls, hgModel;
    let hgInitDone = false;

    window.hgInit3D = async () => {
      if(hgInitDone) return;
      document.getElementById('hg-status').textContent = 'Kütüphaneler yükleniyor...';
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');
      await loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js');
      await loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js');
      
      const canvas = document.getElementById('hg-canvas');
      hgRenderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      hgRenderer.setSize(window.innerWidth, window.innerHeight);
      hgRenderer.outputEncoding = THREE.sRGBEncoding;
      
      hgScene = new THREE.Scene();
      hgCamera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
      hgCamera.position.set(0, 2, 5);

      hgControls = new THREE.OrbitControls(hgCamera, hgRenderer.domElement);
      hgControls.enableDamping = true;

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      hgScene.add(ambientLight);
      const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
      dirLight.position.set(5, 10, 7.5);
      hgScene.add(dirLight);
      
      hgInitDone = true;
      document.getElementById('hg-status').textContent = '✅ Hazır.';
      hgAnimate();
    };

    window.hgAnimate = () => {
      requestAnimationFrame(hgAnimate);
      if(hgControls) hgControls.update();
      if(hgModel) hgModel.rotation.y += 0.005; // auto spin
      if(hgRenderer) hgRenderer.render(hgScene, hgCamera);
    };

    window.addEventListener('resize', () => {
      if(!hgCamera || !hgRenderer) return;
      hgCamera.aspect = window.innerWidth / window.innerHeight;
      hgCamera.updateProjectionMatrix();
      hgRenderer.setSize(window.innerWidth, window.innerHeight);
    });

    const loadGLTF = (url) => {
      document.getElementById('hg-status').textContent = 'Model Ayrıştırılıyor...';
      const loader = new THREE.GLTFLoader();
      loader.load(url, (gltf) => {
        if(hgModel) hgScene.remove(hgModel);
        hgModel = gltf.scene;
        
        // Center model
        const box = new THREE.Box3().setFromObject(hgModel);
        const center = box.getCenter(new THREE.Vector3());
        hgModel.position.sub(center);
        
        // Auto scale to fit
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        if(maxDim > 0) {
          hgModel.scale.setScalar(3 / maxDim);
        }
        
        hgScene.add(hgModel);
        document.getElementById('hg-dropzone').style.display = 'none';
        document.getElementById('hg-status').textContent = '✅ Yüklendi.';
      }, undefined, (err) => {
        document.getElementById('hg-status').textContent = '❌ Yükleme Hatası.';
      });
    };

    window.hgHandleFile = async (e) => {
      const file = e.target.files[0];
      if(!file) return;
      await hgInit3D();
      loadGLTF(URL.createObjectURL(file));
    };

    // Drag and Drop
    const hgSec = document.getElementById('hologram-sec');
    hgSec.ondragover = (e) => { e.preventDefault(); };
    hgSec.ondrop = async (e) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if(!file || (!file.name.endsWith('.glb') && !file.name.endsWith('.gltf'))) return;
      await hgInit3D();
      loadGLTF(URL.createObjectURL(file));
    };
  }
} catch(e) { console.error('Hologram Error:', e); }
