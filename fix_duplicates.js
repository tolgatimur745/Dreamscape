const fs = require('fs');
let content = fs.readFileSync('app.js', 'utf8');

const startIdx = content.indexOf('var HUB_CATS = [');
const endIdx = content.indexOf('  ];', startIdx) + 4;
const hubCatsStr = content.substring(startIdx, endIdx);

let HUB_CATS = eval(hubCatsStr.replace('var HUB_CATS =', '') + ';');

let gamesCat = HUB_CATS.find(c => c.label.includes('Oyunlar') && !c.label.includes('Ek'));
if (gamesCat) {
  // Remove duplicates
  const uniqueItems = [];
  const seenIds = new Set();
  for (let item of gamesCat.items) {
    if (!seenIds.has(item.id)) {
      seenIds.add(item.id);
      uniqueItems.push(item);
    }
  }
  gamesCat.items = uniqueItems;
}

let newHubCatsStr = 'var HUB_CATS = [\n';
for(let i=0; i<HUB_CATS.length; i++) {
  const cat = HUB_CATS[i];
  newHubCatsStr += "    { label: '" + cat.label + "', items: [\n";
  for(let j=0; j<cat.items.length; j++) {
    const item = cat.items[j];
    newHubCatsStr += "      {em:'" + item.em + "', ttl:'" + item.ttl.replace(/'/g, "\\'") + "', dsc:'" + item.dsc.replace(/'/g, "\\'") + "', id:'" + item.id + "'}" + (j === cat.items.length - 1 ? '' : ',') + "\n";
  }
  newHubCatsStr += "    ]}" + (i === HUB_CATS.length - 1 ? '' : ',') + "\n";
}
newHubCatsStr += '  ];';

content = content.replace(hubCatsStr, newHubCatsStr);
fs.writeFileSync('app.js', content, 'utf8');
console.log('HUB_CATS duplicates removed.');
