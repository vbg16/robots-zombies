/* Controlled fixtures, not naturally earned builds or survival evidence. */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const sources=Object.fromEntries(['game.js','balance.js'].map(file=>[file,fs.readFileSync(file,'utf8')]));
let prefix=fs.readFileSync('tests/combat.cjs','utf8').split('assert.match(')[0];
prefix=prefix.replace("vm.runInContext(fs.readFileSync('game.js','utf8'),context);",'window.localStorage=localStorage;vm.runInContext('+JSON.stringify(sources['balance.js'])+',context);vm.runInContext('+JSON.stringify(sources['game.js'])+',context);');
function harness(){const h=new Function('require',prefix+';return {context};')(require);return {run:s=>vm.runInContext(s,h.context)};}
const initial=harness(),weapons=JSON.parse(initial.run('JSON.stringify(Object.keys(WEAPONS))'));
const samples=[];
for(const weapon of weapons)for(const stage of ['base','root','family','elemental'])for(const fixture of ['single','group','boss']){
 const h=harness();h.run(`profile.unlockedWeapons=Object.fromEntries(Object.keys(WEAPONS).map(id=>[id,true]));openGarage();selectWeapon('${weapon}');reset();spawn=1e9;bossIndex=1e6;drawMinimap=()=>{};updateHUD=()=>{};
 if('${stage}'!=='base')SKILLS.find(s=>s.id==='sensor').apply();
 if(['family','elemental'].includes('${stage}'))for(const id of ['sensorRange','sensorRelay','sensorLock'])SKILLS.find(s=>s.id===id).apply();
 if('${stage}'==='elemental')for(const id of ['burn','freeze'])SKILLS.find(s=>s.id===id).apply();
 globalThis.channels={};globalThis.baseDamageEnemy=damageEnemy;damageEnemy=(z,amount,source='direct')=>{const before=z.hp;baseDamageEnemy(z,amount,source);channels[source]=(channels[source]||0)+Math.max(0,before-z.hp);};

 if('${fixture}'==='boss'){boss={...BOSS_SCHEDULE[0],x:player.x+90,y:player.y,hp:650,maxHp:650,phase:'approach',timer:1000};tickBoss=()=>{};}
 else enemies=Array.from({length:'${fixture}'==='group'?5:1},(_,i)=>({x:player.x+90+i*32,y:player.y+(i===0?0:i%2?20:-20),r:18,hp:1000000,maxHp:1000000,speed:0,enemyType:'chaser'}));
 globalThis.elapsed=0;globalThis.ttk=null;
 for(let step=0;step<1200;step++){
  aim={x:player.x+90-camera.x,y:player.y-camera.y,active:true};firing=true;tick(.05);elapsed=clock;
  if('${fixture}'==='boss'&&boss.hp===0){ttk=clock;break;}
 }
 globalThis.sample={weapon:'${weapon}',stage:'${stage}',fixture:'${fixture}',elapsed,ttk,damage:channels,total:Object.values(channels).reduce((a,b)=>a+b,0),hp:player.hp};`);
 const result=JSON.parse(h.run('JSON.stringify(sample)'));assert.ok(Number.isFinite(result.total)&&result.total>0);assert.equal(result.hp,100,'stationary fixtures do not damage the player');
 samples.push(result);
}
const output={at:new Date().toISOString(),version:JSON.parse(fs.readFileSync('version.json','utf8')),kind:'synthetic-stationary-fixtures',dt:.05,sourceHashes:Object.fromEntries(Object.entries(sources).map(([file,source])=>[file,crypto.createHash('sha256').update(source).digest('hex')])),note:'Packages installed directly. No survival/offer feasibility claim. Targets have no autonomous pursuit, but weapon knockback remains and may move them outside the sensor radius.',samples};
fs.writeFileSync(process.env.SENSOR_REPORT||'docs/build44-sensor-bench.json',JSON.stringify(output,null,2)+'\n');
console.log('144 controlled sensor scenarios passed: twelve weapons, four packages, single/group/production brute.');
