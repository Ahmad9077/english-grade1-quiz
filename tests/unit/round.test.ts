import { describe, expect, it } from 'vitest'
import { QUESTIONS, TOPICS } from '../../src/data/catalog'
import { PRACTICE_SIZE, TEST_PER_TOPIC, arrangeOptions, buildPractice, buildTest, orderQuestions, starsFor } from '../../src/domain/round'

function seeded(seed: number) {
  let value = seed
  return () => {
    value = (value * 16807) % 2147483647
    return value / 2147483647
  }
}

describe('rounds', () => {
  it('builds a practice round from one lesson without repeats', () => {
    const round = buildPractice('missing', [], [], seeded(3))
    expect(round).toHaveLength(PRACTICE_SIZE)
    expect(new Set(round.map((q) => q.key)).size).toBe(PRACTICE_SIZE)
    expect(round.every((q) => q.topic === 'missing')).toBe(true)
  })

  it('builds the mock test with three questions from every lesson', () => {
    const round = buildTest([], [], seeded(7))
    expect(round).toHaveLength(TOPICS.length * TEST_PER_TOPIC)
    for (const topic of TOPICS) expect(round.filter((q) => q.topic === topic.id)).toHaveLength(TEST_PER_TOPIC)
  })

  it('puts Hub-selected questions first, then unseen ones', () => {
    const pool = QUESTIONS.filter((q) => q.topic === 'letters')
    const preferred = [pool[5]!.key, pool[2]!.key]
    const recent = pool.slice(0, 8).map((q) => q.key)
    const ordered = orderQuestions(pool, preferred, recent, seeded(1))
    expect(ordered.slice(0, 2).map((q) => q.key)).toEqual(preferred)
    const firstFresh = ordered[2]!
    expect(recent).not.toContain(firstFresh.key)
  })

  it('shuffles the choices of every pick question', () => {
    const moved = QUESTIONS.filter((q) => q.kind === 'pick').some(
      (q) => arrangeOptions(q, seeded(9)).map((o) => o.id).join() !== q.options.map((o) => o.id).join(),
    )
    expect(moved).toBe(true)
  })

  it('awards stars generously for young learners', () => {
    expect(starsFor(8, 8)).toBe(3)
    expect(starsFor(5, 8)).toBe(2)
    expect(starsFor(2, 8)).toBe(1)
    expect(starsFor(0, 0)).toBe(1)
  })
})
