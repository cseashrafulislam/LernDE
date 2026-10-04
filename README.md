# LernDE — German Learning Platform

**German from Zero to Professional** — a Cloudflare Pages-ready static PWA designed for a Bengali-speaking self-learner.

Current production curriculum: **Foundation → A1 → A2 → B1 → B2**. The app shell is intentionally level-agnostic so future C1/C2 can be added as content modules instead of rebuilding the application.

## Production scope (v4)
- **68 structured lessons** across Foundation, A1, A2, B1 and B2
- **18-step Foundation bootcamp** covering alphabet/spelling, vowel length, umlauts, diphthongs, ich-/ach-Laut, consonant clusters, R/H/final devoicing, word stress, sentence rhythm, minimal-pair listening, shadowing, survival language and a checkpoint
- **18 pronunciation drills** with articulation guidance, common traps, slow/natural playback, shadowing and optional browser speech-recognition feedback
- **180 curated mastery-card entries + 3,400 unique lesson New Words (50 × 68 lessons) + a 17,000-entry source-backed reference dictionary**. Lesson expansion entries never repeat as New Words across the 68 lessons.
- **51 grammar topics** with canonical rule, memory aid and examples
- **37 reusable phrase/chunk patterns**
- Reading, Listening, Writing and Speaking practice
- Global German word interaction: tap/click a German learning word → highlight → pronounce that word → tiny nearby Bangla meaning
- Memory Coach, spaced revision, mistake tracking and **8 playable learning games**
- A1, A2, B1, B2 and B2 Professional **original** practice mocks
- Professional German, Germany-life language and IT/.NET interview practice
- Deterministic course-bank Translator/Explain/Corrector (no unsafe client-side secret)
- Local progress with JSON export/import
- Responsive mobile navigation/modals
- PWA manifest, offline service worker and Cloudflare security headers
- External module loader for future C1/C2 content packs

## Pronunciation standard
LernDE targets **Standard German (de-DE)**. The pronunciation lab prioritizes the best German voice exposed by the learner's device/browser, teaches articulation, stress and rhythm, and uses shadowing/minimal-pair practice.

Browser TTS quality varies by device, so Bangla pronunciation text and browser speech recognition are **learning aids**, not proof of a native accent. Curated human/native recordings can be added later per content item without changing the lesson engine.

## Content integrity
Published learning facts must come from one canonical content record. Do not duplicate an editable vocabulary or grammar fact across pages. Bangla pronunciation is only an approximation; German sound/audio is primary.

The bundled translator is deliberately deterministic over curated course content. Unsupported arbitrary text should not be guessed. If a future unrestricted translator/AI tutor is added, keep provider secrets in a server-side Cloudflare Worker/API, never in this static frontend.

Mocks are original LernDE practice materials and must not be represented as official Goethe/telc papers or certification.

## GitHub → Cloudflare Pages deployment
Production repository: `cseashrafulislam/LernDE`

Recommended Cloudflare Pages settings:
- Production branch: `main`
- Framework preset: **None**
- Build command: empty
- Output directory: repository root (`/`)
- Automatic production deployments: enabled

A push to `main` then becomes a traceable production deployment. Future maintenance should normally be small file/module commits, not full ZIP replacement.

## Validate locally
With Node.js:

```bash
node tools/validate.mjs
```

Optional local server:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Global German word interaction
German learning text is rendered with `data-german-text`. Each rendered German word can be tapped/clicked to play **only that word's German pronunciation**, briefly highlight it and show a compact nearby Bangla-meaning bubble. It does not open a large modal and does not play decorative click/beep sounds. Normal UI controls keep their original behavior.

## Add C1/C2 later
Do **not** fork `index.html`, the progress engine, the review engine, German word engine or exam renderer.

Add a future level under `content/levels/<LEVEL>/`, register it in `config/modules.json`, validate and commit. See:
- `docs/ARCHITECTURE.md`
- `docs/ADDING_A_LEVEL.md`
- `content/module-template/`

## Content status
The application/runtime is production-structured; the vocabulary bank is intentionally **curated rather than count-inflated**. The current verified seed is 180 entries. Expansion toward the 10,000-entry target should be reviewed in batches with stable IDs, CEFR/topic metadata, German forms, contextual Bangla meaning and pronunciation checks.

## Vocabulary quality tiers
1. **Core curated lesson content** — grammar, examples, phrases and visual/mastery cards used for structured CEFR learning.
2. **Lesson New Word Expansion** — 50 unique real/source-backed German entries per lesson (3,400 total) for lexical breadth. A lemma is introduced as New only once.
3. **17K reference dictionary** — broad search/reference coverage; it is not represented as an official CEFR list.

Words intentionally reappear in examples, revision and games because repetition is required for learning; only the **New Word count** is deduplicated.
