import { Link } from '@tanstack/react-router'
import { Tex } from './Tex'
import { examShort, parseOcc, type Topic } from '../data/topics'
import { useHydrated } from '../lib/store'
import { pkey, useProblems } from '../lib/db'

export function TopicDetail({ t, compact = false }: { t: Topic; compact?: boolean }) {
  const [problems] = useProblems()
  const h = useHydrated()
  return (
    <div className="method mt-4 grid gap-4">
      {!compact && (
        <Tex as="p" className="serif m-0 border-l-2 pl-3 text-[15px] italic" >
          {t.why}
        </Tex>
      )}
      <div>
        <div className="eyebrow mb-2" style={{ color: 'var(--ink)' }}>
          Slik gjør du
        </div>
        <ol className="m-0 grid gap-1.5 pl-5">
          {t.method.map((m, i) => (
            <Tex key={i} as="li">
              {m}
            </Tex>
          ))}
        </ol>
      </div>
      {t.traps && (
        <div className="rounded-xl p-3" style={{ background: 'var(--bad-soft)' }}>
          <div className="eyebrow mb-1.5" style={{ color: 'var(--bad)' }}>
            Feller
          </div>
          <ul className="m-0 grid gap-1 pl-5">
            {t.traps.map((m, i) => (
              <Tex key={i} as="li">
                {m}
              </Tex>
            ))}
          </ul>
        </div>
      )}
      {t.onSheet && (
        <div className="flex gap-2 text-[13.5px]">
          <span className="tag shrink-0" style={{ background: 'var(--sunken)', color: 'var(--ink)' }}>
            Formelark
          </span>
          <Tex className="muted">{t.onSheet}</Tex>
        </div>
      )}
      {!compact && (
        <div>
          <div className="eyebrow mb-2" style={{ color: 'var(--muted)' }}>
            Gitt på eksamen
          </div>
          <div className="flex flex-wrap gap-1.5">
            {t.occ.map((s) => {
              const o = parseOcc(s)
              const st = h ? problems[pkey(o.exam, o.num)]?.status : undefined
              return (
                <Link
                  key={s}
                  to="/oppgave/$exam/$num"
                  params={{ exam: o.exam, num: String(o.num) }}
                  search={{ tema: t.id }}
                  className="chip no-underline hover:!text-[var(--fg)]"
                  style={
                    st === 'ok'
                      ? { background: 'var(--ok-soft)', color: 'var(--ok)' }
                      : st === 'igjen'
                        ? { background: 'var(--bad-soft)', color: 'var(--bad)' }
                        : undefined
                  }
                >
                  {st === 'ok' ? '✓ ' : st === 'igjen' ? '↻ ' : ''}
                  {examShort(o.exam)} · {o.num}
                  {o.parts}
                  {o.note ? ` · ${o.note}` : ''}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
