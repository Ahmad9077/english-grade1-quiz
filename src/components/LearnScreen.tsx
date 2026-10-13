import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react'
import { Art } from '../art/Art'
import { useNarrator } from '../audio/NarratorContext'
import { sfx } from '../audio/sfx'
import { FACTS, TOPICS, clip, type TopicId } from '../data/catalog'
import { toneStyle } from '../data/tones'
import { arabicNumber } from '../domain/format'
import { ArrowIcon, BackButton, BigButton, SpeakerButton, WordCard, order } from './ui'

interface LearnScreenProps {
  topic: TopicId
  onBack: () => void
  onDone: () => void
  onPractice: () => void
}

const SWIPE_PX = 70

export function LearnScreen({ topic, onBack, onDone, onPractice }: LearnScreenProps) {
  const narrator = useNarrator()
  const facts = FACTS.filter((fact) => fact.topic === topic && fact.learn)
  const meta = TOPICS.find((entry) => entry.id === topic)
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState<'next' | 'prev'>('next')
  const cardRef = useRef<HTMLElement>(null)
  const drag = useRef<{ x: number; dx: number } | null>(null)
  const fact = facts[index]

  useEffect(() => {
    if (fact) {
      void narrator.play([{ clip: clip.fact(fact.id), gap: 250 }])
    } else {
      onDone()
      sfx.fanfare()
      void narrator.play([{ clip: clip.ui('learn-done') }])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- narrate once per card
  }, [index])

  useEffect(() => () => narrator.stop(), [narrator])

  const go = useCallback(
    (step: 1 | -1) => {
      const target = Math.min(Math.max(index + step, 0), facts.length)
      if (target === index) return
      sfx.tap()
      setDirection(step > 0 ? 'next' : 'prev')
      setIndex(target)
    },
    [index, facts.length],
  )

  // Swipe: the card follows the finger (transform only), then moves on or springs back.
  function onPointerDown(event: PointerEvent<HTMLElement>) {
    drag.current = { x: event.clientX, dx: 0 }
    event.currentTarget.setPointerCapture(event.pointerId)
    event.currentTarget.classList.add('is-dragging')
  }

  function onPointerMove(event: PointerEvent<HTMLElement>) {
    if (!drag.current) return
    drag.current.dx = event.clientX - drag.current.x
    event.currentTarget.style.transform = `translateX(${drag.current.dx}px) rotate(${drag.current.dx / 40}deg)`
  }

  function onPointerUp(event: PointerEvent<HTMLElement>) {
    const dx = drag.current?.dx ?? 0
    drag.current = null
    const card = event.currentTarget
    card.classList.remove('is-dragging')
    card.style.transform = ''
    // RTL reading: swiping left moves forward.
    if (dx < -SWIPE_PX) go(1)
    else if (dx > SWIPE_PX) go(-1)
  }

  return (
    <main className="screen learn-screen" style={toneStyle(topic)}>
      <header className="top-bar">
        <BackButton onClick={onBack} label="رجوع إلى الدرس" />
        <div className="dots" role="progressbar" aria-valuemin={1} aria-valuemax={facts.length} aria-valuenow={Math.min(index + 1, facts.length)}>
          {facts.map((entry, n) => (
            <span key={entry.id} className={`dot ${n === index ? 'is-current' : n < index ? 'is-done' : ''}`} />
          ))}
        </div>
        {fact ? <SpeakerButton onClick={() => void narrator.play([{ clip: clip.fact(fact.id) }])} label="إعادة الشرح" /> : <span className="spacer" />}
      </header>

      <div className="learn-stage">
        {fact ? (
          <article
            key={fact.id}
            ref={cardRef}
            className={`learn-card card-in-${direction}`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <span className="learn-count">
              {arabicNumber(index + 1)} / {arabicNumber(facts.length)}
            </span>
            <div className={`learn-art learn-${topic} has-${fact.art.length}-art has-${fact.words?.length ?? 0}-words`} dir="ltr">
              {fact.art.map((item, n) => (
                <span key={`${item}-${n}`} className={`learn-art-item ${item.startsWith('txt:') ? 'learn-glyph' : 'learn-picture'} pop`} style={order(n, { '--base-delay': '180ms' })}>
                  <Art art={item} />
                </span>
              ))}
              {fact.words?.map((word, n) => (
                <span key={word} className="learn-art-item learn-word pop" style={order(n + fact.art.length, { '--base-delay': '180ms' })}>
                  <WordCard word={word} />
                </span>
              ))}
            </div>
            <p className="learn-text" dir="ltr">
              {fact.text}
            </p>
          </article>
        ) : (
          <article key="done" className="learn-card learn-done card-in-next">
            <span className="learn-done-art pop" aria-hidden="true">
              <Art art="🌟" />
            </span>
            <h2 className="learn-done-title">رائع! خلصنا درس {meta?.short}</h2>
            <p className="learn-done-sub">والآن هيا نتدرب</p>
            <BigButton onClick={onPractice} pulse>
              يلا نتدرب
            </BigButton>
          </article>
        )}
      </div>

      {fact ? (
        <nav className="learn-nav" aria-label="التنقل بين البطاقات">
          <button type="button" className="nav-button press" onClick={() => go(-1)} disabled={index === 0} aria-label="البطاقة السابقة">
            <ArrowIcon direction="previous" />
          </button>
          <BigButton onClick={() => go(1)} className="learn-next">
            {index === facts.length - 1 ? 'انتهيت' : 'التالي'}
            <ArrowIcon direction="next" />
          </BigButton>
        </nav>
      ) : null}
    </main>
  )
}
