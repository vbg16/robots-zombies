# Diagnóstico de balanceamento — referência BUILD52

Este diagnóstico usa as vinte tentativas completas de `build52-progression.json`, duas sementes por receita, e a referência anterior preservada em `build51-canonical-progression.json`. Refere-se ao gameplay publicado no commit `804e7f1801ff8a756b6f43844df50702e01ccb88`; alterações visuais posteriores não fazem parte da comparação. Nenhum atributo foi alterado nesta análise.

## Resultado e interpretação

As dez receitas sobreviveram nas duas sementes e derrotaram pelo menos três chefes:20/20, contra7/20 na referência anterior. A população total observada ficou em até183 (180 comuns e até três lacaios). A combinação de diretor limitado com quatro módulos sem penalidades resolveu o acúmulo extremo da referência, que chegava a7463 inimigos vivos. Os resultados não isolam a contribuição de cada mudança.

Dezessete tentativas terminaram com vida cheia; três terminaram com perdas de7,14 e4 pontos. O total recebido foi4093,8 e a cura efetiva4068,8 ao longo de400 minutos simulados. Isso mostra sustentação forte para este piloto; não significa ausência de pressão durante a partida, nem prova que um jogador humano terá a mesma facilidade. O pedido do jogador admite e deseja dominar a horda com uma build forte, portanto20/20 não é, por si só, motivo para retirar dano ou cura.

Há diferenças de função e de acesso à progressão que merecem mais atenção do que a taxa de sobrevivência isolada.

| Receita | Chefes, média | Abates, média | Dano recebido, média | Níveis finais | Reforja20, tempo por semente |
|---|---:|---:|---:|---|---|
| Agulha Antititã |7|2014,5|33|21 /25|13:29 /09:06|
| Tempestade Balística |7|5409,5|65,5|29 /31|05:26 /04:06|
| Escopeta de Ricochetes |4|3746|431,5|23 /24|10:59 /09:10|
| Caçador Criogênico |7|3525,5|100|25 /28|11:18 /08:07|
| Forja Criogênica |6|2818|178|27 /27|04:01 /04:31|
| Rede de Plasma |5|4217,5|281|29 /26|06:09 /08:53|
| Demolição de Campo |7|4448|554,9|29 /26|06:26 /07:29|
| Oficina Viva |4,5|1292,5|198,5|22 /20|12:38 /17:41|
| Enxame de Sucata |7|3854,5|53|25 /26|07:17 /07:05|
| Lança de Fuga |7|982|151,5|19 /18|Não atingiu20 em nenhuma|

Os tempos estão arredondados ao segundo. As médias não corrigem por diferenças de vida máxima, armadura ou habilidades adquiridas; por isso dano recebido não deve ser usado sozinho para ordenar dificuldade. As tentativas da BUILD51 que morreram duraram menos de1200s: seus totais de dano e abates não são diretamente comparáveis como se tivessem a mesma janela.

## Pontos concretos

1. **Lança de Fuga vence chefes, mas acessa pouca progressão de arma.** Derrotou sete chefes em ambas, porém terminou no nível19/18, sem reforja. Oficina também demora: uma reforja só apareceu aos17:41. O código recompensa os chefes com peça, cura e experimento, mas não produz núcleos de XP na morte do chefe; o XP vem dos inimigos comuns. Isso explica um incentivo estrutural: priorizar chefes pode ser seguro e eficaz, mas paga pouco na progressão por nível. É uma hipótese para testar, não uma falha comprovada na quantidade de XP coletada, pois o relatório não registra núcleos produzidos/coletados/perdidos por minuto.
2. **As armas de alcance curto sofrem em chefes específicos.** A Escopeta demorou356,45s /176,25s para a primeira Bobina, embora tenha eliminado3746 comuns em média. A Oficina demorou319,6s para Bobina em uma semente; a Forja teve chefes de até269,95s. A Rede de Plasma teve Sucateiros de252,8s /313,75s. Isso pede distinguir tempo sem alcance/sem disparar de dano insuficiente contra o chefe. Aumentar dano global com base no TTK bruto pode mascarar a dificuldade de aproximação.
3. **As especialidades já se distinguem.** Laser limpa5409,5 comuns em média; Lança mata982, mas cumpre os sete chefes e conserva vida. Drones somam aproximadamente70% do dano do Enxame, e eletricidade cerca77% do dano da Rede. Esse contraste entre área, alvo único e sustentação deve ser preservado, sem exigir que todas as receitas tenham a mesma produção de abates.
4. **Dominar o fim pode estar começando cedo em alguns casos.** O primeiro Brutamontes da Tempestade cai em2,1s /4,3s aos primeiros sessenta segundos. Isso é um sinal para observar se o jogador consegue ler o chefe antes de matá-lo, não uma justificativa imediata para invulnerabilidade ou aumento global de vida. Parte da sensação satisfatória pode vir justamente dessa força quando os módulos aparecem cedo.
5. **Receita completa e sobrevivência são medidas diferentes.** A Escopeta da semente20261104 não recebeu Perfuração; a Forja20261103 não recebeu Combustão Concentrada. Mesmo assim sobreviveram. O guia recomenda uma build, mas não garante seus sorteios. Dezoito de vinte tentativas completaram o núcleo; a ausência dos dois módulos não deve ser ocultada por um selo geral de aprovação da build inteira.

## Próximo ensaio recomendado

Antes de escolher novo nerf ou buff, medir a evolução por minuto e comparar três comportamentos em clones das mesmas condições:

- **Piloto atual**, com fogo e escolhas naturais, preservando o resultado de referência.
- **Fuga sem disparar**, com dano recebido normal e sem imunidade. Mede se a sobrevivência sem combater continua fácil; o teste existente de fuga usa invulnerabilidade e prova presença/limite, não risco real.
- **Piloto com mira imprecisa e reação mais lenta**, mantendo movimento, mira e fogo manuais do ponto de vista do jogo. Comparar com o piloto atual sem afirmar que esse substitui playtest humano.

Registrar por minuto: comuns vivos e próximos, nascimentos por gatilho, reentradas, abates, XP produzido/coletado, nível, integridade mínima, dano e cura por fonte. Para chefes: tempo vivo, tempo em alcance da arma, munição/recarga e dano efetivo. Preservar todas as mortes e sementes. Priorizar as três receitas contrastantes Tempestade, Lança e Oficina antes de repetir a matriz toda.

Se o problema for acesso a XP apesar de combate útil contra chefes, avaliar uma recompensa física de XP por chefe, com quantidade explícita e sem mudar o marco20, comparando a curva das receitas lentas e rápidas. Se o problema for alcance, experimentar os parâmetros da arma ou o comportamento de aproximação do chefe em um candidato separado. Não alterar vida de toda a horda para corrigir um gargalo de coleta ou de alcance.

## Limites da evidência

O piloto atual conhece posições dos alvos e perigos, decide a5Hz em oito direções e prioriza um chefe em alcance se o inimigo mais próximo estiver a mais de60px. A mira do wrapper acompanha o alvo exato no disparo; o alcance e a distância desejada se baseiam na arma principal. Não representa a precisão, atenção ou reação de uma pessoa. Duas sementes por receita são amostra pequena. O ensaio headless não mede FPS, legibilidade dos avisos, sensação de peso, áudio ou satisfação. Os relatórios não têm séries temporais suficientes para atribuir toda redução de pressão a um único gatilho do diretor.
