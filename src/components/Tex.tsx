import katex from 'katex'

function renderMath(src: string, display: boolean) {
  try {
    return katex.renderToString(src, { displayMode: display, throwOnError: false, strict: false })
  } catch {
    return src
  }
}

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** Gjør om tekst med $..$, $$..$$ og **fet** til HTML. */
export function texToHtml(text: string) {
  const math: string[] = []
  const withTokens = text.replace(/\$\$([^$]+)\$\$|\$([^$]+)\$/g, (_, d, i) => {
    math.push(d != null ? renderMath(d, true) : renderMath(i, false))
    return `\u0000${math.length - 1}\u0000`
  })
  return esc(withTokens)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\u0000(\d+)\u0000/g, (_, n) => math[Number(n)])
}

export function Tex({ children, as: As = 'span', className }: { children: string; as?: 'span' | 'p' | 'div' | 'li'; className?: string }) {
  return <As className={className} dangerouslySetInnerHTML={{ __html: texToHtml(children) }} />
}
