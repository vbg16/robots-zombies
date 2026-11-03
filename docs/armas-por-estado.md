# Estado independente de arma — preparação de múltiplos espaços

Etapa interna após BUILD50. A garagem continua oferecendo uma arma. Este refactor prepara o combate; ainda não entrega equipamento simultâneo ao jogador nem constitui uma nova versão estável publicada.

Cada estado reúne arma, dano, cadência, munição, capacidade, progresso de recarga, fila de rajada, contagem de disparos, recuo e reforja. `fireWeapon`, `emitProjectiles`, `tickWeaponFire`, `tickWeaponReload` e funções de estatística recebem explicitamente o estado da arma. Não substituem temporariamente `player` ou `runWeapon` para disparar outra arma.

Os campos históricos do jogador são aliases do primeiro estado, preservando painel, diagnóstico e comportamento atual. `shot`, `burstQueue` e `runWeapon` permanecem pontes da arma principal para os consumidores existentes. Estados adicionais possuem seus próprios valores. Pausa congela a lista inteira; limpar entrada elimina todas as rajadas; reset cria um estado novo e descarta os anteriores.

`installWeaponEvolution` modifica somente a arma recebida. Projéteis emitidos conservam o objeto imutável da arma e os traços de reforja capturados na emissão. Os aprimoramentos executam seu callback compartilhado uma única vez; `ScrewBalance.applyWeapon` aplica apenas os atributos numéricos de arma aos demais estados. Vida, velocidade, armadura, suportes e efeitos condicionais não são multiplicados pela quantidade de armas. Edições aditivas são aplicadas sobre a base de cada arma, sem copiar a razão do dano da principal. O catálogo e a revisão5 permanecem iguais.

## Evidência

- `tests/weapon-state.cjs`: três estados, emissões, munição, recargas parciais, rajadas, cadências, atributos, snapshots, pausa, entrada e reset independentes.
- `tests/weapon-state-balance.cjs`:82 entradas do catálogo preservam os campos compartilhados; módulos reais e reforja local; edições aditivas e limites aplicados por arma. As fixtures devem salvar a configuração com sucesso antes de usá-la.
- `tools/compare-weapon-state.cjs`:48 mundos comparados com game.js congelado do commit e07e900,12 armas × base/módulos/duas reforjas,240 passos por mundo. Estado completo de jogador, inimigos, projéteis, efeitos, recursos, fila de rajada e próximos10 números aleatórios coincide. O comparador usa callbacks originais, sem carregar o painel; o teste de balanceamento acima cobre a API real de configuração.
- [Hashes e casos diferenciais](weapon-state-equivalence.json). A fixture instala módulos/reforjas, usa HP elevado e imunidade para reter o cenário; não prova progressão natural ou equilíbrio.

Para reproduzir o comparador, congele game.js do commit e07e900 em `outputs/performance/build50-weapon-state/game.js` ou indique `WEAPON_STATE_BASELINE`. O candidato é o game.js atual. O relatório completo é gerado em `outputs/performance/weapon-state-equivalence.json`.

## Integração ainda necessária

Expor armações avançadas e seleção das armas na garagem, respeitando desbloqueios; congelar o conjunto no início da tentativa. Definir os custos explícitos das armações antes de medir equilíbrio. Integrar reforjas por espaço, recarga manual do conjunto, HUD e desenho de cada arma, origem dos efeitos e reposição de munição, bem como o limite compartilhado de projéteis. Verificar combinações e snapshots num navegador real. Depois reavaliar as dez builds e preparar uma versão estável; não promover o ramo público sem aprovação.
