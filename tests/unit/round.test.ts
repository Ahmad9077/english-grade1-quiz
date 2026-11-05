import { describe, expect, it } from 'vitest'
import { ASK_LINES, CARD_WORDS, CHEERS, QUESTIONS, RETRIES, STREAKS, TOPICS } from '../../src/data/catalog'
import { PRACTICE_SIZE, TEST_PLAN, TEST_SIZE, arrangeOptions, buildPractice, buildTest, dressQuestion, orderQuestions, starsFor, testSlot } from '../../src/domain/round'
import { Deck } from '../../src/domain/variety'
import { cheerFor, explainClips, kindWord } from '../../src/domain/voice'

function seeded(seed: number) {
  let value = seed
  return () => {
    value = (value * 16807) % 2147483647
    return value / 2147483647
  }
}

describe('rounds', () => {
  it('builds a practice round from one lesson without repeats, mixing its question styles', () => {
    for (const topic of TOPICS) {
      const round = buildPractice(topic.id, [], [], seeded(3))
      expect(round, topic.id).toHaveLength(PRACTICE_SIZE)
      expect(new Set(round.map((q) => q.key)).size, topic.id).toBe(PRACTICE_SIZE)
      expect(round.every((q) => q.topic === topic.id), topic.id).toBe(true)
    }
    const formats = new Set(buildPractice('letters', [], [], seeded(5)).map((q) => q.format))
    expect(formats.size).toBeGreaterThanOrEqual(3)
  })

  it('does not bring back the last round’s questions while others are unseen', () => {
    for (const topic of TOPICS) {
      const first = buildPractice(topic.id, [], [], seeded(8)).map((q) => q.key)
      const second = buildPractice(topic.id, [], first, seeded(9)).map((q) => q.key)
      expect(second.filter((key) => first.includes(key)), topic.id).toEqual([])
    }
  })

  it('lays the mock test out like the book’s Progress Test: Reading A–D, then Writing A–B', () => {
    for (let seed = 1; seed < 30; seed += 1) {
      const round = buildTest([], [], seeded(seed))
      expect(round).toHaveLength(TEST_SIZE)
      expect(new Set(round.map((q) => q.key)).size).toBe(TEST_SIZE)
      expect(round.map((q) => q.format)).toEqual(TEST_PLAN.map((slot) => slot.formats[0]))
      expect(round[5]!.key.startsWith('writing:pair-')).toBe(true)
      expect(CARD_WORDS.map((word) => `missing:${word}`)).toContain(round[7]!.key)
    }
    expect(testSlot(0)).toMatchObject({ section: 'Reading', part: 'A', instruction: 'Match the uppercase letters with the lowercase letters' })
    expect(testSlot(TEST_SIZE - 1)).toMatchObject({ section: 'Writing', part: 'B', instruction: 'Write the missing initial letters' })
  })

  it('draws new letters and pictures for a board each round, keeping its key', () => {
    const board = QUESTIONS.find((q) => q.key === 'letters:match-mix')!
    const draws = new Set(Array.from({ length: 12 }, (_, n) => dressQuestion(board, seeded(n + 2)).pairs.map((p) => p.bottom).join()))
    expect(draws.size).toBeGreaterThan(6)
    expect(dressQuestion(board, seeded(4)).key).toBe(board.key)
  })

  it('puts Hub-selected questions first, then unseen ones', () => {
    const pool = QUESTIONS.filter((q) => q.topic === 'words')
    const preferred = [pool[5]!.key, pool[2]!.key]
    const recent = pool.slice(0, 8).map((q) => q.key)
    const ordered = orderQuestions(pool, preferred, recent, seeded(1))
    expect(ordered.slice(0, 2).map((q) => q.key)).toEqual(preferred)
    expect(recent).not.toContain(ordered[2]!.key)
  })

  it('shuffles the choices of a pick, but keeps the letter keys in order', () => {
    const moved = QUESTIONS.filter((q) => q.kind === 'pick').some((q) => arrangeOptions(q, seeded(9)).map((o) => o.id).join() !== q.options.map((o) => o.id).join())
    expect(moved).toBe(true)
    const keys = QUESTIONS.find((q) => q.kind === 'missing')!
    expect(arrangeOptions(keys, seeded(9))).toEqual(keys.options)
  })

  it('awards stars generously for young learners', () => {
    expect(starsFor(8, 8)).toBe(3)
    expect(starsFor(5, 8)).toBe(2)
    expect(starsFor(2, 8)).toBe(1)
    expect(starsFor(0, 0)).toBe(1)
  })
})

describe('variety', () => {
  it('deals every item before any comes back, and never the same twice running', () => {
    const deck = new Deck(['a', 'b', 'c', 'd'])
    const dealt = Array.from({ length: 40 }, (_, n) => deck.next(seeded(n + 1)))
    for (let n = 0; n < 40; n += 4) expect(new Set(dealt.slice(n, n + 4)).size).toBe(4)
    for (let n = 1; n < 40; n += 1) expect(dealt[n]).not.toBe(dealt[n - 1])
  })

  it('does not say the same instruction twice running, in a lesson or across rounds', () => {
    for (const topic of TOPICS) {
      const said = [1, 2, 3].flatMap((seed) => buildPractice(topic.id, [], [], seeded(seed))).map((q) => q.ask.at(-1))
      const byStyle = new Map<string, string[]>()
      const rounds = [1, 2, 3].flatMap((seed) => buildPractice(topic.id, [], [], seeded(seed + 10)))
      for (const q of rounds) byStyle.set(q.lines, [...(byStyle.get(q.lines) ?? []), q.ask.at(-1)!])
      for (const [style, lines] of byStyle) {
        if (ASK_LINES[style as keyof typeof ASK_LINES].length < 2) continue
        for (let n = 1; n < lines.length; n += 1) expect(lines[n], `${topic.id} ${style}`).not.toBe(lines[n - 1])
      }
      // In one round a style uses all its lines before any comes back; a one-line style
      // (counting one kind of thing) comes at most once.
      for (let seed = 1; seed < 20; seed += 1) {
        const round = buildPractice(topic.id, [], [], seeded(seed))
        for (const style of new Set(round.map((q) => q.lines))) {
          const said = round.filter((q) => q.lines === style).map((q) => q.ask.at(-1))
          expect(new Set(said).size, `${topic.id} ${style}`).toBe(Math.min(said.length, ASK_LINES[style].length))
        }
      }
      expect(new Set(said).size, topic.id).toBeGreaterThanOrEqual(5)
    }
    const words = buildPractice('words', [], [], seeded(4))
    expect(new Set(words.map((q) => q.help)).size).toBeGreaterThanOrEqual(5)
  })

  it('gives the mock test’s twin questions different words', () => {
    for (let seed = 1; seed < 10; seed += 1) {
      const round = buildTest([], [], seeded(seed))
      expect(round[2]!.help).not.toBe(round[3]!.help)
      expect(new Set([round[7]!.help, round[8]!.help, round[9]!.help]).size).toBe(3)
    }
  })

  it('cheers in turn, with a streak cheer on the third and fifth right answer running', () => {
    const question = QUESTIONS.find((q) => q.format === 'word')!
    const random = seeded(7)
    const cheers = Array.from({ length: 30 }, () => cheerFor(question, 1, random).text)
    for (let n = 1; n < cheers.length; n += 1) expect(cheers[n]).not.toBe(cheers[n - 1])
    expect(new Set(cheers).size).toBeGreaterThanOrEqual(15)
    expect(cheers.some((text) => !CHEERS.some((cheer) => cheer.text === text))).toBe(true)
    expect(STREAKS[3]).toContainEqual(cheerFor(question, 3))
    expect(STREAKS[5]).toContainEqual(cheerFor(question, 5))
    const kind = Array.from({ length: RETRIES.length }, () => kindWord().text)
    expect(new Set(kind).size).toBe(RETRIES.length)
  })

  it('explains a miss: counts along, says the word or the first letter', () => {
    const count = QUESTIONS.find((q) => q.key === 'letters:count-3')!
    expect(explainClips(count).slice(1)).toEqual(['en/num/1', 'en/num/2', 'en/num/3'])
    expect(explainClips(count)[0]).toMatch(/^ar\/ui\/x-count-\d$/)
    const train = QUESTIONS.find((q) => q.key === 'missing:train')!
    const said = explainClips(train)
    expect([said[0], said[2]]).toEqual(['en/word/train', 'en/letter/t'])
    expect(said[1]).toMatch(/^ar\/ui\/x-missing-\d$/)
  })
})
