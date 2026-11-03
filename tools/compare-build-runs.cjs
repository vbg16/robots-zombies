/* Pair real attempts only when the world, driver and evaluation window match. */
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
function collect(document){
 const map=new Map();
 for(const execution of document.executions||[])for(const attempt of execution.attempts||[]){
  const key=attempt.build+':'+attempt.seed;
  assert.ok(!map.has(key),'Duplicate completed case: '+key+'; select one execution explicitly.');
  assert.equal(attempt.finite,true,'Nonfinite case: '+key);
  assert.ok(Number.isFinite(attempt.time)&&attempt.time>=0&&attempt.time<=execution.duration+execution.dt,'Invalid duration: '+key);
  assert.ok(Number.isInteger(attempt.bossKills)&&attempt.bossKills>=0,'Invalid boss count: '+key);
  assert.equal(attempt.viable,attempt.time>=execution.duration-.1&&attempt.bossKills>=3,'Outcome contradicts fixed target: '+key);
  map.set(key,{attempt,execution});
 }
 return map;
}
function compare(baseline,candidate){
 const previous=collect(baseline),next=collect(candidate),pairs=[];
 assert.ok(next.size,'No candidate attempts to compare.');
 for(const [key,{attempt:after,execution:b}] of next){
  const before=previous.get(key);assert.ok(before,'Missing baseline case: '+key);const a=before.execution;
  for(const file of ['game.js','balance.js']){assert.ok(a.sourceHashes?.[file]&&b.sourceHashes?.[file],'Missing source identity: '+file);assert.equal(b.sourceHashes[file],a.sourceHashes[file],'World/config source changed: '+file);}
  for(const field of ['driverVersion','dt','duration','refitsEnabled'])assert.equal(b[field],a[field],'Incompatible '+field);
  // Historical batches predate these hashes. When present, neither side may omit or change one.
  for(const field of ['driverHash','bootstrapHash'])if(a[field]||b[field])assert.equal(b[field],a[field],'Incompatible '+field);
  assert.equal(a.duration,1200,'Comparison requires the full predeclared 20-minute window.');
  assert.equal(JSON.stringify(a.policy),JSON.stringify(b.policy),'Evaluation policy changed.');
  const recipeBefore=a.recipes.find(r=>r.id===after.build),recipeAfter=b.recipes.find(r=>r.id===after.build);
  const changes=Object.keys({...recipeBefore,...recipeAfter}).filter(k=>JSON.stringify(recipeBefore[k])!==JSON.stringify(recipeAfter[k]));
  pairs.push({build:after.build,name:recipeAfter.name,seed:after.seed,before:before.attempt,after,recipeChanges:changes});
 }
 return {baselineCases:previous.size,candidateCases:next.size,pairs};
}
function render(comparison){
 const time=s=>`${Math.floor((s+.001)/60)}:${String(Math.floor((s+.001)%60)).padStart(2,'0')}`;
 return '# Comparação pareada de receitas\n\n'+
  `Janela e meta fixas: 20 minutos e pelo menos três chefes. ${comparison.candidateCases} pares comparáveis; ${comparison.baselineCases} casos disponíveis na base. Mesmo mundo, configuração de skills, driver, passo de física e política. Melhorias continuam sendo conquistadas pelas ofertas.\n\n`+
  '| Build | Semente | Tempo antes → depois | Chefes antes → depois | Núcleo antes → depois | Meta antes → depois |\n|---|---:|---|---|---|---|\n'+
  comparison.pairs.map(p=>`| ${p.name} | ${p.seed} | ${time(p.before.time)} → ${time(p.after.time)} | ${p.before.bossKills} → ${p.after.bossKills} | ${p.before.coreReached?'sim':'não'} → ${p.after.coreReached?'sim':'não'} | ${p.before.viable?'sim':'não'} → ${p.after.viable?'sim':'não'} |`).join('\n')+
  '\n\nCampos da receita alterados: '+[...new Set(comparison.pairs.flatMap(p=>p.recipeChanges))].join(', ')+'. A comparação não comprova taxa de vitória humana nem isola causalmente o efeito de cada campo. As sementes listadas formam uma amostra de desenvolvimento; novos sorteios são necessários antes de generalizar.\n';
}
module.exports={collect,compare,render};
if(require.main===module){
 const [baseline,candidate,destination]=process.argv.slice(2);assert.ok(baseline&&candidate&&destination,'Usage: node tools/compare-build-runs.cjs baseline.json candidate.json report.md');
 const result=compare(JSON.parse(fs.readFileSync(baseline,'utf8')),JSON.parse(fs.readFileSync(candidate,'utf8')));
 fs.writeFileSync(destination,render(result));console.log(`Compared ${result.candidateCases} paired attempts.`);
}
