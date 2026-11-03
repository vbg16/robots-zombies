'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict'),SpriteAnimation=require('../sprite-animation.js'),atlases=require('../chassis-atlases.js');
assert.deepEqual(Object.keys(atlases),['bastion','forge','volt','nano','swarm']);
const portraits=new Set();
for(const [id,atlas] of Object.entries(atlases)){
 const png=fs.readFileSync(atlas.image),portrait=fs.readFileSync(atlas.portrait,'utf8'),fallback=fs.readFileSync(atlas.fallback.image,'utf8');
 assert.equal(crypto.createHash('sha256').update(png).digest('hex'),atlas.imageSha256);assert.match(portrait,/width="64" height="80"/);assert.ok(portrait.includes(png.toString('base64')),'portrait wraps the exact original PNG');assert.match(fallback,/width="512" height="320"/);portraits.add(portrait);
 const animation=new SpriteAnimation({naturalWidth:atlas.width,naturalHeight:atlas.height},atlas.clips,{scale:atlas.scale});
 for(const direction of ['down','right','up','left']){
  const frames=atlas.clips['walk.'+direction];assert.equal(frames.length,8);assert.equal(animation.play('walk',direction),true);
  for(let i=0;i<80;i++){assert.equal(animation.frame,frames[i%8]);animation.update(.1);}
  assert.equal(animation.play('idle',direction),true);assert.equal(animation.frame.x,0);
  let draw;animation.draw({save(){},restore(){},drawImage(...args){draw=args;}},100,228);assert.ok(Math.abs(draw[6]+animation.frame.pivotY*atlas.scale-228)<=.5,'feet anchor '+id);
 }
}
assert.equal(portraits.size,5,'each chassis has its own original hardware and portrait');
console.log('Chassis:5 original pixel-art identities with SVG fallbacks,160 directional walk frames, idle, ten cycles and anchors passed.');
