export type StrategyFamily = 'perturbation' | 'edge-case' | 'adversarial' | 'format'
export type RiskLevel = 'low' | 'medium' | 'high'

export interface SeedExample {
  input: string
  expected?: string
  id?: string
  category?: string
  tags?: string[]
}

export interface GeneratedCase {
  input: string
  expected?: string
  strategy: string
  family: StrategyFamily
  seedId: string
  tags: string[]
  risk: RiskLevel
  description?: string
}

export interface GenerateOptions {
  seed?: number
  maxCases?: number
  strategies?: string[]
  families?: StrategyFamily[]
  maxRisk?: RiskLevel
  exclude?: string[]
  diversityThreshold?: number
}

export interface GenerationReport {
  totalSeeds: number
  totalGenerated: number
  totalOutput: number
  perStrategy: Record<string, number>
  perFamily: Record<StrategyFamily, number>
  durationMs: number
}

export interface GenerationResult {
  cases: GeneratedCase[]
  report: GenerationReport
}

export interface FewshotGenerator {
  generate(seeds: SeedExample[], options?: GenerateOptions): GenerationResult
  config: GenerateOptions
}
