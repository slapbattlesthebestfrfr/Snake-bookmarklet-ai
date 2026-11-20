const fs=require('fs');
(async()=>{
let src=fs.readFileSync(__dirname+'/src/snake.js','utf8');
src=src.split('\n').filter(l=>!l.includes('/*DBG*/')).join('\n');
let min;
try{
const {minify}=require('terser');
const r=await minify(src,{compress:{passes:2},mangle:true,format:{ascii_only:true,comments:false}});
min=r.code;
}catch(e){
console.warn('terser unavailable, using plain whitespace strip');
min=src.replace(/\/\*[\s\S]*?\*\//g,'').split('\n').map(l=>l.trim()).filter(Boolean).join('');
}
const bm='javascript:'+min.replace(/%/g,'%25').replace(/#/g,'%23').replace(/ /g,'%20').replace(/\n/g,'');
fs.writeFileSync(__dirname+'/bookmarklet.txt',bm);
fs.writeFileSync(__dirname+'/snake.min.js',min);
const loader="javascript:(function(){var%20s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/slapbattlesthebestfrfr/Snake-bookmarklet-ai@main/snake.min.js';document.body.appendChild(s)})()";
fs.writeFileSync(__dirname+'/loader.txt',loader);
const esc=bm.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const html=fs.readFileSync(__dirname+'/install.template.html','utf8').replace('__BOOKMARKLET__',()=>esc).replace('__BOOKMARKLET__','');
fs.writeFileSync(__dirname+'/index.html',html);
console.log('bookmarklet length',bm.length);
})();
