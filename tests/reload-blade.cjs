'use strict';
// Synthetic engine fixtures, not natural runs or evidence of build balance.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const prefix=fs.readFileSync('tests/combat.cjs','utf8').split('assert.match(')[0].replace('Math,Set,localStorage','Math:Object.create(Math),Set,localStorage');
const {context,listeners}=new Function('require',prefix+';return {context,listeners};')(require);
const run=s=>vm.runInContext(s,context),read=s=>JSON.parse(run('JSON.stringify('+s+')'));
const near=(a,b,label)=>assert.ok(Math.abs(a-b)<1e-7,`${label}: ${a} vs ${b}`);
const checks=[];
function check(name,fn){try{fn();checks.push({name,status:'passed'});}catch(error){checks.push({name,status:'failed',error:error.stack});}}
function setup(weapon='machine',robot='prot',aux=[]){context.gun=weapon;context.chassis=robot;context.aux=aux;run(`profile=emptyProfile();profile.unlockedRobots=Object.fromEntries(Object.keys(ROBOTS).map(id=>[id,true]));profile.unlockedWeapons=Object.fromEntries(Object.keys(WEAPONS).map(id=>[id,true]));selectedRobot=chassis;selectedWeapon=gun;selectedAuxWeapons=aux.slice();reset();spawn=1e9;bossIndex=1e6;player.inv=1e9;aim={x:player.x+300-camera.x,y:player.y-camera.y,active:true};`);}
function install(){run(`state='relic';offeredRelics=[BOSS_RELICS.find(r=>r.id==='reloadBlade')];`);assert.equal(run(`chooseRelic('reloadBlade',offerVersion)`),true);run('aim={x:player.x+300-camera.x,y:player.y-camera.y,active:true}');}
function reloading(missing=null){context.missing=missing;run(`player.ammo=missing===null?0:magazineSize()-missing;startReload();firing=true;`);}
function target(x=70,y=0,r=1){context.tx=x;context.ty=y;context.tr=r;run(`globalThis.fixtureTarget={x:player.x+tx,y:player.y+ty,r:tr,hp:100000,maxHp:100000,speed:0,enemyType:'chaser'};enemies=[fixtureTarget];`);}
function bladeStep(dt){context.delta=dt;run('tickWeaponReload(primaryWeaponState(),delta)');}
check('catalogue, all twelve weapons: full/one-cartridge reload budget and snapshots',()=>{
 assert.equal(run('BOSS_RELICS.length'),19);
 for(const weapon of run('Object.keys(WEAPONS)'))for(const missing of [null,1]){
  setup(weapon);install();run(`player.skills.crit=1;player.shotCount=4;player.repairShotReady=true;player.projectileMult=2;globalThis.expectedP=shotDamage()*Math.min(400,Math.max(1,Math.floor(runWeapon.pellets*player.projectileMult)));`);
  reloading(missing);target();
  assert.equal(run('primaryWeaponState().reloadBlade.visible'),false,weapon+' waits for active tick');
  assert.equal(run('Number.isFinite(primaryWeaponState().reloadBlade.lastCue)'),true,'cue bookkeeping must not store Infinity');
  assert.equal(run('primaryWeaponState().reloadBlade.geometry'),null);
  near(run('primaryWeaponState().reloadBlade.baseDamage'),run('expectedP'),weapon+' no crit/repair/rupture factor');
  run('globalThis.duration=player.reloadTime;globalThis.ammoBefore=player.ammo;globalThis.countBefore=player.shotCount;globalThis.readyBefore=player.repairShotReady');
  bladeStep(run('duration')+3);
  near(100000-run('fixtureTarget.hp'),run('expectedP*duration*.9'),weapon+' integral '+missing);
  assert.equal(run('primaryWeaponState().reloadBlade'),undefined,'completion discards blade');
  assert.equal(run('player.ammo'),run('magazineSize()'));
  assert.equal(run('player.shotCount'),run('countBefore'));
  assert.equal(run('player.repairShotReady'),true);
  assert.equal(run('bullets.length'),0);
 }
});
check('invalid start preserves active state; acquisition during reload is not retroactive',()=>{
 setup();assert.equal(run('startReload()'),false);assert.equal(run('primaryWeaponState().reloadBlade'),undefined);
 reloading();run('globalThis.priorReload=JSON.stringify({ammo:player.ammo,time:player.reloadTime,total:player.reloadTotal})');install();
 assert.equal(run('primaryWeaponState().reloadBlade'),undefined);assert.equal(run('JSON.stringify({ammo:player.ammo,time:player.reloadTime,total:player.reloadTotal})'),run('priorReload'));
 bladeStep(.1);assert.equal(run('primaryWeaponState().reloadBlade'),undefined);
 bladeStep(run('player.reloadTime'));reloading();bladeStep(.1);
 run('globalThis.activeBlade=primaryWeaponState().reloadBlade;globalThis.oldSnapshot=JSON.stringify(activeBlade)');
 assert.equal(run('startReload()'),false);assert.equal(run('primaryWeaponState().reloadBlade===activeBlade'),true);assert.equal(run('JSON.stringify(activeBlade)'),run('oldSnapshot'));
});
check('pure exact damage integral, partition independence, clipped final interval',()=>{
 setup();install();reloading();target();run('globalThis.P=primaryWeaponState().reloadBlade.baseDamage;globalThis.T=player.reloadTime');
 near(run('reloadBladeDamage(P,T,T,T)'),run('P*T*.9'),'whole integral');
 near(run('reloadBladeDamage(P,T,T,T+20)'),run('P*T*.9'),'overshoot clipped');
 near(run('reloadBladeDamage(P,0,T,2)'),0,'completed no budget');
 run('globalThis.parts=Array.from({length:37},(_,i)=>reloadBladeDamage(P,T-i*T/37,T,T/37)).reduce((a,b)=>a+b,0)');near(run('parts'),run('P*T*.9'),'37 exact slices');
 const total=run('T'),expected=run('P*T*.9');bladeStep(total/2);bladeStep(total/2);near(100000-run('fixtureTarget.hp'),expected,'engine divided');
});
check('manual firing, aim, release and phase gating',()=>{
 setup();install();reloading();target();
 run('firing=false');bladeStep(.1);near(run('fixtureTarget.hp'),100000,'released does no damage');assert.equal(run('primaryWeaponState().reloadBlade.visible'),false);
 run('firing=true;aim.active=false');bladeStep(.1);near(run('fixtureTarget.hp'),100000,'inactive aim does no damage');
 run('aim.active=true');bladeStep(.1);assert.ok(run('fixtureTarget.hp<100000'));assert.equal(run('primaryWeaponState().reloadBlade.visible'),true);
 run('globalThis.hpBefore=fixtureTarget.hp;firing=false');bladeStep(.1);near(run('fixtureTarget.hp'),run('hpBefore'),'release halts damage');assert.equal(run('primaryWeaponState().reloadBlade.visible'),false);
 for(const mode of ['paused','upgrade','relic','over']){context.phase=mode;run('state=phase;firing=true;globalThis.before=JSON.stringify({hp:fixtureTarget.hp,blade:primaryWeaponState().reloadBlade,time:player.reloadTime});tickReloadBlade(primaryWeaponState(),.1)');assert.equal(run('JSON.stringify({hp:fixtureTarget.hp,blade:primaryWeaponState().reloadBlade,time:player.reloadTime})'),run('before'),mode+' frozen');}
});
check('manual capsule boundaries and orientation; no enemy-dependent targeting',()=>{
 for(const [x,y,hit] of [[70,12.9,true],[70,13.1,false],[23.1,0,true],[22.9,0,false],[122.9,0,true],[123.1,0,false],[-70,0,false]]){
  setup();install();reloading();target(x,y,1);bladeStep(.1);assert.equal(run('fixtureTarget.hp<100000'),hit,'capsule '+x+','+y);
 }
 setup();install();reloading();target(0,70);run('aim={x:player.x-camera.x,y:player.y+300-camera.y,active:true}');bladeStep(.1);assert.ok(run('fixtureTarget.hp<100000'),'vertical aim rotates capsule');
 setup();install();reloading();run('globalThis.savedRandom=Math.random;Math.random=()=>{throw Error("no RNG without target")};tickReloadBlade(primaryWeaponState(),.1);Math.random=savedRandom;');assert.equal(run('primaryWeaponState().reloadBlade.visible'),true,'blade visible without targets');
});
check('three weapons retain independent offsets, damage snapshots and reload progress',()=>{
 setup('machine','swarm',['shotgun','rocket']);install();run('for(const s of weaponSlots){s.ammo=0;startReload(s)}firing=true;globalThis.initial=weaponSlots.map(s=>({p:s.reloadBlade.baseDamage,time:s.reloadTime}));globalThis.offsetTargets=weaponSlots.map(s=>{const o=weaponOrigin(s,0);return {x:o.x+70,y:o.y,r:.1,hp:100000,maxHp:100000,speed:0,enemyType:"chaser"}});enemies=offsetTargets;');
 run('tickWeaponReload(weaponSlots[0],.1)');assert.ok(run('offsetTargets[0].hp<100000'));assert.equal(run('offsetTargets[1].hp'),100000);assert.equal(run('offsetTargets[2].hp'),100000);
 near(run('weaponSlots[1].reloadTime'),run('initial[1].time'),'other time independent');
 run('tickWeaponReload(weaponSlots[1],.1);tickWeaponReload(weaponSlots[2],.1)');assert.ok(run('offsetTargets.every(z=>z.hp<100000)'));assert.equal(new Set(read('weaponSlots.map(s=>s.reloadBlade.baseDamage)')).size,3);
});
check('refit mid reload preserves captured base and established reload clock',()=>{
 setup('shotgun');install();reloading();bladeStep(.2);run('globalThis.beforeRefit={base:primaryWeaponState().reloadBlade.baseDamage,time:player.reloadTime,total:player.reloadTotal};installWeaponEvolution(primaryWeaponState(),WEAPON_EVOLUTIONS.shotgun[1]);');
 near(run('primaryWeaponState().reloadBlade.baseDamage'),run('beforeRefit.base'),'captured P');
 // Legacy refits change the next duration, never an already active reload.
 near(run('player.reloadTime'),run('beforeRefit.time'),'established remaining time');near(run('player.reloadTotal'),run('beforeRefit.total'),'established total');
});
check('shield break absorbs excess and excludes impact statuses/procs',()=>{
 setup('flame');install();reloading();target();run(`fixtureTarget.enemyType='shieldPolice';fixtureTarget.shieldHp=.01;fixtureTarget.shieldMaxHp=20;player.skills={burn:1,freeze:1,shock:1,ricochet:1,corrosion:1,knock:1,blast:1,crit:1};globalThis.beforePosition={x:fixtureTarget.x,y:fixtureTarget.y};`);bladeStep(.1);
 assert.equal(run('fixtureTarget.shieldHp'),0);assert.equal(run('fixtureTarget.hp'),100000);assert.equal(run('fixtureTarget.burnTime||0'),0);assert.equal(run('fixtureTarget.slowTime||0'),0);assert.equal(run('fixtureTarget.corrosion||null'),null);assert.equal(run('bullets.length'),0);near(run('fixtureTarget.x'),run('beforePosition.x'),'no knock');
});
check('source isolation, ordinary loot and kill rewards; normal global modifiers',()=>{
 setup();install();reloading();target();run(`player.skills.killAmmo=1;player.skills.salvage=1;player.ammoKills=9;player.killCounter=19;player.hp=50;fixtureTarget.hp=fixtureTarget.maxHp=.01;globalThis.captureDamage=damageEnemy;globalThis.damageSources=[];damageEnemy=function(z,d,s,o){damageSources.push({s,slot:o?.slot});return captureDamage(z,d,s,o)};`);bladeStep(.1);
 assert.deepEqual(read('damageSources.map(s=>s.s)'),['reloadBlade']);assert.equal(run('gems.length'),1);assert.equal(run('scrap.length'),1);assert.equal(run('kills'),1);assert.equal(run('player.ammo'),0,'no killAmmo');assert.equal(run('player.ammoKills'),9);assert.equal(run('player.killCounter'),19);assert.equal(run('player.hp'),50,'no salvage heal');run('damageEnemy=captureDamage');
 setup();install();reloading();target();run(`fixtureTarget.hp=1000;fixtureTarget.maxHp=6000;boss=fixtureTarget;enemies=[];player.skills.finisher=1;player.skills.bossHunter=1;player.specialization='predatorMark';player.markedTarget=fixtureTarget;player.markTime=2;globalThis.expected=reloadBladeDamage(primaryWeaponState().reloadBlade.baseDamage,player.reloadTime,player.reloadTotal,.1)*3*3*1.25;`);bladeStep(.1);near(1000-run('fixtureTarget.hp'),run('expected'),'global multipliers');
});
check('boss blade kill retains one chest, boss part and normal repair',()=>{
 setup();install();reloading();target();run(`fixtureTarget.id='brute';fixtureTarget.name='FIXTURE BRUTE';fixtureTarget.hp=fixtureTarget.maxHp=.01;boss=fixtureTarget;enemies=[];player.hp=50;globalThis.partBefore=profile.bossParts.brute;tick(.1);`);
 assert.equal(run('bossKills'),1);assert.equal(run('bossChests.length'),1);assert.equal(run('profile.bossParts.brute'),run('partBefore+1'));near(run('player.hp'),70,'ordinary boss repair');run('tick(.1)');assert.equal(run('bossKills'),1);assert.equal(run('bossChests.length'),1);near(run('player.hp'),70,'no duplicate repair');
});
check('real tick samples before horde movement',()=>{
 setup();install();reloading();target(70,14,1);run('fixtureTarget.speed=100;tick(.1)');assert.equal(run('fixtureTarget.hp'),100000,'target begins outside capsule before moving toward player');assert.ok(run('fixtureTarget.y<player.y+14'));
});
check('real tick samples before player movement and freezes saved draw pose',()=>{
 setup();install();reloading();target(27);run('keys.add("d");globalThis.preX=player.x;tick(.1)');assert.ok(run('fixtureTarget.hp<100000'));assert.ok(run('player.x>preX'));
 run('globalThis.pose=JSON.stringify(primaryWeaponState().reloadBlade);pause();globalThis.frozen=JSON.stringify({clock,weaponSlots,player,enemies});globalThis.randomDraw=Math.random;Math.random=()=>{throw Error("draw RNG")};drawReloadBlades();draw();tick(9);Math.random=randomDraw;');
 assert.equal(run('JSON.stringify({clock,weaponSlots,player,enemies})'),run('frozen'),'draw and paused tick pure');assert.equal(run('JSON.stringify(primaryWeaponState().reloadBlade)'),run('pose'),'frozen pose preserved');assert.equal(run('firing'),false);
 run('pause()');assert.equal(run('firing'),false);run('firing=true');listeners.get('window:blur')();assert.equal(run('state'),'paused');assert.equal(run('firing'),false);
 run('reset()');assert.equal(run('primaryWeaponState().reloadBlade'),undefined);assert.equal(run('player.relics.has("reloadBlade")'),false);
});
const output={kind:'synthetic-engine-fixtures',date:new Date().toISOString(),node:process.version,gameSha256:require('node:crypto').createHash('sha256').update(fs.readFileSync('game.js')).digest('hex'),checks,passed:checks.filter(x=>x.status==='passed').length,failed:checks.filter(x=>x.status==='failed').length};
fs.mkdirSync('outputs/reload-engine62',{recursive:true});fs.writeFileSync('outputs/reload-engine62/results.json',JSON.stringify(output,null,2));
for(const result of checks){console.log(result.status.toUpperCase()+': '+result.name);if(result.error)console.error(result.error);}
console.log(`Reload blade engine fixtures: ${output.passed} passed, ${output.failed} failed.`);if(output.failed)process.exitCode=1;
