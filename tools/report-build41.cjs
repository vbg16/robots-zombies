'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const report=JSON.parse(fs.readFileSync('docs/build41-full-progression.json','utf8'));
assert.equal(report.executions.length,1,'Use the single frozen full-evaluation batch.');
const e=report.executions[0];assert.equal(e.completed,true,'Evaluation still running.');assert.equal(e.errors.length,0);
assert.equal(e.recipes.length,10);assert.equal(new Set(e.recipes.map(b=>b.id)).size,10);assert.equal(e.version.build,41);assert.equal(e.refitsEnabled,true);assert.equal(e.driverVersion,9);assert.equal(e.duration,1200);assert.equal(e.attempts.length,20);
const cases=new Map(e.attempts.map(a=>[a.build+':'+a.seed,a]));assert.equal(cases.size,20);
const time=s=>`${Math.floor((s+.001)/60)}:${String(Math.floor((s+.001)%60)).padStart(2,'0')}`;
const seeds=[20261102,20261103];
const rows=e.recipes.map(b=>{
 const pair=seeds.map(seed=>{const a=cases.get(b.id+':'+seed);assert.ok(a,'Missing pair');assert.equal(a.finite,true);assert.equal(a.viable,a.time>=1199.9&&a.bossKills>=3);return a;});
 return `| ${b.name} | ${pair.map(a=>time(a.time)+' / '+a.bossKills).join(' | ')} | ${pair.filter(a=>a.coreReached).length}/2 | ${pair.filter(a=>a.weaponEvolution).length}/2 | ${pair.filter(a=>a.viable).length}/2 |`;
});
const survival=e.attempts.filter(a=>a.survivedWindow).length,viable=e.attempts.filter(a=>a.viable).length;
fs.writeFileSync('docs/reavaliacao-build41.md',`# Reavaliação completa — BUILD 41

Uma execução com fontes congelados, dez receitas e duas sementes por receita. **${survival}/20** tentativas sobreviveram 20 minutos; **${viable}/20** também derrotaram ao menos três chefes. A meta é a mesma da avaliação anterior. Não há aprovação automática de balanceamento ou promoção ao público.

Cada célula de semente mostra **tempo / chefes derrotados**. Núcleo é a aquisição dos quatro módulos centrais; Reforja exige chegar ao nível 20 e aceitar a opção realmente oferecida.

| Receita da BUILD 41 | 20261102 | 20261103 | Núcleo | Reforja | Meta completa |
|---|---|---|---|---|---|
${rows.join('\n')}

## Escopo da evidência

Player, arma, inimigos, XP e escolhas usam as regras normais. Equipamentos são desbloqueados apenas no perfil isolado do teste para poder selecionar cada receita. Não há invulnerabilidade, atributos extras, upgrades instalados escondidos, remoção de inimigos vivos ou chefes derrotados por roteiro. Física a 20 Hz e decisões do mesmo driver 9 a 5 Hz. Desenho/HUD omitidos: os resultados não medem FPS, habilidade humana ou diversão.

O driver escolhe a reforja recomendada quando chega ao nível 20. A BUILD 41 substitui o módulo normal desse nível pela reforja; por isso a comparação com a BUILD 40 não isola apenas o benefício da evolução. Para comparar novas receitas dentro da mesma BUILD 41, manter o mundo, o driver e as sementes iguais e registrar também as falhas.

A tabela é da receita original da BUILD 41, congelada antes de testar alternativas. Uma mudança posterior no guia não altera retroativamente estes resultados. Os dois sorteios são amostra de desenvolvimento, não estimativa de taxa de vitória.

## Dados e reprodução

[Dados brutos e hashes dos fontes](build41-full-progression.json), incluindo todas as escolhas, dano/cura, população máxima e eventos de chefe. [Catálogo e regras de reforja](evolucao-armas.md). [Avaliação histórica da BUILD 40](resultado-dez-builds.md).

Gerar esta tabela: node tools/report-build41.cjs. Para repetir o lote, definir BUILD_REFITS=1, BUILD_SEEDS=20261102,20261103 e BUILD_REPORT em um arquivo novo; executar node tests/builds-balance.cjs --real-only. Não fornecer BUILD_ONLY ou BUILD_RECIPES para reproduzir o catálogo publicado.
`);
console.log(`BUILD41: ${survival}/20 survived, ${viable}/20 met full target.`);
