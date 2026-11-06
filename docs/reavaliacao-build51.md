# Reavaliação das dez receitas — BUILD51

Avaliação concluída após o commit02ccd8c, sem modificar receitas ou atributos durante a medição. A execução completa está em `build51-canonical-progression.json`:20tentativas, nenhum erro de execução, sete cumpriram1200s e três chefes. As outras13falhas permanecem no relatório. `build51-canonical-summary.json` resume as dez receitas.

Critério pré-fixado:1200segundos de sobrevivência e ao menos três chefes. Dez receitas canônicas, sementes20261103 e20261104, total20tentativas. Reforjas habilitadas, driver10, física20Hz e decisões5Hz. Nenhuma exclusão de casos.

A fixture libera equipamentos para montar cada receita. As skills são conquistadas pelos sorteios da partida; não há invulnerabilidade, dano adicional, morte programada de chefe, supressão de ondas ou remoção de inimigos vivos. As receitas canônicas continuam com uma arma, conforme anunciadas pelo guia. Os arsenais opcionais da BUILD51 têm resultados próprios em arsenal-avancado.md.

Preservar falhas e sementes. Comparar tempo de morte, chefes, nível, acesso ao núcleo da receita, dano por fonte, dano recebido e cura antes de escolher mudanças. Não mudar o critério depois dos resultados. Qualquer candidato de equilíbrio deve ser comparado com a referência usando as mesmas condições, seguido de sementes adicionais não usadas para escolher o ajuste.

Esta referência não altera o ramo público. O pedido posterior do jogador por limite procedural e ganhos diretos de arma gerou o candidato BUILD52, documentado em horda-procedural.md e comparado com estas mesmas sementes. O relatório por e-mail será enviado após a entrega estável.

## Diagnóstico parcial da Agulha Antititã

As duas sementes terminaram em678,35s e657,15s, com quatro chefes e nível14. Na primeira, todos os oito módulos da receita foram adquiridos; Caça-Titãs chegou somente aos647,05s. Na segunda, faltou Caça-Titãs. A reforja do nível20 não foi alcançada em nenhuma.

Isso contradiz a hipótese de que toda falha seja apenas uma receita incompleta: uma tentativa completou a receita e morreu. Ainda não identifica uma causa única. Houve220/352de dano recebido e120/252de cura, com mais de2000inimigos vivos no pico. A maior parcela de dano está agregada em contato/projétil, portanto o relatório não permite atribuí-la exclusivamente a cercamento ou atiradores.

Próxima análise após concluir a referência: contrastar receitas frágeis e sobreviventes, acesso tardio a módulos, manutenção, alcance e recarga. Preservar as duas sementes atuais para comparação e reservar sementes adicionais para verificar qualquer candidato escolhido. Os atributos e as receitas em produção continuam inalterados durante esta medição.

## Verificação paralela da distribuição

O arquivo gerado por git archive do commit02ccd8c foi extraído em diretório próprio e aberto por file:// no Chrome. A suíte de arsenal passou nessa entrada. O painel do pacote carregou82módulos, aplicou a configuração padrão na revisão5 e a partida seguinte leu82módulos. O hash do ZIP e dos arquivos essenciais está em validacao-zip-build51.json. Isso valida o pacote desse commit, não todos os navegadores ou todas as configurações editadas.
