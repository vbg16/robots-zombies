'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {drawPlayerWeapon,models}=require('../player-weapons.js');
const signatures=new Set();
for(const id of Object.keys(models))for(const angle of [0,Math.PI/2,Math.PI,-Math.PI/2]){
 const calls=[],ctx={save(){calls.push(['save']);},restore(){calls.push(['restore']);},translate(...v){calls.push(['translate',...v]);},rotate(v){calls.push(['rotate',v]);},scale(...v){calls.push(['scale',...v]);},fillRect(...v){calls.push(['rect',this.fillStyle,...v]);}};
 const pose={id,x:100,y:200,angle,recoil:.7,reload:.5,hurt:true},before=JSON.stringify(pose);
 assert.equal(drawPlayerWeapon(ctx,pose),true);assert.equal(JSON.stringify(pose),before);
 assert.equal(calls[0][0],'save');assert.equal(calls.at(-1)[0],'restore');assert.equal(ctx.globalAlpha,.6);
 assert.equal(calls.some(v=>v[0]==='scale'),Math.cos(angle)<0,'left aim mirrors grip without flipping body');
 assert.ok(calls.filter(v=>v[0]==='rect').every(v=>v.slice(2).every(Number.isFinite)));
 if(angle===0)signatures.add(JSON.stringify(calls));
}
assert.equal(signatures.size,12,'each weapon has its own visible geometry/palette');
assert.equal(drawPlayerWeapon({}, {id:'missing',x:0,y:0,angle:0}),false);
assert.equal(drawPlayerWeapon({}, {id:'laser',x:NaN,y:0,angle:0}),false);
const prefix=fs.readFileSync('tests/combat.cjs','utf8').split('assert.match(')[0],{context}=new Function('require',prefix+';return {context};')(require),run=s=>vm.runInContext(s,context);
run('reset();spawn=1e9');assert.equal(run('player.weaponKick'),0);
run('emitProjectiles(0)');assert.equal(run('player.weaponKick'),1);
run('tick(.02)');assert.ok(run('player.weaponKick<1&&player.weaponKick>0'));
run('pause();globalThis.savedKick=player.weaponKick;tick(.2)');assert.equal(run('player.weaponKick'),run('savedKick'),'pause freezes visual recoil');
run('reset();player.reloadTime=1;emitProjectiles(0)');assert.equal(run('player.weaponKick'),0,'cancelled shot has no recoil');
run('reset()');assert.equal(run('player.weaponKick'),0);
console.log('Player props:12 unique weapons,4aim directions, hands, reload/recoil, pause/reset and no pose mutation passed.');
