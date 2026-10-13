import { QUESTIONS, TOPICS, type Option, type Question, type TopicId } from '../data/catalog'

export const PRACTICE_SIZE = 8
export const TEST_PER_TOPIC = 3

export type Random = () => number

export function shuffle<T>(items: readonly T[], random: Random = Math.random): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j] as T, copy[i] as T]
  }
  return copy
}

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

export function buildPractice(
  topic: TopicId,
  preferredKeys: readonly string[] = [],
  recentKeys: readonly string[] = [],
  random: Random = Math.random,
): Question[] {
  const chosen = orderQuestions(questionsFor(topic), preferredKeys, recentKeys, random).slice(0, PRACTICE_SIZE)
  return mixKinds(chosen, random)
}

export function buildTest(
  preferredKeys: readonly string[] = [],
  recentKeys: readonly string[] = [],
  random: Random = Math.random,
): Question[] {
  const picked = TOPICS.flatMap((topic) =>
    orderQuestions(questionsFor(topic.id), preferredKeys, recentKeys, random).slice(0, TEST_PER_TOPIC),
  )
  return mixKinds(shuffle(picked, random), random)
}

/** Avoid runs of the same question style so a round keeps changing pace. */
function mixKinds(questions: Question[], random: Random): Question[] {
  const result: Question[] = []
  const pool = [...questions]
  while (pool.length > 0) {
    const last = result.at(-1)
    const index = pool.findIndex((question) => question.kind !== last?.kind || question.topic !== last?.topic)
    const pickIndex = index === -1 ? Math.floor(random() * pool.length) : index
    result.push(...pool.splice(pickIndex, 1))
  }
  return result
}

/** Picture choices are shuffled; two-way sorts and true/false keep a fixed layout. */
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
