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
// book and is drawn (svg:train). Narration: Arabic lines in Kuwaiti dialect (Maryam) and English
// letters, numbers, words and praise (Alice). Every question style has several Arabic lines and
// every moment (a cheer, a miss, the start, the end) several words, written afresh for this quiz;
// a round hands them out so the same words do not come twice running. Wording never speaks to a
// girl or a boy.
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

/** A clip, or one of Maryam's connecting lines (a round picks which of its variants). */
export type Spoken = string | { line: ArGroup }

/** The parts of a question that a round may draw afresh. */
export interface Dress {
  ask?: string[]
  lines?: LineGroup
  help?: string
  explain?: Spoken[]
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
  /** What the question asks aloud, in order: the English target, then Maryam's line. */
  ask: string[]
  /** The style's set of Arabic lines; each round says one of them (see `voiceQuestion`). */
  lines: LineGroup
  /** The Arabic line under the instruction: the one Maryam says. */
  help: string
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
  /** Said after a miss, after a kind word: how to find the answer. */
  explain: Spoken[]
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

/** Things a count question asks about; Maryam's question for each is `count-<thing>`. */
const COUNTABLES = {
  bears: { pic: 'teddy' },
  apples: { pic: 'apple' },
  flowers: { pic: 'flower' },
  frogs: { pic: 'frog' },
  cars: { pic: 'car' },
  cows: { pic: 'cow' },
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
  /** Maryam's line `n` (from 0) for a question style. */
  line: (group: LineGroup, n = 0) => `ar/q/${group}-${n + 1}`,
  ar: (group: ArGroup, n = 0) => `ar/ui/${group}-${n + 1}`,
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
  'match-case': { instruction: 'Match the uppercase letters with the lowercase letters', section: 'Reading' },
  small: { instruction: 'Circle the lowercase letter', section: 'Reading' },
  big: { instruction: 'Circle the uppercase letter', section: 'Reading' },
  'match-letters': { instruction: 'Match letters to pictures', section: 'Reading' },
  'match-numbers': { instruction: 'Match numbers to pictures', section: 'Reading' },
  'pic-for-letter': { instruction: 'Circle the correct picture', section: 'Reading' },
  count: { instruction: 'Count and circle', section: 'Reading' },
  'find-number': { instruction: 'Circle the correct picture', section: 'Reading' },
  word: { instruction: 'Circle the correct word', section: 'Reading' },
  copy: { instruction: 'Copy the following', section: 'Writing' },
  missing: { instruction: 'Write the missing initial letters', section: 'Writing' },
}

// ── What Maryam says for each question style ──────────────────────────────
// Several lines per style, in different shapes (a picture to imagine, a tip, a challenge, a
// question), written for this quiz rather than taken from the family's other quizzes. A round
// hands them out in a shuffled order, so the same words do not come twice running. A question's
// English target (a letter, a number or a word) is said just before its line. The lines speak to
// every child alike («we» and questions, never a girl- or boy-only word) and carry no diacritics.
export const ASK_LINES = {
  'match-case': [
    'الحروف الكبيرة فوق، تدور على أخوانها الصغار تحت!',
    'كل حرف كبير له حرف صغير، نربطهم بخط.',
    'نوصل الكبير بالصغير. وتحت حرف زيادة، ننتبه له!',
  ],
  // After the capital letter.
  small: ['وين أخوه الصغير؟', 'نحط دائرة على نفس الحرف، بس صغير.', 'ندور على الحرف الصغير اللي يشبهه!'],
  // After the small letter.
  big: ['وين أخوه الكبير؟', 'نحط دائرة على نفس الحرف، بس كبير.', 'ندور على الحرف الكبير اللي يشبهه!'],
  'match-letters': [
    'كل حرف يدور على صورة تبدأ فيه. نوصلهم!',
    'نقول اسم كل صورة، ونسمع أول حرف فيها.',
    'الحروف فوق، وصورها تحت. وفي صورة زيادة!',
  ],
  'match-numbers': [
    'نعد الأشياء في كل صورة، ونوصلها برقمها.',
    'كل رقم له صورة فيها نفس العدد. نلقاها!',
    'نعد على أصابعنا، ونربط كل رقم بصورته.',
  ],
  // After the letter.
  'pic-for-letter': ['وحدة بس من الصور تبدأ بهالحرف. وينها؟', 'نقول أسماء الصور، ونسمع أي وحدة تبدأ فيه.', 'هالحرف يدور على صورته!'],
  // After the number.
  'find-number': ['نعد كل مجموعة، ونلقى اللي فيها هالعدد.', 'نعد زين قبل لا نحط الدائرة. أي مجموعة فيها هالعدد؟', 'هالرقم يدور على صورته. نعد ونلقاها!'],
  'count-bears': ['كم دبدوب يبي يلعب معانا؟'],
  'count-apples': ['نعد التفاح مع بعض. كم تفاحة؟'],
  'count-flowers': ['نعد الورد على مهل. كم وردة؟'],
  'count-frogs': ['نعد الضفادع. كم ضفدع هني؟'],
  'count-cars': ['نعد السيارات بإصبعنا. كم سيارة؟'],
  'count-cows': ['كم بقرة في المزرعة؟'],
  word: [
    'نطالع الصورة، ونحط دائرة على اسمها.',
    'كلمة وحدة بس هي اسم الصورة. وينها؟',
    'نقرأ أول حرف من كل كلمة، يساعدنا نلقى الصح.',
    'شنو اسم هالصورة بالإنجليزي؟ نلقاه بين الكلمات.',
    'نقرأ الكلمات على مهل. أي وحدة تناسب الصورة؟',
    'تحدي القراءة! نحط دائرة على الكلمة الصح.',
  ],
  'copy-pair': ['حرفين، كبير وصغير. نكتبهم فوق الرمادي.', 'نمشي بإصبعنا على الحرفين، على مهل.', 'نكتب الحرف الكبير، وبعده أخوه الصغير.'],
  'copy-num': ['نكتب الأرقام بالترتيب، واحد واحد.', 'ثلاثة أرقام، نمشي بإصبعنا فوقها.'],
  'copy-word': ['نكتب الكلمة حرف حرف، من اليسار لليمين.', 'نمشي فوق الرمادي بالضبط، ولا نطلع برا.', 'نكتب الكلمة على مهل، مثل ما في الكتاب.'],
  // After the word.
  missing: [
    'ناقصها أول حرف. أي حرف نحط؟',
    'نسمع أول صوت في الكلمة، ونلقى حرفه.',
    'حرف ضاع من أول الكلمة! نرجعه مكانه.',
    'نقولها على مهل. شنو أول حرف فيها؟',
    'الصورة تساعدنا. أي حرف يكمل الكلمة؟',
    'أول خانة فاضية. نعبيها بالحرف الصح.',
  ],
} as const satisfies Record<string, readonly string[]>

export type LineGroup = keyof typeof ASK_LINES

/** A spoken line as it is shown on screen: its pauses become commas. */
export function shown(text: string): string {
  return text.replace(/\s*…\s*/g, '، ').replace(/[،\s]+$/, '').trim()
}

/** A question style's line set, with its first line as the one asked until a round picks. */
function voiced(group: LineGroup, before: string[] = []): Pick<Question, 'lines' | 'ask' | 'help'> {
  return { lines: group, ask: [...before, clip.line(group)], help: shown(ASK_LINES[group][0]) }
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
  return { key: `${topic}:${key}`, topic, kind, format, options: [] as Option[], pairs: [] as Pair[], decoys: [] as Decoy[], reveal: [] as string[], explain: [] as Spoken[], note: '', ...extra }
}

/** 1, 2, … n, said to count along. */
const countTo = (n: number) => Array.from({ length: n }, (_, k) => clip.number(k + 1))

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
    ...voiced('small', [clip.letter(letter)]),
    explain: [{ line: 'x-small' }, clip.letter(letter)],
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
    ...voiced('big', [clip.letter(letter)]),
    explain: [{ line: 'x-big' }, clip.letter(letter)],
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
    explain: letters.map(clip.letter),
    note: letters.map((l) => `${l.toUpperCase()} ${l}`).join('   '),
  })
  const first = pool.slice(0, count)
  return {
    ...base(`match-${key}`, 'case', 'match', 'match-case', extra),
    ...voiced('match-case'),
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
    explain: letters.flatMap((l, n) => [clip.letter(l), clip.word(words[n]!)]),
    note: letters.map((l, n) => `${l} — ${words[n]}`).join('   '),
  })
  const first = pool.slice(0, count)
  const firstDecoy = LETTERS.find((l) => !first.includes(l))!
  return {
    ...base(`match-${key}`, 'letters', 'match', 'match-letters', extra),
    ...voiced('match-letters'),
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
    explain: numbers.map(clip.number),
    note: numbers.join('   '),
  })
  const first = pool.slice(0, count)
  return {
    ...base(`numbers-${key}`, 'letters', 'match', 'match-numbers', extra),
    ...voiced('match-numbers'),
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
    explain: [{ line: 'x-pic' }, clip.word(word)],
    note: `${cap(word)} starts with ${letter}`,
  })
  const others = LETTERS.filter((l) => l !== letter && l !== 'x')
  return {
    ...base(`pic-${letter}`, 'letters', 'pick', 'pic-for-letter', extra),
    ...voiced('pic-for-letter', [clip.letter(letter)]),
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
    ...voiced(`count-${thing}`),
    subject: `count:${COUNTABLES[thing].pic}:${n}`,
    options: [n, ...others].map(numberOption),
  })
  return {
    ...base(`count-${n}`, 'letters', 'pick', 'count', extra),
    ...dress('bears', nearNumbers(n, () => 0)),
    answer: String(n),
    reveal: [clip.number(n)],
    explain: [{ line: 'x-count' }, ...countTo(n)],
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
    ...voiced('find-number', [clip.number(n)]),
    explain: [{ line: 'x-find' }, ...countTo(n)],
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
    ...voiced('word'),
    subject,
    options: [answer, ...others].map((word) => ({ id: word, art: `word:${word}`, label: word })),
    answer,
    reveal: [clip.word(answer)],
    explain: [{ line: 'x-word' }, clip.word(answer)],
    note: answer,
  }
}

/** «Copy the following»: write over the grey text on four lines. */
function copyQ(key: string, text: string, extra: Extra): Question {
  const tokens = text.split(' ')
  const reveal = [...new Set(tokens.map((token) => (/^\d$/.test(token) ? clip.number(Number(token)) : token.length === 1 ? clip.letter(token) : clip.word(token))))]
  const lines: LineGroup = /^\d/.test(text) ? 'copy-num' : tokens.length === 2 ? 'copy-pair' : 'copy-word'
  return {
    ...base(key, 'writing', 'trace', 'copy', extra),
    ...voiced(lines),
    text,
    answer: text,
    reveal,
    explain: reveal,
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
    ...voiced('missing', [clip.word(word)]),
    subject: WORD_ART[word]!,
    word,
    options: keys(others.slice(0, 5)),
    answer: letter,
    reveal: [clip.letter(letter), clip.word(word)],
    explain: [clip.word(word), { line: 'x-missing' }, clip.letter(letter)],
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
// reads lone letters as letter names. Alice says only the English of the test (letters,
// words, numbers); every cheer and kind word is Maryam's, in Kuwaiti (the family's wish,
// 8 November 2026). Every moment has several lines, written for this quiz so it does not
// sound like the family's other quizzes; a round deals them out in a shuffled order
// (src/domain/variety.ts). Clip ids are `<group>-<n>`.
//
// How the lines are written (the family's notes of 8 November 2026):
// - no «…» pause inside a line: the voice reads it as a sigh. Commas and full stops only.
// - Kuwaiti words: «نحط دائرة على», never «نحوط»; a count said on its own is «ثلاثة»,
//   «خمسة», never «ثلاث», «خمس».

/** Maryam's lines for the moments around the questions. */
export const AR_LINES = {
  welcome: [
    'أهلين! جاهزين للإنجليزي؟ نختار درس ونبدأ.',
    'يا هلا! الحروف والكلمات تنطرنا. من وين نبدأ؟',
    'مرحبا! يلا نتدرب على الإنجليزي، نختار درس.',
  ],
  'test-intro': [
    'اختبار تجريبي مثل ورقة الاختبار. نبدأ بالقراءة، وبعدها الكتابة. يلا!',
    'جاهزين؟ عشرة أسئلة مثل الاختبار بالضبط. أول شي القراءة.',
  ],
  /** In the mock test, before the first Writing question. */
  'to-writing': ['خلصنا القراءة! الحين جزء الكتابة.', 'القراءة خلصت، الحين نكتب!'],
  /** A board: a wrong pair was tried. */
  'match-wrong': ['خلنا نجرب وحدة ثانية!', 'ما ضبطت، نطالع زين ونجرب.', 'قريب! بس مو هذي.'],
  /** A board: the bottom row was tapped first. */
  'top-first': ['نختار من فوق أول، وبعدين من تحت.'],
  /** Copying: the first check did not pass. */
  'trace-again': ['نكتب فوق الكتابة الرمادية بالضبط، ونحاول مرة ثانية.', 'باقي شوي! نمشي على الرمادي بالضبط.'],
  /** A board or a copy that missed: before the answer is said. */
  review: ['نشوفها مع بعض.', 'يلا نراجعها سوا.', 'نسمعها مرة ثانية.'],
  /** A wrong choice: a kind word, then the explanation. */
  retry: ['كانت قريبة!', 'ولا يهم!', 'عادي، نتعلم من الغلط.', 'هذي صعبة شوي.', 'ما عليه، نشوفها مع بعض.', 'المرة الياية أسهل!', 'خطوة خطوة نتعلم.'],
  // The explanation after a miss: each line leads into the letter, word or count that follows it.
  'x-small': ['حرفه الصغير هو'],
  'x-big': ['حرفه الكبير هو'],
  'x-pic': ['الصورة اللي تبدأ فيه هي', 'هالحرف يبدأ فيه اسم'],
  'x-count': ['نعدها مع بعض', 'نعد على مهل'],
  'x-find': ['نعد الصورة الصح مع بعض'],
  'x-word': ['هذي الصورة اسمها', 'اسمها بالإنجليزي'],
  'x-missing': ['تبدأ بحرف', 'أول حرف فيها'],
  // Cheers: for any question, and for one kind of question.
  cheer: [
    'صح مية بالمية!',
    'ضربة معلم!',
    'يا حلو هالجواب!',
    'ولا غلطة!',
    'جواب ذهب!',
    'هذا هو بالضبط!',
    'شغل نظيف ومرتب!',
    'تصفيقة كبيرة!',
    'هذي هي الشطارة!',
    'جواب يرفع الراس!',
    'صح! والإنجليزي صار سهل.',
    'ممتاز! نكمل جذي.',
    'حلوة هذي!',
    'صح، وبثقة!',
    'هذا اللي نبيه!',
    'جواب كشخة!',
  ],
  'cheer-match': ['كل الخطوط في مكانها!', 'توصيل مضبوط!', 'كل وحدة لقت مكانها!'],
  'cheer-trace': ['كتابة مرتبة مثل الكتاب!', 'خط ولا أحلى!', 'يد ثابتة وخط حلو!'],
  'cheer-missing': ['رجع الحرف مكانه!', 'الكلمة صارت كاملة!', 'لقينا الحرف الضايع!'],
  'cheer-word': ['قراءة ممتازة!', 'قرينا الكلمة صح!', 'نقرا مثل الكبار!'],
  'cheer-count': ['العد مضبوط!', 'عدينا صح وبالترتيب!', 'الأصابع ما تغلط!'],
  /** Three, then five right answers running. */
  'streak-3': ['ثلاثة صح ورا بعض!', 'ثلاثة صح على طول!'],
  'streak-5': ['خمسة صح ورا بعض! ما في أحلى!', 'خمسة على طول! شي يفرح.'],
  'done-great': ['جولة ولا أروع! النجوم كلها لنا.', 'جولة ذهبية، نجوم كاملة!', 'جولة تفرح القلب!'],
  'done-good': ['زين! كل ما نتدرب، نصير أحسن.', 'حلو التدريب! نعيدها ونجمع نجوم أكثر.', 'تعبنا وتعلمنا! نعيدها مرة ثانية؟'],
} as const satisfies Record<string, readonly string[]>

export type ArGroup = keyof typeof AR_LINES

export interface Line {
  text: string
  clip: string
  lang: 'ar'
}

export function arLines(group: ArGroup): Line[] {
  return AR_LINES[group].map((text, n) => ({ text, clip: clip.ar(group, n), lang: 'ar' }))
}

/** Cheers for any question. */
export const CHEERS: Line[] = arLines('cheer')

/** Kind words after a wrong choice. */
export const RETRIES: Line[] = arLines('retry')

type CheerKind = 'match' | 'trace' | 'missing' | 'word' | 'count'

/** Cheers that fit this question: its board, its writing, its word or its counting. */
export function ownCheers(question: Pick<Question, 'kind' | 'format'>): Line[] {
  const kinds: CheerKind[] = []
  if (question.kind === 'match' || question.kind === 'trace' || question.kind === 'missing') kinds.push(question.kind)
  if (question.format === 'word') kinds.push('word')
  if (question.format === 'count' || question.format === 'find-number' || question.format === 'match-numbers') kinds.push('count')
  return kinds.flatMap((kind) => arLines(`cheer-${kind}`))
}

/** The streak cheers, by how many right answers ran. */
export const STREAKS: Record<number, Line[]> = {
  3: arLines('streak-3'),
  5: arLines('streak-5'),
}

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

function groupCues<G extends string>(lines: Record<G, readonly string[]>, id: (group: G, n: number) => string, lang: 'ar' | 'en'): AudioCue[] {
  return (Object.keys(lines) as G[]).flatMap((group) => lines[group].map((text, n) => ({ id: id(group, n), text: lang === 'ar' ? bare(text) : text, lang })))
}

export function audioCues(): AudioCue[] {
  const en = (id: string, text: string): AudioCue => ({ id, text, lang: 'en' })
  return [
    ...LETTERS.map((letter) => en(clip.letter(letter), LETTER_NAMES[letter] ?? `${letter.toUpperCase()}.`)),
    ...spokenWords().map((word) => en(clip.word(word), `${cap(word)}.`)),
    ...[1, 2, 3, 4, 5, 6].map((n) => en(clip.number(n), `${cap(NUMBER_WORDS[n]!)}.`)),
    ...groupCues(ASK_LINES, clip.line, 'ar'),
    ...groupCues(AR_LINES, clip.ar, 'ar'),
  ]
}

/** Every clip of one of Maryam's line sets. */
export function lineClips(group: LineGroup): string[] {
  return ASK_LINES[group].map((_, n) => clip.line(group, n))
}

/** Every clip a question can play in any of its draws, with any of its lines. */
function questionClips(question: Question): string[] {
  const clips = [...question.ask, ...question.reveal, ...question.pairs.flatMap((pair) => [pair.topClip, pair.clip])]
  clips.push(...lineClips(question.lines))
  for (const item of question.explain) clips.push(...(typeof item === 'string' ? [item] : arLines(item.line).map((line) => line.clip)))
  if (question.format === 'match-letters' || question.format === 'pic-for-letter') {
    clips.push(...Object.values(LETTER_WORDS).flat().map(clip.word), ...LETTERS.map(clip.letter))
  }
  if (question.format === 'count') clips.push(...(Object.keys(COUNTABLES) as Countable[]).flatMap((thing) => lineClips(`count-${thing}`)), ...countTo(6))
  return clips
}

/** Every clip a round needs, so it can be loaded before the first question. */
export function roundClips(questions: Question[]): string[] {
  const moments: ArGroup[] = ['match-wrong', 'top-first', 'trace-again', 'review', 'retry', 'to-writing']
  return [
    ...new Set([
      ...questions.flatMap(questionClips),
      ...moments.flatMap((group) => arLines(group).map((line) => line.clip)),
      ...[...CHEERS, ...questions.flatMap(ownCheers), ...Object.values(STREAKS).flat()].map((line) => line.clip),
      ...[...arLines('done-great'), ...arLines('done-good')].map((line) => line.clip),
    ]),
  ]
}
