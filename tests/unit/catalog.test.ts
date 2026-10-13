import fs from 'node:fs'
import { describe, expect, it } from 'vitest'
import { DRAWINGS } from '../../src/art/drawings'
import { FACTS, LETTERS, QUESTIONS, QUIZ_ID, TEST_WORDS, TOPICS, WORD_ART, audioCues, clip, roundClips } from '../../src/data/catalog'
import { PRACTICE_SIZE } from '../../src/domain/round'

const allArt = [
  ...QUESTIONS.flatMap((q) => [q.subject ?? '', ...q.options.map((o) => o.art), ...q.pairs.flatMap((p) => [p.left, p.right])]),
  ...FACTS.flatMap((f) => f.art),
  ...TOPICS.flatMap((t) => t.art),
  ...Object.values(WORD_ART),
].filter(Boolean)

describe('question bank', () => {
  it('uses the permanent quiz id', () => {
    expect(QUIZ_ID).toBe('english-grade1')
  })

  it('keeps every published question key', () => {
    const keys = new Set(QUESTIONS.map((q) => q.key))
    const permanent = fs.readFileSync('integration/seed-english-grade1.sql', 'utf8').match(/'[a-z]+:[a-z0-9-]+'/g) ?? []
    expect(permanent.length).toBe(QUESTIONS.length)
    for (const key of permanent) expect(keys.has(key.slice(1, -1)), key).toBe(true)
  })

  it('has unique, well-formed permanent keys', () => {
    const keys = QUESTIONS.map((q) => q.key)
    expect(new Set(keys).size).toBe(keys.length)
    for (const q of QUESTIONS) expect(q.key).toMatch(new RegExp(`^${q.topic}:[a-z0-9-]+$`))
  })

  it('covers every lesson with enough questions for a full practice round', () => {
    expect(TOPICS.map((t) => t.id)).toEqual(['case', 'letters', 'numbers', 'missing'])
    for (const topic of TOPICS) {
      expect(QUESTIONS.filter((q) => q.topic === topic.id).length, topic.id).toBeGreaterThanOrEqual(PRACTICE_SIZE + 3)
    }
  })

  it('covers everything on the test card', () => {
    // The five test words each have a missing-letter question.
    for (const word of TEST_WORDS) expect(QUESTIONS.some((q) => q.key === `missing:${word}`), word).toBe(true)
    // Capital and small letters for this unit (F, M, B) and the earlier ones.
    for (const letter of LETTERS) expect(QUESTIONS.some((q) => q.key === `case:small-${letter}`), letter).toBe(true)
    // Numbers 4, 5 and 6 from page 31, both ways round.
    for (const n of [4, 5, 6]) {
      expect(QUESTIONS.some((q) => q.topic === 'numbers' && q.answer === String(n) && q.key.startsWith('numbers:count-')), `count ${n}`).toBe(true)
      expect(QUESTIONS.some((q) => q.key === `numbers:find-${n}`), `find ${n}`).toBe(true)
    }
    // A matching board in each matching skill, as on the worksheet.
    for (const topic of ['case', 'letters', 'numbers'] as const) {
      expect(QUESTIONS.some((q) => q.topic === topic && q.kind === 'match'), topic).toBe(true)
    }
  })

  it('has exactly one valid answer per pick question and distinct options', () => {
    for (const q of QUESTIONS.filter((entry) => entry.kind === 'pick')) {
      const ids = q.options.map((o) => o.id)
      expect(new Set(ids).size, q.key).toBe(ids.length)
      expect(ids, q.key).toContain(q.answer)
      expect(q.options.length, q.key).toBe(3)
      expect(q.pairs, q.key).toEqual([])
    }
  })

  it('builds matching boards of three distinct pairs', () => {
    for (const q of QUESTIONS.filter((entry) => entry.kind === 'match')) {
      expect(q.pairs.length, q.key).toBe(3)
      expect(new Set(q.pairs.map((p) => p.id)).size, q.key).toBe(3)
      expect(new Set(q.pairs.map((p) => p.right)).size, q.key).toBe(3)
      expect(q.options, q.key).toEqual([])
    }
  })

  it('gives every missing-letter question the word without its first letter', () => {
    for (const q of QUESTIONS.filter((entry) => entry.topic === 'missing')) {
      const word = q.key.split(':')[1]!
      expect(q.blank, q.key).toBe(word.slice(1))
      expect(q.answer, q.key).toBe(word.charAt(0))
    }
  })

  it('never reads out an answer the child has to recognise by sight', () => {
    for (const q of QUESTIONS.filter((entry) => entry.key.startsWith('case:') || entry.key.startsWith('numbers:find-'))) {
      for (const option of q.options) expect(option.clip, q.key).toBeUndefined()
    }
  })

  it('links every question to existing explanations', () => {
    const ids = new Set(FACTS.map((f) => f.id))
    for (const q of QUESTIONS) {
      expect(q.facts.length, q.key).toBeGreaterThan(0)
      for (const id of q.facts) expect(ids.has(id), `${q.key} → ${id}`).toBe(true)
    }
  })

  it('stores adaptive difficulty in the Hub range with skill tags', () => {
    for (const q of QUESTIONS) {
      expect(q.difficulty).toBeGreaterThanOrEqual(1)
      expect(q.difficulty).toBeLessThanOrEqual(100)
      expect(q.skills.length).toBeGreaterThan(0)
    }
  })

  it('has a drawing for every svg reference and a picture for every word', () => {
    for (const art of allArt.filter((a) => a.startsWith('svg:'))) expect(DRAWINGS[art.slice(4)], art).toBeDefined()
    for (const f of FACTS) for (const word of f.words ?? []) expect(WORD_ART[word], `${f.id}:${word}`).toBeDefined()
  })

  it('shows the book picture for lamb and bat (the school card writes «lab»)', () => {
    expect(WORD_ART.lamb).toBe('🐑')
    expect(WORD_ART.bat).toBe('🦇')
  })
})

describe('learn cards', () => {
  it('give every lesson at least five cards', () => {
    for (const topic of TOPICS) {
      const cards = FACTS.filter((f) => f.topic === topic.id && f.learn)
      expect(cards.length, topic.id).toBeGreaterThanOrEqual(5)
    }
  })

  it('teach the five test words first', () => {
    const cards = FACTS.filter((f) => f.topic === 'missing' && f.learn).map((f) => f.words?.[0])
    expect(cards).toEqual([...TEST_WORDS])
  })
})

describe('narration', () => {
  const manifest = JSON.parse(fs.readFileSync('public/audio/manifest.json', 'utf8')) as {
    voices: Record<'ar' | 'en', { name: string }>
    clips: Record<string, { text: string }>
  }

  it('uses Maryam for Arabic and Alice for English', () => {
    expect(manifest.voices.ar.name).toBe('Maryam Essa - Kuwaiti Calm & Warm')
    expect(manifest.voices.en.name).toBe('Alice - Clear, Engaging Educator')
  })

  it('sends no diacritics to the voice and shows none on screen', () => {
    const marks = /[ً-ْٰ]/
    for (const cue of audioCues()) expect(cue.text, cue.id).not.toMatch(marks)
    for (const q of QUESTIONS) expect(q.prompt, q.key).not.toMatch(marks)
    for (const t of TOPICS) expect(`${t.title}${t.short}`, t.id).not.toMatch(marks)
  })

  it('speaks to every child the same way (no girl- or boy-only words)', () => {
    const gendered = /أحسنتي|شطورة|بطلة|عليج|إنتي|أنتي|تبين|تعلمي|تدربي|اسمعي|حاولي|اختاري|شطور|بطل|عليك|اختار|اسمع|حاول|تبي /
    for (const cue of audioCues().filter((c) => c.lang === 'ar')) expect(cue.text, cue.id).not.toMatch(gendered)
    for (const q of QUESTIONS) expect(q.prompt, q.key).not.toMatch(gendered)
  })

  it('has a current clip for every cue, in the right language', () => {
    for (const cue of audioCues()) {
      expect(manifest.clips[cue.id]?.text, cue.id).toBe(cue.text)
      expect(cue.id.startsWith(`${cue.lang}/`), cue.id).toBe(true)
      expect(fs.existsSync(`public/audio/${cue.id}.mp3`), cue.id).toBe(true)
    }
  })

  it('has a recording for every clip a round can ask for', () => {
    const recorded = new Set(audioCues().map((cue) => cue.id))
    for (const id of roundClips(QUESTIONS)) expect(recorded.has(id), id).toBe(true)
    for (const topic of TOPICS) expect(recorded.has(clip.topic(topic.id)), topic.id).toBe(true)
  })
})
