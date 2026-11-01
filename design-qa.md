# Design QA — HUD azul e arena 32-bit

**Final result: passed**

## Evidências

- **Referência:** `C:\Users\vi-ni\Downloads\Design sem nome.png` — 1920×1080.
- **Implementação:** `C:\Users\vi-ni\.codex\visualizations\2026\10\31\01a192a8-1dee-7441-a2de-d03fd2f8d8b1\hud-implementation.png` — captura do navegador em 1280×720.
- **Comparações:** `C:\Users\vi-ni\.codex\visualizations\2026\10\31\01a192a8-1dee-7441-a2de-d03fd2f8d8b1\hud-comparison.png` e `C:\Users\vi-ni\.codex\visualizations\2026\10\31\01a192a8-1dee-7441-a2de-d03fd2f8d8b1\hud-detail-comparison.png`.
- **Viewport:** 1280×720 CSS px; escala de densidade não medida. A referência foi reduzida para 1280×720 antes da comparação.
- **Estado:** combate iniciado, 00:06, 88/100 de integridade, sem chefe ativo. A referência mostra um chefe em combate aos 12:37; por isso o estado do chefe e os números não foram comparados como equivalentes.
- **Interação observada:** abrir a partida pela garagem e pausar; o navegador mostrou os controles de combate e o estado de pausa. A partida ficou pausada na prévia local.
- **Console:** erros de console não foram consultados.

## Comparação visual

- **Hierarquia e layout:** retrato, nome, nível e vida ficam no alto à esquerda; tempo, abates e minimapa ficam à direita; munição fica embaixo à esquerda. A barra do chefe aparece no centro durante um encontro ativo. Essa distribuição corresponde à colagem.
- **Tipografia:** monoespaçada e compacta, com hierarquia legível. A referência usa fonte pixelada mais característica; trocar por uma fonte própria fica como refinamento.
- **Espaçamento:** os blocos ocupam as mesmas regiões da referência e permanecem separados da área de combate.
- **Cores:** azul frio e aço dominam o campo; vermelho indica integridade e ciano identifica experiência e o robô.
- **Imagem:** o piso azul de pixel art cobre o mundo sem bordas. O PROT-0001 recebeu mais escala, sombra e contorno ciano para se destacar. Inimigos e objetos de cenário ainda têm menos detalhe que a colagem.
- **Conteúdo:** textos da interface estão em português e mostram nome do robô, nível, integridade, tempo, abates, munição e estado do carregador.

## Iterações

1. A primeira captura mostrou o nome do robô quebrado em duas linhas e o terreno vazio. O painel foi alargado e o piso ganhou textura e escombros.
2. A textura inicial reduziu o contraste dos personagens. O piso foi escurecido e o robô ganhou contorno e luz cianos.
3. Na comparação final lado a lado, não restaram divergências visuais P0, P1 ou P2 para os elementos implementados.

## Acabamentos posteriores

- Criar sprites finais para zumbis e mais variações de cenário, mantendo leitura sobre o piso.
- Substituir a fonte monoespaçada por uma fonte pixelada licenciada e adequada ao jogo.
- Comparar a barra de chefe e seus valores com uma captura no momento de um encontro.
- A progressão sem fim, o crescimento da horda e a recorrência de chefes ainda precisam de avaliação de jogabilidade; nenhuma suíte automatizada foi executada nesta entrega.
