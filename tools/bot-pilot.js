/* Test input profiles. All perturbation randomness is private to the pilot. */
(function(root){
 'use strict';
 function create(mode='smart',options={}){
  if(!['smart','dumb','limited','flee'].includes(mode))throw Error('Unknown pilot: '+mode);
  const drive=qaDrive;let lastDecision=-Infinity,seed=((options.seed||1)^0xa73d91b5)>>>0,lastTarget=null,error=0,remembered=null,lastReport=-Infinity;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  if(mode==='limited'){
   const fire=qaFireWeapon;
   qaFireWeapon=function(...args){if(remembered)aim={x:remembered.x-camera.x,y:remembered.y-camera.y,active:true};return fire.apply(this,args);};
  }
  function fleeMovement(){const nearest=targets().filter(z=>z.hp>0).sort((a,b)=>Math.hypot(a.x-player.x,a.y-player.y)-Math.hypot(b.x-player.x,b.y-player.y))[0];keys.clear();if(nearest){const dx=player.x-nearest.x,dy=player.y-nearest.y;keys.add(Math.abs(dx)>Math.abs(dy)?dx>=0?'d':'a':dy>=0?'s':'w');}else keys.add('d');}
  return {
   drive(){
    if(mode==='limited'&&clock-lastDecision<.4-1e-8)return;
    lastDecision=clock;drive();
    if(mode==='dumb'||mode==='flee')fleeMovement();
    if(mode==='limited'){
     if(qaTarget!==lastTarget){lastTarget=qaTarget;error=(random()*2-1)*Math.PI/15;}
     const dx=aim.x+camera.x-player.x,dy=aim.y+camera.y-player.y,cos=Math.cos(error),sin=Math.sin(error);
     remembered={x:player.x+dx*cos-dy*sin,y:player.y+dx*sin+dy*cos};
     aim={x:remembered.x-camera.x,y:remembered.y-camera.y,active:aim.active};
    }
    this.beforeTick();
    if(typeof qaObserver!=='undefined'&&clock-lastReport>=1){lastReport=clock;qaObserver.record('decision',{type:'pilot-input',mode,keys:[...keys],firing,aimWorld:{x:aim.x+camera.x,y:aim.y+camera.y},reactionSeconds:mode==='limited'?.4:.2,aimErrorDegrees:mode==='limited'?error*180/Math.PI:0});}
   },
   beforeTick(){if(mode==='flee')firing=false;},
   describe(){return {mode,version:1,reactionSeconds:mode==='limited'?.4:.2,aimErrorDegrees:mode==='limited'?12:0,aimErrorPolicy:mode==='limited'?'private seeded angular error held until target changes; remembered world aim point between decisions':'original driver13 retarget',movement:mode==='dumb'||mode==='flee'?'same cardinal nearest-enemy-away movement as published dumb':'original threat scoring',firing:mode==='flee'?'disabled input; automatic acquired supports remain legal':'manual firing input from policy',humanClaim:false};}
  };
 }
 root.ScrewBotPilot=Object.freeze({create});
})(globalThis);
