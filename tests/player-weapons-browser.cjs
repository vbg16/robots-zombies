'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 fs.mkdirSync('outputs/player-weapons',{recursive:true});
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.GAME_URL||'http://127.0.0.1:8001/');await page.waitForFunction(()=>window.ScrewBuildGuide);
  await page.evaluate(()=>{profile.unlockedWeapons=Object.fromEntries(Object.keys(WEAPONS).map(id=>[id,true]));openGarage();reset();spawn=1e9;globalThis.heldProps=[];const original=window.drawPlayerWeapon;window.drawPlayerWeapon=function(c,pose){heldProps.push({...pose});return original(c,pose);};});
  await page.waitForFunction(()=>protAnimation!==null);
  for(const id of ['machine','shotgun','burst','sniper','laser','flame','cryo','rocket','grenade','tesla','disc','harpoon']){
   await page.evaluate(id=>{openGarage();selectWeapon(id);reset();spawn=1e9;heldProps=[];},id);
   const box=await page.locator('#game').boundingBox();
   await page.mouse.move(box.x+box.width*.8,box.y+box.height*.5);await page.waitForTimeout(35);
   assert.equal(await page.evaluate(()=>heldProps.at(-1).id),id);
   await page.mouse.down();await page.waitForTimeout(40);await page.mouse.up();
   assert.ok(await page.evaluate(()=>heldProps.some(p=>p.recoil>0)),'emission animates '+id);
   await page.mouse.move(box.x+box.width*.2,box.y+box.height*.5);await page.waitForTimeout(35);
   assert.ok(Math.abs(await page.evaluate(()=>heldProps.at(-1).angle))>Math.PI/2,'left aim follows pointer');
   await page.screenshot({path:'outputs/player-weapons/'+id+'.png'});
  }
  await page.evaluate(()=>{pause();const contact=document.createElement('canvas');contact.id='weapon-contact';contact.width=960;contact.height=500;contact.style.cssText='position:fixed;inset:0;z-index:99999;width:960px;height:500px;background:#102532';document.body.append(contact);const c=contact.getContext('2d');c.fillStyle='#102532';c.fillRect(0,0,960,500);c.font='14px monospace';let i=0;for(const id of Object.keys(WEAPONS)){const x=80+i%4*240,y=70+Math.floor(i/4)*160;c.fillStyle='#d1e6f0';c.fillText(id,x-45,y-38);c.save();c.translate(x,y);c.scale(2,2);window.drawPlayerWeapon(c,{id,x:0,y:0,angle:0});c.restore();i++;}});
  await page.locator('#weapon-contact').screenshot({path:'outputs/player-weapons/contact.png'});
  assert.deepEqual(errors,[]);console.log('Chrome:12 equipped props rendered in arena, manual aim left/right, recoil and contact sheet passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
