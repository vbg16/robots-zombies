'use strict';
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
const output='outputs/combat-feedback';
async function fixture(page){
 await page.addInitScript(()=>{requestAnimationFrame=()=>0;});
 await page.goto(process.env.GAME_URL||pathToFileURL(path.resolve('index.html')).href);
 await page.waitForFunction(()=>window.ScrewBalance&&typeof damageEnemy==='function');
 await page.evaluate(async()=>{await Promise.all([...document.images].map(i=>i.decode?.().catch(()=>{})));});
 await page.evaluate(()=>{
  profile.unlockedWeapons.laser=true;selectedRobot='prot';selectedWeapon='laser';selectedAuxWeapons=[];reset();clock=180;spawn=1e9;player.inv=1e6;
  let seed=20261107;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  enemies=[];for(let i=0;i<18;i++){const a=i*Math.PI*2/18,z=createEnemy(player.x+Math.cos(a)*210,player.y+Math.sin(a)*150);z.speed=0;z.hp=z.maxHp=10000;enemies.push(z);}
  bossIndex=0;spawnBoss();boss.x=player.x+130;boss.y=player.y-150;boss.phase='tellDash';boss.dx=0;boss.dy=1;boss.timer=1;
  globalThis.qaFeedbackTarget=enemies[2];qaFeedbackTarget.x=player.x+75;qaFeedbackTarget.y=player.y-25;
  for(let i=0;i<12;i++)damageEnemy(qaFeedbackTarget,22.5,i%3===0?'electric':'bullet',{crit:i%5===0});
  for(const z of enemies.slice(4,11))for(let i=0;i<3;i++)damageEnemy(z,5,'burn');
  toast('ALERTA: BRUTAMONTES · CÃES DE SUCATA (CORREDORES)','#ffb66c');
  toast('SINERGIA: CRIVO BALÍSTICO ATIVO','#ffd27c');toast('ALTO IMPACTO INSTALADO','#89ddff');
  aim={x:player.x-camera.x+140,y:player.y-camera.y,active:true};updateHUD();draw();
 });
 await page.waitForFunction(()=>protSprite.complete&&arenaTile.complete);await page.evaluate(()=>draw());
}
async function capture(prefix=process.env.FEEDBACK_CAPTURE_PREFIX||'current'){
 fs.mkdirSync(output,{recursive:true});const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const results=[];
 try{
  for(const viewport of [{width:1280,height:900},{width:390,height:844}]){
   const page=await browser.newPage({viewport,deviceScaleFactor:1});await fixture(page);
   const file=path.join(output,prefix+'-'+(viewport.width>500?'desktop':'mobile')+'.png');await page.screenshot({path:file});results.push({viewport,file});await page.close();
  }
  fs.writeFileSync(path.join(output,prefix+'-capture.json'),JSON.stringify({fixture:'Injected static combat feedback fixture, not a natural playtest.',results},null,2)+'\n');console.log(JSON.stringify(results));
 }finally{await browser.close();}
}
if(require.main===module)capture().catch(e=>{console.error(e);process.exitCode=1;});
module.exports={fixture,capture,output};
