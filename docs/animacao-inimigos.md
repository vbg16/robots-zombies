# Caminhada dos inimigos — BUILD47

Três atlas originais substituem a pose estática de mecânico, catador e segurança pesado. São96quadros: oito fases para baixo, direita, cima e esquerda em cada personagem. O pesado também representa Brutamontes e o perseguidor grande, mantendo seus tamanhos, hitboxes e comportamentos distintos. Sucateiro/Bobina continuam procedurais e ainda precisam de animação própria; os demais chassis também permanecem pendentes de acabamento.

## Origem e integridade

As referências são os três PNGs originais do repositório. A skill imagegen produziu as novas caminhadas, copiadas sem alteração dos pixels para arquivos versionados. O pesado v2 foi rejeitado por fundo branco opaco; a edição v3 removeu o fundo com a mesma ferramenta. A versão rejeitada fica somente em outputs, fora do ZIP. Nenhuma arte foi retirada de20MTD. JSONs registram SHA-256, dimensões reais1774×887, retângulos explícitos, bounds visíveis e pivôs. A grade tem células221/222px: não assumir uma divisão inteira fixa. A inspeção Pillow apenas leu pixels e gerou metadados, sem editar PNGs.

O manifesto zombie-atlases.js é script clássico gerado dos JSONs por node tools/generate-zombie-manifest.cjs; não depende de fetch e funciona em file://. Existem pixels semitransparentes residuais perto das bordas. A contact sheet em escala58/95px e o cenário foram examinados no Chrome: poses/direções legíveis, pernas alternadas e ausência de retângulo ou corte aparente. Isso é revisão técnica/visual desta etapa, não aprovação pública pelo criador.

## Movimento e composição

ScrewEnemyAnimation.advance recebe a posição antes e depois da locomoção real, incluindo a investida do policial e a movimentação de chefe. Cada64px percorridos completam um ciclo de oito quadros. Sem deslocamento, o inimigo usa idle da direção anterior e conserva sua fase; atordoamento e pausa interrompem a passada. Knockback por projétil não é confundido com caminhada. Desenho não avança relógio, não consulta RNG e não modifica HP, raio, velocidade, trajetórias ou lista de vivos.

O renderer compõe uma única vez corpo/sombra/flash por combinação de variante, tamanho e dano. São seis classes cosméticas de altura:51/55/58/62/65 e95px; o raio físico contínuo continua intacto. O cache completo tem no máximo36atlas/1152células,37,6MiB de superfícies RGBA, além das imagens originais e das cópias internas do navegador. Não há crescimento com tempo ou número de inimigos. Frames de um mesmo atlas compartilham ImageBitmap imutável. Compor em canvas de CPU e congelar evita a sincronização que tornava as propostas anteriores lentas.

A API OffscreenCanvas faz a transferência síncrona; o fallback HTMLCanvas usa createImageBitmap. Navegadores sem ambas usam o renderer legado. Erro em um atlas também cai no desenho legado daquele personagem. Estados, distintivos e armas de policiais/lacaios continuam sobre o corpo; o flash branco é composto sobre o alfa do sprite, nunca diretamente sobre o cenário.

## Verificação

- enemy-animation.cjs:96frames, direção/fase por deslocamento, geometria/SHA, cache limitado, reutilização, textura imutável e flash isolado.
- enemy-animation-physics.cjs:seis mundos semeados iguais com animação ligada/desligada em todo estado físico, efeitos e RNG; inclui os três chefes, escudos, cargas, estados e pausa.
- enemy-animation-browser.cjs:Chrome HTTP/file, poses andando/paradas, quatro direções, pausa/atordoamento, marcha do Brutamontes, overlays, atlas ausente, HTMLCanvas+ImageBitmap e navegador sem API de bitmap.
- Regressões de combate25min controladas, consultas espaciais, áudio, drones,24reforjas, corrosão, sensores, props de armas e helper de sprites aprovadas. A simulação controlada não demonstra sobrevivência natural de uma build.

Capturas e relatório locais: outputs/enemy-animation/contact.png, arena-http.png, arena-file.png e report.json. Uma onda fria de15corpos exigiu10,6ms em HTTP e21,9ms em file na medição única; o desenho já aquecido ficou0,14/0,32ms médio. Esses valores medem chamadas Canvas, não apresentação da GPU nem FPS.

## Desempenho e limites

O relatório versionado build47-render-bench.json contém27pares baseline/candidato, hashes e as tentativas rejeitadas. A baseline usa game/balance do commit47c4486; os demais recursos do servidor são os mesmos, e o game antigo não utiliza os novos atlas. O hash de balance difere só por CRLF/LF, verificado contra ambos os arquivos e registrado no relatório. O teste usa o mesmo mundo parado, pacote idle, semente/populações, viewport1280×720 e canvas640×360; não mede balanceamento nem efeitos massivos. Rótulos de QA no manifesto e uma guarda de API foram atualizados depois da medição, sem mudar o caminho de renderização deste Chrome.

| População próxima | Desenho BUILD46 | Desenho novo | Tick+desenho anterior | Tick+desenho novo |
|---:|---:|---:|---:|---:|
|500|3,16ms|1,59ms|3,00ms|2,40ms|
|2000|33,50ms|14,29ms|34,44ms|16,11ms|
|5000|81,54ms|36,62ms|92,54ms|40,07ms|

Medições separadas não somam necessariamente. O custo de tick dos5000remotos subiu1,83→2,76ms nesta comparação; animar cada corpo adiciona trabalho e há variação do sistema. A primeira proposta, com canvas por frame, chegou a1401ms de desenho médio para5000próximos e foi rejeitada. A segunda, com atlas mutável, também teve regressões severas repetidas e foi interrompida; não há matriz completa dessa hipótese. As evidências negativas foram preservadas.

Mesmo o candidato adotado não torna5000corpos próximos fluidos a60fps, e a cadeia Plasma extrema continua com custo alto de combate. Não apagar inimigos, reduzir silenciosamente efeitos de dano ou declarar o problema inteiro resolvido com base nesta matriz de desenho.
