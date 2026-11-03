'use strict';
const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d'),el=id=>document.getElementById(id);
const keys=new Set(),random=(a,b)=>a+Math.random()*(b-a);
const HORDE={initialDelay:2,interval:6.4,minInterval:1.5,ramp:.008,waveSize:15,minSpeed:24,maxSpeed:42};
const PLAYER_KNOCKBACK=48;
// Keep build choices reachable before the horde's late-game acceleration.
const PROGRESSION=Object.freeze({initialNeed:6,growth:1.2,baseMagnet:95});
const REPAIR_CELL=Object.freeze({everyKills:25,healing:12});
function sound(name){window.ScrewAudio?.play(name);}
const WEAPONS=Object.freeze(Object.fromEntries(Object.entries({
 machine:{name:'Metralhadora',damage:22,rate:.32,pellets:1,spread:0,life:1.8,description:'Precisão a distância. 22 de dano · 1 projétil · 0,32 s.'},
 shotgun:{name:'Escopeta',damage:12,rate:.8,pellets:5,spread:.34,life:.65,description:'Cone de curto alcance. 12 de dano × 5 · 0,80 s.'},
 burst:{name:'Fuzil de rajada',damage:14,rate:.65,pellets:1,spread:0,life:1.5,burst:3,description:'Três tiros em sequência enquanto segura disparo. 14 por tiro · ciclo 0,65 s.'},
 sniper:{name:'Canhão de precisão',damage:88,rate:1.15,pellets:1,spread:0,life:1.2,speed:1050,pierce:3,description:'Tiro veloz que atravessa quatro alvos. 88 de dano · 1,15 s.'},
 laser:{name:'Emissor laser',damage:10,rate:.09,pellets:1,spread:0,life:.5,speed:1600,radius:4,description:'Pulsos finos e rápidos, sem autoaim. 10 de dano · 0,09 s.'},
 flame:{name:'Lança-chamas',damage:5,rate:.12,pellets:3,spread:.45,life:.6,speed:300,burn:true,description:'Cone curto; aplica queimadura por 3 s. 5 de dano × 3 · 0,12 s.'},
 cryo:{name:'Lançador criogênico',damage:22,rate:.36,pellets:1,spread:0,life:1.6,speed:420,freeze:true,description:'Projétil gélido desacelera por 2 s. 22 de dano · 0,36 s.'},
 rocket:{name:'Lança-foguetes',damage:70,rate:1.3,pellets:1,spread:0,life:2.4,speed:280,explosion:96,splash:1,description:'Explosão de 96 px no impacto. 70 de dano · 1,30 s.'},
 grenade:{name:'Lança-granadas',damage:45,rate:1,pellets:1,spread:0,life:1.1,speed:320,explosion:90,splash:1,detonate:true,description:'Explode por contato ou ao fim de 1,1 s. 45 de dano · 1 s.'},
 tesla:{name:'Carabina Tesla',damage:24,rate:.55,pellets:1,spread:0,life:1,speed:720,chain:2,description:'Impacto descarrega em dois outros alvos. 24 de dano · 0,55 s.'},
 disc:{name:'Disco de retorno',damage:24,rate:.85,pellets:1,spread:0,life:1.8,speed:360,returning:true,description:'Atravessa alvos e retorna; pode acertar uma vez por trecho. 24 · 0,85 s.'},
 harpoon:{name:'Arpão pneumático',damage:60,rate:1.05,pellets:1,spread:0,life:1.3,speed:750,pierce:1,knock:65,description:'Atravessa dois alvos e empurra. 60 de dano · 1,05 s.'}
}).map(([id,w])=>[id,Object.freeze(w)])));
const AMMO=Object.freeze({machine:[24,1.4],shotgun:[6,2.2],burst:[30,1.8],sniper:[3,2.6],laser:[60,1.6],flame:[80,2.4],cryo:[12,2.4],rocket:[1,4.8],grenade:[4,3.6],tesla:[8,3],disc:[3,3.4],harpoon:[2,2.4]});
const WEAPON_EVOLUTION_LEVEL=20;
// Temporary refits of the equipped weapon. No gear IDs, profile data or original catalog entries change.
const WEAPON_EVOLUTIONS=Object.freeze(Object.fromEntries(Object.entries({
 machine:[
  ['heavyFeed','ALIMENTAÇÃO PESADA','Dano por projétil ×1,3.','Tempo de recarga ×1,2.',{damage:1.3,reloadMult:1.2}],
  ['beltFeed','ESTEIRA DE MUNIÇÃO','Capacidade do carregador ×1,5.','Tempo de recarga ×1,15. Não repõe munição ao instalar.',{magazineMult:1.5,reloadMult:1.15}]],
 shotgun:[
  ['choke','GARGALO DE PRECISÃO','Dispersão ×0,5 e dano ×1,15.','Intervalo entre disparos ×1,15.',{spreadMult:.5,damage:1.15,rate:1.15}],
  ['wideBore','CÂMARA DE VARREDURA','Dois pellets adicionais por emissão, antes dos multiplicadores.','Dano por pellet ×0,8 e tempo de recarga ×1,2.',{damage:.8,reloadMult:1.2},{pellets:2}]],
 burst:[
  ['fourStroke','CICLO DE QUATRO TEMPOS','Uma bala adicional em cada rajada.','Intervalo entre rajadas ×1,2 e tempo de recarga ×1,15.',{rate:1.2,reloadMult:1.15},{burst:1}],
  ['quickBreech','CULATRA ÁGIL','Tempo de recarga ×0,75.','Dano por bala ×0,9.',{reloadMult:.75,damage:.9}]],
 sniper:[
  ['railDrill','BROCA FERROVIÁRIA','Atravessa três alvos adicionais e dano ×1,2.','Intervalo entre disparos ×1,2.',{damage:1.2,rate:1.2},{pierce:3}],
  ['cyclingBolt','FERROLHO CÍCLICO','Intervalo entre disparos ×0,75.','Dano por projétil ×0,9.',{rate:.75,damage:.9}]],
 laser:[
  ['pulseClock','OSCILADOR DE PULSOS','Intervalo entre disparos ×0,75.','Tempo de recarga ×1,25.',{rate:.75,reloadMult:1.25}],
  ['longLens','LENTE DE LONGO CURSO','Duração do projétil ×1,5 e dano ×1,2.','Intervalo entre disparos ×1,2.',{projectileLife:1.5,damage:1.2,rate:1.2}]],
 flame:[
  ['fuelMixer','MISTURADOR DE COMBUSTÍVEL','Dano da queimadura aplicada ×1,5.','Dano direto ×0,8; também reduz a base da queimadura.',{damage:.8},{},{burnMult:1.5}],
  ['longNozzle','BICO DE LONGO ALCANCE','Duração dos projéteis ×1,75.','Intervalo entre disparos ×1,2.',{projectileLife:1.75,rate:1.2}]],
 cryo:[
  ['iceDrill','BROCA GLACIAL','Atravessa dois alvos adicionais.','Dano por projétil ×0,85.',{damage:.85},{pierce:2}],
  ['deepCooling','REFRIGERAÇÃO PROFUNDA','Resfriamento por impacto dura mais 1 s; dano ×1,15.','Intervalo entre disparos ×1,15.',{damage:1.15,rate:1.15},{},{coldBonus:1}]],
 rocket:[
  ['siegeWarhead','OGIVA DE CERCO','Raio intrínseco da explosão ×1,5.','Dano ×0,85 e tempo de recarga ×1,15.',{damage:.85,reloadMult:1.15},{},{explosionMult:1.5}],
  ['guidedTube','TUBO DE PRESSÃO','Velocidade dos projéteis ×1,6 e dano ×1,25.','Raio intrínseco da explosão ×0,75. A mira continua manual.',{projectileSpeed:1.6,damage:1.25},{},{explosionMult:.75}]],
 grenade:[
  ['pressureShell','CASCO DE PRESSÃO','Raio intrínseco da explosão ×1,3.','Duração até detonar ×1,25.',{projectileLife:1.25},{},{explosionMult:1.3}],
  ['doubleShell','CARGA BIFURCADA','Uma granada adicional por emissão; dispersão em leque.','Dano por granada ×0,65 e tempo de recarga ×1,25.',{damage:.65,reloadMult:1.25},{pellets:1},{minSpread:.25}]],
 tesla:[
  ['branchCoil','BOBINA RAMIFICADA','Descargas intrínsecas alcançam dois alvos adicionais.','Dano direto e base elétrica ×0,85.',{damage:.85},{chain:2}],
  ['focusedCoil','BOBINA CONCENTRADA','Dano direto e base elétrica ×1,5.','Um alvo intrínseco a menos; intervalo entre disparos ×1,15.',{damage:1.5,rate:1.15},{chain:-1}]],
 disc:[
  ['fastRotor','ROTOR DE ALTA ROTAÇÃO','Velocidade dos projéteis ×1,4 e dano ×1,2.','Duração do projétil ×0,8.',{projectileSpeed:1.4,damage:1.2,projectileLife:.8}],
  ['impactRim','ARO DE IMPACTO','Impactos ganham explosão intrínseca de raio 48, com metade do dano.','Dano direto ×0,85 e tempo de recarga ×1,2.',{damage:.85,reloadMult:1.2},{},{explosion:48,splash:.5}]],
 harpoon:[
  ['longShaft','HASTE TRANSFIXANTE','Atravessa três alvos adicionais e dano ×1,15.','Intervalo entre disparos ×1,2.',{damage:1.15,rate:1.2},{pierce:3}],
  ['pressurePiston','PISTÃO DE PRESSÃO','Empurrão intrínseco +40; dano ×1,3 e velocidade do projétil ×1,3.','Tempo de recarga ×1,2. Chefes mantêm resistência ao empurrão.',{damage:1.3,projectileSpeed:1.3,reloadMult:1.2},{knock:40}]]
}).map(([weapon,entries])=>[weapon,Object.freeze(entries.map(([id,name,benefit,cost,multipliers,additions={},traits={}])=>Object.freeze({id:weapon+'-'+id,weapon,name,benefit,cost,multipliers:Object.freeze(multipliers),additions:Object.freeze(additions),traits:Object.freeze(traits)})))])));
const TREE_INFO=Object.freeze({sensor:{name:'Sensores de campo',category:'Controle'},corrosion:{name:'Reagentes de sucata',category:'Controle'},damage:{name:'Dano de impacto',category:'Ofensivo'},rate:{name:'Arsenal acelerado',category:'Ofensivo'},armor:{name:'Defesa pesada',category:'Defensivo'},magnet:{name:'Coleta e manutenção',category:'Suporte'},burn:{name:'Fogo industrial',category:'Ofensivo'},freeze:{name:'Controle criogênico',category:'Controle'},shock:{name:'Rede elétrica',category:'Controle'},dash:{name:'Mobilidade e reação',category:'Mobilidade'},blast:{name:'Demolição reativa',category:'Ofensivo'},drones:{name:'Enxame de manutenção',category:'Suporte'}});
const BOSS_SCHEDULE=Object.freeze([{at:60,id:'brute',name:'BRUTAMONTES',hp:650,r:32,speed:28},{at:240,id:'scrapper',name:'SUCATEIRO',hp:1300,r:30,speed:24},{at:420,id:'coil',name:'BOBINA-RAINHA',hp:1800,r:34,speed:20}]);
const BOSS_MINIONS=Object.freeze({
 brute:Object.freeze({type:'runner',badge:'CORREDOR',role:'CORREDORES',title:'CÃES DE SUCATA',count:2,hp:55,speed:62,r:13,variant:2,color:'#ffb66c'}),
 scrapper:Object.freeze({type:'gunner',badge:'ATIRADOR',role:'ATIRADORES',title:'TALHA-BOTS',count:2,hp:48,speed:25,r:12,variant:0,color:'#b6d38d'}),
 coil:Object.freeze({type:'conductor',badge:'RAJADA',role:'RAJADAS',title:'FAÍSCAS ERRANTES',count:3,hp:36,speed:40,r:11,variant:1,color:'#c3b6ed'})
});
const ROBOTS=Object.freeze({
 prot:Object.freeze({name:'PROT-0001',hp:100,speed:190,armor:0,description:'Equilibrado · 100 integridade · velocidade190 · 1 slot.',portrait:'assets/robots/prot-0001-simple.png',sprite:'prot',accent:'#71d7f2'}),
 bastion:Object.freeze({name:'BAST-0002',hp:120,speed:155,armor:1,description:'Blindado · 120 integridade · velocidade 155 · armadura1 · 1 slot.',sprite:'bastion',portrait:'assets/robots/bast-0002-portrait-v3.svg',accent:'#a8c0da'}),
 forge:Object.freeze({name:'FORJ-0003',hp:90,speed:180,armor:0,description:'Forja móvel · queimadura ×1,35 · dano direto ×0,9 · 1 slot.',sprite:'bastion',portrait:'assets/robots/forj-0003-portrait-v3.svg',accent:'#ffad6b',fallbackFilter:'sepia(.7) saturate(2) hue-rotate(335deg)'}),
 volt:Object.freeze({name:'VOLT-0004',hp:85,speed:190,armor:0,description:'Condutor · descarga ×1,35 · dano direto ×0,9 · 1 slot.',sprite:'bastion',portrait:'assets/robots/volt-0004-portrait-v3.svg',accent:'#c8b7ff',fallbackFilter:'sepia(.4) saturate(2) hue-rotate(220deg)'}),
 nano:Object.freeze({name:'NANO-0005',hp:110,speed:165,armor:0,description:'Oficina móvel · recarga cura até3 proporcionalmente · 1 slot.',sprite:'bastion',portrait:'assets/robots/nano-0005-portrait-v3.svg',accent:'#99e6b0',fallbackFilter:'sepia(.4) saturate(1.8) hue-rotate(70deg)'}),
 swarm:Object.freeze({name:'ENXA-0006',hp:95,speed:170,armor:0,description:'Enxame · um drone de apoio desde o início · 1 slot.',sprite:'bastion',portrait:'assets/robots/enxa-0006-portrait-v3.svg',accent:'#ffe6a0',fallbackFilter:'sepia(.6) saturate(1.8)'})
});
const GARAGE_PRICES=Object.freeze({
 robots:Object.freeze({bastion:Object.freeze({bolts:24}),forge:Object.freeze({bolts:28,part:'brute'}),volt:Object.freeze({bolts:28,part:'coil'}),nano:Object.freeze({bolts:24,part:'scrapper'}),swarm:Object.freeze({bolts:30,part:'coil'})}),
 weapons:Object.freeze({shotgun:Object.freeze({bolts:8}),burst:Object.freeze({bolts:12}),flame:Object.freeze({bolts:14}),disc:Object.freeze({bolts:16}),cryo:Object.freeze({bolts:18}),sniper:Object.freeze({bolts:22,part:'brute'}),harpoon:Object.freeze({bolts:24,part:'brute'}),grenade:Object.freeze({bolts:20,part:'scrapper'}),rocket:Object.freeze({bolts:26,part:'scrapper'}),laser:Object.freeze({bolts:22,part:'coil'}),tesla:Object.freeze({bolts:24,part:'coil'})})
});
const PROFILE_KEY='screwvivors.profile.v1';
const BOSS_PART_NAMES=Object.freeze({brute:'BRUTAMONTES',scrapper:'SUCATEIRO',coil:'BOBINA-RAINHA'});
const BLESSING_LEVELS=Object.freeze([3,6,9]);
let GAMBARRAS=Object.freeze([
 Object.freeze({id:'pulseCoil',name:'BOBINA DE PULSO',icon:'damage',benefit:'Dano ×1,25 nesta tentativa.',apply:()=>{player.damage*=1.25;}}),
 Object.freeze({id:'triggerRegulator',name:'REGULADOR DE GATILHO',icon:'rate',benefit:'Intervalo entre disparos ×0,8 nesta tentativa.',apply:()=>{player.rate*=.8;}}),
 Object.freeze({id:'spareBattery',name:'BATERIA DE RESERVA',icon:'titan',benefit:'Vida máxima e atual +20 nesta tentativa.',apply:()=>{player.maxHp+=20;player.hp+=20;}}),
 Object.freeze({id:'scrapMagnet',name:'ELETROÍMÃ DE SUCATA',icon:'magnet',benefit:'Alcance de coleta ×1,75 nesta tentativa.',apply:()=>{player.magnet*=1.75;}}),
 Object.freeze({id:'greasedServos',name:'SERVOS LUBRIFICADOS',icon:'speed',benefit:'Velocidade de movimento ×1,2 nesta tentativa.',apply:()=>{player.speed*=1.2;}}),
 Object.freeze({id:'copperPlate',name:'PLACA DE COBRE',icon:'armor',benefit:'Reduz 1 de dano recebido nesta tentativa.',apply:()=>{player.armor+=1;}})
]);
let BOSS_EXPERIMENTS=Object.freeze([
 Object.freeze({id:'volatileReactor',name:'REATOR VOLÁTIL',icon:'damage',benefit:'Dano ×1,35.',cost:'Intervalo de tiro ×1,15.',apply:()=>{player.damage*=1.35;player.rate*=1.15;}}),
 Object.freeze({id:'unstableLens',name:'LENTE INSTÁVEL',icon:'range',benefit:'Velocidade e tamanho de projétil ×1,5.',cost:'Movimento ×0,85.',apply:()=>{player.projectileSpeed*=1.5;player.projectileSize*=1.5;player.speed*=.85;}}),
 Object.freeze({id:'lithiumPack',name:'PACOTE DE LÍTIO',icon:'titan',benefit:'Integridade máxima e atual +30.',cost:'Armadura −1.',apply:()=>{player.maxHp+=30;player.hp+=30;player.armor-=1;}}),
 Object.freeze({id:'scrapCatalyst',name:'CATALISADOR DE SUCATA',icon:'magnet',benefit:'Alcance de coleta ×2.',cost:'Recarga da arma ×1,5.',apply:()=>{player.magnet*=2;player.reloadMult*=1.5;}}),
 Object.freeze({id:'blastCondenser',name:'CONDENSADOR DE IMPACTO',icon:'blast',benefit:'Dano ×1,5.',cost:'Intervalo de tiro ×1,35.',apply:()=>{player.damage*=1.5;player.rate*=1.35;}}),
 Object.freeze({id:'nervousServo',name:'SERVO NERVOSO',icon:'speed',benefit:'Movimento ×1,35.',cost:'Armadura −1.',apply:()=>{player.speed*=1.35;player.armor-=1;}})
]);
function emptyProfile(){return {version:2,bolts:0,bossParts:{brute:0,scrapper:0,coil:0},unlockedRobots:ownedGear({},ROBOTS,'prot'),unlockedWeapons:ownedGear({},WEAPONS,'machine')};}
function profileCount(value){const n=Number(value);return Number.isFinite(n)&&n>0?Math.min(999999999,Math.floor(n)):0;}
function ownedGear(saved,available,starting){return Object.fromEntries(Object.keys(available).map(id=>[id,id===starting||saved?.[id]===true]));}
let profileStorageAvailable=true;
function loadProfile(){
 try{
  const saved=JSON.parse(localStorage.getItem(PROFILE_KEY)||'null');
  if(saved?.version===1){const migrated={version:2,bolts:profileCount(saved.bolts),bossParts:Object.fromEntries(Object.keys(BOSS_PART_NAMES).map(id=>[id,profileCount(saved.bossParts?.[id])])),unlockedRobots:Object.fromEntries(Object.keys(ROBOTS).map(id=>[id,['prot','bastion'].includes(id)])),unlockedWeapons:Object.fromEntries(Object.keys(WEAPONS).map(id=>[id,true]))};try{localStorage.setItem(PROFILE_KEY,JSON.stringify(migrated));profileStorageAvailable=true;}catch{profileStorageAvailable=false;}return migrated;}
  if(saved?.version!==2)return emptyProfile();
  return {version:2,bolts:profileCount(saved.bolts),bossParts:Object.fromEntries(Object.keys(BOSS_PART_NAMES).map(id=>[id,profileCount(saved.bossParts?.[id])])),unlockedRobots:ownedGear(saved.unlockedRobots,ROBOTS,'prot'),unlockedWeapons:ownedGear(saved.unlockedWeapons,WEAPONS,'machine')};
 }catch{profileStorageAvailable=false;return emptyProfile();}
}
let profile=loadProfile();
function renderProfileResources(){
 const bolts=el('profile-bolts'),parts=el('profile-parts'),status=el('profile-save-status');
 if(bolts)bolts.textContent='PARAFUSOS · '+profile.bolts.toLocaleString('pt-BR');
 if(parts)parts.textContent=Object.entries(BOSS_PART_NAMES).map(([id,name])=>name+' · '+profile.bossParts[id]).join('   /   ');
 if(status){status.textContent=profileStorageAvailable?'SALVO NESTE DISPOSITIVO':'SALVAMENTO LOCAL INDISPONÍVEL';status.style.color=profileStorageAvailable?'#81d7be':'#ff8b8b';}
}
function saveProfile(){
 try{localStorage.setItem(PROFILE_KEY,JSON.stringify(profile));profileStorageAvailable=true;}catch{profileStorageAvailable=false;}
 renderProfileResources();return profileStorageAvailable;
}
function awardBossPart(id){
 if(!Object.hasOwn(profile.bossParts,id))return false;
 profile.bossParts[id]++;saveProfile();toast('PEÇA RECUPERADA: '+BOSS_PART_NAMES[id],'#ffd27c');return true;
}
function gearPrice(kind,id){return GARAGE_PRICES[kind]?.[id]||null;}
function gearOwned(kind,id){return profile[kind==='robots'?'unlockedRobots':'unlockedWeapons']?.[id]===true;}
function gearPriceText(kind,id){const price=gearPrice(kind,id);if(!price)return '';return price.bolts+' PARAFUSOS'+(price.part?' + 1 PEÇA '+BOSS_PART_NAMES[price.part]:'');}
function selectGear(kind,id){if(kind==='robots')return selectRobot(id);if(kind==='weapons')return selectWeapon(id);return false;}
function activateGear(kind,id){if(state!=='garage')return false;return gearOwned(kind,id)?selectGear(kind,id):purchaseGear(kind,id);}
function purchaseGear(kind,id){
 if(state!=='garage'||!['robots','weapons'].includes(kind)||!Object.hasOwn(kind==='robots'?ROBOTS:WEAPONS,id)||gearOwned(kind,id))return false;
 const price=gearPrice(kind,id);if(!price)return false;
 if(profile.bolts<price.bolts||(price.part&&profile.bossParts[price.part]<1)){el('garage-feedback').textContent='RECURSOS INSUFICIENTES · '+gearPriceText(kind,id);el((kind==='robots'?'robot-status-':'weapon-status-')+id).textContent='FALTAM RECURSOS';return false;}
 const next={...profile,bolts:profile.bolts-price.bolts,bossParts:{...profile.bossParts},unlockedRobots:{...profile.unlockedRobots},unlockedWeapons:{...profile.unlockedWeapons}};
 if(price.part)next.bossParts[price.part]--;
 (kind==='robots'?next.unlockedRobots:next.unlockedWeapons)[id]=true;
 profile=next;
 if(!saveProfile()){profile={...next,bolts:next.bolts+price.bolts,bossParts:{...next.bossParts,...(price.part?{[price.part]:next.bossParts[price.part]+1}:{})},unlockedRobots:{...next.unlockedRobots},unlockedWeapons:{...next.unlockedWeapons}};(kind==='robots'?profile.unlockedRobots:profile.unlockedWeapons)[id]=false;renderProfileResources();el('garage-feedback').textContent='COMPRA NÃO SALVA · RECURSOS DEVOLVIDOS';renderLoadout();return false;}
 if(kind==='robots')selectedRobot=id;else selectedWeapon=id;
 el('garage-feedback').textContent=(ROBOTS[id]?.name||WEAPONS[id].name)+' DESBLOQUEADO';
 renderLoadout();return true;
}
let width=1000,height=600,state='title',last=0,clock=0,spawn=0,shot=0,kills=0,level=1,xp=0,need=PROGRESSION.initialNeed;
let policeUnlocked=false;
let bossIndex=0,bossKills=0,commonWaveIndex=0,hazards=[],cooldownNodes=[],cooldownLayout='';
let selectedRobot='prot',runRobot=null,burstQueue=[],robotSprite=null,protSprite=null,protAnimation=null,chassisAnimations=new Map(),arenaTile=null,arenaPattern=null;
const ZOMBIE_VARIANTS=[
 {name:'ex-mechanico',src:'assets/enemies/zombie-mechanic.png'},
 {name:'catador',src:'assets/enemies/zombie-scavenger.png'},
 {name:'seguranca',src:'assets/enemies/zombie-security-brute.png'}
];
let zombieSprites=[];
if(typeof Image!=='undefined'){robotSprite=new Image();robotSprite.src='assets/robots/bast-0002-walk.svg';protSprite=new Image();protSprite.src='assets/robots/prot-0001-simple.png';arenaTile=new Image();arenaTile.src='assets/arena/blue-asphalt-tile.png';zombieSprites=ZOMBIE_VARIANTS.map(({src})=>{const sprite=new Image();sprite.src=src;return sprite;});}
let selectedWeapon='machine',runWeapon=null,player=null,enemies=[],bullets=[],gems=[],scrap=[],sparks=[],feedback=[],effects=[],hostile=[];
let SPECIALIZATIONS=Object.freeze({
 prot:[
  {id:'tailDecoy',name:'ISCA DE CAUDA',benefit:'Após sofrer dano não letal, deixa um eco por 1,5 s que atrai perseguidores comuns. Recarga 24 s.',cost:'Chefes, lacaios e atiradores ignoram o eco.'},
  {id:'predatorMark',name:'MARCA DO PREDADOR',benefit:'O primeiro acerto marca um alvo por 2,5 s. Acertos seguintes nele causam +25% de dano.',cost:'Só um alvo marcado; acertar outro transfere a marca.'},
  {id:'nineLives',name:'ALERTA DE NOVE VIDAS',benefit:'Ao cruzar abaixo de 20% de integridade, empurra comuns próximos em 90 px e interrompe por 0,5 s. Raio 100 px; recarga 30 s.',cost:'Não cura nem concede invulnerabilidade; exige sobreviver ao golpe.'}
 ],
 bastion:[
  {id:'grounding',name:'ATERRAMENTO DE CAMPO',benefit:'Recebe 30% menos dano das zonas de perigo dos chefes.',cost:'Não reduz contato nem projéteis.'},
  {id:'magneticBrake',name:'FREIO ELETROMAGNÉTICO',benefit:'Projéteis hostis dentro de 90 px movem-se 25% mais devagar.',cost:'Não afeta investidas nem projéteis do jogador.'},
  {id:'threatReader',name:'PROTOCOLO DE LEITURA',benefit:'Avisos de chefe iniciados a até 180 px duram 20% mais.',cost:'Não retarda a execução dos ataques nem altera o relógio.'}
 ]
});
let specializationOffered=false,offeredSpecializations=[];
let weaponEvolutionOffered=false,offeredWeaponEvolutions=[];
function finishWeaponEvolution(){
 offerVersion++;state='playing';el('overlay').hidden=true;clearInput();updateHUD();el('pause').focus();
}
function chooseWeaponEvolution(id,version){
 if(state!=='evolution'||version!==offerVersion||player.weaponEvolution||level<WEAPON_EVOLUTION_LEVEL)return false;
 const item=offeredWeaponEvolutions.find(e=>e.id===id&&e.weapon===runWeapon.id);if(!item)return false;
 // Installation preserves ammo, reload progress and old projectiles. Only future emissions use the refit.
 for(const [key,factor] of Object.entries(item.multipliers))player[key]*=factor;
 const refit={...runWeapon};for(const [key,value] of Object.entries(item.additions))refit[key]=(refit[key]||0)+value;
 if(item.traits.explosionMult)refit.explosion*=item.traits.explosionMult;
 if(item.traits.explosion){refit.explosion=item.traits.explosion;refit.splash=item.traits.splash;}
 if(item.traits.minSpread)refit.spread=Math.max(refit.spread,item.traits.minSpread);
 player.weaponEvolution=item;runWeapon=Object.freeze(refit);player.ammo=Math.min(player.ammo,magazineSize());
 sound('upgrade');upgradeFlash=1;toast(item.name+' INSTALADA','#a6eaff');finishWeaponEvolution();return true;
}
function declineWeaponEvolution(version){if(state!=='evolution'||version!==offerVersion)return false;finishWeaponEvolution();return true;}
function offerWeaponEvolution(){
 if(state!=='playing'||weaponEvolutionOffered||player.weaponEvolution||level<WEAPON_EVOLUTION_LEVEL)return false;
 weaponEvolutionOffered=true;offeredWeaponEvolutions=WEAPON_EVOLUTIONS[runWeapon.id].slice();state='evolution';
 show('REFORJA DA ARMA','Nível '+WEAPON_EVOLUTION_LEVEL+' · '+runWeapon.name+'. Escolha uma evolução temporária da arma equipada. Sem troca ou fusão; não repõe munição nem conclui a recarga. Esta oferta substitui o módulo deste nível e não volta ao recusar.','');
 const version=++offerVersion;
 for(const [index,item] of offeredWeaponEvolutions.entries()){
  const card=document.createElement('button'),category=document.createElement('span'),title=document.createElement('strong'),benefit=document.createElement('span'),cost=document.createElement('span'),action=document.createElement('span');
  card.className='upgrade-card specialization-card weapon-evolution-card';card.setAttribute('data-evolution',item.id);card.setAttribute('aria-keyshortcuts',String(index+1));category.className='skill-category';category.textContent=runWeapon.name+' / REFORJA TEMPORÁRIA';title.textContent=item.name;benefit.className='skill-benefit';benefit.textContent='VANTAGEM: '+item.benefit;cost.className='skill-cost';cost.textContent='CUSTO: '+item.cost;action.className='skill-action';action.textContent='['+(index+1)+'] INSTALAR REFORJA';card.append(category,title,benefit,cost,action);card.onclick=()=>chooseWeaponEvolution(item.id,version);el('choices').append(card);
 }
 const skip=document.createElement('button');skip.className='skip-upgrade';skip.textContent='MANTER ARMA ATUAL [R]';skip.setAttribute('aria-keyshortcuts','R');skip.onclick=()=>declineWeaponEvolution(version);el('choices').append(skip);el('choices').children[0]?.focus();return true;
}
SPECIALIZATIONS={...SPECIALIZATIONS,
 forge:[{id:'furnaceDuration',name:'CÂMARA DE FORNALHA',benefit:'Duração da queimadura ×1,5.',cost:'Afeta queimaduras aplicadas após a escolha.'},{id:'thermalAmplifier',name:'AMPLIFICADOR TÉRMICO',benefit:'Queimadura em alvos resfriados causa +25% de dano.',cost:'Exige resfriar o alvo.'},{id:'heatRecovery',name:'RECUPERADOR DE CALOR',benefit:'Abates por queimadura recuperam1 de integridade. Recarga2s.',cost:'Sem cura em integridade cheia.'}],
 volt:[{id:'extraFork',name:'DERIVAÇÃO ADICIONAL',benefit:'Descargas atingem um alvo adicional.',cost:'Exige arma elétrica ou Descarga.'},{id:'chargeRecovery',name:'RECUPERAÇÃO DE CARGA',benefit:'A cada6 alvos eletrocutados repõe uma munição. Recarga0,25s.',cost:'Não ultrapassa o carregador.'},{id:'groundPulse',name:'PULSO DE ATERRAMENTO',benefit:'Descargas interrompem comuns por mais0,35s; chefes por0,1s.',cost:'Não cancela ataques já preparados.'}],
 nano:[{id:'repairCharge',name:'CARGA DE REPARO',benefit:'Cura real fortalece o próximo disparo em50% e acrescenta2 perfurações.',cost:'Não acumula; uma emissão consome a carga.'},{id:'repairPlating',name:'REVESTIMENTO REPARADOR',benefit:'Cura real concede redução2 de dano por2s.',cost:'Não acumula proteção.'},{id:'coolantLoop',name:'CIRCUITO REFRIGERANTE',benefit:'Recarga de ao menos50% resfria inimigos em80px por2s.',cost:'Exige recarregar metade do carregador.'}],
 swarm:[{id:'droneSalvage',name:'RECICLAGEM DO ENXAME',benefit:'Abates por drone curam1 de integridade. Recarga1,5s.',cost:'Somente abates do drone.'},{id:'droneBossFocus',name:'FOCO ANTICHEFE',benefit:'Drones priorizam chefe no alcance e causam +25% de dano nele.',cost:'Não aumenta alcance.'},{id:'droneRelay',name:'RELÉ DO ENXAME',benefit:'Alcance dos drones +100px; coleta ×1,25.',cost:'Não aumenta o número de drones.'}]
};
function specializationInfo(){return Object.values(SPECIALIZATIONS).flat().find(s=>s.id===player?.specialization);}
function commonPursuer(z){return !z.minionType&&!z.minionOwner&&['chaser','heavy'].includes(z.enemyType);}
function chooseSpecialization(id,version){
 if(state!=='specialization'||version!==offerVersion||player.specialization)return false;
 const item=offeredSpecializations.find(s=>s.id===id);if(!item)return false;
 player.specialization=id;applyRunBalance(id,()=>{if(id==='droneRelay')player.magnet*=1.25;});offerVersion++;state='playing';el('overlay').hidden=true;clearInput();toast(item.name+' ATIVA','#ffd27c');updateHUD();el('pause').focus();return true;
}
function offerSpecialization(){
 if(specializationOffered||player.specialization)return false;
 specializationOffered=true;state='specialization';show('ESPECIALIZAÇÃO DO CHASSI','Nível 10: escolha um protocolo próprio do seu robô. Vale só nesta tentativa. Sem penalidade adicional além das condições indicadas.','');
 offeredSpecializations=SPECIALIZATIONS[runRobot.id].slice();const version=++offerVersion;
 for(const [index,item] of offeredSpecializations.entries()){
  const card=document.createElement('button'),title=document.createElement('strong'),benefit=document.createElement('span'),cost=document.createElement('span'),action=document.createElement('span');card.className='upgrade-card specialization-card';card.setAttribute('data-specialization',item.id);title.textContent=item.name;benefit.className='skill-benefit';benefit.textContent=item.benefit;cost.className='skill-cost';cost.textContent='CONDIÇÕES: '+item.cost;action.className='skill-action';action.textContent='['+(index+1)+'] ATIVAR PROTOCOLO';card.append(title,benefit,cost,action);card.onclick=()=>chooseSpecialization(item.id,version);el('choices').append(card);
 }
 const skip=document.createElement('button');skip.className='skip-upgrade';skip.textContent='CONTINUAR SEM ESPECIALIZAÇÃO';skip.onclick=()=>{if(state!=='specialization'||version!==offerVersion)return;offerVersion++;state='playing';clearInput();el('overlay').hidden=true;updateHUD();el('pause').focus();};el('choices').append(skip);el('choices').children[0]?.focus();return true;
}
let camera={x:0,y:0},aim={x:0,y:0,active:false},firing=false,upgradeFlash=0,boss=null,bossSpawned=false,bossDefeated=false,bossReward=false,offerVersion=0,offerSource='level',offeredBlessings=[],offeredExperiments=[];
const BATTERY_COUNT=5,HP_PER_BATTERY=20;
let displayedHealth=null;
function renderHealth(hp){
 const max=player?.maxHp||100;hp=Math.max(0,Math.min(max,hp));const key=hp+'/'+max;if(displayedHealth===key)return;displayedHealth=key;
 const health=el('health');health.setAttribute('aria-valuemax',String(max));health.setAttribute('aria-valuenow',String(hp));health.setAttribute('aria-valuetext',Math.ceil(hp)+' de '+max+' de integridade');
 el('health-fill').style.width=(hp/max*100)+'%';el('health-value').textContent=Math.ceil(hp)+' / '+max;
}

function clearInput(){keys.clear();firing=false;burstQueue=[];}
function syncCamera(dt=0){
 if(!dt){camera.x=player.x-width/2;camera.y=player.y-height/2;return;}
 const ox=player.x-camera.x-width/2,oy=player.y-camera.y-height/2,blend=1-Math.exp(-6*dt);
 camera.x+=Math.sign(ox)*Math.max(0,Math.abs(ox)-Math.min(75,width*.08))*blend;
 camera.y+=Math.sign(oy)*Math.max(0,Math.abs(oy)-Math.min(50,height*.08))*blend;
}
function resize(){const r=canvas.getBoundingClientRect();width=r.width||1000;height=r.height||600;const pixelScale=.5;canvas.width=Math.max(1,Math.round(width*pixelScale));canvas.height=Math.max(1,Math.round(height*pixelScale));ctx.setTransform(pixelScale,0,0,pixelScale,0,0);ctx.imageSmoothingEnabled=false;if(player)syncCamera();}
window.addEventListener('resize',resize);
function selectWeapon(id){if(state!=='garage'||!WEAPONS[id]||!gearOwned('weapons',id))return false;selectedWeapon=id;el('garage-feedback').textContent='';renderLoadout();return true;}
if(globalThis.SpriteAnimation&&globalThis.ScrewProtAnimation){const manifest=globalThis.ScrewProtAnimation;globalThis.SpriteAnimation.load(manifest.image,manifest.clips,{scale:manifest.scale}).then(animation=>{protAnimation=animation;animation.play('idle','down');}).catch(()=>{});}
if(globalThis.SpriteAnimation&&globalThis.ScrewChassisAtlases)for(const [id,manifest] of Object.entries(globalThis.ScrewChassisAtlases)){const load=m=>globalThis.SpriteAnimation.load(m.image,m.clips,{scale:m.scale});load(manifest).catch(()=>load(manifest.fallback)).then(animation=>{animation.play('idle','down');chassisAnimations.set(id,animation);}).catch(()=>{});}
function selectRobot(id){if(state!=='garage'||!ROBOTS[id]||!gearOwned('robots',id))return false;selectedRobot=id;el('garage-feedback').textContent='';renderLoadout();return true;}

function renderRobotOptions(){const box=document.querySelector('.robot-options');if(!box?.replaceChildren)return;box.replaceChildren();for(const [id,robot] of Object.entries(ROBOTS)){const button=document.createElement('button'),name=document.createElement('span'),status=document.createElement('small');button.type='button';button.id='robot-'+id;name.textContent=robot.name;status.id='robot-status-'+id;button.append(name,status);button.onclick=()=>activateGear('robots',id);box.append(button);}}
window.ScrewBuildGuide=Object.freeze({getCatalog:()=>({robots:ROBOTS,weapons:WEAPONS,evolutions:WEAPON_EVOLUTIONS}),gearOwned:(kind,id)=>gearOwned(kind,id),getPriceText:(kind,id)=>gearPriceText(kind,id),getProgress:()=>({state,robot:state==='garage'||state==='configuration'?selectedRobot:runRobot?.id||selectedRobot,weapon:state==='garage'||state==='configuration'?selectedWeapon:runWeapon?.id||selectedWeapon,acquired:[...(player?.acquired||[])],blessings:[...(player?.blessings||[])],experiments:[...(player?.experiments||[])],weaponEvolution:player?.weaponEvolution?.id||null,specialization:player?.specialization||null,droneCount:player&&runRobot?droneCount():0,offered:state==='evolution'?offeredWeaponEvolutions.map(s=>s.id):state==='specialization'?offeredSpecializations.map(s=>s.id):state==='blessing'?offeredBlessings.map(s=>s.id):state==='experiment'?offeredExperiments.map(s=>s.id):['upgrade','reward'].includes(state)?offeredSkills.map(s=>s.id):[]}),selectBuild(id){if(state!=='garage')return {ok:false,error:'Volte à garagem para escolher uma configuração.'};const build=window.ScrewBuilds?.builds?.find(b=>b.id===id);if(!build||!ROBOTS[build.robot]||!WEAPONS[build.weapon])return {ok:false,error:'Guia inválido.'};if(!gearOwned('robots',build.robot)||!gearOwned('weapons',build.weapon))return {ok:false,error:'Desbloqueie o chassi e a arma antes de selecionar.'};selectedRobot=build.robot;selectedWeapon=build.weapon;renderLoadout();return {ok:true};}});

function renderWeaponRefitManual(){
 const box=el('weapon-refit-options');box.replaceChildren();
 for(const item of WEAPON_EVOLUTIONS[selectedWeapon]){const card=document.createElement('article'),name=document.createElement('h3'),benefit=document.createElement('p'),cost=document.createElement('p');name.textContent=item.name;benefit.textContent='VANTAGEM: '+item.benefit;cost.textContent='CUSTO: '+item.cost;card.append(name,benefit,cost);box.append(card);}
}
function renderLoadout(){
 renderProfileResources();renderWeaponRefitManual();
 for(const id of Object.keys(ROBOTS)){const button=el('robot-'+id),owned=gearOwned('robots',id);button.setAttribute('aria-pressed',String(id===selectedRobot));button.setAttribute('aria-label',ROBOTS[id].name+(owned?'':' · BLOQUEADO · '+gearPriceText('robots',id)));el('robot-status-'+id).textContent=owned?(id===selectedRobot?'SELECIONADO':'DESBLOQUEADO'):'DESBLOQUEAR · '+gearPriceText('robots',id);}
 el('chassis-name').textContent=ROBOTS[selectedRobot].name;el('chassis-description').textContent=ROBOTS[selectedRobot].description;
 el('garage-robot-preview').src=(ROBOTS[selectedRobot].portrait||'assets/robots/prot-0001-simple.png');el('garage-robot-preview').style.filter=ROBOTS[selectedRobot].filter||'none';
 for(const id of Object.keys(WEAPONS)){const button=el('weapon-'+id),owned=gearOwned('weapons',id);button.setAttribute('aria-pressed',String(id===selectedWeapon));button.setAttribute('aria-label',WEAPONS[id].name+(owned?'':' · BLOQUEADA · '+gearPriceText('weapons',id)));el('weapon-status-'+id).textContent=owned?(id===selectedWeapon?'SELECIONADA':'DESBLOQUEADA'):'DESBLOQUEAR · '+gearPriceText('weapons',id);}
 el('loadout').textContent=ROBOTS[selectedRobot].name+' · 1 slot · '+WEAPONS[selectedWeapon].name;
 if(typeof window.dispatchEvent==='function'&&typeof window.CustomEvent==='function')window.dispatchEvent(new window.CustomEvent('screw:garage-change'));el('weapon-description').textContent=WEAPONS[selectedWeapon].description+' Carregador: '+AMMO[selectedWeapon][0]+' · recarga: '+AMMO[selectedWeapon][1].toFixed(1)+' s.';
}
function screenTransition(){sound("transition");const curtain=el("screen-transition");curtain.style.animation="none";requestAnimationFrame(()=>{curtain.style.animation="screenFade .35s ease-out";});}
function openMenu(){
 screenTransition();
 el('run-config').hidden=true;clearInput();offerVersion++;state='title';el('title-screen').hidden=false;el('garage').hidden=true;el('combat').hidden=true;
 el('enter-garage').focus();
}
function openGarage(){
 screenTransition();
 el('run-config').hidden=true;clearInput();offerVersion++;state='garage';el('title-screen').hidden=true;el('garage').hidden=false;el('combat').hidden=true;
 el('overlay').hidden=true;el('garage-feedback').textContent='';renderLoadout();renderCompendium();el('launch').focus();
}
function openRunConfig(){
 if(state!=='garage')return false;screenTransition();clearInput();offerVersion++;state='configuration';el('garage').hidden=true;el('combat').hidden=true;el('title-screen').hidden=true;el('run-config').hidden=false;el('config-robot').textContent=ROBOTS[selectedRobot].name;el('config-weapon').textContent=WEAPONS[selectedWeapon].name+' · 1 SLOT';el('config-portrait').src=ROBOTS[selectedRobot].portrait;el('config-portrait').style.filter=ROBOTS[selectedRobot].filter||'none';el('deploy-run').focus();return true;
}
function reset(){
 screenTransition();
 configureRunBalance();clearInput();offerVersion++;if(protAnimation){protAnimation.play('idle','down');protAnimation.time=0;}for(const animation of chassisAnimations.values()){animation.play('idle','down');animation.time=0;}runRobot=Object.freeze({...ROBOTS[selectedRobot],id:selectedRobot});runWeapon=Object.freeze({...WEAPONS[selectedWeapon],id:selectedWeapon});
 el('run-config').hidden=true;el('title-screen').hidden=true;el('garage').hidden=true;el('combat').hidden=false;resize();
 player={weaponKick:0,sensorDamageMult:1,sensorIntervalMult:1,sensorRange:170,sensorTimer:0,sensorTotal:3,corrosionDamageMult:1,corrosionDelayMult:1,weaponEvolution:null,specialization:null,specializationCooldown:0,electricHits:0,repairShotReady:false,repairArmorTime:0,droneTimer:0,droneDamageMult:1,droneRateMult:1,droneRange:320,reloadMissing:0,reloadCapacity:1,decoy:null,markedTarget:null,markTime:0,acquired:new Set(),blessings:new Set(),experiments:new Set(),magazineMult:1,reloadMult:1,projectileMult:1,projectileSpeed:1,projectileSize:1,projectileLife:1,spreadMult:1,shotCount:0,killCounter:0,stationary:0,hitCooldowns:{emergency:0,retaliation:0,overload:0},frenzy:0,ammo:AMMO[selectedWeapon][0],reloadTime:0,reloadTotal:0,x:width/2,y:height/2,hp:runRobot.hp,maxHp:runRobot.hp,speed:runRobot.speed,armor:runRobot.armor,baseDamage:runWeapon.damage,damage:runWeapon.damage*(['forge','volt'].includes(runRobot.id)?.9:1),damageStacks:0,rate:runWeapon.rate,rateStacks:0,magnet:PROGRESSION.baseMagnet,walkPhase:0,stride:0,facing:'down',inv:0,skills:{pierce:0,blast:0,shock:0,crit:0,burn:0,freeze:0,knock:0,salvage:0,armor:0,regen:0,range:0,extra:0,shield:0,xp:0,grace:0,bossHunter:0,finisher:0,ricochet:0,blastRadius:0,conductivity:0,stun:0,emergency:0,dash:0},regenTimer:0,shieldReady:false,shieldTimer:0,emergencyUsed:false,dashTime:0,dashCooldown:0,dashDx:1,dashDy:0};
 enemies=[];bullets=[];gems=[];scrap=[];sparks=[];feedback=[];effects=[];hostile=[];cooldownLayout='';cooldownNodes=[];el('cooldowns').replaceChildren();
 boss=null;bossIndex=0;bossKills=0;policeUnlocked=false;commonWaveIndex=0;rerollsRemaining=1;specializationOffered=false;offeredSpecializations=[];weaponEvolutionOffered=false;offeredWeaponEvolutions=[];hazards=[];bossSpawned=false;bossDefeated=false;bossReward=false;offeredBlessings=[];offeredExperiments=[];clock=0;spawn=HORDE.initialDelay;shot=0;kills=0;level=1;xp=0;need=PROGRESSION.initialNeed;upgradeFlash=0;displayedHealth=null;
 aim={x:width/2+100,y:height/2,active:false};syncCamera();state='playing';el('overlay').hidden=true;el('pause').textContent='Ⅱ';el('pause').setAttribute('aria-label','Pausar partida');updateHUD();
}
function show(title,description,label){
 clearInput();el('overlay').setAttribute('data-mode',state);el('heading').textContent=title;el('description').textContent=description;
 el('eyebrow').textContent=state==='evolution'?'OFICINA DE CAMPO / REFORJA':state==='reward'?'RECUPERAÇÃO DE CAMPO':state==='experiment'?'LABORATÓRIO DO BIRUTA':state==='blessing'?'OFICINA DE CAMPO / GAMBIARRA':(runRobot?.name||'PROT-0001')+' / '+(state==='over'?'SINAL PERDIDO':'PROTOCOLO ATIVO');
 el('module-workbench').hidden=true;el('choices').replaceChildren();el('start').textContent=label;el('start').hidden=!label;el('overlay').hidden=false;
 el('return-garage').hidden=state!=='over'&&state!=='won'&&state!=='paused';
 if(label)el('start').focus();
}
function renderRunStats(){
 const panel=document.createElement('section'),heading=document.createElement('h3'),stats=document.createElement('dl');panel.className='run-stats';panel.setAttribute('aria-label','Diagnóstico da tentativa');heading.textContent=runRobot.name+' / '+runWeapon.name;
 const number=value=>Number(value.toFixed(2)).toLocaleString('pt-BR');
 const rows=[['Integridade',number(player.hp)+' / '+number(player.maxHp)],['Dano direto por projétil',number(shotDamage())],['Intervalo entre disparos',number(fireInterval())+' s'],['Carregador',player.ammo+' / '+magazineSize()],['Recarga completa',number(reloadDuration())+' s'],['Movimento',number(player.speed)+' px/s'],['Redução de dano',number(player.armor)],['Atração de itens',number(player.magnet)+' px']];
 if(player.skills.sensor)rows.push(['Sensor · dano por alvo',number(Math.min(1e9,player.damage*.35*player.sensorDamageMult))],['Sensor · próximo intervalo',number(sensorInterval())+' s'],['Sensor · alcance',number(sensorRange())+' px']);
 if(player.skills.corrosion)rows.push(['Prazo de novas cargas corrosivas',number(Math.max(.25,Math.min(30,2*player.corrosionDelayMult)))+' s'],['Base da carga corrosiva',number(player.corrosionDamageMult*100)+'% do dano do projétil']);
 if(droneCount())rows.push(['Drones de apoio',String(droneCount())],['Dano por drone',number(player.damage*.25*player.droneDamageMult)],['Intervalo dos drones',number(Math.max(.35,.8*player.droneRateMult))+' s'],['Alcance dos drones',number(player.droneRange+(player.specialization==='droneRelay'?100:0))+' px']);
 for(const [label,value] of rows){const term=document.createElement('dt'),detail=document.createElement('dd');term.textContent=label;detail.textContent=value;stats.append(term,detail);}
 const note=document.createElement('p');note.textContent='Valores atuais da build. Críticos, efeitos condicionais, rajadas e dano de área não estão somados ao dano direto.';
 const installed=document.createElement('p');installed.className='run-modules';const names=SKILLS.filter(s=>player.acquired.has(s.id)).map(s=>s.name).concat(GAMBARRAS.filter(s=>player.blessings.has(s.id)).map(s=>s.name),BOSS_EXPERIMENTS.filter(s=>player.experiments.has(s.id)).map(s=>s.name));installed.textContent='INSTALADOS: '+(names.join(' · ')||'Nenhum módulo temporário.');
 const synergies=document.createElement('p');synergies.textContent='SINERGIAS: '+(activeSynergies().join(' · ')||'Nenhuma ativa.');const specialization=document.createElement('p');specialization.textContent='ESPECIALIZAÇÃO: '+(specializationInfo()?.name||'Nenhuma escolhida.')+(player.specializationCooldown>0?' · RECARGA '+Math.ceil(player.specializationCooldown)+' s':player.specialization&&['tailDecoy','nineLives'].includes(player.specialization)?' · PRONTO':'');const evolution=document.createElement('p');evolution.textContent='REFORJA DA ARMA: '+(player.weaponEvolution?player.weaponEvolution.name+' · '+player.weaponEvolution.benefit+' Custo: '+player.weaponEvolution.cost:'Nenhuma escolhida; oferta no nível '+WEAPON_EVOLUTION_LEVEL+'.');panel.append(heading,stats,note,installed,synergies,specialization,evolution);el('choices').append(panel);
}
function pause(){if(state==='playing'){sound('pause');state='paused';show('Sistema em espera.','A partida está pausada.','CONTINUAR');renderRunStats();el('pause').textContent='▶';el('pause').setAttribute('aria-label','Continuar partida (P ou Esc)');}else if(state==='paused'){sound('resume');state='playing';clearInput();el('overlay').hidden=true;el('pause').textContent='Ⅱ';el('pause').setAttribute('aria-label','Pausar partida (P ou Esc)');}}
function unlockAudio(){window.ScrewAudio?.unlock()?.then(ok=>{if(ok)el('enable-audio').hidden=true;});}
el('enable-audio').onclick=unlockAudio;document.addEventListener('pointerdown',unlockAudio);document.addEventListener('keydown',unlockAudio);
el('music-volume').addEventListener('input',e=>window.ScrewAudio?.setMusicVolume(Number(e.target.value)));
el('effects-volume').addEventListener('input',e=>window.ScrewAudio?.setEffectsVolume(Number(e.target.value)));
el('launch').onclick=openRunConfig;el('deploy-run').onclick=()=>{if(state==='configuration')reset();};el('config-back').onclick=()=>{if(state==='configuration')openGarage();};
el('enter-garage').onclick=openGarage;el('garage-back').onclick=openMenu;
for(const id of Object.keys(WEAPONS))el('weapon-'+id).onclick=()=>activateGear('weapons',id);
renderRobotOptions();for(const id of Object.keys(ROBOTS))el('robot-'+id).onclick=()=>activateGear('robots',id);
el('start').onclick=()=>state==='paused'?pause():reset();el('pause').onclick=pause;el('return-garage').onclick=openGarage;
window.addEventListener('keydown',e=>{if(e.target?.closest?.('#build-project-dialog'))return;if(state==='garage'||state==='configuration')return;if(e.key===' '&&e.target?.closest?.('button,input,select,textarea,a'))return;if(['upgrade','reward'].includes(state)&&e.key==='Enter'&&!e.repeat){if(e.target?.closest?.('button,input,select,textarea,a'))return;e.preventDefault();chooseSkill(previewedSkill,offerVersion);return;}if(state==='upgrade'&&e.key.toLowerCase()==='q'&&!e.repeat){e.preventDefault();rerollUpgrade(offerVersion);return;}if(state==='evolution'&&e.key.toLowerCase()==='r'&&!e.repeat){e.preventDefault();declineWeaponEvolution(offerVersion);return;}if(state==='experiment'&&e.key.toLowerCase()==='r'&&!e.repeat){e.preventDefault();declineExperiment(offerVersion);return;}if(['upgrade','reward','blessing','experiment','specialization','evolution'].includes(state)&&!e.repeat&&['1','2','3'].includes(e.key)){e.preventDefault();const index=Number(e.key)-1;if(state==='evolution'){const choice=offeredWeaponEvolutions[index];if(choice)chooseWeaponEvolution(choice.id,offerVersion);}else if(state==='specialization'){const choice=offeredSpecializations[index];if(choice)chooseSpecialization(choice.id,offerVersion);}else if(state==='blessing'){const choice=offeredBlessings[index];if(choice)chooseBlessing(choice.id,offerVersion);}else if(state==='experiment'){const choice=offeredExperiments[index];if(choice)chooseExperiment(choice.id,offerVersion);}else{const choice=offeredSkills[index];if(choice){previewSkill(choice.id,offerVersion);el('confirm-upgrade').focus();}}return;}if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();if(state==='playing')keys.add(e.key.toLowerCase());if(state==='playing'&&e.key===' '&&!e.repeat)activateDash();if(state==='playing'&&e.key.toLowerCase()==='r'&&!e.repeat)startReload();if((e.key.toLowerCase()==='p'||e.key==='Escape')&&!e.repeat)pause();});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
window.addEventListener('blur',()=>{clearInput();if(state==='playing')pause();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){window.ScrewAudio?.setScene(null);clearInput();if(state==='playing')pause();}});
function updateAim(e){const r=canvas.getBoundingClientRect();aim={x:(e.clientX-r.left)*width/r.width,y:(e.clientY-r.top)*height/r.height,active:true};}
canvas.addEventListener('pointermove',e=>{if(e.pointerType!=='touch')updateAim(e);});
canvas.addEventListener('pointerdown',e=>{if(state!=='playing'||e.button!==0||e.pointerType==='touch')return;updateAim(e);firing=true;canvas.setPointerCapture(e.pointerId);});
window.addEventListener('pointerup',e=>{if(e.button===0){firing=false;burstQueue=[];}});
for(const event of ['pointercancel','lostpointercapture'])canvas.addEventListener(event,()=>{firing=false;burstQueue=[];});
function activateDash(){
 if(state!=='playing'||!player.skills.dash||player.dashCooldown>0)return false;
 let dx=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft')),dy=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));
 if(!dx&&!dy){if(aim.active){dx=aim.x+camera.x-player.x;dy=aim.y+camera.y-player.y;}else dx=1;}
 const d=Math.hypot(dx,dy)||1;player.dashDx=dx/d;player.dashDy=dy/d;player.dashTime=.15;player.dashCooldown=4;sound("dash");
 effects.push({x:player.x,y:player.y,r:38,life:.2,max:.2,color:'#b9efff'});toast('PROPULSOR');return true;
}
function activeSynergies(){const s=player.skills;return [s.sensor&&s.sensorRelay&&(s.burn||s.freeze||runWeapon.burn||runWeapon.freeze)?'VARREDURA ELEMENTAL: pulsos transmitem fogo e frio instalados':null,s.sensor&&s.sensorLock?'PONTO FRACO: tiros manuais aproveitam a exposição do sensor':null,s.corrosion&&s.corrosionCatalyst&&(s.burn||s.freeze||runWeapon.burn||runWeapon.freeze)?'REAGENTE TÉRMICO: corrosão amplificada em alvos com fogo ou gelo':null,s.crit&&player.acquired.has('extra')?'CRIVO BALÍSTICO: quinto impacto cria um pulso de área':null,s.freeze&&s.finisher?'FRATURA INDUSTRIAL: finalizações de alvos resfriados atingem vizinhos':null,s.knock&&player.acquired.has('speed')?'MOTOR CINÉTICO: velocidade amplia o impacto':null,s.pierce&&s.blast?'ESTILHAÇOS: explosão em cada alvo atravessado':null,s.pierce&&s.shock?'CONDUTOR: descarga atinge até 3 alvos':null,s.blast&&s.shock?'PLASMA: explosões eletrocutam sobreviventes':null,s.thermal&&(s.freeze||runWeapon.freeze)?'CHOQUE TÉRMICO: queimadura ×3 em alvos resfriados':null,s.knock&&s.pierce?'LANÇA INDUSTRIAL: perfuração com empurrão':null,s.ricochet&&s.blast?'DEMOLIÇÃO: explosões em ricochetes':null,s.stun&&(s.shock||runWeapon.chain)?'PANE: descargas interrompem movimento':null].filter(Boolean);}
function updateHUD(){
 el('combat-controls').hidden=clock>=5;el('dash-hint').hidden=!player.skills.dash;
 renderHealth(player.hp);el('time').textContent=String(Math.floor(clock/60)).padStart(2,'0')+':'+String(Math.floor(clock%60)).padStart(2,'0');
 el('kills').textContent=kills;el('level').textContent=String(level).padStart(2,'0');el('xp').style.width=Math.min(100,xp/need*100)+'%';el('hud-robot-name').textContent=runRobot.name;el('hud-portrait').src=(runRobot.portrait||'assets/robots/prot-0001-simple.png');
 el('hud-portrait').style.filter=runRobot.filter||'none';drawMinimap();
 el('combat-loadout').textContent=runRobot.name+' · '+runWeapon.name+' · dano '+shotDamage().toFixed(1)+(runWeapon.pellets*player.projectileMult>1?' × '+(runWeapon.pellets*player.projectileMult):'')+' · cadência '+((player.frenzy>0?3:1)/player.rate).toFixed(1)+'/s';
 const names=SKILLS.filter(s=>player.acquired.has(s.id)).map(s=>s.name).concat(GAMBARRAS.filter(item=>player.blessings.has(item.id)).map(item=>item.name),BOSS_EXPERIMENTS.filter(item=>player.experiments.has(item.id)).map(item=>item.name));renderCooldowns();
 el('weapon-name').textContent=(runWeapon.name+(player.weaponEvolution?' · '+player.weaponEvolution.name:'')).toLocaleUpperCase('pt-BR');el('ammo-count').textContent=player.ammo+' / '+magazineSize();el('reload-status').textContent=player.reloadTime>0?'RECARREGANDO '+player.reloadTime.toFixed(1)+' s':player.ammo===magazineSize()?'CARREGADOR CHEIO':'[R] RECARREGAR · '+missingReloadDuration().toFixed(1)+' s';el('reload-progress').style.width=(player.reloadTime>0?(1-player.reloadTime/player.reloadTotal)*100:100)+'%';
 el('build-summary').textContent=(names.join(' · ')||'Sem módulos especiais')+(activeSynergies().length?' | '+activeSynergies().join(' | '):'');
 const live=!!boss&&boss.hp>0;el('boss-hud').hidden=!live;
 if(live){el('boss-health').style.width=Math.max(0,boss.hp/boss.maxHp*100)+'%';el('boss-action').textContent=bossMessage();const minions=BOSS_MINIONS[boss.id],activeMinions=enemies.filter(z=>z.minionOwner===boss.id).length;el('boss-support').textContent=(activeMinions?activeMinions+' '+minions.role:'SEM LACAIOS')+' · ONDAS COMUNS ATIVAS';}
}
function minimapPoint(x,y,w,h,padding=5){const dx=(x-player.x)/720*(w*.46),dy=(y-player.y)/720*(h*.46),factor=Math.max(1,Math.abs(dx)/(w/2-padding),Math.abs(dy)/(h/2-padding));return {x:Math.max(padding,Math.min(w-padding,w/2+dx/factor)),y:Math.max(padding,Math.min(h-padding,h/2+dy/factor))};}
function drawMinimap(){
 const map=el('minimap'),m=map.getContext('2d');if(!m||!player)return;const w=map.width,h=map.height,cx=w/2,cy=h/2,range=720;
 m.clearRect(0,0,w,h);m.fillStyle='#081522';m.fillRect(0,0,w,h);m.strokeStyle='#28465b';m.lineWidth=1;m.strokeRect(.5,.5,w-1,h-1);
 m.strokeStyle='#162d40';m.beginPath();m.moveTo(cx,8);m.lineTo(cx,h-8);m.moveTo(8,cy);m.lineTo(w-8,cy);m.stroke();
 for(const enemy of enemies){if(enemy.hp<=0)continue;const p=minimapPoint(enemy.x,enemy.y,w,h);m.fillStyle='#f05f55';m.fillRect(Math.round(p.x)-2,Math.round(p.y)-2,4,4);}
 if(boss&&boss.hp>0){const p=minimapPoint(boss.x,boss.y,w,h,7);m.fillStyle='#ffc84f';m.fillRect(Math.round(p.x)-4,Math.round(p.y)-4,8,8);m.strokeStyle='#fff1be';m.strokeRect(Math.round(p.x)-5,Math.round(p.y)-5,10,10);}
 m.fillStyle='#71e7ff';m.fillRect(cx-3,cy-3,6,6);m.strokeStyle='#b8f5ff';m.strokeRect(cx-4.5,cy-4.5,9,9);
}
function cooldownEntries(){
 const entries=[];
 if(player.skills.sensor)entries.push({id:'sensor',left:player.sensorTimer,total:player.sensorTotal});
 if(player.skills.shield)entries.push({id:'shield',left:player.shieldReady?0:player.shieldTimer,total:120});
 for(const id of ['emergency','retaliation','overload'])if(player.skills[id])entries.push({id,left:player.hitCooldowns[id],total:120,active:id==='overload'&&player.frenzy>0});
 if(player.skills.dash)entries.push({id:'dash',left:player.dashCooldown,total:4,active:player.dashTime>0});
 return entries;
}
function renderCooldowns(){
 const entries=cooldownEntries(),layout=entries.map(e=>e.id).join(',');
 if(layout!==cooldownLayout){
  cooldownLayout=layout;cooldownNodes=[];el('cooldowns').replaceChildren();
  for(const entry of entries){
   const item=document.createElement('div'),icon=document.createElement('img'),name=document.createElement('span'),status=document.createElement('b'),track=document.createElement('div'),fill=document.createElement('i');
   item.className='cooldown-item';item.setAttribute('data-cooldown',entry.id);icon.src='assets/skills/'+entry.id+'.svg';icon.alt='';icon.width=32;icon.height=32;const fullName=SKILLS.find(s=>s.id===entry.id).name;name.textContent=({sensor:'SENSOR',shield:'ESCUDO',emergency:'RESERVA',retaliation:'RETAL.',overload:'SOBREC.',dash:'AVANÇO'})[entry.id]||fullName;item.setAttribute('aria-label',fullName);name.className='cooldown-name';status.className='cooldown-status';track.className='cooldown-track';track.setAttribute('role','progressbar');track.setAttribute('aria-label','Recarga de '+fullName);track.setAttribute('aria-valuemin','0');track.setAttribute('aria-valuemax','100');track.append(fill);item.append(icon,name,status,track);el('cooldowns').append(item);cooldownNodes.push({item,status,track,fill});
  }
 }
 entries.forEach((entry,i)=>{const node=cooldownNodes[i],ready=entry.left<=0,progress=Math.max(0,Math.min(100,(1-entry.left/entry.total)*100));node.item.setAttribute('data-state',entry.active?'active':ready?'ready':'waiting');node.status.textContent=entry.active?'ATIVO':ready?'PRONTO':Math.ceil(entry.left)+' s';node.fill.style.width=progress+'%';node.track.setAttribute('aria-valuenow',String(Math.round(progress)));node.track.setAttribute('aria-valuetext',ready?'Pronto':Math.ceil(entry.left)+' segundos restantes');});
}
function toast(text,color='#89ddff'){feedback.push({x:player.x,y:player.y-46,text,life:1.4,color});}
function boostDamage(){player.damageStacks++;player.damage*=2;player.rate*=1.5;toast('DANO ×2 · INTERVALO ×1,5');}
function fireInterval(){return player.rate/(player.frenzy>0?3:1);}
function shotDamage(){return player.damage+(player.acquired.has('titan')&&player.acquired.has('armor')?Math.min(player.damage*.75,player.maxHp*.03):0);}
function bossRepairAmount(){return player.skills.bossHunter?40:20;}
function magazineSize(){return Math.max(1,Math.floor(AMMO[runWeapon.id][0]*player.magazineMult));}
function reloadDuration(){return AMMO[runWeapon.id][1]*player.reloadMult;}
function missingReloadDuration(){return (magazineSize()-player.ammo)/magazineSize()*reloadDuration();}
function startReload(){
 if(state!=='playing'||player.reloadTime>0||player.ammo>=magazineSize())return false;
 sound("reload");player.reloadMissing=magazineSize()-player.ammo;player.reloadCapacity=magazineSize();player.reloadTotal=missingReloadDuration();player.reloadTime=player.reloadTotal;burstQueue=[];return true;
}
function availableSkills(){return SKILLS.filter(s=>s.available());}
function renderCompendium(){
 const container=el('module-compendium');container.replaceChildren();
 const group=(title,items,kind)=>{
  const section=document.createElement('details'),summary=document.createElement('summary'),list=document.createElement('div');section.className='manual-group';summary.textContent=title+' · '+items.length;list.className='manual-list';
  for(const item of items){
   const card=document.createElement('article'),name=document.createElement('h3'),benefit=document.createElement('p'),cost=document.createElement('p'),requirement=document.createElement('p');card.setAttribute('data-module',item.id);name.textContent=item.name;benefit.textContent='VANTAGEM: '+item.benefit;cost.textContent='CUSTO: '+(item.cost||'Sem penalidade.');cost.className='manual-cost';
   requirement.textContent=kind==='skill'?(item.parent?'REQUISITO: '+SKILLS.find(s=>s.id===item.parent).name:'RAIZ · Disponível sem outro módulo.'):(kind==='blessing'?'OFERTA: níveis 3, 6 e 9; três opções aleatórias.':kind==='specialization'?'OFERTA: nível 10; uma escolha própria do chassi por tentativa.':'OFERTA: após derrotar um chefe; pode recusar.');
   const configured=runBalance?.find(s=>s.id===item.id);if(kind==='skill'&&configured?.prerequisites.length)requirement.textContent='REQUISITOS: '+configured.prerequisites.map(id=>SKILLS.find(s=>s.id===id)?.name||id).join(' + ');if(item.id==='ricochet')requirement.textContent+=' Não é ofertado para armas com retorno.';card.append(name,benefit,cost,requirement);list.append(card);
  }
  section.append(summary,list);container.append(section);
 };
 for(const [id,tree] of Object.entries(TREE_INFO))group(tree.category+' / '+tree.name,SKILLS.filter(s=>s.id===id||s.parent===id),'skill');
 const custom=SKILLS.filter(s=>!BASE_NORMAL.some(b=>b.id===s.id));if(custom.length)group('Módulos personalizados',custom,'skill');group('Gambiarras do Biruta',GAMBARRAS,'blessing');group('Experimentos de chefe',BOSS_EXPERIMENTS,'experiment');for(const [robot,items] of Object.entries(SPECIALIZATIONS))group('Especialização / '+ROBOTS[robot].name,items,'specialization');
}
function moduleSkill(id,name,parent,benefit,cost,apply){
 return {id,name,parent,benefit,cost,describe:()=>benefit+(cost?' Custo: '+cost:''),available:()=>normalSkillAvailable(id,parent),apply:()=>{if(player.acquired.has(id))return false;player.acquired.add(id);applyRunBalance(id,apply);if(id==='sensor')player.sensorTimer=player.sensorTotal=sensorInterval();player.ammo=Math.min(player.ammo,magazineSize());toast((SKILLS.find(s=>s.id===id)?.name||name)+' INSTALADO');return true;}};
}
// Each root unlocks three related, combinable children. All nodes are unique per run.
const SKILLS=[
 moduleSkill('sensor','SENSOR DE VARREDURA',null,'Pulso a cada 3 s atinge inimigos em raio 170; dano de 35% da base da arma. Sem munição ou mira automática da arma.','Tempo de recarga da arma ×1,15.',()=>{player.skills.sensor=1;player.reloadMult*=1.15;}),
 moduleSkill('sensorRange','LENTE DE VARREDURA','sensor','Alcance do sensor ×1,5.','Intervalo do sensor ×1,2. Não reinicia a carga em andamento.',()=>{player.sensorRange*=1.5;player.sensorIntervalMult*=1.2;}),
 moduleSkill('sensorRelay','RELÉ DE ESTADOS','sensor','O pulso transmite queimadura e resfriamento adquiridos ou intrínsecos da arma.','Dano do sensor ÷1,25. Não transmite corrosão, descarga, explosão, crítico ou empurrão.',()=>{player.skills.sensorRelay=1;player.sensorDamageMult/=1.25;}),
 moduleSkill('sensorLock','LEITURA DE PONTO FRACO','sensor','Sobreviventes do pulso ficam expostos por 2 s: tiros manuais causam +25% de dano.','Dano do sensor ×0,75. Escudos bloqueiam a exposição; não acumula.',()=>{player.skills.sensorLock=1;player.sensorDamageMult*=.75;}),
 moduleSkill('corrosion','REVESTIMENTO CORROSIVO',null,'Impactos marcam sobreviventes: após 2 s, causam novamente o dano da bala. Uma carga por alvo; sem renovar ou acumular.','Dano direto ×0,85. Escudos bloqueiam a aplicação.',()=>{player.skills.corrosion=1;player.damage*=.85;}),
 moduleSkill('corrosionFuse','INICIADOR RÁPIDO','corrosion','Prazo das novas cargas ×0,5.','Dano das novas cargas ×0,75.',()=>{player.corrosionDelayMult*=.5;player.corrosionDamageMult*=.75;}),
 moduleSkill('corrosionBloom','RESPINGO REAGENTE','corrosion','Morte de um alvo com carga primária transfere metade da carga a até dois vizinhos próximos.','Recarga ×1,15. Cargas transferidas não se propagam; escudos bloqueiam o respingo.',()=>{player.skills.corrosionBloom=1;player.reloadMult*=1.15;}),
 moduleSkill('corrosionCatalyst','CATALISADOR TÉRMICO','corrosion','Detonação corrosiva causa +50% de dano se o alvo ainda estiver queimando ou resfriado.','Dano direto ÷1,15. Fogo e gelo não acumulam este bônus.',()=>{player.skills.corrosionCatalyst=1;player.damage/=1.15;}),
 moduleSkill('damage','ALTO IMPACTO',null,'Dano ×2.','Intervalo entre disparos ×1,5.',boostDamage),
 moduleSkill('bossHunter','CAÇA-TITÃS','damage','Dano contra chefe ×3. Derrotar um chefe recupera mais20 de integridade.','Alcance dos projéteis ÷1,5.',()=>{player.skills.bossHunter=1;player.projectileLife/=1.5;}),
 moduleSkill('finisher','FINALIZADOR','damage','Dano ×3 contra alvos com até um terço da vida.','Velocidade das balas ÷1,5.',()=>{player.skills.finisher=1;player.projectileSpeed/=1.5;}),
 moduleSkill('crit','QUINTO IMPACTO','damage','Cada quinto disparo causa dano ×3.','Capacidade do carregador ÷1,25 (mínimo 1).',()=>{player.skills.crit=1;player.magazineMult/=1.25;player.ammo=Math.min(player.ammo,magazineSize());}),
 moduleSkill('rate','OVERDRIVE',null,'Cadência ×3.','Dano de cada bala ÷1,5.',()=>{player.rateStacks++;player.rate/=3;player.damage/=1.5;}),
 moduleSkill('extra','CÂMARA DUPLA','rate','Projéteis por disparo ×2.','Dispersão ×1,5 e alcance ÷1,5.',()=>{player.projectileMult*=2;player.spreadMult*=1.5;player.projectileLife/=1.5;}),
 moduleSkill('ricochet','MUNIÇÃO RICOCHETE','rate','Cada bala busca um alvo adicional após esgotar perfuração.','Tempo de recarga ×1,5. Não combina com disco.',()=>{player.skills.ricochet=1;player.reloadMult*=1.5;}),
 moduleSkill('range','PROPULSÃO BALÍSTICA','rate','Alcance dos projéteis ×3.','Tamanho das balas ÷1,25.',()=>{player.projectileLife*=3;player.projectileSize/=1.25;}),
 moduleSkill('armor','BLINDAGEM REFORÇADA',null,'Reduz 2 de dano por golpe; mínimo recebido 1.','Velocidade de movimento dividida por 1,25.',()=>{player.skills.armor=1;player.armor+=2;player.speed/=1.25;}),
 moduleSkill('titan','CHASSI TITÂNICO','armor','Vida máxima e atual ×3. Com Blindagem Reforçada, converte3% da vida máxima em dano por projétil, limitado a75% do dano direto.','Velocidade ÷1,5 e tempo de recarga ×1,5.',()=>{player.maxHp*=3;player.hp*=3;player.speed/=1.5;player.reloadMult*=1.5;}),
 moduleSkill('salvage','BATERIA DE SUCATA','armor','A cada 20 zumbis mortos, recupera uma bateria (20 de vida).','Alcance de coleta ÷1,25. Não ultrapassa a vida máxima.',()=>{player.skills.salvage=1;player.killCounter=0;player.magnet/=1.25;}),
 moduleSkill('regen','OFICINA ESTACIONÁRIA','armor','Após 3 s parado, recupera 2 de vida por segundo.','Dano das balas ÷1,25. Mover interrompe o reparo.',()=>{player.skills.regen=1;player.damage/=1.25;}),
 moduleSkill('magnet','CAMPO MAGNÉTICO',null,'Alcance de coleta ×3.','',()=>{player.magnet*=3;}),
 moduleSkill('xp','PROCESSADOR DE EXPERIÊNCIA','magnet','Experiência por núcleo ×2.','Tempo de recarga ×1,5.',()=>{player.skills.xp=1;player.reloadMult*=1.5;}),
 moduleSkill('repair','MANUTENÇÃO NA RECARGA','magnet','Recargas recuperam até5 de vida proporcionalmente à munição reposta.','Tempo de recarga ×1,25. Só funciona após gastar munição.',()=>{player.skills.repair=1;player.reloadMult*=1.25;}),
 moduleSkill('killAmmo','DEPÓSITO AMPLIADO','magnet','Capacidade do carregador ×3; a cada 10 mortes, devolve uma munição.','Tempo de recarga ×2. Não repõe munição imediatamente.',()=>{player.skills.killAmmo=1;player.magazineMult*=3;player.reloadMult*=2;player.ammoKills=0;}),
 moduleSkill('burn','MUNIÇÃO INCENDIÁRIA',null,'Impactos queimam por 3 s: metade do dano da bala por segundo. Em armas incendiárias, a queimadura ganha mais25%.','Alcance dos projéteis ÷1,25.',()=>{player.skills.burn=1;player.projectileLife/=1.25;}),
 moduleSkill('thermal','CHOQUE TÉRMICO','burn','Queimadura causa dano ×3 enquanto o alvo está resfriado.','Dano direto das balas ÷1,5. Exige resfriar o alvo.',()=>{player.skills.thermal=1;player.damage/=1.5;}),
 moduleSkill('ignition','FORNALHA','burn','Duração da queimadura ×3.','Tempo de recarga ×1,5.',()=>{player.skills.ignition=1;player.reloadMult*=1.5;}),
 moduleSkill('afterburn','COMBUSTÃO CONCENTRADA','burn','Dano da queimadura ×3.','Cadência ÷1,5.',()=>{player.skills.afterburn=1;player.rate*=1.5;}),
 moduleSkill('freeze','NÚCLEO CRIOGÊNICO',null,'Impactos deixam o movimento inimigo ÷2 por 2 s; em armas criogênicas, dura3 s.','Velocidade dos projéteis ÷1,25.',()=>{player.skills.freeze=1;player.projectileSpeed/=1.25;}),
 moduleSkill('pierce','PERFURAÇÃO','freeze','Projéteis atravessam dois alvos adicionais.','Dano direto das balas ÷1,5.',()=>{player.skills.pierce=1;player.damage/=1.5;}),
 moduleSkill('knock','IMPACTO CINÉTICO','freeze','Empurra uma distância curta; chefes recebem um quarto do empurrão.','Cadência ÷1,5.',()=>{player.skills.knock=1;player.rate*=1.5;}),
 moduleSkill('coldReload','RECARGA GLACIAL','freeze','Ao terminar uma recarga, resfria alvos em uma área média por 4 s.','Tempo de recarga ×1,5.',()=>{player.skills.coldReload=1;player.reloadMult*=1.5;}),
 moduleSkill('shock','DESCARGA',null,'Impactos atingem outro alvo com metade do dano; perfuração amplia para três. Em armas elétricas, soma os alvos e aumenta o dano elétrico em25%.','Dano direto das balas ÷1,5.',()=>{player.skills.shock=1;player.damage/=1.5;}),
 moduleSkill('conductivity','CONDUTIVIDADE','shock','Alcance elétrico ×3.','Alcance dos projéteis ÷1,5.',()=>{player.skills.conductivity=1;player.projectileLife/=1.5;}),
 moduleSkill('stun','CURTO-CIRCUITO','shock','Descargas param movimento por 1 s; chefe por um quarto de segundo.','Cadência ÷1,5. Não cancela ataques.',()=>{player.skills.stun=1;player.rate*=1.5;}),
 moduleSkill('shield','ESCUDO CAPACITIVO','shock','Absorve um impacto e recarrega em 120 s de combate.','Velocidade de movimento ÷1,5.',()=>{player.skills.shield=1;player.shieldReady=true;player.speed/=1.5;}),
 moduleSkill('dash','PROPULSOR AUXILIAR',null,'ESPAÇO: avanço de 0,15 s com velocidade ×3. Recarga 4 s.','Não concede invulnerabilidade.',()=>{player.skills.dash=1;}),
 moduleSkill('speed','PERNAS HIDRÁULICAS','dash','Velocidade de movimento ×2.','Vida máxima e atual ÷1,5; mínimo 1.',()=>{player.speed*=2;player.maxHp=Math.max(1,player.maxHp/1.5);player.hp=Math.max(1,player.hp/1.5);}),
 moduleSkill('grace','ISOLAMENTO DE IMPACTO','dash','Proteção normal após sofrer dano ×2.','Capacidade do carregador ÷1,25 (mínimo 1).',()=>{player.skills.grace=1;player.magazineMult/=1.25;player.ammo=Math.min(player.ammo,magazineSize());}),
 moduleSkill('emergency','RESERVA DE EMERGÊNCIA','dash','Ao sobreviver a dano, ganha 3 s de proteção. Recarga 120 s de combate.','Alcance de coleta ÷1,25. Não ressuscita.',()=>{player.skills.emergency=1;player.magnet/=1.25;}),
 moduleSkill('blast','CARGA EXPLOSIVA',null,'Cada impacto cria uma explosão pequena, causando metade do dano a outros alvos. Em armas explosivas, aumenta o dano da explosão em25%.','Tempo de recarga ×1,5.',()=>{player.skills.blast=1;player.reloadMult*=1.5;}),
 moduleSkill('blastRadius','ONDA EXPANDIDA','blast','Raio das explosões ×2.','Dano direto das balas ÷1,5.',()=>{player.skills.blastRadius=1;player.damage/=1.5;}),
 moduleSkill('retaliation','PULSO DE RETALIAÇÃO','blast','Ao sobreviver a dano, cria uma explosão média com dano ×3. Recarga 120 s.','Vida máxima e atual ÷1,5; mínimo 1.',()=>{player.skills.retaliation=1;player.maxHp=Math.max(1,player.maxHp/1.5);player.hp=Math.max(1,player.hp/1.5);}),
 moduleSkill('overload','SOBRECARGA REATIVA','blast','Ao sobreviver a dano, ganha cadência ×3 por 6 s. Recarga 120 s de combate.','Tempo de recarga da arma ×1,5.',()=>{player.skills.overload=1;player.reloadMult*=1.5;})
,
 moduleSkill('drones','DRONE DE APOIO',null,'Acrescenta um drone; máximo3. Cada drone causa25% do dano direto a cada0,8s, no alcance320px.','Tempo de recarga ×1,15.',()=>{player.skills.drones=1;player.reloadMult*=1.15;}),
 moduleSkill('dronePair','DUPLA DE APOIO','drones','Acrescenta um drone; máximo3 incluindo o drone do ENXA.','Dano direto ÷1,15.',()=>{player.skills.dronePair=1;player.damage/=1.15;}),
 moduleSkill('droneOverclock','ROTORES ACELERADOS','drones','Intervalo de ataque dos drones ×0,7; mínimo0,35s.','Alcance dos drones ÷1,15.',()=>{player.droneRateMult*=.7;player.droneRange/=1.15;}),
 moduleSkill('droneArc','ARCO DE APOIO','drones','Ataque do drone atinge um segundo alvo a até160px por metade do dano.','Dano dos drones ÷1,2.',()=>{player.skills.droneArc=1;player.droneDamageMult/=1.2;})
];

const BASE_NORMAL=SKILLS.map(s=>({...s})),BASE_BLESSINGS=GAMBARRAS,BASE_EXPERIMENTS=BOSS_EXPERIMENTS,BASE_SPECIALIZATIONS=SPECIALIZATIONS;
let runBalance=null;
function applyRunBalance(id,callback){const result=window.ScrewBalance&&runBalance?window.ScrewBalance.apply(id,player,callback):callback();player.ammo=Math.min(player.ammo,magazineSize());return result;}
function normalSkillAvailable(id,parent){const config=runBalance?.find(s=>s.id===id);return !player.acquired.has(id)&&(!runBalance||!!config&&config.enabled!==false&&level>=config.unlockLevel)&&((config?.prerequisites)|| (parent?[parent]:[])).every(p=>player.acquired.has(p))&&(id!=='ricochet'||!runWeapon.returning);}
function configureRunBalance(){
 if(!window.ScrewBalance)return;runBalance=window.ScrewBalance.snapshot();const current=new Map(runBalance.filter(s=>s.enabled!==false).map(s=>[s.id,s]));
 const decorate=(base)=>{const item=current.get(base.id);if(!item)return null;const text=window.ScrewBalance.describe(item,base);return {...base,...text,name:item.name,parent:item.prerequisites[0]||null,describe:()=>text.benefit+' '+text.cost};};
 const normals=BASE_NORMAL.map(decorate).filter(Boolean);for(const item of current.values())if(item.type==='Normal'&&!BASE_NORMAL.some(s=>s.id===item.id)){const text=window.ScrewBalance.describe(item,null);normals.push({...moduleSkill(item.id,item.name,item.prerequisites[0]||null,text.benefit,text.cost,()=>{}),icon:'magnet'});}
 SKILLS.splice(0,SKILLS.length,...normals);GAMBARRAS=BASE_BLESSINGS.map(decorate).filter(Boolean);BOSS_EXPERIMENTS=BASE_EXPERIMENTS.map(decorate).filter(Boolean);SPECIALIZATIONS=Object.fromEntries(Object.entries(BASE_SPECIALIZATIONS).map(([robot,items])=>[robot,items.map(decorate).filter(Boolean)]));
}
function skillTreeInfo(skill){const root=skill.parent?SKILLS.find(s=>s.id===skill.parent):skill;return TREE_INFO[root?.id]||{name:runBalance?.find(s=>s.id===skill.id)?.tree||'Módulos personalizados',category:'Personalizado'};}

function chooseSkill(id,version){
 if(!['upgrade','reward'].includes(state)||version!==offerVersion)return false;
 const skill=offeredSkills.find(s=>s.id===id);if(!skill)return false;
 if(!skill.available())return false;const before=new Set(activeSynergies());skill.apply();sound("upgrade");upgradeFlash=1;
 for(const text of activeSynergies())if(!before.has(text))toast('SINERGIA: '+text,'#ffd27c');
 offerVersion++;state='playing';el('overlay').hidden=true;clearInput();updateHUD();return true;
}
function chooseBlessing(id,version){
 if(state!=='blessing'||version!==offerVersion||player.blessings.has(id))return false;
 const blessing=offeredBlessings.find(item=>item.id===id);if(!blessing)return false;
 applyRunBalance(id,blessing.apply);player.blessings.add(id);offerVersion++;state='playing';el('overlay').hidden=true;clearInput();toast(blessing.name+' INSTALADA','#ffd27c');updateHUD();return true;
}
function chooseExperiment(id,version){
 if(state!=='experiment'||version!==offerVersion||player.experiments.has(id))return false;
 const item=offeredExperiments.find(experiment=>experiment.id===id);if(!item)return false;
 applyRunBalance(id,item.apply);player.experiments.add(id);offerVersion++;state='playing';el('overlay').hidden=true;clearInput();toast(item.name+' INSTALADO','#ffd27c');updateHUD();el('pause').focus();return true;
}
function declineExperiment(version){
 if(version!==offerVersion||state!=='experiment')return false;
 offerVersion++;clearInput();state='playing';el('overlay').hidden=true;updateHUD();el('pause').focus();return true;
}
function offerExperiment(){
 const candidates=BOSS_EXPERIMENTS.filter(item=>!player.experiments.has(item.id));
 if(!candidates.length){upgrade('boss');return;}
 state='experiment';offerSource='boss-experiment';clearInput();
 show('EXPERIMENTO DO BIRUTA','Recompensa do chefe: até '+bossRepairAmount()+' de integridade e uma peça permanente já foi salva. Escolha um módulo instável: toda vantagem cobra um preço. Ao recusar, você mantém a cura e a peça; o experimento acaba nesta tentativa.','');
 for(let i=candidates.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[candidates[i],candidates[j]]=[candidates[j],candidates[i]];}
 offeredExperiments=candidates.slice(0,3);const version=++offerVersion;
 for(const [index,item] of offeredExperiments.entries()){
  const card=document.createElement('button'),icon=document.createElement('img'),category=document.createElement('span'),title=document.createElement('strong'),benefit=document.createElement('span'),cost=document.createElement('span'),path=document.createElement('span'),pathLabel=document.createElement('small'),action=document.createElement('span');
  card.className='upgrade-card boss-experiment-card';card.setAttribute('data-experiment',item.id);icon.src='assets/skills/'+item.icon+'.svg';icon.alt='';icon.width=80;icon.height=80;icon.className='skill-icon';
  category.className='skill-category';category.textContent='EXPERIMENTO DE CHEFE / TEMPORÁRIO';title.textContent=item.name;benefit.className='skill-benefit';benefit.textContent='VANTAGEM: '+item.benefit;cost.className='skill-cost';cost.textContent='CUSTO: '+item.cost;
  path.className='skill-path';pathLabel.textContent='NÃO SE REPETE NESTA TENTATIVA';path.append(pathLabel);action.className='skill-action';action.textContent='['+(index+1)+']  ACEITAR EXPERIMENTO  →';
  card.append(category,icon,title,benefit,cost,path,action);card.onclick=()=>chooseExperiment(item.id,version);el('choices').append(card);
 }
 const skip=document.createElement('button');skip.className='skip-upgrade skip-experiment';skip.textContent='RECUSAR E CONTINUAR [R]';skip.setAttribute('aria-keyshortcuts','R');skip.onclick=()=>declineExperiment(version);el('choices').append(skip);el('choices').children[0]?.focus();
}
function offerBlessing(){
 offerSource='blessing';state='blessing';clearInput();
 show('GAMBIARRA DO BIRUTA','O laboratório improvisado liberou uma peça experimental. Escolha um efeito forte para esta tentativa; nenhum deles fica salvo na garagem.','');
 const candidates=GAMBARRAS.filter(item=>!player.blessings.has(item.id));
 for(let i=candidates.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[candidates[i],candidates[j]]=[candidates[j],candidates[i]];}
 offeredBlessings=candidates.slice(0,3);const version=++offerVersion;
 for(const [index,item] of offeredBlessings.entries()){
  const b=document.createElement('button'),icon=document.createElement('img'),strong=document.createElement('strong'),category=document.createElement('span'),detail=document.createElement('span'),cost=document.createElement('span'),path=document.createElement('span'),action=document.createElement('span');
  b.className='upgrade-card blessing-card';b.setAttribute('data-blessing',item.id);
  icon.src='assets/skills/'+item.icon+'.svg';icon.alt='';icon.width=80;icon.height=80;icon.className='skill-icon';
  category.className='skill-category';category.textContent='GAMBIARRA TEMPORÁRIA / DR. BIRUTA';
  strong.textContent=item.name;detail.className='skill-benefit';detail.textContent='EFEITO: '+item.benefit;
  cost.className='skill-cost';cost.textContent='SEM PENALIDADE · SÓ NESTA TENTATIVA';
  path.className='skill-path';const pathLabel=document.createElement('small');pathLabel.textContent='DESAPARECE AO ENCERRAR A TENTATIVA';path.append(pathLabel);
  action.className='skill-action';action.textContent='['+(index+1)+']  INSTALAR GAMBIARRA  →';
  b.append(category,icon,strong,detail,cost,path,action);b.onclick=()=>chooseBlessing(item.id,version);el('choices').append(b);
 }
 const skip=document.createElement('button');skip.className='skip-upgrade';skip.textContent='RECUSAR GAMBIARRA';skip.onclick=()=>{if(version!==offerVersion||state!=='blessing')return;offerVersion++;clearInput();state='playing';el('overlay').hidden=true;updateHUD();};el('choices').append(skip);el('choices').children[0]?.focus();
}
let offeredSkills=[],rerollsRemaining=1;
function canRerollUpgrade(){return state==='upgrade'&&rerollsRemaining>0&&offeredSkills.length>0&&availableSkills().filter(s=>!offeredSkills.some(old=>old.id===s.id)).length>=offeredSkills.length;}
function rerollUpgrade(version){
 if(version!==offerVersion||!canRerollUpgrade())return false;
 const excluded=offeredSkills.map(s=>s.id);rerollsRemaining--;upgrade('level',excluded);return true;
}
let previewedSkill=null;
function previewSkill(id,version){
 if(!['upgrade','reward'].includes(state)||version!==offerVersion)return false;const skill=offeredSkills.find(s=>s.id===id);if(!skill)return false;previewedSkill=id;
 for(const button of el('module-options').children)button.setAttribute('aria-pressed',String(button['skillId']===id));
 const panel=el('module-detail');panel.replaceChildren();const copy=document.createElement('div'),title=document.createElement('h3'),benefit=document.createElement('p'),cost=document.createElement('p');copy.className='module-copy';title.textContent=skill.name;benefit.className='module-benefit';benefit.textContent=skill.benefit;cost.className='module-cost';cost.textContent='CUSTO: '+(skill.cost||'Sem penalidade.');copy.append(title,benefit,cost);
 const root=skill.parent?SKILLS.find(s=>s.id===skill.parent):skill,evolutions=document.createElement('div'),heading=document.createElement('h4');evolutions.className='module-evolutions';heading.textContent='ÁRVORE / '+skillTreeInfo(skill).name;evolutions.append(heading);
 for(const node of [root,...SKILLS.filter(s=>s.parent===root.id)]){const branch=document.createElement('div'),icon=document.createElement('img'),name=document.createElement('strong'),note=document.createElement('span');branch.className='module-branch';icon.src='assets/skills/'+node.id+'.svg';icon.alt='';icon.width=36;icon.height=36;name.textContent=node.name;note.textContent=(player.acquired.has(node.id)?'INSTALADO':node.id===skill.id?'EM ANÁLISE':node.parent?'EVOLUÇÃO · REQUER '+root.name:'RAIZ')+' · '+node.benefit+(node.cost?' Custo: '+node.cost:'');branch.append(icon,name,note);evolutions.append(branch);}
 panel.append(copy,evolutions);el('confirm-upgrade').textContent='INSTALAR '+skill.name+' [ENTER]';el('confirm-upgrade').onclick=()=>chooseSkill(id,version);return true;
}
function upgrade(source='level',excluded=[]){
 if(source==='level'&&!excluded.length)rerollsRemaining=1;
 offerSource=source;state=source==='boss'?'reward':'upgrade';clearInput();show(source==='boss'?'ESPÓLIO DE '+(boss?.name||'CHEFE'):'OFICINA DE CAMPO',source==='boss'?'Analise o módulo de recompensa antes de instalar.':'Selecione para analisar. Veja vantagem, custo e evoluções. Confirme para instalar. 1–3 seleciona · ENTER instala.','');
 const candidates=availableSkills().filter(s=>!excluded.includes(s.id));for(let i=candidates.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[candidates[i],candidates[j]]=[candidates[j],candidates[i]];}
 offeredSkills=candidates.slice(0,3);const version=++offerVersion;el('module-workbench').hidden=!offeredSkills.length;el('module-options').replaceChildren();previewedSkill=null;
 for(const [index,skill] of offeredSkills.entries()){const button=document.createElement('button'),icon=document.createElement('img'),name=document.createElement('strong'),key=document.createElement('small');button.className='module-option';button.skillId=skill.id;button.setAttribute('data-skill',skill.id);button.setAttribute('aria-pressed','false');icon.src='assets/skills/'+(skill.icon||skill.id)+'.svg';icon.alt='';icon.width=56;icon.height=56;name.textContent=skill.name;key.textContent='['+(index+1)+'] ANALISAR';button.append(icon,name,key);button.onclick=()=>previewSkill(skill.id,version);el('module-options').append(button);}
 if(offeredSkills.length)previewSkill(offeredSkills[0].id,version);
 if(source==='level'){const reroll=document.createElement('button');reroll.className='reroll-upgrade';reroll.setAttribute('aria-keyshortcuts','Q');reroll.disabled=!canRerollUpgrade();reroll.textContent=rerollsRemaining>0?(reroll.disabled?'SEM OUTRAS OPÇÕES SUFICIENTES':'RENOVAR OPÇÕES [Q] · 1 CARGA NESTE NÍVEL'):'RENOVAÇÃO USADA · 0 CARGAS';reroll.onclick=()=>rerollUpgrade(version);el('choices').append(reroll);}
 const skip=document.createElement('button');skip.className='skip-upgrade';skip.textContent='CONTINUAR SEM MELHORIA';skip.onclick=()=>{if(version!==offerVersion||!['upgrade','reward'].includes(state))return;offerVersion++;clearInput();state='playing';el('overlay').hidden=true;updateHUD();};el('choices').append(skip);if(offeredSkills.length)el('module-options').children[0]?.focus();else skip.focus();
}
function createEnemy(x,y,type='chaser'){
 const scale=1+clock/300,baseHp=Math.round(24*scale),baseSpeed=random(HORDE.minSpeed,HORDE.maxSpeed)+Math.min(24,clock/90),variant=Math.floor(terrainNoise(Math.round(x),Math.round(y),1703)*ZOMBIE_VARIANTS.length);
 if(type==='shieldPolice')return {x,y,hp:baseHp,maxHp:baseHp,speed:baseSpeed*.9,r:15,variant,hit:0,enemyType:type,shieldHp:100,policePhase:'shielded',minionBadge:'ESCUDO 100',minionColor:'#88d9ff'};
 if(type==='expolice')return {x,y,hp:Math.round(baseHp*.8),maxHp:Math.round(baseHp*.8),speed:baseSpeed*.9,r:13,variant,hit:0,enemyType:type,minionBadge:'EX-POLICIAL',minionColor:'#e7bc72',shotCooldown:random(.8,1.5)};
 if(type==='heavy')return {x,y,hp:baseHp*3,maxHp:baseHp*3,speed:baseSpeed*.68,r:23,variant:2,hit:0,enemyType:type,heavy:true,minionBadge:'PERSEGUIDOR',minionColor:'#d49b54'};
 return {x,y,hp:baseHp,maxHp:baseHp,speed:baseSpeed,r:random(11,16),variant,hit:0,enemyType:'chaser'};
}
function spawnBossMinions(owner){
 const spec=BOSS_MINIONS[owner.id];if(!spec)return 0;
 const count=spec.count,start=Object.keys(BOSS_MINIONS).indexOf(owner.id)*Math.PI/6+(owner.cycle%6)*Math.PI/12;
 for(let i=0;i<count;i++){
  const angle=start+i*Math.PI*2/count,minion=createEnemy(owner.x+Math.cos(angle)*82,owner.y+Math.sin(angle)*82),scale=1+(owner.cycle||0)*.35;
  Object.assign(minion,{hp:Math.round(spec.hp*scale),maxHp:Math.round(spec.hp*scale),speed:spec.speed*(1+(owner.cycle||0)*.05),r:spec.r,variant:spec.variant,minionType:spec.type,minionOwner:owner.id,minionName:spec.title,minionBadge:spec.badge,minionColor:spec.color,shotCooldown:random(.5,1.5)});
  enemies.push(minion);
 }
 return count;
}
function fireBossMinion(minion,fan=0){
 if(hostile.length>=200)return;
 const dx=player.x-minion.x,dy=player.y-minion.y,angle=Math.atan2(dy,dx),count=fan?3:1;
 for(let i=0;i<count&&hostile.length<200;i++){
  const offset=fan?(i-1)*.2:0,a=angle+offset,speed=minion.minionType==='conductor'?190:240;
  hostile.push({x:minion.x,y:minion.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life:2.4,r:5,damage:minion.minionType==='conductor'?6:8,color:minion.minionColor,source:'boss-minion'});
 }
}
function fireCommonShooter(shooter){
 if(hostile.length>=200)return;
 const angle=Math.atan2(player.y-shooter.y,player.x-shooter.x),speed=210;
 hostile.push({x:shooter.x,y:shooter.y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,life:2.6,r:5,damage:8,color:shooter.minionColor,source:'common-ranged'});
}
function waveRadius(){return Math.max(...[camera.x,camera.x+width].flatMap(x=>[camera.y,camera.y+height].map(y=>Math.hypot(x-player.x,y-player.y))))+96;}
function isPolice(z){return z.enemyType==='expolice'||z.enemyType==='shieldPolice';}
function preparePoliceCharge(z){const dx=player.x-z.x,dy=player.y-z.y,d=Math.hypot(dx,dy);z.policePhase='aim';z.chargeTimer=.7;z.chargeDx=d?dx/d:1;z.chargeDy=d?dy/d:0;z.chargeRemaining=Math.min(240,d);z.minionBadge='INVESTIDA';z.minionColor='#ffb66c';}
function tickPoliceCharge(z,dt){
 const factor=z.stunTime>0?0:z.slowTime>0?.5:1;
 if(z.policePhase==='aim'){z.chargeTimer-=dt*factor;if(z.chargeTimer<=0)z.policePhase='charge';return;}
 const x=z.x,y=z.y,travel=Math.min(z.chargeRemaining,340*dt*factor);z.x+=z.chargeDx*travel;z.y+=z.chargeDy*travel;z.chargeRemaining=Math.max(0,z.chargeRemaining-travel);
 if(segmentDistance(player.x,player.y,x,y,z.x,z.y)<z.r+14)hurtPlayer(12,z.x,z.y);
 if(z.chargeRemaining<=0)preparePoliceCharge(z);
}
function spawnCircularWave(capacity){
 const count=Math.min(HORDE.waveSize,capacity),radius=waveRadius(),start=random(0,Math.PI*2),wave=commonWaveIndex,types=Array(count).fill('chaser');
 if(count===HORDE.waveSize)commonWaveIndex++;
 if(policeUnlocked)for(let i=0;i<Math.floor(count/3);i++)types[i]=(wave+i)%2?'shieldPolice':'expolice';
 if(count===HORDE.waveSize&&clock>=900&&wave%3===2)types[count-1]='heavy';
 for(let i=0;i<count;i++){const angle=start+i*Math.PI*2/count,z=createEnemy(player.x+Math.cos(angle)*radius,player.y+Math.sin(angle)*radius,types[i]);enemies.push(z);}
}
function bossTime(index){return index<BOSS_SCHEDULE.length?BOSS_SCHEDULE[index].at:BOSS_SCHEDULE.at(-1).at+180*(index-BOSS_SCHEDULE.length+1);}
function spawnBoss(){
 if(boss&&boss.hp>0)return false;
 sound('boss');const cycle=Math.floor(bossIndex/BOSS_SCHEDULE.length),spec=BOSS_SCHEDULE[bossIndex++%BOSS_SCHEDULE.length],hp=Math.round(spec.hp*(1+cycle*.7));bossSpawned=true;
 boss={...spec,hp,maxHp:hp,cycle,speed:spec.speed*(1+cycle*.08),x:player.x,y:player.y-Math.min(height*.4,260),phase:'approach',timer:2,turn:0,hit:0,dx:0,dy:1};
 spawnBossMinions(boss);const minions=BOSS_MINIONS[spec.id];toast('ALERTA: '+boss.name+' · '+minions.title+' ('+minions.role+')',spec.id==='scrapper'?'#b6d38d':spec.id==='coil'?'#c3b6ed':'#ffb66c');return true;
}
function bossMessage(){
 const labels={tellDash:'INVESTIDA — saia da faixa laranja',tellVolley:'DISPAROS — afaste-se dos pontos',tellMortar:'SUCATA EXPLOSIVA — saia dos círculos verdes',tellPulse:'ONDA ELÉTRICA — afaste-se do anel roxo',tellFan:'RAJADA — saia do cone roxo',dash:'INVESTIDA'};
 return labels[boss.phase]||boss.name+' / '+Math.ceil(boss.hp)+' PV';
}

function hurtPlayer(amount,sourceX,sourceY,source='contact'){
 if(player.inv>0||player.hp<=0||state!=='playing')return;
 if(player.skills.shield&&player.shieldReady){player.shieldReady=false;player.shieldTimer=120;player.inv=.25;sound('shield');toast('ESCUDO ABSORVEU O IMPACTO');return;}
 const beforeHp=player.hp,originX=player.x,originY=player.y;
 if(player.specialization==='grounding'&&source==='boss-hazard')amount*=.7;
 sound('hit');effects.push({x:player.x,y:player.y,r:42,life:.3,max:.3,color:'#ff9573'});
 let awayX=player.x-(sourceX??player.x),awayY=player.y-(sourceY??player.y),distance=Math.hypot(awayX,awayY);
 if(distance<1e-6){awayX=-(Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft')));awayY=-(Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup')));distance=Math.hypot(awayX,awayY)||1;if(awayX===0&&awayY===0)awayX=1;}
 player.x+=awayX/distance*PLAYER_KNOCKBACK;player.y+=awayY/distance*PLAYER_KNOCKBACK;
 player.hp=Math.max(0,player.hp-Math.max(1,amount-player.armor-(player.repairArmorTime>0?2:0)));player.inv=.65*(player.skills.grace?2:1);
 if(player.hp>0){
  if(player.specialization==='tailDecoy'&&player.specializationCooldown<=0){player.decoy={x:originX,y:originY,life:1.5};player.specializationCooldown=24;toast('ISCA DE CAUDA');}
  if(player.specialization==='nineLives'&&player.specializationCooldown<=0&&beforeHp>=player.maxHp*.2&&player.hp<player.maxHp*.2){player.specializationCooldown=30;for(const z of enemies)if(z.hp>0&&!z.minionType&&!z.minionOwner){const dx=z.x-player.x,dy=z.y-player.y,d=Math.hypot(dx,dy);if(d<=100){z.x+=(d?dx/d:1)*90;z.y+=(d?dy/d:0)*90;z.stunTime=Math.max(z.stunTime||0,.5);}}effects.push({x:player.x,y:player.y,r:100,life:.4,max:.4,color:'#a8f1ff'});toast('ALERTA DE NOVE VIDAS');}
  if(player.skills.emergency&&player.hitCooldowns.emergency<=0){player.inv=3;player.hitCooldowns.emergency=120;toast('RESERVA: PROTEÇÃO 3 s');}
  if(player.skills.retaliation&&player.hitCooldowns.retaliation<=0){player.hitCooldowns.retaliation=120;explodeAt(player.x,player.y,player.damage*3,140);toast('RETALIAÇÃO');}
  if(player.skills.overload&&player.hitCooldowns.overload<=0){player.hitCooldowns.overload=120;player.frenzy=6;toast('SOBRECARGA: CADÊNCIA ×3');}
 }

 if(!player.hp){sound('death');state='over';show('Fim da transmissão.','Sobreviveu '+Math.floor(clock)+' s · '+kills+' eliminações. Skills encerradas.','REPETIR CONFIGURAÇÃO');}
}
function targets(){return boss&&boss.hp>0?[...enemies,boss]:enemies;}
let collisionGrid=null;
function indexTarget(z){if(!collisionGrid)return;const key=Math.floor(z.x/128)+','+Math.floor(z.y/128);if(!collisionGrid.cells.has(key))collisionGrid.cells.set(key,new Set());collisionGrid.cells.get(key).add(z);collisionGrid.radius=Math.max(collisionGrid.radius,z.r||0);}
function buildCollisionGrid(){const list=targets();collisionGrid={cells:new Map(),radius:0,list,rank:new Map(list.map((z,i)=>[z,i]))};for(const z of list)if(z.hp>0)indexTarget(z);}
// Valid only during the projectile phase. Movement invalidates and clears this index.
function radiusTargets(x,y,radius,body=false,exclude=null){
 let pool;
 if(!collisionGrid)pool=targets();
 else{const pad=radius+(body?collisionGrid.radius:0),left=Math.floor((x-pad)/128),right=Math.floor((x+pad)/128),top=Math.floor((y-pad)/128),bottom=Math.floor((y+pad)/128);
  if((right-left+1)*(bottom-top+1)>Math.max(16,collisionGrid.list.length*4))pool=collisionGrid.list;
  else{const found=new Set();for(let cx=left;cx<=right;cx++)for(let cy=top;cy<=bottom;cy++)for(const z of collisionGrid.cells.get(cx+','+cy)||[])found.add(z);pool=found.size>collisionGrid.list.length*.4?collisionGrid.list:[...found].sort((a,b)=>collisionGrid.rank.get(a)-collisionGrid.rank.get(b));}
 }
 return pool.filter(z=>z!==exclude&&z.hp>0&&Math.hypot(z.x-x,z.y-y)<=radius+(body?z.r:0));
}
function bulletCandidates(ax,ay,bx,by,r){const result=new Set(),pad=r+collisionGrid.radius;for(let x=Math.floor((Math.min(ax,bx)-pad)/128);x<=Math.floor((Math.max(ax,bx)+pad)/128);x++)for(let y=Math.floor((Math.min(ay,by)-pad)/128);y<=Math.floor((Math.max(ay,by)+pad)/128);y++)for(const z of collisionGrid.cells.get(x+','+y)||[])result.add(z);return [...result];}
function healPlayer(amount){
 const before=player.hp;if(before<=0||!Number.isFinite(amount)||amount<=0)return 0;player.hp=Math.min(player.maxHp,before+amount);const actual=player.hp-before;if(actual>0){sound('repair');if(player.specialization==='repairCharge')player.repairShotReady=true;if(player.specialization==='repairPlating')player.repairArmorTime=2;}return actual;
}
function droneCount(){return Math.min(3,(runRobot.id==='swarm'?1:0)+(player.skills.drones?1:0)+(player.skills.dronePair?1:0));}
function tickDrones(dt){
 const count=droneCount();if(!count)return;player.droneTimer=Math.max(0,player.droneTimer-dt);if(player.droneTimer>0)return;player.droneTimer=Math.max(.35,.8*player.droneRateMult);const range=player.droneRange+(player.specialization==='droneRelay'?100:0),pool=targets().filter(z=>z.hp>0&&Math.hypot(z.x-player.x,z.y-player.y)<=range);
 for(let i=0;i<count;i++){let target=null,best=Infinity;if(player.specialization==='droneBossFocus'&&boss?.hp>0&&pool.includes(boss))target=boss;else for(const z of pool)if(z.hp>0){const d=Math.hypot(z.x-player.x,z.y-player.y);if(d<best){best=d;target=z;}}if(!target||target.hp<=0)continue;sound('drone');const a=clock*1.8+i*Math.PI*2/count,origin={x:player.x+Math.cos(a)*42,y:player.y+Math.sin(a)*30},damage=player.damage*.25*player.droneDamageMult*(target===boss&&player.specialization==='droneBossFocus'?1.25:1);effects.push({x:origin.x,y:origin.y,x2:target.x,y2:target.y,life:.12,max:.12,color:'#ffe6a0'});damageEnemy(target,damage,'drone');if(player.skills.droneArc){let next=null,distance=Infinity;for(const z of pool)if(z!==target&&z.hp>0){const d=Math.hypot(z.x-target.x,z.y-target.y);if(d<=160&&d<distance){distance=d;next=z;}}if(next){effects.push({x:target.x,y:target.y,x2:next.x,y2:next.y,life:.12,max:.12,color:'#ffe6a0'});damageEnemy(next,damage*.5,'drone');}}}
}
function drawDrones(){const count=droneCount();for(let i=0;i<count;i++){const a=clock*1.8+i*Math.PI*2/count,x=Math.round(player.x+Math.cos(a)*42),y=Math.round(player.y+Math.sin(a)*30);ctx.fillStyle='#07121b';ctx.fillRect(x-8,y-5,16,10);ctx.fillStyle='#b6a668';ctx.fillRect(x-6,y-3,12,6);ctx.fillStyle='#ffe6a0';ctx.fillRect(x-3,y-2,6,3);ctx.fillStyle='#617b88';ctx.fillRect(x-11,y-2,4,3);ctx.fillRect(x+7,y-2,4,3);}}
function damageEnemy(z,damage,source='direct'){
 if(z.hp<=0)return;
 if(player.specialization==='predatorMark'){if(player.markedTarget===z&&player.markTime>0)damage*=1.25;else{player.markedTarget=z;player.markTime=2.5;}}
 if(source==='bullet'&&z.scanLock>0)damage*=1.25;
 if(z===boss&&player.skills.bossHunter)damage*=3;
 if(player.skills.finisher&&z.hp<=(z.maxHp||30)/3)damage*=3;
 if(z.enemyType==='shieldPolice'&&z.shieldHp>0){const absorbed=Math.min(z.shieldHp,damage);z.shieldHp=Math.max(0,z.shieldHp-damage);z.hit=.12;feedback.push({x:z.x,y:z.y-38,text:'ESCUDO -'+absorbed.toFixed(0),life:.6,color:'#88d9ff'});z.minionBadge='ESCUDO '+Math.ceil(z.shieldHp);if(z.shieldHp===0){preparePoliceCharge(z);effects.push({x:z.x,y:z.y,r:34,life:.4,max:.4,color:'#88d9ff'});sound('shieldBreak');}return;}
 z.hp=Math.max(0,z.hp-damage);z.hit=.12;feedback.push({x:z.x,y:z.y-z.r-8,text:damage.toFixed(1),life:.6,color:'#ffffff'});
 for(let i=0;i<5;i++)sparks.push({x:z.x,y:z.y,vx:random(-90,90),vy:random(-90,90),life:.25});
 if(z.hp===0){
  if(z!==boss)releaseCorrosion(z);effects.push({x:z.x,y:z.y,r:z.r+16,life:.3,max:.3,color:'#78978b'});
  if(z===boss){sound('bossDefeat');bossDefeated=true;bossKills++;if(z.id==='scrapper')policeUnlocked=true;bossReward=true;awardBossPart(z.id);for(const minion of enemies)if(minion.minionOwner===z.id)minion.hp=0;enemies=enemies.filter(minion=>minion.minionOwner!==z.id);hostile=[];hazards=[];effects.push({x:z.x,y:z.y,r:100,life:.6,max:.6,color:'#ffd27c'});releaseCorrosion(z);}
  else{
   if(source==='burn'&&player.specialization==='heatRecovery'&&player.specializationCooldown<=0){healPlayer(1);player.specializationCooldown=2;}if(source==='drone'&&player.specialization==='droneSalvage'&&player.specializationCooldown<=0){healPlayer(1);player.specializationCooldown=1.5;}sound("kill");kills++;gems.push({x:z.x,y:z.y});scrap.push({x:z.x,y:z.y,value:1,life:60});if(kills%REPAIR_CELL.everyKills===0)scrap.push({x:z.x,y:z.y,value:0,repair:REPAIR_CELL.healing,life:60});if(scrap.length>250)scrap=scrap.slice(-250);
   if(state==='playing'){if(player.skills.salvage&&++player.killCounter>=20){player.killCounter=0;healPlayer(20);toast('SUCATA: +1 BATERIA');}if(player.skills.killAmmo&&++player.ammoKills>=10){player.ammoKills=0;player.ammo=Math.min(magazineSize(),player.ammo+1);}}
   if(source==='bullet'&&z.slowTime>0&&player.skills.freeze&&player.skills.finisher)explodeAt(z.x,z.y,player.damage*.5,70,z);
  }
 }
}
function shockAt(z,damage,intrinsic=0){
 const count=intrinsic+(player.skills.shock?(player.skills.pierce?3:1):0)+(player.specialization==='extraFork'?1:0);
 if(count<=0)return;
 const nearest=[];for(const t of radiusTargets(z.x,z.y,135*(player.skills.conductivity?3:1),false,z)){const d=Math.hypot(t.x-z.x,t.y-z.y);let i=0;while(i<nearest.length&&nearest[i].d<=d)i++;if(i<count){nearest.splice(i,0,{t,d});if(nearest.length>count)nearest.pop();}}const near=nearest.map(entry=>entry.t);
 for(const t of near){const before=t.hp;effects.push({x:z.x,y:z.y,x2:t.x,y2:t.y,life:.16,max:.16,color:'#8ceeff'});damageEnemy(t,damage*.5*(runRobot.id==='volt'?1.35:1)*(intrinsic&&player.skills.shock?1.25:1),'electric');if(t.hp<before&&player.specialization==='chargeRecovery'){player.electricHits++;if(player.electricHits>=6&&player.specializationCooldown<=0){player.electricHits=0;player.ammo=Math.min(magazineSize(),player.ammo+1);player.specializationCooldown=.25;}}const stun=(player.skills.stun?(t===boss?.25:1):0)+(player.specialization==='groundPulse'?(t===boss?.1:.35):0);if(stun&&t.hp>0)t.stunTime=Math.max(t.stunTime||0,stun);}
}
function applyElementalStatus(z,b){
 if(z.hp<=0)return;const w=b.weapon||runWeapon,traits=b.weapon?(b.evolutionTraits||{}):(player.weaponEvolution?.traits||{});
 if(player.skills.burn||w.burn){z.burnTime=(player.skills.ignition?9:3)*(player.specialization==='furnaceDuration'?1.5:1);z.burnDps=Math.max(z.burnDps||0,b.damage*.5*(traits.burnMult||1)*(player.skills.afterburn?3:1)*(runRobot.id==='forge'?1.35:1)*(player.skills.burn&&w.burn?1.25:1));z.burnAccum=z.burnAccum||0;}
 if(player.skills.freeze||w.freeze)z.slowTime=Math.max(z.slowTime||0,(player.skills.freeze&&w.freeze?3:2)+(traits.coldBonus||0));
}
function applyStatus(z,b){
 applyElementalStatus(z,b);if(z.hp<=0)return;const w=b.weapon||runWeapon;
 const knock=(w.knock||0)+(player.skills.knock?60:0);
 if(knock){const d=Math.hypot(b.vx,b.vy)||1,amount=knock*(z===boss ? .25 : 1);z.x+=b.vx/d*amount;z.y+=b.vy/d*amount;indexTarget(z);}
}
function sensorInterval(){return Math.max(.5,Math.min(30,3*player.sensorIntervalMult));}
function sensorRange(){return Math.max(40,Math.min(480,player.sensorRange));}
function tickSensor(dt){
 if(!player.skills.sensor||state!=='playing'||!Number.isFinite(dt)||dt<=0)return;
 player.sensorTimer=Math.max(0,player.sensorTimer-dt);if(player.sensorTimer>0)return;
 player.sensorTimer=player.sensorTotal=sensorInterval();sound('sensor');
 const radius=sensorRange(),damage=Math.min(1e9,player.damage*.35*player.sensorDamageMult),pool=targets().filter(z=>z.hp>0&&Math.hypot(z.x-player.x,z.y-player.y)<=radius+z.r);
 effects.push({x:player.x,y:player.y,r:radius,life:.35,max:.35,color:'#83c9ff'});
 for(const z of pool){
  if(z.hp<=0)continue;const shielded=z.shieldHp>0;
  damageEnemy(z,damage,'sensor');
  if(z.hp<=0||shielded)continue;
  if(player.skills.sensorRelay)applyElementalStatus(z,{damage,weapon:runWeapon,evolutionTraits:player.weaponEvolution?.traits||null});
  if(player.skills.sensorLock)z.scanLock=Math.max(z.scanLock||0,2);
 }
}
function applyCorrosion(z,b){
 if(!player.skills.corrosion||z.hp<=0||z.shieldHp>0||z.corrosion||!Number.isFinite(b.damage)||b.damage<=0)return false;
 z.corrosion={remaining:Math.max(.25,Math.min(30,2*player.corrosionDelayMult)),damage:Math.max(0,Math.min(1e9,b.damage*player.corrosionDamageMult)),spread:true};return true;
}
function releaseCorrosion(z){
 const charge=z.corrosion;z.corrosion=null;
 if(!charge?.spread||!player.skills.corrosionBloom)return;
 const near=targets().filter(t=>t!==z&&t.hp>0&&!(t.shieldHp>0)&&!t.corrosion&&Math.hypot(t.x-z.x,t.y-z.y)<=100).sort((a,b)=>Math.hypot(a.x-z.x,a.y-z.y)-Math.hypot(b.x-z.x,b.y-z.y)).slice(0,2);
 for(const t of near){t.corrosion={remaining:Math.max(.25,Math.min(30,2*player.corrosionDelayMult)),damage:charge.damage*.5,spread:false};effects.push({x:z.x,y:z.y,x2:t.x,y2:t.y,life:.2,max:.2,color:'#a6e87d'});}
}
function tickCorrosion(dt){
 if(!player.skills.corrosion||state!=='playing'||!Number.isFinite(dt)||dt<=0)return;
 // Snapshot references prevent charges born during this pass from aging or spreading in the same tick.
 const pending=targets().filter(z=>z.hp>0&&z.corrosion).map(z=>({z,charge:z.corrosion}));
 for(const {z,charge} of pending){
  if(z.hp<=0||z.corrosion!==charge)continue;
  const before=charge.remaining;charge.remaining=Math.max(0,before-dt);
  if(charge.remaining>0)continue;
  const catalyzed=player.skills.corrosionCatalyst&&(z.burnTime>0&&z.burnTime>=before||z.slowTime>0&&z.slowTime>=before);
  effects.push({x:z.x,y:z.y,r:z.r+10,life:.25,max:.25,color:'#a6e87d'});
  sound('corrosion');damageEnemy(z,charge.damage*(catalyzed?1.5:1),'corrosion');
  if(z.corrosion===charge)z.corrosion=null;
 }
}
function explodeAt(x,y,damage,radius,exclude=null){
 radius*=player.skills.blastRadius?2:1;
 effects.push({x,y,r:radius,life:.25,max:.25,color:'#ffbf73'});
 for(const t of radiusTargets(x,y,radius,true,exclude)){
  damageEnemy(t,damage,'explosion');if(player.skills.shock&&t.hp>0)shockAt(t,damage);
 }
}
function impact(z,b){
 const w=b.weapon||runWeapon;const shielded=z.enemyType==='shieldPolice'&&z.shieldHp>0;
 damageEnemy(z,b.damage,'bullet');if(!shielded)applyCorrosion(z,b);applyStatus(z,b);
 if(!shielded&&z.hp>0&&player.skills.knock&&player.acquired.has('speed'))damageEnemy(z,Math.min(player.damage*.5,player.speed*.1),'kinetic');
 if(b.crit&&player.acquired.has('extra')&&!b.criticalPulseDone){b.criticalPulseDone=true;explodeAt(z.x,z.y,b.damage*.35,48,z);}
 if(player.skills.shock||w.chain)shockAt(z,b.damage,w.chain||0);
 const radius=Math.max(w.explosion||0,player.skills.blast?64:0);
 if(radius)explodeAt(z.x,z.y,b.damage*(w.splash||.5)*(w.explosion&&player.skills.blast?1.25:1),radius,z);
}
function emitProjectiles(angle){
 if(bullets.length>=400)return false;
 if(player.reloadTime>0||player.ammo<=0){if(player.ammo<=0)startReload();return false;}
 const repairBoost=player.repairShotReady?1.5:1;player.repairShotReady=false;player.ammo--;player.shotCount++;const w=runWeapon,count=Math.min(400,Math.max(1,Math.floor(w.pellets*player.projectileMult))),spread=Math.max(w.spread,count>1?.16:0)*player.spreadMult;
 for(let i=0;i<count&&bullets.length<400;i++){
  const a=angle+(count===1?0:(i/(count-1)-.5)*spread),crit=!!player.skills.crit&&player.shotCount%5===0,speed=(w.speed||570)*player.projectileSpeed,life=w.life*player.projectileLife;
  bullets.push({weapon:w,evolutionTraits:player.weaponEvolution?.traits||null,x:player.x,y:player.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life,maxLife:life,returnSpeed:speed,damage:shotDamage()*(crit?3:1)*repairBoost,radius:(w.radius||6)*player.projectileSize,crit,remaining:w.returning?999:1+(w.pierce||0)+(player.skills.pierce?2:0)+(repairBoost>1?2:0),hit:new Set(),returning:false,bounces:runWeapon.returning?0:player.skills.ricochet});
 }
 player.weaponKick=1;sound('shot-'+w.id);if(player.ammo===0)startReload();return true;
}
function fireWeapon(){
 if(player.reloadTime>0)return false;
 const angle=Math.atan2(aim.y+camera.y-player.y,aim.x+camera.x-player.x);if(!emitProjectiles(angle))return false;
 if(runWeapon.burst&&player.reloadTime===0)for(let i=1;i<runWeapon.burst;i++)burstQueue.push({delay:i*.075});
 effects.push({x:player.x+Math.cos(angle)*24,y:player.y+Math.sin(angle)*24,r:14,life:.09,max:.09,color:runWeapon.burn?'#ffbf73':'#b6f3ff'});
 shot=fireInterval();if(player.ammo===0)startReload();return true;
}
function bounceProjectile(b,from){
 if(!(b.bounces>0))return false;
 const candidates=targets().filter(z=>z.hp>0&&!b.hit.has(z)&&Math.hypot(z.x-from.x,z.y-from.y)<=220);
 if(!candidates.length)return false;
 candidates.sort((a,z)=>Math.hypot(a.x-from.x,a.y-from.y)-Math.hypot(z.x-from.x,z.y-from.y));
 const target=candidates[0],d=Math.hypot(target.x-from.x,target.y-from.y)||1,speed=Math.hypot(b.vx,b.vy);
 b.x=from.x;b.y=from.y;b.vx=(target.x-from.x)/d*speed;b.vy=(target.y-from.y)/d*speed;b.bounces--;b.remaining=1;
 effects.push({x:from.x,y:from.y,x2:target.x,y2:target.y,life:.1,max:.1,color:'#c6baff'});return true;
}
function tickStatuses(dt){
 tickCorrosion(dt);
 player.specializationCooldown=Math.max(0,player.specializationCooldown-dt);player.repairArmorTime=Math.max(0,player.repairArmorTime-dt);player.markTime=Math.max(0,player.markTime-dt);if(!player.markTime||player.markedTarget?.hp<=0)player.markedTarget=null;
 if(player.decoy){player.decoy.life-=dt;if(player.decoy.life<=0)player.decoy=null;}
 for(const id of Object.keys(player.hitCooldowns))player.hitCooldowns[id]=Math.max(0,player.hitCooldowns[id]-dt);player.frenzy=Math.max(0,player.frenzy-dt);
 if(player.reloadTime>0){player.reloadTime=Math.max(0,player.reloadTime-dt);if(player.reloadTime===0){sound('reloadReady');const capacity=magazineSize(),replaced=Math.max(0,capacity-player.ammo),fraction=Math.max(0,Math.min(1,Math.min(player.reloadMissing,replaced)/player.reloadCapacity));player.ammo=capacity;healPlayer(((player.skills.repair?5:0)+(runRobot.id==='nano'?3:0))*fraction);if(player.specialization==='coolantLoop'&&fraction>=.5){for(const z of targets())if(z.hp>0&&Math.hypot(z.x-player.x,z.y-player.y)<=80)z.slowTime=Math.max(z.slowTime||0,2);effects.push({x:player.x,y:player.y,r:80,life:.4,max:.4,color:'#9df2ef'});}if(player.skills.coldReload){for(const z of targets())if(z.hp>0&&Math.hypot(z.x-player.x,z.y-player.y)<=140)z.slowTime=Math.max(z.slowTime||0,4);effects.push({x:player.x,y:player.y,r:140,life:.4,max:.4,color:'#9df2ef'});}}}
 player.dashCooldown=Math.max(0,player.dashCooldown-dt);
 for(const z of targets()){
  if(z.hp<=0)continue;
  if(z.burnTime>0){const elapsed=Math.min(dt,z.burnTime);z.burnAccum=(z.burnAccum||0)+z.burnDps*elapsed*(player.skills.thermal&&z.slowTime>0?3:1)*(player.specialization==='thermalAmplifier'&&z.slowTime>0?1.25:1);z.burnTick=(z.burnTick||0)+elapsed;z.burnTime=Math.max(0,z.burnTime-dt);if(z.burnTick>=.5||z.burnTime===0){damageEnemy(z,z.burnAccum,'burn');z.burnAccum=0;z.burnTick=0;}if(z.burnTime===0)z.burnDps=0;}
  z.scanLock=Math.max(0,(z.scanLock||0)-dt);z.slowTime=Math.max(0,(z.slowTime||0)-dt);z.stunTime=Math.max(0,(z.stunTime||0)-dt);
 }

 if(player.skills.shield&&!player.shieldReady){player.shieldTimer=Math.max(0,player.shieldTimer-dt);if(!player.shieldTimer)player.shieldReady=true;}
}
function segmentDistance(x,y,ax,ay,bx,by){
 const dx=bx-ax,dy=by-ay,l=dx*dx+dy*dy,t=l?Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/l)):0;
 return Math.hypot(x-ax-t*dx,y-ay-t*dy);
}
function bossTellDuration(b,base){return base*(player.specialization==='threatReader'&&Math.hypot(b.x-player.x,b.y-player.y)<=180?1.2:1);}
function tickBoss(dt){const b=boss,x=b?.x,y=b?.y,phase=b?.phase;tickBossMotion(dt);if(b&&b===boss&&b.hp>0){globalThis.ScrewEnemyAnimation?.advance(b,x,y);globalThis.ScrewBossVisuals?.advance(b,phase,dt);}}
function tickBossMotion(dt){
 if(!boss||boss.hp<=0)return;if(boss.id==='scrapper'||boss.id==='coil'){tickSpecialBoss(dt);return;}const b=boss;b.hit=Math.max(0,b.hit-dt);b.timer-=dt;
 if(b.phase==='approach'){
  const dx=player.x-b.x,dy=player.y-b.y,d=Math.hypot(dx,dy)||1;
  b.x+=dx/d*b.speed*(b.stunTime>0 ? 0 : b.slowTime>0 ? .5 : 1)*dt;b.y+=dy/d*b.speed*(b.stunTime>0 ? 0 : b.slowTime>0 ? .5 : 1)*dt;
  if(b.timer<=0){b.dx=dx/d;b.dy=dy/d;b.phase=b.turn++%2===0?'tellDash':'tellVolley';b.timer=bossTellDuration(b,.95);}
 }else if(b.phase==='tellDash'&&b.timer<=0){sound('bossAttack');b.phase='dash';b.timer=.65;}
 else if(b.phase==='dash'){
  const x=b.x,y=b.y;b.x+=b.dx*360*(b.stunTime>0 ? 0 : b.slowTime>0 ? .5 : 1)*dt;b.y+=b.dy*360*(b.stunTime>0 ? 0 : b.slowTime>0 ? .5 : 1)*dt;
  if(segmentDistance(player.x,player.y,x,y,b.x,b.y)<b.r+14)hurtPlayer(20,b.x,b.y,'boss-contact');
  if(b.timer<=0){b.phase='approach';b.timer=2;}
 }else if(b.phase==='tellVolley'&&b.timer<=0){sound('bossAttack');
  const a=Math.atan2(b.dy,b.dx);
  for(let i=0;i<12;i++){const angle=a+i*Math.PI*2/12;hostile.push({x:b.x,y:b.y,vx:Math.cos(angle)*145,vy:Math.sin(angle)*145,life:4,r:7});}
  b.phase='approach';b.timer=2.5;
 }
 if(Math.hypot(player.x-b.x,player.y-b.y)<b.r+14)hurtPlayer(20,b.x,b.y,'boss-contact');
}
function tickSpecialBoss(dt){
 const b=boss;b.hit=Math.max(0,b.hit-dt);b.timer-=dt;
 if(b.id==='scrapper'){const dx=player.x-b.x,dy=player.y-b.y,d=Math.hypot(dx,dy)||1,factor=b.stunTime>0?0:b.slowTime>0?.5:1,move=d>240?1:d<180?-.6:0;b.x+=dx/d*b.speed*factor*move*dt;b.y+=dy/d*b.speed*factor*move*dt;}
 if(b.phase==='approach'){
  const dx=player.x-b.x,dy=player.y-b.y,d=Math.hypot(dx,dy)||1,factor=b.stunTime>0?0:b.slowTime>0?.5:1;
  // Both specialists approach slowly; their danger comes from area control.
  if(b.id!=='scrapper'&&d>140){b.x+=dx/d*b.speed*factor*dt;b.y+=dy/d*b.speed*factor*dt;}
  if(b.timer<=0){b.dx=dx/d;b.dy=dy/d;
   if(b.id==='scrapper'){
    b.phase='tellMortar';b.timer=bossTellDuration(b,1.4);
    for(let i=-1;i<=1;i++)hazards.push({type:'pool',x:player.x+i*95,y:player.y+(i===0?0:55),r:44,delay:b.timer+dt,tellDuration:b.timer,life:5,owner:b});
   }else{b.phase=b.turn++%2===0?'tellPulse':'tellFan';b.timer=bossTellDuration(b,1.1);}
  }
 }else if(b.phase==='tellMortar'&&b.timer<=0){sound('bossAttack');b.phase='approach';b.timer=4;}
 else if(b.phase==='tellPulse'&&b.timer<=0){sound('bossAttack');hazards.push({type:'ring',x:b.x,y:b.y,r:28,previous:28,speed:100,life:2.8,delay:0,owner:b});b.phase='approach';b.timer=3;}
 else if(b.phase==='tellFan'&&b.timer<=0){sound('bossAttack');
  const angle=Math.atan2(b.dy,b.dx);
  for(let i=-2;i<=2;i++){const a=angle+i*.22;hostile.push({x:b.x,y:b.y,vx:Math.cos(a)*190,vy:Math.sin(a)*190,life:4,r:7,color:'#c3b6ed'});}
  b.phase='approach';b.timer=3;
 }
 if(Math.hypot(player.x-b.x,player.y-b.y)<b.r+14)hurtPlayer(20,b.x,b.y,'boss-contact');
}
function tickHazards(dt){
 for(const h of hazards){
  if(h.owner.hp<=0){h.life=0;continue;}
  const active=Math.min(h.life,Math.max(0,dt-Math.max(0,h.delay)));h.delay=Math.max(0,h.delay-dt);if(active===0)continue;
  h.life-=active;
  const distance=Math.hypot(player.x-h.x,player.y-h.y);
  if(h.type==='ring'){h.previous=h.r;h.r+=h.speed*active;if(distance>=h.previous-20&&distance<=h.r+20)hurtPlayer(14,h.x,h.y,'boss-hazard');}
  else if(distance<h.r+14)hurtPlayer(12,h.x,h.y,'boss-hazard');
 }
 hazards=hazards.filter(h=>h.life>0).slice(-60);
}
function drawHazards(){
 for(const h of hazards){
  ctx.strokeStyle=h.type==='ring'?'#c3b6ed':'#b6d38d';ctx.lineWidth=h.type==='ring'?7:2;
  if(h.type==='pool'){ctx.fillStyle=h.delay>0?'rgba(182,211,141,.10)':'rgba(129,163,88,.32)';ctx.beginPath();ctx.arc(h.x,h.y,h.r,0,Math.PI*2);ctx.fill();}
  ctx.beginPath();ctx.arc(h.x,h.y,h.r,0,Math.PI*2);ctx.stroke();
  if(h.delay>0){ctx.lineWidth=3;ctx.beginPath();ctx.arc(h.x,h.y,h.r+5,-Math.PI/2,-Math.PI/2+Math.PI*2*(1-h.delay/(h.tellDuration||1.4)));ctx.stroke();ctx.fillStyle='#d1e2aa';ctx.fillRect(h.x-7,h.y-1,14,2);ctx.fillRect(h.x-1,h.y-7,2,14);}
 }
}
function tick(dt){
 if(state!=='playing')return;
 clock+=dt;
 player.inv=Math.max(0,player.inv-dt);player.weaponKick=Math.max(0,player.weaponKick-dt*12);tickStatuses(dt);
 const dx=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft')),dy=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup')),length=Math.hypot(dx,dy)||1;
 const dashDt=Math.min(dt,player.dashTime),normalDt=dt-dashDt;
 player.x+=dx/length*player.speed*normalDt+player.dashDx*player.speed*3*dashDt;player.y+=dy/length*player.speed*normalDt+player.dashDy*player.speed*3*dashDt;
 player.dashTime=Math.max(0,player.dashTime-dt);
 const moving=dx!==0||dy!==0||dashDt>0;const priorStationary=player.stationary;player.stationary=moving?0:player.stationary+dt;if(player.skills.regen&&!moving)healPlayer(Math.max(0,player.stationary-Math.max(3,priorStationary))*2);player.stride+=(Number(moving)-player.stride)*(1-Math.exp(-14*dt));if(moving)player.walkPhase+=player.speed*dt*.055;
 {const mx=dashDt>0?player.dashDx:dx,my=dashDt>0?player.dashDy:dy;if(moving)player.facing=Math.abs(mx)>Math.abs(my)?(mx>0?'right':'left'):(my>0?'down':'up');const animation=runRobot.id==='prot'?protAnimation:chassisAnimations.get(runRobot.id);if(animation){animation.play(moving?'walk':'idle',player.facing||'down');animation.update(dt);}}
 syncCamera(dt);
 enemies=enemies.filter(z=>z.hp>0);
 const bossAlive=!!boss&&boss.hp>0,bossDue=clock>=bossTime(bossIndex)&&!bossAlive&&!bossReward;
 {spawn-=dt;if(spawn<=0){spawn=Math.max(HORDE.minInterval,HORDE.interval-clock*HORDE.ramp);spawnCircularWave(HORDE.waveSize);}}
 if(bossDue)spawnBoss();
 if(firing&&player.reloadTime===0){for(const queued of [...burstQueue]){queued.delay-=dt;if(queued.delay<=0&&aim.active&&player.reloadTime===0)emitProjectiles(Math.atan2(aim.y+camera.y-player.y,aim.x+camera.x-player.x));}burstQueue=burstQueue.filter(q=>q.delay>0);}else burstQueue=[];
 shot=Math.max(0,shot-dt);if(firing&&aim.active&&shot<=0&&bullets.length<400)fireWeapon();
 if(bullets.length)buildCollisionGrid();
 for(const b of bullets){
  const ax=b.x,ay=b.y;
  if((b.weapon||runWeapon).returning&&b.life<=b.maxLife/2){if(!b.returning){b.returning=true;b.hit.clear();}const d=Math.hypot(player.x-b.x,player.y-b.y)||1;b.vx=(player.x-b.x)/d*(b.returnSpeed??(runWeapon.speed||360)*player.projectileSpeed);b.vy=(player.y-b.y)/d*(b.returnSpeed??(runWeapon.speed||360)*player.projectileSpeed);if(d<16)b.life=0;}
  b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
  if(b.life<=0){const w=b.weapon||runWeapon;if(w.detonate&&!b.detonated){b.detonated=true;explodeAt(b.x,b.y,b.damage,w.explosion);}continue;}
  const hit=bulletCandidates(ax,ay,b.x,b.y,b.radius).filter(z=>z.hp>0&&!b.hit.has(z)&&segmentDistance(z.x,z.y,ax,ay,b.x,b.y)<z.r+b.radius).sort((a,z)=>Math.hypot(a.x-ax,a.y-ay)-Math.hypot(z.x-ax,z.y-ay));
  for(const z of hit){if(b.remaining<=0)break;if(z.hp<=0)continue;b.hit.add(z);impact(z,b);b.remaining--;if(!b.remaining){if(bounceProjectile(b,z))break;b.life=0;}}
 }
 collisionGrid=null;bullets=bullets.filter(b=>b.life>0);
 for(const z of enemies){
  if(z.hp<=0)continue;z.hit=Math.max(0,z.hit-dt);const playerDistance=Math.hypot(player.x-z.x,player.y-z.y),chase=player.decoy&&commonPursuer(z)?player.decoy:player,dx=chase.x-z.x,dy=chase.y-z.y,d=Math.hypot(dx,dy)||1;
  if(z.enemyType==='shieldPolice'&&z.shieldHp===0){const oldX=z.x,oldY=z.y;tickPoliceCharge(z,dt);globalThis.ScrewEnemyAnimation?.advance(z,oldX,oldY);if(playerDistance<z.r+14)hurtPlayer(12,z.x,z.y);continue;}
  let move=1;
  if(z.enemyType==='expolice'){
   const ideal=245,retreat=170;move=d>ideal?1:d<retreat?-.65:0;z.shotCooldown-=dt;
   if(d<560&&z.shotCooldown<=0){fireCommonShooter(z);z.shotCooldown=2.8;}
  }else if(z.minionType==='gunner'||z.minionType==='conductor'){
   const ideal=z.minionType==='gunner'?220:180,retreat=z.minionType==='gunner'?145:115;
   move=d>ideal?1:d<retreat?-.7:0;z.shotCooldown-=dt;
   if(d<560&&z.shotCooldown<=0){fireBossMinion(z,z.minionType==='conductor');z.shotCooldown=z.minionType==='gunner'?2.2:2.8;}
  }
  const status=z.stunTime>0?0:z.slowTime>0?.5:1,speed=z.speed,oldX=z.x,oldY=z.y;z.x+=dx/d*speed*move*status*dt;z.y+=dy/d*speed*move*status*dt;globalThis.ScrewEnemyAnimation?.advance(z,oldX,oldY);
  if(playerDistance<z.r+14)hurtPlayer(12,z.x,z.y);
 }
 tickBoss(dt);tickHazards(dt);tickDrones(dt);tickSensor(dt);
 for(const b of hostile){const ax=b.x,ay=b.y,brake=player.specialization==='magneticBrake'&&Math.hypot(b.x-player.x,b.y-player.y)<=90?.75:1;b.x+=b.vx*dt*brake;b.y+=b.vy*dt*brake;b.life-=dt;if(segmentDistance(player.x,player.y,ax,ay,b.x,b.y)<b.r+14){hurtPlayer(b.damage||12,b.x,b.y,b.source||'projectile');b.life=0;}}
 hostile=hostile.filter(b=>b.life>0);
 for(const g of gems){const d=Math.hypot(g.x-player.x,g.y-player.y);if(d<player.magnet){g.x+=(player.x-g.x)*Math.min(1,dt*9);g.y+=(player.y-g.y)*Math.min(1,dt*9);}if(d<18){g.collected=true;sound("pickup");effects.push({x:player.x,y:player.y,r:24,life:.18,max:.18,color:'#3cc7f4'});xp+=player.skills.xp?2:1;}}
 gems=gems.filter(g=>!g.collected);
 let recoveredBolts=0;
 for(const piece of scrap){piece.life-=dt;const d=Math.hypot(piece.x-player.x,piece.y-player.y);if(d<player.magnet){piece.x+=(player.x-piece.x)*Math.min(1,dt*9);piece.y+=(player.y-piece.y)*Math.min(1,dt*9);}if(d<18){piece.collected=true;if(piece.repair)healPlayer(piece.repair);else recoveredBolts+=piece.value;effects.push({x:player.x,y:player.y,r:20,life:.2,max:.2,color:piece.repair?'#8ff0ab':'#ffd27c'});}}
 scrap=scrap.filter(piece=>!piece.collected&&piece.life>0);
 if(recoveredBolts){profile.bolts=profileCount(profile.bolts+recoveredBolts);saveProfile();toast('PARAFUSOS RECUPERADOS · +'+recoveredBolts,'#ffd27c');}
 for(const p of sparks){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;}sparks=sparks.filter(p=>p.life>0).slice(-600);
 for(const f of feedback){f.y-=28*dt;f.life-=dt;}feedback=feedback.filter(f=>f.life>0).slice(-100);
 for(const e of effects)e.life-=dt;effects=effects.filter(e=>e.life>0).slice(-150);upgradeFlash=Math.max(0,upgradeFlash-dt);
 if(state==='playing'){
  if(bossReward){bossReward=false;healPlayer(bossRepairAmount());offerExperiment();}
  else if(xp>=need){xp-=need;level++;need=Math.ceil(need*PROGRESSION.growth);if(level===10)offerSpecialization();else if(level===WEAPON_EVOLUTION_LEVEL)offerWeaponEvolution();else if(BLESSING_LEVELS.includes(level))offerBlessing();else upgrade();}
 }
 if(feedback.length>100)feedback.splice(0,feedback.length-100);if(effects.length>150)effects.splice(0,effects.length-150);
 updateHUD();
}
function drawRobot(){
 const animation=chassisAnimations.get(runRobot?.id);if(animation){ctx.save();ctx.strokeStyle='rgba(60,199,244,.85)';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(player.x,player.y+25,30,9,0,0,Math.PI*2);ctx.stroke();if(player.inv>0)ctx.globalAlpha=.6;animation.draw(ctx,player.x,player.y+28);ctx.restore();return;}
 if(runRobot?.id==='prot'&&protSprite&&protSprite.complete&&protSprite.naturalWidth>0){
  ctx.save();ctx.translate(player.x,player.y);ctx.fillStyle='rgba(4,12,20,.8)';ctx.beginPath();ctx.ellipse(0,25,29,8,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(60,199,244,.85)';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,22,32,10,0,0,Math.PI*2);ctx.stroke();if(player.inv>0)ctx.globalAlpha=.6;ctx.imageSmoothingEnabled=false;if(protAnimation)protAnimation.draw(ctx,0,globalThis.ScrewProtAnimation.groundOffset);else ctx.drawImage(protSprite,-29,-36,58,72);ctx.restore();return;
 }
 if(runRobot?.id==='bastion'||runRobot?.sprite==='bastion'){
  ctx.save();ctx.translate(player.x,player.y);ctx.scale(.8,.8);if(runRobot.fallbackFilter||runRobot.filter)ctx.filter=runRobot.fallbackFilter||runRobot.filter;if(player.inv>0)ctx.globalAlpha=.6;
  if(robotSprite&&robotSprite.complete&&robotSprite.naturalWidth>0){const frame=player.stride>.1?Math.floor(player.walkPhase*1.4)%4:0;ctx.imageSmoothingEnabled=false;ctx.drawImage(robotSprite,frame*64,0,64,80,-32,-44,64,80);}
  else{ctx.fillStyle='#4f6b7a';ctx.fillRect(-26,-20,52,40);ctx.fillStyle='#e8ddc9';ctx.fillRect(-31,-18,14,18);ctx.fillRect(17,-18,14,18);ctx.fillRect(-20,22,15,12);ctx.fillRect(5,22,15,12);ctx.fillStyle='#3cc7f4';ctx.fillRect(-10,-10,20,5);ctx.fillRect(-6,5,12,8);}
  ctx.restore();return;
 }
 ctx.save();ctx.translate(player.x,player.y);ctx.scale(.85,.85);if(player.inv>0)ctx.globalAlpha=.5+Math.sin(player.inv*40)*.3;
 // Heavy humanoid with opposing arms and articulated legs.
const stride=player.stride||0,phase=player.walkPhase||0;
const step=Math.sin(phase)*stride,bob=Math.abs(Math.cos(phase))*stride*1.8;
ctx.fillStyle='#040b15';ctx.beginPath();ctx.ellipse(0,23,21,6,0,0,Math.PI*2);ctx.fill();
ctx.save();ctx.translate(0,-bob);
for(const side of [-1,1]){
 ctx.save();ctx.translate(side*8,10);ctx.rotate(step*side*.26);
 ctx.fillStyle='#162c44';ctx.fillRect(-5,-3,10,10);
 ctx.fillStyle='#abc3db';ctx.fillRect(-5,3,10,10);
 ctx.fillStyle='#3d7fba';ctx.fillRect(-5,10,10,6);
 ctx.fillStyle='#253e58';ctx.fillRect(-4,16,8,6);
 ctx.fillStyle='#c2d8eb';ctx.fillRect(-6,21,12,6);
 ctx.fillStyle='#0b1b2d';ctx.fillRect(-6,26,12,3);ctx.restore();
}
ctx.fillStyle='#152e4b';ctx.fillRect(-11,3,22,8);
ctx.fillStyle='#bdd3e6';ctx.beginPath();ctx.moveTo(-16,-16);ctx.lineTo(16,-16);ctx.lineTo(12,3);ctx.lineTo(-12,3);ctx.closePath();ctx.fill();
ctx.fillStyle='#2c6ea7';ctx.fillRect(-12,-13,24,7);
ctx.fillStyle='#102945';ctx.fillRect(-6,-8,12,11);
ctx.fillStyle='#71e7ff';ctx.beginPath();ctx.arc(0,-3,4,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#e6f6ff';ctx.fillRect(-2,-5,3,3);
for(const side of [-1,1]){
 ctx.save();ctx.translate(side*18,-11);ctx.rotate(-step*side*.28);
 ctx.fillStyle='#416c94';ctx.fillRect(-6,-7,12,12);
 ctx.fillStyle='#d1e3f3';ctx.fillRect(-6,-7,12,5);
 ctx.fillStyle='#192d42';ctx.fillRect(-3,5,6,6);
 ctx.fillStyle='#8daac4';ctx.fillRect(-5,9,10,10);
 ctx.fillStyle='#274969';ctx.fillRect(-5,16,10,6);ctx.restore();
}
ctx.fillStyle='#162c44';ctx.fillRect(-4,-21,8,6);
ctx.fillStyle='#d3e5f2';ctx.fillRect(-8,-31,16,12);
ctx.fillStyle='#3f7199';ctx.fillRect(-10,-28,3,8);ctx.fillRect(7,-28,3,8);
ctx.fillStyle='#0a223c';ctx.fillRect(-6,-27,12,5);
ctx.fillStyle='#77eaff';ctx.fillRect(-5,-26,10,2);
ctx.fillStyle='#386a94';ctx.fillRect(-4,-20,8,3);
ctx.restore();

 ctx.restore();
}
// Zombie art is cosmetic; a procedural fallback remains available while the atlas loads.
function drawEnemyBadge(z,top){
 if(!z.minionType&&!z.minionBadge)return;
 const label=z.minionBadge||z.minionType.toUpperCase(),badgeWidth=label.length*6+10;ctx.fillStyle='#07121b';ctx.fillRect(-badgeWidth/2,top-16,badgeWidth,14);ctx.fillStyle=z.minionColor||'#ffd27c';ctx.fillRect(-badgeWidth/2+1,top-15,badgeWidth-2,12);ctx.fillStyle='#07121b';ctx.font='bold 9px monospace';ctx.textAlign='center';ctx.fillText(label,0,top-6);
}
function drawZombie(z,heavy=false){
 heavy=heavy||!!z.heavy;
 const variantIndex=heavy?2:(z.variant||0),sprite=zombieSprites[variantIndex];
 const animated=globalThis.ScrewZombieRenderer?.draw(ctx,z,variantIndex,heavy?95:58*Math.max(.88,Math.min(1.12,z.r/13)));
 if(animated){
  if(z.slowTime>0||z.burnTime>0||z.stunTime>0||z.minionType||z.minionBadge){
   const {height,width}=animated,dx=-width/2,dy=-height*.55;ctx.save();ctx.translate(Math.round(z.x),Math.round(z.y));
   if(z.slowTime>0){ctx.strokeStyle='#9cecff';ctx.lineWidth=1.5;ctx.strokeRect(dx-2,dy-2,width+4,height+4);}
   if(z.burnTime>0){ctx.fillStyle='#ff934d';ctx.fillRect(-width*.43,height*.08,3,6);ctx.fillRect(width*.3,-height*.06,3,6);}
   if(z.stunTime>0){ctx.strokeStyle='#c5f6ff';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-7,dy-3);ctx.lineTo(-2,dy-7);ctx.lineTo(2,dy-2);ctx.lineTo(8,dy-6);ctx.stroke();}
   window.drawEnemyWeapon?.(ctx,z,player);drawEnemyBadge(z,dy);ctx.restore();
  }
  return;
 }

 if(sprite?.complete&&sprite.naturalWidth){
  const phase=clock*(heavy?3:5)+z.x*.013+z.y*.009;
  const height=heavy?95:58*Math.max(.88,Math.min(1.12,z.r/13)),width=height*sprite.naturalWidth/sprite.naturalHeight;
  const bob=z.stunTime>0?0:Math.abs(Math.sin(phase))*(heavy?1.6:1.2);
  ctx.save();ctx.translate(Math.round(z.x),Math.round(z.y));
  ctx.fillStyle='rgba(0,0,0,.42)';ctx.beginPath();ctx.ellipse(0,height*.39,width*.44,height*.1,0,0,Math.PI*2);ctx.fill();
  ctx.rotate(z.stunTime>0?0:Math.sin(phase)*.035);ctx.translate(0,-bob);ctx.imageSmoothingEnabled=false;
  const dx=-width/2,dy=-height*.55;ctx.drawImage(sprite,dx,dy,width,height);
  if(z.hit>0){ctx.globalCompositeOperation='source-atop';ctx.fillStyle='rgba(255,255,255,.72)';ctx.fillRect(dx,dy,width,height);ctx.globalCompositeOperation='source-over';}
  if(z.slowTime>0){ctx.strokeStyle='#9cecff';ctx.lineWidth=1.5;ctx.strokeRect(dx-2,dy-2,width+4,height+4);}
  if(z.burnTime>0){ctx.fillStyle='#ff934d';ctx.fillRect(-width*.43,height*.08,3,6);ctx.fillRect(width*.3,-height*.06,3,6);}
  if(z.stunTime>0){ctx.strokeStyle='#c5f6ff';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-7,dy-3);ctx.lineTo(-2,dy-7);ctx.lineTo(2,dy-2);ctx.lineTo(8,dy-6);ctx.stroke();}
  window.drawEnemyWeapon?.(ctx,z,player);drawEnemyBadge(z,dy);
  ctx.restore();return;
 }
 const scale=heavy?2.35:z.r/11,phase=clock*(heavy?3:5)+z.x*.013+z.y*.009;
 const step=z.stunTime>0?0:Math.sin(phase)*2,bob=z.stunTime>0?0:Math.abs(Math.sin(phase))*1.2;
 ctx.save();ctx.translate(Math.round(z.x),Math.round(z.y));
 ctx.fillStyle='rgba(0,0,0,.38)';ctx.beginPath();ctx.ellipse(0,scale*13,scale*15,scale*4,0,0,Math.PI*2);ctx.fill();
 ctx.scale(scale,scale);ctx.translate(0,-bob);
 const outline='#111722',cloth=z.hit>0?'#fff0d7':heavy?'#b27d48':'#78894e',skin=z.hit>0?'#ffffff':'#c5d18a';
 // Boots and trouser legs alternate without changing position or hitboxes.
 for(const side of [-1,1]){const gait=side*step;ctx.fillStyle=outline;ctx.fillRect(side*5-4,5+gait,8,11);ctx.fillStyle='#293e3d';ctx.fillRect(side*5-3,6+gait,6,6);ctx.fillStyle='#14282d';ctx.fillRect(side*5-4,12+gait,9,4);}
 ctx.fillStyle=outline;ctx.fillRect(-11,-10,22,20);ctx.fillStyle=cloth;ctx.fillRect(-9,-9,18,17);
 ctx.fillStyle=heavy?'#aa8b59':'#617267';ctx.fillRect(-9,-9,6,5);ctx.fillRect(4,-9,5,4);
 ctx.fillStyle='#162d33';ctx.fillRect(-2,-8,3,16);ctx.fillStyle='#c79758';ctx.fillRect(-6,2,4,3);ctx.fillRect(4,-5,3,4);
 for(const side of [-1,1]){ctx.fillStyle=outline;ctx.fillRect(side*12-3,-7-side*step,7,16);ctx.fillStyle=cloth;ctx.fillRect(side*12-2,-6-side*step,5,10);ctx.fillStyle=skin;ctx.fillRect(side*12-2,4-side*step,5,5);}
 ctx.fillStyle=outline;ctx.fillRect(-7,-22,14,15);ctx.fillStyle=skin;ctx.fillRect(-5,-20,10,11);
 ctx.fillStyle='#354f49';ctx.fillRect(-6,-22,11,4);ctx.fillRect(-7,-19,3,4);
 ctx.fillStyle='#182c31';ctx.fillRect(-5,-16,4,3);ctx.fillRect(2,-16,4,3);
 ctx.fillStyle=heavy?'#ffd078':'#ffd078';ctx.fillRect(-4,-16,2,2);ctx.fillRect(3,-16,2,2);
 ctx.fillStyle='#263e3c';ctx.fillRect(-2,-11,5,2);
 if(heavy){ctx.fillStyle='#172a31';ctx.fillRect(-17,-12,8,9);ctx.fillRect(9,-12,8,9);ctx.fillStyle='#b78d50';ctx.fillRect(-16,-11,6,3);ctx.fillRect(10,-11,6,3);}
 if(z.slowTime>0){ctx.strokeStyle='#9cecff';ctx.lineWidth=1;ctx.strokeRect(-18,-25,36,43);}
 if(z.burnTime>0){ctx.fillStyle='#ff934d';ctx.fillRect(-13,4,3,6);ctx.fillRect(10,-4,3,5);}
 if(z.stunTime>0){ctx.strokeStyle='#c5f6ff';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-7,-27);ctx.lineTo(-2,-30);ctx.lineTo(2,-26);ctx.lineTo(8,-29);ctx.stroke();}
 window.drawEnemyWeapon?.(ctx,z,player);drawEnemyBadge(z,-25);
 ctx.restore();
}
function drawSpecialBoss(b){
 if(globalThis.ScrewBossVisuals?.draw(ctx,b,player,clock))return;
 ctx.save();ctx.translate(b.x,b.y);
 ctx.fillStyle='rgba(0,0,0,.4)';ctx.beginPath();ctx.ellipse(0,30,38,10,0,0,Math.PI*2);ctx.fill();
 const color=b.hit>0?'#ffffff':b.id==='scrapper'?'#8c9f67':'#8d83b4';
 ctx.fillStyle='#13242d';ctx.fillRect(-24,-28,48,57);ctx.fillStyle=color;ctx.fillRect(-20,-24,40,48);
 ctx.fillStyle='#233843';ctx.fillRect(-15,17,12,20);ctx.fillRect(3,17,12,20);ctx.fillStyle='#0a1823';ctx.fillRect(-17,31,16,7);ctx.fillRect(1,31,16,7);
 ctx.fillStyle='#12232e';ctx.fillRect(-13,-37,26,22);ctx.fillStyle=color;ctx.fillRect(-11,-35,22,5);ctx.fillStyle=b.id==='scrapper'?'#e0d49a':'#dfd1ff';ctx.fillRect(-8,-27,16,4);
 if(b.id==='scrapper'){
  ctx.fillStyle='#263e38';ctx.fillRect(-35,-21,14,42);ctx.fillRect(21,-21,14,42);ctx.fillStyle='#d5ba7f';ctx.fillRect(-33,-19,10,8);ctx.fillRect(23,-19,10,8);ctx.fillStyle='#172b2c';ctx.fillRect(-12,-9,24,20);ctx.fillStyle='#b6d38d';ctx.fillRect(-8,-5,16,5);
 }else{
  for(const side of [-1,1]){ctx.fillStyle='#2b2945';ctx.fillRect(side*30-8,-24,16,43);ctx.strokeStyle='#c3b6ed';ctx.lineWidth=3;for(let i=0;i<4;i++)ctx.strokeRect(side*30-10,-22+i*10,20,5);}
  ctx.strokeStyle='#d7c6ff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,1,10,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#efe5ff';ctx.fillRect(-3,-2,6,6);
 }
 ctx.restore();
}
function drawProjectile(b){
 const w=runWeapon,id=w.id,color=w.burn?'#ffb363':w.freeze?'#9df2ef':id==='tesla'?'#c5b4ff':w.explosion?'#ffc17a':'#89ddff';
 ctx.save();ctx.translate(b.x,b.y);ctx.rotate(Math.atan2(b.vy,b.vx));const visualScale=(b.radius||(w.radius||6))/(w.radius||6);ctx.scale(visualScale,visualScale);
 ctx.strokeStyle=color;ctx.lineWidth=id==='laser'?4:2;ctx.globalAlpha=.45;
 ctx.beginPath();ctx.moveTo(-Math.min(32,Math.hypot(b.vx,b.vy)*.025),0);ctx.lineTo(0,0);ctx.stroke();ctx.globalAlpha=1;
 if(w.returning){ctx.rotate(clock*12);ctx.fillStyle='#152f43';ctx.fillRect(-9,-3,18,6);ctx.fillRect(-3,-9,6,18);ctx.strokeStyle=color;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,8,0,Math.PI*2);ctx.stroke();}
 else if(id==='harpoon'){ctx.fillStyle='#c3d3d7';ctx.fillRect(-13,-2,23,4);ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(4,-6);ctx.lineTo(4,6);ctx.closePath();ctx.fill();}
 else if(w.explosion){ctx.fillStyle='#294253';ctx.fillRect(-9,-5,16,10);ctx.fillStyle=color;ctx.fillRect(4,-4,6,8);ctx.fillStyle='#e8ddc9';ctx.fillRect(-5,-2,8,4);}
 else{ctx.fillStyle=color;ctx.beginPath();ctx.arc(0,0,w.radius||6,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f2fcff';ctx.fillRect(-2,-2,5,3);}
 ctx.restore();
}
// Deterministic world decoration: rendering never consumes combat randomness.
function terrainNoise(x,y,salt=0){let n=Math.imul(x,374761393)^Math.imul(y,668265263)^salt;n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296;}
function drawArena(){
 if(!arenaPattern&&arenaTile?.complete&&arenaTile.naturalWidth)arenaPattern=ctx.createPattern(arenaTile,'repeat');
 if(arenaPattern){ctx.fillStyle=arenaPattern;ctx.fillRect(camera.x,camera.y,width,height);ctx.fillStyle='rgba(8,21,35,.82)';ctx.fillRect(camera.x,camera.y,width,height);}
 else{ctx.fillStyle='#223345';ctx.fillRect(camera.x,camera.y,width,height);}
 const size=512,left=Math.floor(camera.x/size),top=Math.floor(camera.y/size);
 for(let iy=top;iy<=Math.floor((camera.y+height)/size);iy++)for(let ix=left;ix<=Math.floor((camera.x+width)/size);ix++){
  const x=ix*size,y=iy*size,n=terrainNoise(ix,iy,701);
  if(n>.9){const px=x+100+terrainNoise(ix,iy,702)*280,py=y+90+terrainNoise(ix,iy,703)*300;ctx.fillStyle='#0b1722';ctx.fillRect(px-4,py+14,90,40);ctx.fillStyle='#26394b';ctx.fillRect(px,py+4,82,31);ctx.fillStyle='#566b7d';ctx.fillRect(px+9,py,66,8);ctx.fillStyle='#101e2c';ctx.fillRect(px+17,py+10,50,15);ctx.fillStyle='#263f55';ctx.fillRect(px+20,py+12,43,10);ctx.fillStyle='#0a141f';ctx.fillRect(px+7,py+26,12,12);ctx.fillRect(px+62,py+26,12,12);ctx.fillStyle='#bd784c';ctx.fillRect(px+3,py+13,4,5);ctx.fillRect(px+75,py+13,4,5);}
  if(n>.65&&n<.75){const bx=x+350+terrainNoise(ix,iy,704)*100,by=y+350+terrainNoise(ix,iy,705)*90;ctx.fillStyle='#101a27';ctx.fillRect(bx,by+16,17,4);ctx.fillStyle='#995f46';ctx.fillRect(bx+2,by,13,17);ctx.fillStyle='#c58a67';ctx.fillRect(bx+4,by+2,9,2);ctx.fillStyle='#3c5063';ctx.fillRect(bx+2,by+9,13,2);}
 }
 // Cool light follows the player without changing the infinite floor texture.
 if(typeof ctx.createRadialGradient==='function'){
  const light=ctx.createRadialGradient(player.x,player.y,16,player.x,player.y,320);
  if(light&&light.addColorStop){light.addColorStop(0,'rgba(60,199,244,.18)');light.addColorStop(.22,'rgba(60,199,244,.08)');light.addColorStop(1,'rgba(60,199,244,0)');ctx.fillStyle=light;ctx.fillRect(player.x-320,player.y-320,640,640);}
 }
}
function draw(){
 ctx.fillStyle='#0b1728';ctx.fillRect(0,0,width,height);if(!player)return;
 ctx.save();ctx.translate(-camera.x,-camera.y);drawArena();drawHazards();if(player.decoy){ctx.strokeStyle='#a8f1ff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(player.decoy.x,player.decoy.y,22,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#a8f1ff';ctx.font='bold 10px monospace';ctx.textAlign='center';ctx.fillText('ECO',player.decoy.x,player.decoy.y-28);}if(player.markedTarget&&player.markTime>0){const marked=player.markedTarget;ctx.strokeStyle='#ffd27c';ctx.lineWidth=2;ctx.beginPath();ctx.arc(marked.x,marked.y,marked.r+7,0,Math.PI*2);ctx.stroke();}
 for(const piece of scrap){const pulse=.8+Math.sin(clock*5+piece.x*.02)*.2;ctx.save();ctx.translate(Math.round(piece.x),Math.round(piece.y));ctx.globalAlpha=.65+pulse*.35;if(piece.repair){ctx.fillStyle='#153e29';ctx.fillRect(-9,-9,18,18);ctx.fillStyle='#9ff0b8';ctx.fillRect(-6,-2,12,4);ctx.fillRect(-2,-6,4,12);}else{ctx.fillStyle='#3a2d1c';ctx.fillRect(-7,-6,14,12);ctx.fillStyle='#b7833d';ctx.fillRect(-5,-5,10,9);ctx.fillStyle='#ffe09a';ctx.fillRect(-2,-7,4,3);ctx.fillRect(-2,3,4,3);ctx.fillStyle='#f6c45f';ctx.fillRect(-3,-3,6,6);ctx.fillStyle='#4c3920';ctx.fillRect(-1,-2,2,4);}ctx.restore();}
 for(const g of gems){
  ctx.fillStyle='rgba(60,199,244,.22)';ctx.beginPath();ctx.arc(g.x,g.y,14,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#a8f1ff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(g.x,g.y,8,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle='#071a27';ctx.beginPath();ctx.moveTo(g.x,g.y-7);ctx.lineTo(g.x+7,g.y);ctx.lineTo(g.x,g.y+7);ctx.lineTo(g.x-7,g.y);ctx.closePath();ctx.fill();
  ctx.fillStyle='#3cc7f4';ctx.beginPath();ctx.moveTo(g.x,g.y-5);ctx.lineTo(g.x+5,g.y);ctx.lineTo(g.x,g.y+5);ctx.lineTo(g.x-5,g.y);ctx.closePath();ctx.fill();ctx.fillStyle='#e7fcff';ctx.fillRect(g.x-2,g.y-4,3,4);
 }
 for(const z of enemies)if(z.hp>0&&z.enemyType==='shieldPolice'&&z.policePhase==='aim'){ctx.strokeStyle='rgba(255,182,108,.65)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(z.x,z.y);ctx.lineTo(z.x+z.chargeDx*z.chargeRemaining,z.y+z.chargeDy*z.chargeRemaining);ctx.stroke();}
 for(const z of enemies)if(z.hp>0&&z.x>camera.x-100&&z.x<camera.x+width+100&&z.y>camera.y-120&&z.y<camera.y+height+120)drawZombie(z);
 if(boss&&boss.hp>0){
  const b=boss;
  if(b.phase==='tellDash'){
   ctx.save();ctx.translate(b.x,b.y);ctx.rotate(Math.atan2(b.dy,b.dx));ctx.fillStyle='rgba(255,150,60,.27)';ctx.fillRect(0,-46,360*.65,92);ctx.strokeStyle='#ffb66c';ctx.strokeRect(0,-46,360*.65,92);ctx.restore();
  }else if(b.phase==='tellVolley'||b.phase==='tellPulse'){
   ctx.strokeStyle=b.id==='coil'?'#c3b6ed':'#ffb66c';ctx.lineWidth=3;ctx.beginPath();ctx.arc(b.x,b.y,65,0,Math.PI*2);ctx.stroke();
   for(let i=0;b.id!=='coil'&&i<12;i++){const a=Math.atan2(b.dy,b.dx)+i*Math.PI*2/12;ctx.fillStyle='#ffb66c';ctx.beginPath();ctx.arc(b.x+Math.cos(a)*65,b.y+Math.sin(a)*65,4,0,Math.PI*2);ctx.fill();}
  }
  if(b.phase==='tellFan'){ctx.strokeStyle='#c3b6ed';ctx.lineWidth=2;for(const side of [-1,1]){const a=Math.atan2(b.dy,b.dx)+side*.44;ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.x+Math.cos(a)*260,b.y+Math.sin(a)*260);ctx.stroke();}}
  if(b.id==='brute')drawZombie(b,true);else drawSpecialBoss(b);
 }
 if(player.skills.corrosion)for(const z of targets())if(z.hp>0&&z.corrosion&&z.x>camera.x-60&&z.x<camera.x+width+60&&z.y>camera.y-80&&z.y<camera.y+height+80){ctx.strokeStyle='#a6e87d';ctx.lineWidth=2;ctx.strokeRect(z.x-z.r-4,z.y-z.r-4,z.r*2+8,z.r*2+8);ctx.fillStyle='#c6f1a8';ctx.font='bold 10px monospace';ctx.textAlign='center';ctx.fillText('COR '+Math.ceil(z.corrosion.remaining*10)/10+'s',z.x,z.y+z.r+16);}
 if(player.skills.sensorLock)for(const z of targets())if(z.hp>0&&z.scanLock>0&&z.x>camera.x-60&&z.x<camera.x+width+60&&z.y>camera.y-80&&z.y<camera.y+height+80){ctx.strokeStyle='#83c9ff';ctx.lineWidth=2;ctx.strokeRect(z.x-7,z.y-7,14,14);}
 for(const b of bullets)drawProjectile(b);
 for(const b of hostile){ctx.fillStyle=b.color||'#ff9b6c';ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();}
 for(const e of effects){ctx.globalAlpha=e.life/e.max;ctx.strokeStyle=e.color;ctx.lineWidth=3;ctx.beginPath();if(e.x2!==undefined){ctx.moveTo(e.x,e.y);ctx.lineTo(e.x2,e.y2);}else ctx.arc(e.x,e.y,e.r*(1-e.life/e.max),0,Math.PI*2);ctx.stroke();}ctx.globalAlpha=1;
 for(const p of sparks){ctx.globalAlpha=Math.max(0,p.life/.25);ctx.strokeStyle='#b7eaff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-p.vx*.035,p.y-p.vy*.035);ctx.stroke();}ctx.globalAlpha=1;
 drawRobot();window.drawPlayerWeapon?.(ctx,{x:player.x,y:player.y,id:runWeapon.id,angle:aim.active?Math.atan2(aim.y+camera.y-player.y,aim.x+camera.x-player.x):0,recoil:player.weaponKick,reload:player.reloadTotal>0?player.reloadTime/player.reloadTotal:0,hurt:player.inv>0});drawDrones();if(player.shieldReady){ctx.strokeStyle='#80e3ff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(player.x,player.y,38,0,Math.PI*2);ctx.stroke();}
 for(const f of feedback){ctx.globalAlpha=Math.min(1,f.life*3);ctx.fillStyle=f.color;ctx.font='bold 14px monospace';ctx.textAlign='center';ctx.fillStyle='#08121c';ctx.fillText(f.text,f.x+1,f.y+2);ctx.fillStyle=f.color;ctx.fillText(f.text,f.x,f.y);}ctx.globalAlpha=1;ctx.restore();
 if(typeof ctx.createRadialGradient==='function'){const shade=ctx.createRadialGradient(width/2,height/2,Math.min(width,height)*.24,width/2,height/2,Math.max(width,height)*.68);if(shade&&shade.addColorStop){shade.addColorStop(0,'rgba(3,9,17,0)');shade.addColorStop(1,'rgba(3,9,17,.32)');ctx.fillStyle=shade;ctx.fillRect(0,0,width,height);}}
 if(upgradeFlash>0){ctx.fillStyle='rgba(93,187,255,'+upgradeFlash*.035+')';ctx.fillRect(0,0,width,height);}
 if(aim.active&&state==='playing'){ctx.strokeStyle='#89ddff';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(aim.x,aim.y,7,0,Math.PI*2);ctx.moveTo(aim.x-12,aim.y);ctx.lineTo(aim.x+12,aim.y);ctx.moveTo(aim.x,aim.y-12);ctx.lineTo(aim.x,aim.y+12);ctx.stroke();}
}
function frame(now){window.ScrewAudio?.setScene(document.hidden?null:state==='title'?'menu':(state==='garage'||state==='configuration')?'garage':state==='playing'?'combat':null);window.ScrewAudio?.update();const dt=Math.min((now-last)/1000,.04);last=now;if(state==='playing')tick(dt);if(!['garage','title','configuration'].includes(state))draw();requestAnimationFrame(frame);}
renderLoadout();requestAnimationFrame(frame);
