import { SeedExample, GenerateOptions, GenerationResult, GenerationReport, StrategyFamily, FewshotGenerator } from './types'
import { mulberry32 } from './prng'
import { ALL_STRATEGIES } from './strategies/index'
import { deduplicateCases } from './dedup'

const RISK_ORDER = ['low', 'medium', 'high'] as const

export function generate(seeds: SeedExample[], options?: GenerateOptions): GenerationResult {
  const start = Date.now()
  const seedValue = options?.seed ?? 42
  const rng = mulberry32(seedValue)
  const threshold = options?.diversityThreshold ?? 0.85
  const maxRiskIdx = options?.maxRisk ? RISK_ORDER.indexOf(options.maxRisk) : 2

  // Normalize seeds with default IDs
  const normalizedSeeds = seeds.map((s, i) => ({ ...s, id: s.id ?? `seed-${i}` }))

  // Select strategies based on options
  let strategies = [...ALL_STRATEGIES]
  if (options?.families) {
    strategies = strategies.filter(s => (options.families as StrategyFamily[]).includes(s.family))
  }
  if (options?.strategies) {
    strategies = strategies.filter(s => options.strategies!.includes(s.id))
  }
  if (options?.exclude) {
    strategies = strategies.filter(s => !options.exclude!.includes(s.id))
  }
  strategies = strategies.filter(s => RISK_ORDER.indexOf(s.risk) <= maxRiskIdx)

  // Generate all cases
  const allCases = []
  for (const seed of normalizedSeeds) {
    for (const strategy of strategies) {
      const cases = strategy.apply(seed, rng)
      for (const c of cases) {
        allCases.push({
          ...c,
          seedId: seed.id!,
          tags: [...(c.tags ?? []), strategy.family, strategy.id, ...(seed.tags ?? [])],
        })
      }
    }
  }

  // Deduplicate and remove exact copies of seed inputs
  const seedInputs = new Set(normalizedSeeds.map(s => s.input.toLowerCase()))
  const filtered = allCases.filter(c => !seedInputs.has(c.input.toLowerCase()))
  const unique = deduplicateCases(filtered, threshold)

  // Apply maxCases limit
  const final = options?.maxCases != null ? unique.slice(0, options.maxCases) : unique

  // Build report
  const perStrategy: Record<string, number> = {}
  const perFamily: Record<StrategyFamily, number> = {
    perturbation: 0,
    'edge-case': 0,
    adversarial: 0,
    format: 0,
  }
  for (const c of final) {
    perStrategy[c.strategy] = (perStrategy[c.strategy] ?? 0) + 1
    perFamily[c.family]++
  }

  const report: GenerationReport = {
    totalSeeds: normalizedSeeds.length,
    totalGenerated: allCases.length,
    totalOutput: final.length,
    perStrategy,
    perFamily,
    durationMs: Date.now() - start,
  }

  return { cases: final, report }
}

export function createGenerator(config?: GenerateOptions): FewshotGenerator {
  return {
    generate: (seeds, opts) => generate(seeds, { ...config, ...opts }),
    config: config ?? {},
  }
}
