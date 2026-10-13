# English — Grade 1 short test 1 practice

A practice site for the Grade 1 English short test 1 (Sunday 18 October 2026), built from the official
Grade 1 Student's Book (term 1, 2026 edition), pages 29–32, plus the test words on the school's card.

- **Big and small letters**: A C E H L T F M B. Pick the small or big letter, or join them on a matching board.
- **Letter and picture**: which picture starts with a letter, which letter starts a word, and a matching board.
- **Numbers and counting 1–6** (4, 5, 6 are page 31): count the things, find the group, and a matching board.
- **Missing letter**: the test words box, ant, mug, lamb, bat (the card writes «lab»; the book's word is lamb),
  plus fan, fox, frog, feet, man, mat, bag, bed, cat, hat.
- **Mock test**: 12 questions, three from each lesson.

Arabic instructions are spoken by Maryam (Kuwaiti); English letters, words and praise by Alice (British educator,
chosen by the family on 2026-10-13). One copy for every child: the wording never speaks to a girl or a boy.

## Status
Preview only (13 October 2026): not published, not connected to the Hub, not assigned to any account.

## Development
```bash
npm install
npm run dev            # preview mode at http://127.0.0.1:4185
npm run check          # lint, types, unit tests, seed check, preview build
npx playwright test    # iPhone/iPad WebKit + desktop Chromium flows and Hub contract
npm run build:hub      # production Hub build into dist-hub/ (base /english-grade1-quiz/)
```

- Content and permanent question keys: `src/data/catalog.ts`
- Narration: `python3 scripts/generate-audio.py` (skips unchanged clips), `python3 scripts/check-audio.py` (transcription check)
- Hub seed: `npm run generate:hub-seed` → `integration/seed-english-grade1.sql`
