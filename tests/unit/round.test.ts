import { describe, expect, it } from 'vitest'
import { CARD_WORDS, QUESTIONS, TOPICS } from '../../src/data/catalog'
import { PRACTICE_SIZE, TEST_PLAN, TEST_SIZE, arrangeOptions, buildPractice, buildTest, dressQuestion, orderQuestions, starsFor, testSlot } from '../../src/domain/round'

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
