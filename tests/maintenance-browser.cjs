'use strict';
// Controlled file:// browser fixtures. Not natural play, FPS or a physical phone.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{pathToFileURL}=require('node:url');
const {chromium}=require(process.env.NODE_PATH?path.join(process.env.NODE_PATH,'playwright'):path.resolve('outputs/01a19005-456e-73d0-885a-224d201dce92/_build/node_modules/playwright'));
const out=path.resolve('outputs/maintenance-browser63');fs.mkdirSync(out,{recursive:true});
const files=['game.js','balance.js','index.html','ui-redesign.css','audio.js'],hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const result={kind:'controlled-browser-fixtures',at:new Date().toISOString(),sourceHashes:Object.fromEntries(files.map(f=>[f,hash(f)])),viewports:[],errors:[]};
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});try{
 for(const vp of [{width:1280,height:900},{width:844,height:390},{width:740,height:360}]){
  const context=await browser.newContext({viewport:vp,hasTouch:true});const p=await context.newPage();p.on('pageerror',e=>result.errors.push(e.message));
  await p.addInitScript(()=>{window.requestAnimationFrame=()=>0});await p.goto(pathToFileURL(path.resolve('index.html')).href);
  await p.evaluate(()=>{profile=emptyProfile();profile.unlockedRobots=Object.fromEntries(Object.keys(ROBOTS).map(id=>[id,true]));profile.unlockedWeapons=Object.fromEntries(Object.keys(WEAPONS).map(id=>[id,true]));selectedRobot='swarm';selectedWeapon='machine';selectedAuxWeapons=['shotgun','laser'];reset();spawn=1e6;hordeDirector.cooldown=1e6;clock=6;for(const id of ['reserveBank','shock','shield','shieldDrive','cleanCircuit','sensor','pulseRecovery']){const skill=SKILLS.find(s=>s.id===id);if(!skill.available())throw Error('Unavailable fixture skill '+id);skill.apply()}bossIndex=0;spawnBoss();bossIndex=1e6;player.inv=1e6;updateHUD();draw()});
  const entry={viewport:vp};entry.layout=await p.evaluate(()=>{
   const rect=id=>{const r=el(id).getBoundingClientRect();return{x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height}};
   const parent=el('reserve-hud').parentElement.getBoundingClientRect();return{bank:rect('reserve-hud'),value:rect('reserve-value'),status:rect('maintenance-status'),fillTrack:rect('reserve-track'),parent:{x:parent.x,right:parent.right},boss:rect('boss-hud'),track:el('reserve-track').getAttribute('aria-valuenow'),text:el('maintenance-status').textContent,overflow:document.documentElement.scrollWidth>innerWidth};
  });
  assert.equal(entry.layout.overflow,false);assert.equal(entry.layout.track,'20');assert.match(entry.layout.text,/CIRCUITO 0\/2.*PONTE \+20%/);
  for(const key of ['bank','value','status']){const r=entry.layout[key];assert.ok(r.width>0&&r.height>0&&r.x>=0&&r.y>=0&&r.right<=vp.width&&r.bottom<=vp.height,JSON.stringify({key,r}));}
  assert.ok(entry.layout.bank.x>=entry.layout.parent.x-.5&&entry.layout.bank.right<=entry.layout.parent.right+.5,'bank inside robot data');assert.ok(entry.layout.fillTrack.right<=entry.layout.bank.right+.5,'track inside bank');assert.ok(entry.layout.value.right<=entry.layout.bank.right+.5,'number inside bank');
  const a=entry.layout.bank,b=entry.layout.boss;assert.ok(a.right<=b.x||a.x>=b.right||a.bottom<=b.y||a.y>=b.bottom,'bank must not overlap boss');
  await p.screenshot({path:path.join(out,'active-'+vp.width+'.png')});
  entry.transitions=await p.evaluate(()=>{player.cleanCircuitElapsed=30;player.inv=0;hurtPlayer(12,player.x-30,player.y);updateHUD();const shield={hp:player.hp,bank:player.reserveBank.value,ready:player.shieldReady,time:player.shieldTimer,text:el('maintenance-status').textContent};player.inv=0;const beforeHp=player.hp;hurtPlayer(12,player.x-30,player.y);updateHUD();const reserve={hp:player.hp,beforeHp,bank:player.reserveBank.value,text:el('reserve-value').textContent};const returnHp=healPlayer(10);updateHUD();return{shield,reserve,returnHp,afterHeal:player.reserveBank.value}});
  assert.equal(entry.transitions.shield.ready,false);assert.equal(entry.transitions.shield.bank,20);assert.match(entry.transitions.shield.text,/CIRCUITO 0\/2.*INATIVA/);assert.equal(entry.transitions.reserve.hp,entry.transitions.reserve.beforeHp);assert.ok(entry.transitions.reserve.bank<20);assert.equal(entry.transitions.returnHp,0);assert.equal(entry.transitions.afterHeal,entry.transitions.reserve.bank+5);
  entry.freeze=await p.evaluate(()=>{pause();const before=JSON.stringify({bank:player.reserveBank,time:player.cleanCircuitElapsed,slots:weaponSlots});tick(9);draw();return before===JSON.stringify({bank:player.reserveBank,time:player.cleanCircuitElapsed,slots:weaponSlots})});assert.equal(entry.freeze,true);
  await p.evaluate(()=>{reset();updateHUD()});assert.equal(await p.locator('#reserve-hud').isVisible(),false);assert.ok(await p.evaluate(()=>!player.reserveBank&&!player.skills.cleanCircuit&&!player.acquired.has('reserveBank')));
  entry.passed=true;result.viewports.push(entry);await context.close();
 }
 assert.deepEqual(result.errors,[]);result.sourceChanges=files.filter(f=>hash(f)!==result.sourceHashes[f]);assert.deepEqual(result.sourceChanges,[]);result.passed=true;console.log('Maintenance browser: 3 viewports, reserve/HP/shield separation, conditions, healing, pause/reset and boss non-overlap passed.');
 }catch(e){result.error={message:e.message,stack:e.stack};throw e}finally{fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(result,null,2));await browser.close()}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
