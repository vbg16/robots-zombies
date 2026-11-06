'use strict';
const assert=require('node:assert/strict'),{parseArgs,policySource,runBot}=require('../tools/playtest-bot.cjs');
assert.deepEqual(parseArgs(['--mode','simples','--headed','--minutes','.1','--seed','0']).mode,'dumb');
assert.equal(parseArgs(['--headed']).speed,1);assert.equal(parseArgs([]).minutes,20);
for(const args of [['--seed','-1'],['--minutes','0'],['--minutes','NaN'],['--speed','0'],['--mode','invincible'],['--unknown'],['--build']])assert.throws(()=>parseArgs(args));
const policy=policySource();assert.ok(policy.includes('function qaDrive()'));assert.ok(policy.includes('Array.from(el(\'choices\').children).at(-1)'));assert.ok(policy.includes('qaChestTarget?1.2:.25'));
(async()=>{
 for(const mode of ['smart','dumb']){
  const report=await runBot(parseArgs(['--mode',mode,'--minutes','.2','--speed','1000','--seed','20261106','--output','outputs/bot/test-'+mode+'.json']));
  assert.equal(report.status,'duration-reached');assert.ok(report.result.time>=11.99);assert.ok(report.result.kills>0);assert.ok(report.result.shots>0);assert.equal(report.errors.length,0);assert.ok(report.result.distance>0);assert.equal(report.viable,null);
 }
 console.log('Browser bot: CLI guards, shared strategy, two isolated modes, natural combat/movement, terminal reports and no runtime errors passed.');
})().catch(e=>{console.error(e);process.exitCode=1;});
