const fs = require('fs');
let content = fs.readFileSync('app.js', 'utf8');

// Replace all instances where I appended to hubMain instead of document.body
let count = 0;
content = content.replace(/document\.getElementById\('hubMain'\)\.insertAdjacentHTML\('afterend',\s*`/g, () => {
  count++;
  return "document.body.insertAdjacentHTML('beforeend', `";
});

if (count > 0) {
  fs.writeFileSync('app.js', content, 'utf8');
  console.log(`Fixed ${count} instances of incorrect append target.`);
} else {
  console.log('No instances found.');
}
