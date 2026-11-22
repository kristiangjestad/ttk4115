import { useState } from 'react'
import { useHydrated, useStored } from '../lib/store'

/** Flytende «Husk»-boks nederst til venstre, som i mattepils. */
export function Husk() {
  const [items, setItems] = useStored<string[]>('husk', [])
  const [open, setOpen] = useStored('ui:husk-open', false)
  const [draft, setDraft] = useState('')
  const h = useHydrated()
  if (!h) return null
  return (
    <div className="husk fixed bottom-4 left-4 z-40" style={{ width: open ? 'min(340px, calc(100vw - 32px))' : undefined }}>
      {open ? (
        <section className="card-raised p-4">
          <div className="mb-2 flex items-center">
            <span className="eyebrow">Husk</span>
            <span className="faint ml-2 text-[11px]">lagres i nettleseren</span>
            <button className="btn btn-ghost btn-sm ml-auto" onClick={() => setOpen(false)} aria-label="Lukk">
              ✕
            </button>
          </div>
          {items.length > 0 && (
            <ul className="mb-3 grid max-h-60 list-none gap-1 overflow-y-auto p-0 text-[13.5px]">
              {items.map((it, i) => (
                <li key={i} className="group flex items-start gap-2 rounded-md px-1 py-0.5 hover:bg-[var(--sunken)]">
                  <span style={{ color: 'var(--accent)' }}>•</span>
                  <span className="flex-1">{it}</span>
                  <button
                    onClick={() => setItems((p) => p.filter((_, j) => j !== i))}
                    className="faint cursor-pointer border-0 bg-transparent text-xs opacity-0 group-hover:opacity-100"
                    aria-label="Fjern"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!draft.trim()) return
              setItems((p) => [...p, draft.trim()])
              setDraft('')
            }}
          >
            <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Noe du må huske? Skriv og trykk Enter" className="input" autoFocus />
          </form>
        </section>
      ) : (
        <button onClick={() => setOpen(true)} className="card-raised flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-[12px]" style={{ border: '1px solid var(--line)' }}>
          <span className="eyebrow">Husk</span>
          {items.length > 0 && <span className="badge">{items.length}</span>}
        </button>
      )}
    </div>
  )
}
