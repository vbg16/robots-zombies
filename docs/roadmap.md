# Plano de desenvolvimento

## Estado atual verificado

O repositório começou vazio. Foi criado um protótipo experimental em HTML, CSS e JavaScript, sem dependências externas, executado com um servidor HTTP do Python.

O protótipo contém movimentação, disparo automático, inimigos, coleta de energia, escolhas de melhorias, pausa, vitória e derrota. As verificações executadas cobriram sintaxe, lógica em ambiente simulado e respostas HTTP dos arquivos. O teste visual em navegador não foi concluído porque o download do navegador foi bloqueado pelo domínio de rede.

**Divergências conhecidas em relação ao design aprovado:** disparo automático em vez de manual; duração de três minutos em vez de vinte; ausência de garagem, montagem de robôs, persistência, progressão de armas, conteúdo final e ranking Steam. Não é uma versão comercial nem comprova o balanceamento do jogo.

## Estratégia proposta

Validar o combate e as sinergias antes de produzir todo o conteúdo. Não há prazo ou orçamento aprovados. As etapas abaixo são uma proposta de sequência, não compromissos de entrega.

### Etapa 0 — Base de produção

- Escolher a engine; Godot 4 é a recomendação atual, ainda não aprovada.
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

1. Aprovar ou substituir a recomendação de Godot 4.
2. Definir a persistência exata dos recursos e peças após morte e vitória.
3. Definir as três derivações de cada skill.
4. Especificar PROT-0001, arma padrão e controles.
5. Validar um primeiro combate antes de ampliar a produção de conteúdo.
