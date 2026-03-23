import { SeedExample, GeneratedCase } from '../types'

const adjacentKeys: Record<string, string> = {
  a: 's', b: 'v', c: 'x', d: 's', e: 'r', f: 'g', g: 'f', h: 'j',
  i: 'o', j: 'h', k: 'l', l: 'k', m: 'n', n: 'm', o: 'i', p: 'o',
  q: 'w', r: 'e', s: 'a', t: 'r', u: 'y', v: 'b', w: 'q', x: 'z',
  y: 'u', z: 'x',
}

function injectAdjacentKey(word: string): string {
  for (let i = 0; i < word.length; i++) {
    const lower = word[i].toLowerCase()
    if (adjacentKeys[lower]) {
      const replacement = adjacentKeys[lower]
      return word.slice(0, i) + replacement + word.slice(i + 1)
    }
  }
  return word
}

function doubleALetter(word: string): string {
  for (let i = 0; i < word.length; i++) {
    if (/[a-zA-Z]/.test(word[i])) {
      return word.slice(0, i) + word[i] + word[i] + word.slice(i + 1)
    }
  }
  return word
}

function swapAdjacent(word: string): string {
  if (word.length < 2) return word
  return word[1] + word[0] + word.slice(2)
}

export const typoInject = {
  id: 'typo-inject',
  family: 'perturbation' as const,
  risk: 'low' as const,
  apply(seed: SeedExample, rng: () => number): GeneratedCase[] {
    const input = seed.input
    if (input.length < 5) return []

    const words = input.split(/\s+/).filter(Boolean)
    if (words.length === 0) return []

    // Pick a random word index
    const idx = Math.floor(rng() * words.length)
    const word = words[idx]

    const cases: GeneratedCase[] = []

    // Case 1: adjacent key swap
    const adj = injectAdjacentKey(word)
    if (adj !== word) {
      const modified = [...words.slice(0, idx), adj, ...words.slice(idx + 1)].join(' ')
      if (modified !== input) {
        cases.push({
          input: modified,
          expected: seed.expected,
          strategy: 'typo-inject',
          family: 'perturbation',
          seedId: seed.id ?? '',
          tags: ['typo', 'adjacent-key'],
          risk: 'low',
          description: `Injected typo: '${word}' → '${adj}'`,
        })
      }
    }

    // Case 2: double a letter
    const doubled = doubleALetter(word)
    if (doubled !== word) {
      const modified = [...words.slice(0, idx), doubled, ...words.slice(idx + 1)].join(' ')
      if (modified !== input) {
        cases.push({
          input: modified,
          expected: seed.expected,
          strategy: 'typo-inject',
          family: 'perturbation',
          seedId: seed.id ?? '',
          tags: ['typo', 'double-letter'],
          risk: 'low',
          description: `Injected typo: '${word}' → '${doubled}'`,
        })
      }
    }

    // Case 3: swap adjacent chars
    const swapped = swapAdjacent(word)
    if (swapped !== word) {
      const modified = [...words.slice(0, idx), swapped, ...words.slice(idx + 1)].join(' ')
      if (modified !== input) {
        cases.push({
          input: modified,
          expected: seed.expected,
          strategy: 'typo-inject',
          family: 'perturbation',
          seedId: seed.id ?? '',
          tags: ['typo', 'swap-chars'],
          risk: 'low',
          description: `Injected typo: '${word}' → '${swapped}'`,
        })
      }
    }

    return cases.slice(0, 3)
  },
}
