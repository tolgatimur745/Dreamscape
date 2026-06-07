const fs = require('fs');
fs.copyFileSync('app.js.ps_restored', 'app.js');
console.log('Restored the perfect file to app.js');
