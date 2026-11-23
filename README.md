# stabil – TTK4115 eksamensøving

Prioritert eksamensøving i TTK4115 Lineær systemteori (NTNU), bygget med TanStack Start og deployet på Cloudflare Workers.

Alle eksamenssett fra 2003 til 2025 er delt inn i 33 oppgavetyper. De er rangert i fire nivåer (Må kunne, Sannsynlig, Bør gjøre og Hvis du har tid) etter hvor ofte de har kommet på eksamen. Inspirert av [mattepils.no/prioritert](https://mattepils.no/prioritert).

- **Prioritert:** metode, feller og lenker til alle eksamensoppgavene av hver type. Fremgangen vises som poler i s-planet.
- **Flervalg:** drill av de 18 flervalgsoppgavene fra 2023–2025, med fasit.
- **Gamle eksamener:** hver oppgave for seg med løsningsforslag, eller hele settet med fire timers nedtelling.
- **Fremgang:** statistikk, notater og eksport/import.

- **Til chatbot:** `public/llms.txt` er kontekst du kan lime inn som lenke i en chatbot. Lag den på nytt med `npm run llms` (krever `../tekst`).

All tilstand lagres i nettleseren (localStorage). Se `src/lib/db.ts` for hva som lagres.

## Kjøre lokalt

    npm install
    npm run dev        # http://localhost:3000

## Deploy til Cloudflare

    npx wrangler login   # første gang
    npm run deploy

## Innhold

| Fil | Hva |
| --- | --- |
| `src/data/topics.ts` | Den prioriterte lista: nivå, metode, feller og hvilke eksamensoppgaver som hører til |
| `src/data/mc.ts` | Fasit til flervalgsoppgavene |
| `src/data/exams.json` | Sideintervall per oppgave i eksamen og løsningsforslag (generert) |
| `public/sider/` | Eksamenssidene som bilder (generert) |

### Lage data og bilder på nytt fra PDF-ene

PDF-ene ligger ikke i repoet. Med eksamens-PDF-ene (`Exam_(ÅÅÅÅ).pdf`, `Exam_(ÅÅÅÅ)_solution.pdf`, …) i en mappe:

    python3 scripts/index_exams.py <pdf-mappe> src/data/exams.json
    # for hver PDF: pdftoppm -jpeg -jpegopt quality=72 -scale-to-x 1100 -scale-to-y -1 <pdf> public/sider/<navn uten parenteser>/p
    # gi filene nytt navn fra p-01.jpg til 1.jpg, deretter:
    python3 scripts/trim_pages.py public/sider

Krever `poppler-utils` (pdftotext, pdfinfo, pdftoppm) og Pillow.
