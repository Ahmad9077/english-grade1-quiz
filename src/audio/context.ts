// One shared Web Audio context for narration and sound effects.
//
// Safari on iPhone and iPad takes the sound away when the child leaves the page (another app,
// the home screen, a locked screen, a call). Coming back, the old context often stays silent,
// even when it says it is running, and it can be woken only inside a tap. So leaving the page
// marks the context as stale, and the first tap after coming back starts a fresh one. Decoded
// clips are kept: an AudioBuffer plays in any context.
let context: AudioContext | null = null
let stale = false
const resetListeners = new Set<() => void>()

type AudioSessionNavigator = Navigator & { audioSession?: { type: string } }
type AudioCtor = typeof AudioContext

// Events that count as a tap for starting sound. iPhone and iPad do not accept pointerdown.
const TAP_EVENTS = ['pointerup', 'touchend', 'click', 'keydown'] as const

function create(): AudioContext | null {
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioCtor }).webkitAudioContext
    if (!Ctor) return null
    // iPhone/iPad: play even when the ring switch is on silent, like a video would.
    const session = (navigator as AudioSessionNavigator).audioSession
    if (session) session.type = 'playback'
    const ctx = new Ctor({ latencyHint: 'interactive' })
    ctx.addEventListener('statechange', () => {
      // A call, Siri or another app took the sound: start afresh at the next tap.
      if (ctx === context && (ctx.state as string) === 'interrupted') stale = true
    })
    return ctx
  } catch {
    return null
  }
}

export function audioContext(): AudioContext | null {
  if (!context) context = create()
  return context
}

/** Runs when the sound stops for a fresh start, so a player can drop what it was saying. */
export function onAudioReset(listener: () => void): () => void {
  resetListeners.add(listener)
  return () => resetListeners.delete(listener)
}

/** A silent sample, played inside a tap, is what lets iPhone and iPad start a context. */
function unlock(ctx: AudioContext): void {
  try {
    const source = ctx.createBufferSource()
    source.buffer = ctx.createBuffer(1, 1, ctx.sampleRate)
    source.connect(ctx.destination)
    source.start()
  } catch {
    // Nothing to unlock.
  }
}

/** Browsers start audio only after a tap; call it from every tap so the sound comes back. */
export function wakeAudio(): void {
  if (stale && context) {
    const old = context
    context = null
    stale = false
    resetListeners.forEach((listener) => listener())
    void old.close().catch(() => undefined)
  }
  stale = false
  const ctx = audioContext()
  if (!ctx || ctx.state === 'running') return
  void ctx.resume().catch(() => undefined)
  unlock(ctx)
}

/**
 * Keeps the sound working for the whole visit: leaving the page stops what is being said and
 * marks the sound stale; the next tap anywhere brings it back. Returns a function that stops watching.
 */
export function watchAudio(): () => void {
  const left = () => {
    if (document.visibilityState !== 'hidden') return
    stale = true
    resetListeners.forEach((listener) => listener())
  }
  const away = () => {
    stale = true
    resetListeners.forEach((listener) => listener())
  }
  document.addEventListener('visibilitychange', left)
  window.addEventListener('pagehide', away)
  for (const name of TAP_EVENTS) window.addEventListener(name, wakeAudio, { capture: true, passive: true })
  return () => {
    document.removeEventListener('visibilitychange', left)
    window.removeEventListener('pagehide', away)
    for (const name of TAP_EVENTS) window.removeEventListener(name, wakeAudio, { capture: true })
  }
}
