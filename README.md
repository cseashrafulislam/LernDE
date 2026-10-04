# LernDE — German Learning Platform

LernDE is a mobile-first PWA for Bangla-speaking learners progressing from **Foundation to professional B2**.

## Product scope
- 5 learning stages: Foundation, A1, A2, B1, B2
- 68 guided lessons
- 180 curated mastery vocabulary cards
- 3,400 unique source-backed reference terms attached to lessons
- 17,000 unique CC0 reference dictionary entries
- 51 grammar topics and 37 reusable phrase patterns
- 18 pronunciation drills + shadowing
- 8 active-recall game modes and 4-skills practice
- 16 Professional German / IT scenarios
- 12 Germany-life language scenarios
- 5 original mock exams
- spaced review, mistake tracking, safe local progress export/import
- installable/offline PWA

## Learning architecture
LernDE deliberately separates **course mastery** from **reference breadth**. Guided lesson outcomes, curated vocabulary, grammar and phrases are the primary curriculum. The 3,400 lesson reference terms and 17K dictionary broaden exposure but are not presented as official CEFR word lists. Games use curated level vocabulary first.

## German word interaction
German learning text is tappable/clickable site-wide. Pronunciation uses the best available German (`de-DE`) browser/system voice. Meaning lookup priority is curated core → loaded lesson vocabulary → exact 17K dictionary match. Selected validated inflections resolve to a canonical lemma; unsafe suffix-stripping guesses are not used.

Bangla transliteration is a learner scaffold, not the pronunciation authority. Device voice quality varies.

## Content provenance
The extended dictionary and lesson reference vocabulary use the CC0 source documented in `THIRD_PARTY_DATA.md`. Canonical lexical content must be a real source-backed German entry; AI-generated/synthetic vocabulary is not accepted as course truth.

## Quality gate
Run:
```bash
node tools/validate.mjs
```
The validator checks syntax, required UI, 68 lessons, 3,400 unique source-backed lesson terms, 17,000 unique dictionary entries, PWA cache coverage, game wiring, content provenance and manifest consistency.

## Deployment
Cloudflare Pages can publish the repository as a static site with no build step. For long-term safety, configure GitHub so **LernDE Production QA** is required before changes reach `main`.

## Limits
- Browser speech synthesis/recognition varies by device.
- Recognition similarity is not a native-accent score.
- Germany-life modules teach language; current rules must be checked from current official sources.
- Mock exams are original practice, not official Goethe/telc papers.
- Full unrestricted translation/AI requires a server-side provider; never put provider secrets in the static frontend.
