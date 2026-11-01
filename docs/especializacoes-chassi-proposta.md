# Especializações temporárias de chassi — proposta para implementação

Oferta no nível 10, uma entre três próprias do chassi: decisão direta do criador. Valores abaixo propostos pelo Dev designer; experimentais, ainda não implementados. Não alteram arma, slots ou progresso permanente. Efeitos desaparecem no retry. Custo inicial proposto: oportunidade de escolher apenas uma, sem penalidade adicional.

| Chassi | Opção | Efeito proposto |
|---|---|---|
| PROT-0001 | Isca de Cauda | Ao receber dano, deixa eco por 1,5 s que atrai perseguidores comuns; recarga 24 s. Chefes e áreas ignoram o eco. |
| PROT-0001 | Marca do Predador | Primeiro acerto marca um alvo por 2,5 s; +25% de dano do robô ao alvo marcado. Acertar outro transfere a marca. |
| PROT-0001 | Alerta de Nove Vidas | Ao cruzar abaixo de 20% de HP, empurra comuns em 90 px no raio de 100 px e interrompe por 0,5 s; recarga 30 s. Sem cura/invulnerabilidade. |
| BAST-0002 | Aterramento de Campo | Dano de explosões/zonas telegráficas de chefe reduzido em 30%; contato e tiros não recebem redução. |
| BAST-0002 | Freio Eletromagnético | Projéteis hostis dentro de 90 px ficam 25% mais lentos; fora do raio voltam à velocidade original. |
| BAST-0002 | Protocolo de Leitura | Avisos iniciados com chefe a até 180 px duram 20% mais; não altera a execução da investida nem o relógio do jogo. |

Cuidados para implementação: Marca/Alerta têm proximidade com skills existentes e precisam de revisão de combinação. Isca exige classificar perseguidores e não desviar projéteis já emitidos. Freio deve aplicar multiplicador por frame sem acumular redução na velocidade-base. Leitura deve decidir duração uma vez ao entrar na fase de aviso, sem estender timer a cada frame. Aterramento exige fonte de dano explícita. A travessia de HP baixo e a prioridade entre eventos simultâneos devem ser testadas.

Proteções previstas: oferta apenas no nível 10, três opções do chassi fixo, seleção única e obsoleta rejeitada, pausa de combate durante escolha, teclado 1–3, ausência de renovação Q, reset e perfil intacto, diagnóstico/manual refletindo escolha e cada efeito com teste específico. Evolução de arma continua independente e pendente.
