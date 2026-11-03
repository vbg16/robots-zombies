/* Separate controlled components from real progression. No player immunity or hidden upgrades in real attempts. */
const fs=require('node:fs');
const crypto=require('node:crypto');
const assert=require('node:assert/strict');
const recipeFile=process.env.BUILD_RECIPES;
const recipeSource=recipeFile?fs.readFileSync(recipeFile,'utf8'):null;
// JSON-only experimental recipes; never mutate the game catalog to try a hypothesis.
const builds=recipeSource?JSON.parse(recipeSource):require('../builds.js').builds;
const duration=Number(process.env.BUILD_DURATION||1200);
const seeds=(process.env.BUILD_SEEDS||'20261102').split(',').map(Number);
const only=process.env.BUILD_ONLY;
const excludedCases=new Set((process.env.BUILD_EXCLUDE_CASES||'').split(',').filter(Boolean));
const benchOnly=process.argv.includes('--bench-only');
const realOnly=process.argv.includes('--real-only');
const useRefits=process.env.BUILD_REFITS==='1';
const dt=.05;
const policy={fixedBeforeResults:true,structural:'6 chassis,12 weapons,52 normal nodes,18 chassis protocols,82 unique canonical modules; valid prerequisite closure for all10 recipes',numeric:'All sampled positions,HP,damage,rate and entity coordinates finite; no runtime exceptions',synthetic:'Every mature build must damage a stationary target and a stationary boss at production HP; report60s nonkill as censored,not fabricated TTK',real:'Viability target: survive1200s and defeat at least3 bosses with naturally offered upgrades. Report all failures; no automatic approval from synthetic power.',driver:'Same8-direction threat-scored movement and target selection for all builds;20Hz physics,5Hz decisions; no invulnerability,no added damage/healing,no forced boss death,no spawn suppression,no living-enemy culling.'};
const driverVersion=9; // Attack an in-range boss while retaining a sixty-pixel immediate-threat guard.
const frozenSources=Object.fromEntries(['game.js','balance.js','builds.js'].map(file=>[file,fs.readFileSync(file,'utf8')]));
const frozenBootstrap=fs.readFileSync('tests/combat.cjs','utf8').split('assert.match(')[0];

function harness(seed){
 let setup=frozenBootstrap;
 setup=setup.replace('Math,Set,localStorage','Math:Object.create(Math),Set,localStorage');
 setup=setup.replace("vm.runInContext(fs.readFileSync('game.js','utf8'),context);","window.localStorage=localStorage;vm.runInContext("+JSON.stringify(frozenSources['balance.js'])+",context);vm.runInContext("+JSON.stringify(frozenSources['game.js'])+",context);");
 const h=new Function('require',setup+';return {context,run:s=>vm.runInContext(s,context)};')(require);
 h.context.qaSeed=seed>>>0;h.context.qaUseRefits=useRefits;
 h.run(`Math.random=()=>{qaSeed=(Math.imul(qaSeed,1664525)+1013904223)>>>0;return qaSeed/4294967296};
 profile=emptyProfile();profile.unlockedRobots=Object.fromEntries(Object.keys(ROBOTS).map(id=>[id,true]));profile.unlockedWeapons=Object.fromEntries(Object.keys(WEAPONS).map(id=>[id,true]));saveProfile();
 globalThis.qa={damage:{},received:0,receivedBySource:{},healing:0,bosses:[],choices:[],maxEnemies:0,maxBullets:0,maxHostile:0,controlEnemySeconds:0,distance:0};
 globalThis.qaDamage=damageEnemy;damageEnemy=function(z,n,source='direct'){const before=z.hp;const wasBoss=z===boss;qaDamage(z,n,source);const effective=Math.max(0,before-z.hp);qa.damage[source]=(qa.damage[source]||0)+effective;if(wasBoss&&before>0&&z.hp===0)qa.bosses.push({id:z.id,at:clock,ttk:clock-(z.qaSpawnAt||0)});};
 globalThis.qaSpawn=spawnBoss;spawnBoss=function(){const result=qaSpawn();if(boss)boss.qaSpawnAt=clock;return result;};
 globalThis.qaHurt=hurtPlayer;hurtPlayer=function(...args){const hp=player.hp;const kind=args[3]||(boss&&Math.hypot((args[1]||0)-boss.x,(args[2]||0)-boss.y)<2?'boss-contact':'contact-or-projectile');const result=qaHurt(...args);const loss=Math.max(0,hp-player.hp);qa.received+=loss;qa.receivedBySource[kind]=(qa.receivedBySource[kind]||0)+loss;return result;};
 globalThis.qaHeal=healPlayer;healPlayer=function(...args){const hp=player.hp;const result=qaHeal(...args);qa.healing+=Math.max(0,player.hp-hp);return result;};
 // Rendering is not part of these headless physics tests.
 drawMinimap=()=>{};updateHUD=()=>{};
 `);
 return h;
}
const read=(h,s)=>JSON.parse(h.run(`JSON.stringify(${s})`));
function equip(h,b){h.context.qaBuild=b;h.run('selectedRobot=qaBuild.robot;selectedWeapon=qaBuild.weapon;reset()');}
function structure(){
 const h=harness(1);h.run('reset()');
 assert.equal(h.run('Object.keys(ROBOTS).length'),6);
 assert.equal(h.run('Object.keys(WEAPONS).length'),12);
 assert.equal(h.run('SKILLS.length'),52);
 assert.equal(h.run('Object.values(SPECIALIZATIONS).flat().length'),18);
 assert.equal(h.run('window.ScrewBalance.catalog.length'),82);
 assert.equal(h.run('new Set(window.ScrewBalance.catalog.map(x=>x.id)).size'),82);
 assert.equal(h.run('window.ScrewBalance.validate(window.ScrewBalance.load()).ok'),true);
 assert.equal(builds.length,10);assert.equal(h.run('Object.values(WEAPON_EVOLUTIONS).flat().length'),24);for(const b of builds)assert.equal(h.run("WEAPON_EVOLUTIONS["+JSON.stringify(b.weapon)+"].some(e=>e.id==="+JSON.stringify(b.evolution)+")"),true);
 for(const b of builds){equip(h,b);assert.equal(new Set(b.skills).size,8);assert.equal(b.core.length,4);const got=new Set();for(const id of b.skills){const skill=read(h,`SKILLS.find(x=>x.id===${JSON.stringify(id)})`);assert.ok(skill,`${b.id}:${id} exists`);assert.ok(!skill.parent||got.has(skill.parent),`${b.id}:${id} ordered prerequisite`);got.add(id);}for(const id of b.core)assert.ok(got.has(id));assert.equal(h.run('SPECIALIZATIONS[qaBuild.robot].some(x=>x.id===qaBuild.specialization)'),true);}
 return {ok:true,builds:10,catalog:82};
}
function components(){
 const h=harness(17);const close=(value,expected,label)=>assert.ok(Math.abs(value-expected)<1e-7,`${label}:${value} vs ${expected}`);
 h.run('selectedRobot="forge";selectedWeapon="machine";reset();globalThis.sample={hp:1000,maxHp:1000,r:12,x:600,y:300};player.skills.burn=1;applyStatus(sample,{damage:20})');
 close(h.run('player.damage'),19.8,'FORJ direct damage tradeoff');close(h.run('sample.burnDps'),13.5,'FORJ burn conversion');
 h.run('selectedRobot="volt";reset();globalThis.origin={hp:1000,maxHp:1000,r:12,x:600,y:300};globalThis.secondary={hp:1000,maxHp:1000,r:12,x:650,y:300};enemies=[origin,secondary];player.skills.shock=1;shockAt(origin,20)');
 close(h.run('secondary.hp'),986.5,'VOLT secondary damage conversion');
 h.run('selectedRobot="swarm";reset();SKILLS.find(x=>x.id==="drones").apply();SKILLS.find(x=>x.id==="dronePair").apply();globalThis.sample={hp:1000,maxHp:1000,r:12,x:600,y:300};enemies=[sample];globalThis.ammoBefore=player.ammo;tickDrones(.05)');
 assert.equal(h.run('droneCount()'),3,'swarm plus drone tree caps at three');assert.equal(h.run('player.ammo'),h.run('ammoBefore'),'drone attacks consume no gun ammo');assert.ok(h.run('sample.hp<1000'),'drones cause real damage');
 h.run('sample.x=player.x+1000;sample.hp=1000;player.droneTimer=0;tickDrones(.05)');assert.equal(h.run('sample.hp'),1000,'drones cannot hit outside range');
 h.run('selectedRobot="nano";selectedWeapon="shotgun";reset();player.hp=50;player.ammo=magazineSize()-1;startReload();tickStatuses(reloadDuration()+.1)');
 close(h.run('player.hp'),50.5,'NANO one of six rounds repairs only one-sixth');
 h.run('player.hp=player.maxHp;player.specialization="repairCharge";player.repairShotReady=false;healPlayer(100)');assert.equal(h.run('player.repairShotReady'),false,'overheal cannot prepare repair charge');
 h.run('player.hp-=1;healPlayer(1)');assert.equal(h.run('player.repairShotReady'),true,'effective healing prepares repair charge');
 return {ok:true,checks:['forge tradeoff+burn','volt secondary','drone count/ammo/range','nano reload fraction','effective-heal gating']};
}
function synthetic(b,stage,group,bossTarget=false){
 const h=harness(121);equip(h,b);
 h.context.qaStage=stage;h.context.qaGroup=group;h.context.qaBossTarget=bossTarget;
 h.run(`
 const installed=qaStage==='base'?[]:qaStage==='core'?qaBuild.core:qaBuild.skills;
 for(const id of installed)SKILLS.find(s=>s.id===id).apply();
 if(qaStage==='mature'){
  for(const id of qaBuild.blessings){const item=GAMBARRAS.find(s=>s.id===id);applyRunBalance(id,item.apply);player.blessings.add(id);}
  for(const id of qaBuild.experiments){const item=BOSS_EXPERIMENTS.find(s=>s.id===id);applyRunBalance(id,item.apply);player.experiments.add(id);}
  state='specialization';offeredSpecializations=[SPECIALIZATIONS[qaBuild.robot].find(s=>s.id===qaBuild.specialization)];chooseSpecialization(qaBuild.specialization,offerVersion);
  if(qaUseRefits){level=20;offerWeaponEvolution();chooseWeaponEvolution(qaBuild.evolution,offerVersion);}
 }
 // Explicit laboratory fixture: stationary targets, no wave pressure, no RNG progression.
 spawn=1e9;bossIndex=1e6;globalThis.qaFixture=[];
 if(qaBossTarget){boss={...BOSS_SCHEDULE[0],x:player.x+90,y:player.y,maxHp:BOSS_SCHEDULE[0].hp,hp:BOSS_SCHEDULE[0].hp,phase:'approach',timer:1000,qaSpawnAt:0};boss.speed=0;tickBoss=()=>{};qaFixture=[boss];}
 else{qaFixture=Array.from({length:qaGroup?7:1},(_,i)=>({x:player.x+90+(i%3)*35,y:player.y+(qaGroup?(Math.floor(i/3)-1)*28:0),r:18,hp:1000000,maxHp:1000000,speed:0,enemyType:'chaser'}));enemies=qaFixture;}
 globalThis.qaElapsed=0;globalThis.qaFirstBoss=null;
 for(let step=0;step<1200;step++){
  if(qaBossTarget&&boss.hp<=0){qaFirstBoss=clock;break;}
  aim={x:qaFixture[0].x-camera.x,y:qaFixture[0].y-camera.y,active:true};firing=true;tick(.05);qaElapsed=clock;
 }
 `);
 const result=read(h,'({elapsed:qaElapsed,damage:qa.damage,total:Object.values(qa.damage).reduce((a,b)=>a+b,0),bossTtk:qaFirstBoss,bossHp:boss?.hp,playerHp:player.hp})');
 assert.ok(result.total>0,`${b.id} ${stage} must damage ${bossTarget?'boss':'target'}`);
 return {stage,fixture:bossTarget?'stationary-production-brute':group?'seven-stationary-highHP':'one-stationary-highHP',...result};
}

const simulation=String.raw`
globalThis.qaDecision=0;globalThis.qaChoices=0;globalThis.qaFinite=true;globalThis.qaLast={x:player.x,y:player.y};globalThis.qaCenter={x:player.x,y:player.y};globalThis.qaTarget=null;
globalThis.qaFireWeapon=fireWeapon;fireWeapon=function(){if(qaTarget?.hp>0)aim={x:qaTarget.x-camera.x,y:qaTarget.y-camera.y,active:true};return qaFireWeapon();};
function qaChoose(){
 let options=[],want=[],choose=null;
 if(state==='upgrade'||state==='reward'){
  options=offeredSkills;want=qaBuild.skills;
  const wanted=want.find(id=>options.some(s=>s.id===id));
  if(!wanted&&state==='upgrade'&&rerollsRemaining>0&&want.some(id=>SKILLS.some(s=>s.id===id&&s.available()))){rerollUpgrade(offerVersion);options=offeredSkills;}
  choose=want.map(id=>options.find(s=>s.id===id)).find(Boolean)||['magnet','dash','damage','rate','freeze','burn','xp','repair','grace','salvage','drones'].map(id=>options.find(s=>s.id===id)).find(Boolean);
  if(choose){qa.choices.push({at:clock,level,kind:state,id:choose.id});chooseSkill(choose.id,offerVersion);}
  else {const skip=el('choices').children.at(-1);skip?.onclick?.();}
 }else if(state==='blessing'){options=offeredBlessings;choose=qaBuild.blessings.map(id=>options.find(s=>s.id===id)).find(Boolean)||options[0];if(choose){qa.choices.push({at:clock,level,kind:state,id:choose.id});chooseBlessing(choose.id,offerVersion);}}
 else if(state==='experiment'){options=offeredExperiments;choose=qaBuild.experiments.map(id=>options.find(s=>s.id===id)).find(Boolean);if(choose){qa.choices.push({at:clock,level,kind:state,id:choose.id});chooseExperiment(choose.id,offerVersion);}else declineExperiment(offerVersion);}
 else if(state==='evolution'){const id=qaUseRefits?qaBuild.evolution:'declined';qa.choices.push({at:clock,level,kind:state,id});if(qaUseRefits)chooseWeaponEvolution(id,offerVersion);else declineWeaponEvolution(offerVersion);}
 else if(state==='specialization'){choose=offeredSpecializations.find(s=>s.id===qaBuild.specialization)||offeredSpecializations[0];if(choose){qa.choices.push({at:clock,level,kind:state,id:choose.id});chooseSpecialization(choose.id,offerVersion);}}
}
function qaDrive(){
 const pool=targets().filter(z=>z.hp>0);
 const nearest=pool.map(z=>({z,d:Math.hypot(z.x-player.x,z.y-player.y)})).sort((a,b)=>a.d-b.d);
 let target=nearest[0]?.z;
 const weaponRange=(runWeapon.speed||540)*player.projectileSpeed*(runWeapon.life||1)*player.projectileLife;
 if(boss?.hp>0&&Math.hypot(boss.x-player.x,boss.y-player.y)<weaponRange*.9&&(!nearest[0]||nearest[0].d>60))target=boss;
 qaTarget=target;
 if(target){const d=Math.hypot(target.x-player.x,target.y-player.y)||1,flight=Math.min(.5,d/((runWeapon.speed||570)*player.projectileSpeed)),status=target.stunTime>0?0:target.slowTime>0?.5:1;let vx=(player.x-target.x)/d*(target.speed||0)*status,vy=(player.y-target.y)/d*(target.speed||0)*status;if(target.policePhase==='charge'){vx=target.chargeDx*340*status;vy=target.chargeDy*340*status;}if(target===boss&&boss.phase!=='approach'){vx=boss.phase==='dash'?boss.dx*360*status:0;vy=boss.phase==='dash'?boss.dy*360*status:0;}aim={x:target.x+vx*flight-camera.x,y:target.y+vy*flight-camera.y,active:true};firing=true;}else firing=false;
 const threat=nearest.slice(0,18);const shots=hostile.filter(b=>Math.hypot(b.x-player.x,b.y-player.y)<350);
 const xpTarget=gems.map(g=>({g,d:Math.hypot(g.x-player.x,g.y-player.y)})).filter(x=>x.d<500).sort((a,b)=>a.d-b.d)[0]?.g;
 const center=boss?.hp>0?boss:qaCenter,orbitRadius=boss?.hp>0?Math.max(80,Math.min(280,weaponRange*.65)):230,orbitAngle=Math.atan2(player.y-center.y,player.x-center.x)+.7,orbitX=center.x+Math.cos(orbitAngle)*orbitRadius,orbitY=center.y+Math.sin(orbitAngle)*orbitRadius;
 let best=-Infinity,bestX=0,bestY=0;
 for(let i=0;i<9;i++){
  const angle=i*Math.PI/4,x=i===8?0:Math.cos(angle),y=i===8?0:Math.sin(angle),px=player.x+x*player.speed*.6,py=player.y+y*player.speed*.6;let score=0;
  const caution=Math.max(35,Math.min(130,weaponRange*.4));
  for(const {z} of threat){const direction=Math.hypot(player.x-z.x,player.y-z.y)||1,factor=z.stunTime>0?0:z.slowTime>0?.5:1;let zx=z.x+(player.x-z.x)/direction*z.speed*.4*factor,zy=z.y+(player.y-z.y)/direction*z.speed*.4*factor;if(z.policePhase==='charge'){zx=z.x+z.chargeDx*Math.min(z.chargeRemaining,340*.4*factor);zy=z.y+z.chargeDy*Math.min(z.chargeRemaining,340*.4*factor);}const distance=Math.hypot(zx-px,zy-py)-z.r;score-=Math.max(0,caution-distance)**2*.15;if(distance<29)score-=10000;if(segmentDistance(z.x,z.y,player.x+x*8,player.y+y*8,px,py)<z.r+17)score-=20000;}
  for(const b of shots){const d=segmentDistance(px,py,b.x,b.y,b.x+b.vx*.5,b.y+b.vy*.5);score-=Math.max(0,55-d)**2*.3;}
  for(const b of shots){const rx=b.x-player.x,ry=b.y-player.y,vx=b.vx-x*player.speed,vy=b.vy-y*player.speed,vv=vx*vx+vy*vy,t=vv?Math.max(0,Math.min(.55,-(rx*vx+ry*vy)/vv)):0;const clearance=Math.hypot(rx+vx*t,ry+vy*t)-(b.r+14);if(clearance<10)score-=15000+(10-clearance)*100;}
  for(const h of hazards)if(h.type==='pool'&&h.delay<.6&&segmentDistance(h.x,h.y,player.x+x*8,player.y+y*8,px,py)<h.r+18)score-=15000;
  for(const h of hazards){const d=Math.hypot(px-h.x,py-h.y);if(h.type==='ring'){if(Math.abs(d-(h.r+h.speed*.5))<45)score-=3000;}else if(d<h.r+35)score-=5000;}
  if(boss?.hp>0&&(boss.phase==='tellDash'||boss.phase==='dash')){const d=segmentDistance(px,py,boss.x,boss.y,boss.x+boss.dx*234,boss.y+boss.dy*234);if(d<boss.r+35)score-=6000;}
  for(const {z} of threat)if(z.policePhase==='aim'||z.policePhase==='charge'){const d=segmentDistance(px,py,z.x,z.y,z.x+z.chargeDx*z.chargeRemaining,z.y+z.chargeDy*z.chargeRemaining);if(d<z.r+30)score-=4000;}
  score-=Math.hypot(orbitX-px,orbitY-py)*.55;
  if(xpTarget)score-=Math.hypot(xpTarget.x-px,xpTarget.y-py)*.25;
  else if(target)score-=Math.abs(Math.hypot(target.x-px,target.y-py)-Math.min(230,weaponRange*.75))*.5;
  score+=Math.sin(clock*.11+i)*.1;
  if(score>best){best=score;bestX=x;bestY=y;}
 }
 keys.clear();if(bestX>.3)keys.add('d');if(bestX<-.3)keys.add('a');if(bestY>.3)keys.add('s');if(bestY<-.3)keys.add('w');
 if(threat[0]?.d<85&&player.skills.dash&&player.dashCooldown<=0)activateDash();
}
for(let step=0;step<Math.ceil(qaDuration/.05)&&state!=='over';){
 if(state!=='playing'){qaChoose();if(++qaChoices>10000)throw Error('Progression choice did not resolve');continue;}
 qaChoices=0;if(step%4===0)qaDrive();
 tick(.05);step++;
 qa.distance+=Math.hypot(player.x-qaLast.x,player.y-qaLast.y);qaLast={x:player.x,y:player.y};
 qa.maxEnemies=Math.max(qa.maxEnemies,enemies.length);qa.maxBullets=Math.max(qa.maxBullets,bullets.length);qa.maxHostile=Math.max(qa.maxHostile,hostile.length);
 qa.controlEnemySeconds+=enemies.filter(z=>z.slowTime>0||z.stunTime>0).length*.05;
 if(step%100===0){qaFinite=qaFinite&&[player.x,player.y,player.hp,player.maxHp,player.damage,player.rate,...enemies.flatMap(z=>[z.x,z.y,z.hp])].every(Number.isFinite);if(!qaFinite)throw Error('Nonfinite runtime state');}
}
globalThis.qaResult={weaponEvolution:player.weaponEvolution?.id||null,time:clock,state,hp:player.hp,maxHp:player.maxHp,level,kills,bossKills,coreReached:qaBuild.core.every(id=>player.acquired.has(id)),recipeReached:qaBuild.skills.every(id=>player.acquired.has(id)),acquired:[...player.acquired],finite:qaFinite,...qa};
`;
function realAttempt(b,seed){const h=harness(seed);equip(h,b);h.context.qaDuration=duration;h.run(simulation);return {build:b.id,seed,...read(h,'qaResult')};}

const file=process.env.BUILD_REPORT||'docs/builds-results.json';
let history=[];try{history=JSON.parse(fs.readFileSync(file,'utf8')).executions||[];}catch{}
const release=JSON.parse(fs.readFileSync('version.json','utf8'));
const execution={at:new Date().toISOString(),version:release,gameplayRevision:process.env.BUILD_REVISION||('build'+release.build+'-refits'),recipeOverride:recipeSource?{file:recipeFile,sha256:crypto.createHash('sha256').update(recipeSource).digest('hex')}:null,refitsEnabled:useRefits,excludedCases:[...excludedCases],sourceHashes:Object.fromEntries(Object.entries(frozenSources).map(([file,source])=>[file,crypto.createHash('sha256').update(source).digest('hex')])),recipes:builds,policy,driverVersion,driverHash:crypto.createHash('sha256').update(simulation).digest('hex'),bootstrapHash:crypto.createHash('sha256').update(frozenBootstrap).digest('hex'),dt,duration,seeds,structure:null,synthetic:[],attempts:[],errors:[]};
history.push(execution);
function persist(){fs.writeFileSync(file,JSON.stringify({note:'All recorded executions retained, including failures. Synthetic fixtures do not represent earned progression.',executions:history},null,2)+'\n');}
try{
 execution.structure=structure();execution.components=components();persist();
 if(!realOnly)for(const b of builds.filter(b=>!only||b.id===only)){for(const stage of ['base','core','mature'])for(const group of [false,true])execution.synthetic.push({build:b.id,...synthetic(b,stage,group)});execution.synthetic.push({build:b.id,...synthetic(b,'mature',false,true)});console.log('SYNTHETIC',b.id);persist();}
 if(!benchOnly)for(const b of builds.filter(b=>!only||b.id===only))for(const seed of seeds){if(excludedCases.has(b.id+':'+seed))continue;const result=realAttempt(b,seed);execution.attempts.push({...result,survivedWindow:result.time>=duration-.1,viable:duration>=1200?result.time>=duration-.1&&result.bossKills>=3:null});persist();console.log('REAL',b.id,seed,Math.round(result.time),result.state,'bosses',result.bossKills,'level',result.level,'core',result.coreReached);}
 execution.completed=true;persist();
}catch(error){execution.errors.push({message:error.message,stack:error.stack});persist();throw error;}
console.log('Results:',file,'real viability',execution.attempts.filter(r=>r.viable).length+'/'+execution.attempts.length);
