'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
let prefix=fs.readFileSync('tests/combat.cjs','utf8').split('assert.match(')[0];
prefix=prefix.replace("vm.runInContext(fs.readFileSync('game.js','utf8'),context);","window.localStorage=localStorage;vm.runInContext(fs.readFileSync('balance.js','utf8'),context);vm.runInContext(fs.readFileSync('game.js','utf8'),context);");
const h=new Function('require',prefix+';return {context,elements,listeners,storage};')(require),run=s=>vm.runInContext(s,h.context);
const read=s=>JSON.parse(run('JSON.stringify('+s+')'));
function setup(robot='prot',weapons=['machine']){run(`profile.unlockedRobots=Object.fromEntries(Object.keys(ROBOTS).map(id=>[id,true]));profile.unlockedWeapons=Object.fromEntries(Object.keys(WEAPONS).map(id=>[id,true]));selectedRobot=${JSON.stringify(robot)};selectedWeapon=${JSON.stringify(weapons[0])};selectedAuxWeapons=${JSON.stringify(weapons.slice(1))};reset();spawn=10000;bossIndex=100;boss=null;enemies=[];`);}
function offer(){run('level=19;xp=need;tick(.01)');assert.equal(run('state'),'gambiarra');}
function select(chassis=0,weapon=0){run(`chooseGambiarraChassis(SPECIALIZATIONS[runRobot.id][${chassis}].id,offerVersion);for(const slot of weaponSlots)chooseGambiarraWeapon(slot.index,WEAPON_EVOLUTIONS[slot.weapon.id][${weapon}].id,offerVersion);`);}
let checks=0;function check(name,fn){fn();checks++;console.log('PASSED: '+name);}
check('early milestones3/6/9/10 are ordinary modules and20 is the only special offer',()=>{
 for(const n of [3,6,9,10,19,21]){setup();run(`level=${n-1};xp=need;tick(.01)`);assert.equal(run('state'),'upgrade');assert.equal(run('player.specialization'),null);}
 setup();offer();assert.equal(run('player.specialization'),null);assert.equal(run('player.weaponEvolution'),null);assert.equal(run('GAMBARRAS.length+BOSS_EXPERIMENTS.length'),0);
 for(const fn of ['offerBlessing()','offerSpecialization()','offerWeaponEvolution()','chooseExperiment("volatileReactor",offerVersion)'])assert.equal(run(fn),false);
});
check('preview is inert and partial, foreign, stale or repeated confirmation is refused',()=>{
 setup();offer();const before=run('JSON.stringify({player,weaponSlots,profile})'),v=run('offerVersion');
 assert.equal(run('confirmGambiarra(offerVersion)'),false);assert.equal(run('chooseGambiarraChassis("grounding",offerVersion)'),false);select();assert.equal(run('JSON.stringify({player,weaponSlots,profile})'),before);
 assert.equal(run('confirmGambiarra(offerVersion-1)'),false);assert.equal(run('confirmGambiarra(offerVersion)'),true);const after=run('JSON.stringify({player,weaponSlots,profile})');assert.equal(run(`confirmGambiarra(${v})`),false);assert.equal(run('JSON.stringify({player,weaponSlots,profile})'),after);
});
check('all six chassis and12weapons install both halves; ammo/reload, old shots and profile stay intact',()=>{
 for(const robot of read('Object.keys(ROBOTS)'))for(const weapon of read('Object.keys(WEAPONS)')){
  setup(robot,[weapon]);offer();run('player.ammo=1;player.reloadTime=.4;player.reloadTotal=.8;bullets=[{damage:7,life:.5,weapon:runWeapon}];');const before=run('JSON.stringify({profile,ammo:player.ammo,reload:player.reloadTime,total:player.reloadTotal,bullets})');
  select();assert.equal(run('confirmGambiarra(offerVersion)'),true);assert.ok(run('player.specialization'));assert.ok(run('player.weaponEvolution'));assert.ok(run('player.gambiarra'));assert.equal(run('JSON.stringify({profile,ammo:player.ammo,reload:player.reloadTime,total:player.reloadTotal,bullets})'),before);
 }
});
check('multiweapon choice is independent per slot and one installation grants exactly one breather',()=>{
 setup('swarm',['machine','shotgun','cryo']);offer();run('chooseGambiarraChassis("droneRelay",offerVersion);for(const slot of weaponSlots)chooseGambiarraWeapon(slot.index,WEAPON_EVOLUTIONS[slot.weapon.id][slot.index%2].id,offerVersion);globalThis.near=Object.assign(createEnemy(player.x+50,player.y),{hp:100});enemies=[near];globalThis.oldMagnet=player.magnet;');
 assert.equal(run('confirmGambiarra(offerVersion)'),true);assert.deepEqual(read('weaponSlots.map(s=>s.weaponEvolution.id)'),['machine-heavyFeed','shotgun-wideBore','cryo-iceDrill']);assert.equal(run('near.x-player.x'),170);assert.equal(run('near.stunTime'),.5);assert.equal(run('player.magnet'),run('oldMagnet*1.25'));
});
check('refusal consumes the offer without powers or breather and reset removes temporary assembly',()=>{
 setup();offer();select();run('enemies=[Object.assign(createEnemy(player.x+50,player.y),{hp:100})];');assert.equal(run('declineGambiarra(offerVersion)'),true);assert.equal(run('player.specialization'),null);assert.equal(run('player.weaponEvolution'),null);assert.equal(run('enemies[0].x-player.x'),50);assert.equal(run('offerGambiarra()'),false);
 setup();offer();select();run('confirmGambiarra(offerVersion);reset()');assert.equal(run('player.gambiarra'),null);assert.equal(run('player.specialization'),null);assert.equal(run('player.weaponEvolution'),null);
});
check('boss chest exhaustion goes straight to ordinary modules, never experiments',()=>{
 setup();run('for(const item of BOSS_RELICS)player.relics.add(item.id);offerBossRelic({bossName:"TESTE"})');assert.equal(run('state'),'reward');assert.equal(run('offeredExperiments.length'),0);assert.equal(run('player.experiments.size'),0);
});
check('revision8 keeps edits and custom modules, migrates chassis to20 and permanently retires12old records',()=>{
 const old=JSON.parse(fs.readFileSync('tests/fixtures/balance-revision7.json','utf8'));old.find(s=>s.id==='damage').name='Meu dano';old.find(s=>s.id==='damage').effects[0].value=2.4;old.find(s=>s.id==='tailDecoy').name='Minha gambiarra';
 const migrated=run(`window.ScrewBalance.migrate(${JSON.stringify(old)},7)`);assert.equal(migrated.length,74);assert.equal(run(`window.ScrewBalance.validate(${JSON.stringify(migrated)}).ok`),true);assert.equal(migrated.find(s=>s.id==='damage').effects[0].value,2.4);assert.equal(migrated.find(s=>s.id==='tailDecoy').name,'Minha gambiarra');assert.equal(migrated.find(s=>s.id==='tailDecoy').unlockLevel,20);assert.equal(migrated.find(s=>s.id==='tailDecoy').type,'Gambiarra');assert.equal(migrated.some(s=>s.id==='pulseCoil'||s.type==='Experimento'),false);
 assert.equal(JSON.stringify(run(`window.ScrewBalance.migrate(${JSON.stringify(migrated)},8)`)),JSON.stringify(migrated));
});
console.log(checks+' unified progression groups passed.');

