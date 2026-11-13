'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const prefix=fs.readFileSync('tests/combat.cjs','utf8').split('assert.match(')[0];
const {run,window}=new Function('require',prefix+';return {run:s=>vm.runInContext(s,context),window};')(require);
const events=[];window.ScrewAudio={play:name=>events.push(name),setScene(){},update(){},unlock(){return Promise.resolve(true)}};
function fresh(){run(`profile=emptyProfile();selectedRobot='prot';selectedWeapon='machine';selectedAuxWeapons=[];reset();SKILLS.find(s=>s.id==='reserveBank').apply();spawn=1e6;bossIndex=1e6;`);events.length=0;}
fresh();run('hurtPlayer(12,player.x-10,player.y)');assert.deepEqual(events,['reserveHit'],'full bank absorption has no HP hit cue');
fresh();run('player.reserveBank.value=1;hurtPlayer(12,player.x-10,player.y)');assert.deepEqual(events,['hit','reserveHit'],'spillover identifies both losses');
fresh();run(`SKILLS.find(s=>s.id==='shield').apply();hurtPlayer(12,player.x-10,player.y)`);assert.deepEqual(events,['shield'],'one-impact shield consumes no bank');
fresh();assert.equal(run('healPlayer(10)'),0);assert.deepEqual(events,['reserveGain'],'overheal only cues bank, without HP repair');
fresh();run('player.reserveBank.value=40');assert.equal(run('healPlayer(10)'),0);assert.deepEqual(events,[],'full HP and bank remain silent');
fresh();run('player.hp=99');assert.equal(run('healPlayer(10)'),1);assert.deepEqual(events,['repair','reserveGain'],'split HP/excess has distinct actual gains');
fresh();run(`SKILLS.find(s=>s.id==='sensor').apply();SKILLS.find(s=>s.id==='pulseRecovery').apply();player.reserveBank.value=0;player.sensorTimer=0;enemies=Array.from({length:10},(_,i)=>Object.assign(createEnemy(player.x+20+i,player.y),{hp:1,maxHp:1,speed:0}));tickSensor(.01);`);assert.equal(events.filter(s=>s==='reserveGain').length,1,'one bank gain cue per direct-kill pulse');assert.equal(run('player.reserveBank.value'),12);
fresh();run(`SKILLS.find(s=>s.id==='sensor').apply();SKILLS.find(s=>s.id==='pulseRecovery').apply();player.sensorTimer=0;enemies=[];tickSensor(.01)`);assert.deepEqual(events,['sensor'],'zero kills do not cue protection');
fresh();run(`SKILLS.find(s=>s.id==='pulseRecovery').apply();player.reserveBank.value=40;player.skills.shield=1;player.shieldReady=false;player.shieldTimer=2;restoreSensorProtection(1)`);assert.deepEqual(events,['reserveGain'],'restored shield cues once even with full bank');
fresh();run('player.inv=1;hurtPlayer(12,player.x-10,player.y);state="paused";hurtPlayer(12,player.x-10,player.y);restoreSensorProtection(3)');assert.deepEqual(events,[],'blocked damage and inactive pulse remain silent');
console.log('Maintenance audio gameplay passed: actual reserve/HP/shield cues, split healing, capped pulse, zero gain and ignored impacts. Signal/mute/voice limits are covered separately by audio.cjs.');
