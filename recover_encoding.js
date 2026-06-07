const fs = require('fs');
let content = fs.readFileSync('app.js', 'utf8');

// The file was saved as UTF-8 but contains mojibake from an ANSI read.
// Let's try converting it back.
try {
  let buf = Buffer.from(content, 'latin1'); // latin1 maps 1:1 to bytes 0-255
  let restored = buf.toString('utf8');
  
  // Test if restoration makes sense
  if (restored.includes('Kişisel Seslendirmen') || restored.includes('Oyunlar')) {
    fs.writeFileSync('app.js.restored', restored, 'utf8');
    console.log("Restoration successful! Wrote to app.js.restored");
  } else {
    console.log("Restoration failed, did not find expected strings.");
    console.log("Sample:", restored.substring(0, 200));
  }
} catch(e) {
  console.log("Error:", e);
}
