# Maturação dos drones e custo de combate — BUILD58

A Baia de Comando continua sendo uma das12peças temporárias de baú. Exige drone instalado, não reaparece depois de adquirida e mantém imediatamente dano×1,5 e alcance×1,2. Agora calibra os drones após30/60/90segundos ativos desde a instalação, multiplicando o dano já modificado por1,1/1,2/1,3. O máximo da própria Baia é1,5×1,3=1,95vezes o dano anterior à peça, antes dos demais modificadores. Não são três bônus acumulados entre si.

O relógio da partida controla os marcos. Pausa, ofertas e morte não contam; reinício remove a peça e sua idade. Nada vai ao perfil permanente. Três LEDs ciano indicam o estágio mantendo o núcleo âmbar e a identidade dos drones; um aviso curto e o efeito sonoro de melhoria anunciam cada avanço. A pausa mostra BAIA n/3, a peça instalada e o dano por drone com o estágio atual. Esse valor não soma o bônus condicional de foco contra chefe.

## Regras contra regressão

- A maturação aumenta apenas dano de drone, inclusive seu arco legal a50%. Não muda cadência, alcance adicional, quantidade máxima3, munição, controles ou seleção de alvo.
- Drone não aplica estados de bala nem inicia cadeias recursivas. Escudo absorve integralmente o golpe de quebra.
- O modelo puro não lê relógio global, DOM, timers ou RNG. Recebe idade e devolve estágio, fator e tempo restante; entradas não finitas são recusadas.
- Desenhar LEDs não modifica atributos, relógio ou sorteios. Sem Baia, a apresentação anterior é preservada.
- O catálogo editável continua82, as peças de chefe12 e o compêndio94. Configurações do painel seguem valendo apenas na próxima tentativa.

O motor temporal estudado em Dragon/Trainer foi adaptado a hardware industrial próprio. Os motores de conversão espacial, ciclo de munição, reserva de proteção e gatilhos específicos continuam registrados em [disposição dos sistemas](disposicao-sistemas.md).

## Otimização dos impactos

Durante um tick, as faíscas usam armazenamento circular de até600elementos e reaproveitam apenas objetos novos descartados. Os próximos sorteios continuam idênticos, mesmo quando uma partícula não será visível. Chamadas fora do tick e casos especiais usam o caminho anterior. O conjunto final mantém ordem, campos e duração das partículas visíveis.

Números de dano usam um conjunto de membros durante a fase em que a lista só cresce. O texto é formatado depois da filtragem, para os registros sobreviventes. Fontes, crítico, escudo, valores, posições, agrupamento160ms e limite100 permanecem. A equivalência cobre estado observável após cada chamada/tick; não promete identidade de objetos privados descartados ou texto intermediário durante a fase. Limpeza em finally evita estado de otimização vazando após exceção.

`particle-stream.cjs` compara12mundos contra fonte congelada da BUILD57, incluindo400projéteis, expiração, referências repetidas, chamadas diretas, pausa, reset e exceção. Verifica estado serializável, partículas visíveis e próximos16sorteios. A comparação histórica de feedback cobre32mundos/416checkpoints antes do primeiro marco temporal: exclui somente o registro da data de instalação, não o dano. A nova maturação é uma alteração intencional de poder e tem testes próprios.

## Medição e limites

Comparação no mesmo protocolo, entradas restauradas e verificadas por fingerprint, Chrome desktop1280×900,60amostras por célula, áudio desligado:

| Fixture | BUILD57 mediana/p95 | Candidata58 mediana/p95 |
|---|---:|---:|
| Referência densa60comuns/60balas |5,3 /9,4ms |4,8 /8,6ms |
| Teto180comuns/400balas |154,8 /215,0ms |94,6 /117,5ms |

A mediana extrema caiu38,9%, mas continua alta. São tempos do tick em cenas sintéticas com suportes/status instalados, alvos de vida elevada, jogador protegido, ondas suspensas e restauração fora da medição. Não representam FPS, desempenho de GPU/celular nem sobrevivência natural. Baia estava ausente; seu poder não explica a redução. A pequena correção posterior do texto diagnóstico da pausa não altera o trecho medido.

O ensaio com RNG nativo registrou111,5ms de mediana extrema e135,8ms p95: não eliminou o gargalo. A ordem sequencial num computador compartilhado impede concluir que RNG nativo seja intrinsecamente mais lento. Não trocar o RNG do jogo para imitar essa bancada.

Foi encontrado um problema no restaurador dos ensaios antigos: deixava cursor de arma, spawn e chaves novas do jogador avançarem. Os dados anteriores foram preservados como observações históricas, sem alegação de entradas totalmente congeladas. A comparação acima usa restauração completa; a correção também foi incorporada ao ensaio canônico. O pacote comprimido de evidência inclui fontes, hashes, resultados e pré-voos falhos sem amostras.

## Hipótese de coleta rejeitada

Uma proposta separada priorizou Campo Magnético no guia Rede de Plasma em lugar de um nó opcional de atordoamento. Critério foi fixado antes: cinco sementes deveriam sobreviver1200s e derrotar pelo menos3chefes, além de melhorar coleta na semente problemática. Só3/5cumpriram a viabilidade; a semente20261106viveu1200s mas matou2chefes e a20261118também matou2. A coleta maior não resolveu progressão dos chefes. A proposta foi rejeitada, o guia canônico permanece igual e as falhas estão preservadas. Não houve aumento global de dano ou redução de vida dos inimigos para esconder esse resultado.

## Coordenação e aceitação

Os chats reais Tester inteligente, tester burro, Dev designer e Revisor contribuíram com modelo puro, avaliação visual/layout e revisão do contrato. Agentes cobriram a comparação com RNG nativo, restauração completa, a matriz natural e a regressão automatizada de navegador. Fixtures de interface e relógio injetado não contam como aquisição natural.

Na matriz nova, dez receitas × semente20261107, todas sobreviveram1200s e derrotaram pelo menos3chefes: Agulha7, Tempestade7, Escopeta7, Caçador7, Forja7, Plasma4, Demolição7, Oficina3, Enxame7 e Lança7. Driver13 inteligente, física20Hz/decisões5Hz, reforjas ativas; somente equipamentos foram pré-desbloqueados. Melhorias e relíquias vieram de ofertas reais, sem imunidade, bônus ocultos, abates forçados, suspensão de ondas ou remoção de inimigos vivos. Não usar esse único seed para substituir a matriz histórica ou declarar aprovação universal.

Oito partidas aceitaram Baia naturalmente e tiveram pelo menos90s ativos posteriores. No Enxame, aquisição aos257,95s e942,05s de idade no final. Oficina e Lança não a adquiriram. Estágio3/fator1,3 no fim é derivado da escolha aceita registrada e do relógio ativo; não é isolamento do DPS natural. O teste específico verifica o dano real. Os quatro casos extras previstos condicionalmente não foram executados porque a condição de ausência de aquisição não ocorreu. A única diferença posterior entre a fonte natural congelada e a publicação é uma linha explicativa no diagnóstico da pausa.

Passaram os testes de modelo, integração de maturação, escudo/arco/reset, sensores/corrosão/12relíquias, equivalência de observação, partículas/feedback, a simulação principal de25minutos e os quatro perfis do bot em Chrome. Toque em paisagem e ciclo de captura híbrida também passaram em emulação. Testes de UI usam fixtures, não telefone físico. Os dados brutos, fontes congeladas e protocolos ficam em `data/build58-runs.json.gz` e `data/build58-benchmarks.json.gz`; o resumo natural legível está em `build58-natural-summary.json`.

O teste Chrome `drone-maturity-browser.cjs` passou em1280×900,844×390 e740×360, verificando oferta elegível de três opções, ações no primeiro enquadramento horizontal, quatro estágios injetados/LEDs, dano e explicação da calibração na pausa, congelamento e reset. A primeira passagem foi invalidada por mudança do rótulo BUILD no HTML durante o teste; o registro foi mantido e a execução final confirmou fontes inalteradas. Pareceres dos chats e evidências de QA estão em `data/build58-qa.json.gz`.

O desenvolvimento segue experimental; a branch pública exige aprovação real do criador.
