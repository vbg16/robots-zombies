# Recebimento e revalidação — zumbi ex-mecânico v1

Data: 29/10/2026. **Estrutura passou; aprovação visual pendente. Não integrado ao jogo.**

## Pacotes preservados

- sprites-originais.zip: cópia exata de zumbi-ex-mecanico-walk-frontal.zip. SHA-256: 651ac657703bec0433d0a95ce3579aa279672d344eaa84b86c0cef8366648dd6.
- evidencias-originais.zip: cópia exata de evidencias-zumbi-ex-mecanico.zip. SHA-256: cc1539c85320352374ad3e12209134a4178a2a9f185a86a79b3bda71cd5bd512.
- revalidation.json: resultado desta execução do validador oficial, não mera cópia do relatório do Designer.

São estudos arquivados nesta pasta. Nenhum script do jogo aponta para estes arquivos. Pacotes originais não foram alterados.

## Verificado

ZIPs íntegros. O pacote técnico contém exatamente 00.png a 07.png e manifest.json. Executado tools/validate_walk.py do projeto: retorno 0, CHECKS_PASSED_REVIEW_PENDING, sem erros. Todos 48 × 64, RGBA, alpha binário e margem transparente; pivô declarado (24,60), 100 ms por quadro, 800 ms/ciclo.

GIF: 80 quadros de 100 ms, 8.000 ms no total, configurado para repetição contínua; o conteúdo contém dez ciclos. Pranchas clara e escura inspecionadas: silhueta legível e contraste consistente com a paleta declarada.

O fluxo JavaScript de tools/walk-preview.html foi exercitado em DOM/imagem/canvas simulados com o manifesto entregue: oito quadros, dez ciclos, parada após 8 s. Isso NÃO é teste visual de navegador nem decodificação dos PNGs por navegador. Os PNGs foram decodificados separadamente por Pillow.

## Avaliação visual preliminar

Cabeça/torso mantêm aspecto coerente e há movimento de braços/joelhos. Os limites verticais das cores das botas se mantêm em y=52–57 nos oito quadros, enquanto há deslocamentos horizontais de vários pixels. Isso, isoladamente, não comprova erro, pois uma passada frontal pode movimentar-se em profundidade; porém não ficou demonstrada a transferência de peso com alternância inequívoca de apoio/avanço. Revisar particularmente os apoios 01→02 e o fechamento 07→00. Não aprovar como ciclo final somente pelo resultado estrutural.

A proposta tem potencial como estudo de zumbi arrastando-se, mas a aceitação do Walk exige avaliar deslocamento do pé apoiado em relação ao cenário, não apenas o pivô idêntico no JSON. Não considerar o critério de deslizamento aprovado.

## Pendências e decisão

- Executar tools/walk-preview.html em navegador real com estes oito PNGs; avaliar dez ciclos sem interrupção.
- Medir apoios/transferência de peso, continuidade 07→00 e expressividade em movimento.
- Testar sobre o cenário real e no tamanho efetivo do inimigo. As pranchas ampliadas não comprovam escala em jogo.
- Obter aprovação visual do criador antes da substituição.

Não havia navegador de testes disponível neste ambiente; tentativa anterior de instalação falhou por download inválido. Nenhuma mecânica, arquivo de combate, colisão, atributo, vida, velocidade, dano ou câmera foi alterada neste recebimento.
