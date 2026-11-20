# BUILD70 — progressão unificada

- Gambiarras do Biruta somente no nível20: componente de chassi + modificação de cada arma em uma confirmação.
- Removidas ofertas especiais3/6/9/10 e experimentos instáveis.
- Baús esgotados oferecem módulo normal; painel74registros/revisão8 com migração.
- Mantida a colisão física da BUILD69.

# Histórico do Screwvivors

Os registros antigos abaixo preservam o contexto de cada versão. Regras superadas (como modo infinito, aceleração dos comuns e números antigos do catálogo) não são o contrato atual. Consulte o [contrato vigente](docs/contrato-atual.md).

## BUILD69 — correção de colisão

- Colisão física entre os corpos dos zumbis, além da preferência por bandos.
- Separação determinística de pilhas e filas, incluindo corredores, lacaios e policiais.
- Correção sem dano, remoção de inimigos, renovação de escudo ou consumo de RNG.
- Testes curtos de geometria/perseguição, pausa e navegador offline nas três resoluções.

[Contrato e evidências](docs/colisao-zumbis.md).

## BUILD68 — desenvolvimento

- Incursão de 20 minutos regressivos, com vitória em 00:00.
- Respiro de 120 pixels após instalar melhorias e preferência por bandos locais.
- Primeiro novo chefe: Prisma de Cerco aos 12 minutos decorridos, com lasers, animações e efeitos sonoros. O segundo novo chefe permanece adiado.
- Crescimento temporário por cura/corrosão preparado na candidata67, sem publicação separada daquela candidata.
- Lançador do bot adaptado ao término da incursão.
- 61 verificações selecionadas aprovadas; avaliação natural intermediária de dez tentativas: nove vitórias, dez núcleos completos. Rede de Plasma morreu aos 852,10s. Não é aprovação da matriz final.

[Relatório e limitações](docs/build68-verificacao.md) · [Regras da incursão](docs/incursao-vinte-minutos.md) · [Histórico67 preservado](docs/build67-historico.md).

## Registros anteriores

Os textos seguintes foram transferidos do README anterior, mantendo seus links e ressalvas. Datas de lançamento não foram inferidas a partir do número da BUILD.

BUILD34: controles iniciais somem após cinco segundos; o comando ESPAÇO aparece junto da arma após adquirir Propulsor. Zumbis comuns chegam de fora da tela correndo e desaceleram perto do robô. Música e efeitos originais usam WebAudio e iniciam após interação; ajuste MÚSICA/EFEITOS na garagem, com zero para silenciar. Verificação de áudio: node tests/audio.cjs.

BUILD35: ondas de15, intervalo6,4→1,5s; seguem durante chefes. Zumbis vivos distantes permanecem no mundo e no minimapa (borda para distantes, marcador dourado para chefe). Aproximação reduzida para210px/s e normal a320px. Sucateiro mantém distância180–240px; atiradores carregam armas visíveis. A população viva pode crescer: avaliar desempenho em partidas longas.

BUILD36: sem aceleração de aproximação para comuns. Após derrotar o segundo chefe, cinco de quinze zumbis são policiais, alternando atiradores e portadores de escudo. Escudo tem100 pontos; ao quebrar, somente o portador atingido passa a parar, mirar e investir em direção fixa. Pausa0,7s e corrida até240px a340px/s são parâmetros experimentais.

BUILD37: nova trilha synthwave suave e atmosférica, com arranjos próprios para menu, garagem e combate. Botão Ativar áudio no menu ou primeiro gesto libera WebAudio. Trocas de tela têm fade visual discreto, fade musical de saída/entrada e efeito curto; pausa/retorno têm sons próprios. Volume zero segue silenciando música/efeitos separadamente.

BUILD38: configuração depois de escolher loadout, bancada de módulos com descrição e árvore reunidas e HUD do chefe alinhado aos demais painéis. As referências visuais foram adaptadas à identidade industrial/ciano e ao modo infinito.

BUILD39: painel de balanceamento com as 54 melhorias reais, rascunho separado, aplicação explícita nas próximas partidas, importação/exportação e validação de requisitos, números e ciclos. O editor mantém os registros originais e permite desativá-los; novos módulos são do tipo Normal e usam efeitos diretos suportados.

BUILD40: dez projetos jogáveis, quatro novos chassis com três protocolos cada, árvore de drones, interações entre habilidades e armas especializadas, recarga reparadora sem exploração por munição parcial e migração do painel 54→70. Progressão, coleta, armas lentas e vida dos comuns foram ajustadas. Células verdes de reparo surgem a cada 25 abates; são pickups de vida, sem valor em parafusos. Agora há uma renovação das opções por nível normal. O modo continua infinito e os novos sprites são variantes provisórias. O relatório de testes separa bancada controlada, progressão real e a meta comparativa de 20 minutos.

BUILD41: no nível 20, escolha uma entre duas reforjas temporárias da arma equipada, ou recuse. São 24 opções consultáveis na garagem; os dez guias sugerem uma reforja própria. Sem troca ou fusão, sem munição grátis e com projéteis anteriores preservados. [Contrato vigente](docs/contrato-atual.md) · [Catálogo e validação das reforjas](docs/evolucao-armas.md).

BUILD42: Lança de Fuga passa a usar NANO + Arpão, coleta e reparo na recarga para sustentar mobilidade. A alternativa melhorou os seis pares testados e atingiu 20 minutos/três chefes em cinco deles, incluindo os dois sorteios novos; uma morte por volta de 19:56 segue como falha. Armas, inimigos e regras globais mantêm os atributos anteriores. [Reavaliação completa da BUILD41](docs/reavaliacao-build41.md) · [Hipóteses, comparação e limites da Lança de Fuga](docs/ajuste-lanca-de-fuga.md). O balanceamento geral não está aprovado.

BUILD43: árvore Reagentes de sucata com carga corrosiva adiada, iniciador rápido, respingo em uma geração e catalisador com fogo/gelo. Uma carga por alvo, sem renovar ou acumular; escudos bloqueiam a aplicação. Painel migra 70→74, preservando edições e IDs personalizados; novos campos de prazo/dano. Descrições padrão voltam a mostrar ganho/custo autorais. [Regras, dados e limitações](docs/corrosao-programada.md). As duas tentativas naturais do ensaio não cumpriram a meta de 20 minutos; a árvore continua experimental.

BUILD44: árvore Sensores de campo com pulso periódico, alcance, transmissão de fogo/frio e exposição para tiros manuais. Não dispara a arma, consome munição ou transmite procs recursivos; escudos protegem o corpo. Painel78 com migração74→78 e registros por revisão. HUD compacto mostra os seis cooldowns no celular. [Mecânicas e resultados](docs/sensores-de-campo.md): duas tentativas chegaram a 20 minutos; só uma também derrotou três chefes. Valores continuam experimentais.

BUILD48: os seis chassis caminham em quatro direções; BAST/FORJ/VOLT/NANO/ENXA têm identidades pixel art próprias, retratos e fallback vetorial. Sucateiro/Bobina ganharam passada, preparação e recuo procedurais. O menu exibe a versão correta e há checagem de integridade antes da entrega. [Arte, testes e limites](docs/chassis-e-chefes.md).

BUILD49: Rotores de Sucata acrescentam dois/três discos orbitais de contato, com quatro módulos próprios, sem gastar munição ou ativar efeitos de bala. Painel82 com migração da revisão4 para5 e três atributos novos. [Regras e resultados](docs/rotores-de-sucata.md), incluindo duas tentativas naturais que falharam no critério de sobrevivência. Valores seguem experimentais.

BUILD50: busca espacial dos vizinhos elétricos com estado/RNG preservados em18 pares. Melhora de simulação medida; multidões extremas continuam pesadas. [Resultados e limites](docs/vizinhos-eletricos.md).

BUILD51: BAST equipa atéduas armas e ENXA atétrês, com custos visíveis, recargas e reforjas independentes. Quatro tentativas automatizadas completas cumpriram20minutos+3chefes. [Arsenal avançado, regras e limites](docs/arsenal-avancado.md).

BUILD52: diretor procedural com limite de60→180 zumbis comuns vivos, gatilhos por abates/deslocamento e reentrada fora da tela de perseguidores distantes. Quatro melhorias de arma sem penalidades. [Regras e validação](docs/horda-procedural.md).

BUILD53: chefes deixam baús com12peças raras exclusivas, válidas sódurantea partida. Bot inteligente/simples executável por Testar-com-bot.cmd, com relatório e capturas. Projéteis usam a identidade da própria arma e sinalizam crítico. [Bot e uso](docs/bot-de-testes.md) · [Baús e regras](docs/baus-de-chefe.md).

BUILD54: bot avalia o risco imediato antes de buscar baús, preserva a busca de XP e consegue se aproximar sem exigir uma rota inteira vazia. A comparação conserva a morte original e o candidato rejeitado. [Evidências e limites](docs/bot-rotas-seguras.md).

BUILD55: avisos laterais, números de dano agrupados por alvo/fonte e crítico destacado. HUD compacto para celular na horizontal. Garagem e Configuração abrem no topo com foco no título. Correções revisadas pelos chats do projeto. [Leitura do combate e limites](docs/feedback-combate.md).

BUILD56: controles de toque para celular na horizontal, com movimento e mira independentes, recarga e propulsor adquirido. Rotação pausa sem retomar sozinha. [Regras e escopo dos testes](docs/controles-touch.md).

BUILD57: consultas de descarga reaproveitam geometria sem mudar poder/efeitos/RNG. Testador registra XP, alternativas e rotas e compara quatro perfis de entrada. [Medição e limites](docs/telemetria-e-balanceamento.md).

BUILD58: Baia de Comando calibra drones em três estágios durante a tentativa; LEDs mostram o progresso. Efeitos de impacto usam menos trabalho sem reduzir dano ou mudar sorteios. [Regras, medições e limites](docs/maturacao-e-desempenho.md).

BUILD59: Colimador de Campo fortalece tiros que atravessam uma área fixa à frente da mira, uma vez por projétil.13peças raras de baú; painel continua82. Guia Oficina prioriza alcance em lugar do pulso glacial de recarga, após cinco tentativas de20minutos+7chefes. [Contrato e testes](docs/colimador-de-campo.md).

BUILD63 (publicada em desenvolvimento): Banco de Reserva separado de HP, Ponte de Potência com escudo intacto, Circuito Preservado por tempo sem impactos e Retorno de Varredura por abates diretos do sensor. Painel86/revisão7 e compêndio102. [Fórmulas, limites e verificação](docs/reserva-e-manutencao.md). Avaliação intermediária:10/10canônicas e2/4em um experimento separado de preferência; falhas preservadas. Não é aprovação final de balanceamento.

BUILD64 (candidata): [Pistão de Retorno](docs/pistao-de-retorno.md) invoca uma ferramenta industrial ao terminar a recarga, com direção manual, potência proporcional à munição reposta e limite por arma.17relíquias/103artigos; painel86. Avaliação natural intermediária10/10canônicas e4/4em experimento separado; não aprova os gates finais.

BUILD65 (candidata): [Conversões Vitais](docs/conversoes-vitais.md) adiciona HP atual aos ataques dos drones e converte o último cartucho em pulso porHPmáxima.19peças raras/105artigos; painel86. Corrige ataques/coleta posteriores à morte dentro do mesmo quadro. Na fonte corrigida, avaliação intermediária10/10canônicas e4/4em experimento separado de preferência legal. Avaliação final e demais motores seguem abertos.
