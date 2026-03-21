import { SeedExample, GeneratedCase } from '../types'

function toTitleCase(str: string): string {
  return str.replace(/\b\w/g, c => c.toUpperCase())
}

export const caseVariation = {
  id: 'case-variation',
  family: 'perturbation' as const,
  risk: 'low' as const,
  apply(seed: SeedExample, _rng: () => number): GeneratedCase[] {
    const input = seed.input
    const base: Omit<GeneratedCase, 'input' | 'description' | 'tags'> = {
      expected: seed.expected,
      strategy: 'case-variation',
      family: 'perturbation',
      seedId: seed.id ?? '',
      risk: 'low',
    }

    return [
      {
        ...base,
        input: input.toUpperCase(),
        tags: ['case', 'upper'],
        description: 'Input converted to uppercase',
      },
      {
        ...base,
        input: input.toLowerCase(),
        tags: ['case', 'lower'],
        description: 'Input converted to lowercase',
      },
      {
        ...base,
        input: toTitleCase(input),
        tags: ['case', 'title'],
        description: 'Input converted to title case',
      },
    ]
  },
}
