import { createFileRoute, Link } from '@tanstack/react-router'
import { exams } from '../lib/exams'
import { examLabel, topicsFor } from '../data/topics'
import { useHydrated, useStored } from '../lib/store'
import { useProblems, type ExamRun } from '../lib/db'
import { Tex } from '../components/Tex'

export const Route = createFileRoute('/eksamener')({
  head: () => ({ meta: [{ title: 'Gamle eksamener · TTK4115' }] }),
  component: Eksamener,
})

const RUNS: ExamRun[] = []
const TIMERS = {}

function Eksamener() {
  const [problems] = useProblems()
  const [runs] = useStored<ExamRun[]>('exam-runs', RUNS)
  const [timers] = useStored<Record<string, unknown>>('exam-timers', TIMERS)
  const hydrated = useHydrated()
  return (
    <main className="wrap py-10">
      <div className="eyebrow mb-3">25 sett · 2003–2025</div>
      <h1 className="display mt-0 mb-4 text-[40px] sm:text-[52px]">Gamle eksamener</h1>
      <p className="lede mt-0">2021 og senere ligner mest på årets.</p>

      <div className="mt-10 grid gap-10">
        {exams.map((e) => {
          const ok = hydrated ? e.problems.filter((p) => problems[`${e.id}:${p.num}`]?.status === 'ok').length : 0
          const taken = hydrated && runs.some((r) => r.exam === e.id && r.completed)
          const running = hydrated && e.id in timers
          return (
            <section key={e.id}>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <h2 className="serif m-0 text-[22px] font-semibold">{examLabel(e.id)}</h2>
                {e.year >= 2021 && (
                  <span className="tag" style={{ background: 'var(--t1-soft)', color: 'var(--t1)' }}>
                    samme foreleser
                  </span>
                )}
                {!e.solDir && <span className="chip">uten fasit</span>}
                {ok > 0 && (
                  <span className="chip" style={{ background: 'var(--ok-soft)', color: 'var(--ok)' }}>
                    {ok}/{e.problems.length}
                  </span>
                )}
                {taken && <span className="chip">✓ på tid</span>}
                {running && (
                  <span className="chip" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                    ● pågår
                  </span>
                )}
                <Link to="/eksamen/$exam" params={{ exam: e.id }} className="btn btn-sm ml-auto">
                  {running ? 'Fortsett' : 'På tid'}
                </Link>
              </div>
              {e.problems.length > 0 && (
                <ol className="rows">
                  {e.problems.map((p) => {
                    const ts = topicsFor(e.id, p.num)
                    const st = hydrated ? problems[`${e.id}:${p.num}`]?.status : undefined
                    return (
                      <li key={p.num} className="row">
                        <Link
                          to="/oppgave/$exam/$num"
                          params={{ exam: e.id, num: String(p.num) }}
                          search={ts[0] ? { tema: ts[0].id } : {}}
                          className="flex items-baseline gap-3 py-2.5 no-underline"
                          style={{ color: 'inherit' }}
                        >
                          <span className="row-num w-7 shrink-0 text-right">{p.num}</span>
                          <span className="min-w-0 flex-1 text-[14px]">
                            {ts.length ? (
                              ts.map((t, i) => (
                                <span key={t.id}>
                                  {i > 0 && <span className="faint"> · </span>}
                                  <Tex>{t.title}</Tex>
                                </span>
                              ))
                            ) : (
                              <span className="muted">{p.snippet.replace(/^(Problem|Oppgave|Exercise)\s+\d+\s*(\(\d+\s*%\))?/, '').slice(0, 90)}…</span>
                            )}
                          </span>
                          {p.pct && <span className="faint shrink-0 text-xs tabular-nums">{p.pct} %</span>}
                          <span className="w-4 shrink-0 text-center text-sm" style={{ color: st === 'ok' ? 'var(--ok)' : 'var(--bad)' }}>
                            {st === 'ok' ? '✓' : st === 'igjen' ? '↻' : ''}
                          </span>
                        </Link>
                      </li>
                    )
                  })}
                </ol>
              )}
            </section>
          )
        })}
      </div>
    </main>
  )
}
