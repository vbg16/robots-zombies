'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('balance.js','utf8'),newWindow={};vm.runInNewContext(source,{window:newWindow});
const previous=JSON.parse(fs.readFileSync('tests/fixtures/balance-catalog-v51.json','utf8')),api=newWindow.ScrewBalance,ids=['damage','rate','pierce','killAmmo'];
assert.equal(api.catalogRevision,7);
const migrated=api.migrate(previous,5);assert.equal(api.validate(migrated).ok,true);
for(const id of ids)assert.equal(JSON.stringify(migrated.find(s=>s.id===id)),JSON.stringify(api.catalog.find(s=>s.id===id)),id+' untouched defaults update');
assert.equal(JSON.stringify(api.migrate(migrated,7)),JSON.stringify(migrated),'revision 7 is idempotent');
for(const id of ids)for(const edit of [s=>s.name+=' personalizado',s=>s.effects.push({id:id+'-custom',attribute:'Dano direto',operator:'+',value:7,unit:''}),s=>s.enabled=false,s=>s.updatedAt='2026-11-06T00:00:00Z']){
 const draft=JSON.parse(JSON.stringify(previous)),item=draft.find(s=>s.id===id);edit(item);const before=JSON.stringify(item),after=api.migrate(draft,5).find(s=>s.id===id);assert.equal(JSON.stringify(after),before,id+' designer edit preserved');if(item.enabled!==false)assert.equal(api.validate(api.migrate(draft,5)).ok,true);
}
const prefix=fs.readFileSync('tests/combat.cjs','utf8').split('assert.match(')[0];
let cases=0;
for(const withPanel of [false,true]){
 const setup=withPanel?prefix.replace("vm.runInContext(fs.readFileSync('game.js','utf8'),context);","window.localStorage=localStorage;vm.runInContext(fs.readFileSync('balance.js','utf8'),context);vm.runInContext(fs.readFileSync('game.js','utf8'),context);"):prefix;
 const {context}=new Function('require',setup+';return {context};')(require),run=s=>vm.runInContext(s,context);
 for(const weapon of run('Object.keys(WEAPONS)')){
  context.auditWeapon=weapon;
  run('selectedWeapon=auditWeapon;reset();weaponSlots.push(createWeaponState(auditWeapon,1));globalThis.before=weaponSlots.map(s=>({damage:s.damage,rate:s.rate,reload:s.reloadMult,ammo:s.ammo,magazine:magazineSize(s)}));for(const id of ["damage","rate","pierce","killAmmo"])SKILLS.find(s=>s.id===id).apply()');
  for(const i of [0,1]){
   assert.ok(Math.abs(run(`weaponSlots[${i}].damage-before[${i}].damage*2`))<1e-9);
   assert.ok(Math.abs(run(`weaponSlots[${i}].rate-before[${i}].rate/3`))<1e-9);
   assert.equal(run(`weaponSlots[${i}].reloadMult`),run(`before[${i}].reload`));
   assert.equal(run(`weaponSlots[${i}].ammo`),run(`before[${i}].ammo`),'installing magazine does not refill');
   assert.equal(run(`magazineSize(weaponSlots[${i}])`),run(`before[${i}].magazine*3`));
  }
  assert.equal(run('player.skills.pierce'),1);assert.equal(run('player.skills.killAmmo'),1);cases++;
 }
}
console.log('Positive weapon gains: '+cases+' weapon/panel configurations, two independent guns each; revision5 untouched/default migration, 16 edited records preserved, revision7 idempotence.');
