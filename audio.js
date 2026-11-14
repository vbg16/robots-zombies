/* Original procedural score and sound palette; no network assets or combat RNG. */
(function (root) {
 'use strict';
 let scene=null,targetScene=null,transitionUntil=0;
 let context=null,musicBus=null,effectsBus=null,noiseBuffer=null,playing=false;
 let musicVolume=.35,effectsVolume=.6,nextStep=0,step=0,seed=0x5c4e77;
 const musicVoices=new Set(),effectVoices=new Set(),lastEffect=new Map();
 const scenes=new Set(["menu","garage","combat"]);
 const clamp=value=>Math.max(0,Math.min(1,Number(value)||0));
 function noise(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296*2-1;}
 function volume(bus,value){if(bus&&context)bus.gain.setTargetAtTime(value,context.currentTime,.025);}
 function release(voices){for(const voice of [...voices]){try{voice.source.stop();}catch(_){}voice.dispose();}}
 function voice(source,gain,bus,when,duration,amplitude,voices){
  if(voices.size>=32){try{source.disconnect();gain.disconnect();}catch(_){}return;}
  let disposed=false;
  const entry={source,dispose(){if(disposed)return;disposed=true;voices.delete(entry);try{source.disconnect();gain.disconnect();}catch(_){}}};
  source.connect(gain);gain.connect(bus);gain.gain.setValueAtTime(.0001,when);
  gain.gain.exponentialRampToValueAtTime(Math.max(.0002,amplitude),when+(voices===musicVoices?Math.min(.16,duration*.3):.008));
  gain.gain.exponentialRampToValueAtTime(.0001,when+duration);
  voices.add(entry);source.onended=entry.dispose;source.start(when);source.stop(when+duration+.012);
 }
 function tone(frequency,endFrequency,when,duration,amplitude,type,bus,voices){
  if(!context||context.state!=='running')return;
  const oscillator=context.createOscillator(),gain=context.createGain();oscillator.type=type;
  oscillator.frequency.setValueAtTime(frequency,when);
  if(endFrequency)oscillator.frequency.exponentialRampToValueAtTime(Math.max(10,endFrequency),when+duration);
  voice(oscillator,gain,bus,when,duration,amplitude,voices);
 }
 function hiss(when,duration,amplitude,bus,voices){
  if(!context||!noiseBuffer||context.state!=='running')return;
  const source=context.createBufferSource(),gain=context.createGain();source.buffer=noiseBuffer;
  voice(source,gain,bus,when,duration,amplitude,voices);
 }
 async function unlock(){
  try{
   if(!context){
    const AudioContext=root.AudioContext||root.webkitAudioContext;if(!AudioContext)return false;
    context=new AudioContext();musicBus=context.createGain();effectsBus=context.createGain();
    musicBus.gain.value=musicVolume;effectsBus.gain.value=effectsVolume;
    const master=context.createDynamicsCompressor();master.threshold.value=-16;master.ratio.value=8;
    musicBus.connect(master);effectsBus.connect(master);master.connect(context.destination);
    noiseBuffer=context.createBuffer(1,Math.ceil(context.sampleRate*.5),context.sampleRate);
    const samples=noiseBuffer.getChannelData(0);for(let i=0;i<samples.length;i++)samples[i]=noise()*.35;
   }
   if(context.state==='suspended')await context.resume();
   if(playing)nextStep=Math.max(nextStep,context.currentTime+.025);
   return context.state==='running';
  }catch(_){return false;}
 }
 function setScene(value){
  value=scenes.has(value)?value:null;if(value===targetScene)return;
  targetScene=value;
  if(!context){scene=value;playing=!!value;step=0;nextStep=0;return;}
  musicBus.gain.cancelScheduledValues(context.currentTime);musicBus.gain.setTargetAtTime(0,context.currentTime,.065);transitionUntil=context.currentTime+.3;
 }
 // Compatibility for integrations that require an immediate stop.
 function setPlaying(value){step=0;transitionUntil=0;scene=targetScene=value?'combat':null;playing=!!value;release(musicVoices);nextStep=context?context.currentTime+.025:0;if(context)volume(musicBus,playing?musicVolume:0);}
 function update(){
  if(!context||context.state!=='running')return;
  const now=context.currentTime;
  if(transitionUntil){if(now<transitionUntil)return;release(musicVoices);scene=targetScene;playing=!!scene;step=0;nextStep=now+.025;transitionUntil=0;musicBus.gain.setTargetAtTime(playing?musicVolume:0,now,.18);}
  if(!playing||musicVolume===0)return;
  if(nextStep<now-.1)nextStep=now+.02;
  const tempo=scene==='menu'?72:scene==='garage'?78:90,stepSeconds=60/tempo/4;
  let count=0;
  while(nextStep<now+.09&&count++<3){
   const position=step%128,phrase=Math.floor(step/128)%4,chord=Math.floor(position/32),rootMidi=[[48,44,51,46],[48,51,44,46],[48,44,46,43],[48,46,44,46]][phrase][chord],freq=n=>440*Math.pow(2,(n-69)/12),base=freq(rootMidi),active=scene==='combat';
   // Warm minor-seventh pads, breathing bass and sparse, rounded pentatonic melody.
   if(position%16===0){for(const interval of [0,7,10,14])tone(freq(rootMidi+interval+12),null,nextStep,scene==='menu'?3.8:scene==='garage'?3.2:2.7,.022,'sine',musicBus,musicVoices);}
   if(position%8===0)tone(base/2,null,nextStep,.65,active?.095:.055,'triangle',musicBus,musicVoices);
   const melody=[12,19,22,19,15,17,19,10,12,15,19,24,22,19,17,15];
   if(position%8===(scene==='menu'?4:2)&&!(phrase===3&&position<64)){const n=melody[(Math.floor(position/8)+phrase*3)%melody.length]-(phrase===2?12:0);tone(freq(rootMidi+n),null,nextStep,.9,.035,'sine',musicBus,musicVoices);tone(freq(rootMidi+n),null,nextStep+.22,.65,.009,'sine',musicBus,musicVoices);}
   if(active&&position%4===0)tone(78,34,nextStep,.19,.08,'sine',musicBus,musicVoices);
   if(scene!=='menu'&&position%8===4)hiss(nextStep,.045,active?.018:.009,musicBus,musicVoices);
   step++;nextStep+=stepSeconds;
  }
 }
 function play(name){
  if(typeof name!=='string'||!context||context.state!=='running'||effectsVolume===0||effectVoices.size>=24)return;
  const weapon=name.startsWith('shot-')?name.slice(5):null,throttleName=weapon?'shot':name;
  const now=context.currentTime,limits={shot:.06,kill:.1,pickup:.08,hit:.12,reload:.15,reloadReady:.15,upgrade:.3,dash:.15,boss:.5,bossAttack:.3,bossDefeat:1,death:1,transition:.08,pause:.1,resume:.1,rotor:.15,sensor:.35,corrosion:.14,drone:.12,shield:.2,shieldBreak:.3,repair:.3,matrixDeploy:.25,matrixFeed:.12,matrixShot:.12,matrixExpire:.3,reloadBladeOn:.2,reloadBladeHit:.12,reserveHit:.15,reserveGain:.3,pistonLaunch:.15,pistonHit:.12,integrityPulse:.2,ammoCharge:.15};
  if(!Object.prototype.hasOwnProperty.call(limits,throttleName))return;
  if(weapon&&!['machine','shotgun','burst','sniper','laser','flame','cryo','rocket','grenade','tesla','disc','harpoon'].includes(weapon))return;
  if(now-(lastEffect.get(throttleName)??-Infinity)<limits[throttleName])return;lastEffect.set(throttleName,now);
  const beep=(f,end,delay,duration,amp=.15,type='triangle')=>tone(f,end,now+delay,duration,amp,type,effectsBus,effectVoices);
  if(name==='transition'){beep(220,440,0,.16,.07,'sine');beep(660,880,.08,.2,.035,'sine');hiss(now,.08,.025,effectsBus,effectVoices);}
  else if(name==='pause'){beep(440,220,0,.15,.06,'sine');}
  else if(name==='resume'){beep(220,440,0,.15,.06,'sine');}
  else if(name==='shot'||weapon){
   if(weapon==='burst'){beep(260,110,0,.045,.085,'triangle');hiss(now,.03,.06,effectsBus,effectVoices);}
   else if(weapon==='laser'){beep(510,280,0,.055,.045,'sine');}
   else if(weapon==='flame'){hiss(now,.1,.065,effectsBus,effectVoices);beep(95,70,0,.08,.025,'sine');}
   else if(weapon==='cryo'){beep(740,360,0,.12,.055,'sine');beep(1110,620,.025,.13,.018,'sine');}
   else if(weapon==='tesla'){beep(230,690,0,.065,.055,'triangle');beep(920,280,.025,.08,.025,'sine');}
   else if(weapon==='rocket'){beep(100,32,0,.24,.13,'sine');hiss(now,.18,.095,effectsBus,effectVoices);}
   else if(weapon==='grenade'){beep(140,55,0,.12,.095,'triangle');hiss(now,.07,.055,effectsBus,effectVoices);}
   else if(weapon==='disc'){beep(340,640,0,.15,.045,'sine');hiss(now,.08,.025,effectsBus,effectVoices);}
   else if(weapon==='harpoon'){beep(250,85,0,.09,.075,'triangle');hiss(now,.045,.065,effectsBus,effectVoices);}
   else if(weapon==='sniper'){beep(155,45,0,.12,.13,'triangle');hiss(now,.075,.095,effectsBus,effectVoices);}
   else if(weapon==='shotgun'){beep(115,40,0,.15,.11,'triangle');hiss(now,.12,.12,effectsBus,effectVoices);}
   else{beep(210,75,0,.065,.1,'triangle');hiss(now,.04,.075,effectsBus,effectVoices);}
  }
  else if(name==='rotor'){hiss(now,.05,.025,effectsBus,effectVoices);beep(320,145,0,.065,.035,'triangle');}
  else if(name==='ammoCharge'){beep(330,440,0,.06,.018,'triangle');}
  else if(name==='integrityPulse'){beep(180,85,0,.18,.035,'sine');beep(540,270,.02,.12,.018,'sine');}
  else if(name==='pistonLaunch'){beep(155,310,0,.1,.035,'triangle');hiss(now,.035,.018,effectsBus,effectVoices);}
  else if(name==='pistonHit'){beep(260,100,0,.06,.03,'triangle');}
  else if(name==='reserveHit'){beep(290,120,0,.09,.035,'triangle');}
  else if(name==='reserveGain'){beep(240,360,0,.12,.025,'sine');}
  else if(name==='reloadBladeOn'){beep(125,250,0,.1,.025,'triangle');}
  else if(name==='reloadBladeHit'){hiss(now,.04,.025,effectsBus,effectVoices);beep(210,140,0,.045,.025,'triangle');}
  else if(name==='matrixDeploy'){hiss(now,.055,.025,effectsBus,effectVoices);beep(165,245,0,.16,.04,'triangle');}
  else if(name==='matrixFeed'){beep(510,620,0,.045,.022,'sine');}
  else if(name==='matrixShot'){hiss(now,.04,.035,effectsBus,effectVoices);beep(390,150,0,.085,.05,'triangle');}
  else if(name==='matrixExpire'){beep(190,85,0,.18,.03,'sine');}
  else if(name==='sensor'){beep(160,95,0,.28,.06,'sine');beep(440,220,.04,.22,.024,'sine');}
  else if(name==='corrosion'){hiss(now,.11,.045,effectsBus,effectVoices);beep(96,48,0,.15,.045,'triangle');}
  else if(name==='drone'){beep(780,390,0,.055,.035,'triangle');}
  else if(name==='shield'){beep(520,780,0,.18,.055,'sine');beep(1040,780,.02,.13,.018,'sine');}
  else if(name==='shieldBreak'){hiss(now,.2,.09,effectsBus,effectVoices);beep(320,95,0,.22,.08,'triangle');}
  else if(name==='repair'){beep(180,270,0,.15,.045,'sine');}
  else if(name==='reloadReady'){beep(360,460,0,.07,.035,'triangle');}
  else if(name==='bossAttack'){beep(105,65,0,.17,.08,'sine');hiss(now,.06,.025,effectsBus,effectVoices);}
  else if(name==='bossDefeat'){[120,180,240].forEach((f,i)=>beep(f,null,i*.09,.55,.07,'sine'));}
  else if(name==='reload'){beep(180,110,0,.07,.13,'square');beep(320,420,.1,.09,.11,'square');}
  else if(name==='hit'){hiss(now,.16,.3,effectsBus,effectVoices);beep(110,35,0,.2,.22,'sawtooth');}
  else if(name==='kill'){beep(180,45,0,.12,.1);hiss(now,.08,.09,effectsBus,effectVoices);}
  else if(name==='pickup'){beep(660,900,0,.08,.09);}
  else if(name==='upgrade'){[330,440,660,880].forEach((f,i)=>beep(f,null,i*.08,.24,.13));}
  else if(name==='dash'){hiss(now,.18,.19,effectsBus,effectVoices);beep(140,620,0,.16,.12,'sawtooth');}
  else if(name==='boss'){[110,103.826,110].forEach((f,i)=>beep(f,null,i*.22,.3,.19,'sawtooth'));}
  else if(name==='death'){[220,164.814,110,55].forEach((f,i)=>beep(f,Math.max(25,f*.6),i*.17,.4,.18,'triangle'));}
 }
 root.ScrewAudio=Object.freeze({unlock,setScene,setPlaying,update,play,
  setMusicVolume(value){musicVolume=clamp(value);volume(musicBus,transitionUntil||!playing?0:musicVolume);if(!musicVolume)release(musicVoices);else if(context)nextStep=context.currentTime+.025;},
  setEffectsVolume(value){effectsVolume=clamp(value);volume(effectsBus,effectsVolume);if(!effectsVolume)release(effectVoices);},
  getState(){return {available:!!(root.AudioContext||root.webkitAudioContext),unlocked:!!context&&context.state==='running',playing,scene,targetScene,transitioning:!!transitionUntil,musicVolume,effectsVolume,musicVoices:musicVoices.size,effectVoices:effectVoices.size};}
 });
})(typeof window!=='undefined'?window:globalThis);
