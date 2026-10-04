# LernDE architecture

LernDE is a **stable mobile-first learning engine + versioned content packs** for Foundation → B2.

## Priorities
1. Correct German and stable learner progress
2. Clear Zero → B2 learning progression
3. Curated course mastery separated from broad reference vocabulary
4. Exact-first word meaning lookup with source-backed fallback
5. Mobile/PWA reliability and offline resilience
6. Auditable content updates
7. No client-side secrets

## Runtime
- `index.html` — shell, navigation, roadmap and views
- `assets/css/app.css` — responsive UI
- `assets/js/app.js` — state, lessons, dictionary, games, reviews, exams and pronunciation
- `assets/js/german-text.js` — site-wide German word interaction
- `assets/js/module-loader.js` — module registry
- `assets/js/data-*.js` — curated curriculum
- `assets/data/lesson-vocabulary-*.json` — source-backed reference expansion
- `assets/data/dictionary-*.json` — 17K CC0 reference dictionary
- `sw.js` — versioned offline cache

## Course vs reference
Core course items carry pedagogical responsibility: level, meaning, grammar or communicative outcome. Reference vocabulary adds breadth but is not an official CEFR list. Games/review use curated level vocabulary first.

## Word meaning
Lookup order: explicit core → curated vocabulary → loaded lesson reference → exact dictionary. Only explicit validated inflections resolve to lemmas. Do not remove suffixes and guess another word.

## Pronunciation
Playback requests `de-DE` and prioritises the best available German voice. Bangla transliteration is approximate. Speech-recognition similarity is not an accent score.

## State
Imported progress is normalised and whitelisted before use. The established local-storage key remains for backward compatibility.

## Modules
`config/modules.json` is authoritative for enabled modules and lesson-vocabulary paths.

## PWA
Core UI, lesson packs and all four dictionary chunks are cached under a versioned service-worker cache.

## Production
`node tools/validate.mjs` is the release gate for syntax, data uniqueness/provenance, required UI, dictionary counts, PWA coverage and runtime hardening.
