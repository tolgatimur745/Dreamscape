/* ============================================================
   NEW FEATURES H — Dosya & Medya Atölyesi
   ============================================================ */

// PDF-Lib Loader
const loadPdfLib = () => {
  return new Promise((resolve) => {
    if (window.PDFLib) return resolve(window.PDFLib);
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js';
    script.onload = () => resolve(window.PDFLib);
    document.head.appendChild(script);
  });
};

// 1. PDF Birleştirici
try {
  if (!document.getElementById('pdf-merger-sec')) {
    const html = `
    <section id="pdf-merger-sec" class="section ds-section" style="display:none;min-height:100vh;background:var(--bg);color:var(--tx);font-family:'Segoe UI',sans-serif;padding-top:60px;">
      <button class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:100;cursor:pointer;background:var(--bg2);border:1px solid #e74c3c;color:var(--tx);padding:10px 15px;border-radius:8px;font-weight:bold;box-shadow:0 0 10px #e74c3c;" onclick="if(typeof dsGoToSection==='function') dsGoToSection('hubPage','')">◀ Ana Sayfa</button>
      
      <div style="max-width:800px;margin:0 auto;padding:20px;">
        <h2 style="color:#e74c3c;text-align:center;margin-bottom:10px;text-shadow:0 0 10px #e74c3c;">📄 PDF Birleştirici</h2>
        <p style="text-align:center;color:var(--tx2);margin-bottom:30px;">Birden fazla PDF dosyasını seçin, sıraya dizin ve tek dosya yapın. İşlem tamamen tarayıcınızda (offline) gerçekleşir.</p>
        
        <div style="background:var(--card);padding:30px;border-radius:15px;border:1px solid var(--a2);box-shadow:0 10px 30px rgba(0,0,0,0.5);">
          
          <div style="display:flex;justify-content:center;margin-bottom:20px;">
            <input type="file" id="pm-file-input" multiple accept="application/pdf" style="display:none;" onchange="pmHandleFiles(event)">
            <label for="pm-file-input" style="background:var(--bg2);color:var(--tx);border:2px dashed #e74c3c;padding:30px 60px;border-radius:15px;cursor:pointer;font-weight:bold;font-size:18px;text-align:center;transition:background 0.3s;" onmouseover="this.style.background='rgba(231, 76, 60, 0.1)'" onmouseout="this.style.background='var(--bg2)'">
              📁 PDF Dosyalarını Buraya Tıklayıp Seçin
            </label>
          </div>
          
          <ul id="pm-file-list" style="list-style:none;padding:0;margin:0 0 20px 0;display:flex;flex-direction:column;gap:10px;">
            <!-- File list items go here -->
          </ul>
          
          <div style="text-align:center;">
            <button id="pm-merge-btn" onclick="pmMerge()" style="background:#e74c3c;color:#fff;border:none;padding:15px 40px;border-radius:30px;font-size:18px;font-weight:bold;cursor:pointer;box-shadow:0 0 20px #e74c3c;transition:transform 0.2s;display:none;">BİRLEŞTİR VE İNDİR</button>
            <div id="pm-status" style="margin-top:15px;color:var(--tx2);font-weight:bold;"></div>
          </div>
        </div>
      </div>
    </section>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    let pmFiles = [];

    window.pmHandleFiles = (e) => {
      const files = Array.from(e.target.files);
      pmFiles = pmFiles.concat(files);
      pmRenderList();
    };

    window.pmRemoveFile = (idx) => {
      pmFiles.splice(idx, 1);
      pmRenderList();
    };

    window.pmMoveFile = (idx, dir) => {
      if (idx + dir < 0 || idx + dir >= pmFiles.length) return;
      const temp = pmFiles[idx];
      pmFiles[idx] = pmFiles[idx + dir];
      pmFiles[idx + dir] = temp;
      pmRenderList();
    };

    window.pmRenderList = () => {
      const list = document.getElementById('pm-file-list');
      const btn = document.getElementById('pm-merge-btn');
      list.innerHTML = '';
      
      if (pmFiles.length > 0) {
        btn.style.display = 'inline-block';
        pmFiles.forEach((file, idx) => {
          const li = document.createElement('li');
          li.style.cssText = 'display:flex;align-items:center;background:var(--bg);padding:10px 15px;border-radius:8px;border:1px solid var(--bg2);';
          
          li.innerHTML = `
            <div style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:bold;">📄 \${file.name}</div>
            <div style="display:flex;gap:5px;">
              <button onclick="pmMoveFile(\${idx}, -1)" style="background:var(--bg2);border:none;color:var(--tx);cursor:pointer;padding:5px 10px;border-radius:5px;" \${idx===0?'disabled':''}>⬆️</button>
              <button onclick="pmMoveFile(\${idx}, 1)" style="background:var(--bg2);border:none;color:var(--tx);cursor:pointer;padding:5px 10px;border-radius:5px;" \${idx===pmFiles.length-1?'disabled':''}>⬇️</button>
              <button onclick="pmRemoveFile(\${idx})" style="background:#ff5252;border:none;color:#fff;cursor:pointer;padding:5px 10px;border-radius:5px;">❌</button>
            </div>
          `;
          list.appendChild(li);
        });
      } else {
        btn.style.display = 'none';
      }
    };

    window.pmMerge = async () => {
      if (pmFiles.length < 2) {
        alert('Lütfen en az 2 PDF dosyası seçin.');
        return;
      }
      const stat = document.getElementById('pm-status');
      stat.textContent = 'Kütüphane yükleniyor...';
      const PDFLib = await loadPdfLib();
      
      try {
        stat.textContent = 'Birleştiriliyor, lütfen bekleyin...';
        const mergedPdf = await PDFLib.PDFDocument.create();
        
        for (let file of pmFiles) {
          const arrayBuffer = await file.arrayBuffer();
          const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
          const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
          copiedPages.forEach((page) => mergedPdf.addPage(page));
        }
        
        const pdfBytes = await mergedPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Birlestirilmis_Belge.pdf';
        a.click();
        
        stat.textContent = '✅ Başarıyla birleştirildi ve indirildi!';
        setTimeout(() => { stat.textContent = ''; }, 3000);
      } catch (err) {
        stat.textContent = '❌ Hata oluştu: ' + err.message;
      }
    };
  }
} catch(e) { console.error('PDF Merger error:', e); }

// 2. Resimden PDF'e (JPG to PDF)
try {
  if (!document.getElementById('jpg-to-pdf-sec')) {
    const html = `
    <section id="jpg-to-pdf-sec" class="section ds-section" style="display:none;min-height:100vh;background:var(--bg);color:var(--tx);font-family:'Segoe UI',sans-serif;padding-top:60px;">
      <button class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:100;cursor:pointer;background:var(--bg2);border:1px solid #3498db;color:var(--tx);padding:10px 15px;border-radius:8px;font-weight:bold;box-shadow:0 0 10px #3498db;" onclick="if(typeof dsGoToSection==='function') dsGoToSection('hubPage','')">◀ Ana Sayfa</button>
      
      <div style="max-width:800px;margin:0 auto;padding:20px;">
        <h2 style="color:#3498db;text-align:center;margin-bottom:10px;text-shadow:0 0 10px #3498db;">🖼️ Resimden PDF'e Çevirici</h2>
        <p style="text-align:center;color:var(--tx2);margin-bottom:30px;">Fotoğraflarınızı seçip saniyeler içinde tek bir A4 PDF kitabına dönüştürün.</p>
        
        <div style="background:var(--card);padding:30px;border-radius:15px;border:1px solid var(--a2);box-shadow:0 10px 30px rgba(0,0,0,0.5);">
          
          <div style="display:flex;justify-content:center;margin-bottom:20px;">
            <input type="file" id="j2p-file-input" multiple accept="image/*" style="display:none;" onchange="j2pHandleFiles(event)">
            <label for="j2p-file-input" style="background:var(--bg2);color:var(--tx);border:2px dashed #3498db;padding:30px 60px;border-radius:15px;cursor:pointer;font-weight:bold;font-size:18px;text-align:center;transition:background 0.3s;" onmouseover="this.style.background='rgba(52, 152, 219, 0.1)'" onmouseout="this.style.background='var(--bg2)'">
              🖼️ Resimleri Buraya Tıklayıp Seçin
            </label>
          </div>
          
          <div id="j2p-preview-grid" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(100px, 1fr));gap:15px;margin-bottom:20px;">
            <!-- Thumbnails -->
          </div>
          
          <div style="text-align:center;">
            <button id="j2p-convert-btn" onclick="j2pConvert()" style="background:#3498db;color:#fff;border:none;padding:15px 40px;border-radius:30px;font-size:18px;font-weight:bold;cursor:pointer;box-shadow:0 0 20px #3498db;transition:transform 0.2s;display:none;">PDF YAP VE İNDİR</button>
            <div id="j2p-status" style="margin-top:15px;color:var(--tx2);font-weight:bold;"></div>
          </div>
        </div>
      </div>
    </section>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    let j2pFiles = [];

    window.j2pHandleFiles = (e) => {
      const files = Array.from(e.target.files);
      j2pFiles = j2pFiles.concat(files);
      j2pRenderGrid();
    };

    window.j2pRemoveFile = (idx) => {
      j2pFiles.splice(idx, 1);
      j2pRenderGrid();
    };

    window.j2pRenderGrid = () => {
      const grid = document.getElementById('j2p-preview-grid');
      const btn = document.getElementById('j2p-convert-btn');
      grid.innerHTML = '';
      
      if (j2pFiles.length > 0) {
        btn.style.display = 'inline-block';
        j2pFiles.forEach((file, idx) => {
          const url = URL.createObjectURL(file);
          const div = document.createElement('div');
          div.style.cssText = 'position:relative;padding-top:100%;border-radius:8px;overflow:hidden;border:1px solid var(--bg2);';
          div.innerHTML = `
            <img src="\${url}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;">
            <button onclick="j2pRemoveFile(\${idx})" style="position:absolute;top:5px;right:5px;background:#ff5252;color:#fff;border:none;border-radius:50%;width:24px;height:24px;cursor:pointer;font-weight:bold;line-height:1;">×</button>
          `;
          grid.appendChild(div);
        });
      } else {
        btn.style.display = 'none';
      }
    };

    window.j2pConvert = async () => {
      if (j2pFiles.length === 0) return;
      const stat = document.getElementById('j2p-status');
      stat.textContent = 'Kütüphane yükleniyor...';
      const PDFLib = await loadPdfLib();
      
      try {
        stat.textContent = 'PDF oluşturuluyor, lütfen bekleyin...';
        const pdfDoc = await PDFLib.PDFDocument.create();
        
        for (let file of j2pFiles) {
          const arrayBuffer = await file.arrayBuffer();
          let img;
          if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
            img = await pdfDoc.embedJpg(arrayBuffer);
          } else if (file.type === 'image/png') {
            img = await pdfDoc.embedPng(arrayBuffer);
          } else {
            // Need to convert to PNG via canvas if unsupported (like WebP)
            img = await j2pConvertToPng(file, pdfDoc);
          }
          
          const page = pdfDoc.addPage(PDFLib.PageSizes.A4);
          const { width, height } = page.getSize();
          
          const imgDims = img.scaleToFit(width - 40, height - 40);
          page.drawImage(img, {
            x: width / 2 - imgDims.width / 2,
            y: height / 2 - imgDims.height / 2,
            width: imgDims.width,
            height: imgDims.height
          });
        }
        
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Resimler.pdf';
        a.click();
        
        stat.textContent = '✅ Başarıyla PDF yapıldı!';
        setTimeout(() => { stat.textContent = ''; }, 3000);
      } catch (err) {
        stat.textContent = '❌ Hata: ' + err.message;
      }
    };
    
    // Helper for WebP or other images
    window.j2pConvertToPng = (file, pdfDoc) => {
      return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
          const cvs = document.createElement('canvas');
          cvs.width = img.width; cvs.height = img.height;
          const ctx = cvs.getContext('2d');
          ctx.drawImage(img, 0, 0);
          cvs.toBlob(async (blob) => {
            const buf = await blob.arrayBuffer();
            const png = await pdfDoc.embedPng(buf);
            resolve(png);
          }, 'image/png');
        };
        img.onerror = reject;
        img.src = url;
      });
    };
  }
} catch(e) { console.error('JPG to PDF error:', e); }

// 3. YouTube İndirici (Cobalt API)
try {
  if (!document.getElementById('youtube-downloader-sec')) {
    const html = `
    <section id="youtube-downloader-sec" class="section ds-section" style="display:none;min-height:100vh;background:var(--bg);color:var(--tx);font-family:'Segoe UI',sans-serif;padding-top:60px;">
      <button class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:100;cursor:pointer;background:var(--bg2);border:1px solid #ff0000;color:var(--tx);padding:10px 15px;border-radius:8px;font-weight:bold;box-shadow:0 0 10px #ff0000;" onclick="if(typeof dsGoToSection==='function') dsGoToSection('hubPage','')">◀ Ana Sayfa</button>
      
      <div style="max-width:700px;margin:0 auto;padding:20px;text-align:center;">
        <h2 style="color:#ff0000;margin-bottom:10px;text-shadow:0 0 10px #ff0000;">🎥 Medya İndirici</h2>
        <p style="color:var(--tx2);margin-bottom:30px;">YouTube, Instagram, TikTok veya X (Twitter) video linkini yapıştırıp reklamsız indirin.</p>
        
        <div style="background:var(--card);padding:40px;border-radius:20px;box-shadow:0 10px 30px rgba(0,0,0,0.5);border:1px solid rgba(255,0,0,0.3);">
          
          <input type="text" id="yd-url" placeholder="https://www.youtube.com/watch?v=..." style="width:100%;padding:15px 20px;border-radius:30px;background:var(--bg);color:var(--tx);border:2px solid var(--bg2);font-size:16px;margin-bottom:20px;outline:none;" onfocus="this.style.borderColor='#ff0000'" onblur="this.style.borderColor='var(--bg2)'">
          
          <div style="display:flex;justify-content:center;gap:15px;margin-bottom:30px;">
            <button onclick="ydDownload('video')" style="background:#ff0000;color:#fff;border:none;padding:12px 30px;border-radius:30px;font-size:16px;font-weight:bold;cursor:pointer;box-shadow:0 0 15px rgba(255,0,0,0.5);display:flex;align-items:center;gap:8px;">🎬 Video (MP4)</button>
            <button onclick="ydDownload('audio')" style="background:#1db954;color:#fff;border:none;padding:12px 30px;border-radius:30px;font-size:16px;font-weight:bold;cursor:pointer;box-shadow:0 0 15px rgba(29,185,84,0.5);display:flex;align-items:center;gap:8px;">🎧 Ses (MP3)</button>
          </div>
          
          <div id="yd-status" style="font-weight:bold;color:var(--tx2);min-height:24px;"></div>
        </div>
        <div style="margin-top:20px;font-size:12px;color:var(--tx2);">Altyapı: Cobalt.tools (Açık Kaynak, Reklamsız API)</div>
      </div>
    </section>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    window.ydDownload = async (type) => {
      const url = document.getElementById('yd-url').value.trim();
      const stat = document.getElementById('yd-status');
      if (!url) {
        stat.textContent = '❌ Lütfen geçerli bir link girin.';
        return;
      }
      
      stat.textContent = '⏳ İndirme linki hazırlanıyor, lütfen bekleyin...';
      
      try {
        const res = await fetch('https://api.cobalt.tools/api/json', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url: url,
            isAudioOnly: type === 'audio',
            vQuality: '1080',
            aFormat: 'mp3'
          })
        });
        
        if (!res.ok) throw new Error('Sunucu reddetti.');
        const data = await res.json();
        
        if (data.status === 'error') {
          stat.textContent = '❌ Hata: ' + data.text;
        } else if (data.url) {
          stat.textContent = '✅ Hazır! İndirme başlıyor...';
          const a = document.createElement('a');
          a.href = data.url;
          a.target = '_blank'; // Some downloads redirect or open in new tab
          document.body.appendChild(a);
          a.click();
          a.remove();
        } else {
          stat.textContent = '❌ Bilinmeyen bir yanıt alındı.';
        }
      } catch (err) {
        stat.textContent = '❌ API Hatası. Servis şu an yoğun olabilir. (' + err.message + ')';
      }
    };
  }
} catch(e) { console.error('YT Downloader error:', e); }

// 4. Süper Görsel Çevirici (Image Converter)
try {
  if (!document.getElementById('image-converter-sec')) {
    const html = `
    <section id="image-converter-sec" class="section ds-section" style="display:none;min-height:100vh;background:var(--bg);color:var(--tx);font-family:'Segoe UI',sans-serif;padding-top:60px;">
      <button class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:100;cursor:pointer;background:var(--bg2);border:1px solid #9c88ff;color:var(--tx);padding:10px 15px;border-radius:8px;font-weight:bold;box-shadow:0 0 10px #9c88ff;" onclick="if(typeof dsGoToSection==='function') dsGoToSection('hubPage','')">◀ Ana Sayfa</button>
      
      <div style="max-width:700px;margin:0 auto;padding:20px;">
        <h2 style="color:#9c88ff;text-align:center;margin-bottom:10px;text-shadow:0 0 10px #9c88ff;">🔄 Görsel Çevirici</h2>
        <p style="text-align:center;color:var(--tx2);margin-bottom:30px;">Fotoğraflarınızın formatını değiştirin veya kaliteyi düşürerek boyutlarını küçültün.</p>
        
        <div style="background:var(--card);padding:30px;border-radius:15px;border:1px solid var(--a2);box-shadow:0 10px 30px rgba(0,0,0,0.5);">
          
          <div style="display:flex;justify-content:center;margin-bottom:20px;">
            <input type="file" id="ic-file" accept="image/*" style="display:none;" onchange="icHandleFile(event)">
            <label for="ic-file" style="background:var(--bg2);color:var(--tx);border:2px dashed #9c88ff;padding:20px 40px;border-radius:15px;cursor:pointer;font-weight:bold;font-size:16px;text-align:center;transition:background 0.3s;" onmouseover="this.style.background='rgba(156, 136, 255, 0.1)'" onmouseout="this.style.background='var(--bg2)'">
              1. Görsel Seçin
            </label>
          </div>
          
          <div id="ic-preview-container" style="display:none;text-align:center;margin-bottom:20px;">
            <img id="ic-preview" style="max-width:100%;max-height:200px;border-radius:8px;border:1px solid var(--bg2);">
            <div id="ic-info" style="color:var(--tx2);font-size:12px;margin-top:5px;"></div>
          </div>
          
          <div style="display:flex;gap:15px;align-items:center;margin-bottom:20px;flex-wrap:wrap;">
            <div style="flex:1;min-width:150px;">
              <label style="font-size:12px;color:var(--tx2);display:block;">Çıktı Formatı:</label>
              <select id="ic-format" style="width:100%;padding:10px;border-radius:8px;background:var(--bg);color:var(--tx);border:1px solid var(--bg2);">
                <option value="image/webp">WEBP (Önerilen)</option>
                <option value="image/jpeg">JPG / JPEG</option>
                <option value="image/png">PNG</option>
              </select>
            </div>
            <div style="flex:1;min-width:150px;">
              <label style="font-size:12px;color:var(--tx2);display:block;">Kalite (Sıkıştırma):</label>
              <input type="range" id="ic-quality" min="0.1" max="1" step="0.1" value="0.8" style="width:100%;accent-color:#9c88ff;">
              <div style="text-align:center;font-size:12px;color:var(--tx2);" id="ic-q-val">%80</div>
            </div>
          </div>
          
          <div style="text-align:center;">
            <button onclick="icConvert()" style="background:#9c88ff;color:#fff;border:none;padding:12px 30px;border-radius:30px;font-size:16px;font-weight:bold;cursor:pointer;box-shadow:0 0 15px rgba(156, 136, 255, 0.5);">2. ÇEVİR VE İNDİR</button>
          </div>
        </div>
      </div>
    </section>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    let icCurrentImg = null;
    let icOriginalName = '';

    document.getElementById('ic-quality').addEventListener('input', (e) => {
      document.getElementById('ic-q-val').textContent = '%' + Math.round(e.target.value * 100);
    });

    window.icHandleFile = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      icOriginalName = file.name.split('.')[0];
      
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        icCurrentImg = img;
        const prev = document.getElementById('ic-preview');
        prev.src = url;
        document.getElementById('ic-preview-container').style.display = 'block';
        document.getElementById('ic-info').textContent = \`\${img.width}x\${img.height}px | \${(file.size/1024).toFixed(1)} KB\`;
      };
      img.src = url;
    };

    window.icConvert = () => {
      if (!icCurrentImg) {
        alert('Lütfen önce bir görsel seçin.');
        return;
      }
      
      const format = document.getElementById('ic-format').value;
      const qual = parseFloat(document.getElementById('ic-quality').value);
      
      const cvs = document.createElement('canvas');
      cvs.width = icCurrentImg.width;
      cvs.height = icCurrentImg.height;
      const ctx = cvs.getContext('2d');
      ctx.drawImage(icCurrentImg, 0, 0);
      
      const ext = format.split('/')[1];
      
      cvs.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = \`\${icOriginalName}_cevrilmis.\${ext}\`;
        a.click();
      }, format, qual);
    };
  }
} catch(e) { console.error('Image Converter error:', e); }
