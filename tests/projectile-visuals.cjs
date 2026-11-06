'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let bootstrap=fs.readFileSync('tests/combat.cjs','utf8').split('assert.match(')[0];
bootstrap=bootstrap.replace('get:(target,key)=>target[key]||(()=>{})','get:(target,key)=>target[key]||((...args)=>{(target.calls||(target.calls=[])).push({key,args});})');
const {context}=new Function('require',bootstrap+';return {context};')(require),run=s=>vm.runInContext(s,context),read=s=>JSON.parse(run('JSON.stringify('+s+')'));
run('reset();globalThis.visualRandom=Math.random;Math.random=()=>{throw Error("drawing consumed combat RNG")};globalThis.b={weapon:{...WEAPONS.laser,id:"laser"},x:20,y:30,vx:570,vy:0,radius:4,life:.4,maxLife:1,crit:false};globalThis.before=JSON.stringify({b,clock,damage:player.damage,ammo:player.ammo});ctx.calls=[];drawProjectile(b)');
assert.ok(read('ctx.calls').some(c=>c.key==='fillRect'&&c.args[0]===-15&&c.args[2]===27),'auxiliary laser uses its own beam while primary is machine');
assert.equal(run('JSON.stringify({b,clock,damage:player.damage,ammo:player.ammo})'),run('before'),'rendering changes no projectile or combat fields');
for(const id of run('Object.keys(WEAPONS)')){
 context.qaVisualWeapon=id;run('b.weapon={...WEAPONS[qaVisualWeapon],id:qaVisualWeapon};b.radius=b.weapon.radius||6;b.crit=false;ctx.calls=[];drawProjectile(b);globalThis.normalStrokes=ctx.calls.filter(c=>c.key==="stroke").length;b.crit=true;ctx.calls=[];drawProjectile(b)');
 assert.equal(run('ctx.calls.filter(c=>c.key==="stroke").length'),run('normalStrokes+1'),id+' critical has an extra visible marker');
}
run('delete b.weapon;drawProjectile(b);Math.random=visualRandom');
console.log('Projectile visuals: own-weapon snapshot, 12 critical markers, legacy fallback, immutable projectile/player/clock and zero combat RNG passed.');
