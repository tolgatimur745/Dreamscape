const fs = require('fs');
let content = fs.readFileSync('app.js', 'utf8');

const backBtn = `<button class="chance-back-btn" style="position:absolute;top:20px;left:20px;z-index:100;cursor:pointer;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);color:var(--tx);padding:8px 16px;border-radius:8px;font-size:14px;" onclick="if(typeof dsGoToSection==='function') dsGoToSection('hubPage','')">◀ Ana Sayfa</button>`;

function fixSection(id) {
  // Replace `<section id="ID" class="page-sec"` with `<section id="ID" class="section ds-section"`
  // and inject the back button right after the >
  let regex = new RegExp(`(<section\\s+id="${id}"\\s+class=")(?:page-sec)(".*?)(>)`, 'g');
  
  if (!content.match(regex)) {
    console.log('Could not find class="page-sec" for', id, '- perhaps already fixed?');
    // Try without page-sec constraint just in case
    let regex2 = new RegExp(`(<section\\s+id="${id}"\\s+class=")(?:section ds-section)(".*?)(>)`, 'g');
    if (content.match(regex2) && !content.includes(`dsGoToSection('hubPage'`)) {
      content = content.replace(regex2, `$1section ds-section$2$3\n  ${backBtn}\n`);
    }
  } else {
    // Add position:relative and min-height:100vh to style if not exists
    content = content.replace(regex, (match, p1, p2, p3) => {
      let newStyle = p2;
      if (!newStyle.includes('position:')) newStyle = newStyle.replace('style="', 'style="position:relative; min-height:100vh; background:var(--bg); ');
      return `${p1}section ds-section${newStyle}${p3}\n  ${backBtn}\n`;
    });
    console.log('Fixed', id);
  }
}

fixSection('tts-reader-sec');
fixSection('screen-caster-sec');
fixSection('lofi-maker-sec');
fixSection('tamagotchi-sec');
fixSection('audio-3d-sec');
fixSection('studio-piano-sec');

fs.writeFileSync('app.js', content, 'utf8');
console.log('Finished applying classes and back buttons.');
