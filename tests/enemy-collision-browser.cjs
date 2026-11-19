'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{pathToFileURL}=require('node:url');
const {chromium}=require(path.join(process.env.NODE_PATH,'playwright'));
(async()=>{
 const output=path.resolve(process.env.COLLISION_OUTPUT||'outputs/enemy-collision-browser');fs.mkdirSync(output,{recursive:true});
 const source=['game.js','tools/enemy-collision.js','index.html'],hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
 const report={sourceHashes:Object.fromEntries(source.map(f=>[f,hash(f)])),scope:'Offline Chrome, protected short manual-time geometry fixtures. No natural balance, bot changes, soak or hardware/FPS measurements.',viewports:[],errors:[],missing:[]};
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{for(const vp of [{width:1280,height:900},{width:844,height:390},{width:740,height:360}]){
  const context=await browser.newContext({viewport:vp,offline:true,isMobile:vp.width<1000,hasTouch:vp.width<1000}),page=await context.newPage();
  page.on('pageerror',e=>report.errors.push(e.message));page.on('requestfailed',r=>report.missing.push(r.url()));
  await page.addInitScript(()=>requestAnimationFrame=()=>0);await page.goto(pathToFileURL(path.resolve('index.html')).href);
  await page.locator('#enter-garage').click();await page.locator('#launch').click();await page.locator('#deploy-run').click();
  await page.evaluate(()=>{spawn=1e6;hordeDirector.cooldown=1e6;bossIndex=1e6;player.inv=1e6;enemies=Array.from({length:40},(_,i)=>Object.assign(createEnemy(player.x+220,player.y+(i%2)),{r:14,speed:32,hp:100,maxHp:100}));enemies[0].minionType='runner';enemies[1].enemyType='shieldPolice';enemies[1].shieldHp=0;preparePoliceCharge(enemies[1]);draw()});
  await page.screenshot({path:path.join(output,'before-'+vp.width+'.png')});
  await page.evaluate(()=>{for(let i=0;i<120;i++)tick(.04);draw()});
  const measure=()=>{let maximum=0,coincident=0;for(let i=0;i<enemies.length;i++)for(let j=i+1;j<enemies.length;j++){const a=enemies[i],b=enemies[j],distance=Math.hypot(a.x-b.x,a.y-b.y);maximum=Math.max(maximum,Math.max(18,a.r)+Math.max(18,b.r)-distance);if(distance<1)coincident++;}return{count:enemies.length,maximumBodyPenetration:maximum,coincident,finite:enemies.every(z=>[z.x,z.y,z.hp].every(Number.isFinite)),hp:enemies.map(z=>z.hp),noHorizontalOverflow:document.documentElement.scrollWidth<=innerWidth+1}};
  const stationary=await page.evaluate(measure);assert.equal(stationary.count,40);assert.equal(stationary.coincident,0);assert.ok(stationary.maximumBodyPenetration<1);assert.ok(stationary.finite&&stationary.noHorizontalOverflow);assert.ok(stationary.hp.every(h=>h===100));
  await page.screenshot({path:path.join(output,'after-'+vp.width+'.png')});
  await page.keyboard.down('a');await page.evaluate(()=>{for(let i=0;i<60;i++)tick(.04);draw()});await page.keyboard.up('a');const fleeing=await page.evaluate(measure);assert.equal(fleeing.count,40);assert.equal(fleeing.coincident,0);assert.ok(fleeing.maximumBodyPenetration<1);
  await page.locator('#pause').click();const paused=await page.evaluate(()=>JSON.stringify(enemies));await page.evaluate(()=>{tick(.5);draw()});assert.equal(await page.evaluate(()=>JSON.stringify(enemies)),paused);
  report.viewports.push({viewport:vp,stationary,fleeing,paused:true});await context.close();
 }assert.deepEqual(report.errors,[]);assert.deepEqual(report.missing,[]);report.sourceChanges=source.filter(f=>hash(f)!==report.sourceHashes[f]);assert.deepEqual(report.sourceChanges,[]);report.passed=true;}
 finally{await browser.close();fs.writeFileSync(path.join(output,'result.json'),JSON.stringify(report,null,2))}
 console.log('Zombie body collision:3offline viewports, coincident pile to separated pack, mixed runners/police, fleeing, pause and HP preservation passed.');
})().catch(e=>{console.error(e);process.exitCode=1});
