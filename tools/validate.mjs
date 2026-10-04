import fs from 'node:fs';
import vm from 'node:vm';
const root=new URL('../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');
const exists=p=>fs.existsSync(new URL(p,root));
const required=['index.html','manifest.webmanifest','sw.js','assets/css/app.css','assets/js/data-core.js','assets/js/data-lessons.js','assets/js/data-vocabulary.js','assets/js/data-grammar.js','assets/js/data-phrases.js','assets/js/data-pronunciation.js','assets/js/data-foundation.js','assets/js/data-professional.js','assets/js/data-exams.js','assets/js/module-loader.js','assets/js/app.js','assets/js/german-text.js','config/modules.json','CONTENT_GOVERNANCE.md','docs/ARCHITECTURE.md'];
for(const f of required)if(!exists(f))throw new Error(`Missing: ${f}`);
for(const f of ['assets/js/module-loader.js','assets/js/app.js','assets/js/german-text.js']){
  const src=read(f);new vm.Script(src,{filename:f});
}
const context={window:{}};vm.createContext(context);vm.runInContext(read('assets/js/data-core.js'),context);
vm.runInContext(read('assets/js/data-lessons.js'),context);
vm.runInContext(read('assets/js/data-vocabulary.js'),context);
vm.runInContext(read('assets/js/data-grammar.js'),context);
vm.runInContext(read('assets/js/data-phrases.js'),context);
vm.runInContext(read('assets/js/data-pronunciation.js'),context);
vm.runInContext(read('assets/js/data-foundation.js'),context);
vm.runInContext(read('assets/js/data-professional.js'),context);
vm.runInContext(read('assets/js/data-exams.js'),context);const D=context.window.LERNDE_DATA;
if(!D)throw new Error('LERNDE_DATA not loaded');
const levels=['FOUNDATION','A1','A2','B1','B2'];
const allowed=new Set(levels);
for(const l of levels){if(!D.levels.some(x=>x.id===l))throw new Error(`Missing level ${l}`);if(!D.lessons.some(x=>x.level===l))throw new Error(`No lessons for ${l}`)}
for(const collection of ['lessons','grammar','vocabulary','phrases'])for(const x of D[collection])if(!allowed.has(x.level))throw new Error(`Unknown level ${x.level} in ${collection}`);
const ids=new Set();for(const x of D.vocabulary){if(ids.has(x.id))throw new Error(`Duplicate vocab id ${x.id}`);ids.add(x.id);if(!x.de||!x.bn||!x.en||!x.level)throw new Error(`Bad vocab ${x.id}`)}
const lessonIds=new Set();for(const x of D.lessons){if(lessonIds.has(x.id))throw new Error(`Duplicate lesson ${x.id}`);lessonIds.add(x.id);if(!x.title||!x.description||!x.steps?.length)throw new Error(`Bad lesson ${x.id}`)}
for(const g of D.grammar){if(!g.title||!g.rule||!g.memory||!g.good)throw new Error(`Bad grammar ${g.id}`)}
for(const p of D.phrases){if(!p.de||!p.bn||!p.en||!p.bnPron)throw new Error(`Bad phrase ${p.id}`)}
for(const e of D.mockExams){if(!e.questions?.length)throw new Error(`Empty exam ${e.id}`);for(const q of e.questions){if(!Array.isArray(q.options)||q.answer<0||q.answer>=q.options.length)throw new Error(`Bad answer in ${e.id}`)}}
if((D.pronunciationDrills||[]).length<15)throw new Error('Pronunciation curriculum is too small');
if((D.shadowingSets||[]).length<5)throw new Error('Shadowing sets missing');
if((D.germanyLifeTopics||[]).length<6)throw new Error('Germany life content missing');
const html=read('index.html');
const domIds=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);const seen=new Set();for(const id of domIds){if(seen.has(id))throw new Error(`Duplicate DOM id ${id}`);seen.add(id)}
for(const id of ['view-home','view-course','view-vocabulary','view-dictionary','view-grammar','view-pronunciation','view-memory','view-games','view-skills','view-translator','view-professional','view-germany','view-exam','view-review','view-mistakes','view-progress','lessonModal','vocabModal','examModal','dictSearch','dictLanguage','dictEntryClass','dictCategory','dictSort','dictPageSize','dictReadCount','dictUnreadCount','dictStatus','dictResults','dictPager','grammarSearch','grammarLevel','grammarList','grammarDetail','grammarCount'])if(!seen.has(id))throw new Error(`Missing DOM id ${id}`);
for(const script of ['assets/js/data-core.js','assets/js/data-lessons.js','assets/js/data-vocabulary.js','assets/js/data-grammar.js','assets/js/data-phrases.js','assets/js/data-pronunciation.js','assets/js/data-foundation.js','assets/js/data-professional.js','assets/js/data-exams.js','assets/js/module-loader.js','assets/js/app.js','assets/js/german-text.js'])if(!html.includes(`src="${script}"`))throw new Error(`Script not loaded: ${script}`);
const app=read('assets/js/app.js');
const dynamicIds=new Set([...app.matchAll(/id=\\?"([A-Za-z][\w-]*)\\?"/g)].map(m=>m[1]));
const literalIds=[...app.matchAll(/\$\('#([A-Za-z][\w-]*)'\)/g)].map(m=>m[1]);
for(const id of new Set(literalIds))if(!seen.has(id)&&!dynamicIds.has(id))throw new Error(`app.js references missing #${id}`);

/* Production curriculum/data gates */
if(!Array.isArray(D.foundationAlphabet)||D.foundationAlphabet.length!==30)throw new Error('Foundation alphabet must contain A-Z + Ä Ö Ü ß (30 entries)');
for(const a of D.foundationAlphabet)if(!a.letter||!a.name||!a.ipa||!a.example)throw new Error('Bad Foundation alphabet entry');
if(!D.foundationContent||Object.keys(D.foundationContent).filter(x=>x.startsWith('FOUNDATION-')).length!==18)throw new Error('Foundation must have 18 lesson-specific content records');
for(const l of D.lessons.filter(x=>x.level==='FOUNDATION')){
  const d=D.foundationContent[l.id];
  if(!d||!d.goal||!d.why||!Array.isArray(d.rules)||d.rules.length<3||!Array.isArray(d.examples)||d.examples.length<3||!Array.isArray(d.dialogue)||d.dialogue.length<2||!Array.isArray(d.tasks)||d.tasks.length<2)throw new Error('Incomplete Foundation lesson '+l.id);
}

const lessonPackSpec={FOUNDATION:18,A1:12,A2:12,B1:12,B2:14};
const lessonPackFiles={
  FOUNDATION:'assets/data/lesson-vocabulary-foundation.json',
  A1:'assets/data/lesson-vocabulary-a1.json',
  A2:'assets/data/lesson-vocabulary-a2.json',
  B1:'assets/data/lesson-vocabulary-b1.json',
  B2:'assets/data/lesson-vocabulary-b2.json'
};
const newLemmaSeen=new Set();let lessonWordTotal=0;
for(const [level,count] of Object.entries(lessonPackSpec)){
  const p=lessonPackFiles[level];
  if(!exists(p))throw new Error('Missing lesson vocabulary pack '+p);
  const pack=JSON.parse(read(p));
  if(pack.level!==level)throw new Error('Wrong pack level in '+p);
  if(pack.total!==count*50)throw new Error(level+' pack total must be '+(count*50));
  for(let i=1;i<=count;i++){
    const id=level+'-'+String(i).padStart(2,'0');
    const words=pack.lessons?.[id];
    if(!Array.isArray(words)||words.length!==50)throw new Error(id+' must contain exactly 50 new words');
    for(const w of words){
      const k=String(w.de||'').trim().toLocaleLowerCase('de-DE');
      if(!k||!w.bn||!w.en)throw new Error('Bad lesson word '+id+' '+(w.id||'?'));
      if(newLemmaSeen.has(k))throw new Error('Duplicate New Word lemma across 68 lessons: '+w.de);
      newLemmaSeen.add(k);lessonWordTotal++;
    }
  }
}
if(lessonWordTotal!==3400||newLemmaSeen.size!==3400)throw new Error('Expected exactly 3400 unique lesson New Words');

if(!exists('assets/data/dictionary-manifest.json'))throw new Error('Missing 17K dictionary manifest');
const dictManifest=JSON.parse(read('assets/data/dictionary-manifest.json'));
if(dictManifest.total!==17000||dictManifest.chunks!==4)throw new Error('Dictionary manifest must declare 17,000 entries in 4 chunks');
let dictTotal=0;const dictKeys=new Set();
for(let i=1;i<=4;i++){
  const p='assets/data/dictionary-'+String(i).padStart(2,'0')+'.json';
  if(!exists(p))throw new Error('Missing '+p);
  const part=JSON.parse(read(p));dictTotal+=part.length;
  for(const w of part){
    if(!w.de||!w.bn||!w.en)throw new Error('Incomplete 17K dictionary entry '+(w.id||'?'));
    const k=String(w.de).trim().toLocaleLowerCase('de-DE');
    if(dictKeys.has(k))throw new Error('Duplicate 17K dictionary German key '+w.de);
    dictKeys.add(k);
  }
}
if(dictTotal!==17000||dictKeys.size!==17000)throw new Error('17K dictionary actual unique count mismatch: '+dictTotal+'/'+dictKeys.size);

const gameIds=['gameLevel','gameScore','gameStreak','gameBest','gameResetScore','gameMeaningNew','gameListenPlay','gameListenOptions','gameListenNew','gameSpellPlay','gameSpellInput','gameSpellCheck','gameSpellNew','gameArticleNew','gameSentenceTarget','gameSentenceTokens','gameSentenceBuilt','gameSentenceCheck','gameSentenceNew','gameSpeedPrompt','gameSpeedInput','gameSpeedTimer','gameSpeedStart','gameSpeedCheck','gameCasePrompt','gameCaseOptions','gameCaseResult','gameCaseNew','gameMemoryBoard','gameMemoryResult','gameMemoryNew'];
for(const id of gameIds)if(!seen.has(id))throw new Error('Missing pro-game DOM id '+id);
for(const fn of ['newMeaningGame','newListenGame','newSpellGame','newArticleGame','newSentenceGame','newSpeedGame','newCaseGame','newMemoryGame'])if(!app.includes('function '+fn+'('))throw new Error('Missing game implementation '+fn);
for(const token of ['#gameLevel','#gameResetScore','#gameMeaningNew','#gameListenPlay','#gameSpellCheck','#gameArticleNew','#gameSentenceCheck','#gameSpeedStart','#gameSpeedCheck','#gameCaseNew','#gameMemoryNew'])if(!app.includes(token))throw new Error('Game runtime handler missing '+token);
if(/(^|[^$])\$\([^;\n]*\)\.forEach/m.test(app))throw new Error('querySelector(...).forEach runtime bug detected; use $$() for NodeList iteration');
if(app.includes('completdLessons'))throw new Error('Known completedLessons typo still present');
for(const token of ['dictionaryRead','dictionaryPrefs','setDictionaryRead','dictEntryClass','dictCategory','dictSort','dictPageSize','data-dict-read','data-dict-unread','dictionaryPage','grammarSearch'])if(!app.includes(token))throw new Error('Dictionary/grammar study feature missing '+token);
if(!app.includes('foundationAlphabet')||!app.includes('foundationContent'))throw new Error('Foundation renderer not wired');
const manifest=JSON.parse(read('manifest.webmanifest'));if(!manifest.name||!manifest.start_url)throw new Error('Bad web manifest');
const contentManifest=JSON.parse(read('assets/data/content-manifest.json'));if(contentManifest.lessons!==D.lessons.length||contentManifest.vocabularyEntries!==D.vocabulary.length||contentManifest.lessonVocabularyEntries!==3400||contentManifest.uniqueNewLessonLemmas!==3400||contentManifest.extendedDictionaryEntries!==17000||contentManifest.gameModes!==8)throw new Error('Content manifest out of sync');
const modules=JSON.parse(read('config/modules.json'));for(const l of levels)if(!modules.modules.some(x=>x.id===l&&x.enabled))throw new Error(`Enabled module missing: ${l}`);
const sw=read('sw.js');for(const asset of ['index.html','assets/css/app.css','assets/js/data-core.js','assets/js/data-lessons.js','assets/js/data-vocabulary.js','assets/js/data-grammar.js','assets/js/data-phrases.js','assets/js/data-pronunciation.js','assets/js/data-foundation.js','assets/js/data-professional.js','assets/js/data-exams.js','assets/js/module-loader.js','assets/js/app.js','assets/js/german-text.js','assets/data/lesson-vocabulary-foundation.json','assets/data/lesson-vocabulary-a1.json','assets/data/lesson-vocabulary-a2.json','assets/data/lesson-vocabulary-b1.json','assets/data/lesson-vocabulary-b2.json'])if(!sw.includes(asset))throw new Error(`Service worker does not cache ${asset}`);
console.log(`PASS: ${D.levels.length} levels, ${D.lessons.length} lessons, 3400 unique lesson New Words, 17000 unique dictionary entries, 8 game modes, ${D.vocabulary.length} curated mastery cards, ${D.grammar.length} grammar topics, ${D.phrases.length} phrases, ${D.pronunciationDrills.length} pronunciation drills, ${D.mockExams.length} mocks.`);
