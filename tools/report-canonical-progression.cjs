'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const execution=JSON.parse(fs.readFileSync('docs/build51-canonical-progression.json','utf8')).executions.at(-1);
assert.deepEqual(execution.errors,[]);assert.equal(execution.duration,1200);assert.equal(execution.driverVersion,10);assert.equal(execution.excludedCases.length,0);
assert.equal(execution.recipeOverride,null);assert.deepEqual(execution.seeds,[20261103,20261104]);
// This historical reference remains verifiable after later gameplay changes.
const baselineCommit='02ccd8c7f3a284c0ace1e5ee3d26647f17192fbf';
for(const file of ['game.js','balance.js','builds.js']){const source=require('node:child_process').execFileSync('git',['show',baselineCommit+':'+file],{encoding:'utf8'});assert.ok([hash(source),hash(source.replace(/\r?\n/g,'\r\n'))].includes(execution.sourceHashes[file]),file+' does not match the published BUILD51 reference (LF/CRLF)');}
const seen=new Set();for(const a of execution.attempts){const key=a.build+':'+a.seed;assert.ok(!seen.has(key),'duplicate attempt');seen.add(key);assert.ok(execution.recipes.some(b=>b.id===a.build));assert.ok(execution.seeds.includes(a.seed));assert.equal(a.finite,true);assert.equal(a.viable,a.time>=1199.9&&a.bossKills>=3);}
if(execution.completed)assert.equal(seen.size,20,'completed evaluation must cover every recipe and seed');
const rows=execution.recipes.map(b=>{const runs=execution.attempts.filter(a=>a.build===b.id);return {build:b.id,completed:runs.length,expected:2,passed:runs.filter(a=>a.viable).length,runs:runs.map(a=>({seed:a.seed,seconds:a.time,bosses:a.bossKills,level:a.level,coreReached:a.coreReached,recipeReached:a.recipeReached,missingSkills:b.skills.filter(id=>!a.acquired.includes(id)),coreCompletedAt:a.coreReached?Math.max(...b.core.map(id=>a.choices.find(c=>c.id===id)?.at??0)):null,received:a.received,receivedBySource:a.receivedBySource,healing:a.healing,maxEnemies:a.maxEnemies,viable:a.viable}))};});
const report={complete:execution.completed===true,completed:seen.size,expected:20,sourceHashes:execution.sourceHashes,rows,note:'Partial rows are not failures or successes for unfinished seeds. Do not tune attributes until the baseline completes. Natural progression; equipment pre-unlocked for setup only.'};
fs.writeFileSync('docs/build51-canonical-summary.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({complete:report.complete,completed:report.completed,expected:20,rows:rows.map(r=>({build:r.build,completed:r.completed,passed:r.passed}))},null,2));
