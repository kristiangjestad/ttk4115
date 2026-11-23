// Egen serverinngang: chatboter som henter forsiden får llms.txt (markdown) i stedet for HTML-appen.
import { createServerEntry, createStartHandler, defaultStreamHandler } from '@tanstack/react-start/server'
import llms from '../public/llms.txt?raw'

const start = createStartHandler(defaultStreamHandler)

// Brukeragenter som chatboter og AI-søk bruker når de henter en lenke for en bruker.
const AI_AGENT =
  /ChatGPT-User|OAI-SearchBot|GPTBot|Claude-User|Claude-SearchBot|ClaudeBot|Claude-Web|anthropic-ai|Perplexity|Google-Extended|Gemini|GoogleAgent|Applebot-Extended|MistralAI|cohere-ai|YouBot|DuckAssistBot|meta-externalagent|Meta-ExternalFetcher|Bytespider|PhindBot|Kagi|CCBot|Amazonbot|NovaAct/i

function wantsMarkdown(req: Request) {
  const ua = req.headers.get('user-agent') ?? ''
  if (AI_AGENT.test(ua)) return true
  const accept = req.headers.get('accept') ?? ''
  // Klienter som eksplisitt ber om markdown/ren tekst og ikke HTML
  return /text\/(markdown|plain)/.test(accept) && !/text\/html/.test(accept)
}

export default createServerEntry({
  fetch(request) {
    const url = new URL(request.url)
    if (request.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.md') && wantsMarkdown(request)) {
      return new Response(llms, {
        headers: { 'content-type': 'text/markdown; charset=utf-8', vary: 'User-Agent, Accept', 'cache-control': 'no-store' },
      })
    }
    return start(request)
  },
})
