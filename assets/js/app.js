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
  function learnerName(){return String(state?.profileName||'Ashraful Islam').trim()||'Ashraful Islam';}
  function personalize(text){
    const full=learnerName(),first=full.split(/\s+/)[0]||full;
    return String(text??'').replace(/Ashraful Islam/g,full).replace(/\bAshraful\b/g,first);
  }
  function learningExampleForWord(word){
    if(word?.example)return {de:personalize(word.example),bn:word.exampleBn||'',kind:'Usage example'};
    const key=String(word?.de||'').trim().toLocaleLowerCase('de-DE');
    const curated=(D?.vocabulary||[]).find(v=>String(v.de||'').trim().toLocaleLowerCase('de-DE')===key);
    if(curated?.example)return {de:personalize(curated.example),bn:curated.exampleBn||'',kind:'Usage example'};
    return {de:'Heute lerne ich das Wort „'+String(word?.de||'')+'“.',bn:'আজ আমি “'+String(word?.bn||word?.de||'')+'” শব্দটি শিখছি।',kind:'Learning example'};
  }


  function sentencePracticeHtml(sentence,key,alt=[]){
    const text=personalize(String(sentence||'').trim()),words=text.split(/\s+/).filter(Boolean);
    if(words.length<3||words.length>24)return '';
    const alternatives=[...new Set([text,...(Array.isArray(alt)?alt:[]).map(personalize)])];
    return '<div class="sentence-practice" data-sentence-answer="'+esc(text)+'" data-sentence-alt="'+esc(alternatives.join(' || '))+'" data-sentence-key="'+esc(key||text)+'"><div class="sentence-practice-head"><span>🧩 Arrange the sentence</span><button type="button" class="icon-btn sentence-practice-audio" aria-label="Hear sentence">🔊</button></div><div class="sentence-built" data-sp-built><span class="muted">নিচের words tap করে sentence সাজান</span></div><div class="token-bank" data-sp-bank></div><div class="sentence-feedback" data-sp-feedback>সব word বসালেই automatic check হবে।</div></div>';
  }
  function normalizedPracticeSentence(v){return String(v||'').toLocaleLowerCase('de-DE').replace(/[„“"'.!?;,():]/g,'').replace(/\s+/g,' ').trim();}
  function recordSentencePractice(key,ok,answer,built){
    state.sentencePractice=state.sentencePractice||{};const s=state.sentencePractice[key]||{attempts:0,correct:0,mistakes:0};
        s.attempts++;if(ok)s.correct++;else s.mistakes++;s.answer=answer;s.lastBuilt=built;s.lastOk=ok;s.lastAt=nowIso();state.sentencePractice[key]=s;saveState();
  }
  function mountSentencePractice(box){
    if(!box||box.dataset.ready)return;box.dataset.ready='1';
    const answer=box.dataset.sentenceAnswer||'',alternatives=String(box.dataset.sentenceAlt||answer).split(' || ').filter(Boolean),key=box.dataset.sentenceKey||answer;
    const bank=box.querySelector('[data-sp-bank]'),built=box.querySelector('[data-sp-built]'),feedback=box.querySelector('[data-sp-feedback]');
    if(!bank||!built||!feedback)return;
    const tokens=shuffle(answer.split(/\s+/).map((text,i)=>({text,id:i+'-'+text})));
    bank.innerHTML=tokens.map(t=>'<button type="button" class="sentence-token" data-sp-token="'+esc(t.id)+'">'+esc(t.text)+'</button>').join('');
    const refreshPlaceholder=()=>{if(!built.querySelector('button'))built.innerHTML='<span class="muted">নিচের words tap করে sentence সাজান</span>';};
    const clearState=()=>{box.classList.remove('is-correct','is-wrong');feedback.className='sentence-feedback';feedback.textContent='সব word বসালেই automatic check হবে।';};
    const evaluate=()=>{
      const remaining=bank.querySelectorAll('button').length;if(remaining)return;
      const arranged=[...built.querySelectorAll('button')].map(b=>b.textContent).join(' '),norm=normalizedPracticeSentence(arranged);
      const ok=alternatives.some(x=>normalizedPracticeSentence(x)===norm);
      box.classList.toggle('is-correct',ok);box.classList.toggle('is-wrong',!ok);
      if(ok){feedback.className='sentence-feedback success';feedback.innerHTML='<b>'+['Richtig! 🎉','Sehr gut! 🌟','Stark! 💪','Perfekt! ✨'][Math.floor(Math.random()*4)]+'</b> Sentence order ঠিক হয়েছে।';}
      else{feedback.className='sentence-feedback danger';feedback.innerHTML='<b>Fast! 🔁</b> এই exercise-এর target order মেলেনি।<br><span>Correct: <span data-german-text>'+esc(answer)+'</span></span><br><small>Built sentence-এর কোনো word tap করে আবার সাজান।</small>';}
      const sig=arranged+'|'+ok;if(box.dataset.lastAttempt!==sig){box.dataset.lastAttempt=sig;recordSentencePractice(key,ok,answer,arranged);}
      window.LernDEGerman?.decorate?.(feedback);
    };
    const wire=btn=>{btn.onclick=()=>{
      clearState();
      if(btn.parentElement===bank){if(!built.querySelector('button'))built.innerHTML='';built.appendChild(btn);btn.classList.add('built');}
      else{bank.appendChild(btn);btn.classList.remove('built');refreshPlaceholder();}
      evaluate();
    };};
    bank.querySelectorAll('button').forEach(wire);
    const audio=box.querySelector('.sentence-practice-audio');if(audio)audio.onclick=()=>speak(answer,.88);
  }
  function activateSentencePractices(root=document){
    const boxes=[...root.querySelectorAll('.sentence-practice:not([data-ready])')];if(!boxes.length)return;
    if('IntersectionObserver' in window){
      const io=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){mountSentencePractice(e.target);io.unobserve(e.target);}});},{rootMargin:'180px'});
      boxes.forEach(b=>io.observe(b));
    }else boxes.forEach(mountSentencePractice);
  }

  const defaultState = () => ({
    version: 4,
    completedLessons: [],
    vocab: {},
    examScores: {},
    writingDrafts: [],
    activities: [],
    lastView: 'home',
    profileName: 'Ashraful Islam',
    selectedLevel: 'FOUNDATION',
    voiceURI: '',
    voiceRate: 0.9,
    game: {score:0,streak:0,best:0,total:0,correct:0},
    gameMistakes: {},
    sentencePractice: {},
    dictionaryRead: {},
    dictionaryPrefs: {status:'UNREAD',language:'ALL',entryClass:'ALL',category:'ALL',sort:'LEARNING',pageSize:15}
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
  const DICT_TOTAL=17000,DICT_CHUNK_SIZE=4250,DICT_URLS=['assets/data/dictionary-01.json','assets/data/dictionary-02.json','assets/data/dictionary-03.json','assets/data/dictionary-04.json'];
  let dictionaryChunkCache={index:-1,data:null};
  let dictionaryResultRefs=null;
  let dictionaryResultSignature='';
  let dictionarySearchSeq=0;
  const dictionaryExactCache=new Map();
  const lessonVocabularyCache = {};
  let dictionaryPage = 1;
  let dictSearchTimer = null;
  let phraseSearchTimer = null;
  let phrasePage = 1;
  let activeRecognition = null;
  let currentGameMode = 'meaning';
  let currentGamePool = [];
  let currentCaseQuestion = null;
  let memoryGameState = null;

  function normalizeState(input){
    const defaults=defaultState(),src=input&&typeof input==='object'&&!Array.isArray(input)?input:{};
    const arr=v=>Array.isArray(v)?v:[],obj=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
    const allowedViews=new Set(['home','hub','course','vocabulary','dictionary','phrases','grammar','pronunciation','games','skills','translator','professional','germany','exam','review','mistakes','progress','about']);
    const allowedStatus=new Set(['UNREAD','READ','ALL']),allowedLang=new Set(['ALL','DE','BN','EN']),allowedClass=new Set(['ALL','TERM','REFERENCE','CODE']),allowedCat=new Set(['ALL','GENERAL','WORK_TECH','HEALTH','SCIENCE','PLACE_NAME']),allowedSort=new Set(['LEARNING','AZ','ZA']);
    const p={...defaults.dictionaryPrefs,...obj(src.dictionaryPrefs)};
    p.status=allowedStatus.has(p.status)?p.status:'UNREAD';p.language=allowedLang.has(p.language)?p.language:'ALL';p.entryClass=allowedClass.has(p.entryClass)?p.entryClass:'ALL';p.category=allowedCat.has(p.category)?p.category:'ALL';p.sort=allowedSort.has(p.sort)?p.sort:'LEARNING';p.pageSize=[15,20].includes(Number(p.pageSize))?Number(p.pageSize):15;
    const completed=[...new Set(arr(src.completedLessons).filter(id=>D.lessons.some(x=>x.id===id)))];
    const selected=D.levels.some(x=>x.id===src.selectedLevel)?src.selectedLevel:'FOUNDATION';
    const legacyView=['roadmap','memory','review','mistakes','progress'].includes(src.lastView)?'hub':src.lastView;
    const profileName=typeof src.profileName==='string'&&src.profileName.trim()?src.profileName.trim().slice(0,60):defaults.profileName;
    return {...defaults,version:4,completedLessons:completed,vocab:obj(src.vocab),examScores:obj(src.examScores),writingDrafts:arr(src.writingDrafts).filter(x=>x&&typeof x.text==='string').slice(0,20),activities:arr(src.activities).filter(x=>x&&typeof x.text==='string').slice(0,50),lastView:allowedViews.has(legacyView)?legacyView:'home',profileName,selectedLevel:selected,voiceURI:typeof src.voiceURI==='string'?src.voiceURI:'',voiceRate:clamp(Number(src.voiceRate)||.9,.55,1.15),game:{...defaults.game,...obj(src.game)},gameMistakes:obj(src.gameMistakes),sentencePractice:obj(src.sentencePractice),dictionaryRead:obj(src.dictionaryRead),dictionaryPrefs:p};
  }
  function loadState(){
    try{const raw=localStorage.getItem(STORAGE_KEY);return raw?normalizeState(JSON.parse(raw)):defaultState();}catch{return defaultState();}
  }
  function saveState(){
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch(e){console.warn('[LernDE progress]',e);}
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
    return window.speechSynthesis.getVoices().filter(v=>/^de(?:-|_)/i.test(v.lang)||/German|Deutsch/i.test(v.name));
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
    window.speechSynthesis.cancel();
    const u = new window.SpeechSynthesisUtterance(text);
    u.lang = 'de-DE'; u.rate = clamp(Number(rate ?? state.voiceRate ?? .9),.55,1.15); u.pitch = 1;
    const de=selectedGermanVoice(); if(de) u.voice=de;
    window.speechSynthesis.speak(u);
  }
  window.LernDESpeak=(text,rate)=>speak(text,rate);

  function normalizedView(name){
    return ['roadmap','memory','review','mistakes','progress'].includes(name)?'hub':($(`#view-${name}`)?name:'home');
  }
  function showView(name,opts={}){
    const target=normalizedView(name),historyMode=opts.history||'push';
    $$('.view').forEach(v=>v.classList.toggle('active',v.id===`view-${target}`));
    $$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===target));
    const button=$(`.nav-item[data-view="${target}"]`);
    $('#pageTitle').textContent=button?button.textContent.trim():(target==='hub'?'Learning Hub':'LernDE');
    state.lastView=target;saveState();closeSidebar();
    if(historyMode==='push'&&history.state?.lerndeView!==target)history.pushState({lerndeView:target},'',`#${target}`);
    else if(historyMode==='replace')history.replaceState({lerndeView:target},'',`#${target}`);
    if(opts.scroll!==false)window.scrollTo({top:0,behavior:historyMode==='none'?'auto':'smooth'});
    renderView(target);
  }
  function pushModalHistory(id,detail=''){
    if(history.state?.modal===id&&history.state?.detail===detail)return;
    history.pushState({lerndeView:state.lastView,modal:id,detail},'',location.hash||`#${state.lastView}`);
  }
  function activeModal(){return $('.modal-backdrop:not([hidden])');}
  function renderView(target){
    const renderers={course:renderCourse,hub:renderLearningHub,vocabulary:renderVocabulary,dictionary:renderDictionary,phrases:renderPhrases,grammar:renderGrammar,pronunciation:renderPronunciation,games:renderGames,professional:renderProfessional,germany:renderGermanyLife,exam:renderExamCards,about:renderProfile};
    if(renderers[target])renderers[target]();
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
    const gameTotal=state.game?.total||0,gameCorrect=state.game?.correct||0,gameAccuracy=gameTotal?Math.round(gameCorrect/gameTotal*100):0;
    const sentenceItems=Object.values(state.sentencePractice||{}),sentenceAttempts=sentenceItems.reduce((n,x)=>n+(x.attempts||0),0);
    const writingDrafts=(state.writingDrafts||[]).length;
    if($('#dashCourseStat'))$('#dashCourseStat').textContent=completed+' / '+D.lessons.length+' complete';
    if($('#dashVocabStat'))$('#dashVocabStat').textContent=known+' / '+D.vocabulary.length+' known';
    if($('#dashGameStat'))$('#dashGameStat').textContent=gameTotal?(gameAccuracy+'% accuracy • '+gameTotal+' rounds'):'Start your first round';
    if($('#dashSkillsStat'))$('#dashSkillsStat').textContent=(writingDrafts||sentenceAttempts)?(writingDrafts+' writing drafts • '+sentenceAttempts+' sentence attempts'):'Reading • Listening • Writing • Speaking';
    if($('#dashReviewStat'))$('#dashReviewStat').textContent=due+' item'+(due===1?'':'s')+' due';
    if($('#dashProgressStat'))$('#dashProgressStat').textContent=pct+'% overall progress';
    if($('#todayStartBtn')){
      const nextLesson=D.lessons.find(x=>!state.completedLessons.includes(x.id))||D.lessons[0];
      $('#todayStartBtn').textContent=completed?('▶ Continue: '+(nextLesson?.title||'Course')):'▶ Start your first lesson';
      $('#todayStartBtn').onclick=()=>nextLesson&&openLesson(nextLesson.id);
    }
  }

  async function loadLessonVocabulary(level){
    if(lessonVocabularyCache[level]) return lessonVocabularyCache[level];
    const module=(window.LERNDE_MODULES?.modules||[]).find(x=>x.id===level);
    const path=module?.lessonVocabularyPath || (module?.bundled!==false?`assets/data/lesson-vocabulary-${String(level).toLowerCase()}.json`:null);
    if(!path) return null;
    const res=await fetch(path,{cache:'force-cache'}); if(!res.ok) throw new Error('Vocabulary pack '+level+': HTTP '+res.status);
    const data=await res.json(); lessonVocabularyCache[level]=data;
    window.LernDEGerman?.addEntries?.(Object.values(data.lessons||{}).flat(),'lesson',3);
    return data;
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
    $('#lessonModal').hidden=false; pushModalHistory('lessonModal',id);

    let pack=null;
    try{pack=await loadLessonVocabulary(l.level);}catch(e){console.error(e);toast('Lesson vocabulary load failed.');}
    const lessonWords=pack?.lessons?.[id]||[];
    const detail=D.foundationContent?.[id]||null;

    if(detail){
      const alpha=id==='FOUNDATION-01'
        ? '<div class="lesson-content-block"><h3>🔤 German Alphabet — A–Z + Ä Ö Ü ß</h3><p class="muted">Letter → German name → বাংলা উচ্চারণ → example → বাংলা অর্থ। Letter/example tap করলে German audio শুনবেন।</p><div class="alphabet-grid">'
          +(D.foundationAlphabet||[]).map(a=>'<div class="alphabet-card"><button class="alphabet-letter speak-btn" data-say="'+esc(a.name)+'">'+esc(a.letter)+'</button><b class="alphabet-name">'+esc(a.name)+'</b><span class="alphabet-bn-pron">/'+esc(a.bnPron||'')+'/</span><button class="alphabet-example speak-btn" data-say="'+esc(a.example)+'">'+esc(a.example)+'</button><span class="alphabet-meaning">'+esc(a.bn)+'</span><small>IPA '+esc(a.ipa)+'</small></div>').join('')
          +'</div></div>'
        : '';
      const wordsHtml=lessonWords.length
        ? '<div class="lesson-content-block"><div class="lesson-block-head"><div><h3>📚 50 Source-backed reference words</h3><p class="muted">এগুলো broad reference vocabulary। Core lesson mastery-এর বিকল্প নয়; প্রতিটি entry source-backed এবং duplicate-free রাখা হয়েছে।</p></div><span class="section-tag">'+lessonWords.length+' NEW</span></div><div class="lesson-word-grid">'
          +lessonWords.map((w,i)=>{const ex=learningExampleForWord(w);return '<article class="lesson-word"><span class="word-no">'+(i+1)+'</span><div><b data-german-text>'+esc(w.de)+'</b><p>'+esc(w.bn)+'</p><small>'+esc(String(w.en||'').length>110?String(w.en).slice(0,107)+'…':w.en||'')+'</small><div class="lesson-word-example"><span>'+esc(ex.kind)+'</span><p data-german-text>'+esc(ex.de)+'</p>'+(ex.bn?'<small>'+esc(ex.bn)+'</small>':'')+'</div>'+sentencePracticeHtml(ex.de,'lesson-word:'+id+':'+i)+'</div><button class="icon-btn speak-btn" data-say="'+esc(w.de)+'">🔊</button></article>';}).join('')
          +'</div></div>'
        : '<div class="mistake-box">New-word pack unavailable.</div>';
      $('#lessonModalBody').innerHTML=
        '<div class="lesson-focus"><span class="section-tag">FOUNDATION • '+l.minutes+' MIN CORE + PRACTICE</span><h3>🎯 Goal</h3><p>'+esc(detail.goal)+'</p><h4>Why this matters</h4><p>'+esc(detail.why)+'</p></div>'
        +alpha
        +'<div class="lesson-content-block"><h3>🧠 Rule / Technique</h3><div class="lesson-rule-list">'+detail.rules.map((x,i)=>'<div><b>'+(i+1)+'</b><p>'+esc(x)+'</p></div>').join('')+'</div></div>'
        +'<div class="lesson-content-block"><h3>🔊 Hear & Repeat</h3><div class="example-stack">'+detail.examples.map((x,i)=>'<div class="foundation-example"><div class="grammar-example-line"><span data-german-text>'+esc(x)+'</span><button class="icon-btn speak-btn" data-say="'+esc(x)+'">🔊</button></div>'+sentencePracticeHtml(x,'foundation-example:'+id+':'+i)+'</div>').join('')+'</div></div>'
        +wordsHtml
        +'<div class="lesson-content-block"><h3>💬 Mini Dialogue / Drill</h3><div class="dialogue-box">'+detail.dialogue.map((x,i)=>'<div class="dialogue-line"><p data-german-text>'+esc(x)+'</p>'+sentencePracticeHtml(x,'dialogue:'+id+':'+i)+'</div>').join('')+'</div><button class="ghost-btn speak-btn" data-say="'+esc(detail.dialogue.join(' '))+'">🔊 Hear full dialogue</button></div>'
        +'<div class="lesson-content-block"><h3>✅ Do it yourself</h3><ol class="task-list">'+detail.tasks.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol></div>'
        +'<div class="memory-box"><b>Study rule</b><p>সব 50 word এক session-এ মুখস্থ করবেন না। প্রথম pass-এ sound/meaning চিনুন; পরে Smart Review + Games active recall করবে।</p></div>'
        +'<button class="primary-btn block" id="completeLessonBtn">'+(state.completedLessons.includes(id)?'✓ Completed — tap to mark incomplete':'Complete lesson ✓')+'</button>';
    } else {
      const levelV=D.vocabulary.filter(x=>x.level===l.level), levelP=D.phrases.filter(x=>x.level===l.level), levelG=D.grammar.filter(x=>x.level===l.level);
      const take=(arr,count,seed)=>Array.from({length:Math.min(count,arr.length)},(_,i)=>arr[(seed+i)%arr.length]);
      const sameV=take(levelV,10,(l.order-1)*10), sameP=take(levelP,6,(l.order-1)*6), sameG=take(levelG,3,(l.order-1)*3);
      const expansionHtml=lessonWords.length
        ? '<div class="lesson-content-block"><div class="lesson-block-head"><div><h3>📚 50 Source-backed reference words</h3><p class="muted">এই optional block vocabulary breadth বাড়ায়। Core lesson, grammar ও practical phrase-ই primary learning target; reference list CEFR-certified word list নয়।</p></div><span class="section-tag">'+lessonWords.length+' NEW</span></div><div class="lesson-word-grid">'
          +lessonWords.map((w,i)=>{const ex=learningExampleForWord(w);return '<article class="lesson-word"><span class="word-no">'+(i+1)+'</span><div><b data-german-text>'+esc(w.de)+'</b><p>'+esc(w.bn)+'</p><small>'+esc(String(w.en||'').length>100?String(w.en).slice(0,97)+'…':w.en||'')+'</small><div class="lesson-word-example"><span>'+esc(ex.kind)+'</span><p data-german-text>'+esc(ex.de)+'</p>'+(ex.bn?'<small>'+esc(ex.bn)+'</small>':'')+'</div>'+sentencePracticeHtml(ex.de,'lesson-ref:'+id+':'+i)+'</div><button class="icon-btn speak-btn" data-say="'+esc(w.de)+'">🔊</button></article>';}).join('')
          +'</div></div>'
        : '<div class="mistake-box">Lesson vocabulary pack unavailable.</div>';
      $('#lessonModalBody').innerHTML=
        '<p class="muted">'+esc(l.description)+'</p>'
        +'<div class="lesson-content-block"><h3>🎯 Goal</h3><p>'+esc(D.levels.find(x=>x.id===l.level)?.goal||'Practice German step by step.')+'</p></div>'
        +'<div class="lesson-content-block"><h3>📚 Core lesson vocabulary</h3><div class="vocab-grid">'+sameV.map(w=>miniVocab(w)).join('')+'</div></div>'
        +expansionHtml
        +'<div class="lesson-content-block"><h3>🧩 Grammar</h3>'+sameG.map(g=>{const exs=(g.examples||[g.good]).slice(0,3);return '<div class="memory-box"><b>'+esc(g.title)+'</b><p>'+esc(g.rule)+'</p>'+exs.map((ex,i)=>'<div class="lesson-inline-example"><small>Example '+(i+1)+'</small><p data-german-text>'+esc(personalize(ex))+'</p>'+sentencePracticeHtml(ex,'lesson-grammar:'+id+':'+g.id+':'+i)+'</div>').join('')+'<small>'+esc(g.memory)+'</small></div>';}).join('')+'</div>'
        +'<div class="lesson-content-block"><h3>💬 Useful patterns</h3>'+sameP.map(p=>'<div class="lesson-content-block"><b data-german-text>'+esc(personalize(p.de))+'</b><p>'+esc(p.bn)+'</p><button class="ghost-btn speak-btn" data-say="'+esc(personalize(p.de))+'">🔊</button>'+sentencePracticeHtml(p.de,'lesson-phrase:'+id+':'+p.id)+'</div>').join('')+'</div>'
        +'<div class="memory-box"><b>Vocabulary standard</b><p>Core lesson content এবং broad reference vocabulary আলাদা। Reference entries source-backed; level mastery lesson outcomes, grammar, phrases, listening, speaking, writing এবং review দিয়ে বিচার করুন।</p></div>'
        +'<button class="primary-btn block" id="completeLessonBtn">'+(state.completedLessons.includes(id)?'✓ Completed — tap to mark incomplete':'Complete lesson ✓')+'</button>';
    }
    $$('#lessonModal .speak-btn').forEach(b=>b.onclick=()=>speak(b.dataset.say));
    window.LernDEGerman?.decorate?.($('#lessonModalBody'));activateSentencePractices($('#lessonModalBody'));
    $('#completeLessonBtn').onclick=()=>{
      const done=state.completedLessons.includes(id);
      state.completedLessons=done?state.completedLessons.filter(x=>x!==id):[...state.completedLessons,id];
      if(!done)logActivity('lesson','Completed '+id+' '+l.title);
      saveState();renderCourse();closeModal('lessonModal');toast(done?'Marked incomplete':'Lesson completed! 🎉');
    };
  }
  function miniVocab(w){
    const ex=learningExampleForWord(w);
    return `<article class="vocab-card"><div class="vocab-visual">${w.emoji}</div><div class="vocab-head"><h3>${deHtml([w.article,w.de].filter(Boolean).join(' '))}</h3><button class="icon-btn speak-btn" data-say="${esc(w.de)}">🔊</button></div><p>${esc(w.bn)}</p><small>${esc(w.en)}</small><div class="vocab-card-example"><span>${esc(ex.kind)}</span><p data-german-text>${esc(ex.de)}</p>${ex.bn?`<small>${esc(ex.bn)}</small>`:''}</div>${sentencePracticeHtml(ex.de,'mini-vocab:'+w.id)}</article>`;
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

  async function loadDictionaryChunk(index,{retain=true}={}){
    if(index<0||index>=DICT_URLS.length)return [];
    if(retain&&dictionaryChunkCache.index===index&&dictionaryChunkCache.data)return dictionaryChunkCache.data;
    const r=await fetch(DICT_URLS[index],{cache:'force-cache'});if(!r.ok)throw new Error(DICT_URLS[index]+': HTTP '+r.status);
    const data=await r.json();
    if(retain)dictionaryChunkCache={index,data};
    return data;
  }
  async function lookupDictionaryExact(field,value){
    const key=String(value||'').trim().toLocaleLowerCase(field==='de'?'de-DE':undefined);
    if(!key)return null;
    const cacheKey=field+'|'+key;if(dictionaryExactCache.has(cacheKey))return dictionaryExactCache.get(cacheKey);
    for(let i=0;i<DICT_URLS.length;i++){
      const part=await loadDictionaryChunk(i,{retain:false});
      const hit=part.find(x=>String(x[field]||'').trim().toLocaleLowerCase(field==='de'?'de-DE':undefined)===key)||null;
      if(hit){dictionaryExactCache.set(cacheKey,hit);if(dictionaryExactCache.size>200)dictionaryExactCache.delete(dictionaryExactCache.keys().next().value);return hit;}
    }
    dictionaryExactCache.set(cacheKey,null);return null;
  }
  window.LernDELookupExternal=async word=>{try{const x=await lookupDictionaryExact('de',word);return x?{de:x.de,bn:x.bn,en:x.en,source:x.source||'dictionary'}:null;}catch{return null;}};

  function dictionaryKey(v){return String(v||'').trim().toLocaleLowerCase('de-DE');}
  function dictionaryReadMap(){state.dictionaryRead=state.dictionaryRead||{};return state.dictionaryRead;}
  function isDictionaryRead(id){return !!dictionaryReadMap()[id];}
  function setDictionaryRead(id,read){if(read)dictionaryReadMap()[id]={readAt:nowIso()};else delete dictionaryReadMap()[id];dictionaryResultSignature='';saveState();}
  function dictionaryEntryClass(x){
    const de=String(x.de||'').trim();
    if(/^\.|^\d|^[A-Z0-9._-]{2,}$/.test(de))return 'CODE';
    if(x.referenceOnly)return 'REFERENCE';
    return 'TERM';
  }
  function dictionaryCategory(x){
    const t=[x.de,x.en,x.bn].join(' ').toLowerCase();
    if(/software|computer|internet|data|database|algorithm|program|digital|network|server|web|technology|api|code|informatik|technik/.test(t))return 'WORK_TECH';
    if(/health|disease|medicine|medical|doctor|hospital|anatom|syndrome|virus|bacteria|krank|arzt|medizin|রোগ|চিকিৎস|ডাক্তার|স্বাস্থ্য/.test(t))return 'HEALTH';
    if(/physics|chem|biology|mathemat|geometry|astronom|particle|acid|protein|gene|science|wissenschaft|physik|chemie|biologie|গণিত|পদার্থ|রসায়ন|জীববিজ্ঞান/.test(t))return 'SCIENCE';
    if(/river|lake|mountain|city|town|village|district|province|country|island|airport|person|surname|given name|actor|writer|king|queen|politician|নদী|শহর|গ্রাম|জেলা|দেশ|দ্বীপ|অভিনেতা|লেখক/.test(t))return 'PLACE_NAME';
    return 'GENERAL';
  }
  function dictionaryExample(x){
    const key=dictionaryKey(x.de),curated=D.vocabulary.find(v=>dictionaryKey(v.de)===key);
    if(curated?.example)return {de:personalize(curated.example),bn:curated.exampleBn||'',kind:'Usage example'};
    return {de:'Heute lerne ich das Wort „'+String(x.de||'')+'“.',bn:'আজ আমি “'+String(x.bn||x.de||'')+'” শব্দটি শিখছি।',kind:'Learning example'};
  }
  function dictionaryGlobalId(globalIndex){return 'ext-'+String(globalIndex+1).padStart(5,'0');}
  function dictionaryGlobalIndex(id){const n=Number(String(id||'').replace(/^ext-/,''));return Number.isInteger(n)&&n>=1&&n<=DICT_TOTAL?n-1:-1;}
  function syncDictionaryControls(){
    const p=state.dictionaryPrefs||defaultState().dictionaryPrefs;
    if($('#dictLanguage'))$('#dictLanguage').value=p.language||'ALL';
    if($('#dictEntryClass'))$('#dictEntryClass').value=p.entryClass||'ALL';
    if($('#dictCategory'))$('#dictCategory').value=p.category||'ALL';
    if($('#dictSort'))$('#dictSort').value=p.sort||'LEARNING';
    if($('#dictPageSize'))$('#dictPageSize').value=String(p.pageSize||15);
    $$('.dictionary-status-tabs [data-dict-status]').forEach(b=>b.classList.toggle('active',b.dataset.dictStatus===(p.status||'UNREAD')));
  }
  function saveDictionaryControls(){
    state.dictionaryPrefs={...(state.dictionaryPrefs||{}),language:$('#dictLanguage')?.value||'ALL',entryClass:$('#dictEntryClass')?.value||'ALL',category:$('#dictCategory')?.value||'ALL',sort:$('#dictSort')?.value||'LEARNING',pageSize:Number($('#dictPageSize')?.value||15)};
    dictionaryResultSignature='';saveState();
  }
  function basicDictionaryRefs(status){
    const readSet=new Set(Object.keys(dictionaryReadMap()).map(dictionaryGlobalIndex).filter(x=>x>=0));
    if(status==='READ')return [...readSet].sort((a,b)=>a-b);
    const refs=[];for(let i=0;i<DICT_TOTAL;i++)if(status==='ALL'||!readSet.has(i))refs.push(i);return refs;
  }
  async function buildDictionaryRefs(p,q,seq){
    const signature=JSON.stringify([p.status,p.language,p.entryClass,p.category,p.sort,q,Object.keys(dictionaryReadMap()).sort()]);
    if(signature===dictionaryResultSignature&&dictionaryResultRefs)return dictionaryResultRefs;
    const simple=!q&&p.entryClass==='ALL'&&p.category==='ALL'&&p.sort==='LEARNING';
    if(simple){dictionaryResultRefs=basicDictionaryRefs(p.status);dictionaryResultSignature=signature;return dictionaryResultRefs;}
    const matches=[];
    for(let c=0;c<DICT_URLS.length;c++){
      const part=await loadDictionaryChunk(c,{retain:false});if(seq!==dictionarySearchSeq)return null;
      for(let j=0;j<part.length;j++){
        const x=part[j],global=c*DICT_CHUNK_SIZE+j,read=isDictionaryRead(x.id);
        if(p.status==='READ'&&!read)continue;if(p.status==='UNREAD'&&read)continue;
        const cls=dictionaryEntryClass(x),cat=dictionaryCategory(x);
        if(p.entryClass!=='ALL'&&cls!==p.entryClass)continue;if(p.category!=='ALL'&&cat!==p.category)continue;
        if(q){
          const vals=p.language==='DE'?[x.de]:p.language==='BN'?[x.bn]:p.language==='EN'?[x.en]:[x.de,x.bn,x.en];
          if(!vals.some(v=>String(v||'').toLocaleLowerCase(p.language==='DE'?'de-DE':undefined).includes(q)))continue;
        }
        matches.push({index:global,de:String(x.de||'')});
      }
      await new Promise(r=>setTimeout(r,0));
    }
    if(p.sort==='AZ')matches.sort((a,b)=>a.de.localeCompare(b.de,'de',{sensitivity:'base'}));
    else if(p.sort==='ZA')matches.sort((a,b)=>b.de.localeCompare(a.de,'de',{sensitivity:'base'}));
    dictionaryResultRefs=matches.map(x=>x.index);dictionaryResultSignature=signature;return dictionaryResultRefs;
  }
  async function dictionaryEntriesForRefs(refs){
    const grouped=new Map();refs.forEach((g,pos)=>{const c=Math.floor(g/DICT_CHUNK_SIZE);if(!grouped.has(c))grouped.set(c,[]);grouped.get(c).push({g,pos,local:g%DICT_CHUNK_SIZE});});
    const out=new Array(refs.length);
    for(const [c,items] of grouped){const part=await loadDictionaryChunk(c,{retain:true});for(const it of items)out[it.pos]={...part[it.local],_global:it.g};}
    return out.filter(Boolean);
  }
  async function renderDictionary(){
    const status=$('#dictStatus'),results=$('#dictResults'),pager=$('#dictPager');if(!status||!results||!pager)return;
    syncDictionaryControls();const p=state.dictionaryPrefs||defaultState().dictionaryPrefs;
    const q=($('#dictSearch')?.value||'').trim().toLocaleLowerCase(p.language==='DE'?'de-DE':undefined),seq=++dictionarySearchSeq;
    const readCount=Object.keys(dictionaryReadMap()).filter(id=>dictionaryGlobalIndex(id)>=0).length;
    $('#dictTotal').textContent=DICT_TOTAL.toLocaleString();$('#dictReadCount').textContent=readCount.toLocaleString();$('#dictUnreadCount').textContent=(DICT_TOTAL-readCount).toLocaleString();
    status.innerHTML='<div class="dictionary-status-line"><b>Loading only what you need…</b><span>Low-memory mode</span></div>';
    results.innerHTML='<div class="card empty-state">Dictionary page preparing…</div>';pager.innerHTML='';
    try{
      const refs=await buildDictionaryRefs(p,q,seq);if(!refs||seq!==dictionarySearchSeq)return;
      const pageSize=[15,20].includes(Number(p.pageSize))?Number(p.pageSize):15,pageCount=Math.max(1,Math.ceil(refs.length/pageSize));dictionaryPage=clamp(dictionaryPage,1,pageCount);
      const from=(dictionaryPage-1)*pageSize,pageRefs=refs.slice(from,from+pageSize),page=await dictionaryEntriesForRefs(pageRefs);if(seq!==dictionarySearchSeq)return;
      status.innerHTML='<div class="dictionary-status-line"><b>'+refs.length.toLocaleString()+' matching</b><span>Showing '+(refs.length?from+1:0).toLocaleString()+'–'+Math.min(from+pageSize,refs.length).toLocaleString()+'</span><span>Page '+dictionaryPage+' / '+pageCount+'</span><span>Only current data chunk stays in RAM</span></div>';
      results.innerHTML=page.length?page.map((x,i)=>{
        const read=isDictionaryRead(x.id),entryClass=dictionaryEntryClass(x),category=dictionaryCategory(x),example=dictionaryExample(x);
        return '<article class="card dictionary-row '+(read?'dictionary-read':'')+'"><div class="dictionary-main"><div class="dictionary-title-wrap"><span class="dict-index">'+(from+i+1)+'</span><div><div class="meta-chips"><span class="chip">'+esc(entryClass)+'</span><span class="chip">'+esc(category.replace('_',' & '))+'</span>'+(read?'<span class="chip read-chip">READ ✓</span>':'')+'</div><h3 data-german-text>'+esc(x.de)+'</h3></div></div><button class="icon-btn dict-say" data-say="'+esc(x.de)+'">🔊</button></div><div class="dictionary-meaning-grid"><p><b>বাংলা</b><span>'+esc(x.bn)+'</span></p><p><b>English</b><span>'+esc(x.en||'—')+'</span></p></div><div class="dictionary-example"><small>'+esc(example.kind)+'</small><p data-german-text>'+esc(example.de)+'</p>'+(example.bn?'<span>'+esc(example.bn)+'</span>':'')+'</div>'+sentencePracticeHtml(example.de,'dict:'+x.id)+'<div class="dictionary-actions"><button class="ghost-btn dict-example-say" data-say="'+esc(example.de)+'">🔊 Example</button>'+(read?'<button class="ghost-btn" data-dict-unread="'+esc(x.id)+'">↩ Mark unread</button>':'<button class="primary-btn" data-dict-read="'+esc(x.id)+'">Read ✓</button>')+'</div></article>';
      }).join(''):'<div class="card empty-state">এই filter/search-এ কোনো word নেই।</div>';
      pager.innerHTML=refs.length?'<button class="ghost-btn" id="dictFirstPage" '+(dictionaryPage===1?'disabled':'')+'>« First</button><button class="ghost-btn" id="dictPrevPage" '+(dictionaryPage===1?'disabled':'')+'>‹ Prev</button><span>Page <b>'+dictionaryPage+'</b> of <b>'+pageCount+'</b></span><button class="ghost-btn" id="dictNextPage" '+(dictionaryPage===pageCount?'disabled':'')+'>Next ›</button><button class="ghost-btn" id="dictLastPage" '+(dictionaryPage===pageCount?'disabled':'')+'>Last »</button>':'';
      $$('#dictResults .dict-say,#dictResults .dict-example-say').forEach(b=>b.onclick=()=>speak(b.dataset.say,.88));
      $$('#dictResults [data-dict-read]').forEach(b=>b.onclick=()=>{setDictionaryRead(b.dataset.dictRead,true);renderDictionary();});
      $$('#dictResults [data-dict-unread]').forEach(b=>b.onclick=()=>{setDictionaryRead(b.dataset.dictUnread,false);renderDictionary();});
      if($('#dictFirstPage'))$('#dictFirstPage').onclick=()=>{dictionaryPage=1;renderDictionary();};
      if($('#dictPrevPage'))$('#dictPrevPage').onclick=()=>{dictionaryPage=Math.max(1,dictionaryPage-1);renderDictionary();};
      if($('#dictNextPage'))$('#dictNextPage').onclick=()=>{dictionaryPage=Math.min(pageCount,dictionaryPage+1);renderDictionary();};
      if($('#dictLastPage'))$('#dictLastPage').onclick=()=>{dictionaryPage=pageCount;renderDictionary();};
      window.LernDEGerman?.decorate?.(results);activateSentencePractices(results);
    }catch(e){if(seq!==dictionarySearchSeq)return;status.textContent='Dictionary load failed.';results.innerHTML='<div class="card mistake-box"><b>Load failed</b><p>'+esc(e.message)+'</p></div>';}
  }

  function renderVocabulary(){
    ensureLevelOptions('#vocabLevel');
    const q=$('#vocabSearch').value.trim().toLowerCase(); const lev=$('#vocabLevel').value||'ALL'; const status=$('#vocabStatus').value||'ALL';
    let words=D.vocabulary.filter(w=>lev==='ALL'||w.level===lev).filter(w=>!q||[w.de,w.bn,w.en,w.bnPron,w.article,w.category].join(' ').toLowerCase().includes(q));
    words=words.filter(w=>status==='ALL'||(status==='KNOWN'&&wordState(w.id).known)||(status==='NEW'&&!state.vocab[w.id])||(status==='REVIEW'&&isDue(w.id)));
    $('#vocabCount').textContent=`${words.length}`;
    $('#vocabGrid').innerHTML=words.length?words.map(w=>{
      const s=wordState(w.id),ex=learningExampleForWord(w); return `<article class="vocab-card"><div class="vocab-visual">${w.emoji}</div><div class="vocab-head"><div><span class="vocab-level">${w.level}</span><h3>${deHtml([w.article,w.de].filter(Boolean).join(' '))}</h3></div><button class="icon-btn" data-say="${esc(w.de)}">🔊</button></div><p class="pron-line">${esc(w.bnPron)}</p><p>${esc(w.bn)}</p><small>${esc(w.en)}${w.plural?` • Plural: ${esc(w.plural)}`:''}</small><div class="vocab-card-example"><span>${esc(ex.kind)}</span><p data-german-text>${esc(ex.de)}</p>${ex.bn?`<small>${esc(ex.bn)}</small>`:''}</div>${sentencePracticeHtml(ex.de,'vocab:'+w.id)}<div class="vocab-actions"><button class="ghost-btn" data-open-word="${w.id}">Details</button><button class="${s.known?'primary-btn':'ghost-btn'}" data-toggle-known="${w.id}">${s.known?'✓ Known':'Mark known'}</button></div></article>`;
    }).join(''):'<div class="empty-state">কোনো word পাওয়া যায়নি। Filter পরিবর্তন করুন।</div>';
    $$('#vocabGrid [data-say]').forEach(b=>b.onclick=()=>speak(b.dataset.say));
    $$('#vocabGrid [data-open-word]').forEach(b=>b.onclick=()=>openWord(b.dataset.openWord));
    $$('#vocabGrid [data-toggle-known]').forEach(b=>b.onclick=()=>{const id=b.dataset.toggleKnown,s=wordState(id);setWordState(id,{known:!s.known,due:!s.known?new Date(Date.now()+86400000*3).toISOString():s.due});renderVocabulary();});activateSentencePractices($('#vocabGrid'));
  }
  function openWord(id){
    const w=D.vocabulary.find(x=>x.id===id); if(!w) return; const s=wordState(id);
    $('#vocabModalTitle').innerHTML=deHtml([w.article,w.de].filter(Boolean).join(' '));
    $('#vocabModalBody').innerHTML=`<div class="vocab-modal-visual">${w.emoji}</div><div class="vocab-detail-grid"><div><small>German</small><br><b>${deHtml([w.article,w.de].filter(Boolean).join(' '))}</b></div><div><small>বাংলা উচ্চারণ (সহায়ক)</small><br><b>${esc(w.bnPron)}</b></div><div><small>বাংলা অর্থ</small><br><b>${esc(w.bn)}</b></div><div><small>English</small><br><b>${esc(w.en)}</b></div>${w.plural?`<div><small>Plural</small><br><b>${esc(w.plural)}</b></div>`:''}<div><small>Level</small><br><b>${w.level}</b></div></div><div class="example-box"><b>Example</b><p>${deHtml(personalize(w.example))}</p><p>${esc(w.exampleBn)}</p><button class="ghost-btn" id="wordAudioBtn">🔊 Listen</button></div>${sentencePracticeHtml(personalize(w.example),'vocab-detail:'+w.id)}<div class="memory-box"><b>🧠 Recall tip</b><p>ছবি দেখে article + German word বলুন। তারপর meaning না দেখে example sentence-এ ব্যবহার করুন।</p></div><div class="rating-row"><button data-rate="again">Again</button><button data-rate="hard">Hard</button><button data-rate="good">Good</button><button data-rate="easy">Easy</button></div><p class="muted">Status: ${s.known?'Known':'Learning'}${s.due?` • next review ${new Date(s.due).toLocaleDateString()}`:''}</p>`;
    $('#vocabModal').hidden=false; pushModalHistory('vocabModal',id); $('#wordAudioBtn').onclick=()=>speak(personalize(w.example));
    $$('#vocabModal [data-rate]').forEach(b=>b.onclick=()=>{scheduleWord(id,b.dataset.rate);closeModal('vocabModal');renderVocabulary();toast('Review schedule updated.');});activateSentencePractices($('#vocabModalBody'));
  }

  function ensureLevelOptions(sel){
    const el=$(sel); if(!el||el.dataset.ready) return;
    D.levels.forEach(l=>el.insertAdjacentHTML('beforeend',`<option value="${l.id}">${l.title}</option>`)); el.dataset.ready='1';
  }

  function renderPhrases(){
    ensureLevelOptions('#phraseLevel');
    const q=($('#phraseSearch')?.value||'').trim().toLocaleLowerCase(),lev=$('#phraseLevel')?.value||'ALL';
    const all=D.phrases.filter(p=>lev==='ALL'||p.level===lev).filter(p=>!q||[p.de,p.bn,p.en,p.context,p.register].join(' ').toLocaleLowerCase().includes(q));
    const pageSize=24,pageCount=Math.max(1,Math.ceil(all.length/pageSize));phrasePage=clamp(phrasePage,1,pageCount);
    const from=(phrasePage-1)*pageSize,list=all.slice(from,from+pageSize);
    if($('#phraseCount'))$('#phraseCount').textContent=all.length.toLocaleString()+' phrases';
    $('#phraseList').innerHTML=list.length?list.map(p=>'<article class="card phrase-card"><div class="phrase-top"><div><span class="section-tag">'+esc(p.level)+' • '+esc(p.context)+'</span><h3>'+deHtml(personalize(p.de))+'</h3><p class="pron-line">'+esc(p.bnPron)+'</p></div><button class="icon-btn" data-say="'+esc(personalize(p.de))+'">🔊</button></div><p class="translation-line"><b>বাংলা:</b> '+esc(p.bn)+'</p><p class="muted"><b>English:</b> '+esc(p.en)+'</p><div class="meta-chips"><span class="chip">'+esc(p.register)+'</span><span class="chip">Verified chunk</span></div></article>').join(''):'<div class="empty-state">Phrase পাওয়া যায়নি।</div>';
    if($('#phrasePager'))$('#phrasePager').innerHTML=all.length?'<button class="ghost-btn" id="phrasePrev" '+(phrasePage===1?'disabled':'')+'>‹ Prev</button><span>Page <b>'+phrasePage+'</b> / <b>'+pageCount+'</b></span><button class="ghost-btn" id="phraseNext" '+(phrasePage===pageCount?'disabled':'')+'>Next ›</button>':'';
    $$('#phraseList [data-say]').forEach(b=>b.onclick=()=>speak(b.dataset.say));
    if($('#phrasePrev'))$('#phrasePrev').onclick=()=>{phrasePage=Math.max(1,phrasePage-1);renderPhrases();};
    if($('#phraseNext'))$('#phraseNext').onclick=()=>{phrasePage=Math.min(pageCount,phrasePage+1);renderPhrases();};activateSentencePractices($('#phraseList'));
  }

  function renderGrammar(){
    ensureLevelOptions('#grammarLevel');
    const lev=$('#grammarLevel')?.value||'ALL',q=($('#grammarSearch')?.value||'').trim().toLocaleLowerCase();
    const list=D.grammar.filter(g=>lev==='ALL'||g.level===lev).filter(g=>!q||[g.title,g.rule,g.memory,g.good,g.bad,g.note].join(' ').toLocaleLowerCase().includes(q));
    if($('#grammarCount'))$('#grammarCount').textContent=list.length+' rule'+(list.length===1?'':'s');
    if(!list.some(x=>x.id===currentGrammarId))currentGrammarId=list[0]?.id||null;
    $('#grammarList').innerHTML=list.length?list.map(g=>'<button class="grammar-item '+(g.id===currentGrammarId?'active':'')+'" data-gid="'+esc(g.id)+'"><span class="section-tag">'+esc(g.level)+'</span><b>'+esc(g.title)+'</b><small>'+esc(g.rule)+'</small></button>').join(''):'<div class="empty-state">এই search/filter-এ grammar rule পাওয়া যায়নি।</div>';
    $$('#grammarList [data-gid]').forEach(b=>b.onclick=()=>{currentGrammarId=b.dataset.gid;renderGrammar();});
    const g=D.grammar.find(x=>x.id===currentGrammarId);
    if(!g){$('#grammarDetail').innerHTML='<div class="empty-state">একটি grammar rule নির্বাচন করুন।</div>';return;}
    const examples=(Array.isArray(g.examples)&&g.examples.length?g.examples:String(g.good||'').split(/\s+\/\s+/)).map(x=>personalize(String(x).trim())).filter(Boolean).slice(0,5);
    $('#grammarDetail').innerHTML='<div class="grammar-detail-head"><div><span class="section-tag">'+esc(g.level)+'</span><h2>'+esc(g.title)+'</h2></div><button class="ghost-btn" id="grammarPrimaryAudio">🔊 Hear example</button></div><div class="rule-box"><b>Actual rule</b><p>'+esc(g.rule)+'</p></div><div class="example-box"><b>✅ Example sentence'+(examples.length>1?'s':'')+'</b><div class="grammar-example-list">'+examples.map((ex,i)=>'<div class="grammar-example-item"><div class="grammar-example-line"><p data-german-text>'+esc(ex)+'</p><button class="icon-btn" data-grammar-example="'+i+'">🔊</button></div>'+sentencePracticeHtml(ex,'grammar:'+g.id+':'+i)+'</div>').join('')+'</div></div><div class="memory-box"><b>🧠 Memory tip</b><p>'+esc(g.memory)+'</p></div>'+(g.bad?'<div class="mistake-box"><b>Common mistake</b><p>❌ '+deHtml(g.bad)+'</p><p>✅ '+deHtml(g.good)+'</p></div>':'')+(g.note?'<div class="lesson-content-block"><b>Note</b><p>'+esc(g.note)+'</p></div>':'')+'<div class="lesson-content-block"><b>Self-test</b><p>Rule না দেখে নিজের 3টি German sentence বানান। অন্তত একটি sentence উচ্চারণ করে বলুন।</p></div>';
    $('#grammarPrimaryAudio').onclick=()=>speak(examples[0]||g.good,.88);
    $$('#grammarDetail [data-grammar-example]').forEach(b=>b.onclick=()=>speak(examples[+b.dataset.grammarExample]||g.good,.88));
    window.LernDEGerman?.decorate?.($('#grammarDetail'));activateSentencePractices($('#grammarDetail'));
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
  function stopRecognition(){
    if(!activeRecognition)return;
    try{activeRecognition.onend=null;activeRecognition.onerror=null;activeRecognition.abort();}catch{}
    activeRecognition=null;
  }
  function startRecognition(target,resultSelector){
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition,el=$(resultSelector);
    if(!SR){el.textContent='এই browser/PWA speech recognition support করে না। German model শুনে device recorder দিয়ে practice করুন।';return;}
    stopRecognition();
    const r=new SR();activeRecognition=r;r.lang='de-DE';r.interimResults=false;r.continuous=false;r.maxAlternatives=1;
    let gotResult=false;el.textContent='🎙 Listening… এখন German বলুন।';
    r.onresult=e=>{gotResult=true;const heard=e.results[0][0].transcript,pct=wordMatchPercent(target,heard);el.innerHTML='<b>আপনি বলেছেন:</b> '+esc(heard)+'<br><b>Word match:</b> '+pct+'%<br><small>এটা accent score নয়। Model audio-এর sound, stress ও rhythm-এর সাথে নিজে compare করুন।</small>';};
    r.onerror=e=>{
      if(e.error==='aborted'){if(!gotResult)el.textContent='Listening বন্ধ হয়েছে। আবার 🎙 Start/Record চাপুন।';return;}
      const msg=e.error==='not-allowed'||e.error==='service-not-allowed'?'Microphone permission দিন, তারপর আবার চেষ্টা করুন।':e.error==='no-speech'?'কোনো speech detect হয়নি। Mic-এর কাছে পরিষ্কার করে আবার বলুন।':e.error==='network'?'Speech service network error। Internet connection check করে আবার চেষ্টা করুন।':'Speech recognition unavailable: '+e.error;
      el.textContent=msg;
    };
    r.onend=()=>{if(activeRecognition===r)activeRecognition=null;if(!gotResult&&el.textContent.startsWith('🎙'))el.textContent='কিছু শোনা যায়নি। আবার চেষ্টা করুন।';};
    try{r.start();}catch(e){activeRecognition=null;el.textContent='Microphone শুরু করা যায়নি। আবার button চাপুন।';}
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
    const total=state.game.total||0,correct=state.game.correct||0,accuracy=total?Math.round(correct/total*100):0;
    if($('#gameScore'))$('#gameScore').textContent=state.game.score||0;
    if($('#gameStreak'))$('#gameStreak').textContent=state.game.streak||0;
    if($('#gameBest'))$('#gameBest').textContent=state.game.best||0;
    if($('#gameAccuracy'))$('#gameAccuracy').textContent=accuracy+'%';
    if($('#gameMissionText'))$('#gameMissionText').textContent=Math.min(correct,20)+' / 20 correct today';
    if($('#gameMissionBar'))$('#gameMissionBar').style.width=Math.min(100,correct/20*100)+'%';
  }
  function selectGameMode(mode,scroll=false){
    const valid=['meaning','listen','spell','article','sentence','speed','case','memory'];
    currentGameMode=valid.includes(mode)?mode:'meaning';
    $$('.game-mode-tab').forEach(b=>b.classList.toggle('active',b.dataset.gameMode===currentGameMode));
    $$('.game-card[data-game-panel]').forEach(c=>c.classList.toggle('active',c.dataset.gamePanel===currentGameMode));
    const active=$('.game-card[data-game-panel="'+currentGameMode+'"]');
    if(scroll&&active)active.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function randomGameMode(){
    selectGameMode(shuffle(['meaning','listen','spell','article','sentence','speed','case','memory'])[0],true);
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
      const curated=D.vocabulary.filter(x=>x.level===level);currentGamePool=curated.length?curated:(pack?.lessons?Object.values(pack.lessons).flat().map(w=>({...w,level})):[]);
    }catch(e){console.error('[LernDE game pool]',e);currentGamePool=[];}
    newMeaningGame();newListenGame();newSpellGame();newArticleGame();newSentenceGame();newSpeedGame(false);newCaseGame();newMemoryGame();selectGameMode(currentGameMode);
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
    const sentence=personalize(currentSentencePhrase.de),tokens=sentence.trim().split(/\s+/);
    $('#gameSentenceTarget').textContent=currentSentencePhrase.bn||currentSentencePhrase.en||'Build the German sentence';
    $('#gameSentenceTokens').innerHTML=shuffle(tokens.map((text,i)=>({text,key:i+'-'+text}))).map(x=>'<button class="sentence-token" data-token="'+esc(x.text)+'">'+esc(x.text)+'</button>').join('');
    $('#gameSentenceBuilt').innerHTML='';$('#gameSentenceBuilt').classList.remove('game-correct','game-wrong');$('#gameSentenceResult').textContent='সব word সাজালেই automatic check হবে।';
    $$('#gameSentenceTokens [data-token]').forEach(b=>b.onclick=()=>{
      if(b.disabled)return;b.disabled=true;currentSentenceBuilt.push(b.dataset.token);
      const chip=document.createElement('button');chip.type='button';chip.className='sentence-token built';chip.textContent=b.dataset.token;
      chip.onclick=()=>{const idx=currentSentenceBuilt.lastIndexOf(b.dataset.token);if(idx>=0)currentSentenceBuilt.splice(idx,1);chip.remove();b.disabled=false;$('#gameSentenceBuilt').classList.remove('game-correct','game-wrong');$('#gameSentenceResult').textContent='আবার সাজান—সব word বসালে automatic check হবে।';};
      $('#gameSentenceBuilt').appendChild(chip);
      if(currentSentenceBuilt.length===tokens.length)checkSentenceGame();
    });
  }
  function checkSentenceGame(){
    if(!currentSentencePhrase)return;
    const targetSentence=personalize(currentSentencePhrase.de),built=normalizeGerman(currentSentenceBuilt.join(' ')),target=normalizeGerman(targetSentence),ok=built===target;
    $('#gameSentenceBuilt').classList.toggle('game-correct',ok);$('#gameSentenceBuilt').classList.toggle('game-wrong',!ok);
    $('#gameSentenceResult').innerHTML=ok?'✅ <b>Richtig! 🎉</b>':'❌ <b>Fast!</b> Correct target: '+deHtml(targetSentence)+'<br><small>Built word tap করে আবার সাজান।</small>';
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
    const contexts=['Housing','Travel','Administration','Health','Daily life','Appointments','Directions'];
    $('#germanyLifeList').innerHTML=(D.germanyLifeTopics||[]).map((x,i)=>{
      const related=D.phrases.filter(p=>p.level===x.level&&contexts.includes(p.context)).slice(0,3);
      return '<article class="card germany-card"><span class="germany-icon">'+x.icon+'</span><span class="section-tag">'+esc(x.level)+'</span><h3>'+esc(x.title)+'</h3><p>'+deHtml(personalize(x.de))+'</p>'+sentencePracticeHtml(x.de,'germany:topic:'+i)+'<p>'+esc(x.bn)+'</p><div class="memory-box"><small>'+esc(x.note)+'</small></div>'+(related.length?'<div class="pro-examples"><b>Useful examples</b>'+related.map(p=>'<div class="pro-example-line"><p data-german-text>'+esc(personalize(p.de))+'</p>'+sentencePracticeHtml(p.de,'germany:phrase:'+p.id)+'</div>').join('')+'</div>':'')+'<button class="ghost-btn" data-germany-say="'+i+'">🔊 Listen</button></article>';
    }).join('');
    $$('#germanyLifeList [data-germany-say]').forEach(b=>b.onclick=()=>speak(personalize(D.germanyLifeTopics[+b.dataset.germanySay].de),.88));
    window.LernDEGerman?.decorate?.($('#germanyLifeList'));activateSentencePractices($('#germanyLifeList'));
  }

  function renderMistakes(){
    const weak=D.vocabulary.filter(w=>['again','hard'].includes(wordState(w.id).lastRating)).map(w=>({id:w.id,de:w.de,bn:w.bn,en:w.en,label:wordState(w.id).lastRating.toUpperCase(),count:1}));
    const gameWeak=Object.entries(state.gameMistakes||{}).map(([id,x])=>({id,...x,label:'GAME ×'+(x.count||1)}));
    const sentenceWeak=Object.entries(state.sentencePractice||{}).filter(([,x])=>x?.mistakes>0&&!x.lastOk&&x.answer).sort((a,b)=>(b[1].mistakes||0)-(a[1].mistakes||0));
    const all=[...weak,...gameWeak].sort((a,b)=>(b.count||0)-(a.count||0));
    let html=all.map(w=>'<article class="card phrase-card"><div class="phrase-top"><div><span class="section-tag">'+esc(w.label)+'</span><h3>'+deHtml(w.de)+'</h3><p>'+esc(w.bn||'')+' • '+esc(w.en||'')+'</p></div><button class="icon-btn" data-mistake-say="'+esc(w.id)+'">🔊</button></div><div class="button-row"><button class="ghost-btn" data-mistake-good="'+esc(w.id)+'">I know it now</button></div></article>').join('');
    html+=sentenceWeak.map(([key,x])=>'<article class="card phrase-card sentence-weak-card"><span class="section-tag">WORD ORDER ×'+(x.mistakes||1)+'</span><h3>'+deHtml(personalize(x.answer))+'</h3><p class="muted">আবার সাজান; correct হলে এই item weak list থেকে clear হবে।</p>'+sentencePracticeHtml(x.answer,key)+'</article>').join('');
    $('#mistakeList').innerHTML=html||'<div class="card empty-state">এখনো tracked mistake নেই। Game, sentence arrange বা Smart Revision-এ ভুল করলে এখানে আসবে।</div>';
    $$('#mistakeList [data-mistake-say]').forEach(b=>b.onclick=()=>{const core=D.vocabulary.find(x=>x.id===b.dataset.mistakeSay),extra=state.gameMistakes?.[b.dataset.mistakeSay];speak(core?.de||extra?.de||'');});
    $$('#mistakeList [data-mistake-good]').forEach(b=>b.onclick=()=>{const id=b.dataset.mistakeGood;if(D.vocabulary.some(x=>x.id===id))scheduleWord(id,'good');if(state.gameMistakes?.[id]){delete state.gameMistakes[id];saveState();}renderMistakes();});
    window.LernDEGerman?.decorate?.($('#mistakeList'));activateSentencePractices($('#mistakeList'));
  }

  function renderMemory(){
    $('#memoryRules').innerHTML=D.memoryRules.map((x,i)=>'<article><span class="section-tag">TIP '+(i+1)+'</span><h3>'+esc(x.title)+'</h3><p>'+esc(x.text)+'</p></article>').join('');
    if(!currentRecall)newRecall();
  }
  function newRecall(){
    currentRecall=shuffle(D.vocabulary)[0];if(!currentRecall)return;
    $('#recallPrompt').innerHTML='<span style="font-size:64px">'+currentRecall.emoji+'</span><br>German word + article কী?';
    $('#recallAnswer').innerHTML='<b>'+deHtml([currentRecall.article,currentRecall.de].filter(Boolean).join(' '))+'</b><br>'+esc(currentRecall.bn)+' • '+esc(currentRecall.en);
    $('#recallAnswer').hidden=true;
  }
  function renderLearningHub(){
    renderMemory();renderReview();renderMistakes();renderProgress();
    const sentenceItems=Object.values(state.sentencePractice||{}),sentenceAttempts=sentenceItems.reduce((n,x)=>n+(x.attempts||0),0),sentenceCorrect=sentenceItems.reduce((n,x)=>n+(x.correct||0),0);
    const sentenceWeak=sentenceItems.filter(x=>x?.mistakes>0&&!x.lastOk).length;
    const due=getDueWords().length,weak=Object.values(state.vocab).filter(x=>['again','hard'].includes(x.lastRating)).length+Object.keys(state.gameMistakes||{}).length+sentenceWeak;
    if($('#hubDue'))$('#hubDue').textContent=due;
    if($('#hubWeak'))$('#hubWeak').textContent=weak;
    if($('#hubLessons'))$('#hubLessons').textContent=state.completedLessons.length+'/'+D.lessons.length;
    if($('#hubSentence'))$('#hubSentence').textContent=sentenceAttempts?Math.round(sentenceCorrect/sentenceAttempts*100)+'%':'0%';
  }

  function renderProfile(){
    const name=learnerName(),parts=name.split(/\s+/).filter(Boolean),initials=(parts[0]?.[0]||'L')+(parts.length>1?(parts[parts.length-1]?.[0]||''):'');
    if($('#learnerName'))$('#learnerName').textContent=name;
    if($('#learnerAvatar'))$('#learnerAvatar').textContent=initials.toUpperCase();
    if($('#profileNameInput')&&document.activeElement!==$('#profileNameInput'))$('#profileNameInput').value=name;
    if($('#profileNamePreview'))$('#profileNamePreview').textContent=name;
  }
  function saveProfileName(){
    const input=$('#profileNameInput'),name=String(input?.value||'').trim().replace(/\s+/g,' ');
    if(name.length<2){toast('নাম অন্তত 2 characters দিন।');return;}
    state.profileName=name.slice(0,60);saveState();renderProfile();renderSkillPrompts();toast('Learner name updated.');
  }

  function renderProfessional(){
    const proPhrases=D.phrases.filter(p=>['Professional German','Meetings','Workplace','Argumentation','Planning'].includes(p.context));
    $('#professionalList').innerHTML=D.professionalTopics.map((x,i)=>{
      const related=proPhrases.filter(p=>p.level===x.level).slice((i*3)%Math.max(1,proPhrases.length),((i*3)%Math.max(1,proPhrases.length))+3);
      return '<article class="card professional-card"><div class="pro-top"><div><span class="section-tag">'+esc(x.level)+' • PROFESSIONAL</span><h3>'+esc(x.title)+'</h3></div><button class="icon-btn" data-say="'+esc(personalize(x.prompt))+'">🔊</button></div><p><b>Prompt:</b> '+deHtml(personalize(x.prompt))+'</p>'+sentencePracticeHtml(x.prompt,'professional:prompt:'+i)+'<div class="rule-box"><b>Model answer</b><p>'+deHtml(personalize(x.model))+'</p><button class="ghost-btn" data-model="'+i+'">🔊 Hear model</button>'+sentencePracticeHtml(x.model,'professional:model:'+i)+'</div><div class="memory-box"><b>Answer pattern</b><p>'+esc(x.tip)+'</p></div>'+(related.length?'<div class="pro-examples"><b>More practice</b>'+related.map(p=>'<div class="pro-example-line"><p data-german-text>'+esc(personalize(p.de))+'</p>'+sentencePracticeHtml(p.de,'professional:phrase:'+p.id)+'</div>').join('')+'</div>':'')+'</article>';
    }).join('');
    $$('#professionalList [data-say]').forEach(b=>b.onclick=()=>speak(b.dataset.say));
    $$('#professionalList [data-model]').forEach(b=>b.onclick=()=>speak(personalize(D.professionalTopics[+b.dataset.model].model),.84));
    window.LernDEGerman?.decorate?.($('#professionalList'));activateSentencePractices($('#professionalList'));
  }

  function renderExamCards(){
    $('#examCards').innerHTML=D.mockExams.map(e=>{const score=state.examScores[e.id]?.best, profile=D.examProfiles?.[e.level];return `<article class="exam-card"><span class="section-tag">${e.level}</span><h3>${esc(e.title)}</h3><p>${esc(e.note)}</p>${profile?`<div class="meta-chips">${profile.skills.map(s=>`<span class="chip">${esc(s)}</span>`).join('')}</div><p class="muted">${esc(profile.focus)}</p>`:''}<div class="exam-meta"><span>⏱ ${e.minutes} min</span><span>${e.questions.length} auto-scored tasks</span></div>${score!=null?`<p class="success"><b>Best: ${score}%</b></p>`:''}<button class="primary-btn block" data-exam="${e.id}">Start mock</button></article>`}).join('');
    $$('#examCards [data-exam]').forEach(b=>b.onclick=()=>startExam(b.dataset.exam));
  }
  function startExam(id){
    const e=D.mockExams.find(x=>x.id===id); if(!e) return; activeExam={id,started:Date.now(),remaining:e.minutes*60,answers:{}};
    $('#examTag').textContent=e.level; $('#examTitle').textContent=e.title; $('#examModal').hidden=false; pushModalHistory('examModal',id);
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
    const due=getDueWords(),known=Object.values(state.vocab).filter(x=>x.known).length,weak=Object.values(state.vocab).filter(x=>['again','hard'].includes(x.lastRating)).length;
    $('#reviewDue').textContent=due.length;$('#reviewKnown').textContent=known;$('#reviewWeak').textContent=weak;$('#reviewDrafts').textContent=(state.writingDrafts||[]).length;
    currentReview=due[0]||shuffle(D.vocabulary.filter(w=>wordState(w.id).known))[0]||shuffle(D.vocabulary)[0];const w=currentReview;
    if(!w){$('#reviewCard').innerHTML='<div class="empty-state">No review items.</div>';return;}
    const ex=learningExampleForWord(w);
    $('#reviewCard').innerHTML='<div class="review-word"><span class="section-tag">'+(isDue(w.id)?'DUE NOW':'PRACTICE')+'</span><div class="visual">'+w.emoji+'</div><h2>'+deHtml([w.article,w.de].filter(Boolean).join(' '))+'</h2><button class="ghost-btn" id="reviewAudioBtn">🔊 Listen</button><div class="answer" id="reviewAnswer" hidden><b>'+esc(w.bn)+'</b> • '+esc(w.en)+'<br><span class="pron-line">'+esc(w.bnPron)+'</span><div class="vocab-card-example"><span>'+esc(ex.kind)+'</span><p data-german-text>'+esc(ex.de)+'</p></div>'+sentencePracticeHtml(ex.de,'review:'+w.id)+'</div><button class="ghost-btn" id="reviewRevealBtn">Reveal meaning + sentence</button><div class="rating-row" id="reviewRatings" hidden><button data-rate="again">Again</button><button data-rate="hard">Hard</button><button data-rate="good">Good</button><button data-rate="easy">Easy</button></div></div>';
    $('#reviewAudioBtn').onclick=()=>speak(w.de);$('#reviewRevealBtn').onclick=()=>{$('#reviewAnswer').hidden=false;$('#reviewRatings').hidden=false;$('#reviewRevealBtn').hidden=true;window.LernDEGerman?.decorate?.($('#reviewAnswer'));activateSentencePractices($('#reviewAnswer'));};
    $$('#reviewRatings [data-rate]').forEach(b=>b.onclick=()=>{scheduleWord(w.id,b.dataset.rate);renderReview();});
  }

  function renderProgress(){
    $('#progressSummary').innerHTML=D.levels.map(l=>{const all=D.lessons.filter(x=>x.level===l.id),done=all.filter(x=>state.completedLessons.includes(x.id)).length,p=all.length?Math.round(done/all.length*100):0;return `<article class="progress-level"><span class="section-tag">${l.badge}</span><h3>${l.title}</h3><p>${done}/${all.length} lessons</p><div class="mini-bar"><span style="width:${p}%"></span></div><small>${p}% complete</small></article>`}).join('');
  }

  async function translate(){
    const raw=$('#translateInput').value.trim(),mode=$('#translationMode').value,out=$('#translateOutput');if(!raw){out.textContent='কিছু text লিখুন।';return;}
    const norm=s=>String(s||'').trim().toLocaleLowerCase().replace(/[।.!?]+$/,'').replace(/\s+/g,' ').trim();
    let result=null,found=null,germanResult='';const srcField=mode.startsWith('bn-')?'bn':mode.startsWith('en-')?'en':'de';
    const phrase=D.phrases.find(p=>norm(p[srcField])===norm(raw));
    if(phrase){found=phrase;germanResult=personalize(phrase.de);result=mode==='bn-de'?'German: '+germanResult+'\nবাংলা উচ্চারণ: '+phrase.bnPron+'\nEnglish: '+phrase.en+'\nLevel: '+phrase.level+' • '+phrase.register:mode==='en-de'?'German: '+germanResult+'\nবাংলা: '+phrase.bn+'\nবাংলা উচ্চারণ: '+phrase.bnPron+'\nLevel: '+phrase.level:mode==='de-bn'?'বাংলা: '+phrase.bn+'\nবাংলা উচ্চারণ: '+phrase.bnPron+'\nEnglish: '+phrase.en+'\nContext: '+phrase.context:'English: '+phrase.en+'\nবাংলা: '+phrase.bn+'\nLevel: '+phrase.level;}
    if(!result){
      const vocab=D.vocabulary.find(v=>norm(v[srcField])===norm(raw)||(srcField==='de'&&norm((v.article||'')+' '+v.de)===norm(raw)));
      if(vocab){found=vocab;germanResult=[vocab.article,vocab.de].filter(Boolean).join(' ');result=mode==='bn-de'?'German: '+germanResult+'\nবাংলা উচ্চারণ: '+vocab.bnPron+'\nEnglish: '+vocab.en+'\nLevel: '+vocab.level:mode==='en-de'?'German: '+germanResult+'\nবাংলা: '+vocab.bn+'\nLevel: '+vocab.level:mode==='de-bn'?'বাংলা: '+vocab.bn+'\nবাংলা উচ্চারণ: '+vocab.bnPron+'\nEnglish: '+vocab.en:'English: '+vocab.en+'\nবাংলা: '+vocab.bn;}
    }
    if(!result){
      out.textContent='17K dictionary-তে exact verified match খোঁজা হচ্ছে…';
      try{const field=mode==='bn-de'?'bn':mode==='en-de'?'en':'de',x=await lookupDictionaryExact(field,raw);if(x){found=x;germanResult=x.de;result=mode==='de-bn'?'বাংলা: '+x.bn+'\nEnglish: '+x.en:mode==='de-en'?'English: '+x.en+'\nবাংলা: '+x.bn:'German: '+x.de+'\nবাংলা: '+x.bn+'\nEnglish: '+x.en;}}catch(e){console.warn('[LernDE translator]',e);}
    }
    if(!result){
      const related=D.phrases.filter(p=>norm(p[srcField]).includes(norm(raw))||norm(raw).includes(norm(p[srcField]))).slice(0,5);
      const terms=mode.startsWith('de-')?raw.split(/\s+/).map(t=>t.replace(/[,.!?;:()]/g,'')).filter(Boolean):[];
      const known=terms.map(t=>{const v=D.vocabulary.find(x=>norm(x.de)===norm(t));return v?v.de+' = '+v.bn+' = '+v.en:null;}).filter(Boolean).slice(0,10);
      result='এই exact full sentence-এর verified translation LernDE bank-এ নেই। ভুল translation অনুমান করা হয়নি.';
      if(known.length)result+='\n\nKnown course words:\n• '+known.join('\n• ');
      if(related.length)result+='\n\nRelated curated phrases:\n• '+related.map(p=>personalize(p.de)+' — '+p.bn).join('\n• ');
      result+='\n\nTip: ছোট phrase/word দিয়ে search করলে 500+ Phrase Bank ও 17K Dictionary থেকে বেশি exact result পাবেন।';
    }
    out.textContent=result;
    if(found?.de){out.insertAdjacentHTML('beforeend','<br><br><button class="ghost-btn" id="translationAudioBtn">🔊 Hear German</button>');$('#translationAudioBtn').onclick=()=>speak(personalize(found.de));}
    if(germanResult&&germanResult.trim().split(/\s+/).length>=3){out.insertAdjacentHTML('beforeend',sentencePracticeHtml(germanResult,'translator:'+mode+':'+norm(raw)));activateSentencePractices(out);}
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
      'Einerseits spart Homeoffice Fahrzeit, andererseits kann die direkte Kommunikation schwieriger werden.',
      'Wenn ein Termin verschoben wird, informiere ich alle Beteiligten so früh wie möglich.',
      'Nachdem das Team die Ursache gefunden hatte, wurde die Korrektur zuerst in einer Testumgebung geprüft.',
      'Im Alltag versuche ich, neue Wörter sofort in kurzen Sätzen zu verwenden.',
      'Eine klare Rückfrage verhindert oft Missverständnisse und spart später viel Zeit.',
      'Obwohl die Aufgabe anspruchsvoll war, konnten wir sie gemeinsam rechtzeitig abschließen.',
      'Für eine gute Entscheidung müssen Anforderungen, Risiken und Aufwand gemeinsam betrachtet werden.',
      'Je regelmäßiger ich Deutsch spreche, desto sicherer werde ich in Gesprächen.'
    ];
    const reading=$('#readingText');reading.textContent=personalize(reads[0]);reading.removeAttribute('data-german-ready');reading.setAttribute('data-german-text','');window.LernDEGerman?.decorate(reading);
    $('#newReadingBtn').onclick=()=>{const el=$('#readingText');el.textContent=personalize(shuffle(reads)[0]);el.removeAttribute('data-german-ready');el.setAttribute('data-german-text','');window.LernDEGerman?.decorate(el);};
    const listenTexts=['Der Termin wurde auf Freitag verschoben. Bitte bestätigen Sie die neue Uhrzeit.','Wir haben die Ursache gefunden und testen jetzt die Korrektur.','Könnten Sie bitte erläutern, welche Anforderungen heute Priorität haben?','Die Rechnung wurde bereits geprüft und kann heute freigegeben werden.','Bitte bringen Sie Ihren Pass und die erforderlichen Unterlagen zum Termin mit.','Wir sollten die Änderung zuerst in einer Testumgebung prüfen.','Der nächste Zug fährt in zehn Minuten von Gleis vier ab.','Falls Sie weitere Fragen haben, geben Sie mir bitte kurz Bescheid.'];
    let current=listenTexts[0];
    $('#listenPracticeBtn').onclick=()=>{current=shuffle(listenTexts)[0];$('#listeningTranscript').hidden=true;speak(current,.9);};
    $('#showListeningTextBtn').onclick=()=>{const el=$('#listeningTranscript');el.textContent=current;el.hidden=false;el.removeAttribute('data-german-ready');el.setAttribute('data-german-text','');window.LernDEGerman?.decorate(el);};
    $('#saveWritingBtn').onclick=()=>{const text=$('#writingArea').value.trim();if(!text)return toast('কিছু লিখুন।');state.writingDrafts=[{text,at:nowIso()},...(state.writingDrafts||[])].slice(0,20);logActivity('writing','Saved a writing draft');saveState();toast('Draft saved locally.');};
    $('#speakModelBtn').onclick=()=>speak($('#speakingPrompt').textContent);
    $('#startSpeechBtn').onclick=startSpeechRecognition;
  }
  function startSpeechRecognition(){ startRecognition($('#speakingPrompt').textContent,'#speechResult'); }

  function closeModal(id,fromHistory=false){
    const el=$(`#${id}`);if(el)el.hidden=true;
    if(id==='examModal'&&examTimerHandle){clearInterval(examTimerHandle);examTimerHandle=null;activeExam=null;}
    stopRecognition();
    if(!fromHistory&&history.state?.modal===id)history.back();
  }
  function exportProgress(){
    const blob=new Blob([JSON.stringify({app:'LernDE',version:4,exportedAt:nowIso(),state},null,2)],{type:'application/json'}); const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`LernDE-progress-${todayKey()}.json`;a.click();URL.revokeObjectURL(a.href);
  }
  async function importProgress(file){
    try{const data=JSON.parse(await file.text());if(data.app&&data.app!=='LernDE')throw new Error('This is not a LernDE progress file');const incoming=data.state||data;if(!incoming||typeof incoming!=='object'||!Array.isArray(incoming.completedLessons))throw new Error('Invalid LernDE progress file');state=normalizeState(incoming);saveState();renderAll();toast('Progress imported safely.');}catch(e){toast(`Import failed: ${e.message}`);}
  }
  function resetProgress(){ if(!confirm('এই device-এর LernDE progress reset করবেন?'))return;state=defaultState();saveState();renderAll();toast('Local progress reset.'); }
  function renderAll(){renderMetrics();renderProfile();renderView(normalizedView(state.lastView||'home'));}

  function bind(){
    $$('.nav-item[data-view]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view,{history:'push'})));
    $$('[data-jump]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.jump,{history:'push'}))); $$('[data-hub-target]').forEach(b=>b.addEventListener('click',()=>{document.querySelector('#'+b.dataset.hubTarget)?.scrollIntoView({behavior:'smooth',block:'start'});}));
    $$('[data-open-lesson]').forEach(b=>b.addEventListener('click',()=>{state.selectedLevel='FOUNDATION';saveState();closeSidebar();openLesson(b.dataset.openLesson);}));
    $('#menuBtn').onclick=openSidebar; $('#closeMenuBtn').onclick=closeSidebar; $('#sidebarBackdrop').onclick=closeSidebar; if($('#learnerCard'))$('#learnerCard').onclick=()=>showView('about',{history:'push'});
    $$('[data-close-modal]').forEach(b=>b.onclick=()=>closeModal(b.dataset.closeModal));
    $$('.modal-backdrop').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)closeModal(m.id);}));
    $('#voiceTestBtn').onclick=()=>speak('Guten Tag. Ich heiße '+learnerName()+'. Willkommen bei LernDE.');
    $('#vocabSearch').oninput=renderVocabulary;
    $('#dictSearch').oninput=()=>{clearTimeout(dictSearchTimer);dictSearchTimer=setTimeout(()=>{dictionaryPage=1;renderDictionary();},180);};
    ['#dictLanguage','#dictEntryClass','#dictCategory','#dictSort','#dictPageSize'].forEach(sel=>{$(sel).onchange=()=>{dictionaryPage=1;saveDictionaryControls();renderDictionary();};});
    $$('.dictionary-status-tabs [data-dict-status]').forEach(btn=>btn.onclick=()=>{state.dictionaryPrefs={...(state.dictionaryPrefs||{}),status:btn.dataset.dictStatus};dictionaryPage=1;saveState();renderDictionary();});
    $('#dictClearBtn').onclick=()=>{$('#dictSearch').value='';state.dictionaryPrefs={...defaultState().dictionaryPrefs,status:state.dictionaryPrefs?.status||'UNREAD'};dictionaryPage=1;saveState();renderDictionary();};
    $('#vocabLevel').onchange=renderVocabulary; $('#vocabStatus').onchange=renderVocabulary; $('#randomVocabBtn').onclick=()=>{$('#vocabSearch').value='';$('#vocabLevel').value='ALL';renderVocabulary();const cards=$$('#vocabGrid .vocab-card');if(cards.length)cards[Math.floor(Math.random()*cards.length)].scrollIntoView({behavior:'smooth',block:'center'});};
    $('#phraseLevel').onchange=()=>{phrasePage=1;renderPhrases();}; $('#phraseSearch').oninput=()=>{clearTimeout(phraseSearchTimer);phraseSearchTimer=setTimeout(()=>{phrasePage=1;renderPhrases();},160);}; $('#grammarLevel').onchange=renderGrammar; $('#grammarSearch').oninput=renderGrammar;
    $('#voiceSelect').onchange=e=>{state.voiceURI=e.target.value;saveState();renderPronunciation();speak('Guten Tag. Willkommen bei LernDE.',.9);}; $('#voiceRate').onchange=e=>{state.voiceRate=Number(e.target.value);saveState();}; $('#voiceCalibrationBtn').onclick=()=>speak('Guten Tag. Ich lerne Deutsch. Heute übe ich Aussprache, Rhythmus und Satzmelodie.',state.voiceRate);
    $('#shadowLevel').onchange=chooseShadow; $('#newShadowBtn').onclick=chooseShadow; $('#shadowSlowBtn').onclick=()=>currentShadow&&speak(currentShadow.text,.68); $('#shadowNaturalBtn').onclick=()=>currentShadow&&speak(currentShadow.text,Math.max(.88,state.voiceRate||.9)); $('#shadowRecordBtn').onclick=()=>currentShadow&&startRecognition(currentShadow.text,'#shadowResult');
    $('#gameLevel').onchange=()=>{state.selectedLevel=$('#gameLevel').value;saveState();renderGames();}; $$('.game-mode-tab').forEach(b=>b.onclick=()=>selectGameMode(b.dataset.gameMode,true)); if($('#gameQuickMix'))$('#gameQuickMix').onclick=randomGameMode;
    $('#gameResetScore').onclick=resetGameRound;
    $('#gameMeaningNew').onclick=newMeaningGame;
    $('#gameListenPlay').onclick=()=>currentListenWord&&speak(currentListenWord.de,.76);
    $('#gameListenNew').onclick=newListenGame;
    $('#gameSpellPlay').onclick=()=>currentSpellWord&&speak(currentSpellWord.de,.72);
    $('#gameSpellCheck').onclick=checkSpellGame;$('#gameSpellNew').onclick=newSpellGame;
    $('#gameArticleNew').onclick=newArticleGame;$$('[data-article]').forEach(b=>b.onclick=()=>answerArticleGame(b.dataset.article,b));
    if($('#gameSentenceCheck'))$('#gameSentenceCheck').onclick=checkSentenceGame;$('#gameSentenceNew').onclick=newSentenceGame;
    $('#gameSpeedStart').onclick=()=>newSpeedGame(true);$('#gameSpeedCheck').onclick=checkSpeedGame;
    $('#gameCaseNew').onclick=newCaseGame;$('#gameMemoryNew').onclick=newMemoryGame;
    $('#recallNewBtn').onclick=newRecall; $('#recallRevealBtn').onclick=()=>{$('#recallAnswer').hidden=false;if(currentRecall)speak(currentRecall.de);}; if($('#profileSaveBtn'))$('#profileSaveBtn').onclick=saveProfileName; if($('#profileResetBtn'))$('#profileResetBtn').onclick=()=>{$('#profileNameInput').value='Ashraful Islam';saveProfileName();};
    $('#translateBtn').onclick=translate; $('#correctorBtn').onclick=correctGerman; $('#swapTranslateBtn').onclick=()=>{const m=$('#translationMode');const map={'bn-de':'de-bn','de-bn':'bn-de','en-de':'de-en','de-en':'en-de'};m.value=map[m.value];};
    $('#exportBtn').onclick=exportProgress; $('#importInput').onchange=e=>{if(e.target.files[0])importProgress(e.target.files[0]);e.target.value='';}; $('#resetBtn').onclick=resetProgress;
    renderSkillPrompts();
    const installBtn=$('#installBtn'),isStandalone=()=>window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
    const updateInstall=()=>{if(!installBtn)return;installBtn.hidden=isStandalone();installBtn.textContent=deferredInstall?'⬇ Install App':'📲 Install / Add App';};
    window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;updateInstall();});
    installBtn.onclick=async()=>{if(isStandalone()){toast('LernDE already installed.');return;}if(deferredInstall){deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;updateInstall();return;}$('#installModal').hidden=false;pushModalHistory('installModal','guide');};
    window.addEventListener('appinstalled',()=>{deferredInstall=null;updateInstall();toast('LernDE installed.');});updateInstall();
    window.addEventListener('popstate',e=>{const modal=activeModal();if(modal)closeModal(modal.id,true);const target=e.state?.lerndeView||location.hash.replace('#','')||'home';showView(target,{history:'none'});});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')$$('.modal-backdrop:not([hidden])').forEach(m=>closeModal(m.id));});
  }

  async function init(){
    const moduleReady=window.LernDEReady?await window.LernDEReady:{ok:true};
    bind();ensureLevelOptions('#vocabLevel');ensureLevelOptions('#phraseLevel');ensureLevelOptions('#grammarLevel');syncDictionaryControls();if($('#gameLevel'))$('#gameLevel').value=state.selectedLevel||'FOUNDATION';renderMetrics();renderProfile();
    const hashView=location.hash.replace('#',''),start=hashView?normalizedView(hashView):normalizedView(state.lastView);
    showView(start,{history:'replace',scroll:false});
    if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(e=>console.warn('[LernDE service worker]',e));
    if(window.speechSynthesis){window.speechSynthesis.getVoices?.();window.speechSynthesis.onvoiceschanged=()=>{if($('#view-pronunciation')?.classList.contains('active'))renderPronunciation();};}
    if(moduleReady?.ok===false)toast('Some optional learning content could not be loaded.');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
