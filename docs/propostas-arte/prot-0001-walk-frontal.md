# PROT-0001 — Walk frontal: especificação de ciclo (proposta)

Estado: **EM PRODUÇÃO / NÃO VALIDADO**. Atualizado em 28/10/2026.

## Distinção importante

A folha anterior com 24 imagens representa 8 orientações em 3 estados (idle/walk/run). **Não** é um ciclo de animação por direção. A geração visual seguinte ainda mostra orientações e poses diferentes; não deve ser considerada spritesheet técnica de caminhada.

## Primeiro ciclo a produzir: Walk frontal

Proposta de 8 quadros consecutivos, na mesma orientação frontal, mantendo torso, cabeça, gato, antena, ombreiras e proporções consistentes. Braços e pernas alternam, cada pé sustenta o peso durante metade do ciclo; alternar tornozelos/joelhos e deslocar levemente torso para baixo no contato.

| Frame | Movimento planejado |
|---|---|
| 0 | pé esquerdo à frente, direito atrás; contato |
| 1 | transferência de peso no esquerdo; torso baixa |
| 2 | pé direito avança enquanto esquerdo sustenta |
| 3 | passagem central, torso sobe |
| 4 | pé direito à frente, esquerdo atrás; contato |
| 5 | transferência de peso no direito; torso baixa |
| 6 | pé esquerdo avança enquanto direito sustenta |
| 7 | passagem central, torso sobe; volta ao frame 0 |

**Tempo proposto para teste:** 100 ms por frame; 800 ms por ciclo, looping. Não é atributo de velocidade do personagem e poderá ser alterado após avaliação. Movimento original no mundo não muda. 

**Requisitos antes de integrar:** PNGs com transparência verdadeira, mesma caixa por quadro, pivô de pés coincidente, perspectiva frontal idêntica, iluminação/paleta consistentes e inspeção de continuidade em reprodução. Testar na escala real do navegador sem antialiasing. **Não usar uma prancha ilustrativa composta como spritesheet pronta.**

Run permanece estudo opcional, sem implementação aprovada. Não alterar mecânicas, atributos ou câmera.

## Protocolo objetivo de aceitação v1.0 — proposto (28/10/2026)

Este protocolo é **proposto para validação**, não uma nova decisão de mecânica ou resolução final. Para aprovar o Walk frontal, todos os critérios obrigatórios devem passar.

### A. Arquivos (verificação automática)

- [ ] Exatamente 8 quadros de caminhada em ordem (00 a 07); nenhuma pose direcional diferente entre eles.
- [ ] PNG RGBA, transparência verdadeira fora do personagem; nenhum fundo de imagem ou tabuleiro xadrez incorporado.
- [ ] Todos os quadros com idênticas dimensões (W×H) e com o mesmo pivô de referência; validar dimensões e alpha por script.
- [ ] Sem cortes em braços, pernas, antena, gato ou pés; margem transparente mínima de 1 pixel nativo ao redor da silhueta em todos os quadros.
- [ ] Contornos pixel-perfect, sem antialiasing nem bordas de alpha intermediário (pixel de borda com alpha 0 ou 255); efeitos de transparência só com exceção documentada.
- [ ] Mesma orientação de câmera e iluminação nos oito quadros; cores fundamentadas na paleta de `docs/arte-paleta-prot-0001.md`, com exceções documentadas.
- [ ] Arquivos nomeados sequencialmente e manifesto com tamanho, pivô, ordem dos quadros e duração em milissegundos.

### B. Movimento (revisão quadro a quadro)

- [ ] 00 contato esquerdo; 01 apoio/peso esquerdo; 02 avanço direito; 03 passagem central; 04 contato direito; 05 apoio/peso direito; 06 avanço esquerdo; 07 passagem central.
- [ ] Na metade de ciclo há inversão perceptível das pernas de apoio e avanço; braços alternam de modo oposto às pernas.
- [ ] Em cada quadro, a identificação do gato, visor, antena, ombreiras, núcleo e proporções permanece consistente; mudanças de iluminação são intencionais, não erros.
- [ ] Nos trechos de apoio, o pé plantado não se desloca horizontalmente mais de 1 pixel **nativo** em relação ao pivô/cenário; esse valor só vale após fixar a resolução nativa.
- [ ] Oscilação vertical do torso até 3 pixels nativos em relação à posição de repouso, após fixar resolução; não aplicar deslocamento artificial da câmera.
- [ ] Sem saltos anatômicos/mecânicos ou aparecimento/desaparecimento arbitrário de peças; fechamento 07→00 tão suave quanto as outras transições.

### C. Reprodução e jogo (teste observável)

- [ ] Reprodução inicial a 100 ms por quadro (8 quadros, 800 ms por ciclo), em loop contínuo, durante 10 ciclos, sem quadros fora de ordem ou interrupções.
- [ ] Teste com nearest-neighbor na **escala real de jogo** (não a ampliação da prancha); a silhueta, o gato e o sentido da passada são identificáveis.
- [ ] Teste sobre ao menos um trecho escuro e um claro de cenário do jogo: corpo não se perde no fundo, e realces azuis permanecem distinguíveis.
- [ ] Entrada e saída do estado Walk não apresentam salto de posição do personagem; não mudar velocidade, dano, colisão, mira, câmera nem comportamento dos inimigos.
- [ ] Registro de evidência: os oito PNGs ou atlas com metadados, visualização ampliada sem suavização, GIF/WEBM de 10 ciclos e captura do teste dentro do jogo.

### D. Resultado

- **Aprovado tecnicamente:** todos os critérios A e medições relevantes de B passam.
- **Aprovado no jogo:** todos os itens C passam e o criador valida a aparência em movimento.
- **Reprovado:** qualquer item obrigatório falha; corrigir quadros e repetir validação.
- **Não avaliado:** faltam frames/arquivos reais, metadados ou teste no navegador.

**Atenção:** a prancha ilustrativa e as 24 poses direcionais anteriores não satisfazem estes requisitos. Resolução nativa, escala definitiva e números de ajuste visual permanecem sujeitos a teste; Run continua opcional e sem mudança de mecânica.
