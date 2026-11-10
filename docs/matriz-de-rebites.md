# Matriz de Rebites — candidata BUILD61

**Estado: validada funcionalmente na candidata de desenvolvimento.** Este documento registra o contrato e evidências locais; não é aprovação de equilíbrio final, desempenho real, canal público ou conclusão da versão1.0. A [meta de conclusão](META-DE-CONCLUSAO.md) continua aberta.

## Função no jogo e aquisição

A Matriz é uma peça temporária de baú de chefe. O jogador instala uma estação física no chão, direciona seus próprios tiros à entrada, acumula energia e recebe uma salva própria do aparelho. O tiro alimentador é consumido: a entidade não é um contador de acertos em inimigos, um drone que escolhe alvos nem um campo que apenas amplia uma bala.

A peça usa ID `rivetMatrix`, é elegível para todos os chassis/armas, só pode ser escolhida uma vez na tentativa e não integra o painel editável de 82 módulos. Não é comprada como atributo permanente. Adquirir não repõe vida, munição, recarga ou projéteis e não instala uma estação sem comando. Recusa, callback antigo e morte seguem o token de oferta das demais peças.

## Implantação manual

Com a peça adquirida e a partida em `playing`, o jogador mira e usa E ou o botão correspondente. O ponto de mundo é `aim+camera`; a distância entre ele e o centro do robô deve pertencer à faixa inclusiva 48–180 px, com tolerância numérica de 1e-7 px nas bordas. Exigir direção de mira válida e aparelho ausente. Vetor zero, tentativa sem peça, pausa, tecla repetida e ponto fora da faixa não instalam, não corrigem a posição e não escolhem inimigos.

No toque, o direcional direito fornece uma direção manual unitária; o ponto retido é 180 px à frente. O terceiro dedo pode acionar a Matriz enquanto movimento/mira permanecem ativos. Não exigir que o jogador abandone um dos dois pads para perder a direção. A disposição do botão não pode obstruir recarga ou propulsor. O cenário decorativo não introduz obstáculos físicos novos para esse posicionamento.

Limite: uma estação por vez. Durante sua vida não se pode movê-la nem instalar outra. Quando ela expira, uma implantação posterior captura referências novas; não reutiliza a energia antiga.

## Referência e orçamento energético

Ao implantar, capturar `P=clamp(shotDamage(arma primária)×N,0.001,1e9)`, onde `N=min(400,max(1,floor(pellets×projectileMult)))`. O dano normal de `shotDamage` inclui as conversões normais já presentes na build, como o componente de vida do Titânico quando elegível. P não recebe o crítico de um disparo futuro, Culatra, Carga de Reparo ou vulnerabilidade de um alvo. Não recalcular P depois por troca de atributos ou reforja.

- Limiar de descarga: `T=2P`.
- Capacidade: `Emax=4P`.
- Uma salva consome T uma vez.
- Orçamento balístico total da salva: `1,10T=2,2P`.
- Cada um dos três rebites: `2,2P/3` antes dos multiplicadores centrais por alvo.

A energia deriva exclusivamente das balas efetivamente absorvidas. Cada emissão que gasta cartucho compartilha um token entre seus pellets. O teto desse token é a soma do dano dos projéteis realmente emitidos, multiplicada por 1,35 para permitir o Colimador atravessado antes da entrada. Se apenas um pellet coube no teto de 400, o token não recebe orçamento dos pellets que não nasceram.

Cada bala só entrega seu próprio dano no instante válido de contato, limitado ao saldo do token; o acréscimo na estação é limitado à capacidade. A bala é consumida mesmo quando a energia já está cheia: o excedente é descartado e não fica guardado no token para devolver depois. O token não concede o orçamento inteiro por pellet. Crítico, Culatra e reparo já capturados na bala fazem parte do dano emitido; a conversão espacial só entra se geometricamente ocorrer antes da absorção. Não somar dano de explosão, fogo, eletricidade, corrosão, exposição ou efeitos dependentes de um alvo ao payload de alimentação.

Tiros automáticos mantidos são válidos por cada munição gasta. Uma rajada usa um token por subdisparo consumidor de cartucho. Todas as armas de um conjunto podem contribuir; o número de slots não multiplica energia de uma bala. Tokens devem ficar referenciados apenas por projéteis vivos, sem cadastro global que cresça durante o modo infinito.

### Exemplos padrão sem módulos

Tabela de PROT com uma arma, sem crítico/reparo/Culatra/Colimador. P usa o dano nominal de todos os pellets do cartucho; acertos parciais na entrada contribuem menos. A tabela não promete que todos os pellets tocarão o aparelho.

| Arma | Dano/pellet | Pellets/cartucho | P | Limiar2P | Cap4P | Dano/rebite | Carregador / recarga cheia |
|---|---:|---:|---:|---:|---:|---:|---|
| Metralhadora | 22 | 1 | 22 | 44 | 88 | 16.1333 | 24 / 1.4s |
| Escopeta | 12 | 5 | 60 | 120 | 240 | 44 | 6 / 2.2s |
| Fuzil de rajada | 14 | 1 | 14 | 28 | 56 | 10.2667 | 30 / 1.8s |
| Canhão de precisão | 88 | 1 | 88 | 176 | 352 | 64.5333 | 3 / 2.6s |
| Emissor laser | 10 | 1 | 10 | 20 | 40 | 7.33333 | 60 / 1.6s |
| Lança-chamas | 5 | 3 | 15 | 30 | 60 | 11 | 80 / 2.4s |
| Lançador criogênico | 22 | 1 | 22 | 44 | 88 | 16.1333 | 12 / 2.4s |
| Lança-foguetes | 70 | 1 | 70 | 140 | 280 | 51.3333 | 1 / 4.8s |
| Lança-granadas | 45 | 1 | 45 | 90 | 180 | 33 | 4 / 3.6s |
| Carabina Tesla | 24 | 1 | 24 | 48 | 96 | 17.6 | 8 / 3s |
| Disco de retorno | 24 | 1 | 24 | 48 | 96 | 17.6 | 3 / 3.4s |
| Arpão pneumático | 60 | 1 | 60 | 120 | 240 | 44 | 2 / 2.4s |

O ganho de 110% é orçamento bruto da energia consumida numa salva completa, antes de erros de trajetória, expiração, capacidade, escudos e multiplicadores por alvo. Não é 110% de DPS adicional nem um multiplicador permanente dos tiros do jogador. A alimentação retira dano que poderia atingir diretamente os zumbis.

## Contato físico, tempo e prioridades

A entrada é circular, com raio de 14 px. Para testar uma bala de raio R, expandir esse círculo para 14+R. A entrada deve ser testada pelo segmento percorrido da bala e pelo tempo de contato; comparar apenas o endpoint não basta. O teste precisa respeitar a vida restante da bala e da estação. Um cruzamento geométrico que acontece depois de alguma expiração não alimenta. Expiração vence empate.

Início dentro e tangência contam como entrada; endpoint do segmento também conta quando as duas vidas ainda permitem o contato. Em empate de corpo e entrada, processar o corpo primeiro. O pipeline deve preservar o caminho legado quando a peça não está presente. Antes de processar os projéteis, ordenar cronologicamente apenas os espaços da lista que têm contato potencial válido com a entrada naquele passo. Predizer a velocidade de retorno do disco sem mutar o projétil; ordenar pelo parâmetro de entrada e manter ordem original em empate. Os demais projéteis conservam sua ordem relativa. Isso evita um cartucho lento iniciar uma salva no futuro e bloquear um cartucho rápido que chegaria antes. Não fazer essa ordenação sem dispositivo implantado. Um corpo que encerra ou ricocheteia a bala antes do aparelho impede alimentação no trecho não percorrido. Se houver perfuração legítima antes e a bala sobreviver até a entrada, o consumo posterior pode ocorrer, mas não repetir impactos. Uma bala absorvida termina sem chamar os ramos de impacto/explosão/status. Corpo posterior não recebe esse projétil. O disco ou ricochete não pode reapresentar um objeto já consumido.

O Colimador é uma conversão distinta: se a bala o atravessou antes da entrada, a energia pode refletir aquela multiplicação única; campo posterior não age num tiro que já foi ingerido. As três trajetórias da própria Matriz não são alimentadores e não recebem Colimador.

## Descarga, limites e fila

A estação fica 18 segundos de combate ativo e realiza no máximo três salvas. Uma salva usa a direção do último projétil absorvido e mantém essa direção durante os três ataques. Leque: −0,08/0/+0,08rad. Não procurar alvos nem retarget durante voo.

Os três rebites nascem em 0/0,6/1,2 s relativos ao início da descarga. Velocidade 520 px/s, alcance 260 px, raio 4; tempo nominal de voo 0,5 s. O início é agendado no instante físico do contato de alimentação; as emissões usam timestamps absolutos desse início. Projétil recém-criado só percorre o intervalo residual entre seu nascimento e o fim do passo, nunca o dt anterior. Um passo longo pode emitir as posições de salva vencidas dentro daquele intervalo, sempre respeitando expiração/capacidade, sem criar disparos de um período em que não havia salva. Não confundir isso com backlog após lotação. Durante descarga, tiros manuais passam pelo aparelho sem alimentar. O bloqueio usa o instante absoluto feedBlockedUntil, inicialmente inícioDaSalva+1,2s. Contatos anteriores a esse instante passam sem alimentar; contato exatamente no fim ou depois pode alimentar, inclusive quando fim e contato caem no mesmo tick. Cancelar por lotação encerra a janela no instante da emissão cancelada. Não bloquear o frame inteiro por ter começado ocupado.

Os rebites pertencem ao teto compartilhado de 400 projéteis. Se o teto está cheio antes de começar uma descarga, não gastar 2P nem criar uma fila de ataques. Se faltar vaga no meio da descarga, cancelar os tiros restantes daquela salva, sem reembolso, sem backlog e sem retirar projéteis vivos para abrir espaço. Expiração da estação vence uma emissão no mesmo instante. O contador salvos cresce ao INICIAR cada salva, incluindo uma que depois seja cancelada por lotação. Após três iniciadas, remover o dispositivo quando não existe salva ativa; não restaurar uma tentativa porque seus rebites restantes foram cancelados.

## Esquema de estado e ordem de atualização

Uma reconstrução pode usar outra organização interna, mas precisa preservar estes observáveis. Guardar na estação: posição fixa x/y, P, raio14, energia, instante absoluto de expiração (`implantação+18`), vida restante para apresentação, janela válida do passo, instante absoluto de fim do bloqueio de alimentação, número de salvas iniciadas, direção da última alimentação e salva ativa ou nula. A salva guarda direção/dano capturados, índice do próximo rebite e instante absoluto do próximo ataque. Cada rebite guarda nascimento, último instante avançado, posição, velocidade, dano, raio4 e vida0,5s.

1. Avançar o relógio somente em playing. Antes de atualizar a Matriz, guardar a vida que existia no começo do passo; ela determina a janela física de entrada. Usar feedBlockedUntil para comparar o instante de cada contato com o fim da descarga.
2. Atualizar a vida de apresentação pela expiração absoluta. Processar rebites programados que venceram até o relógio atual, sempre recusando evento no/depois da expiração. Se estava ociosa e havia energia/capacidade, iniciar no instante de início do passo; se a energia veio de um contato novo, usar o instante desse contato.
3. Emitir cartuchos manuais pela cadência normal. Cada emissão após adquirir a peça recebe um token compartilhado pelos pellets realmente criados; antes de adquirir, não acrescentar esse dado.
4. No movimento das balas manuais, procurar a entrada válida e processar os contatos anteriores pela ordem legada. Se sobreviver até a entrada, consumir a bala, atualizar token/energia/direção e, se possível, iniciar a descarga naquele instante. Alvos posteriores não recebem esse projétil.
5. Nos rebites da entidade, avançar somente `min(dt,agora−últimoAvanço)`, limitado à vida restante; usar colisão varrida e o primeiro contato de corpo. Não executar o pipeline manual de procs.
6. Remover projéteis encerrados e então remover a estação se vida≤0 ou se três salvas foram iniciadas e não há salva ativa. A remoção natural da estação não apaga rebites já emitidos; morte/garagem os removem.

Comparações numéricas da implementação candidata: faixa de posição tolera1e-7px; limiar energético e agenda absoluta usam tolerância1e-9; empates espaciais/TTL usam8×Number.EPSILON no parâmetro do segmento. Esses valores não autorizam contato após uma expiração real nem um ataque extra.

## Fontes de dano e recompensas

Rebites usam `source='matrix'` no caminho central de dano, e não `impact` da arma. Não aplicam crítico, exposição balística, queimadura, frio, corrosão, eletricidade, explosão, perfuração, ricochete, retorno ou procs manuais. Não alimentam a própria Matriz, a Culatra ou outra entidade.

Preservar as condições gerais do caminho central de dano explicitamente aplicáveis à fonte, incluindo escudo policial, marca do Predador, Caça-Titãs e finalização por vida baixa. Elas não alteram P armazenado. O escudo absorve o golpe inteiro, inclusive o de quebra; não transferir excedente nem instalar estados proibidos.

Abates normais concedem XP, sucata, contador de mortes e célula global de reparo na frequência usual; chefes mantêm cura, peça e baú pela regra geral. A fonte matrix não ativa Depósito Ampliado (`killAmmo`) nem Sucata (`salvage`). Não transformar a palavra “sem procs” em retirada de recompensas básicas nem em liberação de cadeias balísticas. A cura normal de derrota de chefe pode armar Carga de Reparo pela regra global de cura, e a morte pode liberar corrosão previamente instalada por outra fonte. Esses eventos gerais permanecem; o rebite não semeia estado novo nem chama impact. A proibição de procs não remove os contratos de recompensa e morte do jogo.

## Estados e limpeza

| Estado | Condição | Atualização | Saída |
|---|---|---|---|
| Sem peça | rivetMatrix não adquirida | Nenhuma entidade/token novo | Oferta legal |
| Pronta | Peça adquirida e nenhuma estação | Botão/tecla, espera direção válida | Implantação manual |
| Carregando | Estação viva, sem salva ativa | Absorve payload válido, capacidade 4P | Limiar 2P e vaga para ataque |
| Descarregando | Salva em execução | Três instantes e direção fixa; sem alimentação | Fim/cancelamento da salva |
| Pausada | Jogo fora de playing | Vida, energia e ataques congelados | Retomada explícita |
| Expirada | Vida esgotada ou limite de salvas | Remove estação; sem ataque atrasado | Peça permanece pronta para nova implantação |
| Morte/reset | Fim/reinício da tentativa | Limpa entidade e estado temporário conforme política de projéteis da tentativa | Nova tentativa sem relíquia |

Desenho, HUD, minimapa e painel de pausa só consultam estado. Não avançam vida, energia, disparos, posições ou RNG. Ao expirar normalmente, remover a estação e permitir nova implantação; rebites já emitidos completam sua própria vida restante. Morte e retorno à garagem removem também os rebites ativos; reset recria a tentativa sem peça/campo e limpa todas as balas. Morte e reset não podem manter captura de entrada ou comandos antigos. O perfil permanente não recebe a peça, seus números ou tokens.

## Apresentação e evidências

Estação compacta de chapa escura, entrada e bobina ciano, indicação local de carga/direção; sem círculo amplo que esconda inimigos. O marcador do minimapa é único e permanece identificável quando o aparelho está longe. Rebites precisam ser distinguíveis das balas da arma e das descargas hostis. O HUD mostra energia/limiar, salvas e tempo; o botão desktopusa E e o toque usa sua ação própria. O status de energia não anuncia mutações por frame em região aria-live.

### Sons próprios da estação

Eventos usam o barramento de efeitos já existente, seus controles de volume/mute e o RNG de ruído próprio do áudio. Não sortear no RNG de combate. Limites mínimos entre cues iguais: implantação 0,25 s, alimentação 0,12 s, rebite 0,12 s, expiração 0,3 s.

- Implantação: ruído curto 0,055 s com ganho 0,025, somado a oscilador triangular 165→245 Hz durante 0,16 s, ganho 0,04.
- Alimentação efetiva: seno 510→620 Hz durante 0,045 s, ganho 0,022. Só emitir quando a energia realmente aumenta, não por tiro descartado em capacidade cheia.
- Rebite emitido: ruído 0,04 s/ganho 0,035 e triangular 390→150 Hz durante 0,085 s/ganho 0,05.
- Expiração natural: seno 190→85 Hz durante 0,18 s/ganho 0,03. Limpeza por morte não deve criar pilha tardia de sons de expiração.

A descrição e os casos da [especificação mestre](SCREWVIVORS-ESPECIFICACAO-E-TESTES.md) são critérios, não resultados. A candidata precisa comprovar geometria, TTL, orçamento por cartucho, doze armas, cap400, pause/reset, procs, controle e leitura real em 1280×900/844×390/740×360. Partidas naturais, desempenho real e celular físico são provas separadas e continuam pendentes até execução identificada.

## Validação da candidata

A fonte congelada 8ab6faf1792a01c05a7a38c4f14024ef64905f041db24588f3bed4f92de4deee passou na prova de transparência dos observadores e na matriz intermediária de dez receitas: todas sobreviveram1200s e derrotaram pelo menos três chefes, mas somente8/10 adquiriram as quatro skills centrais. Demolição e Lança não montaram o core e continuam falhas no denominador. Não chamar essa matriz de aprovada.

Experimento separado com preferência pela Matriz somente quando legalmente oferecida e ação manual de implantação passou4/4 (Tempestade/Escopeta×20261124/25), com aquisição, alimentação, salvas e acertos reais nos quatro casos. Não substitui as falhas canônicas nem as30tentativas finais. Depois do congelamento, uma correção de entrada permitiu E quando o foco fica no botão de pausa após escolher a peça; o piloto desse ensaio chama a ação diretamente e não exercita o atalho. A interface e as correções visuais posteriores têm testes de navegador separados.

A revisão temporal adicional reproduziu um P1: duas velocidades diferentes alimentavam em ordem de emissão, mudando a energia e o início da salva ao dividir o passo. A ordenação de candidatos por tempo de entrada corrigiu o caso; tests/matrix-time-order.cjs conserva a regressão e verifica que o término da terceira salva não absorve tiros posteriores. A matriz natural v3 anterior foi preservada como histórica e uma execução v4 foi iniciada após a correção. Não herdar aprovação de v3 para v4.

## Aparência e entrada verificadas

A base mede48×36px, em azul-noturno, com grampos de cobre; corpo34×26px e moldura de metal claro. Oito indicadores representam degraus de0,5P: quatro ciano até o limiar2P e quatro âmbar até o teto4P. A entrada brilha por0,1s após energia efetivamente recebida; um rebite emitido causa recuo visual de2px por0,08s. lastFeedAt/lastShotAt são gravados apenas nos eventos da simulação; desenho consulta clock, sem mudar estado ou consumir RNG. O minimapa usa marcador aliado quadrado e não aumenta a hitbox.

No teclado, E funciona mesmo quando o foco permanece no botão de pausa depois da escolha da peça; campos editáveis continuam protegidos. No toque, a liberação do próprio dedo dentro do botão executa a ação sem depender de click sintético de contato primário. Movimento e mira mantêm seus captures. Liberação fora do botão, cancelamento, blur e indisponibilidade não executam. Click touch/pen posterior é ignorado para não duplicar; teclado e mouse mantêm ativação normal. Uma ponte MouseEvent legada sem pointerType é suprimida por500ms somente após toque já tratado; ativação de teclado detail0 continua permitida.

O controle negativo de três dedos reproduziu na BUILD60 a falha de recarga e propulsor enquanto os dois pads ficavam pressionados: zero callbacks. A fonte atual chamou cada ação uma vez e os14cenários isolados passaram. Isso é correção de P1 de controle, não apenas adição cosmética da Matriz. As provas são em Chrome emulado; celular físico continua pendente.

## Evidência consolidada após a correção temporal

A execução v4 repetiu os dois braços com a fonte física atual:8/10viáveis no canônico e4/4no experimento de escolha legal+implantação. As falhas canônicas de Demolição e Lança por core incompleto permanecem. Os quatro casos experimentais tiveram aquisição, alimentação, salvas e acertos; isso prova uso natural sob aquela política, sem aprovar balanceamento universal. [Resumo](build61-balance-summary.json) e [arquivo integral](data/build61-runs.json.gz) preservam resultados, protocolos, fontes, pilotos, diferenças de instrumentação e provas de transparência. v1/v2 pararam em fixtures de observação sem rodar tentativas naturais; v3 é histórico anterior à correção de ordem dos contatos. Não contar esses ensaios como uma única matriz homogênea.

As verificações locais concluídas incluem22grupos de engine, cronologia entre cartuchos e término da terceira salva,14cenários de toque isolado, browser em1280×900/844×390/740×360, cues de áudio, escudos, Culatra, Colimador, armas/reforjas, equivalência legada32mundos/416checkpoints, partículas12mundos e simulação integrada25minutos. O browser confirma aquisição pela carta, E após foco em pausa, três dedos, alimentação real, ancoragem, pausa,3armas e avisos fora dos botões. São fixtures explícitas; não são celular físico nem métricas de FPS. As provas finais1.0 de30tentativas,60minutos e desempenho real continuam abertas.
