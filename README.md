# Screwvivors — BUILD 61 · desenvolvimento

O download padrão de **Code → Download ZIP** na branch `main` contém o desenvolvimento mais recente enviado ao GitHub. Recursos experimentais estão incluídos. O canal `codex/publico` é separado e ainda é uma candidata histórica, sem aprovação de lançamento atualizada.

Sobrevivência 2D para navegador em HTML/CSS/JavaScript, sem dependências de execução. A [documentação](docs/README.md) distingue decisões aprovadas e propostas. Arte atual é provisória.

O projeto está **em desenvolvimento**. A [meta de conclusão](docs/META-DE-CONCLUSAO.md) define os critérios de aceite; a [especificação de reconstrução e testes](docs/SCREWVIVORS-ESPECIFICACAO-E-TESTES.md) descreve regras, fórmulas, conteúdo e 291 casos de verificação. A existência desses casos não significa que os ensaios finais estejam aprovados.

## Jogar

No GitHub, use **Code → Download ZIP**, extraia e abra **index.html** no Chrome/Edge/Firefox. O ZIP antigo da pasta downloads não contém as atualizações.

Na garagem, comece com o chassi PROT-0001 e a metralhadora. Use parafusos e peças de chefe para desbloquear os outros equipamentos e avance por **Configurar incursão** e **Iniciar incursão**. BAST permite até duas armas e ENXA até três, com custos por quantidade; os demais usam uma. A arma não muda durante a tentativa. Saves antigos mantêm acesso ao equipamento do protótipo.

- WASD/setas: mover.
- Mouse: mirar.
- Segurar botão esquerdo: atirar.
- R: recarregar (recarga automática ao esvaziar). O tempo é proporcional à munição faltante: metade do carregador vazio = metade do tempo.
- P ou Esc: pausar/continuar.
- Espaço: propulsor, somente depois de adquirir a skill (4 s de recarga; sem invulnerabilidade).
- Colete núcleos para subir de nível. Clique numa opção (ou use1–3) para analisar vantagem, custo e árvore; confirme a instalação pelo botão ou Enter. É possível continuar sem melhoria.
- Nos níveis 3, 6 e 9, escolha uma Gambiarra temporária entre três alternativas, use as teclas 1–3 ou pule. Os efeitos somem na próxima tentativa.
- A faixa inicial de controles some após cinco segundos; o comando do propulsor aparece junto da arma após adquirir a skill.
- Zumbis surgem em grupos de quinze distribuídos ao redor do jogador; os grupos chegam em intervalos cada vez menores.
- Arena infinita, sem limite de mundo ou tempo final. A horda fica mais forte e os três chefes voltam em ciclos; ondas comuns continuam mesmo durante os chefes.
- Chefes trazem reforços próprios: CORREDOR, ATIRADOR ou RAJADA, identificados acima do inimigo. O HUD mostra quantos restam e confirma que as ondas comuns continuam ativas.
- A câmera acompanha o robô pela cidade. Saia das áreas sinalizadas antes dos ataques dos chefes.

Há 52 melhorias normais únicas em treze árvores: cada raiz abre três evoluções combináveis. Escolhas adquiridas não reaparecem. Alto Impacto, Overdrive, Perfuração e Depósito Ampliado dão ganhos diretos sem penalidade. Os outros módulos mantêm custos e condições descritos nas cartas. As 12 armas têm carregador e recarga próprios, maiores nas armas pesadas; reserva ilimitada neste protótipo. [Árvores, munição e valores experimentais](docs/arvores-e-municao.md). Skills, Gambiarras e Experimentos do Biruta somem em cada nova tentativa. Parafusos coletados e peças de chefe ficam salvos localmente mesmo após a morte; compras desbloqueiam equipamento sem conceder atributos permanentes. Os preços são experimentais e estão documentados em [design do jogo](docs/game-design.md). Perfuração, explosão e descarga interagem; o HUD informa as combinações. Chefes curam e deixam baús de peças temporárias sem penalidade; após esgotá-las, oferecem experimentos com custo descrito. Repetir configuração preserva somente o loadout na sessão; voltar à garagem permite mudar antes da próxima tentativa.

Alternativa com servidor local:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Abra http://127.0.0.1:8000/. No celular, jogue na horizontal com os dois direcionais de toque. Girar para retrato pausa a partida; voltar para horizontal exige continuar manualmente.

## Configurar skills

Na BUILD 40, **PROJETOS DE BUILD** abre dez roteiros de montagem no menu e na garagem. O catálogo atual tem seis chassis, 48 skills normais e 78 aprimoramentos no total. Os guias mostram arma, núcleo, ordem de aquisição, vantagens e fraquezas. Preparar um loadout exige possuir o equipamento e não concede módulos. [Resultados medidos e limitações](docs/resultado-dez-builds.md) · [Catálogo e regras das dez builds](docs/dez-builds.md) · [Pesquisa de referência e fontes](docs/pesquisa-builds-20mtd.md).

No menu, clique em **CONFIGURAR SKILLS** ou abra **painel-skills.html**. O painel do Manus foi adaptado ao catálogo real de 70 melhorias. Ele funciona offline, com os arquivos do ZIP extraídos juntos.

Edite uma melhoria na aba **Efeitos** e clique em **Aplicar ao jogo**. Somente partidas iniciadas depois da aplicação usam os novos valores. As edições anteriores ao clique ficam em rascunho. Para aumentar um atributo em 10%, use **× 1,1**; **+ 10** soma dez unidades. Para valores fracionários, respeite o separador aceito pelo navegador.

Você pode editar modificadores diretos, níveis/requisitos das skills normais, criar skills normais, desativar originais e exportar/importar JSON. Comportamentos condicionais programados e os momentos das ofertas especiais continuam definidos pelo jogo. Raridade, grupo e árvore servem para organização. Alterar o balanceamento não muda seus parafusos, peças nem desbloqueios.

As configurações ficam neste navegador, dispositivo e origem; exporte JSON para transferir para outra instalação ou outro navegador. **Restaurar padrão** prepara o catálogo original no rascunho; clique em **Aplicar ao jogo** para confirmar. [Detalhes e recompilação do painel](tools/skills-panel/README.md).

## Verificar

```sh
node --check game.js
node tests/combat.cjs
node tests/sprite-animation.cjs
node tests/balance-panel.cjs
node tests/balance-migration.cjs
node tests/build-mechanics.cjs
node tests/weapon-evolution.cjs
node tests/corrosion.cjs
node tests/sensors.cjs
node tests/sensors-balance.cjs
node tests/corrosion-balance.cjs
node tests/build-comparison.cjs
node tests/builds-balance.cjs --bench-only
python tests/validate_walk_test.py
```

Os testes Python das ferramentas de arte exigem Pillow. O jogo não exige instalação de pacotes, serviços, chaves ou build.

Testes de lógica cobrem combate, dez minutos sem encerramento forçado, horda crescente e retorno dos chefes. O teste automatizado não substitui a avaliação visual nem o balanceamento com jogadores no navegador. [Parâmetros experimentais](docs/game-design.md) · [Plano de integração e regras contra regressões](docs/plano-integracao-20-minutes-till-dawn.md).

BAST-0002 usa sprite SVG provisório próprio. No perfil novo, o PROT-0001 e a Metralhadora são iniciais; demais armas e o BAST-0002 são desbloqueados na garagem. Saves do protótipo anterior preservam acesso a todo o catálogo. [Catálogo e preços experimentais](docs/game-design.md) · [Prompt de arte dos inimigos](docs/arte/prompt-inimigo-zumbi.md).

## Versões separadas

Esta pasta é o desenvolvimento (`codex/desenvolvimento`). A cópia pública local fica em `../Jogo-publico` (`codex/publico`). Execute `iniciar-desenvolvimento.ps1` para porta 8001 ou `iniciar-publico.ps1` para porta 8002. A base pública inicial é uma candidata histórica, não um lançamento atualizado aprovado. Veja [canais e promoção](docs/canais-e-lancamentos.md) e os estados em `version.json` de cada pasta.

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
