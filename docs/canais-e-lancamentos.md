# Canais de desenvolvimento e público

## Desenvolvimento

Pasta Jogo, branch codex/desenvolvimento, preview em http://127.0.0.1:8001/ usando iniciar-desenvolvimento.ps1. Contém o trabalho atual, inclusive integrações e especializações ainda em validação. Alterações locais foram preservadas. Não trocar de branch nessa pasta com trabalho pendente.

## Público

Pasta irmã Jogo-publico, branch codex/publico, preview em http://127.0.0.1:8002/ usando iniciar-publico.ps1. É outro checkout Git: modificar arquivos do desenvolvimento não modifica a cópia pública. Não há hospedagem ou deploy automático configurado por esta separação.

Base inicial: 99522e5, última revisão registrada na main. Estado: CANDIDATA HISTÓRICA, SEM APROVAÇÃO DE PUBLICAÇÃO REGISTRADA. Essa base ainda usa sobrevivência de dez minutos e não contém as integrações locais recentes. Não representa o contrato atual de arena infinita; precisa de uma promoção revisada antes de ser apresentada como lançamento público atualizado.

## Promoção de melhorias

1. Implementar e registrar uma mudança na branch de desenvolvimento.
2. Executar os testes adequados, revisar os preceitos atuais e coletar parecer dos testers. Simulação não substitui playtest visual.
3. Preparar um commit candidato contendo apenas a mudança revisada e suas dependências. Não promover especializações ou demais experimentos junto de uma correção já aprovada.
4. Registrar em uma ficha de lançamento: commit, mudanças, testes, limitações conhecidas e aprovação explícita do criador.
5. Aplicar os commits selecionados na worktree pública, resolver conflitos e repetir os testes nela. Só marcar publicApproved=true quando a ficha tiver a aprovação real. Criar tag pública e pacote dessa revisão.
6. Fazer publicação externa somente quando autorizada. Guardar a tag anterior para retorno.

Até existir uma ficha aprovada, o canal público continua candidato. Não usar aprovação de design como substituto de aprovação do pacote de lançamento.
