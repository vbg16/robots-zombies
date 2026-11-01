/* Original held weapons for ranged enemies. Coordinates are local to the body. */
(function(root){
 'use strict';
 root.drawEnemyWeapon=function(ctx,z,player){
  const type=z.enemyType==='expolice'?'rifle':z.minionType==='gunner'?'industrial':z.minionType==='conductor'?'coil':null;
  if(!type||!player)return;
  const angle=Math.atan2(player.y-z.y,player.x-z.x);
  ctx.save();
  ctx.translate(2,3);ctx.rotate(angle);
  // Keep the magazine and the hands beneath a left-facing weapon as well.
  if(Math.cos(angle)<0)ctx.scale(1,-1);
  const block=(color,x,y,w,h)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h);};
  // Forearms connect the held prop to the torso; the hands are drawn over it.
  block('#111722',-6,0,14,8);block('#617267',-5,1,12,5);
  if(type==='rifle'){
   block('#07121b',-9,-6,36,11);
   block('#6a5140',-8,-3,9,6);block('#263c50',0,-5,18,8);
   block('#8398a5',3,-5,15,2);block('#162531',18,-3,10,4);
   block('#d4c49a',26,-3,3,4);block('#07121b',7,3,6,8);
   block('#4f6270',8,4,4,6);block('#1a2b37',7,-8,7,3);
   block('#e7bc72',12,-8,2,2);
  }else if(type==='industrial'){
   block('#07121b',-8,-7,37,14);block('#6a5746',-7,-3,8,7);
   block('#687d75',0,-6,20,11);block('#a6b59d',2,-6,16,3);
   block('#233e42',20,-4,10,7);block('#b6d38d',24,-3,7,2);
   block('#07121b',5,5,9,6);block('#9b7946',6,6,7,4);
   for(let x=5;x<18;x+=4)block('#283b3a',x,-2,2,5);
  }else{
   block('#07121b',-7,-8,33,15);block('#665e88',-6,-5,18,10);
   block('#a193c0',-4,-5,14,3);block('#243943',9,-7,13,13);
   for(let x=11;x<=21;x+=4){block('#c3b6ed',x,-8,2,16);block('#71e7ff',x,-3,2,5);}
   block('#111c2b',23,-4,5,7);block('#d4faff',27,-3,3,5);
   block('#302b4b',1,4,6,7);block('#9481bb',2,5,4,5);
  }
  // Two contrasting hands make the connection to the weapon readable.
  block('#111722',-1,1,7,7);block('#c5d18a',0,2,5,5);
  block('#111722',15,1,7,6);block('#c5d18a',16,2,5,4);
  ctx.restore();
 };
})(typeof window!=='undefined'?window:globalThis);
