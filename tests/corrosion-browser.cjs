/* Controlled UI fixtures; injected offers/targets are not survival evidence. Requires Playwright. */
'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));fs.mkdirSync('outputs/build43',{recursive:true});
 try{
  await page.goto(process.env.GAME_URL||'http://127.0.0.1:8001/');await page.waitForFunction(()=>window.ScrewBuildGuide);
  assert.equal(await page.evaluate(()=>ScrewBalance.catalog.length),78);
  await page.locator('#enter-garage').click();assert.equal(await page.locator('[data-module^="corrosion"]').count(),4);
  await page.locator('#launch').click();await page.locator('#deploy-run').click();
  await page.evaluate(()=>{spawn=10000;upgrade('level',availableSkills().filter(s=>s.id!=='corrosion').map(s=>s.id));});
  await page.locator('[data-skill="corrosion"]').click();assert.equal(await page.locator('#module-detail .module-branch').count(),4);
  assert.ok(await page.locator('[data-skill="corrosion"] img').evaluate(e=>e.complete&&e.naturalWidth>0));
  await page.screenshot({path:'outputs/build43/corrosion-workbench-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});assert.ok(await page.locator('#overlay').evaluate(e=>e.scrollWidth<=e.clientWidth+2));await page.screenshot({path:'outputs/build43/corrosion-workbench-mobile.png',fullPage:true});
  await page.locator('#confirm-upgrade').click();assert.equal(await page.evaluate(()=>player.skills.corrosion),1);assert.equal(await page.evaluate(()=>profile.bolts),0);
  await page.setViewportSize({width:1440,height:1000});
  await page.evaluate(()=>{enemies=[createEnemy(player.x+140,player.y)];enemies[0].hp=1000;enemies[0].speed=0;impact(enemies[0],{damage:10,vx:1,vy:0});state='paused';});
  const remaining=await page.evaluate(()=>enemies[0].corrosion.remaining);await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>enemies[0].corrosion.remaining),remaining);await page.screenshot({path:'outputs/build43/corrosion-marker.png',fullPage:true});
  // Real previous catalog, edited values and a custom ID that now collides even though both conditions are empty.
  const legacy=JSON.parse(fs.readFileSync('tests/fixtures/balance-catalog-v42.json','utf8'));legacy[0].name='EDIÇÃO ANTIGA PRESERVADA';
  const custom=structuredClone(legacy[0]);Object.assign(custom,{id:'corrosionFuse',name:'MEU FUSÍVEL ANTIGO',condition:'',prerequisites:[]});legacy.push(custom);
  await page.evaluate(legacy=>{localStorage.setItem('screwvivors.balance.draft.v1',JSON.stringify({version:1,catalogRevision:2,skills:legacy}));},legacy);
  const editor=await context.newPage();editor.on('pageerror',e=>errors.push(e.message));await editor.goto((process.env.GAME_URL||'http://127.0.0.1:8001/')+'?painel=skills');await editor.getByRole('button',{name:'Aplicar ao jogo',exact:true}).waitFor();
  const draft=await editor.evaluate(()=>JSON.parse(localStorage.getItem('screwvivors.balance.draft.v1')));assert.equal(draft.catalogRevision,4);assert.equal(draft.skills.length,79);assert.equal(draft.skills[0].name,'EDIÇÃO ANTIGA PRESERVADA');assert.ok(draft.skills.some(s=>s.id==='custom-corrosionFuse'));
  await editor.getByRole('button',{name:'Aplicar ao jogo',exact:true}).click();assert.equal(await editor.evaluate(()=>ScrewBalance.load().length),79);
  await page.evaluate(()=>{state='playing';SKILLS.find(s=>s.id==='corrosionFuse').apply();});assert.equal(await page.evaluate(()=>player.corrosionDelayMult),.5);
  await page.evaluate(()=>{reset();SKILLS.find(s=>s.id==='corrosion').apply();});assert.equal(await page.evaluate(()=>SKILLS.some(s=>s.id==='custom-corrosionFuse')),true,'migrated custom modifier participates only in the next run');
  assert.deepEqual(errors,[]);
  console.log('Chrome passed: corrosion tree/icons, manual, desktop/mobile, installation, frozen visible charge and real70→78 migration with a custom collision.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
