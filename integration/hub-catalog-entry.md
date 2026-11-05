# Hub integration for «English» (`english-grade1`)

Status (2026-11-05, approved by the family: «اعتمد وانشر»): **second test published and connected**.
- Site `english-grade1-quiz@469ce49` (practice for the test of Monday 9 November 2026, Student's Book
  pages 11–40, with varied narration) live at https://ahmad9077.github.io/english-grade1-quiz/ and
  https://haya-nt3lm.com/english-grade1-quiz/; all 202 narration clips served on both.
- Hub `quizzes-hub@c575810`: topic labels `topic_letters` «الحرف والرقم والصورة», new `topic_words`
  «الكلمة والصورة» and `topic_writing` «نسخ الكلمات والأرقام»; `script.js?v=40`; migration
  `024_seed_english_grade1_quiz.sql` (SHA-256 200b11fe…, identical to `integration/seed-english-grade1.sql`).
  Catalog entry, URL and domain worker unchanged.
- Migration 024 applied once in the Supabase SQL editor and verified: 155 profiles (difficulty 10–50),
  the first test's 73 profiles removed (all profiles 3403 → 3485), assignments unchanged (35 in all, 4 for
  `english-grade1`), the 21 saved English results kept.
- Live check: the quiz page sends a signed-out visitor to the Hub sign-in (access guard), no preview badge.
- Assignments were not touched: the 4 accounts that already had «English» now get the new test.

History: first released 2026-10-14 for short test 1 (pages 29–32; site `a594050`, Hub `626cb0d`, migration 018,
73 profiles).

## Contract summary
| Item | Value |
| --- | --- |
| quizId / manifest / catalog / Supabase id | `english-grade1` |
| Shared clients | `config.js?v=4`, `access-guard.js?v=3`, `progress-client.js?v=6`, `adaptive-client.js?v=2` |
| Reporting | per-question attempts via `QuizzesHubAdaptive.recordAttempt`, aggregate `QuizzesHubProgress.record` only as fallback |
| Question keys | `<lesson>:<slug>` (case, letters, words, writing, missing), permanent (see `src/data/catalog.ts`) |
| Topic tags | `english_grade1`, `topic_<lesson>`, `kind_<pick|match|trace|missing>` |
| Challenge Mode | not enabled |

## Assignment (separate approval)
Only for named accounts. Read the account's full assignment list first, add `english-grade1`, and save the complete
list with `admin_set_assignments`. Verify in Admin and by opening the quiz from that child's Hub.
