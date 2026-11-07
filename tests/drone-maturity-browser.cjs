/* Explicit browser fixtures: injected hardware offer/ages, not natural progression or physical-phone proof. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{pathToFileURL}=require('node:url');
function playwright(){for(const p of ['playwright',path.resolve('outputs/01a19005-456e-73d0-885a-224d201dce92/_build/node_modules/playwright')])try{return require(p)}catch(e){if(e.code!=='MODULE_NOT_FOUND')throw e}throw Error('Playwright required; configure NODE_PATH.');}
const out=path.resolve('outputs/build58-maturity-browser');fs.mkdirSync(out,{recursive:true});
const sourceFiles=['game.js','tools/drone-maturity.js','ui-redesign.css','index.html'];
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const report={at:new Date().toISOString(),scope:'Chrome file://, explicit eligible boss offer and injected ages0/30/60/90; no natural-progression, frame-rate or physical-phone claim.',sourceHashes:Object.fromEntries(sourceFiles.map(f=>[f,hash(f)])),errors:[],evidence:[]};
const save=()=>fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');save();
async function visibleRect(page,selector){return page.locator(selector).evaluate(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,visible:r.width>0&&r.height>0&&r.left>=0&&r.top>=0&&r.right<=innerWidth+.5&&r.bottom<=innerHeight+.5};});}
(async()=>{
 const browser=await playwright().chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});report.browser=await browser.version();
 try{
  for(const viewport of [{width:1280,height:900},{width:844,height:390},{width:740,height:360}]){
   const mobile=viewport.width<1000,context=await browser.newContext({viewport,isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1}),page=await context.newPage(),key=viewport.width+'x'+viewport.height;
   page.on('pageerror',e=>report.errors.push({viewport,message:e.message}));await page.addInitScript(()=>{requestAnimationFrame=()=>0;});
   await page.goto(pathToFileURL(path.resolve('index.html')).href);await page.waitForFunction(()=>window.ScrewBalance&&window.ScrewDroneMaturity&&typeof offerBossRelic==='function');await page.waitForFunction(()=>[...document.images].every(i=>i.complete));
   await page.evaluate(()=>{profile=emptyProfile();profile.unlockedRobots.swarm=true;selectedRobot='swarm';selectedWeapon='machine';selectedAuxWeapons=[];reset();spawn=1e9;bossIndex=1e6;clock=50;offerBossRelic({bossName:'FIXTURE BAIA'});});
   assert.equal(await page.evaluate(()=>state),'relic');assert.equal(await page.locator('[data-relic]').count(),3);assert.equal(await page.locator('[data-relic="droneRack"]').count(),1,'eligible Baia present with two universal alternatives');
   const offer={heading:await visibleRect(page,'#heading'),actions:[],decline:await visibleRect(page,'#choices .skip-upgrade')};
   for(let i=0;i<3;i++)offer.actions.push(await visibleRect(page,`[data-relic]:nth-child(${i+1}) .skill-action`));
   assert.ok(offer.heading.visible,'title visible without scrolling');if(mobile){assert.ok(offer.actions.every(a=>a.visible),'all three install labels visible in first fold');assert.ok(offer.decline.visible,'decline visible in first fold');}
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'offer has no horizontal overflow');
   const beforeOffer=await page.evaluate(()=>({clock,spawn,hp:player.hp}));await page.evaluate(()=>tick(999));assert.deepEqual(await page.evaluate(()=>({clock,spawn,hp:player.hp})),beforeOffer,'offer freezes simulation');
   await page.screenshot({path:path.join(out,key+'-offer.png')});await page.locator('[data-relic="droneRack"]').click();assert.equal(await page.evaluate(()=>state),'playing');
   const acquired=await page.evaluate(()=>({start:player.droneGrowthStart,mult:player.droneDamageMult,range:player.droneRange}));assert.deepEqual(acquired,{start:50,mult:1.5,range:384});
   const ages=[];
   for(const [age,tier,factor]of [[0,0,1],[30,1,1.1],[60,2,1.2],[90,3,1.3]]){
    const render=await page.evaluate(age=>{clock=player.droneGrowthStart+age;const before=JSON.stringify(player),time=clock,oldRandom=Math.random,oldRect=ctx.fillRect,leds=[];Math.random=()=>{throw Error('render must not use RNG');};ctx.fillRect=function(x,y,w,h){if(w===2&&h===2)leds.push(this.fillStyle);return oldRect.call(this,x,y,w,h);};try{drawDrones();drawDrones();}finally{Math.random=oldRandom;ctx.fillRect=oldRect;}draw();return {tier:droneMaturity().tier,factor:droneMaturity().damageFactor,unchanged:JSON.stringify(player)===before&&clock===time,leds};},age);
    assert.equal(render.tier,tier);assert.equal(render.factor,factor);assert.ok(render.unchanged,'drawing cannot change maturity/player');assert.equal(render.leds.length,6,'three LED slots per draw');assert.equal(render.leds.filter(c=>c==='#7de7f6').length,tier*2,'LEDs show actual tier');
    await page.evaluate(()=>pause());assert.equal(await page.evaluate(()=>state),'paused');const frozen=await page.evaluate(()=>({clock,start:player.droneGrowthStart,tier:droneMaturity().tier,hp:player.hp}));await page.evaluate(()=>tick(999));assert.deepEqual(await page.evaluate(()=>({clock,start:player.droneGrowthStart,tier:droneMaturity().tier,hp:player.hp})),frozen,'paused time does not train');
    const diagnosis=await page.evaluate(()=>{const rows=Array.from(document.querySelector('.run-attributes').children),index=rows.findIndex(n=>n.textContent==='Dano por drone');return {heading:document.querySelector('.run-stats h3').textContent,damage:rows[index+1].textContent,calibration:rows[rows.findIndex(n=>n.textContent==='Calibração da Baia')+1].textContent,expected:Number((player.damage*.25*player.droneDamageMult*droneMaturity().damageFactor).toFixed(2)).toLocaleString('pt-BR'),installed:document.querySelector('.run-modules').textContent,overflow:document.documentElement.scrollWidth>innerWidth};});
    assert.match(diagnosis.heading,new RegExp('BAIA '+tier+'/3'));assert.equal(diagnosis.damage,diagnosis.expected,'pause reports damage including maturity');assert.match(diagnosis.installed,/BAIA DE COMANDO/);assert.equal(diagnosis.overflow,false);assert.ok(diagnosis.calibration.includes('dano extra +'+tier*10+'%'));assert.match(diagnosis.calibration,/pausa e ofertas não contam/);assert.ok(diagnosis.calibration.includes(tier===3?'MÁXIMO':'próximo em 30 s de combate'));
    await page.screenshot({path:path.join(out,key+'-age'+age+'-pause.png')});ages.push({age,tier,factor,render,diagnosis,pausedClock:frozen.clock});await page.evaluate(()=>pause());assert.equal(await page.evaluate(()=>state),'playing');
   }
   await page.evaluate(()=>reset());assert.deepEqual(await page.evaluate(()=>({maturity:droneMaturity(),owned:player.relics.has('droneRack'),start:player.droneGrowthStart??null,mult:player.droneDamageMult,range:player.droneRange})),{maturity:null,owned:false,start:null,mult:1,range:320},'reset clears every training effect');
   report.evidence.push({viewport,mobileEmulation:mobile,offer,acquired,ages,offerFrozen:true,pausedClockFrozen:true,resetClean:true});save();await context.close();
  }
  assert.deepEqual(report.errors,[]);report.sourceChangedDuringRun=sourceFiles.filter(f=>hash(f)!==report.sourceHashes[f]);assert.deepEqual(report.sourceChangedDuringRun,[]);report.completed=true;save();console.log('Chrome drone maturity: eligible3-card offer, first-fold landscape actions,4injected tiers/LEDs, accurate pause damage, pure render, frozen offers/pause and clean reset passed in3viewports.');
 }finally{await browser.close();}
})().catch(e=>{report.failure={message:e.message,stack:e.stack};save();console.error(e);process.exitCode=1;});
