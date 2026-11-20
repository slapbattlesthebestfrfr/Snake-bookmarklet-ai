try{(function(){
var ID='__snake_bm__',old=document.getElementById(ID);
if(old){old.__close();return;}
var N=20,HUD=38,dpr=Math.min(window.devicePixelRatio||1,3);
var FONT='-apple-system,Helvetica,Arial,sans-serif';
var MODES=[
{id:'classic',name:'Classic',desc:'Walls are deadly',wrap:0,base:130,min:75,dec:2,c:'#66bb6a'},
{id:'wrap',name:'Wrap',desc:'Walls teleport you',wrap:1,base:130,min:75,dec:2,c:'#26c6da'},
{id:'turbo',name:'Turbo',desc:'Speed ramps up fast',wrap:1,base:115,min:42,dec:5,c:'#ffca28'},
{id:'maze',name:'Maze',desc:'Blocks pile up as you eat',wrap:0,base:135,min:85,dec:2,c:'#8d6e63'},
{id:'feast',name:'Feast',desc:'Gold stars and poison skulls',wrap:1,base:125,min:80,dec:1,c:'#ab47bc'},
{id:'blitz',name:'Blitz',desc:'60 seconds. Score big.',wrap:1,base:105,min:105,dec:0,c:'#29b6f6'},
{id:'zen',name:'Zen',desc:'No dying, just vibes',wrap:1,base:140,min:140,dec:0,c:'#80cbc4'},
{id:'boss',name:'Boss Rush',desc:'10 bosses. Brutal.',wrap:0,base:120,min:120,dec:0,c:'#ff5252'}
];
var S={best:{},mute:0};
try{var raw=JSON.parse(localStorage.getItem(ID+'v2'));if(raw&&raw.best)S=raw;}catch(e){}
function save(){try{localStorage.setItem(ID+'v2',JSON.stringify(S));}catch(e){}}

/* ---------- DOM ---------- */
var ov=document.createElement('div');
ov.id=ID;
ov.style.cssText='position:fixed;left:0;top:0;right:0;bottom:0;z-index:2147483647;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;font-family:'+FONT+';touch-action:none;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;cursor:pointer';
var W=Math.max(240,Math.min(520,window.innerWidth-36,window.innerHeight-HUD-130));
W=Math.floor(W/N)*N;
var cs=W/N;
var box=document.createElement('div');
box.style.cssText='background:#0a0d12;border-radius:16px;padding:10px;box-shadow:0 20px 70px rgba(0,0,0,.7),0 0 0 1px rgba(255,255,255,.07);text-align:center;cursor:default';
var cv=document.createElement('canvas');
cv.width=W*dpr;cv.height=(W+HUD)*dpr;
cv.style.cssText='display:block;width:'+W+'px;height:'+(W+HUD)+'px;border-radius:10px;touch-action:none';
var bar=document.createElement('div');
bar.style.cssText='margin-top:10px;display:flex;gap:6px;justify-content:center;flex-wrap:wrap';
function btn(t,f){var b=document.createElement('button');b.textContent=t;b.style.cssText='font:700 14px '+FONT+';padding:10px 12px;border-radius:10px;border:0;background:#1f2a37;color:#e6edf3;cursor:pointer';b.addEventListener('click',function(e){e.stopPropagation();unlock();f();});bar.appendChild(b);return b;}
btn('Restart (R)',function(){restart();});
btn('Menu (M)',function(){toMenu();});
btn('Pause (P)',function(){togglePause();});
var bSnd=btn('',function(){toggleSound();});
var bX=btn('Close (Esc)',function(){close();});
bX.style.background='#7f1d1d';
var hint=document.createElement('div');
hint.style.cssText='font-size:11px;color:#6b7785;margin-top:8px;max-width:'+W+'px';
hint.textContent='Arrows / WASD or swipe • R restart • M menu • Space pause • tap outside to close';
box.appendChild(cv);box.appendChild(bar);box.appendChild(hint);
ov.appendChild(box);
document.body.appendChild(ov);
var g=cv.getContext('2d');
function syncSnd(){bSnd.textContent=S.mute?'Sound: off':'Sound: on';}
syncSnd();

/* ---------- audio ---------- */
var AC=null;
function ac(){if(AC)return AC;if(S.mute)return null;try{var C=window.AudioContext||window.webkitAudioContext;AC=new C();}catch(e){}return AC;}
function unlock(){var a=ac();if(a&&a.state==='suspended'){try{a.resume();}catch(e){}}}
function tone(f,d,type,v,slide,delay){
if(S.mute)return;var a=ac();if(!a)return;
var t=a.currentTime+(delay||0),o=a.createOscillator(),gn=a.createGain();
o.type=type||'square';o.frequency.setValueAtTime(f,t);
if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,slide),t+d);
gn.gain.setValueAtTime(v||.06,t);gn.gain.exponentialRampToValueAtTime(.0001,t+d);
o.connect(gn);gn.connect(a.destination);o.start(t);o.stop(t+d+.03);
}
function noise(d,v){
if(S.mute)return;var a=ac();if(!a)return;
var n=Math.floor(a.sampleRate*d),b=a.createBuffer(1,n,a.sampleRate),c=b.getChannelData(0);
for(var i=0;i<n;i++)c[i]=(Math.random()*2-1)*(1-i/n);
var s=a.createBufferSource(),gn=a.createGain();s.buffer=b;gn.gain.value=v;s.connect(gn);gn.connect(a.destination);s.start();
}
function sEat(c){tone(420+c*70,.09,'square',.05,700+c*90);tone(840+c*100,.08,'triangle',.05,0,.05);}
function sDie(){noise(.5,.16);tone(240,.55,'sawtooth',.08,40);}
function sHit(){tone(170,.3,'sawtooth',.1,50);tone(660,.16,'square',.06,1300);noise(.25,.1);}
function sWin(){[523,659,784,1047,1319].forEach(function(f,i){tone(f,.2,'triangle',.07,0,i*.09);});}
function sWarn(){tone(320,.1,'square',.03,220);}
function sBoom(){noise(.25,.09);tone(95,.28,'sine',.1,40);}
function sTick(){tone(720,.03,'square',.025);}
function sBad(){tone(300,.3,'sawtooth',.07,80);}
function vib(n){try{navigator.vibrate&&navigator.vibrate(n);}catch(e){}}
function toggleSound(){S.mute=S.mute?0:1;save();syncSnd();if(!S.mute){unlock();sTick();}}

/* ---------- helpers ---------- */
function clamp(v,a,b){return v<a?a:v>b?b:v;}
function lerp(a,b,t){return a+(b-a)*t;}
function ri(a,b){return a+Math.floor(Math.random()*(b-a+1));}
function cp(c){return {x:c.x,y:c.y};}
function bc(v){return (v+.5)*cs;}
function ease(t){return t*t*(3-2*t);}
function easeBack(t){var c=1.70158;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2);}
function rr(x,y,w,h,r){g.beginPath();if(g.roundRect)g.roundRect(x,y,w,h,r);else g.rect(x,y,w,h);g.fill();}
function txt(s,x,y,sz,c,w,al){g.font=(w||700)+' '+sz+'px '+FONT;g.fillStyle=c;g.textAlign=al||'center';g.textBaseline='middle';g.fillText(s,x,y);}
function dist(a,b){return Math.abs(a.x-b.x)+Math.abs(a.y-b.y);}

/* ---------- state ---------- */
var state='menu',stT=0,sel=0,selY=0,snake=[],prev=[],dir={x:1,y:0},queue=[],foods=[],obst=[],parts=[],pops=[];
var mode=MODES[0],mi=0,score=0,combo=0,comboT=0,ticks=0,grow=0,stepMs=130,acc=0,A=1,shake=0,flash=0,flashC='#fff',hitstop=0;
var lives=5,bi=0,B=null,timeLeft=60000,newBest=false,apples=0,endMsg='',dead=false,last=0,raf=0,tmNow=0,closed=0;
function setState(s){state=s;stT=0;}

function burst(x,y,c,n,sp,sz,gr){
for(var i=0;i<n;i++){var a=Math.random()*6.283,s=(.4+Math.random())*sp,L=450+Math.random()*450;
parts.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:L,max:L,c:c,s:(sz||3)*(.5+Math.random()),gr:gr==null?.05:gr});}
}
function pop(t,x,y,c){pops.push({t:t,x:x,y:y,c:c||'#fff',age:0});}

/* ---------- foods & obstacles ---------- */
function foodOk(x,y){
var i;
for(i=0;i<snake.length;i++)if(snake[i].x===x&&snake[i].y===y)return false;
for(i=0;i<obst.length;i++)if(obst[i].x===x&&obst[i].y===y)return false;
for(i=0;i<foods.length;i++)if(foods[i].x===x&&foods[i].y===y)return false;
if(B&&B.lethal(x,y))return false;
if(B&&B.foodOk&&!B.foodOk(x,y))return false;
return true;
}
function addFood(type,ttl){
for(var i=0;i<300;i++){
var x=ri(0,N-1),y=ri(0,N-1);
if(i<250&&Math.abs(x-snake[0].x)+Math.abs(y-snake[0].y)<3)continue;
if(foodOk(x,y)){var f={x:x,y:y,type:type,born:tmNow,ttl:ttl||0};foods.push(f);return f;}
}
}
function addObst(){
for(var i=0;i<200;i++){
var x=ri(0,N-1),y=ri(0,N-1);
if(Math.abs(x-snake[0].x)+Math.abs(y-snake[0].y)<5)continue;
if(foodOk(x,y)){obst.push({x:x,y:y,born:tmNow});return;}
}
}

/* ---------- game flow ---------- */
function resetSnake(){
snake=[{x:10,y:14},{x:9,y:14},{x:8,y:14}];prev=snake.map(cp);dir={x:1,y:0};queue=[];acc=0;A=1;dead=false;
}
function start(i,b){
mi=i;mode=MODES[i];score=0;combo=0;comboT=0;ticks=0;grow=0;apples=0;parts=[];pops=[];obst=[];foods=[];
timeLeft=60000;lives=5;bi=b||0;B=null;stepMs=mode.base;newBest=false;endMsg='';hitstop=0;shake=0;flash=0;
resetSnake();
if(mode.id==='boss')startBoss();
else{
if(mode.id==='feast'){for(var k=0;k<3;k++)addFood('a');}else addFood('a');
if(mode.id==='maze')for(var j=0;j<9;j++)addObst();
setState('ready');
}
tone(520,.09,'square',.05,900);
}
function startBoss(){
var d=BOSSES[bi];
B=d.make();B.max=B.hp=d.hp;B.def=d;B.hit=-1e9;
obst=[];foods=[];grow=0;combo=0;comboT=0;stepMs=d.step||120;
resetSnake();B.init();addFood('a');setState('ready');
}
function restart(){if(state==='menu')return;start(mi,0);}
function retry(){if(mode.id==='boss'&&state==='over'){start(mi,bi);lives=3;}else start(mi,0);}
function toMenu(){B=null;parts=[];pops=[];setState('menu');sTick();}
function togglePause(){
if(state==='play'){setState('pause');}
else if(state==='pause'||state==='ready'){setState('play');acc=0;}
}
function gameOver(){
setState('over');
var b=S.best[mode.id]||0;newBest=score>b&&score>0;
if(newBest){S.best[mode.id]=score;save();}
}
function die(){
if(state!=='play')return;
setState('dying');dead=true;shake=16;flash=.55;flashC='#ff4040';sDie();vib(80);
snake.forEach(function(s,i){burst(bc(s.x),bc(s.y),'hsl('+(130+i*3)+',70%,55%)',4,4.5,3.4);});
combo=0;comboT=0;
}
function eatFood(f){
foods.splice(foods.indexOf(f),1);
var x=bc(f.x),y=bc(f.y);
if(f.type==='p'){
combo=0;comboT=0;
if(snake.length<6){die();return;}
snake.splice(snake.length-2,2);
burst(x,y,'#b388ff',18,4,3.5);pop('-2',x,y,'#ce93d8');sBad();shake=6;flash=.25;flashC='#7e57c2';vib(40);
return;
}
combo=comboT>0?Math.min(combo+1,8):1;comboT=26;
var pts=(f.type==='g'?5:1)*10*combo;
score+=pts;apples++;grow+=f.type==='g'?3:1;
burst(x,y,f.type==='g'?'#ffd54f':'#ff5252',14+combo*2,3.6,3.2);
burst(x,y,'#ffffff',5,2.5,2);
pop('+'+pts,x,y-cs*.4,f.type==='g'?'#ffd54f':combo>1?'#ffe082':'#fff');
sEat(combo);shake=Math.max(shake,2+combo*.4);vib(12);
if(mode.dec)stepMs=Math.max(mode.min,stepMs-mode.dec);
if(mode.id==='maze'&&obst.length<45)addObst();
if(B){bossHit();return;}
if(f.type==='a'&&mode.id!=='feast')addFood('a');
}
function bossHit(){
B.hp--;B.hit=tmNow;sHit();hitstop=110;shake=11;flash=.3;flashC='#ffffff';vib(50);
pop(B.hp>0?'HIT!':'FINISH!',W/2,W*.45,B.def.c);
if(B.onHit)B.onHit();
if(B.hp<=0){
setState('bossdown');score+=500;sWin();foods=[];hitstop=260;flash=.7;shake=18;
for(var i=0;i<8;i++)burst(Math.random()*W,Math.random()*W,B.def.c,18,5,4);
}else addFood('a');
}
function feastTick(){
if(ticks%36===0&&!foods.some(function(f){return f.type==='g';}))addFood('g',50);
if(ticks%28===0&&foods.filter(function(f){return f.type==='p';}).length<2)addFood('p',90);
if(foods.filter(function(f){return f.type==='a';}).length<3)addFood('a');
}
function step(){
ticks++;
if(queue.length)dir=queue.shift();
var h0=snake[0],nx=h0.x+dir.x,ny=h0.y+dir.y,i;
if(mode.wrap){nx=(nx+N)%N;ny=(ny+N)%N;}
else if(nx<0||ny<0||nx>=N||ny>=N)return die();
var f=null;
for(i=0;i<foods.length;i++)if(foods[i].x===nx&&foods[i].y===ny)f=foods[i];
var wg=grow>0||(f&&f.type!=='p');
var hit=-1,lim=wg?snake.length:snake.length-1;
for(i=0;i<lim;i++)if(snake[i].x===nx&&snake[i].y===ny){hit=i;break;}
if(hit>=0){
if(mode.id!=='zen')return die();
var keep=Math.max(hit,3);
for(i=keep;i<snake.length;i++)burst(bc(snake[i].x),bc(snake[i].y),'#80cbc4',4,3,2.5);
snake.length=keep;shake=4;combo=0;comboT=0;tone(200,.2,'triangle',.05,90);
}
for(i=0;i<obst.length;i++)if(obst[i].x===nx&&obst[i].y===ny)return die();
if(B&&B.lethal(nx,ny))return die();
prev=snake.map(cp);
snake.unshift({x:nx,y:ny});
if(f)eatFood(f);
if(state!=='play')return;
if(grow>0)grow--;else snake.pop();
if(combo>1&&Math.random()<.8){var tl=snake[snake.length-1];burst(bc(tl.x),bc(tl.y),'hsl('+(Math.random()*360)+',90%,65%)',1,.8,2.5,0);}
if(comboT>0&&--comboT===0)combo=0;
for(i=foods.length-1;i>=0;i--){var fd=foods[i];if(fd.ttl&&--fd.ttl<=0)foods.splice(i,1);}
if(mode.id==='feast')feastTick();
if(B){
B.tick();
if(state!=='play')return;
var hd=snake[0];
if(B.lethal(hd.x,hd.y)||(B.area&&snake.some(function(s){return B.area(s.x,s.y);})))die();
}
}
function turn(x,y){
if(state!=='play'&&state!=='ready')return;
var last=queue.length?queue[queue.length-1]:dir;
if(last.x===-x&&last.y===-y)return;
if(state==='ready'){setState('play');acc=0;}
if(last.x===x&&last.y===y)return;
if(queue.length<3)queue.push({x:x,y:y});
}

/* ---------- boss helpers ---------- */
function prog(){return B?1-B.hp/B.max:0;}
function snakePts(arr,parr,a){
var out=[];
for(var i=0;i<arr.length;i++){
var c=arr[i],p=parr[i]||c;
if(Math.abs(c.x-p.x)>1||Math.abs(c.y-p.y)>1)p=c;
out.push({x:(p.x+(c.x-p.x)*a+.5)*cs,y:(p.y+(c.y-p.y)*a+.5)*cs});
}
return out;
}
function drawSnake(pts,h1,h2,dv,al,rainbow,tm){
var n=pts.length,i,t,hue;
g.save();g.globalAlpha=al;g.lineCap='round';g.lineJoin='round';
for(i=n-1;i>0;i--){
var a=pts[i],b=pts[i-1];
if(Math.abs(a.x-b.x)>cs*1.5||Math.abs(a.y-b.y)>cs*1.5)continue;
t=i/n;hue=rainbow?(tm/6+i*16)%360:lerp(h1,h2,t);
g.strokeStyle='hsl('+hue+',68%,'+(56-14*t)+'%)';g.lineWidth=cs*(.82-.24*t);
g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();
}
g.strokeStyle='rgba(255,255,255,.17)';g.lineWidth=cs*.2;g.beginPath();
for(i=0;i<n;i++){
var p=pts[i];
if(i&&Math.abs(p.x-pts[i-1].x)<cs*1.5&&Math.abs(p.y-pts[i-1].y)<cs*1.5)g.lineTo(p.x,p.y-cs*.13);else g.moveTo(p.x,p.y-cs*.13);
}
g.stroke();
var h=pts[0];hue=rainbow?(tm/6)%360:h1;
g.shadowColor='hsl('+hue+',90%,60%)';g.shadowBlur=cs*.9;
g.fillStyle='hsl('+hue+',72%,62%)';g.beginPath();g.arc(h.x,h.y,cs*.47,0,6.283);g.fill();
g.shadowBlur=0;
var px=-dv.y,py=dv.x;
if(Math.floor(tm/1500)%2===0&&tm%1500<300){
g.strokeStyle='#ff5252';g.lineWidth=cs*.07;
var tx=h.x+dv.x*cs*.78,ty=h.y+dv.y*cs*.78;
g.beginPath();g.moveTo(h.x+dv.x*cs*.4,h.y+dv.y*cs*.4);g.lineTo(tx,ty);
g.moveTo(tx,ty);g.lineTo(tx+dv.x*cs*.15+px*cs*.12,ty+dv.y*cs*.15+py*cs*.12);
g.moveTo(tx,ty);g.lineTo(tx+dv.x*cs*.15-px*cs*.12,ty+dv.y*cs*.15-py*cs*.12);g.stroke();
}
[-1,1].forEach(function(s){
var ex=h.x+dv.x*cs*.13+px*s*cs*.2,ey=h.y+dv.y*cs*.13+py*s*cs*.2;
g.fillStyle='#fff';g.beginPath();g.arc(ex,ey,cs*.15,0,6.283);g.fill();
g.fillStyle='#111';g.beginPath();g.arc(ex+dv.x*cs*.05,ey+dv.y*cs*.05,cs*.08,0,6.283);g.fill();
});
g.restore();
}
function cellFill(x,y,c,ins,r){g.fillStyle=c;rr(x*cs+ins,y*cs+ins,cs-2*ins,cs-2*ins,r);}

/* ---------- bosses ---------- */
function mkTurret(){
var o={},L=[],cd=16;
function fire(l){return l.t>=l.w&&l.t<l.w+3;}
o.init=function(){L=[];cd=16;};
o.tick=function(){
for(var i=L.length-1;i>=0;i--){
L[i].t++;
if(L[i].t===L[i].w){sBoom();shake=Math.max(shake,5);}
if(L[i].t>=L[i].w+3)L.splice(i,1);
}
if(--cd<=0){
var p=prog(),h=snake[0];cd=Math.round(15-p*6);
var n=p>.5?2:1;
for(var k=0;k<n;k++){
var hz=Math.random()<.5,ah=3+k*3,
px=clamp(h.x+dir.x*ah,0,N-1),py=clamp(h.y+dir.y*ah,0,N-1);
L.push({r:hz,i:hz?py:px,t:0,w:8});
}
sWarn();
}
};
o.lethal=function(x,y){return L.some(function(l){return fire(l)&&(l.r?l.i===y:l.i===x);});};
o.area=o.lethal;
o.draw=function(tm){
L.forEach(function(l){
var a=l.i*cs;
if(fire(l)){
g.save();g.shadowColor='#ff5252';g.shadowBlur=26;g.fillStyle='#ff6e6e';
if(l.r)g.fillRect(0,a+cs*.1,W,cs*.8);else g.fillRect(a+cs*.1,0,cs*.8,W);
g.fillStyle='#fff';
if(l.r)g.fillRect(0,a+cs*.33,W,cs*.34);else g.fillRect(a+cs*.33,0,cs*.34,W);
g.restore();
}else{
var al=.08+.2*(Math.sin(tm/40)>0?1:.35)*(l.t/l.w+.3);
g.fillStyle='rgba(255,60,60,'+al+')';
if(l.r)g.fillRect(0,a,W,cs);else g.fillRect(a,0,cs,W);
g.fillStyle='rgba(255,120,120,.9)';
for(var s=0;s<2;s++){
g.beginPath();
if(l.r){var ex=s?W-cs*.7:cs*.7,d=s?-1:1;g.moveTo(ex-d*cs*.3,a+cs*.2);g.lineTo(ex+d*cs*.3,a+cs*.5);g.lineTo(ex-d*cs*.3,a+cs*.8);}
else{var ey=s?W-cs*.7:cs*.7,e=s?-1:1;g.moveTo(a+cs*.2,ey-e*cs*.3);g.lineTo(a+cs*.5,ey+e*cs*.3);g.lineTo(a+cs*.8,ey-e*cs*.3);}
g.fill();
}
}
});
};
return o;
}
function mkRival(){
var o={},R=[],P=[],tk=0,rg=0,rd={x:-1,y:0};
o.init=function(){R=[{x:16,y:3},{x:17,y:3},{x:18,y:3},{x:18,y:4},{x:18,y:5},{x:18,y:6}];P=R.map(cp);tk=0;rg=0;rd={x:-1,y:0};};
o.tick=function(){
tk++;P=R.map(cp);
if(prog()<.6&&tk%5===0)return;
var f=foods[0];if(!f)return;
var h=R[0],best=null,bd=1e9;
[[1,0],[-1,0],[0,1],[0,-1]].forEach(function(d){
var x=h.x+d[0],y=h.y+d[1];
if(x<0||y<0||x>=N||y>=N)return;
if(d[0]===-rd.x&&d[1]===-rd.y)return;
for(var i=0;i<R.length-1;i++)if(R[i].x===x&&R[i].y===y)return;
if(snake.some(function(s){return s.x===x&&s.y===y;}))return;
var dd=Math.abs(x-f.x)+Math.abs(y-f.y)+Math.random()*.6;
if(dd<bd){bd=dd;best=d;}
});
if(!best)return;
rd={x:best[0],y:best[1]};
var nx=h.x+best[0],ny=h.y+best[1];
R.unshift({x:nx,y:ny});
if(nx===f.x&&ny===f.y){
foods.splice(0,1);B.hp=Math.min(B.max,B.hp+1);rg++;
burst(bc(nx),bc(ny),'#ff9800',16,3.5,3);pop('IT HEALS!',bc(nx),bc(ny)-cs,'#ffb74d');sBad();
addFood('a');
}
if(rg>0&&R.length<16)rg--;else R.pop();
};
o.lethal=function(x,y){return R.some(function(c){return c.x===x&&c.y===y;});};
o.draw=function(tm){drawSnake(snakePts(R,P,A),22,0,rd,1,false,tm);};
return o;
}
function mkCrusher(){
var o={},r=0,cd=14,hold=0;
function idx(x,y){return Math.min(x,y,N-1-x,N-1-y);}
function mx(){return prog()>.5?5:4;}
o.init=function(){r=0;cd=14;hold=0;};
o.tick=function(){
if(r>=mx()){if(--hold<=0){r=0;cd=12;}return;}
if(--cd<=0){
r++;sBoom();shake=Math.max(shake,4);cd=Math.round(11-prog()*3);
if(r>=mx())hold=14;
foods.slice().forEach(function(f){if(idx(f.x,f.y)<r){foods.splice(foods.indexOf(f),1);addFood('a');}});
}
};
o.lethal=function(x,y){return idx(x,y)<r;};
o.area=o.lethal;
o.foodOk=function(x,y){return idx(x,y)>=r+1;};
o.draw=function(tm){
for(var x=0;x<N;x++)for(var y=0;y<N;y++){
var d=idx(x,y);
if(d<r){g.fillStyle='hsl('+(12+22*Math.sin(tm/220+x+y))+',100%,'+(44+8*Math.sin(tm/160+x*2))+'%)';g.fillRect(x*cs,y*cs,cs+.5,cs+.5);}
else if(d===r&&r<mx()&&cd<=5&&Math.sin(tm/50)>0){g.fillStyle='rgba(255,152,0,.4)';g.fillRect(x*cs,y*cs,cs,cs);}
}
};
return o;
}
function mkMeteor(){
var o={},M=[],cd=10,FUSE=9;
o.init=function(){M=[];cd=10;};
o.tick=function(){
for(var i=M.length-1;i>=0;i--){
M[i].t++;
if(M[i].t===FUSE){sBoom();shake=Math.max(shake,6);burst(bc(M[i].x),bc(M[i].y),'#ffab40',18,5,3.4);}
if(M[i].t>=FUSE+2)M.splice(i,1);
}
if(--cd<=0){
var p=prog(),h=snake[0];cd=Math.round(7-p*3);
var n=1+(p>.4?1:0)+(p>.8?1:0);
for(var k=0;k<n;k++){
var x,y;
if(k===0){x=clamp(h.x+dir.x*5,0,N-1);y=clamp(h.y+dir.y*5,0,N-1);}else{x=ri(0,N-1);y=ri(0,N-1);}
M.push({x:x,y:y,t:0});
}
sWarn();
}
};
o.lethal=function(x,y){return M.some(function(m){return m.t>=FUSE&&m.t<FUSE+2&&Math.abs(x-m.x)<=1&&Math.abs(y-m.y)<=1;});};
o.area=o.lethal;
o.draw=function(tm){
M.forEach(function(m){
var x=bc(m.x),y=bc(m.y),k;
if(m.t<FUSE){
k=m.t/FUSE;
g.fillStyle='rgba(255,80,40,'+(.07+.16*k)+')';g.fillRect((m.x-1)*cs,(m.y-1)*cs,cs*3,cs*3);
g.strokeStyle='rgba(255,130,70,'+(.4+.6*k)+')';g.lineWidth=2;
g.beginPath();g.arc(x,y,cs*(2-k*.7),0,6.283);g.stroke();
g.beginPath();g.moveTo(x-cs*.6,y);g.lineTo(x+cs*.6,y);g.moveTo(x,y-cs*.6);g.lineTo(x,y+cs*.6);g.stroke();
var fy=y-(1-k)*(1-k)*cs*10;
g.save();g.shadowColor='#ff9100';g.shadowBlur=16;
g.strokeStyle='rgba(255,170,60,.5)';g.lineWidth=cs*.3;g.beginPath();g.moveTo(x,fy-cs*2);g.lineTo(x,fy);g.stroke();
g.fillStyle='#ffd180';g.beginPath();g.arc(x,fy,cs*.3,0,6.283);g.fill();g.restore();
}else{
k=(m.t-FUSE)/2;
g.save();g.shadowColor='#ff9100';g.shadowBlur=22;
g.fillStyle='rgba(255,'+Math.round(210-110*k)+',70,'+(.95-.45*k)+')';
g.fillRect((m.x-1)*cs,(m.y-1)*cs,cs*3,cs*3);g.restore();
}
});
};
return o;
}
function mkHive(){
var o={},bugs=[],cd=10;
function queen(x,y){return (x===9||x===10)&&(y===8||y===9);}
o.init=function(){bugs=[];cd=10;};
o.tick=function(){
var p=prog();
if(--cd<=0&&bugs.length<5+Math.round(p*5)){
cd=Math.round(9-p*3);
for(var t=0;t<20;t++){
var e=ri(0,3),x=e<2?(e?N-1:0):ri(0,N-1),y=e<2?ri(0,N-1):(e===2?0:N-1);
if(Math.abs(x-snake[0].x)+Math.abs(y-snake[0].y)>6){bugs.push({x:x,y:y,px:x,py:y});break;}
}
}
bugs.forEach(function(b){
b.px=b.x;b.py=b.y;
if(Math.random()<.55){
var d,h=snake[0];
if(Math.random()<.35)d=Math.abs(h.x-b.x)>Math.abs(h.y-b.y)?[Math.sign(h.x-b.x),0]:[0,Math.sign(h.y-b.y)];
else d=[[1,0],[-1,0],[0,1],[0,-1]][ri(0,3)];
var x=b.x+d[0],y=b.y+d[1];
if(x>=0&&y>=0&&x<N&&y<N&&!queen(x,y)){b.x=x;b.y=y;}
}
});
};
o.lethal=function(x,y){return queen(x,y)||bugs.some(function(b){return b.x===x&&b.y===y;});};
o.area=o.lethal;
o.onHit=function(){bugs.forEach(function(b){burst(bc(b.x),bc(b.y),'#ffd54f',9,3.4,3);});bugs=[];sBoom();};
o.draw=function(tm){
var pu=1+.03*Math.sin(tm/200);
g.save();g.translate(10*cs,9*cs);g.scale(pu,pu);
g.shadowColor='#ffb300';g.shadowBlur=22;
var gr=g.createLinearGradient(-cs,-cs,cs,cs);gr.addColorStop(0,'#ffe082');gr.addColorStop(1,'#ff8f00');
g.fillStyle=gr;rr(-cs+2,-cs+2,cs*2-4,cs*2-4,cs*.5);g.shadowBlur=0;
g.strokeStyle='rgba(120,53,15,.55)';g.lineWidth=2;
for(var i=-1;i<=1;i+=2)for(var j=-1;j<=1;j+=2){g.beginPath();for(var k=0;k<6;k++){var a=k*Math.PI/3;g.lineTo(i*cs*.5+Math.cos(a)*cs*.3,j*cs*.5+Math.sin(a)*cs*.3);}g.closePath();g.stroke();}
g.restore();
bugs.forEach(function(b){
var x=bc(b.x),y=bc(b.y),fl=Math.sin(tm/35)*.4;
g.fillStyle='rgba(220,240,255,.55)';
g.beginPath();g.ellipse(x-cs*.2,y-cs*.22,cs*.18,cs*(.1+fl*.1),-.5,0,6.283);g.fill();
g.beginPath();g.ellipse(x+cs*.2,y-cs*.22,cs*.18,cs*(.1+fl*.1),.5,0,6.283);g.fill();
g.fillStyle='#2a1a3a';g.beginPath();g.arc(x,y,cs*.28,0,6.283);g.fill();
g.fillStyle='#ff5252';g.beginPath();g.arc(x-cs*.1,y-cs*.05,cs*.06,0,6.283);g.arc(x+cs*.1,y-cs*.05,cs*.06,0,6.283);g.fill();
});
};
return o;
}
function mkPhantom(){
var o={};
function mir(c){return {x:N-1-c.x,y:N-1-c.y};}
o.init=function(){};
o.tick=function(){};
o.lethal=function(x,y){return snake.some(function(s){return N-1-s.x===x&&N-1-s.y===y;});};
o.foodOk=function(x,y){return !o.lethal(x,y);};
o.draw=function(tm){
if(dead)return;
var pts=snakePts(snake.map(mir),prev.map(mir),A),hp=snakePts(snake,prev,A)[0];
g.save();g.strokeStyle='rgba(206,147,216,.25)';g.setLineDash([4,6]);g.lineWidth=1.5;
g.beginPath();g.moveTo(hp.x,hp.y);g.lineTo(pts[0].x,pts[0].y);g.stroke();g.restore();
g.fillStyle='rgba(206,147,216,.35)';g.beginPath();g.arc(W/2,W/2,3,0,6.283);g.fill();
drawSnake(pts,285,255,{x:-dir.x,y:-dir.y},.6+.12*Math.sin(tm/180),false,tm);
};
return o;
}
function mkWarden(){
var o={},Wl=[],cd=14,WARM=7;
o.init=function(){Wl=[];cd=12;};
o.tick=function(){
for(var i=Wl.length-1;i>=0;i--){
var w=Wl[i];w.t++;
if(w.t>WARM&&(w.t-WARM)%2===0)w.pos+=w.d;
if(w.pos<0||w.pos>=N)Wl.splice(i,1);
}
var p=prog();
if(--cd<=0&&Wl.length<(p>.6?2:1)){
cd=Math.round(26-p*8);
var gap=p>.8?2:p>.4?3:4,d=Math.random()<.5?1:-1;
Wl.push({v:Math.random()<.5,d:d,pos:d>0?0:N-1,gap:gap,gs:ri(1,N-gap-1),t:0});
sWarn();
}
};
function solid(w,x,y){var c=w.v?x:y,q=w.v?y:x;return c===w.pos&&!(q>=w.gs&&q<w.gs+w.gap);}
o.lethal=function(x,y){return Wl.some(function(w){return w.t>=WARM&&solid(w,x,y);});};
o.area=o.lethal;
o.draw=function(tm){
Wl.forEach(function(w){
var warm=w.t<WARM,k,x,y;
for(k=0;k<N;k++){
x=w.v?w.pos:k;y=w.v?k:w.pos;
var inGap=k>=w.gs&&k<w.gs+w.gap;
if(warm){
if(inGap){g.fillStyle='rgba(102,187,106,.3)';g.fillRect(x*cs,y*cs,cs,cs);}
else if(Math.sin(tm/60)>0){g.fillStyle='rgba(41,182,246,.3)';g.fillRect(x*cs,y*cs,cs,cs);}
}else if(!inGap){
g.save();g.shadowColor='#29b6f6';g.shadowBlur=12;
g.fillStyle='#81d4fa';rr(x*cs+1,y*cs+1,cs-2,cs-2,4);g.restore();
g.fillStyle='rgba(255,255,255,.5)';g.fillRect(x*cs+cs*.3,y*cs+cs*.3,cs*.4,cs*.4);
}
}
});
};
return o;
}
function mkTrickster(){
var o={},sp=[],cd=8,bl=0;
o.init=function(){sp=[];cd=8;bl=0;};
o.tick=function(){
sp.forEach(function(s){s.t++;});
sp=sp.filter(function(s){return s.t<19;});
var h=snake[0],p=prog(),i;
if(--cd<=0){
cd=Math.round(8-p*2);
for(i=0;i<30;i++){
var x=h.x+ri(-5,5),y=h.y+ri(-5,5);
if(x<0||y<0||x>=N||y>=N||Math.abs(x-h.x)+Math.abs(y-h.y)<3)continue;
if(snake.some(function(s){return s.x===x&&s.y===y;})||foods.some(function(f){return f.x===x&&f.y===y;})||sp.some(function(s){return s.x===x&&s.y===y;}))continue;
sp.push({x:x,y:y,t:0});break;
}
}
var f=foods[0];if(!f)return;
var d=Math.abs(f.x-h.x)+Math.abs(f.y-h.y);
if(bl>0)bl--;
if(d<=2&&bl<=0&&Math.random()<.3){
burst(bc(f.x),bc(f.y),'#e040fb',14,3.5,3);
for(i=0;i<60;i++){
var x2=ri(0,N-1),y2=ri(0,N-1);
if(Math.abs(x2-h.x)+Math.abs(y2-h.y)>=8&&foodOk(x2,y2)){f.x=x2;f.y=y2;f.born=tmNow;break;}
}
burst(bc(f.x),bc(f.y),'#e040fb',14,3.5,3);bl=18;
return;
}
if(d<=6&&Math.random()<.7){
var best=null,bd=d;
[[1,0],[-1,0],[0,1],[0,-1]].forEach(function(v){
var x=f.x+v[0],y=f.y+v[1];
if(x<0||y<0||x>=N||y>=N||!foodOk(x,y))return;
var nd=Math.abs(x-h.x)+Math.abs(y-h.y)+Math.random()*.5;
if(nd>bd){bd=nd;best=v;}
});
if(best){f.x+=best[0];f.y+=best[1];}
}
};
o.lethal=function(x,y){return sp.some(function(s){return s.t>=5&&s.x===x&&s.y===y;});};
o.area=o.lethal;
o.draw=function(tm){
sp.forEach(function(s){
var x=s.x*cs,y=s.y*cs;
if(s.t<5){
if(Math.sin(tm/45)>0){g.strokeStyle='rgba(255,82,82,.8)';g.lineWidth=2;g.strokeRect(x+3,y+3,cs-6,cs-6);}
}else{
g.save();g.shadowColor='#ff1744';g.shadowBlur=10;g.fillStyle='#ff5252';
for(var k=0;k<3;k++){g.beginPath();g.moveTo(x+cs*(.1+k*.3),y+cs*.9);g.lineTo(x+cs*(.25+k*.3),y+cs*.12);g.lineTo(x+cs*(.4+k*.3),y+cs*.9);g.fill();}
g.restore();
}
});
};
return o;
}
function mkMines(){
var o={},K=[],cd=10,since=0;
o.init=function(){K=[];cd=10;since=0;};
o.onHit=function(){K.forEach(function(k){burst(bc(k.x),bc(k.y),'#ff8a65',8,3.5,3);});K=[];sBoom();since=0;};
o.tick=function(){
since++;
K.forEach(function(k){k.t++;});
if(since>200){o.onHit();return;}
if(--cd<=0&&K.length<30){
cd=Math.round(5-prog()*2);
var h=snake[0],f=foods[0];
for(var t=0;t<40;t++){
var x,y;
if(f&&Math.random()<.5){x=f.x+ri(-2,2);y=f.y+ri(-2,2);}else{x=ri(0,N-1);y=ri(0,N-1);}
if(x<0||y<0||x>=N||y>=N||Math.abs(x-h.x)+Math.abs(y-h.y)<4)continue;
if(f&&Math.abs(x-f.x)+Math.abs(y-f.y)<=1)continue;
if(snake.some(function(s){return s.x===x&&s.y===y;})||K.some(function(k){return k.x===x&&k.y===y;}))continue;
K.push({x:x,y:y,t:0});break;
}
}
};
o.lethal=function(x,y){return K.some(function(k){return k.t>=4&&k.x===x&&k.y===y;});};
o.draw=function(tm){
K.forEach(function(k){
var x=bc(k.x),y=bc(k.y),armed=k.t>=4;
g.save();g.translate(x,y);
if(!armed){g.globalAlpha=Math.sin(tm/50)>0?.9:.3;}
g.fillStyle='#37474f';
for(var i=0;i<8;i++){g.rotate(Math.PI/4);g.beginPath();g.moveTo(-cs*.09,-cs*.26);g.lineTo(0,-cs*.46);g.lineTo(cs*.09,-cs*.26);g.fill();}
g.beginPath();g.arc(0,0,cs*.26,0,6.283);g.fill();
g.fillStyle=armed&&Math.sin(tm/150+k.x)>0?'#ff1744':'#7f1d1d';
g.beginPath();g.arc(0,0,cs*.1,0,6.283);g.fill();
g.restore();
});
};
return o;
}
function mkOverlord(){
var subs=[mkTurret(),mkMeteor(),mkWarden()],act=1,o={};
function phase(){var h=B.hp;return h>8?1:h>4?2:3;}
o.init=function(){subs.forEach(function(s){s.init();});act=1;};
o.tick=function(){
var p=phase();
if(p>act){act=p;subs[p-1].init();pop('PHASE '+p,W/2,W*.4,'#fff');sWarn();flash=.3;flashC='#ffffff';}
for(var i=0;i<act;i++)subs[i].tick();
};
o.lethal=function(x,y){for(var i=0;i<act;i++)if(subs[i].lethal(x,y))return true;return false;};
o.area=o.lethal;
o.draw=function(tm){for(var i=0;i<act;i++)subs[i].draw(tm);};
return o;
}
var BOSSES=[
{n:'SENTINEL',t:'Lasers lock on. Keep moving.',c:'#ff5252',hp:5,make:mkTurret},
{n:'RIVAL',t:'It wants your food. Eat first.',c:'#ff9800',hp:5,make:mkRival},
{n:'CRUSHER',t:'The walls are closing in.',c:'#ff7043',hp:6,make:mkCrusher},
{n:'METEOR',t:'Look up.',c:'#ffca28',hp:6,make:mkMeteor},
{n:'HIVE',t:'A swarm guards the queen.',c:'#cddc39',hp:5,make:mkHive},
{n:'PHANTOM',t:'It mirrors your every move.',c:'#ab47bc',hp:5,make:mkPhantom},
{n:'WARDEN',t:'Find the gap in the wall.',c:'#29b6f6',hp:6,make:mkWarden},
{n:'TRICKSTER',t:'The food runs away.',c:'#e040fb',hp:5,make:mkTrickster},
{n:'MINELAYER',t:'Watch your step.',c:'#ef5350',hp:6,make:mkMines},
{n:'OVERLORD',t:'Everything at once.',c:'#ffffff',hp:12,step:115,make:mkOverlord}
];

/* ---------- update ---------- */
function update(dt){
stT+=dt;
var i;
if(hitstop>0)hitstop-=dt;
else if(state==='play'){
acc+=dt;
if(mode.id==='blitz'){
timeLeft-=dt;
if(timeLeft<=0){timeLeft=0;endMsg='TIME UP';sWin();gameOver();}
}
var n=0;
while(acc>=stepMs&&state==='play'&&n++<4){acc-=stepMs;step();}
}
if(state==='play')A=clamp(acc/stepMs,0,1);
if(state==='dying'&&stT>1000){
if(B&&lives>1){lives--;startBoss();}
else{endMsg=B?'DEFEATED':'GAME OVER';gameOver();}
}
if(state==='bossdown'){
if(Math.random()<.2)burst(Math.random()*W,Math.random()*W,B.def.c,14,4.5,3.5);
if(stT>2400){
if(bi>=BOSSES.length-1){
setState('win');score+=1000;sWin();
var b=S.best[mode.id]||0;newBest=score>b;if(newBest){S.best[mode.id]=score;save();}
}else{bi++;lives=Math.min(5,lives+1);startBoss();}
}
}
if(state==='win'&&Math.random()<.35)burst(Math.random()*W,Math.random()*W*.6,'hsl('+Math.random()*360+',90%,60%)',14,4,3.5);
if(state==='menu'&&Math.random()<.12)parts.push({x:Math.random()*W,y:W+5,vx:(Math.random()-.5)*.4,vy:-.4-Math.random()*.8,life:4000,max:4000,c:'rgba(120,230,130,.5)',s:2+Math.random()*3,gr:0});
for(i=parts.length-1;i>=0;i--){
var p=parts[i];p.life-=dt;
if(p.life<=0){parts.splice(i,1);continue;}
var k=dt/16;p.x+=p.vx*k;p.y+=p.vy*k;p.vy+=p.gr*k;p.vx*=Math.pow(.985,k);
}
for(i=pops.length-1;i>=0;i--){pops[i].age+=dt;pops[i].y-=dt*.035;if(pops[i].age>900)pops.splice(i,1);}
shake*=Math.pow(.86,dt/16);if(shake<.3)shake=0;
flash=Math.max(0,flash-dt/450);
selY+=(sel-selY)*Math.min(1,dt/60);
}

/* ---------- draw ---------- */
var bgc=document.createElement('canvas');bgc.width=bgc.height=Math.round(W*dpr);
(function(){
var b=bgc.getContext('2d');b.scale(dpr,dpr);
var gr=b.createLinearGradient(0,0,W,W);gr.addColorStop(0,'#171d27');gr.addColorStop(1,'#0b0e13');
b.fillStyle=gr;b.fillRect(0,0,W,W);
for(var i=0;i<N;i++)for(var j=0;j<N;j++)if((i+j)%2){b.fillStyle='rgba(255,255,255,.025)';b.fillRect(i*cs,j*cs,cs,cs);}
var v=b.createRadialGradient(W/2,W/2,W*.35,W/2,W/2,W*.75);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.45)');
b.fillStyle=v;b.fillRect(0,0,W,W);
})();
function drawFood(f,tm){
var x=bc(f.x),y=bc(f.y),s=easeBack(clamp((tm-f.born)/260,0,1));
if(f.ttl&&f.ttl<14&&Math.floor(tm/120)%2)return;
var pu=1+.06*Math.sin(tm/170+f.x);
g.save();g.translate(x,y);g.scale(s*pu,s*pu);
if(f.type==='a'){
var r=cs*.36;g.shadowColor='#ff5252';g.shadowBlur=cs*.9;
var gr=g.createRadialGradient(-r*.35,-r*.35,r*.1,0,0,r);gr.addColorStop(0,'#ff9e9e');gr.addColorStop(.5,'#ef3b3b');gr.addColorStop(1,'#a51212');
g.fillStyle=gr;g.beginPath();g.arc(0,0,r,0,6.283);g.fill();g.shadowBlur=0;
g.fillStyle='#66bb6a';g.beginPath();g.ellipse(r*.4,-r*1.0,r*.4,r*.18,-.6,0,6.283);g.fill();
g.strokeStyle='#5d4037';g.lineWidth=cs*.07;g.beginPath();g.moveTo(0,-r*.8);g.lineTo(-r*.05,-r*1.15);g.stroke();
}else if(f.type==='g'){
g.rotate(tm/700);g.shadowColor='#ffd54f';g.shadowBlur=cs*1.1;g.fillStyle='#ffca28';g.beginPath();
for(var i=0;i<10;i++){var q=i%2?cs*.18:cs*.46,a=i*Math.PI/5-Math.PI/2;g[i?'lineTo':'moveTo'](Math.cos(a)*q,Math.sin(a)*q);}
g.closePath();g.fill();
}else{
g.shadowColor='#b388ff';g.shadowBlur=cs*.8;g.fillStyle='#4a2c8a';g.beginPath();g.arc(0,0,cs*.36,0,6.283);g.fill();g.shadowBlur=0;
g.strokeStyle='#e1bee7';g.lineWidth=cs*.07;
[-1,1].forEach(function(sx){var ex=sx*cs*.12,ey=-cs*.05,d=cs*.06;g.beginPath();g.moveTo(ex-d,ey-d);g.lineTo(ex+d,ey+d);g.moveTo(ex+d,ey-d);g.lineTo(ex-d,ey+d);g.stroke();});
g.beginPath();g.moveTo(-cs*.1,cs*.15);g.lineTo(cs*.1,cs*.15);g.stroke();
}
g.restore();
}
function drawBlock(o,tm){
var k=easeBack(clamp((tm-o.born)/300,0,1));
g.save();g.translate(bc(o.x),bc(o.y));g.scale(k,k);
g.fillStyle='#3a4252';rr(-cs/2+1,-cs/2+1,cs-2,cs-2,5);
g.fillStyle='#566179';rr(-cs/2+3,-cs/2+3,cs-6,cs*.35,3);
g.restore();
}
function dim(a){g.fillStyle='rgba(6,8,12,'+a+')';g.fillRect(0,0,W,W);}
function drawHUD(tm){
var u=W/440,cy=HUD/2+1,i;
g.fillStyle='#0a0d12';g.fillRect(0,0,W,HUD);
g.fillStyle='rgba(255,255,255,.07)';g.fillRect(0,HUD-1,W,1);
if(state==='menu'){txt('SNAKE+',12,cy,15*u,'#8bf08f',800,'left');txt(S.mute?'SOUND OFF':'SOUND ON',W-12,cy,11*u,'#78909c',700,'right');return;}
txt('SCORE '+score,12,cy,15*u,'#eceff1',800,'left');
if(B){var hs='';for(i=0;i<lives;i++)hs+='♥ ';txt(hs,W-12,cy,15*u,'#ff5252',700,'right');}
else txt('BEST '+Math.max(score,S.best[mode.id]||0),W-12,cy,13*u,'#90a4ae',700,'right');
if(B){
var bw=W*.4,bx=W/2-bw/2,by=cy-9;
g.fillStyle='rgba(255,255,255,.1)';rr(bx,by,bw,18,9);
var fl=tm-B.hit<220;
g.fillStyle=fl?'#fff':B.def.c;rr(bx,by,Math.max(0,bw*B.hp/B.max),18,9);
txt(B.def.n+' '+(bi+1)+'/'+BOSSES.length,W/2,cy,10*u,'#fff',800);
}else if(mode.id==='blitz'){
var s=Math.ceil(timeLeft/1000);
txt(Math.floor(s/60)+':'+(s%60<10?'0':'')+s%60,W/2,cy,19*u,s<=10&&Math.floor(tm/250)%2?'#ff5252':'#ffd54f',800);
}else if(combo>1){
txt('COMBO x'+combo,W/2,cy-3,13*u,'#ffd54f',800);
g.fillStyle='rgba(255,213,79,.8)';g.fillRect(W/2-W*.1,cy+8,W*.2*comboT/26,3);
}
}
function menuGeom(){var y0=Math.round(W*.2);return [y0,(W-y0-W*.075)/MODES.length];}
function drawMenu(tm){
var u=W/440,m=menuGeom(),y0=m[0],rh=m[1],i;
g.save();g.shadowColor='#4caf50';g.shadowBlur=24;
txt('SNAKE',W/2,W*.075+Math.sin(tm/500)*2,46*u,'#8bf08f',800);g.restore();
txt('SELECT A MODE',W/2,W*.145,11*u,'#789',700);
var hy=y0+selY*rh;
var gr=g.createLinearGradient(0,0,W,0);gr.addColorStop(0,'rgba(76,175,80,.28)');gr.addColorStop(1,'rgba(38,198,218,.2)');
g.fillStyle=gr;rr(W*.05,hy+2,W*.9,rh-4,12);
for(i=0;i<MODES.length;i++){
var m2=MODES[i],yy=y0+i*rh,sl=i===sel;
g.fillStyle=m2.c;g.beginPath();g.arc(W*.1,yy+rh/2,rh*.27,0,6.283);g.fill();
txt(i+1,W*.1,yy+rh/2+1,13*u,'#0a0d12',800);
txt(m2.name,W*.17,yy+rh*.38,(sl?19:17)*u,sl?'#fff':'#cfd8dc',800,'left');
txt(m2.desc,W*.17,yy+rh*.72,11*u,sl?'#b0bec5':'#78909c',600,'left');
var b=S.best[m2.id];
if(b)txt('BEST '+b,W*.93,yy+rh/2,11*u,'#90a4ae',700,'right');
}
txt('Arrows + Enter, keys 1-8, or tap',W/2,W-W*.035,11*u,'#607080',600);
}
function drawOverlay(tm){
var u=W/440,sn=Math.sin(tm/280);
if(state==='ready'){
dim(.5);
if(B){
txt('BOSS '+(bi+1)+' / '+BOSSES.length,W/2,W*.28,16*u,'#9aa7b4',700);
g.save();g.shadowColor=B.def.c;g.shadowBlur=26;txt(B.def.n,W/2,W*.4,48*u,B.def.c,800);g.restore();
txt(B.def.t,W/2,W*.53,15*u,'#e0e6ec',600);
txt('Eat '+B.max+' apples to win',W/2,W*.6,13*u,'#9aa7b4',600);
}else{
g.save();g.shadowColor=mode.c;g.shadowBlur=24;txt(mode.name.toUpperCase(),W/2,W*.38,42*u,mode.c,800);g.restore();
txt(mode.desc,W/2,W*.5,16*u,'#e0e6ec',600);
}
txt('Arrow keys / swipe to start',W/2,W*.72,16*u,'rgba(255,255,255,'+(.65+.35*sn)+')',700);
txt('R restart • M menu • Space pause',W/2,W*.8,12*u,'#7d8a97',600);
}else if(state==='pause'){
dim(.6);txt('PAUSED',W/2,W*.45,40*u,'#fff',800);txt('Space / P / tap to resume',W/2,W*.57,14*u,'#9aa7b4',600);
}else if(state==='bossdown'){
var k=easeBack(clamp(stT/400,0,1));
g.save();g.translate(W/2,W*.42);g.scale(k,k);g.shadowColor='#ffd54f';g.shadowBlur=24;
txt('BOSS DEFEATED',0,0,38*u,'#ffd54f',800);g.restore();
txt('+500',W/2,W*.55,20*u,'#fff',700);
}else if(state==='over'||state==='win'){
dim(.7);
var win=state==='win';
g.save();g.shadowColor=win?'#ffd54f':'#ff5252';g.shadowBlur=22;
txt(win?'ALL BOSSES DEFEATED':endMsg,W/2,W*.24,(win?30:38)*u,win?'#ffd54f':'#ff5252',800);g.restore();
txt('SCORE '+score,W/2,W*.38,30*u,'#fff',800);
if(newBest)txt('NEW BEST!',W/2,W*.48,20*u,'rgba(255,213,79,'+(.7+.3*sn)+')',800);
else txt('BEST '+(S.best[mode.id]||0),W/2,W*.48,16*u,'#9aa7b4',700);
if(B&&!win)txt('Reached boss '+(bi+1)+' / '+BOSSES.length,W/2,W*.56,14*u,'#9aa7b4',600);
else if(!B)txt('Apples '+apples+'  •  Length '+snake.length,W/2,W*.56,14*u,'#9aa7b4',600);
txt(B&&!win?'Space / Enter: retry boss':'Space / Enter: play again',W/2,W*.68,16*u,'rgba(255,255,255,'+(.65+.35*sn)+')',700);
txt(B&&!win?'R: restart run  •  M: menu':'R: restart  •  M: menu',W/2,W*.76,13*u,'#7d8a97',600);
}
}
function draw(tm){
g.setTransform(dpr,0,0,dpr,0,0);
g.clearRect(0,0,W,W+HUD);
drawHUD(tm);
g.save();g.translate(0,HUD);g.beginPath();g.rect(0,0,W,W);g.clip();
g.fillStyle='#0b0e13';g.fillRect(0,0,W,W);
if(shake>0)g.translate((Math.random()-.5)*shake*1.6,(Math.random()-.5)*shake*1.6);
if(state==='ready'){var z=.94+.06*ease(clamp(stT/260,0,1));g.translate(W/2,W/2);g.scale(z,z);g.translate(-W/2,-W/2);}
g.drawImage(bgc,0,0,W,W);
var i;
if(state==='menu')drawMenu(tm);
else{
if(B){g.fillStyle=B.def.c;g.globalAlpha=.05;g.fillRect(0,0,W,W);g.globalAlpha=1;}
for(i=0;i<obst.length;i++)drawBlock(obst[i],tm);
if(B)B.draw(tm);
for(i=0;i<foods.length;i++)drawFood(foods[i],tm);
if(!dead){
var pts=snakePts(snake,prev,A);
drawSnake(pts,135,170,dir,1,combo>=4,tm);
}
if(mode.wrap){g.strokeStyle='rgba(38,198,218,.22)';g.setLineDash([6,6]);g.lineWidth=2;g.strokeRect(1,1,W-2,W-2);g.setLineDash([]);}
else{g.strokeStyle='rgba(255,82,82,.5)';g.lineWidth=3;g.shadowColor='#ff5252';g.shadowBlur=10;g.strokeRect(1.5,1.5,W-3,W-3);g.shadowBlur=0;}
}
g.globalCompositeOperation='lighter';
for(i=0;i<parts.length;i++){
var p=parts[i],l=p.life/p.max;
g.globalAlpha=Math.min(1,l*1.4);g.fillStyle=p.c;g.beginPath();g.arc(p.x,p.y,p.s*(.35+.65*l),0,6.283);g.fill();
}
g.globalCompositeOperation='source-over';g.globalAlpha=1;
for(i=0;i<pops.length;i++){
var q=pops[i],k=q.age/900;
g.globalAlpha=1-k*k;
g.save();g.translate(q.x,q.y);var sc=1+.4*Math.max(0,1-q.age/150);g.scale(sc,sc);
g.lineWidth=4;g.strokeStyle='rgba(0,0,0,.6)';g.font='800 '+Math.round(15*W/440)+'px '+FONT;g.textAlign='center';g.textBaseline='middle';
g.strokeText(q.t,0,0);g.fillStyle=q.c;g.fillText(q.t,0,0);g.restore();
}
g.globalAlpha=1;
if(state!=='menu')drawOverlay(tm);
if(flash>0){g.fillStyle=flashC;g.globalAlpha=Math.min(flash,1)*.45;g.fillRect(0,0,W,W);g.globalAlpha=1;}
g.restore();
}
function frame(tm){
if(closed)return;
raf=requestAnimationFrame(frame);
var dt=Math.min(50,tm-(last||tm));last=tm;tmNow=tm;
update(dt);draw(tm);
}

/* ---------- input ---------- */
function onKey(e){
if(e.metaKey||e.ctrlKey||e.altKey)return;
var k=e.key,u=true;unlock();
var lk=k.length===1?k.toLowerCase():k;
if(lk==='Escape')close();
else if(lk==='n')toggleSound();
else if(state==='menu'){
if(lk==='ArrowUp'||lk==='w'){sel=(sel+MODES.length-1)%MODES.length;sTick();}
else if(lk==='ArrowDown'||lk==='s'){sel=(sel+1)%MODES.length;sTick();}
else if(lk==='Enter'||lk===' '||lk==='ArrowRight'||lk==='d')start(sel);
else if(lk>='1'&&lk<='8'&&lk.length===1)start(+lk-1);
else u=false;
}
else if(lk==='ArrowUp'||lk==='w')turn(0,-1);
else if(lk==='ArrowDown'||lk==='s')turn(0,1);
else if(lk==='ArrowLeft'||lk==='a')turn(-1,0);
else if(lk==='ArrowRight'||lk==='d')turn(1,0);
else if(lk===' '||lk==='Enter'||lk==='p'){
if(state==='over'||state==='win')retry();else togglePause();
}
else if(lk==='r')restart();
else if(lk==='m'||lk==='Backspace')toMenu();
else u=false;
if(u){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();}
}
window.addEventListener('keydown',onKey,true);
function onBlur(){if(state==='play')setState('pause');}
window.addEventListener('blur',onBlur);
function tap(cx,cy){
var r=cv.getBoundingClientRect(),x=(cx-r.left)*(W/r.width),y=(cy-r.top)*((W+HUD)/r.height)-HUD;
unlock();
if(y<0){if(x>W*.6)toggleSound();return;}
if(state==='menu'){
var m=menuGeom(),row=Math.floor((y-m[0])/m[1]);
if(row>=0&&row<MODES.length){sel=row;start(row);}
}
else if(state==='ready')togglePause();
else if(state==='over'||state==='win')retry();
else if(state==='pause')togglePause();
}
var tx=null,ty=0,moved=false;
cv.addEventListener('touchstart',function(e){unlock();var t=e.touches[0];tx=t.clientX;ty=t.clientY;moved=false;e.preventDefault();},{passive:false});
cv.addEventListener('touchmove',function(e){
e.preventDefault();
if(tx==null)return;
var t=e.touches[0],dx=t.clientX-tx,dy=t.clientY-ty;
if(Math.max(Math.abs(dx),Math.abs(dy))<18)return;
moved=true;
if(state==='menu')return;
if(Math.abs(dx)>Math.abs(dy))turn(dx>0?1:-1,0);else turn(0,dy>0?1:-1);
tx=t.clientX;ty=t.clientY;
},{passive:false});
cv.addEventListener('touchend',function(e){
e.preventDefault();
if(tx!=null&&!moved){var t=e.changedTouches[0];tap(t.clientX,t.clientY);}
tx=null;
},{passive:false});
cv.addEventListener('click',function(e){tap(e.clientX,e.clientY);});
ov.addEventListener('touchmove',function(e){e.preventDefault();},{passive:false});
ov.addEventListener('click',function(e){if(!box.contains(e.target))close();});
function close(){
closed=1;cancelAnimationFrame(raf);
window.removeEventListener('keydown',onKey,true);
window.removeEventListener('blur',onBlur);
try{if(AC)AC.close();}catch(e){}
if(ov.parentNode)ov.parentNode.removeChild(ov);
}
ov.__close=close;
ov.__d=function(s){return eval(s);};/*DBG*/
raf=requestAnimationFrame(frame);
})();}catch(e){alert('Snake+ error: '+(e&&e.message));}
