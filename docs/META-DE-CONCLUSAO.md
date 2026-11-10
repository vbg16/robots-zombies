# Meta de conclusão — Screwvivors 1.0

Definida em 09/11/2026 pelo pedido do criador. Esta meta substitui a expansão indefinida por uma entrega verificável, incorporando a integração compatível já autorizada. Não concede permissão para ignorar pendências, rebaixar critérios depois de falhas ou declarar versões de desenvolvimento como aprovadas pelo público.

**Objetivo:** entregar Screwvivors 1.0 completo no escopo local para navegador em PC e celular horizontal, com os sistemas compatíveis do mapa resolvidos, dez builds funcionais, controles manuais, progressão temporária e metaprogressão por desbloqueios; comprovar qualidade, estabilidade, desempenho real e documentação suficiente para reconstrução independente.

**Situação de partida:** NÃO CONCLUÍDO. Última versão publicada: BUILD59, commit c8164b482ccdbbc116a81d26fe6b14e014eba4f1. O workspace contém candidata BUILD60 com alterações ainda não publicadas. O rótulo do version.json não prova publicação ou aprovação. O criador atualizou a meta do aplicativo para apontar o arquivo de objetivo, lido integralmente. A fonte normativa está reproduzida em OBJETIVO-APROVADO.md; este documento organiza seus critérios operacionais.

## Critérios obrigatórios de aceite

| ID | Medida e condição para aprovação | Evidência exigida |
|---|---|---|
| G01 | Zero defeitos P0 ou P1 abertos; zero travamentos, exceções não tratadas, NaN/Infinity ou corrupção de save nos ensaios finais. | Lista de defeitos com reprodução, prioridade e reteste; logs íntegros. |
| G02 | 100% dos testes obrigatórios aplicáveis passam na MESMA revisão candidata. Nenhum caso pulado silenciosamente. | Manifesto com comando, hash, ambiente, início/fim, código de saída e artefato. |
| G03 | Dez receitas × três sementes previamente fixadas = 30 tentativas naturais. Pelo menos27/30 viáveis e cada receita pelo menos2/3. | Dados brutos de todas as tentativas, inclusive mortes/menos chefes, com piloto e fontes congelados. |
| G04 | Tentativa viável: sobreviver1200 segundos ATIVOS de simulação, derrotar ≥3chefes e adquirir as quatro skills centrais daquela receita. Sem poderes/abates/relíquias forçados ou horda suspensa. | Telemetria de ofertas aceitas, vida, abates, chefes, XP e equipamento. Só equipamento pode ser previamente desbloqueado para montar a receita. |
| G05 | Uma execução de estabilidade de60minutos simulados percorre ciclos de todos os chefes, sem final por relógio, estado inválido, fila descontrolada ou crescimento ilimitado de entidades temporárias. | Log por minuto e contagens; fixture de invulnerabilidade só pode ser usada aqui, identificada, sem contar como sobrevivência natural. |
| G06 | PC identificado: p95 do intervalo REAL entre quadros ≤20ms em carga normal e ≤40ms em estresse especificado; razão tempo simulado/tempo real ativo entre0,95e1,05. | Captura no navegador visível por pelo menos10minutos por cenário, viewport1280×900, hardware/OS/browser/modo de energia registrados, abas em primeiro plano. Medir requestAnimationFrame, não inferir FPS de tempo de tick. |
| G07 | Um celular físico identificado, horizontal: p95 do intervalo real de quadros ≤40ms e razão simulado/real entre0,95e1,05 em sessão ativa de10minutos representativa. Sem clipping ou comandos presos. | Modelo/OS/browser/resolução/escala e registro de quadros; emulação desktop NÃO satisfaz este critério. Outros aparelhos só estão cobertos se medidos. |
| G08 | Carga normal e estresse definidos ANTES da medição. Estresse inclui teto de180comuns e400projéteis do jogador, chefe/lacaios e efeitos suportados; limite400 e teto de comuns respeitados. Sem retirar vivos/efeitos de dano para passar. | Fixture congelada com fingerprint, posições, vida, munição, módulos e contagens. Registrar também hostis reais;200 não é teto global garantido porque chefes têm emissões próprias. |
| G09 | Fluxos completos aprovados em1280×900,844×390e740×360: menu→garagem→configuração→combate→escolhas/pausa→morte→reinício/garagem; zero transbordamento horizontal. | Capturas e assertions de botões alcançáveis, texto e posição dos painéis; oferta e pausa realmente congelam o combate. |
| G10 | Controles de mouse/teclado/toque aprovados: dois ponteiros independentes, liberação/cancelamento/blur/rotação/transições; zero tiro ou movimento preso; retrato pausa e não retoma sozinho. | Automação de captura e teste no dispositivo de G07. |
| G11 | 100% das pendências COMPATÍVEIS do mapa de integração resolvidas e testadas. Decisões incompatíveis precisam citar preceito explícito do criador. Não usar “fora de escopo” por dificuldade, custo, prazo ou para atingir a meta. | Matriz requisito→regra→implementação→teste→resultado; itens ainda pendentes não podem virar concluídos por semelhança de nome. |
| G12 | Animações/arte/áudio presentes nos fluxos suportados: seis chassis, todas as armas e chefes, movimento/idle/dano/disparo/recarga, música de menu/garagem/combate e transições. Nenhum render consome RNG de combate ou avança relógio em pausa. | Checklist visual e de sinal/eventos; teste de mute/gesto inicial/vozes; fallback de asset que falha. Estética industrial própria, gato piloto e Dr.Biruta preservados. |
| G13 | Perfil íntegro: recursos ganhos persistem na morte/reabertura; compras não duplicam/descontam em falha de save; migrações idempotentes; nenhum atributo temporário passa à tentativa seguinte. | Casos perfil novo, legado, JSON inválido, armazenamento indisponível e compra sem saldo. |
| G14 | Pacote offline completo: ZIP do commit final extraído numa pasta nova abre index.html e percorre os fluxos sem rede, dependência de outputs ou arquivos locais externos. | Lista de recursos, hashes do ZIP/commit, smoke test do arquivo extraído. Dependências de testes podem ser externas; execução do jogo não. |
| G15 | Especificação de reconstrução completa: todos os itens do inventário possuem valores, fórmulas, estados, condições, limites, apresentação e casos de teste. Zero “ver código original” como única descrição de um comportamento necessário. | Markdown mestre + anexos embutidos, verificação de contagens e revisão independente. |
| G16 | Publicação verificável de versão estável: main e codex/desenvolvimento no mesmo hash validado; minirrelatório enviado ao e-mail autorizado e ID registrado. A branch pública só muda com a aprovação já exigida pelo contrato de canais. | git ls-remote, versão do ZIP, mensagem SENT. Conclusão técnica não falsifica aprovação pública. |

## Protocolo de medição e congelamento

1. Selecionar e registrar o commit candidato antes de rodar os gates. Uma mudança de física, dano, pool, equipamento ou algoritmo exige refazer os ensaios afetados. Ajustes exclusivamente visuais ainda exigem retestar a apresentação e registrar o diff.
2. Sementes finais de G03:20261130,20261201,20261202. São identificadores pseudoaleatórios, não datas de agendamento. Fixadas agora; não trocar depois de observar resultados. As dez receitas usam as mesmas três sementes.
3. Driver canônico: versão e hash registrados; piloto smart13/safe se ainda vigente. Uma política que prefere a relíquia nova entre ofertas legais é experimento separado e não pode substituir resultados canônicos ruins. Alterar piloto exige protocolo novo, mantendo os dados antigos.
4. Não combinar nove receitas de uma revisão com uma receita de outra e chamar isso de matriz homogênea30. Experimentos anteriores são evidência histórica, não aprovação automática do commit final.
5. Em G06/G07, contar tempo real apenas enquanto a aba estiver visível, o jogo em playing e sem telas de escolha/pausa. Registrar separadamente duração de parede, duração ativa e duração simulada. O clamp atual de dt em0,04 pode desacelerar o jogo sob carga; esse atraso não pode virar “boa sobrevivência”.
6. Usar percentis por ordenação: p95 é o elemento ceil(0,95N)-1 da amostra ordenada. Guardar todos os valores, não só médias ou melhores rodadas. Registrar aquecimento, carregamento e concorrência de processos.
7. Métricas de tick/desenho sintético diagnosticam CPU; não substituem intervalo de apresentação real, GPU, celular físico ou percepção humana.
8. Revisar funcionalidade com a configuração padrão de produção e limites documentados do painel. Configurações inválidas precisam ser recusadas, não tornar o teste silenciosamente inválido.

## Gravidade dos defeitos

- **P0:** perda/corrupção irrecuperável de progresso, execução insegura de dados importados, jogo não abre ou crash persistente.
- **P1:** violação de regra central, travamento de fluxo/controle, estado numérico inválido, recompensa duplicada, aplicação de dano/estado proibido, falha no pacote offline ou controle principal inacessível.
- **P2:** falha localizada com alternativa utilizável, sem mudar regra de combate ou perder progresso. Deve ter reprodução e decisão explícita; não reclassificar P1 como P2 para encerrar.
- **P3:** detalhe cosmético que preserva legibilidade e interação. Registrar sem ocultar.

## Estado inicial das evidências — não é aceite

- Há suítes históricas aprovadas e BUILD59 publicada. A candidata60 ainda está em trabalho e não herda automaticamente a aprovação dos gates finais.
- A matriz candidata60 anteriormente observou9/10viáveis numa única semente; isso não satisfaz G03/G04. A Oficina falhou em chefes e permanece no denominador.
- Benchmarks recentes de carga extrema registraram mais de100ms por tick em algumas fixtures. Não satisfazem G06 nem podem ser convertidos diretamente em FPS.
- Falta evidência de celular físico para G07.
- A matriz intermediária com ambas as correções de escudo, fonte6ab2f00a8abf356809e05b98de5d4cf15dcd5d0fcd92cbbb03eca169587349f7, obteve10/10viáveis em20261107; quatro skills centrais,4–7chefes,1200s e estado finito. Fontes/dados estão em build60-current-summary.json e data/build60-current-runs.json.gz. Não substitui G03/G04 nem aprova as30tentativas finais.
- A especificação mestre descreve274casos de aceite e passa na checagem estrutural de catálogos/hashes/links. Isso não é execução dos274casos nem aprovação automática de G15.
- Há pendências compatíveis no mapa (entidade alimentada por tiros, janela ofensiva de recarga, proteção condicionada e outros gatilhos). G11 está aberto.
- A extração reproduziu um P1 de escudo (fogo/frio atravessavam absorção). Correção aplicada à candidata local e retestada em17fixtures; fonte anterior falha, evidência preservada. Regressões de baús/reforjas/Culatra/Colimador passaram. Uma segunda reprodução de stun elétrico no escudo também foi corrigida, com14fixtures adicionais. A matriz intermediária pós-impacto/pré-correção elétrica obteve10/10viáveis na semente20261107, sem aprovar a fonte posterior. A auditoria final de G01/G02 ainda está aberta; a comparação legada identifica a correção intencional da referência histórica.
- O limite200 de hostis só protege algumas fontes; não deve constar como teto global até haver implementação/medição que o prove.

## Quando declarar “TERMINADO”

Somente quando G01–G16 estiverem APROVADOS com evidência no commit final e a auditoria não encontrar requisito compatível aberto:

- Criar docs/TERMO-DE-CONCLUSAO.md com data, commit, hashes, ambiente, tabela dos gates, defeitos residuais P2/P3 e limites de plataforma explicitamente testados.
- Atualizar a documentação e o status de projeto para CONCLUÍDO tecnicamente, distinguindo a aprovação pública.
- Marcar a meta do aplicativo como complete somente se isso corresponder à verdade da auditoria. A ausência de suporte para editar a meta aberta não autoriza concluir uma meta não atingida.
- Publicar o pacote validado, enviar o relatório autorizado e encerrar a expansão automática. Novas funcionalidades passam a ser uma nova meta, não condição móvel adicionada depois do aceite.

Até lá: **EM DESENVOLVIMENTO / NÃO CONCLUÍDO**. Não há porcentagem global inventada; reportar gates aprovados/abertos e suas evidências.
