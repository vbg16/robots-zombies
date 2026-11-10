'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const model=require('../tools/rupture-chamber.js');
assert.equal(model.MAX_CHARGES,60);assert.equal(model.BONUS_PER_CHARGE,.25);assert.equal(Object.isFrozen(model),true);
assert.deepEqual(model.emit(0,1),{stored:0,factor:1.25,last:true},'single-shot weapon includes its current shot');
assert.deepEqual(model.emit(0,6),{stored:1,factor:1,last:false});
assert.deepEqual(model.emit(59,2),{stored:60,factor:1,last:false});
assert.deepEqual(model.emit(60,2),{stored:60,factor:1,last:false},'cap cannot grow during non-last emissions');
assert.deepEqual(model.emit(60,1),{stored:0,factor:16,last:true},'capped charges release and clear on last round');
// Independent whole-cycle totals: one unit base damage per emission, no critical.
// Sum = ordinary N units + quarter unit per charge (at most60), all on the last.
for(const [capacity,expectedTotal,expectedLast]of [[1,1.25,1.25],[6,7.5,2.5],[24,30,7],[72,87,16]]){
 let stored=0,total=0,lastCount=0;
 for(let ammo=capacity;ammo>=1;ammo--){const result=model.emit(stored,ammo);total+=result.factor;lastCount+=Number(result.last);assert.ok(result.stored>=0&&result.stored<=60);if(ammo>1){assert.equal(result.factor,1,'normal round remains unboosted');assert.equal(result.last,false);}else assert.equal(result.factor,expectedLast);stored=result.stored;}
 assert.equal(total,expectedTotal,'conserved cycle damage for capacity'+capacity);assert.equal(lastCount,1);assert.equal(stored,0,'each completed cycle clears storage');
}
// Installing with four rounds remaining in a24-round weapon counts only four
// new emissions. The missing20shots never become implicit stored charges.
let partialStored=0,partialTotal=0,partialLast;
for(const ammo of [4,3,2,1]){const result=model.emit(partialStored,ammo);partialStored=result.stored;partialTotal+=result.factor;partialLast=result;}
assert.deepEqual(partialLast,{stored:0,factor:2,last:true});assert.equal(partialTotal,5);
// The model has no refill callback or hidden history. Jumping ammo from2to6
// between actual emissions adds only the next single charge, never four more.
const first=model.emit(0,2);let ownerAmmo=1;ownerAmmo+=5;assert.equal(first.stored,1,'refilling caller ammo cannot mutate an existing result');
const afterRefill=model.emit(first.stored,ownerAmmo);assert.deepEqual(afterRefill,{stored:2,factor:1,last:false});
assert.deepEqual(model.emit(afterRefill.stored,1),{stored:0,factor:1.75,last:true});
assert.deepEqual(model.emit(0,24),{stored:1,factor:1,last:false},'new cycle has no hidden prior storage');
assert.deepEqual(model.emit(0,Number.MAX_SAFE_INTEGER),{stored:1,factor:1,last:false},'positive ammo value does not imply a charge count');
// Every return is new and mutable without poisoning subsequent calls.
const a=model.emit(5,1),b=model.emit(5,1);assert.notEqual(a,b);assert.deepEqual(a,b);a.stored=60;a.factor=999;a.last=false;assert.deepEqual(b,{stored:0,factor:2.5,last:true});assert.deepEqual(model.emit(5,1),b);model.emit(60,1);assert.deepEqual(model.emit(5,1),b);
for(const stored of [-1,61,.5,NaN,Infinity,-Infinity,undefined,null,'1',{},1n])assert.throws(()=>model.emit(stored,6),TypeError);
for(const ammo of [0,-1,.5,NaN,Infinity,-Infinity,undefined,null,'1',{},1n])assert.throws(()=>model.emit(0,ammo),TypeError);
assert.throws(()=>model.emit(),TypeError);assert.deepEqual(model.emit(0,1),{stored:0,factor:1.25,last:true},'invalid calls leave no hidden state');
// Browser export uses no DOM, randomness, wall clock or timers.
const sandbox={Math:Object.assign(Object.create(Math),{random(){throw Error('RNG accessed')}}),Date:function(){throw Error('clock accessed')},setTimeout(){throw Error('timer accessed')},setInterval(){throw Error('timer accessed')}};
Object.defineProperty(sandbox,'document',{get(){throw Error('DOM accessed')}});
vm.runInNewContext(fs.readFileSync('tools/rupture-chamber.js','utf8'),sandbox);
assert.equal(sandbox.ScrewRuptureChamber.MAX_CHARGES,60);assert.equal(sandbox.ScrewRuptureChamber.BONUS_PER_CHARGE,.25);assert.equal(sandbox.ScrewRuptureChamber.emit(23,1).factor,7);assert.equal(sandbox.ScrewRuptureChamber.emit(3,2).stored,4);
assert.deepEqual(Object.keys(sandbox).sort(),['Math','Date','setTimeout','setInterval','ScrewRuptureChamber'].sort());
console.log('Rupture chamber model: cycles1/6/24/72, conserved cycle damage, current-shot inclusion,60-charge cap, partial installation, refill isolation, fresh results, invalid inputs and pure UMD passed.');
