import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo, useRef, useState } from 'react'
import { Tex } from '../components/Tex'
import { ago } from '../components/ContinueCard'
import { useHydrated, useSet, useStored } from '../lib/store'
import {
  dayKey, dbSizeBytes, exportDb, importDb, resetDb, streak, useMcHistory, useProblems, useTopicMeta,
  type Event, type ExamRun,
} from '../lib/db'
import { fmtDuration } from '../lib/useTimeTracker'
import { examShort, tierInfo, topics, type Tier } from '../data/topics'
import { mcQuestions } from '../data/mc'

export const Route = createFileRoute('/fremgang')({
  head: () => ({ meta: [{ title: 'Min fremgang · TTK4115' }] }),
  component: Fremgang,
})

const EV: Event[] = []
const RUNS: ExamRun[] = []

const evText: Record<Event['t'], string> = {
  visit: 'Åpnet',
  status: 'Merket',
  solution: 'Så løsningsforslag',
  mc: 'Flervalg',
  'topic-done': 'Gjort',
  'topic-undone': 'Angret gjort',
  confidence: 'Selvtillit',
  'exam-start': 'Startet på tid',
  'exam-end': 'Leverte',
  note: 'Notat',
}

function Fremgang() {
  const hydrated = useHydrated()
  const [problems] = useProblems()
  const [meta] = useTopicMeta()
  const [events] = useStored<Event[]>('events', EV)
  const [runs] = useStored<ExamRun[]>('exam-runs', RUNS)
  const [mcHist] = useMcHistory()
  const done = useSet('done-topics')
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState('')

  const days = useMemo(() => {
    const out: { key: string; label: string; n: number; secs: number }[] = []
    const byDay = new Map<string, number>()
    for (const e of events) byDay.set(dayKey(e.at), (byDay.get(dayKey(e.at)) ?? 0) + 1)
    for (let i = 13; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = dayKey(d.getTime())
      out.push({ key, label: d.toLocaleDateString('nb-NO', { weekday: 'short' }).slice(0, 2), n: byDay.get(key) ?? 0, secs: 0 })
    }
    return out
  }, [events])

  if (!hydrated) return <main className="wrap muted py-8">Laster …</main>

  const recs = Object.entries(problems)
  const totalSecs = recs.reduce((s, [, r]) => s + (r.seconds ?? 0), 0)
  const okList = recs.filter(([, r]) => r.status === 'ok')
  const againList = recs.filter(([, r]) => r.status === 'igjen').sort((a, b) => (b[1].lastVisit ?? 0) - (a[1].lastVisit ?? 0))
  const notes = recs.filter(([, r]) => r.note?.trim())
  const mcOk = mcHist.filter((h) => h.ok).length
  const maxDay = Math.max(1, ...days.map((d) => d.n))
  const st = streak(events)
  const unsure = topics.filter((t) => meta[t.id]?.confidence === 1)

  return (
    <main className="wrap py-10">
      <div className="eyebrow mb-3">Lagret lokalt</div>
        <h1 className="display mt-0 mb-3 text-[40px] sm:text-[52px]">Min fremgang</h1>
      <p className="lede mt-0 mb-8 text-[15px]">{(dbSizeBytes() / 1024).toFixed(1)} kB i nettleseren.</p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Oppgaver klart" value={okList.length} />
        <Stat label="Tid brukt" value={fmtDuration(totalSecs)} />
        <Stat label="Flervalg riktig" value={mcHist.length ? `${Math.round((mcOk / mcHist.length) * 100)} %` : '–'} sub={`${mcHist.length} svar`} />
        <Stat label="Dager på rad" value={st} />
      </div>

      <section className="card mt-4 p-4">
        <h2 className="mt-0 mb-3 text-[17px] font-bold tracking-tight">Siste 14 dager</h2>
        <div className="flex h-24 items-end gap-1">
          {days.map((d) => (
            <div key={d.key} className="flex flex-1 flex-col items-center gap-1" title={`${d.key}: ${d.n} handlinger`}>
              <div className="w-full rounded-t" style={{ height: `${(d.n / maxDay) * 72}px`, minHeight: d.n ? 3 : 1, background: d.n ? 'var(--accent)' : 'var(--line)' }} />
              <span className="muted text-[10px]">{d.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="card mt-4 p-4">
        <h2 className="mt-0 mb-3 text-[17px] font-bold tracking-tight">Per nivå</h2>
        {([1, 2, 3, 4] as Tier[]).map((tier) => {
          const list = topics.filter((t) => t.tier === tier)
          const d = list.filter((t) => done.has(t.id)).length
          const sit = list.filter((t) => meta[t.id]?.confidence === 3).length
          return (
            <div key={tier} className="mb-2 text-sm">
              <div className="flex justify-between">
                <span className="font-semibold">
                  {tier}. {tierInfo[tier].name}
                </span>
                <span className="muted">
                  {d}/{list.length} gjort · {sit} sitter
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full" style={{ background: 'var(--line)' }}>
                <div className="h-full" style={{ width: `${(d / list.length) * 100}%`, background: 'var(--ok)' }} />
              </div>
            </div>
          )
        })}
      </section>

      {unsure.length > 0 && (
        <section className="card mt-4 p-4">
          <h2 className="mt-0 mb-3 text-[17px] font-bold tracking-tight">Merket som usikker</h2>
          <ul className="m-0 grid gap-1 pl-5 text-sm">
            {unsure.map((t) => (
              <li key={t.id}>
                <Link to="/" hash={t.id}>
                  <Tex>{t.title}</Tex>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card mt-4 p-4">
        <h2 className="mt-0 mb-3 text-[17px] font-bold tracking-tight">Øv igjen ({againList.length})</h2>
        {againList.length === 0 ? (
          <p className="muted m-0 text-sm">Ingen.</p>
        ) : (
          <ul className="m-0 grid gap-1 pl-5 text-sm">
            {againList.map(([k, r]) => {
              const [exam, num] = k.split(':')
              return (
                <li key={k}>
                  <Link to="/oppgave/$exam/$num" params={{ exam, num }}>
                    {examShort(exam)} oppgave {num}
                  </Link>{' '}
                  <span className="muted">· {r.lastVisit ? ago(r.lastVisit) : ''} · {fmtDuration(r.seconds)}</span>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {notes.length > 0 && (
        <section className="card mt-4 p-4">
          <h2 className="mt-0 mb-3 text-[17px] font-bold tracking-tight">Mine notater</h2>
          <ul className="m-0 grid gap-2 pl-5 text-sm">
            {notes.map(([k, r]) => {
              const [exam, num] = k.split(':')
              return (
                <li key={k}>
                  <Link to="/oppgave/$exam/$num" params={{ exam, num }}>
                    {examShort(exam)} opg. {num}
                  </Link>
                  : <span style={{ whiteSpace: 'pre-wrap' }}>{r.note}</span>
                </li>
              )
            })}
            {topics
              .filter((t) => meta[t.id]?.note?.trim())
              .map((t) => (
                <li key={t.id}>
                  <Link to="/" hash={t.id}>
                    <Tex>{t.title}</Tex>
                  </Link>
                  : <span style={{ whiteSpace: 'pre-wrap' }}>{meta[t.id]?.note}</span>
                </li>
              ))}
          </ul>
        </section>
      )}

      {runs.length > 0 && (
        <section className="card mt-4 p-4">
          <h2 className="mt-0 mb-3 text-[17px] font-bold tracking-tight">Eksamener på tid</h2>
          <ul className="m-0 grid gap-1 pl-5 text-sm">
            {runs
              .slice()
              .reverse()
              .map((r, i) => (
                <li key={i}>
                  <Link to="/eksamen/$exam" params={{ exam: r.exam }}>
                    {examShort(r.exam)}
                  </Link>{' '}
                  · {new Date(r.startedAt).toLocaleString('nb-NO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} ·{' '}
                  {fmtDuration(r.seconds)}
                  {r.completed ? '' : ' · avbrutt'}
                </li>
              ))}
          </ul>
        </section>
      )}

      <section className="card mt-4 p-4">
        <h2 className="mt-0 mb-3 text-[17px] font-bold tracking-tight">Aktivitet</h2>
        {events.length === 0 ? (
          <p className="muted m-0 text-sm">Ingen aktivitet ennå.</p>
        ) : (
          <ul className="m-0 grid list-none gap-0.5 p-0 text-sm">
            {events
              .slice(-25)
              .reverse()
              .map((e, i) => (
                <li key={i} className="flex gap-2">
                  <span className="muted w-24 shrink-0 text-xs">{ago(e.at)}</span>
                  <span>
                    {evText[e.t]} {e.ref ? labelRef(e.ref) : ''}
                    {e.t === 'status' ? (e.v === 'ok' ? ' ✓' : ' ↻') : ''}
                    {e.t === 'mc' ? (e.v ? ' ✓' : ' ✗') : ''}
                  </span>
                </li>
              ))}
          </ul>
        )}
      </section>

      <section className="card mt-4 p-4">
        <h2 className="mt-0 mb-3 text-[17px] font-bold tracking-tight">Sikkerhetskopi</h2>
        <p className="muted mt-0 text-sm">Forsvinner hvis du tømmer nettleserdata. Eksporter innimellom.</p>
        <div className="flex flex-wrap gap-2">
          <button
            className="btn btn-primary"
            onClick={() => {
              const blob = new Blob([JSON.stringify(exportDb(), null, 1)], { type: 'application/json' })
              const a = document.createElement('a')
              a.href = URL.createObjectURL(blob)
              a.download = `ttk4115-fremgang-${dayKey(Date.now())}.json`
              a.click()
              URL.revokeObjectURL(a.href)
            }}
          >
            Eksporter
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()}>
            Importer …
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={async (e) => {
              const f = e.target.files?.[0]
              e.target.value = ''
              if (!f) return
              try {
                const json = JSON.parse(await f.text())
                if (!confirm('Importere? Erstatter all fremgang.')) return
                importDb(json)
                setMsg('Importert.')
              } catch {
                setMsg('Kunne ikke lese filen.')
              }
            }}
          />
          <button
            className="btn"
            style={{ color: 'var(--bad)' }}
            onClick={() => {
              if (confirm('Slette ALL fremgang? Kan ikke angres.')) {
                resetDb()
                setMsg('Alt er slettet.')
              }
            }}
          >
            Slett alt
          </button>
          {msg && <span className="self-center text-sm">{msg}</span>}
        </div>
      </section>
      <p className="muted mt-4 text-xs">{mcQuestions.length} flervalg · {topics.length} oppgavetyper</p>
    </main>
  )
}

function labelRef(ref: string) {
  if (ref.includes(':')) {
    const [e, n] = ref.split(':')
    return `${examShort(e)} opg. ${n}`
  }
  const t = topics.find((x) => x.id === ref)
  if (t) return t.title.replace(/\$[^$]*\$/g, '').trim()
  return examShort(ref)
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="card p-3">
      <div className="muted text-xs">{label}</div>
      <div className="text-2xl font-black">{value}</div>
      {sub && <div className="muted text-xs">{sub}</div>}
    </div>
  )
}
