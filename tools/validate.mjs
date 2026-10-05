import fs from 'node:fs';
import vm from 'node:vm';
const root=new URL('../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');
const exists=p=>fs.existsSync(new URL(p,root));
const required=['index.html','manifest.webmanifest','sw.js','assets/css/app.css','assets/js/data-core.js','assets/js/data-lessons.js','assets/js/data-vocabulary.js','assets/js/data-grammar.js','assets/js/data-phrases.js','assets/js/data-pronunciation.js','assets/js/data-foundation.js','assets/js/data-professional.js','assets/js/data-exams.js','assets/js/module-loader.js','assets/js/app.js','assets/js/german-text.js','config/modules.json','CONTENT_GOVERNANCE.md','docs/ARCHITECTURE.md','assets/data/content-manifest.json','assets/data/dictionary-manifest.json','assets/data/lesson-vocabulary-a1-b2.json'];
for(const x of required)if(!exists(x))throw new Error('Missing: '+x);
for(const x of ['assets/js/module-loader.js','assets/js/app.js','assets/js/german-text.js'])new vm.Script(read(x),{filename:x});

const context={window:{}};vm.createContext(context);
for(const x of ['assets/js/data-core.js','assets/js/data-lessons.js','assets/js/data-vocabulary.js','assets/js/data-grammar.js','assets/js/data-phrases.js','assets/js/data-pronunciation.js','assets/js/data-foundation.js','assets/js/data-professional.js','assets/js/data-exams.js'])vm.runInContext(read(x),context);
const D=context.window.LERNDE_DATA;if(!D)throw new Error('LERNDE_DATA not loaded');
const modules=JSON.parse(read('config/modules.json'));
const enabled=modules.modules.filter(x=>x.enabled).sort((a,b)=>(a.order??99)-(b.order??99)),allowed=new Set(enabled.map(x=>x.id));
for(const m of enabled){if(!m.lessonVocabularyPath)throw new Error('lessonVocabularyPath missing: '+m.id);if(!D.levels.some(x=>x.id===m.id))throw new Error('Missing level '+m.id);if(!D.lessons.some(x=>x.level===m.id))throw new Error('No lessons for '+m.id);}
for(const c of ['lessons','grammar','vocabulary','phrases'])for(const x of D[c])if(!allowed.has(x.level))throw new Error('Unknown level '+x.level+' in '+c);

const vocabIds=new Set();for(const x of D.vocabulary){if(vocabIds.has(x.id))throw new Error('Duplicate vocab id '+x.id);vocabIds.add(x.id);if(!x.de||!x.bn||!x.en||!x.level)throw new Error('Bad vocab '+x.id);}
const lessonIds=new Set();for(const x of D.lessons){if(lessonIds.has(x.id))throw new Error('Duplicate lesson '+x.id);lessonIds.add(x.id);if(!x.title||!x.description||!x.steps?.length)throw new Error('Bad lesson '+x.id);}
if(D.grammar.length!==70)throw new Error('Expected exactly 70 grammar topics, got '+D.grammar.length);
for(const g of D.grammar){if(!g.id||!g.title||!g.rule||!g.memory||!g.good)throw new Error('Bad grammar '+g.id);if(!Array.isArray(g.examples)||g.examples.length<5)throw new Error('Grammar must have at least 5 examples: '+g.id);for(const ex of g.examples)if(!String(ex||'').trim())throw new Error('Empty grammar example '+g.id);}
if(D.phrases.length<500)throw new Error('Phrase Bank must contain 500+ phrases');
const phraseIds=new Set(),phraseDe=new Set();for(const p of D.phrases){if(!p.id||!p.de||!p.bn||!p.en||!p.bnPron||!p.level||!p.context)throw new Error('Bad phrase '+(p.id||'?'));if(phraseIds.has(p.id))throw new Error('Duplicate phrase id '+p.id);phraseIds.add(p.id);const k=String(p.de).trim().toLocaleLowerCase('de-DE');if(phraseDe.has(k))throw new Error('Duplicate phrase '+p.de);phraseDe.add(k);}
for(const e of D.mockExams){if(!e.questions?.length)throw new Error('Empty exam '+e.id);for(const q of e.questions)if(!Array.isArray(q.options)||q.answer<0||q.answer>=q.options.length)throw new Error('Bad answer in '+e.id);}
if((D.pronunciationDrills||[]).length<15)throw new Error('Pronunciation curriculum is too small');
if((D.shadowingSets||[]).length<5)throw new Error('Shadowing sets missing');
if((D.professionalTopics||[]).length<16)throw new Error('Professional German content incomplete');
if((D.germanyLifeTopics||[]).length<12)throw new Error('Germany-life content incomplete');
if(!Array.isArray(D.foundationAlphabet)||D.foundationAlphabet.length!==30)throw new Error('Foundation alphabet must contain 30 entries');
for(const a of D.foundationAlphabet)if(!a.letter||!a.name||!a.bnPron||!a.example||!a.bn)throw new Error('Incomplete alphabet entry '+(a.letter||'?'));
if(!D.foundationContent||Object.keys(D.foundationContent).filter(x=>x.startsWith('FOUNDATION-')).length!==18)throw new Error('Foundation must have 18 lesson-specific records');
for(const l of D.lessons.filter(x=>x.level==='FOUNDATION')){const d=D.foundationContent[l.id];if(!d||!d.goal||!d.why||!Array.isArray(d.rules)||d.rules.length<3||!Array.isArray(d.examples)||d.examples.length<3||!Array.isArray(d.dialogue)||d.dialogue.length<2||!Array.isArray(d.tasks)||d.tasks.length<2)throw new Error('Incomplete Foundation lesson '+l.id);}

const lessonLemmaSeen=new Set();let lessonTotal=0;
for(const m of enabled){const p=m.lessonVocabularyPath;if(!exists(p))throw new Error('Missing lesson vocabulary pack '+p);const pack=JSON.parse(read(p));if(pack.level!==m.id)throw new Error('Wrong pack level in '+p);const lessons=D.lessons.filter(x=>x.level===m.id);if(pack.total!==lessons.length*50)throw new Error(m.id+' pack total mismatch');for(const l of lessons){const words=pack.lessons?.[l.id];if(!Array.isArray(words)||words.length!==50)throw new Error(l.id+' must contain exactly 50 reference terms');for(const w of words){const k=String(w.de||'').trim().toLocaleLowerCase('de-DE');if(!k||!w.bn||!w.en)throw new Error('Bad lesson term '+l.id+' '+(w.id||'?'));if(!w.source||/\b(ai|generated|synthetic)\b/i.test(String(w.source)))throw new Error('Untrusted lexical source '+l.id+' '+w.de);if(lessonLemmaSeen.has(k))throw new Error('Duplicate lesson reference lemma: '+w.de);lessonLemmaSeen.add(k);lessonTotal++;}}}
if(lessonTotal!==3400||lessonLemmaSeen.size!==3400)throw new Error('Expected exactly 3400 unique source-backed lesson terms');
const combined=JSON.parse(read('assets/data/lesson-vocabulary-a1-b2.json'));if(combined.total!==2500||combined.uniqueLemmas!==2500)throw new Error('Combined A1-B2 pack out of sync');

const dm=JSON.parse(read('assets/data/dictionary-manifest.json'));if(dm.total!==17000||dm.chunks!==4||dm.chunkSize!==4250)throw new Error('Dictionary manifest mismatch');
let dictTotal=0;const dictKeys=new Set();for(let i=1;i<=4;i++){const p='assets/data/dictionary-'+String(i).padStart(2,'0')+'.json';if(!exists(p))throw new Error('Missing '+p);const part=JSON.parse(read(p));if(part.length!==4250)throw new Error('Dictionary chunk size mismatch '+p);dictTotal+=part.length;for(const w of part){if(!w.id||!w.de||!w.bn||!w.en)throw new Error('Incomplete dictionary entry '+(w.id||'?'));const k=String(w.de).trim().toLocaleLowerCase('de-DE');if(dictKeys.has(k))throw new Error('Duplicate dictionary key '+w.de);dictKeys.add(k);}}
if(dictTotal!==17000||dictKeys.size!==17000)throw new Error('17K dictionary unique-count mismatch');

const html=read('index.html'),app=read('assets/js/app.js'),gt=read('assets/js/german-text.js'),loader=read('assets/js/module-loader.js'),css=read('assets/css/app.css'),sw=read('sw.js');
const domIds=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]),seenDom=new Set();for(const id of domIds){if(seenDom.has(id))throw new Error('Duplicate DOM id '+id);seenDom.add(id);}
for(const id of ['view-home','view-hub','view-course','view-vocabulary','view-dictionary','view-phrases','view-grammar','view-pronunciation','view-games','view-skills','view-translator','view-professional','view-germany','view-exam','view-about','lessonModal','vocabModal','examModal','installModal','learnerCard','learnerName','profileNameInput','phrasePager','dictSearch','dictResults','dictPager','grammarSearch','grammarList','grammarDetail','memoryRules','reviewCard','mistakeList','progressSummary','gameAccuracy','gameMissionBar'])if(!seenDom.has(id))throw new Error('Missing DOM id '+id);
for(const legacy of ['view-roadmap','view-memory','view-review','view-mistakes','view-progress'])if(seenDom.has(legacy))throw new Error('Legacy split view still present '+legacy);
for(const s of ['assets/js/data-core.js','assets/js/data-lessons.js','assets/js/data-vocabulary.js','assets/js/data-grammar.js','assets/js/data-phrases.js','assets/js/data-pronunciation.js','assets/js/data-foundation.js','assets/js/data-professional.js','assets/js/data-exams.js','assets/js/module-loader.js','assets/js/app.js','assets/js/german-text.js'])if(!html.includes('src="'+s+'"'))throw new Error('Script not loaded: '+s);

for(const token of ['normalizeState(','LernDELookupExternal','DICT_CHUNK_SIZE=4250','loadDictionaryChunk(','lookupDictionaryExact(','sentencePracticeHtml(','activateSentencePractices(','popstate',"e.error==='aborted'",'installModal','profileName','renderLearningHub','selectGameMode'])if(!app.includes(token))throw new Error('Runtime feature missing '+token);
if(app.includes('loadExtendedDictionary(')||app.includes('extendedDictionaryIndex')||app.includes('Promise.all(urls.map'))throw new Error('Full 17K dictionary preload detected');
if(/(^|[^$])\$\([^;\n]*\)\.forEach/m.test(app))throw new Error('querySelector(...).forEach runtime bug detected');
if(!gt.includes('resolveMeaning')||!gt.includes('addEntries'))throw new Error('German exact-meaning engine incomplete');
if(gt.includes("replace(/(en|ern|er|es|e|n|s)$/"))throw new Error('Unsafe suffix-guessing lookup detected');
if(loader.includes('translatorPhrasest'))throw new Error('Translator registry typo remains');
if(!html.includes('cseashrafulislam@gmail.com')||!html.includes('mailto:cseashrafulislam@gmail.com'))throw new Error('Feedback contact missing');
for(const id of ['todayStartBtn','dashCourseStat','dashVocabStat','dashGameStat','dashSkillsStat','dashReviewStat','dashProgressStat'])if(!seenDom.has(id))throw new Error('Dashboard learning cards missing '+id);
if(!html.includes('data-jump="games"')||!html.includes('data-jump="skills"')||!html.includes('data-hub-target="hub-progress"'))throw new Error('Dashboard practice navigation incomplete');
if(html.includes('id="gameSentenceCheck"'))throw new Error('Sentence Builder still requires a manual Check button');
if(!css.includes('.sentence-practice')||!css.includes('.game-mode-tab')||!css.includes('.profile-editor')||!css.includes('.hub-tabs'))throw new Error('Integrated learner UI styles missing');
for(const chunk of ['dictionary-01.json','dictionary-02.json','dictionary-03.json','dictionary-04.json'])if(sw.includes("'./assets/data/"+chunk+"'"))throw new Error('Dictionary chunk must not be install-preloaded: '+chunk);
if(!sw.includes("lernde-v6-20261005-integrated"))throw new Error('Service worker cache version not updated');
const gameIds=['gameLevel','gameScore','gameStreak','gameBest','gameAccuracy','gameResetScore','gameMeaningNew','gameListenPlay','gameListenOptions','gameListenNew','gameSpellPlay','gameSpellInput','gameSpellCheck','gameSpellNew','gameArticleNew','gameSentenceTarget','gameSentenceTokens','gameSentenceBuilt','gameSentenceNew','gameSpeedPrompt','gameSpeedInput','gameSpeedTimer','gameSpeedStart','gameSpeedCheck','gameCasePrompt','gameCaseOptions','gameCaseResult','gameCaseNew','gameMemoryBoard','gameMemoryResult','gameMemoryNew'];
for(const id of gameIds)if(!seenDom.has(id))throw new Error('Missing game DOM id '+id);
for(const fn of ['newMeaningGame','newListenGame','newSpellGame','newArticleGame','newSentenceGame','newSpeedGame','newCaseGame','newMemoryGame'])if(!app.includes('function '+fn+'('))throw new Error('Missing game implementation '+fn);

const manifest=JSON.parse(read('manifest.webmanifest'));if(!manifest.name||!manifest.start_url||manifest.display!=='standalone')throw new Error('Bad web manifest');
const cm=JSON.parse(read('assets/data/content-manifest.json'));if(cm.lessons!==D.lessons.length||cm.vocabularyEntries!==D.vocabulary.length||cm.grammarTopics!==D.grammar.length||cm.phraseEntries!==D.phrases.length||cm.lessonVocabularyEntries!==3400||cm.uniqueNewLessonLemmas!==3400||cm.extendedDictionaryEntries!==17000||cm.gameModes!==8||cm.professionalTopics!==D.professionalTopics.length||cm.germanyLifeTopics!==D.germanyLifeTopics.length||cm.sentencePractice!=='auto-check'||cm.dictionaryLoading!=='chunked-low-memory')throw new Error('Content manifest out of sync');
console.log(`PASS: ${D.levels.length} levels, ${D.lessons.length} lessons, ${D.grammar.length} grammar topics × 5+ examples, ${D.phrases.length} phrases, 3400 unique lesson terms, 17000 chunked dictionary entries, 8 focused games, auto sentence practice, Learning Hub, profile/feedback, PWA history/install/speech hardening.`);
