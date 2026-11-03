# Desempenho de hordas — baseline BUILD 44

Medição em 03/11/2026. A combinação Plasma apresenta travamentos reais de execução de JavaScript quando há muitos corpos próximos. A atualização simples dos inimigos permanece relativamente barata; a renderização de uma horda densa é um segundo gargalo independente. Nenhuma solução deve descartar vivos distantes ou introduzir teto artificial, conforme `docs/contrato-atual.md`.

## Método e limites

`tools/profile-horde.cjs` executa o `tick` e o `draw` reais no Chrome 156.0.8078.80 headless, Windows x64, Intel Xeon E5-2680 v4 2.40 GHz / 28 processadores lógicos. Viewport de 1280×720, resolução de combate 640×360 pelo pixelScale normal de 0,5. O campo `viewport` nos JSON é capturado **antes** do primeiro reset: seus 1000×600/300×150 descrevem a tela inicial, não a área usada nas medições. Os relatórios suplementares registram `renderSize` por amostra e `activeRenderSize` após reset para esclarecer essa diferença.

RAF desativado; passo fixo 1/60 s. Cada métrica reinicia sua própria fixture: `tick`, `draw`, `tick+draw`. Os tempos incluem comandos Canvas efetivos e eventuais bloqueios do navegador, mas não aguardam conclusão da GPU, composição ou apresentação. **Não são FPS exibidos, taxa de sobrevivência nem aprovação de uma partida inteira.** Médio e p95 são descritivos; amostras curtas de Plasma extremo têm apenas seis chamadas, portanto o p95 é o máximo observado. Não subtrair métricas medidas separadamente nem interpretar a soma como uma identidade exata.

Fixture com semente LCG 20261103: próximos em raio 120–639 px; mistos com 20% próximos e 80% a 10.000–49.999 px; remotos todos nessa faixa distante. Usam inimigos reais com HP alto e imunidade do jogador exclusivamente para preservar a população durante profiling; ondas e chefes suspensos. Isso não representa balanceamento natural. As 81 amostras principais mantiveram todos os 500/2000/5000 inimigos vivos e posições finitas, sem pageerror. Os processos auxiliares e a máquina compartilhada podem introduzir variação de sistema.

Fontes SHA-256 congeladas em `outputs/performance/baseline/`:

- game.js: `624b70c3a1c86294815f02885087819f440cea1e3dfb1e304f980a2c9341e4ef`
- balance.js: `6829cab2c56326c8a14d340b248166739f4a3cd5d386fd1d6c758762a6a2c8d3`

A baseline pode ser comparada com versões posteriores usando `HORDE_SOURCE_DIR`. O Playwright entrega essas duas fontes congeladas por interceptação, sem editar o runtime servido. Outros assets/fontes continuam sendo os disponíveis no servidor; congelar o checkout inteiro é necessário para uma comparação estritamente idêntica caso mudem renderização, áudio, CSS ou dependências.

## Resultados principais

Milissegundos médios por chamada; parênteses mostram p95 onde indicado. Plasma instala de forma real `damage, rate, extra, freeze, pierce, blast, blastRadius, shock, conductivity` sobre laser, preservando seus custos.

| População | Distribuição | tick sem disparar | draw sem disparar | tick Plasma | tick+draw Plasma |
|---:|---|---:|---:|---:|---:|
| 500 | próxima | 0,36 | 2,95 | 14,65 (23,80) | 28,50 |
| 2000 | próxima | 0,86 | 32,35 | 260,75 (444,50) | 312,98 |
| 5000 | próxima | 2,06 | 76,04 | 1931,43 (4891,50) | 1909,45 |
| 500 | mista | 0,36 | 0,44 | 1,35 | 2,20 |
| 2000 | mista | 0,86 | 2,52 | 13,52 | 19,92 |
| 5000 | mista | 1,96 | 15,34 | 98,71 | 115,86 |
| 500 | remota | 0,31 | 0,05 | 0,42 | 0,80 |
| 2000 | remota | 1,04 | 0,07 | 1,55 | 2,06 |
| 5000 | remota | 2,04 | 0,15 | 3,44 | 3,52 |

O passe separado de instrumentação com 2000 próximos e Plasma registrou **4575 chamadas a targets em 18 ticks**, retornando 9.150.000 entradas somadas. Esse contador mede tamanhos retornados, não o número exato de operações Math.hypot, nem alocações: quando não existe chefe, `targets` retorna a própria lista.

## Sensores e corrosão

Pacote real `sensor, sensorRange, sensorRelay, sensorLock, corrosion, corrosionFuse, corrosionBloom, corrosionCatalyst, burn, freeze` sobre laser. Todas as cargas iniciais têm origem na função real applyCorrosion. O tick comum inclui pulsos, marcas e disparo; não força repetição do sensor a cada frame. Como o aquecimento já pode consumir o pulso inicial, o evento de detonação foi medido separadamente para evitar esconder picos numa média comum.

| Próximos | tick médio | tick p95 | draw médio | draw p95 |
|---:|---:|---:|---:|---:|
| 500 | 0,74 | 1,60 | 15,11 | 90,80 |
| 2000 | 1,40 | 1,80 | 48,58 | 75,10 |
| 5000 | 3,08 | 4,20 | 100,66 | 137,30 |

Evento separado: oito resets por caso; 64 primários recebem HP=1 e carga expirada, os restantes conservam HP alto e ficam sem carga. Medido somente `tickCorrosion(1/60)`, sem contar preparação/reset. As 64 mortes são verificadas, assim como a contagem de cargas transferidas. É uma fixture de custo de evento, não retenção artificial de mortos.

| População | Próximos: média / p95 | Mistos: média | Remotos: média |
|---:|---:|---:|---:|
| 500 | 2,25 / 3,60 | 1,81 | 2,16 |
| 2000 | 6,91 / 8,90 | 7,07 | 4,79 |
| 5000 | 18,49 / 25,00 | 14,03 | 12,60 |

Nos próximos surgiram 128 cargas filhas; nos remotos, zero. O custo remoto ainda cresce porque cada morte procura vizinhos na lista inteira.

## Hotspots e proteção do comportamento

1. `explodeAt` filtra todos os targets e chama `shockAt` em cada sobrevivente. `shockAt` faz nova varredura global e ordena candidatos recalculando distâncias no comparador. Perfuração, tiros extras e área ampliam esse trabalho. Usar busca espacial como broad phase, filtro exato e ordem original dos targets. Calcular cada distância com o mesmo Math.hypot uma vez preserva melhor os limites numéricos do que substituir por distância ao quadrado sem teste.
2. `releaseCorrosion` repete varredura e ordenação para cada morte primária. A escolha dos dois vizinhos precisa preservar empates e ordem: o primeiro morto pode reservar um vizinho antes do segundo. Não paralelizar as mortes, atualizar cargas em lote ou permitir que filhos envelheçam no mesmo tick.
3. `tickSensor` também usa varredura global, mas somente no pulso; não foi o principal custo do tick comum. Precisa considerar raio do corpo, escudos e efeitos sequenciais. Os contornos e textos por carga/scanLock ampliam o custo do desenho. Cache de sprites/ornamentos ou atlas é uma próxima hipótese visual; ainda não medimos uma implementação equivalente nem isolamos cada primitiva de draw.
4. A grade de colisão já existente atende a fase de projéteis e é invalidada depois. Reutilizá-la após movimentação dos inimigos cria posições obsoletas. Atualizar inserções após empurrão, deduplicar referências antigas e reconstruir a grade quando necessário. O boss entra depois dos inimigos na ordem de targets; mortes de chefe removem lacaios antes do respingo. Invalidação da lista/rank precisa respeitar isso.

`tools/check-radius-query.cjs` é apenas um protótipo isolado de consulta por raio, sem edição do runtime. Passou **2662 comparações diferenciais** com a busca linear: ordem original, nearest-target com empates, células negativas, limites, corpos grandes, raio enorme, vivos/mortos e inserções repetidas após movimento. Raios enormes têm fallback linear para evitar percorrer milhões de células vazias, sem limitar alvos. Isso valida geometria e ordenação do candidato; **não valida sozinho dano, RNG, efeitos, minimapa ou equivalência do jogo otimizado**. A integração precisa comparar esses estados, incluindo chefes, escudos, cargas nascidas no tick e chamadas aleatórias, além das suítes existentes.

## Reproduzir

Servidor local na porta8001 e Playwright resolvível pelo Node (neste ambiente, NODE_PATH aponta para `outputs/01a19005-456e-73d0-885a-224d201dce92/_build/node_modules`). Executar `node tools/profile-horde.cjs` e `node tools/check-radius-query.cjs`.

Variáveis opcionais: `GAME_URL`, `CHROME_PATH`, `HORDE_SOURCE_DIR`, `HORDE_PROFILE_OUTPUT`, `HORDE_COUNTS`, `HORDE_DISTRIBUTIONS`, `HORDE_PACKAGES` (`idle,laser,plasma,sensor-corrosion`) e `HORDE_BURST_ONLY=1`. O modo burst-only omite a matriz de métricas; a instrumentação separada de Plasma continua presente.

Artefatos locais completos: `outputs/performance/horde-profile.json`, `sensor-corrosion-profile.json`, `corrosion-burst-profile.json` e PNG de inspeção. Os JSON têm valores não arredondados, número de chamadas e hashes. Nada neste relatório aprova automaticamente o canal público, balanceamento das dez builds ou a meta de sobrevivência.

## Primeiro candidato espacial — resultado negativo preservado

O coordenador implementou um primeiro candidato em game.js; o tester apenas congelou a cópia em `outputs/performance/candidate/` e mediu. O relatório `candidate-plasma-profile.json` não demonstra ganho. Mesmo pacote, semente e fixtures; tempos de tick em ms:

| População | Distribuição | Baseline | Primeiro candidato |
|---:|---|---:|---:|
| 500 | próxima | 14,65 | 28,25 |
| 2000 | próxima | 260,75 | 361,39 |
| 5000 | próxima | 1931,43 | 2191,27 |
| 500 | mista | 1,35 | 1,78 |
| 2000 | mista | 13,52 | 18,75 |
| 5000 | mista | 98,71 | 108,97 |

O candidato ordena por rank todo o conjunto amplo antes de filtrar o raio exato. Células que abrangem muitos corpos introduzem Set, alocação e sort sem poupar trabalho suficiente. Recomenda-se filtrar exatamente antes de restaurar ordem e usar fallback linear adaptativo quando a busca espacial praticamente envolve a horda inteira. A heurística deve escolher algoritmo, nunca limitar quantidade de alvos. Repetir medições antes de afirmar uma otimização; o resultado negativo acima não aprova o patch de desempenho. Esta tabela se refere somente à primeira cópia congelada, não a revisões posteriores do coordenador.

## Segundo candidato — melhora densa, limite ainda presente

O coordenador substituiu o sort global do choque por seleção estável dos poucos menores (`O(n*k)`) e adicionou fallback linear quando candidatos amplos ultrapassam 40% da lista. Medição congelada em `outputs/performance/candidate2/`, relatório `candidate2-plasma-profile.json`, mesma fixture. `HORDE_SKIP_EVENTS=1` omitiu somente passes separados de instrumentação e mortes, sem alterar as métricas.

| População | Distribuição | Baseline tick | Segundo tick | Variação |
|---:|---|---:|---:|---:|
| 500 | próxima | 14,65 | 7,89 | −46% |
| 2000 | próxima | 260,75 | 81,56 | −69% |
| 5000 | próxima | 1931,43 | 481,88 | −75% |
| 500 | mista | 1,35 | 1,70 | +26% |
| 2000 | mista | 13,52 | 14,47 | +7% |
| 5000 | mista | 98,71 | 85,57 | −13% |

A melhora de densidade é grande, mas **5000 próximos ainda têm tick médio481,88ms/p951202ms**, com somente seis chamadas no caso extremo. Tick+draw médio565,85ms. A mudança não resolve fluidez de uma horda arbitrariamente densa; a combinação ainda executa muitas consultas/efeitos por impacto. Casos mistos pequenos não demonstraram ganho e precisam ser preservados como limite. O coordenador informou teste diferencial completo de estado/RNG em 18cenários; este tester executou apenas o diferencial geométrico isolado e as medições acima.

Próxima hipótese visual de baixo risco para avaliar: cache dos sprites já redimensionados para tamanhos efetivos e sombras estáticas; conservar ordem de desenho, bob, rotação, hit flash, armas e badges. Capturar imagem antes/depois e medir separadamente. O sprite carregado atual usa ellipse+save/translate/rotate/drawImage por corpo visível. Não reduzir a simulação ou omitir inimigos do minimapa para esconder o custo visual.

## BUILD47 — resultado do renderer inimigo

A hipótese visual evoluiu para três atlas direcionais e cache de atlas imutáveis. Duas variantes mutáveis lentas foram rejeitadas. A matriz idle de27pares reduziu o desenho dos5000próximos de81,54para36,62ms médio; tick+draw92,54→40,07ms. Os5000remotos tiveram tick1,83→2,76ms, com trabalho visual adicional. O jogo ainda tem limites reais com multidões e cadeias de dano extremo. Consulte animacao-inimigos.md e o relatório bruto versionado build47-render-bench.json. Esse resultado não aprova o balanceamento das dez builds nem substitui medir Plasma após otimizações futuras.

## Próxima hipótese — vizinhos elétricos

O sort global já foi removido, mas shockAt ainda visita muitos candidatos no raio405 para escolher poucos vizinhos. Avaliar consulta de células por distância mínima até obter os k vizinhos, com desempate por rank original, fallback fora da fase de projéteis e suporte às inserções após empurrão. Essa hipótese ainda não foi implementada. Exigir equivalência de estado/efeitos/RNG, empates e células negativas; não reduzir alvos ou dano para fabricar ganho.

BUILD49 acrescenta perfil isolado rotors ao profiler:corpos próximos imóveis no raio108, sem tiro manual. Raw build49-rotor-performance.json retém todos os vivos e custos de tick/desenho; não comparar suas posições específicas com o pacote idle anterior como se fossem o mesmo mundo.
