# Canais de desenvolvimento e público

## Desenvolvimento

Pasta Jogo, branch codex/desenvolvimento, preview em http://127.0.0.1:8001/ usando iniciar-desenvolvimento.ps1. Contém o trabalho atual, inclusive integrações e especializações ainda em validação. Alterações locais foram preservadas. Não trocar de branch nessa pasta com trabalho pendente.

## Público

Pasta irmã Jogo-publico, branch codex/publico, preview em http://127.0.0.1:8002/ usando iniciar-publico.ps1. É outro checkout Git: modificar arquivos do desenvolvimento não modifica a cópia pública. Não há hospedagem ou deploy automático configurado por esta separação.

Base inicial: 99522e5, última revisão registrada na main. Estado: CANDIDATA HISTÓRICA, SEM APROVAÇÃO DE PUBLICAÇÃO REGISTRADA. Essa base ainda usa sobrevivência de dez minutos e não contém as integrações locais recentes. Não representa o contrato atual de incursão de vinte minutos; precisa de uma promoção revisada antes de ser apresentada como lançamento público atualizado.

## Promoção de melhorias

1. Implementar e registrar uma mudança na branch de desenvolvimento.
2. Executar os testes adequados, revisar os preceitos atuais e coletar parecer dos testers. Simulação não substitui playtest visual.
3. Preparar um commit candidato contendo apenas a mudança revisada e suas dependências. Não promover especializações ou demais experimentos junto de uma correção já aprovada.
4. Registrar em uma ficha de lançamento: commit, mudanças, testes, limitações conhecidas e aprovação explícita do criador.
5. Aplicar os commits selecionados na worktree pública, resolver conflitos e repetir os testes nela. Só marcar publicApproved=true quando a ficha tiver a aprovação real. Criar tag pública e pacote dessa revisão.
6. Fazer publicação externa somente quando autorizada. Guardar a tag anterior para retorno.

Até existir uma ficha aprovada, o canal público continua candidato. Não usar aprovação de design como substituto de aprovação do pacote de lançamento.

## Download padrão no GitHub

A partir da BUILD33, main acompanha a versão de desenvolvimento enviada. Code → Download ZIP na main deve conter a mesma revisão de codex/desenvolvimento. Para manter isso, após validar e registrar as mudanças, enviar o mesmo commit às duas referências sem force-push. O canal codex/publico continua independente e não deve ser atualizado automaticamente. Um commit local ou uma branch local não atualiza o ZIP remoto; sempre verificar os hashes com git ls-remote depois do push.

## Pacote do jogo nas Releases

As [Releases de desenvolvimento](https://github.com/vbg16/robots-zombies/releases) são marcadas como pré-lançamento. Cada uma identifica o commit do jogo validado, o ZIP de runtime e seu SHA-256. Esse pacote inclui editor e assets; código, testes e evidências completos continuam no download da `main`.

A release `build68-dev` aponta para `ed2f3ba0a51870c7a1047c4166456a5f24316202`, sem promover `codex/publico`. O empacotador `tools/package-game.py` lê arquivos de um commit, nunca mudanças locais sem registro. A criação de um ZIP não substitui a validação da pasta extraída offline.

O workflow `.github/workflows/verify.yml` executa checks de desenvolvimento. Ele não publica Releases nem promove o canal público automaticamente. A aprovação do CI não substitui os gates finais da meta ou a aprovação explícita prevista acima.
