// Lager public/llms.txt (kontekst for en chatbot) og public/llm/<eksamen>.txt.
// Kjør: node scripts/build-llms.ts [tekst-mappe]
// Uten tekst-mappe lages bare llms.txt; eksamenstekstene som allerede ligger i public/llm beholdes.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { topics, tierInfo, parseOcc, examLabel, type Tier } from '../src/data/topics.ts'
import { mcQuestions } from '../src/data/mc.ts'

const BASE = 'https://raw.githubusercontent.com/kristiangjestad/ttk4115/main/public/llm'
const root = new URL('..', import.meta.url).pathname
const exams: { id: string; dir: string; solDir?: string; year: number; kont: boolean; problems: { num: number; pct?: number }[] }[] = JSON.parse(
  readFileSync(join(root, 'src/data/exams.json'), 'utf8'),
)
const outDir = join(root, 'public/llm')
mkdirSync(outDir, { recursive: true })

// ── Eksamenstekster ──
const tekst = process.argv[2]
const clean = (s: string) =>
  s
    .replace(/\f/g, '\n')
    .replace(/[\u0000-\u0008\u000b\u000e-\u001f]/g, '')
    .replace(/[ \t]+$/gm, '')
    .replace(/^.*Phone:.*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
const txtName = (dir: string) => dir.replace(/^Exam_(\d{4})/, 'Exam_($1)') + '.txt'
if (tekst) {
  for (const e of exams) {
    const parts = [`# ${examLabel(e.id)} – TTK4115 Lineær systemteori`, '', 'Tekst hentet automatisk fra PDF. Matriser og brøker kan stå rotete over flere linjer.', '']
    const ex = join(tekst, txtName(e.dir))
    if (existsSync(ex)) parts.push('## Oppgavetekst', '', clean(readFileSync(ex, 'utf8')), '')
    const sol = e.solDir && join(tekst, txtName(e.solDir))
    if (sol && existsSync(sol)) parts.push('## Løsningsforslag', '', clean(readFileSync(sol, 'utf8')), '')
    writeFileSync(join(outDir, `${e.id}.txt`), parts.join('\n'))
  }
}

// ── llms.txt ──
const link = (id: string) => `${BASE}/${id}.txt`
const L: string[] = []
L.push(`# TTK4115 Lineær systemteori (NTNU) – kontekst for eksamensøving

> Til deg som er chatbot: Brukeren øver til skriftlig eksamen i TTK4115 (4 timer, hjelpemiddel D: bare enkel kalkulator og formelarket som følger med). Bruk dette dokumentet som pensumkart. Prioriter oppgavetypene i rekkefølgen under. Svar kort, på norsk, med samme notasjon som emnet ($\\dot x=Ax+Bu$, $y=Cx$, $u=-Kx+K_r r$, Kalman med $P^-$, $L$, $Q_d$, $R_d$). Vis utregningen steg for steg, og si fra når du er usikker. Når brukeren spør om en gammel oppgave, hent teksten og løsningsforslaget fra lenken til eksamenen nedenfor, og løs den slik løsningsforslaget gjør. Lag gjerne nye varianter med nye tall av typene på nivå 1.

## Eksamensformat (2023–2025, emneansvarlig Morten O. Alver)

- ~33 %: 4–8 flervalgsoppgaver à 4–6 %. Samme typer hvert år med nye tall.
- ~53 %: 2–3 lange oppgaver: tilstandsrom fra a til å, LQR med referanse og integralvirkning, Kalmanfilter for hånd.
- 12–16 %: tekstspørsmål om helikopterlabben (2022, 2023, kont 2024, kont 2025; ikke ordinær 2024).
- Formelarket (4 sider bakerst i settet) har: løsningsformelen for $x(t)$ og $x[k]$, $\\mathcal C$ og $\\mathcal O$, realisering på styrbar kanonisk form, LQR-kriteriet med Riccati-likningen og $u=-R^{-1}B^TPx$, Lyapunov-likningen, Kalmanfilteret (diskret og kontinuerlig), autokorrelasjon og spektraltetthet, Laplace-par og andregradsformelen. Stabilitetskriterier, rangtesten (full rang), $K_r$-formelen, integralvirkning, diskretisering ($A_d$, $B_d$, van Loan) og Bryson står IKKE der.

## Prioritert liste: ${topics.length} oppgavetyper
`)
for (const tier of [1, 2, 3, 4] as Tier[]) {
  L.push(`\n### Nivå ${tier}: ${tierInfo[tier].name}\n\n${tierInfo[tier].blurb}\n`)
  for (const t of topics.filter((x) => x.tier === tier)) {
    L.push(`#### ${topics.indexOf(t) + 1}. ${t.title}\n`)
    L.push(`Typisk oppgave: ${t.task}\n`)
    L.push(`Hvorfor viktig: ${t.why}\n`)
    L.push('Metode:')
    t.method.forEach((m, i) => L.push(`${i + 1}. ${m}`))
    if (t.traps?.length) {
      L.push('\nFeller:')
      t.traps.forEach((m) => L.push(`- ${m}`))
    }
    if (t.onSheet) L.push(`\nFormelark: ${t.onSheet}`)
    const occ = t.occ.map((s) => {
      const o = parseOcc(s)
      return `${examLabel(o.exam)} oppg. ${o.num}${o.parts}${o.note ? ` (${o.note})` : ''}`
    })
    L.push(`\nGitt på eksamen: ${occ.join('; ')}\n`)
  }
}

L.push('\n## Fasit flervalg (fra løsningsforslagene)\n')
for (const q of mcQuestions) {
  const t = topics.find((x) => x.id === q.topic)!
  L.push(`- ${examLabel(q.exam)} oppg. ${q.num}: ${q.answer.join(' og ')} (${t.title})`)
}

L.push('\n## Eksamener med løsningsforslag (ren tekst)\n')
L.push('Nyeste først. 2021 og senere ligner mest på årets eksamen.\n')
for (const e of exams.slice().sort((a, b) => b.year - a.year || Number(b.kont) - Number(a.kont))) {
  if (!existsSync(join(outDir, `${e.id}.txt`))) continue
  L.push(`- ${examLabel(e.id)}${e.solDir ? '' : ' (uten løsningsforslag)'}: ${link(e.id)}`)
}
L.push('')

writeFileSync(join(root, 'public/llms.txt'), L.join('\n'))
console.log('llms.txt:', L.join('\n').length, 'tegn')
