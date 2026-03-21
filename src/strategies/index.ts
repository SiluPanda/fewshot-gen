export { typoInject } from './typo-inject'
export { caseVariation } from './case-variation'
export { punctuationVariation } from './punctuation-variation'
export { contractionToggle } from './contraction-toggle'
export { emptyInput } from './empty-input'
export { veryLongInput } from './very-long-input'
export { onlyNumbers } from './only-numbers'
export { onlyPunctuation } from './only-punctuation'
export { unicodeInjection } from './unicode-injection'
export { promptInjection } from './prompt-injection'
export { negationInject } from './negation-inject'
export { questionToStatement } from './question-to-statement'

import { typoInject } from './typo-inject'
import { caseVariation } from './case-variation'
import { punctuationVariation } from './punctuation-variation'
import { contractionToggle } from './contraction-toggle'
import { emptyInput } from './empty-input'
import { veryLongInput } from './very-long-input'
import { onlyNumbers } from './only-numbers'
import { onlyPunctuation } from './only-punctuation'
import { unicodeInjection } from './unicode-injection'
import { promptInjection } from './prompt-injection'
import { negationInject } from './negation-inject'
import { questionToStatement } from './question-to-statement'
import { GeneratedCase, SeedExample, StrategyFamily, RiskLevel } from '../types'

export interface Strategy {
  id: string
  family: StrategyFamily
  risk: RiskLevel
  apply(seed: SeedExample, rng: () => number): GeneratedCase[]
}

export const ALL_STRATEGIES: Strategy[] = [
  typoInject,
  caseVariation,
  punctuationVariation,
  contractionToggle,
  emptyInput,
  veryLongInput,
  onlyNumbers,
  onlyPunctuation,
  unicodeInjection,
  promptInjection,
  negationInject,
  questionToStatement,
]
