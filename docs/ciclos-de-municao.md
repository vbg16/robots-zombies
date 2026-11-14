# Ciclos de munição — candidata BUILD66

**Situação:** implementação e validação intermediária, sem publicação ou aceite final. Duas peças temporárias de baú adaptam os motores de carregador menor/eficiência e reposição/cadência. Não são mudanças nas dez receitas, no piloto ou nos56módulos normais. Catálogo atual:21relíquias,107artigos de compêndio,86editáveis/revisão7.

## Alimentador Compacto

ID compactFeed, universal. Ganho: tempo por cartucho realmente reposto20%menor. Custo: capacidade reduzida para75%, arredondada para baixo, mínimo1. Sem dano adicional, cartucho gratuito, cura própria ou bônus de último tiro.

Para cada slot:

- Cn=max(1,floor(AMMO[id].capacidade×magazineMult)), capacidade normal com todos os modificadores atuais.
- Cc=max(1,floor(0,75Cn)), capacidade compacta.
- Tn=AMMO[id].recarga×reloadMult, duração normal com todos os modificadores atuais.
- Quando ativa: C=Cc e T=0,8Tn×Cc/Cn.
- Recarga parcial: Tparcial=(C−ammo)/C×T=0,8Tn×(C−ammo)/Cn.

Assim T/C=0,8Tn/Cn mesmo com arredondamento. Isso comprova eficiência da reposição, não um percentual universal deDPS sustentado: tempo de disparo, capacidade menor, rajadas, latência do tick, recuperação e efeitos de recarga continuam influindo no ciclo completo.

Exemplos sem outros modificadores:

| Arma | Cn | Cc | Tn | Tcompacta cheia |
|---|---:|---:|---:|---:|
| Metralhadora |24|18|1,4s|0,84s|
| Escopeta |6|4|2,2s|1,173333333s|
| Canhão de precisão |3|2|2,6s|1,386666667s|
| Arpão |2|1|2,4s|0,96s|
| Foguetes |1|1|4,8s|3,84s|

No limite mínimo1, a capacidade não pode cair mais, mas o ganho de reposição continua20%. Não arredondar a duração para fins mecânicos; formatação daHUDé apenas textual.

### Transição sem descarte

Aquisição marca compactPending=true em cada slot, sem mudar ammo, magazineMult, reloadMult, reloadTime, reloadTotal, reloadMissing ou reloadCapacity. Não ativa retroativamente durante uma recarga corrente. Essa recarga continua terminando pelas regras anteriores.

Enquanto pendente, magazineSize/reloadDuration continuam normais. R/autorrecarga sópodem ativar o novo conjunto quando:

1. Estado playing.
2. Sem recarga ativa.
3. Há munição faltante pelo limite vigente.
4. ammo<Cc.

Se ammo>=Cc, a tentativa é recusada sem som de recarga, descarte, limpeza de Culatra, cura ou mudança de estado. AHUDorienta consumir atéCc−1. Ao aceitar, compactPending=false e compactActive=true ANTES de capturar a nova recarga. O início usa Cc/Tcompacta e preserva os cartuchos restantes. Exemplo: metralhadora com20ou18recusaR; com17inicia reposição de1em0,84/18s.

Cada slot ativa independentemente. Uma arma pode estar compacta enquanto outra continua pendente.

Depois de ativa, módulos e reforjas posteriores compõem com Cn/Tn atuais. Não congelar o teto da aquisição: Depósito Ampliado e Esteira continuam úteis. As regras antigas de clamp ao instalar modificadores normais continuam existindo; a peça não cria uma exceção geral que preserve munição acima de um novo limite provocado por outro módulo.

Uma recarga já iniciada conserva seu timer/capturas. Mudanças posteriores não reescalam reloadTime/reloadTotal. A conclusão usa a regra geral existente de capacidade atual e fração realmente reposta; não foi criada uma nova política de snapshot para todas as recargas do jogo.

### Interações

- Cura de recarga conserva fração efetiva e divisão porNarmas. Mais velocidade de reposição pode aumentar frequência de reparos, mas não concede cura de carregador cheio por repor uma bala.
- Reposição por abate/eletricidade durante recarga reduz a quantidade realmente reposta no fim e, portanto, a fração de cura/Pistão. Não termina nem encurta o timer corrente.
- Lâmina mantém seu orçamento integrado durante a duração efetiva: recarga mais curta significa janela de corte menor.
- Pistão mantém capturaPno início e fator de fração na conclusão.
- Culatra continua contando cartuchos emitidos;Rrecusado não limpa carga, Riniciado limpa como antes.
- Pulso de Integridade continua nascendo somente do último cartucho consumido, uma vez, antes da autorrecarga.
- Teto400recusa emissão sem munição/carga/pulso; não desvia para uma emissão gratuita.

## Dínamo de Recuperação

ID recoveryDrive. Elegível somente com killAmmo instalado ou especialização chargeRecovery escolhida. Arma elétrica intrínseca, dano elétrico ou ter magnet sozinho não satisfazem essa condição.

Fontes válidas:

- killAmmo: a décima morte válida tenta devolver1à arma da origem.
- chargeRecovery: limiar de6alvos que perderamHPpor descarga, com cooldown existente0,25s; tenta devolver1à arma da origem.

Origem semslot recai na principal, conforme contrato anterior. Origem auxiliar não transfere ganho à principal.

recoverWeaponAmmo(slot,amount,source) exige playing, HP>0, slot pertencente ao arsenal atual e amount positivo finito. Munição é limitada à capacidade vigente. gained=max(0,ammoDepois−ammoAntes). Sófontes killAmmo/chargeRecovery, com gained>0 e peça adquirida, alimentam oDínamo.

Por slot, o estado é recoveryDrive={stacks,until}. Ganho positivo:

1. Se o prazo anterior expirou, considerar0estágios.
2. stacks=min(5,estágiosVálidos+gained).
3. until=clock+4.
4. Cue ammoCharge somente se o número de estágios aumentou; refresh no teto é silencioso.

Leitura válida exige clock<until. No instante de igualdade, expirou. Nãohá decaimento por estágio: todos terminam juntos. Renderização consulta sem alterar o estado. Um novo ganho depois da expiração recomeça do ganho atual, sem restaurar5antigos.

Fórmula:

intervalo=slot.rate/(3seSobrecargaAtiva;senão1)/(1+0,04estágios).

No teto5: cadência×1,20; intervalo÷1,20, isto é, redução de16,6667%no intervalo. Não descrever como intervalo−20%ou cadência+25%.

O novo fator sóé lido quando fireInterval éconsultado para um disparo futuro. Cooldownjáprogramado e delays0,075/0,15s da rajada atual não são reescritos. Ganho numa fase posterior do quadro não cria tiro retroativo.

### Eventos que não contam

- Tentativa em carregador cheio: gained0, sem estágio, renovação oucue.
- Instalação da peça ou de equipamento.
- R, recarga automática e preenchimento ao concluir.
- Refundou source omitida/desconhecida, embora o helper possa repor munição legitimamente sem alimentar a peça.
- Pellet, descarga ou abate sem reposição efetiva.
- Morte de lacaio removido pelo chefe.
- Fonte de dano excluída dos contadores de munição pelo contrato vigente.
- Chamada em pausa, oferta, garagem, morte ou comslot de tentativa antiga.

Um mesmo abate elétrico pode atingir killAmmo dentro de damageEnemy e depois chargeRecovery em shockAt. São dois eventos legítimos se ambos adicionarem munição. Se sóhavia um espaço, o segundo ébloqueado e não conta. Se havia dois, contam dois. O teto local5continua valendo.

Escudo que absorve dano elétrico não aumenta electricHits: o corpo não perdeuHP. Não contar número de arcos desenhados como número de balas recuperadas.

## Ciclo de vida e apresentação

Clockavança somente em combate ativo. Pausa/ofertas congelam o prazo. Morte/garagem removem recoveryDrive de todos os slots; reset cria slots novos sem as duas peças/flags. Não salvar esses campos no perfil permanente.

HUDusa as linhas existentes: pendente mostra COMPACTO: CONSUMA ATÉX; Dínamo mostra estágios/próxima expiração junto da arma receptora. Diagnóstico da pausa explica estado/fator por slot. Sem novo botão ou medidor global. A cadência resumida da primária passa a usar1/fireInterval, incluindo o fator efetivo.

Carddo Compacto informa explicitamente o custo de capacidade, inclusive no compêndio. O cabeçalho de baú não promete que toda peça ésem penalidade. Peças antigas semcostcontinuam mostrando SEM PENALIDADE. Ícones próprios: assets/skills/compactFeed.svg e recoveryDrive.svg.

Áudio ammoCharge: toque triangular330→440Hz/0,06s, amplitude0,018, throttle próprio0,15s e limite geral de vozes/mute existentes. Não usaRNGde combate. Ganho no teto sórenova prazo e não repete cue.

## Casos de aceitação

| ID | Preparação/ação | Resultado esperado |
|---|---|---|
| AMC01 |PeçaDínamo semfonte, depoiskillAmmo/ouprotocolo |Elegibilidade sócom fonte real, semmunição/bônusna aquisição |
| AMC02 |12armas, adquirirCompactocomammo cheio |Munição/capacidade/timerpreservados;PENDING |
| AMC03 |12armas, próxima recarga vazia |Cc/Tfórmula;T/Cexatamente0,8da razão normal |
| AMC04 |Metralhadora20/18/17eCc18 |Rrecusa20/18;17repõe1sem descarte |
| AMC05 |Rrecusado comCulatra7 |Carga7preservada, semcue/cura |
| AMC06 |Adquirir no meio da recarga |Recarga antiga não retroage; nova podeativar |
| AMC07 |DepoisDepósito/Servo/Esteira |Capacidade/tempo compõem sem teto congelado |
| AMC08 |3slots, ativar sósecundária |Outras continuam pendentes, estados locais |
| AMC09 |Recarga parcial,NANO/reparo,Narmas |Cura por fração efetiva/N, semgratuidade |
| AMC10 |Décimo abate originado noauxiliar |1munição/estágio somente nessa arma |
| AMC11 |Recuperação comcarregadorcheio |0estágio, sem renovar prazo/cue |
| AMC12 |Abateelétrico com1ou2espaços |1ou2ganhos, respeitando cap real |
| AMC13 |Escudo e sextohit elétrico nocorpo |Escudo não contaHP; corpo libera1no limiar |
| AMC14 |8ganhos,novo no teto, expiração |Cap5,refreshpositivo, igualdade de4sexpira |
| AMC15 |R/autorrecarga/refund/sourceomitida |SemDínamo |
| AMC16 |Sobrecarga eDínamo3/5 |Multiplicadores independentes, não somarpercentuais |
| AMC17 |Cooldownjácapturado/rajada ativa |Sem reescrever timer/delays antigos |
| AMC18 |Reposição durante recarga |Timerigual,menorfração decura/Pistão |
| AMC19 |Compacto+Culatra+Pulso/400 |Cartucho real único;sememissãorefusada |
| AMC20 |Pausa/oferta/retomar/retrato |Semtempo/carga/tiroindesejado |
| AMC21 |Render/HUDcomRNGlançando |SemRNGoumutação mecânica |
| AMC22 |Slotobsoleto/inativo/morto |Semmunição/estágio/cue |
| AMC23 |Morte/garagem/reset/save |LimpaDínamo,nenhumtemporáriopersiste |
| AMC24 |NaN/Infinity/negativo nohelper |Recusa eestadofinito antesdeJSON |
| AMC25 |108mundospareados semnovaspeças |Mesmamunição/recarga/dano/RNGdaBUILD65 nosescoposcomparados |
| AMC26 |3viewports,cards/teclado/mouse/toque |Custo claro,HUDlocal,semoverflow/controlespresos |
| AMC27 |Cuepor estágio/teto/mute/spam |Sóganhosválidoscomsubidadeestágio;limites/gestopreservados |
| AMC28 |Partidas naturais fontecongelada |Todas tentativas preservadas, semoffer/poderforçado; braçosseparados |
| AMC29 |Slotantigo com1estágio, reset e readquirirDínamo |Consulta retorna0mesmo com relógio compatível e relíquia novamente presente |

## Evidência e limites atuais

tests/ammo-cycles.cjs passou19grupos funcionais, incluindo12armas. tests/ammo-recovery.cjs comparou108combinações de arma/slot/espaço com a fonte publicada65 para ambas fontes reais e seus estados/RNG, sem peças novas. Não é equivalência global nem preservação do defeito antigo de chamadas inativas ao helper.

Revisor identificouP2na consulta de estágio de objeto obsoleto: depois de reset/readquirir a peça, objeto antigo ainda retornava1. O novo caso falhou antes da correção e passou após exigir pertencimento a weaponSlots também na leitura. Reprodução negativa preservada em outputs/ammo-engine66/stale-query-pre-fix.json; não foi necessária mudança nos gatilhos de recuperação.

Três falhas iniciais de fixture foram preservadas: alias inexistente reloadTotal, nome inexistente applyWeaponEvolution e expectativa de delays0,065/0,13em vez dos reais0,075/0,15. Corrigir expectativas conforme APIs/valores vigentes não mudou produção nem enfraqueceu a regra.

O agente de áudio identificou ainda um erro de fixture: shockAt recebe4argumentos, e a chamada inicial com5ignorava a origem explícita no último parâmetro. Os testes pareados e de engine foram corrigidos para a assinatura real e repetidos; o pareamento108continua passando com origem elétrica correta nos3slots. O registro anterior ficou preservado, sem usá-lo como prova de origem auxiliar.

Navegador controlado passou3resoluções com escolhas legais/custo, teclas/mouse/toque de3dedos, abate real por projétil auxiliar, prazo local, pausa pixel/estado, retrato, morte/reset e catálogo21/107. Inspeção da primeira captura740identificou status7pxdemasiado pequeno; passou a10pxcomwrap/rolagem, e a rodada reforçada mediu fonte≥10px, contagem/timeralcançáveis e ausência de sobreposição dospads. Éemulação protegida/tempo manual, não desempenho ou telefone físico. Histórico pré-fonte e erro inicial de fixture ao medir pads ausentes no desktop foram preservados.

Áudio passou17grupos de eventos/sinal, mais a regressão do grafo real. O parecer estático fechou o achado de consulta obsoleta; inspeção de garagem/combate/pausa pelo Revisor não equivale a uma partida inteira ou avaliação de oferta de experimento que ele não alcançou.

## Avaliação natural intermediária

[Resumo e protocolo](build66-balance-summary.json), [dados brutos e fontes congeladas](data/build66-runs.json.gz) e [análise das ofertas](build66-ammo-analysis.json). Arquivo naturalSHA256be7c3a73b8b84dfbbf63590e39741e9de3feee3065fd417f5c69d75a729ead97,36arquivos recuperáveis, roundtrip/hashes conferidos.

| Braço | Política/sementes | Viabilidade estrita | Aquisição das novas peças |
|---|---|---|---|
| A |10receitas/piloto13canônico, seed6601301 |9/10 |3tentativas,4peças no total |
| B |Tempestade/Oficina × seeds6601321/6601322, prefere alvo somente seoferecido |4/4 |Dínamo nas2Tempestades, Compacto nas2Oficinas e na segundaTempestade |

Todas14sobreviveram1200s e derrotaram pelo menos3chefes. Lança de Fuga6601301terminou comHP86,6667,7chefes e nível18, mas sem repair: magnet sóveio aos670,55s/nível15, e repair nunca apareceu nas ofertas normais registradas, inclusive após a raiz. O observador não perdeu ofertas. Essa tentativa permanece falha e no denominador, sem trocar semente/receita/piloto ou forçar o nó. Isso não demonstra um defeito global da progressão nem autoriza enfraquecer os critérios finais.

Não há invulnerabilidade, HP/cura/dano oculto, oferta forçada, concessão de relíquia, remoção de vivos ou suspensão da horda nas naturais. Somente equipamento foi pré-desbloqueado. O braçoBnão substitui o resultadoA. Sementes finais reservadas não foram usadas.

Os dados registram aquisição/atividade normal, sem novo wrapper para uptime das peças: não comprovam sozinhos quando Compacto ativou ou por quanto tempo cada Dínamo ficou ligado. Engine/browser testam esses gatilhos separadamente. Não atribuir dano total, sobrevivência ou diferença entre rodadas causalmente às peças. Ainda faltam matriz final30, estabilidade60min, medições reaisPC/telefone e os demais motores compatíveis.

## Regressão e evidência recuperável

[Arquivo de QA controlado](data/build66-qa.json.gz) preserva56arquivos com caminho/bytes/SHA256/conteúdo recuperável, incluindo testes, baseline65exata, resultados atuais/negativos, capturas antigas/novas, áudio, pareceres e gerador. Descompressão e hashes restaurados conferidos. Naturais ficam no arquivo próprio, sem misturar seus braços.

A regressão ampla executou41comandos:40passaram inicialmente e o check-release recusou o cabeçalho textual do mapa, cujo novo formato não correspondia à regra exigida. O cabeçalho foi corrigido, sem enfraquecer o verificador. Quatro complementos repetiram rótulos/especificação e os dois testes de engine após corrigir a assinatura da fixture elétrica. O manifesto efetivo reúne41resultados aprovados e confere hashes de cada verificador e todas as fontes congeladas; o manifesto original com falha continua preservado.

Pacote e publicação precisam de confirmação final da candidata. A meta permanece EM DESENVOLVIMENTO.
