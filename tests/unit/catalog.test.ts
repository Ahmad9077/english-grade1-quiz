import fs from 'node:fs'
import { describe, expect, it } from 'vitest'
import { DRAWINGS } from '../../src/art/drawings'
import {
  AR_LINES,
  ASK_LINES,
  CARD_WORDS,
  CHEERS,
  EN_LINES,
  FORMATS,
  LETTERS,
  LETTER_WORDS,
  QUESTIONS,
  QUIZ_ID,
  RETRIES,
  TOPICS,
  WORD_ART,
  audioCues,
  roundClips,
  shown,
  type Question,
} from '../../src/data/catalog'
import { PRACTICE_SIZE, dressQuestion } from '../../src/domain/round'

/** Lines of the family's earlier quizzes (Arabic, Math, Social studies, Islamic, the first English test): not said here. */
const OLD_LINES = [
  'كفو!', 'ما شاء الله! صح.', 'واو! جواب صح!', 'برافو! جواب ممتاز.', 'الله! جواب حلو.', 'تمام التمام!', 'عفية!', 'صح! رائع.', 'زين! جواب صحيح.', 'يا سلام! صح.',
  'مو مشكلة… الجواب الصح…', 'قربنا! الجواب الصح…', 'خلنا نتعلمها مع بعض… الجواب الصح…', 'محاولة حلوة! الجواب الصح…', 'نشوف مع بعض… الجواب الصح…',
  'خلنا نتذكر مع بعض…', 'لا… نجرب مرة ثانية.', 'هلا والله! يلا نتدرب على الإنجليزي… نختار درس، ونبدأ.', 'هذا اختبار تجريبي… فيه أسئلة من كل الدروس. يلا نبدأ!',
  'وين الحرف الصغير؟', 'وين الحرف الكبير؟', 'أي صورة تبدأ بهذا الحرف؟', 'شنو الحرف الناقص في أول هذي الكلمة؟', 'وين الصورة اللي فيها هذا الرقم؟',
  'نوصل كل حرف كبير… بالحرف الصغير مثله.', 'نوصل كل حرف… بالصورة اللي تبدأ فيه.', 'نوصل كل رقم… بالصورة اللي فيها نفس العدد.', 'نختار الكلمة الصحيحة… حسب الصورة.',
  'نكتب بإصبعنا فوق الكتابة الرمادية… على الأربع سطور.', 'كم دبدوب في الصورة؟', 'كم تفاحة في الصورة؟', 'كم وردة في الصورة؟', 'كم ضفدع في الصورة؟', 'كم سيارة في الصورة؟', 'كم بقرة في الصورة؟',
  'Great job!', 'Well done!', 'Super!', 'Excellent!', 'Awesome!', 'Fantastic!', 'You got it!', 'Brilliant!', 'Wonderful!', 'Perfect!', 'Good thinking!', 'Yes! That’s right!',
]

function seeded(seed: number) {
  let value = seed
  return () => {
    value = (value * 16807) % 2147483647
    return value / 2147483647
  }
}

/** Every question as it can come up: its first draw and many random ones. */
const DRESSED: Question[] = QUESTIONS.flatMap((q) => [q, ...Array.from({ length: 40 }, (_, n) => dressQuestion(q, seeded(n + 11)))])

function artOf(q: Question): string[] {
  return [q.subject ?? '', ...q.options.map((o) => o.art), ...q.pairs.flatMap((p) => [p.top, p.bottom]), ...q.decoys.map((d) => d.art)].filter(Boolean)
}

const allArt = [...DRESSED.flatMap(artOf), ...TOPICS.flatMap((t) => t.art), ...Object.values(WORD_ART)]

describe('question bank', () => {
  it('uses the permanent quiz id', () => {
    expect(QUIZ_ID).toBe('english-grade1')
  })

  it('registers exactly these questions with the Hub, and removes the first test’s', () => {
    const seed = fs.readFileSync('integration/seed-english-grade1.sql', 'utf8')
    const inserted = seed.split('insert into public.question_difficulty_profiles')[1]!.match(/'[a-z]+:[a-z0-9-]+'/g) ?? []
    expect(inserted.map((key) => key.slice(1, -1))).toEqual(QUESTIONS.map((q) => q.key))
    expect(seed).toContain("delete from public.question_difficulty_profiles\nwhere quiz_id = 'english-grade1'")
    expect(seed).not.toMatch(/insert into public\.quiz_assignments/)
  })

  it('has unique, well-formed permanent keys', () => {
    const keys = QUESTIONS.map((q) => q.key)
    expect(new Set(keys).size).toBe(keys.length)
    for (const q of QUESTIONS) expect(q.key).toMatch(new RegExp(`^${q.topic}:[a-z0-9-]+$`))
  })

  it('follows the card: five parts in its order, each with enough for a full round', () => {
    expect(TOPICS.map((t) => t.id)).toEqual(['case', 'letters', 'words', 'writing', 'missing'])
    for (const topic of TOPICS) {
      expect(QUESTIONS.filter((q) => q.topic === topic.id).length, topic.id).toBeGreaterThanOrEqual(PRACTICE_SIZE + 4)
    }
  })

  it('covers pages 11–40: twelve letters, numbers 1–6 and the card’s six words', () => {
    expect([...LETTERS].sort().join('')).toBe('abcefhlmotux')
    for (const letter of LETTERS) {
      expect(QUESTIONS.some((q) => q.key === `case:small-${letter}`), letter).toBe(true)
      expect(QUESTIONS.some((q) => q.key === `writing:pair-${letter}`), letter).toBe(true)
    }
    for (const n of [1, 2, 3, 4, 5, 6]) expect(QUESTIONS.some((q) => q.key === `letters:count-${n}`), `count ${n}`).toBe(true)
    expect(CARD_WORDS).toEqual(['train', 'toe', 'mat', 'lemon', 'on', 'car'])
    for (const word of CARD_WORDS) expect(QUESTIONS.some((q) => q.key === `missing:${word}`), word).toBe(true)
    // The book's own test items.
    for (const key of ['words:ears', 'words:horse', 'words:sister', 'words:orange', 'missing:elbow', 'missing:arm', 'missing:head', 'missing:leg', 'missing:box', 'missing:foot', 'missing:under', 'writing:word-cat', 'writing:word-hat', 'writing:word-ant', 'writing:word-bat', 'writing:word-fan', 'writing:word-cut', 'writing:num-123', 'writing:num-456']) {
      expect(QUESTIONS.some((q) => q.key === key), key).toBe(true)
    }
  })

  it('carries the Progress Test’s own instruction line on every question', () => {
    const lines = new Set(Object.values(FORMATS).map((f) => f.instruction))
    for (const line of ['Match the uppercase letters with the lowercase letters', 'Match letters to pictures', 'Circle the correct word', 'Match numbers to pictures', 'Copy the following', 'Write the missing initial letters']) {
      expect(lines.has(line), line).toBe(true)
    }
  })

  it('has exactly one right choice per pick, in every draw', () => {
    for (const q of DRESSED.filter((entry) => entry.kind === 'pick')) {
      const ids = q.options.map((o) => o.id)
      expect(new Set(ids).size, q.key).toBe(ids.length)
      expect(ids, q.key).toContain(q.answer)
      expect(q.options.length, q.key).toBe(3)
      if (q.format === 'pic-for-letter') {
        const letter = q.key.split('-').at(-1)!
        expect(ids.filter((id) => id.startsWith(letter)), q.key).toEqual([q.answer])
      }
    }
  })

  it('builds boards like the book: distinct pairs and one extra item that joins nothing', () => {
    for (const q of DRESSED.filter((entry) => entry.kind === 'match')) {
      expect(q.pairs.length, q.key).toBeGreaterThanOrEqual(2)
      expect(new Set(q.pairs.map((p) => p.id)).size, q.key).toBe(q.pairs.length)
      expect(q.decoys.length, q.key).toBe(1)
      const bottoms = [...q.pairs.map((p) => p.bottom), ...q.decoys.map((d) => d.art)]
      expect(new Set(bottoms).size, q.key).toBe(bottoms.length)
      if (q.format === 'match-letters') {
        for (const p of q.pairs) expect(p.clip, q.key).toMatch(new RegExp(`^en/word/${p.id}`))
        const extra = q.decoys[0]!.label
        expect(q.pairs.some((p) => extra.startsWith(p.id)), q.key).toBe(false)
      }
      if (q.format === 'match-numbers') {
        expect(q.pairs.some((p) => p.id === q.decoys[0]!.label), q.key).toBe(false)
      }
    }
  })

  it('writes the missing letter with six keys, the answer among them', () => {
    for (const q of DRESSED.filter((entry) => entry.kind === 'missing')) {
      expect(q.word, q.key).toBe(q.key.split(':')[1])
      expect(q.answer, q.key).toBe(q.word!.charAt(0))
      const ids = q.options.map((o) => o.id)
      expect(ids.length, q.key).toBe(6)
      expect(new Set(ids).size, q.key).toBe(6)
      expect(ids, q.key).toContain(q.answer)
      expect(ids, q.key).toEqual([...ids].sort())
    }
  })

  it('gives every copy question text from the book to write over', () => {
    for (const q of QUESTIONS.filter((entry) => entry.kind === 'trace')) {
      expect(q.text, q.key).toMatch(/^[A-Za-z0-9]+( [A-Za-z0-9]+)*$/)
      expect(q.reveal.length, q.key).toBeGreaterThan(0)
    }
  })

  it('stores adaptive difficulty in the Hub range with skill tags', () => {
    for (const q of QUESTIONS) {
      expect(q.difficulty, q.key).toBeGreaterThanOrEqual(1)
      expect(q.difficulty, q.key).toBeLessThanOrEqual(100)
      expect(q.skills.length, q.key).toBeGreaterThan(0)
    }
  })

  it('has a picture for every word and every reference', () => {
    for (const words of Object.values(LETTER_WORDS)) for (const word of words) expect(WORD_ART[word], word).toBeDefined()
    for (const art of allArt.filter((a) => a.startsWith('svg:'))) expect(DRAWINGS[art.slice(4)], art).toBeDefined()
    const pics = new Set(fs.readdirSync('public/pics').map((file) => file.replace('.webp', '')))
    const used = new Set<string>()
    for (const art of allArt) {
      if (art.startsWith('pic:')) used.add(art.slice(4))
      if (art.startsWith('count:')) used.add(art.split(':')[1]!)
    }
    for (const pic of used) expect(pics.has(pic), pic).toBe(true)
    for (const pic of pics) expect(used.has(pic), `unused picture ${pic}`).toBe(true)
  })
})

describe('narration', () => {
  const manifest = JSON.parse(fs.readFileSync('public/audio/manifest.json', 'utf8')) as {
    voices: Record<'ar' | 'en', { name: string }>
    clips: Record<string, { text: string }>
  }
  const cues = new Map(audioCues().map((cue) => [cue.id, cue.text]))

  it('uses Maryam for Arabic and Alice for English', () => {
    expect(manifest.voices.ar.name).toBe('Maryam Essa - Kuwaiti Calm & Warm')
    expect(manifest.voices.en.name).toBe('Alice - Clear, Engaging Educator')
  })

  it('sends no diacritics to the voice and shows none on screen', () => {
    const marks = /[ً-ْٰ]/
    for (const cue of audioCues()) expect(cue.text, cue.id).not.toMatch(marks)
    for (const q of DRESSED) expect(q.help, q.key).not.toMatch(marks)
    for (const t of TOPICS) expect(t.title, t.id).not.toMatch(marks)
  })

  it('speaks to every child the same way (no girl- or boy-only words)', () => {
    const words = ['أحسنتي', 'شطورة', 'بطلة', 'عليج', 'إنتي', 'أنتي', 'تبين', 'تعلمي', 'تدربي', 'اسمعي', 'حاولي', 'اختاري', 'اكتبي', 'حوطي', 'شطور', 'بطل', 'عليك', 'اختار', 'اسمع', 'حاول', 'تبي', 'اكتب', 'حوط', 'تستاهل', 'تستاهلين']
    const gendered = new RegExp(`(?<![\\u0600-\\u06FF])(${words.join('|')})(?![\\u0600-\\u06FF])`)
    for (const cue of audioCues().filter((c) => c.lang === 'ar')) expect(cue.text, cue.id).not.toMatch(gendered)
  })

  it('shows the Arabic line Maryam says', () => {
    for (const q of DRESSED) {
      const said = cues.get(q.ask.at(-1)!)!
      expect(q.help, q.key).toBe(shown(said))
    }
    expect(shown('نطالع الصورة… ونحوط اسمها.')).toBe('نطالع الصورة، ونحوط اسمها.')
  })

  it('asks every question style in at least three ways, each a complete sentence', () => {
    for (const format of Object.keys(FORMATS)) {
      const groups = new Set(DRESSED.filter((q) => q.format === format).map((q) => q.lines))
      // A count question draws one of six things, each with its own line.
      if (format === 'count') for (const group of Object.keys(ASK_LINES)) if (group.startsWith('count-')) groups.add(group as keyof typeof ASK_LINES)
      const lines = [...groups].flatMap((group) => ASK_LINES[group])
      expect(new Set(lines).size, format).toBeGreaterThanOrEqual(3)
      for (const line of lines) expect(line, format).toMatch(/[؟.!]$/)
    }
    expect(ASK_LINES.word.length).toBeGreaterThanOrEqual(6)
    expect(ASK_LINES.missing.length).toBeGreaterThanOrEqual(6)
  })

  it('is worded afresh: no line from the family’s other quizzes, and no line twice', () => {
    const all = [...Object.values(ASK_LINES), ...Object.values(AR_LINES), ...Object.values(EN_LINES)].flat() as string[]
    for (const line of all) expect(OLD_LINES, line).not.toContain(line)
    expect(new Set(all).size).toBe(all.length)
  })

  it('has a current clip for every cue, in the right language', () => {
    for (const cue of audioCues()) {
      expect(manifest.clips[cue.id]?.text, cue.id).toBe(cue.text)
      expect(cue.id.startsWith(`${cue.lang}/`), cue.id).toBe(true)
      expect(fs.existsSync(`public/audio/${cue.id}.mp3`), cue.id).toBe(true)
    }
  })

  it('keeps no recordings the site no longer plays', () => {
    const files = fs.readdirSync('public/audio', { recursive: true, encoding: 'utf8' }).filter((file) => file.endsWith('.mp3')).map((file) => file.replace(/\.mp3$/, ''))
    for (const file of files) expect(cues.has(file), file).toBe(true)
    expect(Object.keys(manifest.clips).sort()).toEqual([...cues.keys()].sort())
  })

  it('has a recording for every clip any draw of a round can ask for', () => {
    const used = roundClips(DRESSED)
    for (const id of used) expect(cues.has(id), id).toBe(true)
    for (const q of DRESSED) {
      const explain = q.explain.filter((item): item is string => typeof item === 'string')
      for (const id of [...q.ask, ...q.reveal, ...explain, ...q.pairs.flatMap((p) => [p.topClip, p.clip])]) expect(cues.has(id), `${q.key} ${id}`).toBe(true)
      expect(q.explain.length, q.key).toBeGreaterThan(0)
    }
    // Every recording is reachable from some round (the welcome and the test's introduction are said outside one).
    const outside = [...AR_LINES.welcome.keys()].map((n) => `ar/ui/welcome-${n + 1}`).concat([...AR_LINES['test-intro'].keys()].map((n) => `ar/ui/test-intro-${n + 1}`))
    for (const id of cues.keys()) expect([...used, ...outside], id).toContain(id)
  })

  it('ends every question with a complete Arabic sentence', () => {
    for (const q of DRESSED) {
      const last = q.ask.at(-1)!
      expect(last.startsWith('ar/q/'), q.key).toBe(true)
      expect(cues.get(last), q.key).toMatch(/[؟.!]$/)
    }
  })

  it('has many cheers in English and Arabic, cheers for each kind of question, and kind words after a miss', () => {
    expect(CHEERS.length).toBeGreaterThanOrEqual(18)
    expect(CHEERS.filter((cheer) => cheer.lang === 'ar').length).toBeGreaterThanOrEqual(8)
    expect(new Set(CHEERS.map((cheer) => cheer.text)).size).toBe(CHEERS.length)
    expect(RETRIES.length).toBeGreaterThanOrEqual(6)
    for (const kind of ['match', 'trace', 'missing', 'word', 'count'] as const) {
      expect(AR_LINES[`cheer-${kind}`].length + EN_LINES[`cheer-${kind}`].length, kind).toBeGreaterThanOrEqual(2)
    }
  })
})
