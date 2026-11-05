import type { Random } from '../data/catalog'

export function shuffle<T>(items: readonly T[], random: Random = Math.random): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j] as T, copy[i] as T]
  }
  return copy
}

/**
 * Deals items in a shuffled order: none comes back before all the others have had a turn,
 * and the last of one pass never opens the next, so nothing is said twice running. Items to
 * `avoid` (already said this round) go to the back of a new pass.
 */
export class Deck<T> {
  private queue: T[] = []
  private last: T | undefined

  constructor(private readonly items: readonly T[]) {}

  next(random: Random = Math.random, avoid: readonly T[] = []): T {
    if (this.queue.length === 0) {
      const mixed = shuffle(this.items, random)
      this.queue = [...mixed.filter((item) => !avoid.includes(item)), ...mixed.filter((item) => avoid.includes(item))]
      if (this.queue.length > 1 && this.queue[0] === this.last) this.queue.push(this.queue.shift() as T)
    }
    this.last = this.queue.shift() as T
    return this.last
  }
}

const decks = new Map<string, Deck<unknown>>()

/** The deck called `name`. It lasts the whole visit, so a new round carries on where the last one stopped. */
export function deck<T>(name: string, items: readonly T[]): Deck<T> {
  let found = decks.get(name) as Deck<T> | undefined
  if (!found) {
    found = new Deck(items)
    decks.set(name, found as Deck<unknown>)
  }
  return found
}
