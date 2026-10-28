# Validação técnica do Walk frontal

Estado: ferramentas preparadas; animação definitiva NÃO AVALIADA. Base: [protocolo v1.0](propostas-arte/prot-0001-walk-frontal.md).

## Entrega

Uma pasta com exatamente 00.png até 07.png e manifest.json. O manifesto contém:
- width e height: dimensões nativas reais comuns a todos os PNGs.
- pivot: objeto com x e y inteiros dentro da célula, compartilhado pelos quadros.
- frames: oito objetos, em ordem, com file de 00.png a 07.png e ms igual a 100.

Não converter a prancha de 24 poses em um ciclo. Não inventar dimensões finais. O mesmo pivô declarado não comprova alinhamento real dos pés.

## Validador

Requer Python 3 e Pillow (`python -m pip install Pillow` se necessário).
Execute `python tools/validate_walk.py CAMINHO_DA_PASTA`.
O JSON de saída pode ser guardado com redirecionamento `> walk-validation.json`.

Verifica nomes/contagem, leitura e integridade PNG, RGBA nativo, dimensões, existência de pixels transparentes, margem mínima de um pixel, alpha binário, ordem, duração e pivô declarado. Inclui SHA-256 dos arquivos. Erro retorna código 1; passar retorna 0 com status CHECKS_PASSED_REVIEW_PENDING. Alpha intermediário é falha por padrão e requer revisão explícita de exceção; nenhuma exceção automática.

Fundo pintado, tabuleiro incorporado, direção, paleta, anatomia, alinhamento físico e transferência de peso não são comprovados por esses testes.

## Prévia no navegador

Abra `tools/walk-preview.html` por duplo clique. Selecione juntos manifest.json e os oito PNGs. Arquivos ficam locais. Clique em Testar 10 ciclos: 100 ms por quadro, 800 ms/ciclo, parada após dez ciclos. Use pausa ou avanço/retrocesso para inspeção.

A prévia mostra escala ajustável e ampliação 3× com nearest-neighbor, pivô e fundos claro/escuro. A altura inicial de 72 px é parâmetro de ensaio e precisa ser ajustada à escala real; não aprova resolução ou escala de produção. Trocar de aba ou uma interrupção longa pausa o teste; repetir para evidência contínua. Registro JSON documenta a sessão, sem atribuir aprovação visual.

A prévia ainda requer teste real em navegador. Não grava GIF/WEBM e não representa o cenário do jogo; gravação de dez ciclos, captura dentro do jogo, medição dos pés e revisão pelo criador continuam pendentes.

## Aprovação

Não marcar Walk concluído apenas com resultado automático. Todos os itens A/B/C do protocolo exigem validação, inclusive teste na escala real e evidências dentro do jogo. Nenhuma alteração em game.js, câmera ou mecânicas foi necessária.

Testes das ferramentas: `python tests/validate_walk_test.py`, `node tests/sprite-animation.cjs` e `node tests/combat.cjs`.
