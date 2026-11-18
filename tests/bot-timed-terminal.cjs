'use strict';
// Browser-launcher regression, not a natural run: jump to the last clock slice
// immediately before its first batch. No production code or shared pilot changes.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const pw=require(process.env.NODE_PATH?path.join(process.env.NODE_PATH,'playwright'):path.resolve('outputs/01a19005-456e-73d0-885a-224d201dce92/_build/node_modules/playwright'));
const {runBot,parseArgs}=require('../tools/playtest-bot.cjs');
const originalLaunch=pw.chromium.launch;let injections=0;
pw.chromium.launch=async function(...args){
 const browser=await originalLaunch.apply(this,args),originalContext=browser.newContext.bind(browser);
 browser.newContext=async(...contextArgs)=>{
  const context=await originalContext(...contextArgs),originalPage=context.newPage.bind(context);
  context.newPage=async()=>{
   const page=await originalPage(),evaluate=page.evaluate.bind(page);let injected=false;
   page.evaluate=async(fn,arg)=>{
    if(!injected&&typeof fn==='function'&&fn.toString().includes('for(let i=0;i<batch')){
     injected=true;injections++;await evaluate(()=>{clock=1199.99;player.inv=1e6;});
    }
    return evaluate(fn,arg);
   };return page;
  };return context;
 };return browser;
};
(async()=>{
 const output='outputs/bot68-terminal-fixture.json';
 try{
  const report=await runBot(parseArgs(['--minutes','21','--speed','1000','--seed','6801901','--output',output]));
  report.fixture='Controlled launcher terminal fixture: clock jumps from start to1199.99 before first batch, invulnerability enabled. NOT natural survival, balance, real FPS or final-gate evidence.';
  report.terminalFixture=true;fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
  assert.equal(injections,1);assert.equal(report.status,'run-won');assert.equal(report.result.state,'won');assert.equal(report.result.time,1200);
  assert.equal(report.result.finite,true);assert.equal(report.result.coreReached,false);assert.equal(report.result.bossKills,0);assert.equal(report.viable,false,'clock completion alone never approves a build');assert.deepEqual(report.errors,[]);
  console.log('Browser launcher: victory stops a21minute request at1200s without offer-loop; finite terminal report and strict core/boss viability passed (controlled fixture).');
 }finally{pw.chromium.launch=originalLaunch;}
})().catch(e=>{console.error(e);process.exitCode=1});
