# Reagentes de sucata — BUILD 43

Adaptação original da família de dano adiado e propagação na [pesquisa de referência](pesquisa-builds-20mtd.md). A mecânica usa um reagente industrial, sem copiar nomes, personagens ou coeficientes da referência. É uma nova árvore normal, com raiz e três derivações combináveis. Não cria uma arma nova, troca de equipamento ou bônus permanente.

## Quatro módulos implementados

| Módulo | Ganho | Custo / condição |
|---|---|---|
| Revestimento Corrosivo | Bala que não mata aplica uma carga; após 2 s, repete o dano base daquele projétil. | Dano direto ×0,85. Uma carga por alvo, sem acumular, substituir ou renovar; escudos bloqueiam aplicação. |
| Iniciador Rápido | Prazo das cargas novas ×0,5. | Dano das cargas novas ×0,75. Não reescreve uma carga já aplicada. |
| Respingo Reagente | Morte de um alvo com carga primária transfere metade da carga a até dois vizinhos a 100 px. | Recarga ×1,15. Uma geração: cargas transferidas não propagam. Ignora inimigos já marcados e escudos intactos. |
| Catalisador Térmico | Detonação causa +50% se o alvo ainda estiver queimando ou resfriado naquele instante. | Dano direto ÷1,15. Fogo e gelo não duplicam o bônus. |

Uma carga captura dano e prazo quando aplicada. Crítico e Carga de Reparo que já fazem parte do projétil entram nessa base. Multiplicadores contra chefe, Finalizador e marca do PROT são avaliados pela rota normal de dano ao detonar, uma vez; não são duplicados na captura. Dano elétrico, queimadura, explosões e drones não semeiam cargas. Mortes desses canais podem liberar um respingo se havia uma carga primária.

As cargas de respingo nascem com metade da base da primária e prazo novo; não consomem tempo no quadro em que nascem. A remoção dos lacaios ocorre antes do respingo do chefe. Inimigos mortos ou removidos não podem gerar recompensa atrasada. Uma bala absorvida pelo escudo, inclusive a que o quebra, não marca o corpo.

## Leitura e configuração

Alvos marcados recebem contorno verde e contagem regressiva. O diagnóstico de pausa mostra prazo efetivo e proporção da carga. O manual e a bancada mostram os quatro ícones próprios, ganhos, custos e árvore. Desenhar o indicador não usa aleatoriedade de combate; sem a skill, o novo processamento de cargas não percorre a horda.

O catálogo passa de 70 para **74 aprimoramentos**: 44 normais em 11 árvores, seis gambiarras, seis experimentos e 18 protocolos. Os dez projetos de build permanecem dez; o ensaio abaixo é uma receita isolada de teste, não um décimo primeiro guia.

O painel oferece os atributos **Dano da corrosão** e **Prazo da corrosão**, ambos multiplicadores iniciados em 1. Por exemplo, prazo ×0,5 reduz 2 s para 1 s. O prazo efetivo fica entre 0,25 e 30 s; a base de cada carga é limitada a 1e9. O bônus térmico, o limite de alvos e a geração única são regras programadas, preservadas ao editar números. Configurações continuam valendo apenas a partir do próximo reset.

Formato salvo: version 1, catalogRevision 3. Migração de 54/70 registros preserva edições e adiciona os novos módulos. A revisão de origem identifica IDs personalizados que agora colidem com os novos, inclusive Iniciador Rápido, cuja condição textual é vazia; seus IDs e referências são renomeados. Rascunho e aplicação foram verificados no Chrome. Os custos/ganhos padrão voltaram a usar os textos autorais: uma comparação incorreta no adaptador fazia cartas sem edição mostrarem o resumo técnico dos modificadores.

## Verificação funcional e de regressão

- tests/corrosion.cjs: prazo, ausência de renovação/acúmulo, snapshot, propagação limitada, filhos sem envelhecimento imediato, escudos, origem do dano, catalisador, multiplicador de chefe, pausa, morte/reset, limites numéricos e edição na próxima tentativa.
- tests/balance-migration.cjs: fixtures reais da BUILD39 e BUILD42, edições preservadas e colisões personalizadas, incluindo condição vazia; migração idempotente.
- tests/combat.cjs: passou, incluindo cenário controlado de 25 minutos, 44 nós, 11 raízes, manual de 74 entradas, policiais, horda e chefes. O cenário prolongado usa dano sintético/invulnerabilidade e chefes por roteiro para verificar estados, não sobrevivência.
- tests/corrosion-browser.cjs: passou no Chrome, desktop e 390 px; árvore, ícones, manual, confirmação, contorno, pausa e migração de rascunho 70→74. São fixtures de interface, com oferta/alvo injetados. Capturas inspecionadas.
- Painel compilado e testes de editor, balanceamento, chassis, reforjas, áudio e sprites passaram. Os 70 cenários das dez receitas passaram na [bancada de compatibilidade](build43-builds-bench.json).

## Bancada controlada de corrosão

108 cenários: 12 armas × três pacotes × alvo isolado/grupo de cinco/primeiro Brutamontes com vida de produção. Alvos parados, sem ondas; pacotes instalados diretamente apenas neste laboratório. Não há promessa de que adquirir os quatro módulos seja sempre melhor: o catalisador exige um estado e os custos podem prejudicar armas/combinações sem ele.

| Arma (ID) | DPS base, alvo único | Só raiz | Família completa | Família, chefe parado |
|---|---:|---:|---:|---:|
| machine | 56.5 | 55.8 | 50.3 | 12.60 s |
| shotgun | 60.0 | 54.2 | 44.4 | 14.00 s |
| burst | 51.3 | 49.4 | 40.9 | 14.40 s |
| sniper | 54.3 | 76.0 | 65.6 | 8.65 s |
| laser | 80.0 | 71.4 | 63.2 | 9.90 s |
| flame | 87.0 | 75.7 | 65.8 | 8.30 s |
| cryo | 39.6 | 41.8 | 38.0 | 16.55 s |
| rocket | 15.2 | 24.8 | 16.6 | 39.05 s |
| grenade | 27.0 | 34.4 | 33.5 | 17.50 s |
| tesla | 27.2 | 28.6 | 26.0 | 24.40 s |
| disc | 28.8 | 32.3 | 26.6 | 24.05 s |
| harpoon | 14.0 | 17.9 | 18.1 | 15.65 s |

[Dados e fontes da bancada](build43-corrosion-bench.json). DPS inclui dano efetivo de todos os canais daquele cenário; o chefe parado é só o primeiro Brutamontes, não um encontro com horda nem chefes avançados.

## Tentativas com ofertas normais

Ensaio PROT + Criogênico, priorizando corrosão, frio e suas derivações. Equipamentos previamente possuídos apenas no perfil isolado de teste; nenhum módulo instalado à força, invulnerabilidade, cura extra ou derrota programada de chefe. O mesmo driver 9 joga, monta o que foi ofertado e pode falhar. Meta mantida: 20 minutos e três chefes.

| Semente | Tempo observado | Chefes | Nível | Dano efetivo por corrosão | Meta |
|---|---:|---:|---:|---:|---|
| 20261102 | 10.28 min | 2 | 14 | 16328.4 | não |
| 20261103 | 10.48 min | 1 | 17 | 7093.0 | não |

**Zero de duas** cumpriu a meta. O ensaio comprova que o canal participa da progressão normal; não aprova o equilíbrio da árvore. Os registros mostram quais módulos foram realmente adquiridos. [Dados completos](build43-corrosion-progression.json). O registro precede apenas a revisão textual das cartas e os novos campos de diagnóstico, sem mudanças numéricas posteriores; fontes identificados em cada relatório.

Uma nova raiz muda a disponibilidade e os sorteios dos módulos comuns. Avaliações da BUILD41/42 continuam históricas e não aprovam automaticamente as dez builds com o pool de 11 raízes. Balanceamento, novas sementes e avaliação humana permanecem pendentes. Canal experimental, publicApproved=false; o objetivo geral segue ativo.

## Reproduzir

node tests/corrosion.cjs; node tests/balance-migration.cjs; node tests/corrosion-balance.cjs; node tools/report-corrosion.cjs. Os comandos são separados, executados na raiz do repositório. Para o navegador, Playwright precisa estar disponível ao Node; executar node tests/corrosion-browser.cjs com GAME_URL opcional para o servidor local. Essas ferramentas não são dependências do jogo distribuído.
