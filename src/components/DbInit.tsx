import { useEffect, useState } from 'react'
import { initDb } from '../lib/db'
import { storageAvailable } from '../lib/store'

/** Kjører migrering ved oppstart og varsler hvis nettleseren ikke lar oss lagre. */
export function DbInit() {
  const [ok, setOk] = useState(true)
  useEffect(() => {
    initDb()
    setOk(storageAvailable())
    try {
      navigator.storage?.persist?.()
    } catch {}
  }, [])
  if (ok) return null
  return (
    <div className="px-4 py-2 text-center text-sm" style={{ background: 'var(--bad-soft)', color: 'var(--bad)' }}>
      Nettleseren lagrer ikke data (privat modus?). Fremgangen forsvinner når fanen lukkes.
    </div>
  )
}
