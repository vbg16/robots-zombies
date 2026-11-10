/* Reproduces the pre-fix shield leak using SHIELD_GAME_SOURCE, then guards the
 * captured-before-impact shield decision. No long simulation or RNG exclusion. */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const sourcePath=process.env.SHIELD_GAME_SOURCE||'game.js',source=fs.readFileSync(sourcePath,'utf8');
const reportPath=process.env.SHIELD_REPORT||'outputs/especificacao-final/shield-fix/report.json';
const prefix=fs.readFileSync('tests/combat.cjs','utf8').split('assert.match(')[0].replace('Math,Set,localStorage','Math:Object.create(Math),Set,localStorage').replace("vm.runInContext(fs.readFileSync('game.js','utf8'),context);","vm.runInContext(gameSource,context);");
const {context}=new Function('require','gameSource',prefix+';return {context};')(require,source),run=s=>vm.runInContext(s,context),read=s=>JSON.parse(run('JSON.stringify('+s+')'));
const report={at:new Date().toISOString(),source:sourcePath,sha256:crypto.createHash('sha256').update(source).digest('hex'),scope:'Isolated engine fixtures: intact/breaking shields block bullet states; permitted secondary branches remain active.',cases:[],errors:[]};
function save(){fs.mkdirSync(path.dirname(reportPath),{recursive:true});fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');}
function setup(weapon='machine',skills=true){context.qaShieldWeapon=weapon;context.qaShieldSkills=skills;run(`profile=emptyProfile();profile.unlockedWeapons=Object.fromEntries(Object.keys(WEAPONS).map(id=>[id,true]));selectedRobot='prot';selectedWeapon=qaShieldWeapon;selectedAuxWeapons=[];reset();spawn=1e9;bossIndex=1e6;player.inv=1e9;globalThis.qaShieldSeed=20261109;Math.random=()=>{qaShieldSeed=(Math.imul(qaShieldSeed,1664525)+1013904223)>>>0;return qaShieldSeed/4294967296};if(qaShieldSkills)for(const id of ['burn','freeze','corrosion','knock'])player.skills[id]=1;globalThis.qaGuard=createEnemy(player.x+100,player.y,'shieldPolice');globalThis.qaOther=createEnemy(player.x+240,player.y,'shieldPolice');globalThis.qaRifle=createEnemy(player.x+300,player.y,'expolice');globalThis.qaBody=qaGuard.hp;globalThis.qaX=qaGuard.x;globalThis.qaY=qaGuard.y;enemies=[qaGuard,qaOther,qaRifle];globalThis.qaBullet={weapon:runWeapon,damage:5,vx:1,vy:0,crit:false,hit:new Set()};`);}
function observation(name){const value=read(`({name:${JSON.stringify(name)},body:qaGuard.hp,bodyBefore:qaBody,shield:qaGuard.shieldHp,burn:qaGuard.burnTime||0,cold:qaGuard.slowTime||0,corrosion:!!qaGuard.corrosion,knockDistance:Math.hypot(qaGuard.x-qaX,qaGuard.y-qaY),phase:qaGuard.policePhase,otherShield:qaOther.shieldHp,otherPhase:qaOther.policePhase,riflePhase:qaRifle.policePhase||null})`);report.cases.push(value);save();return value;}
function blocked(o,shield){assert.equal(o.body,o.bodyBefore,o.name+' body remains intact');assert.equal(o.shield,shield,o.name+' shield amount');assert.equal(o.burn,0,o.name+' blocks burn');assert.equal(o.cold,0,o.name+' blocks cold');assert.equal(o.corrosion,false,o.name+' blocks corrosion');assert.equal(o.knockDistance,0,o.name+' blocks knock');assert.equal(o.otherShield,100,o.name+' does not damage unrelated shield');assert.equal(o.otherPhase,'shielded',o.name+' does not charge unrelated police');assert.equal(o.riflePhase,null,o.name+' rifle never adopts shield-break charge');}
try{
 setup();run('impact(qaGuard,qaBullet)');const first=observation('intact shield / acquired states');console.log('Shield reproduction:',JSON.stringify(first));blocked(first,95);assert.equal(first.phase,'shielded');
 for(const amount of [100,150]){
  setup();run(`qaBullet.damage=${amount};impact(qaGuard,qaBullet)`);const o=observation('break '+amount+' / acquired states');blocked(o,0);assert.equal(o.phase,'aim','only broken police prepares charge');assert.equal(run('qaGuard.chargeTimer'),.7);assert.equal(run('qaGuard.chargeRemaining'),100);assert.equal(run('qaGuard.chargeDx'),-1);
  run('qaBullet.damage=1;impact(qaGuard,qaBullet)');const after=observation('next unshielded hit after '+amount);assert.equal(after.body,after.bodyBefore-1);assert.ok(after.burn>0&&after.cold>0&&after.corrosion&&after.knockDistance>0,'next real body hit applies owned states and knock');
 }
 for(const weapon of ['flame','cryo','harpoon']){
  setup(weapon,false);run('impact(qaGuard,qaBullet)');blocked(observation('intact / intrinsic '+weapon),95);
  run('qaBullet.damage=95;impact(qaGuard,qaBullet)');blocked(observation('break / intrinsic '+weapon),0);
  run('qaBullet.damage=1;impact(qaGuard,qaBullet)');const after=observation('body / intrinsic '+weapon);assert.equal(after.body,after.bodyBefore-1);if(weapon==='flame')assert.ok(after.burn>0);if(weapon==='cryo')assert.ok(after.cold>0);if(weapon==='harpoon')assert.ok(after.knockDistance>0);
 }
 // The charged projectile really moves through the field before contacting the
 // shield: this is not a direct call to the collimation helper.
 for(const collimator of [false,true]){
  setup();run(`state='relic';offeredRelics=[BOSS_RELICS.find(r=>r.id==='ruptureChamber')];chooseRelic('ruptureChamber',offerVersion);player.ammo=1;primaryWeaponState().ruptureCharge=19;emitProjectiles(0);globalThis.qaCharged=bullets[0];qaGuard.x=player.x+100;qaX=qaGuard.x;qaGuard.r=5;qaOther.speed=qaRifle.speed=qaGuard.speed=0;${collimator?"player.collimator={cooldown:999,field:{x:player.x+70,y:player.y,r:10,life:4,angle:0}};":''}tick(.2);`);
  const o=observation('charged actual contact / collimator '+collimator);blocked(o,0);assert.equal(o.phase,'aim');assert.equal(run('qaCharged.ruptureFactor'),6);assert.equal(run('!!qaCharged.collimated'),collimator);assert.equal(run('primaryWeaponState().ruptureCharge'),0,'charge remains consumed exactly once');
 }
 // This fix isolates status application; it must not silently suppress the
 // existing electrical/explosion branches permitted after a shielded impact.
 setup();run(`player.skills.shock=1;player.skills.blast=1;qaOther.enemyType='chaser';delete qaOther.shieldHp;qaOther.hp=qaOther.maxHp=1000;qaOther.x=qaGuard.x+20;qaRifle.x=player.x+900;globalThis.qaSources=[];globalThis.qaDamageOriginal=damageEnemy;damageEnemy=function(z,n,source,...rest){qaSources.push(source);return qaDamageOriginal(z,n,source,...rest)};impact(qaGuard,qaBullet);damageEnemy=qaDamageOriginal;`);
 const secondary=observation('secondary branches preserved');assert.equal(secondary.body,secondary.bodyBefore);assert.equal(secondary.burn,0);assert.equal(secondary.cold,0);assert.equal(secondary.corrosion,false);assert.equal(secondary.knockDistance,0);assert.ok(run(`qaSources.includes('electric')&&qaSources.includes('explosion')&&qaOther.hp<qaOther.maxHp`),'existing secondary effects still execute');
 report.completed=true;save();console.log('Shield status: '+report.cases.length+' fixtures passed; intact/breaking shields block skill/intrinsic states and knock, next body hit applies them, real Culatra/Colimador paths and secondary branches preserved.');
}catch(error){report.errors.push({message:error.message,stack:error.stack});save();throw error;}
