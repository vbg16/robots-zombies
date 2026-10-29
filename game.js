'use strict';
const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d'),el=id=>document.getElementById(id);
const keys=new Set(),random=(a,b)=>a+Math.random()*(b-a);
const HORDE={initialDelay:2,interval:1.6,minInterval:.65,ramp:.005,maxEnemies:70,minSpeed:24,maxSpeed:42};
const WEAPONS=Object.freeze(Object.fromEntries(Object.entries({
 machine:{name:'Metralhadora',damage:22,rate:.32,pellets:1,spread:0,life:1.8,description:'Precisão a distância. 22 de dano · 1 projétil · 0,32 s.'},
 shotgun:{name:'Escopeta',damage:12,rate:.8,pellets:5,spread:.34,life:.65,description:'Cone de curto alcance. 12 de dano × 5 · 0,80 s.'},
 burst:{name:'Fuzil de rajada',damage:14,rate:.65,pellets:1,spread:0,life:1.5,burst:3,description:'Três tiros em sequência enquanto segura disparo. 14 por tiro · ciclo 0,65 s.'},
 sniper:{name:'Canhão de precisão',damage:88,rate:1.15,pellets:1,spread:0,life:1.2,speed:1050,pierce:3,description:'Tiro veloz que atravessa quatro alvos. 88 de dano · 1,15 s.'},
 laser:{name:'Emissor laser',damage:10,rate:.09,pellets:1,spread:0,life:.5,speed:1600,radius:4,description:'Pulsos finos e rápidos, sem autoaim. 10 de dano · 0,09 s.'},
 flame:{name:'Lança-chamas',damage:5,rate:.12,pellets:3,spread:.45,life:.6,speed:220,burn:true,description:'Cone curto; aplica queimadura por 3 s. 5 de dano × 3 · 0,12 s.'},
 cryo:{name:'Lançador criogênico',damage:14,rate:.36,pellets:1,spread:0,life:1.6,speed:420,freeze:true,description:'Projétil gélido desacelera por 2 s. 14 de dano · 0,36 s.'},
 rocket:{name:'Lança-foguetes',damage:70,rate:1.3,pellets:1,spread:0,life:2.4,speed:280,explosion:96,splash:1,description:'Explosão de 96 px no impacto. 70 de dano · 1,30 s.'},
 grenade:{name:'Lança-granadas',damage:45,rate:1,pellets:1,spread:0,life:1.1,speed:320,explosion:90,splash:1,detonate:true,description:'Explode por contato ou ao fim de 1,1 s. 45 de dano · 1 s.'},
 tesla:{name:'Carabina Tesla',damage:18,rate:.55,pellets:1,spread:0,life:1,speed:720,chain:2,description:'Impacto descarrega em dois outros alvos. 18 de dano · 0,55 s.'},
 disc:{name:'Disco de retorno',damage:24,rate:.85,pellets:1,spread:0,life:1.8,speed:360,returning:true,description:'Atravessa alvos e retorna; pode acertar uma vez por trecho. 24 · 0,85 s.'},
 harpoon:{name:'Arpão pneumático',damage:60,rate:1.05,pellets:1,spread:0,life:1.3,speed:750,pierce:1,knock:65,description:'Atravessa dois alvos e empurra. 60 de dano · 1,05 s.'}
}).map(([id,w])=>[id,Object.freeze(w)])));
const ROBOTS=Object.freeze({
 prot:Object.freeze({name:'PROT-0001',hp:100,speed:190,armor:0,description:'Equilibrado · 5 baterias · velocidade 190 · 1 slot.'}),
 bastion:Object.freeze({name:'BAST-0002',hp:120,speed:155,armor:1,description:'Blindado · 6 baterias · velocidade 155 · reduz 1 de dano · 1 slot.'})
});
let width=1000,height=600,state='garage',last=0,clock=0,spawn=0,shot=0,kills=0,level=1,xp=0,need=6;
let selectedRobot='prot',runRobot=null,burstQueue=[],robotSprite=null;
if(typeof Image!=='undefined'){robotSprite=new Image();robotSprite.src='assets/robots/bast-0002-walk.svg';}
let selectedWeapon='machine',runWeapon=null,player=null,enemies=[],bullets=[],gems=[],sparks=[],feedback=[],effects=[],hostile=[];
let camera={x:0,y:0},aim={x:0,y:0,active:false},firing=false,upgradeFlash=0,boss=null,bossSpawned=false,bossDefeated=false,bossReward=false,offerVersion=0,offerSource='level';
const BATTERY_COUNT=5,HP_PER_BATTERY=20;
let displayedHealth=null;
function renderHealth(hp){
 const max=player?.maxHp||100;hp=Math.max(0,Math.min(max,hp));const key=hp+'/'+max;if(displayedHealth===key)return;displayedHealth=key;
 const health=el('health');health.setAttribute('aria-valuemax',String(max));health.setAttribute('aria-valuenow',String(hp));health.setAttribute('aria-valuetext',Math.ceil(hp)+' de '+max+' de integridade');
 health.innerHTML=Array.from({length:Math.ceil(max/HP_PER_BATTERY)},(_,i)=>{const charge=Math.max(0,Math.min(1,(hp-i*HP_PER_BATTERY)/HP_PER_BATTERY));return '<span class="battery'+(charge===0?' battery--broken':'')+'" aria-hidden="true"><svg viewBox="0 0 24 36"><path class="battery-shell" d="M8 1h8v4h5v29H3V5h5z"/><rect class="battery-charge" x="6" y="'+(30-22*charge)+'" width="12" height="'+22*charge+'"/><path class="battery-crack" d="M3 16l9 4-5 5 14 3"/></svg></span>';}).join('');
}

function clearInput(){keys.clear();firing=false;burstQueue=[];}
function syncCamera(dt=0){
 if(!dt){camera.x=player.x-width/2;camera.y=player.y-height/2;return;}
 const ox=player.x-camera.x-width/2,oy=player.y-camera.y-height/2,blend=1-Math.exp(-6*dt);
 camera.x+=Math.sign(ox)*Math.max(0,Math.abs(ox)-Math.min(75,width*.08))*blend;
 camera.y+=Math.sign(oy)*Math.max(0,Math.abs(oy)-Math.min(50,height*.08))*blend;
}
function resize(){const r=canvas.getBoundingClientRect();width=r.width||1000;height=r.height||600;const dpr=window.devicePixelRatio||1;canvas.width=width*dpr;canvas.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);if(player)syncCamera();}
window.addEventListener('resize',resize);
function selectWeapon(id){if(state!=='garage'||!WEAPONS[id])return false;selectedWeapon=id;renderLoadout();return true;}
function selectRobot(id){if(state!=='garage'||!ROBOTS[id])return false;selectedRobot=id;renderLoadout();return true;}
function renderLoadout(){
 for(const id of Object.keys(ROBOTS))el('robot-'+id).setAttribute('aria-pressed',String(id===selectedRobot));
 el('chassis-name').textContent=ROBOTS[selectedRobot].name;el('chassis-description').textContent=ROBOTS[selectedRobot].description;
 el('garage-robot-preview').src=selectedRobot==='bastion'?'assets/robots/bast-0002-preview.svg':'assets/robots/prot-preview.svg';
 for(const id of Object.keys(WEAPONS))el('weapon-'+id).setAttribute('aria-pressed',String(id===selectedWeapon));
 el('loadout').textContent=ROBOTS[selectedRobot].name+' · 1 slot · '+WEAPONS[selectedWeapon].name;
 el('weapon-description').textContent=WEAPONS[selectedWeapon].description;
}
function openGarage(){
 clearInput();offerVersion++;state='garage';el('garage').hidden=false;el('combat').hidden=true;
 el('overlay').hidden=true;renderLoadout();el('launch').focus();
}
function reset(){
 clearInput();offerVersion++;runRobot=Object.freeze({...ROBOTS[selectedRobot],id:selectedRobot});runWeapon=Object.freeze({...WEAPONS[selectedWeapon],id:selectedWeapon});
 el('garage').hidden=true;el('combat').hidden=false;resize();
 player={x:width/2,y:height/2,hp:runRobot.hp,maxHp:runRobot.hp,speed:runRobot.speed,armor:runRobot.armor,baseDamage:runWeapon.damage,damage:runWeapon.damage,damageStacks:0,rate:runWeapon.rate,rateStacks:0,magnet:65,walkPhase:0,stride:0,inv:0,skills:{pierce:0,blast:0,shock:0,crit:0,burn:0,freeze:0,knock:0,salvage:0,armor:0,regen:0,range:0,extra:0,shield:0,xp:0,grace:0,bossHunter:0,finisher:0,ricochet:0,blastRadius:0,conductivity:0,stun:0,emergency:0,dash:0},regenTimer:0,shieldReady:false,shieldTimer:0,emergencyUsed:false,dashTime:0,dashCooldown:0,dashDx:1,dashDy:0};
 enemies=[];bullets=[];gems=[];sparks=[];feedback=[];effects=[];hostile=[];
 boss=null;bossSpawned=false;bossDefeated=false;bossReward=false;clock=0;spawn=HORDE.initialDelay;shot=0;kills=0;level=1;xp=0;need=6;upgradeFlash=0;
 aim={x:width/2+100,y:height/2,active:false};syncCamera();state='playing';el('overlay').hidden=true;el('pause').textContent='PAUSAR [P]';updateHUD();
}
function show(title,description,label){
 clearInput();el('heading').textContent=title;el('description').textContent=description;
 el('eyebrow').textContent=state==='reward'?'RECUPERAÇÃO DE CAMPO':(runRobot?.name||'PROT-0001')+' / '+(state==='over'?'SINAL PERDIDO':'PROTOCOLO ATIVO');
 el('choices').replaceChildren();el('start').textContent=label;el('start').hidden=!label;el('overlay').hidden=false;
 el('return-garage').hidden=state!=='over'&&state!=='won'&&state!=='paused';
 if(label)el('start').focus();
}
function pause(){if(state==='playing'){state='paused';show('Sistema em espera.','A partida está pausada.','CONTINUAR');el('pause').textContent='CONTINUAR [P]';}else if(state==='paused'){state='playing';clearInput();el('overlay').hidden=true;el('pause').textContent='PAUSAR [P]';}}
el('launch').onclick=reset;
for(const id of Object.keys(WEAPONS))el('weapon-'+id).onclick=()=>selectWeapon(id);
for(const id of Object.keys(ROBOTS))el('robot-'+id).onclick=()=>selectRobot(id);
el('start').onclick=()=>state==='paused'?pause():reset();el('pause').onclick=pause;el('return-garage').onclick=openGarage;
window.addEventListener('keydown',e=>{if(state==='garage')return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();if(state==='playing')keys.add(e.key.toLowerCase());if(state==='playing'&&e.key===' '&&!e.repeat)activateDash();if(e.key.toLowerCase()==='p'&&!e.repeat)pause();});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
window.addEventListener('blur',()=>{clearInput();if(state==='playing')pause();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();if(state==='playing')pause();}});
function updateAim(e){const r=canvas.getBoundingClientRect();aim={x:(e.clientX-r.left)*width/r.width,y:(e.clientY-r.top)*height/r.height,active:true};}
canvas.addEventListener('pointermove',e=>{if(e.pointerType!=='touch')updateAim(e);});
canvas.addEventListener('pointerdown',e=>{if(state!=='playing'||e.button!==0||e.pointerType==='touch')return;updateAim(e);firing=true;canvas.setPointerCapture(e.pointerId);});
window.addEventListener('pointerup',e=>{if(e.button===0){firing=false;burstQueue=[];}});
for(const event of ['pointercancel','lostpointercapture'])canvas.addEventListener(event,()=>{firing=false;burstQueue=[];});
function activateDash(){
 if(state!=='playing'||!player.skills.dash||player.dashCooldown>0)return false;
 let dx=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft')),dy=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));
 if(!dx&&!dy){if(aim.active){dx=aim.x+camera.x-player.x;dy=aim.y+camera.y-player.y;}else dx=1;}
 const d=Math.hypot(dx,dy)||1;player.dashDx=dx/d;player.dashDy=dy/d;player.dashTime=.15;player.dashCooldown=4;
 effects.push({x:player.x,y:player.y,r:38,life:.2,max:.2,color:'#b9efff'});toast('PROPULSOR');return true;
}
function activeSynergies(){const s=player.skills;return [s.pierce&&s.blast?'ESTILHAÇOS: explosão em cada alvo atravessado':null,s.pierce&&s.shock?'CONDUTOR: descarga atinge até 3 alvos':null,s.blast&&s.shock?'PLASMA: explosões eletrocutam sobreviventes':null,s.burn&&s.freeze?'CHOQUE TÉRMICO: queimadura +50% em alvos resfriados':null,s.knock&&s.pierce?'LANÇA INDUSTRIAL: perfuração com empurrão':null,s.ricochet&&s.blast?'DEMOLIÇÃO: explosões em ricochetes':null,s.stun&&(s.shock||runWeapon.chain)?'PANE: descargas interrompem movimento':null].filter(Boolean);}
function updateHUD(){
 renderHealth(player.hp);el('time').textContent=String(Math.floor(clock/60)).padStart(2,'0')+':'+String(Math.floor(clock%60)).padStart(2,'0');
 el('kills').textContent=kills;el('level').textContent=String(level).padStart(2,'0');el('xp').style.width=Math.min(100,xp/need*100)+'%';
 el('combat-loadout').textContent=runRobot.name+' · '+runWeapon.name+' · dano '+player.damage.toFixed(1)+(runWeapon.pellets+player.skills.extra>1?' × '+(runWeapon.pellets+player.skills.extra):'')+' · bônus +'+player.damageStacks*30+'%';
 const names=SKILLS.filter(s=>player.skills[s.id]).map(s=>s.name);if(player.skills.shield)names.push(player.shieldReady?'ESCUDO PRONTO':'ESCUDO '+Math.ceil(player.shieldTimer)+' s');if(player.skills.dash)names.push(player.dashCooldown>0?'PROPULSOR '+Math.ceil(player.dashCooldown)+' s':'PROPULSOR [ESPAÇO]');if(player.skills.emergency&&player.emergencyUsed)names.push('RESERVA USADA');
 el('build-summary').textContent=(names.join(' · ')||'Sem módulos especiais')+(activeSynergies().length?' | '+activeSynergies().join(' | '):'');
 const live=!!boss&&boss.hp>0;el('boss-hud').hidden=!live;
 if(live){el('boss-health').style.width=Math.max(0,boss.hp/boss.maxHp*100)+'%';el('boss-action').textContent=boss.phase==='tellDash'?'INVESTIDA — saia da faixa laranja':boss.phase==='tellVolley'?'DISPAROS — afaste-se dos pontos':boss.phase==='dash'?'INVESTIDA':'BRUTAMONTES / '+Math.ceil(boss.hp)+' PV';}
}
function toast(text,color='#89ddff'){feedback.push({x:player.x,y:player.y-46,text,life:1.4,color});}
function boostDamage(){player.damageStacks++;player.damage=player.baseDamage*(1+.3*player.damageStacks);upgradeFlash=1;toast('DANO +'+player.damageStacks*30+'% · '+player.damage.toFixed(1));}
const SKILLS=[
 {id:'damage',name:'ALTO IMPACTO',describe:()=>'+30% do dano base. Total: +'+(player.damageStacks+1)*30+'%.',apply:boostDamage},
 {id:'rate',name:'OVERDRIVE',describe:()=>'+20% de cadência base. Total: +'+(player.rateStacks+1)*20+'%.',apply:()=>{player.rateStacks++;player.rate=runWeapon.rate/(1+.2*player.rateStacks);toast('CADÊNCIA +'+player.rateStacks*20+'%');}},
 {id:'repair',name:'AUTORREPARO',available:()=>player.hp<player.maxHp,describe:()=>'Recupera 35 de integridade nesta tentativa.',apply:()=>{player.hp=Math.min(player.maxHp,player.hp+35);toast('INTEGRIDADE RECUPERADA');}},
 {id:'pierce',name:'PERFURAÇÃO',available:()=>!player.skills.pierce,describe:()=>'Projéteis atravessam até 2 alvos adicionais. Combina com explosão e descarga.',apply:()=>{player.skills.pierce=1;toast('PERFURAÇÃO INSTALADA');}},
 {id:'blast',name:'CARGA EXPLOSIVA',available:()=>!player.skills.blast,describe:()=>'Cada impacto explode em 64 px, causando 45% do dano a outros alvos.',apply:()=>{player.skills.blast=1;toast('CARGA EXPLOSIVA INSTALADA');}},
 {id:'shock',name:'DESCARGA',available:()=>!player.skills.shock,describe:()=>'Impactos eletrocutam outro alvo em 135 px por 35% do dano. Perfuração amplia a corrente.',apply:()=>{player.skills.shock=1;toast('DESCARGA INSTALADA');}},
 {id:'speed',name:'PERNAS HIDRÁULICAS',describe:()=>'+15% de velocidade de movimento.',apply:()=>{player.speed*=1.15;toast('MOVIMENTO +15%');}},
 {id:'magnet',name:'CAMPO MAGNÉTICO',describe:()=>'Alcance de coleta +40%.',apply:()=>{player.magnet*=1.4;toast('ALCANCE DE COLETA AUMENTADO');}}
 ,{id:'crit',name:'MIRA CRÍTICA',available:()=>player.skills.crit<3,describe:()=>'+20 pontos percentuais de chance de dano duplo (máx. 60%).',apply:()=>{player.skills.crit++;toast('CRÍTICO '+player.skills.crit*20+'%');}}
 ,{id:'burn',name:'MUNIÇÃO INCENDIÁRIA',available:()=>!player.skills.burn,describe:()=>'Impactos queimam por 3 s: 20% do dano por segundo. Não acumula no mesmo alvo.',apply:()=>{player.skills.burn=1;toast('MUNIÇÃO INCENDIÁRIA');}}
 ,{id:'freeze',name:'NÚCLEO CRIOGÊNICO',available:()=>!player.skills.freeze,describe:()=>'Impactos reduzem movimento inimigo em 45% por 2 s, sem mudar atributos base.',apply:()=>{player.skills.freeze=1;toast('RESFRIAMENTO ATIVO');}}
 ,{id:'knock',name:'IMPACTO CINÉTICO',available:()=>!player.skills.knock,describe:()=>'Empurra o alvo 30 px no impacto; chefes recebem 25% do empurrão.',apply:()=>{player.skills.knock=1;toast('IMPACTO CINÉTICO');}}
 ,{id:'salvage',name:'RECICLAGEM DE CAMPO',available:()=>!player.skills.salvage,describe:()=>'Cada zumbi eliminado recupera 2 de integridade, até o máximo do chassi.',apply:()=>{player.skills.salvage=1;toast('RECICLAGEM ATIVA');}}
 ,{id:'armor',name:'BLINDAGEM REFORÇADA',available:()=>player.skills.armor<3,describe:()=>'+2 de redução de dano por aquisição (máx. +6). Dano mínimo recebido: 1.',apply:()=>{player.skills.armor++;player.armor+=2;toast('BLINDAGEM +2');}}
 ,{id:'regen',name:'NANORREPARO',available:()=>!player.skills.regen,describe:()=>'Recupera 1 de integridade a cada 3 s de combate; não avança na pausa.',apply:()=>{player.skills.regen=1;player.regenTimer=0;toast('NANORREPARO ATIVO');}}
 ,{id:'range',name:'PROPULSÃO BALÍSTICA',available:()=>player.skills.range<3,describe:()=>'+25% da duração base dos projéteis por aquisição (máx. +75%).',apply:()=>{player.skills.range++;toast('ALCANCE +'+player.skills.range*25+'%');}}
 ,{id:'extra',name:'CÂMARA DUPLA',available:()=>player.skills.extra<2,describe:()=>'+1 projétil por disparo, com abertura lateral (máx. +2).',apply:()=>{player.skills.extra++;toast('PROJÉTIL ADICIONAL');}}
 ,{id:'shield',name:'ESCUDO CAPACITIVO',available:()=>!player.skills.shield,describe:()=>'Absorve um impacto inteiro. Recarrega em 12 s de combate.',apply:()=>{player.skills.shield=1;player.shieldReady=true;player.shieldTimer=0;toast('ESCUDO CARREGADO');}}

 ,{id:'xp',name:'PROCESSADOR DE EXPERIÊNCIA',available:()=>player.skills.xp<3,describe:()=>'+25% de experiência por núcleo por aquisição; máximo +75%.',apply:()=>{player.skills.xp++;toast('EXPERIÊNCIA +'+player.skills.xp*25+'%');}}
 ,{id:'grace',name:'ISOLAMENTO DE IMPACTO',available:()=>player.skills.grace<3,describe:()=>'+0,20 s de proteção após sofrer dano; máximo +0,60 s.',apply:()=>{player.skills.grace++;toast('PROTEÇÃO PÓS-IMPACTO');}}
 ,{id:'bossHunter',name:'CAÇA-TITÃS',available:()=>player.skills.bossHunter<3,describe:()=>'+25% de dano contra chefes por aquisição; máximo +75%.',apply:()=>{player.skills.bossHunter++;toast('DANO EM CHEFES +'+player.skills.bossHunter*25+'%');}}
 ,{id:'finisher',name:'FINALIZADOR',available:()=>!player.skills.finisher,describe:()=>'Causa +50% de dano a alvos com até 30% da vida máxima.',apply:()=>{player.skills.finisher=1;toast('FINALIZADOR INSTALADO');}}
 ,{id:'ricochet',name:'MUNIÇÃO RICOCHETE',available:()=>!runWeapon.returning&&player.skills.ricochet<2,describe:()=>'Depois de esgotar perfuração, busca outro alvo em 220 px. +1 salto; máximo 2.',apply:()=>{player.skills.ricochet++;toast('RICOCHETE +1');}}
 ,{id:'blastRadius',name:'ONDA EXPANDIDA',available:()=>!!(player.skills.blast||runWeapon.explosion)&&player.skills.blastRadius<2,describe:()=>'+25% do raio base das explosões; máximo +50%. Não aumenta dano.',apply:()=>{player.skills.blastRadius++;toast('RAIO EXPLOSIVO +'+player.skills.blastRadius*25+'%');}}
 ,{id:'conductivity',name:'CONDUTIVIDADE',available:()=>!!(player.skills.shock||runWeapon.chain)&&player.skills.conductivity<2,describe:()=>'+40 px ao alcance de descarga; máximo +80 px.',apply:()=>{player.skills.conductivity++;toast('ALCANCE ELÉTRICO +40');}}
 ,{id:'stun',name:'CURTO-CIRCUITO',available:()=>!!(player.skills.shock||runWeapon.chain)&&!player.skills.stun,describe:()=>'Descargas param o movimento por 0,35 s; chefes por 0,09 s. Não cancela ataques.',apply:()=>{player.skills.stun=1;toast('CURTO-CIRCUITO ATIVO');}}
 ,{id:'emergency',name:'RESERVA DE EMERGÊNCIA',available:()=>!player.skills.emergency,describe:()=>'Cura 20 ao sobreviver a um golpe e ficar com até 30% de vida. Uma vez por tentativa.',apply:()=>{player.skills.emergency=1;toast('RESERVA DE EMERGÊNCIA PRONTA');}}
 ,{id:'dash',name:'PROPULSOR AUXILIAR',available:()=>!player.skills.dash,describe:()=>'ESPAÇO: avanço de 0,15 s a 3× velocidade. Recarga 4 s; não dá invulnerabilidade.',apply:()=>{player.skills.dash=1;player.dashCooldown=0;toast('PROPULSOR [ESPAÇO]');}}

];
function chooseSkill(id,version){
 if(!['upgrade','reward'].includes(state)||version!==offerVersion)return false;
 const skill=offeredSkills.find(s=>s.id===id);if(!skill)return false;
 const before=new Set(activeSynergies());skill.apply();upgradeFlash=1;
 for(const text of activeSynergies())if(!before.has(text))toast('SINERGIA: '+text,'#ffd27c');
 offerVersion++;state='playing';el('overlay').hidden=true;clearInput();updateHUD();return true;
}
let offeredSkills=[];
function upgrade(source='level'){
 offerSource=source;state=source==='boss'?'reward':'upgrade';clearInput();
 show(source==='boss'?'Chefe derrotado.':'Evolução disponível.',source==='boss'?'Recompensa de campo: +20 de integridade e escolha um módulo. Válido apenas nesta tentativa.':'Escolha um módulo. As skills desaparecem ao encerrar a tentativa.','');
 const candidates=SKILLS.filter(s=>!s.available||s.available());
 for(let i=candidates.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[candidates[i],candidates[j]]=[candidates[j],candidates[i]];}
 offeredSkills=candidates.slice(0,3);const version=++offerVersion;
 for(const skill of offeredSkills){const b=document.createElement('button'),strong=document.createElement('strong');strong.textContent=skill.name;b.append(strong,document.createTextNode(skill.describe()));b.onclick=()=>chooseSkill(skill.id,version);el('choices').append(b);}
 const skip=document.createElement('button');skip.textContent='PULAR MELHORIA';skip.onclick=()=>{if(version!==offerVersion||!['upgrade','reward'].includes(state))return;offerVersion++;clearInput();state='playing';el('overlay').hidden=true;updateHUD();};el('choices').append(skip);el('choices').children[0]?.focus();
}
function createEnemy(){const side=Math.floor(random(0,4));return {x:camera.x+(side===0?-40:side===1?width+40:random(0,width)),y:camera.y+(side===2?-40:side===3?height+40:random(0,height)),hp:30,maxHp:30,speed:random(HORDE.minSpeed,HORDE.maxSpeed),r:random(11,16),hit:0};}
function spawnBoss(){bossSpawned=true;boss={x:player.x,y:player.y-Math.min(height*.4,260),hp:650,maxHp:650,r:32,speed:28,phase:'approach',timer:2,turn:0,hit:0,dx:0,dy:1};toast('ALERTA: BRUTAMONTES','#ffb66c');}
function hurtPlayer(amount){
 if(player.inv>0||player.hp<=0||state!=='playing')return;
 if(player.skills.shield&&player.shieldReady){player.shieldReady=false;player.shieldTimer=12;player.inv=.25;toast('ESCUDO ABSORVEU O IMPACTO');return;}
 effects.push({x:player.x,y:player.y,r:42,life:.3,max:.3,color:'#ff9573'});
 player.hp=Math.max(0,player.hp-Math.max(1,amount-player.armor));player.inv=.65+player.skills.grace*.2;
 if(player.hp>0&&player.hp<=player.maxHp*.3&&player.skills.emergency&&!player.emergencyUsed){player.hp=Math.min(player.maxHp,player.hp+20);player.emergencyUsed=true;toast('RESERVA: +20 INTEGRIDADE','#ffd27c');}
 if(!player.hp){state='over';show('Fim da transmissão.','Sobreviveu '+Math.floor(clock)+' s · '+kills+' eliminações. Skills encerradas.','REPETIR CONFIGURAÇÃO');}
}
function targets(){return boss&&boss.hp>0?[...enemies,boss]:enemies;}
function damageEnemy(z,damage){
 if(z.hp<=0)return;
 if(z===boss)damage*=1+player.skills.bossHunter*.25;
 if(player.skills.finisher&&z.hp<=(z.maxHp||30)*.3)damage*=1.5;
 z.hp=Math.max(0,z.hp-damage);z.hit=.12;feedback.push({x:z.x,y:z.y-z.r-8,text:damage.toFixed(1),life:.6,color:'#ffffff'});
 for(let i=0;i<5;i++)sparks.push({x:z.x,y:z.y,vx:random(-90,90),vy:random(-90,90),life:.25});
 if(z.hp===0){effects.push({x:z.x,y:z.y,r:z.r+16,life:.3,max:.3,color:'#78978b'});if(z===boss){bossDefeated=true;bossReward=true;hostile=[];effects.push({x:z.x,y:z.y,r:100,life:.6,max:.6,color:'#ffd27c'});}else{kills++;gems.push({x:z.x,y:z.y});if(player.skills.salvage&&state==='playing')player.hp=Math.min(player.maxHp,player.hp+2);}}
}
function shockAt(z,damage,intrinsic=0){
 const count=Math.max(intrinsic,player.skills.shock?(player.skills.pierce?3:1):0);
 const near=targets().filter(t=>t!==z&&t.hp>0&&Math.hypot(t.x-z.x,t.y-z.y)<=135+player.skills.conductivity*40).sort((a,b)=>Math.hypot(a.x-z.x,a.y-z.y)-Math.hypot(b.x-z.x,b.y-z.y)).slice(0,count);
 for(const t of near){effects.push({x:z.x,y:z.y,x2:t.x,y2:t.y,life:.16,max:.16,color:'#8ceeff'});damageEnemy(t,damage*.35);if(player.skills.stun&&t.hp>0)t.stunTime=Math.max(t.stunTime||0,t===boss ? .0875 : .35);}
}
function applyStatus(z,b){
 if(z.hp<=0)return;
 if(player.skills.burn||runWeapon.burn){z.burnTime=3;z.burnDps=Math.max(z.burnDps||0,b.damage*.2);z.burnAccum=z.burnAccum||0;}
 if(player.skills.freeze||runWeapon.freeze)z.slowTime=2;
 const knock=(runWeapon.knock||0)+(player.skills.knock?30:0);
 if(knock){const d=Math.hypot(b.vx,b.vy)||1,amount=knock*(z===boss ? .25 : 1);z.x+=b.vx/d*amount;z.y+=b.vy/d*amount;}
}
function explodeAt(x,y,damage,radius,exclude=null){
 radius*=1+player.skills.blastRadius*.25;
 effects.push({x,y,r:radius,life:.25,max:.25,color:'#ffbf73'});
 for(const t of targets().filter(t=>t!==exclude&&t.hp>0&&Math.hypot(t.x-x,t.y-y)<=radius+t.r)){
  damageEnemy(t,damage);if(player.skills.shock&&t.hp>0)shockAt(t,damage);
 }
}
function impact(z,b){
 damageEnemy(z,b.damage);applyStatus(z,b);
 if(player.skills.shock||runWeapon.chain)shockAt(z,b.damage,runWeapon.chain||0);
 const radius=Math.max(runWeapon.explosion||0,player.skills.blast?64:0);
 if(radius)explodeAt(z.x,z.y,b.damage*(runWeapon.splash||.45),radius,z);
}
function emitProjectiles(angle){
 const w=runWeapon,count=w.pellets+player.skills.extra,spread=w.spread+(player.skills.extra ? .16 : 0);
 for(let i=0;i<count&&bullets.length<400;i++){
  const a=angle+(count===1?0:(i/(count-1)-.5)*spread),crit=Math.random()<player.skills.crit*.2,speed=w.speed||570,life=w.life*(1+player.skills.range*.25);
  bullets.push({x:player.x,y:player.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life,maxLife:life,damage:player.damage*(crit?2:1),crit,remaining:w.returning?999:1+(w.pierce||0)+(player.skills.pierce?2:0),hit:new Set(),returning:false,bounces:runWeapon.returning?0:player.skills.ricochet});
 }
}
function fireWeapon(){
 const angle=Math.atan2(aim.y+camera.y-player.y,aim.x+camera.x-player.x);emitProjectiles(angle);
 if(runWeapon.burst)for(let i=1;i<runWeapon.burst;i++)burstQueue.push({delay:i*.075});
 effects.push({x:player.x+Math.cos(angle)*24,y:player.y+Math.sin(angle)*24,r:14,life:.09,max:.09,color:runWeapon.burn?'#ffbf73':'#b6f3ff'});
 shot=player.rate;
}
function bounceProjectile(b,from){
 if(!(b.bounces>0))return false;
 const candidates=targets().filter(z=>z.hp>0&&!b.hit.has(z)&&Math.hypot(z.x-from.x,z.y-from.y)<=220);
 if(!candidates.length)return false;
 candidates.sort((a,z)=>Math.hypot(a.x-from.x,a.y-from.y)-Math.hypot(z.x-from.x,z.y-from.y));
 const target=candidates[0],d=Math.hypot(target.x-from.x,target.y-from.y)||1,speed=Math.hypot(b.vx,b.vy);
 b.x=from.x;b.y=from.y;b.vx=(target.x-from.x)/d*speed;b.vy=(target.y-from.y)/d*speed;b.bounces--;b.remaining=1;
 effects.push({x:from.x,y:from.y,x2:target.x,y2:target.y,life:.1,max:.1,color:'#c6baff'});return true;
}
function tickStatuses(dt){
 player.dashCooldown=Math.max(0,player.dashCooldown-dt);
 for(const z of targets()){
  if(z.hp<=0)continue;
  if(z.burnTime>0){const elapsed=Math.min(dt,z.burnTime);z.burnAccum=(z.burnAccum||0)+z.burnDps*elapsed*((player.skills.freeze||runWeapon.freeze)&&z.slowTime>0?1.5:1);z.burnTick=(z.burnTick||0)+elapsed;z.burnTime=Math.max(0,z.burnTime-dt);if(z.burnTick>=.5||z.burnTime===0){damageEnemy(z,z.burnAccum);z.burnAccum=0;z.burnTick=0;}if(z.burnTime===0)z.burnDps=0;}
  z.slowTime=Math.max(0,(z.slowTime||0)-dt);z.stunTime=Math.max(0,(z.stunTime||0)-dt);
 }
 if(player.skills.regen){player.regenTimer+=dt;while(player.regenTimer>=3){player.regenTimer-=3;player.hp=Math.min(player.maxHp,player.hp+1);}}
 if(player.skills.shield&&!player.shieldReady){player.shieldTimer=Math.max(0,player.shieldTimer-dt);if(!player.shieldTimer)player.shieldReady=true;}
}
function segmentDistance(x,y,ax,ay,bx,by){
 const dx=bx-ax,dy=by-ay,l=dx*dx+dy*dy,t=l?Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/l)):0;
 return Math.hypot(x-ax-t*dx,y-ay-t*dy);
}
function tickBoss(dt){
 if(!boss||boss.hp<=0)return;const b=boss;b.hit=Math.max(0,b.hit-dt);b.timer-=dt;
 if(b.phase==='approach'){
  const dx=player.x-b.x,dy=player.y-b.y,d=Math.hypot(dx,dy)||1;
  b.x+=dx/d*b.speed*(b.stunTime>0 ? 0 : b.slowTime>0 ? .55 : 1)*dt;b.y+=dy/d*b.speed*(b.stunTime>0 ? 0 : b.slowTime>0 ? .55 : 1)*dt;
  if(b.timer<=0){b.dx=dx/d;b.dy=dy/d;b.phase=b.turn++%2===0?'tellDash':'tellVolley';b.timer=.95;}
 }else if(b.phase==='tellDash'&&b.timer<=0){b.phase='dash';b.timer=.65;}
 else if(b.phase==='dash'){
  const x=b.x,y=b.y;b.x+=b.dx*360*(b.stunTime>0 ? 0 : b.slowTime>0 ? .55 : 1)*dt;b.y+=b.dy*360*(b.stunTime>0 ? 0 : b.slowTime>0 ? .55 : 1)*dt;
  if(segmentDistance(player.x,player.y,x,y,b.x,b.y)<b.r+14)hurtPlayer(20);
  if(b.timer<=0){b.phase='approach';b.timer=2;}
 }else if(b.phase==='tellVolley'&&b.timer<=0){
  const a=Math.atan2(b.dy,b.dx);
  for(let i=0;i<12;i++){const angle=a+i*Math.PI*2/12;hostile.push({x:b.x,y:b.y,vx:Math.cos(angle)*145,vy:Math.sin(angle)*145,life:4,r:7});}
  b.phase='approach';b.timer=2.5;
 }
 if(Math.hypot(player.x-b.x,player.y-b.y)<b.r+14)hurtPlayer(20);
}
function tick(dt){
 if(state!=='playing')return;
 clock+=dt;if(clock>=180){state='won';updateHUD();show('Protocolo concluído.','Sobreviveu por 3 minutos · '+kills+' eliminações. '+(bossDefeated?'Chefe derrotado.':'Chefe não derrotado.')+' Skills encerradas ao iniciar outra tentativa.','REPETIR CONFIGURAÇÃO');return;}
 player.inv=Math.max(0,player.inv-dt);tickStatuses(dt);
 const dx=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft')),dy=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup')),length=Math.hypot(dx,dy)||1;
 const dashDt=Math.min(dt,player.dashTime),normalDt=dt-dashDt;
 player.x+=dx/length*player.speed*normalDt+player.dashDx*player.speed*3*dashDt;player.y+=dy/length*player.speed*normalDt+player.dashDy*player.speed*3*dashDt;
 player.dashTime=Math.max(0,player.dashTime-dt);
 const moving=dx!==0||dy!==0||dashDt>0;player.stride+=(Number(moving)-player.stride)*(1-Math.exp(-14*dt));if(moving)player.walkPhase+=player.speed*dt*.055;
 syncCamera(dt);
 enemies=enemies.filter(z=>z.hp>0&&Math.abs(z.x-player.x)<width*2&&Math.abs(z.y-player.y)<height*2);
 spawn-=dt;if(spawn<=0&&enemies.length<HORDE.maxEnemies){spawn=Math.max(HORDE.minInterval,HORDE.interval-clock*HORDE.ramp);enemies.push(createEnemy());}
 if(clock>=60&&!bossSpawned)spawnBoss();
 if(firing){for(const queued of burstQueue){queued.delay-=dt;if(queued.delay<=0&&aim.active)emitProjectiles(Math.atan2(aim.y+camera.y-player.y,aim.x+camera.x-player.x));}burstQueue=burstQueue.filter(q=>q.delay>0);}else burstQueue=[];
 shot=Math.max(0,shot-dt);if(firing&&aim.active&&shot<=0&&bullets.length<400)fireWeapon();
 for(const b of bullets){
  const ax=b.x,ay=b.y;
  if(runWeapon.returning&&b.life<=b.maxLife/2){if(!b.returning){b.returning=true;b.hit.clear();}const d=Math.hypot(player.x-b.x,player.y-b.y)||1;b.vx=(player.x-b.x)/d*(runWeapon.speed||360);b.vy=(player.y-b.y)/d*(runWeapon.speed||360);if(d<16)b.life=0;}
  b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
  if(b.life<=0){if(runWeapon.detonate&&!b.detonated){b.detonated=true;explodeAt(b.x,b.y,b.damage,runWeapon.explosion);}continue;}
  const hit=targets().filter(z=>z.hp>0&&!b.hit.has(z)&&segmentDistance(z.x,z.y,ax,ay,b.x,b.y)<z.r+(runWeapon.radius||6)).sort((a,z)=>Math.hypot(a.x-ax,a.y-ay)-Math.hypot(z.x-ax,z.y-ay));
  for(const z of hit){if(b.remaining<=0)break;if(z.hp<=0)continue;b.hit.add(z);impact(z,b);b.remaining--;if(!b.remaining){if(bounceProjectile(b,z))break;b.life=0;}}
 }
 bullets=bullets.filter(b=>b.life>0);
 for(const z of enemies){if(z.hp<=0)continue;z.hit=Math.max(0,z.hit-dt);const d=Math.hypot(player.x-z.x,player.y-z.y)||1;z.x+=(player.x-z.x)/d*z.speed*(z.stunTime>0 ? 0 : z.slowTime>0 ? .55 : 1)*dt;z.y+=(player.y-z.y)/d*z.speed*(z.stunTime>0 ? 0 : z.slowTime>0 ? .55 : 1)*dt;if(d<z.r+14)hurtPlayer(12);}
 tickBoss(dt);
 for(const b of hostile){const ax=b.x,ay=b.y;b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;if(segmentDistance(player.x,player.y,ax,ay,b.x,b.y)<b.r+14){hurtPlayer(12);b.life=0;}}
 hostile=hostile.filter(b=>b.life>0);
 for(const g of gems){const d=Math.hypot(g.x-player.x,g.y-player.y);if(d<player.magnet){g.x+=(player.x-g.x)*Math.min(1,dt*9);g.y+=(player.y-g.y)*Math.min(1,dt*9);}if(d<18){g.collected=true;xp+=1+player.skills.xp*.25;}}
 gems=gems.filter(g=>!g.collected);
 for(const p of sparks){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;}sparks=sparks.filter(p=>p.life>0).slice(-600);
 for(const f of feedback){f.y-=28*dt;f.life-=dt;}feedback=feedback.filter(f=>f.life>0).slice(-100);
 for(const e of effects)e.life-=dt;effects=effects.filter(e=>e.life>0).slice(-150);upgradeFlash=Math.max(0,upgradeFlash-dt);
 if(state==='playing'){
  if(bossReward){bossReward=false;player.hp=Math.min(player.maxHp,player.hp+20);upgrade('boss');}
  else if(xp>=need){xp-=need;level++;need=Math.ceil(need*1.4);upgrade();}
 }
 updateHUD();
}
function drawRobot(){
 if(runRobot?.id==='bastion'){
  ctx.save();ctx.translate(player.x,player.y);if(player.inv>0)ctx.globalAlpha=.6;
  if(robotSprite&&robotSprite.complete&&robotSprite.naturalWidth>0){const frame=player.stride>.1?Math.floor(player.walkPhase*1.4)%4:0;ctx.imageSmoothingEnabled=false;ctx.drawImage(robotSprite,frame*64,0,64,80,-32,-44,64,80);}
  else{ctx.fillStyle='#4f6b7a';ctx.fillRect(-26,-20,52,40);ctx.fillStyle='#e8ddc9';ctx.fillRect(-31,-18,14,18);ctx.fillRect(17,-18,14,18);ctx.fillRect(-20,22,15,12);ctx.fillRect(5,22,15,12);ctx.fillStyle='#3cc7f4';ctx.fillRect(-10,-10,20,5);ctx.fillRect(-6,5,12,8);}
  ctx.restore();return;
 }
 ctx.save();ctx.translate(player.x,player.y);if(player.inv>0)ctx.globalAlpha=.5+Math.sin(player.inv*40)*.3;
 // Heavy humanoid with opposing arms and articulated legs.
const stride=player.stride||0,phase=player.walkPhase||0;
const step=Math.sin(phase)*stride,bob=Math.abs(Math.cos(phase))*stride*1.8;
ctx.fillStyle='#040b15';ctx.beginPath();ctx.ellipse(0,23,21,6,0,0,Math.PI*2);ctx.fill();
ctx.save();ctx.translate(0,-bob);
for(const side of [-1,1]){
 ctx.save();ctx.translate(side*8,10);ctx.rotate(step*side*.26);
 ctx.fillStyle='#162c44';ctx.fillRect(-5,-3,10,10);
 ctx.fillStyle='#abc3db';ctx.fillRect(-5,3,10,10);
 ctx.fillStyle='#3d7fba';ctx.fillRect(-5,10,10,6);
 ctx.fillStyle='#253e58';ctx.fillRect(-4,16,8,6);
 ctx.fillStyle='#c2d8eb';ctx.fillRect(-6,21,12,6);
 ctx.fillStyle='#0b1b2d';ctx.fillRect(-6,26,12,3);ctx.restore();
}
ctx.fillStyle='#152e4b';ctx.fillRect(-11,3,22,8);
ctx.fillStyle='#bdd3e6';ctx.beginPath();ctx.moveTo(-16,-16);ctx.lineTo(16,-16);ctx.lineTo(12,3);ctx.lineTo(-12,3);ctx.closePath();ctx.fill();
ctx.fillStyle='#2c6ea7';ctx.fillRect(-12,-13,24,7);
ctx.fillStyle='#102945';ctx.fillRect(-6,-8,12,11);
ctx.fillStyle='#71e7ff';ctx.beginPath();ctx.arc(0,-3,4,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#e6f6ff';ctx.fillRect(-2,-5,3,3);
for(const side of [-1,1]){
 ctx.save();ctx.translate(side*18,-11);ctx.rotate(-step*side*.28);
 ctx.fillStyle='#416c94';ctx.fillRect(-6,-7,12,12);
 ctx.fillStyle='#d1e3f3';ctx.fillRect(-6,-7,12,5);
 ctx.fillStyle='#192d42';ctx.fillRect(-3,5,6,6);
 ctx.fillStyle='#8daac4';ctx.fillRect(-5,9,10,10);
 ctx.fillStyle='#274969';ctx.fillRect(-5,16,10,6);ctx.restore();
}
ctx.fillStyle='#162c44';ctx.fillRect(-4,-21,8,6);
ctx.fillStyle='#d3e5f2';ctx.fillRect(-8,-31,16,12);
ctx.fillStyle='#3f7199';ctx.fillRect(-10,-28,3,8);ctx.fillRect(7,-28,3,8);
ctx.fillStyle='#0a223c';ctx.fillRect(-6,-27,12,5);
ctx.fillStyle='#77eaff';ctx.fillRect(-5,-26,10,2);
ctx.fillStyle='#386a94';ctx.fillRect(-4,-20,8,3);
ctx.restore();

 ctx.restore();
}
// Deterministic world decoration: rendering never consumes combat randomness.
function terrainNoise(x,y,salt=0){let n=Math.imul(x,374761393)^Math.imul(y,668265263)^salt;n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296;}
function drawArena(){
 const size=160,left=Math.floor(camera.x/size),top=Math.floor(camera.y/size);
 for(let iy=top;iy<=Math.floor((camera.y+height)/size);iy++)for(let ix=left;ix<=Math.floor((camera.x+width)/size);ix++){
  const x=ix*size,y=iy*size,n=terrainNoise(ix,iy);
  ctx.fillStyle=n>.5?'#111f2a':'#13222d';ctx.fillRect(x,y,size,size);
  ctx.strokeStyle='#1a2b36';ctx.lineWidth=2;ctx.strokeRect(x+2,y+2,size-4,size-4);
  for(let j=0;j<9;j++){const px=x+8+terrainNoise(ix,iy,j+1)*144,py=y+8+terrainNoise(ix,iy,j+31)*144;ctx.fillStyle=j%2?'#20313a':'#0c1923';ctx.fillRect(Math.floor(px),Math.floor(py),2+j%3,2);}
  if(n<.22){ctx.strokeStyle='#09151f';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+25,y+45);ctx.lineTo(x+57,y+63);ctx.lineTo(x+49,y+81);ctx.lineTo(x+81,y+96);ctx.stroke();}
  if(n>.84){ctx.fillStyle='#0a151e';ctx.fillRect(x+100,y+22,32,19);ctx.fillStyle='#2b3b42';for(let k=0;k<5;k++)ctx.fillRect(x+102+k*6,y+24,2,15);}
  if(n>.45&&n<.52){ctx.fillStyle='#3d4236';for(let k=0;k<4;k++)ctx.fillRect(x+17+k*11,y+126,6,4);}
 }
 // Sparse pools of blue light, anchored in world coordinates.
 if(typeof ctx.createRadialGradient==='function'){
  const light=ctx.createRadialGradient(player.x,player.y,20,player.x,player.y,260);
  if(light&&light.addColorStop){light.addColorStop(0,'rgba(60,199,244,.075)');light.addColorStop(1,'rgba(60,199,244,0)');ctx.fillStyle=light;ctx.fillRect(player.x-260,player.y-260,520,520);}
 }
}
function draw(){
 ctx.fillStyle='#0b1728';ctx.fillRect(0,0,width,height);if(!player)return;
 ctx.save();ctx.translate(-camera.x,-camera.y);drawArena();
 for(const g of gems){
  ctx.fillStyle='rgba(60,199,244,.10)';ctx.beginPath();ctx.arc(g.x,g.y,11,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#163b51';ctx.fillRect(g.x-5,g.y-5,10,10);ctx.fillStyle='#3cc7f4';ctx.fillRect(g.x-3,g.y-4,6,8);ctx.fillStyle='#d6f9ff';ctx.fillRect(g.x-2,g.y-3,2,3);
 }
 for(const z of enemies){if(z.hp<=0)continue;ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(z.x,z.y+z.r*.7,z.r+3,5,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=z.hit>0?'#e7f5ff':'#647d42';ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,Math.PI*2);ctx.fill();ctx.fillStyle='#bfdf86';ctx.fillRect(z.x-6,z.y-4,4,3);ctx.fillRect(z.x+3,z.y-4,4,3);if(z.slowTime>0){ctx.strokeStyle='#9cecff';ctx.lineWidth=2;ctx.strokeRect(z.x-z.r-2,z.y-z.r-2,z.r*2+4,z.r*2+4);}if(z.burnTime>0){ctx.fillStyle='#ff934d';ctx.fillRect(z.x-z.r,z.y+z.r-3,5,6);ctx.fillRect(z.x+z.r-4,z.y-4,4,7);}}
 if(boss&&boss.hp>0){
  const b=boss;
  if(b.phase==='tellDash'){
   ctx.save();ctx.translate(b.x,b.y);ctx.rotate(Math.atan2(b.dy,b.dx));ctx.fillStyle='rgba(255,150,60,.27)';ctx.fillRect(0,-46,360*.65,92);ctx.strokeStyle='#ffb66c';ctx.strokeRect(0,-46,360*.65,92);ctx.restore();
  }else if(b.phase==='tellVolley'){
   ctx.strokeStyle='#ffb66c';ctx.lineWidth=3;ctx.beginPath();ctx.arc(b.x,b.y,65,0,Math.PI*2);ctx.stroke();
   for(let i=0;i<12;i++){const a=Math.atan2(b.dy,b.dx)+i*Math.PI*2/12;ctx.fillStyle='#ffb66c';ctx.beginPath();ctx.arc(b.x+Math.cos(a)*65,b.y+Math.sin(a)*65,4,0,Math.PI*2);ctx.fill();}
  }
  ctx.fillStyle=b.hit>0?'#ffffff':'#946e4f';ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();ctx.fillStyle='#314026';ctx.fillRect(b.x-35,b.y-13,14,27);ctx.fillRect(b.x+21,b.y-13,14,27);ctx.fillStyle='#ffba74';ctx.fillRect(b.x-14,b.y-12,9,5);ctx.fillRect(b.x+5,b.y-12,9,5);
 }
 for(const b of bullets){ctx.fillStyle=(runWeapon.burn||runWeapon.explosion||player.skills.blast)?'#ffbf73':player.skills.shock?'#8ceeff':'#89ddff';ctx.beginPath();ctx.arc(b.x,b.y,runWeapon.radius||6,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffffff';ctx.fillRect(b.x-2,b.y-2,4,4);if(runWeapon.returning){ctx.strokeStyle='#bceeff';ctx.beginPath();ctx.arc(b.x,b.y,10,clock*10,clock*10+Math.PI);ctx.stroke();}if(runWeapon.id==='laser'){ctx.strokeStyle='#a6f3ff';ctx.beginPath();ctx.moveTo(b.x-b.vx*.025,b.y-b.vy*.025);ctx.lineTo(b.x,b.y);ctx.stroke();}}
 for(const b of hostile){ctx.fillStyle='#ff9b6c';ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();}
 for(const e of effects){ctx.globalAlpha=e.life/e.max;ctx.strokeStyle=e.color;ctx.lineWidth=3;ctx.beginPath();if(e.x2!==undefined){ctx.moveTo(e.x,e.y);ctx.lineTo(e.x2,e.y2);}else ctx.arc(e.x,e.y,e.r*(1-e.life/e.max),0,Math.PI*2);ctx.stroke();}ctx.globalAlpha=1;
 for(const p of sparks){ctx.globalAlpha=Math.max(0,p.life/.25);ctx.strokeStyle='#b7eaff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-p.vx*.035,p.y-p.vy*.035);ctx.stroke();}ctx.globalAlpha=1;
 drawRobot();if(player.shieldReady){ctx.strokeStyle='#80e3ff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(player.x,player.y,38,0,Math.PI*2);ctx.stroke();}
 for(const f of feedback){ctx.globalAlpha=Math.min(1,f.life*3);ctx.fillStyle=f.color;ctx.font='bold 14px monospace';ctx.textAlign='center';ctx.fillStyle='#08121c';ctx.fillText(f.text,f.x+1,f.y+2);ctx.fillStyle=f.color;ctx.fillText(f.text,f.x,f.y);}ctx.globalAlpha=1;ctx.restore();
 if(typeof ctx.createRadialGradient==='function'){const shade=ctx.createRadialGradient(width/2,height/2,Math.min(width,height)*.24,width/2,height/2,Math.max(width,height)*.68);if(shade&&shade.addColorStop){shade.addColorStop(0,'rgba(3,9,17,0)');shade.addColorStop(1,'rgba(3,9,17,.48)');ctx.fillStyle=shade;ctx.fillRect(0,0,width,height);}}
 if(upgradeFlash>0){ctx.strokeStyle='rgba(93,187,255,'+upgradeFlash*.7+')';ctx.lineWidth=6;ctx.strokeRect(3,3,width-6,height-6);}
 if(aim.active&&state==='playing'){ctx.strokeStyle='#89ddff';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(aim.x,aim.y,7,0,Math.PI*2);ctx.moveTo(aim.x-12,aim.y);ctx.lineTo(aim.x+12,aim.y);ctx.moveTo(aim.x,aim.y-12);ctx.lineTo(aim.x,aim.y+12);ctx.stroke();}
}
function frame(now){const dt=Math.min((now-last)/1000,.04);last=now;if(state==='playing')tick(dt);if(state!=='garage')draw();requestAnimationFrame(frame);}
renderLoadout();requestAnimationFrame(frame);

