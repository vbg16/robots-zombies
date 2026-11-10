const assert=require('node:assert/strict'),fs=require('node:fs');
// Reuse only the DOM/VM fixture, never execute combat.cjs's full regression suite.
const fixture=fs.readFileSync('tests/combat.cjs','utf8').split('assert.match(')[0];
assert.ok(fixture.includes("vm.runInContext(fs.readFileSync('game.js'"),'combat fixture boundary exists');
const {run,window,listeners}=new Function('require',fixture+';return {run:code=>vm.runInContext(code,context),window,listeners};')(require);
const events=[],scenes=[];
window.ScrewAudio={play:name=>events.push(name),setScene:name=>scenes.push(name),update(){},unlock:()=>Promise.resolve(true)};
function fresh(weapon='machine'){
 run('profile=emptyProfile();profileStorageAvailable=true;selectedRobot="prot";selectedWeapon='+JSON.stringify(weapon)+';reset();spawn=100;aim={x:800,y:300,active:true};firing=false;enemies=[];boss=null;hostile=[];hazards=[];');events.length=0;
}
function count(name){return events.filter(e=>e===name).length;}
function expectOnly(name,message){assert.deepEqual(events,[name],message);events.length=0;}

for(const weapon of run('Object.keys(WEAPONS)')){
 fresh(weapon);assert.equal(run('fireWeapon()'),true);assert.equal(count('shot-'+weapon),1,weapon+' emits one cue per shot, regardless of pellet count');assert.equal(count('shot'),0,'legacy shot cannot duplicate weapon cue');
}
fresh();run('player.reloadTime=1');assert.equal(run('fireWeapon()'),false);assert.deepEqual(events,[],'reloading cancels the shot silently');
fresh();run('bullets=Array.from({length:400},()=>({}))');assert.equal(run('emitProjectiles(0)'),false);assert.deepEqual(events,[],'projectile cap cancels the shot silently');
fresh();run('player.ammo=0');assert.equal(run('emitProjectiles(0)'),false);expectOnly('reload','empty gun reloads without a shot cue');

fresh('burst');run('firing=true;tick(.01)');assert.equal(count('shot-burst'),1);run('tick(.08);tick(.08)');assert.equal(count('shot-burst'),3,'three emitted burst rounds each have one cue');assert.equal(run('bullets.length'),3);
fresh('burst');listeners.get('canvas:pointerdown')({button:0,pointerType:'mouse',pointerId:7,clientX:800,clientY:200});run('tick(.01)');events.length=0;listeners.get('window:pointerup')({button:0,pointerType:'mouse',pointerId:7});run('tick(.2)');assert.deepEqual(events,[],'release cancels queued burst rounds without a shot cue');
fresh('burst');run('firing=true;tick(.01);pause()');events.length=0;run('tick(5)');assert.deepEqual(events,[],'paused burst never emits gameplay cues');

fresh();assert.equal(run('healPlayer(8)'),0);for(const value of ['0','-3','NaN','Infinity'])assert.equal(run('healPlayer('+value+')'),0);assert.deepEqual(events,[],'overheal, zero and invalid healing stay silent');
run('player.hp=50');assert.equal(run('healPlayer(8)'),8);expectOnly('repair','effective repair emits its cue');
fresh();run('player.ammo=1;startReload()');expectOnly('reload');run('tickStatuses(player.reloadTotal-.01)');assert.deepEqual(events,[],'unfinished reload is silent');run('tickStatuses(.02)');expectOnly('reloadReady','reload completion cues once and zero healing stays silent');run('tickStatuses(.2)');assert.deepEqual(events,[],'completed reload does not cue again');

fresh();run('player.skills.sensor=1;tickSensor(.1)');expectOnly('sensor','sensor pulse emits even without a target');run('tickSensor(.1)');assert.deepEqual(events,[],'sensor cooldown does not emit');
fresh();run('player.skills.corrosion=1;enemies=[createEnemy(player.x+100,player.y)];enemies[0].hp=100;applyCorrosion(enemies[0],{damage:10});tickCorrosion(1)');assert.deepEqual(events,[],'application and fuse delay are silent');run('tickCorrosion(1.1)');expectOnly('corrosion');run('tickCorrosion(3)');assert.deepEqual(events,[],'spent charge does not detonate twice');
fresh();run('player.skills.drones=1;tickDrones(.1)');assert.deepEqual(events,[],'drone with no living target stays silent');run('player.droneTimer=0;enemies=[createEnemy(player.x+100,player.y),createEnemy(player.x+130,player.y)];enemies.forEach(z=>z.hp=100);player.skills.droneArc=1;tickDrones(.1)');expectOnly('drone','drone arc does not duplicate attack cue');run('tickDrones(.1)');assert.deepEqual(events,[],'drone cooldown stays silent');
fresh();run('player.skills.shield=1;player.shieldReady=true;hurtPlayer(10,player.x+40,player.y)');expectOnly('shield','absorbed hit cues shield rather than damage');assert.equal(run('player.hp'),100);
fresh();run('enemies=[createEnemy(player.x+100,player.y,"shieldPolice")];enemies[0].shieldHp=100;damageEnemy(enemies[0],50)');assert.deepEqual(events,[],'partly damaged police shield has no break cue');run('damageEnemy(enemies[0],50)');expectOnly('shieldBreak');run('damageEnemy(enemies[0],1)');assert.equal(count('shieldBreak'),0,'broken shield cannot break twice');

for(const [id,phase]of [['brute','tellDash'],['brute','tellVolley'],['scrapper','tellMortar'],['coil','tellPulse'],['coil','tellFan']]){
 fresh();run('bossIndex='+({brute:0,scrapper:1,coil:2}[id])+';spawnBoss();enemies=[];boss.phase='+JSON.stringify(phase)+';boss.timer=.2');events.length=0;run('tickBoss(.1)');assert.deepEqual(events,[],'warning stays silent before '+phase);run('tickBoss(.11)');expectOnly('bossAttack',phase+' execution cues once');run('tickBoss(.01)');assert.equal(count('bossAttack'),0,'attack execution is not repeated');
}
fresh();run('spawnBoss()');expectOnly('boss');run('damageEnemy(boss,boss.hp)');expectOnly('bossDefeat','boss death differs from spawn and common kill');run('damageEnemy(boss,10)');assert.deepEqual(events,[],'dead boss cannot repeat defeat cue');

fresh();run('player.skills.sensor=1;player.skills.corrosion=1;player.skills.drones=1;enemies=[createEnemy(player.x+100,player.y)];enemies[0].hp=100;applyCorrosion(enemies[0],{damage:10});player.ammo=1;startReload();firing=true;pause()');events.length=0;const hp=run('enemies[0].hp');run('tick(10)');assert.deepEqual(events,[],'pause freezes sensor, corrosion, drones, reload and fire');assert.equal(run('enemies[0].hp'),hp);
run('state="title";frame(0);state="garage";frame(0);state="configuration";frame(0);state="playing";frame(0);state="paused";frame(0)');assert.deepEqual(scenes.slice(-5),['menu','garage','garage','combat',null],'screens select their intended arrangement and pause silences music');
// Explicit matrix fixture: real ammo emissions/contacts, not natural acquisition.
fresh();run("player.relics.add('rivetMatrix');player.rivetMatrix=null;aim={x:player.x-camera.x+100,y:player.y-camera.y,active:true};deployRivetMatrix()");expectOnly('matrixDeploy','successful deployment has its own cue');assert.equal(run('deployRivetMatrix()'),false);assert.deepEqual(events,[],'duplicate deployment stays silent');
run('emitProjectiles(0)');events.length=0;run('tick(.2)');expectOnly('matrixFeed','absorbed cartridge cues once');run('emitProjectiles(0)');events.length=0;run('tick(.2)');assert.equal(count('matrixFeed'),1);assert.equal(count('matrixShot'),1);assert.equal(run('player.rivetMatrix.salvos'),1);events.length=0;run('pause()');events.length=0;run('tick(2)');assert.deepEqual(events,[],'paused matrix never schedules its burst cues');run('pause()');events.length=0;run('tick(.6)');expectOnly('matrixShot','second real rebite cues once');run('tick(.6)');expectOnly('matrixShot','third real rebite cues once');run('player.rivetMatrix.expiresAt=clock+.01;tick(.02)');expectOnly('matrixExpire','expiry has its own bounded cue');run('tick(1)');assert.deepEqual(events,[],'expired device cannot repeat cue');
console.log('Gameplay audio passed: 12 weapons, burst/release/cancellation, effective repairs, reload, sensor/corrosion/drone/shields, all five boss attacks, boss death, pause, scene selection and matrix deployment/feed/three-shot/expiry cues.');
