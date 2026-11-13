/* Original reserve/maintenance arithmetic. Integration remains separate. */
(function(root){
'use strict';
const LIMIT=40;
const finite=n=>typeof n==='number'&&Number.isFinite(n);
const validReserve=n=>finite(n)&&n>=0&&n<=LIMIT;
function add(value,amount){
 if(!validReserve(value)||!finite(amount)||amount<0)return null;
 const gain=Math.min(LIMIT-value,amount);return {value:value+gain,gain};
}
function absorb(value,damage){
 if(!validReserve(value)||!finite(damage)||damage<0)return null;
 const spent=Math.min(value,damage);return {value:value-spent,spent,hpDamage:damage-spent};
}
function heal(hp,maxHp,amount,value){
 if(!finite(hp)||!finite(maxHp)||hp<=0||maxHp<hp||!finite(amount)||amount<=0||!validReserve(value))return null;
 const actual=Math.min(amount,maxHp-hp),excess=Math.max(0,amount-actual),reserve=add(value,excess*.5);
 return {hp:hp+actual,actual,excess,value:reserve.value,gain:reserve.gain};
}
function advance(elapsed,dt){
 if(!finite(elapsed)||elapsed<0||elapsed>30||!finite(dt)||dt<0)return null;
 // Bound before adding, including Number.MAX_VALUE input.
 return elapsed+Math.min(30-elapsed,dt);
}
function offense(elapsed,intact){
 if(!finite(elapsed)||elapsed<0||elapsed>30||typeof intact!=='boolean')return null;
 const tier=Math.min(2,Math.floor(elapsed/15)),clean=1+tier*.1,shield=intact?1.2:1;
 return {tier,clean,shield,factor:clean*shield};
}
function pulse(value,kills,shieldTimer,shieldReady){
 if(!validReserve(value)||!Number.isSafeInteger(kills)||kills<0||!finite(shieldTimer)||shieldTimer<0||typeof shieldReady!=='boolean')return null;
 const credited=Math.min(3,kills),reserve=add(value,credited*4),timer=shieldReady?shieldTimer:Math.max(0,shieldTimer-credited*8);
 return {value:reserve.value,gain:reserve.gain,credited,shieldTimer:timer,shieldReady:shieldReady||timer===0};
}
const api=Object.freeze({limit:LIMIT,initial:20,add,absorb,heal,advance,offense,pulse});
root.ScrewMaintenanceReserve=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(globalThis);
