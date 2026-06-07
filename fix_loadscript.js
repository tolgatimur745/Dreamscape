const fs = require('fs');
let content = fs.readFileSync('app.js', 'utf8');
const target = `const loadScript = (url) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(\`script[src="\${url}"]\`)) return resolve();
    const script = document.createElement('script');
    script.src = url;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};`;

let count = 0;
let newContent = content.replace(target, () => {
  count++;
  return count === 2 ? '' : target; // Remove only the second occurrence
});

// actually, string.replace(target, '') will just replace the first one. Let's use lastIndexOf.
let lastIdx = content.lastIndexOf(target);
if(lastIdx !== -1 && content.indexOf(target) !== lastIdx) {
  content = content.substring(0, lastIdx) + content.substring(lastIdx + target.length);
  fs.writeFileSync('app.js', content, 'utf8');
  console.log('Duplicate loadScript removed.');
} else {
  console.log('Not found or no duplicate.');
}
