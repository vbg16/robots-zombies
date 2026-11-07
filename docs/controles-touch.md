# Controles de celular — BUILD56

O gameplay móvel usa a tela na horizontal. Arraste o direcional esquerdo para mover e o direito para indicar a direção da mira e manter o disparo. O centro dos direcionais é neutro; soltar a mira interrompe o tiro. Não há seleção automática de inimigo. O botão RECARGA aciona as armas equipadas; PROPULSOR só aparece depois de adquirir a skill correspondente, mantendo suas regras de recarga e dano recebido.

Cada direcional captura um ponteiro independente. Soltar o movimento não encerra a mira, nem soltar a mira encerra o movimento. Pausa, ofertas, derrota, reinício, perda de foco e saída da página limpam comandos e rajadas pendentes. Cancelamento inesperado do gesto neutraliza os controles. Girar para retrato pausa a partida; voltar para paisagem não retoma automaticamente. O jogador continua pelo botão existente de pausa ou volta à garagem.

Mouse e teclado continuam disponíveis. Teclado tem prioridade para movimento e para o fallback do empurrão. Movimento passivo de mouse não rouba a mira mantida pelo dedo; um clique explícito pode assumir. Somente o ponteiro que iniciou o disparo de mouse pode encerrá-lo. O módulo touch entrega vetores com zona neutra e não acessa vida, sorteio, recompensas ou seleção de inimigos.

O HUD deixa o centro livre e abre os cantos inferiores para os polegares. O painel de munição vai para a lateral superior e permite rolagem vertical quando três armas excedem sua altura. Os avisos continuam limitados e os controles desaparecem durante as escolhas. A Configuração e a Garagem explicam os gestos nos dispositivos de toque.

## Proteções e evidência

- `tests/touch-controls-browser.cjs`: Chrome com hasTouch/isMobile e eventos CDP com dois contatos. Exercita disparo manual com munição real, soltura independente, zonas neutras, diagonal, recarga, skill do propulsor, cancelamento, transições e rotação. Inclui uma fixture de ENXA com três armas; equipamento dessa fixture não é progressão conquistada.
- `tests/touch-hybrid.cjs`: ponte com adaptador simulado, entrada híbrida, dono do ponteiro, perda de foco e fallback de empurrão. Não comprova captura real no navegador.
- `tests/combat.cjs` e `tests/combat-feedback-equivalence.cjs`: regressões do combate e equivalência de mundos sem entrada touch. A equivalência não pretende igualar entradas diferentes.
- `tools/check-release.cjs`: inclui verificação dos stylesheets locais, além dos scripts e imagens, para impedir ZIP com referência a arquivo ausente.

Emulação de navegador não comprova conforto, bateria, latência ou GPU de um aparelho físico. Avaliação humana de uma partida e desempenho no caos atual permanecem etapas de finalização; esta entrega não altera a aprovação do canal público.


## Resultado da candidata

O Dev repetiu a aceitação final nos três tamanhos844×390,740×360 e932×430, com os últimos ajustes de captura e munição. Todos passaram sem erro de página. Em740×360, a fixture de três armas apresentou13px de conteúdo excedente e o swipe CDP rolou esse conteúdo sem atirar. Relatório: build56-touch.json. O teste comprova retorno a state=playing depois das escolhas antes de avaliar ausência de comandos presos.

A prova nativa do mouse em Chrome passou em pausa, oferta e morte: captura confirmada no canvas antes da transição, solta depois, mouseup entregue ao botão do overlay e clique novo funcionando sem disparos/rajadas presos. Relatório: build56-capture.json. A suíte principal repetiu25minutos controlados de combate;32mundos conservaram estado e próximos sorteios no caminho de entrada de PC, conforme build56-equivalence.json. Isso complementa, sem substituir, uma partida humana em telefone.

As falhas intermediárias do harness foram preservadas em outputs: sequência CDP de soltura corrigida, espera por RAF substituída por polling temporizado e retorno de oferta corrigido para realmente retomar combate. Não foram corrigidas alterando regras do jogo.
