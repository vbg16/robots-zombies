'use strict';
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {fixture,output}=require('../tools/capture-combat-feedback.cjs');
const overlaps=(a,b)=>a&&b&&a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
(async()=>{
 fs.mkdirSync(output,{recursive:true});const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const errors=[],evidence=[];
 try{
  for(const viewport of [{width:1280,height:900},{width:390,height:844},{width:390,height:500},{width:900,height:500},{width:900,height:768},{width:844,height:390},{width:740,height:360},{width:932,height:430}]){
   const page=await browser.newPage({viewport,deviceScaleFactor:1});page.on('pageerror',e=>errors.push(e.message));await fixture(page);
   const notices=page.locator('#combat-notices');assert.equal(await notices.getAttribute('role'),'status');assert.equal(await notices.isVisible(),true);assert.equal(await notices.evaluate(e=>getComputedStyle(e).pointerEvents),'none');
   assert.ok(await notices.locator(':scope > *').count()<=2,'at most two readable notices');
   await page.evaluate(()=>{toast('ALTO IMPACTO INSTALADO','#89ddff');toast('ALTO IMPACTO INSTALADO','#89ddff');updateHUD();draw();});
   assert.equal(((await notices.textContent()).match(/ALTO IMPACTO INSTALADO/g)||[]).length,1,'same notice is not displayed repeatedly');
   const rect=await notices.boundingBox();assert.ok(rect.x>=0&&rect.y>=0&&rect.x+rect.width<=viewport.width+1&&rect.y+rect.height<=viewport.height+1,'notices remain inside viewport');
   const dangerRect=await page.evaluate(()=>({x:boss.x-camera.x-46,y:boss.y-camera.y,width:92,height:360*.65}));assert.equal(overlaps(rect,dangerRect),false,'notices clear the controlled scene dash telegraph');
   const hudRects={};
   for(const id of ['minimap','health','boss-hud','ammo-count']){const node=page.locator('#'+id);if(await node.isVisible()){hudRects[id]=await node.boundingBox();if(overlaps(rect,hudRects[id])){console.log('Overlap:',JSON.stringify({viewport,noticeRect:rect,id,hudRect:hudRects[id]}));await page.screenshot({path:path.join(output,'overlap-'+viewport.width+'x'+viewport.height+'.png')});}assert.equal(overlaps(rect,hudRects[id]),false,'notices clear '+id);}}
   const beforeDraw=await page.evaluate(()=>JSON.stringify({clock,spawn,hp:player.hp,ammo:player.ammo,player:[player.x,player.y],enemies:enemies.map(z=>[z.x,z.y,z.hp]),bullets:bullets.map(b=>[b.x,b.y,b.damage]),feedback,combatNotices}));
   const numericCalls=await page.evaluate(()=>{const random=Math.random,fill=ctx.fillText;const calls=[];Math.random=()=>{throw Error('drawing consumed RNG')};ctx.fillText=function(text,...args){if(/^(?:\d|CRIT )/.test(String(text))&&this.fillStyle!=='#08121c')calls.push(String(text));return fill.call(this,text,...args);};try{draw();}finally{Math.random=random;ctx.fillText=fill;}return calls;});
   assert.ok(numericCalls.length<=10,'33 repeated hits render no more than ten foreground damage labels');
   assert.equal(await page.evaluate(()=>JSON.stringify({clock,spawn,hp:player.hp,ammo:player.ammo,player:[player.x,player.y],enemies:enemies.map(z=>[z.x,z.y,z.hp]),bullets:bullets.map(b=>[b.x,b.y,b.damage]),feedback,combatNotices})),beforeDraw,'draw is physically pure');
   const size=viewport.width===1280?'desktop':viewport.height===844?'mobile':'compact-'+viewport.width+'x'+viewport.height;await page.screenshot({path:path.join(output,'after-'+size+'.png')});
   const playerRect=await page.evaluate(()=>({x:player.x-camera.x-29,y:player.y-camera.y-36,width:58,height:72}));
   console.log('Feedback layout:',JSON.stringify({viewport,noticeRect:rect,playerRect}));assert.equal(overlaps(rect,playerRect),false,'notice panel clears the player silhouette');
   if(viewport.width>viewport.height&&viewport.height<=600){
    const headerRects=await Promise.all(['.hud-unit','#boss-hud','.hud-stats'].map(selector=>page.locator(selector).boundingBox()));
    for(let i=0;i<headerRects.length;i++)for(let j=i+1;j<headerRects.length;j++)assert.equal(overlaps(headerRects[i],headerRects[j]),false,'landscape header modules remain separate');
    for(const id of ['health','boss-hud','minimap','ammo-count'])assert.equal(overlaps(playerRect,await page.locator('#'+id).boundingBox()),false,'landscape HUD clears the player');
   }
   await page.evaluate(()=>{clock=0;updateHUD();draw();});
   const controlRect=await page.locator('#combat-controls').boundingBox(),initialNoticeRect=await notices.boundingBox();assert.equal(overlaps(initialNoticeRect,controlRect),false,'notices clear the initial controls');
   if(viewport.width>viewport.height&&viewport.height<=600)assert.equal(overlaps(initialNoticeRect,await page.locator('#salvage-hint').boundingBox()),false,'landscape notices clear the initial pickup hint');
   if(viewport.width>viewport.height&&viewport.height<=600)assert.equal(overlaps(dangerRect,await page.locator('#salvage-hint').boundingBox()),false,'landscape pickup hint clears the controlled scene dash telegraph');
   if(viewport.width>viewport.height&&viewport.height<=600)assert.equal(overlaps(playerRect,controlRect),false,'landscape tutorial clears the player');
   const resizedViewport={width:viewport.width>720?viewport.width+40:viewport.width-30,height:viewport.height};await page.setViewportSize(resizedViewport);await page.evaluate(()=>{syncCamera();updateHUD();draw();});
   const resizedRect=await notices.boundingBox();assert.ok(resizedRect.x>=0&&resizedRect.y>=0&&resizedRect.x+resizedRect.width<=resizedViewport.width+1&&resizedRect.y+resizedRect.height<=resizedViewport.height+1,'resized notice remains inside viewport');
   for(const id of ['minimap','boss-hud','ammo-count','combat-controls',...(viewport.width>viewport.height&&viewport.height<=600?['salvage-hint']:[])]){const node=page.locator('#'+id);if(await node.isVisible())assert.equal(overlaps(resizedRect,await node.boundingBox()),false,'resized notices clear '+id);}
   await page.evaluate(()=>{pause();tick(5);});assert.equal(await notices.isVisible(),false,'pause hides notices');await page.evaluate(()=>{pause();updateHUD();draw();});assert.equal(await notices.isVisible(),true,'pause does not expire notices');
   await page.evaluate(()=>{tick(3);updateHUD();draw();});assert.equal(await notices.isVisible(),false,'notices expire during active combat');
   await page.evaluate(()=>{toast('TESTE DE RESET');reset();draw();});assert.equal(await notices.isVisible(),false,'reset clears notices');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'no horizontal overflow');
   evidence.push({viewport,noticeRect:rect,dangerRect,hudRects,initialControls:true,resizedViewport,resizedRect,numericDrawCalls:numericCalls.length,numericTexts:numericCalls,pureDraw:true,pause:true,expiry:true,reset:true,dedup:true});await page.close();
  }
  assert.deepEqual(errors,[]);const crypto=require('node:crypto'),hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');fs.writeFileSync(path.join(output,'browser-report.json'),JSON.stringify({at:new Date().toISOString(),fixture:'Injected static feedback fixture; not a natural playtest.',sourceHashes:Object.fromEntries(['game.js','style.css','ui-redesign.css','index.html'].map(file=>[file,hash(file)])),testHash:hash(__filename),errors,evidence},null,2)+'\n');console.log('Chrome feedback: desktop/mobile notices, dedup, HUD clearance, grouped damage, pure draw, pause, expiry, reset and no overflow passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
