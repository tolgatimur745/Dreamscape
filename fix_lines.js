const fs = require('fs');
let lines = fs.readFileSync('app.js', 'utf8').split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Nesneler & Semboller') && lines[i].includes('grid')) {
    // wait, the corruption is multiline.
  }
}
// Actually, let's just splice it out since we know the exact line numbers (2840-2844).
// From line 2841: "      var grid = document.createElement('div');"
// line 2842: "      grid.className = 'hub-grid';"
// line 2843: "      if (isCollapsed) grid.style.display = 'none';"
// line 2844: "    ]"
// line 2840 has the 'Nesneler & Semboller' string.

lines[2840] = `    'Nesneler & Semboller': ['💎','👑','⚔️','🔮','💣','🗝️','📚','💡','🔑','🎁','💌','🌟','⚡','🔥','💰']`;
lines.splice(2841, 4); // Remove the bad 4 lines

fs.writeFileSync('app.js', lines.join('\n'), 'utf8');
