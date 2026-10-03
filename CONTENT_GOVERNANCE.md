# LernDE content governance

## Publication states
Draft → Language validation → CEFR/topic mapping → Example validation → Pronunciation/audio check → Reviewed → Published.

## Canonical-data rule
Each German fact has one authoritative record. Lessons, games, review and exams may render/reference it but must not maintain conflicting editable copies.

## Vocabulary review checklist
A published lemma should have, where applicable:
- stable ID and canonical German lemma
- article/gender and plural for nouns
- relevant principal forms/auxiliary/separability/reflexive behavior for verbs
- part of speech
- contextual Bangla meaning and English support meaning
- CEFR/topic metadata
- example sentence checked for grammar/naturalness
- pronunciation metadata/audio path or safe `de-DE` TTS fallback
- visual cue only when it genuinely helps memory
- no duplicate inflection counted as a new lemma

## Grammar review checklist
- canonical rule is correct
- exceptions/constraints are not hidden by a mnemonic
- mnemonic is clearly a memory aid, not the rule itself
- examples are natural and match the claimed level/context
- common mistake is accurate

## Pronunciation rule
Target Standard German. Bangla transliteration is an approximate beginner scaffold, never the authoritative sound source. Device TTS/speech recognition varies; do not label a browser-recognition percentage as a pronunciation/native-accent score.

## Exam content
LernDE mock/practice tasks are original. They may follow CEFR/Goethe/telc-style skill structures but must not copy protected papers or claim official authorization/certification.

## Mutable Germany-life information
Language for Bürgeramt, Anmeldung, insurance, residence matters, transport, work etc. may be taught as language. Current legal/administrative requirements must not be frozen into static lessons as permanent facts; verify official/current sources when those rules matter.

## AI/translation
Generated content is not automatically publishable truth. AI-assisted drafts require validation. Arbitrary translation should not be guessed by a static rule bank. If an external AI/translation provider is introduced, secrets stay server-side.

## Change discipline
Keep stable IDs. Prefer additive compatible content/schema changes. Content corrections should be small traceable Git commits. If storage/content schemas change, provide a migration path so existing learner progress is preserved.
