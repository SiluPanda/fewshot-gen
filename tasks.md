# fewshot-gen -- Implementation Tasks

This file tracks all implementation work for the `fewshot-gen` package. Tasks are grouped by logical phase, following the implementation roadmap in SPEC.md.

---

## Phase 0: Project Scaffolding & Setup

- [ ] **Install dev dependencies** -- Add `typescript`, `vitest`, and `eslint` to `devDependencies` in `package.json`. Run `npm install`. | Status: not_done
- [ ] **Configure ESLint** -- Create an ESLint config file compatible with ESLint v9+ and TypeScript. | Status: not_done
- [ ] **Add CLI bin entry to package.json** -- Add `"bin": { "fewshot-gen": "dist/cli/index.js" }` to `package.json` so the CLI is available after install. | Status: not_done
- [ ] **Create directory structure** -- Create all directories specified in SPEC section 16: `src/strategies/perturbation/`, `src/strategies/edge-case/`, `src/strategies/adversarial/`, `src/strategies/format/`, `src/data/`, `src/cli/`, `src/__tests__/`, `src/__tests__/strategies/perturbation/`, `src/__tests__/strategies/edge-case/`, `src/__tests__/strategies/adversarial/`, `src/__tests__/strategies/format/`, `src/__tests__/cli/`, `src/__tests__/fixtures/`. | Status: not_done
- [ ] **Create test fixtures** -- Create fixture seed files: `src/__tests__/fixtures/seeds-simple.json` (simple seed array), `src/__tests__/fixtures/seeds-enriched.json` (seeds with metadata), `src/__tests__/fixtures/seeds.csv` (CSV seed file), `src/__tests__/fixtures/seeds.jsonl` (JSONL seed file). | Status: not_done

---

## Phase 1: Type Definitions

- [ ] **Define `RiskLevel` type** -- Create `src/types.ts` with `type RiskLevel = 'low' | 'medium' | 'high'`. | Status: not_done
- [ ] **Define `StrategyFamily` type** -- Add `type StrategyFamily = 'perturbation' | 'edge-case' | 'adversarial' | 'format'` to `src/types.ts`. | Status: not_done
- [ ] **Define `SeedExample` interface** -- Add the `SeedExample` interface with fields: `input` (string, required), `expected` (string, optional), `id` (string, optional), `category` (string, optional), `tags` (string[], optional). | Status: not_done
- [ ] **Define `GeneratedCase` interface** -- Add the `GeneratedCase` interface with fields: `input`, `expected`, `strategy`, `family`, `seedId`, `tags`, `risk`, `description`. | Status: not_done
- [ ] **Define `StrategyInfo` interface** -- Add the `StrategyInfo` interface with fields: `id`, `family`, `description`, `risk`, `params` (Record with type/default/description). | Status: not_done
- [ ] **Define `GenerateOptions` interface** -- Add the `GenerateOptions` interface with fields: `seed`, `maxCases`, `strategies`, `families`, `maxRisk`, `exclude`, `diversityThreshold`, `familyWeights`, `strategyParams`, `propagateExpected`. | Status: not_done
- [ ] **Define `GeneratorConfig` type** -- Add `type GeneratorConfig = GenerateOptions`. | Status: not_done
- [ ] **Define `GenerationResult` interface** -- Add `GenerationResult` with `cases: GeneratedCase[]` and `report: GenerationReport`. | Status: not_done
- [ ] **Define `GenerationReport` interface** -- Add `GenerationReport` with fields: `totalSeeds`, `totalGenerated`, `totalDeduplicated`, `totalDiversityFiltered`, `totalOutput`, `perStrategy`, `perFamily`, `perSeed`, `durationMs`, `warnings`. | Status: not_done
- [ ] **Export all types from `src/types.ts`** -- Ensure all types and interfaces are exported. | Status: not_done

---

## Phase 2: Core Infrastructure

### 2.1 Seeded PRNG

- [ ] **Implement Mulberry32 PRNG** -- Create `src/prng.ts` with a Mulberry32 seeded PRNG class that provides: `next()` returning a float in [0,1), `nextInt(min, max)` returning an integer in [min, max], `pick(array)` returning a random element, `shuffle(array)` returning a shuffled copy. All operations must be deterministic given the same seed. | Status: not_done
- [ ] **Implement per-strategy PRNG seeding** -- Add a function that computes a per-strategy seed as `hash(globalSeed + strategyId + seedId)` using `node:crypto.createHash`. This ensures different strategies on the same seed produce different random choices while maintaining determinism. | Status: not_done
- [ ] **Write PRNG unit tests** -- Create `src/__tests__/prng.test.ts` testing: determinism (same seed = same sequence), different seeds produce different sequences, `nextInt` range correctness, `pick` returns valid elements, `shuffle` returns all elements. | Status: not_done

### 2.2 Seed Parser

- [ ] **Implement seed validation** -- Create `src/seed-parser.ts` with a `parseSeeds()` function that validates each seed has a non-empty `input` string. Seeds missing `input` or with empty/whitespace-only `input` produce an error. | Status: not_done
- [ ] **Implement seed ID auto-assignment** -- Seeds without an `id` field receive auto-generated IDs: `seed-0`, `seed-1`, etc. | Status: not_done
- [ ] **Implement seed normalization** -- Trim leading/trailing whitespace from `input` and `expected`. Normalize empty `expected` string to `undefined`. | Status: not_done
- [ ] **Implement duplicate seed detection** -- Emit a warning when two seeds have identical `input` text after normalization. Both seeds are kept. | Status: not_done
- [ ] **Write seed parser unit tests** -- Create `src/__tests__/seed-parser.test.ts` testing: valid seeds accepted, invalid seeds rejected (empty input, missing input, whitespace-only input), ID auto-assignment, normalization, duplicate warnings. | Status: not_done

### 2.3 Strategy Base & Registry

- [ ] **Define base strategy interface** -- Create `src/strategies/base.ts` with a `Strategy` interface containing: `id` (string), `family` (StrategyFamily), `description` (string), `risk` (RiskLevel), `params` (Record with defaults), `apply(seed: SeedExample, rng: PRNG): GeneratedCase[]`. Add shared utility functions for creating `GeneratedCase` objects with consistent tag construction. | Status: not_done
- [ ] **Create strategy registry** -- Create `src/strategies/index.ts` that collects all strategy instances into a registry Map keyed by strategy ID. Provide a `getAllStrategies()` function and a `getStrategy(id)` lookup. | Status: not_done

### 2.4 Strategy Selector

- [ ] **Implement strategy selection logic** -- Create `src/strategy-selector.ts` with a `selectStrategies()` function that supports all selection modes: all (default), by family, by risk level (`maxRisk`), by explicit ID list, by exclusion list, and combinations thereof. | Status: not_done
- [ ] **Write strategy selector unit tests** -- Create `src/__tests__/strategy-selector.test.ts` testing: all strategies selected by default, family filtering, risk filtering (`low` = only perturbation, `medium` = perturbation + format, `high` = all), explicit ID list, exclusion list, combined filters. | Status: not_done

### 2.5 Exact Deduplication

- [ ] **Implement exact deduplication** -- Create `src/dedup.ts` with a `deduplicate()` function that removes generated cases with identical `input` text after whitespace normalization (trim, collapse whitespace). First occurrence is kept. Returns the deduplicated array and the count of removed duplicates. | Status: not_done
- [ ] **Write deduplication unit tests** -- Create `src/__tests__/dedup.test.ts` testing: identical inputs collapsed, whitespace-normalized comparison, first occurrence kept, count of removed duplicates is correct. | Status: not_done

### 2.6 Diversity Filtering

- [ ] **Implement Jaccard similarity computation** -- Create `src/diversity.ts` with a function that tokenizes input text into lowercase word sets and computes Jaccard similarity `|A intersect B| / |A union B|` between two cases. | Status: not_done
- [ ] **Implement near-duplicate removal** -- Add near-duplicate detection: for each pair of cases with Jaccard similarity above the threshold (default 0.85), keep the case from the strategy with the fewest total cases in the output. | Status: not_done
- [ ] **Implement strategy coverage enforcement** -- After diversity filtering, if a strategy that produced cases before filtering now has zero cases, re-add its most unique case (lowest maximum similarity to any other case in the output). | Status: not_done
- [ ] **Implement seed coverage enforcement** -- After all filtering and limiting, if a seed has zero cases in the output, re-add the most unique case generated from that seed. | Status: not_done
- [ ] **Implement family balance** -- When `familyWeights` is configured, implement stratified sampling to adjust the output distribution to match target weights. Use the seeded PRNG for selection. | Status: not_done
- [ ] **Implement MinHash optimization** -- For case sets > 2000, implement MinHash with 128 hash functions to identify candidate near-duplicate pairs before exact Jaccard computation, reducing O(n^2) to approximately O(n log n). | Status: not_done
- [ ] **Write diversity unit tests** -- Create `src/__tests__/diversity.test.ts` testing: Jaccard similarity computation correctness, near-duplicate removal with various thresholds, strategy coverage enforcement, seed coverage enforcement, family balance with configured weights. | Status: not_done

### 2.7 Pipeline Orchestration

- [ ] **Implement generation pipeline** -- Create `src/pipeline.ts` with the 7-step pipeline: (1) parse seeds, (2) select strategies, (3) apply strategies with per-strategy PRNG, (4) deduplicate, (5) diversify, (6) limit, (7) tag and return. Returns `GenerationResult` with `cases` and `report`. | Status: not_done
- [ ] **Implement `maxCases` limiting** -- Implement the limiting step: allocate cases to each strategy ensuring every strategy gets at least one case (if it produced any), fill remaining slots prioritizing strategies with more unallocated cases. Handle edge case where `maxCases` < number of strategies. | Status: not_done
- [ ] **Implement tag assembly** -- Attach final tags to each case: strategy family, strategy ID, and any propagated seed tags. | Status: not_done
- [ ] **Implement `GenerationReport` assembly** -- Compute and return: `totalSeeds`, `totalGenerated`, `totalDeduplicated`, `totalDiversityFiltered`, `totalOutput`, `perStrategy`, `perFamily`, `perSeed`, `durationMs`, `warnings`. | Status: not_done
- [ ] **Implement `propagateExpected` behavior** -- When `propagateExpected` is true (default), low-risk generated cases inherit the seed's `expected` output. Medium and high-risk cases set `expected` to `undefined`. | Status: not_done
- [ ] **Write pipeline unit tests** -- Create `src/__tests__/pipeline.test.ts` testing each pipeline step individually and in combination. | Status: not_done

### 2.8 Public API

- [ ] **Implement `generate()` top-level function** -- Create `src/generator.ts` with the `generate(seeds, options?)` function that invokes the pipeline and returns `GenerationResult`. | Status: not_done
- [ ] **Implement `createGenerator()` factory** -- Add `createGenerator(config)` that returns a `FewshotGenerator` instance with reusable settings. The instance provides `generate()`, `perturb()`, `edgeCases()`, `adversarial()`, `formatVariations()`, `listStrategies()`, and `config`. | Status: not_done
- [ ] **Implement scoped methods** -- Implement `perturb()` (only perturbation family), `edgeCases()` (only edge-case family), `adversarial()` (only adversarial family), `formatVariations()` (only format family) on the `FewshotGenerator` class. | Status: not_done
- [ ] **Implement `listStrategies()`** -- Return an array of `StrategyInfo` objects for all available strategies. | Status: not_done
- [ ] **Set up `src/index.ts` exports** -- Export `generate`, `createGenerator`, and all public types from `src/index.ts`. | Status: not_done
- [ ] **Write generator integration tests** -- Create `src/__tests__/generator.test.ts` testing: end-to-end generation with sample seeds, `createGenerator` factory, scoped methods, `listStrategies`, determinism (same seeds+options = same output 10 times). | Status: not_done

---

## Phase 3: Data Tables

- [ ] **Create keyboard adjacency map** -- Create `src/data/keyboard-adjacency.ts` with a full QWERTY keyboard adjacency map (each key mapped to its adjacent keys). | Status: not_done
- [ ] **Create synonym table** -- Create `src/data/synonyms.ts` with approximately 200 synonym groups covering 1000+ common English words. Include the groups listed in the spec (happy/glad/pleased/joyful/delighted, good/great/excellent, etc.). | Status: not_done
- [ ] **Create contraction table** -- Create `src/data/contractions.ts` with bidirectional contraction/expansion pairs (~35 pairs as listed in the spec: don't/do not, doesn't/does not, etc.). | Status: not_done
- [ ] **Create homoglyph mapping table** -- Create `src/data/homoglyphs.ts` with approximately 60 character mappings across Cyrillic, Greek, and mathematical symbol blocks (a->Cyrillic a, e->Cyrillic e, etc.). | Status: not_done
- [ ] **Create number-to-word maps** -- Create `src/data/number-words.ts` with digit-to-word and word-to-digit conversion maps covering 0-20, 30, 40, ..., 100, 1000. Include Roman numeral mappings for 1-20. | Status: not_done
- [ ] **Create formal/casual vocabulary mapping** -- Create `src/data/formal-casual-vocab.ts` with bidirectional mappings (please provide/give me, regarding/about, commence/start, utilize/use, subsequently/then, purchase/buy, assistance/help, inquire/ask, etc.). | Status: not_done
- [ ] **Create abbreviation table** -- Create `src/data/abbreviations.ts` with technical abbreviations (information/info, application/app, configuration/config, etc.) and casual abbreviations (because/bc, please/pls, tomorrow/tmrw, etc.). | Status: not_done
- [ ] **Create injection payloads list** -- Create `src/data/injection-payloads.ts` with the 10 prompt injection payloads listed in the spec. | Status: not_done
- [ ] **Create role confusion prefixes list** -- Create `src/data/role-prefixes.ts` with the 8 role-confusion prefixes listed in the spec. | Status: not_done
- [ ] **Create special character sets** -- Create `src/data/special-characters.ts` with Unicode special character sets organized by category: emoji, RTL characters, zero-width characters, control characters, non-breaking spaces, CJK characters, combining characters, surrogate pair characters. | Status: not_done
- [ ] **Create boundary values list** -- Create `src/data/boundary-values.ts` with the 13 numeric boundary values listed in the spec (0, -1, 1, -0, MAX_SAFE_INTEGER, MIN_SAFE_INTEGER, Infinity, -Infinity, NaN, etc.). | Status: not_done

---

## Phase 4: Perturbation Strategies (8 strategies)

### 4.1 `typo-inject`

- [ ] **Implement `typo-inject` strategy** -- Create `src/strategies/perturbation/typo-inject.ts`. Implement three typo mechanisms: adjacent key swap (using keyboard adjacency map), doubled letter (consonants only), swapped adjacent interior characters. Respect `count`, `maxCount`, `mechanisms`, and `minWordLength` parameters. Produce 3 cases per seed by default (one per mechanism). Risk: low, Family: perturbation. | Status: not_done
- [ ] **Write `typo-inject` unit tests** -- Create `src/__tests__/strategies/perturbation/typo-inject.test.ts`. Test: applicable input produces expected transformations for each mechanism, words shorter than `minWordLength` are not modified, determinism with same PRNG seed, different PRNG seeds produce different typos, non-applicable input (single short word) gracefully handled. | Status: not_done

### 4.2 `case-variation`

- [ ] **Implement `case-variation` strategy** -- Create `src/strategies/perturbation/case-variation.ts`. Implement four modes: all uppercase, all lowercase, title case, random mixed case (using seeded PRNG). Respect `modes` parameter. Produce 4 cases per seed by default. Risk: low. | Status: not_done
- [ ] **Write `case-variation` unit tests** -- Create `src/__tests__/strategies/perturbation/case-variation.test.ts`. Test: each mode produces correct output, `modes` parameter filters output, determinism, mixed case uses PRNG. | Status: not_done

### 4.3 `punctuation-variation`

- [ ] **Implement `punctuation-variation` strategy** -- Create `src/strategies/perturbation/punctuation-variation.ts`. Implement four modes: strip all punctuation, excessive terminal punctuation (configurable `excessiveCount`, default 3), missing terminal punctuation, comma removal. Respect `modes` and `excessiveCount` parameters. Produce 4 cases per seed by default. Risk: low. | Status: not_done
- [ ] **Write `punctuation-variation` unit tests** -- Create `src/__tests__/strategies/perturbation/punctuation-variation.test.ts`. Test: each mode, `excessiveCount` parameter, input without punctuation, input without commas (comma-removal is no-op). | Status: not_done

### 4.4 `number-format`

- [ ] **Implement `number-format` strategy** -- Create `src/strategies/perturbation/number-format.ts`. Implement conversions: digit-to-word (0-20, 30, 40, ..., 100, 1000), word-to-digit, decimal format, Roman numeral (1-20), comma-separated (1000+). Respect `modes` and `maxNumber` parameters. Produce one case per applicable conversion per number found. Seeds with no numbers produce zero cases. Risk: low. | Status: not_done
- [ ] **Write `number-format` unit tests** -- Create `src/__tests__/strategies/perturbation/number-format.test.ts`. Test: each conversion mode, seed with no numbers produces zero cases, seed with multiple numbers, `maxNumber` parameter, boundary numbers (0, 20, 100, 1000). | Status: not_done

### 4.5 `whitespace-variation`

- [ ] **Implement `whitespace-variation` strategy** -- Create `src/strategies/perturbation/whitespace-variation.ts`. Implement modes: extra spaces (double/triple between words), leading/trailing whitespace, tab characters, no-spaces (excluded by default), newline injection. Respect `modes` parameter. Produce 4 cases per seed by default. Risk: low. | Status: not_done
- [ ] **Write `whitespace-variation` unit tests** -- Create `src/__tests__/strategies/perturbation/whitespace-variation.test.ts`. Test: each mode, `no-spaces` is excluded by default, custom modes parameter, single-word input. | Status: not_done

### 4.6 `word-swap`

- [ ] **Implement `word-swap` strategy** -- Create `src/strategies/perturbation/word-swap.ts`. Implement mechanisms: adjacent word swap (configurable `swapCount`, default 1), clause reorder (swap clauses at comma/conjunction), question word movement (move question word to end). Respect `swapCount` and `mechanisms` parameters. Produce 2 cases per seed by default. Risk: low. | Status: not_done
- [ ] **Write `word-swap` unit tests** -- Create `src/__tests__/strategies/perturbation/word-swap.test.ts`. Test: adjacent swap, clause reorder with comma, clause reorder with conjunction, question word movement, input without clauses or question words. | Status: not_done

### 4.7 `synonym-substitute`

- [ ] **Implement `synonym-substitute` strategy** -- Create `src/strategies/perturbation/synonym-substitute.ts`. Replace words with synonyms from the built-in synonym table. Respect `maxReplacements` (default 2) and `customSynonyms` parameters. Produce one case per substitutable word, up to `maxReplacements`. Seeds with no words in the synonym table produce zero cases. Risk: low. | Status: not_done
- [ ] **Write `synonym-substitute` unit tests** -- Create `src/__tests__/strategies/perturbation/synonym-substitute.test.ts`. Test: words in synonym table are replaced, `maxReplacements` limit respected, `customSynonyms` parameter, input with no synonymable words produces zero cases, determinism. | Status: not_done

### 4.8 `contraction-toggle`

- [ ] **Implement `contraction-toggle` strategy** -- Create `src/strategies/perturbation/contraction-toggle.ts`. Toggle between contracted and expanded forms using the bidirectional contraction table. Respect `direction` parameter (`"expand"` | `"contract"` | `"both"`, default `"both"`). Produce 1-2 cases per toggleable form. Seeds with no contractions or expandable forms produce zero cases. Apply the same transformation to `expected` output when applicable. Risk: low. | Status: not_done
- [ ] **Write `contraction-toggle` unit tests** -- Create `src/__tests__/strategies/perturbation/contraction-toggle.test.ts`. Test: expansion, contraction, both directions, `direction` parameter, input with no contractions produces zero cases, `expected` output is also transformed. | Status: not_done

---

## Phase 5: Edge Case Strategies (6 strategies)

### 5.1 `empty-input`

- [ ] **Implement `empty-input` strategy** -- Create `src/strategies/edge-case/empty-input.ts`. Generate: empty string, whitespace only, single character (`.`, `?`, `a`), single word (first word from seed). Respect `modes` parameter. Produce 4 cases per seed by default. Set `expected` to `undefined` (high risk). Note: cases are identical across seeds; deduplication will collapse them. Risk: high. | Status: not_done
- [ ] **Write `empty-input` unit tests** -- Create `src/__tests__/strategies/edge-case/empty-input.test.ts`. Test: each mode produces expected output, `expected` is undefined, `modes` parameter, all seeds produce the same empty/whitespace cases. | Status: not_done

### 5.2 `very-long`

- [ ] **Implement `very-long` strategy** -- Create `src/strategies/edge-case/very-long.ts`. Implement mechanisms: repeat seed text to target length, pad prefix with filler ("context: " repeated), pad suffix with filler. Respect `targetLength` (default 5000) and `mechanisms` parameters. Produce 3 cases per seed. Risk: high. | Status: not_done
- [ ] **Write `very-long` unit tests** -- Create `src/__tests__/strategies/edge-case/very-long.test.ts`. Test: each mechanism produces output near target length, `targetLength` parameter, mechanisms parameter, short seed input. | Status: not_done

### 5.3 `special-chars`

- [ ] **Implement `special-chars` strategy** -- Create `src/strategies/edge-case/special-chars.ts`. Inject characters from 8 categories: emoji, RTL characters, zero-width characters, control characters, non-breaking spaces, CJK characters, combining characters, surrogate pair characters. Respect `categories`, `insertCount` (default 2), and `position` (`"random"` | `"start"` | `"end"` | `"middle"`, default `"random"`) parameters. Produce 8 cases per seed (one per category). Risk: high. | Status: not_done
- [ ] **Write `special-chars` unit tests** -- Create `src/__tests__/strategies/edge-case/special-chars.test.ts`. Test: each character category is injected, `insertCount` parameter, `position` parameter, `categories` filter parameter. | Status: not_done

### 5.4 `numeric-boundaries`

- [ ] **Implement `numeric-boundaries` strategy** -- Create `src/strategies/edge-case/numeric-boundaries.ts`. Replace numbers in seed with each boundary value (0, -1, 1, -0, MAX_SAFE_INTEGER, MIN_SAFE_INTEGER, Infinity, -Infinity, NaN, 1e308, 5e-324, 0.30000000000000004, 999999999999999999). If seed has no numbers, append "The number is {value}". Respect `values` parameter. Produce 13 cases per seed. Risk: high. | Status: not_done
- [ ] **Write `numeric-boundaries` unit tests** -- Create `src/__tests__/strategies/edge-case/numeric-boundaries.test.ts`. Test: number replacement, seed without numbers (appended), `values` parameter filter, each boundary value. | Status: not_done

### 5.5 `repeated-input`

- [ ] **Implement `repeated-input` strategy** -- Create `src/strategies/edge-case/repeated-input.ts`. Generate: word repetition (single word from seed repeated N times), phrase repetition (entire seed repeated N times), character repetition (single character repeated many times). Respect `repeatCount` (default 50) and `mechanisms` parameters. Produce 3 cases per seed. Risk: high. | Status: not_done
- [ ] **Write `repeated-input` unit tests** -- Create `src/__tests__/strategies/edge-case/repeated-input.test.ts`. Test: each repetition mechanism, `repeatCount` parameter, `mechanisms` parameter, output length is proportional to repeat count. | Status: not_done

### 5.6 `multi-language`

- [ ] **Implement `multi-language` strategy** -- Create `src/strategies/edge-case/multi-language.ts`. Inject non-English words: Spanish word substitution, French word substitution, German word substitution, Cyrillic transliteration, mixed script (Mandarin/Arabic/Hindi/Japanese). Respect `languages` (default: spanish, french, german, mixed-script) and `replacementRatio` (default 0.2) parameters. Produce 4 cases per seed. Risk: high. | Status: not_done
- [ ] **Write `multi-language` unit tests** -- Create `src/__tests__/strategies/edge-case/multi-language.test.ts`. Test: each language injection, `languages` parameter, `replacementRatio` parameter, input with no replaceable words. | Status: not_done

---

## Phase 6: Adversarial Strategies (6 strategies)

### 6.1 `negation-inject`

- [ ] **Implement `negation-inject` strategy** -- Create `src/strategies/adversarial/negation-inject.ts`. Implement mechanisms: add "not" before main verb, add "never" replacing temporal/frequency adverbs, double negation (excluded by default), prefix negation ("It's not true that..."). Respect `mechanisms` parameter (default: add-not, add-never, prefix-negation). Produce 3 cases per seed. Risk: high. | Status: not_done
- [ ] **Write `negation-inject` unit tests** -- Create `src/__tests__/strategies/adversarial/negation-inject.test.ts`. Test: each mechanism, `mechanisms` parameter, double-negation excluded by default, input without identifiable verb. | Status: not_done

### 6.2 `prompt-injection`

- [ ] **Implement `prompt-injection` strategy** -- Create `src/strategies/adversarial/prompt-injection.ts`. Prepend/append/inject 10 prompt injection payloads into seed input. Respect `position` (default `"prefix"`) and `payloads` parameters. Produce 10 cases per seed. Risk: high. | Status: not_done
- [ ] **Write `prompt-injection` unit tests** -- Create `src/__tests__/strategies/adversarial/prompt-injection.test.ts`. Test: all 10 default payloads, `position` parameter (prefix/suffix/middle), custom `payloads` parameter, payload text appears in output. | Status: not_done

### 6.3 `role-confusion`

- [ ] **Implement `role-confusion` strategy** -- Create `src/strategies/adversarial/role-confusion.ts`. Prepend 8 role-asserting prefixes ("As an administrator...", "System message:", "[ADMIN]", etc.). Respect `prefixes` parameter. Produce 8 cases per seed. Risk: high. | Status: not_done
- [ ] **Write `role-confusion` unit tests** -- Create `src/__tests__/strategies/adversarial/role-confusion.test.ts`. Test: all 8 default prefixes, custom `prefixes` parameter, prefix appears in output. | Status: not_done

### 6.4 `ambiguous-pronoun`

- [ ] **Implement `ambiguous-pronoun` strategy** -- Create `src/strategies/adversarial/ambiguous-pronoun.ts`. Replace first noun/subject with ambiguous pronouns ("it", "this", "that", "something"). Replace proper nouns with pronouns. Respect `pronouns` parameter. Produce varying cases per seed. Seeds with no identifiable nouns produce fewer cases. Risk: high. | Status: not_done
- [ ] **Write `ambiguous-pronoun` unit tests** -- Create `src/__tests__/strategies/adversarial/ambiguous-pronoun.test.ts`. Test: noun replacement, `pronouns` parameter, input without identifiable nouns, multiple nouns in input. | Status: not_done

### 6.5 `homoglyph`

- [ ] **Implement `homoglyph` strategy** -- Create `src/strategies/adversarial/homoglyph.ts`. Replace ASCII characters with visually identical Cyrillic/Greek/mathematical Unicode characters. Respect `replacementRatio` (default 0.3) and `replaceAll` (default false) parameters. Produce 2 cases per seed (partial replacement + full replacement if `replaceAll` enabled). Risk: high. | Status: not_done
- [ ] **Write `homoglyph` unit tests** -- Create `src/__tests__/strategies/adversarial/homoglyph.test.ts`. Test: replacements use correct Unicode code points, `replacementRatio` parameter, `replaceAll` parameter, output visually resembles input but has different code points. | Status: not_done

### 6.6 `encoding-trick`

- [ ] **Implement `encoding-trick` strategy** -- Create `src/strategies/adversarial/encoding-trick.ts`. Encode parts of input using: HTML entities (numeric), URL encoding (%20, %3F, etc.), Unicode escapes (\u0061), base64 fragments, HTML named entities. Respect `methods` (default: html-entity, url-encode, unicode-escape) and `encodingRatio` (default 0.3) parameters. Produce 3 cases per seed. Risk: high. | Status: not_done
- [ ] **Write `encoding-trick` unit tests** -- Create `src/__tests__/strategies/adversarial/encoding-trick.test.ts`. Test: each encoding method, `methods` parameter, `encodingRatio` parameter, encoded output is valid for its encoding type. | Status: not_done

---

## Phase 7: Format Strategies (4 strategies)

### 7.1 `question-to-statement`

- [ ] **Implement `question-to-statement` strategy** -- Create `src/strategies/format/question-to-statement.ts`. Implement heuristic conversions: "What is" -> "Tell me", "How do I" -> "Explain how to", "Can you" -> imperative form, "Why" -> "Explain why", statement to question (prepend "What is"/"How does" and append "?"). Respect `direction` parameter (`"to-statement"` | `"to-question"` | `"both"`, default `"both"`). Produce 1-2 cases per seed. Risk: medium. | Status: not_done
- [ ] **Write `question-to-statement` unit tests** -- Create `src/__tests__/strategies/format/question-to-statement.test.ts`. Test: question-to-statement conversion for each heuristic, statement-to-question, `direction` parameter, input that matches no heuristic. | Status: not_done

### 7.2 `formal-to-casual`

- [ ] **Implement `formal-to-casual` strategy** -- Create `src/strategies/format/formal-to-casual.ts`. Implement formal-to-casual: contract forms, replace formal vocabulary, add informal markers ("hey, " prefix, "thanks!" suffix). Implement casual-to-formal: expand contractions, replace casual vocabulary, remove slang markers, add formal framing. Respect `direction` parameter (default `"both"`). Produce 2 cases per seed. Risk: medium. | Status: not_done
- [ ] **Write `formal-to-casual` unit tests** -- Create `src/__tests__/strategies/format/formal-to-casual.test.ts`. Test: formal-to-casual conversion, casual-to-formal conversion, `direction` parameter, vocabulary replacements. | Status: not_done

### 7.3 `abbreviate`

- [ ] **Implement `abbreviate` strategy** -- Create `src/strategies/format/abbreviate.ts`. Replace words/phrases with abbreviations from the abbreviation table. Support two styles: technical (information/info, application/app, etc.) and casual (because/bc, please/pls, tomorrow/tmrw, etc.). Respect `style` parameter (`"technical"` | `"casual"` | `"both"`, default `"both"`). Produce 1-2 cases per seed depending on abbreviation opportunities. Risk: medium. | Status: not_done
- [ ] **Write `abbreviate` unit tests** -- Create `src/__tests__/strategies/format/abbreviate.test.ts`. Test: technical abbreviations, casual abbreviations, `style` parameter, input with no abbreviation opportunities. | Status: not_done

### 7.4 `verbose`

- [ ] **Implement `verbose` strategy** -- Create `src/strategies/format/verbose.ts`. Implement expansion techniques: filler injection ("I was wondering if you could...", etc.), context padding (add context sentence before the request), verbose phrase substitution ("to" -> "in order to", etc.), politeness padding ("please", "kindly", "if you don't mind"). Respect `techniques` (default: filler, context-pad, politeness) and `expansionFactor` (default 2) parameters. Produce 3 cases per seed. Risk: medium. | Status: not_done
- [ ] **Write `verbose` unit tests** -- Create `src/__tests__/strategies/format/verbose.test.ts`. Test: each expansion technique, `techniques` parameter, `expansionFactor` parameter, output is longer than input. | Status: not_done

---

## Phase 8: CLI

### 8.1 CLI Core

- [ ] **Implement CLI argument parsing** -- Create `src/cli/index.ts` as the CLI entry point. Use `node:util.parseArgs` to parse all flags specified in the spec: `--strategies`, `--families`, `--max-risk`, `--exclude`, `--max-cases`, `--seed`, `--diversity`, `--output`/`-o`, `--format`, `--pretty`, `--input-format`, `--input-field`, `--expected-field`, `--report`, `--report-only`, `--config`, `--version`, `--help`. Add shebang line `#!/usr/bin/env node`. | Status: not_done
- [ ] **Implement seed file loading** -- Support loading seeds from JSON (array of seed objects), JSONL (one seed object per line), and CSV (columns mapped to seed fields). Auto-detect format from file extension. Respect `--input-format`, `--input-field`, and `--expected-field` flags. | Status: not_done
- [ ] **Implement CSV parser** -- Implement a minimal inline CSV parser sufficient for seed files (no embedded newlines, simple quoting). Auto-detect column mapping: look for columns named `input`/`question`/`query` for the input field and `expected`/`answer`/`output` for the expected field. | Status: not_done
- [ ] **Implement configuration file loading** -- Search for `.fewshot-gen.json` in the current directory or `fewshot-gen` key in `package.json`. Merge configuration with CLI flags (CLI flags take precedence). Support `--config` flag for explicit config file path. | Status: not_done
- [ ] **Implement environment variable support** -- Read `FEWSHOT_GEN_SEED`, `FEWSHOT_GEN_MAX_CASES`, `FEWSHOT_GEN_MAX_RISK`, `FEWSHOT_GEN_CONFIG` from `process.env`. Environment variables take precedence over config file but are overridden by CLI flags. | Status: not_done

### 8.2 CLI Output

- [ ] **Implement output format handlers** -- Create `src/cli/formats.ts` with output formatters for JSON, JSONL, CSV, and eval-dataset formats. Handle `--pretty` flag (default true for files, false for piped stdout). | Status: not_done
- [ ] **Implement report formatter** -- Create `src/cli/report.ts` with a human-readable report formatter that outputs to stderr. Include: version, seed count, strategy count, PRNG seed, generation stats (generated/deduped/filtered/output), per-family breakdown with percentages, top strategies, per-seed breakdown, duration. Use ANSI escape codes for coloring (respect `NO_COLOR` env var and `process.stdout.isTTY`). | Status: not_done
- [ ] **Implement exit codes** -- Exit 0 on success, 1 on error (invalid seeds, file not found, generation failure), 2 on usage error (invalid flags, missing seed file, configuration error). | Status: not_done
- [ ] **Implement stdout/file output** -- Write generated cases to stdout by default or to a file when `--output`/`-o` is specified. | Status: not_done

### 8.3 CLI Tests

- [ ] **Write CLI end-to-end tests** -- Create `src/__tests__/cli/cli.test.ts`. Test: invoke with fixture seed file and verify exit code 0 and valid JSON output, `--format jsonl` produces one JSON object per line, `--report` produces report on stderr, invalid file path produces exit code 1, invalid flags produce exit code 2, `--max-cases 5` produces exactly 5 cases, `--version` prints version, `--help` prints usage. | Status: not_done
- [ ] **Write CSV seed loading tests** -- Test loading seeds from CSV with auto-detected and explicit column mappings. | Status: not_done
- [ ] **Write JSONL seed loading tests** -- Test loading seeds from JSONL format. | Status: not_done
- [ ] **Write config file loading tests** -- Test configuration file discovery, merging, and precedence. | Status: not_done

---

## Phase 9: Integration Tests

- [ ] **End-to-end generation test** -- Call `generate()` with 5 realistic seeds and no options. Verify cases are returned, report is populated, and no errors are thrown. | Status: not_done
- [ ] **Strategy filtering integration test** -- Call `generate()` with various strategy/family/risk filters. Verify only expected strategies produce cases. | Status: not_done
- [ ] **`maxCases` limiting integration test** -- Call `generate()` with `maxCases: 10` on 5 seeds. Verify exactly 10 cases are returned spanning multiple strategies. | Status: not_done
- [ ] **Diversity threshold integration test** -- Call `generate()` with `diversityThreshold: 0.5` (aggressive) and `diversityThreshold: 0.99` (permissive). Verify aggressive produces fewer, more diverse cases. | Status: not_done
- [ ] **Expected output propagation integration test** -- Call `generate()` with seeds that have `expected` values. Verify low-risk cases have the seed's expected output and high-risk cases have `undefined`. | Status: not_done
- [ ] **Family balance integration test** -- Call `generate()` with `familyWeights` configured. Verify output distribution approximately matches target weights. | Status: not_done
- [ ] **Determinism integration test** -- Call `generate()` 10 times with the same seeds and options. Verify identical output every time. Call with different `seed` values and verify different output. | Status: not_done

---

## Phase 10: Edge Case Tests

- [ ] **Empty seed array test** -- Call `generate()` with zero seeds. Verify empty output, no error. | Status: not_done
- [ ] **Single seed test** -- Call `generate()` with one seed. Verify cases are generated. | Status: not_done
- [ ] **Single-character input test** -- Seed with `input: "a"`. Verify strategies handle minimal input gracefully. | Status: not_done
- [ ] **Extremely long input test** -- Seed with 10,000-character input. Verify strategies complete without hanging. | Status: not_done
- [ ] **Whitespace-only seed test** -- Seed with only whitespace input. Verify rejected by seed validation. | Status: not_done
- [ ] **Unicode seed content test** -- Seed with CJK, emoji, RTL content. Verify strategies handle non-ASCII gracefully. | Status: not_done
- [ ] **`maxCases: 1` test** -- Verify exactly one case is returned. | Status: not_done
- [ ] **`maxCases: 0` test** -- Verify empty output. | Status: not_done
- [ ] **`diversityThreshold: 0.0` test** -- Verify aggressive dedup (only one per unique token set). | Status: not_done
- [ ] **`diversityThreshold: 1.0` test** -- Verify no cases removed by diversity filtering. | Status: not_done
- [ ] **All strategies excluded test** -- Exclude all strategies. Verify empty output and warning in report. | Status: not_done

---

## Phase 11: Performance

- [ ] **Performance benchmark: 5 seeds** -- Benchmark `generate()` with 5 seeds, all strategies, no limit. Verify < 50ms. | Status: not_done
- [ ] **Performance benchmark: 20 seeds** -- Benchmark with 20 seeds, all strategies, no limit. Verify < 200ms. | Status: not_done
- [ ] **Performance benchmark: 100 seeds** -- Benchmark with 100 seeds, all strategies, no limit. Verify < 1s. | Status: not_done
- [ ] **Performance benchmark: deduplication 2000 cases** -- Verify deduplication of 2000 cases completes in < 20ms. | Status: not_done
- [ ] **Performance benchmark: diversity filtering 2000 cases** -- Verify diversity filtering of 2000 cases completes in < 100ms. | Status: not_done
- [ ] **Performance benchmark: diversity filtering 10000 cases** -- Verify diversity filtering of 10000 cases (with MinHash) completes in < 2s. | Status: not_done

---

## Phase 12: Documentation & Publishing

- [ ] **Write README.md** -- Create a comprehensive README with: package description, installation, quick start, API reference (`generate`, `createGenerator`, all options), strategy catalog (all 24 strategies with examples), CLI usage guide, configuration file reference, integration examples (eval-dataset, prompt-snap, llm-regression, rag-eval-node-ts, promptfoo), environment variables. | Status: not_done
- [ ] **Add JSDoc comments to all public exports** -- Add JSDoc comments to all exported functions, interfaces, and types in `src/index.ts`, `src/types.ts`, `src/generator.ts`. | Status: not_done
- [ ] **Verify zero runtime dependencies** -- Confirm `package.json` has no `dependencies` (only `devDependencies`). Confirm no external packages are imported at runtime. | Status: not_done
- [ ] **Verify TypeScript declarations** -- Run `tsc` and confirm `.d.ts` files are generated in `dist/`. Verify all public types are accessible from the compiled output. | Status: not_done
- [ ] **Version bump for release** -- Bump version in `package.json` according to semver (patch for fixes, minor for features, major for breaking changes). | Status: not_done
- [ ] **Publish to npm** -- Follow the monorepo workflow: merge PR to master, pull latest, `npm publish`. | Status: not_done
