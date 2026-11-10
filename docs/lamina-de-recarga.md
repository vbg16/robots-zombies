# Lâmina de Recarga — candidata BUILD62

**Estado: validada funcionalmente em engine/browser na candidata de desenvolvimento.** Não aprova balanceamento final, desempenho real, publicação ou conclusão1.0. Resultados BUILD61 continuam históricos; evidências62 e suas fontes exatas estão registradas ao final.

## Aquisição e ativação manual

LÂMINA DE RECARGA (`reloadBlade`) é a16ª peça universal temporária de baú, elegível para qualquer chassi/arma, sem repetição na tentativa. Editor permanece82; inventário98 artigos confirmado por extração VM do catálogo vivo. Não concede atributos permanentes, cura, munição ou recarga ao instalar. A recarga que já estava em curso na aquisição não ganha lâmina retroativamente. Somente o próximo `startReload` bem-sucedido com a peça captura o motor.

Durante uma recarga efetiva, manter intenção manual de disparo (`firing`) e mira ativa permite ataque frontal. Soltar o disparo ou perder a mira interrompe o dano imediatamente; voltar a segurar retoma somente o restante da recarga. Não escolhe alvos, não cria projéteis e não exige botão novo: mouse ou pad direito usam o mesmo disparo manual. R continua sendo recarga. Tentativa de recarregar carregador cheio, recarga já ativa ou entrada bloqueada não cria janela nova.

## Referência por arma e integração exata

Ao iniciar uma recarga válida, capturar `P=clamp(shotDamage(slot) × N,0,1e9)`, com `N=min(400,max(1,floor(pelletsDaArma × projectileMult)))`, os pellets planejados do cartucho. É a base normal de dano da arma naquele instante, incluindo conversões normais de shotDamage. Não incorporar crítico de um disparo específico, Culatra, Carga de Reparo, dano de outro slot ou vulnerabilidade de alvo. Alterações de atributos ou reforja posteriores não reescrevem P.

Sejam T a duração total da recarga atual, r o tempo restante antes do tick e dt o passo ativo em segundos. Integrar antes de decrementar o timer, dentro de `tickStatuses`, antes do movimento do jogador:

- `a=min(dt,r)`; não avançar além da conclusão.
- `u0=clamp(1-r/T,0,1)`; `u1=clamp(u0+a/T,0,1)`.
- Dano nominal por alvo na cápsula: `D=P × a × (0,6+0,3×(u0+u1))`.
- DPS instantâneo sobe linearmente de `0,6P` para `1,2P`; é taxa por segundo, não multiplicador de impacto.
- Segurando toda a janela e mantendo o alvo dentro, integral `0,9P×T`. Uma janela parcial recebe somente a integral do trecho segurado, sem recuperar tempo perdido.

Entradas não finitas, P≤0, r≤0, T≤0 ou dt≤0 devolvem dano0. O cálculo usa integral do intervalo, não amostra pontual por frame. Particionar o mesmo intervalo não altera o dano nominal em alvo estático, salvo tolerância de ponto flutuante. Dano central ainda aplica modificadores globais e escudo; por isso HP observado pode diferir da integral nominal.

Recarga parcial já tem duração proporcional à falta de cartuchos. Recarregar uma bala de cada vez não concede orçamento de carregador cheio: sem mudança de atributos, a soma de janelas completas com igual quantidade total reposta equivale à janela agregada pela soma de durações. Não há pulso gratuito ao iniciar ou terminar. Reforja durante a recarga conserva exatamente `reloadTotal` e `reloadTime`, inclusive no caminho legado de uma arma. Modificadores novos de duração valem apenas para a próxima recarga. A integral restante usa o T e o progresso reais já em curso, conservando P; não reinicia rampa, prazo ou referência de dano.

## Referência das12armas sem módulos

Baseline de PROT, uma arma, sem módulos/reforja e disparo normal. P não é o dano de um crítico nem Culatra. A duração é a recarga cheia da arma; parcial usa a fração ausente. Outros chassis e penalidades de2/3armas alteram shotDamage e portanto P; não copiar estes números para um arsenal diferente.

| Arma | Pellets planejados | P | T cheio (s) | DPS inicial→final | Integral nominal0,9PT |
|---|---:|---:|---:|---:|---:|
| Metralhadora | 1 | 22 | 1,4 | 13,2→26,4 | 27,72 |
| Escopeta | 5 | 60 | 2,2 | 36→72 | 118,8 |
| Fuzil de rajada | 1 | 14 | 1,8 | 8,4→16,8 | 22,68 |
| Canhão de precisão | 1 | 88 | 2,6 | 52,8→105,6 | 205,92 |
| Emissor laser | 1 | 10 | 1,6 | 6→12 | 14,4 |
| Lança-chamas | 3 | 15 | 2,4 | 9→18 | 32,4 |
| Lançador criogênico | 1 | 22 | 2,4 | 13,2→26,4 | 47,52 |
| Lança-foguetes | 1 | 70 | 4,8 | 42→84 | 302,4 |
| Lança-granadas | 1 | 45 | 3,6 | 27→54 | 145,8 |
| Carabina Tesla | 1 | 24 | 3 | 14,4→28,8 | 64,8 |
| Disco de retorno | 1 | 24 | 3,4 | 14,4→28,8 | 73,44 |
| Arpão pneumático | 1 | 60 | 2,4 | 36→72 | 129,6 |

## Geometria, ordem e slots

Cada arma equipada mantém sua própria captura P, timer e geometria. A lâmina é uma cápsula frontal: segmento de36 a110px a partir de `weaponOrigin(slot,angle)`, raio12px. A origem aplica o deslocamento lateral normal dos slots: uma arma0; com várias, índices0/1/2 usam−16/+16/+32px perpendicularmente à mira. O teste de contato soma o raio do inimigo ao raio12 e mede distância ao segmento. Direção é a mira manual do tick, sem homing ou prioridade de inimigo.

Múltiplas armas em recarga podem atingir o mesmo inimigo, cada uma pela própria base/duração. Uma arma pronta ou sem captura elegível não herda a recarga de outra. O tick usa posição anterior ao movimento; o desenho utiliza apenas a geometria armazenada pelo último tick elegível. Não recalcular dano, relógio ou geometria no render. Pausa congela a imagem; morte/reset eliminam estados temporários. Sem mapa crescente por inimigo ou fila de ticks atrasados. Geometria/render não sorteiam; dano central mantém seus efeitos cosméticos e sorteios existentes. O teste amostra os corpos no tick; não existe varredura contínua do movimento do jogador ou inimigos.

## Fonte, escudos e combinações

Aplicar fonte `reloadBlade` pelo dano central. Não chamar `impact`, não instalar fogo/frio/corrosão/eletricidade, não gerar explosão de bala, crítico, Motor Cinético, Fratura por impacto ou nova munição. Não consumir Carga de Reparo, não avançar contagem de disparos ou Culatra, não alimentar Matriz nem converter Colimador. Abate da lâmina não aciona `killAmmo` ou `salvage`.

Regras globais continuam: finalizador (`finisher`), Caça-Titãs (`bossHunter`), marca de alvo, XP/loot, contador global/célula de cura e recompensa/cura/peça/baú de chefe. Não reinterpretar esses efeitos como procs de bala. Escudo policial absorve o golpe completo, inclusive a quebra, sem excedente ao corpo e sem estados novos. O próximo tick desprotegido pode atingir o corpo; não dividir artificialmente um golpe para atravessar escudo.

## Apresentação e limites de aceite

HUD acrescenta `· LÂMINA` ao status da recarga por arma enquanto o corte está ativo. A pausa lista base capturada, corte ativo ou instrução de segurar disparo com mira, e segundos restantes; sem captura, mostra aguardando próxima recarga. Não acrescentar botão que concorra com pads, recarga, Matriz ou propulsor. O desenho é uma barra industrial no segmento armazenado: casco#101923, metal#4f6b7a, contorno#e8ddc9, dentes#c95f43 e núcleo ciano#3cc7f4 na primeira metade/#a8f1ff na segunda, ponta#e7fcff. Ele aparece após inimigos/chefe e Matriz, antes dos projéteis, efeitos e robô, sem ser usado como hitbox. áudio usa eventos próprios com RNG sonoro separado: `reloadBladeOn`, throttle0,2s, beep triangular125→250Hz/0,1s/ganho0,025; `reloadBladeHit`, throttle0,12s, hiss0,04s/ganho0,025 e beep triangular210→140Hz/0,045s/ganho0,025. Pausa e render repetido não acumulam som nem dano.

Esta é adaptação funcional de janela ofensiva/duração para as linhas Reload Boost e Cyclone Sword, sustentada pelas provas locais descritas abaixo. Não promete reprodução exata de coeficientes, entidades ou identidade externos. Katana (fim da recarga invoca arma) é motor diferente e permanece pendente; a lâmina desaparece ao terminar a recarga.

## Casos obrigatórios e evidências

Todos começam **não executados no commit final**. Capturar fontes/hash, ambiente, comando, saída, entradas e estado antes/depois; fixtures não são partidas naturais.

1. Captura:12armas, uma/duas/três armas legais, pellets planejados e Titânico/armadura; conferir P próprio e preservação após reforja/atributo. Comparar aquisição antes/durante/depois da recarga.
2. Integral: alvo imóvel de HP alto dentro da cápsula; comparar passo único,60Hz,20Hz e partições irregulares; erro absoluto≤1e−6 ou relativo≤1e−9. Verificar r<dt e r=0, início/meio/fim da rampa e orçamento0,9PT.
3. Parcial: um cartucho faltante versus carregador; repetir recargas pequenas sem dano de bala entre medições. Orçamento proporcional à duração, sem pulso por início/fim, recarga cheia recusada e nenhum ganho por reentrada.
4. Tempo: reforjar no meio da recarga single e multi; timers exatamente preservados, P imutável, novo modificador somente na próxima recarga. Último tick ataca antes de concluir; alvo fora do segmento não recebe dano.
5. Geometria: alvo no centro, extremidades36/110, tangência por raio, fora/atrás/lateral;12armas não alteram cápsula. Repetir com offsets dos3slots, mira esquerda/direita e jogador em movimento, conferindo ordem anterior ao deslocamento.
6. Fonte: alvo normal/chefe/marcado/resfriado e escudo em dano abaixo/igual/acima da proteção. Sem excedente, estados/procs/munição/salvage; globais de dano/morte e recompensa únicos continuam. Repetir com skills de bala e suportes simultâneos.
7. Entrada: mouse down/up, dois pads e terceiro dedo, cancel/lostcapture, blur, escolha, pausa, morte, reinício e rotação; nenhum fogo preso ou retomada automática. Sem peça não existe dano de lâmina.
8. Save/reset: adquirir, morrer, nova tentativa, migrar perfil/config; não serializar peça, referência P, geometria ou timer no progresso permanente. Editor82 permanece inalterado; catálogo vivo16/98 sem duplicatas.
9. Apresentação:1280×900,844×390,740×360,3slots e textos completos alcançáveis por rolagem; zero botão novo/obstrução. Render repetido e pausa conservam estado/RNG; som respeita mute/limites.
10. Longa duração/natural: contagens de estados temporários limitadas pelos slots; sem mapa crescente. Reexecutar avaliação afetada com fontes62 e guardar falhas; resultados61 (8/10 e4/4experimental) não aprovam o novo pool. Matriz final30tentativas, hardware físico e auditoria1.0 continuam pendentes.

## Evidências intermediárias62 e atribuição das fontes

Suítes de engine/browser validaram funcionalmente o motor; não aprovam equilíbrio final, qualidade humana, desempenho físico ou1.0. `tests/reload-blade.cjs` registrou12grupos sintéticos aprovados/0falhas em `outputs/reload-engine62/results.json`, fonte game.js `45ac996705344056724b6ec5c53d827b191b5b593cd0e2370058e66b8e7055b6`. Browser em `outputs/reload-browser62/result.json`: casos aprovados, sem erros ou mudança de fonte durante execução, em Chrome desktop e toque emulado, com proteção/ondas suspensas declaradas. A rodada final da regressão voltou a executar o navegador na fonte corrigida `45ac996705344056724b6ec5c53d827b191b5b593cd0e2370058e66b8e7055b6`, com hashes estáveis; rodadas anteriores foram registradas em5b0228…. Não é teste de celular físico nem partida natural.

A fonte atual inicializa `lastCue=clock−0,12`, valor finito. A anterior armazenava `−Infinity`; esse metadado violava o requisito numérico e as amostras naturais antigas não inspecionavam todos os campos. `outputs/reload-cue-finite62/result.json` comprova que a única diferença entre as fontes é essa expressão e que, após o primeiro contato e em seis passos incluindo soltar/retomar, pausa e conclusão, estado, dano, eventos sonoros e16sorteios seguintes são idênticos. É prova controlada dessa correção, não auditoria numérica global nem repetição natural da fonte atual.

O resumo versionável [build62-balance-summary.json](build62-balance-summary.json) e os dados [build62-runs.json.gz](data/build62-runs.json.gz) preservam14tentativas na fonte congelada `5b0228…`, anterior à correção finita, sem reinícios ou substituição de falhas:

- A, canônico:10receitas na semente20261107, **9/10viáveis**; Forja Criogênica não adquiriu `thermal`. Lâmina adquirida legalmente em5/10, com dano corporal observado em5/5aquisições.
- B, experimento separado de preferência legal pela Lâmina:4tentativas, **1/4viável**. Forja20261126 faltou `thermal`, Forja20261127 faltou `afterburn`, Oficina20261127 faltou `titan`. Lâmina adquirida4/4 e usada com dano corporal positivo4/4; isso não significa4/4viáveis.
- Todas as14sobreviveram1200s ativos e derrotaram≥3chefes. Sobrevivência/chefes não compensam falta das quatro melhorias centrais. Dano corporal observado não inclui absorção em escudos e não mede segundos exatos de contato ativo. Amostragem finita selecionada não aprova todos os metadados da fonte congelada.

Esses denominadores não formam30tentativas canônicas e não usam as três sementes finais do objetivo. Histórico61 (8/10 e experimento4/4) permanece separado. Gates finais G01/G03/G04/G11/G15, matriz30, longa duração, hardware real, auditoria e publicação continuam abertos.

A regressão final da candidata executou20comandos com saída0 e fontes estáveis, incluindo as suítes da Lâmina, armas, baús, Matriz, Culatra, Colimador, escudos, áudio, entrada, equivalências e integração25minutos. A primeira rodada foi preservada como histórica porque a correção de lastCue ocorreu durante um ensaio e o guard detectou alteração de fonte; a rodada coerente posterior usa45ac996…. Isso não executa todos os302casos finais nem aprova1.0.
