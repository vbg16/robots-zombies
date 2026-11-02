/* The editor uses the game's own URL so both views share the balance storage. */
(()=>{
 'use strict';
 const editor=new URLSearchParams(window.location.search).get('painel')==='skills';
 const script=document.createElement('script');
 if(editor){
  document.title='Screwvivors — configurar skills';
  document.querySelectorAll('link[rel="stylesheet"]').forEach(link=>link.remove());
  document.body.className='';
  const root=document.createElement('div');root.id='skills-panel-root';
  const loading=document.createElement('p');loading.textContent='Carregando painel de skills…';
  loading.style.cssText='font:16px system-ui;padding:24px;color:#dbe5ef';root.append(loading);
  document.body.replaceChildren(root);document.body.style.background='#0b1119';
  const css=document.createElement('link');css.rel='stylesheet';css.href='tools/skills-panel/panel.css';document.head.append(css);
  script.src='tools/skills-panel/panel.js';
  script.onerror=()=>{loading.textContent='Não foi possível carregar o painel. Extraia o ZIP inteiro e tente novamente.';};
 }else script.src='game.js';
 document.body.append(script);
})();
