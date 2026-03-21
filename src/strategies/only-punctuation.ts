import { SeedExample, GeneratedCase } from '../types'

export const onlyPunctuation = {
  id: 'only-punctuation',
  family: 'edge-case' as const,
  risk: 'medium' as const,
  apply(seed: SeedExample, _rng: () => number): GeneratedCase[] {
    return [
      {
        input: '!@#$%^&*()',
        expected: seed.expected,
        strategy: 'only-punctuation',
        family: 'edge-case',
        seedId: seed.id ?? '',
        tags: ['edge-case', 'punctuation-only'],
        risk: 'medium',
        description: 'Input replaced with punctuation-only string',
      },
    ]
  },
}
