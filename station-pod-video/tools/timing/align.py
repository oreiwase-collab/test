"""台本の各文字をナレーションの時刻に対応づける。
ASR トークン時刻（sherpa-onnx ReazonSpeech）と、無音検出の発話開始時刻を組み合わせる。"""
import json, re, difflib, glob

exec(open('/home/user/test/station-pod-video/tools/timing/rows2.py').read())
toks = json.load(open('/home/user/asr/tokens.json'))
P1 = 129.250958

# 発話開始（silence_end）の一覧を絶対時刻で
onsets = []
for n, off in ((1, 0.0), (2, P1)):
    for line in open(f'/home/user/asr/sil{n}.txt'):
        m = re.search(r'silence_end: ([\d.]+)', line)
        if m: onsets.append(round(float(m.group(1)) + off, 3))
offsets = []  # 発話終了（silence_start）
for n, off in ((1, 0.0), (2, P1)):
    for line in open(f'/home/user/asr/sil{n}.txt'):
        m = re.search(r'silence_start: ([\d.]+)', line)
        if m and float(m.group(1)) > 0: offsets.append(round(float(m.group(1)) + off, 3))

PUNCT = re.compile(r'[、。「」！？!?\s・]')
def norm(s): return PUNCT.sub('', s)

# ASR 文字列と各文字の時刻
achars, atimes = [], []
for t in toks:
    txt = t['t'].strip()
    n = len(txt)
    for i, ch in enumerate(txt):
        achars.append(ch); atimes.append(t['s'] + (t['e'] - t['s']) * i / max(1, n))
A = ''.join(achars)

S = ''.join(norm(r[1]) for r in rows)
row_start_idx = []
k = 0
for r in rows:
    row_start_idx.append(k); k += len(norm(r[1]))

sm = difflib.SequenceMatcher(None, S, A, autojunk=False)
s2a = [None] * (len(S) + 1)
for tag, i1, i2, j1, j2 in sm.get_opcodes():
    for i in range(i1, i2):
        if tag == 'equal': s2a[i] = j1 + (i - i1)
        elif tag == 'replace': s2a[i] = j1 + int((i - i1) * (j2 - j1) / max(1, i2 - i1))
        else: s2a[i] = j1  # delete: 台本にありASRにない文字
s2a[len(S)] = len(A) - 1

def char_time(i):
    j = min(s2a[i], len(atimes) - 1)
    return atimes[j]

SIL = []
for n, off in ((1, 0.0), (2, P1)):
    cur = None
    for line in open(f'/home/user/asr/sil{n}.txt'):
        m = re.search(r'silence_(start|end): ([\d.]+)', line)
        v = float(m.group(2)) + off
        if m.group(1) == 'start': cur = v
        elif cur is not None: SIL.append((round(cur, 3), round(v, 3))); cur = None

def snap_onset(t):
    """ASR 時刻が無音区間の中にあれば、その無音明け（波形上の発話開始）に合わせる"""
    hits = [se for ss, se in SIL if ss - 0.05 <= t <= se]
    return max(hits) if hits else t

def find(row, phrase, nth=0):
    """行 row（0始まり）の中で phrase の最初の文字が話される時刻"""
    base = row_start_idx[row]
    txt = norm(rows[row][1])
    p = norm(phrase)
    idx = -1
    for _ in range(nth + 1):
        idx = txt.index(p, idx + 1)
    return char_time(base + idx)

if __name__ == '__main__':
    out = []
    for i, r in enumerate(rows):
        raw = char_time(row_start_idx[i])
        st = snap_onset(raw)
        out.append((i + 1, round(raw, 3), st, norm(r[1])[:14]))
    for o in out: print(o)
    json.dump({'onsets': onsets, 'offsets': offsets}, open('/home/user/asr/silence.json', 'w'))
