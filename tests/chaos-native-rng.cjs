/* Compare only RNG implementation in the same restored, synthetic current-chaos fixture. Not FPS. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),http=require('node:http'),os=require('node:os'),assert=require('node:assert/strict');
function playwright(){for(const p of ['playwright',path.resolve('outputs/01a19005-456e-73d0-885a-224d201dce92/_build/node_modules/playwright')])try{return require(p)}catch(e){if(e.code!=='MODULE_NOT_FOUND')throw e}throw Error('Playwright unavailable');}
const modes=(process.env.NATIVE_RNG_MODES||'seed,native').split(',');assert.ok(modes.length>0&&modes.length<=2&&new Set(modes).size===modes.length&&modes.every(m=>['seed','native'].includes(m)));
const root=path.resolve('.'),out=path.resolve(process.env.NATIVE_RNG_OUTPUT||'outputs/agent-native-rng'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const fixtureSource=fs.readFileSync('tests/current-chaos-browser.cjs','utf8'),start=fixtureSource.indexOf('async function installFixture(page)'),end=fixtureSource.indexOf('\nfunction summary(',start);assert.ok(start>=0&&end>start);
const installerSource=fixtureSource.slice(start,end),installFixture=new Function(installerSource+';return installFixture;')();
const frozen=new Map(fs.readdirSync(root).filter(f=>/\.(?:html|js|css|json)$/.test(f)&&fs.statSync(path.join(root,f)).isFile()).map(f=>[f,fs.readFileSync(path.join(root,f))]));
for(const f of ['tools/drone-maturity.js'])if(fs.existsSync(f))frozen.set(f,fs.readFileSync(f));
const worktreeHashesAtStart=Object.fromEntries([...frozen].map(([f,b])=>[f,sha(b)]));
if(process.env.NATIVE_RNG_GAME_OVERRIDE)frozen.set('game.js',fs.readFileSync(path.resolve(process.env.NATIVE_RNG_GAME_OVERRIDE)));
fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'runner.cjs'),fs.readFileSync(__filename));
const report={at:new Date().toISOString(),kind:'same-input-current-chaos-seeded-versus-native-rng',requestedModes:modes,gameOverride:process.env.NATIVE_RNG_GAME_OVERRIDE||null,worktreeHashesAtStart,viewport:{width:1280,height:900},samplesPerCell:60,preflightFailuresPreserved:['attempt-01-fixture-mismatch.json','attempt-02-fixture-mismatch.json','attempt-03-fixture-diagnostic.json'],warmup:{discardedTicks:8,discardedDrawsAfterTicks:12,dt:1/60,worldRestoredBeforeEveryWarmAndMeasuredTick:true},sourceHashes:Object.fromEntries([...frozen].map(([f,b])=>[f,sha(b)])),testHash:sha(fs.readFileSync(__filename)),fixtureFileHash:sha(fixtureSource),installerHash:sha(installerSource),host:{platform:process.platform,cpu:os.cpus()[0]?.model,logicalCpus:os.cpus().length},notes:[
 'The wrapper also restores spawn/progression/fire-cursor scalars and removes player properties added after assembly; the reused fixture alone did not restore these fields.',
 'A fresh browser context per requested(scene,RNG mode) cell. Every fixture is assembled with the same fixed LCG before switching the measured RNG.',
 'Native Math.random is captured by an init script before game and fixture code. The selected function identity and Function.toString are attested outside measured calls.',
 'No per-call RNG or function timing wrappers. Only the complete tick is timed; audio is muted and scheduler work is outside the tick measurement.',
 'All pre-tick physical inputs match the restored baseline in each cell; seeded/native inputs must share an exact fingerprint for the same scene. RNG internal state is intentionally excluded.',
 'Native output/trajectories are not asserted equal to seeded output or to each other. This measures RNG implementation cost, not equivalence of random sequences.',
 'Synthetic fixture directly installs modules/gear, injects600s, high enemyHP/player immunity, and resets before every sample. BAIA/droneRack is absent. This is not natural progression, survival, FPS or phone-GPU evidence.',
 'Tick elapsed wall timings exclude later layout/paint, GPU completion, presentation and audio-render-thread costs. Shared-host contention and a single sequential pass limit causal interpretation of small differences.',
 'The400-bullet fixture uses normal emitter descriptors with fixture ammo refill/flight-age injection; it is a stress ceiling, not a claim that this build naturally sustains400bullets.'
 ],cells:[],pairs:[],errors:[],requestFailures:[]};
const save=()=>fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
for(const f of ['game.js','balance.js','audio.js','enemy-animation.js','tests/current-chaos-browser.cjs']){const dest=path.join(out,'source-snapshot',f);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,frozen.get(f)||fs.readFileSync(f));}fs.writeFileSync(path.join(out,'fixture-installer.js'),installerSource+'\n');
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.json':'application/json'};
const server=http.createServer((req,res)=>{try{const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname).slice(1)||'index.html',file=path.resolve(root,name);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return}if(!frozen.has(name))frozen.set(name,fs.readFileSync(file));res.writeHead(200,{'Content-Type':mime[path.extname(name)]||'application/octet-stream','Cache-Control':'no-store'});res.end(frozen.get(name));}catch{res.writeHead(404).end();}});
function summary(a){const s=[...a].sort((x,y)=>x-y),q=p=>s[Math.min(s.length-1,Math.ceil(s.length*p)-1)];return {samples:s.length,meanMs:a.reduce((x,y)=>x+y,0)/a.length,medianMs:q(.5),p95Ms:q(.95),p99Ms:q(.99),minMs:s[0],maxMs:s.at(-1)};}
(async()=>{let browser;await new Promise(r=>server.listen(0,'127.0.0.1',r));try{
 browser=await playwright().chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});report.browser=await browser.version();
 for(const scene of ['normal','chaos'])for(const mode of modes){
  const context=await browser.newContext({viewport:report.viewport,deviceScaleFactor:1}),page=await context.newPage();page.on('pageerror',e=>report.errors.push({scene,mode,error:e.message}));page.on('requestfailed',r=>report.requestFailures.push({scene,mode,url:r.url(),failure:r.failure()}));
  await page.addInitScript(()=>{window.__originalNativeRng=Math.random;window.__originalNativeSource=Function.prototype.toString.call(Math.random);window.requestAnimationFrame=()=>0});
  await page.goto(`http://127.0.0.1:${server.address().port}/`);await page.waitForFunction(()=>typeof reset==='function'&&ScrewZombieRenderer.ready.filter(Boolean).length===3&&chassisAnimations.has('swarm'));await page.locator('#enable-audio').click();await installFixture(page);
  const fixture=await page.evaluate(scene=>chaosSetup(scene),scene);
  const result=await page.evaluate(async mode=>{
   const seeded=Math.random,native=window.__originalNativeRng,describe=fn=>Function.prototype.toString.call(fn),choose=()=>{Math.random=mode==='seed'?seeded:native},initialScalars={spawn,kills,level,xp,need,weaponFireCursor},initialPlayerKeys=new Set(Object.keys(player));
   const restore=()=>{for(const key of Object.keys(player))if(!initialPlayerKeys.has(key))delete player[key];chaosRestore();({spawn,kills,level,xp,need,weaponFireCursor}=initialScalars)};
   if(!/\[native code\]/.test(window.__originalNativeSource)||/\[native code\]/.test(describe(seeded)))throw Error('RNG capture/fixture identity was unexpected');
   ScrewAudio.setMusicVolume(0);ScrewAudio.setEffectsVolume(0);ScrewAudio.setPlaying(true);
   function fingerprint(){return JSON.stringify({state,clock,spawn,kills,level,xp,need,player,weaponSlots,enemies,boss,bullets,hostile,hazards,gems,scrap,sparks,effects,aim,camera,keys:[...keys],firing,weaponFireCursor,hordeDirector},(k,v)=>v instanceof Set?[...v]:v);}
   restore();const assembledInput=fingerprint(),assembledCounts=chaosCount();
   if(player.relics.has('droneRack'))throw Error('BAIA must not be acquired');
   choose();for(let i=0;i<8;i++){restore();choose();tick(1/60);draw()}restore();choose();const cacheBefore=ScrewZombieRenderer.cache.size,cacheWarm=[];for(let i=0;i<12;i++){draw();cacheWarm.push(ScrewZombieRenderer.cache.size)}
   const times=[],beforeCounts=[],afterCounts=[];let verifiedInputs=0,verifiedFunctions=0,lastOutput;
   for(let i=0;i<60;i++){
    restore();choose();if(fingerprint()!==assembledInput){const before=JSON.parse(assembledInput),now=JSON.parse(fingerprint());function difference(a,b,path='root'){if(JSON.stringify(a)===JSON.stringify(b))return null;if(a&&b&&typeof a==='object'&&typeof b==='object'){for(const key of new Set([...Object.keys(a),...Object.keys(b)])){const d=difference(a[key],b[key],path+'.'+key);if(d)return d;}}return path+': '+JSON.stringify(a)+' != '+JSON.stringify(b)}throw Error('Pre-tick input changed after restoration: '+difference(before,now));}verifiedInputs++;
    if(Math.random!==(mode==='seed'?seeded:native))throw Error('Wrong measured RNG function');verifiedFunctions++;
    beforeCounts.push(chaosCount());ScrewAudio.update();const t=performance.now();tick(1/60);times.push(performance.now()-t);afterCounts.push(chaosCount());if(i===59)lastOutput=fingerprint();
    if(i%4===3)await new Promise(r=>setTimeout(r,0));
   }
   return {assembledInput,lastOutput,assembledCounts,verifiedInputs,verifiedFunctions,selectedRngSource:describe(Math.random),nativeRngSource:window.__originalNativeSource,seedRngSource:describe(seeded),selectedFunctionIdentity:Math.random===(mode==='seed'?seeded:native),times,beforeCounts,afterCounts,warm:{cacheBefore,cacheAfter:ScrewZombieRenderer.cache.size,stable:cacheWarm.every(n=>n===cacheWarm[0]),cacheWarm},baiaAbsent:!player.relics.has('droneRack'),audio:ScrewAudio.getState()};
  },mode);
  assert.equal(result.verifiedInputs,60);assert.equal(result.verifiedFunctions,60);assert.equal(result.baiaAbsent,true);assert.equal(result.selectedFunctionIdentity,true);assert.ok(result.warm.stable&&result.warm.cacheAfter<=36);assert.ok(result.beforeCounts.every(c=>c.common===(scene==='normal'?60:180)&&c.minions===3&&c.boss===1&&c.bullets===(scene==='normal'?60:400)&&c.finite));assert.ok(result.afterCounts.every(c=>c.finite&&c.state==='playing'&&c.common===(scene==='normal'?60:180)&&c.bullets<=400));assert.equal(result.audio.musicVolume,0);assert.equal(result.audio.effectsVolume,0);
  const {assembledInput,lastOutput,times,...evidence}=result;const cell={scene,mode,fixture,statistics:summary(times),rawTimesMs:times,inputFingerprint:sha(assembledInput),inputSnapshotBytes:Buffer.byteLength(assembledInput),lastOutputFingerprint:sha(lastOutput),...evidence};report.cells.push(cell);save();console.log(`${scene}/${mode}: median ${cell.statistics.medianMs.toFixed(2)}, p95 ${cell.statistics.p95Ms.toFixed(2)}ms; input ${cell.inputFingerprint.slice(0,12)}`);await context.close();
 }
 if(modes.length===2)for(const scene of ['normal','chaos']){const seed=report.cells.find(c=>c.scene===scene&&c.mode==='seed'),native=report.cells.find(c=>c.scene===scene&&c.mode==='native');assert.equal(seed.inputFingerprint,native.inputFingerprint,scene+' input fingerprint');assert.deepEqual(seed.assembledCounts,native.assembledCounts,scene+' initial counts');report.pairs.push({scene,sameInputFingerprint:true,inputFingerprint:seed.inputFingerprint,seedMedianMs:seed.statistics.medianMs,nativeMedianMs:native.statistics.medianMs,medianNativeOverSeed:native.statistics.medianMs/seed.statistics.medianMs,outputEqualityNotRequired:true});}
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.requestFailures,[]);report.completed=true;
 }catch(e){report.errors.push(e.stack||e.message);process.exitCode=1;}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));report.worktreeChangedDuringRun=Object.entries(report.worktreeHashesAtStart).filter(([f,h])=>h!==sha(fs.readFileSync(path.join(root,f)))).map(([f])=>f);save();}
})().catch(e=>{report.errors.push(e.stack||e.message);save();console.error(e);process.exitCode=1});
