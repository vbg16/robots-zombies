# Revisão de interface e custos — 30/10/2026

Valores experimentais, sujeitos a teste humano. Esta revisão substitui os custos mais punitivos da primeira versão. Mantém benefícios, pré-requisitos, escolha única, recarga proporcional, inimigos com atributos fixos e três chefes.

## Apresentação

- Árvores com nomes e categorias, ícones de traço mais forte e preenchimento sutil.
- VANTAGEM e DESVANTAGEM padronizadas nas 36 escolhas; texto maior e contraste verde/laranja claro.
- HUD separado de recargas: ícone, barra, PRONTO, ATIVO ou segundos restantes. Pausa e seleção de melhorias congelam temporizadores.
- Descrições usam área pequena e média; os cartões mostram círculos de referência. Área pequena continua com raio interno de 64 unidades; média com 140. Não há alteração física desses raios nem conversão fictícia para metros.

## Custos atuais

Os custos usam principalmente divisores 1,25 ou 1,5, em vez de dividir atributos pela metade. Depósito ampliado mantém carregador ×3 e recarga ×2. Custos acumulam multiplicativamente; combinações extremas ainda exigem balanceamento com jogadores.

| Árvore | Melhoria | Vantagem | Desvantagem |
| --- | --- | --- | --- | --- |
| Dano de impacto | ALTO IMPACTO | Dano ×2. | Intervalo entre disparos ×1,5. |
| Dano de impacto | CAÇA-TITÃS | Dano contra chefe ×3. | Alcance dos projéteis ÷1,5. |
| Dano de impacto | FINALIZADOR | Dano ×3 contra alvos com até um terço da vida. | Velocidade das balas ÷1,5. |
| Dano de impacto | QUINTO IMPACTO | Cada quinto disparo causa dano ×3. | Capacidade do carregador ÷1,25 (mínimo 1). |
| Arsenal acelerado | OVERDRIVE | Cadência ×3. | Dano de cada bala ÷1,5. |
| Arsenal acelerado | CÂMARA DUPLA | Projéteis por disparo ×2. | Dispersão ×1,5 e alcance ÷1,5. |
| Arsenal acelerado | MUNIÇÃO RICOCHETE | Cada bala busca um alvo adicional após esgotar perfuração. | Tempo de recarga ×1,5. Não combina com disco. |
| Arsenal acelerado | PROPULSÃO BALÍSTICA | Alcance dos projéteis ×3. | Tamanho das balas ÷1,25. |
| Defesa pesada | BLINDAGEM REFORÇADA | Reduz 2 de dano por golpe; mínimo recebido 1. | Velocidade de movimento dividida por 1,25. |
| Defesa pesada | CHASSI TITÂNICO | Vida máxima e atual ×3. | Velocidade ÷1,5 e tempo de recarga ×1,5. |
| Defesa pesada | BATERIA DE SUCATA | A cada 20 zumbis mortos, recupera uma bateria (20 de vida). | Alcance de coleta ÷1,25. Não ultrapassa a vida máxima. |
| Defesa pesada | OFICINA ESTACIONÁRIA | Após 3 s parado, recupera 2 de vida por segundo. | Dano das balas ÷1,25. Mover interrompe o reparo. |
| Coleta e manutenção | CAMPO MAGNÉTICO | Alcance de coleta ×3. | Sem penalidade. |
| Coleta e manutenção | PROCESSADOR DE EXPERIÊNCIA | Experiência por núcleo ×2. | Tempo de recarga ×1,5. |
| Coleta e manutenção | MANUTENÇÃO NA RECARGA | Cada recarga completa recupera 5 de vida. | Tempo de recarga ×1,25. Só funciona após gastar munição. |
| Coleta e manutenção | DEPÓSITO AMPLIADO | Capacidade do carregador ×3; a cada 10 mortes, devolve uma munição. | Tempo de recarga ×2. Não repõe munição imediatamente. |
| Fogo industrial | MUNIÇÃO INCENDIÁRIA | Impactos queimam por 3 s: metade do dano da bala por segundo. | Alcance dos projéteis ÷1,25. |
| Fogo industrial | CHOQUE TÉRMICO | Queimadura causa dano ×3 enquanto o alvo está resfriado. | Dano direto das balas ÷1,5. Exige resfriar o alvo. |
| Fogo industrial | FORNALHA | Duração da queimadura ×3. | Tempo de recarga ×1,5. |
| Fogo industrial | COMBUSTÃO CONCENTRADA | Dano da queimadura ×3. | Cadência ÷1,5. |
| Controle criogênico | NÚCLEO CRIOGÊNICO | Impactos deixam o movimento inimigo ÷2 por 2 s. | Velocidade dos projéteis ÷1,25. |
| Controle criogênico | PERFURAÇÃO | Projéteis atravessam dois alvos adicionais. | Dano direto das balas ÷1,5. |
| Controle criogênico | IMPACTO CINÉTICO | Empurra uma distância curta; chefes recebem um quarto do empurrão. | Cadência ÷1,5. |
| Controle criogênico | RECARGA GLACIAL | Ao terminar uma recarga, resfria alvos em uma área média por 4 s. | Tempo de recarga ×1,5. |
| Rede elétrica | DESCARGA | Impactos atingem outro alvo com metade do dano; perfuração amplia para três. | Dano direto das balas ÷1,5. |
| Rede elétrica | CONDUTIVIDADE | Alcance elétrico ×3. | Alcance dos projéteis ÷1,5. |
| Rede elétrica | CURTO-CIRCUITO | Descargas param movimento por 1 s; chefe por um quarto de segundo. | Cadência ÷1,5. Não cancela ataques. |
| Rede elétrica | ESCUDO CAPACITIVO | Absorve um impacto e recarrega em 120 s de combate. | Velocidade de movimento ÷1,5. |
| Mobilidade e reação | PROPULSOR AUXILIAR | ESPAÇO: avanço de 0,15 s com velocidade ×3. Recarga 4 s. | Não concede invulnerabilidade. |
| Mobilidade e reação | PERNAS HIDRÁULICAS | Velocidade de movimento ×2. | Vida máxima e atual ÷1,5; mínimo 1. |
| Mobilidade e reação | ISOLAMENTO DE IMPACTO | Proteção normal após sofrer dano ×2. | Capacidade do carregador ÷1,25 (mínimo 1). |
| Mobilidade e reação | RESERVA DE EMERGÊNCIA | Ao sobreviver a dano, ganha 3 s de proteção. Recarga 120 s de combate. | Alcance de coleta ÷1,25. Não ressuscita. |
| Demolição reativa | CARGA EXPLOSIVA | Cada impacto cria uma explosão pequena, causando metade do dano a outros alvos. | Tempo de recarga ×1,5. |
| Demolição reativa | ONDA EXPANDIDA | Raio das explosões ×2. | Dano direto das balas ÷1,5. |
| Demolição reativa | PULSO DE RETALIAÇÃO | Ao sobreviver a dano, cria uma explosão média com dano ×3. Recarga 120 s. | Vida máxima e atual ÷1,5; mínimo 1. |
| Demolição reativa | SOBRECARGA REATIVA | Ao sobreviver a dano, ganha cadência ×3 por 6 s. Recarga 120 s de combate. | Tempo de recarga da arma ×1,5. |

## Validação

Testes Node verificam os custos alterados e os estados de recarga no HUD, além de combate, árvores, munição, chefes e simulação de dez minutos. Ícones SVG são renderizados para inspeção. Não foi executada validação visual da interface completa em navegador.
