import { SeedExample, GeneratedCase } from '../types'

export const veryLongInput = {
  id: 'very-long-input',
  family: 'edge-case' as const,
  risk: 'medium' as const,
  apply(seed: SeedExample, _rng: () => number): GeneratedCase[] {
    return [
      {
        input: Array(10).fill(seed.input).join(' '),
        expected: seed.expected,
        strategy: 'very-long-input',
        family: 'edge-case',
        seedId: seed.id ?? '',
        tags: ['edge-case', 'long-input'],
        risk: 'medium',
        description: 'Input repeated 10 times',
      },
    ]
  },
}
