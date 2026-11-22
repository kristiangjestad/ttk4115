import type { Topic } from '../data/topics'

/**
 * Fremgang som poler i s-planet: hver oppgavetype er en pol.
 * Ikke gjort → i høyre halvplan (ustabil). Gjort → flytter seg til venstre halvplan.
 */
const W = 320
const H = 200
const CX = W / 2
const CY = H / 2

// deterministisk «tilfeldig» posisjon per indeks
function rand(i: number, salt: number) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453
  return x - Math.floor(x)
}

function pos(i: number, n: number, done: boolean) {
  const yy = (rand(i, 1) - 0.5) * (H - 64)
  // komplekse poler kommer i par, men vi holder det enkelt: én pol per type
  const r = rand(i, 2)
  const x = done ? -(20 + r * (CX - 44)) : 16 + r * (CX - 44)
  return { x: CX + x, y: CY + yy + (i % 2 ? 0 : 0) * n }
}

const tierColor = ['', 'var(--t1)', 'var(--t2)', 'var(--t3)', 'var(--t4)']

export function SPlane({ topics, isDone }: { topics: Topic[]; isDone: (id: string) => boolean }) {
  const unstable = topics.filter((t) => !isDone(t.id)).length
  const tier1Left = topics.filter((t) => t.tier === 1 && !isDone(t.id)).length
  const stable = unstable === 0
  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label={`${unstable} poler i høyre halvplan`}>
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0V20" fill="none" stroke="var(--line)" strokeWidth="0.6" />
          </pattern>
          <linearGradient id="rhp" x1="0" x2="1">
            <stop offset="0" stopColor="var(--accent)" stopOpacity="0" />
            <stop offset="1" stopColor="var(--accent)" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <rect width={W} height={H} rx="12" fill="var(--surface)" />
        <rect width={W} height={H} rx="12" fill="url(#grid)" />
        <rect x={CX} y="0" width={CX} height={H} fill="url(#rhp)" />
        <line x1="10" y1={CY} x2={W - 10} y2={CY} stroke="var(--line-strong)" />
        <line x1={CX} y1="10" x2={CX} y2={H - 10} stroke="var(--fg)" strokeOpacity=".5" strokeDasharray="3 3" />
        <text x={W - 8} y={CY + 3} textAnchor="end" fontSize="10" fill="var(--faint)" style={{ paintOrder: 'stroke' }} stroke="var(--surface)" strokeWidth="3">
          Re
        </text>
        <text x={CX + 6} y="20" fontSize="10" fill="var(--faint)">
          Im
        </text>
        <text x="14" y={H - 12} fontSize="9.5" fill="var(--ok)" fontWeight="600" letterSpacing=".06em">
          STABIL
        </text>
        <text x={W - 14} y={H - 12} textAnchor="end" fontSize="9.5" fill="var(--accent)" fontWeight="600" letterSpacing=".06em">
          USTABIL
        </text>
        {topics.map((t, i) => {
          const d = isDone(t.id)
          const p = pos(i, topics.length, d)
          const s = t.tier === 1 ? 4.2 : t.tier === 2 ? 3.6 : 3
          return (
            <g key={t.id} className="pole" style={{ transform: `translate(${p.x}px, ${p.y}px)` }}>
              <title>{t.title.replace(/\$[^$]*\$/g, '…')}</title>
              <path
                d={`M${-s} ${-s} L${s} ${s} M${s} ${-s} L${-s} ${s}`}
                stroke={d ? 'var(--ok)' : tierColor[t.tier]}
                strokeWidth={t.tier === 1 ? 2.2 : 1.7}
                strokeLinecap="round"
              />
            </g>
          )
        })}
      </svg>
      <figcaption className="mt-2 text-[13px]">
        {stable ? (
          <span style={{ color: 'var(--ok)', fontWeight: 600 }}>Alle poler i venstre halvplan – systemet er asymptotisk stabilt. Klar for eksamen.</span>
        ) : (
          <span className="muted">
            <strong style={{ color: 'var(--accent)' }}>{unstable}</strong> {unstable === 1 ? 'pol' : 'poler'} i høyre halvplan
            {tier1Left > 0 ? (
              <>
                {' '}
                · {tier1Left} av dem er «Må kunne»
              </>
            ) : (
              ' · nivå 1 er stabilt'
            )}
          </span>
        )}
      </figcaption>
    </figure>
  )
}
