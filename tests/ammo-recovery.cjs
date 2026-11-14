'use strict';
// Paired regression of the two real recovery paths against published BUILD65.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const fixture=JSON.parse(fs.readFileSync('tests/fixtures/game-build65.json','utf8')),baseline=fixture.source;
assert.equal(fixture.commit,'03a77f7772a4569ef0f4ce54ec993752ca494d21');assert.equal(crypto.createHash('sha256').update(baseline).digest('hex'),fixture.sha256,'published65 fixture retains exact bytes');
const prefix=fs.readFileSync('tests/combat.cjs','utf8').split('assert.match(')[0].replace('Math,Set,localStorage','Math:Object.create(Math),Set,localStorage');
function harness(source){const setup=prefix.replace("vm.runInContext(fs.readFileSync('game.js','utf8'),context);","vm.runInContext(gameSource,context);");const h=new Function('require','gameSource',setup+';return {context};')(require,source);return {context:h.context,run:s=>vm.runInContext(s,h.context)};}
const current=harness(fs.readFileSync('game.js','utf8')),old=harness(baseline),checks=[];
const snapshot="JSON.stringify({ammo:weaponSlots.map(s=>s.ammo),reload:weaponSlots.map(s=>[s.reloadTime,s.reloadTotal,s.reloadMissing,s.reloadCapacity]),hp:player.hp,ammoKills:player.ammoKills,electricHits:player.electricHits,specializationCooldown:player.specializationCooldown,kills,gems,scrap,effects,profile,rngCount})";
function setup(h,gun){h.context.qaGun=gun;h.run("globalThis.rngCount=0;Math.random=()=>{rngCount++;return .5};profile=emptyProfile();profile.unlockedRobots=Object.fromEntries(Object.keys(ROBOTS).map(id=>[id,true]));profile.unlockedWeapons=Object.fromEntries(Object.keys(WEAPONS).map(id=>[id,true]));selectedRobot='swarm';selectedWeapon=qaGun;selectedAuxWeapons=Object.keys(WEAPONS).filter(id=>id!==qaGun).slice(0,2);reset();spawn=1e6;bossIndex=1e6;player.inv=1e6;");}
for(const gun of current.run('Object.keys(WEAPONS)'))for(const slot of [0,1,2])for(const missing of [0,1,2]){
 const script="globalThis.slot=weaponSlots["+slot+"];slot.ammo=Math.max(0,magazineSize(slot)-"+missing+");player.skills.killAmmo=1;player.ammoKills=9;globalThis.z=Object.assign(createEnemy(player.x+100,player.y),{hp:1,maxHp:1});enemies=[z];damageEnemy(z,2,'bullet',{slot:"+slot+"});";
 for(const h of [old,current]){setup(h,gun);h.run(script);}
 assert.equal(current.run(snapshot),old.run(snapshot),gun+':kill:'+slot+':'+missing);
 const electric="player.specialization='chargeRecovery';player.electricHits=5;player.specializationCooldown=0;globalThis.center=Object.assign(createEnemy(player.x+100,player.y),{hp:100,maxHp:100});globalThis.other=Object.assign(createEnemy(player.x+110,player.y),{hp:1,maxHp:1});enemies=[center,other];player.ammoKills=9;shockAt(center,10,1,{slot:"+slot+"});";
 for(const h of [old,current])h.run(electric);
 assert.equal(current.run(snapshot),old.run(snapshot),gun+':electric:'+slot+':'+missing);
 checks.push({gun,slot,missing,passed:true});
}
setup(current,'machine');
assert.equal(current.run('recoverWeaponAmmo(primaryWeaponState(),1)'),0,'full magazine gives no delta');
assert.equal(current.run('player.ammo-=2;recoverWeaponAmmo(primaryWeaponState(),3)'),2,'only actual replacement counts');
assert.equal(current.run('recoverWeaponAmmo({},1)'),0,'stale slot refused');
for(const value of ['NaN','Infinity','-1','0'])assert.equal(current.run('recoverWeaponAmmo(primaryWeaponState(),'+value+')'),0);
const report={kind:'paired-ammo-recovery-without-new-pieces',baselineCommit:'03a77f7772a4569ef0f4ce54ec993752ca494d21',gameSha256:crypto.createHash('sha256').update(fs.readFileSync('game.js')).digest('hex'),cases:checks.length,checks,passed:true};
fs.mkdirSync('outputs/ammo-engine66',{recursive:true});fs.writeFileSync('outputs/ammo-engine66/recovery-baseline.json',JSON.stringify(report,null,2));
console.log('Ammo recovery:108paired12weapon/3slot/full-and-missing cases match BUILD65 for kills/electric/double-event, plus effective-delta guards.');
