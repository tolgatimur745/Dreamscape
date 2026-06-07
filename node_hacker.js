/* =========================================================
   NODE HACKER V3 (Kablo Paneli & Ses Sentezleyici)
   Logic puzzle and audio synth with CLICK-TO-CONNECT logic.
========================================================= */
try {
  const nhStyles = `
    .nh-wrap { font-family: 'Courier New', Courier, monospace; background: #1a1a24; position: relative; width: 100%; height: 75vh; min-height: 500px; border-radius: 10px; border: 2px solid #5a5a7a; box-shadow: inset 0 0 50px rgba(0,0,0,0.8); overflow: hidden; user-select: none; }
    
    .nh-power-overlay { position: absolute; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.9); z-index: 100; display:flex; flex-direction:column; justify-content:center; align-items:center; }
    .nh-power-btn { width: 150px; height: 150px; border-radius: 50%; background: radial-gradient(circle at 30% 30%, #f44, #900); border: 5px solid #fff; color: #fff; font-size: 1.5rem; font-weight: bold; cursor: pointer; box-shadow: 0 0 50px rgba(255,0,0,0.5); transition: 0.3s; text-transform: uppercase; }
    .nh-power-btn:hover { transform: scale(1.1); box-shadow: 0 0 80px rgba(255,0,0,0.8); background: radial-gradient(circle at 30% 30%, #ff5555, #c00); }
    .nh-power-btn:active { transform: scale(0.95); }

    .nh-svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; }
    .nh-cable { fill: none; stroke: #ffeb3b; stroke-width: 5; stroke-linecap: round; filter: drop-shadow(0 0 8px rgba(255,235,59,0.8)); }
    .nh-cable-anim { stroke-dasharray: 15 10; animation: cableFlow 0.5s linear infinite; }
    @keyframes cableFlow { to { stroke-dashoffset: -25; } }
    
    .nh-node { position: absolute; background: #2a2a35; border: 2px solid #4a4a5a; border-radius: 8px; box-shadow: 0 10px 20px rgba(0,0,0,0.5); width: 160px; padding: 10px; z-index: 10; color: #fff; cursor: grab; }
    .nh-node:active { cursor: grabbing; box-shadow: 0 5px 10px rgba(0,0,0,0.5); }
    .nh-title { font-size: 0.85rem; font-weight: bold; text-align: center; margin-bottom: 10px; border-bottom: 1px solid #4a4a5a; padding-bottom: 5px; color: #00E5FF; text-transform: uppercase; }
    
    .nh-port-wrap { display: flex; justify-content: space-between; align-items: center; margin: 10px 0; font-size: 0.8rem; }
    .nh-port { width: 18px; height: 18px; border-radius: 50%; background: #111; border: 3px solid #777; cursor: pointer; transition: 0.2s; position: relative; }
    .nh-port:hover { border-color: #fff; transform: scale(1.3); }
    .nh-port.connected { background: #ffeb3b; border-color: #fff; box-shadow: 0 0 15px #ffeb3b; }
    
    /* Active selection styling */
    .nh-port.nh-active-source { background: #ff9800; border-color: #fff; box-shadow: 0 0 20px #ff9800; animation: pulse 1s infinite alternate; }
    @keyframes pulse { to { transform: scale(1.3); box-shadow: 0 0 30px #ff9800; } }
    
    .nh-port-in { left: -8px; }
    .nh-port-out { right: -8px; }
    .nh-port-label { color: #aaa; pointer-events:none; }
    
    .nh-status { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); background: rgba(0,255,0,0.2); border: 1px solid #0f0; color: #0f0; padding: 10px 20px; border-radius: 5px; z-index: 20; display: none; text-shadow: 0 0 5px #0f0; font-weight: bold; letter-spacing: 2px; }
    
    .nh-help { position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 5px; font-size: 0.8rem; color: #ccc; z-index: 5; max-width: 250px; border: 1px solid #4a4a5a; }
  `;
  if(!document.getElementById('nhStyles')) {
      document.head.insertAdjacentHTML('beforeend', `<style id="nhStyles">${nhStyles}</style>`);
  }

  const nhHtml = `
    <section class="section ds-section" id="node-sec">
      <div class="section-header">
        <button class="chance-back-btn" style="position:absolute; top:20px; left:20px; z-index:100; cursor:pointer;" onclick="if(typeof dsGoToSection === 'function') dsGoToSection('hubPage', '')">◀ Ana Sayfa</button>
        <div class="section-badge" style="background:#1a1a24; color:#ffeb3b; border:1px solid #ffeb3b;">🔌 Analog Panel V3</div>
        <h2 class="section-title">Kablo Paneli</h2>
        <p class="section-sub">Düğümleri (Nodes) kablolarla bağla. Kendi müzik ve elektrik devreni yarat.</p>
      </div>
      
      <div class="nh-wrap" id="nhWrap">
         
         <div class="nh-power-overlay" id="nhPowerOverlay">
            <button class="nh-power-btn" onclick="nhPowerOn()">GÜÇ VER</button>
            <p style="color:#aaa; margin-top:20px;">Sistemin hoparlörlerini aktif etmek için tıklayın.</p>
         </div>

         <svg class="nh-svg" id="nhSvg"></svg>
         
         <div class="nh-help">
            <b style="color:#00E5FF">YENİ KONTROLLER</b><br><br>
            1. Çıkış deliğine (Sağ) <b>1 Kez Tıkla</b>.<br>
            2. Giriş deliğine (Sol) <b>1 Kez Tıkla</b>.<br>
            Kablo otomatik bağlanır!<br><br>
            <i>*Tüm kabloları sökmek için boşluğa çift tıkla.</i>
         </div>
         
         <div class="nh-status" id="nhStatus">SİNYAL BAŞARIYLA HOPARLÖRE ULAŞTI</div>
         
      </div>
    </section>
  `;
  document.body.insertAdjacentHTML('beforeend', nhHtml);

  // --- Logic ---
  let nhNodes = [
     { id: 'n1', type: 'osc', title: 'OSC (Güç Kaynağı)', x: 50, y: 50, out: [{id:'o1', label:'Kare Dalga Çıkışı'}] },
     { id: 'n4', type: 'delay', title: 'Uzay Yankısı (Delay)', x: 250, y: 50, in: [{id:'i1', label:'Giriş'}], out: [{id:'o1', label:'Çıkış'}] },
     { id: 'n5', type: 'dist', title: 'Bozulma (Distortion)', x: 50, y: 250, in: [{id:'i1', label:'Giriş'}], out: [{id:'o1', label:'Çıkış'}] },
     { id: 'n2', type: 'filter', title: 'Low-Pass Filtre', x: 250, y: 250, in: [{id:'i1', label:'Sinyal Girişi'}], out: [{id:'o2', label:'Filtreli Çıkış'}] },
     { id: 'n3', type: 'spk', title: 'HOPARLÖR (ANA ÇIKIŞ)', x: 500, y: 150, in: [{id:'i2', label:'Ses Girişi'}] }
  ];

  let nhCables = []; 
  let draggingNode = null;
  let activeSourcePort = null; // CLICK-TO-CONNECT feature
  let mousePos = { x: 0, y: 0 };
  let offset = { x: 0, y: 0 };
  let ac = null;
  let audioNodes = {};

  window.nhPowerOn = function() {
     document.getElementById('nhPowerOverlay').style.display = 'none';
     if(!ac) {
        try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){}
     }
     nhBuildAudioGraph();
  }

  function nhBuildAudioGraph() {
     if(!ac) return;
     
     // Stop existing
     for(let k in audioNodes) {
        if(audioNodes[k].osc) audioNodes[k].osc.stop();
        if(audioNodes[k].node) audioNodes[k].node.disconnect();
     }
     audioNodes = {};

     // n1: OSC
     let osc = ac.createOscillator();
     osc.type = 'square';
     osc.frequency.value = 110; // A2
     osc.start();
     audioNodes['n1'] = { osc: osc, out: osc };

     // n2: Filter
     let filter = ac.createBiquadFilter();
     filter.type = 'lowpass';
     filter.frequency.value = 600; 
     audioNodes['n2'] = { in: filter, out: filter };

     // n3: Speaker
     let masterGain = ac.createGain();
     masterGain.gain.value = 0.2;
     masterGain.connect(ac.destination);
     audioNodes['n3'] = { in: masterGain };

     // n4: Delay
     let delay = ac.createDelay();
     delay.delayTime.value = 0.4;
     let feedback = ac.createGain();
     feedback.gain.value = 0.4;
     delay.connect(feedback);
     feedback.connect(delay);
     audioNodes['n4'] = { in: delay, out: delay };

     // n5: Distortion
     let dist = ac.createWaveShaper();
     function makeDistortionCurve(amount) {
        let k = typeof amount === 'number' ? amount : 50,
            n_samples = 44100,
            curve = new Float32Array(n_samples),
            deg = Math.PI / 180,
            i = 0,
            x;
        for ( ; i < n_samples; ++i ) {
           x = i * 2 / n_samples - 1;
           curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
        }
        return curve;
     }
     dist.curve = makeDistortionCurve(400);
     dist.oversample = '4x';
     audioNodes['n5'] = { in: dist, out: dist };

     // Connect based on cables
     let connectedToSpeaker = false;
     nhCables.forEach(c => {
        let nFrom = audioNodes[c.fromNode];
        let nTo = audioNodes[c.toNode];
        if(nFrom && nTo && nFrom.out && nTo.in) {
           try { nFrom.out.connect(nTo.in); } catch(e){}
        }
        if(c.toNode === 'n3') connectedToSpeaker = true;
     });

     if(connectedToSpeaker && nhCables.length > 0) {
        document.getElementById('nhStatus').style.display = 'block';
     } else {
        document.getElementById('nhStatus').style.display = 'none';
     }
  }

  function nhRender() {
     let wrap = document.getElementById('nhWrap');
     document.querySelectorAll('.nh-node').forEach(el => el.remove());
     
     nhNodes.forEach(n => {
        let el = document.createElement('div');
        el.className = 'nh-node';
        el.id = n.id;
        el.style.left = n.x + 'px';
        el.style.top = n.y + 'px';
        
        let html = `<div class="nh-title">${n.title}</div>`;
        
        if(n.in) {
           n.in.forEach(p => {
              html += `<div class="nh-port-wrap">
                 <div class="nh-port nh-port-in" id="port_${n.id}_${p.id}" data-node="${n.id}" data-port="${p.id}" data-type="in"></div>
                 <div class="nh-port-label">${p.label}</div>
                 <div></div>
              </div>`;
           });
        }
        
        if(n.out) {
           n.out.forEach(p => {
              html += `<div class="nh-port-wrap">
                 <div></div>
                 <div class="nh-port-label">${p.label}</div>
                 <div class="nh-port nh-port-out" id="port_${n.id}_${p.id}" data-node="${n.id}" data-port="${p.id}" data-type="out"></div>
              </div>`;
           });
        }
        
        el.innerHTML = html;
        wrap.appendChild(el);

        // Node dragging
        el.addEventListener('mousedown', (e) => {
           if(e.target.classList.contains('nh-port')) return; 
           draggingNode = n;
           let rect = el.getBoundingClientRect();
           offset.x = e.clientX - rect.left;
           offset.y = e.clientY - rect.top;
           document.querySelectorAll('.nh-node').forEach(n => n.style.zIndex = '10');
           el.style.zIndex = '11';
        });
     });

     // CLICK-TO-CONNECT Port interactions
     document.querySelectorAll('.nh-port').forEach(port => {
        port.addEventListener('click', (e) => {
           e.stopPropagation();
           let type = port.getAttribute('data-type');
           
           if(type === 'out') {
               // First click: Select source
               activeSourcePort = {
                   node: port.getAttribute('data-node'),
                   port: port.getAttribute('data-port'),
                   el: port
               };
               if(typeof aeAudio !== 'undefined') aeAudio.playOsc('sine', 1500, 0.1, 0.05);
               nhDrawCables();
           } 
           else if(type === 'in' && activeSourcePort) {
               // Second click: Select target & Connect
               let targetNode = port.getAttribute('data-node');
               let targetPort = port.getAttribute('data-port');
               
               // Remove any existing connection to this target port
               nhCables = nhCables.filter(c => !(c.toNode === targetNode && c.toPort === targetPort));
               
               nhCables.push({
                   fromNode: activeSourcePort.node,
                   fromPort: activeSourcePort.port,
                   toNode: targetNode,
                   toPort: targetPort
               });
               
               activeSourcePort = null;
               nhBuildAudioGraph();
               nhDrawCables();
               if(typeof aeAudio !== 'undefined') aeAudio.playOsc('sine', 2000, 0.2, 0.1);
           }
        });
     });

     nhDrawCables();
  }

  function nhDrawCables() {
     let svg = document.getElementById('nhSvg');
     let wrapRect = document.getElementById('nhWrap').getBoundingClientRect();
     svg.innerHTML = '';
     
     document.querySelectorAll('.nh-port').forEach(p => {
        p.classList.remove('connected');
        p.classList.remove('nh-active-source');
     });

     // Draw active source port glow
     if(activeSourcePort) {
         activeSourcePort.el.classList.add('nh-active-source');
         
         // Draw temporary moving cable
         let r1 = activeSourcePort.el.getBoundingClientRect();
         let x1 = r1.left + 9 - wrapRect.left; let y1 = r1.top + 9 - wrapRect.top;
         let x2 = mousePos.x; let y2 = mousePos.y;
         
         let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
         let ctrl = Math.abs(x2 - x1) * 0.5;
         path.setAttribute('d', `M ${x1} ${y1} C ${x1 + ctrl} ${y1}, ${x2 - ctrl} ${y2}, ${x2} ${y2}`);
         path.setAttribute('class', 'nh-cable');
         path.setAttribute('stroke-dasharray', '5,5');
         svg.appendChild(path);
     }

     // Drawn static cables
     nhCables.forEach(c => {
        let p1 = document.getElementById(`port_${c.fromNode}_${c.fromPort}`);
        let p2 = document.getElementById(`port_${c.toNode}_${c.toPort}`);
        if(p1 && p2) {
           p1.classList.add('connected');
           p2.classList.add('connected');
           let r1 = p1.getBoundingClientRect();
           let r2 = p2.getBoundingClientRect();
           let x1 = r1.left + 9 - wrapRect.left; let y1 = r1.top + 9 - wrapRect.top;
           let x2 = r2.left + 9 - wrapRect.left; let y2 = r2.top + 9 - wrapRect.top;
           
           let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
           let ctrl = Math.abs(x2 - x1) * 0.5;
           path.setAttribute('d', `M ${x1} ${y1} C ${x1 + ctrl} ${y1}, ${x2 - ctrl} ${y2}, ${x2} ${y2}`);
           path.setAttribute('class', 'nh-cable nh-cable-anim');
           svg.appendChild(path);
        }
     });
  }

  document.getElementById('nhWrap').addEventListener('mousemove', (e) => {
     let wrapRect = document.getElementById('nhWrap').getBoundingClientRect();
     mousePos.x = e.clientX - wrapRect.left;
     mousePos.y = e.clientY - wrapRect.top;
     
     if(draggingNode) {
        draggingNode.x = e.clientX - wrapRect.left - offset.x;
        draggingNode.y = e.clientY - wrapRect.top - offset.y;
        document.getElementById(draggingNode.id).style.left = draggingNode.x + 'px';
        document.getElementById(draggingNode.id).style.top = draggingNode.y + 'px';
     }
     
     // Update active cable drawing on mouse move if activeSourcePort exists
     if(activeSourcePort || draggingNode) {
         nhDrawCables();
     }
  });

  document.getElementById('nhWrap').addEventListener('mouseup', () => {
     draggingNode = null;
  });
  
  // Clear selection on background click
  document.getElementById('nhWrap').addEventListener('click', (e) => {
     if(e.target.id === 'nhSvg' || e.target.id === 'nhWrap') {
         if(activeSourcePort) {
             activeSourcePort = null; // cancel active cable
             nhDrawCables();
         }
     }
  });

  // Clear ALL cables on double click background
  document.getElementById('nhWrap').addEventListener('dblclick', (e) => {
     if(e.target.id === 'nhSvg' || e.target.id === 'nhWrap') {
        nhCables = [];
        activeSourcePort = null;
        nhBuildAudioGraph();
        nhDrawCables();
     }
  });

  // Init UI
  nhRender();

} catch(e) { console.error('Node Hacker V3 error', e); }
