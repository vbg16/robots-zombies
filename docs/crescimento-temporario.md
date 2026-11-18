# Memórias de Reparo e Reagente — candidata BUILD67

**Situação:** implementação e validação intermediária, sem aprovação dos gates finais. Dois crescimentos temporários adaptam as pendências de cura efetiva e corrosão acumulativa. Não são Titânico/vida máxima, Acoplamento/HP atual, Circuito/tempo sem impacto ou treino temporal da Baia.23relíquias/109artigos,56normais/86editáveis/revisão7; receitas canônicas e piloto não mudam.

## Memória de Reparo

ID vitalGrowth, universal: todos os chassis têm fontes legítimas de cura como células/chefes. Aquisição inicializa vitalHealing=0, sem curar, aumentarHP, repor munição ou alterar atributos numéricos.

Durante playing, jogador vivo e peça adquirida, healPlayer registra APENAS actual=hpDepois−hpAntes se positivo e finito. vitalHealing=min(150,max(0,saldoFinitoOuZero)+actual). Não conta valor nominal da cura, excesso convertido em Banco, reserva, escudo, armadura ou aumento de vida máxima.

EstágiosV=min(15,max(0,floor((vitalHealing+1e-9)/10))); fatorV=1+0,01EstágiosV. A tolerância1e-9HPno limiar absorve arredondamentos de somas fracionárias; uma falta visível de0,000001HPnão concede estágio. Valores inválidos na leitura não criam bônus. Exemplo:9,9+0,1HPefetivos→1%;100→10%;150oumais→15%.

Uma cura de30emHP90/100conta10; se o Banco tiver espaço, pode receber10do excesso20, sem contar essa parcela. EmHP100/100, a mesma tentativa pode abastecer Banco mas conta0para a Memória. Cura de escolha em estado relic/upgrade/evolution/garage/paused não avança, mesmo que a regra preexistente restaureHPnessa tela. Coração do Reator não vira um crédito de combate automático. Cura anterior à aquisição não é recuperada retroativamente.

Fórmula da emissão: emittedShotDamage(slot)=shotDamage(slot)×fatorV. shotDamage continua com sua fórmula original de dano local/Titânico/manutenção. O emissor usa emittedShotDamage antes dos fatores críticos, Carga de Reparo, Culatra e pellets. O fator não é multiplicado repetidamente em slot.damage nem em player.damage.

Projéteis já emitidos conservam o snapshot. Principais/auxiliares recebem o mesmo fator uma vez por emissão; o saldo de cura é único do jogador, não multiplicado pelo número de armas. Cura de recarga continua dividida porNarmas e proporcional à fração realmente reposta.

### Heranças permitidas e limites

- Drones, sensores, rotores, dano direto do Pistão/Lâmina e referênciaPda Matriz não recebem multiplicador direto.
- Canais que já usam b.damage herdam legitimamente o tiro fortalecido: queimadura, corrosão, descargas e explosões intrínsecas seguem suas regras existentes. Não reaplicar Vital nesses canais.
- Canais que usam directDamage/base própria, como conversão cinética e algumas fraturas, continuam com a base anterior. Não prometer que todo efeito secundário cresce.
- Orçamento matrixFeed écapturado na emissão usando o mesmo emittedShotDamage dos pellets e seus fatores, inclusive número que coube no teto400e o máximoColimador1,35. Assim a bala fortalecida pode fornecer mais energia, sem reescrever a referênciaPde uma estação já instalada. Éherança de energia consumida, não bônus direto genérico de suporte.
- Carga de Reparo e Armadura de Reparo continuam reagindo aoHPefetivo como antes. Ganhar estágio não consome nem duplica esses estados.
- Nenhum estágio cria cura, dano, munição, ataque, alvo ou evento secundário por conta própria.

## Memória Reagente

ID reagentGrowth, elegível com player.skills.corrosion. Fogo, arma elétrica ou suporte sozinho não são elegibilidade. Aquisição inicializa reagentStages=0, sem semear carga ou reescrever dano/prazo de cargas antigas.

Na resolução de tickCorrosion, capturar a referência charge e hpAntes antes de chamar damageEnemy. Depois:

- charge.spread deve ser estritamente true: uma primária real.
- hpDepois<hpAntes: houve perda efetiva do corpo.
- Jogador vivo, estado playing e peça adquirida.

Se todas forem verdadeiras: reagentStages=min(15,estágiosVálidos+1). Uma detonação gera no máximo1estágio, independentemente de dano, pellets, quantidade de armas, alvo chefe ou abate. A resolução normal remove a mesma referência da carga; tickrepetido não repete crédito.

FatorR=1+0,01min(15,max(0,floor(reagentStagesFinitoOuZero))). Somente novas primárias capturam:

danoCarga=clamp(b.damage×player.corrosionDamageMult×fatorR,0,1e9).

Prazo e demais restrições de aplicação permanecem: alvo vivo/não blindado/sem outra carga; não renovar, substituir ou acumular por acertar novamente.

Uma primária aplicada antes de adquirir a peça pode creditar uma resolução futura válida, mas mantém sua captura antiga. Não contar eventos que já aconteceram.

### Ordem de morte, respingo e proteção

O crédito ocorre DEPOIS de damageEnemy. Portanto, numa detonação letal, releaseCorrosion recebe a captura antiga e cria até2filhos com metade desse dano antes de incrementar o estágio. Os filhos usam spread:false, não recebem fatorRnovamente, não creditam estágio e não propagam outra geração.

Morte antecipada por bala, drone, queimadura, pulso ou outra fonte pode liberar a carga antiga segundo a regra global de morte, mas não é uma resolução primária de corrosão e não credita Memória Reagente.

Golpe absorvido por escudo não removeHPdo corpo e não credita. Bloqueio de aplicação por escudo, dano0, alvo já morto/removido e chamada de tickinativa não creditam.

targets() processa inimigos antes do chefe. Se cargas de lacaios realmente detonarem antes da morte do chefe, esses eventos podem creditar normalmente. Lacaios removidos pela morte do chefe antes de suas próprias resoluções não detonarão nem ganharão crédito posterior. Não confundir remoção sem dano com um evento anterior legítimo.

Na passagem atual, capturas e referências são obtidas antes de iterar. Uma primária detonada depois de outra na mesma passagem mantém seu dano antigo. Filhos criados durante a passagem não envelhecem nela.

Catalisador Térmico éavaliado na detonação e mantém seu fator1,5quando fogo/frio ainda alcançam aquele prazo. Multiplicadores globais contra chefe/Finalizador/marca preservam o ponto anterior de aplicação, sem entrar duplicados na captura.

## Composição das trilhas

São dois saldos distintos. Com ambos no teto, um novo tiro de base100captura115; nova primária desse tiro captura132,25antes de outros modificadores. Isso é1,15×1,15=1,3225num snapshot corrosivo, não um bônus universal de32,25%nemDPSsustentado.

Uma carga antiga100não passa a132,25quando o jogador cresce. Filho de uma captura114continua57, mesmo que a detonação que o criou tenha acabado de levar o estágio a15. Carga semeadaporbala antiga pode capturar fatorRvigente na aplicação, mas nunca ganha retroativamente fatorVde uma cura posterior à emissão.

## Ciclo de vida, apresentação e áudio

Saldos duram somente a tentativa, sem decair por relógio. Pausa/ofertas conservam valores e congelam o combate. Morte/garagem zeram saldos presentes; reset cria jogador novo, sem peças/campos herdados. Nada vai para o perfil permanente.

HUDreutiliza o elemento global combat-loadout na área de armas, uma única cópia para1/2/3slots. Mostra REPAROn/15/+n%/HPatépróximo e REAGENTEn/15/+n%, com10px, wrape rolagem quando necessário. Não usa barra deHPpara representar crescimento nem cria botão. Diagnóstico da pausa mostra saldo exato e fatores. Ícones própriosvitalGrowth.svg/reagentGrowth.svg.

Estágios não têm som extra: repair e corrosion já pertencem aos eventos reais. Não criar toastou número flutuante a cada cura fracionária/detonação. Render/HUDnão sorteiam, alteram atributos, avançam saldo ou relógio.

## Casos de aceitação

| ID | Preparação/ação | Resultado esperado |
|---|---|---|
| GRO01 |Aquisição legal independente |Vital universal; Reagente sócomcorrosão; saldo0semHP/ammo/gratuidade |
| GRO02 |Curas9,9+0,1e fracionárias |1estágio, resto preservado, tolerância1e-9sem conceder déficitvisível |
| GRO03 |Curas além150HP |Saldo150, máximo15%, sem crescimento numérico ilimitado |
| GRO04 |HPcheio comBanco vazio |Reserva podeganhar; Vital0 |
| GRO05 |HP90/100cura30 |Vital10; sóexcesso20financiaBanco |
| GRO06 |Coração/escolha/pausa/garagem |Cura normal nãoavança saldo emtelas |
| GRO07 |Reparo/carga/armadura |HPefetivoativa gatilhosoriginais; estágio nãoconsome/duplica |
| GRO08 |12armas, tiroantes/depoisda cura |Novos×fatorVuma vez; tirosantigosinalterados |
| GRO09 |1/2/3armaserecargas |Saldoúnico, cura divididaproporcional preservada |
| GRO10 |Drones/sensores/rotores/Pistão/Lâmina |Sembônusdireto adicional |
| GRO11 |Matriz antes/depoiscrescimento |ReferênciaPpreservada; feedbudgetcapturadoigualemissãofortalecida |
| GRO12 |Primáriaque retirouHP, inclusiveletal |1crédito, não repetirnumtickposterior |
| GRO13 |Carga anterioràaquisição |Capturaantiga; créditofuturoválidopossível |
| GRO14 |Duasprimárias criadasantes/mesmopasse |Ambaspreservamdano, créditoslocaissemretroagir |
| GRO15 |Mais15resoluções |Máximo15estágios; novasprimárias×1,15 |
| GRO16 |Morteantecipadaporoutrafonte |Respingoantigopermitido, nenhumcréditoprimário |
| GRO17 |Primárianeutralizadaporescudo |SemHPperdido/estágio |
| GRO18 |Primárialetalem14estágios |Filhosmetadedaoldcapture, sódepoisestágio15 |
| GRO19 |Filhosdetonam/morrem |Nãoavançamnempropagam; sem recursão |
| GRO20 |Ambostetos/base100 |Tiro115/carga132,25, nãofactorrepetidonaresolução |
| GRO21 |Catalisador/chefe/Finalizador/marca |Globaisno pontoanterior, semduplicarcaptura |
| GRO22 |Chefemorrecomlacaiosde carga pendente |Recompensaúnica; removidosnãoresolvemnemcreditamdepois |
| GRO23 |Lacaiosjáresolveramantesdochefe |Créditoslegítimospreservados, ordemtargetsdocumentada |
| GRO24 |Pausa/oferta/retrato/renderRNGlançando |Semtempo/crescimento/mutação/tiropreso |
| GRO25 |Morte/garagem/reset/save |Zeraestados, sematributopermanente |
| GRO26 |NaN/Infinity/negativo e captura1e9 |Semestado inválido geradopelosnovoshelpers; limitecapturapreservado |
| GRO27 |Cards/HUD/pausa3viewports |Ícones/condiçõeslegíveis, estadoglobalúnico10px, alcançávelsemobstrução |
| GRO28 |Eventosdeáudiocom/sempeça |Mesmoscues/RNG; zero somextra porestágio |
| GRO29 |Naturais fontecongelada |Todas mortes/falhas/ausências preservadas, braçoscanônico/experimental separados |
| GRO30 |3viewports×1/2/3armas×Banco/manutenção |Cabeçalho/XPsem sobreposição; painelrolável acima dospads |

## Evidência intermediária

tests/growth.cjs passou18grupos; tests/growth-audio.cjs20grupos maisgrafoaudiooriginal. A primeira fixture de chefe deu3créditosporque dois lacaios legitimamente resolveram antesdele; o cenário de remoção foi corrigido para lacaios ainda com prazo. Outra falha inicial usava getAttributeque oDOMfalso dafixture não implementa; o navegador real usaAPIreal. Negativos preservados, sem produção alterada para esconder resultado.

Browser controlado passou1280×900/844×390/740×360 com cardslegais, tirosreais, capturasantes/depois, filhos, contadorúnicoem1/2/3slots, diagnóstico/pausadepixels, toque3dedos/retrato/morte/save/reset e23/109. Uma rodada anterior foi corretamente rejeitada por mudança deindexduranteexecução e preservada; a rodada atual não teve mudanças de fonte. Isso não épartida natural, aparelho físico ou medição deFPS.

A avaliação natural histórica67 foi consolidada: A9/10canônicas, B2/2 e C1/2experimentais; falhas por núcleos incompletos, não mortes.74registros verificados com driver13e física antiga. [Histórico, negativos e limitações](build67-historico.md) e [resumo estruturado](build67-balance-summary.json). Não aprova incursão/bandos/respiro/Prisma68ou gates finais; BUILD67não foi publicada separadamente. A meta1.0permanece aberta.

### Correção de apresentação descoberta durante a verificação

A checagem geométrica reforçada reproduziu12sobreposições em18layouts: no celular, Banco/manutenção aumentavam o cabeçalho enquanto o arsenal continuava top76px. Em740×360, o cabeçalho comCircuito/Ponte chegava a110,796875px e encobriaXP/cue. Era uma limitação anterior, não um ganho de atributo das novas peças.

Em landscapeaté1100×600, touch-activecomBanco visível, o arsenal passa atop120px. A altura máxima éreduzida nosmesmos44px: calc(100%−clamp(96px,28vh,124px)−138px). O limite inferior anterior fica preservado acima dospads. Em740, top120/bottom241,1875e cabeçalho máximo110,796875deixam9,2pxde espaço. SemBanco, o posicionamento anterior permanece.

O navegador repetido aprovou18/18layouts e gameplaynas3resoluções, com fontes estáveis, alcanceporrolagem, texto10px, sem obstruir os controles. Negativos/capturas anteriores preservados. A revisão estática não encontrou defeito de lógica; registrou a escolha deHUDque substitui o resumo redundante de dano/cadência por progresso, mantendo os valores detalhados na pausa.
