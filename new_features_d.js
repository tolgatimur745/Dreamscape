// Feature 1: Sanal Bitki (plant-sec)
try {
  if (!document.getElementById('plant-sec')) {
    const plantHTML = `
      <section id="plant-sec" class="section ds-section" style="display:none; min-height: 100vh; background: var(--bg); position: relative; font-family: sans-serif; color: var(--tx); overflow: hidden;">
        <button class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:100;cursor:pointer; background: var(--bg2); border: 1px solid var(--a1); color: var(--tx); padding: 10px 15px; border-radius: 8px; font-weight: bold; box-shadow: 0 0 10px var(--a1); transition: all 0.3s ease;" onclick="if(typeof dsGoToSection==='function') dsGoToSection('hubPage','')">◀ Ana Sayfa</button>
        
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; padding: 20px;">
          <div style="background: var(--card); border: 1px solid var(--a2); border-radius: 20px; padding: 40px; box-shadow: 0 0 30px rgba(0,255,0,0.1); backdrop-filter: blur(10px); text-align: center; width: 100%; max-width: 400px; position: relative; overflow: hidden;">
            <div style="position: absolute; top: -50px; left: -50px; width: 100px; height: 100px; background: var(--a1); filter: blur(50px); opacity: 0.3;"></div>
            <div style="position: absolute; bottom: -50px; right: -50px; width: 100px; height: 100px; background: var(--a2); filter: blur(50px); opacity: 0.3;"></div>
            
            <h2 style="margin: 0 0 20px 0; color: var(--a1); text-shadow: 0 0 10px var(--a1);">Sanal Bitki</h2>
            
            <div id="plant-display" style="font-size: 80px; margin-bottom: 20px; transition: transform 0.3s ease; text-shadow: 0 0 20px rgba(0,255,0,0.3); user-select: none;">🌱</div>
            
            <div style="margin-bottom: 15px; text-align: left;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 14px;">
                <span>Sağlık</span>
                <span id="plant-health-txt">100%</span>
              </div>
              <div style="width: 100%; height: 10px; background: var(--bg); border-radius: 5px; overflow: hidden; border: 1px solid var(--bg2);">
                <div id="plant-health-bar" style="height: 100%; width: 100%; background: linear-gradient(90deg, var(--danger), var(--a1)); transition: width 0.3s ease;"></div>
              </div>
            </div>
            
            <div style="margin-bottom: 25px; text-align: left;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 14px;">
                <span>Su Seviyesi</span>
                <span id="plant-water-txt">100%</span>
              </div>
              <div style="width: 100%; height: 10px; background: var(--bg); border-radius: 5px; overflow: hidden; border: 1px solid var(--bg2);">
                <div id="plant-water-bar" style="height: 100%; width: 100%; background: linear-gradient(90deg, var(--a3), var(--a2)); transition: width 0.3s ease;"></div>
              </div>
            </div>
            
            <button id="plant-water-btn" style="background: linear-gradient(45deg, var(--a2), var(--a3)); border: none; color: white; padding: 12px 30px; border-radius: 25px; font-size: 16px; font-weight: bold; cursor: pointer; box-shadow: 0 0 15px var(--a2); transition: transform 0.2s, box-shadow 0.2s;">💧 Sula</button>
            <p id="plant-status-msg" style="margin-top: 15px; font-size: 14px; color: var(--tx2); min-height: 20px;"></p>
          </div>
        </div>
      </section>
    `;
    document.body.insertAdjacentHTML('beforeend', plantHTML);

    const stages = ['🌱', '🌿', '🪴', '🌳'];
    let state = {
      health: 100,
      water: 100,
      stageIndex: 0,
      lastUpdate: Date.now()
    };

    const savedState = localStorage.getItem('ds_plant_state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        const now = Date.now();
        const elapsedHours = (now - parsed.lastUpdate) / (1000 * 60 * 60);
        
        state.water = Math.max(0, parsed.water - (elapsedHours * 10)); // Loses 10% water per hour
        if (state.water === 0) {
          state.health = Math.max(0, parsed.health - (elapsedHours * 5)); // Loses 5% health per hour if empty
        } else {
          state.health = parsed.health;
        }
        state.stageIndex = parsed.stageIndex || 0;
        state.lastUpdate = now;
      } catch(e) {}
    }

    const healthBar = document.getElementById('plant-health-bar');
    const healthTxt = document.getElementById('plant-health-txt');
    const waterBar = document.getElementById('plant-water-bar');
    const waterTxt = document.getElementById('plant-water-txt');
    const display = document.getElementById('plant-display');
    const waterBtn = document.getElementById('plant-water-btn');
    const statusMsg = document.getElementById('plant-status-msg');

    const updateUI = () => {
      healthBar.style.width = state.health + '%';
      healthTxt.innerText = Math.round(state.health) + '%';
      waterBar.style.width = state.water + '%';
      waterTxt.innerText = Math.round(state.water) + '%';
      
      if (state.health > 80 && state.stageIndex < 3 && state.water > 50) {
        if (Math.random() < 0.1) state.stageIndex++;
      }
      if (state.health < 20) {
        display.innerText = '🥀';
        display.style.filter = 'grayscale(100%)';
      } else {
        display.innerText = stages[Math.min(state.stageIndex, stages.length - 1)];
        display.style.filter = 'none';
      }

      if (state.health === 0) {
        statusMsg.innerText = 'Bitkin kurudu... 😢 Yeniden başlamak için sula.';
        waterBtn.innerText = '♻️ Yeniden Başla';
      } else {
        waterBtn.innerText = '💧 Sula';
        if (state.water < 30) {
          statusMsg.innerText = 'Bitkin susadı!';
        } else {
          statusMsg.innerText = 'Bitkin mutlu!';
        }
      }

      localStorage.setItem('ds_plant_state', JSON.stringify(state));
    };

    waterBtn.addEventListener('click', () => {
      if (state.health === 0) {
        state.health = 100;
        state.water = 100;
        state.stageIndex = 0;
        display.style.transform = 'scale(1.2)';
        setTimeout(() => display.style.transform = 'scale(1)', 200);
      } else {
        state.water = Math.min(100, state.water + 20);
        state.health = Math.min(100, state.health + 5);
        display.style.transform = 'scale(1.1) rotate(5deg)';
        setTimeout(() => display.style.transform = 'scale(1) rotate(0)', 200);
      }
      state.lastUpdate = Date.now();
      updateUI();
    });

    setInterval(() => {
      if (state.health > 0) {
        state.water = Math.max(0, state.water - 0.5);
        if (state.water === 0) {
          state.health = Math.max(0, state.health - 1);
        }
        state.lastUpdate = Date.now();
        updateUI();
      }
    }, 10000);

    updateUI();
  }
} catch(e) { console.error(e); }

// Feature 2: Dalga Fiziği (wave-sec)
try {
  if (!document.getElementById('wave-sec')) {
    const waveHTML = `
      <section id="wave-sec" class="section ds-section" style="display:none; min-height: 100vh; background: #000; position: relative; font-family: sans-serif; overflow: hidden;">
        <button class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:100;cursor:pointer; background: rgba(0,0,0,0.5); border: 1px solid var(--a3); color: #fff; padding: 10px 15px; border-radius: 8px; font-weight: bold; box-shadow: 0 0 10px var(--a3); backdrop-filter: blur(5px);" onclick="if(typeof dsGoToSection==='function') dsGoToSection('hubPage','')">◀ Ana Sayfa</button>
        <div style="position: absolute; top: 20px; width: 100%; text-align: center; pointer-events: none; z-index: 10;">
          <h2 style="color: var(--a3); text-shadow: 0 0 15px var(--a3); margin: 0; font-size: 28px;">Dalga Fiziği</h2>
          <p style="color: #aaa; margin-top: 5px; font-size: 14px;">Suya dokunmak için tıkla / sürükle</p>
        </div>
        <canvas id="wave-canvas" style="display: block; width: 100vw; height: 100vh;"></canvas>
      </section>
    `;
    document.body.insertAdjacentHTML('beforeend', waveHTML);

    const canvas = document.getElementById('wave-canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    let width, height;
    let dampening = 0.99;
    let buffer1 = [];
    let buffer2 = [];
    
    const simScale = 4;
    let simWidth, simHeight;
    let imgData;

    const initWave = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      
      simWidth = Math.floor(width / simScale);
      simHeight = Math.floor(height / simScale);
      
      const size = simWidth * simHeight;
      buffer1 = new Float32Array(size);
      buffer2 = new Float32Array(size);
      
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);
      imgData = ctx.createImageData(simWidth, simHeight);
    };

    window.addEventListener('resize', () => {
      if (document.getElementById('wave-sec').style.display !== 'none') {
        initWave();
      }
    });

    initWave();

    const addDrop = (x, y, radius, strength) => {
      const sx = Math.floor(x / simScale);
      const sy = Math.floor(y / simScale);
      
      for (let i = -radius; i <= radius; i++) {
        for (let j = -radius; j <= radius; j++) {
          if (i*i + j*j <= radius*radius) {
            const px = sx + i;
            const py = sy + j;
            if (px > 0 && px < simWidth - 1 && py > 0 && py < simHeight - 1) {
              buffer1[py * simWidth + px] = strength;
            }
          }
        }
      }
    };

    let isDrawing = false;
    canvas.addEventListener('mousedown', (e) => { isDrawing = true; addDrop(e.clientX, e.clientY, 3, 500); });
    canvas.addEventListener('mousemove', (e) => { if (isDrawing) addDrop(e.clientX, e.clientY, 2, 200); });
    canvas.addEventListener('mouseup', () => { isDrawing = false; });
    canvas.addEventListener('mouseleave', () => { isDrawing = false; });
    
    canvas.addEventListener('touchstart', (e) => {
      isDrawing = true;
      const touch = e.touches[0];
      addDrop(touch.clientX, touch.clientY, 3, 500);
    });
    canvas.addEventListener('touchmove', (e) => {
      if (isDrawing) {
        const touch = e.touches[0];
        addDrop(touch.clientX, touch.clientY, 2, 200);
      }
    });
    canvas.addEventListener('touchend', () => { isDrawing = false; });

    const processWaves = () => {
      for (let y = 1; y < simHeight - 1; y++) {
        for (let x = 1; x < simWidth - 1; x++) {
          const i = y * simWidth + x;
          buffer2[i] = (
            buffer1[i - 1] + 
            buffer1[i + 1] + 
            buffer1[i - simWidth] + 
            buffer1[i + simWidth]
          ) / 2 - buffer2[i];
          
          buffer2[i] *= dampening;
          
          let val = buffer2[i];
          
          const px = i * 4;
          const colorVal = Math.min(255, Math.max(0, 128 + val * 2));
          imgData.data[px] = Math.max(0, colorVal - 128);       
          imgData.data[px + 1] = Math.max(0, colorVal - 64);   
          imgData.data[px + 2] = colorVal;                     
          imgData.data[px + 3] = 255;                          
        }
      }
      
      const temp = buffer1;
      buffer1 = buffer2;
      buffer2 = temp;
    };

    const offCanvas = document.createElement('canvas');
    const offCtx = offCanvas.getContext('2d');

    const animateWave = () => {
      if (document.getElementById('wave-sec').style.display !== 'none') {
        processWaves();
        
        offCanvas.width = simWidth;
        offCanvas.height = simHeight;
        offCtx.putImageData(imgData, 0, 0);
        
        ctx.save();
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(offCanvas, 0, 0, width, height);
        ctx.restore();
        
        if (Math.random() < 0.05) {
          addDrop(Math.random() * width, Math.random() * height, 2, 100 + Math.random()*200);
        }
      }
      requestAnimationFrame(animateWave);
    };
    
    animateWave();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'style') {
          const isVisible = document.getElementById('wave-sec').style.display !== 'none';
          if (isVisible) {
            initWave();
          }
        }
      });
    });
    observer.observe(document.getElementById('wave-sec'), { attributes: true });

  }
} catch(e) { console.error(e); }

// Feature 3: Yapay Sinir Ağı (nn-sec)
try {
  if (!document.getElementById('nn-sec')) {
    const nnHTML = `
      <section id="nn-sec" class="section ds-section" style="display:none; min-height: 100vh; background: radial-gradient(circle at center, #1a1a2e 0%, #0f0f1a 100%); position: relative; font-family: sans-serif; overflow: hidden; color: #fff;">
        <button class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:100;cursor:pointer; background: rgba(255,255,255,0.1); border: 1px solid var(--a2); color: #fff; padding: 10px 15px; border-radius: 8px; font-weight: bold; box-shadow: 0 0 10px var(--a2); backdrop-filter: blur(5px);" onclick="if(typeof dsGoToSection==='function') dsGoToSection('hubPage','')">◀ Ana Sayfa</button>
        
        <div style="position: absolute; top: 20px; width: 100%; text-align: center; z-index: 10;">
          <h2 style="color: var(--a2); text-shadow: 0 0 15px var(--a2); margin: 0; font-size: 28px;">Yapay Sinir Ağı</h2>
          <p style="color: #aaa; margin-top: 5px; font-size: 14px;">Eğitim sürecini görselleştirin</p>
          <button id="nn-train-btn" style="margin-top: 15px; background: linear-gradient(45deg, var(--a1), var(--a2)); border: none; color: white; padding: 10px 25px; border-radius: 20px; font-size: 16px; font-weight: bold; cursor: pointer; box-shadow: 0 0 15px var(--a2); transition: transform 0.2s;">⚡ Eğit (1 Epoch)</button>
        </div>
        
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh; width: 100vw; position: relative;">
          <canvas id="nn-canvas" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;"></canvas>
          
          <div style="display: flex; justify-content: space-between; align-items: center; width: 80%; max-width: 800px; z-index: 5;">
            <!-- Input Layer -->
            <div id="nn-layer-0" style="display: flex; flex-direction: column; gap: 60px;">
              <div class="nn-node" id="n-0-0" style="width: 50px; height: 50px; border-radius: 50%; background: #222; border: 3px solid var(--a1); box-shadow: 0 0 15px var(--a1); display: flex; justify-content: center; align-items: center; font-weight: bold; font-size: 12px; position: relative; z-index: 2; transition: all 0.3s;">I1</div>
              <div class="nn-node" id="n-0-1" style="width: 50px; height: 50px; border-radius: 50%; background: #222; border: 3px solid var(--a1); box-shadow: 0 0 15px var(--a1); display: flex; justify-content: center; align-items: center; font-weight: bold; font-size: 12px; position: relative; z-index: 2; transition: all 0.3s;">I2</div>
            </div>
            
            <!-- Hidden Layer -->
            <div id="nn-layer-1" style="display: flex; flex-direction: column; gap: 40px;">
              <div class="nn-node" id="n-1-0" style="width: 50px; height: 50px; border-radius: 50%; background: #222; border: 3px solid var(--a3); box-shadow: 0 0 15px var(--a3); display: flex; justify-content: center; align-items: center; font-weight: bold; font-size: 12px; position: relative; z-index: 2; transition: all 0.3s;">H1</div>
              <div class="nn-node" id="n-1-1" style="width: 50px; height: 50px; border-radius: 50%; background: #222; border: 3px solid var(--a3); box-shadow: 0 0 15px var(--a3); display: flex; justify-content: center; align-items: center; font-weight: bold; font-size: 12px; position: relative; z-index: 2; transition: all 0.3s;">H2</div>
              <div class="nn-node" id="n-1-2" style="width: 50px; height: 50px; border-radius: 50%; background: #222; border: 3px solid var(--a3); box-shadow: 0 0 15px var(--a3); display: flex; justify-content: center; align-items: center; font-weight: bold; font-size: 12px; position: relative; z-index: 2; transition: all 0.3s;">H3</div>
            </div>
            
            <!-- Output Layer -->
            <div id="nn-layer-2" style="display: flex; flex-direction: column;">
              <div class="nn-node" id="n-2-0" style="width: 60px; height: 60px; border-radius: 50%; background: #222; border: 3px solid var(--a2); box-shadow: 0 0 20px var(--a2); display: flex; justify-content: center; align-items: center; font-weight: bold; font-size: 14px; position: relative; z-index: 2; transition: all 0.3s;">Out</div>
            </div>
          </div>
        </div>
      </section>
    `;
    document.body.insertAdjacentHTML('beforeend', nnHTML);

    const canvas = document.getElementById('nn-canvas');
    const ctx = canvas.getContext('2d');
    const nodes = [
      [document.getElementById('n-0-0'), document.getElementById('n-0-1')],
      [document.getElementById('n-1-0'), document.getElementById('n-1-1'), document.getElementById('n-1-2')],
      [document.getElementById('n-2-0')]
    ];
    
    const weights = [
      [[Math.random(), Math.random(), Math.random()], [Math.random(), Math.random(), Math.random()]], 
      [[Math.random()], [Math.random()], [Math.random()]] 
    ];

    let pulseData = []; 

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawLines();
    };
    window.addEventListener('resize', resize);

    const getCenter = (el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.left + rect.width/2, y: rect.top + rect.height/2 };
    };

    const drawLines = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let l = 0; l < nodes.length - 1; l++) {
        for (let i = 0; i < nodes[l].length; i++) {
          for (let j = 0; j < nodes[l+1].length; j++) {
            const p1 = getCenter(nodes[l][i]);
            const p2 = getCenter(nodes[l+1][j]);
            const w = weights[l][i][j];
            
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            const alpha = 0.2 + w * 0.5;
            const lw = 1 + w * 4;
            ctx.strokeStyle = `rgba(200, 200, 255, ${alpha})`;
            ctx.lineWidth = lw;
            ctx.stroke();
          }
        }
      }

      for (let i = pulseData.length - 1; i >= 0; i--) {
        const p = pulseData[i];
        p.progress += 0.02; 
        
        if (p.progress >= 1) {
          pulseData.splice(i, 1);
          continue;
        }

        const cx = p.x + (p.tx - p.x) * p.progress;
        const cy = p.y + (p.ty - p.y) * p.progress;

        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0; 
      }
    };

    const animateNN = () => {
      if (document.getElementById('nn-sec').style.display !== 'none') {
        drawLines();
      }
      requestAnimationFrame(animateNN);
    };

    setTimeout(() => {
      resize();
      animateNN();
    }, 100);

    const observerNN = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'style') {
          if (document.getElementById('nn-sec').style.display !== 'none') {
             resize();
          }
        }
      });
    });
    observerNN.observe(document.getElementById('nn-sec'), { attributes: true });

    const trainBtn = document.getElementById('nn-train-btn');
    let isTraining = false;

    const firePulses = (fromLayer, toLayer, color, type) => {
      for (let i = 0; i < nodes[fromLayer].length; i++) {
        for (let j = 0; j < nodes[toLayer].length; j++) {
          const p1 = getCenter(nodes[fromLayer][i]);
          const p2 = getCenter(nodes[toLayer][j]);
          
          if (type === 'backward') {
            pulseData.push({
              x: p2.x, y: p2.y,
              tx: p1.x, ty: p1.y,
              progress: 0,
              color: color,
              type: type
            });
          } else {
            pulseData.push({
              x: p1.x, y: p1.y,
              tx: p2.x, ty: p2.y,
              progress: 0,
              color: color,
              type: type
            });
          }
        }
      }
    };

    const activateNodes = (layer, color) => {
      nodes[layer].forEach(n => {
        n.style.boxShadow = `0 0 30px ${color}, inset 0 0 15px ${color}`;
        n.style.transform = 'scale(1.2)';
        setTimeout(() => {
          n.style.boxShadow = `0 0 15px ${color}`;
          n.style.transform = 'scale(1)';
        }, 300);
      });
    };

    const randomizeWeights = () => {
      for (let l = 0; l < weights.length; l++) {
        for (let i = 0; i < weights[l].length; i++) {
          for (let j = 0; j < weights[l][i].length; j++) {
            weights[l][i][j] = Math.max(0, Math.min(1, weights[l][i][j] + (Math.random() - 0.5) * 0.2));
          }
        }
      }
    };

    trainBtn.addEventListener('click', () => {
      if (isTraining) return;
      isTraining = true;
      trainBtn.style.transform = 'scale(0.95)';
      
      // Forward Pass
      activateNodes(0, 'var(--a1)');
      firePulses(0, 1, '#00ffff', 'forward');
      
      setTimeout(() => {
        activateNodes(1, 'var(--a3)');
        firePulses(1, 2, '#ff00ff', 'forward');
      }, 800);

      setTimeout(() => {
        activateNodes(2, 'var(--a2)');
        
        // Backward Pass
        setTimeout(() => {
          activateNodes(2, 'var(--danger)');
          firePulses(1, 2, '#ff3333', 'backward'); 
        }, 500);

        setTimeout(() => {
          activateNodes(1, 'var(--danger)');
          firePulses(0, 1, '#ff3333', 'backward');
        }, 1300);

        setTimeout(() => {
          activateNodes(0, 'var(--danger)');
          randomizeWeights(); 
          trainBtn.style.transform = 'scale(1)';
          isTraining = false;
        }, 2100);
        
      }, 1600);
    });

  }
} catch(e) { console.error(e); }
