'use strict';
const fs=require('node:fs'),crypto=require('node:crypto');
const read=name=>JSON.parse(fs.readFileSync('outputs/performance/'+name+'.json','utf8'));
const baseline=read('build46-render'),candidate=read('build47-render-candidate3'),negative1=read('build47-render-candidate1'),negative2=read('build47-render-candidate2');
if(!baseline.completed||!candidate.completed||baseline.errors.length||candidate.errors.length)throw Error('Completed error-free reports required');
let lineEndingEvidence=null;
if(baseline.sourceHashes['balance.js']!==candidate.sourceHashes['balance.js']){
 const hash=text=>crypto.createHash('sha256').update(text).digest('hex'),before=fs.readFileSync('outputs/performance/build46/balance.js','utf8'),after=fs.readFileSync('balance.js','utf8');
 if(hash(before)!==baseline.sourceHashes['balance.js']||hash(after)!==candidate.sourceHashes['balance.js']||before.replace(/\r\n/g,'\n')!==after.replace(/\r\n/g,'\n'))throw Error('Balance changed beyond verified line endings');
 lineEndingEvidence={baselineRawHash:hash(before),candidateRawHash:hash(after),identicalAfterCRLFNormalization:true,normalizedHash:hash(after.replace(/\r\n/g,'\n'))};
}
const comparisons=candidate.samples.map(sample=>{
 const prior=baseline.samples.find(s=>s.count===sample.count&&s.distribution===sample.distribution&&s.package===sample.package&&s.metric===sample.metric);
 if(!prior||prior.enemiesRemaining!==sample.enemiesRemaining||!sample.finite||!prior.finite)throw Error('Unpaired populations');
 return {count:sample.count,distribution:sample.distribution,metric:sample.metric,baselineMs:prior.meanMs,candidateMs:sample.meanMs,changePercent:(sample.meanMs/prior.meanMs-1)*100};
});
const report={kind:'BUILD47-controlled-render-comparison',note:'Chrome headless CPU/Canvas call cost, not displayed FPS, survival or a general performance guarantee. Same idle world/seed/populations; new art and renderer versus BUILD46. Rendering dependency hashes capture the measured versions; subsequent metadata QA labels and feature-detection guard do not change this Chrome rendering path.',baseline,candidate,comparisons,rejected:[{variant:'separate mutable canvases',completed:negative1.completed===true,sourceHashes:negative1.sourceHashes,renderDependencyHashes:negative1.renderDependencyHashes,samples:negative1.samples},{variant:'packed mutable canvases',completed:negative2.completed===true,stopped:'Stopped after severe repeated regressions; remaining combinations were not measured.',sourceHashes:negative2.sourceHashes,renderDependencyHashes:negative2.renderDependencyHashes,samples:negative2.samples}]};
report.lineEndingEvidence=lineEndingEvidence;
fs.writeFileSync('docs/build47-render-bench.json',JSON.stringify(report,null,2)+'\n');
console.log('Saved27 paired measurements and rejected candidates.');
