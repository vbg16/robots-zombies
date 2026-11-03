'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('game.js','utf8');
const prefix=fs.readFileSync('tests/combat.cjs','utf8').split('assert.match(')[0];
function harness(reference){
 let code=reference?source.replace(/function radiusTargets\([\s\S]*?\nfunction bulletCandidates/,`function radiusTargets(x,y,radius,body=false,exclude=null){return targets().filter(z=>z!==exclude&&z.hp>0&&Math.hypot(z.x-x,z.y-y)<=radius+(body?z.r:0));}\nfunction bulletCandidates`):source;
 if(reference){const before=code;code=code.replace(" const near=nearestTargets(z.x,z.y,135*(player.skills.conductivity?3:1),count,z);"," const near=targets().filter(t=>t!==z&&t.hp>0&&Math.hypot(t.x-z.x,t.y-z.y)<=135*(player.skills.conductivity?3:1)).sort((a,b)=>Math.hypot(a.x-z.x,a.y-z.y)-Math.hypot(b.x-z.x,b.y-z.y)).slice(0,count);");assert.notEqual(code,before,"Reference must actually replace the indexed query with full sorting");}
 assert.ok(!reference||!code.includes('const nearest=[]'),'Reference uses the original full sort');
 assert.ok(!reference||code!==source);
 const setup=prefix.replace("vm.runInContext(fs.readFileSync('game.js','utf8'),context);","vm.runInContext(source,context);");
 const {context}=new Function('require','source',setup+';return {context};')(require,code);
 const run=s=>vm.runInContext(s,context);
 return {run};
}
const indexed=harness(false),reference=harness(true);
for(let scenario=0;scenario<18;scenario++){
 const fixture=`globalThis.querySeed=${2700+scenario};Math.random=()=>{querySeed=(Math.imul(querySeed,1664525)+1013904223)>>>0;return querySeed/4294967296;};profile.unlockedWeapons=Object.fromEntries(Object.keys(WEAPONS).map(id=>[id,true]));openGarage();selectWeapon('${['laser','grenade','tesla'][scenario%3]}');reset();spawn=1e9;bossIndex=1e6;player.inv=1e9;for(const id of ['shock','pierce','conductivity','blast','blastRadius','knock','freeze','finisher'])SKILLS.find(s=>s.id===id).apply();enemies=Array.from({length:160},(_,i)=>{const z=createEnemy(player.x+random(-550,550),player.y+random(-550,550));z.hp=z.maxHp=i%7?2000:20;return z;});spawnBoss(true);boss.hp=boss.maxHp=${scenario%2?150:50000};for(let i=0;i<8;i++)enemies.push({...createEnemy(player.x+128,player.y-128),minionOwner:boss.id});buildCollisionGrid();`;
 const snapshot=`JSON.stringify({player,enemies,boss,bullets,effects,sparks,feedback,kills,xp,clock,hostile,hazards,nextRandom:Array.from({length:10},()=>Math.random())},(k,v)=>v instanceof Set?[...v]:v)`;
 // Execute and snapshot consecutively: fixtures isolate their RNG state.
 indexed.run(fixture);indexed.run(`for(let i=0;i<20;i++){const z=enemies[i];if(z.hp>0){impact(z,{damage:45,vx:i%2?200:-200,vy:120,weapon:runWeapon,radius:6,crit:i%3===0});if(i%4===0){z.x-=400;indexTarget(z);}}}collisionGrid=null;aim={x:player.x+200-camera.x,y:player.y-camera.y,active:true};firing=true;for(let i=0;i<90;i++)tick(1/60);`);const a=indexed.run(snapshot);
 reference.run(fixture);reference.run(`for(let i=0;i<20;i++){const z=enemies[i];if(z.hp>0){impact(z,{damage:45,vx:i%2?200:-200,vy:120,weapon:runWeapon,radius:6,crit:i%3===0});if(i%4===0){z.x-=400;indexTarget(z);}}}collisionGrid=null;aim={x:player.x+200-camera.x,y:player.y-camera.y,active:true};firing=true;for(let i=0;i<90;i++)tick(1/60);`);const b=reference.run(snapshot);
 assert.equal(a,b,'full state and RNG match full scans, scenario '+scenario);
}
console.log('Spatial runtime:18 seeded scenarios match full scans exactly, including deaths, boss minions, knockback, secondary explosions, effects and RNG.');
