# Risco e coleta do bot — BUILD54

A morte precoce do Caçador Criogênico foi investigada mantendo o runtime de combate da BUILD53. A política anterior podia substituir a busca de XP por um baú distante, mesmo com inimigos no caminho. O piloto conhecia as posições, mas sua preferência de rota ainda podia levar a decisões ruins.

## Comparação de abertura

Oito sementes,180segundos por tentativa, mesma receita e fonte de jogo:

| Política | Sobreviveu à janela | Interpretação |
|---|---:|---|
| Legada / Driver11 |7/8|Morte original aos115,2s preservada |
| Replay legado / Driver12 |7/8|Todas as tentativas reproduziram os resultados anteriores exatamente |
| Rota inteira desimpedida / Driver12 |8/8|Melhorou a abertura, mas prejudicou a coleta da Oficina em partida completa |
| Aproximação imediata / Driver13 |8/8|Candidata adotada após testes longos e verificações de rota |

Essa janela curta não aprova sobrevivência completa: o campo de viabilidade de20minutos fica nulo. A saída do runner agora distingue “sobreviveu à janela” e “viabilidade completa”; antes, uma tentativa curta podia aparecer como0/N mesmo sem estar avaliando a meta completa.

O primeiro candidato cauteloso foi rejeitado: no Chrome, Oficina sobreviveu20minutos, mas derrotou sóum chefe e não coletou nenhum baú. Esse resultado continua em bot-loot-browser-raw.json. Exigir que todo o trajeto atéo objetivo esteja livre impedia o piloto de se aproximar e abrir caminho.

## Regra do Driver13

O bot sóconsidera um baú a até1200px e com pelo menos35% de integridade. Examina o trecho imediato de aproximação, de70–130px conforme sua velocidade, com margem de32px além do raio de cada inimigo vivo. Obstáculos mais distantes não proíbem começar a aproximação; as ameaças são reavaliadas nas decisões seguintes. A atração por baú caiu de1,2 para0,8. Os demais critérios de esquiva, chefes, XP, disparo e escolhas permanecem na política compartilhada.

Se a aproximação for arriscada, retoma a busca normal de XP. A política não teleporta, apaga inimigos, dá imunidade, cura ou atributos adicionais. O modo `BUILD_CHEST_POLICY=legacy` continua disponível no runner de laboratório para comparar resultados. O launcher do jogador usa a política segura.

## Ensaios longos e limites

O Chrome com Driver13 levou Oficina/20261106 e Tempestade/20261106 aos20minutos, sete chefes e seis baús coletados em cada. Oficina/20261111 também chegou aos20minutos, com quatro chefes e quatro baús. As fontes e os relatórios originais de todos os candidatos ficam no JSON de evidência, incluindo o candidato rejeitado.

Na simulação headless, o Criogênico chegou aos20minutos com sete chefes nas sementes20261106,20261111 e20261112. As duas últimas não participaram dos oito ensaios de abertura usados no ajuste. Os três núcleos de receita foram alcançados, sem erros de execução ou valores não finitos. Isso melhora a confiança no piloto dessa receita; não implica que toda tentativa futura vencerá nem elimina a necessidade de playtest humano.

Os ensaios headless e Chrome são fixtures distintas:1000×600 e1280×900 alteram geometria das ondas e trajetórias. Não tratá-los como pareamento direto. A comparação de abertura usa a mesma fixture, sementes e fontes. O piloto ainda conhece posições e tem precisão/reação diferentes de uma pessoa; nenhuma taxa de sobrevivência garante dificuldade ou satisfação humana.

`tests/bot-loot-safety.cjs` cobre objetivo livre, bloqueio imediato, obstáculo distante, baixa integridade, distância, inimigo morto, alternativa segura e controle legado. `tests/playtest-bot.cjs` mantém testes dos dois modos em navegador isolado, comandos naturais, relatórios terminais e erros. `tools/report-loot-safety.cjs` valida e consolida os registros, sem remover falhas. A execução longa inicial que ficou sem tentativas foi conservada no histórico; uma nova execução foi acrescentada somente depois de verificar que o processo havia terminado.
