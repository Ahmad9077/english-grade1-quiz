import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { Art } from '../art/Art'
import { useNarrator } from '../audio/NarratorContext'
import { WORD_ART } from '../data/catalog'
import { arabicNumber } from '../domain/format'

/** Stagger index for the CSS entrance animations (`.rise`, `.pop`). */
export function order(index: number, extra: Record<string, string> = {}): CSSProperties {
  return { '--i': String(index), ...extra } as CSSProperties
}

export function Stars({ count, size = 'md', label }: { count: number; size?: 'sm' | 'md' | 'lg'; label?: string }) {
  return (
    <span className={`stars stars-${size}`} role="img" aria-label={label ?? `${arabicNumber(count)} من ٣ نجوم`}>
      {[1, 2, 3].map((n) => (
        <StarIcon key={n} filled={n <= count} />
      ))}
    </span>
  )
}

export function StarIcon({ filled = true }: { filled?: boolean }) {
  return (
    <svg className={`star-icon ${filled ? 'is-filled' : ''}`} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5L2.6 9.4l6.5-.9z" />
    </svg>
  )
}

export function useSpeaking(): boolean {
  const narrator = useNarrator()
  const [speaking, setSpeaking] = useState(false)
  useEffect(() => narrator.subscribe(setSpeaking), [narrator])
  return speaking
}

export function SpeakerButton({ onClick, label = 'إعادة الصوت' }: { onClick: () => void; label?: string }) {
  const speaking = useSpeaking()
  return (
    <button type="button" className={`speaker-button press ${speaking ? 'is-speaking' : ''}`} onClick={onClick} aria-label={label}>
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path className="speaker-body" d="M5 12h5l7-6v20l-7-6H5z" />
        <path className="speaker-wave wave-1" d="M21 11.5c1.6 1.2 2.5 2.8 2.5 4.5s-.9 3.3-2.5 4.5" />
        <path className="speaker-wave wave-2" d="M24.5 8c2.7 2 4.2 4.9 4.2 8s-1.5 6-4.2 8" />
      </svg>
    </button>
  )
}

export function BackButton({ onClick, label = 'رجوع' }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" className="round-button press" onClick={onClick} aria-label={label}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 5l7 7-7 7" />
      </svg>
    </button>
  )
}

export function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="round-button press" onClick={onClick} aria-label="خروج">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    </button>
  )
}

export function SoundToggle({ muted, onToggle }: { muted: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className="round-button press"
      onClick={onToggle}
      aria-label={muted ? 'تشغيل الصوت' : 'إيقاف الصوت'}
      aria-pressed={muted}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path className="fill" d="M4 9h3l5-4v14l-5-4H4z" />
        {muted ? <path d="M16 9l5 6M21 9l-5 6" /> : <path d="M16 8.5c1.2 1 1.9 2.2 1.9 3.5s-.7 2.5-1.9 3.5" />}
      </svg>
    </button>
  )
}

export function PreviewBadge() {
  if (__QUIZ_BUILD_MODE__ !== 'preview') return null
  return <span className="preview-badge">نسخة تجريبية</span>
}

export function BigButton({
  children,
  onClick,
  tone = 'leaf',
  pulse = false,
  className = '',
  style,
}: {
  children: ReactNode
  onClick: () => void
  tone?: 'leaf' | 'sun' | 'paper'
  pulse?: boolean
  className?: string
  style?: CSSProperties
}) {
  return (
    <button
      type="button"
      className={`big-button big-button-${tone} press ${pulse ? 'is-pulsing' : ''} ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </button>
  )
}

export function ArrowIcon({ direction }: { direction: 'next' | 'previous' }) {
  // RTL: "next" points left.
  return (
    <svg className="arrow-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d={direction === 'next' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} />
    </svg>
  )
}

/** A book word: its picture with the word under it, first letter in colour (as in the book). */
export function WordCard({ word, showWord = true }: { word: string; showWord?: boolean }) {
  return (
    <span className="word-card">
      <span className="word-card-art">
        <Art art={WORD_ART[word] ?? '❓'} />
      </span>
      {showWord ? (
        <span className="word-label" dir="ltr">
          <span className="first-letter">{word.charAt(0)}</span>
          {word.slice(1)}
        </span>
      ) : null}
    </span>
  )
}
