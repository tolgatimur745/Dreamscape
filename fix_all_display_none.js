const fs = require('fs');
let content = fs.readFileSync('app.js', 'utf8');

// Use a regex to match <section ... style="display:none; and variations
let regex = /(<section[^>]+style="[^"]*)display:\s*none;?\s*/gi;
let newContent = content.replace(regex, '$1');

// Also some might be style=" display:none; " so the regex handles that via \s*
// Let's verify how many were replaced
let diff = content.length - newContent.length;

if (diff > 0) {
  fs.writeFileSync('app.js', newContent, 'utf8');
  console.log('Removed inline display:none from sections. Diff length:', diff);
} else {
  console.log('No inline display:none found in <section> tags.');
}
