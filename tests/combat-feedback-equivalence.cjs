'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const baselineCommit='961f6ec45f960bfc935ab074e49450d83a56fff3';
const fixture=JSON.parse(fs.readFileSync('tests/fixtures/game-build54.json','utf8')),baseline=fixture.source;
const candidate=fs.readFileSync('game.js','utf8'),balance=fs.readFileSync('balance.js','utf8');
const prefix=fs.readFileSync('tests/combat.cjs','utf8').split('assert.match(')[0];
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const legacyRelicIds=['thermalRelay','cryoLens','arcCapacitor','droneRack','scanArray','rotorBearing','corrosionChamber','precisionBreech','blastManifold','feedServo','reactorHeart','overclockCore'];
assert.equal(fixture.commit,baselineCommit);assert.equal(hash(baseline),fixture.sha256,'published baseline fixture must retain its exact bytes');
function legacyPoolSource(source){
 const isReference=source===baseline;
 // Correct only the archived reference's known shield-status defect. Production
 // candidate code is never normalized here; shield-status.cjs tests it directly.
 if(isReference){const previous="damageEnemy(z,b.damage,'bullet',b);if(!shielded)applyCorrosion(z,b);applyStatus(z,b);";assert.ok(source.includes(previous),'archived shield impact hook changed');source=source.replace(previous,"damageEnemy(z,b.damage,'bullet',b);if(!shielded){applyCorrosion(z,b);applyStatus(z,b);}");}
 // A second archived defect applied stun after absorbed electrical damage.
 if(isReference){const previous='for(const t of near){const before=t.hp;effects.push(';assert.ok(source.includes(previous),'archived electrical hook changed');source=source.replace(previous,"for(const t of near){const before=t.hp,shielded=t.enemyType==='shieldPolice'&&t.shieldHp>0;effects.push(");const status='if(stun&&t.hp>0)t.stunTime=Math.max(t.stunTime||0,stun);';assert.ok(source.includes(status),'archived stun hook changed');source=source.replace(status,'if(!shielded&&stun&&t.hp>0)t.stunTime=Math.max(t.stunTime||0,stun);');}
 // Freeze the pre-BUILD59 offer pool for this legacy equivalence experiment.
 // Post-BUILD58 relics intentionally change normal chest RNG/options. The terminal-death fixes have separate negative-baseline regressions; these32worlds do not prove preservation of those bugs.
 const pool="const candidates=BOSS_RELICS.filter(r=>";assert.ok(source.includes(pool),'legacy offer pool hook changed');
 return source.replace(pool,pool+JSON.stringify(legacyRelicIds)+'.includes(r.id)&&');
}
function harness(source){
 const legacySource=legacyPoolSource(source);
 const setup=prefix.replace('Math,Set,localStorage','Math:Object.create(Math),Set,localStorage').replace("vm.runInContext(fs.readFileSync('game.js','utf8'),context);","window.localStorage=localStorage;vm.runInContext(balanceSource,context);vm.runInContext(gameSource,context);");
 const {context}=new Function('require','balanceSource','gameSource',setup+';return {context};')(require,balance,legacySource);
 return script=>vm.runInContext(script,context);
}
// Every field below is gameplay or a pre-existing combat effect. Feedback records and
// the new cosmetic IDs/notice queue are deliberately excluded, because those are the change. Maturation acquisition time is bookkeeping;
// The BUILD59 spatial relic is not installed in this legacy fixture.
// these6s worlds explicitly stop before its first30s gameplay stage.
const snapshot=`JSON.stringify({state,clock,spawn,shot,kills,level,xp,need,player,enemies,boss,bullets,gems,scrap,sparks,effects,hostile,hazards,weaponSlots,weaponFireCursor,runWeapon,runRobot,burstQueue,hordeDirector,commonWaveIndex,bossIndex,bossKills,policeUnlocked,bossSpawned,bossDefeated,bossReward,bossChests,offerVersion,offerSource,specializationOffered,weaponEvolutionOffered,evolutionSlotIndex,evolutionPendingSlots,rerollsRemaining,offeredSkills:offeredSkills.map(s=>s.id),offeredBlessings:offeredBlessings.map(s=>s.id),offeredExperiments:offeredExperiments.map(s=>s.id),offeredRelics:offeredRelics.map(s=>s.id),offeredSpecializations:offeredSpecializations.map(s=>s.id),offeredWeaponEvolutions:offeredWeaponEvolutions.map(s=>s.id),profile,aim,camera,keys:[...keys],firing,selectedRobot,selectedWeapon,selectedAuxWeapons,next:Array.from({length:16},()=>Math.random())},(key,value)=>key==='droneGrowthStart'?undefined:value instanceof Set?[...value]:value)`;
const modules=['damage','rate','extra','pierce','blast','blastRadius','shock','conductivity','crit','burn','freeze','knock','magnet','repair','killAmmo','coldReload','drones','rotors','sensor','corrosion'];
const cases=[];
for(const weapon of ['machine','shotgun','burst','sniper','laser','flame','cryo','rocket','grenade','tesla','disc','harpoon'])for(const mode of ['base','modules'])cases.push({name:weapon+'/'+mode,weapon,mode});
cases.push(
 {name:'dual/independent-reload',weapon:'machine',robot:'bastion',aux:['shotgun'],mode:'modules'},
 {name:'triple/elemental-relics',weapon:'flame',robot:'swarm',aux:['cryo','tesla'],mode:'modules',relics:true},
 {name:'triple/return-and-explosion',weapon:'disc',robot:'swarm',aux:['grenade','harpoon'],mode:'modules',relics:true},
 ...['brute','scrapper','coil'].map((boss,index)=>({name:'boss/'+boss,weapon:'machine',mode:'modules',bossIndex:index})),
 {name:'shield/preserve-break-hit',weapon:'laser',mode:'modules',shield:true},
 {name:'death/retry',weapon:'machine',mode:'base',death:true}
);
const results=[];
for(const spec of cases){
 const old=harness(baseline),current=harness(candidate),seed=20261107;
 const setup=`globalThis.feedbackSeed=${seed};Math.random=()=>{feedbackSeed=(Math.imul(feedbackSeed,1664525)+1013904223)>>>0;return feedbackSeed/4294967296};profile=emptyProfile();profile.unlockedRobots=Object.fromEntries(Object.keys(ROBOTS).map(id=>[id,true]));profile.unlockedWeapons=Object.fromEntries(Object.keys(WEAPONS).map(id=>[id,true]));saveProfile();selectedRobot=${JSON.stringify(spec.robot||'prot')};selectedWeapon=${JSON.stringify(spec.weapon)};selectedAuxWeapons=${JSON.stringify(spec.aux||[])};reset();spawn=1e9;bossIndex=1e6;player.inv=${spec.death?'0':'1e9'};enemies=Array.from({length:30},(_,i)=>{const angle=i*2.399963229728653,z=createEnemy(player.x+Math.cos(angle)*(70+i*7),player.y+Math.sin(angle)*(70+i*7));z.hp=z.maxHp=2000;z.speed=12;return z;});aim={x:player.x+120-camera.x,y:player.y-camera.y,active:true};`;
 for(const run of [old,current]){
  run(setup);
  if(spec.mode==='modules')run(`for(const id of ${JSON.stringify(modules)})SKILLS.find(s=>s.id===id).apply()`);
  if(spec.relics)run(`for(const item of BOSS_RELICS)if(${JSON.stringify(legacyRelicIds)}.includes(item.id)&&item.eligible()){state='relic';offeredRelics=[item];offerVersion++;chooseRelic(item.id,offerVersion)}`);
  if(spec.bossIndex!==undefined)run(`bossIndex=${spec.bossIndex};spawnBoss();boss.x=player.x+150;boss.y=player.y;`);
  if(spec.shield)run(`globalThis.feedbackShield=createEnemy(player.x+65,player.y,'shieldPolice');feedbackShield.speed=0;enemies.unshift(feedbackShield)`);
  if(spec.death)run('player.hp=6;enemies=[{x:player.x,y:player.y,hp:1000,maxHp:1000,speed:0,r:15,enemyType:"chaser"}]');
  run('firing=true');
 }
 const hashes=[];
 for(let frame=0;frame<360;frame++){
  let action='';
  if(frame===45)action+='reloadAllWeapons();';
  if(frame===80)action+='pause();tick(1);pause();firing=true;';
  if(frame===120)action+='toast("TESTE VISUAL A");toast("TESTE VISUAL B");toast("TESTE VISUAL C");';
  if(frame===150&&spec.bossIndex!==undefined)action+='damageEnemy(boss,1e9,"bullet");';
  if(frame===151&&spec.bossIndex!==undefined)action+='player.x=bossChests[0].x;player.y=bossChests[0].y;';
  if(frame===160&&spec.death)action+='reset();spawn=1e9;bossIndex=1e6;';
  if(frame===240)action+='clearInput();';
  if(frame===255)action+='aim.active=true;firing=true;';
  action+=`if(state==='relic')chooseRelic(offeredRelics[0].id,offerVersion);else if(state==='upgrade'||state==='reward')el('choices').children.at(-1).onclick();else if(state==='blessing')el('choices').children.at(-1).onclick();tick(1/60);`;
  if(frame%31===0)action+='draw();';
  old(action);current(action);current("if(Number.isFinite(player.droneGrowthStart)&&clock-player.droneGrowthStart>=30)throw Error('Legacy comparison reached new maturation stage');");
  if(frame%30===0||frame===359){const before=old(snapshot),after=current(snapshot);assert.equal(after,before,spec.name+' frame '+frame+' gameplay and next RNG');hashes.push(hash(after));}
 }
 results.push({name:spec.name,steps:360,checkpoints:hashes.length,identical:true,stateHashes:hashes});
}
const report={referenceCorrections:[{id:'shield-electric-stun',scope:'archived baseline only',reason:'absorbed electrical hits cannot install stun, including shield break; shield-shock.cjs reproduces the old failure independently'},{id:'shield-status',scope:'archived baseline only',reason:'approved contract blocks impact states while shielded, including break; shield-status.cjs independently reproduces old failure and verifies production'}],legacyOfferPoolIds:legacyRelicIds,legacyOfferPool:true,executionBaselineHash:hash(legacyPoolSource(baseline)),executionCandidateHash:hash(legacyPoolSource(candidate)),bookkeepingExclusions:['droneGrowthStart'],newMechanicScope:'The thirteenth through sixteenth relics are excluded from this controlled legacy offer pool and not installed. All worlds stay below first30s maturation stage; damage/range/state/RNG still exact. New features and normal16-relic offers have separate integration tests.',kind:'combat-feedback-gameplay-equivalence',baselineCommit,baselineHash:hash(baseline),candidateHash:hash(candidate),balanceHash:hash(balance),harnessHash:hash(prefix),verifierHash:hash(fs.readFileSync(__filename)),excluded:['feedback','cosmetic IDs','notice queue/DOM'],note:'32 controlled fixtures,360steps each. High-HP targets/immunity are fixture retention only; separate death/retry world uses real damage. Not natural progression, balance approval, graphic performance, or subjective readability.',cases:results};
fs.mkdirSync('outputs/combat-feedback',{recursive:true});fs.writeFileSync('outputs/combat-feedback/equivalence.json',JSON.stringify(report,null,2)+'\n');
console.log(results.length+' feedback worlds match the corrected legacy contract (12-relic pool and two shield-state fixes): gameplay/effects/profile/rewards and next RNG at '+results.reduce((n,r)=>n+r.checkpoints,0)+' checkpoints.');
