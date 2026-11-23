import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Countdown } from '../components/Countdown'
import { Tex } from '../components/Tex'
import { TopicDetail } from '../components/TopicDetail'
import { ContinueCard } from '../components/ContinueCard'
import { Sidebar } from '../components/Sidebar'
import { SPlane } from '../components/SPlane'
import { useHydrated, useSet, useStored } from '../lib/store'
import { logEvent, pkey, updateTopicMeta, useProblems, useTopicMeta, type Confidence, type ProblemRec, type TopicMeta } from '../lib/db'
import { examShort, lastSeen, parseOcc, recentCount, tierInfo, topics, versions, type Tier, type Topic } from '../data/topics'

export const Route = createFileRoute('/')({ component: Prioritert })

const tierColor: Record<Tier, string> = { 1: 'var(--t1)', 2: 'var(--t2)', 3: 'var(--t3)', 4: 'var(--t4)' }
const tierSoft: Record<Tier, string> = { 1: 'var(--t1-soft)', 2: 'var(--t2-soft)', 3: 'var(--t3-soft)', 4: 'var(--t4-soft)' }

function Prioritert() {
  const done = useSet('done-topics')
  const [hideDone, setHideDone] = useStored('ui:hide-done', false)
  const [meta] = useTopicMeta()
  const [problems] = useProblems()
  const hydrated = useHydrated()
  const isDone = (id: string) => hydrated && done.has(id)
  const total = topics.length
  const doneCount = topics.filter((t) => isDone(t.id)).length
  const next = topics.find((t) => !isDone(t.id))

  return (
    <div className="shell">
      <Sidebar />
      <main className="min-w-0 px-4 pt-8 pb-10 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[860px]">
          {/* ── Hero ── */}
          <div className="grid items-start gap-8 md:grid-cols-[1fr_300px]">
            <div>
              <div className="eyebrow mb-3">
                <Countdown long />
              </div>
              <h1 className="display m-0 text-[44px] sm:text-[64px]">Hva du bør gjøre først</h1>
              <p className="lede mt-5 mb-0">25 eksamenssett, {total} oppgavetyper, rangert etter hvor ofte de kommer igjen.</p>
              <div className="mt-6 flex items-center gap-3 text-[13px]">
                <div className="progress max-w-[280px] flex-1">
                  <div style={{ width: `${(doneCount / total) * 100}%`, background: 'var(--ok)' }} />
                </div>
                <span className="muted tabular-nums">
                  {doneCount} av {total} gjort{next ? ` · neste: nr. ${topics.indexOf(next) + 1}` : ''}
                </span>
              </div>
              <AiLink />
            </div>
            <div className="card-raised p-3">
              <SPlane topics={topics} isDone={isDone} />
            </div>
          </div>

          <ContinueCard />

          {/* ── Eksamensanatomi ── */}
          <section className="mt-10">
            <div className="eyebrow mb-3" style={{ color: 'var(--muted)' }}>
              Eksamen · 4 t · hjelpemiddel D
            </div>
            <div className="flex h-2.5 overflow-hidden rounded-full">
              <div style={{ width: '33%', background: 'var(--t1)' }} />
              <div style={{ width: '53%', background: 'var(--ink)' }} />
              <div style={{ width: '14%', background: 'var(--t3)' }} />
            </div>
            <div className="mt-4 grid gap-5 text-[13.5px] sm:grid-cols-3">
              <Anatomy color="var(--t1)" title="Flervalg" pct="~33 %" text="Samme typer hvert år, nye tall." link={{ to: '/flervalg', label: 'Drill' }} />
              <Anatomy color="var(--ink)" title="Lange oppgaver" pct="~53 %" text="Tilstandsrom, LQR, Kalman for hånd." />
              <Anatomy color="var(--t3)" title="Helikopterlab" pct="12–16 %" text="Tekstsvar om laben." link={{ to: '/formelark', label: 'Formelark' }} />
            </div>
          </section>

          {/* ── Nivåer ── */}
          <div className="mt-12 mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]">
            {([1, 2, 3, 4] as Tier[]).map((tier) => {
              const list = topics.filter((t) => t.tier === tier)
              return (
                <a key={tier} href={`#niva-${tier}`} className="muted no-underline">
                  {tierInfo[tier].name}{' '}
                  <strong className="tabular-nums" style={{ color: tierColor[tier] }}>
                    {list.filter((t) => isDone(t.id)).length}/{list.length}
                  </strong>
                </a>
              )
            })}
            <label className="done-toggle ml-auto">
              <input type="checkbox" checked={hydrated && hideDone} onChange={(e) => setHideDone(e.target.checked)} />
              Skjul gjort
            </label>
          </div>

          {([1, 2, 3, 4] as Tier[]).map((tier) => {
            const list = topics.filter((t) => t.tier === tier)
            const shown = list.filter((t) => !(hydrated && hideDone && isDone(t.id)))
            const first = list.find((t) => !isDone(t.id)) ?? list[0]
            return (
              <section key={tier} className="mt-12" id={`niva-${tier}`} style={{ scrollMarginTop: 80 }}>
                <div className="flex items-center gap-3">
                  <span className="grid h-7 w-7 place-items-center rounded-lg text-sm font-bold text-white" style={{ background: tierColor[tier] }}>
                    {tier}
                  </span>
                  <h2 className="m-0 text-[22px] font-bold tracking-tight">{tierInfo[tier].name}</h2>
                  <span className="faint text-[13px]">{list.length} typer</span>
                </div>
                <p className="lede mt-2 mb-4 text-[14.5px]">{tierInfo[tier].blurb}</p>
                <DrillButton topic={first} problems={problems} label="Start" tier={tier} />
                <ol className="rows mt-6">
                  {shown.map((t) => (
                    <TopicRow
                      key={t.id}
                      t={t}
                      rank={topics.indexOf(t) + 1}
                      done={isDone(t.id)}
                      meta={hydrated ? (meta[t.id] ?? {}) : {}}
                      problems={problems}
                      hydrated={hydrated}
                      onToggle={() => {
                        logEvent(done.has(t.id) ? 'topic-undone' : 'topic-done', t.id)
                        done.toggle(t.id)
                      }}
                    />
                  ))}
                  {shown.length === 0 && <li className="muted py-6 text-center text-sm">Alt gjort.</li>}
                </ol>
              </section>
            )
          })}

          <section className="mt-16 text-center">
            <div className="display text-[30px]">Alt er gjort?</div>
            <p className="muted mt-2">Ta et nytt sett på tid.</p>
            <div className="mt-4 flex justify-center gap-2">
              <Link to="/eksamen/$exam" params={{ exam: '2024' }} className="btn btn-primary">
                2024
              </Link>
              <Link to="/eksamen/$exam" params={{ exam: '2025-kont' }} className="btn">
                Kont 2025
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

function Anatomy({ color, title, pct, text, link }: { color: string; title: string; pct: string; text: string; link?: { to: '/flervalg' | '/formelark'; label: string } }) {
  return (
    <div className="border-l-2 pl-3" style={{ borderColor: color }}>
      <div className="flex items-baseline gap-2">
        <strong>{title}</strong>
        <span className="faint tabular-nums">{pct}</span>
      </div>
      <div className="muted mt-0.5">{text}</div>
      {link && (
        <Link to={link.to} className="mt-1 inline-block font-semibold">
          {link.label} →
        </Link>
      )}
    </div>
  )
}

const CONF: { v: Confidence; label: string; color: string }[] = [
  { v: 1, label: 'Usikker', color: 'var(--bad)' },
  { v: 2, label: 'Nesten', color: 'var(--t2)' },
  { v: 3, label: 'Sitter', color: 'var(--ok)' },
]

function topicProgress(t: Topic, problems: Record<string, ProblemRec>) {
  const keys = [
    ...new Set(
      t.occ.map((o) => {
        const p = parseOcc(o)
        return pkey(p.exam, p.num)
      }),
    ),
  ]
  const ok = keys.filter((k) => problems[k]?.status === 'ok').length
  const again = keys.filter((k) => problems[k]?.status === 'igjen').length
  return { total: keys.length, ok, again }
}

/** Første oppgave i typen som ikke er klart ennå. */
function nextOcc(t: Topic, problems: Record<string, ProblemRec>) {
  const all = t.occ.map(parseOcc)
  return all.find((o) => problems[pkey(o.exam, o.num)]?.status !== 'ok') ?? all[0]
}

function DrillButton({ topic, problems, label, tier }: { topic: Topic; problems: Record<string, ProblemRec>; label: string; tier: Tier }) {
  const o = nextOcc(topic, problems)
  return (
    <Link
      to="/oppgave/$exam/$num"
      params={{ exam: o.exam, num: String(o.num) }}
      search={{ tema: topic.id }}
      className={tier === 1 ? 'btn btn-accent' : 'btn btn-primary'}
    >
      {label} <span aria-hidden>→</span>
    </Link>
  )
}

function TopicRow({
  t,
  rank,
  done,
  meta,
  problems,
  hydrated,
  onToggle,
}: {
  t: Topic
  rank: number
  done: boolean
  meta: TopicMeta
  problems: Record<string, ProblemRec>
  hydrated: boolean
  onToggle: () => void
}) {
  const open = !!meta.open
  const setOpen = (v: boolean) => updateTopicMeta(t.id, { open: v })
  const v = versions(t)
  const r = recentCount(t)
  const prog = topicProgress(t, problems)
  const o = nextOcc(t, problems)
  const primaryTag = t.tags[0]
  return (
    <li id={t.id} className="row" data-done={done}>
      <div className="flex gap-3 py-4 sm:gap-4">
        <div className="row-num w-7 shrink-0 pt-[3px] text-right">{rank}</div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px]">
            <span className="tag" style={{ background: tierSoft[t.tier], color: tierColor[t.tier] }}>
              {primaryTag}
            </span>
            <span className="muted">
              sist {examShort(lastSeen(t))}
              {r > 0 ? ` · ${r} siden 2021` : ''}
            </span>
          </div>
          <button onClick={() => setOpen(!open)} className="block w-full cursor-pointer border-0 bg-transparent p-0 text-left" style={{ color: 'inherit', font: 'inherit' }} aria-expanded={open}>
            <span className="row-title">
              <Tex>{t.title}</Tex>{' '}
              <span className="badge ml-1 align-[2px] font-sans" style={{ background: tierSoft[t.tier], color: tierColor[t.tier] }}>
                {v} {v === 1 ? 'versjon' : 'versjoner'}
              </span>
            </span>
            <Tex as="div" className="muted mt-1 text-[14px]">
              {t.task}
            </Tex>
          </button>
          {hydrated && (prog.ok > 0 || prog.again > 0) && (
            <div className="mt-2.5 flex items-center gap-2 text-[12px]">
              <div className="progress w-32">
                <div style={{ width: `${(prog.ok / prog.total) * 100}%`, background: 'var(--ok)' }} />
                <div style={{ width: `${(prog.again / prog.total) * 100}%`, background: 'var(--bad)' }} />
              </div>
              <span className="muted tabular-nums">
                {prog.ok}/{prog.total} klart{prog.again ? ` · ${prog.again} øv igjen` : ''}
              </span>
            </div>
          )}
          {open && (
            <>
              <TopicDetail t={t} />
              <TopicNote id={t.id} initial={meta.note ?? ''} />
            </>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]">
            <button onClick={() => setOpen(!open)} className="linkbtn">
              {open ? 'Skjul ↑' : 'Metode ↓'}
            </button>
            <Link to="/oppgave/$exam/$num" params={{ exam: o.exam, num: String(o.num) }} search={{ tema: t.id }} className="font-semibold no-underline" style={{ color: 'var(--accent)' }}>
              Øv →
            </Link>
            <div className="seg ml-auto" role="group" aria-label="Hvor godt kan du dette?">
              {CONF.map((c) => (
                <button
                  key={c.v}
                  aria-pressed={meta.confidence === c.v}
                  style={meta.confidence === c.v ? { color: c.color } : undefined}
                  onClick={() => {
                    const nv = meta.confidence === c.v ? undefined : c.v
                    updateTopicMeta(t.id, { confidence: nv })
                    logEvent('confidence', t.id, nv ?? 0)
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="shrink-0 pt-0.5">
          <label className="done-toggle" title="Merk som gjort">
            <input type="checkbox" checked={done} onChange={onToggle} />
            Gjort
          </label>
        </div>
      </div>
    </li>
  )
}

function TopicNote({ id, initial }: { id: string; initial: string }) {
  const [v, setV] = useState(initial)
  return (
    <label className="mt-4 block text-[13px]">
      <span className="eyebrow" style={{ color: 'var(--muted)' }}>
        Notat
      </span>
      <textarea
        value={v}
        onChange={(e) => {
          setV(e.target.value)
          updateTopicMeta(id, { note: e.target.value })
        }}
        rows={2}
        placeholder="Huskeregler, egne feil …"
        className="input mt-1.5"
      />
    </label>
  )
}

const AI_URL = 'https://ttk.mattepils.no'

/** Lenke til chatbot-kontekst (llms.txt) med kopier-knapp. */
function AiLink() {
  const [copied, setCopied] = useState(false)
  return (
    <div className="muted mt-3 flex flex-wrap items-center gap-2 text-[13px]">
      <span>Til chatbot:</span>
      <button
        className="btn btn-sm"
        onClick={() => {
          navigator.clipboard?.writeText(AI_URL).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
          })
        }}
      >
        {copied ? 'Kopiert ✓' : 'Kopier lenke'}
      </button>
      <a href="/llms.txt" target="_blank" rel="noreferrer">
        llms.txt
      </a>
    </div>
  )
}
