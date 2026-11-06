'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let prefix=fs.readFileSync('tests/combat.cjs','utf8').split('assert.match(')[0];
prefix=prefix.replace("vm.runInContext(fs.readFileSync('game.js','utf8'),context);","window.localStorage=localStorage;vm.runInContext(fs.readFileSync('balance.js','utf8'),context);vm.runInContext(fs.readFileSync('game.js','utf8'),context);");
const h=new Function('require',prefix+';return {context,storage,elements,listeners};')(require),run=s=>vm.runInContext(s,h.context),json=s=>JSON.parse(run('JSON.stringify('+s+')'));
const close=(a,b,label)=>assert.ok(Math.abs(a-b)<1e-8,label+': '+a+' vs '+b);
function setup(primary='machine',aux=[]){h.context.qaPrimary=primary;h.context.qaAux=aux;run(`profile=emptyProfile();profile.unlockedRobots=Object.fromEntries(Object.keys(ROBOTS).map(id=>[id,true]));profile.unlockedWeapons=Object.fromEntries(Object.keys(WEAPONS).map(id=>[id,true]));selectedRobot='swarm';selectedWeapon=qaPrimary;selectedAuxWeapons=qaAux.slice();reset();spawn=1e9;bossIndex=1e6;player.inv=1e6;`);}
function acquire(id){run(`SKILLS.find(s=>s.id===${JSON.stringify(id)}).apply()`);}
function install(id){run(`state='relic';offeredRelics=[BOSS_RELICS.find(r=>r.id===${JSON.stringify(id)})];offerVersion++;`);assert.equal(run(`chooseRelic(${JSON.stringify(id)},offerVersion)`),true,id+' installs');}
setup();assert.equal(run('BOSS_RELICS.length'),12);assert.equal(run('new Set(BOSS_RELICS.map(r=>r.id)).size'),12);
const specific={thermalRelay:['flame','burn'],cryoLens:['cryo','freeze'],arcCapacitor:['tesla','shock']};
for(const [id,[weapon,skill]] of Object.entries(specific)){
 setup();assert.equal(run(`!!BOSS_RELICS.find(r=>r.id==='${id}').eligible()`),false,id+' unavailable without matching hardware');
 setup('machine',[weapon]);assert.equal(run(`!!BOSS_RELICS.find(r=>r.id==='${id}').eligible()`),true,id+' accepts auxiliary intrinsic');
 setup();acquire(skill);assert.equal(run(`!!BOSS_RELICS.find(r=>r.id==='${id}').eligible()`),true,id+' accepts acquired element');
}
for(const [id,skill] of [['scanArray','sensor'],['rotorBearing','rotors'],['corrosionChamber','corrosion']]){setup();assert.equal(run(`!!BOSS_RELICS.find(r=>r.id==='${id}').eligible()`),false);acquire(skill);assert.equal(run(`!!BOSS_RELICS.find(r=>r.id==='${id}').eligible()`),true);}
setup();assert.equal(run("BOSS_RELICS.find(r=>r.id==='droneRack').eligible()"),true,'native ENXA drone is eligible');run("selectedRobot='prot';reset()");assert.equal(run("BOSS_RELICS.find(r=>r.id==='droneRack').eligible()"),false);acquire('drones');assert.equal(run("BOSS_RELICS.find(r=>r.id==='droneRack').eligible()"),true);
for(const [id,weapon] of [['precisionBreech','harpoon'],['blastManifold','grenade']]){setup();assert.equal(run(`BOSS_RELICS.find(r=>r.id==='${id}').eligible()`),false);setup('machine',[weapon]);assert.equal(run(`BOSS_RELICS.find(r=>r.id==='${id}').eligible()`),true);}

// Every real relic path applies once without spending profile currency, ammo or reload progress.
for(const id of json('BOSS_RELICS.map(r=>r.id)')){
 const guns=id==='precisionBreech'?['machine',['sniper','harpoon']]:id==='blastManifold'?['rocket',['grenade','machine']]:['flame',['cryo','tesla']];
 setup(...guns);for(const s of ['sensor','rotors','corrosion'])acquire(s);
 run('player.hp=50;for(const s of weaponSlots){s.ammo=1;s.reloadTime=1.23;s.reloadTotal=2.34;}globalThis.beforeRelic={profile:JSON.stringify(profile),hp:player.hp,maxHp:player.maxHp,damage:weaponSlots.map(s=>s.damage),reload:weaponSlots.map(s=>s.reloadMult),progress:weaponSlots.map(s=>[s.ammo,s.reloadTime,s.reloadTotal]),droneDamage:player.droneDamageMult,droneRange:player.droneRange,sensorDamage:player.sensorDamageMult,sensorRate:player.sensorIntervalMult,rotorDamage:player.rotorDamageMult,rotorPeriod:player.rotorPeriodMult};');
 install(id);assert.equal(run('state'),'playing');assert.equal(run(`player.relics.has('${id}')`),true);assert.equal(run('JSON.stringify(profile)'),run('beforeRelic.profile'));assert.deepEqual(json('weaponSlots.map(s=>[s.ammo,s.reloadTime,s.reloadTotal])'),json('beforeRelic.progress'));
 if(id==='thermalRelay'){run('globalThis.target=createEnemy(700,300);target.hp=10000;applyStatus(target,{damage:20,weapon:weaponSlots[0].weapon,vx:1,vy:0})');close(run('target.burnDps'),15,'new burn is amplified');}
 if(id==='cryoLens'){run('globalThis.target=createEnemy(700,300);target.hp=10000;applyStatus(target,{damage:20,weapon:weaponSlots[1].weapon,vx:1,vy:0})');close(run('target.slowTime'),3,'new intrinsic cold duration');}
 if(id==='arcCapacitor'){run('globalThis.from=createEnemy(700,300);globalThis.target=createEnemy(710,300);target.hp=10000;enemies=[from,target];shockAt(from,20,1)');close(run('target.hp'),9986,'real electric damage is amplified');}
 if(id==='droneRack'){close(run('player.droneDamageMult'),run('beforeRelic.droneDamage')*1.5,'drone damage');close(run('player.droneRange'),run('beforeRelic.droneRange')*1.2,'drone range');}
 if(id==='scanArray'){close(run('player.sensorDamageMult'),run('beforeRelic.sensorDamage')*1.5,'sensor damage');close(run('player.sensorIntervalMult'),run('beforeRelic.sensorRate')*.8,'sensor rate');}
 if(id==='rotorBearing'){close(run('player.rotorDamageMult'),run('beforeRelic.rotorDamage')*1.5,'rotor damage');close(run('player.rotorPeriodMult'),run('beforeRelic.rotorPeriod')*.8,'rotor period');}
 if(id==='corrosionChamber'){close(run('player.corrosionDamageMult'),1.5,'corrosion damage');close(run('player.corrosionDelayMult'),.75,'corrosion fuse');}
 if(['precisionBreech','blastManifold','overclockCore'].includes(id))for(let i=0;i<3;i++){const affected=run(`['${id}'].includes('overclockCore')||('${id}'==='precisionBreech'?['sniper','harpoon']:['rocket','grenade']).includes(weaponSlots[${i}].weapon.id)`);close(run(`weaponSlots[${i}].damage`),run(`beforeRelic.damage[${i}]`)*(affected?(id==='overclockCore'?1.25:1.4):1),'selective damage '+i);}
 if(id==='feedServo')for(let i=0;i<3;i++)close(run(`weaponSlots[${i}].reloadMult`),run(`beforeRelic.reload[${i}]`)*.75,'reload '+i);
 if(id==='reactorHeart'){close(run('player.maxHp'),run('beforeRelic.maxHp')+30,'max integrity');close(run('player.hp'),80,'effective repair');}else assert.equal(run('player.hp'),50,'other relics do not cost or grant life');
 run(`state='relic';offeredRelics=[BOSS_RELICS.find(r=>r.id==='${id}')];offerVersion++`);assert.equal(run(`chooseRelic('${id}',offerVersion)`),false,'no duplicate application');
}

setup();acquire('corrosion');run('globalThis.oldTarget=createEnemy(700,300);oldTarget.hp=10000;applyCorrosion(oldTarget,{damage:20});globalThis.oldCharge=JSON.stringify(oldTarget.corrosion)');install('corrosionChamber');assert.equal(run('JSON.stringify(oldTarget.corrosion)'),run('oldCharge'),'installed relic never rewrites existing corrosion snapshots');run('globalThis.newTarget=createEnemy(730,300);newTarget.hp=10000;applyCorrosion(newTarget,{damage:20})');close(run('newTarget.corrosion.damage'),30,'new raw charge amplified');close(run('newTarget.corrosion.remaining'),1.5,'new fuse shortened');

// Actual kills create one physical chest, preserve permanent boss part and delay choice until contact.
for(let index=0;index<3;index++){
 setup();run(`bossIndex=${index};spawnBoss();boss.x=player.x+1000;boss.y=player.y;globalThis.partBefore=profile.bossParts[boss.id];damageEnemy(boss,boss.hp+1);`);
 assert.equal(run('bossChests.length'),1);assert.equal(run('bossChests[0].bossId'),run('boss.id'));assert.equal(run('profile.bossParts[boss.id]'),run('partBefore')+1);assert.equal(run('enemies.some(z=>z.minionOwner===boss.id)'),false);
 run('tick(.01)');assert.equal(run('state'),'playing','defeat alone does not open a choice');
 run('player.x=bossChests[0].x-40;player.y=bossChests[0].y;tick(.01)');assert.equal(run('bossChests.length'),1,'40px boundary remains uncollected');
 run('player.x+=.01;tick(.01)');assert.equal(run('bossChests.length'),0);assert.equal(run('state'),'relic');assert.ok(run('offeredRelics.length>0&&offeredRelics.length<=3'));assert.equal(run('new Set(offeredRelics.map(r=>r.id)).size'),run('offeredRelics.length'));
 assert.equal(run('offeredRelics.every(r=>r.eligible()&&!player.relics.has(r.id))'),true);
 const paused=json('[clock,spawn,hordeDirector,player.x,player.hp]');run('tick(5)');assert.deepEqual(json('[clock,spawn,hordeDirector,player.x,player.hp]'),paused,'choice freezes combat');
 run('globalThis.stale=offerVersion;globalThis.choice=offeredRelics[0].id;offerVersion++');assert.equal(run('chooseRelic(choice,stale)'),false);assert.equal(run('declineRelic(stale)'),false);assert.equal(run('chooseRelic("not-offered",offerVersion)'),false);
 const count=run('player.relics.size');assert.equal(run('declineRelic(offerVersion)'),true);assert.equal(run('player.relics.size'),count,'refusal grants nothing');
}

setup('flame',['cryo','tesla']);acquire('sensor');acquire('rotors');acquire('corrosion');for(let i=0;i<30;i++){run("offerBossRelic({bossName:'FIXTURE'})");assert.equal(run('offeredRelics.filter(r=>["feedServo","reactorHeart","overclockCore"].includes(r.id)).length'),1,'specific hardware keeps a universal alternative');run('declineRelic(offerVersion)');}
run('player.relics=new Set(BOSS_RELICS.map(r=>r.id));offerBossRelic({bossName:"ESGOTADO"})');assert.equal(run('state'),'experiment','exhausted relic pool falls back to original experiments');
setup();run("state='relic';offeredRelics=[BOSS_RELICS.find(r=>r.id==='thermalRelay')];offerVersion++");assert.equal(run("chooseRelic('thermalRelay',offerVersion)"),false,'an ineligible forged offer cannot install');
setup();run('bossChests=[{id:1,bossName:"ONE",x:player.x,y:player.y},{id:2,bossName:"TWO",x:player.x,y:player.y}];xp=need;tick(.01)');assert.equal(run('bossChests.length'),1);assert.equal(run('state'),'relic');assert.equal(run('level'),1,'chest choice does not get overwritten by level-up');run('declineRelic(offerVersion);tick(.01)');assert.equal(run('bossChests.length'),0);assert.equal(run('state'),'relic','second nearby chest waits for the first choice');run('declineRelic(offerVersion);tick(.01)');assert.equal(run('state'),'upgrade');assert.equal(run('level'),2,'queued XP progresses after both chest choices');
setup();install('overclockCore');run('saveProfile()');assert.equal([...h.storage.values()].some(value=>String(value).includes('overclockCore')),false,'temporary relic IDs never enter storage');run("bossChests.push({id:99,x:player.x,y:player.y,bossName:'LEFT'});player.inv=0;hurtPlayer(1e6)");assert.equal(run('state'),'over');const dead=json('[bossChests,player.relics.size]');run('tick(10)');assert.deepEqual(json('[bossChests,player.relics.size]'),dead,'death cannot collect rewards');assert.equal(run('chooseRelic("reactorHeart",offerVersion)'),false);
run('reset()');assert.equal(run('bossChests.length'),0);assert.equal(run('offeredRelics.length'),0);assert.equal(run('player.relics.size'),0);assert.equal(run('player.relicBurnMult'),1);assert.equal(run('player.relicColdMult'),1);assert.equal(run('player.relicShockMult'),1);assert.equal(run('player.damage'),22,'new attempt loses the prior damage relic');
// Minimap preserves a visible edge marker for an uncollected distant chest; draw does not consume RNG.
run('bossChests=[{id:1,bossName:"FAR",x:player.x+100000,y:player.y-100000}];globalThis.mapCalls=[];el("minimap").getContext=()=>new Proxy({},{get:(o,k)=>k==="fillRect"?(...args)=>mapCalls.push({color:o.fillStyle,args}):(o[k]||(()=>{})),set:(o,k,v)=>(o[k]=v,true)});drawMinimap()');
const chestMarker=json('mapCalls.filter(c=>c.color==="#ffd27c")');assert.equal(chestMarker.length,1);assert.ok(chestMarker[0].args[0]>=0&&chestMarker[0].args[0]<160&&chestMarker[0].args[1]>=0&&chestMarker[0].args[1]<100);
run('bossChests[0].x=player.x+100;bossChests[0].y=player.y;globalThis.savedRandom=Math.random;Math.random=()=>{throw Error("Chest rendering consumed RNG")};drawBossChests();draw();Math.random=savedRandom');
console.log('Boss relics: all12, eligibility/support/intrinsic auxiliaries, selective multi-gun gains, unchanged ammo/reload/profile, corrosion snapshots, physical boss drops/40px pickup, pause/stale/refusal/exhaustion, death/reset, minimap and pure draw passed.');
