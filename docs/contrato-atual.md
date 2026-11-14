# Contrato vigente — Screwvivors BUILD 66


## Candidata66 — ciclos de munição

Alimentador Compacto adia capacidade reduzida até próximo início válido de recarga por slot: Cc=max(1,floor(0,75Cn)), ammo<Cc, T=0,8Tn×Cc/Cn. Sem cortar munição ou alterar recarga corrente; tempo por cartucho reposto−20%, custo explícito em card/compêndio. Dínamo exige fonte killAmmo/chargeRecovery e delta real positivo: fator de cadência1+0,04estágios, máximo5por4sativos/slot, sem recarga/refund/cheio. Cooldowns/rajadas antigos preservados. Estado temporário isolado de save/reset; custo/limites/29casos no [contrato](ciclos-de-municao.md). Catálogo21/107, editor86/revisão7. Validação intermediária não aprova meta final.

Estado: candidata local BUILD66 em desenvolvimento. Publicação anterior confirmada: BUILD65, 03a77f7772a4569ef0f4ce54ec993752ca494d21. A meta aprovada e os gates de conclusão permanecem ativos; versão na tela não é aprovação pública ou encerramento.

## Adição candidata — BUILD65

Acoplamento Vital (`vitalLink`, exige drone) soma min(baseDoDrone,HPatual×0,025) por ataque, antes de foco no chefe; arco usa captura anterior a eventuais curas. Sem consumir vida ou criar drones/cadência. Pulso de Integridade (`integrityPulse`, universal) nasce do último cartucho realmente emitido, depois dos pellets e antes da autorrecarga: danoHPmáxima×0,20/Narmas em raio90considerando corpo. Não nasce deR/completar recarga/pellet; teto400recusa sem custo. Fonte própria não passa por impacto balístico/killAmmo/salvage, preservando globais de alvo/loot/morte de reagente preexistente.

Correções de fase terminal: drones não executam após morte/fora deplaying; atração/coleta/gravação de loot somente emplaying, sem desfazer recursos já coletados. Reproduções anteriores produziam abates ouXP/parafusos apósHP0; novas regressões do tick integrado bloqueiam ambos.

Inventário19relíquias/105compêndio; painel86/revisão7permanece. Engine22grupos, browser3viewports e áudio são evidências parciais. Matriz natural atual A10/10canônicas eB4/4experimentais na fonte corrigida, com peça-alvo ausente em1Oficina; não juntar a rodada pré-correção às atuais como28sucessos. Regressão/pacote devem ser conferidos por hashes próprios. Nenhum gatefinal é presumido. [Fórmulas e casos](conversoes-vitais.md).

## Adição histórica — BUILD64

Pistão de Retorno (`reloadPiston`) é a17ªrelíquia universal de baú. CapturaPnormal do cartucho, limitado1e9, no início de recarga válida após adquirir; ao concluir, invoca somente com direção manual finita/não nula. Dano0,9P×fração realmente reposta; movimento reto360px/spor0,6s/216px, raio10, até3corpos uma vez; umporarma, substituído na próxima invocação. Sem procs balísticos/munição, com globais/loot/recompensas únicos. Entidade antiga avança até a fronteira da conclusão, nova sópelo residual. Origem/mira são amostradas antes do movimento/câmera daquele quadro: limitaçãoP2de defasagem visual em movimento rápido registrada, sem alegar interpolação contínua.

Engine17grupos, navegador3viewports/12armas/3slots/3dedos e áudio tiveram resultados controlados aprovados nas fontes registradas. Natural intermediária A10/10viáveis eB4/4viáveis;Pistão adquirido/usado em2casosA e4B. Não é matriz final30, desempenho nem aceiteG01total. Inventário17relíquias/103compêndio; editor86/revisão7permanece. [Contrato e casos](pistao-de-retorno.md).

## Adição histórica — BUILD63

Banco de Reserva (`reserveBank`) é raiz normal com proteção inicial20/máxima40 e conversão de50% do excesso de cura; custo de recarga×1,10. Dano mitigado consome Banco antes deHP, com transferência do excedente. Escudo Capacitivo pronto conserva prioridade/absorção integral; impactos aceitos zeram Circuito mesmo absorvidos, mas contatos bloqueados por inv/pausa/morte não. Reações pós-dano exigem perda efetiva deHP. Cura continua retornando somente a parcela deHP, sem protocolos por mero ganho deBanco.

Ponte de Potência (`shieldDrive`, Banco+Escudo) dá cartuchos×1,2 enquanto escudo pronto. Circuito Preservado (`cleanCircuit`, Banco) dá+10% aos15s/+20% aos30s ativos sem impactos, limitado30s e zerado na aquisição/impacto aceito. Fator combinado próprio máximo1,44, não DPS final. Retorno de Varredura (`pulseRecovery`, Banco+Sensor) converte até3abates diretos/pulso em4reserva/−8s de recarga do escudo por crédito, sem premiar estados transmitidos ou lacaios apenas removidos na morte do chefe. Lâmina/Matriz conservam snapshots; suportes continuam fórmulas próprias.

Catálogo candidata:56normais/86editáveis, revisão7;16relíquias/102artigos no compêndio. Os82registros anteriores foram preservados no teste dedicado de migração, incluindo colisões e referências. Engine24grupos e browser controlado3viewports tiveram resultados aprovados nas fontes identificadas; a avaliação natural intermediária teve10/10canônicas e2/4no experimento de preferência, sem aprovação dos gates finais. Banco foi adquirido4/4eCircuito1/4no experimento; Ponte/Retorno não apareceram como aquisições e uso/consumo não foi medido. [Fórmulas, ordem de dano, UI, migração e24casos](reserva-e-manutencao.md). Valores são hipótese experimental, não equilíbrio aprovado.

## Adição publicada — BUILD62

LÂMINA DE RECARGA (`reloadBlade`) é a16ª peça universal temporária de baú. Segurar o disparo com mira manual durante uma recarga efetiva ataca uma cápsula frontal por arma, segmento36..110px da origem deslocada do slot, raio12. Recarga válida iniciada após adquirir captura P=clamp(shotDamage×pellets planejados,0,1e9). Dano integrado por intervalo: P×a×(0,6+0,3×(u0+u1)); DPS0,6P→1,2P, orçamento de janela inteira0,9PT. Recarga parcial conserva proporcionalidade; adquirir no meio não aplica retroativamente. Reforja conserva timers atuais e P; modificadores novos sóna próxima recarga.

Fonte reloadBlade não executa impacto/procs/munição/salvage; preserva globais de dano, XP/loot/célula e recompensa/cura de chefe. Sem botão novo; HUD por arma. Validada funcionalmente em engine/browser. Natural62 congelada pré-correção finita: canônico9/10viáveis; experimento de preferência1/4viável, embora uso positivo4/4. Fonte atual troca somente inicialização de cue para valor finito, com prova controlada de equivalência; sem aceite final. Inventário16/98 confirmado por extração VM viva; editor82. [Contrato completo e casos](lamina-de-recarga.md). Katana ao fim da recarga continua pendente. Evidências61 abaixo permanecem históricas.

## Adição histórica — BUILD61

Matriz de Rebites (`rivetMatrix`) é a15ªrelíquia universal de baú. Após adquirir, o jogador usaE ou ação de toque e um ponto de mira manual entre 48 e 180 px para instalar uma estação fixa por 18 s, no máximo uma. O referencial P é o dano normal do cartucho completo da arma primária ao implantar, limitado a 0,001..1e9; limiar2P/capacidade4P. Balas que realmente entram no aparelho são consumidas e somam somente seu dano capturado, respeitando orçamento compartilhado por cartucho. Pellets não multiplicam esse orçamento; cada subdisparo consumidor de munição de uma rajada é distinto.

Cada salva consome 2P e emite três rebites de direção fixa,0/0,6/1,2s após o contato, orçamento bruto total2,2P, sem homing ou procs balísticos. Até três salvas iniciadas; ataques compartilham o teto400com as balas do jogador. Cap cheio antes de iniciar conserva energia; falta de vaga durante salva descarta restantes sem reembolso/backlog. Perfuração sobrevivente anterior pode chegaràentrada no mesmo segmento; terminal/ricochete anterior impede; corpo vence empate. TTL/expiração vencem empate e timestamps absolutos preservam apenas a idade residual dos projéteis novos. Pausa congela; morte/garagem limpa estação/rebites e reset remove a peça.

Inventário histórico61:15relíquias/97artigos de módulo/relíquia; editor continua82. Fonte matrix usa dano central, preserva XP/loot/célula global e recompensa de chefe, mas não executa impact, estados/procs manuais, killAmmo ou salvage. [Fórmulas, tabela das12armas, apresentação e casos](matriz-de-rebites.md). Implementação em verificação; não aprova balanceamento, desempenho ou os gates finais.

## Adição vigente — BUILD60

Culatra de Ruptura é a14ªrelíquia universal de baú. Cada cartucho realmente gasto armazena uma carga por slot, até60. O último cartucho recebe dano×(1+0,25×cargas incluindo a atual), captura o fator nos pellets e consome a reserva antes da autorrecarga. Recarga antecipada só descarta quando inicia de fato; bloqueio400, tentativa recusada e reembolso não geram carga. Instalar não muda munição/recarga/HP; reset recria slots sem energia. Catálogo editável82, compêndio96; pico máximo16×é do último projétil, não DPS sustentado.

Correções de contrato na BUILD60: shockAt captura a proteção antes do dano e impede novo atordoamento no alvo elétrico blindado, inclusive na quebra;14fixtures específicas passaram. No impacto, o estado blindado é capturado antes do golpe; corrosão e estados/empurrão não se aplicam quando havia escudo, inclusive no golpe da quebra. A fonte anterior falha na reprodução;17fixtures e regressões específicas passaram na candidata. A referência histórica usada na equivalência identifica explicitamente essa correção, sem alegar preservação do defeito antigo.

## Adição vigente — BUILD59

Colimador de Campo é a13ª relíquia temporária de baú e alternativa universal. Primeiro campo ao apontar, depois a cada6s ativos; círculo raio36 a96px à frente, fixo por4s. Cada projétil que entra ganha dano×1,35 uma vez, sem nova munição/procs/tiros/autoaim. Contato anterior ao campo conserva dano base; fim da vida vence empate com entrada. Pausa/morte/ofertas congelam, reset elimina. Catálogo editável82 e compêndio95. [Regras e provas](colimador-de-campo.md).

## Adição vigente — BUILD58

Baia de Comando preserva dano×1,5/alcance×1,2 imediato e calibra drones após30/60/90s ativos desde sua aquisição. Fator temporal1,1/1,2/1,3, máximo próprio1,95vezes o dano pré-peça; pausa/ofertas/morte não contam e reset remove tudo. Sem novos drones, procs de bala, bônus permanentes ou aumento do catálogo. LEDs e pausa mostram estágio/dano. Partículas finais600 e feedback100 mantêm saída e RNG após tick, com armazenamento/formatacão otimizados. [Contrato detalhado, testes e limites](maturacao-e-desempenho.md).

Este documento e o código atual prevalecem sobre descrições históricas das entregas anteriores. O plano de integração mantém o histórico para rastrear decisões; regras antigas de população ilimitada, quatro zumbis por onda, pausa da horda em chefe ou uma renovação por tentativa não estão vigentes.

| Área | Regra que deve permanecer | Evidência automatizada |
|---|---|---|
| Identidade | Gato piloto, robôs, cidade industrial do Dr. Biruta; assets próprios e interface ciano. Não copiar conteúdo da referência. | Inspeção de assets e QA visual; testes de identidade em combat.cjs. |
| Arena | Sem bordas, vitória cronometrada ou encerramento aos 20 minutos. | combat.cjs: movimento sem limites e cenário controlado de 25 minutos. |
| Controle | Mover, mirar e disparar manualmente. ESPAÇO exige skill; avanço não concede invulnerabilidade. | combat.cjs: emissão, liberação, foco, movimento e avanço. |
| Dano recebido | Empurrão de 48 px para longe da fonte; direção de fallback. | combat.cjs: empurrões opostos e fontes tipadas. |
| Horda | Grupos de até15 fora da tela; limite comum60 +12/minuto, máximo180. Reposição por tempo, oito abates ou deslocamento320px com baixa presença local; intervalo mínimo3s entre grupos. Perseguidores distantes podem reentrar fora da tela preservando vida/escudo. Chefes e lacaios têm agenda própria. | horde-director.cjs: teto, gatilhos, deslocamento, pausa/reset e preservação de sobreviventes; combat.cjs: integração e minimapa. |
| Policiais | Só após derrotar o segundo chefe: cinco dos 15, alternando rifle/escudo. Escudo 100 absorve integralmente o golpe de quebra. Só o sobrevivente que perdeu o escudo passa a parar, mirar e correr até 240 px numa direção fixa. Sem aceleração de aproximação nos comuns. | combat.cjs, build-mechanics.cjs e weapon-evolution.cjs. |
| Chefes | Três identidades recorrentes e seus lacaios; Sucateiro acompanha e mantém distância. Peça de garagem salva e cura até20 (40 com Caça-Titãs). Baú físico no local da derrota oferece uma entre atétrês peças raras elegíveis; efeito sóaté o fim da partida. Ao esgotar peças elegíveis, oferece experimento antigo e, após esgotá-los, módulo comum. A oferta pausa a simulação; a luta não pausa novas ondas. | combat.cjs: agenda, ataques, recompensas, minions e repetição. |
| Perfil | Parafusos coletados e peças conquistadas permanecem ao morrer. Sem bônus permanentes de atributo. Compras verificam saldo/peça e devolvem recursos em falha de gravação. | combat.cjs: compras, saves, migração e morte. |
| Equipamento | Seis chassis e12armas:um espaço por padrão, BAST permite até2armas e ENXA até3, opcionais, distintas e desbloqueadas. Duas usam dano×0,7 por arma/movimento×0,9; três×0,55/×0,8. Escolha na garagem, conjunto e chassi fixos durante combate. Novos chassis não são concedidos pela migração de perfil antigo. | combat.cjs, build-mechanics.cjs e Chrome. |
| Progressão | XP inicial 6, crescimento ×1,2, coleta inicial 95. Catálogo de86aprimoramentos:56normais, seis gambiarras, seis experimentos e18especializações. | balance-panel.cjs e build-mechanics.cjs. |
| Ofertas | Gambiarras nos níveis 3/6/9; especialização do chassi no nível 10. Uma renovação por nível normal; renovar não recarrega a própria carga. Reforja no nível 20. | combat.cjs, build-mechanics.cjs e weapon-evolution.cjs. |
| Reforja | Duas opções próprias de cada arma, escolher uma ou recusar por espaço, em sequência pausada. Substitui o módulo do nível20. Não troca/funde arma, repõe munição, termina recarga ou modifica projéteis já emitidos. Não volta após recusa; some ao reiniciar. | weapon-evolution.cjs: 24 opções, estados, callbacks, projéteis e reset. |
| Construção de build | Dez receitas recomendadas; guia não concede equipamento, skills, atributos nem altera sorteios. | builds-balance.cjs, Chrome dos guias e weapon-evolution-browser.cjs. |
| Cura e drones | Cura efetiva ativa protocolos; recarga parcial cura proporcionalmente e divide a cura pelo total de armas equipadas. Até três drones, sem cadeia recursiva de procs. Célula verde a cada 25 abates precisa ser coletada e não vale parafusos. | build-mechanics.cjs. |
| Painel |86skills editáveis; configuração só nas próximas tentativas. Preservar rascunhos/efeitos legados, migrar IDs conflitantes com suas referências e não repetir a migração textual. As 24 reforjas são catálogo próprio de arma, consultável na garagem, e ainda não são editáveis no painel. | balance-panel.cjs, balance-migration.cjs e testes do editor. |
| Corrosão | Uma carga por alvo, sem renovar/acumular; origem em bala, respingo de uma geração para dois vizinhos; escudos bloqueiam aplicação. Cura, explosões, drones e raios não semeiam cargas. Prazo e dano capturados na aplicação; pausa/morte/reset interrompem a tentativa. | corrosion.cjs, corrosion-balance.cjs e Chrome. |
| Sensores | Pulso adquirido, 3s/raio170/35% da base direta, sem projétil ou munição. Relé só fogo/frio; exposição2s amplia apenas balas em25%. Escudos bloqueiam estados. Sem skill, não percorre horda; pausa/reset preservados. HUD móvel comporta seis timers. | sensors.cjs, sensors-browser.cjs e sensors-balance.cjs. |
| Rotores |Dois discos por contato, terceiro opcional, uma oportunidade por alvo/disco/período. Sem munição ou efeitos de bala; escudos absorvem o golpe de quebra. Órbita é faixa, com varredura contínua e sem backlog. Raio40–200, volta0,75–12s; pausa/reset e snapshots preservados. | rotors.cjs, Chrome,108cenários, migração78→82 e ensaio natural com falhas preservadas. |
| Animação inimiga |Três atlas originais96quadros/quatro direções; inclui Brutamontes e perseguidor pesado. Distância percorrida avança a passada; parado/atordoado mantém fase e idle, pausa não avança. Render não usa RNG, altera posição ou retira vivos. Policial armado/escudo, badges e estados preservados. | enemy-animation.cjs, enemy-animation-physics.cjs e Chrome HTTP/file/fallback. |
| Cache de desenho |36atlas imutáveis no máximo, seis classes cosméticas de tamanho; raio físico exato preservado. Sem API de bitmap, fallback legado; erro de um atlas não derruba os outros. Flash compõe só alfa do sprite. | enemy-animation.cjs, Chrome, build47-render-bench.json; custo de combate extremo ainda pendente. |
| Arma empunhada |12modelos próprios em Canvas, mira manual, mãos, recuo e gesto de recarga. Relógio visual só no tick; pausa congela e tiro cancelado não recua. Sem alterar munição/dano/trajetórias. | player-weapons.cjs e Chrome12armas/mira esquerda-direita. |
| Animação dos demais chassis |Cinco identidades raster originais/160quadros, quatro direções, retratos e pivôs medidos. Fallback para SVG próprio e depois legado; relógios só no tick, pausa/reset preservados. Sem alterar atributos/equipamento. | chassis-animation.cjs e Chrome HTTP/file/falhas. |
| Visuais dos chefes |Sucateiro/Bobina com passada, preparação e recuo após transição real de ataque; helper não altera agenda, física, dano ou RNG. Brutamontes mantém atlas pesado. Pausa congela. | boss-visuals.cjs, Chrome e seis mundos enemy-animation-physics com helper habilitado. |
| Animação PROT | Atlas original32quadros, quatro direções, pivô por quadro e pés em y+28; simulação controla o relógio e pausa congela. Falhas de imagem/helper/manifesto mantêm o desenho estático. Hitbox e atributos preservados. | sprite-animation.cjs, prot-animation.cjs e Chrome HTTP/file com três fallbacks. |
| Áudio | Synthwave suave nas cenas;12 timbres e eventos reais de reparo, sensores, corrosão, drones, escudos, recarga e chefes. Sem RNG de combate; gesto inicial, mute e limites de vozes preservados. | audio.cjs, audio-gameplay.cjs e render offline de sinal. |
| Consultas de área | Índice temporário apenas na fase de projéteis, invalidação antes do movimento, ordem original dos alvos e desempates estáveis. Não descartar nem limitar vivos. | spatial-runtime.cjs:18mundos iguais à busca linear e ordenação integral, inclusive efeitos e sequência aleatória. |
| Pausa/entrada | Ofertas e pausa congelam simulação; callbacks antigos não aplicam escolhas. Retorno limpa teclas, disparo e rajadas pendentes. | combat.cjs e weapon-evolution.cjs. |
| Canais | main acompanha desenvolvimento para o ZIP. codex/publico é independente; publicApproved continua false até aprovação real. | version.json, git ls-remote e docs/canais-e-lancamentos.md. |

Os números novos são experimentais. Testar funcionamento não aprova balanceamento ou qualidade humana. A bancada instala pacotes explicitamente; a avaliação de progressão não pode ganhar atributos escondidos, invulnerabilidade, morte programada de chefe ou remoção de inimigos vivos. Guardar resultados negativos e identificar sementes, fontes e driver. Não reduzir a meta de avaliação depois de observar falhas.

## Pendências do objetivo de integração

A meta geral permanece ativa. Evolução de arma deixa de ser pendência de implementação na BUILD 41, mas seu balanceamento exige avaliação mais ampla. A [reavaliação das dez builds da BUILD 41](reavaliacao-build41.md) foi concluída, preservando falhas. A BUILD 42 revisou a [Lança de Fuga](ajuste-lanca-de-fuga.md) por comparação de seis sementes. Continuam pendentes a melhoria das demais receitas frágeis, balanceamento de corrosão/sensores, aprofundamento de suportes invocados e a avaliação dos equipamentos avançados com múltiplos espaços. Corrosão foi implementada na BUILD43 e sensores na BUILD44; drones/sensores/rotores e os espaços adicionais já foram implementados; integração de balanceamento e acabamento continuam pendentes.

Não importar vitória cronometrada, retenção de skills após morte, runas com atributos permanentes ou fusão de armas: entram em conflito com decisões explícitas do criador. Ranking, nuvem e conquistas precisam de etapa própria de plataforma e integridade; o protótipo permanece local.

## Regra de ajuste — BUILD 42

Experimentar receitas por JSON isolado antes de mudar o catálogo do jogo. Comparações exigem mundo, configuração, driver, janela e sementes compatíveis; guardar todas as hipóteses e falhas. Definir critério de adoção experimental antes de inspecionar resultados completos e verificar também sorteios separados da exploração. Uma melhora relativa não transforma uma morte antes do limite em aprovação da meta de 20 minutos. O painel de 70 skills, preços e atributos globais permaneceram iguais nesta etapa.

## Regra de corrosão e migração — BUILD 43

Cargas capturam dano/prazo e têm uma geração de respingo, sem renovar por impacto ou gerar novas cargas por proc secundário. A referência da carga é capturada no início do tick; filhos só envelhecem no próximo. Escudo absorve inclusive o golpe que o quebra, sem marcar corpo. Remover lacaios antes de avaliar respingo do chefe. Mudanças no painel só no próximo reset, sem reescrever cargas em andamento. catalogRevision3 preserva configurações 1/2 e renomeia colisões conforme a revisão de origem, incluindo condições vazias. Cartas padrão usam texto de ganho/custo autoral; números editados permanecem identificados. A nova raiz altera sorteios: resultados antigos não aprovam automaticamente o pool novo.

## Regra de sensores — BUILD 44

Relé compartilha somente fogo/frio, preservando o caminho original de impacto da arma. Sensor não cria projéteis, gasta munição, consome Carga de Reparo ou avança crítico. Exposição só amplifica source=bullet; não entra na captura de corrosão. Golpe de quebra do escudo não aplica estados ao corpo. Pulso respeita todos os corpos no círculo, sem teto artificial; sem backlog ao retomar. Cadastro de novas skills precisa declarar sua primeira revisão em catalogIntroductions, preservando colisões de IDs antigos mesmo com condição vazia. Primeira carga de um sensor editado usa os valores do snapshot. Atualizações do painel continuam só no próximo reset.

## Regra de suporte orbital e revisão5 — BUILD49

Novos IDs declaram catalogIntroductions=5. Preservar os78módulos de origem e colisões customizadas com requisitos/sinergias, mesmo quando condition está vazia. Editor lê a revisão da API ao gravar/exportar. Rotores não transformam a arma em automática, não ativam seus procs e só usam a base direta; regras globais de dano/morte continuam válidas. Contatos por segmento recebem uma margem de curvatura de até0,43px, sem teto de alvos. Um intervalo longo não gera fila de dano; campos de fase usam módulo antes da multiplicação para continuar finitos. O pool82 precisa de nova avaliação natural: dois ensaios do suporte falharam no critério1200s+3chefes.

## Regra de otimização dos choques — BUILD50

A consulta espacial deve devolver os mesmos vizinhos vivos, na mesma ordem por distância e desempate pela lista original. Inserções após empurrão permanecem consultáveis. Fora da fase de projéteis, em populações pequenas ou coordenadas inseguras, usar busca linear. É proibido limitar alvos vivos, dano ou efeitos para reduzir custo. A consulta não altera entidades nem consome RNG.

## Arsenal avançado — BUILD51

BAST mantém uma arma por padrão e admite segunda; ENXA admite segunda e terceira. Capacidade é recurso do equipamento desbloqueado, sem mudar inventário ou conceder atributos permanentes. Reset valida capacidade, posse e duplicatas. Guia de receita limpa auxiliares para corresponder ao projeto anunciado. Nenhuma troca ou fusão em campo.

Cada arma conserva munição, recarga, fila de rajada, contagem para crítico, recuo, cadência e reforja. Todas usam a mira/disparo manual. R inicia somente as recargas necessárias. Cura de recarga é dividida por quantidade equipada; callbacks de vida/movimento/suportes rodam uma vez. Modificadores numéricos do painel afetam cada base de arma; operações aditivas e limites também são locais. Drones, sensores e rotores continuam derivados da principal, sem somar as bases de três armas.

Projéteis capturam descritor/traços de reforja e base direta da origem. Reposição por abate/eletricidade retorna uma única munição à origem; fontes sem arma usam a principal. Queimadura mantém a origem do DPS dominante, corrosão/respingo preservam origem escalar sem reter grafos de entidades. O limite existente400de projéteis é compartilhado, com prioridade rotativa em arsenais múltiplos. Soltar/cancelar ponteiro elimina imediatamente todas as rajadas; pausa congela todos os estados.

No20cada arma recebe uma oferta própria, escolher/recusar avança para a próxima sem tempo transcorrer. Uma versão antiga do callback não pode afetar a arma seguinte. Estado de recarga, munição e projéteis antigos permanece intacto. O catálogo permanece82/revisão5. [Regras, evidência e limites](arsenal-avancado.md).

## Poder de arma — BUILD52

Alto Impacto dobra dano sem piorar cadência; Overdrive triplica cadência sem reduzir dano; Perfuração acrescenta dois alvos sem reduzir dano; Depósito Ampliado triplica carregador sem aumentar recarga e conserva reposição por dez abates. Instalar não repõe munição. Revisão6 migra apenas defaults antigos intactos e preserva configurações editadas. Ver positive-weapon-upgrades.cjs.

## Baús e bot — BUILD53

Na BUILD53 eram12peças raras/94entradas; na BUILD59 são13/95. Continuam fora do pool normal e do catálogo editável82. Sem repetição por tentativa, coleta até40px, sem atração automática/expiração. Escolhas1–3 ou botão; R recusa. Perfil não recebe atributos. Bot sócarrega pelo launcher/CLI e usa contexto isolado. Driver11 passa a procurar baús; não comparar resultados diretamente com driver10 como pareamento. Projéteis desenham o snapshot da arma emissora, inclusive armas auxiliares e tiros anteriores a reforjas.

## Testador — BUILD54

Driver13 avalia a aproximação imediata de baús: integridade ao menos35%, distância até1200px e corredor imediato de70–130px sem inimigo vivo a menos do raio+32px. O objetivo de baú usa peso0,8; ao descartá-lo, retoma XP e ameaças normais. Modo legacy de laboratório reproduz a política anterior para comparação; não altera o jogo normal. Resultados curtos têm viabilidade completa nula. Atributos e mecânicas do runtime continuam os da BUILD53.

## Leitura visual e navegação — BUILD55

Avisos em região de status separada: até2visíveis,4nafila,2,4s de combate, dedup e pausa/reset preservados. Dano agrupa por alvo/fonte/crit em160ms; escudo separado, até3rótulosrecentes poralvo. Móvel tem como alvo gameplay horizontal, com HUDcompacto. Essa etapa cobre layout, não conclui controlesdetoque. Garagem/configuração voltam ao topo e focam seus títulos semrolagem automática atéCTA. Physics/RNG protegidos em32mundos, apresentação em8viewports e navegação em4. Ver feedback-combate.md e coordenacao-chats.md.

## Entrada móvel — BUILD56

Dois direcionais manuais em paisagem, mira unitária fora da zona neutra, sem alvo automático. Cada ponteiro tem ciclo próprio; transições limpam comandos/rajadas e rotação para retrato pausa sem retomada automática. Recarga e propulsor usam as funções existentes; propulsor requer skill. Teclado tem prioridade no movimento, mouse passivo não sequestra mira do dedo e cancelamento só encerra disparo de mouse do ponteiro dono. Ver controles-touch.md.

## Consultas e observação — BUILD57

Cache geométrico das descargas é local à fase de projéteis; indexTarget invalida por movimento, vida é lida em cada consulta e ordem é preservada. Sem nerf nem RNG novo. Instrumentação é exclusiva do testador e deve conservar estado, retorno e próximos sorteios. Perfis de entrada são experiências explícitas, não poderes do jogo nem modelo de habilidade humana. Ver telemetria-e-balanceamento.md e disposicao-sistemas.md.
