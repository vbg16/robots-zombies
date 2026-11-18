# Incursão de vinte minutos — candidata BUILD68

Estado: EM DESENVOLVIMENTO; candidata local, sem aprovação pública ou aceite final. Esta decisão posterior do criador substitui somente as regras antigas incompatíveis de modo sem tempo final. Os crescimentos de cura/corrosão da BUILD67,23relíquias,109artigos do compêndio e86aprimoramentos editáveis permanecem. Nenhum atributo temporário passa ao perfil.

Verificação consolidada: [61 checks e dez partidas naturais](build68-verificacao.md). Nove receitas venceram; a morte de Rede de Plasma e as limitações do piloto permanecem documentadas, sem aprovação dos gates finais.

## Escopo humano desta etapa

O pedido é20minutos regressivos, respiro após aprimoramentos e preferência por bandos, com exceções para corredores/chefes. A resposta posterior determina um novo chefe aos12mindecorridos e outro aos15min, mas **primeiro somente um**. Portanto só Prisma de Cerco foi acrescentado agora; o segundo novo chefe aos15min está ADIADO. O Brutamontes recorrente previsto aos15min não representa essa identidade futura.

## Relógio, vitória e persistência

O relógio interno `clock` conta segundos ATIVOS decorridos desde0, até `RUN_DURATION=1200`. O HUD mostra `ceil(max(0,1200-clock))`, formatado com dois dígitos de minuto/segundo. Começa20:00; aos720s mostra08:00; fim00:00. Pausa, garagem e seis telas de escolhas não avançam o tempo. `tick` recusa dt não finito, nulo ou negativo; limita a última fatia ao tempo restante. O navegador interativo continua limitando dt de quadro a0,04s, sem prometer desempenho.

Depois da simulação da última fatia, se ainda vivo/playing, entrar em `won`, fixar clock1200, limpar entradas/hostis/hazards e invalidar tokens de escolha. Uma morte na última fatia prevalece e mantém `over`. A vitória vem antes de abrir XP/baú pendente naquele fechamento; não existe coleta ou prêmio terminal automático. Nenhum movimento, tiro, loot ou dano continua depois da vitória. Mostrar conclusão, abates/chefes e repetir configuração; garagem continua alcançável. Repetir cria tentativa nova e remove aprimoramentos/entidades/contadores temporários. Parafusos/peças previamente coletados e salvos permanecem na morte, vitória e reabertura; nenhum prêmio de vitória extra é criado.

## Respiro após instalar

Uma escolha legal e efetivamente instalada de **módulo normal, gambiarra, experimento, relíquia de baú, especialização ou reforja de arma** aplica um respiro, depois da instalação. Cada reforja de espaço válida recebe seu próprio respiro, inclusive enquanto outra reforja mantém a pausa. Para cada inimigo vivo no array de inimigos cuja distância ao jogador seja≤280px, deslocar120px na direção radial para fora e definir stun=max(stun atual,0,5s). O chefe, armazenado separadamente, não é deslocado. Lacaios e corredores vivos também recebem esse respiro: exceção de bandos não é exceção de respiro.

Na coincidência exata de centros, usar ângulo index×2,399963229728653rad, sem RNG. Alvos além280, mortos ou tentativa finalizada não recebem efeito. O deslocamento não causa dano, não quebra escudo, não repõe munição, não conclui recarga, não gera XP/abates/recursos nem altera snapshots de ataques. As próprias escolhas conservam seus efeitos já documentados; a garantia refere-se ao respiro. Rejeitar token obsoleto/duplo clique/índice inválido e não aplicar novo respiro. Prévia, renovação, recusa, pausa e abertura de tela não empurram. Anel visual ciano de raio280 dura0,35s quando algum inimigo foi deslocado.

## Bandos locais

É uma preferência de direção, não comando global ou reunião obrigatória num ponto. Cada tick monta grade de células240px a partir de snapshots de posição dos elegíveis. Buscar células vizinhas3×3, vizinhos em até220px, ordenar por distância e índice estável e usar no máximo8. Excluir mortos, corredores comuns (`enemyType=runner`), lacaios corredores (`minionType=runner`) e policial cujo escudo já quebrou (`shieldPolice` e shieldHp===0). Chefes não entram no array/grade.

A direção de perseguição original soma vetor unitário para o centro médio dos vizinhos com peso0,8 somente quando jogador está a>180px e centro médio a>12px. Próximo do jogador essa coesão cessa, permitindo atacar. Separação usa distância pessoal gap=raio próprio+raio vizinho+8; para vizinho mais próximo que gap, afastar com peso1-distância/gap. Média dos vetores de separação entra com peso0,5; coincidência escolhe lado pelo índice estável. Normalizar o vetor final; se quase zero manter direção original. Sem vizinhos ou inelegível preserva direção original.

Velocidade nominal e fatores de frio/stun permanecem; bando não adiciona aceleração, dano ou escudo. Não consumir RNG, não ultrapassar teto comum180 nem remover vivos para agrupar. Diretor de horda/reentrada mantém regras próprias de vida/escudo e spawns fora da tela. Limite: não é pathfinding por obstáculos, formação rígida ou garantia de coesão global; atiradores preservam suas regras de distância.

## Agenda e fila de chefes

| Índice | Decorrido | Restante | Identidade base | HP | Raio | Velocidade |
|---|---|---|---|---|---|---|
|0|60s|19:00|Brutamontes|650|32|28px/s|
|1|240s|16:00|Sucateiro|1300|30|24px/s|
|2|420s|13:00|Bobina-Rainha|1800|34|20px/s|
|3|720s|08:00|Prisma de Cerco|2500|40|17px/s|

Só um chefe vivo: se anterior sobreviver ao instante nominal, o próximo aguarda, sem apagar/substituir o anterior e sem reiniciar agenda pela morte. Logo720s é **agenda nominal**, não garantia de encontro exatamente ali. Após índice3, agenda=720+180×(índice−3); índice4 aos900s retoma Brutamontes do ciclo seguinte. Continua escalonamento de ciclo existente: HP×(1+0,7×ciclo), velocidade×(1+0,08×ciclo). Não suprimir o encerramento1200 para mostrar chefe atrasado.

Prisma chama duas sentinelas atiradoras LENTE/LENTES DE GUARDA: HP80, velocidade28, raio13, variante1; escalonamento de lacaio existente por ciclo. Ondas comuns continuam. Derrota concede **uma peça de fabricação COIL compatível** no perfil atual, sem criar moeda `prism` órfã; cura de chefe e baú físico temporário seguem regras gerais. Remover seus lacaios sem recompensas falsas e limpar hazards/hostis; dano repetido não duplica baú/peça/abate.

## Prisma: fases, lasers e animação

Começa em aproximação2s. Durante aproximação, se distância>260 mover na direção do jogador a17px/s base; se<160 recuar a50% da velocidade; no intervalo parar. Frio reduz movimento pela regra existente e stun o zera. Depois preparar laser por1,8s base; Leitura de Ameaças amplia preparo20% se dentro do alcance180 no início, capturando duração. Disparo ativo0,8s; recuperação2s; próxima aproximação2,5s. Contato corporal20 passa pelo dano recebido normal.

Na entrada do preparo capturar posição do jogador no MUNDO, escolher eixo alternado vertical/horizontal e criar cinco retas paralelas nos offsets−240,−120,0,+120,+240px. Coordenada capturada não segue o jogador. Retas chegam às bordas atuais da tela no desenho, mesmo após mover câmera; alcance lógico ao longo da reta não termina na posição antiga da câmera. Largura14px; colisão perpendicular≤14/2+14=21px. Entre centros120, existe corredor útil de78px para o centro do jogador, desconsiderando outros perigos. Nenhum dano durante preparo; hazard ativo causa20 com fonte boss-hazard e respeita invulnerabilidade, escudo, Aterramento, armadura e Banco normais. Sobreposição não ignora intervalos de invulnerabilidade.

Tick fatiado nas fronteiras preserva residual de dt entre fases. Ao criar hazard, atraso incorpora tempo já gasto nesse tick+preparo; tick global de hazards processa dt completo. Guard4096transições cobre duração inteira de uma incursão. `owner` morto encerra hazard; pausa/morte/vitória não permitem dano residual. Desenho usa fase real, telegráfico, lente/torre e descarga, sem RNG ou alteração de física. Sons laserCharge/laserFire correspondem a preparação/disparo; não confundir evento sintético aprovado com avaliação humana da mixagem ou legibilidade.

## Verificação e limites de aceite

`tests/incursion.cjs` registra21grupos sintéticos aprovados no snapshot de sua execução, em outputs/incursion-engine68/result.json. Cobre residual/fatal/pausa/persistência, seis escolhas/stale/recusa/reroll, coesão/snapshots/exceções/velocidade, agenda/fila, lasers/gaps/câmera/mitigação/limpeza e equivalência de3,2scontra80×0,04s. As fixtures declaram proteção e estados preparados; não são partidas naturais nem os40casos propostos de outputs/incursao-audit.md. Alterações posteriores exigem reteste; hashes identificam o escopo.

Permanecem obrigatórios G01–G16, sementes20261130/20261201/20261202,30naturais,≥27/30e≥2/3por receita,state=won em00:00,≥3chefes e quatro skills centrais por tentativa viável. A condição de vitória não prova viabilidade da build. Nenhuma evidência antiga de modo infinito aprova automaticamente o novo equilíbrio. G05 de60min está ABERTO: propõe-se três incursões consecutivas na mesma sessão, somando3600sativos e verificando limpeza entre elas, sem impedir vitórias. A interpretação proposta ainda exige aprovação e execução; não substituir silenciosamente o gate nem declarar os60min testados. Celular físico, desempenho real, ensaio natural completo e aprovação pública permanecem separados.


## Negativos preservados de regressões históricas

O manifesto original em outputs/release68-regression/manifest.json terminou `passed:false`: o comparador tests/particle-stream.cjs usa mundo inteiro da BUILD57, incluindo semântica antiga de tick0 e IA sem bandos. O ensaio separado de tests/combat-feedback-equivalence.cjs contra BUILD54 também falhou; seu negativo e motivo estão em outputs/release68-regression/historical-equivalence.json. Asserções e resultados originais permanecem; diferenças esperadas pela decisão humana não autorizam ocultar negativos ou aprovar G02 automaticamente.

O Dev preparou tests/particle-stream-current.cjs para isolar a otimização de partículas na MESMA fonte atual: caminho otimizado versus fallback de array (beginSparkStream retorna null), comparando12mundos pareados, estado completo e próximo RNG. Terminou com código0; evidência em outputs/particle-stream-current68/equivalence.json. Esse é o comparador aplicável à preservação de partículas após a mudança de física; não usar seu resultado para alegar equivalência geral do mundo68ao54/57. O manifesto original continua45testes/44aprovados, overallfalse e sourceChanges=[]; o complemento deve registrar o substituto e demais verificações separadamente. Revisão independente outputs/incursion-review68.md não detectouP0/P1 na leitura estática, sem substituir execução natural, aparelho físico ou auditoria final.


## Atualização da incursão — BUILD68

O launcher usa a política compartilhada driver14 e encerra quando a tentativa chega a `won`, mesmo que a duração solicitada seja maior que20minutos. O relatório identifica esse encerramento como `run-won`; morte e interrupção manual continuam distintas. A mudança adapta terminal/relatório, sem conceder dano, imunidade, itens, cura ou alterar a física/política de movimento.

Em pedidos de pelo menos20minutos, `viable=true` exige simultaneamente state=won, tempo ativo≥1200−1e-6s,≥3chefes, todas as quatro skills centrais da receita, estado finito e zero erros. Vitória sozinha não comprova uma build completa. Pedidos curtos mantêm viabilidade completa nula; duração solicitada não equivale ao tempo efetivamente jogado. O teste controlado de terminal começa em1199,99s e pede21min; prova encerramento em1200/won e viabilidade falsa sem núcleo, não uma partida natural de20min.

Limitação atual: o smart preserva a pontuação anterior de ameaças, que cobre pools/anéis, mas não calcula corredores dos novos lasers por eixo/coordenada. Essa lacuna do piloto não deve ser atribuída automaticamente ao equilíbrio do jogo nem ocultada ao interpretar mortes. Qualquer revisão futura do piloto exige hash/versão/protocolo novos e resultados antigos preservados.

A rodada extra original de11comandos terminou10aprovados/1falha: o guard antigo do launcher exigia driver13e abortava antes dos casos de segurança de baú. O negativo continua preservado; o Dev corrigiu somente integração de versão/terminal/viabilidade e registrou reteste de bot-loot-safety, quatro perfis curtos e terminal controlado. As evidências aplicáveis e seus limites estão no [resumo de QA68](build68-qa-summary.json); não aprovam os gates finais, matriz natural, celular físico ou desempenho real.
