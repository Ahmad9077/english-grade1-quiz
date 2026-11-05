import { ASK_LINES, CARD_WORDS, FORMATS, QUESTIONS, type Format, type Option, type Question, type Random, type TopicId } from '../data/catalog'
import { shuffle } from './variety'
import { voiceQuestion } from './voice'

export type { Random }
export { shuffle }

export const PRACTICE_SIZE = 8
/** A practice round never has more of one question style than this. */
const PER_FORMAT = 3

/**
 * The mock test, laid out like the book's Progress Tests (pages 21–22 and 39–40), which the
 * school's card follows: Reading A–D, then Writing A (copy) and B (missing initial letters).
 */
export interface Slot {
  section: 'Reading' | 'Writing'
  part: 'A' | 'B' | 'C' | 'D'
  formats: Format[]
  /** Only questions whose key starts with one of these. */
  keys?: string[]
}

export const TEST_PLAN: Slot[] = [
  { section: 'Reading', part: 'A', formats: ['match-case'] },
  { section: 'Reading', part: 'B', formats: ['match-letters'] },
  { section: 'Reading', part: 'C', formats: ['word'] },
  { section: 'Reading', part: 'C', formats: ['word'] },
  { section: 'Reading', part: 'D', formats: ['match-numbers'] },
  { section: 'Writing', part: 'A', formats: ['copy'], keys: ['writing:pair-'] },
  { section: 'Writing', part: 'A', formats: ['copy'], keys: ['writing:num-', 'writing:word-'] },
  { section: 'Writing', part: 'B', formats: ['missing'], keys: CARD_WORDS.map((word) => `missing:${word}`) },
  { section: 'Writing', part: 'B', formats: ['missing'] },
  { section: 'Writing', part: 'B', formats: ['missing'] },
]

export const TEST_SIZE = TEST_PLAN.length

/** Hub-preferred keys first (in plan order), then questions not seen recently, then the rest. */
export function orderQuestions(
  pool: readonly Question[],
  preferredKeys: readonly string[],
  recentKeys: readonly string[],
  random: Random = Math.random,
): Question[] {
  const byKey = new Map(pool.map((question) => [question.key, question]))
  const preferred = preferredKeys.map((key) => byKey.get(key)).filter((q): q is Question => Boolean(q))
  const used = new Set(preferred.map((question) => question.key))
  const recent = new Set(recentKeys)
  const rest = shuffle(pool.filter((question) => !used.has(question.key)), random)
  const fresh = rest.filter((question) => !recent.has(question.key))
  const stale = rest.filter((question) => recent.has(question.key))
  return [...preferred, ...fresh, ...stale]
}

export function questionsFor(topic: TopicId): Question[] {
  return QUESTIONS.filter((question) => question.topic === topic)
}

/** The question with this round's own draw of letters, pictures or keys. */
export function dressQuestion(question: Question, random: Random = Math.random): Question {
  if (!question.vary) return question
  return { ...question, ...question.vary(random) }
}

export function buildPractice(
  topic: TopicId,
  preferredKeys: readonly string[] = [],
  recentKeys: readonly string[] = [],
  random: Random = Math.random,
): Question[] {
  const ordered = orderQuestions(questionsFor(topic), preferredKeys, recentKeys, random)
  const recent = new Set(recentKeys.filter((key) => !preferredKeys.includes(key)))
  const unseen = ordered.filter((question) => !recent.has(question.key))
  const chosen: Question[] = []
  const add = (pool: Question[], capped: boolean) => {
    for (const question of pool) {
      if (chosen.length >= PRACTICE_SIZE) return
      if (chosen.includes(question)) continue
      if (capped && chosen.filter((entry) => entry.format === question.format).length >= PER_FORMAT) continue
      chosen.push(question)
    }
  }
  // Questions not seen lately come first, mixing styles; recent ones only fill a gap.
  add(unseen, true)
  add(unseen, false)
  add(ordered, false)
  return dressRound(mixFormats(chosen, random), random)
}

export function buildTest(
  preferredKeys: readonly string[] = [],
  recentKeys: readonly string[] = [],
  random: Random = Math.random,
): Question[] {
  const chosen: Question[] = []
  for (const slot of TEST_PLAN) {
    const pool = QUESTIONS.filter(
      (question) =>
        slot.formats.includes(question.format) &&
        (!slot.keys || slot.keys.some((prefix) => question.key === prefix || question.key.startsWith(prefix))) &&
        !chosen.includes(question),
    )
    const pick = orderQuestions(pool, preferredKeys, recentKeys, random)[0]
    if (pick) chosen.push(pick)
  }
  return dressRound(chosen, random)
}

/**
 * Each question's draw and its turn of Maryam's lines. A style with a single line (counting
 * bears, apples …) is drawn again rather than said twice in one round.
 */
function dressRound(questions: Question[], random: Random): Question[] {
  const said = new Map<string, number[]>()
  return questions.map((question) => {
    let dressed = dressQuestion(question, random)
    for (let tries = 0; tries < 8 && ASK_LINES[dressed.lines].length === 1 && said.has(dressed.lines); tries += 1) dressed = dressQuestion(question, random)
    const before = said.get(dressed.lines) ?? []
    const voiced = voiceQuestion(dressed, random, before)
    said.set(dressed.lines, [...before, Number(voiced.ask.at(-1)!.split('-').at(-1)) - 1])
    return voiced
  })
}

/** The test's heading for question `index`: «Reading · A)». */
export function testSlot(index: number): Slot & { instruction: string } {
  const slot = TEST_PLAN[index] ?? TEST_PLAN[0]!
  return { ...slot, instruction: FORMATS[slot.formats[0]!].instruction }
}

/** Avoid runs of the same question style so a round keeps changing pace. */
function mixFormats(questions: Question[], random: Random): Question[] {
  const result: Question[] = []
  const pool = shuffle(questions, random)
  while (pool.length > 0) {
    const last = result.at(-1)
    const index = pool.findIndex((question) => question.format !== last?.format)
    result.push(...pool.splice(index === -1 ? 0 : index, 1))
  }
  return result
}

/** Choices are shuffled; the missing-letter keys keep the book's letter order. */
export function arrangeOptions(question: Question, random: Random = Math.random): Option[] {
  return question.kind === 'pick' ? shuffle(question.options, random) : [...question.options]
}

export function starsFor(score: number, total: number): 1 | 2 | 3 {
  if (total === 0) return 1
  const ratio = score / total
  if (ratio >= 0.9) return 3
  if (ratio >= 0.6) return 2
  return 1
}
