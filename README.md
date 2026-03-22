# fewshot-gen

Deterministic few-shot test case generator -- expand seed examples into diverse variations using strategy-based mutation, without calling any LLM.

[![npm version](https://img.shields.io/npm/v/fewshot-gen.svg)](https://www.npmjs.com/package/fewshot-gen)
[![npm downloads](https://img.shields.io/npm/dt/fewshot-gen.svg)](https://www.npmjs.com/package/fewshot-gen)
[![license](https://img.shields.io/npm/l/fewshot-gen.svg)](https://github.com/SiluPanda/fewshot-gen/blob/master/LICENSE)
[![node](https://img.shields.io/node/v/fewshot-gen.svg)](https://nodejs.org/)

---

## Description

`fewshot-gen` takes a small set of seed examples (input/output pairs) and algorithmically produces diverse variations using perturbation, edge-case injection, adversarial mutation, and format transformation strategies. Generation is entirely deterministic: the same seeds with the same configuration always produce the same output. No API keys, no model inference, no network access. Zero runtime dependencies.

The generated cases are tagged with the strategy that produced them, the seed they derived from, and a risk level indicating how far each variation deviates from the original. Output can be used directly as few-shot examples in LLM prompts, as evaluation test suites, or as adversarial probes for safety testing.

**Use cases:**

- Expand 5 hand-written few-shot examples into 50+ diverse variations for prompt robustness testing
- Generate edge-case and adversarial inputs for LLM evaluation suites
- Bootstrap regression test datasets from a small set of seed cases
- Produce deterministic test cases in CI pipelines without external service calls

---

## Installation

```bash
npm install fewshot-gen
```

---

## Quick Start

```typescript
import { generate } from 'fewshot-gen';

const seeds = [
  { id: 'greet', input: 'Hello, how are you today?' },
  { id: 'cmd', input: 'Please summarize this document.' },
];

const result = generate(seeds, {
  seed: 42,
  maxCases: 50,
  maxRisk: 'medium',
});

console.log(result.cases.length);
// => number of generated cases

console.log(result.report.perFamily);
// => { perturbation: N, 'edge-case': N, adversarial: 0, format: N }

for (const c of result.cases) {
  console.log(`[${c.strategy}] ${c.input}`);
}
```

---

## Features

- **12 built-in strategies** across four families: perturbation, edge-case, adversarial, and format
- **Fully deterministic** -- seeded PRNG (Mulberry32) ensures identical output for identical input
- **Configurable risk levels** -- filter strategies by `low`, `medium`, or `high` risk thresholds
- **Jaccard-based deduplication** -- automatically removes near-duplicate generated cases above a configurable similarity threshold
- **Zero runtime dependencies** -- all strategies use string manipulation and built-in word lists
- **Full TypeScript support** -- every public type is exported with complete type definitions
- **Detailed generation reports** -- per-strategy and per-family case counts, timing, and totals
- **Factory pattern** -- `createGenerator()` returns a reusable, pre-configured generator instance

---

## API Reference

### `generate(seeds, options?)`

The primary entry point. Takes an array of seed examples and returns generated test cases with a summary report.

```typescript
function generate(seeds: SeedExample[], options?: GenerateOptions): GenerationResult;
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `seeds` | `SeedExample[]` | Yes | Array of seed examples to expand |
| `options` | `GenerateOptions` | No | Configuration for generation behavior |

**Returns:** `GenerationResult` -- an object containing `cases` (the generated test cases) and `report` (generation statistics).

**Example:**

```typescript
import { generate } from 'fewshot-gen';

const result = generate(
  [{ input: "What's the weather like?" }],
  { seed: 7, maxCases: 20, families: ['perturbation', 'edge-case'] }
);

console.log(result.cases.length);
console.log(result.report.durationMs);
```

---

### `createGenerator(config?)`

Factory function that returns a `FewshotGenerator` instance with bound default configuration. Per-call options passed to `generator.generate()` override the bound config.

```typescript
function createGenerator(config?: GenerateOptions): FewshotGenerator;
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `config` | `GenerateOptions` | No | Default options applied to every `generate()` call |

**Returns:** `FewshotGenerator` -- an object with a `generate` method and a `config` property.

**Example:**

```typescript
import { createGenerator } from 'fewshot-gen';

const gen = createGenerator({
  seed: 42,
  maxRisk: 'medium',
  families: ['perturbation'],
});

// Uses bound config
const r1 = gen.generate([{ input: 'Hello world' }]);

// Per-call options override bound config
const r2 = gen.generate([{ input: 'Hello world' }], { maxCases: 5 });

// Inspect bound config
console.log(gen.config);
// => { seed: 42, maxRisk: 'medium', families: ['perturbation'] }
```

---

### `ALL_STRATEGIES`

An array of all built-in `Strategy` objects. Each strategy has an `id`, `family`, `risk`, and `apply` method.

```typescript
import { ALL_STRATEGIES } from 'fewshot-gen';

for (const s of ALL_STRATEGIES) {
  console.log(`${s.id} [${s.family}] risk=${s.risk}`);
}
```

---

## Configuration

### `GenerateOptions`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `seed` | `number` | `42` | PRNG seed for deterministic output |
| `maxCases` | `number` | unlimited | Maximum number of output cases |
| `strategies` | `string[]` | all | Whitelist of strategy IDs to apply |
| `families` | `StrategyFamily[]` | all | Whitelist of strategy families to apply |
| `maxRisk` | `RiskLevel` | `'high'` | Maximum risk level to include (`'low'` excludes medium and high) |
| `exclude` | `string[]` | `[]` | Strategy IDs to exclude |
| `diversityThreshold` | `number` | `0.85` | Jaccard similarity threshold for deduplication (0.0 = keep all, 1.0 = remove only exact duplicates) |

**Filter precedence:** `families` is applied first, then `strategies` (whitelist), then `exclude` (blacklist), then `maxRisk`. All filters compose.

---

## Strategies

### Perturbation Family (low risk)

Strategies that modify the surface form of the input while preserving semantic meaning.

| Strategy ID | Risk | Variants | Description |
|-------------|------|----------|-------------|
| `typo-inject` | low | up to 3 | Introduces realistic typos: adjacent-key substitution, letter doubling, adjacent character swap. Requires input length >= 5. |
| `case-variation` | low | 3 | Produces UPPERCASE, lowercase, and Title Case versions of the input. |
| `punctuation-variation` | low | up to 3 | Strips all punctuation, appends a period, or replaces a trailing period with a question mark. |
| `contraction-toggle` | low | 1 | Expands contractions to full form ("don't" to "do not") or contracts full forms. Supports 8 common contraction pairs. |

### Edge-Case Family (medium/high risk)

Strategies that generate boundary-condition inputs to test system robustness.

| Strategy ID | Risk | Variants | Description |
|-------------|------|----------|-------------|
| `empty-input` | medium | 3 | Generates empty string, single space, and multiple spaces. |
| `very-long-input` | medium | 1 | Repeats the seed input 10 times, separated by spaces. |
| `only-numbers` | medium | 1 | Replaces input with the numeric string `1234567890`. |
| `only-punctuation` | medium | 1 | Replaces input with the punctuation string `!@#$%^&*()`. |
| `unicode-injection` | high | 2 | Injects a zero-width space mid-input and prepends a right-to-left override character. |

### Adversarial Family (high risk)

Strategies that generate inputs designed to break or manipulate LLM behavior.

| Strategy ID | Risk | Variants | Description |
|-------------|------|----------|-------------|
| `prompt-injection` | high | 3 | Appends "Ignore previous instructions" payload, prepends "New instructions:" prefix, and appends a fake system prompt. |
| `negation-inject` | high | 1 | Prepends "Do NOT" to the seed input. |

### Format Family (medium risk)

Strategies that change the structural presentation of the input.

| Strategy ID | Risk | Variants | Description |
|-------------|------|----------|-------------|
| `question-to-statement` | medium | 1 | Converts questions to statements (removes trailing `?`, appends `.`) or statements to questions (removes trailing `.`/`!`, appends `?`). |

---

## Error Handling

`fewshot-gen` is designed to be resilient and avoid throwing exceptions during normal operation:

- **Empty seed array:** Passing an empty `seeds` array returns a `GenerationResult` with zero cases and a report reflecting zero seeds.
- **Short inputs:** Strategies that require a minimum input length (e.g., `typo-inject` requires >= 5 characters) return an empty array for seeds that are too short. No error is thrown.
- **No matching strategies:** If the combination of `families`, `strategies`, `exclude`, and `maxRisk` filters out all strategies, the result contains zero cases.
- **Seeds without IDs:** Seeds missing an `id` field are auto-assigned sequential IDs (`seed-0`, `seed-1`, ...).
- **Seeds without expected output:** The `expected` field is optional. When absent, generated cases inherit `undefined` for `expected`.

---

## Advanced Usage

### Filter by Strategy Family

Generate only perturbation variants to test input robustness without adversarial payloads:

```typescript
const result = generate(seeds, {
  families: ['perturbation'],
});
// All cases have family === 'perturbation'
```

### Exclude Specific Strategies

Keep edge-case testing but skip static-input strategies:

```typescript
const result = generate(seeds, {
  families: ['edge-case'],
  exclude: ['only-numbers', 'only-punctuation'],
});
```

### Combine Whitelist and Risk Cap

Select specific strategies and enforce a risk ceiling:

```typescript
const result = generate(seeds, {
  strategies: ['typo-inject', 'case-variation', 'empty-input'],
  maxRisk: 'medium',
});
```

### Control Diversity

Lower the diversity threshold to produce a more varied output set (more aggressive deduplication):

```typescript
const result = generate(seeds, {
  diversityThreshold: 0.6, // Remove cases with >= 60% token overlap
});
```

Raise it to keep more cases, even if they are similar:

```typescript
const result = generate(seeds, {
  diversityThreshold: 0.99, // Only remove near-exact duplicates
});
```

### Deterministic CI Pipeline

Use a fixed seed to generate the same test cases on every CI run:

```typescript
const result = generate(seeds, {
  seed: 12345,
  maxCases: 100,
  maxRisk: 'medium',
});
// Identical output on every invocation
```

### Reusable Generator with Factory

Create a pre-configured generator for repeated use across different seed sets:

```typescript
const gen = createGenerator({
  seed: 42,
  maxRisk: 'medium',
  diversityThreshold: 0.8,
});

const sentimentCases = gen.generate(sentimentSeeds);
const qaCases = gen.generate(qaSeeds);
const summaryCases = gen.generate(summarySeeds, { maxCases: 20 });
```

### Inspect the Generation Report

The report provides detailed statistics on what was generated:

```typescript
const { cases, report } = generate(seeds, { seed: 42 });

console.log(report.totalSeeds);      // Number of input seeds
console.log(report.totalGenerated);  // Cases before dedup/filtering
console.log(report.totalOutput);     // Final case count
console.log(report.durationMs);      // Generation time in milliseconds
console.log(report.perStrategy);     // { 'typo-inject': 3, 'case-variation': 3, ... }
console.log(report.perFamily);       // { perturbation: N, 'edge-case': N, adversarial: N, format: N }
```

### Tag-Based Filtering of Output

Every generated case carries tags that combine the strategy family, strategy ID, and any seed-level tags:

```typescript
const seeds = [
  { input: 'Hello world', tags: ['greeting'] },
];

const { cases } = generate(seeds);

// Filter by tag
const typos = cases.filter(c => c.tags.includes('typo'));
const edgeCases = cases.filter(c => c.tags.includes('edge-case'));
const fromGreeting = cases.filter(c => c.tags.includes('greeting'));
```

### Access Individual Strategies

Import the strategy array directly for inspection or custom pipeline integration:

```typescript
import { ALL_STRATEGIES } from 'fewshot-gen';

// List available strategies
for (const s of ALL_STRATEGIES) {
  console.log(`${s.id} | ${s.family} | ${s.risk}`);
}

// Apply a single strategy manually
import { mulberry32 } from 'fewshot-gen/dist/prng';

const rng = mulberry32(42);
const typo = ALL_STRATEGIES.find(s => s.id === 'typo-inject')!;
const cases = typo.apply({ input: 'Hello world test' }, rng);
```

---

## TypeScript

`fewshot-gen` is written in TypeScript and ships complete type definitions. All public types are exported from the package entry point.

```typescript
import type {
  SeedExample,
  GeneratedCase,
  GenerateOptions,
  GenerationResult,
  GenerationReport,
  FewshotGenerator,
  StrategyFamily,
  RiskLevel,
} from 'fewshot-gen';
```

### Type Definitions

```typescript
type StrategyFamily = 'perturbation' | 'edge-case' | 'adversarial' | 'format';

type RiskLevel = 'low' | 'medium' | 'high';

interface SeedExample {
  input: string;       // The text to transform (required)
  expected?: string;   // Expected output for this input
  id?: string;         // Unique seed identifier (auto-generated if omitted)
  category?: string;   // Classification label for the seed
  tags?: string[];     // Descriptive tags propagated to generated cases
}

interface GeneratedCase {
  input: string;              // The transformed input text
  expected?: string;          // Inherited from the seed example
  strategy: string;           // ID of the strategy that produced this case
  family: StrategyFamily;     // Strategy family
  seedId: string;             // ID of the originating seed
  tags: string[];             // Combined strategy + seed tags
  risk: RiskLevel;            // Risk level of the generating strategy
  description?: string;       // Human-readable description of the transformation
}

interface GenerateOptions {
  seed?: number;                    // PRNG seed (default: 42)
  maxCases?: number;                // Maximum output cases
  strategies?: string[];            // Whitelist of strategy IDs
  families?: StrategyFamily[];      // Whitelist of strategy families
  maxRisk?: RiskLevel;              // Maximum risk level
  exclude?: string[];               // Strategy IDs to exclude
  diversityThreshold?: number;      // Jaccard dedup threshold (default: 0.85)
}

interface GenerationResult {
  cases: GeneratedCase[];           // The generated test cases
  report: GenerationReport;         // Generation statistics
}

interface GenerationReport {
  totalSeeds: number;               // Number of input seeds
  totalGenerated: number;           // Cases before dedup/filtering
  totalOutput: number;              // Final output case count
  perStrategy: Record<string, number>;         // Cases per strategy ID
  perFamily: Record<StrategyFamily, number>;   // Cases per family
  durationMs: number;               // Generation time in milliseconds
}

interface FewshotGenerator {
  generate(seeds: SeedExample[], options?: GenerateOptions): GenerationResult;
  config: GenerateOptions;          // The bound default configuration
}
```

---

## License

MIT
