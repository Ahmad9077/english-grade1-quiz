import type { ReactElement } from 'react'

// Drawings for the two book words emoji cannot show well, in a sticker style:
// round joins, a dark ink outline and flat fills, modelled on the book's pictures.
const INK = '#2b2d55'

/** The book's mug: yellow, with strawberries and a handle. */
function Mug() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <ellipse cx="46" cy="90" rx="30" ry="5" fill="#000" opacity="0.08" />
      <path d="M70 38 C88 38 90 70 70 70" fill="none" stroke={INK} strokeWidth="11" strokeLinecap="round" />
      <path d="M70 38 C88 38 90 70 70 70" fill="none" stroke="#f26b5b" strokeWidth="6" strokeLinecap="round" />
      <path d="M18 22 H74 V80 Q74 88 66 88 H26 Q18 88 18 80 Z" fill="#ffd84d" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <ellipse cx="46" cy="22" rx="28" ry="6" fill="#fff3c2" stroke={INK} strokeWidth="3" />
      {[
        [32, 42],
        [56, 40],
        [44, 62],
        [26, 70],
        [62, 70],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
          <path d="M0 -6 Q7 -6 6 2 Q4 9 0 10 Q-4 9 -6 2 Q-7 -6 0 -6 Z" fill="#e8413a" stroke={INK} strokeWidth="1.6" />
          <path d="M-4 -6 L0 -10 L4 -6" fill="#5bb04a" stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
          <circle cx="-2" cy="0" r="0.9" fill="#ffe680" />
          <circle cx="2" cy="3" r="0.9" fill="#ffe680" />
        </g>
      ))}
    </svg>
  )
}

/** The book's mat: a round rug with soft rings. */
function Mat() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <ellipse cx="50" cy="60" rx="46" ry="24" fill="#000" opacity="0.08" />
      <ellipse cx="50" cy="54" rx="46" ry="26" fill="#f1a38f" stroke={INK} strokeWidth="3" />
      <ellipse cx="50" cy="54" rx="36" ry="19" fill="#9fd8cf" stroke={INK} strokeWidth="2" />
      <ellipse cx="50" cy="54" rx="25" ry="12" fill="#fde6c4" stroke={INK} strokeWidth="2" />
      <ellipse cx="50" cy="54" rx="13" ry="6" fill="#e98b76" stroke={INK} strokeWidth="2" />
      {Array.from({ length: 18 }, (_, n) => {
        const angle = (n / 18) * Math.PI * 2
        const x = 50 + Math.cos(angle) * 46
        const y = 54 + Math.sin(angle) * 26
        return <line key={n} x1={x} y1={y} x2={50 + Math.cos(angle) * 50} y2={54 + Math.sin(angle) * 29} stroke={INK} strokeWidth="2" strokeLinecap="round" />
      })}
    </svg>
  )
}

export const DRAWINGS: Record<string, () => ReactElement> = {
  mug: Mug,
  mat: Mat,
}
