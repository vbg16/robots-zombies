# Culatra de Ruptura — BUILD60

Versão de desenvolvimento experimental. Esta etapa adiciona o motor de último cartucho, corrige a passagem de estados por escudo policial e entrega a especificação mestre. Não conclui o aceite da versão 1.0 nem promove o canal público.

## Regra da peça

A Culatra é uma relíquia temporária de baú de chefe, elegível para qualquer conjunto de armas. Instalar começa com zero carga em cada espaço e não repõe munição, vida ou recarga. Há14relíquias e96entradas no compêndio; o painel editável continua com82módulos.

Cada emissão que realmente consome um cartucho acumula uma carga naquele espaço. Pellets da mesma emissão não multiplicam cargas; subdisparos de rajada que gastam cartuchos contam separadamente. Tentativas bloqueadas por recarga, falta de munição ou teto de400projéteis não geram carga. Se houver uma vaga para parte dos pellets, a emissão consome um cartucho e gera uma carga.

Sejam C a carga armazenada e A a munição imediatamente anterior à emissão:

- Q=min(60,C+1).
- Se A>1: multiplicador1 e nova carga Q.
- Se A=1: multiplicador1+0,25×Q e nova carga0.

O cartucho atual participa do cálculo. Uma arma unitária libera×1,25; um carregador completo de6libera×2,5no último;24liberam×7. O teto×16é pico do último cartucho após60cargas, não DPS sustentado. Num ciclo sem retornos de munição de até60cartuchos iguais, o orçamento adicional é25% do dano-base total do ciclo. Com72cartuchos, o teto limita o extra a15cartuchos-base, total87.

Iniciar uma recarga antecipada válida descarta a carga; tentar recarregar um carregador cheio não descarta nada. Reposição de munição por outra skill não cria carga, mas pode adiar a última emissão. Reforja preserva a carga daquele espaço e não modifica projéteis já emitidos. Pausa e escolhas congelam tudo. Reiniciar remove relíquia, cargas e projéteis.

O multiplicador é aplicado uma vez aos projéteis dessa emissão, junto aos fatores próprios de crítico e reparo. O Colimador pode converter posteriormente o projétil pelo cruzamento espacial. Efeitos que já derivavam do dano da bala usam o resultado correspondente; a Culatra não concede efeitos nem cria chamadas extras. Drones, sensores e rotores não gastam cartuchos e não alimentam esse motor.

## Leitura visual

O indicador de cada arma mostra suas próprias cargas. Com um cartucho restante, mostra o fator previsto e avisa que R descarta. O número de munição recebe contorno branco-ciano; os projéteis finais recebem dupla marca angular branca, distinta do crítico âmbar e do Colimador ciano. Durante recarga, permanece o estado de recarga. A pausa apresenta as reservas por espaço.

O teste de navegador consulta a cascata CSS real: o reset global de combate anulava o primeiro contorno. A regra foi corrigida e o teste exige contorno computado de1px, além de verificar que some após recarregar. Para duas e três armas, testa rolagem e interseção com todos os ancestrais que recortam conteúdo.

Uma revisão adicional em janela desktop estreita encontrou contagem quebrada em várias linhas e cortada pela caixa herdada de72px. O painel primário agora separa valor e estado em linhas próprias, conserva a contagem numa linha e permite altura do conteúdo. O teste mede linhas de texto reais e clipping ancestral nas três resoluções, inclusive sem touch-active; a apresentação móvel continua coberta separadamente.

## Correção de escudo

A extração da especificação reproduziu um P1: um tiro absorvido pelo escudo podia aplicar fogo, frio e empurrão. A correção usa a condição de escudo capturada antes do impacto para bloquear esses estados e corrosão, inclusive no golpe que quebra o escudo. O excedente continua sem passar ao corpo; o próximo golpe desprotegido pode aplicar estados normalmente.

O teste novo falha na fonte anterior e passa na candidata em17fixtures, incluindo tiros reais da Culatra e do Colimador. Uma segunda reprodução encontrou stun de choque atravessando escudo, inclusive na quebra. A correção captura a proteção antes do dano elétrico;14fixtures adicionais comprovam bloqueio de stun de skill/protocolo, preservação de estados anteriores, golpe corporal seguinte e recuperação de munição apenas por dano no corpo. Pulsos de controle sem dano, como Recarga Glacial, mantêm sua regra separada. A comparação legada corrige explicitamente somente a referência arquivada para esses dois contratos e fixa o pool original de12relíquias. Ela não afirma equivalência com o sorteio atual de14peças nem normaliza o código candidato para esconder o defeito.

## Verificação e limites

- Modelo puro: ciclos1/6/24/72, conservação do orçamento, teto60, entrada inválida e ausência de estado global.
- Integração:12armas, pellets, rajadas, carregador parcial, recarga antecipada, retornos, teto400, três espaços, reforja, crítico, reparo, cruzamento espacial, escudo, desenho puro e reset.
- Chrome em1280×900,844×390e740×360: instalação pela carta, seis cliques reais, cinco pellets finais, composição com crítico/campo, recarga por R, HUD múltiplo, pausa e compêndio.
- Regressões: simulação integrada de25minutos; comparação legada32mundos/416checkpoints; partículas12mundos; baús,24reforjas, estado das armas, configuração e migração.

As fixtures de navegador usam proteção e preparação explícitas para observar a interface; não são partidas naturais, prova de desempenho ou teste de celular físico.

O histórico anterior à correção de escudo mantém uma matriz10receitas×20261107: todas sobreviveram1200s, nove cumpriram sobrevivência/chefes/core; Oficina terminou com apenas dois chefes. A Culatra foi adquirida naturalmente apenas pela Lança no fim da janela. Um experimento separado, com preferência pela peça somente quando legalmente oferecida, passou em quatro tentativas de Tempestade/Escopeta nas sementes20261122/23. Esses resultados não são a matriz final30nem aprovação da fonte pós-correção. Dados e limitações estão em [resumo histórico](build60-balance-summary.json).

## Matriz intermediária na fonte corrigida

Após corrigir impacto e choque no escudo, uma nova execução homogênea das dez receitas, semente20261107,1200s, piloto smart13/safe,20Hz/5Hz, reforjas e telemetria, obteve10/10viáveis pelo critério completo: sobrevivência, quatro skills centrais, pelo menos três chefes e estado finito. Cada receita derrotou entre quatro e sete chefes. Sem exceções ou descarte de ofertas/decisões. [Resumo atual](build60-current-summary.json) e [fontes/resultados integrais](data/build60-current-runs.json.gz) preservam protocolo e hashes.

A execução anterior à correção elétrica, também10/10, continua arquivada separadamente em data/build60-post-impact-runs.json.gz. Não atribuir causalmente diferenças entre trajetórias à correção de escudo: a divergência de estado altera eventos e sorteios posteriores.

O campo viable do runner antigo verificava sótempo/chefes; os relatórios atuais preservam esse bruto e calculam strictViable incluindo core e finite. O runner oficial foi fortalecido para usar o critério completo e tolerância de apenas1e-6s para arredondamento do relógio, sem mudar o piloto nem a física. Isso não transforma as dez tentativas intermediárias em trinta finais.

## Documentação e trabalho restante

A [especificação mestre](SCREWVIVORS-ESPECIFICACAO-E-TESTES.md) contém o inventário, fórmulas, estados, direção visual/sonora e274casos de aceite. O verificador estrutural confere contagens, IDs, campos, hashes e links; não executa todos esses casos nem aprova qualidade por si só.

O [objetivo aprovado](OBJETIVO-APROVADO.md) e os [gates de conclusão](META-DE-CONCLUSAO.md) continuam vigentes. Permanecem abertos a entidade alimentada por tiros, janela ofensiva de recarga, proteção condicionada, demais disposições compatíveis, matriz final homogênea30, estabilidade60minutos e medições reais de desempenho, incluindo celular físico.
