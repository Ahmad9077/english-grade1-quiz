import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent, type RefObject } from 'react'

// The book's four writing lines (Student's Book, «Trace and copy» and the Progress Tests):
// capitals and tall letters stand between lines 1 and 3, small letters between 2 and 3, and
// tails hang to line 4. The school font (Edu NSW ACT Foundation) has those proportions.
const FONT = '"Edu NSW ACT Foundation", "Andika", sans-serif'
const WEIGHT = 600
const CAP_RATIO_FALLBACK = 0.77
const PAD_X = 14

const LINE_PINK = '#e8336a'
const LINE_BLUE = '#7cc4de'
const GUIDE = '#b7b2c6'
const PEN = '#2e5bd8'
const INK = '#2b2d55'

/** One scoring cell is this many CSS pixels square. */
const CELL = 3
/** Each letter must be this much covered by the child's writing. */
const COVER_NEED = 0.72
/** At most this share of the writing may wander away from the letters. */
const STRAY_LIMIT = 0.3
/** Checks that find the writing off the letters before the answer counts as missed. */
const TRIES = 2

interface Placed {
  char: string
  x: number
  advance: number
}

interface Layout {
  width: number
  height: number
  /** y of lines 1–4 (line 3 is the baseline). */
  lines: [number, number, number, number]
  size: number
  stroke: number
  placed: Placed[]
}

function fontAt(size: number): string {
  return `${WEIGHT} ${size}px ${FONT}`
}

/** Lines and letter positions for `text` in a strip of this size, centred. */
export function layoutText(ctx: CanvasRenderingContext2D, text: string, width: number, height: number): Layout {
  ctx.font = fontAt(100)
  const capRatio = ctx.measureText('H').actualBoundingBoxAscent / 100 || CAP_RATIO_FALLBACK
  // Line gap g: the strip holds 3 gaps plus room above and below.
  let gap = height / 3.7
  const measure = (size: number) => {
    ctx.font = fontAt(size)
    // Wider spaces, as between the items of the book's copy box.
    return [...text].map((char) => ({ char, advance: char === ' ' ? size * 0.7 : ctx.measureText(char).width + size * 0.02 }))
  }
  let size = (2 * gap) / capRatio
  let chars = measure(size)
  let total = chars.reduce((sum, entry) => sum + entry.advance, 0)
  if (total > width - 2 * PAD_X) {
    const factor = (width - 2 * PAD_X) / total
    gap *= factor
    size *= factor
    chars = measure(size)
    total = chars.reduce((sum, entry) => sum + entry.advance, 0)
  }
  const top = (height - 3 * gap) / 2
  let x = (width - total) / 2
  const placed = chars.map((entry) => {
    const item = { ...entry, x }
    x += entry.advance
    return item
  })
  return { width, height, lines: [top, top + gap, top + 2 * gap, top + 3 * gap], size, stroke: size * 0.105, placed }
}

export function drawLines(ctx: CanvasRenderingContext2D, layout: Layout) {
  const [y1, y2, y3, y4] = layout.lines
  ctx.save()
  ctx.lineWidth = 2
  for (const [y, colour, dashed] of [
    [y1, LINE_PINK, false],
    [y2, LINE_BLUE, true],
    [y3, LINE_BLUE, false],
    [y4, LINE_PINK, false],
  ] as const) {
    ctx.strokeStyle = colour
    ctx.setLineDash(dashed ? [9, 7] : [])
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(layout.width, y)
    ctx.stroke()
  }
  ctx.restore()
}

function setupCanvas(canvas: HTMLCanvasElement, width: number, height: number): CanvasRenderingContext2D {
  const ratio = window.devicePixelRatio || 1
  canvas.width = Math.round(width * ratio)
  canvas.height = Math.round(height * ratio)
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  const ctx = canvas.getContext('2d')!
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
  leftToRight(ctx)
  return ctx
}

/** English text runs left to right, whatever the page's direction (a canvas inherits RTL). */
function leftToRight(ctx: CanvasRenderingContext2D) {
  ctx.direction = 'ltr'
  ctx.textAlign = 'left'
}

/** Waits for the school font, so letters are measured and drawn in it. */
function useSchoolFont(): boolean {
  const [ready, setReady] = useState(() => document.fonts?.check?.(fontAt(40)) ?? true)
  useEffect(() => {
    if (ready) return
    let alive = true
    const done = () => alive && setReady(true)
    void document.fonts.load(fontAt(40)).then(done, done)
    const timer = window.setTimeout(done, 2500)
    return () => {
      alive = false
      window.clearTimeout(timer)
    }
  }, [ready])
  return ready
}

/** The strip's size, following its box. */
function useBoxSize(ref: RefObject<HTMLElement | null>): { width: number; height: number } | null {
  const [size, setSize] = useState<{ width: number; height: number } | null>(null)
  useLayoutEffect(() => {
    const node = ref.current
    if (!node) return
    const read = () => {
      const width = Math.round(node.clientWidth)
      const height = Math.round(node.clientHeight)
      setSize((old) => (old && old.width === width && old.height === height ? old : { width, height }))
    }
    read()
    const observer = new ResizeObserver(read)
    observer.observe(node)
    return () => observer.disconnect()
  }, [ref])
  return size
}

interface Target {
  cols: number
  rows: number
  /** Scoring cells of each letter (spaces have none). */
  glyphs: number[][]
  /** Cells close enough to a letter that writing there is not wandering. */
  near: Uint8Array
  /** Sample points per letter, for automated checks. */
  points: [number, number][][]
}

function buildTarget(layout: Layout): Target {
  const cols = Math.ceil(layout.width / CELL)
  const rows = Math.ceil(layout.height / CELL)
  const canvas = document.createElement('canvas')
  canvas.width = cols * CELL
  canvas.height = rows * CELL
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  leftToRight(ctx)
  const all = new Uint8Array(cols * rows)
  const pen = penWidth(layout)
  const step = Math.max(1, Math.floor(pen / 2 / CELL))
  const glyphs: number[][] = []
  const points: [number, number][][] = []
  for (const entry of layout.placed) {
    if (entry.char === ' ') continue
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.font = fontAt(layout.size)
    ctx.fillStyle = '#000'
    ctx.fillText(entry.char, entry.x, layout.lines[2])
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
    const cells: number[] = []
    const samples: [number, number][] = []
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const px = col * CELL + 1
        const py = row * CELL + 1
        if (data[(py * canvas.width + px) * 4 + 3]! > 110) {
          cells.push(row * cols + col)
          all[row * cols + col] = 1
          if (row % step === 0 && col % step === 0) samples.push([col * CELL + 1.5, row * CELL + 1.5])
        }
      }
    }
    glyphs.push(cells)
    points.push(samples)
  }
  // Writing within about one stroke of a letter still counts as on it.
  const reach = Math.ceil((layout.stroke * 1.1) / CELL)
  const near = new Uint8Array(cols * rows)
  for (let index = 0; index < all.length; index += 1) {
    if (!all[index]) continue
    const row = Math.floor(index / cols)
    const col = index % cols
    for (let dy = -reach; dy <= reach; dy += 1) {
      for (let dx = -reach; dx <= reach; dx += 1) {
        const r = row + dy
        const c = col + dx
        if (r >= 0 && r < rows && c >= 0 && c < cols && dx * dx + dy * dy <= reach * reach) near[r * cols + c] = 1
      }
    }
  }
  return { cols, rows, glyphs, near, points }
}

function penWidth(layout: Layout): number {
  return Math.max(11, layout.stroke * 1.65)
}

interface TraceBoardProps {
  text: string
  locked: boolean
  /** A check found the writing off the letters (one more try left). */
  onMiss: () => void
  onDone: (correct: boolean, board: HTMLElement | null) => void
}

/** «Copy the following»: write over the grey text with a finger, on the book's four lines. */
export function TraceBoard({ text, locked, onMiss, onDone }: TraceBoardProps) {
  const fontReady = useSchoolFont()
  const padRef = useRef<HTMLDivElement>(null)
  const guideRef = useRef<HTMLCanvasElement>(null)
  const inkRef = useRef<HTMLCanvasElement>(null)
  const box = useBoxSize(padRef)
  const [layout, setLayout] = useState<Layout | null>(null)
  const target = useRef<Target | null>(null)
  const ink = useRef<Uint8Array>(new Uint8Array(0))
  const samples = useRef({ total: 0, stray: 0 })
  const last = useRef<{ x: number; y: number } | null>(null)
  const [weak, setWeak] = useState<number[]>([])
  const [tries, setTries] = useState(0)
  const [state, setState] = useState<'writing' | 'good' | 'missed'>('writing')
  const [hasInk, setHasInk] = useState(false)
  const [points, setPoints] = useState('')

  // Lay out the letters and draw the lines and the grey guide.
  useLayoutEffect(() => {
    const guide = guideRef.current
    const inkCanvas = inkRef.current
    if (!fontReady || !box || !guide || !inkCanvas || box.width < 40) return
    const ctx = setupCanvas(guide, box.width, box.height)
    const next = layoutText(ctx, text, box.width, box.height)
    setupCanvas(inkCanvas, box.width, box.height)
    target.current = buildTarget(next)
    ink.current = new Uint8Array(target.current.cols * target.current.rows)
    samples.current = { total: 0, stray: 0 }
    setHasInk(false)
    setLayout(next)
    setPoints(JSON.stringify(target.current.points.map((list) => list.map(([x, y]) => [Math.round(x * 10) / 10, Math.round(y * 10) / 10]))))
  }, [fontReady, box, text])

  useEffect(() => {
    const guide = guideRef.current
    if (!guide || !layout) return
    const ctx = guide.getContext('2d')!
    ctx.clearRect(0, 0, layout.width, layout.height)
    drawLines(ctx, layout)
    ctx.font = fontAt(layout.size)
    let glyph = -1
    for (const entry of layout.placed) {
      if (entry.char === ' ') continue
      glyph += 1
      ctx.fillStyle = state === 'missed' ? INK : weak.includes(glyph) ? '#f4a3b6' : GUIDE
      ctx.fillText(entry.char, entry.x, layout.lines[2])
    }
  }, [layout, weak, state])

  const clearInk = useCallback(() => {
    const canvas = inkRef.current
    if (!canvas || !layout) return
    canvas.getContext('2d')!.clearRect(0, 0, layout.width, layout.height)
    ink.current.fill(0)
    samples.current = { total: 0, stray: 0 }
    setHasInk(false)
  }, [layout])

  function mark(x: number, y: number) {
    const map = target.current
    if (!map || !layout) return
    const radius = penWidth(layout) / 2
    const reach = Math.ceil(radius / CELL)
    const col = Math.floor(x / CELL)
    const row = Math.floor(y / CELL)
    for (let dy = -reach; dy <= reach; dy += 1) {
      for (let dx = -reach; dx <= reach; dx += 1) {
        const r = row + dy
        const c = col + dx
        if (r >= 0 && r < map.rows && c >= 0 && c < map.cols && (dx * CELL) ** 2 + (dy * CELL) ** 2 <= radius * radius) ink.current[r * map.cols + c] = 1
      }
    }
    samples.current.total += 1
    if (col >= 0 && col < map.cols && row >= 0 && row < map.rows && !map.near[row * map.cols + col]) samples.current.stray += 1
  }

  function strokeTo(x: number, y: number) {
    const canvas = inkRef.current
    if (!canvas || !layout) return
    const ctx = canvas.getContext('2d')!
    const from = last.current ?? { x, y }
    ctx.strokeStyle = PEN
    ctx.lineWidth = penWidth(layout)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(x, y)
    ctx.stroke()
    const steps = Math.max(1, Math.ceil(Math.hypot(x - from.x, y - from.y) / CELL))
    for (let k = 1; k <= steps; k += 1) mark(from.x + ((x - from.x) * k) / steps, from.y + ((y - from.y) * k) / steps)
    last.current = { x, y }
  }

  function score(): { pass: boolean; weak: number[] } {
    const map = target.current
    if (!map || samples.current.total === 0) return { pass: false, weak: map ? map.glyphs.map((_, n) => n) : [] }
    const lacking = map.glyphs
      .map((cells, n) => ({ n, cover: cells.length === 0 ? 1 : cells.filter((cell) => ink.current[cell]).length / cells.length }))
      .filter((entry) => entry.cover < COVER_NEED)
      .map((entry) => entry.n)
    const stray = samples.current.stray / samples.current.total
    return { pass: lacking.length === 0 && stray <= STRAY_LIMIT, weak: lacking }
  }

  function finish(correct: boolean) {
    setState(correct ? 'good' : 'missed')
    setWeak([])
    window.setTimeout(() => onDone(correct, padRef.current), correct ? 250 : 500)
  }

  function point(event: PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  function down(event: PointerEvent<HTMLCanvasElement>) {
    if (locked || state !== 'writing' || !layout) return
    event.preventDefault()
    event.currentTarget.setPointerCapture?.(event.pointerId)
    const { x, y } = point(event)
    last.current = null
    strokeTo(x, y)
    setHasInk(true)
  }

  function move(event: PointerEvent<HTMLCanvasElement>) {
    if (!last.current || locked || state !== 'writing') return
    const events = event.nativeEvent.getCoalescedEvents?.() ?? [event.nativeEvent]
    const rect = event.currentTarget.getBoundingClientRect()
    for (const entry of events.length > 0 ? events : [event.nativeEvent]) strokeTo(entry.clientX - rect.left, entry.clientY - rect.top)
  }

  function up() {
    if (!last.current) return
    last.current = null
    // Finished as soon as every letter is written over.
    if (score().pass) finish(true)
  }

  function check() {
    if (locked || state !== 'writing') return
    const result = score()
    if (result.pass) {
      finish(true)
      return
    }
    const used = tries + 1
    setTries(used)
    if (used >= TRIES) {
      finish(false)
      return
    }
    setWeak(result.weak)
    onMiss()
    window.setTimeout(() => {
      clearInk()
      setWeak([])
    }, 1100)
  }

  return (
    <div className={`trace-board is-${state}`}>
      <div ref={padRef} className="trace-pad" dir="ltr" data-trace-ready={layout ? 'true' : 'false'}>
        <canvas ref={guideRef} className="trace-guide" aria-hidden="true" />
        <canvas
          ref={inkRef}
          className="trace-ink"
          role="img"
          aria-label={`اكتب ${text}`}
          data-trace-points={points}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
        />
        {state === 'good' ? (
          <span className="trace-stamp pop" aria-hidden="true">
            ✓
          </span>
        ) : null}
      </div>
      <div className="trace-tools">
        <button type="button" className="tool-button press" onClick={clearInk} disabled={locked || state !== 'writing' || !hasInk}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15.5 4.5l4 4L10 18H6l-2-2 9.5-9.5zM9 19.5h11" />
          </svg>
          نمسح
        </button>
        <button type="button" className="tool-button tool-check press" onClick={check} disabled={locked || state !== 'writing' || !hasInk}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
          خلصت
        </button>
      </div>
    </div>
  )
}

interface WordStripProps {
  word: string
  /** The letter written in the blank, once answered. */
  filled: string | null
  tone: 'good' | 'miss' | null
}

/** «_rain» on the four lines, with a box for the missing first letter. */
export function WordStrip({ word, filled, tone }: WordStripProps) {
  const fontReady = useSchoolFont()
  const ref = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const box = useBoxSize(ref)

  useLayoutEffect(() => {
    const canvas = canvasRef.current
    if (!fontReady || !box || !canvas || box.width < 40) return
    const ctx = setupCanvas(canvas, box.width, box.height)
    // The blank has room for the widest letter; once written, the word closes up.
    const shown = `${filled ?? 'm'}${word.slice(1)}`
    const layout = layoutText(ctx, shown, box.width, box.height)
    drawLines(ctx, layout)
    const [y1, , y3] = layout.lines
    const first = layout.placed[0]!
    ctx.font = fontAt(layout.size)
    ctx.fillStyle = INK
    for (const entry of layout.placed.slice(1)) ctx.fillText(entry.char, entry.x, y3)
    if (filled) {
      ctx.fillStyle = tone === 'miss' ? '#d6312f' : PEN
      ctx.fillText(filled, first.x, y3)
    } else {
      ctx.save()
      ctx.strokeStyle = '#7b5ce0'
      ctx.lineWidth = 3
      ctx.setLineDash([8, 6])
      ctx.strokeRect(first.x + 2, y1 + 2, first.advance - 6, y3 - y1 - 2)
      ctx.restore()
    }
  }, [fontReady, box, word, filled, tone])

  return (
    <div ref={ref} className="word-strip" dir="ltr" role="img" aria-label={filled ? word : `_${word.slice(1)}`}>
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  )
}
