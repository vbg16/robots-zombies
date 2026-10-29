# SCREWVIVORS — PROMPT TÉCNICO PARA SPRITES DOS INIMIGOS

## Tarefa do Designer

Criar o primeiro inimigo comum original: **zumbi urbano ex-mecânico**, perseguidor humanoide. É o zumbi de 30 PV já existente. Produzir arte, sem mudar vida, velocidade, colisões, inteligência, dano, surgimento ou câmera.

Consultar antes:
- docs/arte-paleta-prot-0001.md
- docs/game-design.md
- docs/integracao-sprites.md
- docs/validacao-walk.md

## Direção visual

Pixel art 2D para visão superior oblíqua, compatível com o PROT-0001 e a linguagem de acabamento das referências de 20 Minutes Till Dawn, sem reutilizar sprites ou copiar inimigos existentes. Cidade destruída e universo do Dr. Biruta. Silhueta humana curvada, macacão de trabalho rasgado, botas e braços assimétricos; caminhar pesado e irregular. Pouco sangue. Não desenhar como robô nem usar núcleo/visor azul que o confunda com o jogador.

Paleta limitada: sombras azul-noturno #1B2A3A, pele dessaturada verde/cinza, tecido terroso e ferrugem pontual #C95F43; pequeno destaque âmbar nos olhos. Documentar os hex extras escolhidos para pele/tecido/âmbar. Azul energia #3CC7F4 deve permanecer dominante no jogador, não no inimigo. Sem gradientes, blur, antialiasing ou iluminação que mude arbitrariamente entre frames.

## Primeira entrega: apenas Walk frontal

Não gerar outra folha de oito direções. Primeiro concluir **uma direção com oito quadros de passada**, todos com o mesmo ângulo frontal e identidade. Depois de validar, expandir para as outras sete direções.

Grade proposta para ensaio: **48 × 64 px por frame**; pivô compartilhado **(24,60)**. Esses valores são uma proposta de produção a validar em jogo, não alteração de hitbox. Trabalhar na grade nativa; ampliações devem usar nearest-neighbor. Não reduzir uma pintura detalhada arbitrariamente e chamá-la de pixel art final.

00: contato do pé esquerdo; 01: apoio e peso esquerdo; 02: avanço direito; 03: passagem central; 04: contato direito; 05: apoio e peso direito; 06: avanço esquerdo; 07: passagem central para retornar a 00. Braços alternam em oposição. Cabeça e torso mantêm escala; não esticar o corpo para simular caminhada. Usar queda discreta do torso e apoio dos pés, não alteração do zoom.

## Requisitos de arquivo

- Oito PNGs RGBA individuais: 00.png a 07.png.
- Fundo transparente real; alpha somente 0/255 nesta entrega.
- Todos 48 × 64, com margem transparente mínima de 1 px em todos os lados.
- Mesma origem e pivô; não recentralizar cada silhueta individualmente.
- Não cortar mão, cabeça, botas ou roupa. Não tocar quadro vizinho.
- 100 ms por frame, 800 ms por ciclo como ensaio.
- Se precisar alterar resolução/pivô, documentar a proposta e atualizar o manifesto coerentemente antes de testar; não declarar escala final aprovada.

## Manifesto

Entregar manifest.json com width:48, height:64, pivot:{x:24,y:60} e frames:
[{"file":"00.png","ms":100},{"file":"01.png","ms":100},{"file":"02.png","ms":100},{"file":"03.png","ms":100},{"file":"04.png","ms":100},{"file":"05.png","ms":100},{"file":"06.png","ms":100},{"file":"07.png","ms":100}].

Os PNGs/manifesto devem ficar em uma pasta própria; prévias, GIFs e relatórios ficam fora dela para não violar a contagem dos oito PNGs do validador.

## Validar e entregar

Executar tools/validate_walk.py nessa pasta e usar tools/walk-preview.html. Entregar ZIP com os oito PNGs e manifesto, resultado técnico, prancha de inspeção e GIF/WEBM de dez ciclos. Verificar loop 07→00, pés sem deslizar nos apoios, proporções constantes e legibilidade sobre fundos claro/escuro na escala pequena. Em jogo o desenho será ajustado visualmente sem mudar a colisão existente.

Um resultado automático sem erros não aprova a animação. Não afirmar testes não executados. Se a geração não produzir oito quadros consistentes, identificar o material como estudo e explicar a correção manual necessária. Não fabricar um relatório de aprovação.

## Fora desta entrega

Chefe Brutamontes, ex-policial e outros inimigos terão pedidos próprios. Não introduzir ataques, armas, variantes ou atributos através da arte. Integração cabe ao Dev após aceitação técnica e visual.
