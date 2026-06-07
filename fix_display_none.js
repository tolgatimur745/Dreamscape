const fs = require('fs');
let content = fs.readFileSync('app.js', 'utf8');

// Replace all instances of `style="display:none; ` with `style="`
// But to be safe, I'll match the exact strings from the insertions.
content = content.replace(/style="display:none; max-width:800px; margin:0 auto; padding:40px 20px;"/g, 'style="max-width:800px; margin:0 auto; padding:40px 20px;"');
content = content.replace(/style="display:none; max-width:600px; margin:0 auto; padding:40px 20px;"/g, 'style="max-width:600px; margin:0 auto; padding:40px 20px;"');
content = content.replace(/style="display:none; padding:40px 20px;"/g, 'style="padding:40px 20px;"');
content = content.replace(/style="display:none; padding:40px 20px; max-width:800px; margin:0 auto;"/g, 'style="padding:40px 20px; max-width:800px; margin:0 auto;"');

// Just in case there are others
content = content.replace(/<section id="([^"]+)" class="page-sec" style="display:none;/g, '<section id="$1" class="page-sec" style="');

fs.writeFileSync('app.js', content, 'utf8');
console.log('Removed inline display:none from new sections.');
