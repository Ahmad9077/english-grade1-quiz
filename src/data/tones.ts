import type { TopicId } from './catalog'

export type ToneId = TopicId | 'test'

// Each lesson keeps one crayon colour everywhere it appears.
export const TONES: Record<ToneId, { tone: string; tint: string; deep: string }> = {
  case: { tone: '#e8446b', tint: '#ffe1e8', deep: '#a3203f' },
  letters: { tone: '#3a7bd5', tint: '#dfeafc', deep: '#22508f' },
  numbers: { tone: '#f08a12', tint: '#ffebd1', deep: '#a3570a' },
  missing: { tone: '#2fa86b', tint: '#dcf4e7', deep: '#1c7047' },
  test: { tone: '#7b5ce0', tint: '#ece6ff', deep: '#4f36a8' },
}

export function toneStyle(id: ToneId): Record<string, string> {
  const { tone, tint, deep } = TONES[id]
  return { '--tone': tone, '--tint': tint, '--deep': deep }
}
