const fs = require('fs');
let content = fs.readFileSync('app.js', 'utf8');

const targetStr = `      var itemsToRender = visibleItems; // always exclude hidden items from main groups`;
const insertStr = `      // Check if grid should be hidden initially based on local storage
      var state = JSON.parse(localStorage.getItem('ds_hub_collapsed') || '{}');
      if (state[cat.label] === true) {
        grid.style.display = 'none';
      }
      
      var itemsToRender = visibleItems; // always exclude hidden items from main groups`;

if (content.includes(targetStr) && !content.includes("Check if grid should be hidden initially")) {
  content = content.replace(targetStr, insertStr);
  fs.writeFileSync('app.js', content, 'utf8');
  console.log('Grid collapse logic added successfully.');
} else {
  console.log('Target string not found or already injected.');
}
