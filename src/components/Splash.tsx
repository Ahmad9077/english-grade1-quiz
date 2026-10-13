import { Art } from '../art/Art'
import { BigButton, PreviewBadge, order } from './ui'

const ORBIT = ['🐜', 'txt:Bb', '📦', 'svg:mug', 'txt:Ff', '🦇', 'txt:5', '🐑']

export function Splash({ onStart }: { onStart: () => void }) {
  return (
    <main className="screen splash">
      <div className="splash-top">
        <PreviewBadge />
      </div>

      <div className="splash-stage">
        <div className="orbit" aria-hidden="true">
          {ORBIT.map((art, index) => {
            const angle = (index / ORBIT.length) * Math.PI * 2
            return (
              <span
                key={art}
                className="orbit-item pop"
                style={order(index, {
                  '--base-delay': '250ms',
                  left: `${50 + Math.cos(angle) * 44}%`,
                  top: `${50 + Math.sin(angle) * 40}%`,
                })}
              >
                <span className="orbit-bob" style={order(index)}>
                  <Art art={art} />
                </span>
              </span>
            )
          })}
        </div>

        <div className="logo logo-in">
          <LetterBlocks />
          <h1 className="logo-word" dir="ltr">English</h1>
        </div>
      </div>

      <p className="splash-tagline rise" style={order(0, { '--base-delay': '450ms' })}>
        نتدرب معا على الإنجليزي للصف الأول
      </p>

      <div className="rise" style={order(0, { '--base-delay': '700ms' })}>
        <BigButton onClick={onStart} pulse className="start-button">
          <span>هيا نبدأ</span>
          <svg className="play-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M16 5L6 12l10 7z" />
          </svg>
        </BigButton>
      </div>
    </main>
  )
}

/** Three toy blocks, A B C: the mark for «English». */
export function LetterBlocks({ className = 'blocks-mark' }: { className?: string }) {
  const blocks = [
    { x: 4, y: 30, letter: 'A', fill: '#e8446b' },
    { x: 34, y: 30, letter: 'B', fill: '#3a7bd5' },
    { x: 19, y: 2, letter: 'C', fill: '#f5b51b' },
  ]
  return (
    <svg className={className} viewBox="0 0 64 60" aria-hidden="true">
      {blocks.map(({ x, y, letter, fill }) => (
        <g key={letter} transform={`translate(${x} ${y})`}>
          <rect x="0" y="0" width="26" height="26" rx="5" fill={fill} stroke="#2b2d55" strokeWidth="2.6" />
          <rect x="3.5" y="3.5" width="19" height="19" rx="3" fill="#fffaf0" />
          <text x="13" y="19.5" textAnchor="middle" fontFamily="Andika, sans-serif" fontWeight="700" fontSize="16" fill={fill}>
            {letter}
          </text>
        </g>
      ))}
    </svg>
  )
}
