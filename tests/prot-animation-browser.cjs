/* Chrome runtime QA. Spawn is delayed to isolate actor rendering; this is not a survival run. */
'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const output='outputs/animation-audit';
async function launchRun(browser,url,label,{blocked}={}){
 const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  window.__protDraws=[];const original=CanvasRenderingContext2D.prototype.drawImage;
  CanvasRenderingContext2D.prototype.drawImage=function(image,...args){
   if(image?.src?.includes('/robots/prot-0001-')){
    const list=window.__protDraws;list.push({src:image.src,args,alpha:this.globalAlpha});if(list.length>200)list.shift();
   }
   return original.call(this,image,...args);
  };
 });
 if(blocked)await page.route('**/'+blocked,route=>route.abort());
 await page.goto(url);await page.waitForFunction(()=>window.ScrewBuildGuide);
 await page.locator('#enter-garage').click();await page.locator('#launch').click();await page.locator('#deploy-run').click();
 await page.evaluate(()=>{spawn=10000;});
 await page.waitForFunction(()=>protSprite?.complete&&protSprite.naturalWidth>0);
 return {context,page,errors,label};
}
async function normal(browser,url,label){
 const run=await launchRun(browser,url,label),{page,errors,context}=run;
 try{
  await page.waitForFunction(()=>protAnimation?.image?.naturalWidth===1774);
  assert.equal(await page.evaluate(()=>protAnimation.clip),'idle.down');
  for(const [direction,key] of [['down','s'],['right','d'],['up','w'],['left','a']]){
   const before=await page.evaluate(()=>({x:player.x,y:player.y}));
   await page.keyboard.down(key);
   await page.waitForFunction(direction=>protAnimation.clip==='walk.'+direction, direction);
   const first=await page.evaluate(()=>({time:protAnimation.time,x:protAnimation.frame.x}));
   await page.waitForTimeout(240);
   const next=await page.evaluate(()=>({time:protAnimation.time,x:protAnimation.frame.x,px:player.x,py:player.y,facing:player.facing}));
   assert.equal(next.facing,direction);assert.notEqual(next.x,first.x,'walking changes source frame');
   assert.ok(Math.hypot(next.px-before.x,next.py-before.y)>0,'real input moves actor');
   await page.keyboard.up(key);
   await page.waitForFunction(direction=>protAnimation.clip==='idle.'+direction,direction);
   assert.equal(await page.evaluate(()=>protAnimation.frame.x),0,'idle uses first frame of selected facing');
  }
  await page.keyboard.down('d');await page.waitForFunction(()=>protAnimation.clip==='walk.right');
  await page.keyboard.press('p');const frozen=await page.evaluate(()=>({time:protAnimation.time,clip:protAnimation.clip,clock}));
  await page.waitForTimeout(260);assert.deepEqual(await page.evaluate(()=>({time:protAnimation.time,clip:protAnimation.clip,clock})),frozen,'pause freezes animation and simulation');
  await page.keyboard.up('d');await page.keyboard.press('p');await page.waitForFunction(()=>protAnimation.clip==='idle.right');
  const reset=await page.evaluate(()=>{reset();spawn=10000;return {time:protAnimation.time,clip:protAnimation.clip,facing:player.facing};});
  assert.deepEqual(reset,{time:0,clip:'idle.down',facing:'down'});
  await page.waitForTimeout(350);
  const ground=await page.evaluate(()=>{
   const f=protAnimation.frame,scale=protAnimation.scale,draw=window.__protDraws.at(-1);
   return {image:draw.src,args:draw.args,bottom:draw.args[5]+f.pivotY*scale,visibleHeight:(f.visibleBounds[3]-f.visibleBounds[1])*scale};
  });
  assert.ok(ground.image.endsWith('prot-0001-walk-v2.png'));
  assert.ok(Math.abs(ground.bottom-28)<=.5,'actual draw anchors ground at player.y+28');
  assert.ok(ground.visibleHeight<=72.000001);
  await page.evaluate(()=>{player.inv=1;});await page.waitForTimeout(30);
  assert.equal(await page.evaluate(()=>window.__protDraws.at(-1).alpha),.6,'invulnerability alpha is preserved');
  await page.evaluate(()=>{player.inv=0;});await page.waitForTimeout(50);
  await page.screenshot({path:`${output}/prot-runtime-${label}.png`,fullPage:true});
  const box=await page.locator('#game').boundingBox();
  const position=await page.evaluate(()=>({x:player.x-camera.x,y:player.y-camera.y}));
  await page.screenshot({path:`${output}/prot-runtime-${label}-actor.png`,clip:{x:Math.max(0,box.x+position.x-100),y:Math.max(0,box.y+position.y-100),width:200,height:200}});
  // First run's snapshot and browser context stay isolated from player saves.
  assert.deepEqual(errors,[]);
  return {label,ground,errors};
 }finally{await context.close();}
}
async function fallback(browser,url,label,blocked){
 const {context,page,errors}=await launchRun(browser,url,label,{blocked});
 try{
  await page.waitForTimeout(300);
  assert.equal(await page.evaluate(()=>protAnimation),null);
  assert.ok(await page.evaluate(()=>window.__protDraws.some(d=>d.src.endsWith('prot-0001-simple.png')&&d.args.length===4)),'static PROT remains drawable');
  await page.keyboard.down('d');const before=await page.evaluate(()=>player.x);await page.waitForTimeout(100);await page.keyboard.up('d');
  assert.ok(await page.evaluate(()=>player.x)>before,'fallback still moves');
  assert.deepEqual(errors,[]);
  return {label,blocked,errors};
 }finally{await context.close();}
}
(async()=>{
 fs.mkdirSync(output,{recursive:true});
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const http=process.env.GAME_URL||'http://127.0.0.1:8001/';
  const results=[await normal(browser,http,'http'),await normal(browser,pathToFileURL(path.resolve('index.html')).href,'file'),
   await fallback(browser,http,'missing-atlas','prot-0001-walk-v2.png'),
   await fallback(browser,http,'missing-helper','sprite-animation.js'),
   await fallback(browser,http,'missing-manifest','prot-animation.js')];
  fs.writeFileSync(`${output}/prot-runtime-report.json`,JSON.stringify(results,null,2)+'\n');
  console.log('Chrome PROT HTTP/file passed:4directions, moving frames, idle, pause/reset, per-frame ground, alpha and3fallbacks.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
