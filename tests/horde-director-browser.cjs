'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),{pathToFileURL}=require('node:url'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const context=await browser.newContext(),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{requestAnimationFrame=()=>0;});
  await page.goto(pathToFileURL(path.resolve('index.html')).href);await page.waitForFunction(()=>window.ScrewBalance);
  for(const viewport of [{width:1280,height:900},{width:390,height:844}]){
   await page.setViewportSize(viewport);
   const result=await page.evaluate(()=>{
    selectedRobot='prot';selectedWeapon='machine';reset();player.inv=1e9;bossIndex=1e6;
    for(let i=0;i<1200;i++)tick(.1);
    const before=enemies.length;player.x+=10000;syncCamera();hordeDirector.cooldown=0;tick(.01);draw();
    const near=enemies.filter(z=>Math.hypot(z.x-player.x,z.y-player.y)<waveRadius()*1.1);
    const encounter={before,after:enemies.length,cap:hordePopulationLimit(),reason:hordeDirector.lastReason,near:near.length,outside:near.every(z=>z.x+50<camera.x||z.x-50>camera.x+width||z.y+60<camera.y||z.y-60>camera.y+height)};
    state='upgrade';offeredSkills=[SKILLS.find(s=>s.id==='damage')];offerVersion++;upgrade();offeredSkills=[SKILLS.find(s=>s.id==='damage')];previewSkill('damage',offerVersion);
    return encounter;
   });
   assert.ok(result.after<=result.cap);assert.ok(result.after>=result.before&&result.after-result.before<=15);assert.equal(result.reason,'travel');assert.ok(result.near>0);assert.equal(result.outside,true);
   assert.match(await page.locator('#module-detail').textContent(),/Dano ×2/);
   assert.match(await page.locator('#module-detail .module-cost').textContent(),/Sem penalidade/);
  }
  assert.deepEqual(errors,[]);await context.close();
  console.log('Chrome file:// desktop/mobile: bounded horde, travel re-entry outside view, draw and pure-damage card passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
