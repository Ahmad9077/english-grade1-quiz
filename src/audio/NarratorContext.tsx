import { createContext, useContext } from 'react'
import type { Narrator } from './player'

export const NarratorContext = createContext<Narrator | null>(null)

export function useNarrator(): Narrator {
  const narrator = useContext(NarratorContext)
  if (!narrator) throw new Error('NarratorContext is missing.')
  return narrator
}
