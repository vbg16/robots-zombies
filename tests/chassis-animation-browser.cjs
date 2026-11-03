'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{
 fs.mkdirSync('outputs/chassis-animation',{recursive:true});
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true}),results=[];
 try{
  for(const [label,url] of [['http',process.env.GAME_URL||'http://127.0.0.1:8001/'],['file',pathToFileURL(path.resolve('index.html')).href]]){
   const context=await browser.newContext({viewport:{width:1280,height:900}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});await page.goto(url);await page.waitForFunction(()=>window.ScrewBuildGuide&&chassisAnimations.size===5);
   await page.evaluate(()=>{profile.unlockedRobots=Object.fromEntries(Object.keys(ROBOTS).map(id=>[id,true]));openGarage();});
   for(const id of ['bastion','forge','volt','nano','swarm']){
    await page.evaluate(id=>{openGarage();selectRobot(id);openRunConfig();},id);
    const portrait=await page.locator('#config-portrait').getAttribute('src');assert.equal(portrait,await page.evaluate(id=>ScrewChassisAtlases[id].portrait,id));assert.equal(await page.locator('#config-portrait').evaluate(e=>e.style.filter),'none');
    const evidence=await page.evaluate(id=>{
     reset();spawn=1e9;player.inv=1e9;const a=chassisAnimations.get(id),start={hp:player.hp,maxHp:player.maxHp,speed:player.speed,armor:player.armor};
     for(const [direction,key] of [['down','s'],['right','d'],['up','w'],['left','a']]){keys.add(key);tick(.12);const x=a.frame.x;if(a.clip!=='walk.'+direction)throw Error('wrong facing');tick(.12);if(a.frame.x===x)throw Error('static walking frame');draw();keys.clear();tick(.01);if(a.clip!=='idle.'+direction)throw Error('missing idle');}
     keys.add('d');tick(.1);pause();const before={time:a.time,clip:a.clip,clock};tick(2);draw();const frozen=JSON.stringify(before)===JSON.stringify({time:a.time,clip:a.clip,clock});pause();
     reset();spawn=1e9;const resetOK=a.time===0&&a.clip==='idle.down'&&player.facing==='down';draw();return {start,frozen,resetOK,image:a.image.src};
    },id);assert.equal(evidence.frozen,true);assert.equal(evidence.resetOK,true);
    await page.screenshot({path:`outputs/chassis-animation/${id}-${label}.png`});results.push({label,id,portrait,...evidence});
   }
   if(label==='http'){
    await page.evaluate(()=>{const box=document.createElement('div');box.id='chassis-contacts';box.style.cssText='position:absolute;inset:0;z-index:99999;background:#102532;width:800px';document.body.append(box);for(const [id,atlas] of Object.entries(ScrewChassisAtlases)){const canvas=document.createElement('canvas');canvas.id='contact-'+id;canvas.width=800;canvas.height=360;canvas.style.cssText='width:800px;height:360px;display:block';box.append(canvas);const c=canvas.getContext('2d'),image=chassisAnimations.get(id).image,anim=new SpriteAnimation(image,atlas.clips,{scale:atlas.scale});c.fillStyle='#102532';c.fillRect(0,0,800,360);c.font='12px monospace';c.imageSmoothingEnabled=false;for(const [row,direction] of ['down','right','up','left'].entries()){c.fillStyle='#d4e5ee';c.fillText(id+' '+direction,4,row*90+12);for(let i=0;i<8;i++){anim.play('walk',direction);anim.time=i*100;anim.draw(c,70+i*95,row*90+80);}}}});
    for(const id of ['bastion','forge','volt','nano','swarm'])await page.locator('#contact-'+id).screenshot({path:`outputs/chassis-animation/${id}-contact.png`});
   }
   assert.deepEqual(errors,[]);await context.close();
  }
  const context=await browser.newContext(),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/forj-0003-walk-v3.png',route=>route.abort());await page.goto(process.env.GAME_URL||'http://127.0.0.1:8001/');await page.waitForFunction(()=>window.ScrewBuildGuide&&robotSprite?.complete&&chassisAnimations.has('forge'));assert.equal(await page.evaluate(()=>{profile.unlockedRobots.forge=true;openGarage();selectRobot('forge');reset();spawn=1e9;draw();return chassisAnimations.get('forge').image.src.endsWith('forj-0003-walk-v2.svg');}),true);assert.deepEqual(errors,[]);await context.close();
  const legacy=await browser.newContext(),legacyPage=await legacy.newPage();await legacyPage.route('**/forj-0003-walk-v3.png',route=>route.abort());await legacyPage.route('**/forj-0003-walk-v2.svg',route=>route.abort());await legacyPage.goto(process.env.GAME_URL||'http://127.0.0.1:8001/');await legacyPage.waitForFunction(()=>window.ScrewBuildGuide&&robotSprite?.complete&&chassisAnimations.size===4);await legacyPage.waitForTimeout(50);assert.equal(await legacyPage.evaluate(()=>{profile.unlockedRobots.forge=true;openGarage();selectRobot('forge');reset();draw();return !chassisAnimations.has('forge')&&robotSprite.naturalWidth>0;}),true);await legacy.close();
  fs.writeFileSync('outputs/chassis-animation/report.json',JSON.stringify({results,missingAtlasVectorFallback:true,doubleFailureLegacyFallback:true},null,2)+'\n');console.log('Chrome HTTP/file:5unique chassis/portraits, four directions, moving frames, idle, pause/reset, vector and legacy fallbacks passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
