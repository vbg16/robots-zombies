# Screwvivors 1.0 — especificação de reconstrução e verificação

**Estado: EM DESENVOLVIMENTO. Este arquivo não declara o projeto terminado.**

Levantamento iniciado em09/11/2026 e revisado em13/11/2026, fuso America/Sao_Paulo. No início deste levantamento, a última publicação confirmada era BUILD59, commit c8164b482ccdbbc116a81d26fe6b14e014eba4f1. A publicação mais recente confirmada é BUILD64, commited7834ce8d742a1499e9740804d00269ac852daa. Esta edição descreve a candidata BUILD65 ainda em implementação/validação, não publicada; o histórico Git identifica a revisão que efetivamente a entregou. O número na tela ou no version.json não prova publicação, estabilidade, desempenho, aprovação humana nem aceite dos gates. Os hashes source_hashes registram bytes do workspace; source_text_hashes normaliza somente CRLF→LF para validar também o ZIP Git, que usa LF. Nenhuma outra diferença de conteúdo é normalizada, e o verificador registra a diferença de terminação de linha.

Este documento contém instruções para outra IA implementar um jogo muito parecido sem possuir o repositório original. As tabelas são a baseline padrão da candidata atual; uma reconstrução pode usar outra arquitetura interna, mas precisa preservar regras, unidades, fontes de dano, sequência de decisões, conteúdo e observáveis. Não precisa reproduzir binários de arte pixel a pixel: deve desenhar assets originais equivalentes nas dimensões, silhuetas, cores, poses e camadas descritas. Nomes de arquivo originais servem à proveniência, nunca como única explicação de uma regra.

## Como usar este documento

1. Ler a meta aprovada e distinguir critérios de conclusão do comportamento do jogo. Alcançar20minutos no relógio de avaliação não encerra o modo infinito.
2. Implementar estados, mundo e controle antes de adicionar conteúdo; manter pixels lógicos separados da resolução do Canvas.
3. Implementar dados e fórmulas exatas das tabelas; não trocar multiplicação por soma nem confundir pellet com cartucho.
4. Implementar efeitos por fonte, escudos e snapshots antes de ligar sinergias. Um suporte que escolhe alvos não autoriza autoaim das armas manuais.
5. Implementar progressão, menus, perfil e editor com as validações descritas.
6. Desenhar assets equivalentes e sintetizar áudio pela receita; não copiar material de outro jogo.
7. Executar os casos de verificação e preservar os resultados negativos. A existência de um teste neste arquivo não significa que ele foi executado.
8. Resolver as pendências compatíveis e atualizar esta especificação antes de auditar o candidato final. Não inventar números para módulos ainda não projetados.

## Unidades e regras de leitura

- Mundo em pixels/unidades lógicas; tempos de combate em segundos ativos. Câmera, CSS, devicePixelRatio e escala de sprites não alteram alcance/hitbox.
- Dano por pellet difere de dano da salva; intervalo de disparo menor significa cadência maior. Dano de ciclo inclui recargas e não é o pico do último tiro.
- ×1,25 significa+25%; ÷1,25 significa−20%. Custos e ganhos multiplicativos não se somam como percentuais planos.
- Fonte primária, arma auxiliar e suporte devem manter atribuição própria. Exposição que só amplia bala não amplia automaticamente todos os efeitos.
- Toda condição temporal deve dizer se avança em playing. Pausa/ofertas/morte não envelhecem o combate.
- Fixtures podem usar inimigo imóvel, seed, relógio injetado, vida alta ou proteção para testar uma regra, mas devem se identificar e nunca contam como partidas naturais.
- Tolerância numérica padrão: erro absoluto≤1e-6 ou relativo≤1e-9; inteiros, tokens, IDs e estados exatos. Geometria tangente usa os desempates descritos; limite de quadro usa medição real própria.

## Inventário conferido da baseline atual

| Conteúdo | Quantidade |
|---|---:|
| Chassis |6|
| Armas |12|
| Módulos normais |56|
| Árvores normais |14|
| Gambiarras |6|
| Experimentos |6|
| Protocolos de chassi |18|
| Reforjas de arma |24|
| Relíquias de baú |19|
| Receitas de build |10|
| Registros editáveis padrão |86|
| Atributos numéricos editáveis |25|
| Artigos do compêndio de módulos/relíquias |105|

Os86editáveis são56+6+6+18; não somar reforjas ou relíquias nesse painel. A futura implementação de um motor compatível pode exigir conteúdo adicional: atualizar contagens, regras e regressões explicitamente, sem declarar os valores antigos como eternos nem criar cards vazios para aumentar inventário.

## Glossário matemático obrigatório — dano não é uma variável única

- B_s: dano base da arma na tabela, antes de quaisquer modificadores.
- W_s: campo slot.damage depois de passivas, custos do loadout e módulos. O atributo editável chamado Dano direto altera W_s.
- P=W_0: Wda arma primária. Os suportes atuais usam esse valor, não shotDamage.
- T_s: bônus Titânico=min(0,75×W_s,0,03×HPmáximo), somente se titan+armor adquiridos.
- D_s=shotDamage(slot)=W_s+T_s: dano antes de crítico/reparo/Culatra de um projétil novo.
- D_b: snapshot do projétil na emissão, D_s×crítico×reparo×Culatra. Colimador pode multiplicá-lo depois por evento espacial real, uma vez.
- Dano de drone=0,25×P×modDrone×maturação, com eventual foco de chefe. Sensor=0,35×P×modSensor, limitado a1e9; rotores=0,55×P×modRotor, limitado a1e9. Retaliação base=3×P. Nenhum desses recebe T_s sóporque a interface usa o termo genérico dano direto.

Exemplo aritmético controlado: W_0=22 e HPmáximo200 com titan+armor produzem T_0=6 e D_0=28. Sem outros bônus, drone=5,5, sensor=7,7 e rotor=12,1; não usar28como base desses suportes.

**Exceção observada de snapshot:** slot/directDamage só são registrados explicitamente no projétil em múltiplas armas. Em uma arma, b.damage, arma e traços continuam snapshots, mas os componentes Motor Cinético e Fratura Industrial consultam fallback P ATUAL no impacto/morte. Em multi, usam W_s capturado em directDamage. Condições de skills globais também são avaliadas no impacto. Reconstruir essa distinção atual ou tratar uma mudança como alteração explícita testada; não prometer que todo componente derivado é um snapshot universal.

## Defeitos, discrepâncias e o que ainda não está aprovado

- A extração encontrou fogo/frio/empurrão atravessando escudo policial em impacto. A fonte anterior falha num teste reproduzível. A candidata foi corrigida usando o estado blindado capturado ANTES do golpe;17fixtures e regressões específicas passaram. A auditoria seguinte também reproduziu atordoamento de choque atravessando escudo; shockAt agora captura o estado blindado antes do dano e bloqueia a instalação de stun inclusive na quebra.14fixtures adicionais protegem skill/protocolo, estado anterior e recuperação por dano corporal. Pulsos de controle sem dano, como recarga fria, são regras distintas. A reconstrução deve implementar a regra correta descrita neste documento. Não reproduzir o defeito para imitar a baseline histórica.
- O golpe que quebra o escudo continua sem transferir excedente ou estados ao corpo; o próximo golpe no corpo sem escudo pode aplicá-los. A correção não remove descargas/explosões secundárias já permitidas sobre outros alvos.
-200projéteis hostis não é um teto global demonstrado: algumas emissões de chefes não usam aquele guard. É dado de implementação a formalizar/testar, não garantia de segurança.
- O clamp de dt em0,04 pode fazer o jogo ficar em câmera lenta sob carga. Sobreviver1200s de simulação não demonstra1200s de parede com fluidez.
- As matrizes anteriores, ensaios com relíquia preferida e capturas são históricos de versões/configurações específicas. Não aprovam automaticamente os gates do commit final.
- Falta evidência de celular físico e desempenho real final. Emulação não substitui esses gates.
- Os motores compatíveis ainda pendentes aparecem no mapa incorporado abaixo. Esta especificação reconstrói extensamente a baseline atual e identifica o trabalho que falta; não descreve o projeto incompleto como terminado.



## Parte I — objetivo aprovado pelo criador


## Objetivo aprovado — Screwvivors 1.0

Concluir o Screwvivors 1.0 como um jogo completo, estável, satisfatório e documentado. Encerrar o projeto somente quando todos os critérios obrigatórios abaixo estiverem comprovados por evidências da versão final.

A conclusão não pode ser baseada em quantidade de versões, esforço gasto, tempo de trabalho, aparência de acabamento ou testes antigos. Deve ser demonstrada na revisão final do jogo.

Esta meta incorpora o trabalho de integração de sistemas compatíveis de 20 Minutes Till Dawn, mantendo a identidade e as decisões próprias de Screwvivors.

Não ampliar continuamente o escopo depois que os critérios forem cumpridos. Melhorias posteriores passam a constituir uma nova meta.


### 1. IDENTIDADE E REGRAS QUE NÃO PODEM RETROCEDER

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


### 2. CONGELAMENTO DO ESCOPO FINAL

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


### 3. DEFINIÇÃO DE DEFEITOS E QUALIDADE MÍNIMA

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


### 4. TESTES FUNCIONAIS OBRIGATÓRIOS

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


### 5. MÉTRICAS DE BALANCEAMENTO DAS DEZ BUILDS

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


### 6. VALIDAÇÃO DOS MOTORES DE BUILD

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


### 7. ESTABILIDADE DE LONGA DURAÇÃO

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


### 8. DESEMPENHO REAL

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


### 9. INTERFACE, CONTROLES E EXPERIÊNCIA

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


### 10. ARTE, ANIMAÇÃO, MÚSICA E EFEITOS

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


### 11. DOCUMENTAÇÃO MESTRE DE RECONSTRUÇÃO

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


### 12. EVIDÊNCIAS E AUDITORIA FINAL

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


### 13. COORDENAÇÃO E AUTONOMIA

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


### 14. PUBLICAÇÃO E COMUNICAÇÃO

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


### 15. CONDIÇÃO EXATA PARA TERMINAR

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


## Parte II — combate, mundo e apresentação


## Especificação de combate, mundo, apresentação e verificação

Base de combate extraída na candidata BUILD60 em09/11/2026, com as correções de escudo, a Matriz61, a Lâmina62 e a reserva/manutenção63 incorporadas nesta montagem. Este fragmento descreve o que o código efetivamente faz; não certifica estabilidade, desempenho ou conclusão do projeto. A publicação62estáconfirmada; a candidata63nãoestáaprovada nem publicada; Matriz, Lâmina e Reserva estão especificadas nas PartesIII-A,III-B eIII-C. Valores usam pixels/unidades lógicas de mundo e segundos de simulação ativa. Separar em qualquer reconstrução: comportamento de produto pretendido, implementação observada e defeitos conhecidos. Referências internas ajudam a auditar, mas as regras abaixo foram escritas para serem implementáveis sem consultar esses arquivos.

### 1. Produto e estrutura da tentativa

Jogo de sobrevivência 2D, câmera superior, com um gato piloto dentro de robôs industriais enfrentando zumbis na cidade do Dr. Biruta. Paleta dominante azul petróleo/ciano, sucata dourada, reparo verde, ataques hostis laranja e perigo elétrico lilás. Arena infinita, sem colisão com bordas nem vitória ao completar20minutos. Vinte minutos são uma janela de teste de build. O jogador move, mira e atira manualmente; suportes adquiridos podem atacar automaticamente, mas não substituem a mira da arma.

Implementação local usa HTML/CSS, Canvas2D, scripts JavaScript locais e WebAudio; deve abrir por `file://` depois de extrair o ZIP, sem CDN, login, banco externo ou dependência de rede. O perfil é local ao navegador/dispositivo. Acesso à nuvem, ranking, conquistas de plataforma e executável nativo não são funcionalidades implementadas.

Estados reais e transições:

| Estado | Conteúdo e ações | Simulação ativa? |
|---|---|---|
| `title` | Menu inicial; abrir garagem; habilitar áudio | Não |
| `garage` | Escolher/desbloquear chassi e armas, consultar reforjas/compêndio e guia | Não |
| `configuration` | Confirmar equipamento e incursão; voltar à garagem | Não |
| `playing` | Movimento, disparos, IA, coleta, evolução | Sim |
| `paused` | Diagnóstico dos atributos, equipamentos, módulos e sinergias; continuar/garagem | Não |
| `upgrade`/`reward` | Escolha normal de melhoria; inspecionar árvore, instalar, renovar ou recusar | Não |
| `blessing` | Gambiarra dos níveis3/6/9 | Não |
| `specialization` | Um protocolo do chassi no nível10 | Não |
| `evolution` | Uma reforja por arma no nível20, em sequência por slot | Não |
| `relic` | Hardware raro de baú | Não |
| `experiment` | Fallback de baú quando não há peça rara elegível | Não |
| `over` | Morte, tempo e eliminações; repetir configuração/garagem | Não |

Há referências residuais a `won` em controles de tela, mas o loop atual não cria uma vitória cronometrada. Não implementar encerramento automático aos20min a partir desse identificador residual.

Ao iniciar uma tentativa: capturar chassi/armas selecionados; recriar jogador e slots; limpar inimigos, chefe, projéteis, saques, efeitos, hazards, filas e entradas; tempo0, nível1, XP0, necessidade6; primeiro grupo agendado em2s; chefe índice0; policiais bloqueados; uma renovação normal disponível; nenhuma relíquia, especialização ou reforja adquirida. Integridade/velocidade/armadura vêm do chassi; o dano base vem da arma e dos custos de múltiplos slots. Todas as skills e contadores temporários são novos. Parafusos, peças e desbloqueios do perfil permanecem.

### 2. Entrada e movimento

- PC: WASD/setas movem; mouse mira; segurar botão esquerdo dispara; R recarrega todas as armas que puderem iniciar recarga; P/Esc alternam pausa; Espaço ativa propulsor apenas após adquirir sua skill.
- Direcional por teclado gera x/y em−1,0,+1 e normaliza o vetor: diagonal não é mais rápida. Havendo qualquer vetor de teclado, ele tem prioridade sobre o direcional de toque.
- Celular é horizontal. Dois pads com ponteiros independentes: esquerdo move analogicamente, direito fornece direção unitária e dispara enquanto ativo fora da zona neutra. Zona morta radial14%. Magnitude de movimento = `(raioNormalizado−0,14)/0,86`, limitada0..1; mira fora da zona neutra usa magnitude1. Há botões separados de recarga e propulsor.
- A mira touch mantém o último vetor válido e traduz a direção para um ponto180unidades à frente do jogador na tela. Soltar o pad encerra fogo/fila pendente, sem escolher um alvo novo.
- Capturar o ID do ponteiro dono de cada pad/disparo. `pointerup`, cancelamento e perda de captura desse dono liberam a ação. Outro ponteiro não pode interromper o dono errado. Movimento passivo do mouse não toma a mira de um dedo atualmente ativo.
- Girar para retrato durante `playing` pausa e mostra orientação para voltar ao horizontal. Girar de volta não retoma sozinho. Desabilitar/resetar pads em pausa, morte, ofertas e navegação. Mostrar propulsor desabilitado até adquirir a skill.
- Perder foco da janela ou ocultar documento limpa teclas/fogo/rajadas e pausa se estava jogando. Não retomar fogo ao recuperar foco; exigir entrada nova.

Propulsor: duração0,15s, deslocamento a3vezes a velocidade normal, recarga4s, sem invulnerabilidade. Direção = movimento atual; parado, usar mira válida; sem movimento/mira, usar direita. Em um tick que atravessa o fim do avanço, aplicar velocidade3× somente ao subintervalo restante do avanço e velocidade normal ao restante. Animação/recuo não alteram hitbox.

### 3. Câmera, coordenadas e arena

Armazenar todas as entidades em coordenadas de mundo. `pontoTela = pontoMundo − câmera`. Mouse na tela vira coordenada de mundo adicionando a câmera; a câmera não altera posições físicas. Mundo não tem largura/altura de colisão nem wrap.

No reset/resize, centralizar o jogador. Em movimento normal, usar zona morta retangular: horizontal `min(75,0,08×larguraTela)`, vertical `min(50,0,08×alturaTela)`. Fora dela, mover câmera pelo excedente com amortecimento `1−exp(−6dt)`. A zona morta evita cenário deslizando em cada pequeno passo.

Canvas atual tem resolução interna de50% da dimensão CSS e transforma desenho por0,5; suavização de imagem desligada. Isso é uma decisão de rasterização observada, não uma prova de desempenho nem obrigação de que uma reconstrução use exatamente esse ganho de resolução. Manter física em unidades lógicas independente da resolução.

Piso: textura própria de asfalto azul ou fundo sólido `#223345` se faltar a textura; sobreposição escura `rgba(8,21,35,0.82)`. Decorar células512×512 com hash determinístico de coordenadas; não consumir RNG de combate ao desenhar. Carcaças de carros e barris são cenário visual, não paredes/hitboxes. Célula com ruído>0,9 desenha carro; ruído entre0,65e0,75 desenha barril. Luz ciano radial segue jogador até raio320, com centro fraco e bordas transparentes. Vinheta na tela mantém a arena escura sem tornar telegráficos ilegíveis.

### 4. Relógio e ordem do loop

O frame do navegador usa `dt=min(deltaRealEmSegundos,0,04)`. Atualiza música por cena. Só chama simulação em `playing`; renderiza combate/overlays fora de menu/garagem/configuração. **Limite conhecido:** esse clamp pode fazer o relógio de jogo andar mais devagar que tempo real quando frames demoram muito. Uma partida VM com1200s simulados não prova20min de fluidez em hardware real. Registrar os dois relógios em ensaio de desempenho.

Ordem física observada, que deve ser preservada ou alterada explicitamente com testes de equivalência:

1. Abrir fases cosméticas de faíscas/feedback; incrementar relógio e anunciar marcos de maturação de drone.
2. Reduzir invulnerabilidade/recuo; corrosão; cooldowns e recargas; fogo, exposição, frio e stun; recuperação do escudo.
3. Movimento normal/propulsor; regeneração estacionária; fases de animação; câmera e mira touch.
4. Atualizar/nascer Colimador; retirar inimigos mortos da lista; diretor de horda e chefe devido.
5. Disparos das armas; construir índice de colisão; mover/resolver todos os projéteis do jogador; invalidar índice.
6. Movimento/ataques/contato dos comuns e lacaios; chefe, hazards, drones, sensor e rotores.
7. Projéteis hostis; XP; sucata/parafusos/células; vidas de efeitos/feedback.
8. Se ainda estiver jogando, aplicar cura pendente de chefe; abrir um baú ao contato ou resolver um level-up; atualizar HUD; limpar fases temporárias em finally.

Somente um level-up é resolvido por tick. Se XP restante já satisfizer o próximo custo, ele será atendido depois de sair da oferta e voltar à simulação. Ao morrer no meio de um tick, subfunções com guard de estado param; o loop externo atual ainda percorre o restante do frame. Não afirmar que toda operação já é abortada imediatamente no exato meio do tick. A reconstrução deve escolher e testar essa fronteira explicitamente, sem criar mortes/curas/ganhos após morte por acidente.

### 5. Diretor procedural de horda

Todos os cálculos a seguir usam tempo ativo `t` em segundos:

- Limite de comuns vivos: `L(t)=min(180,60+12×floor(t/60))`. Exemplos:0–59s=60;60–119=72;240–299=108;600s em diante=180.
- Lacaios de chefe e chefe não entram nesse limite de comuns.
- Primeiro grupo aos2s. Cada grupo tem até15, limitado por espaço disponível `min(15,max(0,L−comunsVivos))`.
- Intervalo periódico realmente usado: `max(3,5;6,4−0,008t)`. Chega ao mínimo3,5s por volta de362,5s. Existe constante antiga `minInterval=1,5`, mas não é o mínimo efetivo do diretor; não replicar esse número como regra atual.
- Reposição também pode ocorrer ao somar8abates desde a última decisão ou deslocar320px desde a última decisão com baixa presença próxima.
- Presença próxima = comuns vivos a menos de1,35×raioDeNascimento. Gatilho de deslocamento exige contagem `<min(L,30+3×floor(t/60))`.
- Cooldown do diretor =3s, separado do timer periódico. Prioridade de motivo: abates, depois deslocamento elegível, depois timer. Registrar contagem/posição de referência após decidir, inclusive quando o teto não permite novos.

Para nascer fora da tela mesmo com câmera deslocada: medir distância do jogador a cada um dos quatro cantos visíveis; usar a maior+96como raio. Sortear um ângulo inicial e distribuir Nposições uniformemente por2π, na circunferência centrada no jogador. Não nascer junto do corpo ou numa elipse que entre na viewport.

Policiais só liberam após derrotar Sucateiro. Em grupo completo de15, cinco são policiais, alternando rifle/escudo conforme índice da onda e policial. Para grupo parcial, usar `floor(N/3)`. Depois de900s, a cada terceira onda completa substituir o último por pesado. Contador de onda só avança para grupo completo de15.

Reentrada de perseguidores distantes, apenas no motivo deslocamento: identificar comuns a mais de2,5×raio de nascimento, também completamente fora da viewport com margem60. Mover até `15−quantosNasceramAgora` existentes para a circunferência fora de tela. Preservar HP, escudo, status, identidade, recompensa e não contar como morte/nascimento gratuito. Isso evita vencer só caminhando para longe, sem apagar inimigos vivos ou ultrapassar o teto.

### 6. Inimigos e policiais

Base no instante de nascimento: `HPbase=round(24×(1+t/300))`; `velocidadeBase=uniforme(24,42)+min(24,t/90)`. Valores não são recalculados a cada tick para inimigos já nascidos. Não existe aceleração por proximidade nos zumbis comuns. Velocidades são px/s.

| Tipo | HP inicial | Velocidade | Raio | Comportamento |
|---|---:|---:|---:|---|
| Perseguidor comum | HPbase | velocidadeBase | uniforme11..16 | Anda diretamente ao jogador ou isca elegível |
| Ex-policial de rifle | round(0,8×HPbase) |0,9×base |13 | Busca distância245, recua abaixo170 a65% da velocidade; entre170e245 fica posicionado |
| Policial de escudo | HPbase +escudo100 separado |0,9×base |15 | Enquanto escudo existe, perseguidor normal; depois muda para investidas |
| Pesado perseguidor |3×HPbase |0,68×base |23 | Perseguidor de maior vida, variante visual pesada |

Contato de comuns/lacaios inflige12 quando distância centro-centro<raioInimigo+14. Frio reduz movimento à metade; stun zera. Contato usa a rotina central de dano e invulnerabilidade, não subtrai HP diretamente em cada inimigo.

Rifle comum: se jogador a menos560, dispara mirando posição atual; projétil velocidade210, vida2,6s, raio5, dano8, intervalo2,8s. Cooldown inicial uniforme0,8..1,5s. Desenhar rifle na mão e badge EX-POLICIAL, não só uma cabeça que dispara.

Escudo: valor100 absorve integralmente o golpe que o quebra, sem transferir excedente ao corpo. Quebra prepara direção fixa até a posição atual do jogador, distância máxima240; parar/mirar0,7s, então deslocar a340px/s. Ao completar, preparar nova direção/pausa. Durante cada avanço, testar segmento percorrido contra círculo jogador+raio para evitar atravessar sem acertar. Frio reduz à metade o avanço e a contagem da preparação; stun congela ambos. Só o policial que efetivamente perdeu o escudo entra nessa movimentação. Policial de rifle nunca recebe esse avanço.

**Histórico de P1 corrigido na candidata:** na fonte extraída, policialHP24/escudo100 atingido por tiro5comfogo+frio ficava comHP24/escudo95masburnTime3eslowTime2. O teste novo reproduz a falha nessa fonte. A candidata agora bloqueia corrosão e estados com o flag blindado capturado antes do golpe, inclusive na quebra.17fixtures passaram; a auditoria final continua aberta. Reconstruir a regra corrigida, não a falha histórica.

### 7. Chefes: agenda, escala, minions e padrões

Agenda nominal absoluta: índice0 aos60s, índice1 aos240s, índice2 aos420s. A partir do índice3: `420+180×(índice−2)`; assim600,780,960s etc. Só pode haver um chefe vivo; se o anterior sobreviver à agenda seguinte, o próximo espera. Não reiniciar a agenda em função da hora da morte. Tipos giram Brutamontes→Sucateiro→Bobina e repetem.

`ciclo=floor(índice/3)` antes de incrementar índice. HP = round(HPbase×(1+0,7ciclo)); velocidade = velocidadeBase×(1+0,08ciclo). Nascimento em `(jogador.x,jogador.y−min(0,4×alturaTela,260))`, faseaproximação, timer2, turno0, vetor inicial baixo. Chefes podem nascer dentro da viewport pela regra própria; não confundir com a regra fora de tela da horda.

| Chefe | HPbase | Raio | VelocidadeBase | Lacaios por nascimento |
|---|---:|---:|---:|---|
| Brutamontes |650 |32 |28 |2Corredores:55HP,62px/s,r13 |
| Sucateiro |1300 |30 |24 |2Atiradores:48HP,25px/s,r12 |
| Bobina-Rainha |1800 |34 |20 |3Rajadas:36HP,40px/s,r11 |

Lacaios nascem a82px ao redor do chefe, com ângulos uniformes; vida×(1+0,35ciclo), arredondada, velocidade×(1+0,05ciclo). Badge/identidade: CORREDOR/CÃES DE SUCATA laranja; ATIRADOR/TALHA-BOTS verde; RAJADA/FAÍSCAS ERRANTES lilás. Intervalo de tiro inicial0,5..1,5s.

Atirador lacaio mantém distância145..220, recuando a70% abaixo145; dispara a menos560, a cada2,2s; projétil240px/s, raio5, vida2,4s, dano8. Condutor mantém115..180, recua a70%, dispara a cada2,8s: leque3tiros com desvios−0,2/0/+0,2rad, velocidade190, dano6, raio5, vida2,4. Corredor apenas persegue. Ao derrotar chefe, remover seus lacaios sem criar XP, sucata ou abates grátis; limpar hazards/projéteis hostis.

**Brutamontes:**

1. Aproximação normal ao jogador, com frio/stun, por2s inicialmente.
2. Alternar preparo de investida e preparo de volley. No início do preparo, capturar direção ao jogador; não redirecionar continuamente durante preparo/avanço. Preparo0,95s.
3. Investida dura0,65s a360px/s; dano20 por contato/segmento. Depois, aproximação2s.
4. Volley:12projéteis em círculo completo, começando pela direção capturada, velocidade145, raio7, vida4s, dano fallback12. Depois, aproximação2,5s.
5. Contato corporal fora da investida também causa20.

**Sucateiro:** acompanha lentamente em todas as fases, busca faixa180..240; além240 aproxima; abaixo180 recua a60%; dentro da faixa para. Aplicar frio/stun. Ao timer de aproximação acabar, criar três pontos de morteiro relativos à posição do jogador naquele instante: x−95,y+55; x,y; x+95,y+55. Cada pool tem raio44, atraso igual ao preparo1,4s (compensado pelo dt de criação), vida ativa5s. Preparo termina, som de ataque, volta a aproximação com timer4s. Pool causa12 quando jogador entra em raio44+14; rotina de invulnerabilidade limita repetições. Contato do chefe20.

**Bobina:** em aproximação, caminha ao jogador só se distância>140. Alterna preparo de anel e leque, ambos1,1s; direção é capturada ao preparar.

- Anel: nasce no chefe com raio28; expande100px/s, vida2,8s. Atinge quando distância do jogador está entre raioAnterior−20 e raioAtual+20, causando14; testa a faixa percorrida, não só a borda final. Depois aproximação3s.
- Leque:5projéteis com ângulos−0,44,−0,22,0,+0,22,+0,44rad sobre direção capturada,190px/s, raio7, vida4s, dano fallback12. Depois aproximação3s.
- Contato20. Seus hazards/projéteis são lilás.

Leitura de Ameaças aumenta duração de cada preparo em20% se jogador a até180do chefe. Telegraph investida: faixa laranja234×92 apontando direção. Volley: círculo65 com12pontos. Morteiro: círculos verdes antes do dano, preenchimento leve/anel de progresso. Bobina: anel/laterais de cone lilás. Mostrar nome, barraHP alinhada ao HUD, descrição da ação, número/papel dos lacaios e aviso de que ondas comuns continuam.

**Limite observado:** guard de200hostis existe para tiro de comum/lacaio, mas as funções de volley dos chefes fazem inserções sem esse guard. Portanto200 não é teto global comprovado; uma reconstrução deve formalizar e testar um limite global, em vez de declarar esse limite implementado por inferência.

### 8. Dano do jogador, cura e morte

Se invulnerabilidade>0, HP<=0 ou estado diferente deplaying, ignorar novo dano. Escudo capacitivo pronto consome o escudo, inicia cooldown120s, concede0,25s de proteção, toca som/aviso e absorve o golpe sem empurrão corporal. Sem escudo:

1. Aplicar modificador de protocolo Aterramento: dano de hazard de chefe×0,7.
2. Empurrar48px para longe da origem. Se origem coincide com jogador, usar oposto do movimento; sem direção, usar direita. Não saltar em direção à fonte.
3. Dano efetivo = `max(1,danoBruto−armadura−(2seblindagemDeReparoAtiva))`; HP mínimo0.
4. Invulnerabilidade0,65s, ou1,3s com graça.
5. Se sobreviveu, protocolos/reações podem criar isca, afastar inimigos, proteção emergencial, explosão ou frenesi; se morreu, não permitir esses efeitos protetores retroativos.

Proteção emergencial: quando cooldown0, dano não letal concede invulnerabilidade3s e cooldown120. Retaliação: cooldown120, explosão raio140 e dano3×danoDireto. Sobrecarga pós-dano: cooldown120, frenesi6s, intervalo de tiro÷3. Isca de Cauda dura1,5s e cooldown24; chefes/lacaios/atiradores ignoram. Alerta de Nove Vidas exige cruzar de≥20%para<20%HPmáximo e sobreviver; afasta comuns a até100em90px e stun0,5; cooldown30.

Cura: aceitar apenas número finito>0 com jogador vivo; limitar a HPmáximo; devolver a cura real. Não ativar protocolos com overheal. Cura efetiva prepara Carga de Reparo ou blindagem temporária2s, conforme protocolo. Cura de recarga = `(5seReparo +3seNANO) × fraçãoRealReposta / quantidadeArmas`. A fração real usa mínimo entre munição faltante capturada e efetivamente reposta, dividido pela capacidade capturada no começo da recarga. Isso impede recuperar uma cura de carregador inteiro ao repor uma única bala ou multiplicar cura ao equipar três armas.

Morte mostra tempo e eliminações, interrompe futuras simulações e mantém recursos permanentes já salvos. Repetir mantém somente equipamento escolhido e recomeça todos os poderes/contadores temporários.

### 9. Colisões, tiros e ordem de efeitos

Jogador tem raio de combate14, independente da silhueta alta do robô. Cada projétil guarda arma emissora/traços de reforja, dano, velocidade, raio, vida inicial/restante, contatos restantes, hitSet, ricochetes e retorno. Slot/directDamage explícitos são acrescentados somente em múltiplas armas. Dano principal, arma e traços são snapshots; Motor Cinético/Fratura têm o fallback single em P ATUAL descrito no glossário, e flags globais continuam condições de impacto. O índice espacial é otimização, não seleção que possa ignorar vivos.

Teto compartilhado de400projéteis do jogador. Ao preencher, recusar emissão antes de gastar cartucho, carga ou reparo preparado. Com uma vaga e uma escopeta pedindo10pellets, o caminho atual emite1pellet e gasta um cartucho: o truncamento não deve cobrar10cartuchos. Slots têm munição/recarga/cooldown/fila/contagem independentes; em múltiplas armas, alternar prioridade inicial por frame de disparo para nenhuma monopolizar o teto.

Ao mover bala deAparaB, procurar candidatos cujo círculo expandido pelo raio da bala esteja a distância do segmento menor que soma de raios. Ordenar impactos pela distância do centro do alvo atéA, conforme comportamento atual, desempates estáveis. Verificar HPnovamente a cada contato; efeitos podem ter matado um alvo listado. Não aplicar mais impactos quando contatos restantes chegam a0. Ricochete escolhe vivo mais próximo a até220da origem, excluindo hitSet, preserva velocidade, reposiciona na origem do contato e reserva um contato; consome um ricochete. Disco retorna na metade da vida, limpa hitSet uma vez, aponta a cada tick para jogador com velocidade capturada e some a menos16do jogador; não renova buffs por retornar.

No impacto de bala, a sequência observada é: dano direto; corrosão e estados de impacto somente se o corpo não estava blindado antes do golpe; dano cinético condicional; pulso crítico único por projétil; descarga elétrica; explosão. Função central de dano ainda aplica Marca do Predador, exposição de bala, Caça-Titãs contra chefe e finalização antes de escudo/corpo. Um golpe que já matou não pode ser contado duas vezes.

Explosão inclui corpos que tangenciam sua área (`distância<=raio+raioAlvo`), exclui alvo de origem quando indicado, aumenta raio2×comAmpliação. Dano é fonteexplosion; se eletricidade instalada e alvo sobrevive, pode gerar descarga. Explosão não reexecuta automaticamente todos os procs de bala. Pulso crítico exige crítico+Projétil Extra e tem marca de execução única, dano35%da bala, raio48. Explosão normal usa raio máximo entre raio intrínseco e64seBlast; dano da bala×splash(default0,5), com×1,25quando há explosão intrínseca e Blast juntos.

Descarga escolhe mais próximos vivos em raio135, ou405comCondutividade; total = saltos intrínsecos +1seShock (ou3seShock+Pierce) +1seBifurcação. Cada secundário recebe50%do dano de entrada, com modificadores de VOLT×1,35, raio intrínseco+Shock×1,25 e relíquia elétrica×1,4. Não chama impact de bala de novo nem cria ricochete recursivo. Reposição elétrica ocorre a cada6alvos efetivamente danificados, com cooldown0,25s, na arma de origem; escudo sem perder corpo não conta como dano efetivo nesse critério.

No índice espacial: células128; guardar a ordem original; adicionar/alocar alvos movidos e invalidar caches geométricos por movimento. Consultas em raio grande/segurança numérica podem cair na varredura linear. Cache de vizinhos só na fase de projéteis, não pode reutilizar liveness antiga; verificarHPa cada leitura. Teste de equivalência deve comparar dano, ordem, entidades, recompensas e próximos sorteios, não apenas FPS.

### 10. Estados e suportes

| Sistema | Regra operacional |
|---|---|
| Fogo | Dura3s, ou9comIgnição; protocolo de duração×1,5. DPSbase50%do dano do projétil, capturado no acerto;×3comPós-combustão;×1,35FORJ;×1,25searma e skill dão fogo;×1,5relíquia. Guardar maior DPS, renovar duração; acumular dt e aplicar a cada0,5s ou fim. Choque Térmico×3se frio ativo; protocolo térmico adicional×1,25. |
| Frio | Velocidade×0,5 enquanto timer>0; duração de impacto2s, ou3searma+skill, mais traço de reforja;×1,5relíquia de estase. Usar máximo entre timer anterior e novo. |
| Stun | Movimento0; duração de choque skill1s comum/0,25chefe; protocolo pode somar0,35comum/0,1chefe. |
| Corrosão | Uma carga por corpo vivo; não renovar nem empilhar. Só aplicação por bala; escudo impede. Prazo clamp(2×mod,0,25..30); dano snapshot clamp(danoBala×mod,0..1e9). No prazo, dano fontecorrosion; Catalisador×1,5se fogo/frio existia durante o restante necessário. |
| Respingo corrosivo | Na morte de carga-raiz, até2vizinhos vivos sem escudo/carga em100px, mais próximos, recebem50%do dano, prazo próprio atual e flag de não propagar. Filhos não geram netos. Snapshot de referências no começo do tick impede envelhecer filhos recém-criados no mesmo passo. |
| Drones | ENXA nativo1 +skillDrones1 +Dupla1, teto3. Intervalo max(0,35;0,8×modCadência). Alcance320+100comrelé. Cada drone procura alvo vivo mais próximo, ou chefe no alcance sob foco. Dano25%do dano direto×modDrone×maturação×1,25se foco-chefe. Arco opcional atinge só um segundo alvo vivo a até160do primeiro, por50%, sem cadeia. Sem gastar munição ou procs de bala. |
| Sensor | Adquirido; intervalo clamp(3×mod,0,5..30), raio clamp(170×mod,40..480), dano35%do dano direto×mod, limitado1e9. Atinge todos os corpos no raio somado ao raio do alvo, não sóNpróximos. Não consome munição nem carga ofensiva de reparo. Relé só transmite fogo/frio já instalados; exposição2s amplia só dano de fontebullet em25%. Escudo bloqueia relé/exposição nesse pulso. |
| Rotores | Dois, terceiro opcional. Dano55%do dano direto×mod, clamp0..1e9; raio orbital clamp(72×mod,40..200), raio do disco10; período clamp(3×mod,0,75..12). Cada disco tem cooldown individual por alvo de um período. Varredura contínua de movimento e arco, passos angulares≤π/24, compensação de curvatura. Tick longo varre no máximo uma volta, sem backlog de hits. Não usa munição/procs de bala. |

Baia de Comando preserva bônus imediato drone×1,5ealcance×1,2. A partir da aquisição, aos30/60/90s ativos, dano já modificado×1,1/1,2/1,3; teto da própria peça1,95vezes o dano pré-peça. Pausa/ofertas não contam, reset remove. Três LEDs ciano mostram estágios, mantendo núcleo âmbar. Não confundir maturação com aumento imediato de frequência.

Colimador: primeiro campo quando há direção manual; a96px à frente, raio36, vida4s, agenda6s; ancorado no mundo. Centro do projétil tocar/entrar amplifica dano×1,35uma vez. Interseção por segmento para tiros rápidos. Respeitar contato de corpos anteriores ao campo, fim real da vida e ricochete terminal anterior ao campo. Campo vence empate com contato de corpo; expiração vence empate com entrada. Marcador persiste no disco de retorno. Dano derivado já existente usa snapshot ampliado; não cria proc novo. Círculo segmentado ciano com contorno escuro6px, linha ciano2px, terminais, rótulo só0,6s; desenhar depois de inimigos e antes dos tiros.

Culatra candidata60: uma carga por chamada de emissão que realmente gasta um cartucho, até60por slot, não por pellet. Último cartucho recebe fator`1+0,25×min(60,cargasAnteriores+1)`, consumindo carga antes de autorrecarga. Demais tiros dano normal e incrementam carga. Recarga válida antecipada descarta; recarga rejeitada não. Reembolso de munição não cria carga; pode adiar o último, sem passar60. Instalação começa0mesmo no meio do carregador/recarga; não altera munição, tempo, HPou projéteis antigos. Pico16×é por projétil final, não DPSsustentado. Sem crítico/retornos, carregadorN≤60soma25%a mais de dano total concentrado no último; acima60adicional é15tiros-base, fração15/N. Contador é independente do crítico por quinto tiro. HUD mostra cargas ou fator do último e queRdescarta; marcador branco de dois chevrons distingue críticoâmbar/Colimadorciano.

### 11. XP, saques, baús e perfil

Morte de comum ou lacaio vivo cria uma gema de XPna posição e uma sucata de valor1. Cada25abates cria também célula verde de cura12, valor monetário0. Sacos de sucata/células têm vida60s, lista preserva os250mais recentes. Gemas não têm expiração/teto explícito no caminho atual. Cada gema coleta concede1XP, ou2comLeituraRápida. Um núcleo desenhado é um pickup, não uma moeda permanente.

Ímã base95. Quando distância inicial do item<ímã, mover em direção ao jogador por fração`min(1,9dt)`; quando distância<18, coletar. Núcleo ciano→XP; sucata dourada→parafuso; célula verde→cura. Não usar cor verde para dinheiro. Parafusos coletados são somados ao perfil e gravados já durante a tentativa. Não esperar voltar à garagem para preservar.

Custo do próximo nível: começa6e, a cada nível, `ceil(custoAnterior×1,2)`; descontar somente o custo antigo, guardar excedente. Nível10usa escolha de protocolo;20usa reforja;3/6/9Gambiarras; demais níveis usam melhoria normal. Guia recomenda, não concede skills nem altera sorteio.

Matar chefe: não cria XPdireto nem sucata normal; soma uma peça permanente do tipo, salva imediatamente; desbloqueia policiais se Sucateiro; agenda cura até20, ou40comCaça-Titãs; deixa um baú físico no local. Cura/peça existem independente de coletar baú. Baú não expira, não é puxado pelo ímã e abre a menos40px do jogador; na fronteira exata40não abre. Se vários/level-up estão pendentes, resolver um baú antes do level-up e só uma oferta por vez.

Baú oferece até3relíquias elegíveis e ainda não adquiridas; prioriza até2específicas e deixa alternativa universal, preenchendo o restante com outras candidatas. Entre grupos, embaralhar pelo RNGde combate; inclusão de relíquia nova muda legitimamente a sequência de ofertas. Não reaplicar peça possuída. Esgotadas relíquias elegíveis, oferecer experimento; esgotados experimentos, melhoria comum. Aceitar/recusar exige token de versão da oferta; callbacks de telas antigas não podem aplicar em oferta nova/reset. Teclas1–3instalam;Rrecusa nesse contexto. A escolha pausa e limpa inputs.

Perfil de esquema2: parafusos não negativos inteiros limitados999.999.999; peças porchefe; mapas de armas/chassis desbloqueados. Chave local`screwvivors.profile.v1`, apesar do esquema2. Perfil novo libera apenasPROT+metralhadora. Migrar esquema1 liberandoPROT/BASTe todas as armas do protótipo antigo, sem liberar automaticamente os quatro chassis novos. JSONinválido/versão desconhecida volta a defaults seguros. Falha de armazenamento exibe aviso e não trava combate.

Compras só na garagem, se equipamento existente/ainda bloqueado e saldo+peça suficientes. Debitar recursos, marcar desbloqueio e tentar gravar; se gravação falhar, devolver saldo e peça e voltar equipamento a bloqueado. Não atribuir bônus permanentes de vida/dano ao desbloqueio.

| Compra | Parafusos | Peça adicional |
|---|---:|---|
| BAST |24 |— |
| FORJ |28 |Brutamontes1 |
| VOLT |28 |Bobina1 |
| NANO |24 |Sucateiro1 |
| ENXA |30 |Bobina1 |
| Escopeta |8 |— |
| Rajada |12 |— |
| Lança-chamas |14 |— |
| Disco |16 |— |
| Criogênico |18 |— |
| Precisão |22 |Brutamontes1 |
| Arpão |24 |Brutamontes1 |
| Granada |20 |Sucateiro1 |
| Foguete |26 |Sucateiro1 |
| Laser |22 |Bobina1 |
| Tesla |24 |Bobina1 |

### 12. Minimap, HUD e feedback

Minimap mantém jogador no centro; escala base720unidades para46%da largura/altura. Para cada ponto: dx=(x−jogadorX)/720×0,46w; dy análogo. Dividir ambos pelo maior entre1,abs(dx)/(w/2−margem),abs(dy)/(h/2−margem). Isso prende inimigos/chefes/baús distantes na borda sem perdê-los e move os marcadores para dentro conforme se aproximam. Comuns vermelhos4×4; chefe dourado8×8com contorno10×10; baú dourado6×6; jogador ciano6×6. Não esconder chefe só por estar longe.

HUD deve conter: retrato/nome do robô, integridade atual/máxima e barra; nível/barraXP; tempo; abates; munição/recarga da arma e auxiliares; cooldowns adquiridos; minimap; barra/ação/lacaios do chefe. Não mostrar timers de skills ainda não adquiridas. Até seis timers no conjunto atual: sensor, escudo, três reações e propulsor. Diagnóstico de pausa mostra valores atuais, instalados, sinergias, especialização, reforjas, suportes e relíquias, sem somar dano condicional/área ao número de dano direto. Se painel exceder altura, mostrar pista de rolagem.

Tutorial inicial de teclas e legenda de saques somem após5sativos; esconder tutorial de desktop em touch. Comando de Espaço só aparece depois da skill, perto da arma. Não deixar aviso de comandos no meio da arena para sempre.

Avisos: fila máxima4, até2visíveis,2,4sativos, deduplicação; região lateral própria sem cobrir jogador. Números de dano agrupam mesmo alvo/fonte/crit dentro160ms; vida do registro0,6s; até100registros globais e até3rótulos recentes por alvo ao desenhar. Corpo e escudo têm números separados; crítico mostraCRIT; fonte possui cor. Subir28px/s. Abreviar>=1000para`k`, manter valores finitos. Até600faíscas visíveis e150efeitos. A otimização pode evitar alocar partículas que já não serão visíveis, mas deve fazer os mesmos dois sorteios de velocidade para cada uma das cinco faíscas de um acerto, conservando RNGde combate. Desenho não pode alterar estado físico nem sortear.

### 13. Animação e direção visual

Robôs são silhuetas industriais próprias com gato visível no cockpit, pés apoiados e anel ciano no chão. Arma empunhada segue mira, com mãos, recuo e gesto de recarga; cada uma das12tem forma própria. Projétil conserva identidade da arma emissora mesmo quando primária muda por reforja. Cores: fogo laranja, gelo ciano claro, Tesla lilás, explosivos âmbar; crítico com marcas douradas; Colimador contorno ciano; Culatra chevrons brancos. Não confundir raio de física com tamanho do desenho.

PROT: atlas32quadros de caminhada (8por direção),4idles,100ms/quadrocaminhando; pés emy+28; escala do atlas atual0,40677966e pivô por quadro. Demais5chassis usam atlas próprios de32quadros cada+idles,100ms, péy+28, escalas aproximadas0,375BAST/FORJ,0,38919VOLT,0,38298NANO,0,36735ENXA. Esses números de escala se aplicam aos atlas atuais222pxporcélula; ao redesenhar assets em outra resolução, conservar altura/silhueta em mundo, não copiar a escala bruta.

Três famílias de zumbi têm32quadros/4direções cada, incluindo a família pesada, total96quadros de caminhada. Passada usa distância percorrida: fase=(fase+distância/64×8)%8; direção pelo eixo dominante do movimento. Parado/stun não avança e mostraidle. Pausa não avança relógios. Sprite armado deve realmente mostrar arma/escudo; badges sobrevivem à troca visual. Sucateiro/Bobina têm preparação/recuo desenhados a partir de fase real do chefe, não por um timer visual independente capaz de mentir sobre ataque.

Fallback: atlas raster próprio→atlasSVGpróprio nos cinco chassis→desenho legado; PROTatlas→imagem estática58×72→legado. Falha de um asset não derruba os demais. Renderer de inimigo usa cache cosmético limitado36atlases, classes discretas de altura, mantendo raio físico exato. Não reduzir quantidade de inimigos vivos para melhorar FPSsem declarar mudança de regra.

Ordem visual: piso; hazards/baús; saques/XP; linhas de preparação; inimigos/chefes e suas marcações; Colimador; tiros do jogador; hostis; efeitos/faíscas; rotores; robô/arma/drones/escudo; números; vinheta e retículo. Pequenos elementos podem cruzar telegráficos, mas não esconder sistematicamente avisos. Em cena extrema já observada, leitura continua difícil; não alegar legibilidade perfeita só por uma captura.

### 14. Música e efeitos sonoros

Synthwave suave/atmosférico autoral, baixo arredondado e melodia espaçada, sem bipes incessantes. Três cenas: menu72BPM, garagem78, combate90. Música padrão35%, efeitos60%, controles independentes0..1, mute efetivo. WebAudio inicia somente após gesto; falha/indisponibilidade não bloqueia jogo. Nenhuma dependência de tocar som sem autorização do navegador.

Transição entre cenas: fade de saída com constante0,065s; aguardar0,3s; parar vozes antigas, reiniciar frase e fazer entrada com constante0,18s. Cortina visual de tela0,35s e SFXcurto de transição. Pausa/ofertas/morte silenciam música de combate; documento oculto desliga cena. Não duplicar trilhas quando transitar repetidamente.

Receita musical reproduzível: subdividir tempo em semicolcheias;128passos por frase e4frases; trocar acorde a cada32passos. RaízesMIDI por frase: [48,44,51,46], [48,51,44,46], [48,44,46,43], [48,46,44,46]. Frequência=440×2^((midi−69)/12). A cada16passos, pad senoidal com intervalos0,7,10,14sobre raiz+12; duração3,8s menu/3,2garagem/2,7combate e amplitude0,022por voz. Baixo triangular na raiz/2a cada8passos, duração0,65s e amplitude0,055ou0,095combate. Melodia espaçada em [12,19,22,19,15,17,19,10,12,15,19,24,22,19,17,15], som senoidal0,9s/amplitude0,035com eco0,22s depois0,65s/0,009. Combate acrescenta bumbo78→34Hz,0,19s,amplitude0,08a cada4passos. Ruído de percussão leve fora do menu. Scheduler olha90msà frente, no máximo3passos novos porupdate, sem tentar tocar backlog ilimitado.

Áudio tem RNGpróprio LCGseparado; ruído não consome Math.randomde combate. Compressor mestre threshold−16dB/ratio8. No máximo32vozes por conjunto de síntese; entrada de efeito recusa ao chegar24vozes de efeito. Intervalos mínimos por evento, ems: tiro0,06global para todas as armas; kill0,1;pickup0,08;hit0,12;reload/reloadReady0,15;upgrade0,3;dash0,15;boss0,5;bossAttack0,3;bossDefeat/death1;transition0,08;pause/resume0,1;rotor0,15;sensor0,35;corrosion0,14;drone0,12;shield0,2;shieldBreak/repair0,3. Mutar libera vozes, não só esconde ganho.

Timbres por arma (varredura inicial→finalHz, duração principal): metralhadora triangular210→75/0,065s+ruído0,04; escopeta triangular115→40/0,15+ruído0,12; rajada triangular260→110/0,045+ruído0,03; precisão triangular155→45/0,12+ruído0,075; laser senoidal510→280/0,055; chama ruído0,1+grave95→70/0,08; frio740→360/0,12+harmônico1110→620; Tesla triangular230→690/0,065+920→280; foguete grave100→32/0,24+ruído0,18; granada triangular140→55/0,12+ruído0,07; disco340→640/0,15+ruído0,08; arpão triangular250→85/0,09+ruído0,045. Preservar volume relativo: pesadas mais graves/longas, laser mais discreto, sem usar uma explosão enorme para cada pellet.

Eventos não musicais devem existir em momento real de ação: reparo sócura efetiva; sensor no pulso; corrosão ao detonar; drone ao atacar; escudo ao absorver; quebra ao perder escudo; reload no começo e ready nofim; bossattack quando começa ataque; derrotachefe na morte. Não tocar som de acerto/carga se o teto de projéteis recusou disparo. Culatra reaproveita tiro da arma, sem fingir um proc elétrico novo. Colimador usa som de sensor no nascimento.

### 15. Casos de QA de reconstrução e regressão

Cada caso precisa identificar build/hash, configuração, plataforma, seed quando aplicável, duração simulada/real, ações, esperado, observado, erro e evidência. Estado desconhecido não significa aprovado. Não marcar um teste como humano se foifixture/VM; não confundir observação visual com desempenho.

| ID | Procedimento mínimo | Resultado mensurável |
|---|---|---|
| W01 | Mover por2000px em cada eixo e voltar | Nenhuma parede, wrap, reset de inimigos ou vitória; posição muda integralmente |
| W02 | Comparar movimento reto/diagonal por1s | Distância igual à velocidade em ambos, tolerância numérica definida |
| W03 | Mover menos que zona morta; depois exceder | Câmera parada no primeiro caso; amortecimento correto no segundo |
| I01 | Segurar fogo, pausar/ofertar/morrer antes de soltar; soltar sobreoverlay; voltar | Nenhum tiro/rajada residual; clique novo funciona |
| I02 | Dois dedos, cancelar um e mover mouse passivo | Dono restante continua correto; sem roubo de mira/captura |
| I03 | Celular gira para retrato durante partida | Pausa; nenhuma variação declock/HP/entidades; paisagem não retoma sozinha |
| H01 | Início com viewport e câmera deslocadas |15zumbis porgrupo fora dos quatro limites da tela, primeiro aos2s |
| H02 | Não matar; checar0,60,120,240,600s | Comuns≤60/72/84/108/180respectivamente; lacaios separados |
| H03 |8abates ou320px em baixa presença | Grupo/cooldown e motivo correspondentes; nunca duplicar decisão no mesmoinstante |
| H04 | Fugir continuamente sem tiros por2min | Velhos vivos preservam HP; reentrada fora de tela; ondas não cessam por abandono |
| H05 | Antes/depois de derrotar Sucateiro | Nenhum policial antes;5de15depois comalternância; comuns sem aceleração |
| P01 | Golpe150contra escudo100/corpo24 | Escudo0, corpo24, preparação0,7s; sem vazamento50ao corpo |
| P02 | Romper escudo, mudar posição durante investida | Vetor nãosegue nova posição; máximo240px; sóaquele policial muda |
| P03 | Tiro5com fogo/frio contra escudointacto | Nenhum estado no golpe absorvido. A fonte anterior falha; a candidata corrigida passou17fixtures e precisa conservar a regressão |
| B01 | Agenda60/240/420/600; manter chefe vivo alémdevido | Um chefe porvez, próximoaguarda; HP650/1300/1800e quarto1105 |
| B02 | Assistir preparos, atravessarfaixas, congelar/pausar | Aviso antecede dano; timers corretos; sem ataque durantepausa |
| B03 | Matarcada tipo, deixar baú longe | Peça+1salva, cura independente, lacaios/hazards removidos, baú no ponto de morte |
| B04 | Chegar exatamente40px e depois39,99 | Fronteira nãoabre; interior abre uma oferta, congela mundo |
| B05 | Deixar chefebaú fora de720px de alcance | Marcadores na borda; aproximação move progressivamente para dentro |
| D01 | Receber dano em direçõesopostas e mesmaorigem |48pxpara fora; fallback estável; dano mínimo1einvulnerabilidade correta |
| D02 | Cura com HPcheio/parcial/morto |0/exato faltante/0; protocolos sócom cura real |
| R01 | NANO recarrega1de6com3HPbase | NANO1slot cura0,5; ENXA3slots+Reparo5HP cura5/(6×3)=0,2777778 no cartucho de escopeta reposto; sem exploit de recarga curta |
| C01 | Bala cruza alvo emdtlongo | Colisão porsegmento, nãoatravessa semdano; umhit por alvo/geração |
| C02 | Explosão/elétrico+perfuração em multidão | Fontes eordem corretas; sem recursão infinita; cadáver nãoé contado duasvezes |
| C03 | Comparar consulta linear/índice com mesmoseed | MesmoHP, ordens, vivos, loot e próximos16sorteios |
| S01 | Corrosão raiz mata, respinga e filhos morrem | Até2filhos, metade do dano, nenhuma geração adicional |
| S02 | Sensor com101alvos no raio, escudos eexposição | Todos os corpos dentro recebem pulso; escudo não transmite relé; sóbalas aproveitam exposição |
| S03 | Rotores comdt maior queperíodo | Máximo uma volta varrida, umhit por alvo/disco/período, sembacklog |
| S04 | Drones atacam alvo fora/dentro do alcance, contador3 | Fora0dano; dentro dano esperado; jamais4drones ou gasto de cartucho |
| S05 | Baia29,999/30/60/90s e longapausa | Estágios0/1/2/3; cap1,95da peça; pausa não amadurece |
| S06 | Campo antes/depois do alvo, ricochete,disco eexpiração |×1,35uma vez sóquando caminho vivo chega antes; expirartie nãoamplifica |
| S07 | Culatra em1/6/24/72cartuchos | Último×1,25/2,5/7/16;somaciclo1,25/7,5/30/87tiros-base; cap60 |
| S08 | Bloquear emissão400; truncar399com10pellets | Bloqueio não gasta nada; truncamento cria1pellet e gasta1cartucho/uma carga |
| S09 | InstalarCulatra durante reload, devolverammo, reforjar | Não termina recarga/cura nem reescreve bala; refund semcarga; estado por slot |
| E01 | Falhar gravação ao comprar gear | Saldo/peça devolvidos; equipamento permanece bloqueado; UI informa |
| E02 | Morrer após pegar parafusos/peças, fechar/reabrir | Recursos mantidos; atributos/relíquias/skills zerados |
| V01 | Remover atlas/helper/imagem um de cada vez | Fallback funcional, sem hitbox alterada nem jogo em branco |
| V02 | Pausar e chamar desenho100vezes com RNGque lançaerro | Zero chamada RNGfísica, zero mutação de posições/timers/contadores |
| A01 | Menu→garagem→combate→pausa, mute e aba oculta | Cenas/transições corretas, sem trilhas sobrepostas, sem som após mute |
| A02 | Multidão atirando/efeitos por5min | Limites/throttles, sem crescimento indefinido de vozes e semclip audível |
| L01 | Teste natural10builds comseeds prévios eperfil isolado | Registrar todas mortes, nível, bosses, escolhas, HP,coleta; não forçar poder ou apagar caso ruim |
| L02 | Jogar em hardwarealvo por20min de parede | Relógios real/simulado,frame p50/p95/p99,picos/memória e inputs; não substituir porVM |

Os números de catálogo, equipamento e atributos detalhados pertencem ao fragmento de catálogos complementar. Esta parte não repete82cartas, mas explicita o motor que deve interpretar seus efeitos. Não conclui desempenho pelo tempo de um teste sintético e não atribui aprovação humana a uma suíte automatizada.


#### Rotina exata dos projéteis hostis

Cada projétil hostil guarda posição, vx/vy, raio, vida e dano/fonte. Salvar A=posição inicial. Se o protocolo Freio Eletromagnético está ativo e a posição inicial fica a≤90px do jogador, fator de deslocamento=0,75; senão1. Mover B=A+velocidade×dt×fator. Reduzir vida pelo dt INTEIRO, não pelo fator de freio.

Testar distância do jogador ao segmento A→B contra raioHostil+14 usando desigualdade estrita. Ao colidir, chamar hurtPlayer(dano ou12quando o valor é falsy, posição finalB, fonte ou projectile) e consumir o projétil SEMPRE. Isso ocorre mesmo se hurtPlayer ignorou dano porque o jogador estava invulnerável. Depois filtrar vida>0.

Particularidade observada: esse caminho testa o segmento antes da filtragem final, inclusive no tick em que a vida chega a0; não há corte geométrico pelo instante exato da expiração como na consulta especial do Colimador. Não prometer outro algoritmo sem mudança explícita e regressão. Hostis não recebem buffs do projétil do jogador, Culatra, retorno ou estados de bala por compartilhar um nome genérico.


## Parte III — todos os catálogos, fórmulas e receitas


## Catálogos e equações completos — fonte local candidata BUILD63

Extraído do código atual e executado em VM isolada com perfil/configuração vazios. Base levantada em09/11/2026; catálogo reextraído em VMdefault em13/11/2026. Trata-se da candidata local BUILD63, não de uma declaração de publicação ou aprovação de equilíbrio. O último estágio publicado deve ser conferido pelo commit Git e pela branch, separadamente. Todas as medidas espaciais estão em pixels lógicos do mundo e os tempos em segundos ativos de simulação; o tamanho CSS da tela não muda o alcance físico.

### Convenções de implementação

- O robô, as armas e os módulos da tentativa são temporários; só desbloqueios e recursos de garagem persistem. Chassi e conjunto de armas ficam fixos durante a tentativa. Reforja altera a própria arma, sem fusão ou troca.
- Dano é por projétil/pellet, não por clique inteiro. O produto dano × pellets é um máximo geométrico de uma salva; não garante que todos acertem o mesmo alvo. A propriedade `rate` é intervalo em segundos: um número menor significa mais tiros por segundo.
- `×1,25` aumenta25%; `÷1,25` reduz20%. Custos se combinam por multiplicação, sem somar porcentagens. Atributos de arma são separados por slot; integridade, movimento, armadura, coleta e suportes são compartilhados.
- Uma arma mantém dano e movimento originais. Duas armas: dano de cada uma ×0,70 e movimento ×0,90. Três armas: dano de cada uma ×0,55 e movimento ×0,80. Aplicar estes custos uma vez ao montar a tentativa. Não dividir cura/armadura novamente por causa desses custos.
- PROT, FORJ, VOLT e NANO usam1slot; BAST permite até2 e ENXA até3. Slots adicionais são opcionais, exigem desbloqueio e devem ter IDs distintos. TeclaR solicita recarga de cada slot elegível; cada arma mantém munição, fila de rajada, cooldown, contador crítico, recarga, reforja e carga da Culatra próprios.

### Seis chassis

| ID | Nome | HP inicial/máximo | Velocidade px/s | Armadura | Slots máximos | Passiva/identidade |
| --- | --- | --- | --- | --- | --- | --- |
| prot | PROT-0001 | 100 | 190 | 0 | 1 | Equilibrado · 100 integridade · velocidade190 · 1 slot. |
| bastion | BAST-0002 | 120 | 155 | 1 | 2 | Blindado · 120 integridade · velocidade 155 · armadura1 · até2 armas. |
| forge | FORJ-0003 | 90 | 180 | 0 | 1 | Forja móvel · queimadura ×1,35 · dano direto ×0,9 · 1 slot. |
| volt | VOLT-0004 | 85 | 190 | 0 | 1 | Condutor · descarga ×1,35 · dano direto ×0,9 · 1 slot. |
| nano | NANO-0005 | 110 | 165 | 0 | 1 | Oficina móvel · recarga cura até3 proporcionalmente · 1 slot. |
| swarm | ENXA-0006 | 95 | 170 | 0 | 3 | Enxame · um drone de apoio desde o início · até3 armas. |

Aplicação das passivas: FORJ e VOLT começam com dano direto da arma ×0,9. FORJ multiplica novas queimaduras por1,35; VOLT multiplica descargas por1,35. NANO acrescenta até3HP à cura de uma recarga completa, proporcionalmente à reposição e dividindo pelo número de armas. ENXA começa com um drone, que conta para o teto global de três. As passivas não são atributos permanentes comprados na garagem.

### Desbloqueios e economia

Perfil novo: PROT e Metralhadora disponíveis; demais equipamentos bloqueados. Parafusos são consumidos na compra. Quando indicado, exige e consome1peça do chefe correspondente além dos parafusos. Peças/bolts já obtidos ficam ao morrer; falha ao salvar deve reverter a compra e devolver integralmente ambos. Comprar equipamento não aumenta atributo permanente. A recarga não custa parafuso.

| Tipo | ID | Parafusos | Peça adicional |
| --- | --- | --- | --- |
| robots | bastion | 24 | Nenhuma |
| robots | forge | 28 | brute |
| robots | volt | 28 | coil |
| robots | nano | 24 | scrapper |
| robots | swarm | 30 | coil |
| weapons | shotgun | 8 | Nenhuma |
| weapons | burst | 12 | Nenhuma |
| weapons | flame | 14 | Nenhuma |
| weapons | disc | 16 | Nenhuma |
| weapons | cryo | 18 | Nenhuma |
| weapons | sniper | 22 | brute |
| weapons | harpoon | 24 | brute |
| weapons | grenade | 20 | scrapper |
| weapons | rocket | 26 | scrapper |
| weapons | laser | 22 | coil |
| weapons | tesla | 24 | coil |


### Doze armas — números base

Os valores da tabela são anteriores a passivas, loadout, módulos, protocolos, relíquias e reforjas. Velocidade ausente na definição original vale570px/s; raio ausente vale6px. Alcance nominal é velocidade × vida útil e não inclui raio do alvo, retorno ou trajetória de ricochete. Ângulo de dispersão é abertura total em radianos. Cada cartucho produz uma emissão; pellets da emissão gastam apenas um cartucho.

| ID | Nome | Dano/pellet | Intervalo s | Pellets/emissão | Abertura rad | Velocidade px/s | Vida do tiro s | Raio px | Cartuchos | Recarga cheia s | Comportamento |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| machine | Metralhadora | 22 | 0.32 | 1 | 0 | 570 | 1.8 | 6 | 24 | 1.4 | Tiro direto sem estado intrínseco |
| shotgun | Escopeta | 12 | 0.8 | 5 | 0.34 | 570 | 0.65 | 6 | 6 | 2.2 | Tiro direto sem estado intrínseco |
| burst | Fuzil de rajada | 14 | 0.65 | 1 | 0 | 570 | 1.5 | 6 | 30 | 1.8 | Rajada de3emissões, separadas0,075s; exige segurar disparo |
| sniper | Canhão de precisão | 88 | 1.15 | 1 | 0 | 1050 | 1.2 | 6 | 3 | 2.6 | Atravessa 4 corpos por trecho |
| laser | Emissor laser | 10 | 0.09 | 1 | 0 | 1600 | 0.5 | 4 | 60 | 1.6 | Tiro direto sem estado intrínseco |
| flame | Lança-chamas | 5 | 0.12 | 3 | 0.45 | 300 | 0.6 | 6 | 80 | 2.4 | Queimadura intrínseca:50% do dano da bala por segundo durante3s |
| cryo | Lançador criogênico | 22 | 0.36 | 1 | 0 | 420 | 1.6 | 6 | 12 | 2.4 | Frio intrínseco: movimento inimigo×0,5 por2s |
| rocket | Lança-foguetes | 70 | 1.3 | 1 | 0 | 280 | 2.4 | 6 | 1 | 4.8 | Explosão intrínseca raio96; multiplicador de splash1 |
| grenade | Lança-granadas | 45 | 1 | 1 | 0 | 320 | 1.1 | 6 | 4 | 3.6 | Explosão intrínseca raio90; multiplicador de splash1; Também detona uma vez por fim da vida útil |
| tesla | Carabina Tesla | 24 | 0.55 | 1 | 0 | 720 | 1 | 6 | 8 | 3 | Descarga em 2 outros alvos; cada um recebe metade do dano |
| disc | Disco de retorno | 24 | 0.85 | 1 | 0 | 360 | 1.8 | 6 | 3 | 3.4 | Retorna ao jogador após metade da vida; limpa conjunto de acertos na virada; não ricocheteia |
| harpoon | Arpão pneumático | 60 | 1.05 | 1 | 0 | 750 | 1.3 | 6 | 2 | 2.4 | Atravessa 2 corpos por trecho; Empurrão intrínseco65px; chefes recebem25% |


#### Fórmulas compartilhadas das armas

Para cada slot, mantenha `damage`, `rate`, `magazineMult`, `reloadMult`, `projectileMult`, `projectileSpeed`, `projectileSize`, `projectileLife`, `spreadMult`, `ammo`, `reloadTime`, `reloadTotal`, `reloadMissing`, `reloadCapacity`, `shotCount`, fila de rajadas e cooldown. Dano base e definição da arma são snapshots próprios. A arma primária pode espelhar esses campos no objeto do jogador, mas auxiliares não podem trocar temporariamente o estado global para disparar.

1. Capacidade `M=max(1,floor(cartuchosBase × magazineMult))`. Instalar capacidade maior não enche o carregador. Capacidade reduzida limita a munição existente aM.
2. Tempo de recarga cheia `T=recargaBase × reloadMult`. Ao iniciar comAmunições: `Tparcial=(M-A)/M × T`. Arma cheia, em recarga ou fora de combate não inicia outra recarga. Ao iniciar, capturar `reloadMissing=M-A`, `reloadCapacity=M` e cancelar subtiros pendentes.
3. Na conclusão, usar a capacidade atualMnovo. `replaced=max(0,Mnovo-ammoAtual)`; `f=min(1,max(0,min(reloadMissing,replaced)/reloadCapacity))`. Repor munição paraMnovo e curar `(5 se skillrepair +3 se NANO) × f / númeroDeArmas`, limitado ao HP faltante. Refills ocorridos durante a recarga diminuem a reposição efetiva; não conceder cura de carregador inteiro para uma bala.
4. Dano antes do tiro: `D=slot.damage + (min(slot.damage×0,75,HPmáximo×0,03) se titan earmor adquiridos; caso contrário0)`.
5. Intervalo efetivo `I=slot.rate/(3 se frenzy>0; senão1)`. Cooldown reduz por tempo ativo; nunca emitir acima do limite compartilhado de400balas. Múltiplas armas usam ordem de serviço rotativa, para não matar de fome o último slot.
6. Número planejado de pellets `Npedido=min(400,max(1,floor(pelletsDaArma × projectileMult)))`. Se há Bprojéteis antes da emissão, `Nemitido=min(Npedido,400-B)`. Uma vaga restante pode emitir só um dos pellets da salva, mas consome um único cartucho. Sem vaga alguma, retornar falha sem gastar munição, crítico, carga de reparo ou energia da Culatra.
7. Abertura `S=max(dispersãoDaArma,0,16 se Npedido>1; senão0) × spreadMult`. Se Npedido=1, usar mira exata; caso contrário o pellet i usa `mira+(i/(Npedido-1)-0,5)×S`, para i=0atéNemitido-1. O leque é calculado pelo número planejado, não pelo que coube. Com399balas e10pellets pedidos, o único pellet emitido sai em mira−S/2, não no centro. Não randomizar nem recentralizar a salva truncada.
8. Velocidade `V=(velocidadeDaArma ou570) × projectileSpeed`; vida `L=vidaDaArma × projectileLife`; raio `R=(raioDaArma ou6) × projectileSize`.
9. Incrementar `shotCount` uma vez por emissão real. Se crítico adquirido e `shotCount mod5=0`, todos os pellets daquela emissão recebem dano×3 e marca crítica. Não é chance aleatória; não confundir quinto disparo com último cartucho.
10. Se carga de reparo estava pronta, consumir uma vez por emissão: todos os pellets recebem dano×1,5 e mais2perfurações. Não consome a carga quando o disparo é bloqueado.
11. Snapshot do projétil `dano=D × fatorCritico × fatorReparo × fatorCulatra`. Salvar arma/reforja/slot/raio/velocidade/vida e conjunto de alvos já atingidos. Modificar a arma depois não reescreve tiros antigos. O Colimador é um evento espacial posterior explicitamente permitido.
12. Perfurações: corpo de tiro comum `1 + perfuraçãoIntrínseca + (2 se skillpierce) + (2 se reparo pronto)`. Disco usa teto operacional999por trecho e limpa acertos ao começar o retorno. Cada arma retornável mantém velocidade de retorno capturada na emissão; não herda velocidade de uma reforja posterior.
13. Rajada agenda subtiros de0,075s; cada subtiro realmente emitido gasta cartucho e atualiza crítico/Culatra separadamente. Liberar fogo, perder foco, abrir oferta ou começar recarga cancela fila; não despejar subtiros atrasados ao retomar.

### Vinte e quatro reforjas de arma — nível20

Cada uma das12armas tem duas opções. No nível20, ofertar a arma primária e depois cada auxiliar, sequencialmente e com a simulação pausada. Escolher uma ou recusar por slot. A oferta substitui o módulo comum desse nível; não volta após recusa. Conservar munição, progresso de recarga, cargas da Culatra, cooldown e projéteis antigos; se uma capacidade menor for instalada, só limitar ammo aMnovo. Não repor cartuchos, não trocar arma, não fundir armas.

| Arma | ID da reforja | Nome | Ganho | Custo/limite |
| --- | --- | --- | --- | --- |
| machine | machine-heavyFeed | ALIMENTAÇÃO PESADA | Dano por projétil ×1,3. | Tempo de recarga ×1,2. |
| machine | machine-beltFeed | ESTEIRA DE MUNIÇÃO | Capacidade do carregador ×1,5. | Tempo de recarga ×1,15. Não repõe munição ao instalar. |
| shotgun | shotgun-choke | GARGALO DE PRECISÃO | Dispersão ×0,5 e dano ×1,15. | Intervalo entre disparos ×1,15. |
| shotgun | shotgun-wideBore | CÂMARA DE VARREDURA | Dois pellets adicionais por emissão, antes dos multiplicadores. | Dano por pellet ×0,8 e tempo de recarga ×1,2. |
| burst | burst-fourStroke | CICLO DE QUATRO TEMPOS | Uma bala adicional em cada rajada. | Intervalo entre rajadas ×1,2 e tempo de recarga ×1,15. |
| burst | burst-quickBreech | CULATRA ÁGIL | Tempo de recarga ×0,75. | Dano por bala ×0,9. |
| sniper | sniper-railDrill | BROCA FERROVIÁRIA | Atravessa três alvos adicionais e dano ×1,2. | Intervalo entre disparos ×1,2. |
| sniper | sniper-cyclingBolt | FERROLHO CÍCLICO | Intervalo entre disparos ×0,75. | Dano por projétil ×0,9. |
| laser | laser-pulseClock | OSCILADOR DE PULSOS | Intervalo entre disparos ×0,75. | Tempo de recarga ×1,25. |
| laser | laser-longLens | LENTE DE LONGO CURSO | Duração do projétil ×1,5 e dano ×1,2. | Intervalo entre disparos ×1,2. |
| flame | flame-fuelMixer | MISTURADOR DE COMBUSTÍVEL | Dano da queimadura aplicada ×1,5. | Dano direto ×0,8; também reduz a base da queimadura. |
| flame | flame-longNozzle | BICO DE LONGO ALCANCE | Duração dos projéteis ×1,75. | Intervalo entre disparos ×1,2. |
| cryo | cryo-iceDrill | BROCA GLACIAL | Atravessa dois alvos adicionais. | Dano por projétil ×0,85. |
| cryo | cryo-deepCooling | REFRIGERAÇÃO PROFUNDA | Resfriamento por impacto dura mais 1 s; dano ×1,15. | Intervalo entre disparos ×1,15. |
| rocket | rocket-siegeWarhead | OGIVA DE CERCO | Raio intrínseco da explosão ×1,5. | Dano ×0,85 e tempo de recarga ×1,15. |
| rocket | rocket-guidedTube | TUBO DE PRESSÃO | Velocidade dos projéteis ×1,6 e dano ×1,25. | Raio intrínseco da explosão ×0,75. A mira continua manual. |
| grenade | grenade-pressureShell | CASCO DE PRESSÃO | Raio intrínseco da explosão ×1,3. | Duração até detonar ×1,25. |
| grenade | grenade-doubleShell | CARGA BIFURCADA | Uma granada adicional por emissão; dispersão em leque. | Dano por granada ×0,65 e tempo de recarga ×1,25. |
| tesla | tesla-branchCoil | BOBINA RAMIFICADA | Descargas intrínsecas alcançam dois alvos adicionais. | Dano direto e base elétrica ×0,85. |
| tesla | tesla-focusedCoil | BOBINA CONCENTRADA | Dano direto e base elétrica ×1,5. | Um alvo intrínseco a menos; intervalo entre disparos ×1,15. |
| disc | disc-fastRotor | ROTOR DE ALTA ROTAÇÃO | Velocidade dos projéteis ×1,4 e dano ×1,2. | Duração do projétil ×0,8. |
| disc | disc-impactRim | ARO DE IMPACTO | Impactos ganham explosão intrínseca de raio 48, com metade do dano. | Dano direto ×0,85 e tempo de recarga ×1,2. |
| harpoon | harpoon-longShaft | HASTE TRANSFIXANTE | Atravessa três alvos adicionais e dano ×1,15. | Intervalo entre disparos ×1,2. |
| harpoon | harpoon-pressurePiston | PISTÃO DE PRESSÃO | Empurrão intrínseco +40; dano ×1,3 e velocidade do projétil ×1,3. | Tempo de recarga ×1,2. Chefes mantêm resistência ao empurrão. |

Notas de aplicação: multiplicadores se aplicam aos atributos do slot; adições de pellets/perfuração/rajada/empurrão/chain se aplicam à definição congelada da arma. `burnMult` modifica a queimadura, `coldBonus` soma duração do frio, `explosionMult` muda o raio intrínseco, e`minSpread` impõe abertura mínima antes do multiplicador. Misturador de combustível resulta em0,8×1,5=1,2vez a queimadura anterior quando só esses dois fatores mudam; não chamar de+50% líquido.

### Cinquenta e seis módulos normais — quatorze raízes

Cada raiz tem três filhos combináveis; não é necessário escolher só um filho. Cada ID só pode ser adquirido uma vez por tentativa. Pré-requisito indica ID que já deve estar adquirido, não um custo pago. Custos abaixo são aplicados imediatamente à tentativa. Se não houver custo, não inventar uma penalidade. No catálogo padrão, todos têm nível mínimo1, mas filhos continuam dependentes do pai. Ricochete só é elegível se houver ao menos uma arma equipada que não retorne.

| ID | Nome | Pré-requisito | Ganho/comportamento | Custo/limite |
| --- | --- | --- | --- | --- |
| reserveBank | BANCO DE RESERVA | Nenhum — raiz | Proteção consumível separada: começa em 20, máximo 40. Converte 50% do excesso de cura. Dano que excede a reserva atinge a integridade. | Recarga das armas ×1,10. |
| shieldDrive | PONTE DE POTÊNCIA | reserveBank, shield | Dano dos cartuchos ×1,20 enquanto o Escudo Capacitivo estiver pronto. | Exige Banco e Escudo Capacitivo. Reserva sozinha não mantém o bônus. |
| cleanCircuit | CIRCUITO PRESERVADO | reserveBank | Dano dos cartuchos +10% após 15 s sem impactos; +20% após 30 s, máximo. | Qualquer impacto aceito, inclusive absorvido, zera a sequência. |
| pulseRecovery | RETORNO DE VARREDURA | reserveBank, sensor | Abate direto do sensor repõe 4 de reserva e antecipa em 8 s o Escudo Capacitivo descarregado. | Exige Banco e Sensor. Até 3 abates beneficiados por pulso; estados transmitidos não contam. |
| rotors | ROTORES DE SUCATA | Nenhum — raiz | Dois discos orbitam o robô e causam 55% do dano direto por contato. Cada disco acerta o mesmo alvo no máximo uma vez por volta. | Dano direto ×0,9. Suporte não ativa efeitos de bala. |
| rotorThird | TERCEIRO ROTOR | rotors | Acrescenta um disco orbital; máximo três. | Dano dos rotores ÷1,25. |
| rotorReach | BRAÇOS MAGNÉTICOS | rotors | Raio da órbita ×1,5. A faixa de contato se afasta do robô. | Duração de cada volta ×1,25. |
| rotorDrive | TRANSMISSÃO ACELERADA | rotors | Duração de cada volta ×0,65. | Dano dos rotores ×0,8. |
| sensor | SENSOR DE VARREDURA | Nenhum — raiz | Pulso a cada 3 s atinge inimigos em raio 170; dano de 35% da base da arma. Sem munição ou mira automática da arma. | Tempo de recarga da arma ×1,15. |
| sensorRange | LENTE DE VARREDURA | sensor | Alcance do sensor ×1,5. | Intervalo do sensor ×1,2. Não reinicia a carga em andamento. |
| sensorRelay | RELÉ DE ESTADOS | sensor | O pulso transmite queimadura e resfriamento adquiridos ou intrínsecos da arma. | Dano do sensor ÷1,25. Não transmite corrosão, descarga, explosão, crítico ou empurrão. |
| sensorLock | LEITURA DE PONTO FRACO | sensor | Sobreviventes do pulso ficam expostos por 2 s: tiros manuais causam +25% de dano. | Dano do sensor ×0,75. Escudos bloqueiam a exposição; não acumula. |
| corrosion | REVESTIMENTO CORROSIVO | Nenhum — raiz | Impactos marcam sobreviventes: após 2 s, causam novamente o dano da bala. Uma carga por alvo; sem renovar ou acumular. | Dano direto ×0,85. Escudos bloqueiam a aplicação. |
| corrosionFuse | INICIADOR RÁPIDO | corrosion | Prazo das novas cargas ×0,5. | Dano das novas cargas ×0,75. |
| corrosionBloom | RESPINGO REAGENTE | corrosion | Morte de um alvo com carga primária transfere metade da carga a até dois vizinhos próximos. | Recarga ×1,15. Cargas transferidas não se propagam; escudos bloqueiam o respingo. |
| corrosionCatalyst | CATALISADOR TÉRMICO | corrosion | Detonação corrosiva causa +50% de dano se o alvo ainda estiver queimando ou resfriado. | Dano direto ÷1,15. Fogo e gelo não acumulam este bônus. |
| damage | ALTO IMPACTO | Nenhum — raiz | Dano ×2. |  |
| bossHunter | CAÇA-TITÃS | damage | Dano contra chefe ×3. Derrotar um chefe recupera mais20 de integridade. | Alcance dos projéteis ÷1,5. |
| finisher | FINALIZADOR | damage | Dano ×3 contra alvos com até um terço da vida. | Velocidade das balas ÷1,5. |
| crit | QUINTO IMPACTO | damage | Cada quinto disparo causa dano ×3. | Capacidade do carregador ÷1,25 (mínimo 1). |
| rate | OVERDRIVE | Nenhum — raiz | Cadência ×3. |  |
| extra | CÂMARA DUPLA | rate | Projéteis por disparo ×2. | Dispersão ×1,5 e alcance ÷1,5. |
| ricochet | MUNIÇÃO RICOCHETE | rate | Cada bala busca um alvo adicional após esgotar perfuração. | Tempo de recarga ×1,5. Não combina com disco. |
| range | PROPULSÃO BALÍSTICA | rate | Alcance dos projéteis ×3. | Tamanho das balas ÷1,25. |
| armor | BLINDAGEM REFORÇADA | Nenhum — raiz | Reduz 2 de dano por golpe; mínimo recebido 1. | Velocidade de movimento dividida por 1,25. |
| titan | CHASSI TITÂNICO | armor | Vida máxima e atual ×3. Com Blindagem Reforçada, converte3% da vida máxima em dano por projétil, limitado a75% do dano direto. | Velocidade ÷1,5 e tempo de recarga ×1,5. |
| salvage | BATERIA DE SUCATA | armor | A cada 20 zumbis mortos, recupera uma bateria (20 de vida). | Alcance de coleta ÷1,25. Não ultrapassa a vida máxima. |
| regen | OFICINA ESTACIONÁRIA | armor | Após 3 s parado, recupera 2 de vida por segundo. | Dano das balas ÷1,25. Mover interrompe o reparo. |
| magnet | CAMPO MAGNÉTICO | Nenhum — raiz | Alcance de coleta ×3. |  |
| xp | PROCESSADOR DE EXPERIÊNCIA | magnet | Experiência por núcleo ×2. | Tempo de recarga ×1,5. |
| repair | MANUTENÇÃO NA RECARGA | magnet | Recargas recuperam até5 de vida proporcionalmente à munição reposta. | Tempo de recarga ×1,25. Só funciona após gastar munição. |
| killAmmo | DEPÓSITO AMPLIADO | magnet | Capacidade do carregador ×3; a cada 10 mortes, devolve uma munição. Não repõe munição ao instalar. |  |
| burn | MUNIÇÃO INCENDIÁRIA | Nenhum — raiz | Impactos queimam por 3 s: metade do dano da bala por segundo. Em armas incendiárias, a queimadura ganha mais25%. | Alcance dos projéteis ÷1,25. |
| thermal | CHOQUE TÉRMICO | burn | Queimadura causa dano ×3 enquanto o alvo está resfriado. | Dano direto das balas ÷1,5. Exige resfriar o alvo. |
| ignition | FORNALHA | burn | Duração da queimadura ×3. | Tempo de recarga ×1,5. |
| afterburn | COMBUSTÃO CONCENTRADA | burn | Dano da queimadura ×3. | Cadência ÷1,5. |
| freeze | NÚCLEO CRIOGÊNICO | Nenhum — raiz | Impactos deixam o movimento inimigo ÷2 por 2 s; em armas criogênicas, dura3 s. | Velocidade dos projéteis ÷1,25. |
| pierce | PERFURAÇÃO | freeze | Projéteis atravessam dois alvos adicionais. |  |
| knock | IMPACTO CINÉTICO | freeze | Empurra uma distância curta; chefes recebem um quarto do empurrão. | Cadência ÷1,5. |
| coldReload | RECARGA GLACIAL | freeze | Ao terminar uma recarga, resfria alvos em uma área média por 4 s. | Tempo de recarga ×1,5. |
| shock | DESCARGA | Nenhum — raiz | Impactos atingem outro alvo com metade do dano; perfuração amplia para três. Em armas elétricas, soma os alvos e aumenta o dano elétrico em25%. | Dano direto das balas ÷1,5. |
| conductivity | CONDUTIVIDADE | shock | Alcance elétrico ×3. | Alcance dos projéteis ÷1,5. |
| stun | CURTO-CIRCUITO | shock | Descargas param movimento por 1 s; chefe por um quarto de segundo. | Cadência ÷1,5. Não cancela ataques. |
| shield | ESCUDO CAPACITIVO | shock | Absorve um impacto e recarrega em 120 s de combate. | Velocidade de movimento ÷1,5. |
| dash | PROPULSOR AUXILIAR | Nenhum — raiz | ESPAÇO: avanço de 0,15 s com velocidade ×3. Recarga 4 s. | Não concede invulnerabilidade. |
| speed | PERNAS HIDRÁULICAS | dash | Velocidade de movimento ×2. | Vida máxima e atual ÷1,5; mínimo 1. |
| grace | ISOLAMENTO DE IMPACTO | dash | Proteção normal após sofrer dano ×2. | Capacidade do carregador ÷1,25 (mínimo 1). |
| emergency | RESERVA DE EMERGÊNCIA | dash | Ao sobreviver a dano, ganha 3 s de proteção. Recarga 120 s de combate. | Alcance de coleta ÷1,25. Não ressuscita. |
| blast | CARGA EXPLOSIVA | Nenhum — raiz | Cada impacto cria uma explosão pequena, causando metade do dano a outros alvos. Em armas explosivas, aumenta o dano da explosão em25%. | Tempo de recarga ×1,5. |
| blastRadius | ONDA EXPANDIDA | blast | Raio das explosões ×2. | Dano direto das balas ÷1,5. |
| retaliation | PULSO DE RETALIAÇÃO | blast | Ao sobreviver a dano, cria uma explosão média com dano ×3. Recarga 120 s. | Vida máxima e atual ÷1,5; mínimo 1. |
| overload | SOBRECARGA REATIVA | blast | Ao sobreviver a dano, ganha cadência ×3 por 6 s. Recarga 120 s de combate. | Tempo de recarga da arma ×1,5. |
| drones | DRONE DE APOIO | Nenhum — raiz | Acrescenta um drone; máximo3. Cada drone causa25% do dano direto a cada0,8s, no alcance320px. | Tempo de recarga ×1,15. |
| dronePair | DUPLA DE APOIO | drones | Acrescenta um drone; máximo3 incluindo o drone do ENXA. | Dano direto ÷1,15. |
| droneOverclock | ROTORES ACELERADOS | drones | Intervalo de ataque dos drones ×0,7; mínimo0,35s. | Alcance dos drones ÷1,15. |
| droneArc | ARCO DE APOIO | drones | Ataque do drone atinge um segundo alvo a até160px por metade do dano. | Dano dos drones ÷1,2. |


#### Precisões numéricas dos módulos e sinergias

- Escudo Capacitivo bloqueia um impacto; só recarrega durante combate após120s. Se absorveu, não aplicar dano corporal ou empurrão daquele impacto. Propulsor dura0,15s a3×velocidade com cooldown4s e não dá invulnerabilidade.
- Impacto Cinético acrescenta60px ao empurrão; chefe recebe25%. Motor Cinético exige simultaneamente `knock` e `speed`: após impacto de bala em corpo não protegido e ainda vivo, causa `min(danoDiretoDeOrigem×0,5,velocidadeDoRobô×0,1)` de fonte cinética. Não transformar isso em bônus permanente de toda bala.
- Explosão comum tem raio64px; Onda Expandida (`blastRadius`) multiplica raio por2. Dano a vizinhos é50% do dano da bala. Armas com explosão intrínseca usam o maior raio entre o intrínseco e64; a habilidadeblast multiplica o dano da explosão intrínseca por1,25. Excluir o alvo que já recebeu o impacto direto. A explosão não aplica novamente toda a cadeia de procs de bala, mas se shock estiver adquirido pode emitir descargas a partir de sobreviventes; essas descargas não criam outra explosão recursiva.
- Crivo Balístico exige `crit` e `extra`: um projétil crítico pode gerar um pulso por objeto-projétil, raio48px, dano35% do próprio dano. Campo `criticalPulseDone` impede repetir o pulso em cada perfuração.
- Fratura Industrial exige `freeze` e `finisher`, alvo resfriado e morte por bala: explosão de raio70px (ainda multiplicável porblastRadius), dano50% de directDamage capturado em multi, ou de P ATUAL no fallback single, excluindo o cadáver. Afetar outros alvos com fonte secundária sem recursão de bala. Não confundir executar abaixo de1/3HP com danificar qualquer alvo por×3.
- Descarga busca alvos distintos além do alvo original: intrínsecos da arma + (1 se shock, ou3 se shock e pierce) +1 de extraFork. Raio135px, ou405comconductivity. Cada alvo recebe50% do dano da bala, ×1,35seVOLT e×1,25se a arma já temchain e shock foi adquirido. Não é uma cadeia recursiva de raio sobre raio.
- O multiplicador Caça-Titãs aplica-se a fontes de dano que chegam ao chefe pela função de dano; o Finalizador avalia a vida antes de cada golpe. Declarar a fonte para evitar propagar corpos mortos ou disparar callbacks de bala a partir de suportes.
- Resfriamento divide velocidade inimiga por2, sem cancelar ataque já preparado. Paralisação suspende deslocamento, mas também não cancela a agenda de ataque. O fim de uma recarga glacial atinge raio140px por4s. Circuito Refrigerante do NANO tem raio80px por2s e exige fração de reposição≥0,5.
- Retaliação usa explosão defensiva de raio140px e dano3×player.damage, acionada somente após sobreviver ao dano; Sobrecarga Reativa triplica cadência por6s após sobreviver; ambos têm cooldown120s. O dash não substitui a regra de sobreviver. A proteção pós-dano é0,65s e vira1,3scom Isolamento; absorver por escudo concede0,25s e não provoca empurrão; não prometer ressurreição pela Reserva de Emergência.

### Seis Gambiarras

Ofertar três alternativas nos níveis3,6e9, substituindo a escolha comum correspondente. Permitir escolher ou pular. Uma mesma gambiarra já instalada não reaparece. Efeito só na tentativa. Valores que afetam armas são replicados por slot; vida/armadura/coleta/movimento são compartilhados.

| ID | Nome | Efeito |
| --- | --- | --- |
| pulseCoil | BOBINA DE PULSO | Dano ×1,25 nesta tentativa. |
| triggerRegulator | REGULADOR DE GATILHO | Intervalo entre disparos ×0,8 nesta tentativa. |
| spareBattery | BATERIA DE RESERVA | Vida máxima e atual +20 nesta tentativa. |
| scrapMagnet | ELETROÍMÃ DE SUCATA | Alcance de coleta ×1,75 nesta tentativa. |
| greasedServos | SERVOS LUBRIFICADOS | Velocidade de movimento ×1,2 nesta tentativa. |
| copperPlate | PLACA DE COBRE | Reduz 1 de dano recebido nesta tentativa. |


### Seis Experimentos do Biruta

São fallback de baú quando não resta relíquia rara elegível. Quando também se esgotam, o baú passa à melhoria comum. São temporários, sem repetição por tentativa e têm custos descritos. A peça de fabricação persistente do chefe e a cura da derrota continuam independentes de aceitar o experimento.

| ID | Nome | Ganho | Custo |
| --- | --- | --- | --- |
| volatileReactor | REATOR VOLÁTIL | Dano ×1,35. | Intervalo de tiro ×1,15. |
| unstableLens | LENTE INSTÁVEL | Velocidade e tamanho de projétil ×1,5. | Movimento ×0,85. |
| lithiumPack | PACOTE DE LÍTIO | Integridade máxima e atual +30. | Armadura −1. |
| scrapCatalyst | CATALISADOR DE SUCATA | Alcance de coleta ×2. | Recarga da arma ×1,5. |
| blastCondenser | CONDENSADOR DE IMPACTO | Dano ×1,5. | Intervalo de tiro ×1,35. |
| nervousServo | SERVO NERVOSO | Movimento ×1,35. | Armadura −1. |


### Dezoito protocolos de chassi — nível10

No nível10, ofertar as três opções do chassi escolhido; selecionar uma ou recusar. Só um protocolo por tentativa, sem persistência. Efeitos condicionais usam gatilhos exatos da tabela; cura com HP cheio não é cura real, suporte não herda genericamente estados de bala, e redução de velocidade hostil não retarda investida.

| Chassi | ID | Nome | Ganho/gatilho | Condição/limite |
| --- | --- | --- | --- | --- |
| PROT-0001 | tailDecoy | ISCA DE CAUDA | Após sofrer dano não letal, deixa um eco por 1,5 s que atrai perseguidores comuns. Recarga 24 s. | Chefes, lacaios e atiradores ignoram o eco. |
| PROT-0001 | predatorMark | MARCA DO PREDADOR | O primeiro acerto marca um alvo por 2,5 s. Acertos seguintes nele causam +25% de dano. | Só um alvo marcado; acertar outro transfere a marca. |
| PROT-0001 | nineLives | ALERTA DE NOVE VIDAS | Ao cruzar abaixo de 20% de integridade, empurra comuns próximos em 90 px e interrompe por 0,5 s. Raio 100 px; recarga 30 s. | Não cura nem concede invulnerabilidade; exige sobreviver ao golpe. |
| BAST-0002 | grounding | ATERRAMENTO DE CAMPO | Recebe 30% menos dano das zonas de perigo dos chefes. | Não reduz contato nem projéteis. |
| BAST-0002 | magneticBrake | FREIO ELETROMAGNÉTICO | Projéteis hostis dentro de 90 px movem-se 25% mais devagar. | Não afeta investidas nem projéteis do jogador. |
| BAST-0002 | threatReader | PROTOCOLO DE LEITURA | Avisos de chefe iniciados a até 180 px duram 20% mais. | Não retarda a execução dos ataques nem altera o relógio. |
| FORJ-0003 | furnaceDuration | CÂMARA DE FORNALHA | Duração da queimadura ×1,5. | Afeta queimaduras aplicadas após a escolha. |
| FORJ-0003 | thermalAmplifier | AMPLIFICADOR TÉRMICO | Queimadura em alvos resfriados causa +25% de dano. | Exige resfriar o alvo. |
| FORJ-0003 | heatRecovery | RECUPERADOR DE CALOR | Abates por queimadura recuperam1 de integridade. Recarga2s. | Sem cura em integridade cheia. |
| VOLT-0004 | extraFork | DERIVAÇÃO ADICIONAL | Descargas atingem um alvo adicional. | Exige arma elétrica ou Descarga. |
| VOLT-0004 | chargeRecovery | RECUPERAÇÃO DE CARGA | A cada6 alvos eletrocutados repõe uma munição. Recarga0,25s. | Não ultrapassa o carregador. |
| VOLT-0004 | groundPulse | PULSO DE ATERRAMENTO | Descargas interrompem comuns por mais0,35s; chefes por0,1s. | Não cancela ataques já preparados. |
| NANO-0005 | repairCharge | CARGA DE REPARO | Cura real fortalece o próximo disparo em50% e acrescenta2 perfurações. | Não acumula; uma emissão consome a carga. |
| NANO-0005 | repairPlating | REVESTIMENTO REPARADOR | Cura real concede redução2 de dano por2s. | Não acumula proteção. |
| NANO-0005 | coolantLoop | CIRCUITO REFRIGERANTE | Recarga de ao menos50% resfria inimigos em80px por2s. | Exige recarregar metade do carregador. |
| ENXA-0006 | droneSalvage | RECICLAGEM DO ENXAME | Abates por drone curam1 de integridade. Recarga1,5s. | Somente abates do drone. |
| ENXA-0006 | droneBossFocus | FOCO ANTICHEFE | Drones priorizam chefe no alcance e causam +25% de dano nele. | Não aumenta alcance. |
| ENXA-0006 | droneRelay | RELÉ DO ENXAME | Alcance dos drones +100px; coleta ×1,25. | Não aumenta o número de drones. |


### Dezenove relíquias de baú — candidata BUILD65

Baú físico fica no local da morte, sem expiração ou atração por ímã; coleta exige distância<40px. Escolher uma entre até3peças, sem repetição na mesma tentativa. Relíquias não entram no pool normal do level-up, não são vendidas como estatística permanente e não fazem parte dos86editáveis. Preferir até2opções específicas elegíveis e reservar alternativa universal; embaralhar cada pool com RNG de combate antes de formar a oferta. São universais Servo, Coração, Núcleo, Colimador, Culatra, Matriz de Rebites, Lâmina de Recarga, Pistão de Retorno e Pulso de Integridade; as outras exigem a arma/suporte listado. Oferta pausa e limpa entrada; callbacks antigos não podem instalar duas vezes ou após reinício.

| ID | Nome | Elegibilidade | Ganho |
| --- | --- | --- | --- |
| thermalRelay | CÂMARA DE COMBUSTÃO | Skillburn ou qualquer arma equipada com queimadura intrínseca | Queimaduras causam +50% de dano. |
| cryoLens | CRISTAL DE ESTASE | Skillfreeze ou qualquer arma equipada com frio intrínseco | Resfriamento dos impactos dura +50%. |
| arcCapacitor | CAPACITOR DE TEMPESTADE | Skillshock ou qualquer arma equipada comchain intrínseco | Descargas causam +40% de dano. |
| droneRack | BAIA DE COMANDO | Ao menos um drone, incluindo o nativo do ENXA | Drones: dano +50% e alcance +20%. Aos 30/60/90 s ativos, o treino aumenta o dano já modificado em +10%/+20%/+30%. |
| scanArray | MATRIZ DE CAÇA | Skillsensor adquirida | Sensores causam +50% de dano e pulsam 20% mais rápido. |
| rotorBearing | ROLAMENTO DE CERÂMICA | Skillrotors adquirida | Rotores causam +50% de dano e completam a volta 20% mais rápido. |
| corrosionChamber | CÁPSULA REAGENTE | Skillcorrosion adquirida | Novas cargas corrosivas causam +50% de dano e detonam 25% antes. |
| precisionBreech | CULATRA ANTITITÃ | Sniper ouharpoon equipado em qualquer slot | Canhão de precisão e arpão causam +40% de dano. |
| blastManifold | COLETOR DE DEMOLIÇÃO | Rocket ougrenade equipado em qualquer slot | Lança-foguetes e lança-granadas causam +40% de dano. |
| feedServo | SERVO DE ALIMENTAÇÃO | Universal | Todas as armas recarregam 25% mais rápido. Não repõe munição ao instalar. |
| reactorHeart | CORAÇÃO DO REATOR | Universal | Ganha 30 de integridade máxima e recupera até 30 de integridade. |
| overclockCore | NÚCLEO DE POTÊNCIA | Universal | Todas as armas causam +25% de dano. |
| fieldCollimator | COLIMADOR DE CAMPO | Universal; nascimento do campo espera direção manual válida | Ao mirar, fixa um campo por 4 s; repete a cada 6 s. Tiros que o atravessam ganham +35% de dano uma única vez. |
| ruptureChamber | CULATRA DE RUPTURA | Universal; energia começa0para cada arma ao instalar | Cada cartucho gasto guarda 1 carga (máx. 60/arma). O último soma +25% por carga, contando a dele. Recarregar antes descarta as cargas. |
| rivetMatrix | MATRIZ DE REBITES | Universal; estação depende de implantação manual após adquirir | [E] instala uma matriz na mira, entre 48 e 180 px, por 18 s. Seus tiros a alimentam; uma carga completa dispara 3 rebites com +10% de energia. Até 3 salvas; tiros absorvidos são consumidos. |
| reloadBlade | LÂMINA DE RECARGA | Universal; somente próximas recargas válidas após adquirir | Segurar fogo e mira durante recarga efetiva ataca cápsula frontal36..110px/r12 por arma. P=clamp(shotDamage×pellets planejados,0,1e9); DPS0,6P→1,2P, integral0,9PT, sem procs balísticos. |
| reloadPiston | PISTÃO DE RETORNO | Universal; próximas recargas válidas após adquirir | Invoca no fim, com mira manual finita; dano0,9P×fração realmente reposta;216px/0,6s, raio10, até3corpos uma vez, umporarma. CapturaPno início, fonte própria sem procs balísticos; substituição/residual por espaço. |
| vitalLink | ACOPLAMENTO VITAL |Drone real, inclusive nativoENXA |Cada ataque soma min(base,2,5%HPatual), sem custo deHP. Base inclui treino; foco depois; arco herda captura. Sem novos drones/cadência. |
| integrityPulse | PULSO DE INTEGRIDADE |Universal |Último cartucho realmente emitido: dano20%HPmáxima/Narmas, raio90+corpo, uma vez por cartucho. Não porpellet/recarga; sem procs balísticos, com gatilhos globais de morte anteriores. |



#### Baia, Colimador e Culatra em detalhes

- **Baia**: ao instalar, multiplicar dano de drone por1,5 e alcance por1,2; guardar o instante ativo. Aos30/60/90s decorridos, fator temporal1,1/1,2/1,3. Não acumular os três entre si nem alterar o atributo-base a cada tick. Teto da peça:1,5×1,3=1,95vezes o dano anterior, antes de outros bônus. Pausa/ofertas/morte não contam. Mostrar3LEDs e estágio na pausa; reset elimina a idade.
- **Colimador**: primeiro campo no primeiro tick com direção manual válida, centro96px à frente, raio36, vida4s e período6s ativos. Centro e orientação ficam ancorados. Limite1campo, sem backlog. O centro da bala deve tocar/entrar no círculo por segmento varrido, incluindo tangência e início dentro. Converter dano da bala por1,35 uma vez, mantendo arma, velocidade e vida. Marca não é limpa no retorno ou ricochete. Impacto anterior ao campo não recebe bônus; comparar contato com superfície do alvo, não só centro. Empate campo/corpo favorece campo (tolerância numérica8EPS no parâmetro), mas fim da vida no mesmo instante vence o campo. Guardar ordem legada de impactos. Em expiração, conservar endpoint legado da detonação e limitar cruzamento à vida restante. Temporários por impacto devem ser restaurados comfinally. Não criar novos procs.
- **Culatra candidata60**: para cada emissão que efetivamente gasta cartucho, `cNovo=min(60,c+1)`. SeammoAntes>1: armazenarcNovo e fator1. SeammoAntes=1: aplicar fator`1+0,25×cNovo` a cada pellet daquela emissão e armazenar0; só depois começa recarga automática. Recarregar antecipadamente descarta energia apenas se recarga realmente iniciar. Emissão bloqueada pelo limite400/recarga não consome. Reembolsar munição não gera carga; pode adiar descarga, que continua limitada60. Instalação no meio do carregador só conta gastos posteriores. Reforja preserva energia do mesmo slot; reset recria todos os slots. Fator máximo16é um pico por bala, não DPS sustentado. Sem reembolsos/crit/estados e em carregadorN≤60: soma do ciclo passa deNpara1,25Ntiros-base; paraN>60o adicional fica limitado15tiros-base.

### Dez receitas de build

Receitas são recomendações de equipamento e prioridade entre escolhas realmente ofertadas. Não concedem skills, não garantem sorteio e não acrescentam imunidade, dano ou cura escondidos. Emcada lista, a ordem ajuda a montar pré-requisitos. As quatro skills centrais indicam o motor mínimo e não são entregues automaticamente. Protocolos, Gambiarras e Experimentos são preferências compatíveis com ofertas reais. Não confundir a recomendação de oito módulos com o limite de módulos que uma tentativa longa pode adquirir.

#### Agulha Antititã — `agulha-antitita`

- Equipamento: prot + sniper; reforja preferida `sniper-railDrill`.
- Oito módulos, em ordem: `damage`, `bossHunter`, `freeze`, `rate`, `pierce`, `range`, `crit`, `dash`.
- Núcleo: `damage`, `bossHunter`, `freeze`, `rate`.
- Protocolo: `predatorMark`. Gambiarras: `pulseCoil`, `triggerRegulator`, `greasedServos`. Experimentos: `volatileReactor`, `unstableLens`.
- Motor: Impacto forte + perfuração + bônus contra chefe; Caça-Titãs recupera uma bateria adicional por chefe e a marca do PROT recompensa manter o mesmo alvo.
- Força: Alto dano por acerto e pressão em chefe alinhado com a horda.
- Fraqueza: Pouca munição e recarga longa deixam os flancos expostos.
- Uso: Mantenha distância, alinhe inimigos e use a recarga para reposicionar. Priorize o chefe quando houver uma linha segura.
- Evitar: Não atire fora do alcance reduzido por Caça-Titãs.; Não sacrifique toda a mobilidade por dano.

#### Tempestade Balística — `tempestade-balistica`

- Equipamento: prot + laser; reforja preferida `laser-pulseClock`.
- Oito módulos, em ordem: `rate`, `extra`, `damage`, `crit`, `magnet`, `killAmmo`, `freeze`, `pierce`.
- Núcleo: `rate`, `extra`, `damage`, `crit`.
- Protocolo: `predatorMark`. Gambiarras: `triggerRegulator`, `pulseCoil`, `spareBattery`. Experimentos: `volatileReactor`, `unstableLens`.
- Motor: Cadência + dois projéteis + crítico a cada quinto disparo ativam o Crivo Balístico, com um pulso de área por projétil crítico.
- Força: Boa frequência de acertos, progressão de crítico previsível e limpeza de corredores.
- Fraqueza: Perde força durante a recarga e cada projétil isolado é relativamente fraco.
- Uso: Varra a frente da horda, mantenha o alvo marcado em chefes e recolha núcleos nas janelas abertas.
- Evitar: Dispersão não garante que os dois projéteis acertem o mesmo alvo.; Evite aumentar repetidamente a recarga sem obter sustentação.

#### Escopeta de Ricochetes — `escopeta-ricochete`

- Equipamento: bastion + shotgun; reforja preferida `shotgun-wideBore`.
- Oito módulos, em ordem: `rate`, `extra`, `freeze`, `pierce`, `range`, `ricochet`, `damage`, `blast`.
- Núcleo: `rate`, `extra`, `freeze`, `pierce`.
- Protocolo: `magneticBrake`. Gambiarras: `pulseCoil`, `triggerRegulator`, `spareBattery`. Experimentos: `unstableLens`, `blastCondenser`.
- Motor: Pellets, perfuração e ricochete espalham os impactos. Propulsão Balística compensa as perdas de alcance antes das peças finais de dano e explosão.
- Força: Cobertura de grupos próximos e controle de várias linhas de aproximação.
- Fraqueza: Depende da Propulsão Balística para compensar o alcance perdido; mantém dispersão e recargas longas.
- Uso: Lute na borda dos grupos. Perfure primeiro; o ricochete só procura outro alvo depois de gastar a perfuração.
- Evitar: Não use a receita com Disco de Retorno: ele não recebe ricochete.; Não confunda dano somado dos pellets com dano garantido em um alvo.

#### Caçador Criogênico — `cacador-criogenico`

- Equipamento: prot + cryo; reforja preferida `cryo-iceDrill`.
- Oito módulos, em ordem: `damage`, `freeze`, `rate`, `pierce`, `finisher`, `dash`, `speed`, `range`.
- Núcleo: `damage`, `freeze`, `rate`, `pierce`.
- Protocolo: `tailDecoy`. Gambiarras: `pulseCoil`, `greasedServos`, `spareBattery`. Experimentos: `unstableLens`, `volatileReactor`.
- Motor: Resfriamento + perfuração mantêm grupos lentos; Finalizador amplifica o acabamento e mortes por bala de alvos resfriados geram Fratura Industrial.
- Força: Kiting e redução da pressão frontal sem depender de dano em área.
- Fraqueza: Vida reduzida por Pernas Hidráulicas e dano inicial menor após os custos de perfuração.
- Uso: Abra corredores, termine alvos já feridos e avance para recolher XP somente depois de resfriar a passagem.
- Evitar: Resfriar não cancela ataques de chefe.; O multiplicador do Finalizador exige o limiar de vida; ele não é dano permanente.

#### Forja Criogênica — `forja-criogenica`

- Equipamento: forge + flame; reforja preferida `flame-fuelMixer`.
- Oito módulos, em ordem: `burn`, `freeze`, `thermal`, `afterburn`, `damage`, `rate`, `range`, `ignition`.
- Núcleo: `burn`, `freeze`, `thermal`, `afterburn`.
- Protocolo: `thermalAmplifier`. Gambiarras: `pulseCoil`, `triggerRegulator`, `spareBattery`. Experimentos: `unstableLens`, `volatileReactor`.
- Motor: Aplicar fogo e resfriamento no mesmo alvo ativa Choque Térmico; o FORJ amplia a queimadura, com menor dano direto.
- Força: Dano persistente que continua durante a recarga e forte conversão elemental.
- Fraqueza: Precisa alcançar o alvo e manter os dois estados; não acumula infinitas queimaduras por pellet.
- Uso: Aplique o cone na frente da horda, recue durante a recarga e renove o resfriamento para sustentar o dano térmico.
- Evitar: Não trate a queimadura como dano instantâneo.; Não reduza ainda mais o alcance sem uma forma de se aproximar com segurança.

#### Rede de Plasma — `rede-de-plasma`

- Equipamento: volt + tesla; reforja preferida `tesla-branchCoil`.
- Oito módulos, em ordem: `shock`, `damage`, `burn`, `blast`, `conductivity`, `freeze`, `pierce`, `stun`.
- Núcleo: `shock`, `damage`, `burn`, `blast`.
- Protocolo: `extraFork`. Gambiarras: `pulseCoil`, `triggerRegulator`, `spareBattery`. Experimentos: `unstableLens`, `volatileReactor`.
- Motor: O VOLT fortalece descargas; fogo persiste enquanto perfuração, eletricidade e explosões distribuem dano por grupos.
- Força: Dano distribuído, alcance elétrico e interrupção de movimento.
- Fraqueza: Menos vida e vários custos de dano direto; perde eficiência contra um alvo isolado.
- Uso: Acerte a borda de grupos compactos. Mantenha caminhos de fuga e evite entrar no centro para buscar mais alvos.
- Evitar: Descargas secundárias não devem iniciar uma recursão infinita de explosões.; Paralisar movimento não cancela um ataque já programado.

#### Demolição de Campo — `demolicao-de-campo`

- Equipamento: bastion + grenade; reforja preferida `grenade-doubleShell`.
- Oito módulos, em ordem: `damage`, `rate`, `blast`, `blastRadius`, `bossHunter`, `magnet`, `repair`, `extra`.
- Núcleo: `damage`, `rate`, `blast`, `blastRadius`.
- Protocolo: `grounding`. Gambiarras: `pulseCoil`, `spareBattery`, `greasedServos`. Experimentos: `blastCondenser`, `unstableLens`.
- Motor: Dano de impacto + área expandida; projéteis adicionais aumentam as detonações e a manutenção aproveita a recarga.
- Força: Explosões grandes e dano concentrado em grupos alinhados com chefes.
- Fraqueza: A demora de recarga exige planejamento; é possível ser cercado antes do próximo carregador.
- Uso: Atire onde os inimigos vão se reunir. Abra uma saída antes de recarregar e evite atravessar zonas de perigo para buscar XP.
- Evitar: Não aceite todos os aumentos de recarga só pelo ganho de dano.; A explosão de impacto exclui o alvo que já recebeu o dano direto.

#### Oficina Viva — `oficina-viva`

- Equipamento: nano + shotgun; reforja preferida `shotgun-choke`.
- Oito módulos, em ordem: `magnet`, `repair`, `armor`, `titan`, `damage`, `rate`, `freeze`, `range`.
- Núcleo: `magnet`, `repair`, `armor`, `titan`.
- Protocolo: `repairCharge`. Gambiarras: `spareBattery`, `copperPlate`, `greasedServos`. Experimentos: `lithiumPack`, `volatileReactor`.
- Motor: O NANO repara a fração recarregada. Chassi Titânico converte vida em dano; cura efetiva prepara uma salva com mais50% e duas perfurações. Propulsão Balística alcança chefes distantes e os impactos frios abrem espaço.
- Força: Reserva de vida alta, reparo recorrente e proteção operacional durante as recargas.
- Fraqueza: É lenta e a cura não acompanha dano recebido sem parar; ficar parado em áreas de chefe continua perigoso.
- Uso: Gaste munição de forma útil, recarregue com distância e use o resfriamento para abrir o próximo deslocamento.
- Evitar: Recarregar uma bala não concede a cura de um carregador inteiro.; Cura com vida cheia não prepara uma carga ofensiva.

#### Enxame de Sucata — `enxame-de-sucata`

- Equipamento: swarm + harpoon; reforja preferida `harpoon-longShaft`.
- Oito módulos, em ordem: `drones`, `damage`, `dronePair`, `droneOverclock`, `droneArc`, `magnet`, `armor`, `salvage`.
- Núcleo: `drones`, `damage`, `dronePair`, `droneOverclock`.
- Protocolo: `droneBossFocus`. Gambiarras: `pulseCoil`, `greasedServos`, `spareBattery`. Experimentos: `volatileReactor`, `unstableLens`.
- Motor: O ENXA já tem um drone; a árvore amplia a frota até três, acelera disparos e permite um segundo alvo sem procs recursivos.
- Força: Dano contínuo em alvos no alcance mesmo durante a recarga da arma.
- Fraqueza: A frota tem alcance e cadência limitados; não acerta inimigos do outro lado do mapa.
- Uso: Mantenha os alvos dentro do raio dos drones, use o arpão para empurrar ameaças próximas e recolha núcleos nos corredores abertos.
- Evitar: Drones não disparam a arma do jogador nem multiplicam infinitamente outros efeitos.; Mais projéteis da arma não criam mais drones.

#### Lança de Fuga — `lanca-de-fuga`

- Equipamento: nano + harpoon; reforja preferida `harpoon-pressurePiston`.
- Oito módulos, em ordem: `damage`, `rate`, `magnet`, `repair`, `dash`, `speed`, `freeze`, `knock`.
- Núcleo: `damage`, `magnet`, `repair`, `dash`.
- Protocolo: `repairCharge`. Gambiarras: `spareBattery`, `pulseCoil`, `greasedServos`. Experimentos: `volatileReactor`, `lithiumPack`.
- Motor: NANO + recarga reparadora + avanço; cura real prepara uma salva perfurante. O Motor Cinético acrescenta dano quando Pernas Hidráulicas e Impacto Cinético se encontram.
- Força: Reparo frequente, coleta ampla e disparos perfurantes preparados por cura.
- Fraqueza: Pouca munição; velocidade custa vida, e reparar exige completar recargas. Integridade cheia não prepara a carga ofensiva.
- Uso: Monte coleta e reparo antes de apostar toda a defesa na velocidade. Circule a horda, gaste o carregador mirando a saída e use o avanço para mudar de corredor durante a recarga.
- Evitar: O avanço não concede invulnerabilidade.; Recargas parciais curam proporcionalmente menos.; Cura em integridade cheia não prepara a Carga de Reparo.

### Painel editável:86registros e25atributos

Catálogo padrão:56normais+6gambiarras+6experimentos+18protocolos=86. Reforjas24 e relíquias19 são catálogos separados; compêndio atual tem105entradas de módulos/relíquias, além dos manuais de reforja. Não aumentar o catálogo do painel para105por contar as peças raras. Revisão de migração do catálogo:7; chave de armazenamento `screwvivors.balance.v1`, envelope `{version:1,catalogRevision:7,skills:[...]}`. Perfil de equipamentos é outra chave: `screwvivors.profile.v1`, versão2.

#### Campos numéricos suportados

| Chave | Nome editável |
| --- | --- |
| hp | Integridade atual |
| maxHp | Integridade máxima |
| damage | Dano direto |
| rate | Intervalo de disparo |
| speed | Velocidade de movimento |
| armor | Armadura |
| magnet | Alcance de coleta |
| magazineMult | Multiplicador do carregador |
| reloadMult | Multiplicador de recarga |
| projectileMult | Multiplicador de projéteis |
| projectileSpeed | Velocidade dos projéteis |
| projectileSize | Tamanho dos projéteis |
| projectileLife | Duração dos projéteis |
| spreadMult | Dispersão |
| droneDamageMult | Dano dos drones |
| droneRateMult | Intervalo dos drones |
| droneRange | Alcance dos drones |
| corrosionDamageMult | Dano da corrosão |
| corrosionDelayMult | Prazo da corrosão |
| sensorDamageMult | Dano do sensor |
| sensorIntervalMult | Intervalo do sensor |
| sensorRange | Alcance do sensor |
| rotorDamageMult | Dano dos rotores |
| rotorPeriodMult | Duração da volta dos rotores |
| rotorRange | Raio dos rotores |


#### Formato e validação do editor

- Cada registro tem `id`, `name`, `description`, `group`, `type`, `rarity`, `unlockLevel`, `tree`, `prerequisites`, `condition`, `effects`, `notes`, `accent`, `updatedAt`; protocolos também têm `robot`. `enabled` e `synergies` são opcionais. Cada efeito tem `id`, `attribute`, `operator`, `value`, `unit`.
- Validar lista com até256registros, incluindo os86canônicos. ID: letra inicial seguida de letras/dígitos/underscore/hífen, no máximo64caracteres; deve ser único. Nome não vazio e até120caracteres. Campos textuais obrigatórios até8000caracteres. `unlockLevel` inteiro1–999. `enabled` booleano. `updatedAt` string ou nulo.
- Cada registro aceita até32efeitos. Operadores aceitos: `+`, `−`, `×`, `÷`, `=`. Valor numérico finito com módulo≤10000; multiplicar/dividir exige valor>0. `unit` deve ser string vazia: texto de unidade não muda aritmética. IDs de efeito não podem se repetir dentro do registro.
- Todos os IDs canônicos devem continuar presentes; desativar porenabled=falseem vez de apagar. Em canônicos, tipo/chassi/condição são fixos. Nos especiais, nível e ausência de pré-requisitos também são fixos. Novos registros só podem serNormais, semchassi e semcondição programada, com ao menos um efeito direto suportado.
- Pré-requisitos devem serNormais existentes, únicos e ativos quando o módulo dependente está ativo. Rejeitar ciclos, referências ausentes e referências a tipo especial. IDs de sinergia organizam relações visuais e não criam um callback novo de combate.
- Raridade, nome do grupo, árvore, accent, notas e títulos organizam a interface; não prometem chance especial de sorteio nem scripts executáveis.

#### Aplicação e migrações

1. Rascunho do editor não altera a partida. Aplicar/exportar/importar exige validação. Uma tentativa captura snapshot congelado da configuração ao reset; mudanças posteriores valem apenas no próximo início.
2. Se os efeitos diretos de um canônico ainda são os defaults, executar seu callback original. Se foram editados, executar o callback para manter flags/gatilhos, restaurar os atributos diretos capturados e munição anterior, e então aplicar a lista de efeitos editados. Não apagar a condição especial sóporque o designer alterou a porcentagem.
3. Em auxiliares, aplicar apenas atributos de arma: damage,rate,magazineMult,reloadMult,projectileMult,projectileSpeed,projectileSize,projectileLife,spreadMult. Não multiplicar HP/velocidade/suportes novamente por cada arma.
4. Valores diretos editados ficam limitados a±1e9; HPmáximo mínimo1, HP entre1eHPmáximo; atributos positivos (excetoHP/HPmáximo/armadura) mínimo0,001. NaN deve voltar ao valor anterior. Este é limite técnico de edição, não declaração de equilíbrio.
5. Ao carregar config legada, acrescentar defaults introduzidos em revisões posteriores. SeIDde módulo personalizado antigo colide comIDcanônico novo, renomear para `custom-ID` com sufixo livre e redirecionar pré-requisitos/sinergias. A migração textual deve ser idempotente.
6. Revisão6 retira penalidades antigas de damage,rate,pierce e killAmmo, mas atualiza automaticamente sóregistros integralmente iguais ao default antigo. Preservar números/textos que o designer editou. O cabeçalho histórico do arquivo-fonte ainda contém defaults antigos; usar o catálogo final exportado, não copiar apenas as primeiras linhas de balance.js.

7. Revisão7 acrescenta reserveBank/shieldDrive/cleanCircuit/pulseRecovery. Preservar82registros anteriores e edições válidas; colisão com IDs novos em revisões1..6 exige renomear personalizado e redirecionar referências, inclusive condition vazia. O Banco/estágio nunca entram no perfil permanente. Pré-requisitos padrão múltiplos: shieldDrive exige Banco+Escudo; pulseRecovery exige Banco+Sensor.

### Divergências e limites desta extração

- A candidata local BUILD65 contém19relíquias/105entradas de compêndio/86editáveis, confirmadas por extração VM. BUILD64 publicada continha17/103/86. BUILD63 publicada continha16/102/86. BUILD62 publicada continha16/98/82. BUILD61 continha15/97. BUILD60 publicada possuía14/96e BUILD59possuía13/95; esses totais são históricos e não descrevem o inventário atual da Lâmina. Isso não prova commit, publicação, aprovação pública ou conclusão da meta.
- A receita Oficina Viva atual usa `range` no lugar de `coldReload`; descrição antiga de pulso glacial como componente obrigatório da receita deve ser corrigida. Continuam existindo as duas skills no catálogo; sóa recomendação mudou.
- O módulo original `knock` usa texto curto genérico, mas o efeito físico é+60px; recarga glacial tem raio140; explosão normal64; ganho de vida/movimento aplica multiplicadores ao estado atual, não soma ao inicial.
- Números acima foram conferidos em fonte e catálogo default isolado, sem carregar preferências reais do usuário. Se uma configuração personalizada for importada, gerar outra ficha com o snapshot dessa configuração e não misturá-la à baseline.
- Não executei matriz de partidas, avaliação humana, benchmark ou publicação nesta tarefa. Tabelas descrevem implementação e expectativas; não marcam qualquer gate de qualidade como aprovado. A disponibilidade de arquivos de teste não comprova que passaram no commit final.
- Arte, animação, mapa, agenda detalhada dos chefes e áudio precisam do restante da especificação do projeto. As receitas e fórmulas desta seção são suficientes para reproduzir o conteúdo numérico, mas não substituem os contratos de colisão, UI e assets.

#### Contagem de mortes e reposição

Depósito Ampliado usa um contador global de mortes válidas de não-chefe. A décima morte devolve1cartucho ao slot identificado na origem desse dano, limitado à capacidade; origem semslot recai no primário. Não transformar um reembolso em emissão nem em carga da Culatra. O protocolo chargeRecovery usa contador de seis alvos que realmente perderamHP por descarga e cooldown0,25s; também repõe somente um cartucho à origem. Célula de reparo a cada25mortes cura12quando coletada e não é dinheiro; Bateria de Sucata cura20automaticamente a cada20mortes e não deixa um item extra.

#### Lâmina de Recarga e fontes secundárias

A16ª peça universal captura P individual por slot somente em startReload válido após adquirir. Aquisição durante janela corrente não retroage. Reforja conserva exatamente reloadTotal/reloadTime/P da recarga corrente; novo multiplicador vale na próxima. Usar integral P×a×(0,6+0,3×(u0+u1)), a=min(dt,r), u0=clamp(1-r/T),u1=clamp(u0+a/T). Alvo presente na cápsula recebe somente trecho efetivamente segurado; rampa0,6P→1,2P, integral0,9PT na janela cheia. Geometria frontal36..110px/r12 da origem deslocada por arma é amostrada antes de movimento, sem varredura dos corpos em deslocamento. Fonte reloadBlade exclui killAmmo/salvage, preservando XP/loot/célula/boss e globais normais; não tratar essa fonte como o fallback semslot da regra geral de reposição acima. O contrato completo da Lâmina está incorporado integralmente ao documento mestre.


#### Reserva e manutenção na candidata63

Banco cria reserva20/40 e converte50% do excesso de cura; custo recarga×1,10. Ponte aplica cartuchos×1,20somente com escudo binário pronto. Circuito aplica+10% aos15s/+20% aos30s sem impacto aceito, zerando inclusive em absorção. Retorno de Varredura converte até3abates diretos/pulso em4reserva e−8s de escudo por crédito. Capacidade e HP são separados; dano que excede reserva atravessa ao HP, golpe absorvido pelo escudo binário não atravessa. Fórmulas completas, fontes, ordem e casos constam da ParteIII-C desta especificação. Aumento do pool requer nova avaliação natural; números não aprovados por balanceamento.


## Parte III-A — contrato completo da Matriz de Rebites


## Matriz de Rebites — candidata BUILD61

**Estado: validada funcionalmente na candidata de desenvolvimento.** Este documento registra o contrato e evidências locais; não é aprovação de equilíbrio final, desempenho real, canal público ou conclusão da versão1.0. A [meta de conclusão](META-DE-CONCLUSAO.md) continua aberta.

### Função no jogo e aquisição

A Matriz é uma peça temporária de baú de chefe. O jogador instala uma estação física no chão, direciona seus próprios tiros à entrada, acumula energia e recebe uma salva própria do aparelho. O tiro alimentador é consumido: a entidade não é um contador de acertos em inimigos, um drone que escolhe alvos nem um campo que apenas amplia uma bala.

A peça usa ID `rivetMatrix`, é elegível para todos os chassis/armas, só pode ser escolhida uma vez na tentativa e não integra o painel editável de 82 módulos. Não é comprada como atributo permanente. Adquirir não repõe vida, munição, recarga ou projéteis e não instala uma estação sem comando. Recusa, callback antigo e morte seguem o token de oferta das demais peças.

### Implantação manual

Com a peça adquirida e a partida em `playing`, o jogador mira e usa E ou o botão correspondente. O ponto de mundo é `aim+camera`; a distância entre ele e o centro do robô deve pertencer à faixa inclusiva 48–180 px, com tolerância numérica de 1e-7 px nas bordas. Exigir direção de mira válida e aparelho ausente. Vetor zero, tentativa sem peça, pausa, tecla repetida e ponto fora da faixa não instalam, não corrigem a posição e não escolhem inimigos.

No toque, o direcional direito fornece uma direção manual unitária; o ponto retido é 180 px à frente. O terceiro dedo pode acionar a Matriz enquanto movimento/mira permanecem ativos. Não exigir que o jogador abandone um dos dois pads para perder a direção. A disposição do botão não pode obstruir recarga ou propulsor. O cenário decorativo não introduz obstáculos físicos novos para esse posicionamento.

Limite: uma estação por vez. Durante sua vida não se pode movê-la nem instalar outra. Quando ela expira, uma implantação posterior captura referências novas; não reutiliza a energia antiga.

### Referência e orçamento energético

Ao implantar, capturar `P=clamp(shotDamage(arma primária)×N,0.001,1e9)`, onde `N=min(400,max(1,floor(pellets×projectileMult)))`. O dano normal de `shotDamage` inclui as conversões normais já presentes na build, como o componente de vida do Titânico quando elegível. P não recebe o crítico de um disparo futuro, Culatra, Carga de Reparo ou vulnerabilidade de um alvo. Não recalcular P depois por troca de atributos ou reforja.

- Limiar de descarga: `T=2P`.
- Capacidade: `Emax=4P`.
- Uma salva consome T uma vez.
- Orçamento balístico total da salva: `1,10T=2,2P`.
- Cada um dos três rebites: `2,2P/3` antes dos multiplicadores centrais por alvo.

A energia deriva exclusivamente das balas efetivamente absorvidas. Cada emissão que gasta cartucho compartilha um token entre seus pellets. O teto desse token é a soma do dano dos projéteis realmente emitidos, multiplicada por 1,35 para permitir o Colimador atravessado antes da entrada. Se apenas um pellet coube no teto de 400, o token não recebe orçamento dos pellets que não nasceram.

Cada bala só entrega seu próprio dano no instante válido de contato, limitado ao saldo do token; o acréscimo na estação é limitado à capacidade. A bala é consumida mesmo quando a energia já está cheia: o excedente é descartado e não fica guardado no token para devolver depois. O token não concede o orçamento inteiro por pellet. Crítico, Culatra e reparo já capturados na bala fazem parte do dano emitido; a conversão espacial só entra se geometricamente ocorrer antes da absorção. Não somar dano de explosão, fogo, eletricidade, corrosão, exposição ou efeitos dependentes de um alvo ao payload de alimentação.

Tiros automáticos mantidos são válidos por cada munição gasta. Uma rajada usa um token por subdisparo consumidor de cartucho. Todas as armas de um conjunto podem contribuir; o número de slots não multiplica energia de uma bala. Tokens devem ficar referenciados apenas por projéteis vivos, sem cadastro global que cresça durante o modo infinito.

#### Exemplos padrão sem módulos

Tabela de PROT com uma arma, sem crítico/reparo/Culatra/Colimador. P usa o dano nominal de todos os pellets do cartucho; acertos parciais na entrada contribuem menos. A tabela não promete que todos os pellets tocarão o aparelho.

| Arma | Dano/pellet | Pellets/cartucho | P | Limiar2P | Cap4P | Dano/rebite | Carregador / recarga cheia |
|---|---:|---:|---:|---:|---:|---:|---|
| Metralhadora | 22 | 1 | 22 | 44 | 88 | 16.1333 | 24 / 1.4s |
| Escopeta | 12 | 5 | 60 | 120 | 240 | 44 | 6 / 2.2s |
| Fuzil de rajada | 14 | 1 | 14 | 28 | 56 | 10.2667 | 30 / 1.8s |
| Canhão de precisão | 88 | 1 | 88 | 176 | 352 | 64.5333 | 3 / 2.6s |
| Emissor laser | 10 | 1 | 10 | 20 | 40 | 7.33333 | 60 / 1.6s |
| Lança-chamas | 5 | 3 | 15 | 30 | 60 | 11 | 80 / 2.4s |
| Lançador criogênico | 22 | 1 | 22 | 44 | 88 | 16.1333 | 12 / 2.4s |
| Lança-foguetes | 70 | 1 | 70 | 140 | 280 | 51.3333 | 1 / 4.8s |
| Lança-granadas | 45 | 1 | 45 | 90 | 180 | 33 | 4 / 3.6s |
| Carabina Tesla | 24 | 1 | 24 | 48 | 96 | 17.6 | 8 / 3s |
| Disco de retorno | 24 | 1 | 24 | 48 | 96 | 17.6 | 3 / 3.4s |
| Arpão pneumático | 60 | 1 | 60 | 120 | 240 | 44 | 2 / 2.4s |

O ganho de 110% é orçamento bruto da energia consumida numa salva completa, antes de erros de trajetória, expiração, capacidade, escudos e multiplicadores por alvo. Não é 110% de DPS adicional nem um multiplicador permanente dos tiros do jogador. A alimentação retira dano que poderia atingir diretamente os zumbis.

### Contato físico, tempo e prioridades

A entrada é circular, com raio de 14 px. Para testar uma bala de raio R, expandir esse círculo para 14+R. A entrada deve ser testada pelo segmento percorrido da bala e pelo tempo de contato; comparar apenas o endpoint não basta. O teste precisa respeitar a vida restante da bala e da estação. Um cruzamento geométrico que acontece depois de alguma expiração não alimenta. Expiração vence empate.

Início dentro e tangência contam como entrada; endpoint do segmento também conta quando as duas vidas ainda permitem o contato. Em empate de corpo e entrada, processar o corpo primeiro. O pipeline deve preservar o caminho legado quando a peça não está presente. Antes de processar os projéteis, ordenar cronologicamente apenas os espaços da lista que têm contato potencial válido com a entrada naquele passo. Predizer a velocidade de retorno do disco sem mutar o projétil; ordenar pelo parâmetro de entrada e manter ordem original em empate. Os demais projéteis conservam sua ordem relativa. Isso evita um cartucho lento iniciar uma salva no futuro e bloquear um cartucho rápido que chegaria antes. Não fazer essa ordenação sem dispositivo implantado. Um corpo que encerra ou ricocheteia a bala antes do aparelho impede alimentação no trecho não percorrido. Se houver perfuração legítima antes e a bala sobreviver até a entrada, o consumo posterior pode ocorrer, mas não repetir impactos. Uma bala absorvida termina sem chamar os ramos de impacto/explosão/status. Corpo posterior não recebe esse projétil. O disco ou ricochete não pode reapresentar um objeto já consumido.

O Colimador é uma conversão distinta: se a bala o atravessou antes da entrada, a energia pode refletir aquela multiplicação única; campo posterior não age num tiro que já foi ingerido. As três trajetórias da própria Matriz não são alimentadores e não recebem Colimador.

### Descarga, limites e fila

A estação fica 18 segundos de combate ativo e realiza no máximo três salvas. Uma salva usa a direção do último projétil absorvido e mantém essa direção durante os três ataques. Leque: −0,08/0/+0,08rad. Não procurar alvos nem retarget durante voo.

Os três rebites nascem em 0/0,6/1,2 s relativos ao início da descarga. Velocidade 520 px/s, alcance 260 px, raio 4; tempo nominal de voo 0,5 s. O início é agendado no instante físico do contato de alimentação; as emissões usam timestamps absolutos desse início. Projétil recém-criado só percorre o intervalo residual entre seu nascimento e o fim do passo, nunca o dt anterior. Um passo longo pode emitir as posições de salva vencidas dentro daquele intervalo, sempre respeitando expiração/capacidade, sem criar disparos de um período em que não havia salva. Não confundir isso com backlog após lotação. Durante descarga, tiros manuais passam pelo aparelho sem alimentar. O bloqueio usa o instante absoluto feedBlockedUntil, inicialmente inícioDaSalva+1,2s. Contatos anteriores a esse instante passam sem alimentar; contato exatamente no fim ou depois pode alimentar, inclusive quando fim e contato caem no mesmo tick. Cancelar por lotação encerra a janela no instante da emissão cancelada. Não bloquear o frame inteiro por ter começado ocupado.

Os rebites pertencem ao teto compartilhado de 400 projéteis. Se o teto está cheio antes de começar uma descarga, não gastar 2P nem criar uma fila de ataques. Se faltar vaga no meio da descarga, cancelar os tiros restantes daquela salva, sem reembolso, sem backlog e sem retirar projéteis vivos para abrir espaço. Expiração da estação vence uma emissão no mesmo instante. O contador salvos cresce ao INICIAR cada salva, incluindo uma que depois seja cancelada por lotação. Após três iniciadas, remover o dispositivo quando não existe salva ativa; não restaurar uma tentativa porque seus rebites restantes foram cancelados.

### Esquema de estado e ordem de atualização

Uma reconstrução pode usar outra organização interna, mas precisa preservar estes observáveis. Guardar na estação: posição fixa x/y, P, raio14, energia, instante absoluto de expiração (`implantação+18`), vida restante para apresentação, janela válida do passo, instante absoluto de fim do bloqueio de alimentação, número de salvas iniciadas, direção da última alimentação e salva ativa ou nula. A salva guarda direção/dano capturados, índice do próximo rebite e instante absoluto do próximo ataque. Cada rebite guarda nascimento, último instante avançado, posição, velocidade, dano, raio4 e vida0,5s.

1. Avançar o relógio somente em playing. Antes de atualizar a Matriz, guardar a vida que existia no começo do passo; ela determina a janela física de entrada. Usar feedBlockedUntil para comparar o instante de cada contato com o fim da descarga.
2. Atualizar a vida de apresentação pela expiração absoluta. Processar rebites programados que venceram até o relógio atual, sempre recusando evento no/depois da expiração. Se estava ociosa e havia energia/capacidade, iniciar no instante de início do passo; se a energia veio de um contato novo, usar o instante desse contato.
3. Emitir cartuchos manuais pela cadência normal. Cada emissão após adquirir a peça recebe um token compartilhado pelos pellets realmente criados; antes de adquirir, não acrescentar esse dado.
4. No movimento das balas manuais, procurar a entrada válida e processar os contatos anteriores pela ordem legada. Se sobreviver até a entrada, consumir a bala, atualizar token/energia/direção e, se possível, iniciar a descarga naquele instante. Alvos posteriores não recebem esse projétil.
5. Nos rebites da entidade, avançar somente `min(dt,agora−últimoAvanço)`, limitado à vida restante; usar colisão varrida e o primeiro contato de corpo. Não executar o pipeline manual de procs.
6. Remover projéteis encerrados e então remover a estação se vida≤0 ou se três salvas foram iniciadas e não há salva ativa. A remoção natural da estação não apaga rebites já emitidos; morte/garagem os removem.

Comparações numéricas da implementação candidata: faixa de posição tolera1e-7px; limiar energético e agenda absoluta usam tolerância1e-9; empates espaciais/TTL usam8×Number.EPSILON no parâmetro do segmento. Esses valores não autorizam contato após uma expiração real nem um ataque extra.

### Fontes de dano e recompensas

Rebites usam `source='matrix'` no caminho central de dano, e não `impact` da arma. Não aplicam crítico, exposição balística, queimadura, frio, corrosão, eletricidade, explosão, perfuração, ricochete, retorno ou procs manuais. Não alimentam a própria Matriz, a Culatra ou outra entidade.

Preservar as condições gerais do caminho central de dano explicitamente aplicáveis à fonte, incluindo escudo policial, marca do Predador, Caça-Titãs e finalização por vida baixa. Elas não alteram P armazenado. O escudo absorve o golpe inteiro, inclusive o de quebra; não transferir excedente nem instalar estados proibidos.

Abates normais concedem XP, sucata, contador de mortes e célula global de reparo na frequência usual; chefes mantêm cura, peça e baú pela regra geral. A fonte matrix não ativa Depósito Ampliado (`killAmmo`) nem Sucata (`salvage`). Não transformar a palavra “sem procs” em retirada de recompensas básicas nem em liberação de cadeias balísticas. A cura normal de derrota de chefe pode armar Carga de Reparo pela regra global de cura, e a morte pode liberar corrosão previamente instalada por outra fonte. Esses eventos gerais permanecem; o rebite não semeia estado novo nem chama impact. A proibição de procs não remove os contratos de recompensa e morte do jogo.

### Estados e limpeza

| Estado | Condição | Atualização | Saída |
|---|---|---|---|
| Sem peça | rivetMatrix não adquirida | Nenhuma entidade/token novo | Oferta legal |
| Pronta | Peça adquirida e nenhuma estação | Botão/tecla, espera direção válida | Implantação manual |
| Carregando | Estação viva, sem salva ativa | Absorve payload válido, capacidade 4P | Limiar 2P e vaga para ataque |
| Descarregando | Salva em execução | Três instantes e direção fixa; sem alimentação | Fim/cancelamento da salva |
| Pausada | Jogo fora de playing | Vida, energia e ataques congelados | Retomada explícita |
| Expirada | Vida esgotada ou limite de salvas | Remove estação; sem ataque atrasado | Peça permanece pronta para nova implantação |
| Morte/reset | Fim/reinício da tentativa | Limpa entidade e estado temporário conforme política de projéteis da tentativa | Nova tentativa sem relíquia |

Desenho, HUD, minimapa e painel de pausa só consultam estado. Não avançam vida, energia, disparos, posições ou RNG. Ao expirar normalmente, remover a estação e permitir nova implantação; rebites já emitidos completam sua própria vida restante. Morte e retorno à garagem removem também os rebites ativos; reset recria a tentativa sem peça/campo e limpa todas as balas. Morte e reset não podem manter captura de entrada ou comandos antigos. O perfil permanente não recebe a peça, seus números ou tokens.

### Apresentação e evidências

Estação compacta de chapa escura, entrada e bobina ciano, indicação local de carga/direção; sem círculo amplo que esconda inimigos. O marcador do minimapa é único e permanece identificável quando o aparelho está longe. Rebites precisam ser distinguíveis das balas da arma e das descargas hostis. O HUD mostra energia/limiar, salvas e tempo; o botão desktopusa E e o toque usa sua ação própria. O status de energia não anuncia mutações por frame em região aria-live.

#### Sons próprios da estação

Eventos usam o barramento de efeitos já existente, seus controles de volume/mute e o RNG de ruído próprio do áudio. Não sortear no RNG de combate. Limites mínimos entre cues iguais: implantação 0,25 s, alimentação 0,12 s, rebite 0,12 s, expiração 0,3 s.

- Implantação: ruído curto 0,055 s com ganho 0,025, somado a oscilador triangular 165→245 Hz durante 0,16 s, ganho 0,04.
- Alimentação efetiva: seno 510→620 Hz durante 0,045 s, ganho 0,022. Só emitir quando a energia realmente aumenta, não por tiro descartado em capacidade cheia.
- Rebite emitido: ruído 0,04 s/ganho 0,035 e triangular 390→150 Hz durante 0,085 s/ganho 0,05.
- Expiração natural: seno 190→85 Hz durante 0,18 s/ganho 0,03. Limpeza por morte não deve criar pilha tardia de sons de expiração.

A descrição e os casos da [especificação mestre](SCREWVIVORS-ESPECIFICACAO-E-TESTES.md) são critérios, não resultados. A candidata precisa comprovar geometria, TTL, orçamento por cartucho, doze armas, cap400, pause/reset, procs, controle e leitura real em 1280×900/844×390/740×360. Partidas naturais, desempenho real e celular físico são provas separadas e continuam pendentes até execução identificada.

### Validação da candidata

A fonte congelada 8ab6faf1792a01c05a7a38c4f14024ef64905f041db24588f3bed4f92de4deee passou na prova de transparência dos observadores e na matriz intermediária de dez receitas: todas sobreviveram1200s e derrotaram pelo menos três chefes, mas somente8/10 adquiriram as quatro skills centrais. Demolição e Lança não montaram o core e continuam falhas no denominador. Não chamar essa matriz de aprovada.

Experimento separado com preferência pela Matriz somente quando legalmente oferecida e ação manual de implantação passou4/4 (Tempestade/Escopeta×20261124/25), com aquisição, alimentação, salvas e acertos reais nos quatro casos. Não substitui as falhas canônicas nem as30tentativas finais. Depois do congelamento, uma correção de entrada permitiu E quando o foco fica no botão de pausa após escolher a peça; o piloto desse ensaio chama a ação diretamente e não exercita o atalho. A interface e as correções visuais posteriores têm testes de navegador separados.

A revisão temporal adicional reproduziu um P1: duas velocidades diferentes alimentavam em ordem de emissão, mudando a energia e o início da salva ao dividir o passo. A ordenação de candidatos por tempo de entrada corrigiu o caso; tests/matrix-time-order.cjs conserva a regressão e verifica que o término da terceira salva não absorve tiros posteriores. A matriz natural v3 anterior foi preservada como histórica e uma execução v4 foi iniciada após a correção. Não herdar aprovação de v3 para v4.

### Aparência e entrada verificadas

A base mede48×36px, em azul-noturno, com grampos de cobre; corpo34×26px e moldura de metal claro. Oito indicadores representam degraus de0,5P: quatro ciano até o limiar2P e quatro âmbar até o teto4P. A entrada brilha por0,1s após energia efetivamente recebida; um rebite emitido causa recuo visual de2px por0,08s. lastFeedAt/lastShotAt são gravados apenas nos eventos da simulação; desenho consulta clock, sem mudar estado ou consumir RNG. O minimapa usa marcador aliado quadrado e não aumenta a hitbox.

No teclado, E funciona mesmo quando o foco permanece no botão de pausa depois da escolha da peça; campos editáveis continuam protegidos. No toque, a liberação do próprio dedo dentro do botão executa a ação sem depender de click sintético de contato primário. Movimento e mira mantêm seus captures. Liberação fora do botão, cancelamento, blur e indisponibilidade não executam. Click touch/pen posterior é ignorado para não duplicar; teclado e mouse mantêm ativação normal. Uma ponte MouseEvent legada sem pointerType é suprimida por500ms somente após toque já tratado; ativação de teclado detail0 continua permitida.

O controle negativo de três dedos reproduziu na BUILD60 a falha de recarga e propulsor enquanto os dois pads ficavam pressionados: zero callbacks. A fonte atual chamou cada ação uma vez e os14cenários isolados passaram. Isso é correção de P1 de controle, não apenas adição cosmética da Matriz. As provas são em Chrome emulado; celular físico continua pendente.

### Evidência consolidada após a correção temporal

A execução v4 repetiu os dois braços com a fonte física atual:8/10viáveis no canônico e4/4no experimento de escolha legal+implantação. As falhas canônicas de Demolição e Lança por core incompleto permanecem. Os quatro casos experimentais tiveram aquisição, alimentação, salvas e acertos; isso prova uso natural sob aquela política, sem aprovar balanceamento universal. [Resumo](build61-balance-summary.json) e [arquivo integral](data/build61-runs.json.gz) preservam resultados, protocolos, fontes, pilotos, diferenças de instrumentação e provas de transparência. v1/v2 pararam em fixtures de observação sem rodar tentativas naturais; v3 é histórico anterior à correção de ordem dos contatos. Não contar esses ensaios como uma única matriz homogênea.

As verificações locais concluídas incluem22grupos de engine, cronologia entre cartuchos e término da terceira salva,14cenários de toque isolado, browser em1280×900/844×390/740×360, cues de áudio, escudos, Culatra, Colimador, armas/reforjas, equivalência legada32mundos/416checkpoints, partículas12mundos e simulação integrada25minutos. O browser confirma aquisição pela carta, E após foco em pausa, três dedos, alimentação real, ancoragem, pausa,3armas e avisos fora dos botões. São fixtures explícitas; não são celular físico nem métricas de FPS. As provas finais1.0 de30tentativas,60minutos e desempenho real continuam abertas.


## Parte III-B — contrato completo da Lâmina de Recarga


## Lâmina de Recarga — candidata BUILD62

**Estado: validada funcionalmente em engine/browser na candidata de desenvolvimento.** Não aprova balanceamento final, desempenho real, publicação ou conclusão1.0. Resultados BUILD61 continuam históricos; evidências62 e suas fontes exatas estão registradas ao final.

### Aquisição e ativação manual

LÂMINA DE RECARGA (`reloadBlade`) é a16ª peça universal temporária de baú, elegível para qualquer chassi/arma, sem repetição na tentativa. Editor permanece82; inventário98 artigos confirmado por extração VM do catálogo vivo. Não concede atributos permanentes, cura, munição ou recarga ao instalar. A recarga que já estava em curso na aquisição não ganha lâmina retroativamente. Somente o próximo `startReload` bem-sucedido com a peça captura o motor.

Durante uma recarga efetiva, manter intenção manual de disparo (`firing`) e mira ativa permite ataque frontal. Soltar o disparo ou perder a mira interrompe o dano imediatamente; voltar a segurar retoma somente o restante da recarga. Não escolhe alvos, não cria projéteis e não exige botão novo: mouse ou pad direito usam o mesmo disparo manual. R continua sendo recarga. Tentativa de recarregar carregador cheio, recarga já ativa ou entrada bloqueada não cria janela nova.

### Referência por arma e integração exata

Ao iniciar uma recarga válida, capturar `P=clamp(shotDamage(slot) × N,0,1e9)`, com `N=min(400,max(1,floor(pelletsDaArma × projectileMult)))`, os pellets planejados do cartucho. É a base normal de dano da arma naquele instante, incluindo conversões normais de shotDamage. Não incorporar crítico de um disparo específico, Culatra, Carga de Reparo, dano de outro slot ou vulnerabilidade de alvo. Alterações de atributos ou reforja posteriores não reescrevem P.

Sejam T a duração total da recarga atual, r o tempo restante antes do tick e dt o passo ativo em segundos. Integrar antes de decrementar o timer, dentro de `tickStatuses`, antes do movimento do jogador:

- `a=min(dt,r)`; não avançar além da conclusão.
- `u0=clamp(1-r/T,0,1)`; `u1=clamp(u0+a/T,0,1)`.
- Dano nominal por alvo na cápsula: `D=P × a × (0,6+0,3×(u0+u1))`.
- DPS instantâneo sobe linearmente de `0,6P` para `1,2P`; é taxa por segundo, não multiplicador de impacto.
- Segurando toda a janela e mantendo o alvo dentro, integral `0,9P×T`. Uma janela parcial recebe somente a integral do trecho segurado, sem recuperar tempo perdido.

Entradas não finitas, P≤0, r≤0, T≤0 ou dt≤0 devolvem dano0. O cálculo usa integral do intervalo, não amostra pontual por frame. Particionar o mesmo intervalo não altera o dano nominal em alvo estático, salvo tolerância de ponto flutuante. Dano central ainda aplica modificadores globais e escudo; por isso HP observado pode diferir da integral nominal.

Recarga parcial já tem duração proporcional à falta de cartuchos. Recarregar uma bala de cada vez não concede orçamento de carregador cheio: sem mudança de atributos, a soma de janelas completas com igual quantidade total reposta equivale à janela agregada pela soma de durações. Não há pulso gratuito ao iniciar ou terminar. Reforja durante a recarga conserva exatamente `reloadTotal` e `reloadTime`, inclusive no caminho legado de uma arma. Modificadores novos de duração valem apenas para a próxima recarga. A integral restante usa o T e o progresso reais já em curso, conservando P; não reinicia rampa, prazo ou referência de dano.

### Referência das12armas sem módulos

Baseline de PROT, uma arma, sem módulos/reforja e disparo normal. P não é o dano de um crítico nem Culatra. A duração é a recarga cheia da arma; parcial usa a fração ausente. Outros chassis e penalidades de2/3armas alteram shotDamage e portanto P; não copiar estes números para um arsenal diferente.

| Arma | Pellets planejados | P | T cheio (s) | DPS inicial→final | Integral nominal0,9PT |
|---|---:|---:|---:|---:|---:|
| Metralhadora | 1 | 22 | 1,4 | 13,2→26,4 | 27,72 |
| Escopeta | 5 | 60 | 2,2 | 36→72 | 118,8 |
| Fuzil de rajada | 1 | 14 | 1,8 | 8,4→16,8 | 22,68 |
| Canhão de precisão | 1 | 88 | 2,6 | 52,8→105,6 | 205,92 |
| Emissor laser | 1 | 10 | 1,6 | 6→12 | 14,4 |
| Lança-chamas | 3 | 15 | 2,4 | 9→18 | 32,4 |
| Lançador criogênico | 1 | 22 | 2,4 | 13,2→26,4 | 47,52 |
| Lança-foguetes | 1 | 70 | 4,8 | 42→84 | 302,4 |
| Lança-granadas | 1 | 45 | 3,6 | 27→54 | 145,8 |
| Carabina Tesla | 1 | 24 | 3 | 14,4→28,8 | 64,8 |
| Disco de retorno | 1 | 24 | 3,4 | 14,4→28,8 | 73,44 |
| Arpão pneumático | 1 | 60 | 2,4 | 36→72 | 129,6 |

### Geometria, ordem e slots

Cada arma equipada mantém sua própria captura P, timer e geometria. A lâmina é uma cápsula frontal: segmento de36 a110px a partir de `weaponOrigin(slot,angle)`, raio12px. A origem aplica o deslocamento lateral normal dos slots: uma arma0; com várias, índices0/1/2 usam−16/+16/+32px perpendicularmente à mira. O teste de contato soma o raio do inimigo ao raio12 e mede distância ao segmento. Direção é a mira manual do tick, sem homing ou prioridade de inimigo.

Múltiplas armas em recarga podem atingir o mesmo inimigo, cada uma pela própria base/duração. Uma arma pronta ou sem captura elegível não herda a recarga de outra. O tick usa posição anterior ao movimento; o desenho utiliza apenas a geometria armazenada pelo último tick elegível. Não recalcular dano, relógio ou geometria no render. Pausa congela a imagem; morte/reset eliminam estados temporários. Sem mapa crescente por inimigo ou fila de ticks atrasados. Geometria/render não sorteiam; dano central mantém seus efeitos cosméticos e sorteios existentes. O teste amostra os corpos no tick; não existe varredura contínua do movimento do jogador ou inimigos.

### Fonte, escudos e combinações

Aplicar fonte `reloadBlade` pelo dano central. Não chamar `impact`, não instalar fogo/frio/corrosão/eletricidade, não gerar explosão de bala, crítico, Motor Cinético, Fratura por impacto ou nova munição. Não consumir Carga de Reparo, não avançar contagem de disparos ou Culatra, não alimentar Matriz nem converter Colimador. Abate da lâmina não aciona `killAmmo` ou `salvage`.

Regras globais continuam: finalizador (`finisher`), Caça-Titãs (`bossHunter`), marca de alvo, XP/loot, contador global/célula de cura e recompensa/cura/peça/baú de chefe. Não reinterpretar esses efeitos como procs de bala. Escudo policial absorve o golpe completo, inclusive a quebra, sem excedente ao corpo e sem estados novos. O próximo tick desprotegido pode atingir o corpo; não dividir artificialmente um golpe para atravessar escudo.

### Apresentação e limites de aceite

HUD acrescenta `· LÂMINA` ao status da recarga por arma enquanto o corte está ativo. A pausa lista base capturada, corte ativo ou instrução de segurar disparo com mira, e segundos restantes; sem captura, mostra aguardando próxima recarga. Não acrescentar botão que concorra com pads, recarga, Matriz ou propulsor. O desenho é uma barra industrial no segmento armazenado: casco#101923, metal#4f6b7a, contorno#e8ddc9, dentes#c95f43 e núcleo ciano#3cc7f4 na primeira metade/#a8f1ff na segunda, ponta#e7fcff. Ele aparece após inimigos/chefe e Matriz, antes dos projéteis, efeitos e robô, sem ser usado como hitbox. áudio usa eventos próprios com RNG sonoro separado: `reloadBladeOn`, throttle0,2s, beep triangular125→250Hz/0,1s/ganho0,025; `reloadBladeHit`, throttle0,12s, hiss0,04s/ganho0,025 e beep triangular210→140Hz/0,045s/ganho0,025. Pausa e render repetido não acumulam som nem dano.

Esta é adaptação funcional de janela ofensiva/duração para as linhas Reload Boost e Cyclone Sword, sustentada pelas provas locais descritas abaixo. Não promete reprodução exata de coeficientes, entidades ou identidade externos. Katana (fim da recarga invoca arma) é motor diferente e permanece pendente; a lâmina desaparece ao terminar a recarga.

### Casos obrigatórios e evidências

Todos começam **não executados no commit final**. Capturar fontes/hash, ambiente, comando, saída, entradas e estado antes/depois; fixtures não são partidas naturais.

1. Captura:12armas, uma/duas/três armas legais, pellets planejados e Titânico/armadura; conferir P próprio e preservação após reforja/atributo. Comparar aquisição antes/durante/depois da recarga.
2. Integral: alvo imóvel de HP alto dentro da cápsula; comparar passo único,60Hz,20Hz e partições irregulares; erro absoluto≤1e−6 ou relativo≤1e−9. Verificar r<dt e r=0, início/meio/fim da rampa e orçamento0,9PT.
3. Parcial: um cartucho faltante versus carregador; repetir recargas pequenas sem dano de bala entre medições. Orçamento proporcional à duração, sem pulso por início/fim, recarga cheia recusada e nenhum ganho por reentrada.
4. Tempo: reforjar no meio da recarga single e multi; timers exatamente preservados, P imutável, novo modificador somente na próxima recarga. Último tick ataca antes de concluir; alvo fora do segmento não recebe dano.
5. Geometria: alvo no centro, extremidades36/110, tangência por raio, fora/atrás/lateral;12armas não alteram cápsula. Repetir com offsets dos3slots, mira esquerda/direita e jogador em movimento, conferindo ordem anterior ao deslocamento.
6. Fonte: alvo normal/chefe/marcado/resfriado e escudo em dano abaixo/igual/acima da proteção. Sem excedente, estados/procs/munição/salvage; globais de dano/morte e recompensa únicos continuam. Repetir com skills de bala e suportes simultâneos.
7. Entrada: mouse down/up, dois pads e terceiro dedo, cancel/lostcapture, blur, escolha, pausa, morte, reinício e rotação; nenhum fogo preso ou retomada automática. Sem peça não existe dano de lâmina.
8. Save/reset: adquirir, morrer, nova tentativa, migrar perfil/config; não serializar peça, referência P, geometria ou timer no progresso permanente. Editor82 permanece inalterado; catálogo vivo16/98 sem duplicatas.
9. Apresentação:1280×900,844×390,740×360,3slots e textos completos alcançáveis por rolagem; zero botão novo/obstrução. Render repetido e pausa conservam estado/RNG; som respeita mute/limites.
10. Longa duração/natural: contagens de estados temporários limitadas pelos slots; sem mapa crescente. Reexecutar avaliação afetada com fontes62 e guardar falhas; resultados61 (8/10 e4/4experimental) não aprovam o novo pool. Matriz final30tentativas, hardware físico e auditoria1.0 continuam pendentes.

### Evidências intermediárias62 e atribuição das fontes

Suítes de engine/browser validaram funcionalmente o motor; não aprovam equilíbrio final, qualidade humana, desempenho físico ou1.0. `tests/reload-blade.cjs` registrou12grupos sintéticos aprovados/0falhas em `outputs/reload-engine62/results.json`, fonte game.js `45ac996705344056724b6ec5c53d827b191b5b593cd0e2370058e66b8e7055b6`. Browser em `outputs/reload-browser62/result.json`: casos aprovados, sem erros ou mudança de fonte durante execução, em Chrome desktop e toque emulado, com proteção/ondas suspensas declaradas. A rodada final da regressão voltou a executar o navegador na fonte corrigida `45ac996705344056724b6ec5c53d827b191b5b593cd0e2370058e66b8e7055b6`, com hashes estáveis; rodadas anteriores foram registradas em5b0228…. Não é teste de celular físico nem partida natural.

A fonte atual inicializa `lastCue=clock−0,12`, valor finito. A anterior armazenava `−Infinity`; esse metadado violava o requisito numérico e as amostras naturais antigas não inspecionavam todos os campos. `outputs/reload-cue-finite62/result.json` comprova que a única diferença entre as fontes é essa expressão e que, após o primeiro contato e em seis passos incluindo soltar/retomar, pausa e conclusão, estado, dano, eventos sonoros e16sorteios seguintes são idênticos. É prova controlada dessa correção, não auditoria numérica global nem repetição natural da fonte atual.

O resumo versionável [build62-balance-summary.json](build62-balance-summary.json) e os dados [build62-runs.json.gz](data/build62-runs.json.gz) preservam14tentativas na fonte congelada `5b0228…`, anterior à correção finita, sem reinícios ou substituição de falhas:

- A, canônico:10receitas na semente20261107, **9/10viáveis**; Forja Criogênica não adquiriu `thermal`. Lâmina adquirida legalmente em5/10, com dano corporal observado em5/5aquisições.
- B, experimento separado de preferência legal pela Lâmina:4tentativas, **1/4viável**. Forja20261126 faltou `thermal`, Forja20261127 faltou `afterburn`, Oficina20261127 faltou `titan`. Lâmina adquirida4/4 e usada com dano corporal positivo4/4; isso não significa4/4viáveis.
- Todas as14sobreviveram1200s ativos e derrotaram≥3chefes. Sobrevivência/chefes não compensam falta das quatro melhorias centrais. Dano corporal observado não inclui absorção em escudos e não mede segundos exatos de contato ativo. Amostragem finita selecionada não aprova todos os metadados da fonte congelada.

Esses denominadores não formam30tentativas canônicas e não usam as três sementes finais do objetivo. Histórico61 (8/10 e experimento4/4) permanece separado. Gates finais G01/G03/G04/G11/G15, matriz30, longa duração, hardware real, auditoria e publicação continuam abertos.

A regressão final da candidata executou20comandos com saída0 e fontes estáveis, incluindo as suítes da Lâmina, armas, baús, Matriz, Culatra, Colimador, escudos, áudio, entrada, equivalências e integração25minutos. A primeira rodada foi preservada como histórica porque a correção de lastCue ocorreu durante um ensaio e o guard detectou alteração de fonte; a rodada coerente posterior usa45ac996…. Isso não executa todos os302casos finais nem aprova1.0.


## Parte III-C — reserva de proteção e manutenção


## Reserva e manutenção — candidata BUILD63

Estado em 13/11/2026: **implementação candidata, sem aprovação final e sem publicação da BUILD63**. A última publicação confirmada é BUILD62, commit `24eb4b6859bb3197a0c95fab9fe0fb96db8a5473`. A família está sendo integrada e verificada; os coeficientes abaixo são a hipótese autoral implementada para ensaio, não números de balanceamento aprovados. Os hashes da especificação mestre identificam a fonte extraída e precisam ser renovados após alterações.

A família resolve quatro vínculos distintos: proteção numérica separada de HP; benefício enquanto um escudo binário está intacto; ganho ofensivo mantido por tempo sem impactos; e abate direto de pulso convertido em proteção. Não confundir o Banco de Reserva com a habilidade antiga Reserva de Emergência: esta última concede proteção temporária após dano e conserva seu timer próprio.

### Catálogo e aquisição

São quatro módulos normais, adquiridos em ofertas legais durante a tentativa, uma vez por ID. Eles somam uma árvore de quatro nós: total56normais,86editáveis,16relíquias e102artigos de módulos/relíquias no compêndio. O painel não passa a editar relíquias ou reforjas. As dez receitas existentes não foram redefinidas para exigir a árvore.

| ID | Nome | Pré-requisitos padrão, todos obrigatórios | Efeito padrão | Custo ou condição |
|---|---|---|---|---|
| reserveBank | BANCO DE RESERVA | Nenhum | Proteção inicial20, capacidade40;50% do excesso de cura vira reserva | Recarga das armas×1,10; não repõe munição nem termina recarga ativa |
| shieldDrive | PONTE DE POTÊNCIA | reserveBank e shield | Cartuchos×1,20 enquanto o Escudo Capacitivo está pronto | Reserva sozinha não ativa; perder o escudo retira o fator para novas capturas |
| cleanCircuit | CIRCUITO PRESERVADO | reserveBank | Cartuchos+10% após15s e+20% após30s sem impactos aceitos | Máximo20%; impacto aceito, inclusive absorvido, zera a sequência |
| pulseRecovery | RETORNO DE VARREDURA | reserveBank e sensor | Abate direto do sensor:4de reserva e8s a menos de recarga do Escudo Capacitivo | Máximo3créditos/pulso; estados transmitidos não contam |

Os pré-requisitos múltiplos são reais, tanto no catálogo configurado quanto no fallback sem painel. Não basta ter somente o Banco para instalar Ponte ou Retorno no catálogo padrão. Configurações editadas continuam sujeitas ao validador e só entram na próxima tentativa. Condições canônicas permanecem internas; não importar código executável.

### Estado temporário e limites

Ao instalar o Banco, criar `reserveBank={value:20,max:40}`. Ao instalar Circuito, criar `cleanCircuitElapsed=0` e sua flag; não dar crédito pelo tempo anterior da tentativa. Os outros filhos habilitam suas flags. A capacidade40 não depende de vida máxima, Titânico, chassi, número de armas ou cura recebida. Não manter listas de abates ou referências a inimigos no Banco.

Todas as entradas de cura/reposição precisam ser finitas e positivas. A reserva deve permanecer no intervalo0..40. Não armazenar NaN, Infinity ou sentinelas infinitas, mesmo como metadado. Valores extremos do editor não autorizam crescimento sem limite.

Reposição, para valorV e quantidadeQ:

`ganho=min(40−V,Q)`; `novoV=V+ganho`.

A operação exige jogador vivo e Banco presente. Reserva cheia descarta o excedente; não converte a sobra em HP, munição, moedas ou novo evento de cura.

### Ordem do dano recebido

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

### Cura efetiva, excesso e callbacks

Para tentativa de cura positiva e finitaQ em jogador vivo:

- `curaHP=min(Q,maxHp−hp)`;
- `excesso=max(0,Q−curaHP)`;
- `ganhoBanco=min(40−V,excesso×0,5)`.

Curar HP primeiro; nunca retirar HP para alimentar Banco. `healPlayer` continua retornando somente a cura efetiva de HP. Apenas essa parcela ativa Carga de Reparo e Armadura de Reparo; reposição do Banco não chama healPlayer e não produz recursão.

HP95/100, Banco20, cura10: HP100, retorno5, Banco22,5. HPcheio, Banco39, cura10: retorno0, Banco40, sem especializações de cura. Jogador morto não recebe nenhum dos dois ganhos. Cura de chefe, célula coletada, reparo e outras fontes legítimas passam pela mesma regra; a fonte não ganha multiplicadores escondidos.

### Manutenção, dano e snapshots

`intacto=(shieldDrive adquirido && shield adquirido && shieldReady)`.

`fEscudo=intacto?1,20:1`.

`estágio=min(2,floor(cleanCircuitElapsed/15))`, somente se Circuito está adquirido; fora disso0.

`fCircuito=1+0,10×estágio`.

`cartucho=(danoLocal+conversãoTitânicoPermitida)×fEscudo×fCircuito`.

A conversão Titânico continua `min(0,75×danoLocal,0,03×maxHp)`, exigindo Titânico e Blindagem conforme seu contrato. O teto próprio dos novos fatores combinados é1,44×; isso não é uma promessa de DPS total. Nunca multiplicar slot.damage a cada tick para manter o bônus: calcular o fator a partir do estado atual evita acúmulo indevido.

Tempo do Circuito avança apenas em combate ativo, limitado30s. Pausa, ofertas, menu, garagem, morte e retrato não concedem tempo. A fase de relógios atualiza antes das emissões previstas no tick; impacto aceito posterior zera imediatamente o estado para capturas seguintes. Não alegar uma cronologia contínua subframe que não exista no runtime. Aos14,999/15/29,999/30s, os estágios esperados são0/1/1/2, respeitando tolerância numérica declarada.

As armas compartilham o estado defensivo do robô, mas usam dano local independente. Não multiplicar o ganho pelo número de slots. Balas já emitidas preservam o snapshot de dano; frio/fogo/corrosão derivados conservam suas regras de captura, sem reaplicar o fator novo na fonte secundária. Drones, sensores e rotores não passam a usar shotDamage por causa desses módulos.

Lâmina de Recarga captura a base ao iniciar uma recarga válida; Matriz de Rebites captura a base ao implantar. Esses snapshots podem incluir o fator vigente, pois já usam shotDamage. Quebrar escudo ou reiniciar Circuito depois não reescreve a entidade/recarga anterior. Crítico, Culatra e Colimador continuam aplicados nas fases documentadas, sem duplicação.

### Abates do sensor e proteção

Cada execução real de tickSensor inicia contador local0. Sócontar transição de alvo vivo para HP0 causada pela chamada direta `damageEnemy(...,'sensor')` desse pulso. Quebrar escudo de policial sem matar não conta; golpes absorvidos não transferem dano ao corpo. Alvo já morto é ignorado. Fogo transmitido, corrosão, explosão, raio, rotor, drone, Matriz ou Lâmina não são abates diretos desse pulso.

Após terminar o laço:

- `n=min(3,abatesDiretos)`;
- repor `4×n`de Banco, respeitando40;
- se Escudo Capacitivo existe e está descarregado, `timer=max(0,timer−8×n)`;
- se timer chega a0, marcar escudo pronto imediatamente para ações posteriores;
- escudo já pronto não acumula crédito para uso futuro.

O limite é de recompensa, não do dano ou número de alvos atingidos. Dez mortes diretas continuam sendo dez mortes/XP/loot normais, mas dão até12reserva/24s de antecipação. Chefe diretamente morto conta uma vez; seus lacaios removidos pelo fluxo de chefe não contam como mortes diretas do pulso. Baú/peça/cura continuam únicos. Cura legítima de chefe pode produzir excesso pelo mecanismo anterior e deve ser distinguida da parcela4×n na auditoria. Nenhuma reposição cria ataque, pulso ou sorteio novo.

### Interface, arte e áudio

A proposta do chat Dev designer distingue HPvermelho, Escudo Capacitivo ciano binário e Banco âmbar. O componente candidato fica no cartão do robô, com rótuloBANCO, número atual/máximo e trilha segmentada de4px; não somar a reserva à fração de HP. Cor proposta/implementada para Banco `#f0b85b`; fundo industrial azul-noturno e texto claro preservados.

O estado do Circuito mostra0/2,1/2ou2/2; Ponte mostra condição ativa/inativa. A pausa detalha capacidade, estágio, limite, origem da reposição e condição de perda, sem criar novo botão ou mudar os pads de toque. Ícones próprios dos quatro módulos usam placas, escudo/circuito e pulso; não representam reserva como coração ou vida permanente.

Absorção integral deve usar retorno âmbar e não o retorno laranja de perda de HP. Dano parcial pode sinalizar as duas parcelas. Os eventos reserveHit e reserveGain são próprios, suaves e limitados por frequência; não consomem RNG de combate. O evento de ganho pode ser único por pulso quando há reposição/restauração real; não gerar um som por inimigo. Mute e limite global de vozes continuam obrigatórios.

A versão visual candidata precisa de inspeção em1280×900,844×390e740×360, com1/2/3armas, chefe e timers ativos. Requisitos: nenhum transbordamento, números legíveis, HP/XP/escudo distinguíveis, painel sem esconder chefes/controles, pausa congelada e sem animação que avança sozinha. Animações adicionais sugeridas no parecer visual são propostas até existência e execução serem comprovadas; não tratá-las como entregues sóporque aparecem no desenho.

### Configuração e migração

Envelope `version:1,catalogRevision:7,skills:[...]`; perfil de equipamento continua versão2em chave separada. Novos IDs foram introduzidos na revisão7. Carregar revisões1..6 deve acrescentar os quatro defaults sem conceder módulos ao jogador. Se um ID customizado antigo colide, renomear para custom-IDcom sufixo livre e redirecionar referências de pré-requisito/sinergia, inclusive condição vazia. Migração repetida precisa ser idempotente. Os82registros anteriores devem conservar edições válidas; não apagar ou renomear arbitrariamente conteúdo do usuário.

Os números mecânicos condicionais20/40/50%/15s/30s/20%/4/8/3 são fixos desta implementação inicial, documentados em condition/handler; não há promessa de sliders individuais para eles. O custo direto×1,10da raiz é efeito editável. Editar seus efeitos preserva a criação da reserva, restaura os atributos diretos anteriores e aplica a lista editada conforme a API do painel. Auxiliares recebem sóos atributos de arma, sem triplicar capacidade ou condições do robô.

Morte/garagem limpam estado temporário; reset recria jogador e slots sem módulos, Banco ou estágios. Perfil e exportação permanente não armazenam reserva, manutenção ou fatores temporários. A configuração do painel descreve o módulo, mas não salva o estado corrente da tentativa.

### Casos obrigatórios de aceitação

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

### Evidência disponível e limites

A extração VMdefault confirma56normais/86editáveis/revisão7/16relíquias. O arquivo `outputs/maintenance-migration63/result.json` registrou10grupos de migração aprovados na fonte balance.js identificada por seu próprio hash. A bancada `outputs/maintenance-engine63/result.json` registra730assertions aritméticas isoladas; esse helper de referência não prova integração do combate. A inspeção numérica sintética guarda seu escopo em `outputs/finite-state63/result.json`; ela não aprova todos os estados possíveis ou o gateG01.

A revisão de contrato e o parecer Dev designer foram propostas/revisões, não partidas, aprovação humana de qualidade ou testes de celular físico. A bancada integrada `outputs/maintenance-gameplay63/result.json` registrou24grupos aprovados, zero falhas e nenhuma mudança entre os hashes de início/fim da fonte avaliada. O navegador controlado `outputs/maintenance-browser63/result.json` registrou aprovação em1280×900,844×390e740×360, com reserva/HP/escudo, contenção do cartão, chefe sem sobreposição, pausa e reset. Esses fixtures usam preparação artificial e não provam toque simultâneo específico desta árvore, sobrevivência natural ou desempenho. Resultados devem sempre ser confrontados com seus hashes antes de reutilização. A regressão da candidata registrou30comandos aprovados sem mudanças de runtime; pacote extraído, matriz final30, estabilidade60min e desempenho realPC/telefone continuam verificações distintas.

A família não resolve outras pendências do mapa, como entidade ao fim de recarga, carga manual, gatilhos elementais específicos ou transformações temporais. Não declarar todos os motores integrados nem excluir requisitos por dificuldade.

### Avaliação natural intermediária concluída

[Resumo estruturado](build63-balance-summary.json) e [arquivo de evidências](data/build63-runs.json.gz) preservam14tentativas, fontes congeladas, protocolo anterior aos resultados, logs e diferença do piloto experimental.

| Braço | Preparação/política | Resultado estrito | Limite da evidência |
|---|---|---|---|
| A | Dez receitas canônicas, seed6301301, piloto13sem alteração |10/10viáveis; todas1200s, pelo menos3chefes e4núcleos | Nenhuma adquiriu os módulos novos; avalia o pool novo, não uso natural da reserva |
| B | Forja/Oficina, seeds6301321/6301322; prioridade apenas entre quatro módulos novos legalmente oferecidos |2/4viáveis; todas sobrevivem1200s e derrotam7chefes | Banco adquirido4/4, Circuito1/4; Ponte/Retorno não adquiridos; sem contador de consumo/restauração |

As falhas B foram Forja6301321semthermal e Oficina6301321semrepair. Não foram apagadas nem substituídas. Preferir módulos novos não garante núcleo da receita nem prova que eles causaram a falha. Não comparar causalmente essas sementes com outras versões.

Runtime, catálogo, receitas e piloto congelados são os desta candidata. O arquivo completo tests/combat.cjs mudou somente nas contagens antigas das assertions; o prefixo efetivamente usado como harness é idêntico byte a byte. O bootstrap do primeiro coordenador falhou antes de iniciar partidas por um argumento de console incorreto; o erro foi preservado e a execução nova manteve sementes/política.

O arquivo [QA controlado](data/build63-qa.json.gz) reúne regressão, migração, fixtures de engine/áudio, scanner numérico e capturas. Estes resultados não são a matriz final de30, desempenho real, telefone físico ou aprovação integralG01.


## Parte III-D — Pistão de Retorno ao concluir recarga


## Pistão de Retorno — candidata BUILD64

Estado: implementação candidata, ainda sem publicação64confirmada nesta revisão. A publicação anterior é BUILD63, commit210e30b4a08575d28d81a3304c419f7f02f7df2a. Valores são hipótese autoral experimental. Esta peça adapta o motor de arma/entidade invocada ao terminar a recarga, que não estava atendido pela Lâmina durante a recarga. Não copia nome, arte ou coeficientes da referência.

### Aquisição e inventário

`reloadPiston`, PISTÃO DE RETORNO, é uma peça rara universal dos baús físicos de chefe. Oferecer somente quando ainda não adquirida, junto da política vigente de alternativas de hardware e universais. A escolha é pausada, valida versão da oferta e elegibilidade, pode ser recusada e não aceita callback antigo. Instalar apenas registra a peça temporária: não invoca, não altera HP, munição ou timer em andamento e não captura retroativamente uma recarga já iniciada.

Inventário64:17relíquias/103artigos no compêndio. Catálogo editável continua86, revisão7;56módulos normais. Esta peça não integra os sliders do painel nem exige migração nova. Perfil permanente conserva recursos/equipamento e nunca guarda a peça, entidade, contatos ou captura.

### Gatilho e estados por arma

Cada espaço possui, no máximo, uma captura pendente `reloadPistonCharge` e uma entidade ativa `reloadPiston`. Sem a peça não criar esses campos. Armas auxiliares não compartilham captura, posição, contatos ou relógio.

1. `startReload` precisa de partida ativa, arma sem recarga e munição abaixo da capacidade. Repetição deR ou carregador cheio não cria/renova nada.
2. No início válido, depois de registrar falta/capacidade/tempo, capturar a referênciaP abaixo. Uma entidade anterior pode continuar viajando enquanto a próxima recarga acontece.
3. A recarga parcial mantém a duração proporcional já existente. Até terminar, não criar entidade nova.
4. Na conclusão, repor munição e executar os efeitos existentes de cura/frio; então consumir a captura uma única vez.
5. Invocar somente com captura positiva finita, fração reposta positiva, peça presente, partida ativa e mira manual ativa com vetor finito não nulo. Não exige segurar disparo. Sem direção válida, descartar a captura; não guardar emissão para uma mira futura nem procurar inimigos.
6. Nova invocação substitui a entidade anterior daquele espaço. Não manter fila nem compensar dano perdido.
7. Depois de lançada, a entidade segue autonomamente a direção fixa. Soltar disparo, cancelar toque ou mover a mira não a redireciona/cancela. Pausa/ofertas congelam; morte/garagem limpam; reset recria slots sem captura/peça/entidade.

### Fórmulas e exemplos

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

### Geometria, vida e colisão

A direção é o vetor normalizado entre o jogador e a posição mundial da mira na fase da conclusão. A origem usa `weaponOrigin(slot,angle)`, incluindo offsets perpendiculares atuais0/−16/+16/+32dos espaços aplicáveis; o centro inicial fica24px adiante.

A entidade avança em linha reta a360px/s, por no máximo0,6s ativos:216px de viagem a partir da sua origem inicial. Raio mecânico10px, somado ao raio do alvo. A arte não aumenta essa hitbox. Não segue alvo nem retorna fisicamente ao jogador.

A cada avanço, limitar o trecho à vida restante e calcular a primeira entrada do segmento no círculo de cada alvo vivo ainda não atingido. Ordenar pelo parâmetro de entrada; empate preserva a ordem original de `targets()`. Esse conjunto inclui chefe vivo. O primeiro contato pode ser0quando a entidade nasce sobre um corpo.

Processar até3contatos. Registrar cada corpo noSetantes do dano e diminuir o saldo mesmo quando o escudo absorve. Se algum efeito central matar/remover outro alvo já listado, pular esse morto sem novo contato. Escudo de policial absorve todo o golpe de quebra; o mesmo pistão não atinge o corpo depois, porque esse alvo já está marcado.

Contatos exatamente no instante final de vida perdem o empate para expiração. O helper geométrico admite sua tolerância de8EPSno parâmetro; a comparação final exige entrada<1−8EPSquando o trecho termina junto com a vida. Após0,6s ou terceiro contato, apagar a entidade. OSetguarda no máximo3referências; não há histórico global, backlog, reembolso ou crescimento de filas.

Pistões não usam a lista das400balas. São suportes separados com teto próprio de1por espaço: no máximo3ativos e3capturas pendentes no arsenal máximo. Eles não são consumidos pela Matriz nem recebem Colimador. Atingir400balas não cancela uma invocação válida, e invocar não remove balas para criar vaga.

### Ordem discreta e tempo residual

O loop integrado atual amostra estados/recargas antes de deslocar o jogador e sincronizar câmera/mira daquele quadro. O Pistão segue essa fase. Não alegar interpolação contínua da posição do jogador no instante subframe da conclusão.

Para um passo de duração dt e recarga restanteR:

1. Avançar a entidade antiga por `min(dt,R)`.
2. Avançar Lâmina/recarga e, se terminar, executar a conclusão e possível substituição.
3. Avançar a entidade resultante somente por `max(0,dt−min(dt,R))`.
4. Se não havia recarga, avançar a entidade por todo dt.

Assim uma recarga que termina0,02s dentro de um passo0,05s dá apenas0,03s de idade ao pistão novo. Se não houver mira válida e não ocorrer substituição, o antigo continua pelo restante. Cada trecho também é limitado pela vida da entidade. No navegador dt é limitado a0,04s; o piloto natural usa0,05s.

**Observação conhecida P2, revisão estática:** em movimento rápido/dash no quadro da conclusão, a origem visual pode ficar defasada do robô já desenhado depois do deslocamento. Reprodução: recarga termina dentro do quadro, mover e comparar origem amostrada com posição após movimento/câmera. Impacto: diferença de até um passo de movimento, sem perda de progresso ou controle. Situação: ordem pré-movimento explicitamente mantida e testada; não foi implementada interpolação contínua nem se declarou correção desse deslocamento. A revisão não encontrou P0/P1 por inspeção, mas não executou testes. O Dev executou o caso integrado e os demais ensaios abaixo.

### Fonte de dano e limites de propagação

O contato chama dano central com fonte exata`reloadPiston` e origem do espaço emissor. Multiplicadores globais de alvo, Caça-Titãs, Finalizador e marca do predador continuam nas fases já existentes; não capturá-los novamente como se fossem parte deP. Exposição do sensor continua somente para`bullet`.

Não chamar`impact`: sem queimadura, frio, corrosão, eletricidade, explosão, crítico, empurrão, ricochete, perfuração adicional, alimentação de Matriz ou carga de munição por contato. Não incrementar contadores de killAmmo/salvage.

Manter XP, sucata, contagem geral, célula de reparo por25abates, baú/peça/cura de chefe e regras globais de morte únicas. Uma carga corrosiva já aplicada em um alvo pode liberar sua propagação normal quando ele morre; isso é efeito pré-existente, não aplicação de corrosão pelo pistão. Lacaios removidos pela morte do chefe não viram contatos extras.

### Apresentação e áudio

Silhueta original: carcaça curta de aço, aro cobre, haste e cabeça quadrada de prensa; sem dentes, ponta ou rastro longo. É uma ferramenta industrial arremessada, diferente da Lâmina fixa durante recarga e do anel de escudo. O ícone próprio fica em`assets/skills/reloadPiston.svg`.

Nos primeiros90ms ativos, a cabeça estende3px e seu sinal âmbar transita para metal claro. O render lê posição/vida, sem mudar relógios, dano ou RNG. Pausa conserva pose e pixels depois do primeiro quadro da apresentação pausada. A mira pode desaparecer na transição para pausa; comparar dois quadros já pausados.

As trilhas de recarga existentes, por espaço, mostram marcas âmbar quando há captura naquela recarga (`charging`) e ficam âmbar enquanto a entidade existe (`emitted`). O nome da arma, munição e avisos de Culatra/Lâmina continuam legíveis. Não criar nova linha, painel ou botão. O rótulo acessível identifica preparação/emissão. Pausa mostra captura/entidade, dano, vida e contatos restantes por espaço.

Eventos próprios: `pistonLaunch` na invocação real, throttle0,15s, tom triangular155→310Hz/0,1s e ruído curto; `pistonHit` somente com perda efetiva de HP/escudo, throttle0,12s, tom260→100Hz/0,06s. No máximo um cue de contato por avanço, além do limite global24vozes. Sem RNGdecombate; mute, gesto inicial e volumes existentes permanecem. Nenhum som de invocação em recarga recusada, aquisição intermediária ou mira inválida.

### Casos de aceitação

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

### Evidência e pendências

`tests/reload-piston.cjs` registrou17grupos aprovados, incluindo reembolso e ordem do tick integrado; `tests/reload-piston-browser.cjs` passou nas3resoluções, escolha legal, Rreal,12modelos,3slots, screenshots pausados idênticos, terceiro dedo, retrato, morte e reset. Preparação inclui proteção, ondas suspensas, tempo manual e alinhamento artificial dos timers no caso de3dedos; não é partida natural, FPS ou aparelho físico. O primeiro erro de comparação de pixels era captura do último quadro ativo versus primeiro pausado; diagnóstico e imagens foram preservados.

O teste existente de baús detectou inicialmente classificação incorreta da peça nova como específica: havia duas alternativas universais numa oferta que devia conter uma. A classificação da peça foi corrigida na produção e o mesmo teste passou, sem enfraquecer a assertion.

Avaliação natural intermediária e regressão global devem ser lidas nos relatórios com hashes próprios. Matriz final30, estabilidade60min, desempenho real, celular físico e demais motores compatíveis continuam abertos. Este sistema não substitui a Lâmina durante recarga nem encerra o mapa de integração.

### Resultado natural intermediário64

[Resumo por tentativa](build64-balance-summary.json) e [arquivo bruto completo](data/build64-runs.json.gz) preservam protocolo, sementes, fontes congeladas, runner canônico, diferença de uma linha do experimento, decisões, dano por fonte e logs.

| Braço | Configuração fixada antes de resultados | Viabilidade estrita | Aquisição/uso do Pistão |
|---|---|---|---|
| A |10receitas canônicas, seed6401301, piloto13sem alteração |10/10 |2/10adquiriram; ambas causaram dano efetivo ao corpo |
| B |Forja/Oficina × seeds6401321/6401322; prefere Pistão apenas se oferecido legalmente |4/4 |4/4adquiriram e causaram dano efetivo ao corpo |

Todas as14sobreviveram1200s, derrotaram pelo menos3chefes e obtiveram os4núcleos. Esses números não são14partidas canônicas nem a matriz final30. Não houve equipamento extra além de desbloqueio, poder/cura/imunidade artificial, oferta forçada, mudança de piloto, morte de chefe por comando ou descarte de vivos.

Dano efetivo do Pistão no braçoB: Forja6401321=1117,80; Forja6401322=1219,05; Oficina6401321=6095,11; Oficina6401322=13051,61. São totais de1200s, nãoDPS, pico ou ganho causal comparado à mesma build sem peça. O observador existente não conta absorção por escudo nem registra o total de invocações/duração ativa, e a verificação numérica natural amostra somente alguns campos. Nenhum gateG01integral ou desempenho foi aprovado por isso.

Os hashes de runtime, receitas e piloto não mudaram durante a matriz. O resumo gerado pelo coordenador manteve por engano o campo numérico build=62copiado de um script antigo; ele foi corrigido para64com errata explícita em metadataCorrections. Arquivos, versão congelada, resultados e simulação sempre foram64. Nenhuma partida foi repetida ou descartada por essa correção de metadado.

### Regressão e revisão da candidata

A verificação consolidada em outputs/release64-final-verification/manifest.json contém33comandos aprovados com hashes de runtime constantes. A execução inicial ficou retida em outputs/release64-regression/manifest.json: a assertion antiga da Lâmina ainda esperava16peças; foi atualizada para17e reexecutada, mantendo os testes de comportamento. Os verificadores estrutural/de release foram repetidos após concluir os textos, sem mudar física. A revisão estática do chat Revisor do projeto e o parecer do Dev designer não são execuções de teste e estão preservados no arquivo QA.

[Arquivo QA controlado](data/build64-qa.json.gz) reúne fixtures, regressão, capturas, diagnóstico da pausa, revisão estática, parecer visual e recursos para reproduzir a geração da especificação. O pacote extraído e a publicação precisam de registros próprios; este parágrafo não os presume aprovados.


## Parte III-E — Conversões Vitais e fase terminal


## Conversões Vitais — candidata BUILD65

Estado: desenvolvimento experimental, ainda sem publicação65confirmada nesta revisão. Base anterior publicada64:ed7834ce8d742a1499e9740804d00269ac852daa. Duas peças originais atendem motores diferentes: vida atual ligada à potência real de um suporte; e último cartucho convertido em pulso por vida máxima. Nenhuma delas custa vida, concede atributo permanente, troca arma ou cria vitória cronometrada.

### Inventário e aquisição

| ID | Nome | Elegibilidade padrão | Categoria |
|---|---|---|---|
| vitalLink | ACOPLAMENTO VITAL |droneCount()>0, incluindo drone nativo ENXA |Peça rara específica para suporte |
| integrityPulse | PULSO DE INTEGRIDADE |Universal |Peça rara universal |

Ambas vêm dos baús físicos, sem duplicação na tentativa. Ofertas mantêm até2opções específicas e uma alternativa universal; `integrityPulse` pertence explicitamente à lista universal. A escolha pausa, valida versão/elegibilidade e pode ser recusada. Instalar não altera HP, munição, timers em andamento ou perfil. Efeitos valem somente na tentativa; reset limpa as peças.

Catálogo65:19peças raras e105artigos de módulos/relíquias; painel86editáveis/56normais/revisão7/25atributos permanece. Não chamar essas peças de novas entradas editáveis nem mudar a migração sem necessidade.

### Acoplamento Vital: vida atual para dano dos drones

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

### Pulso de Integridade: último cartucho para ataque de área

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

### Fonte própria, procs e sinergias globais de morte

“Sem procs balísticos” significa não chamar o pipeline`impact`para o pulso. Ele não aplica queimadura, frio, corrosão inicial, descarga, crítico, empurrão, ricochete, fragmentação, Colimador ou alimentação de Matriz. Exposição de sensor continua sópara fonte`bullet`. Não incrementar contadores killAmmo/salvage do pulso.

Preservar multiplicadores centrais por alvo, Caça-Titãs, Finalizador, marca do predador, XP, sucata, contagem geral, célula a cada25abates e recompensa/cura/peça/baú únicos de chefe.

A morte de uma unidade com **carga corrosiva anterior** ainda pode liberar Respingo Reagente. Essa regra global já está no contrato de corrosão e também vale para Pistão/outros canais. O pulso não semeia a carga nem muda seu dano: uma captura anterior80libera até2filhos de40, comspread=false, independentemente de o pulso ter dano200. Os filhos não propagam outra geração. Lacaios removidos pela morte do chefe não viram abates independentes.

A revisão estática inicialmente interpretou a expressão abreviada “sem procs” como proibição de qualquer gancho de morte e apontou umP1condicional. Após confrontar o contrato vigente e os testes de captura anterior/geração, o revisor retirou esse achado e preservou o histórico. Não foi feita uma supressão de sinergia nem reclassificação de defeito grave para alcançar aceite. A distinção correta é impacto balístico versus morte global de estado preexistente.

### Correções independentes: drones e coleta no quadro da morte

Foi reproduzido umP1real da base64: uma colisão comum podia matar o jogador na fase de inimigos e, depois, `tickDrones` ainda atacava no mesmo tick. O caso controlado terminava comHP0/estadoover, mas1abate e1núcleo produzidos. Não dependia de nenhuma peça nova.

A candidata adiciona guarda no início de tickDrones: retornar se state não éplaying ouHP≤0. Assim nenhuma seleção, timer, dano, som, abate ou recompensa de drone acontece após essa morte ou em pausa/ofertas. Sensor/rotores já tinham suas próprias guardas. Não conceder imunidade ao avanço.

Uma segunda reprodução mostrou que o empurrão fatal de48pxpodia colocar o robô sobre XP/sucata e a fase de coleta ainda aumentavaXP/parafusos após state=over. A candidata agora executa atração/coleta/gravação de loot somente enquanto state éplaying. Não desfaz recursos coletados em vida; apenas impede novas coletas depois da morte. O caso também falha na fonte64publicada e passa depois da guarda, preservando os dois resultados. A finalização visual do quadro continua, com limpeza de buffers de efeitos, sem deixar streams temporários abertos.

O teste `drone-death-phase.cjs` reproduz o loop integrado real, não apenas uma chamada isolada posterior. A fonte publicada64foi extraída do Git para comparação e mostrou o defeito. Seus textos normalizados somente em CRLF→LFconferem com a física congelada64; hashes brutos diferem por terminação de linha. Falha antes, fonte64e resultado após estão no arquivoQA.

A equivalência dos32mundos legados de feedback passou sem normalizar essa correção na referência; aqueles cenários não cobrem a morte nativa de drone no mesmo quadro. O caso dedicado prova a diferença intencional. Não alegar preservação integral do defeito antigo nem de todos os caminhos possíveis por uma equivalência parcial.

### Visual, HUD e áudio

Ícones originais`vitalLink.svg`e`integrityPulse.svg`usam hardware, placas, cartucho e sinais angulares; não cruz de cura, coração ou aura de escudo. Os drones acoplados recebem detalhe de placa clara e até3pequenos LEDsâmbar por faixa de HPatual/HPmáxima. O indicador não consome vida nem altera contagem/órbita/cadência. O parecer do Dev designer sugeriu violeta como alternativa; não afirmar essa paleta como implementada.

O Pulso usa8segmentos radiais claros, centro transparente e visual de0,25s no array existente de efeitos, limitado a150. A arte se expande enquanto desvanece, mas todo dano já foi aplicado no evento. Não criar uma segunda área de dano ou aura persistente. Pausa congela o relógio/pose/efeito.

O cartucho1de cada espaço recebe sublinhadoâmbar quando a peça está instalada e não há recarga. Não criar linha, painel ou botão. Preservar numeração, avisos de Culatra/Lâmina e marcas do Pistão. Tooltip descreve a prontidão; pausa mostra dano do pulso/divisor, HPatual e parcela dos drones.

Um teste de computedStyle encontrou o sublinhado suprimido por uma regra antiga globalbox-shadow:none!important. O seletor específico foi corrigido com!importante o mesmo teste de cor passou nas3resoluções; os resultados anteriores foram preservados.

Acoplamento mantém o cue de drone existente, sem duplicar som de reparo ou criar voz por leitura de HP. Pulso tem evento`integrityPulse`, throttle0,2s: dois tons suaves180→85Hz/0,18s e540→270Hz/0,12s. Umcue por cartucho real, não por alvo ou pellet; limite global24vozes, mute/volumes e RNGdecombate independentes.

### Casos de aceitação

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

### Evidência disponível

[Arquivo de QA controlado](data/build65-qa.json.gz) preserva47arquivos, com caminho, bytes, hashSHA256e conteúdo recuperável, incluindo manifestações da regressão37e complementos, reproduções negativas na base64, resultados atuais, capturas, fontes dos novos testes, pareceres estáticos e gerador da especificação. A descompressão e os hashes restaurados foram conferidos. Não inclui as partidas naturais, preservadas nos arquivos próprios abaixo, nem constitui aprovação final1.0.

`vital-conversions.cjs`registrou22grupos aprovados; `drone-death-phase.cjs`passou após reproduzir a falha na base64e na candidata antes da guarda. Um erro inicial de fixture do arco ignorava o custo antigo de droneArc; a expectativa passou a usar a base já modificada antes do ataque, sem mudar a produção.

O navegador controlado passou em1280×900/844×390/740×360: escolhas legais, dano real do drone dependente deHPsem custo, último cartucho por mouse,12modelos,3espaços, cor computada da prontidão, pixels pausados iguais, terceiro dedo/retrato/morte/reset e catálogo19/105. Tem proteção, ondas suspensas e tempo manual: não é partida natural, desempenho ou aparelho físico. Áudio de eventos reais e sinal/mute/vozes têm testes separados.

As revisões de chats são estáticas/visuais propostas, sem execução atribuída a elas. O parecer de design foi corrigido para explicitar que não há consumo deHP: esse custo não existe no contrato ou código. A limitaçãoP2de posição do Pistão64permanece documentada, não resolvida por estas peças.

### Avaliação natural homogênea da fonte corrigida

[Resumo atual](build65-balance-summary.json), [arquivo bruto atual](data/build65-runs.json.gz) e [atividade após aquisição](build65-vital-usage.json) guardam protocolo, fontes congeladas, piloto13, decisões e dano por fonte. As sementes foram fixadas antes de resultados e são distintas das3sementes finais reservadas.

| Braço | Preparação/política | Viabilidade estrita | Presença das peças |
|---|---|---|---|
| A |10receitas canônicas, seed6501301, runner/piloto sem alteração |10/10 |7tentativas adquiriramAcoplamento;1adquiriuPulso |
| B |Enxame/Oficina × seeds6501321/6501322; prefere sóa peça-alvo se oferecida legalmente |4/4 |Acoplamento nas2/2Enxame; Pulso em1/2Oficina; a mesma Oficina também adquiriuAcoplamento |

Todas as14sobreviveram1200s, derrotaram pelo menos3chefes e adquiriram os4núcleos. O casoOficina6501321não adquiriu a peça-alvo e permanece no relatório. Nenhuma oferta, HP, cura, invulnerabilidade, morte de chefe ou remoção de vivos foi forçada. Equipamento necessário foi apenas pré-desbloqueado.

No braçoA o Pulso causou196de dano efetivo ao corpo; noB,339,02. Totais não sãoDPSnem diferença causal de uma buildcontrole. Há12aquisições de peças entre os braços e, em cada uma, minutos completos posteriores com atividade positiva da fonte correspondente e HPmínima positiva. O dano dos drones nesses minutos é o total do canal, não apenas a parcela incremental deHP. A fórmula específica tem provas controladas separadas; não atribuir todo dano dos drones à peça.

A primeira rodada foi concluída antes da correção da coleta terminal e foi preservada separadamente em [resumo histórico](build65-pre-loot-fix-balance-summary.json) e [brutos históricos](data/build65-pre-loot-fix-runs.json.gz). Depois da correção, as mesmas14foram repetidas num protocolo novo, sem trocar sementes/piloto/receitas. [Comparação pareada](build65-recheck-equivalence.json) confirmou objetos completos de tentativa idênticos nas14, coerente com todas terem sobrevivido e não alcançarem o ramo de morte. Não são28sucessos independentes. As reproduções negativas dedicadas comprovam a mudança pretendida quando ocorre morte.

Limites: progressoVM/headless não prova experiência humana, apresentação em aparelho físico ou FPS. O observador numérico natural é amostral e não aprovaG01total. Matriz final30, estabilidade60min, desempenho realPC/celular e outros motores compatíveis continuam abertos.


## Parte IV — especificação visual complementar


## Especificação de reconstrução visual e interface

Este fragmento descreve a candidata local 60 de Screwvivors, sem declará-la publicada ou aprovada. A intenção é permitir uma recriação visual equivalente, reconhecível e funcional; não uma cópia pixel a pixel dos arquivos originais. As medidas abaixo são pixels CSS, salvo indicação de coordenadas do mundo ou de atlas. O catálogo mecânico é complementar: cor ou desenho não substituem as regras de combate.

### Evidência, precedência e limites

Foram lidos `index.html`, `style.css`, `ui-redesign.css`, `touch-controls.css`, `build-guide.css`, `player-weapons.js`, os trechos de desenho de `game.js`, e `tools/skills-panel/App.tsx`/`styles.css`. A ordem real das folhas da interface é style → ui-redesign → touch-controls → build-guide; aplicar todas as regras da primeira folha sem a cascata produz outra interface.

Foram vistos diretamente os PNGs de PROT e os seis atlas de caminhada, a arte do menu, a marca, o asfalto e capturas locais. As capturas `outputs/chat-tester-burro-touch/740x360-menu-integrado.png`, `outputs/advanced-loadout/garage-desktop.png` e `outputs/chat-tester-burro-touch/740x360-config-integrado.png` são históricas; a primeira mostra versão 55. A captura `outputs/chat-burro-ruptura/ultimo-cartucho-740x360.png` é mais recente. Nenhuma delas, isoladamente, comprova todos os estados da candidata 60. Nas seções seguintes, “visto” caracteriza a aparência dessas imagens; dimensões, limites e estados são extraídos do código, a menos que explicitamente apresentados como meta de verificação.

Há um reset global de combate em `style.css`: bordas, sombras e outlines de todos os descendentes de `body.combat-screen` são removidos com `!important`. Portanto, molduras antigas do HUD não devem ser apresentadas como a aparência atual só porque continuam declaradas antes. Na leitura inicial, isso também suprimia o contorno de “último cartucho” da Culatra. Durante esta documentação, o coordenador acrescentou `!important` ao outline e ao offset específicos de `.ammo-panel>b[data-rupture-ready="true"]`. O código final prevê esse contorno; este agente não observou uma captura posterior à correção. O risco geral de foco e bordas permanece separado dessa correção pontual.

### Direção de arte e gramática visual

É um mundo de sucata industrial noturna, visto de cima com personagens em perspectiva curta: robôs compactos, gatos pilotos, juntas escuras, carcaças claras gastas, energia ciano e zumbis que contrastam contra asfalto azul. As formas são legíveis e relativamente quadradas, com pequenos recortes de metal; não usar uma estética medieval para menus ou ícones. A influência de interfaces de sobrevivência é estrutural: escolhas, ramificações e custos visíveis. A identidade é oficina, circuitos, munição e peças.

A marca vista combina letras industriais volumosas, metal marfim gasto, parafusos e gato robótico; tem contorno escuro e volume de ferrugem/sombra. Para desenhar uma substituta, criar um wordmark largo “SCREWVIVORS”, com letras robustas que continuem legíveis sobre fundo escuro, e integrar discretamente uma cabeça felina mecânica. O título é uma imagem, não o resultado de uma fonte CSS comum. Não exigir a mesma disposição de cada arranhão.

| Função | Cores principais | Uso e contraste |
|---|---|---|
| Fundo profundo | `#07121b`, `#06111f`, `#081522` | Menus, overlays e espaços negativos |
| Mundo/asfalto | `#0b1728`, `#142434`, `#223345` | Piso azul acinzentado; textura com contraste baixo |
| HUD | `#091522ef` | Fundo escuro quase opaco sob números |
| Painéis | `#102333`, `#132b3d`, `#142c3c`, `#173046` | Superfícies em níveis discretos |
| Seleção/foco | `#265169`, `#285467`, `#2b5269` | Fundo destacado, acompanhado de texto/estado |
| Energia/ação | `#3cc7f4`, `#71e7ff`, `#86dce9` | XP, seleção, botões principais, alvo |
| Texto | `#eff7fa`, `#edf5fa`, `#d8e8f3` | Branco frio; títulos e valores |
| Texto secundário | `#9db6c7`, `#8eacc2`, `#a8c0d0` | Explicações; nunca perder leitura no fundo |
| Vida do jogador | `#e75352`, brilho `#ff9a83` | Barra e perda de integridade |
| Vida do chefe | `#e85b50`, brilho `#ff9b79` | Barra central, sem competir com HP do jogador |
| Raridade/peças | `#ffd27c`, `#f6c45f`, `#be9454` | Baús, relíquias, metal raro |
| Cura | `#9ff0b8`, `#153e29`, `#81d7be` | Cruz e realces médicos |
| Fogo | `#ffb363`, `#ffb66c`, `#d96535` | Chama e calor |
| Frio | `#9df2ef`, `#c6ffff`, `#397f9a` | Cristais e congelamento |
| Eletricidade | `#c5b4ff`, `#c3b6ed`, `#9b82dd` | Bobinas e raios |
| Corrosão | `#a6e87d`, `#c6f1a8` | Efeito químico e indicador |
| Crítico | `#ffe09a` | Pequenos marcadores angulares |
| Colimador | `#7de7f6`, base `#07121b` | Quadrado de marcação |
| Culatra pronta | `#f1f8ff`, `#e7fcff` | Chevrons no tiro e contorno de munição |

Textos corridos usam Arial/Helvetica/system-ui; contadores, rótulos técnicos e comandos usam monospace. Evitar uma fonte decorativa para descrições extensas. Hierarquia típica: título 28–52; subtítulo 18–22; descrição 12–15 com entrelinha 1,35–1,7; rótulo 9–12; microtexto móvel 7–10. O microtexto deve ser secundário, nunca a única informação necessária para uma ação.

### Fluxo de telas e composição

Fluxo principal: menu → garagem (robô e equipamento) → configuração da incursão → combate. Subir de nível, especializar o robô, reforjar a arma e escolher recompensa são overlays de uma partida pausada, não páginas que iniciam outra tentativa. O painel de skills é uma ferramenta de edição separada, acessível do menu, e deve indicar aplicação nas próximas partidas.

#### Menu

Plano de fundo visto: ilustração industrial noturna panorâmica, com robô/gato à direita e área escura à esquerda para marca e ações. Para recriar, desenhar sucata, luzes frias e profundidade atmosférica sem colocar detalhes de alto contraste atrás dos botões. A imagem original tem 1672×941 e é usada como `cover`, centralizada; aceitar cortes responsivos.

Sobre ela há gradiente horizontal escuro com estágios `#06111ff5`, `#081526e8`, `#0815268c`, `#08152612`, além de sombra superior/inferior. A coluna de texto usa largura `min(62vw,780px)`, margem esquerda `clamp(28px,8vw,150px)` e padding vertical 38. Em 1280×900, a referência da margem é 102,4 px. Logo com largura máxima 560; kicker “PROTOCOLO SOBREVIVÊNCIA / 001”; slogan curto em duas linhas; botões ABRIR GARAGEM, PROJETOS DE BUILD, ATIVAR ÁUDIO e CONFIGURAR SKILLS. CTA principal: largura máxima 330, padding 17×21, fonte 12 monospace, fundo `#43b9db`, texto `#071624`. Slogan `clamp(14px,1.45vw,19px)`, entrelinha 1,8. Rodapé de versão fica a 32 do fundo e `clamp(20px,4vw,64px)` da direita, fonte 10.

Em altura até 520 e largura acima de 700, logo máximo 390 e margem lateral 6vw. Em largura até 700, reorganizar em coluna mais baixa; em paisagem de até 500 de altura há regras de rolagem e padding 16×26. **Limite observado:** uma captura histórica 740×360 corta o topo da marca. Como 740 fica acima do breakpoint 700, não pressupor que o menu está aprovado nessa dimensão. Critério de recriação e teste: todas as ações acessíveis sem corte permanente; se não couberem, rolagem vertical explícita. Não reproduzir o corte como decisão artística.

#### Garagem

Cabeçalho identifica Dr. Biruta/GARAGEM 01, botão ← MENU e título “Prepare a próxima tentativa”. Banco de parafusos/peças fica visível antes da compra. A área principal separa seleção de chassi, seleção de arma e resumo do equipamento. São seis chassis em grade de duas colunas, com retrato, nome, seleção e passiva explicada; doze opções de arma com nome e atributos relevantes. Mostrar arma primária e slots auxiliares 2/3, custo, saldo, feedback de compra e descrição da reforja. Selecionar um projeto de build deve deixar claro que ele equipa/guia uma receita, sem conceder gratuitamente todos os aprimoramentos.

No desktop, usar painéis azul escuro, títulos claros, destaque ciano para selecionado e ouro apenas para recursos/raridade. Retrato inteiro deve caber, com pés visíveis, sem esticar a proporção. A descrição acompanha a seleção imediatamente; o CTA CONFIGURAR INCURSÃO fica após o resumo. Manual de campo ao fim. A captura de garagem vista é uma imagem de página completa alta: ela demonstra organização, não que todo conteúdo cabe em 900 px. A garagem precisa rolar.

Em 740×360, preservar a ordem robô → arma → auxiliares → custos → CTA; a leitura é vertical com rolagem, não reduzir doze armas a ícones sem legenda. Sem posição absoluta que cubra a lista com o CTA. Valores exatos de todas as colunas/alturas da garagem não foram consolidados neste fragmento; reconstruir pelo fluxo descrito e validar as duas dimensões.

#### Configuração da incursão

É etapa posterior à escolha de personagem/arma. Fundo `#081522`, raiz com rolagem e padding `clamp(20px,4vw,56px)`, conteúdo máximo 1040. Título `clamp(28px,4vw,52px)`/1,08. Resumo de equipamento tem margem vertical 30, padding 20×24, gap 20, retrato 64×80; nome do robô 20 monospace, arma 12 ciano.

Grade de regras em duas colunas `1fr 1fr`, gap 18; cada artigo padding 24, fundo normal `#102333`, protocolo ativo `#183b48`. Mostrar os modos realmente suportados e seus textos/duração, dificuldade/protocolo e controles de áudio. Sliders têm referência de largura 140; volumes iniciais música 0,35 e efeitos 0,6. Ações com altura mínima 50; botão de iniciar com largura mínima 240. Em largura até 720, grade e ações empilham. Em 740×360, ainda pode haver duas colunas: o conteúdo deve rolar e o rodapé não pode cobrir o botão de iniciar. A captura histórica vista mostra só a parte superior, não aprovação do rodapé.

#### Escolha de melhoria normal, protocolo e reforja

Workbench máximo 920 dentro de overlay com rolagem, padding 28×24 e fundo `#081522ef`. Três opções lado a lado, gap 12, min-height 132, padding 16×12, ícone 48, nome 12 monospace, família 9. Seleção usa `#285467` e estado textual. A escolha selecionada abre detalhe na mesma tela: grade `1.15fr .85fr`, gap 28, padding 26×28; título 22, descrição 14/1,7. Benefício em verde; custo em superfície `#263138`, texto `#f0ce9b`. Exibir opções, efeito exato, perda, requisitos e futuras melhorias de forma integrada. Ramificações usam ícones de 36, setas/linhas com sentido e rótulos; um nó bloqueado explica a condição, não só fica cinza.

Confirmar tem largura máxima 440 e altura mínima 50, destaque `#86dce9`; escolher/focar uma opção não a aplica antes da confirmação. Reforjas têm duas alternativas, grade máxima 900 com gap 18; abaixo de 600 passam a uma coluna. Especialização do robô e evolução da arma devem manter identidade do chassi/arma no cabeçalho; o nível e momento vêm do catálogo mecânico.

Em altura até 650, opções min-height 100, ícones 36, detalhe padding 18×22, título 19, descrição 12. Até largura 720, detalhe vira uma coluna. Em 740×360, não inferir que a interface cabe sem rolagem só porque o overlay cabe na viewport; título, cards, detalhe e confirmação precisam permanecer acessíveis.

#### Relíquia de chefe e experimento

Variar o overlay para gradiente quente `#503722f5` → `#111820fa`, título `#ffd27c`; é uma peça de oficina rara, não um baú medieval. Desktop: três cards de largura 220–330, ícones 88, nomes 18, benefício 15. Explicitar o que favorece, o custo e duração somente nesta partida.

Para paisagem com altura até 500 e largura até 1100: padding 10×12, título 21, explicação 10; três cards flexíveis com gap 8/padding 8. Dentro do card, ícone de 40 ao lado da identificação; categoria 7, título 13, benefício 10,5/1,35, custo 8, botão 9 com altura mínima 30. Pular usa uma linha inteira e altura mínima 44. Texto pode rolar; os três botões precisam continuar distinguíveis, sem um clique atingir a opção vizinha.

#### Pausa e fim da tentativa

Overlay de pausa `rgba(8,20,38,.72)`. Diagnóstico máximo 580, altura máxima 42vh (30vh em altura até 500), conteúdo rolável. Pares de valores em duas colunas com fonte 11 monospace; títulos 12; peças instaladas em ouro. Aviso de rolagem sticky no topo com fundo `#091522`, borda inferior `#47677e`, texto `#7de7f6`, fonte 9/1,3. O reset global pode afetar bordas: testar aparência computada, não apenas declaração.

Morte usa “Fim da transmissão”, tempo/abates/resultados e opções de repetir equipamento ou voltar à garagem. Não desenhar vitória definitiva aos 20 minutos se a regra de modo não a produz. O texto deve distinguir recursos permanentes guardados de aprimoramentos temporários encerrados.

### HUD em 1280×900

Raiz superior com inset 14 e grade `330px minmax(240px,1fr) 280px`, gap 18. Largura útil 1252: colunas 330 / 606 / 280; posições x aproximadas 14 / 362 / 986. Três regiões compartilham a mesma faixa superior e alinhamento, evitando que a barra do chefe pareça flutuar fora da composição.

| Região | Geometria e conteúdo |
|---|---|
| Jogador à esquerda | Cabeçalho mínimo 86; retrato 58; nome e nível 14; HP barra 14 com número 11; XP barra 7; texto frio e vermelho reservado à vida |
| Chefe ao centro | Cabeçalho mínimo 86, nome/fase e barra central horizontal de 13; preenchimento vermelho `#e85b50`, brilho `#ff9b79`; estado oculto sem chefe não desloca jogador/mapa |
| Estatísticas à direita | Largura 280, relógio 20; controles e dados compactos; minimapa 130 sob cabeçalho com intervalo 12 |
| Munição | Esquerda 14/fundo 14, largura 235; nome 9, quantidade 22, status 9; um bloco por arma e recarga correspondente |
| Recargas/protocolos | Esquerda 263/fundo 14; seis itens de 66×mínimo76; ícone, tecla e prontidão |
| Avisos | Direita 16/topo 260, largura máxima 320; filas curtas, sem cobrir a mira |

O HUD é uma camada DOM sobre o canvas. Bordas/sombras antigas são suprimidas pelo reset de combate; privilegiar alinhamento, blocos escuros, preenchimentos e contraste. Dicas de controles e de coleta somem após cinco segundos ativos. O feedback da habilidade Espaço deve ficar próximo ao equipamento/indicador correspondente, sem cartaz permanente no centro da arena. O minimapa mantém inimigos distantes na borda e desloca seus marcadores para dentro conforme se aproximam; chefe com marcador reconhecível.

### HUD em 740×360 e celular horizontal

Regra paisagem até 600 de altura e 1100 de largura: topo 8, laterais 10, gap 10, grade `minmax(175px,1fr) minmax(215px,1.8fr) minmax(145px,1fr)`. Em 740, área 720 menos 20 de gaps resulta aproximadamente em 184,21 / 331,58 / 184,21. Cabeçalhos mínimos 58. Retrato 32×36; nome 10; HP número 9/barra 10; XP cue 7. Relógio 15, legendas 7, pausa mínimo 36. Barra do chefe 8. Minimapa 76 (72 com touch), deslocamento vertical 68 na região direita.

Avisos normais: direita 10/topo 206, largura 180; com touch: direita 8/topo 194/largura 152. Coleta: direita 10/topo 160/largura 174; com touch topo 150/largura 152. Não empilhar notificações até invadir os controles.

Munição com touch fica no alto à esquerda, top 76; até largura 760 usa left 8/largura 158. A altura máxima é `calc(100% - clamp(96px,28vh,124px) - 94px)`, com overflow auto; em 360 de altura isso é aproximadamente 165,2. Portanto, três armas podem exigir **rolagem interna real**. Verificar clip por ancestrais: o bounding box de um elemento pode estar dentro da viewport e ainda estar escondido por overflow. A área aceita `pan-y` e pointer events para rolar.

Dois joysticks translúcidos ficam nos cantos inferiores: movimento à esquerda, mira/disparo à direita. Diâmetro base `clamp(96px,28vh,124px)`; em altura até 400, `clamp(90px,26vh,108px)`, que dá 93,6 em 360. Nas larguras até 760, laterais 9 e fundo 12. Manopla 30% do diâmetro, brilho radial ciano, rótulo MOVER de 7. Botões de recarga/esquiva adjacentes ao pad direito, 42×mínimo42 em baixa altura, gap 5, base 24. O cálculo de afastamento horizontal desses botões ainda usa a expressão `9 + clamp(96px,28vh,124px) + 7`; conferir que essa diferença de expressão não causa interseção no aparelho alvo.

Com touch ativo, esconder dicas de teclado e preservar controles de toque acima da arena. Em orientação vertical, overlay integral “GIRE O CELULAR”, z-index 12, pausa a simulação. Retornar à paisagem não retoma a partida sem a ação prevista. Só a orientação horizontal é alvo de jogo; a tela vertical continua precisando explicar o bloqueio e permitir a rotação.

### Robôs: instruções de desenho dos seis chassis

As descrições abaixo vêm dos atlas vistos. Todos têm corpo compacto, cabeça/cockpit acima do tórax, pés grandes separados, juntas azul quase preto, outline escuro e sombreamento industrial. A vista principal é frontal ligeiramente elevada; fazer também direita, costas e esquerda. A silhueta precisa distinguir chassi sem depender do nome ou de trocar só a cor.

| Chassi | Silhueta, materiais e marca distintiva |
|---|---|
| PROT-0001 | Humanoide mais fino, capacete marfim arredondado, visor ciano horizontal estreito, discos nas orelhas; tórax compacto com quadrado ciano pequeno; placas marfim, luvas/botas e juntas azul escuro, pequenas manchas de ferrugem laranja. Neste sprite visto não há gato claramente exposto: não impor o cockpit felino dos outros sobre o desenho do PROT. |
| BAST-0002 | Muito largo, ombros horizontais grandes e corpo retangular pesado. Cockpit escuro na parte superior frontal com gato laranja e olhos ciano. Carcaça marfim/cinza, tela retangular ciano no peito, botas volumosas, pequena antena atrás do ombro; nas costas, três saídas ciano. Deve parecer um tanque compacto. |
| FORJ-0003 | Corpo pesado cobre/ferrugem/laranja, juntas escuras e gato no cockpit. Duas chaminés verticais acima dos ombros; no peito, três barras verticais incandescentes alaranjadas. Costas com grade escura. Silhueta de fornalha portátil, não apenas BAST pintado. |
| VOLT-0004 | Armadura cinza violeta, cockpit de gato, cada ombro com três aletas horizontais luminosas violeta/ciano. Núcleo vertical roxo no peito; placa/grade posterior. Desenhar aletas em todas as direções para preservar a identidade durante movimento. |
| NANO-0005 | Marfim esverdeado, antena alta com sinal verde, cockpit de gato, grande cruz médica verde no peito. Luzes verdes em punhos/botas, mochila técnica com ventilações verdes e fios de cobre. Identidade de suporte médico reconhecível em miniatura. |
| ENXA-0006 | Corpo pesado compacto bege/oliva, cockpit de gato, antena com ponta amarela. Peito com dois compartimentos retangulares, pernas oliva e botas bege, duas caixas nas costas. Drone é outro objeto desenhado separadamente; não fundi-lo permanentemente ao sprite. |

Evitar contorno branco/halo de recorte. Fundo dos sprites é transparente; quadriculado de editor nunca integra o asset. Renderizar com pixel snapping/smoothing desativado quando aplicável; desgaste pontual não deve destruir as grandes massas de cor. Em jogo, a altura visível normalizada é aproximadamente 72 pixels do mundo para todos, embora as caixas dos atlas sejam maiores.

#### Poses, atlas e movimento

Atlas v3 têm 1774×887, células aproximadamente 222×222. Quatro direções, ordem baixo/direita/cima/esquerda, oito frames de caminhada por direção com 100 ms cada (ciclo de 0,8 s), e um idle de 1000 ms por direção. Os pivôs por frame ficam próximos dos pés; não centralizar pela área transparente. A âncora usa posição do jogador e deslocamento de chão de 28, com pés em `player.y+28`. Elipse ciano de apoio: centro y+25, raios 30×9.

Normalização extraída: PROT altura-fonte máxima 177, escala 0,406779661; BAST e FORJ 192, escala 0,375; VOLT 185, escala 0,389189189; NANO 188, escala 0,382978723; ENXA 196, escala 0,367346939. Não usar a largura total de 222 como altura visível. A caminhada alterna pernas e braços com balanço discreto, preservando peso; idle não deve reproduzir caminhada. Tempo de animação depende da simulação e congela em pausa. Corpo acompanha movimento; arma pode apontar independentemente. Falha de asset deve mostrar fallback coerente com o chassi, não um sprite de direção/robô diferente.

### Armas: doze silhuetas e como segurá-las

As armas do jogador são desenhadas no código; não dependem de um atlas externo. Base comum: contorno `#071725`, metal `#b0c4cf`, mãos `#d1e1e9`, antebraço escuro e duas mãos. Cada modelo tem forma própria em escala de poucas dezenas de pixels. O comprimento é referência local do desenho, não alcance mecânico.

| Arma | Comprimento | Corpo / energia | Instrução para reconstruir |
|---|---:|---|---|
| Metralhadora | 28 | `#536e82` / `#8de4fa` | Corpo retangular, cano fino frontal, carregador inferior, mira e fendas de ventilação |
| Escopeta | 30 | `#8c7156` / `#e8bb79` | Dois canos metálicos paralelos, coronha curta e telha/pump marrom sob a frente |
| Rajada | 29 | `#547f78` / `#a9e6b8` | Fuzil verde cinza, carregador e três pequenas marcas luminosas que sugerem rajada |
| Precisão | 42 | `#53667a` / `#e2c993` | Cano muito longo, luneta superior e coronha amadeirada; leitura de atirador |
| Laser | 30 | `#466a82` / `#7cecff` | Corpo tecnológico, aletas e boca de energia ciano/branca; sem coronha de madeira |
| Lança-chamas | 28 | `#926342` / `#ffb56e` | Reservatório traseiro, tubo de cobre espesso, bocal alargado com ponta amarela |
| Criogênica | 29 | `#5b8490` / `#b6f3f1` | Câmara clara de resfriamento, aletas e extremidade larga gelo pálido |
| Foguetes | 33 | `#7c8059` / `#e2d58f` | Tubo oliva grosso, abertura preta ampla, faixa amarela e apoio traseiro |
| Granadas | 25 | `#8a7450` / `#e6c581` | Lançador curto de corpo alto, tambor marcado por tiras verticais douradas |
| Tesla | 27 | `#6f668d` / `#c6b7ff` | Bobinas/aletas violeta e duas pontas frontais de garfo condutor |
| Discos | 24 | `#6c7c85` / `#b2ebf7` | Corpo curto relativamente alto, carregador frontal e fenda vertical do disco |
| Arpão | 35 | `#756c55` / `#c3d5d6` | Haste fina longa, suporte transversal e ponta triangular comprida |

Anexar ao jogador em posição arredondada, com y+5, rotacionando pelo ângulo da mira; quando `cos(ângulo)<0`, inverter verticalmente o modelo para não pôr o carregador para cima. Deslocamento frontal local 11, reduzido por recuo de até 3. Recarga inclina por `sin(progresso×π)×0,25` radianos; dano pode reduzir alpha a 0,6. A animação de arma é visual, sem alterar a direção física dos tiros. Os três equipamentos precisam mostrar seus estados de munição distintos no HUD.

#### Projéteis e efeitos de tiro

Cor usa snapshot da arma/tiro: fogo `#ffb363`, frio `#9df2ef`, Tesla `#c5b4ff`, explosivo `#ffc17a`, demais `#89ddff`. Trilha tem alpha 0,45 e comprimento `min(32, velocidade×0,025)`; espessura laser 4, demais 2. O tamanho visual acompanha a razão entre raio atual do projétil e raio-base da arma, sem mudar colisão por causa do desenho.

| Família | Forma equivalente |
|---|---|
| Bala comum | Círculo ciano com núcleo branco e trilha curta orientada |
| Fogo | Polígono/chama de referência 22×12, base laranja `#d96535`, núcleo `#ffe2a0` |
| Frio | Losango/cristal de 20×14, base `#397f9a`, contorno `#c6ffff` e núcleo claro |
| Tesla | Zigue-zague de 26, linha grossa 5 violeta `#9b82dd`, linha interna 2 `#eee4ff` |
| Laser | Corpo de 27×6 `#519dbc`, núcleo 27×2 `#e4ffff` |
| Disco | Cruz de 18 e círculo de raio 8, girando pelo relógio visual ×12 |
| Arpão | Haste 23×4 e ponta triangular claramente frontal |
| Explosivo | Corpo 16×10 `#294253`, ponta âmbar e pequena janela clara |

Crítico acrescenta marcadores angulares amarelos. Colimador usa quadrado de 14×14. Culatra usa dois chevrons brancos atrás do projétil, sem apagar a silhueta original da arma. Tiros que já existem conservam sua aparência associada ao disparo, mesmo se um estado do jogador mudar. Efeitos visuais não devem consumir RNG de combate nem mudar dano/posição. Explosão é expansão curta em laranja, eletricidade em violeta e frio em ciano; não uniformizar tudo em uma bola branca opaca que esconda o alvo.

### Cenário, pickups e leitura do mundo

Asfalto visto: textura quadrada 1254×1254, placas irregulares grandes azul cinza, fissuras quase pretas, cascalho/pontos e poucas marcas amarelas de pista. Recriação pode desenhar outro padrão de rachaduras, mas deve ser repetível sem uma emenda gritante e deixar os personagens mais claros que o chão. Repetir no mundo; aplicar véu `rgba(8,21,35,.82)`; fallback sólido `#223345`.

Decoração procedural usa células de referência 512: ruído acima de 0,9 pode desenhar carcaça de veículo retangular com cerca de 82 de largura, janela escura e luzes enferrujadas; ruído entre 0,65 e 0,75 pode desenhar barril 13×17. São decorações sem colisão: não representá-las como paredes transitáveis apenas por bug. Luz local usa gradiente de raio 320, deslocamento central 16, ciano alpha 0,18 no centro/0,08 em 22%/zero na borda; vinheta da viewport chega a alpha 0,32. A iluminação não é desculpa para ocultar inimigos ou telegraphs.

| Objeto | Forma, cor e tamanho de referência |
|---|---|
| XP | Losango ciano 7, centro 5, anel de raio 8 e halo 14; parecer energia, não moeda dourada |
| Parafuso | Forma ferrugem/ouro 14×12, cabeça saliente, haste e miolo 6×6; reconhecível como sucata |
| Reparo | Caixa verde 18×18 com cruz formada por barras 12×4 e 4×12 |
| Peça/baú de chefe | Caixa escura 40×31, frente bronze 34×25, tampa 30×8, duas cintas douradas verticais e fechadura 6×9; halo elíptico 30×13 e rótulo PEÇA RARA em 11 monospace a 23 acima |
| Drone | Corpo oliva 16×10, núcleo âmbar e pequenas aletas; órbita visual 42×30. Três LEDs ciano extras pertencem à Baia, não a todo drone |
| Sensor/exposição | Pulso azul e marca quadrada de 14; conservar inimigo visível dentro da marca |
| Corrosão | Moldura verde ao redor do inimigo e rótulo COR com tempo; não depender apenas da tonalidade da pele |

Telegraph de investida de chefe tem retângulo laranja de referência 234×92. Outras áreas de rajada/pulso usam círculos laranja/violeta de raio 65; leques têm duas linhas violetas delimitadoras. São aviso anterior ao dano e precisam contrastar com chão, pickups e explosões. Para sprites de inimigos, este fragmento não extraiu todas as poses/atlas; a documentação de combate especifica tipos e comportamento. Arma/escudo de policiais e perfil do chefe precisam ser visíveis, não apenas inferidos pelo nome.

#### Ordem de camadas

Desenhar, em ordem aproximada: piso/luz; perigos e objetos no chão (baús, ecos, marcas, sucata, XP); linhas de mira policiais; inimigos/chefes/telegraphs; indicadores de corrosão/sensor/Colimador; projéteis do jogador; projéteis hostis; impactos/faíscas; rotores; corpo do robô; armas; drones/escudos; números de dano; vinheta/flash/mira; HUD e controles DOM; overlays. Ajustar a ordem de avisos para que o perigo continue legível, sem alterar a mecânica. A mira manual é círculo de raio 7 com traços de cruz até 12, ciano. Nunca confundir a mira com um pickup.

### Painel de configuração de skills

É ferramenta administrativa de biblioteca, não uma tela do universo durante combate. Sua paleta atual é própria: fundo `#0c111a`, painéis `#111a26`/`#121a25`, bordas `#253348`/`#273447`, texto `#e8edf6`, secundário `#8190a8`, destaque ácido `#9eff00`. Cantos de 6–10, separadores discretos. Essa diferença é funcional: deixar evidente que se está editando dados, com estado RASCUNHO/APLICADO/ERRO.

Em 1280: sidebar 244, topbar mínimo 72, conteúdo padding 30. Quatro cartões-resumo precedem biblioteca/editor. Biblioteca usa coluna 320, editor no espaço restante, gap 17. Até 1400 o editor interno reorganiza prévia abaixo; não presumir que o painel a mantém ao lado. Lista com ícones 32, pesquisa, filtros por categoria/robô e seleção com superfície verde escura mais faixa lateral. Editor tem cabeçalho 17, abas, campos em duas colunas, tabela de efeitos, notas e prévia. Custos negativos/positivos precisam aparecer com sinal e unidade conforme catálogo, não apenas cor.

Em 740 (<900), sidebar é drawer fora da tela em left -260 até abertura pelo menu; conteúdo em uma coluna, padding 17; cartões-resumo em duas colunas, lista com altura máxima 350. Tabela de efeitos pode ter rolagem horizontal local, mas a página não deve transbordar inteira. Aplicar nas próximas partidas é ação explícita com feedback; exportar/importar/descartar não devem parecer o mesmo botão. Não aplicar retroativamente em partida já iniciada. As regras exatas de validação, migração e 82 definições editáveis estão no catálogo; a interface deve mostrar erros junto dos campos e não aceitar silenciosamente estado inválido.

Árvore de skills organiza cinco grupos de oferta, distinguindo ligação de pré-requisito de sinergia. Abaixo de 1100, grupos em duas colunas; abaixo de 560, uma. Não representar uma sinergia opcional como requisito obrigatório por usar a mesma seta.

Guia de builds: diálogo máximo 1160 e 92dvh, cartões em duas colunas, uma abaixo de 800. Cada receita mostra robô, arma/reforja, tags, resumo, motor, força, fraqueza e estratégia. Selecionar/equipar e acompanhar guia são ações distintas. Em 740×360, é uma lista rolável de coluna única; o botão de fechar deve permanecer acessível.

### Critérios de averiguação visual

Esta lista é especificação de teste; caixas vazias não representam testes executados/aprovados.

- [ ] Menu em 1280×900 e 740×360 mostra marca reconhecível, título e todas as ações alcançáveis, inclusive por rolagem quando necessário.
- [ ] Garagem permite comparar seis robôs/doze armas, desbloquear armas com saldo visível e equipar auxiliares já liberadas sem cobrança por tentativa e chegar à configuração sem campo ou botão oculto.
- [ ] Configuração apresenta equipamento escolhido antes das regras; último controle e iniciar são alcançáveis nas duas dimensões.
- [ ] Escolhas mostram simultaneamente alternativas, efeito, perda, requisitos e futuro; teclado/toque não confirma sem intenção.
- [ ] Nível 10, nível 20, experimento e peça de chefe têm identificação e ação corretas; três recompensas permanecem selecionáveis em 740×360.
- [ ] Topo do chefe alinha com a faixa do jogador/estatísticas; HP não invade relógio ou mapa e não muda de lugar conforme comprimento do nome.
- [ ] Retratos e robôs mantêm proporção, pés ancorados e mesma escala aparente; não há quadrado opaco, quadriculado ou halo de recorte.
- [ ] Cada arma tem silhueta distinta, duas mãos coerentes, mira livre e recuo/recarga visível; apontar para esquerda não inverte o carregador incorretamente.
- [ ] Cada família de projétil distingue fogo, frio, elétrico, explosivo e balístico; Colimador/Culatra são adições legíveis, não substituem toda a identidade do tiro.
- [ ] Culatra pronta tem cor e outline computados conforme regra final; capturar visual após correção. A observação inicial de outline suprimido não comprova este item.
- [ ] Foco de teclado tem indicador visível em todas as telas, inclusive com reset global de combate; medir computedStyle e observar a captura.
- [ ] Dicas desaparecem após cinco segundos ativos; avisos e números não bloqueiam o centro permanentemente.
- [ ] Três armas em 740×360: munição de todas alcançável com rolagem real, sem clip por ancestral; botões e joysticks não se sobrepõem ao conteúdo rolável.
- [ ] Dois dedos simultâneos permitem mover e mirar/disparar, com recarga/esquiva acessíveis; toque na munição não aciona disparo indevido.
- [ ] Rotação para vertical mostra GIRE O CELULAR e pausa; voltar respeita a retomada prevista.
- [ ] Boss, policiais com arma/escudo e inimigos à borda do minimapa continuam identificáveis durante muitos tiros/efeitos.
- [ ] XP, parafusos, reparo e baú diferem por forma e cor; o baú permanece localizável após chefe morrer.
- [ ] Pause congela caminhada/arma/efeitos dependentes de simulação e não consome RNG/atualiza combate por desenhar a interface.
- [ ] Painel administrativo mantém formulário legível, valida erros e informa aplicação na próxima tentativa; drawer e tabela rolam localmente no celular.
- [ ] Capturas de evidência registram versão, viewport, orientação, touch e estado; capturas históricas não são usadas como aprovação da candidata.

Não foram extraídos neste fragmento o kerning exato da marca, todos os tons internos de cada PNG, os pivôs de cada um dos frames dos atlas, todas as rachaduras do piso nem a geometria integral de cada ícone de skill. Essas omissões permitem criar assets equivalentes, mas impedem prometer réplica pixel a pixel. Valores responsivos são regras do código, não prova de ausência de recorte: a validação final exige renderizar e interagir nos dois tamanhos, incluindo scroll e clipping por ancestrais.


## Parte V — arquitetura, dados e reprodução



## Estrutura lógica para uma implementação independente

Uma implementação nova não precisa copiar os nomes abaixo, mas precisa separar responsabilidades:

| Camada | Responsabilidade | Estado que pode alterar |
|---|---|---|
| Dados de equipamento | Chassis, armas, munição, custos e reforjas | Nenhum mundo em andamento |
| Perfil | Recursos e desbloqueios locais, migração e compra transacional | Somente perfil permanente |
| Configuração | Editor, validação e snapshot de próxima tentativa | Rascunho/configuração; jamais tentativa já iniciada |
| Simulação | Relógio, jogador, slots, inimigos, estados, colisão, loot e progressão | Estado da tentativa |
| Entrada | Donos de ponteiro, teclado, mira e intenção de fogo | Comandos; limpeza nas transições |
| Apresentação | Sprites, HUD, números, camadas e transições visuais | Somente estado cosmético; sem RNG de combate |
| Áudio | Cenas e eventos limitados por vozes/tempo, RNG próprio | Grafo de áudio; sem física/RNG de combate |
| Testador | Perfil isolado, escolhas, entradas e telemetria | Somente contexto de teste declarado |

### Esquema mínimo de perfil

Chave lógica screwvivors.profile.v1; envelope de esquema2. Guardar somente versão, parafusos, peças por tipo de chefe e mapas de equipamento desbloqueado. Os nomes exatos podem mudar numa reconstrução, desde que ela implemente migração/reembolso e nunca serialize atributos de tentativa como progresso.

Exemplo conceitual de perfil novo:

```json
{"version":2,"bolts":0,"bossParts":{"brute":0,"scrapper":0,"coil":0},"unlockedRobots":{"prot":true},"unlockedWeapons":{"machine":true}}
```

Definir defaults para IDs ausentes. Rejeitar valores monetários inválidos e não negativos fora do limite; não executar texto como código. Recursos coletados devem ser gravados durante a tentativa, não apenas ao voltar para garagem.

### Exemplo de registro editável

O registro abaixo é um fragmento de um envelope que precisa preservar todos os canônicos, não um arquivo de importação completo:

```json
{"id":"damage","name":"ALTO IMPACTO","description":"Dano ×2.","group":"Ofensivo","type":"Normal","rarity":"Comum","unlockLevel":1,"tree":"Dano de impacto","prerequisites":[],"condition":"","effects":[{"id":"damage-0","attribute":"Dano direto","operator":"×","value":2,"unit":""}],"notes":"","accent":"#71d7f2","updatedAt":null}
```

Envelope da configuração: version1, catalogRevision7, lista skills. Efeitos especiais canônicos não são scripts importáveis; manter handlers internos e permitir somente operadores/atributos declarados.

### Procedimento para rodar e testar

1. Runtime do jogador: extrair todos os arquivos do pacote e abrir index.html em navegador compatível. Não exigir Node, instalação, internet, outputs ou paths desta máquina.
2. Servidor local é alternativa de desenvolvimento: servir a pasta em127.0.0.1 com porta livre. Nunca depender de um servidor antigo sem verificar que pertence ao ensaio.
3. Testes automatizados podem usar Node e Playwright externos ao pacote runtime. Fixar versões, navegador e hashes no manifesto.
4. Exemplos de comandos do repositório atual: node tests/combat.cjs; node tests/rupture-chamber.cjs; node tests/shield-status.cjs; node tools/check-release.cjs. Esses nomes são proveniência; uma IA independente deve implementar seus equivalentes a partir dos casos abaixo.
5. Matrizes naturais: preparar contextos/perfis isolados; congelar fontes e piloto; rodar as três sementes finais e guardar relatórios completos.
6. Benchmark real: manter a aba visível; medir deltas de rAF e tempo simulado; não acelerar o relógio nem descartar frames lentos do denominador.
7. Pacote: gerar ZIP do commit final, extrair numa pasta nova, desligar rede e percorrer os fluxos de novo.

### Registro obrigatório de execução

```json
{"caseId":"QA-COMBAT-P03","commit":"HASH_REAL","sourceHashes":{},"environment":{"os":"","browser":"","hardware":"","viewport":""},"fixture":true,"naturalProgression":false,"seed":null,"startedAt":"","finishedAt":"","commandOrProcedure":"","exitCode":null,"expected":"","observed":"","status":"NAO_EXECUTADO","rawArtifact":"","limitations":""}
```

Não preencher status=APROVADO por padrão. Um runner que não terminou, timeout de observação ou arquivo sem exit code não prova aprovação. Inspecionar o handle confirmado antes de decidir se deve continuar aguardando; não reiniciar silenciosamente e substituir um resultado ruim.

### Gerador pseudoaleatório dos testes reproduzíveis

As sementes finais usam o LCG dos pilotos de teste, separado do RNG próprio do áudio. Inicializar um inteiro unsigned32 com seed modulo2^32. A cada sorteio: estado=(1664525×estado+1013904223) modulo4294967296; retornar estado/4294967296. Em JavaScript, usar Math.imul para o produto de32bits e >>>0 após a soma. Esse algoritmo, a ordem das chamadas e o dt precisam ser idênticos para comparar mundos determinísticos. No ensaio natural canônico, tick usa dt fixo de0,05s (20Hz); o piloto escolhe movimento e mira a cada quatro ticks (5Hz), mantendo as entradas entre decisões. Telas de escolha são resolvidas sem avançar esse relógio. Esse passo de teste é distinto do navegador interativo, cujo dt de quadro é limitado a0,04s; resultados determinísticos não comprovam desempenho real. Renderização não deve consumir esses sorteios. O jogo interativo pode usar seu gerador de produção; não alegar que uma sequência de Math.random de navegador não especificado é reproduzível sópelo número da semente.


## Parte VI — disposição dos sistemas pesquisados e pendências


## Disposição dos sistemas pesquisados — revisão para candidata BUILD63

Origem histórica:07/11/2026, inventário local e candidata56. Revisão de situação:13/11/2026, BUILD62 publicada e candidata63 em implementação/validação, sem publicação63confirmada. Linhas e coeficientes históricos abaixo devem ser confrontados com as tabelas atuais da especificação mestre. Não é pesquisa nova da versão externa, aprovação de balanceamento, lista de conteúdos a copiar ou alteração do contrato. Os nomes externos identificam linhas do inventário existente, não novos assets/nomenclatura do jogo.

### Como ler

- **Integrado:** existe um motor original com a função descrita, código rastreável e teste correspondente. Isso não significa equivalência de coeficientes ou de todas as variantes externas.
- **Adaptado diferente:** uma função foi atendida de outro modo; a diferença indicada decorre de decisão vigente do contrato. Quando não há decisão específica comprovada, a parte não equivalente fica **pendente**.
- **Não aplicável:** conflita com regra explícita atual; a regra é citada. Não ampliar essa categoria por conveniência.
- **Pendente:** falta motor equivalente, rastreabilidade ou disposição de design. Não significa obrigação de criar uma cópia. Pelo objetivo aprovado em09/11/2026, todo pendente compatível precisa ser implementado e validado antes da conclusão. Exclusão exige conflito demonstrável com decisão explícita do criador; implementação futura não equivale a cumprimento da meta.

Autoridades: `docs/contrato-atual.md:7` (identidade),`:8` (arena infinita),`:9` (mira/fogo manuais; propulsor sem invulnerabilidade),`:14` (sem atributos permanentes),`:15` (loadout fixo),`:17` (marcos de oferta),`:18` (reforja),`:20` (cura/drones),`:22` (corrosão),`:23` (sensores),`:24` (rotores),`:42` (exclusões). Linhas de código abaixo referem-se à fonte desta rodada; usar também nomes de funções/IDs ao integrar, pois novas edições podem deslocá-las.

### A. As25 árvores do inventário local

Fonte do inventário: `docs/pesquisa-builds-20mtd.md:17`. A contagem não exige25 árvores próprias. Screwvivors tem13 raízes originais/52 nós normais; o importante é não chamar um motor ausente de implementado.

| Entrada/motor pesquisado | Disposição | Implementação própria, limite e evidência |
|---|---|---|
| Fast Bullets: precisão/perfuração | Integrado no eixo funcional | Canhão/Arpão e `pierce`/`range`; `game.js:17`,`:25`,`:615`. Testes `combat.cjs` de perfuração/armas e `weapon-evolution.cjs:46` para arma evoluída/escudo. Não há árvore autônoma com o mesmo nome. |
| Bullet Damage: impacto/fragmentação | Integrado no eixo funcional | `damage`, `blast`, perfuração+explosão e Crivo Balístico; `game.js:594`,`:624`,`:454`, função `impact:1024`. `build-mechanics.cjs:28` protege pulso único por projétil; `positive-weapon-upgrades.cjs` protege ganho direto sem penalidade antiga. |
| Fire Rate: frequência/conservação | Integrado no eixo funcional | `rate`, `killAmmo`, VOLT `chargeRecovery`; `game.js:598`,`:609`,`:286`,`:934`. `build-mechanics.cjs` testa reposição e conservação no limite; `weapon-state.cjs`/`weapon-state-balance.cjs` e `combat.cjs` protegem emissão/rajadas por arma. Não há período genérico ilimitado de munição gratuita. |
| Multi Shots: cobertura e último disparo | Cobertura integrada; último tiro publicado na BUILD60, validação final pendente | `extra` e pellets/rajadas mantêm cobertura; Culatra de Ruptura usa cartucho realmente gasto, reserva por slot e fator no último. `rupture-chamber.cjs` verifica12armas, pellets, reembolso/cap e snapshots. Crítico módulo5 continua motor independente. |
| Reload Boost: ciclo/janela ofensiva | Adaptado funcionalmente na candidata62; gates finais abertos | Lâmina de Recarga (`reloadBlade`) captura dano por arma ao iniciar recarga válida, exige fogo/mira manuais e integra DPS crescente somente durante a janela real. Integral0,9PT na janela completa, duração parcial proporcional; adquirir no meio não retroage. [Contrato completo](lamina-de-recarga.md). Engine/browser aprovados; natural canônico9/10 e experimento de preferência1/4viável na fonte congelada pré-correção finita. Não afirmar equivalência exata ou equilíbrio final. |
| Dragon: maturação temporal | Adaptado pela Baia de Comando na BUILD58 | Peça de chefe elegível para drones mantém bônus imediato e acrescenta estágios aos30/60/90s ativos desde a instalação. Sem ovo ou conteúdo externo. `droneMaturity`, `tickDrones`, `tools/drone-maturity.js`; testes `drone-maturity-model.cjs` e `drone-maturity.cjs`. [Regras e limites](maturacao-e-desempenho.md). |
| Ghost Friend: acompanhante atacante/efeitos por acerto | Adaptado diferente | Drones atacam com dano e arco próprios; não herdam procs de bala. Restrição vigente `contrato:20`; `game.js:905`/`:906`. `build-mechanics.cjs:19`–`:23` verifica teto3, alvo/arco, pausa e ausência de munição/proc recursivo. A transmissão genérica de todos os estados não foi implementada nem prometida para drones. |
| Magic Lens: conversão posicional de projéteis | Adaptado pelo Colimador de Campo na BUILD59 | Campo ancorado no mundo, à frente da mira manual, transforma dano do objeto-projétil que entra uma única vez. Sem procs novos ou trajetória automática. `tickCollimator`, pipeline de projéteis e `tests/field-collimator.cjs`; [contrato](colimador-de-campo.md). Sensor continua sendo exposição de alvo, motor diferente. |
| Magic Scythe: contato orbital | Integrado como Rotores de Sucata | `game.js:582`–`:585`, `tickRotors:952`. `tests/rotors.cjs:15`–`:24` protege varredura, período por disco/alvo, escudo, pausa/reset e isolamento de procs. Contrato`:24`. |
| Magic Spear: vida/recursos no suporte | Adaptação funcional candidata65; aceite final aberto | Acoplamento Vital usa diretamenteHPATUAL em cada ataque de drone: soma min(base,0,025HP), cap próprio×2, foco depois, arco herda captura. Sem custoHP/novo suporte/cadência; não inferir isso do antigo Titânico balístico. [Contrato](conversoes-vitais.md); engine/browser/naturais intermediárias não são gatesfinais. |
| Trainer: dano/crescimento de summons | Adaptado para drones na BUILD58 | Baia multiplica o dano já modificado por1,1/1,2/1,3 nos três marcos ativos, com teto e reset. Sem crescimento de todos os suportes nem procs de bala. Testes de dano real, arco, escudo, pausa e reinício em `drone-maturity.cjs`. |
| Frenzy: frequência/estados de summons | Integrado para frequência; adaptado diferente nos estados | `droneOverclock` tem piso0,35s (`game.js:634`, `tickDrones:906`). Drones não herdam estados de bala por contrato`:20`; estados transmitidos ficam no suporte sensor, restritos a fogo/frio por`:23`. Testes `build-mechanics.cjs:19`–`:20` e `sensors.cjs`. |
| Electromancy: raio/munição | Integrado | Tesla/Descarga/Condutividade/Curto-Circuito e VOLT reposição a cada6 alvos; `game.js:23`,`:618`–`:620`, `shockAt:930`. `build-mechanics.cjs:11`–`:13`,`:27` testa carga, alcance/atributos elétricos. |
| Ice: controle/estilhaço | Integrado | Criogênico, `freeze`, `finisher` e Fratura Industrial; `game.js:20`,`:614`, `damageEnemy:911`. `build-mechanics.cjs:24`,`:26`,`:29` protege duração e uma geração da fratura. |
| Pyromancy: fogo/recuperação | Integrado | Lança-chamas, quatro nós de fogo, FORJ `heatRecovery`; `game.js:19`,`:610`–`:613`,`:285`, `applyStatus:941`. `build-mechanics.cjs:9`–`:10`,`:25`, `combat.cjs:260`. |
| Dark Arts: dano adiado/propagação/crescimento | Integrado para dano adiado/propagação; pendente para crescimento acumulativo | Corrosão captura dano/prazo e respinga uma geração (`game.js:590`–`:593`, `applyCorrosion:993`, `tickCorrosion:1003`). Contrato`:22`; `corrosion.cjs`/`corrosion-balance.cjs`. Não há contador de maldições que aumente dano indefinidamente. |
| Holy Arts: último tiro convertido por vida | Adaptação funcional candidata65; aceite final aberto | Pulso de Integridade nasce após consumo real do último cartucho emitido:0,20HPmáxima/Narmas, raio90+corpo, fonte própria sem pipeline de impacto. Não nasce de recarga/pellet ouCulatra; preserva ganchos globais de morte. [Contrato e casos](conversoes-vitais.md). |
| Health: reserva/reação | Integrado | BAST/NANO, `armor`/`titan`, reparos, `nineLives`, `retaliation`, `overload`; `game.js:93`,`:96`,`:238`,`:602`–`:605`,`:626`. `combat.cjs:414`, `build-mechanics.cjs:16`–`:17`,`:33`. |
| Shield Boost: proteção/benefício ativo | Adaptação candidata63; aceite global/natural pendente | Ponte de Potência (`shieldDrive`) exige Banco+Escudo e calcula cartuchos×1,2 enquanto `skills.shield && shieldReady`; reserva sozinha não ativa. Sem multiplicação acumulativa do atributo; snapshots antigos preservados. Engine24grupos e browser controlado são provas parciais, não equilíbrio. [Contrato](reserva-e-manutencao.md). |
| Dodge Boost: esquiva/mobilidade | Adaptado diferente para mobilidade ativa; pendente para esquiva probabilística | `dash` é avanço manual adquirido, sem invulnerabilidade por decisão explícita (`contrato:9`, `game.js:622`). `combat.cjs` testa avanço/recarga e dano durante ele. Não declarar “chance de esquiva” implementada. |
| Soul Heart: reserva/conversão | Adaptação candidata63; aceite global/natural pendente | Banco de Reserva (`reserveBank`) cria20/40distintos deHP;50% do excesso de cura repõe Banco, retorno de cura continua HPefetivo. Consome dano após mitigação e transfere excedente aoHP; não é escudo binário nem ganho permanente. [Contrato e casos](reserva-e-manutencao.md); validação final aberta. |
| Magnet XP: coleta/continuidade | Integrado | `magnet`, `xp`, `repair`, `killAmmo`; `game.js:606`–`:609`. `combat.cjs` testa coleta/XP/perfil; `build-mechanics.cjs:14`–`:15`,`:31` protege coleta e cura efetiva. Equilíbrio da curva ainda não aprovado. |
| Speed Boost: velocidade/manutenção | Integrado | `dash`, `speed`, Motor Cinético e Lança de Fuga; `game.js:622`–`:623`, função `impact:1024`, `builds.js` receita `lanca-de-fuga`. `build-mechanics.cjs:30` protege empurrão/escudo; builds-balance mede progressão. |
| Vision: pulso/transmissão | Integrado como Sensores de Campo | `sensor`/`sensorRelay`/`sensorLock` (`game.js:586`–`:589`, `tickSensor:979`), contrato`:23`. `sensors.cjs` verifica snapshots, fonte, pausa/reset, escudos, exposição só de balas e estados permitidos. |
| Aero: vento/conversão cinética | Integrado para conversão de movimento; pendente para entidade/ataque de vento | Motor Cinético converte velocidade do robô em dano limitado de impacto, com `speed`+`knock`; `game.js:454`, `impact:1024`; `build-mechanics.cjs:30`. Não há projétil/entidade vento original identificado; o contrato não exige estética/nomes da referência. |

### B. Gatilhos dos13 personagens pesquisados

Fonte: `pesquisa-builds-20mtd.md:51`. O jogo não precisa13 personagens equivalentes; esta tabela rastreia os motores estudados.

| Motor do inventário | Disposição | Evidência e diferença |
|---|---|---|
| Shana: reroll | Adaptado diferente | Reroll é ferramenta de todos os chassis por nível comum, não passiva de um personagem. Decisão vigente `contrato:17`; `game.js:738`; `build-mechanics.cjs:32` e `combat.cjs:393`–`:400`. |
| Diamond: vida/cura/risco | Integrado funcionalmente | NANO/BAST, Titânico e protocolos de cura; `game.js:541`,`:287`,`:902`; `build-mechanics.cjs:14`–`:17`,`:33`. Crescimento acumulativo por cura durante a tentativa permanece pendente. O contrato`:14` proíbe atributos entre tentativas; não impede um crescimento temporário futuro. |
| Scarlett: contagem de tiros→fogo | Pendente no gatilho exato | Contagem→crítico existe (`:1038`); fogo por impacto existe (`:941`), mas não há emissão periódica de fogo a cadaN disparos. Não combinar dois sistemas separados no relatório como um só. |
| Hina: ação ativa→clone/reposição | Adaptado diferente para reposição; pendente clone ativo | Avanço exige skill e não dá imunidade (`contrato:9`); eco do PROT nasce após dano, não da ação ativa (`:238`, hurtPlayer). Testes `combat.cjs:424` e especialização. Não afirmar clone ativo integrado. |
| Spark: acerto→raio | Integrado | `shockAt:930`, VOLT `:286`, testes `build-mechanics.cjs:11`–`:13`,`:27`. |
| Lilith: morte→cascata | Adaptado diferente no circuito de propagação | Respingo reagente parte da morte de alvo carregado, no máximo uma geração/dois vizinhos por contrato`:22`; `game.js:592`, `damageEnemy:911`; `corrosion.cjs`. Não invoca espíritos nem cria cadeia ilimitada. |
| Abby: ação ativa→esvaziar carregador | Pendente | Burst respeita pressão/cadência/munição, mas não há ação separada que descarregue instantaneamente o carregador. `game.js:560`, `emitProjectiles:1033`; contrato exige fogo manual, mas não proíbe por si só uma habilidade manual futura desse tipo. |
| Yuki: contagem→gelo | Pendente no gatilho exato | Frio vem de impacto, recarga ou sensor; quinto tiro é crítico. `game.js:554`,`:941`,`:979`,`:1038`. |
| Luna: recarga→aglomeração espacial | Pendente | Recarga Glacial e Circuito Refrigerante afetam área/estado, não atraem corpos para um ponto. `tickWeaponReload:550`, `build-mechanics.cjs:18`. |
| Dasher: ciclo→transformação móvel | Pendente | Há avanço ativo e passada visual, sem alternância temporal entre formas de combate. Não confundir animação com transformação mecânica. |
| Hastur: intervalo→ataque invocado | Integrado funcionalmente | Drones e sensores adquirem alvos/pulsam em intervalos próprios; `tickDrones:906`, `tickSensor:979`; `build-mechanics.cjs:19`–`:23`, `sensors.cjs`. Não exige entidades/nomes da referência. |
| Raven: acompanhante→dano adiado | Adaptado diferente no dano adiado; não aplicável a procs genéricos do drone atual | Corrosão parte de bala por contrato`:22`, drones não semeiam (`:20`). Fonte adiada está integrada; a ligação acompanhante→corrosão conflita com o isolamento vigente do drone. `corrosion.cjs` testa ausência em fontes secundárias. |
| Katana: fim de recarga→arma invocada | Adaptado funcionalmente na candidata64; gates finais abertos | Pistão de Retorno invoca entidade própria ao concluir recarga válida:0,9P×fração reposta,216px/0,6s/r10/3contatos, umporarma, direção manual sem homing. Fonte própria e cronologia/residual testados; P2de origem pré-movimento registrado. Engine17grupos/browser/naturais intermediárias10/10A e4/4B não são aceitefinal. [Contrato](pistao-de-retorno.md). |

### C. Propriedades das11 armas pesquisadas

Fonte: `pesquisa-builds-20mtd.md:73`. Não há requisito de reproduzir11 modelos ou seus riscos; existem12 armas industriais próprias, fixas durante a tentativa.

| Propriedade estudada | Disposição | Evidência ou pendência |
|---|---|---|
| Revolver: referência equilibrada | Integrado funcionalmente | Metralhadora é referência de tiro simples manual (`game.js:14`), testada por `combat.cjs`. Não equivale a importar um revólver. |
| Shotgun: muitos contatos/carregador curto | Integrado | Escopeta5pellets/6munições (`:15`,`:27`), `combat.cjs`, `weapon-evolution.cjs` (reforjas de escopeta) e contagem em `build-mechanics.cjs:24`. |
| Dual SMGs: frequência de gatilhos | Integrado funcionalmente | Laser/rajada e arsenal opcional independente (`:16`,`:18`, `tickWeaponFire:558`), contratos`:15`. `weapon-state.cjs`/`weapon-state-balance.cjs` protegem estados separados. |
| Crossbow: carga/carregador unitário | Integrado para carregador unitário; pendente carga manual | Foguete tem1munição (`:27`) e projétil próprio (`:21`); não há arma cujo dano cresça enquanto segura antes de liberar. |
| Flame Cannon: fogo contínuo | Integrado | Lança-chamas (`:19`), `applyStatus:941`, `build-mechanics.cjs:25`, `audio-gameplay.cjs` e `player-weapons.cjs`. |
| Grenade Launcher: explosão/autoimpacto | Integrado para explosão; pendente disposição do autoimpacto | Granada explode por contato/fim de prazo (`:22`, tick projéteis), `weapon-evolution.cjs:45`. Explosões próprias não causam auto-dano no caminho atual; não há decisão local explícita suficiente para chamar esse aspecto “incompatível” ou “feito”. |
| Magic Bow: retorno associado à recarga | Adaptado diferente no retorno; pendente ligação à recarga | Disco retorna pela metade da vida útil, com velocidade/snapshot (`game.js:24`,`:1158`), contrato`:18`; `weapon-evolution.cjs:41`. A regra original do nosso disco é temporal, não consequência de recarregar. |
| Batgun: projétil perseguidor/escalas híbridas | Pendente | Drone escolhe alvo, mas não é bala perseguidora. Projetéis manuais atuais conservam direção, salvo retorno/ricochete explicitamente definidos. Não transformar mira manual em seleção automática por conveniência (`contrato:9`); homing pós-emissão exigiria desenho próprio e teste. |
| Salvo Knife: rastreamento favorecido por movimento | Integrado para dano cinético; pendente rastreamento | `speed`+`knock` converte movimento em dano limitado; `impact:1024`, `build-mechanics.cjs:30`. Não há projétil rastreador ligado à passada. |
| Watering Gun: tiros ativam entidade | Adaptado e validado funcionalmente na candidata61; aceite final1.0 aberto | Matriz de Rebites (`rivetMatrix`, `deployRivetMatrix`) é estação física ancorada manualmente, absorve balas e converte energia em ataque próprio de direção fixa. Não é Colimador, sensor nem contador de acertos em zumbis. Fórmulas/estados e casos: [contrato da Matriz](matriz-de-rebites.md). Geometria/orçamento/controles passaram nas suítes específicas; partidas canônicas8/10 e experimento de uso4/4 estão separados em build61-balance-summary.json. Não equivale a equilíbrio final. |
| Cyclone Sword: dano durante recarga | Adaptado funcionalmente para janela e duração na candidata62; gates finais abertos | Lâmina de Recarga converte duração efetiva em orçamento ofensivo frontal manual, por slot; DPS0,6P→1,2P e integral0,9PT. Drones/rotores continuam motores distintos. [Contrato e casos](lamina-de-recarga.md); engine/browser e provas naturais intermediárias registradas, com fontes distintas identificadas; coeficientes/entidade externos não são equivalência exata. Pistão adapta Katana ao fim na candidata64; validação final permanece aberta. |

### D. As12 conversões de sinergia pesquisadas

Fonte: `pesquisa-builds-20mtd.md:95`. Os nomes são índices do estudo; a UI usa sinergias originais em `game.js:454`.

| Conversão estudada | Disposição | Evidência própria ou limite |
|---|---|---|
| Death Rounds: velocidade/perfuração→dano plano | Integrado em eixos balísticos separados; pendente conversão exata | Perfuração e velocidade coexistem com dano; Motor Cinético usa velocidade do robô, não velocidade da bala/perfuração como entrada. `game.js:594`,`:615`, `impact:1024`. Não afirmar conversão equivalente. |
| Frost Fire: gelo aplica fogo | Adaptado diferente no híbrido elemental; pendente aplicação automática de fogo pelo gelo | Choque Térmico exige os dois estados já aplicados (`:611`, `tickStatuses:1059`), sensor só transmite estados instalados (`contrato:23`). `combat.cjs:260`, `sensors.cjs`. Regra atual permite híbrido sem conceder fogo por ter frio. |
| Gun Mastery: combinação balística | Integrado funcionalmente | Alto Impacto/Overdrive/Câmara Dupla/Perfuração e crítico de área; `game.js:594`–`:601`, `activeSynergies:454`; `positive-weapon-upgrades.cjs` e `build-mechanics.cjs:28`. |
| Mini Clip: menos munição→ciclo eficiente | Pendente como conversão específica | Carregador/recarga têm modificadores locais, mas não há combo que conceda eficiência por capacidade menor. Crítico reduz capacidade como custo e a cura é proporcional à reposição, sem explorar recarga de uma bala (`build-mechanics.cjs:14`–`:16`). |
| Overload: fogo+raio→explosão | Adaptado diferente no motor de área/eletricidade | PLASMA exige `blast`+`shock`, não fogo; `activeSynergies:454`, `explodeAt:1017`. A sinergia própria não precisa copiar pré-requisitos externos; restrições contra recursão são protegidas por `combat.cjs`. O nó `overload` do jogo é pós-dano e tem outra função; não identificá-lo pelo nome externo. |
| Stand your Ground: imobilidade→saturação | Pendente para ofensiva; motor defensivo distinto já integrado | Oficina Estacionária recupera vida depois3s parada (`game.js:605`, tick:1148). `combat.cjs:238` prova reparo e interrupção; não prova bônus de disparo por ficar parado. |
| Summon Mastery: ceder tiro→fortalecer suporte | Integrado no eixo funcional | Raiz drone aumenta recarga, Dupla reduz dano direto, Rotores reduzem dano direto, peças específicas reforçam suportes; `game.js:582`,`:632`–`:635`,`:80`–`:82`. Testes `build-mechanics.cjs:19`–`:23`/`rotors.cjs`. Não implica modificador único global de todos os summons. |
| Death Plague: morte→propagar carga | Adaptado diferente por limite deliberado | Respingo Reagente uma geração, dois vizinhos/100px, sem recursão; `game.js:592`,`:993`, contrato`:22`; `corrosion.cjs`. |
| Generator: reposição→cadência | Integrado para reposição; pendente conversão em cadência | Abate/eletricidade devolvem munição (`:925`,`:934`), mas não elevam cadência quando isso acontece. `fireInterval:540` só usa `frenzy` pós-dano. |
| Kunoichi: tempo sem dano→crescimento | Adaptação candidata63; aceite global/natural pendente | Circuito Preservado (`cleanCircuit`) cresce por15/30s ativos sem impactos, cartuchos+10/+20%máximo. Aquisição sem retroatividade; impacto aceito inclusive absorvido zera, inv/pausa não. Não equivale a crescimento externo ilimitado. [Contrato](reserva-e-manutencao.md); engine/browser controlados não aprovam naturais. |
| Sword and Shield: abate por pulso→proteger | Adaptação candidata63; aceite global/natural pendente | Retorno de Varredura (`pulseRecovery`) vincula abate direto do sensor a+4Banco/−8s de escudo, até3créditos por pulso. Escudo pronto não banca tempo; estados transmitidos/lacaios removidos não contam. [Contrato](reserva-e-manutencao.md); regressão global/pool/naturais ainda requeridos. |
| Titan: vida→presença/dano | Integrado funcionalmente | Chassi Titânico e Blindagem convertem3%HP máximo em dano, com teto75% da base (`shotDamage:541`, `game.js:603`); `build-mechanics.cjs:33`. Sem crescimento permanente fora da partida (`contrato:14`). |

### E. Sistemas de progressão e decisões de escopo

| Sistema do mapa/inventário | Disposição | Regra vigente e prova |
|---|---|---|
| XP, escolha de melhorias e10 receitas | Integrado; equilíbrio em avaliação | Catálogo52normais/82editáveis e10receitas em builds.js; contrato`:16`–`:19`; `build-mechanics.cjs`, `builds-balance.cjs`, relatórios52/53/54. Guia não altera sorteios. |
| Bênçãos iniciais | Adaptado diferente | Gambiarras3/6/9 (seis opções), por decisão vigente`:17`; `game.js:105`–`:112`, `offerBlessing:717`; `combat.cjs`. Não são runas de atributo pré-partida. |
| Tomos/recompensas de chefe | Adaptado diferente | Baú físico com16relíquias elegíveis temporárias na candidata62; fallback6experimentos/módulo; `game.js:76`–`:89` e `BOSS_EXPERIMENTS:114`, contrato`:13`; `boss-relics.cjs`/browser. Pedido posterior do criador esclareceu duração sóna partida; não restaurar obrigatoriamente custos em toda peça. |
| Metaprogressão/runas permanentes | Adaptado diferente em desbloqueios; não aplicável para bônus permanentes | Parafusos/peças persistem, compram equipamentos; atributos/skills não persistem (`contrato:14`,`:42`); `awardBossPart:145`, perfil/compras; `combat.cjs` compras/migração/reembolso/morte. |
| Especialização de personagem | Adaptado diferente |18protocolos próprios/seis chassis no10; `game.js:236`/`:284`, contrato`:17`; `combat.cjs` e `build-mechanics.cjs`. Não exige13personagens externos. |
| Evolução de arma | Adaptado diferente |24reforjas, duas por arma no20, conjunto fixo; contrato`:18`; `game.js:28`,`:30`, `chooseWeaponEvolution:253`; `weapon-evolution.cjs:47`. Não importar três opções externas por arma nem fusão/troca. |
| Reroll, compêndio, diagnóstico | Integrado | `rerollUpgrade:738`, `renderCompendium:563`, `renderRunStats`, contrato`:17`/`:19`; `combat.cjs:383`–`:400` e `weapon-evolution-browser.cjs` (guia/garagem/reforja). |
| Chefes, lacaios, horda | Adaptado diferente | Três identidades/ciclos, comuns continuam durante chefe, diretor cap60→180; contrato`:11`–`:13`. `horde-director.cjs`, `combat.cjs`. Não restaurar suspensão da horda do documento histórico. |
| Vitória cronometrada/loop pós-vitória | Não aplicável ao modo padrão | Arena infinita/semvitória por relógio; contrato`:8`/`:42`; `combat.cjs`25min controlados. “Partida20min” é janela de avaliação, não objetivo de vitória do jogo. |
| Retenção de skills após morrer/fusão de armas | Não aplicável | Proibição explícita`:42`, loadout fixo`:15`/`:18`; testes reset/reforja/perfil. |
| Ranking/nuvem/conquistas | Fora do protótipo conforme disposição atual; etapa futura | Contrato`:42`, mapa principal linha plataforma. Não é pendência de copiar sistemas da referência nesta implementação local. Implementar exigiria contrato de plataforma/integridade próprio. |
| Arte, nomes, personagens, trilhas e código externos | Não aplicável | Identidade original`:7`, regra de adaptação do mapa`:9`. Não importar conteúdo do estudo. |

### Pendências que a tabela torna explícitas

Agrupar em motores evita criar dezenas de features sópara imitar uma taxonomia externa:

1. **Maturação temporal de suporte: adaptada na BUILD58** pela Baia de Comando para drones. Outros suportes não recebem esse crescimento; isso não bloqueia os motores distintos abaixo.
2. **Conversão espacial de projéteis: adaptada na BUILD59** pelo Colimador. **Entidade alimentada por tiros (Watering): adaptada e validada funcionalmente na candidata61** pela Matriz de Rebites, estação independente com consumo de balas e ataque próprio. O campo continua modificando a bala, sem substituir esse motor. Testes de engine, cronologia, browser e uso natural experimental preservam evidências; a auditoria final continua aberta e exposição de alvo é motor distinto.
3. **Último tiro/ciclo de munição: publicado na BUILD60** pela Culatra, aguardando auditoria final. **Janela ofensiva exclusiva de recarga foi adaptada funcionalmente na candidata62** pela Lâmina, com engine/browser aprovados e naturais intermediárias9/10canônicas e1/4experimentais, fontes identificadas. Suportes sempre ativos e crítico do quinto tiro continuam distintos. Gates finais e equilíbrio permanecem abertos; Pistão ao terminar foi adaptado na candidata64, com entidade própria e evidência separada.
4. **Reserva de proteção e condições de manutenção: implementação candidata63** com quatro módulos normais distintos, Banco/Ponte/Circuito/Retorno, fórmulas finitas, fonte/ordem/snapshots e migração7. Engine24grupos e browser controlado3viewports tiveram resultados positivos; ainda faltam regressão homogênea, pacote e avaliação natural do pool alterado, sem aprovar gates finais. Isso não resolve outros motores nem constitui aprovação humana de qualidade. [Contrato completo](reserva-e-manutencao.md).
5. **Gatilhos específicos ainda sem disposição**, como recarga→atração, transformação temporal e crescimento acumulativo de estado. Não presumir que sejam compatíveis ou necessários sem projeto.

A tabela registra a disposição do inventário estudado e conserva pendências explícitas. Não autoriza declarar “todos os motores integrados”. Pela meta aprovada, todas as pendências compatíveis devem receber disposição concreta e ser resolvidas com custo operacional, HUD, fonte de dano, limites de recursão, pausa/reset, migração e avaliação natural. Não retirar itens por dificuldade ou escolher apenas os mais fáceis de testar. A decisão deve ampliar o jogo pretendido pelo criador, sem inventar requisitos de equivalência total à referência.


## Parte VII — verificação por requisito e item



## Checklist detalhado e rastreável

Os casos abaixo são instruções de aceitação, não uma lista de resultados aprovados. Todos começam como não executados no commit final. Resultados locais/históricos devem ser anexados separadamente e revalidados quando o código relevante mudar.

Fixtures de módulos: usar reset padrão do chassi/arma, adquirir previamente SOMENTE a cadeia de dependências do item e fotografar atributos antes da aplicação. Comparar ganho e custo às fórmulas da tabela, incluindo flags, gatilhos e efeitos por fonte. Não testar apenas se o callback retorna sem erro.

Testes naturais usam o protocolo da meta; testes de dano podem usar alvo imóvel/vida elevada, explicitamente declarados. Resultados desses dois tipos não são intercambiáveis.


### QA-FLOW-01 — Fluxo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: state/openGarage/reset/show/hurtPlayer e listeners de menu.
- **Comando/procedimento:** node tests/combat.cjs.
- **Preparação:** Perfil local vazio em contexto isolado; áudio ainda não autorizado.
- **Entradas e passos:** Abrir index.html offline; abrir garagem e selecionar PROT/Metralhadora.
- **Resultado esperado:** Menu e garagem abrem; PROT/Metralhadora disponíveis; demais equipamentos bloqueados; sem compra ou áudio automático.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Arquivo ausente, armazenamento bloqueado, recarregar página.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-FLOW-02 — Fluxo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: state/openGarage/reset/show/hurtPlayer e listeners de menu.
- **Comando/procedimento:** node tests/combat.cjs.
- **Preparação:** Garagem com equipamento válido e dimensões registradas.
- **Entradas e passos:** Escolher chassi/armas, abrir configuração, voltar, abrir novamente e iniciar.
- **Resultado esperado:** Equipamento confirmado é o da tentativa; nenhuma arma é concedida pelo guia; telas abrem no topo e focam título; arrays temporários novos.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-FLOW-03 — Fluxo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: state/openGarage/reset/show/hurtPlayer e listeners de menu.
- **Comando/procedimento:** node tests/combat.cjs.
- **Preparação:** Tentativa com módulos, relíquias, baús e projéteis ativos.
- **Entradas e passos:** Morrer; repetir configuração; depois voltar à garagem e iniciar com outro equipamento.
- **Resultado esperado:** Perfil persiste; módulos/relíquias/counters/filas/projéteis antigos somem; chassi e armas novos só após novo início.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-FLOW-04 — Fluxo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: state/openGarage/reset/show/hurtPlayer e listeners de menu.
- **Comando/procedimento:** node tests/combat.cjs.
- **Preparação:** Todas as telas de escolha disponíveis em fixtures separadas.
- **Entradas e passos:** Abrir melhoria, gambiarra, protocolo, reforja, relíquia e experimento; aceitar e recusar cada um.
- **Resultado esperado:** Cada tela mostra opções legais distintas, condição/custo/ganho; pausa real; uma escolha por token; recusa não retira recursos já conquistados.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Callbacks antigos, duplo clique, teclado mais clique, duas ofertas pendentes.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-INPUT-04 — Entrada
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: clearInput/syncTouchControls; touch-controls.js.
- **Comando/procedimento:** node tests/touch-controls-browser.cjs; node tests/touch-hybrid-browser.cjs.
- **Preparação:** Jogo em playing, mouse pressionado ou dois dedos capturados.
- **Entradas e passos:** Abrir pausa/escolha/morte antes de soltar; soltar sobre overlay; voltar e clicar de novo.
- **Resultado esperado:** Sem disparo/rajada/movimento residual; overlay recebe interação; novo clique funciona.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Cancelar ponteiro errado não cancela dono correto.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-INPUT-05 — Entrada
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: clearInput/syncTouchControls; touch-controls.js.
- **Comando/procedimento:** node tests/touch-controls-browser.cjs; node tests/touch-hybrid-browser.cjs.
- **Preparação:** Toque de mira ativo; teclado/mouse também disponíveis.
- **Entradas e passos:** Mover mouse passivamente, usar teclado, cancelar apenas um pad e ocultar a aba.
- **Resultado esperado:** Mouse passivo não rouba mira; teclado tem prioridade no movimento; outro dedo permanece correto; blur limpa e pausa.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Dois IDs trocados, pointercancel/lostpointercapture, rotação durante disparo.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-INPUT-06 — Entrada
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: clearInput/syncTouchControls; touch-controls.js.
- **Comando/procedimento:** node tests/touch-controls-browser.cjs; node tests/touch-hybrid-browser.cjs.
- **Preparação:** Propulsor não adquirido; depois adquirir em fixture legal.
- **Entradas e passos:** Pressionar Espaço antes/depois, repetir em cooldown e durante pausa.
- **Resultado esperado:** Antes: nada; depois avanço manual por0,15s e cooldown4s; não concede invulnerabilidade; estado pausado não ativa.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Sem vetor de movimento: usar direção de mira/fallback definido.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-PROG-01 — Progressão
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/upgrade/offerBlessing/offerSpecialization/offerWeaponEvolution.
- **Comando/procedimento:** node tests/combat.cjs; node tests/weapon-evolution.cjs.
- **Preparação:** Nível1, XP0, necessidade6, perfil separado.
- **Entradas e passos:** Coletar6XP; depois simular ganho suficiente para exceder próximo custo.
- **Resultado esperado:** Nível sobe; custo seguinte ceil(custo×1,2); excedente permanece; só uma oferta por vez; nenhum XP direto por chefe.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Dois níveis pendentes; baú simultâneo tem prioridade documentada.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-PROG-02 — Progressão
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/upgrade/offerBlessing/offerSpecialization/offerWeaponEvolution.
- **Comando/procedimento:** node tests/combat.cjs; node tests/weapon-evolution.cjs.
- **Preparação:** Nível imediatamente anterior a3/6/9/10/20.
- **Entradas e passos:** Atingir cada marco e resolver escolhas.
- **Resultado esperado:** Gambiarras3/6/9; protocolo do chassi10; reforja por slot20 substitui melhoria normal; voltar à simulação só após toda sequência.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Recusar reforja, múltiplos slots, token do slot anterior.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-PROG-03 — Progressão
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/upgrade/offerBlessing/offerSpecialization/offerWeaponEvolution.
- **Comando/procedimento:** node tests/combat.cjs; node tests/weapon-evolution.cjs.
- **Preparação:** Melhoria normal aberta, com uma renovação disponível.
- **Entradas e passos:** Renovar, tentar renovar novamente, instalar e alcançar outro nível.
- **Resultado esperado:** Uma renovação por nível normal; não reabastece a própria carga; callback descartado inválido; próxima carga só no nível seguinte.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-PROG-04 — Progressão
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/upgrade/offerBlessing/offerSpecialization/offerWeaponEvolution.
- **Comando/procedimento:** node tests/combat.cjs; node tests/weapon-evolution.cjs.
- **Preparação:** Todos os módulos elegíveis já adquiridos, ou dependências desativadas.
- **Entradas e passos:** Abrir oferta e resolver fallback/recusa.
- **Resultado esperado:** Sem loop infinito ou opção nula acionável; jogo continua e mantém progressão válida.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-SAVE-03 — Perfil
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: emptyProfile/loadProfile/saveProfile/purchaseGear.
- **Comando/procedimento:** node tests/combat.cjs.
- **Preparação:** Perfil novo, legado e JSON inválido em contextos separados.
- **Entradas e passos:** Carregar cada perfil, salvar e carregar novamente.
- **Resultado esperado:** Migração idempotente; esquema2; novos chassis não liberados por engano; inválido retorna default seguro; sem perda indevida em perfil válido.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-SAVE-04 — Perfil
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: emptyProfile/loadProfile/saveProfile/purchaseGear.
- **Comando/procedimento:** node tests/combat.cjs.
- **Preparação:** Equipamento bloqueado; saldo insuficiente, suficiente e save que falha.
- **Entradas e passos:** Comprar repetidamente e reabrir garagem.
- **Resultado esperado:** Sem saldo: rejeita; compra válida: debita exatamente preço/peça e libera uma vez; falha de gravação reverte tudo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-SAVE-05 — Perfil
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: emptyProfile/loadProfile/saveProfile/purchaseGear.
- **Comando/procedimento:** node tests/combat.cjs.
- **Preparação:** Recurso coletado durante combate, melhoria temporária ativa.
- **Entradas e passos:** Morrer, fechar página e reabrir perfil.
- **Resultado esperado:** Parafusos/peças e desbloqueios persistem; HP/dano/skills/relíquias/carga/evolução não persistem.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-EDITOR-01 — Editor
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** balance.js: validate/migrate/snapshot/apply/applyWeapon; editor local.
- **Comando/procedimento:** node tests/balance-panel.cjs; node tests/balance-migration.cjs.
- **Preparação:** Configuração default com86canônicos.
- **Entradas e passos:** Duplicar normal, editar efeito, aplicar e iniciar nova tentativa.
- **Resultado esperado:** Rascunho não afeta tentativa corrente; snapshot novo usa efeitos validados; flags especiais canônicas preservadas.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-EDITOR-02 — Editor
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** balance.js: validate/migrate/snapshot/apply/applyWeapon; editor local.
- **Comando/procedimento:** node tests/balance-panel.cjs; node tests/balance-migration.cjs.
- **Preparação:** Envelope válido e variações inválidas independentes.
- **Entradas e passos:** Importar IDs duplicados, ciclo, pai ausente, tipo especial customizado, operador desconhecido, divisor0, NaN e campo fora do limite.
- **Resultado esperado:** Todos os inválidos rejeitados com feedback; configuração anterior intacta; nenhuma execução de texto como script.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-EDITOR-03 — Editor
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** balance.js: validate/migrate/snapshot/apply/applyWeapon; editor local.
- **Comando/procedimento:** node tests/balance-panel.cjs; node tests/balance-migration.cjs.
- **Preparação:** Configurações legadas das revisões previstas.
- **Entradas e passos:** Migrar, exportar, importar e migrar novamente.
- **Resultado esperado:** Sem módulos duplicados; conflitos renomeados com referências redirecionadas; edições legítimas preservadas; segunda migração não altera resultado.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-EDITOR-04 — Editor
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** balance.js: validate/migrate/snapshot/apply/applyWeapon; editor local.
- **Comando/procedimento:** node tests/balance-panel.cjs; node tests/balance-migration.cjs.
- **Preparação:** Chassi com3armas e configuração editada de HP/dano/suportes.
- **Entradas e passos:** Aplicar módulo com efeitos compartilhados e de arma.
- **Resultado esperado:** HP/movimento/suporte aplicados uma vez; atributos de arma aplicados por slot; não triplicar vida nem cura.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-REFIT-00 — Reforja
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: installWeaponEvolution/chooseWeaponEvolution/WEAPON_EVOLUTIONS.
- **Comando/procedimento:** node tests/weapon-evolution.cjs.
- **Preparação:** Armas em recarga e projéteis emitidos antes da escolha.
- **Entradas e passos:** Alcançar20, instalar/recusar por slot, invocar callback antigo.
- **Resultado esperado:** Não repõe cartucho, não termina recarga, não reescreve projétil antigo; token do slot anterior não afeta o seguinte.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-PROFILE-06 — Perfil
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: emptyProfile/loadProfile/saveProfile/purchaseGear.
- **Comando/procedimento:** node tests/combat.cjs.
- **Preparação:** Navegador sem acesso a localStorage.
- **Entradas e passos:** Abrir jogo, jogar e tentar compra/importação.
- **Resultado esperado:** Jogo não fica em branco; aviso claro; compra não fica parcialmente debitada; nenhuma alegação falsa de save garantido.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-UI-01 — Interface
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** index.html/style.css/ui-redesign.css; updateHUD/renderRunStats.
- **Comando/procedimento:** node tests/rupture-chamber-browser.cjs (novo); validação visual.
- **Preparação:** Cada viewport1280×900,844×390,740×360; todos os overlays.
- **Entradas e passos:** Capturar topo/ação/recusa e rolar até última seção quando necessário.
- **Resultado esperado:** scrollWidth≤largura; ações essenciais dentro da tela ou alcançáveis; pista de rolagem quando conteúdo excede; sem sobreposição impeditiva.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Capturas + bounding boxes + ações reais.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-UI-02 — Interface
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** index.html/style.css/ui-redesign.css; updateHUD/renderRunStats.
- **Comando/procedimento:** node tests/rupture-chamber-browser.cjs (novo); validação visual.
- **Preparação:** Chefe ativo com lacaios; inimigos e baú muito distantes.
- **Entradas e passos:** Mover e aproximar; observar barras e minimapa.
- **Resultado esperado:** Barra de chefe alinhada; HP representa fração real; marcadores distantes na borda; chefes/baús não desaparecem; aproximação progressiva.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-UI-03 — Interface
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** index.html/style.css/ui-redesign.css; updateHUD/renderRunStats.
- **Comando/procedimento:** node tests/rupture-chamber-browser.cjs (novo); validação visual.
- **Preparação:** Culatra instalada em1/2/3slots; munições diferentes.
- **Entradas e passos:** Gastar cartuchos, chegar ao último e usarR; abrir pausa.
- **Resultado esperado:** Contador por arma; último mostra fator incluindo carga atual; R descarta só recarga válida; painel não mistura contador com crítico nem munição.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-AUDIO-03 — Áudio
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** audio.js: unlock/setScene/update/play/volumes.
- **Comando/procedimento:** node tests/audio.cjs; node tests/audio-gameplay.cjs.
- **Preparação:** Gesto inicial feito, depois mute e volumes extremos.
- **Entradas e passos:** Alternar menu/garagem/combate/pausa/morte20vezes e gerar eventos.
- **Resultado esperado:** Sem trilhas duplicadas; mute libera/silencia vozes; volumes0..1; limites de vozes respeitados; nenhum RNG de combate consumido.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-ART-03 — Apresentação
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** renderers de chassis/inimigos/armas; draw e helpers de sprite.
- **Comando/procedimento:** node tests/chassis-animation-browser.cjs; node tests/projectile-visuals.cjs.
- **Preparação:** Uma família de atlas/helper/imagem falhando por vez.
- **Entradas e passos:** Abrir fluxos e desenhar personagens/armas com fallback.
- **Resultado esperado:** Fallback mantém identidade básica e hitbox; falha de um asset não derruba outros; zero alteração da física.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P2.
- **Evidência:** Capturas e teste de mutação/RNG.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-PERF-PC — Desempenho
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** frame/tick/draw e medidor real de rAF.
- **Comando/procedimento:** QA manual instrumentado em hardware identificado; runner real final ainda pendente.
- **Preparação:** Hardware/OS/browser/energia identificados; cenários normais e de estresse congelados.
- **Entradas e passos:** Aba visível, aquecimento registrado,10min ativos por cenário; amostrar rAF e relógio simulado.
- **Resultado esperado:** PC: p95≤20ms normal e≤40ms estresse; razão simulado/real ativo0,95..1,05; registrar todos os frames.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Não inferir FPS de tick ou executar em background.
- **Falha:** P1.
- **Evidência:** Amostras brutas + hardware + clocks + percentis.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-PERF-PHONE — Desempenho
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** frame/tick/draw e medidor real de rAF.
- **Comando/procedimento:** QA manual instrumentado em hardware identificado; runner real final ainda pendente.
- **Preparação:** Celular físico identificado, orientação horizontal e controle real.
- **Entradas e passos:** Jogar10min ativos representativos e testar rotação/cancelamento.
- **Resultado esperado:** p95≤40ms, razão simulado/real0,95..1,05; zero controle preso ou clipping impeditivo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Emulação não satisfaz esta prova.
- **Falha:** P1.
- **Evidência:** Log no dispositivo + identificação + registro de interação.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-NATURAL-30 — Balanceamento
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** tests/builds-balance.cjs; tools/bot-pilot.js; run-observer.js.
- **Comando/procedimento:** node tests/builds-balance.cjs --real-only com protocolo final.
- **Preparação:** Dez receitas canônicas, fontes/piloto/config congelados; sementes20261130/20261201/20261202.
- **Entradas e passos:** Executar30tentativas de1200s ativos, mantendo todas as falhas.
- **Resultado esperado:** ≥27/30viáveis e cada receita≥2/3; viável requer1200s+3chefes+4skills centrais e nenhum erro.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Sem imunidade/dano/cura extra, morte forçada, pool injetado, spawn suspenso ou remoção de vivos.
- **Falha:** P1.
- **Evidência:** 30registros completos, choices aceitas, hashes, piloto, sementes.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-SOAK-60 — Estabilidade
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: frame/tick/reset e ciclos de chefe.
- **Comando/procedimento:** Runner60min final ainda pendente; combat.cjs25min é histórico parcial.
- **Preparação:** Fixture de estabilidade declarada; proteção permitida e identificada, sem contar como balanceamento.
- **Entradas e passos:** Executar3600s simulados, registrar estado e memória por minuto.
- **Resultado esperado:** Todos os ciclos de chefes; sem final automático; sem filas temporárias ilimitadas, números inválidos ou crash.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Não confundir sobrevivência protegida com partida natural.
- **Falha:** P1.
- **Evidência:** Log60min + contagens + memória + erros.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-ZIP-01 — Entrega
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** tools/check-release.cjs; Git/ZIP/Gmail.
- **Comando/procedimento:** node tools/check-release.cjs; smoke no ZIP extraído; git ls-remote.
- **Preparação:** ZIP do commit final; pasta nova; rede indisponível.
- **Entradas e passos:** Extrair, abrir index.html e percorrer fluxos; executar smoke tests no extraído.
- **Resultado esperado:** Nenhum recurso runtime ausente/remoto; sem dependência de outputs ou pasta original; save e áudio funcionais.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Node/Playwright são dependências só de teste, não do jogador.
- **Falha:** P1.
- **Evidência:** Hash do ZIP/commit + lista de recursos + logs/capturas.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-RELEASE-01 — Entrega
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** tools/check-release.cjs; Git/ZIP/Gmail.
- **Comando/procedimento:** node tools/check-release.cjs; smoke no ZIP extraído; git ls-remote.
- **Preparação:** Commit validado e canais conhecidos.
- **Entradas e passos:** Publicar e consultar hashes remotos; enviar relatório autorizado.
- **Resultado esperado:** main/dev mesmo hash final; branch pública só com aprovação; mensagem SENT registrada.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Não misturar commit de teste e commit publicado.
- **Falha:** P1.
- **Evidência:** git ls-remote + versão + ID da mensagem.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-SPEC-01 — Documentação
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** docs/SCREWVIVORS-ESPECIFICACAO-E-TESTES.md e matriz-verificacao.json.
- **Comando/procedimento:** node tools/check-specification.cjs + revisão semântica independente.
- **Preparação:** Markdown mestre separado do repositório; inventário final congelado.
- **Entradas e passos:** Uma IA/revisor lê somente o documento e identifica valores, fórmulas, estados e testes.
- **Resultado esperado:** Nenhum comportamento essencial depende exclusivamente de código original/links externos; lacunas explícitas impedem declarar G15concluído.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Revisão independente com perguntas e divergências.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-SNAPSHOT-01 — Snapshot
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: emitProjectiles/weaponSource/impact/damageEnemy.
- **Comando/procedimento:** Fixture pós-modificação em voo a implementar, mais weapon-state.cjs.
- **Preparação:** Uma arma, bala emitida com W0=22; depois alterar W0 sem alterar b.damage. Ativar Motor Cinético/Fratura em fixtures separadas.
- **Entradas e passos:** Comparar dano do impacto e componentes derivados em single; repetir com duas armas e directDamage capturado.
- **Resultado esperado:** b.damage/arma/traços antigos ficam inalterados; na implementação atual single usa W0ATUAL para fallback de Motor Cinético/Fratura, enquanto multi usa directDamage capturado. Não prometer snapshot universal que não existe.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Flags globais de skills continuam sendo condições atuais no impacto; diferenciar dado armazenado de regra avaliada depois.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-PELLET-ANGLE — Projéteis
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: emitProjectiles, leque e cap compartilhado.
- **Comando/procedimento:** tests/rupture-chamber.cjs + fixture angular explícita.
- **Preparação:** 399projéteis existentes, Escopeta com10pellets pedidos, mira θ=0.
- **Entradas e passos:** Emitir uma salva, guardar vx/vy e consumo.
- **Resultado esperado:** Exatamente1pellet e1cartucho; ângulo do único pellet=−S/2 do leque planejado, não0. Não recentralizar por haver sóuma vaga.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-UI-OUTLINE — Interface
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** index.html/style.css/ui-redesign.css; updateHUD/renderRunStats.
- **Comando/procedimento:** node tests/rupture-chamber-browser.cjs (novo); validação visual.
- **Preparação:** Culatra adquirida, munição1 e energia conhecida; reset CSS global carregado.
- **Entradas e passos:** Consultar getComputedStyle no número de munição, emitir/recargar e consultar novamente.
- **Resultado esperado:** Pronto: outlineStyle diferente de none, width1px e cor branco-ciano; após sair do estado: não manter indicação pronta. Verificar cascata!important, não apenas atributo data.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** O reset body.combat-screen * pode anular regras sem!important.
- **Falha:** P1.
- **Evidência:** Computed styles, screenshots e estado real de munição.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-UI-PRIMARY — Interface
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** index.html/style.css/ui-redesign.css; updateHUD/renderRunStats.
- **Comando/procedimento:** node tests/rupture-chamber-browser.cjs (novo); validação visual.
- **Preparação:** Janela desktop sem touch-active,1280×900,844×390e740×360; Culatra pronta em1/6.
- **Entradas e passos:** Medir linhas reais do texto com Range e interseção de munição/status com todos os ancestrais.
- **Resultado esperado:** Contagem em uma única linha; valor e aviso completos dentro dos recortes. Status fica em linha própria; títulos maiores não fazem a contagem ultrapassar caixa72px herdada.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar desktop estreito separadamente do contexto mobile; ausência de touch-active não é motivo para ignorar recorte.
- **Falha:** P1.
- **Evidência:** tests/rupture-chamber-browser.cjs: desktopPrimaryReadability + capturas.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-UI-CLIP — Interface
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** index.html/style.css/ui-redesign.css; updateHUD/renderRunStats.
- **Comando/procedimento:** node tests/rupture-chamber-browser.cjs (novo); validação visual.
- **Preparação:** 740×360, touch ativo e3armas; cada status com texto do último cartucho.
- **Entradas e passos:** Medir interseção com TODOS os ancestrais que clipam; rolar o HUD até a terceira arma por input real.
- **Resultado esperado:** Texto pode começar clipado em painel rolável, mas deve ficar alcançável após rolar; nenhum transbordamento horizontal ou pad bloqueado. BoundingBox dentro da viewport sozinho não aprova.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Overlay de pausa não deve ser usado como prova de acesso ao HUD em playing.
- **Falha:** P1.
- **Evidência:** Árvore de clipping, scrollTop, screenshots e ação de rolagem.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-SHIELD-SHOCK — Combate e mundo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/damageEnemy/impact/IA/horda/loot; helpers.
- **Comando/procedimento:** node tests/combat.cjs; testes específicos por caso.
- **Preparação:** Policial com escudo100 como alvo secundário de choque; fixtures de skill stun, protocolo groundPulse e ambos.
- **Entradas e passos:** Aplicar descarga com dano absorvido menor/igual/maior que100; depois novo choque no corpo.
- **Resultado esperado:** Golpe blindado não instala atordoamento nem na quebra; golpe posterior desprotegido instala. Não apagar estado anterior nem conceder recuperação de munição por dano absorvido.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Capturar proteção ANTES do dano elétrico; consultar shieldHp depois da quebra é tarde.
- **Falha:** P1.
- **Evidência:** tests/shield-shock.cjs:14fixtures; fonte anterior falha; fonte corrigida passa.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-HOSTILE-01 — Combate e mundo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/damageEnemy/impact/IA/horda/loot; helpers.
- **Comando/procedimento:** node tests/combat.cjs; testes específicos por caso.
- **Preparação:** Jogador invulnerável; um projétil hostil atravessando seu círculo no próximo tick.
- **Entradas e passos:** Executar o segmento de movimento e captura de HP/vida do projétil.
- **Resultado esperado:** HP não cai, mas o projétil que colide é consumido mesmo com invulnerabilidade. Com dano permitido, aplica uma vez e também é consumido.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Freio magnético definido pela posição inicial; vida diminui pelo dt inteiro, não pelo dt×0,75.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-BLADE-CAPTURE — Lâmina
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: startReload/tickReloadBlade/tickStatuses/drawReloadBlades/updateHUD e dano central.
- **Comando/procedimento:** node tests/reload-blade.cjs; node tests/reload-blade-browser.cjs.
- **Preparação:** Peça adquirida antes de uma recarga válida; alvo de HP elevado;12armas em fixtures isoladas.
- **Entradas e passos:** Iniciar recarga, capturar P, mudar atributos/reforja; repetir adquirindo no meio de recarga já em curso.
- **Resultado esperado:** P=clamp(shotDamage(slot)×min(400,max(1,floor(pellets×projectileMult))),0,1e9) capturado somente no início válido com peça. Captura anterior não muda; aquisição tardia só vale na próxima recarga.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Sem crítico/Culatra/reparo na captura; Titânico/armadura entra por shotDamage; carregador cheio/recarga ativa recusam sem orçamento.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-BLADE-INTEGRAL — Lâmina
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: startReload/tickReloadBlade/tickStatuses/drawReloadBlades/updateHUD e dano central.
- **Comando/procedimento:** node tests/reload-blade.cjs; node tests/reload-blade-browser.cjs.
- **Preparação:** Alvo imóvel sem escudo/modificadores globais dentro da cápsula; P e T conhecidos.
- **Entradas e passos:** Segurar fogo/mira toda janela e comparar passo único,60Hz,20Hz e partições irregulares; repetir soltando no meio.
- **Resultado esperado:** a=min(dt,r); u0=clamp(1-r/T); u1=clamp(u0+a/T); D=P×a×(0,6+0,3×(u0+u1)); integral total0,9PT. Trechos soltos não geram dano nem backlog.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** r<dt corta no fim; dt0/r0 não geram pulso; comparação de nominal sem escudo/finisher/chefe/marca.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-BLADE-PARTIAL — Lâmina
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: startReload/tickReloadBlade/tickStatuses/drawReloadBlades/updateHUD e dano central.
- **Comando/procedimento:** node tests/reload-blade.cjs; node tests/reload-blade-browser.cjs.
- **Preparação:** Mesma arma/P estável, quantidade total reposta igual; alvo imóvel.
- **Entradas e passos:** Comparar recarga cheia com soma de recargas de1cartucho, mantendo fogo durante cada janela; tentar R com carregador cheio.
- **Resultado esperado:** Orçamento0,9P×soma das durações efetivas; recargas pequenas não multiplicam referência nem ganham pulso de início/fim. Tentativa inválida não muda captura/munição.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Mudar dano intencionalmente entre janelas exige nova P; não confundir essa mudança com invariância de estado fixo.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-BLADE-GEOMETRY — Lâmina
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: startReload/tickReloadBlade/tickStatuses/drawReloadBlades/updateHUD e dano central.
- **Comando/procedimento:** node tests/reload-blade.cjs; node tests/reload-blade-browser.cjs.
- **Preparação:** Mira manual conhecida; inimigos em36/110px e nas margens laterais/raio; slots legais.
- **Entradas e passos:** Executar tick antes de mover jogador; testar alvo dentro/fora/atrás/tangente e mira esquerda/direita.
- **Resultado esperado:** Cápsula do segmento36..110 a partir de weaponOrigin, raio12 somado ao alvo; usa posição pré-movimento e direção manual. Nenhuma busca ou giro automático.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Uma arma offset0; multiarma offsets−16/+16/+32 perpendiculares.12modelos não alteram cápsula; não inferir hitbox da arte.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-BLADE-SLOTS — Lâmina
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: startReload/tickReloadBlade/tickStatuses/drawReloadBlades/updateHUD e dano central.
- **Comando/procedimento:** node tests/reload-blade.cjs; node tests/reload-blade-browser.cjs.
- **Preparação:** PROT1,BAST2,ENXA3slots distintos, com munições e timers diferentes.
- **Entradas e passos:** Recarregar todos e depois sóum; comparar captura/dano; reforjar durante janela em single e multi.
- **Resultado esperado:** Cada slot tem P/timer/geometria próprios; arma pronta não ataca. Reforja conserva exatamente reloadTime/reloadTotal e P correntes, novos modificadores só na próxima recarga.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Sem triplicar cura/atributos globais, copiar P primário para auxiliares, transferir munição/carga ou reescrever projéteis antigos.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-BLADE-SOURCES — Lâmina
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: startReload/tickReloadBlade/tickStatuses/drawReloadBlades/updateHUD e dano central.
- **Comando/procedimento:** node tests/reload-blade.cjs; node tests/reload-blade-browser.cjs.
- **Preparação:** Skills de impacto/procs/munição/salvage instaladas, globais em fixtures separadas; normal/chefe/marcado/resfriado.
- **Entradas e passos:** Matar somente com reloadBlade e capturar callbacks, munição, contadores, loot, cura e baú.
- **Resultado esperado:** Fonte reloadBlade passa pelo dano central; sem impact/estados/procs/killAmmo/salvage, consumo de reparo/munição/Culatra ou alimentação de Matriz. Globais finisher/bossHunter/marca/XP/loot/célula e recompensa/cura de chefe normais.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Chefe recompensa uma vez; não confundir global de morte com proc balístico; sem recursão ou crítico próprio.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-BLADE-SHIELD — Lâmina
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: startReload/tickReloadBlade/tickStatuses/drawReloadBlades/updateHUD e dano central.
- **Comando/procedimento:** node tests/reload-blade.cjs; node tests/reload-blade-browser.cjs.
- **Preparação:** Policial com escudo100; dano por tick abaixo/igual/acima100 e estados/procs equipados.
- **Entradas e passos:** Aplicar um tick e depois outro com corpo desprotegido, registrar shieldHp/hp/estados.
- **Resultado esperado:** Golpe blindado absorvido integralmente inclusive quebra, sem excedente no corpo ou estado novo. Próximo tick pode atingir corpo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Não fracionar um único tick para atravessar escudo; partição em ticks após quebra pode legitimamente mudar HP, separada da prova de integral nominal.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-BLADE-INPUT — Lâmina
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: startReload/tickReloadBlade/tickStatuses/drawReloadBlades/updateHUD e dano central.
- **Comando/procedimento:** node tests/reload-blade.cjs; node tests/reload-blade-browser.cjs.
- **Preparação:** Mouse e toque paisagem com dois pads; peça e recarga válidas; também contexto sem peça.
- **Entradas e passos:** Segurar/soltar fogo, cancelar ponteiro, blur, lostcapture, abrir escolha/pausa, morrer/reiniciar/rotacionar; tentar terceiro dedo nas ações existentes.
- **Resultado esperado:** Dano só durante playing com captura+recarga+firing+mira ativa. Transições limpam entrada, sem retomada automática; sem peça não há dano. Sem botão novo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Não exigir abandonar movimento/mira para recarregar; callbacks velhos não ativam motor.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-BLADE-PAUSE — Lâmina
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: startReload/tickReloadBlade/tickStatuses/drawReloadBlades/updateHUD e dano central.
- **Comando/procedimento:** node tests/reload-blade.cjs; node tests/reload-blade-browser.cjs.
- **Preparação:** Lâmina ativa com geometria armazenada; RNG conhecido.
- **Entradas e passos:** Pausar/desenhar100vezes; repetir ofertas/morte/reset e áudio mute.
- **Resultado esperado:** Pausa congela timers/dano/geometria; render não altera simulação/RNG e usa geometria armazenada. Reset remove peça/captura. Áudio não acumula vozes.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Sem mapa por alvo crescente ou backlog; estado limitado aos slots; input solto interrompe no próximo tick ativo.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-BLADE-SAVE-UI — Lâmina
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: startReload/tickReloadBlade/tickStatuses/drawReloadBlades/updateHUD e dano central.
- **Comando/procedimento:** node tests/reload-blade.cjs; node tests/reload-blade-browser.cjs.
- **Preparação:** Perfil legado/novo, peça temporária, editor carregado e3slots;1280×900,844×390,740×360.
- **Entradas e passos:** Morrer/reiniciar/exportar perfil/config; percorrer HUD/pausa/compêndio com interação real.
- **Resultado esperado:** Nenhuma captura/peça/timer no save permanente;19relíquias/105artigos no catálogo vivo, editor86. Estado de lâmina por arma legível e alcançável; nenhum botão extra ou pad obstruído.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Dados inválidos e armazenamento bloqueado; verificar clipping ancestral/rolagem, não só bounding box.
- **Falha:** P1.
- **Evidência:** Extração VM viva, logs de save, capturas, computed styles/clipping e interação.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MATRIX-DEPLOY — Matriz
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: deployRivetMatrix/tickRivetMatrix e pipeline físico de projéteis; touch-controls.js.
- **Comando/procedimento:** node tests/rivet-matrix.cjs; fixtures browser da Matriz.
- **Preparação:** Peça rivetMatrix obtida por oferta legal; mouse com ponto de mira conhecido; contextos sem peça/pausado em paralelo.
- **Entradas e passos:** PressionarE semrepeat ou acionar botão; testar distâncias47,999/48/180/180,001, vetor zero e tentativa enquanto há dispositivo.
- **Resultado esperado:** Somente playing+peça+direção ativa+faixa48..180permitem instalar exatamente no ponto do mundo; limite1; recusas não gastam munição/recarga/HP nem criam dispositivo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Entrada focada em controles de formulário, Esegurado, pausa, morte e recusa de oferta; não inventar bloqueio em piso decorativo.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MATRIX-BASE — Matriz
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: deployRivetMatrix/tickRivetMatrix e pipeline físico de projéteis; touch-controls.js.
- **Comando/procedimento:** node tests/rivet-matrix.cjs; fixtures browser da Matriz.
- **Preparação:** Instalar com cada uma das12armas primárias sem módulos; repetir Titânico com armadura e emissão multiarma.
- **Entradas e passos:** Capturar P ao instalar, mudar dano/pellets/reforja depois e observar limiar/teto/dano dos rebites.
- **Resultado esperado:** P=clamp(shotDamage primário×pellets planejados daquela arma,0.001,1e9), até400pellets; limiar2P, teto4P, orçamento de salva2,2P e dano por rebite2,2P/3. Alterações posteriores não reescrevem a instalação.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** P inclui componentes normais de shotDamage permitidos; sem crítico/Culatra/reparo de um disparo específico no referencialP.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MATRIX-FEED — Matriz
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: deployRivetMatrix/tickRivetMatrix e pipeline físico de projéteis; touch-controls.js.
- **Comando/procedimento:** node tests/rivet-matrix.cjs; fixtures browser da Matriz.
- **Preparação:** Matriz ativa e balas emitidas realmente, com tokens por cartucho; chassi legal de1/2/3armas.
- **Entradas e passos:** Atravessar entrada com parte/todos os pellets, rajada e fogo mantido; comparar energia ao dano das balas consumidas.
- **Resultado esperado:** Cada bala consumida contribui sóseu dano; pellets compartilham orçamento do cartucho efetivamente emitido, limitado×1,35para conversão espacial anterior. Burst tem unidade independente por munição; slots não multiplicam energia por contagem.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** 399balas e salva planejada10: somente1pellet emitido compõe o token, não o payload de10que não coube.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MATRIX-GEOMETRY — Matriz
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: deployRivetMatrix/tickRivetMatrix e pipeline físico de projéteis; touch-controls.js.
- **Comando/procedimento:** node tests/rivet-matrix.cjs; fixtures browser da Matriz.
- **Preparação:** Segmentos com entrada física da matriz e inimigo antes/depois; casco de escudo, ricochete e disco em mundos separados.
- **Entradas e passos:** Executar contatos de um tick e passos menores; inverter ordem de superfícies sem inventar ordem dos centros.
- **Resultado esperado:** Inimigo que encerra/ricocheteia a bala antes do aparelho impede alimentação. Contato real com aparelho consome a bala e impede corpo posterior; sem detonação/status/proc no ponto consumido.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Comparar regra de empate, raio do aparelho e raio da bala ao contrato detalhado; caminho sem peça mantém ordem legada.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MATRIX-TTL — Matriz
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: deployRivetMatrix/tickRivetMatrix e pipeline físico de projéteis; touch-controls.js.
- **Comando/procedimento:** node tests/rivet-matrix.cjs; fixtures browser da Matriz.
- **Preparação:** Bala chegando ao aparelho antes/no/depois de expirar; aparelho com vida restante menor que dt.
- **Entradas e passos:** Avançar um tick que atravessa geometricamente o aparelho mas cujo tempo de contato varia.
- **Resultado esperado:** Nenhuma absorção depois da vida da bala ou do aparelho. Expiração vence empate. Não conceder energia porque endpoint longo ultrapassou o aparelho após a janela válida.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Disco retornando e bala que começa dentro; dtgrande éfixture de limite, não desempenho real.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MATRIX-SPATIAL — Matriz
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: deployRivetMatrix/tickRivetMatrix e pipeline físico de projéteis; touch-controls.js.
- **Comando/procedimento:** node tests/rivet-matrix.cjs; fixtures browser da Matriz.
- **Preparação:** Culatra/crítico/reparo reais e Colimador antes/depois da entrada, com token e projétil identificados.
- **Entradas e passos:** Emitir, atravessar campo e depois alimentar; repetir entrada antes do campo.
- **Resultado esperado:** Energia deriva do dano capturado real acrescido de conversão espacial somente se ocorrida antes do consumo. Não converter rebite da entidade nem contar fator espacial duas vezes.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Corpo protegido antes do campo, ricochete, campo expirando e cartucho parcial; instantâneo do token não pode crescer por hits de alvo.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MATRIX-SALVO — Matriz
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: deployRivetMatrix/tickRivetMatrix e pipeline físico de projéteis; touch-controls.js.
- **Comando/procedimento:** node tests/rivet-matrix.cjs; fixtures browser da Matriz.
- **Preparação:** Energia alcança2P; alvo fora e dentro das três trajetórias; RNG monitorado.
- **Entradas e passos:** Observar emissões0/0,6/1,2s e mover inimigo/mira do jogador durante a salva.
- **Resultado esperado:** Três rebites com direção capturada no disparo de carga, leque±0,08rad, velocidade520px/s, raio4, alcance260px e orçamento total2,2P. Sem homing/retarget e sem movimento retroativo no tick de nascimento.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** No tick em que uma salva começa ativa, tiros do jogador não alimentam até o próximo tick mesmo se a salva termina durante aquele passo.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MATRIX-TIME — Matriz
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: deployRivetMatrix/tickRivetMatrix e pipeline físico de projéteis; touch-controls.js.
- **Comando/procedimento:** node tests/rivet-matrix.cjs; fixtures browser da Matriz.
- **Preparação:** Mundos determinísticos com mesmo contato de alimentação em instante conhecido, sem alvos nem limite cheio.
- **Entradas e passos:** Avançar o mesmo intervalo em um passo longo e em passos subdivididos; registrar instantes de contato/nascimento e trajetória residual.
- **Resultado esperado:** Salva é agendada a partir do instante físico do contato:0/0,6/1,2s, sem deslocar pelo dt inteiro quem nasceu no meio do passo. Expiração continua em18s ativos desde implantação e vence empate; diferenças de discretização não criam tiro extra.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Limitar tolerância ao contrato temporal; não usar número de ticks para esconder atraso de emissões.
- **Falha:** P1.
- **Evidência:** Fixtures whole/divided com tempos absolutos, posições e energia.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MATRIX-CAP — Matriz
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: deployRivetMatrix/tickRivetMatrix e pipeline físico de projéteis; touch-controls.js.
- **Comando/procedimento:** node tests/rivet-matrix.cjs; fixtures browser da Matriz.
- **Preparação:** 400projéteis totais; energia≥2P; depois liberar uma vaga; mundo separado onde a falta de vaga acontece no meio da salva.
- **Entradas e passos:** Tentar início cheio; iniciar com vaga; preencher antes do segundo/terceiro rebite e retomar.
- **Resultado esperado:** Início cheio conserva energia e não cria salva. Cada rebite compartilha teto400com balas manuais. Falta de vaga durante salva cancela restantes sem backlog/reembolso e sem remover vivos; nada reaparece atrasado depois.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Limites pertencem ao array compartilhado, não400manuais mais3da entidade.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MATRIX-SOURCES — Matriz
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: deployRivetMatrix/tickRivetMatrix e pipeline físico de projéteis; touch-controls.js.
- **Comando/procedimento:** node tests/rivet-matrix.cjs; fixtures browser da Matriz.
- **Preparação:** Inimigos comuns, chefe e policial com escudo; habilidades de proc/recuperação ativas.
- **Entradas e passos:** Alimentar e acertar com rebites; provocar abates e quebra do escudo.
- **Resultado esperado:** Consumo não chama impacto. Fonte matrix causa dano central e recompensa comum; não ativa crítico, exposição balística, estados, corrosão, ricochete, Colimador, killAmmo ou salvage. Escudo absorve inclusive quebra.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** XP/loot/contador de mortes e célula global de reparo continuam pela regra geral; bossHunter/finisher/marca são multiplicadores centrais explicitamente documentados, não novos procs.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MATRIX-LIFECYCLE — Matriz
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: deployRivetMatrix/tickRivetMatrix e pipeline físico de projéteis; touch-controls.js.
- **Comando/procedimento:** node tests/rivet-matrix.cjs; fixtures browser da Matriz.
- **Preparação:** Aparelho com vida18s e até3salvas; pausas/ofertas preparadas nos três instantes de emissão.
- **Entradas e passos:** Avançar relógio ativo, pausar, escolher, expirar e reinstalar; morrer/reiniciar em cada estado.
- **Resultado esperado:** Vida e emissões congelam fora de playing. Expiração ou limite de salvas remove dispositivo; nova instalação cria P/energia novos. Morte/reset limpa a tentativa; tokens vivem sócom balas, sem Map/Setglobal de IDs eterno.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Expiração no instante do último rebite não gera ataque após o fim; projéteis da entidade já emitidos seguem o contrato de limpeza/morte.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MATRIX-TIMEORDER — Matriz
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: deployRivetMatrix/tickRivetMatrix e pipeline físico de projéteis; touch-controls.js.
- **Comando/procedimento:** node tests/rivet-matrix.cjs; fixtures browser da Matriz.
- **Preparação:** Duas balas com tempos de entrada0,08s e0,02s em ordem inversa, energia préviaP, payloads diferentes.
- **Entradas e passos:** Comparar tick0,1 com dois ticks0,05; repetir com disco e pellets/slots se aplicável.
- **Resultado esperado:** Contato de0,02alimenta primeiro; energia, projétil consumido e início da salva coincidem. Ordenar apenas candidatos físicos, sem RNG e sem ordenar caminho sem dispositivo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Corpo terminal e TTL ainda podem impedir a absorção ordenada.
- **Falha:** P1.
- **Evidência:** tests/matrix-time-order.cjs + baseline-failure.json.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MATRIX-LASTEND — Matriz
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: deployRivetMatrix/tickRivetMatrix e pipeline físico de projéteis; touch-controls.js.
- **Comando/procedimento:** node tests/rivet-matrix.cjs; fixtures browser da Matriz.
- **Preparação:** Terceira salva termina1,2s; bala entra1,25s num passo1,1→1,3.
- **Entradas e passos:** Avançar o passo e observar corpo do dispositivo e bala posterior.
- **Resultado esperado:** Estação removida; bala posterior não some nem entrega energia ao dispositivo já concluído.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Expiração de18s e término por três salvas são condições independentes.
- **Falha:** P1.
- **Evidência:** tests/matrix-time-order.cjs.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MATRIX-INPUT — Matriz
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: deployRivetMatrix/tickRivetMatrix e pipeline físico de projéteis; touch-controls.js.
- **Comando/procedimento:** node tests/rivet-matrix.cjs; fixtures browser da Matriz.
- **Preparação:** Matriz adquirida; mouse/teclado e toque emulado com dois dedos emmove/aim; aparelho pronto ou ativo.
- **Entradas e passos:** Pressionar ação de matriz com terceiro dedo, cancelar sóele, perder foco, girar retrato, abrir pausa e reiniciar.
- **Resultado esperado:** Implantação não sequestra movimento/mira/disparo dos outros dedos. Botão indisponível não cria dispositivo; desaparecimento do botão libera somente seu próprio capture. Blur/transição limpa todos os comandos e não retoma sozinho.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Toque usa ponto180px na direção manual retida; ainda exige direção válida, sem escolher alvo automático.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MATRIX-UI — Matriz
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: deployRivetMatrix/tickRivetMatrix e pipeline físico de projéteis; touch-controls.js.
- **Comando/procedimento:** node tests/rivet-matrix.cjs; fixtures browser da Matriz.
- **Preparação:** 1280×900,844×390e740×360; arsenal1/2/3, peça pronta/carregando/descarregando.
- **Entradas e passos:** Capturar botão desktopE, touch-matrix, status, dispositivo e marcador do minimapa; rolar painel se preciso.
- **Resultado esperado:** Controles e status alcançáveis sem transbordamento; carga/limiar, tempo e salvas distinguíveis; dispositivo tem entrada/bobina legível e tiro próprio distinto. Nenhum botão essencial fica atrás dos pads.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** A forma do desenho não aumenta hitbox; status não deve anunciar mutações por frame em aria-live.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MATRIX-PURE — Matriz
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: deployRivetMatrix/tickRivetMatrix e pipeline físico de projéteis; touch-controls.js.
- **Comando/procedimento:** node tests/rivet-matrix.cjs; fixtures browser da Matriz.
- **Preparação:** Snapshot de todo estado de combate/RNG com e sem aparelho; posições e carga conhecidas.
- **Entradas e passos:** Desenhar100vezes, abrir pausa/diagnóstico e consultar HUD/minimapa semtick.
- **Resultado esperado:** Nenhum dano, energia, emissão, relógio, posição ou RNGdecombate muda por render/HUD. Caminho sem peça não cria tokens/filas nem custo de update de entidade.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Não contar efeitos ou IDs cosméticos como mudança física; ainda comparar campos relevantes e próximos sorteios.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-RESERVE-01 — Reserva
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/addReserve/hurtPlayer/healPlayer/maintenanceFactor/tickSensor/tickStatuses/updateHUD; balance.js revisão7.
- **Comando/procedimento:** node tests/maintenance-gameplay.cjs; node tests/maintenance-migration.cjs; node tests/maintenance-browser.cjs; naturais finais pendentes.
- **Preparação:** Fixture declarada com estado, equipamento e fonte registrados; não conta como partida natural.
- **Entradas e passos:** Adquirir raiz com HP50/100, munição parcial e recarga ativa
- **Resultado esperado:** HP50, reserva20/40, custo aplicado uma vez, timers/munição/snapshots preservados
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar fórmulas, ordem, limites e fontes da ParteIII-C. Valores experimentais não aprovam equilíbrio.
- **Falha:** P1.
- **Evidência:** Logs/snapshots numéricos antes e depois, hash, fonte e comando; capturas e interação quando há UI.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-RESERVE-02 — Reserva
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/addReserve/hurtPlayer/healPlayer/maintenanceFactor/tickSensor/tickStatuses/updateHUD; balance.js revisão7.
- **Comando/procedimento:** node tests/maintenance-gameplay.cjs; node tests/maintenance-migration.cjs; node tests/maintenance-browser.cjs; naturais finais pendentes.
- **Preparação:** Fixture declarada com estado, equipamento e fonte registrados; não conta como partida natural.
- **Entradas e passos:** Sem módulos novos, reproduzir mundos legados
- **Resultado esperado:** Estado/efeitos/dano/RNG iguais ao comportamento anterior, excluindo correções explicitamente versionadas
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar fórmulas, ordem, limites e fontes da ParteIII-C. Valores experimentais não aprovam equilíbrio.
- **Falha:** P1.
- **Evidência:** Logs/snapshots numéricos antes e depois, hash, fonte e comando; capturas e interação quando há UI.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-RESERVE-03 — Reserva
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/addReserve/hurtPlayer/healPlayer/maintenanceFactor/tickSensor/tickStatuses/updateHUD; balance.js revisão7.
- **Comando/procedimento:** node tests/maintenance-gameplay.cjs; node tests/maintenance-migration.cjs; node tests/maintenance-browser.cjs; naturais finais pendentes.
- **Preparação:** Fixture declarada com estado, equipamento e fonte registrados; não conta como partida natural.
- **Entradas e passos:** Reserva20; golpes12,12 separados por fim de inv
- **Resultado esperado:** 20→8→0; HP100→100→96; empurrão em ambos; sem procs no primeiro
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar fórmulas, ordem, limites e fontes da ParteIII-C. Valores experimentais não aprovam equilíbrio.
- **Falha:** P1.
- **Evidência:** Logs/snapshots numéricos antes e depois, hash, fonte e comando; capturas e interação quando há UI.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-RESERVE-04 — Reserva
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/addReserve/hurtPlayer/healPlayer/maintenanceFactor/tickSensor/tickStatuses/updateHUD; balance.js revisão7.
- **Comando/procedimento:** node tests/maintenance-gameplay.cjs; node tests/maintenance-migration.cjs; node tests/maintenance-browser.cjs; naturais finais pendentes.
- **Preparação:** Fixture declarada com estado, equipamento e fonte registrados; não conta como partida natural.
- **Entradas e passos:** Armadura2, Grounding, repairArmor; fontes diferentes
- **Resultado esperado:** Mitigação aplicada uma vez, mínimo1 antes da reserva; valores finitos
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar fórmulas, ordem, limites e fontes da ParteIII-C. Valores experimentais não aprovam equilíbrio.
- **Falha:** P1.
- **Evidência:** Logs/snapshots numéricos antes e depois, hash, fonte e comando; capturas e interação quando há UI.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-RESERVE-05 — Reserva
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/addReserve/hurtPlayer/healPlayer/maintenanceFactor/tickSensor/tickStatuses/updateHUD; balance.js revisão7.
- **Comando/procedimento:** node tests/maintenance-gameplay.cjs; node tests/maintenance-migration.cjs; node tests/maintenance-browser.cjs; naturais finais pendentes.
- **Preparação:** Fixture declarada com estado, equipamento e fonte registrados; não conta como partida natural.
- **Entradas e passos:** Escudo pronto+reserva20, golpe enorme
- **Resultado esperado:** Somente escudo consumido,120s/.25s; reserva/HP intactos; manutenção zerada
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar fórmulas, ordem, limites e fontes da ParteIII-C. Valores experimentais não aprovam equilíbrio.
- **Falha:** P1.
- **Evidência:** Logs/snapshots numéricos antes e depois, hash, fonte e comando; capturas e interação quando há UI.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-RESERVE-06 — Reserva
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/addReserve/hurtPlayer/healPlayer/maintenanceFactor/tickSensor/tickStatuses/updateHUD; balance.js revisão7.
- **Comando/procedimento:** node tests/maintenance-gameplay.cjs; node tests/maintenance-migration.cjs; node tests/maintenance-browser.cjs; naturais finais pendentes.
- **Preparação:** Fixture declarada com estado, equipamento e fonte registrados; não conta como partida natural.
- **Entradas e passos:** Guard de inv/pausa/morto; repetir contato
- **Resultado esperado:** Nenhum consumo/reset/empurrão/proc; sem cura da morte
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar fórmulas, ordem, limites e fontes da ParteIII-C. Valores experimentais não aprovam equilíbrio.
- **Falha:** P1.
- **Evidência:** Logs/snapshots numéricos antes e depois, hash, fonte e comando; capturas e interação quando há UI.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-RESERVE-07 — Reserva
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/addReserve/hurtPlayer/healPlayer/maintenanceFactor/tickSensor/tickStatuses/updateHUD; balance.js revisão7.
- **Comando/procedimento:** node tests/maintenance-gameplay.cjs; node tests/maintenance-migration.cjs; node tests/maintenance-browser.cjs; naturais finais pendentes.
- **Preparação:** Fixture declarada com estado, equipamento e fonte registrados; não conta como partida natural.
- **Entradas e passos:** Reserva insuficiente e golpe fatal/não fatal
- **Resultado esperado:** Excedente em HP; reações antigas sóse HPcai e sobrevive; limpeza correta
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar fórmulas, ordem, limites e fontes da ParteIII-C. Valores experimentais não aprovam equilíbrio.
- **Falha:** P1.
- **Evidência:** Logs/snapshots numéricos antes e depois, hash, fonte e comando; capturas e interação quando há UI.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-RESERVE-08 — Reserva
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/addReserve/hurtPlayer/healPlayer/maintenanceFactor/tickSensor/tickStatuses/updateHUD; balance.js revisão7.
- **Comando/procedimento:** node tests/maintenance-gameplay.cjs; node tests/maintenance-migration.cjs; node tests/maintenance-browser.cjs; naturais finais pendentes.
- **Preparação:** Fixture declarada com estado, equipamento e fonte registrados; não conta como partida natural.
- **Entradas e passos:** Cura10 com HP95/100 e reserva20
- **Resultado esperado:** HP100, ganho2,5reserva; retorno5; especializações de cura sópela parcela5
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar fórmulas, ordem, limites e fontes da ParteIII-C. Valores experimentais não aprovam equilíbrio.
- **Falha:** P1.
- **Evidência:** Logs/snapshots numéricos antes e depois, hash, fonte e comando; capturas e interação quando há UI.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-RESERVE-09 — Reserva
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/addReserve/hurtPlayer/healPlayer/maintenanceFactor/tickSensor/tickStatuses/updateHUD; balance.js revisão7.
- **Comando/procedimento:** node tests/maintenance-gameplay.cjs; node tests/maintenance-migration.cjs; node tests/maintenance-browser.cjs; naturais finais pendentes.
- **Preparação:** Fixture declarada com estado, equipamento e fonte registrados; não conta como partida natural.
- **Entradas e passos:** Cura10 em HPcheio; reserva39
- **Resultado esperado:** Sóganho1reserva; retorno0; sem repairCharge/repairPlating; resto descartado
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar fórmulas, ordem, limites e fontes da ParteIII-C. Valores experimentais não aprovam equilíbrio.
- **Falha:** P1.
- **Evidência:** Logs/snapshots numéricos antes e depois, hash, fonte e comando; capturas e interação quando há UI.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-RESERVE-10 — Reserva
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/addReserve/hurtPlayer/healPlayer/maintenanceFactor/tickSensor/tickStatuses/updateHUD; balance.js revisão7.
- **Comando/procedimento:** node tests/maintenance-gameplay.cjs; node tests/maintenance-migration.cjs; node tests/maintenance-browser.cjs; naturais finais pendentes.
- **Preparação:** Fixture declarada com estado, equipamento e fonte registrados; não conta como partida natural.
- **Entradas e passos:** Cura0/negativa/NaN/Infinity ou soma extrema configurada
- **Resultado esperado:** Guard finito; nenhum estado inválido; sem laço de cura
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar fórmulas, ordem, limites e fontes da ParteIII-C. Valores experimentais não aprovam equilíbrio.
- **Falha:** P1.
- **Evidência:** Logs/snapshots numéricos antes e depois, hash, fonte e comando; capturas e interação quando há UI.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-RESERVE-11 — Reserva
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/addReserve/hurtPlayer/healPlayer/maintenanceFactor/tickSensor/tickStatuses/updateHUD; balance.js revisão7.
- **Comando/procedimento:** node tests/maintenance-gameplay.cjs; node tests/maintenance-migration.cjs; node tests/maintenance-browser.cjs; naturais finais pendentes.
- **Preparação:** Fixture declarada com estado, equipamento e fonte registrados; não conta como partida natural.
- **Entradas e passos:** shieldDrive antes/depois de gastar/restaurar escudo
- **Resultado esperado:** Fator1,2/1/1,2 sem multiplicação acumulativa, por1/2/3armas
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar fórmulas, ordem, limites e fontes da ParteIII-C. Valores experimentais não aprovam equilíbrio.
- **Falha:** P1.
- **Evidência:** Logs/snapshots numéricos antes e depois, hash, fonte e comando; capturas e interação quando há UI.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-RESERVE-12 — Reserva
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/addReserve/hurtPlayer/healPlayer/maintenanceFactor/tickSensor/tickStatuses/updateHUD; balance.js revisão7.
- **Comando/procedimento:** node tests/maintenance-gameplay.cjs; node tests/maintenance-migration.cjs; node tests/maintenance-browser.cjs; naturais finais pendentes.
- **Preparação:** Fixture declarada com estado, equipamento e fonte registrados; não conta como partida natural.
- **Entradas e passos:** cleanCircuit em14,999/15/29,999/30s; várias partições dt
- **Resultado esperado:** Estágios0/1/1/2; tempo≤30; pausa/ofertas/aquisição não dão crédito retroativo
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar fórmulas, ordem, limites e fontes da ParteIII-C. Valores experimentais não aprovam equilíbrio.
- **Falha:** P1.
- **Evidência:** Logs/snapshots numéricos antes e depois, hash, fonte e comando; capturas e interação quando há UI.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-RESERVE-13 — Reserva
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/addReserve/hurtPlayer/healPlayer/maintenanceFactor/tickSensor/tickStatuses/updateHUD; balance.js revisão7.
- **Comando/procedimento:** node tests/maintenance-gameplay.cjs; node tests/maintenance-migration.cjs; node tests/maintenance-browser.cjs; naturais finais pendentes.
- **Preparação:** Fixture declarada com estado, equipamento e fonte registrados; não conta como partida natural.
- **Entradas e passos:** Impacto absorvido por reserva/escudo e impacto bloqueado por inv
- **Resultado esperado:** Primeiros zeram; terceiro não zera; bônus de projétil antigo preservado
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar fórmulas, ordem, limites e fontes da ParteIII-C. Valores experimentais não aprovam equilíbrio.
- **Falha:** P1.
- **Evidência:** Logs/snapshots numéricos antes e depois, hash, fonte e comando; capturas e interação quando há UI.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-RESERVE-14 — Reserva
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/addReserve/hurtPlayer/healPlayer/maintenanceFactor/tickSensor/tickStatuses/updateHUD; balance.js revisão7.
- **Comando/procedimento:** node tests/maintenance-gameplay.cjs; node tests/maintenance-migration.cjs; node tests/maintenance-browser.cjs; naturais finais pendentes.
- **Preparação:** Fixture declarada com estado, equipamento e fonte registrados; não conta como partida natural.
- **Entradas e passos:** Compor clean+intact+Titan+crítico+Culatra+Colimador
- **Resultado esperado:** Fatores aplicados uma única vez, snapshot local; teto próprio1,44 não confundido com DPS
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar fórmulas, ordem, limites e fontes da ParteIII-C. Valores experimentais não aprovam equilíbrio.
- **Falha:** P1.
- **Evidência:** Logs/snapshots numéricos antes e depois, hash, fonte e comando; capturas e interação quando há UI.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-RESERVE-15 — Reserva
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/addReserve/hurtPlayer/healPlayer/maintenanceFactor/tickSensor/tickStatuses/updateHUD; balance.js revisão7.
- **Comando/procedimento:** node tests/maintenance-gameplay.cjs; node tests/maintenance-migration.cjs; node tests/maintenance-browser.cjs; naturais finais pendentes.
- **Preparação:** Fixture declarada com estado, equipamento e fonte registrados; não conta como partida natural.
- **Entradas e passos:** Adquirir/partir bônus durante recarga/implantação
- **Resultado esperado:** Lâmina/Matriz mantêmPcapturado; futuras capturas usam estado novo; drones/sensor/rotores sem bônus acidental
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar fórmulas, ordem, limites e fontes da ParteIII-C. Valores experimentais não aprovam equilíbrio.
- **Falha:** P1.
- **Evidência:** Logs/snapshots numéricos antes e depois, hash, fonte e comando; capturas e interação quando há UI.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-RESERVE-16 — Reserva
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/addReserve/hurtPlayer/healPlayer/maintenanceFactor/tickSensor/tickStatuses/updateHUD; balance.js revisão7.
- **Comando/procedimento:** node tests/maintenance-gameplay.cjs; node tests/maintenance-migration.cjs; node tests/maintenance-browser.cjs; naturais finais pendentes.
- **Preparação:** Fixture declarada com estado, equipamento e fonte registrados; não conta como partida natural.
- **Entradas e passos:** Pulso com0/1/3/10abates
- **Resultado esperado:** Ganho0/4/12/12reserva e redução0/8/24/24s; sem teto artificial de dano/alvos
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar fórmulas, ordem, limites e fontes da ParteIII-C. Valores experimentais não aprovam equilíbrio.
- **Falha:** P1.
- **Evidência:** Logs/snapshots numéricos antes e depois, hash, fonte e comando; capturas e interação quando há UI.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-RESERVE-17 — Reserva
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/addReserve/hurtPlayer/healPlayer/maintenanceFactor/tickSensor/tickStatuses/updateHUD; balance.js revisão7.
- **Comando/procedimento:** node tests/maintenance-gameplay.cjs; node tests/maintenance-migration.cjs; node tests/maintenance-browser.cjs; naturais finais pendentes.
- **Preparação:** Fixture declarada com estado, equipamento e fonte registrados; não conta como partida natural.
- **Entradas e passos:** Sensor quebra escudo, burn mata depois; outros suportes matam
- **Resultado esperado:** Nenhuma recompensa de abate direto do sensor
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar fórmulas, ordem, limites e fontes da ParteIII-C. Valores experimentais não aprovam equilíbrio.
- **Falha:** P1.
- **Evidência:** Logs/snapshots numéricos antes e depois, hash, fonte e comando; capturas e interação quando há UI.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-RESERVE-18 — Reserva
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/addReserve/hurtPlayer/healPlayer/maintenanceFactor/tickSensor/tickStatuses/updateHUD; balance.js revisão7.
- **Comando/procedimento:** node tests/maintenance-gameplay.cjs; node tests/maintenance-migration.cjs; node tests/maintenance-browser.cjs; naturais finais pendentes.
- **Preparação:** Fixture declarada com estado, equipamento e fonte registrados; não conta como partida natural.
- **Entradas e passos:** Sensor mata chefe e remove lacaios
- **Resultado esperado:** Umabate creditado, baú/peça/cura únicos; sem crédito por lacaios removidos
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar fórmulas, ordem, limites e fontes da ParteIII-C. Valores experimentais não aprovam equilíbrio.
- **Falha:** P1.
- **Evidência:** Logs/snapshots numéricos antes e depois, hash, fonte e comando; capturas e interação quando há UI.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-RESERVE-19 — Reserva
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/addReserve/hurtPlayer/healPlayer/maintenanceFactor/tickSensor/tickStatuses/updateHUD; balance.js revisão7.
- **Comando/procedimento:** node tests/maintenance-gameplay.cjs; node tests/maintenance-migration.cjs; node tests/maintenance-browser.cjs; naturais finais pendentes.
- **Preparação:** Fixture declarada com estado, equipamento e fonte registrados; não conta como partida natural.
- **Entradas e passos:** Timer de escudo7s + umabate de sensor
- **Resultado esperado:** Timer0/pronto; bônus disponível sópara emissões seguintes; sem crédito bancado
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar fórmulas, ordem, limites e fontes da ParteIII-C. Valores experimentais não aprovam equilíbrio.
- **Falha:** P1.
- **Evidência:** Logs/snapshots numéricos antes e depois, hash, fonte e comando; capturas e interação quando há UI.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-RESERVE-20 — Reserva
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/addReserve/hurtPlayer/healPlayer/maintenanceFactor/tickSensor/tickStatuses/updateHUD; balance.js revisão7.
- **Comando/procedimento:** node tests/maintenance-gameplay.cjs; node tests/maintenance-migration.cjs; node tests/maintenance-browser.cjs; naturais finais pendentes.
- **Preparação:** Fixture declarada com estado, equipamento e fonte registrados; não conta como partida natural.
- **Entradas e passos:** Guardas, chamadas repetidas em morto, pulso atrasado
- **Resultado esperado:** Sem duplicação, sem backlog, sem novos pulsos/procs/RNG
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar fórmulas, ordem, limites e fontes da ParteIII-C. Valores experimentais não aprovam equilíbrio.
- **Falha:** P1.
- **Evidência:** Logs/snapshots numéricos antes e depois, hash, fonte e comando; capturas e interação quando há UI.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-RESERVE-21 — Reserva
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/addReserve/hurtPlayer/healPlayer/maintenanceFactor/tickSensor/tickStatuses/updateHUD; balance.js revisão7.
- **Comando/procedimento:** node tests/maintenance-gameplay.cjs; node tests/maintenance-migration.cjs; node tests/maintenance-browser.cjs; naturais finais pendentes.
- **Preparação:** Fixture declarada com estado, equipamento e fonte registrados; não conta como partida natural.
- **Entradas e passos:** Resets, morrer/garagem/repetir e profile roundtrip
- **Resultado esperado:** Nenhum atributo/estado temporário salvo ou transferido
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar fórmulas, ordem, limites e fontes da ParteIII-C. Valores experimentais não aprovam equilíbrio.
- **Falha:** P1.
- **Evidência:** Logs/snapshots numéricos antes e depois, hash, fonte e comando; capturas e interação quando há UI.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-RESERVE-22 — Reserva
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/addReserve/hurtPlayer/healPlayer/maintenanceFactor/tickSensor/tickStatuses/updateHUD; balance.js revisão7.
- **Comando/procedimento:** node tests/maintenance-gameplay.cjs; node tests/maintenance-migration.cjs; node tests/maintenance-browser.cjs; naturais finais pendentes.
- **Preparação:** Fixture declarada com estado, equipamento e fonte registrados; não conta como partida natural.
- **Entradas e passos:** Migrações1..6, colisões customizadas e referências vazias
- **Resultado esperado:** Preservação/idempotência e inclusão dos4IDs apenas como catálogo
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar fórmulas, ordem, limites e fontes da ParteIII-C. Valores experimentais não aprovam equilíbrio.
- **Falha:** P1.
- **Evidência:** Logs/snapshots numéricos antes e depois, hash, fonte e comando; capturas e interação quando há UI.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-RESERVE-23 — Reserva
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/addReserve/hurtPlayer/healPlayer/maintenanceFactor/tickSensor/tickStatuses/updateHUD; balance.js revisão7.
- **Comando/procedimento:** node tests/maintenance-gameplay.cjs; node tests/maintenance-migration.cjs; node tests/maintenance-browser.cjs; naturais finais pendentes.
- **Preparação:** Fixture declarada com estado, equipamento e fonte registrados; não conta como partida natural.
- **Entradas e passos:** Três viewports e mouse/touch simultâneo; pausa/retrato
- **Resultado esperado:** Barra acessível, sem overflow, ações intactas, sem retomada automática
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar fórmulas, ordem, limites e fontes da ParteIII-C. Valores experimentais não aprovam equilíbrio.
- **Falha:** P1.
- **Evidência:** Logs/snapshots numéricos antes e depois, hash, fonte e comando; capturas e interação quando há UI.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-RESERVE-24 — Reserva
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/addReserve/hurtPlayer/healPlayer/maintenanceFactor/tickSensor/tickStatuses/updateHUD; balance.js revisão7.
- **Comando/procedimento:** node tests/maintenance-gameplay.cjs; node tests/maintenance-migration.cjs; node tests/maintenance-browser.cjs; naturais finais pendentes.
- **Preparação:** Fixture declarada com estado, equipamento e fonte registrados; não conta como partida natural.
- **Entradas e passos:** Repetir desenho/audio/mute, muitosabates
- **Resultado esperado:** Render puro, cues limitados, sem RNGou crescimento ilimitado de vozes/efeitos
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar fórmulas, ordem, limites e fontes da ParteIII-C. Valores experimentais não aprovam equilíbrio.
- **Falha:** P1.
- **Evidência:** Logs/snapshots numéricos antes e depois, hash, fonte e comando; capturas e interação quando há UI.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-PISTON-01 — Pistão
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: startReload/tickWeaponReload/finishReloadPiston/tickReloadPiston/drawReloadPistons/renderPistonHUD.
- **Comando/procedimento:** node tests/reload-piston.cjs; node tests/reload-piston-browser.cjs; node tests/reload-piston-audio.cjs.
- **Preparação:** Fixture e fonte identificadas; não representa partida natural.
- **Entradas e passos:** 12armas; recarga cheia e de1cartucho
- **Resultado esperado:** Pcapturado finito;D=0,9Pf; sem entidade antes de completar
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Contrato completo da ParteIII-D; declarar origem pré-movimento e limitaçãoP2.
- **Falha:** P1.
- **Evidência:** Estado/relógios/dano/contatos antes/depois, hash, logs e capturas; procedimento real quando aplicável.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-PISTON-02 — Pistão
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: startReload/tickWeaponReload/finishReloadPiston/tickReloadPiston/drawReloadPistons/renderPistonHUD.
- **Comando/procedimento:** node tests/reload-piston.cjs; node tests/reload-piston-browser.cjs; node tests/reload-piston-audio.cjs.
- **Preparação:** Fixture e fonte identificadas; não representa partida natural.
- **Entradas e passos:** Rcom carregador cheio ou repetido
- **Resultado esperado:** Nenhuma captura/invocação/renovação indevida
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Contrato completo da ParteIII-D; declarar origem pré-movimento e limitaçãoP2.
- **Falha:** P1.
- **Evidência:** Estado/relógios/dano/contatos antes/depois, hash, logs e capturas; procedimento real quando aplicável.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-PISTON-03 — Pistão
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: startReload/tickWeaponReload/finishReloadPiston/tickReloadPiston/drawReloadPistons/renderPistonHUD.
- **Comando/procedimento:** node tests/reload-piston.cjs; node tests/reload-piston-browser.cjs; node tests/reload-piston-audio.cjs.
- **Preparação:** Fixture e fonte identificadas; não representa partida natural.
- **Entradas e passos:** Adquirir peça durante recarga
- **Resultado esperado:** Sem efeito retroativo; próxima recarga válida captura
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Contrato completo da ParteIII-D; declarar origem pré-movimento e limitaçãoP2.
- **Falha:** P1.
- **Evidência:** Estado/relógios/dano/contatos antes/depois, hash, logs e capturas; procedimento real quando aplicável.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-PISTON-04 — Pistão
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: startReload/tickWeaponReload/finishReloadPiston/tickReloadPiston/drawReloadPistons/renderPistonHUD.
- **Comando/procedimento:** node tests/reload-piston.cjs; node tests/reload-piston-browser.cjs; node tests/reload-piston-audio.cjs.
- **Preparação:** Fixture e fonte identificadas; não representa partida natural.
- **Entradas e passos:** Mira inativa, nula, inválida e válida sem disparo
- **Resultado esperado:** Só última invoca; sem busca automática ou espera de mira futura
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Contrato completo da ParteIII-D; declarar origem pré-movimento e limitaçãoP2.
- **Falha:** P1.
- **Evidência:** Estado/relógios/dano/contatos antes/depois, hash, logs e capturas; procedimento real quando aplicável.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-PISTON-05 — Pistão
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: startReload/tickWeaponReload/finishReloadPiston/tickReloadPiston/drawReloadPistons/renderPistonHUD.
- **Comando/procedimento:** node tests/reload-piston.cjs; node tests/reload-piston-browser.cjs; node tests/reload-piston-audio.cjs.
- **Preparação:** Fixture e fonte identificadas; não representa partida natural.
- **Entradas e passos:** Concluir com overshoot de0,2s
- **Resultado esperado:** Somente0,2sde idade/72pxde viagem; não envelhecer pelo dtinteiro
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Contrato completo da ParteIII-D; declarar origem pré-movimento e limitaçãoP2.
- **Falha:** P1.
- **Evidência:** Estado/relógios/dano/contatos antes/depois, hash, logs e capturas; procedimento real quando aplicável.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-PISTON-06 — Pistão
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: startReload/tickWeaponReload/finishReloadPiston/tickReloadPiston/drawReloadPistons/renderPistonHUD.
- **Comando/procedimento:** node tests/reload-piston.cjs; node tests/reload-piston-browser.cjs; node tests/reload-piston-audio.cjs.
- **Preparação:** Fixture e fonte identificadas; não representa partida natural.
- **Entradas e passos:** Alvos em ordem embaralhada, repetidos e quatro corpos
- **Resultado esperado:** Entrada geométrica ordenada; uma vez/corpo; máximo3
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Contrato completo da ParteIII-D; declarar origem pré-movimento e limitaçãoP2.
- **Falha:** P1.
- **Evidência:** Estado/relógios/dano/contatos antes/depois, hash, logs e capturas; procedimento real quando aplicável.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-PISTON-07 — Pistão
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: startReload/tickWeaponReload/finishReloadPiston/tickReloadPiston/drawReloadPistons/renderPistonHUD.
- **Comando/procedimento:** node tests/reload-piston.cjs; node tests/reload-piston-browser.cjs; node tests/reload-piston-audio.cjs.
- **Preparação:** Fixture e fonte identificadas; não representa partida natural.
- **Entradas e passos:** Tangente lateral, direção vertical e extremo de vida
- **Resultado esperado:** Raio10+alvo; direção fixa; expiração vence empate final
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Contrato completo da ParteIII-D; declarar origem pré-movimento e limitaçãoP2.
- **Falha:** P1.
- **Evidência:** Estado/relógios/dano/contatos antes/depois, hash, logs e capturas; procedimento real quando aplicável.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-PISTON-08 — Pistão
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: startReload/tickWeaponReload/finishReloadPiston/tickReloadPiston/drawReloadPistons/renderPistonHUD.
- **Comando/procedimento:** node tests/reload-piston.cjs; node tests/reload-piston-browser.cjs; node tests/reload-piston-audio.cjs.
- **Preparação:** Fixture e fonte identificadas; não representa partida natural.
- **Entradas e passos:** 1/2/3armas e400balas existentes
- **Resultado esperado:** Um por slot/origens separadas, sem consumir/remover balas
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Contrato completo da ParteIII-D; declarar origem pré-movimento e limitaçãoP2.
- **Falha:** P1.
- **Evidência:** Estado/relógios/dano/contatos antes/depois, hash, logs e capturas; procedimento real quando aplicável.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-PISTON-09 — Pistão
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: startReload/tickWeaponReload/finishReloadPiston/tickReloadPiston/drawReloadPistons/renderPistonHUD.
- **Comando/procedimento:** node tests/reload-piston.cjs; node tests/reload-piston-browser.cjs; node tests/reload-piston-audio.cjs.
- **Preparação:** Fixture e fonte identificadas; não representa partida natural.
- **Entradas e passos:** Nova conclusão com entidade antiga
- **Resultado esperado:** Antiga sóaté fronteira; nova substitui e recebe residual
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Contrato completo da ParteIII-D; declarar origem pré-movimento e limitaçãoP2.
- **Falha:** P1.
- **Evidência:** Estado/relógios/dano/contatos antes/depois, hash, logs e capturas; procedimento real quando aplicável.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-PISTON-10 — Pistão
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: startReload/tickWeaponReload/finishReloadPiston/tickReloadPiston/drawReloadPistons/renderPistonHUD.
- **Comando/procedimento:** node tests/reload-piston.cjs; node tests/reload-piston-browser.cjs; node tests/reload-piston-audio.cjs.
- **Preparação:** Fixture e fonte identificadas; não representa partida natural.
- **Entradas e passos:** Reforja, quebra de escudo e manutenção após captura
- **Resultado esperado:** P/timers antigos preservados; próximas capturas usam novos valores
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Contrato completo da ParteIII-D; declarar origem pré-movimento e limitaçãoP2.
- **Falha:** P1.
- **Evidência:** Estado/relógios/dano/contatos antes/depois, hash, logs e capturas; procedimento real quando aplicável.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-PISTON-11 — Pistão
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: startReload/tickWeaponReload/finishReloadPiston/tickReloadPiston/drawReloadPistons/renderPistonHUD.
- **Comando/procedimento:** node tests/reload-piston.cjs; node tests/reload-piston-browser.cjs; node tests/reload-piston-audio.cjs.
- **Preparação:** Fixture e fonte identificadas; não representa partida natural.
- **Entradas e passos:** Policial com escudo1e todos procs instalados
- **Resultado esperado:** Quebra sem excesso aoHP; nenhum estado/empurrão/proc novo
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Contrato completo da ParteIII-D; declarar origem pré-movimento e limitaçãoP2.
- **Falha:** P1.
- **Evidência:** Estado/relógios/dano/contatos antes/depois, hash, logs e capturas; procedimento real quando aplicável.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-PISTON-12 — Pistão
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: startReload/tickWeaponReload/finishReloadPiston/tickReloadPiston/drawReloadPistons/renderPistonHUD.
- **Comando/procedimento:** node tests/reload-piston.cjs; node tests/reload-piston-browser.cjs; node tests/reload-piston-audio.cjs.
- **Preparação:** Fixture e fonte identificadas; não representa partida natural.
- **Entradas e passos:** Abate comum/boss/contadores próximos do limiar
- **Resultado esperado:** Loot/globais/recompensas únicos; sem killAmmo/salvage do pistão
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Contrato completo da ParteIII-D; declarar origem pré-movimento e limitaçãoP2.
- **Falha:** P1.
- **Evidência:** Estado/relógios/dano/contatos antes/depois, hash, logs e capturas; procedimento real quando aplicável.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-PISTON-13 — Pistão
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: startReload/tickWeaponReload/finishReloadPiston/tickReloadPiston/drawReloadPistons/renderPistonHUD.
- **Comando/procedimento:** node tests/reload-piston.cjs; node tests/reload-piston-browser.cjs; node tests/reload-piston-audio.cjs.
- **Preparação:** Fixture e fonte identificadas; não representa partida natural.
- **Entradas e passos:** Liberar disparo, cancelar toque, pausar e retomar
- **Resultado esperado:** Entidade lançada segue; pausada congela; sem retomada indevida do disparo
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Contrato completo da ParteIII-D; declarar origem pré-movimento e limitaçãoP2.
- **Falha:** P1.
- **Evidência:** Estado/relógios/dano/contatos antes/depois, hash, logs e capturas; procedimento real quando aplicável.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-PISTON-14 — Pistão
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: startReload/tickWeaponReload/finishReloadPiston/tickReloadPiston/drawReloadPistons/renderPistonHUD.
- **Comando/procedimento:** node tests/reload-piston.cjs; node tests/reload-piston-browser.cjs; node tests/reload-piston-audio.cjs.
- **Preparação:** Fixture e fonte identificadas; não representa partida natural.
- **Entradas e passos:** Render repetido, morte, garagem e reset
- **Resultado esperado:** Sem mutação/RNGpor render; limpeza completa sem persistência
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Contrato completo da ParteIII-D; declarar origem pré-movimento e limitaçãoP2.
- **Falha:** P1.
- **Evidência:** Estado/relógios/dano/contatos antes/depois, hash, logs e capturas; procedimento real quando aplicável.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-PISTON-15 — Pistão
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: startReload/tickWeaponReload/finishReloadPiston/tickReloadPiston/drawReloadPistons/renderPistonHUD.
- **Comando/procedimento:** node tests/reload-piston.cjs; node tests/reload-piston-browser.cjs; node tests/reload-piston-audio.cjs.
- **Preparação:** Fixture e fonte identificadas; não representa partida natural.
- **Entradas e passos:** Faltam5cartuchos e1ou5são reembolsados
- **Resultado esperado:** Dano/cura somente pela reposição real; reposição zero não invoca
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Contrato completo da ParteIII-D; declarar origem pré-movimento e limitaçãoP2.
- **Falha:** P1.
- **Evidência:** Estado/relógios/dano/contatos antes/depois, hash, logs e capturas; procedimento real quando aplicável.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-PISTON-16 — Pistão
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: startReload/tickWeaponReload/finishReloadPiston/tickReloadPiston/drawReloadPistons/renderPistonHUD.
- **Comando/procedimento:** node tests/reload-piston.cjs; node tests/reload-piston-browser.cjs; node tests/reload-piston-audio.cjs.
- **Preparação:** Fixture e fonte identificadas; não representa partida natural.
- **Entradas e passos:** Tickintegrado com movimento/câmera e conclusão interna
- **Resultado esperado:** Origem pré-movimento documentada; idade sóresidual; registrarP2
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Contrato completo da ParteIII-D; declarar origem pré-movimento e limitaçãoP2.
- **Falha:** P1.
- **Evidência:** Estado/relógios/dano/contatos antes/depois, hash, logs e capturas; procedimento real quando aplicável.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-PISTON-17 — Pistão
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: startReload/tickWeaponReload/finishReloadPiston/tickReloadPiston/drawReloadPistons/renderPistonHUD.
- **Comando/procedimento:** node tests/reload-piston.cjs; node tests/reload-piston-browser.cjs; node tests/reload-piston-audio.cjs.
- **Preparação:** Fixture e fonte identificadas; não representa partida natural.
- **Entradas e passos:** Três viewports, cards, estados de barras e3dedos
- **Resultado esperado:** Escolha legal, sem clipping/novo botão, marcas por slot, controles independentes
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Contrato completo da ParteIII-D; declarar origem pré-movimento e limitaçãoP2.
- **Falha:** P1.
- **Evidência:** Estado/relógios/dano/contatos antes/depois, hash, logs e capturas; procedimento real quando aplicável.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-PISTON-18 — Pistão
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: startReload/tickWeaponReload/finishReloadPiston/tickReloadPiston/drawReloadPistons/renderPistonHUD.
- **Comando/procedimento:** node tests/reload-piston.cjs; node tests/reload-piston-browser.cjs; node tests/reload-piston-audio.cjs.
- **Preparação:** Fixture e fonte identificadas; não representa partida natural.
- **Entradas e passos:** Som, mute e muitos contatos
- **Resultado esperado:** Cues sóem eventos reais, throttles/limites mantidos
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Contrato completo da ParteIII-D; declarar origem pré-movimento e limitaçãoP2.
- **Falha:** P1.
- **Evidência:** Estado/relógios/dano/contatos antes/depois, hash, logs e capturas; procedimento real quando aplicável.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-VITAL-01 — Vital
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: vitalDroneBonus/droneShotDamage/emitIntegrityPulse/emitProjectiles/tickDrones e fase de coleta.
- **Comando/procedimento:** node tests/vital-conversions.cjs; node tests/drone-death-phase.cjs; node tests/vital-conversions-browser.cjs; node tests/vital-conversions-audio.cjs.
- **Preparação:** Preparação declarada e fontes identificadas; não é ensaio natural.
- **Entradas e passos:** Tentar Acoplamento sem drone, com módulo e com nativoENXA
- **Resultado esperado:** Elegibilidade real; instalação não altera HP/cadência/munição/perfil
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** DistinguirHPatual/máxima, custo devida inexistente, procs balísticos versus morte global e fase terminal.
- **Falha:** P1.
- **Evidência:** Logs/estados/fontes de dano/perfil, hashes, comandos e capturas; baseline negativo preservado nas correções.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-VITAL-02 — Vital
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: vitalDroneBonus/droneShotDamage/emitIntegrityPulse/emitProjectiles/tickDrones e fase de coleta.
- **Comando/procedimento:** node tests/vital-conversions.cjs; node tests/drone-death-phase.cjs; node tests/vital-conversions-browser.cjs; node tests/vital-conversions-audio.cjs.
- **Preparação:** Preparação declarada e fontes identificadas; não é ensaio natural.
- **Entradas e passos:** B100,HP40/80/4000, variar sóHPmáxima
- **Resultado esperado:** D101/102/200; HPmáxima isolada não muda extra
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** DistinguirHPatual/máxima, custo devida inexistente, procs balísticos versus morte global e fase terminal.
- **Falha:** P1.
- **Evidência:** Logs/estados/fontes de dano/perfil, hashes, comandos e capturas; baseline negativo preservado nas correções.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-VITAL-03 — Vital
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: vitalDroneBonus/droneShotDamage/emitIntegrityPulse/emitProjectiles/tickDrones e fase de coleta.
- **Comando/procedimento:** node tests/vital-conversions.cjs; node tests/drone-death-phase.cjs; node tests/vital-conversions-browser.cjs; node tests/vital-conversions-audio.cjs.
- **Preparação:** Preparação declarada e fontes identificadas; não é ensaio natural.
- **Entradas e passos:** HPzero/negativa/NaN/Infinity, extremos técnicos
- **Resultado esperado:** Extra0para inválidos; entradas válidas limitadas e finitas
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** DistinguirHPatual/máxima, custo devida inexistente, procs balísticos versus morte global e fase terminal.
- **Falha:** P1.
- **Evidência:** Logs/estados/fontes de dano/perfil, hashes, comandos e capturas; baseline negativo preservado nas correções.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-VITAL-04 — Vital
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: vitalDroneBonus/droneShotDamage/emitIntegrityPulse/emitProjectiles/tickDrones e fase de coleta.
- **Comando/procedimento:** node tests/vital-conversions.cjs; node tests/drone-death-phase.cjs; node tests/vital-conversions-browser.cjs; node tests/vital-conversions-audio.cjs.
- **Preparação:** Preparação declarada e fontes identificadas; não é ensaio natural.
- **Entradas e passos:** Baia/calibração90s e foco em chefe
- **Resultado esperado:** Base treinada, depois vida limitada, depois foco uma vez
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** DistinguirHPatual/máxima, custo devida inexistente, procs balísticos versus morte global e fase terminal.
- **Falha:** P1.
- **Evidência:** Logs/estados/fontes de dano/perfil, hashes, comandos e capturas; baseline negativo preservado nas correções.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-VITAL-05 — Vital
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: vitalDroneBonus/droneShotDamage/emitIntegrityPulse/emitProjectiles/tickDrones e fase de coleta.
- **Comando/procedimento:** node tests/vital-conversions.cjs; node tests/drone-death-phase.cjs; node tests/vital-conversions-browser.cjs; node tests/vital-conversions-audio.cjs.
- **Preparação:** Preparação declarada e fontes identificadas; não é ensaio natural.
- **Entradas e passos:** Abate primário cura1e arco salta
- **Resultado esperado:** Arco usa captura anterior à cura; ataque futuro pode ler HPnova
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** DistinguirHPatual/máxima, custo devida inexistente, procs balísticos versus morte global e fase terminal.
- **Falha:** P1.
- **Evidência:** Logs/estados/fontes de dano/perfil, hashes, comandos e capturas; baseline negativo preservado nas correções.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-VITAL-06 — Vital
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: vitalDroneBonus/droneShotDamage/emitIntegrityPulse/emitProjectiles/tickDrones e fase de coleta.
- **Comando/procedimento:** node tests/vital-conversions.cjs; node tests/drone-death-phase.cjs; node tests/vital-conversions-browser.cjs; node tests/vital-conversions-audio.cjs.
- **Preparação:** Preparação declarada e fontes identificadas; não é ensaio natural.
- **Entradas e passos:** Drone reforçado atinge escudo
- **Resultado esperado:** Absorção integral; sem novos estados/procs
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** DistinguirHPatual/máxima, custo devida inexistente, procs balísticos versus morte global e fase terminal.
- **Falha:** P1.
- **Evidência:** Logs/estados/fontes de dano/perfil, hashes, comandos e capturas; baseline negativo preservado nas correções.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-VITAL-07 — Vital
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: vitalDroneBonus/droneShotDamage/emitIntegrityPulse/emitProjectiles/tickDrones e fase de coleta.
- **Comando/procedimento:** node tests/vital-conversions.cjs; node tests/drone-death-phase.cjs; node tests/vital-conversions-browser.cjs; node tests/vital-conversions-audio.cjs.
- **Preparação:** Preparação declarada e fontes identificadas; não é ensaio natural.
- **Entradas e passos:** Comparar bala/sensor/rotor/projétil antigo antes/depois
- **Resultado esperado:** Conversão sóno drone; sem reescrever outros canais
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** DistinguirHPatual/máxima, custo devida inexistente, procs balísticos versus morte global e fase terminal.
- **Falha:** P1.
- **Evidência:** Logs/estados/fontes de dano/perfil, hashes, comandos e capturas; baseline negativo preservado nas correções.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-VITAL-08 — Vital
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: vitalDroneBonus/droneShotDamage/emitIntegrityPulse/emitProjectiles/tickDrones e fase de coleta.
- **Comando/procedimento:** node tests/vital-conversions.cjs; node tests/drone-death-phase.cjs; node tests/vital-conversions-browser.cjs; node tests/vital-conversions-audio.cjs.
- **Preparação:** Preparação declarada e fontes identificadas; não é ensaio natural.
- **Entradas e passos:** Equipar3armas e1drone
- **Resultado esperado:** ParcelaHPuma vez por ataque, não×3pela quantidade de armas
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** DistinguirHPatual/máxima, custo devida inexistente, procs balísticos versus morte global e fase terminal.
- **Falha:** P1.
- **Evidência:** Logs/estados/fontes de dano/perfil, hashes, comandos e capturas; baseline negativo preservado nas correções.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-VITAL-09 — Vital
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: vitalDroneBonus/droneShotDamage/emitIntegrityPulse/emitProjectiles/tickDrones e fase de coleta.
- **Comando/procedimento:** node tests/vital-conversions.cjs; node tests/drone-death-phase.cjs; node tests/vital-conversions-browser.cjs; node tests/vital-conversions-audio.cjs.
- **Preparação:** Preparação declarada e fontes identificadas; não é ensaio natural.
- **Entradas e passos:** 12armas, penúltimo válido e último cartucho
- **Resultado esperado:** Sóúltimo consumido ativa1pulso e autorrecarga normal
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** DistinguirHPatual/máxima, custo devida inexistente, procs balísticos versus morte global e fase terminal.
- **Falha:** P1.
- **Evidência:** Logs/estados/fontes de dano/perfil, hashes, comandos e capturas; baseline negativo preservado nas correções.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-VITAL-10 — Vital
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: vitalDroneBonus/droneShotDamage/emitIntegrityPulse/emitProjectiles/tickDrones e fase de coleta.
- **Comando/procedimento:** node tests/vital-conversions.cjs; node tests/drone-death-phase.cjs; node tests/vital-conversions-browser.cjs; node tests/vital-conversions-audio.cjs.
- **Preparação:** Preparação declarada e fontes identificadas; não é ensaio natural.
- **Entradas e passos:** Escopeta5pellets e rajada3subdisparos
- **Resultado esperado:** Um evento no cartucho final; não duplicar por pellet/subtiro anterior
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** DistinguirHPatual/máxima, custo devida inexistente, procs balísticos versus morte global e fase terminal.
- **Falha:** P1.
- **Evidência:** Logs/estados/fontes de dano/perfil, hashes, comandos e capturas; baseline negativo preservado nas correções.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-VITAL-11 — Vital
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: vitalDroneBonus/droneShotDamage/emitIntegrityPulse/emitProjectiles/tickDrones e fase de coleta.
- **Comando/procedimento:** node tests/vital-conversions.cjs; node tests/drone-death-phase.cjs; node tests/vital-conversions-browser.cjs; node tests/vital-conversions-audio.cjs.
- **Preparação:** Preparação declarada e fontes identificadas; não é ensaio natural.
- **Entradas e passos:** Teto400e espaço399
- **Resultado esperado:** 400recusa sem custo/pulso;399gasta1e ativa1pulso
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** DistinguirHPatual/máxima, custo devida inexistente, procs balísticos versus morte global e fase terminal.
- **Falha:** P1.
- **Evidência:** Logs/estados/fontes de dano/perfil, hashes, comandos e capturas; baseline negativo preservado nas correções.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-VITAL-12 — Vital
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: vitalDroneBonus/droneShotDamage/emitIntegrityPulse/emitProjectiles/tickDrones e fase de coleta.
- **Comando/procedimento:** node tests/vital-conversions.cjs; node tests/drone-death-phase.cjs; node tests/vital-conversions-browser.cjs; node tests/vital-conversions-audio.cjs.
- **Preparação:** Preparação declarada e fontes identificadas; não é ensaio natural.
- **Entradas e passos:** Rcom munição parcial, completar e tentar emissão inválida
- **Resultado esperado:** Nenhum pulso pela recarga; retorno inválido não repete
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** DistinguirHPatual/máxima, custo devida inexistente, procs balísticos versus morte global e fase terminal.
- **Falha:** P1.
- **Evidência:** Logs/estados/fontes de dano/perfil, hashes, comandos e capturas; baseline negativo preservado nas correções.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-VITAL-13 — Vital
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: vitalDroneBonus/droneShotDamage/emitIntegrityPulse/emitProjectiles/tickDrones e fase de coleta.
- **Comando/procedimento:** node tests/vital-conversions.cjs; node tests/drone-death-phase.cjs; node tests/vital-conversions-browser.cjs; node tests/vital-conversions-audio.cjs.
- **Preparação:** Preparação declarada e fontes identificadas; não é ensaio natural.
- **Entradas e passos:** HPmáxima300/HPatual1, crítico/Culatra/arma forte
- **Resultado esperado:** Pulso60com1arma; não herda multiplicadores balísticos
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** DistinguirHPatual/máxima, custo devida inexistente, procs balísticos versus morte global e fase terminal.
- **Falha:** P1.
- **Evidência:** Logs/estados/fontes de dano/perfil, hashes, comandos e capturas; baseline negativo preservado nas correções.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-VITAL-14 — Vital
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: vitalDroneBonus/droneShotDamage/emitIntegrityPulse/emitProjectiles/tickDrones e fase de coleta.
- **Comando/procedimento:** node tests/vital-conversions.cjs; node tests/drone-death-phase.cjs; node tests/vital-conversions-browser.cjs; node tests/vital-conversions-audio.cjs.
- **Preparação:** Preparação declarada e fontes identificadas; não é ensaio natural.
- **Entradas e passos:** 1/2/3armas vaziam no mesmo quadro
- **Resultado esperado:** 60/30/20por evento paraHPmáxima300; soma bruta60
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** DistinguirHPatual/máxima, custo devida inexistente, procs balísticos versus morte global e fase terminal.
- **Falha:** P1.
- **Evidência:** Logs/estados/fontes de dano/perfil, hashes, comandos e capturas; baseline negativo preservado nas correções.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-VITAL-15 — Vital
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: vitalDroneBonus/droneShotDamage/emitIntegrityPulse/emitProjectiles/tickDrones e fase de coleta.
- **Comando/procedimento:** node tests/vital-conversions.cjs; node tests/drone-death-phase.cjs; node tests/vital-conversions-browser.cjs; node tests/vital-conversions-audio.cjs.
- **Preparação:** Preparação declarada e fontes identificadas; não é ensaio natural.
- **Entradas e passos:** 100corpos e limites90+raio
- **Resultado esperado:** Todos os dentro atingidos, fora não; sem cap artificial
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** DistinguirHPatual/máxima, custo devida inexistente, procs balísticos versus morte global e fase terminal.
- **Falha:** P1.
- **Evidência:** Logs/estados/fontes de dano/perfil, hashes, comandos e capturas; baseline negativo preservado nas correções.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-VITAL-16 — Vital
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: vitalDroneBonus/droneShotDamage/emitIntegrityPulse/emitProjectiles/tickDrones e fase de coleta.
- **Comando/procedimento:** node tests/vital-conversions.cjs; node tests/drone-death-phase.cjs; node tests/vital-conversions-browser.cjs; node tests/vital-conversions-audio.cjs.
- **Preparação:** Preparação declarada e fontes identificadas; não é ensaio natural.
- **Entradas e passos:** Policial com escudo1e procs adquiridos
- **Resultado esperado:** Quebra sem excesso; não aplicar estados/empurrão
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** DistinguirHPatual/máxima, custo devida inexistente, procs balísticos versus morte global e fase terminal.
- **Falha:** P1.
- **Evidência:** Logs/estados/fontes de dano/perfil, hashes, comandos e capturas; baseline negativo preservado nas correções.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-VITAL-17 — Vital
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: vitalDroneBonus/droneShotDamage/emitIntegrityPulse/emitProjectiles/tickDrones e fase de coleta.
- **Comando/procedimento:** node tests/vital-conversions.cjs; node tests/drone-death-phase.cjs; node tests/vital-conversions-browser.cjs; node tests/vital-conversions-audio.cjs.
- **Preparação:** Preparação declarada e fontes identificadas; não é ensaio natural.
- **Entradas e passos:** Abate comum, Finalizador e contadores próximos de limiar
- **Resultado esperado:** Globais/loot normais; killAmmo/salvage não avançam pelo pulso
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** DistinguirHPatual/máxima, custo devida inexistente, procs balísticos versus morte global e fase terminal.
- **Falha:** P1.
- **Evidência:** Logs/estados/fontes de dano/perfil, hashes, comandos e capturas; baseline negativo preservado nas correções.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-VITAL-18 — Vital
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: vitalDroneBonus/droneShotDamage/emitIntegrityPulse/emitProjectiles/tickDrones e fase de coleta.
- **Comando/procedimento:** node tests/vital-conversions.cjs; node tests/drone-death-phase.cjs; node tests/vital-conversions-browser.cjs; node tests/vital-conversions-audio.cjs.
- **Preparação:** Preparação declarada e fontes identificadas; não é ensaio natural.
- **Entradas e passos:** Pulso mata chefe e remove lacaios
- **Resultado esperado:** Baú/peça/cura únicos; lacaios removidos sem crédito próprio
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** DistinguirHPatual/máxima, custo devida inexistente, procs balísticos versus morte global e fase terminal.
- **Falha:** P1.
- **Evidência:** Logs/estados/fontes de dano/perfil, hashes, comandos e capturas; baseline negativo preservado nas correções.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-VITAL-19 — Vital
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: vitalDroneBonus/droneShotDamage/emitIntegrityPulse/emitProjectiles/tickDrones e fase de coleta.
- **Comando/procedimento:** node tests/vital-conversions.cjs; node tests/drone-death-phase.cjs; node tests/vital-conversions-browser.cjs; node tests/vital-conversions-audio.cjs.
- **Preparação:** Preparação declarada e fontes identificadas; não é ensaio natural.
- **Entradas e passos:** Pausa/oferta/over/HP0e valores técnicos
- **Resultado esperado:** Nenhum pulso fora da partida ativa; dano calculado finito
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** DistinguirHPatual/máxima, custo devida inexistente, procs balísticos versus morte global e fase terminal.
- **Falha:** P1.
- **Evidência:** Logs/estados/fontes de dano/perfil, hashes, comandos e capturas; baseline negativo preservado nas correções.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-VITAL-20 — Vital
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: vitalDroneBonus/droneShotDamage/emitIntegrityPulse/emitProjectiles/tickDrones e fase de coleta.
- **Comando/procedimento:** node tests/vital-conversions.cjs; node tests/drone-death-phase.cjs; node tests/vital-conversions-browser.cjs; node tests/vital-conversions-audio.cjs.
- **Preparação:** Preparação declarada e fontes identificadas; não é ensaio natural.
- **Entradas e passos:** Render/HUD, pausa e reset
- **Resultado esperado:** Sem RNG/física no render, relógios congelados, peças não persistem
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** DistinguirHPatual/máxima, custo devida inexistente, procs balísticos versus morte global e fase terminal.
- **Falha:** P1.
- **Evidência:** Logs/estados/fontes de dano/perfil, hashes, comandos e capturas; baseline negativo preservado nas correções.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-VITAL-21 — Vital
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: vitalDroneBonus/droneShotDamage/emitIntegrityPulse/emitProjectiles/tickDrones e fase de coleta.
- **Comando/procedimento:** node tests/vital-conversions.cjs; node tests/drone-death-phase.cjs; node tests/vital-conversions-browser.cjs; node tests/vital-conversions-audio.cjs.
- **Preparação:** Preparação declarada e fontes identificadas; não é ensaio natural.
- **Entradas e passos:** Pulso em corpo livre com todos estados adquiridos
- **Resultado esperado:** Nenhuma corrosão/fogo/frio/stun nova pelo pulso
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** DistinguirHPatual/máxima, custo devida inexistente, procs balísticos versus morte global e fase terminal.
- **Falha:** P1.
- **Evidência:** Logs/estados/fontes de dano/perfil, hashes, comandos e capturas; baseline negativo preservado nas correções.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-VITAL-22 — Vital
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: vitalDroneBonus/droneShotDamage/emitIntegrityPulse/emitProjectiles/tickDrones e fase de coleta.
- **Comando/procedimento:** node tests/vital-conversions.cjs; node tests/drone-death-phase.cjs; node tests/vital-conversions-browser.cjs; node tests/vital-conversions-audio.cjs.
- **Preparação:** Preparação declarada e fontes identificadas; não é ensaio natural.
- **Entradas e passos:** Carga anterior80e pulso200mata hospedeiro
- **Resultado esperado:** Até2filhos40,1geração; não usar200como captura
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** DistinguirHPatual/máxima, custo devida inexistente, procs balísticos versus morte global e fase terminal.
- **Falha:** P1.
- **Evidência:** Logs/estados/fontes de dano/perfil, hashes, comandos e capturas; baseline negativo preservado nas correções.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-VITAL-23 — Vital
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: vitalDroneBonus/droneShotDamage/emitIntegrityPulse/emitProjectiles/tickDrones e fase de coleta.
- **Comando/procedimento:** node tests/vital-conversions.cjs; node tests/drone-death-phase.cjs; node tests/vital-conversions-browser.cjs; node tests/vital-conversions-audio.cjs.
- **Preparação:** Preparação declarada e fontes identificadas; não é ensaio natural.
- **Entradas e passos:** Contato mata jogador antes da fase de drones
- **Resultado esperado:** Over/HP0,0abates/núcleos posteriores; baselinefalhava e candidata passa
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** DistinguirHPatual/máxima, custo devida inexistente, procs balísticos versus morte global e fase terminal.
- **Falha:** P1.
- **Evidência:** Logs/estados/fontes de dano/perfil, hashes, comandos e capturas; baseline negativo preservado nas correções.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-VITAL-24 — Vital
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: vitalDroneBonus/droneShotDamage/emitIntegrityPulse/emitProjectiles/tickDrones e fase de coleta.
- **Comando/procedimento:** node tests/vital-conversions.cjs; node tests/drone-death-phase.cjs; node tests/vital-conversions-browser.cjs; node tests/vital-conversions-audio.cjs.
- **Preparação:** Preparação declarada e fontes identificadas; não é ensaio natural.
- **Entradas e passos:** Três viewports, cards/R/mouse/toque com3dedos/retrato
- **Resultado esperado:** Controles independentes, marca legível, sem custoHP/overflow/retomada automática
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** DistinguirHPatual/máxima, custo devida inexistente, procs balísticos versus morte global e fase terminal.
- **Falha:** P1.
- **Evidência:** Logs/estados/fontes de dano/perfil, hashes, comandos e capturas; baseline negativo preservado nas correções.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-VITAL-25 — Vital
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: vitalDroneBonus/droneShotDamage/emitIntegrityPulse/emitProjectiles/tickDrones e fase de coleta.
- **Comando/procedimento:** node tests/vital-conversions.cjs; node tests/drone-death-phase.cjs; node tests/vital-conversions-browser.cjs; node tests/vital-conversions-audio.cjs.
- **Preparação:** Preparação declarada e fontes identificadas; não é ensaio natural.
- **Entradas e passos:** Áudio por evento e spam/mute
- **Resultado esperado:** Umcue por último cartucho; sem cue de cura extra ou drone morto
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** DistinguirHPatual/máxima, custo devida inexistente, procs balísticos versus morte global e fase terminal.
- **Falha:** P1.
- **Evidência:** Logs/estados/fontes de dano/perfil, hashes, comandos e capturas; baseline negativo preservado nas correções.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-VITAL-26 — Vital
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: vitalDroneBonus/droneShotDamage/emitIntegrityPulse/emitProjectiles/tickDrones e fase de coleta.
- **Comando/procedimento:** node tests/vital-conversions.cjs; node tests/drone-death-phase.cjs; node tests/vital-conversions-browser.cjs; node tests/vital-conversions-audio.cjs.
- **Preparação:** Preparação declarada e fontes identificadas; não é ensaio natural.
- **Entradas e passos:** Repetir mundos legados e preservar defeito corrigido separadamente
- **Resultado esperado:** Equivalência somente no escopo coberto; morte no mesmo quadro exige novo resultado
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** DistinguirHPatual/máxima, custo devida inexistente, procs balísticos versus morte global e fase terminal.
- **Falha:** P1.
- **Evidência:** Logs/estados/fontes de dano/perfil, hashes, comandos e capturas; baseline negativo preservado nas correções.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-COMBAT-W01 — Combate e mundo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/damageEnemy/impact/IA/horda/loot; helpers.
- **Comando/procedimento:** node tests/combat.cjs; testes específicos por caso.
- **Preparação:** Fixture isolada com estado/seed conhecidos; não conta como partida natural.
- **Entradas e passos:** Mover por2000px em cada eixo e voltar
- **Resultado esperado:** Nenhuma parede, wrap, reset de inimigos ou vitória; posição muda integralmente
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-COMBAT-W02 — Combate e mundo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/damageEnemy/impact/IA/horda/loot; helpers.
- **Comando/procedimento:** node tests/combat.cjs; testes específicos por caso.
- **Preparação:** Fixture isolada com estado/seed conhecidos; não conta como partida natural.
- **Entradas e passos:** Comparar movimento reto/diagonal por1s
- **Resultado esperado:** Distância igual à velocidade em ambos, tolerância numérica definida
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-COMBAT-W03 — Combate e mundo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/damageEnemy/impact/IA/horda/loot; helpers.
- **Comando/procedimento:** node tests/combat.cjs; testes específicos por caso.
- **Preparação:** Fixture isolada com estado/seed conhecidos; não conta como partida natural.
- **Entradas e passos:** Mover menos que zona morta; depois exceder
- **Resultado esperado:** Câmera parada no primeiro caso; amortecimento correto no segundo
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-COMBAT-I01 — Combate e mundo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/damageEnemy/impact/IA/horda/loot; helpers.
- **Comando/procedimento:** node tests/combat.cjs; testes específicos por caso.
- **Preparação:** Fixture isolada com estado/seed conhecidos; não conta como partida natural.
- **Entradas e passos:** Segurar fogo, pausar/ofertar/morrer antes de soltar; soltar sobreoverlay; voltar
- **Resultado esperado:** Nenhum tiro/rajada residual; clique novo funciona
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-COMBAT-I02 — Combate e mundo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/damageEnemy/impact/IA/horda/loot; helpers.
- **Comando/procedimento:** node tests/combat.cjs; testes específicos por caso.
- **Preparação:** Fixture isolada com estado/seed conhecidos; não conta como partida natural.
- **Entradas e passos:** Dois dedos, cancelar um e mover mouse passivo
- **Resultado esperado:** Dono restante continua correto; sem roubo de mira/captura
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-COMBAT-I03 — Combate e mundo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/damageEnemy/impact/IA/horda/loot; helpers.
- **Comando/procedimento:** node tests/combat.cjs; testes específicos por caso.
- **Preparação:** Fixture isolada com estado/seed conhecidos; não conta como partida natural.
- **Entradas e passos:** Celular gira para retrato durante partida
- **Resultado esperado:** Pausa; nenhuma variação declock/HP/entidades; paisagem não retoma sozinha
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-COMBAT-H01 — Combate e mundo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/damageEnemy/impact/IA/horda/loot; helpers.
- **Comando/procedimento:** node tests/combat.cjs; testes específicos por caso.
- **Preparação:** Fixture isolada com estado/seed conhecidos; não conta como partida natural.
- **Entradas e passos:** Início com viewport e câmera deslocadas
- **Resultado esperado:** 15zumbis porgrupo fora dos quatro limites da tela, primeiro aos2s
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-COMBAT-H02 — Combate e mundo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/damageEnemy/impact/IA/horda/loot; helpers.
- **Comando/procedimento:** node tests/combat.cjs; testes específicos por caso.
- **Preparação:** Fixture isolada com estado/seed conhecidos; não conta como partida natural.
- **Entradas e passos:** Não matar; checar0,60,120,240,600s
- **Resultado esperado:** Comuns≤60/72/84/108/180respectivamente; lacaios separados
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-COMBAT-H03 — Combate e mundo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/damageEnemy/impact/IA/horda/loot; helpers.
- **Comando/procedimento:** node tests/combat.cjs; testes específicos por caso.
- **Preparação:** Fixture isolada com estado/seed conhecidos; não conta como partida natural.
- **Entradas e passos:** 8abates ou320px em baixa presença
- **Resultado esperado:** Grupo/cooldown e motivo correspondentes; nunca duplicar decisão no mesmoinstante
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-COMBAT-H04 — Combate e mundo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/damageEnemy/impact/IA/horda/loot; helpers.
- **Comando/procedimento:** node tests/combat.cjs; testes específicos por caso.
- **Preparação:** Fixture isolada com estado/seed conhecidos; não conta como partida natural.
- **Entradas e passos:** Fugir continuamente sem tiros por2min
- **Resultado esperado:** Velhos vivos preservam HP; reentrada fora de tela; ondas não cessam por abandono
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-COMBAT-H05 — Combate e mundo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/damageEnemy/impact/IA/horda/loot; helpers.
- **Comando/procedimento:** node tests/combat.cjs; testes específicos por caso.
- **Preparação:** Fixture isolada com estado/seed conhecidos; não conta como partida natural.
- **Entradas e passos:** Antes/depois de derrotar Sucateiro
- **Resultado esperado:** Nenhum policial antes;5de15depois comalternância; comuns sem aceleração
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-COMBAT-P01 — Combate e mundo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/damageEnemy/impact/IA/horda/loot; helpers.
- **Comando/procedimento:** node tests/combat.cjs; testes específicos por caso.
- **Preparação:** Fixture isolada com estado/seed conhecidos; não conta como partida natural.
- **Entradas e passos:** Golpe150contra escudo100/corpo24
- **Resultado esperado:** Escudo0, corpo24, preparação0,7s; sem vazamento50ao corpo
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-COMBAT-P02 — Combate e mundo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/damageEnemy/impact/IA/horda/loot; helpers.
- **Comando/procedimento:** node tests/combat.cjs; testes específicos por caso.
- **Preparação:** Fixture isolada com estado/seed conhecidos; não conta como partida natural.
- **Entradas e passos:** Romper escudo, mudar posição durante investida
- **Resultado esperado:** Vetor nãosegue nova posição; máximo240px; sóaquele policial muda
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-COMBAT-P03 — Combate e mundo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/damageEnemy/impact/IA/horda/loot; helpers.
- **Comando/procedimento:** node tests/combat.cjs; testes específicos por caso.
- **Preparação:** Fixture isolada com estado/seed conhecidos; não conta como partida natural.
- **Entradas e passos:** Tiro5com fogo/frio contra escudointacto
- **Resultado esperado:** Golpe absorvido não aplica fogo/frio/corrosão/empurrão, inclusive na quebra. A fonte anterior falhava; correção local e17fixtures não dispensam reteste final.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-COMBAT-B01 — Combate e mundo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/damageEnemy/impact/IA/horda/loot; helpers.
- **Comando/procedimento:** node tests/combat.cjs; testes específicos por caso.
- **Preparação:** Fixture isolada com estado/seed conhecidos; não conta como partida natural.
- **Entradas e passos:** Agenda60/240/420/600; manter chefe vivo alémdevido
- **Resultado esperado:** Um chefe porvez, próximoaguarda; HP650/1300/1800e quarto1105
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-COMBAT-B02 — Combate e mundo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/damageEnemy/impact/IA/horda/loot; helpers.
- **Comando/procedimento:** node tests/combat.cjs; testes específicos por caso.
- **Preparação:** Fixture isolada com estado/seed conhecidos; não conta como partida natural.
- **Entradas e passos:** Assistir preparos, atravessarfaixas, congelar/pausar
- **Resultado esperado:** Aviso antecede dano; timers corretos; sem ataque durantepausa
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-COMBAT-B03 — Combate e mundo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/damageEnemy/impact/IA/horda/loot; helpers.
- **Comando/procedimento:** node tests/combat.cjs; testes específicos por caso.
- **Preparação:** Fixture isolada com estado/seed conhecidos; não conta como partida natural.
- **Entradas e passos:** Matarcada tipo, deixar baú longe
- **Resultado esperado:** Peça+1salva, cura independente, lacaios/hazards removidos, baú no ponto de morte
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-COMBAT-B04 — Combate e mundo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/damageEnemy/impact/IA/horda/loot; helpers.
- **Comando/procedimento:** node tests/combat.cjs; testes específicos por caso.
- **Preparação:** Fixture isolada com estado/seed conhecidos; não conta como partida natural.
- **Entradas e passos:** Chegar exatamente40px e depois39,99
- **Resultado esperado:** Fronteira nãoabre; interior abre uma oferta, congela mundo
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-COMBAT-B05 — Combate e mundo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/damageEnemy/impact/IA/horda/loot; helpers.
- **Comando/procedimento:** node tests/combat.cjs; testes específicos por caso.
- **Preparação:** Fixture isolada com estado/seed conhecidos; não conta como partida natural.
- **Entradas e passos:** Deixar chefebaú fora de720px de alcance
- **Resultado esperado:** Marcadores na borda; aproximação move progressivamente para dentro
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-COMBAT-D01 — Combate e mundo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/damageEnemy/impact/IA/horda/loot; helpers.
- **Comando/procedimento:** node tests/combat.cjs; testes específicos por caso.
- **Preparação:** Fixture isolada com estado/seed conhecidos; não conta como partida natural.
- **Entradas e passos:** Receber dano em direçõesopostas e mesmaorigem
- **Resultado esperado:** 48pxpara fora; fallback estável; dano mínimo1einvulnerabilidade correta
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-COMBAT-D02 — Combate e mundo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/damageEnemy/impact/IA/horda/loot; helpers.
- **Comando/procedimento:** node tests/combat.cjs; testes específicos por caso.
- **Preparação:** Fixture isolada com estado/seed conhecidos; não conta como partida natural.
- **Entradas e passos:** Cura com HPcheio/parcial/morto
- **Resultado esperado:** 0/exato faltante/0; protocolos sócom cura real
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-COMBAT-R01 — Combate e mundo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/damageEnemy/impact/IA/horda/loot; helpers.
- **Comando/procedimento:** node tests/combat.cjs; testes específicos por caso.
- **Preparação:** Fixture isolada com estado/seed conhecidos; não conta como partida natural.
- **Entradas e passos:** NANO recarrega1de6com3HPbase
- **Resultado esperado:** NANO1slot recarregando1de6cura0,5HP. ENXA3slots+Reparo5HP recarregando1de6cura5/(6×3)=0,2777778HP; não montar NANO com3slots ilegais.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-COMBAT-C01 — Combate e mundo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/damageEnemy/impact/IA/horda/loot; helpers.
- **Comando/procedimento:** node tests/combat.cjs; testes específicos por caso.
- **Preparação:** Fixture isolada com estado/seed conhecidos; não conta como partida natural.
- **Entradas e passos:** Bala cruza alvo emdtlongo
- **Resultado esperado:** Colisão porsegmento, nãoatravessa semdano; umhit por alvo/geração
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-COMBAT-C02 — Combate e mundo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/damageEnemy/impact/IA/horda/loot; helpers.
- **Comando/procedimento:** node tests/combat.cjs; testes específicos por caso.
- **Preparação:** Fixture isolada com estado/seed conhecidos; não conta como partida natural.
- **Entradas e passos:** Explosão/elétrico+perfuração em multidão
- **Resultado esperado:** Fontes eordem corretas; sem recursão infinita; cadáver nãoé contado duasvezes
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-COMBAT-C03 — Combate e mundo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/damageEnemy/impact/IA/horda/loot; helpers.
- **Comando/procedimento:** node tests/combat.cjs; testes específicos por caso.
- **Preparação:** Fixture isolada com estado/seed conhecidos; não conta como partida natural.
- **Entradas e passos:** Comparar consulta linear/índice com mesmoseed
- **Resultado esperado:** MesmoHP, ordens, vivos, loot e próximos16sorteios
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-COMBAT-S01 — Combate e mundo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/damageEnemy/impact/IA/horda/loot; helpers.
- **Comando/procedimento:** node tests/combat.cjs; testes específicos por caso.
- **Preparação:** Fixture isolada com estado/seed conhecidos; não conta como partida natural.
- **Entradas e passos:** Corrosão raiz mata, respinga e filhos morrem
- **Resultado esperado:** Até2filhos, metade do dano, nenhuma geração adicional
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-COMBAT-S02 — Combate e mundo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/damageEnemy/impact/IA/horda/loot; helpers.
- **Comando/procedimento:** node tests/combat.cjs; testes específicos por caso.
- **Preparação:** Fixture isolada com estado/seed conhecidos; não conta como partida natural.
- **Entradas e passos:** Sensor com101alvos no raio, escudos eexposição
- **Resultado esperado:** Todos os corpos dentro recebem pulso; escudo não transmite relé; sóbalas aproveitam exposição
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-COMBAT-S03 — Combate e mundo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/damageEnemy/impact/IA/horda/loot; helpers.
- **Comando/procedimento:** node tests/combat.cjs; testes específicos por caso.
- **Preparação:** Fixture isolada com estado/seed conhecidos; não conta como partida natural.
- **Entradas e passos:** Rotores comdt maior queperíodo
- **Resultado esperado:** Máximo uma volta varrida, umhit por alvo/disco/período, sembacklog
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-COMBAT-S04 — Combate e mundo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/damageEnemy/impact/IA/horda/loot; helpers.
- **Comando/procedimento:** node tests/combat.cjs; testes específicos por caso.
- **Preparação:** Fixture isolada com estado/seed conhecidos; não conta como partida natural.
- **Entradas e passos:** Drones atacam alvo fora/dentro do alcance, contador3
- **Resultado esperado:** Fora0dano; dentro dano esperado; jamais4drones ou gasto de cartucho
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-COMBAT-S05 — Combate e mundo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/damageEnemy/impact/IA/horda/loot; helpers.
- **Comando/procedimento:** node tests/combat.cjs; testes específicos por caso.
- **Preparação:** Fixture isolada com estado/seed conhecidos; não conta como partida natural.
- **Entradas e passos:** Baia29,999/30/60/90s e longapausa
- **Resultado esperado:** Estágios0/1/2/3; cap1,95da peça; pausa não amadurece
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-COMBAT-S06 — Combate e mundo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/damageEnemy/impact/IA/horda/loot; helpers.
- **Comando/procedimento:** node tests/combat.cjs; testes específicos por caso.
- **Preparação:** Fixture isolada com estado/seed conhecidos; não conta como partida natural.
- **Entradas e passos:** Campo antes/depois do alvo, ricochete,disco eexpiração
- **Resultado esperado:** ×1,35uma vez sóquando caminho vivo chega antes; expirartie nãoamplifica
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-COMBAT-S07 — Combate e mundo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/damageEnemy/impact/IA/horda/loot; helpers.
- **Comando/procedimento:** node tests/combat.cjs; testes específicos por caso.
- **Preparação:** Fixture isolada com estado/seed conhecidos; não conta como partida natural.
- **Entradas e passos:** Culatra em1/6/24/72cartuchos
- **Resultado esperado:** Último×1,25/2,5/7/16;somaciclo1,25/7,5/30/87tiros-base; cap60
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-COMBAT-S08 — Combate e mundo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/damageEnemy/impact/IA/horda/loot; helpers.
- **Comando/procedimento:** node tests/combat.cjs; testes específicos por caso.
- **Preparação:** Fixture isolada com estado/seed conhecidos; não conta como partida natural.
- **Entradas e passos:** Bloquear emissão400; truncar399com10pellets
- **Resultado esperado:** Bloqueio não gasta nada; truncamento cria1pellet e gasta1cartucho/uma carga
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-COMBAT-S09 — Combate e mundo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/damageEnemy/impact/IA/horda/loot; helpers.
- **Comando/procedimento:** node tests/combat.cjs; testes específicos por caso.
- **Preparação:** Fixture isolada com estado/seed conhecidos; não conta como partida natural.
- **Entradas e passos:** InstalarCulatra durante reload, devolverammo, reforjar
- **Resultado esperado:** Não termina recarga/cura nem reescreve bala; refund semcarga; estado por slot
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-COMBAT-E01 — Combate e mundo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/damageEnemy/impact/IA/horda/loot; helpers.
- **Comando/procedimento:** node tests/combat.cjs; testes específicos por caso.
- **Preparação:** Fixture isolada com estado/seed conhecidos; não conta como partida natural.
- **Entradas e passos:** Falhar gravação ao comprar gear
- **Resultado esperado:** Saldo/peça devolvidos; equipamento permanece bloqueado; UI informa
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-COMBAT-E02 — Combate e mundo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/damageEnemy/impact/IA/horda/loot; helpers.
- **Comando/procedimento:** node tests/combat.cjs; testes específicos por caso.
- **Preparação:** Fixture isolada com estado/seed conhecidos; não conta como partida natural.
- **Entradas e passos:** Morrer após pegar parafusos/peças, fechar/reabrir
- **Resultado esperado:** Recursos mantidos; atributos/relíquias/skills zerados
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-COMBAT-V01 — Combate e mundo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/damageEnemy/impact/IA/horda/loot; helpers.
- **Comando/procedimento:** node tests/combat.cjs; testes específicos por caso.
- **Preparação:** Fixture isolada com estado/seed conhecidos; não conta como partida natural.
- **Entradas e passos:** Remover atlas/helper/imagem um de cada vez
- **Resultado esperado:** Fallback funcional, sem hitbox alterada nem jogo em branco
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-COMBAT-V02 — Combate e mundo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/damageEnemy/impact/IA/horda/loot; helpers.
- **Comando/procedimento:** node tests/combat.cjs; testes específicos por caso.
- **Preparação:** Fixture isolada com estado/seed conhecidos; não conta como partida natural.
- **Entradas e passos:** Pausar e chamar desenho100vezes com RNGque lançaerro
- **Resultado esperado:** Zero chamada RNGfísica, zero mutação de posições/timers/contadores
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-COMBAT-A01 — Combate e mundo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/damageEnemy/impact/IA/horda/loot; helpers.
- **Comando/procedimento:** node tests/combat.cjs; testes específicos por caso.
- **Preparação:** Fixture isolada com estado/seed conhecidos; não conta como partida natural.
- **Entradas e passos:** Menu→garagem→combate→pausa, mute e aba oculta
- **Resultado esperado:** Cenas/transições corretas, sem trilhas sobrepostas, sem som após mute
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-COMBAT-A02 — Combate e mundo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/damageEnemy/impact/IA/horda/loot; helpers.
- **Comando/procedimento:** node tests/combat.cjs; testes específicos por caso.
- **Preparação:** Fixture isolada com estado/seed conhecidos; não conta como partida natural.
- **Entradas e passos:** Multidão atirando/efeitos por5min
- **Resultado esperado:** Limites/throttles, sem crescimento indefinido de vozes e semclip audível
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-COMBAT-L01 — Combate e mundo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/damageEnemy/impact/IA/horda/loot; helpers.
- **Comando/procedimento:** node tests/combat.cjs; testes específicos por caso.
- **Preparação:** Fixture isolada com estado/seed conhecidos; não conta como partida natural.
- **Entradas e passos:** Teste natural10builds comseeds prévios eperfil isolado
- **Resultado esperado:** Registrar todas mortes, nível, bosses, escolhas, HP,coleta; não forçar poder ou apagar caso ruim
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-COMBAT-L02 — Combate e mundo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: tick/damageEnemy/impact/IA/horda/loot; helpers.
- **Comando/procedimento:** node tests/combat.cjs; testes específicos por caso.
- **Preparação:** Fixture isolada com estado/seed conhecidos; não conta como partida natural.
- **Entradas e passos:** Medir10min ativos por cenário no hardware-alvo identificado;20min de parede são confirmação adicional opcional.
- **Resultado esperado:** Relógios real/simulado,frame p50/p95/p99,picos/memória e inputs; não substituir porVM
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-ROBOT-prot — Chassi
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: ROBOTS/reset/shotDamage/healPlayer/tickDrones.
- **Comando/procedimento:** node tests/build-mechanics.cjs.
- **Preparação:** Perfil de teste com equipamento desbloqueado; selecionar só esse chassi e Metralhadora.
- **Entradas e passos:** Iniciar e observar atributos antes de módulos; testar sua passiva com evento real.
- **Resultado esperado:** HP100, velocidade190px/s, armadura0, máximo1slots. Equilibrado · 100 integridade · velocidade190 · 1 slot. Custos por quantidade aplicados uma vez.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-ROBOT-bastion — Chassi
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: ROBOTS/reset/shotDamage/healPlayer/tickDrones.
- **Comando/procedimento:** node tests/build-mechanics.cjs.
- **Preparação:** Perfil de teste com equipamento desbloqueado; selecionar só esse chassi e Metralhadora.
- **Entradas e passos:** Iniciar e observar atributos antes de módulos; testar sua passiva com evento real.
- **Resultado esperado:** HP120, velocidade155px/s, armadura1, máximo2slots. Blindado · 120 integridade · velocidade 155 · armadura1 · até2 armas. Custos por quantidade aplicados uma vez.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-ROBOT-forge — Chassi
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: ROBOTS/reset/shotDamage/healPlayer/tickDrones.
- **Comando/procedimento:** node tests/build-mechanics.cjs.
- **Preparação:** Perfil de teste com equipamento desbloqueado; selecionar só esse chassi e Metralhadora.
- **Entradas e passos:** Iniciar e observar atributos antes de módulos; testar sua passiva com evento real.
- **Resultado esperado:** HP90, velocidade180px/s, armadura0, máximo1slots. Forja móvel · queimadura ×1,35 · dano direto ×0,9 · 1 slot. Custos por quantidade aplicados uma vez.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-ROBOT-volt — Chassi
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: ROBOTS/reset/shotDamage/healPlayer/tickDrones.
- **Comando/procedimento:** node tests/build-mechanics.cjs.
- **Preparação:** Perfil de teste com equipamento desbloqueado; selecionar só esse chassi e Metralhadora.
- **Entradas e passos:** Iniciar e observar atributos antes de módulos; testar sua passiva com evento real.
- **Resultado esperado:** HP85, velocidade190px/s, armadura0, máximo1slots. Condutor · descarga ×1,35 · dano direto ×0,9 · 1 slot. Custos por quantidade aplicados uma vez.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-ROBOT-nano — Chassi
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: ROBOTS/reset/shotDamage/healPlayer/tickDrones.
- **Comando/procedimento:** node tests/build-mechanics.cjs.
- **Preparação:** Perfil de teste com equipamento desbloqueado; selecionar só esse chassi e Metralhadora.
- **Entradas e passos:** Iniciar e observar atributos antes de módulos; testar sua passiva com evento real.
- **Resultado esperado:** HP110, velocidade165px/s, armadura0, máximo1slots. Oficina móvel · recarga cura até3 proporcionalmente · 1 slot. Custos por quantidade aplicados uma vez.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-ROBOT-swarm — Chassi
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: ROBOTS/reset/shotDamage/healPlayer/tickDrones.
- **Comando/procedimento:** node tests/build-mechanics.cjs.
- **Preparação:** Perfil de teste com equipamento desbloqueado; selecionar só esse chassi e Metralhadora.
- **Entradas e passos:** Iniciar e observar atributos antes de módulos; testar sua passiva com evento real.
- **Resultado esperado:** HP95, velocidade170px/s, armadura0, máximo3slots. Enxame · um drone de apoio desde o início · até3 armas. Custos por quantidade aplicados uma vez.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-WEAPON-machine — Arma
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: WEAPONS/AMMO/emitProjectiles/startReload/tickWeaponReload.
- **Comando/procedimento:** node tests/combat.cjs; node tests/weapon-state.cjs.
- **Preparação:** PROT com somente essa arma, sem módulos; alvo imóvel de vida elevada em alcance.
- **Entradas e passos:** Emitir ciclo completo, segurar/soltar fogo, completar recarga e observar característica intrínseca.
- **Resultado esperado:** Dano22/pellet; intervalo0.32s; 1pellets/emissão; 24cartuchos; recarga cheia1.4s; velocidade570px/s; vida1.8s. Aplicar flags/retorno/explosão descritos na tabela da arma, sem contar pellets como cartuchos.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-WEAPON-shotgun — Arma
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: WEAPONS/AMMO/emitProjectiles/startReload/tickWeaponReload.
- **Comando/procedimento:** node tests/combat.cjs; node tests/weapon-state.cjs.
- **Preparação:** PROT com somente essa arma, sem módulos; alvo imóvel de vida elevada em alcance.
- **Entradas e passos:** Emitir ciclo completo, segurar/soltar fogo, completar recarga e observar característica intrínseca.
- **Resultado esperado:** Dano12/pellet; intervalo0.8s; 5pellets/emissão; 6cartuchos; recarga cheia2.2s; velocidade570px/s; vida0.65s. Aplicar flags/retorno/explosão descritos na tabela da arma, sem contar pellets como cartuchos.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-WEAPON-burst — Arma
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: WEAPONS/AMMO/emitProjectiles/startReload/tickWeaponReload.
- **Comando/procedimento:** node tests/combat.cjs; node tests/weapon-state.cjs.
- **Preparação:** PROT com somente essa arma, sem módulos; alvo imóvel de vida elevada em alcance.
- **Entradas e passos:** Emitir ciclo completo, segurar/soltar fogo, completar recarga e observar característica intrínseca.
- **Resultado esperado:** Dano14/pellet; intervalo0.65s; 1pellets/emissão; 30cartuchos; recarga cheia1.8s; velocidade570px/s; vida1.5s. Aplicar flags/retorno/explosão descritos na tabela da arma, sem contar pellets como cartuchos.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-WEAPON-sniper — Arma
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: WEAPONS/AMMO/emitProjectiles/startReload/tickWeaponReload.
- **Comando/procedimento:** node tests/combat.cjs; node tests/weapon-state.cjs.
- **Preparação:** PROT com somente essa arma, sem módulos; alvo imóvel de vida elevada em alcance.
- **Entradas e passos:** Emitir ciclo completo, segurar/soltar fogo, completar recarga e observar característica intrínseca.
- **Resultado esperado:** Dano88/pellet; intervalo1.15s; 1pellets/emissão; 3cartuchos; recarga cheia2.6s; velocidade1050px/s; vida1.2s. Aplicar flags/retorno/explosão descritos na tabela da arma, sem contar pellets como cartuchos.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-WEAPON-laser — Arma
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: WEAPONS/AMMO/emitProjectiles/startReload/tickWeaponReload.
- **Comando/procedimento:** node tests/combat.cjs; node tests/weapon-state.cjs.
- **Preparação:** PROT com somente essa arma, sem módulos; alvo imóvel de vida elevada em alcance.
- **Entradas e passos:** Emitir ciclo completo, segurar/soltar fogo, completar recarga e observar característica intrínseca.
- **Resultado esperado:** Dano10/pellet; intervalo0.09s; 1pellets/emissão; 60cartuchos; recarga cheia1.6s; velocidade1600px/s; vida0.5s. Aplicar flags/retorno/explosão descritos na tabela da arma, sem contar pellets como cartuchos.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-WEAPON-flame — Arma
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: WEAPONS/AMMO/emitProjectiles/startReload/tickWeaponReload.
- **Comando/procedimento:** node tests/combat.cjs; node tests/weapon-state.cjs.
- **Preparação:** PROT com somente essa arma, sem módulos; alvo imóvel de vida elevada em alcance.
- **Entradas e passos:** Emitir ciclo completo, segurar/soltar fogo, completar recarga e observar característica intrínseca.
- **Resultado esperado:** Dano5/pellet; intervalo0.12s; 3pellets/emissão; 80cartuchos; recarga cheia2.4s; velocidade300px/s; vida0.6s. Aplicar flags/retorno/explosão descritos na tabela da arma, sem contar pellets como cartuchos.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-WEAPON-cryo — Arma
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: WEAPONS/AMMO/emitProjectiles/startReload/tickWeaponReload.
- **Comando/procedimento:** node tests/combat.cjs; node tests/weapon-state.cjs.
- **Preparação:** PROT com somente essa arma, sem módulos; alvo imóvel de vida elevada em alcance.
- **Entradas e passos:** Emitir ciclo completo, segurar/soltar fogo, completar recarga e observar característica intrínseca.
- **Resultado esperado:** Dano22/pellet; intervalo0.36s; 1pellets/emissão; 12cartuchos; recarga cheia2.4s; velocidade420px/s; vida1.6s. Aplicar flags/retorno/explosão descritos na tabela da arma, sem contar pellets como cartuchos.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-WEAPON-rocket — Arma
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: WEAPONS/AMMO/emitProjectiles/startReload/tickWeaponReload.
- **Comando/procedimento:** node tests/combat.cjs; node tests/weapon-state.cjs.
- **Preparação:** PROT com somente essa arma, sem módulos; alvo imóvel de vida elevada em alcance.
- **Entradas e passos:** Emitir ciclo completo, segurar/soltar fogo, completar recarga e observar característica intrínseca.
- **Resultado esperado:** Dano70/pellet; intervalo1.3s; 1pellets/emissão; 1cartuchos; recarga cheia4.8s; velocidade280px/s; vida2.4s. Aplicar flags/retorno/explosão descritos na tabela da arma, sem contar pellets como cartuchos.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-WEAPON-grenade — Arma
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: WEAPONS/AMMO/emitProjectiles/startReload/tickWeaponReload.
- **Comando/procedimento:** node tests/combat.cjs; node tests/weapon-state.cjs.
- **Preparação:** PROT com somente essa arma, sem módulos; alvo imóvel de vida elevada em alcance.
- **Entradas e passos:** Emitir ciclo completo, segurar/soltar fogo, completar recarga e observar característica intrínseca.
- **Resultado esperado:** Dano45/pellet; intervalo1s; 1pellets/emissão; 4cartuchos; recarga cheia3.6s; velocidade320px/s; vida1.1s. Aplicar flags/retorno/explosão descritos na tabela da arma, sem contar pellets como cartuchos.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-WEAPON-tesla — Arma
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: WEAPONS/AMMO/emitProjectiles/startReload/tickWeaponReload.
- **Comando/procedimento:** node tests/combat.cjs; node tests/weapon-state.cjs.
- **Preparação:** PROT com somente essa arma, sem módulos; alvo imóvel de vida elevada em alcance.
- **Entradas e passos:** Emitir ciclo completo, segurar/soltar fogo, completar recarga e observar característica intrínseca.
- **Resultado esperado:** Dano24/pellet; intervalo0.55s; 1pellets/emissão; 8cartuchos; recarga cheia3s; velocidade720px/s; vida1s. Aplicar flags/retorno/explosão descritos na tabela da arma, sem contar pellets como cartuchos.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-WEAPON-disc — Arma
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: WEAPONS/AMMO/emitProjectiles/startReload/tickWeaponReload.
- **Comando/procedimento:** node tests/combat.cjs; node tests/weapon-state.cjs.
- **Preparação:** PROT com somente essa arma, sem módulos; alvo imóvel de vida elevada em alcance.
- **Entradas e passos:** Emitir ciclo completo, segurar/soltar fogo, completar recarga e observar característica intrínseca.
- **Resultado esperado:** Dano24/pellet; intervalo0.85s; 1pellets/emissão; 3cartuchos; recarga cheia3.4s; velocidade360px/s; vida1.8s. Aplicar flags/retorno/explosão descritos na tabela da arma, sem contar pellets como cartuchos.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-WEAPON-harpoon — Arma
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: WEAPONS/AMMO/emitProjectiles/startReload/tickWeaponReload.
- **Comando/procedimento:** node tests/combat.cjs; node tests/weapon-state.cjs.
- **Preparação:** PROT com somente essa arma, sem módulos; alvo imóvel de vida elevada em alcance.
- **Entradas e passos:** Emitir ciclo completo, segurar/soltar fogo, completar recarga e observar característica intrínseca.
- **Resultado esperado:** Dano60/pellet; intervalo1.05s; 1pellets/emissão; 2cartuchos; recarga cheia2.4s; velocidade750px/s; vida1.3s. Aplicar flags/retorno/explosão descritos na tabela da arma, sem contar pellets como cartuchos.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetir após pausa e após reinício; verificar ausência de efeitos duplicados.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-reserveBank — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito vazia (raiz). Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer reserveBank em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Proteção consumível separada: começa em 20, máximo 40. Converte 50% do excesso de cura. Dano que excede a reserva atinge a integridade. Custo/limite: Recarga das armas ×1,10. Efeitos diretos editáveis padrão: Multiplicador de recarga × 1.1. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-shieldDrive — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito com todos: reserveBank, shield. Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer shieldDrive em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Dano dos cartuchos ×1,20 enquanto o Escudo Capacitivo estiver pronto. Custo/limite: Exige Banco e Escudo Capacitivo. Reserva sozinha não mantém o bônus. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-cleanCircuit — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito com todos: reserveBank. Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer cleanCircuit em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Dano dos cartuchos +10% após 15 s sem impactos; +20% após 30 s, máximo. Custo/limite: Qualquer impacto aceito, inclusive absorvido, zera a sequência. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-pulseRecovery — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito com todos: reserveBank, sensor. Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer pulseRecovery em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Abate direto do sensor repõe 4 de reserva e antecipa em 8 s o Escudo Capacitivo descarregado. Custo/limite: Exige Banco e Sensor. Até 3 abates beneficiados por pulso; estados transmitidos não contam. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-rotors — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito vazia (raiz). Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer rotors em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Dois discos orbitam o robô e causam 55% do dano direto por contato. Cada disco acerta o mesmo alvo no máximo uma vez por volta. Custo/limite: Dano direto ×0,9. Suporte não ativa efeitos de bala. Efeitos diretos editáveis padrão: Dano direto × 0.9. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-rotorThird — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito com todos: rotors. Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer rotorThird em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Acrescenta um disco orbital; máximo três. Custo/limite: Dano dos rotores ÷1,25. Efeitos diretos editáveis padrão: Dano dos rotores ÷ 1.25. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-rotorReach — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito com todos: rotors. Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer rotorReach em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Raio da órbita ×1,5. A faixa de contato se afasta do robô. Custo/limite: Duração de cada volta ×1,25. Efeitos diretos editáveis padrão: Raio dos rotores × 1.5; Duração da volta dos rotores × 1.25. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-rotorDrive — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito com todos: rotors. Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer rotorDrive em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Duração de cada volta ×0,65. Custo/limite: Dano dos rotores ×0,8. Efeitos diretos editáveis padrão: Duração da volta dos rotores × 0.65; Dano dos rotores × 0.8. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-sensor — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito vazia (raiz). Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer sensor em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Pulso a cada 3 s atinge inimigos em raio 170; dano de 35% da base da arma. Sem munição ou mira automática da arma. Custo/limite: Tempo de recarga da arma ×1,15. Efeitos diretos editáveis padrão: Multiplicador de recarga × 1.15. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-sensorRange — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito com todos: sensor. Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer sensorRange em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Alcance do sensor ×1,5. Custo/limite: Intervalo do sensor ×1,2. Não reinicia a carga em andamento. Efeitos diretos editáveis padrão: Alcance do sensor × 1.5; Intervalo do sensor × 1.2. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-sensorRelay — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito com todos: sensor. Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer sensorRelay em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** O pulso transmite queimadura e resfriamento adquiridos ou intrínsecos da arma. Custo/limite: Dano do sensor ÷1,25. Não transmite corrosão, descarga, explosão, crítico ou empurrão. Efeitos diretos editáveis padrão: Dano do sensor ÷ 1.25. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-sensorLock — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito com todos: sensor. Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer sensorLock em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Sobreviventes do pulso ficam expostos por 2 s: tiros manuais causam +25% de dano. Custo/limite: Dano do sensor ×0,75. Escudos bloqueiam a exposição; não acumula. Efeitos diretos editáveis padrão: Dano do sensor × 0.75. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-corrosion — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito vazia (raiz). Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer corrosion em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Impactos marcam sobreviventes: após 2 s, causam novamente o dano da bala. Uma carga por alvo; sem renovar ou acumular. Custo/limite: Dano direto ×0,85. Escudos bloqueiam a aplicação. Efeitos diretos editáveis padrão: Dano direto × 0.85. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-corrosionFuse — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito com todos: corrosion. Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer corrosionFuse em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Prazo das novas cargas ×0,5. Custo/limite: Dano das novas cargas ×0,75. Efeitos diretos editáveis padrão: Prazo da corrosão × 0.5; Dano da corrosão × 0.75. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-corrosionBloom — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito com todos: corrosion. Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer corrosionBloom em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Morte de um alvo com carga primária transfere metade da carga a até dois vizinhos próximos. Custo/limite: Recarga ×1,15. Cargas transferidas não se propagam; escudos bloqueiam o respingo. Efeitos diretos editáveis padrão: Multiplicador de recarga × 1.15. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-corrosionCatalyst — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito com todos: corrosion. Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer corrosionCatalyst em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Detonação corrosiva causa +50% de dano se o alvo ainda estiver queimando ou resfriado. Custo/limite: Dano direto ÷1,15. Fogo e gelo não acumulam este bônus. Efeitos diretos editáveis padrão: Dano direto ÷ 1.15. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-damage — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito vazia (raiz). Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer damage em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Dano ×2. Custo/limite:  Efeitos diretos editáveis padrão: Dano direto × 2. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-bossHunter — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito com todos: damage. Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer bossHunter em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Dano contra chefe ×3. Derrotar um chefe recupera mais20 de integridade. Custo/limite: Alcance dos projéteis ÷1,5. Efeitos diretos editáveis padrão: Duração dos projéteis ÷ 1.5. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-finisher — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito com todos: damage. Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer finisher em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Dano ×3 contra alvos com até um terço da vida. Custo/limite: Velocidade das balas ÷1,5. Efeitos diretos editáveis padrão: Velocidade dos projéteis ÷ 1.5. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-crit — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito com todos: damage. Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer crit em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Cada quinto disparo causa dano ×3. Custo/limite: Capacidade do carregador ÷1,25 (mínimo 1). Efeitos diretos editáveis padrão: Multiplicador do carregador ÷ 1.25. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-rate — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito vazia (raiz). Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer rate em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Cadência ×3. Custo/limite:  Efeitos diretos editáveis padrão: Intervalo de disparo ÷ 3. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-extra — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito com todos: rate. Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer extra em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Projéteis por disparo ×2. Custo/limite: Dispersão ×1,5 e alcance ÷1,5. Efeitos diretos editáveis padrão: Multiplicador de projéteis × 2; Dispersão × 1.5; Duração dos projéteis ÷ 1.5. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-ricochet — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito com todos: rate. Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer ricochet em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Cada bala busca um alvo adicional após esgotar perfuração. Custo/limite: Tempo de recarga ×1,5. Não combina com disco. Efeitos diretos editáveis padrão: Multiplicador de recarga × 1.5. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-range — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito com todos: rate. Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer range em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Alcance dos projéteis ×3. Custo/limite: Tamanho das balas ÷1,25. Efeitos diretos editáveis padrão: Duração dos projéteis × 3; Tamanho dos projéteis ÷ 1.25. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-armor — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito vazia (raiz). Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer armor em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Reduz 2 de dano por golpe; mínimo recebido 1. Custo/limite: Velocidade de movimento dividida por 1,25. Efeitos diretos editáveis padrão: Armadura + 2; Velocidade de movimento ÷ 1.25. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-titan — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito com todos: armor. Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer titan em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Vida máxima e atual ×3. Com Blindagem Reforçada, converte3% da vida máxima em dano por projétil, limitado a75% do dano direto. Custo/limite: Velocidade ÷1,5 e tempo de recarga ×1,5. Efeitos diretos editáveis padrão: Integridade máxima × 3; Integridade atual × 3; Velocidade de movimento ÷ 1.5; Multiplicador de recarga × 1.5. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-salvage — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito com todos: armor. Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer salvage em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** A cada 20 zumbis mortos, recupera uma bateria (20 de vida). Custo/limite: Alcance de coleta ÷1,25. Não ultrapassa a vida máxima. Efeitos diretos editáveis padrão: Alcance de coleta ÷ 1.25. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-regen — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito com todos: armor. Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer regen em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Após 3 s parado, recupera 2 de vida por segundo. Custo/limite: Dano das balas ÷1,25. Mover interrompe o reparo. Efeitos diretos editáveis padrão: Dano direto ÷ 1.25. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-magnet — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito vazia (raiz). Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer magnet em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Alcance de coleta ×3. Custo/limite:  Efeitos diretos editáveis padrão: Alcance de coleta × 3. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-xp — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito com todos: magnet. Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer xp em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Experiência por núcleo ×2. Custo/limite: Tempo de recarga ×1,5. Efeitos diretos editáveis padrão: Multiplicador de recarga × 1.5. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-repair — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito com todos: magnet. Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer repair em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Recargas recuperam até5 de vida proporcionalmente à munição reposta. Custo/limite: Tempo de recarga ×1,25. Só funciona após gastar munição. Efeitos diretos editáveis padrão: Multiplicador de recarga × 1.25. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-killAmmo — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito com todos: magnet. Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer killAmmo em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Capacidade do carregador ×3; a cada 10 mortes, devolve uma munição. Não repõe munição ao instalar. Custo/limite:  Efeitos diretos editáveis padrão: Multiplicador do carregador × 3. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-burn — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito vazia (raiz). Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer burn em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Impactos queimam por 3 s: metade do dano da bala por segundo. Em armas incendiárias, a queimadura ganha mais25%. Custo/limite: Alcance dos projéteis ÷1,25. Efeitos diretos editáveis padrão: Duração dos projéteis ÷ 1.25. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-thermal — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito com todos: burn. Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer thermal em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Queimadura causa dano ×3 enquanto o alvo está resfriado. Custo/limite: Dano direto das balas ÷1,5. Exige resfriar o alvo. Efeitos diretos editáveis padrão: Dano direto ÷ 1.5. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-ignition — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito com todos: burn. Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer ignition em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Duração da queimadura ×3. Custo/limite: Tempo de recarga ×1,5. Efeitos diretos editáveis padrão: Multiplicador de recarga × 1.5. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-afterburn — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito com todos: burn. Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer afterburn em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Dano da queimadura ×3. Custo/limite: Cadência ÷1,5. Efeitos diretos editáveis padrão: Intervalo de disparo × 1.5. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-freeze — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito vazia (raiz). Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer freeze em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Impactos deixam o movimento inimigo ÷2 por 2 s; em armas criogênicas, dura3 s. Custo/limite: Velocidade dos projéteis ÷1,25. Efeitos diretos editáveis padrão: Velocidade dos projéteis ÷ 1.25. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-pierce — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito com todos: freeze. Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer pierce em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Projéteis atravessam dois alvos adicionais. Custo/limite:  Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-knock — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito com todos: freeze. Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer knock em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Empurra uma distância curta; chefes recebem um quarto do empurrão. Custo/limite: Cadência ÷1,5. Efeitos diretos editáveis padrão: Intervalo de disparo × 1.5. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-coldReload — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito com todos: freeze. Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer coldReload em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Ao terminar uma recarga, resfria alvos em uma área média por 4 s. Custo/limite: Tempo de recarga ×1,5. Efeitos diretos editáveis padrão: Multiplicador de recarga × 1.5. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-shock — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito vazia (raiz). Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer shock em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Impactos atingem outro alvo com metade do dano; perfuração amplia para três. Em armas elétricas, soma os alvos e aumenta o dano elétrico em25%. Custo/limite: Dano direto das balas ÷1,5. Efeitos diretos editáveis padrão: Dano direto ÷ 1.5. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-conductivity — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito com todos: shock. Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer conductivity em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Alcance elétrico ×3. Custo/limite: Alcance dos projéteis ÷1,5. Efeitos diretos editáveis padrão: Duração dos projéteis ÷ 1.5. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-stun — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito com todos: shock. Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer stun em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Descargas param movimento por 1 s; chefe por um quarto de segundo. Custo/limite: Cadência ÷1,5. Não cancela ataques. Efeitos diretos editáveis padrão: Intervalo de disparo × 1.5. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-shield — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito com todos: shock. Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer shield em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Absorve um impacto e recarrega em 120 s de combate. Custo/limite: Velocidade de movimento ÷1,5. Efeitos diretos editáveis padrão: Velocidade de movimento ÷ 1.5. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-dash — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito vazia (raiz). Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer dash em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** ESPAÇO: avanço de 0,15 s com velocidade ×3. Recarga 4 s. Custo/limite: Não concede invulnerabilidade. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-speed — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito com todos: dash. Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer speed em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Velocidade de movimento ×2. Custo/limite: Vida máxima e atual ÷1,5; mínimo 1. Efeitos diretos editáveis padrão: Velocidade de movimento × 2; Integridade máxima ÷ 1.5; Integridade atual ÷ 1.5. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-grace — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito com todos: dash. Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer grace em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Proteção normal após sofrer dano ×2. Custo/limite: Capacidade do carregador ÷1,25 (mínimo 1). Efeitos diretos editáveis padrão: Multiplicador do carregador ÷ 1.25. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-emergency — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito com todos: dash. Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer emergency em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Ao sobreviver a dano, ganha 3 s de proteção. Recarga 120 s de combate. Custo/limite: Alcance de coleta ÷1,25. Não ressuscita. Efeitos diretos editáveis padrão: Alcance de coleta ÷ 1.25. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-blast — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito vazia (raiz). Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer blast em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Cada impacto cria uma explosão pequena, causando metade do dano a outros alvos. Em armas explosivas, aumenta o dano da explosão em25%. Custo/limite: Tempo de recarga ×1,5. Efeitos diretos editáveis padrão: Multiplicador de recarga × 1.5. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-blastRadius — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito com todos: blast. Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer blastRadius em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Raio das explosões ×2. Custo/limite: Dano direto das balas ÷1,5. Efeitos diretos editáveis padrão: Dano direto ÷ 1.5. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-retaliation — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito com todos: blast. Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer retaliation em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Ao sobreviver a dano, cria uma explosão média com dano ×3. Recarga 120 s. Custo/limite: Vida máxima e atual ÷1,5; mínimo 1. Efeitos diretos editáveis padrão: Integridade máxima ÷ 1.5; Integridade atual ÷ 1.5. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-overload — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito com todos: blast. Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer overload em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Ao sobreviver a dano, ganha cadência ×3 por 6 s. Recarga 120 s de combate. Custo/limite: Tempo de recarga da arma ×1,5. Efeitos diretos editáveis padrão: Multiplicador de recarga × 1.5. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-drones — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito vazia (raiz). Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer drones em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Acrescenta um drone; máximo3. Cada drone causa25% do dano direto a cada0,8s, no alcance320px. Custo/limite: Tempo de recarga ×1,15. Efeitos diretos editáveis padrão: Multiplicador de recarga × 1.15. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-dronePair — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito com todos: drones. Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer dronePair em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Acrescenta um drone; máximo3 incluindo o drone do ENXA. Custo/limite: Dano direto ÷1,15. Efeitos diretos editáveis padrão: Dano direto ÷ 1.15. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-droneOverclock — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito com todos: drones. Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer droneOverclock em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Intervalo de ataque dos drones ×0,7; mínimo0,35s. Custo/limite: Alcance dos drones ÷1,15. Efeitos diretos editáveis padrão: Intervalo dos drones × 0.7; Alcance dos drones ÷ 1.15. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-MOD-droneArc — Módulo normal
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SKILLS/moduleSkill; balance.js: catálogo/aplicação.
- **Comando/procedimento:** node tests/build-mechanics.cjs; node tests/balance-panel.cjs; fixture por ID.
- **Preparação:** Reset PROT/Metralhadora; adquirir legalmente a cadeia de pré-requisito com todos: drones. Fotografar estado imediatamente antes do módulo.
- **Entradas e passos:** Oferecer droneArc em fixture legal, inspecionar e confirmar uma vez; tentar duplicar e executar seu gatilho real.
- **Resultado esperado:** Ataque do drone atinge um segundo alvo a até160px por metade do dano. Custo/limite: Dano dos drones ÷1,2. Efeitos diretos editáveis padrão: Dano dos drones ÷ 1.2. Conferir fórmula completa e interações da tabela específica deste módulo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Pai ausente, já adquirido, pausa, reset, escudo e fonte proibida quando aplicáveis.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-GAMB-pulseCoil — Gambiarra
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: GAMBARRAS/offerBlessing/chooseBlessing.
- **Comando/procedimento:** node tests/combat.cjs; fixture por ID.
- **Preparação:** Tentativa nova com equipamento/skills que satisfazem a elegibilidade descrita; guardar recursos/ammo/recarga anteriores.
- **Entradas e passos:** Abrir oferta de tipo correto em fixture declarada; aceitar pulseCoil, tentar repetir, executar condição e iniciar outra tentativa.
- **Resultado esperado:** Dano ×1,25 nesta tentativa. Não inventar penalidade adicional. Sem custo monetário oculto, munição reposta ou persistência de atributo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Recusa, callback antigo, oferta inelegível, pool esgotado, morte/reset e mais de um slot.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-GAMB-triggerRegulator — Gambiarra
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: GAMBARRAS/offerBlessing/chooseBlessing.
- **Comando/procedimento:** node tests/combat.cjs; fixture por ID.
- **Preparação:** Tentativa nova com equipamento/skills que satisfazem a elegibilidade descrita; guardar recursos/ammo/recarga anteriores.
- **Entradas e passos:** Abrir oferta de tipo correto em fixture declarada; aceitar triggerRegulator, tentar repetir, executar condição e iniciar outra tentativa.
- **Resultado esperado:** Intervalo entre disparos ×0,8 nesta tentativa. Não inventar penalidade adicional. Sem custo monetário oculto, munição reposta ou persistência de atributo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Recusa, callback antigo, oferta inelegível, pool esgotado, morte/reset e mais de um slot.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-GAMB-spareBattery — Gambiarra
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: GAMBARRAS/offerBlessing/chooseBlessing.
- **Comando/procedimento:** node tests/combat.cjs; fixture por ID.
- **Preparação:** Tentativa nova com equipamento/skills que satisfazem a elegibilidade descrita; guardar recursos/ammo/recarga anteriores.
- **Entradas e passos:** Abrir oferta de tipo correto em fixture declarada; aceitar spareBattery, tentar repetir, executar condição e iniciar outra tentativa.
- **Resultado esperado:** Vida máxima e atual +20 nesta tentativa. Não inventar penalidade adicional. Sem custo monetário oculto, munição reposta ou persistência de atributo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Recusa, callback antigo, oferta inelegível, pool esgotado, morte/reset e mais de um slot.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-GAMB-scrapMagnet — Gambiarra
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: GAMBARRAS/offerBlessing/chooseBlessing.
- **Comando/procedimento:** node tests/combat.cjs; fixture por ID.
- **Preparação:** Tentativa nova com equipamento/skills que satisfazem a elegibilidade descrita; guardar recursos/ammo/recarga anteriores.
- **Entradas e passos:** Abrir oferta de tipo correto em fixture declarada; aceitar scrapMagnet, tentar repetir, executar condição e iniciar outra tentativa.
- **Resultado esperado:** Alcance de coleta ×1,75 nesta tentativa. Não inventar penalidade adicional. Sem custo monetário oculto, munição reposta ou persistência de atributo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Recusa, callback antigo, oferta inelegível, pool esgotado, morte/reset e mais de um slot.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-GAMB-greasedServos — Gambiarra
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: GAMBARRAS/offerBlessing/chooseBlessing.
- **Comando/procedimento:** node tests/combat.cjs; fixture por ID.
- **Preparação:** Tentativa nova com equipamento/skills que satisfazem a elegibilidade descrita; guardar recursos/ammo/recarga anteriores.
- **Entradas e passos:** Abrir oferta de tipo correto em fixture declarada; aceitar greasedServos, tentar repetir, executar condição e iniciar outra tentativa.
- **Resultado esperado:** Velocidade de movimento ×1,2 nesta tentativa. Não inventar penalidade adicional. Sem custo monetário oculto, munição reposta ou persistência de atributo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Recusa, callback antigo, oferta inelegível, pool esgotado, morte/reset e mais de um slot.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-GAMB-copperPlate — Gambiarra
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: GAMBARRAS/offerBlessing/chooseBlessing.
- **Comando/procedimento:** node tests/combat.cjs; fixture por ID.
- **Preparação:** Tentativa nova com equipamento/skills que satisfazem a elegibilidade descrita; guardar recursos/ammo/recarga anteriores.
- **Entradas e passos:** Abrir oferta de tipo correto em fixture declarada; aceitar copperPlate, tentar repetir, executar condição e iniciar outra tentativa.
- **Resultado esperado:** Reduz 1 de dano recebido nesta tentativa. Não inventar penalidade adicional. Sem custo monetário oculto, munição reposta ou persistência de atributo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Recusa, callback antigo, oferta inelegível, pool esgotado, morte/reset e mais de um slot.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-EXP-volatileReactor — Experimento
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: BOSS_EXPERIMENTS/offerExperiment/chooseExperiment.
- **Comando/procedimento:** node tests/combat.cjs; fixture por ID.
- **Preparação:** Tentativa nova com equipamento/skills que satisfazem a elegibilidade descrita; guardar recursos/ammo/recarga anteriores.
- **Entradas e passos:** Abrir oferta de tipo correto em fixture declarada; aceitar volatileReactor, tentar repetir, executar condição e iniciar outra tentativa.
- **Resultado esperado:** Dano ×1,35. Custo: Intervalo de tiro ×1,15. Sem custo monetário oculto, munição reposta ou persistência de atributo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Recusa, callback antigo, oferta inelegível, pool esgotado, morte/reset e mais de um slot.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-EXP-unstableLens — Experimento
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: BOSS_EXPERIMENTS/offerExperiment/chooseExperiment.
- **Comando/procedimento:** node tests/combat.cjs; fixture por ID.
- **Preparação:** Tentativa nova com equipamento/skills que satisfazem a elegibilidade descrita; guardar recursos/ammo/recarga anteriores.
- **Entradas e passos:** Abrir oferta de tipo correto em fixture declarada; aceitar unstableLens, tentar repetir, executar condição e iniciar outra tentativa.
- **Resultado esperado:** Velocidade e tamanho de projétil ×1,5. Custo: Movimento ×0,85. Sem custo monetário oculto, munição reposta ou persistência de atributo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Recusa, callback antigo, oferta inelegível, pool esgotado, morte/reset e mais de um slot.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-EXP-lithiumPack — Experimento
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: BOSS_EXPERIMENTS/offerExperiment/chooseExperiment.
- **Comando/procedimento:** node tests/combat.cjs; fixture por ID.
- **Preparação:** Tentativa nova com equipamento/skills que satisfazem a elegibilidade descrita; guardar recursos/ammo/recarga anteriores.
- **Entradas e passos:** Abrir oferta de tipo correto em fixture declarada; aceitar lithiumPack, tentar repetir, executar condição e iniciar outra tentativa.
- **Resultado esperado:** Integridade máxima e atual +30. Custo: Armadura −1. Sem custo monetário oculto, munição reposta ou persistência de atributo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Recusa, callback antigo, oferta inelegível, pool esgotado, morte/reset e mais de um slot.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-EXP-scrapCatalyst — Experimento
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: BOSS_EXPERIMENTS/offerExperiment/chooseExperiment.
- **Comando/procedimento:** node tests/combat.cjs; fixture por ID.
- **Preparação:** Tentativa nova com equipamento/skills que satisfazem a elegibilidade descrita; guardar recursos/ammo/recarga anteriores.
- **Entradas e passos:** Abrir oferta de tipo correto em fixture declarada; aceitar scrapCatalyst, tentar repetir, executar condição e iniciar outra tentativa.
- **Resultado esperado:** Alcance de coleta ×2. Custo: Recarga da arma ×1,5. Sem custo monetário oculto, munição reposta ou persistência de atributo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Recusa, callback antigo, oferta inelegível, pool esgotado, morte/reset e mais de um slot.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-EXP-blastCondenser — Experimento
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: BOSS_EXPERIMENTS/offerExperiment/chooseExperiment.
- **Comando/procedimento:** node tests/combat.cjs; fixture por ID.
- **Preparação:** Tentativa nova com equipamento/skills que satisfazem a elegibilidade descrita; guardar recursos/ammo/recarga anteriores.
- **Entradas e passos:** Abrir oferta de tipo correto em fixture declarada; aceitar blastCondenser, tentar repetir, executar condição e iniciar outra tentativa.
- **Resultado esperado:** Dano ×1,5. Custo: Intervalo de tiro ×1,35. Sem custo monetário oculto, munição reposta ou persistência de atributo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Recusa, callback antigo, oferta inelegível, pool esgotado, morte/reset e mais de um slot.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-EXP-nervousServo — Experimento
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: BOSS_EXPERIMENTS/offerExperiment/chooseExperiment.
- **Comando/procedimento:** node tests/combat.cjs; fixture por ID.
- **Preparação:** Tentativa nova com equipamento/skills que satisfazem a elegibilidade descrita; guardar recursos/ammo/recarga anteriores.
- **Entradas e passos:** Abrir oferta de tipo correto em fixture declarada; aceitar nervousServo, tentar repetir, executar condição e iniciar outra tentativa.
- **Resultado esperado:** Movimento ×1,35. Custo: Armadura −1. Sem custo monetário oculto, munição reposta ou persistência de atributo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Recusa, callback antigo, oferta inelegível, pool esgotado, morte/reset e mais de um slot.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-RELIC-thermalRelay — Relíquia
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: BOSS_RELICS/offerBossRelic/chooseRelic e handlers próprios.
- **Comando/procedimento:** node tests/boss-relics.cjs; testes de Baia/Colimador/Culatra/Matriz.
- **Preparação:** Tentativa nova com equipamento/skills que satisfazem a elegibilidade descrita; guardar recursos/ammo/recarga anteriores.
- **Entradas e passos:** Abrir oferta de tipo correto em fixture declarada; aceitar thermalRelay, tentar repetir, executar condição e iniciar outra tentativa.
- **Resultado esperado:** Queimaduras causam +50% de dano. Não inventar penalidade adicional. Sem custo monetário oculto, munição reposta ou persistência de atributo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Recusa, callback antigo, oferta inelegível, pool esgotado, morte/reset e mais de um slot.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-RELIC-cryoLens — Relíquia
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: BOSS_RELICS/offerBossRelic/chooseRelic e handlers próprios.
- **Comando/procedimento:** node tests/boss-relics.cjs; testes de Baia/Colimador/Culatra/Matriz.
- **Preparação:** Tentativa nova com equipamento/skills que satisfazem a elegibilidade descrita; guardar recursos/ammo/recarga anteriores.
- **Entradas e passos:** Abrir oferta de tipo correto em fixture declarada; aceitar cryoLens, tentar repetir, executar condição e iniciar outra tentativa.
- **Resultado esperado:** Resfriamento dos impactos dura +50%. Não inventar penalidade adicional. Sem custo monetário oculto, munição reposta ou persistência de atributo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Recusa, callback antigo, oferta inelegível, pool esgotado, morte/reset e mais de um slot.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-RELIC-arcCapacitor — Relíquia
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: BOSS_RELICS/offerBossRelic/chooseRelic e handlers próprios.
- **Comando/procedimento:** node tests/boss-relics.cjs; testes de Baia/Colimador/Culatra/Matriz.
- **Preparação:** Tentativa nova com equipamento/skills que satisfazem a elegibilidade descrita; guardar recursos/ammo/recarga anteriores.
- **Entradas e passos:** Abrir oferta de tipo correto em fixture declarada; aceitar arcCapacitor, tentar repetir, executar condição e iniciar outra tentativa.
- **Resultado esperado:** Descargas causam +40% de dano. Não inventar penalidade adicional. Sem custo monetário oculto, munição reposta ou persistência de atributo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Recusa, callback antigo, oferta inelegível, pool esgotado, morte/reset e mais de um slot.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-RELIC-droneRack — Relíquia
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: BOSS_RELICS/offerBossRelic/chooseRelic e handlers próprios.
- **Comando/procedimento:** node tests/boss-relics.cjs; testes de Baia/Colimador/Culatra/Matriz.
- **Preparação:** Tentativa nova com equipamento/skills que satisfazem a elegibilidade descrita; guardar recursos/ammo/recarga anteriores.
- **Entradas e passos:** Abrir oferta de tipo correto em fixture declarada; aceitar droneRack, tentar repetir, executar condição e iniciar outra tentativa.
- **Resultado esperado:** Drones: dano +50% e alcance +20%. Aos 30/60/90 s ativos, o treino aumenta o dano já modificado em +10%/+20%/+30%. Não inventar penalidade adicional. Sem custo monetário oculto, munição reposta ou persistência de atributo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Recusa, callback antigo, oferta inelegível, pool esgotado, morte/reset e mais de um slot.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-RELIC-vitalLink — Relíquia
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: BOSS_RELICS/offerBossRelic/chooseRelic e handlers próprios.
- **Comando/procedimento:** node tests/boss-relics.cjs; testes de Baia/Colimador/Culatra/Matriz.
- **Preparação:** Tentativa nova com equipamento/skills que satisfazem a elegibilidade descrita; guardar recursos/ammo/recarga anteriores.
- **Entradas e passos:** Abrir oferta de tipo correto em fixture declarada; aceitar vitalLink, tentar repetir, executar condição e iniciar outra tentativa.
- **Resultado esperado:** Cada ataque de drone recebe dano extra igual a 2,5% da sua integridade atual, limitado ao dano-base do próprio drone. Máximo próprio ×2; não cria drones nem muda a cadência. Não inventar penalidade adicional. Sem custo monetário oculto, munição reposta ou persistência de atributo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Recusa, callback antigo, oferta inelegível, pool esgotado, morte/reset e mais de um slot.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-RELIC-scanArray — Relíquia
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: BOSS_RELICS/offerBossRelic/chooseRelic e handlers próprios.
- **Comando/procedimento:** node tests/boss-relics.cjs; testes de Baia/Colimador/Culatra/Matriz.
- **Preparação:** Tentativa nova com equipamento/skills que satisfazem a elegibilidade descrita; guardar recursos/ammo/recarga anteriores.
- **Entradas e passos:** Abrir oferta de tipo correto em fixture declarada; aceitar scanArray, tentar repetir, executar condição e iniciar outra tentativa.
- **Resultado esperado:** Sensores causam +50% de dano e pulsam 20% mais rápido. Não inventar penalidade adicional. Sem custo monetário oculto, munição reposta ou persistência de atributo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Recusa, callback antigo, oferta inelegível, pool esgotado, morte/reset e mais de um slot.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-RELIC-rotorBearing — Relíquia
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: BOSS_RELICS/offerBossRelic/chooseRelic e handlers próprios.
- **Comando/procedimento:** node tests/boss-relics.cjs; testes de Baia/Colimador/Culatra/Matriz.
- **Preparação:** Tentativa nova com equipamento/skills que satisfazem a elegibilidade descrita; guardar recursos/ammo/recarga anteriores.
- **Entradas e passos:** Abrir oferta de tipo correto em fixture declarada; aceitar rotorBearing, tentar repetir, executar condição e iniciar outra tentativa.
- **Resultado esperado:** Rotores causam +50% de dano e completam a volta 20% mais rápido. Não inventar penalidade adicional. Sem custo monetário oculto, munição reposta ou persistência de atributo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Recusa, callback antigo, oferta inelegível, pool esgotado, morte/reset e mais de um slot.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-RELIC-corrosionChamber — Relíquia
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: BOSS_RELICS/offerBossRelic/chooseRelic e handlers próprios.
- **Comando/procedimento:** node tests/boss-relics.cjs; testes de Baia/Colimador/Culatra/Matriz.
- **Preparação:** Tentativa nova com equipamento/skills que satisfazem a elegibilidade descrita; guardar recursos/ammo/recarga anteriores.
- **Entradas e passos:** Abrir oferta de tipo correto em fixture declarada; aceitar corrosionChamber, tentar repetir, executar condição e iniciar outra tentativa.
- **Resultado esperado:** Novas cargas corrosivas causam +50% de dano e detonam 25% antes. Não inventar penalidade adicional. Sem custo monetário oculto, munição reposta ou persistência de atributo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Recusa, callback antigo, oferta inelegível, pool esgotado, morte/reset e mais de um slot.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-RELIC-precisionBreech — Relíquia
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: BOSS_RELICS/offerBossRelic/chooseRelic e handlers próprios.
- **Comando/procedimento:** node tests/boss-relics.cjs; testes de Baia/Colimador/Culatra/Matriz.
- **Preparação:** Tentativa nova com equipamento/skills que satisfazem a elegibilidade descrita; guardar recursos/ammo/recarga anteriores.
- **Entradas e passos:** Abrir oferta de tipo correto em fixture declarada; aceitar precisionBreech, tentar repetir, executar condição e iniciar outra tentativa.
- **Resultado esperado:** Canhão de precisão e arpão causam +40% de dano. Não inventar penalidade adicional. Sem custo monetário oculto, munição reposta ou persistência de atributo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Recusa, callback antigo, oferta inelegível, pool esgotado, morte/reset e mais de um slot.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-RELIC-blastManifold — Relíquia
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: BOSS_RELICS/offerBossRelic/chooseRelic e handlers próprios.
- **Comando/procedimento:** node tests/boss-relics.cjs; testes de Baia/Colimador/Culatra/Matriz.
- **Preparação:** Tentativa nova com equipamento/skills que satisfazem a elegibilidade descrita; guardar recursos/ammo/recarga anteriores.
- **Entradas e passos:** Abrir oferta de tipo correto em fixture declarada; aceitar blastManifold, tentar repetir, executar condição e iniciar outra tentativa.
- **Resultado esperado:** Lança-foguetes e lança-granadas causam +40% de dano. Não inventar penalidade adicional. Sem custo monetário oculto, munição reposta ou persistência de atributo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Recusa, callback antigo, oferta inelegível, pool esgotado, morte/reset e mais de um slot.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-RELIC-feedServo — Relíquia
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: BOSS_RELICS/offerBossRelic/chooseRelic e handlers próprios.
- **Comando/procedimento:** node tests/boss-relics.cjs; testes de Baia/Colimador/Culatra/Matriz.
- **Preparação:** Tentativa nova com equipamento/skills que satisfazem a elegibilidade descrita; guardar recursos/ammo/recarga anteriores.
- **Entradas e passos:** Abrir oferta de tipo correto em fixture declarada; aceitar feedServo, tentar repetir, executar condição e iniciar outra tentativa.
- **Resultado esperado:** Todas as armas recarregam 25% mais rápido. Não repõe munição ao instalar. Não inventar penalidade adicional. Sem custo monetário oculto, munição reposta ou persistência de atributo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Recusa, callback antigo, oferta inelegível, pool esgotado, morte/reset e mais de um slot.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-RELIC-reactorHeart — Relíquia
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: BOSS_RELICS/offerBossRelic/chooseRelic e handlers próprios.
- **Comando/procedimento:** node tests/boss-relics.cjs; testes de Baia/Colimador/Culatra/Matriz.
- **Preparação:** Tentativa nova com equipamento/skills que satisfazem a elegibilidade descrita; guardar recursos/ammo/recarga anteriores.
- **Entradas e passos:** Abrir oferta de tipo correto em fixture declarada; aceitar reactorHeart, tentar repetir, executar condição e iniciar outra tentativa.
- **Resultado esperado:** Ganha 30 de integridade máxima e recupera até 30 de integridade. Não inventar penalidade adicional. Sem custo monetário oculto, munição reposta ou persistência de atributo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Recusa, callback antigo, oferta inelegível, pool esgotado, morte/reset e mais de um slot.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-RELIC-overclockCore — Relíquia
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: BOSS_RELICS/offerBossRelic/chooseRelic e handlers próprios.
- **Comando/procedimento:** node tests/boss-relics.cjs; testes de Baia/Colimador/Culatra/Matriz.
- **Preparação:** Tentativa nova com equipamento/skills que satisfazem a elegibilidade descrita; guardar recursos/ammo/recarga anteriores.
- **Entradas e passos:** Abrir oferta de tipo correto em fixture declarada; aceitar overclockCore, tentar repetir, executar condição e iniciar outra tentativa.
- **Resultado esperado:** Todas as armas causam +25% de dano. Não inventar penalidade adicional. Sem custo monetário oculto, munição reposta ou persistência de atributo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Recusa, callback antigo, oferta inelegível, pool esgotado, morte/reset e mais de um slot.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-RELIC-fieldCollimator — Relíquia
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: BOSS_RELICS/offerBossRelic/chooseRelic e handlers próprios.
- **Comando/procedimento:** node tests/boss-relics.cjs; testes de Baia/Colimador/Culatra/Matriz.
- **Preparação:** Tentativa nova com equipamento/skills que satisfazem a elegibilidade descrita; guardar recursos/ammo/recarga anteriores.
- **Entradas e passos:** Abrir oferta de tipo correto em fixture declarada; aceitar fieldCollimator, tentar repetir, executar condição e iniciar outra tentativa.
- **Resultado esperado:** Ao mirar, fixa um campo por 4 s; repete a cada 6 s. Tiros que o atravessam ganham +35% de dano uma única vez. Não inventar penalidade adicional. Sem custo monetário oculto, munição reposta ou persistência de atributo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Recusa, callback antigo, oferta inelegível, pool esgotado, morte/reset e mais de um slot.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-RELIC-rivetMatrix — Relíquia
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: BOSS_RELICS/offerBossRelic/chooseRelic e handlers próprios.
- **Comando/procedimento:** node tests/boss-relics.cjs; testes de Baia/Colimador/Culatra/Matriz.
- **Preparação:** Tentativa nova com equipamento/skills que satisfazem a elegibilidade descrita; guardar recursos/ammo/recarga anteriores.
- **Entradas e passos:** Abrir oferta de tipo correto em fixture declarada; aceitar rivetMatrix, tentar repetir, executar condição e iniciar outra tentativa.
- **Resultado esperado:** E ou botão MATRIZ: instala na mira, entre 48 e 180 px, por 18 s. Seus tiros a alimentam; uma carga completa dispara 3 rebites com +10% de energia. Até 3 salvas; tiros absorvidos são consumidos. Não inventar penalidade adicional. Sem custo monetário oculto, munição reposta ou persistência de atributo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Recusa, callback antigo, oferta inelegível, pool esgotado, morte/reset e mais de um slot.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-RELIC-reloadBlade — Relíquia
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: BOSS_RELICS/offerBossRelic/chooseRelic e handlers próprios.
- **Comando/procedimento:** node tests/boss-relics.cjs; testes de Baia/Colimador/Culatra/Matriz.
- **Preparação:** Tentativa nova com equipamento/skills que satisfazem a elegibilidade descrita; guardar recursos/ammo/recarga anteriores.
- **Entradas e passos:** Abrir oferta de tipo correto em fixture declarada; aceitar reloadBlade, tentar repetir, executar condição e iniciar outra tentativa.
- **Resultado esperado:** Nas próximas recargas, segure o disparo para cortar à frente da mira. A lâmina ganha força durante a recarga; soltar o disparo interrompe o corte. Cada arma tem sua própria lâmina. Não inventar penalidade adicional. Sem custo monetário oculto, munição reposta ou persistência de atributo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Recusa, callback antigo, oferta inelegível, pool esgotado, morte/reset e mais de um slot.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-RELIC-reloadPiston — Relíquia
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: BOSS_RELICS/offerBossRelic/chooseRelic e handlers próprios.
- **Comando/procedimento:** node tests/boss-relics.cjs; testes de Baia/Colimador/Culatra/Matriz.
- **Preparação:** Tentativa nova com equipamento/skills que satisfazem a elegibilidade descrita; guardar recursos/ammo/recarga anteriores.
- **Entradas e passos:** Abrir oferta de tipo correto em fixture declarada; aceitar reloadPiston, tentar repetir, executar condição e iniciar outra tentativa.
- **Resultado esperado:** Ao concluir as próximas recargas, invoca um pistão na direção da mira. Dano de 90% do cartucho, proporcional à munição reposta; atravessa até 3 corpos em 216 px. Um por arma; sem mira válida, não invoca. Não inventar penalidade adicional. Sem custo monetário oculto, munição reposta ou persistência de atributo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Recusa, callback antigo, oferta inelegível, pool esgotado, morte/reset e mais de um slot.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-RELIC-integrityPulse — Relíquia
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: BOSS_RELICS/offerBossRelic/chooseRelic e handlers próprios.
- **Comando/procedimento:** node tests/boss-relics.cjs; testes de Baia/Colimador/Culatra/Matriz.
- **Preparação:** Tentativa nova com equipamento/skills que satisfazem a elegibilidade descrita; guardar recursos/ammo/recarga anteriores.
- **Entradas e passos:** Abrir oferta de tipo correto em fixture declarada; aceitar integrityPulse, tentar repetir, executar condição e iniciar outra tentativa.
- **Resultado esperado:** Consumir o último cartucho emitido libera um pulso em raio 90. Dano igual a 20% da integridade máxima, dividido pelo número de armas. Uma vez por cartucho; recarregar não ativa. Não inventar penalidade adicional. Sem custo monetário oculto, munição reposta ou persistência de atributo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Recusa, callback antigo, oferta inelegível, pool esgotado, morte/reset e mais de um slot.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-RELIC-ruptureChamber — Relíquia
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: BOSS_RELICS/offerBossRelic/chooseRelic e handlers próprios.
- **Comando/procedimento:** node tests/boss-relics.cjs; testes de Baia/Colimador/Culatra/Matriz.
- **Preparação:** Tentativa nova com equipamento/skills que satisfazem a elegibilidade descrita; guardar recursos/ammo/recarga anteriores.
- **Entradas e passos:** Abrir oferta de tipo correto em fixture declarada; aceitar ruptureChamber, tentar repetir, executar condição e iniciar outra tentativa.
- **Resultado esperado:** Cada cartucho gasto guarda 1 carga (máx. 60/arma). O último soma +25% por carga, contando a dele. Recarregar antes descarta as cargas. Não inventar penalidade adicional. Sem custo monetário oculto, munição reposta ou persistência de atributo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Recusa, callback antigo, oferta inelegível, pool esgotado, morte/reset e mais de um slot.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-PROTOCOL-tailDecoy — Protocolo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SPECIALIZATIONS/chooseSpecialization e gatilhos.
- **Comando/procedimento:** node tests/build-mechanics.cjs; fixture por ID.
- **Preparação:** Chassi prot, nível9→10, sem protocolo. Preparar condição real do protocolo sem bônus ocultos.
- **Entradas e passos:** Verificar que tailDecoy não instala antes do marco; escolher no10; acionar seu gatilho e cooldown.
- **Resultado esperado:** Após sofrer dano não letal, deixa um eco por 1,5 s que atrai perseguidores comuns. Recarga 24 s. Limite/custo: Chefes, lacaios e atiradores ignoram o eco. Vale somente nesta tentativa.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Cura efetiva/overheal/dano letal, escudo, chefe e fonte quando aplicáveis; token antigo e reset.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-PROTOCOL-predatorMark — Protocolo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SPECIALIZATIONS/chooseSpecialization e gatilhos.
- **Comando/procedimento:** node tests/build-mechanics.cjs; fixture por ID.
- **Preparação:** Chassi prot, nível9→10, sem protocolo. Preparar condição real do protocolo sem bônus ocultos.
- **Entradas e passos:** Verificar que predatorMark não instala antes do marco; escolher no10; acionar seu gatilho e cooldown.
- **Resultado esperado:** O primeiro acerto marca um alvo por 2,5 s. Acertos seguintes nele causam +25% de dano. Limite/custo: Só um alvo marcado; acertar outro transfere a marca. Vale somente nesta tentativa.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Cura efetiva/overheal/dano letal, escudo, chefe e fonte quando aplicáveis; token antigo e reset.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-PROTOCOL-nineLives — Protocolo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SPECIALIZATIONS/chooseSpecialization e gatilhos.
- **Comando/procedimento:** node tests/build-mechanics.cjs; fixture por ID.
- **Preparação:** Chassi prot, nível9→10, sem protocolo. Preparar condição real do protocolo sem bônus ocultos.
- **Entradas e passos:** Verificar que nineLives não instala antes do marco; escolher no10; acionar seu gatilho e cooldown.
- **Resultado esperado:** Ao cruzar abaixo de 20% de integridade, empurra comuns próximos em 90 px e interrompe por 0,5 s. Raio 100 px; recarga 30 s. Limite/custo: Não cura nem concede invulnerabilidade; exige sobreviver ao golpe. Vale somente nesta tentativa.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Cura efetiva/overheal/dano letal, escudo, chefe e fonte quando aplicáveis; token antigo e reset.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-PROTOCOL-grounding — Protocolo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SPECIALIZATIONS/chooseSpecialization e gatilhos.
- **Comando/procedimento:** node tests/build-mechanics.cjs; fixture por ID.
- **Preparação:** Chassi bastion, nível9→10, sem protocolo. Preparar condição real do protocolo sem bônus ocultos.
- **Entradas e passos:** Verificar que grounding não instala antes do marco; escolher no10; acionar seu gatilho e cooldown.
- **Resultado esperado:** Recebe 30% menos dano das zonas de perigo dos chefes. Limite/custo: Não reduz contato nem projéteis. Vale somente nesta tentativa.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Cura efetiva/overheal/dano letal, escudo, chefe e fonte quando aplicáveis; token antigo e reset.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-PROTOCOL-magneticBrake — Protocolo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SPECIALIZATIONS/chooseSpecialization e gatilhos.
- **Comando/procedimento:** node tests/build-mechanics.cjs; fixture por ID.
- **Preparação:** Chassi bastion, nível9→10, sem protocolo. Preparar condição real do protocolo sem bônus ocultos.
- **Entradas e passos:** Verificar que magneticBrake não instala antes do marco; escolher no10; acionar seu gatilho e cooldown.
- **Resultado esperado:** Projéteis hostis dentro de 90 px movem-se 25% mais devagar. Limite/custo: Não afeta investidas nem projéteis do jogador. Vale somente nesta tentativa.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Cura efetiva/overheal/dano letal, escudo, chefe e fonte quando aplicáveis; token antigo e reset.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-PROTOCOL-threatReader — Protocolo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SPECIALIZATIONS/chooseSpecialization e gatilhos.
- **Comando/procedimento:** node tests/build-mechanics.cjs; fixture por ID.
- **Preparação:** Chassi bastion, nível9→10, sem protocolo. Preparar condição real do protocolo sem bônus ocultos.
- **Entradas e passos:** Verificar que threatReader não instala antes do marco; escolher no10; acionar seu gatilho e cooldown.
- **Resultado esperado:** Avisos de chefe iniciados a até 180 px duram 20% mais. Limite/custo: Não retarda a execução dos ataques nem altera o relógio. Vale somente nesta tentativa.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Cura efetiva/overheal/dano letal, escudo, chefe e fonte quando aplicáveis; token antigo e reset.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-PROTOCOL-furnaceDuration — Protocolo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SPECIALIZATIONS/chooseSpecialization e gatilhos.
- **Comando/procedimento:** node tests/build-mechanics.cjs; fixture por ID.
- **Preparação:** Chassi forge, nível9→10, sem protocolo. Preparar condição real do protocolo sem bônus ocultos.
- **Entradas e passos:** Verificar que furnaceDuration não instala antes do marco; escolher no10; acionar seu gatilho e cooldown.
- **Resultado esperado:** Duração da queimadura ×1,5. Limite/custo: Afeta queimaduras aplicadas após a escolha. Vale somente nesta tentativa.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Cura efetiva/overheal/dano letal, escudo, chefe e fonte quando aplicáveis; token antigo e reset.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-PROTOCOL-thermalAmplifier — Protocolo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SPECIALIZATIONS/chooseSpecialization e gatilhos.
- **Comando/procedimento:** node tests/build-mechanics.cjs; fixture por ID.
- **Preparação:** Chassi forge, nível9→10, sem protocolo. Preparar condição real do protocolo sem bônus ocultos.
- **Entradas e passos:** Verificar que thermalAmplifier não instala antes do marco; escolher no10; acionar seu gatilho e cooldown.
- **Resultado esperado:** Queimadura em alvos resfriados causa +25% de dano. Limite/custo: Exige resfriar o alvo. Vale somente nesta tentativa.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Cura efetiva/overheal/dano letal, escudo, chefe e fonte quando aplicáveis; token antigo e reset.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-PROTOCOL-heatRecovery — Protocolo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SPECIALIZATIONS/chooseSpecialization e gatilhos.
- **Comando/procedimento:** node tests/build-mechanics.cjs; fixture por ID.
- **Preparação:** Chassi forge, nível9→10, sem protocolo. Preparar condição real do protocolo sem bônus ocultos.
- **Entradas e passos:** Verificar que heatRecovery não instala antes do marco; escolher no10; acionar seu gatilho e cooldown.
- **Resultado esperado:** Abates por queimadura recuperam1 de integridade. Recarga2s. Limite/custo: Sem cura em integridade cheia. Vale somente nesta tentativa.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Cura efetiva/overheal/dano letal, escudo, chefe e fonte quando aplicáveis; token antigo e reset.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-PROTOCOL-extraFork — Protocolo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SPECIALIZATIONS/chooseSpecialization e gatilhos.
- **Comando/procedimento:** node tests/build-mechanics.cjs; fixture por ID.
- **Preparação:** Chassi volt, nível9→10, sem protocolo. Preparar condição real do protocolo sem bônus ocultos.
- **Entradas e passos:** Verificar que extraFork não instala antes do marco; escolher no10; acionar seu gatilho e cooldown.
- **Resultado esperado:** Descargas atingem um alvo adicional. Limite/custo: Exige arma elétrica ou Descarga. Vale somente nesta tentativa.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Cura efetiva/overheal/dano letal, escudo, chefe e fonte quando aplicáveis; token antigo e reset.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-PROTOCOL-chargeRecovery — Protocolo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SPECIALIZATIONS/chooseSpecialization e gatilhos.
- **Comando/procedimento:** node tests/build-mechanics.cjs; fixture por ID.
- **Preparação:** Chassi volt, nível9→10, sem protocolo. Preparar condição real do protocolo sem bônus ocultos.
- **Entradas e passos:** Verificar que chargeRecovery não instala antes do marco; escolher no10; acionar seu gatilho e cooldown.
- **Resultado esperado:** A cada6 alvos eletrocutados repõe uma munição. Recarga0,25s. Limite/custo: Não ultrapassa o carregador. Vale somente nesta tentativa.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Cura efetiva/overheal/dano letal, escudo, chefe e fonte quando aplicáveis; token antigo e reset.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-PROTOCOL-groundPulse — Protocolo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SPECIALIZATIONS/chooseSpecialization e gatilhos.
- **Comando/procedimento:** node tests/build-mechanics.cjs; fixture por ID.
- **Preparação:** Chassi volt, nível9→10, sem protocolo. Preparar condição real do protocolo sem bônus ocultos.
- **Entradas e passos:** Verificar que groundPulse não instala antes do marco; escolher no10; acionar seu gatilho e cooldown.
- **Resultado esperado:** Descargas interrompem comuns por mais0,35s; chefes por0,1s. Limite/custo: Não cancela ataques já preparados. Vale somente nesta tentativa.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Cura efetiva/overheal/dano letal, escudo, chefe e fonte quando aplicáveis; token antigo e reset.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-PROTOCOL-repairCharge — Protocolo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SPECIALIZATIONS/chooseSpecialization e gatilhos.
- **Comando/procedimento:** node tests/build-mechanics.cjs; fixture por ID.
- **Preparação:** Chassi nano, nível9→10, sem protocolo. Preparar condição real do protocolo sem bônus ocultos.
- **Entradas e passos:** Verificar que repairCharge não instala antes do marco; escolher no10; acionar seu gatilho e cooldown.
- **Resultado esperado:** Cura real fortalece o próximo disparo em50% e acrescenta2 perfurações. Limite/custo: Não acumula; uma emissão consome a carga. Vale somente nesta tentativa.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Cura efetiva/overheal/dano letal, escudo, chefe e fonte quando aplicáveis; token antigo e reset.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-PROTOCOL-repairPlating — Protocolo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SPECIALIZATIONS/chooseSpecialization e gatilhos.
- **Comando/procedimento:** node tests/build-mechanics.cjs; fixture por ID.
- **Preparação:** Chassi nano, nível9→10, sem protocolo. Preparar condição real do protocolo sem bônus ocultos.
- **Entradas e passos:** Verificar que repairPlating não instala antes do marco; escolher no10; acionar seu gatilho e cooldown.
- **Resultado esperado:** Cura real concede redução2 de dano por2s. Limite/custo: Não acumula proteção. Vale somente nesta tentativa.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Cura efetiva/overheal/dano letal, escudo, chefe e fonte quando aplicáveis; token antigo e reset.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-PROTOCOL-coolantLoop — Protocolo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SPECIALIZATIONS/chooseSpecialization e gatilhos.
- **Comando/procedimento:** node tests/build-mechanics.cjs; fixture por ID.
- **Preparação:** Chassi nano, nível9→10, sem protocolo. Preparar condição real do protocolo sem bônus ocultos.
- **Entradas e passos:** Verificar que coolantLoop não instala antes do marco; escolher no10; acionar seu gatilho e cooldown.
- **Resultado esperado:** Recarga de ao menos50% resfria inimigos em80px por2s. Limite/custo: Exige recarregar metade do carregador. Vale somente nesta tentativa.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Cura efetiva/overheal/dano letal, escudo, chefe e fonte quando aplicáveis; token antigo e reset.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-PROTOCOL-droneSalvage — Protocolo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SPECIALIZATIONS/chooseSpecialization e gatilhos.
- **Comando/procedimento:** node tests/build-mechanics.cjs; fixture por ID.
- **Preparação:** Chassi swarm, nível9→10, sem protocolo. Preparar condição real do protocolo sem bônus ocultos.
- **Entradas e passos:** Verificar que droneSalvage não instala antes do marco; escolher no10; acionar seu gatilho e cooldown.
- **Resultado esperado:** Abates por drone curam1 de integridade. Recarga1,5s. Limite/custo: Somente abates do drone. Vale somente nesta tentativa.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Cura efetiva/overheal/dano letal, escudo, chefe e fonte quando aplicáveis; token antigo e reset.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-PROTOCOL-droneBossFocus — Protocolo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SPECIALIZATIONS/chooseSpecialization e gatilhos.
- **Comando/procedimento:** node tests/build-mechanics.cjs; fixture por ID.
- **Preparação:** Chassi swarm, nível9→10, sem protocolo. Preparar condição real do protocolo sem bônus ocultos.
- **Entradas e passos:** Verificar que droneBossFocus não instala antes do marco; escolher no10; acionar seu gatilho e cooldown.
- **Resultado esperado:** Drones priorizam chefe no alcance e causam +25% de dano nele. Limite/custo: Não aumenta alcance. Vale somente nesta tentativa.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Cura efetiva/overheal/dano letal, escudo, chefe e fonte quando aplicáveis; token antigo e reset.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-PROTOCOL-droneRelay — Protocolo
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: SPECIALIZATIONS/chooseSpecialization e gatilhos.
- **Comando/procedimento:** node tests/build-mechanics.cjs; fixture por ID.
- **Preparação:** Chassi swarm, nível9→10, sem protocolo. Preparar condição real do protocolo sem bônus ocultos.
- **Entradas e passos:** Verificar que droneRelay não instala antes do marco; escolher no10; acionar seu gatilho e cooldown.
- **Resultado esperado:** Alcance dos drones +100px; coleta ×1,25. Limite/custo: Não aumenta o número de drones. Vale somente nesta tentativa.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Cura efetiva/overheal/dano letal, escudo, chefe e fonte quando aplicáveis; token antigo e reset.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-REFIT-machine-heavyFeed — Reforja
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: installWeaponEvolution/chooseWeaponEvolution/WEAPON_EVOLUTIONS.
- **Comando/procedimento:** node tests/weapon-evolution.cjs.
- **Preparação:** Arma machine no slot testado; nível19→20; munição parcial, recarga ativa e projétil antigo registrados.
- **Entradas e passos:** Escolher machine-heavyFeed no marco legal e emitir um novo tiro após retomar.
- **Resultado esperado:** Dano por projétil ×1,3. Tempo de recarga ×1,2. damage×1.3; reloadMult×1.2. Traços específicos da tabela devem aparecer só em tiros novos; não terminar recarga, repor munição ou reescrever projétil anterior.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetição/recusa, próximo slot, callback antigo, duas opções por arma e reset.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-REFIT-machine-beltFeed — Reforja
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: installWeaponEvolution/chooseWeaponEvolution/WEAPON_EVOLUTIONS.
- **Comando/procedimento:** node tests/weapon-evolution.cjs.
- **Preparação:** Arma machine no slot testado; nível19→20; munição parcial, recarga ativa e projétil antigo registrados.
- **Entradas e passos:** Escolher machine-beltFeed no marco legal e emitir um novo tiro após retomar.
- **Resultado esperado:** Capacidade do carregador ×1,5. Tempo de recarga ×1,15. Não repõe munição ao instalar. magazineMult×1.5; reloadMult×1.15. Traços específicos da tabela devem aparecer só em tiros novos; não terminar recarga, repor munição ou reescrever projétil anterior.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetição/recusa, próximo slot, callback antigo, duas opções por arma e reset.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-REFIT-shotgun-choke — Reforja
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: installWeaponEvolution/chooseWeaponEvolution/WEAPON_EVOLUTIONS.
- **Comando/procedimento:** node tests/weapon-evolution.cjs.
- **Preparação:** Arma shotgun no slot testado; nível19→20; munição parcial, recarga ativa e projétil antigo registrados.
- **Entradas e passos:** Escolher shotgun-choke no marco legal e emitir um novo tiro após retomar.
- **Resultado esperado:** Dispersão ×0,5 e dano ×1,15. Intervalo entre disparos ×1,15. spreadMult×0.5; damage×1.15; rate×1.15. Traços específicos da tabela devem aparecer só em tiros novos; não terminar recarga, repor munição ou reescrever projétil anterior.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetição/recusa, próximo slot, callback antigo, duas opções por arma e reset.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-REFIT-shotgun-wideBore — Reforja
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: installWeaponEvolution/chooseWeaponEvolution/WEAPON_EVOLUTIONS.
- **Comando/procedimento:** node tests/weapon-evolution.cjs.
- **Preparação:** Arma shotgun no slot testado; nível19→20; munição parcial, recarga ativa e projétil antigo registrados.
- **Entradas e passos:** Escolher shotgun-wideBore no marco legal e emitir um novo tiro após retomar.
- **Resultado esperado:** Dois pellets adicionais por emissão, antes dos multiplicadores. Dano por pellet ×0,8 e tempo de recarga ×1,2. damage×0.8; reloadMult×1.2; pellets+2. Traços específicos da tabela devem aparecer só em tiros novos; não terminar recarga, repor munição ou reescrever projétil anterior.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetição/recusa, próximo slot, callback antigo, duas opções por arma e reset.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-REFIT-burst-fourStroke — Reforja
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: installWeaponEvolution/chooseWeaponEvolution/WEAPON_EVOLUTIONS.
- **Comando/procedimento:** node tests/weapon-evolution.cjs.
- **Preparação:** Arma burst no slot testado; nível19→20; munição parcial, recarga ativa e projétil antigo registrados.
- **Entradas e passos:** Escolher burst-fourStroke no marco legal e emitir um novo tiro após retomar.
- **Resultado esperado:** Uma bala adicional em cada rajada. Intervalo entre rajadas ×1,2 e tempo de recarga ×1,15. rate×1.2; reloadMult×1.15; burst+1. Traços específicos da tabela devem aparecer só em tiros novos; não terminar recarga, repor munição ou reescrever projétil anterior.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetição/recusa, próximo slot, callback antigo, duas opções por arma e reset.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-REFIT-burst-quickBreech — Reforja
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: installWeaponEvolution/chooseWeaponEvolution/WEAPON_EVOLUTIONS.
- **Comando/procedimento:** node tests/weapon-evolution.cjs.
- **Preparação:** Arma burst no slot testado; nível19→20; munição parcial, recarga ativa e projétil antigo registrados.
- **Entradas e passos:** Escolher burst-quickBreech no marco legal e emitir um novo tiro após retomar.
- **Resultado esperado:** Tempo de recarga ×0,75. Dano por bala ×0,9. reloadMult×0.75; damage×0.9. Traços específicos da tabela devem aparecer só em tiros novos; não terminar recarga, repor munição ou reescrever projétil anterior.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetição/recusa, próximo slot, callback antigo, duas opções por arma e reset.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-REFIT-sniper-railDrill — Reforja
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: installWeaponEvolution/chooseWeaponEvolution/WEAPON_EVOLUTIONS.
- **Comando/procedimento:** node tests/weapon-evolution.cjs.
- **Preparação:** Arma sniper no slot testado; nível19→20; munição parcial, recarga ativa e projétil antigo registrados.
- **Entradas e passos:** Escolher sniper-railDrill no marco legal e emitir um novo tiro após retomar.
- **Resultado esperado:** Atravessa três alvos adicionais e dano ×1,2. Intervalo entre disparos ×1,2. damage×1.2; rate×1.2; pierce+3. Traços específicos da tabela devem aparecer só em tiros novos; não terminar recarga, repor munição ou reescrever projétil anterior.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetição/recusa, próximo slot, callback antigo, duas opções por arma e reset.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-REFIT-sniper-cyclingBolt — Reforja
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: installWeaponEvolution/chooseWeaponEvolution/WEAPON_EVOLUTIONS.
- **Comando/procedimento:** node tests/weapon-evolution.cjs.
- **Preparação:** Arma sniper no slot testado; nível19→20; munição parcial, recarga ativa e projétil antigo registrados.
- **Entradas e passos:** Escolher sniper-cyclingBolt no marco legal e emitir um novo tiro após retomar.
- **Resultado esperado:** Intervalo entre disparos ×0,75. Dano por projétil ×0,9. rate×0.75; damage×0.9. Traços específicos da tabela devem aparecer só em tiros novos; não terminar recarga, repor munição ou reescrever projétil anterior.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetição/recusa, próximo slot, callback antigo, duas opções por arma e reset.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-REFIT-laser-pulseClock — Reforja
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: installWeaponEvolution/chooseWeaponEvolution/WEAPON_EVOLUTIONS.
- **Comando/procedimento:** node tests/weapon-evolution.cjs.
- **Preparação:** Arma laser no slot testado; nível19→20; munição parcial, recarga ativa e projétil antigo registrados.
- **Entradas e passos:** Escolher laser-pulseClock no marco legal e emitir um novo tiro após retomar.
- **Resultado esperado:** Intervalo entre disparos ×0,75. Tempo de recarga ×1,25. rate×0.75; reloadMult×1.25. Traços específicos da tabela devem aparecer só em tiros novos; não terminar recarga, repor munição ou reescrever projétil anterior.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetição/recusa, próximo slot, callback antigo, duas opções por arma e reset.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-REFIT-laser-longLens — Reforja
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: installWeaponEvolution/chooseWeaponEvolution/WEAPON_EVOLUTIONS.
- **Comando/procedimento:** node tests/weapon-evolution.cjs.
- **Preparação:** Arma laser no slot testado; nível19→20; munição parcial, recarga ativa e projétil antigo registrados.
- **Entradas e passos:** Escolher laser-longLens no marco legal e emitir um novo tiro após retomar.
- **Resultado esperado:** Duração do projétil ×1,5 e dano ×1,2. Intervalo entre disparos ×1,2. projectileLife×1.5; damage×1.2; rate×1.2. Traços específicos da tabela devem aparecer só em tiros novos; não terminar recarga, repor munição ou reescrever projétil anterior.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetição/recusa, próximo slot, callback antigo, duas opções por arma e reset.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-REFIT-flame-fuelMixer — Reforja
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: installWeaponEvolution/chooseWeaponEvolution/WEAPON_EVOLUTIONS.
- **Comando/procedimento:** node tests/weapon-evolution.cjs.
- **Preparação:** Arma flame no slot testado; nível19→20; munição parcial, recarga ativa e projétil antigo registrados.
- **Entradas e passos:** Escolher flame-fuelMixer no marco legal e emitir um novo tiro após retomar.
- **Resultado esperado:** Dano da queimadura aplicada ×1,5. Dano direto ×0,8; também reduz a base da queimadura. damage×0.8. Traços específicos da tabela devem aparecer só em tiros novos; não terminar recarga, repor munição ou reescrever projétil anterior.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetição/recusa, próximo slot, callback antigo, duas opções por arma e reset.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-REFIT-flame-longNozzle — Reforja
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: installWeaponEvolution/chooseWeaponEvolution/WEAPON_EVOLUTIONS.
- **Comando/procedimento:** node tests/weapon-evolution.cjs.
- **Preparação:** Arma flame no slot testado; nível19→20; munição parcial, recarga ativa e projétil antigo registrados.
- **Entradas e passos:** Escolher flame-longNozzle no marco legal e emitir um novo tiro após retomar.
- **Resultado esperado:** Duração dos projéteis ×1,75. Intervalo entre disparos ×1,2. projectileLife×1.75; rate×1.2. Traços específicos da tabela devem aparecer só em tiros novos; não terminar recarga, repor munição ou reescrever projétil anterior.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetição/recusa, próximo slot, callback antigo, duas opções por arma e reset.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-REFIT-cryo-iceDrill — Reforja
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: installWeaponEvolution/chooseWeaponEvolution/WEAPON_EVOLUTIONS.
- **Comando/procedimento:** node tests/weapon-evolution.cjs.
- **Preparação:** Arma cryo no slot testado; nível19→20; munição parcial, recarga ativa e projétil antigo registrados.
- **Entradas e passos:** Escolher cryo-iceDrill no marco legal e emitir um novo tiro após retomar.
- **Resultado esperado:** Atravessa dois alvos adicionais. Dano por projétil ×0,85. damage×0.85; pierce+2. Traços específicos da tabela devem aparecer só em tiros novos; não terminar recarga, repor munição ou reescrever projétil anterior.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetição/recusa, próximo slot, callback antigo, duas opções por arma e reset.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-REFIT-cryo-deepCooling — Reforja
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: installWeaponEvolution/chooseWeaponEvolution/WEAPON_EVOLUTIONS.
- **Comando/procedimento:** node tests/weapon-evolution.cjs.
- **Preparação:** Arma cryo no slot testado; nível19→20; munição parcial, recarga ativa e projétil antigo registrados.
- **Entradas e passos:** Escolher cryo-deepCooling no marco legal e emitir um novo tiro após retomar.
- **Resultado esperado:** Resfriamento por impacto dura mais 1 s; dano ×1,15. Intervalo entre disparos ×1,15. damage×1.15; rate×1.15. Traços específicos da tabela devem aparecer só em tiros novos; não terminar recarga, repor munição ou reescrever projétil anterior.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetição/recusa, próximo slot, callback antigo, duas opções por arma e reset.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-REFIT-rocket-siegeWarhead — Reforja
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: installWeaponEvolution/chooseWeaponEvolution/WEAPON_EVOLUTIONS.
- **Comando/procedimento:** node tests/weapon-evolution.cjs.
- **Preparação:** Arma rocket no slot testado; nível19→20; munição parcial, recarga ativa e projétil antigo registrados.
- **Entradas e passos:** Escolher rocket-siegeWarhead no marco legal e emitir um novo tiro após retomar.
- **Resultado esperado:** Raio intrínseco da explosão ×1,5. Dano ×0,85 e tempo de recarga ×1,15. damage×0.85; reloadMult×1.15. Traços específicos da tabela devem aparecer só em tiros novos; não terminar recarga, repor munição ou reescrever projétil anterior.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetição/recusa, próximo slot, callback antigo, duas opções por arma e reset.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-REFIT-rocket-guidedTube — Reforja
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: installWeaponEvolution/chooseWeaponEvolution/WEAPON_EVOLUTIONS.
- **Comando/procedimento:** node tests/weapon-evolution.cjs.
- **Preparação:** Arma rocket no slot testado; nível19→20; munição parcial, recarga ativa e projétil antigo registrados.
- **Entradas e passos:** Escolher rocket-guidedTube no marco legal e emitir um novo tiro após retomar.
- **Resultado esperado:** Velocidade dos projéteis ×1,6 e dano ×1,25. Raio intrínseco da explosão ×0,75. A mira continua manual. projectileSpeed×1.6; damage×1.25. Traços específicos da tabela devem aparecer só em tiros novos; não terminar recarga, repor munição ou reescrever projétil anterior.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetição/recusa, próximo slot, callback antigo, duas opções por arma e reset.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-REFIT-grenade-pressureShell — Reforja
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: installWeaponEvolution/chooseWeaponEvolution/WEAPON_EVOLUTIONS.
- **Comando/procedimento:** node tests/weapon-evolution.cjs.
- **Preparação:** Arma grenade no slot testado; nível19→20; munição parcial, recarga ativa e projétil antigo registrados.
- **Entradas e passos:** Escolher grenade-pressureShell no marco legal e emitir um novo tiro após retomar.
- **Resultado esperado:** Raio intrínseco da explosão ×1,3. Duração até detonar ×1,25. projectileLife×1.25. Traços específicos da tabela devem aparecer só em tiros novos; não terminar recarga, repor munição ou reescrever projétil anterior.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetição/recusa, próximo slot, callback antigo, duas opções por arma e reset.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-REFIT-grenade-doubleShell — Reforja
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: installWeaponEvolution/chooseWeaponEvolution/WEAPON_EVOLUTIONS.
- **Comando/procedimento:** node tests/weapon-evolution.cjs.
- **Preparação:** Arma grenade no slot testado; nível19→20; munição parcial, recarga ativa e projétil antigo registrados.
- **Entradas e passos:** Escolher grenade-doubleShell no marco legal e emitir um novo tiro após retomar.
- **Resultado esperado:** Uma granada adicional por emissão; dispersão em leque. Dano por granada ×0,65 e tempo de recarga ×1,25. damage×0.65; reloadMult×1.25; pellets+1. Traços específicos da tabela devem aparecer só em tiros novos; não terminar recarga, repor munição ou reescrever projétil anterior.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetição/recusa, próximo slot, callback antigo, duas opções por arma e reset.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-REFIT-tesla-branchCoil — Reforja
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: installWeaponEvolution/chooseWeaponEvolution/WEAPON_EVOLUTIONS.
- **Comando/procedimento:** node tests/weapon-evolution.cjs.
- **Preparação:** Arma tesla no slot testado; nível19→20; munição parcial, recarga ativa e projétil antigo registrados.
- **Entradas e passos:** Escolher tesla-branchCoil no marco legal e emitir um novo tiro após retomar.
- **Resultado esperado:** Descargas intrínsecas alcançam dois alvos adicionais. Dano direto e base elétrica ×0,85. damage×0.85; chain+2. Traços específicos da tabela devem aparecer só em tiros novos; não terminar recarga, repor munição ou reescrever projétil anterior.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetição/recusa, próximo slot, callback antigo, duas opções por arma e reset.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-REFIT-tesla-focusedCoil — Reforja
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: installWeaponEvolution/chooseWeaponEvolution/WEAPON_EVOLUTIONS.
- **Comando/procedimento:** node tests/weapon-evolution.cjs.
- **Preparação:** Arma tesla no slot testado; nível19→20; munição parcial, recarga ativa e projétil antigo registrados.
- **Entradas e passos:** Escolher tesla-focusedCoil no marco legal e emitir um novo tiro após retomar.
- **Resultado esperado:** Dano direto e base elétrica ×1,5. Um alvo intrínseco a menos; intervalo entre disparos ×1,15. damage×1.5; rate×1.15; chain+-1. Traços específicos da tabela devem aparecer só em tiros novos; não terminar recarga, repor munição ou reescrever projétil anterior.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetição/recusa, próximo slot, callback antigo, duas opções por arma e reset.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-REFIT-disc-fastRotor — Reforja
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: installWeaponEvolution/chooseWeaponEvolution/WEAPON_EVOLUTIONS.
- **Comando/procedimento:** node tests/weapon-evolution.cjs.
- **Preparação:** Arma disc no slot testado; nível19→20; munição parcial, recarga ativa e projétil antigo registrados.
- **Entradas e passos:** Escolher disc-fastRotor no marco legal e emitir um novo tiro após retomar.
- **Resultado esperado:** Velocidade dos projéteis ×1,4 e dano ×1,2. Duração do projétil ×0,8. projectileSpeed×1.4; damage×1.2; projectileLife×0.8. Traços específicos da tabela devem aparecer só em tiros novos; não terminar recarga, repor munição ou reescrever projétil anterior.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetição/recusa, próximo slot, callback antigo, duas opções por arma e reset.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-REFIT-disc-impactRim — Reforja
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: installWeaponEvolution/chooseWeaponEvolution/WEAPON_EVOLUTIONS.
- **Comando/procedimento:** node tests/weapon-evolution.cjs.
- **Preparação:** Arma disc no slot testado; nível19→20; munição parcial, recarga ativa e projétil antigo registrados.
- **Entradas e passos:** Escolher disc-impactRim no marco legal e emitir um novo tiro após retomar.
- **Resultado esperado:** Impactos ganham explosão intrínseca de raio 48, com metade do dano. Dano direto ×0,85 e tempo de recarga ×1,2. damage×0.85; reloadMult×1.2. Traços específicos da tabela devem aparecer só em tiros novos; não terminar recarga, repor munição ou reescrever projétil anterior.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetição/recusa, próximo slot, callback antigo, duas opções por arma e reset.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-REFIT-harpoon-longShaft — Reforja
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: installWeaponEvolution/chooseWeaponEvolution/WEAPON_EVOLUTIONS.
- **Comando/procedimento:** node tests/weapon-evolution.cjs.
- **Preparação:** Arma harpoon no slot testado; nível19→20; munição parcial, recarga ativa e projétil antigo registrados.
- **Entradas e passos:** Escolher harpoon-longShaft no marco legal e emitir um novo tiro após retomar.
- **Resultado esperado:** Atravessa três alvos adicionais e dano ×1,15. Intervalo entre disparos ×1,2. damage×1.15; rate×1.2; pierce+3. Traços específicos da tabela devem aparecer só em tiros novos; não terminar recarga, repor munição ou reescrever projétil anterior.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetição/recusa, próximo slot, callback antigo, duas opções por arma e reset.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-REFIT-harpoon-pressurePiston — Reforja
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** game.js: installWeaponEvolution/chooseWeaponEvolution/WEAPON_EVOLUTIONS.
- **Comando/procedimento:** node tests/weapon-evolution.cjs.
- **Preparação:** Arma harpoon no slot testado; nível19→20; munição parcial, recarga ativa e projétil antigo registrados.
- **Entradas e passos:** Escolher harpoon-pressurePiston no marco legal e emitir um novo tiro após retomar.
- **Resultado esperado:** Empurrão intrínseco +40; dano ×1,3 e velocidade do projétil ×1,3. Tempo de recarga ×1,2. Chefes mantêm resistência ao empurrão. damage×1.3; projectileSpeed×1.3; reloadMult×1.2; knock+40. Traços específicos da tabela devem aparecer só em tiros novos; não terminar recarga, repor munição ou reescrever projétil anterior.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Repetição/recusa, próximo slot, callback antigo, duas opções por arma e reset.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-BUILD-agulha-antitita — Build
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** builds.js: receitas; driver e telemetria de testes.
- **Comando/procedimento:** node tests/builds-balance.cjs --real-only.
- **Preparação:** Receita agulha-antitita: chassiprot, armasniper; só equipamento desbloqueado; versão/hash/piloto registrados.
- **Entradas e passos:** Executar as três sementes finais em partidas naturais independentes com escolhas legais, registrando todas as alternativas e falhas.
- **Resultado esperado:** Pelo menos2/3tentativas viáveis:1200s ativos,≥3chefes, skills centrais damage, bossHunter, freeze, rate. Registrar riscos e funcionamento do motor descrito na receita.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Não substituir casos canônicos por uma política que força preferência da relíquia nova. Horda e dano normais.
- **Falha:** P1.
- **Evidência:** Telemetria por tentativa e resumos por receita, com mortes no denominador..
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-BUILD-tempestade-balistica — Build
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** builds.js: receitas; driver e telemetria de testes.
- **Comando/procedimento:** node tests/builds-balance.cjs --real-only.
- **Preparação:** Receita tempestade-balistica: chassiprot, armalaser; só equipamento desbloqueado; versão/hash/piloto registrados.
- **Entradas e passos:** Executar as três sementes finais em partidas naturais independentes com escolhas legais, registrando todas as alternativas e falhas.
- **Resultado esperado:** Pelo menos2/3tentativas viáveis:1200s ativos,≥3chefes, skills centrais rate, extra, damage, crit. Registrar riscos e funcionamento do motor descrito na receita.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Não substituir casos canônicos por uma política que força preferência da relíquia nova. Horda e dano normais.
- **Falha:** P1.
- **Evidência:** Telemetria por tentativa e resumos por receita, com mortes no denominador..
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-BUILD-escopeta-ricochete — Build
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** builds.js: receitas; driver e telemetria de testes.
- **Comando/procedimento:** node tests/builds-balance.cjs --real-only.
- **Preparação:** Receita escopeta-ricochete: chassibastion, armashotgun; só equipamento desbloqueado; versão/hash/piloto registrados.
- **Entradas e passos:** Executar as três sementes finais em partidas naturais independentes com escolhas legais, registrando todas as alternativas e falhas.
- **Resultado esperado:** Pelo menos2/3tentativas viáveis:1200s ativos,≥3chefes, skills centrais rate, extra, freeze, pierce. Registrar riscos e funcionamento do motor descrito na receita.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Não substituir casos canônicos por uma política que força preferência da relíquia nova. Horda e dano normais.
- **Falha:** P1.
- **Evidência:** Telemetria por tentativa e resumos por receita, com mortes no denominador..
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-BUILD-cacador-criogenico — Build
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** builds.js: receitas; driver e telemetria de testes.
- **Comando/procedimento:** node tests/builds-balance.cjs --real-only.
- **Preparação:** Receita cacador-criogenico: chassiprot, armacryo; só equipamento desbloqueado; versão/hash/piloto registrados.
- **Entradas e passos:** Executar as três sementes finais em partidas naturais independentes com escolhas legais, registrando todas as alternativas e falhas.
- **Resultado esperado:** Pelo menos2/3tentativas viáveis:1200s ativos,≥3chefes, skills centrais damage, freeze, rate, pierce. Registrar riscos e funcionamento do motor descrito na receita.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Não substituir casos canônicos por uma política que força preferência da relíquia nova. Horda e dano normais.
- **Falha:** P1.
- **Evidência:** Telemetria por tentativa e resumos por receita, com mortes no denominador..
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-BUILD-forja-criogenica — Build
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** builds.js: receitas; driver e telemetria de testes.
- **Comando/procedimento:** node tests/builds-balance.cjs --real-only.
- **Preparação:** Receita forja-criogenica: chassiforge, armaflame; só equipamento desbloqueado; versão/hash/piloto registrados.
- **Entradas e passos:** Executar as três sementes finais em partidas naturais independentes com escolhas legais, registrando todas as alternativas e falhas.
- **Resultado esperado:** Pelo menos2/3tentativas viáveis:1200s ativos,≥3chefes, skills centrais burn, freeze, thermal, afterburn. Registrar riscos e funcionamento do motor descrito na receita.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Não substituir casos canônicos por uma política que força preferência da relíquia nova. Horda e dano normais.
- **Falha:** P1.
- **Evidência:** Telemetria por tentativa e resumos por receita, com mortes no denominador..
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-BUILD-rede-de-plasma — Build
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** builds.js: receitas; driver e telemetria de testes.
- **Comando/procedimento:** node tests/builds-balance.cjs --real-only.
- **Preparação:** Receita rede-de-plasma: chassivolt, armatesla; só equipamento desbloqueado; versão/hash/piloto registrados.
- **Entradas e passos:** Executar as três sementes finais em partidas naturais independentes com escolhas legais, registrando todas as alternativas e falhas.
- **Resultado esperado:** Pelo menos2/3tentativas viáveis:1200s ativos,≥3chefes, skills centrais shock, damage, burn, blast. Registrar riscos e funcionamento do motor descrito na receita.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Não substituir casos canônicos por uma política que força preferência da relíquia nova. Horda e dano normais.
- **Falha:** P1.
- **Evidência:** Telemetria por tentativa e resumos por receita, com mortes no denominador..
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-BUILD-demolicao-de-campo — Build
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** builds.js: receitas; driver e telemetria de testes.
- **Comando/procedimento:** node tests/builds-balance.cjs --real-only.
- **Preparação:** Receita demolicao-de-campo: chassibastion, armagrenade; só equipamento desbloqueado; versão/hash/piloto registrados.
- **Entradas e passos:** Executar as três sementes finais em partidas naturais independentes com escolhas legais, registrando todas as alternativas e falhas.
- **Resultado esperado:** Pelo menos2/3tentativas viáveis:1200s ativos,≥3chefes, skills centrais damage, rate, blast, blastRadius. Registrar riscos e funcionamento do motor descrito na receita.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Não substituir casos canônicos por uma política que força preferência da relíquia nova. Horda e dano normais.
- **Falha:** P1.
- **Evidência:** Telemetria por tentativa e resumos por receita, com mortes no denominador..
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-BUILD-oficina-viva — Build
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** builds.js: receitas; driver e telemetria de testes.
- **Comando/procedimento:** node tests/builds-balance.cjs --real-only.
- **Preparação:** Receita oficina-viva: chassinano, armashotgun; só equipamento desbloqueado; versão/hash/piloto registrados.
- **Entradas e passos:** Executar as três sementes finais em partidas naturais independentes com escolhas legais, registrando todas as alternativas e falhas.
- **Resultado esperado:** Pelo menos2/3tentativas viáveis:1200s ativos,≥3chefes, skills centrais magnet, repair, armor, titan. Registrar riscos e funcionamento do motor descrito na receita.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Não substituir casos canônicos por uma política que força preferência da relíquia nova. Horda e dano normais.
- **Falha:** P1.
- **Evidência:** Telemetria por tentativa e resumos por receita, com mortes no denominador..
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-BUILD-enxame-de-sucata — Build
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** builds.js: receitas; driver e telemetria de testes.
- **Comando/procedimento:** node tests/builds-balance.cjs --real-only.
- **Preparação:** Receita enxame-de-sucata: chassiswarm, armaharpoon; só equipamento desbloqueado; versão/hash/piloto registrados.
- **Entradas e passos:** Executar as três sementes finais em partidas naturais independentes com escolhas legais, registrando todas as alternativas e falhas.
- **Resultado esperado:** Pelo menos2/3tentativas viáveis:1200s ativos,≥3chefes, skills centrais drones, damage, dronePair, droneOverclock. Registrar riscos e funcionamento do motor descrito na receita.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Não substituir casos canônicos por uma política que força preferência da relíquia nova. Horda e dano normais.
- **Falha:** P1.
- **Evidência:** Telemetria por tentativa e resumos por receita, com mortes no denominador..
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-BUILD-lanca-de-fuga — Build
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** builds.js: receitas; driver e telemetria de testes.
- **Comando/procedimento:** node tests/builds-balance.cjs --real-only.
- **Preparação:** Receita lanca-de-fuga: chassinano, armaharpoon; só equipamento desbloqueado; versão/hash/piloto registrados.
- **Entradas e passos:** Executar as três sementes finais em partidas naturais independentes com escolhas legais, registrando todas as alternativas e falhas.
- **Resultado esperado:** Pelo menos2/3tentativas viáveis:1200s ativos,≥3chefes, skills centrais damage, magnet, repair, dash. Registrar riscos e funcionamento do motor descrito na receita.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Não substituir casos canônicos por uma política que força preferência da relíquia nova. Horda e dano normais.
- **Falha:** P1.
- **Evidência:** Telemetria por tentativa e resumos por receita, com mortes no denominador..
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-ATTR-hp — Editor
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** balance.js: validate/migrate/snapshot/apply/applyWeapon; editor local.
- **Comando/procedimento:** node tests/balance-panel.cjs; node tests/balance-migration.cjs.
- **Preparação:** Snapshot padrão; adicionar um módulo Normal customizado único com efeito attribute=Integridade atual, operator='=', value=50, unit vazio, preservando86canônicos.
- **Entradas e passos:** Validar/aplicar configuração; provar que tentativa atual não muda; iniciar outra tentativa, adquirir o customizado e observar atributo/efeito real.
- **Resultado esperado:** Campo hp=50 no destino correto; HP/movimento/suporte compartilhados uma vez, campos de arma por slot. Não repor munição nem completar recarga por editar capacidade/tempo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar limites do efeito (abs≤10000); distinguir importação inválida de valor válido depois limitado por clamps. HP≥1≤máximo, outros positivos≥0,001, valores diretos limitados a1e9; nenhuma execução de texto.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-ATTR-maxHp — Editor
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** balance.js: validate/migrate/snapshot/apply/applyWeapon; editor local.
- **Comando/procedimento:** node tests/balance-panel.cjs; node tests/balance-migration.cjs.
- **Preparação:** Snapshot padrão; adicionar um módulo Normal customizado único com efeito attribute=Integridade máxima, operator='=', value=200, unit vazio, preservando86canônicos.
- **Entradas e passos:** Validar/aplicar configuração; provar que tentativa atual não muda; iniciar outra tentativa, adquirir o customizado e observar atributo/efeito real.
- **Resultado esperado:** Campo maxHp=200 no destino correto; HP/movimento/suporte compartilhados uma vez, campos de arma por slot. Não repor munição nem completar recarga por editar capacidade/tempo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar limites do efeito (abs≤10000); distinguir importação inválida de valor válido depois limitado por clamps. HP≥1≤máximo, outros positivos≥0,001, valores diretos limitados a1e9; nenhuma execução de texto.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-ATTR-damage — Editor
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** balance.js: validate/migrate/snapshot/apply/applyWeapon; editor local.
- **Comando/procedimento:** node tests/balance-panel.cjs; node tests/balance-migration.cjs.
- **Preparação:** Snapshot padrão; adicionar um módulo Normal customizado único com efeito attribute=Dano direto, operator='=', value=40, unit vazio, preservando86canônicos.
- **Entradas e passos:** Validar/aplicar configuração; provar que tentativa atual não muda; iniciar outra tentativa, adquirir o customizado e observar atributo/efeito real.
- **Resultado esperado:** Campo damage=40 no destino correto; HP/movimento/suporte compartilhados uma vez, campos de arma por slot. Não repor munição nem completar recarga por editar capacidade/tempo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar limites do efeito (abs≤10000); distinguir importação inválida de valor válido depois limitado por clamps. HP≥1≤máximo, outros positivos≥0,001, valores diretos limitados a1e9; nenhuma execução de texto.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-ATTR-rate — Editor
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** balance.js: validate/migrate/snapshot/apply/applyWeapon; editor local.
- **Comando/procedimento:** node tests/balance-panel.cjs; node tests/balance-migration.cjs.
- **Preparação:** Snapshot padrão; adicionar um módulo Normal customizado único com efeito attribute=Intervalo de disparo, operator='=', value=0.2, unit vazio, preservando86canônicos.
- **Entradas e passos:** Validar/aplicar configuração; provar que tentativa atual não muda; iniciar outra tentativa, adquirir o customizado e observar atributo/efeito real.
- **Resultado esperado:** Campo rate=0.2 no destino correto; HP/movimento/suporte compartilhados uma vez, campos de arma por slot. Não repor munição nem completar recarga por editar capacidade/tempo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar limites do efeito (abs≤10000); distinguir importação inválida de valor válido depois limitado por clamps. HP≥1≤máximo, outros positivos≥0,001, valores diretos limitados a1e9; nenhuma execução de texto.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-ATTR-speed — Editor
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** balance.js: validate/migrate/snapshot/apply/applyWeapon; editor local.
- **Comando/procedimento:** node tests/balance-panel.cjs; node tests/balance-migration.cjs.
- **Preparação:** Snapshot padrão; adicionar um módulo Normal customizado único com efeito attribute=Velocidade de movimento, operator='=', value=200, unit vazio, preservando86canônicos.
- **Entradas e passos:** Validar/aplicar configuração; provar que tentativa atual não muda; iniciar outra tentativa, adquirir o customizado e observar atributo/efeito real.
- **Resultado esperado:** Campo speed=200 no destino correto; HP/movimento/suporte compartilhados uma vez, campos de arma por slot. Não repor munição nem completar recarga por editar capacidade/tempo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar limites do efeito (abs≤10000); distinguir importação inválida de valor válido depois limitado por clamps. HP≥1≤máximo, outros positivos≥0,001, valores diretos limitados a1e9; nenhuma execução de texto.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-ATTR-armor — Editor
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** balance.js: validate/migrate/snapshot/apply/applyWeapon; editor local.
- **Comando/procedimento:** node tests/balance-panel.cjs; node tests/balance-migration.cjs.
- **Preparação:** Snapshot padrão; adicionar um módulo Normal customizado único com efeito attribute=Armadura, operator='=', value=3, unit vazio, preservando86canônicos.
- **Entradas e passos:** Validar/aplicar configuração; provar que tentativa atual não muda; iniciar outra tentativa, adquirir o customizado e observar atributo/efeito real.
- **Resultado esperado:** Campo armor=3 no destino correto; HP/movimento/suporte compartilhados uma vez, campos de arma por slot. Não repor munição nem completar recarga por editar capacidade/tempo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar limites do efeito (abs≤10000); distinguir importação inválida de valor válido depois limitado por clamps. HP≥1≤máximo, outros positivos≥0,001, valores diretos limitados a1e9; nenhuma execução de texto.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-ATTR-magnet — Editor
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** balance.js: validate/migrate/snapshot/apply/applyWeapon; editor local.
- **Comando/procedimento:** node tests/balance-panel.cjs; node tests/balance-migration.cjs.
- **Preparação:** Snapshot padrão; adicionar um módulo Normal customizado único com efeito attribute=Alcance de coleta, operator='=', value=150, unit vazio, preservando86canônicos.
- **Entradas e passos:** Validar/aplicar configuração; provar que tentativa atual não muda; iniciar outra tentativa, adquirir o customizado e observar atributo/efeito real.
- **Resultado esperado:** Campo magnet=150 no destino correto; HP/movimento/suporte compartilhados uma vez, campos de arma por slot. Não repor munição nem completar recarga por editar capacidade/tempo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar limites do efeito (abs≤10000); distinguir importação inválida de valor válido depois limitado por clamps. HP≥1≤máximo, outros positivos≥0,001, valores diretos limitados a1e9; nenhuma execução de texto.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-ATTR-magazineMult — Editor
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** balance.js: validate/migrate/snapshot/apply/applyWeapon; editor local.
- **Comando/procedimento:** node tests/balance-panel.cjs; node tests/balance-migration.cjs.
- **Preparação:** Snapshot padrão; adicionar um módulo Normal customizado único com efeito attribute=Multiplicador do carregador, operator='=', value=2, unit vazio, preservando86canônicos.
- **Entradas e passos:** Validar/aplicar configuração; provar que tentativa atual não muda; iniciar outra tentativa, adquirir o customizado e observar atributo/efeito real.
- **Resultado esperado:** Campo magazineMult=2 no destino correto; HP/movimento/suporte compartilhados uma vez, campos de arma por slot. Não repor munição nem completar recarga por editar capacidade/tempo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar limites do efeito (abs≤10000); distinguir importação inválida de valor válido depois limitado por clamps. HP≥1≤máximo, outros positivos≥0,001, valores diretos limitados a1e9; nenhuma execução de texto.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-ATTR-reloadMult — Editor
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** balance.js: validate/migrate/snapshot/apply/applyWeapon; editor local.
- **Comando/procedimento:** node tests/balance-panel.cjs; node tests/balance-migration.cjs.
- **Preparação:** Snapshot padrão; adicionar um módulo Normal customizado único com efeito attribute=Multiplicador de recarga, operator='=', value=2, unit vazio, preservando86canônicos.
- **Entradas e passos:** Validar/aplicar configuração; provar que tentativa atual não muda; iniciar outra tentativa, adquirir o customizado e observar atributo/efeito real.
- **Resultado esperado:** Campo reloadMult=2 no destino correto; HP/movimento/suporte compartilhados uma vez, campos de arma por slot. Não repor munição nem completar recarga por editar capacidade/tempo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar limites do efeito (abs≤10000); distinguir importação inválida de valor válido depois limitado por clamps. HP≥1≤máximo, outros positivos≥0,001, valores diretos limitados a1e9; nenhuma execução de texto.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-ATTR-projectileMult — Editor
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** balance.js: validate/migrate/snapshot/apply/applyWeapon; editor local.
- **Comando/procedimento:** node tests/balance-panel.cjs; node tests/balance-migration.cjs.
- **Preparação:** Snapshot padrão; adicionar um módulo Normal customizado único com efeito attribute=Multiplicador de projéteis, operator='=', value=2, unit vazio, preservando86canônicos.
- **Entradas e passos:** Validar/aplicar configuração; provar que tentativa atual não muda; iniciar outra tentativa, adquirir o customizado e observar atributo/efeito real.
- **Resultado esperado:** Campo projectileMult=2 no destino correto; HP/movimento/suporte compartilhados uma vez, campos de arma por slot. Não repor munição nem completar recarga por editar capacidade/tempo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar limites do efeito (abs≤10000); distinguir importação inválida de valor válido depois limitado por clamps. HP≥1≤máximo, outros positivos≥0,001, valores diretos limitados a1e9; nenhuma execução de texto.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-ATTR-projectileSpeed — Editor
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** balance.js: validate/migrate/snapshot/apply/applyWeapon; editor local.
- **Comando/procedimento:** node tests/balance-panel.cjs; node tests/balance-migration.cjs.
- **Preparação:** Snapshot padrão; adicionar um módulo Normal customizado único com efeito attribute=Velocidade dos projéteis, operator='=', value=2, unit vazio, preservando86canônicos.
- **Entradas e passos:** Validar/aplicar configuração; provar que tentativa atual não muda; iniciar outra tentativa, adquirir o customizado e observar atributo/efeito real.
- **Resultado esperado:** Campo projectileSpeed=2 no destino correto; HP/movimento/suporte compartilhados uma vez, campos de arma por slot. Não repor munição nem completar recarga por editar capacidade/tempo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar limites do efeito (abs≤10000); distinguir importação inválida de valor válido depois limitado por clamps. HP≥1≤máximo, outros positivos≥0,001, valores diretos limitados a1e9; nenhuma execução de texto.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-ATTR-projectileSize — Editor
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** balance.js: validate/migrate/snapshot/apply/applyWeapon; editor local.
- **Comando/procedimento:** node tests/balance-panel.cjs; node tests/balance-migration.cjs.
- **Preparação:** Snapshot padrão; adicionar um módulo Normal customizado único com efeito attribute=Tamanho dos projéteis, operator='=', value=2, unit vazio, preservando86canônicos.
- **Entradas e passos:** Validar/aplicar configuração; provar que tentativa atual não muda; iniciar outra tentativa, adquirir o customizado e observar atributo/efeito real.
- **Resultado esperado:** Campo projectileSize=2 no destino correto; HP/movimento/suporte compartilhados uma vez, campos de arma por slot. Não repor munição nem completar recarga por editar capacidade/tempo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar limites do efeito (abs≤10000); distinguir importação inválida de valor válido depois limitado por clamps. HP≥1≤máximo, outros positivos≥0,001, valores diretos limitados a1e9; nenhuma execução de texto.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-ATTR-projectileLife — Editor
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** balance.js: validate/migrate/snapshot/apply/applyWeapon; editor local.
- **Comando/procedimento:** node tests/balance-panel.cjs; node tests/balance-migration.cjs.
- **Preparação:** Snapshot padrão; adicionar um módulo Normal customizado único com efeito attribute=Duração dos projéteis, operator='=', value=2, unit vazio, preservando86canônicos.
- **Entradas e passos:** Validar/aplicar configuração; provar que tentativa atual não muda; iniciar outra tentativa, adquirir o customizado e observar atributo/efeito real.
- **Resultado esperado:** Campo projectileLife=2 no destino correto; HP/movimento/suporte compartilhados uma vez, campos de arma por slot. Não repor munição nem completar recarga por editar capacidade/tempo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar limites do efeito (abs≤10000); distinguir importação inválida de valor válido depois limitado por clamps. HP≥1≤máximo, outros positivos≥0,001, valores diretos limitados a1e9; nenhuma execução de texto.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-ATTR-spreadMult — Editor
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** balance.js: validate/migrate/snapshot/apply/applyWeapon; editor local.
- **Comando/procedimento:** node tests/balance-panel.cjs; node tests/balance-migration.cjs.
- **Preparação:** Snapshot padrão; adicionar um módulo Normal customizado único com efeito attribute=Dispersão, operator='=', value=2, unit vazio, preservando86canônicos.
- **Entradas e passos:** Validar/aplicar configuração; provar que tentativa atual não muda; iniciar outra tentativa, adquirir o customizado e observar atributo/efeito real.
- **Resultado esperado:** Campo spreadMult=2 no destino correto; HP/movimento/suporte compartilhados uma vez, campos de arma por slot. Não repor munição nem completar recarga por editar capacidade/tempo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar limites do efeito (abs≤10000); distinguir importação inválida de valor válido depois limitado por clamps. HP≥1≤máximo, outros positivos≥0,001, valores diretos limitados a1e9; nenhuma execução de texto.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-ATTR-droneDamageMult — Editor
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** balance.js: validate/migrate/snapshot/apply/applyWeapon; editor local.
- **Comando/procedimento:** node tests/balance-panel.cjs; node tests/balance-migration.cjs.
- **Preparação:** Snapshot padrão; adicionar um módulo Normal customizado único com efeito attribute=Dano dos drones, operator='=', value=2, unit vazio, preservando86canônicos.
- **Entradas e passos:** Validar/aplicar configuração; provar que tentativa atual não muda; iniciar outra tentativa, adquirir o customizado e observar atributo/efeito real.
- **Resultado esperado:** Campo droneDamageMult=2 no destino correto; HP/movimento/suporte compartilhados uma vez, campos de arma por slot. Não repor munição nem completar recarga por editar capacidade/tempo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar limites do efeito (abs≤10000); distinguir importação inválida de valor válido depois limitado por clamps. HP≥1≤máximo, outros positivos≥0,001, valores diretos limitados a1e9; nenhuma execução de texto.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-ATTR-droneRateMult — Editor
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** balance.js: validate/migrate/snapshot/apply/applyWeapon; editor local.
- **Comando/procedimento:** node tests/balance-panel.cjs; node tests/balance-migration.cjs.
- **Preparação:** Snapshot padrão; adicionar um módulo Normal customizado único com efeito attribute=Intervalo dos drones, operator='=', value=2, unit vazio, preservando86canônicos.
- **Entradas e passos:** Validar/aplicar configuração; provar que tentativa atual não muda; iniciar outra tentativa, adquirir o customizado e observar atributo/efeito real.
- **Resultado esperado:** Campo droneRateMult=2 no destino correto; HP/movimento/suporte compartilhados uma vez, campos de arma por slot. Não repor munição nem completar recarga por editar capacidade/tempo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar limites do efeito (abs≤10000); distinguir importação inválida de valor válido depois limitado por clamps. HP≥1≤máximo, outros positivos≥0,001, valores diretos limitados a1e9; nenhuma execução de texto.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-ATTR-droneRange — Editor
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** balance.js: validate/migrate/snapshot/apply/applyWeapon; editor local.
- **Comando/procedimento:** node tests/balance-panel.cjs; node tests/balance-migration.cjs.
- **Preparação:** Snapshot padrão; adicionar um módulo Normal customizado único com efeito attribute=Alcance dos drones, operator='=', value=400, unit vazio, preservando86canônicos.
- **Entradas e passos:** Validar/aplicar configuração; provar que tentativa atual não muda; iniciar outra tentativa, adquirir o customizado e observar atributo/efeito real.
- **Resultado esperado:** Campo droneRange=400 no destino correto; HP/movimento/suporte compartilhados uma vez, campos de arma por slot. Não repor munição nem completar recarga por editar capacidade/tempo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar limites do efeito (abs≤10000); distinguir importação inválida de valor válido depois limitado por clamps. HP≥1≤máximo, outros positivos≥0,001, valores diretos limitados a1e9; nenhuma execução de texto.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-ATTR-corrosionDamageMult — Editor
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** balance.js: validate/migrate/snapshot/apply/applyWeapon; editor local.
- **Comando/procedimento:** node tests/balance-panel.cjs; node tests/balance-migration.cjs.
- **Preparação:** Snapshot padrão; adicionar um módulo Normal customizado único com efeito attribute=Dano da corrosão, operator='=', value=2, unit vazio, preservando86canônicos.
- **Entradas e passos:** Validar/aplicar configuração; provar que tentativa atual não muda; iniciar outra tentativa, adquirir o customizado e observar atributo/efeito real.
- **Resultado esperado:** Campo corrosionDamageMult=2 no destino correto; HP/movimento/suporte compartilhados uma vez, campos de arma por slot. Não repor munição nem completar recarga por editar capacidade/tempo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar limites do efeito (abs≤10000); distinguir importação inválida de valor válido depois limitado por clamps. HP≥1≤máximo, outros positivos≥0,001, valores diretos limitados a1e9; nenhuma execução de texto.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-ATTR-corrosionDelayMult — Editor
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** balance.js: validate/migrate/snapshot/apply/applyWeapon; editor local.
- **Comando/procedimento:** node tests/balance-panel.cjs; node tests/balance-migration.cjs.
- **Preparação:** Snapshot padrão; adicionar um módulo Normal customizado único com efeito attribute=Prazo da corrosão, operator='=', value=2, unit vazio, preservando86canônicos.
- **Entradas e passos:** Validar/aplicar configuração; provar que tentativa atual não muda; iniciar outra tentativa, adquirir o customizado e observar atributo/efeito real.
- **Resultado esperado:** Campo corrosionDelayMult=2 no destino correto; HP/movimento/suporte compartilhados uma vez, campos de arma por slot. Não repor munição nem completar recarga por editar capacidade/tempo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar limites do efeito (abs≤10000); distinguir importação inválida de valor válido depois limitado por clamps. HP≥1≤máximo, outros positivos≥0,001, valores diretos limitados a1e9; nenhuma execução de texto.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-ATTR-sensorDamageMult — Editor
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** balance.js: validate/migrate/snapshot/apply/applyWeapon; editor local.
- **Comando/procedimento:** node tests/balance-panel.cjs; node tests/balance-migration.cjs.
- **Preparação:** Snapshot padrão; adicionar um módulo Normal customizado único com efeito attribute=Dano do sensor, operator='=', value=2, unit vazio, preservando86canônicos.
- **Entradas e passos:** Validar/aplicar configuração; provar que tentativa atual não muda; iniciar outra tentativa, adquirir o customizado e observar atributo/efeito real.
- **Resultado esperado:** Campo sensorDamageMult=2 no destino correto; HP/movimento/suporte compartilhados uma vez, campos de arma por slot. Não repor munição nem completar recarga por editar capacidade/tempo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar limites do efeito (abs≤10000); distinguir importação inválida de valor válido depois limitado por clamps. HP≥1≤máximo, outros positivos≥0,001, valores diretos limitados a1e9; nenhuma execução de texto.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-ATTR-sensorIntervalMult — Editor
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** balance.js: validate/migrate/snapshot/apply/applyWeapon; editor local.
- **Comando/procedimento:** node tests/balance-panel.cjs; node tests/balance-migration.cjs.
- **Preparação:** Snapshot padrão; adicionar um módulo Normal customizado único com efeito attribute=Intervalo do sensor, operator='=', value=2, unit vazio, preservando86canônicos.
- **Entradas e passos:** Validar/aplicar configuração; provar que tentativa atual não muda; iniciar outra tentativa, adquirir o customizado e observar atributo/efeito real.
- **Resultado esperado:** Campo sensorIntervalMult=2 no destino correto; HP/movimento/suporte compartilhados uma vez, campos de arma por slot. Não repor munição nem completar recarga por editar capacidade/tempo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar limites do efeito (abs≤10000); distinguir importação inválida de valor válido depois limitado por clamps. HP≥1≤máximo, outros positivos≥0,001, valores diretos limitados a1e9; nenhuma execução de texto.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-ATTR-sensorRange — Editor
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** balance.js: validate/migrate/snapshot/apply/applyWeapon; editor local.
- **Comando/procedimento:** node tests/balance-panel.cjs; node tests/balance-migration.cjs.
- **Preparação:** Snapshot padrão; adicionar um módulo Normal customizado único com efeito attribute=Alcance do sensor, operator='=', value=200, unit vazio, preservando86canônicos.
- **Entradas e passos:** Validar/aplicar configuração; provar que tentativa atual não muda; iniciar outra tentativa, adquirir o customizado e observar atributo/efeito real.
- **Resultado esperado:** Campo sensorRange=200 no destino correto; HP/movimento/suporte compartilhados uma vez, campos de arma por slot. Não repor munição nem completar recarga por editar capacidade/tempo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar limites do efeito (abs≤10000); distinguir importação inválida de valor válido depois limitado por clamps. HP≥1≤máximo, outros positivos≥0,001, valores diretos limitados a1e9; nenhuma execução de texto.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-ATTR-rotorDamageMult — Editor
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** balance.js: validate/migrate/snapshot/apply/applyWeapon; editor local.
- **Comando/procedimento:** node tests/balance-panel.cjs; node tests/balance-migration.cjs.
- **Preparação:** Snapshot padrão; adicionar um módulo Normal customizado único com efeito attribute=Dano dos rotores, operator='=', value=2, unit vazio, preservando86canônicos.
- **Entradas e passos:** Validar/aplicar configuração; provar que tentativa atual não muda; iniciar outra tentativa, adquirir o customizado e observar atributo/efeito real.
- **Resultado esperado:** Campo rotorDamageMult=2 no destino correto; HP/movimento/suporte compartilhados uma vez, campos de arma por slot. Não repor munição nem completar recarga por editar capacidade/tempo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar limites do efeito (abs≤10000); distinguir importação inválida de valor válido depois limitado por clamps. HP≥1≤máximo, outros positivos≥0,001, valores diretos limitados a1e9; nenhuma execução de texto.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-ATTR-rotorPeriodMult — Editor
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** balance.js: validate/migrate/snapshot/apply/applyWeapon; editor local.
- **Comando/procedimento:** node tests/balance-panel.cjs; node tests/balance-migration.cjs.
- **Preparação:** Snapshot padrão; adicionar um módulo Normal customizado único com efeito attribute=Duração da volta dos rotores, operator='=', value=2, unit vazio, preservando86canônicos.
- **Entradas e passos:** Validar/aplicar configuração; provar que tentativa atual não muda; iniciar outra tentativa, adquirir o customizado e observar atributo/efeito real.
- **Resultado esperado:** Campo rotorPeriodMult=2 no destino correto; HP/movimento/suporte compartilhados uma vez, campos de arma por slot. Não repor munição nem completar recarga por editar capacidade/tempo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar limites do efeito (abs≤10000); distinguir importação inválida de valor válido depois limitado por clamps. HP≥1≤máximo, outros positivos≥0,001, valores diretos limitados a1e9; nenhuma execução de texto.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-ATTR-rotorRange — Editor
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** balance.js: validate/migrate/snapshot/apply/applyWeapon; editor local.
- **Comando/procedimento:** node tests/balance-panel.cjs; node tests/balance-migration.cjs.
- **Preparação:** Snapshot padrão; adicionar um módulo Normal customizado único com efeito attribute=Raio dos rotores, operator='=', value=100, unit vazio, preservando86canônicos.
- **Entradas e passos:** Validar/aplicar configuração; provar que tentativa atual não muda; iniciar outra tentativa, adquirir o customizado e observar atributo/efeito real.
- **Resultado esperado:** Campo rotorRange=100 no destino correto; HP/movimento/suporte compartilhados uma vez, campos de arma por slot. Não repor munição nem completar recarga por editar capacidade/tempo.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Validar limites do efeito (abs≤10000); distinguir importação inválida de valor válido depois limitado por clamps. HP≥1≤máximo, outros positivos≥0,001, valores diretos limitados a1e9; nenhuma execução de texto.
- **Falha:** P1.
- **Evidência:** Log estruturado e snapshot antes/depois.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-VISUAL-01 — Apresentação
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** renderers de chassis/inimigos/armas; draw e helpers de sprite.
- **Comando/procedimento:** node tests/chassis-animation-browser.cjs; node tests/projectile-visuals.cjs.
- **Preparação:** Capturar versão/configuração/estado em1280×900 e740×360; incluir844×390 nos fluxos horizontais.
- **Entradas e passos:** Executar o fluxo descrito com entrada real e guardar antes/depois; inspecionar cascata, clipping e controles, não apenas ausência de erro.
- **Resultado esperado:** Menu em 1280×900 e 740×360 mostra marca reconhecível, título e todas as ações alcançáveis, inclusive por rolagem quando necessário.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Fallbacks, textos longos, teclado/toque e painel rolável. Classificar falha pela consequência real.
- **Falha:** P1.
- **Evidência:** Capturas identificadas, bounding/clipping/computedStyle e resultado de interação.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-VISUAL-02 — Apresentação
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** renderers de chassis/inimigos/armas; draw e helpers de sprite.
- **Comando/procedimento:** node tests/chassis-animation-browser.cjs; node tests/projectile-visuals.cjs.
- **Preparação:** Capturar versão/configuração/estado em1280×900 e740×360; incluir844×390 nos fluxos horizontais.
- **Entradas e passos:** Executar o fluxo descrito com entrada real e guardar antes/depois; inspecionar cascata, clipping e controles, não apenas ausência de erro.
- **Resultado esperado:** Garagem permite comparar seis robôs/doze armas, desbloquear armas com saldo visível e equipar auxiliares já liberadas sem cobrança por tentativa e chegar à configuração sem campo ou botão oculto.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Fallbacks, textos longos, teclado/toque e painel rolável. Classificar falha pela consequência real.
- **Falha:** P1.
- **Evidência:** Capturas identificadas, bounding/clipping/computedStyle e resultado de interação.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-VISUAL-03 — Apresentação
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** renderers de chassis/inimigos/armas; draw e helpers de sprite.
- **Comando/procedimento:** node tests/chassis-animation-browser.cjs; node tests/projectile-visuals.cjs.
- **Preparação:** Capturar versão/configuração/estado em1280×900 e740×360; incluir844×390 nos fluxos horizontais.
- **Entradas e passos:** Executar o fluxo descrito com entrada real e guardar antes/depois; inspecionar cascata, clipping e controles, não apenas ausência de erro.
- **Resultado esperado:** Configuração apresenta equipamento escolhido antes das regras; último controle e iniciar são alcançáveis nas duas dimensões.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Fallbacks, textos longos, teclado/toque e painel rolável. Classificar falha pela consequência real.
- **Falha:** P1.
- **Evidência:** Capturas identificadas, bounding/clipping/computedStyle e resultado de interação.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-VISUAL-04 — Apresentação
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** renderers de chassis/inimigos/armas; draw e helpers de sprite.
- **Comando/procedimento:** node tests/chassis-animation-browser.cjs; node tests/projectile-visuals.cjs.
- **Preparação:** Capturar versão/configuração/estado em1280×900 e740×360; incluir844×390 nos fluxos horizontais.
- **Entradas e passos:** Executar o fluxo descrito com entrada real e guardar antes/depois; inspecionar cascata, clipping e controles, não apenas ausência de erro.
- **Resultado esperado:** Escolhas mostram simultaneamente alternativas, efeito, perda, requisitos e futuro; teclado/toque não confirma sem intenção.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Fallbacks, textos longos, teclado/toque e painel rolável. Classificar falha pela consequência real.
- **Falha:** P1.
- **Evidência:** Capturas identificadas, bounding/clipping/computedStyle e resultado de interação.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-VISUAL-05 — Apresentação
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** renderers de chassis/inimigos/armas; draw e helpers de sprite.
- **Comando/procedimento:** node tests/chassis-animation-browser.cjs; node tests/projectile-visuals.cjs.
- **Preparação:** Capturar versão/configuração/estado em1280×900 e740×360; incluir844×390 nos fluxos horizontais.
- **Entradas e passos:** Executar o fluxo descrito com entrada real e guardar antes/depois; inspecionar cascata, clipping e controles, não apenas ausência de erro.
- **Resultado esperado:** Nível 10, nível 20, experimento e peça de chefe têm identificação e ação corretas; três recompensas permanecem selecionáveis em 740×360.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Fallbacks, textos longos, teclado/toque e painel rolável. Classificar falha pela consequência real.
- **Falha:** P1.
- **Evidência:** Capturas identificadas, bounding/clipping/computedStyle e resultado de interação.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-VISUAL-06 — Apresentação
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** renderers de chassis/inimigos/armas; draw e helpers de sprite.
- **Comando/procedimento:** node tests/chassis-animation-browser.cjs; node tests/projectile-visuals.cjs.
- **Preparação:** Capturar versão/configuração/estado em1280×900 e740×360; incluir844×390 nos fluxos horizontais.
- **Entradas e passos:** Executar o fluxo descrito com entrada real e guardar antes/depois; inspecionar cascata, clipping e controles, não apenas ausência de erro.
- **Resultado esperado:** Topo do chefe alinha com a faixa do jogador/estatísticas; HP não invade relógio ou mapa e não muda de lugar conforme comprimento do nome.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Fallbacks, textos longos, teclado/toque e painel rolável. Classificar falha pela consequência real.
- **Falha:** P1.
- **Evidência:** Capturas identificadas, bounding/clipping/computedStyle e resultado de interação.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-VISUAL-07 — Apresentação
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** renderers de chassis/inimigos/armas; draw e helpers de sprite.
- **Comando/procedimento:** node tests/chassis-animation-browser.cjs; node tests/projectile-visuals.cjs.
- **Preparação:** Capturar versão/configuração/estado em1280×900 e740×360; incluir844×390 nos fluxos horizontais.
- **Entradas e passos:** Executar o fluxo descrito com entrada real e guardar antes/depois; inspecionar cascata, clipping e controles, não apenas ausência de erro.
- **Resultado esperado:** Retratos e robôs mantêm proporção, pés ancorados e mesma escala aparente; não há quadrado opaco, quadriculado ou halo de recorte.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Fallbacks, textos longos, teclado/toque e painel rolável. Classificar falha pela consequência real.
- **Falha:** P1.
- **Evidência:** Capturas identificadas, bounding/clipping/computedStyle e resultado de interação.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-VISUAL-08 — Apresentação
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** renderers de chassis/inimigos/armas; draw e helpers de sprite.
- **Comando/procedimento:** node tests/chassis-animation-browser.cjs; node tests/projectile-visuals.cjs.
- **Preparação:** Capturar versão/configuração/estado em1280×900 e740×360; incluir844×390 nos fluxos horizontais.
- **Entradas e passos:** Executar o fluxo descrito com entrada real e guardar antes/depois; inspecionar cascata, clipping e controles, não apenas ausência de erro.
- **Resultado esperado:** Cada arma tem silhueta distinta, duas mãos coerentes, mira livre e recuo/recarga visível; apontar para esquerda não inverte o carregador incorretamente.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Fallbacks, textos longos, teclado/toque e painel rolável. Classificar falha pela consequência real.
- **Falha:** P1.
- **Evidência:** Capturas identificadas, bounding/clipping/computedStyle e resultado de interação.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-VISUAL-09 — Apresentação
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** renderers de chassis/inimigos/armas; draw e helpers de sprite.
- **Comando/procedimento:** node tests/chassis-animation-browser.cjs; node tests/projectile-visuals.cjs.
- **Preparação:** Capturar versão/configuração/estado em1280×900 e740×360; incluir844×390 nos fluxos horizontais.
- **Entradas e passos:** Executar o fluxo descrito com entrada real e guardar antes/depois; inspecionar cascata, clipping e controles, não apenas ausência de erro.
- **Resultado esperado:** Cada família de projétil distingue fogo, frio, elétrico, explosivo e balístico; Colimador/Culatra são adições legíveis, não substituem toda a identidade do tiro.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Fallbacks, textos longos, teclado/toque e painel rolável. Classificar falha pela consequência real.
- **Falha:** P1.
- **Evidência:** Capturas identificadas, bounding/clipping/computedStyle e resultado de interação.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-VISUAL-10 — Apresentação
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** renderers de chassis/inimigos/armas; draw e helpers de sprite.
- **Comando/procedimento:** node tests/chassis-animation-browser.cjs; node tests/projectile-visuals.cjs.
- **Preparação:** Capturar versão/configuração/estado em1280×900 e740×360; incluir844×390 nos fluxos horizontais.
- **Entradas e passos:** Executar o fluxo descrito com entrada real e guardar antes/depois; inspecionar cascata, clipping e controles, não apenas ausência de erro.
- **Resultado esperado:** Culatra pronta tem cor e outline computados conforme regra final; capturar visual após correção. A observação inicial de outline suprimido não comprova este item.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Fallbacks, textos longos, teclado/toque e painel rolável. Classificar falha pela consequência real.
- **Falha:** P1.
- **Evidência:** Capturas identificadas, bounding/clipping/computedStyle e resultado de interação.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-VISUAL-11 — Apresentação
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** renderers de chassis/inimigos/armas; draw e helpers de sprite.
- **Comando/procedimento:** node tests/chassis-animation-browser.cjs; node tests/projectile-visuals.cjs.
- **Preparação:** Capturar versão/configuração/estado em1280×900 e740×360; incluir844×390 nos fluxos horizontais.
- **Entradas e passos:** Executar o fluxo descrito com entrada real e guardar antes/depois; inspecionar cascata, clipping e controles, não apenas ausência de erro.
- **Resultado esperado:** Foco de teclado tem indicador visível em todas as telas, inclusive com reset global de combate; medir computedStyle e observar a captura.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Fallbacks, textos longos, teclado/toque e painel rolável. Classificar falha pela consequência real.
- **Falha:** P1.
- **Evidência:** Capturas identificadas, bounding/clipping/computedStyle e resultado de interação.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-VISUAL-12 — Apresentação
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** renderers de chassis/inimigos/armas; draw e helpers de sprite.
- **Comando/procedimento:** node tests/chassis-animation-browser.cjs; node tests/projectile-visuals.cjs.
- **Preparação:** Capturar versão/configuração/estado em1280×900 e740×360; incluir844×390 nos fluxos horizontais.
- **Entradas e passos:** Executar o fluxo descrito com entrada real e guardar antes/depois; inspecionar cascata, clipping e controles, não apenas ausência de erro.
- **Resultado esperado:** Dicas desaparecem após cinco segundos ativos; avisos e números não bloqueiam o centro permanentemente.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Fallbacks, textos longos, teclado/toque e painel rolável. Classificar falha pela consequência real.
- **Falha:** P1.
- **Evidência:** Capturas identificadas, bounding/clipping/computedStyle e resultado de interação.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-VISUAL-13 — Apresentação
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** renderers de chassis/inimigos/armas; draw e helpers de sprite.
- **Comando/procedimento:** node tests/chassis-animation-browser.cjs; node tests/projectile-visuals.cjs.
- **Preparação:** Capturar versão/configuração/estado em1280×900 e740×360; incluir844×390 nos fluxos horizontais.
- **Entradas e passos:** Executar o fluxo descrito com entrada real e guardar antes/depois; inspecionar cascata, clipping e controles, não apenas ausência de erro.
- **Resultado esperado:** Três armas em 740×360: munição de todas alcançável com rolagem real, sem clip por ancestral; botões e joysticks não se sobrepõem ao conteúdo rolável.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Fallbacks, textos longos, teclado/toque e painel rolável. Classificar falha pela consequência real.
- **Falha:** P1.
- **Evidência:** Capturas identificadas, bounding/clipping/computedStyle e resultado de interação.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-VISUAL-14 — Apresentação
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** renderers de chassis/inimigos/armas; draw e helpers de sprite.
- **Comando/procedimento:** node tests/chassis-animation-browser.cjs; node tests/projectile-visuals.cjs.
- **Preparação:** Capturar versão/configuração/estado em1280×900 e740×360; incluir844×390 nos fluxos horizontais.
- **Entradas e passos:** Executar o fluxo descrito com entrada real e guardar antes/depois; inspecionar cascata, clipping e controles, não apenas ausência de erro.
- **Resultado esperado:** Dois dedos simultâneos permitem mover e mirar/disparar, com recarga/esquiva acessíveis; toque na munição não aciona disparo indevido.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Fallbacks, textos longos, teclado/toque e painel rolável. Classificar falha pela consequência real.
- **Falha:** P1.
- **Evidência:** Capturas identificadas, bounding/clipping/computedStyle e resultado de interação.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-VISUAL-15 — Apresentação
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** renderers de chassis/inimigos/armas; draw e helpers de sprite.
- **Comando/procedimento:** node tests/chassis-animation-browser.cjs; node tests/projectile-visuals.cjs.
- **Preparação:** Capturar versão/configuração/estado em1280×900 e740×360; incluir844×390 nos fluxos horizontais.
- **Entradas e passos:** Executar o fluxo descrito com entrada real e guardar antes/depois; inspecionar cascata, clipping e controles, não apenas ausência de erro.
- **Resultado esperado:** Rotação para vertical mostra GIRE O CELULAR e pausa; voltar respeita a retomada prevista.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Fallbacks, textos longos, teclado/toque e painel rolável. Classificar falha pela consequência real.
- **Falha:** P1.
- **Evidência:** Capturas identificadas, bounding/clipping/computedStyle e resultado de interação.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-VISUAL-16 — Apresentação
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** renderers de chassis/inimigos/armas; draw e helpers de sprite.
- **Comando/procedimento:** node tests/chassis-animation-browser.cjs; node tests/projectile-visuals.cjs.
- **Preparação:** Capturar versão/configuração/estado em1280×900 e740×360; incluir844×390 nos fluxos horizontais.
- **Entradas e passos:** Executar o fluxo descrito com entrada real e guardar antes/depois; inspecionar cascata, clipping e controles, não apenas ausência de erro.
- **Resultado esperado:** Boss, policiais com arma/escudo e inimigos à borda do minimapa continuam identificáveis durante muitos tiros/efeitos.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Fallbacks, textos longos, teclado/toque e painel rolável. Classificar falha pela consequência real.
- **Falha:** P1.
- **Evidência:** Capturas identificadas, bounding/clipping/computedStyle e resultado de interação.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-VISUAL-17 — Apresentação
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** renderers de chassis/inimigos/armas; draw e helpers de sprite.
- **Comando/procedimento:** node tests/chassis-animation-browser.cjs; node tests/projectile-visuals.cjs.
- **Preparação:** Capturar versão/configuração/estado em1280×900 e740×360; incluir844×390 nos fluxos horizontais.
- **Entradas e passos:** Executar o fluxo descrito com entrada real e guardar antes/depois; inspecionar cascata, clipping e controles, não apenas ausência de erro.
- **Resultado esperado:** XP, parafusos, reparo e baú diferem por forma e cor; o baú permanece localizável após chefe morrer.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Fallbacks, textos longos, teclado/toque e painel rolável. Classificar falha pela consequência real.
- **Falha:** P1.
- **Evidência:** Capturas identificadas, bounding/clipping/computedStyle e resultado de interação.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-VISUAL-18 — Apresentação
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** renderers de chassis/inimigos/armas; draw e helpers de sprite.
- **Comando/procedimento:** node tests/chassis-animation-browser.cjs; node tests/projectile-visuals.cjs.
- **Preparação:** Capturar versão/configuração/estado em1280×900 e740×360; incluir844×390 nos fluxos horizontais.
- **Entradas e passos:** Executar o fluxo descrito com entrada real e guardar antes/depois; inspecionar cascata, clipping e controles, não apenas ausência de erro.
- **Resultado esperado:** Pause congela caminhada/arma/efeitos dependentes de simulação e não consome RNG/atualiza combate por desenhar a interface.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Fallbacks, textos longos, teclado/toque e painel rolável. Classificar falha pela consequência real.
- **Falha:** P1.
- **Evidência:** Capturas identificadas, bounding/clipping/computedStyle e resultado de interação.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-VISUAL-19 — Apresentação
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** renderers de chassis/inimigos/armas; draw e helpers de sprite.
- **Comando/procedimento:** node tests/chassis-animation-browser.cjs; node tests/projectile-visuals.cjs.
- **Preparação:** Capturar versão/configuração/estado em1280×900 e740×360; incluir844×390 nos fluxos horizontais.
- **Entradas e passos:** Executar o fluxo descrito com entrada real e guardar antes/depois; inspecionar cascata, clipping e controles, não apenas ausência de erro.
- **Resultado esperado:** Painel administrativo mantém formulário legível, valida erros e informa aplicação na próxima tentativa; drawer e tabela rolam localmente no celular.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Fallbacks, textos longos, teclado/toque e painel rolável. Classificar falha pela consequência real.
- **Falha:** P1.
- **Evidência:** Capturas identificadas, bounding/clipping/computedStyle e resultado de interação.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.

### QA-VISUAL-20 — Apresentação
- **Origem:** Contrato vigente e objetivo aprovado.
- **Implementação correspondente:** renderers de chassis/inimigos/armas; draw e helpers de sprite.
- **Comando/procedimento:** node tests/chassis-animation-browser.cjs; node tests/projectile-visuals.cjs.
- **Preparação:** Capturar versão/configuração/estado em1280×900 e740×360; incluir844×390 nos fluxos horizontais.
- **Entradas e passos:** Executar o fluxo descrito com entrada real e guardar antes/depois; inspecionar cascata, clipping e controles, não apenas ausência de erro.
- **Resultado esperado:** Capturas de evidência registram versão, viewport, orientação, touch e estado; capturas históricas não são usadas como aprovação da candidata.
- **Tolerância:** Inteiros/IDs/estados exatos; reais: erro absoluto ≤1e-6 ou relativo ≤1e-9, salvo tolerância explícita.
- **Bordas:** Fallbacks, textos longos, teclado/toque e painel rolável. Classificar falha pela consequência real.
- **Falha:** P1.
- **Evidência:** Capturas identificadas, bounding/clipping/computedStyle e resultado de interação.
- **Situação:** não executado no commit final; não inferir aprovação da descrição.



## Proveniência e limites do levantamento

Commit pai: ed7834ce8d742a1499e9740804d00269ac852daa. O snapshot possui alterações locais da candidata63, com reserva e manutenção; não é um commit final auditado. A data de referência fornecida pelo cliente é13/11/2026 America/Sao_Paulo. As tabelas foram extraídas em VM isolada/default, sem ler preferências pessoais do jogador.

| Fonte do snapshot | SHA-256 |
|---|---|
| game.js | 5ddaad1373cda3bed4edc903794cbcdbe43aa081092b568016140b9b25e59e84 |
| balance.js | 3061091eae0812532a7874ff486971c61ab54a15f8fd392cada298feb1e0132a |
| builds.js | 4dce4033ac78af07d6235b477eb374f3f592f2aace0cab84278f34cce84642c8 |
| index.html | e18aa7fb3e2b687c072f34e2f3ff441937995e6a1e7baa837eee7091f5a8675c |
| style.css | 2ab285b0c39fc95fd59dd96d9c288f241fc193e4e999ca5b9ae0f9a03399ae8a |
| ui-redesign.css | 3417f65438fd2546f08b61eba924e8ba63098b016eb7ceea92b4d2fa84cebc58 |
| audio.js | 6be5b9a37e324d35cdbd8e217a6b11189ca327abc84cb41ca0d8e70f29403487 |
| touch-controls.js | 4b875aa4f1b528fd78975126db17b7da9b5bbeb096e7dccb568281f03430842d |
| touch-controls.css | 0c40b1214cdc2e58d9cdf74825821a36ccaa4c94f0c15b41d9b68e8ba96cf200 |
| player-weapons.js | 31834008b154d7e76a86698304e7ec911f6d55e08d5d5fcb3122c84e44d8c830 |
| tools/drone-maturity.js | 97819fbf417887143cf7a295400d7512291e0f32f538b58cf65e4263e03ce2e0 |
| tools/segment-circle.js | ea06f6c5881fb57c2e03f99b466e0ca6349af2271a5b70f576bf02a2a8d25aa4 |
| tools/rupture-chamber.js | 0c62194bd688ef29ac7ff12c8faec5db60e6049a05e16c15b2e4d6a2dff04b03 |

O inventário JSON e a matriz de casos são auxiliares para conferir cobertura; a reconstrução do comportamento descrito neste documento não depende de possuir aqueles arquivos. Caminhos de testes e assets citados são pistas de auditoria, não substitutos de especificação.

Há377casos identificados nesta edição. Quantidade de texto/casos não prova correção ou aceite: é necessário executar, revisar e resolver cada requisito. Nenhum gate final é aprovado só porque este Markdown existe.

### Auditoria de encerramento

Quando todos os critérios obrigatórios da meta forem comprovados na mesma revisão: gerar termo de conclusão com hash, dados, defeitos residuais e plataformas medidas; publicar pacote verificado; enviar o relatório autorizado; marcar a meta como concluída e encerrar a expansão automática. Até lá, manter EM DESENVOLVIMENTO. Publicação pública continua sendo um ato separado com aprovação prevista no contrato.
