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
6. Quais recursos e peças são mantidos na derrota e na vitória? O que ocorre com peças não instaladas?
7. As peças dos chefes são aplicadas na partida ou apenas na garagem?
8. Como os slots, as compatibilidades e os custos de montagem funcionam?

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
