# PROT-0001 estático no protótipo

Uso de uma pose estática autorizado pelo criador em 30/10/2026. Esta autorização substitui a espera por animações definitivas apenas para a apresentação estática do personagem; não aprova o ciclo Walk.

- Fonte: `upload/prot-0001-directional-sheet.png`, fornecida pelo criador.
- Extração técnica da primeira pose frontal: x=14, y=70, largura=291, altura=368.
- Exportação: `assets/robots/prot-0001-static.png`, PNG RGBA 64 × 80, transparência preservada, amostragem nearest-neighbor.
- Exibição na arena: 32 × 40, sem interpolação, mesma pose ao caminhar e parar.
- Garagem usa a mesma identidade visual. BAST-0002 mantém seu próprio desenho, também reduzido à altura de 40.
- A alteração é visual: colisões, vida, velocidade, dano, munição e comportamento foram preservados.

A arena agora ocupa toda a janela. As faixas externas e molduras decorativas de tela, HUD, cartões e botões foram removidas. O teclado indica foco por mudança de fundo, e equipamento selecionado continua destacado por cor. O efeito de upgrade usa um preenchimento suave em vez de desenhar uma borda na tela.

Testes Node cobrem carregamento do contrato de desenho estático, dimensões e preservação dos atributos, além das regressões de combate. A imagem exportada foi inspecionada; não foi executada avaliação da interface completa em navegador.
