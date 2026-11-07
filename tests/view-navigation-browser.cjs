'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true}),results=[];
 try{
  for(const viewport of [{width:1280,height:720},{width:844,height:390},{width:740,height:360},{width:390,height:844}]){
   const context=await browser.newContext({viewport}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{requestAnimationFrame=()=>0;});await page.goto(pathToFileURL(path.resolve('index.html')).href);
   const check=async(id)=>{const data=await page.evaluate(id=>({scroll:scrollY,focus:document.activeElement.id,top:document.getElementById(id).getBoundingClientRect().top,overflow:document.documentElement.scrollWidth>innerWidth+1}),id);assert.equal(data.scroll,0,id+' starts at the top');assert.equal(data.focus,id);assert.ok(data.top>=0&&data.top<viewport.height);assert.equal(data.overflow,false);return data;};
   await page.locator('#enter-garage').click();const garage=await check('garage-title');await page.evaluate(()=>scrollTo(0,document.body.scrollHeight));assert.ok(await page.evaluate(()=>scrollY>0),'garage fixture actually scrolls');
   await page.locator('#launch').click();const config=await check('config-title');await page.locator('#config-back').click();const returned=await check('garage-title');await page.locator('#launch').click();await check('config-title');
   assert.equal(await page.evaluate(()=>profile.bolts),0,'navigation grants no resources');assert.equal(await page.evaluate(()=>selectedWeapon),'machine');assert.deepEqual(errors,[]);results.push({viewport,garage,config,returned,errors});await context.close();
  }
  const crypto=require('node:crypto'),hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');fs.mkdirSync('outputs/combat-feedback',{recursive:true});fs.writeFileSync('outputs/combat-feedback/navigation-report.json',JSON.stringify({at:new Date().toISOString(),fixture:'Fresh browser saves; no gear/resource fixtures.',sourceHashes:Object.fromEntries(['game.js','index.html','style.css','ui-redesign.css'].map(file=>[file,hash(file)])),testHash:hash(__filename),results},null,2)+'\n');console.log('View navigation: four desktop/phone viewports, top-of-page entry/back, visible heading focus, no overflow and unchanged starting equipment/resources passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
