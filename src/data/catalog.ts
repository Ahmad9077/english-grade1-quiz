// Content for «English» — Grade 1 English test (Monday 9 November 2026).
// Source: the Grade 1 Student's Book 1A (term 1, 2026 edition), pages 11–40: Unit 1 (Aa Cc Ee Hh
// Ll Tt, numbers 1–3) and Unit 2 (Ff Mm Bb Oo Xx Uu, numbers 4–6). The school's card lists the
// same five parts as the book's two Progress Tests (pages 21–22 and 39–40), so every question
// carries the test's own English instruction line:
//   1. Match the uppercase letters with the lowercase letters      → topic `case`
//   2. Match letters / numbers to pictures                         → topic `letters`
//   3. Circle the correct word (by the picture)                    → topic `words`
//   4. Copy the following, on four lines                           → topic `writing`
//   5. Write the missing initial letters, with pictures            → topic `missing`
//      (the card's words: train, toe, mat, lemon, on, car)
//
// Pictures are the book's own, cut from the Student's Book (public/pics); «train» is not in the
// book and is drawn (svg:train). Narration: Arabic help lines in Kuwaiti dialect (Maryam) and
// English letters, numbers and words (Alice). Wording never speaks to a girl or a boy.
// Question keys are permanent Hub identifiers: never rename or reuse one.
// This file is self-contained so Node scripts can import it directly.

export const QUIZ_ID = 'english-grade1'

export type TopicId = 'case' | 'letters' | 'words' | 'writing' | 'missing'
export type QuestionKind = 'pick' | 'match' | 'trace' | 'missing'
export type Format =
  | 'match-case'
  | 'small'
  | 'big'
  | 'match-letters'
  | 'match-numbers'
  | 'pic-for-letter'
  | 'count'
  | 'find-number'
  | 'word'
  | 'copy'
  | 'missing'

/**
 * Pictures: `pic:<id>` (a picture from the book), `svg:<drawing>`, `txt:<letters>` (in the reading
 * font), `word:<word>` (a word box, as printed in the test), `count:<pic id>:<n>` (n copies to count)
 * or an emoji.
 */
export type ArtRef = string

export type Random = () => number

export interface Option {
  id: string
  art: ArtRef
  /** Accessible name. */
  label: string
}

export interface Pair {
  id: string
  /** The top row of the board (letters, capitals or numbers). */
  top: ArtRef
  /** Its partner in the bottom row. */
  bottom: ArtRef
  label: string
  /** Said when the top item is chosen. */
  topClip: string
  /** Said when the pair is joined. */
  clip: string
}

/** An extra item in the bottom row that joins nothing, as in the book's tests. */
export interface Decoy {
  id: string
  art: ArtRef
  label: string
}

/** The parts of a question that a round may draw afresh. */
export interface Dress {
  ask?: string[]
  help?: string
  subject?: ArtRef
  options?: Option[]
  pairs?: Pair[]
  decoys?: Decoy[]
  answer?: string
  reveal?: string[]
  note?: string
}

export interface Question {
  key: string
  topic: TopicId
  kind: QuestionKind
  format: Format
  /** What the question asks aloud, in order (English target, then the Arabic help). */
  ask: string[]
  /** The Arabic line under the instruction, when it is not the format's own. */
  help?: string
  /** The big picture or letter the question is about. */
  subject?: ArtRef
  /** missing: the whole word; the first letter is the blank. */
  word?: string
  /** copy: the text to write over, as on the test's copy box ("A a", "1 2 3", "cat"). */
  text?: string
  options: Option[]
  pairs: Pair[]
  decoys: Decoy[]
  answer: string
  /** Said after answering: the right answer. */
  reveal: string[]
  /** Shown in the feedback, in English. */
  note: string
  difficulty: number
  skills: string[]
  /** Draws new letters, pictures or keys for each round; the key and its skill stay the same. */
  vary?: (random: Random) => Dress
}

export interface Topic {
  id: TopicId
  title: string
  /** Two pictures for the lesson card. */
  art: [ArtRef, ArtRef]
}

export interface FormatInfo {
  /** The test's instruction line, as printed in the book's Progress Tests. */
  instruction: string
  /** The same in short Arabic, shown under it and spoken by Maryam. */
  help: string
  section: 'Reading' | 'Writing'
}

// ── Letters, words and pictures from the book ─────────────────────────────
/** The twelve letters of pages 11–40, in the book's order. */
export const LETTERS = ['a', 'c', 'e', 'h', 'l', 't', 'f', 'm', 'b', 'o', 'x', 'u'] as const
export type Letter = (typeof LETTERS)[number]
export const UNIT_1: Letter[] = ['a', 'c', 'e', 'h', 'l', 't']
export const UNIT_2: Letter[] = ['f', 'm', 'b', 'o', 'x', 'u']

/** Each word's picture. Most are the book's (public/pics/<id>.webp). */
export const WORD_ART: Record<string, ArtRef> = {
  ant: 'pic:ant', apple: 'pic:apple', arm: 'pic:arm',
  cat: 'pic:cat', car: 'pic:car', cap: 'pic:cap', cow: 'pic:cow',
  egg: 'pic:egg', elbow: 'pic:elbow', ear: 'pic:ear', elephant: 'pic:elephant',
  hat: 'pic:hat', horse: 'pic:horse', hand: 'pic:hand', head: 'pic:head',
  lamb: 'pic:lamb', lion: 'pic:lion', lemon: 'pic:lemon', leg: 'pic:leg',
  toe: 'pic:toe', tiger: 'pic:tiger', toy: 'pic:toy', teacher: 'pic:teacher', train: 'svg:train',
  fan: 'pic:fan', fox: 'pic:fox', frog: 'pic:frog', foot: 'pic:foot', father: 'pic:father',
  mug: 'pic:mug', man: 'pic:man', mat: 'pic:mat', mother: 'pic:mother', mouth: 'pic:mouth',
  box: 'pic:box', bat: 'pic:bat', bed: 'pic:bed', bag: 'pic:bag', brother: 'pic:brother',
  open: 'pic:open', on: 'pic:on', oven: 'pic:oven',
  'x-ray': 'pic:xray',
  up: 'pic:up', under: 'pic:under', umbrella: 'pic:umbrella',
  ears: 'pic:ears', legs: 'pic:legs', nose: 'pic:nose',
  blue: 'svg:splat-blue', brown: 'svg:splat-brown', black: 'svg:splat-black', orange: 'pic:paint',
}

/** Words for each letter that have a clear picture. */
export const LETTER_WORDS: Record<Letter, string[]> = {
  a: ['ant', 'apple', 'arm'],
  c: ['cat', 'car', 'cap', 'cow'],
  e: ['egg', 'elbow', 'ear', 'elephant'],
  h: ['hat', 'horse', 'hand', 'head'],
  l: ['lamb', 'lion', 'lemon', 'leg'],
  t: ['toe', 'tiger', 'toy', 'teacher', 'train'],
  f: ['fan', 'fox', 'frog', 'foot'],
  m: ['mug', 'man', 'mat', 'mouth'],
  b: ['box', 'bat', 'bed', 'bag'],
  o: ['open', 'on', 'oven'],
  x: ['x-ray'],
  u: ['up', 'under', 'umbrella'],
}

/** The words the school's card gives for the missing-letter question. */
export const CARD_WORDS = ['train', 'toe', 'mat', 'lemon', 'on', 'car'] as const

/** Single book pictures that can be shown many times for counting. */
const COUNT_PICS = ['ball', 'cupcake', 'teddy', 'flower', 'icecream', 'cub', 'cup', 'minifan', 'redapple', 'apple', 'frog', 'car', 'cow'] as const

/** Things a count question asks about, with the Arabic question Maryam reads. */
const COUNTABLES = {
  bears: { pic: 'teddy', ar: 'كم دبدوب في الصورة؟' },
  apples: { pic: 'apple', ar: 'كم تفاحة في الصورة؟' },
  flowers: { pic: 'flower', ar: 'كم وردة في الصورة؟' },
  frogs: { pic: 'frog', ar: 'كم ضفدع في الصورة؟' },
  cars: { pic: 'car', ar: 'كم سيارة في الصورة؟' },
  cows: { pic: 'cow', ar: 'كم بقرة في الصورة؟' },
} as const

type Countable = keyof typeof COUNTABLES

const NUMBER_WORDS = ['', 'one', 'two', 'three', 'four', 'five', 'six'] as const

const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

// ── Clip ids ──────────────────────────────────────────────────────────────
// en/… is spoken by Alice (English), ar/… by Maryam (Kuwaiti Arabic).
export const clip = {
  letter: (letter: string) => `en/letter/${letter.toLowerCase()}`,
  word: (word: string) => `en/word/${word}`,
  number: (n: number) => `en/num/${n}`,
  en: (id: EnUiClip) => `en/ui/${id}`,
  ask: (id: AskClip) => `ar/q/${id}`,
  count: (thing: Countable) => `ar/q/count-${thing}`,
  ui: (id: ArUiClip) => `ar/ui/${id}`,
}

// ── Lessons and the test's instruction lines ──────────────────────────────
export const TOPICS: Topic[] = [
  { id: 'case', title: 'الحرف الكبير والصغير', art: ['txt:A', 'txt:a'] },
  { id: 'letters', title: 'الحرف والرقم والصورة', art: ['txt:b', 'pic:bat'] },
  { id: 'words', title: 'الكلمة والصورة', art: ['pic:cat', 'word:cat'] },
  { id: 'writing', title: 'نسخ الكلمات والأرقام', art: ['✏️', 'txt:Aa'] },
  { id: 'missing', title: 'الحرف الناقص', art: ['svg:train', 'txt:_rain'] },
]

export const FORMATS: Record<Format, FormatInfo> = {
  'match-case': { instruction: 'Match the uppercase letters with the lowercase letters', help: 'نوصل كل حرف كبير بالحرف الصغير مثله', section: 'Reading' },
  small: { instruction: 'Circle the lowercase letter', help: 'وين الحرف الصغير؟', section: 'Reading' },
  big: { instruction: 'Circle the uppercase letter', help: 'وين الحرف الكبير؟', section: 'Reading' },
  'match-letters': { instruction: 'Match letters to pictures', help: 'نوصل كل حرف بالصورة اللي تبدأ فيه', section: 'Reading' },
  'match-numbers': { instruction: 'Match numbers to pictures', help: 'نوصل كل رقم بالصورة اللي فيها نفس العدد', section: 'Reading' },
  'pic-for-letter': { instruction: 'Circle the correct picture', help: 'أي صورة تبدأ بهذا الحرف؟', section: 'Reading' },
  count: { instruction: 'Count and circle', help: 'كم في الصورة؟', section: 'Reading' },
  'find-number': { instruction: 'Circle the correct picture', help: 'وين الصورة اللي فيها هذا الرقم؟', section: 'Reading' },
  word: { instruction: 'Circle the correct word', help: 'نختار الكلمة الصحيحة حسب الصورة', section: 'Reading' },
  copy: { instruction: 'Copy the following', help: 'نكتب بإصبعنا فوق الكتابة الرمادية على الأربع سطور', section: 'Writing' },
  missing: { instruction: 'Write the missing initial letters', help: 'شنو الحرف الناقص في أول الكلمة؟', section: 'Writing' },
}

// ── Question builders ─────────────────────────────────────────────────────
type Extra = { difficulty: number; skills: string[] }

const S = {
  case: ['letter_case', 'visual_match'],
  caseBoard: ['letter_case', 'matching'],
  initial: ['initial_sound', 'letter_picture'],
  initialBoard: ['initial_sound', 'matching'],
  count: ['counting', 'number_recognition'],
  numberBoard: ['counting', 'matching'],
  reading: ['word_reading', 'picture_word'],
  copyLetters: ['handwriting', 'letter_formation'],
  copyNumbers: ['handwriting', 'number_formation'],
  copyWords: ['handwriting', 'copying'],
  missing: ['initial_sound', 'missing_letter', 'spelling'],
}

function pickOne<T>(items: readonly T[], random: Random): T {
  return items[Math.floor(random() * items.length)] ?? items[0]!
}

/** `count` different items, in random order. */
function pickSome<T>(items: readonly T[], count: number, random: Random): T[] {
  const pool = [...items]
  const picked: T[] = []
  while (picked.length < count && pool.length > 0) picked.push(...pool.splice(Math.floor(random() * pool.length), 1))
  return picked
}

function base(key: string, topic: TopicId, kind: QuestionKind, format: Format, extra: Extra) {
  return { key: `${topic}:${key}`, topic, kind, format, ask: [] as string[], options: [] as Option[], pairs: [] as Pair[], decoys: [] as Decoy[], reveal: [] as string[], note: '', ...extra }
}

function letterOption(letter: string, big = false): Option {
  const shown = big ? letter.toUpperCase() : letter
  return { id: letter, art: `txt:${shown}`, label: shown }
}

function pictureOption(word: string): Option {
  return { id: word, art: WORD_ART[word]!, label: word }
}

/** Capital shown, circle its small letter (the letters are not read: the sound would give it away). */
function smallOf(letter: Letter, others: Letter[], extra: Extra): Question {
  return {
    ...base(`small-${letter}`, 'case', 'pick', 'small', extra),
    ask: [clip.letter(letter), clip.ask('find-small')],
    subject: `txt:${letter.toUpperCase()}`,
    options: [letter, ...others].map((l) => letterOption(l)),
    answer: letter,
    reveal: [clip.letter(letter)],
    note: `${letter.toUpperCase()} ${letter}`,
  }
}

/** Small letter shown, circle its capital. */
function bigOf(letter: Letter, others: Letter[], extra: Extra): Question {
  return {
    ...base(`big-${letter}`, 'case', 'pick', 'big', extra),
    ask: [clip.letter(letter), clip.ask('find-big')],
    subject: `txt:${letter}`,
    options: [letter, ...others].map((l) => letterOption(l, true)),
    answer: letter,
    reveal: [clip.letter(letter)],
    note: `${letter.toUpperCase()} ${letter}`,
  }
}

function casePair(letter: string): Pair {
  return { id: letter, top: `txt:${letter.toUpperCase()}`, bottom: `txt:${letter}`, label: letter.toUpperCase(), topClip: clip.letter(letter), clip: clip.letter(letter) }
}

/**
 * The test's first board: capitals on top, small letters below with one extra small letter,
 * exactly as on pages 21 and 39. Each round draws the capitals from `pool`.
 */
function matchCase(key: string, pool: Letter[], count: number, extra: Extra): Question {
  const dress = (letters: Letter[], decoy: Letter): Dress => ({
    pairs: letters.map(casePair),
    decoys: [{ id: `extra-${decoy}`, art: `txt:${decoy}`, label: decoy }],
    note: letters.map((l) => `${l.toUpperCase()} ${l}`).join('   '),
  })
  const first = pool.slice(0, count)
  return {
    ...base(`match-${key}`, 'case', 'match', 'match-case', extra),
    ask: [clip.ask('match-case')],
    ...dress(first, (pool[count] ?? LETTERS.find((l) => !first.includes(l)))!),
    answer: '',
    vary: (random) => {
      const letters = pickSome(pool, count, random)
      const spare = pool.filter((l) => !letters.includes(l))
      return dress(letters, pickOne(spare.length > 0 ? spare : LETTERS.filter((l) => !letters.includes(l)), random))
    },
  } as Question
}

/** Small letters on top, pictures below (one picture starts with none of them). */
function matchLetters(key: string, pool: Letter[], count: number, extra: Extra): Question {
  const dress = (letters: Letter[], words: string[], decoy: string): Dress => ({
    pairs: letters.map((l, n) => ({ id: l, top: `txt:${l}`, bottom: WORD_ART[words[n]!]!, label: l, topClip: clip.letter(l), clip: clip.word(words[n]!) })),
    decoys: [{ id: `extra-${decoy}`, art: WORD_ART[decoy]!, label: decoy }],
    note: letters.map((l, n) => `${l} — ${words[n]}`).join('   '),
  })
  const first = pool.slice(0, count)
  const firstDecoy = LETTERS.find((l) => !first.includes(l))!
  return {
    ...base(`match-${key}`, 'letters', 'match', 'match-letters', extra),
    ask: [clip.ask('match-pic')],
    ...dress(first, first.map((l) => LETTER_WORDS[l][0]!), LETTER_WORDS[firstDecoy][0]!),
    answer: '',
    vary: (random) => {
      const letters = pickSome(pool, count, random)
      const others = LETTERS.filter((l) => !letters.includes(l))
      return dress(letters, letters.map((l) => pickOne(LETTER_WORDS[l], random)), pickOne(LETTER_WORDS[pickOne(others, random)], random))
    },
  } as Question
}

/** Numbers on top, groups to count below (one group matches none of them). */
function matchNumbers(key: string, pool: number[], count: number, extra: Extra): Question {
  const dress = (numbers: number[], decoy: number, pics: string[]): Dress => ({
    pairs: numbers.map((n, k) => ({ id: String(n), top: `txt:${n}`, bottom: `count:${pics[k]}:${n}`, label: String(n), topClip: clip.number(n), clip: clip.number(n) })),
    decoys: [{ id: `extra-${decoy}`, art: `count:${pics[numbers.length]}:${decoy}`, label: String(decoy) }],
    note: numbers.join('   '),
  })
  const first = pool.slice(0, count)
  return {
    ...base(`numbers-${key}`, 'letters', 'match', 'match-numbers', extra),
    ask: [clip.ask('match-num')],
    ...dress(first, pool[count]!, [...COUNT_PICS].slice(0, count + 1)),
    answer: '',
    vary: (random) => {
      const numbers = pickSome(pool, count, random)
      return dress(numbers, pickOne(pool.filter((n) => !numbers.includes(n)), random), pickSome(COUNT_PICS, count + 1, random))
    },
  } as Question
}

/** A letter, and three pictures: circle the one that starts with it. */
function picFor(letter: Letter, extra: Extra): Question {
  const dress = (word: string, others: string[]): Dress => ({
    options: [word, ...others].map(pictureOption),
    answer: word,
    reveal: [clip.word(word)],
    note: `${cap(word)} starts with ${letter}`,
  })
  const others = LETTERS.filter((l) => l !== letter && l !== 'x')
  return {
    ...base(`pic-${letter}`, 'letters', 'pick', 'pic-for-letter', extra),
    ask: [clip.letter(letter), clip.ask('pic-for-letter')],
    subject: `txt:${letter.toUpperCase()}${letter}`,
    ...dress(LETTER_WORDS[letter][0]!, [LETTER_WORDS[others[0]!][0]!, LETTER_WORDS[others[1]!][0]!]),
    vary: (random) =>
      dress(
        pickOne(LETTER_WORDS[letter], random),
        pickSome(others, 2, random).map((l) => pickOne(LETTER_WORDS[l], random)),
      ),
  } as Question
}

function numberOption(n: number): Option {
  return { id: String(n), art: `txt:${n}`, label: String(n) }
}

/** Two other numbers from 1–6, near the answer. */
function nearNumbers(n: number, random: Random): number[] {
  const near = [n - 2, n - 1, n + 1, n + 2].filter((m) => m >= 1 && m <= 6)
  return pickSome(near, 2, random)
}

/** A group to count: circle the number. */
function countQ(n: number, extra: Extra): Question {
  const dress = (thing: Countable, others: number[]): Dress => ({
    ask: [clip.count(thing)],
    help: COUNTABLES[thing].ar,
    subject: `count:${COUNTABLES[thing].pic}:${n}`,
    options: [n, ...others].map(numberOption),
  })
  return {
    ...base(`count-${n}`, 'letters', 'pick', 'count', extra),
    ...dress('bears', nearNumbers(n, () => 0)),
    answer: String(n),
    reveal: [clip.number(n)],
    note: `${n} · ${NUMBER_WORDS[n]}`,
    vary: (random) => dress(pickOne(Object.keys(COUNTABLES) as Countable[], random), nearNumbers(n, random)),
  } as Question
}

/** A number: circle the group with that many (the groups are not read: that would count for the child). */
function findNumber(n: number, extra: Extra): Question {
  const dress = (pic: string, others: number[]): Dress => ({
    options: [n, ...others].map((m) => ({ id: String(m), art: `count:${pic}:${m}`, label: String(m) })),
  })
  return {
    ...base(`find-${n}`, 'letters', 'pick', 'find-number', extra),
    ask: [clip.number(n), clip.ask('find-number')],
    subject: `txt:${n}`,
    ...dress('cupcake', nearNumbers(n, () => 0)),
    answer: String(n),
    reveal: [clip.number(n)],
    note: `${n} · ${NUMBER_WORDS[n]}`,
    vary: (random) => dress(pickOne(COUNT_PICS, random), nearNumbers(n, random)),
  } as Question
}

/** «Circle the correct word»: a picture and three words, as on pages 21 and 39. */
function wordQ(answer: string, others: [string, string], extra: Extra, subject = WORD_ART[answer]!): Question {
  return {
    ...base(answer, 'words', 'pick', 'word', extra),
    ask: [clip.ask('circle-word')],
    subject,
    options: [answer, ...others].map((word) => ({ id: word, art: `word:${word}`, label: word })),
    answer,
    reveal: [clip.word(answer)],
    note: answer,
  }
}

/** «Copy the following»: write over the grey text on four lines. */
function copyQ(key: string, text: string, extra: Extra): Question {
  const tokens = text.split(' ')
  const reveal = tokens.map((token) => (/^\d$/.test(token) ? clip.number(Number(token)) : token.length === 1 ? clip.letter(token) : clip.word(token)))
  return {
    ...base(key, 'writing', 'trace', 'copy', extra),
    ask: [clip.ask('trace')],
    text,
    answer: text,
    reveal: [...new Set(reveal)],
    note: text,
  }
}

/** «Write the missing initial letters»: a picture and its word without the first letter. */
function missing(word: string, extra: Extra): Question {
  const letter = word.charAt(0) as Letter
  // Six keys in alphabetical order, like a keyboard.
  const keys = (others: Letter[]): Option[] => [letter, ...others].sort().map((l) => letterOption(l))
  const others = LETTERS.filter((l) => l !== letter)
  return {
    ...base(word, 'missing', 'missing', 'missing', extra),
    ask: [clip.word(word), clip.ask('missing')],
    subject: WORD_ART[word]!,
    word,
    options: keys(others.slice(0, 5)),
    answer: letter,
    reveal: [clip.letter(letter), clip.word(word)],
    note: word,
    vary: (random) => ({ options: keys(pickSome(others, 5, random)) }),
  }
}

// ── The question bank ─────────────────────────────────────────────────────
const d = (difficulty: number, skills: string[]): Extra => ({ difficulty, skills })

export const QUESTIONS: Question[] = [
  // 1. Big and small letters
  matchCase('unit1', UNIT_1, 5, d(30, S.caseBoard)),
  matchCase('unit2', UNIT_2, 5, d(35, S.caseBoard)),
  matchCase('tall', ['b', 'f', 'h', 'l', 't'], 4, d(45, S.caseBoard)),
  matchCase('round', ['c', 'o', 'x', 'u', 'e', 'a'], 4, d(25, S.caseBoard)),
  matchCase('mix', [...LETTERS], 5, d(50, S.caseBoard)),
  smallOf('a', ['e', 'o'], d(30, S.case)),
  smallOf('c', ['o', 'e'], d(15, S.case)),
  smallOf('e', ['c', 'a'], d(35, S.case)),
  smallOf('h', ['b', 'l'], d(40, S.case)),
  smallOf('l', ['t', 'h'], d(35, S.case)),
  smallOf('t', ['f', 'l'], d(40, S.case)),
  smallOf('f', ['t', 'l'], d(35, S.case)),
  smallOf('m', ['u', 'h'], d(25, S.case)),
  smallOf('b', ['h', 'l'], d(40, S.case)),
  smallOf('o', ['c', 'a'], d(15, S.case)),
  smallOf('x', ['c', 'u'], d(20, S.case)),
  smallOf('u', ['m', 'o'], d(30, S.case)),
  bigOf('a', ['h', 'm'], d(45, S.case)),
  bigOf('e', ['f', 'c'], d(45, S.case)),
  bigOf('h', ['b', 'l'], d(40, S.case)),
  bigOf('b', ['h', 'e'], d(40, S.case)),
  bigOf('t', ['f', 'l'], d(35, S.case)),
  bigOf('u', ['o', 'x'], d(30, S.case)),

  // 2. Letters and numbers to pictures
  matchLetters('unit1', UNIT_1, 4, d(35, S.initialBoard)),
  matchLetters('unit2', ['f', 'm', 'b', 'o', 'u'], 4, d(40, S.initialBoard)),
  matchLetters('mix', [...LETTERS].filter((l) => l !== 'x'), 4, d(50, S.initialBoard)),
  matchLetters('vowels', ['a', 'e', 'o', 'u'], 4, d(45, S.initialBoard)),
  matchNumbers('123', [1, 2, 3], 2, d(15, S.numberBoard)),
  matchNumbers('456', [4, 5, 6], 2, d(35, S.numberBoard)),
  matchNumbers('mix', [1, 2, 3, 4, 5, 6], 2, d(40, S.numberBoard)),
  ...LETTERS.filter((l) => l !== 'x').map((l, n) => picFor(l, d([25, 30, 35, 30, 35, 40, 30, 30, 35, 45, 45][n]!, S.initial))),
  countQ(1, d(10, S.count)),
  countQ(2, d(15, S.count)),
  countQ(3, d(20, S.count)),
  countQ(4, d(30, S.count)),
  countQ(5, d(35, S.count)),
  countQ(6, d(40, S.count)),
  findNumber(3, d(25, S.count)),
  findNumber(4, d(30, S.count)),
  findNumber(5, d(40, S.count)),
  findNumber(6, d(45, S.count)),

  // 3. Circle the correct word (the book's four first)
  wordQ('ears', ['legs', 'eyes'], d(40, S.reading)),
  wordQ('horse', ['lamb', 'tiger'], d(30, S.reading)),
  wordQ('sister', ['brother', 'father'], d(45, S.reading), 'pic:sisters'),
  wordQ('orange', ['brown', 'blue'], d(40, S.reading)),
  wordQ('cat', ['cap', 'car'], d(35, S.reading)),
  wordQ('cap', ['cat', 'cow'], d(35, S.reading)),
  wordQ('car', ['cat', 'cap'], d(35, S.reading)),
  wordQ('cow', ['cat', 'car'], d(30, S.reading)),
  wordQ('ant', ['arm', 'apple'], d(35, S.reading)),
  wordQ('apple', ['ant', 'arm'], d(30, S.reading)),
  wordQ('arm', ['eyes', 'head'], d(35, S.reading)),
  wordQ('egg', ['ear', 'elbow'], d(35, S.reading)),
  wordQ('elbow', ['elephant', 'egg'], d(45, S.reading)),
  wordQ('elephant', ['egg', 'elbow'], d(30, S.reading)),
  wordQ('hat', ['hand', 'horse'], d(30, S.reading)),
  wordQ('hand', ['head', 'hat'], d(40, S.reading)),
  wordQ('head', ['hand', 'horse'], d(40, S.reading)),
  wordQ('nose', ['mouth', 'hand'], d(35, S.reading)),
  wordQ('mouth', ['nose', 'hand'], d(40, S.reading)),
  wordQ('lion', ['lemon', 'lamb'], d(35, S.reading)),
  wordQ('lemon', ['lion', 'lamb'], d(35, S.reading)),
  wordQ('lamb', ['lion', 'legs'], d(40, S.reading)),
  wordQ('legs', ['ears', 'eyes'], d(40, S.reading)),
  wordQ('toe', ['toy', 'tiger'], d(45, S.reading)),
  wordQ('tiger', ['toe', 'teacher'], d(30, S.reading)),
  wordQ('teacher', ['tiger', 'toy'], d(40, S.reading)),
  wordQ('father', ['mother', 'brother'], d(40, S.reading)),
  wordQ('mother', ['father', 'sister'], d(40, S.reading)),
  wordQ('brother', ['sister', 'father'], d(45, S.reading)),
  wordQ('fan', ['fox', 'man'], d(35, S.reading)),
  wordQ('fox', ['box', 'frog'], d(40, S.reading)),
  wordQ('frog', ['fox', 'fan'], d(35, S.reading)),
  wordQ('mug', ['man', 'mat'], d(40, S.reading)),
  wordQ('man', ['mat', 'mug'], d(40, S.reading)),
  wordQ('mat', ['man', 'bat'], d(45, S.reading)),
  wordQ('box', ['fox', 'bag'], d(40, S.reading)),
  wordQ('bat', ['bag', 'bed'], d(45, S.reading)),
  wordQ('bag', ['bat', 'box'], d(45, S.reading)),
  wordQ('bed', ['bag', 'bat'], d(40, S.reading)),
  wordQ('oven', ['open', 'on'], d(45, S.reading)),
  wordQ('umbrella', ['up', 'under'], d(35, S.reading)),
  wordQ('under', ['up', 'upset'], d(50, S.reading)),
  wordQ('blue', ['black', 'brown'], d(40, S.reading)),
  wordQ('brown', ['orange', 'blue'], d(45, S.reading)),

  // 4. Copy the following (letters, numbers and the book's words)
  ...LETTERS.map((l, n) => copyQ(`pair-${l}`, `${l.toUpperCase()} ${l}`, d([20, 15, 25, 30, 20, 25, 30, 35, 35, 15, 20, 25][n]!, S.copyLetters))),
  copyQ('num-123', '1 2 3', d(15, S.copyNumbers)),
  copyQ('num-456', '4 5 6', d(25, S.copyNumbers)),
  ...['cat', 'hat', 'ant', 'bat', 'fan', 'cut', 'mat', 'car', 'toe', 'on', 'box', 'bed'].map((word, n) =>
    copyQ(`word-${word}`, word, d([30, 35, 30, 35, 35, 35, 30, 35, 30, 20, 35, 35][n]!, S.copyWords)),
  ),

  // 5. Write the missing initial letter (the card's six words first)
  missing('train', d(45, S.missing)),
  missing('toe', d(40, S.missing)),
  missing('mat', d(30, S.missing)),
  missing('lemon', d(35, S.missing)),
  missing('on', d(40, S.missing)),
  missing('car', d(30, S.missing)),
  missing('elbow', d(45, S.missing)),
  missing('arm', d(40, S.missing)),
  missing('head', d(35, S.missing)),
  missing('leg', d(35, S.missing)),
  missing('box', d(30, S.missing)),
  missing('foot', d(40, S.missing)),
  missing('under', d(45, S.missing)),
  missing('ant', d(35, S.missing)),
  missing('apple', d(30, S.missing)),
  missing('cat', d(25, S.missing)),
  missing('cow', d(30, S.missing)),
  missing('egg', d(35, S.missing)),
  missing('ear', d(40, S.missing)),
  missing('hat', d(30, S.missing)),
  missing('hand', d(35, S.missing)),
  missing('lion', d(30, S.missing)),
  missing('tiger', d(30, S.missing)),
  missing('fan', d(30, S.missing)),
  missing('fox', d(30, S.missing)),
  missing('frog', d(35, S.missing)),
  missing('mug', d(30, S.missing)),
  missing('man', d(30, S.missing)),
  missing('bat', d(30, S.missing)),
  missing('bed', d(35, S.missing)),
  missing('bag', d(35, S.missing)),
  missing('oven', d(45, S.missing)),
  missing('up', d(45, S.missing)),
  missing('umbrella', d(40, S.missing)),
]

// ── Narration ─────────────────────────────────────────────────────────────
// Arabic: Maryam Essa (Kuwaiti), the voice approved for «بصمة وأثر»; no diacritics.
// English: Alice (British educator) — chosen by the family on 2026-10-13 because she
// reads lone letters as letter names. Lines kept from the first test keep their recordings.
export const ASK_CLIPS = {
  'find-small': 'وين الحرف الصغير؟',
  'find-big': 'وين الحرف الكبير؟',
  'pic-for-letter': 'أي صورة تبدأ بهذا الحرف؟',
  missing: 'شنو الحرف الناقص في أول هذي الكلمة؟',
  'find-number': 'وين الصورة اللي فيها هذا الرقم؟',
  'match-case': 'نوصل كل حرف كبير… بالحرف الصغير مثله.',
  'match-pic': 'نوصل كل حرف… بالصورة اللي تبدأ فيه.',
  'match-num': 'نوصل كل رقم… بالصورة اللي فيها نفس العدد.',
  'circle-word': 'نختار الكلمة الصحيحة… حسب الصورة.',
  trace: 'نكتب بإصبعنا فوق الكتابة الرمادية… على الأربع سطور.',
} as const

export type AskClip = keyof typeof ASK_CLIPS

export const AR_UI_CLIPS = {
  welcome: 'هلا والله! يلا نتدرب على الإنجليزي… نختار درس، ونبدأ.',
  'test-intro': 'هذا اختبار تجريبي… فيه أسئلة من كل الدروس. يلا نبدأ!',
  'match-wrong': 'لا… نجرب مرة ثانية.',
  'match-top-first': 'نختار من فوق أول… وبعدين من تحت.',
  'trace-again': 'نكتب فوق الكتابة الرمادية بالضبط… ونحاول مرة ثانية.',
  review: 'خلنا نتذكر مع بعض…',
  // Arabic cheers, mixed in with the English ones.
  'cheer-1': 'كفو!',
  'cheer-2': 'ما شاء الله! صح.',
  'cheer-3': 'واو! جواب صح!',
  'cheer-4': 'برافو! جواب ممتاز.',
  'cheer-5': 'الله! جواب حلو.',
  'cheer-6': 'تمام التمام!',
  // After a wrong answer: encourage, then give the right answer.
  'retry-1': 'مو مشكلة… الجواب الصح…',
  'retry-2': 'قربنا! الجواب الصح…',
  'retry-3': 'خلنا نتعلمها مع بعض… الجواب الصح…',
  'retry-4': 'محاولة حلوة! الجواب الصح…',
  'retry-5': 'نشوف مع بعض… الجواب الصح…',
} as const

export type ArUiClip = keyof typeof AR_UI_CLIPS

export const EN_UI_CLIPS = {
  'praise-1': 'Great job!',
  'praise-2': 'Well done!',
  'praise-3': 'Super!',
  'praise-4': 'Excellent!',
  'praise-5': 'Awesome!',
  'praise-6': 'Fantastic!',
  'praise-7': 'You got it!',
  'praise-8': 'Brilliant!',
  'praise-9': 'Wonderful!',
  'praise-10': 'Perfect!',
  'praise-11': 'Good thinking!',
  'praise-12': 'Yes! That’s right!',
  'done-great': 'Amazing! You are a superstar!',
  'done-good': 'Good job! Let’s practise again.',
} as const

export type EnUiClip = keyof typeof EN_UI_CLIPS

export interface Cheer {
  text: string
  clip: string
  lang: 'ar' | 'en'
}

/** Every cheer, English and Arabic; the quiz picks one at random, never a recent one. */
export const CHEERS: Cheer[] = [
  ...(Object.keys(EN_UI_CLIPS) as EnUiClip[])
    .filter((id) => id.startsWith('praise-'))
    .map((id) => ({ text: EN_UI_CLIPS[id], clip: clip.en(id), lang: 'en' as const })),
  ...(Object.keys(AR_UI_CLIPS) as ArUiClip[])
    .filter((id) => id.startsWith('cheer-'))
    .map((id) => ({ text: AR_UI_CLIPS[id], clip: clip.ui(id), lang: 'ar' as const })),
]

/** Encouragement before the right answer is shown. */
export const RETRIES = (Object.keys(AR_UI_CLIPS) as ArUiClip[])
  .filter((id) => id.startsWith('retry-'))
  .map((id) => ({ text: AR_UI_CLIPS[id].replace('الجواب الصح…', '').replace('…', '').trim(), clip: clip.ui(id) }))

/** Letters whose bare name is misread ("H" came out as "haitch"). */
const LETTER_NAMES: Record<string, string> = { h: 'Aitch.' }

export interface AudioCue {
  id: string
  text: string
  lang: 'ar' | 'en'
}

export function bare(text: string): string {
  return text.replace(/[ً-ْٰ]/g, '')
}

/** Every English word a question says: its pictures, its words to circle and its copy words. */
export function spokenWords(): string[] {
  const words = new Set<string>()
  for (const id of QUESTIONS.flatMap((question) => [...question.reveal, ...question.ask, ...question.pairs.map((pair) => pair.clip)])) {
    if (id.startsWith('en/word/')) words.add(id.slice('en/word/'.length))
  }
  // Drawn pictures are said too.
  for (const list of Object.values(LETTER_WORDS)) list.forEach((word) => words.add(word))
  return [...words].sort()
}

export function audioCues(): AudioCue[] {
  const en = (id: string, text: string): AudioCue => ({ id, text, lang: 'en' })
  const ar = (id: string, text: string): AudioCue => ({ id, text: bare(text), lang: 'ar' })
  return [
    ...LETTERS.map((letter) => en(clip.letter(letter), LETTER_NAMES[letter] ?? `${letter.toUpperCase()}.`)),
    ...spokenWords().map((word) => en(clip.word(word), `${cap(word)}.`)),
    ...[1, 2, 3, 4, 5, 6].map((n) => en(clip.number(n), `${cap(NUMBER_WORDS[n]!)}.`)),
    ...(Object.keys(EN_UI_CLIPS) as EnUiClip[]).map((id) => en(clip.en(id), EN_UI_CLIPS[id])),
    ...(Object.keys(ASK_CLIPS) as AskClip[]).map((id) => ar(clip.ask(id), ASK_CLIPS[id])),
    ...(Object.keys(COUNTABLES) as Countable[]).map((thing) => ar(clip.count(thing), COUNTABLES[thing].ar)),
    ...(Object.keys(AR_UI_CLIPS) as ArUiClip[]).map((id) => ar(clip.ui(id), AR_UI_CLIPS[id])),
  ]
}

/** Every clip a question can play in any of its draws. */
function questionClips(question: Question): string[] {
  const clips = [...question.ask, ...question.reveal, ...question.pairs.flatMap((pair) => [pair.topClip, pair.clip])]
  if (question.format === 'match-letters' || question.format === 'pic-for-letter') {
    clips.push(...Object.values(LETTER_WORDS).flat().map(clip.word), ...LETTERS.map(clip.letter))
  }
  if (question.format === 'count') clips.push(...(Object.keys(COUNTABLES) as Countable[]).map(clip.count))
  return clips
}

/** Every clip a round needs, so it can be loaded before the first question. */
export function roundClips(questions: Question[]): string[] {
  return [
    ...new Set([
      ...questions.flatMap(questionClips),
      clip.ui('match-wrong'),
      clip.ui('match-top-first'),
      clip.ui('trace-again'),
      clip.ui('review'),
      ...CHEERS.map((cheer) => cheer.clip),
      ...RETRIES.map((retry) => retry.clip),
      clip.en('done-great'),
      clip.en('done-good'),
    ]),
  ]
}
