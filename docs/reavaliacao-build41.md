# Reavaliação completa — BUILD 41

Uma execução com fontes congelados, dez receitas e duas sementes por receita. **7/20** tentativas sobreviveram 20 minutos; **6/20** também derrotaram ao menos três chefes. A meta é a mesma da avaliação anterior. Não há aprovação automática de balanceamento ou promoção ao público.

Cada célula de semente mostra **tempo / chefes derrotados**. Núcleo é a aquisição dos quatro módulos centrais; Reforja exige chegar ao nível 20 e aceitar a opção realmente oferecida.

| Receita da BUILD 41 | 20261102 | 20261103 | Núcleo | Reforja | Meta completa |
|---|---|---|---|---|---|
| Agulha Antititã | 13:48 / 4 | 12:03 / 4 | 2/2 | 0/2 | 0/2 |
| Tempestade Balística | 20:00 / 2 | 20:00 / 5 | 2/2 | 2/2 | 1/2 |
| Escopeta de Ricochetes | 20:00 / 4 | 10:16 / 2 | 2/2 | 1/2 | 1/2 |
| Caçador Criogênico | 12:17 / 4 | 5:43 / 1 | 1/2 | 0/2 | 0/2 |
| Forja Criogênica | 11:57 / 2 | 12:07 / 1 | 2/2 | 2/2 | 0/2 |
| Rede de Plasma | 13:46 / 1 | 7:09 / 1 | 2/2 | 1/2 | 0/2 |
| Demolição de Campo | 20:00 / 4 | 20:00 / 5 | 2/2 | 2/2 | 2/2 |
| Oficina Viva | 16:13 / 1 | 19:17 / 1 | 2/2 | 1/2 | 0/2 |
| Enxame de Sucata | 20:00 / 4 | 20:00 / 7 | 2/2 | 2/2 | 2/2 |
| Lança de Fuga | 5:34 / 1 | 8:33 / 2 | 0/2 | 0/2 | 0/2 |

## Escopo da evidência

Player, arma, inimigos, XP e escolhas usam as regras normais. Equipamentos são desbloqueados apenas no perfil isolado do teste para poder selecionar cada receita. Não há invulnerabilidade, atributos extras, upgrades instalados escondidos, remoção de inimigos vivos ou chefes derrotados por roteiro. Física a 20 Hz e decisões do mesmo driver 9 a 5 Hz. Desenho/HUD omitidos: os resultados não medem FPS, habilidade humana ou diversão.

O driver escolhe a reforja recomendada quando chega ao nível 20. A BUILD 41 substitui o módulo normal desse nível pela reforja; por isso a comparação com a BUILD 40 não isola apenas o benefício da evolução. Para comparar novas receitas dentro da mesma BUILD 41, manter o mundo, o driver e as sementes iguais e registrar também as falhas.

A tabela é da receita original da BUILD 41, congelada antes de testar alternativas. Uma mudança posterior no guia não altera retroativamente estes resultados. Os dois sorteios são amostra de desenvolvimento, não estimativa de taxa de vitória.

## Dados e reprodução

[Dados brutos e hashes dos fontes](build41-full-progression.json), incluindo todas as escolhas, dano/cura, população máxima e eventos de chefe. [Catálogo e regras de reforja](evolucao-armas.md). [Avaliação histórica da BUILD 40](resultado-dez-builds.md).

Gerar esta tabela: node tools/report-build41.cjs. Para repetir o lote, definir BUILD_REFITS=1, BUILD_SEEDS=20261102,20261103 e BUILD_REPORT em um arquivo novo; executar node tests/builds-balance.cjs --real-only. Não fornecer BUILD_ONLY ou BUILD_RECIPES para reproduzir o catálogo publicado.
