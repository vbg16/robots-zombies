'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const api=require('../tools/segment-circle.js'),entry=api.entry;
const close=(actual,expected,label='entry')=>{assert.equal(typeof actual,'number',label);assert.ok(Math.abs(actual-expected)<2e-13,`${label}: ${actual} != ${expected}`);};
assert.equal(Object.isFrozen(api),true);
// Independent analytic intersections: horizontal/vertical, oblique and reversed.
for(const [args,expected]of [
 [[-10,0,10,0,0,0,2],.4],[[10,0,-10,0,0,0,2],.4],
 [[0,-10,0,10,0,0,2],.4],[[-3,-4,3,4,0,0,1],.4],
 [[-5,3,5,3,0,0,5],.1],[[-4,0,-2,0,0,0,2],1],
 [[-4,2,4,2,0,0,2],.5],[[0,0,10,0,0,0,2],0],
 [[2,0,8,0,0,0,2],0],[[0,0,0,0,0,0,0],0],
 [[1,1,1,1,1,1,2],0],[[-1,0,1,0,0,0,0],.5]
])close(entry(...args),expected,JSON.stringify(args));
for(const args of [[3,0,8,0,0,0,2],[-8,0,-3,0,0,0,2],[-4,2.000001,4,2.000001,0,0,2],[3,0,3,0,0,0,2],[-1,1,1,1,0,0,0]])assert.equal(entry(...args),null,'clear miss '+JSON.stringify(args));
// Generated cases use an independently constructed boundary point and normal.
// No random source is needed, and offsets span both directions of travel.
for(const normal of [[1,0],[0,1],[.6,.8],[-.8,.6]])for(const radius of [.25,3,100])for(const fraction of [.125,.25,.5,.875]){
 const [nx,ny]=normal,span=radius*4,px=nx*radius,py=ny*radius;
 const ax=px+nx*span*fraction,ay=py+ny*span*fraction,bx=ax-nx*span,by=ay-ny*span;
 const t=entry(ax,ay,bx,by,0,0,radius);close(t,fraction,'constructed boundary');
 close(Math.hypot(ax+(bx-ax)*t,ay+(by-ay)*t),radius,'returned point on boundary');
 const before=Math.max(0,t-1e-6);assert.ok(Math.hypot(ax+(bx-ax)*before,ay+(by-ay)*before)>radius,'no earlier contact');
 for(const [tx,ty]of [[120,-64],[-1024,2048]])close(entry(ax+tx,ay+ty,bx+tx,by+ty,tx,ty,radius),t,'translation invariant');
 for(const scale of [1e-200,1e200])close(entry(ax*scale,ay*scale,bx*scale,by*scale,0,0,radius*scale),t,'scale invariant');
}
// Rational tangent orientation, including a near miss beyond floating noise.
close(entry(-3.4,-1.2,1.4,5.2,0,0,2),.375,'oblique tangent');
assert.equal(entry(-3.400008,-1.199994,1.399992,5.200006,0,0,2),null,'oblique tangent outward offset');
close(entry(1e12-10,-1e12,1e12+10,-1e12,1e12,-1e12,2),.4,'large translated world');
close(entry(-1e200,0,1e200,0,0,0,2e199),.4,'large distances do not square to infinity');
close(entry(-Number.MAX_VALUE,0,Number.MAX_VALUE,0,0,0,Number.MAX_VALUE/2),.25,'finite endpoints with overflowing subtraction');
close(entry(-1e-300,0,1e-300,0,0,0,2e-301),.4,'tiny squared distances do not underflow');
// Caller inputs remain untouched and invalid values are never coerced.
const args=Object.freeze([-10,0,10,0,0,0,2]);entry(...args);assert.deepEqual(args,[-10,0,10,0,0,0,2]);
for(let i=0;i<7;i++)for(const invalid of [NaN,Infinity,-Infinity,undefined,null,'2',{},2n]){const values=[-10,0,10,0,0,0,2];values[i]=invalid;assert.throws(()=>entry(...values),TypeError);}
assert.throws(()=>entry(-10,0,10,0,0,0,-1),TypeError);assert.throws(()=>entry(),TypeError);
// Browser export works without DOM, clock, timers or combat randomness.
const sandbox={Math:Object.assign(Object.create(Math),{random(){throw Error('RNG accessed')}}),Date:function(){throw Error('clock accessed')},setTimeout(){throw Error('timer accessed')}};
vm.runInNewContext(fs.readFileSync('tools/segment-circle.js','utf8'),sandbox);
close(sandbox.ScrewSegmentCircle.entry(-10,0,10,0,0,0,2),.4,'browser UMD');
assert.deepEqual(Object.keys(sandbox).sort(),['Math','Date','setTimeout','ScrewSegmentCircle'].sort());
console.log('Segment-circle: analytic and constructed entry, inclusive boundary, tangency, misses, zero segments, translation/scale/extreme coordinates, invalid inputs and pure UMD passed.');
