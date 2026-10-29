# Plano de desenvolvimento

## Prioridade vigente — estabilização em quatro semanas

O criador aprovou o [plano de estabilização](plano-estabilizacao-4-semanas.md) em 29/10/2026. Ordem atual: testes e seleção → telemetria/balanceamento/feedback → modularização e automação de checks → testes com jogadores e decisão sobre expansão. As etapas antigas abaixo ficam como referência de longo prazo; não autorizam expandir antes dessa avaliação. [Roteiro da Semana 1](teste-semana-1.md). Início e datas das semanas ainda não definidos; status inicial: planejado.

## Base técnica aprovada — 27/10/2026

O criador aprovou continuar o desenvolvimento do protótipo no navegador com HTML, CSS e JavaScript, aproveitando o código existente, sem migrar para Godot agora. O assistente ficará responsável pela maior parte da programação; o criador orientará as decisões e testará as versões. A prioridade é validar movimento, disparo manual e sinergias. Empacotamento para Windows/Linux e integração Steam serão avaliados posteriormente; nenhuma ferramenta de empacotamento ou biblioteca adicional foi escolhida. Esta decisão não altera as regras de design nem significa que as funcionalidades planejadas estejam implementadas.


## Estado atual verificado

O repositório começou vazio. Foi criado um protótipo experimental em HTML, CSS e JavaScript, sem dependências externas, executado com um servidor HTTP do Python.

O protótipo contém movimentação, mira pelo mouse, disparo manual, inimigos, coleta de energia, escolhas de melhorias, pausa, vitória e derrota. As verificações executadas cobriram sintaxe, lógica em ambiente simulado e respostas HTTP dos arquivos. O teste visual em navegador não foi concluído porque o download do navegador foi bloqueado pelo domínio de rede.

**Divergências conhecidas em relação ao design aprovado:** duração de três minutos em vez de vinte; garagem com dois chassis de um slot cada; ausência de montagem de peças, persistência, evolução de armas, conteúdo final e ranking Steam. Não é uma versão comercial nem comprova o balanceamento do jogo.

## Estratégia proposta

Validar o combate e as sinergias antes de produzir todo o conteúdo. Não há prazo ou orçamento aprovados. As etapas abaixo são uma proposta de sequência, não compromissos de entrega.

### Etapa 0 — Base de produção

- Continuar em HTML/CSS/JavaScript no navegador conforme aprovação de 27/10/2026.
- Definir resolução base e escala da pixel art.
- Definir controles de movimento, mira e disparo manual.
- Estabelecer estrutura de dados para chassis, armas, peças e skills.
- Definir o que persiste e quando as recompensas são concedidas.

**Critério proposto:** executar o projeto em ambiente de desenvolvimento e gerar builds experimentais para Windows e Linux.

### Etapa 1 — Combate mínimo

- PROT-0001 com arma padrão e disparo manual.
- Um cenário de cidade e zumbis perseguidores.
- Dano, morte, reinício e interface básica.
- Sessão curta de teste, sem substituir a meta final de vinte minutos.

**Critério proposto:** mover, mirar, atirar, receber dano e reiniciar de maneira consistente; avaliar a sensação de combate em uma partida real.

### Etapa 2 — Experimento de builds

Recorte recomendado: dois chassis, duas armas, quatro peças, cinco skills com suas derivações e um chefe. Esses números não são conteúdo já aprovado ou implementado.

- Garagem com escolha de equipamento antes da partida.
- Equipamento fixo durante o combate.
- Escolhas aleatórias de skills e sinergias perceptíveis.
- Chassis com diferenças relevantes.
- Um ciclo de recompensa e persistência testável.

**Critério proposto:** experimentar configurações diferentes e verificar se o jogador consegue planejar uma build e adaptá-la ao sorteio. Confirmar que morrer elimina skills sem apagar indevidamente desbloqueios permanentes.

### Etapa 3 — Partida completa

- Sobrevivência de vinte minutos.
- Ex-policiais após cinco minutos e perseguidores grandes após quinze.
- Chefes com mecânicas próprias e postes destrutíveis.
- Dificuldade escalável e armas evoluindo conforme regra aprovada.
- Testes de builds extremas e desempenho.
- Teste de viabilidade do desafio PROT-0001 sem skills.

**Critério proposto:** completar uma partida com vitória e outra com derrota, com progressão e recompensas corretas; medir desempenho na máquina mínima que ainda será escolhida.

### Etapa 4 — Preparação para Steam

- Definir fórmula, categorias e integridade do ranking mundial.
- Integrar e testar serviços Steam necessários.
- Implementar salvamento e recuperação de dados conforme escopo aprovado.
- Preparar português e inglês; manter texto estruturado para chinês simplificado posterior.
- Definir requisitos mínimos, configurações e recursos de acessibilidade.
- Decidir conteúdo de lançamento, preço, modelo de lançamento e eventual demo.
- Produzir página da loja e materiais com imagens reais da versão representada.

**Critério proposto:** builds testadas em Windows e Linux, fluxos de save e ranking verificados, limitações conhecidas documentadas e escopo comercial definido.

### Etapa 5 — Expansão de conteúdo

Avançar em direção ao alvo declarado de uma fase, dez chefes, dez armas, vinte peças e quinze skills com três derivações. Decidir o que entra antes do lançamento e o que fica para atualizações com base em testes, esforço e orçamento.

## Próximas decisões prioritárias

1. Validar o combate no navegador usando a base HTML/CSS/JavaScript aprovada.
2. Definir a persistência exata dos recursos e peças após morte e vitória.
3. Definir as três derivações de cada skill.
4. Especificar PROT-0001, arma padrão e controles.
5. Validar um primeiro combate antes de ampliar a produção de conteúdo.

## Entrega de combate — 27/10/2026

Implementados mira livre pelo mouse, disparo ao segurar o botão esquerdo e movimento independente com WASD/setas. Este mapeamento é experimental para validação; não aprova controles finais nem atributos do PROT-0001. Removido o movimento por toque do protótipo para não confundir mira e deslocamento; suporte a toque permanece fora desta entrega. A sessão curta continua em três minutos.

Validação: `node --check game.js` e `node tests/combat.cjs`, com verificações de ausência de tiro automático, direção, cadência, interrupção dos comandos, movimento diagonal, melhorias, vitória, derrota e reinício. O teste de lógica usa DOM/canvas simulados; teste visual e avaliação de jogabilidade seguem pendentes porque o executável do navegador de testes não está instalado neste ambiente. Nenhuma integração Steam, garagem ou persistência foi implementada nesta etapa. O ZIP anterior não foi atualizado.

## Direção artística e preparação de assets — 28/10/2026

Direção artística e paleta do PROT-0001 aprovadas conforme [arte-paleta-prot-0001.md](arte-paleta-prot-0001.md) e [conceito 01](propostas-arte/prot-0001-conceito-01.md): humanoide industrial pesado, metal gasto, ombreiras/pistões/juntas, visor e núcleo azuis, pixel art com paleta limitada e sombras profundas.

Designer: produzir spritesheets pixel-perfect transparentes e frames individuais, com dimensões, pivôs e duração documentados. Idle/walk e estudos em oito direções não são assets finais; run continua opcional. Resolução e escala ainda não aprovadas.

Dev: módulo opcional `sprite-animation.js` preparado para recortes por frame, tempos, direções e escala sem interpolação. Não ativado no HTML; robô procedural continua em uso. [Contrato de integração](integracao-sprites.md). Câmera suave e mecânicas preservadas. Testes de animação e regressão do combate passaram; integração visual depende dos arquivos finais.

Próximo passo de arte: receber e verificar a entrega técnica do Designer antes de substituir o robô provisório. Não integrar as pranchas de estudos.

## Entrega experimental das etapas 1 a 4 — 29/10/2026

Implementados: garagem separada com um chassi/slot, seleção fixa de metralhadora ou escopeta, ofertas de skills e três sinergias, primeiro chefe com dois padrões sinalizados e recompensa temporária. Não equivale à conclusão integral do catálogo de garagem ou da Etapa 2 original. Consulte os parâmetros no [design](game-design.md).

Verificado: sintaxe JavaScript, controles/IDs do HTML, regressões de movimento/câmera/dano, seleção e bloqueio de arma, escopeta com cinco projéteis, invalidação de ofertas antigas, reset de skills, efeitos em vários alvos, avisos de ataques, recompensa única e simulação completa de três minutos. Ferramentas de sprites continuam passando nos testes. Tentativa de instalar navegador falhou por download inválido; validação visual e de balanceamento no navegador permanece pendente.

Próximo teste do criador: comparar armas, obter módulos especiais, observar sinergias e enfrentar Brutamontes aos 60 s. Confirmar conforto do HUD e dificuldade. Nenhuma mudança na retenção de peças nem integração da arte não aprovada tecnicamente. O ZIP antigo em downloads continua desatualizado; usar Code → Download ZIP.

## Catálogo ampliado — 29/10/2026

Implementadas dez armas adicionais (12 no total), dez melhorias adicionais (18 no total) e BAST-0002 como segundo chassi. Garagem oferece as 12 armas e ambos os chassis sem inventar progressão permanente. Segundo robô usa atlas SVG provisório original, distinto do desenho do PROT-0001. Arte definitiva permanece pendente.

Verificação: regressões anteriores, disparo de todas as armas, raio de explosão/tempo de granada, rajada cancelada ao soltar botão, retorno do disco, corrente Tesla, perfuração e empurrão, status sem alteração dos atributos base, vida máxima por chassi, seis baterias, cura/escudo/regeneração/armadura, crítico e reset. Simulações de todas as armas com módulos combinados até a entrada do chefe passaram. SVGs conferidos por XML e renderização de inspeção. Teste visual e balanceamento do jogo no navegador seguem pendentes.

[Pedido técnico de sprites para o Designer](arte/prompt-inimigo-zumbi.md) pronto. Inimigos ainda usam desenhos provisórios; não marcar sprites finais como produzidos. Nenhuma mudança em persistência, ranking ou regras de montagem além do teste de dois chassis de um slot.

## Mais dez skills — 29/10/2026

Catálogo ampliado de 18 para 28 melhorias temporárias: XP, proteção pós-dano, dano contra chefe, finalização, ricochete, raio explosivo, alcance elétrico, interrupção de movimento, cura de emergência e propulsor via ESPAÇO. Ofertas de módulos dependentes filtradas. Quantidade de armas (12) e chassis (2) preservada.

Testes passaram para as regras novas e regressões, incluindo salto de projétil para outro alvo, bônus condicionais, XP fracionária, proteção pós-dano, curas únicas, propulsor sem invulnerabilidade e recarga congelada na pausa. Não houve integração de estudos de arte nem alteração da câmera. Avaliar disponibilidade das ofertas e potência das combinações no navegador antes de fixar balanceamento.
