'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),telemetry=require('../tools/run-telemetry.js');
const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-9,`${actual} != ${expected}`);
const sum=(rows,key)=>rows.reduce((n,r)=>n+r[key],0);
const point=(time,hp=100,other={})=>({time,hp,maxHp:100,bossAlive:false,bossInRange:false,hasTarget:true,firing:false,reloadingSlots:0,weaponCount:1,...other});
// Fractional XP is independent of level/bar resets and survives capped event details.
const t=telemetry.create({maxEvents:2});
t.sample(point(0),0);t.record('xpProduced',{time:10,amount:.125});t.record('xpCollected',{time:11,amount:.0625});t.record('xpProduced',{time:60,amount:2.25});t.record('xpCollected',{time:61,amount:1.125});
// Healing is the EFFECTIVE amount supplied by caller, not attempted healing or net HP change.
// 95 HP + 7 effective heal - 2 damage -> 100; net +5 must not erase two healed HP.
t.record('xpAwarded',{time:11,amount:.125});t.record('xpAwarded',{time:61,amount:2.25});
t.record('heal',{time:59,amount:7,source:'repair'});t.record('damage',{time:59,amount:2,source:'contact'});
t.record('heal',{time:61,amount:.5,source:'cell'});t.record('damage',{time:61,amount:1.75,source:'projectile'});
t.sample(point(59.75,95,{firing:true,reloadingSlots:1,weaponCount:2}),59.75);
t.sample(point(60.25,85,{bossAlive:true,bossInRange:true,hasTarget:false,reloadingSlots:2,weaponCount:2}),.5);
t.sample(point(120.5,90,{bossAlive:true,firing:true,weaponCount:3}),60.25);
let r=t.finish();close(r.totals.xpProduced,2.375);close(r.totals.xpCollected,1.1875);close(r.totals.xpAwarded,2.375);assert.notEqual(r.totals.xpAwarded,r.totals.xpCollected,'effective XP is not a base-orb count');close(r.totals.heal.repair,7);close(r.totals.heal.cell,.5);assert.deepEqual(r.totals.damage.dealt.body,{contact:2,projectile:1.75});
close(r.minutes[0].xpProduced,.125);close(r.minutes[1].xpProduced,2.25);assert.equal(r.totals.hpMin,85);assert.deepEqual(r.minutes.map(m=>m.hpMin),[95,85,90]);
close(r.totals.seconds,120.5);assert.deepEqual(r.minutes.map(m=>m.seconds),[60,60,.5]);close(r.totals.bossAliveSeconds,60.75);close(r.totals.bossInRangeSeconds,.5);close(r.totals.firingSeconds,120);close(r.totals.noTargetSeconds,.5);close(r.totals.reloadingSlotSeconds,60.75);close(r.totals.weaponSlotSeconds,301.25);
for(const key of ['seconds','xpProduced','xpCollected','xpAwarded','bossAliveSeconds','bossInRangeSeconds','firingSeconds','noTargetSeconds','reloadingSlotSeconds','weaponSlotSeconds'])close(sum(r.minutes,key),r.totals[key]);
for(const source of Object.keys(r.totals.heal))close(r.minutes.reduce((n,m)=>n+(m.heal[source]||0),0),r.totals.heal[source]);
for(const direction of ['dealt','received'])for(const target of ['body','shield'])for(const source of Object.keys(r.totals.damage[direction][target]))close(r.minutes.reduce((n,m)=>n+(m.damage[direction][target][source]||0),0),r.totals.damage[direction][target][source]);
assert.equal(r.events.length,0);assert.equal(r.dropped,0);assert.equal(r.samples,4);
// Full offers/decisions are retained by value, and details dropping never drops aggregates.
const u=telemetry.create({maxEvents:1}),payload={time:5,level:2,kind:'upgrade',version:8,options:[{id:'damage',cost:'none'},{id:'magnet',cost:'none'}],chosen:null,reason:'declined',rerolled:false};
u.record('offer',payload);payload.options[0].id='mutated';u.record('decision',{time:6,target:'chest-1',reason:'blocked-corridor',distance:345});u.record('offer',{time:7,chosen:'damage'});
let copy=u.finish();assert.equal(copy.events[0].payload.options[0].id,'damage');assert.equal(copy.events[0].payload.options.length,2);assert.equal(copy.events[0].payload.chosen,null);assert.equal(copy.totals.offers,2);assert.equal(copy.totals.decisions,1);assert.equal(copy.dropped,2);
copy.events[0].payload.options.length=0;copy.totals.offers=999;assert.equal(u.finish().events[0].payload.options.length,2);assert.equal(u.finish().totals.offers,2);u.record('xpCollected',{time:8,amount:.25});assert.equal(u.finish().totals.xpCollected,.25,'finish does not end collection');
// Invalid input is explicit and transactional, including clock gaps and source-map edge keys.
const v=telemetry.create({maxEvents:0});v.sample(point(0),0);const original=JSON.stringify(v.finish());
for(const fn of [()=>v.record('damage',{time:0,amount:-1,source:'x'}),()=>v.record('heal',{time:0,amount:NaN,source:'x'}),()=>v.record('offer',{time:0,chosen:undefined}),()=>v.sample(point(10),1),()=>v.sample(point(1,101),1),()=>v.sample(point(1,90,{reloadingSlots:2}),1),()=>v.sample(point(1,90,{bossInRange:true}),1)]){assert.throws(fn);assert.equal(JSON.stringify(v.finish()),original);}
assert.throws(()=>telemetry.create({maxEvents:-1}));assert.throws(()=>telemetry.create({maxEvents:1.5}));
v.record('damage',{time:0,amount:2,source:'__proto__'});v.record('damage',{time:0,amount:3,source:'constructor'});assert.equal(v.finish().totals.damage.dealt.body.__proto__,2);assert.equal(v.finish().totals.damage.dealt.body.constructor,3);assert.equal(v.finish().events.length,0);assert.equal(v.finish().dropped,0);
const frozen=Object.freeze(point(1,80));v.sample(frozen,1);assert.deepEqual(frozen,point(1,80));
// A long interval conserves elapsed time without rounding it to sample count.
const w=telemetry.create();w.sample(point(0),0);w.sample(point(125,70,{bossAlive:true,bossInRange:true}),125);assert.deepEqual(w.finish().minutes.map(m=>m.seconds),[60,60,5]);close(w.finish().totals.bossInRangeSeconds,125);
// UMD browser export requires no DOM, timers, wall clock or random source.
const sandbox={Math:Object.assign(Object.create(Math),{random(){throw Error('RNG accessed')}}),Date:function(){throw Error('wall clock accessed')},setTimeout(){throw Error('timer accessed')}};vm.runInNewContext(fs.readFileSync('tools/run-telemetry.js','utf8'),sandbox);assert.equal(typeof sandbox.ScrewRunTelemetry.create,'function');const pure=sandbox.ScrewRunTelemetry.create();pure.record('xpProduced',{time:0,amount:.5});assert.equal(pure.finish().totals.xpProduced,.5);
// Body/shield and incoming/outgoing damage must never merge, even with the same source.
const separate=telemetry.create();
for(const [direction,target,amount] of [['dealt','body',7],['dealt','shield',11],['received','body',13],['received','shield',17]])separate.record('damage',{time:60,amount,source:'bullet',direction,target});
const separated=separate.finish();assert.equal(separated.totals.damage.dealt.body.bullet,7);assert.equal(separated.totals.damage.dealt.shield.bullet,11);assert.equal(separated.totals.damage.received.body.bullet,13);assert.equal(separated.totals.damage.received.shield.bullet,17);assert.deepEqual(separated.minutes[0].damage,separated.totals.damage);
assert.throws(()=>separate.record('damage',{time:0,amount:1,source:'x',direction:'maybe'}));assert.throws(()=>separate.record('damage',{time:0,amount:1,source:'x',target:'armor'}));
// Saturated route details must not evict offers while a decision can be replaced.
const priority=telemetry.create({maxEvents:2});priority.record('decision',{time:0,type:'route',reason:'blocked'});priority.record('offer',{time:1,id:'A'});priority.record('offer',{time:2,id:'B'});priority.record('offer',{time:3,id:'C'});priority.record('decision',{time:4,type:'choice',reason:'declined'});
const bounded=priority.finish();assert.deepEqual(bounded.events.map(e=>e.payload.id),['A','B']);assert.deepEqual(bounded.droppedByKind,{offer:1,decision:2});assert.equal(bounded.dropped,3);assert.equal(bounded.totals.offers,3);assert.equal(bounded.totals.decisions,2);
console.log('Run telemetry: XP base/effective separation, damage direction/body/shield, effective healing, minute conservation, duration integrals, prioritized bounded details, cloning, invalid inputs and pure UMD passed.');
