/* Absorbed electrical damage must not install stun, including shield break.
 * SHIELD_GAME_SOURCE reproduces the defect against an archived source. */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict'),path=require('node:path');
const sourceFile=process.env.SHIELD_GAME_SOURCE||'game.js',source=fs.readFileSync(sourceFile,'utf8');
const prefix=fs.readFileSync('tests/combat.cjs','utf8').split('assert.match(')[0].replace('Math,Set,localStorage','Math:Object.create(Math),Set,localStorage').replace("vm.runInContext(fs.readFileSync('game.js','utf8'),context);","vm.runInContext(gameSource,context);");
const {context}=new Function('require','gameSource',prefix+';return {context};')(require,source),run=s=>vm.runInContext(s,context),read=s=>JSON.parse(run('JSON.stringify('+s+')'));
const report={sourceFile,sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),cases:[],completed:false};
const output=process.env.SHIELD_SHOCK_REPORT||'outputs/shield-shock/report.json';
function save(){fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');}
function setup(mode,shield){run(`reset();spawn=1e9;bossIndex=1e6;globalThis.anchor=createEnemy(player.x+80,player.y,'chaser');globalThis.guard=createEnemy(player.x+100,player.y,'shieldPolice');guard.shieldHp=${shield};guard.hp=guard.maxHp=1000;enemies=[anchor,guard];player.skills.shock=1;player.skills.stun=${mode==='stun'||mode==='both'?1:0};player.specialization=${JSON.stringify(mode==='ground'||mode==='both'?'groundPulse':null)};`);}
try{
 for(const mode of ['stun','ground','both']){
  for(const damage of [10,200,250]){
   setup(mode,100);run(`shockAt(anchor,${damage})`);const o=read(`({mode:${JSON.stringify(mode)},damage:${damage},shield:guard.shieldHp,hp:guard.hp,stun:guard.stunTime||0,phase:guard.policePhase})`);report.cases.push(o);save();assert.equal(o.hp,1000,'absorbed electric hit must not touch body');assert.equal(o.shield,Math.max(0,100-damage*.5));assert.equal(o.stun,0,'absorbed electric hit must not stun, including break');assert.equal(o.phase,damage>=200?'aim':'shielded');
   run('shockAt(anchor,2)');if(damage>=200){assert.equal(run('guard.hp'),999);assert.equal(run('guard.stunTime'),mode==='both'?1.35:mode==='stun'?1:.35,'next unshielded hit must stun normally');}
  }
  setup(mode,0);run('shockAt(anchor,2)');assert.equal(run('guard.hp'),999);assert.equal(run('guard.stunTime'),mode==='both'?1.35:mode==='stun'?1:.35);
  report.cases.push({mode,unshielded:true,passed:true});
 }
 setup('both',100);run('guard.stunTime=.2;shockAt(anchor,10)');assert.equal(run('guard.stunTime'),.2,'blocked hit neither extends nor clears prior status');report.cases.push({priorStatusPreserved:true});
 // Charge recovery counts body damage, not absorbed shield damage.
 setup('stun',100);run("player.specialization='chargeRecovery';player.electricHits=5;player.specializationCooldown=0;player.ammo=1;shockAt(anchor,200)");assert.equal(run('player.electricHits'),5);assert.equal(run('player.ammo'),1);run('shockAt(anchor,2)');assert.equal(run('player.electricHits'),0);assert.equal(run('player.ammo'),2);report.cases.push({chargeRecoveryBodyOnly:true});
 report.completed=true;save();console.log('Shield shock: '+report.cases.length+' fixtures passed; skill/protocol stun blocked on intact/breaking shields, body hits and existing states preserved, recovery counts body damage only.');
}catch(e){report.error={message:e.message,stack:e.stack};save();throw e;}
