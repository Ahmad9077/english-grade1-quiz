// Content for «English» — Grade 1 English, short test 1 (Sunday 18 Oct 2026).
// Source: the Grade 1 Student's Book, term 1 (2026 edition). The test covers pages 29–32:
// Ff (fan, fox, frog, feet), Mm (mug, man, mat), numbers 4, 5, 6 and Bb (box, bat, bed, bag),
// plus the test words box, ant, mug, lamb, bat. «ant» is from the Aa lesson (p.11) and the
// school's «lab» is the book's «lamb» (Ll lesson, p.17). Letters taught so far: A C E H L T F M B.
//
// Screen text: short Arabic instructions (no diacritics) and English letters/words in Andika.
// Narration: Arabic instructions in Kuwaiti dialect (Maryam), English letters/words/praise (Alice).
// Wording never speaks to a girl or a boy, so one copy serves every child.
// Question keys are permanent Hub identifiers: never rename or reuse one.
// This file is self-contained so Node scripts can import it directly.

export const QUIZ_ID = 'english-grade1'

export type TopicId = 'case' | 'letters' | 'numbers' | 'missing'
export type QuestionKind = 'pick' | 'match'

/**
 * Pictures: an emoji, `svg:<drawing>`, `txt:<letters>` (a glyph in the reading font)
 * or `count:<emoji>:<n>` (n copies to count).
 */
export type ArtRef = string

export interface Option {
  id: string
  art: ArtRef
  /** Accessible name; never shown, so a picture does not give away its first letter. */
  label: string
  /** Clip read while the tile lights up; absent when hearing it would give the answer away. */
  clip?: string
}

export interface Pair {
  id: string
  left: ArtRef
  right: ArtRef
  label: string
  /** Said when the child taps the left item. */
  clip: string
  fact: string
}

export interface Question {
  key: string
  topic: TopicId
  kind: QuestionKind
  prompt: string
  /** What the question asks aloud, in order (Arabic instruction and English target). */
  ask: string[]
  /** The big picture or letter the question is about. */
  subject?: ArtRef
  /** A word shown with its first letter missing, for example "_ox". */
  blank?: string
  options: Option[]
  pairs: Pair[]
  answer: string
  /** Explanation(s) played and shown after answering. */
  facts: string[]
  difficulty: number
  skills: string[]
}

export interface Fact {
  id: string
  topic: TopicId
  /** Shown on screen: English, in the reading font. */
  text: string
  /** Spoken in English by Alice. */
  say: string
  art: ArtRef[]
  /** Book words shown as labelled pictures, first letter in colour. */
  words?: string[]
  /** Shown as a learn card in its topic. */
  learn: boolean
}

export interface Topic {
  id: TopicId
  title: string
  short: string
  say: string
  art: ArtRef[]
}

// ── Words from the book ───────────────────────────────────────────────────
export const WORD_ART: Record<string, ArtRef> = {
  ant: '🐜', apple: '🍎', arm: '💪',
  box: '📦', bat: '🦇', bed: '🛏️', bag: '🎒',
  car: '🚗', cat: '🐱', cow: '🐄',
  egg: '🥚', elephant: '🐘', ear: '👂',
  fan: '🪭', fox: '🦊', frog: '🐸', feet: '🦶',
  hat: '🎩', horse: '🐴', hand: '✋',
  lamb: '🐑', lion: '🦁', lemon: '🍋',
  mug: 'svg:mug', man: '👨', mat: 'svg:mat',
  tiger: '🐯', toy: '🪀', teacher: '👩‍🏫',
}

export const TEST_WORDS = ['box', 'ant', 'mug', 'lamb', 'bat'] as const

/** Letters in the order the test favours: this unit first, then unit 1. */
export const LETTERS = ['f', 'm', 'b', 'a', 'l', 'c', 'e', 'h', 't'] as const

const NUMBER_WORDS = ['', 'one', 'two', 'three', 'four', 'five', 'six'] as const

/** Things to count, with the Arabic question and the English plural. */
const COUNTABLES = {
  bears: { art: '🧸', ar: 'كم دبدوب في الصورة؟', one: 'bear', many: 'bears' },
  apples: { art: '🍎', ar: 'كم تفاحة في الصورة؟', one: 'apple', many: 'apples' },
  flowers: { art: '🌼', ar: 'كم وردة في الصورة؟', one: 'flower', many: 'flowers' },
  frogs: { art: '🐸', ar: 'كم ضفدع في الصورة؟', one: 'frog', many: 'frogs' },
  fish: { art: '🐠', ar: 'كم سمكة في الصورة؟', one: 'fish', many: 'fish' },
  cookies: { art: '🍪', ar: 'كم بسكوتة في الصورة؟', one: 'cookie', many: 'cookies' },
  cars: { art: '🚗', ar: 'كم سيارة في الصورة؟', one: 'car', many: 'cars' },
  cows: { art: '🐄', ar: 'كم بقرة في الصورة؟', one: 'cow', many: 'cows' },
} as const

type Countable = keyof typeof COUNTABLES

const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

// ── Clip ids ──────────────────────────────────────────────────────────────
// en/… is spoken by Alice (English), ar/… by Maryam (Kuwaiti Arabic).
export const clip = {
  letter: (letter: string) => `en/letter/${letter.toLowerCase()}`,
  word: (word: string) => `en/word/${word}`,
  number: (n: number) => `en/num/${n}`,
  fact: (id: string) => `en/fact/${id}`,
  praise: (n: 1 | 2 | 3 | 4) => `en/ui/praise-${n}`,
  en: (id: EnUiClip) => `en/ui/${id}`,
  ask: (id: AskClip) => `ar/q/${id}`,
  count: (thing: Countable) => `ar/q/count-${thing}`,
  topic: (id: TopicId) => `ar/t/${id}`,
  ui: (id: ArUiClip) => `ar/ui/${id}`,
}

// ── Facts: learn cards and explanations ──────────────────────────────────
function caseFact(letter: string): Fact {
  const big = letter.toUpperCase()
  return { id: `case-${letter}`, topic: 'case', text: `Big ${big}, small ${letter}`, say: `Big ${big}… small ${letter}.`, art: [`txt:${big}`, `txt:${letter}`], learn: true }
}

const LETTER_WORDS: Record<string, string[]> = {
  f: ['fan', 'fox', 'frog'],
  m: ['mug', 'man', 'mat'],
  b: ['box', 'bat', 'bag'],
  a: ['ant', 'apple', 'arm'],
  l: ['lamb', 'lion', 'lemon'],
  c: ['cat', 'car', 'cow'],
  e: ['egg', 'elephant', 'ear'],
  h: ['hat', 'horse', 'hand'],
  t: ['tiger', 'toy', 'teacher'],
}

function letterFact(letter: string): Fact {
  const words = LETTER_WORDS[letter]!
  const big = letter.toUpperCase()
  const say = `${big} is for ${words.slice(0, -1).join(', ')} and ${words.at(-1)}.`
  return { id: `letter-${letter}`, topic: 'letters', text: say, say, art: [`txt:${big}${letter}`], words, learn: true }
}

function wordFact(word: string): Fact {
  const learn = (TEST_WORDS as readonly string[]).includes(word)
  return {
    id: `word-${word}`,
    topic: 'missing',
    text: `${cap(word)} starts with ${word.charAt(0).toUpperCase()}.`,
    say: `${cap(word)}. ${cap(word)} starts with ${word.charAt(0).toUpperCase()}.`,
    art: [],
    words: [word],
    learn,
  }
}

function countFact(n: number, thing: Countable, learn = false): Fact {
  const { art, one, many } = COUNTABLES[thing]
  const counting = NUMBER_WORDS.slice(1, n + 1).map(cap).join(', ')
  const name = n === 1 ? one : many
  return {
    id: `count-${n}-${thing}`,
    topic: 'numbers',
    text: `${n} ${name}`,
    say: n === 1 ? `One. One ${name}!` : `${counting}. ${cap(NUMBER_WORDS[n]!)} ${name}!`,
    art: [`txt:${n}`, `count:${art}:${n}`],
    learn,
  }
}

// Learn cards count 1–6; the rest explain specific questions.
const COUNT_FACTS: [number, Countable, boolean][] = [
  [1, 'cars', true], [2, 'cows', true], [3, 'apples', true], [4, 'bears', true], [5, 'apples', true], [6, 'flowers', true],
  [4, 'frogs', false], [6, 'fish', false], [5, 'cookies', false], [3, 'cars', false], [1, 'cows', false],
  [2, 'apples', false], [4, 'apples', false], [6, 'apples', false],
]

const FACT_WORDS = [...new Set([...Object.values(LETTER_WORDS).flat(), 'feet', 'bed', 'bag', 'man', 'mat'])]

export const FACTS: Fact[] = [
  ...LETTERS.map(caseFact),
  ...LETTERS.map(letterFact),
  ...COUNT_FACTS.map(([n, thing, learn]) => countFact(n, thing, learn)),
  // Test words first so their learn cards come first.
  ...[...TEST_WORDS, ...FACT_WORDS.filter((word) => !(TEST_WORDS as readonly string[]).includes(word))].map(wordFact),
]

// ── Topics ────────────────────────────────────────────────────────────────
export const TOPICS: Topic[] = [
  { id: 'case', title: 'الحرف الكبير والصغير', short: 'الحروف', say: 'كل حرف له شكلين… حرف كبير، وحرف صغير. خلنا نعرف كل حرف وشكله الصغير.', art: ['txt:A', 'txt:a'] },
  { id: 'letters', title: 'الحرف والصورة', short: 'الحرف والصورة', say: 'كل صورة تبدأ بحرف… خلنا نسمع الكلمة، ونعرف أول حرف فيها.', art: ['txt:F', '🦊'] },
  { id: 'numbers', title: 'الأرقام والعد', short: 'الأرقام', say: 'نعد الأشياء مع بعض… ونعرف الرقم. واحد، اثنين، ثلاثة… لين ستة.', art: ['🧸', 'txt:4'] },
  { id: 'missing', title: 'الحرف الناقص', short: 'الحرف الناقص', say: 'كلمات الاختبار… كل كلمة ناقصها أول حرف. نشوف الصورة، ونعرف الحرف الناقص.', art: ['📦', 'txt:?'] },
]

// ── Questions ─────────────────────────────────────────────────────────────
type Extra = { difficulty: number; skills: string[] }

function letterOption(letter: string, read = true): Option {
  return { id: letter, art: `txt:${letter}`, label: letter, clip: read ? clip.letter(letter) : undefined }
}

function base(key: string, topic: TopicId, kind: QuestionKind, prompt: string, ask: string[], extra: Extra) {
  return { key: `${topic}:${key}`, topic, kind, prompt, ask, pairs: [] as Pair[], options: [] as Option[], ...extra }
}

/** Capital shown, pick its small letter (options not read: the sound would give it away). */
function smallOf(letter: string, others: string[], extra: Extra): Question {
  return {
    ...base(`small-${letter}`, 'case', 'pick', 'وين الحرف الصغير؟', [clip.letter(letter), clip.ask('find-small')], extra),
    subject: `txt:${letter.toUpperCase()}`,
    options: [letter, ...others].map((l) => letterOption(l, false)),
    answer: letter,
    facts: [`case-${letter}`],
  }
}

/** Small letter shown, pick its capital. */
function bigOf(letter: string, others: string[], extra: Extra): Question {
  return {
    ...base(`big-${letter}`, 'case', 'pick', 'وين الحرف الكبير؟', [clip.letter(letter), clip.ask('find-big')], extra),
    subject: `txt:${letter}`,
    options: [letter, ...others].map((l) => ({ ...letterOption(l, false), art: `txt:${l.toUpperCase()}`, label: l.toUpperCase() })),
    answer: letter,
    facts: [`case-${letter}`],
  }
}

function wordOption(word: string): Option {
  return { id: word, art: WORD_ART[word]!, label: word, clip: clip.word(word) }
}

/** Letter shown, pick the picture that starts with it. */
function picFor(letter: string, word: string, others: string[], extra: Extra): Question {
  return {
    ...base(`${letter}-${word}`, 'letters', 'pick', 'أي صورة تبدأ بهذا الحرف؟', [clip.ask('pic-for-letter'), clip.letter(letter)], extra),
    subject: `txt:${letter.toUpperCase()}${letter}`,
    options: [word, ...others].map(wordOption),
    answer: word,
    facts: [`word-${word}`],
  }
}

/** Picture shown and named, pick its first letter. */
function letterFor(word: string, others: string[], extra: Extra): Question {
  const letter = word.charAt(0)
  return {
    ...base(word, 'letters', 'pick', 'بأي حرف تبدأ الكلمة؟', [clip.ask('letter-for-pic'), clip.word(word)], extra),
    subject: WORD_ART[word]!,
    options: [letter, ...others].map((l) => letterOption(l)),
    answer: letter,
    facts: [`word-${word}`],
  }
}

/** A picture with its first letter missing, as in the test: "_ox". */
function missing(word: string, others: string[], extra: Extra): Question {
  const letter = word.charAt(0)
  return {
    ...base(word, 'missing', 'pick', 'شنو الحرف الناقص؟', [clip.ask('missing'), clip.word(word)], extra),
    subject: WORD_ART[word]!,
    blank: word.slice(1),
    options: [letter, ...others].map((l) => letterOption(l)),
    answer: letter,
    facts: [`word-${word}`],
  }
}

function numberOption(n: number): Option {
  return { id: String(n), art: `txt:${n}`, label: String(n), clip: clip.number(n) }
}

/** Count the things, pick the number. */
function countQ(thing: Countable, n: number, others: number[], extra: Extra): Question {
  return {
    ...base(`count-${thing}-${n}`, 'numbers', 'pick', COUNTABLES[thing].ar, [clip.count(thing)], extra),
    subject: `count:${COUNTABLES[thing].art}:${n}`,
    options: [n, ...others].map(numberOption),
    answer: String(n),
    facts: [`count-${n}-${thing}`],
  }
}

/** Number shown, pick the picture with that many (pictures not read: that would count for the child). */
function findNumber(n: number, thing: Countable, others: number[], extra: Extra): Question {
  return {
    ...base(`find-${n}`, 'numbers', 'pick', 'وين الصورة اللي فيها هذا العدد؟', [clip.ask('find-number'), clip.number(n)], extra),
    subject: `txt:${n}`,
    options: [n, ...others].map((m) => ({ id: String(m), art: `count:${COUNTABLES[thing].art}:${m}`, label: `${m}` })),
    answer: String(n),
    facts: [`count-${n}-${thing}`],
  }
}

/** Matching board, like the worksheet: join each item on the left to its partner. */
function matchCase(key: string, letters: string[], extra: Extra): Question {
  return {
    ...base(`match-${key}`, 'case', 'match', 'نوصل الحرف الكبير بالحرف الصغير', [clip.ask('match-case')], extra),
    pairs: letters.map((l) => ({ id: l, left: `txt:${l.toUpperCase()}`, right: `txt:${l}`, label: `${l.toUpperCase()} ${l}`, clip: clip.letter(l), fact: `case-${l}` })),
    answer: '',
    facts: letters.map((l) => `case-${l}`),
  }
}

function matchPictures(key: string, words: string[], extra: Extra): Question {
  return {
    ...base(`match-${key}`, 'letters', 'match', 'نوصل كل حرف بالصورة اللي تبدأ فيه', [clip.ask('match-pic')], extra),
    pairs: words.map((w) => ({ id: w, left: `txt:${w.charAt(0).toUpperCase()}${w.charAt(0)}`, right: WORD_ART[w]!, label: w, clip: clip.letter(w.charAt(0)), fact: `word-${w}` })),
    answer: '',
    facts: words.map((w) => `word-${w}`),
  }
}

function matchNumbers(key: string, items: [number, Countable][], extra: Extra): Question {
  return {
    ...base(`match-${key}`, 'numbers', 'match', 'نوصل كل رقم بالصورة اللي فيها نفس العدد', [clip.ask('match-num')], extra),
    pairs: items.map(([n, thing]) => ({ id: String(n), left: `txt:${n}`, right: `count:${COUNTABLES[thing].art}:${n}`, label: String(n), clip: clip.number(n), fact: `count-${n}-${thing}` })),
    answer: '',
    facts: items.map(([n, thing]) => `count-${n}-${thing}`),
  }
}

const S = {
  case: ['letter_case', 'visual_match'],
  caseBoard: ['letter_case', 'matching'],
  initial: ['initial_sound', 'letter_picture'],
  initialBoard: ['initial_sound', 'matching'],
  count: ['counting', 'number_recognition'],
  numberBoard: ['counting', 'matching'],
  missing: ['initial_sound', 'missing_letter', 'spelling'],
}

export const QUESTIONS: Question[] = [
  // Big and small letters
  smallOf('f', ['t', 'l'], { difficulty: 25, skills: S.case }),
  smallOf('m', ['h', 'e'], { difficulty: 20, skills: S.case }),
  smallOf('b', ['h', 'l'], { difficulty: 30, skills: S.case }),
  smallOf('a', ['e', 'c'], { difficulty: 30, skills: S.case }),
  smallOf('l', ['t', 'f'], { difficulty: 35, skills: S.case }),
  smallOf('c', ['e', 'a'], { difficulty: 15, skills: S.case }),
  smallOf('e', ['c', 'a'], { difficulty: 35, skills: S.case }),
  smallOf('h', ['b', 'm'], { difficulty: 40, skills: S.case }),
  smallOf('t', ['f', 'l'], { difficulty: 35, skills: S.case }),
  bigOf('b', ['h', 'e'], { difficulty: 40, skills: S.case }),
  bigOf('f', ['e', 't'], { difficulty: 35, skills: S.case }),
  bigOf('m', ['h', 'a'], { difficulty: 25, skills: S.case }),
  bigOf('l', ['t', 'h'], { difficulty: 40, skills: S.case }),
  bigOf('a', ['h', 'm'], { difficulty: 45, skills: S.case }),
  bigOf('e', ['f', 'c'], { difficulty: 45, skills: S.case }),
  matchCase('fmb', ['f', 'm', 'b'], { difficulty: 30, skills: S.caseBoard }),
  matchCase('alt', ['a', 'l', 't'], { difficulty: 40, skills: S.caseBoard }),
  matchCase('ceh', ['c', 'e', 'h'], { difficulty: 40, skills: S.caseBoard }),
  matchCase('bfl', ['b', 'f', 'l'], { difficulty: 50, skills: S.caseBoard }),

  // Letter and picture
  picFor('f', 'frog', ['mug', 'box'], { difficulty: 25, skills: S.initial }),
  picFor('f', 'fan', ['bat', 'lamb'], { difficulty: 35, skills: S.initial }),
  picFor('m', 'mug', ['fox', 'bag'], { difficulty: 20, skills: S.initial }),
  picFor('m', 'man', ['frog', 'bed'], { difficulty: 30, skills: S.initial }),
  picFor('b', 'box', ['mat', 'fan'], { difficulty: 20, skills: S.initial }),
  picFor('b', 'bat', ['mug', 'fox'], { difficulty: 30, skills: S.initial }),
  picFor('b', 'bag', ['man', 'frog'], { difficulty: 35, skills: S.initial }),
  picFor('a', 'ant', ['bat', 'mug'], { difficulty: 25, skills: S.initial }),
  picFor('l', 'lamb', ['box', 'ant'], { difficulty: 30, skills: S.initial }),
  picFor('l', 'lion', ['tiger', 'horse'], { difficulty: 40, skills: S.initial }),
  picFor('c', 'cat', ['hat', 'bat'], { difficulty: 45, skills: S.initial }),
  picFor('t', 'tiger', ['lion', 'cat'], { difficulty: 40, skills: S.initial }),
  letterFor('fox', ['b', 'm'], { difficulty: 25, skills: S.initial }),
  letterFor('mat', ['f', 'b'], { difficulty: 30, skills: S.initial }),
  letterFor('bed', ['m', 'f'], { difficulty: 30, skills: S.initial }),
  letterFor('apple', ['e', 'l'], { difficulty: 35, skills: S.initial }),
  letterFor('lemon', ['m', 't'], { difficulty: 45, skills: S.initial }),
  letterFor('egg', ['a', 'h'], { difficulty: 45, skills: S.initial }),
  letterFor('horse', ['c', 'f'], { difficulty: 40, skills: S.initial }),
  matchPictures('fmb', ['fox', 'mug', 'box'], { difficulty: 30, skills: S.initialBoard }),
  matchPictures('alb', ['ant', 'lamb', 'bat'], { difficulty: 35, skills: S.initialBoard }),
  matchPictures('fmt', ['fan', 'man', 'tiger'], { difficulty: 45, skills: S.initialBoard }),
  matchPictures('ceh', ['cat', 'egg', 'hat'], { difficulty: 50, skills: S.initialBoard }),

  // Numbers 1–6 (4, 5, 6 are this unit)
  countQ('bears', 4, [5, 6], { difficulty: 20, skills: S.count }),
  countQ('apples', 5, [4, 6], { difficulty: 30, skills: S.count }),
  countQ('flowers', 6, [4, 5], { difficulty: 35, skills: S.count }),
  countQ('frogs', 4, [3, 6], { difficulty: 25, skills: S.count }),
  countQ('fish', 6, [5, 4], { difficulty: 40, skills: S.count }),
  countQ('cookies', 5, [6, 3], { difficulty: 35, skills: S.count }),
  countQ('cars', 3, [2, 4], { difficulty: 15, skills: S.count }),
  countQ('cows', 2, [1, 3], { difficulty: 10, skills: S.count }),
  findNumber(4, 'bears', [5, 6], { difficulty: 30, skills: S.count }),
  findNumber(5, 'apples', [4, 6], { difficulty: 40, skills: S.count }),
  findNumber(6, 'flowers', [4, 5], { difficulty: 45, skills: S.count }),
  findNumber(3, 'cars', [2, 4], { difficulty: 25, skills: S.count }),
  findNumber(1, 'cows', [2, 3], { difficulty: 15, skills: S.count }),
  matchNumbers('456', [[4, 'bears'], [5, 'apples'], [6, 'flowers']], { difficulty: 40, skills: S.numberBoard }),
  matchNumbers('123', [[1, 'cars'], [2, 'cows'], [3, 'apples']], { difficulty: 20, skills: S.numberBoard }),
  matchNumbers('246', [[2, 'apples'], [4, 'apples'], [6, 'apples']], { difficulty: 50, skills: S.numberBoard }),

  // Missing first letter (the five test words first)
  missing('box', ['m', 'f'], { difficulty: 25, skills: S.missing }),
  missing('ant', ['e', 'm'], { difficulty: 30, skills: S.missing }),
  missing('mug', ['b', 'l'], { difficulty: 25, skills: S.missing }),
  missing('lamb', ['t', 'b'], { difficulty: 40, skills: S.missing }),
  missing('bat', ['f', 'm'], { difficulty: 30, skills: S.missing }),
  missing('frog', ['b', 'm'], { difficulty: 30, skills: S.missing }),
  missing('feet', ['m', 't'], { difficulty: 40, skills: S.missing }),
  missing('fan', ['m', 'c'], { difficulty: 35, skills: S.missing }),
  missing('fox', ['b', 'l'], { difficulty: 30, skills: S.missing }),
  missing('man', ['f', 'b'], { difficulty: 30, skills: S.missing }),
  missing('mat', ['c', 'h'], { difficulty: 40, skills: S.missing }),
  missing('bag', ['f', 'm'], { difficulty: 35, skills: S.missing }),
  missing('bed', ['m', 'h'], { difficulty: 40, skills: S.missing }),
  missing('cat', ['h', 'm'], { difficulty: 45, skills: S.missing }),
  missing('hat', ['c', 'b'], { difficulty: 50, skills: S.missing }),
]

// ── Narration ─────────────────────────────────────────────────────────────
// Arabic: Maryam Essa (Kuwaiti), the voice approved for «بصمة وأثر»; no diacritics.
// English: Alice (British educator) — chosen by the family on 2026-10-13 because she
// reads lone letters as letter names.
export const ASK_CLIPS = {
  'find-small': 'وين الحرف الصغير؟',
  'find-big': 'وين الحرف الكبير؟',
  'pic-for-letter': 'أي صورة تبدأ بحرف…',
  'letter-for-pic': 'بأي حرف تبدأ كلمة…',
  missing: 'شنو الحرف الناقص في أول كلمة…',
  'find-number': 'وين الصورة اللي فيها…',
  'match-case': 'نوصل كل حرف كبير… بالحرف الصغير مثله.',
  'match-pic': 'نوصل كل حرف… بالصورة اللي تبدأ فيه.',
  'match-num': 'نوصل كل رقم… بالصورة اللي فيها نفس العدد.',
} as const

export type AskClip = keyof typeof ASK_CLIPS

export const AR_UI_CLIPS = {
  welcome: 'هلا والله! يلا نتدرب على الإنجليزي… نختار درس، ونبدأ.',
  'correct-is': 'الجواب الصح…',
  'test-intro': 'هذا اختبار تجريبي… فيه أسئلة من كل الدروس. يلا نبدأ!',
  'learn-done': 'خلصنا الدرس! يلا نتدرب.',
  'match-wrong': 'لا… نجرب مرة ثانية.',
} as const

export type ArUiClip = keyof typeof AR_UI_CLIPS

export const EN_UI_CLIPS = {
  'praise-1': 'Great job!',
  'praise-2': 'Well done!',
  'praise-3': 'Super!',
  'praise-4': 'Excellent!',
  'done-great': 'Amazing! You are a superstar!',
  'done-good': 'Good job! Let’s practise again.',
} as const

export type EnUiClip = keyof typeof EN_UI_CLIPS

const LETTER_NAMES: Record<string, string> = { h: 'Aitch.' }

export interface AudioCue {
  id: string
  text: string
  lang: 'ar' | 'en'
}

export function bare(text: string): string {
  return text.replace(/[ً-ْٰ]/g, '')
}

export function audioCues(): AudioCue[] {
  const en = (id: string, text: string): AudioCue => ({ id, text, lang: 'en' })
  const ar = (id: string, text: string): AudioCue => ({ id, text: bare(text), lang: 'ar' })
  const words = Object.keys(WORD_ART)
  return [
    // Spelled-out names where the bare letter is misread (H came out as "haitch").
    ...LETTERS.map((letter) => en(clip.letter(letter), LETTER_NAMES[letter] ?? `${letter.toUpperCase()}.`)),
    ...words.map((word) => en(clip.word(word), `${cap(word)}.`)),
    ...[1, 2, 3, 4, 5, 6].map((n) => en(clip.number(n), `${cap(NUMBER_WORDS[n]!)}.`)),
    ...FACTS.map((fact) => en(clip.fact(fact.id), fact.say)),
    ...(Object.keys(EN_UI_CLIPS) as EnUiClip[]).map((id) => en(clip.en(id), EN_UI_CLIPS[id])),
    ...(Object.keys(ASK_CLIPS) as AskClip[]).map((id) => ar(clip.ask(id), ASK_CLIPS[id])),
    ...(Object.keys(COUNTABLES) as Countable[]).map((thing) => ar(clip.count(thing), COUNTABLES[thing].ar)),
    ...TOPICS.map((topic) => ar(clip.topic(topic.id), topic.say)),
    ...(Object.keys(AR_UI_CLIPS) as ArUiClip[]).map((id) => ar(clip.ui(id), AR_UI_CLIPS[id])),
  ]
}

/** Every clip a round needs, so it can be loaded before the first question. */
export function roundClips(questions: Question[]): string[] {
  return [
    ...questions.flatMap((question) => [
      ...question.ask,
      ...question.options.flatMap((option) => (option.clip ? [option.clip] : [])),
      ...question.pairs.map((pair) => pair.clip),
      ...question.facts.map(clip.fact),
    ]),
    clip.ui('correct-is'),
    clip.ui('match-wrong'),
    clip.praise(1),
    clip.praise(2),
    clip.praise(3),
    clip.praise(4),
    clip.en('done-great'),
    clip.en('done-good'),
  ]
}

export function factById(id: string): Fact {
  const fact = FACTS.find((entry) => entry.id === id)
  if (!fact) throw new Error(`Unknown fact ${id}`)
  return fact
}
