'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
function parseArgs(args){
 const options={mode:'smart',minutes:20,seed:20261106,build:'tempestade-balistica',headed:false,speed:null,output:null};
 for(let i=0;i<args.length;i++){
  const key=args[i];if(key==='--headed'){options.headed=true;continue;}if(key==='--help'){options.help=true;continue;}
  const names={'--mode':'mode','--minutes':'minutes','--seed':'seed','--build':'build','--speed':'speed','--output':'output'};
  if(!names[key]||args[i+1]===undefined)throw Error('Opção inválida: '+key);options[names[key]]=args[++i];
 }
 options.mode=({inteligente:'smart',simples:'dumb',burro:'dumb',fuga:'dumb'})[options.mode]||options.mode;
 if(!['smart','dumb'].includes(options.mode))throw Error('Modo deve ser smart/inteligente ou dumb/simples.');
 options.minutes=Number(options.minutes);options.seed=Number(options.seed);options.speed=options.speed===null?(options.headed?1:20):Number(options.speed);
 if(!Number.isFinite(options.minutes)||options.minutes<=0||options.minutes>180)throw Error('Minutos devem estar entre 0 e 180.');
 if(!Number.isInteger(options.seed)||options.seed<0||options.seed>4294967295)throw Error('Semente deve ser um inteiro de 0 a 4294967295.');
 if(!Number.isFinite(options.speed)||options.speed<1||options.speed>1000)throw Error('Velocidade deve estar entre 1 e 1000.');
 return options;
}
function loadPlaywright(){
 for(const candidate of ['playwright',path.join(root,'tools/bot-runtime/node_modules/playwright')]){try{return require(candidate);}catch(error){if(error.code!=='MODULE_NOT_FOUND')throw error;}}
 // Optional developer runtime already installed in this workspace; the shipped launcher does not require it.
 const output=path.join(root,'outputs');if(fs.existsSync(output))for(const name of fs.readdirSync(output)){const candidate=path.join(output,name,'_build/node_modules/playwright');if(fs.existsSync(candidate))return require(candidate);}
 throw Error('Playwright ausente. Execute: npm install --prefix tools/bot-runtime playwright');
}
function policySource(){
 const source=fs.readFileSync(path.join(root,'tests/builds-balance.cjs'),'utf8');
 if(!source.includes('const driverVersion=13;'))throw Error('A política compartilhada mudou de versão; revisar a integração do bot antes de executar.');
 const policy=source.split('const simulation=String.raw`')[1]?.split('for(let step=')[0];
 if(!policy||!policy.includes('function qaDrive()')||!policy.includes('function qaChoose()'))throw Error('Política de testes não reconhecida; não iniciar com um piloto diferente silenciosamente.');
 return policy.replace("el('choices').children.at(-1)","Array.from(el('choices').children).at(-1)");
}
async function runBot(options){
 const {chromium}=loadPlaywright(),recipes=require(path.join(root,'builds.js')).builds,recipe=recipes.find(b=>b.id===options.build);
 if(!recipe)throw Error('Build desconhecida. Opções: '+recipes.map(b=>b.id).join(', '));
 const stamp=new Date().toISOString().replace(/[:.]/g,'-'),base=path.resolve(root,options.output||`outputs/bot/${stamp}-${options.mode}-${recipe.id}.json`);
 fs.mkdirSync(path.dirname(base),{recursive:true});
 const policy=policySource(),hash=s=>crypto.createHash('sha256').update(s).digest('hex');
 const report={startedAt:new Date().toISOString(),status:'starting',options:{...options},recipe,version:JSON.parse(fs.readFileSync(path.join(root,'version.json'),'utf8')),driver:'browser-bot-v1 / shared driver13 movement and offers',policyHash:hash(policy),sourceHashes:Object.fromEntries(['game.js','balance.js','builds.js'].map(file=>[file,hash(fs.readFileSync(path.join(root,file)))])),fixture:'Isolated browser context. Gear pre-unlocked only to mount the chosen recipe. No immunity, stat bonuses, forced kills, wave suppression or entity culling.',errors:[],result:null};
 const save=()=>fs.writeFileSync(base,JSON.stringify(report,null,2)+'\n');save();
 let browser,page;
 try{
  const executable=process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe';
  browser=await chromium.launch({headless:!options.headed,executablePath:fs.existsSync(executable)?executable:undefined});
  const context=await browser.newContext({viewport:{width:1280,height:900}});page=await context.newPage();
  page.on('pageerror',e=>report.errors.push({kind:'pageerror',message:e.message}));
  await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
  await page.goto(pathToFileURL(path.join(root,'index.html')).href);await page.waitForFunction(()=>window.ScrewBalance&&typeof tick==='function');
  await page.evaluate(({recipe,options,policy})=>{
   globalThis.qaSeed=options.seed>>>0;Math.random=()=>{qaSeed=(Math.imul(qaSeed,1664525)+1013904223)>>>0;return qaSeed/4294967296;};
   profile=emptyProfile();profile.unlockedRobots=Object.fromEntries(Object.keys(ROBOTS).map(id=>[id,true]));profile.unlockedWeapons=Object.fromEntries(Object.keys(WEAPONS).map(id=>[id,true]));saveProfile();
   selectedRobot=recipe.robot;selectedWeapon=recipe.weapon;selectedAuxWeapons=[];reset();
   globalThis.qaBuild=recipe;globalThis.qaUseRefits=true;globalThis.qaMode=options.mode;globalThis.qaChestPolicy='safe';globalThis.qa={damage:{},received:0,receivedBySource:{},healing:0,bosses:[],choices:[],maxEnemies:0,maxBullets:0,maxHostile:0,controlEnemySeconds:0,distance:0,shots:0,minutes:[],chestsSeen:0,chestsCollected:0};
   globalThis.qaChestIds=new Set();
   globalThis.qaDamage=damageEnemy;damageEnemy=function(z,n,source='direct',origin=null){const before=z.hp,wasBoss=z===boss;const result=qaDamage(z,n,source,origin);qa.damage[source]=(qa.damage[source]||0)+Math.max(0,before-z.hp);if(wasBoss&&before>0&&z.hp===0)qa.bosses.push({id:z.id,at:clock,ttk:clock-(z.qaSpawnAt||0)});return result;};
   globalThis.qaSpawn=spawnBoss;spawnBoss=function(){const result=qaSpawn();if(boss)boss.qaSpawnAt=clock;return result;};
   globalThis.qaHurt=hurtPlayer;hurtPlayer=function(...args){const before=player.hp;const result=qaHurt(...args);const loss=Math.max(0,before-player.hp),source=args[3]||'contact-or-projectile';qa.received+=loss;qa.receivedBySource[source]=(qa.receivedBySource[source]||0)+loss;return result;};
   globalThis.qaHeal=healPlayer;healPlayer=function(...args){const before=player.hp,result=qaHeal(...args);qa.healing+=Math.max(0,player.hp-before);return result;};
   globalThis.qaFireCount=fireWeapon;fireWeapon=function(slot){const result=qaFireCount(slot);if(result)qa.shots++;return result;};
   (0,eval)(policy);
   globalThis.qaStop=false;globalThis.qaSteps=0;globalThis.qaOfferSteps=0;globalThis.qaLastMinute=-1;
   const panel=document.createElement('aside');panel.id='bot-test-panel';panel.style.cssText='position:fixed;bottom:12px;left:12px;z-index:99999;max-width:300px;background:#071725ed;border:1px solid #71d7f2;color:#d6f6ff;padding:10px;font:12px monospace;pointer-events:auto';
   const label=document.createElement('strong');label.textContent='BOT '+(qaMode==='smart'?'INTELIGENTE':'SIMPLES')+' · TESTE ISOLADO';const status=document.createElement('div');status.id='bot-test-status';const stop=document.createElement('button');stop.textContent='ENCERRAR TESTE';stop.onclick=()=>{qaStop=true;};panel.append(label,status,stop);document.body.append(panel);
  },{recipe,options,policy});
  report.status='running';save();
  const totalSteps=Math.ceil(options.minutes*60/.05),batch=options.headed?Math.max(1,Math.min(20,Math.floor(options.speed))):Math.min(400,Math.max(20,Math.floor(options.speed*4)));
  let latest=null,lastSaved=-Infinity;
  while(true){
   const began=Date.now();latest=await page.evaluate(({batch,totalSteps})=>{
    for(let i=0;i<batch&&!qaStop&&qaSteps<totalSteps&&state!=='over';){
     if(state!=='playing'){qaChoose();if(++qaOfferSteps>100)throw Error('Bot não conseguiu resolver a oferta: '+state);continue;}
     qaOfferSteps=0;
     if(qaSteps%4===0){
      qaDrive();
      if(qaMode==='dumb'){
       const nearest=targets().filter(z=>z.hp>0).sort((a,b)=>Math.hypot(a.x-player.x,a.y-player.y)-Math.hypot(b.x-player.x,b.y-player.y))[0];
       keys.clear();if(nearest){const dx=player.x-nearest.x,dy=player.y-nearest.y;keys.add(Math.abs(dx)>Math.abs(dy)?dx>=0?'d':'a':dy>=0?'s':'w');}else keys.add('d');
      }
     }
     const chestIds=typeof bossChests!=='undefined'?bossChests.map(c=>c.id):[];
     tick(.05);qaSteps++;i++;qa.distance+=Math.hypot(player.x-qaLast.x,player.y-qaLast.y);qaLast={x:player.x,y:player.y};
     if(typeof bossChests!=='undefined'){for(const c of bossChests)if(!qaChestIds.has(c.id)){qaChestIds.add(c.id);qa.chestsSeen++;}if(state!=='over')qa.chestsCollected+=chestIds.filter(id=>!bossChests.some(c=>c.id===id)).length;}
     qa.maxEnemies=Math.max(qa.maxEnemies,enemies.length);qa.maxBullets=Math.max(qa.maxBullets,bullets.length);qa.maxHostile=Math.max(qa.maxHostile,hostile.length);
     if(qaSteps%100===0&&!([clock,player.x,player.y,player.hp,player.damage,...weaponSlots.flatMap(s=>[s.damage,s.rate,s.ammo,s.reloadTime,s.cooldown]),...enemies.flatMap(z=>[z.x,z.y,z.hp]),...bullets.flatMap(b=>[b.x,b.y,b.damage]),...hostile.flatMap(b=>[b.x,b.y,b.vx,b.vy])].every(Number.isFinite)))throw Error('Estado numérico inválido.');
     const minute=Math.floor((clock+1e-7)/60);if(minute>qaLastMinute){qaLastMinute=minute;qa.minutes.push({minute,time:clock,hp:player.hp,maxHp:player.maxHp,level,kills,bossKills,enemies:enemies.length,received:qa.received,healing:qa.healing});}
    }
    window.ScrewAudio?.setScene(null);updateHUD();draw();document.querySelector('#bot-test-status').textContent=Math.floor(clock/60)+':'+String(Math.floor(clock%60)).padStart(2,'0')+' · LV '+level+' · '+kills+' ABATES · '+bossKills+' CHEFES';
    return {done:qaStop||qaSteps>=totalSteps||state==='over',stop:qaStop,time:clock,state,hp:player.hp,maxHp:player.maxHp,level,kills,bossKills,coreReached:qaBuild.core.every(id=>player.acquired.has(id)),recipeReached:qaBuild.skills.every(id=>player.acquired.has(id)),acquired:[...player.acquired],...qa};
   },{batch,totalSteps});
   report.result=latest;if(latest.done||latest.time-lastSaved>=5){save();lastSaved=latest.time;}if(latest.done)break;
   const targetMs=batch*.05*1000/options.speed,delay=Math.max(0,targetMs-(Date.now()-began));if(delay)await new Promise(resolve=>setTimeout(resolve,delay));
  }
  report.status=latest.stop?'user-stop':latest.state==='over'?'player-death':'duration-reached';
  report.viable=options.minutes>=20?latest.time>=1199.9&&latest.bossKills>=3:null;
  report.screenshot=base.replace(/\.json$/i,'')+'.png';await page.screenshot({path:report.screenshot});
 }catch(error){report.status='runtime-error';report.errors.push({kind:'runner',message:error.message});throw error;}
 finally{report.finishedAt=new Date().toISOString();save();if(browser)await browser.close();console.log('Relatório: '+base);}
 console.log(`BOT ${options.mode}: ${report.status}, ${Math.round(report.result.time)}s, ${report.result.kills} abates, ${report.result.bossKills} chefes.`);
 return report;
}
if(require.main===module){let options;try{options=parseArgs(process.argv.slice(2));if(options.help){console.log('node tools/playtest-bot.cjs [--headed] [--mode smart|dumb] [--minutes 20] [--seed 20261106] [--build tempestade-balistica] [--speed 1] [--output outputs/bot/teste.json]');}else runBot(options).catch(e=>{console.error(e.message);process.exitCode=1;});}catch(error){console.error(error.message);process.exitCode=1;}}
module.exports={parseArgs,policySource,runBot};
