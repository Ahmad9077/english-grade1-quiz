import { audioCues } from '../src/data/catalog.ts'

const cues = audioCues()
const total = cues.reduce((sum, cue) => sum + cue.text.length, 0)

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(cues, null, 2))
} else {
  for (const cue of cues) console.log(`${cue.id}\t${cue.text}`)
  console.error(`${cues.length} clips, ${total} characters`)
}
