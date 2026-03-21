import { SeedExample, GeneratedCase } from '../types'

export const punctuationVariation = {
  id: 'punctuation-variation',
  family: 'perturbation' as const,
  risk: 'low' as const,
  apply(seed: SeedExample, _rng: () => number): GeneratedCase[] {
    const input = seed.input
    const base: Omit<GeneratedCase, 'input' | 'description' | 'tags'> = {
      expected: seed.expected,
      strategy: 'punctuation-variation',
      family: 'perturbation',
      seedId: seed.id ?? '',
      risk: 'low',
    }

    const cases: GeneratedCase[] = []

    // strip: remove all punctuation
    const stripped = input.replace(/[^\w\s]/g, '')
    if (stripped !== input) {
      cases.push({
        ...base,
        input: stripped,
        tags: ['punctuation', 'strip'],
        description: 'Punctuation stripped from input',
      })
    }

    // add-period: add . if not ending in punctuation
    if (!/[.!?]$/.test(input.trim())) {
      cases.push({
        ...base,
        input: input.trimEnd() + '.',
        tags: ['punctuation', 'add-period'],
        description: 'Period added to end of input',
      })
    }

    // add-question: replace . at end with ?
    if (/\.$/.test(input.trim())) {
      const questioned = input.trimEnd().replace(/\.$/, '?')
      if (questioned !== input) {
        cases.push({
          ...base,
          input: questioned,
          tags: ['punctuation', 'add-question'],
          description: 'Trailing period replaced with question mark',
        })
      }
    }

    return cases
  },
}
