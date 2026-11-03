# Áudio: finalização da paleta e verificação

## O que mudou

A trilha procedural mantém o synthwave suave e atmosférico escolhido: pads senoidais, baixo triangular, melodia espaçada e percussão discreta. O arranjo agora alterna quatro frases harmônicas, varia a melodia e reserva uma seção com menos notas. Os pads têm caudas maiores. Menu, garagem e combate continuam com arranjos e andamento próprios (72, 78 e 90 BPM) e transição de volume entre cenas.

As 12 armas têm ataques sonoros próprios. Rajadas, balas e armas de energia usam a mesma trava de repetição de 60 ms; trocar o identificador da arma não contorna essa trava. Foram acrescentados sons curtos para sensores, corrosão, drones, escudos, reparos, conclusão de recarga e eventos de chefe.

Todo o material é sintetizado no navegador: não há downloads de música, dependências externas de execução ou gravações de terceiros. O gerador de ruído tem estado próprio e não usa o RNG de combate.

## Contrato de integração

`ScrewAudio.play(nome)` continua aceitando os eventos antigos. Os nomes novos abaixo só produzem áudio após `unlock()` por gesto do usuário e respeitam o volume de efeitos. Nomes inválidos são ignorados.

| Chamada | Evento sugerido | Intervalo mínimo |
| --- | --- | --- |
| `shot-<weaponId>` | Depois de emitir projéteis com sucesso | 60 ms, compartilhado entre armas |
| `sensor` | Emissão efetiva de pulso do sensor | 350 ms |
| `corrosion` | Detonação corrosiva | 140 ms |
| `drone` | Salva com alvo vivo, uma vez por salva | 120 ms |
| `shield` | Escudo capacitivo absorve dano | 200 ms |
| `shieldBreak` | Escudo do policial se rompe | 300 ms |
| `repair` | Reparo recupera vida de fato | 300 ms |
| `reloadReady` | Recarga termina | 150 ms |
| `bossAttack` | Ataque do chefe acontece após aviso | 300 ms |
| `bossDefeat` | Chefe morre | 1 s |

Identificadores de arma: `machine`, `shotgun`, `burst`, `sniper`, `laser`, `flame`, `cryo`, `rocket`, `grenade`, `tesla`, `disc`, `harpoon`. O antigo `shot` continua disponível.

Para rajadas agendadas, a emissão bem-sucedida de projéteis é o ponto adequado para `shot-<weaponId>`. A chamada antiga no início do disparo deve ser removida quando esse ponto for conectado, evitando duplicar o primeiro som ou tocar um tiro cancelado. Corrosão simultânea é limitada pelo próprio módulo; não é necessário tocar um som por inimigo atingido. Morte de chefe e aparição continuam eventos distintos (`bossDefeat` e `boss`).

A integração principal conectou esses eventos em `game.js`. Os tiros são chamados após a emissão efetiva, incluindo cada rodada da rajada; a chamada antiga foi removida. Ataques de chefe são chamados nas cinco transições de aviso para execução. O teste de integração abaixo verifica essas chamadas usando as funções reais do jogo.

## Regras para evitar regressões

- Criar somente um AudioContext, a partir de gesto do usuário; desbloqueios repetidos não criam contextos novos.
- A navegação rápida conserva somente a última cena de destino. Repetir a mesma cena não reinicia a música.
- Mute interrompe as vozes existentes e impede novos sons. A transição de cena respeita esse estado.
- Ao sair da música, liberar as vozes de pads, baixo e melodia. Não iniciar outro relógio ou scheduler paralelo.
- Manter limites de 32 vozes por grupo e impedir nova emissão de efeito com 24 vozes ativas.
- Não usar `Math.random()` nem consumir a sequência aleatória do jogo.
- Preservar `shot` e os eventos anteriores para compatibilidade com a integração existente.

`getState()` expõe `musicVoices` e `effectVoices` para diagnóstico, além dos estados de volume, cena e desbloqueio já existentes.

## Evidências verificadas

Comandos executados: `node --check audio.js`, `node tests/audio.cjs`, `node tests/audio-gameplay.cjs` e `git diff --check -- audio.js tests/audio.cjs tests/audio-gameplay.cjs docs/audio-finalizacao.md`.

Os testes abrangem gesto inicial, contexto único, ausência de agendamento duplicado, navegação rápida, pause, mute, limitação de repetição, nomes inválidos, emissão dos 21 eventos novos/perfis, assinatura tonal distinta das 12 armas e RNG independente. Um modelo de relógio com expiração real das vozes agenda 110 segundos de combate: os pads se sobrepõem sem atingir o teto de vozes e são liberados na saída da cena.

`tests/audio-gameplay.cjs` reutiliza somente o fixture DOM/VM no prefixo de `tests/combat.cjs`, sem executar sua suíte inteira. Um recorder em `window.ScrewAudio.play` verifica chamadas reais do jogo: as 12 armas, três rodadas por rajada, ausência de tiro extra ao soltar o botão, durante recarga ou ao atingir o limite de projéteis; cura efetiva sem som em cura zero, inválida ou excedente; conclusão única da recarga; pulso de sensor, detonação corrosiva, drone com alvo e sem duplicação no arco; absorção e ruptura de escudo; cinco ataques de chefe após aviso e morte única do chefe. Também verifica que `tick` pausado congela esses eventos e que menu, garagem, configuração, combate e pausa selecionam a cena musical correta. Esse recorder comprova a ligação dos eventos; a renderização offline separada comprova o sinal gerado pelo módulo.

Também foi renderizado sinal real por `OfflineAudioContext` do Chrome, estéreo PCM de 16 bits a 24 kHz. O adaptador usa tempo de agendamento controlado e preserva a conexão do grafo até a renderização offline. Isso verifica o sinal gerado e seus picos; não representa escuta humana nem avaliação subjetiva da composição.

| Prévia | Duração | Pico absoluto (0–1) | RMS | Máximo de vozes |
| --- | ---: | ---: | ---: | ---: |
| Menu | 32 s | 0,048262 | 0,005114 | 11 |
| Garagem | 32 s | 0,051142 | 0,005061 | 9 |
| Combate | 32 s | 0,061818 | 0,006885 | 10 |
| Efeitos, 32 eventos espaçados | 31 s | 0,171857 | 0,007158 | 4 |

Todas as prévias contêm sinal, sem clipping digital. O RMS dos efeitos inclui os intervalos de silêncio entre eventos. Os números são da prévia em volumes padrão; não medem o mix da partida inteira nem substituem teste de volume no equipamento do jogador.

Artefatos locais, ignorados pelo Git: `outputs/audio-review/menu.wav`, `garage.wav`, `combat.wav`, `effects.wav`, `measurements.json` e `render.cjs`. O renderizador pode ser reexecutado com Playwright disponível no `NODE_PATH`; usa o Chrome instalado no computador e não chama serviços pagos. `AUDIO_PREVIEW_SCENES=effects` limita a renderização à prévia de efeitos, mantendo as demais medições salvas.
