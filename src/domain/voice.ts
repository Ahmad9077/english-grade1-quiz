import {
  ASK_LINES,
  CHEERS,
  RETRIES,
  STREAKS,
  arLines,
  clip,
  ownCheers,
  shown,
  type ArGroup,
  type Line,
  type Question,
  type Random,
} from '../data/catalog'
import { deck } from './variety'

/**
 * The question with its style's next line: said aloud and shown under the instruction.
 * `avoid` holds the lines of this style already said in the round.
 */
export function voiceQuestion(question: Question, random: Random = Math.random, avoid: readonly number[] = []): Question {
  const texts = ASK_LINES[question.lines]
  const n = deck(`ask:${question.lines}`, texts.map((_, k) => k)).next(random, avoid)
  return { ...question, ask: [...question.ask.slice(0, -1), clip.line(question.lines, n)], help: shown(texts[n]!) }
}

/** One of Maryam's lines for a moment, never the one said last time. */
export function sayLine(group: ArGroup, random: Random = Math.random): Line {
  return deck(`ar:${group}`, arLines(group)).next(random)
}

/**
 * The cheer for a right answer: a streak cheer on the third and fifth right answer running,
 * otherwise now and then one made for this kind of question, otherwise any cheer.
 */
export function cheerFor(question: Question, streak: number, random: Random = Math.random): Line {
  const streakLines = STREAKS[streak]
  if (streakLines) return deck(`streak:${streak}`, streakLines).next(random)
  const own = ownCheers(question)
  if (own.length > 0 && random() < 0.4) return deck(`cheer:${own.map((line) => line.clip).join()}`, own).next(random)
  return deck('cheer', CHEERS).next(random)
}

/** The kind word after a wrong choice. */
export function kindWord(random: Random = Math.random): Line {
  return deck('retry', RETRIES).next(random)
}

/** How to find the answer, as clips: Maryam's connecting lines take their turn too. */
export function explainClips(question: Question, random: Random = Math.random): string[] {
  return question.explain.map((item) => (typeof item === 'string' ? item : sayLine(item.line, random).clip))
}

/** The line at the end of a round. */
export function doneLine(great: boolean, random: Random = Math.random): Line {
  const group = great ? 'done-great' : 'done-good'
  return deck(group, arLines(group)).next(random)
}
