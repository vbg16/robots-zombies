// Focused integration checks; intentionally does not run the full survival simulation.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const canonical = JSON.parse(fs.readFileSync('tests/fixtures/balance-defaults.json', 'utf8'));

function harness() {
  let setup = fs.readFileSync('tests/combat.cjs', 'utf8').split('assert.match(')[0];
  setup = setup.replace("vm.runInContext(fs.readFileSync('game.js','utf8'),context);", "window.localStorage=localStorage;vm.runInContext(fs.readFileSync('balance.js','utf8'),context);vm.runInContext(fs.readFileSync('game.js','utf8'),context);");
  return new Function('require', setup + '\nreturn {storage,localStorage,elements,context,run:code=>vm.runInContext(code,context)};')(require);
}

function near(actual, expected, message) {
  assert.ok(Number.isFinite(actual) && Math.abs(actual - expected) < 1e-7, `${message}: ${actual} != ${expected}`);
}

const h = harness();
const run = h.run;
const catalog = run('JSON.stringify(window.ScrewBalance.catalog)');
const defaults = JSON.parse(catalog);
run('reset()');
assert.equal(run("SKILLS.find(s=>s.id==='damage').benefit"),'Dano ×2.','default cards retain authored benefit text instead of exposing numeric adapter internals');
assert.equal(run("SKILLS.find(s=>s.id==='corrosionFuse').cost"),'Dano das novas cargas ×0,75.','default corrosion cost remains explicit');
assert.equal(defaults.length, 82, 'the panel contains the original54 plus twenty-eight added modules');
assert.equal(new Set(defaults.map(item => item.id)).size, 82, 'catalog ids are unique');
assert.deepEqual(defaults.filter(item=>canonical.modules.some(legacy=>legacy.id===item.id)).map(item=>item.id).sort(), canonical.modules.map(item => item.id).sort(), 'new modules must preserve all54 original IDs');
assert.deepEqual(JSON.parse(run('JSON.stringify([...BASE_NORMAL,...BASE_BLESSINGS,...BASE_EXPERIMENTS,...Object.values(BASE_SPECIALIZATIONS).flat()].map(item=>item.id).sort())')),defaults.map(item=>item.id).sort(),'every module implemented in the game must be represented in the editable catalog');
function validate(skills) { return JSON.parse(run(`JSON.stringify(window.ScrewBalance.validate(${JSON.stringify(skills)}))`)); }
function save(skills) { return JSON.parse(run(`JSON.stringify(window.ScrewBalance.save(${JSON.stringify(skills)}))`)); }
function clone() { return JSON.parse(catalog); }
function rejects(change, message) {
  const skills = clone(); change(skills);
  const result = validate(skills);
  assert.equal(result.ok, false, message);
  assert.ok(result.errors.length, message + ' reports a useful error');
}
assert.equal(validate(defaults).ok, true, 'canonical configuration validates');
rejects(skills=>{skills[0].synergies='not-an-array';},'invalid optional graph metadata cannot crash the panel');
rejects(skills=>{skills[0].updatedAt={};},'invalid date metadata is rejected on import');
rejects(skills=>{skills[0].prerequisites={};},'malformed prerequisite data returns validation errors instead of throwing');
rejects(skills=>{skills[0].id=['damage'];},'ids must be strings rather than coercible objects');
run('reset()');
assert.equal(run('Object.isFrozen(runBalance)&&Object.isFrozen(runBalance[0])&&Object.isFrozen(runBalance[0].effects)&&Object.isFrozen(runBalance[0].effects[0])'),true,'run configuration is deeply frozen');
// Preserve historical direct effects except four explicit positive-gain changes in BUILD52.
const positiveGains={damage:{rate:1},rate:{damage:1},pierce:{damage:1},killAmmo:{reloadMult:1}};
for (const item of canonical.modules.filter(item => item.kind !== 'specialization')) {
  run('reset()');
  const before = run('JSON.stringify(player)');
  const baseline = JSON.parse(before);
  const collection = item.kind === 'skill' ? 'SKILLS' : item.kind === 'blessing' ? 'GAMBARRAS' : 'BOSS_EXPERIMENTS';
  run(`${collection}.find(item=>item.id===${JSON.stringify(item.id)}).apply()`);
  for (const attribute of Object.keys(item.factors)) {
    let expected = baseline[attribute] * (positiveGains[item.id]?.[attribute]??item.factors[attribute]) + item.additions[attribute];
    if (item.minimumHp && ['hp','maxHp'].includes(attribute)) expected = Math.max(item.minimumHp, expected);
    near(run(`player.${attribute}`), expected, `${item.id} default ${attribute}`);
  }
}

console.log('Canonical default direct effects passed (48 modules, all tracked attributes).');

rejects(skills => skills[1].id = skills[0].id, 'duplicate ids are rejected');
rejects(skills => skills.splice(skills.findIndex(item=>item.id==='tailDecoy'), 1), 'canonical leaf modules remain registered; disable them instead of deleting');
const disabledLeaf=clone();disabledLeaf.find(item=>item.id==='tailDecoy').enabled=false;
assert.equal(validate(disabledLeaf).ok,true,'a canonical leaf can be explicitly disabled');
assert.equal(run('window.ScrewBalance.catalog.length'),82,'editing a catalog never mutates the immutable defaults');
rejects(skills => skills.find(item => item.id === 'damage').effects[0].attribute = 'Dano inventado', 'unknown attributes are rejected');
rejects(skills => {const effect=skills.find(item => item.id === 'damage').effects[0];effect.operator='÷';effect.value=0;}, 'division by zero is rejected');
rejects(skills => skills.find(item => item.id === 'damage').effects[0].value = NaN, 'nonfinite effects are rejected');
rejects(skills => skills.find(item => item.id === 'damage').prerequisites = ['missing-id'], 'missing prerequisite ids are rejected');
rejects(skills => {skills.find(item=>item.id==='damage').prerequisites=['bossHunter'];skills.find(item=>item.id==='bossHunter').prerequisites=['damage'];}, 'cycles are rejected');
rejects(skills => skills.find(item=>item.id==='burn').condition = 'Outra condição', 'canonical conditional mechanics cannot be replaced with unsupported effects');
rejects(skills => skills.find(item=>item.id==='damage').type = 'Especialização', 'canonical module kinds are preserved');
rejects(skills => skills.find(item=>item.id==='tailDecoy').prerequisites = ['magnet'], 'special offer conditions cannot silently acquire unsupported prerequisites');

// Invalid imports and denied storage must never erase the unrelated player profile.
run('profile=emptyProfile();profile.bolts=37;profile.bossParts.brute=2;saveProfile()');
const profileKey = run('PROFILE_KEY');
const savedProfile = h.storage.get(profileKey);
h.storage.set('screwvivors.balance.v1', '{bad JSON');
assert.equal(run('window.ScrewBalance.load().length'), 82, 'corrupt custom configuration falls back to canonical skills');
assert.equal(h.storage.get(profileKey), savedProfile, 'corrupt balance storage preserves player save');
h.storage.delete('screwvivors.balance.v1');
const originalSet = h.localStorage.setItem;
h.localStorage.setItem = () => {throw new Error('storage denied');};
assert.equal(save(defaults).ok, false, 'denied storage is reported instead of a false successful apply');
assert.equal(h.storage.get(profileKey), savedProfile, 'denied balance storage preserves player save');
h.localStorage.setItem = originalSet;
const originalGet = h.localStorage.getItem;
h.localStorage.getItem = () => {throw new Error('storage denied');};
assert.equal(run('window.ScrewBalance.load().length'), 82, 'blocked storage still permits canonical play');
h.localStorage.getItem = originalGet;
console.log('Catalog scope, invalid configuration, corrupt JSON and storage isolation passed.');

// Saving in combat stages the configuration; the current run retains its snapshot.
run('reset()');
const edited = clone();
edited.find(item=>item.id==='damage').effects.find(effect=>effect.attribute==='Dano direto').value=3;
edited.find(item=>item.id==='damage').effects.push({id:'custom-rate-cost',attribute:'Intervalo de disparo',operator:'×',value:2,unit:''});
assert.equal(save(edited).ok, true, 'a valid damage and penalty edit is saved');
run("SKILLS.find(item=>item.id==='damage').apply()");
near(run('player.damage'),44,'active run keeps original damage effect');
near(run('player.rate'),.32,'active run keeps the positive-gain default');
assert.equal(run('player.damageStacks'),1,'original shot bookkeeping is preserved');
run('reset();SKILLS.find(item=>item.id==="damage").apply()');
near(run('player.damage'),66,'new run applies edited damage');
near(run('player.rate'),.64,'new run applies edited penalty');
run('SKILLS.find(item=>item.id==="damage").apply()');
near(run('player.damage'),66,'edited modules remain unique per run');

const conditional = clone();
conditional.find(item=>item.id==='burn').effects=[{id:'new-damage',attribute:'Dano direto',operator:'+',value:5,unit:''}];
assert.equal(save(conditional).ok,true,'editing direct modifiers on a conditional module validates');
run('reset();SKILLS.find(item=>item.id==="burn").apply()');
assert.equal(run('player.skills.burn'),1,'editing numbers preserves the original burn flag');
near(run('player.damage'),27,'new direct benefit applies once');
near(run('player.projectileLife'),1,'removed default penalty is not silently re-applied');

const editedMagazine=clone();
editedMagazine.find(item=>item.id==='crit').effects=[{id:'larger-magazine',attribute:'Multiplicador do carregador',operator:'×',value:2,unit:''}];
assert.equal(save(editedMagazine).ok,true);
run('reset();SKILLS.find(item=>item.id==="crit").apply()');
near(run('player.magazineMult'),2,'edited magazine replaces the default magazine penalty');
assert.equal(run('player.skills.crit'),1,'fifth-shot flag survives magazine editing');
assert.equal(run('player.ammo'),24,'replacing a magazine penalty must not discard ammo through the original callback');

const smallerMagazine=clone();
smallerMagazine.find(item=>item.id==='magnet').effects=[{id:'smaller-magazine',attribute:'Multiplicador do carregador',operator:'×',value:.5,unit:''}];
assert.equal(save(smallerMagazine).ok,true);
run('reset();SKILLS.find(item=>item.id==="magnet").apply()');
assert.equal(run('player.ammo'),12,'new magazine penalties clamp the current ammo to the new capacity');

const specialEdits=clone();
for(const id of ['pulseCoil','volatileReactor','tailDecoy']) specialEdits.find(item=>item.id===id).effects=[{id:'direct-damage',attribute:'Dano direto',operator:'+',value:7,unit:''}];
assert.equal(save(specialEdits).ok,true);
run('reset();state="blessing";offeredBlessings=[GAMBARRAS.find(item=>item.id==="pulseCoil")];chooseBlessing("pulseCoil",offerVersion)');
near(run('player.damage'),29,'blessing choice applies edited effects');
run('reset();state="experiment";offeredExperiments=[BOSS_EXPERIMENTS.find(item=>item.id==="volatileReactor")];chooseExperiment("volatileReactor",offerVersion)');
near(run('player.damage'),29,'boss experiment choice applies edited effects');
near(run('player.rate'),.32,'boss experiment removes a replaced penalty');
run('reset();state="specialization";offeredSpecializations=[SPECIALIZATIONS.prot.find(item=>item.id==="tailDecoy")];chooseSpecialization("tailDecoy",offerVersion)');
near(run('player.damage'),29,'chassis choice applies added direct effects');
assert.equal(run('player.specialization'),'tailDecoy','chassis conditional protocol stays active');

const withNew = clone();
withNew.push({...withNew.find(item=>item.id==='damage'),id:'test-simple-module',name:'TEST SIMPLE',condition:'',prerequisites:['magnet'],effects:[{id:'simple-damage',attribute:'Dano direto',operator:'×',value:1.1,unit:''},{id:'simple-cost',attribute:'Integridade máxima',operator:'×',value:.9,unit:''}]});
assert.equal(save(withNew).ok,true,'a new simple Normal module is accepted');
assert.equal(run('SKILLS.some(item=>item.id==="test-simple-module")'),false,'new skill cannot enter an active run');
run('reset()');
assert.equal(run('SKILLS.find(item=>item.id==="test-simple-module").available()'),false,'new skill respects its prerequisite');
run('SKILLS.find(item=>item.id==="magnet").apply()');
assert.equal(run('SKILLS.find(item=>item.id==="test-simple-module").available()'),true,'new skill becomes available after prerequisite');
run('SKILLS.find(item=>item.id==="test-simple-module").apply()');
near(run('player.damage'),24.2,'new simple module has a real runtime effect');
near(run('player.maxHp'),90,'new simple module applies its cost');
assert.equal(run('player.acquired.has("test-simple-module")'),true,'new simple module is tracked as acquired');
const withDangling=JSON.parse(JSON.stringify(withNew));
withDangling.find(item=>item.id==='test-simple-module').prerequisites=['deleted-custom'];
assert.equal(validate(withDangling).ok,false,'deleting a custom prerequisite cannot leave dependent skills orphaned');
const disabled=clone();disabled.find(item=>item.id==='bossHunter').enabled=false;disabled.find(item=>item.id==='tailDecoy').enabled=false;
assert.equal(save(disabled).ok,true,'canonical leaf modules may be disabled explicitly');
run('reset()');
assert.equal(run('SKILLS.some(item=>item.id==="bossHunter")'),false,'disabled normal module leaves the next-run offer pool');
assert.equal(run('SPECIALIZATIONS.prot.some(item=>item.id==="tailDecoy")'),false,'disabled chassis protocol leaves next-run offer pool');
assert.equal(run('window.ScrewBalance.catalog.length'),82,'disabled modules remain in the canonical registry');
assert.equal(h.storage.get(profileKey),savedProfile,'all configuration edits leave persistent player progress intact');
assert.equal(save(defaults).ok,true);
run('reset()');
assert.equal(run('SKILLS.length'),52,'resetting configuration removes custom modules from the next run');
console.log('Next-run snapshots, edited benefits/costs, conditional flags and new Normal modules passed.');
