import { DRAWINGS } from './drawings'

interface ArtProps {
  art: string
  className?: string
}

const PICS = `${import.meta.env.BASE_URL}pics/`

/**
 * Renders a picture at the size of its container: `pic:` a picture from the book, an `svg:`
 * drawing, `txt:` letters or numbers in the reading font, `word:` a word box as printed in the
 * test, `count:<pic>:<n>` things to count, or an emoji.
 */
export function Art({ art, className = '' }: ArtProps) {
  if (art.startsWith('pic:')) {
    return (
      <span className={`art art-pic ${className}`} aria-hidden="true">
        <img src={`${PICS}${art.slice(4)}.webp`} alt="" draggable={false} decoding="async" />
      </span>
    )
  }

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

  if (art.startsWith('word:')) {
    return (
      <span className={`art art-word ${className}`} aria-hidden="true" dir="ltr">
        {art.slice(5)}
      </span>
    )
  }

  if (art.startsWith('count:')) {
    const [, pic, amount] = art.split(':')
    const n = Number(amount)
    return (
      <span className={`art art-count count-of-${n} ${className}`} aria-hidden="true">
        {Array.from({ length: n }, (_, k) => (
          <span key={k} className="count-item">
            <img src={`${PICS}${pic}.webp`} alt="" draggable={false} decoding="async" />
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
