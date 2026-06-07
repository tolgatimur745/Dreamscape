const fs = require('fs');
let content = fs.readFileSync('app.js', 'utf8');

const targetStr = `      var lblWrapper = document.createElement('div');
      lblWrapper.style.display = 'flex';
      lblWrapper.style.alignItems = 'center';
      lblWrapper.style.marginBottom = '15px';
      
      var lbl = document.createElement('div');
      lbl.className = 'hub-cat';
      lbl.textContent = cat.label;
      lbl.style.margin = '0';
      lbl.style.flex = '1';
      
      lblWrapper.appendChild(lbl);`;

const replacementStr = `      var lblWrapper = document.createElement('div');
      lblWrapper.style.display = 'flex';
      lblWrapper.style.alignItems = 'center';
      lblWrapper.style.marginBottom = '15px';
      
      var lbl = document.createElement('div');
      lbl.className = 'hub-cat';
      lbl.textContent = cat.label;
      lbl.style.margin = '0';
      lbl.style.flex = '1';
      lbl.style.cursor = 'pointer';
      lbl.style.userSelect = 'none';
      
      var collapsedState = JSON.parse(localStorage.getItem('ds_hub_collapsed') || '{}');
      var isCollapsed = collapsedState[cat.label] === true;
      
      var collapseBtn = document.createElement('button');
      collapseBtn.innerHTML = isCollapsed ? '🔽' : '🔼';
      collapseBtn.style.cssText = 'background:none;border:none;color:var(--tx2);font-size:18px;cursor:pointer;margin-right:10px;transition:0.3s;padding:0;display:flex;align-items:center;justify-content:center;';
      
      var toggleCat = function() {
        var gridEl = catWrapper.querySelector('.hub-grid');
        if(!gridEl) return;
        var state = JSON.parse(localStorage.getItem('ds_hub_collapsed') || '{}');
        if(gridEl.style.display === 'none') {
          gridEl.style.display = '';
          collapseBtn.innerHTML = '🔼';
          state[cat.label] = false;
        } else {
          gridEl.style.display = 'none';
          collapseBtn.innerHTML = '🔽';
          state[cat.label] = true;
        }
        localStorage.setItem('ds_hub_collapsed', JSON.stringify(state));
      };
      
      collapseBtn.onclick = toggleCat;
      lbl.onclick = toggleCat;
      
      lblWrapper.appendChild(collapseBtn);
      lblWrapper.appendChild(lbl);`;

// Let's use regex to be insensitive to line ending or minor spacing diffs
const regex = /var lblWrapper = document\.createElement\('div'\);\s*lblWrapper\.style\.display = 'flex';\s*lblWrapper\.style\.alignItems = 'center';\s*lblWrapper\.style\.marginBottom = '15px';\s*var lbl = document\.createElement\('div'\);\s*lbl\.className = 'hub-cat';\s*lbl\.textContent = cat\.label;\s*lbl\.style\.margin = '0';\s*lbl\.style\.flex = '1';\s*lblWrapper\.appendChild\(lbl\);/m;

if(regex.test(content)) {
  content = content.replace(regex, replacementStr);
  fs.writeFileSync('app.js', content, 'utf8');
  console.log("Collapse logic successfully injected using REGEX!");
} else {
  console.log("Error: Regex target not found.");
}
