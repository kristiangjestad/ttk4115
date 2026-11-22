import { tierInfo, topics, type Tier } from '../data/topics'
import { useHydrated, useSet } from '../lib/store'
import { useTopicMeta } from '../lib/db'
import { Tex } from './Tex'

const tierColor: Record<Tier, string> = { 1: 'var(--t1)', 2: 'var(--t2)', 3: 'var(--t3)', 4: 'var(--t4)' }

export function Sidebar() {
  const done = useSet('done-topics')
  const [meta] = useTopicMeta()
  const h = useHydrated()
  return (
    <aside className="sidebar text-[13px]">
      <div className="mb-1 font-bold">TTK4115</div>
      <div className="muted mb-5 text-xs">Lineær systemteori</div>
      {([1, 2, 3, 4] as Tier[]).map((tier) => {
        const list = topics.filter((t) => t.tier === tier)
        const d = h ? list.filter((t) => done.has(t.id)).length : 0
        return (
          <div key={tier} className="mb-5">
            <a href={`#niva-${tier}`} className="mb-1.5 flex items-center gap-2 no-underline" style={{ color: 'var(--fg)' }}>
              <span className="grid h-4 w-4 place-items-center rounded text-[10px] font-bold text-white" style={{ background: tierColor[tier] }}>
                {tier}
              </span>
              <span className="text-[12px] font-bold">{tierInfo[tier].name}</span>
              <span className="faint ml-auto text-[11px] tabular-nums">
                {d}/{list.length}
              </span>
            </a>
            <ol className="m-0 list-none p-0">
              {list.map((t) => {
                const isDone = h && done.has(t.id)
                const conf = h ? meta[t.id]?.confidence : undefined
                return (
                  <li key={t.id}>
                    <a
                      href={`#${t.id}`}
                      className="flex items-start gap-2 rounded-md px-1.5 py-[5px] leading-snug no-underline hover:bg-[var(--sunken)]"
                      style={{ color: isDone ? 'var(--faint)' : 'var(--muted)' }}
                    >
                      <span className="faint w-5 shrink-0 text-right text-[11px] tabular-nums">{topics.indexOf(t) + 1}</span>
                      <Tex className="min-w-0 flex-1">{t.title}</Tex>
                      <span
                        className="mt-[5px] h-[7px] w-[7px] shrink-0 rounded-full"
                        style={{
                          background: isDone ? 'var(--ok)' : conf === 1 ? 'var(--bad)' : conf === 2 ? 'var(--t2)' : conf === 3 ? 'var(--ok)' : 'transparent',
                          border: isDone || conf ? 'none' : '1.5px solid var(--line-strong)',
                        }}
                      />
                    </a>
                  </li>
                )
              })}
            </ol>
          </div>
        )
      })}
    </aside>
  )
}
