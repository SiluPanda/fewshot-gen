import { describe, it, expect } from 'vitest'
import { typoInject } from '../../strategies/typo-inject'
import { mulberry32 } from '../../prng'
import { SeedExample } from '../../types'

const rng = mulberry32(42)

describe('typo-inject strategy', () => {
  it('returns up to 3 cases for a long input', () => {
    const seed: SeedExample = { id: 'seed-0', input: 'Hello world this is a test' }
    const cases = typoInject.apply(seed, mulberry32(42))
    expect(cases.length).toBeGreaterThan(0)
    expect(cases.length).toBeLessThanOrEqual(3)
  })

  it('returns empty array for very short input (< 5 chars)', () => {
    const seed: SeedExample = { id: 'seed-0', input: 'Hi' }
    const cases = typoInject.apply(seed, mulberry32(42))
    expect(cases).toHaveLength(0)
  })

  it('all returned cases differ from original input', () => {
    const seed: SeedExample = { id: 'seed-0', input: 'The quick brown fox' }
    const cases = typoInject.apply(seed, mulberry32(42))
    for (const c of cases) {
      expect(c.input).not.toBe(seed.input)
    }
  })

  it('sets strategy id, family, and risk correctly', () => {
    const seed: SeedExample = { id: 'seed-0', input: 'Hello there friend' }
    const cases = typoInject.apply(seed, mulberry32(42))
    for (const c of cases) {
      expect(c.strategy).toBe('typo-inject')
      expect(c.family).toBe('perturbation')
      expect(c.risk).toBe('low')
    }
  })

  it('includes a description for each case', () => {
    const seed: SeedExample = { id: 'seed-0', input: 'Hello world example' }
    const cases = typoInject.apply(seed, mulberry32(42))
    for (const c of cases) {
      expect(c.description).toBeDefined()
      expect(typeof c.description).toBe('string')
    }
  })

  void rng // suppress unused warning
})
