'use strict';
/* Extend the project's original SVG pixel art. No third-party or raster assets. */
const fs=require('node:fs');
const profiles={
 bastion:{code:'bast-0002',shell:'#e8ddc9',plate:'#4f6b7a',light:'#3cc7f4',kind:'armor'},
 forge:{code:'forj-0003',shell:'#d59a6c',plate:'#765043',light:'#ffbd73',kind:'furnace'},
 volt:{code:'volt-0004',shell:'#c1b5d7',plate:'#555375',light:'#d7baff',kind:'coil'},
 nano:{code:'nano-0005',shell:'#c5dbcb',plate:'#4e776c',light:'#8ef2b0',kind:'repair'},
 swarm:{code:'enxa-0006',shell:'#ded1a0',plate:'#736c4d',light:'#ffe8a3',kind:'dock'}
};
const rect=(x,y,w,h,color)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}"/>`;
const polygon=(points,color)=>`<polygon points="${points}" fill="${color}"/>`;
const group=(x,y,body)=>`<g transform="translate(${x},${y})">${body}</g>`;
const dark='#132635',joint='#24394a',skin='#cb744a';
function cat(x,y,side=false){return rect(x,y,side?10:18,12,dark)+polygon(side?`${x+2},${y+2} ${x+6},${y+5} ${x+9},${y+2} ${x+9},${y+10} ${x+2},${y+10}`:`${x+2},${y+2} ${x+6},${y+5} ${x+12},${y+5} ${x+16},${y+2} ${x+16},${y+10} ${x+2},${y+10}`,skin)+rect(x+(side?6:4),y+6,2,2,'#72e7fa')+(side?'':rect(x+12,y+6,2,2,'#72e7fa'));}
function frame(p,d,i){
 const theta=i*Math.PI/4,side=d==='right'||d==='left',back=d==='up',bob=i%4===1||i%4===3?1:0;
 let art='<ellipse cx="32" cy="74" rx="25" ry="4" fill="#101d2a"/>';
 // Opposed jointed legs: stance travels backward; the forward swing raises the toe.
 for(const leg of [-1,1]){
  const angle=theta+(leg===1?Math.PI:0),stride=Math.round(Math.sin(angle)*5),lift=Math.round(Math.max(0,Math.cos(angle))*4);
  const hipX=side?32+leg*3:32+leg*9,footX=side?hipX+stride:hipX+Math.round(stride*.25),footY=70-lift;
  const kneeX=Math.round((hipX+footX)/2)+(side?2:0),kneeY=57-lift/2;
  art+=polygon(`${hipX-4},44 ${hipX+4},44 ${kneeX+4},${kneeY} ${kneeX-4},${kneeY}`,joint);
  art+=rect(kneeX-5,kneeY-3,10,7,p.plate)+rect(kneeX-3,kneeY-2,6,2,p.light);
  art+=polygon(`${kneeX-3},${kneeY+3} ${kneeX+3},${kneeY+3} ${footX+4},${footY-2} ${footX-4},${footY-2}`,dark);
  art+=rect(footX-7,footY-6,14,8,p.plate)+rect(footX-9,footY,18,4,p.shell)+rect(footX-6,footY+1,12,2,p.light);
 }
 let body='';
 if(side){
  body+=rect(20,22,24,27,dark)+rect(23,24,20,22,p.plate)+rect(16,21,9,24,p.shell)+rect(18,24,5,12,p.plate);
  body+=rect(25,5,24,24,p.shell)+rect(28,8,19,17,p.plate)+cat(37,12,true)+rect(40,27,10,3,p.light);
  const armSwing=Math.round(Math.sin(theta)*3);body+=rect(28,21,16,15,p.shell)+rect(31,24,10,4,p.plate)+rect(31+armSwing,36,8,13,dark)+rect(29+armSwing,46,12,10,p.plate);
 }else{
  body+=rect(14,20,36,30,dark)+rect(18,22,28,24,p.plate)+rect(19,6,26,23,p.shell)+rect(23,10,18,15,dark);
  body+=back?rect(25,12,14,8,p.plate)+rect(26,14,12,2,p.light):cat(23,11);
  body+=rect(22,27,20,3,p.light);
  for(const arm of [-1,1]){const swing=Math.round(Math.sin(theta)*arm*4),x=arm<0?4:43;body+=rect(x,18,17,19,p.shell)+rect(x+3,21,11,5,p.plate)+rect(x+2,37+swing,12,13,dark)+rect(x-1,47+swing,16,11,p.plate);}
 }
 // Distinct functional hardware and silhouette, rather than a hue filter.
 if(p.kind==='armor')body+=side?rect(15,18,10,19,p.shell)+rect(17,21,5,10,p.plate):rect(1,17,20,8,p.shell)+rect(43,17,20,8,p.shell)+rect(20,33,24,11,p.shell)+rect(25,36,14,5,p.light);
 if(p.kind==='furnace'){
  body+=rect(side?15:7,8,5,19,dark)+rect(side?16:8,9,3,6,p.plate)+rect(side?20:51,3,6,22,dark)+rect(side?21:52,4,4,6,p.shell);
  body+=rect(side?25:20,32,side?14:24,13,dark);for(let x=0;x<3;x++)body+=rect((side?27:23)+x*(side?3:6),34,2,8,p.light);
 }
 if(p.kind==='coil'){
  for(const x of side?[19,43]:[7,49]){body+=rect(x,16,8,23,dark);for(let y=18;y<38;y+=5)body+=rect(x-2,y,12,2,p.light);}
  body+=rect(29,33,7,10,dark)+rect(31,35,3,6,p.light);
 }
 if(p.kind==='repair'){
  body+=rect(side?13:20,30,side?11:24,15,p.shell)+rect(side?17:29,32,4,11,p.light)+rect(side?15:25,36,side?8:12,4,p.light);
  body+=rect(side?14:5,5,3,20,p.plate)+rect(side?12:3,4,7,4,p.light)+rect(side?43:48,47,7,12,dark)+rect(side?42:47,55,9,5,p.light);
 }
 if(p.kind==='dock'){
  body+=rect(side?13:18,28,side?12:28,17,dark)+rect(side?15:21,30,side?8:22,12,p.shell);
  for(const x of side?[17]:[23,35])body+=rect(x,33,7,6,p.plate)+rect(x+2,34,3,2,p.light);
  body+=rect(side?21:12,0,2,18,p.plate)+rect(side?18:9,0,8,3,p.light)+rect(side?14:7,16,13,5,p.shell);
 }
 art+=group(0,bob,body);
 // Paint scuffs retain the established repaired industrial character.
 art+=rect(side?22:7,30+bob,3,4,'#a56a4b')+rect(side?39:48,43+bob,4,2,'#a56a4b');
 if(d==='left')art=`<g transform="translate(64,0) scale(-1,1)">${art}</g>`;
 return art;
}
const atlases={};
for(const [id,p] of Object.entries(profiles)){
 let contents='';const clips={};
 for(const [row,d] of ['down','right','up','left'].entries()){
  const frames=[];for(let i=0;i<8;i++){contents+=group(i*64,row*80,frame(p,d,i));frames.push({x:i*64,y:row*80,w:64,h:80,ms:100,pivotX:32,pivotY:74});}
  clips['walk.'+d]=frames;clips['idle.'+d]=[{...frames[0],ms:1000}];
 }
 const image=`assets/robots/${p.code}-walk-v2.svg`,portrait=`assets/robots/${p.code}-portrait-v2.svg`;
 const svg=(w,h,body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${body}</svg>\n`;
 fs.writeFileSync(image,svg(512,320,contents));fs.writeFileSync(portrait,svg(64,80,frame(p,'down',0)));
 atlases[id]={image,portrait,width:512,height:320,scale:.9,groundOffset:28,clips};
}
fs.writeFileSync('chassis-vector-atlases.js','/* Generated from original project SVG geometry by tools/generate-chassis-sprites.cjs. */\n(function(root){const atlases='+JSON.stringify(atlases)+';if(typeof module!=="undefined"&&module.exports)module.exports=atlases;else root.ScrewChassisVectorAtlases=atlases;})(globalThis);\n');
console.log('Generated5 native directional chassis atlases and5portraits.');
