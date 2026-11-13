'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const prefix=fs.readFileSync('tests/combat.cjs','utf8').split('assert.match(')[0],{run,window}=new Function('require',prefix+';return {run:s=>vm.runInContext(s,context),window};')(require),events=[];
window.ScrewAudio={play:name=>events.push(name),setScene(){},update(){},unlock(){return Promise.resolve(true)}};
function fresh(weapon='machine'){run(`profile=emptyProfile();selectedRobot='prot';selectedWeapon=${JSON.stringify(weapon)};selectedAuxWeapons=[];reset();spawn=1e6;bossIndex=1e6;player.relics.add('integrityPulse');`);events.length=0;}
fresh();run('player.ammo=2;emitProjectiles(0)');assert.equal(events.filter(s=>s==='integrityPulse').length,0);events.length=0;run('emitProjectiles(0)');assert.equal(events.filter(s=>s==='integrityPulse').length,1);assert.ok(events.indexOf('integrityPulse')<events.indexOf('reload'),'pulse cue precedes auto-reload');
fresh('shotgun');run('player.ammo=1;emitProjectiles(0)');assert.equal(events.filter(s=>s==='integrityPulse').length,1,'five pellets do not multiply cue');
fresh();run('player.ammo=1;startReload()');assert.equal(events.filter(s=>s==='integrityPulse').length,0);events.length=0;run('tickWeaponReload(primaryWeaponState(),player.reloadTime)');assert.equal(events.filter(s=>s==='integrityPulse').length,0,'reload completion does not cue pulse');
fresh();run('player.ammo=1;bullets=Array.from({length:400},()=>({life:1}));emitProjectiles(0)');assert.deepEqual(events,[],'rejected output is silent');
fresh();run('state="paused";emitIntegrityPulse(primaryWeaponState())');assert.deepEqual(events,[]);run('state="playing";player.hp=0;emitIntegrityPulse(primaryWeaponState())');assert.deepEqual(events,[]);
fresh();run('player.skills.drones=1;player.relics.add("vitalLink");enemies=[Object.assign(createEnemy(player.x+40,player.y),{hp:1e6,maxHp:1e6})];player.droneTimer=0;tickDrones(.01)');assert.deepEqual(events,['drone'],'vital link keeps one existing drone cue, without repair/pulse voice');events.length=0;run('state="over";player.hp=0;player.droneTimer=0;tickDrones(.01)');assert.deepEqual(events,[],'dead drone phase produces no sound');
console.log('Vital audio gameplay passed:last real cart only,one cue per emission,pellet/reload/refusal isolation,ordered auto-reload,old drone cue and silence after death/pause.');
