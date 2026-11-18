/* Extend the original procedural boss art. No collision, attack or damage logic lives here. */
(function(root){
 'use strict';
 function advance(b,previousPhase,dt){
  b.visualAttack=Math.max(0,(b.visualAttack||0)-Math.max(0,dt));
  if(String(previousPhase).startsWith('tell')&&b.phase!==previousPhase)b.visualAttack=.28;
 }
 function drawPrism(ctx,b,player,clock){
  const dx=player.x-b.x,dy=player.y-b.y,side=Math.abs(dx)>Math.abs(dy),back=!side&&dy<0;
  const step=b.visualWalking?Math.sin((b.visualPhase||0)*Math.PI/4):0,bob=Math.abs(step)*1.5;
  const telling=b.phase==='tellLaser',firing=b.phase==='laser',recovering=b.phase==='recover';
  const charge=telling?Math.max(0,Math.min(1,1-b.timer/(b.laserTellDuration||1.8))):firing?1:0;
  const pulse=(Math.sin(clock*10)+1)*.5,recoil=Math.min(1,(b.visualAttack||0)/.28);
  const shell=b.hit>0?'#ffffff':'#8d999e',rim='#d7d9c9',dark='#10212b',copper='#bd7450',light=firing?'#fff3d3':telling?'#ff9c71':'#c55355';
  const block=(color,x,y,w,h)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h);};
  ctx.save();
  try{
   ctx.translate(Math.round(b.x),Math.round(b.y));
   ctx.fillStyle='rgba(0,0,0,.42)';ctx.beginPath();ctx.ellipse(0,36,53,12,0,0,Math.PI*2);ctx.fill();
   // Broad hydraulic feet and a low lens gantry distinguish this boss from the casters.
   for(const leg of [-1,1]){
    const stride=step*leg,lift=Math.max(0,stride)*5,footX=leg*17+(side?stride*5:0);
    block(dark,leg*17-9,12,18,23);block(copper,leg*17-4,17,8,17);
    block('#263f4b',footX-11,29-lift,22,12);block(shell,footX-14,36-lift,28,5);
    block('#07151f',footX-13,41-lift,26,3);
   }
   ctx.translate(0,-bob);
   block(dark,-31,-29,62,57);block(shell,-27,-25,54,49);
   block(copper,-24,16,48,7);block(rim,-22,-24,44,5);
   const headX=side?(dx>0?6:-6):0;
   block(dark,headX-15,-47,30,24);block(shell,headX-12,-44,24,17);
   block(back?'#425b64':'#f0b85b',headX-9,-37,18,4);
   if(back){
    block('#29404b',-20,-18,40,29);
    for(let y=-14;y<10;y+=7)block(copper,-16,y,32,3);
   }else{
    block('#203740',-18,-12,36,26);block('#e4d8b8',-10,-7,20,4);
    block('#f0b85b',-4,1,8,8);
   }
   // Three physical emitters, with retracting shutters and a common charging bus.
   const raised=telling?charge*7:firing?7-recoil*3:recovering?-3:0;
   for(const emitter of [-1,0,1]){
    const x=emitter*39,y=(emitter===0?-22:-7)-raised+(emitter?step*emitter*2:0);
    block(dark,x-15,y-15,30,35);block(copper,x-13,y-12,26,27);
    block(shell,x-12,y-10,24,23);block('#233944',x-10,y-7,20,16);
    ctx.strokeStyle=rim;ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y+1,9,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle=light;ctx.beginPath();ctx.arc(x,y+1,firing?6:3+charge*3,0,Math.PI*2);ctx.fill();
    if(!firing){const shutter=Math.round((1-charge)*6);block('#132b36',x-8,y-7,16,shutter);block('#132b36',x-8,y+9-shutter,16,shutter);}
    for(let led=0;led<3;led++)block(led<Math.ceil(charge*3)?'#ffe7bb':'#4d5147',x-9+led*7,y+17,4,3);
    if(firing){ctx.strokeStyle='#fff0c7';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y+1,12+pulse*2,0,Math.PI*2);ctx.stroke();}
   }
   if(telling||firing){
    ctx.strokeStyle=telling?'#ff9670':'#fff0c7';ctx.lineWidth=2;ctx.beginPath();
    ctx.moveTo(-39,6-raised);ctx.lineTo(-23,-17-raised);ctx.lineTo(0,-30-raised);ctx.lineTo(23,-17-raised);ctx.lineTo(39,6-raised);ctx.stroke();
   }
   if(recovering){for(const vent of [-1,1]){block('#536d75',vent*25-4,-36,8,3);block('#92a5a5',vent*25-3,-42-pulse*3,6,3);}}
   if(b.slowTime>0){ctx.strokeStyle='#9cecff';ctx.lineWidth=2;ctx.strokeRect(-56,-51,112,99);}
   if(b.burnTime>0){block('#ff934d',-29,7,4,8);block('#ffd282',25,-8,4,7);}
   if(b.stunTime>0){ctx.strokeStyle='#c5f6ff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-12,-54);ctx.lineTo(-5,-60);ctx.lineTo(2,-53);ctx.lineTo(11,-59);ctx.stroke();}
  }finally{ctx.restore();}
  return true;
 }
 function draw(ctx,b,player,clock){
  if(b.id==='prism')return drawPrism(ctx,b,player,clock);
  if(!['scrapper','coil'].includes(b.id))return false;
  const scrapper=b.id==='scrapper',dx=player.x-b.x,dy=player.y-b.y,side=Math.abs(dx)>Math.abs(dy),back=!side&&dy<0;
  const step=b.visualWalking?Math.sin((b.visualPhase||0)*Math.PI/4):0,bob=Math.abs(step)*1.5,recoil=Math.min(1,(b.visualAttack||0)/.28),telling=String(b.phase).startsWith('tell');
  const shell=b.hit>0?'#ffffff':scrapper?'#8c9f67':'#8d83b4',light=scrapper?'#e0d49a':'#dfd1ff',accent=scrapper?'#b6d38d':'#c3b6ed';
  const block=(color,x,y,w,h)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h);};
  ctx.save();
  try{
   ctx.translate(Math.round(b.x),Math.round(b.y));
   ctx.fillStyle='rgba(0,0,0,.4)';ctx.beginPath();ctx.ellipse(0,32,40,10,0,0,Math.PI*2);ctx.fill();
   for(const leg of [-1,1]){
    const stride=step*leg,lift=Math.max(0,stride)*5,footX=leg*10+(side?stride*4:0);
    block('#13242d',leg*10-7,16,14,14);block('#233843',footX-6,25-lift,12,10);block('#0a1823',footX-9,33-lift,18,7);block(shell,footX-7,33-lift,14,3);
   }
   ctx.translate(0,-bob);
   // Back views have a vented backpack; side heads shift toward the target.
   block('#13242d',-24,-28,48,57);block(shell,-20,-24,40,48);
   if(back){block('#263a40',-15,-22,30,35);for(let y=-18;y<8;y+=7)block(accent,-11,y,22,2);}
   const headX=side?(dx>0?5:-5):0;block('#12232e',headX-13,-37,26,22);block(shell,headX-11,-35,22,5);
   block(back?'#465b63':light,headX-8,-27,16,back?2:4);
   if(scrapper){
    const raised=telling?Math.max(0,1-b.timer/1.7):0;
    for(const arm of [-1,1]){
     const swing=step*arm*3,armY=-21+swing-raised*8+recoil*4;
     block('#172c30',arm*29-8,armY,16,43);block(shell,arm*29-6,armY+2,12,27);block('#d5ba7f',arm*29-5,armY+3,10,8);block('#10212b',arm*29-7,armY+29,14,13);
     // Visible mortar tubes cock upward during the tell and kick when the shot happens.
     block('#25382e',arm*29-5,armY-8,10,16);block(light,arm*29-3,armY-7,6,3);
    }
    if(!back){block('#172b2c',-12,-9,24,20);block(accent,-8,-5,16,5);for(let x=-8;x<10;x+=6)block('#6d7e4f',x,3,3,5);}
    block('#4d624b',-17,-31,7,6);block('#d6ba7d',11,-34,4,7);
   }else{
    const charge=telling?Math.max(0,Math.min(1,1-b.timer/1.4)):0;
    for(const arm of [-1,1]){
     const armY=-24+step*arm*2-recoil*5;
     block('#2b2945',arm*30-8,armY,16,43);
     for(let i=0;i<4;i++)block(i/4<=charge?light:accent,arm*30-10,armY+2+i*10,20,3);
     block('#1b2637',arm*30-4,armY-10,8,12);block(light,arm*30-2,armY-9,4,4);
    }
    if(!back){ctx.strokeStyle=accent;ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,1,10,0,Math.PI*2);ctx.stroke();block(light,-3,-2,6,6);}
    const pulse=(Math.sin(clock*3)+1)*.5;block(accent,-2,-46,4,10);block(light,-4,-48,8,3);
    if(telling||recoil>0){ctx.strokeStyle=light;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-29,-27);ctx.lineTo(-16,-30-charge*7-pulse*2);ctx.lineTo(0,-24-charge*8);ctx.lineTo(16,-31-charge*7);ctx.lineTo(29,-27);ctx.stroke();}
   }
   if(b.slowTime>0){ctx.strokeStyle='#9cecff';ctx.lineWidth=2;ctx.strokeRect(-39,-49,78,89);}
   if(b.burnTime>0){block('#ff934d',-23,6,4,7);block('#ffd282',20,-8,3,6);}
   if(b.stunTime>0){ctx.strokeStyle='#c5f6ff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-9,-51);ctx.lineTo(-3,-57);ctx.lineTo(2,-50);ctx.lineTo(10,-56);ctx.stroke();}
  }finally{ctx.restore();}
  return true;
 }
 const api={advance,draw};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ScrewBossVisuals=api;
})(globalThis);
