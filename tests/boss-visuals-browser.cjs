'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 fs.mkdirSync('outputs/boss-visuals',{recursive:true});
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const context=await browser.newContext({viewport:{width:1280,height:900}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});await page.goto(process.env.GAME_URL||'http://127.0.0.1:8001/');await page.waitForFunction(()=>window.ScrewBuildGuide&&window.ScrewBossVisuals);
  const evidence=[];
  for(const [index,id,phase] of [[1,'scrapper','tellMortar'],[2,'coil','tellPulse']]){
   const result=await page.evaluate(({index,id,phase})=>{
    openGarage();reset();spawn=1e9;player.inv=1e9;bossIndex=index;spawnBoss(true);enemies=[];boss.x=player.x+160;boss.y=player.y-50;boss.phase='approach';boss.timer=5;
    const original={x:boss.x,y:boss.y};tick(.2);const locomotion=boss.visualWalking&&(boss.x!==original.x||boss.y!==original.y);
    boss.phase=phase;boss.timer=.01;tick(.02);const attack=Number(boss.visualAttack)>0;tick(.05);const decay=boss.visualAttack<.28&&boss.visualAttack>0;
    pause();const before=JSON.stringify({clock,boss});tick(1);draw();const frozen=JSON.stringify({clock,boss})===before;pause();
    boss.slowTime=1;boss.burnTime=1;boss.stunTime=1;draw();updateHUD();return {id,locomotion,attack,decay,frozen,phase:boss.phase};
   },{index,id,phase});for(const key of ['locomotion','attack','decay','frozen'])assert.equal(result[key],true,id+' '+key);evidence.push(result);
   await page.screenshot({path:`outputs/boss-visuals/${id}-arena.png`});
  }
  await page.evaluate(()=>{const canvas=document.createElement('canvas');canvas.id='boss-contact';canvas.width=1000;canvas.height=460;canvas.style.cssText='position:absolute;inset:0;z-index:99999;width:1000px;height:460px';document.body.append(canvas);const c=canvas.getContext('2d');c.fillStyle='#102532';c.fillRect(0,0,1000,460);c.font='12px monospace';for(let row=0;row<2;row++){const id=row?'coil':'scrapper';for(let i=0;i<8;i++){const b={id,x:60+i*125,y:90+row*220,hp:100,r:30,phase:i<3?'approach':id==='coil'?'tellPulse':'tellMortar',timer:.2,visualWalking:i<3,visualPhase:i,visualAttack:i===6?.25:0,hit:i===7?.1:0};c.fillStyle='#d4e5ee';c.fillText(id+' '+i,b.x-45,b.y-65);ScrewBossVisuals.draw(c,b,{x:b.x+(i===2?-100:100),y:b.y+(i===3?-200:100)},2);}}});
  await page.locator('#boss-contact').screenshot({path:'outputs/boss-visuals/contact.png'});assert.deepEqual(errors,[]);fs.writeFileSync('outputs/boss-visuals/report.json',JSON.stringify({evidence,errors},null,2)+'\n');
  const fallback=await browser.newContext(),old=await fallback.newPage();await old.route('**/boss-visuals.js',r=>r.abort());await old.goto(process.env.GAME_URL||'http://127.0.0.1:8001/');await old.waitForFunction(()=>window.ScrewBuildGuide);assert.equal(await old.evaluate(()=>{openGarage();reset();bossIndex=1;spawnBoss(true);draw();return typeof ScrewBossVisuals==='undefined'&&boss.hp>0;}),true);await fallback.close();
  console.log('Chrome boss visuals:both specialists move, tell/attack/recoil, freeze on pause, statuses, HUD and legacy fallback passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
