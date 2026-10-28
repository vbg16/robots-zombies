const canvas = document.querySelector('#game'), ctx = canvas.getContext('2d');
const el = id => document.getElementById(id);
const keys = new Set();
let width=1000,height=600,state='menu',last=0,clock=0,spawn=0,shot=0,kills=0,level=1,xp=0,need=6;
let player,enemies=[],bullets=[],gems=[],sparks=[],aim={x:0,y:0,active:false},firing=false;
const HORDE={initialDelay:2,interval:1.6,minInterval:.65,ramp:.005,maxEnemies:70,minSpeed:24,maxSpeed:42,speedRamp:.1};
const BATTERY_COUNT=5,HP_PER_BATTERY=20;
let displayedHealth=null;
function renderHealth(hp){hp=Math.max(0,Math.min(100,hp));if(displayedHealth===hp)return;displayedHealth=hp;const health=el('health');health.setAttribute('aria-valuenow',String(hp));health.setAttribute('aria-valuetext',`${hp} de 100 de integridade`);health.innerHTML=Array.from({length:BATTERY_COUNT},(_,i)=>{const charge=Math.max(0,Math.min(1,(hp-i*HP_PER_BATTERY)/HP_PER_BATTERY));return `<span class="battery${charge===0?' battery--broken':''}" aria-hidden="true"><svg viewBox="0 0 24 36"><path class="battery-shell" d="M8 1h8v4h5v29H3V5h5z"/><rect class="battery-charge" x="6" y="${30-22*charge}" width="12" height="${22*charge}"/><path class="battery-crack" d="M3 16l9 4-5 5 14 3"/></svg></span>`;}).join('');}
const random=(a,b)=>a+Math.random()*(b-a);
function resize(){const r=canvas.getBoundingClientRect();width=r.width;height=r.height;canvas.width=width*devicePixelRatio;canvas.height=height*devicePixelRatio;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);if(player){player.x=Math.min(width-16,player.x);player.y=Math.min(height-16,player.y);}}
window.addEventListener('resize',resize);resize();
function clearInput(){keys.clear();firing=false;}
function reset(){clearInput();aim={x:width/2+100,y:height/2,active:false};player={x:width/2,y:height/2,hp:100,speed:190,damage:22,rate:.32,magnet:65,inv:0};enemies=[];bullets=[];gems=[];sparks=[];clock=0;spawn=HORDE.initialDelay;shot=0;kills=0;level=1;xp=0;need=6;state='playing';el('overlay').hidden=true;el('pause').textContent='PAUSAR [P]';updateHUD();}
function show(title,description,label){clearInput();el('heading').textContent=title;el('description').textContent=description;el('eyebrow').textContent='UNIDADE R-01 / '+(state==='over'?'SINAL PERDIDO':'PROTOCOLO ATIVO');el('choices').replaceChildren();el('start').textContent=label;el('start').hidden=false;el('overlay').hidden=false;}
function pause(){if(state==='playing'){state='paused';clearInput();show('Sistema em espera.','Respire. A horda pode esperar um instante.','CONTINUAR ↗');el('pause').textContent='CONTINUAR [P]';}else if(state==='paused'){state='playing';el('overlay').hidden=true;el('pause').textContent='PAUSAR [P]';}}
el('start').onclick=()=>state==='paused'?pause():reset();el('pause').onclick=pause;
window.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();keys.add(e.key.toLowerCase());if(e.key.toLowerCase()==='p'&&!e.repeat)pause();});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>{clearInput();if(state==='playing')pause();});
function updateAim(e){const r=canvas.getBoundingClientRect();aim={x:(e.clientX-r.left)*width/r.width,y:(e.clientY-r.top)*height/r.height,active:true};}
canvas.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'||e.pointerType==='pen')updateAim(e);});
canvas.addEventListener('pointerdown',e=>{if(state!=='playing'||e.button!==0||e.pointerType==='touch')return;updateAim(e);firing=true;canvas.setPointerCapture(e.pointerId);});
window.addEventListener('pointerup',e=>{if(e.button===0)firing=false;});
canvas.addEventListener('pointercancel',()=>firing=false);
canvas.addEventListener('lostpointercapture',()=>firing=false);
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();if(state==='playing')pause();}});
function updateHUD(){renderHealth(player.hp);el('time').textContent=`${String(Math.floor(clock/60)).padStart(2,'0')}:${String(Math.floor(clock%60)).padStart(2,'0')}`;el('kills').textContent=kills;el('level').textContent=String(level).padStart(2,'0');el('xp').style.width=(xp/need*100)+'%';}
function upgrade(){state='upgrade';clearInput();show('Evolução disponível.','Selecione uma melhoria para voltar ao combate.','');el('start').hidden=true;const options=[['OVERDRIVE','Disparos 18% mais rápidos',()=>player.rate*=.82],['ALTO IMPACTO','Dano dos tiros +30%',()=>player.damage*=1.3],['AUTORREPARO','Recupera 35 de integridade',()=>player.hp=Math.min(100,player.hp+35)],['PERNAS HIDRÁULICAS','Velocidade de movimento +15%',()=>player.speed*=1.15],['CAMPO MAGNÉTICO','Alcance de coleta +40%',()=>player.magnet*=1.4]];for(let i=options.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[options[i],options[j]]=[options[j],options[i]];}for(const [name,desc,apply] of options.slice(0,3)){const b=document.createElement('button');const strong=document.createElement('strong');strong.textContent=name;b.append(strong,document.createTextNode(desc));b.onclick=()=>{apply();state='playing';el('overlay').hidden=true;updateHUD();};el('choices').append(b);}}
function tick(dt){clock+=dt;if(clock>=180){state='won';show('Protocolo concluído.','Você resistiu por 3 minutos. '+kills+' zumbis eliminados. A unidade R-01 segue operacional.','JOGAR NOVAMENTE ↗');return;}player.inv=Math.max(0,player.inv-dt);let dx=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft')),dy=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));const length=Math.hypot(dx,dy)||1;player.x=Math.max(15,Math.min(width-15,player.x+dx/length*player.speed*dt));player.y=Math.max(80,Math.min(height-20,player.y+dy/length*player.speed*dt));spawn-=dt;if(spawn<=0&&enemies.length<HORDE.maxEnemies){spawn=Math.max(HORDE.minInterval,HORDE.interval-clock*HORDE.ramp);const side=Math.floor(random(0,4));enemies.push({x:side===0?-20:side===1?width+20:random(0,width),y:side===2?-20:side===3?height+20:random(0,height),hp:30+clock*.35,speed:random(HORDE.minSpeed,HORDE.maxSpeed)+clock*HORDE.speedRamp,r:random(11,16)});}
shot=Math.max(0,shot-dt);if(firing&&aim.active&&shot<=0){const angle=Math.atan2(aim.y-player.y,aim.x-player.x);bullets.push({x:player.x,y:player.y,vx:Math.cos(angle)*570,vy:Math.sin(angle)*570,life:1.8});shot=player.rate;}

for(const b of bullets){b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;for(const z of enemies){if(z.hp>0&&b.life>0&&Math.hypot(z.x-b.x,z.y-b.y)<z.r+6){z.hp-=player.damage;b.life=0;for(let i=0;i<4;i++)sparks.push({x:z.x,y:z.y,vx:random(-90,90),vy:random(-90,90),life:.25});if(z.hp<=0){kills++;gems.push({x:z.x,y:z.y});}break;}}}bullets=bullets.filter(b=>b.life>0);enemies=enemies.filter(z=>z.hp>0);
for(const z of enemies){const d=Math.hypot(player.x-z.x,player.y-z.y)||1;z.x+=(player.x-z.x)/d*z.speed*dt;z.y+=(player.y-z.y)/d*z.speed*dt;if(d<z.r+14&&player.inv<=0){player.hp-=12;player.inv=.65;if(player.hp<=0){state='over';show('Fim da transmissão.',`Sua unidade resistiu por ${Math.floor(clock)} segundos e eliminou ${kills} zumbis. Tente outra estratégia.`,'REINICIAR UNIDADE ↗');}}}
for(const g of gems){const d=Math.hypot(g.x-player.x,g.y-player.y);if(d<player.magnet){g.x+=(player.x-g.x)*Math.min(1,dt*9);g.y+=(player.y-g.y)*Math.min(1,dt*9);}if(d<18){g.collected=true;xp++;}}gems=gems.filter(g=>!g.collected);if(xp>=need&&state==='playing'){xp-=need;level++;need=Math.ceil(need*1.4);upgrade();}for(const p of sparks){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;}sparks=sparks.filter(p=>p.life>0);updateHUD();}
function draw(){ctx.fillStyle='#0b1728';ctx.fillRect(0,0,width,height);ctx.strokeStyle='#162c45';ctx.lineWidth=1;ctx.beginPath();for(let x=0;x<width;x+=45){ctx.moveTo(x,0);ctx.lineTo(x,height);}for(let y=0;y<height;y+=45){ctx.moveTo(0,y);ctx.lineTo(width,y);}ctx.stroke();for(const g of gems){ctx.fillStyle='#68cbe8';ctx.beginPath();ctx.moveTo(g.x,g.y-5);ctx.lineTo(g.x+4,g.y);ctx.lineTo(g.x,g.y+5);ctx.lineTo(g.x-4,g.y);ctx.fill();}for(const z of enemies){ctx.fillStyle='#647d42';ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,Math.PI*2);ctx.fill();ctx.fillStyle='#bfdf86';ctx.fillRect(z.x-6,z.y-4,4,3);ctx.fillRect(z.x+3,z.y-4,4,3);ctx.fillStyle='#34442a';ctx.fillRect(z.x-5,z.y+5,10,3);}ctx.fillStyle='#89ddff';for(const b of bullets){ctx.beginPath();ctx.arc(b.x,b.y,6,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(b.x,b.y,2.5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#89ddff';}for(const p of sparks){ctx.globalAlpha=p.life/.25;ctx.fillStyle='#5dbbff';ctx.fillRect(p.x,p.y,3,3);}ctx.globalAlpha=1;if(player){ctx.save();ctx.translate(player.x,player.y);if(player.inv>0)ctx.globalAlpha=.5+Math.sin(player.inv*40)*.3;ctx.strokeStyle='#5dbbff33';ctx.beginPath();ctx.arc(0,0,24,0,Math.PI*2);ctx.stroke();// Compact service droid: domed head, armored shoulders, twin feet.
ctx.fillStyle='#050d1b';ctx.fillRect(-21,16,42,6);
ctx.fillStyle='#245d9b';ctx.fillRect(-20,-5,8,24);ctx.fillRect(12,-5,8,24);
ctx.fillStyle='#dceeff';ctx.fillRect(-18,-3,5,19);ctx.fillRect(13,-3,5,19);
ctx.fillStyle='#789bbf';ctx.fillRect(-19,14,9,7);ctx.fillRect(10,14,9,7);
ctx.fillStyle='#e7f3ff';ctx.fillRect(-12,-8,24,25);
ctx.fillStyle='#b7cfe6';ctx.fillRect(7,-8,5,25);
ctx.fillStyle='#337fcc';ctx.fillRect(-10,-5,20,5);ctx.fillRect(-3,2,6,12);
ctx.fillStyle='#122b4b';ctx.fillRect(-9,3,4,3);ctx.fillRect(-9,8,4,3);ctx.fillRect(5,4,4,7);
ctx.fillStyle='#7ee9ff';ctx.fillRect(-8,4,2,1);ctx.fillRect(-2,4,4,6);
ctx.fillStyle='#dceeff';ctx.beginPath();ctx.arc(0,-8,12,Math.PI,Math.PI*2);ctx.fill();ctx.fillRect(-12,-9,24,3);
ctx.fillStyle='#347fcc';ctx.fillRect(-3,-20,6,6);ctx.fillRect(-11,-10,22,3);
ctx.fillStyle='#0b1c33';ctx.fillRect(-6,-15,8,6);ctx.fillStyle='#83efff';ctx.fillRect(-4,-14,4,3);
ctx.fillStyle='#ff827d';ctx.fillRect(5,-13,3,2);
ctx.fillStyle='#a8c9eb';ctx.fillRect(-14,-18,2,8);ctx.fillStyle='#5dbbff';ctx.fillRect(-15,-20,4,3);
ctx.restore();if(aim.active&&state==='playing'){ctx.strokeStyle='#89ddff';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(aim.x,aim.y,7,0,Math.PI*2);ctx.moveTo(aim.x-12,aim.y);ctx.lineTo(aim.x-4,aim.y);ctx.moveTo(aim.x+4,aim.y);ctx.lineTo(aim.x+12,aim.y);ctx.moveTo(aim.x,aim.y-12);ctx.lineTo(aim.x,aim.y-4);ctx.moveTo(aim.x,aim.y+4);ctx.lineTo(aim.x,aim.y+12);ctx.stroke();}}}
function frame(now){const dt=Math.min((now-last)/1000,.04);last=now;if(state==='playing')tick(dt);draw();requestAnimationFrame(frame);}requestAnimationFrame(frame);

renderHealth(100);
