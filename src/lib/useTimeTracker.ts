import { useEffect } from 'react'
import { addSeconds } from './db'

/** Teller sekunder brukt på en oppgave mens fanen er synlig, og lagrer jevnlig. */
export function useTimeTracker(key: string) {
  useEffect(() => {
    let pending = 0
    let last = Date.now()
    const tick = () => {
      const now = Date.now()
      if (document.visibilityState === 'visible') pending += (now - last) / 1000
      last = now
    }
    const flush = () => {
      tick()
      const s = Math.round(pending)
      if (s > 0) {
        addSeconds(key, s)
        pending -= s
      }
    }
    const t = setInterval(flush, 10_000)
    const onVis = () => (document.visibilityState === 'hidden' ? flush() : (last = Date.now()))
    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('pagehide', flush)
    return () => {
      clearInterval(t)
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('pagehide', flush)
      flush()
    }
  }, [key])
}

export function fmtDuration(s: number) {
  if (s < 60) return `${Math.round(s)} s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m} min`
  return `${Math.floor(m / 60)} t ${m % 60} min`
}
