'use strict';
// Integration contract exercised with a fake input adapter. This does not verify browser capture or hardware.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const prefix=fs.readFileSync('tests/combat.cjs','utf8').split('assert.match(')[0];
const setup=prefix.replace("vm.runInContext(fs.readFileSync('game.js','utf8'),context);",`window.matchMedia=()=>({matches:true});
window.ScrewTouchControls={mount(_container,callbacks){window.touchCallbacks=callbacks;return {
 setEnabled(value){window.controlEnabled=value;if(!value){callbacks.onMove({x:0,y:0});callbacks.onAim({x:0,y:0,active:false});}},
 setDashAvailable(){},reset(){callbacks.onMove({x:0,y:0});callbacks.onAim({x:0,y:0,active:false});}
}}};vm.runInContext(fs.readFileSync('game.js','utf8'),context);`);
const {context,listeners,document}=new Function('require',setup+';return {context,listeners,document};')(require);
const run=code=>vm.runInContext(code,context),event=(key,props={})=>listeners.get(key)({pointerType:'mouse',button:0,pointerId:99,clientX:700,clientY:200,...props});
const reset=()=>run('reset();spawn=1e9;window.touchCallbacks.onMove({x:1,y:0});window.touchCallbacks.onAim({x:1,y:0,active:true})');
const cleared=()=>{assert.equal(run('firing'),false);assert.equal(run('firingOwner'),null);assert.equal(run('touchMove.x'),0);assert.equal(run('touchMove.y'),0);assert.equal(run('touchAim.active'),false);assert.equal(run('touchAim.hasDirection'),false);assert.equal(run('weaponSlots.every(s=>s.bursts.length===0)'),true);};
// Unpressed mouse movement cannot silently steal a held thumb's direction/fire ownership.
reset();const beforeAim=run('JSON.stringify(aim)');event('canvas:pointermove');assert.equal(run('touchAim.active'),true,'passive mouse movement must preserve a held aim contact');assert.equal(run('JSON.stringify(aim)'),beforeAim);event('window:pointerup');assert.equal(run('firing'),true,'unrelated mouse release cannot stop held thumb');
// An explicit mouse press takes over. Releasing the old thumb cannot stop the held mouse.
event('canvas:pointerdown');assert.equal(run('firingOwner'),'mouse');run('window.touchCallbacks.onAim({x:0,y:0,active:false})');assert.equal(run('firing'),true);event('window:pointerup');assert.equal(run('firing'),false);
// Reload is an independent action: moving and aiming fingers continue uninterrupted.
reset();run('emitProjectiles(0);window.touchCallbacks.onReload()');assert.ok(run('player.reloadTime')>0);assert.equal(run('touchMove.x'),1);assert.equal(run('touchAim.active'),true);assert.equal(run('firingOwner'),'touch');
// Blur/visibility must clear callbacks even when disabling the adapter emits zeros synchronously.
reset();event('window:blur');assert.equal(run('state'),'paused');cleared();run('pause();tick(.01)');cleared();
reset();document.hidden=true;event('document:visibilitychange');assert.equal(run('state'),'paused');cleared();document.hidden=false;run('pause();tick(.01)');cleared();
// Pointer release from movement is handled by its adapter callback, without touching aim ownership.
reset();run('window.touchCallbacks.onMove({x:0,y:0})');event('window:pointerup',{pointerType:'touch'});assert.equal(run('firing'),true);run('window.touchCallbacks.onAim({x:0,y:0,active:false})');assert.equal(run('firing'),false);assert.equal(run('firingOwner'),null);
// Capture loss is scoped to the input owner and pointer ID, including delayed mouse events.
for(const type of ['canvas:pointercancel','canvas:lostpointercapture']){
 reset();event(type);assert.equal(run('firing'),true,type+' from mouse must preserve touch fire');assert.equal(run('firingOwner'),'touch');assert.equal(run('touchAim.active'),true);
}
for(const type of ['window:pointerup','canvas:pointercancel','canvas:lostpointercapture']){
 reset();event('canvas:pointerdown');assert.equal(run('mouseFirePointer'),99);event(type,{pointerId:100});assert.equal(run('firing'),true,type+' from another ID must preserve mouse fire');event(type,{pointerId:99});assert.equal(run('firing'),false,type+' from owner clears mouse fire');assert.equal(run('mouseFirePointer'),null);assert.equal(run('firingOwner'),null);
}
// Coincident damage source uses the opposite effective movement, with keyboard priority.
reset();const touchHitX=run('player.x'),touchHitY=run('player.y');run('player.inv=0;hurtPlayer(1,player.x,player.y)');assert.equal(run('player.x'),touchHitX-run('PLAYER_KNOCKBACK'));assert.equal(run('player.y'),touchHitY);
reset();run("keys.add('w')");const keyHitX=run('player.x'),keyHitY=run('player.y');run('player.inv=0;hurtPlayer(1,player.x,player.y)');assert.equal(run('player.x'),keyHitX,'keyboard replaces touch axis rather than combining');assert.equal(run('player.y'),keyHitY+run('PLAYER_KNOCKBACK'));
reset();run('window.touchCallbacks.onMove({x:1,y:1})');const diagHitX=run('player.x'),diagHitY=run('player.y');run('player.inv=0;hurtPlayer(1,player.x,player.y)');assert.ok(run('player.x')<diagHitX&&run('player.y')<diagHitY);assert.ok(Math.abs(Math.hypot(run('player.x')-diagHitX,run('player.y')-diagHitY)-run('PLAYER_KNOCKBACK'))<1e-8,'touch fallback knockback remains normalized');
console.log('Hybrid bridge contracts passed: passive mouse, explicit takeover, unrelated release, reload, blur/visibility and adapter callback cancellation, scoped capture loss and effective-movement knockback. Adapter is faked; no browser-capture claim.');
