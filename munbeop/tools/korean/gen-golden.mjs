import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const data = JSON.parse(fs.readFileSync(path.join(os.tmpdir(), 'korean-golden.json'), 'utf8'))
const q = (s) => JSON.stringify(s)

const conj = data.goldenConjugations
  .map((r) => `  { dict: ${q(r.dict)}, klass: ${q(r.klass)}, ending: ${q(r.ending)}, surface: ${q(r.surface)} },`)
  .join('\n')
const part = data.goldenParticles
  .map((r) => `  { noun: ${q(r.noun)}, particle: ${q(r.particle)}, surface: ${q(r.surface)} },`)
  .join('\n')
fs.writeFileSync(
  'tests/unit/korean/golden.ts',
  `// Generated from the adversarially-verified workflow output. Do not hand-edit.\n` +
    `import type { Ending, Particle, VerbClass } from '~/lib/korean'\n\n` +
    `export const GOLDEN_CONJUGATIONS: { dict: string; klass: VerbClass; ending: Ending; surface: string }[] = [\n${conj}\n]\n\n` +
    `export const GOLDEN_PARTICLES: { noun: string; particle: Particle; surface: string }[] = [\n${part}\n]\n`,
)

const verbs = data.datasetVerbs
  .map((v) => `  { dict: ${q(v.dict)}, gloss: ${q(v.gloss)}, klass: ${q(v.klass)} },`)
  .join('\n')
const nouns = data.datasetNouns
  .map((n) => `  { noun: ${q(n.noun)}, gloss: ${q(n.gloss ?? '')}, endsInConsonant: ${n.endsInConsonant}, endsInRieul: ${n.endsInRieul} },`)
  .join('\n')
fs.writeFileSync(
  'app/lib/korean/dataset.ts',
  `// Generated curated dataset. Do not hand-edit.\n` +
    `import type { VerbClass } from './types'\n\n` +
    `export interface DatasetVerb { dict: string; gloss: string; klass: VerbClass }\n` +
    `export interface DatasetNoun { noun: string; gloss: string; endsInConsonant: boolean; endsInRieul: boolean }\n\n` +
    `export const VERBS: DatasetVerb[] = [\n${verbs}\n]\n\n` +
    `export const NOUNS: DatasetNoun[] = [\n${nouns}\n]\n`,
)
console.log(
  `golden: ${data.goldenConjugations.length} conj + ${data.goldenParticles.length} particles; dataset: ${data.datasetVerbs.length} verbs + ${data.datasetNouns.length} nouns`,
)
