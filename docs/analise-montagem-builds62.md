# Investigação das quatro falhas de núcleo — BUILD62

As quatro melhorias faltantes estavam legalmente disponíveis durante parte substancial das tentativas, mas **nenhuma foi oferecida uma única vez**. Não houve oferta recusada de `thermal`, `afterburn` ou `titan` nos respectivos casos. A telemetria dessas quatro tentativas perdeu zero ofertas e zero decisões. O resultado aponta para cauda de sorteio com pré-requisitos e oportunidades limitadas; não reproduz erro de elegibilidade ou de seleção do bot.

Esta investigação é somente leitura de tentativas já concluídas. Não houve nova partida, alteração de produção, piloto, testes, receitas, núcleos, sementes ou critérios. O código analisado é o congelado `5b0228b4251733fc80d5932a838313cf770216510613f856edb985db7773219e`, anterior à correção de inicialização do metadado de áudio. A análise não aprova G01 integral nem as 30 tentativas finais.

## Evidência por tentativa

| Braço / receita / semente | Faltante | Pré-requisito adquirido; primeira oferta em que faltante era elegível | Níveis normais elegíveis / ofertas incluindo renovação | Pool efetivo nessas ofertas | Aparições da faltante |
|---|---|---|---|---|---|
| A / Forja / 20261107 | thermal | burn em 34,90s, nível5; elegível em49,50s, nível7 | 13 / 23 | 16–21 | 0 |
| B / Forja / 20261126 | thermal | burn em113,50s, nível13; elegível em134,45s, nível14 | 11 / 21 | 19–26 | 0 |
| B / Forja / 20261127 | afterburn | burn em47,10s, nível7; elegível em56,25s, nível8 | 11 / 19 | 16–22 | 0 |
| B / Oficina / 20261127 | titan | armor em230,85s, nível14; elegível em237,05s, nível15 | 8 / 15 | 19–24 | 0 |

Os pré-requisitos também não foram recusados: `burn` e `armor` foram instalados na primeira oferta em que apareceram nessas tentativas. A liberação de `thermal` na Forja26 e de `titan` na Oficina27 ocorreu mais tarde porque o próprio pré-requisito não havia aparecido antes. Na configuração congelada, `thermal` e `afterburn` exigem a melhoria `burn`; `titan` exige `armor`; todas têm nível mínimo1. O fogo intrínseco do lança-chamas não substitui a aquisição da melhoria `burn` para elegibilidade. O resfriamento é condição para o efeito de `thermal`, mas não um pré-requisito adicional de oferta nesse catálogo.

As últimas ofertas elegíveis ocorreram, respectivamente, em1149,00s/nível22,1196,25s/nível25,1115,00s/nível21 e1045,25s/nível23. Todas as quatro tentativas sobreviveram até1200s e derrotaram7,7,5 e7 chefes. A falha estrita continua sendo núcleo incompleto.

## Escolhas e renovações

| Caso | Níveis com melhoria normal | Ofertas normais com renovações | Instaladas / puladas | Renovações gastas | Cargas expiradas sem uso | Carga ao resolver última melhoria |
|---|---:|---:|---:|---:|---:|---:|
| A Forja07 | 16 | 26 | 9 / 7 | 10 | 6 | 0 |
| B Forja26 | 19 | 33 | 12 / 7 | 14 | 5 | 0 |
| B Forja27 | 15 | 24 | 10 / 5 | 9 | 6 | 0 |
| B Oficina27 | 17 | 30 | 9 / 8 | 13 | 4 | 0 |

A carga é **uma por nível normal**, renovada em `upgrade('level')`; não existe saldo acumulado entre níveis. Os níveis3,6,9,10 e20 são escolhas de outros sistemas, quando alcançados, e não contam como oficinas normais. Não houve oferta normal de recompensa de chefe nesses quatro casos.

`qaChoose` renova somente quando nenhuma das oito melhorias da receita aparece e ainda existe alguma melhoria dessa receita elegível. Caso contrário aceita a primeira melhoria da receita pela ordem definida, mesmo sendo periférica ao núcleo. Depois da renovação usa a mesma prioridade, depois uma lista fixa de alternativas; se nenhuma aparece, aciona o botão existente de continuar sem melhoria. As puladas acima correspondem a essa última regra, sem evidência de travamento.

Houve cargas sem uso enquanto a faltante já era elegível:

- Forja07: nível11 escolheu `ignition`, nível12 `rate`, nível18 `afterburn`.
- Forja26: nível16 escolheu `ignition`.
- Forja27: nível12 escolheu `ignition`, nível13 `rate`, nível15 `range`.
- Oficina27: nível16 escolheu `repair`, que também é núcleo.

Isso é uma limitação possível da política, não prova de que renovar teria dado a melhoria faltante ou melhorado o resultado. A política executou sua regra documentada. Não se deve apagar as falhas canônicas substituindo-as por um piloto adaptado após observar estes resultados.

## Densidade e limites da inferência

`upgrade` embaralha uniformemente o pool elegível e mostra até três melhorias distintas. A renovação exclui as três opções anteriores somente naquela renovação; não há memória global contra repetir opções em níveis seguintes. Para uma melhoria específica elegível em um pool de tamanhoN, a probabilidade marginal daquela oferta é3/N: Forja07,14,29–18,75%; Forja26,11,54–15,79%; Forja27,13,64–18,75%; Oficina27,12,50–15,79%. São probabilidades do mecanismo para aqueles estados reconstruídos, não uma estimativa causal de taxa de sucesso da receita.

O JSON guarda cada pool, opções, aquisição anterior, decisão, tempo, nível, renovação e regra de pré-requisito. Também inclui o produto descritivo das taxas de não aparição ao longo do caminho observado. Esse produto condiciona nos pools e aquisições efetivamente observados; não é probabilidade ex ante da tentativa, teste estatístico ou pressuposto de independência entre caminhos adaptativos. Quatro casos selecionados por falha não permitem medir frequência global de azar.

Reconstrução: carreguei `availableSkills` e o balanceamento congelados numa VM isolada, sem simular combate. Reconstituí `player.acquired` a partir das escolhas `chooseSkill` aceitas e o nível de cada oferta. O conjunto final foi comparado exatamente com o raw. Todas as opções registradas pertencem ao pool reconstruído; em renovações, apliquei a exclusão anterior. Essa validação sustenta a análise de elegibilidade sem inventar ofertas ou consultar RNG de novas partidas.

## Hipóteses genéricas para uma próxima etapa

1. **Política de renovação:** aceitar qualquer melhoria periférica da receita pode deixar expirar uma oportunidade de procurar um núcleo ainda elegível. Um experimento separado pode comparar prioridade genérica de núcleos e seus pré-requisitos contra o piloto13, com os mesmos critérios e sementes previamente registrados. Não garante ofertas, não muda receitas e não substitui retroativamente os resultados canônicos.
2. **Política de alternativas:** a lista fixa pula5–8 níveis nesses casos. Avaliar genericamente benefícios e custos das opções legais, em vez de pular toda opção não listada, pode alterar força e progressão de XP; a direção do efeito é incerta, pois adquirir raízes também abre novos filhos e pode ampliar o pool. Medir separadamente ganho de níveis, sobrevivência e densidade de ofertas antes de alegar melhora.
3. **Distribuição de ofertas:** o sorteio uniforme sem memória permite longas caudas para qualquer melhoria. Se isso contrariar a experiência desejada, estudar uma regra geral de diversidade entre ofertas, aplicada a todos os nós elegíveis sem pesos por receita, aquisição forçada ou garantia de montagem. Essa seria mudança de sistema, exigindo nova versão e validação própria; não é correção demonstrada por estes quatro casos.

Arquivos de apoio: `outputs/balance-followup62.json` contém ofertas e decisões relevantes completas, hashes dos raws e a reconstrução; `outputs/analyze-balance-followup62.cjs` registra o procedimento reproduzível. Os raws originais e o arquivo BUILD62 permanecem intactos.
