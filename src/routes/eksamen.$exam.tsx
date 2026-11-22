import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Pages } from '../components/Pages'
import { getExam } from '../lib/exams'
import { examLabel } from '../data/topics'
import { useHydrated, useStored } from '../lib/store'
import { logEvent, type ExamRun, type ExamTimer } from '../lib/db'
import { fmtDuration } from '../lib/useTimeTracker'

export const Route = createFileRoute('/eksamen/$exam')({
  loader: ({ params }) => {
    const exam = getExam(params.exam)
    if (!exam) throw notFound()
    return { exam }
  },
  head: ({ params }) => ({ meta: [{ title: `${examLabel(params.exam)} på tid · TTK4115` }] }),
  component: Eksamen,
})

const DURATION = 4 * 3600
const EMPTY_T: Record<string, ExamTimer> = {}
const EMPTY_R: ExamRun[] = []

function elapsed(t: ExamTimer, now: number) {
  const end = t.pausedAt ?? now
  return Math.max(0, Math.floor((end - t.startedAt - t.pausedTotal) / 1000))
}

function Eksamen() {
  const { exam } = Route.useLoaderData()
  const hydrated = useHydrated()
  const [timers, setTimers] = useStored('exam-timers', EMPTY_T)
  const [runs, setRuns] = useStored('exam-runs', EMPTY_R)
  const [view, setView] = useStored<'oppgaver' | 'losning'>(`ui:exam-view:${exam.id}`, 'oppgaver')
  const [now, setNow] = useState(() => Date.now())
  const timer = hydrated ? timers[exam.id] : undefined

  useEffect(() => {
    if (!timer || timer.pausedAt) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [timer])

  const used = timer ? elapsed(timer, now) : 0
  const left = Math.max(0, DURATION - used)
  const hh = Math.floor(left / 3600)
  const mm = String(Math.floor((left % 3600) / 60)).padStart(2, '0')
  const ss = String(left % 60).padStart(2, '0')

  const setTimer = (t: ExamTimer | undefined) =>
    setTimers((all) => {
      const next = { ...all }
      if (t) next[exam.id] = t
      else delete next[exam.id]
      return next
    })

  const start = () => {
    setTimer({ startedAt: Date.now(), pausedTotal: 0 })
    setNow(Date.now())
    setView('oppgaver')
    logEvent('exam-start', exam.id)
  }
  const pause = () => timer && setTimer({ ...timer, pausedAt: Date.now() })
  const resume = () => timer?.pausedAt && setTimer({ ...timer, pausedTotal: timer.pausedTotal + (Date.now() - timer.pausedAt), pausedAt: undefined })
  const finish = (completed: boolean) => {
    if (!timer) return
    const secs = elapsed(timer, Date.now())
    setRuns((r) => [...r, { exam: exam.id, startedAt: timer.startedAt, endedAt: Date.now(), seconds: secs, completed }])
    setTimer(undefined)
    logEvent('exam-end', exam.id, secs)
    if (completed && exam.solDir) setView('losning')
  }

  // Tiden er ute → avslutt automatisk
  useEffect(() => {
    if (timer && !timer.pausedAt && left === 0) finish(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, timer])

  const myRuns = hydrated ? runs.filter((r) => r.exam === exam.id) : []

  return (
    <main className="wrap py-6">
      <div className="sticky top-0 z-10 -mx-4 mb-4 flex flex-wrap items-center gap-2 border-b px-4 py-3" style={{ background: 'var(--bg)', borderColor: 'var(--line)' }}>
        <h1 className="serif m-0 text-[20px] font-semibold">{examLabel(exam.id)}</h1>
        <span className="text-xl font-black tabular-nums" style={{ color: timer && left < 1800 ? 'var(--bad)' : 'var(--fg)' }}>
          {hh}:{mm}:{ss}
        </span>
        {timer?.pausedAt && <span className="chip">pause</span>}
        {!timer ? (
          <button className="btn btn-primary" onClick={start}>
            Start 4 timer
          </button>
        ) : (
          <>
            {timer.pausedAt ? (
              <button className="btn btn-primary" onClick={resume}>
                Fortsett
              </button>
            ) : (
              <button className="btn" onClick={pause}>
                Pause
              </button>
            )}
            <button className="btn" onClick={() => finish(true)}>
              Lever
            </button>
            <button
              className="btn"
              onClick={() => {
                if (confirm('Avbryte? Lagres som ikke fullført.')) finish(false)
              }}
            >
              Avbryt
            </button>
          </>
        )}
        {exam.solDir && !timer && (
          <button className="btn ml-auto" onClick={() => setView(view === 'losning' ? 'oppgaver' : 'losning')}>
            {view === 'losning' ? 'Oppgaver' : 'Fasit'}
          </button>
        )}
      </div>
      <p className="muted text-sm">
        Hjelpemiddel D, enkel kalkulator. Formelark bakerst. Timeren går selv om du lukker fanen.
      </p>
      {myRuns.length > 0 && (
        <div className="card mb-4 p-3 text-sm">
          <strong>Tidligere forsøk:</strong>{' '}
          {myRuns.map((r, i) => (
            <span key={i}>
              {i > 0 && ' · '}
              {new Date(r.startedAt).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' })}: {fmtDuration(r.seconds)}
              {r.completed ? '' : ' (avbrutt)'}
            </span>
          ))}
          {' · '}
          <Link to="/eksamener">Gå gjennom oppgavene enkeltvis</Link>
        </div>
      )}
      {view === 'losning' && exam.solDir && !timer ? (
        <Pages dir={exam.solDir} from={1} to={exam.solPages} alt="Løsningsforslag" />
      ) : (
        <Pages dir={exam.dir} from={1} to={exam.pages} alt={examLabel(exam.id)} />
      )}
    </main>
  )
}
