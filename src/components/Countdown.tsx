import { useEffect, useState } from 'react'

export const EXAM_DATE = new Date('2026-11-28T09:00:00+01:00')

export function Countdown({ long = false }: { long?: boolean }) {
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    setNow(Date.now())
    const t = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(t)
  }, [])
  if (now == null) return <span className="muted">Eksamen 28. november kl. 09:00</span>
  const ms = EXAM_DATE.getTime() - now
  if (ms <= 0) return <span className="muted">Eksamen er i gang eller ferdig – lykke til!</span>
  const d = Math.floor(ms / 86_400_000)
  const h = Math.floor((ms % 86_400_000) / 3_600_000)
  return (
    <span>
      <strong style={{ color: 'var(--accent)' }}>
        {d} d {h} t
      </strong>{' '}
      <span className="muted">{long ? 'til eksamen 28. november kl. 09:00' : 'til eksamen'}</span>
    </span>
  )
}
