'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const baseline=fs.readFileSync(process.env.WEAPON_STATE_BASELINE||'outputs/performance/build50-weapon-state/game.js','utf8'),candidate=fs.readFileSync('game.js','utf8');
const prefix=fs.readFileSync('tests/combat.cjs','utf8').split('assert.match(')[0],hash=s=>crypto.createHash('sha256').update(s).digest('hex');
function harness(source){const setup=prefix.replace("vm.runInContext(fs.readFileSync('game.js','utf8'),context);","vm.runInContext(source,context);");const {context}=new Function('require','source',setup+';return {context};')(require,source);context.Math=Object.create(Math);return s=>vm.runInContext(s,context);}
const old=harness(baseline),current=harness(candidate),cases=[];
const weapons=Array.from(current('Object.keys(WEAPONS)'));
for(const weapon of weapons)for(const mode of ['base','modules','refit0','refit1']){
 const setup=`globalThis.weaponSeed=20261103;Math.random=()=>{weaponSeed=(Math.imul(weaponSeed,1664525)+1013904223)>>>0;return weaponSeed/4294967296;};profile.unlockedWeapons=Object.fromEntries(Object.keys(WEAPONS).map(id=>[id,true]));openGarage();selectWeapon('${weapon}');reset();spawn=1e9;bossIndex=1e6;player.inv=1e9;enemies=Array.from({length:45},(_,i)=>{const a=i*2.399963229728653,z=createEnemy(player.x+Math.cos(a)*(70+i*8),player.y+Math.sin(a)*(70+i*8));z.hp=z.maxHp=3000;z.speed=20;return z;});aim={x:player.x+120-camera.x,y:player.y-camera.y,active:true};`;
 for(const run of [old,current]){
  run(setup);
  if(mode==='modules')run("for(const id of ['damage','rate','extra','pierce','blast','blastRadius','shock','conductivity','crit','burn','freeze','knock','magnet','repair','killAmmo','coldReload','drones','rotors','sensor','corrosion'])SKILLS.find(s=>s.id===id).apply()");
  if(mode.startsWith('refit'))run(`level=20;offerWeaponEvolution();chooseWeaponEvolution(offeredWeaponEvolutions[${mode.at(-1)}].id,offerVersion)`);
  run("firing=true;for(let frame=0;frame<240;frame++){if(frame===60)startReload();if(frame===100){pause();tick(1);pause();firing=true;}if(frame===180){clearInput();}if(frame===190)firing=true;tick(1/60);}");
 }
 const snapshot="JSON.stringify({clock,spawn,shot,kills,level,xp,need,player,enemies,boss,bullets,gems,scrap,sparks,effects,feedback,hostile,hazards,runWeapon,burstQueue,next:Array.from({length:10},()=>Math.random())},(k,v)=>v instanceof Set?[...v]:v)";
 const before=old(snapshot),after=current(snapshot);assert.equal(after,before,weapon+'/'+mode+' full combat state and next RNG');cases.push({weapon,mode,steps:240,identical:true,stateHash:hash(after)});
}
const report={kind:'primary-weapon-runtime-full-state-equivalence',baselineHash:hash(baseline),candidateHash:hash(candidate),driverHash:hash(fs.readFileSync(__filename)),note:'48 controlled fixtures, 240 steps each, explicit module/refit installation, high HP and immunity solely for fixture retention. Not natural progression, balance approval or user-facing multi-weapon availability.',cases};
fs.mkdirSync('outputs/performance',{recursive:true});fs.writeFileSync('outputs/performance/weapon-state-equivalence.json',JSON.stringify(report,null,2)+'\n');console.log('48 primary weapon worlds match BUILD50 exactly: ammo, reloads, burst queues, refits, damage, projectiles, entities, effects and next RNG.');
