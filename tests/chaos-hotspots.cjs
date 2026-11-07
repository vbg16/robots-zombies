/* Short, separately instrumented diagnostic. Inclusive timings overlap; not FPS or an optimization verdict. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),http=require('node:http'),assert=require('node:assert/strict');
function playwright(){for(const p of ['playwright',path.resolve('outputs/01a19005-456e-73d0-885a-224d201dce92/_build/node_modules/playwright')])try{return require(p)}catch(e){if(e.code!=='MODULE_NOT_FOUND')throw e}throw Error('Playwright unavailable');}
const root=path.resolve('.'),out=path.resolve(process.env.CHAOS_HOTSPOTS_OUTPUT||'outputs/agent-chaos-hotspots'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
fs.mkdirSync(out,{recursive:true});
const fixtureSource=fs.readFileSync('tests/current-chaos-browser.cjs','utf8'),from=fixtureSource.indexOf('async function installFixture(page)'),to=fixtureSource.indexOf('\nfunction summary(',from);
assert.ok(from>=0&&to>from,'Fixture installer boundaries must remain explicit');
const fixtureInstaller=fixtureSource.slice(from,to),installFixture=new Function(fixtureInstaller+';return installFixture;')();
const frozen=new Map(fs.readdirSync(root).filter(f=>/\.(js|css|html|json)$/.test(f)&&fs.statSync(path.join(root,f)).isFile()).map(f=>[f,fs.readFileSync(path.join(root,f))]));
for(const f of ['tools/drone-maturity.js','tools/segment-circle.js'])if(fs.existsSync(f))frozen.set(f,fs.readFileSync(f));
const report={at:new Date().toISOString(),kind:'short-current-chaos-hotspots',samplesPerScene:12,viewport:{width:1280,height:900},testHash:sha(fs.readFileSync(__filename)),fixtureInstallerHash:sha(fixtureInstaller),fixtureFileHash:sha(fixtureSource),sourceHashes:Object.fromEntries([...frozen].map(([f,b])=>[f,sha(b)])),notes:[
 'Two scenes only: same synthetic ENXA laser/Tesla/disc fixture as current-chaos-browser, no BAIA/droneRack relic acquired. No natural progression, mortality or human-play claim.',
 '12instrumented ticks per scene; warmed draw/cache first. Restoring the fixture and HUD is outside the measured phase.',
 'Function timers are inclusive and nested. Operation timers are subsets of damageFeedback. They overlap and cannot be summed as independent costs.',
 'performance.now() wrappers, builtin wrappers and clock resolution add overhead, especially for tiny calls. Values are diagnostic elapsed wall times on a shared host, not isolated CPU or FPS.',
 'Music/effects are muted to concentrate this short pass on simulation; the separate full benchmark supplies the audio comparison.',
 'No changes to game.js, damage, RNG, hit ordering, particles or target count. All sampled worlds are restored fixtures, not subsequent frames.'
 ],scenes:[],errors:[],requestFailures:[]};
const save=()=>fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
fs.writeFileSync(path.join(out,'fixture-installer.js'),fixtureInstaller+'\n');
for(const f of ['game.js','balance.js','audio.js','enemy-animation.js','tests/current-chaos-browser.cjs']){const bytes=frozen.get(f)||fs.readFileSync(f),destination=path.join(out,'source-snapshot',f);fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,bytes);}
const types={'.js':'application/javascript','.html':'text/html','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.json':'application/json'};
const server=http.createServer((req,res)=>{try{const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname).slice(1)||'index.html',file=path.resolve(root,name);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return}if(!frozen.has(name))frozen.set(name,fs.readFileSync(file));res.writeHead(200,{'Content-Type':types[path.extname(name)]||'application/octet-stream','Cache-Control':'no-store'});res.end(frozen.get(name));}catch{res.writeHead(404).end();}});
(async()=>{let browser;await new Promise(r=>server.listen(0,'127.0.0.1',r));try{
 browser=await playwright().chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});report.browser=await browser.version();
 const context=await browser.newContext({viewport:report.viewport,deviceScaleFactor:1}),page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));page.on('requestfailed',r=>report.requestFailures.push({url:r.url(),error:r.failure()}));
 await page.addInitScript(()=>{window.requestAnimationFrame=()=>0});await page.goto(`http://127.0.0.1:${server.address().port}/`);await page.waitForFunction(()=>typeof reset==='function'&&ScrewZombieRenderer.ready.filter(Boolean).length===3&&chassisAnimations.has('swarm'));
 await page.locator('#enable-audio').click();await installFixture(page);await page.evaluate(()=>{ScrewAudio.setMusicVolume(0);ScrewAudio.setEffectsVolume(0);ScrewAudio.setPlaying(true)});
 for(const scene of ['normal','chaos']){
  const fixture=await page.evaluate(scene=>chaosSetup(scene),scene);
  const result=await page.evaluate(()=>{
   if(player.relics.has('droneRack'))throw Error('Maturity relic must be absent');
   for(let i=0;i<3;i++){chaosRestore();tick(1/60);draw()}chaosRestore();for(let i=0;i<8;i++)draw();
   const cacheBefore=ScrewZombieRenderer.cache.size,originals=new Map(),functions={},operations={},counts=[],tickTimes=[];let active=false,feedbackDepth=0;
   const names=['damageFeedback','emitHitSparks','nearestTargets','uncachedNearestTargets','damageEnemy','shockAt','explodeAt','random'];
   for(const name of names){const original=eval(name);originals.set(name,original);functions[name]={calls:0,inclusiveMs:0};const wrapper=(...args)=>{if(!active)return original(...args);const t=performance.now();if(name==='damageFeedback')feedbackDepth++;try{return original(...args)}finally{if(name==='damageFeedback')feedbackDepth--;functions[name].calls++;functions[name].inclusiveMs+=performance.now()-t}};window.__hotspotWrapper=wrapper;if(name==='random'){/* random is const: its calls are counted below via Math.random, without rebinding it. */originals.delete(name);delete functions[name];continue}eval(name+'=window.__hotspotWrapper');}
   const originalIncludes=Array.prototype.includes,originalSplice=Array.prototype.splice,originalToFixed=Number.prototype.toFixed,originalRandom=Math.random;
   const op=(name,fn)=>{const t=performance.now();try{return fn()}finally{operations[name]??={calls:0,inclusiveMs:0};operations[name].calls++;operations[name].inclusiveMs+=performance.now()-t}};
   Array.prototype.includes=function(...args){return active&&feedbackDepth&&this===feedback?op('feedback.includes',()=>Reflect.apply(originalIncludes,this,args)):Reflect.apply(originalIncludes,this,args)};
   Array.prototype.splice=function(...args){return active&&this===feedback?op('feedback.splice',()=>Reflect.apply(originalSplice,this,args)):Reflect.apply(originalSplice,this,args)};
   Number.prototype.toFixed=function(...args){return active&&feedbackDepth?op('damageFeedback.toFixed',()=>Reflect.apply(originalToFixed,this,args)):Reflect.apply(originalToFixed,this,args)};
   Math.random=function(){return active?op('Math.random',()=>Reflect.apply(originalRandom,Math,[])):Reflect.apply(originalRandom,Math,[])};
   try{for(let i=0;i<12;i++){chaosRestore();const before=chaosCount();active=true;const t=performance.now();try{tick(1/60)}finally{tickTimes.push(performance.now()-t);active=false}counts.push({before,after:chaosCount()});}}
   finally{active=false;Array.prototype.includes=originalIncludes;Array.prototype.splice=originalSplice;Number.prototype.toFixed=originalToFixed;Math.random=originalRandom;for(const [name,original]of originals){window.__hotspotOriginal=original;eval(name+'=window.__hotspotOriginal')}delete window.__hotspotWrapper;delete window.__hotspotOriginal;}
   return {functions,operations,counts,tickTimes,cacheBefore,cacheAfter:ScrewZombieRenderer.cache.size,droneMaturityAbsent:!player.relics.has('droneRack'),audio:ScrewAudio.getState()};
  });
  assert.ok(result.droneMaturityAbsent);assert.ok(result.counts.every(c=>c.before.finite&&c.after.finite&&c.before.common===(scene==='normal'?60:180)&&c.after.common===c.before.common&&c.before.bullets===(scene==='normal'?60:400)&&c.after.bullets<=400));
  report.scenes.push({scene,fixture,...result});save();console.log(scene,JSON.stringify({functions:result.functions,operations:result.operations}));
 }
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.requestFailures,[]);report.completed=true;await context.close();
 }catch(e){report.errors.push(e.stack||e.message);process.exitCode=1;}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));report.worktreeChangedDuringRun=Object.entries(report.sourceHashes).filter(([f,h])=>h!==sha(fs.readFileSync(path.join(root,f)))).map(([f])=>f);save();}
})().catch(e=>{report.errors.push(e.stack||e.message);save();console.error(e);process.exitCode=1});
