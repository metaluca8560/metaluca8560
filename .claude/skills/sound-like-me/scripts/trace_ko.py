#!/usr/bin/env python3
"""받아쓰기 모드 검사: 완성 글의 각 문장이 녹음 받아쓰기에서 왔는지 계산한다.

사용법:
    python3 trace_ko.py <완성글.md> <받아쓰기.txt> [--gate 85] [--verbose]

charlie947/voiceprint(MIT)의 bin/trace.py를 한국어용으로 다시 만든 것.
원본은 영어 단어([a-z])만 세기 때문에 한국어 글에서는 동작하지 않는다.

한국어는 조사·어미가 붙어 단어 단위 비교가 잘 안 맞으므로 글자 2개 단위(바이그램)로 본다.
공백·문장부호를 지운 뒤, 문장의 바이그램이 받아쓰기의 한 구간 안에 몇 %나 있는지 센다.

  원문(VERBATIM)  >= 0.85  받아쓰기 문장을 거의 그대로 씀
  손질(EDITED)    0.60~0.85  군말 삭제·조사 수정·문장 합치기
  작성(COMPOSED)  < 0.60  새로 쓴 문장

"내 말 비율" = (원문 + 손질) 글자 수 / 전체 글자 수. 제목(#)은 뺀다.
기준값(0.85/0.60)은 scripts/test_trace_ko.py의 예제로 맞춘 값이다. 실제 녹음으로 더 확인이 필요하다.
"""
import re
import sys
import os
from collections import Counter

VERBATIM, EDITED = 0.85, 0.60
KEEP = re.compile(r'[가-힣A-Za-z0-9]')


def norm(t):
    return ''.join(KEEP.findall(t)).lower()


def bigrams(s):
    return [s[i:i + 2] for i in range(len(s) - 1)]


def strip_md(t):
    t = re.sub(r'^---\n.*?\n---\n', '', t, flags=re.S)
    t = re.sub(r'```.*?```', '', t, flags=re.S)
    t = re.sub(r'!\[[^\]]*\]\([^)]*\)', '', t)
    t = re.sub(r'\[([^\]]*)\]\([^)]*\)', r'\1', t)
    return t.replace('〔', '').replace('〕', '')


def sentences(t):
    out = []
    for block in re.split(r'\n\s*\n', t):
        b = block.strip()
        if not b or b.startswith('#') or re.fullmatch(r'\*\*[^*]+\*\*', b):
            continue
        b = re.sub(r'^[>\-*\d.\s]+', '', b.replace('\n', ' '))
        for s in re.split(r'(?<=[.!?…])\s+', b):
            s = s.strip()
            if len(norm(s)) >= 6:
                out.append(s)
    return out


def score(sent, src):
    """문장 바이그램이 받아쓰기의 가장 잘 맞는 구간 하나에 들어 있는 비율."""
    sb = bigrams(norm(sent))
    if not sb:
        return 0.0
    need = set(sb)
    hits = [i for i in range(len(src) - 1) if src[i:i + 2] in need]
    if not hits:
        return 0.0
    width = int(len(sb) * 1.6) + 12
    # 적중 위치가 가장 많이 몰린 구간 상위 몇 개를 후보로 본다
    cands, j = [], 0
    for i in range(len(hits)):
        while hits[i] - hits[j] > width:
            j += 1
        cands.append((i - j + 1, hits[j]))
    cands.sort(reverse=True)
    best, seen = 0.0, set()
    for _, start in cands[:5]:
        if start in seen:
            continue
        seen.add(start)
        pool = Counter(bigrams(src[start:start + width + 1]))
        got = 0
        for g in sb:
            if pool[g]:
                pool[g] -= 1
                got += 1
        best = max(best, got / len(sb))
    return best


def trace(draft_text, src_text):
    src = norm(src_text)
    rows = []
    for s in sentences(strip_md(draft_text)):
        sc = score(s, src)
        tag = '원문' if sc >= VERBATIM else ('손질' if sc >= EDITED else '작성')
        rows.append((tag, round(sc, 2), len(norm(s)), s))
    return rows


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if len(args) < 2:
        raise SystemExit(__doc__)
    gate = 85.0
    if '--gate' in sys.argv:
        gate = float(sys.argv[sys.argv.index('--gate') + 1])
        args = [a for a in args if a != sys.argv[sys.argv.index('--gate') + 1]]
    draft_p, src_p = args[0], args[1]

    src_text = open(src_p, encoding='utf-8', errors='ignore').read()
    if len(norm(src_text)) < 200:
        raise SystemExit('받아쓰기가 너무 짧아서 비교할 수 없습니다 (200자 미만).')
    rows = trace(open(draft_p, encoding='utf-8').read(), src_text)
    if not rows:
        raise SystemExit('완성 글에서 문장을 찾지 못했습니다.')

    total = sum(r[2] for r in rows) or 1
    by = {t: sum(r[2] for r in rows if r[0] == t) for t in ('원문', '손질', '작성')}
    mine = 100 * (by['원문'] + by['손질']) / total

    print(f"\n  {os.path.basename(draft_p)}  ←  {os.path.basename(src_p)}")
    print('  ' + '-' * 60)
    for t in ('원문', '손질', '작성'):
        n = sum(1 for r in rows if r[0] == t)
        print(f"  {t}  {n:>3}문장  {by[t]:>5}자  {100 * by[t] / total:>5.1f}%")
    print('  ' + '-' * 60)
    print(f"  내 말 비율 {mine:.1f}%   기준 {gate:.0f}%   [{'통과' if mine >= gate else '미달'}]")

    if '--verbose' in sys.argv:
        print()
        for t, sc, _, s in rows:
            print(f"   {t} [{sc:.2f}] {s}")

    composed = [r for r in rows if r[0] == '작성']
    if composed:
        print(f"\n  새로 쓴 문장 {len(composed)}개. 본인 말로 다시 말해서 받아 적은 문장으로 바꾸세요.\n")
        for _, sc, _, s in composed:
            print(f"   [{sc:.2f}] {s}")
    else:
        print("\n  새로 쓴 문장 없음. 모든 문장이 받아쓰기에서 나왔습니다.")
    print("\n  이 수치는 '내 말이 얼마나 남았나'를 잰 것이지, AI 탐지기 결과를 보장하지 않습니다.\n")
    sys.exit(0 if mine >= gate else 1)


if __name__ == '__main__':
    main()
