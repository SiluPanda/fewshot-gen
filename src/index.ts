// fewshot-gen - Generate diverse few-shot test cases from seed examples
export { generate, createGenerator } from './generate'
export { ALL_STRATEGIES } from './strategies/index'
export type {
  StrategyFamily,
  RiskLevel,
  SeedExample,
  GeneratedCase,
  GenerateOptions,
  GenerationReport,
  GenerationResult,
  FewshotGenerator,
} from './types'
