# Robots / Zombies

O projeto está sendo definido como **Screwvivors**. Consulte a [direção e documentação do jogo](docs/README.md) para as regras aprovadas, o conteúdo planejado e as decisões pendentes. Este protótipo experimental ainda não representa todas essas regras.

Protótipo de sobrevivência Bullet Heaven para navegador, sem dependências externas.

## Executar

Na pasta do repositório:

```sh
python3 -m http.server 8000 --bind 0.0.0.0
```

Abra o servidor no navegador. WASD ou setas movem o robô. Mire com o mouse e segure o botão esquerdo para atirar; solte para parar. Esta versão experimental requer teclado e mouse; toque não está implementado. P pausa. Colete núcleos azuis e escolha melhorias ao subir de nível. Sobreviva por três minutos para vencer.

## Verificar

```sh
node --check game.js
node tests/combat.cjs
curl --fail http://127.0.0.1:8000/
```

Não há build, serviços externos, chaves de API ou pacotes para instalar.

## Combate experimental — 27/10/2026

Disparo manual e mira livre implementados. Pausa, perda de foco e escolhas de melhoria interrompem os comandos para evitar tiros presos. A sessão de três minutos serve para testes; a meta de design continua sendo vinte minutos. Arma, atributos e melhorias atuais são provisórios, sem definir o catálogo final. O ZIP em downloads ainda corresponde à versão anterior; para este combate use os arquivos atuais do repositório.
