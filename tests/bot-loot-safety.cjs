'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{policySource}=require('../tools/playtest-bot.cjs');
const bootstrap=fs.readFileSync('tests/combat.cjs','utf8').split('assert.match(')[0];
const {context}=new Function('require',bootstrap+';return {context};')(require),run=s=>vm.runInContext(s,context);
run('reset();globalThis.qa={};globalThis.qaChestPolicy="safe";');run(policySource());
function fixture(extra=''){
 run('reset();boss=null;bossChests=[{id:1,x:player.x+200,y:player.y}];enemies=[];gems=[];qaChestPolicy="safe";'+extra+';qaDrive()');
 return run('qaChestTarget?.id??null');
}
assert.equal(fixture(),1,'clear nearby chest may attract the bot');
assert.equal(fixture('enemies=[{x:player.x+100,y:player.y,hp:100,speed:0,r:14}]'),null,'guarded route does not replace XP collection with a chest chase');
assert.equal(fixture('enemies=[{x:player.x+180,y:player.y,hp:100,speed:0,r:14}]'),1,'a distant guard does not require the whole route to be empty before approaching');
assert.equal(fixture('player.hp=player.maxHp*.34'),null,'low health does not chase loot');
assert.equal(fixture('bossChests[0].x=player.x+1201'),null,'distant loot does not suppress nearby XP goals');
assert.equal(fixture('enemies=[{x:player.x+100,y:player.y,hp:0,speed:0,r:14}]'),1,'dead enemies cannot guard loot');
assert.equal(fixture('enemies=[{x:player.x+100,y:player.y,hp:100,speed:0,r:14}];bossChests.push({id:2,x:player.x,y:player.y+250})'),2,'skip guarded nearest chest in favor of a clear alternative');
assert.equal(fixture('qaChestPolicy="legacy";player.hp=1;bossChests[0].x=player.x+2000'),1,'legacy control retains the original routing for comparisons');
console.log('Bot loot safety: clear/guarded routes, low HP, distance, dead guards, alternative chest and explicit legacy control passed.');
