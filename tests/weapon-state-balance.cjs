'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const prefix=fs.readFileSync('tests/combat.cjs','utf8').split('assert.match(')[0].replace("vm.runInContext(fs.readFileSync('game.js','utf8'),context);","window.localStorage=localStorage;vm.runInContext(fs.readFileSync('balance.js','utf8'),context);vm.runInContext(fs.readFileSync('game.js','utf8'),context);");
const {context}=new Function('require',prefix+';return {context};')(require),run=s=>vm.runInContext(s,context);
const close=(a,b,note)=>assert.ok(Math.abs(a-b)<Math.max(1,Math.abs(b))*1e-10,note+': '+a+' vs '+b);
run('reset()');
const catalog=JSON.parse(run('JSON.stringify(window.ScrewBalance.catalog)'));
// Resolve the public field labels from a probe, rather than depending on private balance.js constants.
const labels={'Dano direto':'damage','Intervalo de disparo':'rate','Multiplicador do carregador':'magazineMult','Multiplicador de recarga':'reloadMult','Multiplicador de projéteis':'projectileMult','Velocidade dos projéteis':'projectileSpeed','Tamanho dos projéteis':'projectileSize','Duração dos projéteis':'projectileLife','Dispersão':'spreadMult'};
let checks=0;
for(const skill of catalog){
 context.skillId=skill.id;
 run("globalThis.probe=createWeaponState('sniper',1);probe.hp=79;probe.maxHp=123;probe.speed=151;probe.armor=7;probe.magnet=91;window.ScrewBalance.applyWeapon(skillId,probe)");
 const expected={damage:88,rate:1.15,magazineMult:1,reloadMult:1,projectileMult:1,projectileSpeed:1,projectileSize:1,projectileLife:1,spreadMult:1};
 for(const effect of skill.effects){const key=labels[effect.attribute];if(!key)continue;const x=expected[key],v=effect.value;expected[key]=effect.operator==='+'?x+v:effect.operator==='−'?x-v:effect.operator==='×'?x*v:effect.operator==='÷'?x/v:v;}
 for(const [key,value] of Object.entries(expected))close(run('probe.'+key),value,skill.id+'/'+key);
 for(const [key,value] of Object.entries({hp:79,maxHp:123,speed:151,armor:7,magnet:91,ammo:3,shotCount:0,reloadTime:0}))assert.equal(run('probe.'+key),value,skill.id+' cannot apply shared/state field '+key);
 checks++;
}
// Real normal-skill callbacks execute once; each gun receives its own numeric modifiers.
run("reset();weaponSlots.push(createWeaponState('sniper',1),createWeaponState('shotgun',2));SKILLS.find(s=>s.id==='damage').apply();SKILLS.find(s=>s.id==='rate').apply();SKILLS.find(s=>s.id==='armor').apply();SKILLS.find(s=>s.id==='titan').apply()");
assert.equal(run('player.hp'),300,'shared life is multiplied once, not once per weapon');assert.equal(run('player.armor'),2);
for(const [i,base] of [22,88,12].entries()){close(run(`weaponSlots[${i}].damage`),base*2/1.5,'per-weapon direct damage');close(run(`shotDamage(weaponSlots[${i}])`),base*2/1.5+Math.min(base*2/1.5*.75,9),'shared HP conversion uses each gun damage cap');}
// Reforges are local even after a global skill is installed later.
run("installWeaponEvolution(weaponSlots[1],WEAPON_EVOLUTIONS.sniper[0]);SKILLS.find(s=>s.id==='sensor').apply()");
close(run('weaponSlots[1].damage'),88*2/1.5*1.2,'secondary refit');close(run('player.damage'),22*2/1.5,'refit cannot change primary damage');assert.equal(run('runWeapon.id'),'machine');assert.equal(run('runWeapon.pierce'),undefined);assert.equal(run('weaponSlots[1].weapon.pierce'),6);assert.equal(run('player.weaponEvolution'),null);
// Edited numeric operations must execute on each base, not copy primary ratios.
run("globalThis.config=window.ScrewBalance.load();const edited=config.find(s=>s.id==='damage');edited.effects=[{...edited.effects[0],attribute:'Dano direto',operator:'+',value:7},{...edited.effects[1],attribute:'Integridade máxima',operator:'+',value:20}];if(!window.ScrewBalance.save(config).ok)throw Error('Edited fixture must save');reset();weaponSlots.push(createWeaponState('sniper',1));SKILLS.find(s=>s.id==='damage').apply()");
assert.equal(run('player.damage'),29);assert.equal(run('weaponSlots[1].damage'),95);assert.equal(run('player.maxHp'),120);assert.equal(run('player.hp'),100);assert.equal(run('weaponSlots[1].maxHp'),undefined);
run("config.find(s=>s.id==='damage').effects=[{...config.find(s=>s.id==='damage').effects[0],operator:'=',value:0}];if(!window.ScrewBalance.save(config).ok)throw Error('Edited fixture must save');reset();weaponSlots.push(createWeaponState('sniper',1));SKILLS.find(s=>s.id==='damage').apply()");
assert.equal(run('player.damage'),.001);assert.equal(run('weaponSlots[1].damage'),.001,'edited clamp agrees for every slot');
console.log(checks+' catalog entries preserve shared/player fields; real modules, local refits, additive edits and clamps apply independently to each weapon.');
