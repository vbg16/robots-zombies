# Screwvivors — BUILD 35 · desenvolvimento

O download padrão de **Code → Download ZIP** na branch `main` contém o desenvolvimento mais recente enviado ao GitHub. Recursos experimentais estão incluídos. O canal `codex/publico` é separado e ainda é uma candidata histórica, sem aprovação de lançamento atualizada.

Sobrevivência 2D para navegador em HTML/CSS/JavaScript, sem dependências de execução. A [documentação](docs/README.md) distingue decisões aprovadas e propostas. Arte atual é provisória.

## Jogar

No GitHub, use **Code → Download ZIP**, extraia e abra **index.html** no Chrome/Edge/Firefox. O ZIP antigo da pasta downloads não contém as atualizações.

Na garagem, comece com o chassi PROT-0001 e a metralhadora. Use parafusos e peças de chefe para desbloquear os outros equipamentos e clique em **Sair para a cidade**. Cada chassi possui um slot nesta versão. A arma não muda durante a tentativa. Saves antigos mantêm acesso ao equipamento do protótipo.

- WASD/setas: mover.
- Mouse: mirar.
- Segurar botão esquerdo: atirar.
- R: recarregar (recarga automática ao esvaziar). O tempo é proporcional à munição faltante: metade do carregador vazio = metade do tempo.
- P ou Esc: pausar/continuar.
- Espaço: propulsor, somente depois de adquirir a skill (4 s de recarga; sem invulnerabilidade).
- Colete núcleos para subir de nível; escolha uma skill ou pule.
- Nos níveis 3, 6 e 9, escolha uma Gambiarra temporária entre três alternativas, use as teclas 1–3 ou pule. Os efeitos somem na próxima tentativa.
- A faixa de controles permanece visível dentro da arena, inclusive o propulsor depois da skill.
- Zumbis surgem em grupos de quinze distribuídos ao redor do jogador; os grupos chegam em intervalos cada vez menores.
- Arena infinita, sem limite de mundo ou tempo final. A horda fica mais forte e os três chefes voltam em ciclos; ondas comuns continuam mesmo durante os chefes.
- Chefes trazem reforços próprios: CORREDOR, ATIRADOR ou RAJADA, identificados acima do inimigo. O HUD mostra quantos restam e confirma quando as ondas comuns estão pausadas.
- A câmera acompanha o robô pela cidade. Saia das áreas sinalizadas antes dos ataques dos chefes.

Há 36 melhorias únicas em nove árvores: cada raiz abre três evoluções combináveis. Escolhas adquiridas não reaparecem. Benefícios usam multiplicadores e condições, com custos explícitos. As 12 armas têm carregador e recarga próprios, maiores nas armas pesadas; reserva ilimitada neste protótipo. [Árvores, munição e valores experimentais](docs/arvores-e-municao.md). Skills, Gambiarras e Experimentos do Biruta somem em cada nova tentativa. Parafusos coletados e peças de chefe ficam salvos localmente mesmo após a morte; compras desbloqueiam equipamento sem conceder atributos permanentes. Os preços são experimentais e estão documentados em [design do jogo](docs/game-design.md). Perfuração, explosão e descarga interagem; o HUD informa as combinações. Chefes curam e oferecem uma escolha temporária com vantagem e custo. Repetir configuração preserva somente o loadout na sessão; voltar à garagem permite mudar antes da próxima tentativa.

Alternativa com servidor local:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Abra http://127.0.0.1:8000/. Toque/controle não implementados; use teclado e mouse.

## Verificar

```sh
node --check game.js
node tests/combat.cjs
node tests/sprite-animation.cjs
python tests/validate_walk_test.py
```

Os testes Python das ferramentas de arte exigem Pillow. O jogo não exige instalação de pacotes, serviços, chaves ou build.

Testes de lógica cobrem combate, dez minutos sem encerramento forçado, horda crescente e retorno dos chefes. O teste automatizado não substitui a avaliação visual nem o balanceamento com jogadores no navegador. [Parâmetros experimentais](docs/game-design.md) · [Plano de integração e regras contra regressões](docs/plano-integracao-20-minutes-till-dawn.md).

BAST-0002 usa sprite SVG provisório próprio. No perfil novo, o PROT-0001 e a Metralhadora são iniciais; demais armas e o BAST-0002 são desbloqueados na garagem. Saves do protótipo anterior preservam acesso a todo o catálogo. [Catálogo e preços experimentais](docs/game-design.md) · [Prompt de arte dos inimigos](docs/arte/prompt-inimigo-zumbi.md).

## Versões separadas

Esta pasta é o desenvolvimento (`codex/desenvolvimento`). A cópia pública local fica em `../Jogo-publico` (`codex/publico`). Execute `iniciar-desenvolvimento.ps1` para porta 8001 ou `iniciar-publico.ps1` para porta 8002. A base pública inicial é uma candidata histórica, não um lançamento atualizado aprovado. Veja [canais e promoção](docs/canais-e-lancamentos.md) e os estados em `version.json` de cada pasta.

BUILD34: controles iniciais somem após cinco segundos; o comando ESPAÇO aparece junto da arma após adquirir Propulsor. Zumbis comuns chegam de fora da tela correndo e desaceleram perto do robô. Música e efeitos originais usam WebAudio e iniciam após interação; ajuste MÚSICA/EFEITOS na garagem, com zero para silenciar. Verificação de áudio: node tests/audio.cjs.

BUILD35: ondas de15, intervalo6,4→1,5s; seguem durante chefes. Zumbis vivos distantes permanecem no mundo e no minimapa (borda para distantes, marcador dourado para chefe). Aproximação reduzida para210px/s e normal a320px. Sucateiro mantém distância180–240px; atiradores carregam armas visíveis. A população viva pode crescer: avaliar desempenho em partidas longas.
