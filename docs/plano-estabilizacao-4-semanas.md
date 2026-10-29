# Plano de estabilização — quatro semanas

Aprovado pelo criador em 29/10/2026. Esta sequência passa a orientar a execução antes de novas expansões. Semanas são etapas de trabalho; início/fim de calendário e disponibilidade ainda não definidos. Não há execução automática em segundo plano.

## Semana 1 — testar e selecionar

- Fazer sessões de teste no navegador.
- Corrigir problemas de usabilidade identificados.
- Selecionar as seis armas mais interessantes a partir de testes.
- Identificar cinco skills fortes e cinco fracas, distinguindo poder, diversão e clareza.
- Registrar decisões de balanceamento com evidência, valores anteriores e valores novos.

Entregáveis: [fichas de teste](teste-semana-1.md), lista de problemas, seleção provisória de seis armas e ranking de skills com contexto e amostra. Skills ainda não vistas ficam como não avaliadas, nunca como fracas. Selecionar seis não significa apagar as outras seis automaticamente.

Critério proposto de passagem: fluxo garagem→combate→upgrade→chefe→resultado testado; problemas que impedem jogar corrigidos ou claramente registrados; seleção sustentada por observações reais. Não declarar playtest humano com base em simulação.

## Semana 2 — medir e ajustar

- Adicionar telemetria local.
- Corrigir balanceamento com base na Semana 1.
- Melhorar feedback visual de dano, chefe, XP e upgrades.
- Adicionar efeitos sonoros básicos, se viável.
- Criar uma versão jogável de referência.

Telemetria proposta: escolha de chassi/arma, tempo ativo, morte/vitória, dano causado/recebido, tiros/acertos, ofertas e escolhas de skills, tempo e resultado do chefe. Confirmar implementação antes de afirmar que esses dados existem. Manter dados no dispositivo, sem envio à rede; permitir exportar/apagar e tratar falha de armazenamento. Não coletar identidade dos jogadores.

Som: volume/mudo, desbloqueio de áudio por interação e origem/licença documentada. Não bloquear a versão de referência se áudio não estiver viável.

Critério proposto: referência identificada por commit/versão, instruções reproduzíveis e limitações conhecidas; comparação antes/depois dos ajustes.

## Semana 3 — organizar a base

- Dividir game.js em módulos.
- Adicionar package.json.
- Configurar GitHub Actions.
- Definir licença e versão.
- Criar fluxo de teste real no navegador.

A refatoração deve preservar comportamento e passar nos testes existentes. Antes de usar módulos ES/fetch, definir como o usuário executará a versão: o atual duplo clique em index.html não deve quebrar sem uma alternativa simples e documentada.

Licença requer decisão do criador e revisão da origem dos assets. Não atribuir MIT ou outra licença automaticamente. A versão de referência da Semana 2 pode usar um identificador provisório por commit até definir o esquema.

Critério proposto: instalação/execução documentadas, checks automáticos passando e navegador real exercitando seleção, disparo, pausa, upgrades, chefe e reinício. CI configurado não significa CI executado.

## Semana 4 — testar com jogadores e decidir

- Repetir testes com jogadores.
- Avaliar estabilidade, clareza, diversão e variedade.
- Decidir se o protótipo está pronto para expandir.
- Somente então priorizar progressão permanente, novos inimigos ou preparação desktop.

Não contatar ou recrutar pessoas por ferramentas sem instrução explícita do criador. Participantes podem ser convidados por ele. Evidências não substituem sua decisão final de produto.

Critério proposto: nenhum bloqueio crítico conhecido; pelo menos as configurações selecionadas testadas; retorno de jogadores registrado; decisão de avançar ou repetir estabilização documentada. A quantidade de participantes depende de disponibilidade, sem amostra inventada.

## Regras de execução

Sem adicionar armas, chassis ou skills apenas para aumentar catálogo durante a estabilização. Novos itens entram se necessários para corrigir um problema observado e com escopo explícito. Correções, validação de arte já entregue e trabalho independente continuam possíveis.

Status inicial das quatro semanas: PLANEJADO. Não há sessões de jogador, ranking final de armas/skills, telemetria, áudio, refatoração, Actions ou licença concluídos por este registro.
