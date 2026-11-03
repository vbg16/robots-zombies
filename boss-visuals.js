/* Extend the original procedural boss art. No collision, attack or damage logic lives here. */
(function(root){
 'use strict';
 function advance(b,previousPhase,dt){
  b.visualAttack=Math.max(0,(b.visualAttack||0)-Math.max(0,dt));
  if(String(previousPhase).startsWith('tell')&&b.phase!==previousPhase)b.visualAttack=.28;
 }
 function draw(ctx,b,player,clock){
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
