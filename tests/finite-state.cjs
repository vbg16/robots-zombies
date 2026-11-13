'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {inspectFiniteState}=require('../tools/finite-state.cjs');
// Deliberately synthetic. No survival, balance, FPS or final-G01 approval.
const prefix=fs.readFileSync('tests/combat.cjs','utf8').split('assert.match(')[0].replace('Math,Set,localStorage','Math:Object.create(Math),Set,localStorage');
const h=new Function('require',prefix+';return {context};')(require),run=s=>vm.runInContext(s,h.context);
run('globalThis.numericFixtureSeed=631337;Math.random=()=>{numericFixtureSeed=(Math.imul(1664525,numericFixtureSeed)+1013904223)>>>0;return numericFixtureSeed/4294967296}');
const failures=[],scenarios=[];let checkpoints=0,numbers=0;
const roots=`({player,weaponSlots,enemies,boss,bullets,hostile,hazards,burstQueue,gems,scrap,sparks,effects,feedback,bossChests,hordeDirector,camera,profile,clock,spawn,shot,kills,level,xp,need,collisionGrid,sparkStream,feedbackMembers,combatNotices})`;
function inspect(label){
 const result=inspectFiniteState(run(roots));checkpoints++;numbers+=result.numbers;
 if(result.invalid.length)failures.push({label,invalid:result.invalid});
 // These weak-map entries are observable through the actual, currently live keys.
 const rotorEntries=run('player.rotorHits.map(map=>targets().map(target=>map.get(target)).filter(v=>v!==undefined))');
 const weakResult=inspectFiniteState(rotorEntries);numbers+=weakResult.numbers;
 if(weakResult.invalid.length)failures.push({label:label+':known rotor targets',invalid:weakResult.invalid});
 return result;
}
const cycle={a:1};cycle.self=cycle;
assert.equal(inspectFiniteState(cycle).invalid.length,0);
assert.equal(inspectFiniteState({x:NaN,map:new Map([[Infinity,-Infinity]]),set:new Set([NaN])}).invalid.length,4);
assert.equal(inspectFiniteState(vm.runInContext('({map:new Map([["bad",Infinity]]),set:new Set([NaN])})',h.context)).invalid.length,2,'cross-realm collections');
assert.equal(inspectFiniteState({weak:new WeakMap()}).opaque.length,1,'opaque storage is reported, never silently approved');
run('profile=emptyProfile();profile.unlockedRobots=Object.fromEntries(Object.keys(ROBOTS).map(id=>[id,true]));profile.unlockedWeapons=Object.fromEntries(Object.keys(WEAPONS).map(id=>[id,true]));');
for(const chassis of run('Object.keys(ROBOTS)'))for(const weapon of run('Object.keys(WEAPONS)')){
 h.context.qaChassis=chassis;h.context.qaWeapon=weapon;
 run('selectedRobot=qaChassis;selectedWeapon=qaWeapon;selectedAuxWeapons=[];reset()');inspect('reset:'+chassis+':'+weapon);
}
// Regression: the BUILD62 pre-fix cue sentinel must be detected before JSON hides it.
run('primaryWeaponState().reloadBlade={lastCue:-Infinity}');
assert.ok(inspectFiniteState(run(roots)).invalid.some(e=>e.path.endsWith('["lastCue"]')));
run('delete primaryWeaponState().reloadBlade');
for(const weapon of run('Object.keys(WEAPONS)')){
 h.context.qaWeapon=weapon;
 run(`selectedRobot='swarm';selectedWeapon=qaWeapon;selectedAuxWeapons=Object.keys(WEAPONS).filter(id=>id!==qaWeapon).slice(0,2);reset();
  spawn=1e6;bossIndex=1e6;player.inv=1e6;
  for(let pass=0;pass<SKILLS.length;pass++){let added=0;for(const skill of SKILLS)if(skill.available()){skill.apply();added++;}if(!added)break;}
  for(const relic of BOSS_RELICS)if(relic.eligible()){player.relics.add(relic.id);relic.apply();}
  enemies=Array.from({length:12},(_,i)=>Object.assign(createEnemy(player.x+60+i*8,player.y+(i%3-1)*10),{r:12,hp:1e8,maxHp:1e8,speed:0}));
  aim={x:player.x+300-camera.x,y:player.y-camera.y,active:true};firing=true;
  for(const slot of weaponSlots){slot.ammo=0;startReload(slot);}
 `);
 const initial=inspect('installed:'+weapon);
 for(let i=0;i<100;i++){run('tick(.05)');inspect('tick:'+weapon+':'+i);}
 run('pause()');inspect('pause:'+weapon);run('tick(2)');inspect('paused tick:'+weapon);
 run('reset()');inspect('cleared:'+weapon);
 scenarios.push({weapon,steps:100,dt:.05,initialOpaque:initial.opaque});
}
const sourceFiles=['game.js','tests/combat.cjs','tools/drone-maturity.js','tools/segment-circle.js','tools/rupture-chamber.js','tools/finite-state.cjs','tests/finite-state.cjs'];
const result={kind:'synthetic-finite-state-regression',at:new Date().toISOString(),node:process.version,fixtureSeed:631337,
 sourceHashes:Object.fromEntries(sourceFiles.map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')])),
 gameSha256:crypto.createHash('sha256').update(fs.readFileSync('game.js')).digest('hex'),
 checkpoints,numbers,scenarios,failures,passed:failures.length===0,
 limitations:['Synthetic gear/relic installation, protected player and suspended spawn; not natural runs.','All selected roots are inspected before JSON serialization. Functions and closure state are outside this graph.','Weak collections are opaque; rotor entries are additionally checked for current live targets only.','Not final G01, long-duration, full audio-state or final-commit acceptance.']};
fs.mkdirSync('outputs/finite-state63',{recursive:true});fs.writeFileSync('outputs/finite-state63/result.json',JSON.stringify(result,null,2));
assert.equal(failures.length,0,JSON.stringify(failures.slice(0,5)));
console.log('Finite-state regression passed: '+checkpoints+' checkpoints, '+numbers+' numeric observations; synthetic scope and opaque collections recorded.');
