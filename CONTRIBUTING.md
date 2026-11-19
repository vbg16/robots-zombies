# Trabalhar no Screwvivors

O jogo roda diretamente em `index.html`. A interface e a documentação do projeto estão em português. Node.js 24 é usado nas verificações do motor; Python 3 é usado para gerar o pacote. O jogo distribuído não exige essas ferramentas.

## Começar

```sh
git clone https://github.com/vbg16/robots-zombies.git
cd robots-zombies
git switch codex/desenvolvimento
git switch -c codex/nome-da-melhoria
```

Consulte primeiro o [contrato vigente](docs/contrato-atual.md), a [meta de conclusão](docs/META-DE-CONCLUSAO.md) e o [mapa do repositório](docs/estrutura-do-repositorio.md). Abra um PR para discutir uma mudança e registre os testes executados. Não inclua `outputs/`, dependências instaladas ou saves pessoais.

## Verificações rápidas

Execute da raiz do repositório:

```sh
node --check game.js
node tools/check-release.cjs
node tools/check-specification.cjs
node tests/incursion.cjs
node tests/balance-panel.cjs
node tests/shield-status.cjs
```

O [workflow do GitHub](.github/workflows/verify.yml) documenta o conjunto automatizado. Ele roda nos pushes à `main`, nos PRs e por acionamento manual. Esses checks não substituem testes das áreas alteradas, partidas naturais, avaliação visual ou medições de hardware.

Os testes de navegador usam Playwright e Chrome. Para preparar o runtime do bot:

```sh
npm install --prefix tools/bot-runtime playwright
node tests/playtest-bot.cjs
```

Veja [bot e métodos de teste](docs/bot-de-testes.md). Alguns verificadores de navegador ainda usam caminhos locais registrados nas suas evidências; não alegue portabilidade ou execução sem conferir o ambiente.

## Empacotar uma revisão

```sh
python tools/package-game.py --ref HEAD --output outputs/releases/Screwvivors-jogo.zip
```

O empacotador lê somente arquivos do commit informado, inclui o jogo, editor e assets e verifica CRC, comprimento e SHA-256 de cada arquivo. Não inclui mudanças locais ainda sem commit. Use outro caminho para repetir um ensaio, preservando o pacote anterior. Extraia o ZIP em uma pasta nova e teste sem internet antes de publicá-lo. O `.sha256` ao lado do ZIP identifica seu conteúdo.

## Regras de entrega

- `main` acompanha o desenvolvimento enviado e alimenta **Code → Download ZIP**.
- `codex/desenvolvimento` recebe o mesmo commit verificado da `main` nas entregas coordenadas.
- `codex/publico` é uma candidata histórica separada; exige a aprovação do criador prevista no [contrato de canais](docs/canais-e-lancamentos.md).
- Releases de desenvolvimento são marcadas como **pré-lançamento**. Não usar `v1.0` ou indicar jogo concluído enquanto os gates estiverem abertos.
- Alterar física, dano, ofertas, receitas ou piloto exige refazer os ensaios afetados. Não juntar resultados de fontes diferentes como se fossem uma única matriz.

## Relatar problemas

Use os [formulários de Issues](https://github.com/vbg16/robots-zombies/issues/new/choose) para bug, balanceamento ou melhoria. Informe BUILD, plataforma e passos reproduzíveis. A lista de [prioridades P0–P3](docs/META-DE-CONCLUSAO.md) orienta a triagem; só atribua aprovação a um teste realmente executado.
