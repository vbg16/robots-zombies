# Árvores de melhorias e munição — protótipo experimental

Implementação de 30/10/2026, por solicitação do criador. Substitui o sorteio de melhorias isoladas/repetíveis e os bônus percentuais anteriores. Os valores ainda precisam de teste humano; não representam balanceamento aprovado.

## Escolhas por tentativa

São nove raízes e três evoluções por raiz: 36 escolhas únicas. Inicialmente apenas as raízes podem ser sorteadas. Adquirir uma raiz habilita suas três evoluções. As evoluções são combináveis entre si, não exclusivas; nenhuma escolha adquirida volta ao sorteio. Cada nível oferece até três opções elegíveis e permite pular. O chefe usa o mesmo sistema.

| Raiz | Evolução 1 | Evolução 2 | Evolução 3 |
| --- | --- | --- | --- |
| Alto impacto | Caça-titãs | Finalizador | Quinto impacto |
| Overdrive | Câmara dupla | Munição ricochete | Propulsão balística |
| Blindagem reforçada | Chassi titânico | Bateria de sucata | Oficina estacionária |
| Campo magnético | Processador de experiência | Manutenção na recarga | Depósito ampliado |
| Munição incendiária | Choque térmico | Fornalha | Combustão concentrada |
| Núcleo criogênico | Perfuração | Impacto cinético | Recarga glacial |
| Descarga | Condutividade | Curto-circuito | Escudo capacitivo |
| Propulsor auxiliar | Pernas hidráulicas | Isolamento de impacto | Reserva de emergência |
| Carga explosiva | Onda expandida | Pulso de retaliação | Sobrecarga reativa |

Os cartões mostram benefício, custo e parentesco. Todos os efeitos e custos somem no reinício. Armas e chassis continuam escolhidos na garagem. Ricochete não é oferecido ao disco de retorno.

## Multiplicadores e condições

Os multiplicadores atuam sobre o valor atual e se combinam: dano ×2 e depois dano pela metade retornam ao dano inicial. Não há repetição do mesmo módulo. Alto impacto dobra dano e intervalo entre tiros; Overdrive triplica cadência e divide o dano pela metade. O dano de cada projétil é capturado ao disparar.

Chassi titânico triplica vida máxima e atual, divide movimento pela metade e dobra o tempo de recarga. Blindagem, requisito da árvore, já reduz movimento por um fator de 1,25. Assim, PROT com Blindagem + Titânico tem 300 de vida, velocidade 76 e recarga ×2. Custos de diferentes árvores também se acumulam.

- Bateria de sucata: a cada 20 mortes de zumbis após adquirir o módulo, recupera 20 de vida, respeitando o máximo. Chefes não contam. O contador consome o marco mesmo com vida cheia; não guarda curas.
- Depósito ampliado: carregador ×3, recarga ×3, uma munição a cada dez mortes após aquisição, limitada à capacidade. A aquisição não abastece o carregador.
- Oficina estacionária: após três segundos sem movimento, cura 2 de vida por segundo; andar ou usar propulsor reinicia a espera. Dano direto pela metade.
- Manutenção na recarga: cura 5 após completar uma recarga válida. Não permite recarregar o carregador cheio. Recarga ×2.
- Quinto impacto: cada quinto pulso de disparo causa dano ×3 em todos os seus projéteis; capacidade pela metade, arredondada para baixo e limitada a pelo menos uma munição.
- Finalizador: dano ×3 se o alvo estiver com até um terço da vida máxima antes do golpe.
- Choque térmico: queimadura ×3 apenas enquanto o alvo está resfriado. Não concede resfriamento sozinho.
- Recarga glacial: emite resfriamento de quatro segundos em 140 px após completar a recarga.

## Reações a dano

Reserva de emergência, Pulso de retaliação e Sobrecarga reativa só disparam após dano real não letal, quando seus respectivos temporizadores estiverem prontos. Golpes absorvidos por escudo ou ignorados por invulnerabilidade não contam.

Cada efeito começa pronto e recarrega em **120 segundos de combate**. Um novo golpe durante a recarga não reinicia o temporizador. Pausa e seleção de melhorias congelam os temporizadores.

- Reserva: três segundos de proteção; custo: coleta pela metade. Não ressuscita.
- Retaliação: explosão de 140 px com três vezes o dano atual; custo: vida máxima e atual pela metade. Modificadores de explosão e dano contra chefe continuam aplicáveis.
- Sobrecarga: cadência triplicada por seis segundos, sem abastecer a arma; custo permanente na tentativa: recarga ×2.
- Escudo: absorve um golpe e recarrega em 120 segundos; custo: movimento pela metade.

## Munição por arma

Atualização: o tempo efetivo é `tempo de recarga completo × (capacidade − munição atual) / capacidade`. Carregador pela metade demora metade; faltando apenas uma bala demora um tempo de recarga completo dividido pela capacidade. A duração é calculada no início da recarga, já considerando os modificadores da montagem. O HUD mostra o tempo efetivo. A tabela abaixo representa um carregador totalmente vazio.


| Arma | Capacidade base | Recarga base |
| --- | ---: | ---: |
| Metralhadora | 24 | 1,4 s |
| Escopeta | 6 | 2,2 s |
| Fuzil de rajada | 30 | 1,8 s |
| Canhão de precisão | 3 | 3,8 s |
| Emissor laser | 60 | 1,6 s |
| Lança-chamas | 80 | 2,4 s |
| Lançador criogênico | 12 | 2,4 s |
| Lança-foguetes | 1 | 4,8 s |
| Lança-granadas | 4 | 3,6 s |
| Carabina Tesla | 8 | 3,0 s |
| Disco de retorno | 3 | 3,4 s |
| Arpão pneumático | 2 | 4,2 s |

O esforço das armas pesadas é representado por recarga maior e carregadores menores. Não há recurso de stamina. A reserva de munição é ilimitada neste protótipo; é necessário gerenciar o carregador e a janela de recarga.

**R** recarrega manualmente um carregador parcial. A recarga automática começa ao esvaziar. Não há disparos durante a recarga, mas movimento e mira continuam livres. Pausar congela a recarga; soltar o botão cancela os pulsos restantes da rajada. Cada pulso da rajada gasta uma munição; uma descarga de escopeta ou Câmara dupla gasta uma munição, independentemente dos projéteis. Aumentar a capacidade não cria munição imediata; reduzir a capacidade limita a munição restante.

O HUD mostra munição atual/máxima, duração e progresso de recarga, além dos temporizadores de reação. A garagem informa capacidade e tempo base.

## Validação

`node tests/combat.cjs` verifica controles, câmera, vida, horda, chefe, três minutos de simulação, árvores, exclusão de escolhas, pré-requisitos, multiplicadores, condições de ativação, recargas das doze armas, rajada parcial, pausa, morte e reinício. `node tests/sprite-animation.cjs` verifica o contrato do renderizador opcional.

Os testes usam DOM/canvas simulados em Node. Não substituem conferência visual no navegador, teste com jogadores ou aprovação dos novos valores. Os inimigos continuam com vida e velocidade base fixas; os módulos podem aplicar estados temporários.


## Chefes e arena — atualização de 30/10/2026

A moldura e sombra externas da arena foram removidas; a área segue com 90% da tela e mundo infinito. Foram adicionados dois chefes ao Brutamontes:

| Chefe | Horário previsto | Vida fixa | Ataques |
| --- | --- | ---: | --- |
| Brutamontes | 1:00 | 650 | Investida e disparos radiais, com avisos laranja |
| Sucateiro | 4:00 | 1300 | Marca três círculos verdes próximos da posição capturada do jogador; após 1,4 s, viram áreas danosas por 5 s. Cada contato causa 12 de dano, respeitando a proteção após golpe. |
| Bobina-Rainha | 7:00 | 1800 | Alterna onda elétrica expansiva (14 de dano) e rajada de cinco projéteis em cone (12 por impacto), com aviso roxo de 1,1 s. |

Há somente um chefe vivo por vez: encontros vencidos no relógio ficam pendentes até derrotar o anterior e concluir sua recompensa. Cada morte concede uma única recompensa temporária e limpa os perigos e tiros especiais. A vitória continua por sobrevivência aos dez minutos, mesmo sem derrotar os três; o resultado informa a quantidade derrotada. Não há crescimento de vida dos zumbis comuns.

Desenhos dos chefes são provisórios, feitos em canvas. Testes automatizados cobrem recarga parcial das doze armas, sequência e espera entre chefes, ausência de dano durante avisos, áreas, ondas, cones, pausa, limpeza e reinício. Avaliação visual no navegador e balanceamento com jogadores continuam pendentes.
