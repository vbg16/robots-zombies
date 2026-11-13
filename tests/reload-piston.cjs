'use strict';
// Controlled engine fixtures. Not natural progression or balance approval.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const prefix=fs.readFileSync('tests/combat.cjs','utf8').split('assert.match(')[0].replace('Math,Set,localStorage','Math:Object.create(Math),Set,localStorage');
const {context,listeners}=new Function('require',prefix+';return {context,listeners};')(require),run=s=>vm.runInContext(s,context),read=s=>JSON.parse(run('JSON.stringify('+s+')'));
const checks=[],near=(a,b,label)=>assert.ok(Math.abs(a-b)<1e-7,label+': '+a+' vs '+b);
function check(name,fn){try{fn();checks.push({name,status:'passed'});}catch(e){checks.push({name,status:'failed',error:e.stack});}}
function setup(weapon='machine',aux=[]){context.fixtureWeapon=weapon;context.fixtureAux=aux;run(`profile=emptyProfile();profile.unlockedRobots=Object.fromEntries(Object.keys(ROBOTS).map(id=>[id,true]));profile.unlockedWeapons=Object.fromEntries(Object.keys(WEAPONS).map(id=>[id,true]));selectedRobot=fixtureAux.length?'swarm':'prot';selectedWeapon=fixtureWeapon;selectedAuxWeapons=fixtureAux;reset();spawn=1e6;bossIndex=1e6;player.inv=1e6;aim={x:player.x+300-camera.x,y:player.y-camera.y,active:true};firing=false;`);}
function install(){run(`state='relic';offeredRelics=[BOSS_RELICS.find(r=>r.id==='reloadPiston')];offerVersion++;`);assert.equal(run("chooseRelic('reloadPiston',offerVersion)"),true);}
function launch(){run('player.ammo=0;startReload();tickWeaponReload(primaryWeaponState(),player.reloadTime)');assert.ok(run('primaryWeaponState().reloadPiston'));}
function target(x=80,y=0,r=1,hp=10000){Object.assign(context,{tx:x,ty:y,tr:r,th:hp});run('globalThis.target=Object.assign(createEnemy(player.x+tx,player.y+ty),{r:tr,hp:th,maxHp:th,speed:0});enemies=[target]');}
check('all12 weapons capture normal cartridge and scale full/one-cartridge replacement',()=>{
 for(const weapon of run('Object.keys(WEAPONS)'))for(const partial of [false,true]){
  setup(weapon);install();run(`globalThis.cap=magazineSize();globalThis.P=shotDamage()*Math.min(400,Math.max(1,Math.floor(runWeapon.pellets*player.projectileMult)));player.ammo=${partial?'cap-1':'0'};startReload();globalThis.duration=player.reloadTime`);
  near(run('primaryWeaponState().reloadPistonCharge'),run('P'),'P');assert.equal(run('primaryWeaponState().reloadPiston'),undefined);
  run('tickWeaponReload(primaryWeaponState(),duration)');near(run('primaryWeaponState().reloadPiston.damage'),run('P*.9')/(partial?run('cap'):1),'scaled damage');near(run('primaryWeaponState().reloadPiston.life'),.6,'life at completion');assert.equal(run('player.ammo'),run('cap'));assert.equal(run('primaryWeaponState().reloadPistonCharge'),undefined);
 }
});
check('no early launch, invalid/repeated reload cannot create or renew snapshots',()=>{
 setup();install();assert.equal(run('startReload()'),false);assert.equal(run('primaryWeaponState().reloadPistonCharge'),undefined);
 run('player.ammo=0;startReload();globalThis.charge=primaryWeaponState().reloadPistonCharge;tickWeaponReload(primaryWeaponState(),player.reloadTime/2)');assert.equal(run('primaryWeaponState().reloadPiston'),undefined);assert.equal(run('startReload()'),false);assert.equal(run('primaryWeaponState().reloadPistonCharge'),run('charge'));
});
check('acquisition during reload is not retroactive; future valid reload works',()=>{
 setup();run('player.ammo=0;startReload()');install();run('tickWeaponReload(primaryWeaponState(),player.reloadTime)');assert.equal(run('primaryWeaponState().reloadPiston'),undefined);launch();
});
check('completion needs finite nonzero manual aim, not firing or automatic targeting',()=>{
 for(const kind of ['inactive','zero','invalid']){setup();install();run('player.ammo=0;startReload()');run(kind==='inactive'?'aim.active=false':kind==='zero'?'aim={x:player.x-camera.x,y:player.y-camera.y,active:true}':'aim.x=NaN');run('tickWeaponReload(primaryWeaponState(),player.reloadTime)');assert.equal(run('primaryWeaponState().reloadPiston'),undefined);assert.equal(run('primaryWeaponState().reloadPistonCharge'),undefined);}
 setup();install();launch();assert.equal(run('firing'),false);assert.equal(run('enemies.length'),0);near(run('primaryWeaponState().reloadPiston.ux'),1,'manual direction');
});
check('overshoot advances only residual interval and old pistons advance without a reload',()=>{
 setup();install();run('player.ammo=0;startReload();globalThis.T=player.reloadTime;globalThis.x0=weaponOrigin(primaryWeaponState(),0).x+24;tickWeaponReload(primaryWeaponState(),T+.2)');near(run('primaryWeaponState().reloadPiston.x'),run('x0+72'),'residual position');near(run('primaryWeaponState().reloadPiston.life'),.4,'residual age');run('tickWeaponReload(primaryWeaponState(),.1)');near(run('primaryWeaponState().reloadPiston.x'),run('x0+108'),'advances outside reload');
});
check('swept contacts sort by entry, penetrate3 once, and survive target-array reorder',()=>{
 setup();install();launch();run(`globalThis.P=primaryWeaponState().reloadPiston.damage;globalThis.bodies=[140,60,100,180].map(x=>Object.assign(createEnemy(player.x+x,player.y),{r:1,hp:10000,maxHp:10000}));enemies=bodies;tickReloadPiston(primaryWeaponState(),.5)`);
 near(run('bodies[0].hp'),10000-run('P'),'third by entry');near(run('bodies[1].hp'),10000-run('P'),'first by entry');near(run('bodies[2].hp'),10000-run('P'),'second by entry');assert.equal(run('bodies[3].hp'),10000);assert.equal(run('primaryWeaponState().reloadPiston'),undefined);
 setup();install();launch();target(35);run('globalThis.P=primaryWeaponState().reloadPiston.damage;tickReloadPiston(primaryWeaponState(),.01);tickReloadPiston(primaryWeaponState(),.02)');near(run('target.hp'),10000-run('P'),'no repeated contact');assert.equal(run('primaryWeaponState().reloadPiston.hit.size'),1);
});
check('capsule edge, orientation and lifetime endpoint obey exact declared geometry',()=>{
 for(const [y,hit] of [[10.99,true],[11.01,false]]){setup();install();launch();target(80,y);run('tickReloadPiston(primaryWeaponState(),.2)');assert.equal(run('target.hp<10000'),hit);}
 setup();install();launch();target(251);run('tickReloadPiston(primaryWeaponState(),.6)');assert.equal(run('target.hp'),10000,'contact exactly at expiration loses tie');assert.equal(run('primaryWeaponState().reloadPiston'),undefined);
 setup();install();run('aim={x:player.x-camera.x,y:player.y+300-camera.y,active:true}');launch();target(0,80);run('tickReloadPiston(primaryWeaponState(),.2)');assert.ok(run('target.hp<10000'));
});
check('one replacement per slot, independent3slot origins/snapshots and no400bullet coupling',()=>{
 setup('machine',['shotgun','rocket']);install();run('for(const s of weaponSlots){s.ammo=0;startReload(s);tickWeaponReload(s,s.reloadTime)}');assert.equal(run('weaponSlots.filter(s=>s.reloadPiston).length'),3);assert.equal(new Set(read('weaponSlots.map(s=>s.reloadPiston.damage)')).size,3);assert.equal(new Set(read('weaponSlots.map(s=>s.reloadPiston.y)')).size,3);
 run('globalThis.old=weaponSlots[0].reloadPiston;weaponSlots[0].ammo=0;startReload(weaponSlots[0]);tickWeaponReload(weaponSlots[0],weaponSlots[0].reloadTime)');assert.equal(run('weaponSlots[0].reloadPiston===old'),false);assert.equal(run('weaponSlots.filter(s=>s.reloadPiston).length'),3);
 setup();install();run('bullets=Array.from({length:400},()=>({life:1}));');launch();assert.equal(run('bullets.length'),400);
});
check('old entity clips at replacement boundary before new entity gets the remainder',()=>{
 setup();install();launch();run('primaryWeaponState().reloadPiston.damage=1;globalThis.old=primaryWeaponState().reloadPiston;player.ammo=magazineSize()-1;startReload();globalThis.T=player.reloadTime;globalThis.startX=old.x');target(110);run('tickWeaponReload(primaryWeaponState(),T+.1)');near(run('old.x'),run('startX+T*360'),'old only moves to completion');near(run('target.hp'),10000,'old must not hit after replacement time');near(run('primaryWeaponState().reloadPiston.life'),.5,'new remaining interval');
});
check('refit and conditional changes preserve captured base and existing reload clocks',()=>{
 setup('shotgun');install();run('player.skills.shieldDrive=1;player.skills.shield=1;player.shieldReady=true;player.skills.cleanCircuit=1;player.cleanCircuitElapsed=30;player.ammo=0;startReload();globalThis.P=primaryWeaponState().reloadPistonCharge;globalThis.T=player.reloadTime;player.shieldReady=false;player.cleanCircuitElapsed=0;installWeaponEvolution(primaryWeaponState(),WEAPON_EVOLUTIONS.shotgun[1])');near(run('player.reloadTime'),run('T'),'old clock');run('tickWeaponReload(primaryWeaponState(),player.reloadTime)');near(run('primaryWeaponState().reloadPiston.damage'),run('P*.9'),'captured base');
});
check('shield absorbs whole break and piston never applies projectile status/knock/procs',()=>{
 setup('flame');install();launch();target(80);run(`target.enemyType='shieldPolice';target.shieldHp=1;target.shieldMaxHp=100;player.skills.burn=1;player.skills.freeze=1;player.skills.shock=1;player.skills.knock=1;player.skills.corrosion=1;player.skills.blast=1;player.skills.crit=1;globalThis.pos=[target.x,target.y];tickReloadPiston(primaryWeaponState(),.2)`);assert.equal(run('target.hp'),10000);assert.equal(run('target.shieldHp'),0);assert.equal(run('target.burnTime||0'),0);assert.equal(run('target.slowTime||0'),0);assert.equal(run('target.corrosion'),undefined);assert.deepEqual(read('[target.x,target.y]'),read('pos'));assert.equal(run('bullets.length'),0);
});
check('central global damage and normal loot remain, manual kill-ammo/salvage excluded',()=>{
 setup();install();launch();target(80,0,1,1);run('player.skills.killAmmo=1;player.ammoKills=9;player.skills.salvage=1;player.killCounter=19;player.hp=50;tickReloadPiston(primaryWeaponState(),.2)');assert.equal(run('kills'),1);assert.equal(run('gems.length'),1);assert.equal(run('scrap.length'),1);assert.equal(run('player.ammoKills'),9);assert.equal(run('player.killCounter'),19);assert.equal(run('player.hp'),50);
 setup();install();launch();target(80,0,1,100);run('target.hp=20;player.skills.finisher=1;globalThis.P=primaryWeaponState().reloadPiston.damage;tickReloadPiston(primaryWeaponState(),.2)');near(run('target.hp'),Math.max(0,20-run('P*3')),'finisher applies centrally');
});
check('boss kill has one chest/part and minions removed by boss are not extra contacts',()=>{
 setup();install();launch();run('bossIndex=0;spawnBoss();boss.x=player.x+60;boss.y=player.y;boss.hp=1;globalThis.beforePart=profile.bossParts.brute;tickReloadPiston(primaryWeaponState(),.2)');assert.equal(run('bossKills'),1);assert.equal(run('bossChests.length'),1);assert.equal(run('profile.bossParts.brute'),run('beforePart')+1);run('tickReloadPiston(primaryWeaponState(),.2)');assert.equal(run('bossChests.length'),1);
});
check('pause/release/focus freeze or retain autonomous launched entity as specified',()=>{
 setup();install();launch();run('globalThis.before=JSON.stringify(primaryWeaponState().reloadPiston);state="paused";tickReloadPiston(primaryWeaponState(),10)');assert.equal(run('JSON.stringify(primaryWeaponState().reloadPiston)'),run('before'));run('state="playing";aim.active=false;firing=false;tickReloadPiston(primaryWeaponState(),.1)');near(run('primaryWeaponState().reloadPiston.life'),.5,'launched entity needs no held input');listeners.get('window:blur')();assert.equal(run('state'),'paused');
});
check('render is pure without combat RNG; numeric graph and death/garage/reset cleanup',()=>{
 setup();install();launch();run('globalThis.before=JSON.stringify({player,weaponSlots,clock});globalThis.rng=Math.random;Math.random=()=>{throw Error("draw RNG")};drawReloadPistons();draw();Math.random=rng');assert.equal(run('JSON.stringify({player,weaponSlots,clock})'),run('before'));assert.deepEqual(require('../tools/finite-state.cjs').inspectFiniteState(run('({player,weaponSlots})')).invalid,[]);
 run('player.inv=0;hurtPlayer(1e6)');assert.equal(run('state'),'over');assert.equal(run('primaryWeaponState().reloadPiston'),undefined);assert.equal(run('primaryWeaponState().reloadPistonCharge'),undefined);
 setup();install();launch();run('openGarage()');assert.equal(run('primaryWeaponState().reloadPiston'),undefined);run('reset()');assert.equal(run('player.relics.has("reloadPiston")'),false);
});
check('refund during multi-cartridge reload uses only actual replacement, never the requested amount',()=>{
 setup();install();run('player.skills.repair=1;player.hp=50;player.ammo=magazineSize()-5;startReload();globalThis.P=primaryWeaponState().reloadPistonCharge;player.ammo++;globalThis.cap=magazineSize();tickWeaponReload(primaryWeaponState(),player.reloadTime)');near(run('primaryWeaponState().reloadPiston.damage'),run('P*.9*4/cap'),'four actually replaced');near(run('player.hp'),run('50+5*4/cap'),'same actual fraction for repair');
 setup();install();run('player.ammo=magazineSize()-5;startReload();player.ammo=magazineSize();tickWeaponReload(primaryWeaponState(),player.reloadTime)');assert.equal(run('primaryWeaponState().reloadPiston'),undefined);assert.equal(run('primaryWeaponState().reloadPistonCharge'),undefined);
});
check('integrated tick samples birth/direction before movement and camera, advancing only residual age',()=>{
 setup();install();run('player.ammo=magazineSize()-2;startReload();player.reloadTime=.02;globalThis.oldX=player.x;globalThis.oldCamera=camera.x;player.speed=4000;keys.add("d");tick(.05)');near(run('primaryWeaponState().reloadPiston.x'),run('oldX+24+.03*360'),'declared pre-movement spawn phase');near(run('primaryWeaponState().reloadPiston.life'),.57,'residual');assert.ok(run('player.x>oldX'));assert.ok(run('camera.x!==oldCamera'));near(run('primaryWeaponState().reloadPiston.uy'),0,'captured horizontal direction, no post-frame correction');
});
const result={kind:'synthetic-reload-piston-engine',at:new Date().toISOString(),gameSha256:crypto.createHash('sha256').update(fs.readFileSync('game.js')).digest('hex'),checks,passed:checks.filter(x=>x.status==='passed').length,failed:checks.filter(x=>x.status==='failed').length};
fs.mkdirSync('outputs/piston-engine64',{recursive:true});fs.writeFileSync('outputs/piston-engine64/result.json',JSON.stringify(result,null,2));for(const c of checks){console.log(c.status.toUpperCase()+': '+c.name);if(c.error)console.error(c.error)}if(result.failed)process.exitCode=1;
