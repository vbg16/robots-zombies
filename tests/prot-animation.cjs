const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const SpriteAnimation=require('../sprite-animation.js');
const manifest=require('../prot-animation.js');
const metadata=require('../assets/robots/prot-0001-walk-v2.json');
assert.deepEqual(manifest.clips,metadata.clips,'Classic manifest must match its JSON source');
assert.equal(manifest.image,metadata.image);
assert.equal(manifest.groundOffset,28);
const browser={};vm.runInNewContext(fs.readFileSync(require.resolve('../prot-animation.js'),'utf8'),browser);
assert.equal(browser.ScrewProtAnimation.image,manifest.image,'Manifest loads without modules/fetch');
const animation=new SpriteAnimation({naturalWidth:1774,naturalHeight:887},manifest.clips,{scale:manifest.scale});
for(const direction of metadata.directions){
 assert.equal(animation.play('walk',direction),true);
 const frames=manifest.clips['walk.'+direction];
 assert.equal(frames.length,8);
 for(let i=0;i<80;i++){
  const f=animation.frame;
  assert.equal(f,frames[i%8]);
  let destination;
  animation.draw({save(){},restore(){},drawImage(...args){destination=args;}},100,228);
  // Subpixel rounding may move the visible grounding by at most half a pixel.
  assert.ok(Math.abs(destination[6]+f.pivotY*manifest.scale-228)<=.5);
  assert.ok((f.visibleBounds[3]-f.visibleBounds[1])*manifest.scale<=72.000001);
  animation.update(.1);
 }
 assert.equal(animation.frame,frames[0]);
 assert.equal(animation.play('idle',direction),true);
 assert.deepEqual(animation.frame,{...frames[0],ms:1000});
}
const html=fs.readFileSync(require.resolve('../index.html'),'utf8');
assert.ok(html.indexOf('src="sprite-animation.js"')<html.indexOf('src="prot-animation.js"'));
assert.ok(html.indexOf('src="prot-animation.js"')<html.indexOf('src="app-loader.js"'));
console.log('PROT classic manifest,32 frame anchors,72px size and10cycles per direction passed.');
