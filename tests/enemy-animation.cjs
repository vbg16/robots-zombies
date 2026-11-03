'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const {advance,frameFor,EnemyAnimationRenderer}=require('../enemy-animation.js'),atlases=require('../zombie-atlases.js');
const z={x:0,y:0,hp:100,r:13,speed:40};
for(const [direction,dx,dy] of [['right',8,0],['down',0,8],['left',-8,0],['up',0,-8]]){
 const x=z.x,y=z.y;z.x+=dx;z.y+=dy;advance(z,x,y);assert.equal(z.visualFacing,direction);assert.equal(z.visualWalking,true);
 const frame=frameFor(z,atlases[0]);assert.equal(frame,atlases[0].clips['walk.'+direction][Math.floor(z.visualPhase)]);
}
const phase=z.visualPhase;advance(z,z.x,z.y);assert.equal(z.visualWalking,false);assert.equal(z.visualPhase,phase);assert.equal(frameFor(z,atlases[0]),atlases[0].clips['walk.up'][0]);
assert.equal(z.hp,100);assert.equal(z.r,13);assert.equal(z.speed,40);
let canvasCount=0,pixels=0;const operations=[];
const surface=(width,height)=>{canvasCount++;pixels+=width*height;return {width,height,getContext:()=>({drawImage(...a){operations.push(['image',...a.slice(1)]);},fillRect(){operations.push(['tint',this.globalCompositeOperation]);},beginPath(){},ellipse(){},fill(){}})};};
const renderer=new EnemyAnimationRenderer(atlases,surface);
for(const [i,atlas] of atlases.entries()){
 const image=fs.readFileSync(atlas.image);assert.equal(image.readUInt32BE(16),atlas.width);assert.equal(image.readUInt32BE(20),atlas.height);assert.equal(crypto.createHash('sha256').update(image).digest('hex'),atlas.imageSha256);
 renderer.images[i]={naturalWidth:atlas.width,naturalHeight:atlas.height};renderer.ready[i]=true;
 for(const direction of ['down','right','up','left'])for(const frame of atlas.clips['walk.'+direction]){
  assert.ok(frame.x>=0&&frame.y>=0&&frame.x+frame.w<=atlas.width&&frame.y+frame.h<=atlas.height);
  assert.ok(frame.visibleBounds[0]>0&&frame.visibleBounds[1]>0&&frame.visibleBounds[2]<frame.w&&frame.visibleBounds[3]<=frame.h,'visible body remains in cell');
 }
}
const draws=[],world={drawImage(...a){draws.push(a);}};
for(let variant=0;variant<3;variant++)for(const visualFacing of ['down','right','up','left'])for(let visualPhase=0;visualPhase<8;visualPhase++)for(const height of [51,55,58,62,65,95])for(const hit of [0,.12]){
 const actor={x:100,y:200,visualFacing,visualPhase,visualWalking:true,hit};const before=JSON.stringify(actor),a=renderer.draw(world,actor,variant,height),count=canvasCount,b=renderer.draw(world,actor,variant,height);
 assert.equal(JSON.stringify(actor),before,'rendering never advances actor state');assert.equal(a,b);assert.equal(canvasCount,count,'cache reuses frame instead of scaling/compositing each draw');
}
const cacheBytes=pixels*4;assert.equal(renderer.cache.size,36);assert.ok(cacheBytes<50*1024*1024,'all possible runtime classes remain below50MiB raw surfaces');
assert.ok(operations.filter(v=>v[0]==='tint').every(v=>v[1]==='source-atop'),'tint is isolated to an offscreen sprite');
renderer.ready[1]=false;assert.equal(renderer.draw(world,z,1,58),false,'failed atlas returns to legacy renderer');
const bitmap={frozen:true},immutable=new EnemyAnimationRenderer(atlases,(w,h)=>({...surface(w,h),transferToImageBitmap:()=>bitmap}));immutable.ready[0]=true;immutable.images[0]=renderer.images[0];
assert.equal(immutable.draw(world,z,0,58).surface,bitmap,'finished texture is immutable');
assert.ok([...immutable.cache.values()][0].size===32,'all32frames share a single finished sheet');
console.log(`Enemy animation:96 directional frames, movement-driven phase, geometry, alpha-isolated flashes and bounded36sheet cache (${(cacheBytes/1024/1024).toFixed(1)}MiB maximum) passed.`);
