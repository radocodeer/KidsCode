const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\a90008457\\.gemini\\antigravity\\brain\\210fe984-11d2-410b-ae0f-70a316704935';
const destDir = 'c:\\Code_R\\KidsCode\\public';

const files = {
  'us_1784872403058.png': 'us.png',
  '1_1784872410419.png': '1.png',
  '2_1784872420458.png': '2.png',
  '3_1784872429068.png': '3.png',
  '4_1784872442999.png': '4.png'
};

for (const [src, dest] of Object.entries(files)) {
  fs.copyFileSync(path.join(srcDir, src), path.join(destDir, dest));
}
console.log('Images copied successfully.');
