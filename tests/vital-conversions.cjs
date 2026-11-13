'use strict';
// Synthetic fixtures: functional conversion/source rules, not natural balance.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const prefix=fs.readFileSync('tests/combat.cjs','utf8').split('assert.match(')[0].replace('Math,Set,localStorage','Math:Object.create(Math),Set,localStorage');
const {context,listeners}=new Function('require',prefix+';return {context,listeners};')(require),run=s=>vm.runInContext(s,context),read=s=>JSON.parse(run('JSON.stringify('+s+')'));
const checks=[],near=(a,b,label)=>assert.ok(Math.abs(a-b)<1e-7,label+': '+a+' vs '+b);
function check(name,fn){try{fn();checks.push({name,status:'passed'});}catch(e){checks.push({name,status:'failed',error:e.stack});}}
function setup(weapon='machine',aux=[],robot=null){Object.assign(context,{gun:weapon,aux,chassis:robot||(aux.length?'swarm':'prot')});run(`profile=emptyProfile();profile.unlockedRobots=Object.fromEntries(Object.keys(ROBOTS).map(id=>[id,true]));profile.unlockedWeapons=Object.fromEntries(Object.keys(WEAPONS).map(id=>[id,true]));selectedRobot=chassis;selectedWeapon=gun;selectedAuxWeapons=aux;reset();spawn=1e6;bossIndex=1e6;player.inv=1e6;aim={x:player.x+300-camera.x,y:player.y-camera.y,active:true};`);}
function acquire(id){context.skillId=id;run('SKILLS.find(s=>s.id===skillId).apply()');}
function install(id){context.relicId=id;run('state="relic";offeredRelics=[BOSS_RELICS.find(r=>r.id===relicId)];offerVersion++');assert.equal(run('chooseRelic(relicId,offerVersion)'),true);}
function target(hp=10000,x=50,y=0,r=1){Object.assign(context,{th:hp,tx:x,ty:y,tr:r});run('globalThis.target=Object.assign(createEnemy(player.x+tx,player.y+ty),{hp:th,maxHp:th,r:tr,speed:0});enemies=[target]');}
check('vital link eligibility requires real drone hardware and preserves count/cadence/profile',()=>{
 setup();assert.equal(run('BOSS_RELICS.find(r=>r.id==="vitalLink").eligible()'),false);acquire('drones');assert.equal(run('BOSS_RELICS.find(r=>r.id==="vitalLink").eligible()'),true);run('globalThis.before=JSON.stringify({profile,hp:player.hp,count:droneCount(),timer:player.droneTimer,rate:player.droneRateMult,slots:weaponSlots})');install('vitalLink');assert.equal(run('JSON.stringify({profile,hp:player.hp,count:droneCount(),timer:player.droneTimer,rate:player.droneRateMult,slots:weaponSlots})'),run('before'));
 setup('machine',[],'swarm');assert.equal(run('BOSS_RELICS.find(r=>r.id==="vitalLink").eligible()'),true,'native ENXA drone');
});
check('drone conversion reads current HP, not max HP, with explicit own cap',()=>{
 setup();acquire('drones');install('vitalLink');run('player.damage=400;player.droneDamageMult=1;player.hp=40;player.maxHp=100');near(run('droneShotDamage()'),101,'current40 gives1');run('player.maxHp=1000');near(run('droneShotDamage()'),101,'maxHP alone irrelevant');run('player.hp=80');near(run('droneShotDamage()'),102,'healed80 gives2');run('player.maxHp=10000;player.hp=10000');near(run('droneShotDamage()'),200,'own addition capped at baseline');
});
check('current HP invalid/zero does not produce invalid bonus; maximum technical clamp is finite',()=>{
 setup();acquire('drones');install('vitalLink');for(const value of ['NaN','Infinity','-Infinity','0','-1']){run('player.hp='+value);assert.equal(run('vitalDroneBonus(10)'),0)}run('player.hp=Number.MAX_VALUE');near(run('vitalDroneBonus(1e9)'),25000000,'HP bound1e9');assert.equal(run('vitalDroneBonus(Infinity)'),0);
});
check('drone base includes rack/maturity, then life, then boss focus exactly once',()=>{
 setup();acquire('drones');install('droneRack');install('vitalLink');run('player.damage=400;player.hp=100;clock=player.droneGrowthStart+90;boss={hp:1e6};player.specialization="droneBossFocus"');near(run('droneShotDamage()'),100*1.5*1.3+2.5,'base then HP');near(run('droneShotDamage(boss)'),(100*1.5*1.3+2.5)*1.25,'focus after life');
});
check('actual drone attacks and arcs inherit one HP capture, despite healing on primary kill',()=>{
 setup('machine',[],'swarm');acquire('droneArc');install('vitalLink');run('player.damage=100;player.hp=40;player.specialization="droneSalvage";player.specializationCooldown=0;player.droneTimer=0;globalThis.Dbase=player.damage*.25*player.droneDamageMult;globalThis.first=Object.assign(createEnemy(player.x+40,player.y),{hp:1,maxHp:1});globalThis.second=Object.assign(createEnemy(player.x+80,player.y),{hp:10000,maxHp:10000});enemies=[first,second];tickDrones(.01)');near(run('player.hp'),41,'old salvage heals once');near(run('second.hp'),10000-run('Dbase+1')*.5,'arc keeps pre-heal HP capture');
});
check('life bonus shield contact remains absorbed, with no status or ballistic procs',()=>{
 setup();acquire('drones');install('vitalLink');target();run('target.enemyType="shieldPolice";target.shieldHp=1;target.shieldMaxHp=100;player.skills.burn=1;player.skills.freeze=1;player.skills.corrosion=1;player.skills.knock=1;player.droneTimer=0;tickDrones(.01)');assert.equal(run('target.hp'),10000);assert.equal(run('target.shieldHp'),0);assert.equal(run('target.burnTime||0'),0);assert.equal(run('target.slowTime||0'),0);assert.equal(run('target.corrosion'),undefined);assert.equal(run('bullets.length'),0);
});
check('support-only conversion never changes bullet/sensor/rotor or existing in-flight damage',()=>{
 setup();acquire('drones');acquire('sensor');acquire('rotors');run('emitProjectiles(0);globalThis.before={bullet:bullets[0].damage,shot:shotDamage(),sensor:player.damage*.35*player.sensorDamageMult,rotor:rotorDamage()}');install('vitalLink');assert.deepEqual(read('({bullet:bullets[0].damage,shot:shotDamage(),sensor:player.damage*.35*player.sensorDamageMult,rotor:rotorDamage()})'),read('before'));
});
check('each drone samples at its own attack; shared HP does not multiply the coefficient per weapon',()=>{
 setup('machine',['shotgun','laser']);install('vitalLink');run('player.damage=100;player.hp=40;player.droneDamageMult=1');near(run('vitalDroneBonus(25)'),1,'shared health contribution');near(run('droneShotDamage()'),26,'one per attack, not times3');
});
check('all12 weapons pulse once only when an emitted cart actually empties the magazine',()=>{
 for(const weapon of run('Object.keys(WEAPONS)')){setup(weapon);install('integrityPulse');target();run('player.maxHp=100');if(run('magazineSize()')>1){run('player.ammo=2;emitProjectiles(0)');assert.equal(run('target.hp'),10000)}run('player.ammo=1;emitProjectiles(0)');near(run('target.hp'),9980,'last '+weapon);assert.equal(run('effects.filter(e=>e.kind==="integrityPulse").length'),1);assert.ok(run('player.reloadTime>0'));}
});
check('pellets and burst subshots do not duplicate the last-cartridge pulse',()=>{
 setup('shotgun');install('integrityPulse');target();run('player.ammo=1;player.maxHp=100;emitProjectiles(0)');assert.equal(run('bullets.length'),5);near(run('target.hp'),9980,'five pellets one pulse');
 setup('burst');install('integrityPulse');target();run('player.maxHp=100;player.ammo=3;emitProjectiles(0);emitProjectiles(0);emitProjectiles(0)');near(run('target.hp'),9980,'three consuming subshots one last');assert.equal(run('effects.filter(e=>e.kind==="integrityPulse").length'),1);
});
check('400projectile refusal preserves last ammo and emits no pulse;399allows one real cart',()=>{
 setup('shotgun');install('integrityPulse');target();run('player.ammo=1;bullets=Array.from({length:400},()=>({life:1}));');assert.equal(run('emitProjectiles(0)'),false);assert.equal(run('player.ammo'),1);assert.equal(run('target.hp'),10000);assert.equal(run('effects.filter(e=>e.kind==="integrityPulse").length'),0);run('bullets.pop();emitProjectiles(0)');assert.equal(run('bullets.length'),400);near(run('target.hp'),9980,'partial pellet output still spends one cart');
});
check('manual reload/discard, completion and duplicate invalid emission never pulse',()=>{
 setup();install('integrityPulse');target();run('player.ammo=1;startReload();tickWeaponReload(primaryWeaponState(),player.reloadTime)');assert.equal(run('target.hp'),10000);assert.equal(run('effects.filter(e=>e.kind==="integrityPulse").length'),0);
 run('player.ammo=1;emitProjectiles(0);globalThis.hpAfter=target.hp;emitProjectiles(0)');assert.equal(run('target.hp'),run('hpAfter'));assert.equal(run('effects.filter(e=>e.kind==="integrityPulse").length'),1);
});
check('pulse uses maxHP, not currentHP/weapon stats/critical/rupture/colimator',()=>{
 setup();install('integrityPulse');target();run('player.maxHp=300;player.hp=1;player.damage=1e6;player.skills.crit=1;player.shotCount=4;player.relics.add("ruptureChamber");primaryWeaponState().ruptureCharge=60;player.ammo=1;emitProjectiles(0)');near(run('target.hp'),9940,'max300 gives60 only');assert.ok(run('bullets[0].damage>1e6'),'separate boosted ballistic damage');
});
check('1/2/3gun contribution is divided once; each local last cart is independent',()=>{
 for(const aux of [[],['shotgun'],['shotgun','laser']]){setup('machine',aux);install('integrityPulse');target();run('player.maxHp=300;for(const slot of weaponSlots)slot.ammo=1;');run('emitProjectiles(0,weaponSlots[0])');near(run('target.hp'),10000-60/(aux.length+1),'one local pulse');run('for(const slot of weaponSlots.slice(1))emitProjectiles(0,slot)');near(run('target.hp'),9940,'shared whole simultaneous budget');assert.equal(run('effects.filter(e=>e.kind==="integrityPulse").length'),aux.length+1);}
});
check('radius includes body boundary, excludes outside and has no artificial target cap',()=>{
 setup();install('integrityPulse');run('enemies=Array.from({length:100},(_,i)=>Object.assign(createEnemy(player.x+20+(i%10),player.y+Math.floor(i/10)),{r:1,hp:1000,maxHp:1000}));globalThis.edge=Object.assign(createEnemy(player.x+91,player.y),{r:1,hp:1000,maxHp:1000});globalThis.out=Object.assign(createEnemy(player.x+91.01,player.y),{r:1,hp:1000,maxHp:1000});enemies.push(edge,out);player.ammo=1;emitProjectiles(0)');assert.equal(run('enemies.filter(z=>z.hp===980).length'),101);assert.equal(run('out.hp'),1000);
});
check('shield break blocks body/status and pulse never triggers ballistic side effects',()=>{
 setup('flame');install('integrityPulse');target();run('target.enemyType="shieldPolice";target.shieldHp=1;target.shieldMaxHp=100;player.skills.burn=1;player.skills.freeze=1;player.skills.shock=1;player.skills.corrosion=1;player.skills.knock=1;player.skills.blast=1;globalThis.xy=[target.x,target.y];player.ammo=1;emitProjectiles(0)');assert.equal(run('target.hp'),10000);assert.equal(run('target.shieldHp'),0);assert.equal(run('target.burnTime||0'),0);assert.equal(run('target.slowTime||0'),0);assert.equal(run('target.corrosion'),undefined);assert.deepEqual(read('[target.x,target.y]'),read('xy'));
});
check('global damage and ordinary loot remain, manual kill-ammo/salvage counters excluded',()=>{
 setup();install('integrityPulse');target(1);run('player.skills.killAmmo=1;player.ammoKills=9;player.skills.salvage=1;player.killCounter=19;player.hp=50;player.ammo=1;emitProjectiles(0)');assert.equal(run('kills'),1);assert.equal(run('gems.length'),1);assert.equal(run('scrap.length'),1);assert.equal(run('player.ammoKills'),9);assert.equal(run('player.killCounter'),19);assert.equal(run('player.hp'),50);
 setup();install('integrityPulse');target(100);run('target.hp=30;player.skills.finisher=1;player.ammo=1;emitProjectiles(0)');assert.equal(run('target.hp'),0,'central finisher applies');
});
check('boss pulse kill awards once; removed minions are not independent pulse kills',()=>{
 setup();install('integrityPulse');run('bossIndex=0;spawnBoss();boss.x=player.x+50;boss.y=player.y;boss.hp=1;globalThis.parts=profile.bossParts.brute;globalThis.minions=enemies.slice();for(const z of enemies){z.hp=z.maxHp=1000;}player.ammo=1;emitProjectiles(0)');assert.equal(run('bossKills'),1);assert.equal(run('bossChests.length'),1);assert.equal(run('profile.bossParts.brute'),run('parts')+1);assert.equal(run('kills'),0);run('emitIntegrityPulse(primaryWeaponState())');assert.equal(run('bossChests.length'),1);
});
check('pulse is blocked in pause/offers/death and numeric clamps are finite',()=>{
 setup();install('integrityPulse');target();for(const phase of ['paused','relic','upgrade','over']){context.phase=phase;run('state=phase;emitIntegrityPulse(primaryWeaponState())');assert.equal(run('target.hp'),10000)}run('state="playing";player.maxHp=Number.MAX_VALUE');near(run('integrityPulseDamage()'),2e8,'technical maxHP bound');run('player.maxHp=NaN');assert.equal(run('integrityPulseDamage()'),0);
});
check('render/HUD is pure, world ticks freeze in pause, death/reset do not save pieces',()=>{
 setup('machine',[],'swarm');install('vitalLink');install('integrityPulse');run('player.ammo=1;emitProjectiles(0);pause();globalThis.before=JSON.stringify({player,weaponSlots,effects,clock});globalThis.rng=Math.random;Math.random=()=>{throw Error("draw RNG")};draw();updateHUD();tick(5);Math.random=rng');assert.equal(run('JSON.stringify({player,weaponSlots,effects,clock})'),run('before'));assert.deepEqual(require('../tools/finite-state.cjs').inspectFiniteState(run('({player,weaponSlots,effects})')).invalid,[]);run('saveProfile()');assert.equal(run('JSON.stringify(profile).includes("vitalLink")||JSON.stringify(profile).includes("integrityPulse")'),false);run('reset()');assert.equal(run('player.relics.size'),0);
});
check('pulse never applies a fresh ballistic status to an unshielded body',()=>{
 setup('flame');install('integrityPulse');target();run('player.skills.burn=1;player.skills.freeze=1;player.skills.corrosion=1;player.skills.shock=1;player.skills.knock=1;player.skills.blast=1;globalThis.xy=[target.x,target.y];player.ammo=1;emitProjectiles(0)');assert.equal(run('target.corrosion'),undefined);assert.equal(run('target.burnTime||0'),0);assert.equal(run('target.slowTime||0'),0);assert.equal(run('target.stunTime||0'),0);assert.deepEqual(read('[target.x,target.y]'),read('xy'));
});
check('source-agnostic death releases only the OLD corrosion capture, two children and one generation',()=>{
 setup();install('integrityPulse');acquire('corrosion');acquire('corrosionBloom');target(1,40);run('globalThis.children=[120,130,140].map(x=>Object.assign(createEnemy(player.x+x,player.y),{r:1,hp:1000,maxHp:1000}));enemies.push(...children);applyCorrosion(target,{damage:80,weapon:runWeapon});globalThis.oldDamage=target.corrosion.damage;player.maxHp=1000;player.hp=100;player.ammo=1;emitProjectiles(0)');near(run('children[0].corrosion.damage'),run('oldDamage*.5'),'old reagent snapshot, not pulse200');near(run('children[1].corrosion.damage'),run('oldDamage*.5'),'second child');assert.equal(run('children[2].corrosion'),undefined);assert.equal(run('children[0].corrosion.spread'),false);run('damageEnemy(children[0],1e6,"integrityPulse")');assert.equal(run('children[2].corrosion'),undefined,'transferred charge never propagates again');
});
const result={kind:'synthetic-vital-conversion-fixtures',at:new Date().toISOString(),gameSha256:crypto.createHash('sha256').update(fs.readFileSync('game.js')).digest('hex'),checks,passed:checks.filter(x=>x.status==='passed').length,failed:checks.filter(x=>x.status==='failed').length};fs.mkdirSync('outputs/vital-engine65',{recursive:true});fs.writeFileSync('outputs/vital-engine65/result.json',JSON.stringify(result,null,2));for(const c of checks){console.log(c.status.toUpperCase()+': '+c.name);if(c.error)console.error(c.error)}if(result.failed)process.exitCode=1;
