/* Original procedural score and sound palette; no network assets or combat RNG. */
(function (root) {
 'use strict';
 let context=null,musicBus=null,effectsBus=null,noiseBuffer=null,playing=false;
 let musicVolume=.35,effectsVolume=.6,nextStep=0,step=0,seed=0x5c4e77;
 const musicVoices=new Set(),effectVoices=new Set(),lastEffect=new Map();
 const stepSeconds=60/96/4;
 const clamp=value=>Math.max(0,Math.min(1,Number(value)||0));
 function noise(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296*2-1;}
 function volume(bus,value){if(bus&&context)bus.gain.setTargetAtTime(value,context.currentTime,.025);}
 function release(voices){for(const voice of [...voices]){try{voice.source.stop();}catch(_){}voice.dispose();}}
 function voice(source,gain,bus,when,duration,amplitude,voices){
  if(voices.size>=32){try{source.disconnect();gain.disconnect();}catch(_){}return;}
  let disposed=false;
  const entry={source,dispose(){if(disposed)return;disposed=true;voices.delete(entry);try{source.disconnect();gain.disconnect();}catch(_){}}};
  source.connect(gain);gain.connect(bus);gain.gain.setValueAtTime(.0001,when);
  gain.gain.exponentialRampToValueAtTime(Math.max(.0002,amplitude),when+.008);
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
 function setPlaying(value){
  value=!!value;if(playing===value)return;playing=value;
  if(!playing){release(musicVoices);nextStep=0;}
  else if(context)nextStep=context.currentTime+.025;
 }
 function update(){
  if(!playing||!context||context.state!=='running'||musicVolume===0)return;
  const now=context.currentTime;if(nextStep<now-.1)nextStep=now+.02;
  // Schedule a short horizon only, so pause never leaves a long queued score.
  let count=0;
  while(nextStep<now+.09&&count++<3){
   const position=step%64,chord=Math.floor(position/16),bass=[55,65.406,49,73.416][chord];
   if(position%4===0)tone(bass,bass*.995,nextStep,.24,.17,'triangle',musicBus,musicVoices);
   if(position%8===0)tone(120,40,nextStep,.13,.2,'sine',musicBus,musicVoices);
   if(position%8===4)hiss(nextStep,.065,.07,musicBus,musicVoices);
   if(position%2===1)hiss(nextStep,.025,.025,musicBus,musicVoices);
   const melody=[0,7,12,10,7,3,5,2];
   if(position%4===2){const semitone=melody[Math.floor(position/4)%8];tone(bass*4*Math.pow(2,semitone/12),null,nextStep,.28,.055,'triangle',musicBus,musicVoices);}
   step++;nextStep+=stepSeconds;
  }
 }
 function play(name){
  if(!context||context.state!=='running'||effectsVolume===0||effectVoices.size>=24)return;
  const now=context.currentTime,limits={shot:.06,kill:.1,pickup:.08,hit:.12,reload:.15,upgrade:.3,dash:.15,boss:.5,death:1};
  if(!Object.prototype.hasOwnProperty.call(limits,name))return;
  if(now-(lastEffect.get(name)??-Infinity)<limits[name])return;lastEffect.set(name,now);
  const beep=(f,end,delay,duration,amp=.15,type='triangle')=>tone(f,end,now+delay,duration,amp,type,effectsBus,effectVoices);
  if(name==='shot'){beep(210,75,0,.065,.16,'square');hiss(now,.04,.13,effectsBus,effectVoices);}
  else if(name==='reload'){beep(180,110,0,.07,.13,'square');beep(320,420,.1,.09,.11,'square');}
  else if(name==='hit'){hiss(now,.16,.3,effectsBus,effectVoices);beep(110,35,0,.2,.22,'sawtooth');}
  else if(name==='kill'){beep(180,45,0,.12,.1);hiss(now,.08,.09,effectsBus,effectVoices);}
  else if(name==='pickup'){beep(660,900,0,.08,.09);}
  else if(name==='upgrade'){[330,440,660,880].forEach((f,i)=>beep(f,null,i*.08,.24,.13));}
  else if(name==='dash'){hiss(now,.18,.19,effectsBus,effectVoices);beep(140,620,0,.16,.12,'sawtooth');}
  else if(name==='boss'){[110,103.826,110].forEach((f,i)=>beep(f,null,i*.22,.3,.19,'sawtooth'));}
  else if(name==='death'){[220,164.814,110,55].forEach((f,i)=>beep(f,Math.max(25,f*.6),i*.17,.4,.18,'triangle'));}
 }
 root.ScrewAudio=Object.freeze({unlock,setPlaying,update,play,
  setMusicVolume(value){musicVolume=clamp(value);volume(musicBus,musicVolume);if(!musicVolume)release(musicVoices);else if(context)nextStep=context.currentTime+.025;},
  setEffectsVolume(value){effectsVolume=clamp(value);volume(effectsBus,effectsVolume);if(!effectsVolume)release(effectVoices);},
  getState(){return {available:!!(root.AudioContext||root.webkitAudioContext),unlocked:!!context&&context.state==='running',playing,musicVolume,effectsVolume};}
 });
})(typeof window!=='undefined'?window:globalThis);
