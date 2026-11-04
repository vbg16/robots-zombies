/* Chrome fixtures install gear and inject milestones. They do not prove natural progression or balance. */
'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
const output='outputs/advanced-loadout';
const close=(actual,expected,note)=>assert.ok(Math.abs(actual-expected)<1e-8,note+': '+actual+' vs '+expected);
(async()=>{
 fs.mkdirSync(output,{recursive:true});
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const context=await browser.newContext({viewport:{width:1280,height:900}}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 // Deterministic input/frame assertions; no wall-clock combat runs between browser calls.
 await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
 try{
  await page.goto(process.env.GAME_URL||'http://127.0.0.1:8001/');await page.waitForFunction(()=>window.ScrewBuildGuide&&document.querySelector('#build-project-dialog'));
  await page.locator('#enter-garage').click();assert.equal(await page.locator('#aux-weapon-options').isVisible(),false);await page.locator('#robot-bastion').click();assert.equal(await page.evaluate(()=>selectedRobot),'prot','locked advanced chassi cannot grant slots');
  await page.evaluate(()=>{profile.unlockedWeapons=Object.fromEntries(Object.keys(WEAPONS).map(id=>[id,true]));profile.unlockedRobots=Object.fromEntries(Object.keys(ROBOTS).map(id=>[id,true]));renderLoadout();});
  await page.locator('#robot-bastion').click();assert.equal(await page.locator('#aux-weapon-options select').count(),1);
  await page.evaluate(()=>{profile.unlockedWeapons.rocket=false;renderLoadout();});assert.equal(await page.locator('#aux-weapon-0 option[value="rocket"]').count(),0,'locked weapon is not an auxiliary option');await page.evaluate(()=>{profile.unlockedWeapons.rocket=true;renderLoadout();});
  await page.locator('#aux-weapon-0').selectOption('shotgun');assert.deepEqual(await page.evaluate(()=>selectedLoadout()),['machine','shotgun']);
  assert.match(await page.locator('#loadout-cost').textContent(),/70%.*90%/);
  await page.locator('#launch').click();assert.match(await page.locator('#config-weapon').textContent(),/Metralhadora \+ Escopeta.*70%.*90%/);
  await page.locator('#deploy-run').click();assert.equal(await page.evaluate(()=>weaponSlots.length),2);close(await page.evaluate(()=>player.damage),22*.7,'dual damage');close(await page.evaluate(()=>player.speed),155*.9,'dual speed');assert.equal(await page.locator('#aux-ammo [data-weapon-slot]').count(),1);
  assert.equal(await page.evaluate(()=>selectAuxWeapon(0,'sniper')),false,'cannot alter a deployed loadout');
  await page.evaluate(()=>openGarage());await page.locator('#robot-swarm').click();await page.locator('#weapon-machine').click();
  await page.locator('#aux-weapon-0').selectOption('burst');await page.locator('#aux-weapon-1').selectOption('rocket');
  assert.deepEqual(await page.evaluate(()=>selectedLoadout()),['machine','burst','rocket']);
  assert.equal(await page.locator('#aux-weapon-1 option[value="burst"]').count(),0,'other auxiliary selection is excluded');assert.equal(await page.locator('#aux-weapon-0 option[value="machine"]').count(),0,'primary is excluded');
  assert.match(await page.locator('#loadout-cost').textContent(),/55%.*80%/);
  await page.screenshot({path:output+'/garage-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});
  assert.ok(await page.locator('#garage').evaluate(e=>e.scrollWidth<=e.clientWidth+2),'mobile garage has no horizontal overflow');
  for(const id of ['#aux-weapon-0','#aux-weapon-1']){await page.locator(id).scrollIntoViewIfNeeded();const box=await page.locator(id).boundingBox();assert.ok(box.width<=390&&box.height>=44,'mobile select remains usable');}
  await page.screenshot({path:output+'/garage-mobile.png',fullPage:true});
  await page.setViewportSize({width:1280,height:900});await page.locator('#launch').click();assert.match(await page.locator('#config-weapon').textContent(),/Metralhadora \+ Fuzil de rajada \+ Lança-foguetes.*55%.*80%/);
  await page.locator('#deploy-run').click();
  await page.evaluate(()=>{spawn=1e9;bossIndex=1e6;globalThis.heldProps=[];const original=window.drawPlayerWeapon;window.drawPlayerWeapon=(c,pose)=>{heldProps.push({...pose});return original(c,pose);};draw();});
  assert.deepEqual(await page.evaluate(()=>weaponSlots.map(s=>s.weapon.id)),['machine','burst','rocket']);
  close(await page.evaluate(()=>player.damage),22*.55,'triple primary damage');close(await page.evaluate(()=>weaponSlots[1].damage),14*.55,'triple auxiliary damage');close(await page.evaluate(()=>player.speed),170*.8,'triple movement');assert.equal(await page.evaluate(()=>player.hp),95,'shared HP unchanged');
  assert.equal(await page.locator('#aux-ammo [data-weapon-slot]').count(),2);
  const box=await page.locator('#game').boundingBox();await page.mouse.move(box.x+box.width*.8,box.y+box.height*.5);await page.mouse.down();await page.evaluate(()=>{tick(.01);draw();});
  assert.deepEqual(await page.evaluate(()=>weaponSlots.map(s=>s.ammo)),[23,29,0]);assert.ok(await page.evaluate(()=>weaponSlots[2].reloadTime>4.7));assert.equal(await page.evaluate(()=>weaponSlots[1].bursts.length),2);
  assert.deepEqual(await page.evaluate(()=>[...new Set(heldProps.map(p=>p.id))].sort()),['burst','machine','rocket']);
  const poses=await page.evaluate(()=>heldProps.slice(-3));assert.equal(new Set(poses.map(p=>p.x+','+p.y)).size,3,'weapon props occupy distinct mounts');assert.ok(poses.every(p=>Math.abs(p.angle-poses[0].angle)<1e-10),'all mounts follow the same manual aim');assert.ok(poses.every(p=>p.recoil>0),'actual emissions animate each mounted weapon');
  await page.mouse.up();assert.ok(await page.evaluate(()=>weaponSlots.every(s=>s.bursts.length===0)),'pointer release immediately cancels every burst');
  await page.keyboard.press('r');assert.ok(await page.evaluate(()=>weaponSlots.every(s=>s.reloadTime>0)),'R starts missing-ammo reloads for all weapons');
  await page.evaluate(()=>{tick(.1);draw();});assert.deepEqual(await page.evaluate(()=>weaponSlots.map(s=>s.ammo)),[24,30,0]);assert.ok(await page.evaluate(()=>weaponSlots[2].reloadTime>4.6),'one reload completing does not complete another');
  await page.screenshot({path:output+'/arena-desktop.png'});
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>draw());
  await page.screenshot({path:output+'/arena-mobile.png'});

  assert.ok(await page.locator('.combat-build').evaluate(e=>e.scrollWidth<=e.clientWidth+2),'mobile arsenal HUD has no horizontal overflow');
  const hud=await page.locator('#aux-ammo').boundingBox();assert.ok(hud.x>=0&&hud.x+hud.width<=392,'all auxiliary ammo panels fit the viewport');
  await page.screenshot({path:output+'/arena-mobile.png'});
  await page.keyboard.press('p');const frozen=await page.evaluate(()=>JSON.stringify({clock,weaponSlots,player}));await page.evaluate(()=>{tick(10);draw();});assert.equal(await page.evaluate(()=>JSON.stringify({clock,weaponSlots,player})),frozen,'pause freezes all weapon state and render is pure');
  await page.keyboard.press('p');
  await page.evaluate(()=>{level=20;globalThis.beforeRefitAmmo=weaponSlots.map(s=>s.ammo);globalThis.beforeRefitReload=weaponSlots.map(s=>s.reloadTime);offerWeaponEvolution();globalThis.firstVersion=offerVersion;globalThis.firstChoice=offeredWeaponEvolutions[0].id;});
  assert.equal(await page.evaluate(()=>evolutionSlotIndex),0);assert.equal(await page.locator('[data-evolution]').count(),2);
  const refitClock=await page.evaluate(()=>clock);await page.evaluate(()=>tick(2));assert.equal(await page.evaluate(()=>clock),refitClock);
  assert.ok(await page.locator('#overlay').evaluate(e=>e.scrollWidth<=e.clientWidth+2),'mobile sequential refit has no overflow');await page.screenshot({path:output+'/refit-mobile.png',fullPage:true});
  await page.keyboard.press('1');assert.equal(await page.evaluate(()=>state),'evolution');assert.equal(await page.evaluate(()=>evolutionSlotIndex),1);assert.equal(await page.evaluate(()=>chooseWeaponEvolution(firstChoice,firstVersion)),false,'old callback cannot affect the next weapon');
  await page.keyboard.press('r');assert.equal(await page.evaluate(()=>state),'evolution');assert.equal(await page.evaluate(()=>evolutionSlotIndex),2);
  await page.keyboard.press('2');assert.equal(await page.evaluate(()=>state),'playing');assert.deepEqual(await page.evaluate(()=>weaponSlots.map(s=>!!s.weaponEvolution)),[true,false,true]);assert.equal(await page.evaluate(()=>clock),refitClock);
  assert.deepEqual(await page.evaluate(()=>weaponSlots.map(s=>s.ammo)),await page.evaluate(()=>beforeRefitAmmo));assert.deepEqual(await page.evaluate(()=>weaponSlots.map(s=>s.reloadTime)),await page.evaluate(()=>beforeRefitReload),'refit choices preserve all reload progress');
  await page.evaluate(()=>reset());assert.deepEqual(await page.evaluate(()=>weaponSlots.map(s=>s.weapon.id)),['machine','burst','rocket']);assert.ok(await page.evaluate(()=>weaponSlots.every(s=>!s.weaponEvolution&&s.reloadTime===0&&s.shotCount===0)));
  await page.evaluate(()=>openGarage());await page.locator('#robot-prot').click();assert.equal(await page.locator('#aux-weapon-options').isVisible(),false);assert.deepEqual(await page.evaluate(()=>selectedLoadout()),['machine']);
  await page.evaluate(()=>{selectRobot('swarm');selectAuxWeapon(0,'shotgun');selectAuxWeapon(1,'tesla');globalThis.guideResult=ScrewBuildGuide.selectBuild(window.ScrewBuilds.builds[0].id);});assert.equal(await page.evaluate(()=>guideResult.ok),true);assert.deepEqual(await page.evaluate(()=>selectedAuxWeapons),[],'recipe selects its advertised one-weapon loadout');
  // Classic scripts and sprites must also support the downloaded local ZIP.
  const offline=await context.newPage();offline.on('pageerror',e=>errors.push('file: '+e.message));await offline.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
  await offline.goto(pathToFileURL(path.resolve('index.html')).href);await offline.waitForFunction(()=>window.ScrewBuildGuide);
  const local=await offline.evaluate(()=>{profile.unlockedRobots.swarm=true;profile.unlockedWeapons.burst=true;profile.unlockedWeapons.rocket=true;openGarage();selectRobot('swarm');selectAuxWeapon(0,'burst');selectAuxWeapon(1,'rocket');reset();spawn=1e9;aim={x:900,y:300,active:true};firing=true;tick(.01);draw();return {count:weaponSlots.length,ammo:weaponSlots.map(s=>s.ammo)};});assert.equal(local.count,3);assert.deepEqual(local.ammo,[23,29,0]);await offline.close();
  assert.deepEqual(errors,[]);
  fs.writeFileSync(output+'/browser-report.json',JSON.stringify({kind:'controlled-browser-ui-fixtures',browser:await browser.version(),viewports:[{width:1280,height:900},{width:390,height:844}],offlineFile:true,errors,passed:true,note:'Gear ownership and level20 are injected. RAF is disabled; actual DOM input plus explicit game ticks test behavior, not natural progression or displayed FPS.'},null,2)+'\n');
  console.log('Chrome advanced loadout passed: dual/triple DOM selection, costs, independent fire/reload/HUD/props, cancellation, sequential refits/stale callbacks, mobile, pause/reset, guide and file://.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
