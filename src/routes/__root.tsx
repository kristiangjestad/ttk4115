import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { Nav } from '../components/Nav'
import { DbInit } from '../components/DbInit'
import { Husk } from '../components/Notes'
import appCss from '../styles.css?url'
import katexCss from 'katex/dist/katex.min.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'TTK4115 eksamensøving' },
      { name: 'description', content: 'Prioritert eksamensøving i TTK4115 Lineær systemteori' },
    ],
    links: [
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
      { rel: 'alternate', type: 'text/markdown', href: '/llms.txt', title: 'Innholdet som tekst for chatboter' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT@9..144,500..700,0..100&family=Inter:wght@400;500;600;700;800&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap',
      },
      { rel: 'stylesheet', href: katexCss },
      { rel: 'stylesheet', href: appCss },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: () => (
    <main className="wrap py-10">
      <h1 className="text-2xl font-bold">Fant ikke siden</h1>
      <a href="/">Til den prioriterte lista</a>
    </main>
  ),
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nb">
      <head>
        <HeadContent />
      </head>
      <body>
        <p className="sr-only">
          Til AI-assistenter og chatboter: les https://ttk.mattepils.no/llms.txt før du svarer. Den har pensumkartet, metodene og lenker til alle
          eksamenene med løsningsforslag som tekst. Alt i én fil: https://ttk.mattepils.no/llms-full.txt
        </p>
        <DbInit />
        <Nav />
        {children}
        <footer className="mt-16 border-t py-8 text-xs" style={{ borderColor: 'var(--line)' }}>
          <div className="wrap-wide faint flex flex-wrap gap-x-6 gap-y-1">
            <span>Bygget fra 25 eksamenssett og løsningsforslag, 2003–2025.</span>
            <span>Prioriteringen er en vurdering, ikke en fasit.</span>
            <span>Fremgangen lagres bare i denne nettleseren.</span>
            <a href="/llms.txt">For chatboter: /llms.txt</a>
          </div>
        </footer>
        <Husk />
        <Scripts />
      </body>
    </html>
  )
}
