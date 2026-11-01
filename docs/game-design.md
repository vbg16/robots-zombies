# Design do jogo

> **Atualização aprovada — 31/10/2026:** Screwvivors passa a ser uma arena infinita de sobrevivência: sem bordas e sem tempo final, com horda crescente e chefes recorrentes. A colagem de HUD azulada enviada pelo criador define a composição da interface de combate. O visual segue pixel art de era 32-bit. Esta decisão substitui os planos anteriores de vitória em vinte minutos.
>
> **Atualização do protótipo — 30/10/2026:** [árvores e munição](arvores-e-municao.md) substituem o catálogo isolado de 28 skills e os bônus percentuais anteriores. São 36 escolhas únicas, com pré-requisitos, multiplicadores, custos, condições e recargas. Parâmetros históricos abaixo que conflitarem com esse documento estão superados. Valores novos são experimentais e aguardam teste humano.
>
> **Contrato atual de combate — 31/10/2026:** zumbis surgem em ondas circulares de quatro, com intervalo que acelera até um limite; quantidade e atributos escalam sem encerrar a sobrevivência. Novas ondas comuns e o contador de surgimento ficam suspensos enquanto um chefe está previsto, vivo ou aguardando a escolha de recompensa; depois retomam. Um perfil local guarda parafusos coletados e peças de chefe mesmo após a morte; skills da tentativa continuam temporárias. Testes de regressão cobrem ondas, pausa, escala, chefes recorrentes, dez minutos sem vitória forçada e retenção de materiais. O HUD de integridade do protótipo é uma barra proporcional, não pilhas de baterias.
>
> **Gambiarras do Biruta — protótipo experimental:** níveis 3, 6 e 9 oferecem três entre seis bônus temporários; opções distintas não repetem uma escolha na mesma tentativa. É possível escolher por teclas 1–3 ou pular. Os bônus desaparecem no reset e não alteram o perfil. Cadência, pool e valores ainda precisam de playtest.
>
> **Recompensa de chefe — protótipo experimental:** cura 20 pontos, guarda uma peça identificada no perfil e oferece três Experimentos do Biruta com custo e benefício, sem repetição durante a tentativa. A tela explica cura e retenção da peça. Teclas 1–3 escolhem; R ou o botão destacado “RECUSAR E CONTINUAR” recusa, preservando cura e peça. Depois de escolher os seis experimentos, chefes seguintes oferecem um módulo comum. Efeitos e valores precisam de playtest; nada além da peça é persistido.
>
> **Garagem e progressão entre tentativas — protótipo experimental:** perfis novos começam com PROT-0001 e Metralhadora. Parafusos e peças de chefe desbloqueiam armas e chassis; compras não concedem bônus permanentes de atributos. Custos aguardam balanceamento e playtest. O formato antigo do perfil migra preservando materiais e acesso a todo o equipamento já disponível no protótipo.

## Base técnica aprovada — 27/10/2026

O criador aprovou continuar o desenvolvimento do protótipo no navegador com HTML, CSS e JavaScript, aproveitando o código existente, sem migrar para Godot agora. O assistente ficará responsável pela maior parte da programação; o criador orientará as decisões e testará as versões. A prioridade é validar movimento, disparo manual e sinergias. Empacotamento para Windows/Linux e integração Steam serão avaliados posteriormente; nenhuma ferramenta de empacotamento ou biblioteca adicional foi escolhida. Esta decisão não altera as regras de design nem significa que as funcionalidades planejadas estejam implementadas.


## Ciclo principal confirmado

1. Entrar na garagem.
2. Escolher um chassi de robô, instalar peças e equipar as armas permitidas.
3. Iniciar a partida na cidade destruída.
4. Mover-se, mirar e atirar manualmente; enfrentar inimigos e coletar recursos.
5. Subir de nível e escolher entre melhorias disponíveis, adaptando a build ao sorteio.
6. Enfrentar chefes, com possibilidade de obter peças.
7. Sobreviver sem tempo final ou limite de arena até morrer; então escolher reiniciar ou voltar à garagem.
8. Usar a progressão permanente para preparar outras configurações.

O destino das recompensas em caso de morte e a submissão de resultados ao ranking ainda exigem regras específicas.

## Garagem e robôs

**Confirmado:** haverá vários robôs jogáveis. Eles podem se diferenciar por atributos, armas, habilidades e estilos de movimento, usando uma ou mais dessas diferenças. A garagem permite combinar o tipo de robô com peças e skills da partida.

“Manequim” foi o termo usado inicialmente para as bases desbloqueáveis. Nestes documentos, usamos **chassi** para essas bases, sem definir ainda seu nome na interface.

- Parafusos desbloqueiam chassis e equipamentos; neste protótipo, peças de chefe são chaves de projetos de armas assinatura, não itens instalados no chassi.
- Cada chassi oferece possibilidades próprias de peças é uma direção futura; nesta versão os dois chassis aceitam as doze armas e têm um slot.
- Mais armas desbloqueadas e chassis com mais slots são sinais de progressão.
- O PROT-0001 é o robô de referência inicial, associado à arma padrão.

**Progressão experimental implementada:** BAST-0002 custa 24 parafusos. O PROT-0001 e a Metralhadora são o equipamento inicial; não há incompatibilidade entre os chassis e as armas do protótipo, cada chassis usando um slot. Itens são desbloqueados uma única vez e a compra já seleciona o equipamento na garagem. Preços e ritmo de aquisição aguardam playtest.

## Armas

**Regra confirmada na última clarificação:** todo o armamento é escolhido antes da partida. Não há troca de arma durante o combate.

- Cada chassi determina a quantidade de armas que pode equipar.
- Chassis compatíveis permitem combinar armas diferentes na garagem.
- Há intenção de chegar a duas e até três armas em robôs avançados.
- Slots adicionais são progressão de equipamento; não são desbloqueados automaticamente ao subir de nível na partida.
- Armas equipadas podem evoluir depois de um nível X ainda não definido.
- Não haverá fusão ou receita de combinação entre armas. As sinergias vêm da interação com o robô, peças e skills.

A menção inicial a uma terceira arma “no último nível” foi substituída pelo esclarecimento sobre slots do chassi. O nível X de evolução da arma permanece pendente. Evoluir uma arma equipada não é o mesmo que fundir duas armas.

Tipos de armas, atributos, munição, recarga, mira de múltiplas armas e disparo simultâneo ainda não foram definidos.

## Controles e combate

**Confirmado:** andar e disparar manualmente são as ações básicas. Esquiva, corrida e habilidades ativas só existem se forem fornecidas pelo robô ou por uma skill adquirida na partida. O protótipo repete no HUD os comandos ativos para reduzir dependência da garagem; os mapeamentos finais permanecem pendentes.

Na pausa, o jogo congela para planejar a próxima ação e mantém a arena parcialmente visível (72% de sobreposição escura) para localizar zumbis, XP e sucata. O nível de transparência é uma melhoria de legibilidade observada no playtest, não um ajuste de balanceamento.

O playtest real alcançou duas melhorias e 15 eliminações antes da derrota natural aos 45 s; o coletor confirmou XP, mas relatou que as gemas azuis se distinguiam menos que os zumbis. Ainda falta chegar ao primeiro chefe em playtest e avaliar uma tentativa longa. A suíte cobre a simulação de dez minutos, mas ela não substitui essa observação manual.

O jogo deve exigir movimentação e execução, além de boas builds. Não é necessário impedir toda estratégia parada: uma combinação suficientemente poderosa pode permitir sobreviver sem se mover.

Teclas, esquema de mira, mapeamento das habilidades, pausa, opções de acessibilidade e suporte a toque ainda não são decisões de produção. Os controles do protótipo não constituem aprovação dessas opções.

## Skills e melhorias

**Confirmado:** skills são temporárias e desaparecem ao morrer. Elas se acumulam durante a partida e podem criar combinações exageradamente fortes.

- O jogador escolhe a configuração inicial na garagem; as ofertas de skills dependem de sorteio.
- Cada skill terá três evoluções ou variantes.
- O jogador escolhe entre as opções oferecidas.
- Melhorias vêm de níveis e de peças obtidas de chefes, ou de uma combinação desses sistemas.
- Podem existir vantagens com desvantagens, como dano maior em troca de velocidade.

É pendente definir se as três derivações são caminhos exclusivos, níveis sequenciais ou variantes combináveis. Também faltam regras de repetição, limites, raridade, quantidade de opções, experiência e frequência de subida de nível.

## Recursos e persistência

| Elemento | Regra confirmada | Pendente |
| --- | --- | --- |
| Parafusos | Sucata coletada vira parafusos; o perfil local conserva saldo após morte. Em perfis novos, 8–26 parafusos desbloqueiam chassis ou armas | Taxa de 1 parafuso por coleta e todos os custos são experimentais |
| Peças de chefes | Uma peça identificada por chefe é adicionada ao perfil local ao derrotá-lo e fica após a morte; uma peça é consumida para desbloquear cada arma assinatura correspondente | Peças não são instaladas em chassis neste estágio; compatibilidade de arma é universal no protótipo e preços aguardam balanceamento |
| Experimentos de chefe | Escolha temporária com vantagem e custo explícito, limitada a uma ocorrência por tentativa; desaparece ao morrer | Balanceamento dos seis módulos ainda é experimental |
| Chassis e armas | PROT-0001 + Metralhadora iniciam perfis novos; demais itens são desbloqueados uma vez na garagem. Perfis antigos v1 migram com todo equipamento prévio liberado | Ordem de preços, custos e taxa de aquisição são experimentais |
| Skills e Gambiarras da partida | Desaparecem ao morrer; não são upgrades permanentes | Regras técnicas de encerramento também na vitória; balancear efeitos experimentais das Gambiarras |
| Habilidade do jogador | Deve permitir vencer mesmo com equipamento básico | Curva de dificuldade e parâmetros |

Não há árvore de atributos permanentes nem fabricação de peças. A garagem agora gasta recursos apenas para abrir acesso a equipamento original do Screwvivors; uma compra não altera dano, integridade, velocidade ou outros atributos por si só. A peça de chefe funciona como chave de projeto de algumas armas, sem ser instalada ou conceder bônus durante a tentativa. Isto é uma implementação experimental do plano de integração, não balanceamento final.

| Projeto de equipamento | Preço experimental |
| --- | --- |
| Escopeta | 8 parafusos |
| Fuzil de rajada | 12 parafusos |
| Lança-chamas | 14 parafusos |
| Disco de retorno | 16 parafusos |
| Lançador criogênico | 18 parafusos |
| Canhão de precisão | 22 parafusos + peça do Brutamontes |
| Arpão pneumático | 24 parafusos + peça do Brutamontes |
| Lança-granadas | 20 parafusos + peça do Sucateiro |
| Lança-foguetes | 26 parafusos + peça do Sucateiro |
| Emissor laser | 22 parafusos + peça da Bobina-Rainha |
| Carabina Tesla | 24 parafusos + peça da Bobina-Rainha |
| BAST-0002 | 24 parafusos |

Cada assinatura consome exatamente uma peça ao ser desbloqueada. A primeira arma não-base pode ser comprada sem vencer um chefe. Saves de perfil v1 preservam parafusos, peças e acesso aos dois chassis e doze armas já testáveis; migram e gravam v2 imediatamente. Saves v2 registram inventário de desbloqueios e suportam compras atômicas: se o salvamento falhar, parafusos e peça são devolvidos e o item continua bloqueado.

## Inimigos e cronologia

| Tipo | Entrada | Comportamento confirmado |
| --- | --- | --- |
| Zumbi perseguidor | Base da horda | Segue o jogador; representa a maioria dos inimigos |
| Ex-policial | Após cinco minutos | Implementado: um por onda completa, mantém distância e atira; tem 80% da vida do perseguidor comum |
| Perseguidor grande | Após quinze minutos | Implementado: aparece em uma de cada três ondas completas, segue mais devagar, é maior e tem três vezes a vida comum |
| Chefes | Implementado: 60 s, 240 s e 420 s; o ciclo reinicia a cada 180 s com vida e velocidade crescentes | Brutamontes, Sucateiro e Bobina-Rainha têm ataques e lacaios próprios; cada derrota entrega a peça identificada e abre escolha temporária de risco/benefício |

**Lacaios experimentais de chefe no protótipo:** o Brutamontes traz dois perseguidores velozes Cães de Sucata; o Sucateiro traz dois Talha-Bots de tiro; a Bobina-Rainha traz três Faíscas Errantes de rajada em leque. Cada um exibe o papel em texto acima da cabeça (CORREDOR, ATIRADOR ou RAJADA), reforçado no alerta do chefe. O HUD do chefe mantém a contagem dos reforços restantes e informa que as ondas comuns estão pausadas. Lacaios dividem o teto da horda, deixam XP e sucata quando abatidos, e desaparecem sem recompensa ao derrotar o chefe. Inimigos comuns já presentes na arena permanecem. Quantidade, dano e velocidade aguardam balanceamento humano.

Ex-policiais usam tiro de 8 de dano a cada 2,8 s; perseguidores grandes têm raio de colisão de 23 px. Ambos mantêm a formação circular e respeitam o teto da horda; ondas incompletas permanecem comuns. A contagem das ondas grandes reinicia em cada tentativa. Taxas, dano, vida, velocidade, ataques e escalada ainda serão balanceados. “Dificuldade escalável” é uma intenção confirmada; o sistema de seleção ou progressão de dificuldade não foi definido.

Núcleos ciano concedem XP ao serem coletados; sucata dourada concede um parafuso. O HUD identifica cada item pelo nome, cor e recompensa. O núcleo ganhou halo e contorno mais fortes após playtest apontar baixa distinção visual; a alteração não muda magnetismo, distância de coleta nem XP concedido.

Na revisão em 648×720, o Tester Burro identificou a função do núcleo pela legenda e viu o drop após um abate, mas morreu aos 18 s antes de confirmar a coleta. O primeiro painel de munição mobile também ocultava a recarga; reorganizei sua grade e um novo teste visual confirmou contador, recarga completa e ausência de rolagem interna. A coleta real de um núcleo permanece sem confirmação manual.

## Cidade e postes

**Confirmado:** o cenário inicial é uma cidade destruída. Um poste de energia pode funcionar como ameaça ambiental: ao passar perto, o jogador faz com que inimigos se aproximem mais rapidamente. Quando destruído, o poste cai e mata alguns inimigos.

Raio de ativação, duração do efeito, direção da queda, dano ao jogador e condições de destruição ainda estão pendentes. Obstáculos adicionais e geração procedural não foram aprovados.

## Resultado, pontuação e ranking

- Vitória: não há vitória por tempo; sobreviver pelo maior tempo possível.
- Derrota: morte, com opções de reiniciar ou voltar à garagem.
- Ranking mundial pela Steam: confirmado.
- Fórmula de pontuação, desempates, separação de categorias e regras de envio: pendentes.

Separar rankings por dificuldade e versão de balanceamento foi recomendado, mas não aprovado. Eliminações, chefes e desempenho são candidatos a critérios, não uma fórmula definida. A integração Steam por si só não resolve adulteração de pontuações; a estratégia de integridade precisa ser projetada.

## Desafio de habilidade

O jogo deve permitir que um jogador habilidoso vença com o PROT-0001, arma padrão e sem escolher skills, fugindo e atirando bem. Esse desafio pode virar uma conquista. **Garantia de Fábrica** é um nome sugerido, ainda não aprovado.

## Conteúdo-alvo declarado

Considerando futuras atualizações, o criador propôs:

| Conteúdo | Quantidade |
| --- | --- |
| Fase | 1 |
| Chefes | 10 |
| Armas | 10 |
| Peças | 20 |
| Skills-base | 15 |
| Evoluções ou variantes por skill | 3 |

Este é um alvo de conteúdo, não uma promessa de lançamento. A divisão entre lançamento e atualizações ainda não está definida. Quinze skills com três derivações não significa automaticamente 45 skills independentes.

## Ajuste após teste do criador — 27/10/2026

**Aprovado:** reduzir velocidade e quantidade da horda; substituir a barra de integridade por pilhas/baterias individuais que ficam cinza e rachadas ao esvaziar. Desenho próprio de baterias, usando a referência de Hollow Knight apenas para o conceito de unidades visuais de vida.

**Parâmetros históricos desta revisão, substituídos em 31/10:** cinco baterias de 20 pontos, barra de vida segmentada, intervalo mínimo de 0,65 s e estatísticas fixas de zumbi. O protótipo atual voltou a exibir integridade proporcional, mantendo dano e cura como parâmetros experimentais.

## Ajustes visuais — 28/10/2026

Solicitado pelo criador: balas maiores, tema geral azul e robô compacto com estética japonesa e referência de formato R2-D2. Implementado desenho próprio em canvas com cúpula, corpo branco/azul, painéis, lente e pés laterais. Balas com raio visual e de colisão de 6 pixels, antes 3 pixels visuais e 4 de colisão; dano e cadência preservados. Atributos e regras de surgimento dos inimigos preservados nesta entrega. Tema azul aplicado à interface, arena, mira, baterias e efeitos; zumbis mantêm contraste verde.

## Tela de combate — 28/10/2026

**Decisão do criador:** combate e garagem são telas distintas. A arena deve ocupar 90% da tela e o HUD deve ficar sobreposto com brilho de 30%. Implementação atual: arena centralizada com 90vw × 90dvh (5% de margem por lado), sem cabeçalho, título e rodapé externos. HUD e botão de pausa sobre a arena; menus de pausa e melhorias acima do HUD. Interpretação de brilho: luz azul a 30% de opacidade, fundo do HUD também a 30%, preservando opacidade dos textos e baterias. A garagem ainda não foi implementada. Nenhum atributo de inimigo foi alterado nesta entrega.

## Câmera, mundo e upgrades — 28/10/2026

**Decisões do criador:** câmera acompanha o jogador; arena sem limites nas quatro direções; bônus de dano de +30% acumulam por soma. Implementado mundo em coordenadas livres, câmera centralizada e mira convertida para o mundo. Novos inimigos surgem fora da vista atual e os muito distantes são removidos para liberar o limite da horda. A arena continua ocupando 90% da janela; o HUD permanece fixo na tela.

Dano base experimental de 22: um bônus causa 28,6; dois causam 35,2 (+60%). Cada projétil conserva o dano no momento do disparo. **Escala atual (31/10):** vida comum cresce por `30 × (1 + relógio/300)`; velocidade parte de 24–42 px/s e recebe até 24 px/s adicionais. A horda começa após 2 s, vem em ondas de quatro, reduz o intervalo-base de 1,6 s até 0,38 s por zumbi, e aumenta o teto de 70 em dez a cada 120 s, até 150. Enquanto um chefe está previsto ou ativo, o contador da horda congela e não surge uma onda comum. O calendário de chefes continua após o terceiro: o ciclo retorna a cada 180 s, com vida do chefe +70% e velocidade +8% por ciclo. Estes parâmetros são experimentais, não balanceamento final.

Resposta visual: números de dano flutuantes, clarão no inimigo atingido, brilho azul ao selecionar uma melhoria e indicação do bônus total ao aumentar dano. Testes de lógica verificam câmera/mira após deslocamento, movimento sem bordas, dano aditivo, vida e velocidade fixas, morte com um tiro após dois bônus e regressões do combate. Avaliação visual e de satisfação permanece dependente de teste no navegador.

## Humanoide animado e câmera suave — 28/10/2026

Solicitado pelo criador após teste: evitar o robô rigidamente centralizado, animar caminhada e adotar silhueta humanoide pesada com referências em Gigantes de Aço/Círculo de Fogo. Substitui a direção visual de droide com cúpula desta versão. Desenho próprio em canvas com torso, ombreiras, braços, joelhos, pés, visor e núcleo azul. Movimento usa passada alternada de pernas/braços, oscilação discreta do torso e transição suave ao parar; sem tremor de câmera.

Câmera com zona livre central (até 75 px na horizontal e 50 px na vertical, proporcional em janelas pequenas), seguida de aproximação exponencial dependente do tempo. O jogador pode se deslocar dentro da tela sem ficar preso ao centro; reinício e redimensionamento reposicionam a câmera imediatamente. Mundo sem bordas, HUD fixo e atributos de combate preservados. Testes verificam zona livre, acompanhamento gradual em direções opostas e início/fim da animação; avaliação visual no navegador segue necessária.

## Recorte jogável: garagem, armas, sinergias e chefe — 29/10/2026

Autorizado pelo criador: implementar as etapas 1 a 4 propostas (garagem, armas distintas, skills com sinergias e primeiro chefe). Detalhes abaixo são hipóteses experimentais reversíveis para testar esse recorte, não catálogo final, progressão permanente ou definição das três derivações de cada skill.

### Garagem

Tela separada do combate. PROT-0001 é o único chassi disponível neste teste, com um slot. Escolher metralhadora ou escopeta antes de sair; equipamento é copiado e fixado na tentativa. Pausa, derrota e vitória permitem voltar à garagem. Repetir configuração inicia tentativa limpa com o equipamento anterior. Não há gastos, inventário de peças ou desbloqueios fictícios.

### Armas experimentais

| Arma | Dano base por projétil | Projéteis | Intervalo base | Alcance aproximado |
| --- | --- | --- | --- | --- |
| Metralhadora | 22 | 1 | 0,32 s | 1.026 px |
| Escopeta | 12 | 5 | 0,80 s | 371 px |

Mira e disparo continuam manuais. Escopeta tem dispersão fixa de 0,34 radianos; cada chumbo causa seu próprio dano. Dois bônus de 30% dão +60% do dano base por projétil: 35,2 na metralhadora e 19,2 na escopeta. Colisão de projéteis usa o segmento percorrido para reduzir falhas em alvos atravessados entre frames.

### Melhorias e sinergias

Três ofertas aleatórias elegíveis por nível, com opção de pular. Skills especiais são adquiridas uma vez na tentativa; dano, cadência, velocidade e coleta podem repetir. Reparo é oferecido quando há vida faltando. Nada persiste entre tentativas.

- Alto impacto: +30% do dano base por aquisição, aditivo.
- Overdrive: +20% da cadência base por aquisição; intervalo = intervalo base / (1 + 0,2 × aquisições).
- Perfuração: cada projétil pode atingir três inimigos distintos.
- Carga explosiva: impacto gera explosão de raio 64 px; outros alvos recebem 45% do dano do projétil.
- Descarga: impacto atinge outro inimigo em até 135 px por 35% do dano.
- Perfuração + explosão: impactos sucessivos causam explosões ao longo da trajetória.
- Perfuração + descarga: até três alvos secundários por descarga.
- Explosão + descarga: sobreviventes de explosões também geram descargas. Não há recursão infinita de efeitos.
- Autorreparo: recupera 35 de integridade.
- Pernas hidráulicas: velocidade ×1,15, preservando a melhoria existente.
- Campo magnético: coleta ×1,4.

HUD informa arma, dano, bônus e sinergias. Impactos têm números e efeitos distintos. Ofertas antigas são invalidadas para evitar aplicar escolhas duplicadas.

### Primeiro chefe experimental: Brutamontes

O primeiro ciclo começa aos 60 s com 650 de vida, perseguição lenta (28 px/s), contato/investida causam 20. Alterna investida direcional e rajada circular de 12 projéteis, ambos com aviso de 0,95 s. Investida percorre até 234 px em 0,65 s. Projéteis inimigos causam 12, viajam a 145 px/s e duram 4 s. A direção da investida é fixada no aviso, permitindo sair da faixa laranja; a rajada sinaliza sua origem e direções. Depois dos três chefes iniciais, o ciclo reinicia a cada três minutos, com vida crescente.

Ao morrer: remove seus projéteis ativos, recupera 20 de integridade do jogador e oferece uma melhoria de campo. Recompensa é temporária; não são peças permanentes. Se o jogador morrer no mesmo passo, derrota prevalece. Desenho do chefe é provisório.

### Preservado e pendente

Câmera suave com zona livre e mundo sem bordas. A tela de combate usa HUD azul em tela cheia. Zumbis comuns aumentam de vida e velocidade com o tempo, e o limite de inimigos sobe gradualmente. Os chefes retornam em ciclos, com vida crescente. Estudos do Designer não foram integrados; robô procedural permanece.

Faltam balanceamento com o criador, teste visual no navegador, integração de sprites finais, garagem com múltiplos chassis/peças, retenção, derivações definitivas de skills, cenário final e versão Steam. Simulação de lógica não comprova diversão ou balanceamento.

## Expansão experimental de catálogo — 29/10/2026

Autorizado pelo criador: dez armas e dez melhorias adicionais, segundo robô e desenho/sprite diferente, além de prompt de arte para inimigos. Naquele incremento, o catálogo de 12 armas e dois chassis ficou livre apenas para teste, sem custos/desbloqueios. Em 31/10/2026, a etapa 5 introduziu preços experimentais para perfis novos; saves antigos recebem migração que preserva aquele acesso livre. O catálogo continua sem definir a oferta comercial final.

### Dez armas acrescentadas

| ID | Arma | Dano / intervalo | Particularidade |
| --- | --- | --- | --- |
| burst | Fuzil de rajada | 14 / 0,65 s | Três tiros separados por 75 ms; soltar disparo cancela os pendentes |
| sniper | Canhão de precisão | 88 / 1,15 s | Velocidade 1.050 px/s; atravessa quatro alvos |
| laser | Emissor laser | 10 / 0,09 s | Pulsos velozes a 1.600 px/s; raio 4 px |
| flame | Lança-chamas | 5 × 3 / 0,12 s | Cone curto a 220 px/s; queimadura por 3 s |
| cryo | Lançador criogênico | 14 / 0,36 s | Reduz temporariamente movimento em 45% por 2 s |
| rocket | Lança-foguetes | 70 / 1,30 s | Explosão de raio 96 com dano integral nos outros alvos |
| grenade | Lança-granadas | 45 / 1 s | Explode em contato ou após 1,1 s; raio 90 |
| tesla | Carabina Tesla | 18 / 0,55 s | Descarga de 35% em dois alvos secundários |
| disc | Disco de retorno | 24 / 0,85 s | Atravessa e volta após metade da duração; um acerto por alvo em cada trecho |
| harpoon | Arpão pneumático | 60 / 1,05 s | Atravessa dois alvos; empurra 65 px (25% em chefes) |

Todas continuam manuais e escolhidas antes da partida. Dano exibido é por projétil; crítico dobra o dano daquele projétil, sem alterar o bônus aditivo de +30%. Módulos interagem com características próprias da arma. Explosões não geram recursão infinita; limites técnicos de projéteis/efeitos preservados.

### Dez melhorias acrescentadas

| ID | Nome | Efeito |
| --- | --- | --- |
| crit | Mira crítica | +20 pontos percentuais de chance de dano duplo; máximo 60% |
| burn | Munição incendiária | Queima 20% do dano do impacto por segundo durante 3 s; não empilha dano no mesmo alvo |
| freeze | Núcleo criogênico | Multiplica movimento inimigo por 0,55 durante 2 s; preserva velocidade base |
| knock | Impacto cinético | Empurra 30 px; efeito a 25% no chefe |
| salvage | Reciclagem de campo | Cura 2 ao eliminar zumbi, limitada à vida máxima do chassi |
| armor | Blindagem reforçada | Reduz 2 de dano por aquisição; máximo +6; dano recebido mínimo 1 |
| regen | Nanorreparo | Cura 1 a cada 3 s de simulação ativa |
| range | Propulsão balística | +25% da duração base dos projéteis por aquisição; máximo +75% |
| extra | Câmara dupla | +1 projétil por disparo com abertura lateral; máximo +2 |
| shield | Escudo capacitivo | Absorve um impacto; recarga de 12 s de combate |

Sinergia adicional: queimadura + resfriamento aumenta dano periódico em 50% enquanto ambos estão ativos. Perfuração e empurrão também podem coexistir. Status são temporários e nunca aumentam vida/velocidade base dos inimigos com o relógio. Todas as melhorias são zeradas ao reiniciar; não são peças persistentes.

### Segundo robô e arte provisória

BAST-0002: 120 de integridade (seis baterias), velocidade 155, redução inata de 1 de dano e um slot. PROT-0001 preserva 100 de integridade e velocidade 190. Ambos selecionáveis somente na garagem; seleção fica copiada/fixa na tentativa. A interface de baterias, reparo e recompensa respeita o máximo do chassi.

BAST tem atlas SVG original de quatro quadros em células 64 × 80, além de prévia própria. É arte técnica provisória em pixels/vetores, não spritesheet final do Designer. Nenhuma prancha rejeitada foi integrada. A arte definitiva mantém o processo de aprovação separado. O módulo de animações finais continua preservado.

Por pedido do criador em 31/10/2026, o chassi inicial PROT-0001 ganhou uma versão visual mais simples: corpo compacto, poucas placas, visor e bateria ciano, em sprite estático transparente de 64 × 80. O criador escolheu essa versão, que substitui para o chassi inicial a composição pesada descrita na direção de arte anterior; a paleta aprovada permanece referência. A versão foi ligada ao combate, à garagem e ao retrato da HUD. O desenho anterior permanece arquivado; atributos e colisões não mudaram.

O [prompt para o zumbi comum](arte/prompt-inimigo-zumbi.md) especifica arte original, mesma perspectiva e paleta distinta. Foram criadas e integradas três aparências estáticas 48 × 64 — ex-mecânico, catador e segurança pesado — em [assets/enemies](../assets/enemies); a horda escolhe a aparência sem alterar atributos, colisões ou surgimento. A aparência de segurança também é usada pelo Brutamontes; escala e HUD próprio distinguem o chefe. Confirmar essa leitura durante o playtest visual. A folha original e o manifesto permanecem junto dos sprites. As poses ainda não têm ciclos de caminhada e seguem como arte provisória, pendente de revisão visual em jogo.

## Dez melhorias adicionais — 29/10/2026

Pedido do criador: mais melhorias. Implementadas dez novas skills de partida, totalizando 28. Valores abaixo são parâmetros experimentais reversíveis; não são derivações finais nem progressão permanente.

| ID | Nome | Efeito |
| --- | --- | --- |
| xp | Processador de experiência | +25% de XP por núcleo por aquisição; máximo +75%; XP fracionária acumulada |
| grace | Isolamento de impacto | +0,20 s à proteção após sofrer dano por aquisição; máximo +0,60 s |
| bossHunter | Caça-titãs | +25% de dano contra chefes por aquisição; máximo +75% |
| finisher | Finalizador | +50% de dano se o alvo está com até 30% da vida máxima antes do acerto |
| ricochet | Munição ricochete | Depois de esgotar perfuração, projétil busca novo alvo em até 220 px; máximo 2 saltos |
| blastRadius | Onda expandida | +25% do raio base de explosões por aquisição; máximo +50%; exige arma/módulo explosivo |
| conductivity | Condutividade | +40 px de alcance elétrico por aquisição; máximo +80; exige descarga/Tesla |
| stun | Curto-circuito | Descargas param o movimento por 0,35 s; chefes 0,0875 s; não cancela ataques nem dano de contato |
| emergency | Reserva de emergência | Cura 20 após golpe não letal deixar vida até 30%; uma vez por tentativa; não ressuscita |
| dash | Propulsor auxiliar | ESPAÇO: avanço por 0,15 s a 3× a velocidade atual; recarga 4 s de simulação; sem invulnerabilidade |

Ricochete preserva dano e tempo de vida do projétil, não repete um alvo já atingido naquele trecho e só busca outro alvo após gastar sua perfuração. Não é ofertado para disco de retorno, que já possui sua própria trajetória. Ricochete + explosão cria impactos explosivos sucessivos; Curto-circuito + descarga interrompe temporariamente movimento. Dano contra chefes e Finalizador são modificadores condicionais aplicados uma vez por evento de dano, sem alterar a regra aditiva de Alto impacto.

O propulsor usa a direção das teclas pressionadas; sem movimento, usa a mira e, sem mira, a direita. Não existe antes da skill. Pausa interrompe a simulação e congela recargas/efeitos. Reinício limpa skills, reserva, recarga e duração do propulsor. Não é corrida permanente nem altera a câmera.

Atributos base de inimigos, sprites, armas, duração da sessão e cronograma do chefe foram preservados. Testes cobrem efeitos, dependências das ofertas, dano, ricochete, recargas, ausência de invulnerabilidade, cura não letal e reset. Conferência visual e balanceamento no navegador permanecem pendentes.

## Diagnóstico da tentativa — integração 20MTD

Ao pausar, o jogador pode consultar atributos atuais, módulos temporários instalados e sinergias ativas. O painel mostra dano direto por projétil e intervalo entre disparos separadamente, sem prometer DPS total ou incorporar efeitos condicionais. A consulta usa o congelamento normal do jogo e não concede bônus. Uma tentativa nova exibe apenas seus próprios módulos; builds extensas rolam dentro do painel para manter os botões de navegação acessíveis.

## Manual de campo — integração 20MTD

Na garagem, uma seção expansível reúne as nove árvores de módulos temporários e os pools de Gambiarras e Experimentos. Os 48 registros mostram vantagens, custos e requisitos do catálogo canônico. A consulta é somente leitura e pode ser feita antes da primeira tentativa; ver um item não o instala nem garante sua oferta. Cada árvore apresenta raiz e três evoluções combináveis. A restrição de Ricochete para armas com retorno é explicitada.

## Renovação de oferta — integração 20MTD

Regra experimental: uma carga por tentativa renova as opções de um level-up comum por botão ou Q. Todas as cartas descartadas ficam fora do novo sorteio; a operação só é permitida se houver alternativas elegíveis suficientes. Ela não concede skill nem avança tempo, XP ou nível. Chefes, Gambiarras e Experimentos não usam esse recurso. O botão informa carga esgotada ou ausência de opções; retry restaura a carga. A frequência única aguarda avaliação de balanceamento.

## Especialização de chassi — nível confirmado

O criador escolheu o nível 10 para ofertar uma entre três especializações temporárias próprias do chassi. A escolha deve acompanhar o robô fixado na garagem e desaparecer no retry. A evolução de armas segue com nível e efeitos independentes ainda pendentes.

Implementação no desenvolvimento — 01/11/2026: as seis especializações do catálogo estão funcionais, com escolha de uma no nível 10 ou recusa definitiva nessa tentativa. Aterramento multiplica dano de perigo por 0,7 antes da armadura (mínimo 1). A Marca beneficia acertos seguintes pela rota de dano do jogador, inclusive efeitos, até expirar ou trocar alvo. Nove Vidas afeta comuns inclusive ex-policiais; Isca afeta somente perseguidores comuns. Manual agora contém 54 registros em 13 grupos. Diagnóstico da pausa informa escolha e recarga. Valores continuam experimentais; revisão visual da oferta PROT passou na fixture compacta, mas balanceamento em partida longa está pendente.

## Regras de playtest atualizadas — BUILD35

Ondas comuns de15, intervalo decrescente6,4→1,5s, sem parada por população ou chefe. Vivos distantes permanecem; minimapa mostra todos na borda se fora de alcance, chefe dourado destacado. O Sucateiro busca distância180–240px mesmo ao anunciar ataques; aproxima-se lentamente e recua quando pressionado. Ex-policiais/atiradores/condutores carregam armas visíveis. Estas regras substituem quatro por onda e limites/suspensão anteriores, por novo pedido direto do criador.
