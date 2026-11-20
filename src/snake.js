(function(){
var ID='__snake_bm__';
var old=document.getElementById(ID);
if(old){old.__close();return;}
var N=20,best=0;
try{best=+localStorage.getItem(ID+'best')||0;}catch(e){}
var ov=document.createElement('div');
ov.id=ID;
ov.style.cssText='position:fixed;left:0;top:0;right:0;bottom:0;z-index:2147483647;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center;font-family:-apple-system,Helvetica,Arial,sans-serif;touch-action:none;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent';
var box=document.createElement('div');
var vw=Math.min(window.innerWidth,window.innerHeight);
var size=Math.max(200,Math.min(420,vw-60));
size=Math.floor(size/N)*N;
box.style.cssText='background:#111;border-radius:14px;padding:12px;box-shadow:0 10px 40px rgba(0,0,0,.6);color:#eee;text-align:center;max-width:96vw';
var hud=document.createElement('div');
hud.style.cssText='display:flex;justify-content:space-between;font-size:15px;margin-bottom:8px;font-weight:600';
var sc=document.createElement('span'),bs=document.createElement('span');
hud.appendChild(sc);hud.appendChild(bs);
var cv=document.createElement('canvas');
cv.width=cv.height=size;
cv.style.cssText='display:block;margin:0 auto;border-radius:8px;background:#1b1b1b;touch-action:none';
var hint=document.createElement('div');
hint.style.cssText='font-size:12px;opacity:.65;margin-top:8px';
hint.textContent='Arrows/WASD or swipe • Space = pause • Esc or tap outside = close';
var bar=document.createElement('div');
bar.style.cssText='margin-top:10px;display:flex;gap:8px;justify-content:center';
function btn(t,f){var b=document.createElement('button');b.textContent=t;b.style.cssText='font-size:16px;padding:10px 18px;border-radius:10px;border:0;background:#2e7d32;color:#fff;font-weight:600;min-width:90px';b.addEventListener('click',function(e){e.stopPropagation();f();});bar.appendChild(b);return b;}
btn('Restart',function(){reset(true);});
btn('Pause',function(){togglePause();});
btn('Close',function(){close();});
box.appendChild(hud);box.appendChild(cv);box.appendChild(hint);box.appendChild(bar);
ov.appendChild(box);
document.body.appendChild(ov);
var g=cv.getContext('2d'),cs=size/N;
var snake,dir,queue,food,score,state,timer,speed;
function reset(go){
snake=[{x:10,y:10},{x:9,y:10},{x:8,y:10}];
dir={x:1,y:0};queue=[];score=0;speed=140;
placeFood();
state=go?'play':'ready';
clearTimeout(timer);
if(go)tick();
draw();
}
function placeFood(){
var f;
do{f={x:Math.floor(Math.random()*N),y:Math.floor(Math.random()*N)};}
while(snake.some(function(s){return s.x===f.x&&s.y===f.y;}));
food=f;
}
function turn(x,y){
if(state==='over')return;
var last=queue.length?queue[queue.length-1]:dir;
if(last.x===-x&&last.y===-y)return;
if(last.x===x&&last.y===y)return;
if(queue.length<3)queue.push({x:x,y:y});
if(state==='ready'){state='play';tick();}
}
function togglePause(){
if(state==='play'){state='pause';clearTimeout(timer);}
else if(state==='pause'){state='play';tick();}
draw();
}
function tick(){
if(state!=='play')return;
if(queue.length)dir=queue.shift();
var h={x:snake[0].x+dir.x,y:snake[0].y+dir.y};
var eat=h.x===food.x&&h.y===food.y;
var body=eat?snake:snake.slice(0,-1);
if(h.x<0||h.y<0||h.x>=N||h.y>=N||body.some(function(s){return s.x===h.x&&s.y===h.y;})){
state='over';
if(score>best){best=score;try{localStorage.setItem(ID+'best',best);}catch(e){}}
draw();return;
}
snake.unshift(h);
if(eat){score++;speed=Math.max(65,speed-4);placeFood();}else snake.pop();
draw();
timer=setTimeout(tick,speed);
}
function rr(x,y,w,h,r,c){g.fillStyle=c;g.beginPath();if(g.roundRect)g.roundRect(x,y,w,h,r);else g.rect(x,y,w,h);g.fill();}
function msg(a,b){
g.fillStyle='rgba(0,0,0,.6)';g.fillRect(0,0,size,size);
g.fillStyle='#fff';g.textAlign='center';
g.font='bold '+Math.round(size/11)+'px sans-serif';g.fillText(a,size/2,size/2-4);
g.font=Math.round(size/22)+'px sans-serif';g.fillText(b,size/2,size/2+size/12);
}
function draw(){
g.clearRect(0,0,size,size);
g.fillStyle='#202020';
for(var i=0;i<N;i++)for(var j=0;j<N;j++)if((i+j)%2)g.fillRect(i*cs,j*cs,cs,cs);
rr(food.x*cs+2,food.y*cs+2,cs-4,cs-4,cs/2,'#e53935');
snake.forEach(function(s,k){rr(s.x*cs+1,s.y*cs+1,cs-2,cs-2,4,k?'#66bb6a':'#a5d6a7');});
sc.textContent='Score: '+score;bs.textContent='Best: '+best;
if(state==='ready')msg('Snake','Press an arrow key or swipe');
else if(state==='pause')msg('Paused','Space to resume');
else if(state==='over')msg('Game over','Space / Enter / tap to play again');
}
function onKey(e){
var k=e.key,used=true;
if(k==='ArrowUp'||k==='w'||k==='W')turn(0,-1);
else if(k==='ArrowDown'||k==='s'||k==='S')turn(0,1);
else if(k==='ArrowLeft'||k==='a'||k==='A')turn(-1,0);
else if(k==='ArrowRight'||k==='d'||k==='D')turn(1,0);
else if(k===' '||k==='Enter'){if(state==='over')reset(true);else togglePause();}
else if(k==='r'||k==='R')reset(true);
else if(k==='Escape')close();
else used=false;
if(used){e.preventDefault();e.stopPropagation();}
}
window.addEventListener('keydown',onKey,true);
var tx,ty;
cv.addEventListener('touchstart',function(e){var t=e.touches[0];tx=t.clientX;ty=t.clientY;e.preventDefault();},{passive:false});
cv.addEventListener('touchmove',function(e){
e.preventDefault();
if(tx==null)return;
var t=e.touches[0],dx=t.clientX-tx,dy=t.clientY-ty;
if(Math.max(Math.abs(dx),Math.abs(dy))<20)return;
if(Math.abs(dx)>Math.abs(dy))turn(dx>0?1:-1,0);else turn(0,dy>0?1:-1);
tx=t.clientX;ty=t.clientY;
},{passive:false});
cv.addEventListener('touchend',function(e){
e.preventDefault();
if(tx!=null&&state==='over'){reset(true);}
else if(tx!=null&&state==='ready'){}
tx=null;
},{passive:false});
cv.addEventListener('click',function(e){e.stopPropagation();if(state==='over')reset(true);});
ov.addEventListener('touchmove',function(e){e.preventDefault();},{passive:false});
ov.addEventListener('click',function(e){if(!box.contains(e.target))close();});
function close(){
clearTimeout(timer);state='closed';
window.removeEventListener('keydown',onKey,true);
if(ov.parentNode)ov.parentNode.removeChild(ov);
}
ov.__close=close;
var prevOverflow=document.documentElement.style.overflow;
reset(false);
})();
