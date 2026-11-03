/* Generate a reviewable report without removing failed or interrupted runs. */
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const {builds}=require('../builds.js');
const history=JSON.parse(fs.readFileSync('docs/builds-results-final.json','utf8'));
const segments=history.executions.filter(e=>e.gameplayRevision==='build40-candidate-2');
const cases=new Map();
for(const e of segments)for(const a of e.attempts)cases.set(a.build+':'+a.seed,a);
const seeds=[20261102,20261103];
for(const b of builds)for(const seed of seeds)assert.ok(cases.has(b.id+':'+seed),'Missing completed attempt: '+b.id+':'+seed);
assert.equal(cases.size,20);
const lab=JSON.parse(fs.readFileSync('docs/builds-bench-final.json','utf8')).executions.at(-1);
assert.equal(lab.completed,true);assert.equal(lab.synthetic.length,70);assert.equal(lab.errors.length,0);
const attempts=[...cases.values()],survived=attempts.filter(a=>a.survivedWindow).length,viable=attempts.filter(a=>a.viable).length;
const time=s=>`${Math.floor((s+.001)/60)}:${String(Math.floor((s+.001)%60)).padStart(2,'0')}`;
const rows=builds.map(b=>{
 const pair=seeds.map(seed=>cases.get(b.id+':'+seed));
 return `| ${b.name} | ${pair.map(a=>time(a.time)+' / '+a.bossKills).join(' | ')} | ${pair.filter(a=>a.coreReached).length}/2 | ${pair.filter(a=>a.survivedWindow).length}/2 | ${pair.filter(a=>a.viable).length}/2 |`;
});
const bench=builds.map(b=>{
 const samples=lab.synthetic.filter(a=>a.build===b.id&&a.stage==='mature');
 const one=samples.find(a=>a.fixture==='one-stationary-highHP'),group=samples.find(a=>a.fixture==='seven-stationary-highHP'),boss=samples.find(a=>a.fixture==='stationary-production-brute');
 return `| ${b.name} | ${(one.total/one.elapsed).toFixed(1)} | ${(group.total/group.elapsed).toFixed(1)} | ${boss.bossTtk===null?'>60 s':boss.bossTtk.toFixed(2)+' s'} |`;
});
const text=`# Resultado das dez builds — BUILD 40

As dez receitas estão implementadas e as dez passaram nos testes de funcionamento. **O balanceamento de todas as builds ainda não está aprovado:** ${survived}/20 tentativas automatizadas alcançaram 20 minutos; ${viable}/20 atingiram também a meta de pelo menos três chefes. O canal permanece experimental, com publicApproved=false.

## Partidas com progressão normal

Duas sementes por receita, 20261102 e 20261103. Cada célula mostra **tempo sobrevivido / chefes derrotados**. A meta foi definida antes da avaliação: sobreviver 1.200 segundos e derrotar pelo menos três chefes. Uma morte aos 19 minutos continua sendo reprovação nessa meta.

| Build | Semente 20261102 | Semente 20261103 | Núcleo montado | Sobreviveu 20 min | Meta completa |
|---|---|---|---|---|---|
${rows.join('\n')}

O agente usa o mesmo algoritmo de oito direções para todas as receitas, mira contínua, decisões a 5 Hz e física a 20 Hz. Escolhe apenas melhorias realmente ofertadas, com a renovação permitida pelo jogo. Não recebe invulnerabilidade, dano extra, cura adicional, mortes programadas de chefes ou remoção de inimigos vivos. O perfil de teste já possui os equipamentos para permitir testar os dez loadouts; a montagem da build é feita durante a tentativa. O desenho e o HUD são omitidos: isso mede lógica e progressão, **não FPS em navegador**.

## Bancada controlada

70 cenários passaram: dez builds × sete cenários (base, núcleo e madura em um alvo e grupo, mais chefe maduro). Somente nesta bancada as skills são instaladas diretamente e os alvos ficam parados. DPS de grupo soma o dano em sete alvos. O chefe é o primeiro Brutamontes, com vida de produção; o tempo abaixo não representa os chefes mais fortes nem uma arena com horda.

| Build madura | DPS em um alvo | DPS somado em grupo | Primeiro chefe parado |
|---|---:|---:|---:|
${bench.join('\n')}

## Leitura dos resultados

- Sobreviver e derrotar chefes são medidas distintas. Uma build pode controlar a horda por 20 minutos e ainda falhar em dano ou acesso ao chefe.
- As receitas com armas de precisão sofrem pressão da população acumulada. A Oficina Viva conseguiu montar o roteiro nas duas sementes, mas morreu antes da janela: muita cura não comprova capacidade de limpar a horda.
- O Caçador e a Rede de Plasma tiveram uma tentativa sem completar os oito módulos. As escolhas e os danos por fonte ficam preservados nos dados brutos, incluindo essas falhas.
- Dois sorteios e um agente de controle não permitem estimar a taxa de vitória humana nem garantir equilíbrio. Esses resultados servem para localizar prioridades de ajuste; não autorizam promoção automática ao público.

## Regressões e rastreabilidade

Passaram os testes de combate (incluindo cenário controlado de 25 minutos), áudio, sprites, catálogo, migração 54→70, novos chassis, protocolos, drones e interações. O cenário controlado prolongado usa invulnerabilidade e chefes derrotados por roteiro para testar estados; não entra na tabela de sobrevivência.

Chrome real confirmou dez cartões, seis chassis, seleção de equipamentos possuídos, rejeição dos bloqueados, ausência de melhorias gratuitas, configuração do FORJ, drone inicial do ENXA, navegação por teclado e largura de celular 390 px. Editor compilado e testes do painel passaram. Os quatro chassis novos usam variantes visuais provisórias.

Uma execução sofreu interrupção do processo e outra teve erro no bootstrap do teste. Os casos terminados foram preservados; as continuações executaram somente os pares pendentes. O bootstrap passou a ser congelado no início do lote, como os fontes. A tabela usa o último caso completo de cada par da revisão build40-candidate-2, com a mesma lógica de combate e driver 8. Correções posteriores de migração textual, teclado do guia e marcador de versão não alteraram a matemática dessas partidas. A bancada final foi repetida após essas correções.

- [Receitas e regras](dez-builds.md) · [Pesquisa e fontes](pesquisa-builds-20mtd.md).
- [Tentativas finais e segmentos](builds-results-final.json): sementes, escolhas, atributos, danos, população e hashes dos fontes de cada execução.
- [Bancada final](builds-bench-final.json): 70 cenários com fontes identificados.
- [Histórico exploratório](builds-results.json): mantido, com falhas; não é usado como aprovação da candidata atual.
- Reproduzir o relatório: node tools/report-builds.cjs. Reproduzir partidas: BUILD_SEEDS=20261102,20261103 e node tests/builds-balance.cjs --real-only, usando BUILD_REPORT em um arquivo separado. Esses nomes são variáveis de ambiente; no PowerShell use $env:NOME='valor'.
`;
fs.writeFileSync('docs/resultado-dez-builds.md',text);
console.log(`Report: ${cases.size} attempts; ${survived} survived; ${viable} met full target; 70 lab scenarios.`);
