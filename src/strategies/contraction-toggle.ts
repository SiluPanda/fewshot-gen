import { SeedExample, GeneratedCase } from '../types'

const expansions: Array<[RegExp, string]> = [
  [/\bdon't\b/gi, "do not"],
  [/\bcan't\b/gi, "cannot"],
  [/\bI'm\b/gi, "I am"],
  [/\bit's\b/gi, "it is"],
  [/\byou're\b/gi, "you are"],
  [/\bwon't\b/gi, "will not"],
  [/\bwouldn't\b/gi, "would not"],
  [/\bshouldn't\b/gi, "should not"],
]

const contractions: Array<[RegExp, string]> = [
  [/\bdo not\b/gi, "don't"],
  [/\bcannot\b/gi, "can't"],
  [/\bI am\b/gi, "I'm"],
  [/\bit is\b/gi, "it's"],
  [/\byou are\b/gi, "you're"],
  [/\bwill not\b/gi, "won't"],
  [/\bwould not\b/gi, "wouldn't"],
  [/\bshould not\b/gi, "shouldn't"],
]

export const contractionToggle = {
  id: 'contraction-toggle',
  family: 'perturbation' as const,
  risk: 'low' as const,
  apply(seed: SeedExample, _rng: () => number): GeneratedCase[] {
    const input = seed.input
    const base: Omit<GeneratedCase, 'input' | 'description' | 'tags'> = {
      expected: seed.expected,
      strategy: 'contraction-toggle',
      family: 'perturbation',
      seedId: seed.id ?? '',
      risk: 'low',
    }

    // Try expanding contractions
    let expanded = input
    for (const [pattern, replacement] of expansions) {
      expanded = expanded.replace(pattern, replacement)
    }
    if (expanded !== input) {
      return [{
        ...base,
        input: expanded,
        tags: ['contraction', 'expand'],
        description: 'Contractions expanded to full form',
      }]
    }

    // Try contracting expansions
    let contracted = input
    for (const [pattern, replacement] of contractions) {
      contracted = contracted.replace(pattern, replacement)
    }
    if (contracted !== input) {
      return [{
        ...base,
        input: contracted,
        tags: ['contraction', 'contract'],
        description: 'Full forms contracted',
      }]
    }

    return []
  },
}
