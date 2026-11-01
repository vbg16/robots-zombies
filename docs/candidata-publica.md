# Candidata pública atualizada — preparação

Estado: EM PREPARAÇÃO, sem aprovação de lançamento. Canal público histórico permanece intacto. Não há deploy autorizado por esta ficha.

## Mudanças candidatas

- Arena infinita, chefes recorrentes, ondas circulares crescentes e empurrão por dano: implementar os preceitos atuais substituindo o encerramento histórico de dez minutos.
- Persistência local e desbloqueios de garagem: materiais sobrevivem à derrota; custos experimentais exigem avaliação do criador.
- Gambiarras, Experimentos, lacaios próprios e papéis comuns tardios: funcionamento coberto pela suíte; frequência e força exigem playtest.
- Legendas de coleta, HUD responsivo, diagnóstico e manual: revisados por testers; algumas melhorias surgiram diretamente dos relatos.
- Renovação única por tentativa: revisão técnica passou; interação visual ainda pendente em partida.
- Especializações no nível10: código e testes no desenvolvimento; oferta PROT revisada por fixture; efeitos em combate e oferta BAST ainda precisam de playtest visual.

## Evidências atuais

node --check game.js, node tests/combat.cjs, node tests/sprite-animation.cjs e git diff --check passaram no desenvolvimento. A simulação usa invulnerabilidade/mira automática e alcança25+min; não comprova sobrevivência manual ou diversão. Revisão das especializações corrigiu dois bugs com testes de regressão.

## Pendências antes da promoção

1. Revisão visual do BAST e dos efeitos das especializações em combate.
2. Validar renovação na UI; validar curva de dificuldade e preços numa partida longa.
3. Revisar o conjunto de arte e todos os arquivos modificados e registrar os commits candidatos/dependências.
4. Aprovação explícita do conteúdo do lançamento pelo criador.
5. Promover commits selecionados para codex/publico, repetir checks no canal e gerar tag/pacote excluindo fixtures de desenvolvimento.

Commit candidato: ainda não registrado. Aprovação do lançamento: pendente. Tag anterior do canal: não criada; base histórica 2927dcb.
