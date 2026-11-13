'use strict';
// Synthetic integration fixtures. No natural survival, balance or hardware acceptance.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const model=require('../tools/maintenance-reserve.js');
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const sources=['game.js','balance.js','tools/maintenance-reserve.js'];
const startHashes=Object.fromEntries(sources.map(file=>[file,hash(file)]));
let prefix=fs.readFileSync('tests/combat.cjs','utf8').split('assert.match(')[0].replace('Math,Set,localStorage','Math:Object.create(Math),Set,localStorage');
function harness(balance=false){
 let src=prefix;
 if(balance)src=src.replace("vm.runInContext(fs.readFileSync('game.js','utf8'),context);","window.localStorage=localStorage;vm.runInContext(fs.readFileSync('balance.js','utf8'),context);vm.runInContext(fs.readFileSync('game.js','utf8'),context);");
 const h=new Function('require',src+';return {context,elements,listeners,storage};')(require);
 h.run=s=>vm.runInContext(s,h.context);h.read=s=>JSON.parse(h.run('JSON.stringify('+s+')'));return h;
}
const h=harness(),run=h.run,read=h.read,cases=[];
const near=(a,b,label='numeric equality')=>assert.ok(Math.abs(a-b)<1e-8,`${label}: ${a} vs ${b}`);
function check(id,name,fn){try{fn();cases.push({id,name,status:'passed'});}catch(e){cases.push({id,name,status:'failed',error:e.stack});}}
function setup(robot='prot',weapon='machine',aux=[]){h.context.chassis=robot;h.context.gun=weapon;h.context.aux=aux;run(`profile=emptyProfile();profile.unlockedRobots=Object.fromEntries(Object.keys(ROBOTS).map(id=>[id,true]));profile.unlockedWeapons=Object.fromEntries(Object.keys(WEAPONS).map(id=>[id,true]));selectedRobot=chassis;selectedWeapon=gun;selectedAuxWeapons=aux.slice();reset();spawn=1e9;bossIndex=1e6;player.inv=0;aim={x:player.x+100-camera.x,y:player.y-camera.y,active:true};`);}
function acquire(id,world=h){world.context.moduleId=id;assert.equal(world.run('SKILLS.find(s=>s.id===moduleId).apply()'),true,id+' acquisition');}
function bank(){acquire('reserveBank');}
function damage(n,source='contact'){h.context.amount=n;h.context.source=source;run('hurtPlayer(amount,player.x-100,player.y,source)');}
function pulseSetup(){setup();bank();acquire('sensor');acquire('pulseRecovery');run('player.reserveBank.value=0;player.skills.shield=1;player.shieldReady=false;player.shieldTimer=100;');}
function targets(n,hp=1){h.context.count=n;h.context.targetHp=hp;run(`enemies=Array.from({length:count},(_,i)=>({x:player.x+50+i*.1,y:player.y,r:10,hp:targetHp,maxHp:targetHp,speed:0,enemyType:'chaser'}));`);}
check('RES01','root acquisition preserves active reload/HP/ammo, costs once and does not grant children',()=>{
 setup();run('player.hp=50;player.ammo=3;startReload();globalThis.before={time:player.reloadTime,total:player.reloadTotal,ammo:player.ammo,mult:player.reloadMult};');bank();
 assert.deepEqual(read('player.reserveBank'),{value:20,max:40});assert.equal(run('player.hp'),50);near(run('player.reloadMult'),run('before.mult*1.1'));assert.equal(run('player.ammo'),3);near(run('player.reloadTime'),run('before.time'));near(run('player.reloadTotal'),run('before.total'));
 assert.equal(run('SKILLS.find(s=>s.id==="reserveBank").apply()'),false);near(run('player.reloadMult'),run('before.mult*1.1'));assert.equal(run('player.skills.cleanCircuit'),undefined);
});
check('RES02','fallback and configured multiple prerequisites are real, not a single-parent substitute',()=>{
 for(const world of [h,harness(true)]){
  world.run(`profile=emptyProfile();selectedRobot='prot';selectedWeapon='machine';selectedAuxWeapons=[];reset();`);
  assert.equal(world.run('normalSkillAvailable("shieldDrive","reserveBank")'),false);assert.equal(world.run('normalSkillAvailable("pulseRecovery","reserveBank")'),false);
  acquire('reserveBank',world);assert.equal(world.run('normalSkillAvailable("shieldDrive","reserveBank")'),false);assert.equal(world.run('normalSkillAvailable("pulseRecovery","reserveBank")'),false);assert.equal(world.run('normalSkillAvailable("cleanCircuit","reserveBank")'),true);
  acquire('shield',world);assert.equal(world.run('normalSkillAvailable("shieldDrive","reserveBank")'),true);acquire('sensor',world);assert.equal(world.run('normalSkillAvailable("pulseRecovery","reserveBank")'),true);
 }
});
check('RES03','reserve absorbs mitigated damage; excess crosses into HP; accepted hits push48px',()=>{
 setup();bank();run('globalThis.x0=player.x');damage(12);assert.deepEqual(read('[player.reserveBank.value,player.hp]'),[8,100]);near(run('player.x-x0'),48);near(run('player.inv'),.65);
 run('player.inv=0');damage(12);assert.deepEqual(read('[player.reserveBank.value,player.hp]'),[0,96]);near(run('player.x-x0'),96);
 setup();bank();damage(50);assert.deepEqual(read('[player.reserveBank.value,player.hp]'),[0,70]);
});
check('RES04','Grounding, armor and repair plating mitigate exactly once before reserve; minimum1',()=>{
 setup();bank();run('player.armor=2;player.repairArmorTime=2;player.specialization="grounding"');damage(20,'boss-hazard');near(run('player.reserveBank.value'),10);assert.equal(run('player.hp'),100);
 run('player.inv=0');damage(20,'contact');near(run('player.reserveBank.value'),0);near(run('player.hp'),94);
 setup();bank();run('player.armor=999');damage(1);near(run('player.reserveBank.value'),19);
});
check('RES05','capacitive shield retains whole-hit exception and resets maintenance without spending reserve',()=>{
 setup();bank();acquire('shield');acquire('cleanCircuit');run('player.cleanCircuitElapsed=30;globalThis.x0=player.x');damage(10000);
 assert.deepEqual(read('[player.shieldReady,player.shieldTimer,player.reserveBank.value,player.hp,player.cleanCircuitElapsed]'),[false,120,20,100,0]);near(run('player.inv'),.25);near(run('player.x'),run('x0'));
});
check('RES06','invulnerability, phases, dead state and invalid amounts do not consume/reset',()=>{
 for(const phase of ['playing','paused','upgrade','relic','over']){setup();bank();acquire('cleanCircuit');run(`player.cleanCircuitElapsed=30;state=${JSON.stringify(phase)};player.inv=${phase==='playing'?1:0};globalThis.before=JSON.stringify({hp:player.hp,bank:player.reserveBank,clean:player.cleanCircuitElapsed,x:player.x,inv:player.inv});`);damage(10);assert.equal(run('JSON.stringify({hp:player.hp,bank:player.reserveBank,clean:player.cleanCircuitElapsed,x:player.x,inv:player.inv})'),run('before'));}
 for(const n of [0,-1,NaN,Infinity,-Infinity]){setup();bank();acquire('cleanCircuit');run('player.cleanCircuitElapsed=30');damage(n);assert.deepEqual(read('[player.hp,player.reserveBank.value,player.cleanCircuitElapsed]'),[100,20,30]);}
 setup();bank();run('player.hp=0');damage(10);assert.equal(run('player.reserveBank.value'),20);
});
check('RES07','full reserve absorption never triggers HP reactions; spillover does; lethal hit cleans state',()=>{
 setup();bank();for(const id of ['emergency','retaliation','overload'])acquire(id);run('player.specialization="tailDecoy";globalThis.before=player.hp');damage(10);
 assert.equal(run('player.hp'),run('before'));assert.deepEqual(read('player.hitCooldowns'),{emergency:0,retaliation:0,overload:0});assert.equal(run('player.frenzy'),0);assert.equal(run('player.decoy'),null);near(run('player.inv'),.65);
 run('player.reserveBank.value=0;player.inv=0');damage(10);assert.equal(run('player.hitCooldowns.emergency'),120);assert.equal(run('player.hitCooldowns.retaliation'),120);assert.equal(run('player.hitCooldowns.overload'),120);assert.equal(run('player.frenzy'),6);assert.ok(run('!!player.decoy'));near(run('player.inv'),3);
 setup();bank();acquire('cleanCircuit');run('player.hp=5;player.reserveBank.value=1');damage(100);assert.equal(run('state'),'over');assert.equal(run('player.hp'),0);assert.equal(run('player.reserveBank'),undefined);assert.equal(run('player.cleanCircuitElapsed'),0);assert.equal(run('healPlayer(100)'),0);
});
check('RES08','healing returns HP-only amount and excess converts50%, including fractional values',()=>{
 for(const [hp,value,amount] of [[95,20,10],[100,20,10],[99.5,39.9,1],[50,0,10],[100,0,Number.MAX_VALUE]]){
  setup();bank();h.context.values={hp,value,amount};run('player.hp=values.hp;player.reserveBank.value=values.value;globalThis.result=healPlayer(values.amount)');const expected=model.heal(hp,100,amount,value);near(run('player.hp'),expected.hp);near(run('result'),expected.actual);near(run('player.reserveBank.value'),expected.value);
 }
});
check('RES09','reserve gain never activates repair specialization; real HP healing does',()=>{
 for(const spec of ['repairCharge','repairPlating']){setup();bank();run(`player.specialization=${JSON.stringify(spec)};player.reserveBank.value=0;healPlayer(10)`);assert.equal(run('player.repairShotReady'),false);assert.equal(run('player.repairArmorTime'),0);assert.equal(run('player.reserveBank.value'),5);run('player.hp=95;healPlayer(10)');if(spec==='repairCharge')assert.equal(run('player.repairShotReady'),true);else assert.equal(run('player.repairArmorTime'),2);}
});
check('RES10','invalid healing/addition cannot corrupt state or resurrect; max HP changes do not scale bank',()=>{
 setup();bank();for(const amount of [0,-2,NaN,Infinity,-Infinity]){h.context.bad=amount;assert.equal(run('healPlayer(bad)'),0);assert.equal(run('addReserve(bad)'),0);}assert.deepEqual(read('player.reserveBank'),{value:20,max:40});
 acquire('titan');assert.deepEqual(read('player.reserveBank'),{value:20,max:40});acquire('speed');assert.deepEqual(read('player.reserveBank'),{value:20,max:40});
 run('player.hp=0');assert.equal(run('addReserve(100)'),0);assert.equal(run('healPlayer(100)'),0);assert.equal(run('player.hp'),0);
});
check('RES11','shield bonus is dynamic, repeatable without accumulation and absent for reserve alone',()=>{
 setup();bank();acquire('shieldDrive');run('globalThis.base=shotDamage()');assert.equal(run('maintenanceFactor()'),1);acquire('shield');near(run('shotDamage()'),run('base*1.2'));damage(10);near(run('shotDamage()'),run('base'));
 for(let i=0;i<5;i++){run('player.shieldReady=true');near(run('shotDamage()'),run('base*1.2'));run('player.shieldReady=false');near(run('shotDamage()'),run('base'));}
});
check('RES12','maintenance thresholds, finite cap and partitioned active time agree with independent model',()=>{
 for(const elapsed of [0,14.999,15,29.999,30]){setup();bank();acquire('cleanCircuit');h.context.elapsed=elapsed;run('tickStatuses(elapsed)');near(run('player.cleanCircuitElapsed'),elapsed);near(run('maintenanceFactor()'),model.offense(elapsed,false).factor);}
 setup();bank();acquire('cleanCircuit');for(let i=0;i<100;i++)run('tickStatuses(.3)');near(run('player.cleanCircuitElapsed'),30);run('tickStatuses(Number.MAX_VALUE)');assert.equal(run('player.cleanCircuitElapsed'),30);assert.equal(run('Number.isFinite(player.cleanCircuitElapsed)'),true);
});
check('RES13','accepted shield/reserve impacts reset maintenance; ignored repeated hits do not',()=>{
 setup();bank();acquire('cleanCircuit');run('player.cleanCircuitElapsed=30');damage(1);assert.equal(run('player.cleanCircuitElapsed'),0);run('player.cleanCircuitElapsed=15');damage(1);assert.equal(run('player.cleanCircuitElapsed'),15);run('player.inv=0');damage(1);assert.equal(run('player.cleanCircuitElapsed'),0);
});
check('RES14','one robot factor composes once per slot with Titan and preserves old emitted projectile',()=>{
 setup('swarm','machine',['shotgun','rocket']);bank();acquire('armor');acquire('titan');acquire('shield');acquire('shieldDrive');acquire('cleanCircuit');run('player.cleanCircuitElapsed=30;globalThis.raw=weaponSlots.map(s=>s.damage+Math.min(s.damage*.75,player.maxHp*.03))');
 for(let i=0;i<3;i++)near(run(`shotDamage(weaponSlots[${i}])`),run(`raw[${i}]*1.44`));
 run('firing=true;emitProjectiles(0,primaryWeaponState());globalThis.old=bullets[0];globalThis.oldDamage=old.damage;player.inv=0');damage(1);assert.equal(run('old.damage'),run('oldDamage'));near(run('maintenanceFactor()'),1);
});
check('RES15','blade/matrix snapshots capture factors once; support damage stays on prior base',()=>{
 setup();bank();acquire('shield');acquire('shieldDrive');acquire('cleanCircuit');run('player.cleanCircuitElapsed=30;player.relics.add("reloadBlade");player.relics.add("rivetMatrix");player.ammo=0;globalThis.p=shotDamage();startReload();deployRivetMatrix();globalThis.bladeP=primaryWeaponState().reloadBlade.baseDamage;globalThis.matrixP=player.rivetMatrix.p;');near(run('bladeP'),run('p'));near(run('matrixP'),run('p'));damage(1);near(run('primaryWeaponState().reloadBlade.baseDamage'),run('bladeP'));near(run('player.rivetMatrix.p'),run('matrixP'));
 setup();bank();acquire('sensor');acquire('drones');acquire('rotors');run('globalThis.raw=player.damage;globalThis.r0=rotorDamage();');acquire('shield');acquire('shieldDrive');acquire('cleanCircuit');run('player.cleanCircuitElapsed=30');near(run('rotorDamage()'),run('r0'));near(run('player.damage'),run('raw'));
 targets(1,10000);run('tickSensor(3)');near(run('10000-enemies[0].hp'),run('raw*.35*player.sensorDamageMult'));
 targets(1,10000);run('tickDrones(1)');near(run('10000-enemies[0].hp'),run('raw*.25*player.droneDamageMult'));
});
check('RES16','actual pulses credit0/1/3/10direct kills, capped independently of damage target count',()=>{
 for(const n of [0,1,3,10]){pulseSetup();targets(n);run('tickSensor(3)');const expected=model.pulse(0,n,100,false);near(run('player.reserveBank.value'),expected.value);near(run('player.shieldTimer'),expected.shieldTimer);assert.equal(run('kills'),n);assert.equal(run('enemies.filter(z=>z.hp>0).length'),0);}
});
check('RES17','shield break, delayed transmitted burn and other sources never earn direct-pulse credit',()=>{
 pulseSetup();run('globalThis.z=createEnemy(player.x+50,player.y,"shieldPolice");z.hp=z.maxHp=1;z.shieldHp=1;enemies=[z];tickSensor(3)');assert.equal(run('z.hp'),1);assert.equal(run('player.reserveBank.value'),0);assert.equal(run('player.shieldTimer'),100);
 for(const source of ['burn','electric','corrosion','drone','rotor','matrix','reloadBlade','bullet','explosion']){pulseSetup();targets(1);h.context.source=source;run('damageEnemy(enemies[0],2,source)');assert.equal(run('player.reserveBank.value'),0);assert.equal(run('player.shieldTimer'),100);}
 pulseSetup();acquire('sensorRelay');acquire('burn');targets(1,10);run('tickSensor(3);globalThis.afterPulse=player.reserveBank.value;enemies[0].burnTime=1;enemies[0].burnDps=100;tickStatuses(1)');assert.equal(run('enemies[0].hp'),0);assert.equal(run('player.reserveBank.value'),run('afterPulse'));near(run('player.shieldTimer'),99);
});
check('RES18','boss killed by sensor earns one credit and one reward, removed minions earn none',()=>{
 // Enemies precede boss in targets(): these minions must survive their own pulse hit
 // to exercise removal-by-boss rather than legitimate earlier direct sensor kills.
 pulseSetup();run('player.reserveBank.value=0;globalThis.z={x:player.x+50,y:player.y,r:35,hp:1,maxHp:1,speed:0,id:"brute",name:"fixture"};boss=z;enemies=Array.from({length:5},()=>({x:player.x+60,y:player.y,r:10,hp:1000,maxHp:1000,speed:0,minionOwner:"brute"}));globalThis.parts0=profile.bossParts.brute;tickSensor(3);');
 assert.equal(run('bossKills'),1);assert.equal(run('bossChests.length'),1);assert.equal(run('profile.bossParts.brute'),run('parts0+1'));assert.equal(run('kills'),0);assert.equal(run('enemies.length'),0);assert.equal(run('player.reserveBank.value'),4,'direct kill credit before scheduled boss repair');near(run('player.shieldTimer'),92);
 run('tick(.001)');assert.equal(run('player.reserveBank.value'),14,'10overheal+4direct kill after ordinary boss reward phase');
 run('damageEnemy(z,10,"sensor");tickSensor(3)');assert.equal(run('bossKills'),1);assert.equal(run('bossChests.length'),1);assert.equal(run('player.reserveBank.value'),14);
});
check('RES19','pulse restores depleted shield immediately, no banked timer credit when ready',()=>{
 pulseSetup();acquire('shieldDrive');run('player.shieldTimer=7');targets(1);run('tickSensor(3)');assert.equal(run('player.shieldReady'),true);assert.equal(run('player.shieldTimer'),0);near(run('maintenanceFactor()'),1.2);
 run('player.reserveBank.value=40');targets(10);run('tickSensor(3)');assert.equal(run('player.reserveBank.value'),40);assert.equal(run('player.shieldTimer'),0);run('player.inv=0');damage(1);assert.equal(run('player.shieldTimer'),120);
});
check('RES20','large sensor dt gives one pulse, repeated dead targets and inactive phases give no reward',()=>{
 pulseSetup();targets(4);run('tickSensor(1000)');assert.equal(run('player.reserveBank.value'),12);near(run('player.shieldTimer'),76);run('tickSensor(.01)');assert.equal(run('player.reserveBank.value'),12);
 for(const phase of ['paused','upgrade','over','garage']){pulseSetup();targets(1);run(`state=${JSON.stringify(phase)};tickSensor(100)`);assert.equal(run('enemies[0].hp'),1);assert.equal(run('player.reserveBank.value'),0);near(run('player.shieldTimer'),100);}
});
check('RES21','pause freezes timers, acquisition has no retroactive time and reset/profile isolate state',()=>{
 setup();run('tick(100)');bank();acquire('cleanCircuit');assert.equal(run('player.cleanCircuitElapsed'),0);run('tick(.5);pause();globalThis.frozen=JSON.stringify({clock,player,weaponSlots});tick(99);');assert.equal(run('JSON.stringify({clock,player,weaponSlots})'),run('frozen'));run('pause()');assert.equal(run('firing'),false);
 const profile=run('JSON.stringify(profile)');run('openGarage()');assert.equal(run('player.reserveBank'),undefined);assert.equal(run('player.cleanCircuitElapsed'),0);run('reset()');assert.equal(run('player.reserveBank'),undefined);assert.equal(run('player.skills.cleanCircuit'),undefined);assert.equal(run('player.acquired.has("reserveBank")'),false);assert.equal(run('JSON.stringify(profile)'),profile);
});
check('RES22','one bank and timer for three weapons; cost applies locally without restoring ammunition',()=>{
 setup('swarm','machine',['shotgun','rocket']);run('for(const s of weaponSlots)s.ammo=0;globalThis.before=weaponSlots.map(s=>s.reloadMult)');bank();for(let i=0;i<3;i++)near(run(`weaponSlots[${i}].reloadMult`),run(`before[${i}]*1.1`));assert.deepEqual(read('weaponSlots.map(s=>s.ammo)'),[0,0,0]);acquire('cleanCircuit');run('tickStatuses(15)');near(run('player.cleanCircuitElapsed'),15);assert.equal(run('weaponSlots.some(s=>s.reserveBank!==undefined)'),false);
});
check('RES23','independent arithmetic oracle: exact examples, caps and invalid guards',()=>{
 assert.deepEqual(model.absorb(20,12),{value:8,spent:12,hpDamage:0});assert.deepEqual(model.absorb(8,12),{value:0,spent:8,hpDamage:4});assert.deepEqual(model.heal(95,100,10,20),{hp:100,actual:5,excess:5,value:22.5,gain:2.5});assert.equal(model.advance(29,Number.MAX_VALUE),30);near(model.offense(30,true).factor,1.44);assert.deepEqual(model.pulse(0,10,7,false),{value:12,gain:12,credited:3,shieldTimer:0,shieldReady:true});
 for(const bad of [NaN,Infinity,-Infinity,-1]){assert.equal(model.add(20,bad),null);assert.equal(model.absorb(20,bad),null);assert.equal(model.advance(20,bad),null);}assert.equal(model.pulse(0,1.5,10,false),null);
});
check('RES24','draw stays pure and finite state is checked before JSON can hide invalid numbers',()=>{
 setup();bank();acquire('cleanCircuit');acquire('shield');acquire('shieldDrive');run('player.cleanCircuitElapsed=30;globalThis.before=JSON.stringify({player,weaponSlots,clock});globalThis.rng=Math.random;Math.random=()=>{throw Error("render RNG")};draw();Math.random=rng;');assert.equal(run('JSON.stringify({player,weaponSlots,clock})'),run('before'));
 const inspect=require('../tools/finite-state.cjs').inspectFiniteState;const result=inspect(run('({player,weaponSlots,enemies,boss,bullets,clock})'));assert.deepEqual(result.invalid,[]);
});
const endHashes=Object.fromEntries(sources.map(file=>[file,hash(file)])),sourceChanges=sources.filter(file=>startHashes[file]!==endHashes[file]);
const result={kind:'synthetic-gameplay-fixtures',natural:false,hardware:false,date:new Date().toISOString(),node:process.version,startHashes,endHashes,sourceChanges,cases,passed:cases.filter(x=>x.status==='passed').length,failed:cases.filter(x=>x.status==='failed').length,limitations:['No migration execution; dedicated catalogue migration suite required.','No browser/layout/audio signal validation.','No natural balance or long-run/hardware acceptance.']};
fs.mkdirSync('outputs/maintenance-gameplay63',{recursive:true});fs.writeFileSync('outputs/maintenance-gameplay63/result.json',JSON.stringify(result,null,2));for(const c of cases){console.log(c.status.toUpperCase()+': '+c.id+' '+c.name);if(c.error)console.error(c.error);}console.log(`Maintenance gameplay: ${result.passed} passed, ${result.failed} failed; source changes ${sourceChanges.length}`);if(result.failed||sourceChanges.length)process.exitCode=1;
