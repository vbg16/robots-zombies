# Registro de decisões

## Base técnica aprovada — 27/10/2026

O criador aprovou continuar o desenvolvimento do protótipo no navegador com HTML, CSS e JavaScript, aproveitando o código existente, sem migrar para Godot agora. O assistente ficará responsável pela maior parte da programação; o criador orientará as decisões e testará as versões. A prioridade é validar movimento, disparo manual e sinergias. Empacotamento para Windows/Linux e integração Steam serão avaliados posteriormente; nenhuma ferramenta de empacotamento ou biblioteca adicional foi escolhida. Esta decisão não altera as regras de design nem significa que as funcionalidades planejadas estejam implementadas.


## Confirmadas na definição inicial

| Tema | Decisão |
| --- | --- |
| Gênero | Horde / Bullet Heaven com combate e builds |
| Identidade | Gato inteligente, robôs protótipos, zumbis e humor de cientista maluco |
| Duração e vitória | Sobreviver por vinte minutos |
| Disparo | Manual |
| Movimento especial | Depende do robô ou de skills |
| Sinergias | Combinações muito fortes são parte da proposta |
| Progressão | Garagem, chassis, armas e peças; skills acumulam durante a partida |
| Visual | Pixel art 2D; câmera semelhante a 20 Minutes Till Dawn |
| Cenário inicial | Cidade destruída |
| Plataformas | Windows e Linux, com objetivo de lançamento na Steam |
| Modalidade | Um jogador |
| Violência | Pouco sangue, com algum conteúdo violento |
| Conteúdo-alvo | Uma fase, dez chefes, dez armas, vinte peças e quinze skills com três derivações |

## Atualização aprovada — 31/10/2026

| Tema | Regra atual | Interpretação superada |
| --- | --- | --- |
| Arena | Mundo sem bordas, exploração contínua e sobrevivência sem tempo final | Vitória automática ao sobreviver vinte minutos |
| Dificuldade | Horda cresce com o tempo e chefes retornam em ciclos | Apenas três chefes e vida fixa para inimigos comuns |
| Arte e HUD | Pixel art de era 32-bit; HUD segue a colagem azulada enviada pelo criador | Composição experimental atual |
| PROT-0001 inicial | Silhueta simples e compacta aprovada em 31/10; manter a paleta aprovada | Composição humanoide pesada com ombreiras largas como alvo do chassi inicial |

## Esclarecimentos posteriores — prevalecem sobre ambiguidades anteriores

| Tema | Regra atual | Interpretação que não deve ser aplicada |
| --- | --- | --- |
| Skills entre partidas | Desaparecem ao morrer | Acúmulo permanente de skills entre tentativas |
| Gato e pilotagem | Pode pilotar diretamente; representação principalmente estética | Exigir um sistema separado de controle remoto |
| Armas | Todas são escolhidas antes da partida; não podem ser trocadas durante ela | Adquirir ou trocar armas como ofertas de nível |
| Slots | Dependem do chassi e representam progressão; até três no conceito | Dar uma terceira arma automaticamente no último nível da partida |
| Evolução de arma | Pode ocorrer depois de um nível X, ainda indefinido | Confundir evolução com fusão de armas |
| Ranking | Mundial | Limitar o produto planejado a recordes locais |
| Chinês | Simplificado, com menor prioridade agora | Tratar localização chinesa como bloqueio para o protótipo |
| Retenção de materiais | Parafusos coletados e peças de chefe conquistadas ficam após a morte; habilidades da tentativa continuam temporárias | Apagar materiais já coletados ao morrer |

## Clarificação aprovada — retenção de materiais, 31/10/2026

O criador confirmou que parafusos e peças de chefe coletados numa tentativa permanecem após a morte. O protótipo salva esses valores localmente no navegador e concede um parafuso por coleta de sucata e uma peça identificada por chefe derrotado. Esses valores de aquisição são experimentais. Drops de parafuso não coletados desaparecem ao reiniciar. Custos, instalação, compatibilidade e desbloqueios ainda não foram definidos; esta decisão não aprova árvore de atributos permanentes, loja ou fabricação.

## Nome e recomendações

- **Screwvivors:** nome de trabalho escolhido a partir do interesse demonstrado pelo criador; disponibilidade não verificada.
- **Godot 4:** recomendação anterior; não adotada para a etapa atual.
- **Manter chassis antigos relevantes:** recomendação de balanceamento, não regra de atributos definida.
- **Ranking por dificuldade e versão:** recomendação, sem aprovação ou implementação.
- **Garantia de Fábrica:** nome sugerido para a possível conquista do PROT-0001 sem skills.
- **Documentação no repositório:** solicitada pelo criador para organizar a direção do projeto.

## Perguntas em aberto

### Necessárias para detalhar o primeiro protótipo de produção

1. Base atual definida: HTML/CSS/JavaScript no navegador. Empacotamento para computador será avaliado depois.
2. Como funcionam movimento, mira, disparo e controles simultâneos de várias armas?
3. Quais são os atributos e a habilidade do PROT-0001? Qual é sua arma padrão?
4. As três derivações de uma skill são níveis, alternativas exclusivas ou ramos combináveis?
5. Qual é o nível X e o efeito da evolução de cada arma?
6. Custos, instalação, compatibilidade e destino de peças não instaladas? A retenção após a morte foi respondida em 31/10: parafusos coletados e peças de chefe permanecem.
7. As peças dos chefes são aplicadas na partida ou apenas na garagem?
8. Como os slots, as compatibilidades e os custos de montagem funcionam?

## Implementação experimental delegada — garagem, 31/10/2026

No escopo da integração de progressão entre tentativas, foram implementados preços provisórios para desbloquear equipamento, sem afirmar que sejam balanceamento final ou aprovação comercial do criador. Ver a tabela completa em [game-design.md](game-design.md).

- Perfis novos começam com PROT-0001 e Metralhadora; BAST-0002 custa 24 parafusos.
- Armas comuns custam entre 8 e 18 parafusos. Armas assinatura custam de 20 a 26 e também consomem uma peça do chefe associado: Brutamontes (Canhão de precisão, Arpão), Sucateiro (Granadas, Foguetes) ou Bobina-Rainha (Laser, Tesla).
- O primeiro desbloqueio de arma não exige peça de chefe; assim, há progressão inicial antes da primeira vitória de chefe.
- Todas as armas cabem no slot atual dos dois chassis. Peças são chaves consumíveis para projetos, ainda não instaladas em chassis.
- Compras só desbloqueiam conteúdo; nenhum atributo é concedido permanentemente. Loadout continua fixo depois que a tentativa começa.
- Saves do perfil v1 preservam parafusos/peças e recebem todo o catálogo anterior já desbloqueado. O formato v2 guarda inventário de chassis e armas; falha de salvamento reembolsa o custo.

Custos, ordem e economia são experimentais e devem ser revistos após playtest. Instalação física de peças, chassis com mais slots e evoluções de arma seguem pendentes.

### Necessárias antes de comprometer o lançamento

9. Como calcular pontuação, desempates, categorias e submissão ao ranking?
10. Qual será a estratégia contra pontuações adulteradas e como tratar atualizações de balanceamento?
11. Como funcionam seleção de dificuldade, escalada e cronograma de chefes?
12. Quais serão os requisitos mínimos e os limites de desempenho para builds extremas?
13. Qual é o conteúdo de lançamento e qual parte fica para atualizações?
14. Qual orçamento, disponibilidade de trabalho e prazo são viáveis?
15. O lançamento será completo ou em Acesso Antecipado? Qual será o preço?
16. Haverá demo, participação no Steam Next Fest e qual será a estratégia de divulgação?
17. Quais conquistas, recursos de salvamento, Steam Cloud, remapeamento e opções de acessibilidade serão incluídos?
18. Qual será a identidade visual final e o nome está disponível para uso comercial?

Nenhuma dessas perguntas deve bloquear tarefas independentes. Quando uma implementação precisar de uma resposta ainda ausente, registrar a decisão ou uma hipótese explícita e reversível antes de tratá-la como regra definitiva.

## Ajuste após teste do criador — 27/10/2026

**Aprovado:** reduzir velocidade e quantidade da horda; substituir a barra de integridade por pilhas/baterias individuais que ficam cinza e rachadas ao esvaziar. Desenho próprio de baterias, usando a referência de Hollow Knight apenas para o conceito de unidades visuais de vida.

**Parâmetros experimentais desta versão:** cinco baterias de 20 pontos representam os 100 pontos existentes, com carga parcial; dano de 12 e cura de 35 preservados. Primeiro inimigo após 2 segundos; intervalo de surgimento começa em 1,6 s e desce até 0,65 s; limite de 70 inimigos; velocidade inicial de 24–42 pixels/s e crescimento de 0,1 pixel/s por segundo de partida. Esses números são ajuste de teste, não atributos finais dos chassis. A cura restaura a carga e remove rachaduras das baterias recuperadas.

## Estabilização antes de expandir — 29/10/2026

Plano de quatro semanas apresentado e aprovado pelo criador: Semana 1, sessões e usabilidade, selecionar seis armas e avaliar cinco skills fortes/cinco fracas; Semana 2, telemetria local, ajustes e feedback/áudio quando possível, referência jogável; Semana 3, módulos, package.json, GitHub Actions, licença/versão e fluxo de navegador; Semana 4, novos testes com jogadores e decisão de expansão. [Detalhes](plano-estabilizacao-4-semanas.md).

A seleção de armas e o ranking de skills dependem de teste real e não estão definidos. Nenhuma licença foi escolhida. Datas, disponibilidade e participantes ainda não definidos. Este registro não cria automação nem significa que as quatro semanas estejam executadas. Prioridade passa de aumentar catálogo para estabilizar o que existe.


## Árvores, multiplicadores e munição — 30/10/2026

O criador solicitou que cada melhoria inicial abra três evoluções semelhantes, que escolhas adquiridas saiam do sorteio e que maiores vantagens exijam maiores custos. Pediu efeitos condicionais, reações a dano com dois minutos de recarga e carregadores/recarga por arma, com maior tempo para armamentos pesados. A implementação experimental contém nove raízes e três evoluções combináveis por raiz, totalizando 36 nós únicos. A preferência por multiplicadores substitui a regra anterior de bônus percentuais aditivos. Os números de balanceamento foram propostos pelo desenvolvimento e ainda não foram aprovados em teste humano. Detalhes em [Árvores e munição](arvores-e-municao.md).

## Reação de empurrão ao dano — 31/10/2026

**Aprovado pelo criador:** ao receber dano, o jogador deve ser deslocado na direção oposta ao golpe para transmitir sensação de empurrão. Parâmetro experimental: 48 px para longe da origem do ataque. Golpes absorvidos integralmente pelo escudo não deslocam o jogador. O valor pode ser ajustado após teste de jogabilidade.

## Especialização de chassi — decisão do criador

Escolher uma entre três especializações temporárias próprias do robô ao atingir o nível 10. Decisão recebida diretamente do criador nesta integração. Não define o nível de evolução de armas, não adiciona slots e não permite trocar equipamento em combate. Efeitos das especializações ainda serão implementados e validados.

## Ajustes pedidos após playtest — 01/11/2026

O criador pediu esconder controles após5s, mostrar ESPAÇO junto da arma após adquirir Propulsor, zumbis fora da tela correndo e desacelerando ao se aproximar, além de música e efeitos. Implementação BUILD34: tutorial usa5s do relógio de jogo; ondas mantêm círculo com raio até o canto mais distante da câmera+96px. Apenas os comuns das ondas usam aproximação suave entre260px/s distante e velocidade normal dentro180px. Chefes/lacaios mantêm suas entradas próprias. Trilha procedural original96BPM e efeitos WebAudio, volumes separados na garagem (zero=mudo), iniciados após gesto. Sem assets sonoros de terceiros.

## Ondas contínuas e rastreamento — pedido do criador, BUILD35

Ondas completas agora têm15 zumbis comuns, círculo fora da tela preservado. Intervalo por onda começa6,4s e cai com tempo até1,5s. O criador relatou que fugir parava os nascimentos e pediu não perder inimigos: removidos teto de população viva, descarte por distância e suspensão das ondas durante chefes. Isto substitui as regras anteriores de cap e de chefe sem horda comum. Pausa e ofertas ainda congelam simulação. Inimigos mortos continuam removidos; vivos distantes continuam sendo simulados e indicados na borda do minimapa, incluindo chefe dourado. O Sucateiro se move em todas fases buscando180–240px de distância; recuo lento quando perto. Atiradores ganham armas visíveis. A população viva pode crescer conforme a duração; custo de CPU e minimapa deve ser monitorado, sem descarte silencioso dos inimigos.

Ajuste adicional pedido pelo criador na BUILD35: velocidade máxima de aproximação reduzida260→210px/s; velocidade normal passa a ser atingida a320px (antes180px), com transição suave até720px. Isto reduz o impulso de chegada e antecipa a desaceleração.

## Policiais após segundo chefe — alteração em desenvolvimento

Novo pedido: remover aceleração de aproximação de todos os inimigos comuns; policial é a exceção com corrida própria após perder arma. Policiais só entram nas ondas após derrotar o segundo chefe (Sucateiro), representando5 dos15 inimigos. Reset restaura bloqueio. Peso de perseguidores grandes ocupa vaga não policial. O significado do segundo tiro (disparado ou recebido) e parâmetros de investida estão em confirmação com o criador; essa parte não deve ser publicada até resposta e validação.

## Correção do conceito de policial — BUILD36

O criador esclareceu que há dois tipos: atirador e portador de escudo. A transição não depende de segundo tiro; depende de destruir100 pontos do escudo. Apenas esse portador passa à investida. Atirador permanece armado/à distância. Após derrotar o Sucateiro, cinco das15 posições são policiais; a distribuição experimental alterna3/2 por onda. Portador intacto persegue em velocidade normal e não atira. Ao quebrar, pausa0,7s com rota marcada, corre até240px a340px/s na direção fixa, e repete. Parâmetros de tempo/distância/velocidade são provisórios. Escudo absorve integralmente o golpe de quebra, sem transferir excesso ao corpo; golpes seguintes atingem vida. Status continuam atuando; sem aceleração comum. A antiga regra do segundo tiro está descartada.

## Trilha e transições — BUILD37

Criador rejeitou a primeira música e escolheu synthwave suave e atmosférico. Nova composição procedural original: acordes suaves de7/9, baixo arredondado, melodia espaçada com eco. Arranjos menu72BPM/garagem78BPM/combate90BPM. Trocas usam fadeout0,3s, liberam notas anteriores e fadein; efeitos curtos de navegação/pausa/retorno. Botão Ativar áudio permite ouvir o menu após gesto. Troca visual discreta0,35s respeita redução de movimento. Aba oculta solicita silêncio imediatamente. Volume0 continua mudo; sem RNG do combate nem dependência de rede.
