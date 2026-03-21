import { SeedExample, GeneratedCase } from '../types'

export const emptyInput = {
  id: 'empty-input',
  family: 'edge-case' as const,
  risk: 'medium' as const,
  apply(seed: SeedExample, _rng: () => number): GeneratedCase[] {
    const base: Omit<GeneratedCase, 'input' | 'description'> = {
      expected: seed.expected,
      strategy: 'empty-input',
      family: 'edge-case',
      seedId: seed.id ?? '',
      tags: ['edge-case', 'empty'],
      risk: 'medium',
    }

    return [
      { ...base, input: '', description: 'Empty string' },
      { ...base, input: ' ', description: 'Single space' },
      { ...base, input: '   ', description: 'Multiple spaces' },
    ]
  },
}
