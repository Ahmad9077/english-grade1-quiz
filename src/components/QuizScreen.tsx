import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Art } from '../art/Art'
import { celebrate } from '../art/confetti'
import { useNarrator } from '../audio/NarratorContext'
import type { Cue } from '../audio/player'
import { sfx } from '../audio/sfx'
import { CHEERS, FORMATS, clip, roundClips, shown, type Line as Spoken, type Option, type Pair, type Question } from '../data/catalog'
import { TONES, toneStyle, type ToneId } from '../data/tones'
import { arabicNumber } from '../domain/format'
import { arrangeOptions, shuffle, testSlot } from '../domain/round'
import { cheerFor, explainClips, kindWord, sayLine } from '../domain/voice'
import type { Attempt } from '../hub/bridge'
import { TraceBoard, WordStrip } from './TraceBoard'
import { ArrowIcon, BigButton, CloseButton, SpeakerButton, StarIcon, order } from './ui'

// Narration starts once the question has settled on screen.
const ASK_DELAY_MS = 380

export interface Round {
  id: number
  kind: 'practice' | 'test'
  tone: ToneId
  questions: Question[]
}

interface QuizScreenProps {
  round: Round
  /** Play the mock-test introduction before the first question. */
  intro?: boolean
  onExit: () => void
  onFinish: (attempts: Attempt[]) => void
}

type Phase = 'asking' | 'answered'

export function QuizScreen({ round, intro = false, onExit, onFinish }: QuizScreenProps) {
  const narrator = useNarrator()
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('asking')
  const [chosen, setChosen] = useState<string | null>(null)
  const [attempts, setAttempts] = useState<Attempt[]>([])
  // What was said after the answer: the cheer or the kind word, then what «إعادة» replays.
  const [said, setSaid] = useState<{ line: Spoken; replay: Cue[] }>({ line: CHEERS[0]!, replay: [] })
  const streak = useRef(0)
  const [confirmExit, setConfirmExit] = useState(false)
  const tileRefs = useRef(new Map<string, HTMLButtonElement>())
  const bodyRef = useRef<HTMLDivElement>(null)

  const question = round.questions[index]!
  const options = useMemo(() => arrangeOptions(question), [question])
  const info = FORMATS[question.format]
  const slot = round.kind === 'test' ? testSlot(index) : null
  const tone = round.kind === 'test' ? question.topic : round.tone
  const correctOption = question.options.find((option) => option.id === question.answer)
  const revealCues: Cue[] = question.reveal.map((id, n) => ({ clip: id, gap: n === 0 ? 300 : 220 }))
  const askCues = useMemo<Cue[]>(() => question.ask.map((id, n) => ({ clip: id, gap: n === 0 ? 0 : 160 })), [question])

  // Load every clip of the round up front, so no question waits for its audio.
  useEffect(() => {
    narrator.preload(roundClips(round.questions))
  }, [narrator, round.questions])

  useEffect(() => {
    // The mock test opens with its introduction and says when the Writing part begins.
    const before =
      intro && index === 0
        ? sayLine('test-intro').clip
        : slot?.section === 'Writing' && testSlot(index - 1).section === 'Reading'
          ? sayLine('to-writing').clip
          : null
    const opening = before ? [{ clip: before }, { ...askCues[0]!, gap: 500 }, ...askCues.slice(1)] : askCues
    const timer = window.setTimeout(() => void narrator.play(opening), ASK_DELAY_MS)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the intro plays once, before question one
  }, [askCues, narrator])

  useEffect(() => () => narrator.stop(), [narrator])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [index])

  // Keep the answers in view above the feedback sheet on short phone screens.
  useEffect(() => {
    if (phase !== 'answered') return
    const timer = window.setTimeout(() => {
      const box = bodyRef.current?.getBoundingClientRect()
      const sheet = document.querySelector('.feedback')?.getBoundingClientRect()
      if (!box || !sheet) return
      const overlap = box.bottom + 12 - sheet.top
      if (overlap > 0) window.scrollBy({ top: overlap, behavior: 'smooth' })
    }, 650)
    return () => window.clearTimeout(timer)
  }, [phase])

  function replay() {
    void narrator.play(phase === 'asking' ? askCues : said.replay)
  }

  function settle(correct: boolean, chosenId: string, anchor?: HTMLElement | null) {
    setPhase('answered')
    setAttempts((list) => [...list, { questionKey: question.key, chosen: chosenId, correct }])
    // A miss explains the answer: the board's pairs, the copy's text, or how to find the choice.
    const explainCues: Cue[] = explainClips(question).map((id, n) => ({ clip: id, gap: n === 0 ? 300 : 220 }))
    if (correct) {
      sfx.correct()
      streak.current += 1
      const line = cheerFor(question, streak.current)
      // A board's cheer stands alone; replaying it says its pairs.
      const after = question.kind === 'match' ? [] : revealCues
      setSaid({ line, replay: after.length > 0 ? after : explainCues })
      celebrate(anchor ?? undefined, TONES[tone].tone)
      void narrator.play([{ clip: line.clip, gap: 300 }, ...after])
    } else {
      sfx.wrong()
      streak.current = 0
      const line = question.kind === 'match' || question.kind === 'trace' ? sayLine('review') : kindWord()
      setSaid({ line, replay: explainCues })
      void narrator.play([{ clip: line.clip, gap: 450 }, ...explainCues])
    }
  }

  function answer(option: Option) {
    if (phase !== 'asking') return
    narrator.stop()
    setChosen(option.id)
    settle(option.id === question.answer, option.id, tileRefs.current.get(option.id))
  }

  function next() {
    sfx.tap()
    narrator.stop()
    if (index + 1 >= round.questions.length) {
      onFinish(attempts)
      return
    }
    setIndex(index + 1)
    setPhase('asking')
    setChosen(null)
  }

  const lastCorrect = attempts.at(-1)?.correct ?? false
  const answered = phase === 'answered'

  function optionState(option: Option): string {
    const isChosen = chosen === option.id
    const isAnswer = option.id === question.answer
    if (!answered) return ''
    if (isChosen) return isAnswer ? 'is-correct' : 'is-wrong'
    return isAnswer ? 'is-reveal' : 'is-dim'
  }

  function tileRef(id: string) {
    return (node: HTMLButtonElement | null) => {
      if (node) tileRefs.current.set(id, node)
      else tileRefs.current.delete(id)
    }
  }

  return (
    <main className={`screen quiz-screen ${answered ? 'has-feedback' : ''}`} style={toneStyle(tone)}>
      <header className="top-bar quiz-top">
        <CloseButton onClick={() => setConfirmExit(true)} />
        <div className="track" aria-label={`السؤال ${arabicNumber(index + 1)} من ${arabicNumber(round.questions.length)}`}>
          {round.questions.map((entry, n) => {
            const attempt = attempts[n]
            const state = attempt ? (attempt.correct ? 'is-right' : 'is-miss') : n === index ? 'is-current' : ''
            return (
              <span key={entry.key} className={`track-step ${state}`}>
                {attempt?.correct ? (
                  <span className="track-star pop">
                    <StarIcon />
                  </span>
                ) : null}
              </span>
            )
          })}
        </div>
        <span className="quiz-count">
          {arabicNumber(index + 1)}/{arabicNumber(round.questions.length)}
        </span>
      </header>

      <section
        key={`${round.id}-${index}`}
        className={`question question-${question.kind} format-${question.format} topic-${question.topic} question-in`}
        data-question-key={question.key}
        data-format={question.format}
      >
        <div className="paper-head">
          <div className="paper-line" dir="ltr">
            {slot ? (
              <span className="paper-part">
                <span className="paper-section">{slot.section}</span>
                <span className="paper-letter">{slot.part})</span>
              </span>
            ) : null}
            <h1 className="paper-instruction">{info.instruction}</h1>
          </div>
          <div className="paper-help">
            <SpeakerButton onClick={replay} />
            <p>{question.help}</p>
          </div>
        </div>

        <div ref={bodyRef} className="paper-box">
          {question.kind === 'match' ? (
            <MatchRows
              question={question}
              locked={answered}
              onTop={(pair) => void narrator.play([{ clip: pair.topClip }])}
              onPair={(pair) => {
                sfx.tap()
                void narrator.play([{ clip: pair.clip }])
              }}
              onMiss={() => {
                sfx.wrong()
                void narrator.play([{ clip: sayLine('match-wrong').clip }])
              }}
              onTopFirst={() => void narrator.play([{ clip: clip.ar('top-first') }])}
              onDone={(mistakes, board) => settle(mistakes === 0, `mistakes:${mistakes}`, board)}
            />
          ) : null}

          {question.kind === 'trace' ? (
            <TraceBoard
              key={question.key}
              text={question.text ?? ''}
              locked={answered}
              onMiss={() => {
                sfx.wrong()
                void narrator.play([{ clip: sayLine('trace-again').clip }])
              }}
              onDone={(correct, board) => settle(correct, correct ? 'traced' : 'not-traced', board)}
            />
          ) : null}

          {question.kind === 'missing' ? (
            <div className="missing-board">
              <span className="missing-picture pop" aria-hidden="true">
                <Art art={question.subject ?? ''} />
              </span>
              <WordStrip word={question.word ?? ''} filled={answered ? (chosen ?? question.answer) : null} tone={answered ? (lastCorrect ? 'good' : 'miss') : null} />
              <div className="letter-keys" dir="ltr">
                {options.map((option, n) => (
                  <button
                    key={option.id}
                    ref={tileRef(option.id)}
                    type="button"
                    className={`letter-key press rise ${optionState(option)}`}
                    style={order(n, { '--base-delay': '160ms' })}
                    onClick={() => answer(option)}
                    disabled={answered}
                    aria-label={option.label}
                    data-option={option.id}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {question.kind === 'pick' ? (
            <>
              {question.subject ? (
                <div className={`subject pop subject-${artKind(question.subject)}`} style={order(0, { '--base-delay': '80ms' })} aria-hidden="true">
                  <Art art={question.subject} />
                </div>
              ) : null}
              <div className={`options holds-${artKind(options[0]?.art ?? '')} count-${options.length}`} dir="ltr">
                {options.map((option, n) => {
                  const state = optionState(option)
                  return (
                    <div key={option.id} className="option-slot rise" style={order(n, { '--base-delay': '140ms' })}>
                      <button
                        ref={tileRef(option.id)}
                        type="button"
                        className={`option option-${artKind(option.art)} ${state}`}
                        onClick={() => answer(option)}
                        disabled={answered}
                        aria-label={option.label}
                        data-option={option.id}
                      >
                        <span className="option-art" aria-hidden="true">
                          <Art art={option.art} />
                        </span>
                        {state === 'is-correct' || state === 'is-reveal' ? <InkRing tone="good" /> : state === 'is-wrong' ? <InkRing tone="miss" /> : null}
                      </button>
                    </div>
                  )
                })}
              </div>
            </>
          ) : null}
        </div>
      </section>

      {answered ? (
        <aside key={`feedback-${index}`} className={`feedback ${lastCorrect ? 'feedback-good' : 'feedback-miss'}`} role="status">
          <div className="feedback-head">
            {lastCorrect ? (
              <span className="feedback-star spin-in">
                <StarIcon />
              </span>
            ) : (
              <span className="feedback-bulb" aria-hidden="true">
                <Art art="💡" />
              </span>
            )}
            <div className="feedback-titles">
              {lastCorrect ? (
                <p className="feedback-title">{shown(said.line.text)}</p>
              ) : question.kind === 'match' || question.kind === 'trace' ? (
                <p className="feedback-title">{shown(said.line.text)}:</p>
              ) : (
                <>
                  <p className="feedback-encourage">{shown(said.line.text)}</p>
                  <p className="feedback-title">الجواب الصحيح:</p>
                  {question.kind === 'pick' && correctOption ? (
                    <span className={`feedback-answer option-${artKind(correctOption.art)}`} aria-label={correctOption.label}>
                      <Art art={correctOption.art} />
                    </span>
                  ) : null}
                </>
              )}
            </div>
          </div>
          <p className="feedback-note" dir="ltr">
            {question.kind === 'missing' && question.word ? (
              <>
                <span className="first-letter">{question.word.charAt(0)}</span>
                {question.word.slice(1)}
              </>
            ) : (
              question.note
            )}
          </p>
          <div className="feedback-actions">
            <SpeakerButton onClick={() => void narrator.play(said.replay)} label="إعادة" />
            <BigButton onClick={next} pulse className="next-button">
              {index + 1 >= round.questions.length ? 'النتيجة' : 'التالي'}
              <ArrowIcon direction="next" />
            </BigButton>
          </div>
        </aside>
      ) : null}

      {confirmExit ? (
        <div className="sheet-backdrop fade-in">
          <div className="sheet pop" role="dialog" aria-modal="true" aria-labelledby="exit-title">
            <p id="exit-title" className="sheet-title">
              نطلع من الجولة؟
            </p>
            <p className="sheet-sub">إجابات هذي الجولة ما راح تنحفظ.</p>
            <div className="sheet-actions">
              <BigButton onClick={() => setConfirmExit(false)}>نكمل</BigButton>
              <BigButton tone="paper" onClick={onExit}>
                خروج
              </BigButton>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}

export function artKind(art: string): string {
  const match = /^([a-z]+):/.exec(art)
  return match ? match[1]! : 'emoji'
}

/** A hand-drawn ring, like the pen circle on a marked test paper («Circle the correct word»). */
function InkRing({ tone }: { tone: 'good' | 'miss' }) {
  return (
    <svg className={`ink-ring ink-${tone}`} viewBox="0 0 120 100" preserveAspectRatio="none" aria-hidden="true">
      <path d="M62 7 C 96 6, 116 24, 114 50 C 112 79, 86 95, 56 94 C 24 93, 5 74, 6 49 C 7 24, 30 8, 66 9 C 78 10, 88 13, 95 18" pathLength="100" />
    </svg>
  )
}

interface MatchRowsProps {
  question: Question
  locked: boolean
  onTop: (pair: Pair) => void
  onPair: (pair: Pair) => void
  onMiss: () => void
  /** The bottom row was tapped before choosing on top. */
  onTopFirst: () => void
  onDone: (mistakes: number, board: HTMLElement | null) => void
}

interface Line {
  id: string
  x1: number
  y1: number
  x2: number
  y2: number
}

interface BottomItem {
  id: string
  art: string
  label: string
  /** The pair it completes; decoys complete none. */
  pair?: string
}

/**
 * The test's «Match» boards (pages 21 and 39): items on top, partners below with one extra,
 * each joined dot to dot with a line. Choose on top first, then its partner below.
 */
function MatchRows({ question, locked, onTop, onPair, onMiss, onTopFirst, onDone }: MatchRowsProps) {
  const bottoms = useMemo(() => {
    const items: BottomItem[] = [
      ...question.pairs.map((pair) => ({ id: pair.id, art: pair.bottom, label: pair.label, pair: pair.id })),
      ...question.decoys.map((decoy) => ({ id: decoy.id, art: decoy.art, label: decoy.label })),
    ]
    // Never leave every partner directly under its pair.
    let mixed = shuffle(items)
    for (let tries = 0; tries < 8 && question.pairs.every((pair, n) => mixed[n]?.pair === pair.id); tries += 1) mixed = shuffle(items)
    return mixed
  }, [question])
  const [selected, setSelected] = useState<string | null>(null)
  const [nudge, setNudge] = useState(false)
  const [matched, setMatched] = useState<string[]>([])
  const [shaking, setShaking] = useState<string[]>([])
  const [mistakes, setMistakes] = useState(0)
  const [lines, setLines] = useState<Line[]>([])
  const boardRef = useRef<HTMLDivElement>(null)
  const refs = useRef(new Map<string, HTMLButtonElement>())

  useLayoutEffect(() => {
    function measure() {
      const board = boardRef.current?.getBoundingClientRect()
      if (!board) return
      setLines(
        matched.flatMap((id) => {
          const a = refs.current.get(`top-${id}`)?.getBoundingClientRect()
          const b = refs.current.get(`bottom-${id}`)?.getBoundingClientRect()
          if (!a || !b) return []
          return [{ id, x1: a.left + a.width / 2 - board.left, y1: a.bottom + 6 - board.top, x2: b.left + b.width / 2 - board.left, y2: b.top - 6 - board.top }]
        }),
      )
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [matched])

  function chooseTop(pair: Pair) {
    if (locked || matched.includes(pair.id)) return
    onTop(pair)
    setSelected(pair.id)
  }

  function answerBottom(item: BottomItem) {
    if (locked || (item.pair && matched.includes(item.pair))) return
    if (!selected) {
      onTopFirst()
      setNudge(true)
      window.setTimeout(() => setNudge(false), 650)
      return
    }
    if (item.pair === selected) {
      const pair = question.pairs.find((entry) => entry.id === selected)!
      const done = [...matched, pair.id]
      setMatched(done)
      setSelected(null)
      onPair(pair)
      if (done.length === question.pairs.length) window.setTimeout(() => onDone(mistakes, boardRef.current), 450)
      return
    }
    setMistakes((count) => count + 1)
    setShaking([`top-${selected}`, `bottom-${item.id}`])
    setSelected(null)
    onMiss()
    window.setTimeout(() => setShaking([]), 450)
  }

  const colour = (id: string) => question.pairs.findIndex((pair) => pair.id === id)

  return (
    <div ref={boardRef} className={`match-rows pairs-${question.pairs.length} bottoms-${bottoms.length}`} dir="ltr">
      <svg className="match-lines" aria-hidden="true">
        {lines.map((line) => (
          <line key={line.id} className={`match-line match-color-${colour(line.id)}`} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} />
        ))}
      </svg>
      <div className={`match-row match-row-top ${nudge ? 'nudge' : ''}`}>
        {question.pairs.map((pair, n) => {
          const key = `top-${pair.id}`
          const state = matched.includes(pair.id) ? `is-matched match-color-${colour(pair.id)}` : selected === pair.id ? 'is-selected' : ''
          return (
            <div key={key} className="match-slot rise" style={order(n, { '--base-delay': '140ms' })}>
              <button
                ref={(node) => {
                  if (node) refs.current.set(key, node)
                  else refs.current.delete(key)
                }}
                type="button"
                className={`match-item match-top match-${artKind(pair.top)} ${state} ${shaking.includes(key) ? 'shake' : ''}`}
                onClick={() => chooseTop(pair)}
                disabled={locked}
                aria-label={pair.label}
                aria-pressed={selected === pair.id}
                data-pair={pair.id}
                data-side="top"
              >
                <span className="option-art" aria-hidden="true">
                  <Art art={pair.top} />
                </span>
                <span className="match-dot dot-bottom" aria-hidden="true" />
              </button>
            </div>
          )
        })}
      </div>
      <div className="match-row match-row-bottom">
        {bottoms.map((item, n) => {
          const key = `bottom-${item.id}`
          const state = item.pair && matched.includes(item.pair) ? `is-matched match-color-${colour(item.pair)}` : !selected ? 'is-waiting' : ''
          return (
            <div key={key} className="match-slot rise" style={order(n + 1, { '--base-delay': '140ms' })}>
              <button
                ref={(node) => {
                  if (node) refs.current.set(item.pair ? `bottom-${item.pair}` : key, node)
                  else refs.current.delete(item.pair ? `bottom-${item.pair}` : key)
                }}
                type="button"
                className={`match-item match-bottom match-${artKind(item.art)} ${state} ${shaking.includes(key) ? 'shake' : ''}`}
                onClick={() => answerBottom(item)}
                disabled={locked}
                aria-label={artKind(item.art) === 'txt' ? item.label : 'صورة'}
                data-pair={item.pair ?? ''}
                data-decoy={item.pair ? undefined : 'true'}
                data-side="bottom"
              >
                <span className="match-dot dot-top" aria-hidden="true" />
                <span className="option-art" aria-hidden="true">
                  <Art art={item.art} />
                </span>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
