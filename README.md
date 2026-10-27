# Robots / Zombies

O projeto está sendo definido como **Screwvivors**. Consulte a [direção e documentação do jogo](docs/README.md) para as regras aprovadas, o conteúdo planejado e as decisões pendentes. Este protótipo experimental ainda não representa todas essas regras.

Protótipo de sobrevivência Bullet Heaven para navegador, sem dependências externas.

## Executar

Na pasta do repositório:

```sh
python3 -m http.server 8000 --bind 0.0.0.0
```

Abra o servidor no navegador. WASD ou setas movem o robô; em telas de toque, segure o dedo na arena para guiar a unidade. Os tiros são automáticos. P pausa. Colete núcleos azuis e escolha melhorias ao subir de nível. Sobreviva por três minutos para vencer.

## Verificar

```sh
node --check game.js
curl --fail http://127.0.0.1:8000/
```

Não há build, serviços externos, chaves de API ou pacotes para instalar.
