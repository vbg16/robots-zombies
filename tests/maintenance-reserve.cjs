'use strict';
// Arithmetic acceptance for the proposed engine; not runtime integration/balance.
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const api=require('../tools/maintenance-reserve.js'),{inspectFiniteState}=require('../tools/finite-state.cjs');
let checks=0;function eq(actual,expected){assert.deepEqual(actual,expected);checks++;if(actual!==null)assert.equal(inspectFiniteState(actual).invalid.length,0);}
eq(api.absorb(20,12),{value:8,spent:12,hpDamage:0});
eq(api.absorb(8,12),{value:0,spent:8,hpDamage:4});
eq(api.absorb(20,50),{value:0,spent:20,hpDamage:30});
eq(api.absorb(0,Number.MAX_VALUE),{value:0,spent:0,hpDamage:Number.MAX_VALUE});
eq(api.add(39,12),{value:40,gain:1});eq(api.add(40,Number.MAX_VALUE),{value:40,gain:0});
eq(api.heal(95,100,10,20),{hp:100,actual:5,excess:5,value:22.5,gain:2.5});
eq(api.heal(100,100,10,39),{hp:100,actual:0,excess:10,value:40,gain:1});
eq(api.heal(1,Number.MAX_VALUE,Number.MAX_VALUE,0),{hp:Number.MAX_VALUE,actual:Number.MAX_VALUE,excess:0,value:0,gain:0});
eq(api.heal(100,100,Number.MAX_VALUE,0),{hp:100,actual:0,excess:Number.MAX_VALUE,value:40,gain:40});
for(const [time,tier] of [[0,0],[14.999,0],[15,1],[29.999,1],[30,2]]){eq(api.offense(time,false).tier,tier);eq(api.offense(time,true).factor,(1+tier*.1)*1.2);}
eq(api.advance(0,Number.MAX_VALUE),30);eq(api.advance(29.5,1),30);
let elapsed=0;for(let i=0;i<120;i++)elapsed=api.advance(elapsed,.25);eq(elapsed,30);
for(const [kills,credit] of [[0,0],[1,1],[3,3],[10,3]])eq(api.pulse(0,kills,120,false),{value:credit*4,gain:credit*4,credited:credit,shieldTimer:120-credit*8,shieldReady:false});
eq(api.pulse(39,1,7,false),{value:40,gain:1,credited:1,shieldTimer:0,shieldReady:true});
eq(api.pulse(0,3,0,true),{value:12,gain:12,credited:3,shieldTimer:0,shieldReady:true});
// Invalid inputs are rejected, never normalized into a new valid-looking state.
for(const bad of [NaN,Infinity,-Infinity,undefined,'20',-1,41]){eq(api.add(bad,1),null);eq(api.absorb(bad,1),null);eq(api.heal(50,100,10,bad),null);}
for(const bad of [NaN,Infinity,-Infinity,-1]){eq(api.add(20,bad),null);eq(api.absorb(20,bad),null);eq(api.heal(50,100,bad,20),null);eq(api.advance(0,bad),null);eq(api.offense(bad,false),null);eq(api.pulse(0,1,bad,false),null);}
for(const bad of [NaN,Infinity,-1,1.5,Number.MAX_SAFE_INTEGER+1])eq(api.pulse(0,bad,120,false),null);
eq(api.heal(0,100,100,20),null);eq(api.heal(101,100,10,20),null);eq(api.heal(50,100,0,20),null);
// Thousands of finite boundary combinations preserve conservation and bounds.
for(let value=0;value<=40;value+=.5)for(const damage of [0,.25,1,12,40,100,1e9,Number.MAX_VALUE]){
 const result=api.absorb(value,damage);assert.equal(inspectFiniteState(result).invalid.length,0);assert.ok(result.value>=0&&result.value<=40);assert.equal(result.value+result.spent,value);assert.equal(result.hpDamage+result.spent,damage);checks++;
}
const result={kind:'pure-arithmetic-prototype',at:new Date().toISOString(),checks,passed:true,
 sourceHashes:Object.fromEntries(['tools/maintenance-reserve.js','tools/finite-state.cjs','tests/maintenance-reserve.cjs'].map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')])),
 limitations:['Not loaded by index.html or game.js yet.','Does not prove acquisition, event ordering, pulse attribution, multi-weapon snapshots, HUD, migration, audio or natural balance.','Caller must supply actual shield ownership; a zero timer alone does not create a shield skill.']};
fs.mkdirSync('outputs/maintenance-engine63',{recursive:true});fs.writeFileSync('outputs/maintenance-engine63/result.json',JSON.stringify(result,null,2));
console.log('Reserve arithmetic prototype: '+checks+' assertions passed; not yet integrated into gameplay.');
