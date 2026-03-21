import { SeedExample, GeneratedCase } from '../types'

export const onlyNumbers = {
  id: 'only-numbers',
  family: 'edge-case' as const,
  risk: 'medium' as const,
  apply(seed: SeedExample, _rng: () => number): GeneratedCase[] {
    return [
      {
        input: '1234567890',
        expected: seed.expected,
        strategy: 'only-numbers',
        family: 'edge-case',
        seedId: seed.id ?? '',
        tags: ['edge-case', 'numeric'],
        risk: 'medium',
        description: 'Input replaced with numeric-only string',
      },
    ]
  },
}
