import { useEffect } from 'react'
import { Art } from '../art/Art'
import { burst } from '../art/confetti'
import { useNarrator } from '../audio/NarratorContext'
import { sfx } from '../audio/sfx'
import { QUESTIONS, clip, factById } from '../data/catalog'
import { TONES, toneStyle } from '../data/tones'
import { arabicNumber } from '../domain/format'
import { starsFor } from '../domain/round'
import type { Attempt } from '../hub/bridge'
import type { Round } from './QuizScreen'
import { BigButton, StarIcon, order } from './ui'

interface ResultsProps {
  round: Round
  attempts: Attempt[]
  onAgain: () => void
  onHome: () => void
}

export function ResultsScreen({ round, attempts, onAgain, onHome }: ResultsProps) {
  const narrator = useNarrator()
  const score = attempts.filter((attempt) => attempt.correct).length
  const total = attempts.length
  const stars = starsFor(score, total)
  const missed = attempts
    .filter((attempt) => !attempt.correct)
    .map((attempt) => QUESTIONS.find((question) => question.key === attempt.questionKey))
    .filter((question) => question !== undefined)

  useEffect(() => {
    const timers = [1, 2, 3].filter((n) => n <= stars).map((n) => window.setTimeout(() => sfx.star(), 350 + n * 260))
    timers.push(
      window.setTimeout(() => {
        void narrator.play([{ clip: clip.en(stars === 3 ? 'done-great' : 'done-good') }])
        if (stars >= 2) burst(TONES[round.tone].tone)
      }, 1200),
    )
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
      narrator.stop()
    }
  }, [narrator, round.tone, stars])

  return (
    <main className="screen results-screen" style={toneStyle(round.tone)}>
      <section className="results-card rise" style={order(0)}>
        <h1 className="results-title pop" dir="ltr">{stars === 3 ? 'Amazing!' : stars === 2 ? 'Good job!' : 'Nice try!'}</h1>

        <div className="results-stars" role="img" aria-label={`${arabicNumber(stars)} من ٣ نجوم`}>
          {[1, 2, 3].map((n) => (
            <span key={n} className={`results-star star-${n} spin-in ${n <= stars ? 'is-filled' : ''}`} style={order(n, { '--base-delay': '250ms', '--step': '260ms' })}>
              <StarIcon filled={n <= stars} />
            </span>
          ))}
        </div>

        <p className="results-score rise" style={order(0, { '--base-delay': '1100ms' })}>
          <span className="results-number">{arabicNumber(score)}</span> من {arabicNumber(total)}
          <span className="results-caption">إجابات صحيحة</span>
        </p>

        <div className="results-actions rise" style={order(0, { '--base-delay': '1300ms' })}>
          <BigButton onClick={onAgain} pulse={stars < 3}>
            <span dir="ltr">Try again</span>
          </BigButton>
          <BigButton tone="paper" onClick={onHome}>
            الدروس
          </BigButton>
        </div>
      </section>

      {missed.length > 0 ? (
        <section className="review rise" style={order(0, { '--base-delay': '1500ms' })}>
          <h2 className="review-title">خلينا نتذكر</h2>
          <ul className="review-list">
            {missed.map((question) => {
              const facts = question.facts.map(factById)
              const art = question.subject ?? facts[0]?.art.at(-1) ?? '💡'
              return (
                <li key={question.key} className="review-item" style={toneStyle(question.topic)}>
                  <span className="review-art" aria-hidden="true">
                    <Art art={art} />
                  </span>
                  <span className="review-text">
                    <span className="review-q">{question.prompt}</span>
                    <span className="review-fact" dir="ltr">
                      {facts.map((fact) => fact.text).join(' · ')}
                    </span>
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}
    </main>
  )
}
