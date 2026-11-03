# Vizinhos elétricos — BUILD50

`shockAt` usa células ordenadas pela menor distância até a consulta e mantém somente os k vizinhos necessários. O critério continua sendo a distância exata; empates respeitam a ordem original dos alvos. A consulta inclui as posições atualizadas após empurrões e descarta entradas duplicadas das células antigas.

Nenhum atributo, quantidade de inimigos, dano, efeito ou limite de ondas mudou. A busca linear permanece fora da fase de projéteis, abaixo de128 alvos, acima de32 vizinhos solicitados ou para coordenadas/raios que tornem a grade inadequada.

## Verificação

- `tests/nearest-targets.cjs`:2.288 consultas diferenciais reais, incluindo empates, chefe, exclusões, mortes, células negativas, empurrões e coordenadas grandes/inseguras.
- `tests/spatial-runtime.cjs`:18 cenários com estado e próximos números aleatórios iguais à referência de varredura completa. Inclui projéteis, dano, mortes, lacaios, efeitos, empurrões e explosões secundárias.
- Medição Chrome:18 pares com24 chamadas medidas em cada cenário e o mesmo aquecimento. Os hashes de estado final, incluindo RNG, coincidiram em todos. Todos os inimigos da fixture permaneceram vivos.

## Medição de simulação

| Inimigos | Distribuição | BUILD49 ms/passo | BUILD50 ms/passo | Variação |
|---:|---|---:|---:|---:|
| 500 | próxima | 7.56 | 3.76 | -50.2% |
| 500 | mista | 1.45 | 1.16 | -19.8% |
| 2000 | próxima | 80.08 | 12.14 | -84.8% |
| 2000 | mista | 13.97 | 2.96 | -78.8% |
| 5000 | próxima | 493.90 | 36.36 | -92.6% |
| 5000 | mista | 89.38 | 8.41 | -90.6% |

O caso5000/próxima passou de538,46 para80,13ms em tick+draw. O desenho isolado variou de34,80 para43,40ms:ele não foi otimizado nesta etapa e a variação foi preservada. Esse cenário continua pesado.

São custos de chamadas JS/Canvas em Chrome headless, em uma execução sequencial por versão; não incluem espera por GPU/compositor e não representam FPS exibido. A fixture usa HP elevado, imunidade e impede novas ondas/chefes exclusivamente para manter a população medida. Não é uma partida natural ou prova de balanceamento. Os testes naturais anteriores dos rotores continuam com0/2 aprovações no critério de sobrevivência.

## Reprodução e evidência

[Relatório bruto pareado](build50-neighbors-performance.json) preserva amostras, percentis, hashes de fontes, dependências visuais, máquina e estados. `tools/profile-horde.cjs` aceita `HORDE_FIXED_CALLS=24`; a serialização do estado ocorre depois do cronômetro. `tools/report-nearest-targets.cjs` rejeita diferenças de população, amostragem, browser, renderização, fontes congeladas ou estado.

Para repetir, congele `game.js` e `balance.js` do commit98ac673 em `outputs/performance/build49-neighbors/`. Rode o profiler primeiro com `HORDE_SOURCE_DIR` nesse diretório, saída `outputs/performance/build49-plasma-fixed.json`; depois sem a variável, saída `outputs/performance/build50-plasma-fixed.json`. Em ambos: `HORDE_COUNTS=500,2000,5000`, `HORDE_DISTRIBUTIONS=near,mixed`, `HORDE_PACKAGES=plasma`, `HORDE_SKIP_EVENTS=1`, `HORDE_FIXED_CALLS=24`. Use o servidor local na porta8001 e Playwright. Gere o relatório com `node tools/report-nearest-targets.cjs`.

GitHub de desenvolvimento atualizado após regressões; ramo público continua dependente de aprovação. Catálogo82/revisão5 e saves preservados.
