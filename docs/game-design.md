# Design do jogo

## Base técnica aprovada — 27/10/2026

O criador aprovou continuar o desenvolvimento do protótipo no navegador com HTML, CSS e JavaScript, aproveitando o código existente, sem migrar para Godot agora. O assistente ficará responsável pela maior parte da programação; o criador orientará as decisões e testará as versões. A prioridade é validar movimento, disparo manual e sinergias. Empacotamento para Windows/Linux e integração Steam serão avaliados posteriormente; nenhuma ferramenta de empacotamento ou biblioteca adicional foi escolhida. Esta decisão não altera as regras de design nem significa que as funcionalidades planejadas estejam implementadas.


## Ciclo principal confirmado

1. Entrar na garagem.
2. Escolher um chassi de robô, instalar peças e equipar as armas permitidas.
3. Iniciar a partida na cidade destruída.
4. Mover-se, mirar e atirar manualmente; enfrentar inimigos e coletar recursos.
5. Subir de nível e escolher entre melhorias disponíveis, adaptando a build ao sorteio.
6. Enfrentar chefes, com possibilidade de obter peças.
7. Vencer sobrevivendo por vinte minutos, ou morrer e escolher reiniciar ou voltar ao menu.
8. Usar a progressão permanente para preparar outras configurações.

O destino das recompensas em caso de morte e a submissão de resultados ao ranking ainda exigem regras específicas.

## Garagem e robôs

**Confirmado:** haverá vários robôs jogáveis. Eles podem se diferenciar por atributos, armas, habilidades e estilos de movimento, usando uma ou mais dessas diferenças. A garagem permite combinar o tipo de robô com peças e skills da partida.

“Manequim” foi o termo usado inicialmente para as bases desbloqueáveis. Nestes documentos, usamos **chassi** para essas bases, sem definir ainda seu nome na interface.

- Parafusos permitem instalar peças e desbloquear chassis.
- Cada chassi oferece possibilidades próprias de peças.
- Mais armas desbloqueadas e chassis com mais slots são sinais de progressão.
- O PROT-0001 é o robô de referência inicial, associado à arma padrão.

Custos, limites de peças, compatibilidades, atributos e ordem de desbloqueio estão pendentes.

## Armas

**Regra confirmada na última clarificação:** todo o armamento é escolhido antes da partida. Não há troca de arma durante o combate.

- Cada chassi determina a quantidade de armas que pode equipar.
- Chassis compatíveis permitem combinar armas diferentes na garagem.
- Há intenção de chegar a duas e até três armas em robôs avançados.
- Slots adicionais são progressão de equipamento; não são desbloqueados automaticamente ao subir de nível na partida.
- Armas equipadas podem evoluir depois de um nível X ainda não definido.
- Não haverá fusão ou receita de combinação entre armas. As sinergias vêm da interação com o robô, peças e skills.

A menção inicial a uma terceira arma “no último nível” foi substituída pelo esclarecimento sobre slots do chassi. O nível X de evolução da arma permanece pendente. Evoluir uma arma equipada não é o mesmo que fundir duas armas.

Tipos de armas, atributos, munição, recarga, mira de múltiplas armas e disparo simultâneo ainda não foram definidos.

## Controles e combate

**Confirmado:** andar e disparar manualmente são as ações básicas. Esquiva, corrida e habilidades ativas só existem se forem fornecidas pelo robô ou por uma skill adquirida na partida.

O jogo deve exigir movimentação e execução, além de boas builds. Não é necessário impedir toda estratégia parada: uma combinação suficientemente poderosa pode permitir sobreviver sem se mover.

Teclas, esquema de mira, mapeamento das habilidades, pausa, opções de acessibilidade e suporte a toque ainda não são decisões de produção. Os controles do protótipo não constituem aprovação dessas opções.

## Skills e melhorias

**Confirmado:** skills são temporárias e desaparecem ao morrer. Elas se acumulam durante a partida e podem criar combinações exageradamente fortes.

- O jogador escolhe a configuração inicial na garagem; as ofertas de skills dependem de sorteio.
- Cada skill terá três evoluções ou variantes.
- O jogador escolhe entre as opções oferecidas.
- Melhorias vêm de níveis e de peças obtidas de chefes, ou de uma combinação desses sistemas.
- Podem existir vantagens com desvantagens, como dano maior em troca de velocidade.

É pendente definir se as três derivações são caminhos exclusivos, níveis sequenciais ou variantes combináveis. Também faltam regras de repetição, limites, raridade, quantidade de opções, experiência e frequência de subida de nível.

## Recursos e persistência

| Elemento | Regra confirmada | Pendente |
| --- | --- | --- |
| Parafusos | Recurso para instalar peças e desbloquear chassis; nome pode mudar | Fontes, valores, custos e retenção após derrota |
| Peças de chefes | Recompensas com chance de obtenção; peças conquistadas e usadas fazem parte da progressão permanente | Quando são concedidas, onde são instaladas e retenção das não utilizadas |
| Chassis e armas | Desbloqueios compõem a progressão permanente | Critérios e ordem de desbloqueio |
| Skills da partida | Desaparecem ao morrer; não são upgrades permanentes | Regras técnicas de encerramento também na vitória |
| Habilidade do jogador | Deve permitir vencer mesmo com equipamento básico | Curva de dificuldade e parâmetros |

Não há árvore de atributos permanentes, loja ou sistema de fabricação aprovado. Não implementar esses sistemas apenas por associação com a garagem.

## Inimigos e cronologia

| Tipo | Entrada | Comportamento confirmado |
| --- | --- | --- |
| Zumbi perseguidor | Base da horda | Segue o jogador; representa a maioria dos inimigos |
| Ex-policial | Após cinco minutos | Atira e aparece em menor quantidade |
| Perseguidor grande | Após quinze minutos | Segue o jogador, é maior e tem mais vida |
| Chefes | Cronograma pendente | Zumbis melhorados com mecânicas próprias e chance de soltar peças ao serem vencidos |

Taxas de surgimento, dano, vida, velocidade, ataques e escalada da horda ainda serão balanceados. “Dificuldade escalável” é uma intenção confirmada; o sistema de seleção ou progressão de dificuldade não foi definido.

## Cidade e postes

**Confirmado:** o cenário inicial é uma cidade destruída. Um poste de energia pode funcionar como ameaça ambiental: ao passar perto, o jogador faz com que inimigos se aproximem mais rapidamente. Quando destruído, o poste cai e mata alguns inimigos.

Raio de ativação, duração do efeito, direção da queda, dano ao jogador e condições de destruição ainda estão pendentes. Obstáculos adicionais e geração procedural não foram aprovados.

## Resultado, pontuação e ranking

- Vitória: sobreviver por vinte minutos.
- Derrota: morte, com opções de reiniciar ou voltar ao menu.
- Ranking mundial pela Steam: confirmado.
- Fórmula de pontuação, desempates, separação de categorias e regras de envio: pendentes.

Separar rankings por dificuldade e versão de balanceamento foi recomendado, mas não aprovado. Eliminações, chefes e desempenho são candidatos a critérios, não uma fórmula definida. A integração Steam por si só não resolve adulteração de pontuações; a estratégia de integridade precisa ser projetada.

## Desafio de habilidade

O jogo deve permitir que um jogador habilidoso vença com o PROT-0001, arma padrão e sem escolher skills, fugindo e atirando bem. Esse desafio pode virar uma conquista. **Garantia de Fábrica** é um nome sugerido, ainda não aprovado.

## Conteúdo-alvo declarado

Considerando futuras atualizações, o criador propôs:

| Conteúdo | Quantidade |
| --- | --- |
| Fase | 1 |
| Chefes | 10 |
| Armas | 10 |
| Peças | 20 |
| Skills-base | 15 |
| Evoluções ou variantes por skill | 3 |

Este é um alvo de conteúdo, não uma promessa de lançamento. A divisão entre lançamento e atualizações ainda não está definida. Quinze skills com três derivações não significa automaticamente 45 skills independentes.
