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
for(const id of ['view-home','view-course','view-vocabulary','view-grammar','view-pronunciation','view-memory','view-games','view-skills','view-translator','view-professional','view-germany','view-exam','view-review','view-mistakes','view-progress','lessonModal','vocabModal','examModal'])if(!seen.has(id))throw new Error(`Missing DOM id ${id}`);
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
if(!exists('assets/data/lesson-vocabulary-foundation.json'))throw new Error('Missing Foundation lesson vocabulary pack');
const foundationPack=JSON.parse(read('assets/data/lesson-vocabulary-foundation.json'));
const fWords=[];for(const l of D.lessons.filter(x=>x.level==='FOUNDATION')){
  const list=foundationPack.lessons?.[l.id];
  if(!Array.isArray(list)||list.length!==50)throw new Error(l.id+' must contain exactly 50 new words');
  fWords.push(...list);
}
if(fWords.length!==900)throw new Error('Foundation new-word total must be 900');
const fLemma=new Set();for(const w of fWords){
  const k=String(w.de||'').trim().toLocaleLowerCase('de-DE');
  if(!k||!w.bn||!w.en)throw new Error('Bad Foundation new word '+(w.id||'?'));
  if(fLemma.has(k))throw new Error('Foundation duplicate New Word lemma: '+w.de);
  fLemma.add(k);
}
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
if(dictTotal!==17000)throw new Error('17K dictionary actual count is '+dictTotal);
for(const id of ['gameLevel','gameScore','gameStreak','gameBest','gameResetScore','gameMeaningNew','gameListenPlay','gameListenOptions','gameListenNew','gameSpellPlay','gameSpellInput','gameSpellCheck','gameSpellNew','gameArticleNew','gameSentenceTarget','gameSentenceTokens','gameSentenceBuilt','gameSentenceCheck','gameSentenceNew','gameSpeedPrompt','gameSpeedInput','gameSpeedTimer','gameSpeedStart','gameSpeedCheck'])if(!seen.has(id))throw new Error('Missing pro-game DOM id '+id);
for(const token of ['#gameLevel','#gameResetScore','#gameMeaningNew','#gameListenPlay','#gameSpellCheck','#gameArticleNew','#gameSentenceCheck','#gameSpeedStart','#gameSpeedCheck'])if(!app.includes(token))throw new Error('Game runtime handler missing '+token);
if(app.includes('completdLessons'))throw new Error('Known completedLessons typo still present');
if(!app.includes('foundationAlphabet')||!app.includes('foundationContent'))throw new Error('Foundation renderer not wired');

const manifest=JSON.parse(read('manifest.webmanifest'));if(!manifest.name||!manifest.start_url)throw new Error('Bad web manifest');
const contentManifest=JSON.parse(read('assets/data/content-manifest.json'));if(contentManifest.lessons!==D.lessons.length||contentManifest.vocabularyEntries!==D.vocabulary.length)throw new Error('Content manifest out of sync');
const modules=JSON.parse(read('config/modules.json'));for(const l of levels)if(!modules.modules.some(x=>x.id===l&&x.enabled))throw new Error(`Enabled module missing: ${l}`);
const sw=read('sw.js');for(const asset of ['index.html','assets/css/app.css','assets/js/data-core.js','assets/js/data-lessons.js','assets/js/data-vocabulary.js','assets/js/data-grammar.js','assets/js/data-phrases.js','assets/js/data-pronunciation.js','assets/js/data-professional.js','assets/js/data-exams.js','assets/js/module-loader.js','assets/js/app.js','assets/js/german-text.js'])if(!sw.includes(asset))throw new Error(`Service worker does not cache ${asset}`);
console.log(`PASS: ${D.levels.length} levels, ${D.lessons.length} lessons, 900 unique Foundation new words, 17,000 dictionary entries, ${D.vocabulary.length} curated visual vocab, ${D.grammar.length} grammar, ${D.phrases.length} phrases, ${D.pronunciationDrills.length} pronunciation drills, ${D.mockExams.length} mocks, pro-game runtime wired.`);
