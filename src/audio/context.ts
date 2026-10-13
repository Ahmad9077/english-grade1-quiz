// One shared Web Audio context for narration and sound effects.
let context: AudioContext | null = null

type AudioSessionNavigator = Navigator & { audioSession?: { type: string } }

export function audioContext(): AudioContext | null {
  if (context) return context
  try {
    const AudioCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtor) return null
    // iPhone/iPad: play even when the ring switch is on silent, like a video would.
    const session = (navigator as AudioSessionNavigator).audioSession
    if (session) session.type = 'playback'
    context = new AudioCtor({ latencyHint: 'interactive' })
  } catch {
    context = null
  }
  return context
}

/** Browsers start audio only after a tap; call from every tap so a suspended context wakes up. */
export function wakeAudio(): void {
  const ctx = audioContext()
  if (ctx && ctx.state !== 'running') void ctx.resume().catch(() => undefined)
}
