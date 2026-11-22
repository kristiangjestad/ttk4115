import { useEffect, useState } from 'react'
import type { MC } from '../data/mc'

/**
 * Svarknapper for en flervalgsoppgave.
 * `restore` gjenoppretter et tidligere avgitt svar (f.eks. etter reload midt i en økt).
 */
export function MCAnswer({
  q,
  onResult,
  restore,
}: {
  q: MC
  onResult?: (ok: boolean, picked: string[]) => void
  restore?: string[]
}) {
  const multi = q.answer.length > 1
  const [picked, setPicked] = useState<string[]>(restore ?? [])
  const [checked, setChecked] = useState(!!restore?.length)
  useEffect(() => {
    setPicked(restore ?? [])
    setChecked(!!restore?.length)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.exam, q.num])

  const isOk = (p: string[]) => p.length === q.answer.length && p.every((x) => q.answer.includes(x))
  const ok = checked && isOk(picked)
  const check = (p: string[]) => {
    setChecked(true)
    onResult?.(isOk(p), p)
  }
  return (
    <div className="card mt-4 p-4">
      <div className="mb-2 text-sm font-bold">{multi ? 'Velg alle riktige' : 'Svar'}</div>
      <div className="flex flex-wrap gap-2">
        {q.options.map((o) => {
          const sel = picked.includes(o)
          const right = checked && q.answer.includes(o)
          const wrong = checked && sel && !q.answer.includes(o)
          return (
            <button
              key={o}
              className="btn"
              style={{
                minWidth: 48,
                ...(sel && !checked ? { borderColor: 'var(--accent)', color: 'var(--accent)' } : {}),
                ...(right ? { background: 'var(--ok-soft)', borderColor: 'var(--ok)', color: 'var(--ok)' } : {}),
                ...(wrong ? { background: 'var(--bad-soft)', borderColor: 'var(--bad)', color: 'var(--bad)' } : {}),
              }}
              onClick={() => {
                if (checked) return
                if (multi) setPicked((p) => (p.includes(o) ? p.filter((x) => x !== o) : [...p, o]))
                else {
                  setPicked([o])
                  check([o])
                }
              }}
            >
              {o})
            </button>
          )
        })}
        {multi && !checked && (
          <button className="btn btn-primary" onClick={() => check(picked)} disabled={!picked.length}>
            Sjekk
          </button>
        )}
      </div>
      {checked && (
        <p className="mb-0 font-semibold" style={{ color: ok ? 'var(--ok)' : 'var(--bad)' }}>
          {ok ? 'Riktig!' : `Feil – ${q.answer.map((a) => a + ')').join(' og ')}.`}
        </p>
      )}
    </div>
  )
}
