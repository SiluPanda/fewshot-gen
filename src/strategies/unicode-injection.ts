import { SeedExample, GeneratedCase } from '../types'

export const unicodeInjection = {
  id: 'unicode-injection',
  family: 'edge-case' as const,
  risk: 'high' as const,
  apply(seed: SeedExample, _rng: () => number): GeneratedCase[] {
    const input = seed.input
    const base: Omit<GeneratedCase, 'input' | 'description'> = {
      expected: seed.expected,
      strategy: 'unicode-injection',
      family: 'edge-case',
      seedId: seed.id ?? '',
      tags: ['edge-case', 'unicode'],
      risk: 'high',
    }

    // Inject zero-width space mid-word
    const midPoint = Math.floor(input.length / 2)
    const zwsInput = input.slice(0, midPoint) + '\u200B' + input.slice(midPoint)

    // Prepend right-to-left override
    const rtloInput = '\u202E' + input

    return [
      {
        ...base,
        input: zwsInput,
        description: 'Zero-width space injected mid-word',
      },
      {
        ...base,
        input: rtloInput,
        description: 'Right-to-left override prepended',
      },
    ]
  },
}
