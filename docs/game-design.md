# Design do jogo

> **Atualização do protótipo — 30/10/2026:** [árvores e munição](arvores-e-municao.md) substituem o catálogo isolado de 28 skills e os bônus percentuais anteriores. São 36 escolhas únicas, com pré-requisitos, multiplicadores, custos, condições e recargas. Parâmetros históricos abaixo que conflitarem com esse documento estão superados. Valores novos são experimentais e aguardam teste humano.

## Base técnica aprovada — 27/10/2026

O criador aprovou continuar o desenvolvimento do protótipo no navegador com HTML, CSS e JavaScript, aproveitando o código existente, sem migrar para Godot agora. O assistente ficará responsável pela maior parte da programação; o criador orientará as decisões e testará as versões. A prioridade é validar movimento, disparo manual e sinergias. Empacotamento para Windows/Linux e integração Steam serão avaliados posteriormente; nenhuma ferramenta de empacotamento ou biblioteca adicional foi escolhida. Esta decisão não altera as regras de design nem significa que as funcionalidades planejadas estejam implementadas.


## Ciclo principal confirmado

1. Entrar na garagem.
2. Escolher um chassi de robô, instalar peças e equipar as armas permitidas.
3. Iniciar a partida na cidade destruída.
4. Mover-se, mirar e atirar manualmente; enfrentar inimigos e coletar recursos.
5. Subir de nível e escolher entre melhorias disponíveis, adaptando a build ao sorteio.
6. Enfrentar chefes, com possibilidade de obter peças.
7. Vencer sobrevivendo por vinte minutos, ou morrer e escolher reiniciar ou voltar ao menu.
8. Usar a progressão permanente para preparar outras configurações.

O destino das recompensas em caso de morte e a submissão de resultados ao ranking ainda exigem regras específicas.

## Garagem e robôs

**Confirmado:** haverá vários robôs jogáveis. Eles podem se diferenciar por atributos, armas, habilidades e estilos de movimento, usando uma ou mais dessas diferenças. A garagem permite combinar o tipo de robô com peças e skills da partida.

“Manequim” foi o termo usado inicialmente para as bases desbloqueáveis. Nestes documentos, usamos **chassi** para essas bases, sem definir ainda seu nome na interface.

- Parafusos permitem instalar peças e desbloquear chassis.
- Cada chassi oferece possibilidades próprias de peças.
- Mais armas desbloqueadas e chassis com mais slots são sinais de progressão.
- O PROT-0001 é o robô de referência inicial, associado à arma padrão.

Custos, limites de peças, compatibilidades, atributos e ordem de desbloqueio estão pendentes.

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

**Confirmado:** andar e disparar manualmente são as ações básicas. Esquiva, corrida e habilidades ativas só existem se forem fornecidas pelo robô ou por uma skill adquirida na partida.

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
| Parafusos | Recurso para instalar peças e desbloquear chassis; nome pode mudar | Fontes, valores, custos e retenção após derrota |
| Peças de chefes | Recompensas com chance de obtenção; peças conquistadas e usadas fazem parte da progressão permanente | Quando são concedidas, onde são instaladas e retenção das não utilizadas |
| Chassis e armas | Desbloqueios compõem a progressão permanente | Critérios e ordem de desbloqueio |
| Skills da partida | Desaparecem ao morrer; não são upgrades permanentes | Regras técnicas de encerramento também na vitória |
| Habilidade do jogador | Deve permitir vencer mesmo com equipamento básico | Curva de dificuldade e parâmetros |

Não há árvore de atributos permanentes, loja ou sistema de fabricação aprovado. Não implementar esses sistemas apenas por associação com a garagem.

## Inimigos e cronologia

| Tipo | Entrada | Comportamento confirmado |
| --- | --- | --- |
| Zumbi perseguidor | Base da horda | Segue o jogador; representa a maioria dos inimigos |
| Ex-policial | Após cinco minutos | Atira e aparece em menor quantidade |
| Perseguidor grande | Após quinze minutos | Segue o jogador, é maior e tem mais vida |
| Chefes | Cronograma pendente | Zumbis melhorados com mecânicas próprias e chance de soltar peças ao serem vencidos |

Taxas de surgimento, dano, vida, velocidade, ataques e escalada da horda ainda serão balanceados. “Dificuldade escalável” é uma intenção confirmada; o sistema de seleção ou progressão de dificuldade não foi definido.

## Cidade e postes

**Confirmado:** o cenário inicial é uma cidade destruída. Um poste de energia pode funcionar como ameaça ambiental: ao passar perto, o jogador faz com que inimigos se aproximem mais rapidamente. Quando destruído, o poste cai e mata alguns inimigos.

Raio de ativação, duração do efeito, direção da queda, dano ao jogador e condições de destruição ainda estão pendentes. Obstáculos adicionais e geração procedural não foram aprovados.

## Resultado, pontuação e ranking

- Vitória: sobreviver por vinte minutos.
- Derrota: morte, com opções de reiniciar ou voltar ao menu.
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

**Parâmetros experimentais desta versão:** cinco baterias de 20 pontos representam os 100 pontos existentes, com carga parcial; dano de 12 e cura de 35 preservados. Primeiro inimigo após 2 segundos; intervalo de surgimento começa em 1,6 s e desce até 0,65 s; limite de 70 inimigos; velocidade inicial de 24–42 pixels/s e crescimento de 0,1 pixel/s por segundo de partida. Esses números são ajuste de teste, não atributos finais dos chassis. A cura restaura a carga e remove rachaduras das baterias recuperadas.

## Ajustes visuais — 28/10/2026

Solicitado pelo criador: balas maiores, tema geral azul e robô compacto com estética japonesa e referência de formato R2-D2. Implementado desenho próprio em canvas com cúpula, corpo branco/azul, painéis, lente e pés laterais. Balas com raio visual e de colisão de 6 pixels, antes 3 pixels visuais e 4 de colisão; dano e cadência preservados. Atributos e regras de surgimento dos inimigos preservados nesta entrega. Tema azul aplicado à interface, arena, mira, baterias e efeitos; zumbis mantêm contraste verde.

## Tela de combate — 28/10/2026

**Decisão do criador:** combate e garagem são telas distintas. A arena deve ocupar 90% da tela e o HUD deve ficar sobreposto com brilho de 30%. Implementação atual: arena centralizada com 90vw × 90dvh (5% de margem por lado), sem cabeçalho, título e rodapé externos. HUD e botão de pausa sobre a arena; menus de pausa e melhorias acima do HUD. Interpretação de brilho: luz azul a 30% de opacidade, fundo do HUD também a 30%, preservando opacidade dos textos e baterias. A garagem ainda não foi implementada. Nenhum atributo de inimigo foi alterado nesta entrega.

## Câmera, mundo e upgrades — 28/10/2026

**Decisões do criador:** câmera acompanha o jogador; arena sem limites nas quatro direções; bônus de dano de +30% acumulam por soma; inimigos não ganham vida com o tempo. Implementado mundo em coordenadas livres, câmera centralizada e mira convertida para o mundo. Novos inimigos surgem fora da vista atual e os muito distantes são removidos para liberar o limite da horda. A arena continua ocupando 90% da janela; o HUD permanece fixo na tela.

Dano base experimental de 22: um bônus causa 28,6; dois causam 35,2 (+60%). Cada projétil conserva o dano no momento do disparo. Zumbis têm 30 de vida em qualquer momento, e a velocidade mantém a faixa de 24–42 sem crescimento temporal, substituindo os aumentos anteriores. Quantidade e frequência da horda conservam o ajuste existente. Dois bônus permitem eliminar o zumbi básico com um tiro.

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

Surge uma vez aos 60 s do teste de três minutos. 650 de vida fixa, perseguição lenta (28 px/s), contato/investida causam 20. Alterna investida direcional e rajada circular de 12 projéteis, ambos com aviso de 0,95 s. Investida percorre até 234 px em 0,65 s. Projéteis inimigos causam 12, viajam a 145 px/s e duram 4 s. A direção da investida é fixada no aviso, permitindo sair da faixa laranja; a rajada sinaliza sua origem e direções.

Ao morrer: remove seus projéteis ativos, recupera 20 de integridade do jogador e oferece uma melhoria de campo, uma única vez. Recompensa é temporária; não são peças permanentes. Se o jogador morrer no mesmo passo, derrota prevalece. Vitória continua sendo sobreviver até 180 s neste recorte, sem exigir morte do chefe; alvo final segue vinte minutos. Desenho do chefe é provisório.

### Preservado e pendente

Câmera suave com zona livre, mundo sem bordas, arena de 90%, HUD azul e baterias preservados. Zumbis continuam com 30 de vida e velocidade 24–42, sem aumento temporal. Cronograma e frequência da horda mantidos. Estudos do Designer não foram integrados; robô procedural permanece.

Faltam balanceamento com o criador, teste visual no navegador, integração de sprites finais, garagem com múltiplos chassis/peças, retenção, derivações definitivas de skills, cenário final e versão Steam. Simulação de lógica não comprova diversão ou balanceamento.

## Expansão experimental de catálogo — 29/10/2026

Autorizado pelo criador: dez armas e dez melhorias adicionais, segundo robô e desenho/sprite diferente, além de prompt de arte para inimigos. Catálogo agora contém 12 armas, 18 melhorias e dois chassis, todos disponíveis apenas para teste, sem custos/desbloqueios fictícios. Estes números ampliam o protótipo e não redefinem automaticamente o catálogo comercial.

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

O [prompt para o zumbi comum](arte/prompt-inimigo-zumbi.md) especifica arte original, mesma perspectiva, paleta de inimigo distinta, frames individuais e manifesto. Arte de inimigos ainda não foi produzida por este pedido; círculos provisórios permanecem até entrega e validação.

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
