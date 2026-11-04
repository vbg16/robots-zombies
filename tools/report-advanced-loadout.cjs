'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const read=f=>JSON.parse(fs.readFileSync(f,'utf8')),hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const sourceHashes=Object.fromEntries(['game.js','balance.js','builds.js'].map(f=>[f,hash(fs.readFileSync(f,'utf8'))]));
const reports={};
for(const [name,file] of Object.entries({canonical:'docs/build51-builds-bench.json',advanced:'docs/build51-arsenal-bench.json',dual:'docs/build51-dual-progression.json',triple:'docs/build51-triple-progression.json'})){
 const r=read(file).executions.at(-1);assert.equal(r.completed,true,file);assert.deepEqual(r.errors,[],file);
 assert.deepEqual(r.sourceHashes,sourceHashes,file+' frozen sources');assert.equal(r.driverVersion,10);assert.equal(r.excludedCases.length,0);assert.equal(r.duration,1200);assert.equal(r.refitsEnabled,true);
 assert.equal(r.harnessDriverHash,hash(fs.readFileSync('tests/builds-balance.cjs')),file+' harness');reports[name]=r;
}
for(const key of ['canonical','advanced']){assert.equal(reports[key].synthetic.length,70);assert.equal(reports[key].attempts.length,0);assert.equal(reports[key].structure.ok,true);assert.equal(reports[key].components.ok,true);}
for(const key of ['dual','triple']){assert.equal(reports[key].attempts.length,2);assert.deepEqual(reports[key].seeds,[20261103,20261104]);for(const a of reports[key].attempts){assert.equal(a.finite,true);assert.equal(a.weapons.length,key==='dual'?2:3);assert.equal(a.survivedWindow,a.time>=1199.9);assert.equal(a.viable,a.time>=1199.9&&a.bossKills>=3);}}
const matrix=read('docs/build51-arsenal-matrix.json');assert.equal(matrix.count,1452);assert.equal(matrix.cases.length,1452);assert.ok(matrix.cases.every(c=>c.passed));for(const f of ['game.js','balance.js'])assert.equal(matrix.sourceHashes[f],sourceHashes[f]);
const equivalence=read('outputs/performance/weapon-state-equivalence.json');assert.equal(equivalence.candidateHash,sourceHashes['game.js']);assert.equal(equivalence.cases.length,48);assert.ok(equivalence.cases.every(c=>c.identical));
equivalence.balanceCandidateHash=sourceHashes['balance.js'];fs.writeFileSync('docs/build51-single-weapon-equivalence.json',JSON.stringify(equivalence,null,2)+'\n');
const browser=read('outputs/advanced-loadout/browser-report.json');assert.equal(browser.passed,true);assert.equal(browser.offlineFile,true);assert.deepEqual(browser.errors,[]);
browser.sourceHashes={...sourceHashes,'index.html':hash(fs.readFileSync('index.html')),'style.css':hash(fs.readFileSync('style.css'))};browser.driverHash=hash(fs.readFileSync('tests/advanced-loadout-browser.cjs'));fs.writeFileSync('docs/build51-arsenal-browser.json',JSON.stringify(browser,null,2)+'\n');
const attempts=[...reports.dual.attempts,...reports.triple.attempts],summary={build:51,sourceHashes,controlled:{canonicalCases:70,advancedCases:70,orderedCombinationSmokes:1452,primaryEquivalentWorlds:48},natural:{policy:reports.dual.policy.real,driverVersion:10,seeds:[20261103,20261104],passed:attempts.filter(a=>a.viable).length,total:attempts.length,attempts:attempts.map(a=>({build:a.build,seed:a.seed,seconds:a.time,bosses:a.bossKills,level:a.level,coreReached:a.coreReached,received:a.received,healing:a.healing,weapons:a.weapons,viable:a.viable}))},limits:'Four deterministic automated attempts of two experimental loadouts. Gear pre-unlocked only for setup. Not all recipes, a human quality verdict, FPS, exhaustive encounter coverage or public approval. Driver10 preserves explicit slot/source arguments; previous driver9 results are historical and not a paired comparison.'};
fs.writeFileSync('docs/build51-arsenal-results.json',JSON.stringify(summary,null,2)+'\n');
console.log('BUILD51 sources verified:140 controlled cases,1452 ordered smokes,48 equivalent worlds, natural '+summary.natural.passed+'/'+attempts.length+'.');
for(const a of summary.natural.attempts)console.log(a.build,a.seed,a.seconds.toFixed(2)+'s',a.bosses+'bosses',a.viable?'PASS':'FAIL');
