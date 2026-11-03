# Ajuste experimental da Lança de Fuga

## Problema observado

A receita original priorizava mobilidade, tinha pouca sustentação e frequentemente morria sem montar o núcleo ou chegar à reforja do nível 20. A avaliação testa receitas completas, não o efeito isolado de cada mudança. Mundo, atributos das armas/inimigos, sorteios, driver 9 e janela de 20 minutos permanecem iguais em cada par.

## Primeira hipótese — coleta e menos perdas defensivas

PROT + Arpão, Campo Magnético no lugar de Finalizador, dano/coleta priorizados e Experimentos orientados a dano/vida. Os ganhos das duas sementes iniciais não reapareceram nos dois sorteios seguintes. A hipótese foi preservada como investigação, sem ser tratada como solução validada.

Janela e meta fixas: 20 minutos e pelo menos três chefes. 4 pares comparáveis; 4 casos disponíveis na base. Mesmo mundo, configuração de skills, driver, passo de física e política. Melhorias continuam sendo conquistadas pelas ofertas.

| Build | Semente | Tempo antes → depois | Chefes antes → depois | Núcleo antes → depois | Meta antes → depois |
|---|---:|---|---|---|---|
| Lança de Fuga | 20261102 | 5:34 → 20:00 | 1 → 4 | não → sim | não → sim |
| Lança de Fuga | 20261103 | 8:33 → 14:25 | 2 → 4 | não → sim | não → não |
| Lança de Fuga | 20261104 | 8:44 → 8:45 | 1 → 2 | sim → não | não → não |
| Lança de Fuga | 20261105 | 6:00 → 5:59 | 1 → 1 | não → sim | não → não |

Campos da receita alterados: skills, core, blessings, experiments. A comparação não comprova taxa de vitória humana nem isola causalmente o efeito de cada campo. As sementes listadas formam uma amostra de desenvolvimento; novos sorteios são necessários antes de generalizar.


## Segunda hipótese — mobilidade sustentada por reparo

NANO + Arpão. Ordem: Alto Impacto, Overdrive, Campo Magnético, Manutenção na Recarga, Propulsor, Pernas Hidráulicas, Núcleo Criogênico e Impacto Cinético. O reparo proporcional e o protocolo Carga de Reparo apoiam disparos/controle enquanto a mobilidade continua com sua perda de vida. Não há atributos gratuitos ou alterações de regras para esta build.

Janela e meta fixas: 20 minutos e pelo menos três chefes. 6 pares comparáveis; 6 casos disponíveis na base. Mesmo mundo, configuração de skills, driver, passo de física e política. Melhorias continuam sendo conquistadas pelas ofertas.

| Build | Semente | Tempo antes → depois | Chefes antes → depois | Núcleo antes → depois | Meta antes → depois |
|---|---:|---|---|---|---|
| Lança de Fuga | 20261102 | 5:34 → 20:00 | 1 → 4 | não → sim | não → sim |
| Lança de Fuga | 20261103 | 8:33 → 20:00 | 2 → 4 | não → sim | não → sim |
| Lança de Fuga | 20261104 | 8:44 → 20:00 | 1 → 3 | sim → sim | não → sim |
| Lança de Fuga | 20261105 | 6:00 → 19:55 | 1 → 4 | não → não | não → não |
| Lança de Fuga | 20261106 | 10:25 → 20:00 | 1 → 3 | não → sim | não → sim |
| Lança de Fuga | 20261107 | 12:21 → 20:00 | 3 → 3 | sim → sim | não → sim |

Campos da receita alterados: robot, skills, core, blessings, specialization, experiments. A comparação não comprova taxa de vitória humana nem isola causalmente o efeito de cada campo. As sementes listadas formam uma amostra de desenvolvimento; novos sorteios são necessários antes de generalizar.


## Decisão e limites

Regra registrada em [protocolo](build42-fuga-protocol.json) antes de inspecionar os resultados completos da segunda hipótese: pelo menos quatro dos seis pares ganham 60 segundos; nenhum perde mais de 60 segundos; os dois sorteios novos também melhoram. A meta de aprovação da tentativa permanece 20 minutos e três chefes.

Resultado: **6/6** pares ganharam ao menos 60 segundos; **5/6** tentativas da alternativa atingiram a meta completa. Critério de adoção experimental: **satisfeito**. Receita instalada no jogo: **sim**. Isso não representa aprovação de lançamento público, taxa de vitória humana ou comprovação de equilíbrio de todas as dez builds.

As sementes 20261102–20261105 foram usadas na exploração. 20261106–20261107 foram separadas para verificar a segunda hipótese antes de usá-las para qualquer ajuste. A amostra continua pequena. Tentativas abaixo da meta permanecem reprovadas, mesmo quando melhoram em relação à base. Resultados são limitados a 20 minutos; não se extrapola sobrevivência além desse teto de observação.

## Verificação da aplicação

A bancada da BUILD42 passou nos 70 cenários das dez receitas, com fontes identificados em [build42-builds-bench.json](build42-builds-bench.json). O Chrome confirmou que a nova receita exige comprar o NANO, consome o preço correto uma única vez, seleciona NANO + Arpão e inicia sem módulos gratuitos. Testes de chassis, cura, reforjas, migração e comparação passaram. A inspeção de escopo confirmou game.js e balance.js idênticos aos fontes da avaliação completa da BUILD41 e as outras nove receitas sem mudanças.

## Rastreabilidade

Cada arquivo abaixo contém a receita completa, fontes identificados, escolhas reais e resultados de todos os casos. Sobrescrita de receitas é JSON de teste; não altera o catálogo do jogo. Os lotes mais recentes também guardam hashes do driver e bootstrap, além dos hashes do mundo. Lotes históricos têm driverVersion e fontes; não se inventou retroativamente um hash para eles.

- [build42-fuga-control](build42-fuga-control.json)
- [build42-fuga-holdout-control](build42-fuga-holdout-control.json)
- [build42-fuga-holdout2-control](build42-fuga-holdout2-control.json)
- [build42-fuga-experiment](build42-fuga-experiment.json)
- [build42-fuga-holdout-experiment](build42-fuga-holdout-experiment.json)
- [build42-fuga-experiment-2](build42-fuga-experiment-2.json)
- [build42-fuga-holdout2-experiment](build42-fuga-holdout2-experiment.json)

O comparador rejeita mundos/configurações diferentes, versão de driver, passo de física, janela, política, sementes ausentes, casos duplicados, estados não finitos e resultados que contradizem a meta. Quando os hashes do driver/bootstrap estão presentes, ambos os lados precisam fornecer os mesmos hashes. Teste: node tests/build-comparison.cjs. Gerar novamente: node tools/report-fuga-tuning.cjs.
