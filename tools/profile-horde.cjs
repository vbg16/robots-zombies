/* Controlled Chrome CPU/Canvas benchmark. Not a survival test and not displayed FPS. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),os=require('node:os');
const {chromium}=require('playwright');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const sources=Object.fromEntries(['game.js','balance.js'].map(file=>[file,fs.readFileSync(path.join(process.env.HORDE_SOURCE_DIR||'.',file),'utf8')]));
const output=process.env.HORDE_PROFILE_OUTPUT||'outputs/performance/horde-profile.json';
const counts=(process.env.HORDE_COUNTS||'500,2000,5000').split(',').map(Number);
const distributions=(process.env.HORDE_DISTRIBUTIONS||'near,mixed,remote').split(',');
const fixedCalls=process.env.HORDE_FIXED_CALLS===undefined?null:Number(process.env.HORDE_FIXED_CALLS);
if(fixedCalls!==null&&(!Number.isInteger(fixedCalls)||fixedCalls<1||fixedCalls>600))throw Error('HORDE_FIXED_CALLS must be an integer from1to600');
const packages=(process.env.HORDE_PACKAGES||'idle,laser,plasma').split(',');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const context=await browser.newContext({viewport:{width:1280,height:720},deviceScaleFactor:1});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const report={at:new Date().toISOString(),kind:'controlled-headless-chrome-js-canvas-cost',note:'Real game tick/draw/Canvas in Chrome with RAF disabled. Per-call timings exclude GPU completion/compositor/display pacing; not FPS or a human survival rate. Fixtures suppress new waves/bosses, use high HP and player immunity solely to retain the measured population. No living enemy is culled.',sourceHashes:Object.fromEntries(Object.entries(sources).map(([file,source])=>[file,hash(source)])),host:{platform:process.platform,arch:process.arch,cpu:os.cpus()[0]?.model,logicalCpus:os.cpus().length},fixedCalls,samples:[],errors};
 const save=()=>{fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');};
 try{
  await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
  if(process.env.HORDE_SOURCE_DIR)for(const [file,body] of Object.entries(sources))await page.route('**/'+file,route=>route.fulfill({status:200,contentType:'application/javascript',body}));
  await page.goto(process.env.GAME_URL||'http://127.0.0.1:8001/');await page.waitForFunction(()=>window.ScrewBuildGuide&&typeof tick==='function'&&zombieSprites.every(s=>s.complete)&&(!globalThis.ScrewZombieRenderer||ScrewZombieRenderer.ready.filter(Boolean).length===3));
  report.renderDependencyHashes=Object.fromEntries(['enemy-animation.js','zombie-atlases.js','player-weapons.js','prot-animation.js','sprite-animation.js','chassis-atlases.js','boss-visuals.js'].filter(f=>fs.existsSync(f)).map(f=>[f,hash(fs.readFileSync(f))]));
  report.rotorFixtureNote='Only package=rotors:four modules directly installed, no manual fire, stationary near bodies at radius108 to stress continuous orbital contacts. Other package distributions remain unchanged.';
  report.browser=await browser.version();report.viewport=await page.evaluate(()=>({width,height,dpr:devicePixelRatio,canvasWidth:canvas.width,canvasHeight:canvas.height}));
  const loaded=await page.evaluate(async()=>({game:await(await fetch('game.js')).text(),balance:await(await fetch('balance.js')).text()}));
  if(hash(loaded.game)!==report.sourceHashes['game.js']||hash(loaded.balance)!==report.sourceHashes['balance.js'])throw Error('Source changed between Node snapshot and browser load; rerun intentionally.');
  await page.evaluate(fixedCalls=>{
   globalThis.profileFixedCalls=fixedCalls;
   globalThis.profileSetup=function(n,distribution,packageName){
    let seed=20261103;globalThis.profileSeedSnapshot=()=>seed;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    profile.unlockedWeapons=Object.fromEntries(Object.keys(WEAPONS).map(id=>[id,true]));openGarage();selectWeapon('laser');reset();spawn=1e9;bossIndex=1e6;clock=600;player.inv=1e9;
    if(packageName==='plasma')for(const id of ['damage','rate','extra','freeze','pierce','blast','blastRadius','shock','conductivity'])SKILLS.find(s=>s.id===id).apply();
    if(packageName==='sensor-corrosion')for(const id of ['sensor','sensorRange','sensorRelay','sensorLock','corrosion','corrosionFuse','corrosionBloom','corrosionCatalyst','burn','freeze'])SKILLS.find(s=>s.id===id).apply();
    if(packageName==='rotors')for(const id of ['rotors','rotorThird','rotorReach','rotorDrive'])SKILLS.find(s=>s.id===id).apply();
    enemies=Array.from({length:n},(_,i)=>{const angle=i*2.399963229728653,near=distribution==='near'||distribution==='mixed'&&i%5===0,radius=near?(packageName==='rotors'?108:120+(i*53%520)):10000+(i*97%40000),z=createEnemy(player.x+Math.cos(angle)*radius,player.y+Math.sin(angle)*radius);z.hp=z.maxHp=1e9;z.speed=packageName==='rotors'?0:30;return z;});
    aim={x:player.x+120-camera.x,y:player.y-camera.y,active:true};firing=!['idle','rotors'].includes(packageName);
    if(packageName==='sensor-corrosion'){player.sensorTimer=0;for(const z of enemies)applyCorrosion(z,{damage:player.damage});}
   };
   globalThis.profileMeasure=async function(n,distribution,packageName,metric){
    profileSetup(n,distribution,packageName);const dt=1/60;
    for(let i=0;i<(packageName==='plasma'?3:12);i++){if(metric!=='draw')tick(dt);if(metric!=='tick')draw();}
    const times=[],started=performance.now(),limit=profileFixedCalls??(packageName==='plasma'?24:90),budget=packageName==='plasma'?2500:4000;
    for(let i=0;i<limit;i++){
     const t=performance.now();if(metric!=='draw')tick(dt);if(metric!=='tick')draw();times.push(performance.now()-t);
     if(i%6===5)await new Promise(r=>setTimeout(r,0));
     if(profileFixedCalls===null&&times.length>=6&&performance.now()-started>budget)break;
    }
    const sorted=[...times].sort((a,b)=>a-b),sum=times.reduce((a,b)=>a+b,0);
    const wallMs=performance.now()-started;
    const stateSignature=profileFixedCalls===null?undefined:JSON.stringify({seed:profileSeedSnapshot(),state,clock,spawn,shot,kills,level,xp,need,player,enemies,boss,bullets,gems,scrap,sparks,effects,feedback,hostile,hazards,bossIndex,commonWaveIndex,policeUnlocked,runWeapon,runRobot},(k,v)=>v instanceof Set?[...v]:v);
    return {stateSignature,metric,count:n,distribution,package:packageName,calls:times.length,meanMs:sum/times.length,medianMs:sorted[Math.floor(sorted.length*.5)],p95Ms:sorted[Math.min(sorted.length-1,Math.floor(sorted.length*.95))],maxMs:sorted.at(-1),wallMs,enemiesRemaining:enemies.length,bullets:bullets.length,clock,renderSize:{width,height,canvasWidth:canvas.width,canvasHeight:canvas.height},finite:enemies.every(z=>Number.isFinite(z.x)&&Number.isFinite(z.y)&&z.hp>0)};
   };
  },fixedCalls);
  if(!process.env.HORDE_BURST_ONLY)for(const n of counts)for(const distribution of distributions)for(const packageName of packages){
   for(const metric of ['tick','draw','tick+draw']){
    const result=await page.evaluate(async args=>profileMeasure(...args),[n,distribution,packageName,metric]);
    if(result.stateSignature!==undefined){result.stateHash=hash(result.stateSignature);delete result.stateSignature;}
    if(!result.finite||result.enemiesRemaining!==n)throw Error('Fixture population/finite invariant failed');
    report.samples.push(result);save();console.log(n,distribution,packageName,metric,'mean',result.meanMs.toFixed(2),'p95',result.p95Ms.toFixed(2),'ms',result.calls+'calls');
   }
  }
  // Instrumentation is a separate pass; its timings are deliberately not included above.
  if(!process.env.HORDE_SKIP_EVENTS)report.scanCounts=await page.evaluate(()=>{
   profileSetup(2000,'near','plasma');const originalTargets=targets;let calls=0,returned=0;targets=function(){const list=originalTargets();calls++;returned+=list.length;return list;};
   try{for(let i=0;i<18;i++)tick(1/60);return {count:enemies.length,frames:18,targetListCalls:calls,totalReturnedEntries:returned};}finally{targets=originalTargets;}
  });
  report.activeRenderSize=await page.evaluate(()=>({width,height,canvasWidth:canvas.width,canvasHeight:canvas.height}));
  // Event stress separate from population-retention timings: exactly 64 primaries die legitimately.
  report.corrosionDeathBursts=[];
  if(!process.env.HORDE_SKIP_EVENTS)for(const n of counts)for(const distribution of distributions){
   const burst=await page.evaluate(({n,distribution})=>{
    const times=[];let deaths=0,transferred=0;
    for(let trial=0;trial<8;trial++){
     profileSetup(n,distribution,'sensor-corrosion');for(const z of enemies)z.corrosion=null;
     const primaries=enemies.slice(0,64);for(const z of primaries){z.hp=1;z.corrosion={remaining:.001,damage:100,spread:true};}
     const start=performance.now();tickCorrosion(1/60);times.push(performance.now()-start);
     deaths=enemies.filter(z=>z.hp<=0).length;transferred=enemies.filter(z=>z.corrosion?.spread===false).length;
     if(deaths!==64)throw Error('Corrosion event fixture expected 64 legitimate deaths');
    }
    const sorted=times.slice().sort((a,b)=>a-b);return {count:n,distribution,events:64,calls:8,meanMs:times.reduce((a,b)=>a+b,0)/times.length,p95Ms:sorted.at(-1),deaths,transferred};
   },{n,distribution});
   report.corrosionDeathBursts.push(burst);save();console.log('corrosion-death-burst',n,distribution,burst.meanMs.toFixed(2),'ms');
  }
  await page.screenshot({path:path.join(path.dirname(output),'horde-profile.png')});
  if(errors.length)throw Error(errors.join('; '));report.completed=true;save();console.log('Profile:',output);
 }catch(e){errors.push(e.stack||e.message);save();throw e;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
