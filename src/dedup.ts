import { GeneratedCase } from './types'

function jaccardSimilarity(a: string, b: string): number {
  const tokA = new Set(a.toLowerCase().split(/\s+/))
  const tokB = new Set(b.toLowerCase().split(/\s+/))
  const intersection = [...tokA].filter(t => tokB.has(t)).length
  const union = tokA.size + tokB.size - intersection
  if (union === 0) return 1
  return intersection / union
}

export function deduplicateCases(cases: GeneratedCase[], threshold: number): GeneratedCase[] {
  const kept: GeneratedCase[] = []
  for (const c of cases) {
    const isDuplicate = kept.some(k => jaccardSimilarity(k.input, c.input) >= threshold)
    if (!isDuplicate) kept.push(c)
  }
  return kept
}
