/* Pure run telemetry. Event amounts are supplied by adapters; no runtime/DOM/RNG access.
 * create({maxEvents:2000}) -> record(kind,payload), sample(snapshot,dt), finish().
 * sample: {time,hp,maxHp,bossAlive,bossInRange,hasTarget,firing,reloadingSlots,weaponCount}.
 * dt is a contiguous interval ending at time; supplied flags describe that interval.
 * Initial sample(...,0) is supported. HP is observed only at its supplied point in time.
 * record quantitative: xpProduced/xpCollected/xpAwarded {time,amount};
 * damage {time,amount,source,direction:'dealt'|'received',target:'body'|'shield'};
 * heal {time,amount,source}, effective amounts only, unknown source='unattributed'.
 * record details: offer/decision with complete JSON payload, including time.
 * Invalid inputs throw before modifying the collector. finish is a reusable deep-copy read.
 */
(function(root,factory){'use strict';const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ScrewRunTelemetry=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
 function number(value,name){if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>Number.MAX_SAFE_INTEGER)throw new TypeError(name+' must be finite, nonnegative and safe');return value;}
 function integer(value,name){number(value,name);if(!Number.isInteger(value))throw new TypeError(name+' must be an integer');return value;}
 function bool(value,name){if(typeof value!=='boolean')throw new TypeError(name+' must be boolean');return value;}
 function clone(value){const text=JSON.stringify(value,(key,item)=>{if(typeof item==='number'&&!Number.isFinite(item)||typeof item==='function'||typeof item==='symbol'||typeof item==='bigint'||typeof item==='undefined')throw new TypeError('Payload must contain only JSON data');return item;});if(text===undefined)throw new TypeError('Payload must contain JSON data');return JSON.parse(text);}
 function damageMap(){return {dealt:{body:Object.create(null),shield:Object.create(null)},received:{body:Object.create(null),shield:Object.create(null)}};}
 function counters(){return {seconds:0,xpProduced:0,xpCollected:0,xpAwarded:0,damage:damageMap(),heal:Object.create(null),hpMin:null,bossAliveSeconds:0,bossInRangeSeconds:0,firingSeconds:0,noTargetSeconds:0,reloadingSlotSeconds:0,weaponSlotSeconds:0,offers:0,decisions:0};}
 function create(options={}){
  const maxEvents=integer(options.maxEvents===undefined?2000:options.maxEvents,'maxEvents');
  const events=[],minutes=new Map(),totals=counters(),droppedByKind={offer:0,decision:0};let dropped=0,lastTime=null,samples=0;
  function minute(index){if(!minutes.has(index))minutes.set(index,{minute:index,start:index*60,end:(index+1)*60,...counters()});return minutes.get(index);}
  function addAmount(row,kind,amount,source,direction,target){if(kind==='damage'||kind==='heal'){const map=kind==='damage'?row.damage[direction][target]:row.heal;map[source]=(own(map,source)?map[source]:0)+amount;}else row[kind]+=amount;}
  function record(kind,payload){
   if(!['xpProduced','xpCollected','xpAwarded','damage','heal','offer','decision'].includes(kind))throw new TypeError('Unsupported record kind');
   if(!payload||typeof payload!=='object'||Array.isArray(payload))throw new TypeError('payload must be an object');
   const quantitative=['xpProduced','xpCollected','xpAwarded','damage','heal'].includes(kind);
   const data=quantitative?payload:clone(payload);number(data.time,'event time');
   if(quantitative)number(data.amount,'amount');
   if((kind==='damage'||kind==='heal')&&(typeof data.source!=='string'||!data.source))throw new TypeError('source must be a nonempty string');
   const direction=data.direction===undefined?'dealt':data.direction,target=data.target===undefined?'body':data.target;
   if(kind==='damage'&&(!['dealt','received'].includes(direction)||!['body','shield'].includes(target)))throw new TypeError('Damage direction/target must be dealt|received / body|shield');
   const bucket=minute(Math.floor(data.time/60));
   if(quantitative){addAmount(totals,kind,data.amount,data.source,direction,target);addAmount(bucket,kind,data.amount,data.source,direction,target);}
   if(kind==='offer'||kind==='decision'){const key=kind==='offer'?'offers':'decisions';totals[key]++;bucket[key]++;}
   if(quantitative)return;
   if(events.length>=maxEvents){const replace=kind==='offer'?events.findIndex(e=>e.kind==='decision'):-1;if(replace>=0){events.splice(replace,1);dropped++;droppedByKind.decision++;}else{dropped++;droppedByKind[kind]++;return;}}
   events.push({kind,payload:data});
  }
  function sample(input,dt){
   if(!input||typeof input!=='object')throw new TypeError('snapshot must be an object');
   const time=number(input.time,'time'),hp=number(input.hp,'hp'),maxHp=number(input.maxHp,'maxHp');number(dt,'dt');
   if(maxHp===0||hp>maxHp)throw new TypeError('hp must be within a positive maxHp');
   const bossAlive=bool(input.bossAlive,'bossAlive'),bossInRange=bool(input.bossInRange,'bossInRange'),hasTarget=bool(input.hasTarget,'hasTarget'),firing=bool(input.firing,'firing');
   const weaponCount=integer(input.weaponCount,'weaponCount'),reloadingSlots=integer(input.reloadingSlots,'reloadingSlots');
   if(reloadingSlots>weaponCount)throw new TypeError('reloadingSlots exceeds weaponCount');
   if(bossInRange&&!bossAlive)throw new TypeError('bossInRange requires bossAlive');
   const start=time-dt,tolerance=1e-7*Math.max(1,time/60);
   if(start<-tolerance||lastTime!==null&&Math.abs(start-lastTime)>tolerance)throw new RangeError('dt must describe the contiguous interval ending at time');
   // Health is an observed point at time, not a reconstructed interval minimum.
   const observed=minute(Math.floor(time/60));observed.hpMin=observed.hpMin===null?hp:Math.min(observed.hpMin,hp);totals.hpMin=totals.hpMin===null?hp:Math.min(totals.hpMin,hp);
   const durationFields={seconds:1,bossAliveSeconds:Number(bossAlive),bossInRangeSeconds:Number(bossInRange),firingSeconds:Number(firing),noTargetSeconds:Number(!hasTarget),reloadingSlotSeconds:reloadingSlots,weaponSlotSeconds:weaponCount};
   let cursor=Math.max(0,start);
   while(cursor<time){const index=Math.floor(cursor/60),end=Math.min(time,(index+1)*60),span=end-cursor;if(span<=0)throw new RangeError('interval cannot advance safely');const bucket=minute(index);for(const [key,rate] of Object.entries(durationFields)){bucket[key]+=span*rate;totals[key]+=span*rate;}cursor=end;}
   lastTime=time;samples++;
  }
  function finish(){return clone({schemaVersion:1,definitions:{minutes:'Zero-based [start,end). Event amounts belong to their supplied time; intervals split at boundaries.',hpMin:'Minimum observed HP at sample time; null means no sample in that minute.',xpProduced:'Base orbs produced; one per valid kill, supplied by adapter.',xpCollected:'Base orbs picked up, without XP multiplier.',xpAwarded:'Effective XP granted at pickup, including multiplier; not comparable to base-orb production.',damage:'damage[dealt|received][body|shield][source]. Missing direction/target default to dealt/body.',amounts:'Damage and effective healing by caller-provided source; use unattributed when context is unknown. No inference from HP/level/XP bar.',bossInRangeSeconds:'Declared approximation sampled over interval; not proof a shot can hit.',firingSeconds:'Declared firing intention, not emitted-shot duration. Reloading is slot-seconds; states can overlap.',events:'Only offer/decision details consume maxEvents. Offers evict decisions first; droppedByKind counts all losses. Quantitative records only aggregate.'},maxEvents,dropped,droppedByKind,samples,lastTime,totals,minutes:[...minutes.values()].sort((a,b)=>a.minute-b.minute),events});}
  return Object.freeze({record,sample,finish});
 }
 return Object.freeze({create});
});
