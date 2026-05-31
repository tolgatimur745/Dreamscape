// --- CHANCE GAMES LOGIC ---
const CHANCE_DEFAULT_BALANCE = 5000;
window.chanceBalance = parseInt(localStorage.getItem('chanceHavenBalance')) || CHANCE_DEFAULT_BALANCE;

window.updateChanceBalanceDisplay = function() {
  const el = document.getElementById('navBalanceAmount');
  if(el) el.textContent = window.chanceBalance;
};

window.setChanceBalance = function(amount) {
  const oldBalance = window.chanceBalance;
  window.chanceBalance = amount;
  localStorage.setItem('chanceHavenBalance', window.chanceBalance);
  updateChanceBalanceDisplay();
  
  const el = document.getElementById('navBalance');
  if(el) {
    if (window.chanceBalance > oldBalance) {
      el.style.color = 'var(--a4)'; // win color
      setTimeout(() => el.style.color = '', 500);
    } else if (window.chanceBalance < oldBalance) {
      el.style.color = 'var(--a2)'; // lose color
      setTimeout(() => el.style.color = '', 500);
    }
  }
};

window.updateChanceBalance = function(amount) {
  setChanceBalance(window.chanceBalance + amount);
};

// Listen for reset clicks on nav balance
document.addEventListener('DOMContentLoaded', () => {
  const navBalance = document.getElementById('navBalance');
  if(navBalance) {
    navBalance.addEventListener('click', () => {
      if(confirm('Bakiyenizi 5000 olarak sıfırlamak istediğinize emin misiniz?')) {
        setChanceBalance(CHANCE_DEFAULT_BALANCE);
      }
    });
  }
  updateChanceBalanceDisplay();
});

// Helper functions
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createGameUI(title, desc, hasBet = true) {
  const wrapper = document.createElement('div');
  wrapper.className = 'chance-game-wrapper';
  
  let betHtml = '';
  if(hasBet) {
    betHtml = `
      <div class="chance-bet-controls">
        <button class="chance-bet-btn" id="cgBetMinus">-</button>
        <input type="number" id="cgBetAmount" class="chance-bet-input" value="10" min="10" step="10">
        <button class="chance-bet-btn" id="cgBetPlus">+</button>
      </div>
    `;
  }

  wrapper.innerHTML = `
    <button class="chance-back-btn" onclick="closeChanceGame()">⬅ Menüye Dön</button>
    <div class="chance-game-inner">
      <h2 class="chance-game-title">${title}</h2>
      <p class="chance-game-desc">${desc}</p>
      ${betHtml}
      <div id="cgSpecificArea" style="width:100%; display:flex; flex-direction:column; align-items:center;"></div>
      <div id="cgMsg" class="chance-game-message"></div>
    </div>
  `;
  return wrapper;
}

function setupBetControls(container) {
  const betInput = container.querySelector('#cgBetAmount');
  if(!betInput) return null;
  container.querySelector('#cgBetMinus').addEventListener('click', () => {
    let val = parseInt(betInput.value) || 0;
    if(val > 10) betInput.value = val - 10;
  });
  container.querySelector('#cgBetPlus').addEventListener('click', () => {
    let val = parseInt(betInput.value) || 0;
    betInput.value = val + 10;
  });
  return betInput;
}

function showCgMsg(container, msg, type = '') {
  const msgEl = container.querySelector('#cgMsg');
  msgEl.textContent = msg;
  msgEl.className = 'chance-game-message ' + type;
}

window.openChanceGame = function(gameId) {
  document.getElementById('chanceGameMenu').style.display = 'none';
  const container = document.getElementById('chanceGameContainer');
  container.style.display = 'flex';
  container.innerHTML = '';
  
  if (window.ChanceGames && window.ChanceGames[gameId]) {
    window.ChanceGames[gameId].init(container);
  }
};

window.closeChanceGame = function() {
  document.getElementById('chanceGameContainer').style.display = 'none';
  document.getElementById('chanceGameContainer').innerHTML = '';
  document.getElementById('chanceGameMenu').style.display = '';
};

window.ChanceGames = {};

// 1. COIN FLIP
window.ChanceGames.coinflip = {
  init: function(container) {
    const ui = createGameUI('Yazı Tura', 'Bahsini koy ve tarafını seç. (2x Kazanç)');
    container.appendChild(ui);
    const betInput = setupBetControls(ui);
    const spec = ui.querySelector('#cgSpecificArea');
    
    spec.innerHTML = `
      <div style="display:flex; gap:10px; margin-bottom:1rem;">
        <button class="chance-choice-btn selected" data-choice="heads">Yazı (Heads)</button>
        <button class="chance-choice-btn" data-choice="tails">Tura (Tails)</button>
      </div>
      <div class="cg-coin-container" style="perspective:1000px; margin:2rem 0; width:150px; height:150px;">
        <div class="cg-coin" id="cgCoinEl" style="width:100%; height:100%; position:relative; transform-style:preserve-3d; transition:transform 3s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
          <div style="position:absolute; width:100%; height:100%; border-radius:50%; backface-visibility:hidden; display:flex; align-items:center; justify-content:center; font-size:4rem; border:5px solid #d4af37; background:linear-gradient(135deg, #f9f295, #e0aa3e); color:#8a6327;">👑</div>
          <div style="position:absolute; width:100%; height:100%; border-radius:50%; backface-visibility:hidden; display:flex; align-items:center; justify-content:center; font-size:4rem; border:5px solid #8c8c8c; background:linear-gradient(135deg, #e6e6e6, #a6a6a6); color:#4d4d4d; transform:rotateY(180deg);">🦅</div>
        </div>
      </div>
      <button class="chance-action-btn" id="cgFlipBtn">Parayı At</button>
    `;
    
    let selected = 'heads';
    const choiceBtns = spec.querySelectorAll('.chance-choice-btn');
    choiceBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        choiceBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selected = btn.getAttribute('data-choice');
      });
    });

    const flipBtn = spec.querySelector('#cgFlipBtn');
    const coinEl = spec.querySelector('#cgCoinEl');

    flipBtn.addEventListener('click', () => {
      const bet = parseInt(betInput.value);
      if(bet > window.chanceBalance || bet <= 0) return showCgMsg(ui, 'Yetersiz bakiye veya geçersiz bahis!', 'lose');
      
      flipBtn.disabled = true;
      window.updateChanceBalance(-bet);
      showCgMsg(ui, 'Para havada...', '');
      
      coinEl.style.transition = 'none';
      coinEl.style.transform = 'rotateY(0deg)';
      void coinEl.offsetWidth; 
      
      const isHeads = Math.random() > 0.5;
      coinEl.style.transition = 'transform 3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      coinEl.style.transform = isHeads ? 'rotateY(3600deg)' : 'rotateY(3780deg)';
      
      setTimeout(() => {
        const resultStr = isHeads ? 'heads' : 'tails';
        if(selected === resultStr) {
          const win = bet * 2;
          window.updateChanceBalance(win);
          showCgMsg(ui, `Tebrikler! ${isHeads ? 'Yazı' : 'Tura'} geldi. +${win}`, 'win');
        } else {
          showCgMsg(ui, `Maalesef ${isHeads ? 'Yazı' : 'Tura'} geldi.`, 'lose');
        }
        flipBtn.disabled = false;
      }, 3000);
    });
  }
};

// 2. DICE ROLL
window.ChanceGames.diceroll = {
  init: function(container) {
    const ui = createGameUI('Zar Atma', 'İki zarın toplamını tahmin et. 7 Altı (2x), 7 Üstü (2x) veya Tam 7 (5x).');
    container.appendChild(ui);
    const betInput = setupBetControls(ui);
    const spec = ui.querySelector('#cgSpecificArea');
    
    spec.innerHTML = `
      <div style="display:flex; gap:10px; margin-bottom:1rem;">
        <button class="chance-choice-btn selected" data-choice="under">7 Altı (2x)</button>
        <button class="chance-choice-btn" data-choice="exact">Tam 7 (5x)</button>
        <button class="chance-choice-btn" data-choice="over">7 Üstü (2x)</button>
      </div>
      <div style="display:flex; gap:20px; margin:2rem 0;">
        <div class="cg-dice" id="cgDice1" style="width:80px; height:80px; background:#fff; border-radius:15px; display:flex; align-items:center; justify-content:center; font-size:4rem; color:#111;">🎲</div>
        <div class="cg-dice" id="cgDice2" style="width:80px; height:80px; background:#fff; border-radius:15px; display:flex; align-items:center; justify-content:center; font-size:4rem; color:#111;">🎲</div>
      </div>
      <button class="chance-action-btn" id="cgRollBtn">Zarları At</button>
    `;
    
    let selected = 'under';
    const choiceBtns = spec.querySelectorAll('.chance-choice-btn');
    choiceBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        choiceBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selected = btn.getAttribute('data-choice');
      });
    });

    const rollBtn = spec.querySelector('#cgRollBtn');
    const dice1 = spec.querySelector('#cgDice1');
    const dice2 = spec.querySelector('#cgDice2');
    const diceFaces = ['⚀','⚁','⚂','⚃','⚄','⚅'];

    rollBtn.addEventListener('click', () => {
      const bet = parseInt(betInput.value);
      if(bet > window.chanceBalance || bet <= 0) return showCgMsg(ui, 'Yetersiz bakiye!', 'lose');
      
      rollBtn.disabled = true;
      window.updateChanceBalance(-bet);
      showCgMsg(ui, 'Zarlar atılıyor...');
      
      let rolls = 0;
      let anim = setInterval(() => {
        dice1.textContent = diceFaces[randomInt(0,5)];
        dice2.textContent = diceFaces[randomInt(0,5)];
        dice1.style.transform = `rotate(${randomInt(-20,20)}deg)`;
        dice2.style.transform = `rotate(${randomInt(-20,20)}deg)`;
        rolls++;
        if(rolls > 15) {
          clearInterval(anim);
          const d1 = randomInt(1, 6);
          const d2 = randomInt(1, 6);
          const sum = d1 + d2;
          dice1.textContent = diceFaces[d1-1];
          dice2.textContent = diceFaces[d2-1];
          dice1.style.transform = `rotate(0deg)`;
          dice2.style.transform = `rotate(0deg)`;
          
          let won = false; let payout = 0;
          if (selected === 'under' && sum < 7) { won = true; payout = bet * 2; }
          else if (selected === 'over' && sum > 7) { won = true; payout = bet * 2; }
          else if (selected === 'exact' && sum === 7) { won = true; payout = bet * 5; }
          
          if(won) {
            window.updateChanceBalance(payout);
            showCgMsg(ui, `Toplam: ${sum}. Kazandınız! +${payout}`, 'win');
          } else {
            showCgMsg(ui, `Toplam: ${sum}. Kaybettiniz.`, 'lose');
          }
          rollBtn.disabled = false;
        }
      }, 50);
    });
  }
};

// 3. SLOT MACHINE
window.ChanceGames.slot = {
  init: function(container) {
    const ui = createGameUI('Slot Makinesi', '3 sembolü eşleştir (3 lü = 10x, 2 li = 2x)');
    container.appendChild(ui);
    const betInput = setupBetControls(ui);
    const spec = ui.querySelector('#cgSpecificArea');
    
    spec.innerHTML = `
      <div style="display:flex; gap:15px; background:rgba(0,0,0,0.5); padding:20px; border-radius:20px; border:2px solid rgba(255,255,255,0.1); margin-bottom:2rem; box-shadow:inset 0 0 30px rgba(0,0,0,0.8);">
        <div style="width:100px; height:120px; background:#fff; border-radius:10px; overflow:hidden; position:relative;">
          <div id="cgReel1" style="position:absolute; top:0; width:100%; display:flex; flex-direction:column; font-size:4rem;"></div>
        </div>
        <div style="width:100px; height:120px; background:#fff; border-radius:10px; overflow:hidden; position:relative;">
          <div id="cgReel2" style="position:absolute; top:0; width:100%; display:flex; flex-direction:column; font-size:4rem;"></div>
        </div>
        <div style="width:100px; height:120px; background:#fff; border-radius:10px; overflow:hidden; position:relative;">
          <div id="cgReel3" style="position:absolute; top:0; width:100%; display:flex; flex-direction:column; font-size:4rem;"></div>
        </div>
      </div>
      <button class="chance-action-btn" id="cgSpinBtn">Çevir</button>
    `;
    
    const spinBtn = spec.querySelector('#cgSpinBtn');
    const symbols = ['🍒', '🍋', '🍉', '⭐', '💎', '7️⃣'];
    const reels = [spec.querySelector('#cgReel1'), spec.querySelector('#cgReel2'), spec.querySelector('#cgReel3')];
    
    reels.forEach(reel => {
      let html = '';
      for(let i=0; i<30; i++) html += `<div style="height:120px; display:flex; align-items:center; justify-content:center">${symbols[randomInt(0, symbols.length-1)]}</div>`;
      reel.innerHTML = html;
    });

    spinBtn.addEventListener('click', () => {
      const bet = parseInt(betInput.value);
      if(bet > window.chanceBalance || bet <= 0) return showCgMsg(ui, 'Yetersiz bakiye!', 'lose');
      
      spinBtn.disabled = true;
      window.updateChanceBalance(-bet);
      showCgMsg(ui, 'Dönüyor...');
      
      let results = [];
      reels.forEach((reel, index) => {
        reel.style.transition = 'none';
        reel.style.top = '0px';
        void reel.offsetWidth;
        
        const targetIdx = randomInt(20, 28);
        const resultSym = symbols[randomInt(0, symbols.length-1)];
        reel.children[targetIdx].textContent = resultSym;
        results.push(resultSym);
        
        reel.style.transition = `top ${2 + index * 0.5}s cubic-bezier(0.15, 0.85, 0.35, 1)`;
        reel.style.top = `-${targetIdx * 120}px`;
      });
      
      setTimeout(() => {
        let unique = new Set(results).size;
        if(unique === 1) {
          const win = bet * 10;
          window.updateChanceBalance(win);
          showCgMsg(ui, `BÜYÜK İKRAMİYE! +${win}`, 'win');
        } else if(unique === 2) {
          const win = bet * 2;
          window.updateChanceBalance(win);
          showCgMsg(ui, `İkili eşleşme! +${win}`, 'win');
        } else {
          showCgMsg(ui, `Eşleşme yok.`, 'lose');
        }
        spinBtn.disabled = false;
      }, 3000);
    });
  }
};

// 4. ROULETTE
window.ChanceGames.roulette = {
  init: function(container) {
    const ui = createGameUI('Rulet', 'Siyah (2x), Kırmızı (2x) veya Yeşil (14x) seçin.');
    container.appendChild(ui);
    const betInput = setupBetControls(ui);
    const spec = ui.querySelector('#cgSpecificArea');
    
    spec.innerHTML = `
      <div style="display:flex; gap:10px; margin-bottom:1rem;">
        <button class="chance-choice-btn selected" data-choice="red" style="color:#ff5252;">Kırmızı</button>
        <button class="chance-choice-btn" data-choice="black" style="color:#aaa;">Siyah</button>
        <button class="chance-choice-btn" data-choice="green" style="color:#69f0ae;">Yeşil (0)</button>
      </div>
      <div id="cgRouletteResult" style="font-size: 5rem; margin: 1rem 0; font-weight:800; min-height:100px;">?</div>
      <button class="chance-action-btn" id="cgRouletteBtn">Çarkı Çevir</button>
    `;
    
    let selected = 'red';
    const choiceBtns = spec.querySelectorAll('.chance-choice-btn');
    choiceBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        choiceBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selected = btn.getAttribute('data-choice');
      });
    });

    const spinBtn = spec.querySelector('#cgRouletteBtn');
    const resultEl = spec.querySelector('#cgRouletteResult');
    
    spinBtn.addEventListener('click', () => {
      const bet = parseInt(betInput.value);
      if(bet > window.chanceBalance || bet <= 0) return showCgMsg(ui, 'Yetersiz bakiye!', 'lose');
      
      spinBtn.disabled = true;
      window.updateChanceBalance(-bet);
      showCgMsg(ui, 'Top dönüyor...');
      
      let count = 0;
      let interval = setInterval(() => {
        resultEl.textContent = randomInt(0, 36);
        count++;
        if(count > 20) {
          clearInterval(interval);
          const num = randomInt(0, 36);
          resultEl.textContent = num;
          
          let color = 'green';
          if(num !== 0) color = (num % 2 === 0) ? 'red' : 'black';
          
          if(color === 'red') resultEl.style.color = '#ff5252';
          else if(color === 'black') resultEl.style.color = '#aaa';
          else resultEl.style.color = '#69f0ae';
          
          if(selected === color) {
            const win = bet * (color === 'green' ? 14 : 2);
            window.updateChanceBalance(win);
            showCgMsg(ui, `Kazandınız! ${num} ${color}. +${win}`, 'win');
          } else {
            showCgMsg(ui, `Kaybettiniz. Gelen: ${num} ${color}.`, 'lose');
          }
          spinBtn.disabled = false;
        }
      }, 80);
    });
  }
};

// 5. BLACKJACK
window.ChanceGames.blackjack = {
  init: function(container) {
    const ui = createGameUI('Blackjack', 'Krupiyeyi yen! (21\'i geçme)');
    container.appendChild(ui);
    const betInput = setupBetControls(ui);
    const spec = ui.querySelector('#cgSpecificArea');
    
    spec.innerHTML = `
      <div style="width:100%; display:flex; flex-direction:column; align-items:center; gap:1rem;">
        <div style="text-align:center">
          <div style="color:var(--tx3); font-size:0.8rem; margin-bottom:5px;">Krupiye: <span id="dlrScore">?</span></div>
          <div id="dlrCards" style="display:flex; gap:10px; min-height:115px;"></div>
        </div>
        <div style="text-align:center;">
          <div style="color:var(--a3); font-weight:bold; margin-bottom:5px;">Sen: <span id="plrScore">0</span></div>
          <div id="plrCards" style="display:flex; gap:10px; min-height:115px;"></div>
        </div>
        <div style="display:none; gap:10px; margin-top:1rem" id="bjActions">
          <button class="chance-action-btn" id="hitBtn" style="background:#3498db">Kart Çek (Hit)</button>
          <button class="chance-action-btn" id="standBtn" style="background:#e67e22">Dur (Stand)</button>
        </div>
      </div>
      <button class="chance-action-btn" id="startBjBtn" style="margin-top:1rem;">Oyuna Başla</button>
    `;
    
    const startBtn = spec.querySelector('#startBjBtn');
    const actionsEl = spec.querySelector('#bjActions');
    const hitBtn = spec.querySelector('#hitBtn');
    const standBtn = spec.querySelector('#standBtn');
    
    let deck = [], pHand = [], dHand = [], currentBet = 0;
    
    function drawCard() { return deck.pop(); }
    function getScore(hand) {
      let score = 0, aces = 0;
      for(let c of hand) {
        if(c.v === 'A') { aces++; score+=11; }
        else if(['J','Q','K'].includes(c.v)) score+=10;
        else score+=parseInt(c.v);
      }
      while(score > 21 && aces > 0) { score-=10; aces--; }
      return score;
    }
    function renderCard(card, hidden=false) {
      if(hidden) return `<div class="cg-playing-card" style="background:linear-gradient(135deg, #111, #333); border-color:#555"></div>`;
      return `<div class="cg-playing-card ${card.isRed?'red':''}">${card.v}${card.s}</div>`;
    }
    function renderHands(hideDealer=true) {
      spec.querySelector('#plrCards').innerHTML = pHand.map(c=>renderCard(c)).join('');
      spec.querySelector('#plrScore').textContent = getScore(pHand);
      if(hideDealer && dHand.length > 1) {
        spec.querySelector('#dlrCards').innerHTML = renderCard(dHand[0]) + renderCard(dHand[1], true);
        spec.querySelector('#dlrScore').textContent = getScore([dHand[0]]) + " + ?";
      } else {
        spec.querySelector('#dlrCards').innerHTML = dHand.map(c=>renderCard(c)).join('');
        spec.querySelector('#dlrScore').textContent = getScore(dHand);
      }
    }
    function endGame(msg, result) {
      actionsEl.style.display = 'none';
      startBtn.style.display = 'block';
      startBtn.disabled = false;
      renderHands(false);
      if(result === 'win') {
        window.updateChanceBalance(currentBet * 2);
        showCgMsg(ui, msg + ` +${currentBet*2}`, 'win');
      } else if(result === 'push') {
        window.updateChanceBalance(currentBet);
        showCgMsg(ui, msg + ` (İade)`, 'draw');
      } else {
        showCgMsg(ui, msg, 'lose');
      }
    }

    startBtn.addEventListener('click', () => {
      currentBet = parseInt(betInput.value);
      if(currentBet > window.chanceBalance || currentBet <= 0) return showCgMsg(ui, 'Yetersiz bakiye!', 'lose');
      window.updateChanceBalance(-currentBet);
      showCgMsg(ui, 'Oyun başladı...', '');
      startBtn.style.display = 'none';
      actionsEl.style.display = 'flex';
      
      deck = [];
      const suits = ['♠', '♥', '♦', '♣'];
      const values = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
      for(let s of suits) for(let v of values) deck.push({ s, v, isRed:(s==='♥'||s==='♦') });
      deck.sort(() => Math.random() - 0.5);
      
      pHand = [drawCard(), drawCard()];
      dHand = [drawCard(), drawCard()];
      renderHands(true);
      if(getScore(pHand) === 21) endGame('Blackjack!', 'win');
    });
    
    hitBtn.addEventListener('click', () => {
      pHand.push(drawCard());
      renderHands(true);
      if(getScore(pHand) > 21) endGame('Patladın (Bust).', 'lose');
    });
    
    standBtn.addEventListener('click', () => {
      let dScore = getScore(dHand);
      while(dScore < 17) { dHand.push(drawCard()); dScore = getScore(dHand); }
      let pScore = getScore(pHand);
      if(dScore > 21) endGame('Krupiye Patladı. Kazandın!', 'win');
      else if(pScore > dScore) endGame('Kazandın!', 'win');
      else if(dScore > pScore) endGame('Krupiye Kazandı.', 'lose');
      else endGame('Berabere (Push).', 'push');
    });
  }
};

// 6. CASE OPENING WITH TIERS
window.ChanceGames.case = {
  init: function(container) {
    const ui = createGameUI('Kasa Açma', 'Şansına ne çıkarsa! Kasalar daha pahalı = daha iyi ödüller.', false);
    container.appendChild(ui);
    const spec = ui.querySelector('#cgSpecificArea');
    
    spec.innerHTML = `
      <div style="display:flex; gap:10px; margin-bottom:1rem; flex-wrap:wrap; justify-content:center;">
        <button class="chance-choice-btn selected" data-tier="cheap">Ucuz Kasa (100 💰)</button>
        <button class="chance-choice-btn" data-tier="silver" style="border-color:#bdc3c7; color:#bdc3c7">Gümüş Kasa (500 💰)</button>
        <button class="chance-choice-btn" data-tier="gold" style="border-color:#f1c40f; color:#f1c40f">Altın Kasa (2500 💰)</button>
      </div>
      <div class="cg-case-viewport" style="width:100%; max-width:600px; height:150px; background:rgba(0,0,0,0.6); border:2px solid rgba(255,255,255,0.1); border-radius:10px; overflow:hidden; position:relative; margin-bottom:2rem;">
        <div style="position:absolute; top:0; bottom:0; left:50%; width:4px; background:#f1c40f; transform:translateX(-50%); z-index:10; box-shadow:0 0 10px #f1c40f;"></div>
        <div id="cgCaseItems" style="display:flex; height:100%; position:absolute; left:0;"></div>
      </div>
      <button class="chance-action-btn" id="cgOpenBtn">Kasayı Aç</button>
    `;
    
    let currentTier = 'cheap';
    let cost = 100;
    const choiceBtns = spec.querySelectorAll('.chance-choice-btn');
    choiceBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        choiceBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        currentTier = btn.getAttribute('data-tier');
        if(currentTier === 'cheap') cost = 100;
        else if(currentTier === 'silver') cost = 500;
        else cost = 2500;
        openBtn.textContent = `Kasayı Aç (${cost} 💰)`;
      });
    });

    const items = [
      { name: 'Sıradan', rarity: 'common', valMult: 0.2, icon: '🔫', color: '#b0c3d9' },
      { name: 'Nadir', rarity: 'rare', valMult: 0.8, icon: '🛡️', color: '#4b69ff' },
      { name: 'Destansı', rarity: 'epic', valMult: 2.5, icon: '⚔️', color: '#8847ff' },
      { name: 'Efsanevi', rarity: 'legendary', valMult: 8, icon: '🐉', color: '#d32ce6' },
      { name: 'BIÇAK!', rarity: 'gold', valMult: 30, icon: '🔪', color: '#eb4b4b' }
    ];
    
    function getRandomItem(tier) {
      const r = Math.random();
      if(tier === 'cheap') {
        if(r < 0.65) return items[0];
        if(r < 0.90) return items[1];
        if(r < 0.98) return items[2];
        if(r < 0.998) return items[3];
        return items[4]; // 0.2% knife
      } else if(tier === 'silver') {
        if(r < 0.40) return items[0];
        if(r < 0.70) return items[1];
        if(r < 0.90) return items[2];
        if(r < 0.98) return items[3];
        return items[4]; // 2% knife
      } else {
        if(r < 0.15) return items[0];
        if(r < 0.40) return items[1];
        if(r < 0.75) return items[2];
        if(r < 0.90) return items[3];
        return items[4]; // 10% knife
      }
    }

    const openBtn = spec.querySelector('#cgOpenBtn');
    const itemsContainer = spec.querySelector('#cgCaseItems');

    openBtn.addEventListener('click', () => {
      if(window.chanceBalance < cost) return showCgMsg(ui, 'Yetersiz bakiye!', 'lose');
      
      openBtn.disabled = true;
      window.updateChanceBalance(-cost);
      showCgMsg(ui, 'Kasa açılıyor...', '');
      
      let html = '';
      const rowItems = [];
      for(let i=0; i<60; i++) {
        const item = getRandomItem(currentTier);
        rowItems.push(item);
        html += `
          <div style="width:120px; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; border-right:1px solid rgba(255,255,255,0.1); border-bottom:5px solid ${item.color}; background:linear-gradient(to bottom, rgba(255,255,255,0.05), transparent);">
            <div style="font-size:2.5rem; margin-bottom:5px;">${item.icon}</div>
            <div style="font-size:0.75rem; font-weight:bold; text-align:center;">${item.name}</div>
            <div style="font-size:0.7rem; color:var(--warning)">${Math.floor(item.valMult * cost)} 💰</div>
          </div>
        `;
      }
      itemsContainer.innerHTML = html;
      
      itemsContainer.style.transition = 'none';
      itemsContainer.style.left = '0px';
      void itemsContainer.offsetWidth;
      
      const targetIndex = 50;
      const targetItem = rowItems[targetIndex];
      const offset = (targetIndex * 120) - 300 + 60 + randomInt(-40, 40); 
      
      itemsContainer.style.transition = 'left 5s cubic-bezier(0.15, 0.85, 0.2, 1)';
      itemsContainer.style.left = `-${offset}px`;
      
      setTimeout(() => {
        const winAmount = Math.floor(targetItem.valMult * cost);
        window.updateChanceBalance(winAmount);
        if(winAmount > cost) showCgMsg(ui, `Süper! ${targetItem.name} çıktı. +${winAmount}`, 'win');
        else showCgMsg(ui, `Zarar... ${targetItem.name} çıktı. +${winAmount}`, 'lose');
        openBtn.disabled = false;
      }, 5200);
    });
  }
};

// 7. SCRATCH CARD (Kazı Kazan)
window.ChanceGames.scratch = {
  init: function(container) {
    const ui = createGameUI('Kazı Kazan', 'Kart Bedeli: 200. 3 aynı sembolü bul, büyük ödülü kap!', false);
    container.appendChild(ui);
    const spec = ui.querySelector('#cgSpecificArea');
    
    spec.innerHTML = `
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; margin-bottom:2rem; width:260px;">
        ${Array(9).fill(0).map((_, i) => `<div class="cg-scratch-cell" id="sc-${i}" style="width:80px; height:80px; background:var(--glass); border:2px solid var(--glass-border); border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:2.5rem; cursor:pointer; user-select:none; transition:transform 0.2s;">❔</div>`).join('')}
      </div>
      <button class="chance-action-btn" id="cgBuyScratchBtn">Kart Satın Al (200 💰)</button>
    `;
    
    const buyBtn = spec.querySelector('#cgBuyScratchBtn');
    const cells = spec.querySelectorAll('.cg-scratch-cell');
    
    const possibleSymbols = [
      { sym: '🍎', val: 50 },
      { sym: '💵', val: 300 },
      { sym: '💎', val: 1000 },
      { sym: '⭐', val: 5000 }
    ];
    
    let currentGrid = [];
    let revealedCount = 0;
    let isActive = false;
    let matchedSymbols = {};
    
    buyBtn.addEventListener('click', () => {
      if(window.chanceBalance < 200) return showCgMsg(ui, 'Yetersiz bakiye!', 'lose');
      window.updateChanceBalance(-200);
      showCgMsg(ui, 'Kutuları kazı (tıkla)!', '');
      buyBtn.disabled = true;
      isActive = true;
      revealedCount = 0;
      matchedSymbols = {};
      
      // Generate grid (ensure sometimes they win, mostly lose)
      currentGrid = [];
      const r = Math.random();
      let winSym = null;
      if(r < 0.25) { // 25% win rate
        let pool = [];
        if(r < 0.01) winSym = possibleSymbols[3];
        else if(r < 0.05) winSym = possibleSymbols[2];
        else if(r < 0.15) winSym = possibleSymbols[1];
        else winSym = possibleSymbols[0];
        
        currentGrid.push(winSym, winSym, winSym);
        for(let i=0; i<6; i++) {
          let randSym = possibleSymbols[randomInt(0,3)];
          currentGrid.push(randSym);
        }
      } else {
        // losing grid
        for(let i=0; i<9; i++) {
          let randSym = possibleSymbols[randomInt(0,3)];
          currentGrid.push(randSym);
        }
        // Force no 3-of-a-kind
        currentGrid[0] = possibleSymbols[0];
        currentGrid[1] = possibleSymbols[1];
        currentGrid[2] = possibleSymbols[2];
        currentGrid[3] = possibleSymbols[3];
      }
      currentGrid.sort(() => Math.random() - 0.5);
      
      cells.forEach(c => {
        c.textContent = '❔';
        c.style.background = 'var(--glass)';
        c.classList.remove('revealed');
      });
    });
    
    cells.forEach((cell, idx) => {
      cell.addEventListener('click', () => {
        if(!isActive || cell.classList.contains('revealed')) return;
        
        const sym = currentGrid[idx];
        cell.textContent = sym.sym;
        cell.classList.add('revealed');
        cell.style.background = 'rgba(255,255,255,0.1)';
        cell.style.transform = 'scale(0.95)';
        setTimeout(() => cell.style.transform = 'scale(1)', 150);
        
        matchedSymbols[sym.sym] = (matchedSymbols[sym.sym] || 0) + 1;
        revealedCount++;
        
        if(matchedSymbols[sym.sym] === 3) {
          isActive = false;
          window.updateChanceBalance(sym.val);
          showCgMsg(ui, `Tebrikler! 3 adet ${sym.sym} buldunuz! +${sym.val}`, 'win');
          buyBtn.disabled = false;
          buyBtn.textContent = 'Tekrar Oyna (200 💰)';
        } else if(revealedCount === 9) {
          isActive = false;
          showCgMsg(ui, 'Maalesef 3 eşleşme bulamadınız.', 'lose');
          buyBtn.disabled = false;
          buyBtn.textContent = 'Tekrar Oyna (200 💰)';
        }
      });
    });
  }
};

// 8. MINES
window.ChanceGames.mines = {
  init: function(container) {
    const ui = createGameUI('Madenler (Mines)', 'Mayınlara basmadan elmasları topla. Çarpanı artır ve dilediğin zaman çekil.');
    container.appendChild(ui);
    const betInput = setupBetControls(ui);
    const spec = ui.querySelector('#cgSpecificArea');
    
    spec.innerHTML = `
      <div style="font-size:1.2rem; margin-bottom:1rem; color:var(--a3);">Mevcut Çarpan: <strong id="cgMineMult">1.00x</strong></div>
      <div style="display:grid; grid-template-columns:repeat(5, 1fr); gap:6px; margin-bottom:2rem; width:280px; pointer-events:none; opacity:0.5;" id="cgMinesGrid">
        ${Array(25).fill(0).map((_, i) => `<div class="cg-mine-cell" id="mine-${i}" style="aspect-ratio:1; background:var(--glass); border:1px solid var(--glass-border); border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:1.5rem; cursor:pointer; transition:0.2s;"></div>`).join('')}
      </div>
      <div style="display:flex; gap:10px;">
        <button class="chance-action-btn" id="cgStartMinesBtn">Oyuna Başla</button>
        <button class="chance-action-btn hidden" id="cgCashoutBtn" style="background:var(--a4); color:#111;">Çekil</button>
      </div>
    `;
    
    const startBtn = spec.querySelector('#cgStartMinesBtn');
    const cashoutBtn = spec.querySelector('#cgCashoutBtn');
    const grid = spec.querySelector('#cgMinesGrid');
    const cells = spec.querySelectorAll('.cg-mine-cell');
    const multEl = spec.querySelector('#cgMineMult');
    
    let isPlaying = false;
    let mines = [];
    let currentBet = 0;
    let safeClicks = 0;
    let currentMult = 1.0;
    
    startBtn.addEventListener('click', () => {
      currentBet = parseInt(betInput.value);
      if(currentBet > window.chanceBalance || currentBet <= 0) return showCgMsg(ui, 'Yetersiz bakiye!', 'lose');
      
      window.updateChanceBalance(-currentBet);
      isPlaying = true;
      safeClicks = 0;
      currentMult = 1.0;
      multEl.textContent = '1.00x';
      showCgMsg(ui, 'Mayınlara dikkat!', '');
      
      startBtn.classList.add('hidden');
      cashoutBtn.classList.remove('hidden');
      grid.style.pointerEvents = 'all';
      grid.style.opacity = '1';
      
      // Place 5 mines randomly
      mines = [];
      while(mines.length < 5) {
        let r = randomInt(0, 24);
        if(!mines.includes(r)) mines.push(r);
      }
      
      cells.forEach(c => {
        c.textContent = '';
        c.style.background = 'var(--glass)';
        c.classList.remove('revealed');
      });
    });
    
    function gameOver(won) {
      isPlaying = false;
      grid.style.pointerEvents = 'none';
      startBtn.classList.remove('hidden');
      cashoutBtn.classList.add('hidden');
      
      // Reveal all
      cells.forEach((c, i) => {
        if(mines.includes(i)) {
          c.textContent = '💣';
          if(!won) c.style.background = 'rgba(255,82,82,0.3)';
        } else {
          if(!c.classList.contains('revealed')) {
            c.textContent = '💎';
            c.style.opacity = '0.5';
          }
        }
      });
      
      if(won) {
        const win = Math.floor(currentBet * currentMult);
        window.updateChanceBalance(win);
        showCgMsg(ui, `Çekildin! +${win} 💰 kazandın.`, 'win');
      } else {
        showCgMsg(ui, `BOOM! Mayına bastın.`, 'lose');
      }
    }
    
    cells.forEach((cell, idx) => {
      cell.addEventListener('click', () => {
        if(!isPlaying || cell.classList.contains('revealed')) return;
        
        if(mines.includes(idx)) {
          cell.textContent = '💥';
          cell.style.background = 'red';
          gameOver(false);
        } else {
          cell.textContent = '💎';
          cell.style.background = 'rgba(105,240,174,0.2)';
          cell.classList.add('revealed');
          safeClicks++;
          // Increase multiplier (simple formula)
          currentMult += 0.20 + (safeClicks * 0.05);
          multEl.textContent = currentMult.toFixed(2) + 'x';
          
          if(safeClicks === 20) {
            gameOver(true); // You won all safe spots
          }
        }
      });
    });
    
    cashoutBtn.addEventListener('click', () => {
      if(!isPlaying || safeClicks === 0) return;
      gameOver(true);
    });
  }
};

// 9. WHEEL OF FORTUNE
window.ChanceGames.wheel = {
  init: function(container) {
    const ui = createGameUI('Çarkıfelek', 'Şans Çarkını çevir ve çarpanı kazan!');
    container.appendChild(ui);
    const betInput = setupBetControls(ui);
    const spec = ui.querySelector('#cgSpecificArea');
    
    spec.innerHTML = `
      <div style="position:relative; width:220px; height:220px; margin:1rem 0 2rem 0;">
        <div style="position:absolute; top:-15px; left:50%; transform:translateX(-50%); width:0; height:0; border-left:15px solid transparent; border-right:15px solid transparent; border-top:25px solid var(--a3); z-index:10;"></div>
        <div id="cgWheel" style="width:100%; height:100%; border-radius:50%; background:conic-gradient(#e74c3c 0% 12.5%, #f1c40f 12.5% 25%, #2ecc71 25% 37.5%, #3498db 37.5% 50%, #9b59b6 50% 62.5%, #34495e 62.5% 75%, #e67e22 75% 87.5%, #1abc9c 87.5% 100%); border:5px solid var(--glass-border); transition:transform 4s cubic-bezier(0.175, 0.885, 0.32, 1.275); position:relative;">
          <!-- Simple labels overlay -->
          <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-weight:bold; color:#fff; text-shadow:0 2px 4px rgba(0,0,0,0.8);">ŞANS ÇARKI</div>
        </div>
      </div>
      <button class="chance-action-btn" id="cgSpinWheelBtn">Çevir</button>
    `;
    
    const spinBtn = spec.querySelector('#cgSpinWheelBtn');
    const wheel = spec.querySelector('#cgWheel');
    // Mults corresponding to 8 slices. We will just randomly pick a multiplier.
    const multipliers = [0, 1.5, 0.5, 2, 0, 3, 0.2, 5];
    
    let currentDeg = 0;
    
    spinBtn.addEventListener('click', () => {
      const bet = parseInt(betInput.value);
      if(bet > window.chanceBalance || bet <= 0) return showCgMsg(ui, 'Yetersiz bakiye!', 'lose');
      
      spinBtn.disabled = true;
      window.updateChanceBalance(-bet);
      showCgMsg(ui, 'Çark dönüyor...', '');
      
      const sliceIdx = randomInt(0, 7);
      const mult = multipliers[sliceIdx];
      
      // Calculate rotation
      const sliceDeg = 360 / 8;
      const targetDeg = currentDeg + 360 * 3 + (8 - sliceIdx) * sliceDeg - (sliceDeg/2);
      
      wheel.style.transform = `rotate(${targetDeg}deg)`;
      currentDeg = targetDeg;
      
      setTimeout(() => {
        const win = Math.floor(bet * mult);
        if(win > bet) {
          window.updateChanceBalance(win);
          showCgMsg(ui, `${mult}x Çarpan! +${win}`, 'win');
        } else if (win > 0) {
          window.updateChanceBalance(win);
          showCgMsg(ui, `${mult}x Çarpan. Geri dönen: ${win}`, 'draw');
        } else {
          showCgMsg(ui, `Sıfır Çarpan. Kaybettiniz.`, 'lose');
        }
        spinBtn.disabled = false;
      }, 4200);
    });
  }
};

// 10. HIGHER/LOWER
window.ChanceGames.higherlower = {
  init: function(container) {
    const ui = createGameUI('Yüksek / Düşük', 'Sonraki kartın değeri daha mı yüksek daha mı düşük? Art arda bil, çarpanı büyüt!');
    container.appendChild(ui);
    const betInput = setupBetControls(ui);
    const spec = ui.querySelector('#cgSpecificArea');
    
    spec.innerHTML = `
      <div style="font-size:1.2rem; margin-bottom:1rem; color:var(--a3);">Çarpan: <strong id="cgHlMult">1.00x</strong></div>
      <div style="display:flex; gap:20px; align-items:center; margin-bottom:2rem; min-height:120px;">
        <div class="cg-playing-card" id="cgHlCard" style="width:80px; height:115px; font-size:2rem;">?</div>
      </div>
      <div style="display:flex; gap:10px;" id="cgHlControls">
        <button class="chance-action-btn" id="cgHlStartBtn">Oyuna Başla</button>
      </div>
      <div style="display:none; gap:10px; margin-top:10px;" id="cgHlPlayControls">
        <button class="chance-action-btn" id="cgHigherBtn" style="background:var(--success); color:#111; min-width:80px;">⬆ Yüksek</button>
        <button class="chance-action-btn" id="cgLowerBtn" style="background:var(--danger); min-width:80px;">⬇ Düşük</button>
        <button class="chance-action-btn" id="cgHlCashoutBtn" style="background:var(--warning); color:#111; min-width:80px;">💰 Çekil</button>
      </div>
    `;
    
    const startBtn = spec.querySelector('#cgHlStartBtn');
    const playControls = spec.querySelector('#cgHlPlayControls');
    const startControls = spec.querySelector('#cgHlControls');
    const higherBtn = spec.querySelector('#cgHigherBtn');
    const lowerBtn = spec.querySelector('#cgLowerBtn');
    const cashoutBtn = spec.querySelector('#cgHlCashoutBtn');
    const cardEl = spec.querySelector('#cgHlCard');
    const multEl = spec.querySelector('#cgHlMult');
    
    const values = [2,3,4,5,6,7,8,9,10,11,12,13,14]; // 11=J, 12=Q, 13=K, 14=A
    const valStrs = {11:'J', 12:'Q', 13:'K', 14:'A'};
    const suits = ['♠', '♥', '♦', '♣'];
    
    let currentVal = 0;
    let currentMult = 1.0;
    let currentBet = 0;
    
    function drawCard() {
      const v = randomInt(2, 14);
      const s = suits[randomInt(0,3)];
      return { val: v, str: valStrs[v] || v, suit: s, isRed: (s==='♥'||s==='♦') };
    }
    
    function displayCard(c) {
      cardEl.textContent = c.str + c.suit;
      cardEl.className = 'cg-playing-card ' + (c.isRed ? 'red' : '');
    }

    startBtn.addEventListener('click', () => {
      currentBet = parseInt(betInput.value);
      if(currentBet > window.chanceBalance || currentBet <= 0) return showCgMsg(ui, 'Yetersiz bakiye!', 'lose');
      
      window.updateChanceBalance(-currentBet);
      currentMult = 1.0;
      multEl.textContent = '1.00x';
      
      startControls.style.display = 'none';
      playControls.style.display = 'flex';
      
      const c = drawCard();
      currentVal = c.val;
      displayCard(c);
      showCgMsg(ui, 'Tahmin et!', '');
    });
    
    function guess(isHigher) {
      const nextCard = drawCard();
      const nextVal = nextCard.val;
      
      // Reveal
      displayCard(nextCard);
      
      // Check win (tie goes to player for simplicity but less multiplier)
      let won = false;
      let tie = false;
      if (nextVal === currentVal) { tie = true; won = true; }
      else if (isHigher && nextVal > currentVal) won = true;
      else if (!isHigher && nextVal < currentVal) won = true;
      
      if(won) {
        if(!tie) currentMult *= 1.3; // +30% each win
        multEl.textContent = currentMult.toFixed(2) + 'x';
        currentVal = nextVal;
        showCgMsg(ui, 'Doğru!', 'win');
      } else {
        // Lose
        showCgMsg(ui, 'Yanlış. Kaybettiniz.', 'lose');
        startControls.style.display = 'flex';
        playControls.style.display = 'none';
      }
    }
    
    higherBtn.addEventListener('click', () => guess(true));
    lowerBtn.addEventListener('click', () => guess(false));
    
    cashoutBtn.addEventListener('click', () => {
      const win = Math.floor(currentBet * currentMult);
      window.updateChanceBalance(win);
      showCgMsg(ui, `Çekildin! +${win}`, 'win');
      startControls.style.display = 'flex';
      playControls.style.display = 'none';
      cardEl.textContent = '?';
      cardEl.className = 'cg-playing-card';
    });
  }
};

// 11. PLINKO
window.ChanceGames.plinko = {
  init: function(container) {
    const ui = createGameUI('Plinko', 'Topu bırak ve şansını izle!');
    container.appendChild(ui);
    const betInput = setupBetControls(ui);
    const spec = ui.querySelector('#cgSpecificArea');
    
    spec.innerHTML = `
      <div style="position:relative; width:300px; height:250px; background:rgba(0,0,0,0.3); border:1px solid var(--glass-border); border-radius:10px; margin-bottom:1rem; overflow:hidden;">
        <!-- Mock pegs -->
        ${Array(5).fill(0).map((_,row) => `
          <div style="display:flex; justify-content:space-evenly; margin-top:25px; padding:0 ${20 - row*2}px;">
            ${Array(row+3).fill(0).map(() => `<div style="width:8px; height:8px; background:#fff; border-radius:50%; box-shadow:0 0 5px #fff;"></div>`).join('')}
          </div>
        `).join('')}
        
        <!-- Multipliers -->
        <div style="position:absolute; bottom:0; width:100%; display:flex; justify-content:space-between; padding:0 5px; height:30px; background:rgba(0,0,0,0.5);">
          <div style="color:var(--danger); font-size:0.7rem; display:flex; align-items:center;">10x</div>
          <div style="color:var(--warning); font-size:0.7rem; display:flex; align-items:center;">2x</div>
          <div style="color:var(--tx3); font-size:0.7rem; display:flex; align-items:center;">0.2x</div>
          <div style="color:var(--warning); font-size:0.7rem; display:flex; align-items:center;">2x</div>
          <div style="color:var(--danger); font-size:0.7rem; display:flex; align-items:center;">10x</div>
        </div>
        
        <!-- Ball -->
        <div id="cgPlinkoBall" style="position:absolute; top:-20px; left:140px; width:16px; height:16px; background:var(--a4); border-radius:50%; box-shadow:0 0 10px var(--a4); transition:all 0.5s ease-in-out;"></div>
      </div>
      <button class="chance-action-btn" id="cgDropBtn">Topu Bırak</button>
    `;
    
    const dropBtn = spec.querySelector('#cgDropBtn');
    const ball = spec.querySelector('#cgPlinkoBall');
    const multipliers = [10, 2, 0.2, 2, 10]; // index 0 to 4
    
    dropBtn.addEventListener('click', () => {
      const bet = parseInt(betInput.value);
      if(bet > window.chanceBalance || bet <= 0) return showCgMsg(ui, 'Yetersiz bakiye!', 'lose');
      
      dropBtn.disabled = true;
      window.updateChanceBalance(-bet);
      showCgMsg(ui, 'Düşüyor...', '');
      
      // Reset ball
      ball.style.transition = 'none';
      ball.style.top = '-20px';
      ball.style.left = '140px';
      void ball.offsetWidth;
      
      // Calculate path
      let currentLeft = 140;
      let path = [];
      let finalIdx = 2; // Center default
      
      // Random walk down
      for(let step=1; step<=5; step++) {
        let dir = Math.random() > 0.5 ? 1 : -1;
        currentLeft += dir * 25; // 25px horizontal drift per step
        path.push({ top: step * 35, left: currentLeft });
      }
      
      // Map finalLeft to slots (approx 5 slots)
      if(currentLeft < 60) finalIdx = 0;
      else if(currentLeft < 110) finalIdx = 1;
      else if(currentLeft < 170) finalIdx = 2;
      else if(currentLeft < 220) finalIdx = 3;
      else finalIdx = 4;
      
      // Force ball exactly into slot visually
      path.push({ top: 220, left: 10 + finalIdx * 65 });
      
      // Animate
      let step = 0;
      ball.style.transition = 'all 0.3s linear';
      let anim = setInterval(() => {
        if(step < path.length) {
          ball.style.top = path[step].top + 'px';
          ball.style.left = path[step].left + 'px';
          step++;
        } else {
          clearInterval(anim);
          const mult = multipliers[finalIdx];
          const win = Math.floor(bet * mult);
          window.updateChanceBalance(win);
          if(mult > 1) showCgMsg(ui, `Kazandınız! ${mult}x (+${win})`, 'win');
          else showCgMsg(ui, `Kayıp. ${mult}x (+${win})`, 'lose');
          dropBtn.disabled = false;
        }
      }, 300);
    });
  }
};

// 12. KENO (Tombala)
window.ChanceGames.keno = {
  init: function(container) {
    const ui = createGameUI('Tombala (Keno)', '1-40 arası 5 sayı seç. Sistem 10 sayı çekecek. 5 tutturursan 50x!');
    container.appendChild(ui);
    const betInput = setupBetControls(ui);
    const spec = ui.querySelector('#cgSpecificArea');
    
    spec.innerHTML = `
      <div style="font-size:0.8rem; margin-bottom:1rem; color:var(--tx3); text-align:center;">
        Seçilen: <span id="cgKenoCount" style="color:var(--a3)">0</span> / 5<br>
        (1=0x, 2=1x, 3=3x, 4=10x, 5=50x)
      </div>
      <div style="display:grid; grid-template-columns:repeat(8, 1fr); gap:5px; margin-bottom:1rem;">
        ${Array(40).fill(0).map((_, i) => `<div class="cg-keno-cell" data-num="${i+1}" style="width:30px; height:30px; background:var(--glass); border:1px solid var(--glass-border); border-radius:5px; display:flex; align-items:center; justify-content:center; font-size:0.8rem; cursor:pointer; user-select:none; transition:0.2s;">${i+1}</div>`).join('')}
      </div>
      <button class="chance-action-btn" id="cgDrawKenoBtn" disabled>Çekiliş Yap</button>
    `;
    
    const drawBtn = spec.querySelector('#cgDrawKenoBtn');
    const cells = spec.querySelectorAll('.cg-keno-cell');
    const countEl = spec.querySelector('#cgKenoCount');
    
    let selectedNums = [];
    
    cells.forEach(c => {
      c.addEventListener('click', () => {
        const num = parseInt(c.getAttribute('data-num'));
        if(selectedNums.includes(num)) {
          selectedNums = selectedNums.filter(n => n !== num);
          c.style.background = 'var(--glass)';
          c.style.borderColor = 'var(--glass-border)';
        } else {
          if(selectedNums.length >= 5) return;
          selectedNums.push(num);
          c.style.background = 'rgba(0,229,255,0.2)';
          c.style.borderColor = 'var(--a3)';
        }
        countEl.textContent = selectedNums.length;
        drawBtn.disabled = selectedNums.length < 5;
      });
    });
    
    drawBtn.addEventListener('click', () => {
      const bet = parseInt(betInput.value);
      if(bet > window.chanceBalance || bet <= 0) return showCgMsg(ui, 'Yetersiz bakiye!', 'lose');
      
      drawBtn.disabled = true;
      window.updateChanceBalance(-bet);
      showCgMsg(ui, 'Sayılar Çekiliyor...', '');
      
      // Clear previous draw highlights
      cells.forEach(c => {
        if(!selectedNums.includes(parseInt(c.getAttribute('data-num')))) {
          c.style.background = 'var(--glass)';
        }
        c.classList.remove('drawn');
      });
      
      // Draw 10 random unique numbers
      let drawn = [];
      while(drawn.length < 10) {
        let r = randomInt(1, 40);
        if(!drawn.includes(r)) drawn.push(r);
      }
      
      let matches = 0;
      let i = 0;
      let anim = setInterval(() => {
        if(i < 10) {
          const num = drawn[i];
          const c = spec.querySelector(`.cg-keno-cell[data-num="${num}"]`);
          if(selectedNums.includes(num)) {
            matches++;
            c.style.background = 'rgba(105,240,174,0.4)'; // green match
            c.style.borderColor = 'var(--success)';
          } else {
            c.style.background = 'rgba(255,82,82,0.4)'; // red drawn but not selected
            c.style.borderColor = 'var(--danger)';
          }
          i++;
        } else {
          clearInterval(anim);
          let mult = 0;
          if(matches === 2) mult = 1;
          else if(matches === 3) mult = 3;
          else if(matches === 4) mult = 10;
          else if(matches === 5) mult = 50;
          
          if(mult > 0) {
            const win = bet * mult;
            window.updateChanceBalance(win);
            showCgMsg(ui, `${matches} Doğru! ${mult}x Kazanç: +${win}`, 'win');
          } else {
            showCgMsg(ui, `${matches} Doğru. Kaybettiniz.`, 'lose');
          }
          drawBtn.disabled = false;
        }
      }, 400);
    });
  }
};

// 13. CRASH
window.ChanceGames.crash = {
  init: function(container) {
    const ui = createGameUI('Crash (Roket)', 'Çarpan artarken "Çekil" butonuna bas, roket patlamadan önce kazancı al!');
    container.appendChild(ui);
    const betInput = setupBetControls(ui);
    const spec = ui.querySelector('#cgSpecificArea');
    
    let multiplier = 1.00;
    let crashPoint = 0;
    let gameInterval = null;
    let playing = false;
    let betAmt = 0;

    const display = document.createElement('div');
    display.style.cssText = 'font-size: 4rem; font-weight: 900; color: #fff; margin: 2rem 0; font-family: monospace; transition: 0.1s;';
    display.textContent = '1.00x';
    
    const playBtn = document.createElement('button');
    playBtn.className = 'chance-action-btn';
    playBtn.textContent = '▶ Oyna';
    
    const cashoutBtn = document.createElement('button');
    cashoutBtn.className = 'chance-action-btn';
    cashoutBtn.style.background = 'var(--a4)';
    cashoutBtn.style.display = 'none';
    cashoutBtn.style.marginTop = '10px';
    cashoutBtn.textContent = 'Çekil';
    
    spec.appendChild(display);
    spec.appendChild(playBtn);
    spec.appendChild(cashoutBtn);
    
    playBtn.onclick = () => {
      const b = parseInt(betInput.value);
      if (isNaN(b) || b <= 0 || b > window.chanceBalance) {
        showCgMsg(ui, 'Geçersiz bahis!', 'lose'); return;
      }
      updateChanceBalance(-b);
      betAmt = b;
      playing = true;
      multiplier = 1.00;
      display.style.color = '#fff';
      
      const e = 100;
      const h = Math.random() * e;
      if (h < 1) crashPoint = 1.00;
      else crashPoint = (100 / (100 - h));
      crashPoint = Math.max(1.00, crashPoint);
      if(crashPoint > 1000) crashPoint = 1000;
      
      playBtn.style.display = 'none';
      cashoutBtn.style.display = 'block';
      showCgMsg(ui, 'Uçuş başladı...', '');
      
      gameInterval = setInterval(() => {
        multiplier += (multiplier * 0.01) + 0.01;
        
        if (multiplier >= crashPoint) {
          clearInterval(gameInterval);
          multiplier = crashPoint;
          display.textContent = multiplier.toFixed(2) + 'x';
          display.style.color = 'var(--danger)';
          playing = false;
          playBtn.style.display = 'block';
          cashoutBtn.style.display = 'none';
          showCgMsg(ui, 'PATLADI! Kaybettin.', 'lose');
        } else {
          display.textContent = multiplier.toFixed(2) + 'x';
        }
      }, 50);
    };
    
    cashoutBtn.onclick = () => {
      if(!playing) return;
      clearInterval(gameInterval);
      playing = false;
      const win = Math.floor(betAmt * multiplier);
      updateChanceBalance(win);
      display.style.color = 'var(--success)';
      showCgMsg(ui, 'Çekildin! ' + win + ' 💰 kazandın.', 'win');
      playBtn.style.display = 'block';
      cashoutBtn.style.display = 'none';
    };
  }
};

// 14. TOWER
window.ChanceGames.tower = {
  init: function(container) {
    const ui = createGameUI('Kule Tırmanışı', 'Yukarı tırman. Her katta 2 güvenli, 1 tuzak taş var!');
    container.appendChild(ui);
    const betInput = setupBetControls(ui);
    const spec = ui.querySelector('#cgSpecificArea');
    
    let currentFloor = 0;
    const maxFloors = 10;
    let betAmt = 0;
    let playing = false;
    
    const towerGrid = document.createElement('div');
    towerGrid.style.cssText = 'display:flex; flex-direction:column-reverse; gap: 5px; margin: 1rem 0; width: 300px;';
    
    const playBtn = document.createElement('button');
    playBtn.className = 'chance-action-btn';
    playBtn.textContent = '▶ Oyna';
    
    const cashoutBtn = document.createElement('button');
    cashoutBtn.className = 'chance-action-btn';
    cashoutBtn.style.background = 'var(--a4)';
    cashoutBtn.style.display = 'none';
    cashoutBtn.style.marginTop = '10px';
    cashoutBtn.textContent = 'Kazancı Al';
    
    let floors = [];
    for(let f=0; f<maxFloors; f++) {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex; justify-content:space-between; gap: 5px; opacity: 0.5; pointer-events:none;';
      const rowTiles = [];
      for(let t=0; t<3; t++) {
        const tile = document.createElement('div');
        tile.style.cssText = 'flex:1; height: 30px; background:rgba(255,255,255,0.1); border-radius:5px; cursor:pointer; text-align:center; line-height:30px; font-weight:bold; transition: 0.2s;';
        tile.onclick = () => handleTileClick(f, t);
        row.appendChild(tile);
        rowTiles.push(tile);
      }
      towerGrid.appendChild(row);
      floors.push({ row: row, tiles: rowTiles, trapIndex: Math.floor(Math.random()*3) });
    }
    
    spec.appendChild(towerGrid);
    spec.appendChild(playBtn);
    spec.appendChild(cashoutBtn);
    
    function renderTower() {
      for(let f=0; f<maxFloors; f++) {
        floors[f].row.style.opacity = (f === currentFloor && playing) ? '1' : '0.5';
        floors[f].row.style.pointerEvents = (f === currentFloor && playing) ? 'auto' : 'none';
      }
      cashoutBtn.textContent = 'Kazancı Al (' + Math.floor(betAmt * getMultiplier(currentFloor)) + ' 💰)';
    }
    
    function getMultiplier(floor) {
      return Math.pow(1.45, floor);
    }
    
    function handleTileClick(f, t) {
      if(!playing || f !== currentFloor) return;
      if(t === floors[f].trapIndex) {
        floors[f].tiles[t].style.background = 'var(--danger)';
        floors[f].tiles[t].textContent = '💣';
        playing = false;
        showCgMsg(ui, 'Mayına bastın! Kaybettin.', 'lose');
        cashoutBtn.style.display = 'none';
        playBtn.style.display = 'block';
        renderTower();
      } else {
        floors[f].tiles[t].style.background = 'var(--success)';
        floors[f].tiles[t].textContent = '💎';
        currentFloor++;
        if(currentFloor === maxFloors) {
          playing = false;
          const win = Math.floor(betAmt * getMultiplier(maxFloors));
          updateChanceBalance(win);
          showCgMsg(ui, 'Zirveye ulaştın! ' + win + ' 💰 kazandın!', 'win');
          cashoutBtn.style.display = 'none';
          playBtn.style.display = 'block';
        }
        renderTower();
      }
    }
    
    playBtn.onclick = () => {
      const b = parseInt(betInput.value);
      if (isNaN(b) || b <= 0 || b > window.chanceBalance) return showCgMsg(ui, 'Yetersiz bakiye', 'lose');
      updateChanceBalance(-b);
      betAmt = b;
      currentFloor = 0;
      playing = true;
      showCgMsg(ui, 'İyi şanslar!', '');
      playBtn.style.display = 'none';
      cashoutBtn.style.display = 'block';
      
      floors.forEach(f => {
        f.trapIndex = Math.floor(Math.random()*3);
        f.tiles.forEach(t => { t.style.background = 'rgba(255,255,255,0.1)'; t.textContent = ''; });
      });
      renderTower();
    };
    
    cashoutBtn.onclick = () => {
      if(!playing) return;
      playing = false;
      const win = Math.floor(betAmt * getMultiplier(currentFloor));
      updateChanceBalance(win);
      showCgMsg(ui, 'Çekildin! ' + win + ' 💰 kazandın.', 'win');
      cashoutBtn.style.display = 'none';
      playBtn.style.display = 'block';
      renderTower();
    };
  }
};

// 15. SHELL GAME
window.ChanceGames.shell = {
  init: function(container) {
    const ui = createGameUI('Üç Kağıt / Bardak', 'Top hangi bardağın altında? (2.5x Kazan)');
    container.appendChild(ui);
    const betInput = setupBetControls(ui);
    const spec = ui.querySelector('#cgSpecificArea');
    
    const playBtn = document.createElement('button');
    playBtn.className = 'chance-action-btn';
    playBtn.textContent = '▶ Oyna';
    
    let playing = false;
    let betAmt = 0;
    
    const cupGrid = document.createElement('div');
    cupGrid.style.cssText = 'display:flex; gap: 20px; margin: 2rem 0;';
    
    const cups = [];
    let ballIndex = -1;
    
    for(let i=0; i<3; i++) {
      const cup = document.createElement('div');
      cup.style.cssText = 'width: 80px; height: 100px; background: var(--a3); border-radius: 10px 10px 0 0; cursor:pointer; font-size:3rem; display:flex; align-items:flex-end; justify-content:center; transition:0.3s; padding-bottom:10px; opacity:0.5; pointer-events:none;';
      cup.innerHTML = '🛢️';
      cup.onclick = () => selectCup(i);
      cups.push(cup);
      cupGrid.appendChild(cup);
    }
    
    spec.appendChild(cupGrid);
    spec.appendChild(playBtn);
    
    playBtn.onclick = () => {
      const b = parseInt(betInput.value);
      if (isNaN(b) || b <= 0 || b > window.chanceBalance) return showCgMsg(ui, 'Yetersiz bakiye', 'lose');
      updateChanceBalance(-b);
      betAmt = b;
      playing = true;
      ballIndex = Math.floor(Math.random()*3);
      
      cups.forEach(c => { c.innerHTML = '🛢️'; c.style.transform = 'translateY(0)'; c.style.opacity = '1'; c.style.pointerEvents = 'auto'; });
      showCgMsg(ui, 'Bardaklar karıştırıldı. Birini seç!', '');
      playBtn.disabled = true;
    };
    
    function selectCup(i) {
      if(!playing) return;
      playing = false;
      playBtn.disabled = false;
      cups.forEach((c, idx) => {
        c.style.pointerEvents = 'none';
        c.style.transform = 'translateY(-30px)';
        c.innerHTML = idx === ballIndex ? '💎' : '❌';
      });
      
      if(i === ballIndex) {
        const win = Math.floor(betAmt * 2.5);
        updateChanceBalance(win);
        showCgMsg(ui, 'Doğru bildin! ' + win + ' 💰 kazandın.', 'win');
      } else {
        showCgMsg(ui, 'Yanlış seçim! Kaybettin.', 'lose');
      }
    }
  }
};

// 16. DICE CLASH
window.ChanceGames.diceclash = {
  init: function(container) {
    const ui = createGameUI('Zar Düellosu', 'İki zar atılır. Krupiyeden yüksek atarsan kazanırsın! (2x)');
    container.appendChild(ui);
    const betInput = setupBetControls(ui);
    const spec = ui.querySelector('#cgSpecificArea');
    
    const playBtn = document.createElement('button');
    playBtn.className = 'chance-action-btn';
    playBtn.textContent = '▶ Zarları At';
    
    const arena = document.createElement('div');
    arena.style.cssText = 'display:flex; justify-content:space-around; width: 100%; margin: 2rem 0;';
    
    const pDice = document.createElement('div'); pDice.style.cssText = 'font-size:4rem;'; pDice.textContent = '🎲🎲';
    const dDice = document.createElement('div'); dDice.style.cssText = 'font-size:4rem;'; dDice.textContent = '🎲🎲';
    
    const pBox = document.createElement('div'); pBox.innerHTML = '<div style="color:var(--tx2);">Sen</div>'; pBox.appendChild(pDice);
    const dBox = document.createElement('div'); dBox.innerHTML = '<div style="color:var(--tx2);">Krupiye</div>'; dBox.appendChild(dDice);
    
    arena.appendChild(pBox); arena.appendChild(dBox);
    spec.appendChild(arena);
    spec.appendChild(playBtn);
    
    playBtn.onclick = () => {
      const b = parseInt(betInput.value);
      if (isNaN(b) || b <= 0 || b > window.chanceBalance) return showCgMsg(ui, 'Yetersiz bakiye', 'lose');
      updateChanceBalance(-b);
      playBtn.disabled = true;
      pDice.textContent = '🎲🎲'; dDice.textContent = '🎲🎲';
      showCgMsg(ui, 'Zarlar atılıyor...', '');
      
      setTimeout(() => {
        const p1 = Math.floor(Math.random()*6)+1; const p2 = Math.floor(Math.random()*6)+1;
        const d1 = Math.floor(Math.random()*6)+1; const d2 = Math.floor(Math.random()*6)+1;
        
        const diceMap = ['','⚀','⚁','⚂','⚃','⚄','⚅'];
        pDice.textContent = diceMap[p1] + diceMap[p2];
        dDice.textContent = diceMap[d1] + diceMap[d2];
        
        const pTotal = p1 + p2;
        const dTotal = d1 + d2;
        
        if (pTotal > dTotal) {
          updateChanceBalance(b * 2);
          showCgMsg(ui, `Kazandın! (${pTotal} > ${dTotal})`, 'win');
        } else if (pTotal < dTotal) {
          showCgMsg(ui, `Kaybettin. (${pTotal} < ${dTotal})`, 'lose');
        } else {
          updateChanceBalance(b);
          showCgMsg(ui, `Beraberlik! (${pTotal} = ${dTotal}) - İade.`, 'draw');
        }
        playBtn.disabled = false;
      }, 1000);
    };
  }
};

// 17. HORSE RACING
window.ChanceGames.horse = {
  init: function(container) {
    const ui = createGameUI('At Yarışı', 'Kazanacak atı seç. Bahis yap ve yarışı başlat!');
    container.appendChild(ui);
    const betInput = setupBetControls(ui);
    const spec = ui.querySelector('#cgSpecificArea');
    
    const playBtn = document.createElement('button');
    playBtn.className = 'chance-action-btn';
    playBtn.textContent = '▶ Yarışı Başlat';
    
    const track = document.createElement('div');
    track.style.cssText = 'width:100%; background:var(--bg2); padding:1rem; border-radius:10px; margin: 1rem 0; overflow:hidden; position:relative; border-right:5px solid #fff;';
    
    const horses = [
      { id: 0, name: 'Red Bolt', color: '#e74c3c', em: '🐎', odds: 2, el: null },
      { id: 1, name: 'Blue Wind', color: '#3498db', em: '🐎', odds: 3, el: null },
      { id: 2, name: 'Green Flash', color: '#2ecc71', em: '🐎', odds: 5, el: null },
      { id: 3, name: 'Golden Star', color: '#f1c40f', em: '🐎', odds: 10, el: null }
    ];
    
    let selectedHorse = 0;
    
    const selector = document.createElement('div');
    selector.style.cssText = 'display:flex; gap:10px; margin-bottom:1rem; flex-wrap:wrap; justify-content:center;';
    horses.forEach((h, i) => {
      const btn = document.createElement('button');
      btn.className = 'chance-choice-btn' + (i === 0 ? ' selected' : '');
      btn.innerHTML = `${h.em} ${h.name} (${h.odds}x)`;
      btn.style.color = h.color;
      btn.onclick = () => {
        if(playBtn.disabled) return;
        selectedHorse = i;
        Array.from(selector.children).forEach(c => c.classList.remove('selected'));
        btn.classList.add('selected');
      };
      selector.appendChild(btn);
    });
    
    horses.forEach(h => {
      const row = document.createElement('div');
      row.style.cssText = 'width:100%; height:40px; border-bottom:1px dashed var(--gb); display:flex; align-items:center; position:relative;';
      const hEl = document.createElement('div');
      hEl.style.cssText = 'font-size:2rem; position:absolute; left:0; transition: left 0.1s linear;';
      hEl.innerHTML = h.em;
      h.el = hEl;
      row.appendChild(hEl);
      track.appendChild(row);
    });
    
    spec.appendChild(selector);
    spec.appendChild(track);
    spec.appendChild(playBtn);
    
    playBtn.onclick = () => {
      const b = parseInt(betInput.value);
      if (isNaN(b) || b <= 0 || b > window.chanceBalance) return showCgMsg(ui, 'Yetersiz bakiye', 'lose');
      updateChanceBalance(-b);
      playBtn.disabled = true;
      
      horses.forEach(h => { h.pos = 0; h.el.style.left = '0%'; });
      showCgMsg(ui, 'Yarış başladı!', '');
      
      const raceInt = setInterval(() => {
        let finished = false;
        let winner = null;
        
        horses.forEach(h => {
          const speed = (Math.random() * 2) + (10 / h.odds) * 0.3; 
          h.pos += speed;
          if (h.pos >= 90) { h.pos = 90; finished = true; if(!winner) winner = h; }
          h.el.style.left = h.pos + '%';
        });
        
        if (finished) {
          clearInterval(raceInt);
          if (winner.id === selectedHorse) {
            const win = b * winner.odds;
            updateChanceBalance(win);
            showCgMsg(ui, `${winner.name} kazandı! ${win} 💰 aldın!`, 'win');
          } else {
            showCgMsg(ui, `${winner.name} kazandı. Bahsin kaybetti!`, 'lose');
          }
          playBtn.disabled = false;
        }
      }, 100);
    };
  }
};

// 18. VIDEO POKER
window.ChanceGames.videopoker = {
  init: function(container) {
    const ui = createGameUI('Video Poker', '5 kart çek, tuttuklarını seç, kalanı değiştir. Kazan!');
    container.appendChild(ui);
    const betInput = setupBetControls(ui);
    const spec = ui.querySelector('#cgSpecificArea');
    
    const playBtn = document.createElement('button');
    playBtn.className = 'chance-action-btn';
    playBtn.textContent = '▶ Oyna';
    
    const deck = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
    const suits = ['♠','♥','♣','♦'];
    const handDiv = document.createElement('div');
    handDiv.style.cssText = 'display:flex; gap:10px; margin: 2rem 0;';
    
    let hand = [];
    let held = [false, false, false, false, false];
    let step = 0; // 0 = bet, 1 = hold
    let betAmt = 0;
    
    for(let i=0; i<5; i++) {
      const card = document.createElement('div');
      card.className = 'cg-playing-card';
      card.innerHTML = '🂠';
      card.onclick = () => {
        if(step !== 1) return;
        held[i] = !held[i];
        card.style.transform = held[i] ? 'translateY(-15px)' : 'translateY(0)';
        card.style.boxShadow = held[i] ? '0 0 15px var(--a3)' : '0 4px 8px rgba(0,0,0,0.5)';
      };
      handDiv.appendChild(card);
    }
    spec.appendChild(handDiv);
    spec.appendChild(playBtn);
    
    function getCard() {
      const r = deck[Math.floor(Math.random()*deck.length)];
      const s = suits[Math.floor(Math.random()*suits.length)];
      return {r, s, color: (s==='♥'||s==='♦') ? 'red' : 'black'};
    }
    
    function renderHand() {
      Array.from(handDiv.children).forEach((c, i) => {
        c.className = 'cg-playing-card ' + hand[i].color;
        c.innerHTML = hand[i].r + '<br>' + hand[i].s;
      });
    }
    
    function evaluateHand(h) {
      const counts = {};
      h.forEach(c => counts[c.r] = (counts[c.r] || 0) + 1);
      const vals = Object.values(counts).sort((a,b)=>b-a);
      if (vals[0] === 4) return {m:25, n:'Kare (4 of a Kind)'};
      if (vals[0] === 3 && vals[1] === 2) return {m:9, n:'Full House'};
      if (vals[0] === 3) return {m:3, n:'Üçlü (3 of a Kind)'};
      if (vals[0] === 2 && vals[1] === 2) return {m:2, n:'Döper (2 Pair)'};
      if (vals[0] === 2) {
        const pairRank = Object.keys(counts).find(k => counts[k] === 2);
        if(['J','Q','K','A'].includes(pairRank)) return {m:1, n:'Jacks or Better'};
      }
      return {m:0, n:'Yüksek Kart'};
    }
    
    playBtn.onclick = () => {
      if (step === 0) {
        const b = parseInt(betInput.value);
        if (isNaN(b) || b <= 0 || b > window.chanceBalance) return showCgMsg(ui, 'Yetersiz bakiye', 'lose');
        updateChanceBalance(-b);
        betAmt = b;
        hand = [getCard(), getCard(), getCard(), getCard(), getCard()];
        held = [false, false, false, false, false];
        renderHand();
        Array.from(handDiv.children).forEach(c => { c.style.transform = 'translateY(0)'; c.style.boxShadow = ''; });
        step = 1;
        playBtn.textContent = 'Kart Değiştir';
        showCgMsg(ui, 'Tutmak istediğin kartlara tıkla.', '');
      } else {
        for(let i=0; i<5; i++) {
          if(!held[i]) hand[i] = getCard();
        }
        renderHand();
        const res = evaluateHand(hand);
        if(res.m > 0) {
          const win = betAmt * res.m;
          updateChanceBalance(win);
          showCgMsg(ui, `${res.n}! ${win} 💰 kazandın.`, 'win');
        } else {
          showCgMsg(ui, 'Kazanamadın.', 'lose');
        }
        step = 0;
        playBtn.textContent = '▶ Oyna';
      }
    };
  }
};

// 19. BACCARAT
window.ChanceGames.baccarat = {
  init: function(container) {
    const ui = createGameUI('Baccarat', 'Banker, Oyuncu veya Beraberliğe bahis yap. 9a en yakın olan kazanır!');
    container.appendChild(ui);
    const betInput = setupBetControls(ui);
    const spec = ui.querySelector('#cgSpecificArea');
    
    const playBtn = document.createElement('button');
    playBtn.className = 'chance-action-btn';
    playBtn.textContent = '▶ Dağıt';
    
    const selector = document.createElement('div');
    selector.style.cssText = 'display:flex; gap:10px; margin-bottom:1rem;';
    const bets = [{id:'p', n:'Oyuncu (2x)'}, {id:'b', n:'Banker (1.95x)'}, {id:'t', n:'Beraberlik (8x)'}];
    let currentBet = 'p';
    
    bets.forEach(b => {
      const btn = document.createElement('button');
      btn.className = 'chance-choice-btn' + (b.id==='p'?' selected':'');
      btn.textContent = b.n;
      btn.onclick = () => {
        currentBet = b.id;
        Array.from(selector.children).forEach(c => c.classList.remove('selected'));
        btn.classList.add('selected');
      };
      selector.appendChild(btn);
    });
    
    const arena = document.createElement('div');
    arena.style.cssText = 'display:flex; justify-content:space-around; width: 100%; margin: 2rem 0;';
    
    const pBox = document.createElement('div'); pBox.innerHTML = '<div style="color:var(--a3);">Oyuncu</div><div class="cg-playing-card" style="margin:10px auto;">?</div>';
    const bBox = document.createElement('div'); bBox.innerHTML = '<div style="color:var(--danger);">Banker</div><div class="cg-playing-card" style="margin:10px auto;">?</div>';
    
    arena.appendChild(pBox); arena.appendChild(bBox);
    spec.appendChild(selector);
    spec.appendChild(arena);
    spec.appendChild(playBtn);
    
    playBtn.onclick = () => {
      const b = parseInt(betInput.value);
      if (isNaN(b) || b <= 0 || b > window.chanceBalance) return showCgMsg(ui, 'Yetersiz bakiye', 'lose');
      updateChanceBalance(-b);
      playBtn.disabled = true;
      
      const pScore = Math.floor(Math.random()*10);
      const bScore = Math.floor(Math.random()*10);
      
      pBox.children[1].textContent = pScore;
      bBox.children[1].textContent = bScore;
      
      let result = '';
      if(pScore > bScore) result = 'p';
      else if(bScore > pScore) result = 'b';
      else result = 't';
      
      if(result === currentBet) {
        let mult = result === 't' ? 8 : (result === 'b' ? 1.95 : 2);
        const win = Math.floor(b * mult);
        updateChanceBalance(win);
        showCgMsg(ui, 'Kazandın! ' + win + ' 💰 aldın.', 'win');
      } else {
        showCgMsg(ui, 'Kaybettin.', 'lose');
      }
      playBtn.disabled = false;
    };
  }
};

// 20. SIC BO
window.ChanceGames.sicbo = {
  init: function(container) {
    const ui = createGameUI('Sic Bo', '3 Zar Atılır. Toplam KÜÇÜK (4-10) veya BÜYÜK (11-17) mü gelecek? (2x)');
    container.appendChild(ui);
    const betInput = setupBetControls(ui);
    const spec = ui.querySelector('#cgSpecificArea');
    
    const playBtn = document.createElement('button');
    playBtn.className = 'chance-action-btn';
    playBtn.textContent = '▶ Zarları At';
    
    const selector = document.createElement('div');
    selector.style.cssText = 'display:flex; gap:10px; margin-bottom:1rem;';
    let currentBet = 's';
    
    const sBtn = document.createElement('button'); sBtn.className = 'chance-choice-btn selected'; sBtn.textContent = 'Küçük (4-10)';
    const bBtn = document.createElement('button'); bBtn.className = 'chance-choice-btn'; bBtn.textContent = 'Büyük (11-17)';
    sBtn.onclick = () => { currentBet = 's'; sBtn.classList.add('selected'); bBtn.classList.remove('selected'); };
    bBtn.onclick = () => { currentBet = 'b'; bBtn.classList.add('selected'); sBtn.classList.remove('selected'); };
    selector.appendChild(sBtn); selector.appendChild(bBtn);
    
    const diceDiv = document.createElement('div');
    diceDiv.style.cssText = 'font-size:4rem; margin: 2rem 0; text-align:center;';
    diceDiv.textContent = '🎲 🎲 🎲';
    
    spec.appendChild(selector);
    spec.appendChild(diceDiv);
    spec.appendChild(playBtn);
    
    playBtn.onclick = () => {
      const bet = parseInt(betInput.value);
      if (isNaN(bet) || bet <= 0 || bet > window.chanceBalance) return showCgMsg(ui, 'Yetersiz bakiye', 'lose');
      updateChanceBalance(-bet);
      
      const d1 = Math.floor(Math.random()*6)+1;
      const d2 = Math.floor(Math.random()*6)+1;
      const d3 = Math.floor(Math.random()*6)+1;
      const sum = d1+d2+d3;
      
      const diceMap = ['','⚀','⚁','⚂','⚃','⚄','⚅'];
      diceDiv.textContent = `${diceMap[d1]} ${diceMap[d2]} ${diceMap[d3]}`;
      
      let isSmall = sum >= 4 && sum <= 10;
      let isBig = sum >= 11 && sum <= 17;
      let isTriple = (d1===d2 && d2===d3);
      
      if(isTriple) {
        showCgMsg(ui, `Üçlü geldi! Kasa kazanır. (Toplam: ${sum})`, 'lose');
      } else if ( (currentBet === 's' && isSmall) || (currentBet === 'b' && isBig) ) {
        updateChanceBalance(bet * 2);
        showCgMsg(ui, `Kazandın! Toplam: ${sum}`, 'win');
      } else {
        showCgMsg(ui, `Kaybettin. Toplam: ${sum}`, 'lose');
      }
    };
  }
};

// 21. RADAR MINESWEEPER
window.ChanceGames.radar = {
  init: function(container) {
    const ui = createGameUI('Mayın Radarı', '5x5 Radar. Bastığın kare etrafındaki mayın sayısını söyler! (Mayına basma!)');
    container.appendChild(ui);
    const betInput = setupBetControls(ui);
    const spec = ui.querySelector('#cgSpecificArea');
    
    const playBtn = document.createElement('button');
    playBtn.className = 'chance-action-btn';
    playBtn.textContent = '▶ Radarı Başlat';
    
    let playing = false;
    let betAmt = 0;
    let safeClicks = 0;
    
    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid; grid-template-columns:repeat(5, 1fr); gap:5px; margin:2rem 0; width:100%; max-width:300px; aspect-ratio:1;';
    
    const cashoutBtn = document.createElement('button');
    cashoutBtn.className = 'chance-action-btn';
    cashoutBtn.style.background = 'var(--a4)';
    cashoutBtn.style.display = 'none';
    cashoutBtn.style.marginTop = '10px';
    cashoutBtn.textContent = 'Kazancı Al';
    
    let cells = [];
    let mineData = [];
    
    for(let r=0; r<5; r++) {
      for(let c=0; c<5; c++) {
        const cell = document.createElement('div');
        cell.style.cssText = 'background:rgba(255,255,255,0.1); border-radius:5px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:1.2rem; transition:0.2s;';
        const idx = r*5 + c;
        cell.onclick = () => clickCell(r, c, cell, idx);
        grid.appendChild(cell);
        cells.push(cell);
        mineData.push(false);
      }
    }
    
    function getMult() {
      return 1 + (safeClicks * 0.15); // +15% per safe click
    }
    
    function countMines(r, c) {
      let count = 0;
      for(let dr=-1; dr<=1; dr++) {
        for(let dc=-1; dc<=1; dc++) {
          let nr=r+dr, nc=c+dc;
          if(nr>=0&&nr<5&&nc>=0&&nc<5 && mineData[nr*5+nc]) count++;
        }
      }
      return count;
    }
    
    function clickCell(r, c, cell, idx) {
      if(!playing || cell.style.background !== 'rgba(255, 255, 255, 0.1)') return;
      if(mineData[idx]) {
        cell.style.background = 'var(--danger)'; cell.textContent = '💣';
        playing = false;
        showCgMsg(ui, 'MAYIN! Kaybettin.', 'lose');
        cashoutBtn.style.display = 'none'; playBtn.style.display = 'block';
        mineData.forEach((m, i) => { if(m && i !== idx) cells[i].textContent = '💣'; });
      } else {
        let count = countMines(r, c);
        cell.style.background = 'rgba(255,255,255,0.02)';
        cell.style.color = count > 0 ? 'var(--a3)' : 'var(--tx3)';
        cell.textContent = count > 0 ? count : '';
        safeClicks++;
        cashoutBtn.textContent = 'Al (' + Math.floor(betAmt * getMult()) + ' 💰)';
        
        if (safeClicks === 20) { 
          playing = false;
          const win = Math.floor(betAmt * getMult());
          updateChanceBalance(win);
          showCgMsg(ui, 'TEBRİKLER! Tüm güvenlileri buldun! ' + win + '💰 kazandın.', 'win');
          cashoutBtn.style.display = 'none'; playBtn.style.display = 'block';
        }
      }
    }
    
    playBtn.onclick = () => {
      const b = parseInt(betInput.value);
      if (isNaN(b) || b <= 0 || b > window.chanceBalance) return showCgMsg(ui, 'Yetersiz bakiye', 'lose');
      updateChanceBalance(-b);
      betAmt = b;
      playing = true;
      safeClicks = 0;
      
      mineData.fill(false);
      let placed = 0;
      while(placed < 5) {
        let i = Math.floor(Math.random()*25);
        if(!mineData[i]) { mineData[i] = true; placed++; }
      }
      
      cells.forEach(c => { c.style.background = 'rgba(255,255,255,0.1)'; c.textContent = ''; });
      showCgMsg(ui, 'Radar devrede. Mayınlara dikkat et!', '');
      playBtn.style.display = 'none';
      cashoutBtn.style.display = 'block';
      cashoutBtn.textContent = 'Kazancı Al';
    };
    
    cashoutBtn.onclick = () => {
      if(!playing) return;
      playing = false;
      const win = Math.floor(betAmt * getMult());
      updateChanceBalance(win);
      showCgMsg(ui, 'Çekildin! ' + win + ' 💰 kazandın.', 'win');
      cashoutBtn.style.display = 'none'; playBtn.style.display = 'block';
    };
    
    spec.appendChild(grid);
    spec.appendChild(playBtn);
    spec.appendChild(cashoutBtn);
  }
};

// 22. THREE CARD POKER
window.ChanceGames.threecard = {
  init: function(container) {
    const ui = createGameUI('Üç Kart Poker', 'Krupiyenin elini (GİZLİ) geçebilir misin? (2x)');
    container.appendChild(ui);
    const betInput = setupBetControls(ui);
    const spec = ui.querySelector('#cgSpecificArea');
    
    const playBtn = document.createElement('button');
    playBtn.className = 'chance-action-btn';
    playBtn.textContent = '▶ Dağıt';
    
    const arena = document.createElement('div');
    arena.style.cssText = 'display:flex; justify-content:space-around; width: 100%; margin: 2rem 0;';
    
    const pBox = document.createElement('div'); pBox.innerHTML = '<div style="color:var(--a3);">Sen</div><div class="cards" style="font-size:2rem; letter-spacing:5px;">🂠🂠🂠</div>';
    const dBox = document.createElement('div'); dBox.innerHTML = '<div style="color:var(--danger);">Krupiye</div><div class="cards" style="font-size:2rem; letter-spacing:5px;">🂠🂠🂠</div>';
    
    arena.appendChild(pBox); arena.appendChild(dBox);
    spec.appendChild(arena);
    spec.appendChild(playBtn);
    
    const deck = [2,3,4,5,6,7,8,9,10,11,12,13,14];
    function getHand() { return [deck[Math.floor(Math.random()*13)], deck[Math.floor(Math.random()*13)], deck[Math.floor(Math.random()*13)]].sort((a,b)=>b-a); }
    function rankToStr(r) { if(r<=10) return r; if(r==11) return 'J'; if(r==12) return 'Q'; if(r==13) return 'K'; return 'A'; }
    
    function evalHand(h) {
      if(h[0]==h[1] && h[1]==h[2]) return {v: 300+h[0], n:'Üçlü (Trips)'};
      if(h[0]==h[1] || h[1]==h[2]) return {v: 100+ (h[0]==h[1]?h[0]:h[1]), n:'Per (Pair)'};
      return {v: h[0], n:'Yüksek Kart ('+rankToStr(h[0])+')'};
    }
    
    playBtn.onclick = () => {
      const b = parseInt(betInput.value);
      if (isNaN(b) || b <= 0 || b > window.chanceBalance) return showCgMsg(ui, 'Yetersiz bakiye', 'lose');
      updateChanceBalance(-b);
      playBtn.disabled = true;
      
      const pHand = getHand();
      const dHand = getHand();
      
      pBox.children[1].textContent = pHand.map(rankToStr).join(' ');
      dBox.children[1].textContent = '🂠 🂠 🂠';
      showCgMsg(ui, 'Kartlar dağıtıldı. Krupiyenin eli açılıyor...', '');
      
      setTimeout(() => {
        dBox.children[1].textContent = dHand.map(rankToStr).join(' ');
        const pEval = evalHand(pHand);
        const dEval = evalHand(dHand);
        
        if (pEval.v > dEval.v) {
          updateChanceBalance(b * 2);
          showCgMsg(ui, `Kazandın! (${pEval.n} > ${dEval.n})`, 'win');
        } else if (pEval.v < dEval.v) {
          showCgMsg(ui, `Kaybettin! (${pEval.n} < ${dEval.n})`, 'lose');
        } else {
          updateChanceBalance(b);
          showCgMsg(ui, `Berabere! (${pEval.n}) - İade`, 'draw');
        }
        playBtn.disabled = false;
      }, 1500);
    };
  }
};
