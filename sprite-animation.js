// Optional renderer. Not loaded by index.html until final production assets arrive.
(function(root){
'use strict';
class SpriteAnimation {
 constructor(image,clips,{scale=1,pivotX=0,pivotY=0}={}){
  if(!image||!(image.naturalWidth>0)||!(image.naturalHeight>0))throw Error('Image is not loaded');
  if(!Number.isFinite(scale)||scale<=0||!Number.isFinite(pivotX)||!Number.isFinite(pivotY))throw Error('Invalid sprite geometry');
  if(!clips||!Object.keys(clips).length)throw Error('No animation clips');
  for(const frames of Object.values(clips)){
   if(!Array.isArray(frames)||!frames.length)throw Error('Empty clip');
   for(const f of frames)if(![f.x,f.y,f.w,f.h,f.ms].every(Number.isFinite)||f.x<0||f.y<0||f.w<=0||f.h<=0||f.ms<=0||f.x+f.w>image.naturalWidth||f.y+f.h>image.naturalHeight)throw Error('Invalid frame');
  }
  this.image=image;this.clips=clips;this.scale=scale;this.pivotX=pivotX;this.pivotY=pivotY;
  this.clip=null;this.time=0;
 }
 static load(src,clips,options){
  return new Promise((resolve,reject)=>{
   const image=new Image();
   image.onload=()=>{try{resolve(new SpriteAnimation(image,clips,options));}catch(error){reject(error);}};
   image.onerror=()=>reject(Error('Sprite image could not be loaded: '+src));
   image.src=src;
  });
 }
 play(state,direction){
  const key=state+'.'+direction;
  // Do not silently choose an unrelated facing when a clip is missing.
  if(!this.clips[key])return false;
  if(this.clip!==key){this.clip=key;this.time=0;}
  return true;
 }
 update(dt){
  if(!Number.isFinite(dt)||dt<0)throw Error('Invalid animation delta');
  if(!this.clip)return;
  const duration=this.clips[this.clip].reduce((sum,f)=>sum+f.ms,0);
  this.time=(this.time+dt*1000)%duration;
 }
 get frame(){
  if(!this.clip)return null;
  let time=this.time;const frames=this.clips[this.clip];
  for(const f of frames){if(time<f.ms)return f;time-=f.ms;}
  return frames[frames.length-1];
 }
 draw(ctx,x,y){
  const f=this.frame;if(!f)return false;
  ctx.save();
  try{ctx.imageSmoothingEnabled=false;
   ctx.drawImage(this.image,f.x,f.y,f.w,f.h,Math.round(x-this.pivotX*this.scale),Math.round(y-this.pivotY*this.scale),f.w*this.scale,f.h*this.scale);
  }finally{ctx.restore();}
  return true;
 }
}
if(typeof module!=='undefined'&&module.exports)module.exports=SpriteAnimation;
else root.SpriteAnimation=SpriteAnimation;
})(globalThis);
