(() => {
  'use strict';
  const D=window.LERNDE_DATA=window.LERNDE_DATA||{};
  const arrays=['levels','lessons','vocabulary','grammar','phrases','mockExams','professionalTopics','germanyLifeTopics','pronunciationDrills','shadowingSets','memoryRules','corrector'];
  for(const k of arrays)D[k]=D[k]||[];
  const mergeUnique=(key,items,idKey='id')=>{
    if(!Array.isArray(items)||!items.length)return;
    const target=D[key]||(D[key]=[]), seen=new Set(target.map(x=>x?.[idKey]??JSON.stringify(x)));
    for(const item of items){const id=item?.[idKey]??JSON.stringify(item);if(!seen.has(id)){target.push(item);seen.add(id);}}
  };
  async function json(url,required=true){
    const r=await fetch(url,{cache:'no-cache'}); if(!r.ok){if(required)throw new Error(`${url}: HTTP ${r.status}`);return null;} return r.json();
  }
  async function loadSplitModule(m){
    const base=(m.contentPath||`content/levels/${m.id}`).replace(/\/$/,'');
    const [module,lessons,vocabulary,grammar,phrases,exams]=await Promise.all([
      json(`${base}/module.json`),json(`${base}/lessons.json`),json(`${base}/vocabulary.json`),json(`${base}/grammar.json`),json(`${base}/phrases.json`),json(`${base}/exams.json`)
    ]);
    if(module?.level)mergeUnique('levels',[module.level]);
    mergeUnique('lessons',lessons);mergeUnique('vocabulary',vocabulary);mergeUnique('grammar',grammar);mergeUnique('phrases',phrases);mergeUnique('mockExams',exams);
  }
  async function loadPackModule(m){
    const p=await json(m.pack); if(p.level)mergeUnique('levels',[p.level]);
    for(const key of arrays.filter(x=>x!=='levels'))mergeUnique(key,p[key]);
  }
  function rebuildTranslator(){
    const map={...(D.translatorPhrases||{})}; for(const p of D.phrases||[]){if(p.bn)map[p.bn]=p.de;if(p.en)map[p.en]=p.de;} D.translatorPhrasest=map;
  }
  window.LernDEReady=(async()=>{
    try{
      const cfg=await json('config/modules.json',false); window.LERNDE_MODULES=cfg||null;
      if(cfg?.modules){for(const m of [...cfg.modules].sort((a,b)=>(a.order??99)-(b.order??99))){if(!m.enabled||m.bundled!==false)continue;if(m.pack)await loadPackModule(m);else await loadSplitModule(m);}}
      rebuildTranslator(); window.dispatchEvent(new CustomEvent('lernde:content-ready',{detail:{ok:true}})); return {ok:true};
    }catch(error){console.error('[LernDE module loader]',error);window.dispatchEvent(new CustomEvent('lernde:content-ready',{detail:{ok:false,error:String(error)}}));return {ok:false,error};}
  })();
})();
