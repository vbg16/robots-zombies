const assert=require('node:assert/strict');
const SpriteAnimation=require('../sprite-animation.js');
const image={naturalWidth:64,naturalHeight:32};
const frame=(x,ms)=>({x,y:0,w:32,h:32,ms});
const animation=new SpriteAnimation(image,{'idle.s':[frame(0,200)],'walk.s':[frame(0,100),frame(32,150)]},{scale:2,pivotX:16,pivotY:28});
assert.equal(animation.draw({},0,0),false);
assert.equal(animation.play('walk','s'),true);
animation.update(.1);assert.equal(animation.frame.x,32);
animation.update(.15);assert.equal(animation.frame.x,0);
assert.equal(animation.play('walk','n'),false);
assert.equal(animation.clip,'walk.s');
animation.play('idle','s');assert.equal(animation.time,0);
const calls=[];const ctx={save(){calls.push('save');},restore(){calls.push('restore');},drawImage(...args){calls.push(args);}};
animation.draw(ctx,50,70);assert.equal(ctx.imageSmoothingEnabled,false);
assert.deepEqual(calls[1].slice(5),[18,14,64,64]);assert.equal(calls.at(-1),'restore');
assert.throws(()=>animation.update(-1));
assert.throws(()=>new SpriteAnimation(image,{'idle.s':[frame(40,100)]}));
assert.throws(()=>new SpriteAnimation(image,{'idle.s':[]}));
const anchored=new SpriteAnimation(image,{'walk.s':[
 {...frame(0,100),pivotX:12,pivotY:30},
 {...frame(32,100),pivotX:18,pivotY:27}
]},{scale:2,pivotX:16,pivotY:28});
anchored.play('walk','s');calls.length=0;anchored.draw(ctx,50,70);
assert.deepEqual(calls[1].slice(5),[26,10,64,64]);
anchored.update(.1);calls.length=0;anchored.draw(ctx,50,70);
assert.deepEqual(calls[1].slice(5),[14,16,64,64]);
for(const pivot of [{pivotX:NaN},{pivotX:-1},{pivotX:33},{pivotY:Infinity},{pivotY:null},{pivotY:33}]){
 assert.throws(()=>new SpriteAnimation(image,{'idle.s':[{...frame(0,100),...pivot}]}),/Invalid frame pivot/);
}
const mixed=new SpriteAnimation(image,{'walk.s':[{...frame(0,100),pivotY:32}]},{scale:2,pivotX:16,pivotY:28});
mixed.play('walk','s');calls.length=0;mixed.draw(ctx,50,70);
assert.deepEqual(calls[1].slice(5),[18,6,64,64]);
console.log('Sprite timing, looping, missing directions, geometry, pixel scaling and validation passed.');
