import { createFileRoute, Link, notFound, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Pages } from '../components/Pages'
import { Tex } from '../components/Tex'
import { MCAnswer } from '../components/MCAnswer'
import { TopicDetail } from '../components/TopicDetail'
import { getExam } from '../lib/exams'
import { useHydrated } from '../lib/store'
import { getProblem, pkey, recordSolutionView, recordMc, recordVisit, setProblemStatus, updateProblem, useProblems } from '../lib/db'
import { fmtDuration, useTimeTracker } from '../lib/useTimeTracker'
import { examLabel, parseOcc, topics, topicsFor } from '../data/topics'
import { mcFor } from '../data/mc'

export const Route = createFileRoute('/oppgave/$exam/$num')({
  validateSearch: (s: Record<string, unknown>): { tema?: string } => (typeof s.tema === 'string' ? { tema: s.tema } : {}),
  loader: ({ params }) => {
    const exam = getExam(params.exam)
    const p = exam?.problems.find((x) => x.num === Number(params.num))
    if (!exam || !p) throw notFound()
    return { exam, p }
  },
  head: ({ params }) => ({ meta: [{ title: `${examLabel(params.exam)} opg. ${params.num} · TTK4115` }] }),
  component: Oppgave,
})

function Oppgave() {
  const { exam, p } = Route.useLoaderData()
  const { tema } = Route.useSearch()
  const navigate = useNavigate()
  const [showSol, setShowSol] = useState(false)
  const [showMethod, setShowMethod] = useState(false)
  const [problems] = useProblems()
  const hydrated = useHydrated()
  const key = pkey(exam.id, p.num)
  const rec = hydrated ? problems[key] : undefined
  const status = { [key]: rec?.status }
  const topic = tema ? topics.find((t) => t.id === tema) : undefined
  const seq = topic ? dedupe(topic.occ.map(parseOcc).map((o) => `${o.exam}:${o.num}`)) : []
  const idx = seq.indexOf(key)
  const prev = idx > 0 ? seq[idx - 1] : undefined
  const next = idx >= 0 && idx < seq.length - 1 ? seq[idx + 1] : undefined
  const occHere = topic?.occ.map(parseOcc).filter((o) => o.exam === exam.id && o.num === p.num)
  const parts = occHere?.map((o) => o.parts).join('') ?? ''
  const mc = mcFor(exam.id, p.num)
  const related = topicsFor(exam.id, p.num)

  useEffect(() => {
    setShowSol(false)
    setShowMethod(false)
    window.scrollTo(0, 0)
    recordVisit(exam.id, p.num, tema)
  }, [key, tema])
  useTimeTracker(key)

  const toggleSol = () =>
    setShowSol((s) => {
      if (!s) recordSolutionView(key)
      return !s
    })

  const go = (k?: string) => {
    if (!k) return
    const [e, n] = k.split(':')
    navigate({ to: '/oppgave/$exam/$num', params: { exam: e, num: n }, search: tema ? { tema } : {} })
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'l' || e.key === 'L') toggleSol()
      if (e.key === 'ArrowRight') go(next)
      if (e.key === 'ArrowLeft') go(prev)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const setS = (s: 'ok' | 'igjen') => setProblemStatus(key, s)

  const statusOf = (k: string) => (hydrated ? problems[k]?.status : undefined)

  return (
    <main className="wrap-wide pt-6 pb-28 lg:pb-12">
      {topic && (
        <div className="card mb-6 flex flex-wrap items-center gap-x-4 gap-y-3 p-3 pl-4">
          <div className="w-full min-w-0 sm:w-auto sm:flex-1">
            <div className="eyebrow">
              {idx + 1} / {seq.length}
            </div>
            <Link to="/" hash={topic.id} className="serif text-[16px] font-semibold no-underline" style={{ color: 'var(--fg)' }}>
              <Tex>{topic.title}</Tex>
            </Link>
          </div>
          <div className="flex max-w-full flex-wrap gap-1" aria-label="Oppgavene i denne typen">
            {seq.map((k2) => {
              const st = statusOf(k2)
              const [e2, n2] = k2.split(':')
              return (
                <Link
                  key={k2}
                  to="/oppgave/$exam/$num"
                  params={{ exam: e2, num: n2 }}
                  search={{ tema }}
                  title={`${examLabel(e2)} oppg. ${n2}`}
                  className="block h-2.5 w-2.5 rounded-full"
                  style={{
                    background: st === 'ok' ? 'var(--ok)' : st === 'igjen' ? 'var(--bad)' : 'var(--line-strong)',
                    outline: k2 === key ? '2px solid var(--fg)' : undefined,
                    outlineOffset: 2,
                  }}
                />
              )
            })}
          </div>
          <div className="ml-auto flex gap-1.5">
            <button className="btn btn-sm" disabled={!prev} onClick={() => go(prev)} aria-label="Forrige oppgave">
              ←
            </button>
            <button className="btn btn-sm" disabled={!next} onClick={() => go(next)}>
              Neste →
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <div className="eyebrow mb-2" style={{ color: 'var(--muted)' }}>
            {examLabel(exam.id)}
            {p.pct ? ` · ${p.pct} %` : ''}
            {parts ? ` · del ${parts.split('').join(', ')}` : ''}
          </div>
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <h1 className="display m-0 text-[36px] sm:text-[44px]">Oppgave {p.num}</h1>
            {status[key] === 'ok' && (
              <span className="tag" style={{ background: 'var(--ok-soft)', color: 'var(--ok)' }}>
                klarte den
              </span>
            )}
            {status[key] === 'igjen' && (
              <span className="tag" style={{ background: 'var(--bad-soft)', color: 'var(--bad)' }}>
                øv igjen
              </span>
            )}
          </div>
          {related.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-1.5">
              {related.map((t) => (
                <Link
                  key={t.id}
                  to="/oppgave/$exam/$num"
                  params={{ exam: exam.id, num: String(p.num) }}
                  search={{ tema: t.id }}
                  className="chip no-underline"
                  style={t.id === tema ? { background: 'var(--accent-soft)', color: 'var(--accent)' } : undefined}
                >
                  <Tex>{t.title}</Tex>
                </Link>
              ))}
            </div>
          )}

          <Pages dir={exam.dir} from={p.page} to={p.endPage} alt={`${examLabel(exam.id)} oppgave ${p.num}`} />
          <p className="faint mt-2 text-xs">
            <Link to="/eksamen/$exam" params={{ exam: exam.id }}>Hele settet</Link>
          </p>

          {showSol && (
            <section className="mt-8">
              <div className="mb-3 flex items-center gap-3">
                <span className="tag" style={{ background: 'var(--ok-soft)', color: 'var(--ok)' }}>
                  Løsningsforslag
                </span>
                <div className="h-px flex-1" style={{ background: 'var(--line)' }} />
              </div>
              {exam.solDir && p.solPage ? (
                <Pages dir={exam.solDir} from={p.solPage} to={p.solEndPage ?? p.solPage} alt="Løsningsforslag" />
              ) : exam.solDir ? (
                <>
                  <p className="muted text-sm">Hele løsningsforslaget:</p>
                  <Pages dir={exam.solDir} from={1} to={exam.solPages} alt="Løsningsforslag" />
                </>
              ) : (
                <p className="muted">Ingen løsningsforslag.</p>
              )}
            </section>
          )}
        </div>

        <aside className="grid content-start gap-4 lg:sticky lg:top-[76px] lg:max-h-[calc(100vh-92px)] lg:overflow-y-auto lg:pb-4" style={{ scrollbarWidth: 'thin' }}>
          {mc && (
            <MCAnswer
              q={mc}
              onResult={(ok, picked) => {
                setS(ok ? 'ok' : 'igjen')
                recordMc(key, picked, ok)
              }}
            />
          )}

          <div className="actionbar fixed inset-x-0 bottom-0 z-20 border-t p-3 lg:static lg:rounded-[14px] lg:border lg:p-4" style={{ background: 'var(--surface)', borderColor: 'var(--line)' }}>
            <div className="mx-auto grid max-w-[880px] grid-cols-[1fr_auto_auto] gap-2 lg:grid-cols-2">
              <button className="btn btn-primary lg:col-span-2" onClick={toggleSol}>
                {showSol ? 'Skjul fasit' : 'Fasit'} <kbd className="hidden sm:inline">L</kbd>
              </button>
              <button
                className="btn"
                onClick={() => setS('ok')}
                aria-pressed={status[key] === 'ok'}
                style={status[key] === 'ok' ? { borderColor: 'var(--ok)', color: 'var(--ok)', background: 'var(--ok-soft)' } : undefined}
              >
                ✓ <span className="hidden sm:inline">Klarte den</span>
              </button>
              <button
                className="btn"
                onClick={() => setS('igjen')}
                aria-pressed={status[key] === 'igjen'}
                style={status[key] === 'igjen' ? { borderColor: 'var(--bad)', color: 'var(--bad)', background: 'var(--bad-soft)' } : undefined}
              >
                ↻ <span className="hidden sm:inline">Øv igjen</span>
              </button>
            </div>
            <div className="faint mt-2 hidden text-center text-[11px] lg:block">
              <kbd>L</kbd> fasit · <kbd>←</kbd> <kbd>→</kbd>
            </div>
          </div>

          {topic && (
            <div className="card p-4">
              <button onClick={() => setShowMethod(!showMethod)} className="linkbtn flex w-full items-center text-[13.5px]">
                <span className="eyebrow" style={{ color: 'var(--ink)' }}>
                  Metode
                </span>
                <span className="ml-auto">{showMethod ? '↑' : '↓'}</span>
              </button>
              {showMethod && <TopicDetail t={topic} compact />}
            </div>
          )}

          {hydrated && <ProblemPanel k={key} />}
        </aside>
      </div>
    </main>
  )
}

function dedupe(a: string[]) {
  return [...new Set(a)]
}

function ProblemPanel({ k }: { k: string }) {
  const [problems] = useProblems()
  const rec = problems[k]
  const [note, setNote] = useState(() => getProblem(k).note ?? '')
  useEffect(() => setNote(getProblem(k).note ?? ''), [k])
  return (
    <div className="card p-4 text-sm">
      <div className="mb-3 grid grid-cols-3 gap-2 text-center">
        <Mini label="Besøk" value={String(rec?.visits ?? 0)} />
        <Mini label="Tid" value={fmtDuration(rec?.seconds ?? 0)} />
        <Mini label="Fasit sett" value={String(rec?.solutionViews ?? 0)} />
      </div>
      <div className="sr-only">
        Besøkt {rec?.visits ?? 0} ganger. Løsningsforslag åpnet {rec?.solutionViews ?? 0} ganger.
      </div>
      {rec?.attempts.length ? (
        <div className="muted mb-3 flex items-center gap-1.5 text-xs">
          Forsøk
          {rec.attempts.slice(-10).map((a, i) => (
            <span
              key={i}
              title={new Date(a.at).toLocaleString('nb-NO')}
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: a.result === 'ok' ? 'var(--ok)' : 'var(--bad)' }}
            />
          ))}
        </div>
      ) : null}
      <label className="block">
        <span className="eyebrow" style={{ color: 'var(--muted)' }}>
          Notat
        </span>
        <textarea
          value={note}
          onChange={(e) => {
            setNote(e.target.value)
            updateProblem(k, (r) => ({ ...r, note: e.target.value }))
          }}
          rows={4}
          placeholder="Hva gikk galt?"
          className="input mt-1.5"
        />
      </label>
    </div>
  )
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg py-2" style={{ background: 'var(--sunken)' }}>
      <div className="text-[15px] font-bold tabular-nums">{value}</div>
      <div className="faint text-[10.5px] font-semibold tracking-wide uppercase">{label}</div>
    </div>
  )
}
