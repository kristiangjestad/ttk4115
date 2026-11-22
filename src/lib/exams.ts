import raw from '../data/exams.json'

export interface ExamProblem {
  num: number
  page: number
  endPage: number
  pct: number | null
  snippet: string
  solPage: number | null
  solEndPage: number | null
}
export interface Exam {
  id: string
  dir: string
  solDir: string | null
  year: number
  kont: boolean
  pages: number
  solPages: number
  problems: ExamProblem[]
}

export const exams = (raw as Exam[]).slice().sort((a, b) => b.year * 10 + (b.kont ? 0 : 5) - (a.year * 10 + (a.kont ? 0 : 5)))

export function getExam(id: string) {
  return exams.find((e) => e.id === id)
}

export function pageUrl(dir: string, n: number) {
  return `/sider/${dir}/${n}.jpg`
}

export function range(a: number, b: number) {
  const r: number[] = []
  for (let i = a; i <= b; i++) r.push(i)
  return r
}

export const LANG: Record<string, string> = {}
for (const e of exams) LANG[e.id] = e.year < 2016 ? 'norsk + engelsk' : 'engelsk'
