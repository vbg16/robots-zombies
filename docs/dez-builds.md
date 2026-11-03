# Dez projetos de build do Screwvivors — BUILD 40

Implementações originais para combinar chassi, arma, aprimoramentos, condição de ativação e uma forma de sobreviver. O catálogo jogável está em `builds.js`. No menu ou na garagem, abra **PROJETOS DE BUILD** para consultar as receitas e acompanhar a montagem durante a partida.

**Preparar loadout** exige possuir o robô e a arma. **Acompanhar guia** apenas mostra recomendações: não concede atributos, não instala skills e não altera o sorteio. Cada nível normal permite renovar uma vez as opções. Recompensas especiais mantêm seus momentos próprios.

## As dez receitas

| Projeto | Chassi e arma | Circuito principal | Limitação |
|---|---|---|---|
| Agulha Antititã | PROT + Canhão de precisão | Impacto, dano de chefe, perfuração e uma bateria extra ao vencer chefes | Recarga e pressão lateral |
| Tempestade Balística | PROT + Emissor laser | Frequência, múltiplos projéteis e pulso de área no quinto impacto crítico | Consumo de munição e recarga |
| Escopeta de Ricochetes | BAST + Escopeta | Pellets atravessam alvos e depois ricocheteiam; explosões ampliam cobertura | Dispersão e alcance curto |
| Caçador Criogênico | PROT + Lançador criogênico | Resfriar, perfurar e finalizar; mortes por bala em alvos já resfriados provocam fratura | Vida reduzida e necessidade de acertar a linha |
| Forja Criogênica | FORJ + Lança-chamas | Queimadura, resfriamento e conversão térmica | Alcance e necessidade dos dois estados |
| Rede de Plasma | VOLT + Carabina Tesla | Descargas, fogo e explosões distribuídas por grupos | Menor eficiência contra um alvo isolado |
| Demolição de Campo | BAST + Lança-granadas | Área expandida, dano de chefe e detonações adicionais | Intervalos sem disparar |
| Oficina Viva | NANO + Escopeta | Vida convertida em dano, recarga proporcional e cura que prepara uma salva perfurante | Movimento lento e exposição durante recarga |
| Enxame de Sucata | ENXA + Arpão | Até três drones mantêm pressão enquanto a arma recarrega | Alcance e cadência da frota |
| Lança de Fuga | PROT + Arpão | Avanço, velocidade, resfriamento e conversão de movimento em dano cinético | Pouca vida e uma rota de fuga precisa |

As ordens completas de oito skills, quatro peças centrais, gambiarras, experimentos e especialização aparecem nos cartões do jogo. São recomendações, não uma promessa de que todas as peças serão ofertadas em qualquer tentativa.

## Seis chassis

| Chassi | Vida | Movimento | Armadura | Identidade |
|---|---:|---:|---:|---|
| PROT-0001 |100|190|0|Mobilidade e protocolos de marcação/escape |
| BAST-0002 |120|155|1|Resistência e protocolos contra ameaças de chefe |
| FORJ-0003 |90|180|0|Queimadura × 1,35; dano direto × 0,9 |
| VOLT-0004 |85|190|0|Descarga × 1,35; dano direto × 0,9 |
| NANO-0005 |110|165|0|Recarga integral repara até 3; uma recarga parcial repara proporcionalmente |
| ENXA-0006 |95|170|0|Começa com um drone independente da arma |

Os quatro chassis novos têm três protocolos próprios cada. Suas aparências usam variações provisórias dos sprites industriais existentes. Os desbloqueios são compras da garagem; o guia não entrega equipamento bloqueado. Perfis antigos mantêm seus desbloqueios anteriores.

## Regras das interações

- **Crivo Balístico:** Câmara Dupla e Quinto Impacto produzem um pulso de raio 48 e dano de 35% do projétil crítico. Cada projétil pode gerar apenas um pulso, mesmo atravessando vários alvos.
- **Fratura Industrial:** uma morte por bala de um alvo já resfriado, com Núcleo Criogênico e Finalizador, gera uma explosão de raio 70 e metade do dano direto. Mortes secundárias não geram outra fratura.
- **Motor Cinético:** Pernas Hidráulicas e Impacto Cinético acrescentam dano igual a 10% da velocidade, limitado à metade do dano direto. O bônus não transfere o golpe de quebra do escudo para o corpo do policial.
- **Chassi Titânico:** combinado com sua raiz defensiva, converte 3% da vida máxima em dano por projétil, limitado a 75% do dano direto. O diagnóstico inclui essa conversão.
- **Armas especializadas:** Munição Incendiária fortalece em 25% o fogo intrínseco; Núcleo Criogênico prolonga para 3 s o resfriamento intrínseco; Descarga acrescenta alvos à corrente intrínseca e fortalece seu dano em 25%; Carga Explosiva fortalece em 25% uma explosão intrínseca.
- **Drones:** máximo de três, intervalo mínimo de 0,35 s e alcance definido. Não consomem a munição da arma nem iniciam procs de projétil. O arco secundário não é recursivo.
- **Reparo:** só a vida efetivamente recuperada ativa os protocolos de cura. Recarregar uma bala não concede o reparo de um carregador inteiro. A carga ofensiva não acumula e é consumida em uma emissão.

O catálogo passa a 70 registros:40 skills normais em 10 árvores, seis gambiarras, seis experimentos e 18 protocolos de chassi. Os 54 IDs anteriores continuam existentes. Configurações e rascunhos da BUILD 39 são migrados preservando as edições; um ID personalizado que passe a colidir com um novo módulo é renomeado com suas referências.

## Ajustes gerais de balanceamento

- Experiência exigida cresce por fator 1,2 por nível, partindo de 6. A coleta começa com raio 95. O objetivo é permitir montar combinações antes da aceleração tardia da horda.
- Um grupo continua tendo 15 inimigos, com intervalo decrescente, surgimento fora da tela e nenhuma remoção silenciosa de inimigos vivos distantes.
- Vida inicial dos comuns:24, crescendo com o tempo. Policiais continuam bloqueados até a derrota do segundo chefe, com escudo 100 e sua movimentação própria após a quebra.
- Criogênico passa a 22 de dano e Tesla a 24. A recarga do canhão de precisão passa a 2,6 s e a do arpão a 2,4 s. O projétil do lança-chamas passa a 300 px/s.
- A cada 25 abates surge uma célula física de reparo, verde e marcada com uma cruz. Coletá-la recupera até 12 de vida e não concede parafusos.
- Caça-Titãs concede mais 20 de reparo ao vencer um chefe. Ganhar vida máxima ou receber cura continua sem ultrapassar o máximo.

Os números são experimentais. Custos, munição, movimento e exposição continuam relevantes; não há promessa de sobrevivência infinita.

## Pesquisa e validação

A [pesquisa de referência](pesquisa-builds-20 mtd.md) cobre as famílias e gatilhos catalogados de 20 Minutes Till Dawn, incluindo combinações de arma, personagem, árvores, sinergias, runas e evoluções. Não é uma enumeração de toda combinação imaginável.

Há evidências separadas:

1. `tests/build-mechanics.cjs` verifica as interações, limites, cura real, escudos e ausência de recursão.
2. `tests/builds-balance.cjs` verifica as dez receitas e executa bancadas de dano e tentativas com progressão real. Bancadas montam pacotes completos de propósito; as tentativas só usam escolhas realmente ofertadas, dano normal e o mesmo jogador automático.
3. `docs/builds-results.json` preserva investigações e falhas anteriores. `docs/builds-results-final.json` contém as rodadas da configuração candidata, com sementes, hashes e receitas.
4. A conferência no Chrome verifica os dez guias, seleção de equipamentos, bloqueios da garagem, ausência de melhorias gratuitas, drones visíveis, layout móvel e migração do painel.

A meta comparativa de uma tentativa longa é alcançar 20 min e derrotar ao menos três chefes. Resultados abaixo dela continuam registrados como falhas dessa meta, sem instalar peças escondidas nem modificar a vida dos inimigos só para o teste. O jogo continua infinito após o limite de observação. Testes automatizados medem o desempenho do controlador descrito no relatório; avaliação humana de dificuldade e diversão é uma etapa distinta.
