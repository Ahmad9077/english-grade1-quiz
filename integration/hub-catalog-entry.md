# Hub integration for «English» (`english-grade1`)

Status (2026-10-14, approved by the family: «بعد تطبيق التعديلات انشر المجموعة على الهب»): **published and connected**.
- Site `english-grade1-quiz@a594050` live at https://ahmad9077.github.io/english-grade1-quiz/ and
  https://haya-nt3lm.com/english-grade1-quiz/ (repo Ahmad9077/english-grade1-quiz, Pages via Actions).
- Hub `quizzes-hub@626cb0d`: `quizCatalog` entry «English» 🔤 `#ffe9b8`, Arabic topic labels, schema seed row,
  `script.js?v=34`, migration `018_seed_english_grade1_quiz.sql` (identical to `integration/seed-english-grade1.sql`).
- Domain worker `haya-nt3lm-hub` redeployed with `english-grade1-quiz` in `SITES` (version 7bdaeb1a).
- Migration 018 applied once in the Supabase SQL editor and verified: catalog row present, 73 profiles
  (difficulty 10–50), 0 assignments.
- Live check: the page loads the Hub access guard with `english-grade1`; narration served; no preview badge.
- Not assigned to any account yet (needs a named approval).

## Contract summary
| Item | Value |
| --- | --- |
| quizId / manifest / catalog / Supabase id | `english-grade1` |
| Shared clients | `config.js?v=4`, `access-guard.js?v=3`, `progress-client.js?v=6`, `adaptive-client.js?v=2` |
| Reporting | per-question attempts via `QuizzesHubAdaptive.recordAttempt`, aggregate `QuizzesHubProgress.record` only as fallback |
| Question keys | `<lesson>:<slug>` (case, letters, numbers, missing), permanent (see `src/data/catalog.ts`) |
| Topic tags | `english_grade1`, `topic_<lesson>`, `kind_<pick|match>` |
| Challenge Mode | not enabled |

## Assignment (separate approval)
Only for named accounts. Read the account's full assignment list first, add `english-grade1`, and save the complete
list with `admin_set_assignments`. Verify in Admin and by opening the quiz from that child's Hub.
