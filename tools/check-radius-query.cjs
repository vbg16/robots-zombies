/* Standalone proposed broad phase. Does not import or modify runtime game code. */
'use strict';
const assert=require('node:assert/strict');
class CandidateRadiusIndex{
 constructor(list){this.list=list;this.cells=new Map();this.rank=new Map(list.map((z,i)=>[z,i]));this.maxRadius=0;for(const z of list)this.insert(z);}
 insert(z){if(z.hp<=0)return;const key=Math.floor(z.x/128)+','+Math.floor(z.y/128);if(!this.cells.has(key))this.cells.set(key,new Set());this.cells.get(key).add(z);this.maxRadius=Math.max(this.maxRadius,z.r||0);}
 query(x,y,radius,body=false,exclude=null){
  const pad=radius+(body?this.maxRadius:0),left=Math.floor((x-pad)/128),right=Math.floor((x+pad)/128),top=Math.floor((y-pad)/128),bottom=Math.floor((y+pad)/128);
  let pool;
  if((right-left+1)*(bottom-top+1)>Math.max(16,this.list.length*4))pool=this.list;
  else{const found=new Set();for(let cx=left;cx<=right;cx++)for(let cy=top;cy<=bottom;cy++)for(const z of this.cells.get(cx+','+cy)||[])found.add(z);pool=[...found].sort((a,b)=>this.rank.get(a)-this.rank.get(b));}
  return pool.filter(z=>z!==exclude&&z.hp>0&&Math.hypot(z.x-x,z.y-y)<=radius+(body?z.r:0));
 }
}
let seed=20261103;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const list=Array.from({length:2500},(_,id)=>({id,x:random()*10000-5000,y:random()*10000-5000,r:1+random()*80,hp:random()<.1?0:100}));
list.push({id:2500,x:-128,y:0,r:300,hp:100},{id:2501,x:128,y:0,r:300,hp:100},{id:2502,x:0,y:-128,r:15,hp:100},{id:2503,x:0,y:128,r:15,hp:100});
const index=new CandidateRadiusIndex(list),ids=items=>items.map(z=>z.id),reference=(x,y,r,body,exclude)=>list.filter(z=>z!==exclude&&z.hp>0&&Math.hypot(z.x-x,z.y-y)<=r+(body?z.r:0));
let queries=0;
function check(x,y,r,body,exclude){const old=reference(x,y,r,body,exclude),candidate=index.query(x,y,r,body,exclude);assert.deepEqual(ids(candidate),ids(old),'ordered radius query');const a=old.map(z=>({z,d:Math.hypot(z.x-x,z.y-y)})).sort((a,b)=>a.d-b.d).slice(0,3),b=candidate.map(z=>({z,d:Math.hypot(z.x-x,z.y-y)})).sort((a,b)=>a.d-b.d).slice(0,3);assert.deepEqual(ids(b.map(a=>a.z)),ids(a.map(a=>a.z)),'stable nearest-target ties');queries++;}
for(const x of [-128,0,128])for(const y of [-128,0,128])for(const r of [0,.001,127.999,128,135,405,480,10000,1e6])for(const body of [false,true])check(x,y,r,body,null);
for(let i=0;i<1500;i++)check(random()*12000-6000,random()*12000-6000,[100,135,405,480][i%4],i%2===0,list[i%list.length]);
for(let i=0;i<500;i++){const z=list[i];z.x+=random()*2000-1000;z.y+=random()*2000-1000;if(i%7===0)z.hp=0;index.insert(z);check(z.x,z.y,405,true,null);}
for(let i=0;i<500;i++)check(random()*12000-6000,random()*12000-6000,480,i%2===0,null);
console.log(`Candidate broad phase passed ${queries} ordered differential queries: negative cells, boundaries, large bodies/radii, live/dead filtering, repeated-cell insertion after knockback and nearest-target ties.`);
module.exports={CandidateRadiusIndex};
