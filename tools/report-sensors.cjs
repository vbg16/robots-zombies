'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const lab=JSON.parse(fs.readFileSync('docs/build44-sensor-bench.json','utf8'));
const compatibility=JSON.parse(fs.readFileSync('docs/build44-builds-bench.json','utf8')).executions.at(-1);
const real=JSON.parse(fs.readFileSync('docs/build44-sensor-progression.json','utf8')).executions.at(-1);
assert.equal(lab.samples.length,144);assert.equal(compatibility.completed,true);assert.equal(compatibility.synthetic.length,70);assert.equal(real.completed,true);assert.equal(real.errors.length,0);assert.equal(real.attempts.length,2);
const weapons=[...new Set(lab.samples.map(s=>s.weapon))],get=(weapon,stage,fixture)=>lab.samples.find(s=>s.weapon===weapon&&s.stage===stage&&s.fixture===fixture),dps=s=>(s.total/s.elapsed).toFixed(1);
const rows=weapons.map(w=>`| ${w} | ${dps(get(w,'base','single'))} | ${dps(get(w,'root','single'))} | ${dps(get(w,'family','single'))} | ${dps(get(w,'elemental','group'))} |`).join('\n');
fs.writeFileSync('docs/sensores-de-campo.md',`# Sensores de campo — BUILD 44

Nova árvore normal, adaptando a família de pulsos em área e transmissão de estados do [mapeamento de referência](pesquisa-builds-20mtd.md). Os módulos e valores são originais. A arma principal continua exigindo mira e disparo manuais; o sensor é uma habilidade automática adquirida durante a tentativa, como os drones existentes.

## Quatro módulos

| Módulo | Ganho | Custo / condição |
|---|---|---|
| Sensor de Varredura | Pulso a cada 3 s, raio 170 e dano de 35% da base atual de dano direto da arma. | Recarga da arma ×1,15. Começa carregando; não dispara imediatamente ao instalar. |
| Lente de Varredura | Alcance do sensor ×1,5. | Intervalo do sensor ×1,2. Não reinicia o ciclo em andamento. |
| Relé de Estados | Pulso aplica fogo e frio adquiridos ou intrínsecos da arma. | Dano do sensor ÷1,25. Não transmite corrosão, crítico, explosão, descarga ou empurrão. |
| Leitura de Ponto Fraco | Sobreviventes ficam expostos por 2 s; balas manuais causam +25% de dano. | Dano do sensor ×0,75. Exposição não acumula e escudos bloqueiam aplicação. |

O pulso atinge todos os corpos que intersectam seu círculo, sem um limite artificial de alvos. Não emite projéteis, gasta munição, conclui recarga, consome a Carga de Reparo nem avança o contador de crítico. Críticos, conversão de vida em dano do Chassi Titânico e outros bônus exclusivos de bala não entram na base do pulso. Multiplicadores normais contra inimigos/chefes seguem a rota de dano existente, uma vez.

O relé compartilha apenas o cálculo de queimadura/resfriamento; refits elementais e protocolos pertinentes continuam válidos. Não chama o processamento completo de impacto. Exposição beneficia projéteis originados da arma manual, inclusive perfuração/ricochete, mas não os danos secundários de explosão, queimadura, raio, drone, sensor ou corrosão. Uma carga corrosiva primária já existente ainda pode propagar pela regra de morte, se o pulso matar seu portador; isso não é uma nova aplicação direta pelo sensor. A exposição não aumenta a captura da corrosão, que continua usando o dano do projétil antes dos bônus condicionais do alvo.

Um pulso que quebra o escudo é absorvido por ele e não aplica exposição ou estados ao corpo naquele golpe. Um pulso posterior pode afetar o corpo já desprotegido. Alvos mortos/removidos são ignorados. Pausa/ofertas/morte congelam o sensor; reiniciar remove habilidade, timer e exposição. Passos de tempo grandes não criam uma rajada de pulsos atrasados.

## Configuração e leitura

78 aprimoramentos: 48 normais em 12 árvores, seis gambiarras, seis experimentos e 18 especializações. O painel acrescenta Dano do sensor, Intervalo do sensor e Alcance do sensor. Valores iniciais: multiplicadores 1 e raio 170. Limites efetivos: intervalo 0,5–30 s, raio 40–480 e dano base por alvo até 1e9. Limites e regras condicionais são fixos; modificadores numéricos são editáveis para as próximas tentativas.

catalogRevision 4 registra a revisão de introdução dos novos IDs. Configurações 1/2/3 preservam edições, inclusive as de corrosão; IDs personalizados que colidem com os novos são renomeados junto com seus requisitos/sinergias. Teste cobre Lente de Varredura com condição vazia. Um intervalo editado no módulo raiz é respeitado já no primeiro ciclo. Revisões desconhecidas de catálogo são rejeitadas, preservando o conteúdo armazenado para recuperação.

O HUD mostra ciclo, ícone, diagnóstico de dano/intervalo/raio, onda visual e marca de exposição. A revisão no Chrome encontrou indicadores fora da tela com seis habilidades em 390 px; o HUD agora usa rótulos compactos e duas linhas nessa largura, com nomes completos nos rótulos de acessibilidade. A legenda de coleta não cobre os indicadores. Ícones novos seguem a paleta industrial ciano. Sem a skill, o sensor não percorre a horda.

## Evidência

- tests/sensors.cjs passou: primeiro ciclo, raio/interseção e todos os alvos, independência de munição/arma/recarga, relé e exclusões, exposição, escudos, limites, pausa/reset, edição e HUD.
- tests/combat.cjs passou, incluindo 25 minutos de cenário controlado e 78 registros no manual. Cenário prolongado usa dano sintético/invulnerabilidade e mortes de chefe por roteiro para verificar estados; não comprova sobrevivência.
- Chrome: tests/sensors-browser.cjs passou em desktop/celular, com imagens inspecionadas. Exercita oferta injetada, confirmação, pulso, frio/exposição, seis cooldowns visíveis, migração 74→78 e primeiro ciclo editado só no próximo reset. Não é playtest humano ou partida ganha.
- Catálogo, migrações de fixtures 54/70/74, corrosão, reforjas, chassis, painel compilado, áudio e sprites passaram. O navegador também repetiu a migração mais antiga 70→78 com ID personalizado de corrosão.
- Os 70 cenários das dez receitas passaram na [bancada de compatibilidade](build44-builds-bench.json). As dez receitas não foram alteradas nesta etapa.

## Bancada com 12 armas

144 cenários: 12 armas × quatro pacotes × alvo único/grupo de cinco/primeiro Brutamontes com vida de produção. Pacotes: sem sensor, apenas raiz, quatro módulos da família, e família + fogo/frio adquiridos. Somente na bancada os módulos são instalados diretamente. Alvos não perseguem, mas empurrão da arma permanece: o Arpão pode afastá-los para fora do sensor.

| Arma (ID) | DPS base, um alvo | Raiz, um alvo | Família, um alvo | Família + elementos, grupo (soma) |
|---|---:|---:|---:|---:|
${rows}

Os valores incluem todos os canais do pacote, inclusive tiros manuais; não isolam o efeito causal do sensor. A coluna de grupo soma cinco alvos e não deve ser comparada como DPS individual. [Dados completos e fontes](build44-sensor-bench.json).

## Duas tentativas normais

Ensaio isolado NANO + Laser, priorizando os quatro módulos do sensor, frio/fogo, coleta e cadência. Não é um décimo primeiro guia nem alteração escondida das receitas dos dez guias. Perfil de teste possui equipamentos apenas para permitir seleção; melhorias são realmente ofertadas, com dano normal, sem cura extra, invulnerabilidade, remoção de vivos ou chefes derrotados por roteiro. Driver 9, física a 20 Hz e decisões a 5 Hz.

| Semente | Tempo observado | Chefes | Dano por sensor | Meta 20 min + três chefes |
|---|---:|---:|---:|---|
${real.attempts.map(a=>`| ${a.seed} | ${(a.time/60).toFixed(2)} min | ${a.bossKills} | ${(a.damage.sensor||0).toFixed(1)} | ${a.viable?'sim':'não'} |`).join('\n')}

As duas sobreviveram à janela, mas só uma cumpriu a meta completa. Dois chefes não contam como três. [Receita, escolhas, métricas e fontes](build44-sensor-progression.json). Capturado antes dos ajustes de apresentação do HUD e da rejeição de revisões de catálogo desconhecidas; os cálculos de combate desse ensaio permaneceram iguais. Dois sorteios não estimam vitória humana nem aprovam equilíbrio.

## Próximas etapas e reprodução

Uma raiz adicional altera as ofertas: avaliações de versões anteriores continuam históricas. Balancear sensores/corrosão, reavaliar as receitas e ampliar a variedade de suportes continuam pendentes. Multisslots avançados ainda exigem sua etapa própria; o objetivo geral segue ativo. Canal experimental e publicApproved=false.

Na raiz do repositório: node tests/sensors.cjs; node tests/sensors-balance.cjs; node tests/balance-migration.cjs; node tools/report-sensors.cjs. Executar os comandos separadamente. Navegador: node tests/sensors-browser.cjs, com Playwright disponível ao Node e GAME_URL opcional. O jogo distribuído não precisa dessas dependências.
`);
console.log('Sensor report:144 synthetic fixtures,70 compatibility fixtures, two real attempts and one full-target pass.');
