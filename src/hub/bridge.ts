import { QUIZ_ID } from '../data/catalog'
import type { BuildMode, Difficulty, HubWindow } from './contracts'

export interface Attempt {
  questionKey: string
  chosen: string
  correct: boolean
}

export type ReportPath = 'none' | 'adaptive' | 'progress'

export interface RoundInfo {
  kind: 'practice' | 'test'
  topic?: string
  difficulty: Difficulty
}

export function levelFor(score: number, total: number): string {
  if (score === total) return 'A+'
  return score >= total * 0.8 ? 'A' : 'Practice'
}

export class HubBridge {
  constructor(
    private readonly mode: BuildMode,
    private readonly target: HubWindow = window as unknown as HubWindow,
  ) {}

  /** Reports one finished round: per-question attempts first, aggregate progress as the fallback. */
  async reportRound(attempts: readonly Attempt[], info: RoundInfo): Promise<ReportPath> {
    if (this.mode !== 'production-hub' || attempts.length === 0) return 'none'

    const adaptive = this.target.QuizzesHubAdaptive
    if (adaptive?.recordAttempt) {
      try {
        const result = await adaptive.recordAttempt(
          attempts.map((attempt) => ({ question: { key: attempt.questionKey }, correct: attempt.correct })),
        )
        if (result?.ok) return 'adaptive'
      } catch {
        // Fall back to the aggregate progress path below.
      }
    }

    const progress = this.target.QuizzesHubProgress
    if (!progress?.record) return 'none'
    try {
      const score = attempts.filter((attempt) => attempt.correct).length
      const result = await progress.record({
        quizId: QUIZ_ID,
        score,
        total: attempts.length,
        level: levelFor(score, attempts.length),
        details: {
          difficulty: info.difficulty,
          round: info.kind,
          topic: info.topic ?? 'all',
          questionKeys: attempts.map((attempt) => attempt.questionKey),
        },
      })
      return result?.ok ? 'progress' : 'none'
    } catch {
      return 'none'
    }
  }
}
