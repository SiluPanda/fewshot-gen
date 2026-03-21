# fewshot-gen

Generate diverse few-shot test cases from seed examples using strategy-based mutation.

## Install

```bash
npm install fewshot-gen
```

## Quick Start

```typescript
import { generate, createGenerator } from 'fewshot-gen'

const seeds = [
  { id: 'greet', input: "Hello, how are you today?" },
  { id: 'cmd',   input: "Please summarize this document." },
]

const result = generate(seeds, {
  seed: 42,           // reproducible output
  maxCases: 50,       // cap total output
  maxRisk: 'medium',  // exclude adversarial/high-risk strategies
})

console.log(result.cases.length)      // number of generated cases
console.log(result.report.perFamily)  // { perturbation: N, 'edge-case': N, ... }
```

## API

### `generate(seeds, options?)`

| Parameter | Type | Description |
|---|---|---|
| `seeds` | `SeedExample[]` | Input seed examples |
| `options` | `GenerateOptions` | Optional configuration |

Returns `GenerationResult` with `cases: GeneratedCase[]` and `report: GenerationReport`.

### `createGenerator(config?)`

Factory that returns a `FewshotGenerator` instance with bound configuration. Per-call options override config.

```typescript
const gen = createGenerator({ seed: 42, families: ['perturbation'] })
const result = gen.generate(seeds)
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `seed` | `number` | `42` | PRNG seed for reproducibility |
| `maxCases` | `number` | unlimited | Maximum output cases |
| `strategies` | `string[]` | all | Explicit strategy IDs to use |
| `families` | `StrategyFamily[]` | all | Filter by strategy family |
| `maxRisk` | `RiskLevel` | `'high'` | Exclude strategies above this risk |
| `exclude` | `string[]` | none | Strategy IDs to exclude |
| `diversityThreshold` | `number` | `0.85` | Jaccard similarity dedup threshold |

## Strategies

| ID | Family | Risk | Description |
|---|---|---|---|
| `typo-inject` | perturbation | low | Adjacent key swap, letter doubling, char swap |
| `case-variation` | perturbation | low | UPPER, lower, Title Case variants |
| `punctuation-variation` | perturbation | low | Strip, add period, add question mark |
| `contraction-toggle` | perturbation | low | Expand/contract contractions |
| `empty-input` | edge-case | medium | Empty string, single space, multiple spaces |
| `very-long-input` | edge-case | medium | Input repeated 10x |
| `only-numbers` | edge-case | medium | Numeric-only input |
| `only-punctuation` | edge-case | medium | Punctuation-only input |
| `unicode-injection` | edge-case | high | Zero-width space, RTL override |
| `prompt-injection` | adversarial | high | Classic LLM injection payloads |
| `negation-inject` | adversarial | high | Prepend "Do NOT" |
| `question-to-statement` | format | medium | Toggle between question and statement |

## Types

```typescript
type StrategyFamily = 'perturbation' | 'edge-case' | 'adversarial' | 'format'
type RiskLevel = 'low' | 'medium' | 'high'

interface SeedExample {
  input: string
  expected?: string
  id?: string
  category?: string
  tags?: string[]
}

interface GeneratedCase {
  input: string
  expected?: string
  strategy: string
  family: StrategyFamily
  seedId: string
  tags: string[]
  risk: RiskLevel
  description?: string
}
```

## License

MIT
