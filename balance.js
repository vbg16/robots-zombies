/* Original runtime balance catalog; snapshot once per run. */
(function(root){
'use strict';
const fields={"hp":"Integridade atual","maxHp":"Integridade máxima","damage":"Dano direto","rate":"Intervalo de disparo","speed":"Velocidade de movimento","armor":"Armadura","magnet":"Alcance de coleta","magazineMult":"Multiplicador do carregador","reloadMult":"Multiplicador de recarga","projectileMult":"Multiplicador de projéteis","projectileSpeed":"Velocidade dos projéteis","projectileSize":"Tamanho dos projéteis","projectileLife":"Duração dos projéteis","spreadMult":"Dispersão","droneDamageMult":"Dano dos drones","droneRateMult":"Intervalo dos drones","droneRange":"Alcance dos drones","corrosionDamageMult":"Dano da corrosão","corrosionDelayMult":"Prazo da corrosão"};
const defaults=[
 {
  "id": "damage",
  "name": "ALTO IMPACTO",
  "description": "Dano ×2. Intervalo entre disparos ×1,5.",
  "group": "damage",
  "type": "Normal",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "damage",
  "prerequisites": [],
  "condition": "",
  "effects": [
   {
    "id": "damage-0",
    "attribute": "Dano direto",
    "operator": "×",
    "value": 2,
    "unit": ""
   },
   {
    "id": "damage-1",
    "attribute": "Intervalo de disparo",
    "operator": "×",
    "value": 1.5,
    "unit": ""
   }
  ],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "bossHunter",
  "name": "CAÇA-TITÃS",
  "description": "Dano contra chefe ×3. Alcance dos projéteis ÷1,5.",
  "group": "damage",
  "type": "Normal",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "damage",
  "prerequisites": [
   "damage"
  ],
  "condition": "Dano contra chefe ×3.",
  "effects": [
   {
    "id": "bossHunter-0",
    "attribute": "Duração dos projéteis",
    "operator": "÷",
    "value": 1.5,
    "unit": ""
   }
  ],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "finisher",
  "name": "FINALIZADOR",
  "description": "Dano ×3 contra alvos com até um terço da vida. Velocidade das balas ÷1,5.",
  "group": "damage",
  "type": "Normal",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "damage",
  "prerequisites": [
   "damage"
  ],
  "condition": "Dano ×3 contra alvos com até um terço da vida.",
  "effects": [
   {
    "id": "finisher-0",
    "attribute": "Velocidade dos projéteis",
    "operator": "÷",
    "value": 1.5,
    "unit": ""
   }
  ],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "crit",
  "name": "QUINTO IMPACTO",
  "description": "Cada quinto disparo causa dano ×3. Capacidade do carregador ÷1,25 (mínimo 1).",
  "group": "damage",
  "type": "Normal",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "damage",
  "prerequisites": [
   "damage"
  ],
  "condition": "Cada quinto disparo causa dano ×3.",
  "effects": [
   {
    "id": "crit-0",
    "attribute": "Multiplicador do carregador",
    "operator": "÷",
    "value": 1.25,
    "unit": ""
   }
  ],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "rate",
  "name": "OVERDRIVE",
  "description": "Cadência ×3. Dano de cada bala ÷1,5.",
  "group": "rate",
  "type": "Normal",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "rate",
  "prerequisites": [],
  "condition": "",
  "effects": [
   {
    "id": "rate-0",
    "attribute": "Intervalo de disparo",
    "operator": "÷",
    "value": 3,
    "unit": ""
   },
   {
    "id": "rate-1",
    "attribute": "Dano direto",
    "operator": "÷",
    "value": 1.5,
    "unit": ""
   }
  ],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "extra",
  "name": "CÂMARA DUPLA",
  "description": "Projéteis por disparo ×2. Dispersão ×1,5 e alcance ÷1,5.",
  "group": "rate",
  "type": "Normal",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "rate",
  "prerequisites": [
   "rate"
  ],
  "condition": "",
  "effects": [
   {
    "id": "extra-0",
    "attribute": "Multiplicador de projéteis",
    "operator": "×",
    "value": 2,
    "unit": ""
   },
   {
    "id": "extra-1",
    "attribute": "Dispersão",
    "operator": "×",
    "value": 1.5,
    "unit": ""
   },
   {
    "id": "extra-2",
    "attribute": "Duração dos projéteis",
    "operator": "÷",
    "value": 1.5,
    "unit": ""
   }
  ],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "ricochet",
  "name": "MUNIÇÃO RICOCHETE",
  "description": "Cada bala busca um alvo adicional após esgotar perfuração. Tempo de recarga ×1,5. Não combina com disco.",
  "group": "rate",
  "type": "Normal",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "rate",
  "prerequisites": [
   "rate"
  ],
  "condition": "Cada bala busca um alvo adicional após esgotar perfuração.",
  "effects": [
   {
    "id": "ricochet-0",
    "attribute": "Multiplicador de recarga",
    "operator": "×",
    "value": 1.5,
    "unit": ""
   }
  ],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "range",
  "name": "PROPULSÃO BALÍSTICA",
  "description": "Alcance dos projéteis ×3. Tamanho das balas ÷1,25.",
  "group": "rate",
  "type": "Normal",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "rate",
  "prerequisites": [
   "rate"
  ],
  "condition": "",
  "effects": [
   {
    "id": "range-0",
    "attribute": "Duração dos projéteis",
    "operator": "×",
    "value": 3,
    "unit": ""
   },
   {
    "id": "range-1",
    "attribute": "Tamanho dos projéteis",
    "operator": "÷",
    "value": 1.25,
    "unit": ""
   }
  ],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "armor",
  "name": "BLINDAGEM REFORÇADA",
  "description": "Reduz 2 de dano por golpe; mínimo recebido 1. Velocidade de movimento dividida por 1,25.",
  "group": "armor",
  "type": "Normal",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "armor",
  "prerequisites": [],
  "condition": "",
  "effects": [
   {
    "id": "armor-0",
    "attribute": "Armadura",
    "operator": "+",
    "value": 2,
    "unit": ""
   },
   {
    "id": "armor-1",
    "attribute": "Velocidade de movimento",
    "operator": "÷",
    "value": 1.25,
    "unit": ""
   }
  ],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "titan",
  "name": "CHASSI TITÂNICO",
  "description": "Vida máxima e atual ×3. Velocidade ÷1,5 e tempo de recarga ×1,5.",
  "group": "armor",
  "type": "Normal",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "armor",
  "prerequisites": [
   "armor"
  ],
  "condition": "",
  "effects": [
   {
    "id": "titan-0",
    "attribute": "Integridade máxima",
    "operator": "×",
    "value": 3,
    "unit": ""
   },
   {
    "id": "titan-1",
    "attribute": "Integridade atual",
    "operator": "×",
    "value": 3,
    "unit": ""
   },
   {
    "id": "titan-2",
    "attribute": "Velocidade de movimento",
    "operator": "÷",
    "value": 1.5,
    "unit": ""
   },
   {
    "id": "titan-3",
    "attribute": "Multiplicador de recarga",
    "operator": "×",
    "value": 1.5,
    "unit": ""
   }
  ],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "salvage",
  "name": "BATERIA DE SUCATA",
  "description": "A cada 20 zumbis mortos, recupera uma bateria (20 de vida). Alcance de coleta ÷1,25. Não ultrapassa a vida máxima.",
  "group": "armor",
  "type": "Normal",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "armor",
  "prerequisites": [
   "armor"
  ],
  "condition": "A cada 20 zumbis mortos, recupera uma bateria (20 de vida).",
  "effects": [
   {
    "id": "salvage-0",
    "attribute": "Alcance de coleta",
    "operator": "÷",
    "value": 1.25,
    "unit": ""
   }
  ],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "regen",
  "name": "OFICINA ESTACIONÁRIA",
  "description": "Após 3 s parado, recupera 2 de vida por segundo. Dano das balas ÷1,25. Mover interrompe o reparo.",
  "group": "armor",
  "type": "Normal",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "armor",
  "prerequisites": [
   "armor"
  ],
  "condition": "Após 3 s parado, recupera 2 de vida por segundo.",
  "effects": [
   {
    "id": "regen-0",
    "attribute": "Dano direto",
    "operator": "÷",
    "value": 1.25,
    "unit": ""
   }
  ],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "magnet",
  "name": "CAMPO MAGNÉTICO",
  "description": "Alcance de coleta ×3.",
  "group": "magnet",
  "type": "Normal",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "magnet",
  "prerequisites": [],
  "condition": "",
  "effects": [
   {
    "id": "magnet-0",
    "attribute": "Alcance de coleta",
    "operator": "×",
    "value": 3,
    "unit": ""
   }
  ],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "xp",
  "name": "PROCESSADOR DE EXPERIÊNCIA",
  "description": "Experiência por núcleo ×2. Tempo de recarga ×1,5.",
  "group": "magnet",
  "type": "Normal",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "magnet",
  "prerequisites": [
   "magnet"
  ],
  "condition": "Experiência por núcleo ×2.",
  "effects": [
   {
    "id": "xp-0",
    "attribute": "Multiplicador de recarga",
    "operator": "×",
    "value": 1.5,
    "unit": ""
   }
  ],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "repair",
  "name": "MANUTENÇÃO NA RECARGA",
  "description": "Cada recarga completa recupera 5 de vida. Tempo de recarga ×1,25. Só funciona após gastar munição.",
  "group": "magnet",
  "type": "Normal",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "magnet",
  "prerequisites": [
   "magnet"
  ],
  "condition": "Cada recarga completa recupera 5 de vida.",
  "effects": [
   {
    "id": "repair-0",
    "attribute": "Multiplicador de recarga",
    "operator": "×",
    "value": 1.25,
    "unit": ""
   }
  ],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "killAmmo",
  "name": "DEPÓSITO AMPLIADO",
  "description": "Capacidade do carregador ×3; a cada 10 mortes, devolve uma munição. Tempo de recarga ×2. Não repõe munição imediatamente.",
  "group": "magnet",
  "type": "Normal",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "magnet",
  "prerequisites": [
   "magnet"
  ],
  "condition": "Capacidade do carregador ×3; a cada 10 mortes, devolve uma munição.",
  "effects": [
   {
    "id": "killAmmo-0",
    "attribute": "Multiplicador do carregador",
    "operator": "×",
    "value": 3,
    "unit": ""
   },
   {
    "id": "killAmmo-1",
    "attribute": "Multiplicador de recarga",
    "operator": "×",
    "value": 2,
    "unit": ""
   }
  ],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "burn",
  "name": "MUNIÇÃO INCENDIÁRIA",
  "description": "Impactos queimam por 3 s: metade do dano da bala por segundo. Alcance dos projéteis ÷1,25.",
  "group": "burn",
  "type": "Normal",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "burn",
  "prerequisites": [],
  "condition": "Impactos queimam por 3 s: metade do dano da bala por segundo.",
  "effects": [
   {
    "id": "burn-0",
    "attribute": "Duração dos projéteis",
    "operator": "÷",
    "value": 1.25,
    "unit": ""
   }
  ],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "thermal",
  "name": "CHOQUE TÉRMICO",
  "description": "Queimadura causa dano ×3 enquanto o alvo está resfriado. Dano direto das balas ÷1,5. Exige resfriar o alvo.",
  "group": "burn",
  "type": "Normal",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "burn",
  "prerequisites": [
   "burn"
  ],
  "condition": "Queimadura causa dano ×3 enquanto o alvo está resfriado.",
  "effects": [
   {
    "id": "thermal-0",
    "attribute": "Dano direto",
    "operator": "÷",
    "value": 1.5,
    "unit": ""
   }
  ],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "ignition",
  "name": "FORNALHA",
  "description": "Duração da queimadura ×3. Tempo de recarga ×1,5.",
  "group": "burn",
  "type": "Normal",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "burn",
  "prerequisites": [
   "burn"
  ],
  "condition": "Duração da queimadura ×3.",
  "effects": [
   {
    "id": "ignition-0",
    "attribute": "Multiplicador de recarga",
    "operator": "×",
    "value": 1.5,
    "unit": ""
   }
  ],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "afterburn",
  "name": "COMBUSTÃO CONCENTRADA",
  "description": "Dano da queimadura ×3. Cadência ÷1,5.",
  "group": "burn",
  "type": "Normal",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "burn",
  "prerequisites": [
   "burn"
  ],
  "condition": "Dano da queimadura ×3.",
  "effects": [
   {
    "id": "afterburn-0",
    "attribute": "Intervalo de disparo",
    "operator": "×",
    "value": 1.5,
    "unit": ""
   }
  ],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "freeze",
  "name": "NÚCLEO CRIOGÊNICO",
  "description": "Impactos deixam o movimento inimigo ÷2 por 2 s. Velocidade dos projéteis ÷1,25.",
  "group": "freeze",
  "type": "Normal",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "freeze",
  "prerequisites": [],
  "condition": "Impactos deixam o movimento inimigo ÷2 por 2 s.",
  "effects": [
   {
    "id": "freeze-0",
    "attribute": "Velocidade dos projéteis",
    "operator": "÷",
    "value": 1.25,
    "unit": ""
   }
  ],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "pierce",
  "name": "PERFURAÇÃO",
  "description": "Projéteis atravessam dois alvos adicionais. Dano direto das balas ÷1,5.",
  "group": "freeze",
  "type": "Normal",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "freeze",
  "prerequisites": [
   "freeze"
  ],
  "condition": "Projéteis atravessam dois alvos adicionais.",
  "effects": [
   {
    "id": "pierce-0",
    "attribute": "Dano direto",
    "operator": "÷",
    "value": 1.5,
    "unit": ""
   }
  ],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "knock",
  "name": "IMPACTO CINÉTICO",
  "description": "Empurra uma distância curta; chefes recebem um quarto do empurrão. Cadência ÷1,5.",
  "group": "freeze",
  "type": "Normal",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "freeze",
  "prerequisites": [
   "freeze"
  ],
  "condition": "Empurra uma distância curta; chefes recebem um quarto do empurrão.",
  "effects": [
   {
    "id": "knock-0",
    "attribute": "Intervalo de disparo",
    "operator": "×",
    "value": 1.5,
    "unit": ""
   }
  ],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "coldReload",
  "name": "RECARGA GLACIAL",
  "description": "Ao terminar uma recarga, resfria alvos em uma área média por 4 s. Tempo de recarga ×1,5.",
  "group": "freeze",
  "type": "Normal",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "freeze",
  "prerequisites": [
   "freeze"
  ],
  "condition": "Ao terminar uma recarga, resfria alvos em uma área média por 4 s.",
  "effects": [
   {
    "id": "coldReload-0",
    "attribute": "Multiplicador de recarga",
    "operator": "×",
    "value": 1.5,
    "unit": ""
   }
  ],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "shock",
  "name": "DESCARGA",
  "description": "Impactos atingem outro alvo com metade do dano; perfuração amplia para três. Dano direto das balas ÷1,5.",
  "group": "shock",
  "type": "Normal",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "shock",
  "prerequisites": [],
  "condition": "Impactos atingem outro alvo com metade do dano; perfuração amplia para três.",
  "effects": [
   {
    "id": "shock-0",
    "attribute": "Dano direto",
    "operator": "÷",
    "value": 1.5,
    "unit": ""
   }
  ],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "conductivity",
  "name": "CONDUTIVIDADE",
  "description": "Alcance elétrico ×3. Alcance dos projéteis ÷1,5.",
  "group": "shock",
  "type": "Normal",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "shock",
  "prerequisites": [
   "shock"
  ],
  "condition": "Alcance elétrico ×3.",
  "effects": [
   {
    "id": "conductivity-0",
    "attribute": "Duração dos projéteis",
    "operator": "÷",
    "value": 1.5,
    "unit": ""
   }
  ],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "stun",
  "name": "CURTO-CIRCUITO",
  "description": "Descargas param movimento por 1 s; chefe por um quarto de segundo. Cadência ÷1,5. Não cancela ataques.",
  "group": "shock",
  "type": "Normal",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "shock",
  "prerequisites": [
   "shock"
  ],
  "condition": "Descargas param movimento por 1 s; chefe por um quarto de segundo.",
  "effects": [
   {
    "id": "stun-0",
    "attribute": "Intervalo de disparo",
    "operator": "×",
    "value": 1.5,
    "unit": ""
   }
  ],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "shield",
  "name": "ESCUDO CAPACITIVO",
  "description": "Absorve um impacto e recarrega em 120 s de combate. Velocidade de movimento ÷1,5.",
  "group": "shock",
  "type": "Normal",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "shock",
  "prerequisites": [
   "shock"
  ],
  "condition": "Absorve um impacto e recarrega em 120 s de combate.",
  "effects": [
   {
    "id": "shield-0",
    "attribute": "Velocidade de movimento",
    "operator": "÷",
    "value": 1.5,
    "unit": ""
   }
  ],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "dash",
  "name": "PROPULSOR AUXILIAR",
  "description": "ESPAÇO: avanço de 0,15 s com velocidade ×3. Recarga 4 s. Não concede invulnerabilidade.",
  "group": "dash",
  "type": "Normal",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "dash",
  "prerequisites": [],
  "condition": "ESPAÇO: avanço de 0,15 s com velocidade ×3. Recarga 4 s.",
  "effects": [],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "speed",
  "name": "PERNAS HIDRÁULICAS",
  "description": "Velocidade de movimento ×2. Vida máxima e atual ÷1,5; mínimo 1.",
  "group": "dash",
  "type": "Normal",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "dash",
  "prerequisites": [
   "dash"
  ],
  "condition": "",
  "effects": [
   {
    "id": "speed-0",
    "attribute": "Velocidade de movimento",
    "operator": "×",
    "value": 2,
    "unit": ""
   },
   {
    "id": "speed-1",
    "attribute": "Integridade máxima",
    "operator": "÷",
    "value": 1.5,
    "unit": ""
   },
   {
    "id": "speed-2",
    "attribute": "Integridade atual",
    "operator": "÷",
    "value": 1.5,
    "unit": ""
   }
  ],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "grace",
  "name": "ISOLAMENTO DE IMPACTO",
  "description": "Proteção normal após sofrer dano ×2. Capacidade do carregador ÷1,25 (mínimo 1).",
  "group": "dash",
  "type": "Normal",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "dash",
  "prerequisites": [
   "dash"
  ],
  "condition": "Proteção normal após sofrer dano ×2.",
  "effects": [
   {
    "id": "grace-0",
    "attribute": "Multiplicador do carregador",
    "operator": "÷",
    "value": 1.25,
    "unit": ""
   }
  ],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "emergency",
  "name": "RESERVA DE EMERGÊNCIA",
  "description": "Ao sobreviver a dano, ganha 3 s de proteção. Recarga 120 s de combate. Alcance de coleta ÷1,25. Não ressuscita.",
  "group": "dash",
  "type": "Normal",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "dash",
  "prerequisites": [
   "dash"
  ],
  "condition": "Ao sobreviver a dano, ganha 3 s de proteção. Recarga 120 s de combate.",
  "effects": [
   {
    "id": "emergency-0",
    "attribute": "Alcance de coleta",
    "operator": "÷",
    "value": 1.25,
    "unit": ""
   }
  ],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "blast",
  "name": "CARGA EXPLOSIVA",
  "description": "Cada impacto cria uma explosão pequena, causando metade do dano a outros alvos. Tempo de recarga ×1,5.",
  "group": "blast",
  "type": "Normal",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "blast",
  "prerequisites": [],
  "condition": "Cada impacto cria uma explosão pequena, causando metade do dano a outros alvos.",
  "effects": [
   {
    "id": "blast-0",
    "attribute": "Multiplicador de recarga",
    "operator": "×",
    "value": 1.5,
    "unit": ""
   }
  ],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "blastRadius",
  "name": "ONDA EXPANDIDA",
  "description": "Raio das explosões ×2. Dano direto das balas ÷1,5.",
  "group": "blast",
  "type": "Normal",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "blast",
  "prerequisites": [
   "blast"
  ],
  "condition": "Raio das explosões ×2.",
  "effects": [
   {
    "id": "blastRadius-0",
    "attribute": "Dano direto",
    "operator": "÷",
    "value": 1.5,
    "unit": ""
   }
  ],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "retaliation",
  "name": "PULSO DE RETALIAÇÃO",
  "description": "Ao sobreviver a dano, cria uma explosão média com dano ×3. Recarga 120 s. Vida máxima e atual ÷1,5; mínimo 1.",
  "group": "blast",
  "type": "Normal",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "blast",
  "prerequisites": [
   "blast"
  ],
  "condition": "Ao sobreviver a dano, cria uma explosão média com dano ×3. Recarga 120 s.",
  "effects": [
   {
    "id": "retaliation-0",
    "attribute": "Integridade máxima",
    "operator": "÷",
    "value": 1.5,
    "unit": ""
   },
   {
    "id": "retaliation-1",
    "attribute": "Integridade atual",
    "operator": "÷",
    "value": 1.5,
    "unit": ""
   }
  ],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "overload",
  "name": "SOBRECARGA REATIVA",
  "description": "Ao sobreviver a dano, ganha cadência ×3 por 6 s. Recarga 120 s de combate. Tempo de recarga da arma ×1,5.",
  "group": "blast",
  "type": "Normal",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "blast",
  "prerequisites": [
   "blast"
  ],
  "condition": "Ao sobreviver a dano, ganha cadência ×3 por 6 s. Recarga 120 s de combate.",
  "effects": [
   {
    "id": "overload-0",
    "attribute": "Multiplicador de recarga",
    "operator": "×",
    "value": 1.5,
    "unit": ""
   }
  ],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "pulseCoil",
  "name": "BOBINA DE PULSO",
  "description": "Dano ×1,25 nesta tentativa.",
  "group": "Gambiarra",
  "type": "Gambiarra",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "pulseCoil",
  "prerequisites": [],
  "condition": "",
  "effects": [
   {
    "id": "pulseCoil-0",
    "attribute": "Dano direto",
    "operator": "×",
    "value": 1.25,
    "unit": ""
   }
  ],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "triggerRegulator",
  "name": "REGULADOR DE GATILHO",
  "description": "Intervalo entre disparos ×0,8 nesta tentativa.",
  "group": "Gambiarra",
  "type": "Gambiarra",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "triggerRegulator",
  "prerequisites": [],
  "condition": "",
  "effects": [
   {
    "id": "triggerRegulator-0",
    "attribute": "Intervalo de disparo",
    "operator": "×",
    "value": 0.8,
    "unit": ""
   }
  ],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "spareBattery",
  "name": "BATERIA DE RESERVA",
  "description": "Vida máxima e atual +20 nesta tentativa.",
  "group": "Gambiarra",
  "type": "Gambiarra",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "spareBattery",
  "prerequisites": [],
  "condition": "",
  "effects": [
   {
    "id": "spareBattery-0",
    "attribute": "Integridade máxima",
    "operator": "+",
    "value": 20,
    "unit": ""
   },
   {
    "id": "spareBattery-1",
    "attribute": "Integridade atual",
    "operator": "+",
    "value": 20,
    "unit": ""
   }
  ],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "scrapMagnet",
  "name": "ELETROÍMÃ DE SUCATA",
  "description": "Alcance de coleta ×1,75 nesta tentativa.",
  "group": "Gambiarra",
  "type": "Gambiarra",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "scrapMagnet",
  "prerequisites": [],
  "condition": "",
  "effects": [
   {
    "id": "scrapMagnet-0",
    "attribute": "Alcance de coleta",
    "operator": "×",
    "value": 1.75,
    "unit": ""
   }
  ],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "greasedServos",
  "name": "SERVOS LUBRIFICADOS",
  "description": "Velocidade de movimento ×1,2 nesta tentativa.",
  "group": "Gambiarra",
  "type": "Gambiarra",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "greasedServos",
  "prerequisites": [],
  "condition": "",
  "effects": [
   {
    "id": "greasedServos-0",
    "attribute": "Velocidade de movimento",
    "operator": "×",
    "value": 1.2,
    "unit": ""
   }
  ],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "copperPlate",
  "name": "PLACA DE COBRE",
  "description": "Reduz 1 de dano recebido nesta tentativa.",
  "group": "Gambiarra",
  "type": "Gambiarra",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "copperPlate",
  "prerequisites": [],
  "condition": "",
  "effects": [
   {
    "id": "copperPlate-0",
    "attribute": "Armadura",
    "operator": "+",
    "value": 1,
    "unit": ""
   }
  ],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "volatileReactor",
  "name": "REATOR VOLÁTIL",
  "description": "Dano ×1,35. Intervalo de tiro ×1,15.",
  "group": "Experimento",
  "type": "Experimento",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "volatileReactor",
  "prerequisites": [],
  "condition": "",
  "effects": [
   {
    "id": "volatileReactor-0",
    "attribute": "Dano direto",
    "operator": "×",
    "value": 1.35,
    "unit": ""
   },
   {
    "id": "volatileReactor-1",
    "attribute": "Intervalo de disparo",
    "operator": "×",
    "value": 1.15,
    "unit": ""
   }
  ],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "unstableLens",
  "name": "LENTE INSTÁVEL",
  "description": "Velocidade e tamanho de projétil ×1,5. Movimento ×0,85.",
  "group": "Experimento",
  "type": "Experimento",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "unstableLens",
  "prerequisites": [],
  "condition": "",
  "effects": [
   {
    "id": "unstableLens-0",
    "attribute": "Velocidade dos projéteis",
    "operator": "×",
    "value": 1.5,
    "unit": ""
   },
   {
    "id": "unstableLens-1",
    "attribute": "Tamanho dos projéteis",
    "operator": "×",
    "value": 1.5,
    "unit": ""
   },
   {
    "id": "unstableLens-2",
    "attribute": "Velocidade de movimento",
    "operator": "×",
    "value": 0.85,
    "unit": ""
   }
  ],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "lithiumPack",
  "name": "PACOTE DE LÍTIO",
  "description": "Integridade máxima e atual +30. Armadura −1.",
  "group": "Experimento",
  "type": "Experimento",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "lithiumPack",
  "prerequisites": [],
  "condition": "",
  "effects": [
   {
    "id": "lithiumPack-0",
    "attribute": "Integridade máxima",
    "operator": "+",
    "value": 30,
    "unit": ""
   },
   {
    "id": "lithiumPack-1",
    "attribute": "Integridade atual",
    "operator": "+",
    "value": 30,
    "unit": ""
   },
   {
    "id": "lithiumPack-2",
    "attribute": "Armadura",
    "operator": "−",
    "value": 1,
    "unit": ""
   }
  ],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "scrapCatalyst",
  "name": "CATALISADOR DE SUCATA",
  "description": "Alcance de coleta ×2. Recarga da arma ×1,5.",
  "group": "Experimento",
  "type": "Experimento",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "scrapCatalyst",
  "prerequisites": [],
  "condition": "",
  "effects": [
   {
    "id": "scrapCatalyst-0",
    "attribute": "Alcance de coleta",
    "operator": "×",
    "value": 2,
    "unit": ""
   },
   {
    "id": "scrapCatalyst-1",
    "attribute": "Multiplicador de recarga",
    "operator": "×",
    "value": 1.5,
    "unit": ""
   }
  ],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "blastCondenser",
  "name": "CONDENSADOR DE IMPACTO",
  "description": "Dano ×1,5. Intervalo de tiro ×1,35.",
  "group": "Experimento",
  "type": "Experimento",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "blastCondenser",
  "prerequisites": [],
  "condition": "",
  "effects": [
   {
    "id": "blastCondenser-0",
    "attribute": "Dano direto",
    "operator": "×",
    "value": 1.5,
    "unit": ""
   },
   {
    "id": "blastCondenser-1",
    "attribute": "Intervalo de disparo",
    "operator": "×",
    "value": 1.35,
    "unit": ""
   }
  ],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "nervousServo",
  "name": "SERVO NERVOSO",
  "description": "Movimento ×1,35. Armadura −1.",
  "group": "Experimento",
  "type": "Experimento",
  "rarity": "Comum",
  "unlockLevel": 1,
  "tree": "nervousServo",
  "prerequisites": [],
  "condition": "",
  "effects": [
   {
    "id": "nervousServo-0",
    "attribute": "Velocidade de movimento",
    "operator": "×",
    "value": 1.35,
    "unit": ""
   },
   {
    "id": "nervousServo-1",
    "attribute": "Armadura",
    "operator": "−",
    "value": 1,
    "unit": ""
   }
  ],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null
 },
 {
  "id": "tailDecoy",
  "name": "ISCA DE CAUDA",
  "description": "Após sofrer dano não letal, deixa um eco por 1,5 s que atrai perseguidores comuns. Recarga 24 s. Chefes, lacaios e atiradores ignoram o eco.",
  "group": "Especialização",
  "type": "Especialização",
  "rarity": "Comum",
  "unlockLevel": 10,
  "tree": "tailDecoy",
  "prerequisites": [],
  "condition": "Após sofrer dano não letal, deixa um eco por 1,5 s que atrai perseguidores comuns. Recarga 24 s.",
  "effects": [],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null,
  "robot": "prot"
 },
 {
  "id": "predatorMark",
  "name": "MARCA DO PREDADOR",
  "description": "O primeiro acerto marca um alvo por 2,5 s. Acertos seguintes nele causam +25% de dano. Só um alvo marcado; acertar outro transfere a marca.",
  "group": "Especialização",
  "type": "Especialização",
  "rarity": "Comum",
  "unlockLevel": 10,
  "tree": "predatorMark",
  "prerequisites": [],
  "condition": "O primeiro acerto marca um alvo por 2,5 s. Acertos seguintes nele causam +25% de dano.",
  "effects": [],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null,
  "robot": "prot"
 },
 {
  "id": "nineLives",
  "name": "ALERTA DE NOVE VIDAS",
  "description": "Ao cruzar abaixo de 20% de integridade, empurra comuns próximos em 90 px e interrompe por 0,5 s. Raio 100 px; recarga 30 s. Não cura nem concede invulnerabilidade; exige sobreviver ao golpe.",
  "group": "Especialização",
  "type": "Especialização",
  "rarity": "Comum",
  "unlockLevel": 10,
  "tree": "nineLives",
  "prerequisites": [],
  "condition": "Ao cruzar abaixo de 20% de integridade, empurra comuns próximos em 90 px e interrompe por 0,5 s. Raio 100 px; recarga 30 s.",
  "effects": [],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null,
  "robot": "prot"
 },
 {
  "id": "grounding",
  "name": "ATERRAMENTO DE CAMPO",
  "description": "Recebe 30% menos dano das zonas de perigo dos chefes. Não reduz contato nem projéteis.",
  "group": "Especialização",
  "type": "Especialização",
  "rarity": "Comum",
  "unlockLevel": 10,
  "tree": "grounding",
  "prerequisites": [],
  "condition": "Recebe 30% menos dano das zonas de perigo dos chefes.",
  "effects": [],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null,
  "robot": "bastion"
 },
 {
  "id": "magneticBrake",
  "name": "FREIO ELETROMAGNÉTICO",
  "description": "Projéteis hostis dentro de 90 px movem-se 25% mais devagar. Não afeta investidas nem projéteis do jogador.",
  "group": "Especialização",
  "type": "Especialização",
  "rarity": "Comum",
  "unlockLevel": 10,
  "tree": "magneticBrake",
  "prerequisites": [],
  "condition": "Projéteis hostis dentro de 90 px movem-se 25% mais devagar.",
  "effects": [],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null,
  "robot": "bastion"
 },
 {
  "id": "threatReader",
  "name": "PROTOCOLO DE LEITURA",
  "description": "Avisos de chefe iniciados a até 180 px duram 20% mais. Não retarda a execução dos ataques nem altera o relógio.",
  "group": "Especialização",
  "type": "Especialização",
  "rarity": "Comum",
  "unlockLevel": 10,
  "tree": "threatReader",
  "prerequisites": [],
  "condition": "Avisos de chefe iniciados a até 180 px duram 20% mais.",
  "effects": [],
  "notes": "Condicionais originais fixas; raridade e grupo apenas organizacionais.",
  "accent": "#71d7f2",
  "updatedAt": null,
  "robot": "bastion"
 }
];
const legacyIds=new Set(defaults.map(s=>s.id));
const legacyRepairCondition=defaults.find(s=>s.id==='repair').condition;
const legacyRepairDescription=defaults.find(s=>s.id==='repair').description;
const updatedRepairBenefit='Recargas recuperam até5 de vida proporcionalmente à munição reposta.';
Object.assign(defaults.find(s=>s.id==='repair'),{condition:updatedRepairBenefit,description:updatedRepairBenefit+' Tempo de recarga ×1,25. Só funciona após gastar munição.'});
const addedDefaults=[{"id":"furnaceDuration","name":"CÂMARA DE FORNALHA","description":"Duração da queimadura ×1,5. Afeta queimaduras aplicadas após a escolha.","group":"Protocolos do chassi","type":"Especialização","rarity":"Comum","unlockLevel":10,"tree":"forge","prerequisites":[],"condition":"Duração da queimadura ×1,5.","effects":[],"notes":"Condicionais originais fixas; novos modificadores diretos são editáveis. Máximo3 drones; ataques não ativam efeitos de bala.","accent":"#ffe6a0","updatedAt":null,"robot":"forge"},{"id":"thermalAmplifier","name":"AMPLIFICADOR TÉRMICO","description":"Queimadura em alvos resfriados causa +25% de dano. Exige resfriar o alvo.","group":"Protocolos do chassi","type":"Especialização","rarity":"Comum","unlockLevel":10,"tree":"forge","prerequisites":[],"condition":"Queimadura em alvos resfriados causa +25% de dano.","effects":[],"notes":"Condicionais originais fixas; novos modificadores diretos são editáveis. Máximo3 drones; ataques não ativam efeitos de bala.","accent":"#ffe6a0","updatedAt":null,"robot":"forge"},{"id":"heatRecovery","name":"RECUPERADOR DE CALOR","description":"Abates por queimadura recuperam1 de integridade. Recarga2s. Sem cura em integridade cheia.","group":"Protocolos do chassi","type":"Especialização","rarity":"Comum","unlockLevel":10,"tree":"forge","prerequisites":[],"condition":"Abates por queimadura recuperam1 de integridade. Recarga2s.","effects":[],"notes":"Condicionais originais fixas; novos modificadores diretos são editáveis. Máximo3 drones; ataques não ativam efeitos de bala.","accent":"#ffe6a0","updatedAt":null,"robot":"forge"},{"id":"extraFork","name":"DERIVAÇÃO ADICIONAL","description":"Descargas atingem um alvo adicional. Exige arma elétrica ou Descarga.","group":"Protocolos do chassi","type":"Especialização","rarity":"Comum","unlockLevel":10,"tree":"volt","prerequisites":[],"condition":"Descargas atingem um alvo adicional.","effects":[],"notes":"Condicionais originais fixas; novos modificadores diretos são editáveis. Máximo3 drones; ataques não ativam efeitos de bala.","accent":"#ffe6a0","updatedAt":null,"robot":"volt"},{"id":"chargeRecovery","name":"RECUPERAÇÃO DE CARGA","description":"A cada6 alvos eletrocutados repõe uma munição. Recarga0,25s. Não ultrapassa o carregador.","group":"Protocolos do chassi","type":"Especialização","rarity":"Comum","unlockLevel":10,"tree":"volt","prerequisites":[],"condition":"A cada6 alvos eletrocutados repõe uma munição. Recarga0,25s.","effects":[],"notes":"Condicionais originais fixas; novos modificadores diretos são editáveis. Máximo3 drones; ataques não ativam efeitos de bala.","accent":"#ffe6a0","updatedAt":null,"robot":"volt"},{"id":"groundPulse","name":"PULSO DE ATERRAMENTO","description":"Descargas interrompem comuns por mais0,35s; chefes por0,1s. Não cancela ataques já preparados.","group":"Protocolos do chassi","type":"Especialização","rarity":"Comum","unlockLevel":10,"tree":"volt","prerequisites":[],"condition":"Descargas interrompem comuns por mais0,35s; chefes por0,1s.","effects":[],"notes":"Condicionais originais fixas; novos modificadores diretos são editáveis. Máximo3 drones; ataques não ativam efeitos de bala.","accent":"#ffe6a0","updatedAt":null,"robot":"volt"},{"id":"repairCharge","name":"CARGA DE REPARO","description":"Cura real fortalece o próximo disparo em50%. Não acumula; uma emissão consome a carga.","group":"Protocolos do chassi","type":"Especialização","rarity":"Comum","unlockLevel":10,"tree":"nano","prerequisites":[],"condition":"Cura real fortalece o próximo disparo em50%.","effects":[],"notes":"Condicionais originais fixas; novos modificadores diretos são editáveis. Máximo3 drones; ataques não ativam efeitos de bala.","accent":"#ffe6a0","updatedAt":null,"robot":"nano"},{"id":"repairPlating","name":"REVESTIMENTO REPARADOR","description":"Cura real concede redução2 de dano por2s. Não acumula proteção.","group":"Protocolos do chassi","type":"Especialização","rarity":"Comum","unlockLevel":10,"tree":"nano","prerequisites":[],"condition":"Cura real concede redução2 de dano por2s.","effects":[],"notes":"Condicionais originais fixas; novos modificadores diretos são editáveis. Máximo3 drones; ataques não ativam efeitos de bala.","accent":"#ffe6a0","updatedAt":null,"robot":"nano"},{"id":"coolantLoop","name":"CIRCUITO REFRIGERANTE","description":"Recarga de ao menos50% resfria inimigos em80px por2s. Exige recarregar metade do carregador.","group":"Protocolos do chassi","type":"Especialização","rarity":"Comum","unlockLevel":10,"tree":"nano","prerequisites":[],"condition":"Recarga de ao menos50% resfria inimigos em80px por2s.","effects":[],"notes":"Condicionais originais fixas; novos modificadores diretos são editáveis. Máximo3 drones; ataques não ativam efeitos de bala.","accent":"#ffe6a0","updatedAt":null,"robot":"nano"},{"id":"droneSalvage","name":"RECICLAGEM DO ENXAME","description":"Abates por drone curam1 de integridade. Recarga1,5s. Somente abates do drone.","group":"Protocolos do chassi","type":"Especialização","rarity":"Comum","unlockLevel":10,"tree":"swarm","prerequisites":[],"condition":"Abates por drone curam1 de integridade. Recarga1,5s.","effects":[],"notes":"Condicionais originais fixas; novos modificadores diretos são editáveis. Máximo3 drones; ataques não ativam efeitos de bala.","accent":"#ffe6a0","updatedAt":null,"robot":"swarm"},{"id":"droneBossFocus","name":"FOCO ANTICHEFE","description":"Drones priorizam chefe no alcance e causam +25% de dano nele. Não aumenta alcance.","group":"Protocolos do chassi","type":"Especialização","rarity":"Comum","unlockLevel":10,"tree":"swarm","prerequisites":[],"condition":"Drones priorizam chefe no alcance e causam +25% de dano nele.","effects":[],"notes":"Condicionais originais fixas; novos modificadores diretos são editáveis. Máximo3 drones; ataques não ativam efeitos de bala.","accent":"#ffe6a0","updatedAt":null,"robot":"swarm"},{"id":"droneRelay","name":"RELÉ DO ENXAME","description":"Alcance dos drones +100px; coleta ×1,25. Não aumenta o número de drones.","group":"Protocolos do chassi","type":"Especialização","rarity":"Comum","unlockLevel":10,"tree":"swarm","prerequisites":[],"condition":"Alcance dos drones +100px; coleta ×1,25.","effects":[{"id":"droneRelay-0","attribute":"Alcance de coleta","operator":"×","value":1.25,"unit":""}],"notes":"Condicionais originais fixas; novos modificadores diretos são editáveis. Máximo3 drones; ataques não ativam efeitos de bala.","accent":"#ffe6a0","updatedAt":null,"robot":"swarm"}];addedDefaults.push(...[{"id":"drones","name":"DRONE DE APOIO","description":"Acrescenta um drone; máximo3. Cada drone causa25% do dano direto a cada0,8s, no alcance320px. Tempo de recarga ×1,15.","group":"Suporte","type":"Normal","rarity":"Comum","unlockLevel":1,"tree":"Enxame de manutenção","prerequisites":[],"condition":"Acrescenta um drone; máximo3. Cada drone causa25% do dano direto a cada0,8s, no alcance320px.","effects":[{"id":"drones-0","attribute":"Multiplicador de recarga","operator":"×","value":1.15,"unit":""}],"notes":"Ataques de drones são independentes da arma. Máximo3 drones, intervalo mínimo0,35s.","accent":"#ffe6a0","updatedAt":null},{"id":"dronePair","name":"DUPLA DE APOIO","description":"Acrescenta um drone; máximo3 incluindo o drone do ENXA. Dano direto ÷1,15.","group":"Suporte","type":"Normal","rarity":"Comum","unlockLevel":1,"tree":"Enxame de manutenção","prerequisites":["drones"],"condition":"Acrescenta um drone; máximo3 incluindo o drone do ENXA.","effects":[{"id":"dronePair-0","attribute":"Dano direto","operator":"÷","value":1.15,"unit":""}],"notes":"Ataques de drones são independentes da arma. Máximo3 drones, intervalo mínimo0,35s.","accent":"#ffe6a0","updatedAt":null},{"id":"droneOverclock","name":"ROTORES ACELERADOS","description":"Intervalo de ataque dos drones ×0,7; mínimo0,35s. Alcance dos drones ÷1,15.","group":"Suporte","type":"Normal","rarity":"Comum","unlockLevel":1,"tree":"Enxame de manutenção","prerequisites":["drones"],"condition":"Intervalo de ataque dos drones ×0,7; mínimo0,35s.","effects":[{"id":"droneOverclock-0","attribute":"Intervalo dos drones","operator":"×","value":0.7,"unit":""},{"id":"droneOverclock-1","attribute":"Alcance dos drones","operator":"÷","value":1.15,"unit":""}],"notes":"Ataques de drones são independentes da arma. Máximo3 drones, intervalo mínimo0,35s.","accent":"#ffe6a0","updatedAt":null},{"id":"droneArc","name":"ARCO DE APOIO","description":"Ataque do drone atinge um segundo alvo a até160px por metade do dano. Dano dos drones ÷1,2.","group":"Suporte","type":"Normal","rarity":"Comum","unlockLevel":1,"tree":"Enxame de manutenção","prerequisites":["drones"],"condition":"Ataque do drone atinge um segundo alvo a até160px por metade do dano.","effects":[{"id":"droneArc-0","attribute":"Dano dos drones","operator":"÷","value":1.2,"unit":""}],"notes":"Ataques de drones são independentes da arma. Máximo3 drones, intervalo mínimo0,35s.","accent":"#ffe6a0","updatedAt":null}]);addedDefaults.push(...[{"id":"corrosion","name":"REVESTIMENTO CORROSIVO","description":"Impactos marcam sobreviventes: após 2 s, causam novamente o dano da bala. Uma carga por alvo; sem renovar ou acumular. Dano direto ×0,85. Escudos bloqueiam a aplicação.","group":"Controle","type":"Normal","rarity":"Comum","unlockLevel":1,"tree":"Reagentes de sucata","prerequisites":[],"condition":"Impactos marcam sobreviventes: após 2 s, causam novamente o dano da bala. Uma carga por alvo; sem renovar ou acumular.","effects":[{"id":"corrosion-0","attribute":"Dano direto","operator":"×","value":0.85,"unit":""}],"notes":"Uma carga por alvo; sem acumular ou renovar. Prazo efetivo entre0,25 e30s; dano base da carga até1e9. Respingo em uma geração; escudos bloqueiam aplicação.","accent":"#a6e87d","updatedAt":null},{"id":"corrosionFuse","name":"INICIADOR RÁPIDO","description":"Prazo das novas cargas ×0,5. Dano das novas cargas ×0,75.","group":"Controle","type":"Normal","rarity":"Comum","unlockLevel":1,"tree":"Reagentes de sucata","prerequisites":["corrosion"],"condition":"","effects":[{"id":"corrosionFuse-0","attribute":"Prazo da corrosão","operator":"×","value":0.5,"unit":""},{"id":"corrosionFuse-1","attribute":"Dano da corrosão","operator":"×","value":0.75,"unit":""}],"notes":"Uma carga por alvo; sem acumular ou renovar. Prazo efetivo entre0,25 e30s; dano base da carga até1e9. Respingo em uma geração; escudos bloqueiam aplicação.","accent":"#a6e87d","updatedAt":null},{"id":"corrosionBloom","name":"RESPINGO REAGENTE","description":"Morte de um alvo com carga primária transfere metade da carga a até dois vizinhos próximos. Recarga ×1,15. Cargas transferidas não se propagam; escudos bloqueiam o respingo.","group":"Controle","type":"Normal","rarity":"Comum","unlockLevel":1,"tree":"Reagentes de sucata","prerequisites":["corrosion"],"condition":"Morte de um alvo com carga primária transfere metade da carga a até dois vizinhos próximos.","effects":[{"id":"corrosionBloom-0","attribute":"Multiplicador de recarga","operator":"×","value":1.15,"unit":""}],"notes":"Uma carga por alvo; sem acumular ou renovar. Prazo efetivo entre0,25 e30s; dano base da carga até1e9. Respingo em uma geração; escudos bloqueiam aplicação.","accent":"#a6e87d","updatedAt":null},{"id":"corrosionCatalyst","name":"CATALISADOR TÉRMICO","description":"Detonação corrosiva causa +50% de dano se o alvo ainda estiver queimando ou resfriado. Dano direto ÷1,15. Fogo e gelo não acumulam este bônus.","group":"Controle","type":"Normal","rarity":"Comum","unlockLevel":1,"tree":"Reagentes de sucata","prerequisites":["corrosion"],"condition":"Detonação corrosiva causa +50% de dano se o alvo ainda estiver queimando ou resfriado.","effects":[{"id":"corrosionCatalyst-0","attribute":"Dano direto","operator":"÷","value":1.15,"unit":""}],"notes":"Uma carga por alvo; sem acumular ou renovar. Prazo efetivo entre0,25 e30s; dano base da carga até1e9. Respingo em uma geração; escudos bloqueiam aplicação.","accent":"#a6e87d","updatedAt":null}]);defaults.push(...addedDefaults);
const ruleUpdates=[
 ['bossHunter','Dano contra chefe ×3.','Dano contra chefe ×3. Derrotar um chefe recupera mais20 de integridade.'],
 ['titan','Vida máxima e atual ×3.','Vida máxima e atual ×3. Com Blindagem Reforçada, converte3% da vida máxima em dano por projétil, limitado a75% do dano direto.',''],
 ['burn','Impactos queimam por 3 s: metade do dano da bala por segundo.','Impactos queimam por 3 s: metade do dano da bala por segundo. Em armas incendiárias, a queimadura ganha mais25%.'],
 ['freeze','Impactos deixam o movimento inimigo ÷2 por 2 s.','Impactos deixam o movimento inimigo ÷2 por 2 s; em armas criogênicas, dura3 s.'],
 ['shock','Impactos atingem outro alvo com metade do dano; perfuração amplia para três.','Impactos atingem outro alvo com metade do dano; perfuração amplia para três. Em armas elétricas, soma os alvos e aumenta o dano elétrico em25%.'],
 ['blast','Cada impacto cria uma explosão pequena, causando metade do dano a outros alvos.','Cada impacto cria uma explosão pequena, causando metade do dano a outros alvos. Em armas explosivas, aumenta o dano da explosão em25%.'],
 ['repairCharge','Cura real fortalece o próximo disparo em50%.','Cura real fortalece o próximo disparo em50% e acrescenta2 perfurações.']
];
for(const [id,before,after] of ruleUpdates){const item=defaults.find(s=>s.id===id);item.condition=after;item.description=item.description.replace(before,after);}
const treeLabels={corrosion:['Controle','Reagentes de sucata'],drones:['Suporte','Enxame de manutenção'],damage:['Ofensivo','Dano de impacto'],rate:['Ofensivo','Arsenal acelerado'],armor:['Defensivo','Defesa pesada'],magnet:['Suporte','Coleta e manutenção'],burn:['Ofensivo','Fogo industrial'],freeze:['Controle','Controle criogênico'],shock:['Controle','Rede elétrica'],dash:['Mobilidade','Mobilidade e reação'],blast:['Ofensivo','Demolição reativa']};
for(const item of defaults){item.notes+=' Limites de segurança: valores finitos até1e9, integridade mínima1, demais atributos positivos mínimo0,001. Use ×1,1 para aumentar10%; unidades não alteram aritmética.';if(item.type==='Normal'){const meta=treeLabels[item.prerequisites[0]||item.id];item.group=meta[0];item.tree=meta[1];}else{item.group=item.type==='Especialização'?'Protocolos do chassi':'Oficina do Biruta';item.tree=item.type==='Especialização'?(({prot:'PROT-0001',bastion:'BAST-0002',forge:'FORJ-0003',volt:'VOLT-0004',nano:'NANO-0005',swarm:'ENXA-0006'}[item.robot]||item.robot)):item.type;}}
const clone=x=>JSON.parse(JSON.stringify(x)),byId=new Map(defaults.map(s=>[s.id,s])),attributes=Object.values(fields),reverse=Object.fromEntries(Object.entries(fields).map(([k,v])=>[v,k]));
const storageKey='screwvivors.balance.v1';let runData=null;
function validate(skills){
 const errors=[];if(!Array.isArray(skills)||skills.length>256)return {ok:false,errors:['Catálogo deve ser uma lista de até256 módulos.']};
 const ids=new Set();for(const s of skills){if(!s||typeof s!=='object'||typeof s.id!=='string'||!/^([a-zA-Z][a-zA-Z0-9_-]{0,63})$/.test(s.id)){errors.push('ID de módulo inválido.');continue;}if(ids.has(s.id))errors.push('ID duplicado: '+s.id);ids.add(s.id);const base=byId.get(s.id);
 if(typeof s.name!=='string'||!s.name.trim()||s.name.length>120)errors.push(s.id+': nome inválido.');
 for(const key of ['description','group','rarity','tree','condition','notes','accent'])if(typeof s[key]!=='string'||s[key].length>8000)errors.push(s.id+': campo '+key+' inválido.');
 if(s.updatedAt!==undefined&&s.updatedAt!==null&&typeof s.updatedAt!=='string')errors.push(s.id+': data de atualização inválida.');
 if(s.synergies!==undefined&&(!Array.isArray(s.synergies)||s.synergies.some(id=>typeof id!=='string')))errors.push(s.id+': lista de sinergias inválida.');
 if(base){for(const key of ['type','robot','condition'])if(s[key]!==base[key])errors.push(s.id+': '+key+' é fixo para preservar a mecânica original.');if(s.type!=='Normal'&&(s.prerequisites?.length||s.unlockLevel!==base.unlockLevel))errors.push(s.id+': cadência de oferta especial é fixa.');}
 else if(s.type!=='Normal'||s.robot||s.condition)errors.push(s.id+': módulos novos aceitam apenas Normal sem condição programada.');
 if(!Number.isInteger(s.unlockLevel)||s.unlockLevel<1||s.unlockLevel>999)errors.push(s.id+': nível inválido.');
 if(s.enabled!==undefined&&typeof s.enabled!=='boolean')errors.push(s.id+': enabled inválido.');
 if(!Array.isArray(s.prerequisites)||s.prerequisites.some(x=>typeof x!=='string')||new Set(s.prerequisites).size!==s.prerequisites.length)errors.push(s.id+': requisitos inválidos.');
 if(!Array.isArray(s.effects)||s.effects.length>32){errors.push(s.id+': efeitos inválidos.');continue;}if(!base&&!s.effects.length)errors.push(s.id+': módulo novo precisa de um efeito direto suportado.');const effectIds=new Set();for(const e of s.effects){if(!e||typeof e.id!=='string'||effectIds.has(e.id)){errors.push(s.id+': ID de efeito duplicado/inválido.');continue;}effectIds.add(e.id);if(!attributes.includes(e.attribute)||!['+','−','×','÷','='].includes(e.operator)||!Number.isFinite(e.value)||Math.abs(e.value)>10000||(['×','÷'].includes(e.operator)&&e.value<=0)||e.unit!=='')errors.push(s.id+': modificador não suportado ou valor inválido.');}
 }
 if(errors.length)return {ok:false,errors};
 for(const base of defaults)if(!ids.has(base.id))errors.push('Registro canônico ausente: '+base.id);
 const map=new Map(skills.filter(Boolean).map(s=>[s.id,s]));for(const s of skills)if(s&&Array.isArray(s.prerequisites))for(const id of s.prerequisites){const p=map.get(id);if(!p||p.type!=='Normal'||(s.enabled!==false&&p.enabled===false))errors.push(s.id+': requisito ausente/inativo/não Normal: '+id);}
 const visiting=new Set(),done=new Set();function visit(id){if(visiting.has(id)){errors.push('Ciclo de requisitos: '+id);return;}if(done.has(id))return;visiting.add(id);for(const p of (Array.isArray(map.get(id)?.prerequisites)?map.get(id).prerequisites:[]))if(map.has(p))visit(p);visiting.delete(id);done.add(id);}for(const id of map.keys())visit(id);
 return {ok:!errors.length,errors};
}
function migrate(skills,revision=true){
 const sourceRevision=typeof revision==='number'?revision:null,legacy=revision!==false&&revision!==3;
 if(!Array.isArray(skills))return skills;const result=clone(skills),used=new Set(result.filter(Boolean).map(s=>s.id)),renamed=new Map();
 for(const s of result)for(const [id,before,after,legacyCondition] of ruleUpdates)if(s?.id===id){if(s.condition===(legacyCondition??before))s.condition=after;if(typeof s.description==='string'&&s.description.startsWith(before)&&!s.description.startsWith(after))s.description=s.description.replace(before,after);}
 if(legacy)for(const s of result){const base=addedDefaults.find(b=>b.id===s?.id);if(base&&((sourceRevision!==null&&sourceRevision<(base.id.startsWith('corrosion')?3:2))||s.type!==base.type||s.condition!==base.condition||s.robot!==base.robot)){let id='custom-'+s.id,n=2;while(used.has(id))id='custom-'+s.id+'-'+n++;renamed.set(s.id,id);used.add(id);s.id=id;}}
 if(renamed.size)for(const s of result){if(Array.isArray(s?.prerequisites))s.prerequisites=s.prerequisites.map(id=>renamed.get(id)||id);if(Array.isArray(s?.synergies))s.synergies=s.synergies.map(id=>renamed.get(id)||id);}
 const repair=result.find(s=>s?.id==='repair');if(repair?.condition===legacyRepairCondition)repair.condition=updatedRepairBenefit;if(repair?.description===legacyRepairDescription)repair.description=defaults.find(s=>s.id==='repair').description;
 for(const base of addedDefaults)if(!result.some(s=>s?.id===base.id))result.push(clone(base));return result;
}
function load(){try{const envelope=JSON.parse(root.localStorage?.getItem(storageKey)||'null');if(envelope?.version===1){const skills=migrate(envelope.skills,envelope.catalogRevision??1);if(validate(skills).ok)return skills;}}catch(_){}return clone(defaults);}
function save(skills){const check=validate(skills);if(!check.ok)return check;try{if(!root.localStorage)throw Error('Armazenamento indisponível');root.localStorage.setItem(storageKey,JSON.stringify({version:1,catalogRevision:3,skills:clone(skills)}));return {ok:true,errors:[]};}catch(_){return {ok:false,errors:['Não foi possível salvar neste dispositivo.']};}}
function freeze(value){if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
function snapshot(){runData=freeze(load());return runData;}
function apply(id,p,original=()=>{}){
 const item=(runData||defaults).find(s=>s.id===id);if(!item||item.enabled===false)return false;const base=byId.get(id);
 if(base&&JSON.stringify(item.effects)===JSON.stringify(base.effects)){original();return true;}
 const before=Object.fromEntries(Object.keys(fields).map(k=>[k,p[k]]));const ammoBefore=p.ammo;original();p.ammo=ammoBefore;for(const [key,value] of Object.entries(before))p[key]=value;
 for(const e of item.effects){const key=reverse[e.attribute],x=p[key]??0;p[key]=e.operator==='+'?x+e.value:e.operator==='−'?x-e.value:e.operator==='×'?x*e.value:e.operator==='÷'?x/e.value:e.value;}
 for(const k of Object.keys(fields)){const value=p[k];p[k]=Number.isNaN(value)?before[k]:Math.max(-1e9,Math.min(1e9,value));}p.maxHp=Math.max(1,p.maxHp);p.hp=Math.max(1,Math.min(p.maxHp,p.hp));for(const k of Object.keys(fields))if(!['hp','maxHp','armor'].includes(k))p[k]=Math.max(.001,p[k]);return true;
}
function describe(item,base){if(!base||JSON.stringify(item.effects)!==JSON.stringify(byId.get(item.id)?.effects)||item.description!==byId.get(item.id)?.description){const mods=item.effects.map(e=>e.attribute+' '+e.operator+e.value+(e.unit?' '+e.unit:'')).join('; ');return {benefit:(item.description!==byId.get(item.id)?.description?item.description+' ':'')+(mods?'MODIFICADORES: '+mods+'. ':'')+(item.condition?'CONDIÇÕES FIXAS: '+item.condition:'Sem efeito condicional adicional.'),cost:'Modificadores acima substituem os valores diretos originais.'};}return {benefit:base.benefit,cost:base.cost||''};}
root.ScrewBalance=Object.freeze({storageKey,catalog:freeze(clone(defaults)),attributes:Object.freeze(attributes),validate,migrate,save,load,snapshot,apply,describe});
})(typeof window!=='undefined'?window:globalThis);
