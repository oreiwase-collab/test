# Compares the MP4's audio against the two untouched narration files placed at their offsets.
import subprocess, wave, numpy as np, sys
U = sys.argv[1]; video = sys.argv[2]
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', video, '-ac', '1', '-ar', '24000', '-f', 's16le', '-'], capture_output=True).stdout
v = np.frombuffer(raw, dtype=np.int16).astype(float)
def load(p):
    w = wave.open(p); return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(float)
parts = [(load(f'{U}/narration-part1.wav'), 0), (load(f'{U}/narration-part2.wav'), round(3878 / 30 * 24000))]
for i, (a, off) in enumerate(parts):
    best = None
    for lag in range(-240, 241, 1):
        s = off + lag
        seg = v[max(0, s): s + len(a)]
        n = min(len(seg), len(a) - max(0, -s))
        if n <= 0: continue
        x = a[max(0, -s): max(0, -s) + n]; y = seg[:n]
        c = float(np.dot(x, y) / (np.linalg.norm(x) * np.linalg.norm(y) + 1e-9))
        if best is None or c > best[0]: best = (c, lag, n)
    c, lag, n = best
    print(f'part{i+1}: correlation {c:.4f}, offset error {lag / 24:.2f} ms, samples compared {n}/{len(a)}')
