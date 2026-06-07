const fs = require('fs');

const cp1252_to_byte = {
  0x20AC: 0x80, // €
  0x201A: 0x82, // ‚
  0x0192: 0x83, // ƒ
  0x201E: 0x84, // „
  0x2026: 0x85, // …
  0x2020: 0x86, // †
  0x2021: 0x87, // ‡
  0x02C6: 0x88, // ˆ
  0x2030: 0x89, // ‰
  0x0160: 0x8A, // Š
  0x2039: 0x8B, // ‹
  0x0152: 0x8C, // Œ
  0x017D: 0x8E, // Ž
  0x2018: 0x91, // ‘
  0x2019: 0x92, // ’
  0x201C: 0x93, // “
  0x201D: 0x94, // ”
  0x2022: 0x95, // •
  0x2013: 0x96, // –
  0x2014: 0x97, // —
  0x02DC: 0x98, // ˜
  0x2122: 0x99, // ™
  0x0161: 0x9A, // š
  0x203A: 0x9B, // ›
  0x0153: 0x9C, // œ
  0x017E: 0x9E, // ž
  0x0178: 0x9F  // Ÿ
};

let content = fs.readFileSync('app.js', 'utf8');
let buf = Buffer.alloc(content.length);

let lostCount = 0;
for (let i = 0; i < content.length; i++) {
  let c = content.charCodeAt(i);
  if (cp1252_to_byte[c] !== undefined) {
    buf[i] = cp1252_to_byte[c];
  } else if (c <= 0xFF) {
    buf[i] = c;
  } else {
    // This shouldn't happen if it was purely encoded from CP1252
    buf[i] = 0x3F; // '?'
    lostCount++;
  }
}

let restored = buf.toString('utf8');

fs.writeFileSync('app.js', restored, 'utf8');
console.log(`Successfully recovered encoding! Lost/Unknown characters: ${lostCount}`);
