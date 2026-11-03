'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const prefix=fs.readFileSync('tests/combat.cjs','utf8').split('assert.match(')[0];
const h=new Function('require',prefix+';return {context,elements,localStorage,listeners};')(require);
const run=code=>vm.runInContext(code,h.context),read=code=>JSON.parse(run('JSON.stringify('+code+')'));
const close=(a,b,note)=>assert.ok(Math.abs(a-b)<1e-8,`${note}: ${a} vs ${b}`);
function setup(weapon='machine'){
 run(`profile.unlockedWeapons=Object.fromEntries(Object.keys(WEAPONS).map(id=>[id,true]));openGarage();selectWeapon('${weapon}');reset();spawn=10000;aim={x:800,y:300,active:true}`);
}
function offer(){run('level=19;xp=need;tick(.01)');assert.equal(run('state'),'evolution');}
const original=run('JSON.stringify({weapons:WEAPONS,ammo:AMMO})');
const definitions=read('Object.values(WEAPON_EVOLUTIONS).flat()');
assert.equal(definitions.length,24);assert.equal(new Set(definitions.map(e=>e.id)).size,24);
for(const item of definitions){
 setup(item.weapon);run('player.ammo=Math.max(1,player.ammo-1)');const ammo=run('player.ammo'),profile=run('JSON.stringify(profile)');
 const before=read('player');offer();
 assert.equal(run('offeredWeaponEvolutions.length'),2);assert.ok(run('offeredWeaponEvolutions.every(e=>e.weapon===runWeapon.id)'));
 const frozen=run('JSON.stringify({clock,spawn,player,enemies,bullets,hostile,hazards})');run('tick(10);pause()');assert.equal(run('JSON.stringify({clock,spawn,player,enemies,bullets,hostile,hazards})'),frozen,'offer freezes simulation and pause cannot dismiss it');
 const version=run('offerVersion');assert.equal(run(`chooseWeaponEvolution('${item.id}',${version})`),true);
 assert.equal(run('state'),'playing');assert.equal(run('runWeapon.id'),item.weapon);assert.equal(run('selectedWeapon'),item.weapon);
 assert.equal(run('player.ammo'),ammo,'installing never grants ammo');assert.equal(run('JSON.stringify(profile)'),profile,'refit never changes persistent progress');
 for(const [key,factor] of Object.entries(item.multipliers))close(run('player.'+key),before[key]*factor,item.id+':'+key);
 for(const [key,add] of Object.entries(item.additions))close(run('runWeapon.'+key),run(`WEAPONS['${item.weapon}'].${key}||0`)+add,item.id+':'+key);
 assert.equal(run(`chooseWeaponEvolution('${item.id}',${version})`),false,'stale card cannot apply twice');assert.equal(run('offerWeaponEvolution()'),false);
 run('emitProjectiles(0)');assert.ok(run('bullets.length>0'));assert.ok(run('bullets.every(b=>Number.isFinite(b.damage)&&b.damage>0&&b.weapon.id===runWeapon.id)'));
 assert.equal(run('JSON.stringify({weapons:WEAPONS,ammo:AMMO})'),original,'immutable base catalogs stay unchanged');
 run('pause()');assert.ok(h.elements.get('choices').children[0].children.at(-1).textContent.includes(item.name),'diagnosis names selected refit');
 run('reset()');assert.equal(run('player.weaponEvolution'),null);assert.equal(run('weaponEvolutionOffered'),false);assert.equal(run('runWeapon.pellets'),run('WEAPONS[selectedWeapon].pellets'));
}
setup();assert.equal(run('offerWeaponEvolution()'),false,'cannot refit before level20');run('level=18;xp=need;tick(.01)');assert.equal(run('state'),'upgrade','level19 remains an ordinary module');
setup();offer();const stale=h.elements.get('choices').children[0].onclick,skip=h.elements.get('choices').children.at(-1).onclick;
assert.equal(run("chooseWeaponEvolution('tesla-branchCoil',offerVersion)"),false,'cannot install another weapon refit');
const profile=run('JSON.stringify(profile)'),ammo=run('player.ammo');skip();assert.equal(run('state'),'playing');assert.equal(run('player.weaponEvolution'),null);assert.equal(run('offerWeaponEvolution()'),false);stale();assert.equal(run('player.weaponEvolution'),null);assert.equal(run('player.ammo'),ammo);assert.equal(run('JSON.stringify(profile)'),profile);
run('xp=need;tick(.01)');assert.equal(run('state'),'upgrade','level21 resumes ordinary modules');
setup();offer();run('reset()');stale();skip();assert.equal(run('state'),'playing');assert.equal(run('player.weaponEvolution'),null);
setup();run('level=19;xp=need;bossReward=true;tick(.01)');assert.equal(run('state'),'experiment','boss reward is resolved before level milestone');run('declineExperiment(offerVersion);tick(.01)');assert.equal(run('state'),'evolution');
setup();run('player.ammo=12;startReload();tickStatuses(.2)');offer();const reload=read('[player.reloadTime,player.reloadTotal,player.reloadMissing,player.reloadCapacity]');run("chooseWeaponEvolution('machine-beltFeed',offerVersion)");
assert.deepEqual(read('[player.reloadTime,player.reloadTotal,player.reloadMissing,player.reloadCapacity]'),reload,'in-progress reload is preserved');assert.equal(run('player.ammo'),12);assert.equal(run('magazineSize()'),36);run('tickStatuses(player.reloadTime)');assert.equal(run('player.ammo'),36);
// Refit properties are snapshotted per projectile, not retroactively attached to shots already in flight.
setup('disc');run('emitProjectiles(0);globalThis.oldDisc=bullets[0]');offer();run("chooseWeaponEvolution('disc-impactRim',offerVersion);player.reloadTime=0;player.ammo=1;emitProjectiles(0);globalThis.newDisc=bullets[1];enemies=[createEnemy(700,300),createEnemy(720,300)];for(const z of enemies)z.hp=1000;impact(enemies[0],oldDisc)");assert.equal(run('enemies[1].hp'),1000);run('impact(enemies[0],newDisc)');assert.ok(run('enemies[1].hp<1000'),'new disc has intrinsic splash');
setup('disc');run('emitProjectiles(0);globalThis.oldRotor=bullets[0]');offer();run("chooseWeaponEvolution('disc-fastRotor',offerVersion);oldRotor.x=player.x+100;oldRotor.life=oldRotor.maxLife/2;bullets=[oldRotor];tick(.001)");close(run('Math.hypot(oldRotor.vx,oldRotor.vy)'),360,'old returning disc keeps emission speed after rotor refit');
setup('flame');run('emitProjectiles(0);globalThis.oldFlame=bullets[0]');offer();run("chooseWeaponEvolution('flame-fuelMixer',offerVersion);emitProjectiles(0);globalThis.heat=createEnemy(700,300);applyStatus(heat,oldFlame)");close(run('heat.burnDps'),2.5,'old flame keeps original burn');run('heat.burnDps=0;applyStatus(heat,bullets[3])');close(run('heat.burnDps'),3,'new flame applies net1.2 burn with direct cost');
setup('cryo');run('emitProjectiles(0);globalThis.oldIce=bullets[0]');offer();run("chooseWeaponEvolution('cryo-deepCooling',offerVersion);emitProjectiles(0);globalThis.ice=createEnemy(700,300);applyStatus(ice,oldIce)");assert.equal(run('ice.slowTime'),2);run('ice.slowTime=0;applyStatus(ice,bullets[1])');assert.equal(run('ice.slowTime'),3);run("SKILLS.find(s=>s.id==='freeze').apply();ice.slowTime=0;applyStatus(ice,bullets[1])");assert.equal(run('ice.slowTime'),4);
for(const key of ['1','2','r']){setup();offer();let prevented=false;const fire=repeat=>h.listeners.get('window:keydown')({key,repeat,preventDefault(){prevented=true;}});fire(true);assert.equal(run('state'),'evolution');assert.equal(prevented,false);fire(false);assert.equal(run('state'),'playing');assert.equal(prevented,true);assert.equal(run('player.weaponEvolution?.id||null'),key==='r'?null:run(`WEAPON_EVOLUTIONS.machine[${Number(key)-1}].id`));}
setup('grenade');run('emitProjectiles(0);globalThis.oldGrenade=bullets[0]');offer();run("chooseWeaponEvolution('grenade-pressureShell',offerVersion);player.reloadTime=0;emitProjectiles(0);globalThis.newGrenade=bullets[1];enemies=[createEnemy(710,300)];enemies[0].hp=1000;oldGrenade.x=600;oldGrenade.y=300;oldGrenade.life=0;bullets=[oldGrenade];tick(.001)");assert.equal(run('enemies[0].hp'),1000,'old timed grenade retains old radius');run('newGrenade.x=600;newGrenade.y=300;newGrenade.life=0;bullets=[newGrenade];tick(.001)');assert.ok(run('enemies[0].hp<1000'),'new timed grenade uses expanded radius');
setup('harpoon');offer();run("chooseWeaponEvolution('harpoon-pressurePiston',offerVersion);enemies=[createEnemy(700,300,'shieldPolice')];globalThis.shielded=enemies[0];globalThis.bodyHp=shielded.hp;shielded.shieldHp=50;emitProjectiles(0);impact(shielded,bullets[0])");assert.equal(run('shielded.shieldHp'),0);assert.equal(run('shielded.hp'),run('bodyHp'),'evolved harpoon still cannot leak shield-breaking excess to the body');
console.log('24 refits passed: level20, all modifiers, ammo/reload, pause, refusal, keyboard, stale callbacks, reset, profile isolation, projectile snapshots and police shields.');
