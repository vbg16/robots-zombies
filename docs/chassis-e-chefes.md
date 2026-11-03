# Chassis e chefes — BUILD48

## Chassis com identidade própria

BAST-0002, FORJ-0003, VOLT-0004, NANO-0005 e ENXA-0006 deixaram de compartilhar o mesmo desenho com filtros de cor. Cada um tem32quadros de caminhada (oito por direção) e retrato próprio. Somados ao PROT, os seis chassis têm192quadros direcionais. A altura visível máxima dos cinco novos é72px, com pivôs medidos por quadro e pés junto de y+28. O anel ciano unifica a leitura do jogador.

|Chassi|Hardware legível|
|---|---|
|BAST|Blindagem clara e ombreiras largas, reator ciano|
|FORJ|Cobre/laranja, duas chaminés assimétricas e fornalha tripla|
|VOLT|Armadura lavanda e torres de bobinas nos ombros|
|NANO|Oficina com mochila, ferramenta e sinal de reparo verde|
|ENXA|Baías de drones e antena amarela|

O gato piloto laranja permanece visível nas vistas frontal/laterais; a traseira mostra a mochila, sem rosto. Armas continuam desenhadas separadamente e os equipamentos ficam fixos da garagem ao fim da tentativa. Não mudaram vida, velocidade, armadura, preços, protocolos, dano, munição, RNG ou hitboxes.

## Origem, formato e fallback

A geometria SVG original do BAST foi estendida em ferramentas próprias para criar cinco referências funcionais com pernas articuladas e passos opostos. A revisão mostrou que esses vetores ainda eram simples para a direção de era32-bit. A skill imagegen gerou cinco atlas raster usando cada referência e o PROT original como guia de acabamento. Os PNGs foram copiados sem editar seus pixels; JSONs registram SHA-256, dimensões reais1774×887, retângulos arredondados221/222px, bounds e pivôs. Há pixels residuais de baixo alfa perto das bordas, sobretudo no ENXA; a revisão em72px e no cenário não mostrou moldura ou corte aparente. Isso não constitui aprovação artística final pelo criador.

Os retratos são viewports SVG autocontidos que embutem exatamente os bytes do PNG e exibem a primeira pose. Não dependem de links externos nem de fetch. Esse formato duplica parte dos dados dos PNGs nos retratos para garantir o funcionamento offline. Os vetores próprios ficam como fallback: falha de PNG carrega a caminhada SVG daquele chassi; falha das duas imagens mantém o renderer legado. Filtros antigos ficam só nesse último fallback.

Reprodução: node tools/generate-chassis-sprites.cjs cria as referências/fallbacks e chassis-vector-atlases.js. node tools/generate-chassis-manifest.cjs valida os hashes, cria os viewports e chassis-atlases.js. Nenhum desses geradores edita PNGs. Inspeção estrutural: python tools/inspect-sprite-sheet.py imagem.png --columns 8 --rows 4 --rounded-grid, apenas leitura.

## Chefes procedurais

Sucateiro e Bobina-Rainha ganharam pernas/braços opostos pela distância percorrida, vistas de costas/laterais, preparação e recuo após o ataque real. O Sucateiro prepara os tubos de morteiro; a Bobina carrega bobinas/arcos. Queimadura, frio, atordoamento e flash de dano continuam identificáveis. O desenho é uma extensão original do renderer procedural; o acabamento ainda é simplificado em relação aos novos sprites e pode receber revisão artística posterior.

boss-visuals.js só altera o campo visualAttack; locomoção vem dos campos visualPhase/visualWalking já existentes. A simulação continua dona da agenda, aviso, projéteis, pools, dano e distância de acompanhamento. Desenhar não consome RNG nem avança estado. Pausa congela os campos/relógio. Erro ou ausência do helper mantém o desenho procedural anterior; Brutamontes continua com o atlas de pesado da BUILD47.

## Verificação

- chassis-animation.cjs:cinco identidades, SHA dos PNGs, retratos com os mesmos bytes,160frames, geometria, dez ciclos por direção, idle e pivôs.
- chassis-animation-browser.cjs:Chrome HTTP/file, cinco equipamentos/retratos, quatro direções, quadros em movimento, idle, pausa/reset, fallback raster→vetor e dupla falha→legado.
- boss-visuals.cjs e boss-visuals-browser.cjs:passada, preparação, transição real de ataque, recuo, pausa, estados, HUD e fallback.
- enemy-animation-physics.cjs passou a habilitar também o helper de chefe:seis mundos semeados equivalentes em toda física, efeitos e RNG com os visuais desligados; três chefes, policiais, estados e pausa.
- Suíte de combate com25min controlados, consultas espaciais, áudio integrado,24reforjas, drones, sensores, corrosão e props passaram. PROT e navegador de reforjas/garagem também foram revalidados. As partidas/níveis injetados são fixtures de integração, não sobrevivência natural nem aprovação das dez builds.

Capturas revisadas: outputs/chassis-animation/{chassi}-contact.png, {chassi}-http.png e -file.png; outputs/boss-visuals/contact.png e capturas dos dois encontros. Relatórios locais em ambas as pastas.

## Regra de entrega

O rótulo no menu ainda mostrava BUILD44 apesar das atualizações anteriores. Foi corrigido para48; tools/check-release.cjs agora exige igualdade entre version.json, menu, README e contrato, verifica recursos locais do HTML e impede que o canal de desenvolvimento implique aprovação pública. Rodar antes de cada entrega. GitHub+mini relatório por e-mail seguem o pedido do criador registrado em workflow.md.

## Limites vigentes

Esta etapa conclui a caminhada direcional dos seis chassis e anima os três chefes, com os dois especialistas ainda em arte procedural simplificada. Não resolve o custo de cadeias Plasma extremas, não aprova equilíbrio das dez receitas, não implementa suportes adicionais nem múltiplos slots e não promove codex/publico. Esses trabalhos permanecem no objetivo geral.
