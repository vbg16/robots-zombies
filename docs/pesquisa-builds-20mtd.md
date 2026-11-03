# Pesquisa de motores de builds — 20 Minutes Till Dawn

Consulta: 02/11/2026. Objetivo: entender sistemas e criar combinações **originais de robôs contra zumbis**. Nenhuma arte, código ou descrição do outro jogo será copiada.

## Escopo e confiabilidade

Não existe uma lista finita útil de “todas as builds”: personagem × arma × escolhas × ordem × runas × evoluções produz muitas combinações, e Endless permite repetições. A cobertura abaixo é das famílias de motores e gatilhos, incluindo híbridos. A exploração ao final registra decisões de design nossas; as dez receitas implementadas estão em `dez-builds.md`, e os resultados medidos em `resultado-dez-builds.md`.

A wiki cataloga 25 árvores normais, com quatro nós por árvore. O seu próprio histórico registra mudanças e remoções; portanto um guia antigo não define a versão atual. [Árvores](https://20minutestilldawn.wiki.gg/wiki/Upgrades), [histórico](https://20minutestilldawn.wiki.gg/wiki/Versions).

O guia comunitário de isa declara escopo Steam/Standard e atualização textual de janeiro de 2024. É evidência de estratégias jogadas, não garantia de compatibilidade com mobile, Epic ou Endless. Também contesta a classificação dos morcegos da Batgun como summons completos: usufruir de escalas de summon não garante participar de todo gatilho de summon. Essa discrepância impede transportar regras por nome. [Guia de isa](https://steamcommunity.com/sharedfiles/filedetails/?id=3041661349).

Há inconsistência visível na página de Glare: uma seção mostra 25 a cada 2 s, outra 15 a cada 1 s. O histórico descreve a alteração. Para nosso design interessa a lógica “pulso em área que transmite efeitos”, sem copiar coeficientes não reconciliados. [Glare](https://20minutestilldawn.wiki.gg/wiki/Glare), [histórico](https://20minutestilldawn.wiki.gg/wiki/Versions).

Algumas páginas wiki.gg bloquearam abertura direta com HTTP403; as tabelas foram consultadas pelos resultados indexados da ferramenta web. Datas de rastreamento não equivalem a datas de atualização. Não foi possível auditar executáveis PC/mobile; diferenças de conteúdo e coeficientes ficam explicitamente abertas.

## Inventário das 25 árvores e sua função

Resumo funcional, sem reprodução das descrições. [Catálogo de upgrades](https://20minutestilldawn.wiki.gg/wiki/Upgrades).

| Família | Árvores | Função |
|---|---|---|
| Balística | Fast Bullets | Precisão e perfuração |
| Balística | Bullet Damage | Impacto e fragmentação |
| Balística | Fire Rate | Frequência e conservação |
| Balística | Multi Shots | Cobertura e último disparo |
| Recarga | Reload Boost | Ciclo e janela ofensiva |
| Summon | Dragon | Maturação temporal |
| Summon | Ghost Friend | Atacante acompanhante |
| Summon | Magic Lens | Conversão posicional |
| Summon | Magic Scythe | Contato orbital |
| Summon | Magic Spear | Vida e recursos |
| Summon | Trainer | Dano e crescimento |
| Summon | Frenzy | Frequência e estados |
| Elemental | Electromancy | Raio e munição |
| Elemental | Ice | Controle e estilhaço |
| Elemental | Pyromancy | Queimadura e recuperação |
| Estado | Dark Arts | Maldição e crescimento |
| Último tiro | Holy Arts | Pulso convertido por vida |
| Defesa | Health | Vida e reação |
| Defesa | Shield Boost | Proteção e benefício ativo |
| Defesa | Dodge Boost | Esquiva e mobilidade |
| Defesa | Soul Heart | Reserva e conversão |
| Economia | Magnet XP | Coleta e continuidade |
| Movimento | Speed Boost | Velocidade e manutenção |
| Visão | Vision | Pulso e transmissão |
| Movimento | Aero | Vento e conversão cinética |

Os summons não têm um motor único: o fantasma transmite efeitos por acerto; o dragão cresce com o tempo; a lente exige posicionar projéteis. Crescimento temporal e aumento de frequência não devem virar um multiplicador imediato desde o segundo zero. [Ghost Friend](https://20minutestilldawn.wiki.gg/wiki/Ghost_Friend), [Ghost Wizard](https://20minutestilldawn.wiki.gg/wiki/Ghost_wizard), [Aged Dragon](https://20minutestilldawn.wiki.gg/wiki/Aged_Dragon), [Trained Dragon](https://20minutestilldawn.wiki.gg/wiki/Trained_Dragon).

## Personagens organizados por gatilho

Os 13 registros abaixo descrevem identidade mecânica, sem assumir que todos estejam na mesma versão mobile. [Tabela de personagens](https://20minutestilldawn.wiki.gg/wiki/Characters).

| Personagem | Gatilho dominante | Motor favorecido |
|---|---|---|
| Shana | Rerrolagem | Consistência de montagem |
| Diamond | Reserva alta de vida | Cura e risco controlado |
| Scarlett | Contagem de disparos | Fogo frequente |
| Hina | Ação ativa | Clone e reposicionamento |
| Spark | Acerto de projétil | Descarga frequente |
| Lilith | Morte inimiga | Cascata de espíritos |
| Abby | Ação ativa esvazia munição | Saturação e recarga |
| Yuki | Contagem de disparos | Congelamento recorrente |
| Luna | Recarga | Aglomeração espacial |
| Dasher | Ciclo temporal | Transformação móvel |
| Hastur | Intervalo temporal | Ataque invocado |
| Raven | Acompanhante amaldiçoa | Dano adiado |
| Katana | Recarga concluída | Arma invocada |

Especializações de personagem alteram seu gatilho: Diamond pode converter cura em crescimento; Scarlett pode acelerar ao aplicar fogo; Luna acrescenta efeitos ao buraco negro; Katana parte de recargas para seu summon. O resultado é um circuito, não apenas “mais dano”. [Melhorias de personagem](https://20minutestilldawn.wiki.gg/wiki/Character_Upgrades).

## Armas e sistemas de progressão

| Arma | Propriedade que organiza uma build |
|---|---|
| Revolver | Referência equilibrada |
| Shotgun | Muitos contatos, carregador curto |
| Dual SMGs | Muitos gatilhos de disparo |
| Crossbow | Carga e carregador unitário |
| Flame Cannon | Aplicação contínua de fogo |
| Grenade Launcher | Explosão; risco de autoimpacto |
| Magic Bow | Retorno associado à recarga |
| Batgun | Projéteis perseguidores e escalas híbridas |
| Salvo Knife | Rastreamento favorecido pelo movimento |
| Watering Gun | Ativar entidade por repetidos tiros |
| Cyclone Sword | Dano durante recarga |

O catálogo de armas apresenta 11 entradas e evolução no nível20, escolhendo uma entre três opções da arma. [Armas](https://20minutestilldawn.wiki.gg/wiki/Weapons). A espada transforma tempo de recarga em janela de dano; sua evolução também pode relacionar dano a movimento ou adicionar maldição. [Cyclone Sword](https://20minutestilldawn.wiki.gg/wiki/Cyclone_Sword), [evoluções](https://20minutestilldawn.wiki.gg/wiki/Weapon_Evolutions).

Runas são uma camada anterior à partida. Cadence recompensa uma sequência de tiros; Ethereal converte mortes em período sem consumo; Dedication favorece uma composição específica de summons. Essas opções podem alterar a frequência do gatilho principal antes da primeira melhoria. [Runas](https://20minutestilldawn.wiki.gg/wiki/Rune).

Tomos são escolhas pós-chefe com vantagens e perdas. Seus eixos incluem poder, cadência, elementos, summons, vida, movimento, imobilidade, ricochete, último tiro e dano extremo com fragilidade extrema. Para adaptar, devemos preservar o custo operacional em vez de importar percentuais. [Tomos](https://20minutestilldawn.wiki.gg/wiki/Tomes).

## As 12 sinergias catalogadas

Estas receitas exigem pré-requisitos e entram como ofertas; não são necessariamente bônus automáticos. A tabela resume suas funções, sem transcrever valores. [Sinergias e requisitos](https://20minutestilldawn.wiki.gg/wiki/Synergies).

| Sinergia | Conversão |
|---|---|
| Death Rounds | Velocidade/perfuração em dano plano |
| Frost Fire | Gelo também aplica fogo |
| Gun Mastery | Combinação balística geral |
| Mini Clip | Menos munição, ciclo eficiente |
| Overload | Fogo mais raio cria explosão |
| Stand your Ground | Imobilidade favorece saturação |
| Summon Mastery | Tiro perde força, summons ganham |
| Death Plague | Morte por maldição propaga estado |
| Generator | Munição recuperada gera cadência |
| Kunoichi | Tempo sem dano sustenta crescimento |
| Sword and Shield | Abates por pulso restauram proteção |
| Titan | Vida e presença física |

O guia da Epic usa Raven como exemplo de conversão do dano da arma em dano adiado, destacando que potência não resolve sobrevivência; mobilidade/esquiva ainda importam. A mesma publicação explica a combinação de Glare com efeitos por acerto. [Guia Epic](https://store.epicgames.com/news/20-minutes-till-dawn-guide-how-to-survive-and-thrive-at-the-highest-difficulties?lang=pl).

## Síntese de design para nosso jogo

Inferências próprias a partir das famílias acima:

1. Definir um evento primário: disparar, acertar, terminar recarga, matar, coletar, sofrer dano, curar, mover ou completar intervalo.
2. Determinar a fonte que produz o evento e seu limite real: carregador, alcance, tempo de recarga, chance, alvo, aquecimento ou necessidade de posição.
3. Escolher uma conversão principal e um apoio defensivo. Uma build deve funcionar antes de adquirir sua última peça.
4. Diferenciar aplicação de estado e dano do estado. “Acertar” não pode iniciar recursão infinita entre raio, explosão, summon e proc secundário.
5. Separar dano de projétil, por disparo, sustentado com recarga, área útil e controle. O dobro de projéteis dispersos não garante o dobro de dano em chefe.
6. Usar a física e a fantasia industrial: drones, sensores, corrosão, capacitores, servos e refrigeração. Novos sistemas precisam de HUD, feedback e contratos de teste.
7. Não tornar todas as builds autossuficientes em dano, cura e mobilidade: cada uma deve ceder algo observável.

## Exploração inicial de dez propostas

Esta tabela registra a exploração inicial, incluindo ideias que não entraram nesta versão. O catálogo implementado está no guia [Dez projetos de build](dez-builds.md) e em builds.js. A família de sensores/pulsos foi implementada na BUILD44, em [Sensores de campo](sensores-de-campo.md). A família de corrosão foi implementada na BUILD43, com regras e dados em [corrosão programada](corrosao-programada.md).

| # | Build | Base proposta | Circuito | Fragilidade a medir |
|---|---|---|---|---|
| 1 | Agulha Antititã | PROT + precisão | Impacto → perfuração → dano de chefe | Intervalo e pressão lateral |
| 2 | Linha de Montagem | PROT + metralhadora | Cadência → quinto disparo → munição | Recarga e dano por bala |
| 3 | Forja Criogênica | Chassi térmico novo + criogênico | Resfriar → queimar → choque térmico | Dois estados precisam coincidir |
| 4 | Rede de Cobre | Chassi elétrico novo + Tesla | Impacto → descarga → alvos ligados | Dano em alvo isolado |
| 5 | Demolição de Campo | BAST + foguetes | Impacto → área → fragmentos controlados | Carregador curto e aproximação |
| 6 | Oficina Ambulante | BAST + arma média | Abates/recarga → reparo → sustentação | Não deve ganhar dano grátis infinito |
| 7 | Câmara Fria | PROT + escopeta | Esvaziar → recarga glacial → reposicionar | Janela sem tiros |
| 8 | Enxame de Sucata | Chassi engenheiro novo + drones | Drone → alvo → manutenção de alcance | Início fraco e limite de unidades |
| 9 | Sentinela de Varredura | Chassi sensor novo + arma leve | Pulso óptico → marca/estado → disparo | Raio curto e frequência limitada |
| 10 | Corredor Cinético | PROT ou chassi móvel + arpão | Mover → carga de servo → avanço/impacto | Errar rota e perder estabilidade |

As dez cobrem bala pesada, bala rápida, híbrido elemental, cadeia elétrica, explosão, vida/cura, recarga, summons, pulso/visão e movimento. Maldição pode virar **corrosão programada** e formar variante da Sentinela; soul hearts podem virar escudo de capacitor. Não é necessário criar toda a combinatória de uma vez para entregar dez motores distintos.

## Contrato de avaliação proposto

Separar dois conjuntos de evidência:

- **Componentes sintéticos:** alvo imóvel e vida conhecida para dano, TTK, queimadura, status, recarga, limites de summons, prioridade de perfuração/ricochete, requisitos e custos. Montar uma build completa é permitido aqui, com o rótulo explícito de laboratório.
- **Partidas reais simuladas:** mesmo cenário e sementes fixas; jogador recebe dano normal; armas e inimigos mantêm números de produção; sem invulnerabilidade de teste, multiplicação artificial de dano ou derrota programada de chefe. Registrar ordem de melhorias e escolhas realmente oferecidas. Falta de oferta conta como falha de montagem ou variante, nunca instalação escondida.

Métricas: duração, morte/vitória, chefes abatidos e tempo desde spawn até abate, dano real por canal, inimigos mortos, congelamento/atordoamento efetivo, dano recebido, cura efetiva sem overheal, distância percorrida, nível atingido, tempo disparando/recargando e picos de entidades. Reportar mediana e faixa por semente, inclusive falhas.

Driver: direção de tiro escolhida por alvo alcançável; movimento por ameaça próxima e zonas de chefe, com coleta oportunista; recarga/avanço apenas quando a regra normal permite. O mesmo driver atende todas as builds. Resultados significam desempenho desse agente automatizado, e não comprovam diversão, dificuldade humana ou qualidade visual. A QA no navegador e o playtest humano permanecem evidências separadas.

Antes dos testes: aguardar design final com IDs/receitas, confirmar que o runtime expõe os estados necessários e congelar um snapshot da configuração por partida. Alterações depois de uma falha exigem repetir as mesmas sementes, sem trocar o cenário para favorecer uma build.
