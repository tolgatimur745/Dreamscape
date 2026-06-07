const fs = require('fs');
const path = './app.js';

let content = fs.readFileSync(path, 'utf8');

// Find the start and end of HUB_CATS
const startIdx = content.indexOf('var HUB_CATS = [');
let endIdx = content.indexOf('  ];', startIdx);
// Let's find the exact end.
if(endIdx === -1) {
  console.log("Could not find end of HUB_CATS");
  process.exit(1);
}
endIdx += 4; // include '  ];'

const hubCatsStr = content.substring(startIdx, endIdx);

// Parse it safely
let HUB_CATS = eval(hubCatsStr.replace('var HUB_CATS =', '') + ';');

// 1. Merge "Ek Oyunlar (Chill)", "İmparatorluk & Simülasyon" into "Oyunlar"
let gamesCat = HUB_CATS.find(c => c.label.includes('Oyunlar') && !c.label.includes('Ek Oyunlar'));
if (!gamesCat) {
  gamesCat = { label: '🎮 Oyunlar', items: [] };
  HUB_CATS.unshift(gamesCat);
}

const catsToMergeToGames = ['Ek Oyunlar', 'İmparatorluk & Simülasyon'];
for (const cat of HUB_CATS) {
  if (cat !== gamesCat && catsToMergeToGames.some(c => cat.label.includes(c))) {
    gamesCat.items.push(...cat.items);
    cat.items = []; // mark for deletion
  }
}

// 2. Rename "Araçlar & Kişisel" to "Araçlar & Araç Çantası", move "Hayat Kolaylaştıranlar" into it.
let toolsCat = HUB_CATS.find(c => c.label.includes('Araçlar & Kişisel') || c.label.includes('Araçlar'));
if (toolsCat) {
  toolsCat.label = '🛠️ Araç Çantası & Kişisel Takip';
  
  const catsToMergeToTools = ['Hayat Kolaylaştıranlar', 'Ekran & Yayıncı Araçları'];
  for (const cat of HUB_CATS) {
    if (cat !== toolsCat && catsToMergeToTools.some(c => cat.label.includes(c))) {
      toolsCat.items.push(...cat.items);
      cat.items = []; // mark for deletion
    }
  }
}

// Clean up empty categories
HUB_CATS = HUB_CATS.filter(c => c.items && c.items.length > 0);

// Stringify HUB_CATS back to code format
let newHubCatsStr = 'var HUB_CATS = [\n';
for(let i=0; i<HUB_CATS.length; i++) {
  const cat = HUB_CATS[i];
  newHubCatsStr += `    { label: '${cat.label}', items: [\n`;
  for(let j=0; j<cat.items.length; j++) {
    const item = cat.items[j];
    newHubCatsStr += `      {em:'${item.em}', ttl:'${item.ttl.replace(/'/g, "\\'")}', dsc:'${item.dsc.replace(/'/g, "\\'")}', id:'${item.id}'}${j === cat.items.length - 1 ? '' : ','}\n`;
  }
  newHubCatsStr += `    ]}${i === HUB_CATS.length - 1 ? '' : ','}\n`;
}
newHubCatsStr += '  ];';

content = content.replace(hubCatsStr, newHubCatsStr);

// 3. Add Collapse button logic to buildHubCards
const oldLblWrapperCode = `      var lblWrapper = document.createElement('div');
      lblWrapper.style.display = 'flex';
      lblWrapper.style.alignItems = 'center';
      lblWrapper.style.marginBottom = '15px';
      
      var lbl = document.createElement('div');
      lbl.className = 'hub-cat';
      lbl.textContent = cat.label;
      lbl.style.margin = '0';
      lbl.style.flex = '1';
      
      lblWrapper.appendChild(lbl);`;

const newLblWrapperCode = `      var lblWrapper = document.createElement('div');
      lblWrapper.style.display = 'flex';
      lblWrapper.style.alignItems = 'center';
      lblWrapper.style.marginBottom = '15px';
      
      var lbl = document.createElement('div');
      lbl.className = 'hub-cat';
      lbl.textContent = cat.label;
      lbl.style.margin = '0';
      lbl.style.flex = '1';
      lbl.style.cursor = 'pointer';
      
      var grid = document.createElement('div');
      grid.className = 'hub-grid';

      // Check collapsed state from localStorage
      var collapsedState = JSON.parse(localStorage.getItem('ds_hub_collapsed') || '{}');
      var isCollapsed = collapsedState[cat.label] === true;
      if (isCollapsed) grid.style.display = 'none';
      
      var collapseBtn = document.createElement('button');
      collapseBtn.innerHTML = isCollapsed ? '🔽' : '🔼';
      collapseBtn.style.cssText = 'background:none;border:none;color:var(--tx2);font-size:18px;cursor:pointer;margin-right:10px;transition:0.3s;';
      
      var toggleCat = function() {
        var state = JSON.parse(localStorage.getItem('ds_hub_collapsed') || '{}');
        if(grid.style.display === 'none') {
          grid.style.display = '';
          collapseBtn.innerHTML = '🔼';
          state[cat.label] = false;
        } else {
          grid.style.display = 'none';
          collapseBtn.innerHTML = '🔽';
          state[cat.label] = true;
        }
        localStorage.setItem('ds_hub_collapsed', JSON.stringify(state));
      };
      
      collapseBtn.onclick = toggleCat;
      lbl.onclick = toggleCat;
      
      lblWrapper.insertBefore(collapseBtn, lblWrapper.firstChild);
      lblWrapper.appendChild(lbl);`;

const oldGridCode = `      var grid = document.createElement('div');
      grid.className = 'hub-grid';`;

// Because grid is already created above in the new code, we remove it from the old spot
content = content.replace(oldLblWrapperCode, newLblWrapperCode);
content = content.replace(oldGridCode, '      // grid already created above');

fs.writeFileSync(path, content, 'utf8');
console.log("Categories refactored and collapse logic added.");
