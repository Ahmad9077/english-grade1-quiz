import { useEffect } from 'react'
import { Art } from '../art/Art'
import { useNarrator } from '../audio/NarratorContext'
import { FACTS, TOPICS, clip, type TopicId } from '../data/catalog'
import { toneStyle } from '../data/tones'
import { arabicNumber } from '../domain/format'
import type { SavedProgress } from '../domain/progress'
import { PRACTICE_SIZE } from '../domain/round'
import { BackButton, SpeakerButton, Stars, order } from './ui'

interface TopicScreenProps {
  topic: TopicId
  progress: SavedProgress
  onBack: () => void
  onLearn: () => void
  onPractice: () => void
}

export function TopicScreen({ topic, progress, onBack, onLearn, onPractice }: TopicScreenProps) {
  const narrator = useNarrator()
  const meta = TOPICS.find((entry) => entry.id === topic)
  const learnFacts = FACTS.filter((fact) => fact.topic === topic && fact.learn)
  const learned = progress.learned.includes(topic)

  useEffect(() => {
    void narrator.play([{ clip: clip.topic(topic) }])
    narrator.preload(FACTS.filter((fact) => fact.topic === topic).map((fact) => clip.fact(fact.id)))
    return () => narrator.stop()
  }, [narrator, topic])

  if (!meta) return null

  return (
    <main className="screen topic-screen" style={toneStyle(topic)}>
      <header className="top-bar">
        <BackButton onClick={onBack} label="الدروس" />
        <span className="top-bar-title">{meta.short}</span>
        <SpeakerButton onClick={() => void narrator.play([{ clip: clip.topic(topic) }])} />
      </header>

      <section className="topic-hero rise" style={order(0)}>
        <div className="topic-hero-art" aria-hidden="true">
          {meta.art.map((art, index) => (
            <span key={art} className={`hero-art hero-art-${index} pop`} style={order(index, { '--base-delay': '120ms' })}>
              <span className="bob" style={order(index)}>
                <Art art={art} />
              </span>
            </span>
          ))}
        </div>
        <h1 className="topic-title">{meta.title}</h1>
      </section>

      <section className="mode-cards">
        <button type="button" className="mode-card mode-learn press rise" style={order(2)} onClick={onLearn}>
          <span className="mode-icon" aria-hidden="true">
            <Art art="📖" />
          </span>
          <span className="mode-text">
            <span className="mode-title" dir="ltr">Learn</span>
            <span className="mode-sub">{arabicNumber(learnFacts.length)} بطاقات للتعلم</span>
          </span>
          {learned ? <span className="learned-chip">✓</span> : null}
        </button>

        <button
          type="button"
          className={`mode-card mode-practice press rise ${learned ? 'is-suggested' : ''}`}
          style={order(3)}
          onClick={onPractice}
        >
          <span className="mode-icon" aria-hidden="true">
            <Art art="🎯" />
          </span>
          <span className="mode-text">
            <span className="mode-title" dir="ltr">Practice</span>
            <span className="mode-sub">{arabicNumber(PRACTICE_SIZE)} أسئلة</span>
          </span>
          <Stars count={progress.stars[topic] ?? 0} size="sm" />
        </button>
      </section>
    </main>
  )
}
