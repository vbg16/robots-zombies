'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const model=require('../tools/drone-maturity.js');
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,`${a} != ${b}`);
assert.deepEqual(model.get(0),{tier:0,damageFactor:1,nextIn:30,maxed:false});
assert.deepEqual(model.get(-100),model.get(0));assert.deepEqual(model.get(-0),model.get(0));
for(const [age,tier,factor,nextIn,maxed] of [
 [15,0,1,15,false],[29.999,0,1,.001,false],
 [30,1,1.1,30,false],[30.001,1,1.1,29.999,false],
 [59.999,1,1.1,.001,false],[60,2,1.2,30,false],
 [60.001,2,1.2,29.999,false],[89.999,2,1.2,.001,false],
 [90,3,1.3,0,true],[90.001,3,1.3,0,true],
 [120,3,1.3,0,true],[Number.MAX_VALUE,3,1.3,0,true]
]){
 const got=model.get(age);assert.equal(got.tier,tier);assert.equal(got.damageFactor,factor);close(got.nextIn,nextIn);assert.equal(got.maxed,maxed);
}
// The countdown is continuous between milestones; the damage deliberately steps at them.
for(const [a,b] of [[.25,12.75],[30.25,53.75],[60.25,84.75]]){
 const before=model.get(a),after=model.get(b);assert.equal(before.damageFactor,after.damageFactor);close(before.nextIn-after.nextIn,b-a);close(a+before.nextIn,b+after.nextIn);
}
for(const boundary of [30,60,90]){const before=model.get(boundary-.000001),at=model.get(boundary),after=model.get(boundary+.000001);assert.equal(at.tier,before.tier+1);assert.equal(after.tier,at.tier);assert.ok(at.damageFactor>before.damageFactor);assert.ok(before.nextIn>0&&before.nextIn<.000002);}
// Call order cannot age the model; output mutation cannot poison later calls.
const expected=model.get(45),mutable=model.get(45);mutable.tier=99;mutable.damageFactor=100;mutable.nextIn=-1;model.get(99999);assert.deepEqual(model.get(45),expected);assert.notEqual(model.get(45),model.get(45));
for(const age of [NaN,Infinity,-Infinity,undefined,null,'30',{},30n])assert.throws(()=>model.get(age),TypeError);
// Browser UMD requires no DOM, random source, wall clock or timers.
const sandbox={Math:Object.assign(Object.create(Math),{random(){throw Error('RNG accessed')}}),Date:function(){throw Error('clock accessed')},setTimeout(){throw Error('timer accessed')}};
vm.runInNewContext(fs.readFileSync('tools/drone-maturity.js','utf8'),sandbox);
assert.equal(sandbox.ScrewDroneMaturity.get(60).damageFactor,1.2);assert.equal(sandbox.ScrewDroneMaturity.get(90).maxed,true);assert.deepEqual(Object.keys(sandbox).sort(),['Date','Math','ScrewDroneMaturity','setTimeout'].sort());
console.log('Drone maturity: milestone boundaries, countdown continuity, stepped bonuses, negative/invalid ages, cap, independent outputs and pure UMD passed.');
