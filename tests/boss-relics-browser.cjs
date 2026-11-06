'use strict';
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
const output='outputs/boss-relics';
(async()=>{
 fs.mkdirSync(output,{recursive:true});const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const errors=[],evidence=[];
 try{
  for(const viewport of [{width:1280,height:900},{width:390,height:844}]){
   const context=await browser.newContext({viewport}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>{requestAnimationFrame=()=>0;});
   await page.goto(process.env.GAME_URL||pathToFileURL(path.resolve('index.html')).href);await page.waitForFunction(()=>window.ScrewBalance&&window.ScrewBuildGuide);await page.waitForFunction(()=>[...document.images].every(i=>i.complete));
   await page.evaluate(()=>{selectedRobot='prot';selectedWeapon='machine';selectedAuxWeapons=[];reset();spawn=1e9;player.inv=1e6;spawnBoss();boss.x=player.x+160;boss.y=player.y+70;damageEnemy(boss,boss.hp+1);tick(.01);draw();});
   assert.equal(await page.evaluate(()=>state),'playing');assert.equal(await page.evaluate(()=>bossChests.length),1);
   const marker=await page.evaluate(()=>{const c=bossChests[0],m=document.getElementById('minimap'),p=minimapPoint(c.x,c.y,m.width,m.height,6);drawMinimap();return [...m.getContext('2d').getImageData(Math.floor(p.x),Math.floor(p.y),1,1).data];});
   assert.deepEqual(marker,[255,210,124,255],'real minimap draws gold chest');
   const size=viewport.width>500?'desktop':'mobile';await page.screenshot({path:path.join(output,size+'-chest.png')});
   await page.evaluate(()=>{player.x=bossChests[0].x;player.y=bossChests[0].y;tick(.01);draw();});
   assert.equal(await page.evaluate(()=>state),'relic');assert.equal(await page.locator('[data-relic]').count(),3);assert.match(await page.locator('#description').textContent(),/fim desta partida/);
   for(const text of await page.locator('[data-relic] .skill-cost').allTextContents())assert.equal(text,'SEM PENALIDADE · SÓ NESTA PARTIDA');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'no horizontal overflow');
   const frozen=await page.evaluate(()=>({clock,spawn,hp:player.hp}));await page.evaluate(()=>tick(5));assert.deepEqual(await page.evaluate(()=>({clock,spawn,hp:player.hp})),frozen);
   const first=await page.locator('[data-relic]').first().getAttribute('data-relic');await page.screenshot({path:path.join(output,size+'-choice.png')});
   if(size==='mobile'){await page.locator('#choices .skip-upgrade').scrollIntoViewIfNeeded();const skip=await page.locator('#choices .skip-upgrade').boundingBox();assert.ok(skip.y>=0&&skip.y+skip.height<=viewport.height,'mobile can scroll to final action');await page.screenshot({path:path.join(output,'mobile-choice-bottom.png')});}
   await page.keyboard.press('1');assert.equal(await page.evaluate(()=>state),'playing');assert.equal(await page.evaluate(id=>player.relics.has(id),first),true);assert.match(await page.locator('#build-summary').textContent(),new RegExp(await page.evaluate(id=>BOSS_RELICS.find(r=>r.id===id).name,first)));
   await page.evaluate(()=>{offerBossRelic({bossName:'SEGUNDA'});globalThis.qaStaleRelic=()=>chooseRelic(offeredRelics[0].id,offerVersion-1);});await page.keyboard.press('r');assert.equal(await page.evaluate(()=>state),'playing');assert.equal(await page.evaluate(()=>player.relics.size),1);assert.equal(await page.evaluate(()=>qaStaleRelic()),false);
   await page.evaluate(()=>{offerBossRelic({bossName:'TERCEIRA'});const id=offeredRelics[0].id,version=offerVersion;globalThis.qaResetCallback=()=>chooseRelic(id,version);reset();});assert.equal(await page.evaluate(()=>qaResetCallback()),false);assert.equal(await page.evaluate(()=>player.relics.size),0);assert.equal(await page.evaluate(()=>bossChests.length),0);
   evidence.push({viewport,physicalChest:true,minimapGold:true,choices:3,keyboardInstall:true,keyboardRefusal:true,pause:true,stale:true,reset:true});await context.close();
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'browser-report.json'),JSON.stringify({errors,evidence},null,2)+'\n');console.log('Chrome boss relics: file:// desktop/mobile chest/minimap, paused choices, keyboard install/refusal, reset/stale and no overflow passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
