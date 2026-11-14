'use strict';
// Controlled gameplay-event fixtures. This intercepts only ScrewAudio.play;
// no damage/recovery/RNG function is replaced. Not natural balance, FPS,
// physical-phone verification or human audio-quality approval.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
const sourceFiles=['game.js','audio.js','tests/combat.cjs','tests/audio.cjs','tests/ammo-cycles-audio.cjs'];
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const sourceHashes=Object.fromEntries(sourceFiles.map(p=>[p,hash(p)]));
const prefix=fs.readFileSync('tests/combat.cjs','utf8').split('assert.match(')[0];
const {context,window}=new Function('require',prefix+';return {context,window};')(require),run=s=>vm.runInContext(s,context),read=s=>JSON.parse(run('JSON.stringify('+s+')'));
const events=[],checks=[],report={kind:'controlled-ammo-cycle-audio',scope:'VM fixtures initialize loadout, counters, positions and clocks. Actual chooseRelic/emitProjectiles/impact/damageEnemy/shockAt/reload/death functions run unchanged. Only ScrewAudio.play is observed. Separate audio.cjs graph model covers gesture, signal, throttle, mute, voice bounds and independent RNG. Not a natural run, FPS/device test or human listening approval.',at:new Date().toISOString(),sourceHashes,checks};
window.ScrewAudio={play:name=>events.push(name),setScene(){},update(){},unlock:()=>Promise.resolve(true)};
const count=()=>events.filter(name=>name==='ammoCharge').length;
function check(name,fn){try{fn();checks.push({name,passed:true,events:[...events]})}catch(e){checks.push({name,passed:false,error:e.stack,events:[...events]})}}
function setup(gun='machine',aux=[],robot=null){
 Object.assign(context,{qaGun:gun,qaAux:aux,qaRobot:robot||(aux.length?'swarm':'prot')});
 run("profile=emptyProfile();profile.unlockedRobots=Object.fromEntries(Object.keys(ROBOTS).map(id=>[id,true]));profile.unlockedWeapons=Object.fromEntries(Object.keys(WEAPONS).map(id=>[id,true]));selectedRobot=qaRobot;selectedWeapon=qaGun;selectedAuxWeapons=qaAux;reset();spawn=1e6;hordeDirector.cooldown=1e6;bossIndex=1e6;player.inv=1e6;aim={x:player.x+300-camera.x,y:player.y-camera.y,active:true};enemies=[];hostile=[];hazards=[];");
 events.length=0;
}
function install(){run("player.skills.killAmmo=1;player.ammoKills=0;state='relic';offeredRelics=[BOSS_RELICS.find(r=>r.id==='recoveryDrive')];offerVersion++");assert.equal(run("chooseRelic('recoveryDrive',offerVersion)"),true)}
function ready(){install();events.length=0}
check('installing the legal piece gives upgrade only, preserving ammunition and no drive cue',()=>{
 setup();const before=read('weaponSlots.map(s=>[s.ammo,s.rate,s.cooldown])');install();assert.equal(count(),0);assert.deepEqual(events,['upgrade']);assert.deepEqual(read('weaponSlots.map(s=>[s.ammo,s.rate,s.cooldown])'),before);assert.equal(run('primaryWeaponState().recoveryDrive'),undefined);
});
check('an actual positive recovery without the piece remains silent',()=>{
 setup();run("player.ammo-=2;recoverWeaponAmmo(primaryWeaponState(),1,'killAmmo')");assert.equal(count(),0);assert.deepEqual(events,[]);assert.equal(run('player.ammo'),23);
});
check('real auxiliary projectile kill recovers its own round and emits one charge cue',()=>{
 setup('machine',['shotgun','laser']);ready();
 run("weaponSlots[2].ammo=2;player.ammoKills=9;emitProjectiles(0,weaponSlots[2]);globalThis.target=Object.assign(createEnemy(player.x+100,player.y),{hp:1,maxHp:1});enemies=[target];impact(target,bullets[0])");
 assert.equal(run('target.hp'),0);assert.equal(run('weaponSlots[2].ammo'),2);assert.deepEqual(read('weaponSlots.map(s=>recoveryDriveStacks(s))'),[0,0,1]);assert.equal(count(),1);assert.ok(events.indexOf('kill')<events.indexOf('ammoCharge'),'charge follows actual kill/recovery');
});
check('real sixth damaging electric contact produces one recovery cue',()=>{
 setup('tesla',[],'volt');ready();
 run("player.skills.killAmmo=0;player.specialization='chargeRecovery';player.electricHits=5;player.specializationCooldown=0;player.ammo-=2;globalThis.center=Object.assign(createEnemy(player.x+80,player.y),{hp:100,maxHp:100});globalThis.target=Object.assign(createEnemy(player.x+90,player.y),{hp:100,maxHp:100});enemies=[center,target];shockAt(center,10,1,{slot:0})");
 assert.ok(run('target.hp')<100);assert.equal(run('player.ammo'),7);assert.equal(run('recoveryDriveStacks(primaryWeaponState())'),1);assert.equal(count(),1);
});
check('one electric kill with two real recoveries cues two rises, or one when only one round fits',()=>{
 for(const missing of [1,2]){
  setup('tesla',[],'volt');ready();context.qaMissing=missing;
  run("player.ammo=magazineSize()-qaMissing;player.ammoKills=9;player.specialization='chargeRecovery';player.electricHits=5;player.specializationCooldown=0;globalThis.center=Object.assign(createEnemy(player.x+80,player.y),{hp:100,maxHp:100});globalThis.target=Object.assign(createEnemy(player.x+90,player.y),{hp:1,maxHp:1});enemies=[center,target];shockAt(center,10,1,{slot:0})");
  assert.equal(run('target.hp'),0);assert.equal(run('player.ammo'),run('magazineSize()'));assert.equal(run('recoveryDriveStacks(primaryWeaponState())'),missing);assert.equal(count(),missing);
 }
});
check('full magazine kill and electric attempts neither cue nor refresh an existing stage',()=>{
 setup('tesla',[],'volt');ready();
 run("player.ammo--;recoverWeaponAmmo(primaryWeaponState(),1,'killAmmo');clock=1;globalThis.until=primaryWeaponState().recoveryDrive.until");events.length=0;
 run("player.ammoKills=9;globalThis.target=Object.assign(createEnemy(player.x+80,player.y),{hp:1,maxHp:1});enemies=[target];damageEnemy(target,2,'bullet',{slot:0});player.specialization='chargeRecovery';player.electricHits=5;player.specializationCooldown=0;globalThis.center=Object.assign(createEnemy(player.x+100,player.y),{hp:100,maxHp:100});globalThis.other=Object.assign(createEnemy(player.x+110,player.y),{hp:100,maxHp:100});enemies=[center,other];shockAt(center,10,1,{slot:0})");
 assert.equal(count(),0);assert.equal(run('primaryWeaponState().recoveryDrive.until'),run('until'));assert.equal(run('recoveryDriveStacks(primaryWeaponState())'),1);
});
check('positive refresh at five stages changes expiry but is silent',()=>{
 setup();ready();run("player.ammo=0;for(let i=0;i<5;i++)recoverWeaponAmmo(primaryWeaponState(),1,'killAmmo')");assert.equal(count(),5);events.length=0;
 run("clock=1;recoverWeaponAmmo(primaryWeaponState(),1,'killAmmo')");assert.equal(run('recoveryDriveStacks(primaryWeaponState())'),5);assert.equal(run('primaryWeaponState().recoveryDrive.until'),5);assert.equal(count(),0);
});
check('at exact expiry a new positive recovery starts one stage and one cue',()=>{
 setup();ready();run("player.ammo=0;recoverWeaponAmmo(primaryWeaponState(),1,'killAmmo');clock=4");events.length=0;
 assert.equal(run('recoveryDriveStacks(primaryWeaponState())'),0);run("recoverWeaponAmmo(primaryWeaponState(),1,'killAmmo')");assert.equal(run('recoveryDriveStacks(primaryWeaponState())'),1);assert.equal(run('primaryWeaponState().recoveryDrive.until'),8);assert.equal(count(),1);
});
check('manual reload and actual completion do not cue the recovery drive',()=>{
 setup();ready();run('player.ammo=1;startReload()');assert.ok(events.includes('reload'));assert.equal(count(),0);events.length=0;
 run('tickWeaponReload(primaryWeaponState(),player.reloadTime)');assert.ok(events.includes('reloadReady'));assert.equal(count(),0);assert.equal(run('recoveryDriveStacks(primaryWeaponState())'),0);
});
check('unlisted and omitted reimbursement sources cannot cue or refresh the drive',()=>{
 setup();ready();run("player.ammo=0;recoverWeaponAmmo(primaryWeaponState(),1,'killAmmo');globalThis.until=primaryWeaponState().recoveryDrive.until;clock=1");events.length=0;
 run("recoverWeaponAmmo(primaryWeaponState(),1,'refund');recoverWeaponAmmo(primaryWeaponState(),1)");assert.equal(run('player.ammo'),3);assert.equal(count(),0);assert.equal(run('primaryWeaponState().recoveryDrive.until'),run('until'));assert.equal(run('recoveryDriveStacks(primaryWeaponState())'),1);
});
check('inactive phases, zero HP and invalid amounts cannot emit a recovery sound',()=>{
 for(const phase of ['paused','upgrade','relic','over']){
  setup();ready();context.qaPhase=phase;run('player.ammo=0;state=qaPhase');assert.equal(run("recoverWeaponAmmo(primaryWeaponState(),1,'killAmmo')"),0);assert.equal(run('player.ammo'),0);assert.deepEqual(events,[]);
 }
 setup();ready();run('player.ammo=0;player.hp=0');assert.equal(run("recoverWeaponAmmo(primaryWeaponState(),1,'chargeRecovery')"),0);assert.deepEqual(events,[]);
 setup();ready();run('player.ammo=0');for(const v of ['NaN','Infinity','-1','0'])assert.equal(run("recoverWeaponAmmo(primaryWeaponState(),"+v+",'killAmmo')"),0);assert.deepEqual(events,[]);
});
check('stale slot after reset cannot emit or power a new attempt',()=>{
 setup();ready();run("player.ammo=0;recoverWeaponAmmo(primaryWeaponState(),1,'killAmmo');globalThis.oldSlot=primaryWeaponState();reset()");ready();
 assert.equal(run("recoverWeaponAmmo(oldSlot,1,'killAmmo')"),0);assert.equal(run('recoveryDriveStacks(oldSlot)'),0);assert.deepEqual(events,[]);assert.equal(run('primaryWeaponState().recoveryDrive'),undefined);
});
check('lethal damage clears stages and later helper calls remain silent',()=>{
 setup();ready();run("player.ammo=0;recoverWeaponAmmo(primaryWeaponState(),1,'killAmmo')");events.length=0;run('player.inv=0;hurtPlayer(1e6)');
 assert.equal(run('state'),'over');assert.equal(run('primaryWeaponState().recoveryDrive'),undefined);assert.ok(events.includes('death'));assert.equal(count(),0);events.length=0;assert.equal(run("recoverWeaponAmmo(primaryWeaponState(),1,'killAmmo')"),0);assert.deepEqual(events,[]);
});
check('pause freezes drive time and does not replay its cue on passive ticks',()=>{
 setup();ready();run("player.ammo=0;recoverWeaponAmmo(primaryWeaponState(),1,'killAmmo')");events.length=0;run('pause()');const before=read('({clock,ammo:player.ammo,drive:primaryWeaponState().recoveryDrive})');assert.ok(events.includes('pause'));events.length=0;run('tick(10);updateHUD();draw()');assert.deepEqual(read('({clock,ammo:player.ammo,drive:primaryWeaponState().recoveryDrive})'),before);assert.deepEqual(events,[]);
});
check('garage clears states without replaying a recovery sound',()=>{
 setup();ready();run("player.ammo=0;recoverWeaponAmmo(primaryWeaponState(),1,'killAmmo')");events.length=0;run('openGarage()');assert.equal(run('state'),'garage');assert.equal(run('weaponSlots.some(s=>s.recoveryDrive)'),false);assert.equal(count(),0);
});
check('actual ammoCharge signal has its own 150ms throttle, correct pitch/duration, mute and bounded voices',()=>{
 const graphSource=fs.readFileSync('tests/audio.cjs','utf8'),start=graphSource.indexOf('function timedHarness(){'),end=graphSource.indexOf('(async()=>{',start);
 assert.ok(start>=0&&end>start,'existing timed graph fixture boundary');
 const createHarness=new Function('vm','code',graphSource.slice(start,end)+';return timedHarness;')(vm,fs.readFileSync('audio.js','utf8')),g=createHarness(),a=g.audio;
 a.play('ammoCharge');assert.equal(g.records.length,0,'before gesture is silent');
 // The existing graph Context is already running, so unlock initializes the
 // graph synchronously; production only awaits resume for a suspended context.
 a.unlock();const offset=g.records.length;
 a.play('ammoCharge');const first=g.records.slice(offset),starts=()=>g.records.filter(r=>r.method==='start').length;
 assert.equal(starts(),1);assert.ok(first.some(r=>r.key==='frequency'&&r.method==='set'&&r.value===330));assert.ok(first.some(r=>r.key==='frequency'&&r.method==='ramp'&&r.value===440&&Math.abs(r.time-.06)<1e-9));assert.ok(first.some(r=>r.key==='gain'&&r.method==='ramp'&&r.value===.018));assert.ok(first.some(r=>r.key==='gain'&&r.method==='ramp'&&r.value===.0001&&Math.abs(r.time-.06)<1e-9));
 // The shared graph model stores stopTime on sources, not in records. Its
 // advance() invokes onended at that boundary, so assert voice lifecycle there.
 g.advance(.071);assert.equal(a.getState().effectVoices,1);g.advance(.002);assert.equal(a.getState().effectVoices,0,'voice stops at60ms+12ms release');
 g.advance(.076);a.play('ammoCharge');assert.equal(starts(),1,'149ms is throttled');
 g.advance(.002);a.play('ammoCharge');assert.equal(starts(),2,'151ms is accepted');
 a.setEffectsVolume(0);assert.equal(a.getState().effectVoices,0);const muted=g.records.length;g.advance(1);a.play('ammoCharge');assert.equal(g.records.length,muted,'muted cue creates no graph nodes');
 a.setEffectsVolume(.6);let peak=0;for(let i=0;i<100;i++){g.advance(.151);for(let j=0;j<10;j++)a.play('ammoCharge');peak=Math.max(peak,a.getState().effectVoices);assert.ok(a.getState().effectVoices<=24)}
 report.ammoChargeGraph={startHz:330,endHz:440,duration:.06,amplitude:.018,throttle:.15,peakVoices:peak};
});
// The existing full graph test also exercises the music/effects coexistence.
const signal=spawnSync(process.execPath,['tests/audio.cjs'],{encoding:'utf8'});
report.audioGraph={command:[process.execPath,'tests/audio.cjs'],verifierSha256:sourceHashes['tests/audio.cjs'],exitCode:signal.status,stdout:signal.stdout,stderr:signal.stderr,error:signal.error?.stack||null};
checks.push({name:'actual audio graph regression including ammoCharge signal/throttle/mute/voice bounds and independent RNG',passed:signal.status===0&&!signal.error});
report.sourceChanges=sourceFiles.filter(p=>hash(p)!==sourceHashes[p]);report.passed=checks.filter(c=>c.passed).length;report.failed=checks.filter(c=>!c.passed).length;report.completed=report.failed===0&&report.sourceChanges.length===0;
fs.mkdirSync('outputs/ammo-audio66',{recursive:true});fs.writeFileSync('outputs/ammo-audio66/result.json',JSON.stringify(report,null,2));
for(const c of checks){console.log((c.passed?'PASSED':'FAILED')+': '+c.name);if(c.error)console.error(c.error)}
if(report.failed||report.sourceChanges.length){console.error(JSON.stringify({failed:report.failed,sourceChanges:report.sourceChanges}));process.exitCode=1;}
