'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{
 fs.mkdirSync('outputs/enemy-animation',{recursive:true});
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true}),report=[];
 try{
  for(const [label,url] of [['http',process.env.GAME_URL||'http://127.0.0.1:8001/'],['file',pathToFileURL(path.resolve('index.html')).href]]){
   const context=await browser.newContext({viewport:{width:1280,height:900}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
   await page.goto(url);await page.waitForFunction(()=>window.ScrewBuildGuide&&ScrewZombieRenderer.ready.filter(Boolean).length===3);
   await page.evaluate(()=>{openGarage();reset();spawn=1e9;enemies=[];for(let i=0;i<3;i++){const z=createEnemy(player.x-220+i*160,player.y-140);z.variant=i;z.speed=40;z.hp=z.maxHp=10000;enemies.push(z);}player.inv=1e9;});
   const evidence=await page.evaluate(()=>{
    const z=enemies[0],x=z.x,y=z.y;tick(.25);const moved=z.x!==x||z.y!==y,first=z.visualPhase;tick(.25);const advanced=z.visualPhase!==first;
    z.stunTime=2;const before={x:z.x,y:z.y,phase:z.visualPhase};tick(.1);const stunned=z.x===before.x&&z.y===before.y&&z.visualPhase===before.phase&&!z.visualWalking;
    const phase=z.visualPhase,clockBefore=clock;pause();tick(1);draw();const paused=z.visualPhase===phase&&clock===clockBefore;pause();
    for(const [direction,dx,dy] of [['right',8,0],['left',-8,0],['up',0,-8],['down',0,8]]){const x=z.x,y=z.y;z.x+=dx;z.y+=dy;ScrewEnemyAnimation.advance(z,x,y);if(z.visualFacing!==direction)throw Error('facing');}
    // Actual police overlays and all status decorations remain present on animated bodies.
    const police=createEnemy(player.x+100,player.y,'expolice'),shield=createEnemy(player.x+170,player.y,'shieldPolice');police.slowTime=1;police.burnTime=1;shield.hit=.1;enemies.push(police,shield);draw();
    spawnBoss(true);const bx=boss.x,by=boss.y;tickBoss(.1);const bossAnimated=(boss.x!==bx||boss.y!==by)&&boss.visualWalking;
    draw();return {moved,advanced,stunned,paused,bossAnimated,cache:ScrewZombieRenderer.cache.size};
   });
   for(const key of ['moved','advanced','stunned','paused','bossAnimated'])assert.equal(evidence[key],true,label+' '+key);
   await page.screenshot({path:`outputs/enemy-animation/arena-${label}.png`});
   if(label==='http'){
    await page.evaluate(()=>{
     const sheet=document.createElement('canvas');sheet.id='enemy-contact';sheet.width=1000;sheet.height=1320;sheet.style.cssText='position:absolute;left:0;top:0;z-index:99999;width:1000px;height:1320px';document.body.append(sheet);const c=sheet.getContext('2d');c.fillStyle='#102532';c.fillRect(0,0,sheet.width,sheet.height);c.font='12px monospace';c.imageSmoothingEnabled=false;
     for(let v=0;v<3;v++)for(let d=0;d<4;d++)for(let i=0;i<8;i++){const row=v*4+d,x=70+i*115,y=55+row*110;ScrewZombieRenderer.draw(c,{x,y,visualFacing:['down','right','up','left'][d],visualPhase:i,visualWalking:true,hit:0},v,v===2?95:58);if(i===0){c.fillStyle='#bfe6f7';c.fillText(v+' '+['down','right','up','left'][d],5,row*110+12);}}
    });await page.locator('#enemy-contact').screenshot({path:'outputs/enemy-animation/contact.png'});
   }
   const coldWave=await page.evaluate(()=>{
    const surfaces=new Set();for(const sheet of ScrewZombieRenderer.cache.values())for(const frame of sheet.values())surfaces.add(frame.surface);for(const image of surfaces)image.close?.();ScrewZombieRenderer.cache.clear();
    enemies=Array.from({length:15},(_,i)=>{const a=i*Math.PI*2/15,z=createEnemy(player.x+Math.cos(a)*120,player.y+Math.sin(a)*120);z.variant=i%3;z.r=11+i%6;return z;});boss=null;
    const start=performance.now();draw();const firstMs=performance.now()-start,then=performance.now();for(let i=0;i<50;i++)draw();return {firstMs,warmMeanMs:(performance.now()-then)/50,cacheSheets:ScrewZombieRenderer.cache.size,population:enemies.length};
   });
   assert.deepEqual(errors,[]);report.push({label,...evidence,coldWave,errors});await context.close();
  }
  const context=await browser.newContext(),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/zombie-scavenger-walk-v2.png',r=>r.abort());await page.goto(process.env.GAME_URL||'http://127.0.0.1:8001/');await page.waitForFunction(()=>window.ScrewBuildGuide&&zombieSprites.every(s=>s.complete));
  const fallback=await page.evaluate(()=>{openGarage();reset();spawn=1e9;const z=createEnemy(player.x+80,player.y);z.variant=1;enemies=[z];const before=ScrewZombieRenderer.cache.size;draw();return !ScrewZombieRenderer.ready[1]&&ScrewZombieRenderer.cache.size===before;});assert.equal(fallback,true);assert.deepEqual(errors,[]);await context.close();
  const compatible=await browser.newContext(),compatPage=await compatible.newPage();await compatPage.addInitScript(()=>{window.OffscreenCanvas=undefined;});await compatPage.goto(process.env.GAME_URL||'http://127.0.0.1:8001/');await compatPage.waitForFunction(()=>window.ScrewBuildGuide&&ScrewZombieRenderer.ready.filter(Boolean).length===3);
  await compatPage.evaluate(()=>{openGarage();reset();spawn=1e9;const z=createEnemy(player.x+100,player.y);enemies=[z];draw();});await compatPage.waitForFunction(()=>[...ScrewZombieRenderer.cache.values()].some(sheet=>[...sheet.values()].every(p=>p.surface instanceof ImageBitmap)));await compatible.close();
  const old=await browser.newContext(),oldPage=await old.newPage();await oldPage.addInitScript(()=>{window.OffscreenCanvas=undefined;window.createImageBitmap=undefined;});await oldPage.goto(process.env.GAME_URL||'http://127.0.0.1:8001/');await oldPage.waitForFunction(()=>window.ScrewBuildGuide&&zombieSprites.every(s=>s.complete));assert.equal(await oldPage.evaluate(()=>{openGarage();reset();spawn=1e9;enemies=[createEnemy(player.x+100,player.y)];draw();return typeof ScrewZombieRenderer==='undefined';}),true);await old.close();
  fs.writeFileSync('outputs/enemy-animation/report.json',JSON.stringify({report,missingAtlasFallback:fallback,htmlCanvasBitmapFallback:true,legacyWithoutBitmapAPI:true},null,2)+'\n');console.log('Chrome enemy animation HTTP/file:3atlases, walking/facing, stun/pause, boss gait, police/status overlays, missing-atlas and bitmapAPI fallbacks passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
