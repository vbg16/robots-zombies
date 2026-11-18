# BUILD68 — verificação intermediária

Esta versão implementa a decisão mais recente do criador: incursão de vinte minutos regressivos, respiro após aprimoramentos, bandos locais e **somente um novo chefe agora**, Prisma de Cerco aos 12 minutos decorridos (08:00 no HUD). O segundo novo chefe aos 15 minutos está adiado. As regras completas estão em [Incursão de vinte minutos](incursao-vinte-minutos.md).

## Regressão e apresentação

O manifesto efetivo reúne **61 comandos de verificação aprovados**, incluindo os 21 grupos do motor da incursão, testes das seis famílias de aprimoramentos, regras de horda, isolamento de animação/RNG, áudio, persistência, armas, controles e documentação. Chrome foi verificado em 1280×900, 844×390 e 740×360 com fixtures de relógio controlado, não como medição de desempenho ou aparelho físico. O desenho do Prisma foi inspecionado em doze poses; preparação, disparo e recuperação têm estados distintos.

O [resumo de QA](build68-qa-summary.json) identifica o arquivo de evidências e seu SHA-256. O arquivo preserva fontes, logs, capturas e resultados negativos, com comprimento e hash de cada registro verificados após descompressão. O número de checks não equivale a executar todos os casos de aceite da meta final.

O manifesto inicial de 45 checks teve uma falha na comparação de mundo completo contra BUILD57; o comparador geral contra BUILD54 também divergiu. Essas referências históricas não incluem as mudanças de física solicitadas agora. Os testes originais permanecem intactos. O substituto de partículas compara doze mundos com a mesma física atual, alterando somente a otimização versus seu fallback de array; estado completo e próximos sorteios coincidem.

A rodada extra teve 10/11 aprovados e detectou um defeito real no lançador do bot: a checagem ainda exigia driver13. A correção reconhece driver14 e o terminal `won`, registra `run-won` e exige vitória, 1.200s, três chefes, quatro melhorias centrais, valores finitos e ausência de erros para declarar viabilidade. Segurança de baús, quatro perfis curtos e a fixture de término foram retestados. Pedir 21 minutos nessa fixture termina em 1.200s, sem ciclo de ofertas; não conta como sobrevivência natural.

## Dez receitas em progressão natural

Uma tentativa por receita canônica, semente previamente fixada **6801301**, dt 0,05s, piloto smart/driver14, decisões a 5Hz, reforjas habilitadas e baús safe. Equipamento inicial desbloqueado somente para montar as receitas; sem imunidade, atributos concedidos, ofertas forçadas, abates automáticos de chefes ou remoção de inimigos vivos.

| Resultado | Quantidade |
|---|---:|
| Vitória em 00:00, pelo menos três chefes e núcleo completo | 9/10 |
| Quatro aprimoramentos centrais adquiridos | 10/10 |
| Valores finitos | 10/10 |
| Prisma derrotado | 9/10 |
| Erros de execução ou eventos de telemetria descartados | 0 |

**Rede de Plasma morreu aos 852,10s** (14:12 decorridos), com três chefes derrotados e núcleo completo; Prisma ainda estava vivo. Houve 345 de dano agregado por perigos de chefe, 12 por contato e 252 de cura. O agregador não discrimina todo esse dano por identidade do chefe; não atribuir automaticamente os 345 ao Prisma. O piloto atual não antecipa a geometria dos novos lasers por eixo/coordenada. A morte permanece no relatório e não foi reexecutada para buscar um resultado melhor.

O [resumo das dez partidas](build68-intermediate-summary.json) contém todos os resultados, fontes e limitações. O arquivo [natural arquivado](data/build68-natural.json.gz) preserva dados brutos, protocolo e doze fontes congeladas: 14 registros com roundtrip verificado. A correção posterior do lançador de navegador não altera a física, a política ou o piloto dessa matriz congelada.

## Limites de aprovação

É uma avaliação de desenvolvimento, não o gate final de 30 tentativas. As sementes 20261130, 20261201 e 20261202 continuam reservadas; não há aprovação de 27/30, estabilidade de 60 minutos, FPS real ou celular físico. A branch pública permanece separada e depende da aprovação prevista no contrato de canais. O projeto continua **EM DESENVOLVIMENTO**.
