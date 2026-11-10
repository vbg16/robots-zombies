'use strict';
/* Structural documentation coverage. This does NOT approve game quality, final
 * gates, physical-phone performance, or execution of the listed acceptance cases. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');process.chdir(root);
const masterFile='docs/SCREWVIVORS-ESPECIFICACAO-E-TESTES.md',matrixFile='docs/matriz-verificacao.json';
const master=fs.readFileSync(masterFile,'utf8'),matrix=JSON.parse(fs.readFileSync(matrixFile,'utf8'));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
assert.ok(!master.includes('\uFFFD'),'Replacement character in master');
assert.ok(master.startsWith('# Screwvivors 1.0'),'Master title missing');
assert.ok(master.includes('EM DESENVOLVIMENTO'),'Current unfinished status must remain explicit');
const requiredFields=['id','area','origem','preparacao','entradas_e_passos','resultado_esperado','tolerancia','casos_de_borda','gravidade','evidencia_exigida','situacao','implementacao_correspondente','comando_ou_procedimento'];
const ids=matrix.casos.map(c=>c.id);assert.equal(new Set(ids).size,ids.length,'Duplicate QA IDs');
const headings=[...master.matchAll(/^### (QA-[A-Za-z0-9_-]+) — /gm)].map(m=>m[1]);
assert.equal(new Set(headings).size,headings.length,'Duplicate case headings');
assert.deepEqual([...headings].sort(),[...ids].sort(),'Markdown and machine-readable cases diverge');
for(const c of matrix.casos)for(const field of requiredFields)assert.ok(typeof c[field]==='string'&&c[field].trim(),c.id+' lacks '+field);

let prefix=fs.readFileSync('tests/combat.cjs','utf8').split('assert.match(')[0];
const gameHook="vm.runInContext(fs.readFileSync('game.js','utf8'),context);";
assert.ok(prefix.includes(gameHook),'Combat bootstrap changed');
prefix=prefix.replace(gameHook,"window.localStorage=localStorage;vm.runInContext(fs.readFileSync('balance.js','utf8'),context);"+gameHook);
const {context}=new Function('require',prefix+';return {context};')(require);
const read=s=>JSON.parse(vm.runInContext('JSON.stringify('+s+')',context));
const live={
 chassis:read('Object.keys(ROBOTS)'),armas:read('Object.keys(WEAPONS)'),
 normais:read('SKILLS.map(s=>s.id)'),gambiarras:read('GAMBARRAS.map(s=>s.id)'),
 experimentos:read('BOSS_EXPERIMENTS.map(s=>s.id)'),protocolos:read('Object.values(SPECIALIZATIONS).flat().map(s=>s.id)'),
 reforjas:read('Object.values(WEAPON_EVOLUTIONS).flat().map(s=>s.id)'),reliquias:read('BOSS_RELICS.map(s=>s.id)'),
 receitas:require(path.join(root,'builds.js')).builds.map(s=>s.id),
 editaveis:read('window.ScrewBalance.catalog.map(s=>s.id)'),atributos:read('window.ScrewBalance.attributes')
};
const prefixes={chassis:'QA-ROBOT-',armas:'QA-WEAPON-',normais:'QA-MOD-',gambiarras:'QA-GAMB-',experimentos:'QA-EXP-',protocolos:'QA-PROTOCOL-',reforjas:'QA-REFIT-',reliquias:'QA-RELIC-',receitas:'QA-BUILD-'};
for(const [category,items]of Object.entries(live)){
 assert.equal(new Set(items).size,items.length,'Duplicate live IDs: '+category);
 assert.equal(matrix.contagens[category],items.length,'Stale count: '+category);
 if(prefixes[category])for(const id of items)assert.ok(ids.includes(prefixes[category]+id),'Missing acceptance case: '+category+'/'+id);
}
assert.equal(ids.filter(id=>id.startsWith('QA-ATTR-')).length,live.atributos.length,'Attribute coverage missing');
assert.equal(live.editaveis.length,live.normais.length+live.gambiarras.length+live.experimentos.length+live.protocolos.length);
const checkedSources=[],lineEndingDifferences=[];
for(const [relative,expected]of Object.entries(matrix.source_hashes)){
 const file=path.resolve(root,relative);assert.ok(file.startsWith(root+path.sep),'Source path escapes workspace');
 const bytes=fs.readFileSync(file),normalized=Buffer.from(bytes.toString('utf8').replace(/\r\n/g,'\n'));
 assert.ok(matrix.source_text_hashes?.[relative],'Missing portable source fingerprint: '+relative);
 assert.equal(sha(normalized),matrix.source_text_hashes[relative],'Documentation snapshot stale: '+relative);
 if(sha(bytes)!==expected)lineEndingDifferences.push({file:relative,workspaceSnapshotSha256:expected,actualSha256:sha(bytes),verifiedCanonicalSha256:sha(normalized),normalization:'CRLF to LF only'});
 checkedSources.push(relative);
}
const links=[];
for(const [,raw]of master.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){
 if(/^(https?:|mailto:|#)/.test(raw))continue;
 const target=raw.replace(/^<|>$/g,'').split('#')[0];if(!target)continue;
 const resolved=path.resolve(path.dirname(path.resolve(masterFile)),target);
 assert.ok(fs.existsSync(resolved),'Broken local documentation link: '+raw);links.push(raw);
}
if(matrix.gate_final_aprovado){
 assert.ok(fs.existsSync('docs/TERMO-DE-CONCLUSAO.md'),'Final gate requires a conclusion record');
 assert.ok(matrix.casos.every(c=>c.situacao==='APROVADO_COMMIT_FINAL'&&Array.isArray(c.evidencia_atual)&&c.evidencia_atual.length),'Final gate cannot use unexecuted cases');
}
const report={at:new Date().toISOString(),scope:'Structural coverage/hash/link/schema checks only; not execution or final project approval',
 masterSha256:sha(master),matrixSha256:sha(fs.readFileSync(matrixFile)),cases:ids.length,counts:Object.fromEntries(Object.entries(live).map(([k,v])=>[k,v.length])),
 checkedSources,lineEndingDifferences,localLinks:links.length,finalGateApproved:matrix.gate_final_aprovado,passed:true};
fs.mkdirSync('outputs',{recursive:true});fs.writeFileSync('outputs/specification-check.json',JSON.stringify(report,null,2)+'\n');
console.log('Specification structure: '+ids.length+' unique cases, current catalogs/attributes, source hashes and local links agree. This does not approve the final gates.');
