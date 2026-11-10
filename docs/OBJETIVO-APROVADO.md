# Objetivo aprovado — Screwvivors 1.0

Concluir o Screwvivors 1.0 como um jogo completo, estável, satisfatório e documentado. Encerrar o projeto somente quando todos os critérios obrigatórios abaixo estiverem comprovados por evidências da versão final.

A conclusão não pode ser baseada em quantidade de versões, esforço gasto, tempo de trabalho, aparência de acabamento ou testes antigos. Deve ser demonstrada na revisão final do jogo.

Esta meta incorpora o trabalho de integração de sistemas compatíveis de 20 Minutes Till Dawn, mantendo a identidade e as decisões próprias de Screwvivors.

Não ampliar continuamente o escopo depois que os critérios forem cumpridos. Melhorias posteriores passam a constituir uma nova meta.


## 1. IDENTIDADE E REGRAS QUE NÃO PODEM RETROCEDER

Preservar:

- Gato piloto, robôs, zumbis, sucata, cidade industrial e Dr. Biruta.
- Identidade visual industrial, com interface ciano e diferenciação clara dos perigos.
- Arte, nomes, textos, música e código próprios.
- Mira e disparo manuais.
- Celular na horizontal.
- Movimento, mira e disparo independentes no controle por toque.
- Arena sem bordas e sem vitória automática por relógio.
- Chefes recorrentes e continuidade das ondas durante suas lutas.
- Chassi e conjunto de armas escolhidos antes da tentativa e mantidos durante ela.
- Aprimoramentos temporários, perdidos ao iniciar outra tentativa.
- Parafusos e peças de fabricação persistentes após a morte.
- Metaprogressão por desbloqueio de equipamento, sem transformar atributos temporários em bônus permanentes.
- Separação entre desenvolvimento e versão pública.

Os vinte minutos usados nos testes são uma janela de avaliação. Não devem virar uma condição de vitória ou encerramento do modo infinito.


## 2. CONGELAMENTO DO ESCOPO FINAL

Antes da auditoria de encerramento:

1. Consolidar o contrato vigente, o mapa de integração e o inventário real do jogo.
2. Identificar todos os requisitos aprovados e todas as pendências compatíveis.
3. Criar uma matriz com:
   - Identificador.
   - Origem do requisito.
   - Comportamento esperado.
   - Implementação correspondente.
   - Teste de aceitação.
   - Evidência.
   - Situação.
4. Distinguir:
   - Implementado e validado.
   - Implementado, mas ainda sem validação suficiente.
   - Parcialmente implementado.
   - Não implementado.
   - Incompatível com uma decisão explícita do criador.
5. Não classificar um sistema como implementado apenas porque existe outro com nome ou aparência semelhante.

Resolver todas as pendências compatíveis do mapa, incluindo as famílias ainda abertas de:
- Entidade alimentada por tiros.
- Ciclo de munição e último disparo.
- Janela ofensiva de recarga.
- Reserva de proteção e condições de manutenção.
- Gatilhos específicos e conversões de estado ainda sem disposição final.

Um sistema somente pode ser excluído por conflito demonstrável com os preceitos aprovados. Dificuldade técnica, custo de implementação, prazo ou dificuldade para passar nos testes não justificam retirar requisitos.

Não copiar conteúdo externo nem importar mecanicamente sistemas que contrariem o jogo pretendido.


## 3. DEFINIÇÃO DE DEFEITOS E QUALIDADE MÍNIMA

A versão final deve ter:

- Zero defeitos P0 abertos.
- Zero defeitos P1 abertos.
- Zero exceções não tratadas nos ensaios obrigatórios.
- Zero estados numéricos inválidos, incluindo NaN e Infinity.
- Zero corrupção de progresso.
- Zero recompensas duplicadas.
- Zero comandos presos após transições.
- Zero dependências ausentes no pacote final.

Classificação:

P0:
- Jogo não abre.
- Falha persistente que impede jogar.
- Perda ou corrupção irrecuperável de progresso.
- Execução insegura de dados importados.

P1:
- Violação de regra central de combate.
- Dano ou efeitos aplicados quando deveriam estar bloqueados.
- Travamento de menus, escolhas ou progressão.
- Movimento ou disparo preso.
- Compras ou recompensas incorretas.
- Controle essencial inacessível.
- Falha do jogo offline.
- Estado numérico inválido.
- Problema que impede completar um fluxo obrigatório.

P2:
- Falha localizada com alternativa utilizável, sem perder progresso nem violar uma regra central.

P3:
- Defeito cosmético que não compromete leitura, interação ou funcionamento.

Não reclassificar defeitos graves como menores para conseguir encerrar a meta. Todo defeito residual deve ter reprodução, impacto e situação registrados.


## 4. TESTES FUNCIONAIS OBRIGATÓRIOS

Todos os testes aplicáveis devem passar no mesmo commit candidato final.

Validar, no mínimo:

Controles:
- Movimento por teclado.
- Mira e disparo pelo mouse.
- Movimento e mira simultâneos por toque.
- Dois ponteiros independentes.
- Liberação do botão de disparo.
- Cancelamento de ponteiro.
- Perda de foco.
- Troca de tela.
- Pausa.
- Morte.
- Reinício.
- Rotação do celular.
- Ausência de retomada automática indevida.

Combate:
- Consumo de munição.
- Cadência.
- Recarga completa e parcial.
- Rajadas.
- Pellets.
- Perfuração.
- Ricochete.
- Retorno de projéteis.
- Explosões por contato e expiração.
- Críticos.
- Empurrão recebido.
- Limites de entidades.
- Fontes de dano.
- Atribuição correta à arma emissora.
- Efeitos secundários e limites de propagação.

Aprimoramentos:
- Pré-requisitos.
- Elegibilidade.
- Custos.
- Ganhos.
- Composição de multiplicadores.
- Limites.
- Ausência de repetição proibida.
- Callbacks antigos.
- Escolhas recusadas.
- Aplicação somente no momento permitido.
- Reset completo entre tentativas.

Escudos:
- Absorção correta do dano.
- Golpe de quebra sem transferir excedente ao corpo.
- Bloqueio dos estados proibidos.
- Transição de comportamento somente no inimigo correto.
- Ausência de queimadura, frio ou corrosão indevidos em golpes absorvidos.

Horda e chefes:
- Nascimento fora da tela.
- Distribuição circular.
- Grupos e intervalos corretos.
- Tetos de população.
- Gatilhos de reposição.
- Reentrada de inimigos distantes sem renovar vida ou escudo.
- Agenda dos chefes.
- Ataques, fases, telegráficos e lacaios.
- Recompensas únicas.
- Baús físicos.
- Indicadores do minimapa.

Equipamento:
- Estados independentes entre armas.
- Custos por quantidade de armas.
- Recargas e rajadas separadas.
- Reforjas por espaço.
- Preservação dos projéteis antigos.
- Ausência de transferência indevida de carga ou munição.

Persistência:
- Perfil novo.
- Perfil legado.
- Dados inválidos.
- Armazenamento indisponível.
- Compra sem saldo.
- Falha ao gravar.
- Migração idempotente.
- Recursos mantidos após a morte.
- Ausência de atributos temporários no save permanente.


## 5. MÉTRICAS DE BALANCEAMENTO DAS DEZ BUILDS

Executar uma matriz homogênea de:

- Dez receitas canônicas.
- Três sementes fixadas antes dos resultados:
  20261130, 20261201 e 20261202.
- Trinta tentativas no total.
- Vinte minutos ativos de simulação por tentativa.
- Mesma revisão de física, catálogo, receitas e piloto.

As sementes são identificadores pseudoaleatórios, não datas de agendamento.

Critério de aprovação:

- Pelo menos 27 das 30 tentativas devem ser viáveis.
- Cada receita deve passar em pelo menos duas das três sementes.

Uma tentativa é viável somente se:
- Sobreviver por 1.200 segundos ativos.
- Derrotar pelo menos três chefes.
- Adquirir as quatro melhorias centrais da receita.
- Não apresentar erro funcional ou numérico.

Não permitir nas tentativas naturais:
- Invulnerabilidade.
- Dano adicional escondido.
- Cura adicional escondida.
- Chefes mortos por comando.
- Relíquias concedidas artificialmente.
- Ofertas alteradas para garantir a build.
- Suspensão de ondas.
- Remoção de inimigos vivos para aliviar o teste.

É permitido desbloquear previamente somente o equipamento necessário para montar a receita, registrando essa preparação.

Guardar todas as mortes, tentativas incompletas, receitas que não montaram e casos com poucos chefes.

Uma política que prefere determinada melhoria entre opções legais deve ser identificada como experimento separado. Não pode substituir silenciosamente resultados ruins do piloto canônico.

Não juntar resultados de versões diferentes e apresentá-los como uma única matriz final.


## 6. VALIDAÇÃO DOS MOTORES DE BUILD

Para cada motor importante, provar:

- Como é adquirido.
- Quais atributos entram no cálculo.
- Qual é a fórmula.
- Qual condição o ativa.
- Qual condição o interrompe.
- Quais fontes podem ativá-lo.
- Quais fontes são proibidas.
- Como se combina com outras melhorias.
- Qual é o teto.
- Como funciona em pausa, morte e reset.

Incluir:
- Dano balístico.
- Crítico.
- Fogo.
- Frio.
- Eletricidade.
- Explosão.
- Corrosão.
- Drones.
- Sensores.
- Rotores.
- Cura.
- Vida convertida em dano.
- Movimento convertido em dano.
- Maturação temporal.
- Conversão espacial de projéteis.
- Último cartucho e carga por arma.
- Demais motores compatíveis concluídos no mapa.

Diferenciar:
- Dano por impacto.
- Dano por projétil.
- Dano por disparo.
- Dano por carregador.
- Pico de dano.
- Dano sustentado incluindo recarga.

Não chamar um pico de multiplicador de DPS sustentado.


## 7. ESTABILIDADE DE LONGA DURAÇÃO

Executar uma sessão controlada de pelo menos sessenta minutos simulados.

Verificar:
- Continuidade do modo infinito.
- Repetição dos ciclos de todos os chefes.
- Escalada prevista da horda.
- Ausência de encerramento por relógio.
- Limites de projéteis e entidades temporárias.
- Filas de efeitos, avisos e rajadas.
- Estado de áudio.
- Consistência do minimapa.
- Ausência de crescimento descontrolado de memória ou objetos.
- Ausência de erros numéricos.

Fixtures de proteção podem ser usadas neste ensaio para observar estabilidade, desde que identificadas. Não contam como prova de sobrevivência ou balanceamento natural.


## 8. DESEMPENHO REAL

Medir desempenho em hardware identificado.

PC:
- Viewport de referência: 1280×900.
- Pelo menos dez minutos ativos por cenário.
- Intervalo real entre quadros:
  p95 ≤20 ms em carga normal.
  p95 ≤40 ms em estresse.

Celular:
- Pelo menos um aparelho físico identificado.
- Orientação horizontal.
- Pelo menos dez minutos ativos em cenário representativo.
- Intervalo real entre quadros:
  p95 ≤40 ms.
- Controles funcionais e acessíveis durante a medição.

Em ambos:
- Razão entre tempo simulado e tempo real ativo entre 0,95 e 1,05.
- Registrar hardware, sistema, navegador, resolução, escala e modo de energia.
- Registrar aquecimento e processos concorrentes.
- Guardar amostras brutas e percentis.

Contar tempo ativo somente com a aba visível e o jogo em execução. Pausa e telas de escolha devem ser separadas.

Não aceitar desaceleração da simulação como bom desempenho. O limite atual de dt pode fazer o relógio do jogo avançar mais devagar sob carga; medir isso explicitamente.

O estresse deve ser definido antes da execução e incluir:
- Teto previsto de inimigos comuns.
- Até quatrocentos projéteis do jogador.
- Chefe e lacaios.
- Suportes e estados relevantes.
- Contagens reais dos projéteis hostis.

Não declarar um teto global de hostis sem comprovação de todas as fontes.

Não obter aprovação removendo inimigos vivos, diminuindo dano, interrompendo ataques ou apagando efeitos que participam da mecânica.

Tempo de tick não é FPS.
Tempo de desenho não é tempo de apresentação.
Emulação desktop não é teste de celular físico.


## 9. INTERFACE, CONTROLES E EXPERIÊNCIA

Validar os fluxos completos em:
- 1280×900.
- 844×390.
- 740×360.

Percorrer:
- Menu.
- Garagem.
- Desbloqueio de equipamento.
- Seleção de chassi e armas.
- Configuração da tentativa.
- Combate.
- Melhoria normal.
- Gambiarra.
- Especialização.
- Reforja.
- Baú de chefe.
- Pausa.
- Morte.
- Reinício.
- Retorno à garagem.
- Painel de configuração e compêndio.

Exigir:
- Zero transbordamento horizontal.
- Botões essenciais visíveis ou alcançáveis por rolagem clara.
- Texto legível.
- Ganhos, custos e condições compreensíveis.
- Barra do chefe alinhada ao restante do HUD.
- Avisos sem permanecer indevidamente no centro da ação.
- Indicadores de inimigos e chefes distantes utilizáveis.
- Estados das armas identificáveis separadamente.
- Ausência de controles escondidos pelos pads de toque.
- Pausa por retrato sem retomada automática.

Registrar capturas e testes reproduzíveis. Não considerar uma tela aprovada apenas porque abriu sem exceção.


## 10. ARTE, ANIMAÇÃO, MÚSICA E EFEITOS

O jogo final deve ter apresentação funcional e coerente para todo o conteúdo entregue.

Verificar:
- Identidade dos seis chassis.
- Aparência das doze armas.
- Inimigos comuns, policiais e chefes.
- Idle e movimento.
- Direção do personagem.
- Dano recebido.
- Disparo.
- Recuo.
- Recarga.
- Preparação e execução de ataques.
- Morte.
- Recompensas.
- Efeitos das melhorias especiais.

Áudio:
- Música no menu.
- Música na garagem.
- Música no combate.
- Transições entre cenas.
- Timbres das armas.
- Impactos, recargas, dano, chefes, melhorias e coleta.
- Gesto inicial para desbloqueio do áudio.
- Mute e volumes.
- Limites de vozes.
- Ausência de som acumulado ou preso após sair de uma tela.

Preservar a direção synthwave suave e atmosférica aprovada.

Renderização não pode consumir RNG de combate nem alterar física, atributos ou relógio. Pausa deve congelar a animação de combate.

Testar ausência ou falha de assets e os fallbacks previstos.


## 11. DOCUMENTAÇÃO MESTRE DE RECONSTRUÇÃO

Entregar um Markdown autossuficiente, detalhado o bastante para outra IA reconstruir um jogo muito parecido sem consultar o código original.

O documento precisa conter:

A. Visão do jogo
- Tema.
- Personagens.
- Fantasia do jogador.
- Objetivo da tentativa.
- Ciclo principal.
- Plataformas.
- Preceitos e exclusões.

B. Inventário completo
- Chassis e atributos.
- Passivas.
- Armas.
- Munição.
- Cadência.
- Recarga.
- Projéteis.
- Reforjas.
- Melhorias normais.
- Pré-requisitos.
- Gambiarras.
- Especializações.
- Experimentos.
- Relíquias.
- Receitas das dez builds.
- Conteúdo do painel editável.

C. Fórmulas
- Dano.
- Multiplicadores.
- Crítico.
- Armadura.
- Cura.
- Recarga proporcional.
- XP.
- Nível.
- Alcance.
- Movimento.
- Empurrão.
- Spawn.
- Escalada.
- Vida e força dos chefes.
- Custos e desbloqueios.
- Limites de todos os efeitos especiais.

D. Arquitetura funcional
- Estados e transições.
- Ordem de atualização.
- Relógios.
- Pausa.
- Entrada.
- Física.
- Colisões.
- Agenda da horda.
- Agenda dos chefes.
- Ofertas.
- Recompensas.
- Save.
- Migrações.
- Reset.

E. Inimigos e chefes
- Valores.
- Comportamentos.
- Distâncias.
- Velocidades.
- Cadências.
- Projéteis.
- Fases.
- Telegráficos.
- Lacaios.
- Recompensas.
- Interações com estados e escudos.

F. Direção visual e sonora
- Paleta e funções das cores.
- Tipografia.
- Hierarquia.
- Posicionamento do HUD.
- Escalas e silhuetas.
- Estados de animação.
- Direções e pivôs.
- Camadas de desenho.
- Identidade dos efeitos.
- Música e transições.
- Eventos sonoros.
- Fallbacks.

G. Testes
Para cada requisito:
- ID.
- Regra.
- Preparação.
- Entradas.
- Passos.
- Resultado esperado.
- Valores e tolerâncias.
- Casos de borda.
- Gravidade da falha.
- Evidência necessária.
- Situação.

H. Reprodução técnica
- Como executar offline.
- Estrutura lógica de arquivos.
- Esquema de save.
- Esquema de configuração.
- Comandos de teste.
- Ambiente.
- Sementes.
- Protocolo de medição.
- Empacotamento.
- Publicação.

Não usar “ver o código original” ou “funciona como o jogo de referência” como única explicação de uma regra necessária.

Não inventar valores para preencher lacunas. Identificar, resolver e validar as lacunas antes da conclusão.


## 12. EVIDÊNCIAS E AUDITORIA FINAL

Cada gate precisa ter:
- Identificador.
- Critério previamente definido.
- Commit.
- Hash das fontes relevantes.
- Ambiente.
- Comando ou procedimento.
- Data.
- Resultado.
- Código de saída quando aplicável.
- Dados brutos.
- Caminho do artefato.
- Limitações.

Resultados antigos não aprovam automaticamente código novo.

Uma mudança de física, dano, pool, receita, equipamento ou piloto exige refazer os ensaios afetados. Mudanças exclusivamente visuais exigem retestar a apresentação e registrar o diff.

Não excluir resultados negativos.
Não escolher somente as melhores rodadas.
Não mudar sementes depois de observar falhas.
Não enfraquecer assertions para conseguir aprovação.
Não interpretar ausência de erro como prova suficiente de qualidade.


## 13. COORDENAÇÃO E AUTONOMIA

Usar os chats do projeto nas suas áreas de responsabilidade. Quando não conseguirem suprir uma necessidade, usar agentes para preencher a lacuna.

Distinguir:
- Revisão de código.
- Teste executado.
- Fixture sintética.
- Partida natural.
- Emulação.
- Dispositivo físico.
- Avaliação visual.
- Avaliação humana de qualidade.

Não atribuir a um chat ou agente uma validação que ele não executou.

Prosseguir autonomamente nas ações já autorizadas. Se faltar evidência externa ou hardware, registrar a pendência e continuar o trabalho independente, sem declarar aprovação fictícia.


## 14. PUBLICAÇÃO E COMUNICAÇÃO

A cada versão estável:
- Executar os testes apropriados.
- Gerar e validar o pacote.
- Publicar no GitHub.
- Verificar os hashes remotos.
- Manter main e codex/desenvolvimento no mesmo commit validado.
- Enviar mini relatório para vbg.brumgoes@gmail.com.
- Registrar o identificador da mensagem enviada.

O pacote final deve ser extraído numa pasta nova e funcionar offline por index.html, sem depender de outputs, servidores anteriores ou arquivos fora do ZIP.

A promoção da branch pública continua dependendo da aprovação exigida pelo contrato de canais. Não confundir conclusão técnica com aprovação pública.


## 15. CONDIÇÃO EXATA PARA TERMINAR

Declarar o projeto TERMINADO somente quando:

- Todas as pendências compatíveis estiverem resolvidas.
- Zero P0/P1 estiverem abertos.
- Todos os testes obrigatórios estiverem aprovados.
- A matriz das builds cumprir os limites globais e por receita.
- A estabilidade de sessenta minutos estiver comprovada.
- Os critérios de desempenho real estiverem cumpridos.
- Os fluxos de PC e celular horizontal estiverem aprovados.
- Arte, animações, música e efeitos estiverem completos no escopo.
- O save e as migrações estiverem íntegros.
- O ZIP final estiver validado.
- O Markdown de reconstrução e checklist estiver completo.
- A auditoria estiver vinculada ao mesmo commit final.
- A publicação e o relatório estiverem verificados.

Então:
1. Criar o termo de conclusão com evidências e limitações.
2. Atualizar o status do projeto para CONCLUÍDO tecnicamente.
3. Marcar esta meta como concluída.
4. Entregar o Markdown mestre e o pacote final.
5. Encerrar a expansão automática do projeto.

Se qualquer requisito obrigatório estiver pendente, contradito ou sustentado apenas por evidência fraca, manter EM DESENVOLVIMENTO e continuar o trabalho.

Não apresentar uma porcentagem global inventada. Informar quais gates passaram, quais falharam e quais ainda não foram medidos.


---
Fonte: objetivo fornecido pelo criador em 09/11/2026. Normalização apenas de escapes Markdown e entidades HTML; critérios preservados. SHA-256 do arquivo original: `9a1606cccbfbe10fc763ecd373053ee62da4ea6a5733ef053d9dd6bbd318c28c`.
