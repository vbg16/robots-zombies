'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const prefix=fs.readFileSync('tests/combat.cjs','utf8').split('assert.match(')[0],{context}=new Function('require',prefix+';return {context};')(require),run=s=>vm.runInContext(s,context);
let seed=20261103,queries=0,list=[],boss=null;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
function setup(items,special=null){list=items;boss=special;context.queryWorld=items;context.queryBoss=special;run('enemies=queryWorld;boss=queryBoss;buildCollisionGrid()');}
function check(x,y,r,count,exclude=null){
 const targets=boss?.hp>0?[...list,boss]:list;
 const expected=targets.filter(t=>t!==exclude&&t.hp>0&&Math.hypot(t.x-x,t.y-y)<=r).sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y)).slice(0,count).map(t=>t.id);
 context.queryArgs=[x,y,r,count,exclude];const before=list.map(t=>[t.x,t.y,t.hp]);assert.deepEqual(Array.from(run('nearestTargets(...queryArgs).map(t=>t.id)')),expected,'ordered nearest: '+JSON.stringify([x,y,r,count]));assert.deepEqual(list.map(t=>[t.x,t.y,t.hp]),before,'query cannot mutate targets');queries++;
}
setup(Array.from({length:2500},(_,id)=>({id,x:random()*10000-5000,y:random()*10000-5000,hp:random()<.1?0:100,r:13})));
for(let i=0;i<1500;i++)check(random()*12000-6000,random()*12000-6000,[0,135,405,1000,1e8][i%5],[0,1,2,3,4,8,20,40][i%8],list[i%list.length]);
for(let i=0;i<500;i++){const t=list[i];t.x+=random()*2000-1000;t.y+=random()*2000-1000;if(i%7===0)t.hp=0;context.movedTarget=t;run('indexTarget(movedTarget)');check(t.x,t.y,405,3,t);}
const ties=[{id:0,x:128,y:0,hp:100},{id:1,x:-128,y:0,hp:100},{id:2,x:0,y:-128,hp:100},{id:3,x:0,y:128,hp:100},{id:4,x:128,y:0,hp:100}];setup([...ties,...Array.from({length:200},(_,i)=>({id:10+i,x:10000+i*128,y:-10000,hp:100}))],{id:999,x:128,y:0,hp:100});
for(const x of [-128,0,128])for(const y of [-128,0,128])for(const r of [0,127.999,128,135,405])for(const count of [1,2,3,8])check(x,y,r,count);
check(0,0,135,3,ties[0]);boss.hp=0;check(0,0,135,8);ties[1].hp=0;check(0,0,135,3);run('collisionGrid=null');check(0,0,135,3);
setup(Array.from({length:200},(_,id)=>({id,x:1e20,y:-1e20,hp:100})));check(1e20,-1e20,405,8);check(NaN,0,405,3);check(1e20,-1e20,1e8,Infinity);
setup(Array.from({length:250},(_,id)=>({id,x:1e9+(id%17-8)*128,y:-1e9+Math.floor(id/17)*128,hp:100})));for(let i=0;i<100;i++)check(1e9+random()*300-150,-1e9+random()*300,405,8);
setup([{id:1,x:0,y:0,hp:100},{id:2,x:0,y:0,hp:0}]);check(0,0,135,3);
console.log('Runtime nearest query passed '+queries+' ordered differential cases:ties/rank,boss/exclusions,deaths,negative cells,knockback duplicate cells,linear fallback and large/unsafe coordinates.');
