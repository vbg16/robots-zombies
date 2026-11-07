# Colimador de Campo — BUILD59

O Colimador é uma peça rara temporária de baú. Ele acrescenta uma decisão espacial à mira manual: alinhar os tiros com um campo fixo no mundo. É a13ªrelíquia; o compêndio passa a95entradas e o painel conserva82módulos editáveis. Nada persiste no perfil. Não exige outro equipamento e participa das alternativas universais junto do Servo, Coração e Núcleo; não ocupa as posições reservadas a hardware específico da build.

## Regra de combate

Ao existir uma direção manual válida, o primeiro tick cria um círculo de raio36 a96px à frente do robô. O campo permanece ancorado por4s ativos e um novo nasce a cada6s ativos. Mover robô, câmera ou mira não reposiciona o campo atual. Sem direção manual, o próximo nascimento espera; não procura inimigo nem usa alvo automático. Há no máximo um campo, sem acumular nascimentos atrasados.

O centro do projétil precisa tocar ou entrar no círculo. Um tiro rápido que atravesse o círculo inteiro entre dois quadros também conta. Cada objeto-projétil recebe dano×1,35 uma única vez: sair e entrar novamente, retornar com disco, ricochetear ou encontrar um campo posterior não acumula o bônus. Pellets são objetos distintos; cada um precisa cruzar. Não aumenta tamanho, velocidade, vida útil, munição, perfuração ou quantidade de tiros.

| Ordem espacial | Resultado |
|---|---|
| Contato com corpo antes do campo | Dano original nesse impacto |
| Entrada no campo antes do corpo | Dano×1,35 nesse impacto |
| Contato e entrada coincidentes | Campo primeiro, com tolerância numérica de8EPS no parâmetro do segmento |
| Bala encerrada ou ricocheteada antes do campo | Não converte o trecho que não percorreu |
| Fim da vida antes ou no instante da entrada | Não converte; expiração vence o empate |
| Fim da vida depois de entrar | Detonação usa o dano convertido |

A lista de alvos conserva a ordem de impactos anterior. Para corpos sobrepostos, cada dano considera o contato com sua superfície expandida pelo raio da bala, sem supor que a ordem dos centros seja a ordem das superfícies. Um snapshot local evita multiplicar sucessivamente o mesmo dano. O valor temporário usado por impacto é restaurado em finally, inclusive após exceção.

O campo amplia o dano do tiro e, portanto, os efeitos que já derivavam desse dano: explosão, descarga, pulso crítico, nova queimadura e nova corrosão. Não cria esses efeitos se a build não os possui, não duplica chamadas nem semeia estados por drones/sensores/rotores. Cargas corrosivas antigas conservam seus snapshots. O componente cinético que usa velocidade/dano direto continua sua fórmula própria. Escudo absorve integralmente o golpe de quebra, mesmo convertido.

O cálculo espacial respeita o tempo de vida restante. A posição de detonação por expiração continua sendo o endpoint legado do tick; esta etapa não altera a física geral das granadas nem passa a processar corpos nesse ramo. Assim, uma granada cuja vida terminou antes de chegar ao círculo não recebe bônus só porque o endpoint calculado fica além dele.

## Apresentação e ciclo

Círculo segmentado ciano, terminais industriais e centro transparente representam a área real. Orientação dos terminais fica congelada com a mira do nascimento. O desenho fica depois dos inimigos e antes dos projéteis, para manter a borda legível sem preencher ou encobrir a arena. O rótulo curto aparece só nos primeiros0,6s; projéteis convertidos recebem um contorno ciano sem perder o desenho da própria arma. Não há toast a cada campo nem novo timer permanente no HUD.

A pausa informa campo ativo/segundos restantes ou tempo até o próximo, e ganho apenas para tiros que cruzam. Pausa, ofertas, reforja, morte e retrato móvel não avançam a simulação. Reset remove dispositivo, relógio e projéteis. O evento de nascimento usa o timbre existente do sensor e seus limites de áudio; nenhum sorteio de combate é consumido por nascimento ou desenho.

## Proteções e evidências

- `segment-circle.cjs`: solução analítica, tangência, início dentro, segmento zero, endpoint, quase erro, translação/escala, extremos numéricos, dados inválidos e UMD puro.
- `field-collimator.cjs`: impactos antes/depois no mesmo tick e em passos divididos; corpos sobrepostos com centros em ordem diferente; empate, ricochete antes/depois, disco retornável, expiração anterior/coincidente/posterior, escudo, estados capturados, três slots reais, ausência de balas extras, pausa/ofertas/morte/reset, desenho sem RNG e limpeza após exceção.
- `boss-relics.cjs` e suíte principal:13peças distintas, alternativas universais, hardware específico, não repetição, coleta/fallback/callbacks antigos, compêndio95, painel82 e continuidade da partida.
- Comparação de partículas mantém12mundos contra BUILD57, incluindo400projéteis. A comparação histórica de feedback mantém32mundos/416checkpoints com o pool antigo de12relíquias fixado no harness e sem instalar o Colimador. Isso protege o caminho anterior; não alega RNG idêntico no novo sorteio real de13peças. O primeiro ensaio sem fixar esse pool falhou após um baú e foi preservado.

O Tester inteligente revisou e executou a suíte específica; o Revisor examinou a ordem dos contatos, restauração e catálogos. O Designer propôs terminais ciano e campo transparente. O tester burro executou fixtures em1280×900,844×390 e740×360: instalação pela carta, mira/disparo reais, ancoragem e pausa. Na cena cheia, identificou o anel encoberto por sprites; a camada de desenho foi movida para corrigir isso. São testes de interface induzidos, sem alegação de telefone físico ou aquisição natural.

## Custo sintético

Uma cena congelada com180comuns, três lacaios, um chefe e400projéteis foi restaurada antes de cada uma das60amostras de cada modo. Vida alta, imunidade, ondas suspensas, áudio desligado e campo injetado são fixtures explícitas. Entradas físicas base iguais, removendo da comparação apenas o dispositivo e sua pertença ao conjunto de relíquias. O campo converteu18projéteis em todas as60amostras com peça, contando referências fora do trecho cronometrado, inclusive balas removidas por impacto.

| Modo | Mediana do tick | p95 |
|---|---:|---:|
| Sem peça |110,4ms |139,0ms |
| Com campo |115,8ms |132,6ms |

O acréscimo observado da mediana foi4,9%; a queda do p95 não prova melhora. Ensaio sequencial num host compartilhado, com outras automações, não isola causalidade fina. Carga extrema continua cara; os números não são FPS, desempenho de GPU/celular ou progressão natural. Todos os estados amostrados ficaram finitos,≤400balas,180comuns preservados e zero erros de página/requests. Dados, fontes congeladas e tempos brutos acompanham a versão.

## Partidas naturais e ajuste da Oficina

A matriz inicial executou dez receitas na semente20261107,1200s ativos, reforjas e telemetria, piloto smart13/safe, física20Hz/decisões5Hz. Todas sobreviveram; nove derrotaram pelo menos3chefes. Oficina terminou com2chefes, apesar de390/390HP e1079/1079orbes coletados. Ficou985,3s com chefe vivo, apenas127,55s no alcance geométrico estimado e974,6s recarregando. A falha está preservada e não foi atribuída automaticamente a falta de dano global.

O Colimador foi adquirido naturalmente em três partidas: Escopeta no fim da janela, Caçador e Lança de Fuga. Apenas o Caçador registrou conversões nessa matriz:192projéteis criogênicos. Aquisição não garante alinhamento nem uso; os casos com zero não foram removidos. Um contador exclusivo do runner isolado observa a transição real do marcador após a função original; provas de argumentos, retorno, this, estado e próximos16RNG verificam sua transparência. A cópia instrumentada, seu diff e fontes congeladas acompanham os dados. As alterações posteriores em carta/label/camada/contraste são somente de apresentação.

Um protocolo separado comparou o guia da Oficina com a troca de uma recomendação: Recarga Glacial por Propulsão Balística. Mantém as quatro skills centrais, equipamento, especialização e frio por impacto. Ganha alcance×3, abre mão do pulso frio ao recarregar e de seu custo de recarga×1,5; também assume o custo próprio de projétil menor÷1,25. Nenhuma skill, arma ou vida de inimigo teve atributo alterado.

| Semente | Oficina anterior: chefes | Guia candidato: chefes |
|---|---:|---:|
|20261107 |2 |7 |
|20261118 |7 |7 |
|20261119 |5 |7 |
|20261120, confirmação |— |7 |
|20261121, confirmação |— |7 |

O critério foi fixado antes: as cinco candidatas precisavam sobreviver1200s e derrotar pelo menos3chefes, sem erro numérico. Todas passaram; a troca foi adotada no guia, mantendo oito melhorias e pré-requisitos válidos. O controle07 reproduziu integralmente a tentativa original da matriz, inclusive telemetria e contadores. O tempo com chefe vivo no07 caiu para247,4s e o tempo estimado no alcance subiu para217,9s. Não alegar redução universal da soma de recargas: na18ela aumentou com a progressão diferente. A política do bot usa alcance para escolher alvo/rota; a experiência não isola a fração do ganho causada por alcance, recarga, rota ou escolhas posteriores. As duas confirmações passaram sem nenhuma conversão do Colimador.

As outras nove receitas mantêm seus objetos físicos e suas medições. O conjunto atual possui nove aprovações da matriz original mais a Oficina validada nas cinco sementes; isso não é uma nova matriz homogênea10×5. Cinco sementes e pilotos não constituem aprovação humana ou universal do equilíbrio. Só equipamento foi pré-desbloqueado: não houve imunidade, dano/cura adicionais, chefes mortos à força, suspensão de ondas ou retirada de inimigos vivos nas tentativas naturais.

## Evidência de publicação

`data/build59-runs.json.gz` conserva matriz, controle falho, cinco candidatas, protocolos prévios, receitas experimentais, fontes e decisão de adoção. `data/build59-benchmarks.json.gz` conserva o ensaio sintético com/sem campo. `data/build59-qa.json.gz` reúne os pareceres, fixtures, equivalências, logs e resultados de navegador. `build59-balance-summary.json` resume as tentativas e identifica os braços.

O teste permanente `field-collimator-browser.cjs`, derivado da fixture do chat, acrescenta assertions de acesso aos botões, conversão por entrada real, ancoragem, pausa, reset e fontes inalteradas em três resoluções. A versão final usa contorno escuro6px sob ciano2px e foi inspecionada pelo Designer; mesmo assim a densidade extrema de180inimigos+180hostis continua caótica. Não há promessa de legibilidade perfeita. A simulação principal de25minutos, catálogo, escudos, bot e recursos offline passaram; publicação permanece desenvolvimento, sem promover a branch pública.

## Disposição do sistema

Conversão espacial estudada em Magic Lens foi adaptada por hardware original. **Entidade alimentada por tiros continua pendente**: o campo não armazena energia nem gera ataque próprio. Também continuam pendentes os motores de último tiro/janela de recarga, proteção condicionada e gatilhos específicos do [mapa](disposicao-sistemas.md). A etapa não copia arte, nomes, personagens ou código externo.
