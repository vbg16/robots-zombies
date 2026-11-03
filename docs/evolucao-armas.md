# Reforja de armas — BUILD 41

Nível 20 confirmado pelo criador em 02/11/2026. A arma equipada evolui, sem troca ou fusão. O princípio adaptado da referência é especializar o equipamento em caminhos distintos durante a tentativa; conteúdo, nomes e valores abaixo são originais. A pesquisa de sistemas está em [pesquisa-builds-20mtd.md](pesquisa-builds-20mtd.md).

## Oferta e instalação

- No nível 20, a oferta substitui o módulo normal daquele nível. Duas opções próprias da arma, sem sorteio. Escolha por clique/teclas 1 e 2, ou mantenha a arma com R/botão de recusa. Recusar consome a oportunidade; nível 21 retoma módulos normais.
- A especialização do chassi continua no nível 10. Recompensa de chefe pendente é resolvida antes de processar o nível. Cada oferta pausa o mundo e limpa entradas de disparo/movimento.
- Uma reforja por tentativa. Não cobra materiais, desbloqueia arma, altera perfil ou entrega munição. Munição, temporização da recarga e tempo do disparo em andamento ficam preservados. Capacidade aumentada só é preenchida ao recarregar normalmente.
- Modificadores multiplicam os atributos já adquiridos. Propriedades intrínsecas alteram somente o snapshot da arma em uso; os catálogos originais permanecem imutáveis. Projéteis já emitidos preservam dano, movimento, raio, cadeia e estados intrínsecos anteriores. Habilidades comuns continuam com suas regras próprias. Drones e outros efeitos que escalam com o dano direto acompanham a alteração dessa base; não são um canal de dano isolado da arma.
- Reiniciar remove a reforja e restaura a arma base. Cartões/atalhos obsoletos não aplicam outra evolução.
- A garagem mostra as duas opções da arma selecionada. Os dez guias indicam uma recomendação; não instalam a reforja e não mudam as opções. O HUD e o diagnóstico de pausa mostram a escolha ativa.
- As 24 reforjas são um catálogo próprio de arma. O painel de skills mantém seus 70 registros; edição das reforjas no painel ainda é pendência, não uma capacidade implementada.

## Catálogo implementado

| Arma | Reforja | Ganho | Custo / condição |
|---|---|---|---|
| Metralhadora | ALIMENTAÇÃO PESADA | Dano por projétil ×1,3. | Tempo de recarga ×1,2. |
| Metralhadora | ESTEIRA DE MUNIÇÃO | Capacidade do carregador ×1,5. | Tempo de recarga ×1,15. Não repõe munição ao instalar. |
| Escopeta | GARGALO DE PRECISÃO | Dispersão ×0,5 e dano ×1,15. | Intervalo entre disparos ×1,15. |
| Escopeta | CÂMARA DE VARREDURA | Dois pellets adicionais por emissão, antes dos multiplicadores. | Dano por pellet ×0,8 e tempo de recarga ×1,2. |
| Fuzil de rajada | CICLO DE QUATRO TEMPOS | Uma bala adicional em cada rajada. | Intervalo entre rajadas ×1,2 e tempo de recarga ×1,15. |
| Fuzil de rajada | CULATRA ÁGIL | Tempo de recarga ×0,75. | Dano por bala ×0,9. |
| Canhão de precisão | BROCA FERROVIÁRIA | Atravessa três alvos adicionais e dano ×1,2. | Intervalo entre disparos ×1,2. |
| Canhão de precisão | FERROLHO CÍCLICO | Intervalo entre disparos ×0,75. | Dano por projétil ×0,9. |
| Emissor laser | OSCILADOR DE PULSOS | Intervalo entre disparos ×0,75. | Tempo de recarga ×1,25. |
| Emissor laser | LENTE DE LONGO CURSO | Duração do projétil ×1,5 e dano ×1,2. | Intervalo entre disparos ×1,2. |
| Lança-chamas | MISTURADOR DE COMBUSTÍVEL | Dano da queimadura aplicada ×1,5. | Dano direto ×0,8; também reduz a base da queimadura. |
| Lança-chamas | BICO DE LONGO ALCANCE | Duração dos projéteis ×1,75. | Intervalo entre disparos ×1,2. |
| Lançador criogênico | BROCA GLACIAL | Atravessa dois alvos adicionais. | Dano por projétil ×0,85. |
| Lançador criogênico | REFRIGERAÇÃO PROFUNDA | Resfriamento por impacto dura mais 1 s; dano ×1,15. | Intervalo entre disparos ×1,15. |
| Lança-foguetes | OGIVA DE CERCO | Raio intrínseco da explosão ×1,5. | Dano ×0,85 e tempo de recarga ×1,15. |
| Lança-foguetes | TUBO DE PRESSÃO | Velocidade dos projéteis ×1,6 e dano ×1,25. | Raio intrínseco da explosão ×0,75. A mira continua manual. |
| Lança-granadas | CASCO DE PRESSÃO | Raio intrínseco da explosão ×1,3. | Duração até detonar ×1,25. |
| Lança-granadas | CARGA BIFURCADA | Uma granada adicional por emissão; dispersão em leque. | Dano por granada ×0,65 e tempo de recarga ×1,25. |
| Carabina Tesla | BOBINA RAMIFICADA | Descargas intrínsecas alcançam dois alvos adicionais. | Dano direto e base elétrica ×0,85. |
| Carabina Tesla | BOBINA CONCENTRADA | Dano direto e base elétrica ×1,5. | Um alvo intrínseco a menos; intervalo entre disparos ×1,15. |
| Disco de retorno | ROTOR DE ALTA ROTAÇÃO | Velocidade dos projéteis ×1,4 e dano ×1,2. | Duração do projétil ×0,8. |
| Disco de retorno | ARO DE IMPACTO | Impactos ganham explosão intrínseca de raio 48, com metade do dano. | Dano direto ×0,85 e tempo de recarga ×1,2. |
| Arpão pneumático | HASTE TRANSFIXANTE | Atravessa três alvos adicionais e dano ×1,15. | Intervalo entre disparos ×1,2. |
| Arpão pneumático | PISTÃO DE PRESSÃO | Empurrão intrínseco +40; dano ×1,3 e velocidade do projétil ×1,3. | Tempo de recarga ×1,2. Chefes mantêm resistência ao empurrão. |

O Misturador resulta em queimadura ×1,2 antes dos outros bônus: dano base ×0,8 e multiplicador de queimadura ×1,5. Dois projéteis dispersos não garantem dano dobrado num alvo. Duração maior da granada adia a detonação por tempo, mas contato ainda pode detoná-la. Empurrão e explosões mantêm resistência do chefe e absorção integral do golpe que quebra um escudo policial.

## Evidência desta etapa

- **24 variantes:** node tests/weapon-evolution.cjs passou. Verifica marco de nível, modificadores, emissão, pausa, recusa, teclado sem repetição, callback antigo, segunda instalação, reset, catálogo/perfil intactos, recarga parcial, munição e snapshots de disco, fogo, gelo e granada por tempo; arpão evoluído preserva escudo policial.
- **Integração:** node tests/combat.cjs passou, incluindo 25 minutos de cenário controlado e resposta à nova oferta. Áudio, sprites, catálogo, migração e testes de chassis/interações também passaram. Esse cenário longo usa invulnerabilidade/dano sintético/derrotas programadas para verificar estados, não balanceamento.
- **Chrome real:** node tests/weapon-evolution-browser.cjs passou com Playwright. Verificou as 24 seleções, identidade fixa, perfil/munição intactos, prévia na garagem, recomendação do guia, RAF congelado, teclado, largura 390 px e rolagem até a recusa. Capturas foram inspecionadas. O teste injeta nível/XP para revisar a interface; não representa uma partida ganha.
- **Bancada de builds:** 70 cenários passaram com as dez receitas e a reforja recomendada instalada apenas nos pacotes maduros. [Dados completos](build41-refit-bench.json). São alvos estáticos, não dez aprovações de sobrevivência.

Duas tentativas novas de **Demolição de Campo**, com ofertas e dano normais, sem invulnerabilidade ou chefes derrotados artificialmente:

| Semente | Duração | Chefes | Nível final | Reforja conquistada |
|---|---:|---:|---:|---|
| 20261102 | 20.00 min | 4 | 32 | grenade-doubleShell |
| 20261103 | 20.00 min | 5 | 32 | grenade-doubleShell |

[Fontes, escolhas e métricas dessas tentativas](build41-refit-progression.json). Driver 9 mantém as decisões de movimento/mira do driver 8 e agora escolhe a reforja recomendada quando oferecida. Não houve ajuste de vida, dano ou ritmo dos inimigos nesta etapa. Essa amostra não revalida todas as dez builds; [o relatório BUILD 40](resultado-dez-builds.md) continua sendo histórico da versão anterior. A próxima avaliação precisa distinguir a perda do módulo normal no nível 20 e o efeito da reforja, sem atribuir toda diferença ao novo bônus.

## Limites e próximas etapas

Canal experimental; publicApproved=false. Os 24 caminhos precisam de avaliação mais ampla de equilíbrio, sobretudo builds que já falhavam antes do nível 20. Permanecem pendentes a edição das reforjas no painel, a reavaliação de sobrevivência das dez receitas e outras famílias compatíveis do mapeamento. Não há alegação de conclusão do objetivo geral.

Para rodar a bancada: defina BUILD_REFITS=1 e BUILD_REPORT apontando para um novo arquivo; execute node tests/builds-balance.cjs --bench-only. Para a progressão, use --real-only, BUILD_ONLY com o ID da build e BUILD_SEEDS com as sementes. No PowerShell, variáveis usam a forma $env:BUILD_REFITS='1'. Para o teste de navegador, Playwright deve estar disponível ao Node, e GAME_URL pode apontar para o servidor local; CHROME_PATH é opcional. Não é dependência do jogo distribuído.
