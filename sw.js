const CACHE='lernde-v4-20261004-final8';
const ASSETS=['./','./index.html','./manifest.webmanifest','./assets/css/app.css','./assets/js/data-core.js','./assets/js/data-lessons.js','./assets/js/data-vocabulary.js','./assets/js/data-grammar.js','./assets/js/data-phrases.js','./assets/js/data-pronunciation.js','./assets/js/data-foundation.js','./assets/js/data-professional.js','./assets/js/data-exams.js','./assets/js/module-loader.js','./assets/js/app.js','./assets/js/german-text.js','./config/modules.json','./docs/ARCHITECTURE.md','./assets/icons/icon-192.png','./assets/icons/icon-512.png','./assets/data/content-manifest.json','./assets/data/dictionary-manifest.json','./assets/data/lesson-vocabulary-foundation.json','./assets/data/lesson-vocabulary-b2.json','./assets/data/lesson-vocabulary-b1.json','./assets/data/lesson-vocabulary-a2.json','./assets/data/lesson-vocabulary-a1.json'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  if(e.request.mode==='navigate'){
    e.respondWith(fetch(e.request).then(r=>r).catch(()=>caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{
    if(r && r.ok && new URL(e.request.url).origin===self.location.origin){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}
    return r;
  })));
});
