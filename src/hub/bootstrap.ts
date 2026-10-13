import { QUIZ_ID } from '../data/catalog'
import type { BuildMode, Difficulty, HubAdaptivePlan, HubWindow, QuizSource } from './contracts'

export const HUB_URL = 'https://ahmad9077.github.io/quizzes-hub/'
const HUB_ASSET_ROOT = 'https://ahmad9077.github.io/quizzes-hub'
const ACCESS_TIMEOUT_MS = 10_000
const ADAPTIVE_TIMEOUT_MS = 1_500

export interface BootstrapContext {
  mode: BuildMode
  source: QuizSource
  difficulty: Difficulty
  preferredKeys: string[]
}

export function normalizeDifficulty(value: string | undefined): Difficulty {
  return value === 'easy' || value === 'hard' || value === 'medium' ? value : 'medium'
}

function loadScript(documentTarget: Document, src: string, quizId?: string): Promise<void> {
  const existing = documentTarget.querySelector<HTMLScriptElement>(`script[src="${src}"]`)
  if (existing?.dataset.loaded === 'true') return Promise.resolve()

  return new Promise((resolve, reject) => {
    const script = existing ?? documentTarget.createElement('script')
    script.addEventListener('load', () => {
      script.dataset.loaded = 'true'
      resolve()
    }, { once: true })
    script.addEventListener('error', () => reject(new Error(`Unable to load ${src}.`)), { once: true })
    if (!existing) {
      script.src = src
      script.async = false
      if (quizId) script.dataset.quizId = quizId
      documentTarget.head.append(script)
    }
  })
}

function withTimeout<T>(promise: Promise<T>, durationMs: number, fallback?: { value: T }): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      if (fallback) resolve(fallback.value)
      else reject(new Error('Hub client timed out.'))
    }, durationMs)
    promise.then(
      (value) => {
        window.clearTimeout(timer)
        resolve(value)
      },
      (error: unknown) => {
        window.clearTimeout(timer)
        reject(error)
      },
    )
  })
}

/**
 * Preview mode never touches the Hub. Production mode loads the shared access
 * guard first, so an unassigned or signed-out child is sent back to the Hub
 * before the quiz renders, then the optional progress and adaptive clients.
 */
export async function bootstrapQuiz(
  mode: BuildMode,
  windowTarget: Window = window,
  documentTarget: Document = document,
): Promise<BootstrapContext> {
  if (mode === 'preview') {
    return { mode, source: 'preview', difficulty: 'medium', preferredKeys: [] }
  }

  const target = windowTarget as unknown as HubWindow
  await loadScript(documentTarget, `${HUB_ASSET_ROOT}/config.js?v=4`)
  await loadScript(documentTarget, `${HUB_ASSET_ROOT}/access-guard.js?v=3`, QUIZ_ID)
  const access = await withTimeout(
    target.QuizzesHubAccessReady ?? Promise.reject(new Error('Hub access client is unavailable.')),
    ACCESS_TIMEOUT_MS,
  )

  await loadScript(documentTarget, `${HUB_ASSET_ROOT}/progress-client.js?v=6`, QUIZ_ID).catch(() => undefined)
  await loadScript(documentTarget, `${HUB_ASSET_ROOT}/adaptive-client.js?v=2`, QUIZ_ID).catch(() => undefined)
  const plan: HubAdaptivePlan | undefined = target.QuizzesHubAdaptiveReady
    ? await withTimeout(target.QuizzesHubAdaptiveReady, ADAPTIVE_TIMEOUT_MS, { value: undefined }).catch(() => undefined)
    : undefined

  return {
    mode,
    source: 'hub',
    difficulty: normalizeDifficulty(access.difficulty),
    preferredKeys: Array.isArray(plan?.question_keys) ? plan.question_keys : [],
  }
}
