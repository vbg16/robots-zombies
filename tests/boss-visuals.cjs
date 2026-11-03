'use strict';
const assert=require('node:assert/strict'),api=require('../boss-visuals.js');
function draw(b,player={x:100,y:100},clock=3){const calls=[],ctx={save(){calls.push(['save']);},restore(){calls.push(['restore']);},translate(...a){calls.push(['translate',...a]);},fillRect(...a){calls.push(['rect',this.fillStyle,...a]);},beginPath(){},ellipse(...a){calls.push(['ellipse',...a]);},arc(...a){calls.push(['arc',...a]);},fill(){},stroke(){},strokeRect(...a){calls.push(['strokeRect',...a]);},moveTo(...a){calls.push(['move',...a]);},lineTo(...a){calls.push(['line',...a]);}};const before=JSON.stringify(b);assert.equal(api.draw(ctx,b,player,clock),true);assert.equal(JSON.stringify(b),before);assert.equal(calls[0][0],'save');assert.equal(calls.at(-1)[0],'restore');return calls;}
for(const id of ['scrapper','coil']){
 const b={id,x:0,y:0,hp:100,r:30,phase:'approach',timer:2,visualWalking:true,visualPhase:0};
 const idle=draw(b);b.visualPhase=2;assert.notDeepEqual(draw(b),idle,'opposed legs/arms change with actual locomotion');
 b.phase=id==='scrapper'?'tellMortar':'tellPulse';b.timer=.1;assert.notDeepEqual(draw(b),idle,'visible attack preparation');
 api.advance(b,b.phase,.05);assert.equal(b.visualAttack,0,'holding tell never pretends a shot');const previous=b.phase;b.phase='approach';api.advance(b,previous,.05);assert.equal(b.visualAttack,.28,'recoil begins on real tell transition');
 api.advance(b,'approach',.1);assert.ok(Math.abs(b.visualAttack-.18)<1e-9);assert.equal(b.hp,100);assert.equal(b.r,30);
 assert.deepEqual(draw(b),draw(b),'same paused state/time renders identically');
 b.hit=.1;b.slowTime=1;b.burnTime=1;b.stunTime=1;draw(b,{x:-100,y:0});draw(b,{x:0,y:-100});
}
assert.equal(api.draw({}, {id:'brute'}, {},0),false,'Brutamontes keeps the original zombie atlas renderer');
console.log('Boss visuals:movement, tells, actual attack recoil, pause determinism, status/facing, no actor mutation and legacy selection passed.');
