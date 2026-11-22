import { Link } from '@tanstack/react-router'
import { useStored, useHydrated } from '../lib/store'
import { dayKey, streak, type Event, type Visit } from '../lib/db'
import { examShort, topics } from '../data/topics'
import { Tex } from './Tex'

const EMPTY: Event[] = []

export function ago(ts: number) {
  const s = Math.round((Date.now() - ts) / 1000)
  if (s < 60) return 'akkurat nå'
  if (s < 3600) return `${Math.floor(s / 60)} min siden`
  if (s < 86400) return `${Math.floor(s / 3600)} t siden`
  const d = Math.floor(s / 86400)
  return d === 1 ? 'i går' : `${d} dager siden`
}

export function ContinueCard() {
  const hydrated = useHydrated()
  const [last] = useStored<Visit | null>('last-visit', null)
  const [events] = useStored<Event[]>('events', EMPTY)
  if (!hydrated || !last) return null
  const today = dayKey(Date.now())
  const todayEv = events.filter((e) => dayKey(e.at) === today)
  const solvedToday = new Set(todayEv.filter((e) => e.t === 'status' && e.v === 'ok').map((e) => e.ref)).size
  const mcToday = todayEv.filter((e) => e.t === 'mc').length
  const st = streak(events)
  const topic = last.tema ? topics.find((t) => t.id === last.tema) : undefined
  return (
    <div className="card-raised mt-8 flex flex-wrap items-center gap-4 p-4 sm:p-5">
      <div className="hidden h-11 w-11 shrink-0 place-items-center rounded-xl text-lg sm:grid" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }} aria-hidden>
        ↺
      </div>
      <div className="min-w-0 flex-1" style={{ minWidth: 220 }}>
        <div className="eyebrow">Fortsett der du slapp · {ago(last.at)}</div>
        <div className="serif mt-0.5 text-[17px] font-semibold">
          {examShort(last.exam)}, oppgave {last.num}
          {topic && (
            <span className="muted font-sans text-[14px] font-normal">
              {' '}
              · <Tex>{topic.title}</Tex>
            </span>
          )}
        </div>
        <div className="muted mt-0.5 text-[12.5px]">
          I dag: <strong>{solvedToday}</strong> klart · <strong>{mcToday}</strong> flervalg ·{' '}
          {st > 0 ? (
            <>
              <strong>{st}</strong> {st === 1 ? 'dag' : 'dager'} på rad
            </>
          ) : (
            'start en ny streak i dag'
          )}{' '}
          · <Link to="/fremgang">Min fremgang</Link>
        </div>
      </div>
      <Link
        to="/oppgave/$exam/$num"
        params={{ exam: last.exam, num: String(last.num) }}
        search={last.tema ? { tema: last.tema } : {}}
        className="btn btn-primary w-full sm:w-auto"
      >
        Fortsett →
      </Link>
    </div>
  )
}
