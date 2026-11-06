# Horda procedural e poder de arma — BUILD52

O pedido do jogador em 6 de novembro de 2026 substitui a população ilimitada por encontros com limite e gatilhos. A pressão acompanha a região explorada; limpar a horda cria espaço e uma build forte pode dominar os grupos. Não há ajuste automático de vida ou dano dos inimigos em resposta ao poder do jogador.

## Diretor de encontros

- Primeiro grupo de 15 aos 2 s, em círculo fora da tela.
- Limite de zumbis comuns vivos: 60 +12 por minuto completo, máximo 180. Chefes e seus dois ou três lacaios por encontro têm agenda própria.
- Novos grupos têm até 15, respeitando as vagas disponíveis. O temporizador cai de 6,4 s para um mínimo de 3,5 s.
- Oito abates desde o último encontro podem antecipar um grupo. Há pelo menos 3 s entre ativações, sem fila de ondas acumuladas.
- Deslocar 320 px com poucos inimigos na região pode antecipar um encontro. A referência de presença local é 30 +3/minuto, limitada pelo teto.
- Ao explorar outra região, até 15 perseguidores muito distantes podem reentrar no círculo fora da tela, descontando os novos nascimentos dessa ativação. A distância original precisa superar 2,5 vezes o raio do círculo; ambos os pontos ficam fora da tela. A mesma entidade conserva vida, escudo, tipo e recompensa. Não conta como morte, cura ou coleta.
- Pausa e ofertas congelam o diretor. Reiniciar limpa cooldown, contagem de abates e região de referência.
- Policiais continuam bloqueados até derrotar o segundo chefe. Ocupam um terço inteiro de cada grupo; grupos completos mantêm 5/15. A investida continua exclusiva do policial que perdeu o escudo.

O teto regula nascimentos: não apaga inimigos existentes caso uma configuração de teste já comece acima dele. Na partida normal, a população comum é criada pelo diretor. A redistribuição impede que correr indefinidamente deixe toda a horda para trás, preservando os sobreviventes e os ganhos obtidos ao feri-los.

## Melhorias sem penalidade

| Módulo | Ganho | Penalidade removida |
|---|---|---|
| Alto Impacto | Dano ×2 | Intervalo ×1,5 |
| Overdrive | Intervalo ÷3 | Dano ÷1,5 |
| Perfuração | Dois alvos adicionais | Dano ÷1,5 |
| Depósito Ampliado | Carregador ×3 e uma munição por dez abates | Recarga ×2 |

Alto Impacto e Overdrive juntos permitem seis vezes o dano nominal por segundo antes de considerar recarga, acertos e outros módulos. Instalar o depósito não entrega munição gratuita. As quatro entradas continuam únicas por tentativa, com os requisitos existentes. Os outros módulos e experimentos mantêm seus custos descritos.

O catálogo conserva 82 entradas e passa à revisão 6. Configurações antigas idênticas ao padrão recebem os novos valores; registros editados pelo designer são preservados integralmente. A escolha de manter uma penalidade em configuração personalizada continua válida. O painel aplica a configuração somente nas próximas partidas.

## Proteções

`tests/horde-director.cjs` verifica limite, grupos parciais, cooldown dos abates, reentrada fora da tela, preservação de vida/escudo, pausa/reset e fuga contínua por cinco minutos. `tests/positive-weapon-upgrades.cjs` verifica os ganhos nas 12 armas, com e sem painel e em dois estados de arma; também verifica migração e 16 registros editados. A integração de 25 minutos, os protocolos, as 24 reforjas, os suportes e o arsenal avançado continuam cobertos pelas suítes existentes.

Os resultados naturais das dez receitas ficam em `build52-progression.json`. São partidas automatizadas com escolhas naturais e equipamentos previamente liberados apenas para montar cada receita, sem invulnerabilidade, dano adicional ou morte forçada de chefe. A avaliação da BUILD51 é preservada integralmente em `build51-canonical-progression.json`; a mudança de diretor e dos quatro módulos é avaliada em conjunto. Os resultados não identificam a contribuição isolada de cada alteração nem substituem o teste de satisfação do jogador.

Resultado:20/20 tentativas cumpriram20minutos e ao menos três chefes, contra7/20 na referência anterior, com as mesmas duas sementes por receita e o mesmo piloto automatizado. Duas sementes adicionais da Agulha Antititã também cumpriram o critério (build52-holdout.json). Algumas tentativas não receberam todo o núcleo recomendado da receita; sobrevivência não significa que todos os módulos tenham sido sorteados. A população comum permanece limitada; o pico total inclui os lacaios dos chefes. A comparação validada e os hashes estão em build52-director-results.json.

Chrome por file:// passou em desktop e390px: reentrada fora da tela, desenho e carta de Alto Impacto sem penalidade. O arsenal avançado passou em desktop/mobile e1452combinações curtas; áudio e suportes passaram nas suítes de integração. A avaliação natural mede sobrevivência e chefes, sem afirmar que cada configuração seja igualmente divertida ou igualmente forte.
