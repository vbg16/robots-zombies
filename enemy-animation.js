/* Original directional actors. Rendering caches are cosmetic and never advance simulation. */
(function(root){
 'use strict';
 const directions=['down','right','up','left'];
 const sizeClasses=[51,55,58,62,65];
 function advance(z,x,y){
  const dx=z.x-x,dy=z.y-y,distance=Math.hypot(dx,dy);
  z.visualWalking=distance>1e-7;
  if(!z.visualWalking)return;
  z.visualFacing=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');
  z.visualPhase=((z.visualPhase||0)+distance/64*8)%8;
 }
 function frameFor(z,atlas){
  const direction=directions.includes(z.visualFacing)?z.visualFacing:'down';
  return atlas.clips['walk.'+direction][z.visualWalking?Math.floor(z.visualPhase||0)%8:0];
 }
 class EnemyAnimationRenderer{
  constructor(atlases,createSurface){
   this.atlases=atlases;this.createSurface=createSurface;this.images=[];this.cache=new Map();this.ready=[];
  }
  load(ImageType=Image){
   return Promise.all(this.atlases.map((atlas,i)=>new Promise(resolve=>{
    const image=new ImageType();this.images[i]=image;
    image.onload=()=>{this.ready[i]=image.naturalWidth===atlas.width&&image.naturalHeight===atlas.height;resolve(!!this.ready[i]);};
    image.onerror=()=>{this.ready[i]=false;resolve(false);};image.src=atlas.image;
   })));
  }
  prepare(variant,height,frame,hit){
   const key=[variant,height,hit?1:0].join(':');
   if(this.cache.has(key))return this.cache.get(key).get(frame);
   const atlas=this.atlases[variant],scale=height/atlas.maxVisibleHeight,frames=directions.flatMap(d=>atlas.clips['walk.'+d]);
   const cellW=Math.ceil(Math.max(...frames.map(f=>f.w))*scale)+16,cellH=Math.ceil(Math.max(...frames.map(f=>f.h))*scale)+20;
   const surface=this.createSurface(cellW*8,cellH*4),c=surface.getContext('2d',{willReadFrequently:true}),preparedFrames=new Map();c.imageSmoothingEnabled=false;
   // One texture per variant/size/flash, not a separate GPU texture for every frame.
   for(let i=0;i<frames.length;i++){
    const f=frames[i],sx=(i%8)*cellW,sy=Math.floor(i/8)*cellH;
    c.drawImage(this.images[variant],f.x,f.y,f.w,f.h,sx+8,sy+8,f.w*scale,f.h*scale);
    if(hit){c.globalCompositeOperation='source-atop';c.fillStyle='rgba(255,255,255,.72)';c.fillRect(sx,sy,cellW,cellH);c.globalCompositeOperation='source-over';}
    const prepared={surface,sx,sy,cellW,cellH,dx:Math.round(-f.pivotX*scale)-8,dy:Math.round(height*.45-f.pivotY*scale)-8,height,width:atlas.maxVisibleWidth*scale};
    c.globalCompositeOperation='destination-over';c.fillStyle='rgba(0,0,0,.42)';c.beginPath();c.ellipse(sx-prepared.dx,sy+height*.39-prepared.dy,prepared.width*.44,height*.1,0,0,Math.PI*2);c.fill();c.globalCompositeOperation='source-over';
    preparedFrames.set(f,prepared);
   }
   // Freeze the completed atlas: drawing a mutable Canvas source repeatedly may force
   // expensive synchronization between Chrome's rendering contexts.
   if(typeof surface.transferToImageBitmap==='function'){
    const bitmap=surface.transferToImageBitmap();for(const prepared of preparedFrames.values())prepared.surface=bitmap;
   }else if(typeof root.createImageBitmap==='function'){
    root.createImageBitmap(surface).then(bitmap=>{for(const prepared of preparedFrames.values())prepared.surface=bitmap;}).catch(()=>{});
   }
   this.cache.set(key,preparedFrames);return preparedFrames.get(frame);
  }
  draw(ctx,z,variant,height){
   if(!this.ready[variant])return false;
   // Six cosmetic size classes bound cache memory. Physics keeps the exact radius.
   height=height>=90?95:sizeClasses.reduce((best,size)=>Math.abs(height-size)<Math.abs(height-best)?size:best,58);
   const prepared=this.prepare(variant,height,frameFor(z,this.atlases[variant]),z.hit>0);
   ctx.drawImage(prepared.surface,prepared.sx,prepared.sy,prepared.cellW,prepared.cellH,Math.round(z.x)+prepared.dx,Math.round(z.y)+prepared.dy,prepared.cellW,prepared.cellH);
   return prepared;
  }
 }
 const api={advance,frameFor,EnemyAnimationRenderer};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else{root.ScrewEnemyAnimation=api;if(root.ScrewZombieAtlases&&(typeof root.OffscreenCanvas==='function'||typeof root.createImageBitmap==='function')){const renderer=new EnemyAnimationRenderer(root.ScrewZombieAtlases,(w,h)=>{if(typeof root.OffscreenCanvas==='function')return new root.OffscreenCanvas(w,h);const c=document.createElement('canvas');c.width=w;c.height=h;return c;});root.ScrewZombieRenderer=renderer;renderer.load();}}
})(globalThis);
