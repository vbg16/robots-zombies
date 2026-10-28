# Integração das animações do PROT-0001

Estado: infraestrutura preparada; assets finais pendentes. Referências oficiais: [paleta aprovada](arte-paleta-prot-0001.md) e [conceito aprovado](propostas-arte/prot-0001-conceito-01.md).

## Entrega técnica esperada do Designer

- PNG com transparência real, frames isolados em células de dimensões constantes e sem interpolação.
- Informar largura/altura da célula, quantidade e ordem dos frames, margens/espaçamentos se houver.
- Identificar estado e direção de cada sequência: idle/walk e n, ne, e, se, s, sw, w, nw.
- Informar duração em milissegundos de cada frame e pivô comum, medido a partir do canto superior esquerdo da célula. Manter alinhamento dos pés e evitar tremores.
- Incluir frames individuais para inspeção, além da folha. Confirmar escala real em jogo antes da integração.
- Run é estudo opcional, sem habilidade de corrida aprovada.
- Resolução, escala e tempos finais não são impostos por este documento; devem acompanhar os assets validados.

## Infraestrutura

`sprite-animation.js` exporta `SpriteAnimation` no navegador e em CommonJS para testes. Não está incluído no HTML e não carrega arquivos automaticamente. O desenho procedural atual continua ativo.

Após receber os arquivos finais, carregar a imagem com `SpriteAnimation.load(src, clips, options)`. O mapa `clips` usa chaves como `idle.s` e `walk.ne`; cada sequência é uma lista de objetos `{x,y,w,h,ms}` com recortes em pixels. As opções `{scale,pivotX,pivotY}` definem apenas renderização, nunca colisão ou atributos.

- `play(state,direction)`: troca sequência e reinicia o tempo; retorna false se ausente, permitindo ao integrador usar o desenho provisório.
- `update(dt)`: avança em segundos somente quando a simulação estiver ativa. Pausa não avança animação.
- `draw(ctx,x,y)`: desenha com escala sem suavização, preservando o contexto e a câmera.
- Arquivo ausente, imagem inválida ou recorte incorreto rejeita o carregamento; manter o desenho provisório nesse caso.
- Não usar desenhos conceituais ou estudos como folhas finais. Não espelhar direções automaticamente sem validar a assimetria do robô.
- Animação não controla velocidade, dano, colisões, câmera nem progressão.

## Validação antes de ativar

Conferir transparência, paleta, pivô, recortes, ciclos e oito direções em escala real no navegador. Preservar câmera suave, movimento e mecânicas. Comparar idle/walk e transições; executar `node tests/sprite-animation.cjs` e `node tests/combat.cjs`. Testes atuais usam imagens/contexto simulados; não comprovam a qualidade dos assets finais.
