# Bot de testes de partida

Abra **Testar-com-bot.cmd** para escolher o bot inteligente ou o simples. O Chrome mostra uma tentativa de até 20 minutos em tempo real. O botão ENCERRAR TESTE encerra a execução e grava o relatório; morte também encerra a tentativa. O bot usa um contexto isolado do navegador, sem acessar o save pessoal do jogador.

Pré-requisitos: Node.js LTS e Chrome instalado. Na primeira configuração, se faltar a biblioteca de automação, execute na pasta do jogo:

```powershell
npm install --prefix tools/bot-runtime playwright
```

O desenvolvedor pode usar uma instalação de Playwright existente. Nenhuma dependência do bot é carregada pelo jogo normal. O launcher não instala nem baixa pacotes automaticamente.

## Comandos

```powershell
# Bot inteligente visível, velocidade normal
node tools/playtest-bot.cjs --headed --mode smart --minutes 20

# Partida acelerada em segundo plano
node tools/playtest-bot.cjs --mode smart --minutes 20 --speed 1000 --seed 20261106 --build agulha-antitita

# Estratégia simples de fugir e atirar, mesma receita/semente
node tools/playtest-bot.cjs --mode dumb --minutes 20 --speed 1000 --seed 20261106 --build agulha-antitita
```

`--build` aceita as dez receitas do guia em builds.js. `--output outputs/bot/meu-teste.json` escolhe um arquivo de relatório; sem essa opção, cada execução ganha nome com data, modo e receita. Não reutilize o mesmo arquivo se quiser guardar tentativas anteriores.

O modo inteligente reaproveita a política do driver11: evita ameaças previstas em oito direções, procura XP, prioriza chefes no alcance, usa propulsor somente se adquirido e escolhe módulos oferecidos conforme a receita. Também procura os baús de chefe e resolve a escolha de relíquias. O simples usa as mesmas escolhas da receita, mas seu movimento foge do inimigo mais próximo sem prever projéteis, perigos ou rotas de coleta. Isso permite testar se fugir continua sendo uma estratégia dominante.

O bot escreve comandos de movimento, mira/disparo e escolhas no estado do jogo de teste. Não adiciona atributos, invulnerabilidade, cura, remoção de vivos, supressão de ondas ou mortes programadas. Os equipamentos ficam previamente liberados apenas para montar a receita, em save descartável. Portanto esta ferramenta avalia o combate e a progressão de módulos, não o ritmo de desbloqueios da garagem.

## Relatório e limites

Cada JSON guarda versão, modo, receita, semente, hashes de código/política, tempo, motivo de encerramento, nível, abates, chefes, dano por fonte, dano recebido, cura, escolhas, baús observados/coletados, picos de entidades e amostras por minuto. A captura final PNG fica ao lado. Fechar o navegador ou um erro do jogo registra runtime-error; uma morte registra player-death e permanece no relatório. Uma partida curta não recebe aprovação de viabilidade. A meta de 20 minutos e três chefes só é avaliada em execuções de ao menos 20 minutos.

O jogo padrão continua manual e infinito: o bot encerra a medição no prazo escolhido, sem criar uma vitória no produto. Sua mira é precisa e sua tomada de decisões não reproduz a habilidade de todos os jogadores; resultados servem para comparar situações sob condições conhecidas, e não para afirmar que a dificuldade seja ideal. Ele mede o navegador real, mas a velocidade acelerada e o desenho por lotes não são um benchmark de FPS.

Verificação curta: `node tests/playtest-bot.cjs`. Para evidência de partida inteira, execute o prazo de 20 minutos e inspecione status, time, bossKills, errors e as escolhas no relatório, preservando também as falhas.

## Ensaios do candidato BUILD53

Chrome, semente20261106, driver11, sem imunidade ou bônus ocultos:

| Receita/modo | Encerramento | Chefes | Baús coletados |
|---|---|---:|---:|
| Agulha / inteligente | 20 minutos | 7 | 7/7 |
| Oficina / inteligente | 20 minutos | 7 | 6/7 |
| Tempestade / inteligente | 20 minutos | 7 | 7/7 |
| Tempestade / simples | Morte aos317,55s | 2 | 0/2 |

Os dados completos estão em bot-playtest-build53.json. Agulha/Oficina e Tempestade foram executadas em snapshots de código distintos registrados por hash; somente o par Tempestade inteligente/simples usa o mesmo snapshot e a mesma semente. A política11 inclui coleta de baús, então não é pareamento com os resultados históricos da BUILD52, que usaram driver10. Oficina terminou no nível19: sobreviver e matar chefes não comprova que todas as funcionalidades de progressão tenham sido alcançadas naquela tentativa.
