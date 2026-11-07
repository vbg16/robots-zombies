/* Pure temporary support maturation model; age is supplied by the combat adapter.
 * Negative ages clamp to zero. Non-numeric/non-finite ages throw TypeError.
 * Factors are stepped, not interpolated: 1 -> 1.1 -> 1.2 -> 1.3 at 30/60/90s.
 * nextIn is seconds until the next tier; at the cap it is zero, with maxed=true.
 */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.ScrewDroneMaturity=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const factors=Object.freeze([1,1.1,1.2,1.3]);
 function get(ageSeconds){
  if(typeof ageSeconds!=='number'||!Number.isFinite(ageSeconds))throw new TypeError('ageSeconds must be a finite number');
  const age=Math.max(0,ageSeconds),tier=Math.min(3,Math.floor(age/30)),maxed=tier===3;
  return {tier,damageFactor:factors[tier],nextIn:maxed?0:(tier+1)*30-age,maxed};
 }
 return Object.freeze({get});
});
