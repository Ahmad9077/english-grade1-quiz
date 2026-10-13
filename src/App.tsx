import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { wakeAudio } from './audio/context'
import { Narrator } from './audio/player'
import { NarratorContext } from './audio/NarratorContext'
import { setSfxEnabled } from './audio/sfx'
import { TOPICS, clip, type TopicId } from './data/catalog'
import { loadProgress, recordLearned, recordRound, saveProgress, type SavedProgress } from './domain/progress'
import { buildPractice, buildTest, starsFor } from './domain/round'
import type { BootstrapContext } from './hub/bootstrap'
import type { Attempt, HubBridge } from './hub/bridge'
import { Home } from './components/Home'
import { LearnScreen } from './components/LearnScreen'
import { QuizScreen, type Round } from './components/QuizScreen'
import { ResultsScreen } from './components/ResultsScreen'
import { Splash } from './components/Splash'
import { TopicScreen } from './components/TopicScreen'

type Screen =
  | { name: 'splash' }
  | { name: 'home' }
  | { name: 'topic'; topic: TopicId }
  | { name: 'learn'; topic: TopicId }
  | { name: 'quiz'; round: Round }
  | { name: 'results'; round: Round; attempts: Attempt[] }

const MUTE_KEY = 'english-grade1:muted'

function readMuted(): boolean {
  try {
    return window.localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}

function screenKey(screen: Screen): string {
  if (screen.name === 'topic' || screen.name === 'learn') return `${screen.name}-${screen.topic}`
  if (screen.name === 'quiz' || screen.name === 'results') return `${screen.name}-${screen.round.id}`
  return screen.name
}

export default function App({ context, bridge }: { context: BootstrapContext; bridge: HubBridge }) {
  const narrator = useMemo(() => new Narrator(import.meta.env.BASE_URL), [])
  const [screen, setScreen] = useState<Screen>({ name: 'splash' })
  const [progress, setProgress] = useState<SavedProgress>(() => loadProgress())
  const [muted, setMuted] = useState(readMuted)
  const roundId = useRef(0)

  useEffect(() => {
    narrator.setMuted(muted)
    setSfxEnabled(!muted)
    try {
      window.localStorage.setItem(MUTE_KEY, muted ? '1' : '0')
    } catch {
      // Remembering the sound setting is optional.
    }
  }, [muted, narrator])

  useEffect(() => saveProgress(progress), [progress])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [screen])

  // Any tap wakes audio that the browser paused (for example after switching apps).
  useEffect(() => {
    window.addEventListener('pointerdown', wakeAudio, { passive: true })
    return () => window.removeEventListener('pointerdown', wakeAudio)
  }, [])

  const start = useCallback(() => {
    wakeAudio()
    setScreen({ name: 'home' })
    void narrator.play([{ clip: clip.ui('welcome') }])
    narrator.preload([...TOPICS.map((topic) => clip.topic(topic.id)), clip.ui('test-intro')])
  }, [narrator])

  const startPractice = useCallback(
    (topic: TopicId) => {
      roundId.current += 1
      setScreen({
        name: 'quiz',
        round: { id: roundId.current, kind: 'practice', tone: topic, questions: buildPractice(topic, context.preferredKeys, progress.recent) },
      })
    },
    [context.preferredKeys, progress.recent],
  )

  const startTest = useCallback(() => {
    roundId.current += 1
    setScreen({ name: 'quiz', round: { id: roundId.current, kind: 'test', tone: 'test', questions: buildTest(context.preferredKeys, progress.recent) } })
  }, [context.preferredKeys, progress.recent])

  const finishRound = useCallback(
    (round: Round, attempts: Attempt[]) => {
      const score = attempts.filter((attempt) => attempt.correct).length
      const key = round.kind === 'test' ? 'test' : (round.tone as TopicId)
      setProgress((current) => recordRound(current, key, starsFor(score, attempts.length), attempts.map((a) => a.questionKey)))
      void bridge.reportRound(attempts, {
        kind: round.kind,
        topic: round.kind === 'practice' ? round.tone : undefined,
        difficulty: context.difficulty,
      })
      setScreen({ name: 'results', round, attempts })
    },
    [bridge, context.difficulty],
  )

  const goHome = useCallback(() => setScreen({ name: 'home' }), [])

  return (
    <NarratorContext.Provider value={narrator}>
      <div className="paper" aria-hidden="true">
        {['A', 'b', 'F', 'm', 'B', '4', 'a', '6'].map((glyph, n) => (
          <span key={n} className={`float-glyph glyph-${n + 1}`}>
            {glyph}
          </span>
        ))}
      </div>
      <div key={screenKey(screen)} className="screen-frame">
        {screen.name === 'splash' ? <Splash onStart={start} /> : null}
        {screen.name === 'home' ? (
          <Home
            progress={progress}
            muted={muted}
            onToggleSound={() => setMuted((value) => !value)}
            onOpenTopic={(topic) => setScreen({ name: 'topic', topic })}
            onStartTest={startTest}
          />
        ) : null}
        {screen.name === 'topic' ? (
          <TopicScreen
            topic={screen.topic}
            progress={progress}
            onBack={goHome}
            onLearn={() => setScreen({ name: 'learn', topic: screen.topic })}
            onPractice={() => startPractice(screen.topic)}
          />
        ) : null}
        {screen.name === 'learn' ? (
          <LearnScreen
            topic={screen.topic}
            onBack={() => setScreen({ name: 'topic', topic: screen.topic })}
            onDone={() => setProgress((current) => recordLearned(current, screen.topic))}
            onPractice={() => startPractice(screen.topic)}
          />
        ) : null}
        {screen.name === 'quiz' ? (
          <QuizScreen
            round={screen.round}
            intro={screen.round.kind === 'test'}
            onExit={screen.round.kind === 'test' ? goHome : () => setScreen({ name: 'topic', topic: screen.round.tone as TopicId })}
            onFinish={(attempts) => finishRound(screen.round, attempts)}
          />
        ) : null}
        {screen.name === 'results' ? (
          <ResultsScreen
            round={screen.round}
            attempts={screen.attempts}
            onAgain={() => (screen.round.kind === 'test' ? startTest() : startPractice(screen.round.tone as TopicId))}
            onHome={goHome}
          />
        ) : null}
      </div>
    </NarratorContext.Provider>
  )
}
