/* Original Canvas props, matching the industrial pixel geometry of enemy-weapons.js. */
(function(root){
 'use strict';
 const MODELS={
  machine:{length:28,body:'#536e82',accent:'#8de4fa',type:'ballistic'},
  shotgun:{length:30,body:'#8c7156',accent:'#e8bb79',type:'shotgun'},
  burst:{length:29,body:'#547f78',accent:'#a9e6b8',type:'burst'},
  sniper:{length:42,body:'#53667a',accent:'#e2c993',type:'sniper'},
  laser:{length:30,body:'#466a82',accent:'#7cecff',type:'laser'},
  flame:{length:28,body:'#926342',accent:'#ffb56e',type:'flame'},
  cryo:{length:29,body:'#5b8490',accent:'#b6f3f1',type:'cryo'},
  rocket:{length:33,body:'#7c8059',accent:'#e2d58f',type:'rocket'},
  grenade:{length:25,body:'#8a7450',accent:'#e6c581',type:'grenade'},
  tesla:{length:27,body:'#6f668d',accent:'#c6b7ff',type:'tesla'},
  disc:{length:24,body:'#6c7c85',accent:'#b2ebf7',type:'disc'},
  harpoon:{length:35,body:'#756c55',accent:'#c3d5d6',type:'harpoon'}
 };
 function drawPlayerWeapon(ctx,pose){
  const model=MODELS[pose.id];if(!model||![pose.x,pose.y,pose.angle].every(Number.isFinite))return false;
  const kick=Math.max(0,Math.min(1,pose.recoil||0)),reloading=Math.max(0,Math.min(1,pose.reload||0));
  ctx.save();
  try{
   ctx.translate(Math.round(pose.x),Math.round(pose.y)+5);ctx.rotate(pose.angle);
   if(Math.cos(pose.angle)<0)ctx.scale(1,-1);
   ctx.translate(11-kick*3,0);ctx.rotate(Math.sin(reloading*Math.PI)*.25);
   ctx.globalAlpha=pose.hurt?.6:1;ctx.imageSmoothingEnabled=false;
   const block=(color,x,y,w,h)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h);},dark='#071725',metal='#b0c4cf',m=model,L=m.length;
   // A short armored forearm joins the torso and the grip in every aim direction.
   block(dark,-14,0,18,8);block('#a9beca',-12,1,14,5);
   block(dark,-7,-7,L+8,14);block(m.body,-5,-5,L-3,10);block(m.accent,-3,-5,Math.max(8,L-12),2);
   block(dark,L-4,-3,8,6);block(metal,L-3,-2,6,2);block(dark,1,5,6,8);block('#465a68',2,6,4,6);
   if(m.type==='ballistic'||m.type==='burst'){
    block(dark,8,4,7,8);block(m.body,9,5,5,6);block(dark,5,-10,10,3);block(m.accent,10,-9,2,2);
    for(let x=15;x<L-4;x+=4)block(dark,x,-2,2,4);
    if(m.type==='burst'){block(m.accent,2,-2,2,3);block(m.accent,6,-2,2,3);block(m.accent,10,-2,2,3);}
   }else if(m.type==='shotgun'){
    block(dark,12,-5,21,4);block(metal,14,-4,18,2);block(dark,11,1,22,4);block(metal,13,2,19,2);block('#c09966',5,-1,10,5);
   }else if(m.type==='sniper'){
    block(dark,4,-12,14,5);block(metal,5,-11,12,3);block(m.accent,16,-11,2,3);block('#a68c64',-5,-3,9,6);block(metal,22,-2,22,2);
   }else if(m.type==='rocket'){
    block(dark,-10,-9,44,17);block(m.body,-8,-7,38,13);block(m.accent,-6,-7,4,13);block('#384336',26,-6,6,11);block(dark,28,-4,4,7);
   }else if(m.type==='grenade'){
    block(dark,4,-9,15,19);block(m.body,5,-7,13,15);for(let x=7;x<18;x+=4)block(m.accent,x,-5,2,10);block(metal,21,-3,7,5);
   }else if(m.type==='flame'){
    block(dark,-9,-10,9,19);block(m.body,-8,-8,7,15);block(m.accent,-7,-6,5,3);block('#d39961',18,-4,12,8);block('#ffdb91',27,-2,3,4);
   }else if(m.type==='disc'){
    block(dark,9,-12,18,23);block(metal,11,-10,14,19);block(m.body,14,-7,8,13);block(m.accent,17,-4,3,7);block(dark,9,-1,20,2);
   }else if(m.type==='harpoon'){
    block(metal,-3,-1,41,2);block(dark,9,-9,3,18);block(m.body,10,-7,2,14);block(m.accent,34,-4,4,8);block(metal,38,-2,4,4);
   }else{
    // Separate heat exchanger, cooling fins and Tesla forks identify the energy guns.
    for(let x=8;x<23;x+=5){block(dark,x,-9,4,18);block(m.accent,x+1,-7,2,14);}
    if(m.type==='laser'){block(m.accent,23,-2,9,4);block('#e4fcff',30,-1,3,2);}
    if(m.type==='cryo'){block('#e2ffff',-4,-3,8,6);block(m.accent,25,-5,6,10);}
    if(m.type==='tesla'){block(metal,23,-10,4,7);block(metal,23,4,4,7);block(m.accent,25,-10,5,2);block(m.accent,25,9,5,2);}
   }
   block(dark,0,1,7,7);block('#d1e1e9',1,2,5,5);
   block(dark,Math.min(L-10,17),1,7,6);block('#d1e1e9',Math.min(L-9,18),2,5,4);
  }finally{ctx.restore();}
  return true;
 }
 if(typeof module!=='undefined'&&module.exports)module.exports={drawPlayerWeapon,models:MODELS};
 else root.drawPlayerWeapon=drawPlayerWeapon;
})(typeof window!=='undefined'?window:globalThis);
