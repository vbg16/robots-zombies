/* Pure swept-point/circle entry, including the boundary. Coordinates and radius
 * must be finite numbers; radius must be nonnegative. No world state is read.
 * Returns the first segment parameter in [0,1], or null if there is no contact.
 * Scaling avoids squared-distance overflow; cross-product roundoff at a tangent
 * is bounded by a few ULPs of its terms, rather than a world-space tolerance.
 */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.ScrewSegmentCircle=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 function entry(ax,ay,bx,by,cx,cy,r){
  if(!Number.isFinite(ax)||!Number.isFinite(ay)||!Number.isFinite(bx)||!Number.isFinite(by)||!Number.isFinite(cx)||!Number.isFinite(cy)||!Number.isFinite(r)||r<0)throw new TypeError('Coordinates and nonnegative radius must be finite numbers');
  let fx=ax-cx,fy=ay-cy,dx=bx-ax,dy=by-ay;
  if(!Number.isFinite(fx)||!Number.isFinite(fy)||!Number.isFinite(dx)||!Number.isFinite(dy)){
   // Opposite finite extremes may overflow subtraction; normalize first then.
   const worldScale=Math.max(Math.abs(ax),Math.abs(ay),Math.abs(bx),Math.abs(by),Math.abs(cx),Math.abs(cy),r);
   fx=ax/worldScale-cx/worldScale;fy=ay/worldScale-cy/worldScale;
   dx=bx/worldScale-ax/worldScale;dy=by/worldScale-ay/worldScale;r/=worldScale;
  }
  const scale=Math.max(Math.abs(fx),Math.abs(fy),Math.abs(dx),Math.abs(dy),r);
  if(scale===0)return 0;
  fx/=scale;fy/=scale;dx/=scale;dy/=scale;r/=scale;
  const distance=Math.hypot(fx,fy);
  if(distance<=r)return 0;
  const length=Math.hypot(dx,dy);
  if(length===0)return null;
  const ux=dx/length,uy=dy/length,projection=-(fx*ux+fy*uy);
  if(projection<=0)return null;
  const crossA=fx*uy,crossB=fy*ux,perpendicular=Math.abs(crossA-crossB);
  const tangentRoundoff=4*Number.EPSILON*(Math.abs(crossA)+Math.abs(crossB)+r);
  if(perpendicular-r>tangentRoundoff)return null;
  const halfChord=Math.sqrt(Math.max(0,(r-perpendicular)*(r+perpendicular)));
  // Equivalent to projection-halfChord, without cancellation near the start.
  const along=(distance-r)*(distance+r)/(projection+halfChord),t=along/length;
  if(t>1+8*Number.EPSILON)return null;
  return Math.max(0,Math.min(1,t));
 }
 return Object.freeze({entry});
});
