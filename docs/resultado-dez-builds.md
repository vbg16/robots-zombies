# Resultado das dez builds — BUILD 40

As dez receitas estão implementadas e as dez passaram nos testes de funcionamento. **O balanceamento de todas as builds ainda não está aprovado:** 7/20 tentativas automatizadas alcançaram 20 minutos; 5/20 atingiram também a meta de pelo menos três chefes. O canal permanece experimental, com publicApproved=false.

## Partidas com progressão normal

Duas sementes por receita, 20261102 e 20261103. Cada célula mostra **tempo sobrevivido / chefes derrotados**. A meta foi definida antes da avaliação: sobreviver 1.200 segundos e derrotar pelo menos três chefes. Uma morte aos 19 minutos continua sendo reprovação nessa meta.

| Build | Semente 20261102 | Semente 20261103 | Núcleo montado | Sobreviveu 20 min | Meta completa |
|---|---|---|---|---|---|
| Agulha Antititã | 13:48 / 4 | 12:03 / 4 | 2/2 | 0/2 | 0/2 |
| Tempestade Balística | 20:00 / 2 | 20:00 / 4 | 2/2 | 2/2 | 1/2 |
| Escopeta de Ricochetes | 19:33 / 2 | 10:16 / 2 | 2/2 | 0/2 | 0/2 |
| Caçador Criogênico | 12:17 / 4 | 5:43 / 1 | 1/2 | 0/2 | 0/2 |
| Forja Criogênica | 18:41 / 4 | 11:46 / 1 | 2/2 | 0/2 | 0/2 |
| Rede de Plasma | 20:00 / 1 | 7:09 / 1 | 2/2 | 1/2 | 0/2 |
| Demolição de Campo | 20:00 / 4 | 20:00 / 4 | 2/2 | 2/2 | 2/2 |
| Oficina Viva | 16:13 / 1 | 16:28 / 1 | 2/2 | 0/2 | 0/2 |
| Enxame de Sucata | 20:00 / 4 | 20:00 / 4 | 2/2 | 2/2 | 2/2 |
| Lança de Fuga | 5:34 / 1 | 8:33 / 2 | 0/2 | 0/2 | 0/2 |

O agente usa o mesmo algoritmo de oito direções para todas as receitas, mira contínua, decisões a 5 Hz e física a 20 Hz. Escolhe apenas melhorias realmente ofertadas, com a renovação permitida pelo jogo. Não recebe invulnerabilidade, dano extra, cura adicional, mortes programadas de chefes ou remoção de inimigos vivos. O perfil de teste já possui os equipamentos para permitir testar os dez loadouts; a montagem da build é feita durante a tentativa. O desenho e o HUD são omitidos: isso mede lógica e progressão, **não FPS em navegador**.

## Bancada controlada

70 cenários passaram: dez builds × sete cenários (base, núcleo e madura em um alvo e grupo, mais chefe maduro). Somente nesta bancada as skills são instaladas diretamente e os alvos ficam parados. DPS de grupo soma o dano em sete alvos. O chefe é o primeiro Brutamontes, com vida de produção; o tempo abaixo não representa os chefes mais fortes nem uma arena com horda.

| Build madura | DPS em um alvo | DPS somado em grupo | Primeiro chefe parado |
|---|---:|---:|---:|
| Agulha Antititã | 128.2 | 343.2 | 0.60 s |
| Tempestade Balística | 712.3 | 1484.1 | 0.70 s |
| Escopeta de Ricochetes | 117.8 | 1364.4 | 1.90 s |
| Caçador Criogênico | 78.7 | 234.9 | 6.15 s |
| Forja Criogênica | 199.3 | 256.2 | 2.65 s |
| Rede de Plasma | 36.1 | 1155.5 | 17.30 s |
| Demolição de Campo | 70.0 | 595.0 | 0.85 s |
| Oficina Viva | 115.5 | 115.5 | 1.65 s |
| Enxame de Sucata | 76.3 | 427.7 | 1.85 s |
| Lança de Fuga | 47.5 | 137.5 | 4.30 s |

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
