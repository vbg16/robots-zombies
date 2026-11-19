# Mapa do repositório

| Local | Conteúdo e finalidade |
|---|---|
| `index.html`, `*.js`, `*.css` na raiz | Jogo offline, HUD, áudio, animações e catálogos. Os caminhos permanecem estáveis para abrir por `file://`. |
| `assets/` | Arte, sprites, ícones e arquivos auxiliares do jogo. |
| `tools/skills-panel/` | Editor de skills: fontes e bundle usado no jogo. |
| `tools/` | Empacotamento, bot, verificadores e ferramentas de autoria. |
| `tests/` | Fixtures e verificadores. Resultados sintéticos não equivalem a partidas naturais. |
| `docs/` | Contrato atual, especificações, decisões, histórico de verificações e critérios de conclusão. |
| `docs/data/` | Evidências compactadas com fontes e resultados preservados. Não são dependências do jogo. |
| `downloads/historico/` | ZIP legado preservado para rastreabilidade. Não baixar para jogar a versão atual. |
| `.github/` | CI, formulários de Issues, modelo de PR e apresentação do repositório. |
| `outputs/` | Pacotes, relatórios e capturas locais; ignorados pelo Git. |

## Onde procurar

- **Quero jogar:** [Releases de desenvolvimento](https://github.com/vbg16/robots-zombies/releases).
- **Quero entender as regras atuais:** [contrato](contrato-atual.md).
- **Quero reconstruir o jogo:** [especificação mestre e casos de teste](SCREWVIVORS-ESPECIFICACAO-E-TESTES.md).
- **Quero saber o que falta:** [meta de conclusão](META-DE-CONCLUSAO.md) e [disposição dos sistemas](disposicao-sistemas.md).
- **Quero conferir uma versão:** [verificação BUILD68](build68-verificacao.md) e seus resumos/arquivos de evidência.
- **Quero contribuir:** [guia de trabalho](../CONTRIBUTING.md).
- **Quero consultar versões antigas:** [histórico](../CHANGELOG.md).

O ZIP do jogo nas Releases inclui runtime e editor. O ZIP de código da `main` inclui também fontes, testes e documentação. Uma pré-release de desenvolvimento não promove a branch pública nem aprova os gates finais.
