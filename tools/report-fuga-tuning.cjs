'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const {compare,render}=require('./compare-build-runs.cjs');
const load=file=>JSON.parse(fs.readFileSync('docs/'+file+'.json','utf8'));
const merge=files=>({executions:files.flatMap(file=>{const d=load(file);assert.ok(d.executions.every(e=>e.completed&&e.errors.length===0),'Unfinished execution: '+file);return d.executions;})});
const controls=['build42-fuga-control','build42-fuga-holdout-control','build42-fuga-holdout2-control'];
const alternative1=['build42-fuga-experiment','build42-fuga-holdout-experiment'];
const alternative2=['build42-fuga-experiment-2','build42-fuga-holdout2-experiment'];
const first=compare(merge(controls.slice(0,2)),merge(alternative1));
const second=compare(merge(controls),merge(alternative2));
assert.equal(first.pairs.length,4);assert.equal(second.pairs.length,6);
const protocol=load('build42-fuga-protocol'),rule=protocol.adoption;
assert.deepEqual(second.pairs.map(p=>p.seed).sort(),[...protocol.trainingSeeds,...protocol.holdoutSeeds].sort());
const differences=second.pairs.map(p=>({seed:p.seed,delta:p.after.time-p.before.time}));
const improved=differences.filter(p=>p.delta>=60).length;
const holdouts=differences.filter(p=>protocol.holdoutSeeds.includes(p.seed));
const eligible=improved>=rule.minimumPairsImprovingBy60Seconds&&differences.every(p=>p.delta>=-rule.maximumAllowedRegressionSeconds)&&(!rule.bothHoldoutTimesMustImprove||holdouts.every(p=>p.delta>0));
const candidate=load(alternative2[0]).executions[0].recipes.find(b=>b.id==='lanca-de-fuga');
const live=require('../builds.js').builds.find(b=>b.id===candidate.id);
const applied=['robot','weapon','skills','core','blessings','specialization','experiments','evolution'].every(key=>JSON.stringify(live[key])===JSON.stringify(candidate[key]));
assert.ok(!applied||eligible,'Live recipe violates the recorded adoption rule.');
if(applied){const bench=load('build42-builds-bench').executions.at(-1);assert.equal(bench.completed,true);assert.equal(bench.errors.length,0);assert.equal(bench.synthetic.length,70);}
const count=pairs=>pairs.filter(p=>p.after.viable).length;
const text=`# Ajuste experimental da Lança de Fuga

## Problema observado

A receita original priorizava mobilidade, tinha pouca sustentação e frequentemente morria sem montar o núcleo ou chegar à reforja do nível 20. A avaliação testa receitas completas, não o efeito isolado de cada mudança. Mundo, atributos das armas/inimigos, sorteios, driver 9 e janela de 20 minutos permanecem iguais em cada par.

## Primeira hipótese — coleta e menos perdas defensivas

PROT + Arpão, Campo Magnético no lugar de Finalizador, dano/coleta priorizados e Experimentos orientados a dano/vida. Os ganhos das duas sementes iniciais não reapareceram nos dois sorteios seguintes. A hipótese foi preservada como investigação, sem ser tratada como solução validada.

${render(first).replace(/^# Comparação pareada de receitas\n\n/,'')}

## Segunda hipótese — mobilidade sustentada por reparo

NANO + Arpão. Ordem: Alto Impacto, Overdrive, Campo Magnético, Manutenção na Recarga, Propulsor, Pernas Hidráulicas, Núcleo Criogênico e Impacto Cinético. O reparo proporcional e o protocolo Carga de Reparo apoiam disparos/controle enquanto a mobilidade continua com sua perda de vida. Não há atributos gratuitos ou alterações de regras para esta build.

${render(second).replace(/^# Comparação pareada de receitas\n\n/,'')}

## Decisão e limites

Regra registrada em [protocolo](build42-fuga-protocol.json) antes de inspecionar os resultados completos da segunda hipótese: pelo menos quatro dos seis pares ganham 60 segundos; nenhum perde mais de 60 segundos; os dois sorteios novos também melhoram. A meta de aprovação da tentativa permanece 20 minutos e três chefes.

Resultado: **${improved}/6** pares ganharam ao menos 60 segundos; **${count(second.pairs)}/6** tentativas da alternativa atingiram a meta completa. Critério de adoção experimental: **${eligible?'satisfeito':'não satisfeito'}**. Receita instalada no jogo: **${applied?'sim':'não'}**. Isso não representa aprovação de lançamento público, taxa de vitória humana ou comprovação de equilíbrio de todas as dez builds.

As sementes 20261102–20261105 foram usadas na exploração. 20261106–20261107 foram separadas para verificar a segunda hipótese antes de usá-las para qualquer ajuste. A amostra continua pequena. Tentativas abaixo da meta permanecem reprovadas, mesmo quando melhoram em relação à base. Resultados são limitados a 20 minutos; não se extrapola sobrevivência além desse teto de observação.

## Verificação da aplicação

${applied?'A bancada da BUILD42 passou nos 70 cenários das dez receitas, com fontes identificados em [build42-builds-bench.json](build42-builds-bench.json). O Chrome confirmou que a nova receita exige comprar o NANO, consome o preço correto uma única vez, seleciona NANO + Arpão e inicia sem módulos gratuitos. Testes de chassis, cura, reforjas, migração e comparação passaram. A inspeção de escopo confirmou game.js e balance.js idênticos aos fontes da avaliação completa da BUILD41 e as outras nove receitas sem mudanças.':'A aplicação no jogo ainda não foi verificada; não usar este experimento como descrição de uma receita publicada.'}

## Rastreabilidade

Cada arquivo abaixo contém a receita completa, fontes identificados, escolhas reais e resultados de todos os casos. Sobrescrita de receitas é JSON de teste; não altera o catálogo do jogo. Os lotes mais recentes também guardam hashes do driver e bootstrap, além dos hashes do mundo. Lotes históricos têm driverVersion e fontes; não se inventou retroativamente um hash para eles.

${[...controls,...alternative1,...alternative2].map(file=>'- ['+file+']('+file+'.json)').join('\n')}

O comparador rejeita mundos/configurações diferentes, versão de driver, passo de física, janela, política, sementes ausentes, casos duplicados, estados não finitos e resultados que contradizem a meta. Quando os hashes do driver/bootstrap estão presentes, ambos os lados precisam fornecer os mesmos hashes. Teste: node tests/build-comparison.cjs. Gerar novamente: node tools/report-fuga-tuning.cjs.
`;
fs.writeFileSync('docs/ajuste-lanca-de-fuga.md',text);
console.log(JSON.stringify({eligible,applied,improved,strictSuccesses:count(second.pairs),pairs:second.pairs.length}));
