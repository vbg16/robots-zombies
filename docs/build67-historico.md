# Histórico natural da candidata BUILD67

Consolidação documental de execuções já encerradas; nenhuma tentativa foi reexecutada. BUILD67 não foi publicada separadamente. Estes resultados pertencem à física congelada67, com modo então infinito e janela de avaliação de1.200s. Não aprovam a incursão regressiva, bandos, respiro ou Prisma da BUILD68, nem a meta final da1.0.

## Resultados separados

| Ensaio | Sementes | Partidas reais simuladas | Viáveis pelo critério estrito | Aquisição das novas peças |
|---|---|---:|---:|---|
| A — dez receitas canônicas | 6701301 para cada receita |10|9|Nenhuma das duas peças novas nas dez tentativas|
| B — Oficina Viva, preferência legal por Memória de Reparo se oferecida |6701321,6701322|2|2|vitalGrowth em2/2|
| C corrigido — Reagente de Campo experimental |6701341,6701342|2|1|reagentGrowth em2/2|

A, B e C são populações distintas. Não apresentar o conjunto como14receitas canônicas ou como aprovação do gate27/30. A receita C substitui uma entrada no catálogo de ensaio, não adiciona uma décima primeira build canônica. O painel legal de relíquias e as ofertas não foram forçados.

Viabilidade: sobreviver1.200s ativos (tolerância1e-6), não estar morto, derrotar pelo menos três chefes, adquirir todas as quatro melhorias centrais e manter os valores finitos, sem erro funcional. O estado final `playing` é esperado para a regra histórica67; o timer com vitória só veio na68.

## Falhas preservadas

1. **Enxame de Sucata /6701301, ensaio A:** sobreviveu1.199,9999999994563s, terminou vivo com115HP no nível24 e derrotou sete chefes, sem estado numérico inválido. Faltaram `dronePair` e `droneOverclock` entre as quatro melhorias centrais. Nenhum desses IDs apareceu nas opções dos45eventos de oferta registrados; zero eventos de oferta foram descartados. A aquisição de `drones` ocorreu aos435,45s, mas não completou a cadeia central. Falha por formação incompleta da build, não por morte.
2. **Reagente de Campo /6701342, ensaio C corrigido:** sobreviveu1.199,9999999994563s, terminou vivo com120HP no nível20 e derrotou sete chefes, com valores finitos. Faltou somente `freeze` entre as quatro centrais: não apareceu nas opções dos35eventos de oferta, sem descarte de eventos. `reagentGrowth` foi adquirido legalmente aos354,80s; adquirir a peça nova não basta para aprovar a receita incompleta. Falha por formação incompleta, não por morte.

Esses resultados não autorizam atribuir a falta de ofertas a um defeito específico do RNG ou do catálogo. Demonstram exatamente a indisponibilidade dos IDs nas ofertas observadas dessas tentativas.

## Erro de montagem do primeiro C

O primeiro override experimental tinha somente uma receita. A validação existente `structure()` exige dez e recusou `1 !== 10` antes de iniciar qualquer tentativa. O coordenador inicial terminou com erro; os resultados A e B já completos foram preservados. Esse erro não é contabilizado como duas partidas perdidas.

O recheck corrigiu apenas o catálogo de ensaio: nove descritores canônicos preservados e um substituído pelo experimento; o seletor executou somente o experimento. As sementes6701341/6701342 permaneceram porque ainda não tinham sido jogadas. A assertion de dez receitas, a física, o piloto, as ofertas e os poderes permaneceram. O C corrigido terminou sem erro de execução, com resultado estrito1/2.

## Protocolo e limites

Driver13, física20Hz (`dt=0,05`), decisões do piloto smart a5Hz, reforjas habilitadas, política de baús safe, duração1.200s, fontes congeladas. A preferência de B/C altera somente a seleção de relíquia quando a peça desejada aparece legalmente; A usa o runner canônico original. Sem invulnerabilidade, dano/cura concedidos, mortes de chefe forçadas, supressão de spawn ou exclusão de inimigos vivos. Estas partidas são simulação natural de progressão, não jogo humano, FPS ou hardware físico.

A telemetria registra aquisições e dados ordinários, mas não o valor/tempo de cada estágio das novas peças. Não medir DPS causal ou atribuir viabilidade ao crescimento com esses dados. Sementes finais20261130/20261201/20261202 não foram usadas.

## Evidências preservadas e verificadas

- `docs/build67-initial-balance-summary.json`: resumo inicial intacto, incluindo montagem C rejeitada e estado do coordenador.
- `docs/build67-reagent-recheck-summary.json`: resumo intacto do C corrigido.
- `docs/build67-balance-summary.json`: consolidação atual com todos os14resultados jogados, separados em três braços, duas falhas de viabilidade e erro de montagem preservado.
- `docs/data/build67-initial-runs.json.gz`:52registros; SHA-256 `6689e0ce4d869fd60af19ffdd83651eb82a3d2dd35c25a8c716069928ef31806`.
- `docs/data/build67-reagent-recheck-runs.json.gz`:22registros; SHA-256 `d3cb199ccd3ed39441fc512c7eab9a95f1c8548fd9f5016e60bd883a4ffdaa6c`.
- `docs/data/build67-runs.json.gz`: cópia idêntica do arquivo inicial, conservada; não é outro ensaio.

A consolidação descomprimiu ambos os arquivos e verificou, para cada um dos74registros, comprimento e SHA-256 do conteúdo base64, além do hash externo e quantidade de registros. Os arquivos contêm fontes congeladas, protocolos, runners, logs e resultados brutos, inclusive negativos. As execuções brutas confirmam driver13; os campos dos resumos e os motivos acima foram conferidos contra os resultados arquivados.

SHA-256 da física67: `829343c2365d149a504dc72cad1542d703616d5fd1cb7c8c2c38d0cd8c6cbd4b`. A fonte atual68 difere; o consolidado registra `currentPhysicsMatchesFrozen=false` e a lista de fontes alteradas. Concluir a consolidação não significa aprovar a versão atual ou concluir o projeto.
