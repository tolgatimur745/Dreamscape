// new_features_c.js

// 1. Nonogram
try {
  if (!document.getElementById('nonogram-sec')) {
    const nonogramHtml = `
    <section id="nonogram-sec" class="section ds-section" style="display:none; min-height:100vh; background: var(--bg); color: var(--tx); padding: 60px 20px; font-family: sans-serif; position: relative;">
      <button class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:100;cursor:pointer; background: var(--card); color: var(--tx); border: 1px solid var(--a1); padding: 8px 16px; border-radius: 8px; box-shadow: 0 0 10px var(--a1);" onclick="if(typeof dsGoToSection==='function') dsGoToSection('hubPage','')">◀ Ana Sayfa</button>
      
      <div style="max-width: 600px; margin: 0 auto; background: var(--bg2); padding: 30px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        <h2 style="text-align:center; color: var(--a1); text-shadow: 0 0 10px var(--a1); font-size: 2rem; margin-bottom: 20px;">Nonogram</h2>
        <p style="text-align:center; color: var(--tx2); margin-bottom: 20px;">Sol tık ile doldur, sağ veya shift+sol tık ile çarpı koy.</p>
        
        <div id="nonogram-container" style="display: flex; justify-content: center; align-items: flex-start; overflow-x: auto; padding-bottom: 20px;">
          <div style="display: flex; flex-direction: column;">
            <div style="display: flex;">
               <div style="width: 100px; height: 100px;"></div>
               <div id="nonogram-col-hints" style="display: flex; gap: 4px;"></div>
            </div>
            <div style="display: flex; margin-top: 4px;">
               <div id="nonogram-row-hints" style="display: flex; flex-direction: column; gap: 4px; justify-content: space-around; width: 100px;"></div>
               <div id="nonogram-grid" style="display: grid; grid-template-columns: repeat(5, 50px); grid-template-rows: repeat(5, 50px); gap: 4px;"></div>
            </div>
          </div>
        </div>
        <div id="nonogram-message" style="text-align: center; margin-top: 20px; font-size: 1.5rem; font-weight: bold; color: var(--a2); text-shadow: 0 0 10px var(--a2); min-height: 30px;"></div>
        <div style="text-align:center; margin-top: 20px;">
           <button id="nonogram-reset-btn" style="background: var(--card); color: var(--tx); border: 1px solid var(--danger); padding: 10px 20px; border-radius: 8px; cursor: pointer; transition: all 0.3s; box-shadow: 0 0 10px var(--danger);">Sıfırla</button>
        </div>
      </div>
    </section>
    `;
    document.body.insertAdjacentHTML('beforeend', nonogramHtml);

    const puzzle = [
      [0, 1, 0, 1, 0],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0]
    ];
    
    const rowHints = [[1, 1], [5], [5], [3], [1]];
    const colHints = [[2], [4], [4], [4], [2]]; 

    let gridState = Array(5).fill(null).map(() => Array(5).fill(0)); 
    
    const renderHints = () => {
      const rowContainer = document.getElementById('nonogram-row-hints');
      const colContainer = document.getElementById('nonogram-col-hints');
      rowContainer.innerHTML = '';
      colContainer.innerHTML = '';
      
      rowHints.forEach(hint => {
        rowContainer.innerHTML += `<div style="height: 50px; display: flex; align-items: center; justify-content: flex-end; padding-right: 10px; color: var(--a3); font-weight: bold; letter-spacing: 2px; font-size: 1.1rem;">${hint.join(' ')}</div>`;
      });
      
      colHints.forEach(hint => {
        colContainer.innerHTML += `<div style="width: 50px; height: 100px; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; padding-bottom: 10px; color: var(--a3); font-weight: bold; font-size: 1.1rem;">${hint.join('<br>')}</div>`;
      });
    };

    const renderGrid = () => {
      const grid = document.getElementById('nonogram-grid');
      grid.innerHTML = '';
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          const cell = document.createElement('div');
          cell.style.width = '50px';
          cell.style.height = '50px';
          cell.style.background = 'rgba(255,255,255,0.05)';
          cell.style.border = '1px solid rgba(255,255,255,0.2)';
          cell.style.borderRadius = '4px';
          cell.style.cursor = 'pointer';
          cell.style.display = 'flex';
          cell.style.alignItems = 'center';
          cell.style.justifyContent = 'center';
          cell.style.fontSize = '24px';
          cell.style.transition = 'all 0.2s';
          
          if (gridState[r][c] === 1) {
            cell.style.background = 'var(--a1)'; 
            cell.style.boxShadow = '0 0 10px var(--a1)';
          } else if (gridState[r][c] === 2) {
            cell.innerHTML = '<span style="color:var(--danger)">X</span>';
          }

          cell.addEventListener('mousedown', (e) => {
            e.preventDefault();
            if (e.button === 2 || e.shiftKey) {
              gridState[r][c] = gridState[r][c] === 2 ? 0 : 2;
            } else if (e.button === 0) {
              gridState[r][c] = gridState[r][c] === 1 ? 0 : 1;
            }
            renderGrid();
            checkWin();
          });
          
          cell.addEventListener('contextmenu', e => e.preventDefault());
          
          grid.appendChild(cell);
        }
      }
    };

    const checkWin = () => {
      let win = true;
      for(let r = 0; r < 5; r++) {
        for(let c = 0; c < 5; c++) {
          if (puzzle[r][c] === 1 && gridState[r][c] !== 1) win = false;
          if (puzzle[r][c] === 0 && gridState[r][c] === 1) win = false;
        }
      }
      if (win) {
        document.getElementById('nonogram-message').innerText = 'Tebrikler! Bulmacayı çözdünüz!';
      } else {
        document.getElementById('nonogram-message').innerText = '';
      }
    };

    document.getElementById('nonogram-reset-btn').addEventListener('click', () => {
      gridState = Array(5).fill(null).map(() => Array(5).fill(0));
      renderGrid();
      checkWin();
    });

    renderHints();
    renderGrid();
  }
} catch(e) { console.error('Nonogram Error:', e); }


// 2. Bağlantı / Connections
try {
  if (!document.getElementById('connections-sec')) {
    const connHtml = `
    <section id="connections-sec" class="section ds-section" style="display:none; min-height:100vh; background: var(--bg); color: var(--tx); padding: 60px 20px; font-family: sans-serif; position: relative;">
      <button class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:100;cursor:pointer; background: var(--card); color: var(--tx); border: 1px solid var(--a2); padding: 8px 16px; border-radius: 8px; box-shadow: 0 0 10px var(--a2);" onclick="if(typeof dsGoToSection==='function') dsGoToSection('hubPage','')">◀ Ana Sayfa</button>
      
      <div style="max-width: 600px; margin: 0 auto; background: rgba(20,20,30,0.8); backdrop-filter: blur(10px); padding: 30px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 40px rgba(0,0,0,0.6);">
        <h2 style="text-align:center; color: var(--a2); text-shadow: 0 0 10px var(--a2); font-size: 2rem; margin-bottom: 10px;">Bağlantılar</h2>
        <p style="text-align:center; color: var(--tx2); margin-bottom: 20px;">Dörtlü grupları bul (Aynı kategoriye ait 4 kelime seç)</p>
        
        <div id="conn-solved-container" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px;"></div>
        <div id="conn-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;"></div>
        
        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 20px;">
          <button id="conn-shuffle" style="background: var(--card); color: var(--tx); border: 1px solid var(--a3); padding: 10px 20px; border-radius: 20px; cursor: pointer; transition: 0.3s; box-shadow: 0 0 10px rgba(0,0,0,0.3);">Karıştır</button>
          <button id="conn-deselect" style="background: var(--card); color: var(--tx); border: 1px solid var(--tx2); padding: 10px 20px; border-radius: 20px; cursor: pointer; transition: 0.3s; box-shadow: 0 0 10px rgba(0,0,0,0.3);">Seçimi Temizle</button>
          <button id="conn-submit" style="background: var(--card); color: var(--tx); border: 1px solid var(--a2); padding: 10px 20px; border-radius: 20px; cursor: pointer; transition: 0.3s; box-shadow: 0 0 10px var(--a2);">Gönder</button>
        </div>
        
        <div id="conn-message" style="text-align: center; margin-top: 20px; font-size: 1.2rem; min-height: 25px; color: var(--danger); font-weight: bold;"></div>
      </div>
      <style>
        .conn-tile {
          background: rgba(255,255,255,0.05);
          border: 2px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1rem;
          cursor: pointer;
          user-select: none;
          transition: all 0.2s;
          text-align: center;
          padding: 5px;
          word-break: break-word;
        }
        .conn-tile:hover {
          background: rgba(255,255,255,0.1);
        }
        .conn-tile.selected {
          background: rgba(255,255,255,0.25);
          border-color: var(--a2);
          box-shadow: 0 0 15px var(--a2);
          transform: scale(0.95);
        }
        .conn-solved {
          border-radius: 8px;
          min-height: 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: #000;
          animation: popIn 0.5s ease-out forwards;
          padding: 10px;
          text-align: center;
        }
        @keyframes popIn {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      </style>
    </section>
    `;
    document.body.insertAdjacentHTML('beforeend', connHtml);

    const categories = [
      { id: 1, name: "RENKLER", words: ["Sarı", "Kırmızı", "Mavi", "Yeşil"], color: "#f1c40f" },
      { id: 2, name: "HAYVANLAR", words: ["Kedi", "Köpek", "Kuş", "Balık"], color: "#2ecc71" },
      { id: 3, name: "PROGRAMLAMA", words: ["Değişken", "Fonksiyon", "Döngü", "Dizi"], color: "#9b59b6" },
      { id: 4, name: "MEVSİMLER", words: ["İlkbahar", "Yaz", "Sonbahar", "Kış"], color: "#3498db" }
    ];

    let tiles = [];
    categories.forEach(cat => {
      cat.words.forEach(word => {
        tiles.push({ word, catId: cat.id });
      });
    });

    let solvedCategories = [];
    let selectedTiles = [];

    const shuffleArray = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    };

    shuffleArray(tiles);

    const renderConn = () => {
      const grid = document.getElementById('conn-grid');
      const solvedContainer = document.getElementById('conn-solved-container');
      
      grid.innerHTML = '';
      solvedContainer.innerHTML = '';

      solvedCategories.forEach(catId => {
        const cat = categories.find(c => c.id === catId);
        solvedContainer.innerHTML += `
          <div class="conn-solved" style="background-color: ${cat.color};">
            <div style="font-size:1.1rem; text-transform:uppercase; margin-bottom: 5px; text-shadow: 0 1px 2px rgba(255,255,255,0.5);">${cat.name}</div>
            <div style="font-size:0.95rem; font-weight:normal;">${cat.words.join(', ')}</div>
          </div>
        `;
      });

      const remainingTiles = tiles.filter(t => !solvedCategories.includes(t.catId));
      remainingTiles.forEach(t => {
        const tileEl = document.createElement('div');
        tileEl.className = 'conn-tile';
        if (selectedTiles.find(st => st.word === t.word)) {
          tileEl.classList.add('selected');
        }
        tileEl.innerText = t.word;
        tileEl.onclick = () => toggleSelect(t);
        grid.appendChild(tileEl);
      });
    };

    const toggleSelect = (tile) => {
      const idx = selectedTiles.findIndex(t => t.word === tile.word);
      if (idx >= 0) {
        selectedTiles.splice(idx, 1);
      } else {
        if (selectedTiles.length < 4) {
          selectedTiles.push(tile);
        }
      }
      document.getElementById('conn-message').innerText = '';
      renderConn();
    };

    document.getElementById('conn-shuffle').onclick = () => {
      shuffleArray(tiles);
      renderConn();
    };

    document.getElementById('conn-deselect').onclick = () => {
      selectedTiles = [];
      renderConn();
    };

    document.getElementById('conn-submit').onclick = () => {
      if (selectedTiles.length !== 4) {
        document.getElementById('conn-message').style.color = "var(--danger)";
        document.getElementById('conn-message').innerText = "4 kelime seçmelisin!";
        return;
      }
      const catId = selectedTiles[0].catId;
      const allMatch = selectedTiles.every(t => t.catId === catId);
      
      if (allMatch) {
        solvedCategories.push(catId);
        selectedTiles = [];
        document.getElementById('conn-message').style.color = "var(--a1)";
        document.getElementById('conn-message').innerText = "Harika!";
        setTimeout(() => { document.getElementById('conn-message').innerText = ''; }, 2000);
        renderConn();
        if (solvedCategories.length === 4) {
          document.getElementById('conn-message').style.color = "var(--a1)";
          document.getElementById('conn-message').innerText = "Tebrikler, hepsini buldunuz!";
        }
      } else {
        document.getElementById('conn-message').style.color = "var(--danger)";
        document.getElementById('conn-message').innerText = "Yanlış eşleşme!";
        let counts = {};
        selectedTiles.forEach(t => counts[t.catId] = (counts[t.catId] || 0) + 1);
        if (Object.values(counts).includes(3)) {
          document.getElementById('conn-message').innerText = "Bir tanesi farklı!";
        }
      }
    };

    renderConn();
  }
} catch(e) { console.error('Connections Error:', e); }


// 3. Şans Çarkı
try {
  if (!document.getElementById('wheel-sec')) {
    const wheelHtml = `
    <section id="wheel-sec" class="section ds-section" style="display:none; min-height:100vh; background: var(--bg); color: var(--tx); padding: 60px 20px; font-family: sans-serif; position: relative;">
      <button class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:100;cursor:pointer; background: var(--card); color: var(--tx); border: 1px solid var(--a3); padding: 8px 16px; border-radius: 8px; box-shadow: 0 0 10px var(--a3);" onclick="if(typeof dsGoToSection==='function') dsGoToSection('hubPage','')">◀ Ana Sayfa</button>
      
      <div style="max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 40px; align-items: center; justify-content: center; background: rgba(0,0,0,0.5); padding: 40px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 50px rgba(0,0,0,0.8);">
        
        <div style="display: flex; flex-wrap: wrap; gap: 40px; justify-content: center; width: 100%;">
          <div style="position: relative; width: 300px; height: 300px; flex-shrink: 0;">
            <canvas id="wheel-canvas" width="300" height="300" style="border-radius: 50%; box-shadow: 0 0 30px var(--a3); transform: rotate(-90deg);"></canvas>
            <div style="position: absolute; top: 50%; right: -15px; transform: translateY(-50%); width: 0; height: 0; border-top: 15px solid transparent; border-bottom: 15px solid transparent; border-right: 25px solid var(--tx); filter: drop-shadow(0 0 5px rgba(0,0,0,0.8)); z-index: 10;"></div>
          </div>
          
          <div style="flex: 1; min-width: 250px; max-width: 350px; display: flex; flex-direction: column; gap: 15px;">
            <h2 style="color: var(--a3); text-shadow: 0 0 10px var(--a3); margin: 0; text-align: center; font-size: 2rem;">Şans Çarkı</h2>
            <textarea id="wheel-items" rows="6" style="width: 100%; background: var(--bg2); color: var(--tx); border: 1px solid var(--tx2); border-radius: 8px; padding: 10px; resize: none; font-family: inherit; box-sizing: border-box;">Pizza\nBurger\nSalata\nKebap\nMakarna\nSushi</textarea>
            <button id="wheel-update-btn" style="background: var(--card); color: var(--tx); border: 1px solid var(--tx2); padding: 10px; border-radius: 8px; cursor: pointer; transition: 0.2s;">Çarkı Güncelle</button>
            <button id="wheel-spin-btn" style="background: var(--a3); color: #000; border: none; padding: 15px; border-radius: 8px; font-weight: bold; font-size: 1.2rem; cursor: pointer; box-shadow: 0 0 20px var(--a3); transition: 0.2s;">ÇEVİR</button>
          </div>
        </div>
        
        <div id="wheel-result" style="text-align: center; font-size: 2rem; font-weight: bold; color: var(--a1); text-shadow: 0 0 15px var(--a1); min-height: 50px; display: flex; align-items: center; justify-content: center; width: 100%;"></div>

      </div>
    </section>
    `;
    document.body.insertAdjacentHTML('beforeend', wheelHtml);

    const canvas = document.getElementById('wheel-canvas');
    const ctx = canvas.getContext('2d');
    let items = [];
    let colors = ['#f1c40f', '#e67e22', '#e74c3c', '#9b59b6', '#3498db', '#1abc9c', '#e84393', '#00cec9'];
    let currentAngle = 0; 
    let isSpinning = false;
    let spinVelocity = 0;
    let reqAnimFrame;

    const parseItems = () => {
      const text = document.getElementById('wheel-items').value;
      items = text.split('\n').map(x => x.trim()).filter(x => x !== '');
      if (items.length === 0) items = ['Boş'];
      drawWheel(currentAngle);
    };

    const drawWheel = (angleOffset) => {
      const cw = canvas.width;
      const ch = canvas.height;
      const cx = cw / 2;
      const cy = ch / 2;
      const radius = cx;

      ctx.clearRect(0, 0, cw, ch);
      
      const sliceAngle = (Math.PI * 2) / items.length;

      for (let i = 0; i < items.length; i++) {
        const startAngle = angleOffset + i * sliceAngle;
        const endAngle = startAngle + sliceAngle;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, startAngle, endAngle);
        ctx.closePath();

        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(0,0,0,0.3)";
        ctx.stroke();

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px sans-serif';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText(items[i], radius - 20, 5);
        ctx.restore();
      }
      
      // Center circle
      ctx.beginPath();
      ctx.arc(cx, cy, 15, 0, Math.PI * 2);
      ctx.fillStyle = "var(--bg)";
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "var(--tx)";
      ctx.stroke();
    };

    const spin = () => {
      if (isSpinning) return;
      isSpinning = true;
      document.getElementById('wheel-result').innerText = '';
      
      spinVelocity = 0.3 + Math.random() * 0.2;
      const decay = 0.985 + Math.random() * 0.005;

      const animate = () => {
        currentAngle += spinVelocity;
        spinVelocity *= decay; 
        
        drawWheel(currentAngle);

        if (spinVelocity < 0.001) {
          isSpinning = false;
          
          let normalisedAngle = currentAngle % (Math.PI * 2);
          if (normalisedAngle < 0) normalisedAngle += Math.PI * 2;
          
          const sliceAngle = (Math.PI * 2) / items.length;
          
          let pointedAngle = (Math.PI / 2) - normalisedAngle;
          while (pointedAngle < 0) pointedAngle += Math.PI * 2;
          pointedAngle = pointedAngle % (Math.PI * 2);
          
          const winningIndex = Math.floor(pointedAngle / sliceAngle) % items.length;
          
          document.getElementById('wheel-result').innerText = items[winningIndex] + "!";
          cancelAnimationFrame(reqAnimFrame);
          return;
        }

        reqAnimFrame = requestAnimationFrame(animate);
      };
      
      animate();
    };

    document.getElementById('wheel-update-btn').onclick = parseItems;
    document.getElementById('wheel-spin-btn').onclick = spin;

    parseItems();
  }
} catch(e) { console.error('Wheel Error:', e); }


// 4. Nefes Egzersizi
try {
  if (!document.getElementById('breathing-sec')) {
    const breathHtml = `
    <section id="breathing-sec" class="section ds-section" style="display:none; min-height:100vh; background: var(--bg); color: var(--tx); padding: 60px 20px; font-family: sans-serif; position: relative; overflow: hidden;">
      <button class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:100;cursor:pointer; background: var(--card); color: var(--tx); border: 1px solid var(--a1); padding: 8px 16px; border-radius: 8px; box-shadow: 0 0 10px var(--a1);" onclick="if(typeof dsGoToSection==='function') dsGoToSection('hubPage','')">◀ Ana Sayfa</button>
      
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 70vh; margin-top: 40px;">
        <h2 style="color: var(--tx); font-size: 2.5rem; margin-bottom: 10px; z-index: 10; text-align: center;">4-7-8 Nefes Egzersizi</h2>
        <p style="color: var(--tx2); margin-bottom: 60px; z-index: 10; text-align: center; font-size: 1.2rem;">Rahatlayın ve talimatları izleyin.</p>
        
        <div style="position: relative; width: 300px; height: 300px; display: flex; align-items: center; justify-content: center;">
          <div id="breath-circle" style="position: absolute; width: 100px; height: 100px; background: radial-gradient(circle, var(--a2) 0%, transparent 70%); border-radius: 50%; opacity: 0.7; filter: blur(8px); transition: all linear; z-index: 1;"></div>
          <div id="breath-text" style="z-index: 10; font-size: 2.5rem; font-weight: bold; text-shadow: 0 0 15px rgba(0,0,0,1); color: white; text-align: center;">Başla</div>
        </div>
        
        <button id="breath-start-btn" style="margin-top: 70px; background: rgba(255,255,255,0.05); border: 2px solid var(--tx); color: var(--tx); padding: 15px 40px; border-radius: 30px; font-size: 1.2rem; font-weight: bold; cursor: pointer; backdrop-filter: blur(5px); z-index: 10; transition: 0.3s; box-shadow: 0 0 15px rgba(255,255,255,0.1);">Egzersizi Başlat</button>
      </div>
    </section>
    `;
    document.body.insertAdjacentHTML('beforeend', breathHtml);

    let breathInterval;
    let breathTimeout1, breathTimeout2;
    let isBreathing = false;

    const circle = document.getElementById('breath-circle');
    const text = document.getElementById('breath-text');
    const btn = document.getElementById('breath-start-btn');

    const resetBreathing = () => {
      clearInterval(breathInterval);
      clearTimeout(breathTimeout1);
      clearTimeout(breathTimeout2);
      circle.style.transition = 'all 0.5s ease-out';
      circle.style.transform = 'scale(1)';
      circle.style.background = 'radial-gradient(circle, var(--a2) 0%, transparent 70%)';
      text.innerText = 'Başla';
      btn.innerText = 'Egzersizi Başlat';
      isBreathing = false;
    };

    const breathCycle = () => {
      text.innerText = 'Nefes Al...';
      circle.style.transition = 'all 4s linear';
      circle.style.transform = 'scale(3.5)';
      circle.style.background = 'radial-gradient(circle, var(--a1) 0%, transparent 70%)';
      
      breathTimeout1 = setTimeout(() => {
        text.innerText = 'Tut...';
        circle.style.transition = 'all 7s linear'; 
        circle.style.transform = 'scale(3.6)';
        circle.style.background = 'radial-gradient(circle, var(--a3) 0%, transparent 70%)';
      }, 4000);

      breathTimeout2 = setTimeout(() => {
        text.innerText = 'Nefes Ver...';
        circle.style.transition = 'all 8s linear';
        circle.style.transform = 'scale(1)';
        circle.style.background = 'radial-gradient(circle, var(--a2) 0%, transparent 70%)';
      }, 4000 + 7000);
    };

    btn.onclick = () => {
      if (isBreathing) {
        resetBreathing();
      } else {
        isBreathing = true;
        btn.innerText = 'Durdur';
        breathCycle();
        breathInterval = setInterval(breathCycle, 4000 + 7000 + 8000); 
      }
    };
  }
} catch(e) { console.error('Breathing Error:', e); }
