import { Link } from '@tanstack/react-router'
import { Countdown } from './Countdown'

const links = [
  { to: '/', label: 'Prioritert' },
  { to: '/flervalg', label: 'Flervalg' },
  { to: '/eksamener', label: 'Gamle eksamener' },
  { to: '/formelark', label: 'Formelark' },
  { to: '/fremgang', label: 'Fremgang' },
] as const

export function Nav() {
  return (
    <header className="topbar">
      <div className="wrap-wide flex h-14 items-center gap-4">
        <Link to="/" className="flex shrink-0 items-center gap-2 no-underline" style={{ color: 'var(--fg)' }}>
          <Logo />
          <span className="display text-[22px]" style={{ letterSpacing: '-0.04em' }}>
            stabil
          </span>
          <span className="badge">TTK4115</span>
        </Link>
        <nav className="-mx-2 flex min-w-0 flex-1 gap-1 overflow-x-auto text-[13.5px] sm:justify-end" style={{ scrollbarWidth: 'none' }}>
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="shrink-0 rounded-lg px-2.5 py-1.5 no-underline"
              activeOptions={{ exact: l.to === '/' }}
              style={{ color: 'var(--muted)' }}
              activeProps={{ style: { color: 'var(--fg)', background: 'var(--sunken)', fontWeight: 600 } }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden shrink-0 text-[13px] xl:block">
          <Countdown />
        </div>
      </div>
    </header>
  )
}

/** Sprangrespons som logo – stabilt system som legger seg. */
export function Logo({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <rect width="32" height="32" rx="8" fill="var(--ink)" />
      <path d="M5 24 C 9 24, 10 8, 14 9 S 18 17, 21 15 S 25 13, 27 13.5" stroke="var(--accent)" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M5 13.5 H27" stroke="var(--surface)" strokeOpacity=".35" strokeWidth="1.2" strokeDasharray="2 2.5" />
    </svg>
  )
}
