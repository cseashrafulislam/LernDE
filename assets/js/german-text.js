(() => {
  'use strict';
  const D = window.LERNDE_DATA || {};
  const bubble = document.createElement('div');
  bubble.className = 'de-word-bubble';
  bubble.hidden = true;
  document.body.appendChild(bubble);
  let activeWord = null;
  let hideTimer = null;

  const common = {
    ich:'আমি', du:'তুমি', er:'সে (পুরুষ)', sie:'সে/তারা/আপনি', es:'এটি', wir:'আমরা', ihr:'তোমরা',
    mein:'আমার', meine:'আমার', meinen:'আমার', meiner:'আমার', dein:'তোমার', ihre:'তার/তাদের', ihr:'তার/তাদের',
    der:'নির্দিষ্ট article (পুংলিঙ্গ)', die:'নির্দিষ্ট article (স্ত্রীলিঙ্গ/বহুবচন)', das:'নির্দিষ্ট article (নপুংসক)',
    ein:'একটি/একজন', eine:'একটি/একজন', einen:'একটি/একজন (Akkusativ masculine)', einem:'একটি/একজন (Dativ)', einer:'একটি/একজন',
    und:'এবং', oder:'অথবা', aber:'কিন্তু', denn:'কারণ/কেননা', weil:'কারণ', dass:'যে', wenn:'যদি/যখন', obwohl:'যদিও', trotzdem:'তবুও',
    mit:'সঙ্গে', ohne:'ছাড়া', für:'জন্য', von:'থেকে/এর', zu:'দিকে/তে', nach:'পরে/দিকে', aus:'থেকে/বাইরে', bei:'কাছে/এ', in:'ভিতরে/এ', an:'কাছে/এ', auf:'উপর/এ',
    im:'in dem = এর মধ্যে/এ', am:'an dem = এ/দিনে', zum:'zu dem = এর দিকে/জন্য', zur:'zu der = এর দিকে/জন্য', ins:'in das = ভিতরে/তে',
    ist:'হয়/আছে', bin:'আমি আছি/হই', bist:'তুমি আছ/হও', sind:'আছে/হই/হয়', seid:'তোমরা আছ/হও', war:'ছিল', waren:'ছিল',
    habe:'আমার আছে/আমি করেছি', hast:'তোমার আছে', hat:'তার আছে', haben:'থাকা/আছে',
    werde:'হব/করব', wird:'হবে', werden:'হওয়া/হবে', kann:'পারি', können:'পারা', könnte:'পারতাম/পারা যেত',
    muss:'অবশ্যই/করতে হবে', müssen:'করতে হওয়া', soll:'উচিত/কথা', sollte:'উচিত ছিল/উচিত', darf:'অনুমতি আছে', dürfen:'অনুমতি থাকা',
    möchte:'চাই (ভদ্রভাবে)', wollen:'চাওয়া', will:'চাই', gerne:'আনন্দের সাথে/পছন্দ করে', bitte:'দয়া করে/অনুগ্রহ করে', danke:'ধন্যবাদ',
    nicht:'না/নয়', kein:'কোনো নয়', keine:'কোনো নয়', sehr:'খুব', auch:'এছাড়াও', nur:'শুধু', noch:'এখনও/আরও', schon:'ইতিমধ্যে',
    heute:'আজ', morgen:'আগামীকাল/সকাল', gestern:'গতকাল', jetzt:'এখন', immer:'সবসময়', oft:'প্রায়ই', manchmal:'কখনও কখনও',
    hier:'এখানে', dort:'সেখানে', wo:'কোথায়', wie:'কীভাবে/কেমন', was:'কি', wer:'কে', wann:'কখন', warum:'কেন',
    guten:'শুভ', tag:'দিন', hallo:'হ্যালো', deutsch:'জার্মান ভাষা', deutschland:'জার্মানি',
    lernen:'শেখা', lerne:'শিখি/শিখছি', lernt:'শেখে/শিখছে', sprechen:'কথা বলা', sprechen:'কথা বলা', verstehen:'বোঝা', verstehe:'বুঝি',
    gehen:'যাওয়া', gehe:'যাই', geht:'যায়/কেমন আছে', kommen:'আসা', komme:'আসি', fahren:'যানবাহনে যাওয়া', fahre:'যাই',
    machen:'করা', mache:'করি', arbeiten:'কাজ করা', arbeite:'কাজ করি', wohnen:'বাস করা', wohne:'বাস করি', heißen:'নাম হওয়া', heiße:'আমার নাম',
    essen:'খাওয়া', esse:'খাই', trinken:'পান করা', brauche:'প্রয়োজন', brauchen:'প্রয়োজন হওয়া', helfen:'সাহায্য করা', hilfe:'সাহায্য',
    problem:'সমস্যা', lösung:'সমাধান', zeit:'সময়', termin:'অ্যাপয়েন্টমেন্ট', arbeit:'কাজ', beruf:'পেশা', software:'সফটওয়্যার',
    apfel:'আপেল', kaffee:'কফি', wasser:'পানি', haus:'বাড়ি', bahnhof:'রেলস্টেশন', bus:'বাস', zug:'ট্রেন',
    ja:'হ্যাঁ', nein:'না', gut:'ভালো', schlecht:'খারাপ', neu:'নতুন', wichtig:'গুরুত্বপূর্ণ', möglich:'সম্ভব', schwierig:'কঠিন', einfach:'সহজ'
  };

  const index = new Map(Object.entries(common));
  function indexVocabulary(){
    for (const w of D.vocabulary || []) {
      if (w.de) index.set(normalize(w.de), w.bn || w.en || '');
      if (w.plural) {
        const parts = String(w.plural).trim().split(/\s+/);
        const noun = parts[parts.length - 1];
        if (noun) index.set(normalize(noun), w.bn || w.en || '');
      }
    }
  }
  indexVocabulary();
  window.LernDEReady?.then?.(()=>indexVocabulary());

  function normalize(word) {
    return String(word || '').toLocaleLowerCase('de-DE').replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '');
  }

  function lookup(word) {
    const key = normalize(word);
    if (!key) return '';
    if (index.has(key)) return index.get(key);
    const candidates = [
      key.replace(/(en|ern|er|es|e|n|s)$/u, ''),
      key.replace(/(te|ten|tet|test)$/u, ''),
      key.replace(/^ge/u, '').replace(/(t|en)$/u, '')
    ].filter(x => x.length >= 3);
    for (const c of candidates) if (index.has(c)) return index.get(c);
    return '';
  }

  function speakWord(word) {
    if (typeof window.LernDESpeak === 'function') { window.LernDESpeak(word, 0.78); return; }
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.lang = 'de-DE'; u.rate = 0.78;
    const voices = speechSynthesis.getVoices();
    const de = voices.find(v => /^de-DE$/i.test(v.lang)) || voices.find(v => /^de(-|_)/i.test(v.lang)) || voices.find(v => /German|Deutsch/i.test(v.name));
    if (de) u.voice = de;
    speechSynthesis.speak(u);
  }

  function showBubble(target) {
    if (activeWord) activeWord.classList.remove('de-word-active');
    activeWord = target;
    activeWord.classList.add('de-word-active');
    const word = target.dataset.word || target.textContent.trim();
    const meaning = lookup(word);
    bubble.innerHTML = `<b>${escapeHtml(word)}</b><span>${escapeHtml(meaning || 'বাংলা অর্থ এখনো dictionary-তে যোগ হয়নি')}</span>`;
    bubble.hidden = false;
    const r = target.getBoundingClientRect();
    const maxLeft = Math.max(8, window.innerWidth - 238);
    const left = Math.min(maxLeft, Math.max(8, r.left + r.width / 2 - 110));
    let top = r.bottom + 7;
    if (top + 64 > window.innerHeight) top = Math.max(8, r.top - 66);
    bubble.style.left = `${left}px`;
    bubble.style.top = `${top}px`;
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hideBubble, 2300);
    speakWord(word);
  }

  function hideBubble() {
    bubble.hidden = true;
    if (activeWord) activeWord.classList.remove('de-word-active');
    activeWord = null;
  }

  function escapeHtml(v) {
    return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function decorateElement(el) {
    if (!el || el.dataset.germanReady === '1') return;
    if (el.closest('button, a, input, textarea, select, option, [contenteditable="true"]')) return;
    const text = el.textContent;
    if (!text || !text.trim()) return;
    const frag = document.createDocumentFragment();
    const re = /(\p{L}+(?:[’'\-]\p{L}+)*)/gu;
    let last = 0, match;
    while ((match = re.exec(text))) {
      if (match.index > last) frag.append(document.createTextNode(text.slice(last, match.index)));
      const span = document.createElement('span');
      span.className = 'de-word';
      span.tabIndex = 0;
      span.setAttribute('role', 'button');
      span.setAttribute('aria-label', `${match[0]} pronunciation and Bangla meaning`);
      span.dataset.word = match[0];
      span.textContent = match[0];
      frag.append(span);
      last = match.index + match[0].length;
    }
    if (last < text.length) frag.append(document.createTextNode(text.slice(last)));
    el.textContent = '';
    el.append(frag);
    el.dataset.germanReady = '1';
  }

  function decorate(root = document) {
    if (root.nodeType === 1 && root.matches?.('[data-german-text]')) decorateElement(root);
    root.querySelectorAll?.('[data-german-text]:not([data-german-ready="1"])').forEach(decorateElement);
  }

  document.addEventListener('click', e => {
    const w = e.target.closest('.de-word');
    if (w) { e.preventDefault(); e.stopPropagation(); showBubble(w); return; }
    if (!e.target.closest('.de-word-bubble')) hideBubble();
  });
  document.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList?.contains('de-word')) {
      e.preventDefault(); showBubble(e.target);
    }
    if (e.key === 'Escape') hideBubble();
  });
  window.addEventListener('scroll', hideBubble, {passive:true});
  window.addEventListener('resize', hideBubble);

  const observer = new MutationObserver(records => {
    for (const record of records) for (const node of record.addedNodes) if (node.nodeType === 1) decorate(node);
  });
  const start = () => {
    decorate(document);
    observer.observe(document.body, {subtree:true, childList:true});
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();

  window.LernDEGerman = { decorate, speakWord, lookup };
})();
