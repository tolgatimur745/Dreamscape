/* =========================================================
   CYBER SPY V3 (Hacker Terminal Simulation)
   Keyboard-only interactive terminal with Matrix & Content Expansion.
========================================================= */
try {
  const csStyles = `
    .cs-wrap { font-family: 'Courier New', Courier, monospace; background-color: #050505; color: #0f0; position: relative; width: 100%; height: 65vh; min-height: 450px; border-radius: 10px; border: 2px solid #0f0; overflow: hidden; padding: 20px; box-shadow: 0 0 20px rgba(0,255,0,0.2) inset; text-align: left; display:flex; flex-direction:column; cursor: text; }
    
    .cs-matrix-bg { position: absolute; top:0; left:0; width:100%; height:100%; opacity: 0.15; pointer-events: none; z-index: 1; }
    .cs-scanline { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.3)); background-size: 100% 4px; z-index: 10; pointer-events: none; animation: scanline 10s linear infinite; }
    @keyframes scanline { 0% { background-position: 0 0; } 100% { background-position: 0 100%; } }
    
    .cs-output { flex: 1; overflow-y: auto; white-space: pre-wrap; word-wrap: break-word; font-size: 1.1rem; line-height: 1.5; padding-bottom: 20px; z-index: 5; scrollbar-width: none; }
    .cs-output::-webkit-scrollbar { display: none; }
    .cs-input-line { display: flex; align-items: center; z-index: 5; margin-top:10px; }
    .cs-prompt { color: #0f0; font-weight: bold; margin-right: 10px; white-space: nowrap; }
    .cs-input { flex: 1; background: transparent; border: none; color: #0f0; font-family: 'Courier New', Courier, monospace; font-size: 1.1rem; outline: none; caret-color: transparent; }
    .cs-cursor { display: inline-block; width: 10px; height: 1.1rem; background: #0f0; animation: blink 1s step-end infinite; vertical-align: middle; margin-left: 2px; }
    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
    
    .cs-glow { text-shadow: 0 0 5px #0f0; }
    .cs-err { color: #f44; text-shadow: 0 0 5px #f44; }
    .cs-sys { color: #00E5FF; text-shadow: 0 0 5px #00E5FF; }
    .cs-warn { color: #ffeb3b; text-shadow: 0 0 5px #ffeb3b; }
    
    .cs-glitch { animation: glitchAnim 0.2s cubic-bezier(.25, .46, .45, .94) both infinite; }
    @keyframes glitchAnim { 0% { transform: translate(0) } 20% { transform: translate(-2px, 2px) } 40% { transform: translate(-2px, -2px) } 60% { transform: translate(2px, 2px) } 80% { transform: translate(2px, -2px) } 100% { transform: translate(0) } }
  `;
  if(!document.getElementById('csStyles')) {
      document.head.insertAdjacentHTML('beforeend', `<style id="csStyles">${csStyles}</style>`);
  }

  const csHtml = `
    <section class="section ds-section" id="cyber-sec">
      <div class="section-header">
        <button class="chance-back-btn" style="position:absolute; top:20px; left:20px; z-index:100; cursor:pointer;" onclick="if(typeof dsGoToSection === 'function') dsGoToSection('hubPage', '')">◀ Ana Sayfa</button>
        <div class="section-badge" style="background:#050505; color:#0f0; border:1px solid #0f0;">💻 Terminal OS</div>
        <h2 class="section-title">Siber Casus</h2>
        <p class="section-sub">DREAM_OS v3.0. Sadece klavyeni kullan. Hedefteki IP adreslerini tara ve sistemlere sız.</p>
      </div>
      
      <div class="cs-wrap" id="csContainer" onclick="document.getElementById('csCmdInput').focus()">
         <canvas class="cs-matrix-bg" id="csMatrixCanvas"></canvas>
         <div class="cs-scanline"></div>
         <div class="cs-output" id="csOutput"></div>
         <div class="cs-input-line" id="csInputLine">
            <span class="cs-prompt" id="csPrompt">root@dreamos:~$</span>
            <input type="text" id="csCmdInput" class="cs-input" autocomplete="off" spellcheck="false" autofocus>
            <div class="cs-cursor" id="csFakeCursor"></div>
         </div>
      </div>
    </section>
  `;
  document.body.insertAdjacentHTML('beforeend', csHtml);

  // --- Logic ---
  let csState = {
     connectedIp: null,
     cracked: false
  };

  const CS_DATA = {
     intro: `[ SİSTEM BAŞLATILDI ]\nHoş geldin Ajan.\nGörevimiz: OMNICORP ağına sızmak ve gizli belgeleri ele geçirmek.\nNe yapacağını bilmiyorsan, komut listesini görmek için 'help' yaz ve Enter'a bas.`,
     help: `[ KULLANILABİLİR KOMUTLAR ]\n-------------------------------------------------\n help    : Bu rehberi gösterir.\n clear   : Ekranı temizler.\n scan    : Ağdaki açık ve kapalı cihazları IP adresleriyle listeler.\n connect : Bir hedefe bağlanır. Kullanım: connect [IP_ADRESI]\n crack   : Bağlı olunan sistemin güvenlik duvarını aşar.\n read    : Kırılmış bir sistemdeki gizli dosyaları okur.\n exit    : Bağlantıyı keser ve kendi cihazına döner.\n-------------------------------------------------`,
     scan: `Ağ taranıyor...\nLütfen bekleyin...\n[!] 3 cihaz bulundu:\n - [192.168.1.50] : Yeraltı Tesisi Router'ı (Admin Yetkisi Gerektirir)\n - [192.168.1.88] : OMNICORP Kafeterya - Misafir Ağı (Şifresiz)\n - [192.168.1.104]: OMNICORP_SECURE_NODE (Korumalı, Ana Hedef)`,
     
     // Data per IP
     nodes: {
        "192.168.1.50": {
           name: "router_admin", prompt: "admin@router", color: "#ff9800", requiresCrack: false,
           welcome: "[ BAĞLANTI KURULDU: 192.168.1.50 ]\nSistem: Cisco v9.1\nDosyaları okumak için 'read' komutunu kullanın.",
           data: "HATA: Okuma yetkiniz yok.\nLütfen fiziksel admin anahtarını cihaza takın veya sistem yöneticisine başvurun.\nBu cihaz uzaktan okumaya kapalıdır."
        },
        "192.168.1.88": {
           name: "guest_wifi", prompt: "guest@cafe", color: "#4CAF50", requiresCrack: false,
           welcome: "[ BAĞLANTI KURULDU: 192.168.1.88 ]\nSistem: OMNICORP Kafeterya Misafir Ağı\nGüvenlik: DEVRE DIŞI\nDosyaları okumak için 'read' komutunu kullanın.",
           data: "KAFETERYA LOGLARI:\n[Ahmet]: Bugün çıkan etli nohut harikaydı.\n[Ceren]: Yahu yine kahve makinesi bozuk, kim bu SECURE_NODE'daki şifreleri değiştirip duruyor? 104 numaralı odadan garip sesler geliyor.\n[Hakan]: Uyarıyorum, o odaya (192.168.1.104) yetkisiz girmeyin, içerideki 'Proje' test ediliyor. Çok tehlikeli."
        },
        "192.168.1.104": {
           name: "omnicorp_secure", prompt: "sysadmin@omni", color: "#f44", requiresCrack: true,
           welcome: "[ BAĞLANTI KURULDU: 192.168.1.104 ]\nUYARI: SISTEM KORUMASI AKTIF. Verilere ulaşmak için 'crack' komutu ile güvenlik duvarını aşmanız gereklidir.",
           data: "======================================\nGİZLİ BELGE_X91 (ÇOK GİZLİ)\n======================================\nOmniCorp, \"Project Neon\"u başarıyla başlattı.\nKozmik Terraformer testleri sırasında mutasyona uğramış otonom bir yapay zeka parçası tespit edildi.\nProtokol: \"Eğer AI bilinç kazanırsa, tüm DreamScape ağını imha et.\"\n\nNot: Bu dosyayı okuyan kişi tespit edilirse derhal bağlantısı kesilecek.\n\n[ SİSTEM UYARISI: İZİNSİZ ERİŞİM TESPİT EDİLDİ! ]\n[ BAĞLANTI KESİLİYOR... ]"
        }
     }
  };

  let csOut = document.getElementById('csOutput');
  let csInp = document.getElementById('csCmdInput');
  let isTyping = false;

  // Matrix BG
  const c = document.getElementById('csMatrixCanvas');
  const ctx = c.getContext('2d');
  c.width = window.innerWidth || 800;
  c.height = 600;
  let matrixChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%""\'#&_(),.;:?!\\|{}<>[]^~'.split('');
  let fontSize = 14;
  let columns = c.width / fontSize;
  let drops = [];
  for(let x = 0; x < columns; x++) drops[x] = 1;

  function drawMatrix() {
     ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
     ctx.fillRect(0, 0, c.width, c.height);
     ctx.fillStyle = '#0F0';
     ctx.font = fontSize + 'px monospace';
     for(let i = 0; i < drops.length; i++) {
        let text = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if(drops[i] * fontSize > c.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
     }
  }
  setInterval(drawMatrix, 33);

  function resetConnection() {
      csState.connectedIp = null;
      csState.cracked = false;
      document.getElementById('csPrompt').textContent = `root@dreamos:~$`;
      document.getElementById('csPrompt').style.color = '#0f0';
      document.getElementById('csFakeCursor').style.background = '#0f0';
  }

  function csPrint(text, cssClass='cs-glow', speed=15, callback=null) {
     isTyping = true;
     csInp.disabled = true;
     document.getElementById('csInputLine').style.opacity = '0';
     
     let span = document.createElement('span');
     span.className = cssClass;
     csOut.appendChild(span);
     csOut.appendChild(document.createTextNode('\n'));
     
     let i = 0;
     let interval = setInterval(() => {
        span.textContent += text.charAt(i);
        i++;
        csOut.scrollTop = csOut.scrollHeight;
        
        if(typeof aeAudio !== 'undefined') {
           if(Math.random() > 0.6) aeAudio.playOsc('square', 600 + Math.random()*400, 0.01, 0.02);
        }
        
        if(i >= text.length) {
           clearInterval(interval);
           isTyping = false;
           csInp.disabled = false;
           csInp.value = '';
           document.getElementById('csInputLine').style.opacity = '1';
           csInp.focus();
           if(callback) callback();
        }
     }, speed);
  }

  function csExecuteCommand(cmdStr) {
     if(isTyping) return;
     let args = cmdStr.trim().split(' ');
     let cmd = args[0].toLowerCase();
     
     let echo = document.createElement('div');
     echo.innerHTML = `<span class="cs-prompt">${document.getElementById('csPrompt').textContent}</span> <span class="cs-glow">${cmdStr}</span>`;
     csOut.appendChild(echo);
     csOut.scrollTop = csOut.scrollHeight;

     if(cmd === '') return;

     switch(cmd) {
        case 'help':
           csPrint(CS_DATA.help, 'cs-sys', 5); break;
        case 'clear':
           csOut.innerHTML = ''; break;
        case 'scan':
           csPrint(CS_DATA.scan, 'cs-warn', 15); break;
        case 'exit':
           if(csState.connectedIp) {
              csPrint("Bağlantı kesildi.", 'cs-glow', 10, resetConnection);
           } else {
              csPrint("Zaten yerel sistemdesiniz.", 'cs-err', 10);
           }
           break;
        case 'connect':
           if(args.length < 2) { csPrint("Hata: IP adresi eksik. Kullanım: connect [IP_ADRESI]", 'cs-err', 10); break; }
           let ip = args[1];
           if(CS_DATA.nodes[ip]) {
              csState.connectedIp = ip;
              csState.cracked = false;
              let node = CS_DATA.nodes[ip];
              document.getElementById('csPrompt').textContent = node.prompt + `:~$`;
              document.getElementById('csPrompt').style.color = node.color;
              document.getElementById('csFakeCursor').style.background = node.color;
              
              csPrint(node.welcome, 'cs-warn', 15);
           } else {
              csPrint(`Bağlantı başarısız. Hedef ${ip} ağda bulunamadı veya erişim reddedildi. Lütfen 'scan' listesindeki IP'lerden birini deneyin.`, 'cs-err', 10);
           }
           break;
        case 'crack':
           if(!csState.connectedIp) { csPrint("Önce bir sisteme bağlanmalısınız (connect [IP]).", 'cs-err', 10); break; }
           
           let currNodeC = CS_DATA.nodes[csState.connectedIp];
           if(!currNodeC.requiresCrack) {
               csPrint("Bu sistemde güvenlik duvarı yok. Kırma işlemine gerek yok, doğrudan 'read' komutunu kullanabilirsiniz.", 'cs-glow', 10); 
               break; 
           }

           if(csState.cracked) { csPrint("Güvenlik duvarı zaten aşıldı.", 'cs-glow', 10); break; }
           
           csPrint("Brute-force (Kaba Kuvvet) saldırısı başlatıldı...\n0x9F2A -> BAŞARISIZ\n0x1A4B -> BAŞARISIZ\n0x77DA -> BAŞARISIZ\n0x00FF -> BAŞARILI!\nŞifreleme çözüldü. Dosyalara erişim için 'read' komutunu kullanın.", 'cs-sys', 30, () => {
              csState.cracked = true;
           });
           break;
        case 'read':
           if(!csState.connectedIp) { csPrint("Herhangi bir hedefe bağlı değilsiniz.", 'cs-err', 10); break; }
           
           let currNodeR = CS_DATA.nodes[csState.connectedIp];

           if(currNodeR.requiresCrack && !csState.cracked) { 
               csPrint("Erişim engellendi. Güvenlik duvarını aşmak için 'crack' komutu gereklidir.", 'cs-err', 10); 
               break; 
           }
           
           // Glitch effect on screen while reading
           document.getElementById('csContainer').classList.add('cs-glitch');
           csPrint(currNodeR.data, 'cs-warn', 30, () => {
              setTimeout(() => {
                 document.getElementById('csContainer').classList.remove('cs-glitch');
                 // If it's the secure node, force disconnect
                 if(csState.connectedIp === "192.168.1.104") {
                     csPrint("Bağlantı zorla kesildi. İzinler sıfırlandı.", 'cs-err', 10, resetConnection);
                 }
              }, 3000);
           });
           break;
        default:
           csPrint(`Komut tanımlanamadı: '${cmd}'. Geçerli komutları görmek için 'help' yazın.`, 'cs-err', 5);
     }
  }

  csInp.addEventListener('keydown', function(e) {
     if(e.key === 'Enter') {
        let val = this.value;
        this.value = '';
        csExecuteCommand(val);
     }
  });

  // Keep focus when clicking inside
  document.getElementById('csContainer').addEventListener('click', () => {
     csInp.focus();
  });

  // Init
  setTimeout(() => {
     csPrint(CS_DATA.intro, 'cs-glow', 25);
  }, 500);

} catch(e) { console.error('Cyber Spy V3 error', e); }
