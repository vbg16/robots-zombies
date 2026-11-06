'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const bootstrap=fs.readFileSync('tests/combat.cjs','utf8').split('assert.match(')[0];
function measure(dt,defeatBosses){
 const {context}=new Function('require',bootstrap+';return {context};')(require);
 context.auditDt=dt;context.auditDefeatBosses=defeatBosses;
 vm.runInContext(`
 reset();globalThis.auditWaves=[];globalThis.auditMinions=[];
 const originalWave=spawnCircularWave,originalMinions=spawnBossMinions;
 spawnCircularWave=function(capacity){const before=enemies.length;originalWave(capacity);const born=enemies.slice(before);auditWaves.push({at:clock,count:born.length,police:born.filter(isPolice).length,interval:spawn});};
 spawnBossMinions=function(owner){const count=originalMinions(owner);auditMinions.push({at:clock,boss:owner.id,count});return count;};
 // Spawn-schedule fixture only: no firing, no deaths, discard entities after counting.
 // This does not measure survival, kills or the number simultaneously alive in a real run.
 drawMinimap=()=>{};updateHUD=()=>{};
 for(let step=0;step<Math.round(300/auditDt);step++){
  player.inv=100;tick(auditDt);
  if(state==='experiment')declineExperiment(offerVersion);
  if(auditDefeatBosses&&boss?.hp>0)damageEnemy(boss,boss.hp+1);
  enemies=[];hostile=[];hazards=[];
 }
 globalThis.auditResult={time:clock,waves:auditWaves,minions:auditMinions};
 `,context);
 const result=JSON.parse(vm.runInContext('JSON.stringify(auditResult)',context));
 assert.ok(Math.abs(result.time-300)<1e-6,'fixture must reach five minutes of combat');
 for(const wave of result.waves)assert.equal(wave.count,15);
 const minutes=Array.from({length:5},(_,i)=>{const waves=result.waves.filter(w=>w.at>(i*60+1e-7)&&w.at<=((i+1)*60+1e-7));return {minute:i+1,waves:waves.length,zombies:waves.reduce((n,w)=>n+w.count,0),police:waves.reduce((n,w)=>n+w.police,0)};});
 return {dt,scenario:defeatBosses?'bosses-defeated-immediately':'first-boss-left-alive',minutes,totalCommon:result.waves.reduce((n,w)=>n+w.count,0),firstWave:result.waves[0],lastWave:result.waves.at(-1),minions:result.minions};
}
const cases=[measure(1/60,false),measure(.05,false),measure(1/60,true),measure(.05,true)];
for(let i=0;i<2;i++)assert.equal(cases[i].totalCommon,cases[i+2].totalCommon,'boss state preserves common spawn count at the same frame rate');
const report={build:JSON.parse(fs.readFileSync('version.json')).build,sourceHash:crypto.createHash('sha256').update(fs.readFileSync('game.js')).digest('hex'),note:'300 seconds of combat clock; menus and choices pause the clock. Spawn counts only, not concurrent alive enemies. Immediate boss defeats are a schedule fixture, not a natural playtest.',cases};
fs.writeFileSync('docs/horde-first-five-minutes.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
