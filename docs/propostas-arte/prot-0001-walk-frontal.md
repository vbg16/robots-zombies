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
