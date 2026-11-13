# Reserva e manutenção — candidata BUILD63

Estado em 13/11/2026: **implementação candidata, sem aprovação final e sem publicação da BUILD63**. A última publicação confirmada é BUILD62, commit `24eb4b6859bb3197a0c95fab9fe0fb96db8a5473`. A família está sendo integrada e verificada; os coeficientes abaixo são a hipótese autoral implementada para ensaio, não números de balanceamento aprovados. Os hashes da especificação mestre identificam a fonte extraída e precisam ser renovados após alterações.

A família resolve quatro vínculos distintos: proteção numérica separada de HP; benefício enquanto um escudo binário está intacto; ganho ofensivo mantido por tempo sem impactos; e abate direto de pulso convertido em proteção. Não confundir o Banco de Reserva com a habilidade antiga Reserva de Emergência: esta última concede proteção temporária após dano e conserva seu timer próprio.

## Catálogo e aquisição

São quatro módulos normais, adquiridos em ofertas legais durante a tentativa, uma vez por ID. Eles somam uma árvore de quatro nós: total56normais,86editáveis,16relíquias e102artigos de módulos/relíquias no compêndio. O painel não passa a editar relíquias ou reforjas. As dez receitas existentes não foram redefinidas para exigir a árvore.

| ID | Nome | Pré-requisitos padrão, todos obrigatórios | Efeito padrão | Custo ou condição |
|---|---|---|---|---|
| reserveBank | BANCO DE RESERVA | Nenhum | Proteção inicial20, capacidade40;50% do excesso de cura vira reserva | Recarga das armas×1,10; não repõe munição nem termina recarga ativa |
| shieldDrive | PONTE DE POTÊNCIA | reserveBank e shield | Cartuchos×1,20 enquanto o Escudo Capacitivo está pronto | Reserva sozinha não ativa; perder o escudo retira o fator para novas capturas |
| cleanCircuit | CIRCUITO PRESERVADO | reserveBank | Cartuchos+10% após15s e+20% após30s sem impactos aceitos | Máximo20%; impacto aceito, inclusive absorvido, zera a sequência |
| pulseRecovery | RETORNO DE VARREDURA | reserveBank e sensor | Abate direto do sensor:4de reserva e8s a menos de recarga do Escudo Capacitivo | Máximo3créditos/pulso; estados transmitidos não contam |

Os pré-requisitos múltiplos são reais, tanto no catálogo configurado quanto no fallback sem painel. Não basta ter somente o Banco para instalar Ponte ou Retorno no catálogo padrão. Configurações editadas continuam sujeitas ao validador e só entram na próxima tentativa. Condições canônicas permanecem internas; não importar código executável.

## Estado temporário e limites

Ao instalar o Banco, criar `reserveBank={value:20,max:40}`. Ao instalar Circuito, criar `cleanCircuitElapsed=0` e sua flag; não dar crédito pelo tempo anterior da tentativa. Os outros filhos habilitam suas flags. A capacidade40 não depende de vida máxima, Titânico, chassi, número de armas ou cura recebida. Não manter listas de abates ou referências a inimigos no Banco.

Todas as entradas de cura/reposição precisam ser finitas e positivas. A reserva deve permanecer no intervalo0..40. Não armazenar NaN, Infinity ou sentinelas infinitas, mesmo como metadado. Valores extremos do editor não autorizam crescimento sem limite.

Reposição, para valorV e quantidadeQ:

`ganho=min(40−V,Q)`; `novoV=V+ganho`.

A operação exige jogador vivo e Banco presente. Reserva cheia descarta o excedente; não converte a sobra em HP, munição, moedas ou novo evento de cura.

## Ordem do dano recebido

1. Fora de playing, jogador morto ou invulnerabilidade já ativa: retornar sem resetar Circuito, gastar Banco/escudo, empurrar ou executar reação.
2. Rejeitar quantidade não finita ou não positiva antes de modificar o novo estado. Esta guarda explícita também evita contaminação numérica no caminho de dano recebido.
3. Se Circuito foi adquirido, zerar a sequência neste impacto aceito.
4. Se Escudo Capacitivo está pronto, consumir somente esse escudo: absorção integral, recarga120s e proteção0,25s. Banco e HP não mudam; não transferir excedente. Manter a exceção legada sem empurrão nesse caminho.
5. Sem escudo pronto, aplicar Grounding×0,7 apenas à fonte boss-hazard, se essa especialização está instalada. Calcular `D=max(1,amount−armor−repairArmor)`, com repairArmor2enquanto o protocolo estiver ativo. Não aplicar armadura duas vezes.
6. Banco absorve `A=min(V,D)`, fica `V−A`; HP perde `D−A`. **O excedente atravessa o Banco**, ao contrário do escudo binário.
7. Esse contato mantém empurrão48px oposto à fonte e proteção normal0,65s, dobrada por Grace, mesmo quando Banco cobre tudo. Fonte coincidente usa o fallback de movimento/direção já definido no combate.
8. Reações pós-dano e especializações de sobrevivência só disparam se HP realmente diminuiu e o jogador sobreviveu. Absorção integral não gera Retaliação, Sobrecarga, Emergência, isca ou nove vidas.
9. Dano fatal mantém o fluxo de morte, limpa reserva/manutenção e os dispositivos temporários previstos. Não ressuscitar por cura/reposição atrasada.

Exemplos PROT/armadura0/HP100: reserva20 e golpe12 resultam em reserva8/HP100; outro golpe12 depois da proteção resulta em reserva0/HP96. Golpe50 com reserva20 resulta em HP70. Se escudo estiver pronto antes do golpe50, sóele é consumido e permanecem reserva20/HP100. Impactos durante a proteção posterior são ignorados, sem nova quebra de Circuito.

## Cura efetiva, excesso e callbacks

Para tentativa de cura positiva e finitaQ em jogador vivo:

- `curaHP=min(Q,maxHp−hp)`;
- `excesso=max(0,Q−curaHP)`;
- `ganhoBanco=min(40−V,excesso×0,5)`.

Curar HP primeiro; nunca retirar HP para alimentar Banco. `healPlayer` continua retornando somente a cura efetiva de HP. Apenas essa parcela ativa Carga de Reparo e Armadura de Reparo; reposição do Banco não chama healPlayer e não produz recursão.

HP95/100, Banco20, cura10: HP100, retorno5, Banco22,5. HPcheio, Banco39, cura10: retorno0, Banco40, sem especializações de cura. Jogador morto não recebe nenhum dos dois ganhos. Cura de chefe, célula coletada, reparo e outras fontes legítimas passam pela mesma regra; a fonte não ganha multiplicadores escondidos.

## Manutenção, dano e snapshots

`intacto=(shieldDrive adquirido && shield adquirido && shieldReady)`.

`fEscudo=intacto?1,20:1`.

`estágio=min(2,floor(cleanCircuitElapsed/15))`, somente se Circuito está adquirido; fora disso0.

`fCircuito=1+0,10×estágio`.

`cartucho=(danoLocal+conversãoTitânicoPermitida)×fEscudo×fCircuito`.

A conversão Titânico continua `min(0,75×danoLocal,0,03×maxHp)`, exigindo Titânico e Blindagem conforme seu contrato. O teto próprio dos novos fatores combinados é1,44×; isso não é uma promessa de DPS total. Nunca multiplicar slot.damage a cada tick para manter o bônus: calcular o fator a partir do estado atual evita acúmulo indevido.

Tempo do Circuito avança apenas em combate ativo, limitado30s. Pausa, ofertas, menu, garagem, morte e retrato não concedem tempo. A fase de relógios atualiza antes das emissões previstas no tick; impacto aceito posterior zera imediatamente o estado para capturas seguintes. Não alegar uma cronologia contínua subframe que não exista no runtime. Aos14,999/15/29,999/30s, os estágios esperados são0/1/1/2, respeitando tolerância numérica declarada.

As armas compartilham o estado defensivo do robô, mas usam dano local independente. Não multiplicar o ganho pelo número de slots. Balas já emitidas preservam o snapshot de dano; frio/fogo/corrosão derivados conservam suas regras de captura, sem reaplicar o fator novo na fonte secundária. Drones, sensores e rotores não passam a usar shotDamage por causa desses módulos.

Lâmina de Recarga captura a base ao iniciar uma recarga válida; Matriz de Rebites captura a base ao implantar. Esses snapshots podem incluir o fator vigente, pois já usam shotDamage. Quebrar escudo ou reiniciar Circuito depois não reescreve a entidade/recarga anterior. Crítico, Culatra e Colimador continuam aplicados nas fases documentadas, sem duplicação.

## Abates do sensor e proteção

Cada execução real de tickSensor inicia contador local0. Sócontar transição de alvo vivo para HP0 causada pela chamada direta `damageEnemy(...,'sensor')` desse pulso. Quebrar escudo de policial sem matar não conta; golpes absorvidos não transferem dano ao corpo. Alvo já morto é ignorado. Fogo transmitido, corrosão, explosão, raio, rotor, drone, Matriz ou Lâmina não são abates diretos desse pulso.

Após terminar o laço:

- `n=min(3,abatesDiretos)`;
- repor `4×n`de Banco, respeitando40;
- se Escudo Capacitivo existe e está descarregado, `timer=max(0,timer−8×n)`;
- se timer chega a0, marcar escudo pronto imediatamente para ações posteriores;
- escudo já pronto não acumula crédito para uso futuro.

O limite é de recompensa, não do dano ou número de alvos atingidos. Dez mortes diretas continuam sendo dez mortes/XP/loot normais, mas dão até12reserva/24s de antecipação. Chefe diretamente morto conta uma vez; seus lacaios removidos pelo fluxo de chefe não contam como mortes diretas do pulso. Baú/peça/cura continuam únicos. Cura legítima de chefe pode produzir excesso pelo mecanismo anterior e deve ser distinguida da parcela4×n na auditoria. Nenhuma reposição cria ataque, pulso ou sorteio novo.

## Interface, arte e áudio

A proposta do chat Dev designer distingue HPvermelho, Escudo Capacitivo ciano binário e Banco âmbar. O componente candidato fica no cartão do robô, com rótuloBANCO, número atual/máximo e trilha segmentada de4px; não somar a reserva à fração de HP. Cor proposta/implementada para Banco `#f0b85b`; fundo industrial azul-noturno e texto claro preservados.

O estado do Circuito mostra0/2,1/2ou2/2; Ponte mostra condição ativa/inativa. A pausa detalha capacidade, estágio, limite, origem da reposição e condição de perda, sem criar novo botão ou mudar os pads de toque. Ícones próprios dos quatro módulos usam placas, escudo/circuito e pulso; não representam reserva como coração ou vida permanente.

Absorção integral deve usar retorno âmbar e não o retorno laranja de perda de HP. Dano parcial pode sinalizar as duas parcelas. Os eventos reserveHit e reserveGain são próprios, suaves e limitados por frequência; não consomem RNG de combate. O evento de ganho pode ser único por pulso quando há reposição/restauração real; não gerar um som por inimigo. Mute e limite global de vozes continuam obrigatórios.

A versão visual candidata precisa de inspeção em1280×900,844×390e740×360, com1/2/3armas, chefe e timers ativos. Requisitos: nenhum transbordamento, números legíveis, HP/XP/escudo distinguíveis, painel sem esconder chefes/controles, pausa congelada e sem animação que avança sozinha. Animações adicionais sugeridas no parecer visual são propostas até existência e execução serem comprovadas; não tratá-las como entregues sóporque aparecem no desenho.

## Configuração e migração

Envelope `version:1,catalogRevision:7,skills:[...]`; perfil de equipamento continua versão2em chave separada. Novos IDs foram introduzidos na revisão7. Carregar revisões1..6 deve acrescentar os quatro defaults sem conceder módulos ao jogador. Se um ID customizado antigo colide, renomear para custom-IDcom sufixo livre e redirecionar referências de pré-requisito/sinergia, inclusive condição vazia. Migração repetida precisa ser idempotente. Os82registros anteriores devem conservar edições válidas; não apagar ou renomear arbitrariamente conteúdo do usuário.

Os números mecânicos condicionais20/40/50%/15s/30s/20%/4/8/3 são fixos desta implementação inicial, documentados em condition/handler; não há promessa de sliders individuais para eles. O custo direto×1,10da raiz é efeito editável. Editar seus efeitos preserva a criação da reserva, restaura os atributos diretos anteriores e aplica a lista editada conforme a API do painel. Auxiliares recebem sóos atributos de arma, sem triplicar capacidade ou condições do robô.

Morte/garagem limpam estado temporário; reset recria jogador e slots sem módulos, Banco ou estágios. Perfil e exportação permanente não armazenam reserva, manutenção ou fatores temporários. A configuração do painel descreve o módulo, mas não salva o estado corrente da tentativa.

## Casos obrigatórios de aceitação

Estes casos definem o aceite; **não são uma lista de aprovações**. Cada execução exige hash, preparação, valores, logs e limitações. Tolerância padrão: inteiros/IDs/estados exatos; reais com erro absoluto≤1e−6ou relativo≤1e−9, salvo regra específica.

| ID | Preparação e ação | Resultado obrigatório |
|---|---|---|
| RES01 | Adquirir raiz com HP50/100, munição parcial e recarga ativa | HP50, reserva20/40, custo aplicado uma vez, timers/munição/snapshots preservados |
| RES02 | Sem módulos novos, reproduzir mundos legados | Estado/efeitos/dano/RNG iguais ao comportamento anterior, excluindo correções explicitamente versionadas |
| RES03 | Reserva20; golpes12,12 separados por fim de inv |20→8→0; HP100→100→96; empurrão em ambos; sem procs no primeiro |
| RES04 | Armadura2, Grounding, repairArmor; fontes diferentes | Mitigação aplicada uma vez, mínimo1 antes da reserva; valores finitos |
| RES05 | Escudo pronto+reserva20, golpe enorme | Somente escudo consumido,120s/.25s; reserva/HP intactos; manutenção zerada |
| RES06 | Guard de inv/pausa/morto; repetir contato | Nenhum consumo/reset/empurrão/proc; sem cura da morte |
| RES07 | Reserva insuficiente e golpe fatal/não fatal | Excedente em HP; reações antigas sóse HPcai e sobrevive; limpeza correta |
| RES08 | Cura10 com HP95/100 e reserva20 | HP100, ganho2,5reserva; retorno5; especializações de cura sópela parcela5 |
| RES09 | Cura10 em HPcheio; reserva39 | Sóganho1reserva; retorno0; sem repairCharge/repairPlating; resto descartado |
| RES10 | Cura0/negativa/NaN/Infinity ou soma extrema configurada | Guard finito; nenhum estado inválido; sem laço de cura |
| RES11 | shieldDrive antes/depois de gastar/restaurar escudo | Fator1,2/1/1,2 sem multiplicação acumulativa, por1/2/3armas |
| RES12 | cleanCircuit em14,999/15/29,999/30s; várias partições dt | Estágios0/1/1/2; tempo≤30; pausa/ofertas/aquisição não dão crédito retroativo |
| RES13 | Impacto absorvido por reserva/escudo e impacto bloqueado por inv | Primeiros zeram; terceiro não zera; bônus de projétil antigo preservado |
| RES14 | Compor clean+intact+Titan+crítico+Culatra+Colimador | Fatores aplicados uma única vez, snapshot local; teto próprio1,44 não confundido com DPS |
| RES15 | Adquirir/partir bônus durante recarga/implantação | Lâmina/Matriz mantêmPcapturado; futuras capturas usam estado novo; drones/sensor/rotores sem bônus acidental |
| RES16 | Pulso com0/1/3/10abates | Ganho0/4/12/12reserva e redução0/8/24/24s; sem teto artificial de dano/alvos |
| RES17 | Sensor quebra escudo, burn mata depois; outros suportes matam | Nenhuma recompensa de abate direto do sensor |
| RES18 | Sensor mata chefe e remove lacaios | Umabate creditado, baú/peça/cura únicos; sem crédito por lacaios removidos |
| RES19 | Timer de escudo7s + umabate de sensor | Timer0/pronto; bônus disponível sópara emissões seguintes; sem crédito bancado |
| RES20 | Guardas, chamadas repetidas em morto, pulso atrasado | Sem duplicação, sem backlog, sem novos pulsos/procs/RNG |
| RES21 | Resets, morrer/garagem/repetir e profile roundtrip | Nenhum atributo/estado temporário salvo ou transferido |
| RES22 | Migrações1..6, colisões customizadas e referências vazias | Preservação/idempotência e inclusão dos4IDs apenas como catálogo |
| RES23 | Três viewports e mouse/touch simultâneo; pausa/retrato | Barra acessível, sem overflow, ações intactas, sem retomada automática |
| RES24 | Repetir desenho/audio/mute, muitosabates | Render puro, cues limitados, sem RNGou crescimento ilimitado de vozes/efeitos |

## Evidência disponível e limites

A extração VMdefault confirma56normais/86editáveis/revisão7/16relíquias. O arquivo `outputs/maintenance-migration63/result.json` registrou10grupos de migração aprovados na fonte balance.js identificada por seu próprio hash. A bancada `outputs/maintenance-engine63/result.json` registra730assertions aritméticas isoladas; esse helper de referência não prova integração do combate. A inspeção numérica sintética guarda seu escopo em `outputs/finite-state63/result.json`; ela não aprova todos os estados possíveis ou o gateG01.

A revisão de contrato e o parecer Dev designer foram propostas/revisões, não partidas, aprovação humana de qualidade ou testes de celular físico. A bancada integrada `outputs/maintenance-gameplay63/result.json` registrou24grupos aprovados, zero falhas e nenhuma mudança entre os hashes de início/fim da fonte avaliada. O navegador controlado `outputs/maintenance-browser63/result.json` registrou aprovação em1280×900,844×390e740×360, com reserva/HP/escudo, contenção do cartão, chefe sem sobreposição, pausa e reset. Esses fixtures usam preparação artificial e não provam toque simultâneo específico desta árvore, sobrevivência natural ou desempenho. Resultados devem sempre ser confrontados com seus hashes antes de reutilização. A regressão da candidata registrou30comandos aprovados sem mudanças de runtime; pacote extraído, matriz final30, estabilidade60min e desempenho realPC/telefone continuam verificações distintas.

A família não resolve outras pendências do mapa, como entidade ao fim de recarga, carga manual, gatilhos elementais específicos ou transformações temporais. Não declarar todos os motores integrados nem excluir requisitos por dificuldade.

## Avaliação natural intermediária concluída

[Resumo estruturado](build63-balance-summary.json) e [arquivo de evidências](data/build63-runs.json.gz) preservam14tentativas, fontes congeladas, protocolo anterior aos resultados, logs e diferença do piloto experimental.

| Braço | Preparação/política | Resultado estrito | Limite da evidência |
|---|---|---|---|
| A | Dez receitas canônicas, seed6301301, piloto13sem alteração |10/10viáveis; todas1200s, pelo menos3chefes e4núcleos | Nenhuma adquiriu os módulos novos; avalia o pool novo, não uso natural da reserva |
| B | Forja/Oficina, seeds6301321/6301322; prioridade apenas entre quatro módulos novos legalmente oferecidos |2/4viáveis; todas sobrevivem1200s e derrotam7chefes | Banco adquirido4/4, Circuito1/4; Ponte/Retorno não adquiridos; sem contador de consumo/restauração |

As falhas B foram Forja6301321semthermal e Oficina6301321semrepair. Não foram apagadas nem substituídas. Preferir módulos novos não garante núcleo da receita nem prova que eles causaram a falha. Não comparar causalmente essas sementes com outras versões.

Runtime, catálogo, receitas e piloto congelados são os desta candidata. O arquivo completo tests/combat.cjs mudou somente nas contagens antigas das assertions; o prefixo efetivamente usado como harness é idêntico byte a byte. O bootstrap do primeiro coordenador falhou antes de iniciar partidas por um argumento de console incorreto; o erro foi preservado e a execução nova manteve sementes/política.

O arquivo [QA controlado](data/build63-qa.json.gz) reúne regressão, migração, fixtures de engine/áudio, scanner numérico e capturas. Estes resultados não são a matriz final de30, desempenho real, telefone físico ou aprovação integralG01.
