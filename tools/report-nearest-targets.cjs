'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const baseline=read('outputs/performance/build49-plasma-fixed.json'),candidate=read('outputs/performance/build50-plasma-fixed.json');
for(const r of [baseline,candidate]){assert.equal(r.completed,true);assert.deepEqual(r.errors,[]);assert.equal(r.fixedCalls,24);assert.equal(r.samples.length,18);}
for(const key of ['browser','viewport','host','renderDependencyHashes'])assert.deepEqual(candidate[key],baseline[key],key);
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
for(const [r,root] of [[baseline,'outputs/performance/build49-neighbors/'],[candidate,'']])for(const name of ['game.js','balance.js'])assert.equal(hash(fs.readFileSync(root+name,'utf8')),r.sourceHashes[name],name+' source snapshot');
assert.equal(fs.readFileSync('balance.js','utf8').replace(/\r\n/g,'\n'),fs.readFileSync('outputs/performance/build49-neighbors/balance.js','utf8').replace(/\r\n/g,'\n'),'Balance unchanged');
const key=s=>[s.count,s.distribution,s.package,s.metric].join('/'),before=new Map(baseline.samples.map(s=>[key(s),s]));
assert.equal(before.size,18);
const seen=new Set(),pairs=candidate.samples.map(after=>{
 const id=key(after),prior=before.get(id);assert.ok(prior,id);assert.ok(!seen.has(id));seen.add(id);
 for(const field of ['calls','stateHash','clock','enemiesRemaining','bullets','renderSize','finite'])assert.deepEqual(after[field],prior[field],id+' '+field);
 assert.equal(after.calls,24);assert.equal(after.finite,true);assert.equal(after.enemiesRemaining,after.count);assert.match(after.stateHash,/^[a-f0-9]{64}$/);
 for(const r of [prior,after])for(const field of ['meanMs','medianMs','p95Ms','maxMs'])assert.ok(Number.isFinite(r[field])&&r[field]>=0);
 return {id,beforeMeanMs:prior.meanMs,afterMeanMs:after.meanMs,changePercent:(after.meanMs/prior.meanMs-1)*100,stateHash:after.stateHash};
});
const output={kind:'paired-fixed-step-nearest-target-query',note:'24 timed calls per cell plus identical warmup. State hashes include RNG, combat entities, effects and player. Hash serialization occurs outside timing. CPU/Canvas calls only; not displayed FPS, natural survival or public approval. One sequential run per version; draw-only noise retained.',baseline,candidate,pairs};
fs.writeFileSync('docs/build50-neighbors-performance.json',JSON.stringify(output,null,2)+'\n');
console.log('18 fixed-work pairs: identical combat state/RNG, population retained; source snapshots verified.');
for(const p of pairs.filter(p=>p.id.endsWith('/tick')))console.log(p.id,p.beforeMeanMs.toFixed(2)+' -> '+p.afterMeanMs.toFixed(2)+' ms',p.changePercent.toFixed(1)+'%');
