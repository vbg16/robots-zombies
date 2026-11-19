# Colisão física entre zumbis — BUILD69

Correção do relato do criador: inimigos se enfileiravam ocupando o mesmo espaço. A coesão dos bandos era apenas preferência de direção; não impedia que dois corpos se atravessassem.

## Regra de jogo

Após o movimento e os ataques do quadro, enquanto o estado for `playing`, resolver as interpenetrações entre os círculos dos inimigos vivos. Participam comuns, corredores, lacaios e os dois tipos de policial, incluindo portadores de escudo quebrado em investida. O chefe é uma entidade separada; sua trajetória não é reposicionada por esta correção. Mortos não empurram vivos.

Usar uma ocupação física de `max(18, r)` pixels por corpo, com margem de 2 pixels: distância desejada = `max(18, ra) + max(18, rb) + 2`. O mínimo de 18 acomoda a largura dos sprites sem aumentar seus hitboxes de bala ou dano de contato. Quando houver sobreposição, calcular a normal entre os centros e deslocar cada um pela metade da penetração em sentidos opostos. Centros exatamente iguais recebem uma normal determinística calculada a partir dos índices do par; não consumir RNG de combate.

Uma grade temporária usa células de tamanho `max(32, 2 × maiorOcupaçãoFísica + 2)`. Examinar células vizinhas e cada par uma vez por passagem. Reconstruir a grade por até 12 passagens, interrompendo quando a maior correção for no máximo 0,025 pixel. A preferência por bandos continua existindo; agora os corpos se acomodam uns ao lado dos outros em vez de convergir para o mesmo centro.

O resolvedor só altera posições. Não modifica HP, escudo, raio, velocidade nominal, alvo, vetor/distância restante de investida, estados, munição, RNG, XP, abates ou recompensas. Não remove nem recria inimigos vivos. Pausa, escolhas, morte e vitória bloqueiam a fase física pelo fluxo do jogo.

## Verificação

- Sete grupos curtos de geometria e integração: coincidência, raios distintos, células, dados inválidos, pilha de 180 corpos, perseguição com corredores/policiais e congelamento fora do combate.
- Navegador offline em 1280×900, 844×390 e 740×360: 40 corpos sobrepostos, separação durante perseguição, fuga e pausa; sem perda de HP ou inimigos, sem overflow e sem recursos ausentes.
- Regressão da incursão e do diretor da horda: preservação dos 20 minutos regressivos, respiro, bandos, fila de chefes, lasers e regras de população.

As fixtures preparadas não são partidas naturais, medição de FPS, celular físico ou ensaio prolongado. As melhorias do bot e os ensaios de estabilidade/desempenho permanecem fora desta rodada, conforme orientação do criador. A correção não declara aprovados os gates finais da 1.0.

[Resumo verificável e hash das evidências](build69-collision-summary.json).

Os zumbis visíveis são desenhados por ordem de profundidade (`y` crescente), sobre uma cópia filtrada. Isso torna legíveis as fileiras de trás sem alterar a ordem da coleção usada pelo combate ou seus sorteios.
