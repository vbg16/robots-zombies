'use strict';
// Reproduce death inside enemy contact, before the drone phase of that same tick.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const prefix=fs.readFileSync('tests/combat.cjs','utf8').split('assert.match(')[0],{context}=new Function('require',prefix+';return {context};')(require),run=s=>vm.runInContext(s,context);
run(`profile=emptyProfile();profile.unlockedRobots.swarm=true;selectedRobot='swarm';selectedWeapon='machine';selectedAuxWeapons=[];reset();spawn=1e6;bossIndex=1e6;player.hp=1;player.inv=0;player.droneTimer=0;enemies=[Object.assign(createEnemy(player.x,player.y),{hp:1,maxHp:1,speed:0})];tick(.01)`);
const result=JSON.parse(run('JSON.stringify({state,hp:player.hp,kills,enemyHp:enemies[0]?.hp,gems:gems.length,droneTimer:player.droneTimer})'));result.gameSha256=crypto.createHash('sha256').update(fs.readFileSync('game.js')).digest('hex');
fs.mkdirSync('outputs/drone-death65',{recursive:true});fs.writeFileSync('outputs/drone-death65/result.json',JSON.stringify(result,null,2));
assert.equal(result.state,'over');assert.equal(result.hp,0);assert.equal(result.kills,0,'a dead player must not execute the later drone attack of the same tick');assert.equal(result.enemyHp,1);assert.equal(result.gems,0);
// Public helper must also honor pause, offers, death and zero HP.
for(const state of ['paused','upgrade','relic','over']){context.phase=state;run('state=phase;player.droneTimer=0;tickDrones(1)');assert.equal(run('enemies[0].hp'),1)}
run(`profile=emptyProfile();profile.bolts=17;profile.bossParts.brute=2;selectedRobot='prot';selectedWeapon='machine';selectedAuxWeapons=[];reset();spawn=1e6;bossIndex=1e6;player.hp=1;player.inv=0;enemies=[Object.assign(createEnemy(player.x,player.y),{hp:1000,maxHp:1000,speed:0})];gems=[{x:player.x+48,y:player.y}];scrap=[{x:player.x+48,y:player.y,value:1,life:60}];tick(.01)`);
const loot=JSON.parse(run('JSON.stringify({state,hp:player.hp,xp,bolts:profile.bolts,parts:profile.bossParts.brute,gems:gems.length,scrap:scrap.length})'));fs.writeFileSync('outputs/drone-death65/loot-result.json',JSON.stringify(loot,null,2));
assert.equal(loot.state,'over');assert.equal(loot.xp,0,'death knockback must not collect XP in the later loot phase');assert.equal(loot.bolts,17,'preserve collected bolts, without new collection after death');assert.equal(loot.parts,2,'preserve previously earned boss parts');assert.equal(loot.gems,1);assert.equal(loot.scrap,1);
console.log('Drone death-phase regression passed: no support attack/reward or loot collection after contact death; inactive phases frozen.');
