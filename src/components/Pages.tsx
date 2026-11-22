import { pageUrl, range } from '../lib/exams'

export function Pages({ dir, from, to, alt }: { dir: string; from: number; to: number; alt: string }) {
  return (
    <div className="flex flex-col gap-3">
      {range(from, to).map((n) => (
        <img key={n} src={pageUrl(dir, n)} alt={`${alt}, side ${n}`} className="page-img" loading="lazy" />
      ))}
    </div>
  )
}
