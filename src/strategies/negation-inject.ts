import { SeedExample, GeneratedCase } from '../types'

export const negationInject = {
  id: 'negation-inject',
  family: 'adversarial' as const,
  risk: 'high' as const,
  apply(seed: SeedExample, _rng: () => number): GeneratedCase[] {
    return [
      {
        input: 'Do NOT ' + seed.input,
        expected: seed.expected,
        strategy: 'negation-inject',
        family: 'adversarial',
        seedId: seed.id ?? '',
        tags: ['adversarial', 'negation'],
        risk: 'high',
        description: 'Prepended "Do NOT" negation',
      },
    ]
  },
}
