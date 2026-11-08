import { audioContext, onAudioReset } from './context'

const AUDIO_REVISION = 'maryam-alice-v5-2026-11-08'
// A clip that fails to download (a weak connection) is tried again before it is skipped.
const LOAD_ATTEMPTS = 3
const OPTION_GAP_MS = 320
const LOAD_CONCURRENCY = 6

export interface Cue {
  clip: string
  onStart?: () => void
  /** Silence before this cue, in milliseconds. */
  gap?: number
}

type Listener = (speaking: boolean) => void

/**
 * Narration through Web Audio. Clips are fetched and decoded ahead of time, so
 * every question starts the moment it appears and cues follow each other exactly.
 */
export class Narrator {
  private readonly buffers = new Map<string, Promise<AudioBuffer | null>>()
  private readonly listeners = new Set<Listener>()
  private readonly queue: string[] = []
  private active = 0
  private source: AudioBufferSourceNode | null = null
  /** Ends the clip being played now, so a stopped play() never waits for a clip that cannot end. */
  private finish: (() => void) | null = null
  private token = 0
  private muted = false

  constructor(private readonly baseUrl: string) {
    // Leaving the page, or a fresh start of the sound, ends what was being said.
    onAudioReset(() => this.stop())
  }

  url(clip: string): string {
    return `${this.baseUrl}audio/${clip}.mp3?v=${AUDIO_REVISION}`
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  setMuted(muted: boolean): void {
    this.muted = muted
    if (muted) this.stop()
  }

  /** Start downloading and decoding clips in the background. */
  preload(clips: string[]): void {
    for (const clip of clips) {
      if (this.buffers.has(clip) || this.queue.includes(clip)) continue
      this.queue.push(clip)
    }
    this.pump()
  }

  stop(): void {
    this.token += 1
    this.halt()
    this.emit(false)
  }

  /** Plays cues in order; a newer call or stop() cancels the rest. Resolves true when all played. */
  async play(cues: Cue[]): Promise<boolean> {
    this.token += 1
    const token = this.token
    this.halt()
    if (this.muted) {
      cues.forEach((cue) => cue.onStart?.())
      return true
    }
    this.preload(cues.map((cue) => cue.clip))
    this.emit(true)
    for (const [index, cue] of cues.entries()) {
      const buffer = await this.load(cue.clip)
      if (token !== this.token) return false
      const gap = cue.gap ?? (index > 0 ? OPTION_GAP_MS : 0)
      if (gap > 0) {
        await wait(gap)
        if (token !== this.token) return false
      }
      cue.onStart?.()
      if (buffer) await this.playBuffer(buffer)
      if (token !== this.token) return false
    }
    this.emit(false)
    return true
  }

  private load(clip: string): Promise<AudioBuffer | null> {
    const known = this.buffers.get(clip)
    if (known) return known
    const queued = this.queue.indexOf(clip)
    if (queued >= 0) this.queue.splice(queued, 1)
    const promise = this.fetchAndDecode(clip)
    this.buffers.set(clip, promise)
    return promise
  }

  private pump(): void {
    while (this.active < LOAD_CONCURRENCY && this.queue.length > 0) {
      const clip = this.queue.shift()!
      if (this.buffers.has(clip)) continue
      this.active += 1
      const promise = this.fetchAndDecode(clip)
      this.buffers.set(clip, promise)
      void promise.finally(() => {
        this.active -= 1
        this.pump()
      })
    }
  }

  private async fetchAndDecode(clip: string): Promise<AudioBuffer | null> {
    for (let attempt = 1; attempt <= LOAD_ATTEMPTS; attempt += 1) {
      try {
        const response = await fetch(this.url(clip))
        if (!response.ok) throw new Error(`Missing clip ${clip}`)
        const data = await response.arrayBuffer()
        // The context of now: the sound may have started afresh while the clip downloaded.
        const ctx = audioContext()
        if (!ctx) return null
        return await decode(ctx, data)
      } catch {
        if (attempt < LOAD_ATTEMPTS) await wait(300 * attempt)
      }
    }
    this.buffers.delete(clip)
    return null
  }

  private playBuffer(buffer: AudioBuffer): Promise<void> {
    const ctx = audioContext()
    if (!ctx) return Promise.resolve()
    if (ctx.state !== 'running') void ctx.resume().catch(() => undefined)
    return new Promise((resolve) => {
      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.connect(ctx.destination)
      const done = () => {
        if (this.source === source) {
          this.source = null
          this.finish = null
        }
        resolve()
      }
      source.onended = done
      this.source = source
      this.finish = done
      source.start()
    })
  }

  private halt(): void {
    const source = this.source
    const finish = this.finish
    this.source = null
    this.finish = null
    finish?.()
    if (source) {
      try {
        source.stop()
      } catch {
        // Already stopped.
      }
    }
  }

  private emit(speaking: boolean): void {
    this.listeners.forEach((listener) => listener(speaking))
  }
}

/**
 * Decodes a clip, giving up if its context is closed meanwhile (a fresh start of the sound):
 * browsers can leave that decode waiting for ever, and the clip would never play.
 */
function decode(ctx: AudioContext, data: ArrayBuffer): Promise<AudioBuffer> {
  return new Promise((resolve, reject) => {
    const closed = () => {
      if (ctx.state === 'closed') reject(new Error('The sound started afresh.'))
    }
    ctx.addEventListener('statechange', closed)
    ctx
      .decodeAudioData(data)
      .then(resolve, reject)
      .finally(() => ctx.removeEventListener('statechange', closed))
  })
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}
