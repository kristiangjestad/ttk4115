// Flervalgsoppgaver fra de nyeste eksamenene (samme format som årets eksamen).
// Fasit hentet fra løsningsforslagene.
export interface MC {
  exam: string
  num: number
  options: string[]
  answer: string[]
  topic: string
}

const L = (n: number) => 'abcdef'.slice(0, n).split('')

export const mcQuestions: MC[] = [
  { exam: '2023', num: 1, options: L(5), answer: ['c'], topic: 'styr-obs' },
  { exam: '2023', num: 2, options: L(5), answer: ['d'], topic: 'eat' },
  { exam: '2023', num: 3, options: L(4), answer: ['a'], topic: 'stabilitet' },
  { exam: '2023', num: 4, options: L(6), answer: ['b'], topic: 'referanse-kr' },
  { exam: '2023', num: 5, options: L(5), answer: ['b'], topic: 'polplassering' },
  { exam: '2023', num: 6, options: L(4), answer: ['a'], topic: 'ekvivalens' },
  { exam: '2023', num: 7, options: L(5), answer: ['e'], topic: 'spektral' },
  { exam: '2024', num: 1, options: L(5), answer: ['b'], topic: 'styr-obs' },
  { exam: '2024', num: 2, options: L(4), answer: ['d'], topic: 'stabilitet' },
  { exam: '2024', num: 3, options: L(6), answer: ['d'], topic: 'diag-jordan' },
  { exam: '2024', num: 4, options: L(5), answer: ['b', 'e'], topic: 'stabilitet' },
  { exam: '2024', num: 5, options: L(6), answer: ['d'], topic: 'polplassering' },
  { exam: '2024', num: 6, options: L(4), answer: ['b'], topic: 'ekvivalens' },
  { exam: '2024', num: 7, options: L(6), answer: ['f'], topic: 'spektral' },
  { exam: '2025-kont', num: 1, options: L(4), answer: ['c'], topic: 'stabilitet' },
  { exam: '2025-kont', num: 2, options: L(5), answer: ['b'], topic: 'eat' },
  { exam: '2025-kont', num: 3, options: L(6), answer: ['f'], topic: 'referanse-kr' },
  { exam: '2025-kont', num: 4, options: L(4), answer: ['a'], topic: 'ekvivalens' },
]

export function mcFor(exam: string, num: number) {
  return mcQuestions.find((q) => q.exam === exam && q.num === num)
}
