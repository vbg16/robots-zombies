# Gambiarras do Biruta — regra vigente a partir da BUILD70

Os módulos normais continuam sendo a progressão de cada nível. Os antigos bônus especiais dos níveis3/6/9 e a oferta especial do nível10 foram removidos: nesses níveis agora se escolhe um módulo normal. Os seis experimentos instáveis foram removidos do catálogo, das ofertas e do painel.

No nível20 ocorre uma única montagem de **Gambiarras do Biruta**, substituindo o módulo desse nível. A mesma tela reúne três componentes próprios do chassi escolhido e duas modificações próprias de cada arma equipada. O jogador seleciona um componente de chassi e uma modificação por arma, vê os ganhos e custos de cada escolha e confirma uma única instalação. Com duas ou três armas, cada uma tem sua própria seleção independente. Não há troca nem fusão de armas.

As seleções são apenas uma prévia. Não mudam atributos ou munição antes de confirmar. O botão de instalar fica indisponível até completar todas as seleções. A partida fica pausada durante a montagem. Enter confirma quando o foco não está em outro controle; os botões funcionam por teclado e toque. R recusa toda a montagem. Recusar consome a oferta, não concede poderes nem afasta os inimigos; não há uma segunda oferta em outro nível.

A instalação valida todas as escolhas, aplica o componente do robô uma vez e cada modificação somente à arma correspondente. Não repõe cartuchos, não termina recargas, não modifica tiros em voo e não altera o perfil permanente. Somente a confirmação concede um respiro: afastamento120px e interrupção0,5s nos inimigos elegíveis em raio280, uma única vez para o conjunto. Reiniciar ou morrer remove todos esses efeitos temporários.

O catálogo reaproveita os18efeitos de chassi e as24modificações de armas existentes. Eles são componentes da mesma categoria, sem ofertas independentes. Por exemplo, o ENXA pode combinar Relé do Enxame com Alimentação Pesada na Metralhadora, Câmara de Varredura na Escopeta e Refrigeração Profunda na arma criogênica, em uma única instalação.

Os baús continuam contendo peças raras temporárias. Quando todas as peças elegíveis já tiverem sido adquiridas, o baú oferece um módulo normal. Não existe etapa de experimento instável. Parafusos, peças de garagem e desbloqueios permanentes continuam salvos.

## Painel e migração

O catálogo editável passa de86para74registros:56módulos normais e18componentes de chassi das Gambiarras. As24modificações de arma continuam consultáveis na garagem e têm regras próprias de equipamento; não são registros editáveis desse painel. Relíquias de baú também permanecem em seu catálogo próprio. A revisão do catálogo é8.

A migração remove os12registros aposentados, converte os componentes de chassi para tipoGambiarra com nível fixo20 e preserva seus nomes, efeitos editados e demais ajustes de balanceamento. Módulos personalizados continuam normais. Referências aos IDs removidos deixam as listas de requisitos e sinergias. A migração não modifica a entrada recebida e é idempotente. Os rascunhos antigos continuam passando pelo mesmo validador; módulos especiais desativados não são oferecidos. Se todos os componentes do robô estiverem desativados, o nível20 oferece um módulo normal para evitar uma tela impossível de concluir.

## Regressões obrigatórias

- Níveis3/6/9/10/19/21: oferta normal. Nível20: montagem unificada apenas uma vez.
- Prévia, seleção incompleta, IDs de outro robô/arma, confirmação antiga ou repetida: nenhum efeito.
- Seis chassis e doze armas: ambas as partes instaladas, atributos finitos, efeitos e penalidades corretos.
- Até três armas: seleções independentes, munição/recargas e projéteis anteriores preservados.
- Uma confirmação, um respiro; recusa e prévia não concedem respiro.
- Pausa da simulação, teclado, toque, rolagem e ausência de overflow em1280×900,844×390e740×360.
- Baús esgotados: módulo normal, sem experimentos e sem perda de recompensas permanentes.
- Reinício, morte e retorno à garagem: sem poderes temporários persistentes.
- Migração revisão7→8: ajustes preservados,12registros removidos e segunda migração sem novas mudanças.

Comandos: `node tests/gambiarras.cjs`, `node tests/weapon-evolution.cjs`, `node tests/balance-panel.cjs`, `node tests/balance-migration.cjs`, `node tests/incursion.cjs` e `node tests/gambiarras-browser.cjs` (Chrome e Playwright de testes).

Os ensaios de navegador são fixtures curtas. Não representam partidas naturais completas, ensaio prolongado, medição em aparelho físico nem aprovação final do projeto. O bot não foi modificado nesta entrega.
