"""Lager src/data/exams.json fra eksamens-PDFene: sideintervall per oppgave i eksamen og løsningsforslag."""
import subprocess, re, json, os, sys
SRC, OUT = sys.argv[1], sys.argv[2]
HDR = re.compile(r'^[ \t]*(Problem|Oppgave|Exercise)[ \t]+(\d+)[A-Z]?\b(?![ \t]*[a-z]\))', re.M)
NOISE = re.compile(r'(TTK4115.*|Page \d+ of \d+|Side \d+ av \d+|^\s*\d+\s*$)', re.M)
APPX = re.compile(r'Formula sheet|Vedlegg til eksamen|Appendix to the exam|Formelark', re.I)

def pages(pdf):
    n = int(re.search(r'Pages:\s+(\d+)', subprocess.run(['pdfinfo', pdf], capture_output=True, text=True).stdout).group(1))
    return [subprocess.run(['pdftotext', '-f', str(p), '-l', str(p), pdf, '-'], capture_output=True, text=True).stdout for p in range(1, n+1)]

def problems(pg):
    found, order = {}, []
    for i, t in enumerate(pg):
        for m in HDR.finditer(t):
            k = int(m.group(2))
            if m.group(1) == 'Exercise' and found: continue
            if k in found: continue
            before = NOISE.sub('', t[:m.start()]).strip()
            found[k] = (i + 1, m.start(), len(before) < 80)
            order.append(k)
    # siste side med innhold (før formelark/vedlegg)
    last = len(pg)
    for i in range(len(pg) - 1, 0, -1):
        if APPX.search(pg[i]) and (not order or i + 1 > found[order[-1]][0]):
            last = i  # siden før vedlegget (1-indeksert = i)
            if APPX.search(pg[i][:400]) is None and i + 1 > found[order[-1]][0]:
                last = i + 1
    res = []
    for j, k in enumerate(order):
        p, off, top = found[k]
        if j + 1 < len(order):
            np_, _, ntop = found[order[j + 1]]
            end = np_ - 1 if ntop else np_
        else:
            end = last
        end = max(p, end)
        text = pg[p - 1][off:]
        pct = re.search(r'\((\d+)\s*%\)', text[:60])
        res.append(dict(num=k, page=p, endPage=end, pct=int(pct.group(1)) if pct else None,
                        snippet=re.sub(r'\s+', ' ', text)[:220]))
    return res, len(pg)

data = []
for f in sorted(os.listdir(SRC)):
    m = re.match(r'Exam_\((\d{4})\)(_kont)?\.pdf$', f)
    if not m: continue
    year, kont = int(m.group(1)), bool(m.group(2))
    base = f[:-4]
    ep, en = problems(pages(os.path.join(SRC, f)))
    sol = os.path.join(SRC, base + '_solution.pdf')
    sp, sn = problems(pages(sol)) if os.path.exists(sol) else ([], 0)
    sd = {p['num']: p for p in sp}
    probs = []
    for p in ep:
        s = sd.get(p['num'])
        probs.append(dict(num=p['num'], page=p['page'], endPage=p['endPage'], pct=p['pct'], snippet=p['snippet'],
                          solPage=s['page'] if s else None, solEndPage=s['endPage'] if s else None))
    data.append(dict(id=f"{year}{'-kont' if kont else ''}", dir=base.replace('(', '').replace(')', ''),
                     solDir=(base + '_solution').replace('(', '').replace(')', '') if os.path.exists(sol) else None,
                     year=year, kont=kont, pages=en, solPages=sn, problems=probs))
json.dump(data, open(OUT, 'w'), ensure_ascii=False, indent=1)
for d in data:
    print(d['id'], [(p['num'], p['page'], p['endPage'], p['solPage'], p['solEndPage']) for p in d['problems']])
