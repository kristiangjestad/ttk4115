import { useCallback, useSyncExternalStore } from 'react'

// Nøkkel/verdi-lager oppå localStorage. Tåler privat modus (faller tilbake til minne) og SSR.
// Alle nøkler får prefikset PREFIX. Endringer synkes mellom faner via 'storage'-eventet.
export const PREFIX = 'ttk4115:'
const listeners = new Set<() => void>()
const cache = new Map<string, unknown>()

function ls(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

export function getStored<T>(key: string, fallback: T): T {
  if (cache.has(key)) return cache.get(key) as T
  let v = fallback
  try {
    const raw = ls()?.getItem(PREFIX + key)
    if (raw != null) v = JSON.parse(raw)
  } catch {}
  cache.set(key, v)
  return v
}

export function setStored<T>(key: string, value: T) {
  cache.set(key, value)
  try {
    if (value === undefined) ls()?.removeItem(PREFIX + key)
    else ls()?.setItem(PREFIX + key, JSON.stringify(value))
  } catch {}
  notify()
}

export function updateStored<T>(key: string, fallback: T, fn: (prev: T) => T) {
  setStored(key, fn(getStored(key, fallback)))
}

export function notify() {
  listeners.forEach((l) => l())
}

/** Glem hurtigbufferen (etter import/nullstilling). */
export function invalidate() {
  cache.clear()
  notify()
}

export function allKeys(): string[] {
  const s = ls()
  if (!s) return [...cache.keys()]
  const out: string[] = []
  for (let i = 0; i < s.length; i++) {
    const k = s.key(i)
    if (k?.startsWith(PREFIX)) out.push(k.slice(PREFIX.length))
  }
  return out
}

export function storageAvailable() {
  try {
    const s = ls()
    if (!s) return false
    s.setItem(PREFIX + '__test', '1')
    s.removeItem(PREFIX + '__test')
    return true
  } catch {
    return false
  }
}

function subscribe(l: () => void) {
  listeners.add(l)
  const onStorage = (e: StorageEvent) => {
    if (e.key == null || e.key.startsWith(PREFIX)) {
      if (e.key) cache.delete(e.key.slice(PREFIX.length))
      else cache.clear()
      l()
    }
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(l)
    window.removeEventListener('storage', onStorage)
  }
}

export function useStored<T>(key: string, fallback: T) {
  const value = useSyncExternalStore(
    subscribe,
    () => getStored(key, fallback),
    () => fallback,
  )
  const set = useCallback(
    (v: T | ((prev: T) => T)) => {
      const prev = getStored(key, fallback)
      setStored(key, typeof v === 'function' ? (v as (p: T) => T)(prev) : v)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  )
  return [value, set] as const
}

/** true etter hydrering – for å unngå at lagret tilstand blinker feil ved første render. */
export function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
}

const EMPTY: string[] = []

/** Et sett med id-er (lagret som liste). */
export function useSet(key: string) {
  const [list, setList] = useStored<string[]>(key, EMPTY)
  const has = useCallback((id: string) => list.includes(id), [list])
  const toggle = useCallback(
    (id: string, on?: boolean) =>
      setList((prev) => {
        const isOn = prev.includes(id)
        const want = on ?? !isOn
        if (want === isOn) return prev
        return want ? [...prev, id] : prev.filter((x) => x !== id)
      }),
    [setList],
  )
  return { list, has, toggle }
}
