# Auditoria de animações — 03/11/2026

Inventário por leitura dos assets e do renderizador no início desta revisão. Não é aprovação visual nem afirmação de que o jogo inteiro possui animação final. Mudanças posteriores devem atualizar esta tabela.

| Elemento | Renderização encontrada | Estado e lacuna |
| --- | --- | --- |
| PROT inicial | `assets/robots/prot-0001-simple.png`, 64×80, desenhado em 58×72 por `drawRobot` | Uma pose. O retorno antecipado ignora `walkPhase` e `stride`. A imagem compacta é a referência atual aprovada. |
| PROT antigo | `prot-0001-static.png` | Preservado, silhueta pesada superada pela versão simples; não usar como referência principal. |
| BAST | `bast-0002-walk.svg`, faixa 256×80, quatro células 64×80 | Passada ativa de quatro quadros, alternância de braços/pernas e deslocamento vertical. Piloto gato visível na cabine. Somente frente. |
| Forge, Volt, Nano, Swarm | Mesmo desenho BAST com filtros de cor | Passada existente compartilhada; recolorações não constituem quatro identidades visuais finais próprias. |
| Zumbis comuns | Três PNGs individuais, variantes mechanic/scavenger/security-brute | Pose estática com oscilação vertical e rotação do corpo inteiro. Não é ciclo de caminhada. |
| `zombie-horde-atlas.png` | Metadados descrevem três poses originais estáticas | Não é sequência de frames. Alternar células mudaria de personagem. |
| Estudo zumbi v1 | ZIP com oito PNGs 48×64 + manifesto, arquivado em `assets/studies/zumbi-walk-v1/` | Animação frontal real, não integrada, estrutura validada; aprovação visual continua pendente. |
| Brutamontes | `drawZombie(b,true)` | Pose PNG estática ampliada, com oscilação; compartilha a lacuna dos zumbis. |
| Sucateiro/Bobina-Queen | `drawSpecialBoss`, desenho procedural | Sem passada articulada. Cores de impacto existem; mover a posição do chefe não anima seus membros. |
| Projéteis e efeitos | Rastos, disco giratório, partículas, pulsos, explosões, indicadores de status | Efeitos temporais existem. Não substituem animação dos personagens. |

## Material reaproveitável

`sprite-animation.js` já implementa seleção explícita de estado/direção, quadros com duração, pivô e desenho sem interpolação. Não está carregado no `index.html` nem usado pelo renderizador auditado. Seus testes verificam o auxiliar isolado, não a integração de personagens.

`tools/validate_walk.py` e `tools/walk-preview.html` recebem os oito frames individuais e manifesto. Eles ajudam a revisar o estudo arquivado; o validador não aprova anatomia ou apoio dos pés. O novo `tools/inspect-sprite-sheet.py` inspeciona uma grade PNG regular sem alterar os pixels. Informa tamanho das células, bounds de alpha, transparência intermediária, duplicatas exatas e contato com bordas; não certifica a orientação nem a qualidade de uma passada.

### Estudo de zumbi: reaproveitamento com ressalvas

O ZIP `sprites-originais.zip` contém 00.png…07.png, todos 48×64, pivô compartilhado (24,60), 100 ms por quadro, ciclo de 800 ms. A extração para inspeção em `outputs/animation-audit/zumbi-walk-v1/` preservou os bytes do arquivo original; não houve redesenho. Os quadros 00 e 04 exibem posições diferentes das pernas e braços. Portanto há material de animação real, diferente da oscilação da pose atual.

O estudo é frontal, tem silhueta mais estreita e simples que o PNG atual do mecânico e ainda exige teste de apoio, movimento sobre o chão e fechamento 07→00. O registro anterior aponta que a faixa vertical das botas permanece igual enquanto seus limites horizontais variam. Não se deve chamar esse efeito de transferência de peso aprovada. Pode servir como candidato de teste para um tipo de zumbi, sem substituir simultaneamente todas as variantes.

## Integração recomendada

1. Preservar a silhueta compacta, placas claras, juntas escuras e ciano do PROT simples. O piloto gato é parte da identidade do jogo; não trocar por um humano nem adotar automaticamente a silhueta pesada histórica.
2. Para novas pranchas, declarar explicitamente ordem das linhas/direções, número de colunas, tamanho de célula, pivô e duração. Não inferir que toda imagem gerada possui grade perfeita ou oito quadros únicos.
3. Avançar a passada pelo deslocamento real do ator ou velocidade real. Parado deve usar pose idle; stun deve congelar a passada. Evitar usar posições do mundo na fase, pois muda a passada ao teleportar/recolocar o inimigo.
4. Guardar estado visual separado da simulação. `draw` não deve sortear números nem alterar HP, colisão, cooldown, velocidade, RNG ou progressão. Preservar dimensões de colisão mesmo se a arte mudar.
5. Manter o congelamento já existente durante pausa e escolhas de melhoria: `clock` avança somente no tick da partida. A animação nova deve usar esse tempo ou delta equivalente, sem relógio absoluto independente.
6. Ancorar todas as células pelo pivô dos pés. Desenhar sem smoothing, com destino arredondado. Verificar se cada arma sobreposta continua ligada à mão/corpo de cada direção e se o escudo acompanha os policiais.
7. Nos chefes procedurais, adicionar passada de pernas e contrabalanço dos braços com a velocidade real. Quando estacionados para atacar, usar uma preparação/recuperação identificável e efeito de impacto; não manter passada de perseguição enquanto imóveis.
8. Usar fallback existente se o asset falhar ou ainda carregar. Não apagar a referência anterior antes da validação. Registrar como provisório qualquer asset que ainda não passou pela revisão visual.

## Verificação de enquadramento e temporização

- Revisar cada célula e a sequência por pelo menos dez ciclos: 8 s para oito quadros de 100 ms. Incluir pausa/retomada, parada, reinício e troca de direção.
- Mostrar simultaneamente a escala de jogo (PROT célula em 58×72; zumbi comum altura aproximada de 58 px) e ampliação nearest-neighbor. Repetir no chão real claro/escuro, próximo de parede e dos limites da câmera.
- Conferir ausência de corte de cabeça, orelhas do gato, pés e arma em todos os quadros; transparência sem fundo embutido; ausência de vizinho de célula; mesmo tamanho aparente entre direções.
- Marcar pivô dos pés e observar a trajetória no mundo. Evitar salto na troca de direção e no fechamento do ciclo, pés deslizando em excesso e contorno tremendo. Bounds/alpha por si só não provam apoio correto.
- Usar dt variado e retomada após aba inativa: a fase deve permanecer válida sem criar quadros fora da grade. Confirmar que pausa e menus congelam o ator conforme o comportamento da partida.
- Conferir escudo intacto/quebrado, dano, congelamento, stun e armas policiais. A passagem entre estados não deve deslocar o centro físico do ator.
- Comparar antes/depois em partida com muitos inimigos: sem imagens criadas por frame, canvas temporário por entidade ou filtros caros novos sem medição. Assets devem ser carregados uma vez.
- Executar testes de simulação existentes após integração, além de inspeção visual no navegador. Testes estruturais e execução headless não substituem assistir à animação real.

## Limite desta entrega

Esta auditoria e o inspetor não alteram `game.js`, `index.html`, versões nem assets finais. Não houve commit/push. A geração e a integração da nova prancha PROT estão sob coordenação do chat principal; a tabela acima descreve o estado auditado antes dessa integração.

### Candidato PROT v2 preparado após o inventário

O chat principal gerou uma nova prancha usando o PROT simples como referência. O PNG foi copiado sem alteração de pixels para `assets/robots/prot-0001-walk-v2.png`; SHA256 `4d657cee46995a14116b218b20aeae1cee9f65563fffa38d98d89dbf3cc65275`. Dimensão real: 1774×887. São 4 direções (frente/direita/costas/esquerda) × 8 quadros únicos, e não uma grade nativa de 64×80. Os retângulos explícitos no JSON usam divisões arredondadas de 221,75 px, sem reamostrar a imagem original.

`assets/robots/prot-0001-walk-v2.json` fornece clips `walk.down/right/up/left`, idle pelo primeiro quadro, 100 ms por quadro e pivôs candidatos por quadro. X usa o centro da célula; Y usa a base dos pixels com alpha>=128. Isso elimina deslocamento aleatório da linha de base, mas não comprova apoio físico correto dos pés. A integração deve avaliar se mantém o balanço desejado e se arma/HUD permanecem alinhadas.

A imagem contém 645864 pixels de alpha intermediário, incluindo 92433 pixels de alpha1. Ruído quase invisível alcança algumas bordas de células; a região alpha>=128 permanece dentro das margens. A imagem não pode ser classificada como pixel art com alpha binário. Não houve limpeza, recoloração, corte ou redesenho do PNG. A cópia foi comparada byte a byte com a saída original da ferramenta.

Prévia local: `outputs/animation-audit/prot-walk-v2-preview.html`, servida pelo HTTP do projeto. Mostra as quatro direções em escala de jogo e ampliadas, pivô, fundos alternativos, scrub e dez ciclos programados. Relatório detalhado: `outputs/animation-audit/prot-walk-v2-inspection.json`. Ambos estão em `outputs`, ignorado pelo Git.

Validação executada: 32 quadros aceitos pelo validador geométrico de `SpriteAnimation`, dez ciclos de temporização sem sair da grade, sintaxe JavaScript da prévia, inspeção do PNG original 64×80, inspeção arredondada dos 32 quadros e rejeição da grade fracionária quando o modo arredondado não é solicitado. A integração no jogo e a revisão visual em navegador continuam sob responsabilidade do chat principal. O renderer original ainda precisa aceitar `pivotX/pivotY` por quadro para usar esses dados.

### Revisão complementar e suporte ao runtime

Por delegação explícita do chat principal, `sprite-animation.js` passou a validar e usar pivôs opcionais por quadro, mantendo o pivô global para os clips anteriores. `prot-animation.js` fornece `ScrewProtAnimation` como script clássico sem fetch, e o `index.html` carrega ambos antes do app-loader. A ligação de tick/draw em `game.js` continua a cargo do chat principal.

Escala recomendada: 72/177 = 0,406779661, altura visível máxima de 72 px. Desenhar com o pivô em `(player.x, player.y+28)` ou `(0,28)` quando o contexto já foi transladado para o jogador. Os bounds variam durante a passada, portanto a altura visível não é idêntica em todos os quadros. Idle reutiliza a primeira pose de cada direção.

A prévia foi executada em Google Chrome headless, dez ciclos/8000ms, sem erros de JavaScript. Capturas dark/light e uma contact sheet dos 32 quadros foram examinadas visualmente. A escala de jogo mostra quatro orientações distintas, pernas em posições alternadas e ausência de corte aparente; o ruído semitransparente não forma halo evidente nesses dois fundos. A sombra já está embutida na imagem. Capturas em `outputs/animation-audit/prot-walk-v2-preview-dark.png`, `prot-walk-v2-preview-light.png` e `prot-walk-v2-contact.png`. Status da metadata: `PREVIEW_REVIEWED_GAMEPLAY_REVIEW_PENDING`; ainda falta revisar a composição no cenário real, arma, transições e aprovação final do criador.

`node tests/sprite-animation.cjs` e `node tests/prot-animation.cjs` passaram. O segundo verifica manifesto clássico sem módulos/fetch, correspondência com o JSON, temporização de dez ciclos por direção, ausência de frames fora da imagem, altura máxima de 72 px e apoio no destino com arredondamento limitado a meio pixel.

## Integração em arena — BUILD45

Root executou tests/prot-animation-browser.cjs com Chrome: HTTP e file://, caminhada nas quatro direções, troca de quadros, idle, pausa, reinício, alinhamento dos pés e alfa de dano passaram. Também passaram três falhas simuladas: atlas, helper e manifesto ausentes. Capturas outputs/animation-audit/prot-runtime-{http,file}.png e recortes -actor.png; inspeção do recorte HTTP confirma silhueta legível, pés junto ao anel ciano e ausência de moldura. Arma do jogador ainda não tem overlay visível e é pendência real.

Atlas candidato adicional zombie-mechanic-walk-v2.png gerado com a referência original, copiado byte a byte; metadata32quadros/4direções e pivôs medidos. Imagem1774×887,32quadros únicos, alpha residual alcança bordas; candidato ainda não carregado pelo jogo. Não tratar metadados ou unicidade como aprovação de caminhada/apoio. PNG original mantido.
