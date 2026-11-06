# Baús de chefe — BUILD53

O chefe deixa um baú dourado no local da derrota. Aproxime o robô a menos de40px para abrir e escolher uma entre atétrês peças raras. O mapa marca baús distantes na borda. Eles não expiram e não são atraídos pelo ímã.

Conforme esclarecido pelo jogador, o efeito dura **somente até o fim da partida**. Não concede atributos permanentes na garagem. A peça antiga de fabricação continua salva na derrota do chefe; a cura de20 (40 com Caça-Titãs) também continua independente do baú. Assim, a recompensa nova não substitui recursos de desbloqueio já conquistados.

## Hardware exclusivo

| Peça | Build elegível | Ganho |
|---|---|---|
| Câmara de Combustão | Fogo adquirido ou arma incendiária | Queimadura +50% |
| Cristal de Estase | Frio adquirido ou arma criogênica | Duração do frio de impacto +50% |
| Capacitor de Tempestade | Descarga adquirida ou arma elétrica | Dano elétrico +40% |
| Baia de Comando | Drone ativo | Dano dos drones +50%, alcance +20% |
| Matriz de Caça | Sensor adquirido | Dano do sensor +50%, intervalo ×0,8 |
| Rolamento de Cerâmica | Rotores adquiridos | Dano dos rotores +50%, período ×0,8 |
| Cápsula Reagente | Corrosão adquirida | Novas cargas: dano +50%, prazo ×0,75 |
| Culatra Antititã | Canhão de precisão ou arpão equipados | Dano dessas armas +40% |
| Coletor de Demolição | Foguetes ou granadas equipados | Dano dessas armas +40% |
| Servo de Alimentação | Qualquer arma | Tempo de recarga ×0,75 |
| Coração do Reator | Qualquer build | Integridade máxima +30, cura até30 |
| Núcleo de Potência | Qualquer arma | Dano direto +25% |

Peças específicas são priorizadas na oferta quando a arma ou o suporte correspondente já existe. Armas auxiliares também contam para a elegibilidade. As três opções são distintas; cada peça pode ser instalada uma única vez na tentativa. Não há penalidade de atributo. Instalar não repõe munição nem conclui uma recarga em andamento.

O catálogo comum/painel conserva82 entradas. As12 peças de chefe são um catálogo próprio, consultável no compêndio (94 entradas no total), como as reforjas têm catálogo próprio. Elas não aparecem no level-up e ainda não são editáveis no painel de skills. Depois de esgotar as peças elegíveis daquela build, o baú oferece um Experimento do Biruta anterior, com seu custo descrito; após esgotar também esses experimentos, oferece módulo comum.

## Integridade da partida

A oferta pausa a simulação e limpa movimento/disparo. Teclas1–3 instalam; R recusa. Recusar consome aquele baú, sem retirar cura ou peça de fabricação. Outros baús permanecem no chão; uma segunda coleta e o level-up aguardam a resolução da oferta atual. Tokens de oferta impedem callbacks antigos de instalar peças após reset ou outra escolha.

Corrosão já armada conserva seu snapshot; bônus vale para novas cargas. Buffs de arma seletivos não alteram outros espaços nem projéteis já emitidos. Queimaduras já aplicadas não são reescritas pela peça; novos impactos usam o bônus. Os limites existentes de suportes e dano secundário continuam valendo.

## Verificação

`tests/boss-relics.cjs` cobre as12 peças, elegibilidade, equipamentos auxiliares, buffs seletivos, munição/recarga/perfil, snapshot, três chefes, fronteira de coleta, pausa, recusa, callbacks antigos, baús simultâneos, morte/reset e minimapa. `tests/boss-relics-browser.cjs` verifica Chrome offline em1280×900 e390×844, teclas e rolagem até a última ação, sem transbordamento ou erros.

`docs/bot-playtest-build53.json` preserva partidas Chrome completas e uma morte do bot simples. Cada execução inclui seu próprio hash: candidatas com hashes diferentes não são apresentadas como pareamento. O driver11 busca baús pela rota normal, sem teleporte, imunidade ou dano adicional.

O desenho dos tiros agora usa a arma guardada no projétil, corrigindo armas auxiliares que pareciam disparar a arma principal. Laser, fogo, gelo e descarga ganharam formas distintas; crítico tem marcador dourado. `tests/projectile-visuals.cjs` protege os12 tipos, fallback, dados físicos imutáveis e ausência de consumo de RNG no desenho. A prancha de inspeção está em images/build53-projectiles.png.

Na fonte final da BUILD53, `build53-progression.json` registra as dez receitas com a semente20261106, driver11 e20minutos de janela: nove cumpriram sobrevivência e ao menos três chefes; Caçador Criogênico morreu aos115,2s, nível5, antes de obter o núcleo de dano ou coletar seu baú. A falha permanece no relatório. Não é um pareamento com os20resultados da BUILD52 (driver10 e outras sementes), nem prova de causa isolada. O equilíbrio do início do Criogênico continua pendente. Nenhum erro de execução ou valor não finito foi registrado nas dez tentativas, e os hashes do runtime congelado correspondem à fonte entregue.
