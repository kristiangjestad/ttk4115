// «Databasen»: typede tabeller oppå localStorage. All tilstand i appen går gjennom her.
//
//  nøkkel            innhold
//  ─────────────────────────────────────────────────────────────
//  meta              { schema, createdAt }
//  done-topics       string[]                        oppgavetyper merket «Gjort»
//  topic-meta        Record<topicId, TopicMeta>      selvtillit, notat, åpen/lukket
//  problems          Record<"eksamen:nr", ProblemRec> status, forsøk, tid, notat, løsningsvisninger
//  last-visit        Visit | null                    «Fortsett der du slapp»
//  mc-results        Record<"eksamen:nr", boolean>   siste svar per flervalg
//  mc-history        McAttempt[]                     alle flervalgsforsøk
//  mc-session        McSession | null                pågående flervalgsøkt
//  exam-timers       Record<eksamen, ExamTimer>      pågående «på tid»-økter
//  exam-runs         ExamRun[]                       fullførte «på tid»-økter
//  events            Event[]                         aktivitetslogg (maks 3000)
//  husk              string[]                        huskeliste
//  ui:*              diverse visningsvalg
import { allKeys, getStored, invalidate, PREFIX, setStored, updateStored, useStored } from './store'

export const SCHEMA = 2

export type Status = 'ok' | 'igjen'
export type Confidence = 1 | 2 | 3

export interface ProblemRec {
  status?: Status
  attempts: { at: number; result: Status }[]
  solutionViews: number
  seconds: number
  firstVisit?: number
  lastVisit?: number
  visits: number
  note?: string
}

export interface TopicMeta {
  confidence?: Confidence
  note?: string
  open?: boolean
  updatedAt?: number
}

export interface Visit {
  exam: string
  num: number
  tema?: string
  at: number
}

export interface McAttempt {
  key: string
  picked: string[]
  ok: boolean
  at: number
}

export interface McSession {
  order: string[]
  i: number
  answered: boolean
  picked: string[]
  startedAt: number
  onlyWrong: boolean
  paused?: boolean
}

export interface ExamTimer {
  startedAt: number
  pausedAt?: number
  pausedTotal: number
}

export interface ExamRun {
  exam: string
  startedAt: number
  endedAt: number
  seconds: number
  completed: boolean
}

export type EventType =
  | 'visit'
  | 'status'
  | 'solution'
  | 'mc'
  | 'topic-done'
  | 'topic-undone'
  | 'confidence'
  | 'exam-start'
  | 'exam-end'
  | 'note'

export interface Event {
  t: EventType
  at: number
  ref?: string
  v?: string | number | boolean
}

const EMPTY_PROBLEM: ProblemRec = { attempts: [], solutionViews: 0, seconds: 0, visits: 0 }
const EMPTY_OBJ = {}
const EMPTY_ARR: never[] = []

export const pkey = (exam: string, num: number | string) => `${exam}:${num}`

// ── Oppstart / migrering ──
export function initDb() {
  const meta = getStored<{ schema: number; createdAt: number } | null>('meta', null)
  if (meta?.schema === SCHEMA) return
  // v1 → v2: problem-status flyttes inn i problems
  const old = getStored<Record<string, Status> | null>('problem-status', null)
  if (old) {
    updateStored<Record<string, ProblemRec>>('problems', {}, (p) => {
      const out = { ...p }
      for (const [k, s] of Object.entries(old)) out[k] = { ...EMPTY_PROBLEM, ...out[k], status: s }
      return out
    })
    setStored('problem-status', undefined)
  }
  setStored('meta', { schema: SCHEMA, createdAt: meta?.createdAt ?? Date.now() })
}

// ── Hendelseslogg ──
export function logEvent(t: EventType, ref?: string, v?: Event['v']) {
  updateStored<Event[]>('events', [], (e) => {
    const next = [...e, { t, at: Date.now(), ref, v }]
    return next.length > 3000 ? next.slice(-3000) : next
  })
}

// ── Oppgaver ──
export function useProblems() {
  return useStored<Record<string, ProblemRec>>('problems', EMPTY_OBJ)
}

export function getProblem(k: string): ProblemRec {
  return { ...EMPTY_PROBLEM, ...getStored<Record<string, ProblemRec>>('problems', {})[k] }
}

export function updateProblem(k: string, fn: (p: ProblemRec) => ProblemRec) {
  updateStored<Record<string, ProblemRec>>('problems', {}, (all) => ({ ...all, [k]: fn({ ...EMPTY_PROBLEM, ...all[k] }) }))
}

export function setProblemStatus(k: string, s: Status) {
  updateProblem(k, (p) => ({ ...p, status: s, attempts: [...p.attempts, { at: Date.now(), result: s }] }))
  logEvent('status', k, s)
}

export function recordVisit(exam: string, num: number, tema?: string) {
  const k = pkey(exam, num)
  const now = Date.now()
  updateProblem(k, (p) => ({ ...p, visits: p.visits + 1, firstVisit: p.firstVisit ?? now, lastVisit: now }))
  setStored<Visit>('last-visit', { exam, num, tema, at: now })
  logEvent('visit', k)
}

export function addSeconds(k: string, s: number) {
  if (s <= 0) return
  updateProblem(k, (p) => ({ ...p, seconds: p.seconds + s }))
}

export function recordSolutionView(k: string) {
  updateProblem(k, (p) => ({ ...p, solutionViews: p.solutionViews + 1 }))
  logEvent('solution', k)
}

// ── Oppgavetyper ──
export function useTopicMeta() {
  return useStored<Record<string, TopicMeta>>('topic-meta', EMPTY_OBJ)
}

export function updateTopicMeta(id: string, patch: Partial<TopicMeta>) {
  updateStored<Record<string, TopicMeta>>('topic-meta', {}, (all) => ({ ...all, [id]: { ...all[id], ...patch, updatedAt: Date.now() } }))
}

// ── Flervalg ──
export function recordMc(key: string, picked: string[], ok: boolean) {
  updateStored<Record<string, boolean>>('mc-results', {}, (r) => ({ ...r, [key]: ok }))
  updateStored<McAttempt[]>('mc-history', [], (h) => [...h, { key, picked, ok, at: Date.now() }])
  logEvent('mc', key, ok)
}

export function useMcHistory() {
  return useStored<McAttempt[]>('mc-history', EMPTY_ARR)
}

// ── Eksport / import / nullstilling ──
export function exportDb() {
  const data: Record<string, unknown> = {}
  for (const k of allKeys()) data[k] = getStored(k, null)
  return { app: 'ttk4115-ovelse', schema: SCHEMA, exportedAt: new Date().toISOString(), data }
}

export function importDb(json: unknown) {
  const obj = json as { app?: string; data?: Record<string, unknown> }
  if (obj?.app !== 'ttk4115-ovelse' || typeof obj.data !== 'object' || !obj.data) throw new Error('Ugyldig fil')
  resetDb()
  for (const [k, v] of Object.entries(obj.data)) {
    try {
      window.localStorage.setItem(PREFIX + k, JSON.stringify(v))
    } catch {}
  }
  invalidate()
  initDb()
}

export function resetDb() {
  for (const k of allKeys()) {
    try {
      window.localStorage.removeItem(PREFIX + k)
    } catch {}
  }
  invalidate()
}

export function dbSizeBytes() {
  let n = 0
  for (const k of allKeys()) {
    try {
      n += (window.localStorage.getItem(PREFIX + k)?.length ?? 0) + k.length
    } catch {}
  }
  return n * 2
}

// ── Statistikk ──
export function dayKey(ts: number) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function streak(events: Event[]) {
  const days = new Set(events.map((e) => dayKey(e.at)))
  let n = 0
  const d = new Date()
  if (!days.has(dayKey(d.getTime()))) d.setDate(d.getDate() - 1) // i går teller fortsatt
  while (days.has(dayKey(d.getTime()))) {
    n++
    d.setDate(d.getDate() - 1)
  }
  return n
}
