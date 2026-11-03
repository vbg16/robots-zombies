'use strict';
const assert=require('node:assert/strict');
const {compare,render}=require('../tools/compare-build-runs.cjs');
const fixture=()=>({executions:[{sourceHashes:{'game.js':'game1','balance.js':'config1'},driverVersion:9,dt:.05,duration:1200,refitsEnabled:true,policy:{target:'20m+3boss'},recipes:[{id:'a',name:'A',skills:['damage']}],attempts:[{build:'a',seed:1,time:334.2,bossKills:1,coreReached:false,viable:false,finite:true}]}]});
const before=fixture(),after=fixture();after.executions[0].attempts[0].time=1200;after.executions[0].attempts[0].bossKills=4;after.executions[0].attempts[0].viable=true;after.executions[0].recipes[0].skills=['magnet'];
const result=compare(before,after);assert.equal(result.pairs.length,1);assert.deepEqual(result.pairs[0].recipeChanges,['skills']);assert.match(render(result),/5:34 → 20:00/);
const hashedBefore=fixture(),hashedAfter=fixture();for(const e of [hashedBefore.executions[0],hashedAfter.executions[0]]){e.driverHash='driver1';e.bootstrapHash='bootstrap1';}assert.equal(compare(hashedBefore,hashedAfter).pairs.length,1);
for(const field of ['driverHash','bootstrapHash']){const wrong=JSON.parse(JSON.stringify(hashedAfter));wrong.executions[0][field]='changed';assert.throws(()=>compare(hashedBefore,wrong));delete wrong.executions[0][field];assert.throws(()=>compare(hashedBefore,wrong));}
for(const [label,mutate] of [
 ['world',e=>e.sourceHashes['game.js']='game2'],['configuration',e=>e.sourceHashes['balance.js']='config2'],
 ['driver',e=>e.driverVersion=10],['step',e=>e.dt=.04],['window',e=>e.duration=600],['refits',e=>e.refitsEnabled=false],
 ['policy',e=>e.policy.target='easier'],['seed',e=>e.attempts[0].seed=2],['nonfinite',e=>e.attempts[0].finite=false],
 ['duplicate',e=>e.attempts.push({...e.attempts[0]})],['missing identity',e=>delete e.sourceHashes['game.js']],
 ['false success',e=>e.attempts[0].viable=true],['invalid time',e=>e.attempts[0].time=Infinity]
]){const wrong=fixture();mutate(wrong.executions[0]);assert.throws(()=>compare(before,wrong),undefined,label+' must not silently compare');}
console.log('Paired reports reject changed worlds, settings, drivers, timesteps, targets, seeds, nonfinite and duplicate cases.');
