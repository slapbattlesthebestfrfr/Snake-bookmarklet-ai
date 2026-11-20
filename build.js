const fs=require('fs');
const src=fs.readFileSync(__dirname+'/src/snake.js','utf8');
const min=src.split('\n').map(l=>l.trim()).filter(Boolean).join('');
const bm='javascript:'+encodeURIComponent(min);
fs.writeFileSync(__dirname+'/bookmarklet.txt',bm);
const html=fs.readFileSync(__dirname+'/install.template.html','utf8').replace('__BOOKMARKLET__',bm.replace(/"/g,'&quot;'));
fs.writeFileSync(__dirname+'/index.html',html);
console.log('bookmarklet length',bm.length);
