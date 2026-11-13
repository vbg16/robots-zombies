'use strict';
// Catalog/migration acceptance; does not execute combat or prove balance.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const source=fs.readFileSync('balance.js','utf8'),storage=new Map();
const window={localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,String(value))}};
vm.runInNewContext(source,{window});
const api=window.ScrewBalance,clone=value=>JSON.parse(JSON.stringify(value)),hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const ids=['reserveBank','shieldDrive','cleanCircuit','pulseRecovery'],checks=[];
function check(name,fn){try{fn();checks.push({name,status:'passed'});}catch(error){checks.push({name,status:'failed',error:error.stack});}}
const original82=clone(api.catalog).filter(item=>!ids.includes(item.id));
check('catalog revision7 and all82 previous canonical records exactly preserved',()=>{
 assert.equal(api.catalogRevision,7);assert.equal(api.catalog.length,86);assert.equal(api.catalog.filter(item=>item.type==='Normal').length,56);
 assert.equal(new Set(api.catalog.map(item=>item.id)).size,86);
 assert.equal(hash(JSON.stringify(original82)),'f94a0e8e0803bfd67b5672fc86ec7652243905a98a6c544b229c05ad0d41f380','82-record hash captured before modifying the BUILD62 catalog');
 assert.equal(api.validate(api.catalog).ok,true);assert.ok(Object.isFrozen(api.catalog));
 const expected={reserveBank:[],shieldDrive:['reserveBank','shield'],cleanCircuit:['reserveBank'],pulseRecovery:['reserveBank','sensor']};
 for(const id of ids){const item=api.catalog.find(item=>item.id===id);assert.deepEqual(clone(item.prerequisites),expected[id]);assert.equal(item.tree,'Reserva e manutenção');assert.equal(item.group,'Defensivo');assert.equal(item.type,'Normal');assert.equal(item.unlockLevel,1);assert.ok(item.condition.length>0);}
 assert.deepEqual(clone(api.catalog.find(item=>item.id==='reserveBank').effects),[{id:'reserveBank-0',attribute:'Multiplicador de recarga',operator:'×',value:1.1,unit:''}]);
 for(const id of ids.slice(1))assert.equal(api.catalog.find(item=>item.id===id).effects.length,0);
});
const fixtures={1:'v39',2:'v42',3:'v43',4:'v48',5:'v51'};
for(let revision=1;revision<=6;revision++)check('revision'+revision+': edits, four empty-condition ID collisions, occupied names, references and persisted idempotence',()=>{
 const draft=revision===6?clone(original82):JSON.parse(fs.readFileSync('tests/fixtures/balance-catalog-'+fixtures[revision]+'.json','utf8'));
 const edited=draft.find(item=>item.id==='damage');edited.name='Edição antiga r'+revision;edited.effects[0].value=2.375;edited.updatedAt='2026-11-13T00:00:00Z';
 const template=clone(edited);
 for(const id of ids)draft.push({...clone(template),id,name:'Personalizado antigo '+id,condition:'',prerequisites:[],synergies:[]});
 draft.push({...clone(template),id:'custom-reserveBank',name:'Nome já ocupado',condition:'',prerequisites:[]});
 draft.push({...clone(template),id:'follows-reserve-tree',name:'Dependente antigo',condition:'',prerequisites:ids.slice(),synergies:ids.slice()});
 const before=JSON.stringify(draft),migrated=api.migrate(draft,revision);
 assert.equal(JSON.stringify(draft),before,'draft is never mutated');assert.equal(migrated.length,92);assert.equal(api.validate(migrated).ok,true,JSON.stringify(api.validate(migrated).errors));
 assert.equal(migrated.find(item=>item.id==='damage').name,'Edição antiga r'+revision);assert.equal(migrated.find(item=>item.id==='damage').effects[0].value,2.375);
 const renamed=['custom-reserveBank-2','custom-shieldDrive','custom-cleanCircuit','custom-pulseRecovery'];
 for(let i=0;i<ids.length;i++){
  assert.equal(migrated.find(item=>item.id===renamed[i]).name,'Personalizado antigo '+ids[i]);
  assert.equal(JSON.stringify(migrated.find(item=>item.id===ids[i])),JSON.stringify(api.catalog.find(item=>item.id===ids[i])));
 }
 const dependent=migrated.find(item=>item.id==='follows-reserve-tree');assert.deepEqual(clone(dependent.prerequisites),renamed);assert.deepEqual(clone(dependent.synergies),renamed);
 assert.equal(migrated.find(item=>item.id==='custom-reserveBank').name,'Nome já ocupado');
 assert.equal(JSON.stringify(api.migrate(migrated,7)),JSON.stringify(migrated));
 storage.set(api.storageKey,JSON.stringify({version:1,catalogRevision:revision,skills:draft}));assert.equal(JSON.stringify(api.load()),JSON.stringify(migrated));
 assert.equal(api.save(migrated).ok,true);assert.equal(JSON.parse(storage.get(api.storageKey)).catalogRevision,7);assert.equal(JSON.stringify(api.load()),JSON.stringify(migrated));
});
check('revision6 current defaults and designer edits preserve82 records while adding only four',()=>{
 const current=clone(original82);current.find(item=>item.id==='sensorRange').effects[0].value=1.875;
 const before=JSON.stringify(current),migrated=api.migrate(current,6);assert.equal(migrated.length,86);
 assert.equal(JSON.stringify(migrated.filter(item=>!ids.includes(item.id))),before);assert.equal(api.validate(migrated).ok,true);
});
check('unknown revisions reject metadata and storage remains untouched on fallback',()=>{
 for(const revision of [0,8,1.5,'6',{},null])assert.throws(()=>api.migrate(original82,revision),/Revisão de catálogo/);
 const future=JSON.stringify({version:1,catalogRevision:8,skills:api.catalog});storage.set(api.storageKey,future);
 assert.equal(api.load().length,86);assert.equal(storage.get(api.storageKey),future);
});
check('conditional formulas are fixed; static reserve cost stays editable and snapshots apply next run',()=>{
 const draft=clone(api.catalog);
 for(const id of ids){const changed=clone(draft);changed.find(item=>item.id===id).condition+=' edited';assert.equal(api.validate(changed).ok,false);}
 assert.equal(api.save(draft).ok,true);api.snapshot();
 const edited=clone(draft);edited.find(item=>item.id==='reserveBank').effects[0].value=1.35;assert.equal(api.save(edited).ok,true);
 const player=()=>({...Object.fromEntries(['damage','rate','speed','armor','magnet','magazineMult','reloadMult','projectileMult','projectileSpeed','projectileSize','projectileLife','spreadMult','droneDamageMult','droneRateMult','droneRange','corrosionDamageMult','corrosionDelayMult','sensorDamageMult','sensorIntervalMult','sensorRange','rotorDamageMult','rotorPeriodMult','rotorRange'].map(key=>[key,1])),hp:50,maxHp:100,ammo:7});
 let p=player();assert.equal(api.apply('reserveBank',p,()=>{p.reserveBank={value:20,max:40};p.reloadMult*=1.1;}),true);assert.equal(p.reloadMult,1.1,'saved draft does not alter the active snapshot');assert.equal(p.reserveBank.value,20);assert.equal(p.hp,50);assert.equal(p.ammo,7);
 api.snapshot();p=player();api.apply('reserveBank',p,()=>{p.reserveBank={value:20,max:40};p.reloadMult*=1.1;});assert.equal(p.reloadMult,1.35);assert.equal(p.reserveBank.value,20);assert.equal(p.hp,50);assert.equal(p.ammo,7);assert.ok(Object.values(p).filter(value=>typeof value==='number').every(Number.isFinite));
 const auxiliary={reloadMult:1};api.applyWeapon('reserveBank',auxiliary);assert.equal(auxiliary.reloadMult,1.35);assert.equal(auxiliary.reserveBank,undefined,'conditional callback remains shared, not copied to each gun');
});
const result={kind:'catalog-migration-fixtures',at:new Date().toISOString(),node:process.version,catalogRevision:api.catalogRevision,catalogCount:api.catalog.length,
 sourceHashes:Object.fromEntries(['balance.js','tests/maintenance-migration.cjs'].map(file=>[file,hash(fs.readFileSync(file))])),checks,passed:checks.filter(item=>item.status==='passed').length,failed:checks.filter(item=>item.status==='failed').length,
 limitations:['Does not load gameplay or validate HUD, damage ordering, acquisition, audio or natural builds.','The existing revision/count assertions in other tests must be updated by their owner; this file does not weaken them.']};
fs.mkdirSync('outputs/maintenance-migration63',{recursive:true});fs.writeFileSync('outputs/maintenance-migration63/result.json',JSON.stringify(result,null,2));
for(const item of checks){console.log(item.status.toUpperCase()+': '+item.name);if(item.error)console.error(item.error);}if(result.failed)process.exitCode=1;
