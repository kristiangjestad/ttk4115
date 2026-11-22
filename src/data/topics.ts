// Prioritert liste over oppgavetyper i TTK4115, bygget fra alle eksamener 2003–2025.
// Forekomster skrives som "eksamen:oppgave[deler]" med valgfri merknad etter "|".
// Eksempel: "2024:1|flervalg", "2024-kont:1ab".

export type Tier = 1 | 2 | 3 | 4

export interface Topic {
  id: string
  tier: Tier
  title: string
  /** Én linje: hva oppgaven ber om. */
  task: string
  /** Korte merkelapper, som på mattepils. */
  tags: string[]
  /** Hvorfor den står der den står. */
  why: string
  /** Fremgangsmåte, ett steg per linje. Støtter $inline$ og $$blokk$$ LaTeX. */
  method: string[]
  /** Vanlige feller. */
  traps?: string[]
  /** Står formelen på formelarket? */
  onSheet?: string
  occ: string[]
}

export const tierInfo: Record<Tier, { name: string; blurb: string }> = {
  1: {
    name: 'Må kunne',
    blurb:
      'På nesten hver eksamen siden 2021. Lær alle, i rekkefølge.',
  },
  2: {
    name: 'Sannsynlig',
    blurb:
      'Omtrent annenhver eksamen. Ta dem når nivå 1 sitter.',
  },
  3: {
    name: 'Bør gjøre',
    blurb: 'Kommer innimellom, ofte som deloppgave.',
  },
  4: {
    name: 'Hvis du har tid',
    blurb: 'Ikke gitt de siste årene. Bare skum metoden.',
  },
}

export const topics: Topic[] = [
  // ───────────────────────── NIVÅ 1 ─────────────────────────
  {
    id: 'kalman-diskret',
    tier: 1,
    title: 'Diskret Kalmanfilter – ett steg for hånd',
    task: 'Gitt $\\hat x[0], P[0], Q_d, R_d$ og en måling $y[1]$: regn ut $L[1]$, $\\hat x[1]$ og $P[1]$.',
    tags: ['20 %-oppgave', 'regning', 'formel på arket'],
    why: 'Kommer på hver eneste eksamen siden 2019, nesten alltid med 2×2-modellen posisjon/hastighet $A=\\begin{bmatrix}1&1\\\\0&1\\end{bmatrix}$, $C=[1\\;0]$. Ordinær 2024, kont 2024, kont 2025, 2022 og kont 2021 er samme oppgave med nye tall.',
    method: [
      '**Sjekk hvor du starter.** Er $\\hat x[0], P[0]$ a posteriori (etter måling) må du først predikere: $\\hat x^-[1]=A\\hat x[0]+Bu[0]$, $P^-[1]=AP[0]A^T+Q_d$.',
      '**Kalman-gain:** $L = P^-C^T\\,(CP^-C^T+R_d)^{-1}$. Med skalar måling er $CP^-C^T+R_d$ et tall – bare del på det. For $C=[1\\;0]$: $L=\\dfrac{1}{P^-_{11}+R}\\begin{bmatrix}P^-_{11}\\\\P^-_{21}\\end{bmatrix}$.',
      '**Oppdater estimat:** $\\hat x[1]=\\hat x^-[1]+L\\,(y[1]-C\\hat x^-[1])$. Innovasjonen $y-C\\hat x^-$ er ett tall.',
      '**Oppdater kovarians:** $P=(I-LC)P^-$ (kortformen, raskest for hånd) – Joseph-formen på arket gir det samme med optimal $L$.',
      '**Neste steg (om de spør):** $\\hat x^-[2]=A\\hat x[1]+Bu[1]$, $P^-[2]=AP[1]A^T+Q_d$.',
      'Standardavvik oppgitt? Variansen er kvadratet: «± 5» → $P_{11}=25$, «σ = 10 m» → $R=100$.',
    ],
    traps: [
      'Glemme prediksjonssteget før første måling (de fleste feil skjer her).',
      'Bruke standardavvik i stedet for varians i $P$ eller $R$.',
      'Uavhengige initialverdier ⇒ $P[0]$ diagonal.',
    ],
    onSheet: 'Ja – hele algoritmen (steg 1–4) står på formelarket.',
    occ: [
      '2025-kont:7ab', '2024:10c', '2024-kont:2b', '2022:3b', '2021-kont:3e', '2020:10c',
      '2019:2', '2019-kont:6b', '2017:5', '2013:4a', '2012:7a',
    ],
  },
  {
    id: 'styr-obs',
    tier: 1,
    title: 'Styrbarhet og observerbarhet (rangtest)',
    task: 'Er systemet styrbart/observerbart? For hvilke parameterverdier mister det styrbarhet?',
    tags: ['flervalg', 'alltid', 'formel på arket'],
    why: 'Står på hver eneste eksamen siden 2003. Siden 2023 er den oppgave 1 (flervalg), og i tillegg deloppgave a) i den store tilstandsromsoppgaven.',
    method: [
      '$\\mathcal C=[B\\;AB\\;\\cdots\\;A^{n-1}B]$, $\\mathcal O=[C;\\,CA;\\,\\dots;\\,CA^{n-1}]$.',
      'For $n=2$ med én inngang/utgang: kvadratisk matrise ⇒ regn determinanten. $\\det\\neq0$ ⇔ full rang.',
      'For $n=3$: regn $AB$ og $A^2B$ (eller $CA$, $CA^2$), sett opp 3×3, sjekk determinant eller se etter lineært avhengige rader/kolonner.',
      'Parameter (α, β): sett $\\det\\mathcal C=0$ og løs for parameteren.',
      'Diskret tid: nøyaktig samme test – $A$ er bare $A_d$.',
      'Rask sjekk: diagonal $A$ med distinkte egenverdier ⇒ styrbar ⇔ ingen rad i $B$ er null; observerbar ⇔ ingen kolonne i $C$ er null.',
    ],
    traps: [
      'Flervalg: les alternativene nøye – «Controllable, not observable» vs «Observable, not controllable».',
      'Ikke-styrbar betyr ikke ustabil – sjekk stabiliserbarhet separat.',
    ],
    onSheet: 'Ja – $\\mathcal C$ og $\\mathcal O$ står på arket. Testen (full rang) må du kunne.',
    occ: [
      '2025-kont:5a', '2024:1|flervalg', '2024-kont:1a', '2023:1|flervalg', '2022:1a', '2021:1a',
      '2021-kont:1a', '2021-kont:4c', '2020:10a', '2020:12a', '2019:5b', '2019-kont:4', '2017-kont:3ab',
      '2016:1ac', '2015:4a', '2014:1ab', '2013:1a', '2012:1cd', '2011:3a', '2008:2c', '2004:3a', '2003:1a',
    ],
  },
  {
    id: 'stabilitet',
    tier: 1,
    title: 'Intern stabilitet vs. BIBO-stabilitet',
    task: 'Er systemet internt (asymptotisk/marginalt) stabilt? Er det BIBO-stabilt?',
    tags: ['flervalg', 'alltid', 'ikke på arket'],
    why: 'Flervalg på 2023, 2024 og kont 2025 (alltid med «Internt ustabilt men BIBO-stabilt» som riktig eller fristende svar), og deloppgave i nesten alle lange oppgaver.',
    method: [
      '**Intern stabilitet (kontinuerlig):** egenverdier til $A$. Alle $\\text{Re}\\,\\lambda<0$ ⇒ asymptotisk stabil. $\\text{Re}\\,\\lambda\\le0$ og egenverdier på imaginæraksen er *enkle* (Jordanblokk 1×1) ⇒ marginalt stabil. Ellers ustabil.',
      '**Diskret tid:** samme, men med $|\\lambda|<1$ (asymptotisk) og $|\\lambda|=1$ enkle (marginal).',
      '**BIBO:** regn $G(s)=C(sI-A)^{-1}B+D$, forkort fellesfaktorer. BIBO ⇔ alle poler i $G(s)$ har $\\text{Re}<0$.',
      'Asymptotisk stabil ⇒ alltid BIBO. Omvendt gjelder bare når realiseringen er minimal (styrbar + observerbar).',
      'Klassiker: ustabil egenverdi som er ustyrbar eller uobserverbar forsvinner i $G(s)$ ⇒ **internt ustabil, men BIBO-stabil**.',
      'Øvre triangulær $A$: egenverdiene står på diagonalen. 2×2: $\\lambda^2-\\text{tr}(A)\\lambda+\\det A=0$.',
      'Dobbel egenverdi i 0: sjekk om $A=0$ (marginal) eller Jordanblokk $\\begin{bmatrix}0&1\\\\0&0\\end{bmatrix}$ (ustabil, $x$ vokser som $t$).',
    ],
    traps: [
      'Marginalt stabil ≠ BIBO-stabil: en pol i 0 i $G(s)$ gir ubegrenset utgang for et sprang.',
      'Symmetrisk negativ definitt $A$ ⇒ alle egenverdier reelle og negative ⇒ asymptotisk stabil (2024 opg. 4).',
    ],
    onSheet: 'Nei – kriteriene må pugges.',
    occ: [
      '2025-kont:1|flervalg', '2025-kont:5b', '2024:2|flervalg', '2024:4|flervalg', '2024:10a', '2024-kont:1b',
      '2024-kont:2a', '2023:3|flervalg', '2022:1c', '2022:3d', '2021:3a', '2021-kont:3c', '2021-kont:4b',
      '2020:12a', '2019:3', '2019-kont:2', '2018:2', '2015:2bd', '2014:3c', '2013:1c', '2012:1b', '2011:2b',
      '2009:2a', '2008:3', '2004:2', '2003:2cd',
    ],
  },
  {
    id: 'polplassering',
    tier: 1,
    title: 'Polplassering med $u=-Kx$',
    task: 'Finn $K$ slik at $A-BK$ får gitte egenverdier (f.eks. −1 og −2).',
    tags: ['flervalg', 'regning', 'ikke på arket'],
    why: 'Flervalg i 2023 og 2024 (2×2 med parameter ω), deloppgave c) i den store tilstandsromsoppgaven i 2021, 2022, kont 2024 og kont 2025.',
    method: [
      'Ønsket karakteristisk polynom: $(s-\\lambda_1)(s-\\lambda_2)$, f.eks. $(s+1)(s+2)=s^2+3s+2$.',
      'Sett $K=[k_1\\;k_2]$, regn $A-BK$ og $\\det(sI-(A-BK))$.',
      'Sammenlign koeffisienter og løs for $k_1,k_2$.',
      'Flervalg: det går ofte raskere å sette inn hvert alternativ og sjekke $\\text{tr}(A-BK)=\\lambda_1+\\lambda_2$ og $\\det(A-BK)=\\lambda_1\\lambda_2$.',
      'Styrbar kanonisk form (2021): $K$ leses rett ut av koeffisientdifferansen, og transformeres tilbake med $K=\\bar K P^{-1}$ når $x=P\\bar x$.',
    ],
    traps: [
      'Fortegn: $u=-Kx$ ⇒ lukket sløyfe er $A-BK$, ikke $A+BK$.',
      'Bare mulig for vilkårlige poler hvis $(A,B)$ er styrbar – si det!',
      'Kont 2024: poler langt til venstre ⇒ store pådrag/metning – «kan vi bruke dette i praksis?»',
    ],
    onSheet: 'Nei.',
    occ: [
      '2025-kont:5c', '2024:5|flervalg', '2024-kont:1cd', '2023:5|flervalg', '2022:1d', '2021:1cd', '2020:9cd',
      '2019:3', '2017-kont:3c', '2016:1a', '2015:4b', '2014:1c', '2012:3c', '2011:2d', '2003:1b',
    ],
  },
  {
    id: 'referanse-kr',
    tier: 1,
    title: 'Referansefølging: $u=-Kx+K_r r$',
    task: 'Finn $K_r$ slik at $y\\to r_0$ stasjonært / hvilken $(k,k_r)$ gir raskest konvergens?',
    tags: ['flervalg', 'kort', 'ikke på arket'],
    why: 'Flervalg i 2023 og kont 2025 (identisk oppgave med nye tall), del a) i 20 %-oppgavene i 2024 og kont 2024, del e) i 2022.',
    method: [
      'Lukket sløyfe: $\\dot x=(A-BK)x+BK_r r_0$. Stasjonært: $0=(A-BK)x_\\infty+BK_rr_0$.',
      '$y_\\infty=-C(A-BK)^{-1}BK_r\\,r_0$. Krev $y_\\infty=r_0$ ⇒ $$K_r=\\big[-C(A-BK)^{-1}B\\big]^{-1}$$',
      'Skalar $\\dot x=ax+bu$: $K_r=\\dfrac{k b-a}{b}$, dvs. $k_r = k - a/b$. For $b=1$: $k_r=k-a$.',
      '«Raskest konvergens»: lukket-sløyfe-pol $a-bk$ skal være mest negativ, *og* $k_r$ må stemme med formelen over. Sjekk begge!',
    ],
    traps: [
      'Flervalgsalternativene har alltid ett med størst $k$ men feil $k_r$ – det er feil svar.',
      'Med en ukjent konstant forstyrrelse gir $K_r$ alene stasjonært avvik ⇒ trenger integralvirkning (se «Integralvirkning»).',
    ],
    onSheet: 'Nei.',
    occ: ['2025-kont:3|flervalg', '2024:9a', '2024-kont:3b', '2023:4|flervalg', '2022:1e', '2021:4ab', '2020:9e', '2013:2c'],
  },
  {
    id: 'spektral',
    tier: 1,
    title: 'Spektraltetthet og hvit støy',
    task: 'Finn $S_y(\\omega)$ når hvit støy filtreres gjennom $H(s)$ / hvilken modell gir gitt $S(\\omega)$?',
    tags: ['flervalg', 'alltid', 'formel på arket'],
    why: 'Flervalg i 2023 og 2024, egen oppgave i 2022 og kont 2024, deloppgave i 2021 og kont 2025. Har kommet på 14 eksamener totalt.',
    method: [
      'Hvit støy: $R_w(\\tau)=q\\,\\delta(\\tau)$ ⇔ $S_w(\\omega)=q$ (flat). Null middelverdi, uendelig varians, ukorrelert med seg selv ved alle $\\tau\\neq0$.',
      '**Hovedformelen:** $y=H(s)w$ ⇒ $S_y(\\omega)=H(j\\omega)H(-j\\omega)\\,S_w(\\omega)=|H(j\\omega)|^2S_w$.',
      'Fra ODE: $\\ddot x-3\\dot x+ax=u$ ⇒ $H(s)=\\dfrac1{s^2-3s+a}$ ⇒ $|H(j\\omega)|^2=\\dfrac{1}{(a-\\omega^2)^2+9\\omega^2}$.',
      'Tilstandsrom til spektrum: $H(s)=C(sI-A)^{-1}B$ (+D). Eks: $\\dot x=-\\omega_0x+ku,\\ y=x$ ⇒ $S_y=\\dfrac{k^2}{\\omega^2+\\omega_0^2}$.',
      '**Formfilter (baklengs):** $S(\\omega)=\\dfrac{c}{\\omega^2+a^2}$ ⇒ $H(s)=\\dfrac{\\sqrt c}{s+a}$ (polene i venstre halvplan).',
      'Autokorrelasjon ↔ spektrum: $\\sigma^2e^{-\\beta|\\tau|}$ ⇔ $\\dfrac{2\\sigma^2\\beta}{\\omega^2+\\beta^2}$ (Gauss–Markov). Varians $=R(0)$.',
      'To uavhengige bidrag (f.eks. $y=x+v$): spektrene adderes, $S_y=S_x+S_v$.',
    ],
    traps: [
      'Glemme $q$ (intensiteten) eller kvadratet på forsterkningen $k$.',
      'Spektraltetthet er alltid reell og ≥ 0 – alternativer med $j\\omega$ i er feil.',
    ],
    onSheet: 'Delvis – $S_y=H(j\\omega)H(-j\\omega)q$ står på arket. Fourierpar for $e^{-\\beta|\\tau|}$ gjør ikke.',
    occ: [
      '2025-kont:6c', '2024:7|flervalg', '2024-kont:4abc', '2023:7|flervalg', '2022:2ab', '2021:3b', '2015:5ab',
      '2014:5abc', '2013:3ab', '2012:6', '2010:4', '2009:3a', '2004:4ac', '2003:6',
    ],
  },
  {
    id: 'ekvivalens',
    tier: 1,
    title: 'Algebraisk ekvivalens, nulltilstands-ekvivalens, duale systemer',
    task: 'Gitt to tilstandsrommodeller: er de urelaterte, algebraisk ekvivalente, nulltilstands-ekvivalente eller duale?',
    tags: ['flervalg', 'hvert år siden 2023', 'ikke på arket'],
    why: 'Nøyaktig samme flervalgsoppgave i 2023, 2024 og kont 2025 – bare nye matriser. Gratis poeng hvis du har en fast rekkefølge.',
    method: [
      '**1. Dual?** Sjekk om $A_2=A_1^T$, $B_2=C_1^T$, $C_2=B_1^T$. Raskest – gjør den først.',
      '**2. Algebraisk ekvivalent** ($\\bar A=PAP^{-1}$ osv.) krever samme egenverdier: sammenlign $\\text{tr}(A)$ og $\\det(A)$. Ulike ⇒ ikke ekvivalente.',
      '**3. Nulltilstands-ekvivalent** ⇔ samme transferfunksjon $G(s)$. Regn begge. Like $G(s)$ men ulik dimensjon/ulike egenverdier ⇒ «zero-state equivalent but not algebraically equivalent».',
      'Samme dimensjon, samme $G(s)$ og begge minimale ⇒ algebraisk ekvivalente.',
      'Ulike $G(s)$ og ikke dual ⇒ «Unrelated».',
      'Tips: $G(s)$ er bestemt av Markov-parametrene $D, CB, CAB, \\dots$ og karakteristisk polynom. For 2×2 med $D=0$: like $CB$, $CAB$, $\\text{tr}A$ og $\\det A$ ⇒ samme $G(s)$.',
    ],
    traps: ['Algebraisk ekvivalent ⇒ alltid også nulltilstands-ekvivalent (men ikke omvendt).'],
    onSheet: 'Nei.',
    occ: ['2025-kont:4|flervalg', '2024:6|flervalg', '2023:6|flervalg', '2021:1e', '2021-kont:1g'],
  },
  {
    id: 'diag-jordan',
    tier: 1,
    title: 'Egenverdier/-vektorer, diagonal-, Jordan- og modalform',
    task: 'Transformer systemet til diagonal- (eller Jordan-) form: finn $\\Lambda$/$J$ og $Q$.',
    tags: ['flervalg', 'regning', 'ikke på arket'],
    why: 'Flervalg i 2024, deloppgave i kont 2024, kont 2025, kont 2021 og 2020. Har kommet på 14 eksamener.',
    method: [
      'Egenverdier: $\\det(\\lambda I-A)=0$. Egenvektorer: løs $(A-\\lambda I)q=0$.',
      '$Q=[q_1\\;q_2]$, $\\Lambda=Q^{-1}AQ$ ($AQ=Q\\Lambda$). Nytt system: $\\bar A=\\Lambda$, $\\bar B=Q^{-1}B$, $\\bar C=CQ$.',
      '**Dobbel egenverdi:** færre egenvektorer enn multiplisitet ⇒ Jordanform $J=\\begin{bmatrix}\\lambda&1\\\\0&\\lambda\\end{bmatrix}$. Generalisert egenvektor: $(A-\\lambda I)q_2=q_1$.',
      '**Komplekse egenverdier $\\sigma\\pm j\\omega$:** modalform $\\begin{bmatrix}\\sigma&\\omega\\\\-\\omega&\\sigma\\end{bmatrix}$ med $Q=[\\text{Re}\\,q\\;\\;\\text{Im}\\,q]$ – alle koeffisienter reelle (kont 2021, kont 2025).',
      'Flervalg: sjekk $AQ=QJ$ direkte for hvert alternativ – raskere enn å regne selv.',
    ],
    traps: ['Ved Jordanform: rekkefølgen i $Q$ betyr noe – $q_1$ er egenvektoren, $q_2$ den generaliserte.'],
    onSheet: 'Nei.',
    occ: [
      '2025-kont:5d', '2024:3|flervalg', '2024-kont:1f', '2023:8d', '2021-kont:1b', '2020:9b', '2018:3', '2015:2a',
      '2013:1b', '2012:1a', '2010:1b', '2009:1bc', '2008:1a', '2003:2ab',
    ],
  },
  {
    id: 'eat',
    tier: 1,
    title: 'Matriseeksponentialen $e^{At}$',
    task: 'Finn $e^{At}$ (eller ett element av den) eksakt.',
    tags: ['flervalg', 'regning', 'ikke på arket'],
    why: 'Flervalg i 2023 og kont 2025 (samme oppgave: «øvre venstre element av $e^{At}$»), egen deloppgave i kont 2021 og 2020.',
    method: [
      '**Metode 1 (Cayley–Hamilton, 2×2):** $e^{At}=\\beta_0I+\\beta_1A$. Løs $e^{\\lambda_it}=\\beta_0+\\beta_1\\lambda_i$ for begge egenverdiene.',
      '  Øvre venstre element: $\\beta_0+\\beta_1a_{11}$.',
      '  Dobbel egenverdi: bruk i tillegg den deriverte, $te^{\\lambda t}=\\beta_1$.',
      '**Metode 2 (Laplace):** $e^{At}=\\mathcal L^{-1}\\{(sI-A)^{-1}\\}$, delbrøkoppspalt hvert element.',
      '**Metode 3 (diagonal):** $e^{At}=Qe^{\\Lambda t}Q^{-1}$.',
      'Triangulær $A$ med dobbel egenverdi 0, f.eks. $\\begin{bmatrix}0&1\\\\0&0\\end{bmatrix}$: $e^{At}=I+At$ (rekken stopper).',
      'Flervalg-sjekk: $e^{A\\cdot0}=I$ ⇒ øvre venstre element må bli 1 ved $t=0$. Det stryker ofte halve alternativene.',
    ],
    onSheet: 'Nei – men løsningsformelen $x(t)=e^{At}x(0)+\\int e^{A(t-\\tau)}Bu\\,d\\tau$ står der.',
    occ: ['2025-kont:2|flervalg', '2023:2|flervalg', '2021-kont:5a', '2020:9a', '2010:1cd', '2008:1b', '2004:1a', '2003:2f'],
  },
  {
    id: 'utvidet-modell',
    tier: 1,
    title: 'Utvidet tilstandsrom for Kalmanfilter (bias, last, farget støy)',
    task: 'Sett opp en utvidet modell slik at forstyrrelse/bias kan estimeres, og angi $Q_d$ og $R_d$.',
    tags: ['20 %-oppgave', 'oppsett', 'ikke på arket'],
    why: 'Del av Kalmanoppgaven i 2021, 2022, 2023, kont 2021 og kont 2024. Kalmanfilteret krever hvit støy – alt som ikke er hvitt må inn som en tilstand.',
    method: [
      '**Saktevarierende last/bias (random walk):** $d[k+1]=d[k]+w_d[k]$ ⇒ legg $d$ til som tilstand: $\\begin{bmatrix}x\\\\d\\end{bmatrix}[k+1]=\\begin{bmatrix}a&1\\\\0&1\\end{bmatrix}\\begin{bmatrix}x\\\\d\\end{bmatrix}[k]+\\dots$',
      '**Gauss–Markov-bias:** $\\sigma[k+1]=0.9\\sigma[k]+v_2[k]$ ⇒ tilstand med egenverdi 0.9. Målingen blir $y=x+\\sigma+v_1$ ⇒ $C=[1\\;1]$.',
      '**Farget støy med spektrum $S(\\omega)$:** finn formfilter $H(s)$ (se «Spektraltetthet»), realiser det ($A_\\beta,B_\\beta,C_\\beta$) og legg filtertilstandene inn: $\\begin{bmatrix}\\dot x\\\\\\dot x_\\beta\\end{bmatrix}=\\begin{bmatrix}A&GC_\\beta\\\\0&A_\\beta\\end{bmatrix}\\begin{bmatrix}x\\\\x_\\beta\\end{bmatrix}+\\begin{bmatrix}0\\\\B_\\beta\\end{bmatrix}w$.',
      '$Q_d$ = kovariansen til den hvite støyen som driver hver tilstand (diagonal hvis uavhengige). $R_d$ = variansen til den hvite målestøyen.',
      'Kjent ikke-null middelverdi i en forstyrrelse (kont 2024 d): flytt middelverdien inn som et kjent pådrag $Bu$, og la variansen rundt den gå i $Q_d$.',
    ],
    traps: ['Bias i målingen påvirker $C$, ikke $A$. Bias i prosessen påvirker $A$.'],
    onSheet: 'Nei.',
    occ: ['2024-kont:2d', '2023:9b', '2022:2d', '2021:5b', '2021-kont:5d', '2020:11', '2016:3', '2003:5d'],
  },
  {
    id: 'kalman-kvalitativt',
    tier: 1,
    title: 'Tolke Kalmanfilteret (gain, Q/R, dropout, deteksjon)',
    task: 'Forklar hvorfor $L$ er liten/stor, hva som skjer med $P$ ved dropout, når filteret er optimalt, sannsynlighet fra $P$.',
    tags: ['tekst', 'alltid sammen med regneoppgaven', 'ikke på arket'],
    why: 'Kalmanoppgavene avsluttes nesten alltid med én forklaringsdel (2020, 2022, 2024, kont 2021, kont 2025). Lette poeng hvis du har stikkordene klare.',
    method: [
      '**Optimalitet:** lineær modell, $w$ og $v$ hvite, null middelverdi, Gaussiske, ukorrelerte med hverandre og med $x[0]$; kjente $Q_d,R_d$.',
      '**Liten $L$:** $P^-$ liten i forhold til $R$ ⇒ filteret stoler mer på modellen enn på målingen. Stor $R$ ⇒ mindre gain.',
      '**Øke et diagonalelement i $Q_d$:** mindre tillit til modellen for den tilstanden ⇒ større gain, raskere men mer støyfylt estimat.',
      '**Dropout (ingen måling):** hopp over korreksjon, $P^-$ vokser ($P^-=APA^T+Q$) for hvert steg ⇒ første nye måling får stor gain og stort hopp.',
      '**Stasjonær gain:** $(A,C)$ detekterbar og $(A,\\sqrt Q)$ stabiliserbar ⇒ $P$ og $L$ konvergerer.',
      '**Sannsynlighet:** $x_1\\sim\\mathcal N(\\hat x_1,P_{11})$ – tegn normalfordelingskurven, skraver arealet under grensen (2024 d).',
      '**Avviksdeteksjon:** se på innovasjonen $y-C\\hat x^-$ i forhold til $\\sqrt{CP^-C^T+R}$; mer enn ~2–3 σ ⇒ noe uventet skjedde (kont 2025 c).',
      '**Hvorfor estimator i stedet for å derivere målingen:** derivasjon forsterker støy; modellen filtrerer støy og gir estimater av umålte tilstander.',
    ],
    onSheet: 'Nei.',
    occ: ['2025-kont:7c', '2024:10bd', '2022:3c', '2021-kont:3d', '2021-kont:5e', '2020:10cd', '2015:6', '2003:5bc'],
  },
  {
    id: 'lqr-skalar',
    tier: 1,
    title: 'LQR for 1. ordens system (analytisk Riccati)',
    task: '$\\dot x=ax+bu$, $J=\\int qx^2+ru^2\\,dt$: finn $k$. Hva skjer når $r\\to\\infty$? Stabilt for alle $a$?',
    tags: ['regning', 'kort', 'formel på arket'],
    why: 'Kommer på annenhver eksamen (2021, 2022, kont 2024, kont 2025) og er nesten ordrett lik hver gang.',
    method: [
      'Riccati skalar: $2ap+q-\\dfrac{b^2p^2}{r}=0$ ⇒ $$p=\\frac{r}{b^2}\\Big(a+\\sqrt{a^2+\\tfrac{b^2q}{r}}\\Big)$$ (velg positiv rot).',
      '$k=\\dfrac{bp}{r}=\\dfrac{a+\\sqrt{a^2+b^2q/r}}{b}$.',
      'Lukket sløyfe: $a-bk=-\\sqrt{a^2+b^2q/r}<0$ ⇒ **alltid stabil**, uansett fortegn på $a$.',
      'Bare forholdet $q/r$ betyr noe (kont 2024 a).',
      '$r\\to\\infty$ (dyrt pådrag): stabilt $a<0$ ⇒ $k\\to0$; ustabilt $a>0$ ⇒ $k\\to 2a/b$ (speiler polen til $-a$).',
      'Usikker $a$ (2021 b), $b=1$: ekte $a\'\\le1.5a$ ⇒ $a\'-k=a\'-a-\\sqrt{a^2+q/r}\\le0.5a-\\sqrt{a^2+q/r}<0$ ⇒ alltid stabil.',
    ],
    onSheet: 'Ja – Riccatiligningen og $u=-R^{-1}B^TPx$ står på arket.',
    occ: ['2025-kont:6ab', '2024-kont:3a', '2022:4a', '2021:2', '2019-kont:1a', '2017-kont:2a', '2017:3', '2016:4'],
  },
  {
    id: 'lqr-matrise',
    tier: 1,
    title: 'LQR med matriser og tuning (Q, R, Bryson)',
    task: 'Gitt (deler av) $P$: regn $K=R^{-1}B^TP$. Hvordan endre $Q$/$R$ for å gjøre regulatoren raskere/roligere?',
    tags: ['20 %-oppgave', 'tekst + regning', 'formel på arket'],
    why: 'I 2023 (gitt $P$, finn $K$), 2024 (Segway, off-diagonal i $P$ oppgitt), kont 2021 (Bryson og tuning). Pluss lab-spørsmål om LQR.',
    method: [
      '$K=R^{-1}B^TP$. Med $B=[0;b]$ er det bare andre rad av $P$ som trengs: $K=\\tfrac{b}{r}[p_{21}\\;p_{22}]$.',
      'Oppgitt bare noe av $P$: sett inn i Riccati $A^TP+PA+Q-PBR^{-1}B^TP=0$ element for element og løs for resten (velg positiv definitt løsning).',
      'Verifisere en gitt $P$: sett inn i Riccati og sjekk ≈ 0.',
      '**Tuning:** større $Q_{ii}$ ⇒ tilstand $i$ straffes mer ⇒ raskere regulering av den. Større $R$ ⇒ mindre pådrag, roligere og tregere.',
      '**Brysons regel:** $Q_{ii}=1/x_{i,\\max}^2$, $R_{jj}=1/u_{j,\\max}^2$. Garanterer *ikke* $|u|\\le u_{\\max}$ – det er bare en startverdi for tuning.',
      'LQR med $Q>0$ og $(A,B)$ stabiliserbar ⇒ lukket sløyfe alltid asymptotisk stabil.',
    ],
    onSheet: 'Ja – $J$, Riccati og $u=-R^{-1}B^TPx$. Bryson står ikke.',
    occ: ['2024:11ab', '2023:8b', '2021-kont:1f', '2021-kont:5c', '2017-kont:2a', '2013:2c', '2010:5', '2009:2b', '2008:4'],
  },
  {
    id: 'lab',
    tier: 1,
    title: 'Helikopterlab-spørsmål',
    task: 'Forklar hva du observerte i laben: PD/LQR, integralvirkning, IMU, Luenberger vs. Kalman, $Q_d$-tuning, ulineariteter.',
    tags: ['12–16 %', 'tekst', 'nesten hvert år'],
    why: 'Egen oppgave på 12–16 % i 2022, 2023, kont 2024 og kont 2025. Spørsmålene går igjen nesten ordrett.',
    method: [
      '**Poler langt til venstre (PD, lab 1):** modellen sier raskere, men i praksis: metning av motorene, umodellert dynamikk (motor, forsinkelse), støy forsterkes, oscillasjon/ustabilitet.',
      '**Integralvirkning (lab 2):** fjerner stasjonært avvik fra konstante forstyrrelser og modellfeil (f.eks. feil likevektspådrag). Ulemper: tregere, mer oversving, integrator-windup. Tunes via vekten på integraltilstandene i $Q$.',
      '**Hvorfor estimator med IMU (lab 3):** IMU måler vinkelhastigheter (gyro) og akselerasjon – ikke alle tilstander direkte, og målingene er støyfylte med bias. Estimatoren rekonstruerer tilstandene og filtrerer støy.',
      '**Luenberger vs. Kalman:** Luenberger – poler velges for hånd, ingen eksplisitt støymodell, tuning via polplassering. Kalman – gain beregnes optimalt fra $Q_d,R_d$, tidsvarierende gain, gir kovarians $P$ (usikkerhet), tuning via støykovarianser som kan måles (R) og justeres (Q). Begge kan brukes i kontinuerlig og diskret tid.',
      '**$Q_d$ diagonal:** større element ⇒ mindre tillit til modellen for den tilstanden ⇒ estimatet følger målingene mer (raskere, mer støy).',
      '**Ulinearitet:** linearisert rundt likevekt – store vinkler, $\\sin/\\cos$-ledd, motor-/thrust-ulinearitet, kobling mellom akser ⇒ dårligere ytelse langt fra likevekt.',
      '**Encoder-feil:** kvantisering (uniform fordeling, varians $\\Delta^2/12$), evt. offset ved oppstart – ikke perfekt.',
    ],
    onSheet: 'Nei.',
    occ: ['2025-kont:9', '2024-kont:5', '2023:11', '2022:5'],
  },

  // ───────────────────────── NIVÅ 2 ─────────────────────────
  {
    id: 'integral',
    tier: 2,
    title: 'Integralvirkning og stasjonært avvik',
    task: 'Konstant forstyrrelse gir stasjonært avvik – sett opp utvidet system med integraltilstand og vis at avviket forsvinner.',
    tags: ['20 %-oppgave', 'oppsett'],
    why: 'Del b) i 2024 opg. 9, c–d) i kont 2024 opg. 3, steady-state-analysen i 2024 opg. 11 og kont 2021 opg. 5 – pluss lab-spørsmål.',
    method: [
      'Ny tilstand $\\dot z=r-y$ (eller $y-r$). Utvidet system: $\\begin{bmatrix}\\dot x\\\\\\dot z\\end{bmatrix}=\\begin{bmatrix}A&0\\\\-C&0\\end{bmatrix}\\begin{bmatrix}x\\\\z\\end{bmatrix}+\\begin{bmatrix}B\\\\0\\end{bmatrix}u+\\begin{bmatrix}0\\\\1\\end{bmatrix}r$.',
      'Regulator $u=-K_xx-K_zz$ (velg fortegn konsistent). Stasjonært: $\\dot z=0$ ⇒ $y=r$ uansett konstant forstyrrelse – så lenge lukket sløyfe er stabil.',
      'Stasjonært avvik uten integralvirkning: sett $\\dot x=0$ med $d=d_0$ og løs for $x_\\infty$ – avviket er proporsjonalt med $d_0$.',
      'Alternativ (kont 2024 d): estimer forstyrrelsen med en observer/Kalman (utvidet modell) og kompenser i foroverkoblingen.',
    ],
    occ: ['2024:9b', '2024:11cd', '2024-kont:3cd', '2021-kont:5b', '2022:5b|lab', '2023:11a|lab'],
  },
  {
    id: 'realisering',
    tier: 2,
    title: 'Realisering: styrbar kanonisk form og minimal realisering',
    task: 'Finn en (minimal) tilstandsromrealisering av $G(s)$ / hvilken kanonisk form er dette?',
    tags: ['regning', 'formel på arket'],
    why: 'Kommer på 15 eksamener totalt. Nyere: 2021, 2022, 2023 (gjenkjenne form), kont 2021, kont 2025.',
    method: [
      'Skriv $G(s)=G(\\infty)+G_{sp}(s)$ ($D=G(\\infty)$, polynomdivisjon hvis teller har samme grad som nevner).',
      'Nevner $d(s)=s^r+\\alpha_1s^{r-1}+\\dots+\\alpha_r$ (monisk!). Teller $N_1s^{r-1}+\\dots+N_r$.',
      'SISO styrbar kanonisk: $A=\\begin{bmatrix}-\\alpha_1&-\\alpha_2&\\cdots\\\\1&0&\\cdots\\\\0&1&\\cdots\\end{bmatrix}$, $B=[1;0;\\dots]$, $C=[N_1\\;N_2\\;\\dots]$ – formelen står på arket.',
      'Minimal ⇔ styrbar og observerbar ⇔ dimensjonen = grad av $G(s)$ etter forkorting. Forkort felles faktorer først!',
      'Tilstandsrom med flere tilstander enn den minimale realiseringen (kont 2021 d): de «ekstra» modusene er ikke-styrbare eller ikke-observerbare.',
    ],
    onSheet: 'Ja – den generelle formelen for styrbar kanonisk form står på arket.',
    occ: [
      '2025-kont:8c', '2023:8d', '2022:2c', '2021:1c', '2021-kont:4d', '2019-kont:3b', '2017:2', '2017-kont:1',
      '2016:2', '2014:3a', '2012:3ab', '2010:2', '2009:4bc', '2008:2abd', '2003:3',
    ],
  },
  {
    id: 'transfer',
    tier: 2,
    title: 'Transferfunksjon fra tilstandsrom',
    task: 'Finn $G(s)=C(sI-A)^{-1}B+D$ (ofte som del av BIBO/ekvivalens).',
    tags: ['regning', 'formel på arket'],
    why: 'Egen deloppgave i 2021, 2022 og kont 2025, men trengs i tillegg i alle BIBO- og ekvivalensoppgaver.',
    method: [
      '2×2: $(sI-A)^{-1}=\\dfrac{1}{\\det(sI-A)}\\begin{bmatrix}s-a_{22}&a_{12}\\\\a_{21}&s-a_{11}\\end{bmatrix}$.',
      'Med $C=[1\\;0]$ og $B=[1;0]$ trenger du bare element (1,1): $\\dfrac{s-a_{22}}{\\det(sI-A)}$.',
      'Uobserverbar/ustyrbar del (2021 e): de modusene forkortes bort – du kan droppe dem før du regner.',
      'Lukket sløyfe med PI: $G_{cl}=\\dfrac{K(s)G(s)}{1+K(s)G(s)}$.',
    ],
    onSheet: 'Ja – $G(s)=C(sI-A)^{-1}B+D$.',
    occ: ['2025-kont:8a', '2022:1b', '2021:1b', '2018:4a', '2009:4a'],
  },
  {
    id: 'middel-varians',
    tier: 2,
    title: 'Forventning og varians gjennom et system med hvit støy',
    task: 'Vis at $\\dot m_x=a\\,m_x$ og $\\dot C_x=2aC_x+q$ / regn middel og varians av $x[2]$.',
    tags: ['utledning', 'ordinær eksamen 2021 og 2024'],
    why: 'Del c–d) i 2021 opg. 4 og 2024 opg. 9 er nesten identiske. Diskret variant i kont 2019.',
    method: [
      'Kontinuerlig: $\\dot x=ax+w$, $E[w(t)w(\\tau)]=q\\delta(t-\\tau)$.',
      'Middelverdi: ta forventning ⇒ $\\dot m_x=a\\,m_x$ ⇒ $m_x(t)=e^{at}m_x(0)$.',
      'Varians: $x(t)=e^{at}x(0)+\\int_0^te^{a(t-\\tau)}w(\\tau)d\\tau$. Deriver $C_x=E[(x-m)^2]$ ⇒ $\\dot C_x=2aC_x+q$.',
      'Delta-trikset: $\\int_0^t\\delta(t-\\tau)d\\tau=\\tfrac12$ (impulsen ligger på integrasjonsgrensen) – det er her $\\tfrac12$ kommer fra.',
      'Med forsterkning: $\\dot x=ax+bw$ ⇒ $\\dot C_x=2aC_x+b^2q$. Generelt $\\dot P=AP+PA^T+GQG^T$.',
      'Diskret: $m[k+1]=am[k]$, $P[k+1]=a^2P[k]+Q$.',
    ],
    onSheet: 'Nei (bare Kalman-versjonen med $-PC^TR^{-1}CP$-leddet).',
    occ: ['2024:9cd', '2021:4cd', '2019-kont:6a', '2015:5c', '2013:3c', '2004:4b'],
  },
  {
    id: 'bevis',
    tier: 2,
    title: 'Korte bevis: dualitet, PBH, gramian, linearitet',
    task: 'Vis at dualt system er observerbart ⇔ originalt styrbart / PBH-testen / $W_o$ inverterbar ⇒ $x(0)$ kan finnes.',
    tags: ['bevis', '8–15 %', 'ett per eksamen 2021–2023'],
    why: 'Hver ordinære eksamen 2021–2023 hadde ett kort bevis (8–15 %). De er korte når du har sett dem én gang.',
    method: [
      '**Dualitet (2023):** $\\mathcal O_{\\text{dual}}=[B^T;B^TA^T;\\dots]=\\mathcal C^T$, og $\\text{rank}(M^T)=\\text{rank}(M)$. Ferdig.',
      '**PBH (2022):** anta $A^Tv=\\lambda v$ og $B^Tv=0$. Da $B^T(A^T)^kv=\\lambda^kB^Tv=0$ for alle $k$ ⇒ $\\mathcal C^Tv=0$ ⇒ $\\mathcal C$ ikke full rang. Motsigelse.',
      '**Observerbarhetsgramian (2021):** $y=Ce^{At}x_0$. Multipliser med $e^{A^Tt}C^T$ og integrer: $\\int_0^{t_1}e^{A^T\\tau}C^Ty\\,d\\tau=W_o(t_1)x_0$ ⇒ $x_0=W_o^{-1}(\\ldots)$.',
      '**$W_o$ inverterbar for alle $t>0$** ⇔ systemet er observerbart (2022 f).',
      '**Linearitet:** additivitet $G(u_1+u_2)=G(u_1)+G(u_2)$ og homogenitet $G(\\alpha u)=\\alpha G(u)$. $F(G(x))$ lineær, $F(x)G(x)$ ikke.',
      '**Separasjonsprinsippet:** med $e=x-\\hat x$ blir lukket sløyfe blokktriangulær $\\begin{bmatrix}A-BK&BK\\\\0&A-LC\\end{bmatrix}$ ⇒ egenverdiene er de til $A-BK$ og $A-LC$ hver for seg.',
    ],
    occ: ['2023:10', '2022:4b', '2022:1f', '2021:5a', '2021-kont:2', '2021-kont:1e', '2019-kont:5', '2009:1a'],
  },
  {
    id: 'observer',
    tier: 2,
    title: 'Luenberger-observer og estimeringsfeil',
    task: 'Sett opp observeren, feildynamikken, og finn $L$ som gir gitte poler for $A-LC$.',
    tags: ['regning', 'ikke på arket'],
    why: 'Fast innslag frem til 2021 (13 eksamener). Nyere eksamener spør heller om Luenberger vs. Kalman, men oppsettet trengs.',
    method: [
      '$\\dot{\\hat x}=A\\hat x+Bu+L(y-C\\hat x)$. Feil $e=x-\\hat x$: $\\dot e=(A-LC)e$.',
      'Polplassering: $\\det(sI-(A-LC))$ = ønsket polynom, løs for $L=[l_1;l_2]$. (Dual av $K$-design: $L^T$ for $(A^T,C^T)$.)',
      'Mulig ⇔ $(A,C)$ observerbar. Tommelfinger: observerpoler 2–6 ganger raskere enn reguleringspolene.',
      'For raske poler ⇒ stor $L$ ⇒ forsterker målestøy (2003 opg. 4: transferfunksjon fra målestøy til estimat).',
    ],
    occ: [
      '2021:3d', '2021-kont:1cd', '2020:11ab', '2019:5c', '2018:1', '2017-kont:3d', '2016:1c', '2015:4b', '2012:4',
      '2011:3b', '2004:3b', '2003:4',
    ],
  },
  {
    id: 'diskretisering',
    tier: 2,
    title: 'Eksakt diskretisering (ZOH), Euler og Van Loan',
    task: 'Vis at $x[k+1]=e^{aT}x[k]+\\frac{b}{a}(e^{aT}-1)u[k]$ / hva skjer med stabiliteten for stor $T$?',
    tags: ['regning', 'ikke på arket'],
    why: 'Del a) i 2023 opg. 9, kont 2021 opg. 3, 2020 opg. 12.',
    method: [
      '$A_d=e^{AT}$, $B_d=\\int_0^Te^{A\\tau}d\\tau\\,B$. Hvis $A$ inverterbar: $B_d=A^{-1}(e^{AT}-I)B$.',
      'Skalar $\\dot x=ax+bu$: $A_d=e^{aT}$, $B_d=\\frac ba(e^{aT}-1)$. Eks: $a=-0.1,b=1$ ⇒ $B_d=10(1-e^{-0.1T})$.',
      'Eksakt diskretisering bevarer stabilitet for alle $T$: $|e^{\\lambda T}|<1$ ⇔ $\\text{Re}\\lambda<0$.',
      'Euler: $A_d=I+AT$ ⇒ ustabil for stor $T$ selv om kontinuerlig er stabil (egenverdi $1+\\lambda T$ utenfor enhetssirkelen).',
      'Van Loan (støykovarians $Q_d$): sett opp $\\begin{bmatrix}-A&GQG^T\\\\0&A^T\\end{bmatrix}T$, ta matriseeksponential. Hvorfor gir én kontinuerlig støy kovarians i flere tilstander? Fordi den integreres gjennom dynamikken i løpet av samplingsintervallet.',
    ],
    occ: ['2023:9a', '2021-kont:3ab', '2020:12b', '2012:2', '2004:1b'],
  },
  {
    id: 'pi-regulator',
    tier: 2,
    title: 'PI/PID-regulator på tilstandsromform',
    task: 'Cruise control $m\\dot v+dv=u$ med PI: lukket-sløyfe transferfunksjon, tilstandsrom, plassér polene i $-\\omega_b$.',
    tags: ['20 %-oppgave', 'kont 2025 = 2018'],
    why: 'Kont 2025 opg. 8 er ordrett lik 2018 opg. 4. PID-realisering også i 2016 og 2014.',
    method: [
      'PI: $K(s)=K_P+\\frac{K_I}{s}$ ⇒ én tilstand (integratoren), egenverdi i 0.',
      'Tilstander $x=[v;\\;z]$ med $\\dot z=r-v$: $u=K_P(r-v)+K_Iz$.',
      '$\\dot v=\\frac1m(-dv+K_P(r-v)+K_Iz)$, $\\dot z=r-v$ ⇒ $A=\\begin{bmatrix}-\\frac{d+K_P}{m}&\\frac{K_I}{m}\\\\-1&0\\end{bmatrix}$.',
      'Karakteristisk polynom $s^2+\\frac{d+K_P}{m}s+\\frac{K_I}{m}=(s+\\omega_b)^2$ ⇒ $K_P=2m\\omega_b-d$, $K_I=m\\omega_b^2$.',
      'Ren PID ($K_Ds$) er ikke propper ⇒ kan ikke realiseres. Med filter $\\frac{K_Ds}{\\tau s+1}$ går det.',
    ],
    occ: ['2025-kont:8', '2018:4', '2019-kont:3b', '2016:2', '2014:2'],
  },
  {
    id: 'stabiliserbar',
    tier: 2,
    title: 'Stabiliserbarhet og parameteravhengig regulator',
    task: 'Finnes det en stabiliserende $K$ for alle verdier av α? Finn $K=[f(\\alpha)\\;1]$ som stabiliserer for alle α.',
    tags: ['regning'],
    why: '2023 opg. 8 a og c, kont 2017.',
    method: [
      'Stabiliserbar ⇔ alle ustyrbare moduser er stabile. Sjekk $\\det\\mathcal C$ som funksjon av parameteren; der den er 0, finn den ustyrbare egenverdien.',
      'PBH-variant: $\\text{rank}[A-\\lambda I\\;\\;B]=n$ for alle $\\lambda$ med $\\text{Re}\\lambda\\ge0$.',
      'Parameteravhengig $K$: regn karakteristisk polynom for $A-BK$, krev positive koeffisienter (2. orden: $\\text{tr}<0$ og $\\det>0$).',
      'Detekterbarhet er det duale: alle uobserverbare moduser stabile.',
    ],
    occ: ['2023:8ac', '2017-kont:3d', '2011:2d'],
  },
  {
    id: 'kalman-kont',
    tier: 2,
    title: 'Kontinuerlig Kalmanfilter – skalar Riccati og stasjonær P',
    task: 'Vis at $\\dot P=-4P-\\tfrac12P^2+4$ og finn stasjonær $P$.',
    tags: ['regning', 'formel på arket'],
    why: 'Kont 2024 opg. 4 (nesten identisk med 2014 opg. 5 og 2009 opg. 3).',
    method: [
      '$\\dot P=AP+PA^T+GQG^T-PC^TR^{-1}CP$. Skalar: $\\dot P=2aP+g^2q-\\frac{c^2}{r}P^2$.',
      'Stasjonær: sett $\\dot P=0$, løs andregradsligningen, velg **positiv** rot.',
      'Gain $L=PC^TR^{-1}$.',
    ],
    onSheet: 'Ja – kontinuerlig Kalman-Riccati og «sett $\\dot P=0$» står på arket.',
    occ: ['2024-kont:4de', '2014:5d', '2009:3bc', '2003:5a'],
  },
  {
    id: 'maalestoy-figur',
    tier: 2,
    title: 'Vurdere støyantakelser fra en figur',
    task: 'Histogram og autokorrelasjon av målefeil: er støyen hvit, Gaussisk, null middelverdi, med riktig $R$?',
    tags: ['tekst', 'figur'],
    why: '2022 opg. 3e og 2023 opg. 9c – samme type figur begge år.',
    method: [
      '**Null middelverdi:** histogrammet sentrert i 0.',
      '**Gaussisk:** klokkeformet histogram.',
      '**Hvit:** autokorrelasjonen er (nesten) null for alle lag ≠ 0 – bare en topp i 0.',
      '**Varians:** autokorrelasjonen ved lag 0 er variansen direkte – sammenlign med antatt $R$.',
      'Tydelig korrelasjon ved lag ≠ 0 ⇒ farget støy ⇒ må modelleres som en tilstand (se «Utvidet tilstandsrom»).',
    ],
    occ: ['2023:9c', '2022:3e', '2024-kont:5b', '2011:4ab'],
  },

  // ───────────────────────── NIVÅ 3 ─────────────────────────
  {
    id: 'lyapunov',
    tier: 3,
    title: 'Lyapunov-ligningen',
    task: 'Løs $A^TM+MA=-N$ (ofte $N=I$) og avgjør stabilitet ut fra om $M>0$.',
    tags: ['regning', 'formel på arket'],
    why: 'Fast frem til 2016; sist i 2021 opg. 3c.',
    method: [
      'Sett $M=\\begin{bmatrix}m_1&m_2\\\\m_2&m_3\\end{bmatrix}$ (symmetrisk), multipliser ut, få 3 lineære ligninger.',
      'Asymptotisk stabil ⇔ unik løsning $M$ positiv definitt: $m_1>0$ og $\\det M>0$.',
    ],
    onSheet: 'Ja – selve ligningen. Kriteriet ($M>0$) må du kunne.',
    occ: ['2021:3c', '2016:1b', '2015:3', '2014:1d', '2012:5', '2008:3d', '2003:2e'],
  },
  {
    id: 'diskret-styring',
    tier: 3,
    title: 'Diskret tid: inputsekvens og antall steg',
    task: 'Finn $u[0],u[1]$ som tar $x[0]$ til ønsket $x[2]$ / hvor mange steg trengs for å bestemme $x[0]$?',
    tags: ['kort', 'formel på arket'],
    why: '2024 opg. 8 og 2020 opg. 10a.',
    method: [
      '$x[2]=A^2x[0]+ABu[0]+Bu[1]$ ⇒ $[AB\\;\\;B]\\begin{bmatrix}u[0]\\\\u[1]\\end{bmatrix}=x[2]-A^2x[0]$. Løs 2×2-systemet.',
      'Observerbarhet i diskret tid: $n$ målinger (steg) er nok til å bestemme $x[0]$ når $\\mathcal O$ har full rang.',
    ],
    onSheet: 'Ja – $x[k]=A^kx[0]+\\sum A^{k-1-m}Bu[m]$.',
    occ: ['2024:8', '2020:10a'],
  },
  {
    id: 'linearisering',
    tier: 3,
    title: 'Modellering og linearisering',
    task: 'Sett opp tilstandsrommodell fra fysikk / linearisér rundt likevekt.',
    tags: ['oppsett'],
    why: 'Kont 2021 (ACC), 2020 (magnet), 2017, 2018 (tanker), 2019.',
    method: [
      'Likevekt: sett $\\dot x=0$, løs for $x^*,u^*$.',
      'Jacobi: $A=\\partial f/\\partial x$, $B=\\partial f/\\partial u$ i $(x^*,u^*)$. Nye variabler $\\delta x=x-x^*$.',
      'Tolk resultatet: lineær modell gjelder bare nær likevekten.',
    ],
    occ: ['2021-kont:4a', '2020:12a', '2019:4', '2019:5a', '2018:5', '2017:1', '2017:4'],
  },
  {
    id: 'responser',
    tier: 3,
    title: 'Tidsrespons fra løsningsformelen',
    task: 'Finn $y(t)$ for sprang/initialverdi, impulsrespons.',
    tags: ['regning', 'formel på arket'],
    why: 'Eldre eksamener (2013–2019).',
    method: [
      '$x(t)=e^{at}x(0)+\\int_0^te^{a(t-\\tau)}bu(\\tau)d\\tau$. Sprang: $\\frac ba(e^{at}-1)$.',
      'Impulsrespons: $g(t)=Ce^{At}B+D\\delta(t)$.',
    ],
    occ: ['2019-kont:3a', '2014:4', '2014:3b', '2013:2a'],
  },
  {
    id: 'sammenkobling',
    tier: 3,
    title: 'Sammenkobling av systemer (serie, parallell, tilbakekobling)',
    task: 'Finn $(A\',B\',C\',D\')$ for koblede systemer / legg til aktuator-dynamikk.',
    tags: ['oppsett'],
    why: '2019 opg. 1, 2020 opg. 12c.',
    method: [
      'Stable tilstandene $[x_1;x_2]$, skriv ut hver ligning med koblingene ($u_2=y_1$ for serie osv.), les av blokkmatrisene.',
    ],
    occ: ['2019:1', '2020:12c'],
  },

  // ───────────────────────── NIVÅ 4 ─────────────────────────
  {
    id: 'kalman-dekomp',
    tier: 4,
    title: 'Kalmans kanoniske dekomposisjon',
    task: 'Finn $T$ som splitter systemet i styrbar og ustyrbar del.',
    tags: ['tekst'],
    why: 'Kont 2021 opg. 4e og 2011.',
    method: [
      'Velg de første kolonnene i $T$ som lineært uavhengige kolonner fra $\\mathcal C$, fyll ut med vilkårlige vektorer til $T$ er inverterbar.',
    ],
    occ: ['2021-kont:4e', '2011:1b'],
  },
  {
    id: 'ekf',
    tier: 4,
    title: 'Extended Kalman Filter',
    task: 'Sett opp EKF for en ulineær modell.',
    tags: ['pensum uke 45', 'sjelden'],
    why: 'Pensum (uke 45), men ikke gitt som regneoppgave siden 2012.',
    method: [
      'Prediker med den ulineære modellen: $\\hat x^-[k+1]=f(\\hat x[k],u[k])$.',
      'Lineariser rundt estimatet: $A_k=\\partial f/\\partial x|_{\\hat x[k]}$, $C_k=\\partial h/\\partial x|_{\\hat x^-[k]}$, og bruk dem i $P$- og $L$-ligningene.',
      'Innovasjonen bruker $h(\\hat x^-)$, ikke $C\\hat x^-$.',
    ],
    occ: ['2012:7b'],
  },
  {
    id: 'estimator-utledning',
    tier: 4,
    title: 'Utledninger: rekursiv minste kvadrat, dekorrelering av støy',
    task: 'Utled optimal $K$ i $\\hat x=m+K(y-Cm)$ / skriv korrelert $Gw$ som $\\tilde G\\tilde w$ med uavhengige komponenter.',
    tags: ['utledning'],
    why: 'Kont 2017, 2014 og 2020 opg. 10b.',
    method: [
      'Dekorrelering: faktoriser $Q=SS^T$ (Cholesky eller egenverdier) ⇒ $w=S\\tilde w$ med $E[\\tilde w\\tilde w^T]=I$, $\\tilde G=GS$.',
      'Rekursivt gjennomsnitt: $\\hat x_{k+1}=\\hat x_k+\\frac1{k+2}(z_{k+1}-\\hat x_k)$, $P_k=R/(k+1)$.',
    ],
    occ: ['2020:10b', '2017-kont:4', '2014:6'],
  },
]

// ── Hjelpefunksjoner ──
export interface Occ {
  exam: string
  num: number
  parts: string
  note?: string
}

export function parseOcc(s: string): Occ {
  const [ref, note] = s.split('|')
  const [exam, rest] = ref.split(':')
  const m = rest.match(/^(\d+)([a-z]*)$/)!
  return { exam, num: Number(m[1]), parts: m[2], note }
}

export function examLabel(id: string) {
  return id.endsWith('-kont') ? `Kont ${id.slice(0, 4)}` : `Eksamen ${id}`
}

export function examShort(id: string) {
  return id.endsWith('-kont') ? `kont ${id.slice(0, 4)}` : id
}

/** Antall ulike eksamener der typen er gitt. */
export function versions(t: Topic) {
  return new Set(t.occ.map((o) => parseOcc(o).exam)).size
}

export function recentCount(t: Topic) {
  return new Set(t.occ.map((o) => parseOcc(o).exam).filter((e) => Number(e.slice(0, 4)) >= 2021)).size
}

export function lastSeen(t: Topic) {
  const ex = t.occ.map((o) => parseOcc(o).exam)
  return ex.sort((a, b) => examSortKey(b) - examSortKey(a))[0]
}

export function examSortKey(id: string) {
  // kont (august) kommer før ordinær (desember) samme år
  return Number(id.slice(0, 4)) * 10 + (id.endsWith('-kont') ? 0 : 5)
}

/** Alle oppgavetyper som har en gitt eksamensoppgave. */
export function topicsFor(exam: string, num: number) {
  return topics.filter((t) => t.occ.some((o) => {
    const p = parseOcc(o)
    return p.exam === exam && p.num === num
  }))
}

export const recentExams = ['2025-kont', '2024', '2024-kont', '2023', '2022', '2021', '2021-kont']
