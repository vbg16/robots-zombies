/* Chrome UI fixtures: milestones are injected, not claimed as earned progression. Requires Playwright. */
'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));fs.mkdirSync('outputs/build41',{recursive:true});
 try{
  await page.goto(process.env.GAME_URL||'http://127.0.0.1:8001/');await page.waitForFunction(()=>window.ScrewBuildGuide&&document.getElementById('build-project-dialog'));
  await page.locator('#open-build-guide').click();const guide=page.locator('[data-build-id="demolicao-de-campo"]');await guide.getByRole('button',{name:'ACOMPANHAR GUIA',exact:true}).click();
  await page.getByRole('button',{name:'FECHAR ×',exact:true}).click();await page.locator('#enter-garage').click();
  assert.equal(await page.locator('#weapon-refit-options article').count(),2);
  await page.evaluate(()=>{profile.unlockedWeapons=Object.fromEntries(Object.keys(WEAPONS).map(id=>[id,true]));selectWeapon('grenade');});
  assert.ok(await page.locator('#weapon-refit-options').textContent().then(s=>s.includes('CARGA BIFURCADA')));
  await page.locator('#launch').click();await page.locator('#deploy-run').click();
  await page.evaluate(()=>{level=19;xp=need;spawn=10000;tick(.01);});await page.locator('[data-evolution]').first().waitFor();
  assert.equal(await page.locator('[data-evolution]').count(),2);
  assert.equal(await page.locator('[data-evolution="grenade-doubleShell"]').getAttribute('data-guide-recommended'),'true');
  const clock=await page.evaluate(()=>clock);await page.waitForTimeout(250);assert.equal(await page.evaluate(()=>clock),clock,'RAF freezes during refit');
  await page.screenshot({path:'outputs/build41/refit-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});
  assert.ok(await page.locator('#overlay').evaluate(e=>e.scrollWidth<=e.clientWidth+2),'mobile refit has no horizontal overflow');
  await page.screenshot({path:'outputs/build41/refit-mobile.png',fullPage:true});
  const refuse=page.getByRole('button',{name:'MANTER ARMA ATUAL [R]',exact:true});await refuse.scrollIntoViewIfNeeded();const refusalBox=await refuse.boundingBox();assert.ok(refusalBox.y>=0&&refusalBox.y+refusalBox.height<=844,'refusal is reachable by scrolling on mobile');await page.screenshot({path:'outputs/build41/refit-mobile-footer.png',fullPage:true});
  await page.keyboard.press('2');assert.equal(await page.evaluate(()=>player.weaponEvolution.id),'grenade-doubleShell');
  assert.ok(await page.locator('#weapon-name').textContent().then(s=>s.includes('CARGA BIFURCADA')));
  for(const weapon of await page.evaluate(()=>Object.keys(WEAPONS)))for(const slot of [0,1]){
   const result=await page.evaluate(({weapon,slot})=>{openGarage();selectWeapon(weapon);reset();spawn=10000;level=19;xp=need;tick(.01);const p=JSON.stringify(profile),ammo=player.ammo,evo=offeredWeaponEvolutions[slot];chooseWeaponEvolution(evo.id,offerVersion);return {id:player.weaponEvolution.id,expected:evo.id,weapon:runWeapon.id,selected:selectedWeapon,profile:JSON.stringify(profile)===p,ammo:player.ammo===ammo};},{weapon,slot});
   assert.equal(result.id,result.expected);assert.equal(result.weapon,weapon);assert.equal(result.selected,weapon);assert.equal(result.profile,true);assert.equal(result.ammo,true);
  }
  const locked=await page.evaluate(()=>{openGarage();return ScrewBuildGuide.selectBuild('lanca-de-fuga');});assert.equal(locked.ok,false,'new NANO recipe stays locked before purchase');
  const loadout=await page.evaluate(()=>{profile.bolts=24;profile.bossParts.scrapper=1;const bought=purchaseGear('robots','nano');const selected=ScrewBuildGuide.selectBuild('lanca-de-fuga');return {bought,selected,robot:selectedRobot,weapon:selectedWeapon,bolts:profile.bolts,parts:profile.bossParts.scrapper};});
  assert.equal(loadout.bought,true);assert.equal(loadout.selected.ok,true);assert.equal(loadout.robot,'nano');assert.equal(loadout.weapon,'harpoon');assert.equal(loadout.bolts,0);assert.equal(loadout.parts,0);
  await page.locator('#launch').click();assert.equal(await page.locator('#config-robot').textContent(),'NANO-0005');await page.locator('#deploy-run').click();
  assert.equal(await page.evaluate(()=>player.hp),110);assert.equal(await page.evaluate(()=>player.acquired.size),0,'revised guide grants no modules');
  await page.evaluate(()=>{openGarage();selectedRobot='forge';openRunConfig();});assert.equal(await page.locator('#config-portrait').getAttribute('src'),'assets/robots/forj-0003-portrait-v3.svg');
  assert.equal(await page.locator('#config-portrait').evaluate(e=>e.style.filter),'none');
  assert.deepEqual(errors,[]);
  console.log('Chrome passed: 24 refits, guide, frozen RAF, keyboard/mobile, NANO purchase and revised loadout, no free modules, FORJ preview.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
