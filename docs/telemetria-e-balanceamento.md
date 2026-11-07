# Telemetria e desempenho — BUILD57

A busca de vizinhos das descargas agora reaproveita geometria dentro da fase de projéteis. A primeira consulta usa o algoritmo anterior; uma repetição monta uma lista ordenada para aquele centro/raio. Movimento indexado invalida a lista; cada leitura filtra a vida atual e conserva desempates pela ordem original. A fase termina descartando o cache. Não há redução de dano, de quantidade de raios ou do RNG para acelerar a cena.

## O que o testador mede

O módulo puro tools/run-telemetry.js agrega orbes produzidos/coletados, XP efetivo concedido, dano no corpo e escudo por fonte, cura efetiva, ofertas e decisões. Recarga é medida em arma-segundos, separada dos segundos de tentativa. HP mínimo amostrado é diferente do mínimo logo após dano: uma cura no mesmo tick pode esconder a queda na amostra de fim de quadro. O adaptador informa os dois.

Tools/run-observer.js só é injetado pelo testador, após reset, e não é carregado no jogo normal. O adaptador preserva retornos e estado. Cura sem contexto preciso fica como unattributed; HP ganho diretamente por upgrade não é cura. Alcance do chefe é aproximação geométrica da arma principal, não prova de impacto ou linha de tiro. Firing mede intenção de atirar. Não usar esses números como DPS real sem o denominador correto.

Quantidades agregadas não ocupam o buffer de detalhes. Ofertas têm prioridade sobre decisões; droppedByKind declara perdas. Os ensaios desta rodada usam limite5000 e verificam ausência de perda antes de afirmar cobertura das ofertas. A avaliação continua por20minutos, não encerra a arena infinita.

## Quatro perfis de entrada

| Perfil | Comportamento |
|---|---|
| smart | Política publicada driver13, com alvo e rota calculados; retarget exato no disparo. |
| dumb | Mesmo alvo/tiro/upgrade, mas movimento cardinal para longe do inimigo mais próximo. É fuga com tiro. |
| limited | Decisões a cada400ms, erro angular de até12graus por alvo com RNG próprio e ponto de mira lembrado entre decisões. |
| flee | Mesmo movimento de dumb, sem entrada de disparo. Suportes automáticos adquiridos continuam legais. |

Limited não é necessariamente mais difícil: também remove o retarget por tiro e conserva a mira antecipatória calculada na decisão. As perturbações não calibram habilidade humana. O modelo não recebe invulnerabilidade, dano extra, cura, inimigos removidos ou ofertas forçadas. Equipamentos são liberados apenas no perfil isolado para montar a receita de teste.

O CLI tools/playtest-bot.cjs aceita --mode smart|dumb|limited|flee. Telemetria vem ligada; --no-telemetry desliga. O harness usa BUILD_TELEMETRY=1 e BUILD_PILOT; BUILD_SELECT seleciona receitas sem enfraquecer a verificação estrutural do catálogo10. Tools/run-balance-study.cjs grava critérios antes dos resultados e preserva falhas.

## Verificação e limites

- tests/run-telemetry.cjs protege conservação de frações, minutos, tempos, canais, cópias e limites.
- tests/run-observer-equivalence.cjs compara12mundos/76checkpoints com e sem observador, incluindo retornos, saves e próximos sorteios. O caso110→99→110 diferencia dano e cura simultâneos.
- tests/bot-pilot.cjs compara três mundos de180s com a política literal da BUILD56 e protege reação, RNG separado, mira lembrada e fuga sem tiro.
- tests/nearest-cache.cjs compara12mundos/108checkpoints contra a consulta publicada56; tests/spatial-runtime.cjs compara18cenários com busca completa, incluindo mortes, movimento, chefes e efeitos.
- A suíte principal executa25minutos controlados; a comparação de32mundos conserva estado de combate e RNG.

A bancada tests/current-chaos-browser.cjs restaura um mundo sintético antes de cada amostra: vida alta, imunidade, ondas suspensas, arsenal e estados instalados. Usa60amostras por célula e separa tick/desenho/áudio; não mede FPS, GPU de telefone ou sobrevivência natural. As duas rodadas mudaram apenas game.js; automações concorrentes no computador são uma fonte de ruído. A cena comum reduziu a mediana observada de15 para5ms no desktop; o teto sintético de400projéteis continua caro e exige trabalho adicional. Não anunciar que o custo extremo está resolvido.

O estudo de36tentativas usa três receitas e três sementes em cada perfil, com1200s+3chefes como critério. Mortes precoces são mantidas. Os pilotos smart e limited passaram9/9 cada; dumb e flee0/9. Isso não prova que toda fuga humana falhe ou que os jogadores aprovem o equilíbrio. A matriz das dez receitas é acompanhada separadamente, com mesmas fontes e critérios.


## Resultado das dez receitas e ajuste da Escopeta

A matriz inicial de30tentativas nas dez receitas cumpriu o critério em28. A Escopeta sobreviveu20min em todas as três sementes, mas numa delas venceu sódois chefes. A telemetria mostrou27,75s no alcance geométrico estimado para965,95s com chefe vivo. Isso motivou uma troca de recomendação, não um aumento global de dano ou redução de vida dos inimigos.

O guia da Escopeta mantém oito melhorias e os pré-requisitos: prioriza Propulsão Balística depois de perfuração, substituindo a ampliação final do raio de explosão. A troca alonga os tiros, abre mão do raio explosivo dobrado e evita a penalidade de dano dessa peça omitida. Os valores das skills e da arma continuam os mesmos. O guia não concede a skill nem altera ofertas: a montagem continua natural.

Antes:2/4/4chefes nas três sementes. Candidata:5/4/5, mais5/5em duas sementes novas; todas as cinco completaram1200s. tests/shotgun-guide.cjs verifica que a salva real alcança um chefe controlado a280px e conserva dano base da arma/munição. Não confundir os atributos base com o dano efetivo da combinação, que muda ao trocar o custo escolhido.

Na matriz atual,29/30tentativas cumprem1200s+3chefes, além das duas aprovações adicionais da Escopeta. A falha de Rede de Plasma foi preservada: morreu aos592,1s, nível16 e um chefe. Produziu1616orbes e coletou562, com contato como maior fonte de dano recebido. Não concluir que falta dano elétrico: a tentativa produziu abates, mas perdeu coleta e aproximação. A falha e os resultados positivos permanecem insumo para revisão de rota, coleta e sobrevivência.

Resumo auditável: build57-balance-summary.json. Dados completos comprimidos, com alternativas/rotas e erros de preparação: data/build57-runs.json.gz. Os registros incluem a seleção inválida de três receitas e a primeira proposta de Escopeta sem pré-requisito; ambas foram recusadas pelos guards antes de qualquer tentativa. Nenhum guard foi enfraquecido para aprovar uma receita. As nove receitas sem alteração reutilizam suas medições porque seus objetos e os hashes de gameplay/política são os mesmos; a receita alterada foi testada novamente.

Benchmarks completos: data/build57-benchmarks.json.gz; comparação resumida em build57-chaos-comparison.json. Equivalências de consulta, observador e piloto estão em build57-query-equivalence.json, build57-observer-equivalence.json e build57-pilot-equivalence.json.

Retificação de bancada na BUILD58: o restaurador antigo não removia chaves novas do jogador nem restaurava cursor da arma, spawn e alguns contadores. As24células históricas ficam preservadas, mas não provam entradas físicas integralmente congeladas. A comparação nova usa fingerprints e restauração completa; consultar maturacao-e-desempenho.md. Resultados naturais usam outro runner e não são invalidados por esse problema da bancada de desempenho.
