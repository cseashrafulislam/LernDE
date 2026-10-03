# LernDE architecture

LernDE is a **stable learning engine + versioned content packs**. Current production scope is Foundation through B2. C1/C2 are future modules, not forks of the application.

## Design priorities
1. Correct German and stable learner progress
2. Mobile-first self-learning UX
3. One source of truth per vocabulary/grammar fact
4. Small, safe future updates
5. Offline/PWA resilience without stale-release traps
6. No client-side secrets

## Stable engine
- `index.html` — application shell and reusable views
- `assets/css/app.css` — common responsive UI
- `assets/js/app.js` — navigation, course rendering, progress, review, games, pronunciation, exams and translator/corrector integration
- `assets/js/german-text.js` — site-wide German token interaction: word highlight + exact-word pronunciation + compact Bangla meaning
- `assets/js/module-loader.js` — optional external level/content-pack loader
- `sw.js` — versioned PWA/offline cache
- `_headers` — Cloudflare Pages security/cache headers

## Bundled content
The current Foundation→B2 release is split into versionable browser data packs under `assets/js/`: `data-core.js`, `data-lessons.js`, `data-vocabulary.js`, `data-grammar.js`, `data-phrases.js`, `data-pronunciation.js`, `data-professional.js`, and `data-exams.js`. `tools/build_data.py` remains the build/source point for the curated dataset.

This split prevents a small vocabulary or exam correction from forcing an unrelated monolithic content bundle replacement. Current generated content counts are in `assets/data/content-manifest.json`.

## Module registry
`config/modules.json` is the module contract. Foundation–B2 are currently bundled. A future external module uses:

```json
{
  "id": "C1",
  "enabled": true,
  "order": 5,
  "label": "C1",
  "bundled": false,
  "contentPath": "content/levels/C1"
}
```

The loader then reads the split files for that module:
- `module.json`
- `lessons.json`
- `vocabulary.json`
- `grammar.json`
- `phrases.json`
- `exams.json`

## Stable IDs and progress compatibility
Never recycle a published lesson/vocabulary/grammar ID for a different concept. Progress/review state references stable IDs. Future schema changes must migrate old local state rather than silently clearing learner progress.

The current storage key remains intentionally backward-compatible with the previous LernDE/B1GO local release where possible.

## German content single source of truth
A vocabulary lemma owns its canonical editable facts: article/gender, plural/forms, meanings, CEFR/topic metadata, examples and pronunciation metadata. Lessons/games/revision should reference that concept instead of creating conflicting copies.

Inflected forms (for example `geht`, `ging`, `gegangen`) should resolve to the canonical lemma (`gehen`) rather than count as separate vocabulary entries.

Grammar follows the same rule: one canonical rule record can appear in lessons, revision, games and exam preparation.

## Pronunciation architecture
The browser runtime requests German (`de-DE`) speech synthesis and prioritizes better/exact German voices when available. The pedagogy combines:
- articulation/mouth-position cues
- minimal pairs and listening discrimination
- slow and natural-speed playback
- word stress and sentence rhythm
- shadowing
- optional speech-recognition transcript comparison

Speech-recognition similarity is not an accent score. For future premium/native audio, add a recorded audio reference per canonical content item and let the same speaking engine prefer it over TTS.

## Vocabulary scale
The schema/runtime is intended for **10,000+ curated lemmas**, but initial release content must not be padded with unreliable or duplicate forms. Large vocabulary should be split/versioned by level/topic and lazy-loaded when needed.

## Security
This is a static learning application. Do not place paid API keys, AI-provider secrets or privileged tokens in browser code. Future unrestricted translation/AI should be mediated by a server-side Cloudflare Worker/API with authentication, quotas and abuse controls.

## PWA/cache strategy
The service-worker cache has an explicit release version. Core shell assets are precached; same-origin runtime resources can be cached. A release changes the cache version so stale shells are removed during activation.

Do not make learner progress depend on service-worker cache. Progress lives separately in browser storage and can be exported/imported.

## Deployment/update strategy
GitHub `main` is the production source of truth. Cloudflare Pages should deploy automatically from `main`.

Normal maintenance:
1. change only affected files/content pack
2. run `node tools/validate.mjs`
3. commit with a focused message
4. push/merge to `main`
5. Cloudflare deploys the new revision

Do not replace the entire site for a one-word correction.
