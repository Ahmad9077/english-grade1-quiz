// Small synthesized sounds, so feedback needs no extra files.
import { audioContext } from './context'

type Tone = { freq: number; at: number; length: number; type?: OscillatorType; gain?: number }

let enabled = true

export function setSfxEnabled(value: boolean): void {
  enabled = value
}

function play(tones: Tone[]): void {
  const context = audioContext()
  if (!enabled || !context || context.state !== 'running') return
  const now = context.currentTime
  for (const tone of tones) {
    const osc = context.createOscillator()
    const gain = context.createGain()
    osc.type = tone.type ?? 'sine'
    osc.frequency.value = tone.freq
    const start = now + tone.at
    const peak = tone.gain ?? 0.18
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(peak, start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + tone.length)
    osc.connect(gain).connect(context.destination)
    osc.start(start)
    osc.stop(start + tone.length + 0.05)
  }
}

export const sfx = {
  tap: () => play([{ freq: 660, at: 0, length: 0.08, type: 'triangle', gain: 0.08 }]),
  correct: () =>
    play([
      { freq: 784, at: 0, length: 0.18 },
      { freq: 988, at: 0.09, length: 0.2 },
      { freq: 1319, at: 0.18, length: 0.38, gain: 0.16 },
    ]),
  wrong: () =>
    play([
      { freq: 330, at: 0, length: 0.18, type: 'triangle', gain: 0.14 },
      { freq: 262, at: 0.14, length: 0.3, type: 'triangle', gain: 0.12 },
    ]),
  star: () =>
    play([
      { freq: 1047, at: 0, length: 0.14, gain: 0.12 },
      { freq: 1568, at: 0.07, length: 0.22, gain: 0.1 },
    ]),
  fanfare: () =>
    play([
      { freq: 523, at: 0, length: 0.16 },
      { freq: 659, at: 0.14, length: 0.16 },
      { freq: 784, at: 0.28, length: 0.16 },
      { freq: 1047, at: 0.42, length: 0.5, gain: 0.16 },
    ]),
}
