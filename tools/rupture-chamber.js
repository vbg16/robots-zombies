/* Pure last-round chamber model. Call once per real ammo-consuming emission,
 * not once per pellet, attempted shot or ammo refill. The caller owns storage.
 * The current emission counts before a last round consumes the stored charges.
 */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.ScrewRuptureChamber=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const MAX_CHARGES=60,BONUS_PER_CHARGE=.25;
 function emit(stored,ammoBefore){
  if(!Number.isInteger(stored)||stored<0||stored>MAX_CHARGES)throw new TypeError('stored must be an integer from 0 through 60');
  if(!Number.isInteger(ammoBefore)||ammoBefore<=0)throw new TypeError('ammoBefore must be a positive integer');
  const charges=Math.min(MAX_CHARGES,stored+1),last=ammoBefore===1;
  return {stored:last?0:charges,factor:last?1+BONUS_PER_CHARGE*charges:1,last};
 }
 return Object.freeze({MAX_CHARGES,BONUS_PER_CHARGE,emit});
});
