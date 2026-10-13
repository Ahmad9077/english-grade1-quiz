export type BuildMode = 'preview' | 'production-hub'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type QuizSource = 'preview' | 'hub'

export interface HubResult {
  ok?: boolean
  reason?: string
}

export interface HubAccess {
  ok?: boolean
  quizId?: string
  difficulty?: string
}

export interface HubAdaptivePlan {
  question_keys?: string[]
}

export interface HubAttemptItem {
  question: { key: string }
  correct: boolean
}

export interface HubProgressPayload {
  quizId: string
  score: number
  total: number
  level?: string
  details?: Record<string, unknown>
}

export interface HubWindow {
  QuizzesHubAccessReady?: Promise<HubAccess>
  QuizzesHubAdaptiveReady?: Promise<HubAdaptivePlan | undefined>
  QuizzesHubAdaptive?: {
    plan?: HubAdaptivePlan
    recordAttempt(attempts: HubAttemptItem[]): Promise<HubResult | undefined> | undefined
  }
  QuizzesHubProgress?: {
    record(payload: HubProgressPayload): Promise<HubResult | undefined> | undefined
  }
}
