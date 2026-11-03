# Contrato vigente — Screwvivors BUILD 46

Este documento e o código atual prevalecem sobre descrições históricas das entregas anteriores. O plano de integração mantém o histórico para rastrear decisões; regras antigas de teto de inimigos, quatro zumbis por onda, pausa da horda em chefe ou uma renovação por tentativa não estão vigentes.

| Área | Regra que deve permanecer | Evidência automatizada |
|---|---|---|
| Identidade | Gato piloto, robôs, cidade industrial do Dr. Biruta; assets próprios e interface ciano. Não copiar conteúdo da referência. | Inspeção de assets e QA visual; testes de identidade em combat.cjs. |
| Arena | Sem bordas, vitória cronometrada ou encerramento aos 20 minutos. | combat.cjs: movimento sem limites e cenário controlado de 25 minutos. |
| Controle | Mover, mirar e disparar manualmente. ESPAÇO exige skill; avanço não concede invulnerabilidade. | combat.cjs: emissão, liberação, foco, movimento e avanço. |
| Dano recebido | Empurrão de 48 px para longe da fonte; direção de fallback. | combat.cjs: empurrões opostos e fontes tipadas. |
| Horda | Ondas de 15, círculo fora da tela, intervalo 6,4→1,5 s; continuam durante chefes. Vivos distantes não são descartados nem limitados por um teto artificial. | combat.cjs: ondas, minimapa e fuga sem disparar. |
| Policiais | Só após derrotar o segundo chefe: cinco dos 15, alternando rifle/escudo. Escudo 100 absorve integralmente o golpe de quebra. Só o sobrevivente que perdeu o escudo passa a parar, mirar e correr até 240 px numa direção fixa. Sem aceleração de aproximação nos comuns. | combat.cjs, build-mechanics.cjs e weapon-evolution.cjs. |
| Chefes | Três identidades recorrentes e seus lacaios; Sucateiro acompanha e mantém distância. Peça única salva, cura até 20 (40 com Caça-Titãs), escolha temporária. A oferta pausa a simulação; a luta não pausa novas ondas. | combat.cjs: agenda, ataques, recompensas, minions e repetição. |
| Perfil | Parafusos coletados e peças conquistadas permanecem ao morrer. Sem bônus permanentes de atributo. Compras verificam saldo/peça e devolvem recursos em falha de gravação. | combat.cjs: compras, saves, migração e morte. |
| Equipamento | Seis chassis e 12 armas, um slot no protótipo. Escolha na garagem, arma e chassi fixos durante combate. Novos chassis não são concedidos pela migração de perfil antigo. | combat.cjs, build-mechanics.cjs e Chrome. |
| Progressão | XP inicial 6, crescimento ×1,2, coleta inicial 95. Catálogo de 78 aprimoramentos: 48 normais, seis gambiarras, seis experimentos e 18 especializações. | balance-panel.cjs e build-mechanics.cjs. |
| Ofertas | Gambiarras nos níveis 3/6/9; especialização do chassi no nível 10. Uma renovação por nível normal; renovar não recarrega a própria carga. Reforja no nível 20. | combat.cjs, build-mechanics.cjs e weapon-evolution.cjs. |
| Reforja | Duas opções próprias de cada arma, escolher uma ou recusar. Substitui o módulo do nível 20. Não troca/funde arma, repõe munição, termina recarga ou modifica projéteis já emitidos. Não volta após recusa; some ao reiniciar. | weapon-evolution.cjs: 24 opções, estados, callbacks, projéteis e reset. |
| Construção de build | Dez receitas recomendadas; guia não concede equipamento, skills, atributos nem altera sorteios. | builds-balance.cjs, Chrome dos guias e weapon-evolution-browser.cjs. |
| Cura e drones | Cura efetiva ativa protocolos; recarga parcial cura proporcionalmente. Até três drones, sem cadeia recursiva de procs. Célula verde a cada 25 abates precisa ser coletada e não vale parafusos. | build-mechanics.cjs. |
| Painel | 78 skills editáveis; configuração só nas próximas tentativas. Preservar rascunhos/efeitos legados, migrar IDs conflitantes com suas referências e não repetir a migração textual. As 24 reforjas são catálogo próprio de arma, consultável na garagem, e ainda não são editáveis no painel. | balance-panel.cjs, balance-migration.cjs e testes do editor. |
| Corrosão | Uma carga por alvo, sem renovar/acumular; origem em bala, respingo de uma geração para dois vizinhos; escudos bloqueiam aplicação. Cura, explosões, drones e raios não semeiam cargas. Prazo e dano capturados na aplicação; pausa/morte/reset interrompem a tentativa. | corrosion.cjs, corrosion-balance.cjs e Chrome. |
| Sensores | Pulso adquirido, 3s/raio170/35% da base direta, sem projétil ou munição. Relé só fogo/frio; exposição2s amplia apenas balas em25%. Escudos bloqueiam estados. Sem skill, não percorre horda; pausa/reset preservados. HUD móvel comporta seis timers. | sensors.cjs, sensors-browser.cjs e sensors-balance.cjs. |
| Arma empunhada |12modelos próprios em Canvas, mira manual, mãos, recuo e gesto de recarga. Relógio visual só no tick; pausa congela e tiro cancelado não recua. Sem alterar munição/dano/trajetórias. | player-weapons.cjs e Chrome12armas/mira esquerda-direita. |
| Animação PROT | Atlas original32quadros, quatro direções, pivô por quadro e pés em y+28; simulação controla o relógio e pausa congela. Falhas de imagem/helper/manifesto mantêm o desenho estático. Hitbox e atributos preservados. | sprite-animation.cjs, prot-animation.cjs e Chrome HTTP/file com três fallbacks. |
| Áudio | Synthwave suave nas cenas;12 timbres e eventos reais de reparo, sensores, corrosão, drones, escudos, recarga e chefes. Sem RNG de combate; gesto inicial, mute e limites de vozes preservados. | audio.cjs, audio-gameplay.cjs e render offline de sinal. |
| Consultas de área | Índice temporário apenas na fase de projéteis, invalidação antes do movimento, ordem original dos alvos e desempates estáveis. Não descartar nem limitar vivos. | spatial-runtime.cjs:18mundos iguais à busca linear e ordenação integral, inclusive efeitos e sequência aleatória. |
| Pausa/entrada | Ofertas e pausa congelam simulação; callbacks antigos não aplicam escolhas. Retorno limpa teclas, disparo e rajadas pendentes. | combat.cjs e weapon-evolution.cjs. |
| Canais | main acompanha desenvolvimento para o ZIP. codex/publico é independente; publicApproved continua false até aprovação real. | version.json, git ls-remote e docs/canais-e-lancamentos.md. |

Os números novos são experimentais. Testar funcionamento não aprova balanceamento ou qualidade humana. A bancada instala pacotes explicitamente; a avaliação de progressão não pode ganhar atributos escondidos, invulnerabilidade, morte programada de chefe ou remoção de inimigos vivos. Guardar resultados negativos e identificar sementes, fontes e driver. Não reduzir a meta de avaliação depois de observar falhas.

## Pendências do objetivo de integração

A meta geral permanece ativa. Evolução de arma deixa de ser pendência de implementação na BUILD 41, mas seu balanceamento exige avaliação mais ampla. A [reavaliação das dez builds da BUILD 41](reavaliacao-build41.md) foi concluída, preservando falhas. A BUILD 42 revisou a [Lança de Fuga](ajuste-lanca-de-fuga.md) por comparação de seis sementes. Continuam pendentes a melhoria das demais receitas frágeis, balanceamento de corrosão/sensores, aprofundamento de suportes invocados e a especificação de equipamentos avançados com múltiplos slots. Corrosão foi implementada na BUILD43 e sensores na BUILD44; suportes adicionais e multisslots ainda não foram implementados.

Não importar vitória cronometrada, retenção de skills após morte, runas com atributos permanentes ou fusão de armas: entram em conflito com decisões explícitas do criador. Ranking, nuvem e conquistas precisam de etapa própria de plataforma e integridade; o protótipo permanece local.

## Regra de ajuste — BUILD 42

Experimentar receitas por JSON isolado antes de mudar o catálogo do jogo. Comparações exigem mundo, configuração, driver, janela e sementes compatíveis; guardar todas as hipóteses e falhas. Definir critério de adoção experimental antes de inspecionar resultados completos e verificar também sorteios separados da exploração. Uma melhora relativa não transforma uma morte antes do limite em aprovação da meta de 20 minutos. O painel de 70 skills, preços e atributos globais permaneceram iguais nesta etapa.

## Regra de corrosão e migração — BUILD 43

Cargas capturam dano/prazo e têm uma geração de respingo, sem renovar por impacto ou gerar novas cargas por proc secundário. A referência da carga é capturada no início do tick; filhos só envelhecem no próximo. Escudo absorve inclusive o golpe que o quebra, sem marcar corpo. Remover lacaios antes de avaliar respingo do chefe. Mudanças no painel só no próximo reset, sem reescrever cargas em andamento. catalogRevision3 preserva configurações 1/2 e renomeia colisões conforme a revisão de origem, incluindo condições vazias. Cartas padrão usam texto de ganho/custo autoral; números editados permanecem identificados. A nova raiz altera sorteios: resultados antigos não aprovam automaticamente o pool novo.

## Regra de sensores — BUILD 44

Relé compartilha somente fogo/frio, preservando o caminho original de impacto da arma. Sensor não cria projéteis, gasta munição, consome Carga de Reparo ou avança crítico. Exposição só amplifica source=bullet; não entra na captura de corrosão. Golpe de quebra do escudo não aplica estados ao corpo. Pulso respeita todos os corpos no círculo, sem teto artificial; sem backlog ao retomar. Cadastro de novas skills precisa declarar sua primeira revisão em catalogIntroductions, preservando colisões de IDs antigos mesmo com condição vazia. Primeira carga de um sensor editado usa os valores do snapshot. Atualizações do painel continuam só no próximo reset.
