# English — Grade 1 English test practice

A test-only practice site for the Grade 1 English test (Monday 9 November 2026), built from the
official Student's Book 1A (term 1, 2026 edition), pages 11–40: Unit 1 (Aa Cc Ee Hh Ll Tt, numbers
1–3) and Unit 2 (Ff Mm Bb Oo Xx Uu, numbers 4–6). It replaced the first short test's practice
(18 October 2026, pages 29–32) on 5 November 2026.

The school's card lists the same five parts as the book's two Progress Tests (pages 21–22 and 39–40),
so every question carries the test's own English instruction line, with a short Arabic help line
read by Maryam:

| Lesson | The test's line | On screen |
| --- | --- | --- |
| الحرف الكبير والصغير | Match the uppercase letters with the lowercase letters | capitals on top, small letters below with one extra, joined dot to dot; also «Circle the lowercase/uppercase letter» |
| الحرف والرقم والصورة | Match letters to pictures · Match numbers to pictures | the same boards with the book's pictures and groups to count; also «Circle the correct picture», «Count and circle» |
| الكلمة والصورة | Circle the correct word | a book picture and three words (the book's ears, horse, sister, orange first); a pen ring circles the choice |
| نسخ الكلمات والأرقام | Copy the following | the book's four lines; the child writes over the grey letters with a finger (letter pairs, 1 2 3, 4 5 6, cat, hat, ant, bat, fan, cut …) and the writing is checked |
| الحرف الناقص | Write the missing initial letters | a picture, the word on four lines with a box for its first letter, and six letter keys; the card's words train, toe, mat, lemon, on, car first |

155 questions. The mock test («الاختبار التجريبي», 10 questions) is laid out like the Progress Test:
Reading A–D (match letters, match letters to pictures, two «circle the word», match numbers), then
Writing A (two copy questions) and B (three missing letters, one of them from the card). Boards,
picture choices and letter keys are drawn afresh each round.

Pictures in `public/pics/` are cut from the Student's Book; «train» is not pictured in pages 11–40 and is
drawn (`src/art/drawings.tsx`). The four-line writing uses the school font Edu NSW ACT Foundation, whose
small letters sit between lines 2 and 3 as in the book.

Audio: Arabic lines by Maryam (Kuwaiti), English letters, numbers, words and praise by Alice (British
educator, chosen by the family on 2026-10-13). On the family's request (5 November 2026) the words are
varied and written for this quiz, not shared with the other quizzes: every question style has three to
six Arabic lines (a picture to imagine, a tip, a challenge or a question), and every moment has several
lines: 20 general cheers, cheers for boards, writing, reading, counting and the missing letter, streak
cheers on 3 and 5 right answers running, seven kind words after a miss, and the start and end of a
round. A round deals them in a shuffled order (`src/domain/variety.ts`), so the same words do not come
twice running, and a new round carries on where the last one stopped. A miss is explained: the word is
said with «تبدأ بحرف…» and its letter, a group is counted along (one, two, three …), a board says its
pairs. 130 clips were recorded on 5 November 2026 (about 3,100 characters) and checked with Whisper.
One copy for every child: the wording never speaks to a girl or a boy.

## Status
Preview only (5 November 2026): not published. The live site and the Hub still show the first test
until the update is approved. Publishing needs migration 024 (`integration/seed-english-grade1.sql`),
which removes the first test's question profiles and registers the new ones. Not assigned to any account.

## Development
```bash
npm install
npm run dev            # preview mode at http://127.0.0.1:4185
npm run check          # lint, types, unit tests, seed check, preview build
npx playwright test    # iPhone/iPad WebKit + desktop Chromium flows and Hub contract
npm run build:hub      # production Hub build into dist-hub/ (base /english-grade1-quiz/)
```

- Content and permanent question keys: `src/data/catalog.ts`
- Narration: `python3 scripts/generate-audio.py` (skips unchanged clips)
- Hub seed: `npm run generate:hub-seed` → `integration/seed-english-grade1.sql`
