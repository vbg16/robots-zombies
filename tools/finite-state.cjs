'use strict';

// Inspect before serialization: JSON turns NaN/Infinity into null.
// Weak collections cannot be enumerated; callers must audit their known keys.
function inspectFiniteState(root) {
 const invalid=[],opaque=[],seen=new WeakSet();let numbers=0,objects=0;
 function visit(value,path){
  if(typeof value==='number'){numbers++;if(!Number.isFinite(value))invalid.push({path,value:String(value)});return;}
  if(value===null||typeof value!=='object'||seen.has(value))return;
  seen.add(value);objects++;
  const tag=Object.prototype.toString.call(value);
  if(tag==='[object WeakMap]'||tag==='[object WeakSet]'){opaque.push({path,type:tag.slice(8,-1)});return;}
  if(tag==='[object Map]'){let i=0;for(const [key,item] of value){visit(key,path+'.mapKey['+i+']');visit(item,path+'.mapValue['+i+']');i++;}}
  if(tag==='[object Set]'){let i=0;for(const item of value)visit(item,path+'.set['+(i++)+']');}
  for(const key of Reflect.ownKeys(value)){
   const label=typeof key==='symbol'?key.toString():key;
   visit(value[key],path+'['+JSON.stringify(label)+']');
  }
 }
 visit(root,'state');return {invalid,opaque,numbers,objects};
}
module.exports={inspectFiniteState};
