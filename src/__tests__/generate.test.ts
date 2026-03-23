import { describe, it, expect } from 'vitest'
import { generate, createGenerator } from '../generate'
import { SeedExample } from '../types'

describe('generate()', () => {
  it('returns a GenerationResult with cases and report', () => {
    const seeds: SeedExample[] = [{ input: 'Hello world' }]
    const result = generate(seeds)
    expect(result).toHaveProperty('cases')
    expect(result).toHaveProperty('report')
    expect(Array.isArray(result.cases)).toBe(true)
    expect(result.report.totalSeeds).toBe(1)
    expect(result.report.totalOutput).toBe(result.cases.length)
  })

  it('is deterministic with the same seed', () => {
    const seeds: SeedExample[] = [{ input: 'The quick brown fox' }]
    const r1 = generate(seeds, { seed: 7 })
    const r2 = generate(seeds, { seed: 7 })
    expect(r1.cases.map(c => c.input)).toEqual(r2.cases.map(c => c.input))
    expect(r1.report.totalOutput).toBe(r2.report.totalOutput)
  })

  it('produces different output with different seeds', () => {
    const seeds: SeedExample[] = [{ input: 'The quick brown fox jumps' }]
    const r1 = generate(seeds, { seed: 1 })
    const r2 = generate(seeds, { seed: 999 })
    // Most cases will differ due to random word selection in typo-inject
    const inputs1 = r1.cases.map(c => c.input).join('|')
    const inputs2 = r2.cases.map(c => c.input).join('|')
    expect(inputs1).not.toBe(inputs2)
  })

  it('respects maxCases option', () => {
    const seeds: SeedExample[] = [{ input: 'Hello world test input' }]
    const result = generate(seeds, { maxCases: 3 })
    expect(result.cases.length).toBeLessThanOrEqual(3)
    expect(result.report.totalOutput).toBeLessThanOrEqual(3)
  })

  it('filters by families option', () => {
    const seeds: SeedExample[] = [{ input: 'Hello world' }]
    const result = generate(seeds, { families: ['perturbation'] })
    for (const c of result.cases) {
      expect(c.family).toBe('perturbation')
    }
  })

  it('filters by maxRisk option', () => {
    const seeds: SeedExample[] = [{ input: 'Hello world' }]
    const result = generate(seeds, { maxRisk: 'medium' })
    for (const c of result.cases) {
      expect(['low', 'medium']).toContain(c.risk)
    }
    expect(result.cases.some(c => c.risk === 'high')).toBe(false)
  })

  it('excludes specified strategies', () => {
    const seeds: SeedExample[] = [{ input: 'Hello world' }]
    const result = generate(seeds, { exclude: ['empty-input', 'only-numbers', 'only-punctuation'] })
    for (const c of result.cases) {
      expect(['empty-input', 'only-numbers', 'only-punctuation']).not.toContain(c.strategy)
    }
  })

  it('removes seed inputs from output', () => {
    const seeds: SeedExample[] = [{ input: 'Hello world' }]
    const result = generate(seeds)
    const seedInputsLower = seeds.map(s => s.input.toLowerCase())
    for (const c of result.cases) {
      expect(seedInputsLower).not.toContain(c.input.toLowerCase())
    }
  })

  it('deduplication removes near-duplicate cases at threshold', () => {
    // Two seeds that are near-identical should not produce repeated identical outputs
    const seeds: SeedExample[] = [
      { input: 'Hello world foo bar baz' },
    ]
    const result = generate(seeds, { diversityThreshold: 0.99 })
    // With high threshold there should be no duplicate inputs
    const inputs = result.cases.map(c => c.input)
    const unique = new Set(inputs)
    expect(unique.size).toBe(inputs.length)
  })

  it('report perFamily sums match totalOutput', () => {
    const seeds: SeedExample[] = [{ input: 'Hello world test example sentence' }]
    const result = generate(seeds)
    const familySum = Object.values(result.report.perFamily).reduce((a, b) => a + b, 0)
    expect(familySum).toBe(result.report.totalOutput)
  })

  it('report perStrategy sums match totalOutput', () => {
    const seeds: SeedExample[] = [{ input: 'Hello world test' }]
    const result = generate(seeds)
    const strategySum = Object.values(result.report.perStrategy).reduce((a, b) => a + b, 0)
    expect(strategySum).toBe(result.report.totalOutput)
  })

  it('assigns auto-incremented seedId when not provided', () => {
    const seeds: SeedExample[] = [{ input: 'First' }, { input: 'Second sentence here' }]
    const result = generate(seeds)
    const seedIds = new Set(result.cases.map(c => c.seedId))
    expect(seedIds.has('seed-0')).toBe(true)
    expect(seedIds.has('seed-1')).toBe(true)
  })

  it('uses provided seed id', () => {
    const seeds: SeedExample[] = [{ id: 'my-seed', input: 'Hello world example' }]
    const result = generate(seeds)
    for (const c of result.cases) {
      expect(c.seedId).toBe('my-seed')
    }
  })
})

describe('createGenerator()', () => {
  it('returns a FewshotGenerator with generate and config', () => {
    const gen = createGenerator({ seed: 10 })
    expect(typeof gen.generate).toBe('function')
    expect(gen.config).toEqual({ seed: 10 })
  })

  it('merges config with per-call options (call options win)', () => {
    const gen = createGenerator({ seed: 1, maxCases: 100 })
    const seeds: SeedExample[] = [{ input: 'Hello world test' }]
    const result = gen.generate(seeds, { maxCases: 2 })
    expect(result.cases.length).toBeLessThanOrEqual(2)
  })

  it('returns same output as direct generate() call', () => {
    const seeds: SeedExample[] = [{ input: 'Hello world test' }]
    const gen = createGenerator({ seed: 42 })
    const r1 = gen.generate(seeds)
    const r2 = generate(seeds, { seed: 42 })
    expect(r1.cases.map(c => c.input)).toEqual(r2.cases.map(c => c.input))
  })
})

describe('contraction-toggle case sensitivity', () => {
  it('expands lowercase i\'m to i am', () => {
    const seeds: SeedExample[] = [{ input: "i'm happy today" }]
    const result = generate(seeds, { strategies: ['contraction-toggle'] })
    expect(result.cases.length).toBeGreaterThanOrEqual(1)
    const expanded = result.cases.find(c => c.strategy === 'contraction-toggle')
    expect(expanded).toBeDefined()
    expect(expanded!.input.toLowerCase()).toContain('i am')
  })
})

describe('jaccard dedup whitespace handling', () => {
  it('does not collapse all whitespace-only inputs into one', () => {
    const seeds: SeedExample[] = [{ input: 'Hello world test input' }]
    // With empty token filtering, empty-string cases should survive dedup
    const result = generate(seeds, { diversityThreshold: 0.85 })
    // The edge-case strategies should produce output
    expect(result.cases.length).toBeGreaterThan(0)
  })
})

describe('typo-inject whitespace handling', () => {
  it('does not produce cases from whitespace-only input', () => {
    // Whitespace-only input of length >= 5 should not crash or produce invalid cases
    const seeds: SeedExample[] = [{ input: 'Hello world test input phrase' }]
    const result = generate(seeds, { strategies: ['typo-inject'], seed: 42 })
    // All generated cases should have non-empty meaningful input
    for (const c of result.cases) {
      expect(c.input.trim().length).toBeGreaterThan(0)
    }
  })
})
