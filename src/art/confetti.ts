import confetti from 'canvas-confetti'

// Confetti draws in a worker on its own canvas, so the page's animations keep their frame rate.
let instance: confetti.CreateTypes | null = null

function fire(): confetti.CreateTypes | null {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return null
  if (!instance) {
    const canvas = document.createElement('canvas')
    canvas.className = 'confetti-canvas'
    canvas.setAttribute('aria-hidden', 'true')
    document.body.append(canvas)
    instance = confetti.create(canvas, { resize: true, useWorker: true })
  }
  return instance
}

const PALETTE = ['#ffc93c', '#ff8fb1', '#7cc3f5', '#62c16a']

/** A short burst from the tile the child tapped. */
export function celebrate(tile: HTMLElement | undefined, tone: string): void {
  const shoot = fire()
  if (!shoot) return
  const rect = tile?.getBoundingClientRect()
  const origin = rect
    ? { x: (rect.left + rect.width / 2) / window.innerWidth, y: (rect.top + rect.height / 2) / window.innerHeight }
    : { x: 0.5, y: 0.6 }
  void shoot({ particleCount: 45, spread: 70, startVelocity: 30, gravity: 1, ticks: 120, scalar: 1.1, origin, shapes: ['star', 'circle'], colors: [tone, ...PALETTE] })
}

/** The bigger celebration on the results screen. */
export function burst(tone: string): void {
  const shoot = fire()
  if (!shoot) return
  const colors = [tone, ...PALETTE]
  const side = (x: number, angle: number) =>
    void shoot({ particleCount: 60, angle, spread: 65, startVelocity: 45, ticks: 160, origin: { x, y: 0.75 }, shapes: ['star', 'circle'], colors, scalar: 1.15 })
  side(0.1, 60)
  side(0.9, 120)
  window.setTimeout(() => side(0.5, 90), 280)
}
