import { QUIZ_ID, type TopicId } from '../data/catalog'

const STORAGE_KEY = `${QUIZ_ID}:progress:v1`
const RECENT_LIMIT = 40

export type StarKey = TopicId | 'test'

export interface SavedProgress {
  stars: Partial<Record<StarKey, number>>
  learned: TopicId[]
  recent: string[]
}

const EMPTY: SavedProgress = { stars: {}, learned: [], recent: [] }

// Storage may be unavailable (private mode, blocked site data); the app works without it.
export function loadProgress(): SavedProgress {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw) as Partial<SavedProgress>
    return {
      stars: typeof parsed.stars === 'object' && parsed.stars ? parsed.stars : {},
      learned: Array.isArray(parsed.learned) ? parsed.learned : [],
      recent: Array.isArray(parsed.recent) ? parsed.recent.filter((key) => typeof key === 'string') : [],
    }
  } catch {
    return EMPTY
  }
}

export function saveProgress(progress: SavedProgress): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // Ignore: progress is a convenience only.
  }
}

export function recordRound(progress: SavedProgress, key: StarKey, stars: number, keys: string[]): SavedProgress {
  const recent = [...new Set([...keys, ...progress.recent])].slice(0, RECENT_LIMIT)
  return {
    ...progress,
    stars: { ...progress.stars, [key]: Math.max(progress.stars[key] ?? 0, stars) },
    recent,
  }
}

export function recordLearned(progress: SavedProgress, topic: TopicId): SavedProgress {
  return progress.learned.includes(topic) ? progress : { ...progress, learned: [...progress.learned, topic] }
}
