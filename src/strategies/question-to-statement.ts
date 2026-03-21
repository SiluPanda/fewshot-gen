import { SeedExample, GeneratedCase } from '../types'

export const questionToStatement = {
  id: 'question-to-statement',
  family: 'format' as const,
  risk: 'medium' as const,
  apply(seed: SeedExample, _rng: () => number): GeneratedCase[] {
    const input = seed.input.trim()
    const base: Omit<GeneratedCase, 'input' | 'description'> = {
      expected: seed.expected,
      strategy: 'question-to-statement',
      family: 'format',
      seedId: seed.id ?? '',
      tags: ['format', 'question-statement'],
      risk: 'medium',
    }

    if (input.endsWith('?')) {
      // Convert question to statement: remove trailing ?
      const statement = input.slice(0, -1).trimEnd() + '.'
      return [{
        ...base,
        input: statement,
        description: 'Question converted to statement',
      }]
    } else {
      // Convert statement to question: append ?
      const trimmed = input.replace(/[.!]$/, '')
      return [{
        ...base,
        input: trimmed + '?',
        description: 'Statement converted to question',
      }]
    }
  },
}
