# Oficina de melhorias do Screwvivors

Abra **CONFIGURAR SKILLS** no menu do jogo. O editor usa o mesmo `index.html?painel=skills` para compartilhar o armazenamento do jogo inclusive ao abrir o ZIP com `file://`. A página `tools/skills-panel/index.html` também funciona em um servidor HTTP da mesma origem; com `file://` ela pode ter armazenamento separado e não é a entrada recomendada.

O painel usa o catálogo real de `../../balance.js` e não contém as melhorias de exemplo do Manus. O layout foi adaptado dos arquivos App.tsx/data.ts/styles.css fornecidos pelo usuário.

- Edições são salvas em `screwvivors.balance.draft.v1` como rascunho local.
- **Aplicar ao jogo** valida e salva em `screwvivors.balance.v1`. Só as próximas partidas usam as mudanças.
- **Exportar** baixa um backup JSON `{ "version": 1, "skills": [...] }`.
- **Importar JSON** valida antes de substituir o rascunho e baixa um backup do rascunho anterior.
- **Restaurar padrão** muda apenas o rascunho e baixa um backup anterior. É preciso aplicar para alterar o jogo.
- As melhorias originais podem ser desativadas/reativadas. Só as personalizadas podem ser excluídas. Referências pendentes impedem aplicar.
- Novas melhorias são efeitos diretos do tipo Normal. Tipo, condição e chassi originais seguem o catálogo. Desbloqueio/requisitos de categorias especiais seguem as regras fixas do jogo.
- A árvore separa normais com/sem requisitos, Gambiarras nos níveis 3/6/9, especialização no nível 10 e recompensas após chefes. Esses grupos de oferta não representam uma sequência temporal rígida. Grupo, árvore, raridade e notas organizam o conteúdo. Raridade não altera chances de sorteio.
- Atributos vêm da lista suportada do runtime. Campos inválidos, ciclos de requisitos e falhas de armazenamento aparecem na tela.

## Build

A distribuição do painel só precisa de `panel.js`, `panel.css`, `index.html` e do `balance.js` na raiz do jogo. Não precisa de Node, internet ou `node_modules` para usar o editor.

Para recompilar as fontes, com Node/npm instalados:

```sh
cd tools/skills-panel
npm ci
npm run build
```

`build.mjs` gera os assets estáticos e inclui React e os ícones no bundle. As fontes usam fontes de sistema locais. `package-lock.json` fixa as dependências.

## Verificação

```sh
npm run build
node --check panel.js
node test-panel.mjs
```

O teste usa o runtime real para conferir o catálogo, validação do rascunho e a renderização da interface. Na revisão visual, conferir desktop/celular, biblioteca/árvore, edição de efeitos, importar inválido, restaurar padrão e aplicar. Comparar uma nova partida com outra já iniciada para conferir o momento da aplicação.
