'use strict';
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{
 const out=process.env.PROJECTILE_CAPTURE||'outputs/projectile-visuals/current.png';fs.mkdirSync(path.dirname(out),{recursive:true});
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:880},deviceScaleFactor:1});await page.addInitScript(()=>{requestAnimationFrame=()=>0;});
  await page.goto(pathToFileURL(path.resolve('index.html')).href);await page.waitForFunction(()=>typeof drawProjectile==='function');
  await page.evaluate(()=>{
   selectedWeapon='machine';reset();document.body.replaceChildren(canvas);canvas.style.cssText='width:1200px;height:880px;display:block';canvas.width=1200;canvas.height=880;ctx.setTransform(1,0,0,1,0,0);clock=12;
   ctx.fillStyle='#091421';ctx.fillRect(0,0,1200,880);ctx.fillStyle='#d9f7ff';ctx.font='bold 25px monospace';ctx.fillText('SCREWVIVORS / LEITURA DOS PROJÉTEIS',38,48);ctx.fillStyle='#8bafc4';ctx.font='14px monospace';ctx.fillText('Escala de inspeção ×3 · arma principal: metralhadora · fontes: 12 armas equipáveis',38,77);
   Object.entries(WEAPONS).forEach(([id,w],i)=>{
    const x=35+(i%3)*390,y=110+Math.floor(i/3)*180;
    ctx.fillStyle='#112438';ctx.fillRect(x,y,370,160);ctx.fillStyle='#b9e7f5';ctx.font='bold 16px monospace';ctx.fillText(w.name,x+16,y+28);
    ctx.save();ctx.translate(x+140,y+90);ctx.scale(3,3);drawProjectile({weapon:{...w,id},x:0,y:0,vx:570,vy:0,radius:w.radius||6,life:.5,maxLife:1,crit:false});ctx.restore();
    ctx.fillStyle='#668ba4';ctx.font='12px monospace';ctx.fillText('NORMAL',x+110,y+140);
    ctx.save();ctx.translate(x+285,y+90);ctx.scale(3,3);drawProjectile({weapon:{...w,id},x:0,y:0,vx:570,vy:0,radius:w.radius||6,life:.5,maxLife:1,crit:true});ctx.restore();
    ctx.fillStyle='#d9bc76';ctx.font='12px monospace';ctx.fillText('CRÍTICO',x+258,y+140);
   });
  });
  await page.screenshot({path:out});console.log(out);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
