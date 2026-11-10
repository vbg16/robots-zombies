const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const listeners = new Map();
let focusedElement=null;
const storage=new Map();
const localStorage={getItem:key=>storage.has(key)?storage.get(key):null,setItem:(key,value)=>storage.set(key,String(value)),removeItem:key=>storage.delete(key),clear:()=>storage.clear()};
function surface(name) { return {style:{},focus(){focusedElement=name;},setAttribute(key,value){this[key]=value;},children:[],hidden:false,textContent:'',addEventListener(type,fn){listeners.set(name+':'+type,fn);},append(...items){this.children.push(...items);},replaceChildren(){this.children=[];}}; }
const elements = new Map();
const canvas = surface('canvas');
canvas.getBoundingClientRect=()=>({left:100,top:50,width:1000,height:600});
canvas.getContext=()=>new Proxy({}, {get:(target,key)=>target[key]||(()=>{})});
canvas.setPointerCapture=()=>{};
const window = surface('window');
const document = Object.assign(surface('document'), {hidden:false,querySelector:()=>canvas,getElementById(id){if(!elements.has(id)){const node=surface(id);if(id==='minimap'){node.width=160;node.height=100;node.getContext=()=>new Proxy({}, {get:(target,key)=>target[key]||(()=>{})});}elements.set(id,node);}return elements.get(id);},createElement:()=>surface('button'),createTextNode:t=>t});
const context=vm.createContext({window,document,devicePixelRatio:2,requestAnimationFrame:()=>{},Math,Set,localStorage});
vm.runInContext(fs.readFileSync('tools/drone-maturity.js','utf8'),context);
vm.runInContext(fs.readFileSync('tools/segment-circle.js','utf8'),context);
vm.runInContext(fs.readFileSync('tools/rupture-chamber.js','utf8'),context);
vm.runInContext(fs.readFileSync('game.js','utf8'),context);
assert.match(fs.readFileSync('index.html','utf8'),/SUCATA DOURADA → \+1 PARAFUSO/,'combat HUD teaches the salvage-to-bolt conversion');
assert.match(fs.readFileSync('index.html','utf8'),/NÚCLEO CIANO → XP/,'combat HUD maps the cyan pickup to experience');
assert.match(fs.readFileSync('style.css','utf8'),/\.xp-cue\{[^}]*color:#a8f1ff/,'experience cue uses high-contrast cyan styling');
assert.match(fs.readFileSync('style.css','utf8'),/@media\(max-width:650px\)\{\.batteries\{max-width:120px;\}\.combat-screen \.hud>div:first-child\.hud-unit\{max-width:min\(52vw,300px\)/,'compact combat HUD retains room for the XP cue');
assert.match(fs.readFileSync('style.css','utf8'),/@media\(max-width:720px\)\{\.combat-screen \.ammo-panel\{grid-template-columns:minmax\(0,1fr\);gap:2px 8px\}[\s\S]*?\.combat-screen \.ammo-panel>span\{white-space:nowrap;text-align:left/,'compact ammo stays on readable rows and exposes its reload bar without scrolling');
assert.match(fs.readFileSync('index.html','utf8'),/SEGURE O BOTÃO ESQUERDO PARA ATIRAR/,'combat HUD keeps aim, fire and movement instructions visible');
assert.match(fs.readFileSync('style.css','utf8'),/@media\(max-width:720px\)[\s\S]*?\.combat-controls\{top:162px/,'mobile control strip clears the expanded boss encounter HUD');
assert.match(fs.readFileSync('style.css','utf8'),/#overlay\[data-mode="paused"\]\{background:rgba\(8,20,38,\.72\);\}/,'paused gameplay remains visible enough to locate XP and salvage while planning');
assert.match(fs.readFileSync('style.css','utf8'),/@media\(max-width:800px\)\{\.garage-grid\{grid-template-columns:1fr\}\.weapon-options\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/,'garage weapon grid reflows to two columns at 648px instead of overflowing');
assert.match(fs.readFileSync('style.css','utf8'),/body:has\(#garage:not\(\[hidden\]\)\) main\{width:100%;height:auto;min-height:100dvh\}/,'garage uses containing-block width so viewport scrollbar cannot cause horizontal overflow');
assert.match(fs.readFileSync('index.html','utf8'),/id="boss-support"/,'boss HUD has a persistent minion and paused-wave status line');
assert.match(fs.readFileSync('index.html','utf8'),/id="garage-feedback" role="status" aria-live="polite"/,'garage purchase feedback is announced accessibly');
for(const id of ['launch','loadout','weapon-description'])assert.equal((fs.readFileSync('index.html','utf8').match(new RegExp('id="'+id+'"','g'))||[]).length,1,'garage DOM id '+id+' must be unique so its control is wired');
const run=code=>vm.runInContext(code,context);
const collectBossChest=()=>run('player.x=bossChests[0].x;player.y=bossChests[0].y;tick(.01)');
const fire=(type,props={})=>listeners.get(type)({pointerType:'mouse',button:0,pointerId:1,clientX:900,clientY:350,...props});
// New profile: garage purchases persist inventory only; legacy saves keep access to prototype gear.
run('profile=emptyProfile();profileStorageAvailable=true;selectedRobot="prot";selectedWeapon="machine";openGarage()');
assert.equal(run('profile.version'),2,'garage progression uses versioned profile schema v2');assert.equal(run('profile.unlockedRobots.bastion'),false);assert.equal(run('profile.unlockedWeapons.machine'),true);assert.equal(run('profile.unlockedWeapons.shotgun'),false);
assert.equal(run("Object.keys(GARAGE_PRICES.weapons).sort().join(',')"),run("Object.keys(WEAPONS).filter(id=>id!=='machine').sort().join(',')"),'every nonstarter weapon has a documented purchase path');for(const id of run('Object.keys(WEAPONS)'))assert.ok(fs.readFileSync('index.html','utf8').includes('id="weapon-status-'+id+'"'),'weapon '+id+' exposes purchase status in the garage');
assert.equal(elements.get('weapon-status-shotgun').textContent,'DESBLOQUEAR · 8 PARAFUSOS','garage displays the weapon price');assert.equal(run("selectWeapon('shotgun')"),false,'locked weapon cannot enter the loadout');
run('profile.bolts=7;renderLoadout()');assert.equal(elements.get('weapon-shotgun').onclick(),false,'insufficient bolts cannot unlock a weapon');assert.equal(run('profile.bolts'),7,'failed purchase never spends currency');assert.ok(elements.get('weapon-status-shotgun').textContent.startsWith('FALTAM RECURSOS'),'the clicked card explains its failed purchase');assert.ok(elements.get('garage-feedback').textContent.includes('8 PARAFUSOS'),'live feedback gives the missing purchase requirement');elements.get('weapon-machine').onclick();assert.equal(elements.get('garage-feedback').textContent,'','changing selected gear clears stale purchase feedback');
run('profile.bolts=8;renderLoadout()');assert.equal(elements.get('weapon-shotgun').onclick(),true,'garage button purchases an affordable weapon');assert.equal(run('profile.unlockedWeapons.shotgun'),true);assert.equal(run('profile.bolts'),0);assert.equal(run('selectedWeapon'),'shotgun','purchase equips the newly unlocked item');assert.equal(elements.get('garage-feedback').textContent,'Escopeta DESBLOQUEADO');assert.equal(elements.get('weapon-shotgun').onclick(),true,'owned weapon button selects it without another purchase');assert.equal(run('profile.bolts'),0,'reselecting owned gear is free');
run('profile.bolts=22;renderLoadout()');assert.equal(elements.get('weapon-sniper').onclick(),false,'boss signature weapon stays locked without its matching part');assert.equal(run('profile.bolts'),22);run('profile.bossParts.brute=1;saveProfile();renderLoadout()');assert.equal(elements.get('weapon-sniper').onclick(),true,'boss part and bolts unlock their matching signature weapon');assert.equal(run('profile.bossParts.brute'),0,'signature blueprint consumes exactly one boss part');assert.equal(run('profile.bolts'),0);run('profile.bolts=24;renderLoadout()');assert.equal(elements.get('robot-bastion').onclick(),true,'chassis can be unlocked with its listed bolt cost');assert.equal(run('profile.unlockedRobots.bastion'),true);assert.equal(run('profile.bolts'),0);run('profile=loadProfile()');assert.equal(run('profile.unlockedWeapons.sniper'),true,'purchased weapon survives profile reload');assert.equal(run('profile.unlockedRobots.bastion'),true,'purchased chassis survives profile reload');assert.equal(run('profile.bossParts.brute'),0);run('reset();player.inv=0;hurtPlayer(99999)');assert.equal(run('state'),'over');assert.equal(run('profile.unlockedWeapons.sniper'),true,'purchased unlock survives player death');assert.equal(run('profile.unlockedRobots.bastion'),true,'purchased chassis survives player death');assert.equal(run('selectedWeapon'),'sniper','retry keeps the chosen garage loadout');assert.equal(run('selectedRobot'),'bastion');run('reset()');assert.equal(run('runWeapon.id'),'sniper','retry uses the fixed selected loadout');assert.equal(run("selectWeapon('machine')"),false,'weapon cannot be switched after leaving the garage');
run('profile=emptyProfile();profile.bolts=20;saveProfile()');const originalProgressSetItem=localStorage.setItem;localStorage.setItem=()=>{throw new Error('quota exceeded')};assert.equal(run("purchaseGear('weapons','flame')"),false,'failed storage must reject the purchase');assert.equal(run('profile.bolts'),20,'failed save refunds the bolts');assert.equal(run('profile.unlockedWeapons.flame'),false,'failed save does not unlock the weapon');run('profile.bolts=30;profile.bossParts.brute=1');assert.equal(run("purchaseGear('weapons','sniper')"),false,'failed storage rejects boss signature purchases');assert.equal(run('profile.bolts'),30,'failed signature save refunds bolts');assert.equal(run('profile.bossParts.brute'),1,'failed signature save refunds the boss part');assert.equal(run('profile.unlockedWeapons.sniper'),false);localStorage.setItem=originalProgressSetItem;run('saveProfile()');
storage.set('screwvivors.profile.v1',JSON.stringify({version:1,bolts:13,bossParts:{brute:1,scrapper:2,coil:3}}));run('profile=loadProfile()');assert.equal(run('profile.version'),2);assert.equal(JSON.parse(storage.get('screwvivors.profile.v1')).version,2,'legacy profile migration is written immediately');assert.equal(run('profile.bolts'),13,'legacy migration preserves currency');assert.equal(run('profile.bossParts.scrapper'),2,'legacy migration preserves boss parts');assert.equal(run('profile.unlockedWeapons.tesla'),true,'legacy saves keep all previously testable prototype weapons');assert.equal(run('profile.unlockedRobots.bastion'),true,'legacy saves keep access to the second chassis');assert.ok(run("['forge','volt','nano','swarm'].every(id=>profile.unlockedRobots[id]===false)"),'new chassis are not free in legacy migration');
storage.clear();run('profile=emptyProfile();profileStorageAvailable=true;profile.unlockedRobots=Object.fromEntries(Object.keys(ROBOTS).map(id=>[id,true]));profile.unlockedWeapons=Object.fromEntries(Object.keys(WEAPONS).map(id=>[id,true]));saveProfile();selectedRobot="prot";selectedWeapon="machine";openGarage()');
run('reset();spawn=100;tick(.01)');
assert.equal(run('bullets.length'),0,'no automatic shot');
fire('canvas:pointermove');
assert.equal(run('aim.x'),800,'pointer accounts for canvas offset');
assert.equal(run('player.x'),500,'aim does not move player');
fire('canvas:pointerdown');run('tick(.01)');
assert.equal(run('bullets.length'),1,'shoots without an enemy');
assert.ok(run('bullets[0].vx>0&&Math.abs(bullets[0].vy)<.001'),'shoots toward cursor');
run('tick(.1)');assert.equal(run('bullets.length'),1,'respects fire rate');
fire('window:pointerup');run('tick(.4)');assert.equal(run('bullets.length'),1,'release stops shooting');
fire('canvas:pointerdown');run('pause();pause();tick(.01)');assert.equal(run('firing'),false,'resume requires a new press');
fire('canvas:pointerdown');fire('canvas:pointercancel');assert.equal(run('firing'),false);
fire('canvas:pointerdown',{button:2});assert.equal(run('firing'),false,'right click ignored');
fire('canvas:pointerdown',{pointerType:'touch'});assert.equal(run('firing'),false,'touch does not enable automatic combat');
run("keys.add('d');keys.add('s');const before={x:player.x,y:player.y};tick(.1);globalThis.distance=Math.hypot(player.x-before.x,player.y-before.y)");
assert.ok(Math.abs(run('distance')-19)<.001,'diagonal movement normalized');
fire('canvas:pointerdown');fire('window:blur');assert.equal(run('state'),'paused');assert.equal(run('firing'),false);assert.equal(run('keys.size'),0);
run('reset();spawn=100;xp=need;tick(.01)');assert.equal(run('state'),'upgrade');assert.equal(run('firing'),false);elements.get('module-options').children[0].onclick();assert.equal(run('state'),'upgrade');elements.get('confirm-upgrade').onclick();assert.equal(run('state'),'playing');
run('reset();clock=179.99;tick(.02)');assert.equal(run('state'),'playing','does not end at three minutes');
run('reset();clock=599.99;tick(.02)');assert.equal(run('state'),'playing','survival has no automatic time limit');
run('reset();player.hp=1;enemies=[{x:player.x,y:player.y,hp:100,speed:0,r:15}];spawn=100;tick(.01)');assert.equal(run('state'),'over');
run('reset();draw()');assert.equal(run('player.hp'),100);assert.equal(run('bullets.length'),0);
console.log('Combat checks passed: manual aim/fire, cooldown, release, interruptions, movement, upgrades, endless survival, death/restart.');

run('reset();player.hp=80;updateHUD()');
assert.equal(elements.get('health')['aria-valuenow'],'80','health meter exposes current integrity');
assert.equal(elements.get('health-fill').style.width,'80%','health fill matches current integrity');
run('player.hp=0;updateHUD()');
assert.equal(elements.get('health')['aria-valuenow'],'0');
assert.equal(elements.get('health-fill').style.width,'0%','empty integrity has no fill');
run('player.hp=35;updateHUD()');
assert.equal(elements.get('health-fill').style.width,'35%','healing restores proportional integrity');
assert.equal(elements.get('health-value').textContent,'35 / 100');
run('reset()');assert.equal(elements.get('health-fill').style.width,'100%','restart restores full integrity');
run('tick(1.99)');assert.equal(run('enemies.length'),0,'initial breathing room');
run('tick(.02)');assert.equal(run('enemies.length'),15,'first horde arrives as one wave');
assert.ok(run('enemies.every(e=>Math.abs(Math.hypot(e.x-player.x,e.y-player.y)-waveRadius())<6)'),'first wave forms a circle around the player');
assert.ok(run('enemies.every(e=>e.speed<43)'),'starting zombies stay within baseline speed');
run('tick(6.35)');assert.equal(run('enemies.length'),15,'wave interval prevents an immediate repeat');
run('tick(.04)');assert.equal(run('enemies.length'),30,'next circular wave arrives together');
run('reset();enemies=Array.from({length:70},()=>({x:-100,y:-100,hp:100,speed:0,r:12}));spawn=0;tick(.01)');
assert.equal(run('enemies.length'),70,'director adds nothing above its live cap and preserves existing enemies');
console.log('Integrity meter, fifteen-enemy circular waves, breathing room and continuous spawning checks passed.');

run("reset();SKILLS.find(s=>s.id==='damage').apply();SKILLS.find(s=>s.id==='damage').apply()");
assert.ok(Math.abs(run('player.damage')-44)<1e-9,'damage doubles once; duplicates are ignored');
run("player.x=-1200;player.y=1800;syncCamera();aim={x:800,y:300,active:true};firing=true;spawn=100;tick(.01)");
assert.ok(run('bullets[0].vx>0&&Math.abs(bullets[0].vy)<.001'),'world-space aim after camera movement');
assert.equal(run('player.x-camera.x'),500);
assert.equal(run('player.y-camera.y'),300);
run("keys.add('a');keys.add('w');tick(10)");
assert.ok(run('player.x<-1200&&player.y<1800'),'movement has no arena clamp');
run("clock=0;globalThis.earlyEnemy=createEnemy(100,200);clock=170;globalThis.lateEnemy=createEnemy(100,200)");
assert.equal(run('earlyEnemy.hp'),24);assert.equal(run('lateEnemy.hp'),38,'zombie health scales with survival time');
assert.ok(run('earlyEnemy.speed>=24&&earlyEnemy.speed<=42'));
assert.ok(run('lateEnemy.speed>=25.88&&lateEnemy.speed<=43.89'),'zombie speed scales gradually with survival time');
assert.equal(run('lateEnemy.x'),100);assert.equal(run('lateEnemy.y'),200);
run('reset();clock=299.99;spawnCircularWave(15)');assert.ok(run("enemies.every(z=>z.enemyType==='chaser')"),'base horde stays familiar before the five-minute enemy threshold');
run('enemies=[];clock=1000;spawnCircularWave(15)');assert.equal(run("enemies.filter(z=>z.enemyType==='expolice').length"),0,'time alone cannot unlock police');run('enemies=[];clock=300;policeUnlocked=true;commonWaveIndex=0;spawnCircularWave(15)');assert.equal(run("enemies.filter(isPolice).length"),5,'after second boss, five of fifteen are police');assert.equal(run("enemies.filter(z=>z.enemyType==='chaser').length"),10);assert.equal(run("enemies.find(z=>z.enemyType==='expolice').minionBadge"),'EX-POLICIAL','new enemy role is labeled in the same readable badge system');assert.ok(run("enemies.find(z=>z.enemyType==='expolice').hp<enemies.find(z=>z.enemyType==='chaser').hp"),'ex-policiais trade health for range and appear less often');assert.ok(run("enemies.every(z=>Math.abs(Math.hypot(z.x-player.x,z.y-player.y)-waveRadius())<1e-8)"),'special enemies remain on the same circular spawn ring');
run("const shooter=enemies.find(z=>z.enemyType==='expolice');shooter.x=player.x+300;shooter.y=player.y;shooter.shotCooldown=.01;tick(.02)");assert.equal(run("hostile.filter(b=>b.source==='common-ranged').length"),1,'ex-policial fires its own hostile projectile');assert.equal(run("hostile.find(b=>b.source==='common-ranged').damage"),8,'common ranged damage stays below standard boss-minion damage');
run('enemies=[];clock=899.99;commonWaveIndex=2;spawnCircularWave(15)');assert.equal(run("enemies.filter(z=>z.enemyType==='heavy').length"),0,'large pursuer remains locked immediately before fifteen minutes');assert.equal(run("enemies.filter(isPolice).length"),5);
run('enemies=[];clock=900;commonWaveIndex=2;spawnCircularWave(15)');assert.equal(run("enemies.filter(z=>z.enemyType==='heavy').length"),1,'large pursuer begins exactly at fifteen minutes on a controlled cadence');assert.equal(run("enemies.filter(isPolice).length"),5);assert.equal(run("enemies.find(z=>z.enemyType==='heavy').minionBadge"),'PERSEGUIDOR');assert.ok(run("enemies.find(z=>z.enemyType==='heavy').hp===enemies.find(z=>z.enemyType==='chaser').hp*3"),'large pursuer has three times the common health');assert.ok(run("enemies.find(z=>z.enemyType==='heavy').r>enemies.find(z=>z.enemyType==='chaser').r"),'large pursuer has a larger collision silhouette');assert.ok(run("enemies.find(z=>z.enemyType==='heavy').speed<enemies.find(z=>z.enemyType==='chaser').speed"),'large pursuer trades speed for durability');
run('enemies=[];commonWaveIndex=3;spawnCircularWave(15)');assert.equal(run("enemies.filter(z=>z.enemyType==='heavy').length"),0,'large pursuers remain occasional between heavy waves');run('enemies=[];commonWaveIndex=5;spawnCircularWave(1)');assert.equal(run('enemies.length'),1,'explicit partial wave requests preserve their count');assert.ok(run("enemies.every(z=>z.enemyType==='chaser')"),'partial waves stay common and do not spend a special-role slot');assert.equal(run('commonWaveIndex'),5,'partial waves do not advance the cadence of full waves');
run('reset()');assert.equal(run('commonWaveIndex'),0,'retry restarts deterministic common enemy cadence');
run("reset();SKILLS.find(s=>s.id==='damage').apply();SKILLS.find(s=>s.id==='damage').apply();spawn=100;aim={x:800,y:300,active:true};firing=true;enemies=[{x:player.x+50,y:player.y,hp:30,speed:0,r:16}];tick(.06)");
assert.equal(run('kills'),1,'44 damage kills a 30 HP zombie in one hit');
assert.ok(run('feedback.length>0'),'damage feedback created');
run("reset();player.x=2000;player.y=-3000;syncCamera();draw()");
console.log('World camera, unbounded movement, scalable common-enemy roles, multiplicative damage and hit feedback passed.');

run("reset();spawn=100;keys.add('d');tick(.1)");
assert.ok(run('player.x-camera.x>500'),'player can leave screen center');
assert.equal(run('camera.x'),0,'dead zone avoids camera movement for small steps');
assert.ok(run('player.stride>0&&player.walkPhase>0'),'walking animation advances');
run("tick(.5)");
assert.ok(run('camera.x>0&&camera.x<player.x-500'),'camera follows with lag');
run("keys.clear();globalThis.oldStride=player.stride;tick(.2)");
assert.ok(run('player.stride<oldStride'),'animation settles when movement stops');
run("draw();reset();keys.add('a');keys.add('w');spawn=100;tick(1);draw()");
assert.ok(run('camera.x<0&&camera.y<0'),'camera follows in opposite directions');
console.log('Camera dead zone, smooth follow and walking transitions passed.');

run("openGarage();selectWeapon('shotgun');reset()");
assert.equal(run('runWeapon.id'),'shotgun');
assert.equal(elements.get('garage').hidden,true);assert.equal(elements.get('combat').hidden,false);
assert.equal(run("selectWeapon('machine')"),false,'equipment cannot change in combat');
run("spawn=100;aim={x:800,y:300,active:true};firing=true;tick(.01)");
assert.equal(run('bullets.length'),5,'shotgun fires five pellets');
assert.equal(run('bullets[0].damage'),12);assert.ok(run('bullets[0].vy<0&&bullets[4].vy>0'),'spread');
run("upgrade();globalThis.offer=offerVersion;globalThis.chosen=offeredSkills[0].id");
assert.equal(run('chooseSkill(chosen,offer)'),true);assert.equal(run('chooseSkill(chosen,offer)'),false,'stale choice cannot be applied twice');
run("openGarage();selectWeapon('machine');reset()");
assert.equal(run('player.skills.pierce+player.skills.blast+player.skills.shock'),0,'skills reset between attempts');
assert.equal(run('player.damageStacks'),0);
run("SKILLS.find(s=>s.id==='pierce').apply();SKILLS.find(s=>s.id==='blast').apply();SKILLS.find(s=>s.id==='shock').apply()");
assert.equal(run('activeSynergies().length'),3);
run("spawn=100;enemies=[{x:550,y:300,hp:100,speed:0,r:14,hit:0},{x:580,y:300,hp:100,speed:0,r:14,hit:0},{x:610,y:300,hp:100,speed:0,r:14,hit:0}];aim={x:800,y:300,active:true};firing=true;tick(.04);firing=false;tick(.12)");
assert.ok(run('enemies[0].hp<100&&enemies[1].hp<100&&enemies[2].hp<100'),'synergies damage multiple targets');
assert.ok(run('effects.length>0'),'synergy VFX');
run("reset();clock=59.98;spawn=100;tick(.04)");
assert.equal(run('bossSpawned'),true);assert.equal(run('boss.hp'),650);assert.equal(run('bossDefeated'),false);
run("boss.timer=0;tickBoss(.01)");
assert.equal(run('boss.phase'),'tellDash');assert.ok(run('boss.timer>.9'),'dash has warning');
run("boss.timer=0;tickBoss(.01)");assert.equal(run('boss.phase'),'dash');
run("boss.phase='approach';boss.turn=1;boss.timer=0;tickBoss(.01)");assert.equal(run('boss.phase'),'tellVolley');assert.equal(run('hostile.length'),0);
run("boss.timer=0;tickBoss(.01)");assert.equal(run('hostile.length'),12,'volley only after warning');
run("boss.x=player.x+300;boss.y=player.y;player.hp=50;damageEnemy(boss,10000);tick(.01)");
assert.equal(run('bossDefeated'),true);assert.equal(run('state'),'playing','boss loot waits on the ground');assert.equal(run('bossChests.length'),1);run('offerExperiment()');assert.equal(run('state'),'experiment');assert.equal(run('player.hp'),70);assert.equal(run('hostile.length'),0);assert.equal(elements.get('description').textContent.includes('experimento temporário'),true,'fallback explains the temporary reward');assert.equal(elements.get('description').textContent.includes('Peça permanente'),true,'boss offer distinguishes the saved part from its temporary choice');assert.equal(elements.get('choices').children.at(-1)['aria-keyshortcuts'],'R','experiment refusal advertises its keyboard shortcut');assert.equal(elements.get('choices').children.at(-1).textContent,'RECUSAR E CONTINUAR [R]');
assert.equal(run('bossReward'),false,'reward delivered once');assert.equal(run('offeredExperiments.length'),3);assert.equal(run('new Set(offeredExperiments.map(item=>item.id)).size'),3,'boss presents three distinct experiments');assert.ok(run('offeredExperiments.every(item=>item.cost&&item.benefit)'),'each experiment states a cost and benefit');
const experimentId=run('offeredExperiments[0].id'),experimentVersion=run('offerVersion'),beforeExperiment={damage:run('player.damage'),rate:run('player.rate'),speed:run('player.speed'),armor:run('player.armor'),maxHp:run('player.maxHp'),hp:run('player.hp'),magnet:run('player.magnet'),reload:run('player.reloadMult'),projectileSpeed:run('player.projectileSpeed'),projectileSize:run('player.projectileSize')};
fire('window:keydown',{key:'1',repeat:false,preventDefault(){}});assert.equal(run('state'),'playing','number key selects boss experiment');assert.equal(focusedElement,'pause','keyboard focus returns to a visible control after selecting an experiment');assert.equal(run(`player.experiments.has('${experimentId}')`),true);assert.equal(run(`chooseExperiment('${experimentId}',${experimentVersion})`),false,'stale boss experiment cannot be repeated');
if(experimentId==='volatileReactor'){assert.equal(run('player.damage'),beforeExperiment.damage*1.35);assert.equal(run('player.rate'),beforeExperiment.rate*1.15);}else if(experimentId==='unstableLens'){assert.equal(run('player.projectileSpeed'),beforeExperiment.projectileSpeed*1.5);assert.equal(run('player.projectileSize'),beforeExperiment.projectileSize*1.5);assert.equal(run('player.speed'),beforeExperiment.speed*.85);}else if(experimentId==='lithiumPack'){assert.equal(run('player.maxHp'),beforeExperiment.maxHp+30);assert.equal(run('player.hp'),beforeExperiment.hp+30);assert.equal(run('player.armor'),beforeExperiment.armor-1);}else if(experimentId==='scrapCatalyst'){assert.equal(run('player.magnet'),beforeExperiment.magnet*2);assert.equal(run('player.reloadMult'),beforeExperiment.reload*1.5);}else if(experimentId==='blastCondenser'){assert.equal(run('player.damage'),beforeExperiment.damage*1.5);assert.equal(run('player.rate'),beforeExperiment.rate*1.35);}else if(experimentId==='nervousServo'){assert.equal(run('player.speed'),beforeExperiment.speed*1.35);assert.equal(run('player.armor'),beforeExperiment.armor-1);}
run("globalThis.rewardVersion=offerVersion;bossReward=true;tick(.01);offerExperiment()");assert.equal(run('state'),'experiment');assert.equal(run(`offeredExperiments.some(item=>item.id==='${experimentId}')`),false,'selected experiment does not reappear in this attempt');elements.get('choices').children.at(-1).onclick();assert.equal(run('state'),'playing');assert.equal(focusedElement,'pause','focus returns to a visible control after button refusal');assert.equal(run('player.experiments.size'),1,'declining does not add an experiment');assert.equal(Object.hasOwn(JSON.parse(storage.get('screwvivors.profile.v1')),'experiments'),false,'temporary experiments are excluded from the persistent profile');
assert.equal(run('state'),'playing');
run("pause();globalThis.frozenTime=clock;tick(1)");assert.equal(run('clock'),run('frozenTime'),'pause freezes simulation');
run("openGarage();selectWeapon('shotgun');reset()");assert.equal(run('bossSpawned'),false);assert.equal(run('bossDefeated'),false);assert.equal(run('runWeapon.id'),'shotgun');assert.equal(run('player.hp'),100);assert.equal(run('player.experiments.size'),0,'boss experiments are cleared on retry');
console.log('Garage, fixed loadout, shotgun, stale offers, skills/synergies, boss telegraphs and one-time rewards passed.');

run("openGarage();selectWeapon('machine');reset();player.inv=100000;player.damage*=100;player.skills.pierce=10;globalThis.longRunSeen=new Set();globalThis.longRunBoss=null;globalThis.longRunBossAge=0;globalThis.longRunBounds=true;globalThis.longRunMinimap=drawMinimap;drawMinimap=()=>{};globalThis.longRunOriginalRandom=Math.random;globalThis.longRunSeed=20261031;Math.random=()=>{longRunSeed=(Math.imul(longRunSeed,1664525)+1013904223)>>>0;return longRunSeed/4294967296}");
for(let i=0;i<38000;i++){
 if(i%10000===0)console.log("Long-run progress:",Math.round(run("clock")),"seconds,",run("enemies.length"),"living enemies");
 if(run('state')==='playing'){
  run("{aim={x:width/2+100,y:height/2,active:true};const ts=targets().filter(t=>t.hp>0);if(ts.length){const t=ts.reduce((a,b)=>(a.x-player.x)**2+(a.y-player.y)**2<(b.x-player.x)**2+(b.y-player.y)**2?a:b);aim.x=t.x-camera.x;aim.y=t.y-camera.y;}firing=true;tick(.04);if(boss&&boss.hp>0){if(longRunBoss!==boss){longRunBoss=boss;longRunBossAge=0;}longRunBossAge+=.04;if(longRunBossAge>=30)damageEnemy(boss,1000000000);}for(const z of enemies)longRunSeen.add(z.enemyType);longRunBounds=longRunBounds&&enemies.every(z=>Number.isFinite(z.x)&&Number.isFinite(z.y))&&bullets.length<=400&&feedback.length<=100&&scrap.length<=250&&effects.length<=150&&sparks.length<=600&&hazards.length<=60}");
 }else if(['upgrade','reward'].includes(run('state'))){run("chooseSkill(offeredSkills[0].id,offerVersion)");}
 else if(run('state')==='relic'){run("chooseRelic(offeredRelics[0].id,offerVersion)");}
 else if(run('state')==='experiment'){run("chooseExperiment(offeredExperiments[0].id,offerVersion)");}
 else if(run('state')==='blessing'){run("chooseBlessing(offeredBlessings[0].id,offerVersion)");}
 else if(run('state')==='specialization'){run("chooseSpecialization(offeredSpecializations[0].id,offerVersion)");}
 else if(run('state')==='evolution'){run("chooseWeaponEvolution(offeredWeaponEvolutions[0].id,offerVersion)");}
 else break;
}
run('Math.random=longRunOriginalRandom;drawMinimap=longRunMinimap');
assert.equal(run('state'),'playing','twenty-five minutes do not end endless survival');
assert.ok(run('clock>=1500'),'simulation reaches twenty-five minutes');
assert.ok(run('bossKills>=6'),'multiple boss cycles resolve during the long run');
assert.ok(run('longRunBounds'),'entity bounds hold throughout the long run');
assert.ok(run("longRunSeen.has('expolice')&&longRunSeen.has('heavy')"),'both timed common enemy roles appear in integrated waves');
assert.ok(run('enemies.every(z=>Number.isFinite(z.x)&&Number.isFinite(z.y))&&bullets.length<=400&&feedback.length<=100'),'entity bounds scale only within their approved caps');
run("openGarage()");assert.equal(elements.get('garage').hidden,false);assert.equal(elements.get('combat').hidden,true);
console.log('Full twenty-five-minute combat/upgrade/boss integration simulation passed without a forced ending.');

const fresh=(weapon='machine')=>run(`profile.unlockedRobots=Object.fromEntries(Object.keys(ROBOTS).map(id=>[id,true]));profile.unlockedWeapons=Object.fromEntries(Object.keys(WEAPONS).map(id=>[id,true]));saveProfile();openGarage();selectRobot('prot');selectWeapon('${weapon}');reset();spawn=10000;aim={x:800,y:300,active:true}`);
fresh();run("globalThis.gemX=player.x+73;globalThis.gemY=player.y+41;globalThis.gemHalo=false;globalThis.gemRing=false;ctx.arc=(x,y,r)=>{if(x===gemX&&y===gemY&&r===14)gemHalo=true};ctx.stroke=()=>{if(ctx.strokeStyle==='#a8f1ff'&&ctx.lineWidth===2)gemRing=true};gems=[{x:gemX,y:gemY}];draw()");assert.equal(run('gemHalo'),true,'XP pickup retains a large luminous halo');assert.equal(run('gemRing'),true,'XP pickup keeps its contrasting outline');
const acquire=id=>run(`SKILLS.find(s=>s.id==='${id}').apply()`);
const experimentCases={volatileReactor:()=>{assert.equal(run('player.damage'),22*1.35);assert.ok(Math.abs(run('player.rate')-.32*1.15)<1e-9);},unstableLens:()=>{assert.equal(run('player.projectileSpeed'),1.5);assert.equal(run('player.projectileSize'),1.5);assert.equal(run('player.speed'),190*.85);},lithiumPack:()=>{assert.equal(run('player.maxHp'),130);assert.equal(run('player.hp'),130);assert.equal(run('player.armor'),-1);},scrapCatalyst:()=>{assert.equal(run('player.magnet'),190);assert.equal(run('player.reloadMult'),1.5);},blastCondenser:()=>{assert.equal(run('player.damage'),33);assert.equal(run('player.rate'),.32*1.35);},nervousServo:()=>{assert.equal(run('player.speed'),190*1.35);assert.equal(run('player.armor'),-1);}};
for(const id of Object.keys(experimentCases)){fresh();run(`state='experiment';offeredExperiments=[BOSS_EXPERIMENTS.find(item=>item.id==='${id}')];offerVersion++;chooseExperiment('${id}',offerVersion)`);experimentCases[id]();assert.equal(run('player.experiments.size'),1);run('reset()');assert.equal(run('player.experiments.size'),0,`${id} is cleared after its own retry`);assert.equal(run('player.damage'),22);assert.equal(run('player.speed'),190);assert.equal(run('player.armor'),0);}
for(let index=0;index<3;index++){fresh();run(`state='experiment';offeredExperiments=BOSS_EXPERIMENTS.slice(0,3);offerVersion++`);const offeredId=run(`offeredExperiments[${index}].id`);fire('window:keydown',{key:String(index+1),repeat:false,preventDefault(){}});assert.equal(run(`player.experiments.has('${offeredId}')`),true,`boss experiment keyboard slot ${index+1} selects its card`);run('reset()');assert.equal(run('player.experiments.size'),0,`retry clears the effect selected with key ${index+1}`);assert.equal(run('player.damage'),22);}
fresh();run("state='experiment';offeredExperiments=[BOSS_EXPERIMENTS[0]];offerVersion++");let refusedPrevented=false;fire('window:keydown',{key:'r',repeat:true,preventDefault(){refusedPrevented=true}});assert.equal(run('state'),'experiment','holding R does not prematurely refuse');assert.equal(refusedPrevented,false,'repeated R is not captured');fire('window:keydown',{key:'r',repeat:false,preventDefault(){refusedPrevented=true}});assert.equal(run('state'),'playing','R refuses an experiment and resumes combat');assert.equal(refusedPrevented,true,'R refusal prevents browser defaults');assert.equal(focusedElement,'pause','keyboard focus returns to a visible control after refusal');assert.equal(run('player.experiments.size'),0,'keyboard refusal does not grant the experiment');
fresh();run('player.experiments=new Set(BOSS_EXPERIMENTS.map(item=>item.id));bossReward=true;tick(.01);offerExperiment()');assert.equal(run('state'),'reward','exhausted boss experiments fall back to the normal temporary module reward');assert.ok(run('offeredSkills.length>0'));elements.get('choices').children.at(-1).onclick();assert.equal(run('state'),'playing');
fresh();run('player.x=500;player.y=300;hurtPlayer(1,450,300)');assert.equal(run('player.x'),548,'damage knocks the robot 48 px away from the hit source');assert.equal(run('player.y'),300,'horizontal hit preserves the other axis');run('player.inv=0;hurtPlayer(1,600,300)');assert.equal(run('player.x'),500,'opposite-side hit pushes in the opposite direction');
// Collected salvage and boss parts persist locally; uncollected drops and run skills do not.
storage.clear();run('profile=emptyProfile();saveProfile()');
fresh();run('globalThis.scrapTest={x:player.x,y:player.y,hp:1,r:10};damageEnemy(scrapTest,1)');assert.equal(run('scrap.length'),1);assert.equal(run('profile.bolts'),0,'scrap is not banked before pickup');
run('scrap[0].x=player.x;scrap[0].y=player.y;tick(.01)');assert.equal(run('profile.bolts'),1,'one collected zombie scrap gives one bolt');assert.equal(JSON.parse(storage.get('screwvivors.profile.v1')).bolts,1,'bolt saves immediately');assert.equal(elements.get('profile-bolts').textContent,'PARAFUSOS · 1');
acquire('damage');run('player.inv=0;hurtPlayer(99999)');assert.equal(run('state'),'over');assert.equal(run('profile.bolts'),1,'collected bolts survive death');run('reset()');assert.equal(run('profile.bolts'),1,'collected bolts survive a new attempt');assert.equal(run('player.acquired.size'),0,'run skills do not persist with bolts');assert.equal(run('scrap.length'),0,'uncollected run drops are cleared');
fresh();run('globalThis.scrapTest={x:player.x+120,y:player.y,hp:1,r:10};damageEnemy(scrapTest,1)');run('reset()');assert.equal(run('profile.bolts'),1,'uncollected scrap is not added on reset');
fresh();run('gems=[{x:player.x+17,y:player.y}];tick(.01)');assert.equal(run('xp'),1,'making XP visible keeps its existing one-point collection value');assert.equal(run('gems.length'),0,'collected XP core is removed once');run("player.skills.xp=1;gems=[{x:player.x+17,y:player.y}];tick(.01)");assert.equal(run('xp'),3,'XP module still doubles the collection value');
fresh();run('spawnBoss();damageEnemy(boss,99999)');assert.equal(run('profile.bossParts.brute'),1,'boss defeat awards one named part');assert.equal(JSON.parse(storage.get('screwvivors.profile.v1')).bossParts.brute,1,'boss part saves immediately');run('damageEnemy(boss,1)');assert.equal(run('profile.bossParts.brute'),1,'same defeated boss cannot duplicate its part');run('player.inv=0;hurtPlayer(99999)');assert.equal(run('state'),'over');assert.equal(run('profile.bossParts.brute'),1,'boss part survives the death screen');run('reset()');assert.equal(run('profile.bossParts.brute'),1,'boss parts survive retry');
run('profile=loadProfile()');assert.equal(run('profile.bolts'),1);assert.equal(run('profile.bossParts.brute'),1,'local profile reloads saved materials');
const originalSetItem=localStorage.setItem;localStorage.setItem=()=>{throw new Error('quota exceeded')};assert.equal(run('saveProfile()'),false,'blocked storage is reported without crashing');assert.equal(elements.get('profile-save-status').textContent,'SALVAMENTO LOCAL INDISPONÍVEL');assert.equal(elements.get('profile-save-status').style.color,'#ff8b8b','failed saves use an error color');localStorage.setItem=originalSetItem;assert.equal(run('saveProfile()'),true,'profile save recovers after storage becomes available');assert.equal(elements.get('profile-save-status').textContent,'SALVO NESTE DISPOSITIVO');assert.equal(elements.get('profile-save-status').style.color,'#81d7be','successful retry restores the success state');
// Early-run blessings are distinct run-only choices and can be selected by keyboard or skipped.
fresh();run('level=2;xp=need;tick(.01)');assert.equal(run('state'),'blessing','level three opens the first workshop blessing');assert.equal(run('offeredBlessings.length'),3);assert.equal(run('new Set(offeredBlessings.map(b=>b.id)).size'),3,'blessing offer has no duplicates');
const blessingId=run('offeredBlessings[0].id'),blessingVersion=run('offerVersion'),beforeBlessing={damage:run('player.damage'),rate:run('player.rate'),hp:run('player.hp'),maxHp:run('player.maxHp'),magnet:run('player.magnet'),speed:run('player.speed'),armor:run('player.armor')};
fire('window:keydown',{key:'1',repeat:false,preventDefault(){}});assert.equal(run('state'),'playing','number key selects blessing');assert.equal(run(`player.blessings.has('${blessingId}')`),true);assert.equal(run(`chooseBlessing('${blessingId}',${blessingVersion})`),false,'stale blessing cannot be applied twice');
if(blessingId==='pulseCoil')assert.equal(run('player.damage'),beforeBlessing.damage*1.25);else if(blessingId==='triggerRegulator')assert.equal(run('player.rate'),beforeBlessing.rate*.8);else if(blessingId==='spareBattery'){assert.equal(run('player.maxHp'),beforeBlessing.maxHp+20);assert.equal(run('player.hp'),beforeBlessing.hp+20);}else if(blessingId==='scrapMagnet')assert.equal(run('player.magnet'),beforeBlessing.magnet*1.75);else if(blessingId==='greasedServos')assert.equal(run('player.speed'),beforeBlessing.speed*1.2);else if(blessingId==='copperPlate')assert.equal(run('player.armor'),beforeBlessing.armor+1);
run('level=5;xp=need;tick(.01)');assert.equal(run('state'),'blessing','level six opens another blessing');assert.equal(run(`offeredBlessings.some(b=>b.id==='${blessingId}')`),false,'chosen blessing is not offered again this run');assert.equal(run('new Set(offeredBlessings.map(b=>b.id)).size'),3);
elements.get('choices').children.at(-1).onclick();assert.equal(run('state'),'playing');assert.equal(run('player.blessings.size'),1,'skipping does not grant a blessing');run('level=8;xp=need;tick(.01)');assert.equal(run('state'),'blessing','level nine opens the final scheduled blessing');assert.equal(run('new Set(offeredBlessings.map(b=>b.id)).size'),3);assert.equal(run('offeredBlessings.some(b=>b.id===\''+blessingId+'\')'),false,'previously chosen blessing remains excluded at level nine');run('chooseBlessing(offeredBlessings[0].id,offerVersion)');assert.equal(run('player.blessings.size'),2,'level-nine choice applies once per attempt');run('reset()');assert.equal(run('player.blessings.size'),0,'blessings clear on retry');assert.equal(run('player.damage'),22);assert.equal(run('profile.bolts'),1,'blessings never enter persistent profile');
assert.equal(run('SKILLS.length'),52);
assert.equal(run('new Set(SKILLS.map(s=>s.id)).size'),52);
fresh();assert.equal(run('availableSkills().length'),13,'only roots offered initially');
for(const root of run('SKILLS.filter(s=>!s.parent).map(s=>s.id)')){
 fresh();assert.equal(run(`SKILLS.filter(s=>s.parent==='${root}').length`),3,'each root opens three children');
 assert.equal(run(`availableSkills().some(s=>s.parent==='${root}')`),false);
 run(`state='upgrade';offeredSkills=[SKILLS.find(s=>s.id==='${root}')];offerVersion++;chooseSkill('${root}',offerVersion)`);
 assert.equal(run(`availableSkills().filter(s=>s.parent==='${root}').length`),3);
 assert.equal(run(`availableSkills().some(s=>s.id==='${root}')`),false,'selected node removed');
 const child=run(`availableSkills().find(s=>s.parent==='${root}').id`);
 run(`state='upgrade';offeredSkills=[SKILLS.find(s=>s.id==='${child}')];offerVersion++;chooseSkill('${child}',offerVersion)`);
 assert.equal(run(`availableSkills().some(s=>s.id==='${child}')`),false);
 assert.equal(run(`availableSkills().filter(s=>s.parent==='${root}').length`),2,'sibling branches remain combinable');
}
fresh();run("state='upgrade';offeredSkills=[SKILLS.find(s=>s.id==='titan')];offerVersion++");
assert.equal(run("chooseSkill('titan',offerVersion)"),false,'locked child rejected even with forged offer');
fresh();acquire('damage');assert.equal(run('player.damage'),44);assert.ok(Math.abs(run('player.rate')-.32)<1e-9);assert.equal(acquire('damage'),false);
acquire('rate');assert.ok(Math.abs(run('player.damage')-44)<1e-9);assert.ok(Math.abs(run('player.rate')-.32/3)<1e-9);
fresh();acquire('armor');acquire('titan');assert.equal(run('player.maxHp'),300);assert.equal(run('player.hp'),300);assert.ok(Math.abs(run('player.speed')-190/1.25/1.5)<1e-9);assert.ok(Math.abs(run('reloadDuration()')-2.1)<1e-9);
run('updateHUD()');assert.equal(elements.get('health')['aria-valuemax'],'300','expanded max integrity is announced');assert.equal(elements.get('health-fill').style.width,'100%','expanded integrity renders full meter');assert.equal(elements.get('health-value').textContent,'300 / 300');
fresh();acquire('armor');acquire('salvage');run('player.hp=40');
for(let i=0;i<19;i++)run('damageEnemy({x:700,y:300,hp:1,r:10},1)');assert.equal(run('player.hp'),40);
run('damageEnemy({x:700,y:300,hp:1,r:10},1)');assert.equal(run('player.hp'),60,'one battery per 20 kills');
run('damageEnemy({x:700,y:300,hp:1,r:10},1)');assert.equal(run('player.hp'),60);
fresh();acquire('magnet');acquire('killAmmo');assert.equal(run('magazineSize()'),72);assert.equal(run('player.ammo'),24,'capacity does not create free ammo');
for(let i=0;i<10;i++)run('damageEnemy({x:700,y:300,hp:1,r:10},1)');assert.equal(run('player.ammo'),25);
fresh();acquire('armor');acquire('regen');run('player.hp=40;tick(3)');assert.equal(run('player.hp'),40);run('tick(.5)');assert.equal(run('player.hp'),41);run("keys.add('d');tick(.5)");assert.equal(run('player.hp'),41);
fresh();acquire('magnet');acquire('repair');run('player.hp=50');assert.equal(run('startReload()'),false,'full clip cannot farm healing');
run('fireWeapon();startReload();tickStatuses(reloadDuration())');assert.ok(Math.abs(run('player.hp')-(50+5/24))<1e-9,'partial reload repair is proportional');assert.equal(run('player.ammo'),24);
fresh();acquire('freeze');acquire('coldReload');run('fireWeapon();enemies=[{x:player.x+50,y:player.y,hp:30,r:12,speed:30}];startReload();tickStatuses(.01)');assert.equal(run('enemies[0].slowTime||0'),0);
run('tickStatuses(player.reloadTime-.01)');assert.equal(run('enemies[0].slowTime||0'),0);run('tickStatuses(.01)');assert.ok(run('enemies[0].slowTime')>3.9,'cold pulse occurs at reload completion');
// Each weapon consumes rounds per pulse, not per pellet, and cannot fire during reload.
for(const id of run('Object.keys(WEAPONS)')){
 fresh(id);const cap=run('magazineSize()'),duration=run('reloadDuration()');
 run('emitProjectiles(0)');assert.equal(run('player.ammo'),cap-1,id+' consumes exactly one round');
 assert.equal(run('bullets.length'),run('runWeapon.pellets'));
 run('player.ammo=1;player.reloadTime=0;emitProjectiles(0)');assert.equal(run('player.ammo'),0);assert.equal(run('player.reloadTime'),duration);
 const count=run('bullets.length');run('fireWeapon()');assert.equal(run('bullets.length'),count,'reload blocks shots');
 run('pause();globalThis.freezeReload=player.reloadTime;tick(10)');assert.equal(run('player.reloadTime'),run('freezeReload'),'pause freezes reload');run('pause()');
 run('tickStatuses(player.reloadTime/2)');assert.equal(run('player.ammo'),0,'no premature refill');run('tickStatuses(player.reloadTime)');assert.equal(run('player.ammo'),cap);
 run('draw()');
}
assert.ok(run('AMMO.rocket[1]>AMMO.sniper[1]&&AMMO.sniper[1]>AMMO.machine[1]'),'heavy reloads longer');
fresh('burst');run('player.ammo=2;firing=true;fireWeapon();tick(.08)');assert.equal(run('bullets.length'),2);assert.equal(run('player.ammo'),0);assert.ok(run('player.reloadTime')>0);assert.equal(run('burstQueue.length'),0,'partial burst ends at empty clip');run('tick(.08)');assert.equal(run('bullets.length'),2);
fresh('shotgun');acquire('rate');acquire('extra');run('fireWeapon()');assert.equal(run('bullets.length'),10);assert.equal(run('player.ammo'),5,'multishot spends one shell');
fresh();acquire('damage');acquire('crit');run('for(let i=0;i<5;i++)emitProjectiles(0)');assert.equal(run('bullets[3].damage'),44);assert.equal(run('bullets[4].damage'),132);
fresh();acquire('damage');acquire('bossHunter');run('spawnBoss();damageEnemy(boss,10)');assert.equal(run('boss.hp'),620);
fresh();acquire('damage');acquire('finisher');run('globalThis.target={x:700,y:300,hp:10,maxHp:30,r:10};damageEnemy(target,2)');assert.equal(run('target.hp'),4);
fresh();acquire('burn');acquire('freeze');acquire('thermal');acquire('ignition');acquire('afterburn');run('enemies=[{x:700,y:300,hp:10000,maxHp:10000,r:10,speed:0}];applyStatus(enemies[0],{damage:20,vx:1,vy:0});tickStatuses(.5)');assert.equal(run('enemies[0].hp'),9955);assert.equal(run('enemies[0].burnTime'),8.5);
for(const id of ['emergency','retaliation','overload']){
 fresh();acquire(id==='emergency'?'dash':'blast');acquire(id);run('hurtPlayer(1)');assert.equal(run(`player.hitCooldowns.${id}`),120);
 run(`player.inv=0;hurtPlayer(1)`);assert.equal(run(`player.hitCooldowns.${id}`),120,'second hit cannot reset cooldown');
 run(`pause();tick(20)`);assert.equal(run(`player.hitCooldowns.${id}`),120,'pause freezes trigger cooldown');run('pause();tickStatuses(119.9)');assert.ok(run(`player.hitCooldowns.${id}`)>.09);run('tickStatuses(.1);player.inv=0;hurtPlayer(1)');assert.equal(run(`player.hitCooldowns.${id}`),120,'trigger rearmed after two minutes');
 fresh();acquire(id);run('player.hp=1;hurtPlayer(1000)');assert.equal(run('state'),'over');assert.equal(run(`player.hitCooldowns.${id}`),0,'lethal hit cannot trigger or resurrect');
}
fresh();acquire('shock');acquire('shield');run('hurtPlayer(100)');assert.equal(run('player.hp'),100);assert.equal(run('player.shieldTimer'),120);run('tickStatuses(119)');assert.equal(run('player.shieldReady'),false);run('tickStatuses(1)');assert.equal(run('player.shieldReady'),true);
fresh();acquire('dash');assert.equal(run('activateDash()'),true);assert.equal(run('player.inv'),0);run('pause();tick(2)');assert.equal(run('player.dashCooldown'),4);run('pause();tickStatuses(4)');assert.equal(run('player.dashCooldown'),0);
fresh('disc');acquire('rate');assert.equal(run("availableSkills().some(s=>s.id==='ricochet')"),false);
// Acquire every compatible node, then exercise all weapons/statuses/boss and reset.
for(const id of run('Object.keys(WEAPONS)')){
 fresh(id);run("for(const s of SKILLS)if(s.available())s.apply();player.inv=100000;clock=59.9");
 for(let i=0;i<100;i++){
  if(['upgrade','reward','experiment','blessing','relic'].includes(run('state')))run("el('choices').children.at(-1).onclick()");
  run('firing=true;tick(.04);draw()');
 }
 assert.ok(run('Number.isFinite(player.hp)&&Number.isFinite(player.damage)&&player.ammo>=0&&player.ammo<=magazineSize()'),id+' valid combined state');
 assert.ok(run('bullets.length<=400&&effects.length<=150'),id+' bounded effects');
}
fresh();assert.equal(run('player.acquired.size'),0);assert.equal(run('player.ammo'),24);assert.equal(run('player.reloadTime'),0);assert.equal(run('player.hitCooldowns.retaliation'),0);
run(`const savedRandom=Math.random;try{Math.random=()=>{throw Error('Render used combat RNG');};draw();}finally{Math.random=savedRandom;}`);
console.log('52 unique tree nodes, prerequisites, multiplicative costs, conditional effects, 120s timers, all magazines/reloads, bursts, statuses, rendering and reset passed.');
fresh();run('upgrade()');
assert.equal(elements.get('overlay')['data-mode'],'upgrade');
for(const card of elements.get('module-options').children){const id=card['data-skill'];assert.ok(fs.existsSync('assets/skills/'+id+'.svg'));assert.equal(card.children[0].src,'assets/skills/'+id+'.svg');}
const first=run('offeredSkills[0].id');fire('window:keydown',{key:'1',repeat:false,preventDefault(){}});assert.equal(run('player.acquired.has('+JSON.stringify(first)+')'),false,'preview never installs a module');assert.equal(elements.get('module-detail').children[1].children.length,5,'detail includes full root and three evolutions');fire('window:keydown',{key:'Enter',repeat:false,preventDefault(){}});assert.equal(run('player.acquired.has('+JSON.stringify(first)+')'),true,'Enter installs selected module');
for(const id of run('SKILLS.map(s=>s.id)'))assert.ok(fs.existsSync('assets/skills/'+id+'.svg'),id+' icon exists');
console.log('Upgrade card artwork, branch previews, mode and keyboard selection passed.');

// Proportional reloads: fractions use the modified full capacity/time.
for(const id of run('Object.keys(WEAPONS)')){
 fresh(id);run('player.magazineMult=2;player.reloadMult=2;player.ammo=magazineSize()/2');
 const half=run('reloadDuration()/2');assert.equal(run('missingReloadDuration()'),half);
 run('startReload()');assert.equal(run('player.reloadTotal'),half);run('tickStatuses(player.reloadTime)');assert.equal(run('player.ammo'),run('magazineSize()'));
 run('player.ammo=magazineSize()-1;startReload()');assert.ok(Math.abs(run('player.reloadTotal')-run('reloadDuration()/magazineSize()'))<1e-9);
}
fresh();run('player.ammo=12;updateHUD()');assert.ok(elements.get('reload-status').textContent.includes('0.7 s'));
// One boss at a time: due encounters wait rather than replacing a living boss.
fresh();run('clock=59.99;spawn=.04;player.inv=10000;tick(.02)');assert.equal(run('boss.id'),'brute');assert.equal(run('enemies.length'),2);assert.ok(run('spawn<.04'),'wave countdown continues when boss arrives');
run('tick(.1)');assert.equal(run('enemies.length'),17,'ordinary wave joins boss encounter');assert.ok(run("el('boss-support').textContent.includes('ONDAS COMUNS ATIVAS')"));
run('damageEnemy(boss,99999);tick(.01)');collectBossChest();assert.equal(run('state'),'relic');const frozenWave=run('spawn');run('tick(1)');assert.equal(run('spawn'),frozenWave,'reward still pauses all simulation');elements.get('choices').children.at(-1).onclick();run('tick(.01)');assert.ok(run('spawn')<frozenWave,'wave countdown resumes after reward');
const bossMinionSpecs=[['brute','runner','CORREDOR',2],['scrapper','gunner','ATIRADOR',2],['coil','conductor','RAJADA',3]];
for(let i=0;i<bossMinionSpecs.length;i++){
 const [id,type,badge,count]=bossMinionSpecs[i];fresh();run(`bossIndex=${i};spawnBoss();player.inv=10000`);assert.equal(run('boss.id'),id);assert.equal(run('enemies.length'),count,`${id} summons its specified minions`);assert.ok(run(`enemies.every(z=>z.minionOwner==='${id}'&&z.minionType==='${type}'&&z.minionBadge==='${badge}')`),`${id} minion behavior and player-facing role label are distinct`);assert.ok(run(`feedback.at(-1).text.includes(BOSS_MINIONS.${id}.role)`),`${id} warning names the minion role`);
 if(type!=='runner'){for(let frame=0;frame<80&&run('hostile.length')===0;frame++)run('tick(.04)');assert.ok(run('hostile.length>0'),`${id} minions use ranged attacks`);assert.ok(run("hostile.every(b=>b.source==='boss-minion'&&b.damage<12)"),`${id} ranged attacks use their own low damage and visual source`);}
}
fresh();run('enemies=Array.from({length:69},()=>createEnemy(800,300));spawnBoss()');assert.equal(run('enemies.length'),71,'boss minions still arrive with a full horde');
fresh();run("spawnBoss();boss.hp=1;boss.x=550;boss.y=300;boss.speed=0;player.x=500;player.y=300;enemies[0].x=600;enemies[0].y=300;enemies[0].hp=1;bullets=[{x:500,y:300,vx:5000,vy:0,life:1,damage:1000,radius:4,remaining:4,hit:new Set(),returning:false,bounces:0}];tick(.02)");assert.equal(run('bossDefeated'),true,'piercing shot defeats the boss first');assert.equal(run('enemies.length'),0);assert.equal(run('kills'),0,'a removed minion cannot die later from the same piercing shot');assert.equal(run('gems.length+scrap.length'),0,'removed minions award no posthumous XP or salvage');
fresh();run('globalThis.common=createEnemy(player.x+400,player.y);enemies=[common];spawnBoss();damageEnemy(boss,99999)');assert.equal(run('enemies.length'),1,'boss defeat clears its own minions and preserves already-present common enemies');assert.equal(run('enemies[0].minionOwner'),undefined);
fresh();run('clock=60;player.inv=10000;tick(.01)');assert.equal(run('boss.id'),'brute');
run('clock=240;tick(.01)');assert.equal(run('boss.id'),'brute');assert.equal(run('bossIndex'),1);
run('damageEnemy(boss,99999);tick(.01)');collectBossChest();assert.equal(run('state'),'relic');assert.equal(run('bossKills'),1);
run("el('choices').children.at(-1).onclick();tick(.01)");assert.equal(run('boss.id'),'scrapper');assert.equal(run('bossIndex'),2);
run('damageEnemy(boss,99999);tick(.01)');collectBossChest();run("el('choices').children.at(-1).onclick();clock=419;tick(.01)");assert.equal(run('bossIndex'),2,'third boss not early');
run('clock=420;tick(.01)');assert.equal(run('boss.id'),'coil');assert.equal(run('bossIndex'),3);
run('damageEnemy(boss,99999);tick(.01)');collectBossChest();run("el('choices').children.at(-1).onclick();tick(.01)");assert.equal(run('bossKills'),3);assert.equal(run('bossIndex'),3);
run('clock=599.98;tick(.01)');assert.equal(run('bossIndex'),3,'recurring boss waits for the next schedule mark');
run('clock=600;tick(.01)');assert.equal(run('boss.id'),'brute','first boss returns after the opening cycle');assert.equal(run('boss.maxHp'),1105,'recurring boss health scales by cycle');assert.equal(run('bossIndex'),4);
// Scrapper telegraphs pools before damage; leaving circles avoids the hazard.
fresh();run('bossIndex=1;spawnBoss();boss.timer=0;tickBoss(.01)');assert.equal(run('boss.phase'),'tellMortar');assert.equal(run('hazards.length'),3);
run('tickHazards(1)');assert.equal(run('player.hp'),100,'warning causes no damage');run('tickHazards(.42)');assert.equal(run('player.hp'),88,'pool activates after warning');
run('player.inv=0;player.x+=500;tickHazards(.1)');assert.equal(run('player.hp'),88,'outside pool is safe');
run('pause();globalThis.hazardDelay=hazards[0].life;tick(5)');assert.equal(run('hazards[0].life'),run('hazardDelay'),'pause freezes hazards');run('pause();draw()');
run('damageEnemy(boss,99999)');assert.equal(run('hazards.length'),0,'boss death clears hazards');
// Coil alternates an expanding ground ring with a five-shot aimed fan.
fresh();run('bossIndex=2;spawnBoss();boss.timer=0;tickBoss(.01)');assert.equal(run('boss.phase'),'tellPulse');assert.equal(run('hazards.length'),0);
run('boss.timer=0;tickBoss(.01)');assert.equal(run('hazards[0].type'),'ring');run('player.x=boss.x+40;player.y=boss.y;tickHazards(.1)');assert.equal(run('player.hp'),86,'expanding ring damages crossing band');
run('player.inv=0;player.x=boss.x;tickHazards(.1)');assert.equal(run('player.hp'),86,'ring center is safe');
run('boss.timer=0;tickBoss(.01)');assert.equal(run('boss.phase'),'tellFan');assert.equal(run('hostile.length'),0);run('draw();boss.timer=0;tickBoss(.01)');assert.equal(run('hostile.length'),5);assert.ok(run('hostile.every(b=>b.color==="#c3b6ed")'));
run('damageEnemy(boss,99999)');assert.equal(run('hostile.length'),0);assert.equal(run('hazards.length'),0);
fresh();assert.equal(run('bossIndex'),0);assert.equal(run('bossKills'),0);assert.equal(run('hazards.length'),0);
// Exercise both specialists over multiple attack cycles, movement and pause-safe state.
for(const index of [1,2]){
 fresh();run(`bossIndex=${index};spawnBoss();player.inv=10000`);
 for(let i=0;i<600;i++)run('tickBoss(.04);tickHazards(.04);draw()');
 assert.ok(run('Number.isFinite(boss.x)&&Number.isFinite(boss.y)&&hazards.length<=60'));
}
console.log('Proportional reloads, three boss schedule, delayed pools, electric rings/fans, warning safety, pause and cleanup passed.');
// Readable tree labels, spatial language and dedicated cooldown HUD.
fresh();assert.equal(run('Object.keys(TREE_INFO).length'),13);
assert.equal(run('SKILLS.some(s=>/\\bpx\\b/.test(s.benefit+s.cost))'),false,'no implementation units in upgrade copy');
acquire('damage');acquire('rate');assert.ok(Math.abs(run('player.damage')-44)<1e-9);assert.ok(Math.abs(run('player.rate')-.32/3)<1e-9);
fresh();acquire('shield');acquire('dash');acquire('emergency');acquire('retaliation');acquire('overload');run('updateHUD()');
assert.equal(elements.get('cooldowns').children.length,5,'all acquired timed modules visible');
assert.ok(run('cooldownNodes.every(n=>n.status.textContent==="PRONTO")'));
run('hurtPlayer(1);updateHUD()');assert.equal(run('cooldownNodes[0].status.textContent'),'120 s');
run('player.inv=0;hurtPlayer(1);updateHUD()');assert.equal(run('cooldownNodes.find(n=>n.item["aria-label"]==="SOBRECARGA REATIVA").status.textContent'),'ATIVO');
run('tickStatuses(60);updateHUD()');assert.equal(run('cooldownNodes[0].track["aria-valuenow"]'),'50');assert.equal(run('cooldownNodes[0].status.textContent'),'60 s');
run('pause();tick(10);updateHUD()');assert.equal(run('cooldownNodes[0].status.textContent'),'60 s');run('pause();tickStatuses(60);updateHUD()');assert.ok(run('cooldownNodes.every(n=>n.status.textContent==="PRONTO")'));
fresh();assert.equal(elements.get('cooldowns').children.length,0,'reset removes old cooldown badges');
console.log('Gentler multiplicative costs, named trees, player-facing area descriptions and cooldown HUD passed.');

// Static approved identity at reduced size, without changing player state.
fresh();run("protSprite={complete:true,naturalWidth:64};globalThis.spriteDraws=[];ctx.drawImage=(...args)=>spriteDraws.push(args);drawRobot()");
assert.equal(run('spriteDraws.length'),1);
assert.equal(run('spriteDraws[0][3]'),58);assert.equal(run('spriteDraws[0][4]'),72);
run('player.walkPhase=17;player.stride=1;drawRobot()');
assert.equal(run('spriteDraws[1][3]'),58);assert.equal(run('spriteDraws[1][4]'),72,'walking uses same static pose');
assert.equal(run('player.maxHp'),100);assert.equal(run('player.speed'),190);
assert.ok(fs.existsSync('assets/robots/prot-0001-static.png'));
assert.ok(fs.readFileSync('style.css','utf8').includes('height:100dvh;min-height:0;'));
assert.ok(fs.readFileSync('style.css','utf8').includes('border:0!important;box-shadow:none!important;outline:none!important;'));
console.log('Static PROT image at 58x72, identity asset, reduced scale and frameless viewport checks passed.');

// Pause diagnosis reflects modified run values and never advances or modifies combat.
fresh();acquire('damage');acquire('magnet');run('player.ammo=7;pause();globalThis.statsBefore={clock,damage:player.damage,hp:player.hp,ammo:player.ammo};tick(5)');
assert.equal(run('clock'),run('statsBefore.clock'));assert.equal(run('player.damage'),run('statsBefore.damage'));assert.equal(run('player.ammo'),7);
assert.equal(elements.get('choices').children.length,1,'pause shows one diagnosis panel');
const diagnosis=elements.get('choices').children[0];assert.equal(diagnosis['aria-label'],'Diagnóstico da tentativa');
const values=diagnosis.children.find(n=>n.className==='run-attributes').children.map(item=>item.textContent);
assert.equal(values[values.indexOf('Dano direto por projétil')+1],'44','diagnosis uses the modified projectile damage');
assert.equal(values[values.indexOf('Carregador')+1],'7 / 24','diagnosis shows current ammo and capacity');
assert.equal(values[values.indexOf('Atração de itens')+1],'285 px','diagnosis includes the installed magnet modifier');
assert.ok(diagnosis.children.find(n=>n.className==='run-modules').textContent.includes('CAMPO MAGNÉTICO'),'installed modules are named');
run('pause();reset();pause()');assert.ok(elements.get('choices').children[0].children.find(n=>n.className==='run-modules').textContent.includes('Nenhum módulo temporário.'),'retry diagnosis clears previous build');
run('pause();upgrade()');assert.ok(elements.get('choices').children.every(item=>item.className!=='run-stats'),'diagnosis does not leak into upgrade choices');
console.log('Pause diagnosis reflects build modifiers, freezes combat and clears on retry.');
fresh();run('player.frenzy=6;pause()');const overloadValues=elements.get('choices').children[0].children.find(n=>n.className==='run-attributes').children.map(item=>item.textContent);assert.equal(overloadValues[overloadValues.indexOf('Intervalo entre disparos')+1],'0,11 s','diagnosis reflects the active overload fire interval');run('pause();aim.active=true;fireWeapon()');assert.ok(Math.abs(run('shot')-.32/3)<1e-9,'weapon and diagnosis share the effective fire interval');

// The garage manual reads the canonical catalog without granting modules or spending materials.
fresh();const beforeManual=run('JSON.stringify({profile,damage:player.damage,acquired:[...player.acquired],state})');run('renderCompendium()');
assert.equal(run('JSON.stringify({profile,damage:player.damage,acquired:[...player.acquired],state})'),beforeManual,'consulting catalog is read only');
const manual=elements.get('module-compendium');assert.equal(manual.children.length,22,'manual includes thirteen trees, blessings, experiments and six chassis');
const manualCards=manual.children.flatMap(group=>group.children[1].children);assert.equal(manualCards.length,98);assert.equal(new Set(manualCards.map(card=>card['data-module'])).size,98,'all catalog entries appear once');
assert.ok(manualCards.find(card=>card['data-module']==='rivetMatrix'),'new physical device has its own compendium entry');
assert.ok(manualCards.find(card=>card['data-module']==='reloadBlade'),'reload-window device has its own compendium entry');
const pierceManual=manualCards.find(card=>card['data-module']==='pierce');assert.equal(pierceManual.children[3].textContent,'REQUISITO: NÚCLEO CRIOGÊNICO');
assert.ok(manualCards.find(card=>card['data-module']==='ricochet').children[2].textContent.includes(run("SKILLS.find(s=>s.id==='ricochet').cost")),'manual uses current canonical costs');
run('renderCompendium()');assert.equal(manual.children.length,22,'reopening catalog replaces instead of duplicating entries');
console.log('Garage compendium covers82 modules and16 exclusive boss relics without mutating the run or profile.');
assert.ok(manualCards.find(card=>card['data-module']==='ricochet').children[3].textContent.includes('projéteis de retorno; exige ao menos uma arma sem retorno'),'manual explains mixed-arsenal ricochet eligibility');

// One run-only reroll replaces level-up choices without granting a skill or advancing combat.
fresh();run('upgrade();globalThis.oldOffer=offeredSkills.map(s=>s.id);globalThis.oldOfferVersion=offerVersion;globalThis.beforeReroll=JSON.stringify({clock,level,xp,need,profile,damage:player.damage,acquired:[...player.acquired]})');
const oldCard=elements.get('module-options').children[0];let rerollPrevented=false;fire('window:keydown',{key:'q',repeat:true,preventDefault(){rerollPrevented=true}});assert.equal(run('rerollsRemaining'),1,'holding Q cannot spend the charge');
fire('window:keydown',{key:'q',repeat:false,preventDefault(){rerollPrevented=true}});assert.equal(rerollPrevented,true);assert.equal(run('rerollsRemaining'),0);assert.equal(run('state'),'upgrade');assert.equal(run('offeredSkills.length'),3);assert.ok(run('offeredSkills.every(s=>s.available()&&!oldOffer.includes(s.id))'),'replacement choices are distinct eligible modules');
assert.equal(run('JSON.stringify({clock,level,xp,need,profile,damage:player.damage,acquired:[...player.acquired]})'),run('beforeReroll'),'reroll changes neither progress nor attributes/materials');oldCard.onclick();assert.equal(run('state'),'upgrade','discarded card callback is stale');assert.equal(run('rerollUpgrade(oldOfferVersion)'),false);assert.equal(run('rerollUpgrade(offerVersion)'),false,'charge cannot be spent twice');
assert.equal(elements.get('choices').children.at(-2).disabled,true);fire('window:keydown',{key:'1',repeat:false,preventDefault(){}});assert.equal(run('state'),'upgrade','numeric key previews replacement');fire('window:keydown',{key:'Enter',repeat:false,preventDefault(){}});assert.equal(run('state'),'playing','Enter installs replacement');
run('reset()');assert.equal(run('rerollsRemaining'),1,'retry restores one run-only charge');
for(const source of ['boss']){run(`upgrade('${source}')`);assert.equal(run('rerollUpgrade(offerVersion)'),false,'boss reward cannot consume level-up reroll');}
run('offerBlessing()');assert.equal(run('rerollUpgrade(offerVersion)'),false);run('offerExperiment()');assert.equal(run('rerollUpgrade(offerVersion)'),false);
fresh();run("for(const s of SKILLS)if(!['damage','rate'].includes(s.id))player.acquired.add(s.id);upgrade()");assert.equal(run('offeredSkills.length'),2);assert.equal(run('rerollUpgrade(offerVersion)'),false,'exhausted pool cannot replace options with fewer or duplicate choices');assert.equal(run('rerollsRemaining'),1,'failed renewal keeps its charge');
console.log('Limited level-up reroll protects eligibility, stale offers, progress, exhausted pools and retry.');
fresh();run('pause()');assert.equal(run('rerollUpgrade(offerVersion)'),false,'paused combat cannot renew an offer');assert.equal(run('rerollsRemaining'),1);

// Chassis specialization is a single run-only choice at level ten.
for(const robot of ['prot','bastion']){
 fresh();run(`openGarage();selectRobot('${robot}');reset();spawn=10000;level=9;xp=need;tick(.01)`);
 assert.equal(run('state'),'specialization');assert.equal(run('offeredSpecializations.length'),3);assert.ok(run('offeredSpecializations.every(s=>SPECIALIZATIONS[runRobot.id].includes(s))'));
 const specVersion=run('offerVersion'),specId=run('offeredSpecializations[0].id'),specTime=run('clock'),profileBeforeSpec=run('JSON.stringify(profile)');run('tick(2)');assert.equal(run('clock'),specTime);assert.equal(run('rerollUpgrade(offerVersion)'),false);
 fire('window:keydown',{key:'1',repeat:false,preventDefault(){}});assert.equal(run('player.specialization'),specId);assert.equal(run('state'),'playing');assert.equal(run(`chooseSpecialization('${specId}',${specVersion})`),false);assert.equal(run('JSON.stringify(profile)'),profileBeforeSpec);
 run('reset()');assert.equal(run('player.specialization'),null);assert.equal(run('specializationOffered'),false);
}
fresh();run('player.specialization="predatorMark";globalThis.markA=createEnemy(900,300);globalThis.markB=createEnemy(950,300);markA.hp=markB.hp=100;damageEnemy(markA,10)');assert.equal(run('markA.hp'),90,'first hit applies mark without bonus');run('damageEnemy(markA,10)');assert.equal(run('markA.hp'),77.5);run('damageEnemy(markB,10);damageEnemy(markA,10)');assert.equal(run('markA.hp'),67.5,'switching targets transfers mark');run('tickStatuses(3);damageEnemy(markA,10)');assert.equal(run('markA.hp'),57.5,'expired mark has no bonus');
fresh();run('player.specialization="tailDecoy";globalThis.preHitX=player.x;hurtPlayer(1,player.x-100,player.y)');assert.ok(run('player.decoy&&player.decoy.x===preHitX'),'echo stays at pre-knockback location');run('tickStatuses(2)');assert.equal(run('player.decoy'),null);
fresh();run('player.specialization="nineLives";player.hp=21;enemies=[createEnemy(player.x+60,player.y)];hurtPlayer(2,player.x-100,player.y)');assert.equal(run('player.hp'),19);assert.ok(run('enemies[0].stunTime>=.5'),'crossing critical health interrupts nearby chasers');assert.ok(run('player.specializationCooldown>0'));
fresh();run('player.specialization="magneticBrake";globalThis.brakeX=player.x+60;hostile=[{x:brakeX,y:player.y,vx:100,vy:0,life:2,r:1}];tick(.1)');assert.ok(Math.abs(run('hostile[0].x-brakeX')-7.5)<1e-8);assert.equal(run('hostile[0].vx'),100,'brake never changes base velocity');
fresh();run('player.specialization="threatReader";spawnBoss();boss.x=player.x+160;boss.y=player.y;boss.speed=0;boss.timer=0;tickBoss(.01)');assert.ok(Math.abs(run('boss.timer')-1.14)<1e-8,'nearby warning is extended once');run('tickBoss(.1)');assert.ok(Math.abs(run('boss.timer')-1.04)<1e-8,'warning does not extend again each frame');
console.log('Chassis specializations protect level-ten choice, pause, reset and conditional effects.');

// All specialization slots, refusal, typed damage sources and timed warning synchronization.
for(const robot of ['prot','bastion'])for(const slot of [0,1,2]){fresh();run(`openGarage();selectRobot('${robot}');reset();level=9;xp=need;spawn=10000;tick(.01)`);const expectedSpec=run(`offeredSpecializations[${slot}].id`);fire('window:keydown',{key:String(slot+1),repeat:false,preventDefault(){}});assert.equal(run('player.specialization'),expectedSpec);}
fresh();run('level=9;xp=need;tick(.01)');elements.get('choices').children.at(-1).onclick();assert.equal(run('player.specialization'),null);assert.equal(run('offerSpecialization()'),false,'refusal consumes only specialization opportunity');
fresh();run('player.specialization="grounding";player.armor=1;hurtPlayer(20,0,0,"boss-hazard")');assert.equal(run('player.hp'),87,'grounding reduces hazard amount before armor');run('player.inv=0;hurtPlayer(20,0,0)');assert.equal(run('player.hp'),68,'contact keeps normal armor damage');
fresh();run('player.specialization="threatReader";bossIndex=1;spawnBoss();boss.x=player.x+160;boss.y=player.y;boss.speed=0;boss.timer=0;enemies=[];tickSpecialBoss(.01)');assert.ok(Math.abs(run('boss.timer')-1.68)<1e-8);assert.ok(run('hazards.every(h=>Math.abs(h.delay-boss.timer-.01)<1e-8)'),'mortar danger waits through extended warning');const safeHp=run('player.hp');run('tickHazards(1.5)');assert.equal(run('player.hp'),safeHp,'extended warning remains harmless');
fresh();run('player.specialization="tailDecoy";player.skills.shield=1;player.shieldReady=true;hurtPlayer(20,0,0)');assert.equal(run('player.decoy'),null,'absorbed damage does not trigger echo');
fresh();run('player.specialization="tailDecoy";player.inv=0;hurtPlayer(999,0,0)');assert.equal(run('player.decoy'),null,'lethal damage does not trigger echo');
fresh();run('player.specialization="nineLives";player.hp=21;enemies=[createEnemy(player.x+60,player.y,"expolice")];hurtPlayer(2,player.x-100,player.y)');assert.ok(run('enemies[0].stunTime>=.5'),'critical-health pulse also affects common ranged enemies');
for(const spec of [null,'threatReader']){fresh();run(`player.specialization=${JSON.stringify(spec)};bossIndex=1;spawnBoss();boss.x=player.x+160;boss.y=player.y;boss.speed=0;boss.timer=0;enemies=[]`);for(let i=0;i<50;i++){const hp=run('player.hp');run('tickBoss(.04);globalThis.stillWarning=boss.phase==="tellMortar";tickHazards(.04)');if(run('stillWarning'))assert.equal(run('player.hp'),hp,'pool must never damage while the boss warning is active');}}

// Offscreen circular arrivals respect camera offsets and slow smoothly near the robot.
for(const [w,h] of [[1000,600],[360,800],[2400,400]]){fresh();run(`width=${w};height=${h};camera.x=player.x-width*.7;camera.y=player.y-height*.3;enemies=[];spawnCircularWave(15)`);assert.ok(run('enemies.every(z=>z.x+50<camera.x||z.x-50>camera.x+width||z.y+60<camera.y||z.y-60>camera.y+height)'),'whole zombie silhouette spawns outside viewport');}
run('clock=4.99;updateHUD()');assert.equal(elements.get('combat-controls').hidden,false);run('clock=5;updateHUD()');assert.equal(elements.get('combat-controls').hidden,true);assert.equal(elements.get('dash-hint').hidden,true);acquire('dash');run('updateHUD()');assert.equal(elements.get('dash-hint').hidden,false);run('reset()');assert.equal(elements.get('combat-controls').hidden,false);assert.equal(elements.get('dash-hint').hidden,true);

// Full waves keep arriving while fleeing, and the map never discards distant enemies.
fresh();run('player.inv=100000;globalThis.remoteEnemy=createEnemy(player.x-50000,player.y);enemies=[remoteEnemy];tick(.01)');assert.ok(run('enemies.includes(remoteEnemy)'),'distance alone never deletes living enemies');
run('enemies=Array.from({length:160},()=>createEnemy(player.x-50000,player.y));spawn=0;tick(.01)');assert.equal(run('enemies.length'),160,'director preserves over-cap survivors without spawning more');
for(const [x,y] of [[50000,0],[-50000,0],[0,50000],[50000,-50000]]){const pos=run(`minimapPoint(player.x+${x},player.y+${y},160,100,7)`);assert.ok(pos.x>=7&&pos.x<=153&&pos.y>=7&&pos.y<=93,'every far marker remains inside map edge');}
assert.ok(run('minimapPoint(player.x+100,player.y,160,100).x<minimapPoint(player.x+700,player.y,160,100).x'),'approaching markers move inward');
fresh();run('bossIndex=1;spawnBoss();enemies=[];boss.x=player.x+600;boss.y=player.y;boss.phase="tellMortar";boss.timer=2;globalThis.oldBossX=boss.x;tickSpecialBoss(.1)');assert.ok(run('boss.x<oldBossX'),'Scrapper follows during warning');run('boss.x=player.x+100;globalThis.oldBossX=boss.x;tickSpecialBoss(.1)');assert.ok(run('boss.x>oldBossX'),'Scrapper retreats to retain distance');run('boss.x=player.x+210;globalThis.oldBossX=boss.x;tickSpecialBoss(.1)');assert.equal(run('boss.x'),run('oldBossX'),'Scrapper holds its preferred distance band');
fresh();run('clock=0;spawn=0;tick(.01);globalThis.firstWaveInterval=spawn;clock=500;spawn=0;tick(.01)');assert.ok(run('spawn<firstWaveInterval'),'time reduces interval between full fifteen-enemy waves');
fresh();run('enemies=[createEnemy(100,100),createEnemy(50000,50000)];buildCollisionGrid()');assert.equal(run('bulletCandidates(90,100,110,100,4).length'),1,'projectile broad phase excludes distant horde');run('enemies[0].x=400;indexTarget(enemies[0])');assert.ok(run('bulletCandidates(390,100,410,100,4).includes(enemies[0])'),'knocked targets remain indexed at their new location');run('collisionGrid=null');
fresh();run('player.inv=100000;spawn=HORDE.initialDelay;globalThis.fleeWitness=createEnemy(player.x-50000,player.y);enemies=[fleeWitness]');for(let i=0;i<1200;i++)run('player.x+=19;tick(.1)');assert.ok(run('clock>=119'),'flee test spans two simulated minutes');assert.ok(run('enemies.length<=hordePopulationLimit()+2'),'fleeing stays within the common cap plus boss minions');assert.ok(run('enemies.includes(fleeWitness)'),'fleeing never erases the original distant enemy');console.log('Two-minute no-shot fleeing scenario preserves old enemies and continues waves.');

fresh();run('player.inv=100000;globalThis.normal=createEnemy(player.x+1000,player.y);normal.speed=30;enemies=[normal];tick(.1)');assert.ok(Math.abs(run('normal.x-player.x')-997)<1e-8,'distant common zombies keep normal movement speed');
fresh();run('bossIndex=1;spawnBoss()');assert.equal(run('policeUnlocked'),false,'second boss spawning does not unlock police');run('damageEnemy(boss,10000000)');assert.equal(run('policeUnlocked'),true,'defeating second boss unlocks police');run('reset()');assert.equal(run('policeUnlocked'),false,'retry locks police again');

// Shield police absorb 100 damage, then only that survivor adopts fixed-route charges.
fresh();run('globalThis.guard=createEnemy(player.x+400,player.y,"shieldPolice");globalThis.otherGuard=createEnemy(player.x+500,player.y,"shieldPolice");enemies=[guard,otherGuard];globalThis.guardHp=guard.hp;damageEnemy(guard,40)');assert.equal(run('guard.shieldHp'),60);assert.equal(run('guard.hp'),run('guardHp'));assert.equal(run('guard.policePhase'),'shielded');run('damageEnemy(guard,60)');assert.equal(run('guard.shieldHp'),0);assert.equal(run('guard.hp'),run('guardHp'),'breaking hit is absorbed by shield');assert.equal(run('guard.policePhase'),'aim');assert.equal(run('otherGuard.policePhase'),'shielded','other shield carriers do not change behavior');assert.equal(run('kills'),0);assert.equal(run('gems.length'),0,'shield break is not a kill');
run('globalThis.guardX=guard.x;tickPoliceCharge(guard,.3)');assert.equal(run('guard.x'),run('guardX'),'guard stops to calculate route');run('tickPoliceCharge(guard,.41);player.y+=200;tickPoliceCharge(guard,.1)');assert.equal(run('guard.policePhase'),'charge');assert.ok(Math.abs(run('guard.x-guardX')+34)<1e-8);assert.equal(run('guard.y'),300,'charge direction stays locked despite player movement');for(let i=0;i<7;i++)run('tickPoliceCharge(guard,.1)');assert.ok(Math.abs(run('guard.x-guardX')+240)<1e-8,'one charge is capped at240px');assert.equal(run('guard.policePhase'),'aim','each charge returns to a planning pause');
run('damageEnemy(guard,10)');assert.equal(run('guard.hp'),run('guardHp')-10,'body can take damage after shield is broken');
fresh();run('globalThis.overkillGuard=createEnemy(900,300,"shieldPolice");globalThis.overkillHp=overkillGuard.hp;damageEnemy(overkillGuard,150)');assert.equal(run('overkillGuard.hp'),run('overkillHp'),'shield-breaking excess is not transferred to body');
fresh();run('policeUnlocked=true;enemies=[];spawnCircularWave(15)');assert.equal(run('enemies.filter(isPolice).length'),5);assert.ok(run('enemies.some(z=>z.enemyType==="shieldPolice")&&enemies.some(z=>z.enemyType==="expolice")'),'both police archetypes share the one-third allocation');
fresh();run('globalThis.gunPolice=createEnemy(player.x+300,player.y,"expolice");fireCommonShooter(gunPolice);fireCommonShooter(gunPolice)');assert.equal(run('gunPolice.policePhase'),undefined,'gun police do not enter charge mode after two shots');
console.log('Two police archetypes,100-point shield, independent break and fixed240px charge passed.');

fresh();run('openGarage();globalThis.beforeConfig=JSON.stringify(profile)');elements.get('launch').onclick();assert.equal(run('state'),'configuration');assert.equal(elements.get('run-config').hidden,false);assert.equal(elements.get('combat').hidden,true);assert.equal(run('selectWeapon("shotgun")'),false,'configuration cannot change fixed selected gear');assert.equal(run('JSON.stringify(profile)'),run('beforeConfig'),'opening configuration never spends resources');elements.get('config-back').onclick();assert.equal(run('state'),'garage');elements.get('launch').onclick();elements.get('deploy-run').onclick();assert.equal(run('state'),'playing');assert.equal(elements.get('run-config').hidden,true);
fresh();run('upgrade();globalThis.inspectVersion=offerVersion;globalThis.inspectDamage=player.damage');elements.get('module-options').children[1].onclick();assert.equal(run('player.damage'),run('inspectDamage'));assert.equal(run('state'),'upgrade');assert.equal(elements.get('module-options').children[1]['aria-pressed'],'true');const inspectConfirm=elements.get('confirm-upgrade').onclick;run('rerollUpgrade(offerVersion)');inspectConfirm();assert.equal(run('state'),'upgrade','stale detail confirmation cannot install discarded module');
fresh();run('upgrade()');let buttonEnterPrevented=false;fire('window:keydown',{key:'Enter',repeat:false,target:{closest(){return {tagName:'BUTTON'}}},preventDefault(){buttonEnterPrevented=true}});assert.equal(run('state'),'upgrade','Enter on focused UI preserves native button activation');assert.equal(buttonEnterPrevented,false);elements.get('module-options').children[1].onclick();assert.equal(run('previewedSkill'),run('offeredSkills[1].id'),'native option activation previews its own module');elements.get('choices').children.at(-1).onclick();assert.equal(run('state'),'playing','native skip action remains a skip');assert.equal(run('player.acquired.size'),0);
