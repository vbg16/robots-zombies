# Pistão de Retorno — candidata BUILD64

Estado: implementação candidata, ainda sem publicação64confirmada nesta revisão. A publicação anterior é BUILD63, commit210e30b4a08575d28d81a3304c419f7f02f7df2a. Valores são hipótese autoral experimental. Esta peça adapta o motor de arma/entidade invocada ao terminar a recarga, que não estava atendido pela Lâmina durante a recarga. Não copia nome, arte ou coeficientes da referência.

## Aquisição e inventário

`reloadPiston`, PISTÃO DE RETORNO, é uma peça rara universal dos baús físicos de chefe. Oferecer somente quando ainda não adquirida, junto da política vigente de alternativas de hardware e universais. A escolha é pausada, valida versão da oferta e elegibilidade, pode ser recusada e não aceita callback antigo. Instalar apenas registra a peça temporária: não invoca, não altera HP, munição ou timer em andamento e não captura retroativamente uma recarga já iniciada.

Inventário64:17relíquias/103artigos no compêndio. Catálogo editável continua86, revisão7;56módulos normais. Esta peça não integra os sliders do painel nem exige migração nova. Perfil permanente conserva recursos/equipamento e nunca guarda a peça, entidade, contatos ou captura.

## Gatilho e estados por arma

Cada espaço possui, no máximo, uma captura pendente `reloadPistonCharge` e uma entidade ativa `reloadPiston`. Sem a peça não criar esses campos. Armas auxiliares não compartilham captura, posição, contatos ou relógio.

1. `startReload` precisa de partida ativa, arma sem recarga e munição abaixo da capacidade. Repetição deR ou carregador cheio não cria/renova nada.
2. No início válido, depois de registrar falta/capacidade/tempo, capturar a referênciaP abaixo. Uma entidade anterior pode continuar viajando enquanto a próxima recarga acontece.
3. A recarga parcial mantém a duração proporcional já existente. Até terminar, não criar entidade nova.
4. Na conclusão, repor munição e executar os efeitos existentes de cura/frio; então consumir a captura uma única vez.
5. Invocar somente com captura positiva finita, fração reposta positiva, peça presente, partida ativa e mira manual ativa com vetor finito não nulo. Não exige segurar disparo. Sem direção válida, descartar a captura; não guardar emissão para uma mira futura nem procurar inimigos.
6. Nova invocação substitui a entidade anterior daquele espaço. Não manter fila nem compensar dano perdido.
7. Depois de lançada, a entidade segue autonomamente a direção fixa. Soltar disparo, cancelar toque ou mover a mira não a redireciona/cancela. Pausa/ofertas congelam; morte/garagem limpam; reset recria slots sem captura/peça/entidade.

## Fórmulas e exemplos

Para cada espaço:

- `N=min(400,max(1,floor(pelletsDaArma*projectileMult)))`.
- `P=clamp(shotDamage(slot)*N,0,1e9)`, capturado no início da recarga.
- `shotDamage` inclui base local, conversão Titânico vigente e fatores de manutenção/escudo intacto. Não inclui crítico do quinto tiro, carga de reparo, Culatra, Colimador ou procs de impacto.
- `replaced=max(0,currentCapacity-currentAmmo)` antes de repor.
- `f=clamp(min(missingAtStart,replaced)/capacityAtStart,0,1)`.
- Dano bruto por contato: `D=0.9*P*f`.
- No máximo3corpos, uma vez cada: orçamento bruto máximo sobre três corpos `2.7*P*f`. Esse valor não é DPS sustentado.

SeP=100, recarga cheia dá90por corpo. Repor4de24dá15por corpo. Iniciar faltando5e receber1cartucho durante a recarga também repõe somente4e dá15. Receber toda a munição antes de concluir resulta emf=0: não invoca. Recarga de1cartucho não concede a potência de um carregador inteiro.

Reforja pode alterar os próximos atributos/capacidade, mas não reescreveP nem os tempos de recarga já iniciados. A fração usa a falta e capacidade iniciais, limitada pelo que efetivamente faltava ao concluir, conforme a mesma regra da cura proporcional. Capturas anteriores de Lâmina/Matriz e projéteis antigos também não mudam.

## Geometria, vida e colisão

A direção é o vetor normalizado entre o jogador e a posição mundial da mira na fase da conclusão. A origem usa `weaponOrigin(slot,angle)`, incluindo offsets perpendiculares atuais0/−16/+16/+32dos espaços aplicáveis; o centro inicial fica24px adiante.

A entidade avança em linha reta a360px/s, por no máximo0,6s ativos:216px de viagem a partir da sua origem inicial. Raio mecânico10px, somado ao raio do alvo. A arte não aumenta essa hitbox. Não segue alvo nem retorna fisicamente ao jogador.

A cada avanço, limitar o trecho à vida restante e calcular a primeira entrada do segmento no círculo de cada alvo vivo ainda não atingido. Ordenar pelo parâmetro de entrada; empate preserva a ordem original de `targets()`. Esse conjunto inclui chefe vivo. O primeiro contato pode ser0quando a entidade nasce sobre um corpo.

Processar até3contatos. Registrar cada corpo noSetantes do dano e diminuir o saldo mesmo quando o escudo absorve. Se algum efeito central matar/remover outro alvo já listado, pular esse morto sem novo contato. Escudo de policial absorve todo o golpe de quebra; o mesmo pistão não atinge o corpo depois, porque esse alvo já está marcado.

Contatos exatamente no instante final de vida perdem o empate para expiração. O helper geométrico admite sua tolerância de8EPSno parâmetro; a comparação final exige entrada<1−8EPSquando o trecho termina junto com a vida. Após0,6s ou terceiro contato, apagar a entidade. OSetguarda no máximo3referências; não há histórico global, backlog, reembolso ou crescimento de filas.

Pistões não usam a lista das400balas. São suportes separados com teto próprio de1por espaço: no máximo3ativos e3capturas pendentes no arsenal máximo. Eles não são consumidos pela Matriz nem recebem Colimador. Atingir400balas não cancela uma invocação válida, e invocar não remove balas para criar vaga.

## Ordem discreta e tempo residual

O loop integrado atual amostra estados/recargas antes de deslocar o jogador e sincronizar câmera/mira daquele quadro. O Pistão segue essa fase. Não alegar interpolação contínua da posição do jogador no instante subframe da conclusão.

Para um passo de duração dt e recarga restanteR:

1. Avançar a entidade antiga por `min(dt,R)`.
2. Avançar Lâmina/recarga e, se terminar, executar a conclusão e possível substituição.
3. Avançar a entidade resultante somente por `max(0,dt−min(dt,R))`.
4. Se não havia recarga, avançar a entidade por todo dt.

Assim uma recarga que termina0,02s dentro de um passo0,05s dá apenas0,03s de idade ao pistão novo. Se não houver mira válida e não ocorrer substituição, o antigo continua pelo restante. Cada trecho também é limitado pela vida da entidade. No navegador dt é limitado a0,04s; o piloto natural usa0,05s.

**Observação conhecida P2, revisão estática:** em movimento rápido/dash no quadro da conclusão, a origem visual pode ficar defasada do robô já desenhado depois do deslocamento. Reprodução: recarga termina dentro do quadro, mover e comparar origem amostrada com posição após movimento/câmera. Impacto: diferença de até um passo de movimento, sem perda de progresso ou controle. Situação: ordem pré-movimento explicitamente mantida e testada; não foi implementada interpolação contínua nem se declarou correção desse deslocamento. A revisão não encontrou P0/P1 por inspeção, mas não executou testes. O Dev executou o caso integrado e os demais ensaios abaixo.

## Fonte de dano e limites de propagação

O contato chama dano central com fonte exata`reloadPiston` e origem do espaço emissor. Multiplicadores globais de alvo, Caça-Titãs, Finalizador e marca do predador continuam nas fases já existentes; não capturá-los novamente como se fossem parte deP. Exposição do sensor continua somente para`bullet`.

Não chamar`impact`: sem queimadura, frio, corrosão, eletricidade, explosão, crítico, empurrão, ricochete, perfuração adicional, alimentação de Matriz ou carga de munição por contato. Não incrementar contadores de killAmmo/salvage.

Manter XP, sucata, contagem geral, célula de reparo por25abates, baú/peça/cura de chefe e regras globais de morte únicas. Uma carga corrosiva já aplicada em um alvo pode liberar sua propagação normal quando ele morre; isso é efeito pré-existente, não aplicação de corrosão pelo pistão. Lacaios removidos pela morte do chefe não viram contatos extras.

## Apresentação e áudio

Silhueta original: carcaça curta de aço, aro cobre, haste e cabeça quadrada de prensa; sem dentes, ponta ou rastro longo. É uma ferramenta industrial arremessada, diferente da Lâmina fixa durante recarga e do anel de escudo. O ícone próprio fica em`assets/skills/reloadPiston.svg`.

Nos primeiros90ms ativos, a cabeça estende3px e seu sinal âmbar transita para metal claro. O render lê posição/vida, sem mudar relógios, dano ou RNG. Pausa conserva pose e pixels depois do primeiro quadro da apresentação pausada. A mira pode desaparecer na transição para pausa; comparar dois quadros já pausados.

As trilhas de recarga existentes, por espaço, mostram marcas âmbar quando há captura naquela recarga (`charging`) e ficam âmbar enquanto a entidade existe (`emitted`). O nome da arma, munição e avisos de Culatra/Lâmina continuam legíveis. Não criar nova linha, painel ou botão. O rótulo acessível identifica preparação/emissão. Pausa mostra captura/entidade, dano, vida e contatos restantes por espaço.

Eventos próprios: `pistonLaunch` na invocação real, throttle0,15s, tom triangular155→310Hz/0,1s e ruído curto; `pistonHit` somente com perda efetiva de HP/escudo, throttle0,12s, tom260→100Hz/0,06s. No máximo um cue de contato por avanço, além do limite global24vozes. Sem RNGdecombate; mute, gesto inicial e volumes existentes permanecem. Nenhum som de invocação em recarga recusada, aquisição intermediária ou mira inválida.

## Casos de aceitação

Os casos abaixo são requisitos. Aprovação de fixtures não aprova a auditoria final.

| ID | Preparação/ação | Resultado esperado |
|---|---|---|
| PIS01 |12armas; recarga cheia e de1cartucho |Pcapturado finito;D=0,9Pf; sem entidade antes de completar |
| PIS02 |Rcom carregador cheio ou repetido |Nenhuma captura/invocação/renovação indevida |
| PIS03 |Adquirir peça durante recarga |Sem efeito retroativo; próxima recarga válida captura |
| PIS04 |Mira inativa, nula, inválida e válida sem disparo |Só última invoca; sem busca automática ou espera de mira futura |
| PIS05 |Concluir com overshoot de0,2s |Somente0,2sde idade/72pxde viagem; não envelhecer pelo dtinteiro |
| PIS06 |Alvos em ordem embaralhada, repetidos e quatro corpos |Entrada geométrica ordenada; uma vez/corpo; máximo3 |
| PIS07 |Tangente lateral, direção vertical e extremo de vida |Raio10+alvo; direção fixa; expiração vence empate final |
| PIS08 |1/2/3armas e400balas existentes |Um por slot/origens separadas, sem consumir/remover balas |
| PIS09 |Nova conclusão com entidade antiga |Antiga sóaté fronteira; nova substitui e recebe residual |
| PIS10 |Reforja, quebra de escudo e manutenção após captura |P/timers antigos preservados; próximas capturas usam novos valores |
| PIS11 |Policial com escudo1e todos procs instalados |Quebra sem excesso aoHP; nenhum estado/empurrão/proc novo |
| PIS12 |Abate comum/boss/contadores próximos do limiar |Loot/globais/recompensas únicos; sem killAmmo/salvage do pistão |
| PIS13 |Liberar disparo, cancelar toque, pausar e retomar |Entidade lançada segue; pausada congela; sem retomada indevida do disparo |
| PIS14 |Render repetido, morte, garagem e reset |Sem mutação/RNGpor render; limpeza completa sem persistência |
| PIS15 |Faltam5cartuchos e1ou5são reembolsados |Dano/cura somente pela reposição real; reposição zero não invoca |
| PIS16 |Tickintegrado com movimento/câmera e conclusão interna |Origem pré-movimento documentada; idade sóresidual; registrarP2 |
| PIS17 |Três viewports, cards, estados de barras e3dedos |Escolha legal, sem clipping/novo botão, marcas por slot, controles independentes |
| PIS18 |Som, mute e muitos contatos |Cues sóem eventos reais, throttles/limites mantidos |

## Evidência e pendências

`tests/reload-piston.cjs` registrou17grupos aprovados, incluindo reembolso e ordem do tick integrado; `tests/reload-piston-browser.cjs` passou nas3resoluções, escolha legal, Rreal,12modelos,3slots, screenshots pausados idênticos, terceiro dedo, retrato, morte e reset. Preparação inclui proteção, ondas suspensas, tempo manual e alinhamento artificial dos timers no caso de3dedos; não é partida natural, FPS ou aparelho físico. O primeiro erro de comparação de pixels era captura do último quadro ativo versus primeiro pausado; diagnóstico e imagens foram preservados.

O teste existente de baús detectou inicialmente classificação incorreta da peça nova como específica: havia duas alternativas universais numa oferta que devia conter uma. A classificação da peça foi corrigida na produção e o mesmo teste passou, sem enfraquecer a assertion.

Avaliação natural intermediária e regressão global devem ser lidas nos relatórios com hashes próprios. Matriz final30, estabilidade60min, desempenho real, celular físico e demais motores compatíveis continuam abertos. Este sistema não substitui a Lâmina durante recarga nem encerra o mapa de integração.

## Resultado natural intermediário64

[Resumo por tentativa](build64-balance-summary.json) e [arquivo bruto completo](data/build64-runs.json.gz) preservam protocolo, sementes, fontes congeladas, runner canônico, diferença de uma linha do experimento, decisões, dano por fonte e logs.

| Braço | Configuração fixada antes de resultados | Viabilidade estrita | Aquisição/uso do Pistão |
|---|---|---|---|
| A |10receitas canônicas, seed6401301, piloto13sem alteração |10/10 |2/10adquiriram; ambas causaram dano efetivo ao corpo |
| B |Forja/Oficina × seeds6401321/6401322; prefere Pistão apenas se oferecido legalmente |4/4 |4/4adquiriram e causaram dano efetivo ao corpo |

Todas as14sobreviveram1200s, derrotaram pelo menos3chefes e obtiveram os4núcleos. Esses números não são14partidas canônicas nem a matriz final30. Não houve equipamento extra além de desbloqueio, poder/cura/imunidade artificial, oferta forçada, mudança de piloto, morte de chefe por comando ou descarte de vivos.

Dano efetivo do Pistão no braçoB: Forja6401321=1117,80; Forja6401322=1219,05; Oficina6401321=6095,11; Oficina6401322=13051,61. São totais de1200s, nãoDPS, pico ou ganho causal comparado à mesma build sem peça. O observador existente não conta absorção por escudo nem registra o total de invocações/duração ativa, e a verificação numérica natural amostra somente alguns campos. Nenhum gateG01integral ou desempenho foi aprovado por isso.

Os hashes de runtime, receitas e piloto não mudaram durante a matriz. O resumo gerado pelo coordenador manteve por engano o campo numérico build=62copiado de um script antigo; ele foi corrigido para64com errata explícita em metadataCorrections. Arquivos, versão congelada, resultados e simulação sempre foram64. Nenhuma partida foi repetida ou descartada por essa correção de metadado.

## Regressão e revisão da candidata

A verificação consolidada em outputs/release64-final-verification/manifest.json contém33comandos aprovados com hashes de runtime constantes. A execução inicial ficou retida em outputs/release64-regression/manifest.json: a assertion antiga da Lâmina ainda esperava16peças; foi atualizada para17e reexecutada, mantendo os testes de comportamento. Os verificadores estrutural/de release foram repetidos após concluir os textos, sem mudar física. A revisão estática do chat Revisor do projeto e o parecer do Dev designer não são execuções de teste e estão preservados no arquivo QA.

[Arquivo QA controlado](data/build64-qa.json.gz) reúne fixtures, regressão, capturas, diagnóstico da pausa, revisão estática, parecer visual e recursos para reproduzir a geração da especificação. O pacote extraído e a publicação precisam de registros próprios; este parágrafo não os presume aprovados.
