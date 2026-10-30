const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const listeners = new Map();
function surface(name) { return {style:{},focus(){},setAttribute(key,value){this[key]=value;},children:[],hidden:false,textContent:'',addEventListener(type,fn){listeners.set(name+':'+type,fn);},append(...items){this.children.push(...items);},replaceChildren(){this.children=[];}}; }
const elements = new Map();
const canvas = surface('canvas');
canvas.getBoundingClientRect=()=>({left:100,top:50,width:1000,height:600});
canvas.getContext=()=>new Proxy({}, {get:()=>()=>{}});
canvas.setPointerCapture=()=>{};
const window = surface('window');
const document = Object.assign(surface('document'), {hidden:false,querySelector:()=>canvas,getElementById(id){if(!elements.has(id))elements.set(id,surface(id));return elements.get(id);},createElement:()=>surface('button'),createTextNode:t=>t});
const context=vm.createContext({window,document,devicePixelRatio:2,requestAnimationFrame:()=>{},Math,Set});
vm.runInContext(fs.readFileSync('game.js','utf8'),context);
const run=code=>vm.runInContext(code,context);
const fire=(type,props={})=>listeners.get(type)({pointerType:'mouse',button:0,pointerId:1,clientX:900,clientY:350,...props});
run('reset();spawn=100;tick(.01)');
assert.equal(run('bullets.length'),0,'no automatic shot');
fire('canvas:pointermove');
assert.equal(run('aim.x'),800,'pointer accounts for canvas offset');
assert.equal(run('player.x'),500,'aim does not move player');
fire('canvas:pointerdown');run('tick(.01)');
assert.equal(run('bullets.length'),1,'shoots without an enemy');
assert.ok(run('bullets[0].vx>0&&Math.abs(bullets[0].vy)<.001'),'shoots toward cursor');
run('tick(.1)');assert.equal(run('bullets.length'),1,'respects fire rate');
fire('window:pointerup');run('tick(.4)');assert.equal(run('bullets.length'),1,'release stops shooting');
fire('canvas:pointerdown');run('pause();pause();tick(.01)');assert.equal(run('firing'),false,'resume requires a new press');
fire('canvas:pointerdown');fire('canvas:pointercancel');assert.equal(run('firing'),false);
fire('canvas:pointerdown',{button:2});assert.equal(run('firing'),false,'right click ignored');
fire('canvas:pointerdown',{pointerType:'touch'});assert.equal(run('firing'),false,'touch does not enable automatic combat');
run("keys.add('d');keys.add('s');const before={x:player.x,y:player.y};tick(.1);globalThis.distance=Math.hypot(player.x-before.x,player.y-before.y)");
assert.ok(Math.abs(run('distance')-19)<.001,'diagonal movement normalized');
fire('canvas:pointerdown');fire('window:blur');assert.equal(run('state'),'paused');assert.equal(run('firing'),false);assert.equal(run('keys.size'),0);
run('reset();spawn=100;xp=need;tick(.01)');assert.equal(run('state'),'upgrade');assert.equal(run('firing'),false);elements.get('choices').children[0].onclick();assert.equal(run('state'),'playing');
run('reset();clock=179.99;tick(.02)');assert.equal(run('state'),'playing','does not end at three minutes');
run('reset();clock=599.99;tick(.02)');assert.equal(run('state'),'won');
run('reset();player.hp=1;enemies=[{x:player.x,y:player.y,hp:100,speed:0,r:15}];spawn=100;tick(.01)');assert.equal(run('state'),'over');
run('reset();draw()');assert.equal(run('player.hp'),100);assert.equal(run('bullets.length'),0);
console.log('Combat checks passed: manual aim/fire, cooldown, release, interruptions, movement, upgrades, win/death/restart.');

run('reset();player.hp=80;updateHUD()');
assert.equal((elements.get('health').innerHTML.match(/battery--broken/g)||[]).length,1,'one depleted battery');
run('player.hp=0;updateHUD()');
assert.equal((elements.get('health').innerHTML.match(/battery--broken/g)||[]).length,5,'all batteries depleted');
assert.equal(elements.get('health')['aria-valuenow'],'0');
run('player.hp=35;updateHUD()');
assert.equal((elements.get('health').innerHTML.match(/battery--broken/g)||[]).length,3,'healing restores batteries');
assert.ok(elements.get('health').innerHTML.includes('height="16.5"'),'partial charge accurately represents remaining health');
run('reset()');assert.equal((elements.get('health').innerHTML.match(/battery--broken/g)||[]).length,0,'restart restores all batteries');
run('tick(1)');assert.equal(run('enemies.length'),0,'initial breathing room');
run('tick(1.01)');assert.equal(run('enemies.length'),1);
assert.ok(run('enemies[0].speed<43'),'slower starting zombies');
run('tick(.8)');assert.equal(run('enemies.length'),1,'no immediate second zombie');
run('tick(.81)');assert.equal(run('enemies.length'),2);
run('reset();enemies=Array.from({length:70},()=>({x:-100,y:-100,hp:100,speed:0,r:12}));spawn=0;tick(.01)');
assert.equal(run('enemies.length'),70,'population cap');
console.log('Battery damage/healing/reset and slower horde checks passed.');

run("reset();SKILLS.find(s=>s.id==='damage').apply();SKILLS.find(s=>s.id==='damage').apply()");
assert.ok(Math.abs(run('player.damage')-44)<1e-9,'damage doubles once; duplicates are ignored');
run("player.x=-1200;player.y=1800;syncCamera();aim={x:800,y:300,active:true};firing=true;spawn=100;tick(.01)");
assert.ok(run('bullets[0].vx>0&&Math.abs(bullets[0].vy)<.001'),'world-space aim after camera movement');
assert.equal(run('player.x-camera.x'),500);
assert.equal(run('player.y-camera.y'),300);
run("keys.add('a');keys.add('w');tick(10)");
assert.ok(run('player.x<-1200&&player.y<1800'),'movement has no arena clamp');
run("clock=0;globalThis.earlyEnemy=createEnemy();clock=170;globalThis.lateEnemy=createEnemy()");
assert.equal(run('earlyEnemy.hp'),30);assert.equal(run('lateEnemy.hp'),30);
assert.ok(run('lateEnemy.speed>=24&&lateEnemy.speed<=42'),'no time-based speed growth');
assert.ok(run('lateEnemy.x>=camera.x-40&&lateEnemy.x<=camera.x+width+40'));
run("reset();SKILLS.find(s=>s.id==='damage').apply();SKILLS.find(s=>s.id==='damage').apply();spawn=100;aim={x:800,y:300,active:true};firing=true;enemies=[{x:player.x+50,y:player.y,hp:30,speed:0,r:16}];tick(.06)");
assert.equal(run('kills'),1,'44 damage kills a 30 HP zombie in one hit');
assert.ok(run('feedback.length>0'),'damage feedback created');
run("reset();player.x=2000;player.y=-3000;syncCamera();draw()");
console.log('World camera, unbounded movement, multiplicative damage, fixed enemy stats and hit feedback passed.');

run("reset();spawn=100;keys.add('d');tick(.1)");
assert.ok(run('player.x-camera.x>500'),'player can leave screen center');
assert.equal(run('camera.x'),0,'dead zone avoids camera movement for small steps');
assert.ok(run('player.stride>0&&player.walkPhase>0'),'walking animation advances');
run("tick(.5)");
assert.ok(run('camera.x>0&&camera.x<player.x-500'),'camera follows with lag');
run("keys.clear();globalThis.oldStride=player.stride;tick(.2)");
assert.ok(run('player.stride<oldStride'),'animation settles when movement stops');
run("draw();reset();keys.add('a');keys.add('w');spawn=100;tick(1);draw()");
assert.ok(run('camera.x<0&&camera.y<0'),'camera follows in opposite directions');
console.log('Camera dead zone, smooth follow and walking transitions passed.');

run("openGarage();selectWeapon('shotgun');reset()");
assert.equal(run('runWeapon.id'),'shotgun');
assert.equal(elements.get('garage').hidden,true);assert.equal(elements.get('combat').hidden,false);
assert.equal(run("selectWeapon('machine')"),false,'equipment cannot change in combat');
run("spawn=100;aim={x:800,y:300,active:true};firing=true;tick(.01)");
assert.equal(run('bullets.length'),5,'shotgun fires five pellets');
assert.equal(run('bullets[0].damage'),12);assert.ok(run('bullets[0].vy<0&&bullets[4].vy>0'),'spread');
run("upgrade();globalThis.offer=offerVersion;globalThis.chosen=offeredSkills[0].id");
assert.equal(run('chooseSkill(chosen,offer)'),true);assert.equal(run('chooseSkill(chosen,offer)'),false,'stale choice cannot be applied twice');
run("openGarage();selectWeapon('machine');reset()");
assert.equal(run('player.skills.pierce+player.skills.blast+player.skills.shock'),0,'skills reset between attempts');
assert.equal(run('player.damageStacks'),0);
run("SKILLS.find(s=>s.id==='pierce').apply();SKILLS.find(s=>s.id==='blast').apply();SKILLS.find(s=>s.id==='shock').apply()");
assert.equal(run('activeSynergies().length'),3);
run("spawn=100;enemies=[{x:550,y:300,hp:100,speed:0,r:14,hit:0},{x:580,y:300,hp:100,speed:0,r:14,hit:0},{x:610,y:300,hp:100,speed:0,r:14,hit:0}];aim={x:800,y:300,active:true};firing=true;tick(.04);firing=false;tick(.12)");
assert.ok(run('enemies[0].hp<100&&enemies[1].hp<100&&enemies[2].hp<100'),'synergies damage multiple targets');
assert.ok(run('effects.length>0'),'synergy VFX');
run("reset();clock=59.98;spawn=100;tick(.04)");
assert.equal(run('bossSpawned'),true);assert.equal(run('boss.hp'),650);assert.equal(run('bossDefeated'),false);
run("boss.timer=0;tickBoss(.01)");
assert.equal(run('boss.phase'),'tellDash');assert.ok(run('boss.timer>.9'),'dash has warning');
run("boss.timer=0;tickBoss(.01)");assert.equal(run('boss.phase'),'dash');
run("boss.phase='approach';boss.turn=1;boss.timer=0;tickBoss(.01)");assert.equal(run('boss.phase'),'tellVolley');assert.equal(run('hostile.length'),0);
run("boss.timer=0;tickBoss(.01)");assert.equal(run('hostile.length'),12,'volley only after warning');
run("boss.x=player.x+300;boss.y=player.y;player.hp=50;damageEnemy(boss,10000);tick(.01)");
assert.equal(run('bossDefeated'),true);assert.equal(run('state'),'reward');assert.equal(run('player.hp'),70);assert.equal(run('hostile.length'),0);
assert.equal(run('bossReward'),false,'reward delivered once');
run("globalThis.rewardVersion=offerVersion;globalThis.rewardId=offeredSkills[0].id;chooseSkill(rewardId,rewardVersion);tick(.01)");
assert.equal(run('state'),'playing');
run("pause();globalThis.frozenTime=clock;tick(1)");assert.equal(run('clock'),run('frozenTime'),'pause freezes simulation');
run("openGarage();selectWeapon('shotgun');reset()");assert.equal(run('bossSpawned'),false);assert.equal(run('bossDefeated'),false);assert.equal(run('runWeapon.id'),'shotgun');assert.equal(run('player.hp'),100);
console.log('Garage, fixed loadout, shotgun, stale offers, skills/synergies, boss telegraphs and one-time rewards passed.');

run("openGarage();selectWeapon('machine');reset();player.inv=100000");
for(let i=0;i<15100;i++){
 if(run('state')==='playing'){
  run("{aim={x:width/2+100,y:height/2,active:true};const ts=targets().filter(t=>t.hp>0);if(ts.length){const t=ts.reduce((a,b)=>Math.hypot(a.x-player.x,a.y-player.y)<Math.hypot(b.x-player.x,b.y-player.y)?a:b);aim.x=t.x-camera.x;aim.y=t.y-camera.y;}firing=true;tick(.04);draw()}");
 }else if(['upgrade','reward'].includes(run('state'))){run("chooseSkill(offeredSkills[0].id,offerVersion)");}
 else break;
}
assert.equal(run('state'),'won','complete ten-minute integration simulation');
assert.ok(run('bossSpawned'),'boss appeared during simulation');
assert.ok(run('enemies.length<=70&&bullets.length<=405&&feedback.length<=100'),'entity bounds');
run("openGarage()");assert.equal(elements.get('garage').hidden,false);assert.equal(elements.get('combat').hidden,true);
console.log('Full ten-minute combat/upgrade/boss integration simulation passed.');

const fresh=(weapon='machine')=>run(`openGarage();selectRobot('prot');selectWeapon('${weapon}');reset();spawn=10000;aim={x:800,y:300,active:true}`);
const acquire=id=>run(`SKILLS.find(s=>s.id==='${id}').apply()`);
assert.equal(run('SKILLS.length'),36);
assert.equal(run('new Set(SKILLS.map(s=>s.id)).size'),36);
fresh();assert.equal(run('availableSkills().length'),9,'only roots offered initially');
for(const root of run('SKILLS.filter(s=>!s.parent).map(s=>s.id)')){
 fresh();assert.equal(run(`SKILLS.filter(s=>s.parent==='${root}').length`),3,'each root opens three children');
 assert.equal(run(`availableSkills().some(s=>s.parent==='${root}')`),false);
 run(`state='upgrade';offeredSkills=[SKILLS.find(s=>s.id==='${root}')];offerVersion++;chooseSkill('${root}',offerVersion)`);
 assert.equal(run(`availableSkills().filter(s=>s.parent==='${root}').length`),3);
 assert.equal(run(`availableSkills().some(s=>s.id==='${root}')`),false,'selected node removed');
 const child=run(`availableSkills().find(s=>s.parent==='${root}').id`);
 run(`state='upgrade';offeredSkills=[SKILLS.find(s=>s.id==='${child}')];offerVersion++;chooseSkill('${child}',offerVersion)`);
 assert.equal(run(`availableSkills().some(s=>s.id==='${child}')`),false);
 assert.equal(run(`availableSkills().filter(s=>s.parent==='${root}').length`),2,'sibling branches remain combinable');
}
fresh();run("state='upgrade';offeredSkills=[SKILLS.find(s=>s.id==='titan')];offerVersion++");
assert.equal(run("chooseSkill('titan',offerVersion)"),false,'locked child rejected even with forged offer');
fresh();acquire('damage');assert.equal(run('player.damage'),44);assert.ok(Math.abs(run('player.rate')-.48)<1e-9);assert.equal(acquire('damage'),false);
acquire('rate');assert.ok(Math.abs(run('player.damage')-44/1.5)<1e-9);assert.ok(Math.abs(run('player.rate')-.48/3)<1e-9);
fresh();acquire('armor');acquire('titan');assert.equal(run('player.maxHp'),300);assert.equal(run('player.hp'),300);assert.ok(Math.abs(run('player.speed')-190/1.25/1.5)<1e-9);assert.ok(Math.abs(run('reloadDuration()')-2.1)<1e-9);
run('updateHUD()');assert.equal((elements.get('health').innerHTML.match(/battery-shell/g)||[]).length,15,'triple life renders 15 batteries');
fresh();acquire('armor');acquire('salvage');run('player.hp=40');
for(let i=0;i<19;i++)run('damageEnemy({x:700,y:300,hp:1,r:10},1)');assert.equal(run('player.hp'),40);
run('damageEnemy({x:700,y:300,hp:1,r:10},1)');assert.equal(run('player.hp'),60,'one battery per 20 kills');
run('damageEnemy({x:700,y:300,hp:1,r:10},1)');assert.equal(run('player.hp'),60);
fresh();acquire('magnet');acquire('killAmmo');assert.equal(run('magazineSize()'),72);assert.equal(run('player.ammo'),24,'capacity does not create free ammo');
for(let i=0;i<10;i++)run('damageEnemy({x:700,y:300,hp:1,r:10},1)');assert.equal(run('player.ammo'),25);
fresh();acquire('armor');acquire('regen');run('player.hp=40;tick(3)');assert.equal(run('player.hp'),40);run('tick(.5)');assert.equal(run('player.hp'),41);run("keys.add('d');tick(.5)");assert.equal(run('player.hp'),41);
fresh();acquire('magnet');acquire('repair');run('player.hp=50');assert.equal(run('startReload()'),false,'full clip cannot farm healing');
run('fireWeapon();startReload();tickStatuses(reloadDuration())');assert.equal(run('player.hp'),55);assert.equal(run('player.ammo'),24);
fresh();acquire('freeze');acquire('coldReload');run('fireWeapon();enemies=[{x:player.x+50,y:player.y,hp:30,r:12,speed:30}];startReload();tickStatuses(.01)');assert.equal(run('enemies[0].slowTime||0'),0);
run('tickStatuses(player.reloadTime-.01)');assert.equal(run('enemies[0].slowTime||0'),0);run('tickStatuses(.01)');assert.ok(run('enemies[0].slowTime')>3.9,'cold pulse occurs at reload completion');
// Each weapon consumes rounds per pulse, not per pellet, and cannot fire during reload.
for(const id of run('Object.keys(WEAPONS)')){
 fresh(id);const cap=run('magazineSize()'),duration=run('reloadDuration()');
 run('emitProjectiles(0)');assert.equal(run('player.ammo'),cap-1,id+' consumes exactly one round');
 assert.equal(run('bullets.length'),run('runWeapon.pellets'));
 run('player.ammo=1;player.reloadTime=0;emitProjectiles(0)');assert.equal(run('player.ammo'),0);assert.equal(run('player.reloadTime'),duration);
 const count=run('bullets.length');run('fireWeapon()');assert.equal(run('bullets.length'),count,'reload blocks shots');
 run('pause();globalThis.freezeReload=player.reloadTime;tick(10)');assert.equal(run('player.reloadTime'),run('freezeReload'),'pause freezes reload');run('pause()');
 run('tickStatuses(player.reloadTime/2)');assert.equal(run('player.ammo'),0,'no premature refill');run('tickStatuses(player.reloadTime)');assert.equal(run('player.ammo'),cap);
 run('draw()');
}
assert.ok(run('AMMO.rocket[1]>AMMO.sniper[1]&&AMMO.sniper[1]>AMMO.machine[1]'),'heavy reloads longer');
fresh('burst');run('player.ammo=2;firing=true;fireWeapon();tick(.08)');assert.equal(run('bullets.length'),2);assert.equal(run('player.ammo'),0);assert.ok(run('player.reloadTime')>0);assert.equal(run('burstQueue.length'),0,'partial burst ends at empty clip');run('tick(.08)');assert.equal(run('bullets.length'),2);
fresh('shotgun');acquire('rate');acquire('extra');run('fireWeapon()');assert.equal(run('bullets.length'),10);assert.equal(run('player.ammo'),5,'multishot spends one shell');
fresh();acquire('damage');acquire('crit');run('for(let i=0;i<5;i++)emitProjectiles(0)');assert.equal(run('bullets[3].damage'),44);assert.equal(run('bullets[4].damage'),132);
fresh();acquire('damage');acquire('bossHunter');run('spawnBoss();damageEnemy(boss,10)');assert.equal(run('boss.hp'),620);
fresh();acquire('damage');acquire('finisher');run('globalThis.target={x:700,y:300,hp:10,maxHp:30,r:10};damageEnemy(target,2)');assert.equal(run('target.hp'),4);
fresh();acquire('burn');acquire('freeze');acquire('thermal');acquire('ignition');acquire('afterburn');run('enemies=[{x:700,y:300,hp:10000,maxHp:10000,r:10,speed:0}];applyStatus(enemies[0],{damage:20,vx:1,vy:0});tickStatuses(.5)');assert.equal(run('enemies[0].hp'),9955);assert.equal(run('enemies[0].burnTime'),8.5);
for(const id of ['emergency','retaliation','overload']){
 fresh();acquire(id==='emergency'?'dash':'blast');acquire(id);run('hurtPlayer(1)');assert.equal(run(`player.hitCooldowns.${id}`),120);
 run(`player.inv=0;hurtPlayer(1)`);assert.equal(run(`player.hitCooldowns.${id}`),120,'second hit cannot reset cooldown');
 run(`pause();tick(20)`);assert.equal(run(`player.hitCooldowns.${id}`),120,'pause freezes trigger cooldown');run('pause();tickStatuses(119.9)');assert.ok(run(`player.hitCooldowns.${id}`)>.09);run('tickStatuses(.1);player.inv=0;hurtPlayer(1)');assert.equal(run(`player.hitCooldowns.${id}`),120,'trigger rearmed after two minutes');
 fresh();acquire(id);run('player.hp=1;hurtPlayer(1000)');assert.equal(run('state'),'over');assert.equal(run(`player.hitCooldowns.${id}`),0,'lethal hit cannot trigger or resurrect');
}
fresh();acquire('shock');acquire('shield');run('hurtPlayer(100)');assert.equal(run('player.hp'),100);assert.equal(run('player.shieldTimer'),120);run('tickStatuses(119)');assert.equal(run('player.shieldReady'),false);run('tickStatuses(1)');assert.equal(run('player.shieldReady'),true);
fresh();acquire('dash');assert.equal(run('activateDash()'),true);assert.equal(run('player.inv'),0);run('pause();tick(2)');assert.equal(run('player.dashCooldown'),4);run('pause();tickStatuses(4)');assert.equal(run('player.dashCooldown'),0);
fresh('disc');acquire('rate');assert.equal(run("availableSkills().some(s=>s.id==='ricochet')"),false);
// Acquire every compatible node, then exercise all weapons/statuses/boss and reset.
for(const id of run('Object.keys(WEAPONS)')){
 fresh(id);run("for(const s of SKILLS)if(s.available())s.apply();player.inv=100000;clock=59.9");
 for(let i=0;i<100;i++){
  if(['upgrade','reward'].includes(run('state')))run("el('choices').children.at(-1).onclick()");
  run('firing=true;tick(.04);draw()');
 }
 assert.ok(run('Number.isFinite(player.hp)&&Number.isFinite(player.damage)&&player.ammo>=0&&player.ammo<=magazineSize()'),id+' valid combined state');
 assert.ok(run('bullets.length<=400&&effects.length<=150'),id+' bounded effects');
}
fresh();assert.equal(run('player.acquired.size'),0);assert.equal(run('player.ammo'),24);assert.equal(run('player.reloadTime'),0);assert.equal(run('player.hitCooldowns.retaliation'),0);
run(`const savedRandom=Math.random;try{Math.random=()=>{throw Error('Render used combat RNG');};draw();}finally{Math.random=savedRandom;}`);
console.log('36 unique tree nodes, prerequisites, multiplicative costs, conditional effects, 120s timers, all magazines/reloads, bursts, statuses, rendering and reset passed.');
fresh();run('upgrade()');
assert.equal(elements.get('overlay')['data-mode'],'upgrade');
for(const card of elements.get('choices').children.slice(0,-1)){
 const id=card['data-skill'];assert.ok(fs.existsSync('assets/skills/'+id+'.svg'),id+' has a local icon');
 assert.equal(card.children[1].src,'assets/skills/'+id+'.svg');
 assert.equal(card.children[5].children.length,4,'root shows three evolutions plus label');
}
const first=run('offeredSkills[0].id');fire('window:keydown',{key:'1',repeat:false,preventDefault(){}});assert.equal(run('player.acquired.has('+JSON.stringify(first)+')'),true,'numeric shortcut selects offered card');
for(const id of run('SKILLS.map(s=>s.id)'))assert.ok(fs.existsSync('assets/skills/'+id+'.svg'),id+' icon exists');
console.log('Upgrade card artwork, branch previews, mode and keyboard selection passed.');

// Proportional reloads: fractions use the modified full capacity/time.
for(const id of run('Object.keys(WEAPONS)')){
 fresh(id);run('player.magazineMult=2;player.reloadMult=2;player.ammo=magazineSize()/2');
 const half=run('reloadDuration()/2');assert.equal(run('missingReloadDuration()'),half);
 run('startReload()');assert.equal(run('player.reloadTotal'),half);run('tickStatuses(player.reloadTime)');assert.equal(run('player.ammo'),run('magazineSize()'));
 run('player.ammo=magazineSize()-1;startReload()');assert.ok(Math.abs(run('player.reloadTotal')-run('reloadDuration()/magazineSize()'))<1e-9);
}
fresh();run('player.ammo=12;updateHUD()');assert.ok(elements.get('reload-status').textContent.includes('0.7 s'));
// One boss at a time: due encounters wait rather than replacing a living boss.
fresh();run('clock=60;player.inv=10000;tick(.01)');assert.equal(run('boss.id'),'brute');
run('clock=240;tick(.01)');assert.equal(run('boss.id'),'brute');assert.equal(run('bossIndex'),1);
run('damageEnemy(boss,99999);tick(.01)');assert.equal(run('state'),'reward');assert.equal(run('bossKills'),1);
run("el('choices').children.at(-1).onclick();tick(.01)");assert.equal(run('boss.id'),'scrapper');assert.equal(run('bossIndex'),2);
run('damageEnemy(boss,99999);tick(.01)');run("el('choices').children.at(-1).onclick();clock=419;tick(.01)");assert.equal(run('bossIndex'),2,'third boss not early');
run('clock=420;tick(.01)');assert.equal(run('boss.id'),'coil');assert.equal(run('bossIndex'),3);
run('damageEnemy(boss,99999);tick(.01)');run("el('choices').children.at(-1).onclick();tick(.01)");assert.equal(run('bossKills'),3);assert.equal(run('bossIndex'),3);assert.equal(run('spawnBoss()'),false,'no extra boss beyond schedule');
// Scrapper telegraphs pools before damage; leaving circles avoids the hazard.
fresh();run('bossIndex=1;spawnBoss();boss.timer=0;tickBoss(.01)');assert.equal(run('boss.phase'),'tellMortar');assert.equal(run('hazards.length'),3);
run('tickHazards(1)');assert.equal(run('player.hp'),100,'warning causes no damage');run('tickHazards(.41)');assert.equal(run('player.hp'),88,'pool activates after warning');
run('player.inv=0;player.x+=500;tickHazards(.1)');assert.equal(run('player.hp'),88,'outside pool is safe');
run('pause();globalThis.hazardDelay=hazards[0].life;tick(5)');assert.equal(run('hazards[0].life'),run('hazardDelay'),'pause freezes hazards');run('pause();draw()');
run('damageEnemy(boss,99999)');assert.equal(run('hazards.length'),0,'boss death clears hazards');
// Coil alternates an expanding ground ring with a five-shot aimed fan.
fresh();run('bossIndex=2;spawnBoss();boss.timer=0;tickBoss(.01)');assert.equal(run('boss.phase'),'tellPulse');assert.equal(run('hazards.length'),0);
run('boss.timer=0;tickBoss(.01)');assert.equal(run('hazards[0].type'),'ring');run('player.x=boss.x+40;player.y=boss.y;tickHazards(.1)');assert.equal(run('player.hp'),86,'expanding ring damages crossing band');
run('player.inv=0;player.x=boss.x;tickHazards(.1)');assert.equal(run('player.hp'),86,'ring center is safe');
run('boss.timer=0;tickBoss(.01)');assert.equal(run('boss.phase'),'tellFan');assert.equal(run('hostile.length'),0);run('draw();boss.timer=0;tickBoss(.01)');assert.equal(run('hostile.length'),5);assert.ok(run('hostile.every(b=>b.color==="#c3b6ed")'));
run('damageEnemy(boss,99999)');assert.equal(run('hostile.length'),0);assert.equal(run('hazards.length'),0);
fresh();assert.equal(run('bossIndex'),0);assert.equal(run('bossKills'),0);assert.equal(run('hazards.length'),0);
// Exercise both specialists over multiple attack cycles, movement and pause-safe state.
for(const index of [1,2]){
 fresh();run(`bossIndex=${index};spawnBoss();player.inv=10000`);
 for(let i=0;i<600;i++)run('tickBoss(.04);tickHazards(.04);draw()');
 assert.ok(run('Number.isFinite(boss.x)&&Number.isFinite(boss.y)&&hazards.length<=60'));
}
console.log('Proportional reloads, three boss schedule, delayed pools, electric rings/fans, warning safety, pause and cleanup passed.');
// Readable tree labels, spatial language and dedicated cooldown HUD.
fresh();assert.equal(run('Object.keys(TREE_INFO).length'),9);
assert.equal(run('SKILLS.some(s=>/\\bpx\\b/.test(s.benefit+s.cost))'),false,'no implementation units in upgrade copy');
acquire('damage');acquire('rate');assert.ok(Math.abs(run('player.damage')-44/1.5)<1e-9);assert.ok(Math.abs(run('player.rate')-.48/3)<1e-9);
fresh();acquire('shield');acquire('dash');acquire('emergency');acquire('retaliation');acquire('overload');run('updateHUD()');
assert.equal(elements.get('cooldowns').children.length,5,'all acquired timed modules visible');
assert.ok(run('cooldownNodes.every(n=>n.status.textContent==="PRONTO")'));
run('hurtPlayer(1);updateHUD()');assert.equal(run('cooldownNodes[0].status.textContent'),'120 s');
run('player.inv=0;hurtPlayer(1);updateHUD()');assert.equal(run('cooldownNodes.find(n=>n.item.children[1].textContent==="SOBRECARGA REATIVA").status.textContent'),'ATIVO');
run('tickStatuses(60);updateHUD()');assert.equal(run('cooldownNodes[0].track["aria-valuenow"]'),'50');assert.equal(run('cooldownNodes[0].status.textContent'),'60 s');
run('pause();tick(10);updateHUD()');assert.equal(run('cooldownNodes[0].status.textContent'),'60 s');run('pause();tickStatuses(60);updateHUD()');assert.ok(run('cooldownNodes.every(n=>n.status.textContent==="PRONTO")'));
fresh();assert.equal(elements.get('cooldowns').children.length,0,'reset removes old cooldown badges');
console.log('Gentler multiplicative costs, named trees, player-facing area descriptions and cooldown HUD passed.');
