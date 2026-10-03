# Adding a future CEFR level (C1/C2)

LernDE v4 includes a shared module loader. A future level should be added without copying or forking the application shell.

## 1. Copy the template
Copy `content/module-template/` to `content/levels/C1/` (or `C2`).

Required files:
- `module.json`
- `lessons.json`
- `vocabulary.json`
- `grammar.json`
- `phrases.json`
- `exams.json`

Use stable IDs such as `C1-01`, `c1-v0001`, `c1-g001`. Never reuse an existing A1–B2 ID.

## 2. Register the level
Add one entry to `config/modules.json`:

```json
{"id":"C1","enabled":true,"order":5,"label":"C1","bundled":false,"contentPath":"content/levels/C1"}
```

The shared `assets/js/module-loader.js` loads and merges the new level before the app renders. No navigation fork, new progress engine or new German-word interaction code is required.

## 3. Validate content
Run:

```bash
node tools/validate.mjs
```

For a new external module, extend validation to include its files before publishing. Follow `CONTENT_GOVERNANCE.md`: draft → language review → CEFR mapping → example check → pronunciation/audio check → approved/published.

## 4. Deploy
Commit the new module files and registry change to `main`. Connected Cloudflare Pages will deploy the commit according to the project's Git integration settings.
