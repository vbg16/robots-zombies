# Leitura do combate — BUILD55

Avisos de módulos, sinergias e chefes deixaram de disputar o mesmo ponto acima do robô. A área lateral mostra atéduas mensagens, com fundo escuro, borda ciano e região de status acessível. Avisos repetidos atualizam sua duração em vez de empilhar cópias. A fila conserva no máximoquatro registros; cada mensagem dura2,4s de combate ativo. Pausa e ofertas escondem o painel e congelam seu prazo; reiniciar limpa tudo.

Em telas médias o painel fica abaixo do minimapa; o fallback em retrato o mantém àesquerda. Nos compactos, mostra sóo último aviso acima da área de munição. O tutorial inicial tem espaço próprio: a revisão do chat Tester inteligente reproduziu um conflito durante os primeiros cinco segundos e motivou o ajuste de posição.

O usuário definiu o celular na horizontal. Em paisagem baixa, o HUD passa a ter três módulos compactos no topo: integridade, chefe e tempo/abates. O minimapa menor fica sob o módulo direito; o painel de avisos não ocupa o centro do robô. O layout é o foco desta etapa móvel; os controles de toque ainda exigem sua própria implementação e validação antes de anunciar uma versão móvel completa.

O Dev designer apontou contato dos painéis com a faixa de ataque em duas cenas. Os avisos foram estreitados, e a dica de itens foi separada deles. O teste protege essa faixa na fixture declarada; perigos em outras posições do mundo ainda podem passar sob áreas do HUD. Em paisagem estreita, o aviso visível tem atéduas linhas, enquanto o texto completo permanece na região acessível.

## Números de dano

Acertos do mesmo alvo, fonte e condição crítica podem compartilhar um número quando ocorrem em uma janela de160ms. O total continua sendo a soma dos valores dos acertos; isso é apresentação, não novo dano. Outros alvos não são misturados, mesmo que estejam no mesmo ponto. Escudo e corpo, crítico e acerto comum, e canais secundários permanecem separados. O desenho mostra atétrês rótulos recentes por alvo, com contraste escuro; crítico usa CRIT e dourado, queimadura/raio/corrosão/suportes mantêm cores distintas. Valores maiores são abreviados apenas na tela.

Cada acerto continua produzindo suas faíscas e consumindo os mesmos valores aleatórios. O agrupamento usa um WeakMap cosmético, sem adicionar identificadores ao inimigo ou ao jogador. Um grupo retirado pelo limite de feedback não pode engolir um novo acerto. O renderer não altera HP, munição, efeitos, relógio nem a própria fila.

## Evidência e limites

- `tests/combat-feedback.cjs`: soma por fonte, crítico/escudo, alvos sobrepostos, janela, expulsão pelo limite, fila/deduplicação, desenho puro, pausa, expiração e reset.
- `tests/combat-feedback-equivalence.cjs`:32mundos,360steps por mundo e416checkpoints com gameplay completo, efeitos, faíscas, perfil, recompensas, baús e16próximos valores de RNG idênticos àBUILD54. Sófeedback e cosmética foram excluídos. A fixture literal permite repetir no ZIP semGit.
- `tests/combat-feedback-browser.cjs`: Chrome offline em1280×900,390×844,390×500,900×500,900×768 e paisagens844×390,740×360 e932×430, com resize e tutorial inicial. Verifica geometria do painel, HUD/jogador livres, atéduas mensagens, agrupamento, pausa/reset, ausência de transbordamento e de erros. A cena controlada de33acertos produziu10rótulos visíveis. O relatório inclui hashes do runtime, HTML, CSS e teste.

As capturas são fixtures artificiais de inspeção; não representam uma partida ganha nem medem FPS ou satisfação humana. A prova de equivalência protege o combate nos cenários cobertos e não pretende enumerar toda combinação de painel possível. Pareceres dos chats do projeto são registrados em coordenacao-chats.md e devem ser conferidos antes da publicação.

## Entrada nas telas

O chat tester burro reproduziu a Garagem abrindo com scrollY905/1681 nas paisagens, e a Configuração mantendo a rolagem. A causa era focar a ação principal situada no fim da tela. Agora o foco vai ao título com preventScroll e a janela volta ao topo. `tests/view-navigation-browser.cjs` verifica abrir/voltar em1280×720,844×390,740×360 e390×844, com save novo e sem conceder saldo ou equipamento. O mesmo chat revalidou a correção em paisagem. Os títulos são focáveis programaticamente, permitindo continuar a navegação de teclado a partir do início da tela.
