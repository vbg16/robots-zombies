'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const prefix=fs.readFileSync('tests/combat.cjs','utf8').split('assert.match(')[0].replace("vm.runInContext(fs.readFileSync('game.js','utf8'),context);","window.localStorage=localStorage;vm.runInContext(fs.readFileSync('balance.js','utf8'),context);vm.runInContext(fs.readFileSync('game.js','utf8'),context);");
const h=new Function('require',prefix+';return {context,elements,listeners};')(require);
const run=s=>vm.runInContext(s,h.context),json=s=>JSON.parse(run('JSON.stringify('+s+')'));
const close=(a,b,note)=>assert.ok(Math.abs(a-b)<1e-8,`${note}: ${a} versus ${b}`);
function garage(robot='swarm',primary='machine',aux=['burst','rocket']){
 run(`profile=emptyProfile();profile.unlockedRobots=Object.fromEntries(Object.keys(ROBOTS).map(id=>[id,true]));profile.unlockedWeapons=Object.fromEntries(Object.keys(WEAPONS).map(id=>[id,true]));selectedAuxWeapons=[];openGarage();selectRobot('${robot}');selectWeapon('${primary}')`);
 for(const [index,id] of aux.entries())assert.equal(run(`selectAuxWeapon(${index},'${id}')`),true,'equip valid auxiliary');
}
function setup(robot='swarm',primary='machine',aux=['burst','rocket']){garage(robot,primary,aux);run('reset();spawn=1e9;bossIndex=1e6;aim={x:900,y:300,active:true}');}
const catalog=run('JSON.stringify({ROBOTS,WEAPONS,AMMO})');

// Every addition is an owned blueprint, fits its chassis, and is configured before combat.
run('profile=emptyProfile();selectedAuxWeapons=[];openGarage()');
assert.equal(run("selectRobot('swarm')"),false);assert.equal(run("selectAuxWeapon(0,'shotgun')"),false);
run('profile.unlockedRobots.bastion=true;selectRobot("bastion")');
assert.equal(run("selectAuxWeapon(0,'shotgun')"),false,'locked gun cannot fill a slot');
run('profile.unlockedWeapons.shotgun=true');
assert.equal(run("selectAuxWeapon(0,'shotgun')"),true);
for(const code of ["selectAuxWeapon(1,'shotgun')","selectAuxWeapon(-1,'shotgun')","selectAuxWeapon(.5,'shotgun')","selectAuxWeapon(0,'invalid')","selectAuxWeapon(0,'machine')"])assert.equal(run(code),false,code);
assert.deepEqual(json('selectedLoadout()'),['machine','shotgun']);
run("selectWeapon('shotgun')");assert.deepEqual(json('selectedAuxWeapons'),[],'primary cannot duplicate an auxiliary');
garage();assert.deepEqual(json('selectedLoadout()'),['machine','burst','rocket']);
assert.equal(run("selectAuxWeapon(1,'burst')"),false,'auxiliary blueprints cannot duplicate');
run("selectAuxWeapon(0,'')");assert.deepEqual(json('selectedLoadout()'),['machine','rocket'],'removing an auxiliary compacts the loadout');
run("selectAuxWeapon(1,'shotgun');selectRobot('bastion')");assert.deepEqual(json('selectedLoadout()'),['machine','rocket'],'two-slot chassis drops overflow');
run("selectRobot('prot')");assert.deepEqual(json('selectedAuxWeapons'),[],'one-slot chassis clears auxiliary slots');

// All existing chassis keep their one-gun attributes; active counts alone select penalties.
for(const robot of run('Object.keys(ROBOTS)')){
 setup(robot,'machine',[]);assert.equal(run('weaponSlots.length'),1);close(run('player.speed'),run('runRobot.speed'),robot+' original speed');
 close(run('player.damage'),run("WEAPONS.machine.damage*(['forge','volt'].includes(runRobot.id)?.9:1)"),robot+' original damage');
}
setup('bastion','machine',['sniper']);assert.equal(run('weaponSlots.length'),2);close(run('player.speed'),155*.9,'dual movement');close(run('player.damage'),22*.7,'dual primary');close(run('weaponSlots[1].damage'),88*.7,'dual auxiliary');assert.equal(run('player.hp'),120);
setup();assert.equal(run('weaponSlots.length'),3);close(run('player.speed'),170*.8,'triple movement');
for(const slot of json('weaponSlots'))close(slot.damage,run(`WEAPONS['${slot.weapon.id}'].damage`)*.55,'triple damage '+slot.weapon.id);
const equipped=run('JSON.stringify(weaponSlots.map(s=>s.weapon.id))');
for(const code of ["selectAuxWeapon(0,'sniper')","selectWeapon('sniper')","selectRobot('prot')"])assert.equal(run(code),false,'loadout fixed in combat');
run("selectedAuxWeapons=['sniper'];selectedWeapon='disc'");assert.equal(run('JSON.stringify(weaponSlots.map(s=>s.weapon.id))'),equipped,'changing selection storage cannot mutate current equipment');
garage();run("profile.unlockedWeapons.sniper=false;selectedAuxWeapons=['machine','invalid','sniper','rocket','rocket','burst'];reset()");assert.deepEqual(json('weaponSlots.map(s=>s.weapon.id)'),['machine','rocket','burst'],'reset sanitizes malformed auxiliary selections before capacity fill');

// Manual trigger and independent clocks, automatic empty reload, and all-gun R.
setup();run('tick(.01)');assert.equal(run('bullets.length'),0,'no automatic aim/fire');
run('firing=true;tick(.01)');assert.deepEqual(json('weaponSlots.map(s=>s.ammo)'),[23,29,0]);assert.deepEqual(json('weaponSlots.map(s=>s.shotCount)'),[1,1,1]);assert.equal(run('weaponSlots[1].bursts.length'),2);close(run('weaponSlots[2].reloadTime'),4.8,'rocket starts its own reload');
assert.deepEqual([...new Set(json('bullets.map(b=>b.slot)'))].sort(),[0,1,2]);
run('tick(.08)');assert.deepEqual(json('weaponSlots.map(s=>s.ammo)'),[23,28,0]);assert.equal(run('weaponSlots[1].bursts.length'),1);close(run('weaponSlots[2].reloadTime'),4.72,'rocket reload continues while burst fires');
const primaryCooldown=run('weaponSlots[0].cooldown');assert.ok(primaryCooldown>0&&primaryCooldown<.32);
assert.equal(run('reloadAllWeapons()'),true);assert.equal(run('weaponSlots.every(s=>s.reloadTime>0&&s.bursts.length===0)'),true);assert.equal(run('reloadAllWeapons()'),false,'active reloads do not restart');
run('clearInput()');const paused=run('JSON.stringify({clock,player,weaponSlots,bullets})');run("state='paused';tick(5)");assert.equal(run('JSON.stringify({clock,player,weaponSlots,bullets})'),paused,'pause freezes every equipped gun');

// Shared HP is modified once; independent reloads share a single repair allowance.
setup();run("SKILLS.find(s=>s.id==='armor').apply();SKILLS.find(s=>s.id==='titan').apply()");assert.equal(run('player.hp'),285);assert.equal(run('player.armor'),2);
setup();run('player.skills.repair=1;player.hp=20;for(const s of weaponSlots)s.ammo=0;reloadAllWeapons();for(const s of weaponSlots)tickWeaponReload(s,20)');close(run('player.hp'),25,'three full reloads together heal5, not15');assert.equal(run('weaponSlots.every(s=>s.ammo===magazineSize(s))'),true);
run('player.hp=20;weaponSlots[0].ammo=12;reloadAllWeapons();tickWeaponReload(weaponSlots[0],20)');close(run('player.hp'),20+5/6,'one half reload heals half of its one-third allowance');

// Kill and electric refunds go to the gun that emitted the projectile, once globally.
setup('swarm','machine',['sniper','tesla']);
run('emitProjectiles(0,weaponSlots[1]);globalThis.sourceBullet=bullets.at(-1);bullets=[];weaponSlots[0].ammo=1;weaponSlots[1].ammo=1;weaponSlots[2].ammo=1;player.skills.killAmmo=1;player.ammoKills=9;globalThis.victim=createEnemy(player.x+80,player.y);victim.hp=1;enemies=[victim];impact(victim,sourceBullet)');
assert.deepEqual(json('weaponSlots.map(s=>s.ammo)'),[1,2,1],'ten-kill refund uses secondary origin');assert.equal(run('player.ammoKills'),0);
run('emitProjectiles(0,weaponSlots[2]);sourceBullet=bullets.at(-1);bullets=[];weaponSlots[2].ammo=2;player.specialization="chargeRecovery";player.specializationCooldown=0;player.electricHits=5;victim=createEnemy(player.x+80,player.y);victim.hp=1000;globalThis.neighbor=createEnemy(player.x+95,player.y);neighbor.hp=1000;enemies=[victim,neighbor];impact(victim,sourceBullet)');
assert.deepEqual(json('weaponSlots.map(s=>s.ammo)'),[1,2,3],'electric refund uses Tesla origin');close(run('player.specializationCooldown'),.25,'electric recovery global cooldown');

// Delayed sources retain only scalar attribution; weaker burn cannot steal a stronger burn's kills.
setup('swarm','machine',['sniper','flame']);
run('emitProjectiles(0,weaponSlots[1]);globalThis.strongBurn=bullets.at(-1);emitProjectiles(0,weaponSlots[2]);globalThis.weakBurn=bullets.at(-1);bullets=[];player.skills.burn=1;player.skills.killAmmo=1;player.ammoKills=9;for(const s of weaponSlots)s.ammo=1;victim=createEnemy(player.x+200,player.y);victim.hp=1000;enemies=[victim];applyElementalStatus(victim,strongBurn);applyElementalStatus(victim,weakBurn)');
assert.equal(run('victim.burnOrigin.slot'),1,'weaker later flame cannot reattribute strong sniper burn');assert.deepEqual(json('Object.keys(victim.burnOrigin).sort()'),['directDamage','slot'],'no object graph retained by delayed damage');
run('victim.hp=1;tickStatuses(.5)');assert.deepEqual(json('weaponSlots.map(s=>s.ammo)'),[1,2,1],'burn refund retains strongest burn origin');assert.doesNotThrow(()=>run('JSON.stringify(enemies)'),'burn origin must serialize without cycles');
setup('swarm','machine',['sniper','flame']);
run('emitProjectiles(0,weaponSlots[1]);sourceBullet=bullets.at(-1);bullets=[];player.skills.corrosion=1;player.skills.corrosionBloom=1;player.skills.killAmmo=1;player.ammoKills=8;for(const s of weaponSlots)s.ammo=1;victim=createEnemy(player.x+200,player.y);victim.hp=1;globalThis.spreadA=createEnemy(player.x+220,player.y);spreadA.hp=1;globalThis.spreadB=createEnemy(player.x+240,player.y);spreadB.hp=1;enemies=[victim,spreadA,spreadB];applyCorrosion(victim,sourceBullet);tickCorrosion(2)');
assert.equal(run('victim.hp'),0);assert.equal(run('player.ammoKills'),9);assert.equal(run('spreadA.corrosion.origin.slot'),1);assert.equal(run('spreadB.corrosion.origin.slot'),1);assert.equal(run('spreadA.corrosion.remaining'),2,'new spread charge is not aged on birth');assert.equal(run('spreadA.corrosion.spread'),false);assert.doesNotThrow(()=>run('JSON.stringify(enemies)'),'corrosion sources must serialize without cycles');
run('tickCorrosion(2)');assert.deepEqual(json('weaponSlots.map(s=>s.ammo)'),[1,2,1],'transferred corrosion refunds the original weapon once at the global tenth kill');assert.equal(run('player.ammoKills'),1);assert.equal(run('spreadA.hp'),0);assert.equal(run('spreadB.hp'),0);

// Every gun captures its own direct source, weapon descriptor and refit traits at emission.
setup('swarm','machine',['sniper','flame']);run('emitProjectiles(0,weaponSlots[1]);globalThis.oldProjectile=bullets[0]');
assert.equal(run('oldProjectile.slot'),1);close(run('oldProjectile.directDamage'),88*.55,'source base');
const oldWeapon=run('oldProjectile.weapon'),oldDamage=run('oldProjectile.damage');
run('for(const s of weaponSlots)s.ammo=Math.max(0,magazineSize(s)-1);reloadAllWeapons();level=20');
const loading=json('weaponSlots.map(s=>({ammo:s.ammo,left:s.reloadTime,total:s.reloadTotal}))');
assert.equal(run('offerWeaponEvolution()'),true);assert.equal(run('evolutionSlotIndex'),0);
const firstCard=h.elements.get('choices').children[0].onclick,firstSkip=h.elements.get('choices').children.at(-1).onclick,firstVersion=run('offerVersion'),firstId=run('offeredWeaponEvolutions[0].id');
const refitFrozen=run('JSON.stringify({clock,weaponSlots,bullets})');run('tick(99);pause()');assert.equal(run('JSON.stringify({clock,weaponSlots,bullets})'),refitFrozen,'sequential refits freeze all guns');
assert.equal(run(`chooseWeaponEvolution('${firstId}',${firstVersion})`),true);assert.equal(run('state'),'evolution');assert.equal(run('evolutionSlotIndex'),1);
assert.equal(run(`chooseWeaponEvolution('${firstId}',${firstVersion})`),false);firstCard();firstSkip();assert.equal(run('evolutionSlotIndex'),1,'stale primary callbacks cannot skip the next gun');
assert.equal(run('declineWeaponEvolution(offerVersion)'),true);assert.equal(run('state'),'evolution');assert.equal(run('evolutionSlotIndex'),2);
assert.equal(run(`chooseWeaponEvolution('${firstId}',offerVersion)`),false,'another weapon refit cannot be installed');
assert.equal(run('chooseWeaponEvolution(offeredWeaponEvolutions[0].id,offerVersion)'),true);assert.equal(run('state'),'playing');assert.equal(run('weaponSlots[1].weaponEvolution'),null,'refusal applies only to that gun');assert.equal(run('weaponSlots[2].weaponEvolution.weapon'),'flame');
assert.deepEqual(json('weaponSlots.map(s=>({ammo:s.ammo,left:s.reloadTime,total:s.reloadTotal}))'),loading,'no stage refills ammo or completes a reload');
assert.equal(run('oldProjectile.weapon'),oldWeapon);assert.equal(run('oldProjectile.damage'),oldDamage);assert.equal(run('oldProjectile.weapon.pierce'),3);assert.equal(run('offerWeaponEvolution()'),false,'declined offers do not return');

// The shared safety budget rotates first service across guns rather than starving auxiliaries.
setup();run('globalThis.budgetServed=[];firing=true');
for(let frame=0;frame<3;frame++){
 run('bullets=[];for(const s of weaponSlots){s.projectileMult=400;s.cooldown=0;s.bursts=[];s.reloadTime=0;s.ammo=magazineSize(s);}tick(.001);budgetServed.push([...new Set(bullets.map(b=>b.slot))]);');assert.equal(run('bullets.length'),400,'projectile budget cannot be exceeded');
}
assert.deepEqual([...new Set(json('budgetServed').flat())].sort(),[0,1,2],'all three guns receive capacity in the rotating fixture');
const resetProfile=run('JSON.stringify(profile)');run('reset()');assert.equal(run('weaponSlots.length'),3);assert.equal(run('weaponSlots.every(s=>s.weaponEvolution===null&&s.shotCount===0&&s.bursts.length===0&&s.cooldown===0&&s.ammo===magazineSize(s))'),true);assert.equal(run('JSON.stringify(profile)'),resetProfile,'retry does not spend permanent resources');
assert.equal(run('JSON.stringify({ROBOTS,WEAPONS,AMMO})'),catalog,'runtime loadouts and refits cannot mutate the base catalogs');
// A returning primary must not hide ricochet for an eligible auxiliary.
setup('swarm','disc',['machine']);run("SKILLS.find(s=>s.id==='rate').apply()");assert.equal(run("SKILLS.find(s=>s.id==='ricochet').available()"),true);run("SKILLS.find(s=>s.id==='ricochet').apply();emitProjectiles(0,weaponSlots[0]);emitProjectiles(0,weaponSlots[1])");assert.equal(run('bullets[0].bounces'),0);assert.equal(run('bullets[1].bounces'),1);
setup('swarm','disc',[]);run("SKILLS.find(s=>s.id==='rate').apply()");assert.equal(run("SKILLS.find(s=>s.id==='ricochet').available()"),false);

console.log('Advanced loadout passed: ownership/capacity/dedup, six one-gun chassis, dual/triple costs, fixed equipment, independent manual fire/reload/bursts, shared HP/repair, source refunds/snapshots, sequential level20 refits, pause/reset and rotating400-projectile budget.');
