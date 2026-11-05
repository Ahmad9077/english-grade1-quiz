import type { ReactElement } from 'react'

// Drawings for what the book does not picture, in its sticker style: round joins, a dark ink
// outline and bright flat fills.
const INK = '#2b2d55'

/** The card's «train» (not pictured in pages 11–40): a toy engine and one carriage. */
function Train() {
  return (
    <svg viewBox="0 0 120 84" aria-hidden="true">
      <ellipse cx="60" cy="78" rx="54" ry="4" fill="#000" opacity="0.08" />
      <circle cx="30" cy="9" r="5" fill="#e6ecf5" stroke={INK} strokeWidth="2" />
      <circle cx="39" cy="5" r="4" fill="#e6ecf5" stroke={INK} strokeWidth="2" />
      <rect x="2" y="44" width="38" height="16" rx="3" fill={INK} />
      <path d="M44 32 H58 V20 H86 V64 H44 Z" fill="#e8413a" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <rect x="62" y="25" width="19" height="15" rx="3" fill="#bfe6ff" stroke={INK} strokeWidth="2.4" />
      <path d="M26 30 H34 V20 H26 Z" fill="#3a7bd5" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M8 36 H50 V64 H8 Q4 64 4 60 V40 Q4 36 8 36 Z" fill="#3a7bd5" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <rect x="22" y="15" width="16" height="6" rx="2" fill="#f5b51b" stroke={INK} strokeWidth="2.4" />
      <rect x="90" y="34" width="28" height="30" rx="4" fill="#f5b51b" stroke={INK} strokeWidth="3" />
      <rect x="95" y="39" width="18" height="11" rx="2.5" fill="#bfe6ff" stroke={INK} strokeWidth="2.2" />
      <path d="M86 56 H90" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      {[18, 40, 70, 104].map((x) => (
        <g key={x}>
          <circle cx={x} cy="66" r="9" fill="#fffaf0" stroke={INK} strokeWidth="3" />
          <circle cx={x} cy="66" r="3" fill={INK} />
        </g>
      ))}
      <circle cx="10" cy="48" r="3.2" fill="#ffe680" stroke={INK} strokeWidth="1.6" />
    </svg>
  )
}

/** A paint splash for the colour words (the book shows a paint pot for «orange»). */
function splat(fill: string, shine: string) {
  return function Splat() {
    return (
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <path
          d="M50 8 C60 8 62 22 70 20 C80 17 88 26 84 36 C81 44 94 48 92 58 C90 68 78 66 76 74 C74 84 64 92 54 86 C46 82 40 94 30 88 C20 82 26 72 18 68 C8 63 6 52 14 46 C22 40 12 30 20 22 C28 14 36 24 42 16 C44 12 46 8 50 8 Z"
          fill={fill}
          stroke={INK}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <circle cx="88" cy="18" r="5" fill={fill} stroke={INK} strokeWidth="2.4" />
        <circle cx="12" cy="84" r="4" fill={fill} stroke={INK} strokeWidth="2.2" />
        <path d="M34 34 C38 28 46 26 52 28" fill="none" stroke={shine} strokeWidth="5" strokeLinecap="round" />
      </svg>
    )
  }
}

export const DRAWINGS: Record<string, () => ReactElement> = {
  train: Train,
  'splat-blue': splat('#2f7de1', '#9cc8ff'),
  'splat-brown': splat('#8a5a2b', '#c99a6b'),
  'splat-black': splat('#1f2230', '#6a6f86'),
}
