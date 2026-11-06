'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const old=JSON.parse(fs.readFileSync('docs/build51-canonical-progression.json')).executions.at(-1);
const now=JSON.parse(fs.readFileSync('docs/build52-progression.json')).executions.at(-1);
for(const e of [old,now]){
 assert.equal(e.completed,true);assert.deepEqual(e.errors,[]);assert.equal(e.attempts.length,20);assert.equal(e.duration,1200);assert.equal(e.driverVersion,10);assert.deepEqual(e.seeds,[20261103,20261104]);assert.deepEqual(e.excludedCases,[]);assert.equal(e.recipeOverride,null);assert.equal(e.refitsEnabled,true);
 assert.equal(new Set(e.attempts.map(a=>a.build+':'+a.seed)).size,20);
 for(const a of e.attempts){assert.equal(a.finite,true);assert.equal(a.viable,a.time>=1199.9&&a.bossKills>=3);}
}
// Verify the historical release, even after subsequent gameplay changes.
for(const file of ['game.js','balance.js','builds.js']){
 const source=require('node:child_process').execFileSync('git',['show','804e7f1801ff8a756b6f43844df50702e01ccb88:'+file],{encoding:'utf8'});
 const digest=s=>crypto.createHash('sha256').update(s).digest('hex');
 assert.ok([digest(source),digest(source.replace(/\r?\n/g,'\r\n'))].includes(now.sourceHashes[file]),'BUILD52 source mismatch: '+file);
}
assert.equal(old.driverHash,now.driverHash);assert.equal(old.bootstrapHash,now.bootstrapHash);
const rows=now.recipes.map(b=>({build:b.id,before:old.attempts.filter(a=>a.build===b.id).map(a=>({seed:a.seed,time:a.time,bosses:a.bossKills,viable:a.viable})),after:now.attempts.filter(a=>a.build===b.id).map(a=>({seed:a.seed,time:a.time,bosses:a.bossKills,viable:a.viable,coreReached:a.coreReached,maxEnemies:a.maxEnemies,kills:a.kills}))}));
const report={release:52,completed:true,beforePasses:old.attempts.filter(a=>a.viable).length,afterPasses:now.attempts.filter(a=>a.viable).length,attemptsPerVersion:20,sourceHashes:now.sourceHashes,rows,note:'Paired seeds/driver, natural progression. Director and four weapon modules changed together. Candidate run began before release-label bump; its original version metadata is retained. No claim of isolated causality or human satisfaction.'};
fs.writeFileSync('docs/build52-director-results.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
