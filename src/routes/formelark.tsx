import { createFileRoute } from '@tanstack/react-router'
import { Pages } from '../components/Pages'
import { Tex } from '../components/Tex'

export const Route = createFileRoute('/formelark')({
  head: () => ({ meta: [{ title: 'Formelark · TTK4115' }] }),
  component: Formelark,
})

const notOnSheet: string[] = [
  '**Stabilitet:** asymptotisk ⇔ alle $\\text{Re}\\,\\lambda<0$ (diskret: $|\\lambda|<1$). Marginal: egenverdier på aksen/enhetssirkelen er enkle. BIBO ⇔ polene i forkortet $G(s)$ i VHP.',
  '**Rangtest:** styrbar ⇔ $\\text{rank}\\,\\mathcal C=n$, observerbar ⇔ $\\text{rank}\\,\\mathcal O=n$. Minimal ⇔ begge.',
  '**$e^{At}$:** $\\mathcal L^{-1}\\{(sI-A)^{-1}\\}$, eller $\\beta_0I+\\beta_1A$ med $e^{\\lambda_it}=\\beta_0+\\beta_1\\lambda_i$.',
  '**Diagonalisering:** $AQ=Q\\Lambda$, $\\bar B=Q^{-1}B$, $\\bar C=CQ$. Kompleks $\\sigma\\pm j\\omega$ ⇒ modalform $\\begin{bmatrix}\\sigma&\\omega\\\\-\\omega&\\sigma\\end{bmatrix}$.',
  '**Diskretisering:** $A_d=e^{AT}$, $B_d=\\int_0^Te^{A\\tau}d\\tau\\,B$; skalar $B_d=\\frac ba(e^{aT}-1)$.',
  '**Referanse:** $K_r=[-C(A-BK)^{-1}B]^{-1}$; skalar $k_r=k-a/b$.',
  '**Integralvirkning:** $\\dot z=r-y$, utvid med $\\begin{bmatrix}A&0\\\\-C&0\\end{bmatrix}$.',
  '**Skalar LQR:** $k=\\big(a+\\sqrt{a^2+b^2q/r}\\big)/b$, lukket sløyfe $-\\sqrt{a^2+b^2q/r}$.',
  '**Bryson:** $Q_{ii}=1/x_{i,\\max}^2$, $R_{jj}=1/u_{j,\\max}^2$.',
  '**Middel og varians:** $\\dot m=Am$, $\\dot P=AP+PA^T+GQG^T$; skalar $\\dot C_x=2aC_x+b^2q$. $\\int_0^t\\delta(t-\\tau)d\\tau=\\tfrac12$.',
  '**Gauss–Markov:** $R(\\tau)=\\sigma^2e^{-\\beta|\\tau|}$ ⇔ $S(\\omega)=\\dfrac{2\\sigma^2\\beta}{\\omega^2+\\beta^2}$ ⇔ $H(s)=\\dfrac{\\sqrt{2\\sigma^2\\beta}}{s+\\beta}$.',
  '**Hvit støy:** $R(\\tau)=q\\delta(\\tau)$ ⇔ $S(\\omega)=q$.',
  '**Observer:** $\\dot{\\hat x}=A\\hat x+Bu+L(y-C\\hat x)$, $\\dot e=(A-LC)e$.',
  '**Ekvivalens:** algebraisk ⇒ samme egenverdier; nulltilstand ⇔ samme $G(s)$; dual: $(A^T,C^T,B^T)$.',
]

function Formelark() {
  return (
    <main className="wrap py-10">
      <div className="eyebrow mb-3">Vedlagt på eksamen</div>
        <h1 className="display mt-0 mb-3 text-[40px] sm:text-[52px]">Formelark</h1>
      <p>
        Dette arket ligger bakerst i alle eksamenene siden 2021 (her fra kont 2025). Lær deg hva som står der, så du vet hva du <em>ikke</em> trenger å
        pugge.
      </p>
      <div className="card mb-6 p-4">
        <h2 className="mt-0 mb-3 text-[17px] font-bold tracking-tight">Står IKKE på arket – må pugges</h2>
        <ul className="method m-0 grid gap-1.5 pl-5 text-sm">
          {notOnSheet.map((s, i) => (
            <Tex key={i} as="li">{s}</Tex>
          ))}
        </ul>
      </div>
      <Pages dir="Exam_2025_kont" from={12} to={15} alt="Formelark" />
    </main>
  )
}
