/* Positional circle constraints for living zombie bodies. No AI, HP, timers,
 * rewards, input, or randomness are changed. Corpses and the separate boss do
 * not take part. A small gap keeps silhouettes readable inside dense packs. */
(function(root,factory){'use strict';const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ScrewEnemyCollision=api;})(typeof globalThis==='object'?globalThis:this,function(){
 'use strict';
 const constants=Object.freeze({gap:2,minimumRadius:18,passes:12,tolerance:.025});
 function separate(enemies){
  if(!Array.isArray(enemies))return 0;
  const bodies=[...new Set(enemies)].filter(z=>z&&z.hp>0&&[z.x,z.y,z.r,z.hp].every(Number.isFinite)&&z.r>0);
  if(bodies.length<2)return 0;
  const radius=z=>Math.max(constants.minimumRadius,z.r);
  const size=Math.max(32,2*Math.max(...bodies.map(radius))+constants.gap);
  let corrections=0;
  for(let pass=0;pass<constants.passes;pass++){
   const grid=new Map();
   for(let i=0;i<bodies.length;i++){const z=bodies[i],key=Math.floor(z.x/size)+','+Math.floor(z.y/size);if(!grid.has(key))grid.set(key,[]);grid.get(key).push(i);}
   let largest=0;
   for(let i=0;i<bodies.length;i++){
    const a=bodies[i],cx=Math.floor(a.x/size),cy=Math.floor(a.y/size);
    for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)for(const j of grid.get((cx+x)+','+(cy+y))||[]){
     if(j<=i)continue;const b=bodies[j],dx=b.x-a.x,dy=b.y-a.y,distance=Math.hypot(dx,dy),minimum=radius(a)+radius(b)+constants.gap;
     if(!Number.isFinite(distance)||!Number.isFinite(minimum)||distance>=minimum)continue;
     const overlap=minimum-distance;largest=Math.max(largest,overlap);let ux,uy;
     if(distance>1e-8){ux=dx/distance;uy=dy/distance;}else{
      // Stable, pair-specific normal for identical centers; no combat RNG.
      const angle=((Math.imul(i+1,73856093)^Math.imul(j+1,19349663))>>>0)/4294967296*Math.PI*2;ux=Math.cos(angle);uy=Math.sin(angle);
     }
     const move=overlap*.5;a.x-=ux*move;a.y-=uy*move;b.x+=ux*move;b.y+=uy*move;corrections++;
    }
   }
   if(largest<=constants.tolerance)break;
  }
  return corrections;
 }
 return Object.freeze({constants,separate});
});
