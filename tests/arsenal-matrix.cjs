'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const source=Object.fromEntries(['game.js','balance.js'].map(f=>[f,fs.readFileSync(f,'utf8')])),hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const prefix=fs.readFileSync('tests/combat.cjs','utf8').split('assert.match(')[0].replace('Math,Set,localStorage','Math:Object.create(Math),Set,localStorage').replace("vm.runInContext(fs.readFileSync('game.js','utf8'),context);","window.localStorage=localStorage;vm.runInContext(source['balance.js'],context);vm.runInContext(source['game.js'],context);");
const {context}=new Function('require','source',prefix+';return {context};')(require,source),run=s=>vm.runInContext(s,context);
run("profile=emptyProfile();profile.unlockedWeapons=Object.fromEntries(Object.keys(WEAPONS).map(id=>[id,true]));profile.unlockedRobots=Object.fromEntries(Object.keys(ROBOTS).map(id=>[id,true]));updateHUD=()=>{};");
const ids=Array.from(run('Object.keys(WEAPONS)')),cases=[];
function check(weapons){
 context.matrixWeapons=weapons;
 run(`globalThis.matrixSeed=20261103;Math.random=()=>{matrixSeed=(Math.imul(matrixSeed,1664525)+1013904223)>>>0;return matrixSeed/4294967296;};
 selectedRobot=matrixWeapons.length===2?'bastion':'swarm';selectedWeapon=matrixWeapons[0];selectedAuxWeapons=matrixWeapons.slice(1);reset();spawn=1e9;bossIndex=1e6;player.inv=1e9;
 enemies=Array.from({length:8},(_,i)=>{const angle=i*Math.PI/4,z=createEnemy(player.x+Math.cos(angle)*180,player.y+Math.sin(angle)*180);z.hp=z.maxHp=1e6;z.speed=0;return z;});
 SKILLS.find(s=>s.id==='rate').apply();SKILLS.find(s=>s.id==='extra').apply();SKILLS.find(s=>s.id==='shock').apply();SKILLS.find(s=>s.id==='blast').apply();
 aim={x:player.x+180-camera.x,y:player.y-camera.y,active:true};firing=true;for(let step=0;step<12;step++)tick(.05);
 `);
 assert.deepEqual(Array.from(run('weaponSlots.map(s=>s.weapon.id)')),weapons);
 assert.equal(run('weaponSlots.every(s=>s.shotCount>0)'),true,weapons.join('/')+' every weapon emits');
 assert.equal(run('weaponSlots.every(s=>s.ammo>=0&&s.ammo<=magazineSize(s)&&s.reloadTime>=0&&s.bursts.length<=4&&[s.damage,s.rate,s.cooldown,s.reloadTime,s.ammo].every(Number.isFinite))'),true,weapons.join('/')+' local finite state');
 assert.equal(run('bullets.length<=400&&enemies.every(z=>[z.x,z.y,z.hp].every(Number.isFinite))'),true);
 const snapshot=run('JSON.stringify({weapons:weaponSlots.map(s=>({id:s.weapon.id,ammo:s.ammo,shots:s.shotCount,reload:s.reloadTime})),seed:matrixSeed,kills,bullets:bullets.length})');
 cases.push({weapons,steps:12,stateHash:hash(snapshot),passed:true});
}
for(const primary of ids)for(const second of ids)if(second!==primary)check([primary,second]);
for(const primary of ids)for(const second of ids)if(second!==primary)for(const third of ids)if(third!==primary&&third!==second)check([primary,second,third]);
assert.equal(cases.length,1452);
const report={kind:'ordered-weapon-combination-runtime-smoke',sourceHashes:Object.fromEntries(Object.entries(source).map(([f,s])=>[f,hash(s)])),driverHash:hash(fs.readFileSync(__filename)),count:cases.length,dual:132,triple:1320,dt:.05,secondsPerCase:.6,note:'Every ordered distinct pair/triple of the12 weapons. Explicit common modules and eight stationary high-HP targets; immunity and wave/boss suppression retain each fixture. Checks manual emission, ownership-independent runtime state, finite ammo/reloads, all weapons firing and shared projectile budget. Short smoke, not full encounter coverage, balance or natural progression.',cases};
fs.writeFileSync(process.env.ARSENAL_MATRIX_REPORT||'docs/build51-arsenal-matrix.json',JSON.stringify(report,null,2)+'\n');
console.log('Arsenal matrix:132 ordered pairs and1320 ordered triples emitted every weapon with finite independent state and a shared400-projectile budget.');
