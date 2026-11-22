import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { MCAnswer } from '../components/MCAnswer'
import { Pages } from '../components/Pages'
import { Tex } from '../components/Tex'
import { mcQuestions, type MC } from '../data/mc'
import { examLabel, examShort, topics } from '../data/topics'
import { getExam } from '../lib/exams'
import { useHydrated, useStored } from '../lib/store'
import { recordMc, recordSolutionView, setProblemStatus, useMcHistory, type McSession } from '../lib/db'
import { ago } from '../components/ContinueCard'

export const Route = createFileRoute('/flervalg')({
  head: () => ({ meta: [{ title: 'Flervalg · TTK4115' }] }),
  component: Flervalg,
})

function shuffle<T>(a: T[]) {
  const r = a.slice()
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[r[i], r[j]] = [r[j], r[i]]
  }
  return r
}

const k = (q: MC) => `${q.exam}:${q.num}`
const byKey = new Map(mcQuestions.map((q) => [k(q), q]))
const EMPTY = {}

function Flervalg() {
  const hydrated = useHydrated()
  const [results, setResults] = useStored<Record<string, boolean>>('mc-results', EMPTY)
  const [session, setSession] = useStored<McSession | null>('mc-session', null)
  const [history] = useMcHistory()
  const [showSol, setShowSol] = useState(false)

  const right = mcQuestions.filter((q) => results[k(q)] === true).length
  const tried = mcQuestions.filter((q) => k(q) in results).length

  const start = (onlyWrong: boolean) => {
    const pool = onlyWrong ? mcQuestions.filter((q) => results[k(q)] !== true) : mcQuestions
    setSession({
      order: shuffle(pool.length ? pool : mcQuestions).map(k),
      i: 0,
      answered: false,
      picked: [],
      startedAt: Date.now(),
      onlyWrong,
    })
    setShowSol(false)
  }

  const byTopic = useMemo(() => {
    const m = new Map<string, MC[]>()
    for (const q of mcQuestions) m.set(q.topic, [...(m.get(q.topic) ?? []), q])
    return m
  }, [])

  // Forsøk per oppgave fra historikken
  const stats = useMemo(() => {
    const m = new Map<string, { n: number; ok: number }>()
    for (const h of history) {
      const s = m.get(h.key) ?? { n: 0, ok: 0 }
      s.n++
      if (h.ok) s.ok++
      m.set(h.key, s)
    }
    return m
  }, [history])

  if (!hydrated || !session || session.paused) {
    const lastRuns = history.slice(-1)[0]
    return (
      <main className="wrap py-10">
        <div className="eyebrow mb-3">18 oppgaver · 2023–2025</div>
        <h1 className="display mt-0 mb-3 text-[40px] sm:text-[52px]">Flervalgsdrill</h1>
        <div className="grid items-center gap-8 sm:grid-cols-[1fr_auto]">
          <p className="lede m-0">
            Alle {mcQuestions.length} flervalgsoppgavene fra 2023, 2024 og kont 2025 i tilfeldig rekkefølge, med fasit fra løsningsforslagene. Typene
            kommer igjen hvert år med nye tall – klarer du disse, har du rundt en tredjedel av eksamen i boks.
          </p>
          <ScoreRing right={hydrated ? right : 0} total={mcQuestions.length} />
        </div>
        {hydrated && (
          <p className="muted mt-4 mb-5 text-[13px]">
            {tried} forsøkt · {history.length} svar totalt{lastRuns ? ` · sist øvd ${ago(lastRuns.at)}` : ''}
          </p>
        )}
        <div className="mt-5 flex flex-wrap gap-2">
          {hydrated && session?.paused && session.i < session.order.length && (
            <button className="btn btn-accent" onClick={() => setSession({ ...session, paused: false })}>
              Fortsett økten ({session.i + 1}/{session.order.length})
            </button>
          )}
          <button className={hydrated && session?.paused ? 'btn' : 'btn btn-accent'} onClick={() => start(false)}>
            Start alle {mcQuestions.length}
          </button>
          <button className="btn" onClick={() => start(true)}>
            Bare de jeg ikke har klart ({mcQuestions.length - (hydrated ? right : 0)})
          </button>
          {hydrated && tried > 0 && (
            <button
              className="btn btn-ghost"
              onClick={() => {
                if (confirm('Nullstille siste-svar-oversikten? Historikken beholdes.')) setResults({})
              }}
            >
              Nullstill
            </button>
          )}
        </div>
        <h2 className="mt-10 mb-3 text-[17px] font-bold tracking-tight">Etter oppgavetype</h2>
        <ol className="rows">
          {[...byTopic.entries()].map(([tid, qs]) => {
            const t = topics.find((x) => x.id === tid)!
            return (
              <li key={tid} className="row flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
                <Link to="/" hash={tid} className="serif min-w-0 flex-1 text-[16px] font-semibold no-underline" style={{ color: 'var(--fg)', minWidth: 220 }}>
                  <Tex>{t.title}</Tex>
                </Link>
                <span className="flex flex-wrap gap-1.5">
                  {qs.map((q) => {
                    const st = stats.get(k(q))
                    const r = hydrated ? results[k(q)] : undefined
                    return (
                      <Link
                        key={k(q)}
                        to="/oppgave/$exam/$num"
                        params={{ exam: q.exam, num: String(q.num) }}
                        search={{ tema: tid }}
                        className="chip no-underline"
                        title={st ? `${st.ok} av ${st.n} riktige` : 'Ikke forsøkt'}
                        style={
                          r === true ? { background: 'var(--ok-soft)', color: 'var(--ok)' } : r === false ? { background: 'var(--bad-soft)', color: 'var(--bad)' } : undefined
                        }
                      >
                        {r === true ? '✓ ' : r === false ? '✗ ' : ''}
                        {examShort(q.exam)} · {q.num}
                      </Link>
                    )
                  })}
                </span>
              </li>
            )
          })}
        </ol>
      </main>
    )
  }

  const order = session.order.map((x) => byKey.get(x)).filter(Boolean) as MC[]

  if (session.i >= order.length) {
    const sessionHist = history.filter((h) => h.at >= session.startedAt)
    const lastPer = new Map(sessionHist.map((h) => [h.key, h.ok]))
    const sessionRight = [...lastPer.values()].filter(Boolean).length
    return (
      <main className="wrap py-10">
        <h1 className="display mt-0 mb-3 text-[40px] sm:text-[52px]">
          {sessionRight} av {order.length} riktige
        </h1>
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={() => start(true)}>
            Ta de jeg bommet på
          </button>
          <button className="btn" onClick={() => setSession(null)}>
            Tilbake
          </button>
        </div>
      </main>
    )
  }

  const q = order[session.i]
  const exam = getExam(q.exam)!
  const p = exam.problems.find((x) => x.num === q.num)!
  const t = topics.find((x) => x.id === q.topic)!
  return (
    <main className="wrap py-6">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <strong>
          {session.i + 1} / {order.length}
        </strong>
        <span className="muted">
          {examLabel(q.exam)} opg. {q.num} ·{' '}
        </span>
        <Link to="/" hash={t.id}>
          <Tex>{t.title}</Tex>
        </Link>
        <button className="btn ml-auto" onClick={() => setSession({ ...session, paused: true })} title="Økten lagres – du kan fortsette senere">
          Pause
        </button>
      </div>
      <Pages dir={exam.dir} from={p.page} to={p.endPage} alt={`${examLabel(q.exam)} oppgave ${q.num}`} />
      <MCAnswer
        q={q}
        restore={session.answered ? session.picked : undefined}
        onResult={(ok, picked) => {
          recordMc(k(q), picked, ok)
          setProblemStatus(k(q), ok ? 'ok' : 'igjen')
          setSession((s) => (s ? { ...s, answered: true, picked } : s))
        }}
      />
      {session.answered && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            className="btn"
            onClick={() => {
              if (!showSol) recordSolutionView(k(q))
              setShowSol(!showSol)
            }}
          >
            {showSol ? 'Skjul' : 'Vis'} løsningsforslag
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              setSession((s) => (s ? { ...s, i: s.i + 1, answered: false, picked: [] } : s))
              setShowSol(false)
              window.scrollTo(0, 0)
            }}
          >
            Neste →
          </button>
        </div>
      )}
      {showSol && exam.solDir && p.solPage && (
        <div className="mt-4">
          <Pages dir={exam.solDir} from={p.solPage} to={p.solEndPage ?? p.solPage} alt="Løsningsforslag" />
        </div>
      )}
    </main>
  )
}

function ScoreRing({ right, total }: { right: number; total: number }) {
  const r = 34
  const c = 2 * Math.PI * r
  const f = total ? right / total : 0
  return (
    <div className="relative mx-auto h-[92px] w-[92px] sm:mx-0" aria-label={`${right} av ${total} riktige`}>
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--line)" strokeWidth="7" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="var(--ok)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${c * f} ${c}`}
          opacity={f > 0 ? 1 : 0}
          style={{ transition: 'stroke-dasharray .6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <div className="text-[22px] leading-none font-bold tabular-nums">{right}</div>
        <div className="faint mt-0.5 text-[10px] font-semibold tracking-wide uppercase">av {total}</div>
      </div>
    </div>
  )
}
