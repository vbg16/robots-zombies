'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const source=fs.readFileSync('tests/builds-balance.cjs','utf8'),fixture=require('./fixtures/driver13-build56.json'),hash=s=>crypto.createHash('sha256').update(s).digest('hex');
assert.equal(hash(fixture.policy),fixture.sha256);
const localProcess={...process,env:{...process.env,BUILD_PILOT:'smart',BUILD_TELEMETRY:'1'}};
const api=new Function('require','process',source.split('const file=')[0]+';return {harness,equip,simulation,builds};')(require,localProcess);
const observer=['tools/run-telemetry.js','tools/run-observer.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n'),pilot=fs.readFileSync('tools/bot-pilot.js','utf8');
const policy=api.simulation.split('for(let step=')[0];
const snapshot=`JSON.stringify({state,clock,spawn,shot,kills,level,xp,need,player,enemies,boss,bullets,gems,scrap,sparks,feedback,effects,hostile,hazards,weaponSlots,burstQueue,hordeDirector,commonWaveIndex,bossIndex,bossKills,policeUnlocked,bossChests,offerVersion,offeredSkills:offeredSkills.map(s=>s.id),offeredRelics:offeredRelics.map(s=>s.id),profile,aim,camera,keys:[...keys],firing,qa},(k,v)=>v instanceof Set?[...v]:v)`;
const results=[];
for(const id of ['tempestade-balistica','lanca-de-fuga','oficina-viva']){
 const recipe=api.builds.find(b=>b.id===id);assert.ok(recipe,id);
 const base=api.harness(20261106),candidate=api.harness(20261106);for(const h of [base,candidate])api.equip(h,recipe);
 base.run(fixture.policy);candidate.run(observer+'\nglobalThis.qaObserver=ScrewRunObserver.install({maxEvents:5000});');candidate.run(pilot);candidate.run(policy);
 let checkpoints=0;
 for(let step=0;step<3600;step++){
  for(const [h,isCandidate]of [[base,false],[candidate,true]])h.run(`for(let guard=0;state!=='playing'&&state!=='over'&&guard<100;guard++)qaChoose();if(state==='playing'){${step%4===0?(isCandidate?'qaPilot.drive();':'qaDrive();'):''}${isCandidate?'qaPilot.beforeTick();':''}tick(.05);}`);
  if(step%120===0||step===3599){assert.equal(candidate.run(snapshot),base.run(snapshot),id+' full state at '+step);const probe=`(()=>{const saved=qaSeed,next=Array.from({length:16},()=>Math.random());qaSeed=saved;return JSON.stringify(next)})()`;assert.equal(candidate.run(probe),base.run(probe),id+' next RNG');checkpoints++;}
 }
 results.push({build:id,checkpoints,final:JSON.parse(base.run('JSON.stringify({time:clock,state,level,kills,bossKills})'))});
}
function inputWorld(mode){const h=api.harness(42);api.equip(h,api.builds[0]);h.run(fixture.policy);h.run(`enemies=[createEnemy(player.x+200,player.y)];spawn=1e9;bossIndex=1e6;globalThis.driveCalls=0;const drive=qaDrive;qaDrive=()=>{driveCalls++;drive();};globalThis.capturedAim=null;qaFireWeapon=()=>{capturedAim={...aim};return 17;};`);h.run(pilot);h.run(`globalThis.testPilot=ScrewBotPilot.create('${mode}',{seed:42});`);return h;}
const limited=inputWorld('limited');limited.run('globalThis.savedSeed=qaSeed;testPilot.drive();');assert.equal(limited.run('qaSeed===savedSeed'),true,'pilot error must not consume game RNG');assert.equal(limited.run('driveCalls'),1);limited.run('clock=.2;testPilot.drive();');assert.equal(limited.run('driveCalls'),1);limited.run('clock=.4;testPilot.drive();');assert.equal(limited.run('driveCalls'),2);limited.run('globalThis.remembered={...aim};enemies[0].x+=500;fireWeapon(primaryWeaponState());');assert.equal(limited.run('JSON.stringify(capturedAim)'),limited.run('JSON.stringify(remembered)'),'limited fire must use remembered aim after legacy retarget');
const dumb=inputWorld('dumb'),flee=inputWorld('flee');for(const h of [dumb,flee])h.run('testPilot.drive()');assert.equal(dumb.run('JSON.stringify([...keys])'),flee.run('JSON.stringify([...keys])'),'flee movement equals published dumb');assert.equal(flee.run('firing'),false);flee.run('firing=true;testPilot.beforeTick();tick(.05)');assert.equal(flee.run('bullets.length'),0,'no manual shots in flee');assert.equal(flee.run('player.inv'),0,'pilot grants no immunity');
fs.mkdirSync('outputs/bot-pilot',{recursive:true});fs.writeFileSync('outputs/bot-pilot/equivalence.json',JSON.stringify({scope:'Published BUILD56 driver13 vs current smart plus observer, same current physics/seed and inputs; limited/flee input contracts are synthetic perturbations, not human accuracy claims.',baseline:fixture.commit,baselineHash:fixture.sha256,candidatePolicyHash:hash(policy),pilotHash:hash(pilot),results,limitedAndFleeContracts:true},null,2)+'\n');
console.log('Pilot: published driver13 smart state/RNG preserved in three 180s worlds; private error RNG,400ms decisions, remembered aim and no-shot flee contracts passed.');
