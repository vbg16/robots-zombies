# Rotores de Sucata — BUILD49

## Comportamento e custos

Uma terceira família de suporte acompanha drones e sensores: discos metálicos orbitam o robô e acertam por contato. A arma equipada continua com mira e disparo manuais. Os discos não gastam munição, emitem balas, consomem Carga de Reparo ou avançam o contador de crítico. Não aplicam queimadura/frio intrínsecos, descarga, explosão, corrosão ou empurrão da arma. Regras globais de dano/morte continuam válidas: Caça-Titãs, Finalizador, marca do chassi, salvamento por abates e liberação de uma carga corrosiva já existente, por exemplo. Exposição do sensor só amplia balas e não beneficia rotores.

|Módulo|Ganho|Custo|
|---|---|---|
|Rotores de Sucata|Dois discos, dano55% da base direta por contato, órbita72 e volta3s|Dano direto ×0,9|
|Terceiro Rotor|Mais um disco, máximo3|Dano dos discos ÷1,25|
|Braços Magnéticos|Raio orbital ×1,5|Volta ×1,25; a faixa se afasta e deixa mais espaço sem contato dentro do anel|
|Transmissão Acelerada|Volta ×0,65|Dano dos discos ×0,8|

A família completa tem três discos, raio108 e volta2,4375s. Cada disco atinge o mesmo alvo no máximo uma vez por período atual. Não há teto de alvos atingidos ou descarte de vivos distantes. A órbita é um anel, não uma área preenchida: ampliar alcance pode deixar de atingir quem está mais perto do robô. Dano deriva de player.damage atual, sem incorporar pellets, crítico ou conversão condicional de shotDamage; armas lentas com dano alto podem combinar melhor que armas de baixo dano por bala.

## Colisão e estado

O tick registra posição anterior/atual do jogador e fase dos discos. A colisão percorre segmentos com passos angulares de até7,5graus, incluindo deslocamento e empurrão do robô. Uma margem de curvatura de até0,43px no raio máximo evita perder contato entre as poses. O teste adversarial usa um alvo de raio real11 que ambos os pontos extremos deixam de tocar. O conjunto de candidatos conserva a ordem da lista de inimigos; mortos/lacaios removidos são ignorados. Escudo policial absorve integralmente inclusive o contato que o quebra.

Raio efetivo40–200, período0,75–12s, dano de contato limitado a1e9. Um tick longo varre no máximo uma volta e não paga uma fila de ataques atrasados. Fase usa resto do período antes da multiplicação para evitar overflow; o relógio local de cooldown avança até12s por chamada, suficiente para qualquer cooldown. WeakMaps por disco não retêm alvos mortos. Sem a skill, não há varredura da horda. Pausa/oferta/morte congelam a atualização; reset descarta fases e registros. Desenhar não altera estado nem RNG.

O diagnóstico de pausa mostra quantidade, dano, raio e período. Ícones e props são geometria original, coerente com os mecanismos do jogo. O contato tem efeito sonoro próprio, limitado a uma emissão a cada150ms pelo módulo de áudio, respeitando gesto inicial, volume e limite de vozes. O som não usa RNG do combate.

## Painel e compatibilidade

O catálogo agora tem82módulos:52normais/13raízes,6gambiarras,6experimentos e18protocolos. As24reforjas continuam separadas. São editáveis Dano dos rotores, Duração da volta dos rotores e Raio dos rotores. Condições programadas permanecem fixas. Efeitos diretos editados substituem custos/benefícios diretos originais, só após reset.

catalogRevision5 declara a introdução dos quatro IDs. A fixture BUILD48 com78módulos foi arquivada antes da mudança. Migração preserva valores antigos e renomeia colisões personalizadas, mesmo quando a condição é vazia, junto com requisitos/sinergias. Nome custom-rotors já ocupado é protegido por sufixo. Salvar e recarregar a revisão5 é idempotente; metadados futuros não são sobrescritos pelo fallback. O editor usa a revisão fornecida pela API para exportar/gravar, evitando mais um número fixo divergente.

## Evidência controlada

Passaram rotors.cjs, balance-panel.cjs, balance-migration.cjs, testes/render do editor, áudio e regressões de combate de25min controlados. Chrome conferiu árvore/ícones, escolha móvel, contatos sem disparo, três discos, pausa/diagnóstico, migração78→82 e edição para a próxima tentativa. As capturas estão em outputs/build49. As ofertas/alvos injetados são QA visual e de integração, não progressão natural.

build49-rotor-bench.json guarda108cenários:12armas ×3pacotes ×3fixtures estáticas. Testa os anéis fixos72/108 e um Brutamontes com650HP, imóvel/sem ataque no período. Erros de alcance e TTK censurado ficam nos dados. Nenhum cenário dispara a arma ou gasta munição, nem transmite estados intrínsecos. build49-builds-bench.json preserva70cenários controlados das dez receitas originais, componentes e estrutura do catálogo. Isso não aprova sobrevivência natural.

## Tentativas naturais — falhas preservadas

Experimento isolado ENXA+criogênico; oito prioridades rotors, rotorThird, rotorDrive, drones, damage, freeze, magnet, repair; núcleo rotors/rotorDrive/drones/damage. Reforja preferida deepCooling no nível20; protocolo droneBossFocus no10. O JSON experimental reutiliza o ID enxame-de-sucata para selecionar o ensaio, mas não modifica builds.js nem o guia canônico. Campos descritivos históricos desse JSON ainda citam o arpão; os parâmetros efetivamente executados são os acima e constam do relatório.

Driver9, passo0.05s, mesmas regras naturais de HP/XP/sorteios/ondas. O equipamento é pré-desbloqueado na fixture para testar o loadout, sem bônus de atributo, invulnerabilidade, dano extra, morte forçada de chefe ou descarte de vivos. Critério fixo1200s e pelo menos3chefes.

|Semente|Duração|Nível|Chefes|Núcleo obtido|Dano efetivo dos rotores|Critério atingido|
|---:|---:|---:|---:|---|---:|---|
|20261103|926.75s|22|2|sim|19837.3|não|
|20261104|649.95s|15|1|sim|11669.5|não|

As duas mortes são falhas do critério; a etapa não aprova a receita, o pool novo ou equilíbrio global. Os quatro relatórios concordam nos hashes congelados de game.js e balance.js. Raw com escolhas/canais/recebido/cura/configuração/driver: build49-rotor-progression.json.

## Custo de execução

build49-rotor-performance.json mede Chrome headless, sem RAF, três módulos filhos instalados e500/2000/5000corpos imóveis no raio108, HP alto/imunidade exclusivamente para preservar população. Não é um playtest de sobrevivência nem FPS apresentado. A fixture ativa exclusivamente o suporte; as distribuições dos outros pacotes do profiler não mudaram.

|Corpos|Tick médio|Tick p95|
|---:|---:|---:|
|500|0.65ms|1.00ms|
|2000|1.51ms|3.20ms|
|5000|3.50ms|5.40ms|

Com5000corpos, tick+desenho custou54,44ms médio, incluindo feedback visual, e todos permaneceram vivos/finitos. O custo de desenho e das combinações Plasma extremas continua pendente. Não esconder o problema apagando inimigos ou suprimindo dano.

Próximos trabalhos: equipamentos avançados com múltiplos slots, avaliação ampla das receitas/pool82, otimização das buscas de vizinhos elétricos em multidões e acabamento artístico dos chefes. Esta versão continua experimental; codex/publico não é promovida automaticamente.
