# Screwvivors — protótipo experimental

Sobrevivência 2D para navegador em HTML/CSS/JavaScript, sem dependências de execução. A [documentação](docs/README.md) distingue decisões aprovadas e propostas. Arte atual é provisória.

## Jogar

No GitHub, use **Code → Download ZIP**, extraia e abra **index.html** no Chrome/Edge/Firefox. O ZIP antigo da pasta downloads não contém as atualizações.

Na garagem, escolha metralhadora ou escopeta e clique em **Sair para a cidade**. Um chassi e um slot disponíveis. A arma não muda durante a tentativa.

- WASD/setas: mover.
- Mouse: mirar.
- Segurar botão esquerdo: atirar.
- P: pausar/continuar.
- Colete núcleos para subir de nível; escolha uma skill ou pule.
- Chefe aos 60 segundos: saia da faixa de investida e evite os disparos laranja.
- Sobreviva por três minutos no teste. A meta final de design é vinte minutos.

Skills somem em cada nova tentativa. Perfuração, explosão e descarga interagem; o HUD informa as combinações. Chefe dá cura e uma melhoria temporária. Não há inventário permanente nem salvamento nesta versão. Repetir configuração preserva somente a escolha da arma dentro da sessão; Voltar à garagem permite mudar antes da próxima tentativa.

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

Testes de lógica cobrem combate e simulação de três minutos; conferência visual e balanceamento no navegador seguem pendentes. [Parâmetros experimentais](docs/game-design.md).
