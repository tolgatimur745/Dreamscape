const fs = require('fs');
let content = fs.readFileSync('app.js', 'utf8');

const ttsItem = {em:'🗣️', ttl:'Kişisel Seslendirmen', dsc:'Metin ve PDF okuyucu', id:'tts-reader-sec'};
const screenItem = {em:'📱', ttl:'İkinci Monitör', dsc:'Canlı ekran yayını', id:'screen-caster-sec'};
const lofiItem = {em:'☕', ttl:'Otomatik Lo-Fi Yapıcı', dsc:'Sonsuz chill müzik', id:'lofi-maker-sec'};
const audio3dItem = {em:'🎧', ttl:'3D Ses Testi', dsc:'Uzamsal ses deneyimi', id:'audio-3d-sec'};
const pianoItem = {em:'🎹', ttl:'Stüdyo Piyanosu', dsc:'Gerçekçi kuyruklu piyano', id:'studio-piano-sec'};
const petItem = {em:'🦖', ttl:'Sanal Bebek', dsc:'Retro dijital evcil hayvan', id:'tamagotchi-sec'};

const startIdx = content.indexOf('var HUB_CATS = [');
const endIdx = content.indexOf('  ];', startIdx) + 4;
const hubCatsStr = content.substring(startIdx, endIdx);

let HUB_CATS = eval(hubCatsStr.replace('var HUB_CATS =', '') + ';');

let toolsCat = HUB_CATS.find(c => c.label.includes('Araç Çantası') || c.label.includes('Araçlar'));
if (toolsCat) {
  toolsCat.items.push(ttsItem, screenItem);
}

let musicCat = HUB_CATS.find(c => c.label.includes('Müzik & Ritim') || c.label.includes('Müzik'));
if (musicCat) {
  musicCat.items.push(lofiItem, audio3dItem, pianoItem);
}

let gamesCat = HUB_CATS.find(c => c.label.includes('Oyunlar') && !c.label.includes('Ek'));
if (gamesCat) {
  gamesCat.items.push(petItem);
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
console.log('HUB_CATS updated with 6 new features without syntax errors.');
