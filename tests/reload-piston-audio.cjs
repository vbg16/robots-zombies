'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const prefix=fs.readFileSync('tests/combat.cjs','utf8').split('assert.match(')[0],{run,window}=new Function('require',prefix+';return {run:s=>vm.runInContext(s,context),window};')(require),events=[];
window.ScrewAudio={play:name=>events.push(name),setScene(){},update(){},unlock(){return Promise.resolve(true)}};
function fresh(){run(`profile=emptyProfile();selectedRobot='prot';selectedWeapon='machine';selectedAuxWeapons=[];reset();player.relics.add('reloadPiston');spawn=1e6;bossIndex=1e6;aim={x:player.x+300-camera.x,y:player.y-camera.y,active:true};`);events.length=0;}
fresh();run('player.ammo=0;startReload()');assert.deepEqual(events,['reload']);events.length=0;run('tickWeaponReload(primaryWeaponState(),player.reloadTime)');assert.deepEqual(events,['reloadReady','pistonLaunch']);
events.length=0;assert.equal(run('startReload()'),false);assert.deepEqual(events,[],'invalid full reload has no piston cue');
run('enemies=Array.from({length:3},(_,i)=>Object.assign(createEnemy(player.x+60+i*10,player.y),{hp:10000,maxHp:10000}));tickReloadPiston(primaryWeaponState(),.2)');assert.equal(events.filter(x=>x==='pistonHit').length,1,'three actual hits use one cue per advance');
fresh();run('player.ammo=0;startReload();aim.active=false');events.length=0;run('tickWeaponReload(primaryWeaponState(),player.reloadTime)');assert.deepEqual(events,['reloadReady'],'no valid aim means no launch sound');
fresh();run('player.relics.delete("reloadPiston");player.ammo=0;startReload();player.relics.add("reloadPiston")');events.length=0;run('tickWeaponReload(primaryWeaponState(),player.reloadTime)');assert.deepEqual(events,['reloadReady'],'mid-reload acquisition is silent');
fresh();run('player.ammo=0;startReload();tickWeaponReload(primaryWeaponState(),player.reloadTime)');events.length=0;run('enemies=[];tickReloadPiston(primaryWeaponState(),.6)');assert.deepEqual(events,[],'empty path/expiry is silent');
fresh();run('player.ammo=0;startReload();tickWeaponReload(primaryWeaponState(),player.reloadTime);state="paused"');events.length=0;run('tickReloadPiston(primaryWeaponState(),1)');assert.deepEqual(events,[],'paused entity is silent');
console.log('Piston gameplay audio passed: completion-only launch, no retroactive/invalid cues, one hit cue per advance and silent empty/paused paths. Voice/throttle/mute/RNG covered by audio.cjs.');
