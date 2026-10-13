import { DRAWINGS } from './drawings'

interface ArtProps {
  art: string
  className?: string
}

/**
 * Renders a picture at the size of its container: an emoji, an `svg:` drawing,
 * `txt:` letters or numbers in the reading font, or `count:<emoji>:<n>` things to count.
 */
export function Art({ art, className = '' }: ArtProps) {
  if (art.startsWith('svg:')) {
    const Drawing = DRAWINGS[art.slice(4)]
    if (!Drawing) throw new Error(`Missing drawing: ${art}`)
    return (
      <span className={`art art-svg ${className}`} aria-hidden="true">
        <Drawing />
      </span>
    )
  }

  if (art.startsWith('txt:')) {
    const text = art.slice(4)
    return (
      <span className={`art art-text ${className}`} aria-hidden="true" dir="ltr">
        {text.startsWith('_') ? (
          <>
            <span className="blank-slot" />
            {text.slice(1)}
          </>
        ) : (
          text
        )}
      </span>
    )
  }

  if (art.startsWith('count:')) {
    const [, emoji, amount] = art.split(':')
    const n = Number(amount)
    return (
      <span className={`art art-count count-of-${n} ${className}`} aria-hidden="true">
        {Array.from({ length: n }, (_, k) => (
          <span key={k} className="count-item">
            {emoji}
          </span>
        ))}
      </span>
    )
  }

  return (
    <span className={`art art-emoji ${className}`} aria-hidden="true">
      {art}
    </span>
  )
}

export function hasDrawing(art: string): boolean {
  return !art.startsWith('svg:') || art.slice(4) in DRAWINGS
}
