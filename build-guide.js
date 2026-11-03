/* Read-only build plans. Loadout changes always go through the guarded garage API. */
(()=>{
 'use strict';
 const storageKey='screwvivors.build-guide.v1';
 let initialized=false,activeId=null,storageWarning='',dialog,status,grid,hud,offerNote,garageNote,configNote;
 const node=(tag,className,text)=>{const item=document.createElement(tag);if(className)item.className=className;if(text!==undefined)item.textContent=text;return item;};
 const write=(item,text)=>{if(item&&item.textContent!==text)item.textContent=text;};
 const setHidden=(item,value)=>{if(item&&item.hidden!==value)item.hidden=value;};
 const plans=()=>window.ScrewBuilds?.builds||[];
 const api=()=>window.ScrewBuildGuide;
 const skills=()=>window.ScrewBalance?.catalog||[];
 const nameOf=id=>skills().find(skill=>skill.id===id)?.name||Object.values(catalog().evolutions||{}).flat().find(item=>item.id===id)?.name||id;
 const catalog=()=>api()?.getCatalog?.()||{robots:{},weapons:{}};
 const equipment=(kind,id)=>{const source=catalog()[kind];return Array.isArray(source)?source.find(item=>item.id===id):source?.[id];};
 const progress=()=>api()?.getProgress?.()||{state:document.getElementById('garage')?.hidden?'title':'garage',acquired:[],blessings:[],experiments:[]};
 const active=()=>plans().find(plan=>plan.id===activeId);
 const notify=text=>write(status,text+(storageWarning?' '+storageWarning:''));
 const loadoutText=plan=>`${equipment('robots',plan.robot)?.name||plan.robot} / ${equipment('weapons',plan.weapon)?.name||plan.weapon}`;
 const priceText=(kind,id)=>api()?.getPriceText?.(kind,id)||document.getElementById((kind==='robots'?'robot-status-':'weapon-status-')+id)?.textContent||'confira o custo na garagem';
 function remember(id){
  activeId=id;
  try{localStorage.setItem(storageKey,JSON.stringify({version:1,id}));storageWarning='';}
  catch(_){storageWarning='O acompanhamento não pôde ser salvo neste dispositivo.';}
 }
 function follow(plan){remember(plan.id);notify('GUIA ATIVO · '+plan.name+'. Monte a build jogando; as melhorias continuam dependendo das ofertas da partida.');refresh();}
 function select(plan){
  const result=api()?.selectBuild?.(plan.id);
  if(!result?.ok){notify(result?.error||'Abra a garagem para selecionar um loadout disponível.');return;}
  remember(plan.id);notify('LOADOUT PREPARADO · '+loadoutText(plan)+'. Guia ativo; conquiste os módulos durante a partida.');refresh();
 }
 function pair(title,text,className){const item=node('p',className);item.append(node('strong','',title+' '),document.createTextNode(text||'Consulte o manual de campo.'));return item;}
 function list(title,ids,ordered=false){
  const section=node('section','project-skill-section');section.append(node('h4','',title));const items=node(ordered?'ol':'ul','project-skill-list');
  for(const id of ids||[]){const item=node('li','',nameOf(id));item.dataset.guideSkill=id;items.append(item);}
  if(!items.children.length)items.append(node('li','','Escolha conforme a situação da tentativa.'));
  section.append(items);return section;
 }
 function renderCards(){
  grid.replaceChildren();
  for(const plan of plans()){
   const robot=equipment('robots',plan.robot),card=node('article','build-project-card');card.dataset.buildId=plan.id;card.style.setProperty('--project-accent',robot?.accent||'#72dafa');
   const header=node('div','project-heading');
   if(robot?.portrait){const image=node('img');image.src=robot.portrait;image.alt='';image.width=48;image.height=60;if(robot.filter)image.style.filter=robot.filter;header.append(image);}
   const title=node('div');title.append(node('p','project-loadout',loadoutText(plan)),node('h3','',plan.name));header.append(title);card.append(header);
   const tags=node('div','project-tags');for(const tag of plan.tags||[])tags.append(node('span','',tag));card.append(tags,node('p','project-summary',plan.summary),pair('MOTOR',plan.engine,'project-engine'),pair('VANTAGEM',plan.strength,'project-strength'),pair('CUSTO / FRAQUEZA',plan.weakness,'project-weakness'));
   const detail=node('details','project-details');detail.append(node('summary','','ROTEIRO E RECOMPENSAS'));
   detail.append(list('ORDEM SUGERIDA DE MÓDULOS',plan.skills,true),list('NÚCLEO DA BUILD',plan.core),list('GAMBIARRAS · NÍVEIS 3 / 6 / 9',plan.blessings),list('ESPECIALIZAÇÃO · NÍVEL 10',[plan.specialization].filter(Boolean)),list('REFORJA DA ARMA · NÍVEL 20',[plan.evolution].filter(Boolean)),list('EXPERIMENTOS · APÓS CHEFES',plan.experiments));
   detail.append(pair('META / ESTRATÉGIA',plan.strategy,'project-strategy'));
   if(plan.avoid?.length){const avoid=node('section','project-avoid');avoid.append(node('h4','','EVITE'));const items=node('ul');for(const text of plan.avoid)items.append(node('li','',text));avoid.append(items);detail.append(avoid);}
   card.append(detail);
   const actions=node('div','project-actions'),selectButton=node('button','','PREPARAR LOADOUT + GUIA'),followButton=node('button','','ACOMPANHAR GUIA');selectButton.type=followButton.type='button';selectButton.className='project-select';followButton.className='project-follow';followButton.setAttribute('aria-pressed',String(activeId===plan.id));selectButton.onclick=()=>select(plan);followButton.onclick=()=>follow(plan);actions.append(selectButton,followButton);card.append(actions,node('p','project-ownership'));
   grid.append(card);
  }
 }
 function recommendation(plan,current){
  const acquired=new Set(current.acquired||[]),remaining=(plan.skills||[]).filter(id=>!acquired.has(id));
  let targets=remaining;
  if(current.state==='blessing')targets=(plan.blessings||[]).filter(id=>!(current.blessings||[]).includes(id));
  else if(current.state==='specialization')targets=current.specialization?[]:[plan.specialization].filter(Boolean);
  else if(current.state==='evolution')targets=current.weaponEvolution?[]:[plan.evolution].filter(Boolean);
  else if(current.state==='experiment')targets=(plan.experiments||[]).filter(id=>!(current.experiments||[]).includes(id));
  const offered=new Set(current.offered||[]),available=targets.find(id=>offered.has(id));
  const mismatch=!!current.robot&&(current.robot!==plan.robot||current.weapon!==plan.weapon);
  return {target:available||targets[0],available,completed:(plan.skills||[]).length-remaining.length,total:(plan.skills||[]).length,mismatch};
 }
 function refresh(){
  if(!initialized)return;
  for(const card of grid.children){const plan=plans().find(item=>item.id===card.dataset.buildId);if(!plan)continue;
   const isActive=plan.id===activeId;card.classList.toggle('is-followed',isActive);card.querySelector('.project-follow').setAttribute('aria-pressed',String(isActive));
   const robotOwned=!!api().gearOwned('robots',plan.robot),weaponOwned=!!api().gearOwned('weapons',plan.weapon);
   write(card.querySelector('.project-ownership'),robotOwned&&weaponOwned?'EQUIPAMENTO DISPONÍVEL · seleção na garagem':'EQUIPAMENTO BLOQUEADO · desbloqueie na garagem: '+[!robotOwned?(equipment('robots',plan.robot)?.name||plan.robot)+' · '+priceText('robots',plan.robot):null,!weaponOwned?(equipment('weapons',plan.weapon)?.name||plan.weapon)+' · '+priceText('weapons',plan.weapon):null].filter(Boolean).join(' / '));
  }
  for(const button of document.querySelectorAll('.robot-options button')){const robot=equipment('robots',button.id.replace('robot-',''));if(robot?.accent)button.style.setProperty('--robot-accent',robot.accent);}
  const plan=active(),current=progress(),combat=['playing','upgrade','reward','blessing','experiment','specialization','evolution','paused'].includes(current.state);
  setHidden(hud,!plan||!combat||current.state!=='playing');setHidden(offerNote,!plan||!['upgrade','reward','blessing','experiment','specialization','evolution'].includes(current.state));
  document.querySelectorAll('[data-guide-recommended]').forEach(button=>button.removeAttribute('data-guide-recommended'));
  if(!plan){write(garageNote,'10 projetos para montar durante a tentativa. Escolha um roteiro e conquiste os módulos em campo.');setHidden(configNote,true);return;}
  const next=recommendation(plan,current),text=next.target?nameOf(next.target):'Roteiro concluído; adapte os próximos módulos à partida.';
  write(garageNote,'GUIA ATIVO · '+plan.name+' · '+loadoutText(plan));
  write(configNote,'GUIA DE CAMPO · '+plan.name+'. Primeiro objetivo: '+nameOf(plan.skills[0])+'. Os módulos são adquiridos jogando.');setHidden(configNote,false);
  write(hud,plan.name+' · '+next.completed+'/'+next.total+' módulos\n'+(next.mismatch?'Loadout diferente do projeto. ':'')+'PRÓXIMO OBJETIVO · '+text);
  write(offerNote,(next.mismatch?'GUIA COM LOADOUT DIFERENTE · ':'GUIA · ')+plan.name+' — '+(next.available?'PRIORIZE NESTA OFERTA: ':'OBJETIVO: ')+text+(next.target&&!next.available?' · Se não apareceu, adapte a escolha; o guia não altera as ofertas.':''));
  if(next.available){for(const button of document.querySelectorAll('[data-skill],[data-blessing],[data-experiment],[data-specialization],[data-evolution]'))if([button.dataset.skill,button.dataset.blessing,button.dataset.experiment,button.dataset.specialization,button.dataset.evolution].includes(next.available))button.setAttribute('data-guide-recommended','true');}
  for(const item of grid.querySelectorAll('[data-guide-skill]'))item.classList.toggle('is-acquired',combat&&(current.acquired||[]).includes(item.dataset.guideSkill));
 }
 function open(){if(!initialized)return;refresh();notify('PROJETOS DE CAMPO · sugestões de montagem, sem conceder módulos ou recursos.');dialog.showModal();}
 function init(){
  if(initialized||!document.getElementById('garage')||!api()?.getCatalog||!plans().length)return;
  initialized=true;
  try{const saved=JSON.parse(localStorage.getItem(storageKey)||'null');if(saved?.version===1&&plans().some(plan=>plan.id===saved.id))activeId=saved.id;}
  catch(_){storageWarning='Acompanhamento local indisponível; escolha um guia para esta sessão.';}
  dialog=node('dialog','build-project-dialog');dialog.id='build-project-dialog';dialog.setAttribute('aria-labelledby','build-project-title');
  const head=node('div','build-project-topline'),title=node('div');title.append(node('p','kicker','DR. BIRUTA / PROJETOS DE CAMPO'));const heading=node('h2','','DEZ FORMAS DE ENFRENTAR A HORDA.');heading.id='build-project-title';title.append(heading);const close=node('button','project-close','FECHAR ×');close.type='button';close.onclick=()=>dialog.close();head.append(title,close);
  status=node('p','build-project-feedback');status.setAttribute('role','status');status.setAttribute('aria-live','polite');grid=node('div','build-project-grid');
  dialog.append(head,node('p','project-intro','Cada projeto combina um chassi, uma arma e um roteiro de melhorias. Prepare o equipamento na garagem e monte a build durante a tentativa. As recompensas e os módulos continuam sujeitos às ofertas do jogo.'),status,grid);document.body.append(dialog);
  for(const id of ['open-build-guide','garage-build-guide']){const button=document.getElementById(id);if(button)button.onclick=open;}
  garageNote=document.getElementById('garage-build-guide-note');configNote=node('p','config-build-guide');const config=document.querySelector('.config-actions');config?.before(configNote);
  hud=node('div','build-guide-hud');hud.setAttribute('aria-label','Objetivo do projeto acompanhado');hud.hidden=true;document.getElementById('combat').append(hud);
  offerNote=node('p','build-guide-offer');offerNote.hidden=true;offerNote.setAttribute('role','note');document.getElementById('module-workbench').before(offerNote);
  renderCards();refresh();
  const observe=()=>refresh();
  const overlay=document.getElementById('overlay');new MutationObserver(observe).observe(overlay,{attributes:true,attributeFilter:['hidden','data-mode']});
  for(const id of ['choices','module-options'])new MutationObserver(observe).observe(document.getElementById(id),{childList:true});
  window.addEventListener('screw:garage-change',refresh);
 }
 window.addEventListener('screwvivors-ready',init);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
