const fs = require('fs');
let content = fs.readFileSync('app.js', 'utf8');

// The corrupted block:
const corrupt = `    'Nesneler & Semboller': ['💎','👑','⚔️','🔮','💣','🗝️','📚','💡','🔑',
      var grid = document.createElement('div');
      grid.className = 'hub-grid';
      if (isCollapsed) grid.style.display = 'none';
    ]`;

const correct = `    'Nesneler & Semboller': ['💎','👑','⚔️','🔮','💣','🗝️','📚','💡','🔑','🎁','💌','🌟','⚡','🔥','💰']`;

if(content.includes(corrupt)) {
  content = content.replace(corrupt, correct);
  console.log("Fixed corrupted emoji array.");
} else {
  console.log("Could not find corrupt text.");
}

// And fix the bad injection at 2601
const badInjection = `        var xOffset = r * Math.cos(Math.PI * pct * 2);
        mctx.fillStyle = 'rgba(230,230,210,0.9)';
        var EMOJIS = {'Nesneler & Semboller': ['💎','👑','⚔️','🔮','💣','🗝️','📚','💡','🔑','🎁','💌','🌟','⚡','🔥','💰']};
        mctx.beginPath(); mctx.arc(W/2,H/2,r,-Math.PI/2,Math.PI/2); mctx.fill();`;

const goodInjection = `        var xOffset = r * Math.cos(Math.PI * pct * 2);
        mctx.fillStyle = 'rgba(230,230,210,0.9)';
        mctx.beginPath(); mctx.arc(W/2,H/2,r,-Math.PI/2,Math.PI/2); mctx.fill();`;

if(content.includes(badInjection)) {
  content = content.replace(badInjection, goodInjection);
  console.log("Fixed bad injection at 2601.");
}

fs.writeFileSync('app.js', content, 'utf8');
