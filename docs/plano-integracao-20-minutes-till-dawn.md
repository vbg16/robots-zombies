# Integração de sistemas de referência — 20 Minutes Till Dawn

**Status:** integração incremental em andamento. Este documento mapeia sistemas e define proteções contra regressão; não aprova conteúdo, custos ou balanceamento que ainda estejam pendentes nos documentos de design.

> **Estado vigente — BUILD 56:** consulte [Contrato atual](contrato-atual.md). As etapas e registros abaixo guardam decisões históricas; trechos antigos sobre teto de vivos, pausa de ondas em chefe e renovação única por tentativa foram substituídos. [Reforjas de armas](evolucao-armas.md) documenta a etapa atual.

## Regra de adaptação

Screwvivors pode aproveitar princípios de progressão, combate e legibilidade. Não reutilizar nomes, personagens, arte, texto de upgrades, áudio ou código de *20 Minutes Till Dawn*. A versão própria continua centrada no gato piloto, robôs, sucata, zumbis e na cidade do Dr. Biruta.

O contrato atual que toda etapa deve preservar é: arena sem bordas e sem tempo final; mira e disparo manuais; chassi e armas escolhidos na garagem e fixos durante a tentativa; skills temporárias que se perdem ao reiniciar; hordas circulares crescentes; chefes recorrentes. A referência do 20MTD não altera esses preceitos.

## Mapa dos sistemas

| Sistema de referência | Estado em Screwvivors | Caminho de adaptação |
|---|---|---|
| Mira direcional e disparo ativo | **Já existe.** | Proteger mira manual, disparo enquanto pressionado e movimento simultâneo. |
| XP, upgrades e sinergias de build | **Já existe — em estabilização.** Há 52 nós temporários em treze raízes, mais dez receitas guiadas e interações de dano/controle/suporte. | Expandir apenas com novas skills originais e seus efeitos, custos e combinações documentados e testados. |
| Suporte orbital por contato | **Adaptado na BUILD49.** Rotores de Sucata, com quantidade, raio e rotação próprios. | Sem procs de bala; faixa de contato varrida, cooldown por alvo/disco e custo explícito. Painel82/revisão5 e resultados naturais negativos preservados. |
| Pulsos em área e transmissão de estados | **Adaptado na BUILD44.** Sensores de campo: pulso, alcance, relé e exposição. | A arma principal permanece manual. Relé só fogo/frio, sem crítico/descarga/explosão/corrosão/empurrão; exposição só em balas e escudo bloqueia estados. |
| Dano adiado e propagação | **Adaptado na BUILD43.** Reagentes de sucata: raiz corrosiva e três derivações, com prazo, respingo limitado e catalisador térmico. | Uma carga por alvo, snapshot, escudos respeitados e sem recursão; números no painel, migração 70→74 e tentativas negativas preservadas. |
| Bênçãos escolhidas no início da tentativa | **Adaptado parcialmente.** “Gambiarras do Biruta” surgem nos níveis 3, 6 e 9 como três escolhas únicas entre seis efeitos temporários; também podem ser puladas. | A cadência, efeitos e pool são experimentais. Não persistir na garagem. Testar escolha de teclado, seleção obsoleta, ausência de repetição, reset e corrida longa. |
| Tomes/recompensas de chefe | **Adaptado.** Chefe cura, salva uma peça de garagem e deixa baú físico com escolha entre12relíquias temporárias, favorecendo o equipamento e a build. | Sem repetição por tentativa; coleta manual até40px. Sem elegíveis, usa seis experimentos e depois módulo comum. Efeitos não persistem após morrer; peça de garagem é recurso independente. Ver baus-de-chefe.md. |
| Runas e progresso entre tentativas | **Adaptado parcialmente.** Perfil local conserva parafusos/peças após a morte e usa esses recursos para desbloquear equipamento sem bônus permanentes de atributos. | Custos e velocidade de progressão são experimentais. Não adicionar vantagens de atributo que persistam entre tentativas. |
| Elenco de personagens e armas | **Adaptado parcialmente.** Perfis novos começam com PROT-0001 + Metralhadora; compras na garagem desbloqueiam as outras armas e cinco chassis adicionais. Saves v1 migram com acesso a todo o catálogo do protótipo preservado. | Preços e cadência são experimentais. Arsenal avançado implementado na BUILD51: BAST até2armas, ENXA até3, com custos explícitos. Especializações e reforjas já existem. |
| Especializações de personagem/arma | **Chassi: 18 protocolos, escolha no nível 10. Armas: 24 reforjas, escolha no nível 20.** | Uma entre três especializações do robô no nível 10 e uma entre duas reforjas da arma no nível 20. Não permitir troca/fusão do loadout; escolhas somem no reset. |
| Variedade e encontros de inimigos | **Implementada em etapas.** Há perseguidores comuns, cinco policiais por onda de15 após derrotar o segundo chefe, divididos entre rifle e escudo100, um perseguidor grande em uma de cada três ondas completas a partir de 15 min, três chefes e lacaios próprios para cada chefe. | Balancear frequência e atributos em playtest. Inimigos novos continuam na formação circular; diretor com população limitada e gatilhos de combate/deslocamento (BUILD52), preservando avisos e limpeza de lacaios ao fim do chefe. |
| Modos cronometrados e loop pós-vitória | **Não importar ao modo padrão.** | O modo aprovado já é infinito. Não criar vitória cronometrada nem preservar skills após a morte. Um modo opcional exigiria decisão própria. |
| Reroll, compêndio, estatísticas e orientação de controle | **Base implementada.** Controles, diagnóstico, manual, dez guias e uma renovação de oferta por nível normal. | Renovação experimental só no level-up comum; exige alternativas elegíveis suficientes, exclui as opções descartadas e consome a carga daquele nível, sem recarregar durante a própria renovação. Validar o impacto na construção de builds. |
| Recursos de plataforma (conquistas, nuvem, ranking) | **Fora do protótipo local atual.** | Planejar depois da persistência local e das regras de integridade do ranking. Não transmitir dados de jogador sem decisão explícita. |

A página oficial da Steam lista builds, runas, tomes de chefe, mira/disparo ativos, arsenal e personagens desbloqueáveis. O anúncio “Blessings & Curses”, de outubro de 2024, identificava sua atualização como teste fechado naquele momento; descrevia bênçãos nos níveis iniciais, curses em baús de chefe com penalidades, lacaios próprios para chefes sem zumbis comuns durante a luta, runas sempre ativas após compra e especializações de personagem. Anúncios de janeiro e março de 2024 também apresentavam rerolls, compêndio/estatísticas e loop pós-vitória como propostas em desenvolvimento. Esses anúncios alimentam o mapa, sem presumir que todas essas propostas sejam a versão pública atual. Em Screwvivors, a arena aprovada não tem vitória nem fim cronometrado, então o loop pós-vitória não se aplica ao modo principal. [Página oficial](https://store.steampowered.com/app/1966900/20_Minutes_Till_Dawn/?l=english) · [Arquivo oficial de anúncios](https://steamcommunity.com/app/1966900/allnews/).

## Histórico das etapas e regras de regressão

Cada implementação deve registrar no mesmo conjunto de mudanças: comportamento pretendido, regra que não pode quebrar, teste automatizado correspondente e documentação atualizada. Não ampliar uma etapa enquanto a suíte de base estiver vermelha.

### Etapa 0 — Contrato de regressão

- `node --check game.js` precisa passar.
- `node tests/combat.cjs` precisa passar; novas mecânicas de estado, reset, pausa e combate ganham verificações nesse arquivo.
- `node tests/sprite-animation.cjs` precisa passar quando a etapa tocar em animação ou contratos de sprite.
- A simulação automatizada não substitui playtest visual; mudanças de interface devem ser verificadas em navegador por alguém que conheça o design e por um usuário cego às instruções.
- Os testes não devem fixar regras históricas que os documentos atuais já substituíram. O teste deve expressar o contrato atual, como sobrevivência infinita e chefes recorrentes.

### Etapa 1 — Clareza de encontros de chefe (**histórica; suspensão substituída na BUILD 35**)

Regra: quando um chefe estiver previsto ou vivo, o cronômetro da horda para e nenhuma nova onda comum nasce; a recompensa pausa a simulação como já fazia, e o contador só volta a andar depois de resolver a escolha. Inimigos que já estavam na arena permanecem. Isso reduz acúmulo sem mudar vida, dano, movimento, identidade ou agenda do chefe.

Proteção: `tests/combat.cjs` verifica que uma onda pendente e um contador positivo ficam congelados no marco do chefe, durante a luta e na recompensa; o contador decrementa após resolver a recompensa, a onda retorna ao vencer o prazo restante e `reset()` restaura o atraso inicial.

### Etapa 2 — Materiais persistentes (**base implementada**)

Regra aprovada pelo criador: parafusos coletados e peças de chefe conquistadas permanecem após a morte; skills continuam temporárias. A base local salva um parafuso por coleta de sucata e uma peça identificada por chefe derrotado. Drops não coletados somem no reset; materiais salvos não.

Proteção: `tests/combat.cjs` cobre coleta versus drop perdido, gravação imediata, morte, retry, reload do perfil, limite de uma peça por derrota e limpeza de skills/espólio temporários. A etapa 5 agora gasta saldo salvo em desbloqueios experimentais; nenhum bônus de atributo é persistido.

### Etapa 3 — Builds durante a tentativa (**base implementada**)

“Gambiarras do Biruta” são ofertadas nos níveis 3, 6 e 9: três opções distintas sorteadas do pool de seis. Pulso de bobina aumenta dano em 25%; regulador de gatilho reduz intervalo de tiro em 20%; bateria sobressalente acrescenta 20 à integridade máxima e atual; ímã de sucata multiplica atração por 1,75; servos lubrificados multiplicam velocidade por 1,2; placa de cobre soma um ponto de armadura. São valores originais experimentais, não balanceamento aprovado. Cada opção pode ser escolhida uma vez por tentativa, teclas 1–3 selecionam e a opção de pular não concede efeito. Nada é salvo no perfil.

Proteção: `tests/combat.cjs` verifica nível de oferta, opções sem duplicatas, seleção por teclado, aplicação única por efeito, exclusão após escolha, pular, reset e perfil persistente intacto. A simulação longa responde às escolhas de bênção e confirma que a progressão não trava. A suíte de combate permanece obrigatória antes de expandir builds. Especializações ainda devem se apoiar no chassi e arma fixos, sem troca de loadout em combate.

### Etapa 4 — Recompensas de chefe (**base implementada**)

Cada derrota mantém a cura de 20 pontos e a peça identificada salva imediatamente. Em seguida, oferece três experimentos distintos dentre seis: Reator Volátil (dano ×1,35; intervalo ×1,15), Lente Instável (projéteis ×1,5 em velocidade e tamanho; movimento ×0,85), Pacote de Lítio (integridade máxima e atual +30; armadura −1), Catalisador de Sucata (atração ×2; recarga da arma ×1,5), Condensador de Impacto (dano ×1,5; intervalo ×1,35) e Servo Nervoso (movimento ×1,35; armadura −1). Teclas 1–3 selecionam; R ou “RECUSAR E CONTINUAR” recusa. Cada escolha só aparece uma vez na tentativa. Quando as seis forem escolhidas, as próximas recompensas voltam a usar o módulo comum de chefe. Todos os números são experimentais.

Proteção: `tests/combat.cjs` verifica entrega simultânea sem duplicação da peça, cura explicada, três opções com custo e benefício, todas as teclas de seleção e recusa, aplicação individual e reset de cada experimento, retorno do foco ao botão de pausa, seleção obsoleta, ausência de repetição, fallback após esgotamento, reset e simulação longa. A recompensa continua pausando a horda até uma opção ser resolvida.

### Etapa 5 — Desbloqueios da garagem (**primeira versão implementada; valores experimentais**)

Perfis novos começam com PROT-0001 e Metralhadora. As outras armas custam 8–26 parafusos; armas assinatura também consomem uma peça: Canhão de precisão e Arpão (Brutamontes), Granada e Foguetes (Sucateiro), Laser e Tesla (Bobina-Rainha). BAST-0002 custa 24 parafusos. Comprar desbloqueia e seleciona imediatamente. Todos os chassis aceitam todas as armas do protótipo e mantêm um slot; peças servem como chave de projeto, não são instaladas e não dão atributos permanentes. O primeiro desbloqueio de arma não exige chefe, para a progressão poder começar com a horda. Versão/custos completos em `docs/game-design.md`.

Compatibilidade retroativa: perfil v1 conserva materiais, recebe todos os chassis/armas do protótipo já liberados e grava o formato v2 imediatamente; perfil v2 valida inventário contra IDs conhecidos. Em falha de gravação da compra, recursos são devolvidos e o desbloqueio não é concedido.

Proteção: `tests/combat.cjs` verifica catálogo/preços cobertos, item bloqueado, saldo insuficiente, falta de peça, compra e seleção única, consumo exato, save/load, migração v1 persistida, falha de armazenamento com reembolso, morte/retry e bloqueio de troca durante combate. HTML exige IDs únicos para os controles ligados no código. Manter skills/experimentos temporários fora do perfil. A garagem usa `width:100%` do contêiner (não `100vw`, que inclui a largura da scrollbar) e grade de duas colunas; playtest final em 648×720 confirmou `scrollWidth=clientWidth=633`, uma CTA, custos legíveis e estado de recurso insuficiente no cartão.

### Etapa 6 — Elenco, inimigos e modos adicionais (**inimigos comuns e lacaios de chefe implementados; elenco/modos ainda parcial**)

Inimigos comuns continuam em ondas circulares. Antes de 5 min, todos perseguem. A partir de 5 min, cada onda completa inclui um ex-policial: 80% da vida de um perseguidor comum, recua para manter distância e atira um projétil de 8 de dano a cada 2,8 s. A partir de 15 min, uma de cada três ondas completas inclui também um perseguidor grande, lento, com três vezes a vida comum e raio de colisão 23 px. Os papéis aparecem em etiquetas originais; a cadência de ondas grandes reinicia com a tentativa. Ondas incompletas perto do teto permanecem com perseguidores comuns. Os números são experimentais. Todos surgem no mesmo círculo e contam no mesmo limite.

Durante a luta, o Brutamontes convoca dois Cães de Sucata velozes; o Sucateiro convoca dois Talha-Bots atiradores; a Bobina-Rainha convoca três Faíscas Errantes que atacam em leque. São identidades originais do Screwvivors; cada inimigo tem nome de papel legível acima da cabeça (CORREDOR, ATIRADOR, RAJADA), cor própria e alerta do chefe que identifica reforços. Atiradores usam projéteis hostis de dano menor que os tiros dos chefes. Lacaios ocupam o mesmo teto total da horda, dão XP e sucata quando derrotados e somem quando o chefe morre; inimigos comuns já presentes permanecem. Todos os parâmetros são experimentais.

Proteção: `tests/combat.cjs` cobre limites de 5/15 min, composição/frequência de cada onda, ataques dos ex-policiais, atributos/tamanho do perseguidor grande, formação circular, cadência por tentativa e limite de entidades; também cobre lacaios por chefe, rótulos/alertas, ataques à distância, supressão das ondas, manutenção dos inimigos comuns, remoção dos lacaios ao vencer (inclusive sem recompensa póstuma por projétil perfurante) e simulação de dez minutos. Qualquer novo inimigo deve preservar leitura de ataques e desempenho. Modos opcionais não alteram o modo infinito padrão; testar retornos de cada chefe e invariantes de tempo longo sem simular frames gráficos desnecessários.

### Etapa 7 — Diagnóstico da tentativa (**implementado; revisão visual em andamento**)

A pausa contém atributos atuais: integridade, dano direto por projétil, intervalo de disparo, munição/capacidade, recarga completa, velocidade, armadura e atração. Também lista módulos, Gambiarras, Experimentos e sinergias ativos. O dano não é apresentado como DPS: efeitos condicionais, críticos, rajadas e área são explicitamente excluídos. O painel é somente leitura e utiliza a pausa existente, com rolagem própria para builds longas.

Proteção: a suíte verifica valores após dano e magnetismo modificados, munição parcial, relógio congelado, estado de combate intacto, limpeza após retry e ausência do diagnóstico nas ofertas de upgrade. O painel não grava perfil nem concede atributos.

### Etapa 8 — Manual de campo (**implementado e revisado**)

Compêndio somente leitura na garagem, organizado em nove árvores, Gambiarras e Experimentos. Exibe os 36 módulos da árvore e as 12 escolhas especiais com nomes, vantagens, custos e requisitos extraídos do catálogo utilizado pelo combate. A restrição de Ricochete para armas com retorno também aparece. As seções expansíveis usam controles nativos de teclado; a grade se adapta à largura disponível. A consulta não depende de ter iniciado uma tentativa nem desbloqueia módulos.

Proteção: testes garantem 48 IDs únicos, onze grupos, requisito da Perfuração, custo canônico, ausência de duplicação ao reconstruir e preservação de perfil/build/estado. Novas restrições de elegibilidade precisam ser refletidas no manual. Consultar nunca chama os efeitos de instalação.

### Etapa 9 — Renovação de ofertas (**implementação experimental**)

Cada tentativa começa com uma carga de renovação. No level-up comum, botão ou Q substitui as cartas por opções elegíveis distintas das descartadas. A carga única é o limite de uso: não há compra, gasto de materiais ou renovação ilimitada. Chefes, Experimentos e Gambiarras preservam suas ofertas próprias. Se não houver alternativas suficientes para substituir todas as cartas, o botão é desabilitado e a carga é preservada. Após usar, o botão informa zero cargas. Retry restaura uma carga; ela não entra no perfil persistente.

Proteção: testes verificam elegibilidade e exclusão, três opções novas, seleção pelo teclado, prevenção de default, tecla repetida, consumo único, callbacks antigos invalidados, perfil/XP/nível/atributos/relógio intactos, restrições por tipo de oferta e pool esgotado sem consumo. O antigo teste de arte agora identifica cartões por data-skill para não confundir controles com módulos.

### Verificação integrada de duração longa

A simulação automatizada agora percorre mais de 25 minutos: registra ex-policiais e perseguidores grandes em ondas reais, exige ao menos seis chefes derrotados e verifica os limites de inimigos/projéteis/feedback a cada passo. Continua resolvendo ofertas comuns, Gambiarras e Experimentos. O modo permanece em combate após o marco de 20 minutos. Usa invulnerabilidade e mira automática em DOM/canvas simulados; não comprova balanceamento, desempenho gráfico, habilidade de sobrevivência ou partida manual inteira.

## Barreiras históricas de regressão (consulte o contrato atual para regras vigentes)

- Um teste deve reproduzir qualquer bug corrigido para impedir sua volta.
- `reset()` deixa apenas chassi e arma escolhidos na garagem; limpa vida, munição, skills, chefes, projéteis, ofertas, timers e efeitos da tentativa anterior.
- Pausa congela relógio, horda, inimigos, chefe, projéteis e efeitos de dano; limpar foco/entrada não dispara a arma ao retomar.
- O combate mantém aim/fire manual, recarga e limites de projéteis/inimigos; dano empurra o robô 48 px para longe da fonte (com direção de fallback se não houver fonte), e movimento/câmera não podem prender o jogador à arena. `tests/combat.cjs` verifica empurrão em ambos os sentidos.
- Hordas continuam circulares, em grupos, acelerando conforme o relógio; chefes voltam em ciclos e têm recompensa única.
- Gambiarras aparecem apenas nos níveis 3, 6 e 9; uma escolha não se repete na tentativa, pular não aplica bônus e `reset()` remove todos os bônus temporários sem tocar no perfil local.
- Recompensas de chefe salvam a peça uma única vez, curam 20, suspendem a horda até a decisão e aplicam somente um experimento com custo explícito; experimentos não repetem e desaparecem no `reset()`. As teclas 1–3 aceitam uma opção e R recusa.
- Novos perfis mantêm ao menos PROT-0001 + Metralhadora disponíveis; gear bloqueado só fica selecionável após compra registrada. Cada compra valida saldo/peça, debita uma vez, salva antes de confirmar e devolve recursos se o save falhar. Saves v1 preservam equipamento antigo. Arma/chassi não mudam durante combate; desbloqueios não persistem bônus de atributo.
- Cada chefe só chama seus lacaios próprios; eles contam no teto de inimigos, recebem dano/XP/sucata normalmente e são removidos com o chefe, enquanto zumbis comuns preexistentes permanecem. Lacaios removidos não podem receber acertos atrasados do mesmo projétil nem gerar abates, XP ou sucata postumamente.
- Até 4:59 não há ex-policiais nem perseguidores grandes; de 5:00 em diante, uma vaga por onda completa é um ex-policial atirador; de 15:00 em diante, uma de cada três ondas completas acrescenta um perseguidor grande, se houver vaga. Ondas incompletas são apenas de perseguidores comuns. Todos ocupam posições circulares, respeitam o teto de entidades e os relógios de função reiniciam a cada tentativa.
- A formação dos lacaios é determinística por identidade e ciclo do chefe; variar a formação exige manter seus testes de encontro reproduzíveis.
- O HUD de combate mantém instruções curtas de mover, mirar, atirar, recarregar, pausar e ativar o propulsor; as relações núcleo ciano → XP e sucata dourada → parafuso permanecem visíveis. Durante o chefe, a barra também mostra reforços restantes e que ondas comuns estão pausadas.
- Em telas de até 720 px, a faixa de controles começa abaixo da barra/status do chefe; o teste protege a posição CSS responsiva contra sobreposição.
- Nenhuma etapa remove assets ou mudanças de outras pessoas sem revisar `git diff` e o estado do repositório.
- Não ajustar balanceamento silenciosamente para fazer teste passar: atualizar teste só quando o contrato vigente já tiver mudado e documentar a mudança.

## Registro desta entrega

- Ajustado o mock de canvas do minimapa em `tests/combat.cjs`.
- Corrigidas as expectativas antigas de encerramento aos dez minutos, desenho de bateria já removido, horda unitária, estatísticas fixas dos zumbis, limite histórico de inimigos, agenda sem chefe recorrente e escala antiga do sprite.
- Implementado o congelamento do cronômetro de ondas durante encontro e recompensa de chefe, com verificações de pausa, retomada após recompensa e reset na Etapa 1.
- Criado perfil local versionado: cada sucata de zumbi coletada dá um parafuso, cada chefe vencido entrega sua peça identificada, e ambos permanecem após a derrota; nenhum recurso é gasto ainda.
- Adicionadas verificações de persistência, perfil recarregado, peça única, drops não coletados e separação entre recursos permanentes e skills temporárias.
- Implementadas Gambiarras temporárias nos níveis 3, 6 e 9, com três opções originais entre seis bônus, teclado 1–3, pular, sem repetição na tentativa e reset; os efeitos e a cadência são experimentais.
- Estendida a simulação de dez minutos para resolver escolhas de skill, recompensa e gambiarra sem bloquear o relógio.
- Adicionada legenda persistente ao HUD de combate “SUCATA DOURADA → +1 PARAFUSO” após o Tester cego indicar que a coleta não ficava clara; segunda leitura considerou a relação visível e compreensível.
- O Tester Inteligente revisou persistência e bênçãos e não encontrou bugs; foram fechadas as lacunas apontadas (falha/recuperação do armazenamento e nível 9).
- Transformada a escolha pós-chefe em três experimentos temporários de risco/benefício, com seis opções sem repetição, atalho, recusa e retorno a módulo comum quando esgotadas; a peça salva permanece separada.
- A recusa pós-chefe foi destacada como “RECUSAR E CONTINUAR [R]”, ganhou área clicável/foco visível e atalho de teclado dedicado após a revisão UX apontar que o botão anterior ficava discreto. A tela agora explica cura e peça permanente e devolve o foco ao botão de pausa após escolha/recusa.
- Aplicada paleta de laboratório âmbar às cartas de experimento para distingui-las do level-up; revisão estática apontou que falta captura para confirmar contraste e quebra de texto na execução.
- Repetido o playtest cego: o jogador não chegou à recompensa do chefe por morrer aos 1:08, escolhendo o lança-foguetes e causando 70/650 de dano ao chefe. Para responder à falta de instrução no combate, foi adicionada uma faixa permanente e compacta com os controles essenciais; legibilidade visual ainda aguarda playtest.
- Revisão técnica encontrou sobreposição potencial da faixa com a barra do chefe entre 431–720 px; deslocada para baixo e adicionada asserção responsiva. Cobertura também confirma foco após recusa via botão, prevenção de default em R e que segurar R não recusa.
- Nova rodada cega confirmou que mover, mirar e atirar agora se destacam e permanecem legíveis durante a luta; recarga, pausa e propulsor são percebidos como instruções secundárias.
- Implementados três papéis originais de lacaio de chefe: perseguição veloz, tiro simples e leque elétrico. Cobertos com testes para contagem, ataques, cap, pausa da horda e limpeza ao derrotar chefe.
- Fixada a formação angular de cada chefe/ciclo para manter os encontros e testes reproduzíveis sem remover a variação entre identidades.
- A revisão inteligente encontrou uma recompensa post mortem possível quando um projétil perfurante matava o chefe antes de atingir um lacaio removido. A limpeza agora zera a vida dos lacaios antes de filtrá-los; teste reproduz a trajetória e garante ausência de abate, XP e sucata tardios.
- Playtest cego percebeu que as marcas coloridas distinguiam reforços, mas não explicavam seus papéis. Troquei as letras por rótulos acima de cada lacaio e nomeei o papel no aviso; a segunda leitura confirmou CORREDOR legível. Como também não era possível distinguir reforços antigos de novas ondas no minimapa, o HUD do chefe ganhou a contagem de lacaios e o status “ONDAS COMUNS PAUSADAS”; playtest confirmou ambos.
- A primeira faixa textual ainda ficou pequena na janela compacta do playtest; aumentada para 9 px com preenchimento maior, mantendo contraste e espaço responsivo para controles. Segunda leitura confirmou rótulo legível, número de lacaios e pausa das ondas.
- Implementada a primeira progressão de garagem em perfil v2: equipamento-base livre, compras por parafusos e peças de chefe, assinatura de armas por chefe, custos no design e migration v1 que preserva todo gear do protótipo.
- A compra é atômica com o salvamento local: testes confirmam preço, saldo insuficiente, requisito de peça, consumo único, reload, morte, retry, reembolso em falha de armazenamento e loadout fixo durante combate.
- Revisor detectou transbordamento horizontal na garagem a 648 px causado pela regra de três colunas. A grade de armas agora reflowa para duas colunas até 800 px; verificação de CSS foi adicionada e playtest responsivo pendente.
- O Tester Inteligente encontrou um segundo overflow de 8 px por `main` ocupar `100vw` enquanto uma scrollbar vertical reduz o contêiner. A garagem usa agora `width:100%`; teste protege essa regra. O Revisor também encontrou um bloco duplicado de botão/IDs, removido e coberto com asserção de IDs únicos.
- A migração de perfil v1 agora grava v2 no primeiro carregamento; teste confere tanto o objeto em memória quanto o JSON armazenado. O feedback de compra insuficiente informa o requisito no próprio cartão e numa região `aria-live`; preços/feedback ampliados para 9/12 px.
- Revisor verificou 648×720 após o reflow: uma CTA, IDs únicos, custos legíveis, `documentElement.scrollWidth === clientWidth`, e feedback de saldo insuficiente visível/sem compra. O cartão e a região `status` agora repartem o texto em rótulo curto e explicação detalhada para reduzir repetição na leitura assistiva.
- Especializados os zumbis comuns conforme a cronologia já definida no game design: ex-policiais atiradores após 5 min e perseguidores grandes ocasionais após 15 min, mantendo a formação circular e o teto. Testes reproduzem os limiares, composição, dano à distância, atributos, silhueta, limite de vagas e reinício da cadência.
- Playtest de combate pelo Tester Inteligente confirmou movimento/disparo, pausa segura para planejar, 16 abates e level-up até nível 2 aos 47 s; a tentativa acabou aos 52 s, antes do chefe de 60 s. A sobreposição da pausa escondia as gemas; reduzida a opacidade da cena pausada para mantê-las visíveis e protegido por asserção CSS. O playtest de partida até chefe/20 min segue pendente.
- Repetição no CSS atualizado: pausa confirma relógio congelado, foco preservado, inimigos visíveis e retomada de movimento/tiro; 15 abates, nível 2 e Campo Magnético. Gemas foram coletadas, mas continuaram menos distintas que os zumbis. Derrota natural aos 45 s, antes do chefe; nenhum retry. A tentativa inteira terminou com morte, mas não alcançou o chefe nem o marco de 20 min; playtest de longa duração continua pendente.
- Para responder à baixa distinção visual observada, o HUD agora rotula o núcleo ciano → XP junto à barra, e o núcleo no mundo recebeu halo maior e contorno claro. A medição em 648×720 revelou uma regra antiga limitando o painel a 120 px; removida para o HUD compacto manter espaço para o rótulo. O playtest cego confirmou que munição quebrava em várias linhas e escondia a recarga; a grade móvel foi reorganizada em coluna única, compactada e ganhou asserção de regressão. Verificação no navegador confirmou munição, estado e barra de recarga dentro do cartão, sem rolagem interna. Testes garantem rótulo, contraste, coleta de 1 XP e o dobro com a skill de experiência; magnetismo, valores e duração continuam iguais. A tabela de design foi reconciliada com o cronograma de chefes que já estava implementado e coberto por teste.
- O Tester Burro recarregou após a correção e, em 648×720, confirmou 24/24 e a barra de recarga totalmente visíveis, sem rolagem interna. No playtest anterior viu o núcleo perto do jogador e leu a função pela legenda, mas não confirmou coleta antes de morrer aos 18 s; o Tester Inteligente também não viu um drop no campo. A identificação visual do drop foi observada por um tester; sua coleta em jogo continua por confirmar manualmente.
- O tester cego completou uma tentativa de 18 s e não alcançou a primeira melhoria; a próxima rodada de UX deve expor os controles dentro da arena.
- Execuções desta etapa: `node --check game.js`, `node tests/combat.cjs`, `node tests/sprite-animation.cjs` e `git diff --check`.

Validação da etapa 7: o Tester Burro confirmou atributos legíveis e botões CONTINUAR/VOLTAR À GARAGEM acessíveis em 648×720. O Tester Inteligente identificou que Sobrecarga Reativa não aparecia no intervalo: o diagnóstico e o disparo passaram a compartilhar o cálculo efetivo, com teste do intervalo de 0,11 s durante a Sobrecarga. A rolagem interna do diagnóstico é prevista para builds extensas.

Validação da etapa 8: o Tester Inteligente revisou os 48 registros, requisitos e restrição por arma sem encontrar bug concreto; a suíte passou. O Tester Burro abriu uma árvore, Gambiarras e Experimentos em 648×720 e confirmou leitura, custos destacados e navegação por rolagem. A fonte dos parágrafos foi aumentada de 11 para 12 px após seu comentário. O botão de saída permanece no início da garagem, acessível ao rolar para cima.

Validação da etapa 9: revisão do Tester Inteligente não encontrou bug concreto em consumo, filtros, callbacks ou reset; suíte passou. O Tester Burro fez uma tentativa real e morreu aos 23 s no nível 1, sem chegar à oferta. Portanto botão, troca visual das cartas e estado de carga usada ainda precisam de confirmação manual; os testes de DOM simulado verificam a operação funcional.

A revisão do Tester Inteligente confirmou a execução longa e apontou aleatoriedade não reproduzível e limites parciais. A simulação passou a usar seed fixa 20261031 somente nesse trecho, restaurando Math.random ao concluir; também monitora limites de sucata (250), efeitos (150), partículas (600) e perigos (60). Núcleos não têm teto definido pelo jogo; ataques/interações dos papéis tardios continuam cobertos pelos testes específicos, sem alegar que sua mera presença os valida.

Preparação da próxima etapa: Dev designer entregou seis propostas em `docs/especializacoes-chassi-proposta.md`, três por chassi, com oferta no nível 10 confirmado pelo criador. São propostas experimentais ainda não implementadas; há cuidados de interação e proteções previstas para cada efeito.

### Etapa 10 — Especialização temporária do chassi (implementada no desenvolvimento)

Decisão do criador: oferta no nível 10. Três opções fixas próprias do chassi copiado da garagem; uma escolha ou recusa por tentativa. A escolha pausa a simulação e não participa da renovação Q. Os seis efeitos originais seguem `docs/especializacoes-chassi-proposta.md`. Nenhum desbloqueio ou atributo de especialização é persistido.

Proteções exigidas: oferta na transição 9→10, teclado 1–3, versão obsoleta rejeitada, filtro por chassi, pausa, recusa, oferta única e reset; efeitos específicos de Isca/Marca/Alerta/Aterramento/Freio/Leitura; sincronização entre aviso ampliado do Sucateiro e ativação do perigo; diagnóstico/manual atualizados. A simulação longa deve resolver também a nova oferta.

Validação da etapa 10 — 01/11/2026: suíte integrada de 25 minutos, seis escolhas por teclado, recusa, filtro de chassi, pausa, reset, fontes de dano e efeitos condicionais passaram. Revisão inteligente encontrou Nove Vidas ignorando ex-policiais e dano do Sucateiro um frame antes do fim do aviso: ambos corrigidos e reproduzidos por testes. A fixture tests/preview-specializations.html mostrou a UI real do PROT em 648×720; Tester Burro confirmou três cartas, recusa, Tab e seleção1 com toast. Isso não comprova chegada manual ao nível10 nem balanceamento. A fixture é ferramenta de desenvolvimento e não deve entrar no pacote público.

BUILD34 — pedido de playtest do criador substitui a faixa permanente de controles: ela desaparece aos5s de jogo e retorna no retry; a dica ESPAÇO fica junto da arma somente com Propulsor adquirido. Ondas circulares comuns nascem inteiramente fora da câmera com margem96px; aproximação suavizada260→velocidade normal conforme distância580→180px, preservando status, formação e teto. Limpeza distante usa raio proporcional ao maior eixo para não eliminar entradas de telas panorâmicas. Testes cobrem câmera deslocada, retrato/panorâmico, velocidade monotônica, tutorial e reset. Áudio procedural independente do RNG de combate; tests/audio.cjs cobre inicialização por gesto, notas sem duplicação, pausa, mute e throttle. Qualidade sonora ainda exige audição humana.

Revisão técnica BUILD34: sem bug concreto nas entradas/câmera/velocidade/visibilidade. Tester Inteligente encontrou asserção fraca na pausa do áudio; o teste agora exige novos cancelamentos ao pausar (além dos stops já agendados) e retomada de notas após avançar o relógio. Audição e sequência sonora prolongada no navegador seguem avaliação humana.

Teste visual BUILD34: Tester Burro confirmou sliders35%/60%, controles presentes no início e ausentes aos10s, pausa aos11s. Viu inimigos junto às bordas, mas não capturou o instante de nascimento. Testes geométricos cobrem nascimento fora da tela; audição não foi realizada pela ferramenta.

BUILD35 — regras atuais substituem as barreiras históricas de quatro zumbis/teto/suspensão em chefes: ondas de15, intervalo6,4→1,5s, sempre ativas enquanto jogando; vivos distantes não são descartados. MinimapPoint preserva direção e limita marcadores à borda, trazendo-os para dentro ao aproximar. Renderização do mundo ignora apenas o desenho fora da câmera; simulação e minimapa mantêm os registros. Sucateiro acompanha/recua em todas fases para manter180–240px. Armas locais originais distinguem ex-policial, lacaio atirador e condutor. Testes substituem contratos anteriores deliberadamente e cobrem população acima160, registros a50.000px, minimapa em todos quadrantes, aproximação dos marcadores, perseguição/recuo/distância do segundo chefe e15 por onda.

Revisão BUILD35: Tester Inteligente não encontrou bug funcional e confirmou persistência/ondas durante chefes/armas sem RNG. Apontou risco de busca de toda a horda por projétil; colisão ganhou índice espacial de128px, consulta pelo segmento e raio máximo, deduplicação e atualização após empurrão. Todos continuam simulados. A suíte longa anterior foi interrompida deliberadamente após essa mudança para executar a revisão atual. Tester Burro não conseguiu abrir o preview por restrição de verificação de URL; não há confirmação visual nova dessa rodada.

Parâmetro final BUILD35 após novo feedback: aproximação210px/s distante, transição suave de720 até320px, velocidade normal dentro320px. Coberto por regressão nos dois extremos. A simulação longa omite desenho do minimapa e usa distância quadrática na mira do driver para concentrar custo na lógica; testes de minimapa são separados.

Após ondas15 sem interrupção em chefe, a simulação estática antiga chegou25min mas não derrotou seis chefes; isso não demonstra bug de cronograma. Para manter cobertura de múltiplos ciclos sem confundir com balanceamento, o driver agora derrota de forma controlada chefes após30s e resolve suas ofertas. Relógio, horda, ataques e estados continuam simulados. Esse cenário usa invulnerabilidade e derrotas programadas e não é uma partida real; os testes específicos continuam validando dano/avisos/colisão.

O cenário prolongado BUILD35 usa também dano sintético100× e perfuração10 para exercitar a progressão e os ciclos sem virar uma medição de cerco estático com milhares de alvos. Persistência sem mortes e sem teto é coberta pelo cenário específico; a execução prolongada não comprova performance de fuga ilimitada. O driver de teste não é incluído no jogo.

Resultado final BUILD35: simulação controlada25min passou; regressões de movimento/colisão/estados e cenário de fuga2min sem disparar passaram, com mais250 vivos e preservação do inimigo remoto original. Áudio e sprites passaram. Revisão do índice espacial comparou1.500 consultas com busca completa, incluindo negativos, chefe grande e empurrão entre células, sem divergência. Validação visual segue limitada pela ferramenta; custo de fuga muito prolongada ainda precisa de medição em navegador real.

BUILD36 — correção do criador: policiais são5/15 apenas após derrota do segundo chefe, dois arquétipos alternados. Comuns não têm sprint de aproximação. ShieldPolice tem escudo100; recebe dano por toda a rota normal de dano do jogador, escudo absorve golpe de quebra e não geraabate/XP. Só esse sobrevivente entra em pausa/mira0,7s, direção fixa e corridaaté240px/340pxs, voltando à pausa. Rifle mantém comportamento; sem gatilho por número de tiros. Testes: bloqueio temporal/derrota/reset, quota5, dois tipos, escudo40+60, ausência de dano no corpo/XP aoquebrar, excessoabsorvido, isolamento entre portadores, dano posterior, parada, travamento de direção, limite240px e repetição. Parâmetros experimentais. Documentação anterior de sprint210/320px e entrada aos5min é histórica e substituída.

Validação final BUILD36: suíte25min, cenário de fuga, testes de escudo/rota individual e áudio/sprites passaram. Tester Inteligente não encontrou bug concreto e confirmou colisão durante corrida, pause, stun/slow e bloqueio após retry em verificações independentes. Sem confirmação visual da mecânica nova nesta rodada.

BUILD37: substituída trilha por escolha de synthwave suave do criador. Cenas musicais menu/garagem/combate, fades de saída/entrada e SFX de transição; controles existentes preservados. tests/audio.cjs verifica agenda durantefade, destino final em navegação rápida, retomada, mute e ausência de duplicação. Revisão inteligente não encontrou bug concreto. Mocks não validam curvas sonoras, cliques ou qualidade musical; audição humana permanece necessária. O combate não mudou e recebeu regressões direcionadas, sem repetir simulação25min já validada da mecânica.

BUILD38 — bancada de módulos e configuração adaptadas das referências fornecidas, preservando infinito e loadout. Testes protegem configuração→voltar/iniciar, recursos intactos, bloqueio de troca duranteconfig, previewsem efeito, descrição/árvore, confirmação e stale apósrenovar. Revisão inteligente encontrou Enterglobal sobrepondo botões de skip/opção; corrigido com retorno ao comportamento nativo e foco emconfirmar após1–3. ui-redesign.css centraliza regras novas e hidden. Fixture tests/preview-workbench.html abre configuração/melhorias/HUD sempartida para QA. Browservisual indisponível nesta rodada, explicitamente sem alegação de fidelidade verificada. Combate recebeu regressões direcionadas; áudio/sprites passaram.

BUILD39 — painel Manus conectado ao balanceamento das próximas tentativas. Catálogo com54 registros originais e IDs estáveis; efeitos diretos numéricos, requisitos e níveis normais editáveis. Comportamentos condicionais e cadências de ofertas especiais preservados. Rascunho e configuração aplicada usam chaves separadas do perfil do jogador. Aplicação valida números, operadores, IDs, requisitos, ciclos e metadados. Snapshot profundo e imutável por reset: nenhuma mudança de configuração afeta uma tentativa em andamento. Novos módulos normais são permitidos; originais são desativados explicitamente, mantendo os registros para restauração.

Regras contra regressão BUILD39: manter sincronizados módulos originais e catálogo; comparar48 callbacks diretos com fixture anterior à integração; rejeitar configuração inválida sem sobrescrever a aplicada; preservar flags condicionais e ajustar munição após modificadores; não usar textos/unidades como código ou fórmulas; raridade/grupo/árvore são organização; somente tipos normais novos recebem lógica genérica. Os14 atributos diretos suportados são expostos pelo runtime, com limites numéricos declarados no catálogo.

Validação BUILD39: tests/balance-panel.cjs passou cobrindo catálogo,48 efeitos, custos, flags, módulos personalizados, categorias especiais, armazenamento indisponível/corrompido e perfil intacto. Áudio e sprites passaram. Asserções de combate passaram com balance.js carregado em memória, excluindo somente o bloco de simulação25min e suas verificações dependentes; esse teste prolongado não foi repetido. Chrome real, desktop1440 e celular390: editor, árvore, editar ganhos/custos, rascunho sem efeito, aplicação só no próximo reset, criar módulo e abrir sua prévia, importação inválida/válida e operação offlinefile:// passaram. O loader usa o mesmo index.html?painel=skills para compartilhar armazenamento com o jogo; esse compartilhamento foi verificado no Chrome. Não é aprovação de promoção ao canal público nem comprovação de balanceamento por partida humana.

BUILD40 — dez receitas reais em builds.js, guias no menu/garagem e quatro chassis novos. Catálogo passa a 70 (40 normais, seis gambiarras, seis experimentos e 18 especializações). A pesquisa cobre famílias de motores e sinergias de 20 Minutes Till Dawn, sem alegar enumeração de todas as combinações. Regras e resultados: dez-builds.md, pesquisa-builds-20mtd.md e resultado-dez-builds.md.

Regras contra regressão BUILD40: guia nunca concede skills ou equipamento; seleção exige garagem e posse. Manter perfis e edições do painel na migração 54→70, renomeando IDs personalizados conflitantes e suas referências; migração deve ser idempotente. Cura parcial de recarga é proporcional, protocolos exigem cura efetiva, drones têm limite de três e não geram procs recursivos. Escudo policial continua absorvendo o golpe que o quebra, inclusive com Motor Cinético. Renovação normal tem uma carga por nível. Célula verde exige coleta e não concede parafusos. Preservar ondas de 15, inimigos vivos distantes e a liberação dos policiais após o segundo chefe.

Validação BUILD40: regressão de combate e cenário controlado de 25 minutos passaram, assim como áudio, sprites, painel, migração, chassis e interações. Chrome verificou os dez guias, seis chassis, travas de posse, ausência de concessões gratuitas, teclado e celular de 390 px. Avaliação de balanceamento separa 70 cenários de bancada e 20 tentativas com progressão normal e sementes fixas; todas as falhas são preservadas. A meta de 20 minutos e três chefes não foi atingida por todas as receitas. Não alterar essa meta para aprovar resultados nem promover automaticamente ao público.

BUILD41 — evolução da arma no nível 20 confirmada pelo criador. Duas reforjas por arma, catálogo de 24 opções com vantagem/custo, recusa e aplicação única por tentativa. Mantém identidade do equipamento, recursos, munição e recarga em andamento; projéteis carregam snapshot das propriedades intrínsecas de sua emissão. Guia recomenda uma reforja, sem alterar a oferta. Manual da arma na garagem e diagnóstico de pausa mostram a evolução. Testes específicos, Chrome e cenário integrado de 25 minutos passaram; detalhes de avaliação em evolucao-armas.md. O mapa geral foi atualizado e o contrato atual separa decisões vigentes dos registros históricos.

BUILD42 — reavaliação completa da BUILD41 em 20 tentativas: sete sobreviveram à janela de 20 minutos, seis cumpriram também três chefes. Lança de Fuga tinha zero aprovações nas quatro sementes iniciais da receita original; a hipótese de apenas reorganizar coleta não generalizou e ficou registrada como falha de validação. A hipótese NANO + Arpão + reparo/mobilidade melhorou os seis pares avaliados e cumpriu a meta em cinco; foi adotada experimentalmente após passar a regra registrada, incluindo dois sorteios novos. O caso morto por volta de 19:56 permanece reprovado. Nenhum atributo global de jogador/arma/inimigo, preço, XP ou cronograma foi alterado. A bancada atual das dez receitas passou em 70 cenários. Comparadores rejeitam mundos, drivers, janelas e metas incompatíveis; receitas alternativas são JSON isolado e os dados brutos de todas as hipóteses ficam preservados. Meta geral continua ativa: outras famílias e ajustes de balanceamento seguem pendentes.

BUILD43 — família original de corrosão programada implementada como quatro módulos normais. Limites: uma carga sem renovar/acumular, prazo efetivo0,25–30s, base até1e9, respingo para dois vizinhos a100px em uma geração e escudos bloqueando aplicação. Tick usa referências capturadas antes do processamento; não envelhece filhos imediatamente. Catálogo passa a74, normal44/árvores11; schema3 migra54/70, inclusive custom com ID novo e condição vazia. QA descobriu descrição padrão comparando efeitos com o objeto errado: corrigida a leitura para recuperar ganho/custo autoral sem alterar números. Regressão25min e testes específicos passaram; Chrome desktop/celular, migração e108 cenários de bancada em12 armas passaram, além dos70 cenários das dez receitas. Duas tentativas naturais usaram corrosão, mas nenhuma cumpriu20min/trêschefes. Resultados e regras em corrosao-programada.md; não tratar como aprovação de balanceamento ou conclusão do objetivo geral.

BUILD44 — Sensores de campo, quatro módulos normais. Pulso periódico sem projéteis/munição; alcance por círculo, relé de fogo/frio e exposição para balas, sem repetir canais secundários. Primeira carga usa os números já editados; upgrades não reiniciam o timer. Migração78/schema4 usa revisões declaradas de introdução, preservando74 registros e edições de corrosão. QA visual encontrou dois cooldowns fora da tela em390px com seis habilidades: nomes compactos, grade em duas linhas e legenda separada; Chrome verificou todos visíveis. Unitários, cenário controlado25min,144 cenários de sensor e70 das dez receitas passaram. Duas tentativas normais do ensaio NANO+Laser sobreviveram20min; uma cumpriu três chefes, outra só dois e segue reprovada na meta completa. Mecânica e balanceamento permanecem separados em sensores-de-campo.md. Objetivo geral ativo; próximos sistemas e ajustes seguem pendentes.

## BUILD45 — acabamento e medição

PROT ganhou caminhada original em32quadros/quatro direções, com manifesto clássico que funciona no ZIP offline. O relógio está no tick, congela na pausa e não consome RNG. Testes Chrome verificaram HTTP/file, pivôs, alfa e fallback sem atlas/helper/manifesto. A arte mecânica dos zumbis ganhou um atlas candidato separado, ainda sem ativação: exige revisão no cenário antes da substituição.

Áudio agora diferencia as12armas e conecta nove famílias de efeitos aos eventos efetivos; rajadas soam por emissão, cura zero não toca reparo, ataques de chefe soam após os avisos. Música synthwave mantém a preferência aprovada. Testes incluem110s de agendamento e render de sinal sem clipping, sem alegar escuta humana.

A medição de hordas rejeitou a primeira proposta por regressão. O segundo candidato reduziu o tick do pacote Plasma concentrado em46–75%; no caso5000 próximos ainda são482ms médios, portanto o desempenho extremo continua pendente. Equivalência completa de estado/efeitos/RNG foi comparada em18mundos com mortes, lacaios, empurrões e dano secundário. Ver desempenho-hordas.md.

Pendências concretas: arma empunhada do jogador; animações reais dos demais chassis, zumbis e chefes; custo de renderização densa; aprofundamento de suportes e chassis com mais slots; reavaliação natural das dez builds após conteúdo; candidato público revisável. Esta etapa não declara o jogo completo nem aprova publicação pública.

## BUILD46 — arma empunhada

Fechada a lacuna visual da arma invisível:12modelos próprios desenhados com a mesma geometria pixel/industrial do renderer de armas inimigas. O cano segue a mira manual, com mãos conectadas ao corpo, recuo por emissão efetiva e inclinação durante a recarga. Estado visual não altera dano, munição ou trajetórias. A pausa congela o recuo e reinício zera o gesto. Chrome verificou12equipamentos na arena, mira para ambos os lados e emissão/recuo; contact sheet e captura da Tesla revisadas. A pendência de arma invisível citada na BUILD45 está encerrada.

## BUILD47 — caminhada inimiga e atlas imutáveis

Três zumbis têm96quadros direcionais ligados à distância percorrida, incluindo Brutamontes. Parada, atordoamento, pausa, armas/escudos e estados foram preservados. Cache de36atlas imutáveis elimina recomposição contínua e restringe flash à silhueta. Duas hipóteses lentas foram rejeitadas antes de adotar o renderer medido. Chrome HTTP/file e fallbacks passaram; seis mundos compararam toda física/efeitos/RNG com animação desligada. Ver animacao-inimigos.md e build47-render-bench.json para resultados e limites. Ainda faltam animações próprias dos outros chassis e dos chefes procedurais, suportes/múltiplos slots e reavaliação de builds.

## BUILD48 — identidade dos chassis e movimento dos especialistas

Cinco chassis receberam sprites próprios com160quadros, retratos e fallback vetorial; os seis agora têm caminhada em quatro direções. A preparação/recuo e a passada dos chefes procedurais foram implementadas sem tocar na agenda/dano. A revisão visual levou a substituir os primeiros vetores por arte raster detalhada no estilo do PROT; os vetores ficam de fallback. Ver chassis-e-chefes.md. Passaram integração longa, seis mundos com visuais de inimigo/chefe ligados e desligados, fixtures Chrome HTTP/file e fallbacks. Check-release protege versões do menu/documentação/JSON e recursos offline. Equilíbrio, suportes adicionais, múltiplos slots e desempenho extremo continuam pendentes; arte dos dois especialistas ainda pode receber acabamento.

## BUILD49 — Rotores de Sucata

Quatro módulos originais adicionam suporte orbital de contato; quantidade/raio/período/dano têm custos próprios e limites. Colisão contínua inclui deslocamento do jogador sem repetir dano em vários quadros de sobreposição. Não emite munição ou efeitos da arma. Migração78→82 preserva rascunhos/configurações e colisões de ID; o editor usa a revisão da API. Ver rotores-de-sucata.md:108cenários controlados,70cenários das dez receitas, Chrome/migração/pausa e duas tentativas naturais que não cumpriram1200s+3chefes. Nenhuma receita canônica ou atributo global de inimigo foi alterado. A integração de suportes agora tem drones, sensores e rotores; múltiplos slots e avaliação ampla de equilíbrio continuam pendentes.

## Preparação após BUILD50 — estado por arma

Combate passou a receber estado explícito de arma para emissão, rajada, cadência, recarga e reforja. A principal mantém compatibilidade com o jogador; estados adicionais têm valores independentes. Módulos aplicam atributos de arma por espaço e vida/movimento uma única vez.48 mundos de12armas comparam estado/RNG exatamente com a BUILD50;82entradas foram verificadas quanto a isolamento. A garagem ainda equipa uma arma:armações avançadas, HUD, origem dos procs, reforjas por espaço e combinações precisam de integração antes de anunciar multisslots ou publicar nova versão estável. Ver armas-por-estado.md.

## BUILD51 — arsenal avançado integrado

BAST admite atéduas armas e ENXA atétrês, opcionais e desbloqueadas. Custos por quantidade, disparo/mira manuais compartilhados, estados e reforjas20 independentes, reposição àorigem, limite400rotativo e HUD responsivo. Ver arsenal-avancado.md.140casos controlados,1452combinações curtas,48mundos single idênticos e quatro tentativas de1200s com4/4/7/4chefes passaram. Driver10 encaminha estado/origem ao instrumentar; resultados históricos não são pareamento de balanceamento. A avaliação ampla das dez receitas e o acabamento/desempenho finais continuam pendentes; publicação pública depende de aprovação real.

### BUILD52 — Horda procedural e ganhos diretos

Por pedido do jogador, substitui população ilimitada por diretor com teto crescente, reposição por abates e reentrada de perseguidores distantes ao mudar de região. Quatro módulos deixam de cobrar penalidades em atributos da arma; builds podem superar a pressão sem receber escalada proporcional ao dano. Regras e resultados em horda-procedural.md. O contrato52 prevalece sobre registros anteriores.

### BUILD53 — Recompensa física e bot de partida

Chefe deixa baú com escolha de hardware raro, favorecendo arma ou suporte instalado; usuário esclareceu que efeitos duram sóna tentativa.12peças, sem repetição, fora dos sorteiosnormais; experimentos anteriores ficam de fallback. Bot inteligente/simples permite partida completa no Chrome e relatório. Visual dos tiros respeita arma emissora/critico. Ver baus-de-chefe.md e bot-de-testes.md.

### BUILD54 — Investigação de risco e coleta do bot

Reprodução em oito sementes separou política de coleta e atributos da build. Primeiro candidato cauteloso travou a coleta da Oficina e foi rejeitado; Driver13 verifica a aproximação imediata. Testes, mortes e fontes preservados em bot-rotas-seguras.md. Isso melhora a base de medição para equilíbrio, sem presumir dificuldade humana a partir de um bot.

### BUILD55 — Clareza de combate e paisagem móvel

Avisos deduplicados fora do centro, números agrupados, critical/escudo/fontes preservados. HUDhorizontal compacto por definição do usuário. Os chats Tester inteligente, tester burro, Dev designer e Revisor do projeto participaram da avaliação; problemas de tutorial, compactos e rolagem foram tratados. Testes e limitações em feedback-combate.md. Controles de toque e avaliações amplas de equilíbrio permanecem etapas próprias.

### BUILD56 — Entrada móvel manual

Dois direcionais para celular na horizontal, recarga e propulsor condicionado à skill. Cancelamento e rotação seguros, preservando mira/disparo manuais e comandos de PC. Regras e limites em controles-touch.md. Auditoria de escopo confirmou as dez receitas reais e identificou como próximas etapas a telemetria de progressão/alcance e o desempenho no caos atual, sem interpretar builds fortes como defeito.
