'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),animation=require('../enemy-animation.js');
const prefix=fs.readFileSync('tests/combat.cjs','utf8').split('assert.match(')[0];
function harness(enabled){const {context}=new Function('require',prefix+';return {context};')(require);if(enabled)context.ScrewEnemyAnimation=animation;return code=>vm.runInContext(code,context);}
const animated=harness(true),legacy=harness(false);
for(let scenario=0;scenario<6;scenario++){
 const fixture=`globalThis.physicsSeed=${8200+scenario};Math.random=()=>{physicsSeed=(Math.imul(physicsSeed,1664525)+1013904223)>>>0;return physicsSeed/4294967296;};profile.unlockedWeapons=Object.fromEntries(Object.keys(WEAPONS).map(id=>[id,true]));openGarage();selectWeapon('laser');reset();player.inv=1e9;spawn=1e9;bossIndex=${scenario%3};spawnBoss(true);boss.hp=boss.maxHp=100000;bossIndex=10000;enemies.push(...Array.from({length:120},()=>createEnemy(player.x+random(-500,500),player.y+random(-500,500))));enemies.push(createEnemy(player.x-180,player.y,'shieldPolice'),createEnemy(player.x-250,player.y,'expolice'));globalThis.animationShield=enemies.find(z=>z.enemyType==='shieldPolice');damageEnemy(animationShield,100);for(const z of enemies){z.hp=z.maxHp=10000;if(z.x<player.x)z.slowTime=1;else z.stunTime=.7;}aim={x:player.x+200-camera.x,y:player.y-camera.y,active:true};firing=true;keys.add('s');for(let i=0;i<360;i++){if(i===180){pause();tick(5);pause();}tick(1/60);}`;
 const snapshot=`JSON.stringify({player,enemies,boss,clock,kills,bullets,hostile,hazards,sparks,effects,feedback,next:Array.from({length:8},()=>Math.random())},(k,v)=>k.startsWith('visual')?undefined:v instanceof Set?[...v]:v)`;
 animated(fixture);const a=animated(snapshot);legacy(fixture);const b=legacy(snapshot);assert.equal(a,b,'animation must preserve complete combat and RNG, scenario '+scenario);
}
console.log('Enemy animation is cosmetic:6seeded combat worlds match all physical state, effects and RNG with animation disabled, including3bosses, shields, charges, statuses and pause.');
