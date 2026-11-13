# Conversões Vitais — candidata BUILD65

Estado: desenvolvimento experimental, ainda sem publicação65confirmada nesta revisão. Base anterior publicada64:ed7834ce8d742a1499e9740804d00269ac852daa. Duas peças originais atendem motores diferentes: vida atual ligada à potência real de um suporte; e último cartucho convertido em pulso por vida máxima. Nenhuma delas custa vida, concede atributo permanente, troca arma ou cria vitória cronometrada.

## Inventário e aquisição

| ID | Nome | Elegibilidade padrão | Categoria |
|---|---|---|---|
| vitalLink | ACOPLAMENTO VITAL |droneCount()>0, incluindo drone nativo ENXA |Peça rara específica para suporte |
| integrityPulse | PULSO DE INTEGRIDADE |Universal |Peça rara universal |

Ambas vêm dos baús físicos, sem duplicação na tentativa. Ofertas mantêm até2opções específicas e uma alternativa universal; `integrityPulse` pertence explicitamente à lista universal. A escolha pausa, valida versão/elegibilidade e pode ser recusada. Instalar não altera HP, munição, timers em andamento ou perfil. Efeitos valem somente na tentativa; reset limpa as peças.

Catálogo65:19peças raras e105artigos de módulos/relíquias; painel86editáveis/56normais/revisão7/25atributos permanece. Não chamar essas peças de novas entradas editáveis nem mudar a migração sem necessidade.

## Acoplamento Vital: vida atual para dano dos drones

O suporte continua sendo cada drone real já existente. A peça não concede drone, cadência, alcance, alvo adicional, nova munição ou ataque extra. Apenas acrescenta uma parcela calculada na emissão de cada ataque.

Definições por ataque:

```text
B = player.damage * 0.25 * droneDamageMult * maturityFactor
H = clamp(currentHP,0,1e9)
extra = min(B, H * 0.025)
foco = 1.25 se alvo primário é chefe e droneBossFocus está ativo; senão1
D = (B + extra) * foco
```

`maturityFactor`é a calibração vigente da Baia,1/1,1/1,2/1,3conforme seu contrato. O cap próprio da peça é extra≤B: dano primário próprio até2B, antes do foco e modificadores centrais do alvo. Isso não significa duplicação do DPS total da build. Sem a peça, extra=0e a fórmula anterior fica preservada nas tentativas válidas. HP/base inválidos ou não positivos não produzem bônus.

Exemplos: B=100,HP40→101; HP80→102; HP4000→200pelo teto. Aumentar somente HPmáximo, deixando HPatual40, não aumenta101. Cura efetiva pode recuperar a parcela nos ataques futuros. O cálculo **lê**HP; não consome2,5%, não chama hurtPlayer/healPlayer, não diminui a barra nem gera efeito de reparo.

Cada drone calcula Dantes de atingir seu alvo. Se o abate ativar a cura antiga de ENXA, o arco desse ataque conserva D/2capturado antes da cura. O próximo drone/ataque pode ler a nova HP. O arco conserva também os modificadores da captura original, conforme o comportamento anterior; não recalcular bônus de vida ou foco para cada salto.

A parcela não entra em `shotDamage`, balas já emitidas, sensor, rotores, Lâmina ou Pistão. Não confundir essa conversão direta de HPpara suporte com a conversão balística de Titânico já existente. O dano continua fonte`drone`, com seus globais e escudo; não ganha procs balísticos.

## Pulso de Integridade: último cartucho para ataque de área

O gatilho é o consumo real do último cartucho durante `emitProjectiles`, não um acerto, pellet, teclaR, início/fim de recarga ou desaparecimento de projétil antigo.

Ordem obrigatória:

1. Recusar emissão quando o array já tem400balas, a arma recarrega ou não possui munição. Nenhum pulso/custo nesses retornos.
2. Em emissão válida, capturar `lastSpent=peçaAdquirida && ammoAntes===1`.
3. Executar o consumo normal de1cartucho, contagem, captura balística e criação dos pellets que realmente couberem.
4. Emitir o som normal de tiro. Se lastSpent, produzir **um**pulso.
5. Depois disso, tentar a autorrecarga quando a munição estiver0.

Se há399balas e a escopeta pede5pellets, cabe1pellet, mas o cartucho foi realmente consumido: há1pulso, nunca5. Se há400, não emitir nem consumir. Cada subdisparo consumidor da rajada é um cartucho; somente o que esvazia a arma ativa. Recargas antecipadas descartando cartuchos não ativam.

```text
M = clamp(maxHP,0,1e9)
N = número real de armas equipadas (1,2ou3)
Dpulso = M * 0.20 / N
raio = 90px, considerando também o raio do corpo do alvo
```

A vida atual não participa. Com maxHP300, uma arma dá60por corpo; duas dão30por último cartucho local; três dão20. Se as três armas esvaziarem no mesmo quadro, são3eventos distintos, com soma bruta60por corpo antes dos globais. Não multiplicar novamente pelo número de armas nem pelos pellets.

A origem é a posição do jogador na fase de emissão, depois da atualização de movimento/câmera do tick. A seleção inclui todos os alvos vivos cuja distância de centro é≤90+raioDoAlvo, inclusive chefe, sem teto artificial de quantidade. O dano é instantâneo nessa área; os raios visuais posteriores não são hitboxes móveis nem novas ondas.

Para cada alvo ainda vivo, chamar dano central com fonte`integrityPulse` e origem do espaço emissor. HPmáxima não finita dáD0e não produz efeito. Sem partida ativa ou com jogador morto, não causar dano/efeito. O arsenal válido tem sempre ao menos1espaço.

## Fonte própria, procs e sinergias globais de morte

“Sem procs balísticos” significa não chamar o pipeline`impact`para o pulso. Ele não aplica queimadura, frio, corrosão inicial, descarga, crítico, empurrão, ricochete, fragmentação, Colimador ou alimentação de Matriz. Exposição de sensor continua sópara fonte`bullet`. Não incrementar contadores killAmmo/salvage do pulso.

Preservar multiplicadores centrais por alvo, Caça-Titãs, Finalizador, marca do predador, XP, sucata, contagem geral, célula a cada25abates e recompensa/cura/peça/baú únicos de chefe.

A morte de uma unidade com **carga corrosiva anterior** ainda pode liberar Respingo Reagente. Essa regra global já está no contrato de corrosão e também vale para Pistão/outros canais. O pulso não semeia a carga nem muda seu dano: uma captura anterior80libera até2filhos de40, comspread=false, independentemente de o pulso ter dano200. Os filhos não propagam outra geração. Lacaios removidos pela morte do chefe não viram abates independentes.

A revisão estática inicialmente interpretou a expressão abreviada “sem procs” como proibição de qualquer gancho de morte e apontou umP1condicional. Após confrontar o contrato vigente e os testes de captura anterior/geração, o revisor retirou esse achado e preservou o histórico. Não foi feita uma supressão de sinergia nem reclassificação de defeito grave para alcançar aceite. A distinção correta é impacto balístico versus morte global de estado preexistente.

## Correções independentes: drones e coleta no quadro da morte

Foi reproduzido umP1real da base64: uma colisão comum podia matar o jogador na fase de inimigos e, depois, `tickDrones` ainda atacava no mesmo tick. O caso controlado terminava comHP0/estadoover, mas1abate e1núcleo produzidos. Não dependia de nenhuma peça nova.

A candidata adiciona guarda no início de tickDrones: retornar se state não éplaying ouHP≤0. Assim nenhuma seleção, timer, dano, som, abate ou recompensa de drone acontece após essa morte ou em pausa/ofertas. Sensor/rotores já tinham suas próprias guardas. Não conceder imunidade ao avanço.

Uma segunda reprodução mostrou que o empurrão fatal de48pxpodia colocar o robô sobre XP/sucata e a fase de coleta ainda aumentavaXP/parafusos após state=over. A candidata agora executa atração/coleta/gravação de loot somente enquanto state éplaying. Não desfaz recursos coletados em vida; apenas impede novas coletas depois da morte. O caso também falha na fonte64publicada e passa depois da guarda, preservando os dois resultados. A finalização visual do quadro continua, com limpeza de buffers de efeitos, sem deixar streams temporários abertos.

O teste `drone-death-phase.cjs` reproduz o loop integrado real, não apenas uma chamada isolada posterior. A fonte publicada64foi extraída do Git para comparação e mostrou o defeito. Seus textos normalizados somente em CRLF→LFconferem com a física congelada64; hashes brutos diferem por terminação de linha. Falha antes, fonte64e resultado após estão no arquivoQA.

A equivalência dos32mundos legados de feedback passou sem normalizar essa correção na referência; aqueles cenários não cobrem a morte nativa de drone no mesmo quadro. O caso dedicado prova a diferença intencional. Não alegar preservação integral do defeito antigo nem de todos os caminhos possíveis por uma equivalência parcial.

## Visual, HUD e áudio

Ícones originais`vitalLink.svg`e`integrityPulse.svg`usam hardware, placas, cartucho e sinais angulares; não cruz de cura, coração ou aura de escudo. Os drones acoplados recebem detalhe de placa clara e até3pequenos LEDsâmbar por faixa de HPatual/HPmáxima. O indicador não consome vida nem altera contagem/órbita/cadência. O parecer do Dev designer sugeriu violeta como alternativa; não afirmar essa paleta como implementada.

O Pulso usa8segmentos radiais claros, centro transparente e visual de0,25s no array existente de efeitos, limitado a150. A arte se expande enquanto desvanece, mas todo dano já foi aplicado no evento. Não criar uma segunda área de dano ou aura persistente. Pausa congela o relógio/pose/efeito.

O cartucho1de cada espaço recebe sublinhadoâmbar quando a peça está instalada e não há recarga. Não criar linha, painel ou botão. Preservar numeração, avisos de Culatra/Lâmina e marcas do Pistão. Tooltip descreve a prontidão; pausa mostra dano do pulso/divisor, HPatual e parcela dos drones.

Um teste de computedStyle encontrou o sublinhado suprimido por uma regra antiga globalbox-shadow:none!important. O seletor específico foi corrigido com!importante o mesmo teste de cor passou nas3resoluções; os resultados anteriores foram preservados.

Acoplamento mantém o cue de drone existente, sem duplicar som de reparo ou criar voz por leitura de HP. Pulso tem evento`integrityPulse`, throttle0,2s: dois tons suaves180→85Hz/0,18s e540→270Hz/0,12s. Umcue por cartucho real, não por alvo ou pellet; limite global24vozes, mute/volumes e RNGdecombate independentes.

## Casos de aceitação

Requisitos abaixo não equivalem a aceite final executado.

| ID | Preparação/ação | Resultado esperado |
|---|---|---|
| VIT01 |Tentar Acoplamento sem drone, com módulo e com nativoENXA |Elegibilidade real; instalação não altera HP/cadência/munição/perfil |
| VIT02 |B100,HP40/80/4000, variar sóHPmáxima |D101/102/200; HPmáxima isolada não muda extra |
| VIT03 |HPzero/negativa/NaN/Infinity, extremos técnicos |Extra0para inválidos; entradas válidas limitadas e finitas |
| VIT04 |Baia/calibração90s e foco em chefe |Base treinada, depois vida limitada, depois foco uma vez |
| VIT05 |Abate primário cura1e arco salta |Arco usa captura anterior à cura; ataque futuro pode ler HPnova |
| VIT06 |Drone reforçado atinge escudo |Absorção integral; sem novos estados/procs |
| VIT07 |Comparar bala/sensor/rotor/projétil antigo antes/depois |Conversão sóno drone; sem reescrever outros canais |
| VIT08 |Equipar3armas e1drone |ParcelaHPuma vez por ataque, não×3pela quantidade de armas |
| VIT09 |12armas, penúltimo válido e último cartucho |Sóúltimo consumido ativa1pulso e autorrecarga normal |
| VIT10 |Escopeta5pellets e rajada3subdisparos |Um evento no cartucho final; não duplicar por pellet/subtiro anterior |
| VIT11 |Teto400e espaço399 |400recusa sem custo/pulso;399gasta1e ativa1pulso |
| VIT12 |Rcom munição parcial, completar e tentar emissão inválida |Nenhum pulso pela recarga; retorno inválido não repete |
| VIT13 |HPmáxima300/HPatual1, crítico/Culatra/arma forte |Pulso60com1arma; não herda multiplicadores balísticos |
| VIT14 |1/2/3armas vaziam no mesmo quadro |60/30/20por evento paraHPmáxima300; soma bruta60 |
| VIT15 |100corpos e limites90+raio |Todos os dentro atingidos, fora não; sem cap artificial |
| VIT16 |Policial com escudo1e procs adquiridos |Quebra sem excesso; não aplicar estados/empurrão |
| VIT17 |Abate comum, Finalizador e contadores próximos de limiar |Globais/loot normais; killAmmo/salvage não avançam pelo pulso |
| VIT18 |Pulso mata chefe e remove lacaios |Baú/peça/cura únicos; lacaios removidos sem crédito próprio |
| VIT19 |Pausa/oferta/over/HP0e valores técnicos |Nenhum pulso fora da partida ativa; dano calculado finito |
| VIT20 |Render/HUD, pausa e reset |Sem RNG/física no render, relógios congelados, peças não persistem |
| VIT21 |Pulso em corpo livre com todos estados adquiridos |Nenhuma corrosão/fogo/frio/stun nova pelo pulso |
| VIT22 |Carga anterior80e pulso200mata hospedeiro |Até2filhos40,1geração; não usar200como captura |
| VIT23 |Contato mata jogador antes da fase de drones |Over/HP0,0abates/núcleos posteriores; baselinefalhava e candidata passa |
| VIT24 |Três viewports, cards/R/mouse/toque com3dedos/retrato |Controles independentes, marca legível, sem custoHP/overflow/retomada automática |
| VIT25 |Áudio por evento e spam/mute |Umcue por último cartucho; sem cue de cura extra ou drone morto |
| VIT26 |Repetir mundos legados e preservar defeito corrigido separadamente |Equivalência somente no escopo coberto; morte no mesmo quadro exige novo resultado |

## Evidência disponível

[Arquivo de QA controlado](data/build65-qa.json.gz) preserva47arquivos, com caminho, bytes, hashSHA256e conteúdo recuperável, incluindo manifestações da regressão37e complementos, reproduções negativas na base64, resultados atuais, capturas, fontes dos novos testes, pareceres estáticos e gerador da especificação. A descompressão e os hashes restaurados foram conferidos. Não inclui as partidas naturais, preservadas nos arquivos próprios abaixo, nem constitui aprovação final1.0.

`vital-conversions.cjs`registrou22grupos aprovados; `drone-death-phase.cjs`passou após reproduzir a falha na base64e na candidata antes da guarda. Um erro inicial de fixture do arco ignorava o custo antigo de droneArc; a expectativa passou a usar a base já modificada antes do ataque, sem mudar a produção.

O navegador controlado passou em1280×900/844×390/740×360: escolhas legais, dano real do drone dependente deHPsem custo, último cartucho por mouse,12modelos,3espaços, cor computada da prontidão, pixels pausados iguais, terceiro dedo/retrato/morte/reset e catálogo19/105. Tem proteção, ondas suspensas e tempo manual: não é partida natural, desempenho ou aparelho físico. Áudio de eventos reais e sinal/mute/vozes têm testes separados.

As revisões de chats são estáticas/visuais propostas, sem execução atribuída a elas. O parecer de design foi corrigido para explicitar que não há consumo deHP: esse custo não existe no contrato ou código. A limitaçãoP2de posição do Pistão64permanece documentada, não resolvida por estas peças.

## Avaliação natural homogênea da fonte corrigida

[Resumo atual](build65-balance-summary.json), [arquivo bruto atual](data/build65-runs.json.gz) e [atividade após aquisição](build65-vital-usage.json) guardam protocolo, fontes congeladas, piloto13, decisões e dano por fonte. As sementes foram fixadas antes de resultados e são distintas das3sementes finais reservadas.

| Braço | Preparação/política | Viabilidade estrita | Presença das peças |
|---|---|---|---|
| A |10receitas canônicas, seed6501301, runner/piloto sem alteração |10/10 |7tentativas adquiriramAcoplamento;1adquiriuPulso |
| B |Enxame/Oficina × seeds6501321/6501322; prefere sóa peça-alvo se oferecida legalmente |4/4 |Acoplamento nas2/2Enxame; Pulso em1/2Oficina; a mesma Oficina também adquiriuAcoplamento |

Todas as14sobreviveram1200s, derrotaram pelo menos3chefes e adquiriram os4núcleos. O casoOficina6501321não adquiriu a peça-alvo e permanece no relatório. Nenhuma oferta, HP, cura, invulnerabilidade, morte de chefe ou remoção de vivos foi forçada. Equipamento necessário foi apenas pré-desbloqueado.

No braçoA o Pulso causou196de dano efetivo ao corpo; noB,339,02. Totais não sãoDPSnem diferença causal de uma buildcontrole. Há12aquisições de peças entre os braços e, em cada uma, minutos completos posteriores com atividade positiva da fonte correspondente e HPmínima positiva. O dano dos drones nesses minutos é o total do canal, não apenas a parcela incremental deHP. A fórmula específica tem provas controladas separadas; não atribuir todo dano dos drones à peça.

A primeira rodada foi concluída antes da correção da coleta terminal e foi preservada separadamente em [resumo histórico](build65-pre-loot-fix-balance-summary.json) e [brutos históricos](data/build65-pre-loot-fix-runs.json.gz). Depois da correção, as mesmas14foram repetidas num protocolo novo, sem trocar sementes/piloto/receitas. [Comparação pareada](build65-recheck-equivalence.json) confirmou objetos completos de tentativa idênticos nas14, coerente com todas terem sobrevivido e não alcançarem o ramo de morte. Não são28sucessos independentes. As reproduções negativas dedicadas comprovam a mudança pretendida quando ocorre morte.

Limites: progressoVM/headless não prova experiência humana, apresentação em aparelho físico ou FPS. O observador numérico natural é amostral e não aprovaG01total. Matriz final30, estabilidade60min, desempenho realPC/celular e outros motores compatíveis continuam abertos.
