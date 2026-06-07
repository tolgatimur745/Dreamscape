/* ============================================================
   NEW FEATURES I — Dosya & Medya Atölyesi V2
   ============================================================ */

// 1. Akıllı Büyütücü (Image Upscaler)
try {
  if (!document.getElementById('upscaler-sec')) {
    const html = `
    <section id="upscaler-sec" class="section ds-section" style="display:none;min-height:100vh;background:var(--bg);color:var(--tx);font-family:'Segoe UI',sans-serif;padding-top:60px;">
      <button class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:100;cursor:pointer;background:var(--bg2);border:1px solid #f39c12;color:var(--tx);padding:10px 15px;border-radius:8px;font-weight:bold;box-shadow:0 0 10px #f39c12;" onclick="if(typeof dsGoToSection==='function') dsGoToSection('hubPage','')">◀ Ana Sayfa</button>
      
      <div style="max-width:800px;margin:0 auto;padding:20px;text-align:center;">
        <h2 style="color:#f39c12;margin-bottom:10px;text-shadow:0 0 10px #f39c12;">🔍 Akıllı Görsel Büyütücü</h2>
        <p style="color:var(--tx2);margin-bottom:30px;">Düşük çözünürlüklü görsellerinizi 2x veya 4x boyutunda büyütün ve keskinleştirin.</p>
        
        <div style="background:var(--card);padding:30px;border-radius:15px;border:1px solid var(--a2);box-shadow:0 10px 30px rgba(0,0,0,0.5);">
          <input type="file" id="up-file" accept="image/*" style="display:none;" onchange="upHandleFile(event)">
          <label for="up-file" style="display:inline-block;background:var(--bg2);color:var(--tx);border:2px dashed #f39c12;padding:20px 40px;border-radius:15px;cursor:pointer;font-weight:bold;font-size:16px;margin-bottom:20px;">
            Görsel Seçin
          </label>
          
          <div id="up-preview-container" style="display:none;margin-bottom:20px;">
            <div style="display:flex;justify-content:center;gap:20px;margin-bottom:15px;">
              <div>
                <div style="font-size:12px;color:var(--tx2);margin-bottom:5px;">Orijinal</div>
                <img id="up-img-orig" style="max-width:200px;border:1px solid var(--bg2);border-radius:8px;">
              </div>
            </div>
            
            <div style="display:flex;justify-content:center;gap:15px;margin-bottom:20px;">
              <button onclick="upProcess(2)" style="background:#f39c12;color:#fff;border:none;padding:10px 20px;border-radius:20px;cursor:pointer;font-weight:bold;">2x Büyüt</button>
              <button onclick="upProcess(4)" style="background:#e67e22;color:#fff;border:none;padding:10px 20px;border-radius:20px;cursor:pointer;font-weight:bold;">4x Büyüt</button>
            </div>
            
            <div id="up-status" style="font-weight:bold;color:#f39c12;margin-bottom:15px;"></div>
          </div>
        </div>
      </div>
    </section>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    let upImage = null;
    let upFileName = '';

    window.upHandleFile = (e) => {
      const file = e.target.files[0];
      if(!file) return;
      upFileName = file.name.split('.')[0];
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        upImage = img;
        document.getElementById('up-img-orig').src = url;
        document.getElementById('up-preview-container').style.display = 'block';
        document.getElementById('up-status').textContent = '';
      };
      img.src = url;
    };

    window.upProcess = (scale) => {
      if(!upImage) return;
      const stat = document.getElementById('up-status');
      stat.textContent = 'İşleniyor, lütfen bekleyin...';
      
      setTimeout(() => {
        const cvs = document.createElement('canvas');
        cvs.width = upImage.width * scale;
        cvs.height = upImage.height * scale;
        const ctx = cvs.getContext('2d');
        
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(upImage, 0, 0, cvs.width, cvs.height);
        
        // Simple Sharpening Filter
        const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);
        const w = cvs.width, h = cvs.height;
        const weights = [0, -1, 0, -1, 5, -1, 0, -1, 0];
        const side = Math.round(Math.sqrt(weights.length));
        const halfSide = Math.floor(side/2);
        const src = imgData.data;
        const sw = w, sh = h;
        const wData = ctx.createImageData(w, h);
        const dst = wData.data;
        const alphaFac = 0;
        
        for (let y=0; y<h; y++) {
          for (let x=0; x<w; x++) {
            const sy = y, sx = x;
            const dstOff = (y*w+x)*4;
            let r=0, g=0, b=0, a=0;
            for (let cy=0; cy<side; cy++) {
              for (let cx=0; cx<side; cx++) {
                const scy = sy + cy - halfSide;
                const scx = sx + cx - halfSide;
                if (scy>=0 && scy<sh && scx>=0 && scx<sw) {
                  const srcOff = (scy*sw+scx)*4;
                  const wt = weights[cy*side+cx];
                  r += src[srcOff] * wt;
                  g += src[srcOff+1] * wt;
                  b += src[srcOff+2] * wt;
                  a += src[srcOff+3] * wt;
                }
              }
            }
            dst[dstOff] = r; dst[dstOff+1] = g; dst[dstOff+2] = b;
            dst[dstOff+3] = src[dstOff+3];
          }
        }
        ctx.putImageData(wData, 0, 0);
        
        cvs.toBlob(blob => {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = `${upFileName}_${scale}x.png`;
          a.click();
          stat.textContent = `✅ İşlem tamamlandı! (${cvs.width}x${cvs.height}px)`;
        }, 'image/png');
      }, 100);
    };
  }
} catch(e) { console.error('Upscaler Error:', e); }

// 2. Arka Plan Silici (Background Remover via imgly)
try {
  if (!document.getElementById('bg-remover-sec')) {
    const html = `
    <section id="bg-remover-sec" class="section ds-section" style="display:none;min-height:100vh;background:var(--bg);color:var(--tx);font-family:'Segoe UI',sans-serif;padding-top:60px;">
      <button class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:100;cursor:pointer;background:var(--bg2);border:1px solid #9b59b6;color:var(--tx);padding:10px 15px;border-radius:8px;font-weight:bold;box-shadow:0 0 10px #9b59b6;" onclick="if(typeof dsGoToSection==='function') dsGoToSection('hubPage','')">◀ Ana Sayfa</button>
      
      <div style="max-width:800px;margin:0 auto;padding:20px;text-align:center;">
        <h2 style="color:#9b59b6;margin-bottom:10px;text-shadow:0 0 10px #9b59b6;">✨ Yapay Zeka Arka Plan Silici</h2>
        <p style="color:var(--tx2);margin-bottom:30px;">Fotoğraflarınızın arka planını yapay zeka ile otomatik silin. (Cihazınızda çalışır, internete veri gitmez)</p>
        
        <div style="background:var(--card);padding:30px;border-radius:15px;border:1px solid var(--a2);box-shadow:0 10px 30px rgba(0,0,0,0.5);">
          <input type="file" id="bg-file" accept="image/*" style="display:none;" onchange="bgHandleFile(event)">
          <label for="bg-file" style="display:inline-block;background:var(--bg2);color:var(--tx);border:2px dashed #9b59b6;padding:20px 40px;border-radius:15px;cursor:pointer;font-weight:bold;font-size:16px;margin-bottom:20px;">
            Görsel Seçin
          </label>
          
          <div id="bg-preview-container" style="display:none;margin-bottom:20px;">
            <img id="bg-img-orig" style="max-width:100%;max-height:300px;border:1px solid var(--bg2);border-radius:8px;margin-bottom:15px;">
            <div>
              <button id="bg-start-btn" onclick="bgProcess()" style="background:#9b59b6;color:#fff;border:none;padding:12px 30px;border-radius:20px;cursor:pointer;font-weight:bold;font-size:16px;box-shadow:0 0 15px #9b59b6;">Arka Planı Sil</button>
            </div>
            <div id="bg-status" style="margin-top:15px;font-weight:bold;color:var(--tx2);"></div>
          </div>
          
          <div id="bg-result-container" style="display:none;margin-top:20px;padding-top:20px;border-top:1px solid var(--bg2);">
            <div style="margin-bottom:10px;color:#9b59b6;font-weight:bold;">Sonuç:</div>
            <div style="background:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAOklEQVQYV2NkYGAwYkAD////Z4QxMIxQhV8//2eEMTCjK8KkEQagV2F0g/DqwuoHshVIbyB91zDCNABtPjL/0r6WfwAAAABJRU5ErkJggg==') repeat;border-radius:8px;display:inline-block;padding:10px;border:1px solid var(--bg2);">
              <img id="bg-img-result" style="max-width:100%;max-height:300px;">
            </div>
            <div style="margin-top:15px;">
              <button onclick="bgDownload()" style="background:#2ecc71;color:#fff;border:none;padding:10px 20px;border-radius:20px;cursor:pointer;font-weight:bold;">PNG Olarak İndir</button>
            </div>
          </div>
        </div>
      </div>
    </section>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    let bgFile = null;
    let bgBlobUrl = null;

    // Load external imgly library dynamically
    const loadImgly = () => {
      return new Promise((resolve) => {
        if(window.imglyRemoveBackground) return resolve();
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.4.5/dist/imgly-background-removal.js';
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    };

    window.bgHandleFile = (e) => {
      const file = e.target.files[0];
      if(!file) return;
      bgFile = file;
      document.getElementById('bg-img-orig').src = URL.createObjectURL(file);
      document.getElementById('bg-preview-container').style.display = 'block';
      document.getElementById('bg-result-container').style.display = 'none';
      document.getElementById('bg-status').textContent = '';
      document.getElementById('bg-start-btn').style.display = 'inline-block';
    };

    window.bgProcess = async () => {
      const stat = document.getElementById('bg-status');
      const btn = document.getElementById('bg-start-btn');
      stat.textContent = 'Yapay zeka modeli yükleniyor (İlk seferde biraz sürebilir)...';
      btn.style.display = 'none';
      
      try {
        await loadImgly();
        stat.textContent = 'Arka plan siliniyor, lütfen sekmede kalın...';
        
        const blob = await window.imglyRemoveBackground(bgFile);
        bgBlobUrl = URL.createObjectURL(blob);
        
        document.getElementById('bg-img-result').src = bgBlobUrl;
        document.getElementById('bg-result-container').style.display = 'block';
        stat.textContent = '✅ İşlem tamamlandı!';
      } catch(err) {
        stat.textContent = '❌ Hata oluştu: ' + err.message;
        btn.style.display = 'inline-block';
      }
    };

    window.bgDownload = () => {
      if(!bgBlobUrl) return;
      const a = document.createElement('a');
      a.href = bgBlobUrl;
      a.download = bgFile.name.split('.')[0] + '_transparan.png';
      a.click();
    };
  }
} catch(e) { console.error('BG Remover Error:', e); }

// 3. Renk Paleti Çıkarıcı (Palette Extractor)
try {
  if (!document.getElementById('palette-sec')) {
    const html = `
    <section id="palette-sec" class="section ds-section" style="display:none;min-height:100vh;background:var(--bg);color:var(--tx);font-family:'Segoe UI',sans-serif;padding-top:60px;">
      <button class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:100;cursor:pointer;background:var(--bg2);border:1px solid #1abc9c;color:var(--tx);padding:10px 15px;border-radius:8px;font-weight:bold;box-shadow:0 0 10px #1abc9c;" onclick="if(typeof dsGoToSection==='function') dsGoToSection('hubPage','')">◀ Ana Sayfa</button>
      
      <div style="max-width:800px;margin:0 auto;padding:20px;text-align:center;">
        <h2 style="color:#1abc9c;margin-bottom:10px;text-shadow:0 0 10px #1abc9c;">🎨 Renk Paleti Çıkarıcı</h2>
        <p style="color:var(--tx2);margin-bottom:30px;">Fotoğraftaki en baskın renkleri otomatik olarak tespit edip HEX kodlarını alın.</p>
        
        <div style="background:var(--card);padding:30px;border-radius:15px;border:1px solid var(--a2);box-shadow:0 10px 30px rgba(0,0,0,0.5);">
          <input type="file" id="pal-file" accept="image/*" style="display:none;" onchange="palHandleFile(event)">
          <label for="pal-file" style="display:inline-block;background:var(--bg2);color:var(--tx);border:2px dashed #1abc9c;padding:20px 40px;border-radius:15px;cursor:pointer;font-weight:bold;font-size:16px;margin-bottom:20px;">
            Görsel Seçin
          </label>
          
          <div id="pal-container" style="display:none;">
            <img id="pal-img" style="max-width:100%;max-height:300px;border-radius:8px;margin-bottom:20px;">
            <div id="pal-colors" style="display:flex;justify-content:center;flex-wrap:wrap;gap:10px;"></div>
          </div>
        </div>
      </div>
    </section>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    window.palHandleFile = (e) => {
      const file = e.target.files[0];
      if(!file) return;
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        document.getElementById('pal-img').src = url;
        document.getElementById('pal-container').style.display = 'block';
        palExtract(img);
      };
      img.src = url;
    };

    const rgbToHex = (r, g, b) => '#' + [r,g,b].map(x => x.toString(16).padStart(2,'0')).join('').toUpperCase();

    window.palExtract = (img) => {
      const cvs = document.createElement('canvas');
      // Scale down for faster processing
      const scale = Math.min(1, 200/Math.max(img.width, img.height));
      cvs.width = img.width * scale;
      cvs.height = img.height * scale;
      const ctx = cvs.getContext('2d');
      ctx.drawImage(img, 0, 0, cvs.width, cvs.height);
      const data = ctx.getImageData(0, 0, cvs.width, cvs.height).data;
      
      const colors = [];
      const step = 4 * 10; // check every 10th pixel
      for (let i = 0; i < data.length; i += step) {
        if(data[i+3] < 128) continue; // ignore transparent
        colors.push({r:data[i], g:data[i+1], b:data[i+2]});
      }
      
      // Basic K-Means clustering (simplified)
      let centroids = [];
      for(let i=0; i<5; i++) {
        centroids.push(colors[Math.floor(Math.random()*colors.length)]);
      }
      
      for(let iter=0; iter<5; iter++) {
        const clusters = Array(5).fill().map(()=>[]);
        colors.forEach(c => {
          let minDist = Infinity, cIdx = 0;
          centroids.forEach((cent, idx) => {
            const dist = Math.pow(c.r-cent.r,2)+Math.pow(c.g-cent.g,2)+Math.pow(c.b-cent.b,2);
            if(dist<minDist) { minDist=dist; cIdx=idx; }
          });
          clusters[cIdx].push(c);
        });
        centroids = clusters.map((arr, i) => {
          if(arr.length===0) return centroids[i];
          let r=0,g=0,b=0;
          arr.forEach(c=>{ r+=c.r; g+=c.g; b+=c.b; });
          return {r:Math.round(r/arr.length), g:Math.round(g/arr.length), b:Math.round(b/arr.length)};
        });
      }
      
      const container = document.getElementById('pal-colors');
      container.innerHTML = '';
      centroids.forEach(c => {
        const hex = rgbToHex(c.r, c.g, c.b);
        const div = document.createElement('div');
        div.style.cssText = `width:80px;height:100px;border-radius:10px;background:${hex};display:flex;align-items:flex-end;justify-content:center;padding-bottom:10px;cursor:pointer;box-shadow:0 4px 10px rgba(0,0,0,0.3);position:relative;`;
        div.innerHTML = `<span style="background:rgba(0,0,0,0.6);color:#fff;padding:2px 5px;border-radius:4px;font-size:12px;font-weight:bold;">${hex}</span>`;
        div.onclick = () => {
          navigator.clipboard.writeText(hex);
          div.innerHTML += '<span style="position:absolute;top:-25px;background:#fff;color:#000;padding:2px 5px;border-radius:4px;font-size:10px;white-space:nowrap;">Kopyalandı!</span>';
          setTimeout(()=>div.children[1].remove(), 1000);
        };
        container.appendChild(div);
      });
    };
  }
} catch(e) { console.error('Palette Extractor Error:', e); }

// 4. Ses Kırpıcı (Audio Trimmer)
try {
  if (!document.getElementById('audio-trimmer-sec')) {
    const html = `
    <section id="audio-trimmer-sec" class="section ds-section" style="display:none;min-height:100vh;background:var(--bg);color:var(--tx);font-family:'Segoe UI',sans-serif;padding-top:60px;">
      <button class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:100;cursor:pointer;background:var(--bg2);border:1px solid #e84393;color:var(--tx);padding:10px 15px;border-radius:8px;font-weight:bold;box-shadow:0 0 10px #e84393;" onclick="if(typeof dsGoToSection==='function') dsGoToSection('hubPage','')">◀ Ana Sayfa</button>
      
      <div style="max-width:700px;margin:0 auto;padding:20px;text-align:center;">
        <h2 style="color:#e84393;margin-bottom:10px;text-shadow:0 0 10px #e84393;">✂️ Ses Kırpıcı</h2>
        <p style="color:var(--tx2);margin-bottom:30px;">MP3/WAV dosyalarınızın istediğiniz bir bölümünü keserek çıkarın.</p>
        
        <div style="background:var(--card);padding:30px;border-radius:15px;border:1px solid var(--a2);box-shadow:0 10px 30px rgba(0,0,0,0.5);">
          <input type="file" id="at-file" accept="audio/*" style="display:none;" onchange="atHandleFile(event)">
          <label for="at-file" style="display:inline-block;background:var(--bg2);color:var(--tx);border:2px dashed #e84393;padding:20px 40px;border-radius:15px;cursor:pointer;font-weight:bold;font-size:16px;margin-bottom:20px;">
            Ses Dosyası Seçin
          </label>
          
          <div id="at-container" style="display:none;">
            <div style="font-size:18px;font-weight:bold;margin-bottom:10px;" id="at-duration"></div>
            
            <div style="display:flex;gap:15px;justify-content:center;margin-bottom:20px;">
              <div style="flex:1;">
                <label style="display:block;color:var(--tx2);font-size:12px;margin-bottom:5px;">Başlangıç (sn)</label>
                <input type="number" id="at-start" min="0" value="0" step="0.1" style="width:100px;padding:8px;border-radius:8px;background:var(--bg);color:var(--tx);border:1px solid var(--bg2);text-align:center;">
              </div>
              <div style="flex:1;">
                <label style="display:block;color:var(--tx2);font-size:12px;margin-bottom:5px;">Bitiş (sn)</label>
                <input type="number" id="at-end" min="0" value="10" step="0.1" style="width:100px;padding:8px;border-radius:8px;background:var(--bg);color:var(--tx);border:1px solid var(--bg2);text-align:center;">
              </div>
            </div>
            
            <button onclick="atTrim()" style="background:#e84393;color:#fff;border:none;padding:12px 30px;border-radius:20px;cursor:pointer;font-weight:bold;font-size:16px;box-shadow:0 0 15px #e84393;">Kes ve İndir (WAV)</button>
            <div id="at-status" style="margin-top:15px;color:var(--tx2);"></div>
          </div>
        </div>
      </div>
    </section>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    let atAudioContext = null;
    let atAudioBuffer = null;
    let atFileName = '';

    window.atHandleFile = async (e) => {
      const file = e.target.files[0];
      if(!file) return;
      atFileName = file.name.split('.')[0];
      document.getElementById('at-status').textContent = 'Ses dosyası yükleniyor...';
      document.getElementById('at-container').style.display = 'block';
      
      const arrayBuffer = await file.arrayBuffer();
      if(!atAudioContext) atAudioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      try {
        atAudioBuffer = await atAudioContext.decodeAudioData(arrayBuffer);
        const dur = atAudioBuffer.duration.toFixed(1);
        document.getElementById('at-duration').textContent = `Toplam Süre: ${dur} Saniye`;
        document.getElementById('at-end').value = Math.min(10, dur);
        document.getElementById('at-end').max = dur;
        document.getElementById('at-status').textContent = '✅ Hazır.';
      } catch(err) {
        document.getElementById('at-status').textContent = '❌ Ses okunamadı: ' + err.message;
      }
    };

    const atAudioBufferToWav = (buffer) => {
      const numChannels = buffer.numberOfChannels;
      const sampleRate = buffer.sampleRate;
      const format = 1; // PCM
      const bitDepth = 16;
      
      let result = [];
      for (let channel = 0; channel < numChannels; channel++) {
        result.push(buffer.getChannelData(channel));
      }
      
      const length = result[0].length * numChannels * 2;
      const wav = new ArrayBuffer(44 + length);
      const view = new DataView(wav);
      
      const writeString = (view, offset, string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };
      
      writeString(view, 0, 'RIFF');
      view.setUint32(4, 36 + length, true);
      writeString(view, 8, 'WAVE');
      writeString(view, 12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, format, true);
      view.setUint16(22, numChannels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * numChannels * 2, true);
      view.setUint16(32, numChannels * 2, true);
      view.setUint16(34, bitDepth, true);
      writeString(view, 36, 'data');
      view.setUint32(40, length, true);
      
      let offset = 44;
      for (let i = 0; i < result[0].length; i++) {
        for (let channel = 0; channel < numChannels; channel++) {
          let sample = Math.max(-1, Math.min(1, result[channel][i]));
          sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
          view.setInt16(offset, sample, true);
          offset += 2;
        }
      }
      return wav;
    };

    window.atTrim = () => {
      if(!atAudioBuffer) return;
      const start = parseFloat(document.getElementById('at-start').value);
      let end = parseFloat(document.getElementById('at-end').value);
      
      if(start >= end) { alert('Bitiş süresi başlangıçtan büyük olmalıdır.'); return; }
      if(end > atAudioBuffer.duration) end = atAudioBuffer.duration;
      
      const rate = atAudioBuffer.sampleRate;
      const startOffset = Math.floor(start * rate);
      const endOffset = Math.floor(end * rate);
      const frameCount = endOffset - startOffset;
      
      const newBuffer = atAudioContext.createBuffer(atAudioBuffer.numberOfChannels, frameCount, rate);
      for (let i = 0; i < atAudioBuffer.numberOfChannels; i++) {
        newBuffer.copyToChannel(atAudioBuffer.getChannelData(i).slice(startOffset, endOffset), i);
      }
      
      const wav = atAudioBufferToWav(newBuffer);
      const blob = new Blob([wav], { type: 'audio/wav' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${atFileName}_kesilmis.wav`;
      a.click();
      document.getElementById('at-status').textContent = '✅ Kesildi ve İndirildi!';
    };
  }
} catch(e) { console.error('Audio Trimmer Error:', e); }

// 5. EXIF & Meta-Veri Temizleyici
try {
  if (!document.getElementById('exif-eraser-sec')) {
    const html = `
    <section id="exif-eraser-sec" class="section ds-section" style="display:none;min-height:100vh;background:var(--bg);color:var(--tx);font-family:'Segoe UI',sans-serif;padding-top:60px;">
      <button class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:100;cursor:pointer;background:var(--bg2);border:1px solid #7f8c8d;color:var(--tx);padding:10px 15px;border-radius:8px;font-weight:bold;box-shadow:0 0 10px #7f8c8d;" onclick="if(typeof dsGoToSection==='function') dsGoToSection('hubPage','')">◀ Ana Sayfa</button>
      
      <div style="max-width:700px;margin:0 auto;padding:20px;text-align:center;">
        <h2 style="color:#7f8c8d;margin-bottom:10px;text-shadow:0 0 10px #7f8c8d;">🕵️ EXIF & Meta-Veri Temizleyici</h2>
        <p style="color:var(--tx2);margin-bottom:30px;">Fotoğraflarınıza gizlenmiş GPS konumu, telefon modeli ve çekim tarihi gibi gizli verileri silin.</p>
        
        <div style="background:var(--card);padding:30px;border-radius:15px;border:1px solid var(--a2);box-shadow:0 10px 30px rgba(0,0,0,0.5);">
          <input type="file" id="ee-file" accept="image/jpeg, image/png" style="display:none;" onchange="eeHandleFile(event)">
          <label for="ee-file" style="display:inline-block;background:var(--bg2);color:var(--tx);border:2px dashed #7f8c8d;padding:20px 40px;border-radius:15px;cursor:pointer;font-weight:bold;font-size:16px;">
            Fotoğraf Seç
          </label>
          <div id="ee-status" style="margin-top:15px;font-weight:bold;color:var(--tx2);"></div>
        </div>
      </div>
    </section>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    window.eeHandleFile = (e) => {
      const file = e.target.files[0];
      if(!file) return;
      const stat = document.getElementById('ee-status');
      stat.textContent = 'Veriler siliniyor...';
      
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        // Drawing an image onto a canvas and extracting it strips all EXIF data natively!
        const cvs = document.createElement('canvas');
        cvs.width = img.width;
        cvs.height = img.height;
        const ctx = cvs.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        cvs.toBlob(blob => {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = file.name.split('.')[0] + '_temiz.jpg';
          a.click();
          stat.innerHTML = '✅ <span style="color:#2ecc71;">Tüm gizli GPS ve Cihaz verileri silindi!</span> Yeni temiz dosya indirildi.';
        }, 'image/jpeg', 0.95);
      };
      img.src = url;
    };
  }
} catch(e) { console.error('EXIF Eraser Error:', e); }
