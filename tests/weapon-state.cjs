'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const prefix=fs.readFileSync('tests/combat.cjs','utf8').split('assert.match(')[0];
const {context}=new Function('require',prefix+';return {context};')(require);
const run=s=>vm.runInContext(s,context),json=s=>JSON.parse(run('JSON.stringify('+s+')'));
run('reset();spawn=1e9;bossIndex=1e6;aim={x:900,y:300,active:true}');
assert.equal(run('weaponSlots.length'),1);
for(const field of run('WEAPON_STATE_FIELDS')){
 context.field=field;const value=run('player[field]');context.value=value;
 assert.equal(run('primaryWeaponState()[field]===player[field]'),true,'primary alias '+field);
 if(typeof value==='number'){run('player[field]=value+1');assert.equal(run('primaryWeaponState()[field]'),value+1);run('primaryWeaponState()[field]=value');assert.equal(run('player[field]'),value);}
}
run("const secondary=createWeaponState('burst',1),third=createWeaponState('rocket',2)");
const original=json('player'),bindings=run('runWeapon'),primaryQueue=run('burstQueue');
run('fireWeapon(secondary)');
assert.equal(run('secondary.ammo'),29);assert.equal(run('secondary.shotCount'),1);assert.equal(run('secondary.bursts.length'),2);assert.equal(run('secondary.cooldown'),run('WEAPONS.burst.rate'));
assert.equal(run('bullets[0].weapon.id'),'burst');assert.equal(run('bullets[0].damage'),14);
assert.equal(run('runWeapon'),bindings);assert.equal(run('burstQueue'),primaryQueue);assert.deepEqual(json('player'),original,'secondary emission cannot overwrite primary or shared state');
run('fireWeapon(third)');assert.equal(run('third.ammo'),0);assert.equal(run('third.reloadTime'),4.8);assert.equal(run('secondary.reloadTime'),0);assert.equal(run('player.reloadTime'),0);
run('firing=true;tickWeaponFire(secondary,.08)');assert.equal(run('secondary.ammo'),28);assert.equal(run('secondary.bursts.length'),1);assert.equal(run('third.reloadTime'),4.8);
run('startReload(secondary)');assert.equal(run('secondary.bursts.length'),0);assert.equal(run('secondary.reloadCapacity'),30);
assert.ok(Math.abs(run('secondary.reloadTime')-.12)<1e-10,'partial reload is local and proportional');
run('tickWeaponReload(secondary,.2)');assert.equal(run('secondary.ammo'),30);assert.equal(run('third.ammo'),0);assert.equal(run('player.ammo'),24);
run('tickWeaponReload(third,4.8)');assert.equal(run('third.ammo'),1);assert.equal(run('player.ammo'),24);
run('secondary.damage=51;secondary.projectileSpeed=2;secondary.projectileLife=3;secondary.projectileSize=2;secondary.spreadMult=.5;emitProjectiles(0,secondary)');
assert.equal(run('bullets.at(-1).damage'),51);assert.equal(run('bullets.at(-1).vx'),1140);assert.equal(run('bullets.at(-1).life'),4.5);assert.equal(run('player.damage'),22);
run('secondary.weapon=Object.freeze({...secondary.weapon,pierce:6});secondary.weaponEvolution=WEAPON_EVOLUTIONS.burst[0];emitProjectiles(0,secondary)');
assert.equal(run('bullets.at(-1).remaining'),7);assert.equal(run('bullets[0].weapon.pierce'),undefined,'old projectile keeps its original weapon snapshot');assert.equal(run('player.weaponEvolution'),null);
run('weaponSlots.push(secondary,third);secondary.bursts=[{delay:.1}];third.bursts=[{delay:.1}];clearInput()');assert.equal(run('weaponSlots.every(s=>s.bursts.length===0)'),true);
const frozen=run('JSON.stringify(weaponSlots)');run("state='paused';tick(5)");assert.equal(run('JSON.stringify(weaponSlots)'),frozen,'pause freezes every weapon');
run('globalThis.previousPrimary=primaryWeaponState();reset()');assert.equal(run('weaponSlots.length'),1);assert.equal(run('player.weaponEvolution'),null);assert.equal(run('player.shotCount'),0);assert.equal(run('shot'),0);assert.equal(run('player.ammo'),24);assert.notEqual(run('primaryWeaponState()'),run('secondary'));

run("previousPrimary.cooldown=999;previousPrimary.bursts=[{delay:999}];previousPrimary.weapon=Object.freeze({...previousPrimary.weapon,id:'sniper'});");assert.equal(run('shot'),0);assert.equal(run('burstQueue.length'),0);assert.equal(run('runWeapon.id'),'machine');
console.log('Weapon state passed: primary aliases, three independent emissions/ammo/reloads/cooldowns/bursts/stats, snapshots, input clearing, pause and reset. Additional loadout slots are not yet exposed in the garage.');
