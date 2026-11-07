/* Build recipes are recommendations, never free upgrades or forced offers. */
(function(root){
'use strict';
const builds=[
 {
  id:'agulha-antitita',evolution:'sniper-railDrill',name:'Agulha Antititã',robot:'prot',weapon:'sniper',
  summary:'Tiros precisos para atravessar a linha de frente e desmontar chefes.',
  engine:'Impacto forte + perfuração + bônus contra chefe; Caça-Titãs recupera uma bateria adicional por chefe e a marca do PROT recompensa manter o mesmo alvo.',
  skills:['damage','bossHunter','freeze','rate','pierce','range','crit','dash'],core:['damage','bossHunter','freeze','rate'],
  blessings:['pulseCoil','triggerRegulator','greasedServos'],specialization:'predatorMark',experiments:['volatileReactor','unstableLens'],
  strength:'Alto dano por acerto e pressão em chefe alinhado com a horda.',
  weakness:'Pouca munição e recarga longa deixam os flancos expostos.',
  strategy:'Mantenha distância, alinhe inimigos e use a recarga para reposicionar. Priorize o chefe quando houver uma linha segura.',
  avoid:['Não atire fora do alcance reduzido por Caça-Titãs.','Não sacrifique toda a mobilidade por dano.'],tags:['Precisão','Chefes','Perfuração']
 },
 {
  id:'tempestade-balistica',evolution:'laser-pulseClock',name:'Tempestade Balística',robot:'prot',weapon:'laser',
  summary:'Muitos disparos alimentam o quinto impacto e a reposição por abates.',
  engine:'Cadência + dois projéteis + crítico a cada quinto disparo ativam o Crivo Balístico, com um pulso de área por projétil crítico.',
  skills:['rate','extra','damage','crit','magnet','killAmmo','freeze','pierce'],core:['rate','extra','damage','crit'],
  blessings:['triggerRegulator','pulseCoil','spareBattery'],specialization:'predatorMark',experiments:['volatileReactor','unstableLens'],
  strength:'Boa frequência de acertos, progressão de crítico previsível e limpeza de corredores.',
  weakness:'Perde força durante a recarga e cada projétil isolado é relativamente fraco.',
  strategy:'Varra a frente da horda, mantenha o alvo marcado em chefes e recolha núcleos nas janelas abertas.',
  avoid:['Dispersão não garante que os dois projéteis acertem o mesmo alvo.','Evite aumentar repetidamente a recarga sem obter sustentação.'],tags:['Cadência','Crítico','Munição']
 },
 {
  id:'escopeta-ricochete',evolution:'shotgun-wideBore',name:'Escopeta de Ricochetes',robot:'bastion',weapon:'shotgun',
  summary:'Uma salva atravessa os primeiros inimigos e procura os que ficaram atrás.',
  engine:'Pellets, perfuração e ricochete espalham os impactos. Propulsão Balística compensa as perdas de alcance antes das peças finais de dano e explosão.',
  skills:['rate','extra','freeze','pierce','range','ricochet','damage','blast'],core:['rate','extra','freeze','pierce'],
  blessings:['pulseCoil','triggerRegulator','spareBattery'],specialization:'magneticBrake',experiments:['unstableLens','blastCondenser'],
  strength:'Cobertura de grupos próximos e controle de várias linhas de aproximação.',
  weakness:'Depende da Propulsão Balística para compensar o alcance perdido; mantém dispersão e recargas longas.',
  strategy:'Lute na borda dos grupos. Perfure primeiro; o ricochete só procura outro alvo depois de gastar a perfuração.',
  avoid:['Não use a receita com Disco de Retorno: ele não recebe ricochete.','Não confunda dano somado dos pellets com dano garantido em um alvo.'],tags:['Pellets','Ricochete','Área']
 },
 {
  id:'cacador-criogenico',evolution:'cryo-iceDrill',name:'Caçador Criogênico',robot:'prot',weapon:'cryo',
  summary:'Controle de movimento abre tempo para finalizar inimigos resistentes.',
  engine:'Resfriamento + perfuração mantêm grupos lentos; Finalizador amplifica o acabamento e mortes por bala de alvos resfriados geram Fratura Industrial.',
  skills:['damage','freeze','rate','pierce','finisher','dash','speed','range'],core:['damage','freeze','rate','pierce'],
  blessings:['pulseCoil','greasedServos','spareBattery'],specialization:'tailDecoy',experiments:['unstableLens','volatileReactor'],
  strength:'Kiting e redução da pressão frontal sem depender de dano em área.',
  weakness:'Vida reduzida por Pernas Hidráulicas e dano inicial menor após os custos de perfuração.',
  strategy:'Abra corredores, termine alvos já feridos e avance para recolher XP somente depois de resfriar a passagem.',
  avoid:['Resfriar não cancela ataques de chefe.','O multiplicador do Finalizador exige o limiar de vida; ele não é dano permanente.'],tags:['Resfriamento','Finalização','Mobilidade']
 },
 {
  id:'forja-criogenica',evolution:'flame-fuelMixer',name:'Forja Criogênica',robot:'forge',weapon:'flame',
  summary:'O chassi térmico transforma inimigos resfriados em combustível.',
  engine:'Aplicar fogo e resfriamento no mesmo alvo ativa Choque Térmico; o FORJ amplia a queimadura, com menor dano direto.',
  skills:['burn','freeze','thermal','afterburn','damage','rate','range','ignition'],core:['burn','freeze','thermal','afterburn'],
  blessings:['pulseCoil','triggerRegulator','spareBattery'],specialization:'thermalAmplifier',experiments:['unstableLens','volatileReactor'],
  strength:'Dano persistente que continua durante a recarga e forte conversão elemental.',
  weakness:'Precisa alcançar o alvo e manter os dois estados; não acumula infinitas queimaduras por pellet.',
  strategy:'Aplique o cone na frente da horda, recue durante a recarga e renove o resfriamento para sustentar o dano térmico.',
  avoid:['Não trate a queimadura como dano instantâneo.','Não reduza ainda mais o alcance sem uma forma de se aproximar com segurança.'],tags:['Fogo','Resfriamento','Dano contínuo']
 },
 {
  id:'rede-de-plasma',evolution:'tesla-branchCoil',name:'Rede de Plasma',robot:'volt',weapon:'tesla',
  summary:'Descargas e explosões usam inimigos agrupados como uma rede industrial.',
  engine:'O VOLT fortalece descargas; fogo persiste enquanto perfuração, eletricidade e explosões distribuem dano por grupos.',
  skills:['shock','damage','burn','blast','conductivity','freeze','pierce','stun'],core:['shock','damage','burn','blast'],
  blessings:['pulseCoil','triggerRegulator','spareBattery'],specialization:'extraFork',experiments:['unstableLens','volatileReactor'],
  strength:'Dano distribuído, alcance elétrico e interrupção de movimento.',
  weakness:'Menos vida e vários custos de dano direto; perde eficiência contra um alvo isolado.',
  strategy:'Acerte a borda de grupos compactos. Mantenha caminhos de fuga e evite entrar no centro para buscar mais alvos.',
  avoid:['Descargas secundárias não devem iniciar uma recursão infinita de explosões.','Paralisar movimento não cancela um ataque já programado.'],tags:['Eletricidade','Fogo','Área']
 },
 {
  id:'demolicao-de-campo',evolution:'grenade-doubleShell',name:'Demolição de Campo',robot:'bastion',weapon:'grenade',
  summary:'Granadas de grande área abrem espaços e pressionam chefes.',
  engine:'Dano de impacto + área expandida; projéteis adicionais aumentam as detonações e a manutenção aproveita a recarga.',
  skills:['damage','rate','blast','blastRadius','bossHunter','magnet','repair','extra'],core:['damage','rate','blast','blastRadius'],
  blessings:['pulseCoil','spareBattery','greasedServos'],specialization:'grounding',experiments:['blastCondenser','unstableLens'],
  strength:'Explosões grandes e dano concentrado em grupos alinhados com chefes.',
  weakness:'A demora de recarga exige planejamento; é possível ser cercado antes do próximo carregador.',
  strategy:'Atire onde os inimigos vão se reunir. Abra uma saída antes de recarregar e evite atravessar zonas de perigo para buscar XP.',
  avoid:['Não aceite todos os aumentos de recarga só pelo ganho de dano.','A explosão de impacto exclui o alvo que já recebeu o dano direto.'],tags:['Explosão','Chefes','Recarga']
 },
 {
  id:'oficina-viva',evolution:'shotgun-choke',name:'Oficina Viva',robot:'nano',weapon:'shotgun',
  summary:'Vida, recarga e resfriamento sustentam um robô pesado de reparo.',
  engine:'O NANO repara a fração recarregada. Chassi Titânico converte vida em dano; cura efetiva prepara uma salva com mais50% e duas perfurações. Propulsão Balística alcança chefes distantes e os impactos frios abrem espaço.',
  skills:['magnet','repair','armor','titan','damage','rate','freeze','range'],core:['magnet','repair','armor','titan'],
  blessings:['spareBattery','copperPlate','greasedServos'],specialization:'repairCharge',experiments:['lithiumPack','volatileReactor'],
  strength:'Reserva de vida alta, reparo recorrente e proteção operacional durante as recargas.',
  weakness:'É lenta e a cura não acompanha dano recebido sem parar; ficar parado em áreas de chefe continua perigoso.',
  strategy:'Gaste munição de forma útil, recarregue com distância e use o resfriamento para abrir o próximo deslocamento.',
  avoid:['Recarregar uma bala não concede a cura de um carregador inteiro.','Cura com vida cheia não prepara uma carga ofensiva.'],tags:['Reparo','Vida','Controle']
 },
 {
  id:'enxame-de-sucata',evolution:'harpoon-longShaft',name:'Enxame de Sucata',robot:'swarm',weapon:'harpoon',
  summary:'Drones acompanham o gato enquanto o arpão mantém um corredor seguro.',
  engine:'O ENXA já tem um drone; a árvore amplia a frota até três, acelera disparos e permite um segundo alvo sem procs recursivos.',
  skills:['drones','damage','dronePair','droneOverclock','droneArc','magnet','armor','salvage'],core:['drones','damage','dronePair','droneOverclock'],
  blessings:['pulseCoil','greasedServos','spareBattery'],specialization:'droneBossFocus',experiments:['volatileReactor','unstableLens'],
  strength:'Dano contínuo em alvos no alcance mesmo durante a recarga da arma.',
  weakness:'A frota tem alcance e cadência limitados; não acerta inimigos do outro lado do mapa.',
  strategy:'Mantenha os alvos dentro do raio dos drones, use o arpão para empurrar ameaças próximas e recolha núcleos nos corredores abertos.',
  avoid:['Drones não disparam a arma do jogador nem multiplicam infinitamente outros efeitos.','Mais projéteis da arma não criam mais drones.'],tags:['Drones','Dano contínuo','Alcance']
 },
 {
  id:'lanca-de-fuga',evolution:'harpoon-pressurePiston',name:'Lança de Fuga',robot:'nano',weapon:'harpoon',
  summary:'Mobilidade, arpão e reparos na recarga sustentam a retirada.',
  engine:'NANO + recarga reparadora + avanço; cura real prepara uma salva perfurante. O Motor Cinético acrescenta dano quando Pernas Hidráulicas e Impacto Cinético se encontram.',
  skills:['damage','rate','magnet','repair','dash','speed','freeze','knock'],core:['damage','magnet','repair','dash'],
  blessings:['spareBattery','pulseCoil','greasedServos'],specialization:'repairCharge',experiments:['volatileReactor','lithiumPack'],
  strength:'Reparo frequente, coleta ampla e disparos perfurantes preparados por cura.',
  weakness:'Pouca munição; velocidade custa vida, e reparar exige completar recargas. Integridade cheia não prepara a carga ofensiva.',
  strategy:'Monte coleta e reparo antes de apostar toda a defesa na velocidade. Circule a horda, gaste o carregador mirando a saída e use o avanço para mudar de corredor durante a recarga.',
  avoid:['O avanço não concede invulnerabilidade.','Recargas parciais curam proporcionalmente menos.','Cura em integridade cheia não prepara a Carga de Reparo.'],tags:['Mobilidade','Empurrão','Perfuração']
 }
];
for(const item of builds){for(const value of Object.values(item))if(Array.isArray(value))Object.freeze(value);Object.freeze(item);}
const api=Object.freeze({version:1,builds:Object.freeze(builds)});root.ScrewBuilds=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
