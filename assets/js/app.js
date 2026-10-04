(() => {
  'use strict';
  const D = window.LERNDE_DATA;
  const STORAGE_KEY = 'lernde:v3:progress';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const nowIso = () => new Date().toISOString();
  const todayKey = () => new Date().toISOString().slice(0,10);
  const esc = v => String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const clamp = (n,a,b) => Math.min(b,Math.max(a,n));
  const shuffle = arr => [...arr].sort(() => Math.random() - .5);
  const deHtml = text => `<span data-german-text>${esc(text)}</span>`;

  const defaultState = () => ({
    version: 4,
    completedLessons: [],
    vocab: {},
    examScores: {},
    writingDrafts: [],
    activities: [],
    lastView: 'home',
    selectedLevel: 'FOUNDATION',
    voiceURI: '',
    voiceRate: 0.9,
    game: {score:0,streak:0,best:0,total:0,correct:0},
    gameMistakes: {},
    dictionaryRead: {}
  });

  let state = loadState();
  let currentGrammarId = D.grammar[0]?.id;
  let currentRecall = null;
  let currentReview = null;
  let activeExam = null;
  let examTimerHandle = null;
  let deferredInstall = null;
  let currentShadow = null;
  let currentMeaningWord = null;
  let currentArticleWord = null;
  let currentListenWord = null;
  let currentSpellWord = null;
  let currentSentencePhrase = null;
  let currentSentenceBuilt = [];
  let currentSpeedWord = null;
  let gameSpeedHandle = null;
  let gameSpeedRemaining = 20;
  let extendedDictionary = null;
  const lessonVocabularyCache = {};
  let dictionaryLoading = null;
  let dictionaryPage = 1;
  let currentGamePool = [];
  let currentCaseQuestion = null;
  let memoryGameState = null;

  function loadState(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) return defaultState();
      const parsed = JSON.parse(raw);
      return {...defaultState(), ...parsed, vocab: parsed.vocab || {}, examScores: parsed.examScores || {}};
    } catch { return defaultState(); }
  }
  function saveState(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    renderMetrics();
  }
  function logActivity(type,text){
    state.activities = [{type,text,at:nowIso()}, ...(state.activities||[])].slice(0,50);
  }
  function toast(text){
    const el = $('#toast'); if(!el) return;
    el.textContent = text; el.classList.add('show');
    clearTimeout(toast._t); toast._t=setTimeout(()=>el.classList.remove('show'),2200);
  }
  function germanVoices(){
    if(!('speechSynthesis' in window)) return [];
    return speechSynthesis.getVoices().filter(v=>/^de(?:-|_)/i.test(v.lang)||/German|Deutsch/i.test(v.name));
  }
  function voiceScore(v){
    let score=0;
    if(/^de-DE$/i.test(v.lang)) score+=50; else if(/^de/i.test(v.lang)) score+=30;
    if(/natural|premium|enhanced|neural|google|microsoft/i.test(v.name)) score+=25;
    if(/katja|conrad|anna|markus|vicki|petra/i.test(v.name)) score+=8;
    if(v.localService) score+=2;
    return score;
  }
  function selectedGermanVoice(){
    const voices=germanVoices();
    return voices.find(v=>v.voiceURI===state.voiceURI) || [...voices].sort((a,b)=>voiceScore(b)-voiceScore(a))[0] || null;
  }
  function speak(text, rate=null){
    if(!('speechSynthesis' in window)){ toast('এই browser-এ German speech synthesis পাওয়া যায়নি।'); return; }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'de-DE'; u.rate = clamp(Number(rate ?? state.voiceRate ?? .9),.55,1.15); u.pitch = 1;
    const de=selectedGermanVoice(); if(de) u.voice=de;
    speechSynthesis.speak(u);
  }
  window.LernDESpeak=(text,rate)=>speak(text,rate);

  function showView(name){
    const target = $(`#view-${name}`) ? name : 'home';
    $$('.view').forEach(v=>v.classList.toggle('active',v.id===`view-${target}`));
    $$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===target));
    const button = $(`.nav-item[data-view="${target}"]`);
    $('#pageTitle').textContent = button ? button.textContent.trim() : 'LernDE';
    state.lastView = target; saveState();
    closeSidebar(); window.scrollTo({top:0,behavior:'smooth'});
    const renderers = {course:renderCourse,vocabulary:renderVocabulary,dictionary:renderDictionary,phrases:renderPhrases,grammar:renderGrammar,pronunciation:renderPronunciation,memory:renderMemory,games:renderGames,professional:renderProfessional,germany:renderGermanyLife,exam:renderExamCards,review:renderReview,mistakes:renderMistakes,progress:renderProgress};
    if(renderers[target]) renderers[target]();
  }
  function openSidebar(){ $('#sidebar').classList.add('open'); $('#sidebarBackdrop').hidden=false; }
  function closeSidebar(){ $('#sidebar').classList.remove('open'); $('#sidebarBackdrop').hidden=true; }

  function renderMetrics(){
    const completed = state.completedLessons.length;
    const known = Object.values(state.vocab).filter(x=>x.known).length;
    const due = getDueWords().length;
    const scores = Object.values(state.examScores).map(x=>x.best||0);
    const best = scores.length ? Math.max(...scores) : null;
    $('#metricLessons').textContent = `${completed} / ${D.lessons.length}`;
    $('#metricWords').textContent = `${known} / ${D.vocabulary.length}`;
    $('#metricDue').textContent = due;
    $('#metricExam').textContent = best==null?'—':`${best}%`;
    const lessonPct = D.lessons.length ? completed/D.lessons.length : 0;
    const vocabPct = D.vocabulary.length ? known/D.vocabulary.length : 0;
    const pct = Math.round((lessonPct*.6+vocabPct*.4)*100);
    $('#sideProgressText').textContent=`${pct}%`;
    $('#sideProgressBar').style.width=`${pct}%`;
  }

  async function loadLessonVocabulary(level){
    if(lessonVocabularyCache[level]) return lessonVocabularyCache[level];
    const paths={
      FOUNDATION:'assets/data/lesson-vocabulary-foundation.json',
      A1:'assets/data/lesson-vocabulary-a1.json',
      A2:'assets/data/lesson-vocabulary-a2.json',
      B1:'assets/data/lesson-vocabulary-b1.json',
      B2:'assets/data/lesson-vocabulary-b2.json'
    };
    const path=paths[level]; if(!path) return null;
    const res=await fetch(path,{cache:'force-cache'}); if(!res.ok) throw new Error('Vocabulary pack '+level+': HTTP '+res.status);
    const data=await res.json(); lessonVocabularyCache[level]=data; return data;
  }

  function renderCourse(){
    const selected = state.selectedLevel || 'FOUNDATION';
    $('#levelTabs').innerHTML = D.levels.map(l=>`<button class="level-tab ${l.id===selected?'active':''}" data-level="${l.id}">${esc(l.title)}</button>`).join('');
    const level=D.levels.find(x=>x.id===selected)||D.levels[0];
    const lessons=D.lessons.filter(x=>x.level===selected);
    const done=lessons.filter(x=>state.completedLessons.includes(x.id)).length;
    $('#levelSummary').innerHTML=`<span class="section-tag">${esc(level.badge)}</span><h3>${esc(level.title)} — ${esc(level.subtitle)}</h3><p><b>Target:</b> ${esc(level.goal)} &nbsp; • &nbsp; ${done}/${lessons.length} lesson complete</p>`;
    $('#lessonGrid').innerHTML=lessons.map(x=>{
      const isDone=state.completedLessons.includes(x.id);
      return `<button class="lesson-card ${isDone?'done':''}" data-lesson-id="${x.id}"><span class="lesson-icon">${x.icon}</span><span class="vocab-level">${x.id}</span><h3>${esc(x.title)}</h3><p>${esc(x.description)}</p><div class="lesson-meta"><span>${x.minutes} min</span><span class="${isDone?'done-badge':''}">${isDone?'✓ Complete':'Open →'}</span></div></button>`;
    }).join('');
    $$('#levelTabs .level-tab').forEach(b=>b.onclick=()=>{state.selectedLevel=b.dataset.level;saveState();renderCourse();});
    $$('#lessonGrid [data-lesson-id]').forEach(b=>b.onclick=()=>openLesson(b.dataset.lessonId));
  }

  async function openLesson(id){
    const l=D.lessons.find(x=>x.id===id); if(!l) return;
    $('#lessonModalLevel').textContent=l.id;
    $('#lessonModalTitle').textContent=l.title;
    $('#lessonModalBody').innerHTML='<div class="lesson-loading">Loading lesson…</div>';
    $('#lessonModal').hidden=false;

    let pack=null;
    try{pack=await loadLessonVocabulary(l.level);}catch(e){console.error(e);toast('Lesson vocabulary load failed.');}
    const lessonWords=pack?.lessons?.[id]||[];
    const detail=D.foundationContent?.[id]||null;

    if(detail){
      const alpha=id==='FOUNDATION-01'
        ? '<div class="lesson-content-block"><h3>🔤 German Alphabet — A–Z + Ä Ö Ü ß</h3><p class="muted">Letter card tap করলে letter name শুনবেন; example tap করলে German word শুনবেন।</p><div class="alphabet-grid">'
          +(D.foundationAlphabet||[]).map(a=>'<div class="alphabet-card"><button class="alphabet-letter speak-btn" data-say="'+esc(a.name)+'">'+esc(a.letter)+'</button><b>'+esc(a.name)+'</b><small>'+esc(a.ipa)+'</small><button class="alphabet-example speak-btn" data-say="'+esc(a.example)+'">'+esc(a.example)+'</button><span>'+esc(a.bn)+'</span></div>').join('')
          +'</div></div>'
        : '';
      const wordsHtml=lessonWords.length
        ? '<div class="lesson-content-block"><div class="lesson-block-head"><div><h3>📚 50 New Words — unique introduction</h3><p class="muted">এই lemma অন্য Foundation lesson-এ New Word হিসেবে repeat হয় না। Example/revision-এ পুরনো word পুনরায় আসতে পারে।</p></div><span class="section-tag">'+lessonWords.length+' NEW</span></div><div class="lesson-word-grid">'
          +lessonWords.map((w,i)=>'<article class="lesson-word"><span class="word-no">'+(i+1)+'</span><div><b data-german-text>'+esc(w.de)+'</b><p>'+esc(w.bn)+'</p><small>'+esc(String(w.en||'').length>110?String(w.en).slice(0,107)+'…':w.en||'')+'</small></div><button class="icon-btn speak-btn" data-say="'+esc(w.de)+'">🔊</button></article>').join('')
          +'</div></div>'
        : '<div class="mistake-box">New-word pack unavailable.</div>';
      $('#lessonModalBody').innerHTML=
        '<div class="lesson-focus"><span class="section-tag">FOUNDATION • '+l.minutes+' MIN CORE + PRACTICE</span><h3>🎯 Goal</h3><p>'+esc(detail.goal)+'</p><h4>Why this matters</h4><p>'+esc(detail.why)+'</p></div>'
        +alpha
        +'<div class="lesson-content-block"><h3>🧠 Rule / Technique</h3><div class="lesson-rule-list">'+detail.rules.map((x,i)=>'<div><b>'+(i+1)+'</b><p>'+esc(x)+'</p></div>').join('')+'</div></div>'
        +'<div class="lesson-content-block"><h3>🔊 Hear & Repeat</h3><div class="example-stack">'+detail.examples.map(x=>'<div><span data-german-text>'+esc(x)+'</span><button class="icon-btn speak-btn" data-say="'+esc(x)+'">🔊</button></div>').join('')+'</div></div>'
        +wordsHtml
        +'<div class="lesson-content-block"><h3>💬 Mini Dialogue / Drill</h3><div class="dialogue-box">'+detail.dialogue.map(x=>'<p data-german-text>'+esc(x)+'</p>').join('')+'</div><button class="ghost-btn speak-btn" data-say="'+esc(detail.dialogue.join(' '))+'">🔊 Hear full dialogue</button></div>'
        +'<div class="lesson-content-block"><h3>✅ Do it yourself</h3><ol class="task-list">'+detail.tasks.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol></div>'
        +'<div class="memory-box"><b>Study rule</b><p>সব 50 word এক session-এ মুখস্থ করবেন না। প্রথম pass-এ sound/meaning চিনুন; পরে Smart Review + Games active recall করবে।</p></div>'
        +'<button class="primary-btn block" id="completeLessonBtn">'+(state.completedLessons.includes(id)?'✓ Completed — tap to mark incomplete':'Complete lesson ✓')+'</button>';
    } else {
      const levelV=D.vocabulary.filter(x=>x.level===l.level), levelP=D.phrases.filter(x=>x.level===l.level), levelG=D.grammar.filter(x=>x.level===l.level);
      const take=(arr,count,seed)=>Array.from({length:Math.min(count,arr.length)},(_,i)=>arr[(seed+i)%arr.length]);
      const sameV=take(levelV,8,(l.order-1)*8), sameP=take(levelP,4,(l.order-1)*4), sameG=take(levelG,2,(l.order-1)*2);
      const expansionHtml=lessonWords.length
        ? '<div class="lesson-content-block"><div class="lesson-block-head"><div><h3>📚 50 New Words — Unique Vocabulary Expansion</h3><p class="muted">এই 50 lemma অন্য lesson-এ New Word হিসেবে repeat হয় না। Core lesson topic/grammar নিচের curated content; এই block vocabulary breadth বাড়ায়।</p></div><span class="section-tag">'+lessonWords.length+' NEW</span></div><div class="lesson-word-grid">'
          +lessonWords.map((w,i)=>'<article class="lesson-word"><span class="word-no">'+(i+1)+'</span><div><b data-german-text>'+esc(w.de)+'</b><p>'+esc(w.bn)+'</p><small>'+esc(String(w.en||'').length>100?String(w.en).slice(0,97)+'…':w.en||'')+'</small></div><button class="icon-btn speak-btn" data-say="'+esc(w.de)+'">🔊</button></article>').join('')
          +'</div></div>'
        : '<div class="mistake-box">Lesson vocabulary pack unavailable.</div>';
      $('#lessonModalBody').innerHTML=
        '<p class="muted">'+esc(l.description)+'</p>'
        +'<div class="lesson-content-block"><h3>🎯 Goal</h3><p>'+esc(D.levels.find(x=>x.id===l.level)?.goal||'Practice German step by step.')+'</p></div>'
        +'<div class="lesson-content-block"><h3>📚 Core lesson vocabulary</h3><div class="vocab-grid">'+sameV.map(w=>miniVocab(w)).join('')+'</div></div>'
        +expansionHtml
        +'<div class="lesson-content-block"><h3>🧩 Grammar</h3>'+sameG.map(g=>'<div class="memory-box"><b>'+esc(g.title)+'</b><p>'+esc(g.rule)+'</p><small>'+esc(g.memory)+'</small></div>').join('')+'</div>'
        +'<div class="lesson-content-block"><h3>💬 Useful patterns</h3>'+sameP.map(p=>'<div class="lesson-content-block"><b data-german-text>'+esc(p.de)+'</b><p>'+esc(p.bn)+'</p><button class="ghost-btn speak-btn" data-say="'+esc(p.de)+'">🔊</button></div>').join('')+'</div>'
        +'<div class="memory-box"><b>Vocabulary standard</b><p>Core CEFR lesson content এবং 50-word expansion আলাদা রাখা হয়েছে। Expansion bank real/source-backed reference vocabulary; exam mastery শুধু word count দিয়ে নির্ধারিত হয় না।</p></div>'
        +'<button class="primary-btn block" id="completeLessonBtn">'+(state.completedLessons.includes(id)?'✓ Completed — tap to mark incomplete':'Complete lesson ✓')+'</button>';
    }
    $$('#lessonModal .speak-btn').forEach(b=>b.onclick=()=>speak(b.dataset.say));
    window.LernDEGerman?.decorate?.($('#lessonModalBody'));
    $('#completeLessonBtn').onclick=()=>{
      const done=state.completedLessons.includes(id);
      state.completedLessons=done?state.completedLessons.filter(x=>x!==id):[...state.completedLessons,id];
      if(!done)logActivity('lesson','Completed '+id+' '+l.title);
      saveState();renderCourse();closeModal('lessonModal');toast(done?'Marked incomplete':'Lesson completed! 🎉');
    };
  }
  function miniVocab(w){
    return `<article class="vocab-card"><div class="vocab-visual">${w.emoji}</div><div class="vocab-head"><h3>${deHtml([w.article,w.de].filter(Boolean).join(' '))}</h3><button class="icon-btn speak-btn" data-say="${esc(w.de)}">🔊</button></div><p>${esc(w.bn)}</p><small>${esc(w.en)}</small></article>`;
  }

  function wordState(id){ return state.vocab[id] || {known:false,lastRating:null,interval:0,due:null,reps:0}; }
  function setWordState(id,next){ state.vocab[id]={...wordState(id),...next}; saveState(); }
  function isDue(id){ const s=wordState(id); return !!s.due && new Date(s.due)<=new Date(); }
  function getDueWords(){ return D.vocabulary.filter(w=>isDue(w.id)); }
  function scheduleWord(id,rating){
    const s=wordState(id); let interval=s.interval||0;
    if(rating==='again') interval=0;
    else if(rating==='hard') interval=Math.max(1,Math.round(interval*1.2)||1);
    else if(rating==='good') interval=interval<=1?3:Math.round(interval*2.1);
    else interval=interval<=1?7:Math.round(interval*3.2);
    const due=new Date(); due.setDate(due.getDate()+interval);
    setWordState(id,{known:rating!=='again',lastRating:rating,interval,due:due.toISOString(),reps:(s.reps||0)+1,lastReviewed:nowIso()});
  }

  async function loadExtendedDictionary(){
    if(extendedDictionary) return extendedDictionary;
    if(dictionaryLoading) return dictionaryLoading;
    dictionaryLoading=(async()=>{
      const urls=['assets/data/dictionary-01.json','assets/data/dictionary-02.json','assets/data/dictionary-03.json','assets/data/dictionary-04.json'];
      const parts=await Promise.all(urls.map(async url=>{
        const r=await fetch(url,{cache:'force-cache'});
        if(!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
        return r.json();
      }));
      extendedDictionary=parts.flat();
      if(extendedDictionary.length!==17000) console.warn('[LernDE dictionary] expected 17000, got',extendedDictionary.length);
      return extendedDictionary;
    })().finally(()=>{dictionaryLoading=null;});
    return dictionaryLoading;
  }

  function dictionaryReadMap(){
    state.dictionaryRead=state.dictionaryRead||{};
    return state.dictionaryRead;
  }
  function isDictionaryRead(id){ return !!dictionaryReadMap()[id]; }
  function setDictionaryRead(id,read){
    if(read) dictionaryReadMap()[id]=true;
    else delete dictionaryReadMap()[id];
    saveState();
  }
  async function renderDictionary(){
    const status=$('#dictStatus'), results=$('#dictResults');
    if(!status||!results) return;
    if(!extendedDictionary){
      status.textContent='17K dictionary loading…';
      results.innerHTML='<div class="card empty-state">Loading source-backed dictionary…</div>';
      try{await loadExtendedDictionary();}catch(e){
        status.textContent='Dictionary load failed.';
        results.innerHTML=`<div class="card mistake-box"><b>Load failed</b><p>${esc(e.message)}</p></div>`;
        return;
      }
    }
    const q=$('#dictSearch')?.value.trim()||'';
    const lang=$('#dictLanguage')?.value||'ALL';
    const readFilter=$('#dictReadFilter')?.value||'UNREAD';
    const pageSize=Number($('#dictPageSize')?.value||20);
    const readMap=dictionaryReadMap();
    const readCount=Object.keys(readMap).filter(id=>readMap[id]).length;
    const unreadCount=Math.max(0,extendedDictionary.length-readCount);
    $('#dictTotal').textContent=extendedDictionary.length.toLocaleString();
    $('#dictReadCount').textContent=readCount.toLocaleString();
    $('#dictUnreadCount').textContent=unreadCount.toLocaleString();

    const needle=q.toLocaleLowerCase();
    const fields=x=>lang==='DE'?[x.de]:lang==='BN'?[x.bn]:lang==='EN'?[x.en]:[x.de,x.bn,x.en];
    let list=extendedDictionary.filter(x=>{
      const read=isDictionaryRead(x.id);
      if(readFilter==='READ'&&!read) return false;
      if(readFilter==='UNREAD'&&read) return false;
      if(!needle) return true;
      return fields(x).some(v=>String(v||'').toLocaleLowerCase().includes(needle));
    });

    const total=list.length;
    const pageCount=Math.max(1,Math.ceil(total/pageSize));
    dictionaryPage=clamp(dictionaryPage,1,pageCount);
    const from=(dictionaryPage-1)*pageSize;
    const page=list.slice(from,from+pageSize);

    const filterLabel=readFilter==='READ'?'Read':readFilter==='ALL'?'All':'Unread';
    status.textContent=`${filterLabel}: ${total.toLocaleString()} word${total===1?'':'s'}${q?' • search: "'+q+'"':''} • showing ${total?from+1:0}-${Math.min(from+pageSize,total)}`;
    $('#dictPageInfo').textContent=`Page ${dictionaryPage.toLocaleString()} / ${pageCount.toLocaleString()}`;
    $('#dictPrevBtn').disabled=dictionaryPage<=1;
    $('#dictNextBtn').disabled=dictionaryPage>=pageCount;

    results.innerHTML=page.length?page.map(x=>{
      const read=isDictionaryRead(x.id);
      return `<article class="card dictionary-row ${read?'dictionary-read':''}">
        <div class="dictionary-main"><div><span class="vocab-level">${read?'READ':(x.referenceOnly?'REFERENCE':'TERM')}</span><h3 data-german-text>${esc(x.de)}</h3></div><button class="icon-btn dict-say" data-say="${esc(x.de)}">🔊</button></div>
        <p><b>বাংলা:</b> ${esc(x.bn)}</p><p class="muted"><b>English:</b> ${esc(x.en||'—')}</p>
        <div class="button-row wrap"><button class="${read?'ghost-btn':'primary-btn'} dict-read-toggle" data-dict-id="${esc(x.id)}" data-read="${read?'1':'0'}">${read?'↩ Mark Unread':'✓ Mark Read'}</button></div>
      </article>`;
    }).join(''):'<div class="card empty-state">এই filter/search-এ কোনো word নেই।</div>';

    $$('#dictResults .dict-say').forEach(b=>b.onclick=()=>speak(b.dataset.say,.88));
    $$('#dictResults .dict-read-toggle').forEach(b=>b.onclick=()=>{
      const wasRead=b.dataset.read==='1';
      setDictionaryRead(b.dataset.dictId,!wasRead);
      if(!wasRead && readFilter==='UNREAD' && page.length===1 && dictionaryPage>1) dictionaryPage--;
      renderDictionary();
    });
    window.LernDEGerman?.decorate?.(results);
  }

  function renderVocabulary(){
    ensureLevelOptions('#vocabLevel');
    const q=$('#vocabSearch').value.trim().toLowerCase(); const lev=$('#vocabLevel').value||'ALL'; const status=$('#vocabStatus').value||'ALL';
    let words=D.vocabulary.filter(w=>lev==='ALL'||w.level===lev).filter(w=>!q||[w.de,w.bn,w.en,w.bnPron,w.article,w.category].join(' ').toLowerCase().includes(q));
    words=words.filter(w=>status==='ALL'||(status==='KNOWN'&&wordState(w.id).known)||(status==='NEW'&&!state.vocab[w.id])||(status==='REVIEW'&&isDue(w.id)));
    $('#vocabCount').textContent=`${words.length}`;
    $('#vocabGrid').innerHTML=words.length?words.map(w=>{
      const s=wordState(w.id); return `<article class="vocab-card"><div class="vocab-visual">${w.emoji}</div><div class="vocab-head"><div><span class="vocab-level">${w.level}</span><h3>${deHtml([w.article,w.de].filter(Boolean).join(' '))}</h3></div><button class="icon-btn" data-say="${esc(w.de)}">🔊</button></div><p class="pron-line">${esc(w.bnPron)}</p><p>${esc(w.bn)}</p><small>${esc(w.en)}${w.plural?` • Plural: ${esc(w.plural)}`:''}</small><div class="vocab-actions"><button class="ghost-btn" data-open-word="${w.id}">Details</button><button class="${s.known?'primary-btn':'ghost-btn'}" data-toggle-known="${w.id}">${s.known?'✓ Known':'Mark known'}</button></div></article>`;
    }).join(''):'<div class="empty-state">কোনো word পাওয়া যায়নি। Filter পরিবর্তন করুন।</div>';
    $$('#vocabGrid [data-say]').forEach(b=>b.onclick=()=>speak(b.dataset.say));
    $$('#vocabGrid [data-open-word]').forEach(b=>b.onclick=()=>openWord(b.dataset.openWord));
    $$('#vocabGrid [data-toggle-known]').forEach(b=>b.onclick=()=>{const id=b.dataset.toggleKnown,s=wordState(id);setWordState(id,{known:!s.known,due:!s.known?new Date(Date.now()+86400000*3).toISOString():s.due});renderVocabulary();});
  }
  function openWord(id){
    const w=D.vocabulary.find(x=>x.id===id); if(!w) return; const s=wordState(id);
    $('#vocabModalTitle').innerHTML=deHtml([w.article,w.de].filter(Boolean).join(' '));
    $('#vocabModalBody').innerHTML=`<div class="vocab-modal-visual">${w.emoji}</div><div class="vocab-detail-grid"><div><small>German</small><br><b>${deHtml([w.article,w.de].filter(Boolean).join(' '))}</b></div><div><small>বাংলা উচ্চারণ (সহায়ক)</small><br><b>${esc(w.bnPron)}</b></div><div><small>বাংলা অর্থ</small><br><b>${esc(w.bn)}</b></div><div><small>English</small><br><b>${esc(w.en)}</b></div>${w.plural?`<div><small>Plural</small><br><b>${esc(w.plural)}</b></div>`:''}<div><small>Level</small><br><b>${w.level}</b></div></div><div class="example-box"><b>Example</b><p>${deHtml(w.example)}</p><p>${esc(w.exampleBn)}</p><button class="ghost-btn" id="wordAudioBtn">🔊 Listen</button></div><div class="memory-box"><b>🧠 Recall tip</b><p>ছবি দেখে article + German word বলুন। তারপর meaning না দেখে example sentence-এ ব্যবহার করুন।</p></div><div class="rating-row"><button data-rate="again">Again</button><button data-rate="hard">Hard</button><button data-rate="good">Good</button><button data-rate="easy">Easy</button></div><p class="muted">Status: ${s.known?'Known':'Learning'}${s.due?` • next review ${new Date(s.due).toLocaleDateString()}`:''}</p>`;
    $('#vocabModal').hidden=false; $('#wordAudioBtn').onclick=()=>speak(w.example);
    $$('#vocabModal [data-rate]').forEach(b=>b.onclick=()=>{scheduleWord(id,b.dataset.rate);closeModal('vocabModal');renderVocabulary();toast('Review schedule updated.');});
  }

  function ensureLevelOptions(sel){
    const el=$(sel); if(!el||el.dataset.ready) return;
    D.levels.forEach(l=>el.insertAdjacentHTML('beforeend',`<option value="${l.id}">${l.title}</option>`)); el.dataset.ready='1';
  }

  function renderPhrases(){
    ensureLevelOptions('#phraseLevel'); const q=$('#phraseSearch').value.trim().toLowerCase(); const lev=$('#phraseLevel').value||'ALL';
    const list=D.phrases.filter(p=>lev==='ALL'||p.level===lev).filter(p=>!q||[p.de,p.bn,p.en,p.context,p.register].join(' ').toLowerCase().includes(q));
    $('#phraseList').innerHTML=list.length?list.map(p=>`<article class="card phrase-card"><div class="phrase-top"><div><span class="section-tag">${p.level} • ${esc(p.context)}</span><h3>${deHtml(p.de)}</h3><p class="pron-line">${esc(p.bnPron)}</p></div><button class="icon-btn" data-say="${esc(p.de)}">🔊</button></div><p class="translation-line"><b>বাংলা:</b> ${esc(p.bn)}</p><p class="muted"><b>English:</b> ${esc(p.en)}</p><div class="meta-chips"><span class="chip">${esc(p.register)}</span><span class="chip">Chunk practice</span></div></article>`).join(''):'<div class="empty-state">Phrase পাওয়া যায়নি।</div>';
    $$('#phraseList [data-say]').forEach(b=>b.onclick=()=>speak(b.dataset.say));
  }

  function renderGrammar(){
    ensureLevelOptions('#grammarLevel'); const lev=$('#grammarLevel').value||'ALL';
    const list=D.grammar.filter(g=>lev==='ALL'||g.level===lev); if(!list.some(x=>x.id===currentGrammarId)) currentGrammarId=list[0]?.id;
    $('#grammarList').innerHTML=list.map(g=>`<button class="grammar-item ${g.id===currentGrammarId?'active':''}" data-gid="${g.id}"><b>${esc(g.title)}</b><small>${g.level}</small></button>`).join('');
    $$('#grammarList [data-gid]').forEach(b=>b.onclick=()=>{currentGrammarId=b.dataset.gid;renderGrammar();});
    const g=D.grammar.find(x=>x.id===currentGrammarId);
    $('#grammarDetail').innerHTML=g?`<span class="section-tag">${g.level}</span><h2>${esc(g.title)}</h2><div class="rule-box"><b>Actual rule</b><p>${esc(g.rule)}</p></div><div class="memory-box"><b>🧠 Memory tip</b><p>${esc(g.memory)}</p></div><div class="example-box"><b>✅ Example</b><p>${deHtml(g.good)}</p><button class="ghost-btn" id="grammarAudioBtn">🔊 Listen</button></div>${g.bad?`<div class="mistake-box"><b>Common mistake</b><p>❌ ${deHtml(g.bad)}</p><p>✅ ${deHtml(g.good)}</p></div>`:''}<div class="lesson-content-block"><b>Self-test</b><p>Rule না দেখে নিজের 3টি sentence বানান। একটি speaking-এ এবং একটি writing-এ ব্যবহার করুন।</p></div>`:'<div class="empty-state">এই filter-এ grammar topic নেই।</div>';
    if(g&&$('#grammarAudioBtn')) $('#grammarAudioBtn').onclick=()=>speak(g.good);
  }

  function renderPronunciation(){
    const select=$('#voiceSelect'); if(!select) return;
    const voices=germanVoices();
    select.innerHTML=voices.length?voices.sort((a,b)=>voiceScore(b)-voiceScore(a)).map(v=>`<option value="${esc(v.voiceURI)}">${esc(v.name)} — ${esc(v.lang)}</option>`).join(''):'<option value="">No German voice detected</option>';
    const chosen=selectedGermanVoice(); if(chosen){ if(!state.voiceURI) state.voiceURI=chosen.voiceURI; select.value=state.voiceURI; }
    $('#voiceRate').value=String(state.voiceRate||.9);
    const quality=$('#voiceQuality');
    if(!voices.length){quality.textContent='Not found';quality.className='danger';$('#voiceNote').textContent='Install/enable a German (de-DE) system voice for the best result.';}
    else {const score=voiceScore(chosen);quality.textContent=score>=70?'Strong de-DE':score>=45?'German voice':'German fallback';quality.className=score>=45?'success':'';$('#voiceNote').textContent=`Using: ${chosen.name} (${chosen.lang}). Device voice quality varies.`;}
    const groups=[...new Set((D.pronunciationDrills||[]).map(x=>x.group))];
    $('#pronunciationGroups').innerHTML=groups.map(g=>`<section class="pron-group"><div class="section-heading compact"><div><span class="section-tag">${esc(g)}</span><h3>${esc(g)} practice</h3></div></div><div class="pron-card-grid">${D.pronunciationDrills.filter(x=>x.group===g).map(d=>`<article class="card pron-card"><div class="pron-symbol">${esc(d.symbol)}</div><h3>${esc(d.title)}</h3><p class="pron-line">${esc(d.bn)}</p><p>${esc(d.mouth)}</p><div class="pron-examples">${d.examples.map(ex=>`<button class="ghost-btn" data-pron-say="${esc(ex)}">🔊 ${esc(ex)}</button>`).join('')}</div><div class="mistake-box"><small><b>Avoid:</b> ${esc(d.trap)}</small></div></article>`).join('')}</div></section>`).join('');
    $$('#pronunciationGroups [data-pron-say]').forEach(b=>b.onclick=()=>speak(b.dataset.pronSay,.78));
    ensureShadowLevelOptions(); if(!currentShadow) chooseShadow(); else renderShadow();
  }
  function ensureShadowLevelOptions(){
    const el=$('#shadowLevel'); if(!el||el.dataset.ready)return; D.levels.forEach(l=>el.insertAdjacentHTML('beforeend',`<option value="${l.id}">${l.title}</option>`)); el.dataset.ready='1'; el.value=state.selectedLevel||'FOUNDATION';
  }
  function chooseShadow(){
    const level=$('#shadowLevel')?.value||'FOUNDATION'; const list=(D.shadowingSets||[]).filter(x=>x.level===level); currentShadow=shuffle(list.length?list:D.shadowingSets||[])[0]||null; renderShadow();
  }
  function renderShadow(){
    if(!currentShadow)return; $('#shadowTitle').textContent=currentShadow.title; const text=$('#shadowText'); text.textContent=currentShadow.text; text.removeAttribute('data-german-ready'); text.setAttribute('data-german-text',''); window.LernDEGerman?.decorate(text); $('#shadowBn').textContent=currentShadow.bn; $('#shadowResult').textContent='1) শুনুন 2) pause করে copy করুন 3) model-এর সাথে shadow করুন 4) record করে transcript compare করুন।';
  }
  function normalizeGerman(s){return String(s||'').toLocaleLowerCase('de-DE').replace(/[^a-zäöüß\s]/g,' ').replace(/\s+/g,' ').trim();}
  function wordMatchPercent(target,heard){
    const a=normalizeGerman(target).split(' ').filter(Boolean), b=normalizeGerman(heard).split(' ').filter(Boolean); if(!a.length)return 0;
    const used=new Array(b.length).fill(false); let hit=0; for(const w of a){const j=b.findIndex((x,i)=>!used[i]&&x===w);if(j>=0){used[j]=true;hit++;}} return Math.round(hit/a.length*100);
  }
  function startRecognition(target,resultSelector){
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition, el=$(resultSelector); if(!SR){el.textContent='এই browser speech recognition support করে না। German model শুনে নিজে record করুন।';return;}
    const r=new SR();r.lang='de-DE';r.interimResults=false;r.maxAlternatives=1;el.textContent='Listening… sprechen Sie jetzt.';
    r.onresult=e=>{const heard=e.results[0][0].transcript,pct=wordMatchPercent(target,heard);el.innerHTML=`<b>Recognizer transcript:</b> ${esc(heard)}<br><b>Word match:</b> ${pct}%<br><small>এটা pronunciation score নয়; speech recognizer আপনার বলা শব্দ কতটা target হিসেবে ধরেছে তার rough feedback। Model audio-এর sound/stress নিজে compare করুন।</small>`;};
    r.onerror=e=>el.textContent=`Speech recognition error: ${e.error}`;r.start();
  }

  function gameLevel(){
    return $('#gameLevel')?.value || state.selectedLevel || 'FOUNDATION';
  }
  function gamePool(){
    if(currentGamePool.length) return currentGamePool;
    const level=gameLevel();
    const list=D.vocabulary.filter(x=>x.level===level);
    return list.length?list:D.vocabulary;
  }
  function gamePhrasePool(){
    const level=gameLevel();
    const list=D.phrases.filter(x=>x.level===level && String(x.de||'').trim().split(/\s+/).length>=3);
    return list.length?list:D.phrases.filter(x=>String(x.de||'').trim().split(/\s+/).length>=3);
  }
  function renderGameScore(){
    state.game=state.game||{score:0,streak:0,best:0,total:0,correct:0};
    if($('#gameScore'))$('#gameScore').textContent=state.game.score||0;
    if($('#gameStreak'))$('#gameStreak').textContent=state.game.streak||0;
    if($('#gameBest'))$('#gameBest').textContent=state.game.best||0;
  }
  function recordGameResult(ok,word=null){
    state.game=state.game||{score:0,streak:0,best:0,total:0,correct:0};
    state.game.total=(state.game.total||0)+1;
    if(ok){
      state.game.correct=(state.game.correct||0)+1;
      state.game.streak=(state.game.streak||0)+1;
      state.game.score=(state.game.score||0)+10+Math.min(20,(state.game.streak||0)*2);
      state.game.best=Math.max(state.game.best||0,state.game.score||0);
      if(word?.id && D.vocabulary.some(x=>x.id===word.id)){
        const s=wordState(word.id);
        setWordState(word.id,{known:s.known,lastRating:s.lastRating||'good',reps:(s.reps||0)+1});
      }
    }else{
      state.game.streak=0;
      state.game.score=Math.max(0,(state.game.score||0)-3);
      if(word?.id){
        state.gameMistakes=state.gameMistakes||{};
        state.gameMistakes[word.id]={de:word.de,bn:word.bn,en:word.en,level:word.level||gameLevel(),count:(state.gameMistakes[word.id]?.count||0)+1,lastAt:nowIso()};
        if(D.vocabulary.some(x=>x.id===word.id))scheduleWord(word.id,'hard');
        else saveState();
      }else saveState();
    }
    saveState();renderGameScore();
  }
  function resetGameRound(){
    if(gameSpeedHandle){clearInterval(gameSpeedHandle);gameSpeedHandle=null;}
    state.game={score:0,streak:0,best:state.game?.best||0,total:0,correct:0};
    saveState();renderGameScore();renderGames();
  }
  async function renderGames(){
    renderGameScore();
    const level=gameLevel();
    try{
      const pack=await loadLessonVocabulary(level);
      currentGamePool=pack?.lessons?Object.values(pack.lessons).flat().map(w=>({...w,level})):[];
    }catch(e){console.error('[LernDE game pool]',e);currentGamePool=[];}
    newMeaningGame();newListenGame();newSpellGame();newArticleGame();newSentenceGame();newSpeedGame(false);newCaseGame();newMemoryGame();
  }
  function newMeaningGame(){
    const pool=gamePool(); currentMeaningWord=shuffle(pool)[0]; if(!currentMeaningWord)return;
    const others=shuffle(pool.filter(x=>x.id!==currentMeaningWord.id&&x.bn!==currentMeaningWord.bn)).slice(0,3);
    const opts=shuffle([currentMeaningWord,...others]);
    $('#gameMeaningPrompt').innerHTML=`${deHtml([currentMeaningWord.article,currentMeaningWord.de].filter(Boolean).join(' '))} মানে কী?`;
    $('#gameMeaningOptions').innerHTML=opts.map(x=>`<button data-meaning-id="${x.id}">${esc(x.bn)}</button>`).join('');
    $$('#gameMeaningOptions [data-meaning-id]').forEach(b=>b.onclick=()=>{
      if(b.dataset.locked)return;
      const ok=b.dataset.meaningId===currentMeaningWord.id;
      $$('#gameMeaningOptions button').forEach(x=>x.dataset.locked='1');
      b.classList.add(ok?'game-correct':'game-wrong');
      if(!ok){const right=$(`#gameMeaningOptions [data-meaning-id="${currentMeaningWord.id}"]`);right?.classList.add('game-correct');}
      recordGameResult(ok,currentMeaningWord);toast(ok?'Richtig! ✓':'Correct answer দেখুন, তারপর আবার recall করুন।');
    });
  }
  function newListenGame(){
    const pool=gamePool();currentListenWord=shuffle(pool)[0];if(!currentListenWord)return;
    const others=shuffle(pool.filter(x=>x.id!==currentListenWord.id&&x.bn!==currentListenWord.bn)).slice(0,3);
    $('#gameListenOptions').innerHTML=shuffle([currentListenWord,...others]).map(x=>`<button data-listen-id="${x.id}">${esc(x.bn)}</button>`).join('');
    $('#gameListenResult').textContent='প্রথমে text না দেখে audio শুনুন।';
    $$('#gameListenOptions [data-listen-id]').forEach(b=>b.onclick=()=>{
      if(b.dataset.locked)return;
      const ok=b.dataset.listenId===currentListenWord.id;
      $$('#gameListenOptions button').forEach(x=>x.dataset.locked='1');
      b.classList.add(ok?'game-correct':'game-wrong');
      $('#gameListenResult').innerHTML=ok?'✅ Richtig':`❌ Correct: <b>${esc(currentListenWord.bn)}</b> — ${deHtml(currentListenWord.de)}`;
      recordGameResult(ok,currentListenWord);
    });
  }
  function newSpellGame(){
    const pool=gamePool();currentSpellWord=shuffle(pool)[0];if(!currentSpellWord)return;
    $('#gameSpellInput').value='';$('#gameSpellResult').textContent='Audio শুনে German spelling লিখুন।';
  }
  function checkSpellGame(){
    if(!currentSpellWord)return;
    const answer=normalizeGerman($('#gameSpellInput').value),target=normalizeGerman(currentSpellWord.de);
    const ok=answer===target;
    $('#gameSpellResult').innerHTML=ok?'✅ Richtig':`❌ Correct spelling: <b>${deHtml(currentSpellWord.de)}</b>`;
    recordGameResult(ok,currentSpellWord);
  }
  function newArticleGame(){
    const nouns=gamePool().filter(x=>['der','die','das'].includes(x.article));
    currentArticleWord=shuffle(nouns.length?nouns:D.vocabulary.filter(x=>['der','die','das'].includes(x.article)))[0];
    if(!currentArticleWord)return;
    $('#gameArticlePrompt').innerHTML=`___ ${deHtml(currentArticleWord.de)}`;$('#gameArticleResult').textContent='';
    $$('[data-article]').forEach(x=>{x.classList.remove('game-correct','game-wrong');x.disabled=false;});
  }
  function answerArticleGame(article,button){
    if(!currentArticleWord||button.disabled)return;
    const ok=article===currentArticleWord.article;
    $$('[data-article]').forEach(x=>x.disabled=true);
    button.classList.add(ok?'game-correct':'game-wrong');
    if(!ok){const right=$(`[data-article="${currentArticleWord.article}"]`);right?.classList.add('game-correct');}
    $('#gameArticleResult').innerHTML=ok?`✅ Richtig: <b>${esc(currentArticleWord.article)} ${esc(currentArticleWord.de)}</b>`:`❌ Correct: <b>${esc(currentArticleWord.article)} ${esc(currentArticleWord.de)}</b>`;
    recordGameResult(ok,currentArticleWord);
  }
  function newSentenceGame(){
    const pool=gamePhrasePool();currentSentencePhrase=shuffle(pool)[0];currentSentenceBuilt=[];if(!currentSentencePhrase)return;
    const tokens=String(currentSentencePhrase.de).trim().split(/\s+/);
    $('#gameSentenceTarget').textContent=currentSentencePhrase.bn||currentSentencePhrase.en||'Build the German sentence';
    $('#gameSentenceTokens').innerHTML=shuffle(tokens.map((text,i)=>({text,key:i+'-'+text}))).map(x=>`<button class="sentence-token" data-token="${esc(x.text)}">${esc(x.text)}</button>`).join('');
    $('#gameSentenceBuilt').innerHTML='';$('#gameSentenceResult').textContent='শব্দগুলো tap করে sentence বানান।';
    $$('#gameSentenceTokens [data-token]').forEach(b=>b.onclick=()=>{
      if(b.disabled)return;b.disabled=true;currentSentenceBuilt.push(b.dataset.token);
      const chip=document.createElement('button');chip.type='button';chip.className='sentence-token built';chip.textContent=b.dataset.token;
      chip.onclick=()=>{const idx=currentSentenceBuilt.lastIndexOf(b.dataset.token);if(idx>=0)currentSentenceBuilt.splice(idx,1);chip.remove();b.disabled=false;};
      $('#gameSentenceBuilt').appendChild(chip);
    });
  }
  function checkSentenceGame(){
    if(!currentSentencePhrase)return;
    const built=normalizeGerman(currentSentenceBuilt.join(' ')),target=normalizeGerman(currentSentencePhrase.de);
    const ok=built===target;
    $('#gameSentenceResult').innerHTML=ok?'✅ Richtig':`❌ Correct: <b>${deHtml(currentSentencePhrase.de)}</b>`;
    recordGameResult(ok,null);
  }
  function newSpeedGame(start=true){
    if(gameSpeedHandle){clearInterval(gameSpeedHandle);gameSpeedHandle=null;}
    const pool=gamePool();currentSpeedWord=shuffle(pool)[0];if(!currentSpeedWord)return;
    $('#gameSpeedPrompt').textContent=currentSpeedWord.bn;$('#gameSpeedInput').value='';$('#gameSpeedResult').textContent='';
    gameSpeedRemaining=20;$('#gameSpeedTimer').textContent=gameSpeedRemaining;
    if(!start)return;
    gameSpeedHandle=setInterval(()=>{gameSpeedRemaining--;$('#gameSpeedTimer').textContent=gameSpeedRemaining;if(gameSpeedRemaining<=0){clearInterval(gameSpeedHandle);gameSpeedHandle=null;$('#gameSpeedResult').innerHTML=`⏱ Time. Correct: <b>${deHtml(currentSpeedWord.de)}</b>`;recordGameResult(false,currentSpeedWord);}},1000);
  }
  function checkSpeedGame(){
    if(!currentSpeedWord)return;
    if(gameSpeedHandle){clearInterval(gameSpeedHandle);gameSpeedHandle=null;}
    const ok=normalizeGerman($('#gameSpeedInput').value)===normalizeGerman(currentSpeedWord.de);
    $('#gameSpeedResult').innerHTML=ok?'✅ Richtig':`❌ Correct: <b>${deHtml(currentSpeedWord.de)}</b>`;
    recordGameResult(ok,currentSpeedWord);
  }

  const CASE_BANK=[
    {level:'FOUNDATION',q:'___ Buch ist neu.',options:['Der','Die','Das'],answer:'Das',note:'Buch is neuter: das Buch.'},
    {level:'FOUNDATION',q:'___ Frau lernt Deutsch.',options:['Der','Die','Das'],answer:'Die',note:'Frau is feminine: die Frau.'},
    {level:'A1',q:'Ich sehe ___ Mann.',options:['der','den','dem'],answer:'den',note:'Direct object → Akkusativ; masculine der → den.'},
    {level:'A1',q:'Ich kaufe ___ Jacke.',options:['eine','einen','einem'],answer:'eine',note:'Jacke is feminine; Akkusativ keeps eine.'},
    {level:'A1',q:'Wir haben ___ Auto.',options:['ein','einen','einem'],answer:'ein',note:'Auto is neuter; Akkusativ keeps ein.'},
    {level:'A2',q:'Ich fahre mit ___ Bus.',options:['der','den','dem'],answer:'dem',note:'mit always takes Dativ: dem Bus.'},
    {level:'A2',q:'Ich spreche mit ___ Kollegin.',options:['die','der','den'],answer:'der',note:'mit + Dativ; feminine die → der.'},
    {level:'A2',q:'Das Buch liegt auf ___ Tisch.',options:['der','den','dem'],answer:'dem',note:'Location (wo?) with two-way preposition → Dativ.'},
    {level:'B1',q:'Das ist der Kollege, mit ___ ich arbeite.',options:['der','dem','den'],answer:'dem',note:'mit requires Dativ; relative pronoun masculine = dem.'},
    {level:'B1',q:'Wegen ___ Problems wurde der Termin verschoben.',options:['das','des','dem'],answer:'des',note:'Formal wegen commonly takes Genitiv: des Problems.'},
    {level:'B1',q:'Ich interessiere mich für ___ Stelle.',options:['die','der','dem'],answer:'die',note:'für takes Akkusativ; feminine stays die.'},
    {level:'B2',q:'Das ist das Thema, über ___ wir gesprochen haben.',options:['das','dem','dessen'],answer:'das',note:'über + sprechen uses Akkusativ; neuter relative pronoun = das.'},
    {level:'B2',q:'Der Kollege, ___ Laptop kaputt ist, arbeitet zu Hause.',options:['dessen','deren','dem'],answer:'dessen',note:'dessen = whose for masculine/neuter antecedent.'},
    {level:'B2',q:'Die Kundin, mit ___ wir verhandeln, kommt morgen.',options:['die','der','deren'],answer:'der',note:'mit + Dativ; feminine relative pronoun = der.'}
  ];
  function newCaseGame(){
    const level=gameLevel(),pool=CASE_BANK.filter(x=>x.level===level);currentCaseQuestion=shuffle(pool.length?pool:CASE_BANK)[0];if(!currentCaseQuestion)return;
    $('#gameCasePrompt').textContent=currentCaseQuestion.q;$('#gameCaseResult').textContent='Case rule চিনে answer দিন।';
    $('#gameCaseOptions').innerHTML=shuffle(currentCaseQuestion.options).map(x=>'<button data-case-answer="'+esc(x)+'">'+esc(x)+'</button>').join('');
    $$('#gameCaseOptions [data-case-answer]').forEach(b=>b.onclick=()=>{
      if(b.dataset.locked)return;const ok=b.dataset.caseAnswer===currentCaseQuestion.answer;$$('#gameCaseOptions button').forEach(x=>x.dataset.locked='1');b.classList.add(ok?'game-correct':'game-wrong');
      if(!ok){const right=[...$('#gameCaseOptions').querySelectorAll('button')].find(x=>x.dataset.caseAnswer===currentCaseQuestion.answer);right?.classList.add('game-correct');}
      $('#gameCaseResult').innerHTML=(ok?'✅ Richtig. ':'❌ Correct: <b>'+esc(currentCaseQuestion.answer)+'</b>. ')+esc(currentCaseQuestion.note);recordGameResult(ok,null);
    });
  }
  function newMemoryGame(){
    const source=shuffle(gamePool()).filter((w,i,a)=>w?.de&&w?.bn&&a.findIndex(x=>x.de===w.de)===i).slice(0,6);
    if(source.length<3){$('#gameMemoryBoard').innerHTML='<div class="empty-state">Not enough words.</div>';return;}
    const cards=shuffle(source.flatMap(w=>[{pair:w.id,side:'de',label:w.de,word:w},{pair:w.id,side:'bn',label:w.bn,word:w}]));
    memoryGameState={cards,open:[],matched:new Set(),lock:false};$('#gameMemoryResult').textContent='German ↔ বাংলা pair মিলান।';
    $('#gameMemoryBoard').innerHTML=cards.map((c,i)=>'<button class="memory-card" data-memory-index="'+i+'">?</button>').join('');
    $$('#gameMemoryBoard [data-memory-index]').forEach(b=>b.onclick=()=>flipMemoryCard(+b.dataset.memoryIndex,b));
  }
  function flipMemoryCard(index,button){
    const s=memoryGameState;if(!s||s.lock||s.matched.has(index)||s.open.some(x=>x.index===index))return;
    const card=s.cards[index];button.textContent=card.label;button.classList.add('open');s.open.push({index,button,card});if(s.open.length<2)return;
    const [a,b]=s.open;s.lock=true;
    if(a.card.pair===b.card.pair&&a.card.side!==b.card.side){
      a.button.classList.add('game-correct');b.button.classList.add('game-correct');s.matched.add(a.index);s.matched.add(b.index);s.open=[];s.lock=false;recordGameResult(true,a.card.word);
      if(s.matched.size===s.cards.length)$('#gameMemoryResult').textContent='✅ Round complete — সব pair matched.';
    }else{
      a.button.classList.add('game-wrong');b.button.classList.add('game-wrong');recordGameResult(false,a.card.word);
      setTimeout(()=>{a.button.textContent='?';b.button.textContent='?';a.button.classList.remove('open','game-wrong');b.button.classList.remove('open','game-wrong');s.open=[];s.lock=false;},650);
    }
  }

  function renderGermanyLife(){
    $('#germanyLifeList').innerHTML=(D.germanyLifeTopics||[]).map((x,i)=>`<article class="card germany-card"><span class="germany-icon">${x.icon}</span><span class="section-tag">${x.level}</span><h3>${esc(x.title)}</h3><p>${deHtml(x.de)}</p><p>${esc(x.bn)}</p><div class="memory-box"><small>${esc(x.note)}</small></div><button class="ghost-btn" data-germany-say="${i}">🔊 Listen</button></article>`).join('');
    $$('#germanyLifeList [data-germany-say]').forEach(b=>b.onclick=()=>speak(D.germanyLifeTopics[+b.dataset.germanySay].de,.88));
  }
  function renderMistakes(){
    const weak=D.vocabulary.filter(w=>['again','hard'].includes(wordState(w.id).lastRating)).map(w=>({id:w.id,de:w.de,bn:w.bn,en:w.en,label:wordState(w.id).lastRating.toUpperCase()}));
    const gameWeak=Object.entries(state.gameMistakes||{}).map(([id,x])=>({id,...x,label:'GAME ×'+(x.count||1)}));
    const all=[...weak,...gameWeak].sort((a,b)=>(b.count||0)-(a.count||0));
    $('#mistakeList').innerHTML=all.length?all.map(w=>'<article class="card phrase-card"><div class="phrase-top"><div><span class="section-tag">'+esc(w.label)+'</span><h3>'+deHtml(w.de)+'</h3><p>'+esc(w.bn||'')+' • '+esc(w.en||'')+'</p></div><button class="icon-btn" data-mistake-say="'+esc(w.id)+'">🔊</button></div><div class="button-row"><button class="ghost-btn" data-mistake-good="'+esc(w.id)+'">I know it now</button></div></article>').join(''):'<div class="card empty-state">এখনো tracked mistake নেই। Game বা Smart Revision-এ ভুল করলে এখানে আসবে।</div>';
    $$('#mistakeList [data-mistake-say]').forEach(b=>b.onclick=()=>{const core=D.vocabulary.find(x=>x.id===b.dataset.mistakeSay),extra=state.gameMistakes?.[b.dataset.mistakeSay];speak(core?.de||extra?.de||'');});
    $$('#mistakeList [data-mistake-good]').forEach(b=>b.onclick=()=>{const id=b.dataset.mistakeGood;if(D.vocabulary.some(x=>x.id===id))scheduleWord(id,'good');if(state.gameMistakes?.[id]){delete state.gameMistakes[id];saveState();}renderMistakes();});
  }

  function renderMemory(){
    $('#memoryRules').innerHTML=D.memoryRules.map((x,i)=>`<article><span class="section-tag">TIP ${i+1}</span><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></article>`).join('');
    if(!currentRecall) newRecall();
  }
  function newRecall(){
    currentRecall=shuffle(D.vocabulary)[0]; if(!currentRecall) return;
    $('#recallPrompt').innerHTML=`<span style="font-size:64px">${currentRecall.emoji}</span><br>German word + article কী?`;
    $('#recallAnswer').innerHTML=`<b>${deHtml([currentRecall.article,currentRecall.de].filter(Boolean).join(' '))}</b><br>${esc(currentRecall.bn)} • ${esc(currentRecall.en)}`; $('#recallAnswer').hidden=true;
  }

  function renderProfessional(){
    $('#professionalList').innerHTML=D.professionalTopics.map((x,i)=>`<article class="card professional-card"><div class="pro-top"><div><span class="section-tag">${x.level} • PROFESSIONAL</span><h3>${esc(x.title)}</h3></div><button class="icon-btn" data-say="${esc(x.prompt)}">🔊</button></div><p><b>Prompt:</b> ${deHtml(x.prompt)}</p><div class="rule-box"><b>Model answer</b><p>${deHtml(x.model)}</p><button class="ghost-btn" data-model="${i}">🔊 Hear model</button></div><div class="memory-box"><b>Answer pattern</b><p>${esc(x.tip)}</p></div></article>`).join('');
    $$('#professionalList [data-say]').forEach(b=>b.onclick=()=>speak(b.dataset.say));
    $$('#professionalList [data-model]').forEach(b=>b.onclick=()=>speak(D.professionalTopics[+b.dataset.model].model,.84));
  }

  function renderExamCards(){
    $('#examCards').innerHTML=D.mockExams.map(e=>{const score=state.examScores[e.id]?.best, profile=D.examProfiles?.[e.level];return `<article class="exam-card"><span class="section-tag">${e.level}</span><h3>${esc(e.title)}</h3><p>${esc(e.note)}</p>${profile?`<div class="meta-chips">${profile.skills.map(s=>`<span class="chip">${esc(s)}</span>`).join('')}</div><p class="muted">${esc(profile.focus)}</p>`:''}<div class="exam-meta"><span>⏱ ${e.minutes} min</span><span>${e.questions.length} auto-scored tasks</span></div>${score!=null?`<p class="success"><b>Best: ${score}%</b></p>`:''}<button class="primary-btn block" data-exam="${e.id}">Start mock</button></article>`}).join('');
    $$('#examCards [data-exam]').forEach(b=>b.onclick=()=>startExam(b.dataset.exam));
  }
  function startExam(id){
    const e=D.mockExams.find(x=>x.id===id); if(!e) return; activeExam={id,started:Date.now(),remaining:e.minutes*60,answers:{}};
    $('#examTag').textContent=e.level; $('#examTitle').textContent=e.title; $('#examModal').hidden=false;
    $('#examBody').innerHTML=`<p class="muted">${esc(e.note)}</p>${e.questions.map((q,i)=>`<div class="exam-question"><span class="section-tag">${esc(q.skill)}</span><h4>${i+1}. ${esc(q.q)}</h4>${q.audio?`<button class="ghost-btn" data-audio="${i}">🔊 Play listening audio</button>`:''}<div>${q.options.map((o,j)=>`<label class="exam-option"><input type="radio" name="q${i}" value="${j}"><span>${esc(o)}</span></label>`).join('')}</div></div>`).join('')}<button class="primary-btn block" id="submitExamBtn">Submit exam</button>`;
    $$('#examBody [data-audio]').forEach(b=>b.onclick=()=>speak(e.questions[+b.dataset.audio].audio,.9)); $('#submitExamBtn').onclick=submitExam;
    updateExamTimer(); clearInterval(examTimerHandle); examTimerHandle=setInterval(()=>{if(!activeExam)return;activeExam.remaining--;updateExamTimer();if(activeExam.remaining<=0){clearInterval(examTimerHandle);submitExam();}},1000);
  }
  function updateExamTimer(){ if(!activeExam)return;const m=Math.floor(activeExam.remaining/60),s=activeExam.remaining%60;$('#examTimer').textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`; }
  function submitExam(){
    if(!activeExam)return; const e=D.mockExams.find(x=>x.id===activeExam.id); let correct=0;
    e.questions.forEach((q,i)=>{const checked=$(`input[name="q${i}"]:checked`); if(checked&&+checked.value===q.answer)correct++;});
    const pct=Math.round(correct/e.questions.length*100), prev=state.examScores[e.id]?.best||0;
    state.examScores[e.id]={best:Math.max(prev,pct),last:pct,completedAt:nowIso()}; logActivity('exam',`${e.title}: ${pct}%`); saveState();
    clearInterval(examTimerHandle); examTimerHandle=null; activeExam=null;
    $('#examBody').innerHTML=`<div class="exam-result"><span class="section-tag">RESULT</span><h2>${pct}%</h2><p>${correct} / ${e.questions.length} correct</p><p>${pct>=75?'ভালো হয়েছে। এবার weak topic review করে আবার চেষ্টা করুন।':'Answer review করে grammar/vocabulary weak area practice করুন।'}</p><button class="primary-btn" id="closeExamResult">Close</button></div>`;
    $('#closeExamResult').onclick=()=>{closeModal('examModal');renderExamCards();}; renderMetrics();
  }

  function renderReview(){
    const due=getDueWords(); const known=Object.values(state.vocab).filter(x=>x.known).length; const weak=Object.values(state.vocab).filter(x=>['again','hard'].includes(x.lastRating)).length;
    $('#reviewDue').textContent=due.length; $('#reviewKnown').textContent=known; $('#reviewWeak').textContent=weak; $('#reviewDrafts').textContent=(state.writingDrafts||[]).length;
    currentReview = due[0] || shuffle(D.vocabulary.filter(w=>wordState(w.id).known))[0] || shuffle(D.vocabulary)[0];
    const w=currentReview;
    if(!w){$('#reviewCard').innerHTML='<div class="empty-state">No review items.</div>';return;}
    $('#reviewCard').innerHTML=`<div class="review-word"><span class="section-tag">${isDue(w.id)?'DUE NOW':'PRACTICE'}</span><div class="visual">${w.emoji}</div><h2>${deHtml([w.article,w.de].filter(Boolean).join(' '))}</h2><button class="ghost-btn" id="reviewAudioBtn">🔊 Listen</button><div class="answer" id="reviewAnswer" hidden><b>${esc(w.bn)}</b> • ${esc(w.en)}<br><span class="pron-line">${esc(w.bnPron)}</span></div><button class="ghost-btn" id="reviewRevealBtn">Reveal meaning</button><div class="rating-row" id="reviewRatings" hidden><button data-rate="again">Again</button><button data-rate="hard">Hard</button><button data-rate="good">Good</button><button data-rate="easy">Easy</button></div></div>`;
    $('#reviewAudioBtn').onclick=()=>speak(w.de); $('#reviewRevealBtn').onclick=()=>{$('#reviewAnswer').hidden=false;$('#reviewRatings').hidden=false;$('#reviewRevealBtn').hidden=true;};
    $$('#reviewRatings [data-rate]').forEach(b=>b.onclick=()=>{scheduleWord(w.id,b.dataset.rate);renderReview();});
  }

  function renderProgress(){
    $('#progressSummary').innerHTML=D.levels.map(l=>{const all=D.lessons.filter(x=>x.level===l.id),done=all.filter(x=>state.completedLessons.includes(x.id)).length,p=all.length?Math.round(done/all.length*100):0;return `<article class="progress-level"><span class="section-tag">${l.badge}</span><h3>${l.title}</h3><p>${done}/${all.length} lessons</p><div class="mini-bar"><span style="width:${p}%"></span></div><small>${p}% complete</small></article>`}).join('');
  }

  function translate(){
    const raw=$('#translateInput').value.trim(); const mode=$('#translationMode').value; if(!raw){$('#translateOutput').textContent='কিছু text লিখুন।';return;}
    const norm=s=>s.trim().toLowerCase().replace(/[।.!?]+$/,'').trim();
    let result=null, found=null;
    if(mode==='bn-de'){
      found=D.phrases.find(p=>norm(p.bn)===norm(raw)); if(found) result=`German: ${found.de}\nবাংলা উচ্চারণ: ${found.bnPron}\nEnglish: ${found.en}\nLevel: ${found.level} • ${found.register}`;
      else {const w=D.vocabulary.find(v=>norm(v.bn)===norm(raw));if(w){found=w;result=`German: ${[w.article,w.de].filter(Boolean).join(' ')}\nবাংলা উচ্চারণ: ${w.bnPron}\nEnglish: ${w.en}\nLevel: ${w.level}`;}}
    } else if(mode==='en-de'){
      found=D.phrases.find(p=>norm(p.en)===norm(raw)); if(found) result=`German: ${found.de}\nবাংলা: ${found.bn}\nবাংলা উচ্চারণ: ${found.bnPron}\nLevel: ${found.level}`;
      else {const w=D.vocabulary.find(v=>norm(v.en)===norm(raw));if(w){found=w;result=`German: ${[w.article,w.de].filter(Boolean).join(' ')}\nবাংলা: ${w.bn}\nLevel: ${w.level}`;}}
    } else {
      found=D.phrases.find(p=>norm(p.de)===norm(raw));
      if(found) result=mode==='de-bn'?`বাংলা: ${found.bn}\nবাংলা উচ্চারণ: ${found.bnPron}\nEnglish: ${found.en}\nContext: ${found.context}`:`English: ${found.en}\nবাংলা: ${found.bn}\nLevel: ${found.level}`;
      else {const w=D.vocabulary.find(v=>norm(v.de)===norm(raw)||norm(`${v.article} ${v.de}`)===norm(raw)); if(w){found=w; result=mode==='de-bn'?`বাংলা: ${w.bn}\nবাংলা উচ্চারণ: ${w.bnPron}\nEnglish: ${w.en}\n${w.article?`Article: ${w.article}`:''}`:`English: ${w.en}\nবাংলা: ${w.bn}\n${w.article?`Article: ${w.article}`:''}`;}}
    }
    if(!result){
      const terms=raw.split(/\s+/).map(t=>t.replace(/[,.!?;:]/g,'')); const hits=terms.map(t=>D.vocabulary.find(v=>norm(v.de)===norm(t)||norm(v.bn)===norm(t)||norm(v.en)===norm(t))).filter(Boolean);
      result=hits.length?`Exact sentence translation নেই। Known words:\n${hits.map(w=>`• ${w.de} = ${w.bn} = ${w.en}`).join('\n')}\n\nUnsupported text অনুমান করে ভুল translation দেওয়া হয়নি।`:'এই free-text/phrase curated bank-এ নেই। ভুল translation অনুমান করা হয়নি। Full unrestricted translator-এর জন্য server-side provider দরকার।';
    }
    $('#translateOutput').textContent=result;
    if(found?.de) $('#translateOutput').insertAdjacentHTML('beforeend',`<br><br><button class="ghost-btn" id="translationAudioBtn">🔊 Hear German</button>`), $('#translationAudioBtn').onclick=()=>speak(found.de);
  }

  function correctGerman(){
    const raw=$('#correctorInput').value.trim(); if(!raw){$('#correctorResult').innerHTML='<p class="muted">একটি German sentence দিন।</p>';return;}
    const hit=D.corrector.find(x=>raw.toLowerCase().includes(x.pattern.toLowerCase()));
    $('#correctorResult').innerHTML=hit?`<div class="mistake-box"><b>Known issue detected</b><p>${esc(hit.message)}</p><p>✅ ${esc(hit.example)}</p></div>`:`<div class="rule-box"><b>No known rule-pattern error detected.</b><p>এটা পূর্ণ grammar checker নয়। “No error detected” মানে sentence অবশ্যই correct—এমন দাবি করা হচ্ছে না।</p></div>`;
  }

  function renderSkillPrompts(){
    const reads=[
      'Ashraful lernt jeden Tag Deutsch, weil er in Zukunft professionell auf Deutsch kommunizieren möchte.',
      'Die neue Software wurde schrittweise eingeführt. Nach der Testphase wurden zwei Fehler behoben.',
      'Einerseits spart Homeoffice Fahrzeit, andererseits kann die direkte Kommunikation schwieriger werden.'
    ];
    $('#newReadingBtn').onclick=()=>$('#readingText').textContent=shuffle(reads)[0];$('#readingText').removeAttribute('data-german-ready');$('#readingText').setAttribute('data-german-text','');window.LernDEGerman?.decorate($('#readingText'));
    const listenTexts=['Der Termin wurde auf Freitag verschoben. Bitte bestätigen Sie die neue Uhrzeit.','Wir haben die Ursache gefunden und testen jetzt die Korrektur.','Könnten Sie bitte erläutern, welche Anforderungen heute Priorität haben?'];
    let current=listenTexts[0];
    $('#listenPracticeBtn').onclick=()=>{current=shuffle(listenTexts)[0];$('#listeningTranscript').hidden=true;speak(current,.9);};
    $('#showListeningTextBtn').onclick=()=>{const el=$('#listeningTranscript');el.textContent=current;el.hidden=false;el.removeAttribute('data-german-ready');el.setAttribute('data-german-text','');window.LernDEGerman?.decorate(el);};
    $('#saveWritingBtn').onclick=()=>{const text=$('#writingArea').value.trim();if(!text)return toast('কিছু লিখুন।');state.writingDrafts=[{text,at:nowIso()},...(state.writingDrafts||[])].slice(0,20);logActivity('writing','Saved a writing draft');saveState();toast('Draft saved locally.');};
    $('#speakModelBtn').onclick=()=>speak($('#speakingPrompt').textContent);
    $('#startSpeechBtn').onclick=startSpeechRecognition;
  }
  function startSpeechRecognition(){ startRecognition($('#speakingPrompt').textContent,'#speechResult'); }

  function closeModal(id){ const el=$(`#${id}`); if(el)el.hidden=true; if(id==='examModal'&&examTimerHandle){clearInterval(examTimerHandle);examTimerHandle=null;activeExam=null;} }
  function exportProgress(){
    const blob=new Blob([JSON.stringify({app:'LernDE',version:4,exportedAt:nowIso(),state},null,2)],{type:'application/json'}); const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`LernDE-progress-${todayKey()}.json`;a.click();URL.revokeObjectURL(a.href);
  }
  async function importProgress(file){
    try{const data=JSON.parse(await file.text());const incoming=data.state||data;if(!incoming||!Array.isArray(incoming.completedLessons))throw new Error('Invalid LernDE progress file');state={...defaultState(),...incoming,vocab:incoming.vocab||{},examScores:incoming.examScores||{}};saveState();renderAll();toast('Progress imported.');}catch(e){toast(`Import failed: ${e.message}`);}
  }
  function resetProgress(){ if(!confirm('এই device-এর LernDE progress reset করবেন?'))return;state=defaultState();saveState();renderAll();toast('Local progress reset.'); }
  function renderAll(){ renderMetrics(); renderCourse(); renderVocabulary(); renderPhrases(); renderGrammar(); renderPronunciation(); renderMemory(); renderGames(); renderProfessional(); renderGermanyLife(); renderExamCards(); renderReview(); renderMistakes(); renderProgress(); }

  function bind(){
    $$('.nav-item').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));
    $$('[data-jump]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.jump)));
    $$('[data-open-lesson]').forEach(b=>b.addEventListener('click',()=>{state.selectedLevel='FOUNDATION';saveState();closeSidebar();openLesson(b.dataset.openLesson);}));
    $('#menuBtn').onclick=openSidebar; $('#closeMenuBtn').onclick=closeSidebar; $('#sidebarBackdrop').onclick=closeSidebar;
    $$('[data-close-modal]').forEach(b=>b.onclick=()=>closeModal(b.dataset.closeModal));
    $$('.modal-backdrop').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)closeModal(m.id);}));
    $('#voiceTestBtn').onclick=()=>speak('Guten Tag. Ich heiße Ashraful Islam. Willkommen bei LernDE.');
    $('#vocabSearch').oninput=renderVocabulary; $('#dictSearch').oninput=()=>{dictionaryPage=1;renderDictionary();}; $('#dictLanguage').onchange=()=>{dictionaryPage=1;renderDictionary();}; $('#dictReadFilter').onchange=()=>{dictionaryPage=1;renderDictionary();}; $('#dictPageSize').onchange=()=>{dictionaryPage=1;renderDictionary();}; $('#dictPrevBtn').onclick=()=>{if(dictionaryPage>1){dictionaryPage--;renderDictionary();window.scrollTo({top:0,behavior:'smooth'});}}; $('#dictNextBtn').onclick=()=>{dictionaryPage++;renderDictionary();window.scrollTo({top:0,behavior:'smooth'});}; $('#dictClearBtn').onclick=()=>{$('#dictSearch').value='';dictionaryPage=1;renderDictionary();}; $('#vocabLevel').onchange=renderVocabulary; $('#vocabStatus').onchange=renderVocabulary; $('#randomVocabBtn').onclick=()=>{$('#vocabSearch').value='';$('#vocabLevel').value='ALL';renderVocabulary();const cards=$$('#vocabGrid .vocab-card');if(cards.length)cards[Math.floor(Math.random()*cards.length)].scrollIntoView({behavior:'smooth',block:'center'});};
    $('#phraseLevel').onchange=renderPhrases; $('#phraseSearch').oninput=renderPhrases; $('#grammarLevel').onchange=renderGrammar;
    $('#voiceSelect').onchange=e=>{state.voiceURI=e.target.value;saveState();renderPronunciation();speak('Guten Tag. Willkommen bei LernDE.',.9);}; $('#voiceRate').onchange=e=>{state.voiceRate=Number(e.target.value);saveState();}; $('#voiceCalibrationBtn').onclick=()=>speak('Guten Tag. Ich lerne Deutsch. Heute übe ich Aussprache, Rhythmus und Satzmelodie.',state.voiceRate);
    $('#shadowLevel').onchange=chooseShadow; $('#newShadowBtn').onclick=chooseShadow; $('#shadowSlowBtn').onclick=()=>currentShadow&&speak(currentShadow.text,.68); $('#shadowNaturalBtn').onclick=()=>currentShadow&&speak(currentShadow.text,Math.max(.88,state.voiceRate||.9)); $('#shadowRecordBtn').onclick=()=>currentShadow&&startRecognition(currentShadow.text,'#shadowResult');
    $('#gameLevel').onchange=()=>{state.selectedLevel=$('#gameLevel').value;saveState();renderGames();};
    $('#gameResetScore').onclick=resetGameRound;
    $('#gameMeaningNew').onclick=newMeaningGame;
    $('#gameListenPlay').onclick=()=>currentListenWord&&speak(currentListenWord.de,.76);
    $('#gameListenNew').onclick=newListenGame;
    $('#gameSpellPlay').onclick=()=>currentSpellWord&&speak(currentSpellWord.de,.72);
    $('#gameSpellCheck').onclick=checkSpellGame;$('#gameSpellNew').onclick=newSpellGame;
    $('#gameArticleNew').onclick=newArticleGame;$$('[data-article]').forEach(b=>b.onclick=()=>answerArticleGame(b.dataset.article,b));
    $('#gameSentenceCheck').onclick=checkSentenceGame;$('#gameSentenceNew').onclick=newSentenceGame;
    $('#gameSpeedStart').onclick=()=>newSpeedGame(true);$('#gameSpeedCheck').onclick=checkSpeedGame;
    $('#gameCaseNew').onclick=newCaseGame;$('#gameMemoryNew').onclick=newMemoryGame;
    $('#recallNewBtn').onclick=newRecall; $('#recallRevealBtn').onclick=()=>{$('#recallAnswer').hidden=false;if(currentRecall)speak(currentRecall.de);};
    $('#translateBtn').onclick=translate; $('#correctorBtn').onclick=correctGerman; $('#swapTranslateBtn').onclick=()=>{const m=$('#translationMode');const map={'bn-de':'de-bn','de-bn':'bn-de','en-de':'de-en','de-en':'en-de'};m.value=map[m.value];};
    $('#exportBtn').onclick=exportProgress; $('#importInput').onchange=e=>{if(e.target.files[0])importProgress(e.target.files[0]);e.target.value='';}; $('#resetBtn').onclick=resetProgress;
    renderSkillPrompts();
    window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;$('#installBtn').hidden=false;});
    $('#installBtn').onclick=async()=>{if(!deferredInstall)return;deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;$('#installBtn').hidden=true;};
    window.addEventListener('appinstalled',()=>{$('#installBtn').hidden=true;toast('LernDE installed.');});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')$$('.modal-backdrop:not([hidden])').forEach(m=>closeModal(m.id));});
  }

  async function init(){
    if(window.LernDEReady) await window.LernDEReady;
    bind(); ensureLevelOptions('#vocabLevel'); ensureLevelOptions('#phraseLevel'); ensureLevelOptions('#grammarLevel'); if($('#gameLevel'))$('#gameLevel').value=state.selectedLevel||'FOUNDATION'; renderAll();
    const start = $(`#view-${state.lastView}`) ? state.lastView : 'home'; showView(start);
    if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});
    speechSynthesis?.getVoices?.(); if('speechSynthesis' in window) speechSynthesis.onvoiceschanged=()=>{ if($('#view-pronunciation')?.classList.contains('active')) renderPronunciation(); };
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
